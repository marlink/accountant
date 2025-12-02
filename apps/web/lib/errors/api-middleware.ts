/**
 * API error middleware for Next.js App Router
 * Standardizes error responses across the API
 */

import { NextResponse } from 'next/server'
import { AppError, ErrorCode } from '@/lib/errors/types'
import { transformError } from '../../../../lib/errors/handler'

/**
 * Standardized API error response format
 */
export interface StandardApiError {
  success: false
  error: {
    code: ErrorCode
    message: string
    details?: string
  }
}

/**
 * Standardized API success response format
 */
export interface StandardApiSuccess<T = unknown> {
  success: true
  data: T
}

/**
 * Union type for API responses
 */
export type StandardApiResponse<T = unknown> = StandardApiSuccess<T> | StandardApiError

/**
 * Create standardized error response
 */
export function createErrorResponse(
  error: AppError | { code: ErrorCode; message: string; details?: string }
): StandardApiError {
  const errorObj = 'severity' in error ? error : {
    code: error.code,
    message: error.message,
    details: error.details,
    severity: 'error' as const,
  }
  
  return {
    success: false,
    error: {
      code: errorObj.code,
      message: errorObj.message,
      details: errorObj.details,
    },
  }
}

/**
 * Create standardized success response
 */
export function createSuccessResponse<T>(data: T): StandardApiSuccess<T> {
  return {
    success: true,
    data,
  }
}

/**
 * Get appropriate HTTP status code for error
 */
function getHttpStatusCode(error: AppError): number {
  switch (error.code) {
    case ErrorCode.VALIDATION_ERROR:
      return 400
    case ErrorCode.UNAUTHORIZED:
    case ErrorCode.API_UNAUTHORIZED:
    case ErrorCode.KSEF_UNAUTHORIZED:
      return 401
    case ErrorCode.FORBIDDEN:
    case ErrorCode.API_FORBIDDEN:
    case ErrorCode.KSEF_FORBIDDEN:
      return 403
    case ErrorCode.NOT_FOUND:
    case ErrorCode.API_NOT_FOUND:
    case ErrorCode.KSEF_NOT_FOUND:
      return 404
    case ErrorCode.METHOD_NOT_ALLOWED:
      return 405
    case ErrorCode.CONFLICT:
      return 409
    case ErrorCode.API_RATE_LIMIT:
    case ErrorCode.KSEF_RATE_LIMIT:
      return 429
    case ErrorCode.DATABASE_ERROR:
    case ErrorCode.API_SERVER_ERROR:
    case ErrorCode.KSEF_SERVER_ERROR:
      return 500
    case ErrorCode.API_TIMEOUT:
    case ErrorCode.KSEF_TIMEOUT:
      return 504
    default:
      return 500
  }
}

/**
 * Handle API route errors and return standardized response
 */
export function handleApiError(error: unknown): NextResponse<StandardApiResponse> {
  const appError = transformError(error)
  const statusCode = getHttpStatusCode(appError)
  
  return NextResponse.json(createErrorResponse(appError), { status: statusCode })
}

