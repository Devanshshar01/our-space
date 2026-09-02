export default function OAuthDeniedPage() {
  return (
    <main style={styles.main}>
      <section style={styles.card}>
        <p className="eyebrow">Authorization unavailable</p>
        <h1 style={styles.title}>Create or join a Couple Space first.</h1>
        <p style={styles.copy}>
          This application can only connect accounts that belong to a valid Couple Space.
        </p>
      </section>
    </main>
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
};
