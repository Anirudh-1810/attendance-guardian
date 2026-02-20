const prisma = require('../prisma');
const AppError = require('../utils/AppError');

class ClassService {
    async getClasses(query) {
        const { subjectId, startDate, endDate } = query;

        const where = { subjectId };
        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate);
            if (endDate) where.date.lte = new Date(endDate);
        }

        return await prisma.class.findMany({
            where,
            orderBy: { date: 'asc' },
            include: { subject: true },
        });
    }

    async getClassesByDate(date, semesterId) {
        return await prisma.class.findMany({
            where: {
                date: new Date(date),
                subject: {
                    semesterId,
                },
            },
            include: {
                subject: true,
            },
            orderBy: { startTime: 'asc' },
        });
    }

    async createClass(data) {
        const { subjectId, date, dayOfWeek, startTime, endTime, status, notes } = data;

        return await prisma.class.create({
            data: {
                subjectId,
                date: new Date(date),
                dayOfWeek,
                startTime,
                endTime,
                status: status || 'SCHEDULED',
                notes,
            },
        });
    }

    async createClassesBulk(classes) {
        return await prisma.class.createMany({
            data: classes.map(cls => ({
                subjectId: cls.subjectId,
                date: new Date(cls.date),
                dayOfWeek: cls.dayOfWeek,
                startTime: cls.startTime,
                endTime: cls.endTime,
                status: cls.status || 'SCHEDULED',
                notes: cls.notes,
            })),
        });
    }

    async updateClass(id, data) {
        const { date, dayOfWeek, startTime, endTime, status, notes } = data;

        return await prisma.class.update({
            where: { id },
            data: {
                ...(date && { date: new Date(date) }),
                ...(dayOfWeek && { dayOfWeek }),
                ...(startTime && { startTime }),
                ...(endTime && { endTime }),
                ...(status && { status }),
                ...(notes !== undefined && { notes }),
            },
        });
    }

    async markAttendance(id, data) {
        const { status, notes } = data;

        return await prisma.class.update({
            where: { id },
            data: {
                status,
                ...(notes && { notes }),
            },
        });
    }

    async markAttendanceBulk(updates) {
        // Group updates by status for batch updateMany calls
        const statusGroups = {};
        for (const { id, status } of updates) {
            if (!statusGroups[status]) statusGroups[status] = [];
            statusGroups[status].push(id);
        }

        const operations = Object.entries(statusGroups).map(([status, ids]) =>
            prisma.class.updateMany({
                where: { id: { in: ids } },
                data: { status },
            })
        );

        return await prisma.$transaction(operations);
    }

    async deleteClass(id) {
        await prisma.class.delete({ where: { id } });
        return { message: 'Class deleted successfully' };
    }

    async markSubjectAttendanceDate(subjectId, dateStr, status, weightage = 1) {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
            throw new AppError('Invalid date format', 400);
        }

        return await prisma.$transaction(async (tx) => {
            // 1. Find existing class for this subject on this date
            const existingClass = await tx.class.findFirst({
                where: { subjectId, date },
            });

            let conductedDelta = 0;
            let attendedDelta = 0;

            if (!existingClass) {
                // Case: New Class
                conductedDelta = weightage;
                if (status === 'PRESENT') {
                    attendedDelta = weightage;
                }
            } else {
                // Case: Updating Existing Class
                const oldStatus = existingClass.status;
                const oldWeightage = existingClass.weightage || 1;

                // If status AND weightage are same, do nothing
                if (oldStatus === status && oldWeightage === weightage) {
                    return existingClass;
                }

                // Reverse old impact
                conductedDelta -= oldWeightage;
                if (oldStatus === 'PRESENT') {
                    attendedDelta -= oldWeightage;
                }

                // Add new impact
                conductedDelta += weightage;
                if (status === 'PRESENT') {
                    attendedDelta += weightage;
                }
            }

            // 2. Atomic counter update — no need to fetch subject first
            if (conductedDelta !== 0 || attendedDelta !== 0) {
                await tx.userCourse.update({
                    where: { id: subjectId },
                    data: {
                        totalClassesConducted: { increment: conductedDelta },
                        totalClassesAttended: { increment: attendedDelta },
                    },
                });
            }

            // 3. Create or Update Class Record (no include: { subject: true })
            if (existingClass) {
                return await tx.class.update({
                    where: { id: existingClass.id },
                    data: { status, weightage },
                });
            } else {
                const dayOfWeek = date.getDay();
                return await tx.class.create({
                    data: {
                        subjectId,
                        date,
                        dayOfWeek,
                        status,
                        weightage,
                        startTime: '00:00',
                        endTime: '00:00',
                    },
                });
            }
        });
    }
}

module.exports = new ClassService();
