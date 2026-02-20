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
app.use((err, req, res, next) => res.status(500).send('Something broke!'));
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
            expect(prisma.holiday.findMany).toHaveBeenCalledWith({
                where: { semesterId: 'sem1' },
                orderBy: { date: 'asc' }
            });
        });

        it('should handle internal errors gracefully', async () => {
            prisma.holiday.findMany.mockRejectedValue(new Error('Internal DB Error'));

            const res = await request(app).get('/holiday').query({ semesterId: 'sem1' });

            expect(res.statusCode).toBe(500);
            expect(res.body).toHaveProperty('error', 'Internal DB Error');
        });
    });

    describe('POST /holiday', () => {
        it('should create a single holiday with specified type', async () => {
            const mockHoliday = { id: '1', name: 'Break', type: 'VACATION' };
            prisma.holiday.create.mockResolvedValue(mockHoliday);

            const res = await request(app).post('/holiday').send({
                date: '2023-12-25',
                name: 'Break',
                type: 'VACATION',
                semesterId: 'sem1'
            });

            expect(res.statusCode).toBe(201);
            expect(res.body).toEqual(mockHoliday);
            expect(prisma.holiday.create).toHaveBeenCalledWith({
                data: {
                    date: new Date('2023-12-25'),
                    name: 'Break',
                    type: 'VACATION',
                    semesterId: 'sem1'
                }
            });
        });

        it('should create a single holiday and default type to HOLIDAY', async () => {
            const mockHoliday = { id: '1', type: 'HOLIDAY' };
            prisma.holiday.create.mockResolvedValue(mockHoliday);

            const res = await request(app).post('/holiday').send({
                date: '2023-12-25',
                name: 'Xmas',
                semesterId: 'sem1'
            });

            expect(res.statusCode).toBe(201);
            expect(prisma.holiday.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ type: 'HOLIDAY' })
                })
            );
        });

        it('should handle internal errors gracefully', async () => {
            prisma.holiday.create.mockRejectedValue(new Error('Creation failed'));
            const res = await request(app).post('/holiday').send({});
            expect(res.statusCode).toBe(500);
            expect(res.body).toHaveProperty('error', 'Creation failed');
        });
    });

    describe('POST /holiday/bulk', () => {
        it('should create multiple holidays in a transaction', async () => {
            prisma.holiday.create.mockImplementation((opt) => opt);
            prisma.$transaction.mockImplementation((promises) => Promise.all(promises));

            const payload = {
                holidays: [
                    { date: '2023-12-25', name: 'Xmas', type: 'HOLIDAY', semesterId: 'sem1' },
                    { date: '2024-01-01', name: 'New Year', semesterId: 'sem1' } // type should default
                ]
            };

            const res = await request(app).post('/holiday/bulk').send(payload);

            expect(res.statusCode).toBe(201);
            expect(prisma.$transaction).toHaveBeenCalled();
            expect(res.body.length).toBe(2);
            // Verify default type mapping fallback
            expect(res.body[1].data.type).toBe('HOLIDAY');
        });

        it('should handle internal errors gracefully', async () => {
            prisma.$transaction.mockRejectedValue(new Error('Transaction failed'));
            const res = await request(app).post('/holiday/bulk').send({ holidays: [] });
            expect(res.statusCode).toBe(500);
            expect(res.body).toHaveProperty('error', 'Transaction failed');
        });
    });

    describe('DELETE /holiday/:id', () => {
        it('should delete a holiday successfully', async () => {
            prisma.holiday.delete.mockResolvedValue({});

            const res = await request(app).delete('/holiday/1');

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Holiday deleted successfully');
            expect(prisma.holiday.delete).toHaveBeenCalledWith({ where: { id: '1' } });
        });

        it('should handle internal errors gracefully', async () => {
            prisma.holiday.delete.mockRejectedValue(new Error('Cannot delete'));
            const res = await request(app).delete('/holiday/1');
            expect(res.statusCode).toBe(500);
            expect(res.body).toHaveProperty('error', 'Cannot delete');
        });
    });
});
