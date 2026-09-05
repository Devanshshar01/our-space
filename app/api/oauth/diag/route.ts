import { NextResponse } from 'next/server';
import { sqlClient } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  let info: Record<string, string | null> = {};
  try {
    const r = await sqlClient`SELECT current_database() AS db, current_user AS usr, inet_server_addr()::text AS host, version() AS ver`;
    info = {
      db: r[0]?.db ?? null,
      user: r[0]?.usr ?? null,
      host: r[0]?.host ?? null,
      version: r[0]?.ver ?? null,
    };
  } catch (err) {
    return NextResponse.json(
      { error: 'db error', message: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
  return NextResponse.json(info);
}