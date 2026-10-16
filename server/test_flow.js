import express from 'express';
import jwt from 'jsonwebtoken';
import http from 'http';

// We will spawn the server process or run the test against port 5000 / an in-process server instance
const JWT_SECRET = 'landsellingapp-secret-jwt-key-2024';

async function runTests() {
  console.log('--- STARTING COMPLETE REGISTRATION TO ADMIN DASHBOARD TEST ---');
  const baseUrl = 'http://127.0.0.1:5000';

  const fetchJson = async (path, options = {}) => {
    const res = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    const text = await res.text();
    try {
      return { status: res.status, data: JSON.parse(text) };
    } catch {
      return { status: res.status, text };
    }
  };

  // 1. Direct Registration Test
  console.log('\n[TEST 1] Registering New User (Karthik S., Seller, 9842112233)...');
  const regRes = await fetchJson('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Karthik S.',
      phone: '9842112233',
      email: 'karthik@example.com',
      role: 'Seller',
      pin: '1234',
      district: 'Coimbatore',
      town: 'Pollachi',
      pincode: '642001'
    })
  });
  console.log('Registration Status:', regRes.status);
  console.log('Registration Response:', JSON.stringify(regRes.data, null, 2));
  if (regRes.status !== 200 || !regRes.data.user || regRes.data.user.status !== 'Active') {
    throw new Error('Test 1 Failed: Registration did not return Active user with userId');
  }

  // 2. Check User Test (Phone format resilience)
  console.log('\n[TEST 2] Checking User by phone (both raw and +91 formatted)...');
  const checkRes1 = await fetchJson('/api/auth/check-user', {
    method: 'POST',
    body: JSON.stringify({ phone: '9842112233' })
  });
  const checkRes2 = await fetchJson('/api/auth/check-user', {
    method: 'POST',
    body: JSON.stringify({ phone: '+919842112233' })
  });
  console.log('Check 1 (raw):', checkRes1.data);
  console.log('Check 2 (+91):', checkRes2.data);
  if (!checkRes1.data.exists || !checkRes2.data.exists || !checkRes1.data.hasPin) {
    throw new Error('Test 2 Failed: check-user did not recognize registered user');
  }

  // 3. Login with PIN Test
  console.log('\n[TEST 3] Logging in with Mobile & 4-Digit PIN...');
  const loginRes = await fetchJson('/api/auth/login-pin', {
    method: 'POST',
    body: JSON.stringify({ phone: '9842112233', pin: '1234' })
  });
  console.log('Login Status:', loginRes.status);
  console.log('Login Response:', JSON.stringify(loginRes.data.user, null, 2));
  if (loginRes.status !== 200 || !loginRes.data.token || loginRes.data.user.role !== 'Seller') {
    throw new Error('Test 3 Failed: PIN Login failed');
  }

  // 4. Duplicate Prevention Test
  console.log('\n[TEST 4] Testing duplicate registration prevention (same phone, updated town)...');
  const dupRes = await fetchJson('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Karthik S.',
      phone: '9842112233',
      email: 'karthik_updated@example.com',
      role: 'Seller',
      pin: '1234',
      district: 'Coimbatore',
      town: 'Anaimalai',
      pincode: '642002'
    })
  });
  console.log('Duplicate handling status:', dupRes.status);
  console.log('Updated user data:', dupRes.data.user?.town, dupRes.data.user?.email);
  if (dupRes.status !== 200 || dupRes.data.user.town !== 'Anaimalai') {
    throw new Error('Test 4 Failed: Duplicate prevention did not gracefully update profile');
  }

  // 5. Firebase Token Simulation Test
  console.log('\n[TEST 5] Testing Firebase Authenticated User Sync (/api/users/sync)...');
  // Construct a valid Firebase-style JWT token
  const firebasePayload = {
    iss: 'https://securetoken.google.com/land-buy-selling',
    aud: 'land-buy-selling',
    sub: 'firebase_user_sample_9876543299',
    user_id: 'firebase_user_sample_9876543299',
    phone_number: '+919876543299',
    exp: Math.floor(Date.now() / 1000) + 3600
  };
  const mockFirebaseToken = jwt.sign(firebasePayload, 'some-key', { algorithm: 'HS256' });

  const syncRes = await fetchJson('/api/users/sync', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${mockFirebaseToken}` },
    body: JSON.stringify({
      name: 'Priya Sundar',
      phone: '+919876543299',
      email: 'priya@example.com',
      role: 'Buyer',
      district: 'Chennai',
      town: 'Adyar',
      pincode: '600020'
    })
  });
  console.log('Firebase Sync Status:', syncRes.status);
  console.log('Firebase Sync Response:', JSON.stringify(syncRes.data, null, 2));
  if (syncRes.status !== 200 || !syncRes.data.user || syncRes.data.user.name !== 'Priya Sundar') {
    throw new Error('Test 5 Failed: Firebase user sync failed');
  }

  // 6. Admin Security Test (Unauthorized Access Blocked)
  console.log('\n[TEST 6] Testing Admin Security: Unauthorized request should return 403 Forbidden...');
  const buyerToken = loginRes.data.token;
  const unauthRes = await fetchJson('/api/admin/users', {
    headers: { 'Authorization': `Bearer ${buyerToken}` }
  });
  console.log('Unauthorized status:', unauthRes.status);
  if (unauthRes.status !== 403) {
    throw new Error('Test 6 Failed: Non-admin was not rejected with 403');
  }

  // 7. Admin Dashboard Stats Test
  console.log('\n[TEST 7] Testing Admin Dashboard Stats (/api/admin/dashboard-stats)...');
  const statsRes = await fetchJson('/api/admin/dashboard-stats', {
    headers: {
      'Authorization': `Bearer mock-admin-token`,
      'x-admin-phone': '8248843385'
    }
  });
  console.log('Dashboard Stats Status:', statsRes.status);
  console.log('Total Users:', statsRes.data.users?.total);
  console.log('Active Users:', statsRes.data.users?.active);
  console.log('Buyers:', statsRes.data.users?.buyers);
  console.log('Sellers:', statsRes.data.users?.sellers);
  console.log('Recent Users Count:', statsRes.data.recentUsers?.length);
  if (statsRes.status !== 200 || !statsRes.data.recentUsers || statsRes.data.recentUsers.length < 2) {
    throw new Error('Test 7 Failed: Dashboard stats does not contain real users');
  }

  // 8. Admin Users List Test
  console.log('\n[TEST 8] Testing Admin Users List (/api/admin/users)...');
  const adminUsersRes = await fetchJson('/api/admin/users', {
    headers: {
      'Authorization': `Bearer mock-admin-token`,
      'x-admin-phone': '8248843385'
    }
  });
  console.log('Admin Users Status:', adminUsersRes.status);
  console.log('Total Users Returned:', adminUsersRes.data.length);
  const foundKarthik = adminUsersRes.data.find(u => u.phone?.includes('9842112233'));
  const foundPriya = adminUsersRes.data.find(u => u.phone?.includes('9876543299'));
  const foundAdmin = adminUsersRes.data.find(u => u.phone?.includes('8248843385'));

  console.log('Admin in list:', !!foundAdmin, foundAdmin?.userId, foundAdmin?.role);
  console.log('Karthik (Direct PIN) in list:', !!foundKarthik, foundKarthik?.userId, foundKarthik?.status);
  console.log('Priya (Firebase Sync) in list:', !!foundPriya, foundPriya?.userId, foundPriya?.status);

  if (!foundKarthik || !foundPriya || !foundAdmin) {
    throw new Error('Test 8 Failed: Not all registered users appeared in Admin User List');
  }

  console.log('\n========================================');
  console.log('>>> ALL 8 TESTS PASSED SUCCESSFULLY! <<<');
  console.log('========================================');
  process.exit(0);
}

runTests().catch(err => {
  console.error('\nTEST RUN FAILED:', err.message);
  process.exit(1);
});
