/**
 * KSeF Send API - Send invoice to KSeF
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/client'
import { requireAuth, requireCompanyAccess } from '@/lib/supabase/middleware'
import { createSuccessResponse, createErrorResponse } from '@/lib/errors/api-middleware'
import { ErrorCode } from '@/lib/errors/types'
import { withRateLimit } from '@/lib/api/rate-limit'

async function sendToKsef(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const supabase = createServerSupabase()

  // Get invoice
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

  // Check if already submitted
  const { data: existingSubmission } = await supabase
    .from('ksef_submissions')
    .select('*')
    .eq('invoice_id', params.id)
    .single()

  if (existingSubmission) {
    if (existingSubmission.status === 'Przyjęto') {
      return NextResponse.json(
        createErrorResponse({
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Invoice already submitted to KSeF',
        }),
        { status: 409 }
      )
    }
    if (existingSubmission.status === 'DoWyslania') {
      return NextResponse.json(
        createErrorResponse({
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Invoice is already queued for submission',
        }),
        { status: 409 }
      )
    }
  }

  // Create or update submission record
  const submissionData = {
    invoice_id: params.id,
    status: 'DoWyslania',
    error_message: null,
  }

  let submission
  if (existingSubmission) {
    const { data: updated, error: updateError } = await supabase
      .from('ksef_submissions')
      .update(submissionData)
      .eq('id', existingSubmission.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        createErrorResponse({
          code: ErrorCode.DATABASE_ERROR,
          message: 'Failed to queue invoice for KSeF',
        }),
        { status: 500 }
      )
    }
    submission = updated
  } else {
    const { data: created, error: createError } = await supabase
      .from('ksef_submissions')
      .insert(submissionData)
      .select()
      .single()

    if (createError || !created) {
      return NextResponse.json(
        createErrorResponse({
          code: ErrorCode.DATABASE_ERROR,
          message: 'Failed to queue invoice for KSeF',
        }),
        { status: 500 }
      )
    }
    submission = created
  }

  return NextResponse.json(
    createSuccessResponse({
      submission_id: submission.id,
      status: 'DoWyslania',
      message: 'Invoice queued for KSeF submission. It will be processed shortly.',
    })
  )
}

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (request.method !== 'POST') {
    return NextResponse.json(
      createErrorResponse({
        code: ErrorCode.METHOD_NOT_ALLOWED,
        message: 'Method not allowed',
      }),
      { status: 405 }
    )
  }

  const resolvedParams = await params
  return sendToKsef(request, { params: resolvedParams })
}

export const POST = withRateLimit(handler, { maxRequests: 20, windowMs: 60000 })

