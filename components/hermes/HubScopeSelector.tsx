'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { ChevronDown, LayoutGrid, Check } from 'lucide-react'

interface HubOption {
  id: string
  name: string
  slug: string
  color: string | null
}

interface HubScopeSelectorProps {
  hubs: HubOption[]
  initialScope: string | null
}

const ALL_HUBS = 'all'

/**
 * Persistent niche selector at the top of the sidebar. Filters every top-level
 * CRM page to only the chosen hub. The selection is stored in a cookie so
 * server components can read it without round-tripping through the client.
 */
export function HubScopeSelector({ hubs, initialScope }: HubScopeSelectorProps) {
  const router = useRouter()
  const [scope, setScope] = useState<string>(initialScope ?? ALL_HUBS)
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (!(e.target as Element)?.closest('[data-hub-scope]')) {
        setOpen(false)
      }
    }
    window.addEventListener('mousedown', handler)
    return () => window.removeEventListener('mousedown', handler)
  }, [open])

  const activeHub = hubs.find(h => h.id === scope || h.slug === scope)
  const label = activeHub?.name ?? 'All hubs'
  const dotColor = activeHub?.color ?? '#64748b'

  async function selectScope(nextScope: string) {
    setScope(nextScope)
    setOpen(false)
    try {
      await fetch('/api/hermes/hub-scope', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ scope: nextScope }),
      })
      startTransition(() => router.refresh())
    } catch {
      // Silent — UI already updated
    }
  }

  return (
    <div data-hub-scope className="relative px-3 mt-4 mb-2">
      <div className="px-1 mb-1.5 text-[10px] font-semibold tracking-widest text-slate-600 uppercase">
        Active Niche
      </div>

      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border text-sm transition-all duration-150 ${
          open
            ? 'bg-slate-900 border-slate-700 text-white'
            : 'bg-slate-900/50 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-900'
        } ${isPending ? 'opacity-60' : ''}`}
      >
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: dotColor }}
        />
        <span className="flex-1 text-left truncate text-xs font-medium">{label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-3 right-3 top-full mt-1 z-50 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl shadow-black/40 max-h-[60vh] overflow-y-auto">
          <button
            onClick={() => selectScope(ALL_HUBS)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-slate-800 transition-colors ${
              scope === ALL_HUBS ? 'text-indigo-400 font-medium' : 'text-slate-300'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="flex-1 text-left">All hubs</span>
            {scope === ALL_HUBS && <Check className="w-3 h-3" />}
          </button>

          <div className="h-px bg-slate-800 mx-2 my-1" />

          {hubs.map(hub => {
            const isActive = scope === hub.id || scope === hub.slug
            return (
              <button
                key={hub.id}
                onClick={() => selectScope(hub.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-slate-800 transition-colors ${
                  isActive ? 'text-indigo-400 font-medium' : 'text-slate-300'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: hub.color ?? '#64748b' }}
                />
                <span className="flex-1 text-left truncate">{hub.name}</span>
                {isActive && <Check className="w-3 h-3" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
