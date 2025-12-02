/**
 * VAT Registers API - Get VAT sales and purchase registers
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabase } from '@/lib/supabase/client'
import { requireAuth } from '@/lib/supabase/middleware'
import { validateQuery } from '@/lib/api/validation'
import { createSuccessResponse, createErrorResponse } from '@/lib/errors/api-middleware'
import { ErrorCode } from '@/lib/errors/types'
import { withRateLimit } from '@/lib/api/rate-limit'

const vatRegistersQuerySchema = z.object({
  company_id: z.string().uuid().optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
  type: z.enum(['sprzedaz', 'zakup']).optional(),
})

async function getVatRegisters(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const queryValidation = validateQuery(vatRegistersQuerySchema, Object.fromEntries(request.nextUrl.searchParams))
  if (queryValidation instanceof NextResponse) return queryValidation

  const { company_id, month, type } = queryValidation.data
  const supabase = createServerSupabase()

  // Build date range for the month
  const [year, monthNum] = month.split('-')
  const startDate = `${year}-${monthNum}-01`
  const endDate = `${year}-${monthNum}-${new Date(Number(year), Number(monthNum), 0).getDate()}`

  // Get invoices for VAT register
  let query = supabase
    .from('invoices')
    .select('id, number, issue_date, total_gross, total_vat, currency, buyer_nip, seller_nip')
    .eq('company_id', company_id || auth.companyId)
    .gte('issue_date', startDate)
    .lte('issue_date', endDate)

  // Filter by type if specified
  // Note: This is simplified - in production, you'd distinguish sales vs purchase
  // based on whether the company is seller or buyer

  const { data: invoices, error } = await query

  if (error) {
    return NextResponse.json(
      createErrorResponse({
        code: ErrorCode.DATABASE_ERROR,
        message: 'Failed to fetch VAT registers',
      }),
      { status: 500 }
    )
  }

  // Calculate totals
  const totalNet = (invoices || []).reduce((sum, inv) => sum + (Number(inv.total_gross) - Number(inv.total_vat)), 0)
  const totalVat = (invoices || []).reduce((sum, inv) => sum + Number(inv.total_vat), 0)
  const totalGross = (invoices || []).reduce((sum, inv) => sum + Number(inv.total_gross), 0)

  return NextResponse.json(
    createSuccessResponse({
      month,
      type: type || 'all',
      invoices: invoices || [],
      totals: {
        net: totalNet,
        vat: totalVat,
        gross: totalGross,
      },
    })
  )
}

async function handler(request: NextRequest) {
  if (request.method !== 'GET') {
    return NextResponse.json(
      createErrorResponse({
        code: ErrorCode.METHOD_NOT_ALLOWED,
        message: 'Method not allowed',
      }),
      { status: 405 }
    )
  }

  return getVatRegisters(request)
}

export const GET = withRateLimit(handler, { maxRequests: 100, windowMs: 60000 })

