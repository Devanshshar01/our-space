'use client';

interface DashboardHeroProps {
  spaceName: string | null;
  anniversaryDate: string | null;
  currentUserName: string;
}

export default function DashboardHero({ spaceName, anniversaryDate, currentUserName }: DashboardHeroProps) {
  const displayName = spaceName || 'Our Space';
  const greeting = getTimeBasedGreeting();

  return (
    <section style={styles.hero} aria-labelledby="hero-title">
      <div style={styles.content}>
        <p style={styles.greeting}>{greeting}, {currentUserName}</p>
        <h2 id="hero-title" style={styles.title}>{displayName}</h2>
        <p style={styles.subtitle}>Your private corner of the internet</p>
        {anniversaryDate && (
          <p style={styles.anniversary}>
            <span aria-hidden="true">💍</span> Anniversary: {formatAnniversary(anniversaryDate)}
          </p>
        )}
      </div>
      <div style={styles.widgetArea} aria-label="Future widgets">
        <FutureWidgetPlaceholder name="Countdown" description="Days until your next special moment" />
        <FutureWidgetPlaceholder name="Mood" description="Share how you're feeling today" />
      </div>
    </section>
  );
}

function getTimeBasedGreeting(): string {
  if (typeof window === 'undefined') return 'Hello';
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatAnniversary(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}

function FutureWidgetPlaceholder({ name, description }: { name: string; description: string }) {
  return (
    <div style={styles.placeholder}>
      <div style={styles.placeholderIcon} aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 9h6M9 15h6" />
        </svg>
      </div>
      <h3 style={styles.placeholderName}>{name}</h3>
      <p style={styles.placeholderDesc}>{description}</p>
      <span style={styles.comingSoon}>Coming soon</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  hero: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 'clamp(1.5rem, 4vw, 2rem)',
    padding: 'clamp(1.5rem, 4vw, 2rem) clamp(1rem, 3vw, 1.5rem)',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  greeting: {
    fontSize: 'clamp(1rem, 2.5vw, 1.125rem)',
    color: 'var(--color-muted)',
    margin: 0,
  },
  title: {
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    fontWeight: 300,
    letterSpacing: '-0.02em',
    color: 'var(--color-foreground)',
    margin: 0,
    lineHeight: 1.1,
  },
  subtitle: {
    fontSize: 'clamp(1rem, 2.5vw, 1.125rem)',
    color: 'var(--color-muted)',
    margin: '0.5rem 0 0',
  },
  anniversary: {
    fontSize: '0.9rem',
    color: 'var(--color-accent)',
    marginTop: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  widgetArea: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
  },
  placeholder: {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '16px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '0.75rem',
    minHeight: '140px',
  },
  placeholderIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: 'var(--color-background)',
    border: '1px solid var(--color-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-muted)',
  },
  placeholderName: {
    fontSize: '1rem',
    fontWeight: 500,
    color: 'var(--color-foreground)',
    margin: 0,
  },
  placeholderDesc: {
    fontSize: '0.8rem',
    color: 'var(--color-muted)',
    margin: 0,
  },
  comingSoon: {
    fontSize: '0.7rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--color-muted)',
    backgroundColor: 'var(--color-background)',
    border: '1px solid var(--color-border)',
    borderRadius: '9999px',
    padding: '0.25rem 0.625rem',
    marginTop: '0.5rem',
  },
};