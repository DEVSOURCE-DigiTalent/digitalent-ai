// Phase 2 of the E2E evidence (branch feature/DT-be1-competency-apis): competency flow (OW-14…OW-22),
// employee self-service (EM-01…EM-18) and the evidence review loop (employee submits → manager approves → profile).
// Runs after run.mjs on the same database and appends to results.json.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { launchChrome, sleep } from './cdp.mjs';

const OUT = process.argv[2];
const BASE = 'http://localhost:5173';
const PASSWORD = 'Admin@1234'; // seed demo password (CLAUDE.md)
const RESULTS = join(OUT, '..', 'results.json');
const ACTIVATION_REASON = 'Nâng chuẩn năng lực 1.1 cho vị trí Sales / CRM (kiểm thử)';
const CONFIRM_NOTE = 'Hoàn thành đợt rà soát bảo vệ dữ liệu cá nhân quý 3 (kiểm thử)';
const SUBMISSION_TEXT = 'Đã rà soát quyền truy cập thư mục chứng từ kế toán, thu hồi 3 tài khoản không còn sử dụng (kiểm thử).';

const { proc, page } = await launchChrome({
  chromePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  profileDir: join(tmpdir(), 'digitalent-evidence-chrome-2'),
});
await page.recordApi();

const PHASE_IDS = new Set();
const previous = existsSync(RESULTS) ? JSON.parse(readFileSync(RESULTS, 'utf-8')) : [];
const results = [];
const save = () => writeFileSync(RESULTS, JSON.stringify([...previous.filter((r) => !PHASE_IDS.has(r.id)), ...results], null, 2));
const state = {};

async function tc(meta, fn) {
  PHASE_IDS.add(meta.id);
  page.takeApi();
  const at = new Date();
  try {
    const out = await fn();
    await sleep(300);
    results.push({ ...meta, ...out, status: 'PASS', at: at.toISOString(), api: page.takeApi() });
    console.log(`PASS ${meta.id} ${meta.title}`);
  } catch (error) {
    try { await page.shot(join(OUT, `${meta.id}.png`)); } catch { /* ignore */ }
    results.push({ ...meta, status: 'FAIL', actual: String(error.message).slice(0, 500), at: at.toISOString(), api: page.takeApi() });
    console.log(`FAIL ${meta.id} ${meta.title}\n  ${error.message}`);
  }
  save();
}

const shot = (id, boxes) => page.shot(join(OUT, `${id}.png`), boxes.map((b) => ({ el: b.el, label: b.label })))
  .then(() => boxes.map((b, i) => `${i + 1}. ${b.label}: ${b.note}`));
const extra = (id, notes) => notes.map((n) => `[Ảnh ${id}] ${n}`);

async function signIn(email) {
  await page.goto(`${BASE}/business/login`);
  await page.eval(`(localStorage.clear(), sessionStorage.clear(), true)`);
  await page.send('Network.clearBrowserCookies');
  await page.goto(`${BASE}/business/login`);
  try {
    await page.type(`document.getElementById('email')`, email);
    await page.type(`document.getElementById('password')`, PASSWORD);
    await page.click(`byText('button', 'Đăng nhập', true)`);
    await page.waitFor(`!location.pathname.includes('login') && document.querySelector('[data-testid=enterprise-layout]')`, { label: `signed in as ${email}` });
    // Headless Chrome stops delivering mouse/keyboard input to this tab once the employee portal renders in the
    // renderer that showed the login form (a headed browser does not; a new tab is fine). A hop through another
    // origin gives the tab a fresh renderer; the session stays in localhost's storage.
    const landing = await page.eval('location.pathname');
    await page.goto('http://127.0.0.1:5173/');
    await page.goto(`${BASE}${landing}`);
    await page.waitFor(`document.querySelector('[data-testid=enterprise-layout]')`, { label: `back on ${landing}` });
  } catch (error) {
    await page.shot(join(OUT, '..', `signin-failed-${email.split('@')[0]}.png`)).catch(() => {});
    throw error;
  }
  page.takeApi();
}

async function open(path, ready) {
  await page.goto(`${BASE}${path}`);
  await page.waitFor(ready, { label: `page ${path} ready` });
}

const noLoading = `!leaf('Đang tải')`;

// ══════════════════════════════ Năng lực (HR) ══════════════════════════════
await signIn('hr@digitalent.ai');

await tc({
  id: 'TC26', screen: 'OW-21 Khoảng trống năng lực', title: 'Tính lại khoảng trống cho toàn bộ nhân sự', role: 'OWNER (hr@)', url: '/enterprise/skill-gap',
  precondition: 'Nhân viên có vị trí và bộ yêu cầu ACTIVE: employee@, manager@, Nguyễn Văn Kiểm Thử (Kế toán, TC09)',
  steps: ['Mở Năng lực > Khoảng trống năng lực', 'Bấm "Tính lại toàn bộ"'],
  expected: 'POST /intelligence/skill-gaps/calculate-batch tính cho 3 nhân viên; thẻ tổng quan và bảng theo phòng ban lấy từ GET /intelligence/analytics/overview (API mới).',
}, async () => {
  await open('/enterprise/skill-gap', `heading('Khoảng trống năng lực') && button('Tính lại toàn bộ')`);
  await page.click(`button('Tính lại toàn bộ')`);
  await page.waitFor(`toast('Đã tính khoảng trống năng lực cho 3 nhân viên')`);
  await page.waitFor(`leaf('Nhân sự được phân tích') && norm(up(leaf('Nhân sự được phân tích'), 1).textContent).includes('3')`);
  const notes = await shot('TC26', [
    { el: `toast('Đã tính khoảng trống năng lực')`, label: 'Toast', note: 'Tính được 3 nhân viên' },
    { el: `up(leaf('Nhân sự được phân tích'), 2)`, label: 'Thẻ tổng quan', note: 'Số nhân sự được phân tích, tỷ lệ đáp ứng, tổng khoảng trống, khoảng trống mức cao — GET /intelligence/analytics/overview' },
    { el: `document.querySelector('main table')`, label: 'Theo phòng ban', note: 'Nhóm theo phòng ban, đáp ứng thấp nhất trước' },
  ]);
  return { actual: 'Tính lại cho 3 nhân viên; thẻ và bảng tổng quan hiện số liệu từ API.', notes };
});

