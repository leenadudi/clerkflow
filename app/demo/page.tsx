import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { MarketingHeader } from '@/components/marketing/header'
import { MarketingFooter } from '@/components/marketing/footer'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Demo — Clerkflow',
  description: 'Try Clerkflow with sample data. No login required.',
}

export default function DemoPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center md:px-6 md:py-28">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Interactive demo
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            The real app. Sample data.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Click around the full Clerkflow interface — meetings, records requests,
            permits, boards — with realistic dummy data. No login, no setup, nothing saved.
          </p>

          <a
            href="/demo/launch"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          >
            Open demo <ArrowRight className="size-5" />
          </a>

          <p className="mt-4 text-xs text-muted-foreground">
            Opens the full app · Session lasts 4 hours · No account needed
          </p>

          <div className="mt-16 border-t border-border pt-12">
            <p className="text-sm text-muted-foreground">
              Want a walkthrough tailored to your town?
            </p>
            <div className="mt-3">
              <Button
                nativeButton={false}
                render={
                  <Link href="/contact">
                    Schedule a walkthrough <ArrowRight className="size-4" />
                  </Link>
                }
              />
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  )
}
