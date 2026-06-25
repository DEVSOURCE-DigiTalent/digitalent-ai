# DigiTalent AI - Session Handoff cho Phase 4+

## Session vừa hoàn thành (2026-06-25)
**Branch:** feature/DT-001-database-setup  
**Commit:** `41d6724` - `feat: DT-002 auth + users + organization APIs with RBAC`

### Đã hoàn thành (Build Success ✅)
| Phase | Module | Files | Endpoints |
|-------|--------|-------|-----------|
| P1 | Auth | JwtTokenService, AuthService, AuthController | 5: login, refresh-token, logout, me, change-password |
| P2 | Users & Roles | UserService, UsersController | 10: CRUD users, roles, permissions, lock/unlock |
| P3 | Organization | OrganizationService, OrganizationsController | 12: departments, job-positions, employees |
| RBAC | PermissionConstants | ~125 permissions, 6 roles | HasPermissionAttribute, AuthorizationHandler, ScopeService |
| Infra | Middleware | ExceptionHandlingMiddleware | RFC 7807 ProblemDetails |

### Cấu trúc Backend hiện tại
```
DigiTalent.Api/
├── Authorization/       ← HasPermissionAttribute, Handler, ScopeService [NEW]
├── Middlewares/          ← ExceptionHandlingMiddleware [NEW]
├── Controllers/V1/      ← HealthController, AuthController, UsersController, OrganizationsController [NEW]

DigiTalent.Application/
├── Auth/DTOs/           ← LoginRequest/Response, RefreshTokenRequest, etc. [NEW]
├── Auth/Services/        ← AuthService (login, refresh, logout) [NEW]
├── Users/DTOs/           ← UserDtos [NEW]
├── Users/Services/       ← UserService [NEW]
├── Organization/DTOs/    ← OrganizationDtos [NEW]
├── Organization/Services/ ← OrganizationService [NEW]
├── Common/Interfaces/    ← IApplicationDbContext, ICurrentUserService, IJwtTokenService [UPDATED]

DigiTalent.Infrastructure/
├── Auth/                 ← JwtTokenService, CurrentUserService [NEW]
├── Persistence/          ← AppDbContext, Configurations, Seed, Migrations

DigiTalent.Shared/
├── Constants/            ← PermissionConstants (~125), AppConstants [UPDATED]
├── ApiResponse/          ← ApiResponse<T>, PagedList
├── Security/             ← PasswordHelper
```

### Seed Data Available
- 6 roles, 49+ permissions, 5 users, 1 org, 5 departments, 6 positions, 8 competencies

---

## Phase 4: Những gì cần implement tiếp theo

### Thứ tự ưu tiên

#### 1. Competency Framework (P4)
- **DTOs**: `Application/Competency/DTOs/CompetencyDtos.cs`
- **Service**: `Application/Competency/Services/CompetencyService.cs`
  - CRUD categories, competencies, levels
  - Position competency requirements (save/replace)
  - Employee competency profile + evidence
- **Controller**: `Api/Controllers/V1/CompetenciesController.cs`
  - `GET /api/v1/competency-categories`
  - `GET/POST /api/v1/competencies`
  - `GET /api/v1/competency-levels`
  - `GET/PUT /api/v1/job-positions/{id}/competency-requirements`
  - `GET /api/v1/employees/{id}/competency-profile`
  - `POST /api/v1/employees/{id}/competency-evidences`
- **Permissions used**: `competency_category.*`, `competency.*`, `position_requirement.*`, `employee_competency_profile.*`, `evidence.*`

#### 2. Learning Management (P5)
- **DTOs**: `Application/Learning/DTOs/LearningDtos.cs`
- **Service**: `CourseService.cs`, `EnrollmentService.cs`
- **Controller**: `CoursesController.cs`
  - Full CRUD courses, modules, lessons, materials
  - Course competencies mapping, course assignments
  - Enrollments, lesson completion

#### 3. Assessment (P6)
- DTOs + Service + Controller: Question banks, questions, assessments, attempts, results
- Domain logic: Attempt validation (limit, deadline, eligibility), auto-scoring

#### 4. Certificate (P7)
- Certificate PDF generation needs MinIO running. Template-based.
- Public endpoint: `GET /api/v1/certificates/verify/{code}`

#### 5. Task & Intelligence (P8-P9)
- WMS-lite task: assignment, submission, evaluation workflow
- Scoring: skill gap, training risk, readiness formulas

### Architecture Pattern (đã established)
```
Controller → Application Service → IApplicationDbContext/DbSet queries
                                → ICurrentUserService (data scope)
                                → [HasPermission("permission.code")] (RBAC)
                                → throw exception → ExceptionHandlingMiddleware → ProblemDetails
Response: ApiResponse<T>.Ok(data) hoặc ApiResponse.Fail(message)
Paged: PagedList<T> (items, pageNumber, pageSize, totalItems, totalPages)
```

### Lưu ý quan trọng
- `IApplicationDbContext` dùng type alias cho Organization entities do namespace conflict:
  ```csharp
  using OrgEntity = DigiTalent.Domain.Entities.Organization.Organization;
  ```
- Khi tạo Application Service ở module mới, cần register trong `Program.cs`
- Permission check qua `[HasPermission(PermissionConstants.XxxYyy)]` attribute
- Data scope check dùng `ResourceScopeAuthorizationService` hoặc inline
