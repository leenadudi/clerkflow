import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function CtaBanner({
  title = 'See Clerkflow in action',
  description = 'Book a 30-minute walkthrough with your clerk team. No sales pressure — just a look at how it works for towns like yours.',
}: {
  title?: string
  description?: string
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex flex-col items-start gap-6 p-8 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          <p className="mt-2 text-muted-foreground">{description}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            render={
              <Link href="/contact">
                Request a demo <ArrowRight className="size-4" />
              </Link>
            }
          />
          <Button
            size="lg"
            variant="outline"
            render={<Link href="/app">Explore the dashboard</Link>}
          />
        </div>
      </CardContent>
    </Card>
  )
}
