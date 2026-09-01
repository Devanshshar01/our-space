'use client';

import { forwardRef, HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  function Card(
    {
      variant = 'default',
      padding = 'md',
      interactive = false,
      className = '',
      children,
      ...props
    }: CardProps,
    ref: React.ForwardedRef<HTMLDivElement>
  ) {
    const paddingStyles = {
      none: '',
      sm: 'p-4',
      md: 'p-5 sm:p-6',
      lg: 'p-6 sm:p-8',
    };

    const interactiveStyles = interactive
      ? 'transition-all duration-150 ease-out hover:bg-surface-elevated hover:shadow-md cursor-pointer'
      : '';

    return (
      <div
        ref={ref}
        className={`
          bg-surface border border-border rounded-xl
          transition-all duration-150 ease-out
          ${paddingStyles[padding]}
          ${interactiveStyles}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  function CardHeader(
    { className = '', children, ...props }: CardHeaderProps,
    ref: React.ForwardedRef<HTMLDivElement>
  ) {
    return (
      <div
        ref={ref}
        className={`mb-4 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  asChild?: boolean;
}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  function CardTitle(
    { className = '', asChild = false, children, ...props }: CardTitleProps,
    ref: React.ForwardedRef<HTMLHeadingElement>
  ) {
    const Component = asChild ? 'span' : 'h3';
    return (
      <Component
        ref={ref}
        className={`text-2xl font-light tracking-tight text-foreground ${className}`}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

CardTitle.displayName = 'CardTitle';

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  function CardDescription(
    { className = '', children, ...props }: CardDescriptionProps,
    ref: React.ForwardedRef<HTMLParagraphElement>
  ) {
    return (
      <p
        ref={ref}
        className={`text-muted mt-1 text-sm ${className}`}
        {...props}
      >
        {children}
      </p>
    );
  }
);

CardDescription.displayName = 'CardDescription';

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  function CardContent(
    { className = '', children, ...props }: CardContentProps,
    ref: React.ForwardedRef<HTMLDivElement>
  ) {
    return (
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  function CardFooter(
    { className = '', children, ...props }: CardFooterProps,
    ref: React.ForwardedRef<HTMLDivElement>
  ) {
    return (
      <div
        ref={ref}
        className={`flex items-center mt-4 pt-4 border-t border-border ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
export default Card;
