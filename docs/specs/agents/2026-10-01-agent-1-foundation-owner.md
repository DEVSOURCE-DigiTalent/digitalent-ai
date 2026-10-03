# Prompt cho Agent 1: Nền tảng v2.1 và cổng OWNER

Bạn là **Agent 1**. Bạn làm song song với **Agent 2** (prompt: `docs/specs/agents/2026-10-01-agent-2-platform-manager-employee.md`) trên **cùng một working tree** `D:\digitalent-ai\frontend`. Hai agent không được sửa cùng một file. Đọc hết mục 1 trước khi làm gì.

---

## 1. Phần chung (giống hệt trong prompt của Agent 2)

### 1.1 Bối cảnh và nguồn
- Dự án DigiTalent AI. Frontend React 19 + TS + Vite + Tailwind 4, TanStack Query, Zustand, react-hook-form + zod. Chạy trên mock (`VITE_USE_MOCK=true`), chưa nối backend.
- Đọc theo thứ tự:
  1. `CLAUDE.md` (mục Frontend).
  2. `docs/specs/2026-10-01-frontend-spec-v2.1-alignment-plan.md`: kế hoạch đã chốt. Đọc kỹ §2, §3, §3.7, §4, §9 (quyết định đã chốt), §10 (kiểm kê giữ/gộp/xóa).
  3. Spec gốc v2.1 (`DigiTalent_AI_Role_Sidebar_Page_Spec_v2.1.docx`) đã trích sang text: `docs/specs/agents/spec-v2.1-extracted.md`. Bảng trong bản trích có thể bị tách ô; khi mơ hồ thì theo §3 của kế hoạch.
- **Không dùng** `docs/specs/2026-10-01-agent2-platform-portal-prompt.md` (lỗi thời) và các tài liệu `docs/01_…` đến `docs/10_…` làm căn cứ UI.

### 1.2 Quy tắc chung
- Trả lời người dùng bằng tiếng Việt. UI 100% tiếng Việt.
- **Không commit, không push, không stash, không reset/checkout file.** Working tree còn lẫn thay đổi của người dùng.
- **Không đụng** `features/experience/*`, `features/learner/*`, `/personal/*`, `features/public/*`, `features/portal/*`, `features/commerce/*`.
- Không chạy `npm install` hay thêm thư viện. Cần thư viện thì hỏi người dùng.
- Không cần Python (máy không có). Dùng Edit/Write, hoặc script Node đặt trong thư mục tạm.
- Quy ước kiến trúc:
  - Routing sinh từ sitemap: không viết route hay sidebar bằng tay ngoài các file sitemap, registry và sidebar.
  - API chỉ qua `apiClient`.
  - Server state dùng TanStack Query, client state dùng Zustand.
  - Mock code chỉ nạp qua `import.meta.env.VITE_USE_MOCK === 'true'` viết inline, để bản build production không chứa mock.
- Mỗi trang phải có trạng thái loading, error và empty; dùng được bằng bàn phím; hiển thị đúng ở màn 375px.
- Viết test cho trang mới hoặc trang sửa nhiều (Vitest + Testing Library; journey dùng `vi.hoisted(() => vi.stubEnv('VITE_USE_MOCK','true'))` và `test/session.ts`).
- Cuối mỗi giai đoạn chạy agent **code-reviewer** trên phần mình sửa, rồi xử lý các lỗi CRITICAL và HIGH.

### 1.3 Thuật ngữ (đã freeze)

| Khái niệm | Nhãn UI | Giá trị |
|---|---|---|
| Job Grade | "Cấp bậc" | G1 / G2 / G3 (+ tên hiển thị) |
| Trình độ yêu cầu của vị trí (3 giá trị) | "Trình độ năng lực yêu cầu" | Cơ bản / **Trung cấp** / Nâng cao |
| Trình độ của nhân viên | "Trình độ hiện tại", "Trình độ đã xác nhận" | như trên hoặc "Chưa xác nhận" |
| Bậc chi tiết TT02 | "Bậc năng lực" | Bậc 1 … Bậc 8 |
| Mức độ nghiêm trọng của gap | "Mức độ" | Cao / Trung bình / Thấp ("Trung bình" chỉ dùng ở đây) |
| Training Batch | "Đợt đào tạo" | — |
| Role | "Vai trò" | Chủ doanh nghiệp / Quản lý / Nhân viên / Quản trị nền tảng |

