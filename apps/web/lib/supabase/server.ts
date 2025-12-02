/**
 * Supabase server utilities for Server Components and Route Handlers
 */

import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerSupabase } from './client'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

/**
 * Create Supabase client for Server Components
 * Uses service role key for server-side operations
 */
export async function createServerComponentClient() {
  // For server components, use service role key for direct database access
  return createServerSupabase()
}

/**
 * Get authenticated user in Server Component
 */
export async function getServerUser() {
  const supabase = await createServerComponentClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  return user
}

/**
 * Get user's company ID in Server Component
 */
export async function getServerCompanyId(): Promise<string | null> {
  const user = await getServerUser()
  if (!user) return null

  const supabase = createServerSupabase()
  const { data, error } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    return null
  }

  return data.company_id
}

