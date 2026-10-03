# Kế hoạch điều chỉnh frontend theo "Role, Sidebar và Page Spec v2.1"

- Ngày: 2026-10-01
- Nguồn: `DigiTalent_AI_Role_Sidebar_Page_Spec_v2.1.docx` (gọi tắt là **spec v2.1**).
- Thay thế phần sitemap, role và thứ tự giai đoạn của `2026-10-01-frontend-ui-ux-restructure-plan.md` (spec v1.0) cho Enterprise và Platform. Phần Public, Personal và hạ tầng (guard, mock layer, sitemap-driven routing) của kế hoạch cũ vẫn giữ.
- Trạng thái: **đã chốt Q1–Q8** (§9, ngày 2026-10-01). Được phép bắt đầu A0 → A.

---

## 1. Thay đổi chính so với hệ thống hiện tại

| # | Spec v2.1 | Hiện trạng code | Tác động |
|---|---|---|---|
| 1 | **4 role**: PLATFORM_ADMIN, OWNER, MANAGER (tùy chọn), EMPLOYEE | 6 role: OWNER, ORG_ADMIN, LEARNING_ADMIN, MANAGER, LEARNER, PLATFORM_ADMIN | Bỏ ORG_ADMIN, LEARNING_ADMIN; đổi LEARNER → EMPLOYEE. Khoảng 25 file dùng role cũ (role-policy, navigation, mock-rbac, mock-accounts, 3 handler mock, test). |
| 2 | OWNER gộp quản trị tổ chức, năng lực, đào tạo, gói dịch vụ; còn giao task, duyệt minh chứng, xác nhận năng lực trên toàn tổ chức khi không có Manager | OWNER chỉ có billing/tổng quan; phần lớn trang thuộc ORG_ADMIN hoặc LEARNING_ADMIN | Mọi trang ADM-* và LCA-* chuyển sang OWNER. Trang task và review mở cho OWNER (phạm vi tổ chức) và MANAGER (phạm vi nhóm). |
| 3 | **Job Grade G1–G3** gắn với Position; nhân viên nhận Grade qua Position | Chưa có | Thêm dữ liệu grade (mock + types), cột/filter Grade ở Members, Positions, Skill gap, Training, Reports. Thêm trang cấu hình grade (OW-12). |
| 4 | Thuật ngữ: "Grade/Cấp bậc" chỉ dùng cho G1–G3; năng lực không được gọi là Grade | UI đang dùng "Mức yêu cầu", "Mức xác nhận"; giá trị Cơ bản/Trung cấp/Nâng cao (bậc TT02 1–2/3–4/5–6) | Rà toàn bộ nhãn theo glossary đã chốt (§4.6). |
| 5 | **Sidebar riêng cho từng role**, nhóm theo nghiệp vụ (TỔ CHỨC, NĂNG LỰC, ĐÀO TẠO, ĐÁNH GIÁ & MINH CHỨNG…) | Một sidebar enterprise sinh từ `nav` trong sitemap, lọc theo role | Tách cấu hình sidebar khỏi sitemap: mỗi role một cây nav trỏ tới screen ID (§4.3). |
| 6 | Notification, Profile, Security nằm ở topbar/avatar, không ở sidebar | SHR-01/02/03 nằm trong sidebar | Đưa vào Topbar (chuông) và avatar menu. |
| 7 | Mã màn hình mới: PUB/AUTH, PA-01..21, OW-01..45, MG-01..15, EM-01..18 | ADM/LCA/MGR/EMP/SHR/PLT theo v1.0 | Đánh số lại toàn bộ sitemap; bảng đối chiếu ở §3. |
| 8 | Thực thể mới: **Đợt đào tạo (Training Batch)**, Practical Task + Submission + Evaluation, Standard Course Catalog, Workforce Competency Matrix, Requirement Set List | Chưa có trang hoặc mock | Thêm mock data và handler mới. |
| 9 | Individual workspace **không được mô tả** trong v2.1 | `/personal/*` đã có khung | Giữ nguyên, không đổi trong kế hoạch này (xem §9, Q1). |

---

## 2. Mô hình role và scope (đích)

| Role | Scope dữ liệu | Sidebar | Ghi chú triển khai |
|---|---|---|---|
| PLATFORM_ADMIN | GLOBAL | Platform (§5 spec) | Vẫn qua mọi `can()`; chỉ vào cổng `/platform`. |
| OWNER | ORGANIZATION | Owner (§6 spec) | Một tổ chức có thể có nhiều Owner; Owner thêm được Owner khác (Q3). Luôn có ít nhất một Owner. Owner là tài khoản quản trị, không có mục "Cá nhân" trong MVP (Q8). |
| MANAGER | Các phòng ban mà người đó là trưởng (`departments.managerEmployeeId`) | Manager (§7 spec) | Mỗi phòng ban có tối đa một Manager; một Manager có thể quản lý nhiều phòng ban. Manager vẫn là nhân viên nên dùng được các trang cá nhân EM-*. MVP: Manager theo dõi đào tạo, **không** giao khóa học (Q4). |
| EMPLOYEE | SELF | Employee (§8 spec) | Đổi tên từ LEARNER. |

**Chọn sidebar:** theo role cao nhất của người dùng: PLATFORM_ADMIN > OWNER > MANAGER > EMPLOYEE. Owner không có mục "Cá nhân" (spec không mô tả).

**Map role legacy từ backend** (tạm thời, đến khi backend dùng role mới):

| Backend | Frontend |
|---|---|
| SYSTEM_ADMIN | PLATFORM_ADMIN. Trong lúc Platform chưa dựng xong thì kèm thêm OWNER, như hiện nay. |
| HR_MANAGER | OWNER. Đây là quyền rộng nhất có được: HR sẽ thấy cả mục gói dịch vụ. Chấp nhận được vì chỉ dùng trong giai đoạn chuyển tiếp. |
| DEPARTMENT_MANAGER | MANAGER |
| EMPLOYEE, TRAINER | EMPLOYEE |

**Quyền chi tiết:** `services/mock/mock-rbac.ts` gom quyền của ORG_ADMIN + LEARNING_ADMIN + OWNER cũ vào OWNER, cộng thêm quyền task/evidence. MANAGER chỉ đọc trong scope, cộng tạo/giao task và đánh giá minh chứng. EMPLOYEE chỉ có quyền tự phục vụ. Ma trận đích theo §10 spec, chi tiết trong §4.2.

---

## 3. Bảng đối chiếu màn hình: cũ → mới

> Cột "Hành động" ở đây viết trước khi kiểm kê code. Nhiều màn ghi "mới" hoặc "placeholder" (MG-*, EM-*, OW-31..39, PA-*) thực ra đã có trang do hai agent trước dựng. Trạng thái code thực tế và quyết định giữ/xóa từng file xem **§10**.

Cột **Hành động** gồm:
- *giữ*: dùng lại trang hiện có, chỉ đổi ID/đường dẫn/role.
- *mở rộng*: dùng lại và bổ sung nội dung.
- *gộp*: ghép nhiều trang cũ thành một.
- *mới*: chưa có code.
- *modal / drawer*: không có route riêng.

### 3.1 Public / Auth / Onboarding

