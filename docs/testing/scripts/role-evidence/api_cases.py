"""API test cases per role, run against the real API on a fresh Development database (demo accounts, Admin@1234)."""
from __future__ import annotations

from datetime import datetime

from evidence_lib import ApiCase, Check, call, data_of, login

ZERO_ID = '00000000-0000-0000-0000-000000000001'

ROLES = {
    'platform-admin': {'label': 'PLATFORM_ADMIN', 'email': 'platform@digitalent.ai', 'title': 'QUẢN TRỊ NỀN TẢNG (PLATFORM_ADMIN)'},
    'mentor': {'label': 'MENTOR', 'email': 'mentor@digitalent.ai', 'title': 'MENTOR CHẤM BÀI DÙNG THỬ (MENTOR)'},
    'owner': {'label': 'OWNER', 'email': 'owner@digitalent.ai', 'title': 'CHỦ DOANH NGHIỆP (OWNER)'},
    'manager': {'label': 'MANAGER', 'email': 'manager@digitalent.ai', 'title': 'QUẢN LÝ PHÒNG BAN (MANAGER)'},
    'employee': {'label': 'EMPLOYEE', 'email': 'employee@digitalent.ai', 'title': 'NHÂN VIÊN (EMPLOYEE)'},
}


def items(r) -> list:
    data = data_of(r)
    return data.get('items', []) if isinstance(data, dict) else (data or [])


def has(r, *keys) -> bool:
    data = data_of(r)
    return isinstance(data, dict) and all(k in data for k in keys)


def failed(r) -> bool:
    return isinstance(r.body, dict) and r.body.get('success') is False


def login_case(case_id: str, role: str, email: str) -> ApiCase:
    return ApiCase(
        case_id, 'Xác thực', f'Đăng nhập tài khoản demo {email} để lấy access token', 'Ẩn danh',
        f'Tài khoản demo {email} (seed Development), mật khẩu Admin@1234', '200, success = true, trả về accessToken và refreshToken',
        'POST', '/auth/login', 200, body={'email': email, 'password': 'Admin@1234'},
        checks=[Check('success = true', lambda r: r.body['success'] is True),
                Check('Có accessToken và refreshToken', lambda r: bool(data_of(r)['accessToken']) and bool(data_of(r)['refreshToken']))],
        highlight=['success', 'data.accessToken', 'data.refreshToken'])


def me_case(case_id: str, role: str, token: str, workspace: str, has_org: bool) -> ApiCase:
    org_label = 'organizationId có giá trị' if has_org else 'organizationId = null (không thuộc tổ chức)'
    return ApiCase(
        case_id, 'Phiên đăng nhập', f'{role} đọc thông tin phiên: vai trò, workspace và tổ chức', role,
        'Đã đăng nhập (ca trước)', f'200; roles = [{role}]; workspace = {workspace}; {org_label}',
        'GET', '/auth/me', 200, token,
        checks=[Check(f'roles = [{role}]', lambda r: data_of(r)['roles'] == [role]),
                Check(f'workspace = {workspace}', lambda r: data_of(r)['workspace'] == workspace),
                Check(org_label, lambda r: (data_of(r)['organizationId'] is not None) == has_org)],
        highlight=['data.roles', 'data.workspace', 'data.organizationId'])


def forbidden(case_id: str, role: str, token: str, method: str, path: str, feature: str, what: str, permission: str, body=None) -> ApiCase:
    return ApiCase(
        case_id, feature, f'{role} không được {what}', role, f'Vai trò không có quyền {permission}',
        '403 Forbidden, success = false', method, path, 403, token, body=body,
        checks=[Check('success = false', failed)], highlight=['success', 'message'])


def anonymous(case_id: str, path: str, feature: str, what: str) -> ApiCase:
    return ApiCase(
        case_id, feature, f'Gọi {what} không kèm token', 'Ẩn danh', 'Không gửi header Authorization', '401 Unauthorized',
        'GET', path, 401, checks=[Check('success = false', failed)], highlight=['success', 'message'])


