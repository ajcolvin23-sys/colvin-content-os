'use client'

import { useState } from 'react'
import { StatusBadge } from '@/components/hermes/StatusBadge'
import { SearchInput } from '@/components/hermes/SearchInput'
import { FilterBar } from '@/components/hermes/FilterBar'
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
    } catch {
      // clipboard not available
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 max-w-xs">
          <SearchInput placeholder="Search prompts..." value={search} onChange={setSearch} />
        </div>
        <FilterBar
          filters={[
            { key: 'category', label: 'Category', options: categories, value: categoryFilter, onChange: setCategoryFilter },
          ]}
        />
      </div>

      <div className="space-y-2">
        {filtered.map(prompt => {
          const hub = prompt.hubs as Record<string, unknown> | null
          const isExpanded = expanded === (prompt.id as string)

          return (
            <div key={prompt.id as string} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-colors">
              <div
                className="px-5 py-4 cursor-pointer"
                onClick={() => setExpanded(isExpanded ? null : (prompt.id as string))}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white">{prompt.title as string}</span>
                      {Boolean(prompt.category) && (
                        <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded">{prompt.category as string}</span>
                      )}
                      <StatusBadge status={prompt.status as string} />
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      {Boolean(prompt.use_case) && <span className="text-xs text-slate-500">{prompt.use_case as string}</span>}
                      {hub && (
                        <Link
                          href={`/hubs/${hub.slug}`}
                          onClick={e => e.stopPropagation()}
                          className="text-xs text-slate-600 hover:text-indigo-400 transition-colors"
                        >
                          {hub.name as string}
                        </Link>
                      )}
                      {Boolean(prompt.model_target) && (
                        <span className="text-xs text-slate-700">{prompt.model_target as string}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      if (prompt.prompt_text) copy(prompt.id as string, prompt.prompt_text as string)
                    }}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors flex-shrink-0"
                    title="Copy prompt"
                  >
                    {copiedId === (prompt.id as string)
                      ? <Check className="w-3.5 h-3.5 text-emerald-400" />
                      : <Copy className="w-3.5 h-3.5 text-slate-400" />
                    }
                  </button>
                </div>
              </div>

              {isExpanded && Boolean(prompt.prompt_text) && (
                <div className="border-t border-slate-800 px-5 py-4">
                  <div className="bg-slate-800/50 rounded-lg p-4 text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
                    {prompt.prompt_text as string}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-10 text-xs text-slate-600">No prompts match your search.</div>
        )}
      </div>
    </div>
  )
}
