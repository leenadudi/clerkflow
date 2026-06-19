import { and, asc, desc, eq } from 'drizzle-orm'
import type { StatusKey } from '@/components/status-pill'
import {
  ACTION_ITEMS,
  AGENDA,
  ATTENDANCE,
  BOARD_TERMS,
  FOIA_REQUESTS,
  LICENSES,
  MEETINGS,
  MOTIONS,
  type AgendaItem,
  type BoardTerm,
  type FoiaRequest,
  type License,
  type Meeting,
  type MeetingActionItem,
  type MeetingAttendance,
  type Motion,
} from '@/lib/data'
import { getDb, isDatabaseConfigured, withTownContext } from '@/lib/db'
import {
  agendaToView,
  auditLogToView,
  boardTermToView,
  computeRecordsStatus,
  foiaDocumentToView,
  foiaMessageToView,
  foiaToView,
  licenseToView,
  meetingActionItemToView,
  meetingAttendanceToView,
  meetingToView,
  motionToView,
  workflowStepToView,
  type AuditLogEntry,
  type FoiaThreadMessage,
  type RecordsDocument,
  type WorkflowStep,
} from '@/lib/db/mappers'
import {
  agendaItems,
  boardTerms,
  foiaAuditLog,
  foiaDocuments,
  foiaMessages,
  foiaRequests,
  foiaWorkflowSteps,
  gmailConnections,
  licenses,
  meetingActionItems,
  meetingAttendance,
  meetings,
  motions,
  processedEmails,
  towns,
} from '@/lib/db/schema'
import { getAppContext } from '@/lib/auth/app'

// ---------------------------------------------------------------------------
// Business day utilities (private)
// ---------------------------------------------------------------------------

function addBusinessDays(start: Date, days: number): Date {
  const d = new Date(start)
  let added = 0
  while (added < days) {
    d.setDate(d.getDate() + 1)
    const dow = d.getDay()
    if (dow !== 0 && dow !== 6) added++
  }
  return d
}

export async function getTownView() {
  const context = await getAppContext()
  return context.town
}

export async function listFoiaRequests(): Promise<FoiaRequest[]> {
  const context = await getAppContext()
  const { townId } = context
  if (!townId) return FOIA_REQUESTS

  return withTownContext(townId, async (db) => {
    const rows = await db.query.foiaRequests.findMany({
      where: eq(foiaRequests.townId, townId),
      orderBy: [desc(foiaRequests.receivedAt)],
      with: {
        assignedUser: {
          columns: { name: true },
        },
      },
    })
    return rows.map((row) => {
      const view = foiaToView(row, row.assignedUser, context.user?.id ?? null)
      return { ...view, status: computeRecordsStatus(view.status, row.deadlineAt) as any }
    })
  })
}

export async function getFoiaRequest(publicId: string): Promise<FoiaRequest | null> {
  const context = await getAppContext()
  const { townId } = context
  if (!townId) return FOIA_REQUESTS.find((item) => item.id === publicId) ?? null

  return withTownContext(townId, async (db) => {
    const row = await db.query.foiaRequests.findFirst({
      where: and(eq(foiaRequests.townId, townId), eq(foiaRequests.publicId, publicId)),
      with: {
        assignedUser: {
          columns: { name: true },
        },
      },
    })
    return row ? foiaToView(row, row.assignedUser, context.user?.id ?? null) : null
  })
}

export async function getFoiaThread(publicId: string): Promise<FoiaThreadMessage[]> {
  const context = await getAppContext()
  const { townId } = context
  if (!townId) {
    if (publicId !== 'FOIA-1042') return []
    return [
      {
        author: 'Dana Whitfield',
        role: 'Requester',
        time: 'Jun 9, 2026 · 9:14 AM',
        body: 'Requesting all police incident reports filed for the 400 block of Maple Street during June 2026.',
      },
      {
        author: 'Barbara Jensen',
        role: 'Town Clerk',
        time: 'Jun 9, 2026 · 2:40 PM',
        body: 'Thank you for your request. We have logged it as FOIA-1042 and will respond within the statutory timeframe. We are coordinating with the Police Department to gather responsive records.',
      },
      {
        author: 'Barbara Jensen',
        role: 'Town Clerk',
        time: 'Jun 11, 2026 · 11:05 AM',
        body: 'An update: two reports may contain personal information requiring redaction. We are reviewing them now.',
      },
    ]
  }

  return withTownContext(townId, async (db) => {
    const request = await db.query.foiaRequests.findFirst({
      where: and(eq(foiaRequests.townId, townId), eq(foiaRequests.publicId, publicId)),
      columns: { id: true },
    })
    if (!request) return []

    const messages = await db.query.foiaMessages.findMany({
      where: eq(foiaMessages.foiaRequestId, request.id),
      orderBy: [asc(foiaMessages.createdAt)],
    })
    return messages.map(foiaMessageToView)
  })
}

