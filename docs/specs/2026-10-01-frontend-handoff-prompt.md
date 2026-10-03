# Bàn giao frontend DigiTalent AI: báo cáo và prompt cho agent tiếp theo

> [!WARNING]
> **TÀI LIỆU LỖI THỜI (OBSOLETE)**
> Tài liệu này được lập ngày 2026-10-01 theo spec v1.0 và đã được **thay thế hoàn toàn** bởi [2026-10-01-frontend-spec-v2.1-alignment-plan.md](2026-10-01-frontend-spec-v2.1-alignment-plan.md) (Spec v2.1: 4 vai trò chuẩn PLATFORM_ADMIN, OWNER, MANAGER, EMPLOYEE, 119 màn hình, giao diện Mực & Giấy, phân định rõ Agent 1 / Agent 2).
> Mọi hướng dẫn, danh sách vai trò cũ (HR_MANAGER, LEARNING_ADMIN, LEARNER, TRAINER) và các mục tiêu trong tài liệu này không còn hiệu lực.

Ngày: 2026-10-01 · Nhánh: `feature/ui-restructure-foundation` · **Chưa commit gì** (working tree còn lẫn công việc landing của người dùng, không tự commit).

## A. Đã làm

**Quyết định đã chốt với người dùng:** role `SYSTEM_ADMIN→PLATFORM_ADMIN`, `HR_MANAGER→ORG_ADMIN+LEARNING_ADMIN`, `DEPARTMENT_MANAGER→MANAGER`, `EMPLOYEE→LEARNER`, bỏ `TRAINER`, thêm `OWNER`. URL `/enterprise`, `/personal` (thay `/learn`), `/platform`. Toàn bộ UI tiếng Việt. Thanh toán chỉ giả lập (chọn gói → QR → "thanh toán thành công"). Training Risk/Readiness gộp vào LCA-01/LCA-10. Bỏ `/verify`. Nguồn: `DigiTalent_AI_Danh_Sach_Man_Hinh_va_Luong_UI_UX_v1.0.docx` (119 màn hình). Kế hoạch: `docs/specs/2026-10-01-frontend-ui-ux-restructure-plan.md` (§9.1, §9.2 là kết quả Giai đoạn 0 và 1).

- **Giai đoạn 0 (xong, đã review):** role mới, entitlement, sitemap (`lib/screens/{enterprise,platform}.ts`), sidebar và route sinh từ sitemap, guard (`RequireWorkspace/Role/Permission/Entitlement/ActiveSubscription/Onboarded`), `PlaceholderPage`.
- **Giai đoạn 1 (xong, đã review):** chọn cổng, landing business/individual, bảng giá, đăng ký, checkout QR giả lập, wizard thiết lập tổ chức, kích hoạt lời mời, quên/đặt lại mật khẩu, mock layer (`services/mock/*`, localStorage `dt-mock-db`), `check:no-mock`.
- **Giai đoạn 2 (gần xong, CHƯA review):**
  - Mock REST server (`services/mock/server/*`) gắn vào `apiClient` khi `VITE_USE_MOCK=true`; engine skill gap/đề xuất khớp số liệu demo.
  - Trang đã nối vào `ENTERPRISE_PAGES`: ADM-01/02/03/05/06/07/08/09/11; LCA-01/02/03/04/05/06/07/08/09/10/11/12/13; EMP-02.
  - Mới trong phiên này: `RequirementHistoryPage` (LCA-05), `CompetencyDetailPage` (LCA-07), Khung năng lực chuyển sang chỉ-đọc kèm link chi tiết, `PositionRequirementsPage` đọc `?positionId=&version=`, `WorkforcePage` đọc `?departmentId=&jobPositionId=&gap=`, `PositionListPage` có link sang LCA-03.
  - Dịch tiếng Việt: toàn bộ intelligence (SkillGap*, ConfirmLevelDialog, CourseRecommendations, SeverityBadge…), `MyCompetencyProfilePage`, `lib/competency-levels.ts` (`levelLabel` giờ là tiếng Việt), Department/Position list + 3 form dialog, PositionRequirements + RequirementDomainSection.
  - Sửa lỗi: `DataTable` trước đây ẩn hẳn cột `hideOnMobile` ở mọi cỡ màn hình, nay chỉ ẩn dưới breakpoint `md`; `test/session.ts` dùng token `mock-token:<id>`.
  - Xoá `EmployeeListPage`, `EmployeeFormDialog` và test (đã thay bằng WorkforcePage).
  - Test: nâng `testTimeout` 20s (`vitest.config.ts`), `asyncUtilTimeout` 5s (`src/test/setup.ts`), `router.test.tsx` bật mock.
- **Trạng thái kiểm tra gần nhất:** `tsc -b` sạch; vitest 462/462 ở 1 lần chạy, nhưng có **1 lần** `signup-journeys.test.tsx > takes a buyer from the pricing page to a ready organization` fail khi chạy song song (nghi flaky do tải chậm, chưa tìm ra nguyên nhân gốc); `npm run lint` chỉ có warning cũ ở `features/experience/*.jsx`.

## B. Prompt cho agent tiếp theo

