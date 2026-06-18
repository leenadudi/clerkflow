import { NextRequest } from 'next/server'
import { requireStaffUser } from '@/lib/auth/app'
import { getFullMeeting, getTownView } from '@/lib/server/data'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildAgendaHtml(
  townName: string,
  meeting: { title: string; date: string; time: string; location: string },
  agenda: Array<{ n: number; title: string; detail?: string }>,
  postedDate: string,
): string {
  const items = agenda
    .map(
      (item) => `
      <div class="item">
        <span class="item-num">${item.n}.</span>${escapeHtml(item.title)}
        ${item.detail ? `<div class="item-detail">${escapeHtml(item.detail)}</div>` : ''}
      </div>`,
    )
    .join('')

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${escapeHtml(meeting.title)} — Agenda</title>
<style>
  body { font-family: Georgia, serif; max-width: 700px; margin: 40px auto; color: #111; font-size: 13px; line-height: 1.6; }
  h1 { font-size: 18px; text-align: center; margin-bottom: 4px; }
  .meta { text-align: center; color: #444; margin-bottom: 24px; font-size: 12px; }
  .item { margin: 12px 0; padding-left: 20px; }
  .item-num { font-weight: bold; margin-right: 8px; }
  .item-detail { color: #555; font-size: 11px; }
  @media print { body { margin: 20px; } }
</style>
</head>
<body>
<h1>${escapeHtml(townName)}</h1>
<h2 style="text-align:center;font-size:14px">${escapeHtml(meeting.title)}</h2>
<p class="meta">${escapeHtml(meeting.date)} &middot; ${escapeHtml(meeting.time)} &middot; ${escapeHtml(meeting.location)}</p>
<hr>
<h3>AGENDA</h3>
${items || '<p>(No agenda items)</p>'}
<p style="margin-top:40px;font-size:11px;color:#777">This agenda was prepared by the Town Clerk. Posted ${escapeHtml(postedDate)}.</p>
<script>window.onload = function() { if (window.location.search.includes('print=1')) window.print(); }</script>
</body>
</html>`
}

function buildMinutesHtml(
  townName: string,
  meeting: { title: string; date: string; time: string; location: string; minutesDraft?: string },
): string {
  const draft = meeting.minutesDraft || ''
  const paragraphs = draft
    ? draft
        .split('\n\n')
        .filter(Boolean)
        .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
        .join('\n')
    : '<p><em>(No minutes draft available. Generate a draft from the meeting detail page.)</em></p>'

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${escapeHtml(meeting.title)} — Minutes</title>
<style>
  body { font-family: Georgia, serif; max-width: 700px; margin: 40px auto; color: #111; font-size: 13px; line-height: 1.7; }
  h1 { font-size: 18px; text-align: center; margin-bottom: 4px; }
  .meta { text-align: center; color: #444; margin-bottom: 24px; font-size: 12px; }
  p { margin: 0 0 12px; }
  @media print { body { margin: 20px; } }
</style>
</head>
<body>
<h1>${escapeHtml(townName)}</h1>
<h2 style="text-align:center;font-size:14px">${escapeHtml(meeting.title)} — Minutes</h2>
<p class="meta">${escapeHtml(meeting.date)} &middot; ${escapeHtml(meeting.time)} &middot; ${escapeHtml(meeting.location)}</p>
<hr>
${paragraphs}
<script>window.onload = function() { if (window.location.search.includes('print=1')) window.print(); }</script>
</body>
</html>`
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireStaffUser()
  } catch {
    return new Response('Unauthorized', { status: 401 })
  }

  const { id } = await params
  const type = request.nextUrl.searchParams.get('type') ?? 'agenda'

  try {
    const [data, town] = await Promise.all([getFullMeeting(id), getTownView()])

    if (!data) {
      return new Response('Meeting not found', { status: 404 })
    }

    const townName = town?.name ?? 'Town'
    const postedDate = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })

    let html: string
    if (type === 'minutes') {
      html = buildMinutesHtml(townName, data.meeting as Parameters<typeof buildMinutesHtml>[1])
    } else {
      html = buildAgendaHtml(
        townName,
        data.meeting,
        data.agenda as Array<{ n: number; title: string; detail?: string }>,
        postedDate,
      )
    }

    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  } catch (error) {
    console.error('print route error:', error)
    return new Response('Failed to generate print view', { status: 500 })
  }
}
