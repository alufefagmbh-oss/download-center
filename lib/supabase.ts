import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co').trim().replace(/\/+$/, '')
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder').trim()
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'placeholder').trim()

// Public client — für Lesezugriff (RLS aktiv)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client — umgeht RLS, nur in Server Actions / Server Components
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})
