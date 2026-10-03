import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Fails when a production build still contains the mock layer (demo accounts, their password, the mock
 * database). Run after \`npm run build\` with VITE_USE_MOCK unset or false.
 */
const DIST = new URL('../dist', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const MARKERS = ['mock-token', 'Admin@1234', 'digitalent.demo', 'dt-mock-db', '686868'];

function* files(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* files(path);
    else if (/\.(js|css|html)$/.test(name)) yield path;
  }
}

const hits = [];
for (const file of files(DIST)) {
  const text = readFileSync(file, 'utf8');
  for (const marker of MARKERS) if (text.includes(marker)) hits.push(`${file}: ${marker}`);
}

if (hits.length > 0) {
  console.error('The production build contains mock code:\n' + hits.join('\n'));
  process.exit(1);
}
console.log('OK: no mock code in the production build.');
