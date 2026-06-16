import Link from 'next/link'
import {
  Calendar,
  FileText,
  ClipboardCheck,
  Search,
  CreditCard,
  FileSearch,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ResidentHeader } from '@/components/resident/header'
import { TOWN } from '@/lib/data'

const ACTIONS = [
  {
    icon: Calendar,
    title: 'View meetings & minutes',
    desc: 'Agendas, minutes, and upcoming council and board meetings.',
    href: `/${TOWN.slug}/meetings`,
  },
  {
    icon: FileText,
    title: 'Submit a public records request',
    desc: 'Request documents under Ohio public records law.',
    href: `/${TOWN.slug}/foia`,
  },
  {
    icon: ClipboardCheck,
    title: 'Apply for a license or permit',
    desc: 'Dog licenses, vendor permits, and event applications.',
    href: `/${TOWN.slug}/apply`,
  },
  {
    icon: FileSearch,
    title: 'Track my request',
    desc: 'Check the status of a request with your confirmation number.',
    href: `/${TOWN.slug}/track`,
  },
  {
    icon: CreditCard,
    title: 'Pay a fee',
    desc: 'Pay permit fees, fines, and utility bills online.',
    href: `/${TOWN.slug}/pay`,
  },
  {
    icon: FileSearch,
    title: 'Search town records',
    desc: 'Find published ordinances, resolutions, and notices.',
    href: `/${TOWN.slug}/search`,
  },
]

export default function ResidentHomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ResidentHeader />

      <main className="flex-1">
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-5xl px-4 pb-12 pt-6 md:px-6">
            <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              How can we help you today?
            </h1>
            <p className="mt-2 max-w-xl text-primary-foreground/80">
              Most town services are available online — no account needed.
            </p>
            <div className="relative mt-6 max-w-xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search services, meetings, or records..."
                className="h-12 rounded-xl bg-card pl-12 text-foreground"
                aria-label="Search town services"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto -mt-6 max-w-5xl px-4 pb-16 md:px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ACTIONS.map((action) => {
              const Icon = action.icon
              return (
                <Link key={action.title} href={action.href} className="group">
                  <Card className="h-full transition-colors group-hover:border-primary/40 group-hover:bg-accent">
                    <CardContent className="flex h-full flex-col p-6">
                      <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="size-6" />
                      </span>
                      <h2 className="mt-4 text-base font-semibold text-foreground">
                        {action.title}
                      </h2>
                      <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">
                        {action.desc}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                        Get started{' '}
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-muted-foreground md:px-6">
          <p className="font-medium text-foreground">{TOWN.name}</p>
          <p className="mt-1">
            Town Hall · Main Chamber · Open Monday–Friday, 9 AM–4 PM
          </p>
          <p className="mt-3 text-xs">Powered by Clerkflow</p>
        </div>
      </footer>
    </div>
  )
}
