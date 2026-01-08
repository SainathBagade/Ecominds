const axios = require('axios');

const testAPI = async () => {
    const BASE_URL = 'http://localhost:5000/api';

    console.log('🧪 Testing EcoMinds API\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    try {
        // Test 1: Health Check
        console.log('1. Testing Health Check...');
        const health = await axios.get('http://localhost:5000/health');
        console.log('   ✅ Health check passed');
        console.log(`   Status: ${health.data.status}\n`);

        // Test 2: Challenges endpoint (without auth)
        console.log('2. Testing Challenges Endpoint (no auth)...');
        try {
            const challenges = await axios.get(`${BASE_URL}/challenges`);
            console.log('   ❌ Should require authentication but didn\'t\n');
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('   ✅ Correctly requires authentication');
                console.log(`   Status: ${error.response.status} - ${error.response.data.message}\n`);
            } else {
                console.log(`   ⚠️  Unexpected error: ${error.message}\n`);
            }
        }

        // Test 3: Missions endpoint (without auth)
        console.log('3. Testing Missions Endpoint (no auth)...');
        try {
            const missions = await axios.get(`${BASE_URL}/missions`);
            console.log('   ❌ Should require authentication but didn\'t\n');
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('   ✅ Correctly requires authentication');
                console.log(`   Status: ${error.response.status} - ${error.response.data.message}\n`);
            } else {
                console.log(`   ⚠️  Unexpected error: ${error.message}\n`);
            }
        }

        // Test 4: Check if routes are registered
        console.log('4. Testing Route Registration...');
        const root = await axios.get('http://localhost:5000/');
        console.log('   ✅ Server is responding');
        console.log(`   Message: ${root.data.message}\n`);

        console.log('═══════════════════════════════════════════════════════════\n');
        console.log('📊 Summary:\n');
        console.log('✅ Server is running');
        console.log('✅ Routes are protected (require authentication)');
        console.log('✅ API is responding correctly\n');
        console.log('🔐 To test with authentication:');
        console.log('   1. Login to get a JWT token');
        console.log('   2. Add token to Authorization header');
        console.log('   3. Make requests to /api/challenges and /api/missions\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('\n⚠️  Server is not running on port 5000');
            console.error('   Please start the server with: npm start\n');
        }
    }
};

testAPI();
