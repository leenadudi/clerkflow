import { DollarSign } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/empty-state'
import { getAppContext } from '@/lib/auth/app'
import { withTownContext } from '@/lib/db'

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

function formatDate(date: Date | string | null): string {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

type LicenseRow = {
  id: string
  applicantName: string
  type: string
  fee: number | null
  feePaidAt: Date | null
  status: string
  submittedAt: Date
}

function statusColor(status: string): string {
  switch (status) {
    case 'approved':
      return 'border-[#16a34a]/40 bg-[#16a34a]/10 text-[#16a34a]'
    case 'denied':
      return 'border-[#dc2626]/40 bg-[#dc2626]/10 text-[#dc2626]'
    case 'expired':
      return 'border-[#dc2626]/40 bg-[#dc2626]/10 text-[#dc2626]'
    case 'pending':
      return 'border-[#d97706]/40 bg-[#d97706]/10 text-[#d97706]'
    default:
      return 'border-slate-300 bg-slate-100 text-slate-600'
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

async function getLicenseFees(townId: string): Promise<LicenseRow[]> {
  return withTownContext(townId, async (db) => {
    return db.query.licenses.findMany({
      where: (l, { and, eq, isNotNull: isNotNullHelper, gt }) =>
        and(eq(l.townId, townId), isNotNullHelper(l.fee)),
      columns: {
        id: true,
        applicantName: true,
        type: true,
        fee: true,
        feePaidAt: true,
        status: true,
        submittedAt: true,
      },
    })
  })
}

export default async function FinancePage() {
  const context = await getAppContext()
  const townId = context.townId

  let allFeeRecords: LicenseRow[] = []

  if (townId) {
    allFeeRecords = await getLicenseFees(townId)
  }

  const paid = allFeeRecords.filter((r) => r.feePaidAt !== null)
  const outstanding = allFeeRecords.filter(
    (r) => r.feePaidAt === null && r.status !== 'denied',
  )

  const totalCollected = paid.reduce((sum, r) => sum + (r.fee ?? 0), 0)
  const totalOutstanding = outstanding.reduce((sum, r) => sum + (r.fee ?? 0), 0)

  const recentPaid = [...paid]
    .sort((a, b) => new Date(b.feePaidAt!).getTime() - new Date(a.feePaidAt!).getTime())
    .slice(0, 5)

  const noFees = allFeeRecords.length === 0

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Finance"
        description="Fee collection and payment status."
        breadcrumbs={[{ label: 'Admin', href: '/app/tools' }, { label: 'Finance' }]}
      />

      {noFees ? (
        <div className="mt-6">
          <EmptyState
            icon={DollarSign}
            title="No fees recorded yet"
            description="Add a fee amount when approving permit applications."
          />
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-5">
                <p className="text-xs font-medium uppercase tracking-wide text-[#475569]">
                  Total collected
                </p>
                <p className="mt-1 text-2xl font-semibold text-[#16a34a]">
                  {formatCurrency(totalCollected)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <p className="text-xs font-medium uppercase tracking-wide text-[#475569]">
                  Outstanding
                </p>
                <p className="mt-1 text-2xl font-semibold text-[#d97706]">
                  {formatCurrency(totalOutstanding)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <p className="text-xs font-medium uppercase tracking-wide text-[#475569]">
                  Permits with fees
                </p>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {allFeeRecords.length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Outstanding payments */}
          {outstanding.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-foreground">
                Outstanding payments
              </h2>
              <Card className="overflow-hidden p-0">
                <div className="divide-y divide-border">
                  {outstanding.map((record) => (
                    <div
                      key={record.id}
                      className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {record.applicantName}
                        </p>
                        <p className="text-xs text-[#475569]">
                          {record.type.replace(/_/g, ' ')} · Submitted{' '}
                          {formatDate(record.submittedAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={statusColor(record.status)}
                        >
                          {capitalize(record.status)}
                        </Badge>
                        <span className="text-sm font-semibold text-foreground">
                          {formatCurrency(record.fee ?? 0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </section>
          )}

          {/* Recent payments */}
          {recentPaid.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-foreground">
                Recent payments
              </h2>
              <Card className="overflow-hidden p-0">
                <div className="divide-y divide-border">
                  {recentPaid.map((record) => (
                    <div
                      key={record.id}
                      className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {record.applicantName}
                        </p>
                        <p className="text-xs text-[#475569]">
                          {record.type.replace(/_/g, ' ')} · Paid{' '}
                          {formatDate(record.feePaidAt)}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-[#16a34a]">
                        {formatCurrency(record.fee ?? 0)}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