export async function getFoiaWorkflow(publicId: string): Promise<WorkflowStep[]> {
  const context = await getAppContext()
  const { townId } = context
  if (!townId) {
    if (publicId !== 'FOIA-1042') return []
    return [
      { label: 'Request logged', meta: 'Jun 9, 2026', state: 'done' },
      { label: 'Acknowledgment sent', meta: 'Jun 9, 2026', state: 'done' },
      { label: 'Records gathered', meta: '3 documents', state: 'done' },
      { label: 'Review & redact', meta: 'In progress', state: 'current' },
      { label: 'Release to requester', meta: 'Pending', state: 'pending' },
    ]
  }

  return withTownContext(townId, async (db) => {
    const request = await db.query.foiaRequests.findFirst({
      where: and(eq(foiaRequests.townId, townId), eq(foiaRequests.publicId, publicId)),
      columns: { id: true },
    })
    if (!request) return []

    const steps = await db.query.foiaWorkflowSteps.findMany({
      where: eq(foiaWorkflowSteps.foiaRequestId, request.id),
      orderBy: [asc(foiaWorkflowSteps.sortOrder)],
    })
    return steps.map(workflowStepToView)
  })
}

export async function listMeetings(): Promise<Meeting[]> {
  const context = await getAppContext()
  const { townId } = context
  if (!townId) return MEETINGS

  return withTownContext(townId, async (db) => {
    const rows = await db.query.meetings.findMany({
      where: eq(meetings.townId, townId),
      orderBy: [desc(meetings.startsAt)],
    })
    return rows.map(meetingToView)
  })
}

export async function getMeeting(externalId: string): Promise<Meeting | null> {
  const context = await getAppContext()
  const { townId } = context
  if (!townId) return MEETINGS.find((item) => item.id === externalId) ?? null

  return withTownContext(townId, async (db) => {
    const row = await db.query.meetings.findFirst({
      where: and(eq(meetings.townId, townId), eq(meetings.externalId, externalId)),
    })
    return row ? meetingToView(row) : null
  })
}

export async function getMeetingAgenda(externalId: string): Promise<AgendaItem[]> {
  const context = await getAppContext()
  const { townId } = context
  if (!townId) return AGENDA

  return withTownContext(townId, async (db) => {
    const meeting = await db.query.meetings.findFirst({
      where: and(eq(meetings.townId, townId), eq(meetings.externalId, externalId)),
      columns: { id: true },
    })
    if (!meeting) return []

    const items = await db.query.agendaItems.findMany({
      where: eq(agendaItems.meetingId, meeting.id),
      orderBy: [asc(agendaItems.sortOrder)],
    })
    return agendaToView(items)
  })
}

export async function listBoardTerms(): Promise<BoardTerm[]> {
  const context = await getAppContext()
  const { townId } = context
  if (!townId) return BOARD_TERMS

  return withTownContext(townId, async (db) => {
    const rows = await db.query.boardTerms.findMany({
      where: eq(boardTerms.townId, townId),
      orderBy: [asc(boardTerms.expiresAt)],
    })
    return rows.map((row) => boardTermToView(row))
  })
}

export async function countFoiaByStatus(status: StatusKey) {
  const requests = await listFoiaRequests()
  return requests.filter((item) => item.status === status).length
}

export async function trackPublicFoia(townSlug: string, publicId: string) {
  if (!isDatabaseConfigured()) {
    if (townSlug !== 'riverside-oh' || publicId !== 'FOIA-1042') {
      return null
    }
    return {
      publicId,
      title: 'Police incident reports — Maple St, June 2026',
      status: 'in-progress' as StatusKey,
      clerkEmail: 'clerk@riverside-oh.gov',
      timeline: [
        { label: 'Request received', meta: 'Jun 9, 2026', state: 'done' as const },
        { label: 'Acknowledgment sent', meta: 'Jun 9, 2026', state: 'done' as const },
        { label: 'Records being gathered', meta: 'Jun 11, 2026', state: 'done' as const },
        { label: 'Under review & redaction', meta: 'In progress', state: 'current' as const },
        { label: 'Records released', meta: 'Pending', state: 'pending' as const },
      ],
    }
  }

  const db = getDb()
  const town = await db.query.towns.findFirst({
    where: eq(towns.slug, townSlug),
  })
  if (!town) return null

  return withTownContext(town.id, async (db) => {
    const request = await db.query.foiaRequests.findFirst({
      where: and(eq(foiaRequests.townId, town.id), eq(foiaRequests.publicId, publicId)),
    })
    if (!request) return null

    const steps = await db.query.foiaWorkflowSteps.findMany({
      where: eq(foiaWorkflowSteps.foiaRequestId, request.id),
      orderBy: [asc(foiaWorkflowSteps.sortOrder)],
    })

    const timeline =
      steps.length > 0
        ? steps.map(workflowStepToView)
        : [
            { label: 'Request received', meta: 'Logged', state: 'done' as const },
            { label: 'Processing', meta: 'In progress', state: 'current' as const },
          ]

    return {
      publicId: request.publicId,
      title: request.title,
      status: request.status as StatusKey,
      clerkEmail: town.clerkEmail ?? undefined,
      timeline,
    }
  })
}

export type CreateFoiaInput = {
  title: string
  requesterName: string
  requesterEmail?: string
  requesterPhone?: string
  requesterOrg?: string
  isAnonymous?: boolean
  summary: string
  source?: string
  formatRequested?: string
  deliveryMethod?: string
  priority?: string
  dateRangeFrom?: Date
  dateRangeTo?: Date
  deadlineDays?: number
  assignedUserId?: string | null
}