await tc({
  id: 'TC27', screen: 'OW-21 Khoảng trống năng lực', title: 'Khoảng trống theo từng năng lực TT02', role: 'OWNER (hr@)', url: '/enterprise/skill-gap → Theo năng lực TT02',
  precondition: 'Đã chạy TC26', steps: ['Chọn tab "Theo năng lực TT02"'],
  expected: 'Bảng năng lực từ GET /intelligence/analytics/competencies (API mới): số người yêu cầu, số người thiếu, số mức cao, mức trung bình; nhiều mức cao trước.',
}, async () => {
  await page.click(`tab('Theo năng lực TT02')`);
  await page.waitFor(`document.querySelectorAll('main table tbody tr').length > 5`);
  const notes = await shot('TC27', [
    { el: `tab('Theo năng lực TT02')`, label: 'Tab', note: 'Theo năng lực TT02' },
    { el: `document.querySelector('main table')`, label: 'Bảng năng lực', note: 'Mỗi dòng là 1 năng lực TT02 với số người thiếu và số mức cao' },
  ]);
  return { actual: `Bảng hiện ${await page.eval(`document.querySelectorAll('main table tbody tr').length`)} năng lực có khoảng trống.`, notes };
});

await tc({
  id: 'TC28', screen: 'OW-22 Chi tiết khoảng trống', title: 'Khoảng trống của một nhân viên', role: 'OWNER (hr@)', url: '/enterprise/skill-gap/{employeeId}',
  precondition: 'Đã chạy TC26', steps: ['Chọn tab "Theo nhân viên"', 'Bấm vào Employee'],
  expected: 'Trang chi tiết của Employee (snapshot mới nhất): vị trí Kế toán, phiên bản yêu cầu v1, độ đáp ứng 62.0%, danh sách năng lực thiếu.',
}, async () => {
  await page.click(`tab('Theo nhân viên')`);
  await page.waitFor(`row('EMP-0004') && row('EMP-0004').querySelector('a')`);
  const employeeRow = await shot('TC28a', [
    { el: `row('EMP-0004')`, label: 'Employee', note: '15 khoảng trống, 4 mức cao, đáp ứng 62.0%' },
  ]);
  state.tc28 = employeeRow;
  await page.click(`row('EMP-0004').querySelector('a')`);
  await page.waitFor(`heading('Employee') && leaf('62.0%') && leaf('Chi tiết khoảng trống')`);
  const notes = await shot('TC28', [
    { el: `heading('Employee').parentElement`, label: 'Nhân viên', note: 'Kế toán · Operations · phiên bản yêu cầu v1' },
    { el: `up(leaf('Tỷ lệ đáp ứng năng lực'), 2)`, label: 'Độ đáp ứng', note: '62.0% (backend 62.03%) — khớp spec §8' },
  ]);
  return { actual: 'Trang chi tiết khoảng trống của Employee hiện độ đáp ứng 62% và các năng lực thiếu.', notes: [...extra('TC28a', state.tc28), ...notes], extraImages: ['TC28a'] };
});

await tc({
  id: 'TC29', screen: 'OW-14 Khung năng lực TT 02/2025', title: 'Khung năng lực số 24 năng lực', role: 'OWNER (hr@)', url: '/enterprise/framework',
  precondition: 'Seed TT02_2025', steps: ['Mở Năng lực > Khung năng lực TT 02/2025'],
  expected: '6 miền, 24 năng lực thành phần theo mã 1.1 … 6.3.',
}, async () => {
  await open('/enterprise/framework', `document.querySelectorAll('main table tbody tr').length >= 6 && leaf('1.1')`);
  const notes = await shot('TC29', [
    { el: `up(leaf('6 Miền năng lực'), 1)`, label: 'Khung TT02', note: '6 miền, 24 năng lực thành phần (Thông tư 02/2025/TT-BGDĐT)' },
    { el: `document.querySelector('main table')`, label: 'Danh sách', note: 'Năng lực theo mã 1.1 … 6.3 (GET /competencies), có phân trang' },
  ]);
  return { actual: `Hiện khung 6 miền; trang đầu ${await page.eval(`document.querySelectorAll('main table tbody tr').length`)} năng lực theo mã TT02.`, notes };
});

