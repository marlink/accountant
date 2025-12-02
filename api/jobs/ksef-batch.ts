import https from 'https'
import { buildFaXml } from '../../lib/ksef/fa'
import { polishError } from '../../lib/ksef/errors'
import crypto from 'crypto'

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET' && req.method !== 'POST') {
      res.status(405).json({ ok: false });
      return;
    }
    const certB64 = process.env.KSEF_CERT_B64 || '';
    const certPemB64 = process.env.KSEF_CERT_PEM_B64 || '';
    const keyPemB64 = process.env.KSEF_KEY_PEM_B64 || '';
    const ksefApiUrl = process.env.KSEF_API_URL || '';
    const ksefSendPath = process.env.KSEF_API_SEND_PATH || '/invoices';
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if ((!certB64 && (!certPemB64 || !keyPemB64)) || !supabaseUrl || !supabaseServiceKey || !ksefApiUrl) {
      res.status(500).json({ ok: false });
      return;
    }
    const certSize = certB64 ? Buffer.from(certB64, 'base64').length : Buffer.from(certPemB64, 'base64').length;
    if (req.method === 'GET') {
      res.status(200).json({ ok: true, certSize, ksefReady: !!(certPemB64 && keyPemB64) });
      return;
    }
    const limit = Number(req.query.limit || 25);
    const listUrl = `${supabaseUrl}/rest/v1/ksef_submissions?status=eq.DoWyslania&select=id,invoice_id,status&limit=${limit}`;
    const headers = {
      apikey: supabaseServiceKey,
      Authorization: `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    };
    const pendingResp = await fetch(listUrl, { headers });
    if (!pendingResp.ok) {
      res.status(502).json({ ok: false });
      return;
    }
    const pending = await pendingResp.json();
    let processed = 0;
    let accepted = 0;
    let failed = 0;
    const certPem = certPemB64 ? Buffer.from(certPemB64, 'base64').toString('utf8') : '';
    const keyPem = keyPemB64 ? Buffer.from(keyPemB64, 'base64').toString('utf8') : '';
    const agent = certPem && keyPem ? new https.Agent({ cert: certPem, key: keyPem, passphrase: process.env.KSEF_CERT_PASSWORD }) : undefined;
    const sendInvoice = async (invoiceId: string) => {
      const invUrl = `${supabaseUrl}/rest/v1/invoices?id=eq.${invoiceId}&select=id,number,issue_date,total_gross,total_vat,currency,seller_nip,seller_name,seller_address,buyer_nip,buyer_name,buyer_address`;
      const invResp = await fetch(invUrl, { headers });
      if (!invResp.ok) throw new Error('Brak danych faktury');
      const invRow = (await invResp.json())[0];
      const itemsUrl = `${supabaseUrl}/rest/v1/invoice_items?invoice_id=eq.${invoiceId}&select=name,qty,unit_price,vat_rate,gtu_code`;
      const itemsResp = await fetch(itemsUrl, { headers });
      if (!itemsResp.ok) throw new Error('Brak pozycji faktury');
      const items = await itemsResp.json();
      const inv = {
        id: invRow.id,
        number: invRow.number,
        issue_date: invRow.issue_date,
        total_gross: invRow.total_gross,
        total_vat: invRow.total_vat,
        currency: invRow.currency,
        seller: { nip: invRow.seller_nip, name: invRow.seller_name, address: invRow.seller_address },
        buyer: { nip: invRow.buyer_nip, name: invRow.buyer_name, address: invRow.buyer_address },
        items
      }
      const xml = buildFaXml(inv);
      const url = new URL(ksefSendPath, ksefApiUrl);
      const options: any = { method: 'POST', headers: { 'Content-Type': 'application/xml' }, agent };
      const ksefResp = await fetch(url.toString(), { ...options, body: xml });
      if (!ksefResp.ok) throw new Error(`KSeF ${ksefResp.status}`);
      const data = await ksefResp.json();
      const ksefId = data.ksefId || data.id || `KSEF-${invoiceId}`;
      return ksefId;
    };
    for (const row of pending) {
      let ksefId = '';
      let errorMsg = '';
      let success = false;
      let attempt = 0;
      while (attempt < 3 && !success) {
        try {
          ksefId = await sendInvoice(row.invoice_id);
          success = true;
        } catch (e: any) {
          const statusMatch = String(e?.message || '').match(/KSeF\s(\d+)/)
          const status = statusMatch ? Number(statusMatch[1]) : 0
          errorMsg = polishError(status, {})
          attempt++;
          const backoff = Math.min(1000 * 2 ** attempt, 8000);
          await new Promise(r => setTimeout(r, backoff));
        }
      }
      const idempotency_key = crypto.createHash('sha256').update(`${row.invoice_id}`).digest('hex')
      const patchUrl = `${supabaseUrl}/rest/v1/ksef_submissions?id=eq.${row.id}`;
      const body = JSON.stringify({ status: success ? 'Przyjęto' : 'Odrzucono', ksef_id: success ? ksefId : null, error_message: success ? null : errorMsg, last_attempt_at: new Date().toISOString(), retry_count: attempt, idempotency_key });
      const upd = await fetch(patchUrl, { method: 'PATCH', headers, body });
      processed++;
      if (success && upd.ok) accepted++; else failed++;
    }
    const metricsUrl = `${supabaseUrl}/rest/v1/job_metrics`;
    const metricsBody = JSON.stringify({ job: 'ksef-batch', processed, accepted, failed });
    await fetch(metricsUrl, { method: 'POST', headers, body: metricsBody });
    const threshold = Number(process.env.JOB_FAIL_THRESHOLD || 0.2);
    if (processed > 0 && failed / processed > threshold) {
      const alertsUrl = `${supabaseUrl}/rest/v1/alerts`;
      const alertBody = JSON.stringify({ job: 'ksef-batch', ratio: failed / processed, processed, failed, message: 'Przekroczony próg błędów' });
      await fetch(alertsUrl, { method: 'POST', headers, body: alertBody });
    }
    res.status(200).json({ ok: true, certSize, processed, accepted, failed });
  } catch {
    res.status(500).json({ ok: false });
  }
}
