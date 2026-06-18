import type { DocType, ImportRecord } from './types'

// Aliases for each field — lowercase, trimmed for matching
const ALIASES: Record<string, string[]> = {
  // board roster
  memberName:    ['name', 'member name', 'member', 'full name', 'person', 'appointee'],
  boardName:     ['board', 'board name', 'commission', 'committee', 'body', 'department'],
  seat:          ['seat', 'seat no', 'seat number', 'role', 'position', 'title', 'office'],
  expiresAt:     ['expires', 'expiration', 'term end', 'term expires', 'end date', 'term expiration', 'expiry'],
  // meeting
  title:         ['title', 'meeting', 'meeting name', 'meeting title', 'subject', 'description', 'name'],
  startsAt:      ['date', 'start date', 'meeting date', 'starts at', 'datetime', 'date/time', 'scheduled'],
  location:      ['location', 'place', 'venue', 'room', 'address', 'where'],
  status:        ['status', 'state', 'published', 'draft'],
  body:          ['body', 'type', 'meeting type', 'kind'],
  // foia
  foiaId:        ['id', 'foia id', 'request id', 'request number', 'confirmation', 'ref', 'reference'],
  requesterName: ['requester', 'requester name', 'requestor', 'requestor name', 'submitted by', 'applicant', 'from'],
  requesterEmail:['email', 'requester email', 'requestor email', 'contact email'],
  summary:       ['summary', 'description', 'request', 'details', 'what was requested', 'request description'],
  receivedAt:    ['received', 'received date', 'submitted', 'submitted date', 'date received', 'date submitted'],
  deadlineAt:    ['deadline', 'due date', 'due', 'response due', 'response deadline'],
  foiaStatus:    ['status', 'state', 'disposition'],
  // license
  licenseType:   ['type', 'license type', 'permit type', 'kind', 'category'],
  applicantName: ['applicant', 'applicant name', 'business', 'business name', 'owner', 'name'],
  applicantEmail:['email', 'applicant email', 'contact email'],
  applicantPhone:['phone', 'applicant phone', 'contact phone', 'telephone', 'tel'],
  description:   ['description', 'details', 'notes', 'comments'],
  licenseStatus: ['status', 'state', 'disposition'],
  submittedAt:   ['submitted', 'submitted date', 'date submitted', 'application date', 'received'],
  fee:           ['fee', 'amount', 'cost', 'price', 'charge'],
}

function normalize(s: string) {
  return s.toLowerCase().trim().replace(/[_\-]/g, ' ')
}

// Detect which doc type based on which field groups have the most column matches
const DOC_TYPE_FIELDS: Record<DocType, string[]> = {
  board_roster:  ['memberName', 'boardName', 'seat', 'expiresAt'],
  meeting_list:  ['title', 'startsAt', 'location'],
  foia_log:      ['requesterName', 'summary', 'receivedAt', 'foiaStatus'],
  license_log:   ['licenseType', 'applicantName', 'submittedAt', 'licenseStatus'],
  unknown:       [],
}

export function detectDocTypeFromHeaders(headers: string[]): { docType: DocType; confidence: number; fieldMap: Record<string, string> } {
  const fieldMap: Record<string, string> = {}

  for (const header of headers) {
    const norm = normalize(header)
    for (const [field, aliases] of Object.entries(ALIASES)) {
      if (aliases.some((a) => norm === a || norm.includes(a))) {
        if (!fieldMap[field]) fieldMap[field] = header
        break
      }
    }
  }

  let bestType: DocType = 'unknown'
  let bestScore = 0

  for (const [docType, fields] of Object.entries(DOC_TYPE_FIELDS) as [DocType, string[]][]) {
    if (docType === 'unknown') continue
    const matched = fields.filter((f) => fieldMap[f]).length
    const score = matched / fields.length
    if (score > bestScore) {
      bestScore = score
      bestType = docType
    }
  }

  return { docType: bestType, confidence: bestScore, fieldMap }
}

export function mapRow(row: Record<string, string>, fieldMap: Record<string, string>, docType: DocType): ImportRecord {
  const get = (field: string) => {
    const header = fieldMap[field]
    return header ? (row[header] ?? '').trim() : ''
  }

  if (docType === 'board_roster') {
    return {
      memberName: get('memberName'),
      boardName: get('boardName'),
      seat: get('seat'),
      expiresAt: get('expiresAt'),
    }
  }
  if (docType === 'meeting_list') {
    return {
      title: get('title'),
      startsAt: get('startsAt'),
      location: get('location'),
      status: get('status') || 'draft',
      body: get('body') || 'Town Council',
    }
  }
  if (docType === 'foia_log') {
    return {
      foiaId: get('foiaId'),
      requesterName: get('requesterName'),
      requesterEmail: get('requesterEmail'),
      summary: get('summary'),
      receivedAt: get('receivedAt'),
      deadlineAt: get('deadlineAt'),
      foiaStatus: get('foiaStatus') || 'new',
    }
  }
  if (docType === 'license_log') {
    return {
      licenseType: get('licenseType'),
      applicantName: get('applicantName'),
      applicantEmail: get('applicantEmail'),
      applicantPhone: get('applicantPhone'),
      description: get('description'),
      licenseStatus: get('licenseStatus') || 'pending',
      submittedAt: get('submittedAt'),
      fee: get('fee'),
    }
  }
  return {}
}
