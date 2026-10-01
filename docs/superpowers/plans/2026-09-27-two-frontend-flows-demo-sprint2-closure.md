# Two Frontend Flows, Learner Demo Migration, and Sprint 2 Closure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver two complete frontend flows within the existing React application against the same DigiTalent API, bring the learner experience from `fontend-demo` into production, and verify every WBS item through the end of Sprint 2.

**Architecture:** Keep one production React/Vite source and build in `frontend/`. Maintain distinct Public/Learner and Enterprise route trees, layouts, feature modules and styles while sharing one API client, auth/session handling, typed contracts and relevant UI primitives. `fontend-demo/` remains a UX reference until each learner behavior is replaced by a typed component and a server-owned data flow. Keep one backend and database.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind, Vitest/Testing Library, ASP.NET Core, EF Core, PostgreSQL, Nginx, GitHub Actions.

**Spec:** `docs/specs/2026-09-27-two-surfaces-september-plan.md`, `docs/specs/learner-identity-catalog-contract.md`, and Sprint 1–2 rows 8–109 of `DigiTalent_AI_Project_Submission/DigiTalent_AI_Project_Submission/Backlog/DigiTalent_AI_Project_Tracking.xlsx`. The existing spec's **one frontend build, two experiences** decision is retained and made concrete here. The workbook is the scope source, while the running repository and test results determine technical completion.

## Global Constraints

- One frontend source/build in `frontend/`, with two feature and layout boundaries; one ASP.NET Core API and one PostgreSQL database. Keep `fontend-demo/` out of production imports and bundles.
- Preserve existing enterprise URLs and API routes during migration; use router navigation between the two flows and a safe internal `returnTo` after login.
- Public queries expose only published platform content. Tenant data, learner results and progress are filtered by the backend using authenticated identity, never by frontend parameters alone.
- Do not move demo login, `localStorage` learning progress, certificate generation or recommendation calculations into production as sources of truth.
- Write failing tests before implementation. Review each vertical slice, run its relevant gates, commit with a conventional message, and do not push unless separately instructed.
- Preserve user-owned untracked files in `DigiTalent_AI_Project_Submission/`; use them as evidence/reference only. Do not rewrite historical `Done` or actual-effort cells in the workbook without documentary evidence and an explicit tracker update task.
- Through Sprint 2 the WBS contains 51 implementation tasks plus 51 corresponding review rows (Sprint 1: 23+23; Sprint 2: 28+28), all currently labelled `Done`; **no acceptance-criteria or dependency columns exist**. A row closes here only when evidence and review are recorded in the reconciliation table below.

## Review Focus

1. A learner opens a bookmarked `/learn/courses/:id` or refreshes the browser: the SPA route resolves without an enterprise shell or 404. Test in F2/G2.
2. A login started on an enterprise route returns only to a safe internal `/enterprise/*` path, while an anonymous learner can browse public content. Test in F2/G2.
3. Tenant A or an independent learner requests Tenant B employee, position requirement or private course data: the API returns 403/404 and no data. Test in S2-2/S2-3/L1/L3.
4. A learner changes target, finishes a lesson or retries a diagnostic: persisted state survives reload and another browser session without duplicate enrollment/attempts. Test in L2/L3/L4.
5. A WBS row through Sprint 2 says `Done` but the only artifact is a placeholder, a test that never ran, or a report without review evidence: reconciliation stays `unverified` and release gate fails. Test in G1.

## Baseline and completion rule

As inspected on 27/09/2026, the main repo has real Auth, Department, Job Family/Position APIs and a foundation migration. Employee, Position Requirement and Competency APIs are missing; their enterprise pages are placeholders. Public/Learner route groups exist but `/learn` and `/careers` are placeholders. `fontend-demo` is an independent JS/Vite mock with its own state, sample catalog, CSS and local storage. The submission bundle under `DigiTalent_AI_Project_Submission/.../App & Source Code/` contains a separate source snapshot; assess it as reference, **do not substitute it for the runnable root repository**.

The workbook's Sprint 1–2 WBS rows 8–109 all say `Done`, including review rows. Row 69 has no recorded `Actual Effort`. The root repository cannot currently substantiate all those statuses. Treat `Done` as a reported state, not as proof. Technical closure requires the relevant code, migration, test run, API/FE integration, and reviewer evidence; historical activities such as mentor demo require the actual meeting/report artifact or a transparent `evidence missing` note. Do not fabricate a past event.

