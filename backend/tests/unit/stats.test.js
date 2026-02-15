const { mockDeep } = require('jest-mock-extended');
const request = require('supertest');
const express = require('express');
const statsRouter = require('../../src/routes/stats');

// Mock prisma
jest.mock('../../src/prisma', () => ({
    subject: {
        findMany: jest.fn(),
    },
    class: {
        findMany: jest.fn(),
    },
}));

const prisma = require('../../src/prisma');

const app = express();
app.use(express.json());
app.use('/stats', statsRouter);

describe('Stats Route Logic', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /stats/semester/:semesterId', () => {
        it('should calculate safe status and canBunk correctly', async () => {
            const mockSubjects = [
                {
                    id: 'sub1',
                    name: 'Math',
                    code: 'M101',
                    requiredPercentage: 75,
                    classes: [
                        { status: 'PRESENT' },
                        { status: 'PRESENT' },
                        { status: 'PRESENT' },
                        { status: 'PRESENT' },
                        { status: 'ABSENT' },
                    ],
                },
            ];

            prisma.subject.findMany.mockResolvedValue(mockSubjects);

            const res = await request(app).get('/stats/semester/sem1');

            expect(res.status).toBe(200);
            const mathStats = res.body.subjects.find(s => s.subjectName === 'Math');
            expect(mathStats.attendance).toBe(80);
            expect(mathStats.status).toBe('safe');
            expect(mathStats.canBunk).toBeGreaterThanOrEqual(0);
        });

        it('should calculate critical status and mustAttend correctly', async () => {
            const mockSubjects = [
                {
                    id: 'sub2',
                    name: 'Physics',
                    code: 'P101',
                    requiredPercentage: 75,
                    classes: [
                        { status: 'PRESENT' },
                        { status: 'ABSENT' },
                        { status: 'ABSENT' },
                        { status: 'ABSENT' },
                    ],
                },
            ];

            prisma.subject.findMany.mockResolvedValue(mockSubjects);

            const res = await request(app).get('/stats/semester/sem1');

            expect(res.status).toBe(200);
            const physicsStats = res.body.subjects.find(s => s.subjectName === 'Physics');
            expect(physicsStats.attendance).toBe(25);
            expect(physicsStats.status).toBe('critical');
            expect(physicsStats.mustAttend).toBeGreaterThan(0);
        });

        it('should handle zero total classes gracefully', async () => {
            const mockSubjects = [
                {
                    id: 'sub3',
                    name: 'English',
                    code: 'E101',
                    requiredPercentage: 75,
                    classes: [],
                },
            ];

            prisma.subject.findMany.mockResolvedValue(mockSubjects);

            const res = await request(app).get('/stats/semester/sem1');

            expect(res.status).toBe(200);
            const englishStats = res.body.subjects.find(s => s.subjectName === 'English');
            expect(englishStats.attendance).toBe(0);
            expect(englishStats.totalClasses).toBe(0);
        });
    });
});
