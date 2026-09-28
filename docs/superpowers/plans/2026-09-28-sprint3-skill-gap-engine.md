# Sprint 3 — Skill Gap Engine & Recommendation Implementation Plan

> Steps dùng checkbox (`- [ ]`) để theo dõi. Mỗi task kết thúc bằng build + test xanh thật sự, rồi commit.

**Goal:** Đến 12/10/2026, HR/DM tính và xem được skill gap thật của nhân viên, nhân viên xem radar + khóa học gợi ý có giải thích, skill gap tự cập nhật khi cấp độ năng lực/tiêu chuẩn vị trí thay đổi — demo được với Mentor trên dữ liệu seed.

**Architecture:** Engine tính toán là class thuần trong `Application/Services/Intelligence` (không đụng DB, test dễ). Use case chỉ nạp dữ liệu, gọi engine, lưu snapshot. Domain event qua dispatcher nội bộ chạy trong `AppDbContext.SaveChangesAsync` (một transaction). FE dùng component chung cho cả tuyến doanh nghiệp và tuyến learner.

**Tech Stack:** .NET 8, EF Core 8 + Npgsql, FluentValidation, Scrutor, xUnit + FluentAssertions + Moq, React 19, TanStack Query, Recharts, Vitest.

**Spec:** `docs/specs/2026-09-28-sprint3-skill-gap-recommendation-spec.md` (mọi "D-S3-xx", "AC-xx", "T-xx" bên dưới tham chiếu tới spec).

## Global Constraints

- Schema-first: sửa `docs/database/DigiTalent_AI_Canonical_v2_3.sql` (→ v2.4) **trước** entity/migration. Không sửa migration đã push.
- Use case phụ thuộc `IApplicationDbContext`, trả Output DTO, ném exception chuẩn (`NotFound/BadRequest/Conflict/Forbidden`). Controller chỉ gọi use case, mỗi action có `[HasPermission]`.
- Dịch vụ không phải use case (engine, dispatcher, settings provider) phải **đăng ký tay** trong `DependencyInjection.cs` — Scrutor hiện chỉ quét `IUseCase<,>`.
- Không đổi ma trận RBAC. Nếu buộc phải đổi → cập nhật `RolePermissions.cs`, `use-permission.ts` và Report 4 cùng PR.
- FE: chỉ gọi API qua `apiClient`, service là object, state server bằng TanStack Query. Không lưu kết quả phân tích vào `localStorage`.
- TDD cho engine và policy: viết test golden từ spec trước, chạy thấy đỏ, rồi code.
- Commit: `feat(intelligence): S3-T015 …`, `fix(competency): S3-T015 …` (gắn mã task theo quy ước team). Không `git add -A` — working tree đang có nhiều file ngoài phạm vi (`fontend-demo/` bị xóa, docs chưa track).
- Branch mỗi task: `feature/DT-<jira>-<kebab>` từ `main` mới nhất, PR vào `main`.

## Review Focus

1. Snapshot không bao giờ bị update/xóa; mỗi lần tính là một run mới (D-S3-07).
2. DM không đọc/tính được nhân viên phòng khác, Employee không đọc được người khác — kể cả gọi API trực tiếp; trả 404 (D-S3-06).
3. Evidence + profile + snapshot nằm trong **một** transaction; lỗi SignalR không rollback dữ liệu (D-S3-09).
4. Giá trị ghi DB luôn thỏa CHECK của SQL: `severity` ∈ {LOW, MEDIUM, HIGH, NULL}, `current_level` NULL hoặc 1–3, `generated_by` ∈ {SYSTEM, USER_REQUEST}.
5. Migration catch-up không làm đổi 19 bảng đã có trong production/dev DB.

---

## File ownership

