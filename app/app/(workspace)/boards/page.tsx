import { Users } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { listBoardTerms } from '@/lib/server/data'
import { AddMemberForm } from './_components/add-member-form'
import { RemoveMemberButton } from './_components/remove-member-button'

export default async function BoardsPage() {
  const terms = await listBoardTerms()

  const grouped = terms.reduce<Record<string, typeof terms>>((acc, term) => {
    if (!acc[term.board]) acc[term.board] = []
    acc[term.board].push(term)
    return acc
  }, {})

  const expiringCount = terms.filter((t) => t.expiringSoon).length

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Boards & commissions"
        description="Track member appointments, seats, and term expiration dates."
        breadcrumbs={[{ label: 'Boards' }]}
        actions={<AddMemberForm />}
      />

      {expiringCount > 0 && (
        <div className="mt-6 rounded-lg border border-warning/40 bg-warning/5 px-4 py-3 text-sm text-warning-foreground">
          <strong>{expiringCount} term{expiringCount > 1 ? 's' : ''} expiring within 60 days.</strong>{' '}
          Coordinate with the mayor to fill vacancies before they lapse.
        </div>
      )}

      {terms.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Users}
            title="No board members yet"
            description="Add members to track their appointments, seats, and term expiration dates."
          />
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-6">
          {Object.entries(grouped).map(([boardName, members]) => (
            <Card key={boardName} className="overflow-hidden p-0">
              <div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-3">
                <h2 className="text-sm font-semibold text-foreground">{boardName}</h2>
                <span className="text-xs text-muted-foreground">
                  {members.length} member{members.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="divide-y divide-border">
                {members.map((term) => (
                  <div
                    key={term.id}
                    className="flex items-center justify-between px-5 py-3.5"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{term.member}</p>
                      <p className="text-xs text-muted-foreground">{term.seat}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Term ends</p>
                        <p
                          className={
                            term.expiringSoon
                              ? 'text-xs font-semibold text-warning-foreground'
                              : 'text-xs font-medium text-foreground'
                          }
                        >
                          {term.expires}
                          {term.expiringSoon && (
                            <Badge
                              variant="outline"
                              className="ml-2 border-warning/40 bg-warning/10 text-[10px] text-warning-foreground"
                            >
                              Expiring soon
                            </Badge>
                          )}
                        </p>
                      </div>
                      <RemoveMemberButton id={term.id} name={term.member} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
