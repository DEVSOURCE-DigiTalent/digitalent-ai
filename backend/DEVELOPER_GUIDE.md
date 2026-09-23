# Backend DigiTalent — Hướng dẫn cho dev

> Đọc hết file này trước khi code. Làm module mới thì **copy CRUD mẫu Department** rồi đổi tên — đừng tự nghĩ cấu trúc khác.

---

## 1. Chạy project

**Cần cài:** .NET 8 SDK, PostgreSQL (dùng Docker cho nhanh).

```bash
# 1. Bật PostgreSQL
cd docker
docker compose up -d postgres

# 2. Cài công cụ migration (chỉ cần 1 lần, lấy đúng version trong .config/dotnet-tools.json)
cd ../backend
dotnet tool restore

# 3. Chạy API
dotnet run --project src/DigiTalent.Api
```

- Swagger: http://localhost:5000/swagger
- Lần chạy đầu, API **tự tạo bảng + tài khoản mẫu** (chỉ ở môi trường Development).
- Connection string nằm trong `src/DigiTalent.Api/appsettings.json`.

**Tài khoản mẫu** (mật khẩu chung `Admin@1234`), mỗi role 1 tài khoản để test phân quyền:

| Email | Role |
|---|---|
| admin@digitalent.ai | SYSTEM_ADMIN |
| hr@digitalent.ai | HR_MANAGER |
| manager@digitalent.ai | DEPARTMENT_MANAGER |
| trainer@digitalent.ai | TRAINER |
| employee@digitalent.ai | EMPLOYEE |
| verifier@digitalent.ai | CERTIFICATE_VERIFIER |

**Test API cần đăng nhập trên Swagger:** gọi `POST /api/v1/auth/login` → copy `accessToken` → bấm nút **Authorize** (góc phải trên) → dán token → OK.

> ⚠️ Nếu máy bạn còn database `digitalent` của backend cũ, API sẽ báo lỗi *"relation ... already exists"*. Xóa DB cũ rồi chạy lại:
>
> ```bash
> docker exec -it digitalent-postgres psql -U digitalent_app -d postgres -c "DROP DATABASE digitalent WITH (FORCE);" -c "CREATE DATABASE digitalent;"
> ```

---

## 2. Cấu trúc project

```
backend/src/
├── DigiTalent.Domain/          Entity (class ánh xạ với bảng). Không phụ thuộc project nào.
├── DigiTalent.Application/     Use case (nghiệp vụ) + validator.       → dùng Domain
├── DigiTalent.Infrastructure/  Database: DbContext, cấu hình bảng, migration. → dùng Application
└── DigiTalent.Api/             Controller, middleware, Program.cs.     → dùng Application + Infrastructure
```

| Project | Được làm | KHÔNG được làm |
|---|---|---|
| Domain | Khai báo entity | Gọi database, dùng EF Core |
| Application | Viết use case, validator | Dùng HttpContext, Request, Controller |
| Infrastructure | Cấu hình bảng, migration | Viết nghiệp vụ |
| Api | Nhận request → gọi use case → trả response | Viết nghiệp vụ, truy vấn database |

---

## 3. Một request chạy như thế nào

```
Frontend
   │  POST /api/v1/departments  { "code": "IT", "name": "Công nghệ" }
   ▼
Controller ──► Validator (tự chạy) ──► UseCase ──► IApplicationDbContext ──► PostgreSQL
                    │                     │
                    │ Input sai           │ throw NotFoundException / ConflictException
                    ▼                     ▼
              ExceptionHandlingMiddleware ──► trả ApiResponse lỗi (400 / 404 / 409)
```

- **Controller** chỉ nhận dữ liệu, gọi use case, bọc kết quả vào `ApiResponse`.
- **Validator** tự chạy trước use case, không cần gọi.
- **Use case** chứa toàn bộ nghiệp vụ. Gặp lỗi thì `throw`, không `return` lỗi.

---

## 4. Use case — quy tắc

**1 hành động = 1 folder, mỗi file 1 class:**

```
UseCases/<Module>/<Entity số nhiều>/<TênUseCase>/
├── <TênUseCase>UseCase.cs           ← class xử lý, có 1 method ExecuteAsync
├── <TênUseCase>UseCaseInput.cs      ← dữ liệu vào
├── <TênUseCase>UseCaseValidator.cs  ← rule kiểm tra Input (chỉ tạo khi có cái cần kiểm tra)
└── <TênUseCase>UseCaseOutput.cs     ← dữ liệu trả về
```

Input nhận từ body/query (Create, Update, GetPaged…) thì **phải có** Validator. Input chỉ có Id lấy từ URL (GetById, Delete) thì không cần.

