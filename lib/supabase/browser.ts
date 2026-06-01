import { createBrowserClient } from '@supabase/ssr'

// Client-side only — safe to use in 'use client' components.
// flowType 'pkce' makes email magic links come back as ?code= (which the server
// /auth/callback route can read), instead of the implicit #access_token hash
// fragment that never reaches the server. Without this, magic-link login bounces
// to /login?error=auth_callback_failed every time.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { flowType: 'pkce' } }
  )
}
