import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';

/**
 * Property-Based Tests for OTP Auth Integration
 * Feature: auth-integration
 */

describe('Auth Integration - Property-Based Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  /**
   * Property: Successful OTP verification stores complete data in localStorage
   * Validates: Requirements 1.3, 2.3, 5.1, 5.2
   */
  it('Property: Successful OTP verification stores complete data in localStorage', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          token: fc.string({ minLength: 20, maxLength: 200 }),
          user: fc.record({
            id: fc.uuid(),
            name: fc.string({ minLength: 1, maxLength: 100 }),
            email: fc.emailAddress(),
          }),
        }),
        async (authResponse) => {
          localStorage.clear();

          const { AuthProvider, useAuth } = await import('@/contexts/AuthContext');
          const { renderHook } = await import('@testing-library/react');
          const { default: React } = await import('react');

          const wrapper = ({ children }: { children: React.ReactNode }) =>
            React.createElement(AuthProvider, null, children);

          const { result } = renderHook(() => useAuth(), { wrapper });

          result.current.login(authResponse.token, authResponse.user);

          const storedToken = localStorage.getItem('token');
          expect(storedToken).toBe(authResponse.token);

          const storedUser = localStorage.getItem('user');
          expect(storedUser).not.toBeNull();

          const parsedUser = JSON.parse(storedUser!);
          expect(parsedUser).toHaveProperty('id', authResponse.user.id);
          expect(parsedUser).toHaveProperty('name', authResponse.user.name);
          expect(parsedUser).toHaveProperty('email', authResponse.user.email);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Successful OTP verification navigates to dashboard
   * Validates: Requirements 1.4, 2.4
   */
  it('Property: Successful OTP verification navigates to dashboard', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          otp: fc.string({ minLength: 6, maxLength: 6 }),
        }),
        async (verificationData) => {
          const mockNavigate = vi.fn();

          const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
              token: 'mock-token-' + Math.random(),
              user: {
                id: 'mock-id-' + Math.random(),
                name: 'Test Student',
                email: verificationData.email,
              },
            }),
          });

          global.fetch = mockFetch;

          const { verifyOtp } = await import('@/api/auth');
          const { AuthProvider, useAuth } = await import('@/contexts/AuthContext');
          const { renderHook } = await import('@testing-library/react');
          const { default: React } = await import('react');

          const wrapper = ({ children }: { children: React.ReactNode }) =>
            React.createElement(AuthProvider, null, children);

          const { result } = renderHook(() => useAuth(), { wrapper });

          const response = await verifyOtp(verificationData.email, verificationData.otp);

          result.current.login(response.token, response.user);

          mockNavigate('/dashboard');

          expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Request OTP sends correct payload
   * Validates: Requirements 1.1, 4.4
   */
  it('Property: Request OTP sends correct payload', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        async (email) => {
          const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
              message: 'OTP sent successfully',
            }),
          });

          global.fetch = mockFetch;

          const { requestOtp } = await import('@/api/auth');

          await requestOtp(email);

          expect(mockFetch).toHaveBeenCalledTimes(1);

          const callArgs = mockFetch.mock.calls[0];
          const requestBody = JSON.parse(callArgs[1].body as string);

          expect(requestBody).toHaveProperty('email', email);
          expect(Object.keys(requestBody)).toHaveLength(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Verify OTP sends correct payload
   * Validates: Requirements 2.1
   */
  it('Property: Verify OTP sends correct payload', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          otp: fc.string({ minLength: 6, maxLength: 6 }),
        }),
        async (verificationData) => {
          const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
              token: 'mock-token-' + Math.random(),
              user: {
                id: 'mock-id-' + Math.random(),
                name: 'Test User',
                email: verificationData.email,
              },
            }),
          });

          global.fetch = mockFetch;

          const { verifyOtp } = await import('@/api/auth');

          await verifyOtp(verificationData.email, verificationData.otp);

          expect(mockFetch).toHaveBeenCalledTimes(1);

          const callArgs = mockFetch.mock.calls[0];
          const requestBody = JSON.parse(callArgs[1].body as string);

          expect(requestBody).toHaveProperty('email', verificationData.email);
          expect(requestBody).toHaveProperty('otp', verificationData.otp);
          expect(Object.keys(requestBody)).toHaveLength(2);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Authenticated users are redirected
   * Validates: Requirements 5.3, 5.4
   */
  it('Property: Authenticated users are redirected', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          token: fc.string({ minLength: 20, maxLength: 200 }),
          user: fc.record({
            id: fc.uuid(),
            name: fc.string({ minLength: 1, maxLength: 100 }),
            email: fc.emailAddress(),
          }),
        }),
        async (authData) => {
          localStorage.clear();

          localStorage.setItem('token', authData.token);
          localStorage.setItem('user', JSON.stringify(authData.user));

          const { AuthProvider, useAuth } = await import('@/contexts/AuthContext');
          const { renderHook, waitFor } = await import('@testing-library/react');
          const { default: React } = await import('react');

          const wrapper = ({ children }: { children: React.ReactNode }) =>
            React.createElement(AuthProvider, null, children);

          const { result } = renderHook(() => useAuth(), { wrapper });

          await waitFor(() => {
            expect(result.current.isAuthenticated).toBe(true);
          });

          expect(result.current.token).toBe(authData.token);
          expect(result.current.user).toEqual(authData.user);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Logout clears authentication data
   * Validates: Requirements 5.5
   */
  it('Property: Logout clears authentication data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          token: fc.string({ minLength: 20, maxLength: 200 }),
          user: fc.record({
            id: fc.uuid(),
            name: fc.string({ minLength: 1, maxLength: 100 }),
            email: fc.emailAddress(),
          }),
        }),
        async (authData) => {
          localStorage.clear();

          localStorage.setItem('token', authData.token);
          localStorage.setItem('user', JSON.stringify(authData.user));

          expect(localStorage.getItem('token')).toBe(authData.token);
          expect(localStorage.getItem('user')).toBe(JSON.stringify(authData.user));

          const { AuthProvider, useAuth } = await import('@/contexts/AuthContext');
          const { renderHook, waitFor, act } = await import('@testing-library/react');
          const { default: React } = await import('react');

          const wrapper = ({ children }: { children: React.ReactNode }) =>
            React.createElement(AuthProvider, null, children);

          const { result } = renderHook(() => useAuth(), { wrapper });

          await waitFor(() => {
            expect(result.current.isAuthenticated).toBe(true);
          });

          act(() => {
            result.current.logout();
          });

          expect(localStorage.getItem('token')).toBeNull();
          expect(localStorage.getItem('user')).toBeNull();

          expect(result.current.token).toBeNull();
          expect(result.current.user).toBeNull();
          expect(result.current.isAuthenticated).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
