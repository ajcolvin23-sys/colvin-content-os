'use client'
import { useState, useEffect, useCallback } from 'react'
import type { ContentItem } from '@/types'

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
}

export default function ApprovalsPage() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [filter, setFilter] = useState('needs_review')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selected, setSelected] = useState<ContentItem | null>(null)
  const [scheduleDate, setScheduleDate] = useState('')

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
                    <div className="text-xs text-gray-500 mb-1">Body</div>
                    <div className="bg-gray-800 rounded-lg p-3 text-sm text-gray-200 whitespace-pre-wrap">{item.body}</div>
                  </div>
                )}
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
