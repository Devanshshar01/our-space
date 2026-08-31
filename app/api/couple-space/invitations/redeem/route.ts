import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth/server';
import { redeemInvitation } from '@/lib/couple-space/service';
import { validateInvitationCode } from '@/lib/couple-space/validation';

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

  const codeResult = validateInvitationCode(obj.code);
  if (!codeResult.ok) {
    return NextResponse.json({ error: codeResult.error }, { status: 400 });
  }

  const result = await redeemInvitation(session.user.id, codeResult.value);

  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 409 });
  }

  return NextResponse.json({ ok: true, spaceId: result.spaceId });
}