const request = require('supertest');
const express = require('express');
const statsRoutes = require('../../src/routes/stats');
const prisma = require('../../src/prisma');

jest.mock('../../src/prisma', () => ({
    userCourse: {
        findMany: jest.fn(),
    },
    class: {
        findMany: jest.fn(),
        groupBy: jest.fn(),
    },
}));

jest.mock('../../src/middleware/auth', () => (req, res, next) => next());

const app = express();
app.use(express.json());
app.use('/stats', statsRoutes);

describe('Stats Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /stats/semester/:semesterId', () => {
        it('should return stats', async () => {
            // Mock the new query pattern: subjects with _count
            const mockSubjects = [
                {
                    id: 'sub1',
                    courseName: 'Math',
                    courseCode: 'MATH101',
                    requiredPercentage: 75,
                    _count: { classes: 2 },
                },
            ];
            prisma.userCourse.findMany.mockResolvedValue(mockSubjects);

            // Mock the groupBy result
            prisma.class.groupBy.mockResolvedValue([
                { subjectId: 'sub1', status: 'PRESENT', _count: 1 },
                { subjectId: 'sub1', status: 'ABSENT', _count: 1 },
            ]);

            const res = await request(app).get('/stats/semester/sem1');

            expect(res.statusCode).toBe(200);
            expect(res.body.overall.totalSubjects).toBe(1);
            expect(res.body.subjects[0].subjectName).toBe('Math');
            expect(res.body.subjects[0].totalClasses).toBe(2);
            expect(res.body.subjects[0].attendedClasses).toBe(1);
            expect(res.body.subjects[0].absentClasses).toBe(1);
        });
    });
});
