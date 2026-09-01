'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function extractCodeFromInput(input: string): string {
  const trimmed = input.trim();
  // If input looks like a URL with code parameter, extract it
  try {
    const url = new URL(trimmed);
    const codeParam = url.searchParams.get('code');
    if (codeParam) return codeParam.trim();
  } catch {
    // Not a valid URL, use as-is
  }
  return trimmed;
}

export default function JoinClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeFromUrl = searchParams.get('code') || '';
  const [code, setCode] = useState(codeFromUrl);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (codeFromUrl) setCode(codeFromUrl);
  }, [codeFromUrl]);

  async function join() {
    setError('');
    const extractedCode = extractCodeFromInput(code);
    if (!extractedCode) {
      setError('Invitation code is required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/couple-space/invitations/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: extractedCode }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; errorCode?: string; spaceId?: string };
      if (!res.ok || !data.ok) {
        setError(mapErrorToMessage(data.error, data.errorCode));
        setLoading(false);
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Unexpected error');
      setLoading(false);
    }
  }

  function mapErrorToMessage(error?: string, errorCode?: string): string {
    // Use error code for precise mapping, fall back to error message
    switch (errorCode) {
      case 'INVITATION_NOT_FOUND':
        return 'Invitation not found. Please check the link or code.';
      case 'INVITATION_ALREADY_USED':
        return 'This invitation has already been used.';
      case 'INVITATION_REVOKED':
        return 'This invitation has been revoked.';
      case 'INVITATION_EXPIRED':
        return 'This invitation has expired. Please ask your partner for a new one.';
      case 'INVITATION_INVALID':
        return 'Invalid invitation. Please check the link or code.';
      case 'SELF_JOIN':
        return 'You cannot use your own invitation.';
      case 'ALREADY_IN_SPACE':
        return 'You already belong to a Couple Space.';
      case 'SPACE_NOT_FOUND':
        return 'Couple Space not found.';
      case 'SPACE_NOT_PENDING':
        return 'This Couple Space is no longer accepting invitations.';
      case 'SPACE_FULL':
        return 'This Couple Space is already full.';
      case 'INVALID_CODE':
        return 'Invalid invitation code format.';
      case 'UNAUTHORIZED':
        return 'Please sign in to join a space.';
      case 'INVALID_BODY':
        return 'Invalid request. Please try again.';
      default:
        return error || 'Failed to join. Please try again.';
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await join();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    setCode(extractCodeFromInput(pasted));
  };

  return (
    <main className="centered-shell" style={styles.main}>
      <div style={styles.card}>
        <header className="centered-heading" style={styles.header}>
          <p className="eyebrow">An invitation</p>
          <h1 style={styles.title}>Come find us.</h1>
          <p style={styles.subtitle}>Paste the invite link or code your partner shared.</p>
        </header>

        {error && <div className="error-message" style={styles.error} role="alert">{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <div style={styles.field}>
            <label htmlFor="code" style={styles.label}>
              Invite link or code
            </label>
            <textarea
              id="code"
              name="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onPaste={handlePaste}
              placeholder="https://…/join?code=…  or paste the code"
              required
              disabled={loading}
              style={styles.textarea}
              rows={4}
              maxLength={1024}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Joining…' : 'Join space'}
          </button>
        </form>

        <p style={styles.footer}>
          Need to create your own?{' '}
          <Link href="/onboard/create" style={styles.link}>Create one</Link>
        </p>
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
    maxWidth: '440px',
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
    fontSize: 'clamp(0.9rem, 2vw, 1rem)',
    color: 'var(--color-muted)',
  },
  error: {
    backgroundColor: 'rgba(220, 53, 69, 0.15)',
    border: '1px solid rgba(220, 53, 69, 0.3)',
    color: '#dc3545',
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
  textarea: {
    fontSize: '1rem',
    padding: '0.75rem 1rem',
    backgroundColor: 'var(--color-background)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    color: 'var(--color-foreground)',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
    minHeight: '96px',
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
  footer: {
    marginTop: '1.5rem',
    textAlign: 'center',
    fontSize: '0.9rem',
    color: 'var(--color-muted)',
  },
  link: {
    color: 'var(--color-accent)',
    fontWeight: 500,
    textDecoration: 'none',
  },
};