# ───────────────────────────── roles ─────────────────────────────

def platform_admin() -> list[ApiCase]:
    role, email = 'PLATFORM_ADMIN', ROLES['platform-admin']['email']
    t = login(email)
    users = items(call('GET', '/platform/users?pageSize=50', t))
    employee_user = next(u for u in users if u['email'] == 'employee@digitalent.ai')
    return [
        login_case('TC01', role, email),
        me_case('TC02', role, t, 'platform', False),
        ApiCase('TC03', 'PA-01 Tổng quan', 'Xem toàn cảnh nền tảng: tổ chức, người dùng, khung chuẩn', role,
                'Seed Development: 1 tổ chức DIGITALENT, khung TT02_2025 có 6 lĩnh vực', '200; organizationCount ≥ 1; frameworkCount = 1; domainCount = 6',
                'GET', '/platform/overview', 200, t,
                checks=[Check('organizationCount ≥ 1', lambda r: data_of(r)['organizationCount'] >= 1),
                        Check('frameworkCount = 1', lambda r: data_of(r)['frameworkCount'] == 1),
                        Check('domainCount = 6', lambda r: data_of(r)['domainCount'] == 6)],
                highlight=['data.organizationCount', 'data.userCount', 'data.frameworkCount', 'data.domainCount']),
        ApiCase('TC04', 'PA-02 Khung chuẩn', 'Xem khung năng lực số TT02 và số khóa học của khung', role,
                'Khung TT02_2025 được seed ở mọi môi trường', '200; đúng 1 khung, 6 lĩnh vực, 18 khóa; có phiên bản catalog đang dùng',
                'GET', '/platform/frameworks', 200, t,
                checks=[Check('Đúng 1 khung', lambda r: len(items(r)) == 1),
                        Check('6 lĩnh vực, 18 khóa học', lambda r: items(r)[0]['domainCount'] == 6 and items(r)[0]['courseCount'] == 18),
                        Check('currentCatalogVersionNo có giá trị', lambda r: data_of(r)['currentCatalogVersionNo'] is not None)],
                highlight=['data.items[0].domainCount', 'data.items[0].courseCount', 'data.currentCatalogVersionNo']),
        ApiCase('TC05', 'PA-03 Phiên bản khóa học', 'Xem các phiên bản catalog và phiên bản neo ⚓ đang dùng', role,
                'Seed: phiên bản v1 = 18 khóa TT02', '200; có phiên bản CURRENT; currentVersionNo = v1',
                'GET', '/platform/catalog/versions', 200, t,
                checks=[Check('Có 1 phiên bản CURRENT', lambda r: sum(1 for v in items(r) if v['status'] == 'CURRENT') == 1),
                        Check('Phiên bản đang dùng có 18 khóa', lambda r: next(v for v in items(r) if v['status'] == 'CURRENT')['courseCount'] == 18)],
                highlight=['data.items[0].status', 'data.items[0].courseCount', 'data.currentVersionNo']),
        ApiCase('TC06', 'PA-05 Tổ chức', 'Xem danh sách tổ chức khách hàng kèm gói và chủ sở hữu', role,
                'Tổ chức demo DIGITALENT', '200; có tổ chức DIGITALENT với chủ owner@digitalent.ai',
                'GET', '/platform/organizations', 200, t,
                checks=[Check('Có tổ chức DIGITALENT', lambda r: any(o['code'] == 'DIGITALENT' for o in items(r))),
                        Check('Chủ sở hữu = owner@digitalent.ai', lambda r: next(o for o in items(r) if o['code'] == 'DIGITALENT')['ownerEmail'] == 'owner@digitalent.ai')],
                highlight=['data.items[0].code', 'data.items[0].ownerEmail', 'data.totalItems']),
        ApiCase('TC07', 'PA-07 Người dùng', 'Theo dõi người dùng cá nhân đang dùng thử 7 ngày', role,
                'Seed: trial@ đang dùng thử, free@ đã hết hạn', '200; trials.active ≥ 1; trials.ended ≥ 1',
                'GET', '/platform/users?trial=ANY', 200, t,
                checks=[Check('trials.active ≥ 1', lambda r: data_of(r)['trials']['active'] >= 1),
                        Check('trials.ended ≥ 1', lambda r: data_of(r)['trials']['ended'] >= 1)],
                highlight=['data.trials']),
        ApiCase('TC08', 'PA-08 Khóa tài khoản', 'Khóa tài khoản phải kèm lý do ≥ 10 ký tự', role,
                f'Tài khoản employee@ (id {employee_user["id"][:8]}…); lý do quá ngắn', '400 Bad Request; tài khoản không bị khóa',
                'POST', f'/platform/users/{employee_user["id"]}/lock', 400, t, body={'reason': 'ngắn'},
                checks=[Check('success = false', failed),
                        Check('employee@ vẫn chưa bị khóa', lambda r: not next(u for u in items(call('GET', '/platform/users?pageSize=50', t))
                                                                           if u['email'] == 'employee@digitalent.ai')['isManuallyLocked'])],
                highlight=['success', 'errors'], display_path='/platform/users/{employee@}/lock'),
        ApiCase('TC09', 'PA-10 Nhật ký kiểm tra', 'Đọc nhật ký kiểm tra của nền tảng', role,
                'DB mới', '200; trả về danh sách có phân trang (pageIndex, totalItems)',
                'GET', '/platform/audit-logs?pageSize=5', 200, t,
                checks=[Check('Có pageIndex và totalItems', lambda r: has(r, 'pageIndex', 'totalItems'))],
                highlight=['data.pageIndex', 'data.totalItems']),
        forbidden('TC10', role, t, 'GET', '/members', 'Phân quyền', 'xem thành viên của một doanh nghiệp', 'user.read'),
        forbidden('TC11', role, t, 'GET', '/me/pulse/overview', 'Phân quyền', 'mở cổng học của nhân viên', 'employee_competency_profile.read'),
        anonymous('TC12', '/platform/overview', 'Phân quyền', 'tổng quan nền tảng'),
    ]


