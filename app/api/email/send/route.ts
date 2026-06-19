import { type NextRequest, NextResponse } from 'next/server'
import { requireStaffUser } from '@/lib/auth/app'
import { getDb } from '@/lib/db'
import { gmailConnections, processedEmails } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { sendReply } from '@/lib/gmail/client'

export async function POST(request: NextRequest) {
  try {
    const context = await requireStaffUser()
    if (!context.townId) return NextResponse.json({ error: 'No town configured' }, { status: 400 })
    const townId = context.townId

    const body = await request.json()
    const { emailId, replyBody } = body as { emailId?: string; replyBody?: string }

    if (!emailId || !replyBody?.trim()) {
      return NextResponse.json({ error: 'emailId and replyBody are required' }, { status: 400 })
    }

    const db = getDb()

    const email = await db.query.processedEmails.findFirst({
      where: and(
        eq(processedEmails.id, emailId),
        eq(processedEmails.townId, townId),
      ),
    })
    if (!email) return NextResponse.json({ error: 'Email not found' }, { status: 404 })

    const connection = await db.query.gmailConnections.findFirst({
      where: and(
        eq(gmailConnections.id, email.connectionId),
        eq(gmailConnections.isActive, true),
      ),
    })
    if (!connection) {
      return NextResponse.json({ error: 'Gmail connection not found' }, { status: 400 })
    }

    const subject = email.subject.startsWith('Re: ') ? email.subject : `Re: ${email.subject}`

    await sendReply(connection.clerkUserId, {
      to: email.fromEmail,
      subject,
      body: replyBody,
      threadId: email.gmailThreadId,
    })

    await db
      .update(processedEmails)
      .set({ status: 'handled' })
      .where(eq(processedEmails.id, emailId))

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Send reply error:', err)
    return NextResponse.json({ error: 'Failed to send reply' }, { status: 500 })
  }
}
