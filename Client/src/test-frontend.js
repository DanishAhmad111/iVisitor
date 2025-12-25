import { visitorService } from './services/api';

// Test data
const testVisitor = {
  visitorName: 'Frontend Test Visitor',
  visitorEmail: 'frontendtest@example.com',
  residentName: 'Frontend Test Resident',
  residentEmail: 'frontendresident@example.com',
  visitReason: 'Frontend API Integration Testing',
  carNumber: 'FE-TEST'
};

// Helper function to log test results
const logTest = (testName, success, data = null, error = null) => {
  console.log(`\n----- ${testName} -----`);
  if (success) {
    console.log('✅ SUCCESS');
    if (data) console.log('Data:', data);
  } else {
    console.log('❌ FAILED');
    if (error) console.log('Error:', error.message || error);
  }
};

// Test all frontend API integrations
const runFrontendTests = async () => {
  try {
    console.log('\n🔍 STARTING FRONTEND API INTEGRATION TESTS\n');
    
    // 1. Test visitor request submission
    try {
      console.log('1. Testing visitor request submission...');
      const response = await visitorService.submitRequest(testVisitor);
      logTest('Visitor Request Submission', true, response);
      
      // Store the visitor ID for later tests
      window.testVisitorId = response.id;
      window.testVerificationCode = response.verificationCode;
    } catch (error) {
      logTest('Visitor Request Submission', false, null, error);
    }
    
    // 2. Test get all visitors
    try {
      console.log('\n2. Testing get all visitors...');
      const visitors = await visitorService.getAll();
      const found = visitors.some(visitor => visitor.id === window.testVisitorId);
      logTest('Get All Visitors', true, { 
        totalVisitors: visitors.length,
        containsNewVisitor: found
      });
    } catch (error) {
      logTest('Get All Visitors', false, null, error);
    }
    
    // 3. Test update visitor status
    try {
      console.log('\n3. Testing update visitor status...');
      const response = await visitorService.updateStatus(window.testVisitorId, 'approved');
      logTest('Update Visitor Status', true, response);
    } catch (error) {
      logTest('Update Visitor Status', false, null, error);
    }
    
    // 4. Test guard verification
    try {
      console.log('\n4. Testing guard verification...');
      const response = await visitorService.verifyVisitor(
        window.testVisitorId, 
        window.testVerificationCode
      );
      logTest('Guard Verification', true, response);
    } catch (error) {
      logTest('Guard Verification', false, null, error);
    }
    
    // 5. Test mark visitor exit
    try {
      console.log('\n5. Testing mark visitor exit...');
      const response = await visitorService.markExit(window.testVisitorId);
      logTest('Mark Visitor Exit', true, response);
    } catch (error) {
      logTest('Mark Visitor Exit', false, null, error);
    }
    
    console.log('\n🏁 FRONTEND API INTEGRATION TESTS COMPLETED\n');
    
  } catch (error) {
    console.error('Test suite error:', error);
  }
};

// Export the test function
export default runFrontendTests;
