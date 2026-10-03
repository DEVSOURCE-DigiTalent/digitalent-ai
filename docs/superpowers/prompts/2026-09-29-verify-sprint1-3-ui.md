# Prompt — Kiểm tra Sprint 1–3, điều chỉnh theo Thông tư 02/2025 và xác nhận UI/UX bằng Playwright MCP

> Dán toàn bộ phần dưới đường kẻ vào một session Claude Code mới, mở tại `D:\digitalent-ai`.
> Cập nhật 29/09/2026: thêm quyết định "vị trí dựa trên Thông tư 02/2025" và Giai đoạn B (điều chỉnh các task đã làm).

---

## Vai trò & mục tiêu

Bạn là QA lead kiêm developer cho dự án **DigiTalent AI** (ASP.NET Core 8 + React 19, xem `CLAUDE.md`). Session này có **3 giai đoạn, làm theo thứ tự**:

| Giai đoạn | Việc | Được sửa code? |
| --- | --- | --- |
| **A. Kiểm tra hiện trạng** | So cam kết Sprint 1–3 (task list, spec, SRS) với hệ thống đang chạy; xác nhận UI/UX bằng Playwright MCP trên API + DB seed thật | **Không** — chỉ ghi báo cáo |
| **B. Điều chỉnh theo Thông tư 02/2025** | Sửa các phần đã làm để năng lực của vị trí lấy từ Khung năng lực số của Thông tư, thang 3 mức Cơ bản / Trung bình / Nâng cao | **Có** — theo danh sách B1–B10, mỗi bước một commit |
| **C. Kiểm tra lại** | Chạy lại test, Playwright các trang bị ảnh hưởng, cập nhật báo cáo | Chỉ sửa lỗi do Giai đoạn B gây ra |

Lý do làm A trước B: báo cáo A là mốc "trước điều chỉnh". Nếu B phá gì thì so được với mốc này.

## Nguồn sự thật cần đọc trước (theo thứ tự)

1. `CLAUDE.md` — kiến trúc, quy ước, lệnh, cách chạy test.
2. **`docs/specs/2026-09-29-tt02-position-competency-matrix.md` — quyết định mới nhất (29/09).** Gồm thang 3 mức, 24 năng lực của Thông tư, ma trận 5 vị trí × 6 miền (miền 6 là suy luận), quy tắc D-B1..D-B5 (§7), 18 khóa học, kịch bản demo (§8) và checklist (§9). **Leader dùng tài liệu này để demo.**
3. `tai lieu/` — tài liệu gốc (.docx): `khung-chuong-trinh-15-khoa-digcomp (1).docx` (mục A1, A2, A7, A8, C1–C3), `giaotrinh-linhvuc1..5.docx`, `giaotrinh-mien6-AI.docx`. Đọc .docx bằng cách giải nén `word/document.xml` (PowerShell + `System.IO.Compression`) ra thư mục scratchpad.
4. `DANH_SACH_TASK_TRAN_VAN_LINH.md` — task Sprint 1–3 và DoD (chỉ phần Sprint 1–3).
5. `docs/specs/2026-09-28-sprint3-skill-gap-recommendation-spec.md` — spec Sprint 3: quyết định D-S3-01..15, công thức, ví dụ tính tay §4.5 & §5.3, AC §9, R1–R10 (§5.6), E1–E15 (§6.4).
6. `docs/superpowers/plans/2026-09-28-sprint3-skill-gap-engine.md` — những gì Sprint 3 đã làm / còn mở.
7. `docs/03A_SRS_Yeu_Cau_Chuc_Nang.md` v3.1 — §13 liệt kê điểm mở O-1..O-7. **CR-08: trang enterprise bằng tiếng Anh**; tuyến `/learn/*` bằng tiếng Việt. File này **chưa được git theo dõi** (untracked) — sửa được nhưng đừng commit nếu Leader chưa đồng ý.
8. `docs/reports/2026-09-27-through-sprint-2-evidence-matrix.md` — ma trận bằng chứng Sprint 1–2.
9. `git log --oneline -40` trên branch `feature/DT-210-skill-gap-engine` (dựa trên `codex/two-frontend-flows-sprint2-closure`, **chưa push**).

## Ràng buộc bắt buộc

