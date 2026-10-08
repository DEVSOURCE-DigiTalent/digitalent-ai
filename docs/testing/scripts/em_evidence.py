"""Run the EM-01..EM-18 manual test cases in a real browser and capture one screenshot per step.

Each step: the element acted on / checked is outlined in red and a yellow caption names the test case and step.
Output: <out>/shots/*.png and <out>/results.json (cases + steps with expected/actual/status) for the Excel report.
"""
import json
import os
import sys
import time
import urllib.request
from datetime import datetime

from playwright.sync_api import sync_playwright

FE = 'http://localhost:5173'
API = 'http://localhost:5000/api/v1'
OUT = sys.argv[1]
SHOTS = os.path.join(OUT, 'shots')
os.makedirs(SHOTS, exist_ok=True)
PASSWORD = 'Admin@1234'
EMPLOYEE, MANAGER = 'employee@digitalent.ai', 'manager@digitalent.ai'


def api(path, token=None, body=None):
    req = urllib.request.Request(API + path, method='POST' if body is not None else 'GET')
    req.add_header('Content-Type', 'application/json')
    if token:
        req.add_header('Authorization', f'Bearer {token}')
    with urllib.request.urlopen(req, json.dumps(body).encode() if body is not None else None) as r:
        return json.load(r)['data']


token = api('/auth/login', body={'email': EMPLOYEE, 'password': PASSWORD})['accessToken']
employee_tasks = {t['title']: t['assignmentId'] for t in api('/me/tasks', token)['items']}

# Test files for the upload steps
BAD_FILE = os.path.join(OUT, 'virus.exe')
GOOD_FILE = os.path.join(OUT, 'quy-trinh-luu-tru-hoa-don-v2.pdf')
with open(BAD_FILE, 'wb') as f:
    f.write(b'MZ not really a program')
with open(GOOD_FILE, 'wb') as f:
    f.write(b'%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Count 0>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n')

QUIZ_ANSWERS = [
    'Bật xác thực hai lớp (2FA)',
    'Thông tin sức khỏe của nhân viên',
    'Không bấm link và báo bộ phận IT',
    'Kiểm tra cơ sở cho phép chia sẻ và mã hóa file',
]


class Recorder:
    def __init__(self):
        self.cases = []
        self.page = None
        self.case = None

    def start(self, case_id, screen, name, goal, precondition, data, expected, page):
        self.page = page
        self.case = {'id': case_id, 'screen': screen, 'name': name, 'goal': goal, 'precondition': precondition,
                     'data': data, 'expected': expected, 'steps': []}
        self.cases.append(self.case)

    # ── page helpers ──
    def settle(self):
        p = self.page
        try:
            p.wait_for_load_state('networkidle', timeout=3000)  # SignalR giữ kết nối nên networkidle ít khi xảy ra
        except Exception:
            pass
        try:
            p.wait_for_function("document.querySelectorAll('.animate-pulse').length === 0", timeout=8000)
        except Exception:
            pass
        p.wait_for_timeout(500)

    def mark(self, locator, caption):
        p = self.page
        p.evaluate("""() => {
            document.querySelectorAll('[data-ev-hl]').forEach(e => { e.style.outline = ''; e.style.outlineOffset = ''; e.removeAttribute('data-ev-hl'); });
            document.getElementById('ev-caption')?.remove();
        }""")
        if locator is not None:
            try:
                locator.first.scroll_into_view_if_needed(timeout=5000)
                locator.first.evaluate("""el => { el.style.outline = '3px solid #ef4444'; el.style.outlineOffset = '3px'; el.setAttribute('data-ev-hl', '1'); }""")
            except Exception:
                pass
        p.evaluate("""text => {
            const box = document.createElement('div');
            box.id = 'ev-caption';
            box.textContent = text;
            Object.assign(box.style, { position: 'fixed', right: '16px', bottom: '16px', zIndex: '2147483647', maxWidth: '620px',
              background: '#fde047', color: '#111827', font: '600 14px Arial, sans-serif', padding: '10px 14px',
              borderRadius: '8px', boxShadow: '0 4px 14px rgba(0,0,0,.35)', border: '2px solid #ca8a04' });
            document.body.appendChild(box);
        }""", caption)

    def step(self, action, data, expected, do=None, focus=None, verify=None, before=False):
        """before=True: chụp ảnh trước khi thao tác (để thấy nút được bấm); False: thao tác rồi chụp kết quả."""
        p, case = self.page, self.case
        number = len(case['steps']) + 1
        caption = f"{case['id']} · Bước {number}: {action}"
        shot = f"{case['id']}_B{number:02d}.png"
        status, actual = 'Pass', ''
        try:
            if before:
                self.mark(focus() if focus else None, caption)
                p.screenshot(path=os.path.join(SHOTS, shot))
                if do:
                    do()
                self.settle()
            else:
                if do:
                    do()
                self.settle()
                self.mark(focus() if focus else None, caption)
                p.screenshot(path=os.path.join(SHOTS, shot))
            if verify:
                ok, actual = verify()
                status = 'Pass' if ok else 'Fail'
            else:
                actual = 'Thao tác thực hiện được.'
        except Exception as error:  # ghi lại lỗi, test case vẫn chạy tiếp
            status, actual = 'Fail', f'Lỗi: {str(error).splitlines()[0][:200]}'
            try:
                self.mark(None, caption + ' (LỖI)')
                p.screenshot(path=os.path.join(SHOTS, shot))
            except Exception:
                pass
        p.evaluate("() => document.getElementById('ev-caption')?.remove()")
        case['steps'].append({'no': number, 'action': action, 'data': data, 'expected': expected,
                              'actual': actual, 'status': status, 'shot': shot, 'url': p.url.replace(FE, '')})
        print(f"  {case['id']} B{number} [{status}] {action} → {actual}", flush=True)


def text_of(locator):
    return ' '.join(locator.first.inner_text(timeout=5000).split())[:220]


