import Link from 'next/link'
import { Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

const NAV = [
  { label: 'Product', href: '/product' },
  { label: 'For Small Towns', href: '/for-small-towns' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

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

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="hidden sm:inline-flex"
            render={<Link href="/app">Clerk sign in</Link>}
          />
          <Button render={<Link href="/contact">Request demo</Link>} />
        </div>
      </div>
    </header>
  )
}
