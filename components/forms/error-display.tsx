"use client"

import * as React from "react"
import { AppError, ErrorCode } from "@/lib/errors/types"
import { FieldHelpTooltip } from "@/components/ui/help-tooltip"
import { cn } from "@/lib/utils"
import { AlertCircle } from "lucide-react"

export interface FieldError {
  message: string
  code?: ErrorCode
  field?: string
}

export interface FormErrorDisplayProps {
  /**
   * Error to display
   */
  error?: AppError | FieldError | string | null
  
  /**
   * Field name (for field-specific errors)
   */
  fieldName?: string
  
  /**
   * Whether to show error as tooltip
   */
  showAsTooltip?: boolean
  
  /**
   * Additional className
   */
  className?: string
  
  /**
   * Whether to show help tooltip alongside error
   */
  showHelp?: boolean
  helpText?: string
}

/**
 * Component for displaying form validation errors
 * Supports both inline display and tooltip integration
 */
export function FormErrorDisplay({
  error,
  fieldName,
  showAsTooltip = false,
  className,
  showHelp = false,
  helpText,
}: FormErrorDisplayProps) {
  if (!error) {
    if (showHelp && helpText) {
      return (
        <FieldHelpTooltip
          helpText={helpText}
          className={className}
        />
      )
    }
    return null
  }

  // Normalize error to string message
  const errorMessage = typeof error === "string"
    ? error
    : "message" in error
    ? error.message
    : "Wystąpił błąd"

  if (showAsTooltip) {
    return (
      <div className="flex items-center gap-1">
        <FieldHelpTooltip
          helpText={errorMessage}
          icon="info"
          className={cn("text-destructive", className)}
        />
        {showHelp && helpText && (
          <FieldHelpTooltip
            helpText={helpText}
            className={className}
          />
        )}
      </div>
    )
  }

  return (
    <div className={cn("flex items-start gap-2 text-sm text-destructive", className)}>
      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <p>{errorMessage}</p>
        {showHelp && helpText && (
          <FieldHelpTooltip
            helpText={helpText}
            className="ml-1"
          />
        )}
      </div>
    </div>
  )
}

/**
 * Field error display with label
 */
export interface FieldErrorDisplayProps extends FormErrorDisplayProps {
  /**
   * Field label
   */
  label?: string
  
  /**
   * Whether field is required
   */
  required?: boolean
}

export function FieldErrorDisplay({
  label,
  required,
  error,
  ...props
}: FieldErrorDisplayProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <FormErrorDisplay error={error} {...props} />
    </div>
  )
}

/**
 * Form-level error display (for non-field-specific errors)
 */
export interface FormLevelErrorDisplayProps {
  /**
   * Error to display
   */
  error?: AppError | string | null
  
  /**
   * Additional className
   */
  className?: string
}

export function FormLevelErrorDisplay({
  error,
  className,
}: FormLevelErrorDisplayProps) {
  if (!error) return null

  const errorMessage = typeof error === "string"
    ? error
    : error.message

  return (
    <div
      className={cn(
        "rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive",
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-2">
        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium">Błąd formularza</p>
          <p className="mt-1">{errorMessage}</p>
          {typeof error === "object" && "details" in error && error.details && (
            <p className="mt-2 text-xs opacity-80">{error.details}</p>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Inline field error (for use within form fields)
 */
export interface InlineFieldErrorProps {
  error?: string | null
  className?: string
}

export function InlineFieldError({
  error,
  className,
}: InlineFieldErrorProps) {
  if (!error) return null

  return (
    <p className={cn("text-xs text-destructive mt-1", className)}>
      {error}
    </p>
  )
}

