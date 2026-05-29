import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import ContentActions from '@/components/content/ContentActions'

export const dynamic = 'force-dynamic'

const LANE_LABELS: Record<string, string> = {
  colvin_enterprises: 'Colvin Enterprises',
  music_theory_secrets: 'Music Theory Secrets',
  indiana_backflow: 'Indiana Backflow',
  first_keys_indy: 'First Keys Indy',
  funding_ready_indiana: 'Funding Ready',
  piano: 'Piano',
  backflow: 'Backflow',
  linkedin: 'LinkedIn',
}

const STATUS_COLOR: Record<string, string> = {
  draft: 'var(--text-muted)',
  needs_review: 'var(--state-warning)',
  approved: 'var(--state-success)',
  scheduled: 'var(--accent)',
  published: 'var(--state-success)',
  failed: 'var(--state-danger)',
  manual_required: 'var(--state-warning)',
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
  const { data } = await supabase.from('content_items').select('status')
  if (!data) return {}
  const counts: Record<string, number> = {}
  for (const row of data) counts[row.status] = (counts[row.status] || 0) + 1
  return counts
}

const KATRINA_LANES = ['first_keys_indy', 'funding_ready_indiana', 'girls_got_game']

export default async function ContentPage({
  searchParams,
}: { searchParams: Promise<{ status?: string; lane?: string; platform?: string }> }) {
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
  } catch (e) { fetchError = String(e) }

  const statuses = ['draft', 'needs_review', 'approved', 'scheduled', 'published']
  const katrinaFlagCount = items.filter(i => KATRINA_LANES.includes(i.lane ?? '') && !i.katrina_reviewed).length
  const totalNeedsReview = statusCounts.needs_review || 0

  return (
    <div className="min-h-screen">
      <div className="px-10 pt-10 pb-6">
        <div className="max-w-5xl">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Content</h1>
              <p className="text-[13px] mt-1" style={{ color: 'var(--text-body)' }}>
                {items.length} item{items.length === 1 ? '' : 's'} · drafts only — nothing posts without your approval
              </p>
            </div>
            <Link href="/create" className="text-[12px] px-3 py-1.5 rounded transition-colors" style={{ color: 'var(--text-primary)', background: 'var(--bg-elevated)' }}>
              + Create
            </Link>
          </div>

          {/* Filter chips */}
          <div className="flex gap-1 mt-5 flex-wrap">
            <Link href={lane || platform ? `/content?${lane ? `lane=${lane}` : ''}${platform ? `&platform=${platform}` : ''}` : '/content'}
              className="text-[12px] px-2.5 py-1 rounded"
              style={{ color: !status ? 'var(--text-primary)' : 'var(--text-body)', background: !status ? 'var(--bg-elevated)' : 'var(--bg-panel)' }}>
              All
            </Link>
            {statuses.map(s => {
              const count = statusCounts[s] || 0
              return (
                <Link key={s} href={`/content?status=${s}${lane ? `&lane=${lane}` : ''}${platform ? `&platform=${platform}` : ''}`}
                  className="text-[12px] px-2.5 py-1 rounded capitalize"
                  style={{ color: status === s ? 'var(--text-primary)' : 'var(--text-body)', background: status === s ? 'var(--bg-elevated)' : 'var(--bg-panel)' }}>
                  {s.replace('_', ' ')}{count > 0 && <span className="ml-1.5" style={{ color: 'var(--text-muted)' }}>{count}</span>}
                </Link>
              )
            })}
          </div>

          {/* Lane chips */}
          <div className="flex gap-1 mt-2 flex-wrap items-center">
            <span className="text-[11px] mr-1" style={{ color: 'var(--text-muted)' }}>Lane:</span>
            {Object.entries(LANE_LABELS).map(([key, label]) => (
              <Link key={key} href={`/content?lane=${key}${status ? `&status=${status}` : ''}`}
                className="text-[12px] px-2.5 py-1 rounded"
                style={{ color: lane === key ? 'var(--text-primary)' : 'var(--text-body)', background: lane === key ? 'var(--bg-elevated)' : 'var(--bg-panel)' }}>
                {label}
              </Link>
            ))}
            {lane && (
              <Link href={`/content${status ? `?status=${status}` : ''}`} className="text-[11px] px-2.5 py-1" style={{ color: 'var(--text-muted)' }}>
                Clear ×
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="px-10 pb-12">
        <div className="max-w-5xl space-y-3">
          {/* Compliance banners */}
          {katrinaFlagCount > 0 && (
            <div className="rounded px-4 py-3 text-[12px]" style={{ background: 'var(--bg-panel)', borderLeft: '2px solid var(--state-warning)', color: 'var(--state-warning)' }}>
              {katrinaFlagCount} item{katrinaFlagCount === 1 ? '' : 's'} from compliance-gated lanes need Katrina review
            </div>
          )}
          {totalNeedsReview > 0 && !status && (
            <div className="flex items-center justify-between rounded px-4 py-3" style={{ background: 'var(--bg-panel)', borderLeft: '2px solid var(--state-warning)' }}>
              <span className="text-[13px]" style={{ color: 'var(--text-primary)' }}>
                {totalNeedsReview} item{totalNeedsReview === 1 ? '' : 's'} waiting for review
              </span>
              <Link href="/content?status=needs_review" className="text-[11px]" style={{ color: 'var(--accent)' }}>
                Review now →
              </Link>
            </div>
          )}

          {fetchError && (
            <div className="rounded px-4 py-3 text-[13px]" style={{ color: 'var(--state-danger)', background: 'rgba(248, 113, 113, 0.05)' }}>
              Error loading content: {fetchError}
            </div>
          )}

          {items.length === 0 && !fetchError ? (
            <div className="py-12 text-center text-[13px]" style={{ color: 'var(--text-dim)' }}>
              No content for this filter — Gabriel adds drafts each morning at 7 AM CST
            </div>
          ) : (
            <div className="space-y-1">
              {items.map(item => {
                const isKatrinaGated = KATRINA_LANES.includes(item.lane ?? '')
                const needsKatrinaReview = isKatrinaGated && !item.katrina_reviewed
                return (
                  <div key={item.id} className="rounded p-4" style={{ background: 'var(--bg-panel)' }}>
                    <div className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: STATUS_COLOR[item.status] ?? 'var(--text-muted)' }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-3 flex-wrap">
                          <h3 className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                          <span className="text-[11px]" style={{ color: STATUS_COLOR[item.status] ?? 'var(--text-muted)' }}>
                            {item.status.replace('_', ' ')}
                          </span>
                          {item.platform && <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{item.platform}</span>}
                          {item.lane && <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{LANE_LABELS[item.lane] ?? item.lane}</span>}
                          {needsKatrinaReview && (
                            <span className="text-[10px]" style={{ color: 'var(--state-warning)' }}>Katrina review</span>
                          )}
                          <span className="text-[10px] ml-auto" style={{ color: 'var(--text-dim)' }}>
                            {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>

                        {item.hook && (
                          <p className="text-[13px] mt-2 font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>{item.hook}</p>
                        )}
                        {item.body && (
                          <p className="text-[12px] mt-2 leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-body)' }}>{item.body}</p>
                        )}
                        {item.caption && !item.body && (
                          <p className="text-[12px] mt-2 leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-body)' }}>{item.caption}</p>
                        )}
                        {item.cta && (
                          <p className="text-[12px] mt-2" style={{ color: 'var(--accent)' }}>→ {item.cta}</p>
                        )}
                        {Array.isArray(item.hashtags) && item.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-x-3 mt-2">
                            {(item.hashtags as string[]).map(tag => (
                              <span key={tag} className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
                                {tag.startsWith('#') ? tag : `#${tag}`}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="mt-3">
                          <ContentActions
                            itemId={item.id}
                            currentStatus={item.status}
                            lane={item.lane ?? ''}
                            katinaRequired={needsKatrinaReview}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
