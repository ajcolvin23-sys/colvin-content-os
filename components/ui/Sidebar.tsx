'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: '⚡' },
  { href: '/calendar', label: 'Calendar', icon: '📅' },
  { href: '/create', label: 'Create Content', icon: '✏️' },
  { href: '/piano-videos', label: 'Piano Videos', icon: '🎹' },
  { href: '/backflow-facebook', label: 'Backflow Facebook', icon: '💧' },
  { href: '/linkedin', label: 'LinkedIn', icon: '💼' },
  { href: '/assets', label: 'Assets', icon: '🗂️' },
  { href: '/approvals', label: 'Approvals', icon: '✅' },
  { href: '/post-queue', label: 'Post Queue', icon: '📱' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
  { href: '/logs', label: 'Audit Logs', icon: '📋' },
]

export default function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-gray-900 border-r border-gray-800 flex flex-col z-50">
      <div className="p-5 border-b border-gray-800">
        <div className="text-lg font-bold text-white">Colvin Content OS</div>
        <div className="text-xs text-gray-400 mt-0.5">Alfred Colvin</div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <span className="text-base">{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
        <div>Draft-first. Human approval.</div>
        <div className="mt-1">No auto-post without permission.</div>
      </div>
    </aside>
  )
}
