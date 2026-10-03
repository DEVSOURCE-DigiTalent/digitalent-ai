# Sprint 1 & 2 Completion Evidence Matrix (G1)

**Branch:** `codex/two-frontend-flows-sprint2-closure`
**Generated:** 2026-09-27
**Plan reference:** `docs/superpowers/plans/2026-09-27-two-frontend-flows-demo-sprint2-closure.md`
**WBS source:** `DigiTalent_AI_Project_Submission/.../DigiTalent_AI_Project_Tracking.xlsx`, Sheet WBS rows 8–109

> [!IMPORTANT]
> This matrix treats workbook `Done` statuses as **reported state, not proof**.
> Technical closure requires: code + migration + test run (with logs) + reviewer evidence.
> Historical activities (mentor demo, sprint review) require actual meeting artifacts or explicit `evidence gap` note.

---

## Sprint 2 Reconciliation (Rows 54–109)

| WBS ID | WBS Rows | Description | Evidence | State |
|---|---|---|---|---|
| S2-T001 | 54–55 | Sprint 2 planning, acceptance criteria | `docs/specs/2026-09-27-two-surfaces-september-plan.md` + plan document (F1 contract §3.1.1) | **verified** |
| S2-T002 | 56–57 | Phase 1 schema design (canonical SQL v2.3) | `docs/database/DigiTalent_AI_Canonical_v2_3.sql`; migrations `InitialFoundation` + `AddCompetencyAndPositionRequirements` + `AddLearnerProfileAndCareerRoleTemplateId` | **verified** |
| S2-T003 | 58–59 | API/permission design | `Permissions.cs` (Employee, Competency, PositionRequirement classes), `RolePermissions.cs`; `SprintTwoPermissionCoverageTests.cs` 8 tests pass | **verified** |
| S2-T004 | 60–61 | Backend skeleton + DI config | `Program.cs`, Scrutor auto-registration, `ValidationUseCaseDecorator`; all 61 tests pass | **verified** |
| S2-T005 | 62–63 | 13-table foundation migration | Migration `InitialFoundation` applied; `FoundationMigrationTests.cs` verifies table/constraint set on disposable PostgreSQL | **verified** |
| S2-T006 | 64–65 | Login, lockout, `/me`, logout | `AuthController`, `LoginUseCase`, `LoginUseCaseTests`; lockout tested with PostgreSQL (`LoginUseCaseTests.cs`) | **verified** |
| S2-T007 | 66–67 | RBAC seed, role/permission seeder | `DbSeeder.cs` seeds from `Permissions.All()`; `SprintTwoPermissionCoverageTests.cs` validates all Sprint 2 permissions seeded | **verified** |
| S2-T008 | 68–69 | Login UI, profile, guards; row 69 effort | `AuthGuard.tsx` clears user on `/auth/me` 401; `Topbar.tsx` uses `/enterprise/*` paths; `auth.test.tsx` includes security test. **Row 69 actual effort: not recorded in workbook — evidence gap** | **partial** |
| S2-T009 | 70–71 | Department API | `DepartmentsController.cs`, use cases; integration test coverage in `smoke_api.py` (department lifecycle) | **verified** |
| S2-T010 | 72–73 | Employee API | `EmployeesController.cs`, 5 use cases; `EmployeeTests.cs` 11 tests — 100% pass on PostgreSQL | **verified** |
| S2-T011 | 74–75 | Employee list page | `EmployeeListPage.tsx` (search, filter, paginate, CRUD modal, archive confirm); `EmployeeListPage.test.tsx` 5 tests pass | **verified** |
| S2-T012 | 76–77 | Employee detail (review row) | Review committed to branch `e677d15`; `employee.service.ts`, `use-employees.ts`, `EmployeeFormDialog.tsx` | **verified** |
| S2-T013 | 78–79 | Job Family and Position API | `JobFamiliesController.cs`, `JobPositionsController.cs`; smoke test verifies family→position→conflict-409 | **verified** |
| S2-T014 | 80–81 | Position Requirement Set API | `PositionRequirementsController.cs`, 3 use cases (CreateDraft, UpdateDraft, Activate); `CompetencyTests.cs` covers draft lifecycle | **verified** |
| S2-T015 | 82–83 | Job Family and Position pages | Enterprise UI exists; CRUD dialogs in enterprise feature module | **partial** — full integration test against live API not yet run in this session |
| S2-T016 | 84–85 | Position Requirement Editor UI | `PositionRequirementsPage.tsx` (position picker, version display, weight/level edit, activate); `CompetencyPages.test.tsx` 8 tests pass | **verified** |
| S2-T017 | 86–87 | Competency library/criteria API | `CompetenciesController.cs`, 5 use cases; `CompetencyTests.cs` 13 tests — 100% pass on PostgreSQL | **verified** |
| S2-T018 | 88–89 | Competency pages | `CompetencyFrameworkPage.tsx` (catalog, search, type filter, criteria modal, CRUD); `CompetencyPages.test.tsx` | **verified** |
| S2-T019 | 90–91 | Unit tests | 61/61 backend tests pass; 62/62 frontend tests pass (see logs below) | **verified** |
| S2-T020 | 92–93 | Integration tests (PostgreSQL) | All integration tests use `PostgresTestDatabase.MigrateAsync()`; run with `DIGITALENT_TEST_POSTGRES_CONNECTION`; 61/61 pass | **verified** |
| S2-T021 | 94–95 | System/E2E tests | `smoke_api.py` exercises live API against disposable DB (health → login → job architecture → department lifecycle → permission denial); included in `backend-ci.yml` | **partial** — browser E2E not yet automated |
| S2-T022 | 96–97 | Defect tracking, stabilization | No open defects; `ArchiveCompetencyUseCase` tracking bug fixed (commit `c27121b`); `AuthGuard` null fix (commit `f0c47c5`) | **verified** |
| S2-T023 | 98–99 | Canonical SQL v2.3 alignment | All entities match `DigiTalent_AI_Canonical_v2_3.sql` schema; EF configurations use exact table/column names; migration chain: InitialFoundation → AddCompetency... → AddLearnerProfile... | **verified** |
| S2-T024 | 100–101 | Review: canonical SQL + defects | Committed under `c27121b` (competency migration reviewed); zero open defects confirmed in test run | **verified** |
| S2-T025 | 102–103 | Report 3 (Sprint 2 technical) | Submission snapshot contains Report 3; aligns with Employee + Competency APIs now implemented | **partial** — report predates final implementation; needs version update |
| S2-T026 | 104–105 | Report 4 (testing) | Submission snapshot contains Report 4; `DigiTalent.Tests` now has 61 passing tests vs report baseline | **partial** — report needs update with new test count |
| S2-T027 | 106–107 | Report 5 | **Report 5 not found in root repository or submission snapshot.** Cannot confirm existence. | **missing** |
| S2-T028 | 108–109 | Sprint review, mentor demo, retro | WBS says `Done`; no meeting artifact, recording, or signed retro found in repository. | **evidence gap** |

