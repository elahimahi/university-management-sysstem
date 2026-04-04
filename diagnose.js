#!/usr/bin/env node

/**
 * Network Diagnostic & Setup Script
 * Run this to diagnose and fix network/CORS issues
 */

const http = require('http');
const https = require('https');

const TESTS = {
  apache: 'http://localhost/university-management-sysstem/backend/health-check.php',
  diagnostic: 'http://localhost/university-management-sysstem/backend/network-diagnostic.php',
  login: 'http://localhost/university-management-sysstem/backend/auth/login.php',
  frontend: 'http://localhost:3000/login',
};

async function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const handler = isHttps ? https : http;
    const URL = new URL(url);

    const options = {
      hostname: URL.hostname,
      port: URL.port || (isHttps ? 443 : 80),
      path: URL.pathname + URL.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = handler.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: responseData,
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n========================================');
  console.log('🔍 Network Diagnostic & Setup Script');
  console.log('========================================\n');

  // Test 1: Health Check
  console.log('📋 Test 1: Backend Health Check');
  console.log('URL:', TESTS.apache);
  try {
    const result = await makeRequest(TESTS.apache);
    console.log('✓ Status Code:', result.status);
    if (result.status === 200) {
      const body = JSON.parse(result.body);
      console.log('✓ Response:', JSON.stringify(body, null, 2));
    } else {
      console.log('✗ Error Response:', result.body);
    }
  } catch (error) {
    console.log('✗ Error:', error.message);
  }

  // Test 2: Network Diagnostic
  console.log('\n📋 Test 2: Network Diagnostic');
  console.log('URL:', TESTS.diagnostic);
  try {
    const result = await makeRequest(TESTS.diagnostic);
    console.log('✓ Status Code:', result.status);
    if (result.status === 200) {
      const body = JSON.parse(result.body);
      console.log('✓ CORS Status:', body.checks?.cors?.status);
      console.log('✓ Database Status:', body.checks?.database?.status);
      console.log('✓ SuperAdmin Count:', body.checks?.superadmin?.count);
    } else {
      console.log('✗ Error Response:', result.body);
    }
  } catch (error) {
    console.log('✗ Error:', error.message);
  }

  // Test 3: Login Endpoint (POST)
  console.log('\n📋 Test 3: Login Endpoint');
  console.log('URL:', TESTS.login);
  console.log('Method: POST');
  const loginData = {
    email: 'superadmin@university.edu',
    password: 'superadmin123',
    role: 'admin',
  };
  console.log('Payload:', JSON.stringify(loginData, null, 2));
  try {
    const result = await makeRequest(TESTS.login, 'POST', loginData);
    console.log('✓ Status Code:', result.status);
    if (result.status === 200) {
      const body = JSON.parse(result.body);
      console.log('✓ User Email:', body.user?.email);
      console.log('✓ User Role:', body.user?.role);
      console.log('✓ Approval Status:', body.user?.approval_status);
      console.log('✓ Token Generated:', body.tokens?.accessToken ? 'Yes' : 'No');
    } else {
      console.log('✗ Error Response:', result.body);
    }
  } catch (error) {
    console.log('✗ Error:', error.message);
  }

  // Test 4: Frontend
  console.log('\n📋 Test 4: Frontend Server');
  console.log('URL:', TESTS.frontend);
  try {
    const result = await makeRequest(TESTS.frontend);
    console.log('✓ Status Code:', result.status);
    if (result.status === 200) {
      console.log('✓ Frontend is running');
    }
  } catch (error) {
    console.log('✗ Error:', error.message);
  }

  // Summary
  console.log('\n========================================');
  console.log('📊 Summary & Next Steps');
  console.log('========================================\n');

  console.log('If all tests pass:');
  console.log('✓ Open browser: http://localhost:3000/login');
  console.log('✓ Email: superadmin@university.edu');
  console.log('✓ Password: superadmin123');
  console.log('✓ Click Sign In\n');

  console.log('If backend health check fails:');
  console.log('1. Verify Apache is running (netstat -ano | findstr :80)');
  console.log('2. Check .env file exists in root directory');
  console.log('3. Restart Apache in XAMPP Control Panel');
  console.log('4. Run: npm run build\n');

  console.log('If frontend test fails:');
  console.log('1. Make sure Node.js is running');
  console.log('2. Run: npm start');
  console.log('3. Browser should open http://localhost:3000\n');
}

runTests().catch(console.error);
