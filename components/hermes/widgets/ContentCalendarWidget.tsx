import { createAdminClient } from '@/lib/supabase/admin'
import { WidgetShell, WidgetEmpty } from './WidgetShell'

interface Item { id: string; title: string; platform: string | null; status: string; publish_date: string | null; lane: string | null }

export async function ContentCalendarWidget({ hubSlug }: { hubId: string; hubSlug: string; hubColor: string | null }) {
  let items: Item[] = []
  try {
    const supabase = createAdminClient()
    // Use lane mapping since content_items uses lane, not hub_id
    const laneMap: Record<string, string> = {
      'colvin-enterprises': 'colvin_enterprises',
      'music-theory-secrets': 'music_theory_secrets',
      'indiana-backflow': 'indiana_backflow',
      'first-keys-indy': 'first_keys_indy',
      'funding-ready-indiana': 'funding_ready_indiana',
    }
    const lane = laneMap[hubSlug] ?? hubSlug.replace(/-/g, '_')
    const { data } = await supabase
      .from('content_items')
      .select('id, title, platform, status, publish_date, lane')
      .eq('lane', lane)
      .order('publish_date', { ascending: true, nullsFirst: false })
      .limit(8)
    items = (data ?? []) as Item[]
  } catch { /* empty */ }

  return (
    <WidgetShell title="Content Calendar" meta={items.length > 0 ? `${items.length}` : 'Empty'}>
      {items.length === 0 ? (
        <WidgetEmpty message="No content scheduled" />
      ) : (
        <div>
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <div className="flex-1 text-[12px] truncate" style={{ color: 'var(--text-primary)' }}>
                {item.title}
              </div>
              <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {item.platform ?? '—'}
              </div>
              {item.publish_date && (
                <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {new Date(item.publish_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </WidgetShell>
  )
}