Không bao giờ dùng "Cấp bậc" cho năng lực, và không dùng "Mức" hay "Bậc năng lực yêu cầu" cho 3 trình độ.

### 1.4 Role và quyết định đã chốt (tóm tắt §9 kế hoạch)
- **Role:**
  - Enterprise: `OWNER`, `MANAGER` (tùy chọn), `EMPLOYEE`.
  - Platform: `PLATFORM_ADMIN`.
  - Bỏ `ORG_ADMIN`, `LEARNING_ADMIN`. Đổi `LEARNER` → `EMPLOYEE` **chỉ cho role RBAC của Enterprise**, không replace các khái niệm learner chung hoặc của Personal.
- **Owner:**
  - Một tổ chức có nhiều Owner. Owner thêm được Owner khác, kèm xác nhận mạnh: "Bạn đang cấp toàn quyền quản trị doanh nghiệp cho người này."
  - Bất biến `owner_count >= 1`: Owner duy nhất không tự hạ quyền được, không bị hạ quyền, không bị vô hiệu hóa.
  - Owner không có mục Cá nhân.
- **Phạm vi Manager:** chỉ lấy từ `departments.managerEmployeeId`. Mỗi phòng ban tối đa một Manager; một Manager có thể quản lý nhiều phòng ban. Không có `manager_scopes`.
- **Manager:** không giao khóa học, chỉ theo dõi đào tạo. Manager giao nhiệm vụ thực tế và đánh giá minh chứng trong phạm vi nhóm. Owner làm được tất cả trên toàn tổ chức.
- **Gói hết hạn:** Owner xem chỉ đọc mọi trang, vẫn ghi được Gói dịch vụ / Thanh toán / Gia hạn. Manager và Employee thấy màn "Gói đã hết hạn". Không xóa dữ liệu.
- **Route:** đổi theo §3 kế hoạch. Đường dẫn cũ redirect qua một bảng duy nhất trong lúc chuyển đổi.
- **Job Family:** ẩn khỏi UI, giữ service và dữ liệu.

### 1.5 Phân quyền sở hữu file (quan trọng nhất)

Chỉ sửa file mình sở hữu. Cần sửa file của agent kia thì **ghi yêu cầu vào file trạng thái của mình** (mục 1.7) và chờ agent kia làm. Được **đọc** và **import** mọi file.

| Vùng | Đợt 1 (trước S2) | Đợt 2 (sau S2) |
|---|---|---|
| Hạ tầng dùng chung:<br>`lib/roles.ts`, `lib/role-policy.ts`, `lib/navigation.ts`, `lib/terms.ts`, `lib/entitlements.ts`, `lib/competency-levels.ts`, `lib/screens/types.ts`, `lib/sidebars/types.ts`, `lib/sidebars/index.ts`, `lib/sidebars/owner.ts`;<br>`components/layout/*`, `components/guards/*`, `components/shared/*`;<br>`app/router.tsx`, `app/layouts/*`, `app/routes/build-routes.tsx`, `app/routes/legacy-redirects.ts`, `app/routes/enterprise.routes.tsx`, `app/routes/public.routes.tsx`, `app/routes/onboarding.routes.tsx`;<br>`hooks/use-permission.ts`, `hooks/use-current-user.ts`, `hooks/use-auth.ts`, `hooks/use-can-write.ts`;<br>`services/api-client.ts`, `services/mock/*.ts` (mock-rbac, mock-accounts, mock-store, mock-auth…), `test/*`, `vitest.config.ts`, `CLAUDE.md`, kế hoạch | Agent 1 | Agent 1 |
| Mock server lõi:<br>`services/mock/server/{types.ts, seed-acme.ts, org-store.ts, org-logic.ts, session.ts, router.ts, http.ts, engine.ts, catalog.ts, requirements.ts, members-logic.ts, mock-adapter.ts}`, `handlers/index.ts` | Agent 1 | Agent 1 |
| Owner:<br>`features/{members, organization, competency, intelligence, assignments, billing, onboarding, workforce, system, account, notifications}`, các feature mới của Owner (`features/training`, `features/courses`, `features/reports`);<br>`handlers/{structure, organization, members, billing, competency, intelligence, analytics, workforce, audit}.ts` và handler mới của Owner;<br>hooks/services tương ứng;<br>`lib/screens/enterprise/owner.ts`, `app/routes/enterprise-pages/owner.ts` | Agent 1 | Agent 1 |
| Manager / Employee / Nhiệm vụ / Học tập:<br>`features/{team, tasks, employee, learning}`;<br>`handlers/{tasks, learning}.ts`, `services/mock/server/types-work.ts`, `services/mock/server/seed-work.ts`;<br>`hooks/{use-tasks, use-learning, use-competency-evidences}.ts`, `services/{task, learning, competency-evidence}.service.ts`;<br>`lib/screens/enterprise/{manager, employee, work}.ts`, `app/routes/enterprise-pages/{manager, employee, work}.ts`, `lib/sidebars/{manager, employee}.ts` | **Agent 1** (chỉ để đổi role, đổi mã, tách file; không làm tính năng) | **Agent 2** |
| Platform:<br>`features/platform/*`, `lib/screens/platform.ts`, `lib/sidebars/platform.ts`, `app/routes/platform.routes.tsx`, `handlers/platform.ts` và handler `platform-*.ts` mới, `hooks/{use-platform, use-users}.ts`, `services/{platform, user}.service.ts` | Agent 2 | Agent 2 |

