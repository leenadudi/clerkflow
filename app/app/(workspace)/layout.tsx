import type { Metadata } from 'next'
import { SidebarNav } from '@/components/clerk/sidebar-nav'
import { TopBar } from '@/components/clerk/top-bar'
import { WorkspaceProvider } from '@/components/clerk/workspace-context'
import { getTownView, listFoiaRequests } from '@/lib/server/data'

export const metadata: Metadata = {
  title: 'Clerkflow — Home',
}

export const dynamic = 'force-dynamic'

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const town = await getTownView()
  const foiaRequests = await listFoiaRequests()
  const foiaAttentionCount = foiaRequests.filter(
    (item) => item.status === 'new' || item.status === 'overdue',
  ).length

  return (
    <WorkspaceProvider town={town} foiaAttentionCount={foiaAttentionCount}>
      <div className="flex min-h-screen bg-background">
        <aside className="fixed inset-y-0 left-0 hidden w-64 md:block">
          <SidebarNav />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col md:pl-64">
          <TopBar />
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </WorkspaceProvider>
  )
}