| ID mới | Trang | Đường dẫn | Từ | Hành động |
|---|---|---|---|---|
| PUB-01 | Portal Selector | `/`, `/portal` | PUB-01 | giữ |
| PUB-02 | Enterprise Landing | `/business` | landing business | giữ |
| PUB-03 | Enterprise Pricing | `/business/pricing` | pricing | giữ (đổi mã; landing/pricing cá nhân giữ ngoài phạm vi) |
| AUTH-01 | Enterprise Register | `/business/register` | | giữ |
| AUTH-02/03 | Checkout / Payment Result | `/checkout`, `/checkout/result` | | giữ |
| AUTH-04 | Create Organization | `/setup` (bước 1) | wizard hiện có | mở rộng: thêm logo, timezone |
| AUTH-05 | Organization Setup Wizard | `/setup` (các bước sau) | wizard hiện có | mở rộng: thêm bước **Grades** (gắn G1–G3 cho vị trí), bước **Members** (mời nhân viên), tùy chọn gán Manager |
| AUTH-06 | Employee Activation | `/activate/:token` | | giữ |
| AUTH-07 | Login | `/login`, `/business/login` | | giữ; redirect theo role mới |
| AUTH-08 | Forgot / Reset Password | | | giữ |

### 3.2 OWNER (sidebar: TỔNG QUAN · TỔ CHỨC · NĂNG LỰC · ĐÀO TẠO · ĐÁNH GIÁ & MINH CHỨNG · BÁO CÁO · GÓI DỊCH VỤ · CÀI ĐẶT)

| ID | Trang | Đường dẫn đề xuất | Từ (code hiện có) | Hành động | Ưu tiên |
|---|---|---|---|---|---|
| OW-01 | Organization Dashboard | `/enterprise/dashboard` | ADM-01 `OrganizationOverviewPage` + LCA-01 `CapabilityDashboardPage` | gộp: thêm phân bố G1/G2/G3, đợt đào tạo đang chạy, minh chứng chờ duyệt, ghế | P0 |
| OW-02 | Employee List | `/enterprise/members` | ADM-02 `MembersPage` + LCA-08 `WorkforcePage` | gộp: filter Phòng ban/Vị trí/Grade/Role/Học tập/Gap/Trạng thái tài khoản | P0 |
| OW-03 | Employee Detail | `/enterprise/members/:id` | ADM-03 `MemberDetailPage` + LCA-09 `EmployeeCapabilityPage` | gộp thành tabs: Tổng quan / Năng lực / Skill gap / Học tập / Đánh giá / Nhiệm vụ / Minh chứng / Thành tựu | P0 |
| OW-04 | Invite / Add Employee | modal trên OW-02 | `InviteMembersModal` | mở rộng: mã NV, phòng ban, vị trí, role | P0 |
| OW-05 | Edit Employee Assignment | drawer trên OW-02/03 | `MemberDialogs` | mở rộng: đổi phòng ban/vị trí/manager/role/trạng thái; Grade hiển thị suy ra từ vị trí | P0 |
| OW-06 | Department List | `/enterprise/departments` | `DepartmentListPage` | mở rộng: headcount, manager, phân bố grade, tóm tắt gap/đào tạo | P0 |
| OW-07 | Department Detail | `/enterprise/departments/:id` | | mới: tabs Tổng quan / Thành viên / Vị trí / Năng lực / Tiến độ đào tạo | P0 |
| OW-08 | Create / Edit Department | modal | `DepartmentFormDialog` | mở rộng: chọn Manager (ghi vào `managerEmployeeId`, nguồn duy nhất của phạm vi Manager) | P0 |
| OW-09 | Position List | `/enterprise/positions` | `PositionListPage` | mở rộng: filter Phòng ban/Grade/trạng thái, số NV, trạng thái yêu cầu | P0 |
| OW-10 | Position Detail | `/enterprise/positions/:id` | LCA-03 `PositionDetailPage` | mở rộng: thêm tab Lịch sử yêu cầu (dùng lại LCA-05) | P0 |
| OW-11 | Create / Edit Position | modal | `JobPositionFormDialog` | mở rộng: phòng ban, Grade | P0 |
| OW-12 | Job Grade Configuration | `/enterprise/positions/grades` | | mới: tên hiển thị và mô tả cho G1–G3, mã cố định | P0 |
| OW-13 | Role & Access | `/enterprise/access` | ADM-05 `RolesAccessPage` | viết lại: 3 role. Thêm/gỡ OWNER (xác nhận mạnh: "Bạn đang cấp toàn quyền quản trị doanh nghiệp cho người này."), gán/gỡ MANAGER, gán phòng ban cho Manager (cập nhật `managerEmployeeId` của phòng ban). Chặn mọi thao tác làm tổ chức mất Owner cuối cùng | P0 |
| OW-14 | TT02 Framework Explorer | `/enterprise/framework` | LCA-06 | mở rộng: nhóm theo 6 miền | P0 |
| OW-15 | Competency Detail | `/enterprise/framework/:id` | LCA-07 | mở rộng: danh sách nhân viên đang thiếu | P0 |
| OW-16 | Requirement Set List | `/enterprise/requirements` | | mới: theo vị trí, Draft/Active/Retired, hiệu lực, phiên bản | P0 |
| OW-17 | Position Requirement Builder | `/enterprise/requirements/builder?positionId=&version=` | LCA-04 | mở rộng: cột "Trình độ năng lực yêu cầu", lý do (rationale) cho từng dòng, lý do thay đổi khi lưu | P0 |
| OW-18 | Requirement History | `/enterprise/requirements/history?positionId=` | LCA-05 | mở rộng: người đổi, lý do thay đổi, dòng thời gian | P0 |
| OW-19 | Workforce Competency Matrix | `/enterprise/competency-profiles` | | mới: ma trận nhân viên × năng lực (trình độ hiện tại/đã xác nhận, yêu cầu, gap, trạng thái minh chứng) | P0 |
| OW-20 | Employee Competency Detail | `/enterprise/competency-profiles/:employeeId` | một phần LCA-09 | gộp: dòng thời gian minh chứng | P0 |
| OW-21 | Skill Gap Dashboard | `/enterprise/skill-gap` | LCA-10 `SkillGapAnalyticsPage` | mở rộng: thêm góc nhìn theo Job Grade | P0 |
| OW-22 | Skill Gap Detail | `/enterprise/skill-gap/:employeeId` | `SkillGapDetailDrawer` | đổi từ drawer thành trang: `SkillGapDetailView` + `CourseRecommendations` | P0 |
| OW-23 | Standard Course Catalog | `/enterprise/courses` | | mới: duyệt, xem trước, giao khóa chuẩn của nền tảng | P0 |
| OW-24 | Course Detail | `/enterprise/courses/:id` | | mới: tabs Tổng quan / Năng lực / Module / Đánh giá / Người được giao | P0 |
| OW-25 | Training Batch List | `/enterprise/training-batches` | | mới | P0 |
| OW-26 | Create Training Batch | `/enterprise/training-batches/new` | | mới: wizard chọn đối tượng (phòng ban/vị trí/grade/nhân viên), khóa học, hạn | P0 |
| OW-27 | Training Batch Detail | `/enterprise/training-batches/:id` | | mới: tabs Tổng quan / Người tham gia / Khóa học / Tiến độ / Kết quả | P0 |
| OW-28 | Training Assignment | `/enterprise/assignments` | LCA-12 `CourseAssignmentPage` | mở rộng: chọn đối tượng theo grade, giao từ skill gap | P0 |
| OW-29 | Recommendation Review | `/enterprise/assignments/recommendations` | LCA-11 | giữ | P0 |
| OW-30 | Training Monitor | `/enterprise/training-monitor` | LCA-13 | mở rộng: filter grade | P1 |
| OW-31/32/33 | Internal Course List / Editor / Detail | `/enterprise/internal-courses`, `/:id/edit`, `/:id` | LCA-16/17 (placeholder) | mới, cần entitlement INTERNAL_LEARNING | P1 |
| OW-34 | Assessment Results | `/enterprise/assessment-results` | LCA-14 (placeholder) | mới, xem chi tiết từng lượt làm | P1 |
| OW-35 | Practical Task List | `/enterprise/tasks` | MGR-05 (placeholder) | mới; dùng chung với MG-08 | P0 |
| OW-36 | Create / Assign Task | `/enterprise/tasks/new` | MGR-06 | mới; dùng chung với MG-09 | P0 |
| OW-37 | Task Detail | `/enterprise/tasks/:id` | MGR-08 | mới; dùng chung với MG-10 | P0 |
| OW-38 | Review Queue | `/enterprise/reviews` | MGR-12 | mới; dùng chung với MG-11 | P0 |
| OW-39 | Evidence Evaluation | `/enterprise/reviews/:submissionId` | MGR-10 | mới; dùng chung với MG-12 | P0 |
| OW-40 | Reports & Analytics | `/enterprise/reports` | | mới: tabs Nhân sự / Năng lực / Đào tạo / Đánh giá / Minh chứng | P1 |
| OW-41 | Subscription Overview | `/enterprise/subscription` | ADM-08 `BillingPage` | tách | P0 |
| OW-42 | Plan & Usage | `/enterprise/subscription/usage` | ADM-09 `UsagePage` + ADM-10 `PlanChangeModal` | gộp | P0 |
| OW-43 | Billing / Payment History | `/enterprise/subscription/billing` | phần hóa đơn của `BillingPage` | tách | P1 |
| OW-44 | Organization Settings | `/enterprise/settings` | ADM-07 | giữ | P1 |
| OW-45 | Organization Audit Log | `/enterprise/settings/audit-log` | ADM-11 | giữ | P1 |

