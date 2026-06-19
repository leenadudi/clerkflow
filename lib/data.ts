import type { StatusKey } from '@/components/status-pill'

export const TOWN = {
  name: 'Township of Riverside, Ohio',
  shortName: 'Riverside, OH',
  population: '1,200',
  slug: 'riverside-oh',
  residentHubEnabled: true,
  state: 'OH',
  clerk: {
    name: 'Barbara Jensen',
    role: 'Town Clerk',
    initials: 'BJ',
  },
}

export type FoiaRequest = {
  id: string
  title: string
  requester: string
  received: string
  assignedTo: string
  status: StatusKey
  daysRemaining: number
  summary: string
  // Extended fields
  source?: string
  requesterPhone?: string
  requesterAddress?: string
  requesterOrg?: string
  isAnonymous?: boolean
  formatRequested?: string
  deliveryMethod?: string
  priority?: string
  internalNotes?: string
  dateRangeFrom?: string
  dateRangeTo?: string
  fulfilledAt?: string
  deniedAt?: string
  denialReason?: string
  ackSentAt?: string
}

export const FOIA_REQUESTS: FoiaRequest[] = [
  {
    id: 'FOIA-2026-1042',
    title: 'Police incident reports — Maple St, June 2026',
    requester: 'Dana Whitfield',
    received: 'Jun 9, 2026',
    assignedTo: 'You',
    status: 'overdue',
    daysRemaining: -4,
    summary:
      'Requesting all police incident reports filed for the 400 block of Maple Street during June 2026.',
    source: 'email',
    requesterPhone: '(740) 555-0194',
    requesterAddress: '412 Maple St, Riverside, OH 45431',
    requesterOrg: undefined,
    isAnonymous: false,
    formatRequested: 'digital',
    deliveryMethod: 'email',
    priority: 'normal',
    internalNotes: 'Requester followed up by phone on Jun 12.',
    dateRangeFrom: 'Jun 1, 2026',
    dateRangeTo: 'Jun 9, 2026',
    fulfilledAt: undefined,
    deniedAt: undefined,
    denialReason: undefined,
    ackSentAt: 'Jun 9, 2026',
  },
  {
    id: 'FOIA-2026-1041',
    title: 'Zoning variance applications — Q2 2026',
    requester: 'Marcus Webb',
    received: 'Jun 15, 2026',
    assignedTo: 'Barbara Jensen',
    status: 'due-soon',
    daysRemaining: 2,
    summary:
      'All zoning variance applications submitted to the Planning Commission in the second quarter.',
    source: 'online',
    requesterPhone: undefined,
    requesterAddress: '77 Elm Court, Riverside, OH 45431',
    requesterOrg: 'Webb Land Consulting',
    isAnonymous: false,
    formatRequested: 'paper',
    deliveryMethod: 'mail',
    priority: 'normal',
    internalNotes: 'Planning dept confirmed 3 variance applications exist for Q2.',
    dateRangeFrom: 'Apr 1, 2026',
    dateRangeTo: 'Jun 30, 2026',
    fulfilledAt: undefined,
    deniedAt: undefined,
    denialReason: undefined,
    ackSentAt: 'Jun 15, 2026',
  },
  {
    id: 'FOIA-2026-1040',
    title: 'Water department billing rate history',
    requester: 'Lillian Pierce',
    received: 'Jun 13, 2026',
    assignedTo: 'Barbara Jensen',
    status: 'in-progress',
    daysRemaining: 5,
    summary:
      'Historical water utility billing rates for residential accounts from 2020 to present.',
    source: 'in-person',
    requesterPhone: '(740) 555-0217',
    requesterAddress: '205 River Rd, Riverside, OH 45431',
    requesterOrg: undefined,
    isAnonymous: false,
    formatRequested: 'digital',
    deliveryMethod: 'email',
    priority: 'normal',
    internalNotes: 'Forwarded to Public Works on Jun 14. Awaiting rate schedule documents.',
    dateRangeFrom: 'Jan 1, 2020',
    dateRangeTo: 'Jun 13, 2026',
    fulfilledAt: undefined,
    deniedAt: undefined,
    denialReason: undefined,
    ackSentAt: 'Jun 13, 2026',
  },
  {
    id: 'FOIA-2026-1039',
    title: 'Council meeting minutes — May 2026',
    requester: 'Hector Alvarez',
    received: 'Jun 17, 2026',
    assignedTo: 'Unassigned',
    status: 'new',
    daysRemaining: 7,
    summary: 'Copies of all approved Town Council minutes for the month of May 2026.',
    source: 'email',
    requesterPhone: undefined,
    requesterAddress: undefined,
    requesterOrg: 'Riverside Community Watch',
    isAnonymous: false,
    formatRequested: 'digital',
    deliveryMethod: 'email',
    priority: 'normal',
    internalNotes: undefined,
    dateRangeFrom: 'May 1, 2026',
    dateRangeTo: 'May 31, 2026',
    fulfilledAt: undefined,
    deniedAt: undefined,
    denialReason: undefined,
    ackSentAt: undefined,
  },
  {
    id: 'FOIA-2026-1038',
    title: 'Road salt procurement contract',
    requester: 'Susan Reyes',
    received: 'Jun 2, 2026',
    assignedTo: 'Barbara Jensen',
    status: 'complete',
    daysRemaining: 0,
    summary:
      'The current contract and bid documents for winter road salt procurement.',
    source: 'mail',
    requesterPhone: '(740) 555-0308',
    requesterAddress: '900 Park Ave, Riverside, OH 45431',
    requesterOrg: undefined,
    isAnonymous: false,
    formatRequested: 'paper',
    deliveryMethod: 'mail',
    priority: 'normal',
    internalNotes: 'Contract located in finance archives. Mailed certified copy Jun 6.',
    dateRangeFrom: undefined,
    dateRangeTo: undefined,
    fulfilledAt: 'Jun 6, 2026',
    deniedAt: undefined,
    denialReason: undefined,
    ackSentAt: 'Jun 2, 2026',
  },
]