### Sprint 1 prerequisite audit

Rows 8–53 cover 23 work items and 23 reviews: planning/MVP scope, actors/use cases/backlog, Figma/screen flow, ERD/API conventions, Git/CI/Docker, backend/frontend skeleton, prototype, JWT/BCrypt/lockout, test plan/smoke/fixes, mentor-requested data change, Reports 1–5 and sprint review. G1 must map each of these to a current artifact or an historical review record before claiming completion *through* Sprint 2. Where a Sprint 1 artifact is superseded by Sprint 2 code, link both the historical deliverable and the current replacement. Missing Figma, Report 5, mentor approval or review evidence is reported as missing; this plan does not infer it from a later build.

### Sprint 2 reconciliation matrix

| WBS task / rows (work + review) | Present evidence | Remaining gate before *verified* |
| --- | --- | --- |
| S2-T001–T004 / 54–61: planning, acceptance, Phase 1 schema, API/permission design | WBS and documents exist; foundation schema exists | Link signed/reviewed acceptance, schema and API matrix to each row; reconcile contract against runtime routes in G1. |
| S2-T005 / 62–63: 13-table foundation migration | `InitialFoundation`, entity/configuration and `AppDbContext` exist | Apply on a disposable PostgreSQL database and assert table/constraint set in G2. |
| S2-T006 / 64–65: login, lockout, `/me`, logout | API/use cases exist | Confirm lockout with PostgreSQL and define/logout behavior accurately; WBS does **not** itself require refresh tokens. |
| S2-T007–T008 / 66–69: RBAC seed, login/profile/guards | RBAC/auth exists, but frontend route permissions exceed backend seed/constants | Align route/permission registry, check profile and redirects; capture row 69 effort discrepancy without inventing hours. |
| S2-T009 / 70–71: Department API | CRUD/archive exists | PostgreSQL/API test with org scope and permission. |
| S2-T010–T012 / 72–77: Employee API and list/detail | Entity/FE service exist; controller/use cases and real page absent | Implement BE + FE vertical slice S2-2, S2-4, including review. |
| S2-T013 / 78–79: Job Family and Position API | Controllers/use cases exist | Test two-tenant isolation, archive guards and FE contract on disposable DB. |
| S2-T014/S2-T016 / 80–81, 84–85: Position Requirement Set API/editor | Placeholder editor; no runtime entity/API | Implement versioned draft set, editor and tests in S2-3/S2-5. |
| S2-T015 / 82–83: Job Family and Position pages | Real list/dialogs exist | Test read/write/empty/error and role restrictions against current API. |
| S2-T017–T018 / 86–89: Competency library/criteria API and pages | FE page placeholder; no runtime competency module | Implement BE + FE slice S2-3/S2-5. |
| S2-T019–T021 / 90–95: unit, integration, system tests | Unit tests exist; PostgreSQL integration gate cannot pass without DB | Add missing-feature tests, run full DB/API/browser matrix, save logs in G2. |
| S2-T022–T024 / 96–101: defects, stabilization, canonical SQL v2.3 | Foundation fixes and canonical script exist; defect log empty | Compare runtime schema with canonical scope, resolve actual defects, record zero-open-defect decision and review evidence in G1/G2. |
| S2-T025–T027 / 102–107: Reports 3/4/5 | Report 3/4 and test documents present in submission snapshot | Check sections against implemented behavior and tests; locate Report 5 or record missing artifact; obtain actual review evidence in G1. |
| S2-T028 / 108–109: sprint review, mentor demo, retro | WBS reports `Done` | Link meeting/demo/retro artifacts; if unavailable, mark evidence gap rather than recreating a historical sign-off. |

## Target source and URL ownership

```text
frontend/                    # one production app and build
  src/app/routes/            # public, learner, enterprise route trees
  src/app/layouts/           # distinct public, learner, enterprise shells
  src/features/public/       # landing, discovery, verification
  src/features/learner/      # target, diagnostic, path, classroom, progress, tasks
  src/features/enterprise/   # enterprise-owned modules; migrate incrementally
  src/shared/                # API/auth/types/UI truly used across flows
fontend-demo/                # UX reference and regression examples; never deployed
backend/                     # one API, one DB
```

