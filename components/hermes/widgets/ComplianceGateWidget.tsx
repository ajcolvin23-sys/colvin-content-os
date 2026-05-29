import { createAdminClient } from '@/lib/supabase/admin'
import { WidgetShell, WidgetEmpty } from './WidgetShell'

interface Item { id: string; title: string | null; risk_level: string; status: string; item_type: string | null; created_at: string }

export async function ComplianceGateWidget({ hubId }: { hubId: string; hubSlug: string; hubColor: string | null }) {
  let items: Item[] = []
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('hermes_approvals')
      .select('id, title, risk_level, status, item_type, created_at')
      .eq('hub_id', hubId)
      .eq('status', 'Pending')
      .order('created_at', { ascending: false })
      .limit(6)
    items = (data ?? []) as Item[]
  } catch { /* empty */ }

  return (
    <WidgetShell title="Compliance Gate" meta={items.length > 0 ? `${items.length} pending review` : 'Clear'}>
      {items.length === 0 ? (
        <WidgetEmpty message="Nothing awaiting compliance review" />
      ) : (
        <div>
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{
                  background: item.risk_level === 'High' ? 'var(--state-danger)'
                    : item.risk_level === 'Medium' ? 'var(--state-warning)'
                    : 'var(--text-muted)'
                }}
              />
              <div className="flex-1 text-[12px] truncate" style={{ color: 'var(--text-primary)' }}>
                {item.title ?? 'Unnamed'}
              </div>
              <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {item.item_type ?? ''}
              </div>
            </div>
          ))}
        </div>
      )}
    </WidgetShell>
  )
}
