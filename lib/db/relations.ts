import { relations } from 'drizzle-orm'
import {
  agendaItems,
  boardTerms,
  foiaAuditLog,
  foiaDocuments,
  foiaMessages,
  foiaRequests,
  foiaWorkflowSteps,
  gmailConnections,
  invitations,
  licenses,
  meetingActionItems,
  meetingAttendance,
  meetings,
  motions,
  processedEmails,
  towns,
  users,
} from './schema'

export const townsRelations = relations(towns, ({ many }) => ({
  users: many(users),
  foiaRequests: many(foiaRequests),
  meetings: many(meetings),
  boardTerms: many(boardTerms),
  licenses: many(licenses),
  invitations: many(invitations),
}))

export const licensesRelations = relations(licenses, ({ one }) => ({
  town: one(towns, {
    fields: [licenses.townId],
    references: [towns.id],
  }),
}))

export const usersRelations = relations(users, ({ one, many }) => ({
  town: one(towns, {
    fields: [users.townId],
    references: [towns.id],
  }),
  assignedFoiaRequests: many(foiaRequests),
  createdInvitations: many(invitations),
}))

export const invitationsRelations = relations(invitations, ({ one }) => ({
  town: one(towns, {
    fields: [invitations.townId],
    references: [towns.id],
  }),
  createdBy: one(users, {
    fields: [invitations.createdById],
    references: [users.id],
  }),
}))

export const foiaRequestsRelations = relations(foiaRequests, ({ one, many }) => ({
  town: one(towns, {
    fields: [foiaRequests.townId],
    references: [towns.id],
  }),
  assignedUser: one(users, {
    fields: [foiaRequests.assignedUserId],
    references: [users.id],
  }),
  messages: many(foiaMessages),
  workflowSteps: many(foiaWorkflowSteps),
  documents: many(foiaDocuments),
  auditLog: many(foiaAuditLog),
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

export const foiaMessagesRelations = relations(foiaMessages, ({ one }) => ({
  request: one(foiaRequests, {
    fields: [foiaMessages.foiaRequestId],
    references: [foiaRequests.id],
  }),
}))

export const foiaWorkflowStepsRelations = relations(foiaWorkflowSteps, ({ one }) => ({
  request: one(foiaRequests, {
    fields: [foiaWorkflowSteps.foiaRequestId],
    references: [foiaRequests.id],
  }),
}))

export const meetingsRelations = relations(meetings, ({ one, many }) => ({
  town: one(towns, {
    fields: [meetings.townId],
    references: [towns.id],
  }),
  agendaItems: many(agendaItems),
  motions: many(motions),
  actionItems: many(meetingActionItems),
  attendance: many(meetingAttendance),
}))

export const agendaItemsRelations = relations(agendaItems, ({ one, many }) => ({
  meeting: one(meetings, {
    fields: [agendaItems.meetingId],
    references: [meetings.id],
  }),
  motions: many(motions),
}))

export const motionsRelations = relations(motions, ({ one }) => ({
  meeting: one(meetings, { fields: [motions.meetingId], references: [meetings.id] }),
  agendaItem: one(agendaItems, { fields: [motions.agendaItemId], references: [agendaItems.id] }),
}))

export const meetingActionItemsRelations = relations(meetingActionItems, ({ one }) => ({
  meeting: one(meetings, { fields: [meetingActionItems.meetingId], references: [meetings.id] }),
}))

export const meetingAttendanceRelations = relations(meetingAttendance, ({ one }) => ({
  meeting: one(meetings, { fields: [meetingAttendance.meetingId], references: [meetings.id] }),
}))

export const boardTermsRelations = relations(boardTerms, ({ one }) => ({
  town: one(towns, {
    fields: [boardTerms.townId],
    references: [towns.id],
  }),
}))

export const gmailConnectionsRelations = relations(gmailConnections, ({ one, many }) => ({
  town: one(towns, {
    fields: [gmailConnections.townId],
    references: [towns.id],
  }),
  processedEmails: many(processedEmails),
}))

export const processedEmailsRelations = relations(processedEmails, ({ one }) => ({
  town: one(towns, {
    fields: [processedEmails.townId],
    references: [towns.id],
  }),
  connection: one(gmailConnections, {
    fields: [processedEmails.connectionId],
    references: [gmailConnections.id],
  }),
}))
