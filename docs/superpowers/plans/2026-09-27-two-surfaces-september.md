# Two-Surface September Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chốt một foundation chạy xuyên suốt cho DigiTalent trước 30/09/2026 và đặt ranh giới sạch cho hai giao diện (doanh nghiệp, học theo vị trí) dùng chung một backend.

**Architecture:** Giữ một React app production trong `frontend/`, có hai route tree/layout khác nhau; `fontend-demo/` chỉ là nguồn tham khảo UX. Giữ một ASP.NET Core API và PostgreSQL. Mọi trạng thái học thật, quyền và giới hạn tổ chức do backend quản lý.

**Tech Stack:** .NET 8, ASP.NET Core, EF Core/PostgreSQL, React 19, TypeScript, React Router, TanStack Query, Vite, GitHub Actions, Docker Compose.

**Spec:** `docs/specs/2026-09-27-two-surfaces-september-plan.md`

## Global Constraints

- Nhánh làm việc: `codex/two-surfaces-september`. Không push. Coordinator là người duy nhất chạy `git add` và `git commit`; commit sau mỗi lát có test xanh, chỉ stage đường dẫn/hunk của lát đó, không dùng `git add -A`.
- Working tree đã có nhiều thay đổi trước kế hoạch này. Không reset, stash, checkout đè hoặc gom chúng vào commit mới khi chưa rà đúng ownership. Kiểm tra `git diff --cached` trước mỗi commit.
- Index hiện đã có file staged từ trước. Khi chỉ commit một task, dùng `git commit --only -- <explicit paths>` để không kéo các file staged ngoài task vào commit; kiểm tra lại index sau commit.
- Một frontend production, hai trải nghiệm; một backend/API/database. Không triển khai nghiệp vụ production trong `fontend-demo/` hoặc lưu tiến độ học thật trong `localStorage`.
- Giữ `/api/v1/departments` hoạt động. Route mới được đưa vào theo từng lát, route cũ có redirect khi cần.
- Permission trên frontend chỉ hỗ trợ UX; backend phải kiểm tra quyền và tenant/owner trên truy vấn. Public endpoint chỉ trả bản ghi đã publish và được phép công khai.
- Không xóa database cũ để làm test. Migration được kiểm tra trên database dùng một lần. Không đẩy cấu hình secret/dev seed vào production.
- TDD cho rule và luồng có tác động; backend/FE build và test phải chạy thực sự. Mục tiêu coverage tối thiểu 80% cho phần code mới theo quy ước nhóm; không lấy `dotnet test` exit 0 khi không có test làm bằng chứng.
- Mốc 30/09 là foundation tích hợp, không phải toàn bộ Course/Assessment/learner production. Hạng mục không qua acceptance chuyển sang backlog sau tháng 9 với trạng thái trung thực.

## Review Focus

1. Token thiếu/hết hạn hoặc `/auth/me` lỗi: người dùng về login một lần, không thấy nội dung enterprise và không lưu `refreshToken=undefined` — kiểm ở Task 2 và Task 6.
2. Tài khoản khác tổ chức hoặc không có org: không đọc/sửa phòng ban của tenant khác, kể cả gọi API trực tiếp — kiểm ở Task 1 và Task 3.
3. Khách chưa đăng nhập mở `/verify`: route không bị `AuthGuard` chặn; việc xác minh thật chưa được tuyên bố hoàn tất — kiểm ở Task 4.
4. CSS/nav của learner không làm đổi dashboard doanh nghiệp, route cũ vẫn đi đúng đích — kiểm ở Task 4 và Task 6.
5. Database mới và database có migration cũ: không để CI xanh trên DB trắng nhưng production thiếu bảng, và không tự xóa dữ liệu để vượt lỗi migration — kiểm ở Task 1 và Task 5.

---

## File ownership và cách chạy song song

