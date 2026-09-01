'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      className = '',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-medium font-sans
      cursor-pointer
      rounded-full
      transition-all duration-150 ease-out
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent focus-visible:ring-offset-background
      disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
    `;

    const variantStyles = {
      primary: `
        bg-accent text-background hover:bg-accent-hover
        active:bg-accent/90
      `,
      secondary: `
        bg-surface border border-border text-foreground hover:bg-surface-elevated
        active:bg-surface/80
      `,
      ghost: `
        text-foreground hover:bg-surface
        active:bg-surface/80
      `,
      outline: `
        border border-border bg-transparent text-foreground hover:bg-surface
        active:bg-surface/80
      `,
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm min-h-[36px] gap-1.5',
      md: 'px-4 py-2 text-base min-h-[44px] gap-2',
      lg: 'px-6 py-3 text-lg min-h-[52px] gap-2.5',
    };

    const widthStyles = fullWidth ? 'w-full' : '';

    const loadingStyles = loading ? 'opacity-75 cursor-wait' : '';

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${loadingStyles} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {icon && iconPosition === 'left' && !loading && <span aria-hidden="true">{icon}</span>}
        {children}
        {icon && iconPosition === 'right' && !loading && <span aria-hidden="true">{icon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
