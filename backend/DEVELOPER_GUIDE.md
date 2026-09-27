# Backend DigiTalent — Hướng dẫn cho dev

> Đọc hết file này trước khi code. Làm module mới thì **copy CRUD mẫu Department** rồi đổi tên — đừng tự nghĩ cấu trúc khác.

---

## 1. Chạy project

**Cần cài:** .NET 8 SDK. Database dùng chung trên **Neon** (PostgreSQL trên cloud), không cần cài gì thêm.

**Khai báo connection string** (làm 1 lần trên máy bạn). KHÔNG bỏ mật khẩu vào `appsettings.json` vì repo là public:

```bash
cd backend/src/DigiTalent.Api
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=<host>.aws.neon.tech;Database=neondb;Username=<user>;Password=<password>;SSL Mode=Require;Trust Server Certificate=true"
```

Xin thông tin kết nối Neon từ trưởng nhóm. File này nằm ngoài repo nên không bị push lên.

```bash
cd backend
dotnet tool restore              # chỉ cần 1 lần, cài dotnet-ef
dotnet run --project src/DigiTalent.Api
```

- Swagger: http://localhost:5000/swagger
- **API không tự tạo bảng.** Schema do file SQL quản lý, xem mục 11.

**Test API cần đăng nhập trên Swagger:** gọi `POST /api/v1/auth/login` → copy `accessToken` → bấm nút **Authorize** (góc phải trên) → dán token → OK.

---

## 2. Cấu trúc project

```
backend/src/
├── DigiTalent.Domain/          Entity (class ánh xạ với bảng). Không phụ thuộc project nào.
├── DigiTalent.Application/     Use case (nghiệp vụ) + validator.       → dùng Domain
├── DigiTalent.Infrastructure/  Database: DbContext, cấu hình bảng, JWT.     → dùng Application
└── DigiTalent.Api/             Controller, middleware, Program.cs.     → dùng Application + Infrastructure
```

| Project | Được làm | KHÔNG được làm |
|---|---|---|
| Domain | Khai báo entity | Gọi database, dùng EF Core |
| Application | Viết use case, validator | Dùng HttpContext, Request, Controller |
| Infrastructure | Cấu hình bảng, kết nối database, JWT | Viết nghiệp vụ |
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

Ví dụ làm CRUD **JobPosition** (chức danh) trong module Organization.

**Entity đã có sẵn hết rồi** — cả 59 bảng trong database đều đã có entity trong `Domain/Entities/` và file configuration tương ứng. Nên thường bạn chỉ cần làm từ bước 1:

1. **Use case:** copy folder `UseCases/Organization/Departments` thành `UseCases/Organization/JobPositions`, đổi `Department` → `JobPosition`.
2. **Quyền:** thêm mã quyền vào `Permissions.cs` (mục 8), và thêm dòng vào bảng `role_permissions` trong database cho role được phép.
3. **Controller:** copy `DepartmentsController.cs` thành `JobPositionsController.cs`, đổi tên tương tự, gắn `[HasPermission(...)]` cho **mọi** action.
4. **Chạy và test bằng Swagger** với vài tài khoản khác role.

Chỉ khi **thêm bảng mới vào database** thì mới cần thêm entity — xem mục 11.

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

**Mã quyền nằm ở đâu:**

| Chỗ | Chứa gì |
|---|---|
| `Domain/Constants/Authorization/Roles.cs` | 5 mã role. Frontend dùng đúng các mã này, **không đổi tên** |
| `Domain/Constants/Authorization/Permissions.cs` | Hằng số mã quyền để gắn vào controller, copy **đúng** mã trong doc 09 mục 6 |
| Bảng `permissions` + `role_permissions` trong **database** | **Bảng phân quyền thật**: role nào có mã nào. Backend đọc từ đây (cache 5 phút) |

`SYSTEM_ADMIN` luôn được đi qua, không cần khai báo quyền.