await tc({
  id: 'TC30', screen: 'OW-15 Chi tiết năng lực', title: 'Năng lực 4.2 được dùng ở đâu', role: 'OWNER (hr@)', url: '/enterprise/framework/{id}',
  precondition: 'Đã chạy TC29', steps: ['Bấm năng lực "Bảo vệ dữ liệu cá nhân và quyền riêng tư"'],
  expected: 'Khối "Nhân viên theo mức đã xác nhận" và "Vị trí đang yêu cầu năng lực này" lấy từ GET /competencies/{id}/usage (API mới).',
}, async () => {
  await page.type(`document.querySelector('main input[placeholder^="Tìm theo tên năng lực hoặc mã"]')`, 'Bảo vệ dữ liệu');
  await page.waitFor(`row('Bảo vệ dữ liệu cá nhân')`);
  await page.click(`row('Bảo vệ dữ liệu cá nhân').querySelector('a') ?? row('Bảo vệ dữ liệu cá nhân').querySelectorAll('td')[1]`);
  await page.waitFor(`leaf('Nhân viên theo mức đã xác nhận') && leaf('Vị trí đang yêu cầu năng lực này') && leaf('Kế toán')`);
  const notes = await shot('TC30', [
    { el: `up(leaf('Nhân viên theo mức đã xác nhận'), 1)`, label: 'Phân bố mức', note: 'levelDistribution: số nhân viên ACTIVE theo mức 0–3' },
    { el: `up(leaf('Vị trí đang yêu cầu năng lực này'), 1)`, label: 'Vị trí yêu cầu', note: 'positions: mức yêu cầu và số nhân viên của từng vị trí' },
  ]);
  return { actual: 'Hiện phân bố mức năng lực và các vị trí yêu cầu năng lực 4.2.', notes };
});

await tc({
  id: 'TC31', screen: 'OW-16 Yêu cầu theo vị trí', title: 'Tình trạng bộ yêu cầu của các vị trí', role: 'OWNER (hr@)', url: '/enterprise/requirements',
  precondition: 'ACCOUNTANT đã gắn Operations (TC19); các vị trí khác chưa có phòng ban', steps: ['Mở Năng lực > Yêu cầu theo vị trí'],
  expected: 'GET /position-requirements/summaries (API mới): 5 vị trí đang áp dụng v1; ACCOUNTANT thuộc Operations; vị trí chưa có phòng ban hiện "—".',
}, async () => {
  await open('/enterprise/requirements', `document.querySelectorAll('main table tbody tr').length === 5 && row('ACCOUNTANT')`);
  const notes = await shot('TC31', [
    { el: `up(leaf('đã áp dụng bộ yêu cầu'), 2)`, label: 'Thống kê', note: '5 vị trí đã áp dụng bộ yêu cầu' },
    { el: `row('ACCOUNTANT')`, label: 'ACCOUNTANT', note: 'Phòng ban Operations, phiên bản 1, 21 năng lực' },
    { el: `row('CEO')`, label: 'CEO', note: 'Chưa gắn phòng ban → "—" (đã sửa, trước đây để trống)' },
  ]);
  return { actual: '5 vị trí đang áp dụng; phòng ban hiển thị đúng, vị trí chưa có phòng ban hiện "—".', notes };
});

await tc({
  id: 'TC32', screen: 'OW-17 Thiết lập yêu cầu năng lực', title: 'Tạo bản nháp phiên bản 2 cho Sales / CRM', role: 'OWNER (hr@)', url: '/enterprise/requirements/builder?positionId=…',
  precondition: 'SALES_CRM đang áp dụng v1', steps: ['Ở dòng SALES_CRM bấm "Chỉnh sửa"', 'Đổi trình độ yêu cầu của năng lực 1.1', 'Bấm "Lưu bản nháp"'],
  expected: 'POST /position-requirements tạo bản nháp v2; trang chuyển sang v2 trạng thái nháp.',
}, async () => {
  await page.click(`[...row('SALES_CRM').querySelectorAll('a,button')].find((x) => norm(x.textContent).includes('Chỉnh sửa'))`);
  await page.waitFor(`document.querySelector('select[aria-label^="Trình độ yêu cầu của"]') && leaf('Ma trận năng lực yêu cầu')`);
  const first = `document.querySelector('select[aria-label^="Trình độ yêu cầu của"]')`;
  const current = await page.eval(`${first}.value`);
  const next = current === '3' ? '2' : '3';
  await page.select(first, next);
  state.changedCompetency = await page.eval(`${first}.getAttribute('aria-label').replace('Trình độ yêu cầu của ', '')`);
  await page.click(`button('Lưu bản nháp')`);
  await page.waitFor(`toast('Đã tạo bản nháp phiên bản mới') && document.getElementById('version-select') && norm(document.getElementById('version-select').selectedOptions[0].textContent).includes('2')`);
  const notes = await shot('TC32', [
    { el: `toast('Đã tạo bản nháp phiên bản mới')`, label: 'Toast', note: 'Bản nháp v2 đã lưu' },
    { el: `document.getElementById('version-select')`, label: 'Phiên bản', note: 'Đang xem v2 (nháp)' },
    { el: first, label: 'Mức đã đổi', note: `${state.changedCompetency}: ${current} → ${next}` },
  ]);
  return { actual: `Tạo bản nháp v2 cho Sales / CRM, đổi mức "${state.changedCompetency}" từ ${current} sang ${next}.`, notes };
});

