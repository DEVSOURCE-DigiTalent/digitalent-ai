# Backend Developer Guide — DigiTalent AI

> **Đọc file này trước khi viết dòng code backend đầu tiên.** Pattern, layer, convention — tất cả trong 1 file.

## 1. Quickstart

```bash
# Prerequisites: .NET SDK 9.0+, Docker Desktop, PostgreSQL
cd backend
dotnet restore
dotnet build

# Start PostgreSQL + MinIO
cd ..
docker compose up -d postgres minio

# Run migrations
cd backend
dotnet ef database update --project src/DigiTalent.Infrastructure

# Run API
dotnet run --project src/DigiTalent.Api
# → Swagger: http://localhost:5000/swagger
```

---

## 2. Clean Architecture — LAYER RULES

```
backend/src/
├── DigiTalent.Domain/          ← Entities + Enums (NO dependencies)
├── DigiTalent.Shared/          ← Constants, ApiResponse, Errors, Helpers (NO deps)
├── DigiTalent.Application/     ← DTOs + Services + Interfaces (depends: Domain, Shared)
├── DigiTalent.Infrastructure/  ← EF Core, Auth, Seed data (depends: Application)
└── DigiTalent.Api/             ← Controllers, Middleware, Authorization (depends: all)
```

**Dependency flow:** `Api → Application → Domain` + `Api → Infrastructure → Application`

| Layer | Được làm gì | KHÔNG được làm gì |
|---|---|---|
| **Domain** | Entities, enums, value objects | KHÔNG gọi DB, KHÔNG reference EF Core |
| **Application** | DTOs, Service classes, Interfaces | KHÔNG gọi HttpContext, KHÔNG dùng `[Authorize]` |
| **Infrastructure** | EF Core, JWT, MinIO, Seed, CurrentUser | KHÔNG trả về entities (dùng DTO) |
| **Api** | Controllers, Middleware, Swagger, Program.cs | KHÔNG chứa business logic |
| **Shared** | Constants, ApiResponse, PagedList, Errors | KHÔNG reference project nào khác |

---

## 3. Pattern bắt buộc — Controller → Service → DTO

### 3.1 Controller

```csharp
// Controllers/V1/YourModuleController.cs
using DigiTalent.Api.Authorization;
using DigiTalent.Application.YourModule.DTOs;
using DigiTalent.Application.YourModule.Services;
using DigiTalent.Shared.ApiResponse;
using DigiTalent.Shared.Constants;
using DigiTalent.Shared.Pagination;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers.V1;

[ApiController]
[Route("api/v1")]
[Produces("application/json")]
public class YourModuleController : ControllerBase
{
    private readonly YourService _yourService;

    public YourModuleController(YourService yourService)
        => _yourService = yourService;

    // GET list with pagination
    [HttpGet("your-resources")]
    [HasPermission(PermissionConstants.YourModuleRead)]       // ← LUÔN gắn [HasPermission]
    public async Task<IActionResult> Search([FromQuery] PaginationRequest request)
    {
        var result = await _yourService.SearchAsync(request);
        return Ok(ApiResponse<PagedList<YourItemResponse>>.Ok(result));
    }

    // GET by ID
    [HttpGet("your-resources/{id:guid}")]
    [HasPermission(PermissionConstants.YourModuleRead)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _yourService.GetByIdAsync(id);
        return Ok(ApiResponse<YourDetailResponse>.Ok(result));
    }

    // POST create
    [HttpPost("your-resources")]
    [HasPermission(PermissionConstants.YourModuleCreate)]
    [ProducesResponseType(typeof(ApiResponse<YourDetailResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateYourRequest request)
    {
        var result = await _yourService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id },
            ApiResponse<YourDetailResponse>.Ok(result, "Created successfully"));
    }

    // PUT update
    [HttpPut("your-resources/{id:guid}")]
    [HasPermission(PermissionConstants.YourModuleUpdate)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateYourRequest request)
    {
        var result = await _yourService.UpdateAsync(id, request);
        return Ok(ApiResponse<YourDetailResponse>.Ok(result, "Updated successfully"));
    }

    // POST action (lock, publish, assign...)
    [HttpPost("your-resources/{id:guid}/custom-action")]
    [HasPermission(PermissionConstants.YourModuleCustomAction)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> CustomAction(Guid id)
    {
        await _yourService.CustomActionAsync(id);
        return NoContent();
    }
}
```

### 3.2 Service

