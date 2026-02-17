const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    console.log(`Checking Smart Selection Logic for ${users.length} users...`);

    const now = new Date();

    for (const user of users) {
        console.log(`\nUser: ${user.email}`);

        const allSemesters = await prisma.semester.findMany({
            where: { userId: user.id },
            include: {
                subjects: true
            },
            orderBy: { startDate: 'desc' },
        });

        let semester = null;
        let activeSemester = null;
        let latestDataSemester = null;

        // 2. Analyze semesters
        for (const s of allSemesters) {
            // Check if active (date match)
            const isActive = new Date(s.startDate) <= now && new Date(s.endDate) >= now;
            if (isActive && !activeSemester) {
                activeSemester = s;
            }

            // Check for data (has subjects) - prioritize most recent ones (already sorted desc)
            if (s.subjects.length > 0 && !latestDataSemester) {
                latestDataSemester = s;
            }
        }

        let reason = "";

        // 3. Smart Selection Logic
        // Priority 1: Active semester WITH data
        if (activeSemester && activeSemester.subjects.length > 0) {
            semester = activeSemester;
            reason = "Active semester WITH data";
        }
        // Priority 2: Latest semester WITH data (fallback if active is empty or missing)
        else if (latestDataSemester) {
            semester = latestDataSemester;
            reason = "Fallback to Latest semester WITH data";
        }
        // Priority 3: Active semester (even if empty - maybe they just started it)
        else if (activeSemester) {
            semester = activeSemester;
            reason = "Active semester (Empty)";
        }
        // Priority 4: Latest semester (even if empty)
        else if (allSemesters.length > 0) {
            semester = allSemesters[0];
            reason = "Latest available (Empty)";
        } else {
            reason = "Auto-create New";
        }

        if (semester) {
            console.log(`  Selected: "${semester.name}" (${semester.startDate.toDateString()})`);
            console.log(`  Subjects: ${semester.subjects.length}`);
            console.log(`  Reason:   ${reason}`);
        } else {
            console.log(`  Selected: NONE`);
            console.log(`  Reason:   ${reason}`);
        }
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