**Bỏ:**
- LCA-15 "Sổ chứng nhận": thành tựu xem ở tab của OW-03 và EM-18.
- MGR-11 "Chi tiết bằng chứng": nằm trong OW-39 và EM-04.

### 3.3 MANAGER (sidebar: TỔNG QUAN · NHÓM CỦA TÔI · ĐÁNH GIÁ THỰC TẾ · CÁ NHÂN)

| ID | Trang | Đường dẫn | Từ / dùng lại | Hành động |
|---|---|---|---|---|
| MG-01 | Team Dashboard | `/enterprise/team` | MGR-01 | mới |
| MG-02 | My Team | `/enterprise/team/members` | component danh sách của OW-02, chế độ chỉ đọc, scope theo nhóm | mới (dùng lại) |
| MG-03 | Member Detail | `/enterprise/team/members/:id` | tabs của OW-03, không có thao tác sửa dữ liệu gốc | mới (dùng lại) |
| MG-04 | Team Competency Matrix | `/enterprise/team/competency` | component của OW-19 | mới (dùng lại) |
| MG-05 | Team Skill Gap | `/enterprise/team/skill-gap` | component của OW-21 | mới (dùng lại) |
| MG-06 | Team Training | `/enterprise/team/training` | component của OW-30 | mới (dùng lại) |
| MG-07 | Training Assignment Detail | `/enterprise/team/training/:assignmentId` | | mới, chỉ đọc |
| MG-08..10 | Task List / Create / Detail | cùng route với OW-35..37 | | dùng chung, API trả dữ liệu theo scope |
| MG-11..12 | Review Queue / Evidence Evaluation | cùng route với OW-38..39 | | dùng chung |
| MG-13 | My Learning | = EM-06 | | dùng chung |
| MG-14 | My Competency | = EM-02 | | dùng chung |
| MG-15 | My Tasks / Assessments | = EM-14, EM-09 | | dùng chung |

### 3.4 EMPLOYEE (sidebar: TỔNG QUAN · NĂNG LỰC CỦA TÔI · HỌC TẬP · ĐÁNH GIÁ · NHIỆM VỤ THỰC TẾ · THÀNH TỰU)

| ID | Trang | Đường dẫn | Từ | Hành động |
|---|---|---|---|---|
| EM-01 | My Development Dashboard | `/enterprise/me` | EMP-01 | mới |
| EM-02 | My Competency Profile | `/enterprise/me/competency` | EMP-02 `MyCompetencyProfilePage` | mở rộng: hiển thị Phòng ban/Vị trí/Grade |
| EM-03 | My Skill Gap | `/enterprise/me/skill-gap` | EMP-03 | tách từ MyCompetencyProfilePage, giải thích vì sao có yêu cầu |
| EM-04 | Evidence Timeline | `/enterprise/me/evidence` | EMP-14 | mới |
| EM-05 | Learning Path | `/enterprise/me/learning-path` | | mới |
| EM-06 | My Learning | `/enterprise/me/courses` | EMP-04 | mới |
| EM-07 | Course Detail | `/enterprise/me/courses/:id` | EMP-05 | mới |
| EM-08 | Lesson Viewer | `/enterprise/me/courses/:id/lessons/:lessonId` | EMP-06 | mới |
| EM-09 | Assessment List | `/enterprise/me/assessments` | | mới |
| EM-10..12 | Assessment Intro / Attempt / Result | `/enterprise/me/assessments/:id`, `/attempt`, `/result` | EMP-07..09 | mới |
| EM-13 | Assessment History | `/enterprise/me/assessments/history` | EMP-10 | mới |
| EM-14 | My Tasks | `/enterprise/me/tasks` | EMP-11 | mới |
| EM-15 | Task Detail | `/enterprise/me/tasks/:id` | | mới |
| EM-16 | Submit Evidence | `/enterprise/me/tasks/:id/submit` | EMP-12 | mới |
| EM-17 | Feedback / Revision | `/enterprise/me/tasks/:id/feedback` | EMP-13 | mới |
| EM-18 | Achievements / Certificates | `/enterprise/me/achievements` | EMP-15 | mới |

Các trang "học viên" cũ ở `features/learner` hoặc `features/employee` cho Personal: có thể dùng lại component, nhưng route Enterprise nằm dưới `/enterprise/me`.

### 3.5 PLATFORM_ADMIN (sidebar: TỔNG QUAN · DOANH NGHIỆP · NỘI DUNG NỀN TẢNG · THƯƠNG MẠI · HỆ THỐNG)

| ID | Trang | Đường dẫn | Từ |
|---|---|---|---|
| PA-01 | Platform Dashboard | `/platform/dashboard` | PLT-01 |
| PA-02/03 | Organization List / Detail | `/platform/organizations`, `/:id` | PLT-02/03 |
| PA-04/05 | User Account List / Detail | `/platform/users`, `/:id` | **mới** |
| PA-06/07 | Framework Explorer / Competency Detail (sửa được) | `/platform/framework`, `/:id` | PLT-04 |
| PA-08/09/10 | Curriculum List / Course Detail / Course Editor | `/platform/curriculum`, `/:id`, `/:id/edit` | PLT-05/06 |
| PA-11/12 | Question Bank / Question Editor | `/platform/questions`, `/:id` | PLT-07 |
| PA-13 | Assessment Template | `/platform/assessment-templates` | **mới** |
| PA-14/15 | Reference Position List / Detail | `/platform/reference-positions`, `/:id` | PLT-08/09 |
| PA-16/17 | Plan List / Detail-Edit | `/platform/plans`, `/:id` | PLT-10 |
| PA-18/19 | Subscription List / Detail | `/platform/subscriptions`, `/:id` | PLT-11 |
| PA-20 | Platform Audit | `/platform/audit-log` | PLT-12 |
| PA-21 | System Settings | `/platform/settings` | PLT-13 |

Toàn bộ Platform hiện vẫn là placeholder, nên thực chất là xây mới.

### 3.6 Topbar, avatar và trạng thái dùng chung

