'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import Link from 'next/link'

interface Props {
  prompts: Record<string, unknown>[]
  categories: string[]
}

export function PromptsClient({ prompts, categories }: Props) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = prompts.filter(p => {
    if (search && !((p.title as string) ?? '').toLowerCase().includes(search.toLowerCase()) &&
        !((p.use_case as string) ?? '').toLowerCase().includes(search.toLowerCase())) return false
    if (categoryFilter && p.category !== categoryFilter) return false
    return true
  })

  const copy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch { /* clipboard not available */ }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search prompts..."
          className="flex-1 max-w-xs text-[13px]"
        />
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="text-[12px]"
        >
          <option value="">Category: All</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="space-y-1">
        {filtered.map(prompt => {
          const hub = prompt.hubs as Record<string, unknown> | null
          const isExpanded = expanded === (prompt.id as string)

          return (
            <div key={prompt.id as string} className="rounded" style={{ background: 'var(--bg-panel)' }}>
              <div className="px-5 py-3 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : (prompt.id as string))}>
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                        {prompt.title as string}
                      </span>
                      {Boolean(prompt.category) && (
                        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{prompt.category as string}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {Boolean(prompt.use_case) && (
                        <span className="text-[11px]" style={{ color: 'var(--text-body)' }}>{prompt.use_case as string}</span>
                      )}
                      {hub && (
                        <Link
                          href={`/h/${hub.slug as string}`}
                          onClick={e => e.stopPropagation()}
                          className="text-[11px]"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {hub.name as string}
                        </Link>
                      )}
                      {Boolean(prompt.model_target) && (
                        <span className="text-[10px] font-mono" style={{ color: 'var(--text-dim)' }}>
                          {prompt.model_target as string}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      if (prompt.prompt_text) copy(prompt.id as string, prompt.prompt_text as string)
                    }}
                    className="p-1.5 rounded transition-colors flex-shrink-0"
                    style={{ background: 'var(--bg-elevated)' }}
                    title="Copy prompt"
                  >
                    {copiedId === (prompt.id as string)
                      ? <Check size={12} strokeWidth={1.5} style={{ color: 'var(--state-success)' }} />
                      : <Copy size={12} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
                    }
                  </button>
                </div>
              </div>

              {isExpanded && Boolean(prompt.prompt_text) && (
                <div className="px-5 pb-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <pre className="text-[11px] font-mono leading-relaxed whitespace-pre-wrap mt-3 p-3 rounded" style={{ background: 'var(--bg-canvas)', color: 'var(--text-body)' }}>
                    {prompt.prompt_text as string}
                  </pre>
                </div>
              )}
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-10 text-[12px]" style={{ color: 'var(--text-dim)' }}>
            No prompts match
          </div>
        )}
      </div>
    </div>
  )
}
