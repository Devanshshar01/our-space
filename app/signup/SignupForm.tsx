'use client';

import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authClient } from '@/lib/auth/client';

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/onboard';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!name.trim()) {
      setError('Display name is required');
      return false;
    }
    if (name.trim().length < 2) {
      setError('Display name must be at least 2 characters');
      return false;
    }
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!password) {
      setError('Password is required');
      return false;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      await authClient.signUp.email(
        { name: name.trim(), email, password },
        {
          onSuccess: () => {
            router.push(redirect);
            router.refresh();
          },
          onError: (ctx: { error?: { message?: string } }) => {
            const message = ctx.error?.message || 'Signup failed. Please try again.';
            if (message.toLowerCase().includes('already')) {
              setError('An account with this email already exists');
            } else {
              setError(message);
            }
          },
        }
      );
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell" style={styles.main}>
      <div className="auth-card" style={styles.card}>
        <header className="auth-heading" style={styles.header}>
          <p className="eyebrow">Make room for us</p>
          <h1 style={styles.title}>Let&apos;s make this ours.</h1>
          <p style={styles.subtitle}>Then we&apos;ll make a place to share.</p>
        </header>

        {error && <div className="error-message" style={styles.error} role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="form-stack" style={styles.form} noValidate>
          <div style={styles.field}>
            <label htmlFor="name" style={styles.label}>
              Display Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex"
              required
              disabled={loading}
              style={styles.input}
              maxLength={50}
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="email" style={styles.label}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="password" style={styles.label}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              style={styles.input}
              minLength={8}
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="confirmPassword" style={styles.label}>
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              style={styles.input}
            />
          </div>

          <p style={styles.hint}>
            Password must be at least 8 characters
          </p>

          <button
            type="submit"
            disabled={loading}
            style={styles.button}
          >
            {loading ? 'Making your account…' : 'Create account'}
          </button>
        </form>

        <p className="form-footer" style={styles.footer}>
          Already have an account?{' '}
          <Link className="quiet-link" href={`/login?redirect=${encodeURIComponent(redirect)}`} style={styles.link}>
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: '100dvh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'clamp(1.5rem, 5vh, 3rem) clamp(1rem, 5vw, 2rem)',
  },
  card: {
    width: '100%',
    maxWidth: '380px',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '16px',
    padding: 'clamp(1.5rem, 4vw, 2.5rem)',
  },
  header: {
    textAlign: 'center',
    marginBottom: 'clamp(1.5rem, 4vw, 2rem)',
  },
  title: {
    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
    fontWeight: 300,
    letterSpacing: '-0.02em',
    color: 'var(--color-foreground)',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: 'clamp(0.9rem, 2vw, 1rem)',
    color: 'var(--color-muted)',
  },
  error: {
    backgroundColor: 'var(--color-error-bg)',
    border: '1px solid var(--color-error-border)',
    color: 'var(--color-error)',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
    marginBottom: '1rem',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--color-foreground)',
  },
  input: {
    fontSize: '1rem',
    padding: '0.75rem 1rem',
    backgroundColor: 'var(--color-background)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    color: 'var(--color-foreground)',
    outline: 'none',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
    minHeight: '48px',
  },
  hint: {
    fontSize: '0.75rem',
    color: 'var(--color-muted)',
    marginTop: '-0.5rem',
  },
  button: {
    marginTop: '0.5rem',
    padding: '0.875rem 1.5rem',
    fontSize: '1rem',
    fontWeight: 500,
    color: 'var(--color-background)',
    backgroundColor: 'var(--color-accent)',
    border: 'none',
    borderRadius: '9999px',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease, transform 0.1s ease',
    minHeight: '48px',
  },
  footer: {
    marginTop: '1.5rem',
    textAlign: 'center',
    fontSize: '0.9rem',
    color: 'var(--color-muted)',
  },
  link: {
    color: 'var(--color-accent)',
    fontWeight: 500,
    textDecoration: 'none',
  },
};