```csharp
// Application/YourModule/Services/YourService.cs
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.YourModule.DTOs;
using DigiTalent.Shared.Constants;
using DigiTalent.Shared.Errors;
using DigiTalent.Shared.Pagination;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.YourModule.Services;

public class YourService
{
    private readonly IApplicationDbContext _context;   // ← LUÔN dùng interface
    private readonly ICurrentUserService _currentUser; // ← Lấy user scope
    private readonly AuditLogService _auditLog;        // ← Ghi audit nếu cần

    public YourService(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        AuditLogService auditLog)
    {
        _context = context;
        _currentUser = currentUser;
        _auditLog = auditLog;
    }

    public async Task<PagedList<YourItemResponse>> SearchAsync(PaginationRequest request)
    {
        var query = _context.YourEntities.AsQueryable();

        // Search filter
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var kw = request.Search.ToLower();
            query = query.Where(e => e.Name.ToLower().Contains(kw));
        }

        var totalItems = await query.CountAsync();

        var items = await query
            .OrderByDescending(e => e.CreatedAt)
            .Skip((request.PageIndex - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(e => new YourItemResponse    // ← Project thẳng DTO
            {
                Id = e.Id,
                Name = e.Name,
                Status = e.Status.ToString(),
                CreatedAt = e.CreatedAt,
            })
            .ToListAsync();

        return new PagedList<YourItemResponse>
        {
            Items = items,
            PageIndex = request.PageIndex,
            PageSize = request.PageSize,
            TotalItems = totalItems,
        };
    }

    public async Task<YourDetailResponse> GetByIdAsync(Guid id)
    {
        var entity = await _context.YourEntities
            .Include(e => e.RelatedEntity)    // ← Include navigation properties
            .FirstOrDefaultAsync(e => e.Id == id);

        if (entity == null)
            throw new KeyNotFoundException(ErrorCodes.NotFound);

        // Data scope check (nếu dùng ResourceScopeAuthorizationService)
        // _scopeAuth.EnsureDepartmentAccess(entity.DepartmentId);

        return MapToDetail(entity);
    }
}
```

### 3.3 DTO

```csharp
// Application/YourModule/DTOs/YourModuleDtos.cs
namespace DigiTalent.Application.YourModule.DTOs;

// Request DTOs
public class CreateYourRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? RelatedId { get; set; }
}

public class UpdateYourRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
}

// Response DTOs
public class YourItemResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
}

public class YourDetailResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = string.Empty;
    public RelatedInfo? Related { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
}

public class RelatedInfo
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
}
```

---

## 4. Authorization — 2 LỚP BẢO VỆ

### 4.1 Coarse-grain: `[HasPermission]` attribute trên Controller

```csharp
[HttpGet("employees")]
[HasPermission(PermissionConstants.EmployeeRead)]
// → Chỉ user có permission "employee.read" mới vào được endpoint này
```

Tất cả permission keys trong `DigiTalent.Shared.Constants.PermissionConstants` — mỗi permission map 1-1 với RBAC doc section 6.

### 4.2 Fine-grain: `ResourceScopeAuthorizationService` trong Service

```csharp
// Constructor DI
private readonly ResourceScopeAuthorizationService _scopeAuth;

// Check department scope
_scopeAuth.EnsureDepartmentAccess(entity.DepartmentId);
// → Throw UnauthorizedAccessException nếu user không phải admin/HR
//   và không quản lý department đó

// Check ownership
_scopeAuth.EnsureOwnership(entity.EmployeeId, _currentUser.EmployeeId);

// Check global access (admin/HR)
_scopeAuth.EnsureGlobalAccess();

// Check trainer access to course
_scopeAuth.EnsureTrainerAccess(courseId, course.OwnerTrainerId);
```

### 4.3 Response convention with unauthorized

```csharp
// ExceptionMiddleware tự động convert:
//   UnauthorizedAccessException → 401/403
//   KeyNotFoundException → 404
//   ValidationException → 400
```

Xem `Api/Middlewares/ExceptionHandlingMiddleware.cs` để biết mapping.

---

## 5. Response Convention — LUÔN LUÔN dùng ApiResponse

```csharp
// Success
return Ok(ApiResponse<MyDto>.Ok(data, "Optional message"));
return Ok(ApiResponse<PagedList<MyDto>>.Ok(pagedResult));

// Created
return CreatedAtAction(nameof(GetById), new { id = result.Id },
    ApiResponse<MyDto>.Ok(result, "Created"));

// No Content
return NoContent();   // Không body

// Error — throw exception, middleware xử lý
throw new KeyNotFoundException(ErrorCodes.NotFound);
throw new UnauthorizedAccessException("You do not have permission.");
```

**Response shape:**
```json
{
  "success": true,
  "message": "Success",
  "data": { ... },
  "errors": [],
  "traceId": "...",
  "timestamp": "2026-06-28T12:00:00.000Z"
}
```

---

## 6. Permission System

### 6.1 File locations