export type MeetingAttendance = {
  id: string
  name: string
  role: string
  boardName: string
  status: 'present' | 'absent' | 'excused' | 'late' | 'early'
  arrivedAt?: string
  leftAt?: string
  isGuest: boolean
  sortOrder: number
}

export const ATTENDANCE: MeetingAttendance[] = [
  { id: 'att-1', name: 'Mayor R. Coleman', role: 'Mayor', boardName: 'Town Council', status: 'present', isGuest: false, sortOrder: 0 },
  { id: 'att-2', name: 'Councilmember Davis', role: 'Councilmember', boardName: 'Town Council', status: 'present', isGuest: false, sortOrder: 1 },
  { id: 'att-3', name: 'Councilmember Park', role: 'Councilmember', boardName: 'Town Council', status: 'present', isGuest: false, sortOrder: 2 },
  { id: 'att-4', name: 'Councilmember Nguyen', role: 'Councilmember', boardName: 'Town Council', status: 'absent', isGuest: false, sortOrder: 3 },
  { id: 'att-5', name: 'Councilmember Wilson', role: 'Councilmember', boardName: 'Town Council', status: 'present', isGuest: false, sortOrder: 4 },
  { id: 'att-6', name: 'Barbara Jensen', role: 'Town Clerk', boardName: '', status: 'present', isGuest: false, sortOrder: 5 },
]

export type Meeting = {
  id: string
  title: string
  body: string
  date: string
  time: string
  location: string
  status: StatusKey
  minutesStatus: string
  meetingType: string
  agendaPublishedAt?: string
  minutesDraft?: string
  transcript?: string
  transcriptSource?: string
  presidingOfficer: string
  isPast: boolean
}

