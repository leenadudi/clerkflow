import { streamText, tool, stepCountIs, convertToModelMessages } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { z } from 'zod'
import { requireStaffUser } from '@/lib/auth/app'
import {
  listFoiaRequests,
  listMeetings,
  listLicenses,
  updateFoiaStatus,
  createMeeting,
  publishMeeting,
  updateLicenseStatus,
  createFoiaRequest,
} from '@/lib/server/data'

export const runtime = 'nodejs'
export const maxDuration = 60

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY,
})

export async function POST(request: Request) {
  const context = await requireStaffUser()
  const body = await request.json()
  const { messages } = body
  console.log('[chat] received messages count:', messages?.length, 'first role:', messages?.[0]?.role)

  const townName = context.town?.name ?? 'your town'
  const clerkName = context.user?.name ?? 'Clerk'
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const systemPrompt = `You are a helpful assistant for ${clerkName}, the town clerk of ${townName}. Today is ${today}.

You help clerks manage their daily work: checking FOIA/public records requests, creating meetings, approving permits, and more.

IMPORTANT CONFIRMATION RULE: Before calling any write tool (updateRequestStatus, createMeeting, publishMeeting, approveDenyPermit, logNewRequest), you MUST first describe what you are about to do in plain English and ask the clerk to confirm by typing "yes". Only call the write tool after receiving explicit confirmation. Read-only tools (listOverdueRequests, getUpcomingMeetings, getPendingPermits, searchRecords) can be called immediately without confirmation.

When you perform a write action, summarise what changed in one sentence after the tool returns.

Be concise and professional. Use plain English. Refer to public records requests as "FOIA requests" or just "requests".`

  const modelMessages = await convertToModelMessages(messages)
  console.log('[chat] converted to', modelMessages.length, 'model messages')

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: systemPrompt,
    messages: modelMessages,
    stopWhen: stepCountIs(8),
    onError: (err) => {
      console.error('[chat] streamText error:', err)
    },
    tools: {
      listOverdueRequests: tool({
        description: 'List all overdue public records/FOIA requests for this town.',
        inputSchema: z.object({}),
        execute: async () => {
          const all = await listFoiaRequests()
          const overdue = all.filter((r) => r.status === 'overdue' || r.daysRemaining < 0)
          return {
            count: overdue.length,
            requests: overdue.map((r) => ({
              id: r.id,
              requester: r.requester,
              daysOverdue: r.daysRemaining < 0 ? Math.abs(r.daysRemaining) : 0,
              href: `/app/records/${r.id}`,
            })),
          }
        },
      }),

      getUpcomingMeetings: tool({
        description: 'List meetings scheduled in the next 7 days.',
        inputSchema: z.object({}),
        execute: async () => {
          const all = await listMeetings()
          const upcoming = all.filter(
            (m) => m.status === 'scheduled' || m.status === 'draft' || m.status === 'published',
          ).slice(0, 10)
          return {
            count: upcoming.length,
            meetings: upcoming.map((m) => ({
              id: m.id,
              title: m.title,
              date: m.date,
              time: m.time,
              status: m.status,
              href: `/app/meetings/${m.id}`,
            })),
          }
        },
      }),

      getPendingPermits: tool({
        description: 'List all pending permit and licence applications.',
        inputSchema: z.object({}),
        execute: async () => {
          const all = await listLicenses()
          const pending = all.filter((l) => l.status === 'pending')
          return {
            count: pending.length,
            permits: pending.map((l) => ({
              id: l.id,
              applicant: l.applicantName,
              type: l.type.replace(/_/g, ' '),
              submitted: l.submittedAt,
              href: `/app/services/${l.id}`,
            })),
          }
        },
      }),

      searchRecords: tool({
        description: 'Search across FOIA requests, meetings, and permits by name or keyword.',
        inputSchema: z.object({
          query: z.string().describe('Search term'),
        }),
        execute: async ({ query }: { query: string }) => {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/app/search?q=${encodeURIComponent(query)}`,
            { headers: { Cookie: request.headers.get('cookie') ?? '' } },
          )
          if (!res.ok) return { results: [] }
          return res.json()
        },
      }),

      updateRequestStatus: tool({
        description: 'Update the status of a FOIA / public records request. Only call after the clerk confirms.',
        inputSchema: z.object({
          publicId: z.string().describe('The request ID, e.g. FOIA-2026-0001'),
          status: z.enum(['new', 'in_progress', 'complete', 'denied']).describe('New status'),
          note: z.string().optional().describe('Optional note about the status change'),
        }),
        execute: async ({ publicId, status }: { publicId: string; status: 'new' | 'in_progress' | 'complete' | 'denied'; note?: string }) => {
          const ok = await updateFoiaStatus(publicId, status)
          return {
            ok,
            summary: ok
              ? `${publicId} status updated to ${status.replace('_', ' ')}.`
              : `Could not find request ${publicId}.`,
            href: `/app/records/${publicId}`,
          }
        },
      }),

      createMeeting: tool({
        description: 'Create a new meeting. Only call after the clerk confirms.',
        inputSchema: z.object({
          title: z.string().describe('Meeting title, e.g. "Town Council — Regular Meeting"'),
          date: z.string().describe('Date in YYYY-MM-DD format'),
          time: z.string().describe('Time in HH:MM 24h format'),
          location: z.string().describe('Meeting location'),
          meetingType: z.enum(['council', 'planning', 'zoning', 'board', 'special', 'workshop']).default('council'),
        }),
        execute: async ({ title, date, time, location, meetingType }: { title: string; date: string; time: string; location: string; meetingType: 'council' | 'planning' | 'zoning' | 'board' | 'special' | 'workshop' }) => {
          const startsAt = new Date(`${date}T${time}:00`)
          const meeting = await createMeeting({
            title,
            body: '',
            startsAt,
            location,
            meetingType,
            status: 'draft',
          })
          return {
            ok: true,
            summary: `Meeting "${title}" created for ${date} at ${time}.`,
            href: `/app/meetings/${meeting.id}`,
            meetingId: meeting.id,
          }
        },
      }),

      publishMeeting: tool({
        description: 'Publish a meeting so it appears on the public resident hub. Only call after the clerk confirms.',
        inputSchema: z.object({
          meetingId: z.string().describe('The meeting ID (externalId), e.g. mtg-061526'),
        }),
        execute: async ({ meetingId }: { meetingId: string }) => {
          await publishMeeting(meetingId)
          return {
            ok: true,
            summary: `Meeting ${meetingId} published to the resident hub.`,
            href: `/app/meetings/${meetingId}`,
          }
        },
      }),

      approveDenyPermit: tool({
        description: 'Approve or deny a permit/licence application. Only call after the clerk confirms.',
        inputSchema: z.object({
          publicId: z.string().describe('The permit ID, e.g. LIC-001'),
          decision: z.enum(['approved', 'denied']).describe('Decision'),
        }),
        execute: async ({ publicId, decision }: { publicId: string; decision: 'approved' | 'denied' }) => {
          const updated = await updateLicenseStatus(publicId, decision)
          return {
            ok: Boolean(updated),
            summary: updated
              ? `${publicId} has been ${decision}.`
              : `Could not find permit ${publicId}.`,
            href: `/app/services/${publicId}`,
          }
        },
      }),

      logNewRequest: tool({
        description: 'Log a new FOIA / public records request on behalf of a requester. Only call after the clerk confirms.',
        inputSchema: z.object({
          requesterName: z.string(),
          requesterEmail: z.string().optional(),
          summary: z.string().describe('Description of what the requester is asking for'),
        }),
        execute: async ({ requesterName, requesterEmail, summary }: { requesterName: string; requesterEmail?: string; summary: string }) => {
          const req = await createFoiaRequest({
            title: summary.slice(0, 80),
            requesterName,
            requesterEmail,
            summary,
            source: 'walk-in',
          })
          return {
            ok: true,
            summary: `Request ${req.id} logged for ${requesterName}.`,
            href: `/app/records/${req.id}`,
            requestId: req.id,
          }
        },
      }),
    },
  })

  return result.toUIMessageStreamResponse({
    onError: (error: unknown) => {
      const msg = error instanceof Error ? error.message : String(error)
      console.error('[chat] stream error sent to client:', msg)
      return msg
    },
  })
}
