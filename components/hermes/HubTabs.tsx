'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'leads', label: 'Leads' },
  { key: 'research', label: 'Research' },
  { key: 'prompts', label: 'Prompts' },
  { key: 'automations', label: 'Automations' },
  { key: 'revenue', label: 'Revenue' },
]

export function HubTabs() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const activeTab = searchParams.get('tab') ?? 'overview'

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex gap-1 border-b border-slate-800 mb-6 overflow-x-auto">
      {TABS.map(t => (
        <button
          key={t.key}
          onClick={() => setTab(t.key)}
          className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all -mb-px ${
            activeTab === t.key
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-700'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
