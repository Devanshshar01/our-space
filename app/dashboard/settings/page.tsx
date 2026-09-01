import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth/server';
import { getCurrentCoupleSpace } from '@/lib/couple-space/service';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await getAuthSession();
  if (!session) {
    redirect('/login?redirect=/dashboard/settings');
  }

  const view = await getCurrentCoupleSpace(session.user.id);

  return (
    <main className="centered-shell settings-shell" style={styles.main}>
      <div style={styles.container}>
        <header className="centered-heading" style={styles.header}>
          <Link href="/dashboard" style={styles.backLink}>← Back</Link>
          <h1 style={styles.title}>Settings</h1>
          <p style={styles.subtitle}>
            The quiet details about this little place.
          </p>
        </header>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Account</h2>
          <div style={styles.row}>
            <span style={styles.label}>Name</span>
            <span style={styles.value}>{session.user.name}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Email</span>
            <span style={styles.value}>{session.user.email}</span>
          </div>
        </section>

        {view && (
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Space</h2>
            <div style={styles.row}>
              <span style={styles.label}>Space name</span>
              <span style={styles.value}>{view.space.customName || 'Our Space'}</span>
            </div>
            {view.space.anniversaryDate && (
              <div style={styles.row}>
                <span style={styles.label}>Anniversary</span>
                <span style={styles.value}>{view.space.anniversaryDate}</span>
              </div>
            )}
          </section>
        )}

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Coming next</h2>
          <ul style={styles.list}>
            <li>Edit space name and anniversary</li>
            <li>Change your display name</li>
            <li>Manage your session</li>
          </ul>
        </section>

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
    padding: 'clamp(1.5rem, 4vw, 2rem) clamp(1rem, 3vw, 1.5rem)',
    paddingBottom: 'clamp(5rem, 10vh, 6rem)',
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
  },
  header: {
    marginBottom: 'clamp(1.5rem, 4vw, 2.5rem)',
  },
  backLink: {
    display: 'inline-block',
    color: 'var(--color-muted)',
    fontSize: '0.875rem',
    textDecoration: 'none',
    marginBottom: '1rem',
  },
  title: {
    fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
    fontWeight: 300,
    letterSpacing: '-0.02em',
    color: 'var(--color-foreground)',
    margin: '0 0 0.5rem',
  },
  subtitle: {
    fontSize: 'clamp(0.9rem, 2vw, 1rem)',
    color: 'var(--color-muted)',
    margin: 0,
  },
  section: {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontSize: '0.7rem',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: 'var(--color-muted)',
    margin: '0 0 1rem',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 0',
    borderBottom: '1px solid var(--color-border)',
  },
  label: {
    fontSize: '0.9rem',
    color: 'var(--color-muted)',
  },
  value: {
    fontSize: '0.9rem',
    color: 'var(--color-foreground)',
    fontWeight: 500,
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  footer: {
    textAlign: 'center',
    marginTop: '2rem',
  },
  signOutButton: {
    padding: '0.75rem 2rem',
    fontSize: '0.95rem',
    fontWeight: 500,
    color: 'var(--color-foreground)',
    backgroundColor: 'transparent',
    border: '1px solid var(--color-border)',
    borderRadius: '9999px',
    cursor: 'pointer',
    minHeight: '44px',
  },
};
