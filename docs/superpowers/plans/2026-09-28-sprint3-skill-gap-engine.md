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

- [x] **4.1** `services/intelligence.service.ts` (`skillGapService`), `hooks/use-skill-gaps.ts`, `lib/competency-levels.ts` (nhãn Basic/Intermediate/Advanced + dịch mã lỗi). Cài `recharts` 3.10.1 (hỗ trợ React 19).
- [x] **4.2** `SeverityBadge`, `CompetencyRadarChart` (< 3 năng lực → bar chart), `SkillGapKpiCards`, `SkillGapTable`, `SkillGapDetailView`, `SkillGapDetailDrawer`, `BatchResultPanel`; test FE-01, FE-02.
- [x] **4.3** `MyCompetencyProfilePage`: tab Skill gap (skeleton / error + retry / empty / dữ liệu) + tab Recommended courses (placeholder đến Task 5). Test FE-03.
- [x] **4.4** `SkillGapPage`: lọc vị trí + phòng ban (ẩn với DM — API đã tự giới hạn phòng), tìm kiếm, drawer chi tiết + Recalculate, "Recalculate all" (ẩn nếu không có quyền) + panel danh sách bị bỏ qua. Sidebar: bỏ EMPLOYEE khỏi mục Team Skill Gap (đã có My Competency Profile).
- [ ] **4.5** *(Hoãn)* Radar tuyến learner — dữ liệu demo learner dùng thang 6 mức, cần chuyển sang thang 3 mức trước (xem spec §8.2).
- [ ] **4.6** *(Should — chưa làm)* Heatmap năng lực × nhân viên.
- [x] `npm run build` ✅, oxlint file mới ✅, `npm test` 76/76 ✅ (1 lần chạy toàn bộ bị lỗi khởi động môi trường thoáng qua, chạy lại xanh). Commit `feat(intelligence): S3-T016 skill gap pages`.
- [ ] **Kiểm tra tay trên trình duyệt (1280px / 768px) — CHƯA LÀM:** máy dev hết bộ nhớ commit (31,5/32,6 GB do các dev server khác) nên Vite/API không khởi động được. Làm lại khi máy trống. PR → VietTN.

### Task 5: Course Recommendation (S3-T017)

**Files:**
- Create: `Application/Services/Intelligence/Recommendation/{CourseRecommender.cs, RecommendationModels.cs, RecommendationWeightsProvider.cs}`
- Create: `Application/UseCases/Intelligence/Recommendation/GetCourseRecommendations/…`
- Create: `Api/Controllers/RecommendationsController.cs`
- Modify: `MyCompetencyProfilePage.tsx`, `SkillGapDetailDrawer.tsx` (gắn `RecommendationList`)
- Test: `tests/DigiTalent.Tests/Intelligence/{CourseRecommenderTests.cs, GetCourseRecommendationsUseCaseTests.cs}`

- [x] **Chuẩn bị (29/09):** chốt 10 điểm mơ hồ vào spec §5.6 (R1–R10) và thêm AC-REC-07/08 trước khi code.
- [x] **5.1 Test golden đỏ:** `CourseRecommenderTests` — 15 case (golden §5.3, breakdown theo điểm, loại COMPLETED, không nâng được bậc, năng lực đã đạt, entry level ×3, PRIMARY làm cơ sở entry, coverage_weight ghi đè, score 0 bị loại, reasons/explanation, "Not confirmed", tie-break + limit, trọng số tùy chỉnh).
- [x] **5.2 `CourseRecommender`** (thuần) + `CompetencyLevelLabels`; explanation **tiếng Anh** (R4).
- [x] **5.3 `RecommendationWeightsProvider`:** bản active mới nhất; thiếu/thừa component, trọng số âm, tổng ≠ 100 → log error + DEFAULT.
- [x] **5.4 Use case + `RecommendationsController`** (`GET api/v1/intelligence/recommendations`): 6 truy vấn cố định (weights ×2, employee, run, gaps, courses+NOT EXISTS version mới hơn, enrollments), không N+1. Test Postgres `RecommendationUseCaseTests` — 9 case (golden, mặc định bản thân, R1 version, R2 enrollment, 3 lý do rỗng + NO_GAP, phạm vi DM, cấu hình trọng số hợp lệ/hỏng).
- [x] **5.5 Hiệu năng + HTTP thật** (DB seed): 20 lần gọi → p50 31 ms, **p95 36 ms**, max 47 ms. Đúng golden (55.00 / 49.17 / 39.25) với cấu hình seed v1; trainer → `NO_SKILL_GAP_RUN`; `limit=0` → 400; employee xem người khác → 404.
- [x] **5.6 FE:** `recommendationService` + `useCourseRecommendations` (invalidate cùng skill gap), component `CourseRecommendations` (xếp hạng, điểm + breakdown, lý do theo năng lực, trạng thái đang học, cảnh báo entry level, 4 empty state theo `reason`, lỗi + retry) gắn vào tab "Recommended courses" và drawer Team Skill Gap (khi có `learning_recommendation.read`). 7 test; FE toàn bộ 83/83, build ✅.
- [x] Review (csharp-reviewer): **Approve**, không CRITICAL/HIGH. Đã sửa 2 góp ý: gộp run + gap và config + items thành 1 truy vấn mỗi cặp (còn 5 truy vấn); component trùng trong cấu hình trọng số → DEFAULT thay vì lỗi 500 (thêm `RecommendationWeightsProviderTests`). Backend 119/119. Commit `feat(intelligence): S3-T017 …`.
- [ ] PR → HoangNT (BE), VietTN (FE) — chưa push.

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

