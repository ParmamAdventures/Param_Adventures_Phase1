/**
 * Quick Test Script for Refactored Trip Controllers
 * 
 * Prerequisites:
 * 1. API server running on localhost:3000
 * 2. Database seeded with at least one admin user
 * 3. Install axios: npm install axios
 * 
 * Usage: node quick-test.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// Update these with your credentials
const ADMIN_EMAIL = 'admin@paramadventures.com';
const ADMIN_PASSWORD = 'Admin@123';  // From seed files

let authToken = '';
let testTripId = '';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(emoji, color, message) {
  console.log(`${emoji} ${color}${message}${colors.reset}`);
}

async function login() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    authToken = response.data.data.token;
    log('✅', colors.green, 'Login successful');
    return true;
  } catch (error) {
    log('❌', colors.red, `Login failed: ${error.response?.data?.message || error.message}`);
    console.log('\n💡 Tip: Update ADMIN_EMAIL and ADMIN_PASSWORD in this script\n');
    return false;
  }
}

async function createTrip() {
  try {
    const response = await axios.post(
      `${API_URL}/trips`,
      {
        title: `Test Trip ${Date.now()}`,
        slug: `test-trip-${Date.now()}`,
        description: 'Testing refactored controllers with new utilities',
        durationDays: 5,
        difficulty: 'MODERATE',
        location: 'Test Mountains',
        price: 15000,
        category: 'TREKKING',
        capacity: 10,
        itinerary: 'Day 1: Start\nDay 2: Continue\nDay 3-5: Summit and return',
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    testTripId = response.data.data.id;
    log('✅', colors.green, `Trip created: ${testTripId}`);
    log('📊', colors.blue, `  - Status: ${response.data.data.status}`);
    log('📊', colors.blue, `  - Title: ${response.data.data.title}`);
    return true;
  } catch (error) {
    log('❌', colors.red, `Create failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function submitTrip() {
  try {
    const response = await axios.post(
      `${API_URL}/trips/${testTripId}/submit`,
      {},
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    log('✅', colors.green, `Trip submitted`);
    log('📊', colors.blue, `  - Status: ${response.data.data.status}`);
    return true;
  } catch (error) {
    log('❌', colors.red, `Submit failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function approveTrip() {
  try {
    const response = await axios.post(
      `${API_URL}/trips/${testTripId}/approve`,
      {},
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    log('✅', colors.green, `Trip approved`);
    log('📊', colors.blue, `  - Status: ${response.data.data.status}`);
    log('📊', colors.blue, `  - Approved by: ${response.data.data.approvedById}`);
    return true;
  } catch (error) {
    log('❌', colors.red, `Approve failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function publishTrip() {
  try {
    const response = await axios.post(
      `${API_URL}/trips/${testTripId}/publish`,
      {},
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    log('✅', colors.green, `Trip published`);
    log('📊', colors.blue, `  - Status: ${response.data.data.status}`);
    log('📊', colors.blue, `  - Published at: ${response.data.data.publishedAt}`);
    return true;
  } catch (error) {
    log('❌', colors.red, `Publish failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function archiveTrip() {
  try {
    const response = await axios.post(
      `${API_URL}/trips/${testTripId}/archive`,
      {},
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    log('✅', colors.green, `Trip archived`);
    log('📊', colors.blue, `  - Status: ${response.data.data.status}`);
    return true;
  } catch (error) {
    log('❌', colors.red, `Archive failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function restoreTrip() {
  try {
    const response = await axios.post(
      `${API_URL}/trips/${testTripId}/restore`,
      {},
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    log('✅', colors.green, `Trip restored`);
    log('📊', colors.blue, `  - Status: ${response.data.data.status}`);
    return true;
  } catch (error) {
    log('❌', colors.red, `Restore failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function updateTrip() {
  try {
    const response = await axios.put(
      `${API_URL}/trips/${testTripId}`,
      {
        title: 'Updated Test Trip',
        price: 20000,
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    log('✅', colors.green, `Trip updated`);
    log('📊', colors.blue, `  - New title: ${response.data.data.title}`);
    log('📊', colors.blue, `  - New price: ${response.data.data.price}`);
    return true;
  } catch (error) {
    log('❌', colors.red, `Update failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testInvalidTransition() {
  try {
    // Try to archive a DRAFT trip (invalid transition)
    await axios.post(
      `${API_URL}/trips/${testTripId}/archive`,
      {},
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    log('❌', colors.red, 'Invalid transition was allowed (BUG!)');
    return false;
  } catch (error) {
    if (error.response?.data?.code === 'INVALID_STATUS_TRANSITION') {
      log('✅', colors.green, 'Invalid transition correctly rejected');
      log('📊', colors.blue, `  - Error: ${error.response.data.message}`);
      return true;
    } else {
      log('⚠️', colors.yellow, `Unexpected error: ${error.response?.data?.message}`);
      return false;
    }
  }
}

async function runTests() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║     TESTING REFACTORED TRIP CONTROLLERS               ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  log('🚀', colors.blue, 'Starting test suite...\n');

  const results = {
    passed: 0,
    failed: 0,
  };

  // Test 1: Login
  log('📝', colors.yellow, 'Test 1: Login');
  if (await login()) results.passed++;
  else { results.failed++; return showResults(results); }
  console.log('');

  // Test 2: Create Trip
  log('📝', colors.yellow, 'Test 2: Create Trip');
  if (await createTrip()) results.passed++;
  else { results.failed++; return showResults(results); }
  console.log('');

  // Test 3: Submit Trip
  log('📝', colors.yellow, 'Test 3: Submit Trip (DRAFT → PENDING_REVIEW)');
  if (await submitTrip()) results.passed++;
  else results.failed++;
  console.log('');

  // Test 4: Approve Trip
  log('📝', colors.yellow, 'Test 4: Approve Trip (PENDING_REVIEW → APPROVED)');
  if (await approveTrip()) results.passed++;
  else results.failed++;
  console.log('');

  // Test 5: Publish Trip
  log('📝', colors.yellow, 'Test 5: Publish Trip (APPROVED → PUBLISHED)');
  if (await publishTrip()) results.passed++;
  else results.failed++;
  console.log('');

  // Test 6: Archive Trip
  log('📝', colors.yellow, 'Test 6: Archive Trip (PUBLISHED → ARCHIVED)');
  if (await archiveTrip()) results.passed++;
  else results.failed++;
  console.log('');

  // Test 7: Restore Trip
  log('📝', colors.yellow, 'Test 7: Restore Trip (ARCHIVED → DRAFT)');
  if (await restoreTrip()) results.passed++;
  else results.failed++;
  console.log('');

  // Test 8: Update Trip
  log('📝', colors.yellow, 'Test 8: Update Trip');
  if (await updateTrip()) results.passed++;
  else results.failed++;
  console.log('');

  // Test 9: Invalid Transition
  log('📝', colors.yellow, 'Test 9: Invalid Transition (State Machine Validation)');
  if (await testInvalidTransition()) results.passed++;
  else results.failed++;
  console.log('');

  showResults(results);
}

function showResults(results) {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                  TEST RESULTS                          ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  log('✅', colors.green, `Passed: ${results.passed}`);
  log('❌', colors.red, `Failed: ${results.failed}`);
  
  const total = results.passed + results.failed;
  const percentage = total > 0 ? Math.round((results.passed / total) * 100) : 0;
  
  console.log('');
  if (percentage === 100) {
    log('🎉', colors.green, `ALL TESTS PASSED! (${percentage}%)`);
  } else if (percentage >= 70) {
    log('⚠️', colors.yellow, `Most tests passed (${percentage}%)`);
  } else {
    log('❌', colors.red, `Many tests failed (${percentage}%)`);
  }
  console.log('');
}

// Run the tests
runTests().catch(console.error);
