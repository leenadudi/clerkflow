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
  member: string
  board: string
  seat: string
  expires: string
  expiringSoon: boolean
}

export const BOARD_TERMS: BoardTerm[] = [
  {
    member: 'Eleanor Pratt',
    board: 'Planning Commission',
    seat: 'Seat 2',
    expires: 'Jul 1, 2026',
    expiringSoon: true,
  },
  {
    member: 'Gregory Nunn',
    board: 'Board of Zoning Appeals',
    seat: 'Seat 4',
    expires: 'Aug 15, 2026',
    expiringSoon: true,
  },
  {
    member: 'Priya Anand',
    board: 'Parks & Recreation Board',
    seat: 'Chair',
    expires: 'Dec 31, 2026',
    expiringSoon: false,
  },
]