`frontend/src/app/router.tsx` composes the three route groups already present. `PublicLayout`, `LearnerLayout` and `EnterpriseLayout` retain visual independence; `AuthGuard` protects only actions requiring identity, and enterprise routes require organization context and permission. `frontend/src/shared/` will own `ApiResponse`, API transport, auth/session and common DTOs once moved incrementally from existing `services/`, `hooks/` and `types/`. Feature-specific services/hooks stay with their feature. Nginx keeps its single SPA fallback and `/api`/`/hubs` proxy. The build must contain no import from `fontend-demo/`.

### Demo-to-production ownership map

| Demo source | Production destination | Rule |
| --- | --- | --- |
| `LandingPageView.jsx`, `Navbar.jsx` | `frontend/src/features/public/landing/` and `PublicLayout` | Recreate visual hierarchy/responsiveness; public data from API. |
| `PersonalWorkspace.jsx`, `LearningPathView.jsx`, `CompetenceMatrixView.jsx` | learner dashboard, target, path, competency views | Split large demo component into typed, route-addressable views; render server snapshots. |
| `DiagnosticTestModal.jsx`, `utils/competenceEngine.js` | diagnostic UI + backend versioned scoring/roadmap use case | Port visuals and regression examples; backend calculates/stores result. |
| `CourseOverviewModal.jsx`, `CourseOutlineView.jsx`, `ClassroomView.jsx`, `CoursePlayerModal.jsx` | catalog detail and classroom routes | Lesson access/progress comes from API; no simulated completion. |
| `CertificateModal.jsx`, `PublicVerificationView.jsx`, `utils/demoCompletion.js` | certificate/result view and public verify | Reuse visuals only; only server-issued codes may verify. |
| `PracticalTaskModal.jsx` | learner task/evidence slice L5 | Submission and evaluation use a real API; no mock completion. |
| `data/courseCatalog.js`, `curriculumLessons.json`, `data/marketingData.js` | seed/import review for platform catalog | Validate ownership, rights, publish status and content before database import; fixtures only in tests. |
| `utils/demoAccess.js`, `enterpriseDemo.js`, demo login and `localStorage` stores | no production destination | Replace with existing backend auth/tenant scope and learner persistence. |
| `index.css`, `workspaceRefresh.css`, `learningFlow.css` | scoped learner tokens/components | Remove global selectors that could affect the enterprise build. |

## Work packages and execution order

The two tracks may run concurrently after F1: **Sprint 2 closure** (S2 tasks) and **learner-flow delivery** (F/L tasks). G1/G2 integrate both. An agent owns only its listed files; others must not revert that work. Coordinator owns shared configuration, migrations, status and commits. Every worker sends changed paths, test command/result and known limits before the coordinator commits. Use fresh reviewer agents at each slice gate.

### Task F1: Ratify route ownership and shared contracts

**Owner:** architect/coordinator. **Depends on:** none.
**Files:** Update `docs/specs/2026-09-27-two-surfaces-september-plan.md` and `docs/specs/learner-identity-catalog-contract.md` only for verified conflicts; create a short route/feature ownership section in the existing spec rather than another top-level contract file.
**Interfaces:** Specify route ownership, `ApiResponse<T>`, `getSafeReturnTo(raw: string | null): string`, session key/expiry semantics, public vs learner vs enterprise API visibility, and `/login` behavior.

- [ ] Write contract examples: `/enterprise/organization/positions` uses enterprise layout; `/careers/slug` and `/learn/path` use public/learner layout; `/api/v1/*` goes to the shared API; malicious `returnTo` is rejected.
- [ ] Review current auth/API DTO and Nginx/Compose/CI paths; document route and feature ownership, staged migration and rollback.
- [ ] Keep the existing one-build decision and have a reviewer check auth, route and tenant boundaries.
- [ ] Commit `docs: define two frontend flow ownership`.

### Task S2-1: Reconcile Sprint 2 acceptance and RBAC