- [x] **Chuẩn bị (29/09):** khảo sát AuditService / DI / UpdateEmployee / FE SignalR → chốt E1–E12 vào spec §6.4 trước khi code (phát hiện: AuditService tự SaveChanges + nuốt lỗi; supersede phải bỏ `is_level_confirming` vì CHECK).
- [x] **6.1 Test pipeline đỏ:** `DomainEventPipelineTests` (InMemory + DI) — gom lô, lưu thay đổi của handler, handler lỗi → không lưu/không push/xóa event, after-commit lỗi không làm hỏng request, chặn vòng lặp 3 vòng, không handler, context không dispatcher.
- [x] **6.2 Pipeline** trong `AppDbContext.SaveChangesAsync` (constructor mới nhận `IDomainEventDispatcher` + `AfterCommitQueue`) + `DomainEventDispatcher` + `AfterCommitQueue`; đổi xung đột ghi đồng thời / unique violation → `ConflictException` (E7).
- [x] **6.3 `SkillGapRecalculationHandler`** (3 event, xử lý theo lô, không state) — snapshot SYSTEM, dòng `notifications` `SKILL_GAP_UPDATED`, push SignalR sau commit; activation giới hạn 500.
- [x] **6.4 `CreateManualEvidenceUseCase`** + `POST api/v1/competency-evidences/manual` (`evidence.create_manual`): supersede (+ bỏ cờ confirming), evidence MANUAL_OVERRIDE, upsert profile (row_version), event, audit sau commit.
- [x] **6.5 Raise event** trong `ActivatePositionRequirementSetUseCase` và `UpdateEmployeeUseCase` (+5 dòng, chỉ khi vị trí đổi) — cần HoangNT review phần `UpdateEmployee`.
- [x] **6.6 Integration test Postgres với DI thật** (`SkillGapEventIntegrationTests`, 7 case): xác nhận → snapshot + notification + audit + push 1 lần; xác nhận lại → supersede + row_version; handler lỗi → **rollback thật**, không push; nhân viên INACTIVE → 400; kích hoạt v2 → tính lại mọi analyst ACTIVE; đổi vị trí → tính lại; ghi đồng thời → 409. Backend 132/132.
- [x] **6.7 Kiểm tay qua HTTP** (DB seed): HR ghi nhận Information security = 2 cho `employee@` → gap 3 → 2, coverage 47.50 → 72.50, `generatedBy=SYSTEM`, SEC-BASIC biến mất khỏi gợi ý; manager → 403; level 4 → 400; có dòng notification + audit. *Chưa kiểm được realtime trên FE: FE chưa có client SignalR (E9).*
- [x] Review (csharp-reviewer, kèm bảo mật): **Block** do 1 CRITICAL — đã sửa toàn bộ: (1) dịch lỗi xung đột trong DbContext làm hỏng vòng thử lại của `LoginUseCase` → chuyển sang middleware; (2) event trong transaction ngoài làm mất push âm thầm → chặn tường minh + thêm `ExecuteInTransactionAsync`; (3) `ChangeTracker.Clear()` khi lưu lỗi; (4) chặn tự xác nhận năng lực (403). Chạy lại suite lộ **bug Sprint 2** ở Activate (vi phạm unique index ngẫu nhiên) → sửa + test hồi quy 5 lần kích hoạt liên tiếp. Backend 135/135, ổn định 3 lần chạy. Commit `feat(intelligence): S3-T018 …`.
- [ ] PR → QuangNV; HoangNT review phần `UpdateEmployeeUseCase` (chưa push).

### Task 7: Hoàn thiện test + coverage (S3-T020)

- [x] Rà test matrix spec §10: đủ T-SG, T-REC, T-EVT, T-ACT, T-MIG — tổng backend **156 test** (Sprint 3 thêm ~95), FE 83.
- [x] Coverage (`--collect:"XPlat Code Coverage"`, cobertura, gộp theo file): **Intelligence 97.4% line / 91.3% branch** (trước khi bổ sung 91.7% / 80.5%); events + manual evidence + scope 98.9% / 90.6%. Bổ sung 21 test cho nhánh chưa phủ: validator, cấu hình hỏng, giới hạn 500 (batch + activation), so với bộ tiêu chuẩn khác, bộ lọc list/batch, snapshot thiếu config, rollback `ExecuteInTransactionAsync`.
- [x] **Bug tìm được nhờ lấp coverage:** (1) `requirementSetId` (so với vị trí khác) tạo snapshot **rỗng** — không nạp dòng yêu cầu của bộ được chọn → báo đạt 100% sai; (2) snapshot jsonb thiếu `config` → NullReference (500). Đã sửa + có test hồi quy.
- [ ] CI `backend-ci.yml`: có sẵn service Postgres + biến môi trường; xác nhận xanh khi push (chưa push).
- [x] Commit `test(intelligence): S3-T020 …` (kèm 2 bản sửa lỗi). PR → QuyTD.

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
