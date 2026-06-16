import Link from 'next/link'
import { ArrowRight, Check, HelpCircle } from 'lucide-react'
import { CtaBanner } from '@/components/marketing/cta-banner'
import { MarketingPageLayout } from '@/components/marketing/page-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const FEATURES = [
  'Unlimited clerk & staff users',
  'Command center dashboard',
  'Meetings — agendas, minutes, action items',
  'FOIA queue with deadline tracking',
  'Services & permit forms',
  'Boards & term expiration alerts',
  'Public resident hub',
  'Email & phone support',
  'Guided data import',
]

const FAQ = [
  {
    q: 'Do we need an RFP or formal procurement?',
    a: 'Most towns under 5,000 can approve Clerkflow under their informal purchase threshold — typically $2,000–$5,000 annually. We provide a simple quote letter for your council packet.',
  },
  {
    q: 'Is there a setup fee?',
    a: 'No. Onboarding and guided import are included. We help you get live in the first week.',
  },
  {
    q: 'What about our existing records?',
    a: 'Clerkflow includes an import wizard for spreadsheets, PDFs, and common legacy formats. You do not need to re-enter years of FOIA logs by hand.',
  },
  {
    q: 'Can residents use it without creating an account?',
    a: 'Yes. The resident hub is public — residents submit requests and track status with a confirmation number, no login required.',
  },
  {
    q: 'Is our data secure?',
    a: 'Clerkflow runs on encrypted cloud infrastructure with role-based access for staff. We do not sell town data. See our privacy policy for details.',
  },
]

export default function PricingPage() {
  return (
    <MarketingPageLayout>
      <div className="max-w-2xl">
        <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Simple pricing for small budgets.
        </h1>
        <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
          One flat monthly rate per town. No per-user fees, no surprise add-ons,
          and priced under most municipal procurement thresholds.
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <Card className="border-primary/30 shadow-sm">
          <CardHeader>
            <p className="text-sm font-medium text-primary">Most popular</p>
            <CardTitle className="text-2xl">Town plan</CardTitle>
            <p className="text-muted-foreground">
              For municipalities under 5,000 residents
            </p>
          </CardHeader>
          <CardContent>
            <p className="flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tight text-foreground">
                $99
              </span>
              <span className="text-muted-foreground">– $149</span>
              <span className="text-sm text-muted-foreground">/ month</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Final price depends on population and modules. Most towns land at
              $129/month.
            </p>
            <ul className="mt-6 flex flex-col gap-2.5">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              size="lg"
              className="mt-8 w-full"
              render={
                <Link href="/contact">
                  Request a quote <ArrowRight className="size-4" />
                </Link>
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">What&apos;s included</CardTitle>
            <p className="text-muted-foreground">
              Everything you need to run the clerk office — nothing held back for
              an &ldquo;enterprise&rdquo; tier.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">Implementation</p>
              <p className="mt-1">
                Guided onboarding call, town profile setup, and import assistance
                for your existing FOIA log and meeting records.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">Resident hub</p>
              <p className="mt-1">
                Your public site at{' '}
                <span className="font-mono text-foreground">yourtown.clerkflow.software</span>{' '}
                — meetings, FOIA, permits, and request tracking for residents.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">Support</p>
              <p className="mt-1">
                Real humans who understand municipal clerks. Email and phone
                support during business hours, with priority response for
                deadline-sensitive FOIA issues.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/40 p-4">
              <p className="flex items-center gap-2 font-medium text-foreground">
                <HelpCircle className="size-4 text-primary" />
                Procurement-friendly
              </p>
              <p className="mt-2">
                We provide a one-page quote letter, W-9, and sample council
                resolution language. Annual billing available for budget cycles.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Frequently asked questions
        </h2>
        <div className="mt-6 flex flex-col gap-4">
          {FAQ.map((item) => (
            <Card key={item.q}>
              <CardContent className="p-5">
                <p className="font-medium text-foreground">{item.q}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <CtaBanner
          title="Get a quote for your town"
          description="Tell us your population and state — we'll send a simple quote letter you can put in the next council packet."
        />
      </section>
    </MarketingPageLayout>
  )
}
