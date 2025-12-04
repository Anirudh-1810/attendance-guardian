const request = require('supertest');
const express = require('express');
const semesterRoutes = require('../../src/routes/semesters');
const prisma = require('../../src/prisma');

jest.mock('../../src/prisma', () => ({
    semester: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
}));

const app = express();
app.use(express.json());
app.use('/semesters', semesterRoutes);

describe('Semester Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /semesters', () => {
        it('should return semesters', async () => {
            const mockSemesters = [{ id: '1', name: 'Sem 1' }];
            prisma.semester.findMany.mockResolvedValue(mockSemesters);

            const res = await request(app).get('/semesters');

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockSemesters);
        });
    });

    describe('POST /semesters', () => {
        it('should create a semester', async () => {
            const mockSemester = { id: '1', name: 'Sem 1' };
            prisma.semester.create.mockResolvedValue(mockSemester);

            const res = await request(app)
                .post('/semesters')
                .send({ name: 'Sem 1', startDate: '2023-01-01', endDate: '2023-06-01' });

            expect(res.statusCode).toBe(201);
            expect(res.body).toEqual(mockSemester);
        });
    });
});
