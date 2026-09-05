import { NextResponse } from 'next/server';
import postgres from 'postgres';
import { getCurrentCoupleSpace } from '@/lib/couple-space/service';
import { getAuthIssuer } from '@/lib/auth/config';
import { sqlClient } from '@/lib/db';

const allowedClients = new Set(['canvas', 'notes']);

export const runtime = 'nodejs';

function getBearerToken(request: Request): string | null {
  const header = request.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) return null;
  const token = header.slice('Bearer '.length).trim();
  return token || null;
}

async function lookupTokenDirect(token: string): Promise<{
  userId: string | null;
  expiresAt: Date | null;
  clientId: string | null;
  db: string | null;
  host: string | null;
} | null> {
  const connectionString = process.env['DATABASE_URL']?.replace(
    'sslmode=require',
    'sslmode=verify-full',
  );
  if (!connectionString) return null;
  const client = postgres(connectionString, { max: 1, idle_timeout: 5, prepare: false });
  try {
    const r = await client<
      { user_id: string | null; expires_at: Date; client_id: string; db: string; host: string }[]
    >`
      SELECT user_id, expires_at, client_id,
             current_database() AS db,
             inet_server_addr()::text AS host
        FROM oauth_access_token
       WHERE token = ${token}
       LIMIT 1
    `;
    if (r.length === 0) {
      return { userId: null, expiresAt: null, clientId: null, db: null, host: null };
    }
    const row = r[0]!;
    return {
      userId: row.user_id,
      expiresAt: new Date(row.expires_at),
      clientId: row.client_id,
      db: row.db,
      host: row.host,
    };
  } finally {
    await client.end();
  }
}

export async function GET(request: Request) {
  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let row: Awaited<ReturnType<typeof lookupTokenDirect>>;
  try {
    row = await lookupTokenDirect(token);
  } catch (err) {
    console.error(
      '[membership] direct oauth_access_token lookup threw:',
      err instanceof Error ? err.message : String(err),
    );
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }

  if (!row || !row.userId || !row.clientId || !row.expiresAt) {
    let dbIdentity: Record<string, string | null> = { db: row?.db ?? null, host: row?.host ?? null };
    try {
      const r = await sqlClient`SELECT current_database() AS db, inet_server_addr()::text AS host`;
      dbIdentity = { db: r[0]?.db ?? null, host: r[0]?.host ?? null };
    } catch {}
    const incomingFingerprint = require('node:crypto')
      .createHash('sha256')
      .update(token)
      .digest('hex')
      .slice(0, 16);
    console.warn(
      '[TOKEN_FINGERPRINT_OURSPACE]',
      JSON.stringify({
        source: 'our-space/oauth/membership',
        fingerprint: incomingFingerprint,
        tokenLength: token.length,
        rowFound: false,
        db: dbIdentity,
      }),
    );
    return NextResponse.json({ error: 'Unauthorized', db: dbIdentity, fingerprint: incomingFingerprint }, { status: 401 });
  }
  const incomingFingerprint = require('node:crypto')
    .createHash('sha256')
    .update(token)
    .digest('hex')
    .slice(0, 16);
  console.warn(
    '[TOKEN_FINGERPRINT_OURSPACE]',
    JSON.stringify({
      source: 'our-space/oauth/membership',
      fingerprint: incomingFingerprint,
      tokenLength: token.length,
      rowFound: true,
      clientId: row.clientId,
      userId: row.userId,
      expiresAt: row.expiresAt.toISOString(),
      db: { db: row.db, host: row.host },
    }),
  );
  if (row.expiresAt.getTime() <= Date.now()) {
    console.warn(
      '[membership] token expired for clientId=',
      row.clientId,
      'expiresAt=',
      row.expiresAt.toISOString(),
    );
    return NextResponse.json({ error: 'Unauthorized', fingerprint: incomingFingerprint, clientId: row.clientId, expiresAt: row.expiresAt.toISOString() }, { status: 401 });
  }
  if (!allowedClients.has(row.clientId)) {
    console.warn(
      '[membership] disallowed clientId=',
      row.clientId,
    );
    return NextResponse.json({ error: 'Unauthorized', fingerprint: incomingFingerprint, clientId: row.clientId }, { status: 401 });
  }

  let membership;
  try {
    membership = await getCurrentCoupleSpace(row.userId);
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

  return NextResponse.json({
    sub: row.userId,
    issuer: getAuthIssuer(),
    db: { db: row.db, host: row.host },
    membership: {
      active: true,
      coupleSpaceId: membership.space.id,
    },
  });
}