export async function createFoiaRequest(data: CreateFoiaInput): Promise<FoiaRequest> {
  const context = await getAppContext()

  // Fall back to first mock request if no DB
  if (!context.townId) return FOIA_REQUESTS[0]

  return withTownContext(context.townId, async (db) => {
    const all = await db.query.foiaRequests.findMany({
      where: eq(foiaRequests.townId, context.townId!),
      columns: { publicId: true },
    })

    const year = new Date().getFullYear()
    const nextSeq = all.length + 1
    const publicId = `FOIA-${year}-${String(nextSeq).padStart(4, '0')}`

    const receivedAt = new Date()
    const deadlineAt = addBusinessDays(receivedAt, data.deadlineDays ?? 5)

    const [created] = await db
      .insert(foiaRequests)
      .values({
        townId: context.townId!,
        publicId,
        title: data.title,
        requesterName: data.requesterName,
        requesterEmail: data.requesterEmail,
        requesterPhone: data.requesterPhone,
        requesterOrg: data.requesterOrg,
        isAnonymous: data.isAnonymous ?? false,
        summary: data.summary,
        source: data.source ?? 'web',
        formatRequested: data.formatRequested ?? 'any',
        deliveryMethod: data.deliveryMethod ?? 'email',
        priority: data.priority ?? 'normal',
        dateRangeFrom: data.dateRangeFrom,
        dateRangeTo: data.dateRangeTo,
        status: 'new',
        assignedUserId: data.assignedUserId ?? context.user?.id ?? null,
        receivedAt,
        deadlineAt,
      })
      .returning()

    // Initial audit log entry
    await db.insert(foiaAuditLog).values({
      foiaRequestId: created.id,
      action: 'created',
      actorName: 'System',
      actorRole: 'System',
      detail: 'Request received',
    })

    await db.insert(foiaMessages).values({
      foiaRequestId: created.id,
      authorName: data.requesterName,
      authorRole: 'Requester',
      body: data.summary,
    })

    await db.insert(foiaWorkflowSteps).values([
      { foiaRequestId: created.id, label: 'Request logged', meta: 'Just now', state: 'done', sortOrder: 1 },
      { foiaRequestId: created.id, label: 'Acknowledgment sent', meta: 'Pending', state: 'current', sortOrder: 2 },
      { foiaRequestId: created.id, label: 'Records gathered', meta: 'Pending', state: 'pending', sortOrder: 3 },
      { foiaRequestId: created.id, label: 'Review & redact', meta: 'Pending', state: 'pending', sortOrder: 4 },
      { foiaRequestId: created.id, label: 'Release to requester', meta: 'Pending', state: 'pending', sortOrder: 5 },
    ])

    // Send acknowledgment email if Resend is configured and we have an email
    if (process.env.RESEND_API_KEY && data.requesterEmail && !data.isAnonymous) {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: 'noreply@clerkflow.software',
          to: data.requesterEmail,
          subject: `Open records request received — ${publicId}`,
          text: [
            `Dear ${data.requesterName},`,
            '',
            `Your open records request has been received and logged as ${publicId}.`,
            `You can track the status of your request at any time using your confirmation number.`,
            '',
            'We will respond within the statutory timeframe.',
            '',
            'Thank you,',
            context.town.clerk.name,
          ].join('\n'),
        })
        await db
          .update(foiaRequests)
          .set({ ackSentAt: new Date() })
          .where(eq(foiaRequests.id, created.id))
      } catch {
        // Email failure must never throw — log silently
      }
    }

    return foiaToView(created, null, context.user?.id ?? null)
  })
}

export async function getFoiaDocuments(publicId: string): Promise<RecordsDocument[]> {
  const context = await getAppContext()
  if (!context.townId) return []

  return withTownContext(context.townId, async (db) => {
    const request = await db.query.foiaRequests.findFirst({
      where: and(eq(foiaRequests.townId, context.townId!), eq(foiaRequests.publicId, publicId)),
      columns: { id: true },
    })
    if (!request) return []

    const rows = await db.query.foiaDocuments.findMany({
      where: eq(foiaDocuments.foiaRequestId, request.id),
      orderBy: [asc(foiaDocuments.createdAt)],
    })
    return rows.map(foiaDocumentToView)
  })
}

export async function addFoiaDocument(
  publicId: string,
  data: {
    name: string
    fileUrl: string
    fileSize?: number
    mimeType?: string
    uploadedBy: string
    isRedacted?: boolean
  },
): Promise<RecordsDocument | null> {
  const context = await getAppContext()
  if (!context.townId) return null

  return withTownContext(context.townId, async (db) => {
    const request = await db.query.foiaRequests.findFirst({
      where: and(eq(foiaRequests.townId, context.townId!), eq(foiaRequests.publicId, publicId)),
      columns: { id: true },
    })
    if (!request) return null

    const [doc] = await db
      .insert(foiaDocuments)
      .values({
        foiaRequestId: request.id,
        name: data.name,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize ?? null,
        mimeType: data.mimeType ?? null,
        uploadedBy: data.uploadedBy,
        isRedacted: data.isRedacted ?? false,
      })
      .returning()

    await db.insert(foiaAuditLog).values({
      foiaRequestId: request.id,
      action: 'document_added',
      actorName: data.uploadedBy,
      actorRole: context.town.clerk.role,
      detail: data.name,
    })

    return foiaDocumentToView(doc)
  })
}