Ghi chú:
- `features/team`, `tasks`, `employee`, `learning` **không** được ai làm tính năng trong Đợt 1. Agent 1 chỉ sửa ở đó những gì bắt buộc để đổi role, mã màn hình và tách file. Agent 2 không đụng tới chúng cho đến S2.
- File test nằm cùng vùng với file nó kiểm tra.
- File không có trong bảng: hỏi chủ của thư mục cha. Nếu không rõ thì Agent 1 sở hữu.

### 1.6 Hợp đồng kỹ thuật cố định (cả hai làm đúng, không chờ nhau)

**Sidebar** (`lib/sidebars/types.ts`, Agent 1 tạo ở bước A1):
```ts
import type { LucideIcon } from 'lucide-react';
export interface SidebarItem { label: string; screenId: string; icon?: LucideIcon; /** extra screen IDs that keep this item highlighted */ activeFor?: string[] }
export interface SidebarSection { label: string; icon?: LucideIcon; /** set when the section header itself is a link (e.g. "Tổng quan") */ screenId?: string; activeFor?: string[]; items?: SidebarItem[] }
export type SidebarConfig = readonly SidebarSection[];
```
- Mỗi file `lib/sidebars/<role>.ts` export `const <ROLE>_SIDEBAR: SidebarConfig`.
- `lib/sidebars/index.ts` (Agent 1) export `sidebarFor(user)` chọn theo role cao nhất: PLATFORM_ADMIN > OWNER > MANAGER > EMPLOYEE.
- Mục chỉ hiện nếu người dùng vào được screen đích; thiếu entitlement thì hiện kèm biểu tượng khóa.

**ScreenDef** (`lib/screens/types.ts`):
- Thêm `aliases?: string[]`.
- Trường `nav` chuyển thành `@deprecated`, không còn được đọc. Agent 1 xóa hẳn ở bước cuối (J) sau khi Agent 2 đã bỏ `nav` khỏi `platform.ts`.

**Sitemap Enterprise tách file:**
- `lib/screens/enterprise/index.ts` (Agent 1) ghép `owner.ts`, `manager.ts`, `employee.ts`, `work.ts`.
- Registry trang `app/routes/enterprise-pages/{owner,manager,employee,work}.ts`, mỗi file export một `PageRegistry` một phần; `enterprise.routes.tsx` ghép lại.
- `work.ts` chứa các màn dùng chung Owner và Manager: OW-35..39 với alias MG-08..12, `roles: [OWNER, MANAGER]`.

**Mã màn hình và đường dẫn:** theo §3 kế hoạch (PUB/AUTH, OW-01..45, MG-01..15, EM-01..18, PA-01..21).

**Mock types:**
- Agent 1 chuyển `AssessmentQuestionAnswer`, `AssessmentAttemptRecord`, `CertificateRecord`, `PracticalTaskRecord`, `TaskSubmissionRecord` sang `services/mock/server/types-work.ts`; `types.ts` re-export.
- Seed nhiệm vụ, bài đánh giá và chứng nhận chuyển sang `seed-work.ts` (hàm `seedWork(data: OrgData)`), được `seed-acme.ts` gọi.
- Thêm field vào `OrgData` chỉ Agent 1 làm; Agent 2 yêu cầu qua file trạng thái.

**Tài khoản demo sau A** (mật khẩu `Admin@1234`, đuôi `@digitalent.demo`):

