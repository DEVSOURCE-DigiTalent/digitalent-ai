# Kế hoạch tái cấu trúc Frontend theo "Danh sách màn hình & Luồng UI/UX v1.0"

> **Đã được thay thế một phần (2026-10-01):** role, sitemap Enterprise/Platform và thứ tự giai đoạn nay theo [2026-10-01-frontend-spec-v2.1-alignment-plan.md](2026-10-01-frontend-spec-v2.1-alignment-plan.md) (spec v2.1: 4 role, Job Grade G1–G3). Phần Public, Personal và hạ tầng ở đây vẫn còn hiệu lực.

- **Ngày lập:** 2026-10-01
- **Nguồn:** `DigiTalent_AI_Danh_Sach_Man_Hinh_va_Luong_UI_UX_v1.0.docx` (119 màn hình, 8 flow)
- **Phạm vi:** chỉ Frontend, chạy bằng mock data. Backend nối sau, chỉ cần đổi adapter service.
- **Trạng thái:** baseline kế hoạch. Cập nhật mục "Tiến độ" (§9) khi hoàn thành từng giai đoạn.

---

## 1. Quyết định đã chốt

| # | Chủ đề | Quyết định |
|---|---|---|
| D1 | Role | `SYSTEM_ADMIN` → `PLATFORM_ADMIN`; `HR_MANAGER` → `ORG_ADMIN` + `LEARNING_ADMIN`; `DEPARTMENT_MANAGER` → `MANAGER`; `EMPLOYEE` → `LEARNER`; `TRAINER` bỏ; thêm `OWNER`. Individual **không** phải role mà là Personal Workspace |
| D2 | URL | `/` Portal Selector; `/enterprise/*`; `/personal/*` (thay `/learn/*`); `/platform/*`. Giữ redirect từ đường dẫn cũ |
| D3 | Ngôn ngữ | Toàn bộ UI tiếng Việt, cả 3 portal (thay quy tắc cũ "enterprise = English"; cập nhật `CLAUDE.md` khi Giai đoạn 0 xong) |
| D4 | Landing hiện tại | `features/public/pages/LandingPage.tsx` trở thành **Individual Landing (PUB-03)**. Làm thêm Enterprise Landing (PUB-02) và Portal Selector (PUB-01) |
| D5 | `/learn/*` | Tái sử dụng làm Personal portal (IND-05…IND-15), đổi prefix thành `/personal/*` |
| D6 | Intelligence | Bỏ trang Training Risk / Readiness riêng. Gộp vào Capability Dashboard (LCA-01) và Skill Gap Analytics (LCA-10) |
| D7 | Thanh toán | Chỉ UI giả lập: chọn gói → quét mã QR → "Thanh toán thành công". Không tích hợp cổng thật |
| D8 | `/verify` | Xóa (không còn Public Visitor). Xóa luôn `CertificateVerificationPage` |
| D9 | Từ vựng | Personal dùng "Assessed", không dùng "Confirmed" (chỉ tổ chức xác minh mới có Confirmed) |

## 2. Nguyên tắc UI cần giữ (từ tài liệu)

1. Mọi trải nghiệm quay về chuỗi: Position/Career Goal → Required Competency → Current Competency → Skill Gap → Learning → Assessment → Evidence → Updated Competency.
2. Thứ tự kiểm tra truy cập (FLOW-07): Subscription active → Entitlement/limit → Role/permission → Data scope.
3. Page vs Modal vs Drawer vs Tab vs Wizard: không tạo page mới cho mỗi CRUD.
   - **Modal/Drawer:** Tạo phòng ban, Mời thành viên, Gán role, Đổi trạng thái, Gán khóa học, xem nhanh thành viên.
   - **Page:** Requirement Builder, Employee Detail, Skill Gap Detail, Lesson Viewer, Assessment Attempt, Task Evaluation.
   - **Tab:** Employee (Overview / Gap / Learning / Evidence), Position, Organization.
   - **Wizard:** Enterprise Setup, Personal Career Onboarding.
4. Component dùng chung giữa Enterprise Learner và Personal: Course Detail, Lesson Viewer, Assessment engine. Chỉ khác ngữ nghĩa evidence.
5. Không có UI cho: multi-org active, Workspace Selector (P2), custom role, SSO, public verification, AI tự cập nhật competency.

