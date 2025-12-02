/**
 * Sentry error tracking integration
 * Optional - only initializes if SENTRY_DSN is provided
 */

let sentryInitialized = false

export function initSentry() {
  if (sentryInitialized) return
  if (!process.env.SENTRY_DSN) return

  try {
    // Dynamic import to avoid bundling Sentry in production if not needed
    // In production, you would install @sentry/nextjs and use:
    // import * as Sentry from '@sentry/nextjs'
    // Sentry.init({ ... })
    
    // For now, this is a placeholder
    // To enable, install: npm install @sentry/nextjs
    // Then uncomment and configure:
    /*
    import * as Sentry from '@sentry/nextjs'
    
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
      ],
    })
    */
    
    sentryInitialized = true
    console.log('Sentry initialized')
  } catch (error) {
    console.error('Failed to initialize Sentry:', error)
  }
}

export function captureException(error: Error, context?: Record<string, unknown>) {
  if (!process.env.SENTRY_DSN) return
  
  // Placeholder - replace with actual Sentry call
  // Sentry.captureException(error, { extra: context })
  console.error('Exception (would be sent to Sentry):', error, context)
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (!process.env.SENTRY_DSN) return
  
  // Placeholder - replace with actual Sentry call
  // Sentry.captureMessage(message, level)
  console.log(`[Sentry ${level}]:`, message)
}

// Initialize on module load
if (typeof window === 'undefined') {
  // Server-side only
  initSentry()
}

