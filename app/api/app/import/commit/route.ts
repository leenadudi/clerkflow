import { NextRequest, NextResponse } from 'next/server'
import { requireStaffUser } from '@/lib/auth/app'
import { createBoardTerm, createMeeting, createFoiaRequest, createLicense } from '@/lib/server/data'
import type { ImportRecord, DocType } from '@/lib/import/types'

export async function POST(request: NextRequest) {
  try {
    await requireStaffUser()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json() as { docType: DocType; records: ImportRecord[] }
  const { docType, records } = body

  if (!docType || !Array.isArray(records) || records.length === 0) {
    return NextResponse.json({ error: 'Missing docType or records' }, { status: 400 })
  }

  const results = { created: 0, failed: 0, errors: [] as string[] }

  for (const record of records) {
    try {
      if (docType === 'board_roster') {
        if (!record.memberName || !record.boardName) {
          results.failed++
          results.errors.push(`Skipped row: missing member name or board name`)
          continue
        }
        const expiresAt = record.expiresAt ? new Date(record.expiresAt) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        if (isNaN(expiresAt.getTime())) {
          results.failed++
          results.errors.push(`Skipped "${record.memberName}": invalid expiration date "${record.expiresAt}"`)
          continue
        }
        await createBoardTerm({
          memberName: record.memberName,
          boardName: record.boardName,
          seat: record.seat || 'Member',
          expiresAt,
        })
        results.created++
      }

      else if (docType === 'meeting_list') {
        if (!record.title || !record.startsAt) {
          results.failed++
          results.errors.push(`Skipped row: missing title or date`)
          continue
        }
        const startsAt = new Date(record.startsAt)
        if (isNaN(startsAt.getTime())) {
          results.failed++
          results.errors.push(`Skipped "${record.title}": invalid date "${record.startsAt}"`)
          continue
        }
        await createMeeting({
          title: record.title,
          body: record.body || 'Town Council',
          startsAt,
          location: record.location || 'Town Hall',
          status: (record.status as 'draft' | 'published') || 'draft',
        })
        results.created++
      }

      else if (docType === 'foia_log') {
        if (!record.requesterName || !record.summary) {
          results.failed++
          results.errors.push(`Skipped row: missing requester name or summary`)
          continue
        }
        await createFoiaRequest({
          title: record.foiaId ? `${record.foiaId} — ${record.summary.slice(0, 60)}` : record.summary.slice(0, 80),
          requesterName: record.requesterName,
          requesterEmail: record.requesterEmail,
          summary: record.summary,
        })
        results.created++
      }

      else if (docType === 'license_log') {
        if (!record.applicantName || !record.licenseType) {
          results.failed++
          results.errors.push(`Skipped row: missing applicant name or license type`)
          continue
        }
        await createLicense({
          type: record.licenseType,
          applicantName: record.applicantName,
          applicantEmail: record.applicantEmail,
          applicantPhone: record.applicantPhone,
          description: record.description,
        })
        results.created++
      }
    } catch (err) {
      results.failed++
      results.errors.push(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  return NextResponse.json(results)
}
