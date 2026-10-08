// E2E evidence for branch feature/DT-organization-fe-integration: real frontend (Vite) + real backend (Development) on a fresh DB.
import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { launchChrome, sleep } from './cdp.mjs';

const OUT = process.argv[2];
const BASE = 'http://localhost:5173';
const PASSWORD = 'Admin@1234'; // seed demo password (CLAUDE.md)
const INVITEE = { name: 'Nguyễn Văn Kiểm Thử', email: 'kiemthu.fe@digitalent.ai' };
const INVITEE_PASSWORD = 'KiemThu#FE2026';
const REASON = 'Nghỉ phép dài hạn (kiểm thử)';

const { proc, page } = await launchChrome({
  chromePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  profileDir: join(tmpdir(), 'digitalent-evidence-chrome-1'),
});
await page.recordApi();

const results = [];
let token = '';

/** Runs one test case: steps + assertions in `fn`, which returns { actual, boxes, notes }; records API calls and timing. */
async function tc(meta, fn) {
  page.takeApi();
  const at = new Date();
  try {
    const out = await fn();
    await sleep(300);
    results.push({ ...meta, ...out, status: 'PASS', at: at.toISOString(), api: page.takeApi() });
    console.log(`PASS ${meta.id} ${meta.title}`);
  } catch (error) {
    const file = join(OUT, `${meta.id}.png`);
    try { await page.shot(file); } catch { /* ignore */ }
    results.push({ ...meta, status: 'FAIL', actual: String(error.message).slice(0, 500), boxes: [], at: at.toISOString(), api: page.takeApi() });
    console.log(`FAIL ${meta.id} ${meta.title}\n  ${error.message}`);
  }
  writeFileSync(join(OUT, '..', 'results.json'), JSON.stringify(results, null, 2));
}

const shot = (id, boxes) => page.shot(join(OUT, `${id}.png`), boxes.map((b) => ({ el: b.el, label: b.label })))
  .then(() => boxes.map((b, i) => `${i + 1}. ${b.label}: ${b.note}`));

async function signOut() {
  await page.goto(`${BASE}/business/login`);
  await page.eval(`(localStorage.clear(), sessionStorage.clear(), true)`);
}

async function signIn(email) {
  await signOut();
  await page.goto(`${BASE}/business/login`);
  await page.type(`document.getElementById('email')`, email);
  await page.type(`document.getElementById('password')`, PASSWORD);
  await page.click(`byText('button', 'Đăng nhập', true)`);
  await page.waitFor(`!location.pathname.includes('login') && document.querySelector('[data-testid=enterprise-layout]')`, { label: `signed in as ${email}` });
  page.takeApi();
}

async function open(path, ready) {
  await page.goto(`${BASE}${path}`);
  await page.waitFor(ready, { label: `page ${path} ready` });
}

const memberRow = (email) => `row(${JSON.stringify(email)})`;

// ────────────────────────────── OW-02 Thành viên ──────────────────────────────
await signIn('hr@digitalent.ai');

await tc({
  id: 'TC01', screen: 'OW-02 Thành viên', title: 'Danh sách thành viên lấy từ API thật', role: 'OWNER (hr@)', url: '/enterprise/members',
  precondition: 'DB mới, seed Development: 5 tài khoản (admin@, hr@, manager@, trainer@, employee@)',
  steps: ['Đăng nhập hr@digitalent.ai', 'Mở Tổ chức > Thành viên'],
  expected: 'Bảng hiện 5 thành viên của tổ chức; admin@ hiển thị vai trò Chủ doanh nghiệp, chưa có phòng ban (tài khoản chưa có hồ sơ nhân viên).',
}, async () => {
  await open('/enterprise/members', `${memberRow('admin@digitalent.ai')} && ${memberRow('employee@digitalent.ai')}`);
  const count = await page.eval(`document.querySelectorAll('tbody tr').length`);
  if (count !== 5) throw new Error(`Expected 5 rows, got ${count}`);
  const notes = await shot('TC01', [
    { el: `document.querySelector('table')`, label: 'Bảng thành viên', note: '5 dòng trả về từ GET /api/v1/members (dữ liệu seed, không phải mock)' },
    { el: memberRow('admin@digitalent.ai'), label: 'admin@', note: 'Vai trò Chủ doanh nghiệp (SYSTEM_ADMIN → OWNER), phòng ban "—" vì chưa có hồ sơ nhân viên' },
  ]);
  return { actual: `Hiển thị ${count} thành viên; admin@ là Chủ doanh nghiệp, chưa có phòng ban.`, notes };
});

