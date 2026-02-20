const { mockDeep } = require('jest-mock-extended');

const mockPrisma = mockDeep();
mockPrisma.$transaction.mockImplementation(async (callback) => {
    if (typeof callback === 'function') {
        return await callback(mockPrisma);
    }
    return callback;
});

jest.mock('../../src/prisma', () => mockPrisma);

const prisma = require('../../src/prisma');
const classService = require('../../src/services/classService');
const AppError = require('../../src/utils/AppError');

describe('ClassService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getClasses', () => {
        it('should return classes filtered by subjectId', async () => {
            const mockClasses = [{ id: '1', subjectId: 'sub1' }];
            prisma.class.findMany.mockResolvedValue(mockClasses);

            const result = await classService.getClasses({ subjectId: 'sub1' });

            expect(prisma.class.findMany).toHaveBeenCalledWith({
                where: { subjectId: 'sub1' },
                orderBy: { date: 'asc' },
                include: { subject: true }
            });
            expect(result).toEqual(mockClasses);
        });

        it('should return classes filtered by subjectId and dates', async () => {
            prisma.class.findMany.mockResolvedValue([]);
            const startDate = '2023-01-01';
            const endDate = '2023-01-31';

            await classService.getClasses({ subjectId: 'sub1', startDate, endDate });

            expect(prisma.class.findMany).toHaveBeenCalledWith({
                where: {
                    subjectId: 'sub1',
                    date: {
                        gte: new Date(startDate),
                        lte: new Date(endDate)
                    }
                },
                orderBy: { date: 'asc' },
                include: { subject: true }
            });
        });
    });

    describe('getClassesByDate', () => {
        it('should return classes for a specific date and semester', async () => {
            const mockClasses = [{ id: '1' }];
            prisma.class.findMany.mockResolvedValue(mockClasses);
            const date = '2023-01-01';

            const result = await classService.getClassesByDate(date, 'sem1');

            expect(prisma.class.findMany).toHaveBeenCalledWith({
                where: {
                    date: new Date(date),
                    subject: { semesterId: 'sem1' }
                },
                include: { subject: true },
                orderBy: { startTime: 'asc' }
            });
            expect(result).toEqual(mockClasses);
        });
    });

    describe('createClass', () => {
        it('should create a single class', async () => {
            const mockClass = { id: '1' };
            prisma.class.create.mockResolvedValue(mockClass);
            const payload = { subjectId: 'sub1', date: '2023-01-01', status: 'PRESENT' };

            const result = await classService.createClass(payload);

            expect(prisma.class.create).toHaveBeenCalledWith({
                data: {
                    subjectId: 'sub1',
                    date: new Date('2023-01-01'),
                    dayOfWeek: undefined,
                    startTime: undefined,
                    endTime: undefined,
                    status: 'PRESENT',
                    notes: undefined
                }
            });
            expect(result).toEqual(mockClass);
        });
    });

    describe('createClassesBulk', () => {
        it('should create multiple classes', async () => {
            const mockRes = { count: 2 };
            prisma.class.createMany.mockResolvedValue(mockRes);
            const classes = [
                { subjectId: 'sub1', date: '2023-01-01' },
                { subjectId: 'sub1', date: '2023-01-02' }
            ];

            const result = await classService.createClassesBulk(classes);

            expect(prisma.class.createMany).toHaveBeenCalledWith({
                data: [
                    {
                        subjectId: 'sub1',
                        date: new Date('2023-01-01'),
                        dayOfWeek: undefined,
                        startTime: undefined,
                        endTime: undefined,
                        status: 'SCHEDULED',
                        notes: undefined
                    },
                    {
                        subjectId: 'sub1',
                        date: new Date('2023-01-02'),
                        dayOfWeek: undefined,
                        startTime: undefined,
                        endTime: undefined,
                        status: 'SCHEDULED',
                        notes: undefined
                    }
                ]
            });
            expect(result).toEqual(mockRes);
        });
    });

    describe('updateClass', () => {
        it('should update a single class', async () => {
            const mockClass = { id: '1', status: 'ABSENT' };
            prisma.class.update.mockResolvedValue(mockClass);

            const result = await classService.updateClass('1', { status: 'ABSENT' });

            expect(prisma.class.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: { status: 'ABSENT' }
            });
            expect(result).toEqual(mockClass);
        });
    });

    describe('markAttendance', () => {
        it('should mark attendance for a class', async () => {
            const mockClass = { id: '1', status: 'PRESENT' };
            prisma.class.update.mockResolvedValue(mockClass);

            const result = await classService.markAttendance('1', { status: 'PRESENT' });

            expect(prisma.class.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: { status: 'PRESENT' }
            });
            expect(result).toEqual(mockClass);
        });
    });

    describe('markAttendanceBulk', () => {
        it('should group updates by status and perform a transaction', async () => {
            prisma.$transaction.mockResolvedValueOnce([{ count: 2 }, { count: 1 }]);

            const updates = [
                { id: '1', status: 'PRESENT' },
                { id: '2', status: 'PRESENT' },
                { id: '3', status: 'ABSENT' }
            ];

            const result = await classService.markAttendanceBulk(updates);

            expect(prisma.class.updateMany).toHaveBeenCalledTimes(2);
            expect(prisma.class.updateMany).toHaveBeenCalledWith({
                where: { id: { in: ['1', '2'] } },
                data: { status: 'PRESENT' }
            });
            expect(prisma.class.updateMany).toHaveBeenCalledWith({
                where: { id: { in: ['3'] } },
                data: { status: 'ABSENT' }
            });
            expect(result).toEqual([{ count: 2 }, { count: 1 }]);
        });
    });

    describe('deleteClass', () => {
        it('should delete a class', async () => {
            prisma.class.delete.mockResolvedValue({});

            const result = await classService.deleteClass('1');

            expect(prisma.class.delete).toHaveBeenCalledWith({ where: { id: '1' } });
            expect(result).toEqual({ message: 'Class deleted successfully' });
        });
    });

    describe('markSubjectAttendanceDate', () => {
        it('should format date incorrectly and throw AppError', async () => {
            await expect(classService.markSubjectAttendanceDate('sub1', 'invalid-date', 'PRESENT'))
                .rejects
                .toThrow(new AppError('Invalid date format', 400));
        });

        it('should create a new class when no existing class is found', async () => {
            prisma.class.findFirst.mockResolvedValue(null);
            const mockCreatedClass = { id: 'new', status: 'PRESENT' };
            prisma.class.create.mockResolvedValue(mockCreatedClass);

            const result = await classService.markSubjectAttendanceDate('sub1', '2023-01-01', 'PRESENT', 2);

            expect(prisma.userCourse.update).toHaveBeenCalledWith({
                where: { id: 'sub1' },
                data: {
                    totalClassesConducted: { increment: 2 },
                    totalClassesAttended: { increment: 2 }
                }
            });
            expect(prisma.class.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    subjectId: 'sub1',
                    status: 'PRESENT',
                    weightage: 2
                })
            });
            expect(result).toEqual(mockCreatedClass);
        });

        it('should update existing class and adjust counters correctly', async () => {
            const existingClass = { id: '1', status: 'ABSENT', weightage: 1 };
            prisma.class.findFirst.mockResolvedValue(existingClass);
            const mockUpdatedClass = { id: '1', status: 'PRESENT', weightage: 1 };
            prisma.class.update.mockResolvedValue(mockUpdatedClass);

            const result = await classService.markSubjectAttendanceDate('sub1', '2023-01-01', 'PRESENT', 1);

            // ABSENT (0 attended) -> PRESENT (1 attended). Conducted is unchanged.
            expect(prisma.userCourse.update).toHaveBeenCalledWith({
                where: { id: 'sub1' },
                data: {
                    totalClassesConducted: { increment: 0 },
                    totalClassesAttended: { increment: 1 }
                }
            });
            expect(prisma.class.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: { status: 'PRESENT', weightage: 1 }
            });
            expect(result).toEqual(mockUpdatedClass);
        });

        it('should return existing class directly if status and weightage are unchanged', async () => {
            const existingClass = { id: '1', status: 'PRESENT', weightage: 1 };
            prisma.class.findFirst.mockResolvedValue(existingClass);

            const result = await classService.markSubjectAttendanceDate('sub1', '2023-01-01', 'PRESENT', 1);

            expect(prisma.userCourse.update).not.toHaveBeenCalled();
            expect(prisma.class.update).not.toHaveBeenCalled();
            expect(result).toEqual(existingClass);
        });
    });
});
