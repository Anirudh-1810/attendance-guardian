const prisma = require('../prisma');
const AppError = require('../utils/AppError');

class SemesterService {
    async getAllSemesters(userId) {
        return await prisma.semester.findMany({
            where: { userId },
            include: {
                subjects: true,
            },
            orderBy: { startDate: 'desc' },
        });
    }

    async getCurrentSemester(userId) {
        const now = new Date();

        let semester = await prisma.semester.findFirst({
            where: {
                userId,
                startDate: { lte: now },
                endDate: { gte: now },
            },
            include: {
                subjects: true,
                holidays: true,
            },
        });

        // Auto-create if no semester exists (Business Logic)
        if (!semester) {
            const startDate = new Date();
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 6); // Default 6 months

            semester = await prisma.semester.create({
                data: {
                    name: "Semester 1",
                    startDate,
                    endDate,
                    requiredPercentage: 75,
                    userId
                },
                include: {
                    subjects: true,
                    holidays: true
                }
            });
        }

        return semester;
    }

    async createSemester(userId, data) {
        const { name, startDate, endDate, requiredPercentage } = data;

        return await prisma.semester.create({
            data: {
                name,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                requiredPercentage: requiredPercentage || 75,
                userId,
            },
        });
    }

    async updateSemester(userId, semesterId, data) {
        // Verify ownership
        const existing = await prisma.semester.findFirst({ where: { id: semesterId, userId } });
        if (!existing) {
            throw new AppError('Semester not found', 404);
        }

        const { name, startDate, endDate, requiredPercentage } = data;

        return await prisma.semester.update({
            where: { id: semesterId },
            data: {
                ...(name && { name }),
                ...(startDate && { startDate: new Date(startDate) }),
                ...(endDate && { endDate: new Date(endDate) }),
                ...(requiredPercentage && { requiredPercentage }),
            },
        });
    }

    async deleteSemester(userId, semesterId) {
        // Verify ownership
        const existing = await prisma.semester.findFirst({ where: { id: semesterId, userId } });
        if (!existing) {
            throw new AppError('Semester not found', 404);
        }

        await prisma.semester.delete({ where: { id: semesterId } });
        return { message: 'Semester deleted successfully' };
    }
}

module.exports = new SemesterService();
