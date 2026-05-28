import { createAdminClient } from '@/lib/supabase/admin'
import { PageHeader } from '@/components/hermes/PageHeader'
import { StatusBadge } from '@/components/hermes/StatusBadge'
import { EmptyState } from '@/components/hermes/EmptyState'
import { Workflow, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { getActiveHubScope, getHubLabel } from '@/lib/crm/hub-scope'

export const dynamic = 'force-dynamic'

async function getAutomations(scope: string | null) {
  try {
    const supabase = createAdminClient()
    let query = supabase
      .from('crm_automations')
      .select(`
        id, name, trigger_type, workflow_description, tools_required, status, last_run_at, error_log, created_at,
        hub_id,
        hubs!crm_automations_hub_id_fkey (id, name, slug, color)
      `)
      .order('status')
      .order('name')
    if (scope) query = query.eq('hub_id', scope)
    const { data, error } = await query
    if (error) return []
    return data ?? []
  } catch {
    return []
  }
}

export default async function AutomationsPage() {
  const scope = await getActiveHubScope()
  const scopeLabel = await getHubLabel(scope)
  const automations = await getAutomations(scope) as Record<string, unknown>[]

  const activeCount = automations.filter(a => a.status === 'Active').length
  const failedCount = automations.filter(a => a.status === 'Failed').length

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Automations"
        subtitle={`${scope ? `${scopeLabel} · ` : ''}${automations.length} total · ${activeCount} active${failedCount > 0 ? ` · ${failedCount} failed` : ''}`}
      />

      {automations.length === 0 ? (
        <EmptyState
          icon={Workflow}
          title="No automations"
          description="Seed the database to load 10 automation blueprints across operational hubs."
        />
      ) : (
        <div className="space-y-3">
          {automations.map(auto => {
            const hub = auto.hubs as Record<string, unknown> | null
            const hasError = auto.status === 'Failed' && Boolean(auto.error_log)

            return (
              <div
                key={auto.id as string}
                className={`bg-slate-900 border rounded-xl p-5 transition-colors ${hasError ? 'border-red-500/30 bg-red-500/5' : 'border-slate-800 hover:border-slate-700'}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-sm font-semibold text-white">{auto.name as string}</h3>
                      <StatusBadge status={auto.status as string} />
                      {hasError && <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                      {hub && (
                        <Link href={`/hubs/${String(hub.slug)}`} className="text-xs text-slate-500 hover:text-indigo-400 transition-colors">
                          {hub.name as string}
                        </Link>
                      )}
                      {Boolean(auto.trigger_type) && (
                        <span className="text-xs text-slate-600">Trigger: {auto.trigger_type as string}</span>
                      )}
                      {Boolean(auto.last_run_at) && (
                        <span className="text-xs text-slate-700">
                          Last run: {new Date(auto.last_run_at as string).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {Boolean(auto.workflow_description) && (
                      <p className="text-xs text-slate-400 leading-relaxed mb-2">{auto.workflow_description as string}</p>
                    )}

                    {Boolean(auto.tools_required) && (auto.tools_required as string[]).length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {(auto.tools_required as string[]).map(tool => (
                          <span key={tool} className="text-[10px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-mono">{tool}</span>
                        ))}
                      </div>
                    )}

                    {hasError && (
                      <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-xs text-red-400">
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
  )
}
