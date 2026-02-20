const request = require('supertest');
const express = require('express');

// Mock node-cache BEFORE requiring the routes
const mockCacheGet = jest.fn();
const mockCacheSet = jest.fn();
jest.mock('node-cache', () => {
    return jest.fn().mockImplementation(() => ({
        get: mockCacheGet,
        set: mockCacheSet,
    }));
});

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

jest.mock('../../src/middleware/auth', () => (req, res, next) => {
    req.user = { userId: '1' };
    next();
});

const app = express();
app.use(express.json());
// Add a dummy error handler to suppress express logs during tests
app.use((err, req, res, next) => res.status(500).send('Something broke!'));
app.use('/semesters', semesterRoutes);

describe('Semester Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Default findMany to empty
        prisma.semester.findMany.mockResolvedValue([]);
    });

    describe('GET /semesters', () => {
        it('should return all semesters for the user', async () => {
            const mockSemesters = [{ id: '1', name: 'Sem 1' }];
            prisma.semester.findMany.mockResolvedValue(mockSemesters);

            const res = await request(app).get('/semesters');

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockSemesters);
            expect(prisma.semester.findMany).toHaveBeenCalledWith({
                where: { userId: '1' },
                include: { subjects: true, holidays: true },
                orderBy: { startDate: 'desc' },
            });
        });

        it('should handle internal errors gracefully', async () => {
            prisma.semester.findMany.mockRejectedValue(new Error('DB Error'));

            const res = await request(app).get('/semesters');

            expect(res.statusCode).toBe(500);
            expect(res.body).toHaveProperty('error', 'DB Error');
        });
    });

    describe('GET /semesters/current', () => {
        it('should return cached semester if available', async () => {
            const cachedSem = { id: 'cached', name: 'Cached Sem' };
            mockCacheGet.mockReturnValue(cachedSem);

            const res = await request(app).get('/semesters/current');

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(cachedSem);
            expect(mockCacheGet).toHaveBeenCalledWith('1');
            expect(prisma.semester.findMany).not.toHaveBeenCalled();
        });

        it('should return active semester if no cache and overlap with today', async () => {
            mockCacheGet.mockReturnValue(null);
            const now = new Date();
            const pastDate = new Date(now);
            pastDate.setMonth(pastDate.getMonth() - 1);
            const futureDate = new Date(now);
            futureDate.setMonth(futureDate.getMonth() + 1);

            const mockSemesters = [
                { id: 'inactive', startDate: new Date('2020-01-01'), endDate: new Date('2020-06-01'), subjects: [] },
                { id: 'active', startDate: pastDate, endDate: futureDate, subjects: [{ id: 'sub1' }] }
            ];
            prisma.semester.findMany.mockResolvedValue(mockSemesters);

            const res = await request(app).get('/semesters/current');

            expect(res.statusCode).toBe(200);
            expect(res.body.id).toBe('active');
            expect(mockCacheSet).toHaveBeenCalledWith('1', expect.objectContaining({ id: 'active' }));
        });

        it('should return active semester even if it has no subjects', async () => {
            mockCacheGet.mockReturnValue(null);
            const now = new Date();
            const pastDate = new Date(now.getTime() - 1000000);
            const futureDate = new Date(now.getTime() + 1000000);

            const mockSemesters = [
                { id: 'active_no_sub', startDate: pastDate, endDate: futureDate, subjects: [] }
            ];
            prisma.semester.findMany.mockResolvedValue(mockSemesters);

            const res = await request(app).get('/semesters/current');

            expect(res.statusCode).toBe(200);
            expect(res.body.id).toBe('active_no_sub');
        });

        it('should return latest data semester if no active semester exists', async () => {
            mockCacheGet.mockReturnValue(null);
            const mockSemesters = [
                { id: 'no_subs', startDate: new Date('2020-01-01'), endDate: new Date('2020-06-01'), subjects: [] },
                { id: 'has_subs', startDate: new Date('2020-07-01'), endDate: new Date('2020-12-01'), subjects: [{ id: 'sub1' }] }
            ];
            prisma.semester.findMany.mockResolvedValue(mockSemesters);

            const res = await request(app).get('/semesters/current');

            expect(res.statusCode).toBe(200);
            expect(res.body.id).toBe('has_subs');
        });

        it('should fallback to first semester if no active and no subjects', async () => {
            mockCacheGet.mockReturnValue(null);
            const mockSemesters = [
                { id: 'first_ever', startDate: new Date('2020-01-01'), endDate: new Date('2020-06-01'), subjects: [] }
            ];
            prisma.semester.findMany.mockResolvedValue(mockSemesters);

            const res = await request(app).get('/semesters/current');

            expect(res.statusCode).toBe(200);
            expect(res.body.id).toBe('first_ever');
        });

        it('should auto-create semester if none exist at all', async () => {
            mockCacheGet.mockReturnValue(null);
            prisma.semester.findMany.mockResolvedValue([]);
            const mockCreated = { id: 'created', name: 'Semester 1' };
            prisma.semester.create.mockResolvedValue(mockCreated);

            const res = await request(app).get('/semesters/current');

            expect(res.statusCode).toBe(200);
            expect(res.body.id).toBe('created');
            expect(prisma.semester.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    name: 'Semester 1',
                    requiredPercentage: 75,
                    userId: '1'
                }),
                include: { subjects: true, holidays: true }
            });
        });

        it('should handle internal errors gracefully', async () => {
            mockCacheGet.mockReturnValue(null);
            prisma.semester.findMany.mockRejectedValue(new Error('Current Error'));

            const res = await request(app).get('/semesters/current');

            expect(res.statusCode).toBe(500);
            expect(res.body).toHaveProperty('error', 'Current Error');
        });
    });

    describe('POST /semesters', () => {
        it('should create a semester', async () => {
            const mockSemester = { id: '1', name: 'Sem 1' };
            prisma.semester.create.mockResolvedValue(mockSemester);

            const res = await request(app)
                .post('/semesters')
                .send({ name: 'Sem 1', startDate: '2023-01-01', endDate: '2023-06-01', requiredPercentage: 80 });

            expect(res.statusCode).toBe(201);
            expect(res.body).toEqual(mockSemester);
            expect(prisma.semester.create).toHaveBeenCalledWith({
                data: {
                    name: 'Sem 1',
                    startDate: new Date('2023-01-01'),
                    endDate: new Date('2023-06-01'),
                    requiredPercentage: 80,
                    userId: '1'
                }
            });
        });

        it('should fallback requiredPercentage to 75 if not provided', async () => {
            const mockSemester = { id: '1' };
            prisma.semester.create.mockResolvedValue(mockSemester);

            const res = await request(app)
                .post('/semesters')
                .send({ name: 'Sem 1', startDate: '2023-01-01', endDate: '2023-06-01' });

            expect(prisma.semester.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ requiredPercentage: 75 })
                })
            );
            expect(res.statusCode).toBe(201);
        });

        it('should handle errors', async () => {
            prisma.semester.create.mockRejectedValue(new Error('Validation Fails'));
            const res = await request(app).post('/semesters').send({});
            expect(res.statusCode).toBe(500);
        });
    });

    describe('PUT /semesters/:id', () => {
        it('should update a semester successfully', async () => {
            prisma.semester.findFirst.mockResolvedValue({ id: '1', userId: '1' });
            prisma.semester.update.mockResolvedValue({ id: '1', name: 'Updated' });

            const res = await request(app)
                .put('/semesters/1')
                .send({ name: 'Updated', startDate: '2023-01-01', endDate: '2023-06-01', requiredPercentage: 90 });

            expect(res.statusCode).toBe(200);
            expect(prisma.semester.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: {
                    name: 'Updated',
                    startDate: expect.any(Date),
                    endDate: expect.any(Date),
                    requiredPercentage: 90
                }
            });
        });

        it('should return 404 if semester not found or unauthorized', async () => {
            prisma.semester.findFirst.mockResolvedValue(null);

            const res = await request(app).put('/semesters/1').send({ name: 'Updated' });

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('Semester not found');
        });

        it('should handle partial update payloads correctly', async () => {
            prisma.semester.findFirst.mockResolvedValue({ id: '1', userId: '1' });
            prisma.semester.update.mockResolvedValue({ id: '1' });

            const res = await request(app).put('/semesters/1').send({ requiredPercentage: 50 });

            expect(prisma.semester.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: { requiredPercentage: 50 }
            });
            expect(res.statusCode).toBe(200);
        });

        it('should handle errors', async () => {
            prisma.semester.findFirst.mockRejectedValue(new Error('DB boom'));
            const res = await request(app).put('/semesters/1').send({});
            expect(res.statusCode).toBe(500);
        });
    });

    describe('DELETE /semesters/:id', () => {
        it('should delete a semester successfully', async () => {
            prisma.semester.findFirst.mockResolvedValue({ id: '1', userId: '1' });
            prisma.semester.delete.mockResolvedValue({});

            const res = await request(app).delete('/semesters/1');

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Semester deleted successfully');
            expect(prisma.semester.delete).toHaveBeenCalledWith({ where: { id: '1' } });
        });

        it('should return 404 if semester not found', async () => {
            prisma.semester.findFirst.mockResolvedValue(null);

            const res = await request(app).delete('/semesters/1');

            expect(res.statusCode).toBe(404);
        });

        it('should handle errors', async () => {
            prisma.semester.findFirst.mockRejectedValue(new Error('Unknown'));
            const res = await request(app).delete('/semesters/1');
            expect(res.statusCode).toBe(500);
        });
    });

});