**Owner:** BE auth/permission worker; coordinator owns WBS evidence. **Depends on:** F1 contracts.
**Files:** `backend/src/DigiTalent.Domain/Constants/Authorization/Permissions.cs`, role/permission seeder, affected controller authorization, `frontend/src/app/routes/enterprise.routes.tsx`, `frontend/src/lib/sidebar-config.ts`; tests alongside authorization modules.
**Interfaces:** One permission list shared as a documented API contract. Do not grant missing features merely to make a link visible; hide or mark unavailable until its API/UI passes.

- [ ] Add failing test that every visible enterprise route/menu permission is seeded, and a user without a permission cannot call its API.
- [ ] Run test to confirm missing `employee.*`, `competency.*` and `position_requirement.*` contracts fail.
- [ ] Add only permissions backed by this plan's implemented endpoints; synchronize menu, route guard and backend policy; fix `Topbar` destinations and dead menu links. Test that a failed `/auth/me` never renders guarded enterprise content even when an expired token remains in browser storage.
- [ ] Run authorization tests and enterprise build; review privilege escalation and cross-tenant cases.
- [ ] Commit `fix: align sprint two permissions and navigation`.

### Task S2-2: Employee CRUD backend

**Owner:** BE organization worker. **Depends on:** S2-1 permission names, foundation migration.
**Files:** `backend/src/DigiTalent.Application/UseCases/Organization/Employees/**`, `backend/src/DigiTalent.Api/Controllers/EmployeesController.cs`, employee validators/DTOs, EF configuration only if a required constraint is absent; `backend/tests/DigiTalent.Tests/Organization/Employees/**`.
**Interfaces:** `GET/POST /api/v1/employees`, `GET/PUT/DELETE /api/v1/employees/{id}` using existing response/pagination/archive conventions; organization comes from token. Archive must retain history and respect existing assignment rules.

- [ ] Write failing tests for list/search/page, create/update/archive/detail, duplicate employee identifier, invalid department/position, permission denial and Tenant A vs B.
- [ ] Confirm tests fail for missing controller/use cases; implement DTO/validator/use cases and minimal migration only if needed.
- [ ] Run unit and disposable-PostgreSQL API tests; review authorization and concurrency behavior.
- [ ] Commit `feat: complete employee management api`.

### Task S2-3: Competency library and versioned position requirements backend

**Owner:** BE competency worker. **Depends on:** S2-1, JobPosition API. **Sequence:** competency catalog before requirement set.
**Files:** new focused entities/configurations/migration under `backend/src/DigiTalent.Domain/Entities/Competency/` and `backend/src/DigiTalent.Infrastructure/Persistence/`; use cases under `backend/src/DigiTalent.Application/UseCases/Competency/`; `CompetenciesController.cs`, `PositionRequirementsController.cs`; tests under `backend/tests/DigiTalent.Tests/Competency/`.
**Interfaces:** Catalog CRUD/read with competency code, category, level and measurable criteria; requirement sets attached to an existing tenant JobPosition with draft version, requirement rows and publish/replace semantics. Define exact DTO/route schema in F1 before FE S2-5 starts. WBS says requirement API is a **draft**; do not silently promote it to final approved standards.

- [ ] Write failing tests for unique competency codes, criteria/level validation, draft creation/edit, read by position, invalid or archived position, two-tenant isolation and version immutability after publish.
- [ ] Implement schema/migration and use cases in small commits (`feat: add competency catalog`, then `feat: add draft position requirements`); keep canonical SQL mapping explicit.
- [ ] Apply migration on fresh and upgraded disposable databases; run API tests and review tenant scope.

### Task S2-4: Employee list and detail UI

**Owner:** enterprise FE worker. **Depends on:** S2-2 DTO. **Files:** `frontend/src/features/organization/pages/EmployeeListPage.tsx`, feature-local list/detail/form components/tests, `frontend/src/services/employee.service.ts`, `frontend/src/hooks/use-employees.ts` as necessary.
**Interfaces:** Use only S2-2 endpoints and DTO; maintain current enterprise route `/enterprise/organization/employees`.

- [ ] Write failing UI tests for server list/search/empty/error, detail, create/edit validation, archive confirmation and read-only user.
- [ ] Replace placeholder with API-backed list/detail/form; remove dead controls and invalidate queries after mutation.
- [ ] Run FE tests/lint/build and browser smoke against disposable API; review accessibility and permission state.
- [ ] Commit `feat: complete employee management ui`.

