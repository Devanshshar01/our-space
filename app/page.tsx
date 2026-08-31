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
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(1.5rem, 5vh, 3rem) clamp(1rem, 5vw, 2rem)',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          fontSize: 'clamp(0.7rem, 2vw, 0.85rem)',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--color-muted)',
          marginBottom: 'clamp(0.5rem, 2vh, 1rem)',
        }}
      >
        Private for two
      </p>

      <h1
        style={{
          fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
          fontWeight: 300,
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          marginBottom: 'clamp(1rem, 3vh, 1.5rem)',
          color: 'var(--color-foreground)',
        }}
      >
        COUPLE SPACE
      </h1>

      <p
        style={{
          fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
          color: 'var(--color-muted)',
          maxWidth: '32ch',
          marginBottom: 'clamp(2rem, 5vh, 3rem)',
          fontWeight: 400,
        }}
      >
        Our private little corner of the internet.
      </p>

      <Link
        href={target}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: 'clamp(0.85rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2.5rem)',
          fontSize: 'clamp(0.9rem, 2vw, 1rem)',
          fontWeight: 500,
          letterSpacing: '0.02em',
          color: 'var(--color-background)',
          backgroundColor: 'var(--color-accent)',
          border: 'none',
          borderRadius: '9999px',
          cursor: 'pointer',
          transition: 'background-color 0.2s ease, transform 0.1s ease',
          textDecoration: 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#c49564';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-accent)';
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'scale(0.98)';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        Enter Space
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

      <p
        style={{
          marginTop: 'clamp(2rem, 5vh, 3rem)',
          fontSize: 'clamp(0.7rem, 2vw, 0.8rem)',
          color: 'var(--color-muted)',
        }}
      >
        Two accounts. One private place.
      </p>
    </main>
  );
}