export const MEETINGS: Meeting[] = [
  {
    id: 'mtg-061826',
    title: 'Regular Council Meeting',
    body: 'Town Council',
    date: 'Jun 18, 2026',
    time: '7:00 PM',
    location: 'Town Hall, Main Chamber',
    status: 'scheduled',
    minutesStatus: 'not_started',
    meetingType: 'council',
    presidingOfficer: 'Mayor R. Coleman',
    isPast: false,
  },
  {
    id: 'mtg-061126',
    title: 'Planning Commission',
    body: 'Planning Commission',
    date: 'Jun 11, 2026',
    time: '6:30 PM',
    location: 'Town Hall, Conference Room B',
    status: 'published',
    minutesStatus: 'draft',
    meetingType: 'planning',
    presidingOfficer: '',
    isPast: true,
    agendaPublishedAt: 'Jun 9, 2026',
  },
  {
    id: 'mtg-060426',
    title: 'Regular Council Meeting',
    body: 'Town Council',
    date: 'Jun 4, 2026',
    time: '7:00 PM',
    location: 'Town Hall, Main Chamber',
    status: 'published',
    minutesStatus: 'not_started',
    meetingType: 'council',
    presidingOfficer: 'Mayor R. Coleman',
    isPast: true,
    agendaPublishedAt: 'Jun 1, 2026',
  },
  {
    id: 'mtg-062526',
    title: 'Parks & Recreation Board',
    body: 'Parks & Recreation Board',
    date: 'Jun 25, 2026',
    time: '5:30 PM',
    location: 'Community Center',
    status: 'draft',
    minutesStatus: 'not_started',
    meetingType: 'board',
    presidingOfficer: '',
    isPast: false,
  },
]

export type AgendaItem = {
  n: number
  title: string
  detail: string
  notes: string
}

export const AGENDA: AgendaItem[] = [
  { n: 1, title: 'Call to order & roll call', detail: 'Presiding: Mayor R. Coleman', notes: '' },
  { n: 2, title: 'Approval of minutes — June 4, 2026', detail: 'Action item', notes: '' },
  { n: 3, title: 'Public comment period', detail: '3 minutes per speaker', notes: '' },
  {
    n: 4,
    title: 'Resolution 2026-14: Maple Street paving contract',
    detail: 'Discussion & vote',
    notes: '',
  },
  {
    n: 5,
    title: 'Ordinance 2026-08: Updated noise ordinance',
    detail: 'First reading',
    notes: '',
  },
  {
    n: 6,
    title: 'Treasurer report — May 2026',
    detail: 'Informational',
    notes: '',
  },
  { n: 7, title: 'Old business', detail: 'Sidewalk repair grant update', notes: '' },
  { n: 8, title: 'New business', detail: 'Fall festival permit request', notes: '' },
  { n: 9, title: 'Adjournment', detail: '', notes: '' },
]

export type Motion = {
  id: string
  agendaItemId?: string
  description: string
  movedBy: string
  secondedBy: string
  voteYes: number
  voteNo: number
  voteAbstain: number
  outcome: 'passed' | 'failed' | 'tabled' | 'pending'
  sortOrder: number
}

export const MOTIONS: Motion[] = [
  {
    id: 'motion-1',
    description: 'Approve Maple Street paving contract with Riverside Paving Co. for $47,200',
    movedBy: 'Councilmember Davis',
    secondedBy: 'Councilmember Park',
    voteYes: 4,
    voteNo: 1,
    voteAbstain: 0,
    outcome: 'passed',
    sortOrder: 0,
  },
]

export type MeetingActionItem = {
  id: string
  title: string
  assignedTo: string
  dueDate: string
  done: boolean
  sortOrder: number
}

