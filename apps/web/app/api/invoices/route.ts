/**
 * Invoices API - CRUD operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabase } from '@/lib/supabase/client'
import { requireAuth } from '@/lib/supabase/middleware'
import { validateBody, validateQuery, schemas } from '@/lib/api/validation'
import { createSuccessResponse, createErrorResponse } from '@/lib/errors/api-middleware'
import { ErrorCode } from '@/lib/errors/types'
import { withRateLimit } from '@/lib/api/rate-limit'

const invoiceItemSchema = z.object({
  name: z.string().min(1),
  qty: schemas.positiveNumber,
  unit_price: schemas.positiveNumber,
  vat_rate: z.number().min(0).max(100),
  gtu_code: z.string().optional(),
})

const createInvoiceSchema = z.object({
  number: z.string().min(1),
  issue_date: schemas.date,
  currency: schemas.currency,
  seller_nip: schemas.nip.optional(),
  seller_name: z.string().optional(),
  seller_address: z.string().optional(),
  buyer_nip: schemas.nip.optional(),
  buyer_name: z.string().optional(),
  buyer_address: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1),
  mpp: z.boolean().optional().default(false),
})

const listInvoicesQuerySchema = z.object({
  company_id: schemas.uuid.optional(),
  status: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  offset: z.coerce.number().int().nonnegative().optional().default(0),
})

async function listInvoices(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const queryValidation = validateQuery(listInvoicesQuerySchema, Object.fromEntries(request.nextUrl.searchParams))
  if (queryValidation instanceof NextResponse) return queryValidation

  const { company_id, status, limit, offset } = queryValidation.data
  const supabase = createServerSupabase()

  let query = supabase
    .from('invoices')
    .select('id, number, issue_date, currency, total_gross, total_vat, status, mpp, created_at', { count: 'exact' })
    .eq('company_id', company_id || auth.companyId)
    .order('issue_date', { ascending: false })
    .range(offset || 0, (offset || 0) + (limit || 50) - 1)

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json(
      createErrorResponse({
        code: ErrorCode.DATABASE_ERROR,
        message: 'Failed to fetch invoices',
      }),
      { status: 500 }
    )
  }

  return NextResponse.json(
    createSuccessResponse({
      invoices: data || [],
      total: count || 0,
      limit,
      offset,
    })
  )
}

async function createInvoice(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const body = await request.json()
  const validation = validateBody(createInvoiceSchema, body)
  if (validation instanceof NextResponse) return validation

  const invoiceData = validation.data
  const supabase = createServerSupabase()

  // Calculate totals
  let totalNet = 0
  let totalVat = 0

  for (const item of invoiceData.items) {
    const lineNet = item.qty * item.unit_price
    const lineVat = lineNet * (item.vat_rate / 100)
    totalNet += lineNet
    totalVat += lineVat
  }

  const totalGross = totalNet + totalVat

  // Check for duplicate invoice number
  const { data: existing } = await supabase
    .from('invoices')
    .select('id')
    .eq('company_id', auth.companyId)
    .eq('number', invoiceData.number)
    .single()

  if (existing) {
    return NextResponse.json(
      createErrorResponse({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Invoice number already exists',
      }),
      { status: 409 }
    )
  }

  // Create invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      company_id: auth.companyId,
      number: invoiceData.number,
      issue_date: invoiceData.issue_date,
      currency: invoiceData.currency,
      total_gross: totalGross,
      total_vat: totalVat,
      mpp: invoiceData.mpp,
      status: 'Utworzono',
      seller_nip: invoiceData.seller_nip,
      seller_name: invoiceData.seller_name,
      seller_address: invoiceData.seller_address,
      buyer_nip: invoiceData.buyer_nip,
      buyer_name: invoiceData.buyer_name,
      buyer_address: invoiceData.buyer_address,
    })
    .select()
    .single()

  if (invoiceError || !invoice) {
    return NextResponse.json(
      createErrorResponse({
        code: ErrorCode.DATABASE_ERROR,
        message: 'Failed to create invoice',
      }),
      { status: 500 }
    )
  }

  // Create invoice items
  const items = invoiceData.items.map((item) => ({
    invoice_id: invoice.id,
    name: item.name,
    qty: item.qty,
    unit_price: item.unit_price,
    vat_rate: item.vat_rate,
    gtu_code: item.gtu_code,
  }))

  const { error: itemsError } = await supabase.from('invoice_items').insert(items)

  if (itemsError) {
    // Rollback invoice creation
    await supabase.from('invoices').delete().eq('id', invoice.id)
    return NextResponse.json(
      createErrorResponse({
        code: ErrorCode.DATABASE_ERROR,
        message: 'Failed to create invoice items',
      }),
      { status: 500 }
    )
  }

  return NextResponse.json(createSuccessResponse(invoice), { status: 201 })
}

async function handler(request: NextRequest) {
  if (request.method === 'GET') {
    return listInvoices(request)
  }
  if (request.method === 'POST') {
    return createInvoice(request)
  }

  return NextResponse.json(
    createErrorResponse({
      code: ErrorCode.METHOD_NOT_ALLOWED,
      message: 'Method not allowed',
    }),
    { status: 405 }
  )
}

export const GET = withRateLimit(handler, { maxRequests: 100, windowMs: 60000 })
export const POST = withRateLimit(handler, { maxRequests: 50, windowMs: 60000 })

