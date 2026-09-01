'use client';

import React, { forwardRef, HTMLAttributes } from 'react';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
  fallback?: React.ReactNode;
}

const sizeStyles = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
};

const shapeStyles = {
  circle: 'rounded-full',
  square: 'rounded-lg',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  function Avatar(
    {
      src,
      alt,
      name,
      size = 'md',
      shape = 'circle',
      fallback,
      className = '',
      ...props
    }: AvatarProps,
    ref: React.ForwardedRef<HTMLDivElement>
  ) {
    const hasImage = src && src.trim() !== '';
    const displayName = name || alt;

    return (
      <div
        ref={ref}
        className={`
          inline-flex items-center justify-center overflow-hidden
          ${sizeStyles[size]}
          ${shapeStyles[shape]}
          bg-surface-elevated
          border border-border
          flex-shrink-0
          ${className}
        `}
        {...props}
      >
        {hasImage ? (
          <img
            src={src}
            alt={alt || displayName || 'Avatar'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : fallback ? (
          fallback
        ) : displayName ? (
          <span className="font-medium text-foreground select-none">
            {getInitials(displayName)}
          </span>
        ) : (
          <svg
            className="w-1/2 h-1/2 text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 01-7 7h14a7 7 0 01-7-7z"
            />
          </svg>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  spacing?: number;
}

const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  function AvatarGroup(
    {
      max = 5,
      size = 'md',
      spacing = -8,
      className = '',
      children,
      ...props
    }: AvatarGroupProps,
    ref: React.ForwardedRef<HTMLDivElement>
  ) {
    const childArray = React.Children.toArray(children).filter((child) =>
      React.isValidElement(child)
    ) as React.ReactElement[];

    const visibleChildren = childArray.slice(0, max);
    const remainingCount = childArray.length - max;

    return (
      <div
        ref={ref}
        className={`flex ${className}`}
        {...props}
        role="group"
        aria-label={`${childArray.length} members`}
      >
        {visibleChildren.map((child, index) => (
          <div
            key={child.key || index}
            style={{
              marginLeft: index === 0 ? 0 : spacing,
              zIndex: visibleChildren.length - index,
            }}
            className="relative"
          >
            {child}
          </div>
        ))}
        {remainingCount > 0 && (
          <div
            style={{ marginLeft: spacing, zIndex: 0 }}
            className="relative"
          >
            <div
              className={`
                flex items-center justify-center
                border-2 border-background
                ${sizeStyles[size] || 'w-10 h-10'}
                rounded-full
                bg-surface-elevated
                border border-border
              `}
            >
              <span className="text-xs font-medium text-muted">+{remainingCount}</span>
            </div>
          </div>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';

export { Avatar, AvatarGroup };
export default Avatar;
