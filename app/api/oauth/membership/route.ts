import { verifyAccessToken } from 'better-auth/oauth2';
import { NextResponse } from 'next/server';
import { getCurrentCoupleSpace } from '@/lib/couple-space/service';
import { getAuthIssuer } from '@/lib/auth/config';

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
    const payload = await verifyAccessToken(token, {
      jwksUrl: `${getAuthIssuer()}/api/auth/jwks`,
      verifyOptions: {
        issuer: getAuthIssuer(),
        audience: clients,
      },
    });

    if (typeof payload.sub !== 'string' || !payload.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const membership = await getCurrentCoupleSpace(payload.sub);
    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      sub: payload.sub,
      issuer: getAuthIssuer(),
      membership: {
        active: true,
        coupleSpaceId: membership.space.id,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}