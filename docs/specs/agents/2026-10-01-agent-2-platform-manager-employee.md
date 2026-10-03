# Prompt cho Agent 2: Platform, Manager, Employee, Nhiệm vụ

Bạn là **Agent 2**. Bạn làm song song với **Agent 1** (prompt: `docs/specs/agents/2026-10-01-agent-1-foundation-owner.md`) trên **cùng một working tree** `D:\digitalent-ai\frontend`. Hai agent không được sửa cùng một file. Đọc hết mục 1 trước khi làm gì.

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

## 2. Nhiệm vụ của Agent 2

### Khởi động
1. Tạo `docs/specs/agents/status-agent-2.md` theo mẫu ở mục 1.7.
2. Đọc `status-agent-1.md` (nếu đã có). Chạy `npx vitest run src/features/platform` để nắm trạng thái ban đầu.

### I. Cổng Platform (Đợt 1, làm ngay, song song với GĐ A của Agent 1)
Toàn bộ vùng Platform ở bảng 1.5 thuộc bạn từ đầu.

**Trước S1:** chỉ làm trong `features/platform/*`, `handlers/platform*.ts`, `hooks/use-platform.ts`, `hooks/use-users.ts`, `services/platform.service.ts`, `services/user.service.ts`. Chưa sửa `lib/screens/platform.ts`.

1. Chỉnh trang đang có theo §10.2 kế hoạch:

   | Mã v2.1 | Trang |
   |---|---|
   | PA-01 | `PlatformDashboardPage` |
   | PA-02/03 | `PlatformOrganizationsPage` / `PlatformOrgDetailPage`: tabs Overview / Subscription / Usage / Contacts / Support History; tạm ngưng/kích hoạt có audit; không hiện dữ liệu nghiệp vụ nhạy cảm không cần thiết |
   | PA-06 | `PlatformFrameworkPage` |
   | PA-08 | gộp `PlatformCurriculumPage` + `PlatformCoursesPage` thành một danh sách chương trình chuẩn (lọc theo miền / tầng / trạng thái, số module, độ phủ năng lực) |
   | PA-10 | `PlatformCourseEditorPage` |
   | PA-11 | `PlatformAssessmentBankPage` |
   | PA-14/15 | `PlatformPositionsPage` / `PlatformPositionRequirementsPage` |
   | PA-16 | `PlatformPlansPage` |
   | PA-18 | `PlatformSubscriptionsPage` |
   | PA-20 | `PlatformAuditLogPage` |
   | PA-21 | `PlatformSettingsPage` |

2. Làm mới:
   - PA-04/05: danh sách và chi tiết tài khoản người dùng. Tìm theo email / loại / tổ chức / trạng thái; khóa, mở khóa, hỗ trợ đặt lại mật khẩu, có audit. Đọc user từ mock-store qua `getDb`/`updateDb`; cần field mới trong `StoredUser` thì yêu cầu Agent 1.
   - PA-07: chi tiết năng lực, sửa được source-of-truth.
   - PA-09: chi tiết khóa chuẩn (tabs Overview / Competencies / Modules / Assessment / Version).
   - PA-12: soạn câu hỏi.
   - PA-13: Assessment Template.
   - PA-17: chi tiết/sửa gói.
   - PA-19: chi tiết subscription.
3. Áp glossary mục 1.3 cho mọi trang Platform. Riêng PA-06/07 hiển thị cả "Bậc năng lực" (Bậc 1–8) vì đây là nơi quản lý khung.

**Sau S1:**
1. Viết lại `lib/screens/platform.ts`:
   - Mã PA-*, đường dẫn theo §3.5 kế hoạch.
   - Bỏ trường `nav`.
   - Bỏ SHR-01/02/03 (Agent 1 đăng ký account và notifications ở layout).
