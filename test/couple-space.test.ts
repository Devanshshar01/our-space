import { describe, it, expect, afterEach } from 'vitest';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
  createCoupleSpace,
  createInvitation,
  redeemInvitation,
  getCurrentCoupleSpace,
  revokeInvitation,
} from '@/lib/couple-space/service';
import { hashInvitationToken } from '@/lib/couple-space/token';
import { spaceInvitations, user } from '@/lib/db/schema';
import { randomUUID } from 'node:crypto';

// Test helpers
async function insertUser(name = 'Test'): Promise<string> {
  const id = randomUUID();
  await db.insert(user).values({
    id,
    name: `${name}-${id.slice(0, 6)}`,
    email: `${id}@test.local`,
  });
  return id;
}

async function cleanupUsers(userIds: string[]) {
  if (userIds.length === 0) return;
  // Build a postgres array literal from the user IDs.
  const arrayLit = `{${userIds.map((u) => `"${u}"`).join(',')}}`;
  await db.execute(
    sql`DELETE FROM couple_space_members WHERE user_id = ANY(${arrayLit}::text[])`,
  );
  await db.execute(
    sql`DELETE FROM space_invitations WHERE inviter_user_id = ANY(${arrayLit}::text[]) OR accepted_by_user_id = ANY(${arrayLit}::text[])`,
  );
  await db.execute(
    sql`DELETE FROM couple_spaces WHERE id NOT IN (SELECT DISTINCT space_id FROM couple_space_members)`,
  );
  await db.execute(sql`DELETE FROM "user" WHERE id = ANY(${arrayLit}::text[])`);
}

