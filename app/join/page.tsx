import { Suspense } from 'react';
import JoinClient from './JoinClient';

export const dynamic = 'force-dynamic';

export default function JoinPage() {
  return (
    <Suspense fallback={<div style={styles.loading}>Loading…</div>}>
      <JoinClient />
    </Suspense>
  );
}

const styles: Record<string, React.CSSProperties> = {
  loading: {
    minHeight: '100dvh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-muted)',
  },
};