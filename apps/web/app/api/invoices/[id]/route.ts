/**
 * Single invoice API - Get, Update, Delete
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabase } from '@/lib/supabase/client'
import { requireAuth, requireCompanyAccess } from '@/lib/supabase/middleware'
import { validateBody, schemas } from '@/lib/api/validation'
import { createSuccessResponse, createErrorResponse } from '@/lib/errors/api-middleware'
import { ErrorCode } from '@/lib/errors/types'
import { withRateLimit } from '@/lib/api/rate-limit'

const updateInvoiceSchema = z.object({
  number: z.string().min(1).optional(),
  issue_date: schemas.date.optional(),
  currency: schemas.currency.optional(),
  seller_nip: schemas.nip.optional(),
  seller_name: z.string().optional(),
  seller_address: z.string().optional(),
  buyer_nip: schemas.nip.optional(),
  buyer_name: z.string().optional(),
  buyer_address: z.string().optional(),
  status: z.string().optional(),
  mpp: z.boolean().optional(),
})

async function getInvoice(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const supabase = createServerSupabase()

  // Get invoice with company check
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', params.id)
    .single()

  if (invoiceError || !invoice) {
    return NextResponse.json(
      createErrorResponse({
        code: ErrorCode.NOT_FOUND,
        message: 'Invoice not found',
      }),
      { status: 404 }
    )
  }

  // Check company access
  const hasAccess = await requireCompanyAccess(request, invoice.company_id)
  if (hasAccess instanceof NextResponse) return hasAccess

  // Get invoice items
  const { data: items, error: itemsError } = await supabase
    .from('invoice_items')
    .select('*')
    .eq('invoice_id', params.id)
    .order('created_at')

  // Get KSeF submission if exists
  const { data: ksefSubmission } = await supabase
    .from('ksef_submissions')
    .select('*')
    .eq('invoice_id', params.id)
    .single()

  return NextResponse.json(
    createSuccessResponse({
      ...invoice,
      items: items || [],
      ksef_submission: ksefSubmission || null,
    })
  )
}

async function updateInvoice(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const body = await request.json()
  const validation = validateBody(updateInvoiceSchema, body)
  if (validation instanceof NextResponse) return validation

  const supabase = createServerSupabase()

  // Check invoice exists and get company_id
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('company_id, status')
    .eq('id', params.id)
    .single()

  if (invoiceError || !invoice) {
    return NextResponse.json(
      createErrorResponse({
        code: ErrorCode.NOT_FOUND,
        message: 'Invoice not found',
      }),
      { status: 404 }
    )
  }

  // Check company access
  const hasAccess = await requireCompanyAccess(request, invoice.company_id)
  if (hasAccess instanceof NextResponse) return hasAccess

  // Prevent updates to posted/locked invoices
  if (invoice.status === 'Zaksięgowano' || invoice.status === 'Zamknięto') {
    return NextResponse.json(
      createErrorResponse({
        code: ErrorCode.FORBIDDEN,
        message: 'Cannot update posted or closed invoice',
      }),
      { status: 403 }
    )
  }

  // Update invoice
  const { data: updated, error: updateError } = await supabase
    .from('invoices')
    .update(validation.data)
    .eq('id', params.id)
    .select()
    .single()

  if (updateError || !updated) {
    return NextResponse.json(
      createErrorResponse({
        code: ErrorCode.DATABASE_ERROR,
        message: 'Failed to update invoice',
      }),
      { status: 500 }
    )
  }

  return NextResponse.json(createSuccessResponse(updated))
}

async function deleteInvoice(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const supabase = createServerSupabase()

  // Check invoice exists and get company_id
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('company_id, status')
    .eq('id', params.id)
    .single()

  if (invoiceError || !invoice) {
    return NextResponse.json(
      createErrorResponse({
        code: ErrorCode.NOT_FOUND,
        message: 'Invoice not found',
      }),
      { status: 404 }
    )
  }

  // Check company access
  const hasAccess = await requireCompanyAccess(request, invoice.company_id)
  if (hasAccess instanceof NextResponse) return hasAccess

  // Prevent deletion of posted invoices
  if (invoice.status === 'Zaksięgowano' || invoice.status === 'Zamknięto') {
    return NextResponse.json(
      createErrorResponse({
        code: ErrorCode.FORBIDDEN,
        message: 'Cannot delete posted or closed invoice',
      }),
      { status: 403 }
    )
  }

  // Delete invoice (cascade will delete items and KSeF submissions)
  const { error: deleteError } = await supabase.from('invoices').delete().eq('id', params.id)

  if (deleteError) {
    return NextResponse.json(
      createErrorResponse({
        code: ErrorCode.DATABASE_ERROR,
        message: 'Failed to delete invoice',
      }),
      { status: 500 }
    )
  }

  return NextResponse.json(createSuccessResponse({ deleted: true }))
}

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params

  if (request.method === 'GET') {
    return getInvoice(request, { params: resolvedParams })
  }
  if (request.method === 'PATCH' || request.method === 'PUT') {
    return updateInvoice(request, { params: resolvedParams })
  }
  if (request.method === 'DELETE') {
    return deleteInvoice(request, { params: resolvedParams })
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
export const PATCH = withRateLimit(handler, { maxRequests: 50, windowMs: 60000 })
export const PUT = withRateLimit(handler, { maxRequests: 50, windowMs: 60000 })
export const DELETE = withRateLimit(handler, { maxRequests: 20, windowMs: 60000 })