| Tài khoản | Vai trò |
|---|---|
| `owner` | OWNER, tổ chức Acme có Manager |
| `owner2` | OWNER, tổ chức nhỏ không có Manager |
| `manager` | MANAGER của 1–2 phòng ban Acme |
| `employee` | EMPLOYEE |
| `starter` | OWNER, gói Starter |
| `expired` | OWNER, gói hết hạn |
| `personal` | Personal |
| `platform` | PLATFORM_ADMIN |

Bỏ `admin@`, `learning@`, `learner@`. Các key `MOCK_EMAILS` trong `test/session.ts`: `owner, owner2, manager, employee, starterOwner, expiredOwner, personal, platform`. Key lưu localStorage của mock đổi sang bản mới (ví dụ `dt-mock-db-v2`, `dt-mock-org-data-v2`).

### 1.7 Phối hợp và điểm đồng bộ
- File trạng thái:
  - Agent 1 ghi `docs/specs/agents/status-agent-1.md`, Agent 2 ghi `docs/specs/agents/status-agent-2.md`.
  - Chỉ ghi file của mình; đọc file của agent kia trước mỗi bước lớn.
  - Mỗi file có các mục: **Đang làm**, **Đã xong**, **Mốc đồng bộ đạt được**, **Yêu cầu gửi agent kia**, **Yêu cầu đã xử lý**, **Ghi chú/rủi ro**.
- Các mốc:
  - **S1 (Agent 1 báo):** hợp đồng ở mục 1.6 đã có trong code: role mới, `lib/sidebars/types.ts`, `ScreenDef.aliases`, danh sách key quyền mới, `lib/terms.ts`, `types-work.ts`, `seed-work.ts`, tài khoản demo mới. Từ S1, Agent 2 được sửa `lib/screens/platform.ts` và tạo `lib/sidebars/platform.ts`.
  - **S2 (Agent 1 báo):** xong toàn bộ GĐ A; mọi trang đang có đã chạy theo mã và route mới; full test xanh. Quyền sở hữu vùng Manager / Employee / Nhiệm vụ / Học tập chuyển sang Agent 2.
  - **S3 (Agent 1 báo):** component ma trận năng lực (OW-19) và Skill Gap Dashboard (OW-21) đã export để Agent 2 dùng lại cho MG-04, MG-05.
  - **S4 (Agent 2 báo):** Agent 2 xong việc. Sau S4 Agent 1 làm bước J (dọn dẹp và tích hợp cuối).
- Kiểm tra trong lúc làm:
  - Chạy `npx vitest run <thư mục của mình>` thường xuyên.
  - Chạy `npx tsc -b`. Nếu lỗi chỉ nằm trong file của agent kia (do họ đang sửa dở), đừng sửa; ghi vào trạng thái và kiểm tra lại sau.
  - Ở mỗi mốc S, agent báo mốc phải chạy full `npx tsc -b`, `npx vitest run`, `npm run lint`, `npm run check:no-mock` và ghi kết quả.
- Không bao giờ sửa lại hoặc revert thay đổi của agent kia. Thấy lỗi trong vùng của họ thì ghi yêu cầu.

---

## 2. Nhiệm vụ của Agent 1

### A0. Nền xanh
1. Tạo `docs/specs/agents/status-agent-1.md` theo mẫu ở mục 1.7.
2. Sửa test chập chờn `src/features/commerce/__tests__/signup-journeys.test.tsx` ("takes a buyer from the pricing page to a ready organization"). Tìm nguyên nhân gốc (await còn thiếu, thứ tự, lazy import…); không chỉ tăng timeout. Chạy `npx vitest run` 3 lần liên tiếp phải xanh. (`testTimeout` 20s và `asyncUtilTimeout` 5s đã có sẵn.)
3. Review nhanh code các agent trước để lại trong `features/{team,tasks,employee,learning,platform}` và `services/mock/server/handlers/{tasks,learning,platform}.ts`, chỉ để nắm chất lượng. Ghi nhận xét vào trạng thái và gửi những điểm thuộc vùng Agent 2 làm yêu cầu cho Agent 2. Không sửa.

### A. Nền tảng v2.1 (bước A1 xong thì báo S1, cả A xong thì báo S2)