### Task S2-5: Competency catalog and requirement editor UI

**Owner:** enterprise FE competency worker. **Depends on:** S2-3 DTO. **Files:** `frontend/src/features/competency/pages/CompetencyFrameworkPage.tsx`, `PositionRequirementsPage.tsx`, feature-local components/services/hooks/tests.
**Interfaces:** Catalog and draft-set API from S2-3; editor displays draft status/version and never mutates a published version in place.

- [ ] Write failing UI tests for catalog list/filter, criteria validation, position selection, draft create/edit, unsaved changes, publish/replace view and permission denial.
- [ ] Replace both placeholder pages with API-backed UI; show optimistic state only if server save succeeds.
- [ ] Run FE tests/lint/build and browser flow; review keyboard access and errors.
- [ ] Commit `feat: complete sprint two competency ui`.

### Task F2: Complete route, layout and feature separation in the existing app

**Owner:** frontend platform worker. **Depends on:** F1.
**Files:** `frontend/src/app/router.tsx`, `frontend/src/app/routes/{public,learner,enterprise}.routes.tsx`, `frontend/src/app/layouts/{Public,Learner,Enterprise}Layout.tsx`, `frontend/src/services/api-client.ts`, `frontend/src/features/auth/auth-redirect.ts`; focused route/auth tests, existing CI/dev docs only where needed.
**Interfaces:** Public owns `/`, `/careers/*`, `/verify`; learner owns `/learn/*`; enterprise owns `/enterprise/*`; `/login` returns safely to the originating route. All use one API client and session. `Outlet`/nested route ownership is defined centrally, not nested `<Routes>` inside a catch-all page.

- [ ] Write failing route tests for direct `/learn/courses/:id` load/refresh, correct layout, anonymous catalog access, enterprise guard, safe login return and logout from either flow.
- [ ] Replace learner catch-all and nested `<Routes>` with named child routes; preserve enterprise routes and legacy redirects. Keep `PublicLayout`/`LearnerLayout` CSS scoped and separate from `MainLayout`.
- [ ] Make production API base same-origin `/api/v1` with the existing Vite dev proxy; ensure `AuthGuard` does not render children after `/auth/me` rejects.
- [ ] Run one FE test/lint/build and Nginx SPA fallback smoke. Review import graph to prove `frontend/src` imports no `fontend-demo` code; commit `refactor: separate public learner and enterprise flows`.

### Task L1: Public landing and career/course discovery from demo design

**Owner:** learner public FE worker and BE public catalog worker in separate commits. **Depends on:** F2; approved learner contract.
**Files:** `frontend/src/features/public/{landing,career-catalog,course-catalog}/**`; backend `CareerRoleTemplate` and platform course catalog entity/read model, migration, public controllers/use cases/tests.
**Interfaces:** `GET /api/v1/public/career-roles`, `GET /api/v1/public/courses`, detail by stable slug/id; only platform-owned published records. Seed/import review of demo curriculum is separate from endpoint delivery.

- [ ] Write failing backend tests for published-only, pagination/filter, unknown slug and private tenant content exclusion; FE tests for landing-to-career-to-course navigation, loading/empty/error.
- [ ] Implement backend catalog and FE service/components based on `LandingPageView` visual hierarchy; validate demo content before importing platform seed records.
- [ ] Run API + FE tests and anonymous browser path; commit BE and FE slices separately.

### Task L2: Learner identity, target and diagnostic

**Owner:** BE learner worker and learner FE worker in separate commits. **Depends on:** L1 and existing auth.
**Files:** backend learner profile/verification/target/diagnostic entities, migration, use cases/controllers/tests; `frontend/src/features/learner/{account,target,diagnostic,path}/**`.
**Interfaces:** Approved email signup plus verification, `/api/v1/learner/me/targets`, server-versioned diagnostic result/path. `role` for authorization and selected `targetRoleId` remain different fields. Formalize diagnostic question/rule version and expected output from demo engine regression tests before implementing.

