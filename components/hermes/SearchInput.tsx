'use client'

import { Search } from 'lucide-react'

interface SearchInputProps {
  placeholder: string
  value: string
  onChange: (v: string) => void
}

export function SearchInput({ placeholder, value, onChange }: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 text-sm text-slate-300 placeholder:text-slate-600 rounded-lg w-full focus:outline-none focus:border-indigo-500 hover:border-slate-700"
      />
    </div>
  )
}
