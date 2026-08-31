import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';
import QuickActions from '@/components/our-space/dashboard/QuickActions';

describe('QuickActions', () => {
  it('renders Canvas and Notes links', () => {
    render(createElement(QuickActions));
    const canvasLink = screen.getByText('Open Canvas').closest('a');
    const notesLink = screen.getByText('Open Notes').closest('a');
    expect(canvasLink).toHaveAttribute('href');
    expect(notesLink).toHaveAttribute('href');
  });

  it('renders disabled Coming soon actions for tasks and events', () => {
    render(createElement(QuickActions));
    const newTaskBtn = screen.getByText('New Task').closest('button');
    const newEventBtn = screen.getByText('New Event').closest('button');
    expect(newTaskBtn).toBeDisabled();
    expect(newEventBtn).toBeDisabled();
  });

  it('uses configured env URLs for available apps', () => {
    vi.stubEnv('NEXT_PUBLIC_CANVAS_APP_URL', 'https://canvas.test.com');
    vi.stubEnv('NEXT_PUBLIC_NOTES_APP_URL', 'https://notes.test.com');
    render(createElement(QuickActions));
    const canvasLink = screen.getByText('Open Canvas').closest('a');
    const notesLink = screen.getByText('Open Notes').closest('a');
    expect(canvasLink).toHaveAttribute('href', 'https://canvas.test.com');
    expect(notesLink).toHaveAttribute('href', 'https://notes.test.com');
    vi.unstubAllEnvs();
  });
});