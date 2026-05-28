/**
 * /settings/social — Connect TikTok and Facebook accounts
 */
import { createAdminClient } from '@/lib/supabase/admin'
import SocialConnectClient from './SocialConnectClient'

export const dynamic = 'force-dynamic'

export default async function SocialSettingsPage() {
  const supabase = createAdminClient()
  const { data: tokens } = await supabase
    .from('platform_tokens')
    .select('platform, account_name, account_id, updated_at')

  const connected: Record<string, { account_name: string; updated_at: string }> = {}
  for (const t of tokens ?? []) {
    connected[t.platform] = { account_name: t.account_name, updated_at: t.updated_at }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Social Accounts</h1>
        <p style={{ color: '#666', marginBottom: 40, fontSize: 16 }}>
          Connect your accounts so Gabriel can publish videos directly.
        </p>
        <SocialConnectClient connected={connected} />
      </div>
    </div>
  )
}
