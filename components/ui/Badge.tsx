'use client';

import { HTMLAttributes, forwardRef } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'accent' | 'muted' | 'success' | 'error';
  size?: 'sm' | 'md';
  dot?: boolean;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  function Badge(
    {
      variant = 'default',
      size = 'md',
      dot: showDot = false,
      className = '',
      children,
      ...props
    }: BadgeProps,
    ref: React.ForwardedRef<HTMLSpanElement>
  ) {
    const variantStyles = {
      default: 'bg-background border border-border text-muted',
      accent: 'bg-accent-subtle border border-accent text-accent',
      muted: 'bg-background border border-border text-muted',
      success: 'bg-green-500/15 border border-green-500/30 text-green-400',
      error: 'bg-red-500/15 border border-red-500/30 text-red-400',
    };

    const sizeStyles = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
    };

    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center gap-1.5
          font-medium font-sans
          rounded-full border
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        {showDot && (
          <span
            className={`
              w-1.5 h-1.5 rounded-full
              ${variant === 'success' && 'bg-green-400'}
              ${variant === 'error' && 'bg-red-400'}
              ${variant === 'accent' && 'bg-accent'}
              ${variant === 'default' && 'bg-muted'}
            `}
            aria-hidden="true"
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
