
const testMissionsRegister = async () => {
    try {
        const timestamp = Date.now();
        const registerData = {
            name: `Test User ${timestamp}`,
            email: `test_mission_${timestamp}@example.com`,
            password: 'password123',
            role: 'student',
            schoolID: 'SCH-TEST',
            grade: '10'
        };

        const registerUrl = 'http://localhost:5000/api/users/register';
        console.log('Registering new user...', registerData.email);

        const regResponse = await fetch(registerUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registerData)
        });

        const regData = await regResponse.json();

        if (!regResponse.ok) {
            console.error('Registration failed:', regData);
            return;
        }

        // Handle the new flat structure I fixed in the frontend, backend returns user object with token
        const token = regData.token;

        if (!token) {
            console.error('No token in registration response:', regData);
            return;
        }
        console.log('Registration successful.');

        // Now fetch missions
        const missionsUrl = 'http://localhost:5000/api/missions';
        console.log('Fetching missions...');

        const missionsResponse = await fetch(missionsUrl, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const missionBox = await missionsResponse.json();

        if (missionsResponse.ok) {
            console.log('Missions fetched response:', missionBox);
            if (missionBox.data && missionBox.data.length > 0) {
                console.log(`SUCCESS: ${missionBox.data.length} missions generated and returned.`);
            } else {
                console.log('FAILURE: No missions returned.');
            }
        } else {
            console.log('Failed to fetch missions:', missionBox);
        }

    } catch (error) {
        console.error('Test failed:', error.message);
    }
};

testMissionsRegister();
