export type DocType =
  | 'board_roster'
  | 'meeting_list'
  | 'foia_log'
  | 'license_log'
  | 'unknown'

export type ImportRecord = {
  // board_roster
  memberName?: string
  boardName?: string
  seat?: string
  expiresAt?: string
  // meeting_list
  title?: string
  startsAt?: string
  location?: string
  status?: string
  body?: string
  // foia_log
  foiaId?: string
  requesterName?: string
  requesterEmail?: string
  summary?: string
  receivedAt?: string
  deadlineAt?: string
  foiaStatus?: string
  // license_log
  licenseType?: string
  applicantName?: string
  applicantEmail?: string
  applicantPhone?: string
  description?: string
  licenseStatus?: string
  submittedAt?: string
  fee?: string
}

export type ParseResult = {
  docType: DocType
  confidence: number          // 0–1
  records: ImportRecord[]
  warnings: string[]
  rawText?: string
  needsAI: boolean            // true when confidence < 0.5
}
