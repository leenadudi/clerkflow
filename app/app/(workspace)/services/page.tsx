import Link from 'next/link'
import { ClipboardList } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { StatusPill, type StatusKey } from '@/components/status-pill'
import { EmptyState } from '@/components/empty-state'
import { Card } from '@/components/ui/card'
import { listLicenses } from '@/lib/server/data'
import { NewLicenseForm } from './_components/new-license-form'

const FILTERS: { key: StatusKey | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'denied', label: 'Denied' },
  { key: 'expired', label: 'Expired' },
]

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const allLicenses = await listLicenses()

  const filtered =
    !status || status === 'all'
      ? allLicenses
      : allLicenses.filter((l) => l.status === status)

  const pendingCount = allLicenses.filter((l) => l.status === 'pending').length

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Permits & Licenses"
        description="Licenses, permits, and applications."
        breadcrumbs={[{ label: 'Permits & Licenses' }]}
        actions={<NewLicenseForm />}
      />

      {pendingCount > 0 && (
        <div className="mt-6 rounded-lg border border-warning/40 bg-warning/5 px-4 py-3 text-sm text-warning-foreground">
          <strong>{pendingCount} application{pendingCount > 1 ? 's' : ''} pending review.</strong>
        </div>
      )}

      <div className="mt-6 flex gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === 'all' ? '/app/services' : `/app/services?status=${f.key}`}
            className={[
              'rounded-full px-3 py-1 text-xs font-medium transition-colors',
              (!status && f.key === 'all') || status === f.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
            ].join(' ')}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={ClipboardList}
            title="No applications"
            description="Applications submitted online or logged manually will appear here."
          />
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {filtered.map((license) => (
            <Link key={license.id} href={`/app/services/${license.id}`}>
              <Card className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:border-primary/40 hover:bg-accent">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-muted-foreground">{license.id}</p>
                    <StatusPill status={license.status as StatusKey} />
                  </div>
                  <p className="mt-0.5 text-sm font-medium text-foreground">
                    {license.typeLabel} — {license.applicantName}
                  </p>
                  {license.description && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {license.description}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-muted-foreground">Submitted</p>
                  <p className="text-xs font-medium text-foreground">{license.submittedAt}</p>
                  {license.fee && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {license.fee} {license.feePaid ? '· Paid' : '· Unpaid'}
                    </p>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
