const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Attempting to connect to the database...');
        await prisma.$connect();
        console.log('Successfully connected to the database.');

        // rapid check
        const userCount = await prisma.user.count();
        console.log(`Connection verified. User count: ${userCount}`);

        await prisma.$disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Failed to connect to the database:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

main();
