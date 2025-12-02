/**
 * Centralized error types and codes for the application
 */

export enum ErrorCode {
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_NIP = 'INVALID_NIP',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  INVALID_DATE = 'INVALID_DATE',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',

  // API errors
  API_ERROR = 'API_ERROR',
  API_TIMEOUT = 'API_TIMEOUT',
  API_UNAUTHORIZED = 'API_UNAUTHORIZED',
  API_FORBIDDEN = 'API_FORBIDDEN',
  API_NOT_FOUND = 'API_NOT_FOUND',
  API_RATE_LIMIT = 'API_RATE_LIMIT',
  API_SERVER_ERROR = 'API_SERVER_ERROR',

  // KSeF errors
  KSEF_ERROR = 'KSEF_ERROR',
  KSEF_UNAUTHORIZED = 'KSEF_UNAUTHORIZED',
  KSEF_FORBIDDEN = 'KSEF_FORBIDDEN',
  KSEF_NOT_FOUND = 'KSEF_NOT_FOUND',
  KSEF_RATE_LIMIT = 'KSEF_RATE_LIMIT',
  KSEF_SCHEMA_INVALID = 'KSEF_SCHEMA_INVALID',
  KSEF_SIGNATURE_INVALID = 'KSEF_SIGNATURE_INVALID',
  KSEF_SERVER_ERROR = 'KSEF_SERVER_ERROR',
  KSEF_TIMEOUT = 'KSEF_TIMEOUT',

  // Authentication errors
  AUTH_ERROR = 'AUTH_ERROR',
  AUTH_UNAUTHORIZED = 'AUTH_UNAUTHORIZED',
  AUTH_SESSION_EXPIRED = 'AUTH_SESSION_EXPIRED',
  AUTH_INVALID_TOKEN = 'AUTH_INVALID_TOKEN',

  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  NETWORK_OFFLINE = 'NETWORK_OFFLINE',
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',

  // Business logic errors
  BUSINESS_ERROR = 'BUSINESS_ERROR',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED',

  // Generic errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  
  // HTTP method errors
  METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED',
  
  // Database errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  
  // Not found errors (alias for consistency)
  NOT_FOUND = 'NOT_FOUND',
  
  // Conflict errors
  CONFLICT = 'CONFLICT',
  
  // Authorization errors (alias)
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
}

export type ErrorSeverity = 'error' | 'warning' | 'info';

export interface ErrorMetadata {
  retryable?: boolean;
  userActionable?: boolean;
  recoverySuggestion?: string;
  originalError?: unknown;
  context?: Record<string, unknown>;
  timestamp?: string;
}

export interface AppError {
  code: ErrorCode;
  message: string;
  details?: string;
  severity: ErrorSeverity;
  metadata?: ErrorMetadata;
}

export interface ApiErrorResponse {
  code: ErrorCode;
  message: string;
  details?: string;
  statusCode?: number;
  metadata?: ErrorMetadata;
}

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'severity' in error
  );
}

/**
 * Create an AppError from error code and message
 */
export function createError(
  code: ErrorCode,
  message: string,
  details?: string,
  metadata?: ErrorMetadata
): AppError {
  return {
    code,
    message,
    details,
    severity: 'error',
    metadata: {
      ...metadata,
      timestamp: new Date().toISOString(),
    },
  };
}

