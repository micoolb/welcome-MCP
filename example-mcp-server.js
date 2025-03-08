// Example MCP Server Implementation
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.json());

// MCP Tool implementations
const tools = {
  get_current_time: async (params) => {
    const { timezone } = params;
    try {
      const time = new Date().toLocaleString('en-US', { timeZone: timezone });
      return {
        result: {
          time,
          timezone
        }
      };
    } catch (error) {
      return {
        error: `Failed to get time for timezone: ${timezone}. Error: ${error.message}`
      };
    }
  },
  
  search_data: async (params) => {
    const { query, limit = 10 } = params;
    
    // This would typically connect to a database or API
    // For this example, we'll just return mock data
    const mockResults = [
      { id: 1, title: "Example result 1", relevance: 0.95 },
      { id: 2, title: "Example result 2", relevance: 0.87 },
      { id: 3, title: "Example result 3", relevance: 0.76 }
    ].slice(0, limit);
    
    return {
      result: {
        query,
        count: mockResults.length,
        results: mockResults
      }
    };
  }
};

// MCP endpoint
app.post('/mcp', async (req, res) => {
  const { tool, params } = req.body;
  
  if (!tools[tool]) {
    return res.status(400).json({
      error: `Unknown tool: ${tool}`
    });
  }
  
  try {
    const result = await tools[tool](params);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: `Error executing tool ${tool}: ${error.message}`
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`MCP server listening at http://localhost:${port}`);
  console.log('Available tools:');
  Object.keys(tools).forEach(tool => console.log(`- ${tool}`));
});

/*
To use this server:
1. Install dependencies: npm install express body-parser
2. Run the server: node example-mcp-server.js
3. Make requests to the MCP endpoint:

Example request:
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"tool": "get_current_time", "params": {"timezone": "America/New_York"}}'
*/