| Lane / subagent | Chỉ được sửa | Không được sửa |
| --- | --- | --- |
| A — backend baseline | `backend/tests/**`, `backend/DigiTalent.sln`, migration/seed nếu test chỉ ra lỗi | `frontend/**`, `.github/**`, `docker/**` |
| B — FE auth | `frontend/src/features/auth/pages/LoginPage.tsx`, `frontend/src/services/{auth.service,api-client}.ts`, `frontend/src/hooks/{use-auth,use-current-user}.ts`, `frontend/src/types/auth.ts`, `frontend/package.json`, `frontend/package-lock.json`, test auth và test setup liên quan | `frontend/src/app/router.tsx`, department page, CI |
| C — enterprise Department UI | `frontend/src/features/organization/pages/DepartmentListPage.tsx`, component/test chỉ dành cho Department, `frontend/src/hooks/use-departments.ts`, `frontend/src/services/department.service.ts` khi cần | router, auth, backend |
| D — route/layout hai bề mặt | `frontend/src/app/router.tsx`, `frontend/src/app/routes/**`, `frontend/src/app/layouts/**`, public/learner shell và test của route | login internals, Department UI, backend |
| E — CI/deploy | `.github/workflows/**`, `docker/**`, `.env.example`, `frontend/.env.example`, script deploy mới nếu cần | use case/backend migration, page UI |
| F — QA tích hợp | Test E2E/smoke mới, báo lỗi và minh chứng; chỉ sửa test do mình sở hữu | Production code của lane khác; gửi lỗi cho owner |

Các agent cùng dùng một working tree: **không tự stage/commit, không sửa file ngoài ownership, không hoàn nguyên thay đổi của người khác**. Khi một task xong, gửi danh sách file thay đổi, test đã chạy và kết quả cho coordinator. Coordinator rà diff, chạy gate rồi commit riêng. Nếu cần sửa file thuộc lane khác, nhắn coordinator trước để sắp thứ tự; không cùng sửa một file. Trước khi dispatch, coordinator kiểm tra nhánh và file chưa commit thuộc task đó; các file đã dirty phải được đọc diff để tách phần có sẵn khỏi phần mới.

**Sóng thực thi:** Wave 1 chạy A, B và phần path/env của E song song. Wave 2 chạy C và D song song sau khi B có test harness/contract; E hoàn tất gate CI theo test project của A/B. Wave 3 là F sau các commit cục bộ của A/B/C/D/E. Task 7 (JobPosition) và Task 8 (learner contract) chỉ mở khi P0 qua hoặc có năng lực riêng, không chiếm owner P0.

## Task 0: Chốt baseline và commit plan

**Owner:** Coordinator.
**Files:** `docs/specs/2026-09-27-two-surfaces-september-plan.md`, file plan này.
**Interface:** Plan này là hợp đồng ownership và acceptance cho các agent.
**Commit:** `b4bab4c` (`docs: plan two-surface September foundation`)

- [x] Xác nhận `git branch --show-current` là `codex/two-surfaces-september`; ghi `git status --short` và tách thay đổi có sẵn khỏi file mới.
- [x] Đọc lại spec và plan, xác nhận không có task P0 nào ngầm yêu cầu Course/Assessment production.
- [x] Stage chính xác hai file Markdown trên; kiểm tra `git diff --cached --check -- <hai đường dẫn>` và `git diff --cached --stat -- <hai đường dẫn>`.
- [x] Commit bằng `git commit --only -m "docs: plan two-surface September foundation" -- <hai đường dẫn>` để giữ nguyên các file đã staged từ trước. Không push.

## Task 1: Baseline database và test backend thật

**Owner:** Lane A.
**Files:** `backend/DigiTalent.sln`; tạo `backend/tests/DigiTalent.Tests/DigiTalent.Tests.csproj`, `backend/tests/DigiTalent.Tests/Auth/LoginUseCaseTests.cs`, `backend/tests/DigiTalent.Tests/Organization/DepartmentScopeTests.cs`, `backend/tests/DigiTalent.Tests/Persistence/FoundationMigrationTests.cs`; chỉ sửa `backend/src/DigiTalent.Infrastructure/Persistence/Migrations/**` và `Seed/DbSeeder.cs` khi kiểm chứng nêu lỗi cụ thể.
**Consumes:** `IUseCase<,>`, `IApplicationDbContext`, `ICurrentUser`, `AppDbContext`, seed dev hiện có.
**Produces:** test project có trong solution, migration chain foundation đã kiểm tra trên PostgreSQL dùng một lần, kết quả seed idempotent.
**Commit:** `19fbb05` (`test: verify auth scope and foundation migration`)

