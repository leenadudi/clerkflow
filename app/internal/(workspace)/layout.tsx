'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function InternalWorkspaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  async function logout() {
    await fetch('/api/internal/auth/logout', { method: 'POST' })
    router.push('/internal/login')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border bg-sidebar text-sidebar-foreground">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Shield className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold leading-tight">Clerkflow Internal</p>
              <p className="text-xs text-sidebar-foreground/60">Founder prospecting</p>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              nativeButton={false}
              render={<Link href="/internal/prospects">Prospects</Link>}
            />
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              className="text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              render={<Link href="/">Public site</Link>}
            />
            <Button
              variant="outline"
              size="sm"
              className="border-sidebar-border bg-transparent text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={logout}
            >
              <LogOut className="size-4" /> Sign out
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  )
}
