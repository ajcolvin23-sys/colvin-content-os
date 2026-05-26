'use client'
import { useState, useEffect, useCallback } from 'react'
import type { ContentItem } from '@/types'

// ── Video render state per item ───────────────────────────────────────────────
interface RenderState {
  status: 'idle' | 'rendering' | 'done' | 'error'
  download_url?: string
  file_size_mb?: number
  render_time_s?: number
  error?: string
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-800 text-gray-400',
  needs_review: 'bg-yellow-900 text-yellow-300',
  approved: 'bg-green-900 text-green-300',
  scheduled: 'bg-blue-900 text-blue-300',
  published: 'bg-emerald-900 text-emerald-300',
  failed: 'bg-red-900 text-red-300',
  manual_required: 'bg-orange-900 text-orange-300',
  archived: 'bg-gray-900 text-gray-600',
}

const LANE_ICONS: Record<string, string> = {
  piano: '🎹', backflow: '💧', linkedin: '💼', colvin_enterprises: '⚡',
  music_theory_secrets: '🎹', indiana_backflow: '💧', first_keys_indy: '🏠',
}

// ── Carousel renderer — parses "[Slide N — LABEL]\ntext\n💡 Design: note" ──
function CarouselPreview({ body }: { body: string }) {
  const slides = body.split(/\n\n(?=\[Slide)/).filter(s => s.startsWith('[Slide'))
  const cover = body.match(/\[Cover Caption\]\n([\s\S]+)$/)?.[1]?.trim()
  const SLIDE_COLORS = ['bg-blue-600', 'bg-purple-600', 'bg-indigo-600', 'bg-violet-600', 'bg-fuchsia-600']
  return (
    <div className="space-y-3">
      <div className="flex gap-3 overflow-x-auto pb-2">
        {slides.map((s, i) => {
          const label = s.match(/\[Slide \d+ — (.+?)\]/)?.[1] ?? ''
          const text = s.split('\n').slice(1).find(l => !l.startsWith('💡'))?.trim() ?? ''
          const design = s.match(/💡 Design: (.+)/)?.[1] ?? ''
          return (
            <div key={i} className={`${SLIDE_COLORS[i % SLIDE_COLORS.length]} rounded-xl p-4 min-w-[180px] max-w-[200px] flex-shrink-0 flex flex-col justify-between min-h-[160px]`}>
              <div className="text-xs text-white/60 font-semibold uppercase tracking-wider">{label}</div>
              <div className="text-white font-bold text-sm leading-snug mt-2">{text}</div>
              {design && <div className="text-white/50 text-xs mt-2 italic">{design}</div>}
            </div>
          )
        })}
      </div>
      {cover && <div className="text-xs text-gray-400">📝 Cover caption: {cover}</div>}
    </div>
  )
}

// ── Video script renderer — parses [HOOK] [STORY] [CTA] [ON-SCREEN TEXT] [CAPTION HOOK] ──
function VideoScriptPreview({ body }: { body: string }) {
  const sections = ['HOOK', 'STORY', 'CTA', 'ON-SCREEN TEXT', 'CAPTION HOOK']
  const SECTION_STYLES: Record<string, string> = {
    'HOOK': 'border-l-4 border-yellow-500 bg-yellow-950/40',
    'STORY': 'border-l-4 border-blue-500 bg-blue-950/40',
    'CTA': 'border-l-4 border-green-500 bg-green-950/40',
    'ON-SCREEN TEXT': 'border-l-4 border-purple-500 bg-purple-950/40',
    'CAPTION HOOK': 'border-l-4 border-pink-500 bg-pink-950/40',
  }
  const parsed: { label: string; text: string }[] = []
  for (const section of sections) {
    const match = body.match(new RegExp(`\\[${section}\\][^\\n]*\\n?([\\s\\S]*?)(?=\\n\\[|$)`, 'i'))
    if (match) parsed.push({ label: section, text: match[1].trim() })
  }
  if (parsed.length === 0) return <div className="bg-gray-800 rounded-lg p-3 text-sm text-gray-200 whitespace-pre-wrap">{body}</div>
  return (
    <div className="space-y-2">
      {parsed.map(({ label, text }) => (
        <div key={label} className={`rounded-lg p-3 ${SECTION_STYLES[label] ?? 'bg-gray-800'}`}>
          <div className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1">{label}</div>
          <div className="text-sm text-gray-100 whitespace-pre-wrap">{text}</div>
        </div>
      ))}
    </div>
  )
}

// ── Smart body renderer — picks the right component by content_type ──
function ContentBody({ contentType, body }: { contentType: string; body: string }) {
  if (contentType === 'carousel') return <CarouselPreview body={body} />
  if (contentType === 'video_script') return <VideoScriptPreview body={body} />
  return <div className="bg-gray-800 rounded-lg p-3 text-sm text-gray-200 whitespace-pre-wrap">{body}</div>
}

export default function ApprovalsPage() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [filter, setFilter] = useState('needs_review')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selected, setSelected] = useState<ContentItem | null>(null)
  const [scheduleDate, setScheduleDate] = useState('')
  const [renderStates, setRenderStates] = useState<Record<string, RenderState>>({})

  const triggerRender = async (item: ContentItem) => {
    // Extract video_id from the draft body — looks for "videos/XXXX.json"
    const match = item.body?.match(/videos\/([^\s]+)\.json/)
    const video_id = match?.[1]
    if (!video_id) { alert('No VideoScript JSON found for this item. Re-run Gabriel to regenerate.'); return }
    setRenderStates(s => ({ ...s, [item.id]: { status: 'rendering' } }))
    try {
      const res = await fetch('/api/render-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_id, format: '9:16' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Render failed')
      setRenderStates(s => ({ ...s, [item.id]: {
        status: 'done',
        download_url: data.download_url,
        file_size_mb: data.file_size_mb,
        render_time_s: data.render_time_s,
      }}))
    } catch (e) {
      setRenderStates(s => ({ ...s, [item.id]: { status: 'error', error: String(e) } }))
    }
  }

  const load = useCallback(async () => {
    setLoading(true)
    const params = filter && filter !== 'all' ? `?status=${filter}` : ''
    const res = await fetch(`/api/content${params}`)
    const data = await res.json()
    setItems(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [filter])

  useEffect(() => { load() }, [load])

  const doAction = async (action: string, itemId: string, extra?: Record<string, unknown>) => {
    setActionLoading(itemId + action)
    try {
      await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, content_item_id: itemId, ...extra }),
      })
      await load()
      if (selected?.id === itemId) setSelected(null)
    } finally {
      setActionLoading(null)
    }
  }

  const FILTERS = ['needs_review', 'draft', 'approved', 'scheduled', 'manual_required', 'published', 'all']

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Approval Queue</h1>
        <p className="text-gray-400 text-sm mt-1">Review every item before it goes anywhere. Nothing posts without your approval.</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading && <div className="text-gray-500 text-sm">Loading...</div>}

      {!loading && items.length === 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <div className="text-gray-500 text-sm">No items with status &quot;{filter}&quot;</div>
        </div>
      )}

      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className={`bg-gray-900 border rounded-xl overflow-hidden ${selected?.id === item.id ? 'border-blue-600' : 'border-gray-800'}`}>
            <div className="px-4 py-3 flex items-start gap-3 cursor-pointer hover:bg-gray-800/50"
              onClick={() => setSelected(selected?.id === item.id ? null : item)}>
              <span className="text-lg shrink-0">{LANE_ICONS[item.lane] || '📄'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white text-sm font-medium truncate">{item.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[item.status] || 'bg-gray-800 text-gray-400'}`}>{item.status}</span>
                  <span className="text-xs text-gray-600">{item.platform}</span>
                </div>
                {item.hook && <div className="text-xs text-gray-400 mt-0.5 truncate">{item.hook}</div>}
                <div className="text-xs text-gray-600 mt-0.5">{new Date(item.created_at).toLocaleDateString()}</div>
              </div>
              <div className="flex gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                {item.status !== 'approved' && item.status !== 'published' && (
                  <button onClick={() => doAction('approve', item.id)} disabled={actionLoading === item.id + 'approve'}
                    className="px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white text-xs rounded-lg transition-colors disabled:opacity-50">
                    ✓ Approve
                  </button>
                )}
                {item.status === 'approved' && (
                  <button onClick={() => setSelected(item)}
                    className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white text-xs rounded-lg transition-colors">
                    📅 Schedule
                  </button>
                )}
                <button onClick={() => doAction('reject', item.id)} disabled={actionLoading === item.id + 'reject'}
                  className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded-lg transition-colors disabled:opacity-50">
                  ✕
                </button>
              </div>
            </div>

            {selected?.id === item.id && (
              <div className="border-t border-gray-800 px-4 py-4 space-y-3">
                {item.body && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1 capitalize">{item.content_type?.replace('_', ' ') ?? 'Content'}</div>
                    <ContentBody contentType={item.content_type ?? ''} body={item.body} />
                  </div>
                )}

                {/* ── Render button for video_script items ── */}
                {item.content_type === 'video_script' && (() => {
                  const rs = renderStates[item.id] ?? { status: 'idle' }
                  return (
                    <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🎬</span>
                        <span className="text-sm font-semibold text-white">Remotion Render</span>
                        <span className="text-xs text-gray-500">9:16 vertical — TikTok / Facebook Reel</span>
                      </div>

                      {rs.status === 'idle' && (
                        <button onClick={() => triggerRender(item)}
                          className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white text-sm rounded-lg transition-colors font-medium">
                          🎬 Render MP4
                        </button>
                      )}

                      {rs.status === 'rendering' && (
                        <div className="flex items-center gap-3 text-purple-400 text-sm">
                          <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                          Rendering... this takes 1–3 minutes
                        </div>
                      )}

                      {rs.status === 'done' && rs.download_url && (
                        <div className="space-y-2">
                          <div className="text-xs text-green-400">
                            ✓ Rendered in {rs.render_time_s}s — {rs.file_size_mb} MB
                          </div>
                          <a href={rs.download_url} download
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm rounded-lg transition-colors font-medium">
                            ⬇ Download MP4
                          </a>
                          <div className="text-xs text-gray-500">Save to camera roll → post to TikTok / Facebook</div>
                        </div>
                      )}

                      {rs.status === 'error' && (
                        <div className="space-y-2">
                          <div className="text-xs text-red-400">✗ {rs.error}</div>
                          <button onClick={() => setRenderStates(s => ({ ...s, [item.id]: { status: 'idle' } }))}
                            className="text-xs text-gray-400 hover:text-white underline">
                            Try again
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })()}
                {item.caption && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Caption</div>
                    <div className="bg-gray-800 rounded-lg p-3 text-sm text-gray-200 whitespace-pre-wrap">{item.caption}</div>
                  </div>
                )}
                {item.hashtags?.length > 0 && (
                  <div className="text-xs text-blue-400">{item.hashtags.map(h => `#${h}`).join(' ')}</div>
                )}
                {item.visual_direction && (
                  <div className="text-xs text-gray-500">📷 {item.visual_direction}</div>
                )}

                {item.status === 'approved' && (
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="text-xs text-gray-400 mb-1 block">Schedule date/time</label>
                      <input type="datetime-local" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" />
                    </div>
                    <button onClick={() => doAction('schedule', item.id, { scheduled_at: new Date(scheduleDate).toISOString() })}
                      disabled={!scheduleDate || actionLoading === item.id + 'schedule'}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm rounded-lg transition-colors">
                      Schedule
                    </button>
                    <button onClick={() => doAction('mark_manual', item.id)}
                      className="px-4 py-2 bg-orange-700 hover:bg-orange-600 text-white text-sm rounded-lg transition-colors">
                      Mark Manual
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
