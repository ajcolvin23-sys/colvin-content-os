'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, LayoutGrid, Users, CheckSquare, DollarSign,
  Megaphone, FileText, BookOpen, Zap, Workflow, Send,
  ShieldCheck, Bot, Settings, ChevronRight
} from 'lucide-react'
import { HubScopeSelector } from '@/components/hermes/HubScopeSelector'

const NAV_GROUPS = [
  {
    label: 'Command',
    items: [
      { href: '/dashboard', label: 'Command Center', icon: LayoutDashboard },
      { href: '/hubs', label: 'Hubs', icon: LayoutGrid },
    ]
  },
  {
    label: 'Pipeline',
    items: [
      { href: '/leads', label: 'Leads', icon: Users },
      { href: '/tasks', label: 'Tasks', icon: CheckSquare },
      { href: '/revenue', label: 'Revenue', icon: DollarSign },
      { href: '/campaigns', label: 'Campaigns', icon: Megaphone },
    ]
  },
  {
    label: 'Content',
    items: [
      { href: '/content', label: 'Content', icon: FileText },
      { href: '/research', label: 'Research', icon: BookOpen },
      { href: '/prompts', label: 'Prompts', icon: Zap },
      { href: '/automations', label: 'Automations', icon: Workflow },
    ]
  },
  {
    label: 'Operations',
    items: [
      { href: '/outreach', label: 'Outreach', icon: Send },
      { href: '/approvals', label: 'Approvals', icon: ShieldCheck },
      { href: '/agent-logs', label: 'Agent Logs', icon: Bot },
    ]
  },
  {
    label: 'System',
    items: [
      { href: '/settings', label: 'Settings', icon: Settings },
    ]
  }
]

interface HubOption {
  id: string
  name: string
  slug: string
  color: string | null
}

interface SidebarNavProps {
  hubs: HubOption[]
  activeScope: string | null
}

export default function SidebarNav({ hubs, activeScope }: SidebarNavProps) {
  const pathname = usePathname()
  return (
    <aside className="hidden md:flex fixed top-0 left-0 h-full w-64 bg-slate-950 border-r border-slate-800/60 flex-col z-50">
      <div className="px-5 py-5 border-b border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <span className="text-indigo-400 text-xs font-bold">H</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-white tracking-tight">Hermes</div>
            <div className="text-[10px] text-slate-500 tracking-wide">Command CRM</div>
          </div>
        </div>
      </div>

      {/* Persistent niche selector — filters every page globally */}
      <HubScopeSelector hubs={hubs} initialScope={activeScope} />

      <nav className="flex-1 py-2 overflow-y-auto">
        {NAV_GROUPS.map(group => (
          <div key={group.label} className="mb-1">
            <div className="px-4 py-1.5 text-[10px] font-semibold tracking-widest text-slate-600 uppercase">
              {group.label}
            </div>
            {group.items.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  className={`mx-2 flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                    active
                      ? 'bg-indigo-500/10 text-indigo-400 font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{label}</span>
                  {active && <ChevronRight className="w-3 h-3 opacity-50" />}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-slate-800/60">
        <div className="text-xs font-medium text-slate-300">Alfred Colvin</div>
        <div className="text-[11px] text-slate-600 mt-0.5">Draft-first · Human approval required</div>
      </div>
    </aside>
  )
}
