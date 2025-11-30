const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:4000';
let authToken = '';
let userId = '';
let createdSemesterId = '';

// Helper function to make authenticated requests
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

// 1. First, signup to get a user
async function setupUser() {
    console.log('\n=== Setting Up User ===');
    const { response, data } = await makeRequest(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        body: JSON.stringify({
            name: 'Semester Test User',
            email: `semester-test-${Date.now()}@example.com`,
            password: 'password123'
        })
    });

    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (data.token && data.user) {
        authToken = data.token;
        userId = data.user.id;
        console.log('✅ User created successfully');
        console.log('User ID:', userId);
    } else {
        console.log('❌ Failed to create user');
    }
}

// 2. Test GET /semesters (empty list initially)
async function testGetAllSemesters() {
    console.log('\n=== Test: GET /semesters (Empty) ===');
    const { response, data } = await makeRequest(
        `${BASE_URL}/semesters?userId=${userId}`,
        { method: 'GET' }
    );

    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log(data.length === 0 ? '✅ Empty list returned' : '⚠️ List not empty');
}

// 3. Test POST /semesters (Create semester)
async function testCreateSemester() {
    console.log('\n=== Test: POST /semesters (Create) ===');
    const semesterData = {
        name: 'Fall 2024',
        startDate: '2024-09-01',
        endDate: '2024-12-31',
        requiredPercentage: 75,
        userId: userId
    };

    console.log('Sending:', JSON.stringify(semesterData, null, 2));

    const { response, data } = await makeRequest(`${BASE_URL}/semesters`, {
        method: 'POST',
        body: JSON.stringify(semesterData)
    });

    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (data.id) {
        createdSemesterId = data.id;
        console.log('✅ Semester created successfully');
        console.log('Semester ID:', createdSemesterId);
    } else {
        console.log('❌ Failed to create semester');
    }
}

// 4. Test GET /semesters (with data)
async function testGetAllSemestersWithData() {
    console.log('\n=== Test: GET /semesters (With Data) ===');
    const { response, data } = await makeRequest(
        `${BASE_URL}/semesters?userId=${userId}`,
        { method: 'GET' }
    );

    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log(data.length > 0 ? '✅ Semesters retrieved' : '❌ No semesters found');
}

// 5. Test GET /semesters/current
async function testGetCurrentSemester() {
    console.log('\n=== Test: GET /semesters/current ===');
    const { response, data } = await makeRequest(
        `${BASE_URL}/semesters/current?userId=${userId}`,
        { method: 'GET' }
    );

    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (data === null) {
        console.log('⚠️ No current semester (dates may not match current date)');
    } else if (data.id) {
        console.log('✅ Current semester retrieved');
    }
}

// 6. Test PUT /semesters/:id (Update semester)
async function testUpdateSemester() {
    console.log('\n=== Test: PUT /semesters/:id (Update) ===');
    const updateData = {
        name: 'Fall 2024 - Updated',
        requiredPercentage: 80
    };

    console.log('Updating semester:', createdSemesterId);
    console.log('Update data:', JSON.stringify(updateData, null, 2));

    const { response, data } = await makeRequest(
        `${BASE_URL}/semesters/${createdSemesterId}`,
        {
            method: 'PUT',
            body: JSON.stringify(updateData)
        }
    );

    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (data.name === 'Fall 2024 - Updated' && data.requiredPercentage === 80) {
        console.log('✅ Semester updated successfully');
    } else {
        console.log('❌ Update may have failed');
    }
}

// 7. Test DELETE /semesters/:id
async function testDeleteSemester() {
    console.log('\n=== Test: DELETE /semesters/:id ===');
    console.log('Deleting semester:', createdSemesterId);

    const { response, data } = await makeRequest(
        `${BASE_URL}/semesters/${createdSemesterId}`,
        { method: 'DELETE' }
    );

    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.status === 200) {
        console.log('✅ Semester deleted successfully');
    } else {
        console.log('❌ Delete may have failed');
    }
}

// 8. Verify deletion
async function testVerifyDeletion() {
    console.log('\n=== Test: Verify Deletion ===');
    const { response, data } = await makeRequest(
        `${BASE_URL}/semesters?userId=${userId}`,
        { method: 'GET' }
    );

    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log(data.length === 0 ? '✅ Semester deleted (list empty)' : '⚠️ Semesters still exist');
}

// Run all tests
async function runAllTests() {
    console.log('╔════════════════════════════════════════╗');
    console.log('║   SEMESTER ROUTES TEST SUITE          ║');
    console.log('╚════════════════════════════════════════╝');

    try {
        await setupUser();
        await new Promise(resolve => setTimeout(resolve, 500));

        await testGetAllSemesters();
        await new Promise(resolve => setTimeout(resolve, 500));

        await testCreateSemester();
        await new Promise(resolve => setTimeout(resolve, 500));

        await testGetAllSemestersWithData();
        await new Promise(resolve => setTimeout(resolve, 500));

        await testGetCurrentSemester();
        await new Promise(resolve => setTimeout(resolve, 500));

        await testUpdateSemester();
        await new Promise(resolve => setTimeout(resolve, 500));

        await testDeleteSemester();
        await new Promise(resolve => setTimeout(resolve, 500));

        await testVerifyDeletion();

        console.log('\n╔════════════════════════════════════════╗');
        console.log('║   ALL TESTS COMPLETED                 ║');
        console.log('╚════════════════════════════════════════╝');
    } catch (error) {
        console.error('\n❌ Test suite failed with error:');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
    }
}

runAllTests();
