# Báo cáo kiểm tra Sprint 1–3 (UI/UX + API) — 29/09/2026

| Mục | Nội dung |
| --- | --- |
| Người chạy | Claude Code (theo prompt `docs/superpowers/prompts/2026-09-29-verify-sprint1-3-ui.md`) |
| Branch | `feature/DT-210-skill-gap-engine` @ `212e90f` (chưa push; hơn `origin/codex/two-frontend-flows-sprint2-closure` 19 commit) |
| Môi trường | API `:5000` + Vite `:5173`, Postgres `digitalent-test-pg` `:55432`, DB `digitalent_dev` reset về seed trước mỗi đợt |
| Công cụ | Playwright MCP (Chrome của Leader), script Node gọi API (`fetch`), client Node `@microsoft/signalr` |
| Phạm vi | Giai đoạn A — **mốc trước điều chỉnh Thông tư 02/2025**. Không sửa code ở giai đoạn này |

## 1. Tóm tắt

| Loại | Số lượng |
| --- | --- |
| Kiểm tra API tự động (script) | 30/32 PASS — 2 FAIL: 1 lỗi thật (F-02), 1 là quyền có chủ đích (employee đọc `/departments`) |
| Hạng mục UI (bảng §3) | PASS 15 · PARTIAL 6 · FAIL 2 · PLACEHOLDER 18 (§7) |
| Lỗi mới | **2 HIGH** · 5 MEDIUM · 7 LOW |
| Backend test | **156/156** (xem lưu ý môi trường §7) |
| Frontend | `tsc -b` sạch · lint 0 lỗi (chỉ warning, trong `features/experience`) · Vitest **91/91** · `npm run build` pass |

Kết luận: luồng nghiệp vụ Sprint 1–3 **chạy đúng số liệu spec** (gap 3 → 2, coverage 47.5% → 72.5%, gợi ý 55.00 / 49.17 / 39.25, SignalR đẩy tới đúng người). Hai lỗi HIGH nằm ở phần nền dùng chung, không thuộc Giai đoạn B: **toast không bao giờ hiện** (F-01) và **API nhân viên không giới hạn theo phòng ban** (F-02). Toàn bộ task Sprint 3 vẫn **To Do** trên Jira và chưa push/PR, nên các ô DoD "✅" về push, PR, review trong `DANH_SACH_TASK_TRAN_VAN_LINH.md` **chưa đạt**.

## 2. Kết quả kiểm tra API (script `phase-a-api.mjs`, DB seed)

| ID | Kiểm tra | Kết quả |
| --- | --- | --- |
| S1-AUTH-1/2 | Sai mật khẩu và email không tồn tại → cùng 401 "Invalid email or password." | PASS |
| S1-AUTH-3/4 | Refresh xoay vòng token; dùng lại refresh token cũ → 401 "Suspicious activity detected" | PASS |
| S1-AUTH-5 | Access token hỏng → 401 | PASS |
| S1-LOCK | 5 lần sai → lần 6 và cả mật khẩu đúng → 403 "Account is locked…" | PASS (văn bản khác MSG02, F-14) |
| S1-RBAC | Ma trận 13 endpoint × 5 vai trò (bảng dưới) | PASS, trừ F-02 |
| S2-ORG-1..6 | Tạo phòng ban; trùng mã phòng ban / vị trí / nhân viên → 409 kèm thông điệp rõ; archive giữ bản ghi `ARCHIVED`; phân trang server | PASS |
| S2-ORG-7 | manager@ **thấy nhân viên phòng khác** qua `GET /employees` | **FAIL → F-02** |
| S2-PR-1..5 | Bộ ACTIVE tổng 100; mức 4 → 400; tổng 95 → 400 ở server; kích hoạt 2 bản liên tiếp OK, bản cũ `ARCHIVED`; kích hoạt bản archived → 400 | PASS |
| S3-GAP-1 | Batch: 2 tính, HR Manager + Trainer bỏ qua `NO_JOB_POSITION` | PASS |
| S3-GAP-2/3 | employee@: gap 3, priority 90 / 75 / 15, coverage 47.5 | PASS |
| S3-REC-1/2 | DA-ADVANCED 55 > SEC-BASIC 49.17 > DA-EXCEL-PBI 39.25; AI-OFFICE (DRAFT) không xuất hiện | PASS |
| S3-API-1..6 | `limit=0` → 400; employee xem người khác → 404; trainer → `NO_SKILL_GAP_RUN`; mức 4 → 400; **HR tự xác nhận → 403** "You cannot confirm your own competency level."; thiếu ghi chú → 400 | PASS |

