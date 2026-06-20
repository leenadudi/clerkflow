import { ExternalLink } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { requireStaffUser } from '@/lib/auth/app'

type DeadlineItem = {
  id: string
  title: string
  description: string
  month: number // 1-indexed
  day: number
}

const ANNUAL_DEADLINES: DeadlineItem[] = [
  {
    id: 'open-meetings-training',
    title: 'Open meetings training',
    description: 'Complete annual open meetings law compliance training if required by your state.',
    month: 1,
    day: 31,
  },
  {
    id: 'annual-financial-report',
    title: 'Annual financial report',
    description: "File the town's annual financial report with the state auditor.",
    month: 3,
    day: 31,
  },
  {
    id: 'foia-annual-report',
    title: 'FOIA annual report',
    description: 'Submit annual public records report if required by your state.',
    month: 4,
    day: 30,
  },
  {
    id: 'budget-adoption',
    title: 'Budget adoption',
    description: "Adopt the town's fiscal year budget before the new year begins.",
    month: 6,
    day: 30,
  },
  {
    id: 'board-appointment-review',
    title: 'Board appointment review',
    description: 'Review all board and commission appointments expiring before year end.',
    month: 8,
    day: 1,
  },
  {
    id: 'election-filing-deadline',
    title: 'Election filing deadline',
    description: 'Ensure all candidate filing deadlines are posted and recorded.',
    month: 9,
    day: 15,
  },
  {
    id: 'records-retention-audit',
    title: 'Records retention audit',
    description: 'Review document retention schedule and dispose of eligible records.',
    month: 10,
    day: 31,
  },
  {
    id: 'year-end-financial-close',
    title: 'Year-end financial close',
    description: 'Reconcile accounts and prepare for annual audit.',
    month: 12,
    day: 31,
  },
]

const MONTH_NAMES = [
  '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

const RESOURCE_LINKS = [
  'IIMC (International Institute of Municipal Clerks)',
  'Your state municipal clerks association',
  "State auditor's website",
  'State freedom of information advisory board',
]

export default async function CompliancePage() {
  await requireStaffUser()

  const today = new Date()
  const year = today.getFullYear()
  const thirtyDaysFromNow = new Date(today)
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Compliance"
        description="Key deadlines and annual obligations for your town."
        breadcrumbs={[{ label: 'Admin', href: '/app/tools' }, { label: 'Annual deadlines' }]}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left column — annual deadlines */}
        <div>
          <h2 className="mb-4 text-sm font-semibold text-foreground">Annual deadlines</h2>
          <div className="flex flex-col gap-3">
            {ANNUAL_DEADLINES.map((item) => {
              const deadlineDate = new Date(year, item.month - 1, item.day)
              const isPast = deadlineDate < today
              const isDueSoon =
                !isPast &&
                deadlineDate <= thirtyDaysFromNow

              let dotColor = 'bg-slate-300'
              if (isPast) dotColor = 'bg-[#16a34a]'
              else if (isDueSoon) dotColor = 'bg-[#d97706]'

              const formattedDate = `${MONTH_NAMES[item.month]} ${item.day}, ${year}`

              return (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-lg border border-border bg-surface p-4"
                >
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <span
                      className={`size-2.5 shrink-0 rounded-full ${dotColor}`}
                      aria-hidden
                    />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-[#475569]">{formattedDate}</span>
                      {isDueSoon && (
                        <Badge
                          variant="outline"
                          className="border-[#d97706]/40 bg-[#d97706]/10 text-[10px] text-[#d97706]"
                        >
                          Due soon
                        </Badge>
                      )}
                      {isPast && (
                        <Badge
                          variant="outline"
                          className="border-[#16a34a]/40 bg-[#16a34a]/10 text-[10px] text-[#16a34a]"
                        >
                          Past
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm font-medium text-foreground">{item.title}</p>
                    <p className="mt-0.5 text-sm text-[#475569]">{item.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Resources card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Resources</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 pt-0">
              {RESOURCE_LINKS.map((label) => (
                <div
                  key={label}
                  className="flex items-center gap-2 text-sm text-[#475569]"
                >
                  <ExternalLink className="size-3.5 shrink-0 text-[#475569]" aria-hidden />
                  <span>{label}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* FOIA deadline reminder card */}
          <Card className="border-[#2563eb]/30 bg-[#2563eb]/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">
                FOIA deadline reminder
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-[#475569]">
                Your town is configured for <strong>5 business day</strong> FOIA response
                deadlines. Verify this matches your state&apos;s statutory requirement.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
