import { createReadStream } from 'node:fs';
import { access, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const argumentIndex = process.argv.indexOf('--root');
const requestedRoot = argumentIndex >= 0 ? process.argv[argumentIndex + 1] : '.';
const siteRoot = resolve(process.cwd(), requestedRoot ?? '.');
const port = Number(process.env.PORT ?? 5173);

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml'
};

const server = createServer(async (request, response) => {
  const pathname = new URL(request.url ?? '/', `http://${request.headers.host}`).pathname;
  const relativePath = pathname === '/' ? 'index.html' : normalize(pathname).replace(/^[/\\]+/, '');
  const candidate = resolve(siteRoot, relativePath);
  const filename = candidate.startsWith(`${siteRoot}/`) || candidate === siteRoot
    ? candidate
    : join(siteRoot, 'index.html');

  try {
    const info = await stat(filename);
    const page = info.isDirectory() ? join(filename, 'index.html') : filename;
    if (!(await stat(page)).isFile()) throw new Error('Not a file');
    response.writeHead(200, { 'Content-Type': mimeTypes[extname(page)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
    createReadStream(page).pipe(response);
  } catch {
    try {
      await access(join(siteRoot, 'index.html'));
      response.writeHead(200, { 'Content-Type': mimeTypes['.html'], 'Cache-Control': 'no-store' });
      createReadStream(join(siteRoot, 'index.html')).pipe(response);
    } catch {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
    }
  }
});

server.listen(port, () => {
  console.log(`Quest app is running at http://localhost:${port}`);
  console.log('Press Ctrl+C to stop the server.');
});
