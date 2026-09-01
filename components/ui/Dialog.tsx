'use client';

import {
  Fragment,
  ReactNode,
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  HTMLAttributes,
} from 'react';
import { createPortal } from 'react-dom';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  title?: string;
  description?: string;
}

interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  title?: string;
  description?: string;
}

interface DialogHeaderProps extends HTMLAttributes<HTMLDivElement> {}

interface DialogTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

interface DialogDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

interface DialogCloseProps extends HTMLAttributes<HTMLButtonElement> {}

const Dialog = ({
  open,
  onOpenChange,
  children,
  title,
  description,
}: DialogProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    },
    [onOpenChange]
  );

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onOpenChange(false);
      }
    },
    [onOpenChange]
  );

  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
      setTimeout(() => {
        contentRef.current?.focus();
      }, 0);
    } else {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused.current?.focus();
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return createPortal(
    <Fragment>
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />
      <div
        ref={contentRef}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="bg-surface border border-border rounded-2xl shadow-xl w-full max-w-md animate-scale-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'dialog-title' : undefined}
          aria-describedby={description ? 'dialog-description' : undefined}
          tabIndex={-1}
        >
          {children}
        </div>
      </div>
    </Fragment>,
    document.body
  );
};

const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  function DialogContent(
    { children, title, description, className = '', ...props }: DialogContentProps,
    ref: React.ForwardedRef<HTMLDivElement>
  ) {
    return (
      <div
        ref={ref}
        className={`bg-surface border border-border rounded-2xl shadow-xl w-full max-w-md ${className}`}
        {...props}
      >
        {(title || description) && (
          <header className="flex items-start justify-between gap-4 p-6 border-b border-border">
            <div>
              {title && (
                <h2 className="text-lg font-medium text-foreground">{title}</h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-muted">{description}</p>
              )}
            </div>
          </header>
        )}
        <div className="p-6">{children}</div>
      </div>
    );
  }
);

DialogContent.displayName = 'DialogContent';

const DialogHeader = forwardRef<HTMLDivElement, DialogHeaderProps>(
  function DialogHeader(
    { className = '', children, ...props }: DialogHeaderProps,
    ref: React.ForwardedRef<HTMLDivElement>
  ) {
    return (
      <header
        ref={ref}
        className={`flex items-center justify-between p-6 border-b border-border ${className}`}
        {...props}
      >
        {children}
      </header>
    );
  }
);

DialogHeader.displayName = 'DialogHeader';

const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitleProps>(
  function DialogTitle(
    { className = '', children, ...props }: DialogTitleProps,
    ref: React.ForwardedRef<HTMLHeadingElement>
  ) {
    return (
      <h2
        ref={ref}
        className={`text-lg font-medium text-foreground ${className}`}
        {...props}
      >
        {children}
      </h2>
    );
  }
);

DialogTitle.displayName = 'DialogTitle';

const DialogDescription = forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  function DialogDescription(
    { className = '', children, ...props }: DialogDescriptionProps,
    ref: React.ForwardedRef<HTMLParagraphElement>
  ) {
    return (
      <p
        ref={ref}
        className={`text-sm text-muted mt-1 ${className}`}
        {...props}
      >
        {children}
      </p>
    );
  }
);

DialogDescription.displayName = 'DialogDescription';

const DialogClose = forwardRef<HTMLButtonElement, DialogCloseProps>(
  function DialogClose(
    { className = '', children = '✕', ...props }: DialogCloseProps,
    ref: React.ForwardedRef<HTMLButtonElement>
  ) {
    return (
      <button
        ref={ref}
        type="button"
        className={`
          p-1 rounded-md text-muted hover:text-foreground
          hover:bg-surface transition-colors duration-150
          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    );
  }
);

DialogClose.displayName = 'DialogClose';

const DialogFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function DialogFooter(
    { className = '', children, ...props }: HTMLAttributes<HTMLDivElement>,
    ref: React.ForwardedRef<HTMLDivElement>
  ) {
    return (
      <footer
        ref={ref}
        className={`flex items-center justify-end gap-3 p-6 border-t border-border ${className}`}
        {...props}
      >
        {children}
      </footer>
    );
  }
);

DialogFooter.displayName = 'DialogFooter';

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
};
export type {
  DialogProps,
  DialogContentProps,
  DialogHeaderProps,
  DialogTitleProps,
  DialogDescriptionProps,
  DialogCloseProps,
};