def mentor() -> list[ApiCase]:
    role, email = 'MENTOR', ROLES['mentor']['email']
    t = login(email)
    return [
        login_case('TC01', role, email),
        me_case('TC02', role, t, 'platform', False),
        ApiCase('TC03', 'MT-01 Bài dùng thử', 'Xem các doanh nghiệp dùng thử được phân công chấm', role,
                'DB mới: chưa có doanh nghiệp nào phân công cho mentor@', '200; danh sách items (rỗng khi chưa được phân công)',
                'GET', '/mentor/trials', 200, t,
                checks=[Check('Có trường items', lambda r: has(r, 'items')),
                        Check('Không thấy doanh nghiệp chưa phân công', lambda r: items(r) == [])],
                highlight=['data.items']),
        ApiCase('TC04', 'MT-03 Chấm bài cuối khóa', 'Xem bài cuối khóa cần chấm của doanh nghiệp dùng thử', role,
                'Mentor chỉ thấy doanh nghiệp dùng thử được phân công (PulseReviewScope)', '200; có 3 tiêu chí chấm; không có bài của tổ chức khác',
                'GET', '/pulse/final-reviews', 200, t,
                checks=[Check('3 tiêu chí chấm', lambda r: len(data_of(r)['criteria']) == 3),
                        Check('Không có bài ngoài phạm vi', lambda r: data_of(r)['items'] == [])],
                highlight=['data.criteria', 'data.items']),
        ApiCase('TC05', 'SHR Hồ sơ', 'Mentor xem hồ sơ tài khoản của mình', role, 'Đã đăng nhập',
                '200; email = mentor@digitalent.ai', 'GET', '/account/profile', 200, t,
                checks=[Check('email = mentor@digitalent.ai', lambda r: data_of(r)['email'] == 'mentor@digitalent.ai')],
                highlight=['data.email']),
        ApiCase('TC06', 'Thông báo', 'Mentor đọc thông báo của mình', role, 'Đã đăng nhập', '200; success = true',
                'GET', '/notifications', 200, t, checks=[Check('success = true', lambda r: r.body['success'] is True)],
                highlight=['success']),
        forbidden('TC07', role, t, 'GET', '/platform/overview', 'Phân quyền', 'mở console quản trị nền tảng', 'platform.organization.read'),
        forbidden('TC08', role, t, 'PUT', f'/platform/trials/{ZERO_ID}/mentor', 'Phân quyền', 'tự phân công mentor cho doanh nghiệp',
                  'platform.trial.manage', body={'mentorUserId': ZERO_ID}),
        forbidden('TC09', role, t, 'GET', '/members', 'Phân quyền', 'xem thành viên doanh nghiệp', 'user.read'),
        forbidden('TC10', role, t, 'POST', '/me/trial-assessment', 'Phân quyền', 'nộp bài đánh giá thay nhân viên', 'attempt.submit',
                  body={}),
        anonymous('TC11', '/mentor/trials', 'Phân quyền', 'danh sách bài dùng thử của mentor'),
    ]