await tc({
  id: 'TC02', screen: 'OW-02 Thành viên', title: 'Mời thành viên: 1 lời mời hợp lệ, 1 email đã có tài khoản', role: 'OWNER (hr@)', url: '/enterprise/members → Mời thành viên',
  precondition: `Email ${INVITEE.email} chưa có tài khoản; employee@digitalent.ai đã có tài khoản`,
  steps: ['Bấm "Mời thành viên"', `Nhập ${INVITEE.name} / ${INVITEE.email}, vai trò Quản lý, phòng ban Operations → "Thêm vào danh sách"`, 'Nhập "Nhân viên trùng" / employee@digitalent.ai → "Thêm vào danh sách"', 'Bấm "Gửi 2 lời mời"'],
  expected: '1 lời mời được tạo, có liên kết kích hoạt (Development trả token); email đã có tài khoản bị từ chối với lý do tiếng Việt "Email đã có tài khoản hoặc đã được mời."',
}, async () => {
  await page.click(`button('Mời thành viên')`);
  await page.waitFor(`dialog() && byLabel('Họ và tên *', dialog())`);
  await page.type(`byLabel('Họ và tên *', dialog())`, INVITEE.name);
  await page.type(`byLabel('Email *', dialog())`, INVITEE.email);
  await page.selectText(`byLabel('Vai trò', dialog())`, 'Quản lý');
  await page.selectText(`byLabel('Phòng ban', dialog())`, 'Operations');
  await page.click(`button('Thêm vào danh sách')`);
  await page.type(`byLabel('Họ và tên *', dialog())`, 'Nhân viên trùng');
  await page.type(`byLabel('Email *', dialog())`, 'employee@digitalent.ai');
  await page.selectText(`byLabel('Vai trò', dialog())`, 'Nhân viên');
  await page.click(`button('Thêm vào danh sách')`);
  await page.click(`button('Gửi 2 lời mời')`);
  await page.waitFor(`byText('p', 'Đã gửi 1 lời mời.')`);
  await page.waitFor(`byText('li', 'Email đã có tài khoản hoặc đã được mời.')`);
  token = await page.eval(`(byText('a', 'liên kết kích hoạt') || {}).getAttribute?.('href')?.split('/activate/')[1] ?? ''`);
  if (!token) throw new Error('No activation link in the result');
  const notes = await shot('TC02', [
    { el: `byText('p', 'Đã gửi 1 lời mời.').parentElement`, label: 'Lời mời đã tạo', note: 'POST /members/invitations trả created[1] kèm token → hiện liên kết kích hoạt (chỉ Development)' },
    { el: `byText('li', 'Email đã có tài khoản hoặc đã được mời.')`, label: 'Dòng bị từ chối', note: 'rejected[].reason tiếng Việt do backend trả, hiển thị nguyên văn' },
  ]);
  return { actual: '1 lời mời được tạo (có liên kết kích hoạt), employee@ bị từ chối: "Email đã có tài khoản hoặc đã được mời."', notes };
});

await tc({
  id: 'TC03', screen: 'OW-02 Thành viên', title: 'Lời mời chờ kích hoạt xuất hiện trong danh sách', role: 'OWNER (hr@)', url: '/enterprise/members',
  precondition: 'Đã chạy TC02', steps: ['Đóng modal mời', 'Xem danh sách thành viên'],
  expected: `Có dòng ${INVITEE.email} trạng thái "Chờ kích hoạt" ở cuối danh sách (lời mời xếp sau thành viên).`,
}, async () => {
  await page.click(`button('Đóng')`);
  await page.waitFor(`${memberRow(INVITEE.email)} && norm(${memberRow(INVITEE.email)}.textContent).includes('Chờ kích hoạt')`);
  const isLast = await page.eval(`[...document.querySelectorAll('tbody tr')].pop() === ${memberRow(INVITEE.email)}`);
  if (!isLast) throw new Error('The invitation is not the last row');
  const notes = await shot('TC03', [
    { el: memberRow(INVITEE.email), label: 'Lời mời', note: 'kind = invitation, status = PENDING → nhãn "Chờ kích hoạt", nằm cuối danh sách' },
  ]);
  return { actual: 'Dòng lời mời "Chờ kích hoạt" hiển thị ở cuối danh sách.', notes };
});

// ─────────────────────────── AUTH-05 Kích hoạt lời mời ───────────────────────────
await signOut();

await tc({
  id: 'TC04', screen: 'AUTH-05 Kích hoạt lời mời', title: 'Mở liên kết kích hoạt (chưa đăng nhập)', role: 'Ẩn danh', url: '/activate/{token}',
  precondition: 'Token lấy từ liên kết ở TC02; đã đăng xuất', steps: ['Mở liên kết kích hoạt trong trình duyệt chưa đăng nhập'],
  expected: 'Trang hiện tên tổ chức, vai trò Quản lý, email được mời ở ô chỉ đọc (dữ liệu từ GET /invitations/{token}).',
}, async () => {
  await open(`/activate/${token}`, `byText('p', 'Bạn được mời tham gia')`);
  const notes = await shot('TC04', [
    { el: `byText('p', 'Bạn được mời tham gia')`, label: 'Thông tin lời mời', note: 'organizationName + role từ GET /api/v1/invitations/{token} (trước đây service chỉ có mock)' },
    { el: `document.getElementById('email')`, label: 'Email', note: 'Email được mời, readonly' },
  ]);
  return { actual: 'Trang kích hoạt hiện đúng tổ chức, vai trò Quản lý và email được mời.', notes };
});

await tc({
  id: 'TC05', screen: 'AUTH-05 Kích hoạt lời mời', title: 'Đặt mật khẩu và kích hoạt tài khoản', role: 'Ẩn danh → Quản lý mới', url: '/activate/{token}',
  precondition: 'Đã chạy TC04', steps: ['Nhập mật khẩu ≥ 12 ký tự và nhập lại', 'Bấm "Kích hoạt và vào hệ thống"'],
  expected: 'POST /invitations/activate thành công, tự đăng nhập (POST /auth/login) và chuyển tới trang đánh giá đầu vào.',
}, async () => {
  await page.type(`document.getElementById('password')`, INVITEE_PASSWORD);
  await page.type(`document.getElementById('confirmPassword')`, INVITEE_PASSWORD);
  await page.click(`button('Kích hoạt và vào hệ thống')`);
  await page.waitFor(`location.pathname === '/enterprise/initial-assessment' && byText('h1,h2', 'Phân tích năng lực')`, { timeout: 20000 });
  const notes = await shot('TC05', [
    { el: `byText('h1', 'Phân tích năng lực')`, label: 'Đã vào hệ thống', note: 'Tài khoản mới đăng nhập được, chuyển tới /enterprise/initial-assessment' },
  ]);
  return { actual: 'Kích hoạt thành công, tự đăng nhập và vào trang đánh giá đầu vào.', notes };
});

await signOut();

