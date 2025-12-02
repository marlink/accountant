/**
 * Health check endpoint for monitoring and load balancers
 */

import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/client'

export async function GET() {
  try {
    // Check database connection
    const supabase = createServerSupabase()
    const { error } = await supabase.from('companies').select('id').limit(1)
    
    if (error) {
      return NextResponse.json(
        {
          status: 'unhealthy',
          database: 'disconnected',
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      )
    }

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}

