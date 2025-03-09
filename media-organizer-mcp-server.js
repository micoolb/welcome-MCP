// MCP Server with Media Organizer Integration
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3002;

// Import the media organizer tools
const mediaOrganizerTools = require('./media-organizer-tool');

app.use(bodyParser.json());

// Combine all tools
const tools = {
  media_organizer: mediaOrganizerTools
};

// MCP endpoint
app.post('/mcp', async (req, res) => {
  const { tool, params } = req.body;
  
  // Parse tool path (e.g., "media_organizer.organize_all_media")
  const [toolCategory, toolName] = tool.split('.');
  
  if (!tools[toolCategory] || !tools[toolCategory][toolName]) {
    return res.status(400).json({
      error: `Unknown tool: ${tool}`
    });
  }
  
  try {
    const result = await tools[toolCategory][toolName](params || {});
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: `Error executing tool ${tool}: ${error.message}`
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Media Organizer MCP server listening at http://localhost:${port}`);
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
1. Install dependencies: npm install express body-parser
2. Run the server: node media-organizer-mcp-server.js
3. Make requests to the MCP endpoint:

Example request:
curl -X POST http://localhost:3002/mcp \
  -H "Content-Type: application/json" \
  -d '{"tool": "media_organizer.get_config", "params": {}}'
*/