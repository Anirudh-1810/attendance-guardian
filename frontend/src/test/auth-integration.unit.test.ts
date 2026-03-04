import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestOtp, verifyOtp } from '@/api/auth';

/**
 * Unit Tests for OTP Auth Integration Error Cases
 * Feature: auth-integration
 */

describe('Auth Integration - Unit Tests for OTP Error Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test invalid email error displays correct message
   */
  it('should display correct message for invalid email when requesting OTP', async () => {
    // Mock fetch to return invalid email error
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        message: 'Please provide a valid email address.',
      }),
    });

    global.fetch = mockFetch;

    // Attempt requestOtp
    try {
      await requestOtp('invalidemail');
      expect.fail('Expected requestOtp to throw an error');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      if (error instanceof Error) {
        expect(error.message).toBe('Please provide a valid email address.');
      }
    }
  });

  /**
   * Test invalid OTP displays correct message
   */
  it('should display correct message for invalid OTP error', async () => {
    // Mock fetch to return invalid OTP error
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        message: 'Invalid OTP.',
      }),
    });

    global.fetch = mockFetch;

    // Attempt verifyOtp with invalid OTP
    try {
      await verifyOtp('test@example.com', '000000');
      expect.fail('Expected verifyOtp to throw an error');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      if (error instanceof Error) {
        expect(error.message).toBe('Invalid OTP.');
      }
    }
  });

  /**
   * Test expired OTP displays correct message
   */
  it('should display correct message for expired OTP error', async () => {
    // Mock fetch to return expired OTP error
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        message: 'OTP has expired. Please request a new one.',
      }),
    });

    global.fetch = mockFetch;

    // Attempt verifyOtp with expired OTP
    try {
      await verifyOtp('test@example.com', '123456');
      expect.fail('Expected verifyOtp to throw an error');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      if (error instanceof Error) {
        expect(error.message).toBe('OTP has expired. Please request a new one.');
      }
    }
  });

  /**
   * Test network error displays connection message
   */
  it('should handle network error gracefully', async () => {
    // Mock fetch to throw network error
    const mockFetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    global.fetch = mockFetch;

    // Attempt verifyOtp which should fail with network error
    try {
      await verifyOtp('test@example.com', '123456');
      expect.fail('Expected verifyOtp to throw an error');
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError);
      if (error instanceof TypeError) {
        expect(error.message).toBe('Failed to fetch');
      }
    }
  });
});
