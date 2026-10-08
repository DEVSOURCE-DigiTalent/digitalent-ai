// Minimal Chrome DevTools Protocol driver (Node 24: global WebSocket + fetch). Evidence tooling only.
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function launchChrome({ chromePath, port = 9333, profileDir, width = 1440, height = 900, extraArgs = [] }) {
  mkdirSync(profileDir, { recursive: true });
  const proc = spawn(chromePath, [
    '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profileDir}`,
    `--window-size=${width},${height}`, '--no-first-run', '--no-default-browser-check',
    '--disable-extensions', '--hide-scrollbars', '--lang=vi-VN', ...extraArgs, 'about:blank',
  ], { stdio: 'ignore' });
  for (let i = 0; i < 300; i++) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      const page = targets.find((t) => t.type === 'page');
      if (page) return { proc, page: await Page.connect(page.webSocketDebuggerUrl, width, height) };
    } catch { /* not up yet */ }
    await sleep(200);
  }
  throw new Error('Chrome did not start');
}

export class Page {
  static async connect(wsUrl, width, height) {
    const ws = new WebSocket(wsUrl);
    await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
    const page = new Page(ws);
    // "Leave site?" (beforeunload) dialogs would block navigation in headless mode: accept them
    page.listeners.push({ method: 'Page.javascriptDialogOpening', fn: () => page.send('Page.handleJavaScriptDialog', { accept: true }) });
    await page.send('Page.enable');
    await page.send('Runtime.enable');
    await page.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
    return page;
  }

  constructor(ws) {
    this.ws = ws; this.id = 0; this.pending = new Map(); this.listeners = [];
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(`${msg.error.message} ${msg.error.data ?? ''}`)) : resolve(msg.result);
      } else if (msg.method) {
        this.listeners.filter((l) => l.method === msg.method).forEach((l) => l.fn(msg.params));
      }
    };
  }

  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }

  once(method) {
    return new Promise((resolve) => {
      const l = { method, fn: (p) => { this.listeners = this.listeners.filter((x) => x !== l); resolve(p); } };
      this.listeners.push(l);
    });
  }

  async goto(url) {
    const loaded = this.once('Page.loadEventFired');
    await this.send('Page.navigate', { url });
    await loaded;
    await sleep(400);
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', { expression: `(async () => { ${HELPERS}; return (${expression}); })()`, awaitPromise: true, returnByValue: true });
    if (res.exceptionDetails) throw new Error(`eval failed: ${expression}\n${res.exceptionDetails.exception?.description ?? res.exceptionDetails.text}`);
    return res.result.value;
  }

  /** Polls a page expression until it is truthy. */
  async waitFor(expression, { timeout = 30000, label = expression } = {}) {
    const end = Date.now() + timeout;
    while (Date.now() < end) {
      try {
        // DOM nodes cannot be returned by value: report them as true
        const v = await this.eval(`((v) => (v instanceof Node ? true : v))(${expression})`);
        if (v) return v;
      } catch { /* page navigating */ }
      await sleep(250);
    }
    throw new Error(`Timed out waiting for: ${label}`);
  }

  /** Scrolls the element into view and returns its viewport rectangle. `el` is a page expression giving an Element. */
  async rect(el, { scroll = true } = {}) {
    return this.eval(`(() => { const e = ${el}; if (!e) return null; ${scroll ? "e.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });" : ''} const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; })()`);
  }

  async click(el) {
    // scroll instantly (pages use smooth scrolling), then wait until the element is the topmost one at its centre
    // (toasts or overlays may cover it for a moment)
    await this.waitFor(`(() => { const e = ${el}; if (!e) return null; e.scrollIntoView({ block: 'center', behavior: 'instant' }); return true; })()`, { label: `click ${el}` });
    await sleep(120);
    const r = await this.waitFor(`(() => { const e = ${el}; if (!e) return null; const r = e.getBoundingClientRect(); if (!r.width) return null; const x = r.x + r.width / 2, y = r.y + r.height / 2; const top = document.elementFromPoint(x, y); return top && (e === top || e.contains(top) || top.contains(e)) ? { x, y } : null; })()`, { label: `click ${el}` });
    for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) {
      await this.send('Input.dispatchMouseEvent', { type, x: r.x, y: r.y, button: 'left', clickCount: 1 });
    }
    await sleep(300);
  }

  /** Focuses a text field, clears it and types the text like a user. */
  async type(el, text) {
    await this.click(el);
    await this.eval(`(() => { const e = ${el}; e.focus(); e.select && e.select(); return true; })()`);
    await this.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
    await this.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
    if (text) await this.send('Input.insertText', { text });
    await sleep(150);
  }

  /** Picks a <select> option by value (React listens to the native change event). */
  async select(el, value) {
    await this.waitFor(`${el}`, { label: `select ${el}` });
    await this.eval(`(() => { const e = ${el}; const set = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set; set.call(e, ${JSON.stringify(value)}); e.dispatchEvent(new Event('change', { bubbles: true })); return e.value; })()`);
    await sleep(300);
  }

  /** Picks a <select> option by its visible text. */
  async selectText(el, text) {
    const value = await this.waitFor(`(() => { const e = ${el}; const o = e && [...e.options].find((x) => norm(x.textContent).includes(${JSON.stringify(text)})); return o ? o.value || '__empty__' : null; })()`, { label: `option ${text}` });
    await this.select(el, value === '__empty__' ? '' : value);
  }

  /** Records every /api/ call (method, path, status) so each test case can list the backend calls it made. */
  async recordApi() {
    await this.send('Network.enable');
    this.api = []; const methods = new Map();
    this.listeners.push({ method: 'Network.requestWillBeSent', fn: (p) => methods.set(p.requestId, p.request.method) });
    this.listeners.push({ method: 'Network.responseReceived', fn: (p) => {
      const url = new URL(p.response.url);
      if (url.pathname.startsWith('/api/')) this.api.push({ method: methods.get(p.requestId) ?? 'GET', path: url.pathname + url.search, status: p.response.status });
    } });
  }

  takeApi() { const calls = this.api ?? []; this.api = []; return calls; }

  /** Draws numbered red boxes over elements (fixed overlay), captures the viewport, then removes the overlay. */
  async shot(path, boxes = []) {
    const rects = [];
    for (const b of boxes) {
      const r = await this.rect(b.el, { scroll: b.scroll ?? rects.length === 0 });
      if (!r) throw new Error(`Evidence box not found: ${b.el}`);
      rects.push({ ...r, label: b.label ?? '' });
    }
    // re-read rectangles after the last scroll so every box matches the final viewport
    for (let i = 0; i < boxes.length; i++) Object.assign(rects[i], await this.rect(boxes[i].el, { scroll: false }));
    await this.eval(`(() => { const rs = ${JSON.stringify(rects)}; const host = document.createElement('div'); host.id = '__evidence'; host.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483647';
      rs.forEach((r, i) => { const pad = 4; const b = document.createElement('div'); b.style.cssText = 'position:fixed;border:3px solid #e00000;border-radius:6px;box-sizing:border-box;left:' + (r.x - pad) + 'px;top:' + (r.y - pad) + 'px;width:' + (r.w + 2 * pad) + 'px;height:' + (r.h + 2 * pad) + 'px';
        const t = document.createElement('div'); t.textContent = String(i + 1) + (r.label ? ' · ' + r.label : ''); t.style.cssText = 'position:fixed;background:#e00000;color:#fff;font:600 12px/1.4 Segoe UI,Arial;padding:1px 6px;border-radius:4px;white-space:nowrap;left:' + (r.x - pad) + 'px;top:' + Math.max(0, r.y - pad - 20) + 'px';
        host.append(b, t); }); document.body.append(host); return true; })()`);
    await sleep(150);
    const { data } = await this.send('Page.captureScreenshot', { format: 'png' });
    await this.eval(`(() => { document.getElementById('__evidence')?.remove(); return true; })()`);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, Buffer.from(data, 'base64'));
    return rects;
  }
}

