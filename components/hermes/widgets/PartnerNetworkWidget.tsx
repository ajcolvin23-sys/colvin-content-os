import { createAdminClient } from '@/lib/supabase/admin'
import { WidgetShell, WidgetEmpty } from './WidgetShell'

interface Lead { id: string; business_name: string | null; contact_name: string | null; status: string; pain_point: string | null }

export async function PartnerNetworkWidget({ hubId }: { hubId: string; hubSlug: string; hubColor: string | null }) {
  // Partners = leads with status 'partner' or pain_point indicating partnership
  let partners: Lead[] = []
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('leads')
      .select('id, business_name, contact_name, status, pain_point')
      .eq('hub_id', hubId)
      .or('status.eq.partner,status.eq.referral_source,pain_point.ilike.%partner%,pain_point.ilike.%lender%,pain_point.ilike.%realtor%')
      .limit(10)
    partners = (data ?? []) as Lead[]
  } catch { /* empty */ }

  return (
    <WidgetShell title="Partner Network" meta={partners.length > 0 ? `${partners.length}` : 'Empty'}>
      {partners.length === 0 ? (
        <WidgetEmpty message="No partners tracked yet" />
      ) : (
        <div>
          {partners.map(p => (
            <div key={p.id} className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] truncate" style={{ color: 'var(--text-primary)' }}>
                  {p.business_name ?? p.contact_name ?? 'Unnamed'}
                </div>
                {p.pain_point && (
                  <div className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                    {p.pain_point}
                  </div>
                )}
              </div>
              <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{p.status}</div>
            </div>
          ))}
        </div>
      )}
    </WidgetShell>
  )
}
