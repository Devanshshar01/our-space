import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';

const mockPathname = vi.fn().mockReturnValue('/dashboard');

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) =>
    createElement('a', { href, ...props }, children),
}));

import MobileNav from '@/components/our-space/navigation/MobileNav';
import DesktopNav from '@/components/our-space/navigation/DesktopNav';

describe('MobileNav', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/dashboard');
  });

  it('renders all navigation items', () => {
    render(createElement(MobileNav));
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Apps')).toBeInTheDocument();
    expect(screen.getByText('Quick')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('has accessible navigation landmark', () => {
    render(createElement(MobileNav));
    expect(screen.getByRole('navigation')).toHaveAttribute(
      'aria-label',
      'Primary navigation',
    );
  });

  it('marks the active page with aria-current', () => {
    render(createElement(MobileNav));
    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).toHaveAttribute('aria-current', 'page');
  });
});

describe('DesktopNav', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/dashboard');
  });

  it('renders all navigation items', () => {
    render(createElement(DesktopNav));
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Apps')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('has accessible navigation landmark', () => {
    render(createElement(DesktopNav));
    expect(screen.getByRole('navigation')).toHaveAttribute(
      'aria-label',
      'Primary navigation',
    );
  });
});