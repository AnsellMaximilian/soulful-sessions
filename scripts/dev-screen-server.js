const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3000;
const HOST = 'localhost';

// MIME types for different file extensions
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

function serveFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 - File Not Found');
      console.error(`File not found: ${filePath}`);
      return;
    }

    const mimeType = getMimeType(filePath);
    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(data);
  });
}

function startServer() {
  const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

    let filePath;
    
    if (req.url === '/' || req.url === '/index.html') {
      filePath = path.join(__dirname, '..', 'dev-screen.html');
    } else if (req.url.startsWith('/dist/')) {
      filePath = path.join(__dirname, '..', req.url);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 - Not Found');
      return;
    }

    serveFile(res, filePath);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Error: Port ${PORT} is already in use.`);
      console.error('Please stop other servers or specify a different port.\n');
      process.exit(1);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });

  server.listen(PORT, HOST, () => {
    const url = `http://${HOST}:${PORT}`;
    console.log(`\n✅ Dev Screen server running at ${url}`);
    console.log('Press Ctrl+C to stop the server\n');

    // Open browser automatically (cross-platform)
    const openCommand = process.platform === 'win32' ? 'start' :
                       process.platform === 'darwin' ? 'open' : 'xdg-open';
    
    exec(`${openCommand} ${url}`, (err) => {
      if (err) {
        console.log(`Could not open browser automatically. Please navigate to ${url}`);
      }
    });
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down server...');
    server.close(() => {
      console.log('Server stopped');
      process.exit(0);
    });
  });
}

// Build the dev-screen before starting server
console.log('🔨 Building Dev Screen...\n');
exec('node build.js --dev-screen', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Build failed:', error.message);
    if (stderr) console.error(stderr);
    process.exit(1);
  }

  if (stdout) console.log(stdout);
  if (stderr) console.error(stderr);

  console.log('✅ Build complete\n');
  startServer();
});
