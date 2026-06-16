import Link from 'next/link'
import {
  ArrowRight,
  Building2,
  Clock,
  FileSpreadsheet,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { CtaBanner } from '@/components/marketing/cta-banner'
import { MarketingPageLayout } from '@/components/marketing/page-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const PAIN_POINTS = [
  {
    icon: FileSpreadsheet,
    title: 'FOIA lives in a spreadsheet',
    body: 'Deadlines are calculated by hand. When the clerk is out sick, nobody knows what\'s overdue until a requester calls the mayor.',
  },
  {
    icon: Clock,
    title: 'Meetings are a folder of Word docs',
    body: 'Agendas get emailed around. Minutes sit in draft for weeks. Publishing to the website means copying and pasting into a CMS nobody remembers how to use.',
  },
  {
    icon: Users,
    title: 'Board terms expire quietly',
    body: 'Planning commission seats, zoning appeals, parks board — terms expire and appointments slip until a resident asks why the board hasn\'t met.',
  },
]

const NOT_FOR_YOU = [
  {
    label: 'Enterprise ERP',
    why: 'Built for cities of 50,000+. Six-figure contracts, 18-month implementations, and modules you\'ll never use.',
  },
  {
    label: 'Generic project tools',
    why: 'Asana and Monday don\'t know what a FOIA deadline is or how Ohio public records law works.',
  },
  {
    label: 'Spreadsheets forever',
    why: 'Free until a missed deadline becomes a front-page story — or until the retiring clerk takes institutional knowledge with them.',
  },
]

export default function ForSmallTownsPage() {
  return (
    <MarketingPageLayout>
      <div className="max-w-2xl">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <Building2 className="size-3.5 text-primary" />
          Towns under 5,000
        </span>
        <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          You don&apos;t need enterprise software. You need a clerk OS.
        </h1>
        <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
          Small towns are stuck between tools that are too big and workflows that
          are too manual. Clerkflow is the third option — purpose-built for the
          clerk who runs the whole town on grit and a shared drive.
        </p>
      </div>

      <section className="mt-16 grid gap-6 md:grid-cols-3">
        {PAIN_POINTS.map((point) => {
          const Icon = point.icon
          return (
            <Card key={point.title}>
              <CardContent className="p-6">
                <span className="flex size-11 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                  <Icon className="size-5" />
                </span>
                <h2 className="mt-4 text-lg font-semibold text-foreground">
                  {point.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {point.body}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </section>

      <section className="mt-16 border-y border-border bg-card py-14">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            The retirement wave is real
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            Across the country, experienced town clerks are retiring — and taking
            decades of institutional knowledge with them. The FOIA log is in
            Barbara&apos;s head. The meeting folder naming convention made sense to
            one person. The new hire inherits chaos, not a system.
          </p>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            Clerkflow is designed for succession: everything in one place, with
            workflows that don&apos;t depend on tribal knowledge. When the next clerk
            starts, they open the command center and see exactly what needs
            attention today.
          </p>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          What small towns don&apos;t need
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {NOT_FOR_YOU.map((item) => (
            <Card key={item.label}>
              <CardContent className="p-5">
                <p className="font-semibold text-foreground">{item.label}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.why}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <div className="rounded-2xl border border-border bg-primary p-8 text-primary-foreground md:p-10">
          <h2 className="text-2xl font-semibold tracking-tight">
            Built for your budget and your council
          </h2>
          <p className="mt-3 max-w-2xl text-primary-foreground/85">
            At $99–149/month, Clerkflow costs less than a part-time temp and
            stays under most informal procurement thresholds. No RFP. No
            six-month evaluation committee. Just a tool that works.
          </p>
          <ul className="mt-6 flex flex-col gap-2 text-sm">
            {[
              'Approved by councils in towns under 1,500',
              'Quote letter ready for your next meeting packet',
              'Annual billing aligned to your fiscal year',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <ShieldCheck className="size-4 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <Button
            size="lg"
            variant="outline"
            className="mt-8 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
            render={
              <Link href="/pricing">
                See pricing <ArrowRight className="size-4" />
              </Link>
            }
          />
        </div>
      </section>

      <section className="mt-16">
        <CtaBanner />
      </section>
    </MarketingPageLayout>
  )
}