| Hành động | Tên use case |
|---|---|
| Danh sách (phân trang) | `GetPaged<Entity số nhiều>` |
| Chi tiết | `Get<Entity>ById` |
| Tạo | `Create<Entity>` |
| Sửa | `Update<Entity>` |
| Xóa | `Delete<Entity>` |
| Hành động nghiệp vụ | Động từ + danh từ: `AssignTask`, `IssueCertificate`, `SubmitAttempt`… |

- Mọi use case của 1 entity dùng **chung 1 namespace**: `DigiTalent.Application.UseCases.<Entity số nhiều>`.
- **Không cần đăng ký DI**, không cần sửa `Program.cs`. Use case và validator được tự đăng ký.

---

## 5. CRUD mẫu: Department

Code: [src/DigiTalent.Application/UseCases/Organization/Departments/](src/DigiTalent.Application/UseCases/Organization/Departments/) và [DepartmentsController.cs](src/DigiTalent.Api/Controllers/DepartmentsController.cs)

| Chức năng | API | Use case | Học được gì |
|---|---|---|---|
| Danh sách | `GET /api/v1/departments?pageIndex=1&pageSize=20&search=it` | `GetPagedDepartments` | Phân trang, tìm kiếm, lọc |
| Chi tiết | `GET /api/v1/departments/{id}` | `GetDepartmentById` | `Select` sang Output, 404 |
| Tạo | `POST /api/v1/departments` | `CreateDepartment` | Validator, check trùng mã → 409 |
| Sửa | `PUT /api/v1/departments/{id}` | `UpdateDepartment` | Id lấy từ URL, check trùng trừ chính nó |
| Xóa | `DELETE /api/v1/departments/{id}` | `DeleteDepartment` | 404, chỗ đặt kiểm tra ràng buộc trước khi xóa |

---

## 6. Làm chức năng mới — từng bước

Ví dụ làm CRUD **JobPosition** (chức danh) trong module Organization:

1. **Entity:** tạo `Domain/Entities/Organization/JobPosition.cs`, kế thừa `BaseEntity`, namespace `DigiTalent.Domain.Entities`.
2. **Cấu hình bảng:** tạo `Infrastructure/Persistence/Configurations/Organization/JobPositionConfiguration.cs` (copy từ `DepartmentConfiguration`).
3. **DbSet:** thêm `DbSet<JobPosition> JobPositions` vào **cả 2 file**: `IApplicationDbContext.cs` và `AppDbContext.cs`.
4. **Migration:**
   ```bash
   dotnet ef migrations add AddJobPosition --project src/DigiTalent.Infrastructure --startup-project src/DigiTalent.Api --output-dir Persistence/Migrations
   ```
5. **Use case:** copy folder `UseCases/Organization/Departments` thành `UseCases/Organization/JobPositions`, đổi `Department` → `JobPosition`.
6. **Quyền:** thêm mã quyền vào `Permissions.cs` và khai báo role nào được dùng trong `RolePermissions.cs` (xem mục 8).
7. **Controller:** copy `DepartmentsController.cs` thành `JobPositionsController.cs`, đổi tên tương tự, gắn `[HasPermission(...)]` cho **mọi** action.
8. **Chạy và test bằng Swagger** với vài tài khoản mẫu khác role.

---

## 7. Kiểm tra ở Validator hay Use case?

| Loại kiểm tra | Viết ở đâu | Ví dụ |
|---|---|---|
| Không cần đọc database | **Validator** (file `...UseCaseValidator.cs`) | Rỗng, độ dài, email, số âm, ngày trong tương lai |
| Cần đọc database | **Use case** → `throw` | Trùng mã, không tồn tại, còn dữ liệu con nên không được xóa |

---

## 8. Phân quyền

**Ý tưởng:** mỗi quyền là 1 **mã chuỗi** (VD `department.create_update`). Mỗi role được gán 1 danh sách mã.
Khi gọi API, backend lấy role trong token → tra xem role đó có mã quyền mà API yêu cầu không.

```
Đăng nhập ──► BE tạo token chứa: Id, email, role (VD "EMPLOYEE")
                │
FE lưu token, gửi kèm mọi request:  Authorization: Bearer <token>
                │
[HasPermission("department.create_update")]
   ├─ không có token / token sai / hết hạn  → 401
   ├─ role trong token KHÔNG có mã này       → 403
   └─ có                                     → chạy action
```

**3 file cần biết** (trong `Domain/Constants/Authorization/`):