**A1. Hợp đồng (làm trước, càng sớm càng tốt):**
1. `lib/roles.ts`:
   - `ROLES = { PLATFORM_ADMIN, OWNER, MANAGER, EMPLOYEE }`, nhãn theo mục 1.3.
   - `LEGACY_ROLE_MAP`: SYSTEM_ADMIN → [PLATFORM_ADMIN, OWNER] (tạm thời); HR_MANAGER → [OWNER]; DEPARTMENT_MANAGER → [MANAGER]; EMPLOYEE, TRAINER → [EMPLOYEE].
   - Thêm `primaryRole()`.
   - Sửa mọi chỗ dùng role cũ theo hướng dẫn §4.1 kế hoạch: để `tsc` chỉ ra `ROLES.LEARNER`; với chuỗi `'LEARNER'` thì đọc ngữ cảnh từng chỗ trước khi sửa. Riêng `handlers/platform.ts` thuộc Agent 2: ghi yêu cầu, không sửa.
2. `hooks/use-permission.ts` và `services/mock/mock-rbac.ts`:
   - Ma trận quyền theo §4.2 và §10 của spec: OWNER gom quyền cũ của ORG_ADMIN + LEARNING_ADMIN + OWNER, cộng quyền task và evidence; MANAGER đọc trong scope + task + evidence, không giao khóa; EMPLOYEE tự phục vụ.
   - Thêm key mới cho: job grade, training batch, practical task (tạo/giao/xem), evidence (đánh giá), gán Manager cho phòng ban.
   - Ghi danh sách key mới vào trạng thái.
3. `lib/terms.ts` (glossary mục 1.3). Rà `lib/competency-levels.ts` theo glossary.
4. Tạo `lib/sidebars/types.ts`, thêm `aliases` vào `lib/screens/types.ts`, đánh dấu `nav` là deprecated (mục 1.6).
5. Tách `types-work.ts` và `seed-work.ts` (mục 1.6).
6. Tài khoản demo mới, `test/session.ts`, đổi key localStorage của mock.
7. Chạy `tsc` và test, ghi **S1** cùng danh sách key quyền vào trạng thái.

**A2. Sitemap, sidebar, layout:**
1. Tách sitemap Enterprise thành `lib/screens/enterprise/{index,owner,manager,employee,work}.ts`. Đánh số lại theo §3 kế hoạch, đăng ký **mọi trang đang có** theo bảng §10.1 vào `app/routes/enterprise-pages/*`.
   - Màn chưa có trang dùng PlaceholderPage.
   - Hai trang chưa gộp (OrganizationOverview + CapabilityDashboard) tạm thời gắn vào OW-01 bằng một wrapper đơn giản; GĐ B gộp thật.
2. Viết `lib/sidebars/{owner,manager,employee}.ts` đúng cây sidebar của spec §6, §7, §8; tạo `lib/sidebars/index.ts`.
3. Sửa `RoleSidebar` cho cấu trúc mới (mục đơn, nhóm có mục con, mục sáng theo `activeFor`, khóa entitlement, drawer mobile). Sửa `EnterpriseLayout` và `PlatformLayout` dùng `sidebarFor(user)`; `PlatformLayout` tạm thời dùng sidebar sinh từ `PLATFORM_SCREENS` cho đến khi Agent 2 có `lib/sidebars/platform.ts`.
4. Topbar: chuông thông báo (popover + số chưa đọc + link "Xem tất cả"); avatar menu gồm Hồ sơ của tôi, Bảo mật, Đăng xuất. Bỏ SHR khỏi sidebar. Đăng ký route account và notifications cho cả `/enterprise` và `/platform`.
5. `app/routes/legacy-redirects.ts`: bảng đường dẫn cũ → mới, gồm mọi route `/enterprise/*` và `/platform/*` đổi tên. Redirect giữ query string.
6. `getHomePath`: OWNER → `/enterprise/dashboard`, MANAGER → `/enterprise/team`, EMPLOYEE → `/enterprise/me`, PLATFORM_ADMIN → `/platform/dashboard`.

**A3. Dữ liệu và luật:**
1. Mock data:
   - Job Grade G1–G3 cho mỗi tổ chức (tên và mô tả).
   - `JobPositionRecord.departmentId` và `jobGrade`; seed Acme có đủ G1/G2/G3.
   - `DepartmentRecord.managerEmployeeId`; seed Manager cho 1–2 phòng ban.
   - Hàm lọc nhân viên theo phạm vi (`employeesInScope`) dùng `managerEmployeeId`.
