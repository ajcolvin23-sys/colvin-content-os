import { createAdminClient } from '@/lib/supabase/admin'
import { WidgetShell } from './WidgetShell'

export async function WeeklyActivityWidget({ hubId, hubSlug }: { hubId: string; hubSlug: string; hubColor: string | null }) {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const cutoff = sevenDaysAgo.toISOString()

  // Map hub slug to lane key for legacy leads/outreach tables
  const laneMap: Record<string, string> = {
    'colvin-enterprises': 'colvin_enterprises',
    'music-theory-secrets': 'music_theory_secrets',
    'indiana-backflow': 'indiana_backflow',
    'first-keys-indy': 'first_keys_indy',
    'funding-ready-indiana': 'funding_ready_indiana',
  }
  const lane = laneMap[hubSlug]

  let newLeads = 0, contacted = 0, replied = 0, tasksDone = 0, contentPublished = 0

  try {
    const supabase = createAdminClient()
    if (lane) {
      const [leadsRes, draftsRes] = await Promise.allSettled([
        supabase.from('leads').select('id, status, created_at').eq('lane', lane).gte('created_at', cutoff),
        supabase.from('outreach_drafts').select('id, status, sent_at').eq('lane', lane).gte('created_at', cutoff),
      ])
      if (leadsRes.status === 'fulfilled' && leadsRes.value.data) {
        newLeads = leadsRes.value.data.length
        contacted = leadsRes.value.data.filter((l: { status: string }) => ['contacted','replied','converted'].includes(l.status)).length
        replied = leadsRes.value.data.filter((l: { status: string }) => ['replied','converted'].includes(l.status)).length
      }
      if (draftsRes.status === 'fulfilled' && draftsRes.value.data) {
        const drafts = draftsRes.value.data as { status: string }[]
        contacted = Math.max(contacted, drafts.filter(d => d.status === 'sent').length)
      }
    }
    const [tasksRes, contentRes] = await Promise.allSettled([
      supabase.from('crm_tasks').select('id, updated_at').eq('hub_id', hubId).eq('status', 'Done').gte('updated_at', cutoff),
      lane ? supabase.from('content_items').select('id, status').eq('lane', lane).eq('status', 'published').gte('updated_at', cutoff) : Promise.resolve({ data: [] }),
    ])
    if (tasksRes.status === 'fulfilled' && tasksRes.value.data) tasksDone = tasksRes.value.data.length
    if (contentRes.status === 'fulfilled' && contentRes.value.data) contentPublished = contentRes.value.data.length
  } catch { /* empty */ }

  const stats = [
    { label: 'New leads', value: newLeads },
    { label: 'Contacted', value: contacted },
    { label: 'Replies', value: replied },
    { label: 'Tasks done', value: tasksDone },
    { label: 'Published', value: contentPublished },
  ]

  return (
    <WidgetShell title="Last 7 Days">
      <div className="grid grid-cols-5 gap-3">
        {stats.map(s => (
          <div key={s.label} className="text-center">
            <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
            <div className="text-xl font-semibold tracking-tight mt-1" style={{ color: 'var(--text-primary)' }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>
    </WidgetShell>
  )
}