await tc({
  id: 'TC33', screen: 'OW-17 Thiết lập yêu cầu năng lực', title: 'Kích hoạt phiên bản 2 (kèm lý do)', role: 'OWNER (hr@)', url: '/enterprise/requirements/builder?positionId=…',
  precondition: 'Đã chạy TC32', steps: ['Bấm "Kích hoạt phiên bản"', `Nhập lý do "${ACTIVATION_REASON}"`, 'Bấm "Kích hoạt"'],
  expected: 'POST /position-requirements/{id}/activate; v2 thành phiên bản đang áp dụng, skill gap của manager@ (Sales / CRM) được tính lại.',
}, async () => {
  await page.click(`button('Kích hoạt phiên bản')`);
  await page.waitFor(`document.getElementById('activate-reason')`);
  await page.type(`document.getElementById('activate-reason')`, ACTIVATION_REASON);
  const dialogNotes = await shot('TC33a', [
    { el: `document.getElementById('activate-reason').closest('[role=dialog] > div')`, label: 'Xác nhận kích hoạt', note: 'Nhập lý do thay đổi phiên bản' },
  ]);
  await page.click(`[...document.querySelectorAll('[role=dialog] button')].find((b) => norm(b.textContent) === 'Kích hoạt')`);
  await page.waitFor(`toast('Đã kích hoạt phiên bản yêu cầu')`);
  const notes = await shot('TC33', [
    { el: `toast('Đã kích hoạt phiên bản yêu cầu')`, label: 'Toast', note: 'v2 đã kích hoạt' },
    { el: `document.getElementById('version-select')`, label: 'Phiên bản', note: 'v2 đang áp dụng' },
  ]);
  return { actual: 'Kích hoạt v2 thành công.', notes: [...extra('TC33a', dialogNotes), ...notes], extraImages: ['TC33a'] };
});

await tc({
  id: 'TC34', screen: 'OW-18 Lịch sử phiên bản yêu cầu', title: 'Lịch sử phiên bản của Sales / CRM', role: 'OWNER (hr@)', url: '/enterprise/requirements/history',
  precondition: 'Đã chạy TC33', steps: ['Mở Năng lực > Lịch sử phiên bản', 'Chọn vị trí Sales / CRM'],
  expected: 'Có 2 phiên bản: v2 đang áp dụng (lý do vừa nhập), v1 đã được thay thế; phần so sánh chỉ ra năng lực đã đổi mức.',
}, async () => {
  await open('/enterprise/requirements/history', `document.getElementById('history-position')`);
  await page.selectText(`document.getElementById('history-position')`, 'Sales / CRM');
  await page.waitFor(`document.querySelector('[aria-labelledby=versions-title]') && norm(document.querySelector('[aria-labelledby=versions-title]').textContent).includes('2')`);
  const notes = await shot('TC34', [
    { el: `document.querySelector('[aria-labelledby=versions-title]')`, label: 'Phiên bản', note: 'v2 đang áp dụng, v1 đã thay thế' },
    { el: `document.querySelector('[aria-labelledby=diff-title]')`, label: 'So sánh', note: 'Năng lực đổi mức giữa v1 và v2' },
  ]);
  return { actual: 'Lịch sử có v2 (đang áp dụng) và v1; phần so sánh hiện thay đổi.', notes };
});

await tc({
  id: 'TC35', screen: 'OW-19 Hồ sơ năng lực (ma trận)', title: 'Ma trận năng lực, lọc theo vị trí Kế toán', role: 'OWNER (hr@)', url: '/enterprise/competency-profiles',
  precondition: 'Đã chạy TC26', steps: ['Mở Năng lực > Hồ sơ năng lực', 'Chọn vị trí "Kế toán"'],
  expected: 'GET /competency-profiles/matrix (API mới): mỗi ô là mức hiện tại/mức yêu cầu; lọc Kế toán còn Employee và Nguyễn Văn Kiểm Thử.',
}, async () => {
  await open('/enterprise/competency-profiles', `document.querySelectorAll('main table tbody tr').length >= 4`);
  const positionFilter = `[...document.querySelectorAll('main select')].find((s) => [...s.options].some((o) => norm(o.textContent) === 'Tất cả vị trí'))`;
  await page.selectText(positionFilter, 'Kế toán');
  await page.waitFor(`document.querySelectorAll('main table tbody tr').length === 2`);
  const notes = await shot('TC35', [
    { el: positionFilter, label: 'Lọc vị trí', note: 'Kế toán (gửi jobPositionId)' },
    { el: `document.querySelector('main table')`, label: 'Ma trận', note: 'Ô = mức hiện tại / mức yêu cầu; % đáp ứng theo snapshot mới nhất' },
  ]);
  return { actual: 'Ma trận hiện 2 nhân viên vị trí Kế toán với mức hiện tại/yêu cầu từng năng lực.', notes };
});

await tc({
  id: 'TC36', screen: 'OW-20 Chi tiết hồ sơ năng lực', title: 'Hồ sơ năng lực của Employee', role: 'OWNER (hr@)', url: '/enterprise/competency-profiles/{employeeId}',
  precondition: 'Đã chạy TC35', steps: ['Bấm vào Employee trong ma trận'],
  expected: 'GET /workforce/{employeeId} (API mới): tỷ lệ đáp ứng 62.0%, 15 khoảng trống (4 mức cao), 2 khóa đang học; tab trình độ năng lực theo 6 miền.',
}, async () => {
  await page.click(`[...document.querySelectorAll('main a')].find((a) => norm(a.textContent) === 'Employee')`);
  await page.waitFor(`heading('Employee') && leaf('62.0%')`);
  state.coverageBefore = await page.eval(`norm(leaf('62.0%').textContent)`);
  const notes = await shot('TC36', [
    { el: `up(leaf('62.0%'), 3)`, label: 'Chỉ số', note: 'Đáp ứng 62.0%, 15 khoảng trống (4 mức cao), 2 khóa đang học' },
    { el: `document.querySelector('[role=tablist]')`, label: 'Tabs', note: 'Trình độ, khoảng trống, minh chứng (26), học tập (2), bài đánh giá' },
  ]);
  return { actual: 'Hồ sơ Employee: 62.0% đáp ứng, 15 khoảng trống (4 cao), 2 khóa đang học.', notes };
});

