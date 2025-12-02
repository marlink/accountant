/**
 * Supabase client for browser-side operations
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required')
}

/**
 * Browser client for client components
 */
export const createClientSupabase = () => {
  return createClient(supabaseUrl, supabaseAnonKey)
}

/**
 * Server-side client with service role key (for admin operations)
 */
export const createServerSupabase = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY for server-side operations')
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

/**
 * Get authenticated user's company ID from profile
 */
export async function getUserCompanyId(userId: string): Promise<string | null> {
  const supabase = createServerSupabase()
  const { data, error } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return null
  }

  return data.company_id
}

/**
 * Check if user has access to company
 */
export async function hasCompanyAccess(userId: string, companyId: string): Promise<boolean> {
  const supabase = createServerSupabase()
  const { data, error } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('user_id', userId)
    .eq('company_id', companyId)
    .single()

  return !error && !!data
}

