import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function getAuthSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

export async function getCurrentUser() {
  const session = await getAuthSession();
  if (!session) return null;
  return session.user;
}

export async function requireAuth() {
  const session = await getAuthSession();
  if (!session) {
    return { user: null, session: null, redirect: '/login' };
  }
  return { user: session.user, session: session.session, redirect: null };
}