await tc({
  id: 'TC06', screen: 'AUTH-05 Kích hoạt lời mời', title: 'Dùng lại liên kết đã kích hoạt', role: 'Ẩn danh', url: '/activate/{token}',
  precondition: 'Đã chạy TC05', steps: ['Mở lại đúng liên kết kích hoạt cũ'],
  expected: 'Backend trả 404; trang báo bằng tiếng Việt "Liên kết mời không hợp lệ hoặc đã hết hạn." (dịch từ thông báo tiếng Anh của backend).',
}, async () => {
  await open(`/activate/${token}`, `byText('[role=alert], p', 'Liên kết mời không hợp lệ hoặc đã hết hạn.')`);
  const notes = await shot('TC06', [
    { el: `byText('[role=alert], p', 'Liên kết mời không hợp lệ hoặc đã hết hạn.')`, label: 'Thông báo lỗi', note: 'GET /invitations/{token} = 404 → organizationErrorMessage dịch sang tiếng Việt' },
  ]);
  return { actual: 'Hiện "Liên kết mời không hợp lệ hoặc đã hết hạn."', notes };
});

// ─────────────────────────── OW-03 Chi tiết thành viên ───────────────────────────
await signIn('hr@digitalent.ai');

async function openMember(email) {
  await open('/enterprise/members', memberRow(email));
  await page.click(`${memberRow(email)}.querySelector('td')`);
  await page.waitFor(`location.pathname.startsWith('/enterprise/members/') && byText('h1', '')`);
  await page.waitFor(`!byText('p', 'Đang tải thông tin thành viên')`);
}

await tc({
  id: 'TC07', screen: 'OW-03 Chi tiết thành viên', title: 'Thành viên vừa kích hoạt: vai trò, phòng ban, lịch sử', role: 'OWNER (hr@)', url: '/enterprise/members/{id}',
  precondition: 'Đã chạy TC05', steps: [`Mở chi tiết ${INVITEE.name} từ danh sách thành viên`],
  expected: 'Vai trò Quản lý, phòng ban Operations; lịch sử có "Kích hoạt lời mời" (nhãn mới cho INVITATION_ACCEPTED). Log "Mời thành viên" gắn với id lời mời nên không thuộc lịch sử thành viên (BE1 guide §3.2).',
}, async () => {
  await openMember(INVITEE.email);
  await page.waitFor(`byText('li', 'Kích hoạt lời mời')`);
  const notes = await shot('TC07', [
    { el: `byText('dl', 'Vai trò')`, label: 'Hồ sơ', note: 'Vai trò Quản lý, phòng ban Operations (hồ sơ nhân viên tạo khi kích hoạt)' },
    { el: `byText('li', 'Kích hoạt lời mời')`, label: 'INVITATION_ACCEPTED', note: 'Nhãn tiếng Việt mới thêm trong member-labels.ts' },
  ]);
  return { actual: 'Vai trò Quản lý, phòng ban Operations; lịch sử có "Kích hoạt lời mời".', notes };
});

await tc({
  id: 'TC08', screen: 'OW-03 Chi tiết thành viên', title: 'Đổi vai trò Quản lý → Nhân viên', role: 'OWNER (hr@)', url: '/enterprise/members/{id} → Đổi vai trò',
  precondition: 'Đang ở chi tiết thành viên của TC07', steps: ['Bấm "Đổi vai trò"', 'Chọn "Nhân viên"', 'Bấm "Lưu vai trò"'],
  expected: 'PUT /members/{id} thành công; toast xác nhận; vai trò hiển thị Nhân viên; lịch sử thêm "Đổi vai trò".',
}, async () => {
  await page.click(`button('Đổi vai trò')`);
  await page.click(`byText('label', 'Nhân viên')`);
  await page.click(`button('Lưu vai trò')`);
  await page.waitFor(`toast('thành Nhân viên')`);
  await page.waitFor(`byText('li', 'Đổi vai trò') && norm(dd('Vai trò')?.textContent) === 'Nhân viên'`);
  const notes = await shot('TC08', [
    { el: `toast('thành Nhân viên')`, label: 'Toast', note: 'Thông báo đổi vai trò thành công' },
    { el: `dd('Vai trò').parentElement`, label: 'Vai trò', note: 'Dữ liệu tải lại sau khi invalidate cache: Nhân viên' },
    { el: `byText('li', 'Đổi vai trò')`, label: 'ROLE_CHANGED', note: 'Lịch sử ghi nhận đổi vai trò' },
  ]);
  return { actual: 'Đổi vai trò thành công, vai trò hiển thị Nhân viên, lịch sử có "Đổi vai trò".', notes };
});