| Lane | Được sửa | Phối hợp |
| --- | --- | --- |
| BE Intelligence (LinhTV) | `Application/Services/Intelligence/**`, `Application/UseCases/Intelligence/**`, `Application/UseCases/Competency/Evidence/**`, `Application/Common/Events/**`, `Api/Controllers/{SkillGaps,Recommendations,CompetencyEvidences}Controller.cs`, `Infrastructure/Events/**`, `Infrastructure/Persistence/{AppDbContext.cs,Seed/**,Migrations/**}`, `backend/tests/DigiTalent.Tests/{Intelligence,Events}/**` | — |
| Sửa nhỏ module người khác | `UpdateEmployeeUseCase.cs` (phát event, HoangNT review), `ActivatePositionRequirementSetUseCase.cs` (của LinhTV) | Báo HoangNT trước 07/10 |
| Schema v2.4 | `docs/database/DigiTalent_AI_Canonical_v2_3.sql`, `Assessment.cs`, `AssessmentConfiguration.cs` | Báo người phụ trách Assessment: không sửa `assessments` song song |
| FE Intelligence (LinhTV) | `frontend/src/features/intelligence/**`, `features/employee/pages/MyCompetencyProfilePage.tsx`, `services/intelligence.service.ts`, `hooks/use-{skill-gaps,recommendations}.ts`, `lib/competency-levels.ts`, `package.json` (recharts) | VietTN review |
| FE learner (nhẹ) | `features/learner/pages/{LearnerProgressPage,LearnerTargetPage}.tsx` | — |

---

## Lịch Sprint 3 (28/09 → 12/10)

| Ngày | Task | Jira | Giờ | Phụ thuộc |
| --- | --- | --- | --- | --- |
| 28/09 | Task 1 — Chốt spec + AC + test matrix | DT-192 S3-T002, DT-194 S3-T003 | 13 + 11 | — |
| 29/09 | Task 2 — Nền: SQL v2.4, migration, rule trọng số, seed | (tính vào DT-210) | ~8 | Task 1 được duyệt D-S3-13/15 |
| 30/09 → 02/10 | Task 3 — Skill Gap engine + API | DT-210 S3-T015 | 22 | Task 2 |
| 30/09 → 02/10 | Task 7a — test engine (TDD, song song Task 3) | DT-216 S3-T020 | 4 | — |
| 01/10 → 05/10 | Task 4 — FE Skill Gap pages | DT-211 S3-T016 | 27 | Contract từ Task 1; API thật từ 02/10 |
| 05/10 → 07/10 | Task 5 — Recommendation | DT-212 S3-T017 | 22 | Task 3 |
| 07/10 → 09/10 | Task 6 — Domain events + manual evidence | DT-213 S3-T018 | 13 | Task 3 |
| 09/10 | Task 7b — test hoàn thiện + coverage | DT-216 S3-T020 | 7 | Task 5, 6 |
| 09/10 → 10/10 | Task 8 — Retry policy | DT-222 S3-T024 | 8 | SQL v2.4 (Task 2); tích hợp phụ thuộc engine thi của team |
| 11/10 → 12/10 | Task 9 — Report 3 + chuẩn bị demo | DT-224 S3-T025 | 5 | Tất cả |

Tổng: 140 giờ, khớp Jira. Thứ tự cắt nếu trễ: (1) heatmap trong Task 4, (2) UI đếm ngược Task 8, (3) radar tuyến learner.

---

### Task 1: Chốt spec, AC, test matrix (S3-T002 + S3-T003)

**Files:** `docs/specs/2026-09-28-sprint3-skill-gap-recommendation-spec.md`

- [x] Soạn spec: decision log D-S3-01..15, công thức, ví dụ golden, API contract, AC, test matrix.
- [ ] QuyTD review AC + test matrix; HoangNT review thuật toán + cơ chế event.
- [x] Chốt D-S3-08 (quiz không xác nhận năng lực) — Team Leader duyệt 28/09; báo Mentor ở buổi review.
- [ ] Xin Mentor xác nhận D-S3-13 (SQL v2.4).
- [ ] Cập nhật Jira theo spec §3.1 (đổi tên S3-T018, sửa mô tả S3-T015/T017/T024).
- [ ] Commit `docs(intelligence): S3-T002 S3-T003 sprint 3 skill gap spec`, mở PR.

