# DigiTalent AI

Nền tảng đào tạo, đánh giá năng lực số và cấp chứng chỉ nội bộ cho nhân viên doanh nghiệp (digital competency training, internal certification & work-based assessment platform). Monorepo: ASP.NET Core backend + React frontend + Docker infra.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | ASP.NET Core 8 (.NET 8) / C#, Clean Architecture + **use-case pattern** |
| Frontend | React 19 + TypeScript + Vite 8 + TailwindCSS 4 + shadcn/ui |
| Database | PostgreSQL 16 (EF Core 8 + Npgsql, snake_case naming) |
| Auth | JWT access token (8h) + refresh token rotation (`RefreshTokenUseCase`), lock-out 5 fails → 15 min, RBAC stored in DB tables. JWT keeps raw claim names (`MapInboundClaims = false`): user id = `sub` |
| Validation | FluentValidation (auto-run by a use-case decorator) |
| API docs | Swagger / OpenAPI (Development only) |
| CI/CD | GitHub Actions (`.github/workflows/backend-ci.yml`, `frontend-ci.yml`) |
| Infra (compose only, **no app code yet**) | MinIO, Redis (optional profile), Nginx |

Implemented: SignalR hub `/hubs/notifications` (per-user groups via `SubClaimUserIdProvider`; FE client `hooks/use-notification-hub.ts`), local file storage (`LocalFileStorageService`), `AuditService`, backend tests. **Not implemented yet:** MinIO/S3 integration, Redis cache — only docker config exists.

## Repository Layout

```
backend/     ASP.NET Core solution (DigiTalent.sln) — src/ + tests/DigiTalent.Tests (xUnit)
frontend/    React + TypeScript + Vite SPA (npm)
infra/       Docker & Nginx deployment assets
docker/      docker-compose.yml (postgres, minio, redis[optional], nginx, backend-api)
docs/        Project documentation (BRD, SRS, ERD, RBAC, coding conventions…)
  database/  DigiTalent_AI_Canonical_v2_3.sql — THE schema source of truth (62 tables, phase-tagged)
docs_v2/     Revised doc set (v2) — newer than docs/
scripts/     setup.ps1 (local dev prerequisites check)
```

**Do NOT read into** `frontend/node_modules/`, `backend/**/bin/`, `backend/**/obj/`, `DigiTalent_AI_Project_Submission/`, `Source_Learn_DigiTalentAI/`, `output/`, `scratch/` — these are build artifacts, submission bundles, or scratch (several are untracked).

## Backend — 4 projects

Dependency direction: `Api → Application → Domain` and `Api → Infrastructure → Application`.

| Project | Purpose | Constraints |
|---------|---------|-------------|
| `DigiTalent.Domain` | `BaseEntity`, entities for every SQL table, domain events (`Common/IDomainEvent`, `Events/`), `Statuses`, `LoginPolicy`, `Roles`, `Permissions`, `RolePermissions` | No dependencies |
| `DigiTalent.Application` | Use cases (Input/Output/Validator), `IUseCase<,>`, interfaces, `IPermissionService`, `EmployeeScope`, domain-event contracts, `Services/Intelligence` (pure skill gap / recommendation engines), `PagedList`, exceptions | No `HttpContext`, no `[Authorize]` |
| `DigiTalent.Infrastructure` | `AppDbContext` (+ domain-event pipeline), EF configurations, migrations, `DbSeeder` + `SkillGapSeeder`, JWT, BCrypt, `AuditService`, file storage | Implements Application interfaces |
| `DigiTalent.Api` | Controllers, `HasPermission` filter, `CurrentUser`, `ApiResponse`, exception middleware, `Program.cs` | No business logic |

**Mandatory pattern:** `Controller → IUseCase<TIn,TOut> → IApplicationDbContext`. Controllers live in `Api/Controllers/` (route `api/v1/<module>`). One use case = one folder `Application/UseCases/<Module>/<Feature>/` with `XxxUseCase`, `XxxUseCaseInput`, `XxxUseCaseOutput`, `XxxUseCaseValidator` (optional). Use cases, validators are auto-registered (Scrutor) and auto-validated — no DI edits.