## 3. Hiện trạng và khoảng cách

- 43 file page. Khoảng 20 là stub (12–16 dòng). Gồm toàn bộ `my-*`, Dashboard, Admin, Course, Assessment, Certificate, Task, Notification, TrainingRisk, Readiness.
- Đã có nội dung: Login, Landing, Career catalog, Learner ×9, Departments, Positions, Employees, Competency Framework, Position Requirements, Skill Gap, My Competency Profile.
- `features/experience/` là prototype JSX có sẵn `AcquisitionPortal`, `EnterpriseWorkspace`, `PersonalWorkspace`, `PlatformWorkspace`, `LearningPathView`, `ManagerEvaluationView`, `CoursePlayerModal`… Dùng làm tham chiếu để port sang TypeScript/shadcn (không import trực tiếp).
- `useCurrentUser` chỉ có `roles[]`, `permissions[]`; chưa có workspace, org, subscription, entitlement.
- Sidebar là cấu hình tĩnh theo role (`lib/sidebar-config.ts`), có một dòng comment làm hỏng cú pháp ở mục `/verify`.
- Có page trùng giữa `features/public/pages/` và nơi router thực sự import (`CareerCatalogPage`, `CertificateVerificationPage`). Cần dọn.

## 4. Giai đoạn 0 — Nền tảng

| Việc | Chi tiết |
|---|---|
| 0.1 Mock layer | Mỗi `services/*.service.ts` có adapter `mock` và `api`, chọn bằng `VITE_USE_MOCK`. Mock đặt trong `services/mock/`, dữ liệu seed bám dữ liệu TT02 trong `docs/specs/2026-09-29-tt02-position-competency-matrix.md` |
| 0.2 Context model | Mở rộng `use-current-user.ts`: `workspace` (`enterprise` \| `personal` \| `platform`), `organization`, `roles`, `subscription`, `entitlements`. Hook mới `use-entitlement.ts`, `use-subscription.ts` |
| 0.3 Role | Đổi tên trong `hooks/use-permission.ts`, `sidebar-config.ts`, guard, test. Định nghĩa lại ma trận permission theo role mới |
| 0.4 Guard | Thêm `RequireEntitlement`, `RequireWorkspace`. Sửa `AuthGuard` để điều hướng theo workspace (1 context hợp lệ → vào thẳng, không hiện selector) |
| 0.5 Layout | 3 layout: `EnterpriseLayout`, `PersonalLayout` (từ `LearnerLayout`), `PlatformLayout`. Sidebar theo trách nhiệm (Enterprise/Platform), theo hành trình (Personal) |
| 0.6 Router | Tách `public.routes`, `enterprise.routes`, `personal.routes`, `platform.routes`. Redirect cũ → mới |
| 0.7 Shared UI | Thêm `WizardShell`, `EntityDrawer`, `ReasonConfirmDialog` (mở rộng `ConfirmActionDialog`), `FeatureUnavailable` (SHR-05), `PaymentRequired` (SHR-06), `EmptyState` templates (SHR-10), `QrPaymentPanel` |
| 0.8 Dọn dẹp | Xóa `/verify`, `CertificateVerificationPage`, page trùng. Sửa comment hỏng trong sidebar |
| 0.9 Tài liệu | Cập nhật `CLAUDE.md` (ngôn ngữ, role, route, cấu trúc portal) |

Điều kiện hoàn thành: `tsc -b` sạch, `npm test` pass, 3 portal có shell trống điều hướng được, đổi mock user là đổi được menu.

## 5. Giai đoạn 1 — Cửa vào và thương mại (PUB, AUTH, ENT-ONB) — FLOW-01, FLOW-02

