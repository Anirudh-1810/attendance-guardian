const request = require('supertest');
const express = require('express');
const fc = require('fast-check');
const bcrypt = require('bcryptjs');
const authRoutes = require('../../src/routes/auth');
const prisma = require('../../src/prisma');

/**
 * Property-Based Tests for Auth Routes
 * Feature: auth-integration
 */

// Create express app for testing
const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Routes - Property-Based Tests', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret-key-for-property-tests';
  });

  afterEach(async () => {
    // Clean up test users after each test
    try {
      await prisma.user.deleteMany({
        where: {
          email: {
            contains: '@property-test.com'
          }
        }
      });
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  /**
   * Property 3: Authentication API returns valid response structure
   * Validates: Requirements 1.2, 2.2
   * Feature: auth-integration, Property 3: Authentication API returns valid response structure
   * 
   * For any successful authentication request (signup or login), the backend API should return
   * a response containing a JWT token string and a user object with id, name, and email fields.
   */
  it('Property 3: Authentication API returns valid response structure', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random user data for both signup and login
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 50 }),
          email: fc.emailAddress().map(email => {
            // Ensure unique emails for property testing
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(7);
            return `${email.split('@')[0]}-${timestamp}-${random}@property-test.com`;
          }),
          password: fc.string({ minLength: 6, maxLength: 50 })
        }),
        async (userData) => {
          // Test signup endpoint response structure
          const signupResponse = await request(app)
            .post('/auth/signup')
            .send({
              name: userData.name,
              email: userData.email,
              password: userData.password
            });

          // Property 1: Signup should return 200 status
          expect(signupResponse.statusCode).toBe(200);

          // Property 2: Signup response should have a token field (string)
          expect(signupResponse.body).toHaveProperty('token');
          expect(typeof signupResponse.body.token).toBe('string');
          expect(signupResponse.body.token.length).toBeGreaterThan(0);

          // Property 3: Signup response should have a user object
          expect(signupResponse.body).toHaveProperty('user');
          expect(typeof signupResponse.body.user).toBe('object');
          expect(signupResponse.body.user).not.toBeNull();

          // Property 4: User object should have id, name, and email fields
          expect(signupResponse.body.user).toHaveProperty('id');
          expect(typeof signupResponse.body.user.id).toBe('string');
          expect(signupResponse.body.user.id.length).toBeGreaterThan(0);

          expect(signupResponse.body.user).toHaveProperty('name');
          expect(signupResponse.body.user.name).toBe(userData.name);

          expect(signupResponse.body.user).toHaveProperty('email');
          expect(signupResponse.body.user.email).toBe(userData.email);

          // Property 5: User object should NOT contain the password
          expect(signupResponse.body.user).not.toHaveProperty('password');

          // Now test login endpoint with the same credentials
          const loginResponse = await request(app)
            .post('/auth/login')
            .send({
              email: userData.email,
              password: userData.password
            });

          // Property 6: Login should return 200 status
          expect(loginResponse.statusCode).toBe(200);

          // Property 7: Login response should have a token field (string)
          expect(loginResponse.body).toHaveProperty('token');
          expect(typeof loginResponse.body.token).toBe('string');
          expect(loginResponse.body.token.length).toBeGreaterThan(0);

          // Property 8: Login response should have a user object
          expect(loginResponse.body).toHaveProperty('user');
          expect(typeof loginResponse.body.user).toBe('object');
          expect(loginResponse.body.user).not.toBeNull();

          // Property 9: User object should have id, name, and email fields
          expect(loginResponse.body.user).toHaveProperty('id');
          expect(typeof loginResponse.body.user.id).toBe('string');
          expect(loginResponse.body.user.id.length).toBeGreaterThan(0);

          expect(loginResponse.body.user).toHaveProperty('name');
          expect(loginResponse.body.user.name).toBe(userData.name);

          expect(loginResponse.body.user).toHaveProperty('email');
          expect(loginResponse.body.user.email).toBe(userData.email);

          // Property 10: User object should NOT contain the password
          expect(loginResponse.body.user).not.toHaveProperty('password');

          // Property 11: Both responses should have the same user id
          expect(loginResponse.body.user.id).toBe(signupResponse.body.user.id);
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in design document
    );
  }, 60000); // 60 second timeout for 100 iterations with bcrypt hashing

  /**
   * Property 6: Password hashing is applied
   * Validates: Requirements 4.5
   * Feature: auth-integration, Property 6: Password hashing is applied
   * 
   * For any user created through the signup endpoint, the password stored in the database
   * should be a bcrypt hash, not the plaintext password.
   */
  it('Property 6: Password hashing is applied', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random user data
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 50 }),
          email: fc.emailAddress().map(email => {
            // Ensure unique emails for property testing
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(7);
            return `${email.split('@')[0]}-${timestamp}-${random}@property-test.com`;
          }),
          password: fc.string({ minLength: 6, maxLength: 50 })
        }),
        async (userData) => {
          // Call the signup endpoint
          const response = await request(app)
            .post('/auth/signup')
            .send({
              name: userData.name,
              email: userData.email,
              password: userData.password
            });

          // Verify signup was successful
          expect(response.statusCode).toBe(200);
          expect(response.body).toHaveProperty('token');
          expect(response.body).toHaveProperty('user');

          // Query the database directly to get the stored password
          const userInDb = await prisma.user.findUnique({
            where: { email: userData.email }
          });

          // Property 1: User should exist in database
          expect(userInDb).not.toBeNull();

          // Property 2: Stored password should NOT be the plaintext password
          expect(userInDb.password).not.toBe(userData.password);

          // Property 3: Stored password should be a valid bcrypt hash
          // Bcrypt hashes start with $2a$, $2b$, or $2y$ followed by cost factor
          const bcryptHashPattern = /^\$2[aby]\$\d{2}\$.{53}$/;
          expect(userInDb.password).toMatch(bcryptHashPattern);

          // Property 4: The bcrypt hash should verify against the original password
          const isValidHash = await bcrypt.compare(userData.password, userInDb.password);
          expect(isValidHash).toBe(true);

          // Property 5: The hash should NOT verify against a different password
          const differentPassword = userData.password + 'different';
          const isInvalidHash = await bcrypt.compare(differentPassword, userInDb.password);
          expect(isInvalidHash).toBe(false);
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in design document
    );
  });
});
