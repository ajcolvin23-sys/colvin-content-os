'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Check, X, RotateCcw, Copy, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import type { BriefItem } from './page'

const LANE_LABELS: Record<string, string> = {
  colvin_enterprises: 'Colvin Enterprises',
  music_theory_secrets: 'Music Theory Secrets',
  indiana_backflow: 'Indiana Backflow',
  first_keys_indy: 'First Keys Indy',
  funding_ready_indiana: 'Funding Ready',
}

interface Props { initialItems: BriefItem[] }

export function MorningBriefClient({ initialItems }: Props) {
  const [items, setItems] = useState(initialItems)
  const [cursor, setCursor] = useState(0)
  const [actionState, setActionState] = useState<Record<string, 'approved' | 'rejected' | 'edit' | 'copied' | null>>({})
  const [filter, setFilter] = useState<'all' | 'content' | 'outreach'>('all')

  const visible = useMemo(() => {
    if (filter === 'all') return items
    return items.filter(i => i.kind === filter)
  }, [items, filter])

  const current = visible[cursor]

  const next = useCallback(() => setCursor(c => Math.min(c + 1, visible.length - 1)), [visible.length])
  const prev = useCallback(() => setCursor(c => Math.max(c - 1, 0)), [])

  const apply = useCallback(async (action: 'approve' | 'reject') => {
    if (!current) return
    setActionState(s => ({ ...s, [current.id]: action === 'approve' ? 'approved' : 'rejected' }))
    try {
      await fetch('/api/brief/action', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: current.id, kind: current.kind, action }),
      })
      // Advance cursor automatically
      setTimeout(() => next(), 200)
    } catch (err) {
      console.error(err)
      setActionState(s => ({ ...s, [current.id]: null }))
    }
  }, [current, next])

  const copyAndOpen = useCallback(async () => {
    if (!current) return
    try {
      await navigator.clipboard.writeText(current.body)
      setActionState(s => ({ ...s, [current.id]: 'copied' }))
      const url = current.kind === 'outreach'
        ? 'https://www.linkedin.com/feed/'
        : (current.platform === 'linkedin'
          ? 'https://www.linkedin.com/feed/?shareActive=true'
          : current.platform === 'tiktok' ? 'https://www.tiktok.com/upload'
          : current.platform === 'facebook' ? 'https://www.facebook.com/'
          : 'https://www.linkedin.com/feed/?shareActive=true')
      window.open(url, '_blank', 'noopener,noreferrer')
      setTimeout(() => setActionState(s => ({ ...s, [current.id]: null })), 2500)
    } catch (err) {
      console.error(err)
    }
  }, [current])

  // Keyboard shortcuts
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      switch (e.key.toLowerCase()) {
        case 'a': e.preventDefault(); apply('approve'); break
        case 'r': e.preventDefault(); apply('reject'); break
        case 'c': e.preventDefault(); copyAndOpen(); break
        case 'j': case 'arrowdown': e.preventDefault(); next(); break
        case 'k': case 'arrowup': e.preventDefault(); prev(); break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [apply, copyAndOpen, next, prev])

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-10">
        <div className="text-center">
          <div className="text-[11px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Morning Brief</div>
          <h1 className="text-2xl font-semibold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>All clear</h1>
          <p className="text-[13px]" style={{ color: 'var(--text-body)' }}>
            Nothing in the queue from the last 36 hours. Gabriel runs at 7 AM CST.
          </p>
        </div>
      </div>
    )
  }

  const contentCount = items.filter(i => i.kind === 'content').length
  const outreachCount = items.filter(i => i.kind === 'outreach').length
  const approvedCount = Object.values(actionState).filter(s => s === 'approved').length

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-10 pt-8 pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="max-w-4xl mx-auto flex items-baseline justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
            <h1 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Morning Brief</h1>
          </div>
          <div className="flex items-center gap-4 text-[12px]" style={{ color: 'var(--text-body)' }}>
            <span>{cursor + 1} / {visible.length}</span>
            <span style={{ color: 'var(--text-dim)' }}>·</span>
            <span style={{ color: 'var(--state-success)' }}>{approvedCount} approved</span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto flex gap-1 mt-4">
          {(['all', 'content', 'outreach'] as const).map(f => (
            <button key={f} onClick={() => { setFilter(f); setCursor(0) }}
              className="text-[11px] px-2.5 py-1 rounded transition-colors capitalize"
              style={{ color: filter === f ? 'var(--text-primary)' : 'var(--text-body)', background: filter === f ? 'var(--bg-elevated)' : 'transparent' }}>
              {f === 'content' ? `Content ${contentCount}` : f === 'outreach' ? `Outreach ${outreachCount}` : `All ${items.length}`}
            </button>
          ))}
        </div>
      </div>

      {/* Item */}
      {current && (
        <div className="flex-1 px-10 py-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4 text-[11px]" style={{ color: 'var(--text-muted)' }}>
              <span>{LANE_LABELS[current.lane] ?? current.lane}</span>
              <span style={{ color: 'var(--text-dim)' }}>·</span>
              <span className="capitalize">{current.kind}</span>
              {current.platform && (<><span style={{ color: 'var(--text-dim)' }}>·</span><span>{current.platform}</span></>)}
              {current.message_type && (<><span style={{ color: 'var(--text-dim)' }}>·</span><span>{current.message_type}</span></>)}
              {current.katrina_required && (
                <><span style={{ color: 'var(--text-dim)' }}>·</span>
                  <span style={{ color: 'var(--state-warning)' }}>Katrina review</span></>
              )}
            </div>

            {current.title && (
              <h2 className="text-[14px] font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                {current.title}
              </h2>
            )}

            <pre className="text-[14px] leading-relaxed whitespace-pre-wrap font-sans p-5 rounded"
              style={{ background: 'var(--bg-panel)', color: 'var(--text-body)' }}>
              {current.body}
            </pre>

            {actionState[current.id] === 'approved' && (
              <div className="mt-4 text-[12px]" style={{ color: 'var(--state-success)' }}>✓ Approved · advancing...</div>
            )}
            {actionState[current.id] === 'rejected' && (
              <div className="mt-4 text-[12px]" style={{ color: 'var(--state-danger)' }}>× Rejected · advancing...</div>
            )}
            {actionState[current.id] === 'copied' && (
              <div className="mt-4 text-[12px]" style={{ color: 'var(--accent)' }}>⎘ Copied — paste in the platform tab</div>
            )}
          </div>
        </div>
      )}

      {/* Footer action bar */}
      <div className="px-10 py-4" style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-panel)' }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={prev} disabled={cursor === 0}
              className="text-[12px] px-2.5 py-1.5 rounded flex items-center gap-1.5 transition-opacity disabled:opacity-30"
              style={{ color: 'var(--text-body)' }}>
              <ChevronLeft size={12} /> Prev <kbd className="font-mono ml-1" style={{ color: 'var(--text-dim)' }}>K</kbd>
            </button>
            <button onClick={next} disabled={cursor >= visible.length - 1}
              className="text-[12px] px-2.5 py-1.5 rounded flex items-center gap-1.5 transition-opacity disabled:opacity-30"
              style={{ color: 'var(--text-body)' }}>
              Next <ChevronRight size={12} /> <kbd className="font-mono ml-1" style={{ color: 'var(--text-dim)' }}>J</kbd>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => apply('reject')}
              className="text-[12px] px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors"
              style={{ color: 'var(--state-danger)' }}>
              <X size={12} /> Reject <kbd className="font-mono ml-1" style={{ color: 'var(--text-dim)' }}>R</kbd>
            </button>
            <button onClick={copyAndOpen}
              className="text-[12px] px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors"
              style={{ color: 'var(--text-primary)', background: 'var(--bg-elevated)' }}>
              <Copy size={12} /> Copy & open <ExternalLink size={10} />
              <kbd className="font-mono ml-1" style={{ color: 'var(--text-dim)' }}>C</kbd>
            </button>
            <button onClick={() => apply('approve')}
              className="text-[12px] px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors"
              style={{ color: 'var(--bg-canvas)', background: 'var(--state-success)' }}>
              <Check size={12} /> Approve <kbd className="font-mono ml-1" style={{ color: 'rgba(0,0,0,0.4)' }}>A</kbd>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
