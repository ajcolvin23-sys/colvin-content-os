import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import ContentActions from '@/components/content/ContentActions'

export const dynamic = 'force-dynamic'

const LANE_LABELS: Record<string, string> = {
  colvin_enterprises: '⚡ Colvin Enterprises',
  music_theory_secrets: '🎹 Music Theory Secrets',
  indiana_backflow: '💧 Indiana Backflow',
  first_keys_indy: '🏠 First Keys Indy',
  funding_ready_indiana: '💰 Funding Ready',
  piano: '🎹 Piano',
  backflow: '💧 Backflow',
  linkedin: '💼 LinkedIn',
}

const PLATFORM_LABELS: Record<string, string> = {
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  instagram: 'Instagram',
  youtube: 'YouTube',
  multi: 'Multi-platform',
}

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-800 text-gray-400 border border-gray-700',
  needs_review: 'bg-yellow-900/50 text-yellow-300 border border-yellow-700/50',
  approved: 'bg-green-900/50 text-green-300 border border-green-700/50',
  scheduled: 'bg-blue-900/50 text-blue-300 border border-blue-700/50',
  published: 'bg-emerald-900/50 text-emerald-300 border border-emerald-700/50',
  failed: 'bg-red-900/50 text-red-400 border border-red-700/50',
  manual_required: 'bg-orange-900/50 text-orange-300 border border-orange-700/50',
}

const PLATFORM_ICONS: Record<string, string> = {
  linkedin: '💼',
  facebook: '📘',
  tiktok: '🎵',
  instagram: '📸',
  youtube: '▶️',
  multi: '🌐',
}

async function getContentItems(status?: string, lane?: string, platform?: string) {
  const supabase = createAdminClient()
  let query = supabase
    .from('content_items')
    .select('id, lane, platform, content_type, title, hook, body, caption, cta, hashtags, status, katrina_reviewed, generation_model, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(200)

  if (status) query = query.eq('status', status)
  if (lane) query = query.eq('lane', lane)
  if (platform) query = query.eq('platform', platform)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data || []
}

async function getStatusCounts() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('content_items')
    .select('status')
  if (!data) return {}
  const counts: Record<string, number> = {}
  for (const row of data) {
    counts[row.status] = (counts[row.status] || 0) + 1
  }
  return counts
}

