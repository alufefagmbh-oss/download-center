import { createClient } from '@supabase/supabase-js'

// Graceful fallbacks allow the build to succeed; actual calls will fail at runtime
// if env vars are not configured — which is expected behavior.
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co').replace(/\/+$/, '')
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'placeholder'

// Public client — for reading catalog data (uses RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client — bypasses RLS, only used in Server Actions / Server Components
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})
