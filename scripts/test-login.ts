import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'; import * as path from 'path'
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) { const t = line.trim(); if (!t || t.startsWith('#')) continue; const i = t.indexOf('='); if (i < 0) continue; if (!process.env[t.slice(0, i).trim()]) process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim() }

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function main() {
  const EMAIL = 'colvin@colvinenterprise.info'
  const PASSWORD = process.argv[2] || 'King32019!!'

  console.log(`Testing login for ${EMAIL}...`)
  console.log(`Password length: ${PASSWORD.length}\n`)

  // 1. Verify user exists via admin
  const { data: list } = await admin.auth.admin.listUsers()
  const u = list?.users?.find(x => x.email?.toLowerCase() === EMAIL.toLowerCase())
  if (!u) { console.log('❌ User does NOT exist in Supabase'); return }
  console.log('✅ User exists')
  console.log('   id:', u.id)
  console.log('   email_confirmed_at:', u.email_confirmed_at || 'NOT CONFIRMED')
  console.log('   banned_until:', u.banned_until || 'no')
  console.log('   last_sign_in:', u.last_sign_in_at || 'never')
  console.log('   created_at:', u.created_at)
  console.log('')

  // 2. Try actual sign-in
  console.log('Attempting password sign-in...')
  const { data, error } = await supabase.auth.signInWithPassword({ email: EMAIL, password: PASSWORD })
  if (error) {
    console.log('❌ Sign-in failed:', error.message)
    console.log('   status:', error.status)
    console.log('   code:', error.code)
    return
  }
  console.log('✅ Sign-in succeeded!')
  console.log('   session token start:', data.session?.access_token?.slice(0, 20) + '...')
}
main().catch(e => { console.error('FAIL:', e.message); process.exit(1) })