Ma trận quyền (mã HTTP; 400/404/409 = qua được lớp quyền, bị chặn ở validate hoặc dữ liệu):

| Endpoint | admin | hr | manager | trainer | employee |
| --- | --- | --- | --- | --- | --- |
| GET /departments | 200 | 200 | 200 | 200 | 200 |
| POST /departments | 200 | 409 | 403 | 403 | 403 |
| GET /employees | 200 | 200 | 200 | 403 | 403 |
| POST /competencies | 400 | 400 | 403 | 403 | 403 |
| POST /position-requirements | 400 | 400 | 403 | 403 | 403 |
| GET /intelligence/skill-gaps | 200 | 200 | 200 | **403** | 200 |
| POST …/skill-gaps/calculate-batch | 200 | 200 | 200 | 403 | 403 |
| GET /intelligence/recommendations | 200 | 200 | 200 | **200** | 200 |
| POST /competency-evidences/manual | 400 | 400 | 403 | 403 | 403 |

Trainer đọc được gợi ý nhưng không đọc được skill gap của chính mình (liên quan F-05).

## 3. Trang × vai trò × kết quả

Bằng chứng: ảnh trong `.playwright-mcp/` (không commit), request trong `browser_network_requests`.

| Route | Vai trò | Kết quả | Ghi chú / bằng chứng |
| --- | --- | --- | --- |
| `/login` | khách | PARTIAL | Sai mật khẩu báo lỗi, không lộ tài khoản; `returnTo=//evil.example/x` bị bỏ qua → về `/enterprise/hr/dashboard`. Lỗi nhỏ F-12. `a-login-1280.png` |
| Landing theo vai trò | 5 vai trò | PASS | admin → `admin/dashboard`, hr → `hr/dashboard`, manager → `manager/dashboard`, trainer → `trainer/dashboard`, employee → `my-dashboard` |
| Sidebar theo vai trò | 5 vai trò | PARTIAL | Lọc đúng theo role, nhưng F-03 (My Tasks 404) và F-04 (Learner Results → Access Denied cho HR) |
| URL không được phép | hr | PASS | `admin/users`, `admin/roles`, `admin/settings`, `trainer/question-bank`, `trainer/learners` → "Access Denied" |
| Route cũ | hr | PASS | `/dashboard`, `/organization/departments`, `/competency-framework` → `/enterprise/*` |
| URL không tồn tại | mọi | PASS | `/enterprise/does-not-exist`, `/nope` → 404 |
| Departments | hr | PARTIAL | Nhãn `*` bắt buộc, lỗi cạnh field khi để trống; archive hỏi xác nhận có tên "Operations"; **trùng mã: server 409 nhưng UI không hiện gì** (F-01, F-07); không sort cột (F-11) |
| Job Positions / Employees | hr, manager | PASS (UI) | Trùng mã → 409 (API). Phạm vi manager sai ở API (F-02) |
| Competency Framework | hr | PASS | 5 năng lực tự đặt, 3 tiêu chí/mức. **Chưa gắn Thông tư 02/2025** (đúng kỳ vọng — K-9) |
| Position Requirements | hr | PARTIAL | Chọn vị trí/version, tổng trọng số, kích hoạt; nhãn "**Level 2 - Applied**" khác "Intermediate" (F-09). Quy tắc 9–14 chưa làm (K-3) |
| Team Skill Gap | hr | PASS | Empty state có giải thích + nút; "Recalculate all" → banner "Calculated 2 employee(s); 2 skipped" + lý do; cột "N high", coverage. `a-skillgap-hr-empty.png`, `a-skillgap-hr-after-recalc.png` |
| Team Skill Gap | manager | PASS | Không có bộ lọc phòng ban; có nút tính lại; panel **không** có "Confirm level" |
| Team Skill Gap | employee | PASS | Không có trong sidebar; gõ URL → chỉ thấy dòng của mình (vẫn hiện bộ lọc phòng ban, không ảnh hưởng dữ liệu) |
| Panel chi tiết | hr | PARTIAL | KPI 5 / 2 / 3 / 47.5%, bảng sắp theo priority, "Not confirmed", Esc đóng panel, gợi ý khóa học đủ. Radar: K-1. Ngày dạng `9/29/2026, 10:37:11 PM` (F-08). `a-skillgap-panel-hr.png` |
| Confirm level | hr | PASS | Thiếu ghi chú → "required"; Esc đóng dialog trước panel; Information security = Intermediate → Met 3, Gaps 2, 72.5%; SEC-BASIC biến mất. `role="dialog"` + `aria-labelledby` |
| Thông báo realtime | employee (client Node) + hr (UI) | PARTIAL | Client nhận `ReceiveNotification` "Skill gap updated" lúc 15:39:31Z, có dòng `notifications`. **Toast trên trình duyệt không thể hiện** vì thiếu `<Toaster />` (F-01) |
| My Competency Profile | employee | PASS | Tab "Skill gap" và "Recommended courses" (`role="tab"`): điểm, breakdown, lý do từng năng lực |
| My Competency Profile | trainer | FAIL | API 403 nhưng UI báo "No skill gap analysis yet"; tab trống ~3 giây khi retry (F-05). Tab gợi ý hiện empty state `NO_SKILL_GAP_RUN` đúng |
| Public `/`, `/careers`, `/careers/:slug`, `/verify` | khách | PASS | Chạy không cần đăng nhập. Catalog nghề là vị trí IT (khác 5 vị trí Thông tư — để Sprint 4, D-B5) |
| `/learn/*` (10 route) | khách | PASS | Chạy, UI tiếng Việt, `/learn/courses` → `/learn/path`. Còn thang 6 mức (xem §5) |
| Responsive 768×1024 | hr | PASS | Không tràn ngang (Skill Gap, Position Requirements, Employees) |
| Responsive 375×812 | hr | FAIL | Mọi trang enterprise tràn ngang (scrollWidth 462 > 375), sidebar 256px không thu gọn thành drawer (F-06). `a-departments-375.png` |
| Console / network | mọi | PASS | Chỉ có lỗi dự kiến: 401 (thử sai mật khẩu), 409 (thử trùng mã), 403 (trainer, F-05), SignalR negotiation (K-8, mọi `negotiate` → 200) |

