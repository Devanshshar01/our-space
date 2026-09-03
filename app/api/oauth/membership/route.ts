import { NextResponse } from 'next/server';
import { getCurrentCoupleSpace } from '@/lib/couple-space/service';
import { getAuthIssuer } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { oauthAccessToken } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const clients = ['canvas', 'notes'];

export const runtime = 'nodejs';

function getBearerToken(request: Request): string | null {
  const header = request.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) return null;
  const token = header.slice('Bearer '.length).trim();
  return token || null;
}

export async function GET(request: Request) {
  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const tokens = await db
      .select({ userId: oauthAccessToken.userId, expiresAt: oauthAccessToken.expiresAt, clientId: oauthAccessToken.clientId })
      .from(oauthAccessToken)
      .where(eq(oauthAccessToken.token, token))
      .limit(1);

    const tokenRecord = tokens[0];

    if (!tokenRecord || !tokenRecord.userId || tokenRecord.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!clients.includes(tokenRecord.clientId)) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const membership = await getCurrentCoupleSpace(tokenRecord.userId);
    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      sub: tokenRecord.userId,
      issuer: getAuthIssuer(),
      membership: {
        active: true,
        coupleSpaceId: membership.space.id,
      },
    });
  } catch (err) {
    console.error('[membership] token lookup failed:', err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}