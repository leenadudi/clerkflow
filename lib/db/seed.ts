import { eq } from 'drizzle-orm'
import { getDb } from './index'
import {
  agendaItems,
  boardTerms,
  foiaMessages,
  foiaRequests,
  foiaWorkflowSteps,
  meetings,
  towns,
  users,
} from './schema'

function at(year: number, month: number, day: number, hour = 12, minute = 0) {
  return new Date(year, month - 1, day, hour, minute)
}

export async function seedDatabase() {
  const db = getDb()

  const existing = await db.query.towns.findFirst({
    where: eq(towns.slug, 'riverside-oh'),
  })
  if (existing) {
    console.log('Demo town already seeded — skipping.')
    return existing.id
  }

  const [town] = await db
    .insert(towns)
    .values({
      slug: 'riverside-oh',
      name: 'Township of Riverside, Ohio',
      shortName: 'Riverside, OH',
      population: 1200,
      clerkName: 'Barbara Jensen',
      clerkRole: 'Town Clerk',
      clerkInitials: 'BJ',
      clerkEmail: 'clerk@riverside-oh.gov',
    })
    .returning()

  const [clerkUser] = await db
    .insert(users)
    .values({
      email: 'barbara@riverside-oh.gov',
      name: 'Barbara Jensen',
      role: 'town_clerk',
      townId: town.id,
    })
    .returning()

  const foiaSeed = [
    {
      publicId: 'FOIA-1042',
      title: 'Police incident reports — Maple St, June 2026',
      requesterName: 'Dana Whitfield',
      summary:
        'Requesting all police incident reports filed for the 400 block of Maple Street during June 2026.',
      status: 'overdue',
      receivedAt: at(2026, 6, 9, 9, 14),
      deadlineAt: at(2026, 6, 11),
      assignedUserId: clerkUser.id,
    },
    {
      publicId: 'FOIA-1041',
      title: 'Zoning variance applications — Q2 2026',
      requesterName: 'Marcus Webb',
      summary:
        'All zoning variance applications submitted to the Planning Commission in the second quarter.',
      status: 'due-soon',
      receivedAt: at(2026, 6, 12),
      deadlineAt: at(2026, 6, 15),
      assignedUserId: clerkUser.id,
    },
    {
      publicId: 'FOIA-1040',
      title: 'Water department billing rate history',
      requesterName: 'Lillian Pierce',
      summary:
        'Historical water utility billing rates for residential accounts from 2020 to present.',
      status: 'in-progress',
      receivedAt: at(2026, 6, 13),
      deadlineAt: at(2026, 6, 20),
      assignedUserId: clerkUser.id,
    },
    {
      publicId: 'FOIA-1039',
      title: 'Council meeting minutes — May 2026',
      requesterName: 'Hector Alvarez',
      summary: 'Copies of all approved Town Council minutes for the month of May 2026.',
      status: 'new',
      receivedAt: at(2026, 6, 14),
      deadlineAt: at(2026, 6, 21),
      assignedUserId: null,
    },
    {
      publicId: 'FOIA-1038',
      title: 'Road salt procurement contract',
      requesterName: 'Susan Reyes',
      summary:
        'The current contract and bid documents for winter road salt procurement.',
      status: 'complete',
      receivedAt: at(2026, 6, 2),
      deadlineAt: at(2026, 6, 9),
      assignedUserId: clerkUser.id,
    },
  ] as const

  for (const item of foiaSeed) {
    const [request] = await db
      .insert(foiaRequests)
      .values({
        townId: town.id,
        publicId: item.publicId,
        title: item.title,
        requesterName: item.requesterName,
        summary: item.summary,
        status: item.status,
        receivedAt: item.receivedAt,
        deadlineAt: item.deadlineAt,
        assignedUserId: item.assignedUserId,
      })
      .returning()

    if (item.publicId === 'FOIA-1042') {
      await db.insert(foiaMessages).values([
        {
          foiaRequestId: request.id,
          authorName: 'Dana Whitfield',
          authorRole: 'Requester',
          body: item.summary,
          createdAt: at(2026, 6, 9, 9, 14),
        },
        {
          foiaRequestId: request.id,
          authorName: 'Barbara Jensen',
          authorRole: 'Town Clerk',
          body: 'Thank you for your request. We have logged it as FOIA-1042 and will respond within the statutory timeframe. We are coordinating with the Police Department to gather responsive records.',
          createdAt: at(2026, 6, 9, 14, 40),
        },
        {
          foiaRequestId: request.id,
          authorName: 'Barbara Jensen',
          authorRole: 'Town Clerk',
          body: 'An update: two reports may contain personal information requiring redaction. We are reviewing them now.',
          createdAt: at(2026, 6, 11, 11, 5),
        },
      ])

      await db.insert(foiaWorkflowSteps).values([
        {
          foiaRequestId: request.id,
          label: 'Request logged',
          meta: 'Jun 9, 2026',
          state: 'done',
          sortOrder: 1,
        },
        {
          foiaRequestId: request.id,
          label: 'Acknowledgment sent',
          meta: 'Jun 9, 2026',
          state: 'done',
          sortOrder: 2,
        },
        {
          foiaRequestId: request.id,
          label: 'Records gathered',
          meta: '3 documents',
          state: 'done',
          sortOrder: 3,
        },
        {
          foiaRequestId: request.id,
          label: 'Review & redact',
          meta: 'In progress',
          state: 'current',
          sortOrder: 4,
        },
        {
          foiaRequestId: request.id,
          label: 'Release to requester',
          meta: 'Pending',
          state: 'pending',
          sortOrder: 5,
        },
      ])
    }
  }

  const meetingSeed = [
    {
      externalId: 'mtg-061826',
      title: 'Regular Council Meeting',
      body: 'Town Council',
      startsAt: at(2026, 6, 18, 19, 0),
      location: 'Town Hall, Main Chamber',
      status: 'scheduled',
    },
    {
      externalId: 'mtg-061126',
      title: 'Planning Commission',
      body: 'Planning Commission',
      startsAt: at(2026, 6, 11, 18, 30),
      location: 'Town Hall, Conference Room B',
      status: 'published',
      publishedAt: at(2026, 6, 8),
    },
    {
      externalId: 'mtg-060426',
      title: 'Regular Council Meeting',
      body: 'Town Council',
      startsAt: at(2026, 6, 4, 19, 0),
      location: 'Town Hall, Main Chamber',
      status: 'published',
      publishedAt: at(2026, 6, 1),
    },
    {
      externalId: 'mtg-062526',
      title: 'Parks & Recreation Board',
      body: 'Parks & Recreation Board',
      startsAt: at(2026, 6, 25, 17, 30),
      location: 'Community Center',
      status: 'draft',
    },
  ] as const

  for (const item of meetingSeed) {
    const [meeting] = await db
      .insert(meetings)
      .values({
        townId: town.id,
        externalId: item.externalId,
        title: item.title,
        body: item.body,
        startsAt: item.startsAt,
        location: item.location,
        status: item.status,
        publishedAt: 'publishedAt' in item ? item.publishedAt : null,
      })
      .returning()

    if (item.externalId === 'mtg-061826') {
      await db.insert(agendaItems).values([
        { meetingId: meeting.id, sortOrder: 1, title: 'Call to order & roll call', detail: 'Presiding: Mayor R. Coleman' },
        { meetingId: meeting.id, sortOrder: 2, title: 'Approval of minutes — June 4, 2026', detail: 'Action item' },
        { meetingId: meeting.id, sortOrder: 3, title: 'Public comment period', detail: '3 minutes per speaker' },
        {
          meetingId: meeting.id,
          sortOrder: 4,
          title: 'Resolution 2026-14: Maple Street paving contract',
          detail: 'Discussion & vote',
        },
        {
          meetingId: meeting.id,
          sortOrder: 5,
          title: 'Ordinance 2026-08: Updated noise ordinance',
          detail: 'First reading',
        },
        {
          meetingId: meeting.id,
          sortOrder: 6,
          title: 'Treasurer report — May 2026',
          detail: 'Informational',
        },
        { meetingId: meeting.id, sortOrder: 7, title: 'Old business', detail: 'Sidewalk repair grant update' },
        { meetingId: meeting.id, sortOrder: 8, title: 'New business', detail: 'Fall festival permit request' },
        { meetingId: meeting.id, sortOrder: 9, title: 'Adjournment', detail: '' },
      ])
    }
  }

  await db.insert(boardTerms).values([
    {
      townId: town.id,
      memberName: 'Eleanor Pratt',
      boardName: 'Planning Commission',
      seat: 'Seat 2',
      expiresAt: at(2026, 7, 1),
    },
    {
      townId: town.id,
      memberName: 'Gregory Nunn',
      boardName: 'Board of Zoning Appeals',
      seat: 'Seat 4',
      expiresAt: at(2026, 8, 15),
    },
    {
      townId: town.id,
      memberName: 'Priya Anand',
      boardName: 'Parks & Recreation Board',
      seat: 'Chair',
      expiresAt: at(2026, 12, 31),
    },
  ])

  console.log('Seeded Riverside demo data.')
  return town.id
}