| ID | Trang | Ghi chú |
|---|---|---|
| PUB-01 | Portal Selector | Route `/`. Chỉ hiện lần đầu hoặc khi chủ động đổi; nhớ lựa chọn bằng localStorage |
| PUB-03 | Individual Landing | Dùng `LandingPage.tsx` hiện tại, đổi nội dung theo career goal / skill gap / learning path, CTA chọn gói hoặc đăng nhập |
| PUB-02 | Enterprise Landing | Trang mới, cùng design system |
| PUB-04, 05 | Pricing Enterprise / Individual | So sánh gói (seats, entitlement, storage, internal learning, analytics) |
| AUTH-01, 02 | Enterprise Login / Individual Login | Một component, khác copy/CTA/redirect (hiện `LoginPage.tsx` 391 dòng, tách theo prop) |
| AUTH-03, 04 | Create Enterprise / Individual Account | |
| AUTH-05 | Employee Invitation Activation | Đặt mật khẩu, kích hoạt membership |
| AUTH-06, 07 | Forgot/Reset, Email Verification | P1 |
| ENT-ONB-01…03 | Chọn gói → Checkout (QR) → Kết quả | QR giả lập, nút "Tôi đã quét" hoặc tự chuyển sau vài giây; có trạng thái Success/Failed/Pending |
| ENT-ONB-04, 05 | Create Organization, Setup Wizard | Cho phép skip bước |
| ENT-ONB-06…08 | Department, Position setup, Import/Invite | Import CSV chỉ parse giả lập |
| ENT-ONB-09 | Onboarding Completion | Checklist sẵn sàng |

## 6. Giai đoạn 2 — Enterprise quản trị (ADM, LCA) — FLOW-03, FLOW-08

- **ADM:** Organization Overview, Members (list + drawer), Member Detail, Invite (modal), Roles & Access, Departments, Settings, Subscription & Billing, Seats/Usage, Upgrade/Downgrade, Audit Log. Offboarding = modal Deactivate có lý do (FLOW-08).
- **LCA (LEARNING_ADMIN):**
  - Job Position List + Detail (tab)
  - **Position Requirement Builder** (map Position → TT02 competency → grade, có rationale/source/version)
  - Version History
  - TT02 Framework Explorer (read-only, 6 miền) + Competency Detail
  - Workforce List + Employee Capability Detail (tab)
  - Skill Gap Analytics (drill-down)
  - Recommendation Review
  - Course Assignment
  - Training Monitor
  - Assessment Results Overview
  - Certificate Registry
  - Capability Dashboard (gồm phần Training Risk / Readiness cũ)
- **Internal Learning (LCA-16…18):** bọc bằng `RequireEntitlement('internal_learning')`. Không tự tạo TT02 confirmed competency (FLOW-06).

Tái dùng: `DepartmentListPage`, `PositionListPage`, `EmployeeListPage`, `PositionRequirementsPage`, `SkillGapPage`, `CompetencyFrameworkPage` (chuyển sang read-only).

## 7. Giai đoạn 3 — Vòng lặp năng lực (MGR, EMP) — FLOW-04

- **EMP-01…15:** Dashboard, Competency Profile, Skill Gap, My Learning, Course Detail, Lesson Viewer, Assessment (Intro, Attempt có timer/autosave, Result, History), My Practical Tasks, Submit Evidence, Feedback/Revision, Evidence Portfolio, Certificates.
- **MGR-01…12:** Team Dashboard, Team Members + Detail, Team Skill Gap, Task List/Create/Assign/Detail, Submission Review, Evaluate Evidence (rubric), Evidence Detail, Pending Queue.
- Tách `Course`, `Lesson`, `Assessment` thành component dùng chung ở `features/learning/` để Personal dùng lại.
- Assessment Attempt cần xử lý mất mạng, autosave giả lập, hết giờ. Đây là trang rủi ro UX cao.

## 8. Giai đoạn 4–6

### Giai đoạn 4 — Personal (IND) — FLOW-05
- Đổi `/learn/*` → `/personal/*`, đổi layout, giữ tiếng Việt, sửa label theo D9.
- Map trang cũ: `target` → IND-04, `diagnostic` → IND-06/07/08, `path` → IND-11, `courses/:id` → IND-13 (dùng chung), `classroom/:id` → IND-14 (dùng chung), `progress` → IND-01/10, `tasks` (xem lại phạm vi), `certificates` → IND-16.
- Thêm: Personal Onboarding wizard (IND-05), Career Explorer + Career Detail (IND-02/03, từ `CareerCatalogPage`), Personal Dashboard, My Personal Competency Profile (IND-09), Personal Subscription và Billing History (IND-17/18, QR giả lập).