### Task 2: Nền tảng dữ liệu (bắt buộc làm trước mọi task code)

**Files:**
- Modify: `docs/database/DigiTalent_AI_Canonical_v2_3.sql` (header v2.4; `assessments` +2 cột; thêm `learner_profiles`, `job_positions.career_role_template_id`)
- Modify: `Domain/Entities/Assessment/Assessment.cs`, `Infrastructure/Persistence/Configurations/Assessment/AssessmentConfiguration.cs`
- Modify: `Infrastructure/Persistence/Configurations/Competency/EmployeeCompetencyProfileConfiguration.cs` (`RowVersion.IsConcurrencyToken()`)
- Modify: `Domain/Constants/Statuses.cs`
- Modify: `Application/UseCases/Competency/ActivatePositionRequirementSet/ActivatePositionRequirementSetUseCase.cs`
- Create: 2 migration; Modify: `Infrastructure/Persistence/Seed/DbSeeder.cs`
- Test: `tests/DigiTalent.Tests/Persistence/FoundationMigrationTests.cs`, `tests/DigiTalent.Tests/Competency/CompetencyTests.cs`

> **Phát hiện 28/09:** 41 configuration Phase 2–3 chỉ là khung rỗng (không CHECK/FK/unique/độ dài). Quyết định (Team Leader): viết config đầy đủ theo SQL cho **16 bảng** Sprint 3 cần (gồm chuỗi FK `competency_evidences → competency_evaluation_results → task_*`); **25 bảng** còn lại (`assessments`, `questions`, `lessons`, `certificates`…) để `ExcludeFromMigrations()` — người phụ trách module viết config đầy đủ rồi bỏ cờ này, EF sẽ tự sinh migration tạo bảng.

- [x] **2.1 Môi trường test local:** container riêng `digitalent-test-pg` (postgres:16-alpine, cổng **55432** — cổng 5432 máy dev đang bị dự án khác chiếm), DB `digitalent_test` + `digitalent_dev`. Baseline 61/61 xanh.
- [x] **2.2 Kiểm tra lệch model:** có thay đổi như dự đoán.
- [x] **2.3 Migration catch-up `20260928161858_AddSkillGapLearningEvidenceTables`:** đúng 16 `CreateTable` + index/CHECK, không đụng 19 bảng cũ; `has-pending-model-changes` sạch sau đó.
- [x] **2.4 Đối chiếu SQL:** test `PostgreSQL_SprintThreeTablesMatchCanonicalConstraints` kiểm 16 bảng, 11 CHECK, 8 index theo tên SQL, và `assessments` chưa được tạo. Test này đã bắt được 1 lỗi đặt tên index (convention snake_case ghi đè tên) — đã sửa.
- [ ] **2.5 SQL v2.4 + migration `AssessmentRetryPolicyV24`:** theo spec §7.1 — **chờ Mentor duyệt D-S3-13**; làm cùng lúc người phụ trách Assessment viết config đầy đủ cho `assessments`.
- [x] **2.6 Statuses:** thêm `Course`, `CourseCoverageType`, `Enrollment`, `EvidenceSourceType`, `EvidenceStatus`, `SkillGapSeverity`, `SkillGapGeneratedBy`, `ScoringConfigType`.
- [x] **2.7 Rule trọng số (AC-ACT-01, D-S3-11):** test đỏ (tổng 90 / 110) → code → xanh; thêm case 33.33 + 66.67 = 100 vẫn kích hoạt được.
- [x] **2.8 Seed reference:** `SkillGapSeeder.SeedReferenceAsync` — `system_settings` `intelligence.skill_gap` + `RECOMMENDATION_WEIGHTS` v1 (70/20/10) cho mọi tổ chức; chạy cả Production (qua `SeedReferenceDataAsync`).
- [x] **2.9 Seed demo (Development):** `SkillGapSeeder.SeedDemoAsync` — dữ liệu §4.5/§5.3; guard theo category `DIGITAL_CORE` nên chạy được cả trên DB dev cũ đã có user.
- [x] **2.10 Chạy thật:** DB ở trạng thái Sprint 2 → `dotnet run -- --migrate-only` (Development) áp migration + seed thành công; chạy lần 2 không nhân đôi dữ liệu (36 bảng, 5 competency, 4 course, 4 profile, trọng số tổng 100).
- [x] Thêm regression test `BooleanDefaultPersistenceTests` (Postgres): `is_mandatory = false` được lưu đúng — nghi vấn bẫy bool-default của EF ở Sprint 2 đã được kiểm chứng là **không** xảy ra.
- [ ] Commit (chờ Team Leader đồng ý): `feat(db): S3-T015 migrate sprint 3 tables with canonical constraints`, `fix(competency): S3-T015 require 100% weight on activate`, `feat(db): S3-T015 seed skill gap reference and demo data`.

