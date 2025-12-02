"use client"

import * as React from "react"
import { AppError } from "@/lib/errors/types"
import { transformError, logError } from "@/lib/errors/handler"
import { handleErrorWithToast } from "@/lib/errors/toast-integration"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorBoundaryState>
  onError?: (error: AppError) => void
}

interface ErrorBoundaryState {
  error: AppError | null
  hasError: boolean
}

/**
 * React Error Boundary component for catching component errors
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      error: null,
      hasError: false,
    }
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    const appError = transformError(error, {
      component: "ErrorBoundary",
    })

    return {
      error: appError,
      hasError: true,
    }
  }

  componentDidCatch(error: unknown, errorInfo: React.ErrorInfo) {
    const appError = transformError(error, {
      component: "ErrorBoundary",
      errorInfo: errorInfo.componentStack,
    })

    // Log the error
    logError(appError, {
      componentStack: errorInfo.componentStack,
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(appError)
    } else {
      // Default: show toast notification
      handleErrorWithToast(appError)
    }

    this.setState({
      error: appError,
      hasError: true,
    })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error} hasError={true} />
    }

    return this.props.children
  }
}

/**
 * Default error fallback component
 */
function DefaultErrorFallback({ error }: ErrorBoundaryState) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
      <div className="max-w-md text-center">
        <h2 className="text-2xl font-bold text-destructive mb-4">
          Wystąpił błąd
        </h2>
        <p className="text-muted-foreground mb-4">
          {error?.message || "Wystąpił nieoczekiwany błąd"}
        </p>
        {error?.details && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground">
              Szczegóły błędu
            </summary>
            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
              {error.details}
            </pre>
          </details>
        )}
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Odśwież stronę
        </button>
      </div>
    </div>
  )
}

/**
 * Hook-based error boundary for functional components
 * Note: This is a workaround as React doesn't support hooks in error boundaries
 * Use the class component ErrorBoundary for production
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<AppError | null>(null)

  React.useEffect(() => {
    if (error) {
      handleErrorWithToast(error)
      setError(null) // Reset after handling
    }
  }, [error])

  return React.useCallback((error: unknown) => {
    const appError = transformError(error)
    setError(appError)
  }, [])
}

