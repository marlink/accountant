/**
 * Toast utility functions with support for all variants and actions
 */

import * as React from "react"
import { toast as shadcnToast } from "@/lib/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { AppError } from "@/lib/errors/types"
import { isRetryableError } from "@/lib/errors/handler"

export type ToastVariant = "default" | "destructive" | "success" | "warning" | "info"

export interface ToastOptions {
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  dismissLabel?: string
}

/**
 * Show a success toast
 */
export function toastSuccess(
  message: string,
  description?: string,
  options?: Omit<ToastOptions, "variant">
) {
  const action = options?.action
    ? React.createElement(ToastAction, {
        altText: options.action.label,
        onClick: options.action.onClick,
      }, options.action.label)
    : undefined

  return shadcnToast({
    variant: "success",
    title: options?.title || message,
    description: description || options?.description,
    duration: options?.duration,
    action,
  })
}

/**
 * Show an error toast
 */
export function toastError(
  message: string,
  description?: string,
  options?: Omit<ToastOptions, "variant">
) {
  const action = options?.action
    ? React.createElement(ToastAction, {
        altText: options.action.label,
        onClick: options.action.onClick,
      }, options.action.label)
    : undefined

  return shadcnToast({
    variant: "destructive",
    title: options?.title || message,
    description: description || options?.description,
    duration: options?.duration,
    action,
  })
}

/**
 * Show a warning toast
 */
export function toastWarning(
  message: string,
  description?: string,
  options?: Omit<ToastOptions, "variant">
) {
  const action = options?.action
    ? React.createElement(ToastAction, {
        altText: options.action.label,
        onClick: options.action.onClick,
      }, options.action.label)
    : undefined

  return shadcnToast({
    variant: "warning",
    title: options?.title || message,
    description: description || options?.description,
    duration: options?.duration,
    action,
  })
}

/**
 * Show an info toast
 */
export function toastInfo(
  message: string,
  description?: string,
  options?: Omit<ToastOptions, "variant">
) {
  const action = options?.action
    ? React.createElement(ToastAction, {
        altText: options.action.label,
        onClick: options.action.onClick,
      }, options.action.label)
    : undefined

  return shadcnToast({
    variant: "info",
    title: options?.title || message,
    description: description || options?.description,
    duration: options?.duration,
    action,
  })
}

/**
 * Show a loading toast (typically used with promise-based toasts)
 */
export function toastLoading(message: string, description?: string) {
  return shadcnToast({
    variant: "info",
    title: message,
    description: description || "Proszę czekać...",
    duration: Infinity, // Loading toasts don't auto-dismiss
  })
}

/**
 * Show a toast from an AppError
 */
export function toastFromError(error: AppError, retryAction?: () => void) {
  let variant: ToastVariant = "destructive"
  
  // Determine variant based on error severity
  if (error.severity === "warning") {
    variant = "warning"
  } else if (error.severity === "info") {
    variant = "info"
  }

  const action = retryAction && isRetryableError(error)
    ? React.createElement(ToastAction, {
        altText: "Spróbuj ponownie",
        onClick: retryAction,
      }, "Spróbuj ponownie")
    : undefined

  return shadcnToast({
    variant,
    title: error.message,
    description: error.details || error.metadata?.recoverySuggestion,
    duration: variant === "destructive" ? 10000 : 5000,
    action,
  })
}

/**
 * Promise-based toast: shows loading, then success/error
 */
export async function toastPromise<T>(
  promise: Promise<T>,
  messages: {
    loading: string
    success: string | ((data: T) => string)
    error: string | ((error: unknown) => string)
  }
): Promise<T> {
  const loadingToast = toastLoading(messages.loading)
  
  try {
    const data = await promise
    loadingToast.dismiss()
    
    const successMessage = typeof messages.success === "function"
      ? messages.success(data)
      : messages.success
    
    toastSuccess(successMessage)
    return data
  } catch (error) {
    loadingToast.dismiss()
    
    const errorMessage = typeof messages.error === "function"
      ? messages.error(error)
      : messages.error
    
    toastError(errorMessage)
    throw error
  }
}

/**
 * Toast with action button
 */
export function toastWithAction(
  message: string,
  action: { label: string; onClick: () => void },
  variant: ToastVariant = "default",
  description?: string
) {
  const actionElement = React.createElement(ToastAction, {
    altText: action.label,
    onClick: action.onClick,
  }, action.label)

  return shadcnToast({
    variant,
    title: message,
    description,
    action: actionElement,
  })
}

/**
 * Dismiss all toasts
 */
export function dismissAllToasts() {
  // This would need to be implemented in the toast hook
  // For now, we'll export a placeholder
  // The actual implementation would require access to the toast state
}

