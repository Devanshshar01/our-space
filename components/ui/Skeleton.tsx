'use client';

import { HTMLAttributes, forwardRef } from 'react';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

const baseStyles = `
  animate-pulse
  bg-surface-elevated
  rounded-md
  overflow-hidden
`;

const variantStyles = {
  text: 'h-4',
  circular: 'rounded-full',
  rectangular: '',
  card: 'rounded-xl',
};

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      variant = 'text',
      width,
      height,
      lines = 1,
      className = '',
      style,
      ...props
    },
    ref
  ) => {
    const widthStyle = width ? { width } : {};
    const heightStyle = height ? { height } : {};

    if (variant === 'text' && lines > 1) {
      return (
        <div
          ref={ref}
          className={className}
          style={style}
          {...props}
        >
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={`${baseStyles} ${variantStyles.text}`}
              style={{
                width: i === lines - 1 ? '60%' : '100%',
                marginBottom: i === lines - 1 ? 0 : '0.5rem',
              }}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        style={{ ...style, ...widthStyle, ...heightStyle }}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

export interface SkeletonCardProps {
  lines?: number;
  hasImage?: boolean;
  className?: string;
}

export const SkeletonCard = ({
  lines = 3,
  hasImage = true,
  className = '',
}: SkeletonCardProps) => {
  return (
    <div className={`animate-pulse bg-surface border border-border rounded-xl p-5 ${className}`}>
      {hasImage && (
        <div className="aspect-video w-full rounded-lg bg-surface-elevated mb-4" />
      )}
      <div className="space-y-3">
        <div className="h-6 w-3/4 bg-surface-elevated rounded" />
        <div className="h-4 w-5/6 bg-surface-elevated rounded" />
        {Array.from({ length: Math.max(0, lines - 2) }).map((_, i) => (
          <div key={i} className="h-4 bg-surface-elevated rounded" style={{ width: `${80 - i * 10}%` }} />
        ))}
      </div>
    </div>
  );
};

export default Skeleton;