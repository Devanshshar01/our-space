const INTERNAL_ORIGIN = 'http://our-space.internal.invalid';
const MAX_DECODE_PASSES = 3;

function decodeForValidation(value: string): string {
  let decoded = value;
  for (let i = 0; i < MAX_DECODE_PASSES; i += 1) {
    const next = decodeURIComponent(decoded);
    if (next === decoded) return decoded;
    decoded = next;
  }
  return decoded;
}

export function getSafeInternalRedirect(
  value: string | null | undefined,
  fallback = '/onboard',
): string {
  if (!value) return fallback;

  try {
    if (/[\u0000-\u001f\u007f]/.test(value)) return fallback;
    if (value.includes('\\')) return fallback;

    const decoded = decodeForValidation(value);
    if (/[\u0000-\u001f\u007f]/.test(decoded)) return fallback;
    if (decoded.includes('\\')) return fallback;
    if (!decoded.startsWith('/') || decoded.startsWith('//')) return fallback;

    const parsed = new URL(value, INTERNAL_ORIGIN);
    if (parsed.origin !== INTERNAL_ORIGIN) return fallback;
    if (parsed.username || parsed.password) return fallback;

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