### Task 3: Skill Gap Engine + API (S3-T015)

**Files:**
- Create: `Application/Services/Intelligence/SkillGap/{SkillGapCalculator.cs, SkillGapModels.cs, SkillGapSettings.cs, SkillGapSettingsProvider.cs, SkillGapRunService.cs}`
- Create: `Application/Common/Authorization/EmployeeScope.cs` (dùng chung cho Task 3, 5)
- Create: `Application/UseCases/Intelligence/SkillGap/{CalculateSkillGap, CalculateSkillGapBatch, GetSkillGapRuns, GetSkillGapRunById, GetMyLatestSkillGap}/…` (Input/Output/UseCase/Validator)
- Create: `Api/Controllers/SkillGapsController.cs`
- Modify: `Application/DependencyInjection.cs`
- Test: `tests/DigiTalent.Tests/Intelligence/{SkillGapCalculatorTests.cs, SkillGapUseCaseTests.cs}`

- [x] **3.1 Test golden đỏ (T-SG-01..07):** `SkillGapCalculatorTests` — 11 case (golden §4.5, summary, chưa có profile, vượt chuẩn, bảng severity, cấu hình tùy chỉnh, làm tròn AwayFromZero, giữ thứ tự).
- [x] **3.2 Code calculator** `Services/Intelligence/SkillGap/SkillGapCalculator.cs` (thuần, `CalculationVersion = "SG-1.0"`).
- [x] **3.3 `SkillGapSettingsProvider`:** org → global → default; JSON hỏng hoặc ngoài khoảng (k ∈ [1,10], ngưỡng ∈ (0,100]) → log warning + default.
- [x] **3.4 `EmployeeScope`** (`Common/Authorization`): `VisibleEmployees()` + `GetVisibleEmployeeAsync()`; ngoài phạm vi → 404.
- [x] **3.5 `SkillGapRunService.StageRunsAsync(employees, orgId, generatedBy, requirementSetOverride?)`:** nạp theo lô (3 truy vấn cho cả danh sách, không N+1), Add run + items, không SaveChanges; trả outcome có `SkipReason`. `BadRequestException` mở rộng thêm `Errors[{field, code}]` để trả mã lý do.
- [x] **3.6 Use cases:** `CalculateSkillGap`, `CalculateSkillGapBatch` (chỉ quét nhân viên ACTIVE, tối đa 500), `GetSkillGapRuns` (latestOnly, lọc trước khi project), `GetSkillGapRunById`, `GetMyLatestSkillGap`; DTO + `SkillGapRunReader` dùng chung ở `UseCases/Intelligence/SkillGap/Common`.
- [x] **3.7 Test use case (T-SG-08..11)** — chạy trên **Postgres thật** thay vì InMemory để bắt lỗi dịch LINQ và CHECK constraint: 11 case (`SkillGapUseCaseTests` + `SkillGapTestWorld`).
- [x] **3.8 Controller** `SkillGapsController` 5 action; `me/latest` đặt trước `{runId:guid}`.
- [x] **3.9 Kiểm tay qua HTTP** (API thật + DB seed): HR calculate `employee@` khớp §4.5 (90/75/15, coverage 47.50); manager batch OPS → 2 tính được, 2 skipped `NO_JOB_POSITION`; employee `me/latest` 200, `calculate` 403; trainer → 400 `employeeId:NO_JOB_POSITION`.
- [x] `dotnet build` 0 warning, `dotnet test` 91/91 xanh. Review (csharp-reviewer): không có CRITICAL/HIGH; đã sửa 3 góp ý — chọn run mới nhất theo Id (tránh trùng dòng khi 2 run cùng `GeneratedAt`, có test tái hiện), join thay subquery tương quan, `AsNoTracking` cho batch. Commit `feat(intelligence): S3-T015 skill gap calculation api`.
- [ ] PR → HoangNT (chưa push).