```
Bạn tiếp tục dự án DigiTalent AI (monorepo, làm việc trong D:\digitalent-ai\frontend). Đọc trước: CLAUDE.md (mục Frontend), docs/specs/2026-10-01-frontend-ui-ux-restructure-plan.md và docs/specs/2026-10-01-frontend-handoff-prompt.md (mục A: những gì đã làm). Trả lời tiếng Việt. Chỉ commit khi người dùng yêu cầu; working tree đang lẫn thay đổi landing của người dùng, đừng revert. Lệnh shell trong frontend: npm test, npx tsc -b, npm run lint, npm run check:no-mock. Không dùng Python (máy không có); dùng Node script hoặc Edit.

Mục tiêu: hoàn thành frontend (chạy trên dữ liệu mock, VITE_USE_MOCK=true) theo file mô tả 119 màn hình. Quy ước bắt buộc: sitemap-driven (thêm trang vào ENTERPRISE_PAGES / PLATFORM_PAGES theo ID màn hình, không viết route/sidebar tay); API chỉ qua apiClient; TanStack Query + Zustand; UI hoàn toàn tiếng Việt; mock code không được lọt vào bản production (giữ check inline import.meta.env.VITE_USE_MOCK === 'true'); mọi trang có state loading/error/empty và truy cập được bằng bàn phím; tên trang mới cần test.

VIỆC 1 — Chốt Giai đoạn 2
1. Tìm và sửa nguyên nhân flaky của signup-journeys.test.tsx (chạy `npx vitest run` 3 lần liên tiếp phải xanh). Không chỉ tăng timeout nếu có nguyên nhân thật.
2. Quét chuỗi tiếng Anh còn sót trong features/ (grep các nhãn như "Loading", "Create", "Save", "Cancel", "No ... found") và dịch; cập nhật test tương ứng. Trang cũ chưa rà: features/experience/*, features/employee/*, features/auth còn lại.
3. Dọn code mồ côi: CompetencyFormDialog, hook/service của tính năng đã bỏ (create/archive competency, employee CRUD) nếu không còn nơi dùng; kiểm tra bằng grep trước khi xoá.
4. Viết test UI/journey cho các trang Giai đoạn 2 chưa có test: Members (mời, đổi vai trò, vô hiệu hoá theo role-policy), Billing (đổi gói, huỷ gia hạn), Usage, Organization Overview/Settings/AuditLog, PositionDetail, Workforce (đọc query params), EmployeeCapability, CourseAssignment, TrainingMonitor, RecommendationReview, CapabilityDashboard, SkillGapAnalytics.
5. Kiểm tra trình duyệt thật (npm run dev với VITE_USE_MOCK=true, đăng nhập các tài khoản owner@/admin@/learning@/manager@/learner@ digitalent.demo, mật khẩu Admin@1234): đi qua từng trang mới, kiểm tra mobile (375px) và bảng DataTable.
6. Chạy agent code-reviewer (và security-reviewer cho phần members/billing), sửa CRITICAL/HIGH.
7. Cập nhật docs: thêm §9.3 "Kết quả Giai đoạn 2" vào file plan; cập nhật CLAUDE.md (mục Mock mode: mock REST server tại services/mock/server, handlers, seed Acme, role-policy, các trang đã dựng).

VIỆC 2 — Giai đoạn 3: vòng lặp năng lực của Manager (MGR-*) và Learner (EMP-*)
Dựng các màn hình MGR-* và EMP-* còn là placeholder trong lib/screens/enterprise.ts (xem cột roles). Mở rộng mock server (services/mock/server/handlers/*) cho dữ liệu cần thêm: nhóm của manager, duyệt/đề xuất, lộ trình học, bài đánh giá, chứng nhận. Tái dùng engine skill gap/đề xuất (engine.ts). LCA-14/15 (kết quả đánh giá, sổ chứng nhận) và LCA-16–18 (khóa học nội bộ, cần entitlement INTERNAL_LEARNING) làm ở giai đoạn này hoặc 6 tuỳ phụ thuộc dữ liệu.

VIỆC 3 — Giai đoạn 4: cổng Personal (PUB-03, IND-*)
Chuyển các trang learn/ cũ thành /personal/* theo sitemap; LandingPage.tsx hiện có là landing cá nhân (PUB-03). Hành trình cá nhân: đăng ký → chọn gói → QR giả lập → học. Nhớ redirect /learn/<tail> → /personal/<tail> đã có.

VIỆC 4 — Giai đoạn 5: cổng Platform (PLT-*, SHR-* nếu thuộc nền tảng)
Dựng lib/screens/platform.ts → PLATFORM_PAGES: quản lý tổ chức khách hàng, gói và giá, khung năng lực/khóa học dùng chung, nhật ký hệ thống. Chỉ PLATFORM_ADMIN được vào.

VIỆC 5 — Giai đoạn 6: P1/P2 còn lại và dọn dẹp
Các màn hình ưu tiên P1/P2 còn placeholder; xoá code cũ không còn route; rà a11y (frontend-a11y), hiệu năng bundle (lazy route), npm run build + check:no-mock (grep dist: mock-token, Admin@1234, digitalent.demo, dt-mock-db phải không có).

VIỆC 6 — Trước khi nối backend thật (liệt kê, chưa làm nếu chưa được yêu cầu)
Tổng hợp danh sách endpoint mà mock server đang giả lập (services/mock/server/handlers/*) thành tài liệu hợp đồng API; chỉ ra phần cần cập nhật ở SQL canonical (docs/database/DigiTalent_AI_Canonical_v2_3.sql), RBAC và SRS (role mới, subscription, org settings, invitation, assignment, recommendation decision) trước khi viết backend.

Mỗi giai đoạn kết thúc bằng: tsc -b sạch, vitest xanh, lint không lỗi mới, check:no-mock qua, code-reviewer đã chạy, plan doc + CLAUDE.md được cập nhật.
```
