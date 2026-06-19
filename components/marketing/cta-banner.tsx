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
        <Button
          size="lg"
          nativeButton={false}
          render={
            <Link href="/contact">
              Schedule a walkthrough <ArrowRight className="size-4" />
            </Link>
          }
        />
      </CardContent>
    </Card>
  )
}