export async function getFoiaAuditLog(publicId: string): Promise<AuditLogEntry[]> {
  const context = await getAppContext()

  if (!context.townId) {
    return [
      {
        id: 'mock-1',
        action: 'created',
        actorName: 'System',
        actorRole: 'System',
        detail: 'Request received',
        createdAt: 'Jun 9, 2026, 9:14 AM',
      },
      {
        id: 'mock-2',
        action: 'status_changed',
        actorName: 'Barbara Jensen',
        actorRole: 'Town Clerk',
        detail: 'in_progress',
        createdAt: 'Jun 9, 2026, 2:40 PM',
      },
    ]
  }

  return withTownContext(context.townId, async (db) => {
    const request = await db.query.foiaRequests.findFirst({
      where: and(eq(foiaRequests.townId, context.townId!), eq(foiaRequests.publicId, publicId)),
      columns: { id: true },
    })
    if (!request) return []

    const rows = await db.query.foiaAuditLog.findMany({
      where: eq(foiaAuditLog.foiaRequestId, request.id),
      orderBy: [asc(foiaAuditLog.createdAt)],
    })
    return rows.map(auditLogToView)
  })
}

export async function fulfillFoiaRequest(publicId: string, note?: string): Promise<boolean> {
  const context = await getAppContext()
  if (!context.townId) return false

  return withTownContext(context.townId, async (db) => {
    const request = await db.query.foiaRequests.findFirst({
      where: and(eq(foiaRequests.townId, context.townId!), eq(foiaRequests.publicId, publicId)),
    })
    if (!request) return false

    const now = new Date()
    const updatedNotes = note
      ? [request.internalNotes, note].filter(Boolean).join('\n\n')
      : request.internalNotes ?? undefined

    await db
      .update(foiaRequests)
      .set({ status: 'complete', fulfilledAt: now, internalNotes: updatedNotes, updatedAt: now })
      .where(eq(foiaRequests.id, request.id))

    await db.insert(foiaAuditLog).values({
      foiaRequestId: request.id,
      action: 'fulfilled',
      actorName: context.user?.name ?? 'Staff',
      actorRole: context.town.clerk.role,
      detail: note ?? null,
    })

    return true
  })
}

export async function denyFoiaRequest(publicId: string, reason: string): Promise<boolean> {
  const context = await getAppContext()
  if (!context.townId) return false

  return withTownContext(context.townId, async (db) => {
    const request = await db.query.foiaRequests.findFirst({
      where: and(eq(foiaRequests.townId, context.townId!), eq(foiaRequests.publicId, publicId)),
      columns: { id: true },
    })
    if (!request) return false

    const now = new Date()

    await db
      .update(foiaRequests)
      .set({ status: 'denied', deniedAt: now, denialReason: reason, updatedAt: now })
      .where(eq(foiaRequests.id, request.id))

    await db.insert(foiaAuditLog).values({
      foiaRequestId: request.id,
      action: 'denied',
      actorName: context.user?.name ?? 'Staff',
      actorRole: context.town.clerk.role,
      detail: reason,
    })

    return true
  })
}

export async function updateFoiaStatus(publicId: string, status: string): Promise<boolean> {
  const context = await getAppContext()
  if (!context.townId) return false

  return withTownContext(context.townId, async (db) => {
    const request = await db.query.foiaRequests.findFirst({
      where: and(eq(foiaRequests.townId, context.townId!), eq(foiaRequests.publicId, publicId)),
      columns: { id: true },
    })
    if (!request) return false

    await db
      .update(foiaRequests)
      .set({ status, updatedAt: new Date() })
      .where(eq(foiaRequests.id, request.id))

    await db.insert(foiaAuditLog).values({
      foiaRequestId: request.id,
      action: 'status_changed',
      actorName: context.user?.name ?? 'Staff',
      actorRole: context.town.clerk.role,
      detail: status,
    })

    return true
  })
}

export async function updateFoiaInternalNotes(publicId: string, notes: string): Promise<boolean> {
  const context = await getAppContext()
  if (!context.townId) return false

  return withTownContext(context.townId, async (db) => {
    const request = await db.query.foiaRequests.findFirst({
      where: and(eq(foiaRequests.townId, context.townId!), eq(foiaRequests.publicId, publicId)),
      columns: { id: true },
    })
    if (!request) return false

    await db
      .update(foiaRequests)
      .set({ internalNotes: notes, updatedAt: new Date() })
      .where(eq(foiaRequests.id, request.id))

    return true
  })
}

