'use client'

import Link from 'next/link'
import { FileText, ClipboardList } from 'lucide-react'

export function MeetingQuickLinks({
  meetingId,
  isPast,
}: {
  meetingId: string
  isPast: boolean
}) {
  return (
    <div className="relative z-10 mt-1.5 flex items-center gap-3">
      <Link
        href={`/app/meetings/${meetingId}?tab=agenda`}
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
      >
        <FileText className="size-3" />
        Edit agenda
      </Link>
      {isPast && (
        <Link
          href={`/app/meetings/${meetingId}?tab=minutes`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
        >
          <ClipboardList className="size-3" />
          Record minutes
        </Link>
      )}
    </div>
  )
}