**Làm module mới cần quyền** (VD Job Position):

```csharp
// 1. Permissions.cs — thêm hằng số (lấy mã từ doc 09)
public static class JobPosition
{
    public const string Read = "job_position.read";
    public const string CreateUpdate = "job_position.create_update";
}
```

```sql
-- 2. Chạy trên Neon: thêm mã quyền và gán cho role được phép (theo bảng doc 09)
INSERT INTO permissions (id, code, module, action)
VALUES (gen_random_uuid(), 'job_position.read', 'job_position', 'read');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.code = 'HR_MANAGER' AND p.code = 'job_position.read';
```

```csharp
// 3. Controller — gắn lên từng action
[HttpPost]
[HasPermission(Permissions.JobPosition.CreateUpdate)]
public async Task<...> Create(...)
```

Sửa quyền trong database xong thì tối đa 5 phút sau là có hiệu lực, user **không cần đăng nhập lại**.

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

## 11. Đổi schema database

**Database là gốc, KHÔNG dùng migration.** Code không tự tạo hay sửa bảng.

Thứ tự bắt buộc khi cần thêm/sửa bảng:

```
1. Sửa file schema SQL (docs/db/schema.sql) — đây là bản gốc của cả nhóm
2. Chạy câu lệnh SQL đó trên Neon (SQL Editor)
3. Sinh lại entity từ database (lệnh scaffold bên dưới)
4. Chép entity + configuration của bảng vừa đổi sang Domain/Infrastructure
5. Thêm DbSet vào IApplicationDbContext.cs và AppDbContext.cs
```

**Lệnh sinh lại entity từ database:**

```bash
cd backend
dotnet ef dbcontext scaffold "<connection string Neon>" Npgsql.EntityFrameworkCore.PostgreSQL --project src/DigiTalent.Infrastructure --startup-project src/DigiTalent.Api --context ScaffoldDbContext --context-namespace DigiTalent.Infrastructure.Scaffold --namespace DigiTalent.Infrastructure.Scaffold --output-dir Scaffold/Entities --context-dir Scaffold --no-onconfiguring --force
```

Code sinh ra chỉ là **bản nháp**, phải lọc lại rồi mới đưa vào `Domain/Entities/<Module>/`:

| Code gen ra | Sửa thành |
|---|---|
| `namespace DigiTalent.Infrastructure.Scaffold.Entities;` | `namespace DigiTalent.Domain.Entities;` |
| `public partial class X` | `public class X` |
| Mọi dòng có `virtual` (navigation) | **Xóa hết** |
| `= null!;` sau property string | `= string.Empty;` |
| `DateTime` | `DateTimeOffset` |

Có đủ 2 cột `CreatedAt` + `UpdatedAt` thì thêm `: IHasTimestamps` để được tự điền thời gian.

File configuration chỉ cần 3 thứ, lấy từ `ScaffoldDbContext.cs`: `ToTable`, `HasKey`, và cột đặc biệt (`jsonb`, `HasPrecision`). Bỏ hết `HasColumnName` vì project tự đổi tên cột sang snake_case.

**Xong nhớ xóa thư mục `Scaffold/`, đừng commit.**

---

## 12. Checklist trước khi push

- [ ] `dotnet build` không lỗi
- [ ] **Mọi action có `[HasPermission]`** (trừ login). Quên gắn = ai cũng gọi được, không cần đăng nhập
- [ ] Mã quyền mới đã thêm vào bảng `permissions` + `role_permissions` trong database (không thì chỉ SYSTEM_ADMIN dùng được)
- [ ] Controller không có logic, không dùng DbContext
- [ ] Không trả entity ra ngoài: luôn copy sang Output
- [ ] Input nhận từ body có Validator
- [ ] Có đổi bảng trong database thì đã cập nhật `docs/db/schema.sql` và sinh lại entity (mục 11)
- [ ] Đặt tên và đặt folder đúng quy tắc mục 4
