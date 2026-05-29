import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { getActiveHubScope, getHubLabel } from '@/lib/crm/hub-scope'

export const dynamic = 'force-dynamic'

const STATUS_COLOR: Record<string, string> = {
  'Active': 'var(--state-success)',
  'Draft': 'var(--text-muted)',
  'Paused': 'var(--state-warning)',
  'Failed': 'var(--state-danger)',
  'Needs Review': 'var(--state-warning)',
  'Deprecated': 'var(--text-dim)',
}

async function getAutomations(scope: string | null) {
  try {
    const supabase = createAdminClient()
    let query = supabase
      .from('crm_automations')
      .select(`id, name, trigger_type, workflow_description, tools_required, status, last_run_at, error_log, created_at, hub_id,
        hubs!crm_automations_hub_id_fkey (id, name, slug, color)`)
      .order('status')
      .order('name')
    if (scope) query = query.eq('hub_id', scope)
    const { data, error } = await query
    if (error) return []
    return data ?? []
  } catch { return [] }
}

export default async function AutomationsPage() {
  const scope = await getActiveHubScope()
  const scopeLabel = await getHubLabel(scope)
  const automations = await getAutomations(scope) as Record<string, unknown>[]

  const activeCount = automations.filter(a => a.status === 'Active').length
  const failedCount = automations.filter(a => a.status === 'Failed').length

  return (
    <div className="min-h-screen">
      <div className="px-10 pt-10 pb-6">
        <div className="max-w-5xl">
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Automations</h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--text-body)' }}>
            {scope ? `${scopeLabel} · ` : ''}{automations.length} total · {activeCount} active
            {failedCount > 0 && <> · <span style={{ color: 'var(--state-danger)' }}>{failedCount} failed</span></>}
          </p>
        </div>
      </div>

      <div className="px-10 pb-12">
        <div className="max-w-5xl">
          {automations.length === 0 ? (
            <div className="py-12 text-center text-[13px]" style={{ color: 'var(--text-dim)' }}>No automations yet</div>
          ) : (
            <div className="space-y-1">
              {automations.map(auto => {
                const hub = auto.hubs as Record<string, unknown> | null
                const status = auto.status as string
                const hasError = auto.status === 'Failed' && Boolean(auto.error_log)
                return (
                  <div key={auto.id as string} className="rounded p-4" style={{ background: 'var(--bg-panel)' }}>
                    <div className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: STATUS_COLOR[status] ?? 'var(--text-muted)' }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-3 flex-wrap">
                          <h3 className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{auto.name as string}</h3>
                          <span className="text-[11px]" style={{ color: STATUS_COLOR[status] ?? 'var(--text-muted)' }}>{status}</span>
                          {hub && (
                            <Link href={`/h/${String(hub.slug)}`} className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                              {hub.name as string}
                            </Link>
                          )}
                          {Boolean(auto.trigger_type) && (
                            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Trigger: {auto.trigger_type as string}</span>
                          )}
                          {Boolean(auto.last_run_at) && (
                            <span className="text-[11px] ml-auto" style={{ color: 'var(--text-muted)' }}>
                              Last run {new Date(auto.last_run_at as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                        {Boolean(auto.workflow_description) && (
                          <p className="text-[12px] mt-2 leading-relaxed" style={{ color: 'var(--text-body)' }}>{auto.workflow_description as string}</p>
                        )}
                        {Boolean(auto.tools_required) && (auto.tools_required as string[]).length > 0 && (
                          <div className="flex flex-wrap gap-3 mt-2">
                            {(auto.tools_required as string[]).map(tool => (
                              <span key={tool} className="text-[10px] font-mono" style={{ color: 'var(--text-dim)' }}>{tool}</span>
                            ))}
                          </div>
                        )}
                        {hasError && (
                          <div className="mt-3 text-[11px] rounded px-3 py-2" style={{ color: 'var(--state-danger)', background: 'rgba(248, 113, 113, 0.05)' }}>
                            {auto.error_log as string}
                          </div>
                        )}
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
