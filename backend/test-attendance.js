const prisma = require('./src/prisma');
const classService = require('./src/services/classService');
const courseService = require('./src/services/courseService');

async function test() {
    console.log('--- Starting Attendance Test ---');

    // 1. Setup: Create User, Semester, Course
    // For simplicity, let's assume a user exists or create one.
    // Actually, let's just pick the first user or create a temp one.

    // START TRANSACTION to rollback later? No, let's just create and delete.

    try {
        const user = await prisma.user.create({
            data: {
                email: `test_${Date.now()}@example.com`,
                password: 'password123',
                name: 'Test User'
            }
        });
        console.log('Created User:', user.id);

        const semester = await prisma.semester.create({
            data: {
                name: 'Test Sem',
                startDate: new Date(),
                endDate: new Date(Date.now() + 86400000 * 30),
                userId: user.id
            }
        });
        console.log('Created Semester:', semester.id);

        const course = await courseService.createCourse(user.id, {
            semesterId: semester.id,
            courseName: 'Test Subject',
            courseCode: 'TEST101',
            teacher: 'Dr. Test',
            classesPerWeek: 1,
            maxAllowedAbsences: 5,
            startDate: new Date(),
            endDate: new Date(),
            classDays: [] // No scheduled classes initially
        });
        console.log('Created Course:', course.id);

        // 2. Mark Present (New date)
        const date = new Date().toISOString().split('T')[0];
        console.log(`Marking PRESENT for ${date}`);
        await classService.markSubjectAttendanceDate(course.id, date, 'PRESENT');

        // Verify Stats
        let updatedCourse = await prisma.userCourse.findUnique({ where: { id: course.id } });
        console.log('Stats after PRESENT:', {
            conducted: updatedCourse.totalClassesConducted,
            attended: updatedCourse.totalClassesAttended
        });

        if (updatedCourse.totalClassesConducted !== 1 || updatedCourse.totalClassesAttended !== 1) {
            throw new Error('Stats mismatch after PRESENT');
        }

        // 3. Change to Absent
        console.log(`Changing to ABSENT for ${date}`);
        await classService.markSubjectAttendanceDate(course.id, date, 'ABSENT');

        updatedCourse = await prisma.userCourse.findUnique({ where: { id: course.id } });
        console.log('Stats after ABSENT:', {
            conducted: updatedCourse.totalClassesConducted,
            attended: updatedCourse.totalClassesAttended
        });

        if (updatedCourse.totalClassesConducted !== 1 || updatedCourse.totalClassesAttended !== 0) {
            throw new Error('Stats mismatch after ABSENT');
        }

        // 4. Mark Present again
        console.log(`Changing back to PRESENT for ${date}`);
        await classService.markSubjectAttendanceDate(course.id, date, 'PRESENT');

        updatedCourse = await prisma.userCourse.findUnique({ where: { id: course.id } });
        console.log('Stats after Re-PRESENT:', {
            conducted: updatedCourse.totalClassesConducted,
            attended: updatedCourse.totalClassesAttended
        });

        if (updatedCourse.totalClassesConducted !== 1 || updatedCourse.totalClassesAttended !== 1) {
            throw new Error('Stats mismatch after Re-PRESENT');
        }

        // 5. Cleanup
        await prisma.user.delete({ where: { id: user.id } }); // Cascades? Hopefully.
        // If not cascade, we might leave junk.
        // prisma schema says: 
        // user -> semesters
        // semester -> subjects
        // subject -> classes
        // Cascades are not explicit in many places in schema provided earlier.
        // User->Semester relation in schema: `semesters Semester[]`
        // Semester->User: `user User @relation(...)`
        // If onDelete is not set, we might fail deleting user.

        // Let's delete explicitly nicely.
        await prisma.class.deleteMany({ where: { subjectId: course.id } });
        await prisma.userCourse.delete({ where: { id: course.id } });
        await prisma.semester.delete({ where: { id: semester.id } });
        await prisma.user.delete({ where: { id: user.id } });

        console.log('Cleanup successful');
        console.log('TEST PASSED');

    } catch (e) {
        console.error('TEST FAILED:', e);
    } finally {
        await prisma.$disconnect();
    }
}

test();