- [ ] Viết test `LoginRejectsInactiveAccount`, `DepartmentListExcludesOtherOrganization`, `FoundationMigrationCreatesExpectedTables`, `SeedTwiceDoesNotDuplicateRolesOrUsers`; assertions lần lượt là 403/401 phù hợp, chỉ thấy org của người gọi, các bảng nền có mặt, số role/user không tăng sau seed lại. Trên bản sao DB cũ dùng một lần, chạy thử đường upgrade; nếu chưa hỗ trợ, ghi rõ bước chuyển đổi thủ công và chặn deploy tự động lên DB cũ. (Test hiện có; đường nâng cấp DB cũ chưa được kiểm chứng.)
- [x] Chạy test và ghi lý do FAIL trước khi sửa mã; nếu môi trường không có PostgreSQL, tách unit test chạy ngay và để integration test chạy qua CI PostgreSQL service, không đổi test thành mock chỉ để xanh.
- [x] Bổ sung test project vào solution, sửa đúng lỗi migration/seed tìm được; không xóa database người dùng hoặc tự viết lại migration đã áp dụng ở môi trường khác.
- [ ] Chạy `dotnet build backend/DigiTalent.sln --configuration Release` và `dotnet test backend/DigiTalent.sln --configuration Release --no-build --verbosity normal`; xác nhận test count > 0 và mọi test có thể chạy trong môi trường hiện tại đều PASS. (Build và 26 unit test PASS; 3 PostgreSQL integration test chờ database test.)
- [x] Báo coordinator diff/test evidence để commit `test: verify auth scope and foundation migration` hoặc `fix: stabilize foundation migration` theo nội dung thực tế.

## Task 2: Đồng bộ auth contract và phiên frontend

**Owner:** Lane B.
**Files:** `frontend/src/features/auth/pages/LoginPage.tsx`, `frontend/src/services/auth.service.ts`, `frontend/src/services/api-client.ts`, `frontend/src/hooks/use-auth.ts`, `frontend/src/hooks/use-current-user.ts`, `frontend/src/types/auth.ts`, `frontend/package.json`, `frontend/package-lock.json`; test auth mới cùng thư mục feature; cập nhật test setup frontend chỉ trong lane B.
**Consumes:** backend hiện trả `{ accessToken, expiresAt }` từ `POST /api/v1/auth/login`, và `/auth/me` trả user/roles/permissions.
**Produces:** `useLogin()` và login page dùng cùng DTO, token/session thống nhất; giao diện không hứa refresh/Google/password reset chưa có.
**Commit:** `a4a331b` (`fix: align frontend auth with current API`)

- [x] Viết test `LoginStoresOnlyReturnedAccessToken` (không có key refresh), `ExpiredSessionRedirectsToLoginOnce`, `LoginRedirectRespectsSafeInternalReturnTo` (chặn URL ngoài origin); nếu cần harness, thêm Vitest/Testing Library vào `frontend/package.json` và lockfile trong lane B.
- [x] Chạy test tương ứng để thấy FAIL vì FE hiện đọc `refreshToken` hoặc chưa xử lý return path.
- [x] Bỏ trường/ghi `refreshToken` giả; đưa login page và hook về một luồng service duy nhất; xử lý 401 và logout thống nhất, hiển thị rõ các action đăng nhập chưa được hỗ trợ.
- [x] Chạy `npm run lint`, `npm run build` và test FE mới trong `frontend/`; ghi rõ warning còn lại. Không yêu cầu backend refresh được viết chỉ để khớp UI.
- [x] Báo coordinator để commit `fix: align frontend auth with current API`.

## Task 3: Department UI chạy bằng API thật

**Owner:** Lane C.
**Files:** `frontend/src/features/organization/pages/DepartmentListPage.tsx`; tạo component con/test dưới `frontend/src/features/organization/`; chỉ sửa `use-departments.ts` và `department.service.ts` khi DTO hiện tại lệch backend.
**Consumes:** `departmentService` và hooks hiện có; auth/session từ Task 2.
**Produces:** list/search/status/pagination và create/edit/archive từ UI, cache invalidation đúng.
**Commit:** `a382ea4` (`feat: connect department management UI`)

- [x] Viết test `DepartmentPageShowsServerRowsAndEmptyState`, `CreateDepartmentShowsValidationAndRefreshesList`, `ArchiveDepartmentRequiresConfirmation`, `ReadOnlyUserCannotEdit`; mock API boundary, không mirror JSX.
- [x] Chạy test để thấy FAIL do trang hiện là placeholder.
- [x] Dùng DataTable/EmptyState/ConfirmActionDialog hiện có và hook Department để viết list/form; quyền nút theo `department.read`/`department.create_update`; phân biệt archive với xóa cứng.
- [x] Chạy test, `npm run lint`, `npm run build`; sau đó thử bằng hai role với backend thật khi Task 1/2 sẵn sàng.
- [x] Báo coordinator để commit `feat: connect department management UI`.

