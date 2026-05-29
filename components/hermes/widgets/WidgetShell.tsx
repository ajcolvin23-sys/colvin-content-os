// Shared shell for every widget — quiet, no border, type-driven header.
import { ReactNode } from 'react'

interface WidgetShellProps {
  title: string
  meta?: string
  children: ReactNode
}

export function WidgetShell({ title, meta, children }: WidgetShellProps) {
  return (
    <div
      className="rounded-md p-5"
      style={{ background: 'var(--bg-panel)' }}
    >
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-[13px] font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h2>
        {meta && (
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {meta}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

export function WidgetRow({
  primary, secondary, meta, href,
}: {
  primary: string
  secondary?: string
  meta?: string
  href?: string
}) {
  const content = (
    <div
      className="flex items-center gap-3 py-2 transition-colors"
      style={{ borderBottom: '1px solid var(--border-subtle)' }}
    >
      <div className="flex-1 min-w-0">
        <div className="text-[13px] truncate" style={{ color: 'var(--text-primary)' }}>
          {primary}
        </div>
        {secondary && (
          <div className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
            {secondary}
          </div>
        )}
      </div>
      {meta && (
        <div className="text-[11px] flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
          {meta}
        </div>
      )}
    </div>
  )
  if (href) {
    // Avoid the import on every row — use anchor since we're in a server component
    return <a href={href}>{content}</a>
  }
  return content
}

export function WidgetEmpty({ message }: { message: string }) {
  return (
    <div className="py-6 text-center text-[12px]" style={{ color: 'var(--text-dim)' }}>
      {message}
    </div>
  )
}
