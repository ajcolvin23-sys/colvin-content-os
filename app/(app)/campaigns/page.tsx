import { createAdminClient } from '@/lib/supabase/admin'
import { PageHeader } from '@/components/hermes/PageHeader'
import { StatusBadge } from '@/components/hermes/StatusBadge'
import { EmptyState } from '@/components/hermes/EmptyState'
import { Megaphone } from 'lucide-react'
import Link from 'next/link'
import { getActiveHubScope, getHubLabel } from '@/lib/crm/hub-scope'

export const dynamic = 'force-dynamic'

async function getCampaigns(scope: string | null) {
  try {
    const supabase = createAdminClient()
    let query = supabase
      .from('campaigns')
      .select(`
        id, name, goal, audience, offer, start_date, end_date, status, metrics, created_at,
        hub_id,
        hubs!campaigns_hub_id_fkey (id, name, slug, color)
      `)
      .order('created_at', { ascending: false })
    if (scope) query = query.eq('hub_id', scope)
    const { data, error } = await query
    if (error) return []
    return data ?? []
  } catch {
    return []
  }
}

export default async function CampaignsPage() {
  const scope = await getActiveHubScope()
  const scopeLabel = await getHubLabel(scope)
  const campaigns = await getCampaigns(scope) as Record<string, unknown>[]

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Campaigns"
        subtitle={`${scope ? `${scopeLabel} · ` : ''}${campaigns.length} campaign${campaigns.length === 1 ? '' : 's'}${scope ? '' : ' across all hubs'}`}
      />

      {campaigns.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No campaigns yet"
          description="Campaigns will appear here once created. Each hub can have multiple campaigns with goals, audiences, and offers."
        />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Campaign</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Hub</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Offer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden xl:table-cell">Dates</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map(campaign => {
                const hub = campaign.hubs as Record<string, unknown> | null
                return (
                  <tr key={campaign.id as string} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="text-sm text-slate-200">{campaign.name as string}</div>
                      {Boolean(campaign.goal) && <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{campaign.goal as string}</div>}
                      {Boolean(campaign.audience) && <div className="text-xs text-slate-600 mt-0.5">Audience: {campaign.audience as string}</div>}
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      {hub ? (
                        <Link href={`/hubs/${hub.slug}`} className="text-xs text-slate-400 hover:text-indigo-400 transition-colors">
                          {hub.name as string}
                        </Link>
                      ) : <span className="text-xs text-slate-700">—</span>}
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="text-xs text-slate-400 line-clamp-1">{(campaign.offer as string) ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={campaign.status as string} />
                    </td>
                    <td className="px-4 py-3.5 hidden xl:table-cell">
                      <span className="text-xs text-slate-600">
                        {campaign.start_date ? `${campaign.start_date} → ${campaign.end_date ?? 'ongoing'}` : '—'}
                      </span>
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