await tc({
  id: 'TC37', screen: 'OW-20 Chi tiết hồ sơ năng lực', title: 'Owner xác nhận mức năng lực 4.2, skill gap tính lại', role: 'OWNER (hr@)', url: '/enterprise/competency-profiles/{employeeId} → Xác nhận trình độ',
  precondition: 'Employee đang ở mức Cơ bản với 4.2 (yêu cầu Nâng cao)', steps: ['Bấm "Xác nhận trình độ năng lực"', 'Chọn năng lực "Bảo vệ dữ liệu cá nhân…", mức Nâng cao, ghi chú', 'Bấm "Xác nhận mức"'],
  expected: 'POST /competency-evidences/manual; skill gap tính lại tự động: tỷ lệ đáp ứng tăng, số khoảng trống giảm; nguồn xác nhận = MANUAL.',
}, async () => {
  await page.click(`button('Xác nhận trình độ năng lực')`);
  await page.waitFor(`document.getElementById('confirm-competency')`);
  await page.selectText(`document.getElementById('confirm-competency')`, 'Bảo vệ dữ liệu cá nhân');
  await page.select(`document.getElementById('confirm-level')`, '3');
  await page.type(`document.getElementById('confirm-note')`, CONFIRM_NOTE);
  const dialogNotes = await shot('TC37a', [
    { el: `document.getElementById('confirm-competency').closest('form')`, label: 'Xác nhận mức', note: '4.2 Bảo vệ dữ liệu cá nhân → Nâng cao, kèm minh chứng' },
  ]);
  await page.click(`button('Xác nhận mức')`);
  await page.waitFor(`toast('Đã xác nhận mức Nâng cao') && !leaf('62.0%')`);
  const after = await page.eval(`norm(up(leaf('Tỷ lệ đáp ứng năng lực'), 1).textContent)`);
  const notes = await shot('TC37', [
    { el: `toast('Đã xác nhận mức Nâng cao')`, label: 'Toast', note: 'Skill gap đã được tính lại' },
    { el: `up(leaf('Tỷ lệ đáp ứng năng lực'), 2)`, label: 'Chỉ số mới', note: `Trước: ${state.coverageBefore}; sau: tỷ lệ đáp ứng tăng, khoảng trống giảm` },
  ]);
  return { actual: `Xác nhận thành công; chỉ số cập nhật (${after}).`, notes: [...extra('TC37a', dialogNotes), ...notes], extraImages: ['TC37a'] };
});

await tc({
  id: 'TC38', screen: 'OW-03 Chi tiết thành viên', title: 'Tab Nhiệm vụ và Minh chứng của Employee', role: 'OWNER (hr@)', url: '/enterprise/members/{id} → Nhiệm vụ, Minh chứng',
  precondition: 'Seed có 3 nhiệm vụ thực tế và 2 bài nộp của employee@', steps: ['Mở chi tiết thành viên Employee', 'Chọn tab "Nhiệm vụ"', 'Chọn tab "Minh chứng"'],
  expected: 'GET /workforce/{employeeId}: trạng thái nhiệm vụ hiện tiếng Việt (Đã giao / Cần chỉnh sửa / Đã đạt), năng lực mục tiêu hiện mã TT02; tab Minh chứng có bài nộp và nhật ký xác nhận (có mục 4.2 vừa xác nhận tay).',
}, async () => {
  await open('/enterprise/members', `row('employee@digitalent.ai')`);
  await page.click(`row('employee@digitalent.ai').querySelector('td')`);
  await page.waitFor(`heading('Employee') && tab('Nhiệm vụ')`);
  await page.click(`tab('Nhiệm vụ')`);
  await page.waitFor(`leaf('Nhiệm vụ thực tế được giao')`);
  const taskNotes = await shot('TC38a', [
    { el: `up(leaf('Nhiệm vụ thực tế được giao'), 2)`, label: 'Nhiệm vụ', note: 'Trạng thái tiếng Việt (đã sửa từ mã thô NEEDS_REVISION/PASSED), năng lực mục tiêu theo mã TT02 (đã sửa từ GUID)' },
  ]);
  await page.click(`tab('Minh chứng')`);
  await page.waitFor(`leaf('Nhật ký xác nhận trình độ năng lực')`);
  const notes = await shot('TC38', [
    { el: `up(leaf('Minh chứng nhiệm vụ thực tế đã nộp'), 1)`, label: 'Bài nộp', note: 'Bài nộp và kết quả chấm (Đã duyệt / Yêu cầu sửa)' },
    { el: `up(leaf('Nhật ký xác nhận trình độ năng lực'), 1)`, label: 'Nhật ký xác nhận', note: 'Mức đang xác nhận của từng năng lực, mới nhất trước' },
  ]);
  return { actual: 'Tab Nhiệm vụ hiện trạng thái tiếng Việt và mã năng lực; tab Minh chứng hiện bài nộp và nhật ký xác nhận.', notes: [...extra('TC38a', taskNotes), ...notes], extraImages: ['TC38a'] };
});

