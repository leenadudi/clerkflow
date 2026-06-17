import type { StatusKey } from '@/components/status-pill'
import type {
  AgendaItem,
  BoardTerm,
  FoiaRequest,
  Meeting,
} from '@/lib/data'
import type {
  AgendaItemRow,
  BoardTermRow,
  FoiaMessageRow,
  FoiaRequestRow,
  FoiaWorkflowStepRow,
  MeetingRow,
  Town,
  User,
} from './schema'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
})

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

export function daysRemaining(deadlineAt: Date, now = new Date()) {
  const diff = deadlineAt.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function formatDate(value: Date) {
  return dateFormatter.format(value)
}

export function formatTime(value: Date) {
  return timeFormatter.format(value)
}

export function formatDateTime(value: Date) {
  return dateTimeFormatter.format(value)
}

export function townToView(town: Town) {
  return {
    name: town.name,
    shortName: town.shortName,
    population: town.population
      ? town.population.toLocaleString('en-US')
      : '—',
    slug: town.slug,
    clerk: {
      name: town.clerkName ?? 'Town Clerk',
      role: town.clerkRole ?? 'Town Clerk',
      initials: town.clerkInitials ?? 'TC',
    },
  }
}

export function foiaToView(
  row: FoiaRequestRow,
  assignee?: Pick<User, 'name'> | null,
  currentUserId?: string | null,
): FoiaRequest {
  const assignedTo = !row.assignedUserId
    ? 'Unassigned'
    : row.assignedUserId === currentUserId
      ? 'You'
      : assignee?.name ?? 'Staff'

  return {
    id: row.publicId,
    title: row.title,
    requester: row.requesterName,
    received: formatDate(row.receivedAt),
    assignedTo,
    status: row.status as StatusKey,
    daysRemaining: daysRemaining(row.deadlineAt),
    summary: row.summary,
  }
}

export function meetingToView(row: MeetingRow): Meeting {
  return {
    id: row.externalId,
    title: row.title,
    body: row.body,
    date: formatDate(row.startsAt),
    time: formatTime(row.startsAt),
    location: row.location,
    status: row.status as StatusKey,
  }
}

export function agendaToView(items: AgendaItemRow[]): AgendaItem[] {
  return items
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item, index) => ({
      n: index + 1,
      title: item.title,
      detail: item.detail,
    }))
}

export function boardTermToView(row: BoardTermRow, now = new Date()): BoardTerm {
  const msUntilExpiry = row.expiresAt.getTime() - now.getTime()
  const daysUntilExpiry = Math.ceil(msUntilExpiry / (1000 * 60 * 60 * 24))

  return {
    member: row.memberName,
    board: row.boardName,
    seat: row.seat,
    expires: formatDate(row.expiresAt),
    expiringSoon: daysUntilExpiry <= 60,
  }
}

export type FoiaThreadMessage = {
  author: string
  role: string
  time: string
  body: string
}

export type WorkflowStep = {
  label: string
  meta: string
  state: 'done' | 'current' | 'pending'
}

export function foiaMessageToView(row: FoiaMessageRow): FoiaThreadMessage {
  return {
    author: row.authorName,
    role: row.authorRole,
    time: formatDateTime(row.createdAt),
    body: row.body,
  }
}

export function workflowStepToView(row: FoiaWorkflowStepRow): WorkflowStep {
  return {
    label: row.label,
    meta: row.meta,
    state: row.state as WorkflowStep['state'],
  }
}