export async function sendFoiaMessage(
  publicId: string,
  body: string,
  authorName: string,
  authorRole: string,
): Promise<boolean> {
  const context = await getAppContext()
  if (!context.townId) return false
  const townId = context.townId

  // Run all DB inserts inside the transaction; capture what we need for routing
  const routingInfo = await withTownContext(townId, async (db) => {
    const request = await db.query.foiaRequests.findFirst({
      where: and(eq(foiaRequests.townId, townId), eq(foiaRequests.publicId, publicId)),
    })
    if (!request) return null

    await db.insert(foiaMessages).values({
      foiaRequestId: request.id,
      authorName,
      authorRole,
      body,
    })

    await db.insert(foiaAuditLog).values({
      foiaRequestId: request.id,
      action: 'message_sent',
      actorName: authorName,
      actorRole: authorRole,
      detail: body.slice(0, 60),
    })

    return {
      source: request.source,
      requesterName: request.requesterName,
      requesterEmail: request.requesterEmail,
      isAnonymous: request.isAnonymous,
    }
  })

  if (!routingInfo) return false

  const { source, requesterName, requesterEmail, isAnonymous } = routingInfo

  // Staff replies only — requester messages go through the public hub
  if (authorRole === 'Requester') return true

  if (source === 'email') {
    // Thread the reply back through the original Gmail thread
    try {
      const db = getDb()
      const processed = await db.query.processedEmails.findFirst({
        where: and(
          eq(processedEmails.townId, townId),
          eq(processedEmails.linkedRecordId, publicId),
        ),
      })
      if (processed?.gmailThreadId && processed.connectionId) {
        const connection = await db.query.gmailConnections.findFirst({
          where: and(
            eq(gmailConnections.id, processed.connectionId),
            eq(gmailConnections.isActive, true),
          ),
        })
        if (connection?.clerkUserId && requesterEmail) {
          const { sendReply } = await import('@/lib/gmail/client')
          await sendReply(connection.clerkUserId, {
            to: requesterEmail,
            subject: `Re: ${processed.subject ?? publicId}`,
            body,
            threadId: processed.gmailThreadId,
          })
        }
      }
    } catch {
      // Gmail reply failure must never throw — correspondence thread already saved
    }
  } else if (process.env.RESEND_API_KEY && requesterEmail && !isAnonymous) {
    // Web/walk-in/mail/phone sources — send email notification via Resend
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: 'noreply@clerkflow.software',
        to: requesterEmail,
        subject: `Update on your open records request — ${publicId}`,
        text: [
          `Dear ${requesterName},`,
          '',
          `You have a new message regarding your open records request ${publicId}:`,
          '',
          body,
          '',
          "To track your request, visit your town's resident hub and enter your confirmation number.",
          '',
          'Thank you,',
          context.town.clerk.name,
        ].join('\n'),
      })
    } catch {
      // Email failure must never throw — log silently
    }
  }

  return true
}

export async function addFoiaMessage(publicId: string, body: string) {
  const context = await getAppContext()
  if (!context.townId || !context.user) throw new Error('Unauthorized')

  return withTownContext(context.townId, async (db) => {
    const request = await db.query.foiaRequests.findFirst({
      where: and(eq(foiaRequests.townId, context.townId!), eq(foiaRequests.publicId, publicId)),
    })
    if (!request) return null

    const [message] = await db
      .insert(foiaMessages)
      .values({
        foiaRequestId: request.id,
        authorName: context.user!.name,
        authorRole: context.town.clerk.role,
        body,
      })
      .returning()

    return foiaMessageToView(message)
  })
}

export type CreateMeetingInput = {
  title: string
  body: string
  startsAt: Date
  location: string
  status?: StatusKey
  meetingType?: string
  internalNotes?: string
}

export async function createMeeting(input: CreateMeetingInput) {
  const context = await getAppContext()
  if (!context.townId) return MEETINGS[0]

  return withTownContext(context.townId, async (db) => {
    const stamp = [
      input.startsAt.getMonth() + 1,
      input.startsAt.getDate(),
      String(input.startsAt.getFullYear()).slice(-2),
    ].join('')

    const [created] = await db
      .insert(meetings)
      .values({
        townId: context.townId!,
        externalId: `mtg-${stamp}${Math.floor(Math.random() * 90 + 10)}`,
        title: input.title,
        body: input.body,
        startsAt: input.startsAt,
        location: input.location,
        status: input.status ?? 'draft',
        meetingType: input.meetingType ?? 'council',
        internalNotes: input.internalNotes ?? '',
      })
      .returning()

    return meetingToView(created)
  })
}

export type CreateBoardTermInput = {
  memberName: string
  boardName: string
  seat: string
  expiresAt: Date
}

export async function createBoardTerm(input: CreateBoardTermInput): Promise<BoardTerm> {
  const context = await getAppContext()
  if (!context.townId) return BOARD_TERMS[0]

  return withTownContext(context.townId, async (db) => {
    const [created] = await db
      .insert(boardTerms)
      .values({
        townId: context.townId!,
        memberName: input.memberName,
        boardName: input.boardName,
        seat: input.seat,
        expiresAt: input.expiresAt,
      })
      .returning()
    return boardTermToView(created)
  })
}

export async function removeBoardTerm(id: string): Promise<void> {
  const context = await getAppContext()
  if (!context.townId) return

  await withTownContext(context.townId, async (db) => {
    await db
      .delete(boardTerms)
      .where(and(eq(boardTerms.id, id), eq(boardTerms.townId, context.townId!)))
  })
}

export async function listPublishedMeetings(): Promise<Meeting[]> {
  const context = await getAppContext()
  const { townId } = context
  if (!townId) return MEETINGS.filter((m) => m.status === 'published')

  return withTownContext(townId, async (db) => {
    const rows = await db.query.meetings.findMany({
      where: and(eq(meetings.townId, townId), eq(meetings.status, 'published')),
      orderBy: [desc(meetings.startsAt)],
    })
    return rows.map(meetingToView)
  })
}

export async function listLicenses(): Promise<License[]> {
  const context = await getAppContext()
  const { townId } = context
  if (!townId) return LICENSES

  return withTownContext(townId, async (db) => {
    const rows = await db.query.licenses.findMany({
      where: eq(licenses.townId, townId),
      orderBy: [desc(licenses.submittedAt)],
    })
    return rows.map(licenseToView)
  })
}

export async function getLicense(publicId: string): Promise<License | null> {
  const context = await getAppContext()
  const { townId } = context
  if (!townId) return LICENSES.find((l) => l.id === publicId) ?? null

  return withTownContext(townId, async (db) => {
    const row = await db.query.licenses.findFirst({
      where: and(eq(licenses.townId, townId), eq(licenses.publicId, publicId)),
    })
    return row ? licenseToView(row) : null
  })
}

