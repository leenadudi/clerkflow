'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV = [{ href: '/internal/prospects', label: 'Prospects' }]

export function InternalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const isLogin = pathname === '/internal/login'

  if (isLogin) {
    return <>{children}</>
  }

  async function logout() {
    await fetch('/api/internal/auth/logout', { method: 'POST' })
    router.push('/internal/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-sidebar text-sidebar-foreground">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
          <div className="flex items-center gap-6">
            <Link href="/internal/prospects" className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Shield className="size-4" />
              </span>
              <span className="text-sm font-semibold">Clerkflow Internal</span>
            </Link>
            <nav className="hidden items-center gap-1 sm:flex">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                    pathname === item.href
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              render={<Link href="/">Public site</Link>}
            />
            <Button
              variant="outline"
              size="sm"
              className="border-sidebar-border bg-transparent text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={logout}
            >
              <LogOut className="size-4" />
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">{children}</main>
    </div>
  )
}
