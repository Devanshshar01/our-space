import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth/server';
import { getCurrentCoupleSpace } from '@/lib/couple-space/service';

export const dynamic = 'force-dynamic';

export default async function OnboardPage() {
  const session = await getAuthSession();
  if (!session) {
    redirect('/login?redirect=/onboard');
  }

  const view = await getCurrentCoupleSpace(session.user.id);

  if (view) {
    if (view.status === 'ACTIVE') {
      redirect('/dashboard');
    }
    if (view.status === 'PENDING') {
      redirect('/onboard/pending');
    }
  }

  return (
    <main className="centered-shell" style={styles.main}>
      <div style={styles.container}>
        <header className="centered-heading" style={styles.header}>
          <p className="eyebrow" style={styles.eyebrow}>A place for us</p>
          <h1 style={styles.title}>Make a space for us.</h1>
          <p style={styles.subtitle}>
            Hi {session.user.name}. How should we start?
          </p>
        </header>

        <div style={styles.options}>
          <Link href="/onboard/create" style={styles.option}>
            <div style={styles.optionHeader}>
              <h2 style={styles.optionTitle}>Create our space</h2>
              <p style={styles.optionDescription}>
                Start fresh, then invite your person in.
              </p>
            </div>
            <span style={styles.arrow} aria-hidden="true">→</span>
          </Link>

          <Link href="/join" style={styles.option}>
            <div style={styles.optionHeader}>
              <h2 style={styles.optionTitle}>Join with an invite</h2>
              <p style={styles.optionDescription}>
                Use the link they sent you.
              </p>
            </div>
            <span style={styles.arrow} aria-hidden="true">→</span>
          </Link>
        </div>

        <div style={styles.footer}>
          <form action="/api/auth/sign-out" method="POST">
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
  container: {
    width: '100%',
    maxWidth: '480px',
  },
  header: {
    textAlign: 'center',
    marginBottom: 'clamp(2rem, 5vw, 2.5rem)',
  },
  eyebrow: {
    fontSize: '0.75rem',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: 'var(--color-muted)',
    marginBottom: '0.75rem',
  },
  title: {
    fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
    fontWeight: 300,
    letterSpacing: '-0.02em',
    color: 'var(--color-foreground)',
    marginBottom: '0.75rem',
  },
  subtitle: {
    fontSize: 'clamp(1rem, 2.5vw, 1.125rem)',
    color: 'var(--color-muted)',
    lineHeight: 1.5,
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: 'clamp(2rem, 5vw, 2.5rem)',
  },
  option: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 'clamp(1.25rem, 3vw, 1.5rem)',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '16px',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'border-color 0.15s ease, transform 0.1s ease',
    minHeight: '88px',
  },
  optionHeader: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 'clamp(1.125rem, 3vw, 1.25rem)',
    fontWeight: 500,
    color: 'var(--color-foreground)',
    marginBottom: '0.25rem',
  },
  optionDescription: {
    fontSize: '0.9rem',
    color: 'var(--color-muted)',
    lineHeight: 1.5,
  },
  arrow: {
    fontSize: '1.5rem',
    color: 'var(--color-muted)',
    marginLeft: '1rem',
  },
  footer: {
    textAlign: 'center',
  },
  signOutButton: {
    padding: '0.5rem 1.25rem',
    fontSize: '0.875rem',
    color: 'var(--color-muted)',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
};
