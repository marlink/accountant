/**
 * API error middleware for Next.js API routes
 * Standardizes error responses across the API
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { AppError, ErrorCode, ApiErrorResponse } from './types';
import { transformError, parseApiError, logError } from './handler';
import { getErrorMessage } from './messages';

/**
 * Standardized API error response format
 */
export interface StandardApiError {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: string;
  };
}

/**
 * Standardized API success response format
 */
export interface StandardApiSuccess<T = unknown> {
  success: true;
  data: T;
}

export type StandardApiResponse<T = unknown> = StandardApiSuccess<T> | StandardApiError;

/**
 * Create standardized error response
 */
export function createErrorResponse(error: AppError): StandardApiError {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      details: error.details,
    },
  };
}

/**
 * Create standardized success response
 */
export function createSuccessResponse<T>(data: T): StandardApiSuccess<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Error handler middleware for Next.js API routes
 * Wraps API route handlers to catch and standardize errors
 */
export function withErrorHandler<T = unknown>(
  handler: (req: NextApiRequest, res: NextApiResponse<StandardApiResponse<T>>) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse<StandardApiResponse<T>>) => {
    try {
      await handler(req, res);
    } catch (error) {
      const appError = transformError(error, {
        method: req.method,
        url: req.url,
        body: req.body,
      });

      // Log the error
      logError(appError, {
        method: req.method,
        url: req.url,
        headers: req.headers,
      });

      // Determine HTTP status code
      const statusCode = getHttpStatusCode(appError);

      // Send standardized error response
      res.status(statusCode).json(createErrorResponse(appError));
    }
  };
}

/**
 * Get appropriate HTTP status code for error
 */
function getHttpStatusCode(error: AppError): number {
  switch (error.code) {
    case ErrorCode.API_UNAUTHORIZED:
    case ErrorCode.AUTH_UNAUTHORIZED:
    case ErrorCode.AUTH_SESSION_EXPIRED:
    case ErrorCode.AUTH_INVALID_TOKEN:
    case ErrorCode.KSEF_UNAUTHORIZED:
      return 401;

    case ErrorCode.API_FORBIDDEN:
    case ErrorCode.INSUFFICIENT_PERMISSIONS:
    case ErrorCode.OPERATION_NOT_ALLOWED:
    case ErrorCode.KSEF_FORBIDDEN:
      return 403;

    case ErrorCode.API_NOT_FOUND:
    case ErrorCode.RESOURCE_NOT_FOUND:
    case ErrorCode.KSEF_NOT_FOUND:
      return 404;

    case ErrorCode.API_RATE_LIMIT:
    case ErrorCode.KSEF_RATE_LIMIT:
      return 429;

    case ErrorCode.VALIDATION_ERROR:
    case ErrorCode.INVALID_NIP:
    case ErrorCode.INVALID_AMOUNT:
    case ErrorCode.INVALID_DATE:
    case ErrorCode.MISSING_REQUIRED_FIELD:
    case ErrorCode.INVALID_FORMAT:
    case ErrorCode.KSEF_SCHEMA_INVALID:
    case ErrorCode.KSEF_SIGNATURE_INVALID:
      return 400;

    case ErrorCode.API_SERVER_ERROR:
    case ErrorCode.KSEF_SERVER_ERROR:
    case ErrorCode.INTERNAL_ERROR:
      return 500;

    case ErrorCode.API_TIMEOUT:
    case ErrorCode.NETWORK_TIMEOUT:
      return 504;

    default:
      return 500;
  }
}

/**
 * Handle API route errors and send standardized response
 */
export function handleApiError(
  error: unknown,
  req: NextApiRequest,
  res: NextApiResponse<StandardApiResponse>
): void {
  const appError = transformError(error, {
    method: req.method,
    url: req.url,
  });

  logError(appError);

  const statusCode = getHttpStatusCode(appError);
  res.status(statusCode).json(createErrorResponse(appError));
}

/**
 * Validate request and return standardized error if invalid
 */
export function validateRequest(
  req: NextApiRequest,
  validations: Array<{
    field: string;
    validator: (value: unknown) => boolean;
    message?: string;
  }>
): AppError | null {
  for (const validation of validations) {
    const value = req.body?.[validation.field] ?? req.query[validation.field];
    
    if (!validation.validator(value)) {
      return {
        code: ErrorCode.VALIDATION_ERROR,
        message: validation.message || `Nieprawidłowa wartość pola: ${validation.field}`,
        severity: 'error',
        metadata: {
          userActionable: true,
        },
      };
    }
  }

  return null;
}