## 4. Danh sách lỗi

| ID | Mức | Trang | Tái hiện | Kỳ vọng | Thực tế |
| --- | --- | --- | --- | --- | --- |
| **F-01** | **HIGH** | Toàn app | Tạo phòng ban trùng mã `OPS`; hoặc HR xác nhận năng lực khi employee đang mở app | Toast lỗi / thành công / "Skill gap updated" hiện ra | Không có toast nào. `grep "<Toaster"` trong `frontend/` = 0 kết quả, `git log -S "Toaster"` rỗng — **chưa từng mount**. Test Vitest mock `sonner` nên không phát hiện. Ảnh hưởng DoD S2-T016 ("Sonner Toast"), S3-T016 ("Toast lỗi và thành công"), realtime toast S3-T018, CR-02 |
| **F-02** | **HIGH** | `GET /api/v1/employees`, `GET /employees/{id}` | HR tạo phòng ban B + nhân viên "Outsider QA"; manager@ gọi `GET /employees` | Chỉ nhân viên phòng OPS (SRS BR-12, `EmployeeScope`) | Thấy cả "Outsider QA". `GetPagedEmployeesUseCase` / `GetEmployeeByIdUseCase` chỉ lọc `OrganizationId` |
| F-03 | MEDIUM | Sidebar employee | Bấm "My Tasks" | Trang task của tôi hoặc ẩn mục | `/enterprise/my-tasks` → 404 (route không tồn tại) |
| F-04 | MEDIUM | Sidebar hr | Bấm "Learner Results" | Trang mở được, hoặc mục bị ẩn | "Access Denied" — sidebar lọc theo **role**, route chặn theo **permission** `attempt.read_result` (HR không có) |
| F-05 | MEDIUM | My Competency Profile (trainer) | trainer mở trang, tab "Skill gap" | Thông báo không có quyền, hoặc cấp quyền đọc của chính mình | `me/latest` 403 hiển thị thành "No skill gap analysis yet"; tab trống ~3 giây do React Query retry 403. Trainer lại có `recommendation.read` |
| F-06 | MEDIUM | Layout enterprise | `browser_resize` 375×812 | Sidebar thành drawer, không tràn ngang | Tràn ngang 87px, nội dung còn ~120px |
| F-07 | MEDIUM | Form Organization (Department/Position/Family/Employee) | Lưu bản ghi trùng mã | Hiện thông điệp server ("Department code 'OPS' already exists.") cạnh field hoặc toast | Code chỉ gọi `toast.error('Failed to create department')` — mất lý do (và F-01 làm toast không hiện) |
| F-08 | LOW | Skill Gap panel, My Competency Profile | Mở panel | `dd/mm/yyyy` (CR-05) | `9/29/2026, 10:39:31 PM` |
| F-09 | LOW | Position Requirements | Mở level picker | Basic / Intermediate / Advanced (S1-T002) | "Level 2 - Applied" — sửa ở B1/B5 |
| F-10 | LOW | Form Department | Gửi form | Nút submit khóa khi đang gửi | Không quan sát được trạng thái khóa (request < 150 ms) — cần kiểm tay với mạng chậm |
| F-11 | LOW | Bảng danh sách | Bấm tiêu đề cột | Sắp xếp (CR-01) | Không có sort |
| F-12 | LOW | Login | Mở trang | Nhãn field rõ, cùng ngôn ngữ | Ô email có tiền tố "🇻🇳 +84"; input không có `<label>` (chỉ placeholder); lỗi tiếng Anh trên trang tiếng Việt |
| F-13 | LOW | Layout | `browser_snapshot` | Mục điều hướng là link; nút icon có tên | Sidebar dùng `<button>` (không mở tab mới được); 3 nút icon (thu gọn sidebar, tìm kiếm, chuông) không có accessible name |
| F-14 | LOW | Login bị khóa | Sai 5 lần | MSG02 "…Try again in 15 minutes." | "Account is locked. Please try again later or contact the administrator." |