- **Không push, không mở PR** khi Leader chưa yêu cầu. Commit cục bộ được phép ở Giai đoạn B: conventional commits, gắn mã task (ví dụ `feat(competency): S2-T014 require TT02 domains on activation`), kết thúc bằng dòng `Co-Authored-By` theo quy ước của repo.
- **Không đụng container / cổng của dự án khác**: cổng `5432` là Postgres của dự án STCO (`stco-postgres-1`). DigiTalent dùng container riêng `digitalent-test-pg` ở cổng **55432** (DB `digitalent_test` cho test tự động, `digitalent_dev` cho chạy app).
- **Kiểm tra bộ nhớ trước khi chạy** (máy từng hết commit memory khi STCO chạy nhiều dev server): `Get-CimInstance Win32_OperatingSystem`. Nếu commit dùng > 90% thì báo Leader tắt bớt; **không tự tắt tiến trình không phải của bạn**.
- **Schema first:** `docs/database/DigiTalent_AI_Canonical_v2_3.sql` là nguồn sự thật. Các bảng cần cho Giai đoạn B (`competency_frameworks`, `competency_framework_mappings`, `course_prerequisites`) **đã có trong SQL**, nên không cần sửa SQL. Nếu thấy cần sửa SQL thì dừng lại hỏi.
- **Không sửa migration đã có**; tạo migration mới.
- **TDD** cho mọi quy tắc nghiệp vụ mới: viết test trước (RED) → code (GREEN). Quy tắc liên quan CHECK/unique/thứ tự lệnh phải test trên PostgreSQL, không chỉ InMemory.
- File Playwright (screenshot, snapshot) chỉ ghi được trong `D:\digitalent-ai\.playwright-mcp\` — thư mục này **không commit**.
- Dừng API / Vite bạn đã khởi động khi xong.

## Chuẩn bị môi trường (PowerShell)

```powershell
# Postgres riêng của DigiTalent
docker start digitalent-test-pg
docker exec digitalent-test-pg pg_isready -U digitalent_app

# Reset DB chạy app về dữ liệu seed gốc (demo trước đó có thể đã sửa dữ liệu).
# Làm lại bước này sau mỗi lần đổi seed ở Giai đoạn B.
docker exec digitalent-test-pg psql -U digitalent_app -d postgres -c "DROP DATABASE IF EXISTS digitalent_dev;" -c "CREATE DATABASE digitalent_dev;"

# Baseline tự động (phải xanh trước khi kiểm tra UI)
cd D:\digitalent-ai\backend
$env:DIGITALENT_TEST_POSTGRES_CONNECTION='Host=localhost;Port=55432;Database=digitalent_test;Username=digitalent_app;Password=testpass'
dotnet build DigiTalent.sln -nologo -v q
dotnet test DigiTalent.sln --no-build -nologo -v q        # mốc 29/09: 156/156
cd ..\frontend
npx tsc -b; npm run lint; npx vitest run; npm run build   # mốc 29/09: 91/91, build pass
```

Chạy app (hai tiến trình nền; API tự migrate + seed ở Development):

```powershell
# API — cổng 5000 (frontend/.env: VITE_API_BASE_URL=http://localhost:5000/api/v1)
cd D:\digitalent-ai\backend
$env:ConnectionStrings__DefaultConnection='Host=localhost;Port=55432;Database=digitalent_dev;Username=digitalent_app;Password=testpass'
$env:ASPNETCORE_ENVIRONMENT='Development'; $env:ASPNETCORE_URLS='http://localhost:5000'
dotnet run --project src/DigiTalent.Api --no-launch-profile

