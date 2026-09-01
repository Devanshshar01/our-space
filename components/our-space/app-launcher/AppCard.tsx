'use client';

import Link from 'next/link';

interface AppCardProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  status: 'available' | 'coming-soon';
  external?: boolean;
}

export default function AppCard({ name, description, icon, href, status, external = true }: AppCardProps) {
  const isComingSoon = status === 'coming-soon';

  return (
    <article className={`app-card${isComingSoon ? ' app-card-coming-soon' : ' app-card-available'}`} style={styles.card}>
      {isComingSoon && (
        <div style={styles.comingSoonBadge}>Coming soon</div>
      )}
      <div style={styles.iconWrapper} aria-hidden="true">
        {icon}
      </div>
      <h3 style={styles.name}>{name}</h3>
      <p style={styles.description}>{description}</p>
      {status === 'available' && (
        <Link
          href={href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
          style={styles.button}
        >
          Open
        </Link>
      )}
      {isComingSoon && (
        <button disabled style={styles.buttonDisabled}>
          Not available
        </button>
      )}
    </article>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    position: 'relative',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '16px',
    padding: 'clamp(1.25rem, 3vw, 1.5rem)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    minHeight: '180px',
    transition: 'border-color 0.15s ease, background-color 0.15s ease, transform 0.15s ease',
  },
  comingSoonBadge: {
    position: 'absolute',
    top: '0.75rem',
    right: '0.75rem',
    fontSize: '0.65rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--color-muted)',
    backgroundColor: 'var(--color-background)',
    border: '1px solid var(--color-border)',
    borderRadius: '9999px',
    padding: '0.2rem 0.5rem',
  },
  iconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: 'var(--color-background)',
    border: '1px solid var(--color-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-accent)',
  },
  name: {
    fontSize: '1.125rem',
    fontWeight: 500,
    color: 'var(--color-foreground)',
    margin: 0,
  },
  description: {
    fontSize: '0.875rem',
    color: 'var(--color-muted)',
    lineHeight: 1.5,
    margin: 0,
    flex: 1,
  },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--color-background)',
    backgroundColor: 'var(--color-accent)',
    border: 'none',
    borderRadius: '9999px',
    cursor: 'pointer',
    textDecoration: 'none',
    minHeight: '44px',
    transition: 'opacity 0.15s ease',
  },
  buttonDisabled: {
    padding: '0.625rem 1rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--color-muted)',
    backgroundColor: 'var(--color-background)',
    border: '1px solid var(--color-border)',
    borderRadius: '9999px',
    cursor: 'not-allowed',
    minHeight: '44px',
    opacity: 0.6,
  },
};
