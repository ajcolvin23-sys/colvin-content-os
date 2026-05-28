import { createAdminClient } from '@/lib/supabase/admin'
import type { PlatformAccount } from '@/types'

export const dynamic = 'force-dynamic'

const PLATFORM_INFO = {
  tiktok: { label: 'TikTok', icon: '🎵', env: 'TIKTOK_CLIENT_KEY', note: 'Requires TikTok for Developers app approval. Use Content Posting API for draft/publish.' },
  youtube: { label: 'YouTube', icon: '▶️', env: 'YOUTUBE_CLIENT_ID', note: 'YouTube Data API v3 — OAuth 2.0 required. Videos default to private until approved.' },
  facebook: { label: 'Facebook', icon: '📘', env: 'FACEBOOK_APP_ID', note: 'Meta Graph API — Page access token required. Auto-publish available for pages.' },
  linkedin: { label: 'LinkedIn', icon: '💼', env: 'LINKEDIN_CLIENT_ID', note: 'LinkedIn Posts API — requires Marketing Developer Platform access.' },
  instagram: { label: 'Instagram', icon: '📷', env: 'FACEBOOK_APP_ID', note: 'Uses Meta Graph API. Requires Facebook Business page linked to Instagram.' },
}

export default async function SettingsPage() {
  const supabase = createAdminClient()
  const { data: accounts } = await supabase.from('platform_accounts').select('*').order('platform')
  const { data: schedule } = await supabase.from('schedule_config').select('*').order('platform')

  const platformAccounts: PlatformAccount[] = accounts || []
  const scheduleConfig = schedule || []

  const envStatus = {
    tiktok: !!(process.env.TIKTOK_CLIENT_KEY),
    youtube: !!(process.env.YOUTUBE_CLIENT_ID),
    facebook: !!(process.env.FACEBOOK_APP_ID),
    linkedin: !!(process.env.LINKEDIN_CLIENT_ID),
    instagram: !!(process.env.FACEBOOK_APP_ID),
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Platform connections, posting schedule, and system config.</p>
      </div>

      {/* Platform Accounts */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white">Platform Accounts</h2>
        <div className="space-y-3">
          {(Object.entries(PLATFORM_INFO) as Array<[keyof typeof PLATFORM_INFO, (typeof PLATFORM_INFO)[keyof typeof PLATFORM_INFO]]>).map(([platform, info]) => {
            const account = platformAccounts.find(a => a.platform === platform)
            const hasEnv = envStatus[platform]
            return (
              <div key={platform} className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
                <span className="text-xl shrink-0">{info.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium">{info.label}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${account ? 'bg-emerald-900 text-emerald-300' : 'bg-gray-700 text-gray-500'}`}>
                      {account ? `${account.oauth_status}` : 'not connected'}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${hasEnv ? 'bg-green-900 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                      {hasEnv ? 'env ✓' : 'env missing'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{info.note}</div>
                  <div className="text-xs text-gray-700 mt-0.5">Env var: {info.env}</div>
                  {account?.auto_publish && (
                    <div className="text-xs text-orange-400 mt-1">⚠️ Auto-publish ENABLED — posts will go live automatically when scheduled</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <p className="text-xs text-gray-600">To connect accounts: add credentials to .env.local, then create a platform_account record in Supabase with oauth_status=connected.</p>
      </div>

      {/* Posting Schedule */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white">Default Posting Schedule</h2>
        <div className="space-y-2">
          {scheduleConfig.map((s: Record<string, unknown>) => (
            <div key={String(s.id)} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg text-sm">
              <span className={`w-2 h-2 rounded-full ${s.is_active ? 'bg-emerald-400' : 'bg-gray-600'}`} />
              <span className="text-white capitalize">{String(s.platform)}</span>
              <span className="text-gray-500">{String(s.lane || '').replace('_', ' ')}</span>
              <span className="text-gray-400 ml-auto">{String(s.post_slot)} · {String(s.post_time_utc)} UTC</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600">Edit schedule in Supabase: schedule_config table. Days: 0=Sun, 1=Mon ... 6=Sat.</p>
      </div>

      {/* Environment Variables */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-3">
        <h2 className="text-sm font-semibold text-white">Required Environment Variables</h2>
        <div className="space-y-1 font-mono text-xs">
          {[
            ['NEXT_PUBLIC_SUPABASE_URL', true],
            ['NEXT_PUBLIC_SUPABASE_ANON_KEY', true],
            ['SUPABASE_SERVICE_ROLE_KEY', true],
            ['OPENAI_API_KEY', true],
            ['CRON_SECRET', true],
            ['TIKTOK_CLIENT_KEY', false],
            ['TIKTOK_CLIENT_SECRET', false],
            ['YOUTUBE_CLIENT_ID', false],
            ['YOUTUBE_CLIENT_SECRET', false],
            ['FACEBOOK_APP_ID', false],
            ['FACEBOOK_PAGE_ACCESS_TOKEN', false],
            ['FACEBOOK_PAGE_ID', false],
            ['LINKEDIN_CLIENT_ID', false],
            ['LINKEDIN_ACCESS_TOKEN', false],
          ].map(([key, required]) => (
            <div key={String(key)} className="flex items-center gap-2">
              <span className={required ? 'text-red-400' : 'text-gray-600'}>
                {required ? '* ' : '  '}
              </span>
              <span className="text-gray-400">{String(key)}</span>
              <span className={`ml-auto ${required ? 'text-yellow-600' : 'text-gray-700'}`}>
                {required ? 'required' : 'optional'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
