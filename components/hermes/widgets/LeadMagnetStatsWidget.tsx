import { WidgetShell } from './WidgetShell'

export async function LeadMagnetStatsWidget(_props: { hubId: string; hubSlug: string; hubColor: string | null }) {
  // TODO: Connect to actual lead magnet analytics when wired up
  // For now show placeholder structure
  return (
    <WidgetShell title="Lead Magnet — 4-Chord Cheat Sheet" meta="Awaiting analytics connection">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Downloads</div>
          <div className="text-xl font-semibold tracking-tight mt-1" style={{ color: 'var(--text-dim)' }}>—</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Conv. rate</div>
          <div className="text-xl font-semibold tracking-tight mt-1" style={{ color: 'var(--text-dim)' }}>—</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Subscribers</div>
          <div className="text-xl font-semibold tracking-tight mt-1" style={{ color: 'var(--text-dim)' }}>—</div>
        </div>
      </div>
      <div className="text-[11px] mt-4" style={{ color: 'var(--text-muted)' }}>
        Connect a landing page + email provider to populate
      </div>
    </WidgetShell>
  )
}