export type CreateLicenseInput = {
  type: string
  applicantName: string
  applicantEmail?: string
  applicantPhone?: string
  description?: string
  fee?: number
}

export async function createLicense(input: CreateLicenseInput): Promise<License> {
  const context = await getAppContext()
  if (!context.townId) return LICENSES[0]

  return withTownContext(context.townId, async (db) => {
    const latest = await db.query.licenses.findMany({
      where: eq(licenses.townId, context.townId!),
      orderBy: [desc(licenses.createdAt)],
      limit: 1,
    })
    const nextNumber = latest[0]?.publicId
      ? Number.parseInt(latest[0].publicId.replace('LIC-', ''), 10) + 1
      : 1

    const [created] = await db
      .insert(licenses)
      .values({
        townId: context.townId!,
        publicId: `LIC-${String(nextNumber).padStart(3, '0')}`,
        type: input.type,
        applicantName: input.applicantName,
        applicantEmail: input.applicantEmail,
        applicantPhone: input.applicantPhone,
        description: input.description ?? '',
        status: 'pending',
        fee: input.fee,
        submittedAt: new Date(),
      })
      .returning()
    return licenseToView(created)
  })
}

export async function updateLicenseStatus(
  publicId: string,
  status: 'pending' | 'approved' | 'denied' | 'expired',
): Promise<License | null> {
  const context = await getAppContext()
  if (!context.townId) return LICENSES.find((l) => l.id === publicId) ?? null

  return withTownContext(context.townId, async (db) => {
    const [updated] = await db
      .update(licenses)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(licenses.townId, context.townId!), eq(licenses.publicId, publicId)))
      .returning()
    return updated ? licenseToView(updated) : null
  })
}

export async function submitPublicLicense(
  townSlug: string,
  input: {
    type: string
    applicantName: string
    applicantEmail?: string
    applicantPhone?: string
    description?: string
  },
) {
  if (!isDatabaseConfigured()) {
    return {
      publicId: 'LIC-005',
      message: 'Application received (demo mode — connect DATABASE_URL to persist).',
    }
  }

  const db = getDb()
  const town = await db.query.towns.findFirst({ where: eq(towns.slug, townSlug) })
  if (!town) throw new Error('Town not found')

  return withTownContext(town.id, async (db) => {
    const latest = await db.query.licenses.findMany({
      where: eq(licenses.townId, town.id),
      orderBy: [desc(licenses.createdAt)],
      limit: 1,
    })
    const nextNumber = latest[0]?.publicId
      ? Number.parseInt(latest[0].publicId.replace('LIC-', ''), 10) + 1
      : 1

    const [created] = await db
      .insert(licenses)
      .values({
        townId: town.id,
        publicId: `LIC-${String(nextNumber).padStart(3, '0')}`,
        type: input.type,
        applicantName: input.applicantName,
        applicantEmail: input.applicantEmail,
        applicantPhone: input.applicantPhone,
        description: input.description ?? '',
        status: 'pending',
        submittedAt: new Date(),
      })
      .returning()

    return {
      publicId: created.publicId,
      message: 'Your application has been submitted. Save your confirmation number.',
    }
  })
}

export async function submitPublicFoia(
  townSlug: string,
  input: {
    title: string
    requesterName: string
    requesterEmail?: string
    summary: string
  },
) {
  if (!isDatabaseConfigured()) {
    return {
      publicId: 'FOIA-1043',
      message: 'Request received (demo mode — connect DATABASE_URL to persist).',
    }
  }

  const db = getDb()
  const town = await db.query.towns.findFirst({
    where: eq(towns.slug, townSlug),
  })
  if (!town) throw new Error('Town not found')

  return withTownContext(town.id, async (db) => {
    const latest = await db.query.foiaRequests.findMany({
      where: eq(foiaRequests.townId, town.id),
      orderBy: [desc(foiaRequests.createdAt)],
      limit: 1,
    })

    const nextNumber = latest[0]?.publicId
      ? Number.parseInt(latest[0].publicId.replace('FOIA-', ''), 10) + 1
      : 1000

    const receivedAt = new Date()
    const deadlineAt = new Date(receivedAt)
    deadlineAt.setDate(deadlineAt.getDate() + 7)

    const [created] = await db
      .insert(foiaRequests)
      .values({
        townId: town.id,
        publicId: `FOIA-${nextNumber}`,
        title: input.title,
        requesterName: input.requesterName,
        requesterEmail: input.requesterEmail,
        summary: input.summary,
        status: 'new',
        receivedAt,
        deadlineAt,
      })
      .returning()

    await db.insert(foiaMessages).values({
      foiaRequestId: created.id,
      authorName: input.requesterName,
      authorRole: 'Requester',
      body: input.summary,
    })

    return {
      publicId: created.publicId,
      message: 'Your request has been logged. Save your confirmation number to track status.',
    }
  })
}