describe('Couple Space service', () => {
  const usersToCleanup: string[] = [];

  afterEach(async () => {
    await cleanupUsers(usersToCleanup.splice(0));
  });

  describe('createCoupleSpace', () => {
    it('creates a space and makes creator the first member', async () => {
      const userId = await insertUser('Alice');
      usersToCleanup.push(userId);

      const result = await createCoupleSpace(userId, {
        customName: 'Test Space',
        anniversaryDate: '2024-01-15',
      });
      expect(result.ok).toBe(true);

      const view = await getCurrentCoupleSpace(userId);
      expect(view).not.toBeNull();
      expect(view!.space.status).toBe('PENDING');
      expect(view!.space.customName).toBe('Test Space');
      expect(view!.space.anniversaryDate).toBe('2024-01-15');
      expect(view!.members).toHaveLength(1);
      expect(view!.members[0]!.userId).toBe(userId);
    });

    it('rejects creation if user already belongs to a space', async () => {
      const userId = await insertUser('Bob');
      usersToCleanup.push(userId);

      const first = await createCoupleSpace(userId, {
        customName: null,
        anniversaryDate: null,
      });
      expect(first.ok).toBe(true);

      const second = await createCoupleSpace(userId, {
        customName: 'Another',
        anniversaryDate: null,
      });
      expect(second.ok).toBe(false);
      if (!second.ok) {
        expect(second.reason).toMatch(/already/i);
      }
    });

    it('creates space with null fields when omitted', async () => {
      const userId = await insertUser('Carol');
      usersToCleanup.push(userId);

      const result = await createCoupleSpace(userId, {
        customName: null,
        anniversaryDate: null,
      });
      expect(result.ok).toBe(true);

      const view = await getCurrentCoupleSpace(userId);
      expect(view).not.toBeNull();
      expect(view!.space.customName).toBeNull();
      expect(view!.space.anniversaryDate).toBeNull();
    });
  });

  describe('createInvitation', () => {
    it('creates a pending invitation for the current space', async () => {
      const userId = await insertUser('Dave');
      usersToCleanup.push(userId);

      await createCoupleSpace(userId, { customName: null, anniversaryDate: null });
      const invite = await createInvitation(userId, 'http://localhost:3000');
      expect(invite.ok).toBe(true);
      if (invite.ok) {
        expect(invite.invitation.inviteUrl).toContain('code=');
        expect(invite.invitation.inviteUrl).toContain('/join');
        expect(invite.invitation.rawToken).toHaveLength(64);
        // expiry should be ~72h from now
        const expiresAt = new Date(invite.invitation.expiresAt).getTime();
        const now = Date.now();
        expect(expiresAt).toBeGreaterThan(now);
        expect(expiresAt - now).toBeGreaterThan(70 * 60 * 60 * 1000);
      }
    });

    it('rejects if user has no space', async () => {
      const userId = await insertUser('Eve');
      usersToCleanup.push(userId);

      const invite = await createInvitation(userId, 'http://localhost:3000');
      expect(invite.ok).toBe(false);
    });
  });

  describe('redeemInvitation', () => {
    it('allows second user to join, marks space ACTIVE, marks invite ACCEPTED', async () => {
      const alice = await insertUser('Alice');
      const bob = await insertUser('Bob');
      usersToCleanup.push(alice, bob);

      await createCoupleSpace(alice, { customName: null, anniversaryDate: null });
      const invite = await createInvitation(alice, 'http://localhost:3000');
      expect(invite.ok).toBe(true);
      if (!invite.ok) return;

      const redeem = await redeemInvitation(bob, invite.invitation.rawToken);
      expect(redeem.ok).toBe(true);

      const aliceView = await getCurrentCoupleSpace(alice);
      expect(aliceView!.space.status).toBe('ACTIVE');
      expect(aliceView!.members).toHaveLength(2);

      const bobView = await getCurrentCoupleSpace(bob);
      expect(bobView!.space.id).toBe(aliceView!.space.id);
      expect(bobView!.members).toHaveLength(2);

      // Invitation should be marked accepted
      const tokenHash = hashInvitationToken(invite.invitation.rawToken);
      const inv = await db
        .select()
        .from(spaceInvitations)
        .where(sql`token_hash = ${tokenHash}`);
      expect(inv[0]!.status).toBe('ACCEPTED');
      expect(inv[0]!.acceptedByUserId).toBe(bob);
    });

    it('rejects self-join', async () => {
      const alice = await insertUser('Alice');
      usersToCleanup.push(alice);

      await createCoupleSpace(alice, { customName: null, anniversaryDate: null });
      const invite = await createInvitation(alice, 'http://localhost:3000');
      expect(invite.ok).toBe(true);
      if (!invite.ok) return;

      const redeem = await redeemInvitation(alice, invite.invitation.rawToken);
      expect(redeem.ok).toBe(false);
      if (!redeem.ok) {
        expect(redeem.reason).toMatch(/own/i);
      }
    });

    it('rejects reused (already accepted) invitation', async () => {
      const alice = await insertUser('Alice');
      const bob = await insertUser('Bob');
      const eve = await insertUser('Eve');
      usersToCleanup.push(alice, bob, eve);

      await createCoupleSpace(alice, { customName: null, anniversaryDate: null });
      const invite = await createInvitation(alice, 'http://localhost:3000');
      expect(invite.ok).toBe(true);
      if (!invite.ok) return;

      const first = await redeemInvitation(bob, invite.invitation.rawToken);
      expect(first.ok).toBe(true);

      const second = await redeemInvitation(eve, invite.invitation.rawToken);
      expect(second.ok).toBe(false);
    });

    it('rejects invalid token', async () => {
      const alice = await insertUser('Alice');
      usersToCleanup.push(alice);

      const redeem = await redeemInvitation(alice, 'not-a-real-token-xxxxxxxxxxxxxxxx');
      expect(redeem.ok).toBe(false);
    });

    it('rejects if joiner already belongs to a different space', async () => {
      const alice = await insertUser('Alice');
      const bob = await insertUser('Bob');
      const carol = await insertUser('Carol');
      usersToCleanup.push(alice, bob, carol);

      await createCoupleSpace(alice, { customName: null, anniversaryDate: null });
      await createCoupleSpace(bob, { customName: null, anniversaryDate: null });
      const invite = await createInvitation(alice, 'http://localhost:3000');
      if (!invite.ok) throw new Error('invite failed');

      const redeem = await redeemInvitation(bob, invite.invitation.rawToken);
      expect(redeem.ok).toBe(false);
      if (!redeem.ok) {
        expect(redeem.reason).toMatch(/already/i);
      }
    });

    it('rejects if space already has 2 members', async () => {
      const alice = await insertUser('Alice');
      const bob = await insertUser('Bob');
      const carol = await insertUser('Carol');
      usersToCleanup.push(alice, bob, carol);

      await createCoupleSpace(alice, { customName: null, anniversaryDate: null });
      const invite1 = await createInvitation(alice, 'http://localhost:3000');
      if (!invite1.ok) throw new Error('invite1 failed');
      const first = await redeemInvitation(bob, invite1.invitation.rawToken);
      expect(first.ok).toBe(true);

      // Space is now ACTIVE with 2 members. Even if carol tries to redeem the same token, it should fail
      // (already accepted, plus space is full).
      const redeem = await redeemInvitation(carol, invite1.invitation.rawToken);
      expect(redeem.ok).toBe(false);
    });

    it('rejects expired invitation', async () => {
      const alice = await insertUser('Alice');
      const bob = await insertUser('Bob');
      usersToCleanup.push(alice, bob);

      await createCoupleSpace(alice, { customName: null, anniversaryDate: null });
      const invite = await createInvitation(alice, 'http://localhost:3000');
      if (!invite.ok) throw new Error('invite failed');

      // Force expire the invitation directly
      const tokenHash = hashInvitationToken(invite.invitation.rawToken);
      await db.execute(
        sql`UPDATE space_invitations SET expires_at = now() - interval '1 hour' WHERE token_hash = ${tokenHash}`,
      );

      const redeem = await redeemInvitation(bob, invite.invitation.rawToken);
      expect(redeem.ok).toBe(false);
    });
  });

  describe('revokeInvitation', () => {
    it('allows inviter to revoke their pending invitation', async () => {
      const alice = await insertUser('Alice');
      usersToCleanup.push(alice);

      await createCoupleSpace(alice, { customName: null, anniversaryDate: null });
      const invite = await createInvitation(alice, 'http://localhost:3000');
      if (!invite.ok) throw new Error('invite failed');

      const revoke = await revokeInvitation(alice, invite.invitation.id);
      expect(revoke.ok).toBe(true);

      const tokenHash = hashInvitationToken(invite.invitation.rawToken);
      const inv = await db
        .select()
        .from(spaceInvitations)
        .where(sql`token_hash = ${tokenHash}`);
      expect(inv[0]!.status).toBe('REVOKED');
    });

    it('rejects revocation by non-inviter', async () => {
      const alice = await insertUser('Alice');
      const mallory = await insertUser('Mallory');
      usersToCleanup.push(alice, mallory);

      await createCoupleSpace(alice, { customName: null, anniversaryDate: null });
      const invite = await createInvitation(alice, 'http://localhost:3000');
      if (!invite.ok) throw new Error('invite failed');

      const revoke = await revokeInvitation(mallory, invite.invitation.id);
      expect(revoke.ok).toBe(false);
    });
  });

  describe('concurrency', () => {
    it('only allows one of two concurrent redemption attempts to succeed', async () => {
      const alice = await insertUser('Alice');
      const bob = await insertUser('Bob');
      const carol = await insertUser('Carol');
      usersToCleanup.push(alice, bob, carol);

      await createCoupleSpace(alice, { customName: null, anniversaryDate: null });
      const invite = await createInvitation(alice, 'http://localhost:3000');
      if (!invite.ok) throw new Error('invite failed');

      // Fire two redemptions concurrently
      const [r1, r2] = await Promise.all([
        redeemInvitation(bob, invite.invitation.rawToken),
        redeemInvitation(carol, invite.invitation.rawToken),
      ]);

      const successes = [r1, r2].filter((r) => r.ok).length;
      const failures = [r1, r2].filter((r) => !r.ok).length;
      expect(successes).toBe(1);
      expect(failures).toBe(1);

      // Verify the space has exactly 2 members
      const view = await getCurrentCoupleSpace(alice);
      expect(view!.members).toHaveLength(2);
      expect(view!.space.status).toBe('ACTIVE');
    });
  });
});