### Task 4: FE My Skill Gap & Team Skill Gap (S3-T016)

**Files:**
- Modify: `frontend/package.json` (`npm i recharts` — dùng bản hỗ trợ React 19)
- Create: `services/intelligence.service.ts`, `hooks/use-skill-gaps.ts`, `hooks/use-recommendations.ts` (hook gợi ý dùng ở Task 5), `lib/competency-levels.ts`
- Create: `features/intelligence/components/{CompetencyRadarChart, SkillGapKpiCards, SkillGapTable, SeverityBadge, SkillGapDetailDrawer, RecommendationList}.tsx`
- Modify: `features/employee/pages/MyCompetencyProfilePage.tsx`, `features/intelligence/pages/SkillGapPage.tsx`, `features/learner/pages/{LearnerProgressPage,LearnerTargetPage}.tsx`
- Test: `features/intelligence/__tests__/{SeverityBadge,CompetencyRadarChart,MyCompetencyProfilePage}.test.tsx`

- [ ] **4.1** Type + service theo contract spec §4.7 (có thể làm từ 01/10 trước khi API merge). Map mã lỗi → tiếng Việt trong `competency-levels.ts`.
- [ ] **4.2** Component dùng chung + test FE-01, FE-02 (radar < 3 trục → bar).
- [ ] **4.3** `MyCompetencyProfilePage`: tab Skill gap (KPI + radar + bảng) và tab Gợi ý (để placeholder đến Task 5). Có đủ skeleton / empty / error. Test FE-03.
- [ ] **4.4** `SkillGapPage`: bộ lọc (DM: select phòng bị khóa), bảng list `latestOnly`, drawer chi tiết, nút "Phân tích lại" + "Phân tích cả phòng" (ẩn nếu không có `SKILL_GAP_CALCULATE`), toast + hiện danh sách bị bỏ qua; invalidate query sau khi tính.
- [ ] **4.5** Learner: thay biểu đồ bằng `CompetencyRadarChart`, gắn nhãn "Dữ liệu minh họa" (D-S3-12).
- [ ] **4.6** *(Should)* Heatmap năng lực × nhân viên trong `SkillGapPage` từ dữ liệu list + detail.
- [ ] `npm run build`, `npm run lint`, `npm test` xanh; kiểm tra tay ở 1280px và 768px. Commit `feat(intelligence): S3-T016 skill gap pages`. PR → VietTN.

### Task 5: Course Recommendation (S3-T017)

**Files:**
- Create: `Application/Services/Intelligence/Recommendation/{CourseRecommender.cs, RecommendationModels.cs, RecommendationWeightsProvider.cs}`
- Create: `Application/UseCases/Intelligence/Recommendation/GetCourseRecommendations/…`
- Create: `Api/Controllers/RecommendationsController.cs`
- Modify: `MyCompetencyProfilePage.tsx`, `SkillGapDetailDrawer.tsx` (gắn `RecommendationList`)
- Test: `tests/DigiTalent.Tests/Intelligence/{CourseRecommenderTests.cs, GetCourseRecommendationsUseCaseTests.cs}`

