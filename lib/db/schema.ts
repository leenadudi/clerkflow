import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const towns = pgTable('towns', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  shortName: text('short_name').notNull(),
  population: integer('population'),
  clerkName: text('clerk_name'),
  clerkRole: text('clerk_role').default('Town Clerk'),
  clerkInitials: text('clerk_initials'),
  clerkEmail: text('clerk_email'),
  // Max team members allowed. 1 = primary admin only. Bump manually until Stripe is wired up.
  maxMembers: integer('max_members').notNull().default(1),
  residentHubEnabled: boolean('resident_hub_enabled').notNull().default(true),
  state: text('state').notNull().default(''),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clerkUserId: text('clerk_user_id').unique(),
    email: text('email').notNull(),
    name: text('name').notNull(),
    // 'admin' | 'member' — legacy values 'town_clerk' and 'staff' are treated as admin
    role: text('role').notNull().default('member'),
    townId: uuid('town_id')
      .references(() => towns.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex('users_town_email').on(table.townId, table.email)],
)

// role: 'admin' | 'member'
export const invitations = pgTable('invitations', {
  id: uuid('id').primaryKey().defaultRandom(),
  townId: uuid('town_id')
    .references(() => towns.id, { onDelete: 'cascade' })
    .notNull(),
  email: text('email').notNull(),
  role: text('role').notNull().default('member'),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  createdById: uuid('created_by_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const foiaRequests = pgTable(
  'foia_requests',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    townId: uuid('town_id')
      .references(() => towns.id, { onDelete: 'cascade' })
      .notNull(),
    publicId: text('public_id').notNull(),
    title: text('title').notNull(),
    requesterName: text('requester_name').notNull(),
    requesterEmail: text('requester_email'),
    summary: text('summary').notNull(),
    status: text('status').notNull(),
    assignedUserId: uuid('assigned_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    receivedAt: timestamp('received_at', { withTimezone: true }).notNull(),
    deadlineAt: timestamp('deadline_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    // source: web | walk-in | mail | email | phone
    source: text('source').default('web'),
    requesterPhone: text('requester_phone'),
    requesterAddress: text('requester_address'),
    requesterOrg: text('requester_org'),
    isAnonymous: boolean('is_anonymous').default(false),
    // formatRequested: any | digital | physical | certified
    formatRequested: text('format_requested').default('any'),
    // deliveryMethod: email | pickup | mail
    deliveryMethod: text('delivery_method').default('email'),
    // priority: normal | high | expedited
    priority: text('priority').default('normal'),
    internalNotes: text('internal_notes'),
    dateRangeFrom: timestamp('date_range_from', { withTimezone: true }),
    dateRangeTo: timestamp('date_range_to', { withTimezone: true }),
    fulfilledAt: timestamp('fulfilled_at', { withTimezone: true }),
    deniedAt: timestamp('denied_at', { withTimezone: true }),
    denialReason: text('denial_reason'),
    ackSentAt: timestamp('ack_sent_at', { withTimezone: true }),
  },
  (table) => [uniqueIndex('foia_town_public_id').on(table.townId, table.publicId)],
)

export const foiaMessages = pgTable('foia_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  foiaRequestId: uuid('foia_request_id')
    .references(() => foiaRequests.id, { onDelete: 'cascade' })
    .notNull(),
  authorName: text('author_name').notNull(),
  authorRole: text('author_role').notNull(),
  body: text('body').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const foiaWorkflowSteps = pgTable('foia_workflow_steps', {
  id: uuid('id').primaryKey().defaultRandom(),
  foiaRequestId: uuid('foia_request_id')
    .references(() => foiaRequests.id, { onDelete: 'cascade' })
    .notNull(),
  label: text('label').notNull(),
  meta: text('meta').notNull(),
  state: text('state').notNull(),
  sortOrder: integer('sort_order').notNull(),
})

export const foiaDocuments = pgTable('foia_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  foiaRequestId: uuid('foia_request_id')
    .references(() => foiaRequests.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  fileUrl: text('file_url').notNull(),
  fileSize: integer('file_size'),
  mimeType: text('mime_type'),
  uploadedBy: text('uploaded_by').notNull(),
  isRedacted: boolean('is_redacted').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const foiaAuditLog = pgTable('foia_audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  foiaRequestId: uuid('foia_request_id')
    .references(() => foiaRequests.id, { onDelete: 'cascade' })
    .notNull(),
  // action: created | status_changed | message_sent | document_added | fulfilled | denied | assigned
  action: text('action').notNull(),
  actorName: text('actor_name').notNull(),
  actorRole: text('actor_role').notNull(),
  detail: text('detail'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const foiaRequestsRelations = relations(foiaRequests, ({ many }) => ({
  messages: many(foiaMessages),
  workflowSteps: many(foiaWorkflowSteps),
  documents: many(foiaDocuments),
  auditLog: many(foiaAuditLog),
}))

export const foiaMessagesRelations = relations(foiaMessages, ({ one }) => ({
  foiaRequest: one(foiaRequests, {
    fields: [foiaMessages.foiaRequestId],
    references: [foiaRequests.id],
  }),
}))

export const foiaWorkflowStepsRelations = relations(foiaWorkflowSteps, ({ one }) => ({
  foiaRequest: one(foiaRequests, {
    fields: [foiaWorkflowSteps.foiaRequestId],
    references: [foiaRequests.id],
  }),
}))

export const foiaDocumentsRelations = relations(foiaDocuments, ({ one }) => ({
  foiaRequest: one(foiaRequests, {
    fields: [foiaDocuments.foiaRequestId],
    references: [foiaRequests.id],
  }),
}))

export const foiaAuditLogRelations = relations(foiaAuditLog, ({ one }) => ({
  foiaRequest: one(foiaRequests, {
    fields: [foiaAuditLog.foiaRequestId],
    references: [foiaRequests.id],
  }),
}))

export const meetings = pgTable(
  'meetings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    townId: uuid('town_id')
      .references(() => towns.id, { onDelete: 'cascade' })
      .notNull(),
    externalId: text('external_id').notNull(),
    title: text('title').notNull(),
    body: text('body').notNull(),
    startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
    location: text('location').notNull(),
    status: text('status').notNull(),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    minutesStatus: text('minutes_status').notNull().default('not_started'),
    meetingType: text('meeting_type').notNull().default('council'),
    agendaPublishedAt: timestamp('agenda_published_at', { withTimezone: true }),
    minutesPublishedAt: timestamp('minutes_published_at', { withTimezone: true }),
    internalNotes: text('internal_notes').notNull().default(''),
    minutesDraft: text('minutes_draft').notNull().default(''),
    presidingOfficer: text('presiding_officer').notNull().default(''),
    calledToOrderAt: text('called_to_order_at').notNull().default(''),
    adjournedAt: text('adjourned_at').notNull().default(''),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex('meetings_town_external_id').on(table.townId, table.externalId)],
)

export const agendaItems = pgTable('agenda_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  meetingId: uuid('meeting_id')
    .references(() => meetings.id, { onDelete: 'cascade' })
    .notNull(),
  sortOrder: integer('sort_order').notNull(),
  title: text('title').notNull(),
  detail: text('detail').notNull().default(''),
  notes: text('notes').notNull().default(''),
})

export const motions = pgTable('motions', {
  id: uuid('id').primaryKey().defaultRandom(),
  meetingId: uuid('meeting_id')
    .references(() => meetings.id, { onDelete: 'cascade' })
    .notNull(),
  agendaItemId: uuid('agenda_item_id').references(() => agendaItems.id, { onDelete: 'set null' }),
  description: text('description').notNull(),
  movedBy: text('moved_by').notNull().default(''),
  secondedBy: text('seconded_by').notNull().default(''),
  voteYes: integer('vote_yes').notNull().default(0),
  voteNo: integer('vote_no').notNull().default(0),
  voteAbstain: integer('vote_abstain').notNull().default(0),
  outcome: text('outcome').notNull().default('pending'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const meetingActionItems = pgTable('meeting_action_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  meetingId: uuid('meeting_id')
    .references(() => meetings.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  assignedTo: text('assigned_to').notNull().default(''),
  dueDate: text('due_date'),
  done: boolean('done').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const meetingAttendance = pgTable('meeting_attendance', {
  id: uuid('id').primaryKey().defaultRandom(),
  meetingId: uuid('meeting_id')
    .references(() => meetings.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  role: text('role').notNull().default(''),
  boardName: text('board_name').notNull().default(''),
  status: text('status').notNull().default('present'),
  arrivedAt: text('arrived_at'),
  leftAt: text('left_at'),
  isGuest: boolean('is_guest').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const boardTerms = pgTable('board_terms', {
  id: uuid('id').primaryKey().defaultRandom(),
  townId: uuid('town_id')
    .references(() => towns.id, { onDelete: 'cascade' })
    .notNull(),
  memberName: text('member_name').notNull(),
  boardName: text('board_name').notNull(),
  seat: text('seat').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const licenses = pgTable(
  'licenses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    townId: uuid('town_id')
      .references(() => towns.id, { onDelete: 'cascade' })
      .notNull(),
    publicId: text('public_id').notNull(),
    type: text('type').notNull(),
    applicantName: text('applicant_name').notNull(),
    applicantEmail: text('applicant_email'),
    applicantPhone: text('applicant_phone'),
    description: text('description').notNull().default(''),
    status: text('status').notNull().default('pending'),
    fee: integer('fee'),
    feePaidAt: timestamp('fee_paid_at', { withTimezone: true }),
    submittedAt: timestamp('submitted_at', { withTimezone: true }).notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex('licenses_town_public_id').on(table.townId, table.publicId)],
)

export const prospects = pgTable('prospects', {
  id: text('id').primaryKey(),
  townName: text('town_name').notNull(),
  state: text('state').notNull(),
  population: integer('population'),
  clerkName: text('clerk_name').notNull(),
  email: text('email'),
  contactInfo: text('contact_info'),
  notes: text('notes').notNull().default(''),
  status: text('status').notNull().default('not_contacted'),
  lastContactedAt: timestamp('last_contacted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export type Town = typeof towns.$inferSelect
export type Invitation = typeof invitations.$inferSelect
export type User = typeof users.$inferSelect
export type FoiaRequestRow = typeof foiaRequests.$inferSelect
export type FoiaMessageRow = typeof foiaMessages.$inferSelect
export type FoiaWorkflowStepRow = typeof foiaWorkflowSteps.$inferSelect
export type FoiaDocumentRow = typeof foiaDocuments.$inferSelect
export type FoiaAuditLogRow = typeof foiaAuditLog.$inferSelect
export type MeetingRow = typeof meetings.$inferSelect
export type AgendaItemRow = typeof agendaItems.$inferSelect
export type BoardTermRow = typeof boardTerms.$inferSelect
export type LicenseRow = typeof licenses.$inferSelect
export type ProspectRow = typeof prospects.$inferSelect
export type MotionRow = typeof motions.$inferSelect
export type MeetingActionItemRow = typeof meetingActionItems.$inferSelect
export type MeetingAttendanceRow = typeof meetingAttendance.$inferSelect
