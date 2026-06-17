'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { Mail, Plus, Send, Users } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import type { Prospect, ProspectStatus } from '@/lib/prospects/types'
import { cn } from '@/lib/utils'

const STATUS_LABELS: Record<ProspectStatus, string> = {
  not_contacted: 'Not contacted',
  contacted: 'Contacted',
  replied: 'Replied',
  demo_scheduled: 'Demo scheduled',
  passed: 'Passed',
}

const STATUS_FILTER_OPTIONS: Array<{ value: ProspectStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'not_contacted', label: 'Not contacted' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'replied', label: 'Replied' },
  { value: 'demo_scheduled', label: 'Demo scheduled' },
  { value: 'passed', label: 'Passed' },
]

function statusBadgeVariant(
  status: ProspectStatus,
): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (status) {
    case 'not_contacted':
      return 'outline'
    case 'contacted':
      return 'secondary'
    case 'replied':
      return 'default'
    case 'demo_scheduled':
      return 'default'
    case 'passed':
      return 'destructive'
  }
}

export function ProspectsWorkspace() {
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProspectStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({
    townName: '',
    state: '',
    population: '',
    clerkName: '',
    email: '',
    contactInfo: '',
    notes: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/prospects')
      if (!res.ok) throw new Error(await res.text())
      const data = (await res.json()) as { prospects: Prospect[] }
      setProspects(data.prospects)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to load prospects')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return prospects.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false
      if (!q) return true
      return (
        p.townName.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q) ||
        p.clerkName.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        (p.contactInfo?.toLowerCase().includes(q) ?? false) ||
        p.notes.toLowerCase().includes(q)
      )
    })
  }, [prospects, search, statusFilter])

  const stats = useMemo(() => {
    return {
      total: prospects.length,
      notContacted: prospects.filter((p) => p.status === 'not_contacted').length,
      active: prospects.filter(
        (p) => p.status === 'contacted' || p.status === 'replied',
      ).length,
      demos: prospects.filter((p) => p.status === 'demo_scheduled').length,
    }
  }, [prospects])

  async function onAddProspect(e: FormEvent) {
    e.preventDefault()
    setMessage('')
    const email = form.email.trim()
    const contactInfo = form.contactInfo.trim()
    if (!email && !contactInfo) {
      setMessage('Add an email or contact info (phone, address, etc.).')
      return
    }
    const res = await fetch('/api/prospects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        townName: form.townName,
        state: form.state,
        population: form.population ? Number(form.population) : null,
        clerkName: form.clerkName,
        email: email || null,
        contactInfo: contactInfo || null,
        notes: form.notes,
      }),
    })
    if (!res.ok) {
      setMessage(await res.text())
      return
    }
    setForm({
      townName: '',
      state: '',
      population: '',
      clerkName: '',
      email: '',
      contactInfo: '',
      notes: '',
    })
    setMessage('Prospect added.')
    load()
  }

  async function sendOne(id: string) {
    setMessage('')
    const res = await fetch(`/api/prospects/${id}/send`, { method: 'POST' })
    const data = await res.json()
    if (!res.ok) {
      setMessage(data.error ?? 'Send failed')
      return
    }
    setMessage(`Email sent to ${data.prospect.email} (${data.send.mode}).`)
    load()
  }

  async function sendBatch() {
    if (!confirm('Send demo emails to all not-contacted prospects with an email on file?')) return
    setMessage('')
    const res = await fetch('/api/prospects/send-batch', { method: 'POST' })
    const data = await res.json()
    if (!res.ok) {
      setMessage(data.error ?? 'Batch send failed')
      return
    }
    setMessage(`Batch complete: ${data.sent}/${data.attempted} sent.`)
    load()
  }

  async function updateStatus(id: string, status: ProspectStatus) {
    const res = await fetch(`/api/prospects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) load()
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <PageHeader
        title="Clerk prospecting"
        description="Track town clerks, send outreach emails, and manage your pipeline. Emails dry-run to the server console until RESEND_API_KEY is set."
        actions={
          <Button onClick={sendBatch}>
            <Send className="size-4" /> Batch outreach
          </Button>
        }
      />

      {message ? (
        <p className="mt-4 rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm text-foreground">
          {message}
        </p>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total prospects" value={stats.total} icon={Users} />
        <StatCard
          label="Not contacted"
          value={stats.notContacted}
          icon={Mail}
          tone={stats.notContacted > 0 ? 'warning' : undefined}
        />
        <StatCard label="In conversation" value={stats.active} icon={Mail} />
        <StatCard
          label="Demos scheduled"
          value={stats.demos}
          icon={Users}
          tone="success"
        />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base">
                Pipeline ({filtered.length}
                {filtered.length !== prospects.length ? ` of ${prospects.length}` : ''})
              </CardTitle>
              <Input
                type="search"
                placeholder="Search town, clerk, email, contact info…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-xs"
              />
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                {STATUS_FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatusFilter(opt.value)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                      statusFilter === opt.value
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-muted-foreground hover:bg-accent',
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {loading ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
              ) : filtered.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No prospects match your filters.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Town</TableHead>
                      <TableHead>Clerk</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <p className="font-medium text-foreground">
                            {p.townName}, {p.state}
                          </p>
                          {p.population ? (
                            <p className="text-xs text-muted-foreground">
                              pop. {p.population.toLocaleString()}
                            </p>
                          ) : null}
                          {p.notes ? (
                            <p className="mt-1 max-w-xs truncate text-xs text-muted-foreground">
                              {p.notes}
                            </p>
                          ) : null}
                        </TableCell>
                        <TableCell>
                          <p className="text-foreground">{p.clerkName}</p>
                          {p.email ? (
                            <p className="text-xs text-muted-foreground">{p.email}</p>
                          ) : (
                            <p className="text-xs italic text-muted-foreground">No email</p>
                          )}
                          {p.contactInfo ? (
                            <p className="text-xs text-muted-foreground">{p.contactInfo}</p>
                          ) : null}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2">
                            <Badge variant={statusBadgeVariant(p.status)}>
                              {STATUS_LABELS[p.status]}
                            </Badge>
                            <select
                              value={p.status}
                              onChange={(e) =>
                                updateStatus(p.id, e.target.value as ProspectStatus)
                              }
                              className="h-8 rounded-lg border border-input bg-transparent px-2 text-xs"
                            >
                              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ))}
                            </select>
                            {p.lastContactedAt ? (
                              <span className="text-xs text-muted-foreground">
                                Last: {new Date(p.lastContactedAt).toLocaleDateString()}
                              </span>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sendOne(p.id)}
                            disabled={p.status === 'passed' || !p.email}
                            title={!p.email ? 'Add an email to send outreach' : undefined}
                          >
                            <Mail className="size-4" /> Send
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add prospect</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="flex flex-col gap-3" onSubmit={onAddProspect}>
                <Input
                  required
                  placeholder="Town name"
                  value={form.townName}
                  onChange={(e) => setForm({ ...form, townName: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    required
                    placeholder="State (OH)"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                  />
                  <Input
                    placeholder="Population"
                    value={form.population}
                    onChange={(e) => setForm({ ...form, population: e.target.value })}
                  />
                </div>
                <Input
                  required
                  placeholder="Clerk name"
                  value={form.clerkName}
                  onChange={(e) => setForm({ ...form, clerkName: e.target.value })}
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <Input
                  placeholder="Contact info — phone, address, website"
                  value={form.contactInfo}
                  onChange={(e) => setForm({ ...form, contactInfo: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Email or contact info required.
                </p>
                <Textarea
                  placeholder="Notes — league list source, referral, etc."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="min-h-24 resize-none"
                />
                <Button type="submit" className="w-full">
                  <Plus className="size-4" /> Add prospect
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardContent className="p-5 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Outreach email</p>
              <p className="mt-2">
                Sends a short intro from Leena asking for a 15-minute listening call.
                Without <code className="text-foreground">RESEND_API_KEY</code>, messages
                log to the server console only.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
