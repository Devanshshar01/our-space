import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';
import AppCard from '@/components/our-space/app-launcher/AppCard';

describe('AppCard', () => {
  it('renders name and description for available apps', () => {
    render(
      createElement(AppCard, {
        name: 'Canvas',
        description: 'Draw together',
        icon: <span>icon</span>,
        href: 'https://canvas.example.com',
        status: 'available',
        external: true,
      }),
    );
    expect(screen.getByText('Canvas')).toBeInTheDocument();
    expect(screen.getByText('Draw together')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open/i })).toHaveAttribute(
      'href',
      'https://canvas.example.com',
    );
  });

  it('shows Coming soon badge for unavailable apps', () => {
    render(
      createElement(AppCard, {
        name: 'Tasks',
        description: 'Shared to-dos',
        icon: <span>icon</span>,
        href: '#',
        status: 'coming-soon',
        external: false,
      }),
    );
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
    const button = screen.getByRole('button', { name: /not available/i });
    expect(button).toBeDisabled();
  });

  it('opens external link in new tab', () => {
    render(
      createElement(AppCard, {
        name: 'Notes',
        description: 'Shared notes',
        icon: <span>icon</span>,
        href: 'https://notes.example.com',
        status: 'available',
        external: true,
      }),
    );
    const link = screen.getByRole('link', { name: /open/i });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});