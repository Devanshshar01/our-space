import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import JoinClient from '@/app/join/JoinClient';

const { mockRouter, mockGetSearchParam, mockFetch } = vi.hoisted(() => ({
  mockRouter: { push: vi.fn(), refresh: vi.fn() },
  mockGetSearchParam: vi.fn(),
  mockFetch: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => ({ get: mockGetSearchParam }),
}));

global.fetch = mockFetch;

describe('JoinClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRouter.push.mockReset();
    mockRouter.refresh.mockReset();
    mockGetSearchParam.mockReset();
    mockFetch.mockReset();
  });

  const renderJoinClient = () => render(createElement(JoinClient));

  const setupFetch = (response: { ok: boolean; json: () => Promise<{ ok?: boolean; error?: string; errorCode?: string; spaceId?: string }> }) => {
    mockFetch.mockResolvedValue({
      ok: response.ok,
      json: response.json,
    });
  };

  it('renders join form with textarea', () => {
    mockGetSearchParam.mockReturnValue('test-code-123');
    renderJoinClient();
    expect(screen.getByLabelText('Invite link or code')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /join space/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /create one/i })).toBeInTheDocument();
  });

  it('extracts code from URL query param on initial load', () => {
    mockGetSearchParam.mockReturnValue('url-code-456');
    renderJoinClient();
    const textarea = screen.getByLabelText('Invite link or code');
    expect(textarea).toHaveValue('url-code-456');
  });

  it('shows error for empty code', async () => {
    mockGetSearchParam.mockReturnValue(null);
    renderJoinClient();
    fireEvent.click(screen.getByRole('button', { name: /join space/i }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/invitation code is required/i);
    });
  });

  it('extracts code from full URL when pasted', async () => {
    mockGetSearchParam.mockReturnValue(null);
    renderJoinClient();
    const textarea = screen.getByLabelText('Invite link or code');
    const fullUrl = 'https://our-space.example.com/join?code=pasted-code-789&foo=bar';
    
    fireEvent.paste(textarea, { clipboardData: { getData: () => fullUrl } });
    fireEvent.click(screen.getByRole('button', { name: /join space/i }));
    
    await waitFor(() => {
      expect(textarea).toHaveValue('pasted-code-789');
    });
  });

  it('handles URL without code parameter gracefully', async () => {
    mockGetSearchParam.mockReturnValue(null);
    renderJoinClient();
    const textarea = screen.getByLabelText('Invite link or code');
    const urlWithoutCode = 'https://our-space.example.com/join';
    
    fireEvent.paste(textarea, { clipboardData: { getData: () => urlWithoutCode } });
    setupFetch({ ok: false, json: () => Promise.resolve({ ok: false, error: 'Invalid invitation code', errorCode: 'INVALID_CODE' }) });
    fireEvent.click(screen.getByRole('button', { name: /join space/i }));
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/invalid invitation code/i);
    });
  });

  it('trims whitespace from input on submit', async () => {
    mockGetSearchParam.mockReturnValue(null);
    renderJoinClient();
    const textarea = screen.getByLabelText('Invite link or code');
    
    fireEvent.change(textarea, { target: { value: '  code-with-spaces  ' } });
    setupFetch({ ok: true, json: () => Promise.resolve({ ok: true, spaceId: 'test-space' }) });
    fireEvent.click(screen.getByRole('button', { name: /join space/i }));
    
    await waitFor(() => {
      // The extracted code is trimmed, so the API should be called with trimmed code
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/couple-space/invitations/redeem',
        expect.objectContaining({
          body: JSON.stringify({ code: 'code-with-spaces' }),
        })
      );
    });
  });
});