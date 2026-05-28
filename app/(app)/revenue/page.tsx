import { createAdminClient } from '@/lib/supabase/admin'
import { PageHeader } from '@/components/hermes/PageHeader'
import { StatusBadge } from '@/components/hermes/StatusBadge'
import { EmptyState } from '@/components/hermes/EmptyState'
import { DollarSign } from 'lucide-react'
import Link from 'next/link'
import { getActiveHubScope, getHubLabel } from '@/lib/crm/hub-scope'

export const dynamic = 'force-dynamic'

const STAGES = ['New', 'Discovery', 'Proposal', 'Negotiation', 'Verbal Yes', 'Won', 'Lost', 'Nurture']

async function getRevenue(scope: string | null) {
  try {
    const supabase = createAdminClient()
    let query = supabase
      .from('revenue_opportunities')
      .select(`
        id, title, amount, stage, probability, close_date, notes, created_at,
        hub_id,
        hubs!revenue_opportunities_hub_id_fkey (id, name, slug, color)
      `)
      .order('amount', { ascending: false })
    if (scope) query = query.eq('hub_id', scope)
    const { data, error } = await query
    if (error) return []
    return data ?? []
  } catch {
    return []
  }
}

export default async function RevenuePage() {
  const scope = await getActiveHubScope()
  const scopeLabel = await getHubLabel(scope)
  const allOpps = await getRevenue(scope) as Record<string, unknown>[]

  const activeOpps = allOpps.filter(o => !['Won', 'Lost'].includes(o.stage as string))
  const pipelineTotal = activeOpps.reduce((sum, o) => sum + ((o.amount as number) ?? 0), 0)
  const weightedTotal = activeOpps.reduce((sum, o) => sum + (((o.amount as number) ?? 0) * ((o.probability as number) ?? 0) / 100), 0)
  const wonTotal = allOpps.filter(o => o.stage === 'Won').reduce((sum, o) => sum + ((o.amount as number) ?? 0), 0)

  // Stage funnel counts
  const stageCounts = STAGES.map(s => ({
    stage: s,
    count: allOpps.filter(o => o.stage === s).length,
    total: allOpps.filter(o => o.stage === s).reduce((sum, o) => sum + ((o.amount as number) ?? 0), 0),
  }))

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Revenue Pipeline"
        subtitle={`${scope ? `${scopeLabel} · ` : ''}${activeOpps.length} active opportunities`}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Pipeline', value: `$${pipelineTotal.toLocaleString()}`, sub: `${activeOpps.length} opportunities`, color: 'text-white' },
          { label: 'Weighted Value', value: `$${Math.round(weightedTotal).toLocaleString()}`, sub: 'probability-adjusted', color: 'text-emerald-400' },
          { label: 'Won (All Time)', value: `$${wonTotal.toLocaleString()}`, sub: `${allOpps.filter(o => o.stage === 'Won').length} closed`, color: 'text-emerald-400' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="text-xs text-slate-500 mb-1">{label}</div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-slate-600 mt-1">{sub}</div>
          </div>
        ))}
      </div>

      {/* Stage funnel */}
      {allOpps.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-white mb-4">Pipeline by Stage</h2>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {stageCounts.map(({ stage, count, total }) => (
              <div key={stage} className="text-center">
                <div className="text-lg font-bold text-white">{count}</div>
                <div className="text-[10px] text-slate-500 mb-1">{stage}</div>
                {total > 0 && (
                  <div className="text-[10px] text-emerald-400">${total.toLocaleString()}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {allOpps.length === 0 ? (
        <EmptyState
          icon={DollarSign}
          title="No revenue opportunities"
          description="Seed the database to load revenue opportunities across all hubs."
        />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Opportunity</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Hub</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stage</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Probability</th>
              </tr>
            </thead>
            <tbody>
              {allOpps.map(opp => {
                const hub = opp.hubs as Record<string, unknown> | null
                return (
                  <tr key={opp.id as string} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="text-sm text-slate-200">{opp.title as string}</div>
                      {Boolean(opp.notes) && <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{opp.notes as string}</div>}
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      {hub ? (
                        <Link href={`/hubs/${hub.slug}`} className="text-xs text-slate-400 hover:text-indigo-400">
                          {hub.name as string}
                        </Link>
                      ) : <span className="text-xs text-slate-700">—</span>}
                    </td>
                    <td className="px-4 py-3.5"><StatusBadge status={opp.stage as string} /></td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-sm font-semibold text-emerald-400">${(opp.amount as number)?.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right hidden lg:table-cell">
                      <span className="text-xs text-slate-500">{opp.probability as number}%</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
