import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth/server';
import { createInvitation } from '@/lib/couple-space/service';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const baseUrl = process.env.BETTER_AUTH_URL || new URL(request.url).origin;
  const result = await createInvitation(session.user.id, baseUrl);

  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 409 });
  }

  return NextResponse.json({
    ok: true,
    invitation: {
      id: result.invitation.id,
      spaceId: result.invitation.spaceId,
      inviteUrl: result.invitation.inviteUrl,
      expiresAt: result.invitation.expiresAt.toISOString(),
    },
  });
}