await tc({
  id: 'TC09', screen: 'OW-03 Chi tiết thành viên', title: 'Đổi phòng ban & vị trí (gán vị trí Kế toán)', role: 'OWNER (hr@)', url: '/enterprise/members/{id} → Phòng ban & vị trí',
  precondition: 'Đã chạy TC08', steps: ['Bấm "Phòng ban & vị trí"', 'Giữ phòng ban Operations (bắt buộc), chọn vị trí "Kế toán"', 'Bấm "Lưu"'],
  expected: 'PUT /members/{id} thành công; vị trí công việc hiển thị Kế toán; lịch sử có "Đổi phòng ban / vị trí".',
}, async () => {
  await page.click(`button('Phòng ban & vị trí')`);
  await page.waitFor(`byLabel('Phòng ban *', dialog())`);
  await page.selectText(`byLabel('Vị trí công việc', dialog())`, 'Kế toán');
  const notesDialog = await shot('TC09a', [
    { el: `byLabel('Phòng ban *', dialog())`, label: 'Phòng ban *', note: 'Bắt buộc (mọi hồ sơ nhân viên thuộc 1 phòng ban); nút Lưu bị khóa nếu trống' },
    { el: `byLabel('Vị trí công việc', dialog())`, label: 'Vị trí', note: 'Chọn Kế toán' },
  ]);
  await page.click(`button('Lưu')`);
  await page.waitFor(`toast('Đã cập nhật phòng ban và vị trí')`);
  await page.waitFor(`norm(dd('Vị trí công việc')?.textContent) === 'Kế toán' && byText('li', 'Đổi phòng ban / vị trí')`);
  const notes = await shot('TC09', [
    { el: `toast('Đã cập nhật phòng ban và vị trí')`, label: 'Toast', note: 'Cập nhật thành công' },
    { el: `dd('Vị trí công việc').parentElement`, label: 'Vị trí', note: 'Kế toán' },
    { el: `byText('li', 'Đổi phòng ban / vị trí')`, label: 'MEMBER_PLACEMENT_CHANGED', note: 'Lịch sử ghi nhận' },
  ]);
  return { actual: 'Vị trí cập nhật thành Kế toán, lịch sử có "Đổi phòng ban / vị trí".', notes: [...notesDialog.map((n) => `[Ảnh TC09a] ${n}`), ...notes], extraImages: ['TC09a'] };
});

await tc({
  id: 'TC10', screen: 'OW-03 Chi tiết thành viên', title: 'Vô hiệu hóa thành viên (có lý do)', role: 'OWNER (hr@)', url: '/enterprise/members/{id} → Vô hiệu hóa',
  precondition: 'Đã chạy TC09', steps: ['Bấm "Vô hiệu hóa"', `Nhập lý do "${REASON}"`, 'Xác nhận "Vô hiệu hóa"'],
  expected: 'POST /members/{id}/deactivate thành công; trạng thái "Đã vô hiệu hóa" và banner hiện lý do.',
}, async () => {
  await page.click(`byText('header button, button', 'Vô hiệu hóa', true)`);
  await page.waitFor(`dialog() && dialog().querySelector('textarea')`);
  await page.type(`dialog().querySelector('textarea')`, REASON);
  await page.click(`[...dialog().querySelectorAll('button')].find((b) => norm(b.textContent) === 'Vô hiệu hóa')`);
  await page.waitFor(`byText('p', ${JSON.stringify(REASON)})`);
  const notes = await shot('TC10', [
    { el: `byText('span,div', 'Đã vô hiệu hóa', true)`, label: 'Trạng thái', note: 'status = INACTIVE' },
    { el: `byText('p', ${JSON.stringify(REASON)})`, label: 'Lý do', note: 'deactivatedReason do backend lưu và trả về' },
  ]);
  return { actual: `Trạng thái Đã vô hiệu hóa, banner hiện lý do "${REASON}".`, notes };
});

await tc({
  id: 'TC11', screen: 'OW-03 Chi tiết thành viên', title: 'Kích hoạt lại thành viên', role: 'OWNER (hr@)', url: '/enterprise/members/{id} → Kích hoạt lại',
  precondition: 'Đã chạy TC10', steps: ['Bấm "Kích hoạt lại"', 'Xác nhận "Kích hoạt lại"'],
  expected: 'POST /members/{id}/reactivate thành công; trạng thái "Đang hoạt động", banner vô hiệu hóa biến mất.',
}, async () => {
  await page.click(`byText('button', 'Kích hoạt lại', true)`);
  await page.waitFor(`dialog()`);
  await page.click(`[...dialog().querySelectorAll('button')].find((b) => norm(b.textContent) === 'Kích hoạt lại')`);
  await page.waitFor(`toast('Đã kích hoạt lại') && byText('span,div', 'Đang hoạt động', true) && !byText('p', ${JSON.stringify(REASON)})`);
  const notes = await shot('TC11', [
    { el: `toast('Đã kích hoạt lại')`, label: 'Toast', note: 'Kích hoạt lại thành công' },
    { el: `byText('span,div', 'Đang hoạt động', true)`, label: 'Trạng thái', note: 'status = ACTIVE' },
  ]);
  return { actual: 'Trạng thái trở lại Đang hoạt động.', notes };
});

await tc({
  id: 'TC12', screen: 'OW-03 Chi tiết thành viên', title: 'Tài khoản chưa có hồ sơ nhân viên (admin@)', role: 'OWNER (hr@)', url: '/enterprise/members/{id admin}',
  precondition: 'admin@ là tài khoản không có hồ sơ nhân viên (employeeId = null)', steps: ['Mở chi tiết System Admin từ danh sách thành viên'],
  expected: 'Không gọi API năng lực bằng user id (trước đây trả 404); hiện thông báo "chưa có hồ sơ nhân viên" và chỉ còn tab Tổng quan.',
}, async () => {
  await openMember('admin@digitalent.ai');
  await page.waitFor(`byText('p', 'chưa có hồ sơ nhân viên')`);
  const tabs = await page.eval(`[...document.querySelectorAll('[role=tab]')].map((t) => norm(t.textContent))`);
  if (tabs.length !== 1) throw new Error(`Expected only the overview tab, got ${tabs.join(', ')}`);
  const notes = await shot('TC12', [
    { el: `byText('p', 'chưa có hồ sơ nhân viên')`, label: 'Thông báo', note: 'employeeId = null → không tải dữ liệu năng lực, hướng dẫn tạo hồ sơ' },
    { el: `document.querySelector('[role=tablist]')`, label: 'Tabs', note: 'Chỉ còn tab Tổng quan' },
  ]);
  return { actual: 'Hiện thông báo chưa có hồ sơ, chỉ có tab Tổng quan; không có request /workforce lỗi 404.', notes };
});