| File | Purpose |
|---|---|
| `Shared/Constants/PermissionConstants.cs` | **Source of truth** — 80+ permission keys |
| `Shared/Constants/RoleConstants.cs` | 6 role codes |
| `Api/Authorization/HasPermissionAttribute.cs` | `[HasPermission]` attribute |
| `Api/Authorization/PermissionRequirement.cs` | Authorization requirement |
| `Api/Authorization/PermissionAuthorizationHandler.cs` | Handler — validates permission |
| `Api/Authorization/ResourceScopeAuthorizationService.cs` | Data scope checks |

### 6.2 Cách kiểm tra permission trong Service

```csharp
// Check permission từ ICurrentUserService
// CurrentUser đã có roles và permissions nạp từ DB lúc login
// SYSTEM_ADMIN luôn bypass tất cả check
```

### 6.3 Seed data

Permission được seed trong `Infrastructure/Persistence/Seed/SeedAuthData.cs` — gọi từ `AppDbContextSeed.SeedAsync()`. Chạy `dotnet ef database update` để seed.

---

## 7. Entity Framework Core Convention

### 7.1 Entity location + configuration

```
Domain/Entities/<Module>/<Module>.cs         ← Entity classes
Infrastructure/Persistence/Configurations/<Module>/<Entity>Configuration.cs  ← Fluent config
```

### 7.2 Configuration pattern

```csharp
public class YourEntityConfiguration : IEntityTypeConfiguration<YourEntity>
{
    public void Configure(EntityTypeBuilder<YourEntity> builder)
    {
        builder.ToTable("your_entities");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(e => e.Status)
            .HasConversion<string>()   // Enum → string trong DB
            .HasMaxLength(50);

        builder.HasOne(e => e.Parent)
            .WithMany(p => p.Children)
            .HasForeignKey(e => e.ParentId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
```

### 7.3 Migration

```bash
# Tạo migration mới
dotnet ef migrations add <MigrationName> \
  --project src/DigiTalent.Infrastructure \
  --startup-project src/DigiTalent.Api

# Apply
dotnet ef database update \
  --project src/DigiTalent.Infrastructure \
  --startup-project src/DigiTalent.Api
```

**QUY TẮC:** Tạo migration mới cho MỌI thay đổi entity/configuration. KHÔNG sửa migration cũ đã push.

---

## 8. Cấu trúc thư mục chi tiết — NƠI ĐẶT FILE

| Bạn muốn... | Đặt vào đây | Ví dụ |
|---|---|---|
| Entity mới | `Domain/Entities/<Module>/` | `Entities/Learning/Course.cs` |
| Enum mới | `Domain/Enums/` | `Domain.Enums.UserStatus` |
| DTO Request/Response | `Application/<Module>/DTOs/` | `Application/Courses/DTOs/CourseDtos.cs` |
| Service mới | `Application/<Module>/Services/` | `Application/Courses/Services/CourseService.cs` |
| Interface mới | `Application/Common/Interfaces/` | `ICourseRepository.cs` |
| EF Configuration | `Infrastructure/Persistence/Configurations/<Module>/` | `Configurations/Learning/CourseConfiguration.cs` |
| Seed data | `Infrastructure/Persistence/Seed/` | `SeedCourseData.cs` |
| Controller mới | `Api/Controllers/V1/` | `CoursesController.cs` |
| Middleware mới | `Api/Middlewares/` |  |
| Authorization | `Api/Authorization/` |  |
| Constant mới | `Shared/Constants/` |  |
| Error code mới | `Shared/Errors/ErrorCodes.cs` |  |
| Helper/Utility | `Shared/Security/` hoặc `Shared/` |  |

---

## 9. Controller Registration — KHÔNG cần làm gì

`builder.Services.AddControllers()` trong `Program.cs` quét tất cả `[ApiController]`. Không cần register từng controller.

### Service DI — Thêm vào Program.cs

```csharp
// Program.cs
builder.Services.AddScoped<YourService>();
builder.Services.AddScoped<AnotherService>();
```

---

## 10. Auditing — Khi nào cần

```csharp
// Gọi audit log cho sensitive action
await _auditLog.LogAsync(
    action: "certificate.issue",
    targetType: "Certificate",
    targetId: certificate.Id,
    reason: reason,
    before: null,
    after: new { certificate.Status, certificate.IssuedAt }
);
```

**Các action bắt buộc audit** (theo RBAC doc §12):
- Role assignment/removal
- Score override/regrade
- Certificate issue/revoke/renew
- Task evaluation
- Competency level override
- Config/threshold changes

---

## 11. GitHub Action CI

File: `.github/workflows/backend-ci.yml`

CI tự chạy khi push lên `main`, `develop`, hoặc mở PR. Nó sẽ:
1. `dotnet restore`
2. `dotnet build`
3. `dotnet test` (nếu có tests)

