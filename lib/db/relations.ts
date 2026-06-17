import { relations } from 'drizzle-orm'
import {
  agendaItems,
  boardTerms,
  foiaMessages,
  foiaRequests,
  foiaWorkflowSteps,
  meetings,
  towns,
  users,
} from './schema'

export const townsRelations = relations(towns, ({ many }) => ({
  users: many(users),
  foiaRequests: many(foiaRequests),
  meetings: many(meetings),
  boardTerms: many(boardTerms),
}))

export const usersRelations = relations(users, ({ one, many }) => ({
  town: one(towns, {
    fields: [users.townId],
    references: [towns.id],
  }),
  assignedFoiaRequests: many(foiaRequests),
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
}))

export const agendaItemsRelations = relations(agendaItems, ({ one }) => ({
  meeting: one(meetings, {
    fields: [agendaItems.meetingId],
    references: [meetings.id],
  }),
}))

export const boardTermsRelations = relations(boardTerms, ({ one }) => ({
  town: one(towns, {
    fields: [boardTerms.townId],
    references: [towns.id],
  }),
}))
