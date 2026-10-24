import './build.mjs';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, relative, extname, sep } from 'node:path';
import { DIST } from './build.mjs';
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.ico': 'image/x-icon' };
const port = Number(process.env.PORT || 4173);
createServer(async (request, response) => {
  try {
    let pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    // Also exercise GitHub project Pages' subdirectory locally.
    if (pathname.startsWith('/lottoworld/')) pathname = pathname.slice('/lottoworld'.length);
    if (pathname.endsWith('/')) pathname += 'index.html';
    const path = resolve(DIST, '.' + pathname);
    const rel = relative(DIST, path);
    if (rel.startsWith('..' + sep) || rel === '..' || rel.split(sep).some(part => part.startsWith('.'))) throw new Error('Forbidden');
    const body = await readFile(path);
    response.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
    response.end(body);
  } catch { response.writeHead(404, { 'Content-Type': 'text/plain' }); response.end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`미리보기: http://127.0.0.1:${port}/lottoworld/`));