Ghi nhận khác (không tính lỗi): employee có `department.read` theo ma trận mặc định (có chủ đích); dashboard HR/manager/trainer/employee hiển thị số 0 tĩnh, admin dashboard ghi "will display real metrics" — xếp vào placeholder; route mới `/intelligence/skill-gap` không có redirect route cũ (không bắt buộc).

## 5. Thang mức (S1-T002) — chỗ chưa dùng 3 mức

| Nơi | Hiện trạng | Bước xử lý |
| --- | --- | --- |
| DB / API | CHECK 1–3; validator trả 400 cho mức 4 (requirement, evidence) | Đạt |
| Enterprise Skill Gap / Confirm level | Basic / Intermediate / Advanced | Đạt |
| Position Requirements | "Level 2 - Applied" | B1/B5 |
| `SkillGapSeeder.cs` | Tên mức "Trung cấp" | B1 |
| `LearnerTargetPage.tsx` | "Cơ bản (L1-L2) / Trung cấp (L3-L4) / Nâng cao (L5-L6)", "Level {n}/6", "Level 3/6" | B10 |
| `LearnerDiagnosticPage.tsx` | "L{n}/6 (Chuẩn: L{m})" | B10 |
| `LearnerProgressPage.tsx` | "Thang 1-6", "Level 4/6" | B10 |
| `learnerData.ts` | `level: 'Trung cấp'` | B10 |
| `careerData.ts` | 17 nhãn "Level 5-6 …", "Level 4 (Trung cấp)", "Trung cấp" | B10 |
| `LandingPage.tsx` | "Level 1-6" | B10 |
| `features/experience/**` (`/experience`, giao diện mẫu) | Thang 8 mức DigComp | Ngoài phạm vi B10 — đề xuất ghi chú "giao diện mẫu" |

## 6. Task Sprint 1–3 ↔ DoD ↔ hiện trạng

Jira (tra ngày 29/09): Sprint 1–2 của LinhTV đều **Done**; **mọi task Sprint 3 (S3-T001..T028) vẫn To Do**. Mã `S3-T026` đã thuộc DT-226 (Report 4, VietTN) nên **không dùng tạm** cho việc điều chỉnh Thông tư.

