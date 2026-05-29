'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { ChevronDown, Check } from 'lucide-react'

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

export function HubScopeSelector({ hubs, initialScope }: HubScopeSelectorProps) {
  const router = useRouter()
  const [scope, setScope] = useState<string>(initialScope ?? ALL_HUBS)
  const [open, setOpen] = useState(false)
  const [, startTransition] = useTransition()

  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (!(e.target as Element)?.closest('[data-hub-scope]')) setOpen(false)
    }
    window.addEventListener('mousedown', handler)
    return () => window.removeEventListener('mousedown', handler)
  }, [open])

  const activeHub = hubs.find(h => h.id === scope || h.slug === scope)
  const label = activeHub?.name ?? 'All hubs'
  const dotColor = activeHub?.color ?? '#6b6b6b'

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
      // UI already updated
    }
  }

  return (
    <div data-hub-scope className="relative px-3 mb-1">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-[12px] transition-colors"
        style={{
          color: 'var(--text-body)',
          background: open ? 'var(--bg-panel)' : 'transparent',
        }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = 'var(--bg-panel)' }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = 'transparent' }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: dotColor }}
        />
        <span className="flex-1 text-left truncate" style={{ color: 'var(--text-primary)' }}>
          {label}
        </span>
        <ChevronDown size={11} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
      </button>

      {open && (
        <div
          className="absolute left-3 right-3 top-full mt-1 z-50 rounded overflow-y-auto"
          style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-default)',
            maxHeight: '60vh',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }}
        >
          <button
            onClick={() => selectScope(ALL_HUBS)}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-left"
            style={{ color: scope === ALL_HUBS ? 'var(--text-primary)' : 'var(--text-body)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#6b6b6b' }} />
            <span className="flex-1">All hubs</span>
            {scope === ALL_HUBS && <Check size={11} strokeWidth={1.5} />}
          </button>

          <div className="my-1 mx-2" style={{ borderTop: '1px solid var(--border-subtle)' }} />

          {hubs.map(hub => {
            const isActive = scope === hub.id || scope === hub.slug
            return (
              <button
                key={hub.id}
                onClick={() => selectScope(hub.id)}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-left"
                style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-body)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: hub.color ?? '#6b6b6b' }}
                />
                <span className="flex-1 truncate">{hub.name}</span>
                {isActive && <Check size={11} strokeWidth={1.5} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
