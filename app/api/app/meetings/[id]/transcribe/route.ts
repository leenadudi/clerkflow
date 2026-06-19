import { type NextRequest, NextResponse } from 'next/server'
import { requireStaffUser } from '@/lib/auth/app'
import { getDb } from '@/lib/db'
import { meetings } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const context = await requireStaffUser()
  if (!context.townId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const townId = context.townId

  const db = getDb()
  const meeting = await db.query.meetings.findFirst({
    where: and(eq(meetings.townId, townId), eq(meetings.externalId, id)),
  })
  if (!meeting) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const contentType = request.headers.get('content-type') ?? ''

  let transcript = ''
  let transcriptSource = ''

  if (contentType.includes('multipart/form-data')) {
    // Audio / video file upload → Groq Whisper
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY is not configured' }, { status: 500 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const Groq = (await import('groq-sdk')).default
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    const result = await groq.audio.transcriptions.create({
      file,
      model: 'whisper-large-v3-turbo',
      response_format: 'text',
    })

    transcript = typeof result === 'string' ? result : (result as { text: string }).text
    transcriptSource = 'upload'
  } else {
    // YouTube URL → captions
    const body = await request.json() as { youtubeUrl?: string }
    const { youtubeUrl } = body
    if (!youtubeUrl) return NextResponse.json({ error: 'No YouTube URL provided' }, { status: 400 })

    const videoId = extractYouTubeId(youtubeUrl)
    if (!videoId) return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })

    const { YoutubeTranscript } = await import('youtube-transcript')
    const segments = await YoutubeTranscript.fetchTranscript(videoId)
    transcript = segments.map((s) => s.text).join(' ')
    transcriptSource = 'youtube'
  }

  await db
    .update(meetings)
    .set({ transcript, transcriptSource })
    .where(eq(meetings.id, meeting.id))

  return NextResponse.json({ transcript, transcriptSource })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const context = await requireStaffUser()
  if (!context.townId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const townId = context.townId

  const db = getDb()
  const meeting = await db.query.meetings.findFirst({
    where: and(eq(meetings.townId, townId), eq(meetings.externalId, id)),
  })
  if (!meeting) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.update(meetings).set({ transcript: '', transcriptSource: '' }).where(eq(meetings.id, meeting.id))
  return NextResponse.json({ ok: true })
}

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1)
    if (u.hostname.includes('youtube.com')) return u.searchParams.get('v')
  } catch {
    // not a valid URL
  }
  return null
}
