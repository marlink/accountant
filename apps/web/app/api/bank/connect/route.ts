/**
 * Bank AIS Connection API - Initiate OAuth flow
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/supabase/middleware'
import { createSuccessResponse, createErrorResponse } from '@/lib/errors/api-middleware'
import { ErrorCode } from '@/lib/errors/types'
import { withRateLimit } from '@/lib/api/rate-limit'

async function connectBank(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  // TODO: Implement AIS provider OAuth flow
  // This would typically:
  // 1. Generate OAuth state and redirect URL
  // 2. Store state in session/database
  // 3. Return authorization URL to frontend
  // 4. Frontend redirects user to bank OAuth
  // 5. Bank redirects back to callback endpoint
  // 6. Exchange code for access token
  // 7. Store token securely

  return NextResponse.json(
    createSuccessResponse({
      message: 'Bank connection not yet implemented',
      // In production, this would return:
      // authorization_url: 'https://bank-provider.com/oauth/authorize?...',
      // state: 'random-state-token',
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

  return connectBank(request)
}

export const POST = withRateLimit(handler, { maxRequests: 10, windowMs: 60000 })

