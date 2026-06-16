import Link from 'next/link'
import { ArrowRight, Heart, MapPin, Target } from 'lucide-react'
import { CtaBanner } from '@/components/marketing/cta-banner'
import { MarketingPageLayout } from '@/components/marketing/page-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const VALUES = [
  {
    icon: Target,
    title: 'Clerks first',
    body: 'Every feature starts with a real clerk workflow — not a product manager\'s imagination of local government.',
  },
  {
    icon: MapPin,
    title: 'Small towns deserve modern tools',
    body: 'Cities of 500,000 get dedicated software budgets. Towns of 1,200 deserve the same quality, priced for reality.',
  },
  {
    icon: Heart,
    title: 'Calm over complexity',
    body: 'Government software doesn\'t have to feel like government software. Clerkflow is designed to reduce anxiety, not add to it.',
  },
]

export default function AboutPage() {
  return (
    <MarketingPageLayout className="max-w-4xl">
      <div>
        <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Modern tools for the people who keep towns running.
        </h1>
        <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
          Clerkflow is building the operating system for municipal clerks in US
          towns under 5,000 — the places too small for enterprise ERP and too
          important to run on spreadsheets forever.
        </p>
      </div>

      <section className="mt-12 space-y-6 text-muted-foreground">
        <p className="leading-relaxed">
          We started Clerkflow after talking to dozens of town clerks across the
          Midwest. The same story came up every time: FOIA requests tracked in
          Excel, meeting minutes in a shared folder, board terms on a whiteboard
          in the break room, and a resident hub that hadn&apos;t been updated since
          2019.
        </p>
        <p className="leading-relaxed">
          The clerks we met weren&apos;t looking for another platform to learn. They
          wanted one calm place where the town&apos;s work lives — where a missed
          FOIA deadline shows up as red on the dashboard, not as a phone call
          from an angry requester.
        </p>
        <p className="leading-relaxed">
          That&apos;s what we&apos;re building. Clerkflow is headquartered in the US and
          built specifically for the statutory workflows, deadlines, and public
          transparency requirements that small-town clerks navigate every day.
        </p>
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-3">
        {VALUES.map((value) => {
          const Icon = value.icon
          return (
            <Card key={value.title}>
              <CardContent className="p-6">
                <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <h2 className="mt-4 text-lg font-semibold text-foreground">
                  {value.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {value.body}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </section>

      <section className="mt-16 border-y border-border bg-card py-10">
        <p className="text-balance text-center text-xl font-medium leading-relaxed text-foreground">
          &ldquo;We&apos;re not trying to replace the clerk. We&apos;re trying to give them
          their evenings back.&rdquo;
        </p>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          — The Clerkflow team
        </p>
      </section>

      <section className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <p className="text-muted-foreground">
          Want to help shape the product? We&apos;re always looking to talk to
          clerks.
        </p>
        <Button
          render={
            <Link href="/contact">
              Get in touch <ArrowRight className="size-4" />
            </Link>
          }
        />
      </section>

      <section className="mt-16">
        <CtaBanner
          title="Talk to us"
          description="Whether you're a clerk, a council member, or a state association — we'd love to hear from you."
        />
      </section>
    </MarketingPageLayout>
  )
}
