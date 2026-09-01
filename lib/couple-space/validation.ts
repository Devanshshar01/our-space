export const INVITATION_TTL_MS = 72 * 60 * 60 * 1000; // 72 hours

export const SPACE_NAME_MAX_LENGTH = 80;
export const SPACE_NAME_MIN_LENGTH = 1;

export const ANNIVERSARY_MIN_YEAR = 1900;
export const ANNIVERSARY_MAX_YEAR = new Date().getFullYear() + 1;

// Token: 32 bytes => 64 hex chars. URL-safe, fixed format, length-bounded.
export const INVITATION_TOKEN_BYTES = 32;

// Limits
export const CUSTOM_NAME_MAX = 80;
export const CUSTOM_NAME_MIN = 1;

// Mood
export const moodValues = ['GREAT', 'GOOD', 'MEH', 'SAD', 'FRUSTRATED', 'MISSING_YOU'] as const;
export type Mood = (typeof moodValues)[number];

// Mood message limits
export const MOOD_MESSAGE_MAX = 200;
export const MOOD_MESSAGE_MIN = 1;

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export function validateCustomName(raw: unknown): ValidationResult<string | null> {
  if (raw === undefined || raw === null || raw === '') return { ok: true, value: null };
  if (typeof raw !== 'string') return { ok: false, error: 'Invalid name' };
  const trimmed = raw.trim();
  if (trimmed.length < CUSTOM_NAME_MIN) return { ok: false, error: 'Name is too short' };
  if (trimmed.length > CUSTOM_NAME_MAX) return { ok: false, error: 'Name is too long' };
  return { ok: true, value: trimmed };
}

export function validateAnniversaryDate(raw: unknown): ValidationResult<string | null> {
  if (raw === undefined || raw === null || raw === '') return { ok: true, value: null };
  if (typeof raw !== 'string') return { ok: false, error: 'Invalid anniversary date' };
  // Expect YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return { ok: false, error: 'Anniversary date must be YYYY-MM-DD' };
  }
  const d = new Date(raw + 'T00:00:00Z');
  if (Number.isNaN(d.getTime())) return { ok: false, error: 'Anniversary date is invalid' };
  const year = d.getUTCFullYear();
  if (year < ANNIVERSARY_MIN_YEAR || year > ANNIVERSARY_MAX_YEAR) {
    return { ok: false, error: 'Anniversary date is out of range' };
  }
  // Normalize to YYYY-MM-DD
  return { ok: true, value: raw };
}

export function validateInvitationCode(raw: unknown): ValidationResult<string> {
  if (typeof raw !== 'string') return { ok: false, error: 'Invalid invitation code' };
  const trimmed = raw.trim();
  if (trimmed.length === 0) return { ok: false, error: 'Invitation code is required' };
  if (trimmed.length > 256) return { ok: false, error: 'Invitation code is invalid' };
  return { ok: true, value: trimmed };
}

export function validateMood(raw: unknown): ValidationResult<Mood> {
  if (typeof raw !== 'string') return { ok: false, error: 'Invalid mood' };
  if (!moodValues.includes(raw as Mood)) return { ok: false, error: 'Invalid mood value' };
  return { ok: true, value: raw as Mood };
}

export function validateMoodMessage(raw: unknown): ValidationResult<string | null> {
  if (raw === undefined || raw === null || raw === '') return { ok: true, value: null };
  if (typeof raw !== 'string') return { ok: false, error: 'Invalid message' };
  const trimmed = raw.trim();
  if (trimmed.length > 200) return { ok: false, error: 'Message is too long (max 200 characters)' };
  return { ok: true, value: trimmed };
}