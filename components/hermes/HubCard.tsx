import Link from 'next/link'
import type { Hub } from '@/lib/crm/types'
import { StatusBadge } from './StatusBadge'
import { PriorityBadge } from './PriorityBadge'
import { ArrowRight } from 'lucide-react'

export function HubCard({ hub }: { hub: Hub }) {
  return (
    <Link href={`/hubs/${hub.slug}`}>
      <div
        className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all cursor-pointer group h-full flex flex-col"
        style={{ borderLeft: `3px solid ${hub.color ?? '#6366f1'}` }}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="font-semibold text-white text-sm leading-snug group-hover:text-indigo-300 transition-colors">
              {hub.name}
            </h3>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <StatusBadge status={hub.status} />
              <PriorityBadge priority={hub.priority} />
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 flex-1 mb-3">
          {hub.description}
        </p>
        {hub.next_action && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/50 rounded-lg px-3 py-2 mt-auto">
            <ArrowRight className="w-3 h-3 text-indigo-400 flex-shrink-0" />
            <span className="line-clamp-1">{hub.next_action}</span>
          </div>
        )}
        {hub.revenue_potential && (
          <div className="text-[10px] text-slate-600 mt-2">{hub.revenue_potential}</div>
        )}
      </div>
    </Link>
  )
}