- [ ] **5.1 Test golden đỏ (T-REC-01..07)** theo spec §5.3: `CourseRecommender.Rank(gapItems, candidateCourses, enrollments, weights, limit)`.
- [ ] **5.2 Code recommender** theo §5.1–5.2; sinh `reasons` + `explanation` tiếng Việt theo §5.4.
- [ ] **5.3 `RecommendationWeightsProvider`:** đọc `scoring_configs` active `RECOMMENDATION_WEIGHTS` + items; không có → default + version `"DEFAULT"`; tổng ≠ 100 → log error + default.
- [ ] **5.4 Use case:** tối đa 3 truy vấn (run mới nhất + items + tên năng lực; course PUBLISHED version cao nhất join `course_competencies` lọc theo competency đang thiếu; enrollments của nhân viên với các course đó). Phạm vi qua `EmployeeScope`. Test T-REC-08.
- [ ] **5.5 Đo hiệu năng:** Swagger/`curl` 10 lần trên seed → ghi p95 vào PR (mục tiêu < 200 ms).
- [ ] **5.6 FE:** gắn `RecommendationList` vào tab Gợi ý và drawer.
- [ ] Commit `feat(intelligence): S3-T017 course recommendation api`. PR → HoangNT.

### Task 6: Domain events + ghi nhận bằng chứng thủ công (S3-T018, phạm vi mới)

**Files:**
- Create: `Domain/Common/IDomainEvent.cs`, `Domain/Events/{EmployeeCompetencyLevelConfirmed, PositionRequirementSetActivated, EmployeeJobPositionChanged}.cs`
- Create: `Application/Common/Events/{IDomainEventQueue, IDomainEventHandler, IAfterCommitQueue}.cs`
- Create: `Infrastructure/Events/{DomainEventQueue, DomainEventDispatcher, AfterCommitQueue}.cs`
- Modify: `Infrastructure/Persistence/AppDbContext.cs` (thêm constructor overload nhận dispatcher; giữ constructor cũ cho test), `Infrastructure/DependencyInjection.cs`, `Application/DependencyInjection.cs` (Scrutor quét `IDomainEventHandler<>`)
- Create: `Application/Services/Intelligence/SkillGap/SkillGapRecalculationHandler.cs` (xử lý cả 3 event)
- Create: `Application/UseCases/Competency/Evidence/CreateManualEvidence/…`, `Api/Controllers/CompetencyEvidencesController.cs`
- Modify: `ActivatePositionRequirementSetUseCase.cs`, `UpdateEmployeeUseCase.cs` (Raise event)
- Test: `tests/DigiTalent.Tests/Events/{DomainEventDispatcherTests.cs, ManualEvidenceIntegrationTests.cs}`

- [ ] **6.1 Test dispatcher đỏ (T-EVT-03, T-EVT-04):** dedupe cùng employee; after-commit ném lỗi không làm hỏng `SaveChangesAsync`.
- [ ] **6.2 Dispatcher** theo spec §6.1: nếu queue có event → `Database.IsRelational()` thì mở transaction (nếu chưa có) → save #1 → handler (tối đa 3 vòng) → save #2 → commit → chạy after-commit (try/catch + `ILogger`).
- [ ] **6.3 Handler** `SkillGapRecalculationHandler`: dùng `SkillGapRunService.StageRunAsync(…, SYSTEM)`; bỏ qua nhân viên không đủ điều kiện (không throw); stage `Notification` row; enqueue push `INotificationSender.SendNotificationToUserAsync` sau commit. Activation: giới hạn 500 nhân viên.
- [ ] **6.4 `CreateManualEvidenceUseCase`** theo spec §6.3 (supersede, upsert profile, audit, raise). Bắt `DbUpdateConcurrencyException` / unique violation → `ConflictException`.
- [ ] **6.5 Raise event** trong Activate và UpdateEmployee (chỉ khi `JobPositionId` đổi). PR riêng nhỏ cho `UpdateEmployeeUseCase` để HoangNT review.
- [ ] **6.6 Integration test Postgres (T-EVT-01, T-EVT-02)** trong collection `PostgresIntegration`.
- [ ] **6.7 Kiểm tay:** mở FE bằng `employee@` (đang kết nối SignalR), dùng `hr@` gọi manual evidence C3 = 2 → nhận thông báo, radar cập nhật sau refetch.
- [ ] Commit `feat(intelligence): S3-T018 domain events recalculate skill gap`. PR → QuangNV.

