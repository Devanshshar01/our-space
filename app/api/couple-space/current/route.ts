import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth/server';
import { getCurrentCoupleSpace } from '@/lib/couple-space/service';

export const runtime = 'nodejs';

export async function GET() {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const view = await getCurrentCoupleSpace(session.user.id);

  if (!view) {
    return NextResponse.json({
      hasSpace: false,
      space: null,
      members: [],
    });
  }

  return NextResponse.json({
    hasSpace: true,
    space: {
      id: view.space.id,
      status: view.status,
      customName: view.space.customName,
      anniversaryDate: view.space.anniversaryDate,
      createdAt: view.space.createdAt,
      updatedAt: view.space.updatedAt,
    },
    members: view.members.map((m) => ({
      userId: m.userId,
      name: m.name,
      email: m.email,
      image: m.image,
      joinedAt: m.joinedAt,
      isCurrentUser: m.isCurrentUser,
    })),
  });
}