// Get full meeting detail with all sub-data
export async function getFullMeeting(externalId: string) {
  const context = await getAppContext()
  const { townId } = context

  if (!townId) {
    const meeting = MEETINGS.find((m) => m.id === externalId)
    if (!meeting) return null
    return {
      meeting,
      agenda: AGENDA.map((item) => ({ ...item, id: `agenda-${item.n}`, meetingId: externalId, notes: '' })),
      motions: MOTIONS,
      actionItems: ACTION_ITEMS,
      attendance: ATTENDANCE,
    }
  }

  return withTownContext(townId, async (db) => {
    const dbMeeting = await db.query.meetings.findFirst({
      where: and(eq(meetings.townId, townId), eq(meetings.externalId, externalId)),
    })
    if (!dbMeeting) return null

    const [agendaRows, motionRows, actionRows, attendanceRows] = await Promise.all([
      db.query.agendaItems.findMany({
        where: eq(agendaItems.meetingId, dbMeeting.id),
        orderBy: [asc(agendaItems.sortOrder)],
      }),
      db.query.motions.findMany({
        where: eq(motions.meetingId, dbMeeting.id),
        orderBy: [asc(motions.sortOrder)],
      }),
      db.query.meetingActionItems.findMany({
        where: eq(meetingActionItems.meetingId, dbMeeting.id),
        orderBy: [asc(meetingActionItems.sortOrder)],
      }),
      db.query.meetingAttendance.findMany({
        where: eq(meetingAttendance.meetingId, dbMeeting.id),
        orderBy: [asc(meetingAttendance.sortOrder)],
      }),
    ])

    return {
      meeting: meetingToView(dbMeeting),
      agenda: agendaRows.map((r) => ({ id: r.id, n: r.sortOrder + 1, title: r.title, detail: r.detail, notes: r.notes, meetingId: r.meetingId })),
      motions: motionRows.map(motionToView),
      actionItems: actionRows.map(meetingActionItemToView),
      attendance: attendanceRows.map(meetingAttendanceToView),
    }
  })
}

// Agenda CRUD
export async function addAgendaItem(meetingExternalId: string, input: { title: string; detail?: string }) {
  const context = await getAppContext()
  const { townId } = context
  if (!townId) throw new Error('Database required')

  return withTownContext(townId, async (db) => {
    const meeting = await db.query.meetings.findFirst({
      where: and(eq(meetings.townId, townId), eq(meetings.externalId, meetingExternalId)),
    })
    if (!meeting) throw new Error('Meeting not found')

    const existing = await db.query.agendaItems.findMany({ where: eq(agendaItems.meetingId, meeting.id) })
    const sortOrder = existing.length

    const [item] = await db.insert(agendaItems).values({
      meetingId: meeting.id,
      title: input.title,
      detail: input.detail ?? '',
      notes: '',
      sortOrder,
    }).returning()
    return item
  })
}

export async function updateAgendaItem(itemId: string, input: { title?: string; detail?: string; notes?: string }) {
  const context = await getAppContext()
  const { townId } = context
  if (!townId) throw new Error('Database required')

  return withTownContext(townId, async (db) => {
    const [updated] = await db.update(agendaItems)
      .set({ ...input })
      .where(eq(agendaItems.id, itemId))
      .returning()
    return updated
  })
}

export async function removeAgendaItem(itemId: string) {
  const context = await getAppContext()
  const { townId } = context
  if (!townId) throw new Error('Database required')

  return withTownContext(townId, async (db) => {
    await db.delete(agendaItems).where(eq(agendaItems.id, itemId))
  })
}

// Motions CRUD
export async function addMotion(meetingExternalId: string, input: {
  agendaItemId?: string
  description: string
  movedBy?: string
  secondedBy?: string
  voteYes?: number
  voteNo?: number
  voteAbstain?: number
  outcome?: string
}): Promise<Motion> {
  const context = await getAppContext()
  const { townId } = context
  if (!townId) throw new Error('Database required')

  return withTownContext(townId, async (db) => {
    const meeting = await db.query.meetings.findFirst({
      where: and(eq(meetings.townId, townId), eq(meetings.externalId, meetingExternalId)),
    })
    if (!meeting) throw new Error('Meeting not found')

    const existing = await db.query.motions.findMany({ where: eq(motions.meetingId, meeting.id) })
    const [motion] = await db.insert(motions).values({
      meetingId: meeting.id,
      agendaItemId: input.agendaItemId ?? null,
      description: input.description,
      movedBy: input.movedBy ?? '',
      secondedBy: input.secondedBy ?? '',
      voteYes: input.voteYes ?? 0,
      voteNo: input.voteNo ?? 0,
      voteAbstain: input.voteAbstain ?? 0,
      outcome: input.outcome ?? 'pending',
      sortOrder: existing.length,
    }).returning()
    return motionToView(motion)
  })
}

export async function updateMotion(motionId: string, input: {
  description?: string
  movedBy?: string
  secondedBy?: string
  voteYes?: number
  voteNo?: number
  voteAbstain?: number
  outcome?: string
  agendaItemId?: string | null
}): Promise<Motion> {
  const context = await getAppContext()
  const { townId } = context
  if (!townId) throw new Error('Database required')

  return withTownContext(townId, async (db) => {
    const [updated] = await db.update(motions)
      .set({ ...input })
      .where(eq(motions.id, motionId))
      .returning()
    return motionToView(updated)
  })
}

export async function removeMotion(motionId: string) {
  const context = await getAppContext()
  const { townId } = context
  if (!townId) throw new Error('Database required')
  return withTownContext(townId, async (db) => {
    await db.delete(motions).where(eq(motions.id, motionId))
  })
}

