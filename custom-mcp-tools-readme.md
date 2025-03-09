# Custom MCP Automation Tools

This project provides a comprehensive set of automation tools using Anthropic's Model Context Protocol (MCP). These tools allow you to automate various tasks on your system, from file operations to web requests and scheduled tasks.

## Features

- **File Operations**: Read, write, and list files and directories
- **System Operations**: Execute commands and access environment variables
- **Web Operations**: Make HTTP requests and download files
- **Task Scheduling**: Schedule, list, and cancel automated tasks

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/custom-mcp-tools.git
   cd custom-mcp-tools
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Usage

1. Start the MCP server:
   ```
   npm start
   ```

2. The server will start on http://localhost:3000

3. You can now use these tools with any MCP-compatible client (Cursor, Claude Desktop, etc.)

## Tool Categories

### File Operations

- **read_file**: Read the contents of a file
  ```json
  {
    "tool": "file_operations.read_file",
    "params": {
      "path": "example.txt"
    }
  }
  ```

- **write_file**: Write content to a file
  ```json
  {
    "tool": "file_operations.write_file",
    "params": {
      "path": "example.txt",
      "content": "Hello, world!",
      "append": false
    }
  }
  ```

- **list_directory**: List the contents of a directory
  ```json
  {
    "tool": "file_operations.list_directory",
    "params": {
      "path": ".",
      "recursive": false
    }
  }
  ```

### System Operations

- **execute_command**: Execute a system command
  ```json
  {
    "tool": "system_operations.execute_command",
    "params": {
      "command": "echo Hello, world!",
      "working_directory": "."
    }
  }
  ```

- **get_environment_variable**: Get the value of an environment variable
  ```json
  {
    "tool": "system_operations.get_environment_variable",
    "params": {
      "name": "PATH"
    }
  }
  ```

### Web Operations

- **http_request**: Make an HTTP request
  ```json
  {
    "tool": "web_operations.http_request",
    "params": {
      "url": "https://example.com",
      "method": "GET",
      "headers": {
        "User-Agent": "Custom MCP Tools"
      }
    }
  }
  ```

- **download_file**: Download a file from a URL
  ```json
  {
    "tool": "web_operations.download_file",
    "params": {
      "url": "https://example.com/file.txt",
      "destination": "downloaded-file.txt"
    }
  }
  ```

### Scheduler

- **schedule_task**: Schedule a task to run at a specific time
  ```json
  {
    "tool": "scheduler.schedule_task",
    "params": {
      "task_name": "daily-backup",
      "command": "node backup-script.js",
      "schedule": "0 0 * * *"
    }
  }
  ```

- **list_scheduled_tasks**: List all scheduled tasks
  ```json
  {
    "tool": "scheduler.list_scheduled_tasks",
    "params": {}
  }
  ```

- **cancel_task**: Cancel a scheduled task
  ```json
  {
    "tool": "scheduler.cancel_task",
    "params": {
      "task_name": "daily-backup"
    }
  }
  ```

## Example Automation Scenarios

### Daily Log Backup

```javascript
// Schedule a daily backup of log files
const scheduleBackup = {
  tool: "scheduler.schedule_task",
  params: {
    task_name: "daily-log-backup",
    command: "node scripts/backup-logs.js",
    schedule: "0 0 * * *" // Run at midnight every day
  }
};

// Create a backup script
const createBackupScript = {
  tool: "file_operations.write_file",
  params: {
    path: "scripts/backup-logs.js",
    content: `
      const fs = require('fs-extra');
      const path = require('path');
      
      // Define source and destination
      const sourceDir = 'logs';
      const backupDir = 'backups';
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      
      // Create backup directory if it doesn't exist
      fs.ensureDirSync(backupDir);
      
      // Copy logs to backup directory with timestamp
      fs.copySync(sourceDir, path.join(backupDir, \`logs-\${timestamp}\`));
      
      console.log(\`Backup completed: logs-\${timestamp}\`);
    `
  }
};
```

### Web Monitoring

```javascript
// Schedule a task to check a website every hour
const scheduleWebCheck = {
  tool: "scheduler.schedule_task",
  params: {
    task_name: "website-monitor",
    command: "node scripts/check-website.js",
    schedule: "0 * * * *" // Run every hour
  }
};

// Create the website checking script
const createWebCheckScript = {
  tool: "file_operations.write_file",
  params: {
    path: "scripts/check-website.js",
    content: `
      const axios = require('axios');
      const fs = require('fs');
      
      // Website to monitor
      const url = 'https://example.com';
      
      // Check the website
      axios.get(url)
        .then(response => {
          const status = response.status;
          const timestamp = new Date().toISOString();
          
          // Log the status
          fs.appendFileSync(
            'logs/website-status.log',
            \`\${timestamp} - Status: \${status}\\n\`
          );
          
          if (status !== 200) {
            // Send an alert (implement your preferred notification method)
            console.error(\`Website check failed: \${status}\`);
          }
        })
        .catch(error => {
          const timestamp = new Date().toISOString();
          
          // Log the error
          fs.appendFileSync(
            'logs/website-status.log',
            \`\${timestamp} - Error: \${error.message}\\n\`
          );
          
          // Send an alert
          console.error(\`Website check error: \${error.message}\`);
        });
    `
  }
};
```

## Security Considerations

- This server runs commands on your system, so be careful about what commands you allow it to execute.
- Consider implementing authentication for the MCP endpoint if you're using it in a shared environment.
- Be cautious about what environment variables you expose through the API.

## License

MIT