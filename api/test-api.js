const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

// Test configuration
const config = {
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testHealthCheck() {
  log('\n🏥 Testing Health Check Endpoints...', 'blue');
  
  try {
    // Basic health check
    log('Testing /healthCheck...', 'yellow');
    const healthResponse = await axios.get(`${BASE_URL}/healthCheck`, config);
    log(`✅ Health Check Status: ${healthResponse.data.data.status}`, 'green');
    log(`Response Time: ${healthResponse.data.meta.duration}`, 'green');
    
    // System metrics
    log('\nTesting /healthCheck/metrics...', 'yellow');
    const metricsResponse = await axios.get(`${BASE_URL}/healthCheck/metrics`, config);
    log('✅ System Metrics Retrieved', 'green');
    log(`Memory Usage: ${metricsResponse.data.data.system.memory.heapUsed}`, 'green');
    log(`Uptime: ${metricsResponse.data.data.system.uptime}`, 'green');
    
    // Database test
    log('\nTesting /healthCheck/db-test...', 'yellow');
    const dbResponse = await axios.get(`${BASE_URL}/healthCheck/db-test`, config);
    log('✅ Database Test Successful', 'green');
    log(`Database: ${dbResponse.data.data.database}`, 'green');
    log(`Response Time: ${dbResponse.data.data.responseTime}`, 'green');
    
    // Redis test
    log('\nTesting /healthCheck/redis-test...', 'yellow');
    const redisResponse = await axios.get(`${BASE_URL}/healthCheck/redis-test`, config);
    log('✅ Redis Test Successful', 'green');
    log(`Redis Status: ${redisResponse.data.data.isReady ? 'Ready' : 'Not Ready'}`, 'green');
    log(`Response Time: ${redisResponse.data.data.responseTime}`, 'green');
    
  } catch (error) {
    log(`❌ Health Check Test Failed: ${error.message}`, 'red');
    if (error.response) {
      log(`Status: ${error.response.status}`, 'red');
      log(`Data: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
  }
}

async function testTransactionEndpoints() {
  log('\n📊 Testing Transaction Endpoints...', 'blue');
  
  try {
    // Test get last 10 transactions
    log('Testing /transaction/last10...', 'yellow');
    const last10Response = await axios.post(`${BASE_URL}/transaction/last10`, {}, config);
    log('✅ Last 10 Transactions Retrieved', 'green');
    log(`Count: ${last10Response.data.data.length}`, 'green');
    log(`Response Time: ${last10Response.data.meta.duration}`, 'green');
    
    // Test transaction by hash (with invalid hash to test error handling)
    log('\nTesting /transaction/details (with invalid hash)...', 'yellow');
    try {
      await axios.post(`${BASE_URL}/transaction/details`, {
        tx_hash: 'invalid_hash'
      }, config);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        log('✅ Error handling working correctly for invalid hash', 'green');
        log(`Error Type: ${error.response.data.error.type}`, 'green');
      } else {
        log(`❌ Unexpected error: ${error.message}`, 'red');
      }
    }
    
    // Test transaction by address (with invalid address to test validation)
    log('\nTesting /transaction/address (with invalid address)...', 'yellow');
    try {
      await axios.post(`${BASE_URL}/transaction/address`, {
        address: 'invalid_address'
      }, config);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        log('✅ Error handling working correctly for invalid address', 'green');
        log(`Error Type: ${error.response.data.error.type}`, 'green');
      } else {
        log(`❌ Unexpected error: ${error.message}`, 'red');
      }
    }
    
  } catch (error) {
    log(`❌ Transaction Endpoints Test Failed: ${error.message}`, 'red');
    if (error.response) {
      log(`Status: ${error.response.status}`, 'red');
      log(`Data: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
  }
}

async function testErrorHandling() {
  log('\n🚨 Testing Error Handling...', 'blue');
  
  try {
    // Test 404 endpoint
    log('Testing non-existent endpoint...', 'yellow');
    try {
      await axios.get(`${BASE_URL}/non-existent-endpoint`, config);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        log('✅ 404 Error handling working correctly', 'green');
        log(`Error Type: ${error.response.data.error.type}`, 'green');
      } else {
        log(`❌ Unexpected error: ${error.message}`, 'red');
      }
    }
    
    // Test rate limiting (if configured)
    log('\nTesting rate limiting...', 'yellow');
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(axios.get(`${BASE_URL}/healthCheck`, config));
    }
    
    try {
      await Promise.all(promises);
      log('✅ Rate limiting test completed (no limits hit)', 'green');
    } catch (error) {
      if (error.response && error.response.status === 429) {
        log('✅ Rate limiting working correctly', 'green');
      } else {
        log(`❌ Rate limiting test failed: ${error.message}`, 'red');
      }
    }
    
  } catch (error) {
    log(`❌ Error Handling Test Failed: ${error.message}`, 'red');
  }
}

async function testResponseFormat() {
  log('\n📋 Testing Response Format...', 'blue');
  
  try {
    const response = await axios.get(`${BASE_URL}/healthCheck`, config);
    const data = response.data;
    
    // Check response structure
    const hasSuccess = 'success' in data;
    const hasData = 'data' in data;
    const hasMeta = 'meta' in data;
    const hasRequestId = data.meta && 'requestId' in data.meta;
    const hasTimestamp = data.meta && 'timestamp' in data.meta;
    const hasDuration = data.meta && 'duration' in data.meta;
    
    log('Checking response structure...', 'yellow');
    log(`✅ Has success field: ${hasSuccess}`, hasSuccess ? 'green' : 'red');
    log(`✅ Has data field: ${hasData}`, hasData ? 'green' : 'red');
    log(`✅ Has meta field: ${hasMeta}`, hasMeta ? 'green' : 'red');
    log(`✅ Has requestId: ${hasRequestId}`, hasRequestId ? 'green' : 'red');
    log(`✅ Has timestamp: ${hasTimestamp}`, hasTimestamp ? 'green' : 'red');
    log(`✅ Has duration: ${hasDuration}`, hasDuration ? 'green' : 'red');
    
    if (hasRequestId) {
      log(`Request ID: ${data.meta.requestId}`, 'blue');
    }
    if (hasDuration) {
      log(`Response Duration: ${data.meta.duration}`, 'blue');
    }
    
  } catch (error) {
    log(`❌ Response Format Test Failed: ${error.message}`, 'red');
  }
}

async function runAllTests() {
  log('🚀 Starting API Enhancement Tests...', 'blue');
  log('Make sure your API server is running on http://localhost:4000', 'yellow');
  
  try {
    await testHealthCheck();
    await testTransactionEndpoints();
    await testErrorHandling();
    await testResponseFormat();
    
    log('\n🎉 All tests completed!', 'green');
    log('Check the API logs for detailed debugging information.', 'blue');
    
  } catch (error) {
    log(`\n❌ Test suite failed: ${error.message}`, 'red');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testHealthCheck,
  testTransactionEndpoints,
  testErrorHandling,
  testResponseFormat,
  runAllTests
}; 