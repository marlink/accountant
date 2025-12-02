/**
 * API client with error interception and toast integration
 */

import { AppError } from "@/lib/errors/types"
import { parseApiError, handleNetworkError, transformError } from "@/lib/errors/handler"
import { handleErrorWithToast, shouldShowErrorAsToast } from "@/lib/errors/toast-integration"
import { StandardApiResponse } from "@/lib/errors/api-middleware"

export interface ApiClientConfig {
  baseUrl?: string
  headers?: Record<string, string>
  autoShowToasts?: boolean
  timeout?: number
}

export interface RequestOptions extends RequestInit {
  skipErrorToast?: boolean
  skipErrorHandling?: boolean
}

/**
 * API client class with error handling and toast integration
 */
export class ApiClient {
  private baseUrl: string
  private defaultHeaders: Record<string, string>
  private autoShowToasts: boolean
  private timeout: number

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl || (typeof window !== "undefined" ? window.location.origin : "")
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...config.headers,
    }
    this.autoShowToasts = config.autoShowToasts ?? true
    this.timeout = config.timeout || 30000
  }

  /**
   * Make a request with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      skipErrorToast = false,
      skipErrorHandling = false,
      headers = {},
      ...fetchOptions
    } = options

    const url = endpoint.startsWith("http") ? endpoint : `${this.baseUrl}${endpoint}`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          ...this.defaultHeaders,
          ...headers,
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Handle non-OK responses
      if (!response.ok) {
        let body: unknown
        try {
          body = await response.json()
        } catch {
          body = await response.text()
        }

        const error = parseApiError(response, body)

        // Show toast if enabled and not skipped
        if (this.autoShowToasts && !skipErrorToast && !skipErrorHandling) {
          if (shouldShowErrorAsToast(error)) {
            handleErrorWithToast(error)
          }
        }

        if (skipErrorHandling) {
          throw error
        }

        throw error
      }

      // Parse response
      const contentType = response.headers.get("content-type")
      if (contentType?.includes("application/json")) {
        const data = await response.json()
        
        // Handle standardized API response format
        if (data && typeof data === "object" && "success" in data) {
          const apiResponse = data as StandardApiResponse<T>
          if (apiResponse.success) {
            return apiResponse.data
          } else {
            const error = transformError(apiResponse.error)
            if (this.autoShowToasts && !skipErrorToast && !skipErrorHandling) {
              if (shouldShowErrorAsToast(error)) {
                handleErrorWithToast(error)
              }
            }
            throw error
          }
        }
        
        return data
      }

      return (await response.text()) as unknown as T
    } catch (error) {
      clearTimeout(timeoutId)

      // Handle network errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        const networkError = handleNetworkError(error)
        if (this.autoShowToasts && !skipErrorToast && !skipErrorHandling) {
          handleErrorWithToast(networkError)
        }
        if (!skipErrorHandling) {
          throw networkError
        }
      }

      // Handle abort (timeout)
      if (error instanceof Error && error.name === "AbortError") {
        const timeoutError = transformError(error, { context: { timeout: this.timeout } })
        timeoutError.message = "Przekroczono limit czasu połączenia"
        if (this.autoShowToasts && !skipErrorToast && !skipErrorHandling) {
          handleErrorWithToast(timeoutError)
        }
        if (!skipErrorHandling) {
          throw timeoutError
        }
      }

      // Re-throw if error handling is skipped or if it's already an AppError
      if (skipErrorHandling || error instanceof Error && "code" in error) {
        throw error
      }

      // Transform unknown errors
      const appError = transformError(error)
      if (this.autoShowToasts && !skipErrorToast && !skipErrorHandling) {
        handleErrorWithToast(appError)
      }
      throw appError
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "GET",
    })
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "DELETE",
    })
  }

  /**
   * Set default header
   */
  setHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value
  }

  /**
   * Remove default header
   */
  removeHeader(key: string): void {
    delete this.defaultHeaders[key]
  }
}

/**
 * Default API client instance
 */
export const apiClient = new ApiClient({
  autoShowToasts: true,
})

/**
 * Create a new API client instance with custom config
 */
export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config)
}

