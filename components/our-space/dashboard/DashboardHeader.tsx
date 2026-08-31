'use client';

import Link from 'next/link';

interface DashboardHeaderProps {
  spaceName: string | null;
  currentUserName: string;
  partnerName: string | null;
}

export default function DashboardHeader({ spaceName, currentUserName, partnerName }: DashboardHeaderProps) {
  const displayName = spaceName || 'Our Space';

  return (
    <header style={styles.header} role="banner">
      <div style={styles.left}>
        <p style={styles.eyebrow}>Our Space</p>
        <h1 style={styles.title}>{displayName}</h1>
      </div>
      <div style={styles.right}>
        <p style={styles.coupleNames}>
          <span style={styles.you}>{currentUserName}</span>
          {partnerName && <span style={styles.separator}> & </span>}
          {partnerName && <span style={styles.partner}>{partnerName}</span>}
        </p>
        <Link href="/dashboard/settings" style={styles.settingsLink} aria-label="Settings">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </Link>
      </div>
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1rem, 3vw, 1.5rem)',
    backgroundColor: 'var(--color-surface)',
    borderBottom: '1px solid var(--color-border)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  left: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.125rem',
  },
  eyebrow: {
    fontSize: '0.6rem',
    letterSpacing: '0.25em',
    textTransform: 'uppercase',
    color: 'var(--color-muted)',
    margin: 0,
  },
  title: {
    fontSize: 'clamp(1.125rem, 3vw, 1.375rem)',
    fontWeight: 300,
    letterSpacing: '-0.02em',
    color: 'var(--color-foreground)',
    margin: 0,
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  coupleNames: {
    fontSize: '0.875rem',
    color: 'var(--color-foreground)',
    whiteSpace: 'nowrap',
  },
  you: {
    fontWeight: 500,
  },
  separator: {
    color: 'var(--color-muted)',
  },
  partner: {},
  settingsLink: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-background)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-foreground)',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease, border-color 0.15s ease',
  },
};