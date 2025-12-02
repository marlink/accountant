/**
 * Single expense API - Get, Update, Delete
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabase } from '@/lib/supabase/client'
import { requireAuth, requireCompanyAccess } from '@/lib/supabase/middleware'
import { validateBody } from '@/lib/api/validation'
import { createSuccessResponse, createErrorResponse } from '@/lib/errors/api-middleware'
import { ErrorCode } from '@/lib/errors/types'
import { withRateLimit } from '@/lib/api/rate-limit'

const updateExpenseSchema = z.object({
  supplier_nip: z.string().regex(/^\d{10}$/).optional(),
  total_gross: z.number().positive().optional(),
  total_vat: z.number().nonnegative().optional(),
  issue_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  category: z.string().optional(),
  approval_status: z.enum(['Oczekuje', 'Zatwierdzony', 'Odrzucony']).optional(),
})

async function getExpense(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const supabase = createServerSupabase()

  const { data: expense, error: expenseError } = await supabase
    .from('expenses')
    .select('*')
    .eq('id', params.id)
    .single()

  if (expenseError || !expense) {
    return NextResponse.json(
      createErrorResponse({
        code: ErrorCode.NOT_FOUND,
        message: 'Expense not found',
      }),
      { status: 404 }
    )
  }

  const hasAccess = await requireCompanyAccess(request, expense.company_id)
  if (hasAccess instanceof NextResponse) return hasAccess

  return NextResponse.json(createSuccessResponse(expense))
}

async function updateExpense(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const body = await request.json()
  const validation = validateBody(updateExpenseSchema, body)
  if (validation instanceof NextResponse) return validation

  const supabase = createServerSupabase()

  const { data: expense, error: expenseError } = await supabase
    .from('expenses')
    .select('company_id')
    .eq('id', params.id)
    .single()

  if (expenseError || !expense) {
    return NextResponse.json(
      createErrorResponse({
        code: ErrorCode.NOT_FOUND,
        message: 'Expense not found',
      }),
      { status: 404 }
    )
  }

  const hasAccess = await requireCompanyAccess(request, expense.company_id)
  if (hasAccess instanceof NextResponse) return hasAccess

  const { data: updated, error: updateError } = await supabase
    .from('expenses')
    .update(validation.data)
    .eq('id', params.id)
    .select()
    .single()

  if (updateError || !updated) {
    return NextResponse.json(
      createErrorResponse({
        code: ErrorCode.DATABASE_ERROR,
        message: 'Failed to update expense',
      }),
      { status: 500 }
    )
  }

  return NextResponse.json(createSuccessResponse(updated))
}

async function deleteExpense(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const supabase = createServerSupabase()

  const { data: expense, error: expenseError } = await supabase
    .from('expenses')
    .select('company_id')
    .eq('id', params.id)
    .single()

  if (expenseError || !expense) {
    return NextResponse.json(
      createErrorResponse({
        code: ErrorCode.NOT_FOUND,
        message: 'Expense not found',
      }),
      { status: 404 }
    )
  }

  const hasAccess = await requireCompanyAccess(request, expense.company_id)
  if (hasAccess instanceof NextResponse) return hasAccess

  const { error: deleteError } = await supabase.from('expenses').delete().eq('id', params.id)

  if (deleteError) {
    return NextResponse.json(
      createErrorResponse({
        code: ErrorCode.DATABASE_ERROR,
        message: 'Failed to delete expense',
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
    return getExpense(request, { params: resolvedParams })
  }
  if (request.method === 'PATCH' || request.method === 'PUT') {
    return updateExpense(request, { params: resolvedParams })
  }
  if (request.method === 'DELETE') {
    return deleteExpense(request, { params: resolvedParams })
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

