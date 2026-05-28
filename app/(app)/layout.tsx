import Sidebar from '@/components/ui/Sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-6 overflow-auto min-h-screen">
        {children}
      </main>
    </div>
  )
}
