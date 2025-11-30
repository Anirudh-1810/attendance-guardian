const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:4000';

async function testSignup() {
    console.log('\n=== Testing Signup ===');
    console.log('Sending:', JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
    }, null, 2));

    try {
        const response = await fetch(`${BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            })
        });

        const text = await response.text();
        console.log('Status:', response.status);
        console.log('Raw Response:', text);

        try {
            const data = JSON.parse(text);
            console.log('Parsed Response:', JSON.stringify(data, null, 2));
            return data;
        } catch (e) {
            console.log('Could not parse as JSON');
            return null;
        }
    } catch (error) {
        console.error('Signup Error:', error.message);
        console.error('Stack:', error.stack);
        return null;
    }
}

async function testLogin() {
    console.log('\n=== Testing Login ===');
    try {
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            })
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));

        return data;
    } catch (error) {
        console.error('Login Error:', error.message);
        return null;
    }
}

async function testInvalidLogin() {
    console.log('\n=== Testing Invalid Login ===');
    try {
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'wrongpassword'
            })
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Invalid Login Error:', error.message);
    }
}

async function runTests() {
    console.log('Starting Auth Routes Tests...');

    // Test signup
    const signupResult = await testSignup();

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 500));

    // Test login with correct credentials
    await testLogin();

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 500));

    // Test login with wrong password
    await testInvalidLogin();

    console.log('\n=== Tests Complete ===');
}

runTests();
