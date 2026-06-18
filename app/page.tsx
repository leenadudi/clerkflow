import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import {
  ShieldCheck,
  ArrowRight,
  Calendar,
  FileText,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MarketingHeader } from '@/components/marketing/header'
import { MarketingFooter } from '@/components/marketing/footer'

const PILLARS = [
  {
    icon: Calendar,
    title: 'Meetings',
    body: 'Build agendas, capture minutes, track action items, and publish to residents in a few clicks.',
  },
  {
    icon: FileText,
    title: 'Public records',
    body: 'Log FOIA requests, track statutory deadlines, and never miss a response window again.',
  },
  {
    icon: Users,
    title: 'Resident hub',
    body: 'A simple public site where residents find meetings, apply for licenses, and track requests.',
  },
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
              with one calm workspace for meetings, public records, forms, and a
              public hub your residents will actually use.
            </p>
            <div className="mt-7">
              <Button
                size="lg"
                nativeButton={false}
                render={
                  <Link href="/contact">
                    Request a demo <ArrowRight className="size-4" />
                  </Link>
                }
              />
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

        {/* Problem */}
        <section className="border-y border-border bg-card">
          <div className="mx-auto max-w-6xl px-4 py-14 md:px-6">
            <div className="max-w-2xl">
              <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Small towns run on spreadsheets and sticky notes.
              </h2>
              <p className="mt-3 text-pretty text-muted-foreground">
                The clerk often wears five hats, and a retirement wave means
                institutional knowledge walks out the door. Clerkflow keeps the
                whole town&apos;s work in one calm, organized place — so a missed
                deadline never becomes a legal problem.
              </p>
            </div>
          </div>
        </section>

        {/* Pillars */}
        <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <div className="grid gap-6 md:grid-cols-3">
            {PILLARS.map((p) => {
              const Icon = p.icon
              return (
                <Card key={p.title}>
                  <CardContent className="p-6">
                    <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="mt-4 text-lg font-semibold text-foreground">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                      {p.body}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Social proof placeholder */}
        <section className="border-y border-border bg-secondary/50">
          <div className="mx-auto max-w-3xl px-4 py-14 text-center md:px-6">
            <p className="text-balance text-xl font-medium leading-relaxed text-foreground">
              &ldquo;For the first time, I can see every FOIA deadline and meeting
              in one place. It feels like the town finally has its act
              together.&rdquo;
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Town Clerk · Small township in Ohio
            </p>
          </div>
        </section>

      </main>

      <MarketingFooter />
    </div>
  )
}
