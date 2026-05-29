import * as fs from 'fs'
import * as path from 'path'
import { WidgetShell, WidgetEmpty } from './WidgetShell'

interface Upgrade { id: string; title: string; date: string; status: string }

export function LockedUpgradesWidget() {
  let upgrades: Upgrade[] = []
  try {
    const file = path.resolve(process.cwd(), 'automation-os/gabriel/core/LOCKED_UPGRADES.md')
    if (fs.existsSync(file)) {
      const raw = fs.readFileSync(file, 'utf8')
      // Parse upgrade blocks: "## UPGRADE 001 — Title", "**Locked:** date", "**Status:** ..."
      const blocks = raw.split(/^## /m).slice(1)
      for (const block of blocks) {
        const titleLine = block.split('\n')[0].trim()
        const idMatch = titleLine.match(/^UPGRADE (\d+)\s*[—–-]\s*(.+)/)
        if (!idMatch) continue
        const lockedMatch = block.match(/\*\*Locked:\*\*\s*(.+)/)
        const statusMatch = block.match(/\*\*Status:\*\*\s*(.+)/)
        upgrades.push({
          id: idMatch[1],
          title: idMatch[2].trim(),
          date: lockedMatch?.[1].trim() ?? '',
          status: statusMatch?.[1].trim() ?? '',
        })
      }
      upgrades.sort((a, b) => parseInt(b.id) - parseInt(a.id))
    }
  } catch { /* empty */ }

  return (
    <WidgetShell title="Locked Upgrades" meta={`${upgrades.length} total`}>
      {upgrades.length === 0 ? (
        <WidgetEmpty message="No upgrades locked yet" />
      ) : (
        <div>
          {upgrades.slice(0, 6).map(u => (
            <div key={u.id} className="flex items-baseline gap-3 py-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <span className="text-[10px] font-mono tabular-nums" style={{ color: 'var(--text-muted)' }}>
                #{u.id.padStart(3, '0')}
              </span>
              <div className="flex-1 text-[12px] truncate" style={{ color: 'var(--text-primary)' }}>{u.title}</div>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{u.date}</div>
            </div>
          ))}
        </div>
      )}
    </WidgetShell>
  )
}
