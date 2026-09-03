import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { oauthProvider } from '@better-auth/oauth-provider';
import { jwt } from 'better-auth/plugins';
import { db } from '@/lib/db';
import { getCurrentCoupleSpace } from '@/lib/couple-space/service';
import { getAuthIssuer, getAuthOrigin } from './config';

const firstPartyClientIds = new Set(['canvas', 'notes']);

export const auth = betterAuth({
  baseURL: getAuthOrigin(),
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      path: '/',
    },
  },
  trustedOrigins: [
    getAuthOrigin(),
    process.env.NEXT_PUBLIC_CANVAS_APP_URL || 'http://localhost:3001',
    process.env.NEXT_PUBLIC_NOTES_APP_URL || 'http://localhost:3002',
    'https://widget-woad-nine.vercel.app',
    'https://notes-rust-five.vercel.app',
  ],
  plugins: [
    jwt({
      jwt: {
        issuer: getAuthIssuer(),
      },
      jwks: {
        keyPairConfig: { alg: 'RS256' },
      },
    }),
    oauthProvider({
      scopes: ['openid', 'profile', 'email'],
      grantTypes: ['authorization_code'],
      loginPage: '/login',
      consentPage: '/oauth/consent',
      allowDynamicClientRegistration: false,
      allowUnauthenticatedClientRegistration: false,
      cachedTrustedClients: firstPartyClientIds,
      postLogin: {
        page: '/oauth/denied',
        shouldRedirect: async ({ user }) => (await getCurrentCoupleSpace(user.id)) === null,
        consentReferenceId: async () => undefined,
      },
    }),
  ],
});