| Vị trí | Trang | Đường dẫn |
|---|---|---|
| Topbar | Thông báo: popover và trang "xem tất cả" | `/{enterprise,platform}/notifications` |
| Avatar | Hồ sơ của tôi | `/{…}/account` |
| Avatar | Bảo mật / Đổi mật khẩu | `/{…}/account/security` |
| Avatar | Đăng xuất | — |
| Trạng thái dùng chung | 403, 404, Feature Unavailable (OWNER có nút xem gói), Subscription Expired, Empty State | `features/system/*` (đã có, cần cập nhật theo §3.7) |

### 3.7 Khi gói hết hạn (Q5)

| Role | Hành vi |
|---|---|
| OWNER | Vào được mọi trang của mình ở chế độ **chỉ đọc**: Tổng quan, Thành viên, Năng lực, Đào tạo, Nhiệm vụ, Báo cáo. Mọi nút thay đổi dữ liệu bị tắt, kèm banner "Gói đã hết hạn, gia hạn để tiếp tục" dẫn tới Gói dịch vụ. Các trang Gói dịch vụ, Thanh toán, Gia hạn/Nâng cấp vẫn ghi được. |
| MANAGER, EMPLOYEE | Màn "Gói đã hết hạn" thay cho mọi trang. |
| Tất cả | Không xóa dữ liệu, không reset tiến độ. Khi gói ACTIVE trở lại thì truy cập bình thường. |

Triển khai:
- Thêm cờ `isReadOnly` trong session (subscription `payment_required`/`expired` và role OWNER).
- Hook `useCanWrite()` để các trang tắt nút ghi.
- Mock server trả 402 cho mọi request ghi của tổ chức hết hạn, trừ các endpoint `/subscription/*`.
- `RequireActiveSubscription` cho OWNER đi qua ở chế độ chỉ đọc thay vì chặn.

---

## 4. Thay đổi kỹ thuật

### 4.1 Role (`lib/roles.ts`, `lib/role-policy.ts`, `lib/navigation.ts`)
- `ROLES = { PLATFORM_ADMIN, OWNER, MANAGER, EMPLOYEE }`. Nhãn: Quản trị nền tảng, Chủ doanh nghiệp, Quản lý, Nhân viên.
- Cập nhật `LEGACY_ROLE_MAP` theo §2. Thêm `primaryRole(user)`.
- `getHomePath`: OWNER → `/enterprise/dashboard`, MANAGER → `/enterprise/team`, EMPLOYEE → `/enterprise/me`, PLATFORM_ADMIN → `/platform/dashboard`.
- `role-policy` (Q3):
  - Chỉ OWNER quản lý thành viên và vai trò. Không có quy trình xin/duyệt.
  - OWNER được nâng người khác thành OWNER (modal xác nhận mạnh) và gán/gỡ MANAGER.
  - Bất biến: `owner_count >= 1`. Owner duy nhất không được tự hạ quyền, không bị hạ quyền, không bị vô hiệu hóa. Mock server kiểm tra lại quy tắc này (409) để UI không phải nơi duy nhất chặn.
- **Đổi tên LEARNER → EMPLOYEE chỉ áp dụng cho role RBAC của Enterprise.** Không replace toàn repo. Giữ nguyên các khái niệm learner chung và của Personal (learner progress, learner assessment, component học tập, `features/learner`, `/personal`…). Cách làm: sửa `ROLES` rồi để `tsc` chỉ ra các chỗ dùng `ROLES.LEARNER`; với chuỗi `'LEARNER'` thì sửa từng chỗ sau khi xem ngữ cảnh.
- Đổi route (Q6): đường dẫn cũ (`/enterprise/overview`, `/enterprise/roles`, `/enterprise/billing`, `/enterprise/workforce`…) được redirect sang đường dẫn mới qua một bảng `LEGACY_REDIRECTS` duy nhất. Bảng này xóa ở GĐ J.

### 4.2 Quyền (`hooks/use-permission.ts`, `services/mock/mock-rbac.ts`)
- Giữ key quyền hiện có (mirror backend). Bổ sung key cho: training batch, job grade, practical task (tạo/giao/xem), evidence (đánh giá), gán Manager cho phòng ban. Đặt tên theo quy ước backend và ghi vào danh sách "cần thêm ở backend" (§8).
- Ma trận: OWNER = toàn quyền tổ chức; MANAGER = đọc trong scope + task + evidence, không có quyền giao khóa học (Q4); EMPLOYEE = tự phục vụ. Có test đối chiếu với bảng §10 của spec.
- Ranh giới: OWNER quyết định đào tạo (đợt đào tạo, giao khóa); MANAGER theo dõi nhóm, giao nhiệm vụ thực tế, đánh giá minh chứng. Nếu sau này Manager cần giao khóa cho nhóm thì thêm quyền `TRAINING_ASSIGN_TEAM`, không thêm role.

### 4.3 Sitemap và sidebar
- `lib/screens/enterprise.ts` và `platform.ts` đánh lại ID và đường dẫn theo §3.
- Bỏ trường `nav` khỏi `ScreenDef`. Thêm `aliases?: string[]` cho màn dùng chung (ví dụ OW-35 kèm alias MG-08) để tra cứu theo mã spec.
- Tạo `lib/sidebars/{owner,manager,employee,platform}.ts`. Mỗi file mô tả đúng cây sidebar của spec:
  - nhóm, mục cấp 1 hoặc cấp 2, icon;
  - `screenId` của trang đích;
  - `activeFor: string[]` để mục sáng khi đang ở trang con (ví dụ "Thành viên" sáng ở OW-02 và OW-03).
- Một mục chỉ hiện khi người dùng truy cập được screen đích (role + permission). Thiếu entitlement thì vẫn hiện kèm biểu tượng khóa, bấm vào ra FeatureUnavailable.
- `RoleSidebar` hỗ trợ:
  - mục đơn ở cấp cao nhất (Tổng quan, Báo cáo, Gói dịch vụ, Cài đặt);
  - nhóm có mục con;
  - drawer trên mobile (đã có).
- Test: mỗi screen ID trong sidebar phải tồn tại; mỗi screen P0 có route; mỗi role chỉ thấy đúng các mục trong spec.

### 4.4 Layout
- Topbar: chuông thông báo (popover + đếm chưa đọc) và avatar menu. Bỏ SHR khỏi sidebar.
- Tabs gắn với route cho các trang có nhiều route con (Năng lực của tôi, Gói dịch vụ, Đánh giá), để giữ URL riêng cho từng tab.

### 4.5 Dữ liệu mock (`services/mock/server/*`)

| Thực thể | Thay đổi |
|---|---|
| JobGrade | Mỗi tổ chức có G1–G3 với `displayName` và `description`. Mặc định: G1 Nhân viên, G2 Phó phòng, G3 Trưởng phòng. |
| Position | Thêm `departmentId`, `jobGrade`. Seed Acme: gán grade cho 5 vị trí, có thêm biến thể G2/G3 (ví dụ Trưởng phòng Kế toán). |
| Department | Thêm `managerEmployeeId`. Đây là **nguồn duy nhất** của phạm vi Manager: mỗi phòng ban tối đa một Manager, một Manager quản lý nhiều phòng ban bằng cách được gán ở nhiều phòng. Handler lọc theo `departments where managerEmployeeId = <nhân viên của người gọi>`, giống `EmployeeScope` của backend. **Không** có bảng `manager_scopes` trong MVP. |
| Role MANAGER | Role do OWNER gán ở OW-13, không tự sinh từ phòng ban; phạm vi dữ liệu lấy từ phòng ban. Chỉ người có role MANAGER mới được chọn làm Manager của phòng ban. Người có role MANAGER nhưng chưa phụ trách phòng nào thấy nhóm trống kèm hướng dẫn liên hệ Owner. |
| RequirementSet | Thêm `changeReason`, `changedBy`; mỗi dòng thêm `rationale`. |
| TrainingBatch | Mới: trạng thái Draft / Scheduled / Running / Completed / Cancelled; đối tượng; khóa học; hạn. |
| PracticalTask, Submission, Evaluation | Mới: các trạng thái theo OW-35; đánh giá có thể cập nhật hồ sơ năng lực và kích hoạt tính lại skill gap (dùng lại `engine.ts`). |
| Course (chuẩn) | Đã có trong `catalog.ts`; thêm module, bài học, bài đánh giá để dựng EM-07/08 và EM-10..12. |
| Assessment, Attempt | Mới: câu hỏi mẫu, chấm điểm, số lần làm. Đậu bài **không** tự động thành năng lực đã xác nhận. |
| Notification | Mới: danh sách theo người dùng. |

