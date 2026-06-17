import { and, asc, desc, eq } from 'drizzle-orm'
import type { StatusKey } from '@/components/status-pill'
import {
  AGENDA,
  BOARD_TERMS,
  FOIA_REQUESTS,
  MEETINGS,
  type AgendaItem,
  type BoardTerm,
  type FoiaRequest,
  type Meeting,
} from '@/lib/data'
import { getDb, isDatabaseConfigured, withTownContext } from '@/lib/db'
import {
  agendaToView,
  boardTermToView,
  foiaMessageToView,
  foiaToView,
  meetingToView,
  workflowStepToView,
  type FoiaThreadMessage,
  type WorkflowStep,
} from '@/lib/db/mappers'
import {
  agendaItems,
  boardTerms,
  foiaMessages,
  foiaRequests,
  foiaWorkflowSteps,
  meetings,
  towns,
} from '@/lib/db/schema'
import { getAppContext } from '@/lib/auth/app'

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
    return rows.map((row) => foiaToView(row, row.assignedUser, context.user?.id ?? null))
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
  summary: string
  assignedUserId?: string | null
}

export async function createFoiaRequest(input: CreateFoiaInput) {
  const context = await getAppContext()
  if (!context.townId) throw new Error('Database is not configured')

  return withTownContext(context.townId, async (db) => {
    const latest = await db.query.foiaRequests.findMany({
      where: eq(foiaRequests.townId, context.townId!),
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
        townId: context.townId!,
        publicId: `FOIA-${nextNumber}`,
        title: input.title,
        requesterName: input.requesterName,
        requesterEmail: input.requesterEmail,
        summary: input.summary,
        status: 'new',
        assignedUserId: input.assignedUserId ?? context.user?.id ?? null,
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

    await db.insert(foiaWorkflowSteps).values([
      { foiaRequestId: created.id, label: 'Request logged', meta: 'Just now', state: 'done', sortOrder: 1 },
      { foiaRequestId: created.id, label: 'Acknowledgment sent', meta: 'Pending', state: 'current', sortOrder: 2 },
      { foiaRequestId: created.id, label: 'Records gathered', meta: 'Pending', state: 'pending', sortOrder: 3 },
      { foiaRequestId: created.id, label: 'Review & redact', meta: 'Pending', state: 'pending', sortOrder: 4 },
      { foiaRequestId: created.id, label: 'Release to requester', meta: 'Pending', state: 'pending', sortOrder: 5 },
    ])

    return foiaToView(created, null, context.user?.id ?? null)
  })
}

export async function updateFoiaStatus(publicId: string, status: StatusKey) {
  const context = await getAppContext()
  if (!context.townId) throw new Error('Database is not configured')

  return withTownContext(context.townId, async (db) => {
    const [updated] = await db
      .update(foiaRequests)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(foiaRequests.townId, context.townId!), eq(foiaRequests.publicId, publicId)))
      .returning()

    if (!updated) return null
    return foiaToView(updated, null, context.user?.id ?? null)
  })
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
}

export async function createMeeting(input: CreateMeetingInput) {
  const context = await getAppContext()
  if (!context.townId) throw new Error('Database is not configured')

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
      })
      .returning()

    return meetingToView(created)
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
