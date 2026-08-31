import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import LoginPage from '@/app/login/page';
import SignupPage from '@/app/signup/page';

const { mockRouter, mockSearchParams, mockSignIn, mockSignUp } = vi.hoisted(() => ({
  mockRouter: { push: vi.fn(), refresh: vi.fn() },
  mockSearchParams: { get: vi.fn().mockReturnValue('/onboard') },
  mockSignIn: vi.fn(),
  mockSignUp: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => mockSearchParams,
}));

vi.mock('@/lib/auth/client', () => ({
  authClient: {
    signIn: { email: mockSignIn },
    signUp: { email: mockSignUp },
  },
}));

describe('Authentication Pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRouter.push.mockReset();
    mockRouter.refresh.mockReset();
    mockSignIn.mockReset();
    mockSignUp.mockReset();
  });

  describe('Login Page', () => {
    it('renders login form with email and password fields', () => {
      render(createElement(LoginPage));

      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
    });

    it('shows error for empty credentials', async () => {
      mockSignIn.mockImplementation((_args, { onError }) =>
        onError({ error: { message: 'Invalid email or password' } }),
      );

      render(createElement(LoginPage));

      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/invalid email or password/i);
      });
    });

    it('calls signIn with credentials on submit', async () => {
      mockSignIn.mockImplementation((_args, { onSuccess }) => onSuccess());

      render(createElement(LoginPage));

      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith(
          { email: 'test@example.com', password: 'password123' },
          expect.any(Object)
        );
      });
    });

    it('redirects on successful login', async () => {
      mockSignIn.mockImplementation((_args, { onSuccess }) => onSuccess());

      render(createElement(LoginPage));

      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/onboard');
        expect(mockRouter.refresh).toHaveBeenCalled();
      });
    });

    it('shows error on failed login', async () => {
      mockSignIn.mockImplementation((_args, { onError }) =>
        onError({ error: { message: 'Invalid credentials' } })
      );

      render(createElement(LoginPage));

      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpassword' } });
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/invalid credentials/i);
      });
    });
  });

  describe('Signup Page', () => {
    it('renders signup form with all required fields', () => {
      render(createElement(SignupPage));

      expect(screen.getByLabelText('Display Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
    });

    it('shows error for empty name', async () => {
      render(createElement(SignupPage));

      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/display name is required/i);
      });
    });

    it('shows error for short name', async () => {
      render(createElement(SignupPage));

      fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: 'A' } });
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/at least 2 characters/i);
      });
    });

    it('shows error for invalid email', async () => {
      render(createElement(SignupPage));

      fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: 'Test User' } });
      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'invalid-email' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/valid email address/i);
      });
    });

    it('shows error for short password', async () => {
      render(createElement(SignupPage));

      fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: 'Test User' } });
      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'short' } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'short' } });
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/at least 8 characters/i);
      });
    });

    it('shows error for mismatched passwords', async () => {
      render(createElement(SignupPage));

      fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: 'Test User' } });
      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'different123' } });
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/passwords do not match/i);
      });
    });

    it('calls signUp with valid data on submit', async () => {
      mockSignUp.mockImplementation((_args, { onSuccess }) => onSuccess());

      render(createElement(SignupPage));

      fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: 'Test User' } });
      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith(
          { name: 'Test User', email: 'test@example.com', password: 'password123' },
          expect.any(Object)
        );
      });
    });

    it('redirects on successful signup', async () => {
      mockSignUp.mockImplementation((_args, { onSuccess }) => onSuccess());

      render(createElement(SignupPage));

      fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: 'Test User' } });
      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/onboard');
        expect(mockRouter.refresh).toHaveBeenCalled();
      });
    });

    it('shows error for duplicate email', async () => {
      mockSignUp.mockImplementation((_args, { onError }) =>
        onError({ error: { message: 'Email already exists' } })
      );

      render(createElement(SignupPage));

      fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: 'Test User' } });
      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'existing@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/already exists/i);
      });
    });
  });
});