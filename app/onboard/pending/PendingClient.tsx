'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Invite = {
  id: string;
  spaceId: string;
  inviteUrl: string;
  expiresAt: string;
};

export default function PendingSpaceClient() {
  const router = useRouter();
  const [invite, setInvite] = useState<Invite | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');

  async function generateInvite() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/couple-space/invitations', { method: 'POST' });
      const data = (await res.json()) as
        | { ok: true; invitation: Invite }
        | { ok?: undefined; error: string };
      if (!res.ok || !('invitation' in data)) {
        setError((data as { error: string }).error || 'Failed to create invitation');
      } else {
        setInvite(data.invitation);
      }
    } catch {
      setError('Unexpected error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!invite) return;
    const expires = invite.expiresAt;
    function tick() {
      const ms = new Date(expires).getTime() - Date.now();
      if (ms <= 0) {
        setTimeLeft('Expired');
        return;
      }
      const hours = Math.floor(ms / (60 * 60 * 1000));
      const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
      setTimeLeft(`${hours}h ${minutes}m`);
    }
    tick();
    const id = setInterval(tick, 60 * 1000);
    return () => clearInterval(id);
  }, [invite]);

  async function copy() {
    if (!invite) return;
    try {
      await navigator.clipboard.writeText(invite.inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Copy failed. Please copy manually.');
    }
  }

  async function share() {
    if (!invite) return;
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await (navigator as Navigator).share({
          title: 'Join our Couple Space',
          text: 'Use this link to join our private Couple Space.',
          url: invite.inviteUrl,
        });
      } catch {
        // user cancelled
      }
    } else {
      copy();
    }
  }

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <header style={styles.header}>
          <h1 style={styles.title}>Waiting for your partner</h1>
          <p style={styles.subtitle}>
            Your space is ready. Share the invite link with your partner.
          </p>
        </header>

        {error && <div style={styles.error} role="alert">{error}</div>}

        {!invite && (
          <button onClick={generateInvite} disabled={loading} style={styles.button}>
            {loading ? 'Generating…' : 'Generate invite link'}
          </button>
        )}

        {invite && (
          <div style={styles.inviteBlock}>
            <p style={styles.label}>Invite link</p>
            <div style={styles.urlBox}>
              <code style={styles.url}>{invite.inviteUrl}</code>
            </div>
            <p style={styles.expires}>
              <span aria-hidden="true">⏱</span> Expires in {timeLeft}
            </p>
            <div style={styles.actions}>
              <button onClick={copy} style={styles.button}>
                {copied ? 'Copied!' : 'Copy invite link'}
              </button>
              <button onClick={share} style={styles.buttonSecondary}>
                Share
              </button>
            </div>
          </div>
        )}

        <div style={styles.footer}>
          <button
            onClick={() => {
              router.push('/dashboard');
              router.refresh();
            }}
            style={styles.linkButton}
          >
            Refresh status
          </button>
          <form action="/api/auth/sign-out" method="POST" style={styles.inlineForm}>
            <button type="submit" style={styles.signOutButton}>
              Sign out
            </button>
          </form>
        </div>
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
    maxWidth: '480px',
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
    lineHeight: 1.5,
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
  button: {
    width: '100%',
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
  buttonSecondary: {
    width: '100%',
    padding: '0.875rem 1.5rem',
    fontSize: '1rem',
    fontWeight: 500,
    color: 'var(--color-foreground)',
    backgroundColor: 'transparent',
    border: '1px solid var(--color-border)',
    borderRadius: '9999px',
    cursor: 'pointer',
    minHeight: '48px',
  },
  inviteBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--color-foreground)',
    marginBottom: '0.25rem',
  },
  urlBox: {
    backgroundColor: 'var(--color-background)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    wordBreak: 'break-all',
    overflowWrap: 'break-word',
  },
  url: {
    fontSize: '0.85rem',
    color: 'var(--color-foreground)',
    fontFamily: 'inherit',
    lineHeight: 1.5,
  },
  expires: {
    fontSize: '0.85rem',
    color: 'var(--color-muted)',
    margin: 0,
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginTop: '0.5rem',
  },
  footer: {
    marginTop: 'clamp(1.5rem, 4vw, 2rem)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  linkButton: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    color: 'var(--color-muted)',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  inlineForm: {
    display: 'inline',
  },
  signOutButton: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    color: 'var(--color-muted)',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
};