def owner() -> list[ApiCase]:
    role, email = 'OWNER', ROLES['owner']['email']
    t = login(email)
    department_code = 'EVD' + datetime.now().strftime('%H%M%S')  # a new code each run: department codes are unique
    return [
        login_case('TC01', role, email),
        me_case('TC02', role, t, 'enterprise', True),
        ApiCase('TC03', 'OW-01 Tổng quan', 'Xem tổng quan doanh nghiệp: thành viên, quyền sử dụng, gói, thiết lập', role,
                'Seed Development: gói BUSINESS 50 người dùng', '200; seats.limit = 50; plan.code = BUSINESS; có 4 bước thiết lập',
                'GET', '/organization/overview', 200, t,
                checks=[Check('seats.limit = 50', lambda r: data_of(r)['seats']['limit'] == 50),
                        Check('plan.code = BUSINESS', lambda r: data_of(r)['plan']['code'] == 'BUSINESS'),
                        Check('setup có 4 bước', lambda r: len(data_of(r)['setup']) == 4)],
                highlight=['data.members', 'data.seats', 'data.plan', 'data.setup']),
        ApiCase('TC04', 'OW-02 Thành viên', 'Xem danh sách thành viên với vai trò và phòng ban', role,
                'Seed: owner@, manager@, employee@ có hồ sơ nhân viên', '200; có manager@ vai trò MANAGER và employee@ vai trò EMPLOYEE',
                'GET', '/members?pageSize=50', 200, t,
                checks=[Check('manager@ có vai trò MANAGER', lambda r: any(m['email'] == 'manager@digitalent.ai' and 'MANAGER' in m['roles'] for m in items(r))),
                        Check('employee@ có vai trò EMPLOYEE', lambda r: any(m['email'] == 'employee@digitalent.ai' and 'EMPLOYEE' in m['roles'] for m in items(r)))],
                highlight=['data.items[0].roles', 'data.items[1].roles', 'data.items[2].roles', 'data.totalItems']),
        ApiCase('TC05', 'OW-05 Trần năng lực', 'Xem ma trận trần năng lực 6 lĩnh vực của doanh nghiệp', role,
                'Chưa lưu trần: hiển thị gợi ý, mặc định Cơ bản', '200; 6 lĩnh vực; trần Digital AI = 3; 18 khóa nền tảng',
                'GET', '/capability-ceilings', 200, t,
                checks=[Check('6 lĩnh vực', lambda r: len(data_of(r)['domains']) == 6),
                        Check('platformMaxLevel = 3', lambda r: data_of(r)['platformMaxLevel'] == 3),
                        Check('platformCourseCount = 18', lambda r: data_of(r)['platformCourseCount'] == 18)],
                highlight=['data.platformMaxLevel', 'data.domains', 'data.platformCourseCount']),
        ApiCase('TC06', 'OW-16 Chuẩn năng lực', 'Xem tóm tắt chuẩn năng lực theo vị trí', role,
                'Seed: 5 vị trí, mỗi vị trí có bộ yêu cầu ACTIVE', '200; 5 vị trí; vị trí Kế toán có phiên bản ACTIVE',
                'GET', '/position-requirements/summaries', 200, t,
                checks=[Check('5 vị trí', lambda r: len(data_of(r)) == 5),
                        Check('Kế toán có bộ ACTIVE', lambda r: next(p for p in data_of(r) if p['jobPositionCode'] == 'ACCOUNTANT')['status'] == 'ACTIVE')],
                highlight=['data[0].jobPositionCode', 'data[0].activeSet', 'data[0].status']),
        ApiCase('TC07', 'OW-06 Phòng ban', 'Tạo phòng ban mới, rồi đọc lại phòng ban vừa tạo', role, f'Mã {department_code} chưa tồn tại',
                f'200; trả về id phòng ban; GET /departments/{{id}} có mã {department_code}, trạng thái ACTIVE',
                'POST', '/departments', 200, t,
                body={'code': department_code, 'name': 'Phòng Kiểm thử Evidence', 'description': 'Tạo bởi kịch bản kiểm thử theo vai trò'},
                checks=[Check('success = true, có id', lambda r: r.body['success'] is True and bool(data_of(r)['id'])),
                        Check(f'GET /departments/{{id}}: code = {department_code}, status = ACTIVE',
                              lambda r: (lambda d: d['code'] == department_code and d['status'] == 'ACTIVE')(
                                  data_of(call('GET', f'/departments/{data_of(r)["id"]}', t))))],
                highlight=['success', 'data.id']),
        ApiCase('TC08', 'OW-T1 Dùng thử', 'Xem chương trình đánh giá đội ngũ (dùng thử)', role,
                'Tổ chức demo đang ở giai đoạn SETUP', '200; stage = SETUP; tối đa 30 người; bài test 18 câu + 3 tự luận',
                'GET', '/trial', 200, t,
                checks=[Check('stage = SETUP', lambda r: data_of(r)['stage'] == 'SETUP'),
                        Check('maxParticipants = 30', lambda r: data_of(r)['maxParticipants'] == 30),
                        Check('18 câu trắc nghiệm, 3 tự luận', lambda r: data_of(r)['choiceCount'] == 18 and data_of(r)['essayCount'] == 3)],
                highlight=['data.stage', 'data.maxParticipants', 'data.choiceCount', 'data.essayCount']),
        ApiCase('TC09', 'Gói dịch vụ', 'Xem gói dịch vụ và hạn mức người dùng', role, 'Gói BUSINESS', '200; planCode = BUSINESS; seatLimit = 50',
                'GET', '/subscription', 200, t,
                checks=[Check('planCode = BUSINESS', lambda r: data_of(r)['planCode'] == 'BUSINESS'),
                        Check('seatLimit = 50', lambda r: data_of(r)['seatLimit'] == 50)],
                highlight=['data.planCode', 'data.seatLimit', 'data.status']),
        forbidden('TC10', role, t, 'GET', '/platform/overview', 'Phân quyền', 'mở console quản trị nền tảng', 'platform.organization.read'),
        forbidden('TC11', role, t, 'GET', '/mentor/trials', 'Phân quyền', 'xem việc chấm bài của mentor', 'trial.review'),
        forbidden('TC12', role, t, 'POST', f'/me/pulse/courses/{ZERO_ID}/final', 'Phân quyền', 'nộp bài cuối khóa (chỉ người học)',                  'attempt.submit', body={'content': 'x'}),
        anonymous('TC13', '/organization/overview', 'Phân quyền', 'tổng quan doanh nghiệp'),
    ]


