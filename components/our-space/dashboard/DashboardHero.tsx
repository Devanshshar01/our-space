'use client';

interface DashboardHeroProps { spaceName: string | null; anniversaryDate: string | null; currentUserName: string; }

function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatAnniversary(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function DashboardHero({ spaceName, anniversaryDate, currentUserName }: DashboardHeroProps) {
  return (
    <section className="dashboard-hero" aria-labelledby="hero-title">
      <p className="dashboard-greeting">{getTimeBasedGreeting()}, {currentUserName}.</p>
      <h1 id="hero-title">{spaceName || 'Our Space'}</h1>
      <p className="dashboard-subtitle">The little place that belongs to both of you.</p>
      {anniversaryDate && <p className="dashboard-anniversary">Together since {formatAnniversary(anniversaryDate)}</p>}
    </section>
  );
}
