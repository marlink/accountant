/**
 * Centralized error transformation and handling utilities
 */

import { ErrorCode, AppError, createError, isAppError, ErrorMetadata } from './types';
import { polishError } from '../ksef/errors';

/**
 * Transform a generic error into an AppError
 */
export function transformError(error: unknown, context?: Record<string, unknown>): AppError {
  // If it's already an AppError, return it with context
  if (isAppError(error)) {
    return {
      ...error,
      metadata: {
        ...error.metadata,
        context: { ...error.metadata?.context, ...context },
      },
    };
  }

  // Handle Error objects
  if (error instanceof Error) {
    return createError(
      ErrorCode.UNKNOWN_ERROR,
      error.message || 'Wystąpił nieoczekiwany błąd',
      error.stack,
      {
        originalError: error,
        context,
      }
    );
  }

  // Handle string errors
  if (typeof error === 'string') {
    return createError(ErrorCode.UNKNOWN_ERROR, error, undefined, { context });
  }

  // Handle unknown errors
  return createError(
    ErrorCode.UNKNOWN_ERROR,
    'Wystąpił nieoczekiwany błąd',
    String(error),
    {
      originalError: error,
      context,
    }
  );
}

/**
 * Parse API error response and transform to AppError
 */
export function parseApiError(
  response: Response | { status: number; statusText?: string; data?: unknown },
  body?: unknown
): AppError {
  const status = 'status' in response ? response.status : 500;
  const statusText = 'statusText' in response ? response.statusText : undefined;

  // Try to extract error from body
  let errorCode = ErrorCode.API_ERROR;
  let message = statusText || 'Błąd połączenia z serwerem';
  let details: string | undefined;

  if (body && typeof body === 'object') {
    const bodyObj = body as Record<string, unknown>;
    if ('code' in bodyObj && typeof bodyObj.code === 'string') {
      errorCode = bodyObj.code as ErrorCode;
    }
    if ('message' in bodyObj && typeof bodyObj.message === 'string') {
      message = bodyObj.message;
    }
    if ('details' in bodyObj && typeof bodyObj.details === 'string') {
      details = bodyObj.details;
    }
  }

  // Map HTTP status codes to error codes
  switch (status) {
    case 401:
      errorCode = ErrorCode.API_UNAUTHORIZED;
      message = message || 'Nieautoryzowany dostęp';
      break;
    case 403:
      errorCode = ErrorCode.API_FORBIDDEN;
      message = message || 'Brak uprawnień';
      break;
    case 404:
      errorCode = ErrorCode.API_NOT_FOUND;
      message = message || 'Zasób nie został znaleziony';
      break;
    case 429:
      errorCode = ErrorCode.API_RATE_LIMIT;
      message = message || 'Zbyt wiele żądań. Spróbuj ponownie później';
      break;
    case 500:
    case 502:
    case 503:
    case 504:
      errorCode = ErrorCode.API_SERVER_ERROR;
      message = message || 'Błąd serwera. Spróbuj ponownie później';
      break;
  }

  const metadata: ErrorMetadata = {
    retryable: status >= 500 || status === 429,
    userActionable: status < 500 && status !== 401 && status !== 403,
    originalError: body,
  };

  return createError(errorCode, message, details, metadata);
}

/**
 * Handle network errors
 */
export function handleNetworkError(error: unknown): AppError {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    // Check if offline
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return createError(
        ErrorCode.NETWORK_OFFLINE,
        'Brak połączenia z internetem',
        'Sprawdź połączenie sieciowe i spróbuj ponownie',
        {
          retryable: true,
          userActionable: true,
          recoverySuggestion: 'Sprawdź połączenie sieciowe',
        }
      );
    }

    return createError(
      ErrorCode.NETWORK_ERROR,
      'Błąd połączenia sieciowego',
      error.message,
      {
        retryable: true,
        userActionable: true,
        originalError: error,
        recoverySuggestion: 'Spróbuj ponownie za chwilę',
      }
    );
  }

  return transformError(error);
}

/**
 * Handle KSeF-specific errors
 */
export function handleKsefError(
  status: number,
  payload?: { code?: string; message?: string; details?: string }
): AppError {
  const message = polishError(status, payload || {});
  let errorCode = ErrorCode.KSEF_ERROR;
  const metadata: ErrorMetadata = {
    retryable: status >= 500 || status === 429,
    userActionable: status < 500 && status !== 401 && status !== 403,
  };

  // Map KSeF status codes to error codes
  switch (status) {
    case 401:
      errorCode = ErrorCode.KSEF_UNAUTHORIZED;
      metadata.recoverySuggestion = 'Sprawdź certyfikat i uprawnienia KSeF';
      break;
    case 403:
      errorCode = ErrorCode.KSEF_FORBIDDEN;
      metadata.recoverySuggestion = 'Sprawdź uprawnienia do wysyłki e-Faktury';
      break;
    case 404:
      errorCode = ErrorCode.KSEF_NOT_FOUND;
      break;
    case 429:
      errorCode = ErrorCode.KSEF_RATE_LIMIT;
      metadata.recoverySuggestion = 'Poczekaj chwilę i spróbuj ponownie';
      break;
    default:
      if (status >= 500) {
        errorCode = ErrorCode.KSEF_SERVER_ERROR;
        metadata.recoverySuggestion = 'Spróbuj ponownie później';
      }
  }

  // Handle specific KSeF error codes
  if (payload?.code === 'SCHEMA_INVALID') {
    errorCode = ErrorCode.KSEF_SCHEMA_INVALID;
    metadata.recoverySuggestion = 'Sprawdź strukturę faktury zgodnie ze schematem KSeF';
    metadata.userActionable = true;
  } else if (payload?.code === 'SIGNATURE_INVALID') {
    errorCode = ErrorCode.KSEF_SIGNATURE_INVALID;
    metadata.recoverySuggestion = 'Sprawdź poprawność podpisu certyfikatu';
    metadata.userActionable = true;
  }

  return createError(errorCode, message, payload?.details, metadata);
}

/**
 * Log error for debugging (can be extended to send to logging service)
 */
export function logError(error: AppError, additionalContext?: Record<string, unknown>): void {
  const logData = {
    code: error.code,
    message: error.message,
    details: error.details,
    severity: error.severity,
    metadata: {
      ...error.metadata,
      context: { ...error.metadata?.context, ...additionalContext },
    },
    timestamp: error.metadata?.timestamp || new Date().toISOString(),
  };

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error]', logData);
  }

  // Send to Sentry if available
  // Note: Sentry integration is handled in apps/web/lib/errors/sentry.ts
  // This root-level handler doesn't have direct access to Sentry
  if (process.env.SENTRY_DSN && typeof console !== 'undefined' && console.error) {
    const errorObj = new Error(error.message);
    errorObj.name = error.code;
    console.error('Error (Sentry would capture):', errorObj, logData);
  }
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: AppError): boolean {
  return error.metadata?.retryable === true;
}

/**
 * Check if an error requires user action
 */
export function isUserActionableError(error: AppError): boolean {
  return error.metadata?.userActionable === true;
}

