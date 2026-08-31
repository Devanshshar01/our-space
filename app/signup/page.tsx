'use client';

import { Suspense } from 'react';
import SignupForm from './SignupForm';

export default function SignupPage() {
  return (
    <Suspense fallback={<div style={styles.loading}>Loading…</div>}>
      <SignupForm />
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