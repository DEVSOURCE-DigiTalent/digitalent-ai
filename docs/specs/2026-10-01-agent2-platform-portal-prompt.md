# Hướng dẫn nhiệm vụ dành cho AI Agent 2: Cổng Platform & Cài đặt dùng chung (DigiTalent AI)

> **Lỗi thời (2026-10-01):** không dùng prompt này nữa. Cổng Platform nay theo spec v2.1 (mã PA-*), xem [2026-10-01-frontend-spec-v2.1-alignment-plan.md](2026-10-01-frontend-spec-v2.1-alignment-plan.md).

- **Ngày giao:** 2026-10-01
- **Phạm vi:** Frontend cổng Platform (`/platform/*`) và các màn hình dùng chung (`SHR-01`, `SHR-02`, `SHR-03`).
- **Workspace:** `d:\digitalent-ai\frontend`
- **Nhánh git:** Hiện tại đang trên nhánh làm việc chung (chú ý: **Không tự commit** vì working tree còn lẫn công việc của người dùng).
- **Chế độ chạy:** Mock data (`VITE_USE_MOCK=true`).

---

## 1. Nguồn tài liệu và phân loại độ tin cậy

> [!IMPORTANT]
> **Các tài liệu cũ chưa cập nhật:** Thư mục `docs/01_...` đến `docs/10_...` được viết từ giai đoạn đầu (chứa role cũ `TRAINER`, `SYSTEM_ADMIN`, route `/verify`, giao diện tiếng Anh...). **Không dùng các file này làm căn cứ kiến trúc UI.**

### Nguồn chuẩn (Single Source of Truth):
1. `D:\digitalent-ai\DigiTalent_AI_Danh_Sach_Man_Hinh_va_Luong_UI_UX_v1.0.docx` (hoặc bản trích xuất tại `scratch/docx_text.txt`) — đặc tả 119 màn hình và 8 luồng nghiệp vụ.
2. `docs/specs/2026-10-01-frontend-ui-ux-restructure-plan.md` — kế hoạch tái cấu trúc frontend.
3. `docs/specs/2026-10-01-frontend-handoff-prompt.md` — trạng thái bàn giao và các việc đã chốt.
4. `CLAUDE.md` — quy ước kỹ thuật chuẩn của dự án.
5. `frontend/src/lib/screens/platform.ts` — sitemap nguồn cho router và navigation của Platform.

---

## 2. Ranh giới phân chia (Conflict-Free Guarantee)

Để chạy song song với Agent 1 mà **hoàn toàn không xung đột**:
- **Agent 1 đảm nhiệm:** Cổng Enterprise (Manager `MGR-*`, Learner `EMP-*`, Learning Engine `features/learning/`, `features/manager/`, `features/employee/`, `app/routes/enterprise.routes.tsx`).
- **Agent 2 (Bạn) đảm nhiệm:** Cổng Platform (`PLT-01..13`) và Màn hình dùng chung (`SHR-01..03`).

### Danh sách tệp tin thuộc quyền quản lý của Agent 2:
- `frontend/src/app/routes/platform.routes.tsx`
- `frontend/src/app/layouts/PlatformLayout.tsx`
- `frontend/src/features/platform/**` (tất cả các trang và component của Platform)
- `frontend/src/features/account/**` (SHR-01, SHR-02: Tài khoản & Bảo mật)
- `frontend/src/features/notifications/**` (SHR-03: Trung tâm thông báo)
- `frontend/src/services/platform.service.ts`
- `frontend/src/services/mock/server/handlers/platform.ts`
- `frontend/src/features/platform/__tests__/**`

*(Không chỉnh sửa `enterprise.routes.tsx`, `features/manager`, `features/employee`, `features/learning` để tránh xung đột).*

---

## 3. Danh sách màn hình cần thực hiện

Dựa theo `frontend/src/lib/screens/platform.ts` và tài liệu 119 màn hình:

