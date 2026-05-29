'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Hub } from '@/lib/crm/types'

interface Props {
  initialHubs: Hub[]
}

const CATEGORY_ORDER = ['AI Systems', 'Brand', 'Outreach', 'Media', 'Education', 'Community', 'Events', 'Technology', 'Future']

export function HubsClient({ initialHubs }: Props) {
  const [search, setSearch] = useState('')

  const filtered = initialHubs.filter(hub => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      hub.name.toLowerCase().includes(q) ||
      (hub.description ?? '').toLowerCase().includes(q) ||
      (hub.category ?? '').toLowerCase().includes(q)
    )
  })

  // Group by category
  const byCategory: Record<string, Hub[]> = {}
  for (const h of filtered) {
    const cat = h.category ?? 'Other'
    if (!byCategory[cat]) byCategory[cat] = []
    byCategory[cat].push(h)
  }
  const sortedCategories = Object.keys(byCategory).sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a)
    const bi = CATEGORY_ORDER.indexOf(b)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-10 pt-10 pb-6">
        <div className="max-w-5xl">
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Hubs
          </h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--text-body)' }}>
            {initialHubs.length} business niches · pick one to enter its workspace
          </p>

          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search niches..."
            className="mt-6 w-full max-w-sm text-[13px]"
          />
        </div>
      </div>

      {/* Grouped niches */}
      <div className="px-10 pb-12">
        <div className="max-w-5xl space-y-10">
          {sortedCategories.map(category => (
            <section key={category}>
              <h2
                className="text-[11px] uppercase tracking-widest mb-3"
                style={{ color: 'var(--text-muted)' }}
              >
                {category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {byCategory[category].map(hub => (
                  <HubRow key={hub.id} hub={hub} />
                ))}
              </div>
            </section>
          ))}

          {filtered.length === 0 && (
            <div className="py-12 text-center text-[13px]" style={{ color: 'var(--text-muted)' }}>
              No niches match &ldquo;{search}&rdquo;
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function HubRow({ hub }: { hub: Hub }) {
  return (
    <Link
      href={`/h/${hub.slug}`}
      className="block rounded p-3 transition-colors"
      style={{ background: 'var(--bg-panel)' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-elevated)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-panel)' }}
    >
      <div className="flex items-center gap-2.5 mb-1.5">
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: hub.color ?? '#6b6b6b' }}
        />
        <span className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
          {hub.name}
        </span>
      </div>
      {hub.next_action && (
        <p className="text-[11px] leading-snug line-clamp-2 ml-4" style={{ color: 'var(--text-muted)' }}>
          {hub.next_action}
        </p>
      )}
    </Link>
  )
}
