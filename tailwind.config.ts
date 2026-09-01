import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        'surface-elevated': 'var(--color-surface-elevated)',
        foreground: 'var(--color-foreground)',
        muted: 'var(--color-muted)',
        'muted-light': 'var(--color-muted-light)',
        border: 'var(--color-border)',
        'border-light': 'var(--color-border-light)',
        accent: 'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        'accent-subtle': 'var(--color-accent-subtle)',
        error: 'var(--color-error)',
        'error-bg': 'var(--color-error-bg)',
        'error-border': 'var(--color-error-border)',
        success: 'var(--color-success)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        display: ['var(--font-display)'],
      },
      fontSize: {
        'fluid-xs': 'clamp(0.65rem, 0.6rem + 0.25vw, 0.75rem)',
        'fluid-sm': 'clamp(0.8rem, 0.75rem + 0.25vw, 0.875rem)',
        'fluid-base': 'clamp(0.9rem, 0.85rem + 0.25vw, 1rem)',
        'fluid-lg': 'clamp(1rem, 0.95rem + 0.25vw, 1.125rem)',
        'fluid-xl': 'clamp(1.125rem, 1rem + 0.5vw, 1.375rem)',
        'fluid-2xl': 'clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)',
        'fluid-3xl': 'clamp(1.5rem, 1.25rem + 1.25vw, 2rem)',
        'fluid-4xl': 'clamp(2rem, 1.5rem + 2.5vw, 3rem)',
        'fluid-5xl': 'clamp(2.5rem, 1.75rem + 3.75vw, 4.5rem)',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
        md: '0 4px 12px rgba(0, 0, 0, 0.4)',
        lg: '0 20px 40px rgba(0, 0, 0, 0.5)',
        xl: '0 32px 64px rgba(0, 0, 0, 0.6)',
      },
      transitionDuration: {
        fast: '100ms',
        normal: '150ms',
        slow: '250ms',
        slower: '350ms',
      },
      transitionTimingFunction: {
        'ease-out': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },
      zIndex: {
        dropdown: '10',
        sticky: '10',
        modal: '40',
        toast: '50',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        fadeOut: 'fadeOut 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        slideUp: 'slideUp 350ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        slideDown: 'slideDown 350ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        scaleIn: 'scaleIn 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        pulse: 'pulse 2s ease-in-out infinite',
        spin: 'spin 1s linear infinite',
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [],
};

export default config;
