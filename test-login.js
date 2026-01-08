const axios = require('axios');

const API_URL = 'http://localhost:5002/api';

async function testLogin() {
  console.log('\n=== Testing Login Endpoints ===\n');

  // Test 1: Invalid credentials
  console.log('Test 1: Invalid credentials (wrong password)');
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      username: 'demo_candidate',
      password: 'wrongpassword',
      mobile: '1234567890'
    });
    console.log('❌ UNEXPECTED SUCCESS:', response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly rejected with 401:', error.response.data.error);
    } else {
      console.log('❌ Unexpected error:', error.message);
    }
  }

  // Test 2: Invalid mobile
  console.log('\nTest 2: Invalid credentials (wrong mobile)');
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      username: 'demo_candidate',
      password: 'demo123',
      mobile: '9999999999'
    });
    console.log('❌ UNEXPECTED SUCCESS:', response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly rejected with 401:', error.response.data.error);
    } else {
      console.log('❌ Unexpected error:', error.message);
    }
  }

  // Test 3: Valid credentials
  console.log('\nTest 3: Valid credentials');
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      username: 'demo_candidate',
      password: 'demo123',
      mobile: '1234567890'
    });
    console.log('✅ Login successful! Token:', response.data.token.substring(0, 20) + '...');
    console.log('   User:', response.data.user);
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data?.error || error.message);
  }

  // Test 4: Non-existent user
  console.log('\nTest 4: Non-existent user');
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      username: 'nonexistent',
      password: 'password123',
      mobile: '1234567890'
    });
    console.log('❌ UNEXPECTED SUCCESS:', response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly rejected with 401:', error.response.data.error);
    } else {
      console.log('❌ Unexpected error:', error.message);
    }
  }

  console.log('\n');
  process.exit(0);
}

// Wait for server to be ready
setTimeout(testLogin, 1000);
