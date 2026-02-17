const prisma = require('../prisma');
const AppError = require('../utils/AppError');

class HolidayService {
    async getHolidays(semesterId) {
        return await prisma.holiday.findMany({
            where: { semesterId },
            orderBy: { date: 'asc' },
        });
    }

    async createHoliday(data) {
        const { date, name, type, semesterId } = data;

        return await prisma.holiday.create({
            data: {
                date: new Date(date),
                name,
                type: type || 'HOLIDAY',
                semesterId,
            },
        });
    }

    async createHolidaysBulk(holidays) {
        return await prisma.$transaction(
            holidays.map(holiday =>
                prisma.holiday.create({
                    data: {
                        date: new Date(holiday.date),
                        name: holiday.name,
                        type: holiday.type || 'HOLIDAY',
                        semesterId: holiday.semesterId,
                    },
                })
            )
        );
    }

    async deleteHoliday(id) {
        await prisma.holiday.delete({ where: { id } });
        return { message: 'Holiday deleted successfully' };
    }
}

module.exports = new HolidayService();