## Task 4: Route và layout hai giao diện

**Owner:** Lane D.
**Files:** `frontend/src/app/router.tsx`; tạo `frontend/src/app/routes/{public,learner,enterprise}.routes.tsx`, `frontend/src/app/layouts/{Public,Learner,Enterprise}Layout.tsx`, `frontend/src/features/public/landing/**`, `frontend/src/features/learner/shell/**` và test route; có thể dùng `MainLayout` hiện có bên trong EnterpriseLayout.
**Consumes:** `AuthGuard`, `RequirePermission`, `getDefaultPath`, auth session Task 2; không sửa internals các file đó.
**Produces:** `/`, `/careers`, `/verify`, `/learn/*`, `/enterprise/*` có layout đúng; route cũ redirect có kiểm soát.
**Commit:** `91d10e9` (`feat: separate enterprise and learner routes`)

- [x] Viết test `AnonymousCanOpenLandingAndVerifyRoute`, `AnonymousCannotOpenEnterpriseRoute`, `EmployeeCanReachLearnerShell`, `LegacyDepartmentPathRedirectsToEnterprisePath`; kiểm tra CSS/layout trên desktop và mobile.
- [x] Chạy test để thấy FAIL vì `/verify` đang dưới guard và route hai bề mặt chưa tồn tại.
- [x] Tách route tree; public page trình bày chức năng thực có, không hiển thị khóa học/tiến độ giả như dữ liệu production; learner shell có navigation độc lập, trạng thái chưa có API được ghi rõ.
- [x] Chạy test, `npm run lint`, `npm run build`; xác nhận CSS của learner không đổi sidebar/dashboard enterprise.
- [x] Báo coordinator để commit `feat: separate enterprise and learner routes`.

## Task 5: CI, cấu hình API và deploy sạch

**Owner:** Lane E.
**Files:** `.github/workflows/backend-ci.yml`, `.github/workflows/frontend-ci.yml`, `docker/docker-compose.yml`, `docker/nginx/conf.d/default.conf`, `.env.example`, `frontend/.env.example`; tạo script migration riêng nếu cần.
**Consumes:** test backend Task 1, test FE Task 2/3/4, một frontend build `frontend/dist`.
**Produces:** CI kích hoạt đúng đường dẫn, không xanh khi test count bằng 0, DB production/test có bước migrate trước API, API base URL thống nhất.
**Commit:** `e601b96` (`ci: gate backend tests and deployment configuration`)

- [ ] Viết/điều chỉnh CI check cho `docker/**` và test project; kiểm tra cấu hình khi thay `docker/docker-compose.yml` sẽ kích hoạt backend/deploy gate. Chạy `docker compose config` nếu host có Docker; nếu không, để CI chạy kiểm tra này và báo giới hạn local. (Path filter đã sửa; chưa có Docker để xác nhận Compose.)
- [x] Kiểm tra FAIL hiện tại: root `.env.example` trỏ `/api` trong khi FE cần `/api/v1`; backend CI theo dõi root `docker-compose.yml` sai chỗ; `dotnet test` không có test source.
- [x] Sửa env example, path filters; chọn bước migration rõ ràng trước API trong compose/deploy. Không dùng fallback mật khẩu/JWT key ở Production, giữ dev setup thuận tiện nhưng tách môi trường.
- [ ] Chạy YAML/compose validation khả dụng, backend/FE build và CI test commands; xác nhận fresh DB path trên runner hoặc disposable DB. (Build và TRX parser PASS; fresh DB/CI run chưa được kiểm chứng.)
- [x] Báo coordinator để commit `ci: gate backend tests and deployment configuration`.

## Task 6: Smoke test xuyên suốt và chốt tháng 9

**Owner:** Lane F + coordinator.
**Files:** test E2E/smoke mới trong `frontend/e2e/**` hoặc `backend/tests/**` theo harness thực có; không sửa production code lane khác; cập nhật trạng thái task trong plan này chỉ sau khi có bằng chứng.
**Consumes:** Tasks 1–5.
**Produces:** test report trên DB dùng một lần và danh sách bug/go-no-go tháng 9.
**Commit:** `22cf3c3` (`test: cover September foundation flow`)

