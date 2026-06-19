import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { SidebarNav } from '@/components/clerk/sidebar-nav'
import { TopBar } from '@/components/clerk/top-bar'
import { WorkspaceProvider } from '@/components/clerk/workspace-context'
import { getTownView, listFoiaRequests } from '@/lib/server/data'
import { getAppContext, isClerkConfigured } from '@/lib/auth/app'
import { isDatabaseConfigured } from '@/lib/db'
import { maybeAutoConnect } from '@/lib/gmail/auto-connect'

export const metadata: Metadata = {
  title: 'Clerkflow — Home',
}

export const dynamic = 'force-dynamic'

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const context = await getAppContext()
  if (
    isClerkConfigured() &&
    isDatabaseConfigured() &&
    context.clerkUserId &&
    !context.user
  ) {
    redirect('/app/onboarding')
  }

  // Auto-connect Gmail if the user signed in with Google and granted Gmail scopes
  if (context.townId && context.clerkUserId && context.user) {
    void maybeAutoConnect({
      townId: context.townId,
      userId: context.user.id,
      clerkUserId: context.clerkUserId,
    })
  }

  const h = await headers()
  const isDemo = h.get('x-clerkflow-demo') === '1'

  const town = await getTownView()
  const foiaRequests = await listFoiaRequests()
  const foiaOverdueCount = foiaRequests.filter((r) => r.status === 'overdue').length
  const foiaDueSoonCount = foiaRequests.filter((r) => r.status === 'due-soon').length

  return (
    <WorkspaceProvider town={town} foiaOverdueCount={foiaOverdueCount} foiaDueSoonCount={foiaDueSoonCount}>
      {isDemo && (
        <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-4 bg-[#1e3a5f] px-4 py-2 text-xs text-white/90 md:pl-68">
          <span>
            <strong className="font-semibold text-white">Demo mode</strong>
            {' '}— you&apos;re browsing sample data. Nothing you do here is saved.
          </span>
          <a
            href="/demo/exit"
            className="shrink-0 rounded-md border border-white/20 px-2.5 py-1 text-[11px] font-medium text-white/80 transition-colors hover:border-white/40 hover:text-white"
          >
            Exit demo
          </a>
        </div>
      )}
      <div className={`flex min-h-screen bg-background${isDemo ? ' pt-8' : ''}`}>
        <aside className={`fixed ${isDemo ? 'inset-y-0 top-8' : 'inset-y-0'} left-0 hidden w-64 md:block`}>
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