**Conventions:**
- **Schema first:** `docs/database/DigiTalent_AI_Canonical_v2_3.sql` is the single source of truth. Entities/configurations must match its tables, columns, CHECKs and indexes; change the SQL first, then code, then Report 4 / docs. Migrations create Phase 1 + the 16 Sprint 3 tables (skill gap, competency profile/evidence, courses, enrollments, scoring configs, notifications, `task_*` FK chain) + `competency_frameworks`, `competency_framework_mappings`, `course_prerequisites`. The other 22 tables have skeleton configurations marked `ExcludeFromMigrations()` — write the full configuration from the SQL (CHECK/FK/unique/length) and remove that flag before using them.
- 5 roles only (SYSTEM_ADMIN, HR_MANAGER, DEPARTMENT_MANAGER, TRAINER, EMPLOYEE); public `/verify` needs no role. Roles/permissions live in tables `roles`, `user_roles`, `permissions`, `role_permissions`; `[HasPermission]` checks them at runtime via `IPermissionService` (SYSTEM_ADMIN always passes).
- Every action except login carries `[HasPermission(Permissions.X)]`. Add keys to `Domain/Constants/Authorization/Permissions.cs` and the default matrix `RolePermissions.cs` (seed only — `DbSeeder` inserts missing permissions/pairs on Development start), and mirror them in `frontend/src/hooks/use-permission.ts`. All 117 keys of the RBAC matrix are declared.
- Status strings come from `Domain/Constants/Statuses.cs` (match SQL CHECKs). No hard delete of business data: "delete" endpoints archive (`Archive<Entity>` use case, `Status = ARCHIVED`).
- Queries are scoped to the caller's organization (`ICurrentUser.OrganizationId`, JWT claim `org`). Employee-level data goes through `EmployeeScope` (HR/Admin: org, Department Manager: own department, others: self; out of scope → 404).
- Responses are `ApiResponse<T>` (`{success, message, data, errors[{field,message}]}`). Use cases **throw** `NotFoundException`(404) / `ConflictException`(409) / `BadRequestException`(400, optionally with a field + machine code, e.g. `NO_JOB_POSITION`, returned in `errors[].message`) / `UnauthorizedException`(401, bad login) / `ForbiddenException`(403); `ExceptionHandlingMiddleware` maps them; validation failures → 400. Unhandled `DbUpdateConcurrencyException` / PostgreSQL unique violations → 409 in the middleware (kept raw in the DbContext so use cases such as `LoginUseCase` can retry).
- Domain events: raise with `IApplicationDbContext.AddDomainEvent(e)`; `IDomainEventHandler<T>` (batched, auto-registered) runs inside the same transaction during `SaveChangesAsync` and must not call `SaveChangesAsync` itself; side effects outside the DB (SignalR) go to `IAfterCommitQueue`. Need several saves in one transaction → `ExecuteInTransactionAsync` (events in any other caller-owned transaction are rejected).
- Pagination: input `PageIndex` (1-based), `PageSize` (≤100), `Search`; output `PagedList` (`items, pageIndex, pageSize, totalItems, totalPages`).
- New entity → entity in `Domain/Entities`, `<Entity>Configuration` in `Infrastructure/Persistence/Configurations/<Module>/`, **add `DbSet` to both `AppDbContext` and `IApplicationDbContext`**, then a new migration (never edit a pushed migration). `CreatedAt/UpdatedAt` (both NOT NULL) are filled by `SaveChangesAsync`; composite-key join tables do not inherit `BaseEntity`. FKs are always `Restrict` (set globally in `AppDbContext`).
- Use cases depend on `IApplicationDbContext` (interface), never `AppDbContext`. Project to output DTOs, never return entities.
- Sensitive actions log via `IAuditService` — best-effort: it calls `SaveChangesAsync` itself and swallows errors, so call it **after** the main save, never in the middle of a unit of work.

