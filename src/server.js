/**
 * server.js
 * Servidor estático mínimo (sin dependencias) con fallback SPA:
 * cualquier ruta que no sea un archivo real devuelve index.html,
 * para que /chat o /about funcionen también al recargar la página.
 *
 * Uso:
 *   node server.js
 *   abrir http://localhost:5173
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = process.env.PORT || 5173;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  let filePath = path.join(ROOT, urlPath);

  fs.stat(filePath, (err, stats) => {
    const isRealFile = !err && stats.isFile();
    const target = isRealFile ? filePath : path.join(ROOT, 'index.html');
    const ext = path.extname(target);

    fs.readFile(target, (readErr, data) => {
      if (readErr) {
        res.writeHead(500);
        res.end('Error interno del servidor');
        return;
      }
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      res.end(data);
    });
  });
});

server.listen(PORT, () => {
  console.log(`CharChat corriendo en http://localhost:${PORT}`);
});