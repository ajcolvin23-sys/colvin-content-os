import Sidebar from '@/components/ui/Sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-canvas)' }}>
      <Sidebar />
      <main
        className="flex-1 md:ml-60 min-h-screen overflow-auto"
        style={{ background: 'var(--bg-canvas)' }}
      >
        {children}
      </main>
    </div>
  )
}
