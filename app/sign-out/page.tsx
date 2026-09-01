'use client';

import { useEffect, useState } from 'react';

export default function SignOutPage() {
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function doSignOut() {
      try {
        const res = await fetch('/api/auth/sign-out', { method: 'POST' });
        if (!res.ok) {
          setError('Sign out failed');
          return;
        }
        window.location.href = '/';
      } catch {
        setError('Sign out failed');
      }
    }
    doSignOut();
  }, []);

  return (
    <main className="centered-shell" style={styles.main}>
      <div style={styles.card}>
        <h1 style={styles.title}>Signing you out…</h1>
        {error && <p style={styles.error} role="alert">{error}</p>}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: '100dvh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'clamp(1.5rem, 5vh, 3rem) clamp(1rem, 5vw, 2rem)',
  },
  card: {
    textAlign: 'center',
    color: 'var(--color-muted)',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 400,
    color: 'var(--color-foreground)',
    marginBottom: '1rem',
  },
  error: {
    color: '#dc3545',
    fontSize: '0.9rem',
  },
};