**Tài khoản demo:**
- Giữ: `owner@`, `manager@`, `starter@`, `expired@`, `personal@`, `platform@`.
- Đổi `learner@` thành `employee@`.
- Bỏ `admin@` và `learning@`. Thêm `owner2@` cho tình huống doanh nghiệp không có Manager.
- Cập nhật `test/session.ts` (`MOCK_EMAILS`).
- Ghi chú: `mock-store` cần migrate localStorage; cách đơn giản nhất là đổi tên key (ví dụ `dt-mock-db-v2`) để dữ liệu cũ không làm hỏng dữ liệu mới.

### 4.6 Thuật ngữ (đã chốt, freeze; áp dụng khi chạm vào từng trang)

| Khái niệm | Nhãn UI | Giá trị | Không dùng |
|---|---|---|---|
| Job Grade | "Cấp bậc" | G1 / G2 / G3 (+ tên hiển thị do Owner đặt) | dùng cho năng lực |
| Trình độ năng lực yêu cầu của vị trí (field 3 giá trị) | "Trình độ năng lực yêu cầu" | Cơ bản / Trung cấp / Nâng cao | "Bậc năng lực yêu cầu", "Grade", "Mức" |
| Trình độ hiện tại / đã xác nhận của nhân viên | "Trình độ hiện tại", "Trình độ đã xác nhận" | như trên, hoặc "Chưa xác nhận" | "Mức" |
| Bậc chi tiết của khung TT02 | "Bậc năng lực" | Bậc 1 … Bậc 8 | dùng cho 3 trình độ |
| Mức độ nghiêm trọng của skill gap | "Mức độ" | Cao / Trung bình / Thấp | — ("Trung bình" chỉ còn ở đây) |
| Training Batch | "Đợt đào tạo" | — | "Phòng đào tạo", "Training Room" |
| System role | "Vai trò" | Chủ doanh nghiệp / Quản lý / Nhân viên | "Cấp bậc" |

Quy tắc: UI không bao giờ ghép "Cấp bậc" với trình độ năng lực, và không gọi Cơ bản/Trung cấp/Nâng cao là "bậc". Nhãn phụ "bậc 3–4" (khi cần giải thích Trung cấp tương ứng bậc nào của TT02) vẫn đúng vì đó là Bậc năng lực của khung.

Hiện trạng: `lib/competency-levels.ts` đã dùng "Trung cấp" (đổi ngày 01/10, xem `2026-09-29-tt02-position-competency-matrix.md`). Vẫn còn test và nhãn "Mức yêu cầu/Mức xác nhận" cần đổi sang "Trình độ…".

Đặt glossary tại `lib/terms.ts` để các trang dùng chung một nguồn nhãn.

---

## 5. Lộ trình triển khai

Mỗi giai đoạn chỉ xong khi đạt đủ: `tsc -b` sạch, vitest xanh, lint không có lỗi mới, `check:no-mock` qua, kiểm tra trên trình duyệt (desktop + 375px), đã chạy code-reviewer, đã cập nhật tài liệu.

| GĐ | Nội dung | Kết quả chính | Cỡ |
|---|---|---|---|
Cập nhật sau kiểm kê §10: nhiều màn Manager, Employee, Task, Learning và Platform **đã có code** do hai agent trước dựng theo spec v1.0. Vì vậy E, F, G, I chủ yếu là **chỉnh theo v2.1** chứ không xây mới, nên nhỏ hơn ước lượng ban đầu.

| GĐ | Nội dung | Kết quả chính | Cỡ |
|---|---|---|---|
| **A0** | Nền xanh: sửa test flaky `signup-journeys`; chạy toàn bộ test (kể cả test của team/tasks/learning/platform do agent trước viết); review nhanh code hai agent trước để nắm chất lượng | Nền xanh trước khi refactor | S |
| **A** | Nền tảng v2.1: role mới (§4.1), quyền (§4.2), sitemap đánh số lại (§3), sidebar theo role (§4.3), topbar/avatar (§4.4), glossary, tài khoản demo, dữ liệu Grade và Manager của phòng ban (§4.5), chế độ chỉ đọc khi hết hạn (§3.7), redirect đường dẫn cũ (§4.1). Đăng ký lại **mọi trang đang có** theo ID mới đúng bảng §10. **Xóa** các mục ở §10.3 | Đăng nhập bằng 4 role thấy đúng sidebar của spec; không mất trang nào được giữ | L |
| **B** | Owner, nhóm Tổ chức: OW-01 (gộp), OW-02..05 (gộp Members + Workforce), OW-06..08, OW-09..12 (Grade), OW-13 (Owner/Manager). Cập nhật AUTH-04/05 (bước Grades, Members) | Luồng 11.1 + 11.2 chạy được | L |
| **C** | Owner, nhóm Năng lực: OW-16 (mới), OW-17/18 (rationale, lý do thay đổi), OW-19/20 (ma trận, chi tiết hồ sơ), OW-21 (theo Grade), OW-22 (trang chi tiết) | Luồng 11.3 chạy được | M |
| **D** | Owner, nhóm Đào tạo: OW-23/24 (catalog, chi tiết khóa), OW-25..27 (Đợt đào tạo), OW-28 (giao theo grade/gap) | Phần đầu luồng 11.4 | L |
| **E** | Employee: chỉnh EM-01..04, 06..08, 10..13, 18 đã có; làm mới EM-05 (lộ trình), EM-09 (danh sách bài đánh giá) | Nhân viên học và làm bài được | M |
| **F** | Nhiệm vụ và minh chứng: chỉnh các trang tasks đã có cho OWNER (toàn tổ chức) và MANAGER (nhóm); làm mới EM-15; đánh giá cập nhật hồ sơ và tính lại gap | Khép vòng 11.4 và 11.5 (SME không có Manager) | M |
| **G** | Manager: chỉnh MG-01/02/03/05 đã có; làm mới MG-04, MG-06, MG-07 (dùng lại component của Owner) | Manager làm việc trong phạm vi nhóm | M |
| **H** | P1 Owner: OW-30, OW-31..33, OW-34, OW-40 (mới), OW-43, thông báo | Đủ P1 của spec | M |
| **I** | Platform: đổi PLT → PA; làm mới PA-04/05 (người dùng), PA-07, PA-09, PA-12, PA-13, PA-17, PA-19 | Cổng Platform đầy đủ; SYSTEM_ADMIN không cần kèm OWNER | M |
| **J** | Dọn dẹp: xóa redirect, code và role cũ còn sót; a11y; tách bundle theo route; tài liệu hợp đồng API (§8) | Sẵn sàng nối backend | M |

**Thứ tự ưu tiên P0 theo §14 của spec** nằm trong A–G. Có thể làm song song D với E, và G với F nếu có nhiều người.

