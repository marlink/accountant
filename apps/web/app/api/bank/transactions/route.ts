/**
 * Bank Transactions API - List synced transactions
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabase } from '@/lib/supabase/client'
import { requireAuth } from '@/lib/supabase/middleware'
import { validateQuery } from '@/lib/api/validation'
import { createSuccessResponse, createErrorResponse } from '@/lib/errors/api-middleware'
import { ErrorCode } from '@/lib/errors/types'
import { withRateLimit } from '@/lib/api/rate-limit'

const listTransactionsQuerySchema = z.object({
  company_id: z.string().uuid().optional(),
  bank_account_id: z.string().uuid().optional(),
  matched: z.coerce.boolean().optional(),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  offset: z.coerce.number().int().nonnegative().optional().default(0),
})

async function listTransactions(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const queryValidation = validateQuery(listTransactionsQuerySchema, Object.fromEntries(request.nextUrl.searchParams))
  if (queryValidation instanceof NextResponse) return queryValidation

  // TODO: Implement when bank_accounts and transactions tables exist
  // For now, return empty list

  return NextResponse.json(
    createSuccessResponse({
      transactions: [],
      total: 0,
      limit: queryValidation.data.limit,
      offset: queryValidation.data.offset,
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

  return listTransactions(request)
}

export const GET = withRateLimit(handler, { maxRequests: 100, windowMs: 60000 })

