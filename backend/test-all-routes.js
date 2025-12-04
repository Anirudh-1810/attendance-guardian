const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:4000';
let authToken = '';
let userId = '';
let semesterId = '';
let courseId = '';
let classId = '';
let holidayId = '';

// Helper function
async function makeRequest(url, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        ...options.headers,
    };

    const response = await fetch(url, {
        ...options,
        headers,
    });

    const text = await response.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        data = text;
    }

    return { response, data };
}

// Setup: Create user and semester
async function setup() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   SETUP: Creating User & Semester     ║');
    console.log('╚════════════════════════════════════════╝');

    // Create user
    const { data: authData } = await makeRequest(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        body: JSON.stringify({
            name: 'Full Test User',
            email: `full-test-${Date.now()}@example.com`,
            password: 'password123'
        })
    });

    authToken = authData.token;
    userId = authData.user.id;
    console.log('✅ User created:', userId);

    // Create semester
    const { data: semData } = await makeRequest(`${BASE_URL}/semesters`, {
        method: 'POST',
        body: JSON.stringify({
            name: 'Test Semester',
            startDate: '2025-01-01',
            endDate: '2025-06-30',
            requiredPercentage: 75,
            userId: userId
        })
    });

    semesterId = semData.id;
    console.log('✅ Semester created:', semesterId);
}

// ==================== COURSES ROUTES ====================
async function testCourseRoutes() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   TESTING COURSES ROUTES              ║');
    console.log('╚════════════════════════════════════════╝');

    // Test 1: Create course (requires auth)
    console.log('\n=== POST /courses (Create Course) ===');
    const { response: createRes, data: createData } = await makeRequest(`${BASE_URL}/courses`, {
        method: 'POST',
        body: JSON.stringify({
            semesterId: semesterId,
            courseCode: 'CS101',
            courseName: 'Introduction to Computer Science',
            totalClassesConducted: 10,
            totalClassesAttended: 8,
            classesPerWeek: 3,
            maxAllowedAbsences: 5,
            medicalLeavesAllowed: 2,
            dutyLeavesAllowed: 1
        })
    });

    console.log('Status:', createRes.status);
    console.log('Response:', JSON.stringify(createData, null, 2));

    if (createData.id) {
        courseId = createData.id;
        console.log('✅ Course created successfully');
    } else {
        console.log('❌ Failed to create course');
    }

    // Test 2: Get courses for semester (requires auth)
    console.log('\n=== GET /courses/:semesterId (Get Courses) ===');
    const { response: getRes, data: getData } = await makeRequest(
        `${BASE_URL}/courses/${semesterId}`,
        { method: 'GET' }
    );

    console.log('Status:', getRes.status);
    console.log('Response:', JSON.stringify(getData, null, 2));
    console.log(getData.length > 0 ? '✅ Courses retrieved with attendance percentage' : '❌ No courses found');
}

