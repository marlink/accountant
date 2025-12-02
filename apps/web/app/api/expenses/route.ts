/**
 * Expenses API - Upload and manage expense documents
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabase } from '@/lib/supabase/client'
import { requireAuth } from '@/lib/supabase/middleware'
import { validateBody, validateQuery, schemas } from '@/lib/api/validation'
import { createSuccessResponse, createErrorResponse } from '@/lib/errors/api-middleware'
import { ErrorCode } from '@/lib/errors/types'
import { withRateLimit } from '@/lib/api/rate-limit'

const createExpenseSchema = z.object({
  supplier_nip: schemas.nip.optional(),
  total_gross: schemas.positiveNumber,
  total_vat: schemas.nonNegativeNumber,
  issue_date: schemas.date,
  category: z.string().optional(),
  approval_status: z.enum(['Oczekuje', 'Zatwierdzony', 'Odrzucony']).optional().default('Oczekuje'),
})

const listExpensesQuerySchema = z.object({
  company_id: schemas.uuid.optional(),
  approval_status: z.string().optional(),
  category: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  offset: z.coerce.number().int().nonnegative().optional().default(0),
})

async function listExpenses(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const queryValidation = validateQuery(listExpensesQuerySchema, Object.fromEntries(request.nextUrl.searchParams))
  if (queryValidation instanceof NextResponse) return queryValidation

  const { company_id, approval_status, category, limit, offset } = queryValidation.data
  const supabase = createServerSupabase()

  let query = supabase
    .from('expenses')
    .select('*', { count: 'exact' })
    .eq('company_id', company_id || auth.companyId)
    .order('issue_date', { ascending: false })
    .range(offset || 0, (offset || 0) + (limit || 50) - 1)

  if (approval_status) {
    query = query.eq('approval_status', approval_status)
  }

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json(
      createErrorResponse({
        code: ErrorCode.DATABASE_ERROR,
        message: 'Failed to fetch expenses',
      }),
      { status: 500 }
    )
  }

  return NextResponse.json(
    createSuccessResponse({
      expenses: data || [],
      total: count || 0,
      limit,
      offset,
    })
  )
}

async function createExpense(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const body = await request.json()
  const validation = validateBody(createExpenseSchema, body)
  if (validation instanceof NextResponse) return validation

  const expenseData = validation.data
  const supabase = createServerSupabase()

  // Create expense
  const { data: expense, error: expenseError } = await supabase
    .from('expenses')
    .insert({
      company_id: auth.companyId,
      supplier_nip: expenseData.supplier_nip,
      total_gross: expenseData.total_gross,
      total_vat: expenseData.total_vat,
      issue_date: expenseData.issue_date,
      category: expenseData.category,
      approval_status: expenseData.approval_status,
    })
    .select()
    .single()

  if (expenseError || !expense) {
    return NextResponse.json(
      createErrorResponse({
        code: ErrorCode.DATABASE_ERROR,
        message: 'Failed to create expense',
      }),
      { status: 500 }
    )
  }

  // TODO: OCR processing would happen here via a background job
  // For now, return the created expense
  return NextResponse.json(createSuccessResponse(expense), { status: 201 })
}

async function handler(request: NextRequest) {
  if (request.method === 'GET') {
    return listExpenses(request)
  }
  if (request.method === 'POST') {
    return createExpense(request)
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