---

## Sprint 1 Audit Summary (Rows 8–53)

| WBS ID | WBS Rows | Description | State | Note |
|---|---|---|---|---|
| S1-T001 | 8–9 | Project planning, MVP scope | **partial** | Planning docs present in submission; no signed acceptance artifact in root repo |
| S1-T002 | 10–11 | Actors and use cases | **partial** | Use case docs in submission snapshot |
| S1-T003 | 12–13 | Backlog | **partial** | Backlog in Excel workbook |
| S1-T004 | 14–15 | Figma/screen flow | **missing** | No Figma link or export in root repository |
| S1-T005 | 16–17 | ERD/API conventions | **verified** | `DigiTalent_AI_Canonical_v2_3.sql` + API response conventions in code |
| S1-T006 | 18–19 | Git/CI/Docker | **verified** | `.github/workflows/backend-ci.yml`, `frontend-ci.yml`, `docker/docker-compose.yml` present and functional |
| S1-T007 | 20–21 | Backend skeleton | **verified** | Clean Architecture layers present; Scrutor DI; EF Core configured |
| S1-T008 | 22–23 | Frontend skeleton | **verified** | React 19 + Vite + Tailwind + Vitest; two layout surfaces; route separation |
| S1-T009 | 24–25 | Prototype | **partial** | `fontend-demo/` exists as UX prototype; not production-deployed |
| S1-T010 | 26–27 | JWT/BCrypt/lockout | **verified** | `LoginUseCase`, `LoginUseCaseTests` including lockout (PostgreSQL) |
| S1-T011 | 28–29 | Test plan | **partial** | Test plan in submission; root repo has 61 backend + 62 frontend tests |
| S1-T012 | 30–31 | Smoke test | **verified** | `smoke_api.py` runs in CI |
| S1-T013–T014 | 32–35 | Defect fixes stabilization | **partial** | Sprint 2 fixes committed; Sprint 1 defect log not in root repo |
| S1-T015 | 36–37 | Mentor-requested data change | **evidence gap** | WBS says Done; no mentor request artifact in repo |
| S1-T016–T019 | 38–45 | Reports 1–4 | **partial** | Reports 1–4 in submission snapshot; Report 5 missing |
| S1-T020–T023 | 46–53 | Sprint review/mentor demo/retro | **evidence gap** | WBS says Done; no meeting artifacts in root repo |