| Mã | Tên màn hình | Đường dẫn | Role | Mục đích chính |
|---|---|---|---|---|
| **PLT-01** | Bảng điều khiển nền tảng | `/platform/dashboard` | `PLATFORM_ADMIN` | KPI toàn hệ thống: số tổ chức khách hàng, số tài khoản, doanh thu gói (ARR/MRR demo), tình trạng nội dung |
| **PLT-02** | Danh sách tổ chức | `/platform/organizations` | `PLATFORM_ADMIN` | Danh sách tenant B2B, bộ lọc theo gói (Starter/Pro/Enterprise), trạng thái hoạt động/bị khóa |
| **PLT-03** | Chi tiết và hỗ trợ tổ chức | `/platform/organizations/:id` | `PLATFORM_ADMIN` | Thông tin chi tiết tổ chức, quản lý quota ghế, khóa/mở tổ chức có ghi lý do vào Audit Log |
| **PLT-04** | Quản lý khung TT 02/2025 | `/platform/framework` | `PLATFORM_ADMIN` | Quản trị chuẩn 6 miền năng lực, 24 năng lực số, xem/sửa mô tả các bậc (Căn bản, Trung cấp, Nâng cao) |
| **PLT-05** | Giáo trình chuẩn | `/platform/curriculum` | `PLATFORM_ADMIN` | Cây giáo trình chuẩn 6 miền theo Thông tư 02 |
| **PLT-06** | Khóa học chuẩn | `/platform/courses` | `PLATFORM_ADMIN` | Danh mục 18 khóa học chuẩn nền tảng (Foundation / Intermediate / Advanced) |
| **PLT-06E**| Soạn khóa học chuẩn | `/platform/courses/:id` | `PLATFORM_ADMIN` | Xem & biên tập module, bài học, tài liệu của khóa học chuẩn |
| **PLT-07** | Ngân hàng đề chuẩn | `/platform/assessment-bank` | `PLATFORM_ADMIN` | Quản lý câu hỏi trắc nghiệm, bài tập tự luận và barem chấm điểm chuẩn |
| **PLT-08** | Vị trí tham chiếu | `/platform/positions` | `PLATFORM_ADMIN` | Thư viện 5 vị trí mẫu (CEO, HR, MARKETING, SALES_CRM, ACCOUNTANT) cho doanh nghiệp & B2C tham chiếu |
| **PLT-09** | Yêu cầu của vị trí tham chiếu| `/platform/positions/:id/requirements` | `PLATFORM_ADMIN` | Ma trận năng lực yêu cầu theo chuẩn TT02 cho từng vị trí tham chiếu |
| **PLT-10** | Gói và quyền tính năng | `/platform/plans` | `PLATFORM_ADMIN` | Bảng cấu hình các gói B2B/B2C, số ghế, cờ entitlement (internal_learning, bulk_import, analytics...) |
| **PLT-11** | Giám sát gói đăng ký | `/platform/subscriptions` | `PLATFORM_ADMIN` | Theo dõi toàn bộ subscription khách hàng B2B/B2C, ngày gia hạn, trạng thái thanh toán |
| **PLT-12** | Nhật ký nền tảng | `/platform/audit-log` | `PLATFORM_ADMIN` | Nhật ký ghi nhận các hành vi nhạy cảm của Platform Admin (khóa tenant, đổi cấu hình) |
| **PLT-13** | Cấu hình hệ thống | `/platform/settings` | `PLATFORM_ADMIN` | Cấu hình tham số hệ thống chung, cổng thanh toán giả lập, mẫu email giả lập |
| **SHR-01** | Tài khoản của tôi | `/platform/account` | `PLATFORM_ADMIN` | Thông tin cá nhân, avatar, chức vụ |
| **SHR-02** | Bảo mật | `/platform/account/security` | `PLATFORM_ADMIN` | Đổi mật khẩu, lịch sử đăng nhập |
| **SHR-03** | Trung tâm thông báo | `/platform/notifications` | `PLATFORM_ADMIN` | Danh sách thông báo hệ thống |

---

## 4. Quy trình thực hiện bắt buộc: PLAN -> CODE -> TEST -> FIX

Agent 2 phải tuân thủ nghiêm ngặt quy trình lặp sau:

### Vòng lặp 1: Chuẩn bị Mock Server & Service cho Platform
1. **Plan:** Đọc `services/mock/server/router.ts` và `services/mock/server/handlers/index.ts`. Xác định các endpoint API cần giả lập cho Platform (`/api/v1/platform/...`). Chú ý: `PLATFORM_ADMIN` luôn vượt qua kiểm tra quyền `can()`, không thuộc về một `organizationId` cụ thể nên không gọi `context.org()`.
2. **Code:**
   - Tạo `frontend/src/services/platform.service.ts` xuất các hàm gọi qua `apiClient`.
   - Tạo `frontend/src/services/mock/server/handlers/platform.ts` đăng ký các route REST cho platform, nạp vào `handlers/index.ts`.
3. **Test:** Chạy `npx tsc -b`.
4. **Fix:** Khắc phục mọi lỗi type/import.

### Vòng lặp 2: Dựng các trang Quản lý Khách hàng & Gói (PLT-01, 02, 03, 10, 11)
1. **Plan:** Đọc thiết kế bảng `DataTable`, `PageHeader`, `StatusBadge` trong `components/shared/`.
2. **Code:**
   - Dựng `PlatformDashboardPage.tsx` (PLT-01).
   - Dựng `PlatformOrganizationsPage.tsx` (PLT-02) và `PlatformOrgDetailPage.tsx` (PLT-03 có modal khóa/mở tổ chức).
   - Dựng `PlatformPlansPage.tsx` (PLT-10) và `PlatformSubscriptionsPage.tsx` (PLT-11).
   - Đăng ký vào `PLATFORM_PAGES` trong `platform.routes.tsx`.
