'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutGrid, Users, CheckSquare, DollarSign, Megaphone, FileText,
  BookOpen, Zap, Workflow, Send, ShieldCheck, Bot, Settings,
} from 'lucide-react'
import { HubScopeSelector } from '@/components/hermes/HubScopeSelector'
import type { HubNavItem } from '@/lib/crm/hub-config'

interface HubOption {
  id: string
  name: string
  slug: string
  color: string | null
}

interface SidebarNavProps {
  hubs: HubOption[]
  activeScope: string | null
  activeHubSlug?: string | null
  hubSidebar?: HubNavItem[]
  hubDailyBrief?: string
}

// Global nav — shown when "All hubs" is the scope (no specific niche selected)
const GLOBAL_NAV = [
  { href: '/dashboard', label: 'Command Center', icon: LayoutGrid },
  { href: '/hubs', label: 'All Hubs', icon: LayoutGrid },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/revenue', label: 'Revenue', icon: DollarSign },
  { href: '/campaigns', label: 'Campaigns', icon: Megaphone },
  { href: '/content', label: 'Content', icon: FileText },
  { href: '/research', label: 'Research', icon: BookOpen },
  { href: '/prompts', label: 'Prompts', icon: Zap },
  { href: '/automations', label: 'Automations', icon: Workflow },
  { href: '/outreach', label: 'Outreach', icon: Send },
  { href: '/approvals', label: 'Approvals', icon: ShieldCheck },
  { href: '/agent-logs', label: 'Agent Logs', icon: Bot },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function SidebarNav({
  hubs, activeScope, activeHubSlug, hubSidebar, hubDailyBrief,
}: SidebarNavProps) {
  const pathname = usePathname()
  const showHubNav = Boolean(activeScope && hubSidebar && hubSidebar.length > 0)
  const activeHubColor = hubs.find(h => h.id === activeScope)?.color ?? '#7c7cff'

  return (
    <aside
      className="hidden md:flex fixed top-0 left-0 h-full w-60 flex-col z-50"
      style={{
        background: 'var(--bg-canvas)',
        borderRight: '1px solid var(--border-subtle)',
      }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="text-[13px] font-semibold tracking-tight text-white">Hermes</div>
        <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Command CRM</div>
      </div>

      {/* Niche selector */}
      <HubScopeSelector hubs={hubs} initialScope={activeScope} />

      {/* Daily brief — visible only when scoped to a niche */}
      {showHubNav && hubDailyBrief && (
        <div
          className="mx-3 mt-1 mb-2 px-3 py-2.5 rounded text-[12px] leading-snug"
          style={{
            color: 'var(--text-body)',
            background: 'var(--bg-panel)',
            borderLeft: `2px solid ${activeHubColor}`,
          }}
        >
          {hubDailyBrief}
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-2 overflow-y-auto">
        {showHubNav ? (
          // Hub-specific nav
          <div>
            {hubSidebar!.map(item => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center px-3 py-1.5 rounded text-[13px] transition-colors"
                  style={{
                    color: active ? 'var(--text-primary)' : 'var(--text-body)',
                    background: active ? 'var(--bg-panel)' : 'transparent',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg-panel)' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                >
                  {item.label}
                </Link>
              )
            })}
            <div className="my-3" style={{ borderTop: '1px solid var(--border-subtle)' }} />
            <Link
              href="/hubs"
              className="flex items-center px-3 py-1.5 rounded text-[12px]"
              style={{ color: 'var(--text-muted)' }}
            >
              ← Back to all hubs
            </Link>
          </div>
        ) : (
          // Global nav
          <div>
            {GLOBAL_NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded text-[13px] transition-colors"
                  style={{
                    color: active ? 'var(--text-primary)' : 'var(--text-body)',
                    background: active ? 'var(--bg-panel)' : 'transparent',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg-panel)' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                >
                  <Icon size={14} strokeWidth={1.5} style={{ color: active ? 'var(--text-primary)' : 'var(--text-muted)' }} />
                  {label}
                </Link>
              )
            })}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="px-5 py-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Alfred Colvin</div>
        <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-dim)' }}>Draft-first · approval required</div>
      </div>
    </aside>
  )
}
