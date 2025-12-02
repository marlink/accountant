/**
 * Input validation utilities using Zod
 */

import { z } from 'zod'
import { createErrorResponse } from '@/lib/errors/api-middleware'
import { ErrorCode } from '@/lib/errors/types'
import { NextResponse } from 'next/server'

/**
 * Validate request body with Zod schema
 */
export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): { success: true; data: T } | NextResponse {
  try {
    const data = schema.parse(body)
    return { success: true, data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createErrorResponse({
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Validation failed',
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
        }),
        { status: 400 }
      )
    }
    return NextResponse.json(
      createErrorResponse({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Invalid request body',
      }),
      { status: 400 }
    )
  }
}

/**
 * Validate query parameters with Zod schema
 */
export function validateQuery<T>(schema: z.ZodSchema<T>, query: Record<string, string | string[] | undefined>): { success: true; data: T } | NextResponse {
  try {
    // Convert query params to plain object
    const queryObj: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(query)) {
      queryObj[key] = Array.isArray(value) ? value[0] : value
    }
    
    const data = schema.parse(queryObj)
    return { success: true, data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createErrorResponse({
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Invalid query parameters',
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
        }),
        { status: 400 }
      )
    }
    return NextResponse.json(
      createErrorResponse({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Invalid query parameters',
      }),
      { status: 400 }
    )
  }
}

/**
 * Common validation schemas
 */
export const schemas = {
  uuid: z.string().uuid(),
  nip: z.string().regex(/^\d{10}$/, 'NIP must be 10 digits'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  currency: z.string().length(3),
  positiveNumber: z.number().positive(),
  nonNegativeNumber: z.number().nonnegative(),
  email: z.string().email(),
}

