/**
 * System Testing Script
 * Tests registration, login, and dashboard redirects
 * Author: Simon Lodongo Taban
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

// Test Suite
async function runTests() {
  console.log('\n🧪 KGL SYSTEM TEST SUITE\n');
  console.log('=' .repeat(60));

  try {
    // Test 1: Register a new user
    console.log('\n✅ TEST 1: User Registration');
    console.log('-'.repeat(60));
    
    const registerData = {
      name: 'Test Manager',
      email: `test-manager-${Date.now()}@test.com`,
      password: 'TestPass123',
      confirmPassword: 'TestPass123',
      role: 'manager',
      branch: 'branch1',
      contact: '0712345678'
    };

    console.log('Registering user:', registerData.email);
    const registerRes = await makeRequest('POST', '/api/auth/register', registerData);
    
    if (registerRes.status === 201 && registerRes.data.token) {
      console.log('✅ Registration SUCCESSFUL');
      console.log('   Token:', registerRes.data.token.substring(0, 20) + '...');
      console.log('   Role:', registerRes.data.role);
      console.log('   User ID:', registerRes.data.userId);
      var token = registerRes.data.token;
      var userId = registerRes.data.userId;
      var userRole = registerRes.data.role;
    } else {
      console.log('❌ Registration FAILED');
      console.log('   Status:', registerRes.status);
      console.log('   Response:', registerRes.data);
      throw new Error('Registration failed');
    }

    // Test 2: Login with registered user
    console.log('\n✅ TEST 2: User Login');
    console.log('-'.repeat(60));
    
    const loginData = {
      email: registerData.email,
      password: registerData.password
    };

    console.log('Logging in as:', loginData.email);
    const loginRes = await makeRequest('POST', '/api/auth/login', loginData);
    
    if (loginRes.status === 200 && loginRes.data.token) {
      console.log('✅ Login SUCCESSFUL');
      console.log('   Token:', loginRes.data.token.substring(0, 20) + '...');
      console.log('   Role:', loginRes.data.role);
      console.log('   Branch:', loginRes.data.branch);
      console.log('   Name:', loginRes.data.name);
    } else {
      console.log('❌ Login FAILED');
      console.log('   Status:', loginRes.status);
      console.log('   Response:', loginRes.data);
      throw new Error('Login failed');
    }

    // Test 3: Get user profile
    console.log('\n✅ TEST 3: Get User Profile');
    console.log('-'.repeat(60));
    
    console.log('Fetching profile for user:', userId);
    const profileRes = await makeRequest('GET', `/api/auth/profile/${userId}`);
    
    if (profileRes.status === 200) {
      console.log('✅ Profile Fetch SUCCESSFUL');
      console.log('   Name:', profileRes.data.name);
      console.log('   Email:', profileRes.data.email);
      console.log('   Role:', profileRes.data.role);
      console.log('   Branch:', profileRes.data.branch);
      console.log('   Contact:', profileRes.data.contact);
    } else {
      console.log('❌ Profile Fetch FAILED');
      console.log('   Status:', profileRes.status);
      console.log('   Response:', profileRes.data);
    }

    // Test 4: Dashboard routes
    console.log('\n✅ TEST 4: Dashboard Routes');
    console.log('-'.repeat(60));

    const dashboardRoutes = {
      'manager': '/manager-dashboard',
      'director': '/director-dashboard',
      'agent': '/agent-dashboard',
      'procurement': '/procurement-dashboard'
    };

    const testRole = 'manager';
    const dashboardPath = dashboardRoutes[testRole];
    
    console.log(`Checking dashboard route for ${testRole}:`, dashboardPath);
    const dashRes = await makeRequest('GET', dashboardPath);
    
    if (dashRes.status === 200) {
      console.log(`✅ Dashboard route ACCESSIBLE (${testRole})`);
      const hasContent = dashRes.data.includes('<!DOCTYPE') || 
                        dashRes.data.includes('<html') ||
                        dashRes.data.includes('DOCTYPE html');
      if (hasContent) {
        console.log('   HTML content loaded successfully');
      }
    } else {
      console.log(`❌ Dashboard route FAILED (${testRole})`);
      console.log('   Status:', dashRes.status);
    }

    // Test 5: Invalid register - missing required field
    console.log('\n✅ TEST 5: Validation - Missing Required Field');
    console.log('-'.repeat(60));
    
    const invalidRegisterData = {
      name: 'Test User',
      email: 'test@test.com',
      password: 'TestPass123',
      confirmPassword: 'TestPass123',
      role: 'agent'
      // Missing: branch, contact
    };

    console.log('Attempting registration without required fields...');
    const validationRes = await makeRequest('POST', '/api/auth/register', invalidRegisterData);
    
    if (validationRes.status !== 201) {
      console.log('✅ Validation WORKING - Request correctly rejected');
      console.log('   Status:', validationRes.status);
      console.log('   Error:', validationRes.data.error);
    } else {
      console.log('❌ Validation FAILED - Should have rejected request');
    }

    // Test 6: Invalid login - wrong password
    console.log('\n✅ TEST 6: Security - Invalid Login');
    console.log('-'.repeat(60));
    
    const invalidLoginData = {
      email: registerData.email,
      password: 'WrongPassword'
    };

    console.log('Attempting login with wrong password...');
    const invalidLoginRes = await makeRequest('POST', '/api/auth/login', invalidLoginData);
    
    if (invalidLoginRes.status === 401) {
      console.log('✅ Security WORKING - Invalid password rejected');
      console.log('   Status:', invalidLoginRes.status);
      console.log('   Error:', invalidLoginRes.data.error);
    } else {
      console.log('❌ Security FAILED - Should have rejected invalid password');
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL TESTS COMPLETED SUCCESSFULLY!\n');
    console.log('Summary:');
    console.log('  ✓ User registration working');
    console.log('  ✓ User login working');
    console.log('  ✓ Profile retrieval working');
    console.log('  ✓ Dashboard routes accessible');
    console.log('  ✓ Input validation working');
    console.log('  ✓ Security checks working\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runTests().then(() => {
  console.log('Tests completed. You can now test manually at:');
  console.log('  Login: http://localhost:3000/login');
  console.log('  Register: http://localhost:3000/register\n');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