- [ ] Viết đường đi E2E: anonymous vào `/`, `/verify`; HR login → Department list/create/archive; employee không được tạo Department; reload vẫn giữ phiên đúng; API trực tiếp khác tenant bị chặn. (Đã thêm smoke HTTP cho health/login/Department/Job Architecture; browser reload và cross-tenant HTTP còn thiếu.)
- [x] Chạy trước khi sửa lỗi để ghi failure thật, gán về đúng lane; không xóa test khi thất bại.
- [ ] Chạy lại sau fix: backend test count > 0, frontend test/lint/build PASS, migration/seed trên DB mới PASS, E2E PASS. Nếu host không có Docker/PostgreSQL/browser, ghi gate chưa xác minh và để CI/test environment chạy; không tuyên bố pass dựa trên build. (26 unit và 20 frontend test PASS; integration/smoke thực chưa chạy.)
- [x] Coordinator rà `git diff`, chỉ stage file test/fix thuộc task, commit `test: cover September foundation flow` và cập nhật checkpoint tháng 9. Không push.

## Task 7: Job Architecture vertical slice (P1, chỉ sau P0)

**Owner:** Backend Job Architecture agent và FE Job Architecture agent ở hai lượt/ownership khác nhau.
**Files BE:** tạo use case/controller JobFamily/JobPosition dưới `backend/src/DigiTalent.Application/UseCases/JobArchitecture/**`, `backend/src/DigiTalent.Api/Controllers/JobFamiliesController.cs`, `JobPositionsController.cs`; sửa `Permissions.cs`, `RolePermissions.cs`, seed; test tương ứng.
**Files FE:** `frontend/src/features/enterprise/organization/JobPosition*` hoặc page vị trí hiện có, service/hook riêng; không đụng route cho tới khi lane D bàn giao.
**Consumes:** foundation migration, auth, permission và route tree Tasks 1/2/4.
**Produces:** JobFamily/JobPosition CRUD + archive có org scope và UI thật; là tiền đề cho requirement/learning.
**Commits:**
- Backend: `ce10992` (`feat: manage job architecture`), followed by `2dd0a7e` (`feat(job-arch): complete JobFamily CRUD, enforce position archive employee guard, and link UI`)
- Frontend: `8d25b1d` (`feat: connect job position UI`)

- [x] Viết test backend cho trùng mã trong một org, cùng mã ở hai org, archive vị trí đang được dùng, role thiếu quyền, và FE test list/form/empty/error.
- [x] Chạy test để thấy FAIL do controller/use case/UI chưa có.
- [x] Triển khai BE trước, chốt DTO; FE dùng service/type khớp contract, không đọc entity trực tiếp. Giới hạn role và org tại backend.
- [ ] Chạy unit/integration, FE test/lint/build và smoke hai org; coordinator commit BE `feat: manage job architecture` rồi FE `feat: connect job position UI` riêng. Không push. (Unit/FE PASS; smoke hai org chưa kiểm chứng.)

## Task 8: Hợp đồng người học tự do và catalog công khai (P1, chỉ sau P0)

**Owner:** Product + backend learner agent, không sửa file của Task 7.
**Files:** tạo `docs/specs/learner-identity-catalog-contract.md` với request/response, quyền, dữ liệu mẫu và migration proposal; tạo contract tests trong `backend/tests/DigiTalent.Tests/Learning/PublicCatalogContractTests.cs` khi endpoint bắt đầu được triển khai. Chưa sửa `AppDbContext` hoặc migration trước khi quyết định ở spec §7 được chốt.
**Consumes:** route `/careers`, `/learn/*` của Task 4; current `User`/`Employee`/`JobPosition` và endpoint auth.
**Produces:** contract đã review cho người học không có org, `LearnerProfile`, `CareerRoleTemplate`, course visibility và lựa chọn target; là đầu vào cho migration và API thật sau mốc foundation.
**Commits:**
- Contract: `32ecec1` (`docs: define public learner API contract`)
- Product Decisions: `8244a56` (`docs: finalize public learner product decisions`)

- [x] Viết ví dụ contract cho anonymous đọc catalog publish, learner không có org lưu target, nhân viên chọn target cá nhân, và request đọc course private khác tenant bị 403/404.
- [x] Review các trường bắt buộc và trạng thái; xác nhận tên/kiểu dữ liệu FE và BE, điều kiện publish và giới hạn owner.
- [x] Đưa quyết định còn mở về signup, mapping org position và course ownership cho chủ sản phẩm; giữ task `blocked-by-decision` nếu chưa chốt, không đoán bằng code.
- [x] Coordinator commit contract riêng `docs: define public learner API contract` sau review; không push.

