import { randomUUID } from 'node:crypto';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
  coupleSpaceMembers,
  coupleSpaces,
  spaceInvitations,
  type CoupleSpace,
  type CoupleSpaceMember,
  type SpaceInvitation,
  type SpaceStatus,
  type InvitationStatus,
} from '@/lib/db/schema';
import { hashInvitationToken, generateRawTokenHex } from './token';
import { INVITATION_TTL_MS } from './validation';

export type CreateSpaceInput = {
  customName: string | null;
  anniversaryDate: string | null; // YYYY-MM-DD
};

export type CurrentSpaceView = {
  membership: CoupleSpaceMember;
  space: CoupleSpace;
  members: Array<{
    id: string;
    userId: string;
    joinedAt: Date;
    name: string | null;
    email: string | null;
    image: string | null;
    isCurrentUser: boolean;
  }>;
  status: SpaceStatus;
};

export type InvitationView = {
  id: string;
  spaceId: string;
  rawToken: string;
  inviteUrl: string;
  expiresAt: Date;
};

export type RedeemResult =
  | { ok: true; spaceId: string }
  | { ok: false; reason: string };

export type CreateResult =
  | { ok: true; spaceId: string }
  | { ok: false; reason: string };

export type InviteResult =
  | { ok: true; invitation: InvitationView }
  | { ok: false; reason: string };

export class SpaceError extends Error {
  constructor(public reason: string, message?: string) {
    super(message ?? reason);
    this.name = 'SpaceError';
  }
}

function isUniqueViolation(err: unknown): boolean {
  const e = err as { code?: string; cause?: { code?: string } };
  return e?.code === '23505' || e?.cause?.code === '23505';
}

/**
 * Create a new Couple Space with the authenticated user as the first/only member.
 * Rejects if the user already belongs to a Couple Space.
 * Atomic: rollback on any failure.
 */
export async function createCoupleSpace(
  userId: string,
  input: CreateSpaceInput,
): Promise<CreateResult> {
  try {
    return await db.transaction(async (tx) => {
      // Check that the user does NOT already have a membership.
      const existing = await tx
        .select({ id: coupleSpaceMembers.id })
        .from(coupleSpaceMembers)
        .where(eq(coupleSpaceMembers.userId, userId))
        .limit(1);
      if (existing.length > 0) {
        return { ok: false, reason: 'You already belong to a space' } as const;
      }

      const spaceId = randomUUID();
      await tx.insert(coupleSpaces).values({
        id: spaceId,
        status: 'PENDING',
        customName: input.customName,
        anniversaryDate: input.anniversaryDate,
      });

      await tx.insert(coupleSpaceMembers).values({
        id: randomUUID(),
        spaceId,
        userId,
      });

      return { ok: true, spaceId } as const;
    });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return { ok: false, reason: 'You already belong to a space' };
    }
    throw err;
  }
}

/**
 * Get current Couple Space for the authenticated user.
 * Returns null if the user has no membership.
 */
export async function getCurrentCoupleSpace(
  userId: string,
): Promise<CurrentSpaceView | null> {
  const membershipRow = await db
    .select()
    .from(coupleSpaceMembers)
    .where(eq(coupleSpaceMembers.userId, userId))
    .limit(1);

  const membership = membershipRow[0];
  if (!membership) return null;

  const spaceRow = await db
    .select()
    .from(coupleSpaces)
    .where(eq(coupleSpaces.id, membership.spaceId))
    .limit(1);
  const space = spaceRow[0];
  if (!space) return null;

  const memberRows = await db
    .select({
      id: coupleSpaceMembers.id,
      userId: coupleSpaceMembers.userId,
      joinedAt: coupleSpaceMembers.joinedAt,
      name: sql<string | null>`(SELECT name FROM "user" WHERE id = ${coupleSpaceMembers.userId})`,
      email: sql<string | null>`(SELECT email FROM "user" WHERE id = ${coupleSpaceMembers.userId})`,
      image: sql<string | null>`(SELECT image FROM "user" WHERE id = ${coupleSpaceMembers.userId})`,
    })
    .from(coupleSpaceMembers)
    .where(eq(coupleSpaceMembers.spaceId, space.id));

  return {
    membership,
    space,
    members: memberRows.map((m) => ({ ...m, isCurrentUser: m.userId === userId })),
    status: space.status,
  };
}

