const fs = require('fs-extra');
const path = require('path');

// Define source and destination
const sourceDir = 'logs';
const backupDir = 'backups';
const timestamp = new Date().toISOString().replace(/:/g, '-');

// Create backup directory if it doesn't exist
fs.ensureDirSync(backupDir);

// Create logs directory if it doesn't exist (for demo purposes)
fs.ensureDirSync(sourceDir);

// Create a sample log file if none exists (for demo purposes)
const sampleLogPath = path.join(sourceDir, 'sample.log');
if (!fs.existsSync(sampleLogPath)) {
  fs.writeFileSync(sampleLogPath, `Sample log entry at ${new Date().toISOString()}\n`);
}

// Copy logs to backup directory with timestamp
fs.copySync(sourceDir, path.join(backupDir, `logs-${timestamp}`));

console.log(`Backup completed: logs-${timestamp}`);