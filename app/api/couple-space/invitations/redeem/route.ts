import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth/server';
import { redeemInvitation } from '@/lib/couple-space/service';
import { validateInvitationCode } from '@/lib/couple-space/validation';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized', errorCode: 'UNAUTHORIZED' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body', errorCode: 'INVALID_BODY' }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Invalid request body', errorCode: 'INVALID_BODY' }, { status: 400 });
  }

  const obj = body as Record<string, unknown>;

  const codeResult = validateInvitationCode(obj.code);
  if (!codeResult.ok) {
    return NextResponse.json({ error: codeResult.error, errorCode: 'INVALID_CODE' }, { status: 400 });
  }

  const result = await redeemInvitation(session.user.id, codeResult.value);

  if (!result.ok) {
    // Map internal reasons to stable error codes
    const errorCode = mapReasonToErrorCode(result.reason);
    return NextResponse.json({ error: result.reason, errorCode }, { status: 409 });
  }

  return NextResponse.json({ ok: true, spaceId: result.spaceId });
}

function mapReasonToErrorCode(reason: string): string {
  switch (reason) {
    case 'Invitation not found':
      return 'INVITATION_NOT_FOUND';
    case 'Invitation already used':
      return 'INVITATION_ALREADY_USED';
    case 'Invitation revoked':
      return 'INVITATION_REVOKED';
    case 'Invitation expired':
      return 'INVITATION_EXPIRED';
    case 'Invitation not valid':
      return 'INVITATION_INVALID';
    case 'You cannot use your own invitation':
      return 'SELF_JOIN';
    case 'You already belong to a space':
      return 'ALREADY_IN_SPACE';
    case 'Space not found':
      return 'SPACE_NOT_FOUND';
    case 'Space is no longer pending':
      return 'SPACE_NOT_PENDING';
    case 'Space is already full':
      return 'SPACE_FULL';
    default:
      return 'CONFLICT';
  }
}