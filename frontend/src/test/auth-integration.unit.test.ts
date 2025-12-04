import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signup, login } from '@/api/auth';

/**
 * Unit Tests for Auth Integration Error Cases
 * Feature: auth-integration
 * Requirements: 1.5, 2.5, 3.3
 */

describe('Auth Integration - Unit Tests for Error Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test duplicate email error displays correct message
   * Validates: Requirement 1.5
   */
  it('should display correct message for duplicate email error', async () => {
    // Mock fetch to return duplicate email error
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        message: 'Email already in use',
        hint: 'Try logging in instead',
      }),
    });
    
    global.fetch = mockFetch;

    // Attempt signup with duplicate email
    try {
      await signup({
        name: 'Test User',
        email: 'duplicate@example.com',
        password: 'password123',
      });
      expect.fail('Expected signup to throw an error');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      if (error instanceof Error) {
        expect(error.message).toBe('Email already in use');
      }
    }
  });

  /**
   * Test invalid credentials error displays correct message
   * Validates: Requirement 2.5
   */
  it('should display correct message for invalid credentials error', async () => {
    // Mock fetch to return invalid credentials error
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        message: 'Invalid credentials',
      }),
    });
    
    global.fetch = mockFetch;

    // Attempt login with invalid credentials
    try {
      await login({
        email: 'test@example.com',
        password: 'wrongpassword',
      });
      expect.fail('Expected login to throw an error');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      if (error instanceof Error) {
        expect(error.message).toBe('Invalid credentials');
      }
    }
  });

  /**
   * Test network error displays connection message
   * Validates: Requirement 3.3
   */
  it('should handle network error gracefully', async () => {
    // Mock fetch to throw network error
    const mockFetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    
    global.fetch = mockFetch;

    // Attempt login which should fail with network error
    try {
      await login({
        email: 'test@example.com',
        password: 'password123',
      });
      expect.fail('Expected login to throw an error');
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError);
      if (error instanceof TypeError) {
        expect(error.message).toBe('Failed to fetch');
      }
    }
  });

  /**
   * Test server error (500) displays appropriate message
   * Validates: Requirement 3.3
   */
  it('should handle server error with appropriate message', async () => {
    // Mock fetch to return server error
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({
        message: 'Internal server error',
      }),
    });
    
    global.fetch = mockFetch;

    // Attempt signup which should fail with server error
    try {
      await signup({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
      expect.fail('Expected signup to throw an error');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      if (error instanceof Error) {
        expect(error.message).toBe('Internal server error');
      }
    }
  });

  /**
   * Test missing required fields error
   * Validates: Requirement 3.3
   */
  it('should handle missing required fields error', async () => {
    // Mock fetch to return missing fields error
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        message: 'Missing required fields',
        hint: 'Please provide name, email, and password',
      }),
    });
    
    global.fetch = mockFetch;

    // Attempt signup with missing fields
    try {
      await signup({
        name: '',
        email: 'test@example.com',
        password: 'password123',
      });
      expect.fail('Expected signup to throw an error');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      if (error instanceof Error) {
        expect(error.message).toBe('Missing required fields');
      }
    }
  });
});
