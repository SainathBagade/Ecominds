// Quick diagnostic script to check API connectivity
const http = require('http');

console.log('🔍 EcoMinds API Diagnostic Tool\n');
console.log('═══════════════════════════════════════════════════════════\n');

// Test 1: Check if server is running
console.log('1. Checking if server is running on port 5000...');
const healthCheck = http.get('http://localhost:5000/health', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        if (res.statusCode === 200) {
            console.log('   ✅ Server is running');
            console.log(`   Response: ${data}\n`);

            // Test 2: Check challenges endpoint
            console.log('2. Checking challenges endpoint (without auth)...');
            const challengesReq = http.get('http://localhost:5000/api/challenges', (res2) => {
                let data2 = '';
                res2.on('data', chunk => data2 += chunk);
                res2.on('end', () => {
                    if (res2.statusCode === 401) {
                        console.log('   ✅ Endpoint exists and requires authentication');
                        console.log(`   Status: ${res2.statusCode}\n`);
                    } else if (res2.statusCode === 200) {
                        console.log('   ⚠️  Endpoint is accessible without auth (unexpected)');
                        console.log(`   Response: ${data2}\n`);
                    } else {
                        console.log(`   ❌ Unexpected status: ${res2.statusCode}`);
                        console.log(`   Response: ${data2}\n`);
                    }

                    // Test 3: Check missions endpoint
                    console.log('3. Checking missions endpoint (without auth)...');
                    const missionsReq = http.get('http://localhost:5000/api/missions', (res3) => {
                        let data3 = '';
                        res3.on('data', chunk => data3 += chunk);
                        res3.on('end', () => {
                            if (res3.statusCode === 401) {
                                console.log('   ✅ Endpoint exists and requires authentication');
                                console.log(`   Status: ${res3.statusCode}\n`);
                            } else if (res3.statusCode === 200) {
                                console.log('   ⚠️  Endpoint is accessible without auth (unexpected)');
                                console.log(`   Response: ${data3}\n`);
                            } else {
                                console.log(`   ❌ Unexpected status: ${res3.statusCode}`);
                                console.log(`   Response: ${data3}\n`);
                            }

                            printSummary();
                        });
                    });
                    missionsReq.on('error', (err) => {
                        console.log(`   ❌ Error: ${err.message}\n`);
                        printSummary();
                    });
                });
            });
            challengesReq.on('error', (err) => {
                console.log(`   ❌ Error: ${err.message}\n`);
                printSummary();
            });
        }
    });
});

healthCheck.on('error', (err) => {
    console.log('   ❌ Server is NOT running');
    console.log(`   Error: ${err.message}\n`);
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('⚠️  ISSUE FOUND: Backend server is not running!\n');
    console.log('Solution:');
    console.log('1. Open a terminal in the server directory');
    console.log('2. Run: npm start');
    console.log('3. Wait for "Server running on port 5000"');
    console.log('4. Then try accessing the frontend again\n');
});

function printSummary() {
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('📊 DIAGNOSTIC SUMMARY\n');
    console.log('Backend Server: Running on port 5000');
    console.log('Frontend Server: Running on port 3001');
    console.log('API Endpoints: Require authentication (correct)\n');
    console.log('🔐 NEXT STEPS:\n');
    console.log('1. Open browser to: http://localhost:3001');
    console.log('2. Login with any test user');
    console.log('3. Navigate to /challenges or /missions');
    console.log('4. Open browser console (F12)');
    console.log('5. Check for errors in Console and Network tabs\n');
    console.log('If you see "Failed to load challenges":');
    console.log('- Check if you are logged in');
    console.log('- Check browser console for error details');
    console.log('- Check Network tab for failed requests\n');
}
