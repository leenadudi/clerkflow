'use client'

import { useState } from 'react'
import { CheckCircle2, Mail, MapPin, Phone } from 'lucide-react'
import { MarketingPageLayout } from '@/components/marketing/page-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    const form = new FormData(e.currentTarget)
    await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.get('name'),
        role: form.get('role'),
        town: form.get('town'),
        state: form.get('state'),
        email: form.get('email'),
        population: form.get('population'),
        preferredDate: form.get('preferredDate'),
        preferredTime: form.get('preferredTime'),
        message: form.get('message'),
      }),
    })
    setSubmitting(false)
    setSubmitted(true)
  }

  return (
    <MarketingPageLayout className="max-w-5xl">
      <div className="max-w-2xl">
        <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Schedule a walkthrough
        </h1>
        <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
          See how Clerkflow works for towns like yours. We&apos;ll walk through
          meetings, FOIA, and the resident hub — no pressure, no six-month sales
          cycle.
        </p>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardContent className="p-6 md:p-8">
            {submitted ? (
              <div className="flex flex-col items-center py-8 text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
                  <CheckCircle2 className="size-7" />
                </span>
                <h2 className="mt-5 text-xl font-semibold text-foreground">
                  Thanks — we&apos;ll be in touch soon.
                </h2>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  We typically respond within one business day. In the meantime,
                  explore the{' '}
                  <a href="/app" className="font-medium text-primary hover:underline">
                    demo dashboard
                  </a>{' '}
                  or the{' '}
                  <a href="/riverside-oh" className="font-medium text-primary hover:underline">
                    resident hub
                  </a>
                  .
                </p>
              </div>
            ) : (
              <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="text-sm font-medium text-foreground">
                      Your name
                    </label>
                    <Input id="name" name="name" required placeholder="Barbara Jensen" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="role" className="text-sm font-medium text-foreground">
                      Role
                    </label>
                    <Input id="role" name="role" placeholder="Town Clerk" />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="town" className="text-sm font-medium text-foreground">
                      Town / township
                    </label>
                    <Input id="town" name="town" required placeholder="Township of Riverside" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="state" className="text-sm font-medium text-foreground">
                      State
                    </label>
                    <Input id="state" name="state" required placeholder="OH" maxLength={2} />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="clerk@yourtown.gov"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="population" className="text-sm font-medium text-foreground">
                    Population (optional)
                  </label>
                  <Input id="population" name="population" placeholder="1,200" />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="preferred-date" className="text-sm font-medium text-foreground">
                      Preferred date
                    </label>
                    <Input
                      id="preferred-date"
                      name="preferredDate"
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="preferred-time" className="text-sm font-medium text-foreground">
                      Preferred time
                    </label>
                    <select
                      id="preferred-time"
                      name="preferredTime"
                      required
                      className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                    >
                      <option value="">Select a time</option>
                      {[
                        '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
                        '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
                        '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
                        '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
                        '5:00 PM',
                      ].map((t) => (
                        <option key={t} value={t}>{t} ET</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="message" className="text-sm font-medium text-foreground">
                    Anything else? (optional)
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell us about your current setup or what you're hoping to solve..."
                    className="min-h-24 resize-none"
                  />
                </div>

                <Button type="submit" size="lg" className="w-fit" disabled={submitting}>
                  {submitting ? 'Sending…' : 'Schedule a walkthrough'}
                </Button>

                <p className="text-xs text-muted-foreground">
                  By submitting, you agree to our{' '}
                  <a href="/privacy" className="underline hover:text-foreground">
                    privacy policy
                  </a>
                  . We&apos;ll never share your information with third parties.
                </p>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold text-foreground">What to expect</h2>
              <ul className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">
                <li>30-minute video walkthrough</li>
                <li>Live Q&A with someone who knows municipal clerks</li>
                <li>No obligation — explore the demo on your own first</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-4 p-6 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Email</p>
                  <a
                    href="mailto:leena@clerkflow.software"
                    className="text-muted-foreground hover:text-foreground hover:underline"
                  >
                    leena@clerkflow.software
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Phone</p>
                  <p className="text-muted-foreground">Available after demo request</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Based in</p>
                  <p className="text-muted-foreground">United States</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MarketingPageLayout>
  )
}
