import { EVIDENCE_COLORS } from '@/lib/crm/constants'

export function EvidenceBadge({ quality }: { quality: string }) {
  const classes = EVIDENCE_COLORS[quality] ?? 'bg-slate-500/10 text-slate-400'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${classes}`}>
      {quality}
    </span>
  )
}
