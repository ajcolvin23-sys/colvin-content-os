import { createAdminClient } from '@/lib/supabase/admin'
import type { AuditLog } from '@/types'

export const dynamic = 'force-dynamic'

const ACTION_COLORS: Record<string, string> = {
  create: 'text-blue-400',
  update: 'text-yellow-400',
  approve: 'text-green-400',
  reject: 'text-red-400',
  publish: 'text-emerald-400',
  publish_fail: 'text-red-400',
  schedule: 'text-sky-400',
  generate: 'text-purple-400',
  delete: 'text-red-500',
  mark_manual: 'text-orange-400',
}

export default async function LogsPage() {
  const supabase = createAdminClient()
  const { data: logs } = await supabase
    .from('content_audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  const items: AuditLog[] = logs || []

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
        <p className="text-gray-400 text-sm mt-1">Every action logged. {items.length} entries.</p>
      </div>

      {items.length === 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <div className="text-gray-500 text-sm">No actions logged yet.</div>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-2 text-xs text-gray-600 border-b border-gray-800 font-medium">
          <span className="col-span-2">Time</span>
          <span className="col-span-2">Action</span>
          <span className="col-span-2">Type</span>
          <span className="col-span-6">Item</span>
        </div>
        <div className="divide-y divide-gray-800">
          {items.map(log => (
            <div key={log.id} className="grid grid-cols-12 px-4 py-2.5 text-xs hover:bg-gray-800/50">
              <span className="col-span-2 text-gray-600">
                {new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                {' '}
                {new Date(log.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </span>
              <span className={`col-span-2 font-mono font-medium ${ACTION_COLORS[log.action] || 'text-gray-400'}`}>
                {log.action}
              </span>
              <span className="col-span-2 text-gray-500">{log.entity_type?.replace('_', ' ')}</span>
              <span className="col-span-6 text-gray-300 truncate">{log.entity_title || log.entity_id || '—'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