## Deferred sau 30/09, không dispatch cùng P0

1. Public learner account/registration, `LearnerProfile`, target role và catalog visibility migration.
2. Course/lesson/material authoring, published public catalog, enterprise assignment, enrollment/progress API.
3. Diagnostic/skill gap rule chuyển từ `fontend-demo` sang backend có version/test; learner UI dùng kết quả server.
4. Assessment, evidence/task, certificate issuance/verification và analytics.

Mỗi mục deferred cần spec/contract riêng và tiêu chí tích hợp trước khi giao agent; không sao chép demo localStorage làm dữ liệu thật. Khi P0 xong, dùng cùng quy trình ownership, test trước, review diff và commit theo lát nhỏ.

## Review & Remediation Checkpoint (27/09/2026)

Các commit đã đưa mã nguồn nền tảng vào nhánh; gate tích hợp vẫn cần chạy trên database dùng một lần:
- `5b73a15`: `feat(db): establish canonical foundation entities, configurations, and migration` — Domain entities, EF configurations, migration foundation 13 bảng nghiệp vụ (cộng bảng lịch sử migration của EF), seeder và canonical script đã được commit; checkout sạch build được.
- `4fd7519`: `feat(auth,org): implement RBAC permission service and department archive lifecycle` — Permission service kiểm tra quyền DB, logic login khóa sau 5 lần sai, lifecycle archive phòng ban.
- `2dd0a7e`: `feat(job-arch): complete JobFamily CRUD, enforce position archive employee guard, and link UI` — Hoàn thiện đầy đủ CRUD JobFamily, chặn archive JobPosition khi có nhân viên đang gắn kết, UI tabs và dialog liên kết JobPosition/JobFamily.
- `d29fc21`: `fix(security,ops): enforce production secret checks, compose migration automation, and sync plan` — Thêm kiểm tra secret, cờ migration và test PostgreSQL; các lỗ hổng gate phát hiện sau đó được sửa ở các commit tiếp theo.

## Verification checkpoint sau rà soát

- `34ab1ad` (`fix: make migration and integration gates fail closed`): sửa Compose shell, `--migrate-only`, kiểm tra mật khẩu Production, CI đếm test từ TRX; 3 integration test giờ FAIL khi database test không truy cập được.
- `79b2380` (`test: add live API smoke and isolate production seeding`): Production chỉ seed role/permission; CI có script smoke HTTP trên PostgreSQL dùng một lần, mật khẩu Development test sinh theo lần chạy.
- `99cdecc` (`fix: preserve return path across authentication`): giữ `returnTo` khi vào route bảo vệ hoặc nhận 401, test điều hướng thật.
- Đã xác minh cục bộ: backend Release build PASS; 26 unit test PASS; frontend build/lint PASS và 20 test PASS; TRX parser đọc đúng 26 test. Test với kết nối PostgreSQL cố ý sai FAIL 3/3 như yêu cầu.
- Chưa xác minh: Compose startup, 3 integration test với PostgreSQL thật, script smoke HTTP trên CI, browser E2E, cross-tenant qua API và đường nâng cấp database cũ. Máy hiện tại không có Docker/PostgreSQL; nhánh chưa push nên CI chưa chạy. Không đánh dấu các gate này là PASS.

## Coordinator checkpoint trước mỗi commit

```text
1. Nhận file list và test evidence từ agent.
2. git status --short; kiểm tra file đó có thay đổi có sẵn trước task hay không.
3. git diff -- <explicit paths>; nếu file có thay đổi trộn, stage từng hunk hoặc hoãn commit.
4. git add -- <explicit paths>; git diff --cached --check -- <explicit paths>; git diff --cached -- <explicit paths>.
5. Chạy lại gate liên quan; git commit --only -m "<conventional commit>" -- <explicit paths>.
6. Ghi SHA và task ID vào plan; không push.
```

**Handoff:** các task đã được triển khai theo các commit ghi trên; coordinator tiếp tục giữ quyền tích hợp và commit, không push. Những gate chưa xác minh ở checkpoint phải chạy trên môi trường có PostgreSQL/CI trước khi chốt hoàn thành tháng 9.
