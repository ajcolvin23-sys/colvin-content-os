import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim(); if (!t || t.startsWith('#')) continue
    const i = t.indexOf('='); if (i < 0) continue
    if (!process.env[t.slice(0, i).trim()]) process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim()
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const EMAIL = process.argv[2]
const PASSWORD = process.argv[3]

if (!EMAIL || !PASSWORD) {
  console.error('Usage: create-admin-user.ts <email> <password>')
  process.exit(1)
}

async function main() {
  // Check if user already exists
  const { data: existingList } = await supabase.auth.admin.listUsers()
  const existing = existingList?.users?.find(u => u.email?.toLowerCase() === EMAIL.toLowerCase())

  if (existing) {
    console.log(`User ${EMAIL} already exists (id=${existing.id}). Updating password instead...`)
    const { error } = await supabase.auth.admin.updateUserById(existing.id, {
      password: PASSWORD,
      email_confirm: true,
    })
    if (error) { console.error('Password update failed:', error.message); process.exit(1) }
    console.log(`✅ Password reset for ${EMAIL}`)
    console.log(`   User id: ${existing.id}`)
    return
  }

  // Create new user
  const { data, error } = await supabase.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { role: 'owner', created_by: 'admin-script' },
  })

  if (error) { console.error('User creation failed:', error.message); process.exit(1) }
  console.log(`✅ User created: ${EMAIL}`)
  console.log(`   User id: ${data.user?.id}`)
  console.log(`   Confirmed: ${data.user?.email_confirmed_at ? 'yes' : 'no'}`)
}

main().catch(e => { console.error('FAIL:', e.message); process.exit(1) })