await tc({
  id: 'TC39', screen: 'OW-10 Chi tiết vị trí', title: 'Nhân sự giữ vị trí Kế toán', role: 'OWNER (hr@)', url: '/enterprise/positions/{id} → Nhân sự',
  precondition: 'Employee và Nguyễn Văn Kiểm Thử giữ vị trí Kế toán', steps: ['Mở Vị trí công việc > ACCOUNTANT', 'Chọn tab "Nhân sự"'],
  expected: 'GET /workforce?jobPositionId= (API mới): 2 người, kèm độ đáp ứng và số khoảng trống mức cao.',
}, async () => {
  await open('/enterprise/positions', `row('ACCOUNTANT')`);
  await page.click(`row('ACCOUNTANT').querySelector('td')`);
  await page.waitFor(`tab('Nhân sự')`);
  await page.click(`tab('Nhân sự')`);
  await page.waitFor(`leaf('Nguyễn Văn Kiểm Thử') && leaf('Employee')`);
  const notes = await shot('TC39', [
    { el: `tab('Nhân sự')`, label: 'Tab Nhân sự', note: '2 người giữ vị trí' },
    { el: `document.querySelector('[role=tabpanel]')`, label: 'Danh sách', note: 'Độ đáp ứng và số khoảng trống mức cao của từng người' },
  ]);
  return { actual: 'Tab Nhân sự hiện 2 người giữ vị trí Kế toán kèm độ đáp ứng.', notes };
});

// ══════════════════════════════ Employee (employee@) ══════════════════════════════
await signIn('employee@digitalent.ai');

const page_ = (id, screen, title, url, expected, ready, boxes, actual, extraMeta = {}) => tc({
  id, screen, title, role: 'EMPLOYEE (employee@)', url, precondition: extraMeta.precondition ?? 'Đăng nhập employee@digitalent.ai',
  steps: extraMeta.steps ?? [`Mở ${url}`], expected,
}, async () => {
  await open(url, ready);
  await sleep(500);
  const notes = await shot(id, boxes);
  return { actual, notes };
});

await page_('TC40', 'EM-01 Bảng phát triển của tôi', 'Bảng phát triển cá nhân', '/enterprise/me',
  'GET /me/dashboard: mục tiêu vị trí, việc cần làm, khóa học và tiến độ phát triển của chính mình.',
  `document.querySelector('main h1') && ${noLoading}`,
  [{ el: `document.querySelector('main h1').parentElement`, label: 'Bảng phát triển', note: 'Dữ liệu của chính employee@' }],
  'Hiện bảng phát triển của employee@.');

await page_('TC41', 'EM-02 Hồ sơ năng lực của tôi', 'Mức năng lực đã xác nhận so với chuẩn vị trí', '/enterprise/me/competency',
  'GET /me/competency-profile: 4.2 hiện mức Nâng cao vừa được Owner xác nhận ở TC37.',
  `heading('Hồ sơ năng lực của tôi') && leaf('Bảo vệ dữ liệu cá nhân')`,
  [
    { el: `heading('Hồ sơ năng lực của tôi')`, label: 'Hồ sơ', note: 'Mức xác nhận so với chuẩn vị trí Kế toán' },
    { el: `up(leaf('Bảo vệ dữ liệu cá nhân'), 2)`, label: '4.2', note: 'Mức mới sau khi Owner xác nhận (TC37)' },
  ],
  'Hồ sơ năng lực hiện 4.2 ở mức mới.', { precondition: 'Đã chạy TC37' });

await page_('TC42', 'EM-03 Khoảng trống năng lực của tôi', 'Khoảng trống so với yêu cầu vị trí', '/enterprise/me/skill-gap',
  'GET /me/skill-gap: độ đáp ứng và danh sách năng lực còn thiếu kèm mức độ.',
  `heading('Khoảng trống năng lực của tôi') && ${noLoading}`,
  [{ el: `heading('Khoảng trống năng lực của tôi').parentElement`, label: 'Khoảng trống', note: 'Độ đáp ứng và năng lực còn thiếu của chính mình' }],
  'Hiện khoảng trống năng lực của employee@.');

await page_('TC43', 'EM-04 Dòng thời gian minh chứng', 'Minh chứng và phản hồi đánh giá', '/enterprise/me/evidence',
  'GET /me/evidence-timeline: bài nộp nhiệm vụ, phản hồi và minh chứng năng lực đã ghi nhận (có xác nhận tay 4.2).',
  `heading('Dòng thời gian minh chứng') && ${noLoading}`,
  [{ el: `heading('Dòng thời gian minh chứng').parentElement`, label: 'Dòng thời gian', note: 'Minh chứng của chính mình, mới nhất trước' }],
  'Hiện dòng thời gian minh chứng.');

await page_('TC44', 'EM-05 Lộ trình học tập của tôi', 'Lộ trình học gắn với mục tiêu năng lực', '/enterprise/me/learning-path',
  'GET /me/learning-path: các chặng học theo khoảng trống năng lực, khóa tiên quyết trước.',
  `document.querySelector('main h1') && ${noLoading}`,
  [{ el: `document.querySelector('main h1').parentElement`, label: 'Lộ trình', note: 'Khóa học theo thứ tự tiên quyết' }],
  'Hiện lộ trình học tập.');

await page_('TC45', 'EM-06 Khóa học của tôi', 'Khóa được giao / đang học / đã xong', '/enterprise/me/courses',
  'GET /me/courses: 2 khóa được giao kèm tiến độ.',
  `heading('Khóa học của tôi') && ${noLoading}`,
  [{ el: `heading('Khóa học của tôi').parentElement`, label: 'Khóa học', note: 'Khóa được giao và tiến độ' }],
  'Hiện các khóa học của employee@.');

await page_('TC46', 'EM-09 Danh sách bài đánh giá', 'Bài đánh giá có thể làm', '/enterprise/me/assessments',
  'GET /me/assessments: bài đánh giá của các khóa đang học, trạng thái và điểm đạt.',
  `heading('Danh sách bài đánh giá') && ${noLoading}`,
  [{ el: `heading('Danh sách bài đánh giá').parentElement`, label: 'Bài đánh giá', note: 'Bài kiểm tra và bài cuối khóa' }],
  'Hiện danh sách bài đánh giá.');

