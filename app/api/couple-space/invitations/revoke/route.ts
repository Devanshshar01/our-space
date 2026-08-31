import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth/server';
import { revokeInvitation } from '@/lib/couple-space/service';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const obj = body as Record<string, unknown>;
  const invitationId = obj.invitationId;
  if (typeof invitationId !== 'string' || invitationId.length === 0 || invitationId.length > 128) {
    return NextResponse.json({ error: 'Invalid invitationId' }, { status: 400 });
  }

  const result = await revokeInvitation(session.user.id, invitationId);
  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}