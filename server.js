const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// Version from package.json + optional build id (set in CI)
let appVersion = '1.0.0';
let buildId = process.env.BUILD_ID || process.env.GITHUB_SHA || 'local';

try {
  const pkg = require('./package.json');
  appVersion = pkg.version;
} catch (_) {}

const info = {
  version: appVersion,
  buildId: buildId.substring(0, 7),
  env: process.env.NODE_ENV || 'development',
  time: new Date().toISOString(),
};

const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://localhost:${PORT}`);

  if (url.pathname === '/version' || url.pathname === '/api/version') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(info, null, 2));
  }

  if (url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok', ...info }));
  }

  if (url.pathname === '/' || url.pathname === '/index.html') {
    const file = path.join(__dirname, 'public', 'index.html');
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(500);
        return res.end('Error loading page');
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data.toString().replace('{{VERSION}}', appVersion).replace('{{BUILD_ID}}', info.buildId));
    });
    return;
  }

  const ext = path.extname(url.pathname);
  if (mime[ext]) {
    const file = path.join(__dirname, 'public', url.pathname);
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404);
        return res.end('Not found');
      }
      res.writeHead(200, { 'Content-Type': mime[ext] });
      res.end(data);
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`CICD Practice App running at http://localhost:${PORT}`);
  console.log(`Version: ${info.version} (${info.buildId})`);
});
