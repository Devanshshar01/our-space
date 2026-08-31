import { getAuthSession } from '@/lib/auth/server';
import { getCurrentCoupleSpace, type CurrentSpaceView } from './service';

/**
 * Get the current Couple Space for the authenticated user.
 * If not authenticated, returns null.
 * If authenticated but has no space, returns null.
 */
export async function getCurrentSpace(): Promise<CurrentSpaceView | null> {
  const session = await getAuthSession();
  if (!session) return null;
  return await getCurrentCoupleSpace(session.user.id);
}

/**
 * Resolve the current Couple Space view AND verify authentication.
 * Returns null if unauthenticated or no space.
 */
export async function requireCurrentSpace(): Promise<{
  authenticated: true;
  view: CurrentSpaceView | null;
} | {
  authenticated: false;
  redirect: string;
}> {
  const session = await getAuthSession();
  if (!session) return { authenticated: false, redirect: '/login' };
  const view = await getCurrentCoupleSpace(session.user.id);
  return { authenticated: true, view };
}