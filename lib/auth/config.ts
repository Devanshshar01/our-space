const DEFAULT_LOCAL_ORIGIN = 'http://localhost:3000';
const DEFAULT_PRODUCTION_ORIGIN = 'https://our-space-woad.vercel.app';

function normalizeOrigin(value: string): string {
  const url = new URL(value);
  return url.origin;
}

export function getAuthOrigin(): string {
  const configuredOrigin = process.env.BETTER_AUTH_URL;
  if (configuredOrigin) return normalizeOrigin(configuredOrigin);
  return normalizeOrigin(
    process.env.NODE_ENV === 'production'
      ? DEFAULT_PRODUCTION_ORIGIN
      : DEFAULT_LOCAL_ORIGIN,
  );
}

export function getAuthIssuer(): string {
  return getAuthOrigin();
}
