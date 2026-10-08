// Renders command logs as terminal-style pages, boxes the key lines in red and captures them (AUTO evidence).
// Usage: node auto.mjs <evidence>/images <evidence>/scripts/auto-specs.json — spec.log is relative to <evidence>.
import { readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { launchChrome } from './cdp.mjs';

const [, , OUT, specFile] = process.argv;
const ROOT = join(OUT, '..');
const specs = JSON.parse(readFileSync(specFile, 'utf-8'));
const strip = (s) => s.replace(/\x1b\[[0-9;]*m/g, '');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const { proc, page } = await launchChrome({
  chromePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  profileDir: join(tmpdir(), 'digitalent-evidence-chrome-auto'),
  width: 1280, height: 900,
});

const results = [];
for (const spec of specs) {
  const at = new Date();
  const lines = strip(readFileSync(join(ROOT, spec.log), 'utf-8')).split(/\r?\n/).filter((l, i, a) => l.trim() || (i > 0 && a[i - 1].trim()));
  const highlight = spec.highlight.map((h) => new RegExp(h));
  const body = lines.map((l) => {
    const hit = highlight.some((re) => re.test(l));
    return `<div class="l${hit ? ' hit' : ''}">${esc(l) || '&nbsp;'}</div>`;
  }).join('');
  const html = `<!doctype html><meta charset="utf-8"><style>
    body{margin:0;padding:24px;background:#fff;font-family:Segoe UI,Arial;color:#111}
    h1{font-size:22px;margin:0 0 4px} .sub{color:#555;font-size:13px} .meta{float:right;text-align:right;color:#666;font-size:12px;line-height:1.5}
    hr{border:0;border-top:2px solid #111;margin:14px 0}
    .term{background:#0d1117;color:#e6edf3;border-radius:6px;padding:14px 16px;font:12.5px/1.55 Consolas,monospace;white-space:pre-wrap}
    .l{padding:1px 4px} .hit{outline:3px solid #e00000;outline-offset:-1px;background:rgba(224,0,0,.18);margin:3px 0}
    .verdict{display:inline-block;margin-top:16px;padding:8px 16px;border:3px solid #e00000;border-radius:8px;background:#e6f4ea;color:#137333;font-weight:700;font-size:18px}
  </style>
  <div class="meta">Thực hiện: ${at.toLocaleString('vi-VN')}<br>${esc(spec.env)}</div>
  <h1>${esc(spec.id)} · ${esc(spec.heading)}</h1><div class="sub">${esc(spec.sub)}</div><hr>
  <div class="term">${body}</div>
  <div class="verdict">KẾT QUẢ: ${spec.verdict}</div>`;
  const htmlPath = join(tmpdir(), `digitalent-evidence-${spec.id}.html`);
  writeFileSync(htmlPath, html, 'utf-8');
  // small viewport first so scrollHeight reflects the content, not the previous capture
  await page.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 400, deviceScaleFactor: 1, mobile: false });
  await page.goto('file:///' + htmlPath.replace(/\\/g, '/'));
  const height = await page.eval('Math.ceil(document.documentElement.scrollHeight)');
  await page.send('Emulation.setDeviceMetricsOverride', { width: 1280, height, deviceScaleFactor: 1, mobile: false });
  const { data } = await page.send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(OUT, `${spec.id}.png`), Buffer.from(data, 'base64'));
  results.push({ ...spec.case, id: spec.id, at: at.toISOString(), api: [] });
  console.log('captured', spec.id, height);
}
writeFileSync(join(ROOT, 'auto.json'), JSON.stringify(results, null, 2));
proc.kill();
