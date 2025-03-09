// Advanced MCP Server Implementation
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const axios = require('axios');
const { exec } = require('child_process');
const schedule = require('node-schedule');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Store scheduled jobs
const scheduledJobs = {};

// File Operations
const fileOperations = {
  read_file: async (params) => {
    const { path } = params;
    try {
      const content = await fs.readFile(path, 'utf8');
      return {
        result: {
          content
        }
      };
    } catch (error) {
      return {
        error: `Failed to read file: ${error.message}`
      };
    }
  },
  
  write_file: async (params) => {
    const { path, content, append = false } = params;
    try {
      if (append) {
        await fs.appendFile(path, content);
      } else {
        await fs.outputFile(path, content);
      }
      return {
        result: {
          success: true,
          path
        }
      };
    } catch (error) {
      return {
        error: `Failed to write file: ${error.message}`
      };
    }
  },
  
  list_directory: async (params) => {
    const { path, recursive = false } = params;
    try {
      let files;
      if (recursive) {
        // Get all files recursively
        const getFilesRecursively = async (dir) => {
          const dirents = await fs.readdir(dir, { withFileTypes: true });
          const files = await Promise.all(dirents.map(async (dirent) => {
            const res = path.resolve(dir, dirent.name);
            return dirent.isDirectory() ? getFilesRecursively(res) : res;
          }));
          return Array.prototype.concat(...files);
        };
        files = await getFilesRecursively(path);
      } else {
        files = await fs.readdir(path);
      }
      return {
        result: {
          files
        }
      };
    } catch (error) {
      return {
        error: `Failed to list directory: ${error.message}`
      };
    }
  }
};

// System Operations
const systemOperations = {
  execute_command: async (params) => {
    const { command, working_directory = '.' } = params;
    return new Promise((resolve) => {
      exec(command, { cwd: working_directory }, (error, stdout, stderr) => {
        if (error) {
          resolve({
            error: `Command execution failed: ${error.message}`,
            stderr
          });
          return;
        }
        
        resolve({
          result: {
            stdout,
            stderr
          }
        });
      });
    });
  },
  
  get_environment_variable: async (params) => {
    const { name } = params;
    const value = process.env[name];
    
    if (value === undefined) {
      return {
        error: `Environment variable '${name}' not found`
      };
    }
    
    return {
      result: {
        name,
        value
      }
    };
  }
};

// Web Operations
const webOperations = {
  http_request: async (params) => {
    const { url, method = 'GET', headers = {}, body = '' } = params;
    try {
      const response = await axios({
        method,
        url,
        headers,
        data: body,
        validateStatus: () => true // Don't throw on any status code
      });
      
      return {
        result: {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          data: response.data
        }
      };
    } catch (error) {
      return {
        error: `HTTP request failed: ${error.message}`
      };
    }
  },
  
  download_file: async (params) => {
    const { url, destination } = params;
    try {
      const response = await axios({
        method: 'GET',
        url,
        responseType: 'stream'
      });
      
      const writer = fs.createWriteStream(destination);
      response.data.pipe(writer);
      
      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          resolve({
            result: {
              success: true,
              destination
            }
          });
        });
        
        writer.on('error', (error) => {
          reject({
            error: `Failed to write file: ${error.message}`
          });
        });
      });
    } catch (error) {
      return {
        error: `Failed to download file: ${error.message}`
      };
    }
  }
};

// Scheduler Operations
const schedulerOperations = {
  schedule_task: async (params) => {
    const { task_name, command, schedule: cronSchedule } = params;
    
    try {
      // Cancel existing job with the same name if it exists
      if (scheduledJobs[task_name]) {
        scheduledJobs[task_name].cancel();
      }
      
      // Schedule new job
      const job = schedule.scheduleJob(cronSchedule, function() {
        exec(command, (error, stdout, stderr) => {
          console.log(`Task ${task_name} executed`);
          if (error) {
            console.error(`Task ${task_name} error: ${error.message}`);
            console.error(stderr);
            return;
          }
          console.log(stdout);
        });
      });
      
      scheduledJobs[task_name] = job;
      
      return {
        result: {
          success: true,
          task_name,
          schedule: cronSchedule,
          next_run: job.nextInvocation()
        }
      };
    } catch (error) {
      return {
        error: `Failed to schedule task: ${error.message}`
      };
    }
  },
  
  list_scheduled_tasks: async () => {
    const tasks = Object.keys(scheduledJobs).map(taskName => ({
      task_name: taskName,
      next_run: scheduledJobs[taskName].nextInvocation()
    }));
    
    return {
      result: {
        tasks
      }
    };
  },
  
  cancel_task: async (params) => {
    const { task_name } = params;
    
    if (!scheduledJobs[task_name]) {
      return {
        error: `Task '${task_name}' not found`
      };
    }
    
    scheduledJobs[task_name].cancel();
    delete scheduledJobs[task_name];
    
    return {
      result: {
        success: true,
        task_name
      }
    };
  }
};

// Combine all tools
const tools = {
  file_operations: fileOperations,
  system_operations: systemOperations,
  web_operations: webOperations,
  scheduler: schedulerOperations
};

// MCP endpoint
app.post('/mcp', async (req, res) => {
  const { tool, params } = req.body;
  
  // Parse tool path (e.g., "file_operations.read_file")
  const [toolCategory, toolName] = tool.split('.');
  
  if (!tools[toolCategory] || !tools[toolCategory][toolName]) {
    return res.status(400).json({
      error: `Unknown tool: ${tool}`
    });
  }
  
  try {
    const result = await tools[toolCategory][toolName](params);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: `Error executing tool ${tool}: ${error.message}`
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Advanced MCP server listening at http://localhost:${port}`);
  console.log('Available tool categories:');
  Object.keys(tools).forEach(category => {
    console.log(`- ${category}`);
    Object.keys(tools[category]).forEach(tool => {
      console.log(`  - ${tool}`);
    });
  });
});

/*
To use this server:
1. Install dependencies: npm install express body-parser axios fs-extra node-schedule
2. Run the server: node advanced-mcp-server.js
3. Make requests to the MCP endpoint:

Example request:
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"tool": "file_operations.read_file", "params": {"path": "example.txt"}}'
*/