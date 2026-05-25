import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const STATUS_COLORS: Record<string, string> = {
  draft: 'text-gray-400',
  needs_review: 'text-yellow-400',
  approved: 'text-green-400',
  scheduled: 'text-blue-400',
  published: 'text-emerald-400',
  failed: 'text-red-400',
  manual_required: 'text-orange-400',
}

async function getStats() {
  const supabase = createAdminClient()
  const [items, videos, prospects, logs] = await Promise.allSettled([
    supabase.from('content_items').select('id, status, lane, platform, created_at'),
    supabase.from('video_projects').select('id, render_status').limit(100),
    supabase.from('outreach_prospects').select('id, status').limit(100),
    supabase.from('content_audit_logs').select('id, action, entity_title, created_at').order('created_at', { ascending: false }).limit(8),
  ])

  const allItems = items.status === 'fulfilled' ? (items.value.data || []) : []
  const allVideos = videos.status === 'fulfilled' ? (videos.value.data || []) : []
  const allProspects = prospects.status === 'fulfilled' ? (prospects.value.data || []) : []
  const recentLogs = logs.status === 'fulfilled' ? (logs.value.data || []) : []

  const statusCounts: Record<string, number> = {}
  for (const item of allItems) {
    statusCounts[item.status] = (statusCounts[item.status] || 0) + 1
  }

  const laneCounts: Record<string, number> = {}
  for (const item of allItems) {
    laneCounts[item.lane] = (laneCounts[item.lane] || 0) + 1
  }

  return { allItems, statusCounts, laneCounts, allVideos, allProspects, recentLogs }
}

export default async function DashboardPage() {
  const { allItems, statusCounts, laneCounts, allVideos, allProspects, recentLogs } = await getStats()

  const statCards = [
    { label: 'Drafts', value: statusCounts.draft || 0, color: 'text-gray-300', href: '/approvals?status=draft' },
    { label: 'Needs Review', value: statusCounts.needs_review || 0, color: 'text-yellow-400', href: '/approvals?status=needs_review' },
    { label: 'Approved', value: statusCounts.approved || 0, color: 'text-green-400', href: '/approvals?status=approved' },
    { label: 'Scheduled', value: statusCounts.scheduled || 0, color: 'text-blue-400', href: '/calendar' },
    { label: 'Published', value: statusCounts.published || 0, color: 'text-emerald-400', href: '/logs' },
    { label: 'Manual Required', value: (statusCounts.manual_required || 0) + (statusCounts.failed || 0), color: 'text-orange-400', href: '/approvals?status=manual_required' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Colvin Content OS</h1>
        <p className="text-gray-400 text-sm mt-1">
          {allItems.length} content items · {allVideos.length} video projects · {allProspects.length} prospects
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map(({ label, value, color, href }) => (
          <Link key={label} href={href} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
            <div className={`text-3xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-gray-400 mt-1">{label}</div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: '/orchestrator', label: 'Hermes Orchestrator', icon: '🧠', desc: 'Gabriel + Solomon + Genius — one command' },
          { href: '/create', label: 'Create Content', icon: '✏️', desc: 'Generate a new post or script' },
          { href: '/piano-videos', label: 'Piano Video', icon: '🎹', desc: 'Build a slideshow video' },
          { href: '/backflow-facebook', label: 'Backflow Post', icon: '💧', desc: 'Facebook content for directory' },
        ].map(({ href, label, icon, desc }) => (
          <Link
            key={href}
            href={href}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-blue-700 hover:bg-gray-800 transition-colors"
          >
            <div className="text-2xl mb-2">{icon}</div>
            <div className="text-sm font-semibold text-white">{label}</div>
            <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lane breakdown */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Content by Lane</h2>
          <div className="space-y-2">
            {[
              { lane: 'piano', label: '🎹 Piano / Music', color: 'bg-purple-600' },
              { lane: 'backflow', label: '💧 Backflow', color: 'bg-blue-600' },
              { lane: 'linkedin', label: '💼 LinkedIn', color: 'bg-sky-600' },
              { lane: 'colvin_enterprises', label: '⚡ Colvin Enterprises', color: 'bg-emerald-600' },
            ].map(({ lane, label, color }) => {
              const count = laneCounts[lane] || 0
              const pct = allItems.length ? Math.round((count / allItems.length) * 100) : 0
              return (
                <div key={lane}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300">{label}</span>
                    <span className="text-gray-500">{count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full">
                    <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Recent Activity</h2>
          <div className="space-y-2">
            {recentLogs.length === 0 && (
              <p className="text-gray-500 text-xs">No activity yet. Create your first content item.</p>
            )}
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 text-xs">
                <span className="text-gray-500 shrink-0">
                  {new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span className="text-blue-400 font-mono shrink-0">{log.action}</span>
                <span className="text-gray-300 truncate">{log.entity_title || '—'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Approval queue reminder */}
      {(statusCounts.needs_review || 0) > 0 && (
        <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-yellow-400 font-semibold text-sm">
              {statusCounts.needs_review} item{statusCounts.needs_review !== 1 ? 's' : ''} need your review
            </div>
            <div className="text-yellow-600 text-xs mt-0.5">Nothing posts without your approval.</div>
          </div>
          <Link href="/approvals?status=needs_review" className="bg-yellow-600 hover:bg-yellow-500 text-white text-sm px-4 py-2 rounded-lg transition-colors">
            Review Now
          </Link>
        </div>
      )}
    </div>
  )
}
