
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'verify@example.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // cleanup
    await prisma.class.deleteMany({});
    await prisma.timeTable.deleteMany({});
    await prisma.userCourse.deleteMany({});
    await prisma.semester.deleteMany({});
    await prisma.user.deleteMany({ where: { email } });

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name: 'Verification User',
        },
    });

    const semester = await prisma.semester.create({
        data: {
            userId: user.id,
            name: 'Semester 5',
            startDate: new Date(),
            endDate: new Date(new Date().setMonth(new Date().getMonth() + 4)),
            requiredPercentage: 75,
            workingDays: JSON.stringify([1, 2, 3, 4, 5]),
        },
    });

    // Subject 1: Safe to Bunk
    // 90% attendance (9/10) vs 75% required
    await prisma.userCourse.create({
        data: {
            semesterId: semester.id,
            courseName: 'Cloud Computing',
            courseCode: 'CS501',
            teacher: 'Dr. Cloud',
            requiredPercentage: 75,
            totalClassesConducted: 10,
            totalClassesAttended: 9,
            classesPerWeek: 4,
            maxAllowedAbsences: 0,
        },
    });

    // Subject 2: Must Attend
    // 60% attendance (6/10) vs 75% required
    await prisma.userCourse.create({
        data: {
            semesterId: semester.id,
            courseName: 'Network Security',
            courseCode: 'CS502',
            teacher: 'Prof. Secure',
            requiredPercentage: 75,
            totalClassesConducted: 10,
            totalClassesAttended: 6,
            classesPerWeek: 3,
            maxAllowedAbsences: 0,
        },
    });

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