// ─────────────────────────────── OW-13 Phân quyền ───────────────────────────────
await tc({
  id: 'TC13', screen: 'OW-13 Phân quyền', title: 'Ba vai trò và số người giữ từ GET /roles', role: 'OWNER (hr@)', url: '/enterprise/access',
  precondition: 'Đã chạy TC01–TC12', steps: ['Mở Tổ chức > Phân quyền'],
  expected: '3 thẻ vai trò Chủ doanh nghiệp / Quản lý / Nhân viên với số người do backend đếm (Owner gồm cả System Admin).',
}, async () => {
  await open('/enterprise/access', `document.querySelectorAll('[aria-label="3 vai trò Enterprise"] > li').length === 3`);
  const notes = await shot('TC13', [
    { el: `document.querySelector('[aria-label="3 vai trò Enterprise"]')`, label: '3 vai trò', note: 'name, summary, can, memberCount từ GET /api/v1/roles' },
  ]);
  return { actual: 'Hiện 3 thẻ vai trò kèm số người giữ vai trò.', notes };
});

await tc({
  id: 'TC14', screen: 'OW-13 Phân quyền', title: 'Owner tự hạ vai trò của chính mình (Owner cuối cùng)', role: 'OWNER (hr@)', url: '/enterprise/access → Đổi vai trò',
  precondition: 'hr@ là HR_MANAGER đang hoạt động duy nhất', steps: ['Ở dòng hr@digitalent.ai bấm "Đổi vai trò"', 'Chọn "Nhân viên" → "Lưu vai trò"'],
  expected: 'Backend trả 409; toast tiếng Việt "Tổ chức phải còn ít nhất một Chủ doanh nghiệp đang hoạt động."; vai trò giữ nguyên.',
}, async () => {
  await page.waitFor(memberRow('hr@digitalent.ai'));
  await page.click(`${memberRow('hr@digitalent.ai')}.querySelector('button')`);
  await page.click(`byText('label', 'Nhân viên')`);
  await page.click(`button('Lưu vai trò')`);
  await page.waitFor(`toast('Tổ chức phải còn ít nhất một Chủ doanh nghiệp đang hoạt động.')`);
  const notes = await shot('TC14', [
    { el: `toast('Tổ chức phải còn ít nhất một Chủ doanh nghiệp')`, label: 'Toast lỗi 409', note: '"The organization must keep at least one active Owner." được dịch sang tiếng Việt' },
  ]);
  await page.click(`button('Hủy')`);
  return { actual: 'Hiện toast "Tổ chức phải còn ít nhất một Chủ doanh nghiệp đang hoạt động."', notes };
});

// ───────────────────────────── OW-06/07 Phòng ban ─────────────────────────────
await tc({
  id: 'TC15', screen: 'OW-06 Phòng ban', title: 'Tạo phòng ban con có mô tả', role: 'OWNER (hr@)', url: '/enterprise/departments → Tạo phòng ban',
  precondition: 'Phòng ban OPS (Operations) có sẵn', steps: ['Bấm "Tạo phòng ban"', 'Mã QA, tên "Kiểm thử chất lượng", mô tả, cấp trên Operations', 'Bấm "Lưu"'],
  expected: 'POST /departments thành công; phòng ban QA xuất hiện trong danh sách, trực thuộc Operations.',
}, async () => {
  await open('/enterprise/departments', `row('OPS')`);
  await page.click(`button('Tạo phòng ban')`);
  await page.type(`document.querySelector('input[placeholder="Ví dụ: ENG"]')`, 'QA');
  await page.type(`document.querySelector('input[placeholder="Ví dụ: Kỹ thuật"]')`, 'Kiểm thử chất lượng');
  await page.type(`byLabel('Mô tả', dialog())`, 'Đảm bảo chất lượng sản phẩm');
  await page.selectText(`byLabel('Phòng ban cấp trên', dialog())`, 'Operations');
  await page.click(`button('Lưu')`);
  await page.waitFor(`toast('Đã tạo phòng ban') && row('QA')`);
  const notes = await shot('TC15', [
    { el: `toast('Đã tạo phòng ban')`, label: 'Toast', note: 'Tạo thành công' },
    { el: `row('Kiểm thử chất lượng')`, label: 'Phòng ban mới', note: 'QA trực thuộc Operations' },
  ]);
  return { actual: 'Tạo được phòng ban QA trực thuộc Operations.', notes };
});

await tc({
  id: 'TC16', screen: 'OW-13 Phân quyền', title: 'Phân công phòng ban cho Quản lý', role: 'OWNER (hr@)', url: '/enterprise/access → Phân công Quản lý phòng ban',
  precondition: 'manager@ đang quản lý OPS; đã có QA (TC15)', steps: ['Mở tab "Phân công Quản lý phòng ban"', 'Ở Department Manager bấm "Phân công phòng ban"', 'Kiểm tra OPS đã được tích sẵn, tích thêm "Kiểm thử chất lượng"', 'Bấm "Lưu phân công"'],
  expected: 'Modal tích sẵn phòng ban đang quản lý (OPS); lưu xong tab hiện 2 phòng ban OPS và QA cho Department Manager.',
}, async () => {
  await open('/enterprise/access', `byText('[role=tab]', 'Phân công Quản lý phòng ban')`);
  await page.click(`byText('[role=tab]', 'Phân công Quản lý phòng ban')`);
  await page.waitFor(`row('manager@digitalent.ai')`);
  await page.click(`${memberRow('manager@digitalent.ai')}.querySelector('button')`);
  await page.waitFor(`dialog() && byText('label', 'Operations') && byText('label', 'Operations').querySelector('input').checked`);
  await page.click(`byText('label', 'Kiểm thử chất lượng').querySelector('input')`);
  const notesDialog = await shot('TC16a', [
    { el: `byText('label', 'Operations')`, label: 'OPS tích sẵn', note: 'Trạng thái ban đầu lấy theo danh sách phòng ban đã tải (sửa lỗi state khởi tạo rỗng)' },
    { el: `byText('label', 'Kiểm thử chất lượng')`, label: 'QA', note: 'Tích thêm phòng ban mới' },
  ]);
  await page.click(`button('Lưu phân công')`);
  await page.waitFor(`toast('Đã cập nhật phạm vi quản lý')`);
  await page.waitFor(`norm(${memberRow('manager@digitalent.ai')}.textContent).includes('(QA)') && norm(${memberRow('manager@digitalent.ai')}.textContent).includes('(OPS)')`);
  const notes = await shot('TC16', [
    { el: `toast('Đã cập nhật phạm vi quản lý')`, label: 'Toast', note: 'Lưu phân công thành công' },
    { el: memberRow('manager@digitalent.ai'), label: 'Phạm vi quản lý', note: 'Department Manager quản lý OPS và QA' },
  ]);
  return { actual: 'Modal tích sẵn OPS; sau khi lưu, Department Manager quản lý OPS và QA.', notes: [...notesDialog.map((n) => `[Ảnh TC16a] ${n}`), ...notes], extraImages: ['TC16a'] };
});