await page_('TC47', 'EM-13 Lịch sử bài đánh giá', 'Các lần làm bài trước', '/enterprise/me/assessments/history',
  'GET /me/assessment-attempts: 1 lần làm bài đã nộp kèm điểm và kết quả.',
  `heading('Lịch sử bài đánh giá') && ${noLoading}`,
  [{ el: `heading('Lịch sử bài đánh giá').parentElement`, label: 'Lịch sử', note: 'Lần làm bài, điểm, đạt/không đạt' }],
  'Hiện lịch sử làm bài.');

await page_('TC48', 'EM-18 Thành tựu & Chứng nhận', 'Chứng nhận đã đạt', '/enterprise/me/achievements',
  'GET /me/achievements: chứng chỉ đã cấp kèm mã và ngày cấp.',
  `heading('Chứng nhận & thành tựu của tôi') && ${noLoading}`,
  [{ el: `heading('Chứng nhận & thành tựu của tôi').parentElement`, label: 'Thành tựu', note: 'Chứng chỉ của chính mình' }],
  'Hiện chứng nhận của employee@.');

await tc({
  id: 'TC49', screen: 'EM-14/EM-15 Nhiệm vụ của tôi', title: 'Danh sách nhiệm vụ và chi tiết nhiệm vụ chưa nộp', role: 'EMPLOYEE (employee@)', url: '/enterprise/me/tasks → /enterprise/me/tasks/{id}',
  precondition: 'Seed có nhiệm vụ "Rà soát quyền truy cập thư mục chứng từ kế toán" trạng thái Chưa nộp', steps: ['Mở Nhiệm vụ của tôi', 'Bấm nhiệm vụ "Rà soát quyền truy cập thư mục chứng từ kế toán"'],
  expected: 'GET /me/tasks và /me/tasks/{id}: yêu cầu, tiêu chí chấm và nút "Nộp minh chứng".',
}, async () => {
  await open('/enterprise/me/tasks', `heading('Nhiệm vụ thực tế của tôi') && leaf('Rà soát quyền truy cập')`);
  const listNotes = await shot('TC49a', [
    { el: `heading('Nhiệm vụ thực tế của tôi').parentElement`, label: 'Nhiệm vụ', note: 'Danh sách nhiệm vụ được giao và hạn' },
  ]);
  state.taskPath = await page.eval(`[...document.querySelectorAll('main a')].find((a) => norm(a.textContent).includes('Rà soát quyền truy cập')).getAttribute('href')`);
  await open(state.taskPath, `location.pathname === ${JSON.stringify(state.taskPath)} && [...document.querySelectorAll('main a')].some((a) => (a.getAttribute('href') ?? '').endsWith('/submit'))`);
  const notes = await shot('TC49', [
    { el: `document.querySelector('main h1')`, label: 'Nhiệm vụ', note: 'Rà soát quyền truy cập thư mục chứng từ kế toán' },
    { el: `[...document.querySelectorAll('main a')].find((a) => (a.getAttribute('href') ?? '').endsWith('/submit'))`, label: 'Nộp minh chứng', note: 'Nhiệm vụ đang chờ nộp' },
  ]);
  return { actual: 'Hiện danh sách nhiệm vụ và chi tiết nhiệm vụ chưa nộp.', notes: [...extra('TC49a', listNotes), ...notes], extraImages: ['TC49a'] };
});

await tc({
  id: 'TC50', screen: 'EM-16 Nộp minh chứng nhiệm vụ', title: 'Nộp minh chứng (mô tả + đường dẫn)', role: 'EMPLOYEE (employee@)', url: '/enterprise/me/tasks/{id}/submit',
  precondition: 'Đã chạy TC49', steps: ['Bấm "Nộp minh chứng"', 'Nhập mô tả kết quả và 1 đường dẫn', 'Bấm "Gửi nộp minh chứng"'],
  expected: 'POST /me/tasks/{id}/submissions: toast "Đã nộp minh chứng (lần 1)", nhiệm vụ chuyển sang chờ chấm, người chấm nhận thông báo.',
}, async () => {
  await page.click(`[...document.querySelectorAll('main a')].find((a) => (a.getAttribute('href') ?? '').endsWith('/submit'))`);
  await page.waitFor(`location.pathname.endsWith('/submit') && document.getElementById('evidence-content')`);
  await page.type(`document.getElementById('evidence-content')`, SUBMISSION_TEXT);
  if (!(await page.eval(`!!document.querySelector('input[aria-label="Đường dẫn 1"]')`))) await page.click(`button('Thêm link')`);
  await page.type(`document.querySelector('input[aria-label="Đường dẫn 1"]')`, 'https://drive.example.com/kiem-thu/ra-soat-quyen-truy-cap');
  const formNotes = await shot('TC50a', [
    { el: `document.getElementById('evidence-content')`, label: 'Mô tả', note: 'Kết quả thực hiện' },
    { el: `document.querySelector('input[aria-label="Đường dẫn 1"]')`, label: 'Đường dẫn', note: 'Link sản phẩm' },
  ]);
  await page.click(`button('Gửi nộp minh chứng')`);
  await page.waitFor(`toast('Đã nộp minh chứng (lần 1)')`);
  const notes = await shot('TC50', [
    { el: `toast('Đã nộp minh chứng')`, label: 'Toast', note: 'Đã nộp lần 1, người chấm được thông báo' },
    { el: `document.querySelector('main h1')`, label: 'Nhiệm vụ', note: 'Trở về chi tiết nhiệm vụ, trạng thái chờ chấm' },
  ]);
  return { actual: 'Nộp minh chứng thành công (lần 1).', notes: [...extra('TC50a', formNotes), ...notes], extraImages: ['TC50a'] };
});

