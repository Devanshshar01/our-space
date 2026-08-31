import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth/server';
import { createCoupleSpace } from '@/lib/couple-space/service';
import { validateAnniversaryDate, validateCustomName } from '@/lib/couple-space/validation';

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

  const customNameResult = validateCustomName(obj.customName);
  if (!customNameResult.ok) {
    return NextResponse.json({ error: customNameResult.error }, { status: 400 });
  }

  const anniversaryResult = validateAnniversaryDate(obj.anniversaryDate);
  if (!anniversaryResult.ok) {
    return NextResponse.json({ error: anniversaryResult.error }, { status: 400 });
  }

  const result = await createCoupleSpace(session.user.id, {
    customName: customNameResult.value,
    anniversaryDate: anniversaryResult.value,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 409 });
  }

  return NextResponse.json({ ok: true, spaceId: result.spaceId });
}