| Task | DoD ghi "✅" nhưng chưa đạt | Hiện trạng thực tế |
| --- | --- | --- |
| S1-T001, S1-T018, S1-T019, S1-T023, S2-T001, S2-T028 | — | Việc quản trị / tài liệu, Jira Done. Không kiểm được chữ ký Mentor bằng công cụ |
| S1-T002 Thang 3 mức | "Hoàn thành 100%" | DB/API đạt; nhãn còn lệch (§5) → B1, B10 |
| S2-T014 BE Position Requirement | — | Luồng tạo nháp → sửa → kích hoạt → archive đạt (S2-PR-1..5) |
| S2-T016 FE Editor | "responsive", "Sonner Toast", "`CompetencyMatrixGrid` tái sử dụng ở `/learn/target`" | Toast không hiện (F-01); mobile tràn (F-06); **không có component `CompetencyMatrixGrid`** trong mã nguồn |
| S2-T026 Report 4 | "Không còn mâu thuẫn mã nguồn ↔ tài liệu" | Chưa có `competency_frameworks`, `competency_framework_mappings` → B9 |
| S3-T002 / S3-T003 | Toàn bộ | Spec `2026-09-28-sprint3-…-spec.md` có D-S3-01..15, ví dụ tính tay, AC, test matrix. Mô tả Jira cũ (severity CRITICAL/HIGH/MEDIUM/MET, `matchScore`) đã được spec thay bằng HIGH/MEDIUM/LOW và điểm 70/20/10 |
| S3-T015 Skill Gap API | Push + PR + review | API đạt số liệu §4.5. Chưa push |
| S3-T016 FE Skill Gap | "Toast lỗi và thành công", heatmap, radar tuyến learner | Trang đạt AC; toast không hiện (F-01); heatmap cắt (K-4); radar tuyến learner chưa làm (thứ tự cắt số 3 trong plan) |
| S3-T017 Recommendation | `POST /recommendations/generate` | Theo D-S3-10 chỉ có `GET` (stateless) — đúng spec, khác mô tả Jira |
| S3-T018 Domain events | "Chúc mừng … vượt qua bài thi" | Theo D-S3-08 bài thi không xác nhận năng lực; event từ evidence thủ công + kích hoạt bộ tiêu chuẩn; push SignalR đạt; toast FE không hiện (F-01) |
| S3-T020 Unit tests | — | 156 test, Intelligence 97.4% line / 91.3% branch (plan Task 7) |
| S3-T024 Quy chế thi lại | Toàn bộ | **Chưa làm** — chờ Mentor duyệt SQL v2.4 (K-6) |
| S3-T025 Report 3 | Push + review | SRS v3.1 viết xong nhưng **untracked** |
| Mọi task Sprint 3 | "push … mở PR", "Reviewer Approved" | **Chưa đạt**: branch chưa push, chưa PR, Jira To Do |

## 7. Placeholder

| Nhóm | Trang | Đề xuất |
| --- | --- | --- |
| Theo kế hoạch Sprint 4+ | CourseList, CourseAssignment, QuestionBank, AssessmentList, LearnerResults, CertificateList, TaskBoard, TrainingRisk, Readiness, MyLearning, MyAssessments, MyCertificates | Giữ Sprint 4–5 |
| Thuộc Sprint 1–2 theo SRS — **cần xác nhận phạm vi** | UserManagement (UC-08), RolePermission (UC-09), AuditLog (UC-12), SystemConfig (UC-10/11/13), NotificationCenter (UC-07), MyProfile (UC-04) | Đưa vào Sprint 4 hoặc ghi rõ "hoãn" trong SRS §13. NotificationCenter nên đi cùng việc sửa F-01 |
| NotFoundPage | Đã có nội dung (404 + "Go to Dashboard"), không còn là placeholder | — |

## 8. Trạng thái K-1..K-9

| # | Trạng thái 29/09 (trước B) |
| --- | --- |
| K-1 | Xác nhận: tab nền → `visibilityState=hidden`, rAF = 0 khung/giây, radar co ở tâm. Không xác minh tự động được hình radar — cần xem tay |
| K-2 | Xác nhận: cột "Calculated" không hiện ở 1280px |
| K-3 | Xác nhận: chưa có quy tắc 9–14 |
| K-4 | Xác nhận: không có heatmap |
| K-5 | Xác nhận: learner còn thang 6 mức (§5) |
| K-6 | Xác nhận: S3-T024 chưa tích hợp |
| K-7 | Ghi nhận, không đổi |
| K-8 | Xác nhận: mọi lỗi negotiation đi kèm `negotiate → 200` |
| K-9 | Xác nhận: 5 năng lực tự đặt |

## 9. Sau điều chỉnh Thông tư 02/2025 (Giai đoạn B + C, 29–30/09/2026)

Branch `feature/tt02-competency-alignment` (tạo từ `feature/DT-210-skill-gap-engine`, **chưa push**). Jira chưa có ticket riêng và mã `S3-T026` đã thuộc DT-226, nên commit gắn mã task gốc bị điều chỉnh.

### 9.1. Commit