**Commands:**
```bash
cd backend
dotnet restore && dotnet build
dotnet run --project src/DigiTalent.Api            # Swagger at http://localhost:5000/swagger
dotnet ef migrations add <Name> --project src/DigiTalent.Infrastructure --startup-project src/DigiTalent.Api --output-dir Persistence/Migrations
```
Development startup auto-runs migrations and seeds: org `DIGITALENT`, 5 roles, permissions + default matrix, department `OPS`, 5 accounts `admin@ / hr@ / manager@ / trainer@ / employee@digitalent.ai` (password `Admin@1234`; all but admin have an `employees` profile, manager@ heads OPS), and the Circular 02/2025 demo (`SkillGapSeeder` + `Tt02Catalog`, spec `docs/specs/2026-09-29-tt02-position-competency-matrix.md`): framework `TT02_2025`, 6 domain categories, 24 competencies `TT02-1.1…6.3` with mappings, 5 positions (CEO, HR, MARKETING, SALES_CRM, ACCOUNTANT) each with an active set of 20–23 competencies and a level per competency, 18 published F/I/A courses chained by prerequisites (+1 draft); employee@ is ACCOUNTANT confirmed Basic everywhere, manager@ is SALES_CRM. Activation requires 9–24 competencies mapped to the Circular (`COMPETENCY_NOT_IN_FRAMEWORK`, `REQUIREMENT_COUNT_OUT_OF_RANGE`) including the core 4.1 and 4.2 (`CORE_COMPETENCY_MISSING`); severity = HIGH (2+ levels missing) / MEDIUM (1, mandatory) / LOW (1, optional). All environments also get the skill gap setting and `RECOMMENDATION_WEIGHTS` v1. Production never auto-migrates. If only a newer .NET runtime is installed, prefix `dotnet ef`/`dotnet run` with `DOTNET_ROLL_FORWARD=Major`.

## Frontend — React SPA

Three portals (spec: `docs/specs/2026-10-01-frontend-ui-ux-restructure-plan.md`, source doc "Danh sách màn hình và luồng UI/UX v1.0"): **Enterprise** `/enterprise/*`, **Personal** `/personal/*` (individual users, replaces `/learn/*`), **Platform** `/platform/*` (DigiTalent staff). The frontend is being rebuilt ahead of the backend, on mock data.

**Directory map (`frontend/src/`):**
```
app/        router.tsx + routes/{public,personal,enterprise,platform}.routes.tsx (+ build-routes.tsx) + layouts/ + providers.tsx
components/ guards/ (AuthGuard, RequireWorkspace, RequireRole, RequirePermission, RequireEntitlement, RequireActiveSubscription), layout/, shared/ (DataTable, PageHeader, StatusBadge, EmptyState…)
features/   <module>/pages/*.tsx  — one page per file; system/ = PlaceholderPage, FeatureUnavailable, PaymentRequired
hooks/      React Query hooks + Zustand stores (use-auth, use-current-user, use-permission…)
lib/        roles.ts, entitlements.ts, navigation.ts, portals.ts, sidebar-config.ts, screens/{enterprise,platform}.ts (the sitemap), utils.ts (no React)
services/   API calls via apiClient (axios) — <module>.service.ts; mock/ = mock adapters + demo accounts
types/      shared TS interfaces (api.ts, auth.ts, session.ts, common.ts)
```