// ==================== CLASS ROUTES ====================
async function testClassRoutes() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   TESTING CLASS ROUTES                ║');
    console.log('╚════════════════════════════════════════╝');

    // Test 1: Create single class
    console.log('\n=== POST /class (Create Class) ===');
    const { response: createRes, data: createData } = await makeRequest(`${BASE_URL}/class`, {
        method: 'POST',
        body: JSON.stringify({
            subjectId: courseId,
            date: '2025-01-15',
            dayOfWeek: 3,
            startTime: '09:00',
            endTime: '10:00',
            status: 'SCHEDULED',
            notes: 'First class'
        })
    });

    console.log('Status:', createRes.status);
    console.log('Response:', JSON.stringify(createData, null, 2));

    if (createData.id) {
        classId = createData.id;
        console.log('✅ Class created successfully');
    }

    // Test 2: Bulk create classes
    console.log('\n=== POST /class/bulk (Bulk Create Classes) ===');
    const { response: bulkRes, data: bulkData } = await makeRequest(`${BASE_URL}/class/bulk`, {
        method: 'POST',
        body: JSON.stringify({
            classes: [
                {
                    subjectId: courseId,
                    date: '2025-01-16',
                    dayOfWeek: 4,
                    startTime: '09:00',
                    endTime: '10:00',
                    status: 'PRESENT'
                },
                {
                    subjectId: courseId,
                    date: '2025-01-17',
                    dayOfWeek: 5,
                    startTime: '09:00',
                    endTime: '10:00',
                    status: 'ABSENT'
                }
            ]
        })
    });

    console.log('Status:', bulkRes.status);
    console.log('Created:', bulkData.length, 'classes');
    console.log(bulkData.length === 2 ? '✅ Bulk create successful' : '❌ Bulk create failed');

    // Test 3: Get classes with filters
    console.log('\n=== GET /class?subjectId=... (Get Classes) ===');
    const { response: getRes, data: getData } = await makeRequest(
        `${BASE_URL}/class?subjectId=${courseId}`,
        { method: 'GET' }
    );

    console.log('Status:', getRes.status);
    console.log('Total classes:', getData.length);
    console.log(getData.length >= 3 ? '✅ Classes retrieved' : '❌ Classes not found');

    // Test 4: Get classes by date
    console.log('\n=== GET /class/date/:date (Get Classes by Date) ===');
    const { response: dateRes, data: dateData } = await makeRequest(
        `${BASE_URL}/class/date/2025-01-16?semesterId=${semesterId}`,
        { method: 'GET' }
    );

    console.log('Status:', dateRes.status);
    console.log('Classes on 2025-01-16:', dateData.length);
    console.log(dateData.length > 0 ? '✅ Date filter works' : '⚠️ No classes on this date');

    // Test 5: Mark attendance
    console.log('\n=== PATCH /class/:id/attendance (Mark Attendance) ===');
    const { response: attendRes, data: attendData } = await makeRequest(
        `${BASE_URL}/class/${classId}/attendance`,
        {
            method: 'PATCH',
            body: JSON.stringify({
                status: 'PRESENT',
                notes: 'Attended successfully'
            })
        }
    );

    console.log('Status:', attendRes.status);
    console.log('Updated status:', attendData.status);
    console.log(attendData.status === 'PRESENT' ? '✅ Attendance marked' : '❌ Failed to mark attendance');

    // Test 6: Update class
    console.log('\n=== PUT /class/:id (Update Class) ===');
    const { response: updateRes, data: updateData } = await makeRequest(
        `${BASE_URL}/class/${classId}`,
        {
            method: 'PUT',
            body: JSON.stringify({
                startTime: '10:00',
                endTime: '11:00'
            })
        }
    );

    console.log('Status:', updateRes.status);
    console.log('Updated times:', updateData.startTime, '-', updateData.endTime);
    console.log(updateData.startTime === '10:00' ? '✅ Class updated' : '❌ Update failed');

    // Test 7: Delete class (we'll delete one of the bulk created ones)
    const classToDelete = bulkData[0].id;
    console.log('\n=== DELETE /class/:id (Delete Class) ===');
    const { response: delRes, data: delData } = await makeRequest(
        `${BASE_URL}/class/${classToDelete}`,
        { method: 'DELETE' }
    );

    console.log('Status:', delRes.status);
    console.log('Response:', JSON.stringify(delData, null, 2));
    console.log(delRes.status === 200 ? '✅ Class deleted' : '❌ Delete failed');
}

