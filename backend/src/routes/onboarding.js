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

        // 2. Create Subjects (batch — single DB round trip)
        const subjectsData = subjects.map(sub => ({
            semesterId: semester.id,
            courseCode: sub.name.substring(0, 3).toUpperCase(), // Mock code
            courseName: sub.name,
            requiredPercentage: sub.requiredPercentage || 75,
            totalClassesAttended: sub.initialAttended || 0,
            totalClassesConducted: sub.initialTotal || 0,
            classesPerWeek: 0,
            maxAllowedAbsences: 0,
        }));

        await prisma.userCourse.createMany({ data: subjectsData });

        // Fetch created subjects to get their IDs for timetable mapping
        const createdSubjects = await prisma.userCourse.findMany({
            where: { semesterId: semester.id },
            orderBy: { createdAt: 'asc' },
        });

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
        res.status(500).json({ message: 'Failed to save onboarding data', error: error.message, stack: error.stack });
    }
});

// POST /api/onboarding/update
// Body: {
//   semesterId: string,
//   subjects: { name: string, requiredPercentage: number, initialAttended?: number, initialTotal?: number }[],
//   timetable: { day: number, slot: number, subjectIndex: number }[]
// }
router.post('/update', auth, async (req, res) => {
    try {
        const { semesterId, subjects, timetable } = req.body;
        const userId = req.user.userId;

        // 1. Verify Semester Ownership
        const semester = await prisma.semester.findFirst({
            where: { id: semesterId, userId }
        });

        if (!semester) {
            return res.status(403).json({ message: 'Semester not found or not yours' });
        }

        // 2. Create New Subjects
        const subjectsData = subjects.map(sub => ({
            semesterId: semester.id,
            courseCode: sub.name.substring(0, 3).toUpperCase(),
            courseName: sub.name,
            requiredPercentage: sub.requiredPercentage || 75,
            totalClassesAttended: sub.initialAttended || 0,
            totalClassesConducted: sub.initialTotal || 0,
            classesPerWeek: 0,
            maxAllowedAbsences: 0,
        }));

        const existingCount = await prisma.userCourse.count({ where: { semesterId: semester.id } });

        await prisma.userCourse.createMany({ data: subjectsData });

        // Fetch subjects again to resolve correct IDs for timetable. 
        // We skip the existing ones to map indices correctly 0, 1, 2... for the newly added items.
        const createdSubjects = await prisma.userCourse.findMany({
            where: { semesterId: semester.id },
            orderBy: { createdAt: 'asc' },
            skip: existingCount
        });

        // 3. Update TimeTable
        // The timetable contains { day, slot, subjectIndex } for NEW assignments
        if (timetable && timetable.length > 0) {
            const newTimetableData = timetable.map(entry => {
                // Here, entry.subjectIndex corresponds to the position in the new subjects array created
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

            if (newTimetableData.length > 0) {
                // Remove existing timetable slots for the exact day and slot that are being overwritten
                for (const slot of newTimetableData) {
                    await prisma.timeTable.deleteMany({
                        where: {
                            semesterId: semester.id,
                            dayOfWeek: slot.dayOfWeek,
                            slot: slot.slot
                        }
                    });
                }

                await prisma.timeTable.createMany({
                    data: newTimetableData
                });
            }
        }

        res.json({ message: 'Semester updated successfully', semesterId: semester.id });

    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ message: 'Failed to update semester data', error: error.message, stack: error.stack });
    }
});

module.exports = router;