# Frontend — cổng 5173
cd D:\digitalent-ai\frontend
npx vite --port 5173 --strictPort
```

Tài khoản seed (mật khẩu chung `Admin@1234`): `admin@`, `hr@`, `manager@` (trưởng phòng OPS), `trainer@`, `employee@` — domain `@digitalent.ai`.

## Lưu ý khi dùng Playwright MCP (rút ra từ lần kiểm tra trước)

- Playwright MCP điều khiển **Chrome thật của Leader qua extension**: có autofill mật khẩu, extension (Grammarly) chèn icon/log vào trang — **không báo các log/icon của extension là lỗi app**.
- Tab thường ở trạng thái **ẩn** (`document.visibilityState === "hidden"`), nên trình duyệt dừng `requestAnimationFrame`:
  - `browser_click` hay timeout "waiting for element to be stable" → dùng `browser_evaluate` để `element.click()`; submit form bằng `form.requestSubmit()`.
  - **Biểu đồ Recharts kẹt ở khung đầu animation** (đa giác co ở tâm). Trước khi kết luận lỗi biểu đồ, kiểm `document.visibilityState`. Nếu `hidden` thì ghi "không xác minh được tự động" và nhờ Leader đưa cửa sổ lên trước rồi chụp lại.
- Screenshot: `filename: ".playwright-mcp/<tên>.png"`, rồi đọc lại ảnh bằng Read để thực sự nhìn giao diện.
- React StrictMode (dev) khiến SignalR log 1 lỗi "connection was stopped during negotiation" rồi kết nối lại. Nếu có `POST /hubs/notifications/negotiate → 200` thì không tính là lỗi.
- Đăng nhập: điền `Tên đăng nhập / Email` + `Mật khẩu` bằng `browser_fill_form`, rồi `requestSubmit()`; kiểm `GET /api/v1/auth/me → 200` bằng `browser_network_requests`.

---

## GIAI ĐOẠN A — Kiểm tra hiện trạng (không sửa code)

Dữ liệu demo **hiện tại** (trước Giai đoạn B, spec §4.5, §5.3): vị trí *Data Analyst* có 5 năng lực tự đặt. `employee@` → gap 3, priority 90 / 75 / 15, coverage 47.5%; gợi ý DA-ADVANCED 55.00 > SEC-BASIC 49.17 > DA-EXCEL-PBI 39.25; khóa AI-OFFICE (DRAFT) không xuất hiện. Dữ liệu này sẽ bị thay ở B3; Giai đoạn A chỉ ghi nhận.

### A.1 Phân loại trang trước khi chấm

Một số trang **vẫn là placeholder có chủ đích** (≈12–16 dòng, chỉ có tiêu đề + câu "will be implemented here"):

- **Placeholder theo kế hoạch (Sprint 4+)** → ghi `PLACEHOLDER`, không tính là lỗi: `CourseListPage`, `CourseAssignmentPage`, `QuestionBankPage`, `AssessmentListPage`, `LearnerResultsPage`, `CertificateListPage`, `TaskBoardPage`, `TrainingRiskPage`, `ReadinessPage`, `MyLearningPage`, `MyAssessmentsPage`, `MyCertificatesPage`.
- **Placeholder nhưng thuộc phạm vi Sprint 1–2 theo SRS** → ghi `PLACEHOLDER — cần xác nhận phạm vi`: `UserManagementPage` (UC-08), `RolePermissionPage` (UC-09), `AuditLogPage` (UC-12), `SystemConfigPage` (UC-10/11/13), `NotificationCenterPage` (UC-07), `MyProfilePage` (UC-04), `NotFoundPage`.

### A.2 Sprint 1 — nền tảng, xác thực, phân quyền

| Hạng mục | Cần xác nhận |
| --- | --- |
| Đăng nhập | Sai mật khẩu → thông báo lỗi, không lộ tài khoản có tồn tại; 5 lần sai → khóa 15 phút (MSG02); đăng nhập đúng → đúng dashboard theo vai trò; `returnTo` an toàn |
| Phiên & token | Refresh token rotation (`POST /api/v1/auth/refresh`); token hỏng/hết hạn → về login một lần, không vòng lặp |
| Guard & RBAC | Với **mỗi vai trò** (5 tài khoản): sidebar chỉ hiện mục được phép; URL không được phép → `ForbiddenPage`; API tương ứng trả 403 (kiểm bằng `browser_evaluate` + `fetch` kèm token hoặc `Invoke-WebRequest`) |
| Layout | Sidebar/Topbar, thu gọn sidebar, tên người dùng, chuông thông báo; route cũ (`/dashboard`, `/organization/*`…) redirect sang `/enterprise/*` |
| Trang lỗi | URL không tồn tại → 404 |
| Thang mức (S1-T002) | Hệ thống dùng đúng 3 mức ở mọi nơi: form, badge, bảng, API (CHECK 1–3). Ghi lại **mọi chỗ còn thang 5, 6 hoặc 8 mức** và mọi nhãn tiếng Việt khác "Cơ bản / Trung bình / Nâng cao" |

### A.3 Sprint 2 — tổ chức, khung năng lực, tiêu chuẩn vị trí, tuyến người học

| Trang (route) | Vai trò | Cần xác nhận |
| --- | --- | --- |
| Departments (`/enterprise/organization/departments`) | hr@ | List + search + phân trang server; tạo/sửa/archive (hỏi xác nhận, nêu tên); trùng mã → lỗi rõ; archive không xóa cứng |
| Job Positions & Job Families (`/enterprise/organization/positions`) | hr@ | CRUD, trùng mã, archive |
| Employees (`/enterprise/organization/employees`) | hr@, manager@ | CRUD, lọc phòng ban/trạng thái; trùng mã/email → 409; manager@ có thấy nhân viên phòng khác không (SRS BR-12 — ghi hiện trạng) |
| Competency Framework (`/enterprise/competency-framework`) | hr@ | CRUD năng lực + 3 mức tiêu chí; archive. **Ghi lại:** năng lực có gắn với Thông tư 02/2025 (mã 1.1–6.3, miền) không — kỳ vọng hiện tại là **chưa** |
| Position Requirements (`/enterprise/competency-framework/position-requirements`) | hr@ | Chọn vị trí, lịch sử version, level picker 1–3, trọng số (đỏ ≠ 100%, xanh = 100%), mandatory; lưu nháp; kích hoạt có modal xác nhận; tổng ≠ 100% bị chặn cả ở server (400); kích hoạt nhiều version liên tiếp không lỗi. Quy tắc "9–14 năng lực" (SRS §7.3.3 / MSG07) **chưa làm và sẽ bị thay ở B4** — không tính là lỗi |
| Tuyến người học `/learn/*` (dashboard, target, diagnostic, path, courses, courses/:id, classroom/:id, progress, tasks, certificates) | chưa đăng nhập / learner | Luồng L1–L5 chạy được, UI tiếng Việt. **Ghi lại mọi chỗ dùng thang 6 hoặc 8 mức** (L1–L8, "Level 5-6", "Trung cấp (L3-L4)") |
| Public (`/`, `/careers`, `/careers/:slug`, `/verify`) | khách | Landing, catalog nghề, xác minh chứng chỉ không cần đăng nhập. **Ghi lại:** catalog nghề hiện là vị trí IT (AI Engineer, Data Analyst, Cloud & DevOps…), khác 5 vị trí trong ma trận Thông tư |

### A.4 Sprint 3 — Skill Gap, gợi ý khóa học, tính lại tự động

| Trang / chức năng | Vai trò | Cần xác nhận (đối chiếu AC spec §9) |
| --- | --- | --- |
| Team Skill Gap (`/enterprise/intelligence/skill-gap`) | hr@ | Empty state khi chưa có dữ liệu; "Recalculate all" → 2 tính, 2 bỏ qua kèm lý do (HR Manager, Trainer chưa có vị trí); bảng: gaps + "N high", coverage; lọc phòng ban / vị trí / tìm kiếm; phân trang |
| Team Skill Gap | manager@ | Không có bộ lọc phòng ban; chỉ thấy nhân viên phòng OPS; có nút tính lại; **không** có "Confirm level" |
| Team Skill Gap | employee@ | Không có mục này trong sidebar; gõ URL → chỉ thấy dữ liệu của chính mình (ghi lại hành vi) |
| Panel chi tiết | hr@ | KPI (Required/Met/Gaps/Coverage), radar (xem lưu ý Playwright về animation), bảng gap sắp theo priority, "Not confirmed" cho năng lực chưa xác nhận, Esc đóng panel; mục "Recommended courses" |
| Confirm level (dialog) | hr@ | Ghi chú bắt buộc; chọn Information security = Intermediate → toast, panel chuyển sang snapshot mới: **Met 3, Gaps 2, coverage 72.5%**; SEC-BASIC biến khỏi gợi ý; Esc đóng dialog trước panel |
| Tự xác nhận | (cần hồ sơ HR gắn tài khoản HR) | Server trả 403 "You cannot confirm your own competency level." — kiểm qua API nếu UI không dựng được tình huống |
| My Competency Profile (`/enterprise/my-competency-profile`) | employee@ | Tab "Skill gap" (KPI, radar, bảng) và "Recommended courses" (thẻ xếp hạng, điểm + breakdown "Gap coverage · Mandatory · Entry level", lý do từng năng lực, trạng thái đang học, cảnh báo entry level); empty state khi chưa có phân tích |
| Thông báo realtime | employee@ (tab 1) + hr@ (API/tab 2) | HR xác nhận năng lực cho employee → employee nhận toast "Skill gap updated" và số liệu tự làm mới; có dòng trong bảng `notifications`. Nếu chỉ có một trình duyệt: dùng client Node + `@microsoft/signalr` (cách làm trong plan Task 6/9) |
| Gợi ý khóa học — không có dữ liệu | trainer@ | `NO_SKILL_GAP_RUN` hiển thị empty state đúng |
| API trực tiếp | các vai trò | `GET /api/v1/intelligence/recommendations?limit=0` → 400; employee xem người khác → 404; manager gọi `POST /api/v1/competency-evidences/manual` → 403; level 4 → 400 |

### A.5 Checklist UI/UX cho **mọi trang không phải placeholder**

1. **Trạng thái:** loading (skeleton), empty (có giải thích + hành động gợi ý — CR-07), error (thông báo + thử lại), có dữ liệu.
2. **Form:** field bắt buộc được đánh dấu; lỗi hiển thị cạnh field; validate cả client và server (CR-02); nút submit bị khóa khi đang gửi; toast thành công/thất bại.
3. **Thao tác phá hủy** (archive, thu hồi, kích hoạt version): hỏi xác nhận, nêu tên bản ghi (CR-04).
4. **List:** search, sort, phân trang server (CR-01); đổi bộ lọc thì về trang 1.
5. **Phân quyền UI:** nút/menu ẩn khi không có quyền; API vẫn chặn (CR-06).
6. **Responsive:** chụp ở 1280×900, 768×1024, 375×812 (`browser_resize`) — không tràn ngang, bảng cuộn được, dialog/panel dùng được trên màn nhỏ.
7. **Bàn phím & a11y:** Tab đi qua được các control; Esc đóng dialog/panel; dialog có `role="dialog"` + tiêu đề; control có nhãn (xem accessible name bằng `browser_snapshot`); màu không phải kênh duy nhất truyền nghĩa.
8. **Ngôn ngữ & định dạng:** enterprise tiếng Anh, learner tiếng Việt; ngày dd/mm/yyyy (CR-05).
9. **Console & network:** không có lỗi JS của app, không request 4xx/5xx ngoài dự kiến (`browser_console_messages`, `browser_network_requests`).
10. **Nhất quán thị giác:** header trang, nút chính, màu trạng thái, khoảng cách giống các trang Sprint 2.

### A.6 Các điểm đã biết — xác nhận lại, không cần "phát hiện" lại

| # | Nội dung | Kỳ vọng hiện tại | Sau Giai đoạn B |
| --- | --- | --- | --- |
| K-1 | Radar kẹt ở tâm khi tab ẩn | Không phải lỗi app nếu `visibilityState=hidden` | Không đổi |
| K-2 | `DataTable.hideOnMobile` ẩn cột ở mọi kích thước (cột "Calculated" của Team Skill Gap không hiện) | Lỗi component dùng chung, chưa sửa | Ngoài phạm vi B — đề xuất sửa riêng |
| K-3 | Quy tắc 9–14 năng lực (SRS O-1) chưa làm | Đúng | **Bị thay** bằng quy tắc Thông tư ở B4 |
| K-4 | Heatmap người × năng lực chưa có (O-3) | Đã cắt khỏi Sprint 3 | Không đổi |
| K-5 | Dữ liệu learner thang 6 mức (O-5) | Chưa sửa | Quy đổi hiển thị về 3 mức ở B10 (nếu Leader đồng ý) |
| K-6 | Quy chế thi lại S3-T024 chưa tích hợp (O-6) | Chờ Mentor duyệt SQL v2.4 | Không đổi |
| K-7 | `VITE_SIGNALR_HUB_URL` có trong `.env` nhưng hook tự suy URL từ `VITE_API_BASE_URL` | Ghi nhận | Không đổi |
| K-8 | StrictMode làm SignalR log 1 lỗi negotiation ở dev | Không phải lỗi | Không đổi |
| K-9 | Dữ liệu demo *Data Analyst* với 5 năng lực tự đặt, không theo Thông tư | Đúng | **Bị thay** ở B3 |

### A.7 Đầu ra Giai đoạn A

File `docs/reports/2026-09-XX-sprint1-3-ui-verification.md` (XX = ngày chạy), gồm:

- Tóm tắt: số hạng mục PASS / FAIL / PARTIAL / PLACEHOLDER; kết quả test tự động.
- Bảng **trang × vai trò × kết quả** (route, vai trò, trạng thái, bằng chứng = tên screenshot / request).
- Bảng đối chiếu **task Sprint 1–3 ↔ DoD ↔ hiện trạng**, chỉ ra DoD nào ghi "✅" nhưng thực tế chưa đạt.
- **Danh sách lỗi**: ID, mức độ (CRITICAL / HIGH / MEDIUM / LOW), trang, bước tái hiện, kỳ vọng vs thực tế, screenshot.
- Danh sách placeholder + đề xuất sprint.
- Trạng thái K-1..K-9.

Lỗi CRITICAL/HIGH không thuộc Giai đoạn B: **ghi vào báo cáo và hỏi Leader**, không tự sửa.

---

## GIAI ĐOẠN B — Điều chỉnh các task đã làm theo Thông tư 02/2025

### B.0 Quyết định đã chốt (Leader, 29/09/2026)

1. Năng lực của mỗi vị trí lấy từ **Khung năng lực số — Thông tư 02/2025/TT-BGDĐT**: 6 miền, 24 năng lực thành phần (1.1–6.3). Đào tạo dựa trên khoảng cách với các năng lực đó.
2. **Thang 3 mức:** Cơ bản / Trung bình / Nâng cao (tiếng Việt); Basic / Intermediate / Advanced (tiếng Anh, trang enterprise). Tương ứng bậc 1–2 / 3–4 / 5–6 của Thông tư; bậc 7–8 ngoài phạm vi. **Trong DB giữ nguyên giá trị 1–3**, chỉ đổi nhãn.
3. Ma trận vị trí × miền, danh mục 18 khóa và kịch bản demo: theo `docs/specs/2026-09-29-tt02-position-competency-matrix.md` §4–§8. Miền 6: CEO và Marketing = Nâng cao, các vị trí còn lại = Trung bình.

### B.1 Ảnh hưởng tới các task đã làm

| Task | Cần điều chỉnh | Việc (bước B) |
| --- | --- | --- |
| S1-T002 Chốt MVP 3 mức | Nhẹ (tài liệu) | Nhãn "Trung bình"; căn cứ chuẩn thêm Thông tư 02/2025 bên cạnh DigComp 3.0 (B9) |
| S2-T014 BE Position Requirement Set | **Có** | Quy tắc kích hoạt mới thay 9–14 (B4) |
| S2-T016 FE Position Requirement Editor | **Có** | Nhóm theo miền, đặt mức cả miền, chia trọng số theo miền, nhãn mức (B1, B5) |
| Competency Framework (S2, trang danh mục năng lực) | **Có** | Hiện mã Thông tư + miền; dữ liệu 24 năng lực (B2, B3) |
| S2-T026 Report 4 | Nhẹ (tài liệu) | Thêm `competency_frameworks`, `competency_framework_mappings` vào từ điển dữ liệu đang dùng (B9) |
| S3-T002 / S3-T003 AC & thiết kế thuật toán | **Có** (tài liệu) | Ví dụ tính tay §4.5, §5.3 theo dữ liệu mới; quy tắc severity mới; quy tắc gợi ý theo tiên quyết (B9) |
| S3-T015 Skill Gap Engine | Nhỏ | Công thức giữ nguyên; đổi cách phân loại severity (B6); seed mới (B3) |
| S3-T016 FE Skill Gap pages | **Có** | 24 trục radar không đọc được → radar gộp theo 6 miền, bảng nhóm theo miền (B8) |
| S3-T017 Recommendation Engine | **Có** | Chỉ gợi ý khóa bậc kế tiếp theo tiên quyết (B7) |
| S3-T018 Domain events / realtime | Không | — |
| S3-T020 Unit tests | **Có** | Cập nhật test so sánh số; thêm test cho B4, B6, B7 |
| S3-T024 Quy chế thi lại | Không | — |
| S3-T025 Report 3 (SRS) | **Có** (tài liệu) | SRS §7.3.3 + MSG07 mới, đóng O-1 và O-5, căn cứ Thông tư (B9) |
| Tuyến learner / public (Sprint 2 flows) | **Có** (nhãn) | Đổi thang L1–L8 / "Level 5-6" sang 3 mức; catalog nghề IT để Sprint 4 (B10) |

### B.2 Quyết định thiết kế đã chốt (Leader, 29/09/2026) — không hỏi lại

| # | Quyết định | Lý do |
| --- | --- | --- |
| D-B1 | **Severity chỉ dựa vào số mức thiếu:** HIGH = thiếu ≥ 2 mức; MEDIUM = thiếu 1 mức, năng lực bắt buộc; LOW = thiếu 1 mức, không bắt buộc. Bỏ điều kiện trọng số ≥ 20% (`mediumWeightThreshold`). | Đơn giản, giải thích được (rule-based, explainable — S1-T002). Với 24 dòng, không dòng nào đạt trọng số 20% |
| D-B2 | **Bắt buộc (`is_mandatory`) = các miền vị trí cần ở mức Nâng cao + miền 4 (An toàn) cho mọi vị trí.** Các miền còn lại không bắt buộc. Kế toán: miền 1 và 4 bắt buộc. | Nếu cả 24 dòng bắt buộc thì hệ số ×1.5 vô nghĩa và LOW không bao giờ xuất hiện. Miền 4 luôn bắt buộc vì bảo vệ dữ liệu cá nhân (Nghị định 13/2023) |
| D-B3 | **Radar theo miền vẽ mức trung bình** của các năng lực trong miền (có thể lẻ, ví dụ 1.25), chú thích "Average level in domain". **Trạng thái "đạt miền" và gợi ý khóa dùng mức thấp nhất.** | Xác nhận một năng lực làm radar nhích lên (demo thấy thay đổi); "đạt miền" vẫn đúng nguyên tắc học trọn cả lĩnh vực |
| D-B4 | **Requirement set luôn có đủ 24 năng lực của Thông tư.** Mặc định mọi năng lực lấy mức của miền; cho chỉnh mức từng dòng (hiện nhãn "Differs from domain level"), **không** cho bỏ dòng. | Quy tắc rõ hơn "mỗi miền ≥ 1 dòng"; khớp việc mỗi khóa phủ cả miền |
| D-B5 | **Learner / public:** đổi ngay nhãn L1–L8 / "Level 5-6" sang 3 mức; danh mục nghề IT giữ nguyên, để Sprint 4. Khi demo không đi qua `/careers`. | Tránh câu hỏi "chỗ 3 mức, chỗ 8 mức"; danh mục nghề là việc nội dung lớn |
| D-B6 | **Branch riêng cho Giai đoạn B:** `feature/DT-XXX-tt02-competency-alignment` tạo từ `feature/DT-210-skill-gap-engine` (PR xếp chồng). Commit gắn mã ticket mới. | DT-210 đã lớn và chưa push; tách để reviewer xét Sprint 3 và phần điều chỉnh riêng |

Trước khi code, chỉ hỏi Leader **2 việc** (một lượt AskUserQuestion):

1. **Mã Jira** của ticket điều chỉnh (Leader tạo, ví dụ "S3-T026 — Align competency framework with Circular 02/2025"). Chưa có mã thì dùng tạm branch `feature/tt02-competency-alignment`, commit ghi `S3-T026`, đổi tên branch sau.
2. **Có push và mở PR cho `feature/DT-210-skill-gap-engine` trước không** (đề xuất: có, PR vào `codex/two-frontend-flows-sprint2-closure`). Chỉ push khi Leader trả lời đồng ý rõ ràng.

### B.3 Các bước (mỗi bước: test trước → code → `dotnet test` / `npx vitest run` xanh → commit)

**B1. Nhãn mức.**

- FE: `frontend/src/lib/competency-levels.ts` — thêm nhãn tiếng Việt `1: 'Cơ bản', 2: 'Trung bình', 3: 'Nâng cao'` cho tuyến learner; enterprise giữ tiếng Anh.
- BE: `SkillGapSeeder.cs` đang dùng `"Trung cấp"` → `"Trung bình"`. `Application/Services/Intelligence/CompetencyLevelLabels.cs` giữ tiếng Anh.
- Tooltip / level picker ghi kèm bậc Thông tư (ví dụ "Intermediate · TT02 bậc 3–4").

**B2. Bảng khung năng lực.**

- Viết cấu hình đầy đủ cho `CompetencyFrameworkConfiguration` và `CompetencyFrameworkMappingConfiguration` theo SQL (unique `code+version`; unique `competency_id+framework_id+source_code`; CHECK `relationship IN ('DIRECT','STRONG_OVERLAP','PARTIAL_OVERLAP')`; FK Restrict; độ dài cột), bỏ `ExcludeFromMigrations()`.
- Kiểm tra DbSet có ở cả `AppDbContext` và `IApplicationDbContext`.
- Tạo migration mới (ví dụ `AddCompetencyFrameworkMappings`), chỉ tạo 2 bảng này. Test ràng buộc trên PostgreSQL (theo mẫu `FoundationMigrationTests`).

**B3. Seed theo Thông tư** — thay dữ liệu *Data Analyst* trong `SkillGapSeeder` (chỉ chạy ở Development, giữ tính idempotent):

- 1 dòng `competency_frameworks`: code `TT02_2025`, version `02/2025/TT-BGDĐT`, authority "Bộ Giáo dục và Đào tạo", jurisdiction `VN`, `source_url`.
- 6 `competency_categories` = 6 miền (tên đúng Thông tư, `sort_order` 1–6).
- 24 `competencies` (`CORE_DIGITAL`, tên đúng Thông tư theo §3 tài liệu ma trận), mỗi năng lực có 3 tiêu chí mức. Mô tả tiêu chí lấy từ tên module tương ứng trong bảng C2 của khung chương trình; miền 6 lấy từ `giaotrinh-mien6-AI.docx`.
- 24 `competency_framework_mappings`: `source_code` = `1.1`…`6.3`, `source_area_code` = số miền, `relationship = DIRECT`, `is_primary = true`, `source_level_text` = "Bậc 1–2 / 3–4 / 5–6", ghi chú "Vận dụng cho doanh nghiệp — Thông tư áp dụng cho người học trong hệ thống giáo dục quốc dân".
- 5 `job_positions` (CEO, HR, Marketing, Sales/CRM, Kế toán), mỗi vị trí có requirement set ACTIVE: 24 dòng, mức theo ma trận §4, trọng số mỗi miền 100/6 chia đều cho các năng lực trong miền (numeric(5,2); phần dư do làm tròn dồn vào dòng cuối để tổng đúng 100.00), `is_mandatory` theo D-B2.
- 18 `courses` PUBLISHED (A1–A5 và M6, mỗi miền F/I/A; tên và thời lượng theo bảng C1 / giáo trình), `entry_level` = mức khóa − 1 (tối thiểu 1), `course_competencies` = mọi năng lực của miền, `target_level` = mức khóa, `coverage_type = PRIMARY`, cùng `course_prerequisites` F→I→A. Giữ 1 khóa DRAFT để test "không gợi ý khóa nháp".
- Tài khoản demo: `employee@` → vị trí **Kế toán**, hồ sơ đã xác nhận mọi năng lực ở mức Cơ bản (kịch bản §8 của tài liệu ma trận). `manager@` → vị trí HR hoặc Sales tùy phòng ban hiện có. Ghi lại lựa chọn.
- Tính trước bằng tay các con số demo mới (gap, coverage, điểm gợi ý) và ghi vào spec (B9) **trước khi** viết test so sánh số.

**B4. Quy tắc kích hoạt** (`ActivatePositionRequirementSetUseCase`) — thay "9–14 năng lực":

- Mọi dòng phải là năng lực có mapping tới khung `TT02_2025` đang active. Nếu không → 400, code `COMPETENCY_NOT_IN_FRAMEWORK`.
- Phải có **đủ 24 năng lực** của khung (D-B4). Nếu thiếu → 400, code `FRAMEWORK_COMPETENCY_MISSING`, message liệt kê mã còn thiếu (ví dụ `6.1, 6.2`).
- Giữ quy tắc tổng trọng số = 100 và quy tắc không kích hoạt bản đã archive.
- MSG07 mới (tiếng Anh): *"A requirement set must include all 24 competencies of the national digital competence framework (Circular 02/2025) before it can be activated."*
- Test: đủ 24 → OK; thiếu 6.1–6.3 → 400 kèm danh sách mã; có năng lực nội bộ không mapping → 400.

**B5. Editor tiêu chuẩn vị trí** (`PositionRequirementsPage`):

- Nhóm bảng theo 6 miền (tiêu đề miền + mã Thông tư).
- Mỗi miền có control "Apply level to domain" để đặt mức cho mọi năng lực trong miền; vẫn chỉnh được từng dòng, dòng lệch mức miền có nhãn "Differs from domain level" (D-B4). Không có nút xóa dòng.
- Bản nháp mới tự điền đủ 24 năng lực với mức theo miền.
- Nút "Distribute weights by domain" (100/6 mỗi miền, chia đều trong miền).
- Hiển thị trước lỗi thiếu năng lực; server vẫn là nơi chặn cuối.
- Test Vitest cho áp mức theo miền và chia trọng số.

**B6. Severity** (`SkillGapCalculator.ClassifySeverity` + setting `intelligence.skill_gap`) theo D-B1: HIGH = thiếu ≥ 2; MEDIUM = thiếu 1 + bắt buộc; LOW = thiếu 1 + không bắt buộc. Bỏ `mediumWeightThreshold` khỏi setting (seeder và `SkillGapSettingsProvider`; đọc setting cũ vẫn không lỗi). Hệ số bắt buộc ×1.5 giữ nguyên. Cập nhật `SkillGapCalculatorTests` và spec §4. Kỳ vọng kịch bản Kế toán (mọi năng lực Cơ bản): miền 1 và 4 → HIGH (7 dòng); miền 2, 5, 6 → LOW (13 dòng); miền 3 đạt.

**B7. Gợi ý khóa học** (`CourseRecommender`): một khóa chỉ được gợi ý khi người học **đủ điều kiện vào khóa**: đã hoàn thành các khóa tiên quyết, **hoặc** mức đã xác nhận ở mọi năng lực của khóa ≥ mức khóa − 1 (khung chương trình A7: được bỏ qua khóa thấp nếu đã đạt). Công thức điểm 70/20/10 giữ nguyên. Kỳ vọng với kịch bản Kế toán: gợi ý A1-I, A2-I, A4-I, A5-I, M6-I; **không** có A1-A / A4-A. Thêm test và cập nhật R1–R10 nếu cần.

**B8. FE Skill Gap** (`CompetencyRadarChart`, `SkillGapDetailView`, `MyCompetencyProfilePage`):

- Radar 6 trục theo miền (D-B3): required = mức miền; current = **trung bình** mức đã xác nhận của các năng lực trong miền (chưa xác nhận tính 0), chú thích "Average level in domain".
- Mỗi miền hiện trạng thái "Domain met" chỉ khi **mọi** năng lực trong miền đạt (mức thấp nhất ≥ yêu cầu).
- Bảng gap nhóm theo miền, thu/mở được, vẫn sắp theo priority trong nhóm.
- KPI giữ nguyên (đếm trên 24 dòng).
- Test Vitest cho hàm gộp theo miền (đặt trong `features/intelligence/utils/`).

**B9. Tài liệu** (không commit file untracked nếu Leader chưa đồng ý):

- Spec Sprint 3: §4.5 và §5.3 ví dụ mới; severity; quy tắc gợi ý; ghi D-S3-16 "Căn cứ Thông tư 02/2025".
- SRS §7.3.3 + MSG07; đóng O-1 và O-5 ở §13.
- `CLAUDE.md`: mô tả seed mới (5 vị trí, 24 năng lực, 18 khóa).
- Tài liệu ma trận §9: đánh dấu các mục đã làm.

**B10. Learner / public** (D-B5): đổi các nhãn "L1–L8", "Level 5-6", "Trung cấp (L3-L4)" sang 3 mức (Cơ bản / Trung bình / Nâng cao kèm bậc Thông tư) trong `features/learner/**` và `features/public/data/careerData.ts`; cập nhật `LearnerFlow.test.tsx`. Không thay danh mục nghề.

---

## GIAI ĐOẠN C — Kiểm tra lại

1. Reset `digitalent_dev`, chạy lại toàn bộ test (backend, frontend, build). Ghi số test mới.
2. Playwright (hr@, manager@, employee@): Competency Framework (24 năng lực theo miền), Position Requirements (vị trí Kế toán: áp mức theo miền, chia trọng số, thử kích hoạt bản thiếu 6.1–6.3 qua API → 400 với MSG07 mới và danh sách mã thiếu), Team Skill Gap + My Competency Profile (radar 6 trục, bảng theo miền, gợi ý đúng kịch bản §8), Confirm level (4.2 lên Trung bình → 4.2 chuyển HIGH → MEDIUM, trục miền 4 lên 1.25, gợi ý cập nhật, toast realtime).
3. Chụp screenshot cho kịch bản demo §8 ở 1280×900, đặt tên `.playwright-mcp/demo-tt02-step<N>.png`.
4. Thêm mục "Sau điều chỉnh Thông tư 02/2025" vào báo cáo Giai đoạn A: việc đã làm (commit hash), test, trạng thái K-3/K-5/K-9, lỗi còn lại.

## Trả lời cuối cùng (tiếng Việt, ngắn gọn)

- Kết luận Giai đoạn A, các lỗi quan trọng nhất.
- Những gì Giai đoạn B đã làm (danh sách commit), số test trước/sau.
- Câu hỏi còn cần Leader quyết định; nhắc rằng **chưa push**.

## Dọn dẹp khi xong

Dừng API (cổng 5000) và Vite (5173) bạn đã chạy; đóng tab Playwright; **không** dừng `digitalent-test-pg`; không xóa `.playwright-mcp/` (Leader cần screenshot cho báo cáo và demo).
