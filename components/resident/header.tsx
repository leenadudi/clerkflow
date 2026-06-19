import Link from 'next/link'
import { Landmark } from 'lucide-react'
import type { PublicTown } from '@/lib/server/public-data'

export function ResidentHeader({ town }: { town: PublicTown }) {
  const base = `/${town.slug}`
  const NAV = [
    { label: 'Home', href: base },
    { label: 'Meetings', href: `${base}/meetings` },
    { label: 'Records request', href: `${base}/foia` },
    { label: 'Apply', href: `${base}/apply` },
    { label: 'Track request', href: `${base}/track` },
  ]

  return (
    <header className="border-b border-border bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
        <Link href={base} className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary-foreground/15">
            <Landmark className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight">{town.name}</p>
            <p className="text-xs text-primary-foreground/70">Official resident services</p>
          </div>
        </Link>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-primary-foreground/85 transition-colors hover:text-primary-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
