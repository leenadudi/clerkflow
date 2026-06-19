import Link from 'next/link'
import { Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="size-4" />
          </span>
          <span className="text-lg font-semibold tracking-tight">Clerkflow</span>
        </Link>

        <div className="flex items-center gap-2">
          <a
            href="/demo"
            className="hidden items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted sm:inline-flex"
          >
            Try the demo
          </a>
          <Button
            size="sm"
            nativeButton={false}
            className="hidden sm:inline-flex sm:h-8 sm:px-3"
            render={<Link href="/contact">Schedule a walkthrough</Link>}
          />
        </div>
      </div>
    </header>
  )
}
