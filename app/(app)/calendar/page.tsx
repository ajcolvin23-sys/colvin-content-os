import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import type { ContentItem } from '@/types'

export const dynamic = 'force-dynamic'

const STATUS_COLORS: Record<string, string> = {
  draft: 'border-l-gray-600',
  needs_review: 'border-l-yellow-500',
  approved: 'border-l-green-500',
  scheduled: 'border-l-blue-500',
  published: 'border-l-emerald-500',
  failed: 'border-l-red-500',
  manual_required: 'border-l-orange-500',
}

const PLATFORM_ICONS: Record<string, string> = {
  tiktok: '🎵', youtube: '▶️', facebook: '📘', linkedin: '💼', instagram: '📷',
}

async function getScheduledItems(): Promise<ContentItem[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('content_items')
    .select('*')
    .in('status', ['scheduled', 'approved', 'needs_review', 'manual_required'])
    .order('scheduled_at', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(100)
  return data || []
}

function groupByDate(items: ContentItem[]) {
  const groups: Record<string, ContentItem[]> = {}
  for (const item of items) {
    const date = item.scheduled_at
      ? new Date(item.scheduled_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
      : 'Unscheduled'
    if (!groups[date]) groups[date] = []
    groups[date].push(item)
  }
  return groups
}

export default async function CalendarPage() {
  const items = await getScheduledItems()
  const groups = groupByDate(items)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Calendar</h1>
          <p className="text-gray-400 text-sm mt-1">{items.length} items · 2 posts/day target</p>
        </div>
        <Link href="/create" className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + Create
        </Link>
      </div>

      {Object.keys(groups).length === 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
          <div className="text-4xl mb-3">📅</div>
          <div className="text-gray-400 text-sm">No content scheduled yet.</div>
          <Link href="/create" className="text-blue-400 text-sm hover:underline mt-2 inline-block">Create your first piece →</Link>
        </div>
      )}

      {Object.entries(groups).map(([date, dateItems]) => (
        <div key={date}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-semibold text-gray-300">{date}</span>
            <div className="flex-1 h-px bg-gray-800" />
            <span className={`text-xs px-2 py-0.5 rounded-full ${dateItems.length >= 2 ? 'bg-emerald-900 text-emerald-300' : 'bg-yellow-900 text-yellow-300'}`}>
              {dateItems.length}/2
            </span>
          </div>
          <div className="space-y-2">
            {dateItems.map(item => (
              <div key={item.id} className={`bg-gray-900 border-l-4 border border-gray-800 rounded-lg px-4 py-3 flex items-center gap-3 ${STATUS_COLORS[item.status] || 'border-l-gray-600'}`}>
                <span className="text-lg shrink-0">{PLATFORM_ICONS[item.platform] || '📄'}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm truncate">{item.title}</div>
                  <div className="text-gray-500 text-xs mt-0.5">
                    {item.platform} · {item.lane?.replace('_', ' ')}
                    {item.scheduled_at && ` · ${new Date(item.scheduled_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`}
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                  item.status === 'published' ? 'bg-emerald-900 text-emerald-300' :
                  item.status === 'scheduled' ? 'bg-blue-900 text-blue-300' :
                  item.status === 'manual_required' ? 'bg-orange-900 text-orange-300' :
                  'bg-gray-800 text-gray-400'
                }`}>{item.status}</span>
                <Link href={`/approvals`} className="text-xs text-blue-400 hover:underline shrink-0">Edit</Link>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