def manager() -> list[ApiCase]:
    role, email = 'MANAGER', ROLES['manager']['email']
    t = login(email)
    return [
        login_case('TC01', role, email),
        me_case('TC02', role, t, 'enterprise', True),
        ApiCase('TC03', 'Nhân sự của phòng', 'Xem nhân sự trong phạm vi phòng ban mình quản lý', role,
                'manager@ quản lý phòng OPS (seed)', '200; mọi nhân sự thuộc phòng Operations',
                'GET', '/workforce?pageSize=50', 200, t,
                checks=[Check('Có nhân sự', lambda r: len(items(r)) > 0),
                        Check('Tất cả thuộc phòng Operations', lambda r: all(e['departmentName'] == 'Operations' for e in items(r)))],
                highlight=['data.items[0].departmentName', 'data.items[1].departmentName', 'data.totalItems']),
        ApiCase('TC04', 'Tổng quan nhóm', 'Xem dashboard năng lực của nhóm', role, 'Phạm vi phòng OPS',
                '200; có kpis và đủ 6 lĩnh vực', 'GET', '/intelligence/dashboard', 200, t,
                checks=[Check('Có kpis', lambda r: has(r, 'kpis')), Check('6 lĩnh vực', lambda r: len(data_of(r)['domains']) == 6)],
                highlight=['data.kpis', 'data.domains']),
        ApiCase('TC05', 'MG-13 Chấm bài', 'Xem hàng đợi chấm bài cuối khóa của nhóm', role, 'Phạm vi phòng OPS',
                '200; có 3 tiêu chí chấm và các bộ đếm', 'GET', '/pulse/final-reviews', 200, t,
                checks=[Check('3 tiêu chí', lambda r: len(data_of(r)['criteria']) == 3),
                        Check('Có pendingCount', lambda r: 'pendingCount' in data_of(r))],
                highlight=['data.pendingCount', 'data.criteria']),
        ApiCase('TC06', 'EM-01 Học như nhân viên', 'Quản lý cũng học trong cổng nhân viên', role,
                'manager@ có vị trí Sales / CRM', '200; hasPosition = true; 6 lĩnh vực; positionName = Sales / CRM',
                'GET', '/me/pulse/overview', 200, t,
                checks=[Check('hasPosition = true', lambda r: data_of(r)['hasPosition'] is True),
                        Check('6 lĩnh vực', lambda r: len(data_of(r)['domains']) == 6),
                        Check('positionName = Sales / CRM', lambda r: data_of(r)['person']['positionName'] == 'Sales / CRM')],
                highlight=['data.person', 'data.hasPosition']),
        forbidden('TC07', role, t, 'GET', '/members', 'Phân quyền', 'quản trị thành viên doanh nghiệp', 'user.read'),
        forbidden('TC08', role, t, 'POST', '/course-assignments', 'Phân quyền', 'giao khóa học', 'course_assignment.create',
                  body={'courseId': ZERO_ID, 'targets': {'employeeIds': [ZERO_ID]}}),
        forbidden('TC09', role, t, 'PUT', '/capability-ceilings/organization', 'Phân quyền', 'đặt trần năng lực doanh nghiệp',
                  'position_requirement.manage', body={'ceilings': []}),
        forbidden('TC10', role, t, 'GET', '/organization/overview', 'Phân quyền', 'xem tổng quan doanh nghiệp', 'dashboard.hr_company.read'),
        anonymous('TC11', '/workforce', 'Phân quyền', 'danh sách nhân sự'),
    ]