2. `role-policy` và handler `members`: luật Owner theo mục 1.4. Mock server trả 409 khi vi phạm `owner_count >= 1`.
3. Chế độ chỉ đọc khi hết hạn (§3.7 kế hoạch):
   - Session có `isReadOnly`.
   - Hook `useCanWrite()`.
   - `RequireActiveSubscription` cho OWNER đi qua ở chế độ chỉ đọc; Manager/Employee thấy màn hết hạn.
   - Router mock trả 402 cho mọi request ghi của tổ chức hết hạn, trừ `/subscription/*`.
   - Banner trên layout.
4. Test:
   - Sidebar từng role khớp spec (một test cho mỗi role, liệt kê nhãn mục).
   - Mỗi `screenId` trong sidebar đều tồn tại.
   - Redirect cũ → mới.
   - Luật Owner cuối cùng.
   - Chế độ chỉ đọc.
   - Sửa mọi test cũ bị vỡ.
5. Full kiểm tra, code-reviewer, ghi **S2**.

### B. Owner: Tổ chức (sau S2)
- OW-01: gộp thật hai trang tổng quan; thêm phân bố G1/G2/G3, đợt đào tạo đang chạy, minh chứng chờ duyệt, khóa quá hạn, ghế.
- OW-02: nền là `MembersPage`, thêm filter và cột của `WorkforcePage` (Phòng ban / Vị trí / Cấp bậc / Vai trò / Học tập / Gap / Trạng thái tài khoản); xóa `WorkforcePage`.
- OW-03: `MemberDetailPage` thành tabs Tổng quan / Năng lực / Skill gap / Học tập / Đánh giá / Nhiệm vụ / Minh chứng / Thành tựu. Tách component tab từ `EmployeeCapabilityPage` để Agent 2 dùng lại cho MG-03 ở chế độ chỉ đọc. Export qua `features/members/components/employee-tabs/index.ts` và ghi vào trạng thái.
- OW-04 (modal mời) và OW-05 (drawer sửa phân công).
- OW-06: danh sách phòng ban mở rộng. OW-07: chi tiết phòng ban (mới). OW-08: modal, có chọn Manager.
- OW-09: danh sách vị trí, bỏ tab Nhóm công việc, xóa `JobFamilyFormDialog`. OW-10: chi tiết vị trí, thêm tab Lịch sử. OW-11: modal có phòng ban và cấp bậc. OW-12: cấu hình cấp bậc (mới).
- OW-13: viết lại theo Q3, gồm gán phòng ban cho Manager.
- AUTH-04/05: wizard thêm logo, timezone, bước Cấp bậc và bước Thành viên.

### C. Owner: Năng lực
- OW-14/15 (OW-15 thêm danh sách nhân viên đang thiếu).
- OW-16 Requirement Set List (mới).
- OW-17 thêm rationale từng dòng và lý do thay đổi khi lưu; OW-18 thêm người đổi và lý do.
- OW-19 ma trận và OW-20 chi tiết hồ sơ (mới).
- OW-21 thêm góc nhìn theo Cấp bậc; OW-22 thành trang, xóa `SkillGapDetailDrawer`.
- Export component ma trận và component skill gap theo phạm vi, rồi báo **S3**.

### D. Owner: Đào tạo
- OW-23/24: catalog khóa chuẩn và chi tiết khóa.
- OW-25..27: Đợt đào tạo (mock, handler, trang, wizard tạo đợt).
- OW-28: giao khóa theo cấp bậc hoặc từ skill gap. OW-29 giữ nguyên.

### H. Owner: P1
- OW-30 thêm filter cấp bậc; component phải hoạt động đúng khi API trả dữ liệu theo phạm vi Manager (Agent 2 dùng cho MG-06).
- OW-31..33: khóa nội bộ (OW-33 mới).
- OW-34: kết quả đánh giá.
- OW-40: báo cáo (mới).
- OW-41/42/43: tách `BillingPage`.
- OW-44/45 giữ nguyên.
- Xóa `CertificateRegistryPage`.

### J. Tích hợp cuối (sau S4)
- Xóa trường `ScreenDef.nav`, các wrapper tạm, code chết.
- Giữ bảng redirect cho đến khi người dùng bảo xóa.
- Full kiểm tra; kiểm tra trên trình duyệt với cả 8 tài khoản demo.
- Cập nhật `CLAUDE.md` (role, sidebar theo role, mock REST server, tài khoản demo) và thêm mục "Kết quả triển khai" vào kế hoạch.
- Báo cáo cho người dùng.

Không xóa `features/experience`. Không làm GĐ E, F, G, I (của Agent 2).

