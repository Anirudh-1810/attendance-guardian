const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    console.log(`Checking logic for ${users.length} users...`);

    const now = new Date();

    for (const user of users) {
        console.log(`\nUser: ${user.email} (${user.id})`);

        // 1. Try to find a semester that allows for the current date
        let semester = await prisma.semester.findFirst({
            where: {
                userId: user.id,
                startDate: { lte: now },
                endDate: { gte: now },
            },
            include: {
                subjects: true
            },
        });

        if (semester) {
            console.log(`  [STEP 1: DATE MATCH] Found Semester: ${semester.name} (Dates: ${semester.startDate.toDateString()} - ${semester.endDate.toDateString()})`);
            console.log(`  Subjects: ${semester.subjects.length}`);
        } else {
            console.log(`  [STEP 1: DATE MATCH] No active semester found.`);

            // 2. Fallback Logic (Only if Step 1 failed)
            semester = await prisma.semester.findFirst({
                where: { userId: user.id },
                orderBy: { startDate: 'desc' },
                include: {
                    subjects: true
                },
            });

            if (semester) {
                console.log(`  [STEP 2: FALLBACK] Found Latest Semester: ${semester.name} (Dates: ${semester.startDate.toDateString()} - ${semester.endDate.toDateString()})`);
                console.log(`  Subjects: ${semester.subjects.length}`);
            } else {
                console.log(`  [STEP 2: FALLBACK] No semester found.`);
            }
        }

        // 3. Final Result for UI
        if (semester) {
            if (semester.subjects.length > 0) {
                console.log(`  -> FINAL RESULT: Dashboard WILL show ${semester.subjects.length} subjects.`);
            } else {
                console.log(`  -> FINAL RESULT: Dashboard will show ONBOARDING (0 subjects).`);
            }
        } else {
            console.log(`  -> FINAL RESULT: Dashboard will show ONBOARDING (Auto-create new).`);
        }

        // Check if they have ANY subjects in ANY semester
        const allSemesters = await prisma.semester.findMany({
            where: { userId: user.id },
            include: { subjects: true }
        });
        const totalSubjects = allSemesters.reduce((acc, s) => acc + s.subjects.length, 0);
        console.log(`  (User has total ${totalSubjects} subjects across ${allSemesters.length} semesters)`);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
