'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateSpacePage() {
  const router = useRouter();
  const [customName, setCustomName] = useState('');
  const [anniversaryDate, setAnniversaryDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/couple-space/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customName: customName.trim() || null,
          anniversaryDate: anniversaryDate || null,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; spaceId?: string; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error || 'Failed to create space');
        setLoading(false);
        return;
      }
      router.push('/onboard/pending');
      router.refresh();
    } catch {
      setError('Unexpected error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <main className="centered-shell" style={styles.main}>
      <div className="auth-card" style={styles.card}>
        <header className="centered-heading" style={styles.header}>
          <p className="eyebrow">Make it ours</p>
          <h1 style={styles.title}>Create our space.</h1>
          <p style={styles.subtitle}>Both fields are optional. We can change them later.</p>
        </header>

        {error && <div className="error-message" style={styles.error} role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="form-stack" style={styles.form} noValidate>
          <div style={styles.field}>
            <label htmlFor="customName" style={styles.label}>
              Space name (optional)
            </label>
            <input
              type="text"
              id="customName"
              name="customName"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="The Garcia-Browns"
              maxLength={80}
              disabled={loading}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="anniversaryDate" style={styles.label}>
              Anniversary date (optional)
            </label>
            <input
              type="date"
              id="anniversaryDate"
              name="anniversaryDate"
              value={anniversaryDate}
              onChange={(e) => setAnniversaryDate(e.target.value)}
              disabled={loading}
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Creating…' : 'Create our space'}
          </button>
        </form>
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
    width: '100%',
    maxWidth: '420px',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '16px',
    padding: 'clamp(1.5rem, 4vw, 2.5rem)',
  },
  header: {
    textAlign: 'center',
    marginBottom: 'clamp(1.5rem, 4vw, 2rem)',
  },
  title: {
    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
    fontWeight: 300,
    letterSpacing: '-0.02em',
    color: 'var(--color-foreground)',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
    color: 'var(--color-muted)',
  },
  error: {
    backgroundColor: 'var(--color-error-bg)',
    border: '1px solid var(--color-error-border)',
    color: 'var(--color-error)',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
    marginBottom: '1rem',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--color-foreground)',
  },
  input: {
    fontSize: '1rem',
    padding: '0.75rem 1rem',
    backgroundColor: 'var(--color-background)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    color: 'var(--color-foreground)',
    outline: 'none',
    transition: 'border-color 0.15s ease',
    minHeight: '48px',
  },
  button: {
    marginTop: '0.5rem',
    padding: '0.875rem 1.5rem',
    fontSize: '1rem',
    fontWeight: 500,
    color: 'var(--color-background)',
    backgroundColor: 'var(--color-accent)',
    border: 'none',
    borderRadius: '9999px',
    cursor: 'pointer',
    minHeight: '48px',
  },
};
