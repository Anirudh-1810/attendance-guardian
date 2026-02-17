const prisma = require('../prisma');
const AppError = require('../utils/AppError');

class CourseService {
    async createCourse(userId, data) {
        const {
            semesterId,
            courseCode,
            courseName,
            teacher,
            totalClassesConducted,
            totalClassesAttended,
            classesPerWeek,
            maxAllowedAbsences,
            medicalLeavesAllowed,
            dutyLeavesAllowed,
            startDate,
            endDate,
            classDays
        } = data;

        // Verify semester ownership
        const semester = await prisma.semester.findFirst({
            where: { id: semesterId, userId },
        });

        if (!semester) {
            throw new AppError('Semester not found or not yours', 403);
        }

        const dateFns = require('date-fns');
        const { eachDayOfInterval, isSameDay, getDay, parseISO } = dateFns;

        // Helper to map day mapping
        const dayMap = {
            'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6
        };

        return await prisma.$transaction(async (tx) => {
            // 1. Create the Course
            const newCourse = await tx.userCourse.create({
                data: {
                    semesterId,
                    courseCode,
                    courseName,
                    teacher,
                    totalClassesConducted: totalClassesConducted ?? 0,
                    totalClassesAttended: totalClassesAttended ?? 0,
                    classesPerWeek,
                    maxAllowedAbsences,
                    medicalLeavesAllowed: medicalLeavesAllowed ?? 0,
                    dutyLeavesAllowed: dutyLeavesAllowed ?? 0,
                },
            });

            // 2. Generate Classes if schedule provided
            if (startDate && endDate && classDays && classDays.length > 0) {
                const start = new Date(startDate);
                const end = new Date(endDate);

                const allDates = eachDayOfInterval({ start, end });

                const classesToCreate = [];

                for (const date of allDates) {
                    const dayIndex = getDay(date); // 0-6
                    // Find if this day matches any class day
                    // classDays example: [{ day: 'Mon', time: '10:00', weightage: 1 }]

                    const schedulesForDay = classDays.filter(cd => dayMap[cd.day] === dayIndex);

                    for (const schedule of schedulesForDay) {
                        classesToCreate.push({
                            subjectId: newCourse.id,
                            date: date,
                            dayOfWeek: dayIndex,
                            startTime: schedule.time,
                            status: 'SCHEDULED',
                        });
                    }
                }

                if (classesToCreate.length > 0) {
                    await tx.class.createMany({
                        data: classesToCreate,
                    });

                    // Update total classes count
                    await tx.userCourse.update({
                        where: { id: newCourse.id },
                        data: { totalClassesConducted: classesToCreate.length }
                    });
                    newCourse.totalClassesConducted = classesToCreate.length;
                }
            }

            return newCourse;
        });
    }

    async getCoursesBySemester(userId, semesterId) {
        // Verify semester ownership
        const semester = await prisma.semester.findFirst({
            where: { id: semesterId, userId },
        });

        if (!semester) {
            throw new AppError('Semester not found or not yours', 403);
        }

        const courses = await prisma.userCourse.findMany({
            where: { semesterId },
            orderBy: { createdAt: 'asc' },
        });

        // Business Logic: Calculate Attendance Percentage
        return courses.map((c) => {
            const done = c.totalClassesConducted;
            const attended = c.totalClassesAttended;
            const percent = done === 0 ? 0 : (attended / done) * 100;

            return {
                ...c,
                attendancePercent: Number(percent.toFixed(2)),
            };
        });
    }
}

module.exports = new CourseService();
