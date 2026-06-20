import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'default',
  href,
}: {
  label: string
  value: string | number
  hint?: string
  icon: LucideIcon
  tone?: 'default' | 'danger' | 'warning' | 'success'
  href?: string
}) {
  const toneStyles = {
    default: 'bg-primary/10 text-primary',
    danger: 'bg-destructive/10 text-destructive',
    warning: 'bg-warning/15 text-warning-foreground',
    success: 'bg-success/15 text-success',
  }[tone]

  const valueTone =
    tone === 'danger'
      ? 'text-destructive'
      : tone === 'warning'
        ? 'text-warning-foreground'
        : 'text-foreground'

  const card = (
    <Card className={cn(href && 'transition-shadow hover:shadow-md')}>
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className={cn('mt-1 text-3xl font-semibold tracking-tight', valueTone)}>
            {value}
          </p>
          {hint ? (
            <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
          ) : null}
        </div>
        <span
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-lg',
            toneStyles,
          )}
        >
          <Icon className="size-5" aria-hidden />
        </span>
      </CardContent>
    </Card>
  )

  if (href) {
    return (
      <Link href={href} className="block">
        {card}
      </Link>
    )
  }

  return card
}
