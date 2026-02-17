const fetch = require('node-fetch');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

async function main() {
    // 1. Get a specific user for testing fallback logic (Future semester)
    const userId = 'bbd542e2-8660-44e7-8a3a-0b02d68229ab'; // User with Fall 2026 semester
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
        console.log('User not found!');
        return;
    }
    console.log(`Testing with user: ${user.email} (${user.id})`);

    // 2. Generate a token (mocking auth)
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });

    // 3. Make request to /api/semesters/current
    try {
        const response = await fetch('http://localhost:3001/api/semesters/current', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('\nResponse from /api/semesters/current:');
        if (data && data.id) {
            console.log(`Success! Returned Semester: ${data.name}`);
            console.log(`Date Range: ${data.startDate} - ${data.endDate}`);
            console.log(`Subjects count: ${data.subjects ? data.subjects.length : 0}`);
        } else {
            console.log('Failed! No semester returned or unexpected format.');
            console.log(JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
