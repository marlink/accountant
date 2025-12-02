/**
 * Integration between error system and toast notifications
 */

import { AppError } from "./types"
import { isRetryableError, isUserActionableError, transformError } from "./handler"
import { toastFromError, ToastOptions } from "../utils/toast"

/**
 * Options for displaying errors as toasts
 */
export interface ErrorToastOptions {
  /**
   * Whether to automatically show toast for errors
   * @default true
   */
  autoShow?: boolean
  
  /**
   * Custom retry action
   */
  retryAction?: () => void | Promise<void>
  
  /**
   * Whether to show recovery suggestions
   * @default true
   */
  showRecovery?: boolean
  
  /**
   * Custom toast options
   */
  toastOptions?: Omit<ToastOptions, "variant" | "title" | "description">
}

/**
 * Display an error as a toast notification
 */
export function showErrorToast(
  error: AppError,
  options: ErrorToastOptions = {}
): void {
  const {
    autoShow = true,
    retryAction,
    showRecovery = true,
    toastOptions,
  } = options

  if (!autoShow) {
    return
  }

  // For retryable errors, provide retry action
  const handleRetry = retryAction || (isRetryableError(error) ? () => {
    // Default retry: reload page or retry last action
    if (typeof window !== "undefined") {
      window.location.reload()
    }
  } : undefined)

  // Show error toast with appropriate options
  toastFromError(error, handleRetry)
}

/**
 * Auto-display errors as toast notifications
 * This can be used as a global error handler
 */
export function autoShowErrorToast(error: unknown, retryAction?: () => void | Promise<void>): void {
  const appError = transformError(error)
  showErrorToast(appError, { retryAction })
}

/**
 * Map error codes to toast variants
 */
export function getToastVariantForError(error: AppError): "default" | "destructive" | "success" | "warning" | "info" {
  switch (error.severity) {
    case "warning":
      return "warning"
    case "info":
      return "info"
    case "error":
    default:
      return "destructive"
  }
}

/**
 * Check if error should be shown as toast
 * Some errors might be handled differently (e.g., inline form errors)
 */
export function shouldShowErrorAsToast(error: AppError): boolean {
  // Don't show validation errors as toasts (they should be shown inline)
  if (error.code.startsWith("VALIDATION_") || error.code.startsWith("INVALID_")) {
    return false
  }

  // Always show API, network, and KSeF errors as toasts
  if (
    error.code.startsWith("API_") ||
    error.code.startsWith("NETWORK_") ||
    error.code.startsWith("KSEF_")
  ) {
    return true
  }

  // Show user-actionable errors as toasts
  if (isUserActionableError(error)) {
    return true
  }

  // Default: show errors as toasts
  return true
}

/**
 * Global error handler that automatically shows toasts
 * Can be used in error boundaries or global error handlers
 */
export class ErrorToastHandler {
  private static instance: ErrorToastHandler

  static getInstance(): ErrorToastHandler {
    if (!ErrorToastHandler.instance) {
      ErrorToastHandler.instance = new ErrorToastHandler()
    }
    return ErrorToastHandler.instance
  }

  handleError(error: unknown, retryAction?: () => void | Promise<void>): void {
    const appError = transformError(error)
    if (shouldShowErrorAsToast(appError)) {
      showErrorToast(appError, { retryAction })
    }
  }

  handleAppError(error: AppError, retryAction?: () => void | Promise<void>): void {
    if (shouldShowErrorAsToast(error)) {
      showErrorToast(error, { retryAction })
    }
  }
}

/**
 * Convenience function for global error handling
 */
export function handleErrorWithToast(
  error: unknown,
  retryAction?: () => void | Promise<void>
): void {
  ErrorToastHandler.getInstance().handleError(error, retryAction)
}

