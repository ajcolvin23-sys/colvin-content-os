import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  icon: LucideIcon
  value: number | string
  label: string
  iconColor?: string
  href?: string
  alert?: boolean
}

export function MetricCard({ icon: Icon, value, label, iconColor = 'text-slate-400', href, alert }: MetricCardProps) {
  const card = (
    <div className={`bg-slate-900 border rounded-xl p-5 flex items-start gap-4 transition-all ${alert ? 'border-amber-500/30 bg-amber-500/5' : 'border-slate-800 hover:border-slate-700'} ${href ? 'cursor-pointer' : ''}`}>
      <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
        <Icon className={`w-5 h-5 ${alert ? 'text-amber-400' : iconColor}`} />
      </div>
      <div>
        <div className={`text-2xl font-bold ${alert ? 'text-amber-400' : 'text-white'}`}>{value}</div>
        <div className="text-xs text-slate-500 mt-0.5">{label}</div>
      </div>
    </div>
  )
  return href ? <Link href={href}>{card}</Link> : card
}