| Commit | Nội dung |
| --- | --- |
| `f34b87a` | F-01: mount `<Toaster />` (Leader duyệt sửa) |
| `eaf1797` | F-02: `GET /employees`, `/employees/{id}` đi qua `EmployeeScope` (Leader duyệt sửa) |
| `af6479e` | B2: cấu hình + migration `competency_frameworks`, `competency_framework_mappings`, `course_prerequisites` (CreateTable viết tay — EF chỉ sinh FK vì snapshot cũ có bảng dạng excluded) |
| `fba5810` | B3 + B1 (BE): seed Thông tư — khung, 6 miền, 24 năng lực, 24 mapping, 5 vị trí × 24 dòng, 18 khóa + tiên quyết, employee@ = Kế toán mức Cơ bản, manager@ = Sales / CRM |
| `2b6ca86` | B4: kích hoạt cần đủ 24 năng lực (`COMPETENCY_NOT_IN_FRAMEWORK`, `FRAMEWORK_COMPETENCY_MISSING` + MSG07 mới) |
| `32b83fc` | B6: severity theo D-B1, bỏ `mediumWeightThreshold`, `SG-2.0` |
| `109ea16` | B7: chỉ gợi ý khóa đủ điều kiện vào (tiên quyết hoặc đã đạt mức khóa − 1) |
| `0882220` | API trả `categorySortOrder` + `frameworkCode` cho năng lực, dòng tiêu chuẩn, dòng skill gap |
| `544361b` | B5 + B1 (FE): editor nhóm theo miền, áp mức cả miền, chia trọng số theo miền, báo mã thiếu, xác nhận trước khi kích hoạt; cột "Circular 02/2025" ở Competency Framework |
| `b455d67` | B8: radar 6 trục (trung bình miền), bảng nhóm theo miền thu/mở được, "Domain met"; ngày dd/mm/yyyy |
| `015fbdf` | B10: nhãn 3 mức ở learner/public (giữ danh mục nghề IT cho Sprint 4) |
| `0325769` | B9: spec Sprint 3 (D-S3-16, ví dụ tính tay Kế toán, R11, test matrix) + CLAUDE.md |

Tài liệu **untracked, đã sửa nhưng chưa commit** (chờ Leader): SRS `docs/03A_SRS_Yeu_Cau_Chuc_Nang.md` (§7.3.3, MSG07, đóng O-1, đóng phần hiển thị O-5), `docs/specs/2026-09-29-tt02-position-competency-matrix.md` (§9 đánh dấu đã làm), báo cáo này.

### 9.2. Test

| | Trước (29/09) | Sau (30/09) |
| --- | --- | --- |
| Backend `dotnet test` | 156/156 | **178/178** |
| Frontend Vitest | 91/91 | **108/108** |
| `tsc -b`, lint, `npm run build` | sạch / 0 lỗi / pass | sạch / 0 lỗi / pass |
| API Giai đoạn C (`phase-c-api.mjs`) | — | **8/8** |

### 9.3. Kịch bản demo §8 trên trình duyệt (DB seed mới)

| Bước | Kết quả | Ảnh |
| --- | --- | --- |
| Khung năng lực | 24 năng lực `TT02-1.1…6.3`, cột "Circular 02/2025", nhóm theo miền | `demo-tt02-framework.png` |
| 1. Position Requirements — Kế toán | 6 miền, 24 dòng, miền 1 và 4 bắt buộc, trọng số 16.67 × 5 + 16.65, không có nút xóa dòng. API: kích hoạt bản thiếu 6.1–6.3 → 400 MSG07 "…Missing: 6.1, 6.2, 6.3." | `demo-tt02-step1.png` |
| 2–3. Skill gap Kế toán (mọi năng lực Cơ bản) | 24 / 4 đạt / 20 gap, **7 high · 0 medium · 13 low**, coverage 52.78% (UI 52.8%), radar 6 trục | `demo-tt02-step3.png` |
| 4. Gợi ý khóa | **A4-I 33.1 → A1-I 30.2 → A5-I 17.8 → A2-I 17.8 → M6-I 17.8**; không có A1-A, A4-A, AI-OFFICE | `demo-tt02-step4.png` |
| 5. Xác nhận 4.2 = Trung bình (HR qua API, employee@ mở trang) | Toast **"Skill gap updated" hiện trên trình duyệt** (F-01 đã sửa); trang tự làm mới: 6 high · 1 medium, 54.2%; 4.2 → **Medium 6.26**; miền 4 trung bình **1.25**, chưa "Domain met"; miền 3 "Domain met" | `demo-tt02-step5.png` |

Radar: vẫn **K-1** (tab Playwright bị ẩn, rAF = 0, đa giác co ở tâm). Nhãn trục và chú thích "Average level in domain / Required domain level" hiển thị đúng; cần xem tay hình đa giác trên máy demo.