/**
 * Create a pending invitation for the user's current PENDING Couple Space.
 * Rejects if the user is not a member, or the space is not PENDING, or has 2 members.
 */
export async function createInvitation(
  userId: string,
  baseUrl: string,
): Promise<InviteResult> {
  const membershipRow = await db
    .select()
    .from(coupleSpaceMembers)
    .where(eq(coupleSpaceMembers.userId, userId))
    .limit(1);
  const membership = membershipRow[0];
  if (!membership) return { ok: false, reason: 'You are not in a space' };

  return await db.transaction(async (tx) => {
    // Lock the space row
    const spaceRows = await tx.execute(
      sql`SELECT id, status FROM couple_spaces WHERE id = ${membership.spaceId} FOR UPDATE`,
    );
    const spaceRow = spaceRows[0] as { id: string; status: SpaceStatus } | undefined;
    if (!spaceRow) return { ok: false, reason: 'Space not found' };
    if (spaceRow.status !== 'PENDING') {
      return { ok: false, reason: 'Space is not accepting invitations' };
    }

    // Check member count atomically
    const memberCountRows = await tx
      .select({ c: sql<number>`count(*)::int` })
      .from(coupleSpaceMembers)
      .where(eq(coupleSpaceMembers.spaceId, spaceRow.id));
    const memberCount = memberCountRows[0]?.c ?? 0;
    if (memberCount >= 2) {
      return { ok: false, reason: 'Space is already full' };
    }

    const rawToken = generateRawTokenHex();
    const tokenHash = hashInvitationToken(rawToken);
    const expiresAt = new Date(Date.now() + INVITATION_TTL_MS);
    const id = randomUUID();

    await tx.insert(spaceInvitations).values({
      id,
      spaceId: spaceRow.id,
      inviterUserId: userId,
      tokenHash,
      status: 'PENDING',
      expiresAt,
    });

    const url = new URL('/join', baseUrl);
    url.searchParams.set('code', rawToken);

    return {
      ok: true,
      invitation: {
        id,
        spaceId: spaceRow.id,
        rawToken,
        inviteUrl: url.toString(),
        expiresAt,
      },
    } as const;
  });
}

/**
 * Redeem an invitation token.
 * Atomic: validates everything, joins the second member, marks invite ACCEPTED,
 * updates space to ACTIVE — all in one transaction with row locks.
 */