### Giai đoạn 5 — Platform (PLT)
Dashboard, Organization Registry + Detail/Support (khóa/mở có audit), TT02 Framework Management, Standard Curriculum, Standard Course Editor, Standard Assessment Bank (từ Question Bank cũ), Reference Positions + Requirements, Plans & Entitlements, Subscription Oversight, Audit Logs, System Config.

### Giai đoạn 6 — P1/P2 và dọn dẹp
- Shared: My Account, Security Settings, Notification Center, 403/404/500, Confirm dialogs.
- P2: Workspace Selector (chỉ khung, ẩn).
- Dọn: xóa trang/route cũ không còn trong sitemap, xóa mock không dùng, rà lại test.

## 9. Tiến độ

| Giai đoạn | Nhánh đề xuất | Trạng thái |
|---|---|---|
| 0 Nền tảng | `feature/ui-restructure-foundation` | **Hoàn thành code, chờ review/merge** (xem §9.1) |
| 1 Cửa vào & thương mại | (làm trên nhánh Giai đoạn 0) | **Hoàn thành code, chờ review/merge** (xem §9.2) |
| 2 Enterprise quản trị | `feature/ui-enterprise-admin` | **Hoàn thành code & test** (xem §9.3) |
| 3 Vòng lặp năng lực | `feature/ui-competency-loop` | **Đang thực hiện (Agent 1)** |
| 4 Personal | `feature/ui-personal` | Chưa bắt đầu |
| 5 Platform | `feature/ui-platform-admin` | Chưa bắt đầu |
| 6 P1/P2 & dọn dẹp | `feature/ui-polish-cleanup` | Chưa bắt đầu |

## 10. Ưu tiên

P0 trong tài liệu = Portal Selector, 2 landing, pricing, login/register, payment/onboarding, member provisioning, Requirement Builder, TT02 Explorer, competency profile, skill gap, learning path/assignment, lesson viewer, assessment, practical task/evidence, subscription gating. P1 = dashboard nâng cao, monitoring, certificate registry, notification, internal learning, version history, billing history, audit. P2 = workspace switcher, analytics nâng cao, custom role, SSO.

Trong mỗi giai đoạn làm P0 trước, P1 sau.

## 11. Rủi ro và việc cần theo dõi

| Rủi ro | Cách xử lý |
|---|---|
| Đổi role ảnh hưởng nhiều file và test | Làm ở Giai đoạn 0, một commit riêng, chạy `tsc -b` và `npm test` ngay sau |
| Mock lệch khỏi hợp đồng BE khi nối sau | Đặt kiểu TS trong `types/` bám schema SQL v2.3. Ghi chú các điểm lệch để cập nhật SQL/API |
| BE hiện dùng role cũ, schema chưa có org membership / subscription | Cần cập nhật `docs/database/DigiTalent_AI_Canonical_v2_3.sql`, RBAC doc, và SRS **trước** khi nối BE (tài liệu ghi rõ cần đồng bộ lại Report 1–4 và SRS) |
| Hai nguồn sự thật cho UI (prototype `experience/` và code chính) | Chỉ tham chiếu, không import. Xóa `experience/` khi Giai đoạn 5 xong nếu đã port hết |
| Landing hiện tại có hiệu ứng nặng | Giữ lazy load, chỉ đổi nội dung và CTA |

### 9.1 Kết quả Giai đoạn 0 (2026-10-01)

**Đã làm**

