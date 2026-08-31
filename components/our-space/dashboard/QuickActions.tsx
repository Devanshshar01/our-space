'use client';

import { useState, useEffect } from 'react';

function getUrls(): { canvas: string; notes: string } {
  return {
    canvas: process.env.NEXT_PUBLIC_CANVAS_APP_URL || 'http://localhost:3001',
    notes: process.env.NEXT_PUBLIC_NOTES_APP_URL || 'http://localhost:3002',
  };
}

export default function QuickActions() {
  const [urls, setUrls] = useState(getUrls);

  useEffect(() => {
    setUrls(getUrls());
  }, []);

  return (
    <section style={styles.section} aria-label="Quick actions">
      <header style={styles.header}>
        <h2 style={styles.title}>Quick actions</h2>
      </header>
      <div style={styles.actions} role="list">
        <a
          href={urls.canvas}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.action}
          role="listitem"
        >
          <span style={styles.icon} aria-hidden="true">🎨</span>
          <div style={styles.content}>
            <span style={styles.actionName}>Open Canvas</span>
            <span style={styles.actionDesc}>Start drawing</span>
          </div>
        </a>
        <a
          href={urls.notes}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.action}
          role="listitem"
        >
          <span style={styles.icon} aria-hidden="true">📝</span>
          <div style={styles.content}>
            <span style={styles.actionName}>Open Notes</span>
            <span style={styles.actionDesc}>Write a note</span>
          </div>
        </a>
        <button
          type="button"
          disabled
          style={styles.actionDisabled}
          aria-label="New Task (coming soon)"
          role="listitem"
        >
          <span style={styles.icon} aria-hidden="true">✅</span>
          <div style={styles.content}>
            <span style={styles.actionName}>New Task</span>
            <span style={styles.actionDesc}>Coming soon</span>
          </div>
        </button>
        <button
          type="button"
          disabled
          style={styles.actionDisabled}
          aria-label="New Event (coming soon)"
          role="listitem"
        >
          <span style={styles.icon} aria-hidden="true">📅</span>
          <div style={styles.content}>
            <span style={styles.actionName}>New Event</span>
            <span style={styles.actionDesc}>Coming soon</span>
          </div>
        </button>
      </div>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  section: {
    width: '100%',
  },
  header: {
    marginBottom: '1rem',
  },
  title: {
    fontSize: '0.75rem',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: 'var(--color-muted)',
    margin: 0,
  },
  actions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '0.75rem',
  },
  action: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '12px',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'background-color 0.15s ease, border-color 0.15s ease',
    minHeight: '64px',
  },
  actionDisabled: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '12px',
    color: 'var(--color-muted)',
    cursor: 'not-allowed',
    opacity: 0.6,
    minHeight: '64px',
    textAlign: 'left',
  },
  icon: {
    fontSize: '1.5rem',
    flexShrink: 0,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.125rem',
  },
  actionName: {
    fontSize: '0.9rem',
    fontWeight: 500,
    color: 'var(--color-foreground)',
  },
  actionDesc: {
    fontSize: '0.75rem',
    color: 'var(--color-muted)',
  },
};