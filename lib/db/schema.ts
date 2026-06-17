import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

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
export type MeetingRow = typeof meetings.$inferSelect
export type AgendaItemRow = typeof agendaItems.$inferSelect
export type BoardTermRow = typeof boardTerms.$inferSelect
export type ProspectRow = typeof prospects.$inferSelect
