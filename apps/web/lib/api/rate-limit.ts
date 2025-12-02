/**
 * Simple in-memory rate limiting (for MVP)
 * For production, use Redis-based rate limiting
 */

interface RateLimitStore {
  [key: string]: {
    count: number
    resetAt: number
  }
}

const store: RateLimitStore = {}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  keyGenerator?: (request: Request) => string
}

const defaultKeyGenerator = (request: Request): string => {
  const url = new URL(request.url)
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  return `${ip}:${url.pathname}`
}

/**
 * Check rate limit
 */
export function checkRateLimit(
  request: Request,
  config: RateLimitConfig = { maxRequests: 100, windowMs: 60000 }
): { allowed: boolean; remaining: number; resetAt: number } {
  const key = config.keyGenerator ? config.keyGenerator(request) : defaultKeyGenerator(request)
  const now = Date.now()
  
  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    for (const [k, v] of Object.entries(store)) {
      if (v.resetAt < now) {
        delete store[k]
      }
    }
  }

  const entry = store[key]
  
  if (!entry || entry.resetAt < now) {
    // New window
    store[key] = {
      count: 1,
      resetAt: now + config.windowMs,
    }
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: now + config.windowMs,
    }
  }

  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    }
  }

  entry.count++
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  }
}

/**
 * Rate limit middleware for Next.js App Router
 */
export function withRateLimit<T extends Request = Request>(
  handler: (request: T, ...args: any[]) => Promise<Response>,
  config?: RateLimitConfig
) {
  return async (request: T, ...args: any[]): Promise<Response> => {
    const limit = checkRateLimit(request, config)
    
    if (!limit.allowed) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please try again later.',
          },
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': String(config?.maxRequests || 100),
            'X-RateLimit-Remaining': String(limit.remaining),
            'X-RateLimit-Reset': String(Math.ceil(limit.resetAt / 1000)),
            'Retry-After': String(Math.ceil((limit.resetAt - Date.now()) / 1000)),
          },
        }
      )
    }

    const response = await handler(request, ...args)
    
    // Add rate limit headers to response
    response.headers.set('X-RateLimit-Limit', String(config?.maxRequests || 100))
    response.headers.set('X-RateLimit-Remaining', String(limit.remaining))
    response.headers.set('X-RateLimit-Reset', String(Math.ceil(limit.resetAt / 1000)))
    
    return response
  }
}

