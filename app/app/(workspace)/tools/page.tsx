import { Send, ShieldCheck, DollarSign, ClipboardCheck, Upload, Inbox, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { requireStaffUser } from '@/lib/auth/app'

const TOOLS = [
  {
    label: 'Email inbox',
    description: 'View incoming emails and FOIA requests received through Gmail.',
    href: '/app/inbox',
    icon: Inbox,
  },
  {
    label: 'Publish to resident hub',
    description: 'Control what residents see on your town\'s public website.',
    href: '/app/publish',
    icon: Send,
  },
  {
    label: 'Annual deadlines',
    description: 'Filing calendar and annual compliance obligations for your town.',
    href: '/app/compliance',
    icon: ShieldCheck,
  },
  {
    label: 'Fee tracker',
    description: 'Permit fee collection status — outstanding and recently paid.',
    href: '/app/finance',
    icon: DollarSign,
  },
  {
    label: 'Clerk handoff',
    description: 'Succession checklist to prepare a transition package for the next clerk.',
    href: '/app/handoff',
    icon: ClipboardCheck,
  },
  {
    label: 'Import data',
    description: 'Bulk import existing records from spreadsheets or other systems.',
    href: '/app/import',
    icon: Upload,
  },
]

export default async function ToolsPage() {
  await requireStaffUser()

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Admin"
        description="Administrative tools and less-frequent tasks."
        breadcrumbs={[{ label: 'Admin' }]}
      />

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
        <div className="divide-y divide-border">
          {TOOLS.map((tool) => {
            const Icon = tool.icon
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="flex items-center gap-4 px-6 py-5 transition-colors hover:bg-muted/40"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Icon className="size-4 text-muted-foreground" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{tool.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{tool.description}</p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground/40" aria-hidden />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
