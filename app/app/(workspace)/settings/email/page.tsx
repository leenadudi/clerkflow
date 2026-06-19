import { Mail } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { requireStaffUser } from '@/lib/auth/app'
import { getDb } from '@/lib/db'
import { gmailConnections } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { GmailToggle } from './gmail-toggle'

export default async function EmailSettingsPage() {
  const context = await requireStaffUser()

  let connection: typeof gmailConnections.$inferSelect | null = null
  if (context.townId && context.clerkUserId) {
    const db = getDb()
    connection = await db.query.gmailConnections.findFirst({
      where: and(
        eq(gmailConnections.townId, context.townId),
        eq(gmailConnections.clerkUserId, context.clerkUserId),
        eq(gmailConnections.isActive, true),
      ),
    }) ?? null
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Email settings"
        description="Receive and reply to resident emails directly from Clerkflow."
        breadcrumbs={[{ label: 'Settings', href: '/app/settings' }, { label: 'Email' }]}
      />

      <div className="mt-6 flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="size-4 text-muted-foreground" />
              Gmail integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GmailToggle
              enabled={!!connection}
              gmailAddress={connection?.gmailAddress ?? null}
              emailsProcessed={connection?.emailsProcessed ?? 0}
              requestsCreated={connection?.requestsCreated ?? 0}
              lastCheckedAt={connection?.lastCheckedAt?.toISOString() ?? null}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">How it works</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
            <p>
              When enabled, Clerkflow reads your Gmail every 5 minutes and classifies incoming
              emails using AI — flagging records requests, permit applications, and resident
              complaints for your attention.
            </p>
            <p>
              You can reply to emails directly from your Clerkflow inbox. Clerkflow never deletes
              or modifies your Gmail messages.
            </p>
            <p className="text-xs">
              Requires signing in with Google. Gmail scopes must be enabled in your Clerk
              configuration.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
