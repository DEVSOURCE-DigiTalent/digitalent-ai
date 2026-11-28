// Local server for convert.html: the page and three.js from the repository, the FBX and PNG textures from the work
// folder given as the first argument, POST /save?name=x.vrm writes the result into <work folder>/out.
// Usage: node scripts/avatar-converter/server.mjs <work folder>   (then open http://localhost:5199/convert.html?…)
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const three = resolve(here, '../../frontend/node_modules/three');
const work = resolve(process.argv[2] ?? '.');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.fbx': 'application/octet-stream' };

// Only paths inside the folder: "..", absolute paths and drive letters are refused.
const inside = (root, path) => {
  const full = resolve(root, `.${normalize(`/${path}`)}`);
  if (!full.startsWith(root)) throw new Error('outside');
  return full;
};

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (req.method === 'POST' && url.pathname === '/save') {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      await mkdir(join(work, 'out'), { recursive: true });
      const name = (url.searchParams.get('name') ?? 'avatar.vrm').replace(/[^\w.-]/g, '');
      await writeFile(join(work, 'out', name), Buffer.concat(chunks));
      res.end('ok');
      return;
    }
    const path = decodeURIComponent(url.pathname);
    const file = path === '/convert.html' ? join(here, 'convert.html')
      : path.startsWith('/three/') ? inside(three, path.slice('/three/'.length))
      : inside(work, path);
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
}).listen(5199, '127.0.0.1', () => console.log(`avatar converter: http://localhost:5199/convert.html (files from ${work})`));
