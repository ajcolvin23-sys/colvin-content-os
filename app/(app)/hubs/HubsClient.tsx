'use client'

import { useState } from 'react'
import type { Hub } from '@/lib/crm/types'
import { HubCard } from '@/components/hermes/HubCard'
import { SearchInput } from '@/components/hermes/SearchInput'
import { FilterBar } from '@/components/hermes/FilterBar'
import { EmptyState } from '@/components/hermes/EmptyState'
import { PageHeader } from '@/components/hermes/PageHeader'
import { HUB_STATUSES, HUB_PRIORITIES } from '@/lib/crm/constants'
import { LayoutGrid } from 'lucide-react'

interface Props {
  initialHubs: Hub[]
}

export function HubsClient({ initialHubs }: Props) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [seeding, setSeeding] = useState(false)
  const [seedMsg, setSeedMsg] = useState('')

  const categories = Array.from(new Set(initialHubs.map(h => h.category).filter(Boolean))) as string[]

  const filtered = initialHubs.filter(hub => {
    if (search && !hub.name.toLowerCase().includes(search.toLowerCase()) && !hub.description?.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter && hub.status !== statusFilter) return false
    if (priorityFilter && hub.priority !== priorityFilter) return false
    if (categoryFilter && hub.category !== categoryFilter) return false
    return true
  })

  const handleSeed = async () => {
    setSeeding(true)
    setSeedMsg('')
    try {
      const res = await fetch('/api/hermes/seed', { method: 'POST' })
      const data = await res.json()
      if (res.status === 409) {
        setSeedMsg('Already seeded. Refresh to see data.')
      } else if (res.ok) {
        setSeedMsg(`Seeded: ${data.counts?.hubs} hubs, ${data.counts?.tasks} tasks, ${data.counts?.revenue} revenue ops`)
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setSeedMsg(`Error: ${data.error}`)
      }
    } catch (err) {
      setSeedMsg(`Failed: ${String(err)}`)
    } finally {
      setSeeding(false)
    }
  }

  const activeCount = initialHubs.filter(h => ['Active', 'Revenue Focus'].includes(h.status)).length
  const buildingCount = initialHubs.filter(h => h.status === 'Building').length

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Hubs"
        subtitle={`${initialHubs.length} total · ${activeCount} active · ${buildingCount} building`}
        action={
          initialHubs.length === 0 ? (
            <div className="flex flex-col items-end gap-1">
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm rounded-lg font-medium transition-colors"
              >
                {seeding ? 'Seeding...' : 'Seed All 20 Hubs'}
              </button>
              {seedMsg && <span className="text-xs text-slate-400">{seedMsg}</span>}
            </div>
          ) : undefined
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 max-w-xs">
          <SearchInput placeholder="Search hubs..." value={search} onChange={setSearch} />
        </div>
        <FilterBar
          filters={[
            { key: 'status', label: 'Status', options: [...HUB_STATUSES], value: statusFilter, onChange: setStatusFilter },
            { key: 'priority', label: 'Priority', options: [...HUB_PRIORITIES], value: priorityFilter, onChange: setPriorityFilter },
            { key: 'category', label: 'Category', options: categories, value: categoryFilter, onChange: setCategoryFilter },
          ]}
        />
      </div>

      {/* Grid */}
      {initialHubs.length === 0 ? (
        <EmptyState
          icon={LayoutGrid}
          title="No hubs yet"
          description="Seed the database to load all 20 business hubs with tasks, research, prompts, and revenue opportunities."
          action={
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm rounded-lg font-medium transition-colors"
              >
                {seeding ? 'Seeding...' : 'Seed All 20 Hubs'}
              </button>
              {seedMsg && <span className="text-xs text-slate-400">{seedMsg}</span>}
            </div>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={LayoutGrid}
          title="No hubs match filters"
          description="Try adjusting your search or filter criteria."
          action={
            <button onClick={() => { setSearch(''); setStatusFilter(''); setPriorityFilter(''); setCategoryFilter('') }}
              className="text-xs text-indigo-400 hover:text-indigo-300 underline">
              Clear filters
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(hub => (
            <HubCard key={hub.id} hub={hub} />
          ))}
        </div>
      )}
    </div>
  )
}