- [ ] Write failing tests for unverified signup, anonymous write denial, own-target change, invalid/unpublished target, deterministic scoring, stale rule version and cross-user access.
- [ ] Implement backend persistence/scoring and frontend typed form/path views using `PersonalWorkspace`, `DiagnosticTestModal` and `LearningPathView` as visual references.
- [ ] Run API/FE tests and browser flow from landing through saved target and diagnostic; commit BE and FE slices separately.

### Task L3: Course, classroom and progress

**Owner:** BE learning worker and learner FE worker in separate commits. **Depends on:** L1/L2.
**Files:** backend course/lesson/enrollment/progress models, migration, services/controllers/tests; `frontend/src/features/learner/{course,classroom,progress}/**`.
**Interfaces:** Public preview is distinct from enrolled lesson content; progress belongs to authenticated learner profile. Enterprise assignment remains attached to employee and maps to the same learner progress without overwriting a personal path.

- [ ] Write failing tests for visibility, enrollment idempotence, private course denial, lesson completion authorization, progress persistence and combined assigned/personal labels.
- [ ] Port CourseOverview/Outline/Classroom visual interactions as small typed components; replace demo state and local storage writes with API calls.
- [ ] Run API/FE tests and browser reload/second-session E2E; commit BE and FE slices separately.

### Task L4: Results, certificate verification and demo parity

**Owner:** learner FE worker + BE certificate worker. **Depends on:** L2/L3.
**Files:** learner result/certificate views and tests; backend issued certificate/public verification API only if issuance criteria and signing/expiry/revocation rules have been agreed in a reviewed contract.
**Interfaces:** A displayed certificate is either server-issued and verifiable or explicitly labelled a non-credential preview. `demoCompletion.js` never becomes a production issuer.

- [ ] Write failing tests for invalid/revoked/expired code, private data exclusion and result rendering; document issuance criteria before BE code.
- [ ] Port only the relevant certificate/result visuals, back them with server responses, and keep practical-task evidence behind a real API or outside the completion claim.
- [ ] Run anonymous verification and learner result E2E; commit verified slice. Record any deferred capability explicitly; do not call demo parity complete while it is still simulated.

### Task L5: Practical task and evidence workflow

**Owner:** BE evidence worker and learner FE worker in separate commits. **Depends on:** L3; contract for submissions/evaluation approved by enterprise training owner.
**Files:** backend task assignment/submission/evaluation entities, migration, use cases/controllers/tests; `frontend/src/features/learner/tasks/**`; enterprise reviewer UI under `frontend/src/features/task/**` only for the minimum evaluation path.
**Interfaces:** The learner sees only their assigned tasks, submits evidence linked to their enrollment/lesson, and receives a server-authored evaluation. Manager/trainer evaluation is tenant/department scoped; evidence references are immutable after submission or follow an explicit resubmission version.

- [ ] Write failing tests for own assignment, evidence validation, duplicate/resubmission rule, cross-tenant denial, evaluator scope and learner result visibility.
- [ ] Port `PracticalTaskModal` into a typed page/dialog backed by the API; supply the smallest enterprise evaluator action necessary for a complete loop.
- [ ] Run DB/API/FE tests and browser flow learner submit → authorized reviewer evaluates → learner views result; commit BE and FE slices separately.

### Task G1: Reconcile every WBS and review row

**Owner:** coordinator/documentation reviewer. **Depends on:** S2-1 through S2-5; may audit historical artifacts earlier.
**Files:** create `docs/reports/2026-09-27-through-sprint-2-evidence-matrix.md`; update existing Sprint 1–2 documentation/reports only if owner authorizes the intended submission artifact edit. Read the workbook; do not silently edit it.
**Interfaces:** One record per S1-T001–T023 and S2-T001–T028 with WBS work/review row numbers, claim, code/doc/test link, reviewer, evidence state (`verified`, `partial`, `missing`), and remaining action. Include row 69 missing actual effort and the actual location or absence of Report 5, defect log, meeting/demo/retro sign-off.

- [ ] Write a checker that counts 51 task IDs and 102 WBS rows (8–109), rejects missing evidence/reviewer state and fails if a placeholder is cited as implementation.
- [ ] Populate matrix from root repo, test logs, submission reports and meeting materials; separate historical evidence from newly implemented remediation.
- [ ] Have a reviewer inspect each Sprint 1 and Sprint 2 row and any discrepancies between workbook and running code; keep unsupported historical claims visible.
- [ ] Commit `docs: reconcile sprint two completion evidence`.

