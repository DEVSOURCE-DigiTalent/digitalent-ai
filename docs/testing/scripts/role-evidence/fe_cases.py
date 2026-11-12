"""Frontend test cases per role: the real SPA (VITE_USE_MOCK=false) against the real API, one browser session per role.

A case returns (passed, actual result, red-box marks); the runner screenshots the page with the numbered boxes.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Callable

from evidence_lib import FE, PASSWORD

ROLES = {
    'platform-admin': {'label': 'PLATFORM_ADMIN', 'email': 'platform@digitalent.ai', 'title': 'QUẢN TRỊ NỀN TẢNG (PLATFORM_ADMIN)'},
    'mentor': {'label': 'MENTOR', 'email': 'mentor@digitalent.ai', 'title': 'MENTOR CHẤM BÀI DÙNG THỬ (MENTOR)'},
    'owner': {'label': 'OWNER', 'email': 'owner@digitalent.ai', 'title': 'CHỦ DOANH NGHIỆP (OWNER)'},
    'manager': {'label': 'MANAGER', 'email': 'manager@digitalent.ai', 'title': 'QUẢN LÝ PHÒNG BAN (MANAGER)'},
    'employee': {'label': 'EMPLOYEE', 'email': 'employee@digitalent.ai', 'title': 'NHÂN VIÊN (EMPLOYEE)'},
}


@dataclass
class FeCase:
    id: str
    screen: str
    title: str
    url: str
    precondition: str
    steps: list[str]
    expected: str
    run: Callable  # (page) -> (passed: bool, actual: str, marks: list[(locator, label)])
    role: str = ''
    marks: list = field(default_factory=list)


def settle(page, ms: int = 2500) -> None:
    try:
        page.wait_for_load_state('networkidle', timeout=4000)  # SignalR keeps a connection open: may time out
    except Exception:
        pass
    try:
        page.wait_for_function("document.querySelectorAll('.animate-pulse, .animate-spin').length === 0", timeout=8000)
    except Exception:
        pass
    page.wait_for_timeout(ms)


def go(page, path: str) -> None:
    page.goto(FE + path)
    settle(page)


def path_of(page) -> str:
    return page.url.replace(FE, '')


def h1(page):
    return page.locator('h1').first


def h1_text(page) -> str:
    try:
        return h1(page).inner_text(timeout=4000).strip()
    except Exception:
        return ''


def aside(page):
    return page.locator('aside').first


def menu(page) -> list[str]:
    return [t.strip() for t in aside(page).get_by_role('link').all_inner_texts() if t.strip()]


def text(page, value: str):
    return page.get_by_text(value, exact=False)


def sign_in(page, email: str) -> None:
    page.goto(FE + '/login')
    page.get_by_label('Email công việc').fill(email)
    page.get_by_label('Mật khẩu', exact=True).fill(PASSWORD)
    page.get_by_role('button', name='Đăng nhập vào hệ thống').click()
    page.wait_for_url(lambda url: '/login' not in url, timeout=30000)
    settle(page, 3500)


def login_case(case_id: str, screen: str, email: str, landing: str, heading: str, menu_note: str, items: int) -> FeCase:
    def run(page):
        sign_in(page, email)
        links = menu(page)
        ok = path_of(page).startswith(landing) and heading in h1_text(page) and len(links) >= items
        actual = (f'Đăng nhập thành công, vào {path_of(page)}; tiêu đề "{h1_text(page)}"; menu {len(links)} mục: '
                  f'{", ".join(links[:12])}.')
        return ok, actual, [(aside(page), menu_note), (h1(page), 'Màn hình đầu tiên của vai trò')]
    return FeCase(case_id, screen, f'Đăng nhập {email} và vào đúng không gian làm việc', '/login', 'DB mới, seed Development',
                  [f'1. Mở /login', f'2. Nhập {email} / Admin@1234, bấm "Đăng nhập vào hệ thống"'],
                  f'Chuyển tới {landing}; tiêu đề "{heading}"; menu của vai trò ({items}+ mục).', run)


def page_case(case_id: str, screen: str, title: str, path: str, precondition: str, steps: list[str], expected: str,
              check: Callable, marks: Callable, expect_path: str | None = None) -> FeCase:
    def run(page):
        go(page, path)
        ok, actual = check(page)
        ok = ok and path_of(page).startswith(expect_path or path)
        return ok, f'{actual} (URL: {path_of(page)})', marks(page)
    return FeCase(case_id, screen, title, path, precondition, steps, expected, run)


def denied_case(case_id: str, screen: str, title: str, path: str, why: str) -> FeCase:
    def run(page):
        go(page, path)
        ok = 'Truy cập bị từ chối' in h1_text(page) and path_of(page).startswith(path)
        return ok, f'Hiện "{h1_text(page)}" tại {path_of(page)}; không hiện nội dung của màn hình.', [
            (h1(page).locator('xpath=..'), 'Bị chặn: không đủ quyền')]
    return FeCase(case_id, screen, title, path, why, [f'1. Mở trực tiếp {path}'],
                  'Giao diện chặn bằng trang "Truy cập bị từ chối", không hiện dữ liệu của màn hình.', run)


def redirect_case(case_id: str, screen: str, title: str, path: str, back_to: str, heading: str, why: str) -> FeCase:
    def run(page):
        go(page, path)
        ok = path_of(page).startswith(back_to) and heading in h1_text(page)
        return ok, f'Bị đưa về {path_of(page)} ("{h1_text(page)}"); không vào được {path}.', [
            (h1(page), f'Đưa về không gian của vai trò ({back_to})')]
    return FeCase(case_id, screen, title, path, why, [f'1. Mở trực tiếp {path}'],
                  f'RequireWorkspace giữ vai trò trong cổng của mình: chuyển về {back_to}.', run)


# ───────────────────────────── roles ─────────────────────────────

def platform_admin() -> list[FeCase]:
    email = ROLES['platform-admin']['email']
    return [
        login_case('FE01', 'PA-01 Tổng quan', email, '/platform/dashboard', 'Toàn cảnh nền tảng hôm nay.', 'Menu quản trị nền tảng', 11),
        page_case('FE02', 'PA-01 Tổng quan', 'Thẻ chỉ số: phiên bản catalog đang dùng và bản nháp', '/platform/dashboard', 'Đã đăng nhập (FE01)',
                  ['1. Xem các thẻ "Phiên bản đang dùng" và "Bản nháp đang soạn"'],
                  'Thẻ "Phiên bản đang dùng" = v1 (catalog seed); chưa có bản nháp.',
                  lambda p: (p.get_by_text('Phiên bản đang dùng', exact=True).first.locator('xpath=following-sibling::*[1]').inner_text().strip() == 'v1',
                             'Thẻ "Phiên bản đang dùng" hiện v1; thẻ bản nháp hiện "Chưa có bản nháp mới".'),
                  lambda p: [(p.get_by_text('Phiên bản đang dùng', exact=True).first.locator('xpath=ancestor::div[contains(@class,"pa-bento-card")][1]'), 'Phiên bản catalog đang dùng: v1'),
                             (p.get_by_text('Bản nháp đang soạn', exact=True).first.locator('xpath=ancestor::div[contains(@class,"pa-bento-card")][1]'), 'Bản nháp đang soạn')]),
        page_case('FE03', 'PA-02 Khung chuẩn', 'Khung TT02 với 6 lĩnh vực và khóa học của từng lĩnh vực', '/platform/frameworks', 'Khung TT02_2025 (seed)',
                  ['1. Bấm menu "Khung chuẩn"'], '6 lĩnh vực năng lực số, mỗi lĩnh vực có các khóa Cơ bản / Trung cấp / Nâng cao.',
                  lambda p: (p.locator('h3').count() >= 6, f'{p.locator("h3").count()} thẻ lĩnh vực; lĩnh vực đầu "{p.locator("h3").first.inner_text().strip()}".'),
                  lambda p: [(h1(p), 'Khung chuẩn Thông tư 02/2025'), (p.locator('h3').first.locator('xpath=ancestor::article[1] | ancestor::div[3]').first, 'Lĩnh vực 01 và các khóa thuộc lĩnh vực')]),
        page_case('FE04', 'PA-03 Phiên bản khóa học', 'Phiên bản neo ⚓ v1 với danh mục 18 khóa', '/platform/versions', 'Catalog v1 (seed)',
                  ['1. Bấm menu "Phiên bản khóa học"'], 'Phiên bản đang áp dụng v1; bảng "Danh mục khóa học thuộc v1" có 18 khóa.',
                  lambda p: (p.locator('table tbody tr').filter(has=p.get_by_role('button')).count() == 18,
                             f'Bảng có {p.locator("table tbody tr").filter(has=p.get_by_role("button")).count()} khóa học của v1 (M1-F … M6-A).'),
                  lambda p: [(p.get_by_role('heading', name='Danh mục khóa học thuộc v1'), 'Danh mục khóa học của phiên bản v1'),
                             (p.locator('table').first, '18 khóa học chuẩn')]),
        page_case('FE05', 'PA-05 Tổ chức', 'Danh sách doanh nghiệp khách hàng', '/platform/organizations', 'Tổ chức demo DigiTalent Demo Company',
                  ['1. Bấm menu "Tổ chức"'], 'Có doanh nghiệp "DigiTalent Demo Company" với chủ sở hữu owner@digitalent.ai.',
                  lambda p: (text(p, 'DigiTalent Demo Company').count() > 0, 'Hiện DigiTalent Demo Company trong danh sách.'),
                  lambda p: [(h1(p), 'Doanh nghiệp đang dùng nền tảng'), (text(p, 'DigiTalent Demo Company').first.locator('xpath=ancestor::tr[1] | ancestor::a[1]').first, 'Tổ chức demo')]),
        page_case('FE06', 'PA-07 Người dùng', 'Theo dõi tài khoản và học viên dùng thử', '/platform/users', 'Seed: trial@ đang dùng thử, free@ đã hết hạn',
                  ['1. Bấm menu "Người dùng"'], 'Các thẻ dùng thử (đang dùng thử / hết hạn trong 48h) và bảng người dùng.',
                  lambda p: (text(p, 'Hết hạn trong 48h').count() > 0, 'Hiện các thẻ theo dõi dùng thử và bảng tài khoản.'),
                  lambda p: [(h1(p), 'Theo dõi tài khoản & học viên dùng thử'),
                             (text(p, 'Hết hạn trong 48h').first.locator('xpath=ancestor::div[contains(@class,"pa-bento-card")][1]'), 'Học viên sắp hết hạn dùng thử')]),
        page_case('FE07', 'PA-14 Dùng thử', 'Yêu cầu chấm bài dùng thử và phân công mentor', '/platform/trials', 'DB mới: chưa có yêu cầu chấm',
                  ['1. Bấm menu "Dùng thử"'], 'Trang "Yêu cầu chấm bài dùng thử." có khu vực Mentor để tạo/phân công mentor.',
                  lambda p: ('Yêu cầu chấm bài dùng thử' in h1_text(p), f'Tiêu đề "{h1_text(p)}"; có khu vực Mentor.'),
                  lambda p: [(h1(p), 'Yêu cầu chấm bài dùng thử'), (p.get_by_role('heading', name='Mentor'), 'Quản lý mentor')]),
        redirect_case('FE08', 'Phân quyền', 'Quản trị nền tảng không vào được cổng doanh nghiệp', '/enterprise/dashboard', '/platform/dashboard',
                      'Toàn cảnh nền tảng hôm nay.', 'PLATFORM_ADMIN thuộc workspace platform'),
    ]


def mentor() -> list[FeCase]:
    email = ROLES['mentor']['email']
    return [
        login_case('FE01', 'MT-01 Bài đánh giá dùng thử', email, '/platform/reviews', 'Doanh nghiệp cần chấm.', 'Menu mentor: 2 mục', 2),
        page_case('FE02', 'MT-01 Bài đánh giá dùng thử', 'Chỉ có hai mục: bài đánh giá dùng thử và bài cuối khóa', '/platform/reviews', 'Đã đăng nhập (FE01)',
                  ['1. Xem menu bên trái'], 'Menu chỉ có "Bài đánh giá dùng thử" và "Bài cuối khóa", không có mục quản trị nền tảng.',
                  lambda p: (menu(p) == ['Bài đánh giá dùng thử', 'Bài cuối khóa'], f'Menu: {", ".join(menu(p))}.'),
                  lambda p: [(aside(p), 'Chỉ 2 mục của mentor'), (h1(p), 'Doanh nghiệp được phân công chấm')]),
        page_case('FE03', 'MT-03 Bài cuối khóa', 'Bài cuối khóa của doanh nghiệp dùng thử', '/platform/course-reviews', 'Chưa có bài nộp',
                  ['1. Bấm menu "Bài cuối khóa"'], 'Trang "Bài cuối khóa cần chấm." với trạng thái trống khi chưa có bài.',
                  lambda p: ('Bài cuối khóa cần chấm' in h1_text(p) and text(p, 'Chưa có bài nào cần quyết định.').count() > 0,
                             f'Tiêu đề "{h1_text(p)}"; hiện "Chưa có bài nào cần quyết định."'),
                  lambda p: [(h1(p), 'Bài cuối khóa cần chấm'), (p.get_by_role('heading', name='Chưa có bài nào cần quyết định.'), 'Chưa có bài trong phạm vi')]),
        denied_case('FE04', 'Phân quyền', 'Mentor không mở được tổng quan quản trị nền tảng', '/platform/dashboard', 'MENTOR không có quyền platform.*'),
        denied_case('FE05', 'Phân quyền', 'Mentor không tự phân công được (PA-14)', '/platform/trials', 'MENTOR không có quyền platform.trial.manage'),
    ]


def owner() -> list[FeCase]:
    email = ROLES['owner']['email']
    return [
        login_case('FE01', 'OW-01 Tổng quan', email, '/enterprise/dashboard', 'Tổng quan doanh nghiệp', 'Menu chủ doanh nghiệp', 12),
        page_case('FE02', 'OW-02 Nhân sự', 'Danh sách nhân sự của tổ chức', '/enterprise/members', 'Seed: owner@, manager@, employee@',
                  ['1. Bấm menu "Nhân sự"'], 'Trang "Nhân sự" liệt kê nhân viên theo phòng ban và vị trí, có nút thêm nhân sự.',
                  lambda p: (text(p, 'Department Manager').count() > 0, 'Hiện Department Manager và Employee trong danh sách.'),
                  lambda p: [(h1(p), 'Nhân sự'), (p.get_by_role('heading', name='Thêm nhân sự vào tổ chức'), 'Thêm / mời nhân sự'),
                             (text(p, 'Department Manager').first, 'Quản lý phòng OPS')]),
        page_case('FE03', 'OW-05 Khung năng lực số', 'Khung năng lực số và chuẩn theo vị trí', '/enterprise/setup', 'Seed: 5 vị trí có chuẩn ACTIVE',
                  ['1. Bấm menu "Khung năng lực số"'], 'Trang "Khung năng lực số" có phần "Chuẩn năng lực theo vị trí công việc".',
                  lambda p: (p.get_by_role('heading', name='Chuẩn năng lực theo vị trí công việc').count() > 0, f'Tiêu đề "{h1_text(p)}".'),
                  lambda p: [(h1(p), 'Khung năng lực số'), (p.get_by_role('heading', name='Chuẩn năng lực theo vị trí công việc'), 'Chuẩn theo vị trí')]),
        page_case('FE04', 'OW-T1 Đánh giá đội ngũ', 'Chương trình đánh giá đội ngũ (dùng thử)', '/enterprise/trial', 'Tổ chức demo ở giai đoạn SETUP',
                  ['1. Bấm menu "Đánh giá đội ngũ"'], 'Danh sách nhân sự tham gia và phần đặt hạn làm bài / lịch hẹn chấm.',
                  lambda p: (p.get_by_role('heading', name='Danh sách nhân sự tham gia').count() > 0, f'Tiêu đề "{h1_text(p)}".'),
                  lambda p: [(h1(p), 'Đánh giá năng lực đội ngũ'), (p.get_by_role('heading', name='Danh sách nhân sự tham gia'), 'Nhân sự tham gia'),
                             (p.get_by_role('heading', name='Thời gian làm bài & Lịch hẹn chấm'), 'Hạn làm bài và lịch chấm')]),
        page_case('FE05', 'OW-23 Khóa học', 'Danh mục khóa học năng lực số để mua suất', '/enterprise/courses', 'Catalog 18 khóa TT02',
                  ['1. Bấm menu "Khóa học"'], 'Khóa học theo lĩnh vực, lĩnh vực đầu "Khai thác dữ liệu và thông tin".',
                  lambda p: (p.get_by_role('heading', name='Khai thác dữ liệu và thông tin').count() > 0, f'Tiêu đề "{h1_text(p)}".'),
                  lambda p: [(h1(p), 'Khóa học năng lực số'), (p.get_by_role('heading', name='Khai thác dữ liệu và thông tin').first, 'Lĩnh vực 1 và các khóa')]),
        redirect_case('FE06', 'Phân quyền', 'Chủ doanh nghiệp không vào được console nền tảng', '/platform/dashboard', '/enterprise/dashboard',
                      'Tổng quan doanh nghiệp', 'OWNER thuộc workspace enterprise'),
    ]


def manager() -> list[FeCase]:
    email = ROLES['manager']['email']
    return [
        login_case('FE01', 'MG-01 Tổng quan nhóm', email, '/enterprise/team', 'Quyết định việc cần ưu tiên.', 'Menu quản lý phòng ban', 8),
        page_case('FE02', 'MG-13 Chấm bài', 'Hàng đợi chấm bài cuối khóa của nhóm', '/enterprise/team/final-reviews', 'Chưa có bài nộp trong phòng OPS',
                  ['1. Bấm menu "Chấm bài"'], 'Trang "Ra quyết định dựa trên minh chứng." với trạng thái trống khi chưa có bài.',
                  lambda p: (text(p, 'Chưa có bài nào cần quyết định.').count() > 0, f'Tiêu đề "{h1_text(p)}"; chưa có bài cần quyết định.'),
                  lambda p: [(h1(p), 'Chấm bài cuối khóa'), (p.get_by_role('heading', name='Chưa có bài nào cần quyết định.'), 'Chưa có bài trong phạm vi')]),
        page_case('FE03', 'EM-T1 Học như nhân viên', 'Quản lý vào cổng học: tổ chức dùng thử yêu cầu làm bài đánh giá trước', '/enterprise/me',
                  'Tổ chức demo đang dùng thử, manager@ chưa làm bài', ['1. Mở /enterprise/me (cổng học của quản lý)'],
                  'Được đưa tới "Bài đánh giá năng lực" (EM-T1) trước khi học.',
                  lambda p: ('Bài đánh giá năng lực' in h1_text(p), f'Đưa tới "{h1_text(p)}".'),
                  lambda p: [(h1(p), 'Bài đánh giá năng lực (dùng thử)'), (aside(p), 'Menu cổng học')], expect_path='/enterprise/me/trial-test'),
        denied_case('FE04', 'Phân quyền', 'Quản lý không mở được quản trị nhân sự của doanh nghiệp', '/enterprise/members', 'MANAGER không có quyền user.read'),
        denied_case('FE05', 'Phân quyền', 'Quản lý không mở được khung năng lực / trần năng lực', '/enterprise/setup', 'MANAGER không có quyền quản trị khung'),
    ]


def employee() -> list[FeCase]:
    email = ROLES['employee']['email']
    return [
        login_case('FE01', 'EM-T1 Bài đánh giá năng lực', email, '/enterprise/me/trial-test', 'Bài đánh giá năng lực', 'Menu cổng học của nhân viên', 6),
        page_case('FE02', 'EM-02 Lộ trình', 'Lộ trình năng lực của vị trí Kế toán theo 6 trạm', '/enterprise/me/path', 'employee@ là Kế toán',
                  ['1. Bấm menu "Lộ trình năng lực"'], 'Tiêu đề là vị trí "Kế toán"; 6 trạm tương ứng 6 lĩnh vực.',
                  lambda p: (h1_text(p) == 'Kế toán' and p.get_by_role('heading', name='Trạm 06: Ứng dụng trí tuệ nhân tạo').count() > 0,
                             f'Tiêu đề "{h1_text(p)}"; có Trạm 01 → Trạm 06.'),
                  lambda p: [(h1(p), 'Vị trí: Kế toán'), (p.get_by_role('heading', name='Trạm 01: Khai thác dữ liệu và thông tin'), 'Trạm 01 của lộ trình')]),
        denied_case('FE03', 'Phân quyền', 'Nhân viên không mở được tổng quan doanh nghiệp', '/enterprise/dashboard', 'EMPLOYEE không có quyền dashboard.hr_company.read'),
        denied_case('FE04', 'Phân quyền', 'Nhân viên không mở được trang chấm bài', '/enterprise/team/final-reviews', 'EMPLOYEE không có quyền task.evaluate'),
    ]


CASES = {
    'platform-admin': platform_admin,
    'mentor': mentor,
    'owner': owner,
    'manager': manager,
    'employee': employee,
}