### 9.4. Trạng thái K và lỗi còn lại

| # | Sau Giai đoạn B |
| --- | --- |
| K-3 | **Đã thay** bằng quy tắc đủ 24 năng lực (D-B4) |
| K-5 | **Đã xử lý phần hiển thị** (D-B5); dữ liệu learner vẫn lưu thang 1–6, quy đổi khi hiển thị |
| K-9 | **Đã thay** bằng seed Thông tư |
| K-1, K-2, K-4, K-6, K-7, K-8 | Không đổi |
| F-01, F-02 | **Đã sửa** (có test) |
| F-08 | Đã sửa ở view skill gap (`formatDateTime` dd/mm/yyyy HH:mm); các trang khác còn `formatDate` kiểu "Sep 29, 2026" |
| F-09 | Đã sửa (nhãn Basic / Intermediate / Advanced kèm bậc Thông tư) |
| F-03..F-07, F-10..F-14 | Còn mở — chưa nằm trong phạm vi được duyệt |
| Mới (LOW) | Ô chọn mức trong editor hẹp, nhãn "Advanced · TT02 tiers 5–6" bị cắt chữ |

### 9.5. Việc cần Leader quyết định

1. Tạo ticket Jira cho việc điều chỉnh Thông tư (đổi tên branch khi có mã) và cập nhật trạng thái các task Sprint 3 trên Jira (đang To Do).
2. Push branch `feature/DT-210-skill-gap-engine` và `feature/tt02-competency-alignment` (PR xếp chồng) — **chưa push**.
3. Commit SRS / tài liệu ma trận / báo cáo này (đang untracked).
4. Report 4 (S2-T026): file cũ `docs/07_Database_Design_ERD_DigiTalent_AI/…` đang **bị xóa trong working tree** (không phải do phiên này). Đã thêm khối mô tả 3 bảng mới vào bản mới `docs/07_Thiet_Ke_CSDL_ERD.md` (untracked, chưa commit) — bản này dùng tên cột khác SQL v2.3 ở nhiều chỗ, cần Leader xác nhận đâu là Report 4 chính thức.
5. Môi trường Production: khung Thông tư và 24 năng lực chỉ được seed ở Development; tổ chức thật sẽ không kích hoạt được bộ tiêu chuẩn cho tới khi có cách nạp 24 năng lực (seed reference hoặc màn hình import).
6. Có sửa các lỗi MEDIUM F-03..F-07 trong Sprint 3 hay chuyển Sprint 4.

### 9.6. Bổ sung 30/09/2026 — năng lực theo từng vị trí (D-B7) và đánh giá đầu vào (D-B8)

Leader nhận xét: vị trí không nhất thiết cần đủ 24 năng lực, và mức mỗi năng lực phải khác nhau theo công việc. Quy tắc D-B4 ("đủ 24", §9.1 commit `2b6ca86`, §9.3 bước 1–5, K-3 ở §9.4) **đã được thay**; các số ở §9.3 là của dữ liệu cũ.

| Commit | Nội dung |
| --- | --- |
| `b28dcaf` | BE: ma trận từng năng lực trong seed (CEO 21, HR 23, Marketing 22, Sales / CRM 20, Kế toán 21); kích hoạt cần 9–24 năng lực thuộc khung + lõi 4.1, 4.2 (`REQUIREMENT_COUNT_OUT_OF_RANGE`, `CORE_COMPETENCY_MISSING`); điều kiện vào khóa chỉ xét năng lực vị trí yêu cầu |
| `2240700` | FE: editor luôn liệt kê 24 năng lực, mỗi dòng / cả miền chọn mức hoặc "Not required", hiện "N of 24", cảnh báo thiếu số lượng / thiếu lõi, chỉ lưu dòng được chọn |
| `3fce109` | Spec Sprint 3 (§4.5.1, §5.3.1, R11, test matrix, seed) + CLAUDE.md |

| Kiểm tra | Kết quả |
| --- | --- |
| Backend `dotnet test` | **181/181** |
| Frontend Vitest; `tsc -b`, lint, build | **111/111**; sạch |
| API trên DB seed lại (`phase-c-api.mjs`) | Kế toán: 21 yêu cầu / 6 đạt / **4 high · 1 medium · 10 low**, coverage **62.03** (63.89 sau khi xác nhận 4.2 = Trung bình; 4.2 → Medium 8.34; miền 4 trung bình 1.33). Gợi ý: **A1-I 32.00 → A4-I 28.51 → A2-I 23.62 → M6-I 16.99 → A5-I 15.25 → A3-I 15.25**. Kích hoạt: dưới 9 → 400 `REQUIREMENT_COUNT_OUT_OF_RANGE`; thiếu 4.2 → 400 `CORE_COMPETENCY_MISSING`; bộ 18 năng lực có lõi → 200. HR và Sales / CRM khác nhau ở 7 năng lực |