| Mục kế hoạch | Kết quả |
|---|---|
| 0.1 Mock layer | `services/mock/` (accounts, rbac, http, auth). Cờ `VITE_USE_MOCK`. Mock nạp bằng dynamic import sau điều kiện `import.meta.env` inline, bản production không chứa mock (đã kiểm tra bằng build). Mới có adapter cho **auth**; các service khác thêm adapter khi dựng màn hình tương ứng |
| 0.2 Context model | `types/session.ts`, `useCurrentUser` có `workspace`, `organization`, `subscription`, `hasEntitlement`, `getSubscriptionStatus` |
| 0.3 Role | `lib/roles.ts` (6 role + map role cũ → mới + `normalizeRoles`). Backend chưa đổi nên role cũ vẫn dùng được qua map |
| 0.4 Guard | `RequireWorkspace`, `RequireEntitlement`, `RequireActiveSubscription`; trang `FeatureUnavailable`, `PaymentRequired` |
| 0.5 Layout | `EnterpriseLayout`, `PlatformLayout`, `PersonalLayout` (từ `LearnerLayout`); `RoleSidebar`/`Topbar`/`MainLayout` nhận `portal` config; mục menu cần gói mà chưa có hiển thị khóa |
| 0.6 Router | `public/personal/enterprise/platform.routes.tsx`; route sinh từ **sitemap** `lib/screens/*.ts` (sidebar và route cùng một nguồn); redirect cũ → mới |
| 0.7 Shared UI | Có `PlaceholderPage`, `FeatureUnavailable`, `PaymentRequired`. **Chưa làm:** `WizardShell`, `EntityDrawer`, `ReasonConfirmDialog`, `QrPaymentPanel`, bộ Empty State mới (dời sang Giai đoạn 1–2, làm khi có màn hình dùng chúng) |
| 0.8 Dọn dẹp | Xóa `/verify` + 2 bản `CertificateVerificationPage`; xóa 25 trang stub (thay bằng placeholder từ sitemap); bỏ link tra cứu ở landing, layout, learner |
| 0.9 Tài liệu | Cập nhật `CLAUDE.md` mục Frontend |

**Quyết định bổ sung trong lúc làm**

- **Đường dẫn Enterprise** đổi hẳn theo sitemap: `/enterprise/overview`, `/members`, `/departments`, `/positions`, `/workforce`, `/skill-gap`, `/framework`, `/me/*`, `/team/*`… (không còn `/enterprise/organization/*`, `/admin/*`, `/trainer/*`). Redirect cũ → mới nằm ở `app/router.tsx`.
- **Thanh toán hết hạn:** chỉ chặn từng trang, không chặn cả layout, để OWNER vẫn vào được `/enterprise/billing` để gia hạn (cờ `allowUnpaid` trong sitemap).
- **Backend cũ không gửi `subscription`:** không áp dụng kiểm tra gói (coi như không giới hạn) để nối BE không bị khóa nhầm. Khi BE có subscription thì tự áp dụng.
- **Trang Personal** (`/personal/*`) giờ cần đăng nhập và đúng workspace; trước đây `/learn` mở công khai.
- Hai trang `CareerCatalogPage` (một bản đầy đủ trong `features/public/pages/`, một bản placeholder trong `features/public/career-catalog/` mà router đang dùng) **chưa gộp**. Quyết định ở Giai đoạn 4 (Career Explorer).

**Chưa xử lý (ghi nhận)**

- Các trang cũ còn giữ nội dung tiếng Anh (Departments, Positions, Employees, Competency, Skill Gap…): dịch khi dựng lại từng trang.
- `features/learner/` giữ nguyên tên thư mục (chỉ đổi route/layout sang `personal`). Đổi tên thư mục ở Giai đoạn 4.
- Prototype `features/experience/` còn nguyên, vẫn trỏ tới `/learn` và `/verify` ở vài nút. Xóa khi Giai đoạn 5 xong.
- Backend/SQL/RBAC doc/SRS chưa đổi theo mô hình role và subscription mới (xem §11).

**Điều chỉnh sau review (cùng ngày)**

- Role cũ `SYSTEM_ADMIN` tạm thời nhận thêm `OWNER/ORG_ADMIN/LEARNING_ADMIN/MANAGER` và ở workspace enterprise, vì chưa có portal Platform; nếu không, tài khoản admin của backend hiện tại không vào được trang nào đã dựng. Bỏ khi BE dùng role mới hoặc khi Giai đoạn 5 xong.
- `TRAINER` đổi thành `LEARNER` (thay vì bỏ), để tài khoản trainer của backend không rơi vào workspace Personal.
- Workspace `platform` do backend gửi chỉ được chấp nhận khi người dùng có role `PLATFORM_ADMIN`.
- `/learn/<đường-dẫn>` giữ phần đuôi khi chuyển sang `/personal/<đường-dẫn>`.
- Việc kiểm tra gói đang "mở" khi backend chưa gửi `subscription` (có TODO trong `use-current-user.ts`); API vẫn phải tự kiểm soát gói.
- Đã kiểm tra build production không chứa mock. Chưa có test tự động cho việc này; `frontend/.env` của máy dev đang bật `VITE_USE_MOCK=true`, nên build từ máy dev để deploy cần đặt `VITE_USE_MOCK=false`.

