/**
 * JPK_V7 Export API - Generate JPK_V7 XML file
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabase } from '@/lib/supabase/client'
import { requireAuth } from '@/lib/supabase/middleware'
import { validateQuery } from '@/lib/api/validation'
import { createSuccessResponse, createErrorResponse } from '@/lib/errors/api-middleware'
import { ErrorCode } from '@/lib/errors/types'
import { withRateLimit } from '@/lib/api/rate-limit'

const jpkExportQuerySchema = z.object({
  company_id: z.string().uuid().optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
  type: z.enum(['M', 'K']).optional().default('M'), // M = monthly, K = quarterly
})

async function exportJpk(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const queryValidation = validateQuery(jpkExportQuerySchema, Object.fromEntries(request.nextUrl.searchParams))
  if (queryValidation instanceof NextResponse) return queryValidation

  const { company_id, month, type } = queryValidation.data
  const supabase = createServerSupabase()

  // Build date range
  const [year, monthNum] = month.split('-')
  const startDate = `${year}-${monthNum}-01`
  const endDate = `${year}-${monthNum}-${new Date(Number(year), Number(monthNum), 0).getDate()}`

  // Get company data
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('*')
    .eq('id', company_id || auth.companyId)
    .single()

  if (companyError || !company) {
    return NextResponse.json(
      createErrorResponse({
        code: ErrorCode.NOT_FOUND,
        message: 'Company not found',
      }),
      { status: 404 }
    )
  }

  // Get invoices for the period
  const { data: invoices, error: invoicesError } = await supabase
    .from('invoices')
    .select('*, invoice_items(*)')
    .eq('company_id', company_id || auth.companyId)
    .gte('issue_date', startDate)
    .lte('issue_date', endDate)

  if (invoicesError) {
    return NextResponse.json(
      createErrorResponse({
        code: ErrorCode.DATABASE_ERROR,
        message: 'Failed to fetch invoices for JPK',
      }),
      { status: 500 }
    )
  }

  // TODO: Generate JPK_V7 XML according to MF schema
  // This is a placeholder - full implementation would:
  // 1. Build XML structure according to JPK_V7 schema
  // 2. Include all required fields (Naglowek, Podmiot1, SprzedazWiersz, etc.)
  // 3. Validate against XSD schema
  // 4. Store in Supabase Storage or return as download

  // For now, return a placeholder response
  return NextResponse.json(
    createSuccessResponse({
      message: 'JPK_V7 export not yet fully implemented',
      month,
      type,
      invoice_count: invoices?.length || 0,
      // In production, this would return:
      // download_url: 'https://storage.supabase.co/...',
      // file_size: 12345,
      // generated_at: new Date().toISOString(),
    })
  )
}

async function handler(request: NextRequest) {
  if (request.method !== 'POST') {
    return NextResponse.json(
      createErrorResponse({
        code: ErrorCode.METHOD_NOT_ALLOWED,
        message: 'Method not allowed',
      }),
      { status: 405 }
    )
  }

  return exportJpk(request)
}

export const POST = withRateLimit(handler, { maxRequests: 20, windowMs: 60000 })

