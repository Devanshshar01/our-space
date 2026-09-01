import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth/server';
import { getCurrentCoupleSpace } from '@/lib/couple-space/service';
import { getMoods } from '@/lib/couple-space/mood';
import DashboardHero from '@/components/our-space/dashboard/DashboardHero';
import AppLauncher from '@/components/our-space/app-launcher/AppLauncher';
import QuickActions from '@/components/our-space/dashboard/QuickActions';
import MobileNav from '@/components/our-space/navigation/MobileNav';
import DesktopNav from '@/components/our-space/navigation/DesktopNav';
import MoodSection from '@/components/our-space/mood/MoodSection';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getAuthSession();
  if (!session) {
    redirect('/login?redirect=/dashboard');
  }

  const view = await getCurrentCoupleSpace(session.user.id);

  if (!view) {
    redirect('/onboard');
  }

  if (view.status === 'PENDING') {
    redirect('/onboard/pending');
  }

  const me = view.members.find((m) => m.isCurrentUser);
  const partner = view.members.find((m) => !m.isCurrentUser);
  const currentUserName = me?.name ?? session.user.name;
  const partnerName = partner?.name ?? null;

  const canvasUrl = process.env.NEXT_PUBLIC_CANVAS_APP_URL ?? 'http://localhost:3001';
  const notesUrl = process.env.NEXT_PUBLIC_NOTES_APP_URL ?? 'http://localhost:3002';

  const moods = await getMoods(session.user.id);

  return (
    <div className="dashboard-layout" style={styles.layout}>
      <header className="dashboard-header" style={styles.headerBar} role="banner">
        <div className="dashboard-header-inner" style={styles.headerInner}>
          <div style={styles.headerBrand}>
            <p style={styles.brandEyebrow}>our space</p>
            <p style={styles.brandTitle}>
              {view.space.customName || 'Our Space'}
            </p>
          </div>
          <div className="desktop-nav-only" style={styles.desktopNavWrapper}>
            <DesktopNav />
          </div>
        </div>
      </header>

      <main style={styles.main} id="main-content">
        <div className="couple-banner" style={styles.coupleBanner}>
          <p style={styles.coupleText} aria-label="Couple Space members">
            <span style={styles.coupleNameYou}>{currentUserName}</span>
            {partnerName && (
              <>
                <span style={styles.coupleAmp}> & </span>
                <span style={styles.coupleNamePartner}>{partnerName}</span>
              </>
            )}
          </p>
        </div>

        <DashboardHero
          spaceName={view.space.customName}
          anniversaryDate={view.space.anniversaryDate}
          currentUserName={currentUserName}
        />

        <div id="mood" className="dashboard-section" style={styles.section}>
          <MoodSection
            moods={moods.ok ? moods.moods : { me: null, partner: null }}
            currentUserName={currentUserName}
            partnerName={partnerName}
          />
        </div>

        <div id="quick-actions" className="dashboard-section" style={styles.section}>
          <QuickActions canvasUrl={canvasUrl} notesUrl={notesUrl} />
        </div>

        <div id="apps" className="dashboard-section" style={styles.section}>
          <AppLauncher canvasUrl={canvasUrl} notesUrl={notesUrl} />
        </div>
      </main>

      <div className="mobile-nav-only" style={styles.mobileNavWrapper}>
        <MobileNav />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  layout: {
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--color-background)',
  },
  headerBar: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    backgroundColor: 'var(--color-surface)',
    borderBottom: '1px solid var(--color-border)',
  },
  headerInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1rem, 3vw, 1.5rem)',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  headerBrand: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.125rem',
  },
  brandEyebrow: {
    fontSize: '0.6rem',
    letterSpacing: '0.25em',
    textTransform: 'uppercase',
    color: 'var(--color-muted)',
    margin: 0,
  },
  brandTitle: {
    fontSize: 'clamp(1.125rem, 3vw, 1.375rem)',
    fontWeight: 300,
    letterSpacing: '-0.02em',
    color: 'var(--color-foreground)',
    margin: 0,
  },
  desktopNavWrapper: {
    display: 'none',
  },
  main: {
    flex: 1,
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 clamp(1rem, 3vw, 1.5rem)',
    paddingBottom: 'clamp(5rem, 10vh, 6rem)',
  },
  coupleBanner: {
    padding: 'clamp(1rem, 3vw, 1.5rem) 0',
    textAlign: 'center',
    borderBottom: '1px solid var(--color-border)',
    marginBottom: '0.5rem',
  },
  coupleText: {
    fontSize: 'clamp(1rem, 2.5vw, 1.125rem)',
    color: 'var(--color-foreground)',
    margin: 0,
  },
  coupleNameYou: {
    fontWeight: 500,
  },
  coupleNamePartner: {
    fontWeight: 500,
  },
  coupleAmp: {
    color: 'var(--color-muted)',
    margin: '0 0.25rem',
  },
  section: {
    marginBottom: 'clamp(1.5rem, 4vw, 2.5rem)',
  },
  mobileNavWrapper: {
    display: 'block',
  },
};
