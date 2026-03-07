import { createClient } from '@supabase/supabase-js'
import { ENV } from '@/lib/env'

export function getSupabaseAdmin() {
  const url = ENV.SUPABASE_URL
  const key = ENV.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase admin not configured')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

