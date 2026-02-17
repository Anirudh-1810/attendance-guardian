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
            include: { subject: true },
        });
    }

    async createClassesBulk(classes) {
        return await prisma.$transaction(
            classes.map(cls =>
                prisma.class.create({
                    data: {
                        subjectId: cls.subjectId,
                        date: new Date(cls.date),
                        dayOfWeek: cls.dayOfWeek,
                        startTime: cls.startTime,
                        endTime: cls.endTime,
                        status: cls.status || 'SCHEDULED',
                        notes: cls.notes,
                    },
                })
            )
        );
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
            include: { subject: true },
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
            include: { subject: true },
        });
    }

    async markAttendanceBulk(updates) {
        return await prisma.$transaction(
            updates.map(({ id, status, notes }) =>
                prisma.class.update({
                    where: { id },
                    data: {
                        status,
                        ...(notes && { notes }),
                    },
                })
            )
        );
    }

    async deleteClass(id) {
        await prisma.class.delete({ where: { id } });
        return { message: 'Class deleted successfully' };
    }
}

module.exports = new ClassService();
