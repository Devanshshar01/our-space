import { randomUUID } from 'node:crypto';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { coupleSpaceMembers, moodStatus } from '@/lib/db/schema';
import { validateMood, validateMoodMessage, type Mood } from './validation';

export type MoodView = {
  id: string;
  spaceId: string;
  userId: string;
  mood: Mood;
  message: string | null;
  updatedAt: Date;
  name: string | null;
  email: string | null;
  image: string | null;
};

export type MoodPairView = {
  me: MoodView | null;
  partner: MoodView | null;
};

export type SetMoodInput = {
  mood: Mood;
  message: string | null;
};

export type SetMoodResult =
  | { ok: true; mood: MoodView }
  | { ok: false; reason: string };

export type GetMoodResult =
  | { ok: true; moods: MoodPairView }
  | { ok: false; reason: string };

function isUniqueViolation(err: unknown): boolean {
  const e = err as { code?: string; cause?: { code?: string } };
  return e?.code === '23505' || e?.cause?.code === '23505';
}

export async function getMoods(userId: string): Promise<GetMoodResult> {
  const membershipRow = await db
    .select({ spaceId: coupleSpaceMembers.spaceId })
    .from(coupleSpaceMembers)
    .where(eq(coupleSpaceMembers.userId, userId))
    .limit(1);

  const membership = membershipRow[0];
  if (!membership) return { ok: false, reason: 'No couple space found' };

  const moodRows = await db
    .select({
      id: moodStatus.id,
      spaceId: moodStatus.spaceId,
      userId: moodStatus.userId,
      mood: moodStatus.mood,
      message: moodStatus.message,
      updatedAt: moodStatus.updatedAt,
      name: sql<string | null>`(SELECT name FROM "user" WHERE id = ${moodStatus.userId})`,
      email: sql<string | null>`(SELECT email FROM "user" WHERE id = ${moodStatus.userId})`,
      image: sql<string | null>`(SELECT image FROM "user" WHERE id = ${moodStatus.userId})`,
    })
    .from(moodStatus)
    .where(eq(moodStatus.spaceId, membership.spaceId));

  const me = moodRows.find((m) => m.userId === userId) ?? null;
  const partner = moodRows.find((m) => m.userId !== userId) ?? null;

  return {
    ok: true,
    moods: { me, partner },
  } as const;
}

export async function setMood(userId: string, input: SetMoodInput): Promise<SetMoodResult> {
  const moodValidation = validateMood(input.mood);
  if (!moodValidation.ok) return { ok: false, reason: moodValidation.error };

  const messageValidation = validateMoodMessage(input.message);
  if (!messageValidation.ok) return { ok: false, reason: messageValidation.error };

  const membershipRow = await db
    .select({ spaceId: coupleSpaceMembers.spaceId })
    .from(coupleSpaceMembers)
    .where(eq(coupleSpaceMembers.userId, userId))
    .limit(1);

  const membership = membershipRow[0];
  if (!membership) return { ok: false, reason: 'No couple space found' };

  const now = new Date();

  try {
    return await db.transaction(async (tx) => {
      // Check if mood already exists
      const existing = await tx
        .select()
        .from(moodStatus)
        .where(and(eq(moodStatus.spaceId, membership.spaceId), eq(moodStatus.userId, userId)))
        .limit(1);

      if (existing.length > 0) {
        const existingMood = existing[0];
        // Update existing
        await tx
          .update(moodStatus)
          .set({
            mood: input.mood,
            message: messageValidation.value,
            updatedAt: now,
          })
          .where(eq(moodStatus.id, existingMood!.id));
      } else {
        // Insert new
        await tx.insert(moodStatus).values({
          id: randomUUID(),
          spaceId: membership.spaceId,
          userId,
          mood: input.mood,
          message: messageValidation.value,
          updatedAt: now,
        });
      }

      // Return the updated mood
      const updated = await tx
        .select({
          id: moodStatus.id,
          spaceId: moodStatus.spaceId,
          userId: moodStatus.userId,
          mood: moodStatus.mood,
          message: moodStatus.message,
          updatedAt: moodStatus.updatedAt,
          name: sql<string | null>`(SELECT name FROM "user" WHERE id = ${moodStatus.userId})`,
          email: sql<string | null>`(SELECT email FROM "user" WHERE id = ${moodStatus.userId})`,
          image: sql<string | null>`(SELECT image FROM "user" WHERE id = ${moodStatus.userId})`,
        })
        .from(moodStatus)
        .where(and(eq(moodStatus.spaceId, membership.spaceId), eq(moodStatus.userId, userId)))
        .limit(1);

      return { ok: true, mood: updated[0] as MoodView } as const;
    });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return { ok: false, reason: 'Mood already exists for this user' };
    }
    throw err;
  }
}

export async function clearMood(userId: string): Promise<{ ok: true } | { ok: false; reason: string }> {
  const membershipRow = await db
    .select({ spaceId: coupleSpaceMembers.spaceId })
    .from(coupleSpaceMembers)
    .where(eq(coupleSpaceMembers.userId, userId))
    .limit(1);

  const membership = membershipRow[0];
  if (!membership) return { ok: false, reason: 'No couple space found' };

  try {
    await db.transaction(async (tx) => {
      await tx
        .delete(moodStatus)
        .where(and(eq(moodStatus.spaceId, membership.spaceId), eq(moodStatus.userId, userId)));
    });
    return { ok: true } as const;
  } catch (err) {
    throw err;
  }
}

// Re-export validation functions for API use
export { validateMood, validateMoodMessage, type Mood } from './validation';