### 9.2 Kết quả Giai đoạn 1 (2026-10-01)

**Màn hình đã dựng (mock, chưa có backend)**

| Mã | Màn hình | Route |
|---|---|---|
| PUB-01 | Portal Selector (hỏi một lần, nhớ lựa chọn) | `/`, `/portal` |
| PUB-02 | Enterprise Landing | `/business` |
| PUB-03 | Individual Landing (cùng giao diện landing hiện có, nội dung riêng) | `/individual` |
| PUB-04, 05 | Bảng giá doanh nghiệp / cá nhân (chu kỳ tháng/năm, số ghế, bảng so sánh) | `/business/pricing`, `/individual/pricing` |
| AUTH-01, 02 | Đăng nhập theo từng hướng (một form, khác nội dung và link đăng ký) | `/business/login`, `/individual/login`, `/login` |
| AUTH-03, 04 | Tạo tài khoản chủ doanh nghiệp / cá nhân | `/business/register`, `/individual/register` |
| AUTH-05 | Kích hoạt lời mời nhân viên | `/activate/:token` |
| AUTH-06, 07 | Quên / đặt lại mật khẩu, xác minh email | `/forgot-password`, `/reset-password/:token`, `/verify-email/:token` |
| ENT-ONB-01 | Chọn gói (trang bảng giá) | |
| ENT-ONB-02, 03 | Thanh toán QR giả lập, kết quả (thành công / thất bại / chờ xử lý) | `/checkout`, `/checkout/result` |
| ENT-ONB-04…09 | Wizard thiết lập tổ chức: tổ chức, phòng ban, vị trí, mời nhân viên (nhập tay hoặc CSV), hoàn tất | `/setup` |

**Thành phần dùng chung mới:** `WizardShell`, `PlanCard`, `PlanSummary`, `PlanComparison`, `QrPaymentPanel` (+ `PseudoQr`), `PublicShell`, `FormControls`, `RequireOnboarded`, `lazyAdapter`. Chưa làm `EntityDrawer`, `ReasonConfirmDialog` (dời sang Giai đoạn 2, nơi có màn hình dùng chúng).

**Mô hình mock:** tài khoản đăng ký được lưu trong localStorage (`dt-mock-db`), gồm người dùng, tổ chức, đơn hàng, lời mời, mã đặt lại mật khẩu. Một tài khoản mới mang `onboardingStatus`: `payment` → (chủ doanh nghiệp) `setup` → hết. Gói cá nhân miễn phí không qua thanh toán.

**Quyết định trong lúc làm**

- Landing hiện có giữ nguyên thiết kế; nội dung doanh nghiệp (đang có) thành `/business`, nội dung cá nhân viết mới cho `/individual`. Nút chính của khách: doanh nghiệp → bảng giá, cá nhân → đăng ký miễn phí (thay cho "Trải nghiệm ngay" trỏ vào demo).
- Doanh nghiệp bắt buộc chọn gói trước khi tạo tài khoản (không có plan trên URL thì quay về bảng giá). Nhập hàng loạt CSV chỉ có ở gói Pro (`bulk_import`); gói khác thấy ô khóa kèm hướng dẫn.
- Số ghế tính vào cả thành viên đang hoạt động và lời mời chưa kích hoạt; vượt ghế thì từng dòng bị từ chối, không mất cả danh sách.
- Lời mời và email xác minh chưa có email thật: mock hiện liên kết ngay trên màn hình, ghi rõ "giả lập".
- Địa chỉ liên hệ gói Enterprise (`features/commerce/sales-contact.ts`) là giá trị tạm, cần xác nhận trước khi phát hành.

**Chưa làm / ghi nhận:** Phase 0 vẫn còn nội dung tiếng Anh ở các trang cũ. Trang `/experience` (prototype) vẫn được liên kết từ vài thẻ tính năng của landing doanh nghiệp. Backend/SQL chưa có bảng subscription, order, invitation (xem §11).

