const request = require('supertest');
const express = require('express');
const statsRoutes = require('../../src/routes/stats');
const prisma = require('../../src/prisma');

jest.mock('../../src/prisma', () => ({
    subject: {
        findMany: jest.fn(),
    },
    class: {
        findMany: jest.fn(),
    },
}));

const app = express();
app.use(express.json());
app.use('/stats', statsRoutes);

describe('Stats Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /stats/semester/:semesterId', () => {
        it('should return stats', async () => {
            const mockSubjects = [
                {
                    id: 'sub1',
                    name: 'Math',
                    classes: [{ status: 'PRESENT' }, { status: 'ABSENT' }],
                    requiredPercentage: 75,
                },
            ];
            prisma.subject.findMany.mockResolvedValue(mockSubjects);

            const res = await request(app).get('/stats/semester/sem1');

            expect(res.statusCode).toBe(200);
            expect(res.body.overall.totalSubjects).toBe(1);
            expect(res.body.subjects[0].subjectName).toBe('Math');
        });
    });
});
