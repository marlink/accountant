/**
 * Supabase middleware for API routes (App Router)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, getUserCompanyId, hasCompanyAccess } from './client'
import { createErrorResponse } from '@/lib/errors/api-middleware'
import { ErrorCode } from '@/lib/errors/types'

export interface AuthenticatedRequest extends NextRequest {
  userId?: string
  companyId?: string
}

/**
 * Get authenticated user from request
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<{ userId: string; companyId: string } | null> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  const supabase = createServerSupabase()
  
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) {
    return null
  }

  const companyId = await getUserCompanyId(user.id)
  if (!companyId) {
    return null
  }

  return { userId: user.id, companyId }
}

/**
 * Middleware to require authentication
 */
export async function requireAuth(request: NextRequest): Promise<{ userId: string; companyId: string } | NextResponse> {
  const auth = await getAuthenticatedUser(request)
  
  if (!auth) {
    return NextResponse.json(
      createErrorResponse({
        code: ErrorCode.UNAUTHORIZED,
        message: 'Authentication required',
      }),
      { status: 401 }
    )
  }

  return auth
}

/**
 * Middleware to require company access
 */
export async function requireCompanyAccess(
  request: NextRequest,
  companyId: string
): Promise<boolean | NextResponse> {
  const auth = await requireAuth(request)
  
  if (auth instanceof NextResponse) {
    return auth
  }

  const hasAccess = await hasCompanyAccess(auth.userId, companyId)
  
  if (!hasAccess) {
    return NextResponse.json(
      createErrorResponse({
        code: ErrorCode.FORBIDDEN,
        message: 'Access denied to this company',
      }),
      { status: 403 }
    )
  }

  return true
}

/**
 * Extract company ID from request (query param, body, or path)
 */
export function extractCompanyId(request: NextRequest, body?: any): string | null {
  // Try query parameter
  const queryCompanyId = request.nextUrl.searchParams.get('company_id')
  if (queryCompanyId) return queryCompanyId

  // Try request body
  if (body?.company_id) return body.company_id

  // Try path parameter (for dynamic routes)
  const pathMatch = request.nextUrl.pathname.match(/\/companies\/([^\/]+)/)
  if (pathMatch) return pathMatch[1]

  return null
}

