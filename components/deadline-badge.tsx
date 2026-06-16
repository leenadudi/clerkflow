import { AlertTriangle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Shows the days remaining or overdue relative to a due date.
 * Tone is derived purely from the day delta so color + text always agree.
 */
export function DeadlineBadge({
  daysRemaining,
  className,
}: {
  daysRemaining: number
  className?: string
}) {
  const overdue = daysRemaining < 0
  const dueSoon = daysRemaining >= 0 && daysRemaining <= 2

  const tone = overdue
    ? 'bg-destructive/10 text-destructive'
    : dueSoon
      ? 'bg-warning/15 text-warning-foreground'
      : 'bg-muted text-muted-foreground'

  const Icon = overdue ? AlertTriangle : Clock

  const label = overdue
    ? `${Math.abs(daysRemaining)} ${Math.abs(daysRemaining) === 1 ? 'day' : 'days'} overdue`
    : daysRemaining === 0
      ? 'Due today'
      : `Due in ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}`

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium',
        tone,
        className,
      )}
    >
      <Icon className="size-4" aria-hidden />
      {label}
    </span>
  )
}
