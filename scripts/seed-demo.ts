/**
 * Seed the demo database with realistic Riverside, OH data.
 * Run after pushing schema: npx drizzle-kit push --config drizzle.demo.config.ts
 *
 * Usage: npx tsx scripts/seed-demo.ts
 */

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config()

import { Pool, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import { eq } from 'drizzle-orm'
import ws from 'ws'
import * as schema from '../lib/db/schema'

neonConfig.webSocketConstructor = ws

const url = process.env.DATABASE_URL_DEMO
if (!url) {
  console.error('DATABASE_URL_DEMO is not set in .env.local')
  process.exit(1)
}

const pool = new Pool({ connectionString: url })
const db = drizzle(pool, { schema: { ...schema } })

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(9, 0, 0, 0)
  return d
}

function daysFromNow(n: number) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  d.setHours(9, 0, 0, 0)
  return d
}

function hoursFromNow(n: number) {
  const d = new Date()
  d.setHours(d.getHours() + n, 0, 0, 0)
  return d
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function seed() {
  console.log('Seeding demo database…')

  // Clear existing demo data (order matters for FK constraints)
  await db.delete(schema.foiaAuditLog)
  await db.delete(schema.foiaDocuments)
  await db.delete(schema.foiaWorkflowSteps)
  await db.delete(schema.foiaMessages)
  await db.delete(schema.foiaRequests)
  await db.delete(schema.meetingAttendance)
  await db.delete(schema.meetingActionItems)
  await db.delete(schema.motions)
  await db.delete(schema.agendaItems)
  await db.delete(schema.meetings)
  await db.delete(schema.licenses)
  await db.delete(schema.boardTerms)
  await db.delete(schema.invitations)
  await db.delete(schema.users)
  await db.delete(schema.towns)

  // -------------------------------------------------------------------------
  // Town
  // -------------------------------------------------------------------------
  const [town] = await db
    .insert(schema.towns)
    .values({
      slug: 'riverside-oh',
      name: 'Riverside, OH',
      shortName: 'Riverside',
      population: 1200,
      clerkName: 'Sarah Chen',
      clerkRole: 'Town Clerk',
      clerkInitials: 'SC',
      clerkEmail: 'schen@riverside.oh.gov',
      state: 'OH',
      residentHubEnabled: true,
    })
    .returning()

  console.log(`  Town: ${town.name} (${town.id})`)

  // -------------------------------------------------------------------------
  // Users
  // -------------------------------------------------------------------------
  const [clerkUser] = await db
    .insert(schema.users)
    .values({
      email: 'schen@riverside.oh.gov',
      name: 'Sarah Chen',
      role: 'admin',
      townId: town.id,
    })
    .returning()

  const [staffUser] = await db
    .insert(schema.users)
    .values({
      email: 'mwilliams@riverside.oh.gov',
      name: 'Marcus Williams',
      role: 'member',
      townId: town.id,
    })
    .returning()

  console.log(`  Users: ${clerkUser.name}, ${staffUser.name}`)

  // -------------------------------------------------------------------------
  // FOIA / Records Requests
  // -------------------------------------------------------------------------

  // 1. Overdue — received 13 days ago, 5-business-day deadline passed
  const [foia1] = await db
    .insert(schema.foiaRequests)
    .values({
      townId: town.id,
      publicId: 'FOIA-2026-0041',
      title: 'Building permit records — 412 Elm St (2023–2024)',
      summary:
        'Requesting all building permits, inspection reports, and certificates of occupancy for the property at 412 Elm Street issued between January 2023 and December 2024.',
      requesterName: 'Patricia Novak',
      requesterEmail: 'pnovak@email.com',
      requesterPhone: '(937) 555-0182',
      status: 'in_progress',
      source: 'web',
      priority: 'normal',
      formatRequested: 'digital',
      deliveryMethod: 'email',
      receivedAt: daysAgo(13),
      deadlineAt: daysAgo(6), // overdue
      assignedUserId: clerkUser.id,
    })
    .returning()

  await db.insert(schema.foiaAuditLog).values([
    {
      foiaRequestId: foia1.id,
      action: 'created',
      actorName: 'System',
      actorRole: 'system',
      detail: 'Request received via web portal',
      createdAt: daysAgo(13),
    },
    {
      foiaRequestId: foia1.id,
      action: 'status_changed',
      actorName: 'Sarah Chen',
      actorRole: 'admin',
      detail: 'Status changed from New to In progress',
      createdAt: daysAgo(11),
    },
  ])

  await db.insert(schema.foiaMessages).values([
    {
      foiaRequestId: foia1.id,
      authorName: 'Sarah Chen',
      authorRole: 'staff',
      body: 'We have received your request and are gathering the relevant permit records. We will follow up shortly.',
      createdAt: daysAgo(11),
    },
    {
      foiaRequestId: foia1.id,
      authorName: 'Patricia Novak',
      authorRole: 'requester',
      body: "Thank you. I'm particularly interested in the 2024 inspection records if possible.",
      createdAt: daysAgo(10),
    },
  ])

  // 2. Due soon — received 4 days ago, deadline tomorrow
  const [foia2] = await db
    .insert(schema.foiaRequests)
    .values({
      townId: town.id,
      publicId: 'FOIA-2026-0042',
      title: 'Police incident reports — May 2026',
      summary:
        'All police incident reports and call logs for the month of May 2026, specifically relating to noise complaints and disturbances on the north side of town.',
      requesterName: 'David Kwan',
      requesterEmail: 'dkwan@riverside-gazette.com',
      requesterOrg: 'Riverside Gazette',
      status: 'new',
      source: 'email',
      priority: 'normal',
      formatRequested: 'digital',
      deliveryMethod: 'email',
      receivedAt: daysAgo(4),
      deadlineAt: daysFromNow(1), // due tomorrow
    })
    .returning()

  await db.insert(schema.foiaAuditLog).values({
    foiaRequestId: foia2.id,
    action: 'created',
    actorName: 'System',
    actorRole: 'system',
    detail: 'Request received via email',
    createdAt: daysAgo(4),
  })

  // 3. In progress — received 6 days ago, 9 days remaining
  const [foia3] = await db
    .insert(schema.foiaRequests)
    .values({
      townId: town.id,
      publicId: 'FOIA-2026-0043',
      title: 'Tax assessment records — commercial properties 2025',
      summary:
        'Requesting tax assessment records for all commercially zoned properties within town limits for the 2025 tax year, including assessed values and any appeals filed.',
      requesterName: 'Jordan Realty LLC',
      requesterEmail: 'info@jordanrealty.com',
      requesterOrg: 'Jordan Realty LLC',
      status: 'in_progress',
      source: 'walk-in',
      priority: 'normal',
      formatRequested: 'physical',
      deliveryMethod: 'pickup',
      receivedAt: daysAgo(6),
      deadlineAt: daysFromNow(9),
      assignedUserId: staffUser.id,
      internalNotes: 'Spoke with Marcus — he is coordinating with the county assessor office.',
    })
    .returning()

  await db.insert(schema.foiaAuditLog).values([
    {
      foiaRequestId: foia3.id,
      action: 'created',
      actorName: 'Sarah Chen',
      actorRole: 'admin',
      detail: 'Request received at counter — walk-in',
      createdAt: daysAgo(6),
    },
    {
      foiaRequestId: foia3.id,
      action: 'assigned',
      actorName: 'Sarah Chen',
      actorRole: 'admin',
      detail: `Assigned to ${staffUser.name}`,
      createdAt: daysAgo(5),
    },
  ])

  await db.insert(schema.foiaMessages).values({
    foiaRequestId: foia3.id,
    authorName: 'Marcus Williams',
    authorRole: 'staff',
    body: 'I have requested the full assessment roll from the county. Expecting records by end of next week.',
    createdAt: daysAgo(4),
  })

  // 4. Complete — fulfilled 5 days ago
  const [foia4] = await db
    .insert(schema.foiaRequests)
    .values({
      townId: town.id,
      publicId: 'FOIA-2026-0040',
      title: 'Council meeting minutes — Q1 2026',
      summary:
        'All approved meeting minutes for Regular Council Meetings held in January, February, and March 2026.',
      requesterName: 'Thomas Okafor',
      requesterEmail: 'tokafor@email.com',
      status: 'complete',
      source: 'web',
      priority: 'normal',
      formatRequested: 'digital',
      deliveryMethod: 'email',
      receivedAt: daysAgo(21),
      deadlineAt: daysAgo(14),
      fulfilledAt: daysAgo(15),
    })
    .returning()

  await db.insert(schema.foiaAuditLog).values([
    {
      foiaRequestId: foia4.id,
      action: 'created',
      actorName: 'System',
      actorRole: 'system',
      detail: 'Request received via web portal',
      createdAt: daysAgo(21),
    },
    {
      foiaRequestId: foia4.id,
      action: 'status_changed',
      actorName: 'Sarah Chen',
      actorRole: 'admin',
      detail: 'Status changed from New to In progress',
      createdAt: daysAgo(19),
    },
    {
      foiaRequestId: foia4.id,
      action: 'fulfilled',
      actorName: 'Sarah Chen',
      actorRole: 'admin',
      detail: 'Request fulfilled — 3 documents released via email',
      createdAt: daysAgo(15),
    },
  ])

  await db.insert(schema.foiaDocuments).values([
    {
      foiaRequestId: foia4.id,
      name: 'Council Minutes — January 2026.pdf',
      fileUrl: '#',
      fileSize: 184320,
      mimeType: 'application/pdf',
      uploadedBy: 'Sarah Chen',
      isRedacted: false,
    },
    {
      foiaRequestId: foia4.id,
      name: 'Council Minutes — February 2026.pdf',
      fileUrl: '#',
      fileSize: 203776,
      mimeType: 'application/pdf',
      uploadedBy: 'Sarah Chen',
      isRedacted: false,
    },
    {
      foiaRequestId: foia4.id,
      name: 'Council Minutes — March 2026.pdf',
      fileUrl: '#',
      fileSize: 196608,
      mimeType: 'application/pdf',
      uploadedBy: 'Sarah Chen',
      isRedacted: false,
    },
  ])

  console.log('  FOIA requests: 4')

  // -------------------------------------------------------------------------
  // Meetings
  // -------------------------------------------------------------------------

  // 1. Past — published
  const [mtg1] = await db
    .insert(schema.meetings)
    .values({
      townId: town.id,
      externalId: 'mtg-council-jun3',
      title: 'Regular Council Meeting — June 3, 2026',
      body: 'Town Council',
      location: 'Town Hall, Main Chamber',
      status: 'published',
      meetingType: 'council',
      startsAt: daysAgo(15),
      publishedAt: daysAgo(14),
      agendaPublishedAt: daysAgo(18),
      minutesStatus: 'approved',
      minutesPublishedAt: daysAgo(14),
      presidingOfficer: 'Mayor R. Hartwell',
      calledToOrderAt: '7:02 PM',
      adjournedAt: '8:44 PM',
    })
    .returning()

  await db.insert(schema.agendaItems).values([
    { meetingId: mtg1.id, sortOrder: 1, title: 'Call to order', detail: '' },
    { meetingId: mtg1.id, sortOrder: 2, title: 'Approval of May 6 minutes', detail: '' },
    { meetingId: mtg1.id, sortOrder: 3, title: 'Public comment', detail: '' },
    {
      meetingId: mtg1.id,
      sortOrder: 4,
      title: 'Resolution 2026-14 — Road resurfacing contract award',
      detail: 'Authorizing the Mayor to execute a contract with Midstate Paving for $87,400.',
    },
    {
      meetingId: mtg1.id,
      sortOrder: 5,
      title: 'Ordinance 2026-07 — Noise ordinance amendment (first reading)',
      detail: 'Amending Chapter 4 to extend quiet hours on weekends to 10 PM.',
    },
    { meetingId: mtg1.id, sortOrder: 6, title: 'Adjournment', detail: '' },
  ])

  // 2. Past — published
  await db.insert(schema.meetings).values({
    townId: town.id,
    externalId: 'mtg-planning-may20',
    title: 'Planning Commission — May 20, 2026',
    body: 'Planning Commission',
    location: 'Town Hall, Conference Room B',
    status: 'published',
    meetingType: 'planning',
    startsAt: daysAgo(29),
    publishedAt: daysAgo(28),
    agendaPublishedAt: daysAgo(33),
    minutesStatus: 'approved',
    minutesPublishedAt: daysAgo(28),
    presidingOfficer: 'Chair L. Morrow',
    calledToOrderAt: '6:31 PM',
    adjournedAt: '8:05 PM',
  })

  // 3. Past — published (yesterday)
  const [mtg3] = await db
    .insert(schema.meetings)
    .values({
      townId: town.id,
      externalId: 'mtg-council-jun17',
      title: 'Regular Council Meeting — June 17, 2026',
      body: 'Town Council',
      location: 'Town Hall, Main Chamber',
      status: 'published',
      meetingType: 'council',
      startsAt: daysAgo(1),
      publishedAt: daysAgo(1),
      agendaPublishedAt: daysAgo(5),
      minutesStatus: 'draft',
      presidingOfficer: 'Mayor R. Hartwell',
      calledToOrderAt: '7:00 PM',
      adjournedAt: '9:12 PM',
    })
    .returning()

  await db.insert(schema.meetingActionItems).values([
    {
      meetingId: mtg3.id,
      title: 'Publish noise ordinance amendment for 30-day public comment',
      assignedTo: 'Sarah Chen',
      dueDate: '2026-07-01',
      done: false,
      sortOrder: 1,
    },
    {
      meetingId: mtg3.id,
      title: 'Send resurfacing contract to Midstate Paving for signature',
      assignedTo: 'Marcus Williams',
      dueDate: '2026-06-25',
      done: false,
      sortOrder: 2,
    },
  ])

  // 4. Upcoming — draft
  await db.insert(schema.meetings).values({
    townId: town.id,
    externalId: 'mtg-council-jul1',
    title: 'Regular Council Meeting — July 1, 2026',
    body: 'Town Council',
    location: 'Town Hall, Main Chamber',
    status: 'draft',
    meetingType: 'council',
    startsAt: daysFromNow(13),
    minutesStatus: 'not_started',
  })

  // 5. Upcoming — draft (planning)
  await db.insert(schema.meetings).values({
    townId: town.id,
    externalId: 'mtg-planning-jun24',
    title: 'Planning Commission — June 24, 2026',
    body: 'Planning Commission',
    location: 'Town Hall, Conference Room B',
    status: 'draft',
    meetingType: 'planning',
    startsAt: daysFromNow(6),
    minutesStatus: 'not_started',
  })

  console.log('  Meetings: 5')

  // -------------------------------------------------------------------------
  // Board Terms
  // -------------------------------------------------------------------------

  await db.insert(schema.boardTerms).values([
    // Planning Commission
    {
      townId: town.id,
      memberName: 'Linda Morrow',
      boardName: 'Planning Commission',
      seat: 'Chair',
      expiresAt: daysFromNow(380),
    },
    {
      townId: town.id,
      memberName: 'Gerald Kim',
      boardName: 'Planning Commission',
      seat: 'Member',
      expiresAt: daysFromNow(47), // expiring soon
    },
    {
      townId: town.id,
      memberName: 'Rosa Alvarez',
      boardName: 'Planning Commission',
      seat: 'Member',
      expiresAt: daysFromNow(52), // expiring soon
    },
    // Zoning Board
    {
      townId: town.id,
      memberName: 'Frank Ostrowski',
      boardName: 'Zoning Board of Appeals',
      seat: 'Chair',
      expiresAt: daysFromNow(290),
    },
    {
      townId: town.id,
      memberName: 'Diane Park',
      boardName: 'Zoning Board of Appeals',
      seat: 'Member',
      expiresAt: daysFromNow(55), // expiring soon
    },
    // Parks & Rec
    {
      townId: town.id,
      memberName: 'James Thornton',
      boardName: 'Parks & Recreation Board',
      seat: 'Chair',
      expiresAt: daysFromNow(200),
    },
    {
      townId: town.id,
      memberName: 'Anita Sosa',
      boardName: 'Parks & Recreation Board',
      seat: 'Member',
      expiresAt: daysFromNow(15), // expiring very soon
    },
  ])

  console.log('  Board terms: 7')

  // -------------------------------------------------------------------------
  // Licenses & Permits
  // -------------------------------------------------------------------------

  await db.insert(schema.licenses).values([
    {
      townId: town.id,
      publicId: 'LIC-001',
      type: 'Dog License',
      applicantName: 'Claire Foster',
      applicantEmail: 'cfoster@email.com',
      applicantPhone: '(937) 555-0144',
      description: 'Annual dog license — 1 dog, spayed female, Golden Retriever',
      status: 'approved',
      fee: 1200,
      feePaidAt: daysAgo(30),
      submittedAt: daysAgo(32),
      expiresAt: daysFromNow(335),
    },
    {
      townId: town.id,
      publicId: 'LIC-002',
      type: 'Home Occupation Permit',
      applicantName: 'Ray Patel',
      applicantEmail: 'rpatel@pateldesigns.com',
      applicantPhone: '(937) 555-0261',
      description: 'Home-based graphic design studio — no client visits, no signage',
      status: 'pending',
      fee: 5000,
      submittedAt: daysAgo(5),
    },
    {
      townId: town.id,
      publicId: 'LIC-003',
      type: 'Burn Permit',
      applicantName: 'Hillside Farm LLC',
      applicantEmail: 'info@hillsidefarm.com',
      description: 'Agricultural field burn — south parcel, approx 4 acres of crop stubble',
      status: 'pending',
      fee: 0,
      submittedAt: daysAgo(2),
    },
    {
      townId: town.id,
      publicId: 'LIC-004',
      type: 'Vendor / Transient Merchant Permit',
      applicantName: "Maria's Tamales",
      applicantEmail: 'maria.g@email.com',
      description: 'Food cart — Riverside Farmers Market, Saturdays June–September 2026',
      status: 'approved',
      fee: 7500,
      feePaidAt: daysAgo(18),
      submittedAt: daysAgo(20),
      expiresAt: daysFromNow(100),
    },
    {
      townId: town.id,
      publicId: 'LIC-005',
      type: 'Special Event Permit',
      applicantName: 'Riverside Lions Club',
      applicantEmail: 'secretary@riversidelions.org',
      description: 'Annual 4th of July block party — Maple Ave between 3rd and 5th St',
      status: 'pending',
      fee: 2500,
      submittedAt: daysAgo(8),
    },
  ])

  console.log('  Licenses: 5')
  console.log('\nDemo database seeded successfully.')
  console.log(`Town ID: ${town.id}`)
}

seed()
  .catch((err) => {
    console.error('Seed failed:', err)
    process.exit(1)
  })
  .finally(() => pool.end())
