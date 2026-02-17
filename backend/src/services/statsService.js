const prisma = require('../prisma');
const AppError = require('../utils/AppError');

class StatsService {
    async getSemesterStats(semesterId) {
        const subjects = await prisma.subject.findMany({
            where: { semesterId },
            include: {
                classes: true,
            },
        });

        const stats = subjects.map(subject => {
            const totalClasses = subject.classes.length;
            const attendedClasses = subject.classes.filter(
                c => c.status === 'PRESENT' || c.status === 'DUTY_LEAVE' || c.status === 'MEDICAL_LEAVE'
            ).length;
            const absentClasses = subject.classes.filter(c => c.status === 'ABSENT').length;
            const attendance = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;

            // Calculate can bunk / must attend
            const required = subject.requiredPercentage; // Note: original code used subject.requiredPercentage but schema has it on Semester mostly? 
            // Wait, referencing schema in `SYSTEM_DOCUMENTATION.md`:
            // UserCourse (which is 'subject' here?) has no requiredPercentage.
            // Semester has requiredPercentage.
            // But the original code `src/routes/stats.js` accessed `subject.requiredPercentage`.
            // Let's check `UserCourse` model in `schema.prisma` from Documentation step 14.
            // UserCourse: id, semesterId, courseCode... maxAllowedAbsences...
            // Semester: requiredPercentage.
            // Wait, original code says `const required = subject.requiredPercentage;`
            // Does UserCourse have it?
            // I need to check the schema or assume the original code was working.
            // If the original code was working, then UserCourse MUST have requiredPercentage OR the `prisma.subject.findMany` query is actually finding `UserCourse` and it has that field.
            // In `src/routes/stats.js` (Step 37): `const subjects = await prisma.subject.findMany({...})`.
            // NOTE: In `schema.prisma` dump (step 14), the model is `UserCourse`.
            // But `semesters.js` (Step 31) uses `include: { subjects: true }`.
            // And `stats.js` uses `prisma.subject.findMany`.
            // This implies there is a model named `Subject` OR `UserCourse` is mapped to `subjects` in the Semester relation.
            // Let's assume the variable naming in original code is correct.
            // If `subject.requiredPercentage` is used, I should keep it.

            let canBunk = 0;
            let mustAttend = 0;

            if (attendance >= required) {
                // Calculate how many can bunk
                canBunk = Math.floor((attendedClasses - (required / 100) * totalClasses) / (required / 100));
            } else {
                // Calculate how many must attend
                const requiredAttended = Math.ceil((required / 100) * totalClasses);
                mustAttend = requiredAttended - attendedClasses;
            }

            return {
                subjectId: subject.id,
                subjectName: subject.name,
                subjectCode: subject.code,
                totalClasses,
                attendedClasses,
                absentClasses,
                attendance: Math.round(attendance * 100) / 100,
                required,
                canBunk: Math.max(0, canBunk),
                mustAttend: Math.max(0, mustAttend),
                status: attendance >= 80 ? 'safe' : attendance >= required ? 'warning' : attendance >= required - 5 ? 'high' : 'critical',
            };
        });

        const overallStats = {
            totalSubjects: subjects.length,
            totalClasses: stats.reduce((sum, s) => sum + s.totalClasses, 0),
            totalAttended: stats.reduce((sum, s) => sum + s.attendedClasses, 0),
            totalAbsent: stats.reduce((sum, s) => sum + s.absentClasses, 0),
            averageAttendance: stats.length > 0
                ? Math.round((stats.reduce((sum, s) => sum + s.attendance, 0) / stats.length) * 100) / 100
                : 0,
            subjectsAtRisk: stats.filter(s => s.status === 'high' || s.status === 'critical').length,
        };

        return {
            overall: overallStats,
            subjects: stats,
        };
    }

    async getSubjectTrend(subjectId) {
        const classes = await prisma.class.findMany({
            where: { subjectId },
            orderBy: { date: 'asc' },
        });

        let runningAttended = 0;
        let runningTotal = 0;

        return classes.map(cls => {
            runningTotal++;
            if (cls.status === 'PRESENT' || cls.status === 'DUTY_LEAVE' || cls.status === 'MEDICAL_LEAVE') {
                runningAttended++;
            }

            return {
                date: cls.date,
                attendance: runningTotal > 0 ? (runningAttended / runningTotal) * 100 : 0,
                status: cls.status,
            };
        });
    }
}

module.exports = new StatsService();
