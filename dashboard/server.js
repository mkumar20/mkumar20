/**
 * Mono-Repo Dashboard Native Server
 * 
 * A zero-dependency workspace server that serves the dashboard UI
 * and provides REST APIs to query, create, and manage projects.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const WORKSPACE_DIR = path.resolve(__dirname, '..');
const BACKLOG_DIR = path.join(WORKSPACE_DIR, 'backlog');
const PROJECTS_DIR = path.join(WORKSPACE_DIR, 'projects');
const TEMPLATES_DIR = path.join(WORKSPACE_DIR, 'templates');

// Helper to parse simple YAML Frontmatter in markdown files without external library
function parseFrontmatter(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const result = {
      filename: path.basename(filePath),
      title: path.basename(filePath, '.md'),
      status: 'Idea',
      category: 'Web App',
      tags: [],
      created: new Date().toISOString().split('T')[0]
    };

    // Regex to match YAML frontmatter between "---" blocks
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (match) {
      const yamlBlock = match[1];
      const lines = yamlBlock.split('\n');
      lines.forEach(line => {
        const parts = line.split(':');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          let value = parts.slice(1).join(':').trim();
          
          // Clean quotes if any
          if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
          if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);

          if (key === 'title') result.title = value;
          else if (key === 'status') result.status = value;
          else if (key === 'category') result.category = value;
          else if (key === 'tags') {
            // Parse arrays like ["HTML", "CSS"] or [HTML, CSS]
            try {
              if (value.startsWith('[') && value.endsWith(']')) {
                result.tags = JSON.parse(value.replace(/'/g, '"'));
              } else {
                result.tags = value.split(',').map(t => t.trim()).filter(Boolean);
              }
            } catch (e) {
              result.tags = value.replace(/[\[\]"]/g, '').split(',').map(t => t.trim()).filter(Boolean);
            }
          }
          else if (key === 'created') result.created = value;
        }
      });
    }
    return result;
  } catch (error) {
    console.error(`Error parsing frontmatter for ${filePath}:`, error);
    return {
      filename: path.basename(filePath),
      title: path.basename(filePath, '.md'),
      status: 'Idea',
      category: 'Web App',
      tags: [],
      created: ''
    };
  }
}

// Set Common Headers (JSON & CORS)
const setHeaders = (res, statusCode = 200) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
};

// Parser for POST JSON requests
const parseJsonBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', err => reject(err));
  });
};

// Native Static File Server Middleware
function serveStaticFile(req, res) {
  let reqPath = req.url === '/' ? '/index.html' : req.url;
  
  // Prevent directory traversal attacks
  reqPath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  
  const publicDir = path.join(__dirname, 'public');
  const filePath = path.join(publicDir, reqPath);

  // Check if file is inside public directory boundary
  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'text/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon'
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
}

// Initialize Router
const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  // Handle CORS Preflight Options
  if (method === 'OPTIONS') {
    setHeaders(res, 204);
    res.end();
    return;
  }

  // --- API ROUTING ---
  
  // API: GET /api/projects - Returns stats, backlog, and active projects
  if (url === '/api/projects' && method === 'GET') {
    try {
      const backlogItems = [];
      const activeProjects = [];

      // 1. Read Backlog Files
      if (fs.existsSync(BACKLOG_DIR)) {
        const files = fs.readdirSync(BACKLOG_DIR);
        files.forEach(file => {
          if (file.endsWith('.md') && file !== 'template.md') {
            const meta = parseFrontmatter(path.join(BACKLOG_DIR, file));
            backlogItems.push(meta);
          }
        });
      }

      // 2. Read Projects Directories
      if (fs.existsSync(PROJECTS_DIR)) {
        const dirs = fs.readdirSync(PROJECTS_DIR, { withFileTypes: true });
        dirs.forEach(dirent => {
          if (dirent.isDirectory()) {
            const projectPath = path.join(PROJECTS_DIR, dirent.name);
            let meta = {
              name: dirent.name,
              title: dirent.name,
              category: 'Web App',
              tags: [],
              hasReadme: false
            };

            // Check if project has its own README
            const readmePath = path.join(projectPath, 'README.md');
            if (fs.existsSync(readmePath)) {
              meta.hasReadme = true;
              const readmeMeta = parseFrontmatter(readmePath);
              meta.title = readmeMeta.title || dirent.name;
              meta.category = readmeMeta.category || 'Web App';
              meta.tags = readmeMeta.tags || [];
            }

            activeProjects.push(meta);
          }
        });
      }

      // 3. Collect Templates
      const availableTemplates = [];
      if (fs.existsSync(TEMPLATES_DIR)) {
        const tDirs = fs.readdirSync(TEMPLATES_DIR, { withFileTypes: true });
        tDirs.forEach(td => {
          if (td.isDirectory()) {
            availableTemplates.push(td.name);
          }
        });
      }

      setHeaders(res);
      res.end(JSON.stringify({
        success: true,
        backlog: backlogItems,
        projects: activeProjects,
        templates: availableTemplates
      }));
    } catch (err) {
      setHeaders(res, 500);
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // API: GET /api/content?type=backlog|project&name=filename.md
  if (url.startsWith('/api/content') && method === 'GET') {
    try {
      const urlParams = new URL(req.url, `http://localhost:${PORT}`);
      const type = urlParams.searchParams.get('type'); // 'backlog' or 'project'
      const name = urlParams.searchParams.get('name'); // filename

      if (!type || !name) {
        setHeaders(res, 400);
        res.end(JSON.stringify({ success: false, error: 'Missing parameters type and name' }));
        return;
      }

      let filePath = '';
      if (type === 'backlog') {
        filePath = path.join(BACKLOG_DIR, name);
      } else if (type === 'project') {
        filePath = path.join(PROJECTS_DIR, name, 'README.md');
      }

      if (!fs.existsSync(filePath)) {
        setHeaders(res, 404);
        res.end(JSON.stringify({ success: false, error: `File not found: ${name}` }));
        return;
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      setHeaders(res);
      res.end(JSON.stringify({ success: true, content }));
    } catch (err) {
      setHeaders(res, 500);
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // API: POST /api/backlog - Create a new backlog item
  if (url === '/api/backlog' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const { title, status, category, tags, pitch } = body;

      if (!title) {
        setHeaders(res, 400);
        res.end(JSON.stringify({ success: false, error: 'Title is required' }));
        return;
      }

      const filename = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '.md';
      const filePath = path.join(BACKLOG_DIR, filename);

      if (fs.existsSync(filePath)) {
        setHeaders(res, 400);
        res.end(JSON.stringify({ success: false, error: `Idea with title '${title}' already exists` }));
        return;
      }

      // Format standard Markdown content with YAML Frontmatter
      const markdownContent = `---
title: "${title}"
status: "${status || 'Idea'}"
category: "${category || 'Web App'}"
tags: ${JSON.stringify(tags || [])}
created: "${new Date().toISOString().split('T')[0]}"
---

# 💡 ${title}

> [!NOTE]
> ${pitch || 'No description provided yet.'}

---

## 🎯 Objectives & Description
*Flesh out the main objectives of this application.*

---

## ✨ Features Checklist
- [ ] Core feature 1
- [ ] Core feature 2
`;

      fs.writeFileSync(filePath, markdownContent, 'utf-8');
      setHeaders(res, 201);
      res.end(JSON.stringify({ success: true, filename, title }));
    } catch (err) {
      setHeaders(res, 500);
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // API: POST /api/projects/create - Copy template to projects/folder
  if (url === '/api/projects/create' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const { name, template } = body;

      if (!name || !template) {
        setHeaders(res, 400);
        res.end(JSON.stringify({ success: false, error: 'Parameters name and template are required' }));
        return;
      }

      const cleanFolderName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const projectPath = path.join(PROJECTS_DIR, cleanFolderName);
      const templatePath = path.join(TEMPLATES_DIR, template);

      if (fs.existsSync(projectPath)) {
        setHeaders(res, 400);
        res.end(JSON.stringify({ success: false, error: `Project folder '${cleanFolderName}' already exists` }));
        return;
      }

      if (!fs.existsSync(templatePath)) {
        setHeaders(res, 400);
        res.end(JSON.stringify({ success: false, error: `Template '${template}' does not exist` }));
        return;
      }

      // Copy template recursively (uses native Node fs.cpSync which is extremely robust)
      fs.cpSync(templatePath, projectPath, { recursive: true });

      // Create a specific custom project README inside the new folder
      const readmePath = path.join(projectPath, 'README.md');
      const standardReadme = `---
title: "${name}"
status: "In Progress"
category: "Web App"
tags: []
created: "${new Date().toISOString().split('T')[0]}"
---

# 🚀 ${name}

This project was bootstrapped from the \`${template}\` template in the Sandbox Mono-Repo.

## 🛠️ Getting Started
Flesh out specific run steps, installation details, or build instructions here!
`;
      
      // Only write README if it doesn't exist
      if (!fs.existsSync(readmePath)) {
        fs.writeFileSync(readmePath, standardReadme, 'utf-8');
      }

      // If there was a matching backlog idea file, we can optionally move it to completed/in-progress or delete, 
      // but keeping it simple: just create the project folder!

      setHeaders(res, 201);
      res.end(JSON.stringify({ success: true, folderName: cleanFolderName }));
    } catch (err) {
      setHeaders(res, 500);
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // --- STATIC FILE SERVING ---
  serveStaticFile(req, res);
});

// Start listening
server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`📡 Mono-Repo Dashboard server active on port ${PORT}`);
  console.log(`👉 Open: http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
