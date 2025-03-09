const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

// Website to monitor
const url = 'https://example.com';

// Ensure logs directory exists
const logsDir = 'logs';
fs.ensureDirSync(logsDir);

// Check the website
console.log(`Checking website: ${url}`);

axios.get(url)
  .then(response => {
    const status = response.status;
    const timestamp = new Date().toISOString();
    
    // Log the status
    fs.appendFileSync(
      path.join(logsDir, 'website-status.log'),
      `${timestamp} - Status: ${status}\n`
    );
    
    if (status !== 200) {
      // Send an alert (implement your preferred notification method)
      console.error(`Website check failed: ${status}`);
    } else {
      console.log(`Website check successful: ${status}`);
    }
  })
  .catch(error => {
    const timestamp = new Date().toISOString();
    
    // Log the error
    fs.appendFileSync(
      path.join(logsDir, 'website-status.log'),
      `${timestamp} - Error: ${error.message}\n`
    );
    
    // Send an alert
    console.error(`Website check error: ${error.message}`);
  });