3. **Test:** `npx tsc -b`.
4. **Fix:** Xử lý các state Loading/Empty/Error.

### Vòng lặp 3: Dựng các trang Nội dung chuẩn & Vị trí tham chiếu (PLT-04, 05, 06, 06E, 07, 08, 09)
1. **Plan:** Tham khảo dữ liệu TT02 tại `lib/reference-positions.ts` và `services/mock/server/handlers/competency.ts`.
2. **Code:**
   - Dựng `PlatformFrameworkPage.tsx` (PLT-04).
   - Dựng `PlatformCurriculumPage.tsx` (PLT-05), `PlatformCoursesPage.tsx` (PLT-06), `PlatformCourseEditorPage.tsx` (PLT-06E).
   - Dựng `PlatformAssessmentBankPage.tsx` (PLT-07).
   - Dựng `PlatformPositionsPage.tsx` (PLT-08) và `PlatformPositionRequirementsPage.tsx` (PLT-09).
   - Đăng ký vào `PLATFORM_PAGES`.
3. **Test:** `npx tsc -b`.
4. **Fix:** Đảm bảo toàn bộ nhãn hiển thị là tiếng Việt chuẩn.

### Vòng lặp 4: Dựng Quản trị hệ thống & Màn hình dùng chung (PLT-12, 13, SHR-01, 02, 03)
1. **Plan:** Kiểm tra yêu cầu SHR-01, 02, 03 trong tài liệu docx.
2. **Code:**
   - Dựng `PlatformAuditLogPage.tsx` (PLT-12) và `PlatformSettingsPage.tsx` (PLT-13).
   - Dựng `AccountProfilePage.tsx` (SHR-01), `SecuritySettingsPage.tsx` (SHR-02), `NotificationsPage.tsx` (SHR-03).
   - Đăng ký vào `PLATFORM_PAGES`.
3. **Test:** `npx tsc -b`.
4. **Fix:** Đảm bảo có thể truy cập bằng bàn phím (keyboard accessibility) và responsive trên màn hình laptop/tablet.

### Vòng lặp 5: Viết bài kiểm thử tự động (Unit & Integration Tests)
1. **Plan:** Xem mẫu test tại `src/app/__tests__/router.test.tsx` và `src/features/organization/__tests__/PositionListPage.test.tsx`.
2. **Code:** Tạo `src/features/platform/__tests__/PlatformPages.test.tsx` kiểm tra:
   - Đăng nhập tài khoản `platform@digitalent.demo` (mật khẩu `Admin@1234`).
   - Vào `/platform/dashboard`, `/platform/organizations`, `/platform/framework`, `/platform/plans`.
   - Kiểm tra hiển thị tiêu đề, bảng dữ liệu, và điều hướng.
3. **Test:** Chạy `npx vitest run src/features/platform/__tests__/PlatformPages.test.tsx`.
4. **Fix:** Xử lý triệt để nếu có lỗi chờ async hoặc thiếu mock.

### Vòng lặp 6: Kiểm tra tổng thể & Xác nhận chất lượng
Chạy chuỗi lệnh bắt buộc trước khi kết thúc:
```bash
cd frontend
npx tsc -b               # Phải exit code 0 không có lỗi
npx vitest run           # Toàn bộ test của dự án phải xanh (không làm hỏng test cũ)
npm run lint             # Không sinh thêm lỗi lint mới
npm run check:no-mock    # Đảm bảo không rò rỉ mã mock vào bản build production
```

---

## 5. Quy tắc code bắt buộc
- **Sitemap-driven:** Route sinh tự động từ `lib/screens/platform.ts`. Bạn chỉ cần import component trang vào `frontend/src/app/routes/platform.routes.tsx` và gán vào `PLATFORM_PAGES['PLT-XX'] = XxxPage`. Tuyệt đối không tự viết route tay!
- **Ngôn ngữ:** 100% tiếng Việt cho giao diện người dùng.
- **Dữ liệu & API:** Gọi qua `apiClient` (`services/api-client.ts`), sử dụng TanStack Query (`useQuery`, `useMutation`).
- **Mock isolation:** Mọi mock code phải nằm trong `services/mock/` hoặc được load dynamic import sau kiểm tra `import.meta.env.VITE_USE_MOCK === 'true'`.
- **Tài khoản test:** Sử dụng `platform@digitalent.demo` / `Admin@1234` (đã có role `PLATFORM_ADMIN` và workspace `platform`).
