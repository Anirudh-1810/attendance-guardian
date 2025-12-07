const request = require('supertest');
const prisma = require('./src/prisma');

const TEST_USER = {
    email: 'test-subject-flow@example.com',
    password: 'password123',
    name: 'Test User'
};

async function runTest() {
    try {
        console.log('--- Starting Verification Test ---');

        // 1. Signup/Login
        console.log('1. Authenticating...');
        let token;
        try {
            const res = await request('http://localhost:4000') // Use running server
                .post('/api/auth/signup')
                .send(TEST_USER);
            if (res.status === 201 || res.status === 200) {
                token = res.body.token;
            } else {
                // Try login if already exists
                const loginRes = await request('http://localhost:4000')
                    .post('/api/auth/login')
                    .send({ email: TEST_USER.email, password: TEST_USER.password });
                token = loginRes.body.token;
            }
        } catch (e) {
            console.error('Auth failed:', e);
            return;
        }

        if (!token) {
            console.error('Failed to get token');
            return;
        }
        console.log('   Authenticated. Token received.');

        // 2. Get Current Semester (Auto-create check)
        console.log('2. Fetching Current Semester...');
        const semRes = await request('http://localhost:4000')
            .get('/api/semesters/current')
            .set('Authorization', `Bearer ${token}`);

        if (semRes.status !== 200) {
            console.error('   Failed to get semester:', semRes.body);
            return;
        }
        const semester = semRes.body;
        console.log('   Semester found/created:', semester.name, semester.id);

        // 3. Add Subject
        console.log('3. Adding Subject...');
        const subjectData = {
            semesterId: semester.id,
            courseName: 'Test Subject 101',
            courseCode: 'TS101',
            teacher: 'Prof. Test',
            classesPerWeek: 4,
            maxAllowedAbsences: 5
        };

        const addRes = await request('http://localhost:4000')
            .post('/api/courses')
            .set('Authorization', `Bearer ${token}`)
            .send(subjectData);

        if (addRes.status !== 200) {
            console.error('   Failed to add subject:', addRes.body);
            return;
        }
        console.log('   Subject added:', addRes.body.courseName);

        // 4. Verify Persistence (Fetch subjects)
        console.log('4. Verifying Persistence...');
        const fetchRes = await request('http://localhost:4000')
            .get(`/api/courses/${semester.id}`)
            .set('Authorization', `Bearer ${token}`);

        const subjects = fetchRes.body;
        const found = subjects.find(s => s.courseCode === 'TS101');

        if (found) {
            console.log('   SUCCESS: Subject found in database!');
            console.log('   Teacher:', found.teacher);
        } else {
            console.error('   FAILURE: Subject not found in list.');
        }

        console.log('--- Test Completed ---');

    } catch (error) {
        console.error('Test failed with error:', error);
    }
}

runTest();
