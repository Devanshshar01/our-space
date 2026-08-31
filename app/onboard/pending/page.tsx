import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth/server';
import { getCurrentCoupleSpace } from '@/lib/couple-space/service';
import PendingSpaceClient from './PendingClient';

export const dynamic = 'force-dynamic';

export default async function PendingPage() {
  const session = await getAuthSession();
  if (!session) {
    redirect('/login?redirect=/onboard/pending');
  }

  const view = await getCurrentCoupleSpace(session.user.id);

  if (!view) {
    redirect('/onboard');
  }
  if (view.status === 'ACTIVE') {
    redirect('/dashboard');
  }

  return <PendingSpaceClient />;
}