### 9.3 Kết quả Giai đoạn 2 (2026-10-01)

**Màn hình đã dựng và nối vào sitemap Enterprise:**

| Mã | Màn hình | Route |
|---|---|---|
| ADM-01 | Tổng quan tổ chức | `/enterprise/overview` |
| ADM-02 | Thành viên (danh sách + drawer chi tiết + modal mời + đổi vai trò + vô hiệu hoá) | `/enterprise/members` |
| ADM-03 | Chi tiết thành viên | `/enterprise/members/:id` |
| ADM-05 | Vai trò và quyền truy cập | `/enterprise/roles` |
| ADM-06 | Phòng ban / nhóm | `/enterprise/departments` |
| ADM-07 | Cài đặt tổ chức | `/enterprise/settings` |
| ADM-08 | Gói và thanh toán | `/enterprise/billing` |
| ADM-09 | Số ghế và mức sử dụng | `/enterprise/usage` |
| ADM-11 | Nhật ký tổ chức | `/enterprise/audit-log` |
| LCA-01 | Bảng năng lực | `/enterprise/capability` |
| LCA-02 | Vị trí công việc | `/enterprise/positions` |
| LCA-03 | Chi tiết vị trí | `/enterprise/positions/:id` |
| LCA-04 | Yêu cầu năng lực theo vị trí (Requirement Builder) | `/enterprise/positions/requirements` |
| LCA-05 | Lịch sử phiên bản yêu cầu | `/enterprise/positions/requirements/history` |
| LCA-06 | Khung năng lực TT 02/2025 (read-only) | `/enterprise/framework` |
| LCA-07 | Chi tiết năng lực | `/enterprise/framework/:id` |
| LCA-08 | Nhân sự | `/enterprise/workforce` |
| LCA-09 | Hồ sơ năng lực nhân viên | `/enterprise/workforce/:id` |
| LCA-10 | Phân tích skill gap | `/enterprise/skill-gap` |
| LCA-11 | Duyệt đề xuất học tập | `/enterprise/recommendations` |
| LCA-12 | Giao khóa học | `/enterprise/assignments` |
| LCA-13 | Theo dõi đào tạo | `/enterprise/training-monitor` |
| EMP-02 | Hồ sơ năng lực của tôi | `/enterprise/me/profile` |

**Kiến trúc Mock REST Server:**
- Mock server chạy ngầm tại `services/mock/server/` xử lý qua REST router (`router.ts`), phân quyền tự động theo `session.permissions` và `session.roles`.
- Dữ liệu demo công ty Acme (`acme-org.ts`) gồm phòng ban, vị trí, nhân viên demo, 24 năng lực TT02, ma trận yêu cầu và phân tích skill gap đồng bộ số liệu demo.
- Dọn dẹp code mồ côi: loại bỏ `CompetencyFormDialog`, dọn các mutation hook không dùng.
- 100% tiếng Việt cho các trang quản trị Enterprise và các trang lỗi/hệ thống 403, 404.

### 9.4 Kết quả Giai đoạn 3 — Track 1: Vòng lặp năng lực (2026-10-01)

Đã hoàn thành toàn bộ 28 màn hình thuộc **Track 1: Enterprise Competency Loop** (Manager, Learner, Learning Admin) theo mô hình lặp `PLAN -> CODE -> TEST -> FIX`.

**1. Danh sách màn hình đã dựng & nối vào sitemap Enterprise:**