export const ACTION_ITEMS: MeetingActionItem[] = [
  {
    id: 'ai-1',
    title: 'Send signed paving contract to Riverside Paving Co.',
    assignedTo: 'Town Clerk',
    dueDate: 'Jun 25, 2026',
    done: false,
    sortOrder: 0,
  },
  {
    id: 'ai-2',
    title: 'Publish updated noise ordinance for public comment period',
    assignedTo: 'Town Clerk',
    dueDate: 'Jun 25, 2026',
    done: false,
    sortOrder: 1,
  },
]

export type BoardTerm = {
  id: string
  member: string
  board: string
  seat: string
  expires: string
  expiringSoon: boolean
}

export const BOARD_TERMS: BoardTerm[] = [
  {
    id: 'demo-1',
    member: 'Eleanor Pratt',
    board: 'Planning Commission',
    seat: 'Seat 2',
    expires: 'Jul 1, 2026',
    expiringSoon: true,
  },
  {
    id: 'demo-2',
    member: 'Gregory Nunn',
    board: 'Board of Zoning Appeals',
    seat: 'Seat 4',
    expires: 'Aug 15, 2026',
    expiringSoon: true,
  },
  {
    id: 'demo-3',
    member: 'Priya Anand',
    board: 'Parks & Recreation Board',
    seat: 'Chair',
    expires: 'Dec 31, 2026',
    expiringSoon: false,
  },
]

export const LICENSE_TYPES = [
  { value: 'business_license', label: 'Business license' },
  { value: 'burn_permit', label: 'Burn permit' },
  { value: 'garage_sale', label: 'Garage sale permit' },
  { value: 'alcohol', label: 'Alcohol license' },
  { value: 'event_permit', label: 'Event permit' },
  { value: 'vendor_permit', label: 'Vendor permit' },
] as const

export type LicenseType = (typeof LICENSE_TYPES)[number]['value']

export type License = {
  id: string
  type: LicenseType | string
  typeLabel: string
  applicantName: string
  applicantEmail?: string
  applicantPhone?: string
  description: string
  status: StatusKey
  submittedAt: string
  expiresAt?: string
  fee?: string
  feePaid: boolean
}

export const LICENSES: License[] = [
  {
    id: 'LIC-001',
    type: 'business_license',
    typeLabel: 'Business license',
    applicantName: 'Maria Santos',
    applicantEmail: 'maria@sunsetbakery.com',
    applicantPhone: '(740) 555-0183',
    description: 'Retail bakery at 142 Main St.',
    status: 'pending',
    submittedAt: 'Jun 10, 2026',
    expiresAt: 'Jun 10, 2027',
    fee: '$75.00',
    feePaid: false,
  },
  {
    id: 'LIC-002',
    type: 'burn_permit',
    typeLabel: 'Burn permit',
    applicantName: 'Dale Hooper',
    applicantEmail: 'dhooper@email.com',
    description: 'Brush and yard debris burn at 88 Oak Lane.',
    status: 'approved',
    submittedAt: 'Jun 8, 2026',
    expiresAt: 'Jun 15, 2026',
    fee: '$10.00',
    feePaid: true,
  },
  {
    id: 'LIC-003',
    type: 'garage_sale',
    typeLabel: 'Garage sale permit',
    applicantName: 'Linda Tran',
    description: '2-day garage sale at 19 Birch Ave, Jun 21–22.',
    status: 'approved',
    submittedAt: 'Jun 14, 2026',
    expiresAt: 'Jun 22, 2026',
    fee: '$5.00',
    feePaid: true,
  },
  {
    id: 'LIC-004',
    type: 'alcohol',
    typeLabel: 'Alcohol license',
    applicantName: 'Riverside Tap LLC',
    applicantEmail: 'owner@riversidetap.com',
    applicantPhone: '(740) 555-0241',
    description: 'Beer and wine service for restaurant at 301 River Rd.',
    status: 'pending',
    submittedAt: 'Jun 12, 2026',
    fee: '$250.00',
    feePaid: false,
  },
]
