import Link from 'next/link'
import {
  ArrowRight,
  Calendar,
  ClipboardList,
  FileText,
  LayoutGrid,
  Send,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { CtaBanner } from '@/components/marketing/cta-banner'
import { MarketingPageLayout } from '@/components/marketing/page-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const MODULES = [
  {
    icon: LayoutGrid,
    title: 'Command center',
    body: 'Start every day with a clear picture of overdue FOIA requests, upcoming meetings, expiring board terms, and renewals — all in one view.',
    href: '/app',
  },
  {
    icon: Calendar,
    title: 'Meetings',
    body: 'Build agendas, capture minutes, assign action items, and publish to your resident hub when ready. No more Word docs in shared drives.',
    href: '/app/meetings',
  },
  {
    icon: FileText,
    title: 'Public records (FOIA)',
    body: 'Log requests, track statutory deadlines, manage correspondence, and walk through a release workflow so nothing slips through the cracks.',
    href: '/app/foia',
  },
  {
    icon: ClipboardList,
    title: 'Services & forms',
    body: 'Dog licenses, vendor permits, event applications — build forms once and route submissions to the right staff.',
    href: '/app/services',
  },
  {
    icon: Users,
    title: 'Boards & commissions',
    body: 'Track members, seats, and term expirations. See which appointments need council action before a seat goes vacant.',
    href: '/app/boards',
  },
  {
    icon: Send,
    title: 'Resident hub',
    body: 'A public-facing site where residents view meetings, submit FOIA requests, apply for permits, and track status — no login required.',
    href: '/riverside-oh',
  },
]

export default function ProductPage() {
  return (
    <MarketingPageLayout>
      <div className="max-w-2xl">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <ShieldCheck className="size-3.5 text-primary" />
          One workspace for the whole town
        </span>
        <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Everything the clerk office runs on — in one place.
        </h1>
        <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
          Clerkflow is built around how small-town clerks actually work: meetings on
          Tuesday, FOIA in the inbox, board terms expiring next month, and residents
          calling to ask if their permit went through.
        </p>
        <div className="mt-7">
          <Button
            size="lg"
            render={
              <Link href="/contact">
                Request a demo <ArrowRight className="size-4" />
              </Link>
            }
          />
        </div>
      </div>

      <section className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((mod) => {
          const Icon = mod.icon
          return (
            <Link key={mod.title} href={mod.href} className="group">
              <Card className="h-full transition-colors group-hover:border-primary/40 group-hover:bg-accent">
                <CardContent className="flex h-full flex-col p-6">
                  <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <h2 className="mt-4 text-lg font-semibold text-foreground">
                    {mod.title}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {mod.body}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    See it live <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </section>

      <section className="mt-16 border-y border-border bg-card py-14">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Designed for clerks, not IT departments
            </h2>
            <p className="mt-3 text-muted-foreground">
              No six-month implementation. No consultant army. Clerkflow is
              cloud-based, works in any browser, and is priced so most towns can
              approve it without a formal RFP.
            </p>
          </div>
          <ul className="flex flex-col gap-3 text-sm text-foreground">
            {[
              'Set up in days, not months',
              'Import existing records with guided wizard',
              'State-specific compliance reminders',
              'Unlimited staff users included',
              'Resident hub included at no extra cost',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-16">
        <CtaBanner />
      </section>
    </MarketingPageLayout>
  )
}