2. Tạo `lib/sidebars/platform.ts` theo spec §5: TỔNG QUAN · DOANH NGHIỆP (Doanh nghiệp, Người dùng) · NỘI DUNG NỀN TẢNG (Khung năng lực TT02, Chương trình đào tạo chuẩn, Ngân hàng đánh giá, Vị trí tham chiếu) · THƯƠNG MẠI (Gói dịch vụ, Subscription) · HỆ THỐNG (Audit Log, Cấu hình).
3. Cập nhật `app/routes/platform.routes.tsx`. Đường dẫn cũ `/platform/*` cần redirect: gửi danh sách cũ → mới cho Agent 1 (Agent 1 sở hữu `legacy-redirects.ts`).
4. Ghi vào trạng thái "Platform sidebar sẵn sàng" để Agent 1 nối `PlatformLayout` sang `sidebarFor`.
5. Trong `handlers/platform.ts`: đổi đếm role `'LEARNER'` thành `'EMPLOYEE'`.
6. Test cho các trang mới và sửa; chạy code-reviewer; ghi "Xong I" vào trạng thái.

**Nếu xong I trước S2:** chỉ được làm tiếp trong vùng Platform (cải thiện, test, a11y), hoặc chuẩn bị bản thiết kế/ghi chú cho E, F, G trong file trạng thái. **Không** sửa `features/{team,tasks,employee,learning}` trước S2.

### E. Employee (Đợt 2, sau S2)
Vùng Manager / Employee / Nhiệm vụ / Học tập chuyển sang bạn. Agent 1 đã đăng ký sẵn route và mã mới ở `lib/screens/enterprise/{manager,employee,work}.ts`; đọc kỹ trước khi sửa.

1. Chỉnh trang đang có theo §10.1 kế hoạch:

   | Mã | Trang | Việc cần làm |
   |---|---|---|
   | EM-01 | `MyDevelopmentDashboardPage` | |
   | EM-02 | `MyCompetencyProfilePage` | hiện Phòng ban / Vị trí / Cấp bậc; bỏ phần trùng với EM-03 |
   | EM-03 | `MySkillGapPage` | giải thích vì sao có yêu cầu (rationale) |
   | EM-04 | `EvidencePortfolioPage` | dòng thời gian minh chứng, chỉ đọc |
   | EM-06 | `MyLearningPage` | các nhóm: Được giao / Được đề xuất / Đang học / Đã xong |
   | EM-07 | `CourseDetailPage` | |
   | EM-08 | `LessonViewerPage` | |
   | EM-10..13 | các trang Assessment | Kết quả **không** coi đậu bài là năng lực đã xác nhận |
   | EM-18 | `MyCertificatesPage` | |

2. Làm mới:
   - EM-05: Lộ trình học (thứ tự, điều kiện tiên quyết, ưu tiên, lý do được giao hoặc đề xuất).
   - EM-09: danh sách bài đánh giá (Có thể làm / Đang làm / Đã xong / Được làm lại).
3. Sidebar `lib/sidebars/employee.ts` theo spec §8: TỔNG QUAN · NĂNG LỰC CỦA TÔI · HỌC TẬP (Lộ trình của tôi, Khóa học của tôi) · ĐÁNH GIÁ · NHIỆM VỤ THỰC TẾ · THÀNH TỰU. Nhóm có nhiều route dùng tabs gắn route, ví dụ "Năng lực của tôi" gồm EM-02/03/04.
4. Áp glossary cho mọi trang.

### F. Nhiệm vụ thực tế và minh chứng (Đợt 2)
1. Các trang `features/tasks` dùng chung OWNER (toàn tổ chức) và MANAGER (phạm vi nhóm), mã OW-35..39 = MG-08..12, đường dẫn `/enterprise/tasks`, `/tasks/new`, `/tasks/:id`, `/enterprise/reviews`, `/reviews/:submissionId`.
   - Dữ liệu lọc theo phạm vi do API trả (dùng `employeesInScope` của Agent 1), không lọc ở UI.
   - Trạng thái nhiệm vụ: Draft / Assigned / In Progress / Submitted / Revision / Approved / Rejected (nhãn tiếng Việt).
   - Xóa `EvidenceDetailPage` (§10.3) và màn MGR-11.
