import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth/server';
import { setMood, clearMood, validateMood, validateMoodMessage } from '@/lib/couple-space/mood';

export const runtime = 'nodejs';

export async function PUT(request: NextRequest) {
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

  // Check if this is a clear request (no mood provided)
  if (!obj.mood && obj.clear === true) {
    const result = await clearMood(session.user.id);
    if (!result.ok) {
      return NextResponse.json({ error: result.reason }, { status: 409 });
    }
    return NextResponse.json({ ok: true });
  }

  const moodValidation = validateMood(obj.mood);
  if (!moodValidation.ok) {
    return NextResponse.json({ error: moodValidation.error }, { status: 400 });
  }

  const messageValidation = validateMoodMessage(obj.message);
  if (!messageValidation.ok) {
    return NextResponse.json({ error: messageValidation.error }, { status: 400 });
  }

  const result = await setMood(session.user.id, {
    mood: moodValidation.value,
    message: messageValidation.value,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 409 });
  }

  return NextResponse.json({ ok: true, mood: result.mood });
}