import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="landing-shell">
      <div className="landing-inner">
        <header className="landing-header">
          <p className="landing-wordmark">OUR SPACE</p>
          <p className="landing-kicker">Private for two</p>
        </header>

        <section className="landing-content" aria-labelledby="landing-title">
          <p className="landing-overline">Just ours</p>
          <h1 id="landing-title">Yeah, we made a whole website for us.</h1>
          <p className="landing-copy">A quiet little corner for the things that are ours.</p>
          <Link href="/login" className="landing-cta">
            Come in
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </section>

        <p className="landing-footnote">Two accounts. One private place.</p>
      </div>
    </main>
  );
}
