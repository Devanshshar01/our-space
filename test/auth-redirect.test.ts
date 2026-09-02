import { describe, expect, it } from 'vitest';
import { getSafeInternalRedirect } from '@/lib/auth/redirect';

describe('getSafeInternalRedirect', () => {
  it('accepts a relative internal path', () => {
    expect(getSafeInternalRedirect('/dashboard?tab=mood#today')).toBe('/dashboard?tab=mood#today');
  });

  it.each([
    'https://evil.example',
    '//evil.example',
    'https:%2F%2Fevil.example',
    '%2F%2Fevil.example',
    '/\\evil.example',
    '/%5C%5Cevil.example',
  ])('falls back for an external or ambiguous redirect: %s', (value) => {
    expect(getSafeInternalRedirect(value)).toBe('/onboard');
  });

  it('falls back for control characters and credentials', () => {
    expect(getSafeInternalRedirect('/dashboard%0d%0aLocation:%20https://evil.example')).toBe('/onboard');
    expect(getSafeInternalRedirect('//user:pass@evil.example')).toBe('/onboard');
  });
});
