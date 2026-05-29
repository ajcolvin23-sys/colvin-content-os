import * as fs from 'fs'
import * as path from 'path'
import { WidgetShell, WidgetEmpty } from './WidgetShell'

interface Skill { name: string; description: string }

export function SkillRegistryWidget() {
  let skills: Skill[] = []
  try {
    const skillsDir = path.resolve(process.cwd(), 'automation-os/gabriel/skills')
    if (fs.existsSync(skillsDir)) {
      for (const name of fs.readdirSync(skillsDir)) {
        const skillFile = path.join(skillsDir, name, 'SKILL.md')
        if (!fs.existsSync(skillFile)) continue
        try {
          const raw = fs.readFileSync(skillFile, 'utf8')
          const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/)
          let description = ''
          if (fmMatch) {
            const descMatch = fmMatch[1].match(/description:\s*(.+)/)
            description = descMatch?.[1].trim() ?? ''
          }
          skills.push({ name, description })
        } catch { /* skip */ }
      }
      skills.sort((a, b) => a.name.localeCompare(b.name))
    }
  } catch { /* empty */ }

  return (
    <WidgetShell title="Skill Registry" meta={`${skills.length} skills`}>
      {skills.length === 0 ? (
        <WidgetEmpty message="No skills found" />
      ) : (
        <div className="max-h-72 overflow-y-auto">
          {skills.slice(0, 12).map(s => (
            <div key={s.name} className="py-1.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <div className="text-[12px] font-mono" style={{ color: 'var(--text-primary)' }}>{s.name}</div>
              {s.description && (
                <div className="text-[11px] mt-0.5 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                  {s.description}
                </div>
              )}
            </div>
          ))}
          {skills.length > 12 && (
            <div className="text-[11px] py-2 text-center" style={{ color: 'var(--text-dim)' }}>
              + {skills.length - 12} more
            </div>
          )}
        </div>
      )}
    </WidgetShell>
  )
}
