/**
 * Reusable Node.js Native HTTP Backend Boilerplate
 * 
 * Features:
 * - Zero external dependencies (fast startup, secure)
 * - Built-in JSON request body parser
 * - CORS middleware handling out of the box
 * - Clean RESTful endpoint routing structure
 */

const http = require('http');

const PORT = process.env.PORT || 4000;

// Dynamic In-memory Data Mock Store
const itemsDatabase = [
  { id: 1, name: 'Setup backend structure', status: 'completed' },
  { id: 2, name: 'Develop awesome APIs', status: 'pending' }
];

// Helper to set CORS and Standard JSON Headers
const setCommonHeaders = (res, statusCode = 200) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400' // 24 hours caching
  });
};

// Parser for JSON POST Requests
const parseJsonBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error('Invalid JSON format'));
      }
    });
    req.on('error', (err) => reject(err));
  });
};

// Request Controller Router
const server = http.createServer(async (req, res) => {
  const { method, url } = req;
  console.log(`[${new Date().toISOString()}] ${method} ${url}`);

  // 1. Preflight CORS handler
  if (method === 'OPTIONS') {
    setCommonHeaders(res, 204);
    res.end();
    return;
  }

  // 2. Routing Map
  try {
    // GET /api/health - API Health Check
    if (url === '/api/health' && method === 'GET') {
      setCommonHeaders(res);
      res.end(JSON.stringify({ 
        status: 'UP', 
        timestamp: new Date(), 
        uptime: process.uptime() 
      }));
      return;
    }

    // GET /api/items - Retrieve all items
    if (url === '/api/items' && method === 'GET') {
      setCommonHeaders(res);
      res.end(JSON.stringify({ success: true, data: itemsDatabase }));
      return;
    }

    // POST /api/items - Create a new item
    if (url === '/api/items' && method === 'POST') {
      const body = await parseJsonBody(req);
      
      if (!body.name) {
        setCommonHeaders(res, 400);
        res.end(JSON.stringify({ success: false, error: "Missing required parameter 'name'" }));
        return;
      }

      const newItem = {
        id: itemsDatabase.length + 1,
        name: body.name,
        status: body.status || 'pending'
      };

      itemsDatabase.push(newItem);
      setCommonHeaders(res, 21);
      res.end(JSON.stringify({ success: true, data: newItem }));
      return;
    }

    // 404 Route Not Found
    setCommonHeaders(res, 404);
    res.end(JSON.stringify({ success: false, error: 'Endpoint route not found' }));

  } catch (error) {
    console.error('Server Internal Error:', error);
    setCommonHeaders(res, 500);
    res.end(JSON.stringify({ success: false, error: 'Internal Server Error', message: error.message }));
  }
});

// Run Backend Listener
server.listen(PORT, () => {
  console.log(`\n🚀 Native API Server running at http://localhost:${PORT}`);
  console.log(`   Health Check: http://localhost:${PORT}/api/health`);
  console.log(`   Items API:    http://localhost:${PORT}/api/items`);
  console.log('   Press Ctrl+C to shutdown safely.\n');
});
