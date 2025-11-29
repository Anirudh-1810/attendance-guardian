const request = require('supertest');
const express = require('express');
const coursesRoutes = require('../../src/routes/courses');
const prisma = require('../../src/prisma');
const auth = require('../../src/middleware/auth');

// Mock auth middleware
jest.mock('../../src/middleware/auth', () => (req, res, next) => {
    req.user = { userId: 'user1' };
    next();
});

jest.mock('../../src/prisma', () => ({
    semester: {
        findFirst: jest.fn(),
    },
    userCourse: {
        create: jest.fn(),
        findMany: jest.fn(),
    },
}));

const app = express();
app.use(express.json());
app.use('/courses', coursesRoutes);

describe('Courses Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /courses', () => {
        it('should create a course', async () => {
            prisma.semester.findFirst.mockResolvedValue({ id: 'sem1' });
            prisma.userCourse.create.mockResolvedValue({ id: 'c1', courseName: 'CS101' });

            const res = await request(app)
                .post('/courses')
                .send({ semesterId: 'sem1', courseName: 'CS101' });

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({ id: 'c1', courseName: 'CS101' });
        });
    });
});
