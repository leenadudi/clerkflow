import { NextRequest, NextResponse } from 'next/server'
import { requireStaffUser } from '@/lib/auth/app'
import { getFullMeeting, updateMeeting } from '@/lib/server/data'

const SYSTEM_PROMPT =
  'You are a municipal clerk assistant. Generate formal meeting minutes in standard US municipal format. Write in past tense, third person, neutral formal voice. Use actual names and details from the data provided. If notes for an item are empty or thin, write [REVIEW: insufficient notes] as a placeholder. Never fabricate specific facts, names, or vote counts not provided. Format motions as: \'Motion by [name] to [description]. Seconded by [name]. Vote: X–Y–Z. Motion [carried/failed].\' Include: meeting header, members present/absent, each agenda item in order, adjournment.'

function buildUserPrompt(data: NonNullable<Awaited<ReturnType<typeof getFullMeeting>>>): string {
  const { meeting, agenda, motions, attendance } = data

  const attendanceLines = attendance && attendance.length > 0
    ? attendance.map((a) => `- ${a.name}${a.role ? ` (${a.role})` : ''}: ${a.status}`).join('\n')
    : '(no attendance recorded)'

  const agendaLines = agenda && agenda.length > 0
    ? agenda
        .map((item, i) => `${i + 1}. ${item.title}\nNotes: ${item.notes || '(no notes)'}`)
        .join('\n\n')
    : '(no agenda items)'

  const motionLines = motions && motions.length > 0
    ? motions
        .map(
          (m) =>
            `Motion: ${m.description}\nMoved by: ${m.movedBy}\nSeconded by: ${m.secondedBy}\nVote: ${m.voteYes}–${m.voteNo}–${m.voteAbstain} (yes–no–abstain)\nOutcome: ${m.outcome}`,
        )
        .join('\n\n')
    : '(no motions recorded)'

  return `MEETING: ${meeting.title}
DATE: ${meeting.date} at ${meeting.time}
LOCATION: ${meeting.location}
PRESIDING: ${meeting.presidingOfficer || '[not recorded]'}
CALLED TO ORDER: ${'calledToOrderAt' in meeting ? (meeting as Record<string, unknown>).calledToOrderAt || '[not recorded]' : '[not recorded]'}

ATTENDANCE:
${attendanceLines}

AGENDA ITEMS AND NOTES:
${agendaLines}

MOTIONS:
${motionLines}

ADJOURN: ${'adjournedAt' in meeting ? (meeting as Record<string, unknown>).adjournedAt || '[not recorded]' : '[not recorded]'}`
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireStaffUser()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const data = await getFullMeeting(id)
    if (!data) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'AI minutes generation requires a GOOGLE_AI_API_KEY',
          setup: 'Get a free key at aistudio.google.com/apikey',
        },
        { status: 503 },
      )
    }

    const userPrompt = buildUserPrompt(data)

    const { GoogleGenAI } = await import('@google/genai')
    const ai = new GoogleGenAI({ apiKey })
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: { systemInstruction: SYSTEM_PROMPT },
    })
    const draft = response.text ?? ''

    await updateMeeting(id, { minutesDraft: draft, minutesStatus: 'draft' })

    return NextResponse.json({ draft })
  } catch (error) {
    if (error instanceof Error && error.message === 'Not found') {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }
    console.error('generate-draft error:', error)
    return NextResponse.json({ error: 'Failed to generate minutes draft' }, { status: 500 })
  }
}