// Action Items CRUD
export async function addMeetingActionItem(meetingExternalId: string, input: {
  title: string
  assignedTo?: string
  dueDate?: string
}): Promise<MeetingActionItem> {
  const context = await getAppContext()
  const { townId } = context
  if (!townId) throw new Error('Database required')

  return withTownContext(townId, async (db) => {
    const meeting = await db.query.meetings.findFirst({
      where: and(eq(meetings.townId, townId), eq(meetings.externalId, meetingExternalId)),
    })
    if (!meeting) throw new Error('Meeting not found')

    const existing = await db.query.meetingActionItems.findMany({ where: eq(meetingActionItems.meetingId, meeting.id) })
    const [item] = await db.insert(meetingActionItems).values({
      meetingId: meeting.id,
      title: input.title,
      assignedTo: input.assignedTo ?? '',
      dueDate: input.dueDate,
      done: false,
      sortOrder: existing.length,
    }).returning()
    return meetingActionItemToView(item)
  })
}

export async function updateMeetingActionItem(itemId: string, input: { title?: string; assignedTo?: string; dueDate?: string; done?: boolean }): Promise<MeetingActionItem> {
  const context = await getAppContext()
  const { townId } = context
  if (!townId) throw new Error('Database required')
  return withTownContext(townId, async (db) => {
    const [updated] = await db.update(meetingActionItems)
      .set({ ...input })
      .where(eq(meetingActionItems.id, itemId))
      .returning()
    return meetingActionItemToView(updated)
  })
}

export async function removeMeetingActionItem(itemId: string) {
  const context = await getAppContext()
  const { townId } = context
  if (!townId) throw new Error('Database required')
  return withTownContext(townId, async (db) => {
    await db.delete(meetingActionItems).where(eq(meetingActionItems.id, itemId))
  })
}

// Publish meeting
export async function publishMeeting(externalId: string) {
  const context = await getAppContext()
  const { townId } = context
  if (!townId) throw new Error('Database required')
  return withTownContext(townId, async (db) => {
    await db.update(meetings)
      .set({ status: 'published', publishedAt: new Date() })
      .where(and(eq(meetings.townId, townId), eq(meetings.externalId, externalId)))
  })
}

// Attendance CRUD
export async function addAttendee(meetingExternalId: string, input: {
  name: string; role?: string; boardName?: string; isGuest?: boolean
}): Promise<MeetingAttendance> {
  const context = await getAppContext()
  const { townId } = context
  if (!townId) throw new Error('Database required')
  return withTownContext(townId, async (db) => {
    const meeting = await db.query.meetings.findFirst({
      where: and(eq(meetings.townId, townId), eq(meetings.externalId, meetingExternalId)),
    })
    if (!meeting) throw new Error('Meeting not found')
    const existing = await db.query.meetingAttendance.findMany({ where: eq(meetingAttendance.meetingId, meeting.id) })
    const [row] = await db.insert(meetingAttendance).values({
      meetingId: meeting.id,
      name: input.name,
      role: input.role ?? '',
      boardName: input.boardName ?? '',
      isGuest: input.isGuest ?? false,
      status: 'present',
      sortOrder: existing.length,
    }).returning()
    return meetingAttendanceToView(row)
  })
}

export async function updateAttendee(attendeeId: string, input: {
  status?: string; arrivedAt?: string; leftAt?: string; name?: string; role?: string
}): Promise<MeetingAttendance> {
  const context = await getAppContext()
  const { townId } = context
  if (!townId) throw new Error('Database required')
  return withTownContext(townId, async (db) => {
    const [row] = await db.update(meetingAttendance)
      .set({ ...input })
      .where(eq(meetingAttendance.id, attendeeId))
      .returning()
    return meetingAttendanceToView(row)
  })
}

export async function removeAttendee(attendeeId: string) {
  const context = await getAppContext()
  const { townId } = context
  if (!townId) throw new Error('Database required')
  return withTownContext(townId, async (db) => {
    await db.delete(meetingAttendance).where(eq(meetingAttendance.id, attendeeId))
  })
}

// Update meeting metadata (presiding officer, called to order, adjourned at, notes, draft)
export async function updateMeeting(externalId: string, input: {
  presidingOfficer?: string
  calledToOrderAt?: string
  adjournedAt?: string
  internalNotes?: string
  minutesDraft?: string
  minutesStatus?: string
}) {
  const context = await getAppContext()
  const { townId } = context
  if (!townId) throw new Error('Database required')
  return withTownContext(townId, async (db) => {
    await db.update(meetings)
      .set({ ...input, updatedAt: new Date() })
      .where(and(eq(meetings.townId, townId), eq(meetings.externalId, externalId)))
  })
}

// Publish agenda (separate from publishing minutes)
export async function publishAgenda(externalId: string) {
  const context = await getAppContext()
  const { townId } = context
  if (!townId) throw new Error('Database required')
  return withTownContext(townId, async (db) => {
    await db.update(meetings)
      .set({ agendaPublishedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(meetings.townId, townId), eq(meetings.externalId, externalId)))
  })
}

// Approve and publish minutes
export async function approveMinutes(externalId: string) {
  const context = await getAppContext()
  const { townId } = context
  if (!townId) throw new Error('Database required')
  return withTownContext(townId, async (db) => {
    await db.update(meetings)
      .set({ minutesStatus: 'approved', minutesPublishedAt: new Date(), status: 'published', publishedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(meetings.townId, townId), eq(meetings.externalId, externalId)))
  })
}
