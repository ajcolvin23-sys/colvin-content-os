'use client'

interface Filter {
  key: string
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
}

export function FilterBar({ filters }: { filters: Filter[] }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {filters.map(f => (
        <select
          key={f.key}
          value={f.value}
          onChange={e => f.onChange(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-1.5 hover:border-slate-700 focus:outline-none focus:border-indigo-500"
        >
          <option value="">{f.label}: All</option>
          {f.options.map(o => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      ))}
    </div>
  )
}
