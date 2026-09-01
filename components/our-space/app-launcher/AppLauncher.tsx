'use client';

import { useState, useEffect } from 'react';
import AppCard from './AppCard';

interface AppLauncherProps {
  canvasUrl: string;
  notesUrl: string;
}

interface AppConfig {
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'available' | 'coming-soon';
  href: string;
}

const APP_DEFINITIONS: Array<Omit<AppConfig, 'href'>> = [
  {
    name: 'Canvas',
    description: 'Draw together in real time',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19l7-7 3 3-7 7-3-3z" />
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        <path d="M2 2l7.586 7.586" />
        <circle cx="11" cy="11" r="2" />
      </svg>
    ),
    status: 'available',
  },
  {
    name: 'Notes',
    description: 'Shared notes that sync instantly',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
      </svg>
    ),
    status: 'available',
  },
  {
    name: 'Tasks',
    description: 'Shared to-dos and reminders',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
    status: 'coming-soon',
  },
  {
    name: 'Calendar',
    description: 'Shared events and anniversaries',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    status: 'coming-soon',
  },
  {
    name: 'Letters',
    description: 'Love letters that last forever',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M2 4h20M2 20h20" />
        <line x1="8" y1="4" x2="8" y2="20" />
        <line x1="16" y1="4" x2="16" y2="20" />
      </svg>
    ),
    status: 'coming-soon',
  },
  {
    name: 'Games',
    description: 'Play together, apart',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    status: 'coming-soon',
  },
  {
    name: 'Virtual Room',
    description: 'Your shared digital space',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    status: 'coming-soon',
  },
  {
    name: 'Music',
    description: 'Your shared soundtrack',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
    status: 'coming-soon',
  },
];

function getApps(canvasUrl: string, notesUrl: string): AppConfig[] {
  return APP_DEFINITIONS.map((app) => {
    let href = '#';
    if (app.name === 'Canvas') {
      href = canvasUrl;
    } else if (app.name === 'Notes') {
      href = notesUrl;
    }
    return { ...app, href };
  });
}

export default function AppLauncher({ canvasUrl, notesUrl }: AppLauncherProps) {
  const [apps, setApps] = useState<AppConfig[]>(getApps(canvasUrl, notesUrl));

  useEffect(() => {
    setApps(getApps(canvasUrl, notesUrl));
  }, [canvasUrl, notesUrl]);

  return (
    <section style={styles.section} aria-label="Our stuff">
      <header style={styles.header}>
        <h2 style={styles.title}>Our stuff</h2>
      </header>
      <div style={styles.grid} role="list">
        {apps.map((app) => (
          <AppCard
            key={app.name}
            name={app.name}
            description={app.description}
            icon={app.icon}
            href={app.href}
            status={app.status}
            external={app.status === 'available'}
          />
        ))}
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '1rem',
  },
};
