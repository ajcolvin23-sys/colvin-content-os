import { PRIORITY_COLORS } from '@/lib/crm/constants'

export function PriorityBadge({ priority }: { priority: string }) {
  const classes = PRIORITY_COLORS[priority] ?? 'bg-slate-500/10 text-slate-400'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${classes}`}>
      {priority}
    </span>
  )
}
