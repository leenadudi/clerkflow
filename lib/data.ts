import type { StatusKey } from '@/components/status-pill'

export const TOWN = {
  name: 'Township of Riverside, Ohio',
  shortName: 'Riverside, OH',
  population: '1,200',
  slug: 'riverside-oh',
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
}

export const FOIA_REQUESTS: FoiaRequest[] = [
  {
    id: 'FOIA-1042',
    title: 'Police incident reports — Maple St, June 2026',
    requester: 'Dana Whitfield',
    received: 'Jun 9, 2026',
    assignedTo: 'You',
    status: 'overdue',
    daysRemaining: -2,
    summary:
      'Requesting all police incident reports filed for the 400 block of Maple Street during June 2026.',
  },
  {
    id: 'FOIA-1041',
    title: 'Zoning variance applications — Q2 2026',
    requester: 'Marcus Webb',
    received: 'Jun 12, 2026',
    assignedTo: 'Barbara Jensen',
    status: 'due-soon',
    daysRemaining: 1,
    summary:
      'All zoning variance applications submitted to the Planning Commission in the second quarter.',
  },
  {
    id: 'FOIA-1040',
    title: 'Water department billing rate history',
    requester: 'Lillian Pierce',
    received: 'Jun 13, 2026',
    assignedTo: 'Barbara Jensen',
    status: 'in-progress',
    daysRemaining: 5,
    summary:
      'Historical water utility billing rates for residential accounts from 2020 to present.',
  },
  {
    id: 'FOIA-1039',
    title: 'Council meeting minutes — May 2026',
    requester: 'Hector Alvarez',
    received: 'Jun 14, 2026',
    assignedTo: 'Unassigned',
    status: 'new',
    daysRemaining: 6,
    summary: 'Copies of all approved Town Council minutes for the month of May 2026.',
  },
  {
    id: 'FOIA-1038',
    title: 'Road salt procurement contract',
    requester: 'Susan Reyes',
    received: 'Jun 2, 2026',
    assignedTo: 'Barbara Jensen',
    status: 'complete',
    daysRemaining: 0,
    summary:
      'The current contract and bid documents for winter road salt procurement.',
  },
]

export type Meeting = {
  id: string
  title: string
  body: string
  date: string
  time: string
  location: string
  status: StatusKey
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
  },
  {
    id: 'mtg-061126',
    title: 'Planning Commission',
    body: 'Planning Commission',
    date: 'Jun 11, 2026',
    time: '6:30 PM',
    location: 'Town Hall, Conference Room B',
    status: 'published',
  },
  {
    id: 'mtg-060426',
    title: 'Regular Council Meeting',
    body: 'Town Council',
    date: 'Jun 4, 2026',
    time: '7:00 PM',
    location: 'Town Hall, Main Chamber',
    status: 'published',
  },
  {
    id: 'mtg-062526',
    title: 'Parks & Recreation Board',
    body: 'Parks & Recreation Board',
    date: 'Jun 25, 2026',
    time: '5:30 PM',
    location: 'Community Center',
    status: 'draft',
  },
]

export type AgendaItem = {
  n: number
  title: string
  detail: string
}

export const AGENDA: AgendaItem[] = [
  { n: 1, title: 'Call to order & roll call', detail: 'Presiding: Mayor R. Coleman' },
  { n: 2, title: 'Approval of minutes — June 4, 2026', detail: 'Action item' },
  { n: 3, title: 'Public comment period', detail: '3 minutes per speaker' },
  {
    n: 4,
    title: 'Resolution 2026-14: Maple Street paving contract',
    detail: 'Discussion & vote',
  },
  {
    n: 5,
    title: 'Ordinance 2026-08: Updated noise ordinance',
    detail: 'First reading',
  },
  {
    n: 6,
    title: 'Treasurer report — May 2026',
    detail: 'Informational',
  },
  { n: 7, title: 'Old business', detail: 'Sidewalk repair grant update' },
  { n: 8, title: 'New business', detail: 'Fall festival permit request' },
  { n: 9, title: 'Adjournment', detail: '' },
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
