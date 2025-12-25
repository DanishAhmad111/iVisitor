import { useState, useEffect } from 'react';
import { visitorService } from '../../services/api';
import { toast } from 'react-hot-toast';

export default function FrontendTester() {
  const [results, setResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testVisitorId, setTestVisitorId] = useState(null);
  const [testVerificationCode, setTestVerificationCode] = useState(null);

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
    const result = {
      testName,
      success,
      data: data ? JSON.stringify(data, null, 2) : null,
      error: error ? (error.message || JSON.stringify(error)) : null,
      timestamp: new Date().toISOString()
    };
    
    setResults(prev => [...prev, result]);
    return result;
  };

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    
    try {
      // 1. Test visitor request submission
      try {
        const response = await visitorService.submitRequest(testVisitor);
        logTest('Visitor Request Submission', true, response);
        
        // Store the visitor ID for later tests
        setTestVisitorId(response.id);
        setTestVerificationCode(response.verificationCode);
        
        // Wait a bit before next test
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 2. Test get all visitors
        try {
          const visitors = await visitorService.getAll();
          const found = visitors.some(visitor => visitor.id === response.id);
          logTest('Get All Visitors', true, { 
            totalVisitors: visitors.length,
            containsNewVisitor: found
          });
          
          // Wait a bit before next test
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // 3. Test update visitor status
          try {
            const statusResponse = await visitorService.updateStatus(response.id, 'approved');
            logTest('Update Visitor Status', true, statusResponse);
            
            // Wait a bit before next test
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 4. Test guard verification
            try {
              const verifyResponse = await visitorService.verifyVisitor(
                response.id, 
                response.verificationCode
              );
              logTest('Guard Verification', true, verifyResponse);
              
              // Wait a bit before next test
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              // 5. Test mark visitor exit
              try {
                const exitResponse = await visitorService.markExit(response.id);
                logTest('Mark Visitor Exit', true, exitResponse);
              } catch (error) {
                logTest('Mark Visitor Exit', false, null, error);
              }
            } catch (error) {
              logTest('Guard Verification', false, null, error);
            }
          } catch (error) {
            logTest('Update Visitor Status', false, null, error);
          }
        } catch (error) {
          logTest('Get All Visitors', false, null, error);
        }
      } catch (error) {
        logTest('Visitor Request Submission', false, null, error);
      }
      
      toast.success('Frontend API tests completed!');
    } catch (error) {
      toast.error('Test suite error: ' + error.message);
      console.error('Test suite error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Frontend API Integration Tester</h1>
      
      <div className="mb-6">
        <button
          onClick={runTests}
          disabled={isRunning}
          className={`px-4 py-2 rounded-md text-white font-medium ${
            isRunning ? 'bg-gray-500' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isRunning ? 'Running Tests...' : 'Run Frontend API Tests'}
        </button>
      </div>
      
      {results.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Test Results</h2>
          <div className="space-y-4">
            {results.map((result, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-md ${
                  result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-center mb-2">
                  <span className={`inline-block w-6 h-6 rounded-full mr-2 ${
                    result.success ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  <h3 className="text-lg font-medium">
                    {result.testName} - {result.success ? 'Success' : 'Failed'}
                  </h3>
                </div>
                
                {result.data && (
                  <div className="mt-2">
                    <h4 className="text-sm font-medium text-gray-700">Response Data:</h4>
                    <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                      {result.data}
                    </pre>
                  </div>
                )}
                
                {result.error && (
                  <div className="mt-2">
                    <h4 className="text-sm font-medium text-red-700">Error:</h4>
                    <pre className="mt-1 text-xs bg-red-100 p-2 rounded overflow-auto max-h-40">
                      {result.error}
                    </pre>
                  </div>
                )}
                
                <div className="mt-2 text-xs text-gray-500">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-500">
        <p>This tester will run through all the frontend API integration points:</p>
        <ol className="list-decimal ml-6 mt-2 space-y-1">
          <li>Visitor Request Submission</li>
          <li>Get All Visitors</li>
          <li>Update Visitor Status</li>
          <li>Guard Verification</li>
          <li>Mark Visitor Exit</li>
        </ol>
      </div>
    </div>
  );
}
