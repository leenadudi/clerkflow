import type { DocType, ImportRecord } from './types'

// ── Document type detection from raw text ────────────────────────────────────

const TYPE_SIGNALS: Record<DocType, string[]> = {
  board_roster: [
    'board of', 'commission', 'committee', 'seat', 'term expires', 'term end',
    'appointment', 'appointee', 'member', 'expiration', 'planning commission',
    'board of zoning', 'parks', 'historical', 'roster',
  ],
  meeting_list: [
    'agenda', 'minutes', 'regular meeting', 'special meeting', 'workshop',
    'town council', 'city council', 'planning board', 'board meeting',
    'call to order', 'adjournment', 'public hearing',
  ],
  foia_log: [
    'foia', 'public records', 'records request', 'open records', 'kora',
    'requester', 'requestor', 'records release', 'response due', 'statutory deadline',
  ],
  license_log: [
    'business license', 'burn permit', 'garage sale', 'alcohol license',
    'vendor permit', 'event permit', 'permit application', 'license application',
    'applicant', 'fee paid', 'license number',
  ],
  unknown: [],
}

export function detectDocTypeFromText(text: string): { docType: DocType; confidence: number } {
  const lower = text.toLowerCase()
  const scores: Record<DocType, number> = {
    board_roster: 0, meeting_list: 0, foia_log: 0, license_log: 0, unknown: 0,
  }

  for (const [type, signals] of Object.entries(TYPE_SIGNALS) as [DocType, string[]][]) {
    if (type === 'unknown') continue
    for (const signal of signals) {
      if (lower.includes(signal)) scores[type]++
    }
  }

  const entries = Object.entries(scores).filter(([t]) => t !== 'unknown') as [DocType, number][]
  const [best] = entries.sort((a, b) => b[1] - a[1])

  if (!best || best[1] === 0) return { docType: 'unknown', confidence: 0 }

  const total = entries.reduce((s, [, n]) => s + n, 0)
  const confidence = Math.min(best[1] / Math.max(total, 1), 1) * (best[1] >= 3 ? 1 : 0.6)

  return { docType: best[0], confidence }
}

// ── Per-type record extraction from raw text ─────────────────────────────────

const DATE_RE = /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\w+ \d{1,2},? \d{4}|\d{4}-\d{2}-\d{2})\b/g

function findDates(text: string) {
  return [...text.matchAll(DATE_RE)].map((m) => m[0])
}

export function extractBoardRosterFromText(text: string): ImportRecord[] {
  const records: ImportRecord[] = []
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)

  const BOARD_NAMES = [
    'Planning Commission', 'Board of Zoning Appeals', 'Parks & Recreation',
    'Historical', 'Board of Health', 'Cemetery Board', 'Town Council',
  ]

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const dates = findDates(line)
    const boardMatch = BOARD_NAMES.find((b) => line.toLowerCase().includes(b.toLowerCase()))

    // Heuristic: line has a person-like name (2+ capitalized words) + a date
    const nameMatch = line.match(/^([A-Z][a-z]+ (?:[A-Z][a-z]+ )?[A-Z][a-z]+)/)
    if (nameMatch && dates.length > 0) {
      records.push({
        memberName: nameMatch[1],
        boardName: boardMatch ?? '',
        seat: '',
        expiresAt: dates[0],
      })
    }
  }

  return records
}

export function extractMeetingsFromText(text: string): ImportRecord[] {
  const records: ImportRecord[] = []
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)

  const MEETING_TYPES = [
    'Regular Meeting', 'Special Meeting', 'Workshop', 'Public Hearing',
    'Town Council', 'Planning Board', 'Zoning Board',
  ]

  for (const line of lines) {
    const typeMatch = MEETING_TYPES.find((t) => line.toLowerCase().includes(t.toLowerCase()))
    const dates = findDates(line)
    const timeMatch = line.match(/\b(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm))\b/)

    if (typeMatch && dates.length > 0) {
      records.push({
        title: typeMatch,
        startsAt: `${dates[0]}${timeMatch ? ` ${timeMatch[1]}` : ''}`,
        location: '',
        status: 'draft',
        body: typeMatch,
      })
    }
  }

  return records
}

export function extractFoiaFromText(text: string): ImportRecord[] {
  const records: ImportRecord[] = []
  const blocks = text.split(/\n{2,}/)

  const FOIA_ID_RE = /FOIA[-\s]?(\d{3,6})/i

  for (const block of blocks) {
    const idMatch = block.match(FOIA_ID_RE)
    const dates = findDates(block)
    const emailMatch = block.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i)
    // Name: line after "Requester:" or "From:"
    const nameMatch = block.match(/(?:requester|requestor|from)[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)/i)

    if (idMatch || nameMatch) {
      records.push({
        foiaId: idMatch ? `FOIA-${idMatch[1]}` : undefined,
        requesterName: nameMatch ? nameMatch[1] : '',
        requesterEmail: emailMatch ? emailMatch[0] : undefined,
        summary: block.slice(0, 200).replace(/\s+/g, ' ').trim(),
        receivedAt: dates[0],
        deadlineAt: dates[1],
        foiaStatus: 'new',
      })
    }
  }

  return records
}

export function extractLicensesFromText(text: string): ImportRecord[] {
  const records: ImportRecord[] = []
  const blocks = text.split(/\n{2,}/)

  const LICENSE_TYPES = ['Business License', 'Burn Permit', 'Garage Sale', 'Alcohol License', 'Vendor Permit', 'Event Permit']

  for (const block of blocks) {
    const typeMatch = LICENSE_TYPES.find((t) => block.toLowerCase().includes(t.toLowerCase()))
    const dates = findDates(block)
    const emailMatch = block.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i)
    const feeMatch = block.match(/\$[\d,]+(?:\.\d{2})?/)

    if (typeMatch) {
      records.push({
        licenseType: typeMatch.toLowerCase().replace(/ /g, '_'),
        applicantName: '',
        applicantEmail: emailMatch ? emailMatch[0] : undefined,
        description: block.slice(0, 200).replace(/\s+/g, ' ').trim(),
        licenseStatus: 'pending',
        submittedAt: dates[0],
        fee: feeMatch ? feeMatch[0] : undefined,
      })
    }
  }

  return records
}

export function extractRecordsFromText(text: string, docType: DocType): ImportRecord[] {
  if (docType === 'board_roster') return extractBoardRosterFromText(text)
  if (docType === 'meeting_list') return extractMeetingsFromText(text)
  if (docType === 'foia_log') return extractFoiaFromText(text)
  if (docType === 'license_log') return extractLicensesFromText(text)
  return []
}
