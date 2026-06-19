'use client'

import { useCallback, useEffect, useState } from 'react'
import { Users, Mail, Inbox } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Card } from '@/components/ui/card'
import { InviteForm } from './_components/invite-form'
import { RemoveMemberButton } from './_components/remove-member-button'
import { GmailToggle } from './email/gmail-toggle'

type Member = {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

type PendingInvite = {
  id: string
  email: string
  role: string
  createdAt: string
  expiresAt: string
}

type GmailStatus = {
  connected: boolean
  gmailAddress?: string
  emailsProcessed?: number
  requestsCreated?: number
  lastCheckedAt?: string | null
}

type TeamData = {
  members: Member[]
  pending: PendingInvite[]
  maxMembers: number
  currentUserId: string
  isAdmin: boolean
}

function roleLabel(role: string) {
  if (role === 'admin' || role === 'town_clerk') return 'Admin'
  if (role === 'staff') return 'Admin'
  return 'Member'
}

export default function SettingsPage() {
  const [data, setData] = useState<TeamData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [gmail, setGmail] = useState<GmailStatus | null>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/app/team')
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null
      setError(body?.error ?? 'Failed to load team.')
      return
    }
    setError(null)
    setData(await res.json())
  }, [])

  useEffect(() => {
    load()
    fetch('/api/email/status').then((r) => r.json()).then(setGmail).catch(() => {})
  }, [load])

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Settings"
        description="Manage your team and account."
        breadcrumbs={[{ label: 'Settings' }]}
      />

      <div className="mt-6 flex flex-col gap-6">
        {/* Gmail integration */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Inbox className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Gmail integration</h2>
          </div>
          {gmail ? (
            <GmailToggle
              enabled={gmail.connected}
              gmailAddress={gmail.gmailAddress ?? null}
              emailsProcessed={gmail.emailsProcessed ?? 0}
              requestsCreated={gmail.requestsCreated ?? 0}
              lastCheckedAt={gmail.lastCheckedAt ?? null}
            />
          ) : (
            <p className="text-sm text-muted-foreground">Loading…</p>
          )}
        </Card>

        {/* Team members */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Team members</h2>
            </div>
            {data && (
              <span className="text-xs text-muted-foreground">
                {data.members.length} / {data.maxMembers} seats
              </span>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {!data && !error && (
            <p className="text-sm text-muted-foreground">Loading…</p>
          )}

          {data && (
            <div className="divide-y divide-border">
              {data.members.map((m) => (
                <div key={m.id} className="group flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {roleLabel(m.role)}
                    </span>
                    {data.isAdmin && m.id !== data.currentUserId && (
                      <RemoveMemberButton userId={m.id} name={m.name} onSuccess={load} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Pending invitations */}
        {data && data.pending.length > 0 && (
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Mail className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Pending invitations</h2>
            </div>
            <div className="divide-y divide-border">
              {data.pending.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{inv.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Expires {new Date(inv.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {roleLabel(inv.role)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Invite form — admin only */}
        {data?.isAdmin && (
          <Card className="p-6">
            <h2 className="mb-4 text-sm font-semibold">Invite a team member</h2>
            {data.members.length >= data.maxMembers ? (
              <p className="text-sm text-muted-foreground">
                You&apos;ve reached your seat limit ({data.maxMembers}).{' '}
                <a href="mailto:leena@clerkflow.software" className="underline">
                  Contact us
                </a>{' '}
                to add more.
              </p>
            ) : (
              <InviteForm onSuccess={load} />
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