await tc({
  id: 'TC17', screen: 'OW-07 Chi tiết phòng ban', title: 'Gán quản lý không làm mất phòng ban cấp trên và mô tả', role: 'OWNER (hr@)', url: '/enterprise/departments/{id QA}',
  precondition: 'Đã chạy TC16 (PUT /departments/{id} khi gán quản lý)', steps: ['Mở Phòng ban > Kiểm thử chất lượng'],
  expected: 'Quản lý = Department Manager; Phòng ban cấp trên vẫn là Operations; Mô tả vẫn giữ nguyên (trước đây bị xóa vì PUT thay toàn bộ).',
}, async () => {
  await open('/enterprise/departments', `row('Kiểm thử chất lượng')`);
  await page.click(`row('Kiểm thử chất lượng').querySelector('td')`);
  await page.waitFor(`dd('Mô tả') && norm(dd('Quản lý (Manager)').textContent) === 'Department Manager' && byText('section span', 'G1 · Cấp Tác nghiệp / Chuyên viên')`);
  const parent = await page.eval(`norm(dd('Phòng ban cấp trên').textContent)`);
  const description = await page.eval(`norm(dd('Mô tả').textContent)`);
  if (parent !== 'Operations' || description !== 'Đảm bảo chất lượng sản phẩm') throw new Error(`parent=${parent}, description=${description}`);
  const notes = await shot('TC17', [
    { el: `dd('Quản lý (Manager)').parentElement`, label: 'Quản lý', note: 'Department Manager (vừa gán ở TC16)' },
    { el: `dd('Phòng ban cấp trên').parentElement`, label: 'Cấp trên', note: 'Vẫn là Operations' },
    { el: `dd('Mô tả').parentElement`, label: 'Mô tả', note: 'Vẫn giữ nguyên' },
    { el: `byText('section', 'Cơ cấu Cấp bậc')`, label: 'Cấp bậc', note: 'Tên cấp bậc theo tổ chức từ GET /job-grades (trước đây ghi cứng "G1 - Nhân viên"…)' },
  ]);
  return { actual: 'Quản lý Department Manager; cấp trên Operations và mô tả giữ nguyên.', notes };
});

await tc({
  id: 'TC18', screen: 'OW-06 Phòng ban', title: 'Sửa phòng ban từ danh sách: form tải đủ dữ liệu', role: 'OWNER (hr@)', url: '/enterprise/departments → Sửa',
  precondition: 'Danh sách phòng ban không trả mô tả', steps: ['Ở dòng "Kiểm thử chất lượng" bấm biểu tượng Sửa'],
  expected: 'Form tải GET /departments/{id}: mô tả, người quản lý, phòng ban cấp trên điền sẵn (lưu sẽ không xóa mô tả).',
}, async () => {
  await open('/enterprise/departments', `row('Kiểm thử chất lượng')`);
  await page.click(`row('Kiểm thử chất lượng').querySelector('button[title="Sửa"]')`);
  await page.waitFor(`byLabel('Mô tả', dialog()) && byLabel('Mô tả', dialog()).value === 'Đảm bảo chất lượng sản phẩm'`);
  const manager = await page.eval(`(() => { const s = byLabel('Người quản lý (Manager)', dialog()); return s.options[s.selectedIndex].textContent; })()`);
  if (!manager.includes('Department Manager')) throw new Error(`manager select shows ${manager}`);
  const notes = await shot('TC18', [
    { el: `byLabel('Mô tả', dialog())`, label: 'Mô tả', note: 'Điền sẵn từ GET /departments/{id}' },
    { el: `byLabel('Người quản lý (Manager)', dialog())`, label: 'Quản lý', note: 'Department Manager; danh sách chỉ gồm thành viên có hồ sơ nhân viên' },
    { el: `byLabel('Phòng ban cấp trên', dialog())`, label: 'Cấp trên', note: 'Operations' },
  ]);
  await page.click(`button('Hủy')`);
  return { actual: 'Form điền sẵn mô tả, quản lý Department Manager, cấp trên Operations.', notes };
});