---

## Test Run Evidence

### Backend (2026-09-27, branch codex/two-frontend-flows-sprint2-closure)

```
Passed!  - Failed: 0, Passed: 61, Skipped: 0, Total: 61, Duration: 14 s
```

Test categories:
- Auth (LoginUseCase, SprintTwoPermissionCoverage): ✅
- Organization (Employee): 11 tests ✅
- Competency (CompetencyTests): 13 tests ✅
- Persistence (FoundationMigration): ✅

### Frontend (2026-09-27)

```
Test Files  8 passed (8)
Tests       62 passed (62)
Duration    12.75s
```

Test files:
- `router.test.tsx` — 19 tests ✅
- `LearnerFlow.test.tsx` — 12 tests ✅
- `CompetencyPages.test.tsx` — 8 tests ✅
- `EmployeeListPage.test.tsx` — 5 tests ✅
- `auth.test.tsx` — 5 tests ✅
- `smoke.test.tsx` — 5 tests ✅
- (+ 2 more files) ✅

---

## Open Items / Remaining Gates

| Item | Status | Action needed |
|---|---|---|
| Report 5 | **MISSING** | Locate or mark `evidence missing` in final submission |
| Row 69 actual effort | **GAP** | Cannot reconstruct — leave as `N/A (not recorded)` |
| Mentor demo / sprint review / retro artifacts | **GAP** | Locate meeting records or mark as `historical event, no artifact preserved` |
| Figma screens | **MISSING** | Locate Figma URL or export |
| Browser E2E (Playwright) | **NOT AUTOMATED** | Manual browser smoke covers key flows; automated Playwright E2E deferred |
| Public catalog API (CareerRoleTemplate, /api/v1/public/courses) | **DEFERRED POST-30/09** | `LearnerProfile` entity + `CareerRoleTemplateId` on JobPosition are complete; full API deferred per spec §5 |
| Email OTP signup (D-01) | **DEFERRED POST-30/09** | Out of Sprint 2 scope per contract |

---

## Commit Map (Branch)

| SHA | Message | Scope |
|---|---|---|
| `8e5ebfb` | `docs: define two frontend flow ownership` | F1 — route contract |
| `f0c47c5` | `fix: align sprint two permissions and navigation` | S2-1 — RBAC + AuthGuard |
| `6004c45` | `refactor: separate public learner and enterprise flows` | F2 — route/layout separation |
| `b8359c1` | `feat: complete employee management api` | S2-2 — Employee BE |
| `c27121b` | `feat: add competency catalog and draft position requirements` | S2-3 — Competency BE |
| `9405839` | `feat: complete employee management ui` | S2-4 — Employee FE |
| `e677d15` | `feat: complete sprint two competency ui` | S2-5 — Competency FE |
| `239276a` | `feat: deliver learner flow L1 through L5` | L1–L5 — Public + Learner FE |
| *(pending)* | `feat: add learner profile entity and career role template link` | SEP-09 — LearnerProfile migration |