def employee() -> list[ApiCase]:
    role, email = 'EMPLOYEE', ROLES['employee']['email']
    t = login(email)
    overview = data_of(call('GET', '/me/pulse/overview', t))
    first_course = overview['courses'][0]
    return [
        login_case('TC01', role, email),
        me_case('TC02', role, t, 'enterprise', True),
        ApiCase('TC03', 'EM-01 Hôm nay', 'Xem lộ trình năng lực của chính mình', role,
                'employee@ là Kế toán, phòng Operations (seed)', '200; positionName = Kế toán; 6 lĩnh vực; 18 khóa trong danh mục',
                'GET', '/me/pulse/overview', 200, t,
                checks=[Check('positionName = Kế toán', lambda r: data_of(r)['person']['positionName'] == 'Kế toán'),
                        Check('6 lĩnh vực', lambda r: len(data_of(r)['domains']) == 6),
                        Check('18 khóa', lambda r: len(data_of(r)['courses']) == 18)],
                highlight=['data.person', 'data.hasPosition', 'data.domains']),
        ApiCase('TC04', 'EM-03 Khóa học', f'Mở khóa {first_course["code"]} trong lộ trình', role, 'Khóa đầu tiên của danh mục',
                f'200; code = {first_course["code"]}; có danh sách mô đun', 'GET', f'/me/pulse/courses/{first_course["courseId"]}', 200, t,
                checks=[Check(f'code = {first_course["code"]}', lambda r: data_of(r)['course']['code'] == first_course['code']),
                        Check('Có mô đun', lambda r: len(data_of(r)['modules']) > 0)],
                highlight=['data.course', 'data.modules'], display_path=f'/me/pulse/courses/{{{first_course["code"]}}}'),
        ApiCase('TC05', 'Nhiệm vụ thực tế', 'Xem nhiệm vụ thực tế được giao', role, 'Seed hành trình demo: 3 nhiệm vụ',
                '200; 3 nhiệm vụ: cần làm / cần chỉnh sửa / đã đạt', 'GET', '/me/tasks', 200, t,
                checks=[Check('total = 3', lambda r: data_of(r)['summary']['total'] == 3),
                        Check('1 cần chỉnh sửa, 1 đã đạt', lambda r: data_of(r)['summary']['needsRevision'] == 1 and data_of(r)['summary']['passed'] == 1)],
                highlight=['data.summary']),
        ApiCase('TC06', 'EM-T1 Bài test dùng thử', 'Xem bài đánh giá năng lực của chương trình dùng thử', role,
                'Tổ chức demo đang dùng thử; chưa làm bài', '200; status = NOT_STARTED; 18 câu trắc nghiệm, 3 tự luận, 6 lĩnh vực',
                'GET', '/me/trial-assessment', 200, t,
                checks=[Check('status = NOT_STARTED', lambda r: data_of(r)['status'] == 'NOT_STARTED'),
                        Check('18 câu, 3 tự luận', lambda r: data_of(r)['choiceCount'] == 18 and len(data_of(r)['essays']) == 3),
                        Check('6 lĩnh vực', lambda r: len(data_of(r)['domains']) == 6)],
                highlight=['data.status', 'data.choiceCount', 'data.essays']),
        ApiCase('TC07', 'EM-13 Góp ý', 'Xem góp ý của chính mình', role, 'Chưa gửi góp ý', '200; danh sách phân trang (rỗng)',
                'GET', '/feedbacks/mine', 200, t, checks=[Check('totalItems = 0', lambda r: data_of(r)['totalItems'] == 0)],
                highlight=['data.items', 'data.totalItems']),
        forbidden('TC08', role, t, 'GET', '/employees', 'Phân quyền', 'xem danh sách nhân viên', 'employee.read'),
        forbidden('TC09', role, t, 'GET', '/pulse/final-reviews', 'Phân quyền', 'chấm bài của người khác', 'task.evaluate hoặc trial.review'),
        forbidden('TC10', role, t, 'POST', '/tasks', 'Phân quyền', 'giao nhiệm vụ thực tế', 'task.create',
                  body={'title': 'x', 'expectedOutput': 'y', 'dueDate': '2099-01-01'}),
        forbidden('TC11', role, t, 'GET', '/workforce', 'Phân quyền', 'xem nhân sự toàn doanh nghiệp', 'employee.read'),
        anonymous('TC12', '/me/pulse/overview', 'Phân quyền', 'cổng học của nhân viên'),
    ]


CASES = {
    'platform-admin': platform_admin,
    'mentor': mentor,
    'owner': owner,
    'manager': manager,
    'employee': employee,
}