**Trước khi push:** Chạy `dotnet build` local — đảm bảo không lỗi.

---

## 12. Quy tắc tránh conflict

### File chung — CHỈ 1 người sửa 1 lúc

| File | Ai sửa |
|---|---|
| `Program.cs` | Trưởng nhóm backend |
| `AppDbContext.cs` | Trưởng nhóm (thêm DbSet cho entity mới) |
| `PermissionConstants.cs` | **DONE** — chỉ sửa khi RBAC doc thay đổi |
| `IApplicationDbContext.cs` | Trưởng nhóm (thêm DbSet cho entity mới) |
| `AppDbContextSeed.cs` | Trưởng nhóm (thêm gọi seed mới) |

### Module — Mỗi người 1 module

| Module | Người | Entities | Services | Controllers |
|---|---|---|---|---|
| Auth | **Done** | User, Role, Permission, RefreshToken | AuthService, JwtTokenService | AuthController |
| Organization | **Done** | Department, JobPosition, Employee | OrganizationService | OrganizationsController |
| Competency | **Done** | CompetencyCategory, Competency... | CompetencyService | CompetenciesController |
| User Mgmt | **Done** | — | UserService | UsersController |
| Courses | **Done** | Course, Lesson, Enrollment... | CourseService, EnrollmentService | CoursesController |
| Assessment | **Done** | QuestionBank, Assessment, Attempt... | AttemptService | AssessmentsController |
| Certificate | 🔴 Cần làm | Certificate, Template... | **CẦN TẠO** | **CẦN TẠO** |
| Task | 🔴 Cần làm | PracticalTask, Submission... | **CẦN TẠO** | **CẦN TẠO** |
| Intelligence | 🔴 Cần làm | SkillGap, Risk, Readiness... | **CẦN TẠO** | **CẦN TẠO** |
| Notification | 🔴 Cần làm | Notification, Preference... | **CẦN TẠO** | **CẦN TẠO** |
| Audit/Config | 🔴 Cần làm | — | **CẦN TẠO** | **CẦN TẠO** AuditLogsController |

---

## 13. Checklist trước khi push

- [ ] `dotnet build` — không lỗi
- [ ] Controller có `[HasPermission]` trên mọi endpoint
- [ ] Service không trả về Entity — đã project sang DTO
- [ ] Response dùng `ApiResponse<T>.Ok()` hoặc throw exception
- [ ] Migration mới nếu thay đổi entity/configuration
- [ ] Không hardcode string permission — dùng `PermissionConstants`
- [ ] Sensitive action có audit log
- [ ] Không sửa file chung (`Program.cs`, `AppDbContext.cs`, `IApplicationDbContext.cs`) khi chưa báo

---

## 14. FAQ

**Q: Làm sao để thêm entity mới vào DbContext?**
A: 1) Tạo entity trong `Domain/Entities/<Module>/`. 2) Tạo configuration trong `Infrastructure/Persistence/Configurations/<Module>/`. 3) Báo trưởng nhóm thêm `DbSet` vào `AppDbContext.cs` và `IApplicationDbContext.cs`. 4) Tạo migration.

**Q: Service của module khác có thể gọi service của module tôi không?**
A: Có — inject service của bạn vào service khác qua constructor. Nhưng cẩn thận circular dependency.

**Q: Dùng Minimal API hay Controller?**
A: **Controller.** Dự án đã dùng Controller cho tất cả. Không trộn lẫn.

**Q: Làm sao test API khi chưa có frontend?**
A: Swagger UI tại `http://localhost:5000/swagger`. Dùng seed account: `admin@digitalent.ai` / `Admin@1234`.

**Q: Thêm role mới thì sửa ở đâu?**
A: `Shared/Constants/RoleConstants.cs` + `Infrastructure/Persistence/Seed/SeedAuthData.cs` (seed role + permission mapping).

---

## 15. Module cần làm tiếp

| # | Module | Mức độ | Ghi chú |
|---|---|---|---|
| 1 | Certificate Controller + Service | 🔴 Cao | CRUD certificates + QR verify endpoint |
| 2 | Task Controller + Service | 🔴 Cao | CRUD tasks + assign, submit, evaluate |
| 3 | Intelligence Controller + Service | 🟡 Trung bình | Skill gap, risk, readiness endpoints |
| 4 | AuditLogs Controller + Service | 🟡 Trung bình | Read-only audit log browsing |
| 5 | Notification Controller + Service | 🟡 Trung bình | CRUD notifications + SignalR hub |
| 6 | File upload endpoints | 🟡 Trung bình | MinIO signed URL integration |
| 7 | Dashboard endpoints | 🟢 Thấp | Aggregation queries cho role dashboards |
| 8 | Scoring config endpoints | 🟢 Thấp | CRUD scoring weights/thresholds |
