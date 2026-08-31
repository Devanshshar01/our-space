import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';
import QuickActions from '@/components/our-space/dashboard/QuickActions';

describe('QuickActions', () => {
  it('renders Canvas and Notes links', () => {
    render(createElement(QuickActions, { canvasUrl: '/canvas', notesUrl: '/notes' }));
    const canvasLink = screen.getByText('Open Canvas').closest('a');
    const notesLink = screen.getByText('Open Notes').closest('a');
    expect(canvasLink).toHaveAttribute('href', '/canvas');
    expect(notesLink).toHaveAttribute('href', '/notes');
  });

  it('renders disabled Coming soon actions for tasks and events', () => {
    render(createElement(QuickActions, { canvasUrl: '/canvas', notesUrl: '/notes' }));
    const newTaskBtn = screen.getByText('New Task').closest('button');
    const newEventBtn = screen.getByText('New Event').closest('button');
    expect(newTaskBtn).toBeDisabled();
    expect(newEventBtn).toBeDisabled();
  });

  it('uses configured URLs for available apps', () => {
    render(createElement(QuickActions, { canvasUrl: 'https://canvas.test.com', notesUrl: 'https://notes.test.com' }));
    const canvasLink = screen.getByText('Open Canvas').closest('a');
    const notesLink = screen.getByText('Open Notes').closest('a');
    expect(canvasLink).toHaveAttribute('href', 'https://canvas.test.com');
    expect(notesLink).toHaveAttribute('href', 'https://notes.test.com');
  });
});