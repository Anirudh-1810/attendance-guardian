const request = require('supertest');
const express = require('express');
const cors = require('cors');

// We can't easily import app from index.js because it starts the server.
// So we'll recreate the basic app structure to ensure it wires up correctly.
// Or we can refactor index.js. For now, we'll test that we can create the app.

const authRoutes = require('../src/routes/auth');
const semesterRoutes = require('../src/routes/semesters');
const courseRoutes = require('../src/routes/courses');

// Mock prisma to avoid DB connection
jest.mock('../src/prisma', () => ({
    user: { findUnique: jest.fn() },
}));

describe('Server Entry Point', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(cors());
        app.use(express.json());
        app.use('/auth', authRoutes);
        app.use('/semesters', semesterRoutes);
        app.use('/courses', courseRoutes);
    });

    it('should respond to health check or 404 on root', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).not.toBe(500);
    });

    it('should have auth routes mounted', async () => {
        const res = await request(app).post('/auth/login').send({});
        // Should be 400 or 401, not 404
        expect(res.statusCode).not.toBe(404);
    });
});
