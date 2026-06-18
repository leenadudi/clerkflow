import type { StatusKey } from '@/components/status-pill'
import type {
  AgendaItem,
  BoardTerm,
  FoiaRequest,
  Meeting,
  MeetingActionItem,
  MeetingAttendance,
  Motion,
} from '@/lib/data'
import type {
  AgendaItemRow,
  BoardTermRow,
  FoiaAuditLogRow,
  FoiaDocumentRow,
  FoiaMessageRow,
  FoiaRequestRow,
  FoiaWorkflowStepRow,
  MeetingActionItemRow,
  MeetingAttendanceRow,
  MeetingRow,
  MotionRow,
  Town,
  User,
} from './schema'

// ---- Open Records / FOIA extended types ----

export type RecordsDocument = {
  id: string
  name: string
  fileUrl: string
  fileSize?: number
  mimeType?: string
  uploadedBy: string
  isRedacted: boolean
  createdAt: string
}

export type AuditLogEntry = {
  id: string
  action: string
  actorName: string
  actorRole: string
  detail?: string
  createdAt: string
}

/**
 * Derives the computed display status for a FOIA / open-records request,
 * overriding active statuses with 'overdue' or 'due-soon' based on deadline
 * proximity. Terminal statuses (complete, denied, withdrawn) pass through
 * unchanged.
 */
export function computeRecordsStatus(stored: string, deadlineAt: Date, now = new Date()): string {
  if (stored === 'complete' || stored === 'denied' || stored === 'withdrawn') return stored
  const days = daysRemaining(deadlineAt, now)
  if (days < 0) return 'overdue'
  if (days <= 3) return 'due-soon'
  return stored // new | in_progress
}

export function foiaDocumentToView(row: FoiaDocumentRow): RecordsDocument {
  return {
    id: row.id,
    name: row.name,
    fileUrl: row.fileUrl,
    fileSize: row.fileSize ?? undefined,
    mimeType: row.mimeType ?? undefined,
    uploadedBy: row.uploadedBy,
    isRedacted: row.isRedacted,
    createdAt: formatDateTime(row.createdAt),
  }
}

export function auditLogToView(row: FoiaAuditLogRow): AuditLogEntry {
  return {
    id: row.id,
    action: row.action,
    actorName: row.actorName,
    actorRole: row.actorRole,
    detail: row.detail ?? undefined,
    createdAt: formatDateTime(row.createdAt),
  }
}

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
    residentHubEnabled: town.residentHubEnabled,
    state: town.state,
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
    // Extended fields
    source: row.source ?? undefined,
    requesterPhone: row.requesterPhone ?? undefined,
    requesterAddress: row.requesterAddress ?? undefined,
    requesterOrg: row.requesterOrg ?? undefined,
    isAnonymous: row.isAnonymous ?? undefined,
    formatRequested: row.formatRequested ?? undefined,
    deliveryMethod: row.deliveryMethod ?? undefined,
    priority: row.priority ?? undefined,
    internalNotes: row.internalNotes ?? undefined,
    dateRangeFrom: row.dateRangeFrom ? formatDate(row.dateRangeFrom) : undefined,
    dateRangeTo: row.dateRangeTo ? formatDate(row.dateRangeTo) : undefined,
    fulfilledAt: row.fulfilledAt ? formatDate(row.fulfilledAt) : undefined,
    deniedAt: row.deniedAt ? formatDate(row.deniedAt) : undefined,
    denialReason: row.denialReason ?? undefined,
    ackSentAt: row.ackSentAt ? formatDate(row.ackSentAt) : undefined,
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
    minutesStatus: row.minutesStatus,
    meetingType: row.meetingType,
    agendaPublishedAt: row.agendaPublishedAt ? formatDate(row.agendaPublishedAt) : undefined,
    minutesDraft: row.minutesDraft,
    presidingOfficer: row.presidingOfficer,
    isPast: row.startsAt < new Date(),
  }
}

export function meetingAttendanceToView(row: MeetingAttendanceRow): MeetingAttendance {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    boardName: row.boardName,
    status: row.status as MeetingAttendance['status'],
    arrivedAt: row.arrivedAt ?? undefined,
    leftAt: row.leftAt ?? undefined,
    isGuest: row.isGuest,
    sortOrder: row.sortOrder,
  }
}

export function agendaToView(items: AgendaItemRow[]): AgendaItem[] {
  return items
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item, index) => ({
      n: index + 1,
      title: item.title,
      detail: item.detail,
      notes: item.notes,
    }))
}

export function motionToView(row: MotionRow): Motion {
  return {
    id: row.id,
    agendaItemId: row.agendaItemId ?? undefined,
    description: row.description,
    movedBy: row.movedBy,
    secondedBy: row.secondedBy,
    voteYes: row.voteYes,
    voteNo: row.voteNo,
    voteAbstain: row.voteAbstain,
    outcome: row.outcome as Motion['outcome'],
    sortOrder: row.sortOrder,
  }
}

export function meetingActionItemToView(row: MeetingActionItemRow): MeetingActionItem {
  return {
    id: row.id,
    title: row.title,
    assignedTo: row.assignedTo,
    dueDate: row.dueDate ?? '',
    done: row.done,
    sortOrder: row.sortOrder,
  }
}

export function boardTermToView(row: BoardTermRow, now = new Date()): BoardTerm {
  const msUntilExpiry = row.expiresAt.getTime() - now.getTime()
  const daysUntilExpiry = Math.ceil(msUntilExpiry / (1000 * 60 * 60 * 24))

  return {
    id: row.id,
    member: row.memberName,
    board: row.boardName,
    seat: row.seat,
    expires: formatDate(row.expiresAt),
    expiringSoon: daysUntilExpiry <= 60,
  }
}

export function licenseToView(row: import('./schema').LicenseRow): import('@/lib/data').License {
  const LICENSE_TYPE_LABELS: Record<string, string> = {
    business_license: 'Business license',
    burn_permit: 'Burn permit',
    garage_sale: 'Garage sale permit',
    alcohol: 'Alcohol license',
    event_permit: 'Event permit',
    vendor_permit: 'Vendor permit',
  }
  return {
    id: row.publicId,
    type: row.type,
    typeLabel: LICENSE_TYPE_LABELS[row.type] ?? row.type,
    applicantName: row.applicantName,
    applicantEmail: row.applicantEmail ?? undefined,
    applicantPhone: row.applicantPhone ?? undefined,
    description: row.description,
    status: row.status as import('@/lib/data').License['status'],
    submittedAt: formatDate(row.submittedAt),
    expiresAt: row.expiresAt ? formatDate(row.expiresAt) : undefined,
    fee: row.fee != null ? `$${(row.fee / 100).toFixed(2)}` : undefined,
    feePaid: row.feePaidAt != null,
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