**Conventions:**
- Data fetching via **TanStack Query**; client/auth state via **Zustand** (`useCurrentUser`) — do NOT introduce other state-management patterns.
- API calls only through `apiClient` (`services/api-client.ts`) — never raw `fetch` or direct `axios`. Services export an object (not a class): `export const courseService = { getList, getById, create }`.
- **Sitemap-driven routing:** every screen of the spec is one entry in `lib/screens/{enterprise,platform}.ts` (id, path, roles, permission, entitlement, `allowUnpaid`, optional `aliases`). The router is built from these entries; a screen without a built page renders `PlaceholderPage`. To build a screen, add its page to `ENTERPRISE_PAGES` / `PLATFORM_PAGES` in `app/routes/*.routes.tsx` keyed by screen ID — do not hand-write routes.
- **Roles (v2.1 canonical model):** 4 roles: `PLATFORM_ADMIN, OWNER, MANAGER, EMPLOYEE`. Legacy roles (`ORG_ADMIN, LEARNING_ADMIN` → `OWNER`; `LEARNER` → `EMPLOYEE`) are normalized via `normalizeRoles` in `lib/roles.ts`. `PLATFORM_ADMIN` always passes `can()` checks.
- **Role-based sidebars:** configured in `lib/sidebars/{owner, manager, employee, platform}.ts`. `sidebarFor(user)` resolves the highest role: `PLATFORM_ADMIN > OWNER > MANAGER > EMPLOYEE`.
- **Access order (FLOW-07):** subscription active (`RequireActiveSubscription`) → plan entitlement (`RequireEntitlement`) → role (`RequireRole`) → permission (`RequirePermission`). A user is kept to their portal by `RequireWorkspace`. With no `subscription` in `/auth/me` (legacy backend) plan gating is not enforced.
- **Permission keys:** come from `hooks/use-permission.ts` (`PERMISSIONS` object) — mirror of backend `Permissions`. Entitlement keys: `lib/entitlements.ts`.
- **Mock mode & REST Mock Server:** `VITE_USE_MOCK=true` (in `frontend/.env`, default `false` in `.env.example`) makes `authService` and API services answer from `services/mock/` over a simulated REST server and localStorage database (`services/mock/mock-store.ts`, key `dt-mock-db`). Demo accounts (password `Admin@1234`): `owner@`, `manager@`, `employee@`, `platform@`, `personal@`, `starter@`, `expired@digitalent.demo`. Tests force `VITE_USE_MOCK=false`; use `test/session.ts` (`signInAsMock`) in unit/integration tests. Other services get a mock adapter when their screens are built.
- **Entry, sign-up and purchase:**
  - **Portal entry:** `/` portal selector (asks once, remembered in `localStorage` `dt-portal`; `/portal` always shows it) → `/business` or `/individual` landing → `/{business,individual}/pricing` → `/{business,individual}/register` (requires `?plan=&seats=&cycle=`, bare visits redirect back to pricing with `?reason=choose-plan`).
  - **Flows & Steppers (`PurchaseStepper`):**
    - **Enterprise (5 steps):** Chọn gói (`/business/pricing`) → Tạo tài khoản (`/business/register`) → Thanh toán QR (`/checkout`) → Ký hợp đồng điện tử B2B (`/enterprise/contract`, chữ ký số canvas/OTP `686868`, mộc số, in PDF) → Thiết lập tổ chức (`/setup`, 6 bước, hỗ trợ Lưu và tiếp tục sau) → Không gian doanh nghiệp (`/enterprise/dashboard`).
    - **Individual (4 steps):** Chọn gói (`/individual/pricing`) → Tạo tài khoản (`/individual/register`) → Thanh toán QR (`/checkout`) → Khởi tạo học tập (`/personal/onboarding`, chọn vị trí mục tiêu theo Chuẩn 02/2025, chọn chẩn đoán/vào học ngay) → Không gian cá nhân (`/personal/dashboard`).
  - **Order & Drafts:** `PurchaseDraft` (ID `pd_*`, hạn 7 ngày, lưu trữ trong `purchaseDrafts`), Đơn hàng thanh toán QR (`dt-mock-db.orders`, hết hạn sau 15 phút, idempotent `confirmPayment`).
  - **Gating & Security:** `onboardingStatus` (`payment` → `contract` → `setup` → undefined). `RequireOnboarded` & `resolveNextStep` điều hướng đúng bước tiếp theo. Chưa xác thực email (`emailVerified: false`) bị chặn bởi `/verify-email-required` trước khi vào workspace. Mật khẩu tuân thủ 12–128 ký tự, danh sách đen, không trùng email. Tài khoản demo (`owner@`, `manager@`, `employee@`, `personal@`, etc., mật khẩu `Admin@1234`) vào thẳng workspace (`emailVerified: true`, không có draft chưa hoàn tất).
- **Personal portal (`/personal/*`)** uses the landing look (cream on black) with a dark default and a light theme (`features/learner/theme/`, key `dt-personal-theme`); style with the `pt-*` tokens (`bg-pt-card`, `text-pt-fg-2`…) and `features/learner/components/ui.tsx`, never raw slate/blue. Data goes through `services/personal-learning.service.ts` + `hooks/use-personal-learning.ts`; the mock server (`services/mock/server/personal/`, `handlers/personal.ts`, localStorage `dt-mock-personal-v1`) reuses the enterprise TT02 catalog: target = one of the 5 reference positions, entry assessment = 18 questions (3 per domain, level = highest level answered right in a row), path = stages by level from the assessed level, passing a course's 4-question assessment raises the domain and issues a certificate. personal@ is seeded mid-way (Marketing).
- **Enterprise & Platform shell (`/enterprise/*`, `/platform/*`)**: Thiết kế lại theo phong cách **"Mực & Giấy"** (dark mặc định, light tùy chọn, store `useEnterpriseTheme`, key `dt-enterprise-theme`, gắn `html.ent-theme[data-theme]`). Khung cuộn theo tài liệu: sidebar `position: fixed` (100dvh, rail 64px / mở 248px / mobile drawer 288px, store `useSidebarState`, key `dt-sidebar`), topbar `position: sticky; top: 0` (56px, breadcrumb từ sitemap, command palette `Ctrl+K`), banner hết hạn dính cùng topbar. Token `ent-*` (`bg-ent-card`, `text-ent-fg`, `border-ent-line`, `bg-ent-raised`, `text-ent-accent`, `ent-ok/warn/bad`). Lớp tương thích tối `styles/enterprise-dark-compat.css` tự đảo màu Tailwind trong `html.ent-theme[data-theme='dark']` để các trang cũ tương thích ngay. Khung trang dùng `PageContainer` (`narrow | default | wide | full`) và `PageHeader` v2.
- UI language: **Vietnamese for all three portals.** Pages not yet rebuilt still have English text; translate a page when you rebuild it.
- No public certificate verification (`/verify` was removed); no Public Visitor actor.
- Path alias `@/` → `src/` (configured in `vite.config.ts` + `tsconfig`). Vite dev proxy: `/api` and `/hubs` → `http://localhost:5000`.
- Forms: `react-hook-form` + `zod` (`@hookform/resolvers/zod`). Toasts via `sonner`. Icons via `lucide-react`.

