const request = require('supertest');
const express = require('express');
const classRoutes = require('../../src/routes/class');
const prisma = require('../../src/prisma');

jest.mock('../../src/prisma', () => ({
    class: {
        findMany: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback),
}));

const app = express();
app.use(express.json());
app.use('/class', classRoutes);

describe('Class Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /class', () => {
        it('should return classes', async () => {
            const mockClasses = [{ id: '1', subjectId: 'sub1' }];
            prisma.class.findMany.mockResolvedValue(mockClasses);

            const res = await request(app).get('/class').query({ subjectId: 'sub1' });

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockClasses);
        });
    });

    describe('POST /class', () => {
        it('should create a class', async () => {
            const mockClass = { id: '1', subjectId: 'sub1', status: 'SCHEDULED' };
            prisma.class.create.mockResolvedValue(mockClass);

            const res = await request(app)
                .post('/class')
                .send({ subjectId: 'sub1', date: '2023-01-01' });

            expect(res.statusCode).toBe(201);
            expect(res.body).toEqual(mockClass);
        });
    });
});
