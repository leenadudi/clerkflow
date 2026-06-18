import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { StatusPill, type StatusKey } from '@/components/status-pill'
import { Card } from '@/components/ui/card'
import { getLicense } from '@/lib/server/data'
import { StatusActions } from './_components/status-actions'

export default async function LicenseDetailPage({
  params,
}: {
  params: Promise<{ formId: string }>
}) {
  const { formId } = await params
  const license = await getLicense(formId)
  if (!license) notFound()

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title={license.typeLabel}
        breadcrumbs={[
          { label: 'Permits & Licenses', href: '/app/services' },
          { label: license.id },
        ]}
      />

      <div className="mt-6 flex flex-col gap-4">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">{license.id}</p>
              <h2 className="mt-0.5 text-base font-semibold text-foreground">
                {license.applicantName}
              </h2>
            </div>
            <StatusPill status={license.status as StatusKey} />
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Type</dt>
              <dd className="font-medium text-foreground">{license.typeLabel}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Submitted</dt>
              <dd className="font-medium text-foreground">{license.submittedAt}</dd>
            </div>
            {license.applicantEmail && (
              <div>
                <dt className="text-xs text-muted-foreground">Email</dt>
                <dd className="font-medium text-foreground">
                  <a
                    href={`mailto:${license.applicantEmail}`}
                    className="text-primary hover:underline"
                  >
                    {license.applicantEmail}
                  </a>
                </dd>
              </div>
            )}
            {license.applicantPhone && (
              <div>
                <dt className="text-xs text-muted-foreground">Phone</dt>
                <dd className="font-medium text-foreground">{license.applicantPhone}</dd>
              </div>
            )}
            {license.expiresAt && (
              <div>
                <dt className="text-xs text-muted-foreground">Expires</dt>
                <dd className="font-medium text-foreground">{license.expiresAt}</dd>
              </div>
            )}
            {license.fee && (
              <div>
                <dt className="text-xs text-muted-foreground">Fee</dt>
                <dd className="font-medium text-foreground">
                  {license.fee}{' '}
                  <span
                    className={
                      license.feePaid ? 'text-success' : 'text-warning-foreground'
                    }
                  >
                    ({license.feePaid ? 'Paid' : 'Unpaid'})
                  </span>
                </dd>
              </div>
            )}
          </dl>

          {license.description && (
            <div className="mt-4 border-t border-border pt-4">
              <p className="text-xs text-muted-foreground">Description</p>
              <p className="mt-1 text-sm text-foreground">{license.description}</p>
            </div>
          )}
        </Card>

        {license.status !== 'expired' && (
          <div className="flex justify-end">
            <StatusActions id={license.id} status={license.status} />
          </div>
        )}
      </div>
    </div>
  )
}
