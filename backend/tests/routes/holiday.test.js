const request = require('supertest');
const express = require('express');
const holidayRoutes = require('../../src/routes/holiday');
const prisma = require('../../src/prisma');

jest.mock('../../src/prisma', () => ({
    holiday: {
        findMany: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback),
}));

const app = express();
app.use(express.json());
app.use('/holiday', holidayRoutes);

describe('Holiday Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /holiday', () => {
        it('should return holidays', async () => {
            const mockHolidays = [{ id: '1', name: 'Xmas' }];
            prisma.holiday.findMany.mockResolvedValue(mockHolidays);

            const res = await request(app).get('/holiday').query({ semesterId: 'sem1' });

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockHolidays);
        });
    });
});