### Task G2: Full release gate and closeout

**Owner:** QA/integration worker and coordinator. **Depends on:** F2, S2-1–S2-5, L1–L5, G1.
**Files:** tests and CI scripts under existing backend/frontend test locations; update evidence matrix with run IDs/results.
**Interfaces:** A disposable PostgreSQL database, fresh migration and upgrade test, one frontend build, deployed Nginx route test, browser tests for enterprise HR and public/learner journeys.

- [ ] Run backend unit + integration tests with `DIGITALENT_TEST_POSTGRES_CONNECTION`; require all tests pass and nonzero count. Do not mark DB gate passed merely because unit tests pass.
- [ ] Run frontend lint/build/unit and E2E for enterprise Department/Employee/Job/Competency/Requirements plus learner landing/target/diagnostic/classroom/progress/practical task/verify.
- [ ] Test role/tenant matrix, archived references, expired session, deep-link reload, responsive layouts and unauthorized public/private content. Record defects; fix with owning worker and rerun affected gate.
- [ ] Produce a release checklist with actual test logs, schema version, open defects, WBS row evidence and reviewer decision. Claim completion through Sprint 2 only if every required work/review row is `verified`; otherwise report the exact open rows.
- [ ] Commit `test: gate two flows and sprint two closure`; do not push.

## Suggested parallel ownership and merge order

| Lane | Exclusive ownership | Can begin | Merge after |
| --- | --- | --- | --- |
| A: BE organization | Employee use cases/controller/tests | F1 permission contract | S2-1 |
| B: BE competency | Competency + requirement schema/use cases/tests | F1, existing JobPosition | Own migration reviewed; never edit migration concurrently with Lane C. |
| C: FE enterprise | Employee UI, then competency UI in separate commits | Corresponding BE DTO frozen | S2-2, S2-3 |
| D: FE platform | route/layout/auth separation and shared API client in `frontend/src/app` and `frontend/src/shared` | F1 | Before learner feature routes land. |
| E: learner | public, target/diagnostic, classroom/results/tasks in vertical slices | F2 and each BE contract | L1 → L2 → L3 → L4/L5. |
| F: QA/docs | WBS evidence and independent tests/review | Immediately read-only; writes after ownership agreed | Final G1/G2. |

Coordinator serializes changes to `Program.cs`, `AppDbContext`, migrations, shared frontend auth/API modules, router, CI and Nginx. A worker owns a migration file from creation through review. Do not run broad `git add .`; stage explicit paths and review staged diff. Commit at the end of each passing slice; never push during this plan without a new instruction.

## Release interpretation and schedule

**Closure through Sprint 2** is the Sprint 1 prerequisite audit, S2-1–S2-5, G1's 102 WBS rows and the Sprint 1–2 subset of G2. **Learner-flow delivery** is F1/F2 + L1–L5 + the learner subset of G2. These are separate gates: completing the demo port does not prove Sprint 2, and an accurate Sprint 2 report does not mean the learner product is finished. The old plan deferred learner APIs after 30/09; this new request expands scope substantially. Estimate effort after F1 contracts and source comparison, then schedule based on capacity rather than assigning an unsupported 30/09 completion date.

### Acceptance checklist

- [ ] One `frontend/` build contains two independently navigable, visually distinct flows; direct links and refresh work for public, learner and enterprise routes, and `/api/v1` reaches the shared backend.
- [ ] Landing, career catalog, target, diagnostic, path, classroom, progress, practical tasks and results use the demo's relevant UX patterns with accessible, responsive production components.
- [ ] No learner outcome, access decision, recommendation, certificate or course completion depends on demo mock login/localStorage or unscoped sample data.
- [ ] Employee, Competency and draft Position Requirement Sprint 2 capabilities work through UI → API → PostgreSQL with correct RBAC and tenant limits.
- [ ] All 51 Sprint 1–2 task rows and 51 review rows have traceable evidence, or the release report explicitly states which rows cannot be substantiated; no status is inferred from `Done` alone.
- [ ] Full DB, API, FE and browser gates have actual passing run logs. A missing PostgreSQL/browser environment remains an open gate, not a pass.