---

## 6. Rủi ro và cách giảm

| Rủi ro | Giảm thiểu |
|---|---|
| Đổi role và ID làm vỡ rất nhiều test cùng lúc | Làm GĐ A trong một nhánh/PR riêng. Chạy `grep` để chắc không còn `ORG_ADMIN`, `LEARNING_ADMIN`, `LEARNER`. Viết test sidebar theo role trước (TDD). |
| Gộp Members + Workforce và MemberDetail + EmployeeCapability làm trang quá nặng | Dùng tabs gắn route, mỗi tab tự query; giữ component cũ làm nội dung tab. |
| Owner gánh quá nhiều mục sidebar (khoảng 22 mục) | Nhóm có thể thu gọn, nhớ trạng thái mở theo người dùng (localStorage); trang đích có tabs. |
| Backend chưa có grade, Manager của phòng ban, batch, task | Mọi thứ chạy trên mock; §8 liệt kê thay đổi backend/SQL cần làm trước khi nối. |
| Dữ liệu localStorage cũ của mock không khớp schema mới | Đổi key lưu trữ (§4.5). |
| Code của hai agent trước (theo spec v1.0) chưa được review và có thể dùng role cũ, nhãn cũ ("Trung bình", "Mức") | A0 chạy test và review nhanh; A sửa role; các GĐ sau áp glossary khi chạm từng trang. Prompt `2026-10-01-agent2-platform-portal-prompt.md` đã lỗi thời, không dùng nữa. |

---

## 7. Phần giữ nguyên

- Cổng Personal `/personal/*`, landing/pricing/đăng ký cá nhân.
- Guard và thứ tự kiểm tra truy cập (FLOW-07); cơ chế mock và `check:no-mock`.
- Engine skill gap và đề xuất (`engine.ts`), các trang đã dựng ở GĐ 2 (dùng lại làm thành phần).

---

## 8. Việc phía backend (ghi nhận, chưa làm)

- **SQL canonical:**
  - bảng `job_grades` (tổ chức, mã G1–G3, tên, mô tả);
  - `job_positions.job_grade_code`, `job_positions.department_id`;
  - `departments.manager_employee_id` (nguồn duy nhất của phạm vi Manager; không có `manager_scopes`);
  - bất biến tổ chức luôn có ít nhất một OWNER đang hoạt động (kiểm tra trong use case gán role/vô hiệu hóa);
  - `training_batches` (+ participants, courses);
  - `position_requirement_sets.change_reason` và `rationale` cho từng dòng;
  - practical task / submission / evaluation (một phần đã có trong chuỗi `task_*`).
- **RBAC:** role mới OWNER, MANAGER, EMPLOYEE, PLATFORM_ADMIN thay cho 5 role cũ; quyền mới ở §4.2; cập nhật `RolePermissions` và `DbSeeder`.
- **SRS/BRD:** cập nhật actor và luồng theo spec v2.1.

---

## 9. Quyết định đã chốt (2026-10-01)

| # | Quyết định |
|---|---|
| Q1 | Giữ nguyên `/personal`; Individual nằm ngoài spec v2.1, không sửa trong đợt này. |
| Q2 | Ẩn Nhóm công việc (Job Family) khỏi UI, giữ dữ liệu và schema. |
| Q3 | Một tổ chức có thể có nhiều OWNER. OW-13 cho OWNER thêm OWNER khác (xác nhận mạnh, không cần quy trình duyệt) và gán/gỡ MANAGER. Bất biến `owner_count >= 1`: Owner duy nhất không được tự hạ quyền, không bị hạ quyền, không bị vô hiệu hóa. |
| Q4 | MVP: MANAGER không giao khóa học, chỉ theo dõi đào tạo. OWNER chịu trách nhiệm phân công đào tạo. Mở rộng sau bằng quyền `TRAINING_ASSIGN_TEAM`. |
| Q5 | Gói hết hạn: OWNER chỉ đọc toàn bộ, vẫn ghi được Gói dịch vụ/Thanh toán/Gia hạn; MANAGER và EMPLOYEE thấy màn hết hạn. Không xóa dữ liệu, không reset tiến độ (§3.7). |
| Q6 | Đổi route theo §3. Giữ redirect từ đường dẫn cũ trong thời gian chuyển đổi, xóa ở GĐ J. |
| Q7 | Thuật ngữ theo §4.6: "Cấp bậc" chỉ cho G1–G3; "Trình độ năng lực yêu cầu" với Cơ bản / Trung cấp / Nâng cao (không dùng "Trung bình"); "Bậc năng lực" chỉ cho Bậc 1–8 của TT02. |
| Q8 | OWNER không có mục Cá nhân trong MVP; Owner là tài khoản quản trị, không mặc định là người học. |
| Bổ sung | Phạm vi Manager chỉ lấy từ `departments.managerEmployeeId` (mỗi phòng tối đa một Manager, một Manager nhiều phòng); bỏ `manager_scopes` khỏi MVP. |
| Bổ sung | Đổi tên LEARNER → EMPLOYEE chỉ cho role RBAC Enterprise; không replace các khái niệm learner chung hoặc của Personal. |

---

## 10. Kiểm kê trang hiện có → spec v2.1 (2026-10-01)

Kiểm kê toàn bộ `frontend/src/features/*/pages`, gồm cả các trang do hai agent trước dựng theo spec v1.0. Ký hiệu cột **Quyết định**:
- **Giữ**: đổi ID, route và role, sửa nhãn.
- **Gộp vào X**: chuyển nội dung hoặc component sang trang X rồi xóa file trang.
- **Tách**: một trang thành nhiều route.
- **Xóa**.

### 10.1 Enterprise