const KATRINA_LANES = ['first_keys_indy', 'funding_ready_indiana', 'girls_got_game']

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; lane?: string; platform?: string }>
}) {
  const params = await searchParams
  const { status, lane, platform } = params

  let items: Awaited<ReturnType<typeof getContentItems>> = []
  let statusCounts: Record<string, number> = {}
  let fetchError = ''

  try {
    ;[items, statusCounts] = await Promise.all([
      getContentItems(status, lane, platform),
      getStatusCounts(),
    ])
  } catch (e) {
    fetchError = String(e)
  }

  const statuses = ['draft', 'needs_review', 'approved', 'scheduled', 'published']
  const katinaFlagCount = items.filter(i => KATRINA_LANES.includes(i.lane ?? '') && !i.katrina_reviewed).length
  const totalNeedsReview = statusCounts.needs_review || 0

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Drafts</h1>
          <p className="text-gray-400 text-sm mt-1">
            {items.length} item{items.length !== 1 ? 's' : ''} — Gabriel generates these daily.
            Nothing posts without your approval.
          </p>
        </div>
        <Link
          href="/create"
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          + Create
        </Link>
      </div>

      {/* Safety notice */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-xs text-gray-400 flex items-center gap-2">
        <span className="text-gray-300">🔒</span>
        <span>Auto-publish is disabled. Every draft requires manual approval before anything goes live.</span>
      </div>

      {/* Katrina gate notice */}
      {katinaFlagCount > 0 && (
        <div className="bg-orange-950/30 border border-orange-700/60 rounded-xl px-4 py-3 text-sm text-orange-300 flex items-center gap-2">
          <span>⚠</span>
          <span>{katinaFlagCount} item{katinaFlagCount !== 1 ? 's' : ''} from compliance-gated lanes need Katrina review before use.</span>
        </div>
      )}

      {/* Needs review banner */}
      {totalNeedsReview > 0 && !status && (
        <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="text-yellow-300 text-sm font-semibold">
            {totalNeedsReview} item{totalNeedsReview !== 1 ? 's' : ''} waiting for your review
          </div>
          <Link href="/content?status=needs_review" className="text-xs bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1.5 rounded-lg transition-colors">
            Review Now
          </Link>
        </div>
      )}

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        <Link
          href={lane || platform ? `/content?${lane ? `lane=${lane}` : ''}${platform ? `&platform=${platform}` : ''}` : '/content'}
          className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${!status ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-500'}`}
        >
          All ({Object.values(statusCounts).reduce((a, b) => a + b, 0)})
        </Link>
        {statuses.map(s => {
          const count = statusCounts[s] || 0
          return (
            <Link
              key={s}
              href={`/content?status=${s}${lane ? `&lane=${lane}` : ''}${platform ? `&platform=${platform}` : ''}`}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors capitalize ${status === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-500'}`}
            >
              {s.replace('_', ' ')}
              {count > 0 && (
                <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${s === 'needs_review' ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                  {count}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* Lane filter */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-gray-600 self-center">Lane:</span>
        {Object.entries(LANE_LABELS).map(([key, label]) => (
          <Link
            key={key}
            href={`/content?lane=${key}${status ? `&status=${status}` : ''}`}
            className={`text-xs px-3 py-1 rounded-lg border transition-colors ${lane === key ? 'bg-purple-700 text-white border-purple-600' : 'bg-gray-900 text-gray-500 border-gray-800 hover:border-gray-600'}`}
          >
            {label}
          </Link>
        ))}
        {lane && (
          <Link href={`/content${status ? `?status=${status}` : ''}`} className="text-xs px-3 py-1 rounded-lg border border-gray-700 text-gray-500 hover:border-gray-500 transition-colors">
            Clear ×
          </Link>
        )}
      </div>

      {fetchError && (
        <div className="bg-red-950/30 border border-red-700 rounded-xl p-4 text-red-400 text-sm">
          Error loading content: {fetchError}
        </div>
      )}

      {items.length === 0 && !fetchError && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-500 text-sm">No content found for this filter.</p>
          <p className="text-gray-600 text-xs mt-1">Gabriel generates content drafts during the daily run at 7 AM CST.</p>
          <Link href="/create" className="mt-4 inline-block bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg transition-colors">
            Create manually →
          </Link>
        </div>
      )}

      {/* Content cards */}
      <div className="space-y-4">
        {items.map((item) => {
          const isKatinaGated = KATRINA_LANES.includes(item.lane ?? '')
          const needsKatinaReview = isKatinaGated && !item.katrina_reviewed

          return (
            <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors">
              {/* Header */}
              <div className="px-5 py-4 flex items-start justify-between gap-4 border-b border-gray-800">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg">{PLATFORM_ICONS[item.platform ?? ''] ?? '📄'}</span>
                    <span className="font-semibold text-white text-sm truncate">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded ${STATUS_STYLES[item.status] ?? STATUS_STYLES.draft}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                    {item.platform && (
                      <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                        {PLATFORM_LABELS[item.platform] ?? item.platform}
                      </span>
                    )}
                    {item.content_type && (
                      <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded capitalize">
                        {item.content_type}
                      </span>
                    )}
                    {item.lane && (
                      <span className="text-xs text-gray-600">{LANE_LABELS[item.lane] ?? item.lane}</span>
                    )}
                    {needsKatinaReview && (
                      <span className="text-xs text-orange-400 bg-orange-950/30 border border-orange-700/40 px-2 py-0.5 rounded">
                        ⚠ Katrina review required
                      </span>
                    )}
                    {item.generation_model === 'override' && (
                      <span className="text-xs text-blue-400 bg-blue-950/30 border border-blue-800/40 px-2 py-0.5 rounded">
                        manual save
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-600 shrink-0">
                  {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>

              {/* Content body */}
              <div className="px-5 py-4 space-y-3">
                {item.hook && (
                  <div>
                    <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Hook</div>
                    <p className="text-sm text-white font-medium leading-snug">{item.hook}</p>
                  </div>
                )}
                {item.body && (
                  <div>
                    <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Body</div>
                    <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{item.body}</p>
                  </div>
                )}
                {item.caption && !item.body && (
                  <div>
                    <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Caption</div>
                    <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{item.caption}</p>
                  </div>
                )}
                {item.cta && (
                  <div>
                    <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">CTA</div>
                    <p className="text-sm text-blue-400">{item.cta}</p>
                  </div>
                )}
                {Array.isArray(item.hashtags) && item.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {(item.hashtags as string[]).map((tag) => (
                      <span key={tag} className="text-xs text-blue-500 bg-blue-950/30 px-2 py-0.5 rounded">
                        {tag.startsWith('#') ? tag : `#${tag}`}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="px-5 pb-4">
                <ContentActions
                  itemId={item.id}
                  currentStatus={item.status}
                  lane={item.lane ?? ''}
                  katinaRequired={needsKatinaReview}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
