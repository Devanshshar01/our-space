'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav style={styles.nav} aria-label="Primary navigation">
      <Link
        href="/dashboard"
        style={{
          ...styles.navLink,
          ...(pathname === '/dashboard' ? styles.navLinkActive : {}),
        }}
        aria-current={pathname === '/dashboard' ? 'page' : undefined}
      >
        Home
      </Link>
      <Link
        href="/dashboard#apps"
        style={styles.navLink}
      >
        Apps
      </Link>
      <Link
        href="/dashboard/settings"
        style={styles.navLink}
      >
        Settings
      </Link>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  navLink: {
    padding: '0.5rem 1rem',
    color: 'var(--color-muted)',
    textDecoration: 'none',
    fontSize: '0.875rem',
    borderRadius: '8px',
    transition: 'color 0.15s ease, background-color 0.15s ease',
  },
  navLinkActive: {
    color: 'var(--color-foreground)',
    backgroundColor: 'var(--color-background)',
  },
};