// ==================== HOLIDAY ROUTES ====================
async function testHolidayRoutes() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   TESTING HOLIDAY ROUTES              ║');
    console.log('╚════════════════════════════════════════╝');

    // Test 1: Create holiday
    console.log('\n=== POST /holiday (Create Holiday) ===');
    const { response: createRes, data: createData } = await makeRequest(`${BASE_URL}/holiday`, {
        method: 'POST',
        body: JSON.stringify({
            date: '2025-01-26',
            name: 'Republic Day',
            type: 'NATIONAL_HOLIDAY',
            semesterId: semesterId
        })
    });

    console.log('Status:', createRes.status);
    console.log('Response:', JSON.stringify(createData, null, 2));

    if (createData.id) {
        holidayId = createData.id;
        console.log('✅ Holiday created');
    }

    // Test 2: Bulk create holidays
    console.log('\n=== POST /holiday/bulk (Bulk Create Holidays) ===');
    const { response: bulkRes, data: bulkData } = await makeRequest(`${BASE_URL}/holiday/bulk`, {
        method: 'POST',
        body: JSON.stringify({
            holidays: [
                {
                    date: '2025-03-08',
                    name: 'Holi',
                    type: 'FESTIVAL',
                    semesterId: semesterId
                },
                {
                    date: '2025-04-14',
                    name: 'Ambedkar Jayanti',
                    type: 'NATIONAL_HOLIDAY',
                    semesterId: semesterId
                }
            ]
        })
    });

    console.log('Status:', bulkRes.status);
    console.log('Created:', bulkData.length, 'holidays');
    console.log(bulkData.length === 2 ? '✅ Bulk create successful' : '❌ Bulk create failed');

    // Test 3: Get holidays
    console.log('\n=== GET /holiday?semesterId=... (Get Holidays) ===');
    const { response: getRes, data: getData } = await makeRequest(
        `${BASE_URL}/holiday?semesterId=${semesterId}`,
        { method: 'GET' }
    );

    console.log('Status:', getRes.status);
    console.log('Total holidays:', getData.length);
    console.log(getData.length >= 3 ? '✅ Holidays retrieved' : '❌ Holidays not found');

    // Test 4: Delete holiday
    console.log('\n=== DELETE /holiday/:id (Delete Holiday) ===');
    const { response: delRes, data: delData } = await makeRequest(
        `${BASE_URL}/holiday/${holidayId}`,
        { method: 'DELETE' }
    );

    console.log('Status:', delRes.status);
    console.log('Response:', JSON.stringify(delData, null, 2));
    console.log(delRes.status === 200 ? '✅ Holiday deleted' : '❌ Delete failed');
}

// ==================== STATS ROUTES ====================
async function testStatsRoutes() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   TESTING STATS ROUTES                ║');
    console.log('╚════════════════════════════════════════╝');

    // Note: Stats routes reference 'subject' model which doesn't exist in schema
    // They should reference 'userCourse' instead. Let's test anyway to see errors

    console.log('\n⚠️  Note: Stats routes may have schema issues (references Subject instead of UserCourse)');

    // Test 1: Get semester stats
    console.log('\n=== GET /stats/semester/:semesterId (Get Semester Stats) ===');
    const { response: semRes, data: semData } = await makeRequest(
        `${BASE_URL}/stats/semester/${semesterId}`,
        { method: 'GET' }
    );

    console.log('Status:', semRes.status);
    console.log('Response:', JSON.stringify(semData, null, 2));

    if (semRes.status === 200) {
        console.log('✅ Stats endpoint accessible');
    } else {
        console.log('❌ Stats endpoint error (likely schema mismatch)');
    }

    // Test 2: Get subject trend
    console.log('\n=== GET /stats/subject/:subjectId/trend (Get Subject Trend) ===');
    const { response: trendRes, data: trendData } = await makeRequest(
        `${BASE_URL}/stats/subject/${courseId}/trend`,
        { method: 'GET' }
    );

    console.log('Status:', trendRes.status);
    console.log('Response:', JSON.stringify(trendData, null, 2));

    if (trendRes.status === 200) {
        console.log('✅ Trend endpoint accessible');
    } else {
        console.log('❌ Trend endpoint error (likely schema mismatch)');
    }
}

// ==================== RUN ALL TESTS ====================
async function runAllTests() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   COMPREHENSIVE API TEST SUITE        ║');
    console.log('╚════════════════════════════════════════╝');

    try {
        await setup();
        await new Promise(resolve => setTimeout(resolve, 500));

        await testCourseRoutes();
        await new Promise(resolve => setTimeout(resolve, 500));

        await testClassRoutes();
        await new Promise(resolve => setTimeout(resolve, 500));

        await testHolidayRoutes();
        await new Promise(resolve => setTimeout(resolve, 500));

        await testStatsRoutes();

        console.log('\n╔════════════════════════════════════════╗');
        console.log('║   ALL TESTS COMPLETED                 ║');
        console.log('╚════════════════════════════════════════╝\n');
    } catch (error) {
        console.error('\n❌ Test suite failed:');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
    }
}

runAllTests();
