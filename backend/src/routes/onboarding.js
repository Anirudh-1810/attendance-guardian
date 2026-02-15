const express = require('express');
const prisma = require('../prisma');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/onboarding
// Body: {
//   semesterName: string,
//   startDate: string,
//   endDate: string,
//   workingDays: number[], // [1, 2, 3, 4, 5]
//   subjects: { name: string, requiredPercentage: number, initialAttended?: number, initialTotal?: number }[],
//   timetable: { day: number, slot: number, subjectIndex: number }[]
// }
router.post('/', auth, async (req, res) => {
    try {
        const { semesterName, startDate, endDate, workingDays, subjects, timetable } = req.body;
        const userId = req.user.userId;

        // 1. Create/Update Semester
        // We'll treat this as creating a NEW semester for simplicity, or updating if one exists with same name?
        // Let's create a new one to be safe, or update the "current" one if it exists.

        // For now, let's just create a new one to avoid complexity with existing data overlap
        const semester = await prisma.semester.create({
            data: {
                name: semesterName,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                workingDays: JSON.stringify(workingDays),
                userId,
                requiredPercentage: 75 // Default, subjects can override
            }
        });

        // 2. Create Subjects
        const createdSubjects = [];
        for (const sub of subjects) {
            const newSubject = await prisma.userCourse.create({
                data: {
                    semesterId: semester.id,
                    courseCode: sub.name.substring(0, 3).toUpperCase(), // Mock code
                    courseName: sub.name,
                    requiredPercentage: sub.requiredPercentage || 75,
                    totalClassesAttended: sub.initialAttended || 0,
                    totalClassesConducted: sub.initialTotal || 0,
                    classesPerWeek: 0, // Will calculate later or leave 0
                    maxAllowedAbsences: 0,
                    // Default values

                }
            });
            createdSubjects.push(newSubject);
        }

        // 3. Create TimeTable
        // timetable entry: { day: 1, slot: 1, subjectIndex: 0 } (subjectIndex maps to subjects array)
        if (timetable && timetable.length > 0) {
            const timetableData = timetable.map(entry => {
                if (entry.subjectIndex !== null && entry.subjectIndex >= 0 && entry.subjectIndex < createdSubjects.length) {
                    return {
                        semesterId: semester.id,
                        dayOfWeek: entry.day,
                        slot: entry.slot,
                        subjectId: createdSubjects[entry.subjectIndex].id
                    };
                }
                return null;
            }).filter(Boolean);

            if (timetableData.length > 0) {
                await prisma.timeTable.createMany({
                    data: timetableData
                });
            }
        }

        res.json({ message: 'Onboarding complete', semesterId: semester.id });

    } catch (error) {
        console.error('Onboarding error:', error);
        res.status(500).json({ message: 'Failed to save onboarding data' });
    }
});

module.exports = router;
