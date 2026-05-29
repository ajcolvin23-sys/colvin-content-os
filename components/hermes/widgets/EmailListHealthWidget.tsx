import { WidgetShell } from './WidgetShell'

export async function EmailListHealthWidget(_props: { hubId: string; hubSlug: string; hubColor: string | null }) {
  // TODO: Wire to ConvertKit / Beehiiv / Resend audiences when configured
  return (
    <WidgetShell title="Email List" meta="Connect provider">
      <div className="grid grid-cols-2 gap-4 pb-4 mb-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div>
          <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Subscribers</div>
          <div className="text-xl font-semibold tracking-tight mt-1" style={{ color: 'var(--text-dim)' }}>—</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>30d growth</div>
          <div className="text-xl font-semibold tracking-tight mt-1" style={{ color: 'var(--text-dim)' }}>—</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Open rate</div>
          <div className="text-lg font-semibold tracking-tight mt-1" style={{ color: 'var(--text-dim)' }}>—</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Last broadcast</div>
          <div className="text-lg font-semibold tracking-tight mt-1" style={{ color: 'var(--text-dim)' }}>—</div>
        </div>
      </div>
      <div className="text-[11px] mt-4" style={{ color: 'var(--text-muted)' }}>
        Add EMAIL_PROVIDER_API_KEY to wire this up
      </div>
    </WidgetShell>
  )
}
