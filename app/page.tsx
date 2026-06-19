import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import {
  ShieldCheck,
  ArrowRight,
  Calendar,
  ClipboardList,
  FileText,
  LayoutGrid,
  Send,
  Users,
  Mail,
  Mic,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MarketingHeader } from '@/components/marketing/header'
import { MarketingFooter } from '@/components/marketing/footer'
import { CtaBanner } from '@/components/marketing/cta-banner'

const MODULES = [
  {
    icon: LayoutGrid,
    title: 'Command center',
    body: 'Start every day knowing what needs attention — overdue FOIA requests first, then upcoming meetings, expiring board terms, and license renewals. Nothing hides.',
  },
  {
    icon: Calendar,
    title: 'Meetings',
    body: 'Build agendas, capture minutes, record motions and votes, track attendance, and publish everything to your resident hub when ready. No more Word docs in shared drives.',
  },
  {
    icon: Mic,
    title: 'Transcription',
    body: 'Upload a meeting recording or paste a YouTube link. Clerkflow transcribes the audio and drops the text straight into your minutes draft as a starting point.',
  },
  {
    icon: FileText,
    title: 'Public records',
    body: 'Log requests, track statutory deadlines, manage correspondence, and fulfill or deny with a clear workflow. Replies to email-sourced requests thread back through Gmail automatically.',
  },
  {
    icon: Mail,
    title: 'Email inbox',
    body: 'Connect your Gmail and Clerkflow reads, classifies, and routes incoming resident emails — creating FOIA requests, permit applications, and complaint records without copy-pasting.',
  },
  {
    icon: ClipboardList,
    title: 'Permits & licenses',
    body: 'Dog licenses, vendor permits, burn permits, event applications — accept submissions from email or the resident hub and track status through to approval.',
  },
  {
    icon: Users,
    title: 'Boards & commissions',
    body: 'Track members, seats, and term expirations. See which appointments need council action before a seat goes vacant.',
  },
  {
    icon: Send,
    title: 'Resident hub',
    body: 'A public-facing site where residents view agendas and minutes, submit records requests, apply for permits, and track status by confirmation number — no login required.',
  },
]

const TRUST_ITEMS = [
  'Set up in days, not months',
  'Under most municipal procurement thresholds at $99–149/mo',
  'State-specific FOIA deadline tracking built in',
  'Unlimited staff users included',
  'Resident hub included at no extra cost',
  'Gmail integration — no extra tools needed',
]

export default async function HomePage() {
  const { userId } = await auth()
  if (userId) redirect('/app')

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-2 md:px-6 md:py-24">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="size-3.5 text-primary" />
              Built for small towns
            </span>
            <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              The clerk operating system designed specifically for small towns.
            </h1>
            <p className="mt-5 max-w-md text-pretty text-lg leading-relaxed text-muted-foreground">
              Clerkflow replaces spreadsheets, inbox chaos, and scattered tools
              with one calm workspace for meetings, public records, permits, and a
              public hub your residents will actually use.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                nativeButton={false}
                render={
                  <Link href="/contact">
                    Schedule a walkthrough <ArrowRight className="size-4" />
                  </Link>
                }
              />
              <a
                href="/demo/launch"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Try the demo
              </a>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-border shadow-sm">
            <Image
              src="/images/town-hall.png"
              alt="A small-town brick town hall with a white clock tower and American flag"
              width={1024}
              height={768}
              className="h-full w-full object-cover"
              priority
            />
          </div>
        </section>

        {/* Modules */}
        <section className="mx-auto max-w-6xl px-4 pb-16 md:px-6">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Everything the clerk office runs on
          </h2>
          <p className="mt-2 text-muted-foreground">
            Built around how small-town clerks actually work.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {MODULES.map((mod) => {
              const Icon = mod.icon
              return (
                <Card key={mod.title}>
                  <CardContent className="p-6">
                    <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="mt-4 text-base font-semibold text-foreground">
                      {mod.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {mod.body}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* For clerks, not IT */}
        <section className="border-y border-border bg-card">
          <div className="mx-auto max-w-6xl px-4 py-14 md:px-6">
            <div className="grid gap-10 md:grid-cols-2 md:items-center">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  Designed for clerks, not IT departments
                </h2>
                <p className="mt-3 text-muted-foreground">
                  No six-month implementation. No consultant army. Clerkflow is
                  cloud-based, works in any browser, and priced so most towns
                  can approve it without a formal RFP.
                </p>
              </div>
              <ul className="flex flex-col gap-3 text-sm text-foreground">
                {TRUST_ITEMS.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#16a34a]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <CtaBanner />
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}
