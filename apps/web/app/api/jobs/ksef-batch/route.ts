/**
 * KSeF batch job handler - processes pending invoice submissions
 * Called by Vercel Cron on schedule
 */

import { NextRequest, NextResponse } from 'next/server'
import https from 'https'
import crypto from 'crypto'
import { buildFaXml } from '../../../../../../lib/ksef/fa'
import { polishError } from '../../../../../../lib/ksef/errors'
import { createServerSupabase } from '@/lib/supabase/client'
import { withRateLimit } from '@/lib/api/rate-limit'

async function handler(request: NextRequest) {
  try {
    const certB64 = process.env.KSEF_CERT_B64 || ''
    const certPemB64 = process.env.KSEF_CERT_PEM_B64 || ''
    const keyPemB64 = process.env.KSEF_KEY_PEM_B64 || ''
    const ksefApiUrl = process.env.KSEF_API_URL || ''
    const ksefSendPath = process.env.KSEF_API_SEND_PATH || '/invoices'
    
    if ((!certB64 && (!certPemB64 || !keyPemB64)) || !ksefApiUrl) {
      return NextResponse.json({ ok: false, error: 'Missing KSeF configuration' }, { status: 500 })
    }

    const certSize = certB64 ? Buffer.from(certB64, 'base64').length : Buffer.from(certPemB64, 'base64').length

    // GET request returns status
    if (request.method === 'GET') {
      return NextResponse.json({
        ok: true,
        certSize,
        ksefReady: !!(certPemB64 && keyPemB64),
      })
    }

    // POST request processes batch
    if (request.method !== 'POST') {
      return NextResponse.json({ ok: false }, { status: 405 })
    }

    const supabase = createServerSupabase()
    const limit = Number(request.nextUrl.searchParams.get('limit') || 25)

    // Fetch pending submissions
    const { data: pending, error: pendingError } = await supabase
      .from('ksef_submissions')
      .select('id, invoice_id, status')
      .eq('status', 'DoWyslania')
      .limit(limit)

    if (pendingError || !pending) {
      return NextResponse.json({ ok: false, error: 'Failed to fetch pending submissions' }, { status: 502 })
    }

    let processed = 0
    let accepted = 0
    let failed = 0

    const certPem = certPemB64 ? Buffer.from(certPemB64, 'base64').toString('utf8') : ''
    const keyPem = keyPemB64 ? Buffer.from(keyPemB64, 'base64').toString('utf8') : ''
    const agent = certPem && keyPem
      ? new https.Agent({
          cert: certPem,
          key: keyPem,
          passphrase: process.env.KSEF_CERT_PASSWORD,
        })
      : undefined

    const sendInvoice = async (invoiceId: string) => {
      // Fetch invoice
      const { data: invRow, error: invError } = await supabase
        .from('invoices')
        .select('id, number, issue_date, total_gross, total_vat, currency, seller_nip, seller_name, seller_address, buyer_nip, buyer_name, buyer_address')
        .eq('id', invoiceId)
        .single()

      if (invError || !invRow) {
        throw new Error('Brak danych faktury')
      }

      // Fetch invoice items
      const { data: items, error: itemsError } = await supabase
        .from('invoice_items')
        .select('name, qty, unit_price, vat_rate, gtu_code')
        .eq('invoice_id', invoiceId)

      if (itemsError || !items) {
        throw new Error('Brak pozycji faktury')
      }

      const inv = {
        id: invRow.id,
        number: invRow.number,
        issue_date: invRow.issue_date,
        total_gross: Number(invRow.total_gross),
        total_vat: Number(invRow.total_vat),
        currency: invRow.currency,
        seller: {
          nip: invRow.seller_nip || '',
          name: invRow.seller_name || '',
          address: invRow.seller_address || '',
        },
        buyer: {
          nip: invRow.buyer_nip || '',
          name: invRow.buyer_name || '',
          address: invRow.buyer_address || '',
        },
        items: items.map((item) => ({
          name: item.name,
          qty: Number(item.qty),
          unit_price: Number(item.unit_price),
          vat_rate: Number(item.vat_rate),
          gtu_code: item.gtu_code || undefined,
        })),
      }

      const xml = buildFaXml(inv)
      const url = new URL(ksefSendPath, ksefApiUrl)
      const ksefResp = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/xml' },
        // @ts-ignore - https.Agent is valid for fetch in Node.js
        agent,
        body: xml,
      })

      if (!ksefResp.ok) {
        throw new Error(`KSeF ${ksefResp.status}`)
      }

      const data = await ksefResp.json()
      const ksefId = data.ksefId || data.id || `KSEF-${invoiceId}`
      return ksefId
    }

    // Process each pending submission
    for (const row of pending) {
      let ksefId = ''
      let errorMsg = ''
      let success = false
      let attempt = 0

      while (attempt < 3 && !success) {
        try {
          ksefId = await sendInvoice(row.invoice_id)
          success = true
        } catch (e: any) {
          const statusMatch = String(e?.message || '').match(/KSeF\s(\d+)/)
          const status = statusMatch ? Number(statusMatch[1]) : 0
          errorMsg = polishError(status, {})
          attempt++
          const backoff = Math.min(1000 * 2 ** attempt, 8000)
          await new Promise((r) => setTimeout(r, backoff))
        }
      }

      const idempotency_key = crypto.createHash('sha256').update(`${row.invoice_id}`).digest('hex')

      // Update submission status
      const { error: updateError } = await supabase
        .from('ksef_submissions')
        .update({
          status: success ? 'Przyjęto' : 'Odrzucono',
          ksef_id: success ? ksefId : null,
          error_message: success ? null : errorMsg,
          last_attempt_at: new Date().toISOString(),
          retry_count: attempt,
          idempotency_key,
        })
        .eq('id', row.id)

      processed++
      if (success && !updateError) {
        accepted++
      } else {
        failed++
      }
    }

    // Record metrics
    await supabase.from('job_metrics').insert({
      job: 'ksef-batch',
      processed,
      accepted,
      failed,
    })

    // Check threshold and create alert if needed
    const threshold = Number(process.env.JOB_FAIL_THRESHOLD || 0.2)
    if (processed > 0 && failed / processed > threshold) {
      await supabase.from('alerts').insert({
        job: 'ksef-batch',
        ratio: failed / processed,
        processed,
        failed,
        message: 'Przekroczony próg błędów',
      })
    }

    return NextResponse.json({
      ok: true,
      certSize,
      processed,
      accepted,
      failed,
    })
  } catch (error) {
    console.error('KSeF batch job error:', error)
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}

export const GET = withRateLimit(handler, { maxRequests: 10, windowMs: 60000 })
export const POST = withRateLimit(handler, { maxRequests: 1, windowMs: 60000 })

