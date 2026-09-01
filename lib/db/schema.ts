import { pgTable, text, timestamp, boolean, date, uniqueIndex, index } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  identifierValueIdx: uniqueIndex('verification_identifier_value_idx').on(table.identifier, table.value),
}));

// ============================================================
// STEP 3 — Couple Space domain tables
// ============================================================

export const spaceStatusValues = ['PENDING', 'ACTIVE', 'DISSOLVED'] as const;
export type SpaceStatus = (typeof spaceStatusValues)[number];

export const invitationStatusValues = ['PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED'] as const;
export type InvitationStatus = (typeof invitationStatusValues)[number];

export const coupleSpaces = pgTable('couple_spaces', {
  id: text('id').primaryKey(),
  status: text('status').$type<SpaceStatus>().notNull().default('PENDING'),
  customName: text('custom_name'),
  anniversaryDate: date('anniversary_date'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  statusIdx: index('couple_spaces_status_idx').on(table.status),
}));

export const coupleSpaceMembers = pgTable('couple_space_members', {
  id: text('id').primaryKey(),
  spaceId: text('space_id').notNull().references(() => coupleSpaces.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  spaceUserUniqueIdx: uniqueIndex('couple_space_members_space_user_unique').on(table.spaceId, table.userId),
  userUniqueIdx: uniqueIndex('couple_space_members_user_unique').on(table.userId),
  spaceIdx: index('couple_space_members_space_idx').on(table.spaceId),
  userIdx: index('couple_space_members_user_idx').on(table.userId),
}));

export const spaceInvitations = pgTable('space_invitations', {
  id: text('id').primaryKey(),
  spaceId: text('space_id').notNull().references(() => coupleSpaces.id, { onDelete: 'cascade' }),
  inviterUserId: text('inviter_user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull().unique(),
  status: text('status').$type<InvitationStatus>().notNull().default('PENDING'),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  acceptedByUserId: text('accepted_by_user_id').references(() => user.id, { onDelete: 'set null' }),
}, (table) => ({
  tokenHashIdx: uniqueIndex('space_invitations_token_hash_unique').on(table.tokenHash),
  spaceIdx: index('space_invitations_space_idx').on(table.spaceId),
  inviterIdx: index('space_invitations_inviter_idx').on(table.inviterUserId),
}));

// ============================================================
// STEP 5 — Mood / Current Status
// ============================================================

import { type Mood } from '@/lib/couple-space/validation';

export const moodStatus = pgTable('mood_status', {
  id: text('id').primaryKey(),
  spaceId: text('space_id').notNull().references(() => coupleSpaces.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  mood: text('mood').$type<Mood>().notNull(),
  message: text('message'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  spaceUserUniqueIdx: uniqueIndex('mood_status_space_user_unique').on(table.spaceId, table.userId),
  spaceIdx: index('mood_status_space_idx').on(table.spaceId),
  userIdx: index('mood_status_user_idx').on(table.userId),
}));

export type MoodStatus = typeof moodStatus.$inferSelect;

export type User = typeof user.$inferSelect;
export type Session = typeof session.$inferSelect;
export type Account = typeof account.$inferSelect;
export type Verification = typeof verification.$inferSelect;
export type CoupleSpace = typeof coupleSpaces.$inferSelect;
export type CoupleSpaceMember = typeof coupleSpaceMembers.$inferSelect;
export type SpaceInvitation = typeof spaceInvitations.$inferSelect;