| Mã | Màn hình | Route | Vai trò |
|---|---|---|---|
| MGR-01 | Bảng năng lực của nhóm | `/enterprise/team` | MANAGER |
| MGR-02 | Danh sách thành viên nhóm | `/enterprise/team/members` | MANAGER |
| MGR-03 | Chi tiết thành viên | `/enterprise/team/members/:id` | MANAGER |
| MGR-04 | Khoảng trống năng lực của nhóm (Skill Gap) | `/enterprise/team/skill-gap` | MANAGER |
| MGR-05 | Nhiệm vụ & Bài tập thực hành | `/enterprise/tasks` | MANAGER |
| MGR-06 | Giao bài tập thực hành & Dự án năng lực | `/enterprise/tasks/new` | MANAGER |
| MGR-08 | Chi tiết bài thực hành | `/enterprise/tasks/:id` | MANAGER |
| MGR-10 | Chấm điểm minh chứng (Rubric evaluation) | `/enterprise/tasks/:id/evaluate` | MANAGER |
| MGR-11 | Chi tiết minh chứng | `/enterprise/evidence/:id` | MANAGER |
| MGR-12 | Hàng chờ đánh giá minh chứng | `/enterprise/review-queue` | MANAGER |
| EMP-01 | Bảng phát triển của tôi | `/enterprise/me` | LEARNER |
| EMP-03 | Khoảng trống năng lực của tôi | `/enterprise/me/skill-gap` | LEARNER |
| EMP-04 | Học tập của tôi | `/enterprise/me/learning` | LEARNER |
| EMP-05 | Chi tiết khóa học | `/enterprise/me/courses/:id` | LEARNER |
| EMP-06 | Trình xem bài học (Lesson Viewer) | `/enterprise/me/courses/:id/lessons/:lessonId` | LEARNER |
| EMP-07 | Giới thiệu bài đánh giá | `/enterprise/me/assessments/:id` | LEARNER |
| EMP-08 | Làm bài đánh giá (Timer + Flag + Autosave) | `/enterprise/me/assessments/:id/attempt` | LEARNER |
| EMP-09 | Kết quả bài thi & Giải thích đáp án | `/enterprise/me/assessments/:id/result` | LEARNER |
| EMP-10 | Lịch sử bài đánh giá | `/enterprise/me/assessments` | LEARNER |
| EMP-11 | Nhiệm vụ thực hành của tôi | `/enterprise/me/tasks` | LEARNER |
| EMP-12 | Nộp minh chứng thực hành | `/enterprise/me/tasks/:id` | LEARNER |
| EMP-13 | Kết quả & Phản hồi từ Manager | `/enterprise/me/tasks/:id/feedback` | LEARNER |
| EMP-14 | Hồ sơ minh chứng năng lực (Portfolio) | `/enterprise/me/evidence` | LEARNER |
| EMP-15 | Chứng nhận của tôi | `/enterprise/me/certificates` | LEARNER |
| LCA-14 | Kết quả đánh giá năng lực toàn tổ chức | `/enterprise/assessment-results` | LEARNING_ADMIN |
| LCA-15 | Sổ chứng nhận số nội bộ | `/enterprise/certificates` | LEARNING_ADMIN |
| LCA-16 | Danh sách khóa học nội bộ | `/enterprise/internal-courses` | LEARNING_ADMIN |
| LCA-17 | Soạn thảo khóa học nội bộ | `/enterprise/internal-courses/:id` | LEARNING_ADMIN |

**2. Hạ tầng dịch vụ & Mock:**
- Mở rộng types & seed data Acme (`types.ts`, `seed-acme.ts`) với `PracticalTaskRecord`, `TaskSubmissionRecord`, `InternalCourseRecord`.
- Handlers REST mock server: `src/services/mock/server/handlers/tasks.ts`.
- Client services & hooks: `task.service.ts`, `use-tasks.ts`, `learning.service.ts`, `use-learning.ts`.

**3. Kiểm thử & Đảm bảo chất lượng (QA):**
- Bộ kiểm thử luồng học & đánh giá: `src/features/learning/__tests__/LearningAndAssessmentPages.test.tsx` (12/12 passed).
- Bộ kiểm thử luồng bài tập, nhóm & minh chứng: `src/features/tasks/__tests__/TasksAndEvidencePages.test.tsx` (16/16 passed).
- Bộ kiểm thử Router & phân quyền: `src/app/__tests__/router.test.tsx` (30/30 passed).
- Tổng kiểm thử Track 1: **58/58 tests passed**.
- TypeScript (`npx tsc -b`): **0 errors**.
- Linter (`npm run lint`): **0 errors**.
- Production Build (`npm run build`): Thành công 100%, 1147 modules transformed cleanly.

**4. Phân tách song song cho Agent 2:**
- Đã bàn giao đặc tả độc lập `docs/specs/2026-10-01-agent2-platform-portal-prompt.md` cho **Track 2: Platform Portal (`PLT-01..13`) và Shared Screens (`SHR-01..03`)** chạy song song không xung đột.

