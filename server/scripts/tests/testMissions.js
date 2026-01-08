
const testMissions = async () => {
    try {
        // First login to get a token
        const loginUrl = 'http://localhost:5000/api/users/login';
        const loginData = {
            email: 'student@ecominds.com',
            password: 'password123'
        };

        console.log('Logging in...');
        const loginResponse = await fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });

        const loginResData = await loginResponse.json();

        if (!loginResponse.ok) {
            console.error('Login failed:', loginResData);
            return;
        }

        const token = loginResData.token || loginResData.user?.token;

        if (!token) {
            console.error('Login failed: No token received', loginResData);
            return;
        }
        console.log('Login successful. Token received.');

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

        const missionData = await missionsResponse.json();

        if (missionsResponse.ok) {
            console.log('Missions fetched successfully:', missionData);
            if (missionData.data && missionData.data.length === 0) {
                console.log('WARNING: No missions returned. Generation might have failed.');
            } else {
                console.log(`Success! ${missionData.data.length} missions returned.`);
            }
        } else {
            console.log('Failed to fetch missions:', missionData);
        }

    } catch (error) {
        console.error('Test failed:', error.message);
    }
};

testMissions();
