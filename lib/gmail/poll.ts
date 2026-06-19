import { getDb } from '@/lib/db'
import { gmailConnections, processedEmails, foiaRequests, licenses } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { listNewMessageIds, getMessage } from './client'
import { classifyEmail } from './classify'

const BUSINESS_DAYS_DEADLINE = 5

function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date)
  let added = 0
  while (added < days) {
    result.setDate(result.getDate() + 1)
    const dow = result.getDay()
    if (dow !== 0 && dow !== 6) added++
  }
  return result
}

export async function pollAllConnections(): Promise<{ processed: number; errors: number }> {
  const db = getDb()
  const connections = await db.query.gmailConnections.findMany({
    where: eq(gmailConnections.isActive, true),
  })

  let processed = 0
  let errors = 0

  for (const connection of connections) {
    try {
      processed += await pollConnection(connection)
    } catch (err) {
      console.error(`Poll failed for gmail_connection ${connection.id}:`, err)
      errors++
    }
  }

  return { processed, errors }
}

async function pollConnection(connection: typeof gmailConnections.$inferSelect): Promise<number> {
  const db = getDb()
  const since = connection.lastCheckedAt

  const messageIds = await listNewMessageIds(connection.clerkUserId, since)
  let count = 0

  for (const msgId of messageIds) {
    const existing = await db.query.processedEmails.findFirst({
      where: and(
        eq(processedEmails.townId, connection.townId),
        eq(processedEmails.gmailMessageId, msgId),
      ),
    })
    if (existing) continue

    let msg: Awaited<ReturnType<typeof getMessage>> | null = null
    try {
      msg = await getMessage(connection.clerkUserId, msgId)
    } catch (err) {
      console.error(`Failed to fetch message ${msgId}:`, err)
      continue
    }

    let classification = 'general_inquiry'
    let confidence = 'low'
    let summary = msg.subject
    let shouldCreateRecord = false

    try {
      const result = await classifyEmail(msg)
      classification = result.classification
      confidence = result.confidence
      summary = result.summary
      shouldCreateRecord = result.shouldCreateRecord
    } catch (err) {
      console.error(`Classification failed for message ${msgId}:`, err)
    }

    // Create the linked record first so we can store its ID
    let linkedRecordId: string | null = null
    let linkedRecordType: string | null = null

    if (shouldCreateRecord) {
      try {
        const ids = await createLinkedRecord({
          classification,
          townId: connection.townId,
          fromName: msg.fromName,
          fromEmail: msg.fromEmail,
          subject: msg.subject,
          bodyText: msg.bodyText,
          receivedAt: msg.receivedAt,
        })
        linkedRecordId = ids?.publicId ?? null
        linkedRecordType = ids?.type ?? null
      } catch (err) {
        console.error(`Failed to create linked record for message ${msgId}:`, err)
      }
    }

    try {
      await db.insert(processedEmails).values({
        townId: connection.townId,
        connectionId: connection.id,
        gmailMessageId: msg.id,
        gmailThreadId: msg.threadId,
        fromEmail: msg.fromEmail,
        fromName: msg.fromName,
        subject: msg.subject,
        bodyText: msg.bodyText.slice(0, 10000),
        receivedAt: msg.receivedAt,
        classification,
        aiConfidence: confidence,
        aiSummary: summary,
        linkedRecordId,
        linkedRecordType,
        status: linkedRecordId ? 'confirmed' : shouldCreateRecord ? 'draft' : 'handled',
      })
      count++
    } catch (err) {
      console.error(`Failed to insert message ${msgId}:`, err)
    }
  }

  await db
    .update(gmailConnections)
    .set({ lastCheckedAt: new Date(), emailsProcessed: connection.emailsProcessed + count })
    .where(eq(gmailConnections.id, connection.id))

  return count
}

async function createLinkedRecord(opts: {
  classification: string
  townId: string
  fromName: string
  fromEmail: string
  subject: string
  bodyText: string
  receivedAt: Date
}): Promise<{ publicId: string; type: string } | null> {
  const { classification, townId, fromName, fromEmail, subject, bodyText, receivedAt } = opts
  const db = getDb()

  if (classification === 'records_request') {
    // Generate next publicId
    const existing = await db.query.foiaRequests.findMany({
      where: eq(foiaRequests.townId, townId),
      columns: { publicId: true },
    })
    const year = new Date().getFullYear()
    const nextSeq = existing.length + 1
    const publicId = `FOIA-${year}-${String(nextSeq).padStart(4, '0')}`
    const deadlineAt = addBusinessDays(receivedAt, BUSINESS_DAYS_DEADLINE)

    await db.insert(foiaRequests).values({
      townId,
      publicId,
      title: subject || 'Records request via email',
      requesterName: fromName || fromEmail,
      requesterEmail: fromEmail,
      summary: bodyText.slice(0, 500) || subject,
      source: 'email',
      status: 'new',
      receivedAt,
      deadlineAt,
    })

    return { publicId, type: 'foia_request' }
  }

  if (classification === 'permit_application') {
    const existing = await db.query.licenses.findMany({
      where: eq(licenses.townId, townId),
      columns: { publicId: true },
      orderBy: [desc(licenses.createdAt)],
    })
    const latest = existing[0]?.publicId
    const nextNum = latest ? Number.parseInt(latest.replace('LIC-', ''), 10) + 1 : 1
    const publicId = `LIC-${String(nextNum).padStart(3, '0')}`

    await db.insert(licenses).values({
      townId,
      publicId,
      type: 'permit_application',
      applicantName: fromName || fromEmail,
      applicantEmail: fromEmail,
      description: bodyText.slice(0, 500) || subject,
      status: 'pending',
      submittedAt: receivedAt,
    })

    return { publicId, type: 'license' }
  }

  if (classification === 'resident_complaint') {
    // Resident complaints go in as FOIA-style records with source 'email'
    // and a longer deadline (they're not statutory FOIA requests)
    const existing = await db.query.foiaRequests.findMany({
      where: eq(foiaRequests.townId, townId),
      columns: { publicId: true },
    })
    const year = new Date().getFullYear()
    const nextSeq = existing.length + 1
    const publicId = `REQ-${year}-${String(nextSeq).padStart(4, '0')}`
    const deadlineAt = addBusinessDays(receivedAt, 10)

    await db.insert(foiaRequests).values({
      townId,
      publicId,
      title: subject || 'Resident complaint via email',
      requesterName: fromName || fromEmail,
      requesterEmail: fromEmail,
      summary: bodyText.slice(0, 500) || subject,
      source: 'email',
      status: 'new',
      receivedAt,
      deadlineAt,
    })

    return { publicId, type: 'resident_complaint' }
  }

  return null
}