| File | Chứa gì |
|---|---|
| `Roles.cs` | 6 mã role. Frontend dùng đúng các mã này, **không đổi tên** |
| `Permissions.cs` | Mã quyền, copy **đúng** mã trong doc 09 mục 6 (frontend cũng dùng mã y hệt) |
| `RolePermissions.cs` | **Bảng phân quyền**: role nào có mã nào. `SYSTEM_ADMIN` có tất cả |

**Làm module mới cần quyền** (VD Job Position):

```csharp
// 1. Permissions.cs — thêm mã (lấy từ doc 09)
public static class JobPosition
{
    public const string Read = "job_position.read";
    public const string CreateUpdate = "job_position.create_update";
}

// 2. RolePermissions.cs — thêm mã vào role được phép (theo bảng doc 09)
[Roles.HrManager] = new[] { ..., Permissions.JobPosition.Read, Permissions.JobPosition.CreateUpdate },
[Roles.Employee]  = new[] { ..., Permissions.JobPosition.Read },

// 3. Controller — gắn lên từng action
[HttpPost]
[HasPermission(Permissions.JobPosition.CreateUpdate)]
public async Task<...> Create(...)
```

**Quyền theo dữ liệu** (VD manager chỉ xem nhân viên phòng mình): `[HasPermission]` chỉ biết "có được gọi API không".
Muốn giới hạn **dữ liệu** thì inject `ICurrentUser` vào use case để lọc, hoặc `throw new ForbiddenException(...)`.

> Token hết hạn sau 8 tiếng (`Jwt:ExpiresInMinutes` trong appsettings) → FE tự chuyển về trang login. Chưa có refresh token.

---

## 9. Lỗi → status code

Trong use case chỉ cần `throw`. Middleware tự đổi thành response.

| Throw gì | Status | Khi nào |
|---|---|---|
| *(validator tự throw)* | 400 | Input sai |
| `BadRequestException` | 400 | Yêu cầu sai mà cần đọc DB mới biết (VD sai mật khẩu) |
| *([HasPermission] tự trả)* | 401 | Chưa đăng nhập, token sai hoặc hết hạn |
| `ForbiddenException` | 403 | Không được phép (cũng là mã [HasPermission] trả khi thiếu quyền) |
| `NotFoundException` | 404 | Không tìm thấy dữ liệu |
| `ConflictException` | 409 | Trùng dữ liệu, vi phạm quy tắc nghiệp vụ |
| Exception khác | 500 | Bug (đã ghi log) |

---

## 10. Format response

Mọi API đều trả cùng một khuôn:

```json
// Thành công
{ "success": true, "message": "Department created.", "data": { "id": "..." }, "errors": [] }

// Lỗi validate (400)
{
  "success": false,
  "message": "Validation failed.",
  "data": null,
  "errors": [ { "field": "code", "message": "'Code' must not be empty." } ]
}
```

---

## 11. Migration

Chọn 1 trong 2 cách.

**Cách 1 — Terminal** (đứng ở thư mục `backend/`, đã chạy `dotnet tool restore`):

```bash
# Tạo migration khi thêm/sửa entity hoặc configuration
dotnet ef migrations add <TenMigration> --project src/DigiTalent.Infrastructure --startup-project src/DigiTalent.Api --output-dir Persistence/Migrations

# Xóa migration vừa tạo (CHƯA push)
dotnet ef migrations remove --project src/DigiTalent.Infrastructure --startup-project src/DigiTalent.Api

# Apply xuống database (thường không cần — xem bên dưới)
dotnet ef database update --project src/DigiTalent.Infrastructure --startup-project src/DigiTalent.Api
```

**Cách 2 — Visual Studio:** *Tools → NuGet Package Manager → Package Manager Console*, chọn **Default project = DigiTalent.Infrastructure**, Startup project = **DigiTalent.Api**:

```powershell
Add-Migration <TenMigration> -OutputDir Persistence/Migrations
Remove-Migration
Update-Database
```

Không cần chạy `database update`: môi trường Development tự apply khi start API.
**Không sửa migration đã push**. Cần đổi gì thì tạo migration mới.

---

## 12. Checklist trước khi push

- [ ] `dotnet build` không lỗi
- [ ] **Mọi action có `[HasPermission]`** (trừ login). Quên gắn = ai cũng gọi được, không cần đăng nhập
- [ ] Mã quyền mới đã khai báo trong `RolePermissions.cs` (không thì chỉ SYSTEM_ADMIN dùng được)
- [ ] Controller không có logic, không dùng DbContext
- [ ] Không trả entity ra ngoài: luôn copy sang Output
- [ ] Input nhận từ body có Validator
- [ ] Có sửa entity hoặc configuration thì có migration mới
- [ ] Đặt tên và đặt folder đúng quy tắc mục 4