**Commands:**
```bash
cd frontend
npm install && npm run dev        # http://localhost:5173
npm run build                     # tsc -b && vite build
npm run lint                      # oxlint (not eslint)
npm test                          # vitest
```

## Environment & Config

- Root `.env.example` → `.env` for Docker Compose (Postgres, MinIO, JWT, Redis, frontend URL).
- `backend/src/DigiTalent.Api/appsettings.json` holds backend config (connection string, JWT, MinIO buckets, Scoring weights). `frontend/.env` holds `VITE_API_BASE_URL`.
- Default local Postgres: `Host=localhost;Port=5432;Database=digitalent;Username=digitalent_app;Password=changeme`.

## Git Conventions

- Branch strategy: `main` (production) / `develop` (integration) / `feature/*` / `fix/*` / `release/*` / `hotfix/*`. Feature branches named `feature/DT-XXX-kebab-description`.
- Commit style: conventional commits — `feat(module): …`, `fix(module): …`, `docs: …`, `chore: …`. Git user's ECC rules append a `Co-Authored-By: Claude Code` trailer unless disabled.
- Workflow: daily `git checkout main && git pull` → branch per task → push `-u origin feature/…` → PR into `main`.
- `main` branch is default PR target.

## Where to Look

| I want to… | Look at… |
|-----------|---------|
| Add an API endpoint | `backend/src/DigiTalent.Api/Controllers/*.cs` + a use-case folder in `Application/UseCases/<Module>/<Feature>/` |
| Add a DB table/entity | `Domain/Entities/<Module>/`, `Infrastructure/Persistence/Configurations/<Module>/`, add `DbSet` (2 files), then migration |
| Add a UI page | `frontend/src/features/<module>/pages/XPage.tsx` + one route line in `app/router.tsx` |
| Add a permission | `Domain/Constants/Authorization/Permissions.cs` + `RolePermissions.cs`, mirror in `hooks/use-permission.ts` |
| Understand API shape | `Api/Common/ApiResponse.cs` + `frontend/src/types/api.ts` |
| Full dev conventions | `backend/DEVELOPER_GUIDE.md` (authoritative for backend), `frontend/DEVELOPER_GUIDE.md` |

## Testing & Quality

- Backend: `backend/tests/DigiTalent.Tests` (xUnit + FluentAssertions + Moq). Unit tests use EF InMemory; integration tests need a disposable PostgreSQL DB whose name ends with `_test`: set `DIGITALENT_TEST_POSTGRES_CONNECTION` (CI provides one). On Windows with WSL, use `Host=127.0.0.1`, not `localhost` — `wslrelay` owns `[::1]` on forwarded ports and tests fail with "database is unavailable". InMemory ignores CHECKs, unique indexes and statement order — test persistence rules against PostgreSQL.
- Frontend: `npm test` (Vitest + Testing Library); `@microsoft/signalr` is stubbed in `src/test/setup.ts`.
- Pre-push checklists: backend `dotnet build` clean, actions gated with `[HasPermission]`, use cases return Output DTOs not entities, new tables have a migration; frontend `tsc -b` clean, uses `apiClient`, routes guarded, files in correct folders.
