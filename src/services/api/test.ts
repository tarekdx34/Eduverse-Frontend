// Diagnostic utility for API testing
export async function testApiConnection() {
  const baseUrl = 'http://localhost:8081/api';

  console.log('🔍 Testing API Connection...\n');

  try {
    // Test 1: Simple GET to check if server is up
    console.log('Test 1: Checking if server is accessible...');
    const serverCheck = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }).catch((e) => {
      console.error('❌ Server unreachable:', e.message);
      return null;
    });

    if (!serverCheck) {
      console.log(
        '❌ Cannot reach server at http://localhost:8081\n' + 'Make sure your backend is running!\n'
      );
      return false;
    }

    console.log(`✅ Server responded with status: ${serverCheck.status}\n`);

    // Test 2: Test login endpoint
    console.log('Test 2: Testing login endpoint...');

    const loginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'tarekdx0@gmail.com',
        password: 'TestPass123!',
      }),
    });

    console.log(`📊 Login Response Status: ${loginResponse.status}`);
    console.log(`📊 Response Headers:`, {
      'content-type': loginResponse.headers.get('content-type'),
      'access-control-allow-origin': loginResponse.headers.get('access-control-allow-origin'),
    });

    const responseData = await loginResponse.json();
    console.log('📊 Response Data:', responseData);

    if (loginResponse.ok) {
      console.log('\n✅ API is working correctly!');
      return true;
    } else {
      console.log('\n⚠️ API returned an error:', responseData.message);
      return false;
    }
  } catch (error) {
    console.error('\n❌ Error during API test:', error);
    console.log('\nCommon solutions:');
    console.log('1. Make sure backend is running on port 8081');
    console.log('2. Check backend CORS settings');
    console.log('3. Check network connectivity');
    console.log('4. Check browser console for CORS errors');
    return false;
  }
}
