'use client'
import { useState, useEffect, useCallback } from 'react'

const PLATFORM_ICONS: Record<string, string> = {
  tiktok: '🎵', youtube: '▶️', facebook: '📘', linkedin: '💼', instagram: '📷',
}

const PLATFORM_COLORS: Record<string, string> = {
  tiktok: 'border-pink-500 bg-pink-950/20',
  youtube: 'border-red-500 bg-red-950/20',
  facebook: 'border-blue-500 bg-blue-950/20',
  linkedin: 'border-sky-500 bg-sky-950/20',
  instagram: 'border-purple-500 bg-purple-950/20',
}

type ContentItem = {
  id: string
  title: string
  platform: string
  lane: string
  status: string
  hook?: string
  body?: string
  caption?: string
  cta?: string
  hashtags?: string[]
  visual_direction?: string
  scheduled_at?: string
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback for older mobile browsers
      const el = document.createElement('textarea')
      el.value = text
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  return (
    <button
      onClick={copy}
      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
        copied
          ? 'bg-emerald-600 text-white'
          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
      }`}
    >
      {copied ? '✓ Copied!' : `Copy ${label}`}
    </button>
  )
}

function CopyBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">{label}</span>
        <CopyButton text={value} label={label} />
      </div>
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-gray-200 whitespace-pre-wrap leading-relaxed select-all">
        {value}
      </div>
    </div>
  )
}

function PostCard({ item, onMarkPosted }: { item: ContentItem; onMarkPosted: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [marking, setMarking] = useState(false)

  // Build the full post text (caption or body, + hashtags)
  const mainText = item.caption || item.body || item.hook || ''
  const hashtagText = item.hashtags?.length
    ? item.hashtags.map((h: string) => (h.startsWith('#') ? h : `#${h}`)).join(' ')
    : ''
  const fullPostText = [mainText, hashtagText].filter(Boolean).join('\n\n')

  const markPosted = async () => {
    setMarking(true)
    try {
      await fetch(`/api/content/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'published', published_at: new Date().toISOString() }),
      })
      onMarkPosted(item.id)
    } finally {
      setMarking(false)
    }
  }

  return (
    <div className={`border-l-4 border border-gray-800 rounded-xl overflow-hidden ${PLATFORM_COLORS[item.platform] || 'border-l-gray-600 bg-gray-900'}`}>
      {/* Header */}
      <div
        className="p-4 cursor-pointer flex items-start gap-3"
        onClick={() => setExpanded(e => !e)}
      >
        <span className="text-2xl shrink-0 mt-0.5">{PLATFORM_ICONS[item.platform] || '📄'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-semibold text-sm capitalize">{item.platform}</span>
            <span className="text-xs text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded">{item.lane?.replace('_', ' ')}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${
              item.status === 'approved' ? 'bg-green-900 text-green-300' :
              item.status === 'scheduled' ? 'bg-blue-900 text-blue-300' :
              'bg-orange-900 text-orange-300'
            }`}>{item.status}</span>
          </div>
          <div className="text-gray-300 text-sm mt-1 line-clamp-2">{item.title}</div>
          {item.scheduled_at && (
            <div className="text-xs text-gray-500 mt-1">
              📅 {new Date(item.scheduled_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              {' '}at {new Date(item.scheduled_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </div>
          )}
        </div>
        <span className="text-gray-500 text-sm shrink-0">{expanded ? '▲' : '▼'}</span>
      </div>

      {/* Expanded copy area */}
      {expanded && (
        <div className="border-t border-gray-800 p-4 space-y-4">

          {/* Visual direction — first so he knows what to film */}
          {item.visual_direction && (
            <div className="bg-yellow-950/40 border border-yellow-700/40 rounded-lg p-3 space-y-1">
              <div className="text-xs text-yellow-500 uppercase tracking-wide font-medium">🎬 Visual Direction</div>
              <div className="text-sm text-yellow-200">{item.visual_direction}</div>
            </div>
          )}

          {/* Hook — separate copy if it exists */}
          {item.hook && item.hook !== item.caption && item.hook !== item.body && (
            <CopyBlock label="Hook" value={item.hook} />
          )}

          {/* Full post (caption/body + hashtags together — one tap to copy everything) */}
          {fullPostText && (
            <CopyBlock label="Full Post" value={fullPostText} />
          )}

          {/* CTA — separate in case they want it in comments */}
          {item.cta && (
            <CopyBlock label="CTA" value={item.cta} />
          )}

          {/* Hashtags standalone */}
          {hashtagText && (
            <CopyBlock label="Hashtags Only" value={hashtagText} />
          )}

          {/* Mark as posted */}
          <div className="pt-2 border-t border-gray-800 flex gap-3">
            <button
              onClick={markPosted}
              disabled={marking}
              className="flex-1 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
            >
              {marking ? 'Saving...' : '✓ Mark as Posted'}
            </button>
            <a
              href={
                item.platform === 'tiktok' ? 'https://www.tiktok.com/upload' :
                item.platform === 'youtube' ? 'https://studio.youtube.com' :
                item.platform === 'facebook' ? 'https://www.facebook.com/IndianaBackflowDirectory' :
                item.platform === 'linkedin' ? 'https://www.linkedin.com/feed/' :
                item.platform === 'instagram' ? 'https://www.instagram.com' :
                '#'
              }
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm rounded-lg transition-colors whitespace-nowrap"
            >
              Open {item.platform} →
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default function PostQueuePage() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filter !== 'all') params.set('platform', filter)
    const res = await fetch(`/api/content?status=approved&${params}`)
    const data = await res.json()
    // Also fetch scheduled + manual_required
    const res2 = await fetch(`/api/content?status=scheduled&${params}`)
    const data2 = await res2.json()
    const res3 = await fetch(`/api/content?status=manual_required&${params}`)
    const data3 = await res3.json()

    const all = [...(data.items || []), ...(data2.items || []), ...(data3.items || [])]
    // Sort: scheduled first (by date), then approved, then manual_required
    all.sort((a, b) => {
      if (a.scheduled_at && b.scheduled_at) return new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
      if (a.scheduled_at) return -1
      if (b.scheduled_at) return 1
      return 0
    })
    setItems(all)
    setLoading(false)
  }, [filter])

  useEffect(() => { load() }, [load])

  const handleMarkPosted = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const platforms = ['all', 'tiktok', 'youtube', 'facebook', 'linkedin', 'instagram']

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">📱 Post Queue</h1>
        <p className="text-gray-400 text-sm mt-1">
          Copy content, paste to platform, tap "Mark as Posted." {items.length > 0 ? `${items.length} ready.` : ''}
        </p>
      </div>

      {/* Platform filter */}
      <div className="flex gap-2 flex-wrap">
        {platforms.map(p => (
          <button
            key={p}
            onClick={() => setFilter(p)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === p ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {p === 'all' ? 'All platforms' : `${PLATFORM_ICONS[p] || ''} ${p}`}
          </button>
        ))}
      </div>

      {loading && (
        <div className="text-gray-500 text-sm">Loading queue...</div>
      )}

      {!loading && items.length === 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
          <div className="text-4xl mb-3">✅</div>
          <div className="text-gray-400 text-sm">Nothing queued up. Create and approve content first.</div>
        </div>
      )}

      <div className="space-y-3">
        {items.map(item => (
          <PostCard key={item.id} item={item} onMarkPosted={handleMarkPosted} />
        ))}
      </div>
    </div>
  )
}
