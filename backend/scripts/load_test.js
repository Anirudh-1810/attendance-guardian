const fetch = require('node-fetch');
const autocannon = require('autocannon');

async function run() {
    console.log('1. Registering test user to get auth token...');
    const email = `test_load_${Date.now()}@example.com`;
    const password = `StrongPass123!`;

    const signupRes = await fetch('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Load Tester', email, password })
    });

    const signupData = await signupRes.json();
    if (!signupData.token) {
        console.error('Failed to get token:', signupData);
        process.exit(1);
    }

    const token = signupData.token;
    console.log('Token acquired. Generating initial data...');

    // Hit the /api/semesters/current endpoint once to trigger auto-creation
    // so the DB is populated with at least one semester for this new user.
    await fetch('http://localhost:3000/api/semesters/current', {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('2. Starting autocannon load test (50 concurrent connections, 10 seconds)...');

    const instance = autocannon({
        url: 'http://localhost:3000/api/semesters/current',
        connections: 50,
        duration: 10,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }, (err, result) => {
        if (err) {
            console.error('Error running autocannon:', err);
        } else {
            console.log('\n--- Load Test Results ---');
            console.log(`Requests: ${result.requests.average} req/sec`);
            console.log(`Latency: ${result.latency.average} ms (avg) / ${result.latency.p99} ms (p99)`);
            console.log(`Total Requests: ${result.requests.total}`);
            console.log(`Errors: ${result.errors}`);
            console.log(`Timeouts: ${result.timeouts}`);
            console.log('-------------------------');
        }
    });

    autocannon.track(instance, { renderProgressBar: true });
}

run().catch(console.error);