def visible(locator, timeout=8000):
    try:
        locator.first.wait_for(state='visible', timeout=timeout)
        return True
    except Exception:
        return False


def gone(locator):
    try:
        return locator.count() == 0 or not locator.first.is_visible()
    except Exception:
        return True


def toast(page, text):
    return page.locator('[data-sonner-toast]').filter(has_text=text)


R = Recorder()
started_at = datetime.now()

with sync_playwright() as pw:
    browser = pw.chromium.launch(args=['--no-sandbox'])
    context = browser.new_context(viewport={'width': 1440, 'height': 900}, locale='vi-VN',
                                  permissions=['clipboard-read', 'clipboard-write'])
    page = context.new_page()
    aside = page.locator('aside')
    main = page.locator('main')

    def nav(label, group=None):
        link = aside.get_by_role('link', name=label, exact=True)
        if group and not link.first.is_visible():
            aside.get_by_text(group, exact=True).first.click()
            page.wait_for_timeout(300)
        link.first.click()

    def nav_link(label):
        return lambda: aside.get_by_role('link', name=label, exact=True)

    def heading(name):
        return page.get_by_role('heading', name=name)

    def heading_is(name):
        return lambda: (visible(heading(name)), f"Hiển thị tiêu đề '{name}' — URL {page.url.replace(FE, '')}")

    # ── EM-01 ─────────────────────────────────────────────────────────────
    R.start('TC-EM01-01', 'EM-01 Bảng phát triển của tôi', 'Đăng nhập và xem bảng phát triển cá nhân',
            'Nhân viên thấy tổng quan năng lực, khóa học, nhiệm vụ và chứng chỉ của chính mình.',
            'Tài khoản employee@digitalent.ai đã có dữ liệu demo (3 khóa, 3 nhiệm vụ, 1 chứng chỉ).',
            f'{EMPLOYEE} / {PASSWORD}', 'Vào /enterprise/me, hiển thị 4 chỉ số và khóa đang học A4-I.', page)
    R.step('Mở trang đăng nhập', '/login', 'Hiển thị form đăng nhập',
           do=lambda: page.goto(FE + '/login'), focus=lambda: page.locator('form'),
           verify=lambda: (visible(page.locator('#email')), 'Form có ô Email, Mật khẩu và nút Đăng nhập'))
    R.step('Nhập email và mật khẩu', f'{EMPLOYEE} / {PASSWORD}', 'Hai ô được điền đúng giá trị',
           do=lambda: (page.fill('#email', EMPLOYEE), page.fill('#password', PASSWORD)), focus=lambda: page.locator('form'),
           verify=lambda: (page.input_value('#email') == EMPLOYEE, f"Email = {page.input_value('#email')}"))
    R.step("Bấm 'Đăng nhập'", '', "Chuyển đến /enterprise/me, tiêu đề 'Bảng phát triển của tôi'",
           do=lambda: (page.click('button[type=submit]'), page.wait_for_url(lambda u: '/login' not in u, timeout=30000)),
           focus=lambda: page.locator('button[type=submit]'), before=True,
           verify=heading_is('Bảng phát triển của tôi'))
    R.step('Kiểm tra 4 chỉ số tổng quan', '', 'Thấy: năng lực đạt chuẩn, mức đáp ứng chuẩn vị trí, nhiệm vụ cần làm, chứng nhận còn hiệu lực',
           focus=lambda: page.get_by_text('Năng lực đạt chuẩn').first.locator('xpath=ancestor::div[contains(@class,"grid")][1]'),
           verify=lambda: (visible(page.get_by_text('Chứng nhận còn hiệu lực')),
                           text_of(page.get_by_text('Năng lực đạt chuẩn').first.locator('xpath=ancestor::div[contains(@class,"grid")][1]'))))
    R.step('Kiểm tra khối "Khóa đào tạo của tôi"', '', 'Khóa A4-I đang học, có nút Tiếp tục học',
           focus=lambda: page.get_by_text('Khóa đào tạo của tôi').first.locator('xpath=ancestor::section[1] | ancestor::div[contains(@class,"rounded")][1]'),
           verify=lambda: (visible(main.get_by_text('A4-I').first), text_of(main.get_by_text('A4-I').first.locator('xpath=ancestor::div[2]'))))

    # ── EM-02 ─────────────────────────────────────────────────────────────
    R.start('TC-EM02-01', 'EM-02 Hồ sơ năng lực của tôi', 'Xem hồ sơ năng lực theo chuẩn vị trí',
            'Nhân viên thấy mức năng lực đã xác nhận so với mức yêu cầu của vị trí Kế toán.',
            'Đã đăng nhập bằng employee@.', '', 'Danh sách năng lực có mức hiện tại và mức yêu cầu.', page)
    R.step("Mở menu Năng lực của tôi → 'Hồ sơ năng lực'", '', 'Mở trang hồ sơ năng lực',
           do=lambda: nav('Hồ sơ năng lực', 'Năng lực của tôi'), focus=nav_link('Hồ sơ năng lực'),
           verify=heading_is('Hồ sơ năng lực của tôi'))
    R.step('Kiểm tra danh sách năng lực', '', 'Mỗi dòng có mã năng lực TT02, mức hiện tại, mức yêu cầu',
           focus=lambda: main.get_by_text('TT02-1.1').first.locator('xpath=ancestor::*[self::table or self::ul or self::div[contains(@class,"rounded-2xl")]][1]'),
           verify=lambda: (visible(main.get_by_text('TT02-1.1').first), 'Có các dòng năng lực TT02-1.1 … với mức hiện tại/yêu cầu'))

    # ── EM-03 ─────────────────────────────────────────────────────────────
    R.start('TC-EM03-01', 'EM-03 Khoảng trống năng lực', 'Xem khoảng trống năng lực và mở khóa học được gợi ý',
            'Nhân viên biết năng lực nào còn thiếu và khóa học nào giúp bù khoảng trống.',
            'Đã đăng nhập bằng employee@ (vị trí Kế toán).', '', 'Các năng lực thiếu có mức độ và gợi ý khóa học; bấm gợi ý mở đúng khóa.', page)
    R.step("Mở menu 'Khoảng trống năng lực'", '', 'Hiển thị tổng hợp khoảng trống',
           do=lambda: nav('Khoảng trống năng lực', 'Năng lực của tôi'), focus=nav_link('Khoảng trống năng lực'),
           verify=lambda: (visible(page.get_by_role('heading', name='Khoảng trống năng lực của tôi (Skill Gap)')), 'Hiển thị tiêu đề Khoảng trống năng lực của tôi (Skill Gap)'))
    first_suggestion = lambda: main.locator('a[href^="/enterprise/me/courses/"]')
    R.step('Kiểm tra khóa học gợi ý cho năng lực còn thiếu', '', 'Năng lực thiếu có khóa học gợi ý (mức cao hơn mức hiện tại)',
           focus=first_suggestion, verify=lambda: (visible(first_suggestion()), f"Gợi ý: {text_of(first_suggestion())}"))
    R.step('Bấm vào khóa học được gợi ý', '', 'Mở trang chi tiết khóa học tương ứng',
           do=lambda: first_suggestion().first.click(), focus=first_suggestion, before=True,
           verify=lambda: ('/enterprise/me/courses/' in page.url and visible(page.locator('h1')), f"Mở {page.url.replace(FE, '')} — {text_of(page.locator('h1'))}"))

    # ── EM-04 ─────────────────────────────────────────────────────────────
    R.start('TC-EM04-01', 'EM-04 Dòng thời gian minh chứng', 'Lọc dòng thời gian minh chứng theo trạng thái',
            'Nhân viên xem lại các bài nộp, phản hồi và lọc theo trạng thái duyệt.',
            'Đã đăng nhập bằng employee@; có 1 bài cần chỉnh sửa và 1 bài đã duyệt.', 'Tab "Cần chỉnh sửa"',
            'Chỉ còn minh chứng cần chỉnh sửa.', page)
    R.step("Mở menu 'Dòng thời gian minh chứng'", '', 'Hiển thị toàn bộ minh chứng mới nhất trước',
           do=lambda: nav('Dòng thời gian minh chứng', 'Năng lực của tôi'), focus=nav_link('Dòng thời gian minh chứng'),
           verify=heading_is('Dòng thời gian minh chứng'))
    needs_tab = lambda: main.get_by_role('button', name='Cần chỉnh sửa')
    R.step("Bấm tab 'Cần chỉnh sửa'", 'Tab Cần chỉnh sửa', 'Chỉ còn bài "Chuẩn hóa quy trình lưu trữ hóa đơn điện tử"',
           do=lambda: needs_tab().first.click(), focus=needs_tab, before=True,
           verify=lambda: (visible(main.get_by_text('Chuẩn hóa quy trình lưu trữ hóa đơn điện tử'))
                           and gone(main.get_by_text('Lập báo cáo đối chiếu công nợ có kiểm tra dữ liệu')),
                           'Chỉ hiện bài cần chỉnh sửa; bài đã duyệt bị ẩn'))

    # ── EM-05 ─────────────────────────────────────────────────────────────
    R.start('TC-EM05-01', 'EM-05 Lộ trình học tập', 'Ghi danh khóa học được đề xuất trong lộ trình',
            'Nhân viên tự ghi danh khóa học được gợi ý để bù khoảng trống năng lực.',
            'Đã đăng nhập bằng employee@; lộ trình có khóa được đề xuất chưa ghi danh.', 'Khóa đề xuất đầu tiên',
            'Ghi danh thành công và mở trang chi tiết khóa học.', page)
    R.step("Mở menu Học tập → 'Lộ trình của tôi'", '', 'Hiển thị các chặng: đã hoàn thành, đang học, được đề xuất',
           do=lambda: nav('Lộ trình của tôi', 'Học tập'), focus=nav_link('Lộ trình của tôi'),
           verify=heading_is('Lộ trình học tập của tôi'))
    enroll_btn = lambda: main.get_by_role('button', name='Ghi danh & bắt đầu học').and_(main.locator('button:not([disabled])'))
    R.step('Xem lý do khóa học được đề xuất', '', 'Mỗi khóa đề xuất có lý do (năng lực nào được bù) và điều kiện tiên quyết',
           focus=lambda: enroll_btn().first.locator('xpath=ancestor::li[1]'),
           verify=lambda: (visible(main.get_by_text('Gợi ý để bù khoảng trống năng lực').first), text_of(main.get_by_text('Gợi ý để bù khoảng trống năng lực').first)))
    R.step("Bấm 'Ghi danh & bắt đầu học'", '', 'Thông báo đã ghi danh, mở trang chi tiết khóa học',
           do=lambda: enroll_btn().first.click(), focus=enroll_btn, before=True,
           verify=lambda: ('/enterprise/me/courses/' in page.url, f"Mở {page.url.replace(FE, '')} — {text_of(page.locator('h1'))}"))

    # ── EM-06 ─────────────────────────────────────────────────────────────
    R.start('TC-EM06-01', 'EM-06 Khóa học của tôi', 'Tìm kiếm và lọc khóa học của tôi',
            'Nhân viên tìm nhanh khóa học theo mã/tên và lọc theo trạng thái.',
            'Đã đăng nhập bằng employee@.', 'Từ khóa "A1"; tab "Đã xong"', 'Danh sách lọc đúng theo từ khóa và trạng thái.', page)
    R.step("Mở menu Học tập → 'Khóa học của tôi'", '', 'Hiển thị các khóa đã ghi danh',
           do=lambda: nav('Khóa học của tôi', 'Học tập'), focus=nav_link('Khóa học của tôi'),
           verify=heading_is('Khóa học của tôi'))
    search = lambda: page.get_by_label('Tìm khóa học')
    R.step('Gõ "A1" vào ô tìm kiếm', 'A1', 'Chỉ còn khóa A1-I "Chiến lược tìm kiếm và quản lý thông tin"',
           do=lambda: search().fill('A1'), focus=search,
           verify=lambda: (visible(main.get_by_text('Chiến lược tìm kiếm và quản lý thông tin')) and gone(main.get_by_text('An toàn thông tin trong công việc')),
                           'Chỉ còn khóa A1-I'))
    done_tab = lambda: main.get_by_role('button', name='Đã xong')
    R.step("Xóa từ khóa, bấm tab 'Đã xong'", 'Tab Đã xong', 'Chỉ còn khóa A2-F đã hoàn thành',
           do=lambda: (search().fill(''), done_tab().first.click()), focus=done_tab,
           verify=lambda: (visible(main.get_by_text('Giao tiếp số cơ bản nơi công sở')), 'Hiện khóa A2-F đã hoàn thành'))

    # ── EM-07 ─────────────────────────────────────────────────────────────
    R.start('TC-EM07-01', 'EM-07 Chi tiết khóa học', 'Xem chi tiết khóa học đang học',
            'Nhân viên xem tiến độ, danh sách bài và trạng thái bài đánh giá của khóa.',
            'Đã đăng nhập bằng employee@; khóa A4-I đang học.', 'Khóa A4-I', 'Thấy tiến độ, bài đã/chưa học, bài cuối khóa chưa mở.', page)
    all_tab = lambda: main.get_by_role('button', name='Tất cả')
    R.step("Bấm tab 'Tất cả'", '', 'Hiện lại toàn bộ khóa học, gồm khóa A4-I đang học',
           do=lambda: all_tab().first.click(), focus=all_tab,
           verify=lambda: (visible(main.get_by_text('An toàn thông tin trong công việc')), 'Hiện khóa A4-I đang học 25%'))
    learn_link = lambda: main.get_by_role('link', name='Học tiếp')
    R.step("Bấm 'Học tiếp' trên thẻ khóa A4-I", 'A4-I', 'Mở trang chi tiết khóa A4-I',
           do=lambda: learn_link().first.click(), focus=learn_link, before=True,
           verify=lambda: (visible(page.get_by_role('heading', name='An toàn thông tin trong công việc')), f"Mở {page.url.replace(FE, '')}"))
    R.step('Kiểm tra tiến độ và danh sách bài học', '', 'Thanh tiến độ và bài đã học / chưa học',
           focus=lambda: page.get_by_role('heading', name='Nội dung chương trình đào tạo').locator('xpath=..'),
           verify=lambda: (visible(page.get_by_text('Tiến độ (').first), text_of(page.get_by_text('Tiến độ (').first)))
    R.step('Kiểm tra bài đánh giá cuối khóa', '', 'Bài cuối khóa ở trạng thái "Chưa mở" cho tới khi học xong',
           focus=lambda: page.get_by_role('heading', name='Bài đánh giá của khóa học').locator('xpath=..'),
           verify=lambda: (visible(page.get_by_role('heading', name='Bài đánh giá của khóa học')),
                           text_of(page.get_by_role('heading', name='Bài đánh giá của khóa học').locator('xpath=..'))))

    # ── EM-08 ─────────────────────────────────────────────────────────────
    R.start('TC-EM08-01', 'EM-08 Nội dung bài học', 'Học bài tiếp theo và đánh dấu hoàn thành',
            'Nhân viên mở bài tiếp theo, đọc nội dung và ghi nhận hoàn thành.',
            'Đang ở trang chi tiết khóa A4-I.', '', 'Bài được ghi nhận hoàn thành và chuyển sang bài tiếp theo.', page)
    continue_link = lambda: page.get_by_role('link', name='Tiếp tục bài học')
    R.step("Bấm 'Tiếp tục bài học'", '', "Mở bài 'Mật khẩu mạnh và xác thực hai lớp'",
           do=lambda: continue_link().first.click(), focus=continue_link, before=True,
           verify=heading_is('Mật khẩu mạnh và xác thực hai lớp'))
    R.step('Xem nội dung và vị trí bài trong khóa', '', 'Hiện "Bài x/y · Khóa n%" và nội dung bài',
           focus=lambda: page.get_by_text('Bài ', exact=False).filter(has_text='· Khóa'),
           verify=lambda: (visible(page.get_by_text('· Khóa').first), text_of(page.get_by_text('· Khóa').first)))
    complete_btn = lambda: page.get_by_role('button', name='Hoàn thành & sang bài tiếp theo')
    R.step("Bấm 'Hoàn thành & sang bài tiếp theo'", '', "Thông báo 'Đã ghi nhận hoàn thành bài học!' và mở bài kế tiếp",
           do=lambda: complete_btn().first.click(), focus=complete_btn, before=True,
           verify=lambda: (visible(heading('Nguyên tắc xử lý dữ liệu cá nhân')), f"Đã chuyển sang bài: {text_of(page.locator('h1'))}"))

    exit_ctl = lambda: page.get_by_role('button', name='Thoát').or_(page.get_by_role('link', name='Thoát'))
    R.step("Bấm 'Thoát' để rời chế độ học tập trung", '', 'Quay về giao diện có menu bên trái',
           do=lambda: exit_ctl().first.click(), focus=exit_ctl, before=True,
           verify=lambda: (visible(aside), f"Quay về {page.url.replace(FE, '')}"))

    # ── EM-09 ─────────────────────────────────────────────────────────────
    R.start('TC-EM09-01', 'EM-09 Danh sách bài đánh giá', 'Xem và lọc danh sách bài đánh giá',
            'Nhân viên thấy bài nào làm được, bài nào đã đạt, bài nào chưa mở.',
            'Đã đăng nhập bằng employee@.', 'Tab "Có thể làm"', 'Tab lọc đúng; bài kiểm tra nhanh A4-I có thể làm.', page)
    R.step("Mở menu 'Đánh giá'", '', 'Hiển thị danh sách bài đánh giá và số lượng theo trạng thái',
           do=lambda: nav('Đánh giá'), focus=nav_link('Đánh giá'),
           verify=heading_is('Danh sách bài đánh giá năng lực'))
    avail_tab = lambda: main.get_by_role('button', name='Có thể làm')
    R.step("Bấm tab 'Có thể làm'", '', "Hiện 'Kiểm tra nhanh: An toàn thông tin'",
           do=lambda: avail_tab().first.click(), focus=avail_tab,
           verify=lambda: (visible(main.get_by_text('Kiểm tra nhanh: An toàn thông tin')), 'Hiện bài kiểm tra nhanh A4-I'))

    # ── EM-10 ─────────────────────────────────────────────────────────────
    R.start('TC-EM10-01', 'EM-10 Giới thiệu bài đánh giá', 'Xem giới thiệu và quy chế bài kiểm tra',
            'Trước khi làm bài, nhân viên biết số câu, điểm đạt, số lượt và quy chế.',
            'Bài kiểm tra nhanh A4-I đang ở trạng thái Có thể làm.', '', 'Hiện thông tin bài và quy chế; nút Bắt đầu làm bài bật.', page)
    start_link = lambda: main.get_by_role('link', name='Vào làm bài')
    R.step("Bấm 'Vào làm bài' ở bài kiểm tra nhanh", '', 'Mở trang giới thiệu bài',
           do=lambda: start_link().first.click(), focus=start_link, before=True,
           verify=heading_is('Kiểm tra nhanh: An toàn thông tin'))
    R.step('Đọc quy chế làm bài', '', 'Có quy chế: tự lưu, đếm ngược theo server, xem đáp án khi đạt/hết lượt',
           focus=lambda: page.get_by_role('heading', name='Quy chế làm bài:').locator('xpath=..'),
           verify=lambda: (page.get_by_role('button', name='Bắt đầu làm bài').is_enabled(), 'Quy chế hiển thị; nút Bắt đầu làm bài đang bật'))

    # ── EM-11 ─────────────────────────────────────────────────────────────
    R.start('TC-EM11-01', 'EM-11 Làm bài đánh giá', 'Làm bài: tự lưu, tải lại trang vẫn giữ đáp án, nộp bài',
            'Đáp án được lưu trên server; mất kết nối/tải lại vẫn làm tiếp đúng lượt; nộp bài có xác nhận.',
            'Đang ở trang giới thiệu bài kiểm tra nhanh A4-I.', 'Đáp án đúng 4/4 câu', 'Đáp án tự lưu, khôi phục sau khi tải lại, nộp thành công.', page)
    begin_btn = lambda: page.get_by_role('button', name='Bắt đầu làm bài')
    R.step("Bấm 'Bắt đầu làm bài'", '', 'Mở trang làm bài, câu 1/4',
           do=lambda: begin_btn().first.click(), focus=begin_btn, before=True,
           verify=lambda: ('attempt=' in page.url and visible(page.get_by_text('Câu hỏi 1 / 4')), f"URL {page.url.replace(FE, '')}"))
    option = lambda text: page.get_by_role('radio', name=text)
    R.step('Chọn đáp án câu 1 và chờ tự lưu', QUIZ_ANSWERS[0], "Đáp án được chọn, hiện 'Đã lưu'",
           do=lambda: (option(QUIZ_ANSWERS[0]).first.click(), page.get_by_text('Đã lưu').first.wait_for(timeout=10000)),
           focus=lambda: page.get_by_text('Đã lưu'),
           verify=lambda: (visible(page.get_by_text('Đã lưu')), 'Hiện trạng thái "Đã lưu" sau khi chọn'))
    R.step('Tải lại trang (F5) giữa chừng', '', 'Đáp án câu 1 vẫn được chọn (khôi phục từ server)',
           do=lambda: page.reload(), focus=lambda: option(QUIZ_ANSWERS[0]),
           verify=lambda: (option(QUIZ_ANSWERS[0]).first.get_attribute('aria-checked') == 'true', 'Sau khi tải lại, câu 1 vẫn chọn "Bật xác thực hai lớp (2FA)"'))

    def answer_rest():
        for answer in QUIZ_ANSWERS[1:]:
            page.get_by_role('button', name='Câu tiếp').first.click()
            page.wait_for_timeout(250)
            option(answer).first.click()
            page.wait_for_timeout(250)
        page.get_by_text('Đã lưu').first.wait_for(timeout=10000)
    R.step('Trả lời câu 2 → 4', '; '.join(QUIZ_ANSWERS[1:]), 'Bảng câu hỏi báo "Đã làm: 4 / 4 câu"',
           do=answer_rest, focus=lambda: page.get_by_role('heading', name='Danh sách câu hỏi').locator('xpath=..'),
           verify=lambda: (visible(page.get_by_text('/ 4 câu').filter(has_text='4')), text_of(page.get_by_text('Đã làm:'))))
    submit_btn = lambda: page.get_by_role('button', name='Nộp bài', exact=True)
    R.step("Bấm 'Nộp bài'", '', 'Hộp thoại xác nhận báo đã trả lời đủ 4/4 câu',
           do=lambda: submit_btn().first.click(), focus=submit_btn, before=True,
           verify=lambda: (visible(page.get_by_text('Sẵn sàng nộp bài')), text_of(page.get_by_text('Sẵn sàng nộp bài'))))
    confirm_btn = lambda: page.get_by_role('button', name='Xác nhận nộp bài')
    R.step("Bấm 'Xác nhận nộp bài'", '', 'Bài được chấm và chuyển sang trang kết quả',
           do=lambda: (confirm_btn().first.click(), page.wait_for_url(lambda u: '/result' in u, timeout=20000)), focus=confirm_btn, before=True,
           verify=lambda: ('/result' in page.url, f"Chuyển đến {page.url.replace(FE, '')}"))

    # ── EM-12 ─────────────────────────────────────────────────────────────
    R.start('TC-EM12-01', 'EM-12 Kết quả đánh giá', 'Xem kết quả và đáp án sau khi đạt',
            'Nhân viên thấy điểm, kết quả đạt/chưa đạt và đáp án (khi đã đạt).',
            'Vừa nộp bài kiểm tra nhanh A4-I với 4/4 câu đúng.', '', 'Đạt 100%, hiện đáp án đúng và giải thích.', page)
    R.step('Kiểm tra kết quả tổng', '', "Thông báo 'Chúc mừng bạn đã đạt bài đánh giá!' và điểm 100%",
           focus=lambda: page.get_by_role('heading', name='Chúc mừng bạn đã đạt bài đánh giá!').locator('xpath=ancestor::div[2]'),
           verify=lambda: (visible(heading('Chúc mừng bạn đã đạt bài đánh giá!')) and visible(page.get_by_text('100%').first), 'Đạt — 100%, 4/4 câu đúng'))
    first_question = lambda: main.locator('button[aria-expanded]')
    R.step('Bấm vào câu hỏi 1 để xem lại', '', 'Câu hỏi mở ra, hiện đáp án đúng và lời giải (vì đã đạt bài)',
           do=lambda: first_question().first.click(), focus=lambda: first_question().first.locator('xpath=..'),
           verify=lambda: (visible(page.get_by_text('Đáp án đúng').first), text_of(first_question().first.locator('xpath=..'))))

    # ── EM-13 ─────────────────────────────────────────────────────────────
    R.start('TC-EM13-01', 'EM-13 Lịch sử đánh giá', 'Xem lịch sử và lọc các lần làm bài đạt',
            'Nhân viên xem lại mọi lần làm bài và lọc theo kết quả.',
            'Đã làm ít nhất 1 lần bài đánh giá.', 'Bộ lọc "Chỉ bài đạt"', 'Danh sách chỉ còn các lần đạt, có điểm và thời gian.', page)
    history_link = lambda: main.get_by_role('link', name='Lịch sử các lần làm bài')
    R.step("Mở 'Đánh giá' → 'Lịch sử các lần làm bài'", '', 'Hiển thị bảng lịch sử',
           do=lambda: (nav('Đánh giá'), page.wait_for_timeout(500), history_link().first.click()), focus=lambda: page.locator('table'),
           verify=heading_is('Lịch sử bài đánh giá'))
    result_filter = lambda: page.get_by_label('Lọc theo kết quả')
    R.step("Chọn bộ lọc 'Chỉ bài đạt'", 'Chỉ bài đạt', 'Chỉ còn các lần làm đạt (có lần 100% vừa làm)',
           do=lambda: result_filter().select_option('true'), focus=result_filter,
           verify=lambda: (visible(main.get_by_text('Kiểm tra nhanh: An toàn thông tin').first), text_of(page.locator('table tbody tr').first)))

    # ── EM-14 ─────────────────────────────────────────────────────────────
    R.start('TC-EM14-01', 'EM-14 Nhiệm vụ của tôi', 'Xem nhiệm vụ thực tế và lọc việc cần làm',
            'Nhân viên thấy nhiệm vụ được giao, hạn nộp và trạng thái chấm.',
            'Đã đăng nhập bằng employee@; có 3 nhiệm vụ (chưa nộp, cần chỉnh sửa, đã đạt).', 'Tab "Cần làm"',
            'Tab Cần làm chỉ còn 2 nhiệm vụ chưa xong.', page)
    R.step("Mở menu 'Nhiệm vụ thực tế'", '', 'Hiển thị 3 nhiệm vụ với hạn nộp và trạng thái',
           do=lambda: nav('Nhiệm vụ thực tế'), focus=nav_link('Nhiệm vụ thực tế'),
           verify=heading_is('Nhiệm vụ thực tế của tôi'))
    todo_tab = lambda: main.get_by_role('button', name='Cần làm')
    R.step("Bấm tab 'Cần làm'", '', 'Chỉ còn nhiệm vụ chưa nộp và nhiệm vụ cần chỉnh sửa',
           do=lambda: todo_tab().first.click(), focus=todo_tab,
           verify=lambda: (visible(main.get_by_text('Rà soát quyền truy cập thư mục chứng từ kế toán'))
                           and gone(main.get_by_text('Lập báo cáo đối chiếu công nợ có kiểm tra dữ liệu')), 'Hiện 2 nhiệm vụ cần làm; nhiệm vụ đã đạt bị ẩn'))

    # ── EM-15 ─────────────────────────────────────────────────────────────
    R.start('TC-EM15-01', 'EM-15 Chi tiết nhiệm vụ', 'Xem chi tiết nhiệm vụ cần chỉnh sửa',
            'Nhân viên xem yêu cầu, tiêu chí và nhận xét của lần nộp trước.',
            'Nhiệm vụ "Chuẩn hóa quy trình lưu trữ hóa đơn điện tử" đang Cần chỉnh sửa.', '', 'Hiện yêu cầu, năng lực đánh giá và lần nộp 1 kèm nhận xét.', page)
    task_link = lambda: main.get_by_role('link', name='Chuẩn hóa quy trình lưu trữ hóa đơn điện tử')
    R.step('Bấm vào nhiệm vụ "Chuẩn hóa quy trình lưu trữ hóa đơn điện tử"', '', 'Mở trang chi tiết nhiệm vụ',
           do=lambda: task_link().first.click(), focus=task_link, before=True,
           verify=heading_is('Chuẩn hóa quy trình lưu trữ hóa đơn điện tử'))
    R.step('Xem lịch sử bài nộp và nhận xét', '', 'Lần 1 có trạng thái Cần chỉnh sửa và nhận xét của người chấm',
           focus=lambda: page.get_by_role('heading', name='Bài nộp của bạn').locator('xpath=..'),
           verify=lambda: (visible(page.get_by_text('Lần 1').first), text_of(page.get_by_text('Lần 1').first.locator('xpath=ancestor::li[1]'))))

    # ── EM-16 ─────────────────────────────────────────────────────────────
    R.start('TC-EM16-01', 'EM-16 Nộp minh chứng nhiệm vụ', 'Nộp lại minh chứng: kiểm tra dữ liệu, từ chối tệp sai định dạng, nộp thành công',
            'Hệ thống chặn dữ liệu sai và nhận bài nộp hợp lệ kèm link và tệp.',
            'Đang ở chi tiết nhiệm vụ cần chỉnh sửa.', 'Mô tả ngắn "Đã bổ sung"; tệp virus.exe; tệp quy-trinh-luu-tru-hoa-don-v2.pdf; link https://drive.example.com/hoa-don-v2',
            'Báo lỗi với dữ liệu sai; nộp hợp lệ thành công, nhiệm vụ chuyển "Đang chờ chấm".', page)
    resubmit = lambda: page.get_by_role('link', name='Nộp lại minh chứng')
    R.step("Bấm 'Nộp lại minh chứng'", '', 'Mở form nộp lại, hiện phản hồi lần trước',
           do=lambda: resubmit().first.click(), focus=resubmit, before=True,
           verify=lambda: (visible(page.get_by_text('Nộp lại minh chứng: Chuẩn hóa quy trình lưu trữ hóa đơn điện tử').first), 'Form nộp lại kèm phản hồi lần trước'))
    description = lambda: page.get_by_label('Mô tả giải pháp, quy trình và kết quả đạt được *', exact=False)
    send_btn = lambda: page.get_by_role('button', name='Gửi nộp minh chứng')
    R.step('Nhập mô tả quá ngắn rồi bấm Gửi', 'Đã bổ sung', "Báo lỗi 'Mô tả cần tối thiểu 20 ký tự.'",
           do=lambda: (description().fill('Đã bổ sung'), send_btn().first.click()), focus=lambda: page.get_by_text('Mô tả cần tối thiểu 20 ký tự.'),
           verify=lambda: (visible(page.get_by_text('Mô tả cần tối thiểu 20 ký tự.')), 'Hiện lỗi, không gửi bài'))
    file_input = lambda: page.get_by_label('Chọn tệp đính kèm')
    R.step('Chọn tệp sai định dạng virus.exe', 'virus.exe', "Báo 'Định dạng .exe không được hỗ trợ.', tệp không được tải lên",
           do=lambda: file_input().set_input_files(BAD_FILE), focus=lambda: toast(page, 'Định dạng .exe không được hỗ trợ.'),
           verify=lambda: (visible(toast(page, 'Định dạng .exe không được hỗ trợ.')), 'Hiện thông báo lỗi định dạng'))
    R.step('Nhập mô tả đầy đủ, link và tải tệp PDF', 'Mô tả ≥ 20 ký tự; link https://drive.example.com/hoa-don-v2; tệp PDF',
           'Tệp PDF xuất hiện trong danh sách tệp đính kèm',
           do=lambda: (description().fill('Đã bổ sung quy trình lưu trữ hóa đơn điện tử theo góp ý: đặt tên tệp theo mã số thuế và tháng, phân quyền xem/sửa.'),
                       page.get_by_label('Đường dẫn 1').fill('https://drive.example.com/hoa-don-v2'),
                       file_input().set_input_files(GOOD_FILE),
                       page.get_by_text('quy-trinh-luu-tru-hoa-don-v2.pdf').first.wait_for(timeout=15000)),
           focus=lambda: page.get_by_text('quy-trinh-luu-tru-hoa-don-v2.pdf'),
           verify=lambda: (visible(page.get_by_text('quy-trinh-luu-tru-hoa-don-v2.pdf')), 'Tệp đã tải lên và hiện trong danh sách'))
    R.step("Bấm 'Gửi nộp minh chứng'", '', "Thông báo nộp thành công (lần 2), nhiệm vụ chuyển 'Đang chờ chấm'",
           do=lambda: (send_btn().first.click(), page.wait_for_url(lambda u: u.rstrip('/').endswith(employee_tasks['Chuẩn hóa quy trình lưu trữ hóa đơn điện tử']), timeout=20000)),
           focus=send_btn, before=True,
           verify=lambda: (visible(page.get_by_text('Đang chờ chấm').first), f"Quay lại chi tiết nhiệm vụ, trạng thái: {text_of(page.get_by_text('Đang chờ chấm').first)}"))

    # ── EM-17 ─────────────────────────────────────────────────────────────
    R.start('TC-EM17-01', 'EM-17 Phản hồi & chỉnh sửa', 'Xem kết quả và phản hồi của nhiệm vụ đã đạt',
            'Nhân viên xem kết luận, điểm, nhận xét và kết quả theo từng năng lực.',
            'Nhiệm vụ "Lập báo cáo đối chiếu công nợ có kiểm tra dữ liệu" đã được chấm Đạt.', '', 'Hiện "Đã duyệt đạt yêu cầu", điểm 88/100 và nhận xét.', page)
    passed_task = lambda: main.get_by_role('link', name='Lập báo cáo đối chiếu công nợ có kiểm tra dữ liệu')
    R.step("Mở 'Nhiệm vụ thực tế' → tab 'Đã có kết quả'", '', 'Hiện nhiệm vụ đã có kết quả',
           do=lambda: (nav('Nhiệm vụ thực tế'), page.wait_for_timeout(400), main.get_by_role('button', name='Đã có kết quả').first.click()),
           focus=lambda: main.get_by_role('button', name='Đã có kết quả'),
           verify=lambda: (visible(passed_task()), 'Hiện nhiệm vụ đã đạt'))
    R.step('Mở nhiệm vụ đã đạt', '', 'Mở trang chi tiết nhiệm vụ',
           do=lambda: passed_task().first.click(), focus=passed_task, before=True,
           verify=heading_is('Lập báo cáo đối chiếu công nợ có kiểm tra dữ liệu'))
    feedback_link = lambda: page.get_by_role('link', name='Xem phản hồi')
    R.step("Bấm 'Xem phản hồi'", '', "Hiện 'Đã duyệt đạt yêu cầu', điểm và nhận xét",
           do=lambda: feedback_link().first.click(), focus=feedback_link, before=True,
           verify=lambda: (visible(heading('Đã duyệt đạt yêu cầu')), f"{text_of(heading('Đã duyệt đạt yêu cầu'))} — điểm {text_of(page.get_by_text('/ 100đ').first.locator('xpath=..'))}"))
    R.step('Xem nhận xét của người đánh giá', '', 'Có nhận xét chi tiết và minh chứng đã được đánh giá',
           focus=lambda: page.get_by_role('heading', name='Nhận xét của người đánh giá').locator('xpath=..'),
           verify=lambda: (visible(page.get_by_role('heading', name='Nhận xét của người đánh giá')), text_of(page.get_by_role('heading', name='Nhận xét của người đánh giá').locator('xpath=..'))))

    # ── EM-18 ─────────────────────────────────────────────────────────────
    R.start('TC-EM18-01', 'EM-18 Thành tựu & chứng nhận', 'Xem thành tựu và sao chép mã chứng chỉ',
            'Nhân viên xem chứng chỉ đã nhận, năng lực đã xác nhận và các mốc gần đây.',
            'Đã đăng nhập bằng employee@; có chứng chỉ khóa A2-F.', '', 'Hiện chứng chỉ còn hiệu lực; sao chép mã thành công.', page)
    R.step("Mở menu 'Thành tựu'", '', 'Hiện thống kê và chứng chỉ DT-…',
           do=lambda: nav('Thành tựu'), focus=nav_link('Thành tựu'),
           verify=heading_is('Chứng nhận & thành tựu của tôi'))
    copy_btn = lambda: main.get_by_role('button', name='Sao chép mã')
    R.step("Bấm 'Sao chép mã' trên chứng chỉ", '', "Thông báo 'Đã sao chép mã chứng chỉ DT-…'",
           do=lambda: copy_btn().first.click(), focus=copy_btn, before=True,
           verify=lambda: (visible(toast(page, 'Đã sao chép mã chứng chỉ')), text_of(toast(page, 'Đã sao chép mã chứng chỉ'))))
    R.step('Xem các mốc gần đây', '', 'Có mốc nhận chứng chỉ và hoàn thành khóa',
           focus=lambda: page.get_by_role('heading', name='Các mốc gần đây').locator('xpath=..'),
           verify=lambda: (visible(page.get_by_text('Nhận chứng chỉ').first), text_of(page.get_by_text('Nhận chứng chỉ').first)))

    # ── Bảo mật ───────────────────────────────────────────────────────────
    guest = browser.new_context(viewport={'width': 1440, 'height': 900}, locale='vi-VN').new_page()
    R.start('TC-SEC-01', 'Bảo mật', 'Chưa đăng nhập thì không vào được trang cá nhân',
            'Trang /enterprise/me/* yêu cầu đăng nhập.', 'Trình duyệt chưa đăng nhập.', '/enterprise/me/tasks',
            'Bị chuyển về trang đăng nhập.', guest)
    R.step('Mở thẳng /enterprise/me/tasks khi chưa đăng nhập', '/enterprise/me/tasks', 'Chuyển về /login',
           do=lambda: guest.goto(FE + '/enterprise/me/tasks'), focus=lambda: guest.locator('form'),
           verify=lambda: ('/login' in guest.url, f"URL sau khi mở: {guest.url.replace(FE, '')}"))

    manager_page = browser.new_context(viewport={'width': 1440, 'height': 900}, locale='vi-VN').new_page()
    target_task = employee_tasks['Rà soát quyền truy cập thư mục chứng từ kế toán']
    R.start('TC-SEC-02', 'Bảo mật', 'Không xem được nhiệm vụ của người khác qua URL',
            'API /me chỉ trả dữ liệu của chính người đăng nhập — kể cả Quản lý.', 'Đăng nhập bằng manager@ (không được giao nhiệm vụ này).',
            f'/enterprise/me/tasks/{target_task}', "Hiện 'Không tìm thấy nhiệm vụ'.", manager_page)
    R.step('Đăng nhập bằng manager@', f'{MANAGER} / {PASSWORD}', 'Vào không gian của quản lý',
           do=lambda: (manager_page.goto(FE + '/login'), manager_page.fill('#email', MANAGER), manager_page.fill('#password', PASSWORD),
                       manager_page.click('button[type=submit]'), manager_page.wait_for_url(lambda u: '/login' not in u, timeout=30000)),
           verify=lambda: ('/login' not in manager_page.url, f"Đăng nhập xong, URL {manager_page.url.replace(FE, '')}"))
    R.step('Mở URL nhiệm vụ của employee@', f'/enterprise/me/tasks/{target_task}', "Hiện 'Không tìm thấy nhiệm vụ', không lộ dữ liệu",
           do=lambda: manager_page.goto(FE + f'/enterprise/me/tasks/{target_task}'), focus=lambda: manager_page.get_by_text('Không tìm thấy nhiệm vụ'),
           verify=lambda: (visible(manager_page.get_by_text('Không tìm thấy nhiệm vụ')) and gone(manager_page.get_by_text('Rà soát quyền truy cập thư mục chứng từ kế toán')),
                           'Hiện thông báo không tìm thấy; không hiển thị nội dung nhiệm vụ'))

    browser.close()

for case in R.cases:
    case['status'] = 'Pass' if all(s['status'] == 'Pass' for s in case['steps']) else 'Fail'
summary = {'startedAt': started_at.isoformat(timespec='seconds'), 'finishedAt': datetime.now().isoformat(timespec='seconds'), 'cases': R.cases}
with open(os.path.join(OUT, 'results.json'), 'w', encoding='utf-8') as f:
    json.dump(summary, f, ensure_ascii=False, indent=1)
print('cases', len(R.cases), 'steps', sum(len(c['steps']) for c in R.cases),
      'failed steps', sum(1 for c in R.cases for s in c['steps'] if s['status'] != 'Pass'))
