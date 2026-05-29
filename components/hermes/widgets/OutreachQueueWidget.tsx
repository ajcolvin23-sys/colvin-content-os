import { createAdminClient } from '@/lib/supabase/admin'
import { WidgetShell, WidgetEmpty } from './WidgetShell'

interface Draft { id: string; lane: string | null; status: string; message_type: string | null; created_at: string }

export async function OutreachQueueWidget(_props: { hubId: string; hubSlug: string; hubColor: string | null }) {
  let drafts: Draft[] = []
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('outreach_drafts')
      .select('id, lane, status, message_type, created_at')
      .eq('status', 'pending_review')
      .order('created_at', { ascending: false })
      .limit(8)
    drafts = (data ?? []) as Draft[]
  } catch { /* empty */ }

  return (
    <WidgetShell title="Outreach Queue" meta={drafts.length > 0 ? `${drafts.length} awaiting approval` : 'Empty'}>
      {drafts.length === 0 ? (
        <WidgetEmpty message="No drafts awaiting your approval" />
      ) : (
        <div>
          {drafts.map(d => (
            <div key={d.id} className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <div className="flex-1 text-[12px]" style={{ color: 'var(--text-primary)' }}>
                {d.message_type ?? 'Outreach'}
                {d.lane && (
                  <span className="ml-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    · {d.lane.replace(/_/g, ' ')}
                  </span>
                )}
              </div>
              <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
      )}
    </WidgetShell>
  )
}