export async function redeemInvitation(
  userId: string,
  rawToken: string,
): Promise<RedeemResult> {
  if (!rawToken || typeof rawToken !== 'string') {
    return { ok: false, reason: 'Invalid invitation code' };
  }
  const tokenHash = hashInvitationToken(rawToken);

  try {
    return await db.transaction(async (tx) => {
      // Lock the invitation row
      const invRows = await tx.execute(
        sql`SELECT id, space_id, inviter_user_id, status, expires_at FROM space_invitations WHERE token_hash = ${tokenHash} FOR UPDATE`,
      );
      const inv = invRows[0] as
        | {
            id: string;
            space_id: string;
            inviter_user_id: string;
            status: InvitationStatus;
            expires_at: Date;
          }
        | undefined;
      if (!inv) return { ok: false, reason: 'Invitation not found' };

      if (inv.status === 'ACCEPTED') return { ok: false, reason: 'Invitation already used' };
      if (inv.status === 'REVOKED') return { ok: false, reason: 'Invitation revoked' };
      if (inv.status === 'EXPIRED') return { ok: false, reason: 'Invitation expired' };
      if (inv.status !== 'PENDING') return { ok: false, reason: 'Invitation not valid' };

      const now = new Date();
      if (new Date(inv.expires_at).getTime() <= now.getTime()) {
        // Lazy expire
        await tx
          .update(spaceInvitations)
          .set({ status: 'EXPIRED' })
          .where(eq(spaceInvitations.id, inv.id));
        return { ok: false, reason: 'Invitation expired' };
      }

      // Self-join check
      if (inv.inviter_user_id === userId) {
        return { ok: false, reason: 'You cannot use your own invitation' };
      }

      // Check that the joiner does NOT already have a membership
      const existingMembership = await tx
        .select({ id: coupleSpaceMembers.id, spaceId: coupleSpaceMembers.spaceId })
        .from(coupleSpaceMembers)
        .where(eq(coupleSpaceMembers.userId, userId))
        .limit(1);
      if (existingMembership.length > 0) {
        return { ok: false, reason: 'You already belong to a space' };
      }

      // Lock the couple space row
      const spaceRows = await tx.execute(
        sql`SELECT id, status FROM couple_spaces WHERE id = ${inv.space_id} FOR UPDATE`,
      );
      const spaceRow = spaceRows[0] as { id: string; status: SpaceStatus } | undefined;
      if (!spaceRow) return { ok: false, reason: 'Space not found' };
      if (spaceRow.status !== 'PENDING') {
        return { ok: false, reason: 'Space is no longer pending' };
      }

      // Count members atomically while holding the lock
      const memberCountRows = await tx
        .select({ c: sql<number>`count(*)::int` })
        .from(coupleSpaceMembers)
        .where(eq(coupleSpaceMembers.spaceId, spaceRow.id));
      const memberCount = memberCountRows[0]?.c ?? 0;
      if (memberCount >= 2) {
        return { ok: false, reason: 'Space is already full' };
      }

      // Insert the second member
      await tx.insert(coupleSpaceMembers).values({
        id: randomUUID(),
        spaceId: spaceRow.id,
        userId,
      });

      // Mark invitation as ACCEPTED
      await tx
        .update(spaceInvitations)
        .set({
          status: 'ACCEPTED',
          acceptedAt: now,
          acceptedByUserId: userId,
        })
        .where(eq(spaceInvitations.id, inv.id));

      // Update space status to ACTIVE
      await tx
        .update(coupleSpaces)
        .set({ status: 'ACTIVE', updatedAt: now })
        .where(and(eq(coupleSpaces.id, spaceRow.id), eq(coupleSpaces.status, 'PENDING')));

      return { ok: true, spaceId: spaceRow.id } as const;
    });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return { ok: false, reason: 'You already belong to a space' };
    }
    throw err;
  }
}

/**
 * Revoke a PENDING invitation. Only the inviter (current member) may revoke.
 */
export async function revokeInvitation(
  userId: string,
  invitationId: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  try {
    return await db.transaction(async (tx) => {
      const rows = await tx.execute(
        sql`SELECT id, space_id, inviter_user_id, status FROM space_invitations WHERE id = ${invitationId} FOR UPDATE`,
      );
      const inv = rows[0] as
        | { id: string; space_id: string; inviter_user_id: string; status: InvitationStatus }
        | undefined;
      if (!inv) return { ok: false, reason: 'Invitation not found' };
      if (inv.inviter_user_id !== userId) return { ok: false, reason: 'Not authorized' };
      if (inv.status !== 'PENDING') return { ok: false, reason: 'Invitation cannot be revoked' };

      await tx
        .update(spaceInvitations)
        .set({ status: 'REVOKED' })
        .where(eq(spaceInvitations.id, invitationId));
      return { ok: true } as const;
    });
  } catch (err) {
    throw err;
  }
}

/**
 * Lookup a pending invitation by raw token. Does NOT redeem it.
 * Useful for /join preview and validation.
 */
export async function findInvitationByRawToken(
  rawToken: string,
): Promise<SpaceInvitation | null> {
  if (!rawToken || typeof rawToken !== 'string') return null;
  const tokenHash = hashInvitationToken(rawToken);
  const rows = await db
    .select()
    .from(spaceInvitations)
    .where(eq(spaceInvitations.tokenHash, tokenHash))
    .limit(1);
  return rows[0] ?? null;
}