| File hiện tại | Mã cũ | Mã v2.1 | Quyết định |
|---|---|---|---|
| `organization/pages/OrganizationOverviewPage` | ADM-01 | OW-01 | Gộp với `CapabilityDashboardPage` thành OW-01 |
| `intelligence/pages/CapabilityDashboardPage` | LCA-01 | OW-01 | Gộp vào OW-01 (phần radar và "cần chú ý") |
| `members/pages/MembersPage` | ADM-02 | OW-02 | Giữ làm nền của OW-02; thêm cột và filter của `WorkforcePage` |
| `workforce/pages/WorkforcePage` | LCA-08 | — | Gộp vào OW-02 rồi xóa |
| `members/pages/MemberDetailPage` | ADM-03 | OW-03 | Giữ làm nền; thêm tabs |
| `workforce/pages/EmployeeCapabilityPage` | LCA-09 | OW-03 (tabs Năng lực, Skill gap, Học tập) + OW-20 | Tách thành component tab; phần dòng thời gian minh chứng thành OW-20; xóa file trang |
| `members/components/InviteMembersModal`, `MemberDialogs` | — | OW-04, OW-05 | Giữ (modal / drawer) |
| `members/pages/RolesAccessPage` | ADM-05 | OW-13 | Giữ, viết lại theo Q3 |
| `organization/pages/DepartmentListPage` | ADM-06 | OW-06 | Giữ, mở rộng |
| `organization/components/DepartmentFormDialog` | — | OW-08 | Giữ, thêm chọn Manager |
| `organization/pages/PositionListPage` | LCA-02 | OW-09 | Giữ; **bỏ tab Nhóm công việc** (Q2) |
| `organization/components/JobPositionFormDialog` | — | OW-11 | Giữ, thêm phòng ban và Grade |
| `organization/components/JobFamilyFormDialog` | — | — | Xóa (Q2: ẩn UI; service `job-family` giữ lại vì dữ liệu vị trí còn tham chiếu) |
| `organization/pages/PositionDetailPage` | LCA-03 | OW-10 | Giữ, thêm tab Lịch sử yêu cầu |
| `competency/pages/CompetencyFrameworkPage` | LCA-06 | OW-14 | Giữ |
| `competency/pages/CompetencyDetailPage` | LCA-07 | OW-15 | Giữ |
| `competency/pages/PositionRequirementsPage` | LCA-04 | OW-17 | Giữ |
| `competency/pages/RequirementHistoryPage` | LCA-05 | OW-18 | Giữ (dùng cả làm tab của OW-10) |
| `intelligence/pages/SkillGapAnalyticsPage` | LCA-10 | OW-21 | Giữ |
| `intelligence/pages/SkillGapPage` | (tab trong LCA-10) | tab của OW-21 | Giữ làm component; bỏ chế độ trang độc lập |
| `intelligence/components/SkillGapDetailDrawer` | — | OW-22 | Đổi thành trang OW-22 dùng `SkillGapDetailView` + `CourseRecommendations`; xóa drawer |
| `intelligence/pages/RecommendationReviewPage` | LCA-11 | OW-29 | Giữ |
| `assignments/pages/CourseAssignmentPage` | LCA-12 | OW-28 | Giữ |
| `assignments/pages/TrainingMonitorPage` | LCA-13 | OW-30, MG-06 | Giữ; dùng chung cho Manager (phạm vi nhóm) |
| `assignments/pages/AssessmentResultsOverviewPage` | LCA-14 | OW-34 | Giữ |
| `assignments/pages/CertificateRegistryPage` | LCA-15 | — | **Xóa**: spec v2.1 không có sổ chứng nhận cho Owner; thành tựu xem ở tab của OW-03 |
| `assignments/pages/InternalCourseListPage` | LCA-16 | OW-31 | Giữ |
| `assignments/pages/InternalCourseEditorPage` | LCA-17 | OW-32 | Giữ; OW-33 (chi tiết, giao) làm mới |
| `billing/pages/BillingPage` | ADM-08 | OW-41 + OW-43 | Tách: phần gói thành OW-41, phần hóa đơn thành OW-43 |
| `billing/pages/UsagePage` + `PlanChangeModal` | ADM-09/10 | OW-42 | Giữ |
| `organization/pages/OrganizationSettingsPage` | ADM-07 | OW-44 | Giữ |
| `organization/pages/AuditLogPage` | ADM-11 | OW-45 | Giữ |
| `team/pages/TeamCapabilityDashboardPage` | MGR-01 | MG-01 | Giữ |
| `team/pages/TeamMembersPage` | MGR-02 | MG-02 | Giữ |
| `team/pages/TeamMemberDetailPage` | MGR-03 | MG-03 | Giữ; dùng chung component tab với OW-03 (chỉ đọc) |
| `team/pages/TeamSkillGapPage` | MGR-04 | MG-05 | Giữ (đổi mã) |
| `tasks/pages/PracticalTaskListPage` | MGR-05 | OW-35 = MG-08 | Giữ; mở cho OWNER |
| `tasks/pages/CreatePracticalTaskPage` | MGR-06 | OW-36 = MG-09 | Giữ |
| `tasks/pages/TaskDetailPage` | MGR-08 | OW-37 = MG-10 | Giữ |
| `tasks/pages/ReviewQueuePage` | MGR-12 | OW-38 = MG-11 | Giữ |
| `tasks/pages/EvaluateEvidencePage` | MGR-10 | OW-39 = MG-12 | Giữ; route đổi thành `/enterprise/reviews/:submissionId` |
| `tasks/pages/EvidenceDetailPage` | MGR-11 | — | **Xóa**: spec không có màn này; nội dung nằm trong OW-39, OW-20, EM-04 |
| `employee/pages/MyDevelopmentDashboardPage` | EMP-01 | EM-01 | Giữ |
| `employee/pages/MyCompetencyProfilePage` | EMP-02 | EM-02 | Giữ; bỏ phần trùng với EM-03 |
| `employee/pages/MySkillGapPage` | EMP-03 | EM-03 | Giữ |
| `employee/pages/EvidencePortfolioPage` | EMP-14 | EM-04 | Giữ (đổi mã) |
| `employee/pages/MyLearningPage` | EMP-04 | EM-06 | Giữ |
| `learning/pages/CourseDetailPage` | EMP-05 | EM-07 | Giữ |
| `learning/pages/LessonViewerPage` | EMP-06 | EM-08 | Giữ |
| `learning/pages/AssessmentIntroPage` | EMP-07 | EM-10 | Giữ |
| `learning/pages/AssessmentAttemptPage` | EMP-08 | EM-11 | Giữ |
| `learning/pages/AssessmentResultPage` | EMP-09 | EM-12 | Giữ |
| `learning/pages/AssessmentHistoryPage` | EMP-10 | EM-13 | Giữ |
| `employee/pages/MyPracticalTasksPage` | EMP-11 | EM-14 | Giữ |
| `employee/pages/SubmitEvidencePage` | EMP-12 | EM-16 | Giữ; EM-15 (chi tiết nhiệm vụ) làm mới hoặc tách phần đầu trang này |
| `employee/pages/TaskFeedbackPage` | EMP-13 | EM-17 | Giữ |
| `employee/pages/MyCertificatesPage` | EMP-15 | EM-18 | Giữ |
| `account/pages/AccountProfilePage`, `SecuritySettingsPage` | SHR-01/02 | avatar menu | Giữ; bỏ khỏi sidebar |
| `notifications/pages/NotificationsPage` | SHR-03 | chuông trên topbar | Giữ làm trang "xem tất cả"; thêm popover |

**Trang Enterprise còn phải làm mới:**
- Owner: OW-07, OW-12, OW-16, OW-19, OW-22 (trang), OW-23, OW-24, OW-25..27, OW-33, OW-40.
- Manager: MG-04, MG-06 (dùng lại OW-30), MG-07.
- Employee: EM-05, EM-09, EM-15.

### 10.2 Platform (đổi PLT → PA)

| File hiện tại | Mã cũ | Mã v2.1 | Quyết định |
|---|---|---|---|
| `platform/pages/PlatformDashboardPage` | PLT-01 | PA-01 | Giữ |
| `PlatformOrganizationsPage`, `PlatformOrgDetailPage` | PLT-02/03 | PA-02/03 | Giữ |
| `PlatformFrameworkPage` | PLT-04 | PA-06 | Giữ; PA-07 (chi tiết, sửa được) làm mới |
| `PlatformCurriculumPage` + `PlatformCoursesPage` | PLT-05/06 | PA-08 | Gộp thành một danh sách chương trình chuẩn |
| `PlatformCourseEditorPage` | PLT-06E | PA-10 | Giữ; PA-09 (chi tiết khóa) làm mới |
| `PlatformAssessmentBankPage` | PLT-07 | PA-11 | Giữ; PA-12, PA-13 làm mới |
| `PlatformPositionsPage`, `PlatformPositionRequirementsPage` | PLT-08/09 | PA-14/15 | Giữ |
| `PlatformPlansPage` | PLT-10 | PA-16 | Giữ; PA-17 làm mới |
| `PlatformSubscriptionsPage` | PLT-11 | PA-18 | Giữ; PA-19 làm mới |
| `PlatformAuditLogPage`, `PlatformSettingsPage` | PLT-12/13 | PA-20/21 | Giữ |

**Còn làm mới:** PA-04, PA-05 (tài khoản người dùng), PA-07, PA-09, PA-12, PA-13, PA-17, PA-19.

### 10.3 Xóa