### Task 7: Hoàn thiện test + coverage (S3-T020)

- [ ] Rà test matrix spec §10: đủ các T-SG, T-REC, T-EVT, T-ACT, T-MIG (≥ 25 case, tối thiểu 15).
- [ ] `dotnet test --collect:"XPlat Code Coverage"` → report (reportgenerator) cho namespace `Services.Intelligence` + `UseCases.Intelligence`: ≥ 85%. Đính kèm số liệu vào PR.
- [ ] Đảm bảo CI `backend-ci.yml` xanh (đã có service Postgres).
- [ ] Commit `test(intelligence): S3-T020 skill gap and recommendation coverage`. PR → QuyTD.

### Task 8: Quy chế thi lại & hiển thị đáp án (S3-T024)

**Files:**
- Create: `Application/Services/Assessment/{AssessmentRetryPolicy.cs, AnswerReviewPolicy.cs}`
- Test: `tests/DigiTalent.Tests/Assessment/{AssessmentRetryPolicyTests.cs, AnswerReviewPolicyTests.cs}`
- Modify (nếu engine thi đã có): use case bắt đầu attempt / xem kết quả; FE modal số lượt còn lại + đếm ngược

- [ ] **8.1 Test đỏ (T-RET-01..03)** → code 2 policy thuần theo spec §7.2 → xanh.
- [ ] **8.2 Ngày 09/10 kiểm tra:** use case start/submit attempt của team đã merge chưa?
  - Có → gọi policy, map kết quả sang `ConflictException` có `retryAvailableAt`; FE modal + countdown.
  - Chưa → bàn giao SQL v2.4 + migration + policy + test; ghi rõ trong PR và Jira phần tích hợp chuyển sang Sprint 4.
- [ ] Commit `feat(assessment): S3-T024 retry and answer review policies`. PR → QuangNV.

### Task 9: Report 3 + demo Sprint 3 (S3-T025)

- [ ] Report 3: NF-01 (công thức §4, ví dụ golden §4.5), recommendation (§5), cơ chế event (§6), UC-23/UC-24; ghi rõ NF-02/NF-03 để Sprint sau.
- [ ] Rà khớp tên bảng/cột/endpoint giữa Report 3, SQL v2.4 và Swagger.
- [ ] Cập nhật Report 4 cho SQL v2.4 (2 cột `assessments`, `learner_profiles`).
- [ ] Cập nhật `CLAUDE.md` / `DEVELOPER_GUIDE` phần đã cũ (số permission, SignalR, tests, domain events).
- [ ] Kịch bản demo (dùng seed): HR tính gap `employee@` → radar + 3 gap → gợi ý K3 > K2 > K1 → HR ghi nhận C3 = 2 → employee nhận thông báo, gap giảm, gợi ý K2 biến mất.
- [ ] Commit `docs: S3-T025 update report 3 for skill gap engine`.

---

## Definition of Done Sprint 3

- [ ] Toàn bộ AC trong spec §9 pass (AC-RET-* được phép chỉ pass ở mức policy nếu engine thi chưa có — ghi rõ).
- [ ] `dotnet build` 0 warning; `dotnet test` xanh cả local (có Postgres) và CI; coverage Intelligence ≥ 85%.
- [ ] `npm run build`, `npm run lint`, `npm test` xanh.
- [ ] Migration chạy được trên DB trắng và DB dev cũ; seed idempotent.
- [ ] Jira cập nhật theo spec §3.1; Report 3/4 khớp code.
- [ ] Demo end-to-end chạy trên máy demo trước buổi review.
