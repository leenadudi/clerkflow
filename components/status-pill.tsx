import { cn } from '@/lib/utils'

export type StatusKey =
  | 'overdue'
  | 'due-soon'
  | 'new'
  | 'in-progress'
  | 'complete'
  | 'published'
  | 'draft'
  | 'scheduled'
  | 'cancelled'
  | 'pending'
  | 'approved'
  | 'denied'
  | 'expired'

const STATUS_STYLES: Record<
  StatusKey,
  { label: string; className: string; dot: string }
> = {
  overdue: {
    label: 'Overdue',
    className: 'bg-destructive/10 text-destructive',
    dot: 'bg-destructive',
  },
  'due-soon': {
    label: 'Due soon',
    className: 'bg-warning/15 text-warning-foreground',
    dot: 'bg-warning',
  },
  new: {
    label: 'New',
    className: 'bg-primary/10 text-primary',
    dot: 'bg-primary',
  },
  'in-progress': {
    label: 'In progress',
    className: 'bg-primary/10 text-primary',
    dot: 'bg-primary',
  },
  complete: {
    label: 'Complete',
    className: 'bg-success/15 text-success',
    dot: 'bg-success',
  },
  published: {
    label: 'Published',
    className: 'bg-success/15 text-success',
    dot: 'bg-success',
  },
  draft: {
    label: 'Draft',
    className: 'bg-muted text-muted-foreground',
    dot: 'bg-muted-foreground',
  },
  scheduled: {
    label: 'Scheduled',
    className: 'bg-success/15 text-success',
    dot: 'bg-success',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-destructive/10 text-destructive',
    dot: 'bg-destructive',
  },
  pending: {
    label: 'Pending',
    className: 'bg-warning/15 text-warning-foreground',
    dot: 'bg-warning',
  },
  approved: {
    label: 'Approved',
    className: 'bg-success/15 text-success',
    dot: 'bg-success',
  },
  denied: {
    label: 'Denied',
    className: 'bg-destructive/10 text-destructive',
    dot: 'bg-destructive',
  },
  expired: {
    label: 'Expired',
    className: 'bg-muted text-muted-foreground',
    dot: 'bg-muted-foreground',
  },
}

function normalizeStatus(s: string): StatusKey {
  const normalized = s.replace(/_/g, '-') as StatusKey
  return normalized in STATUS_STYLES ? normalized : 'new'
}

export function StatusPill({
  status,
  label,
  className,
}: {
  status: StatusKey | string
  label?: string
  className?: string
}) {
  const config = STATUS_STYLES[normalizeStatus(status)]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className,
      )}
    >
      <span className={cn('size-1.5 rounded-full', config.dot)} aria-hidden />
      {label ?? config.label}
    </span>
  )
}
