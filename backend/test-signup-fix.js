const fetch = require('node-fetch');

async function testSignup() {
    try {
        const response = await fetch('http://localhost:4000/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test' + Date.now() + '@example.com',
                password: 'password123',
                name: 'Test User'
            })
        });

        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Response:', data);

        if (response.status === 200 || response.status === 201) {
            console.log('SUCCESS: Signup endpoint is reachable and working.');
        } else {
            console.log('FAILURE: Signup endpoint returned error status.');
        }
    } catch (error) {
        console.error('ERROR: Could not connect to server.', error.message);
    }
}

testSignup();