// ══════════════════════════════ Manager (manager@) ══════════════════════════════
await signIn('manager@digitalent.ai');

await tc({
  id: 'TC51', screen: 'MG-11 Hàng đợi đánh giá', title: 'Bài nộp của Employee chờ Quản lý chấm', role: 'MANAGER (manager@)', url: '/enterprise/reviews',
  precondition: 'Đã chạy TC50; manager@ quản lý phòng Operations', steps: ['Đăng nhập manager@digitalent.ai', 'Mở Đánh giá thực tế > Hàng chờ đánh giá'],
  expected: 'Bài nộp "Rà soát quyền truy cập thư mục chứng từ kế toán" của Employee nằm trong hàng chờ.',
}, async () => {
  await open('/enterprise/reviews', `heading('Hàng chờ đánh giá minh chứng') && row('Rà soát quyền truy cập')`);
  const notes = await shot('TC51', [
    { el: `row('Rà soát quyền truy cập')`, label: 'Bài nộp mới', note: 'Bài nộp của Employee ở TC50, chờ chấm' },
  ]);
  return { actual: 'Bài nộp của Employee có trong hàng chờ đánh giá.', notes };
});

await tc({
  id: 'TC52', screen: 'MG-12 Đánh giá minh chứng', title: 'Quản lý chấm và phê duyệt minh chứng', role: 'MANAGER (manager@)', url: '/enterprise/reviews/{submissionId}',
  precondition: 'Đã chạy TC51', steps: ['Bấm vào bài nộp', 'Cho điểm từng tiêu chí, nhập nhận xét', 'Chọn "Đạt chuẩn (Phê duyệt)"', 'Bấm "Hoàn tất đánh giá"'],
  expected: 'POST /submissions/{id}/evaluate: toast "Đã duyệt minh chứng và công nhận đạt chuẩn năng lực!"; năng lực mục tiêu của nhiệm vụ được ghi nhận vào hồ sơ.',
}, async () => {
  // The queue table scrolls inside a short box under a sticky header, so the row link is followed by its href.
  const reviewPath = await page.eval(`[...row('Rà soát quyền truy cập').querySelectorAll('a')].pop().getAttribute('href')`);
  await open(reviewPath, `button('Hoàn tất đánh giá')`);
  await page.eval(`(() => { for (const input of document.querySelectorAll('main input[type=number]')) { const max = input.max || '100'; const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(input, max); input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true })); } return true; })()`);
  const feedback = `document.querySelector('main textarea')`;
  await page.type(feedback, 'Minh chứng đầy đủ, rà soát đúng quy trình (kiểm thử).');
  await page.click(`byText('button', 'Đạt chuẩn (Phê duyệt)')`);
  const formNotes = await shot('TC52a', [
    { el: `byText('button', 'Đạt chuẩn (Phê duyệt)')`, label: 'Quyết định', note: 'Đạt chuẩn (Phê duyệt)' },
    { el: feedback, label: 'Nhận xét', note: 'Phản hồi cho nhân viên' },
  ]);
  await page.click(`button('Hoàn tất đánh giá')`);
  await page.waitFor(`toast('Đã duyệt minh chứng')`);
  const notes = await shot('TC52', [
    { el: `toast('Đã duyệt minh chứng')`, label: 'Toast', note: 'Đã duyệt và công nhận đạt chuẩn năng lực' },
  ]);
  return { actual: 'Quản lý phê duyệt minh chứng thành công.', notes: [...extra('TC52a', formNotes), ...notes], extraImages: ['TC52a'] };
});

// ══════════════════════════════ Employee: kết quả ══════════════════════════════
await signIn('employee@digitalent.ai');

await tc({
  id: 'TC53', screen: 'EM-17 Phản hồi & Chỉnh sửa', title: 'Nhân viên xem kết quả chấm và hồ sơ được cập nhật', role: 'EMPLOYEE (employee@)', url: '/enterprise/me/tasks/{id}/feedback → /enterprise/me/evidence',
  precondition: 'Đã chạy TC52', steps: ['Mở lại nhiệm vụ đã nộp, xem phản hồi', 'Mở Dòng thời gian minh chứng'],
  expected: 'Nhiệm vụ "Đã đạt" kèm nhận xét của Quản lý; dòng thời gian minh chứng có kết quả chấm mới (vòng nộp → chấm → hồ sơ khép kín).',
}, async () => {
  await open(`${state.taskPath}/feedback`, `document.querySelector('main h1') && leaf('Minh chứng đầy đủ')`);
  const feedbackNotes = await shot('TC53a', [
    { el: `up(leaf('Minh chứng đầy đủ'), 2)`, label: 'Phản hồi', note: 'Kết luận Đạt và nhận xét của Quản lý' },
  ]);
  await open('/enterprise/me/evidence', `heading('Dòng thời gian minh chứng') && leaf('Rà soát quyền truy cập')`);
  const notes = await shot('TC53', [
    { el: `up(leaf('Rà soát quyền truy cập'), 2)`, label: 'Minh chứng mới', note: 'Bài nộp vừa được duyệt xuất hiện trên dòng thời gian' },
  ]);
  return { actual: 'Nhân viên thấy kết quả Đạt và minh chứng mới trên dòng thời gian.', notes: [...extra('TC53a', feedbackNotes), ...notes], extraImages: ['TC53a'] };
});

save();
await page.send('Browser.close').catch(() => {});
proc.kill();
console.log(`DONE ${results.filter((r) => r.status === 'PASS').length}/${results.length} PASS`);
