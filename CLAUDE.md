# DigiTalent AI

Nền tảng đào tạo, đánh giá năng lực số và cấp chứng chỉ nội bộ cho nhân viên doanh nghiệp (digital competency training, internal certification & work-based assessment platform). Monorepo: ASP.NET Core backend + React frontend + Docker infra.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | ASP.NET Core 8 (.NET 8) / C#, Clean Architecture + **use-case pattern** |
| Frontend | React 19 + TypeScript + Vite 8 + TailwindCSS 4 + shadcn/ui |
| Database | PostgreSQL 16 (EF Core 8 + Npgsql, snake_case naming) |
| Auth | JWT access token (8h, **no refresh token yet**), RBAC permissions in code |
| Validation | FluentValidation (auto-run by a use-case decorator) |
| API docs | Swagger / OpenAPI (Development only) |
| CI/CD | GitHub Actions (`.github/workflows/backend-ci.yml`, `frontend-ci.yml`) |
| Infra (compose only, **no app code yet**) | MinIO, Redis (optional profile), Nginx |

SignalR, MinIO/S3 integration, Redis cache and backend tests are **not implemented yet** — only docker config exists.

## Repository Layout

```
backend/     ASP.NET Core solution (DigiTalent.sln) — src/ only (no tests/ yet)
frontend/    React + TypeScript + Vite SPA (npm)
infra/       Docker & Nginx deployment assets
docker/      docker-compose.yml (postgres, minio, redis[optional], nginx, backend-api)
docs/        Project documentation (BRD, SRS, ERD, RBAC, coding conventions…)
docs_v2/     Revised doc set (v2) — newer than docs/
scripts/     setup.ps1 (local dev prerequisites check)
```

**Do NOT read into** `frontend/node_modules/`, `backend/**/bin/`, `backend/**/obj/`, `DigiTalent_AI_Project_Submission/`, `Source_Learn_DigiTalentAI/`, `output/`, `scratch/` — these are build artifacts, submission bundles, or scratch (several are untracked).

## Backend — 4 projects

Dependency direction: `Api → Application → Domain` and `Api → Infrastructure → Application`.

| Project | Purpose | Constraints |
|---------|---------|-------------|
| `DigiTalent.Domain` | `BaseEntity`, entities (`User`, `Department`), `Roles`, `Permissions`, `RolePermissions` | No dependencies |
| `DigiTalent.Application` | Use cases (Input/Output/Validator), `IUseCase<,>`, interfaces, `PagedList`, exceptions | No `HttpContext`, no `[Authorize]` |
| `DigiTalent.Infrastructure` | `AppDbContext`, EF configurations, migrations, `DbSeeder`, JWT, BCrypt | Implements Application interfaces |
| `DigiTalent.Api` | Controllers, `HasPermission` filter, `CurrentUser`, `ApiResponse`, exception middleware, `Program.cs` | No business logic |

**Mandatory pattern:** `Controller → IUseCase<TIn,TOut> → IApplicationDbContext`. Controllers live in `Api/Controllers/` (route `api/v1/<module>`). One use case = one folder `Application/UseCases/<Module>/<Feature>/` with `XxxUseCase`, `XxxUseCaseInput`, `XxxUseCaseOutput`, `XxxUseCaseValidator` (optional). Use cases, validators are auto-registered (Scrutor) and auto-validated — no DI edits.

**Conventions:**
- Every action except login carries `[HasPermission(Permissions.X)]`. Permissions: `Domain/Constants/Authorization/Permissions.cs`; which role gets what: `RolePermissions.cs` (SYSTEM_ADMIN has all). Currently only 3 keys exist — add keys per module as it is built, and mirror them in `frontend/src/hooks/use-permission.ts`.
- Responses are `ApiResponse<T>` (`{success, message, data, errors[{field,message}]}`). Use cases **throw** `NotFoundException`(404) / `ConflictException`(409) / `BadRequestException`(400) / `ForbiddenException`(403); `ExceptionHandlingMiddleware` maps them; validation failures → 400.
- Pagination: input `PageIndex` (1-based), `PageSize` (≤100), `Search`; output `PagedList` (`items, pageIndex, pageSize, totalItems, totalPages`).
- New entity → entity in `Domain/Entities`, `<Entity>Configuration` in `Infrastructure/Persistence/Configurations/<Module>/`, **add `DbSet` to both `AppDbContext` and `IApplicationDbContext`**, then a new migration (never edit a pushed migration). `CreatedAt/UpdatedAt` are filled by `SaveChangesAsync`.
- Use cases depend on `IApplicationDbContext` (interface), never `AppDbContext`. Project to output DTOs, never return entities.
- Sensitive-action audit logging is planned but **not implemented** (no `AuditLogService` yet).

**Commands:**
```bash
cd backend
dotnet restore && dotnet build
dotnet run --project src/DigiTalent.Api            # Swagger at http://localhost:5000/swagger
dotnet ef migrations add <Name> --project src/DigiTalent.Infrastructure --startup-project src/DigiTalent.Api --output-dir Persistence/Migrations
```
Development startup auto-runs migrations and seeds 6 accounts (one per role): `admin@ / hr@ / manager@ / trainer@ / employee@ / verifier@digitalent.ai`, password `Admin@1234`. Production never auto-migrates. If only a newer .NET runtime is installed, prefix `dotnet ef`/`dotnet run` with `DOTNET_ROLL_FORWARD=Major`.

## Frontend — React SPA

**Directory map (`frontend/src/`):**
```
app/        router.tsx (ALL routes, one file) + providers.tsx (React Query)
components/ guards/ (AuthGuard, RequirePermission, RequireRole), layout/, shared/ (DataTable, PageHeader, StatusBadge, EmptyState…)
features/   <module>/pages/*.tsx  — one page per file
hooks/      React Query hooks + Zustand stores (use-auth, use-current-user, use-permission…)
lib/        constants.ts, sidebar-config.ts, utils.ts (no React)
services/   API calls via apiClient (axios) — <module>.service.ts
types/      shared TS interfaces (api.ts, auth.ts, common.ts)
```

**Conventions:**
- Data fetching via **TanStack Query**; client/auth state via **Zustand** (`useCurrentUser`) — do NOT introduce other state-management patterns.
- API calls only through `apiClient` (`services/api-client.ts`) — never raw `fetch` or direct `axios`. Services export an object (not a class): `export const courseService = { getList, getById, create }`.
- Route guards: wrap pages in `<RequirePermission permission="...">` or `<RequireRole roles={[...]}>` inside `app/router.tsx`. `SYSTEM_ADMIN` always passes `can()` checks. `my-*` routes need auth only; `/verify` is public.
- Permission keys come from `hooks/use-permission.ts` (`PERMISSIONS` object) — mirror of backend `Permissions`; only a few exist in the backend so far.
- Path alias `@/` → `src/` (configured in `vite.config.ts` + `tsconfig`). Vite dev proxy: `/api` and `/hubs` → `http://localhost:5000`.
- Forms: `react-hook-form` + `zod` (`@hookform/resolvers/zod`). Toasts via `sonner`. Icons via `lucide-react`.

**Commands:**
```bash
cd frontend
npm install && npm run dev        # http://localhost:5173
npm run build                     # tsc -b && vite build
npm run lint                      # oxlint (not eslint)
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

- Backend: no test project yet (CI runs `dotnet test` but finds none). Verify with `dotnet build` and running the API against Postgres.
- Pre-push checklists: backend `dotnet build` clean, actions gated with `[HasPermission]`, use cases return Output DTOs not entities, new tables have a migration; frontend `tsc -b` clean, uses `apiClient`, routes guarded, files in correct folders.
