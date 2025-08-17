// tests/devserver.cjs
// Minimal static file server for CI so Playwright can load the game over HTTP.
// Serves from repo root; sets simple content-types; supports /index.html.

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = 4173;
const ROOT = process.cwd();

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.cjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, Object.assign({ 'Cache-Control': 'no-cache' }, headers));
  res.end(body);
}

function resolvePath(urlPath) {
  let p = decodeURIComponent(urlPath.split('?')[0]);
  if (p === '/' || p === '') p = '/index.html';
  const full = path.join(ROOT, p.replace(/^\//, ''));
  return full;
}

const server = http.createServer((req, res) => {
  try {
    const full = resolvePath(req.url);
    if (!full.startsWith(ROOT)) {
      return send(res, 403, 'Forbidden');
    }
    fs.stat(full, (err, stat) => {
      if (err || !stat.isFile()) {
        return send(res, 404, 'Not Found');
      }
      const ext = path.extname(full).toLowerCase();
      const type = TYPES[ext] || 'application/octet-stream';
      fs.readFile(full, (e, data) => {
        if (e) return send(res, 500, 'Server Error');
        send(res, 200, data, { 'Content-Type': type });
      });
    });
  } catch (e) {
    send(res, 500, 'Server Error');
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[devserver] Serving ${ROOT} at http://127.0.0.1:${PORT}`);
});