// ─────────────────────────── OW-09 Vị trí, OW-12 Cấp bậc ───────────────────────────
await tc({
  id: 'TC19', screen: 'OW-09 Vị trí công việc', title: 'Sửa vị trí: gán phòng ban, cấp bậc và mô tả', role: 'OWNER (hr@)', url: '/enterprise/positions → Sửa ACCOUNTANT',
  precondition: 'ACCOUNTANT chưa có phòng ban, cấp bậc, mô tả', steps: ['Ở dòng ACCOUNTANT bấm Sửa', 'Phòng ban Operations, Cấp bậc G1, mô tả "Hạch toán và báo cáo tài chính"', 'Bấm "Lưu"'],
  expected: 'PUT /job-positions/{id} gửi jobGrade; danh sách hiện Phòng ban Operations và cột Cấp bậc "Cấp Tác nghiệp / Chuyên viên G1".',
}, async () => {
  await open('/enterprise/positions', `row('ACCOUNTANT')`);
  await page.click(`row('ACCOUNTANT').querySelector('button[title="Sửa"]')`);
  await page.waitFor(`byLabel('Cấp bậc', dialog())`);
  await page.selectText(`byLabel('Phòng ban', dialog())`, 'Operations');
  await page.select(`byLabel('Cấp bậc', dialog())`, 'G1');
  await page.type(`byLabel('Mô tả', dialog())`, 'Hạch toán và báo cáo tài chính');
  const notesDialog = await shot('TC19a', [
    { el: `byLabel('Cấp bậc', dialog())`, label: 'Cấp bậc', note: 'Trường mới: nhãn lấy tên cấp bậc của tổ chức từ GET /job-grades' },
  ]);
  await page.click(`button('Lưu')`);
  await page.waitFor(`toast('Đã cập nhật vị trí công việc') && norm(row('ACCOUNTANT').textContent).includes('Cấp Tác nghiệp / Chuyên viên')`);
  const notes = await shot('TC19', [
    { el: `toast('Đã cập nhật vị trí công việc')`, label: 'Toast', note: 'Cập nhật thành công' },
    { el: `row('ACCOUNTANT')`, label: 'ACCOUNTANT', note: 'Phòng ban Operations, cấp bậc "Cấp Tác nghiệp / Chuyên viên G1", mô tả hiển thị dưới tên' },
  ]);
  return { actual: 'ACCOUNTANT hiển thị Operations và cấp bậc G1 với tên của tổ chức.', notes: [...notesDialog.map((n) => `[Ảnh TC19a] ${n}`), ...notes], extraImages: ['TC19a'] };
});

await tc({
  id: 'TC20', screen: 'OW-09 Vị trí công việc', title: 'Mở lại form sửa: giữ mô tả, phòng ban, cấp bậc', role: 'OWNER (hr@)', url: '/enterprise/positions → Sửa ACCOUNTANT',
  precondition: 'Đã chạy TC19', steps: ['Ở dòng ACCOUNTANT bấm Sửa lần nữa'],
  expected: 'Form điền sẵn mô tả, phòng ban, cấp bậc hiện có (trước đây mô tả để trống và không có cấp bậc → PUT xóa dữ liệu).',
}, async () => {
  await page.click(`row('ACCOUNTANT').querySelector('button[title="Sửa"]')`);
  await page.waitFor(`byLabel('Mô tả', dialog()) && byLabel('Mô tả', dialog()).value === 'Hạch toán và báo cáo tài chính' && byLabel('Cấp bậc', dialog()).value === 'G1'`);
  const notes = await shot('TC20', [
    { el: `byLabel('Phòng ban', dialog())`, label: 'Phòng ban', note: 'Operations' },
    { el: `byLabel('Cấp bậc', dialog())`, label: 'Cấp bậc', note: 'G1 giữ nguyên' },
    { el: `byLabel('Mô tả', dialog())`, label: 'Mô tả', note: 'Giữ nguyên' },
  ]);
  await page.click(`button('Hủy')`);
  return { actual: 'Form điền sẵn Operations, G1 và mô tả.', notes };
});

await tc({
  id: 'TC21', screen: 'OW-09 Vị trí công việc', title: 'Lọc vị trí theo Cấp bậc', role: 'OWNER (hr@)', url: '/enterprise/positions?jobGrade=G1',
  precondition: 'Chỉ ACCOUNTANT có cấp bậc G1', steps: ['Chọn bộ lọc "Lọc theo Cấp bậc" = G1'],
  expected: 'GET /job-positions?…jobGrade=G1; bảng chỉ còn ACCOUNTANT.',
}, async () => {
  await page.selectText(`byLabel('Lọc theo Cấp bậc')`, 'G1');
  await page.waitFor(`document.querySelectorAll('tbody tr').length === 1 && row('ACCOUNTANT')`);
  const notes = await shot('TC21', [
    { el: `byLabel('Lọc theo Cấp bậc')`, label: 'Bộ lọc', note: 'Bộ lọc mới, gửi jobGrade=G1' },
    { el: `document.querySelector('tbody')`, label: 'Kết quả', note: 'Chỉ còn ACCOUNTANT' },
  ]);
  return { actual: 'Chỉ còn 1 dòng ACCOUNTANT.', notes };
});

