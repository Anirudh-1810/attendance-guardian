const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Checking Users...');
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users.`);
    console.table(users.map(u => ({ id: u.id, email: u.email, name: u.name })));

    console.log('\nChecking Semesters...');
    const semesters = await prisma.semester.findMany({
        include: { subjects: true }
    });
    console.log(`Found ${semesters.length} semesters.`);
    semesters.forEach(s => {
        console.log(`Semester: ${s.name} (${s.startDate.toDateString()} - ${s.endDate.toDateString()}) - User: ${s.userId}`);
        console.log(`  Subjects: ${s.subjects.length}`);
        s.subjects.forEach(sub => {
            console.log(`    - ${sub.courseName} (${sub.courseCode})`);
        });
    });

    const now = new Date();
    console.log(`\nCurrent Server Time: ${now.toISOString()}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
