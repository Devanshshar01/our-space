'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function LandingHero() {
  const [target, setTarget] = useState('/login');

  useEffect(() => {
    // If a session cookie exists, send the user forward.
    // Better Auth cookie name is `better-auth.session_token` by default.
    if (typeof document !== 'undefined') {
      const hasSession = document.cookie
        .split(';')
        .some((c) => c.trim().startsWith('better-auth.session_token='));
      if (hasSession) setTarget('/onboard');
    }
  }, []);

  return (
    <main className="landing-shell">
      <div className="landing-mark"><span aria-hidden="true">◦</span> our space</div>
      <p className="eyebrow">Private for two</p>
      <h1>Yeah, we made a whole website for us.</h1>
      <p className="landing-copy">A quiet little corner for the things that are ours.</p>

      <Link
        href={target}
        className="landing-cta"
      >
        Come in
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Link>

      <p className="landing-footnote">Two accounts. One private place.</p>
    </main>
  );
}