Chưa làm: **chưa kiểm tra lại editor mới và kịch bản demo trên trình duyệt** (mới có unit test + API); ảnh `demo-tt02-*.png` vẫn là dữ liệu D-B4.

Đánh giá đầu vào (D-B8): **chỉ là thiết kế** (tài liệu ma trận §10, SRS O-8). Chưa viết code vì module Assessment chưa có bảng và cần đổi SQL (v2.4) → chờ Mentor duyệt, đưa vào Sprint 4.

Thêm việc cần Leader quyết định: (7) rà từng ô ma trận §4.1 — các mức do phiên này đề xuất từ mô tả công việc, chưa có chuyên gia xác nhận; (8) duyệt thiết kế đánh giá đầu vào và thay đổi SQL v2.4.

### 9.7. Sửa lỗi MEDIUM F-03..F-07 (30/09/2026, theo yêu cầu "tiếp tục các phần việc tiếp theo")

| Lỗi | Xử lý | Commit |
| --- | --- | --- |
| F-03 My Tasks → 404 | Bỏ mục sidebar trỏ tới route không tồn tại; test kiểm mọi mục sidebar có route | `fd86ffe` |
| F-04 HR thấy "Learner Results" → Access Denied | Mục sidebar khai báo permission của route và bị ẩn khi thiếu; test đối chiếu với route | `fd86ffe` |
| F-05 trainer 403 hiển thị như rỗng | Trang báo "not available for your role", không gọi API; query không retry 4xx | `ef4dca7` |
| F-06 tràn ngang 375px | Sidebar thành drawer dưới md (nút menu, backdrop, Escape, đóng khi đổi route); đo 375px: không tràn trên 6 trang | `fd86ffe` |
| F-07 toast lỗi chung chung | Toast lấy thông điệp server ("Department code 'OPS' already exists." hiện trên trình duyệt) | `842b160` |
| F-13 (một phần) | Sidebar dùng link, nút icon có tên truy cập | `fd86ffe` |
| K-1 radar | Tắt animation vào; radar hiện đúng đa giác ngay cả khi tab ẩn (xác nhận bằng ảnh) | `ef4dca7` |
| Mới | Editor không mở lại / kích hoạt được bản nháp khi vị trí đã có bản ACTIVE → thêm danh sách phiên bản (API `versions`) + chọn version; ô chọn mức đã rộng hơn | `ddb1da6` |

Kiểm tra: backend **183/183**, frontend **187/187**, `tsc -b` sạch, build pass, lint 0 lỗi. Trình duyệt (DB seed mới): editor Kế toán 21/24 + HR 23/24; HR bỏ miền 6 → phân bổ trọng số → lưu nháp → chọn v2 → kích hoạt (v1 thành ARCHIVED); Kế toán skill gap 21 / 6 đạt / 4 high · 1 medium · 10 low / 62.0%; gợi ý A1-I 32.0 → A4-I 28.5 → A2-I 23.6 → M6-I 17.0 → A5-I 15.3 → A3-I 15.3; xác nhận 4.2 → toast "Skill gap updated", 3 high · 2 medium, 63.9%, miền 4 trung bình 1.33. Ảnh: `.playwright-mcp/demo-d-b7-*.png`, `f06-mobile-drawer-375.png`.

Còn mở: F-08 (các trang khác), F-10, F-11, F-12, F-14, ô chọn mức trong editor trên màn hình hẹp.

## 10. Lưu ý môi trường

- `localhost:55432` trên máy này đi vào **`wslrelay` (IPv6 `::1`)**, không phải Docker → 53/156 test PostgreSQL báo "database is unavailable". Dùng `Host=127.0.0.1` cho `DIGITALENT_TEST_POSTGRES_CONNECTION` và `ConnectionStrings__DefaultConnection` thì 156/156 xanh.
- Bộ nhớ lúc chạy: commit 24.9 / 31.8 GB (78%), RAM trống 0.6 GB.
- Playwright: tab thường bị ẩn. `browser_tabs select` làm tab hiện tạm thời, đủ chụp ảnh tĩnh, nhưng animation Recharts vẫn dừng.