/** Page-side helpers available inside every eval. */
const HELPERS = `
  const norm = (s) => (s ?? '').replace(/\\s+/g, ' ').trim();
  const visible = (e) => !!e && e.getClientRects().length > 0;
  const byText = (sel, text, exact = false) => [...document.querySelectorAll(sel)].filter(visible).find((e) => exact ? norm(e.textContent) === text : norm(e.textContent).includes(text));
  const byLabel = (text, scope = document) => { const l = [...scope.querySelectorAll('label')].filter(visible).find((x) => norm(x.textContent).startsWith(text)); if (l) return (l.htmlFor && document.getElementById(l.htmlFor)) || l.querySelector('input,select,textarea') || l.parentElement.querySelector('input,select,textarea'); return scope.querySelector('[aria-label="' + text + '"]'); };
  const dd = (term) => { const t = [...document.querySelectorAll('dt')].filter(visible).find((x) => norm(x.textContent) === term); return t && t.nextElementSibling; };
  const button = (text) => byText('button,a', text, true) || byText('button,a', text);
  const row = (text) => byText('tr', text);
  const dialog = () => [...document.querySelectorAll('[role=dialog]')].filter(visible).pop();
  const toast = (text) => byText('[data-sonner-toast]', text);
  const leaf = (text, sel = '*') => [...document.querySelectorAll(sel)].filter(visible).find((e) => norm(e.textContent).includes(text) && ![...e.children].some((c) => norm(c.textContent).includes(text)));
  const up = (e, n = 1) => { let x = e; for (let i = 0; i < n && x; i++) x = x.parentElement; return x; };
  const heading = (text) => byText('h1', text);
  const tab = (text) => [...document.querySelectorAll('[role=tab]')].filter(visible).find((t) => norm(t.textContent).startsWith(text));
`;

export { sleep };