await tc({
  id: 'TC22', screen: 'OW-12 Cấu hình cấp bậc', title: 'Đổi tên cấp bậc G1, tên mới hiện ở danh sách vị trí', role: 'OWNER (hr@)', url: '/enterprise/positions/grades',
  precondition: 'Màn OW-12 vào bằng URL (sitemap đánh dấu "Đã bỏ")', steps: ['Mở /enterprise/positions/grades', 'Ở thẻ G1 bấm sửa, đổi tên "Chuyên viên kế toán"', 'Bấm "Lưu thay đổi"', 'Mở lại Vị trí công việc'],
  expected: 'PUT /job-grades/G1 thành công; cột Cấp bậc của ACCOUNTANT hiện tên mới (cache vị trí được làm mới).',
}, async () => {
  await open('/enterprise/positions/grades', `byText('h3', 'Cấp Tác nghiệp / Chuyên viên')`);
  await page.click(`byText('h3', 'Cấp Tác nghiệp / Chuyên viên').closest('div.flex.flex-col').querySelector('button')`);
  await page.waitFor(`dialog()`);
  await page.type(`byLabel('Tên hiển thị *', dialog())`, 'Chuyên viên kế toán');
  await page.click(`button('Lưu thay đổi')`);
  await page.waitFor(`toast('Đã cập nhật Cấp bậc G1') && byText('h3', 'Chuyên viên kế toán')`);
  const notesGrade = await shot('TC22a', [
    { el: `toast('Đã cập nhật Cấp bậc G1')`, label: 'Toast', note: 'Cập nhật thành công' },
    { el: `byText('h3', 'Chuyên viên kế toán').closest('div.flex.flex-col')`, label: 'Thẻ G1', note: 'Tên mới, số vị trí áp dụng = 1' },
  ]);
  await open('/enterprise/positions', `row('ACCOUNTANT') && norm(row('ACCOUNTANT').textContent).includes('Chuyên viên kế toán')`);
  const notes = await shot('TC22', [
    { el: `row('ACCOUNTANT')`, label: 'ACCOUNTANT', note: 'Cột Cấp bậc hiện tên mới "Chuyên viên kế toán G1"' },
  ]);
  return { actual: 'Tên G1 đổi thành "Chuyên viên kế toán" và hiện ở danh sách vị trí.', notes: [...notesGrade.map((n) => `[Ảnh TC22a] ${n}`), ...notes], extraImages: ['TC22a'] };
});

await tc({
  id: 'TC23', screen: 'OW-07 Chi tiết phòng ban', title: 'Phân bố cấp bậc của phòng ban sau khi gán cấp bậc cho vị trí', role: 'OWNER (hr@)', url: '/enterprise/departments/{id OPS}',
  precondition: 'ACCOUNTANT = G1 (TC19); employee@ và thành viên mới giữ vị trí Kế toán ở Operations (TC09); G1 đã đổi tên (TC22)', steps: ['Mở Phòng ban > Operations'],
  expected: 'Khối "Cơ cấu Cấp bậc" đếm 2 nhân sự G1 và hiển thị tên G1 mới "Chuyên viên kế toán" (cache phòng ban được làm mới sau khi sửa vị trí/cấp bậc).',
}, async () => {
  await open('/enterprise/departments', `row('OPS')`);
  await page.click(`row('OPS').querySelector('td')`);
  await page.waitFor(`byText('section span', 'G1 · Chuyên viên kế toán') && norm(byText('section span', 'G1 · Chuyên viên kế toán').nextElementSibling.textContent) === '2'`);
  const notes = await shot('TC23', [
    { el: `byText('section span', 'G1 · Chuyên viên kế toán').parentElement`, label: 'G1', note: '2 nhân sự giữ vị trí cấp G1 (employee@ và thành viên mới), tên theo cấu hình tổ chức' },
  ]);
  return { actual: 'Operations có 2 nhân sự G1, tên cấp bậc hiển thị "Chuyên viên kế toán".', notes };
});

// ─────────────────────────────── OW-01 Tổng quan ───────────────────────────────
await tc({
  id: 'TC24', screen: 'OW-01 Tổng quan', title: 'Hoạt động gần đây hiển thị thao tác vừa làm', role: 'OWNER (hr@)', url: '/enterprise/dashboard',
  precondition: 'Đã chạy các ca trên', steps: ['Mở Tổng quan tổ chức, xem khối "Hoạt động gần đây"'],
  expected: 'recentActivity từ GET /organization/overview hiện bằng nhãn tiếng Việt (VD "Cập nhật cấp bậc"), có người thực hiện (null → "Hệ thống").',
}, async () => {
  await open('/enterprise/dashboard', `byText('section', 'Hoạt động gần đây') && byText('li', 'Cập nhật cấp bậc')`);
  const notes = await shot('TC24', [
    { el: `byText('section', 'Hoạt động gần đây')`, label: 'Hoạt động gần đây', note: '5 hoạt động mới nhất; JOB_GRADE_UPDATED hiện "Cập nhật cấp bậc"' },
  ]);
  return { actual: 'Khối hoạt động gần đây hiện các thao tác vừa làm với nhãn tiếng Việt.', notes };
});

// ───────────────────────────────── Phân quyền ─────────────────────────────────
await tc({
  id: 'TC25', screen: 'OW-02 Thành viên', title: 'Quản lý (manager@) không vào được màn Thành viên', role: 'MANAGER (manager@)', url: '/enterprise/members',
  precondition: 'manager@ là DEPARTMENT_MANAGER (không có user.read)', steps: ['Đăng nhập manager@digitalent.ai', 'Mở trực tiếp /enterprise/members'],
  expected: 'Bị chặn bởi guard vai trò/quyền (trang không có quyền), không hiện dữ liệu thành viên.',
}, async () => {
  await signIn('manager@digitalent.ai');
  await open('/enterprise/members', `!byText('p', 'Đang tải') && document.querySelector('main')`);
  await sleep(800);
  const blocked = await page.eval(`!document.querySelector('table') && /Truy cập bị từ chối|không có quyền/i.test(document.querySelector('main').textContent)`);
  if (!blocked) throw new Error('Members page is reachable for manager@');
  const notes = await shot('TC25', [
    { el: `document.querySelector('main')`, label: 'Bị chặn', note: 'Quản lý không có quyền xem danh sách thành viên của tổ chức' },
  ]);
  return { actual: 'Manager bị chặn, không thấy danh sách thành viên.', notes };
});

writeFileSync(join(OUT, '..', 'results.json'), JSON.stringify(results, null, 2));
await page.send('Browser.close').catch(() => {});
proc.kill();
console.log(`DONE ${results.filter((r) => r.status === 'PASS').length}/${results.length} PASS`);