2. OW-39 / MG-12 Đánh giá minh chứng:
   - Xem bài nộp, tiêu chí/rubric, phản hồi, trình độ năng lực đề nghị; Duyệt / Yêu cầu sửa / Từ chối.
   - Duyệt thì cập nhật hồ sơ năng lực (nguồn TASK) và tính lại skill gap, gọi hàm của `org-logic.ts`/`engine.ts` (được import, không sửa).
3. Employee:
   - EM-14 `MyPracticalTasksPage`.
   - EM-15 chi tiết nhiệm vụ (mới; có thể tách phần đầu của `SubmitEvidencePage`).
   - EM-16 `SubmitEvidencePage` (file / link / text, nộp lại khi bị yêu cầu sửa).
   - EM-17 `TaskFeedbackPage`.
4. Test: luồng SME không có Manager (`owner2@`: giao nhiệm vụ → `employee` nộp → `owner2` duyệt → gap đổi) và luồng có Manager (`manager@` chỉ thấy nhân viên trong phòng mình quản lý).

### G. Manager (Đợt 2; MG-04, MG-05 sau S3)
1. Chỉnh trang đang có:
   - MG-01 `TeamCapabilityDashboardPage`: headcount, phân bố cấp bậc, gap lớn, đào tạo đang chạy, quá hạn, bài chờ duyệt.
   - MG-02 `TeamMembersPage`: lọc vị trí / cấp bậc / trạng thái.
   - MG-03 `TeamMemberDetailPage`: dùng component tab của Agent 1 (`features/members/components/employee-tabs`) ở chế độ chỉ đọc, các tab Tổng quan / Năng lực / Gap / Học tập / Nhiệm vụ / Minh chứng.
   - MG-05 `TeamSkillGapPage`: theo năng lực / vị trí / cấp bậc, xem xuống danh sách thành viên.
2. Làm mới:
   - MG-04 ma trận năng lực của nhóm (dùng component OW-19 của Agent 1 sau S3).
   - MG-06 đào tạo của nhóm (dùng component `TrainingMonitorPage` của Agent 1; API tự lọc theo phạm vi).
   - MG-07 chi tiết phân công đào tạo, chỉ đọc.
   - Manager **không** có nút giao khóa học ở bất kỳ đâu.
3. Phần cá nhân MG-13..15 dùng lại trang EM (cùng route `/enterprise/me/*`). Sidebar `lib/sidebars/manager.ts` theo spec §7: TỔNG QUAN · NHÓM CỦA TÔI (Thành viên, Năng lực nhóm, Tiến độ đào tạo) · ĐÁNH GIÁ THỰC TẾ (Nhiệm vụ, Chờ đánh giá) · CÁ NHÂN (Học tập của tôi, Năng lực của tôi).
4. Manager có role nhưng chưa phụ trách phòng nào: hiện trạng thái trống kèm hướng dẫn liên hệ Owner.

### Kết thúc (S4)
- Full `npx tsc -b`, `npx vitest run` (chạy 2 lần), `npm run lint`, `npm run check:no-mock`.
- Kiểm tra trên trình duyệt với `manager@`, `employee@`, `owner2@` (luồng nhiệm vụ), `platform@`, ở cả desktop và 375px.
- Chạy code-reviewer và sửa lỗi CRITICAL/HIGH.
- Ghi **S4** vào trạng thái kèm: danh sách màn đã xong, màn còn placeholder, yêu cầu còn treo cho Agent 1.
- Báo cáo cho người dùng.

Không làm các GĐ A, B, C, D, H, J (của Agent 1). Không xóa `features/experience`.
