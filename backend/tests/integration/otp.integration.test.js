const request = require('supertest');
const express = require('express');
const app = require('../../src/index');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

jest.mock('express-rate-limit', () => () => (req, res, next) => next());

require('../../src/middleware/rateLimiter');

jest.mock('../../src/services/emailService', () => ({
    sendOTPEmail: jest.fn().mockResolvedValue(true)
}));

describe('OTP Authentication Integration Tests', () => {

    const testEmail = 'test@example.com';
    let validOtp = null;

    beforeAll(async () => {
        // Clean up database before tests
        await prisma.oTP.deleteMany({ where: { email: testEmail } });
        await prisma.user.deleteMany({ where: { email: testEmail } });
    });

    afterAll(async () => {
        // Clean up database after tests
        await prisma.oTP.deleteMany({ where: { email: testEmail } });
        await prisma.user.deleteMany({ where: { email: testEmail } });
        await prisma.$disconnect();
    });

    describe('POST /api/auth/request-otp', () => {
        it('should generate an OTP and store it in the database for a valid email', async () => {
            const response = await request(app)
                .post('/api/auth/request-otp')
                .send({ email: testEmail });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('OTP sent successfully');

            // Verify OTP exists in DB
            const otpRecord = await prisma.oTP.findFirst({
                where: { email: testEmail },
                orderBy: { createdAt: 'desc' }
            });

            expect(otpRecord).toBeDefined();
            expect(otpRecord.email).toBe(testEmail);

            // Store the hash for the next test if we could retrieve it.
            // Since we mock the email service, we can't easily get the plain OTP directly from the response.
            // We will need to test verify-otp by directly inserting a known OTP.
        });

        it('should return 400 for an invalid email', async () => {
            const response = await request(app)
                .post('/api/auth/request-otp')
                .send({ email: 'invalid-email' });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Please provide a valid email address.');
        });
    });

    describe('POST /api/auth/verify-otp', () => {

        // We import hashOTP to manually insert a known OTP for verification testing
        const hashOTP = require('../../src/utils/hashOTP');
        const knownOtp = '123456';

        beforeEach(async () => {
            // Insert a known OTP into the database for testing
            await prisma.oTP.deleteMany({ where: { email: testEmail } });

            await prisma.oTP.create({
                data: {
                    email: testEmail,
                    otpHash: hashOTP(knownOtp),
                    expiresAt: new Date(Date.now() + 5 * 60 * 1000) // valid for 5 mins
                }
            });
        });

        it('should return 400 for an incorrect OTP', async () => {
            const response = await request(app)
                .post('/api/auth/verify-otp')
                .send({ email: testEmail, otp: '654321' });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Invalid OTP.');
        });

        it('should successfully verify a correct OTP and return a JWT', async () => {
            const response = await request(app)
                .post('/api/auth/verify-otp')
                .send({ email: testEmail, otp: knownOtp });

            expect(response.status).toBe(200);
            expect(response.body.token).toBeDefined();
            expect(response.body.user).toBeDefined();
            expect(response.body.user.email).toBe(testEmail);

            // OTP should be deleted after successful verification
            const otpRecord = await prisma.oTP.findFirst({
                where: { email: testEmail }
            });
            expect(otpRecord).toBeNull();
        });

        it('should return 400 if OTP is expired', async () => {
            // Manually set OTP to expired
            await prisma.oTP.updateMany({
                where: { email: testEmail },
                data: { expiresAt: new Date(Date.now() - 5 * 60 * 1000) } // expired 5 mins ago
            });

            const response = await request(app)
                .post('/api/auth/verify-otp')
                .send({ email: testEmail, otp: knownOtp });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('OTP has expired. Please request a new one.');
        });
    });
});
