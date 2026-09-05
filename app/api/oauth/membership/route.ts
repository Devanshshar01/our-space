import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getCurrentCoupleSpace } from '@/lib/couple-space/service';
import { getAuthIssuer } from '@/lib/auth/config';
import { db, sqlClient } from '@/lib/db';
import { oauthAccessToken } from '@/lib/db/schema';

const allowedClients = new Set(['canvas', 'notes']);

export const runtime = 'nodejs';

function getBearerToken(request: Request): string | null {
  const header = request.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) return null;
  const token = header.slice('Bearer '.length).trim();
  return token || null;
}

function maskToken(token: string): string {
  if (token.length <= 6) return '***';
  return token.slice(0, 3) + '…' + token.slice(-3);
}

export async function GET(request: Request) {
  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let tokenRows: Array<{
    userId: string | null;
    expiresAt: Date;
    clientId: string;
  }>;
  try {
    tokenRows = await db
      .select({
        userId: oauthAccessToken.userId,
        expiresAt: oauthAccessToken.expiresAt,
        clientId: oauthAccessToken.clientId,
      })
      .from(oauthAccessToken)
      .where(eq(oauthAccessToken.token, token))
      .limit(1);
  } catch (err) {
    console.error(
      '[membership] oauth_access_token lookup threw:',
      err instanceof Error ? err.message : String(err),
    );
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }

  const tokenRecord = tokenRows[0];
  if (!tokenRecord) {
    let dbIdentity: string | null = null;
    try {
      const r = await sqlClient`SELECT current_database() AS db`;
      dbIdentity = r[0]?.db ?? null;
    } catch {}
    console.warn(
      '[membership] no oauth_access_token row found for token',
      maskToken(token),
      'db=',
      dbIdentity,
    );
    return NextResponse.json({ error: 'Unauthorized', db: dbIdentity }, { status: 401 });
  }
  if (!tokenRecord.userId) {
    console.warn(
      '[membership] token has no userId for token',
      maskToken(token),
    );
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (tokenRecord.expiresAt.getTime() <= Date.now()) {
    console.warn(
      '[membership] token expired for clientId=',
      tokenRecord.clientId,
      'expiresAt=',
      tokenRecord.expiresAt.toISOString(),
    );
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!allowedClients.has(tokenRecord.clientId)) {
    console.warn(
      '[membership] disallowed clientId=',
      tokenRecord.clientId,
    );
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let membership;
  try {
    membership = await getCurrentCoupleSpace(tokenRecord.userId);
  } catch (err) {
    console.error(
      '[membership] getCurrentCoupleSpace threw:',
      err instanceof Error ? err.message : String(err),
    );
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }

  if (!membership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let dbIdentity: string | null = null;
  try {
    const r = await sqlClient`SELECT current_database() AS db`;
    dbIdentity = r[0]?.db ?? null;
  } catch {}

  return NextResponse.json({
    sub: tokenRecord.userId,
    issuer: getAuthIssuer(),
    db: dbIdentity,
    membership: {
      active: true,
      coupleSpaceId: membership.space.id,
    },
  });
}