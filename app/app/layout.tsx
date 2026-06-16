import type { Metadata } from 'next'
import { SidebarNav } from '@/components/clerk/sidebar-nav'
import { TopBar } from '@/components/clerk/top-bar'

export const metadata: Metadata = {
  title: 'Clerkflow — Home',
}

export default function ClerkLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 md:block">
        <SidebarNav />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col md:pl-64">
        <TopBar />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  )
}
