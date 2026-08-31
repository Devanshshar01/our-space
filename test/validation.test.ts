import { describe, it, expect } from 'vitest';
import {
  validateAnniversaryDate,
  validateCustomName,
  validateInvitationCode,
} from '@/lib/couple-space/validation';

describe('Couple Space validation', () => {
  describe('validateCustomName', () => {
    it('accepts null/undefined/empty as null', () => {
      expect(validateCustomName(undefined)).toEqual({ ok: true, value: null });
      expect(validateCustomName(null)).toEqual({ ok: true, value: null });
      expect(validateCustomName('')).toEqual({ ok: true, value: null });
    });

    it('trims whitespace', () => {
      const r = validateCustomName('  Hello  ');
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe('Hello');
    });

    it('rejects too-long names', () => {
      const r = validateCustomName('a'.repeat(81));
      expect(r.ok).toBe(false);
    });

    it('rejects non-strings', () => {
      expect(validateCustomName(123).ok).toBe(false);
      expect(validateCustomName({}.toString()).ok).toBe(true); // weird edge, default string
    });
  });

  describe('validateAnniversaryDate', () => {
    it('accepts null/undefined/empty as null', () => {
      expect(validateAnniversaryDate(undefined)).toEqual({ ok: true, value: null });
      expect(validateAnniversaryDate(null)).toEqual({ ok: true, value: null });
      expect(validateAnniversaryDate('')).toEqual({ ok: true, value: null });
    });

    it('accepts YYYY-MM-DD', () => {
      const r = validateAnniversaryDate('2024-06-15');
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe('2024-06-15');
    });

    it('rejects bad format', () => {
      expect(validateAnniversaryDate('2024/06/15').ok).toBe(false);
      expect(validateAnniversaryDate('15-06-2024').ok).toBe(false);
      expect(validateAnniversaryDate('not-a-date').ok).toBe(false);
    });

    it('rejects out-of-range years', () => {
      expect(validateAnniversaryDate('1800-01-01').ok).toBe(false);
      expect(validateAnniversaryDate('3000-01-01').ok).toBe(false);
    });
  });

  describe('validateInvitationCode', () => {
    it('rejects empty', () => {
      expect(validateInvitationCode('').ok).toBe(false);
      expect(validateInvitationCode(null).ok).toBe(false);
      expect(validateInvitationCode(undefined).ok).toBe(false);
    });

    it('accepts a normal token', () => {
      const r = validateInvitationCode('abc123');
      expect(r.ok).toBe(true);
    });

    it('rejects too-long input', () => {
      expect(validateInvitationCode('a'.repeat(257)).ok).toBe(false);
    });
  });
});