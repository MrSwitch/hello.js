/**
 * JavaScript Code Execution Functionality
 * Handles running code, capturing output, and running tests
 */

// Run the code entered by the user
function executeCode(code) {
    const output = document.getElementById('output');
    output.innerHTML = '';
    
    // Capture console.log output
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    const logs = [];
    
    // Override console methods to capture output
    console.log = function() {
        const args = Array.from(arguments).join(' ');
        logs.push({ type: 'log', content: args });
        originalConsoleLog.apply(console, arguments);
    };
    
    console.error = function() {
        const args = Array.from(arguments).join(' ');
        logs.push({ type: 'error', content: args });
        originalConsoleError.apply(console, arguments);
    };
    
    console.warn = function() {
        const args = Array.from(arguments).join(' ');
        logs.push({ type: 'warn', content: args });
        originalConsoleWarn.apply(console, arguments);
    };
    
    try {
        // Create a sandbox function to execute the code
        // This helps prevent some global scope issues
        const sandboxFn = new Function(code);
        sandboxFn();
        
        // Display the output
        displayLogs(logs, output);
        
        return { success: true, logs };
    } catch (error) {
        // Display the error
        const errorElement = document.createElement('div');
        errorElement.className = 'console-error';
        errorElement.textContent = error.toString();
        output.appendChild(errorElement);
        
        logs.push({ type: 'error', content: error.toString() });
        return { success: false, error: error.toString(), logs };
    } finally {
        // Restore console methods
        console.log = originalConsoleLog;
        console.error = originalConsoleError;
        console.warn = originalConsoleWarn;
    }
}

// Display logs in the output container
function displayLogs(logs, outputContainer) {
    logs.forEach(log => {
        const logElement = document.createElement('div');
        logElement.className = `console-${log.type}`;
        logElement.textContent = log.content;
        outputContainer.appendChild(logElement);
    });
}

// Run tests for the current challenge
function runTests(challengeId) {
    const challenge = challenges[challengeId];
    const testResultsElement = document.getElementById('test-results');
    testResultsElement.innerHTML = '';
    
    // Create test results container
    const testsContainer = document.createElement('div');
    testsContainer.className = 'test-results';
    testsContainer.innerHTML = '<h3>Test Results:</h3>';
    testResultsElement.appendChild(testsContainer);
    
    // Run each test
    const testResults = [];
    challenge.tests.forEach(test => {
        const testElement = document.createElement('div');
        let passed = false;
        let errorMessage = null;
        
        try {
            passed = eval(test.test);
        } catch (error) {
            passed = false;
            errorMessage = error.toString();
        }
        
        testElement.className = passed ? 'test-item test-pass' : 'test-item test-fail';
        testElement.innerHTML = `<span>${passed ? '✓' : '✗'}</span> ${test.name}`;
        
        if (errorMessage) {
            const errorElement = document.createElement('div');
            errorElement.className = 'test-error';
            errorElement.textContent = errorMessage;
            testElement.appendChild(errorElement);
        }
        
        testsContainer.appendChild(testElement);
        testResults.push({ name: test.name, passed, errorMessage });
    });
    
    return testResults;
}

// Main function to run code and tests
function runCode() {
    const code = getCode(); // Get code from editor
    const output = document.getElementById('output');
    const challengeId = document.getElementById('challenge-select').value;
    
    // Clear previous output and test results
    output.innerHTML = '';
    document.getElementById('test-results').innerHTML = '';
    
    // Execute the code
    const result = executeCode(code);
    
    // If code executed successfully, run tests
    if (result.success) {
        runTests(challengeId);
    }
}