| Mục | Lý do |
|---|---|
| `features/experience/*` (khoảng 30 file `.jsx`, 4.000 dòng), route `/experience`, hai link "trải nghiệm" trong `PublicLayout` | Bản port giao diện demo cũ (`fontend-demo`, thư mục gốc đã bị xóa trong working tree). Không thuộc spec v1.0 lẫn v2.1, trùng chức năng với các cổng thật, là nguồn chính của warning lint. **Cần người dùng xác nhận vì đây là code đã commit.** |
| `assignments/pages/CertificateRegistryPage` | Không có trong v2.1 (§10.1) |
| `tasks/pages/EvidenceDetailPage` | Không có trong v2.1 (§10.1) |
| `organization/components/JobFamilyFormDialog` + tab Nhóm công việc | Q2 |
| `workforce/pages/WorkforcePage`, `EmployeeCapabilityPage`, `organization/pages/OrganizationOverviewPage`, `intelligence/pages/CapabilityDashboardPage`, `intelligence/components/SkillGapDetailDrawer` | Xóa sau khi đã gộp nội dung (GĐ B, C) |
| `components/layout/MainLayout` | Kiểm tra lại ở GĐ A: nếu layout Enterprise/Platform đã thay thế thì xóa |
| Prompt `docs/specs/2026-10-01-agent2-platform-portal-prompt.md` | Lỗi thời; đánh dấu thay thế bằng kế hoạch này |

### 10.4 Giữ nguyên (ngoài phạm vi v2.1)

- Public: `portal/*`, `public/*` (landing business và individual, `/careers`), `commerce/*`, `auth/*`, `onboarding/*` (sẽ mở rộng ở GĐ B), `system/*`.
- Personal (Q1): `learner/*` và `/personal/*`, gồm cả placeholder IND-17/18.

---

## 11. Kết quả triển khai (Giai đoạn J hoàn thành)

### 11.1 Dọn dẹp code chết và màn hình cũ (§10.3)
- Đã loại bỏ hoàn toàn trường `nav` khỏi `lib/screens/types.ts`.
- Đã xóa các màn hình cũ không thuộc spec v2.1:
  - `features/billing/pages/BillingPage.tsx` (thay bằng cụm trang OW-41, OW-42, OW-43).
  - `features/workforce/pages/WorkforcePage.tsx` (gộp vào OW-02 `MembersPage` và xóa thư mục `features/workforce`).
  - `features/workforce/pages/EmployeeCapabilityPage.tsx` (gộp vào các tabs của `MemberDetailPage` và `EmployeeCompetencyProfilePage`).
  - `features/tasks/pages/EvidenceDetailPage.tsx` (không có trong v2.1; nội dung minh chứng nằm trong OW-39, OW-20, EM-04).
  - `features/intelligence/pages/CapabilityDashboardPage.tsx` (gộp vào OW-01 `OrganizationOverviewPage`).
- Màn hình `OW-20` (`/enterprise/competency-profiles/:employeeId`) đã được triển khai chính thức bằng `EmployeeCompetencyProfilePage`, tích hợp đầy đủ các component tab chuẩn (`CompetencyTab`, `SkillGapTab`, `EvidencesTab` với dòng thời gian minh chứng, `LearningTab`, `AssessmentsTab`, `TasksTab`), liên kết quay lại ma trận năng lực `OW-19`.

### 11.2 Điều hướng và Redirect đường dẫn cũ (Q6, §3.7)
- `enterprise-pages` (`owner.ts`, `manager.ts`, `work.ts`) chỉ còn đăng ký mã màn hình v2.1 chuẩn (`OW-*`, `MG-*`, `SHR-*`), đã loại bỏ toàn bộ route sống của các mã cũ (`LCA-01`, `LCA-08`, `LCA-09`, `MGR-01`, `MGR-11`, v.v.).
- Bảng `legacyRedirectRoutes` trong `legacy-redirects.tsx` đã xử lý đầy đủ các URL cũ:
  - `/enterprise/workforce` → redirect sang `/enterprise/members` (OW-02).
  - `/enterprise/workforce/:id` → redirect sang `/enterprise/members/:id` (OW-03).
  - `/organization/employees` → redirect sang `/enterprise/members` (sửa lỗi trước đó redirect vào route cũ `/enterprise/workforce`).
  - `/enterprise/billing` → redirect sang `/enterprise/subscription` (OW-41).
  - `/enterprise/capability` → redirect sang `/enterprise/dashboard` (OW-01).
  - `/enterprise/team-overview` → redirect sang `/enterprise/team` (MG-01).
  - `/enterprise/reviews/evidence/:id` → redirect sang `/enterprise/reviews` (OW-38 / MG-11).

### 11.3 Chuẩn hóa Glossary và Thuật ngữ (§4.6)
- Đã sửa toàn bộ các vi phạm thuật ngữ còn sót:
  - "Mức yêu cầu" → "Trình độ yêu cầu" tại `RequirementDomainSection.tsx:95`, `PositionDetailPage.tsx`, nhãn mặc định `CompetencyRadarChart.tsx:36`, và `SkillGapAnalyticsView.tsx:385`.
  - "Mức xác nhận" → "Trình độ xác nhận" tại `ConfirmLevelDialog.tsx:104` và `ConfirmLevelDialog.test.tsx:48`.
  - "Mức đáp ứng" → "Tỷ lệ đáp ứng năng lực" tại `SkillGapPage.tsx:108`, `SkillGapKpiCards.tsx:26`, `SkillGapAnalyticsView.tsx:127, 323`, và `OrganizationOverviewPage.tsx:89`.
  - Thống nhất quy tắc không dùng "Mức" cho trình độ (dùng "Trình độ"), không dùng "Bậc" cho 3 cấp Cơ bản/Trung cấp/Nâng cao (dùng cho 8 bậc TT02).

### 11.4 Chuẩn hóa vai trò và Test
- Chuyển đổi toàn bộ các test suite từ vai trò cũ (`LEARNING_ADMIN`, `LEARNER`) sang 4 vai trò chuẩn v2.1 (`OWNER`, `MANAGER`, `EMPLOYEE`, `PLATFORM_ADMIN`).
- Các tham chiếu vai trò legacy chỉ còn tồn tại trong `roles-navigation.test.ts` để kiểm thử logic ánh xạ ngược (backward-compatibility).

### 11.5 Tiêu chuẩn nghiệm thu chất lượng (Quality Gate)
- `npx tsc -b`: 0 lỗi typecheck (exit code 0).
- `npx vitest run`: 60/60 test files passed, 687/687 tests passed 100% xanh.
- `npm run lint`: Oxlint 0 lỗi.
- `npm run check:no-mock`: Đạt yêu cầu không lọt mã mock vào bundle sản xuất (exit code 0).
- `CLAUDE.md`: Đã cập nhật 4 canonical role, cấu hình sidebar theo role, mock REST server và 8 tài khoản demo.
- Kiểm tra trình duyệt thực tế với cả 8 tài khoản demo (`owner@`, `owner2@`, `manager@`, `employee@`, `platform@`, `personal@`, `starter@`, `expired@digitalent.demo`) qua Chrome CDP automation (`scripts/test-demo-accounts-browser.mjs`) và bộ test `src/test/demo-accounts-e2e.test.tsx`: 100% PASS (đúng landing route, đúng sidebar theo vai trò, redirect URL cũ thành công, chặn quyền trang không thuộc vai trò với 403, kích hoạt banner chỉ đọc khi hết hạn).
- Đã chạy code-reviewer: xác nhận tuân thủ toàn diện ranh giới sở hữu code, kiến trúc dynamic routes từ sitemap, phân quyền 4 lớp guard, zero mock leak và sạch glossary.
