'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { authClient } from '@/lib/auth/client';

function ConsentForm() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get('client_id') ?? 'this application';
  const scope = searchParams.get('scope') ?? '';
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const accept = async () => {
    setLoading(true);
    setError('');
    const result = await authClient.oauth2.consent({
      accept: true,
      scope: scope || undefined,
    });
    if (result.error) {
      setError(result.error.message || 'Authorization could not be completed.');
      setLoading(false);
    }
  };

  return (
    <main style={styles.main}>
      <section style={styles.card}>
        <p className="eyebrow">Permission request</p>
        <h1 style={styles.title}>Connect {clientId}?</h1>
        <p style={styles.copy}>
          This application is requesting: {scope || 'your Couple Space account'}.
        </p>
        {error && <p role="alert" style={styles.error}>{error}</p>}
        <button type="button" onClick={accept} disabled={loading} style={styles.button}>
          {loading ? 'Connecting…' : 'Allow access'}
        </button>
      </section>
    </main>
  );
}

export default function OAuthConsentPage() {
  return (
    <Suspense fallback={<main style={styles.main}>Loading…</main>}>
      <ConsentForm />
    </Suspense>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: '100dvh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  card: {
    width: '100%',
    maxWidth: '32rem',
    padding: '2rem',
    border: '1px solid var(--color-border)',
    borderRadius: '16px',
    backgroundColor: 'var(--color-surface)',
  },
  title: {
    margin: '0.5rem 0',
    color: 'var(--color-foreground)',
    fontSize: '1.75rem',
    fontWeight: 400,
  },
  copy: {
    color: 'var(--color-muted)',
    lineHeight: 1.6,
  },
  error: { color: 'var(--color-error)' },
  button: {
    marginTop: '1rem',
    padding: '0.875rem 1.5rem',
    border: 'none',
    borderRadius: '9999px',
    color: 'var(--color-background)',
    backgroundColor: 'var(--color-accent)',
    cursor: 'pointer',
  },
};
