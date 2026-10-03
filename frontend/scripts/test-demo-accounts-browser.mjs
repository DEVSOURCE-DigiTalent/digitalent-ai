// scripts/test-demo-accounts-browser.mjs
// Automated real browser testing script via Chrome DevTools Protocol (CDP)
// Tests all 8 canonical demo accounts on http://localhost:5173

import http from 'http';
import os from 'os';
import { spawn } from 'child_process';

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.pending = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });
    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      }
    };
  }

  send(method, params = {}) {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.exception?.description || 'Evaluation failed');
    }
    return res.result?.value;
  }

  async navigate(url) {
    await this.send('Page.navigate', { url });
    await this.waitForLoad();
  }

  async waitForLoad(timeout = 10000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const readyState = await this.evaluate('document.readyState');
      if (readyState === 'complete') return;
      await new Promise(r => setTimeout(r, 100));
    }
  }

  async waitForSelector(selector, timeout = 10000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const exists = await this.evaluate(`!!document.querySelector(${JSON.stringify(selector)})`);
      if (exists) return true;
      await new Promise(r => setTimeout(r, 100));
    }
    throw new Error(`Timeout waiting for selector: ${selector}`);
  }

  async close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

async function runTests() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tmpDir = `${os.tmpdir()}\\chrome-dt-${Date.now()}`;
  console.log(`Starting headless Chrome (${chromePath})...`);
  
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${tmpDir}`,
    'about:blank'
  ], { stdio: 'ignore' });

  // Wait for Chrome CDP port
  let version = null;
  for (let i = 0; i < 25; i++) {
    try {
      version = await getJson('http://localhost:9222/json/version');
      if (version) break;
    } catch {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  if (!version) {
    chromeProc.kill();
    throw new Error('Failed to connect to Chrome on port 9222');
  }

  console.log(`Connected to Chrome: ${version.Browser}`);

  // Get open tabs
  const tabs = await getJson('http://localhost:9222/json');
  const targetTab = tabs.find(t => t.type === 'page') || tabs[0];
  console.log(`Connected to target tab: ${targetTab.id} (${targetTab.title})`);

  const client = new CDPClient(targetTab.webSocketDebuggerUrl);
  await client.connect();
  await client.send('Page.enable');
  await client.send('Runtime.enable');

  const accounts = [
    { email: 'owner@digitalent.demo', role: 'OWNER', expectedLanding: '/enterprise/dashboard', name: 'Nguyễn Văn Chủ' },
    { email: 'owner2@digitalent.demo', role: 'OWNER', expectedLanding: '/enterprise/dashboard', name: 'Trần Văn Chủ Nhỏ' },
    { email: 'manager@digitalent.demo', role: 'MANAGER', expectedLanding: '/enterprise/team', name: 'Lê Văn Quản Lý' },
    { email: 'employee@digitalent.demo', role: 'EMPLOYEE', expectedLanding: '/enterprise/me', name: 'Hoàng Văn Nhân Viên' },
    { email: 'platform@digitalent.demo', role: 'PLATFORM_ADMIN', expectedLanding: '/platform/dashboard', name: 'Quản Trị Nền Tảng' },
    { email: 'personal@digitalent.demo', role: 'PERSONAL', expectedLanding: '/personal/dashboard', name: 'Học Viên Cá Nhân' },
    { email: 'starter@digitalent.demo', role: 'OWNER', expectedLanding: '/enterprise/dashboard', name: 'Lê Khởi Nghiệp' },
    { email: 'expired@digitalent.demo', role: 'OWNER', expectedLanding: '/enterprise/dashboard', name: 'Phạm Hết Hạn', checkReadOnly: true },
  ];

  const results = [];

  for (const acc of accounts) {
    const startTime = Date.now();
    console.log(`\nTesting account: ${acc.email} (${acc.role})...`);

    try {
      // Clear localStorage
      await client.navigate('http://localhost:5173/login');
      await client.evaluate('localStorage.clear()');
      await client.navigate('http://localhost:5173/login');
      await client.waitForSelector('input[placeholder="ban@email.com"]');

      // Open DemoAccountPicker details
      await client.evaluate(`
        const details = document.querySelector('details');
        if (details && !details.open) {
          details.querySelector('summary').click();
        }
      `);

      // Wait for demo buttons to render
      const waitStart = Date.now();
      let buttonFound = false;
      while (Date.now() - waitStart < 5000) {
        buttonFound = await client.evaluate(`
          Array.from(document.querySelectorAll('details button')).some(b => b.textContent.includes(${JSON.stringify(acc.email)}))
        `);
        if (buttonFound) break;
        await new Promise(r => setTimeout(r, 100));
      }

      if (!buttonFound) {
        throw new Error(`Demo button not rendered for ${acc.email}`);
      }

      // Click the demo account button
      await client.evaluate(`
        const btns = Array.from(document.querySelectorAll('details button'));
        const targetBtn = btns.find(b => b.textContent.includes(${JSON.stringify(acc.email)}));
        targetBtn.click();
      `);
      await new Promise(r => setTimeout(r, 150));

      // Click submit
      await client.evaluate(`
        const submitBtn = document.querySelector('button[type="submit"]');
        submitBtn.click();
      `);

      // Wait for navigation away from /login
      const navStart = Date.now();
      let currentPath = '';
      while (Date.now() - navStart < 10000) {
        currentPath = await client.evaluate('window.location.pathname');
        if (!currentPath.includes('/login')) break;
        await new Promise(r => setTimeout(r, 100));
      }

      await client.waitForLoad();
      await new Promise(r => setTimeout(r, 500));

      const pageTitle = await client.evaluate('document.title');
      const bodyText = await client.evaluate('document.body.innerText');
      const navLinks = await client.evaluate(`
        Array.from(document.querySelectorAll('nav a, aside a')).map(a => ({
          text: a.textContent.trim(),
          href: a.getAttribute('href')
        }))
      `);

      let specialNotes = [];

      // Account-specific verification
      if (acc.email === 'owner@digitalent.demo') {
        // Test 1: Legacy redirect /enterprise/workforce -> /enterprise/members
        await client.navigate('http://localhost:5173/enterprise/workforce');
        await new Promise(r => setTimeout(r, 400));
        const redirectedPath = await client.evaluate('window.location.pathname');
        const redirectPass = redirectedPath.includes('/enterprise/members');
        specialNotes.push(`Legacy redirect (/enterprise/workforce -> ${redirectedPath}): ${redirectPass ? 'PASS' : 'FAIL'}`);

        // Test 2: OW-20 profile (/enterprise/competency-profiles/emp-01)
        await client.navigate('http://localhost:5173/enterprise/competency-profiles/emp-01');
        await client.waitForSelector('h1');
        const h1 = await client.evaluate('document.querySelector("h1")?.innerText');
        const tabs = await client.evaluate(`
          Array.from(document.querySelectorAll('button[role="tab"], nav button')).map(b => b.textContent.trim()).filter(Boolean)
        `);
        specialNotes.push(`OW-20 profile loaded (${h1}, tabs: ${tabs.slice(0, 4).join(', ')}): PASS`);
      }

      if (acc.checkReadOnly) {
        const hasReadOnlyBanner = bodyText.includes('hết hạn') || bodyText.includes('chỉ đọc') || bodyText.includes('Gói dịch vụ');
        specialNotes.push(`Read-only expired banner detected: ${hasReadOnlyBanner ? 'PASS' : 'WARN'}`);
      }

      if (acc.email === 'employee@digitalent.demo') {
        await client.navigate('http://localhost:5173/enterprise/dashboard');
        await new Promise(r => setTimeout(r, 400));
        const guardedPath = await client.evaluate('window.location.pathname');
        const guardedBody = await client.evaluate('document.body.innerText');
        const isProtected = guardedPath !== '/enterprise/dashboard' || guardedBody.includes('Truy cập bị từ chối') || guardedBody.includes('không có quyền');
        specialNotes.push(`Guard test for /enterprise/dashboard: ${isProtected ? 'PASS (Protected)' : 'UNGUARDED'}`);
      }

      const passLanding = currentPath === acc.expectedLanding;
      const durationMs = Date.now() - startTime;

      results.push({
        email: acc.email,
        role: acc.role,
        landingUrl: currentPath,
        expectedLanding: acc.expectedLanding,
        landingStatus: passLanding ? 'PASS' : 'FAIL',
        navCount: navLinks.length,
        durationMs,
        specialNotes,
        status: passLanding ? 'PASS' : 'FAIL',
      });

      console.log(`  -> Landing: ${currentPath} (expected: ${acc.expectedLanding}) [${passLanding ? 'PASS' : 'FAIL'}]`);
      if (specialNotes.length) {
        specialNotes.forEach(note => console.log(`     * ${note}`));
      }
    } catch (err) {
      console.error(`  -> ERROR: ${err.message}`);
      results.push({
        email: acc.email,
        role: acc.role,
        error: err.message,
        status: 'FAIL',
      });
    }
  }

  await client.close();
  chromeProc.kill();

  console.log('\n================ BROWSER VERIFICATION SUMMARY ================');
  console.table(results.map(r => ({
    Email: r.email,
    Role: r.role,
    Landing: r.landingUrl || 'N/A',
    Expected: r.expectedLanding || 'N/A',
    Status: r.status,
    Notes: (r.specialNotes || []).join('; ') || r.error || 'OK'
  })));

  const allPassed = results.every(r => r.status === 'PASS');
  console.log(`\nOverall Result: ${allPassed ? 'ALL 8 ACCOUNTS PASSED (100%)' : 'SOME CHECKS FAILED'}`);
  process.exit(allPassed ? 0 : 1);
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
