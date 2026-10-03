# Quy tắc code Backend — bắt buộc tuân theo

> File này là **luật**. `DEVELOPER_GUIDE.md` là **hướng dẫn cách làm**. Git branch, commit, PR xem `../GIT-WORKFLOW-GUIDE.md`.
>
> Nguyên tắc số 1: **copy CRUD mẫu Department rồi đổi tên**. Đừng tự nghĩ cấu trúc riêng. Cả nhóm code giống nhau thì đọc code của nhau mới nhanh.

---

## 1. Ba điều không được vi phạm

| # | Luật | Vì sao |
|---|---|---|
| 1 | **Controller không chứa nghiệp vụ, không đụng database** | Nghiệp vụ nằm 1 chỗ (use case) thì mới test và sửa được |
| 2 | **Không trả entity ra ngoài**, luôn copy sang Output | Trả entity là lộ cột nội bộ, và đổi database là vỡ API |
| 3 | **Mọi action phải có `[HasPermission]`** (trừ login/logout) | Quên gắn là ai cũng gọi được, không cần đăng nhập |

---

## 2. Đặt tên

| Loại | Quy tắc | Ví dụ |
|---|---|---|
| Use case | `<Động từ><Danh từ>UseCase` | `CreateDepartmentUseCase` |
| Danh sách phân trang | `GetPaged<Danh từ số nhiều>` | `GetPagedDepartments` |
| Chi tiết | `Get<Danh từ>ById` | `GetDepartmentById` |
| File trong 1 use case | `...UseCase.cs`, `...UseCaseInput.cs`, `...UseCaseValidator.cs`, `...UseCaseOutput.cs` | |
| Controller | `<Danh từ số nhiều>Controller` | `DepartmentsController` |
| Route | chữ thường, số nhiều, gạch ngang | `api/v1/job-positions` |
| Entity | Số ít, đúng tên bảng | `Department` ↔ bảng `departments` |
| Namespace use case | `DigiTalent.Application.UseCases.<Danh từ số nhiều>` | `...UseCases.Departments` |

**Mỗi file 1 class.** Không nhét 2 class vào chung 1 file (trừ Output kèm class item của danh sách).

---

## 3. Đặt file ở đâu

```
Domain/Entities/<Module>/<Entity>.cs                     ← entity (đã có sẵn 59 bảng)
Domain/Constants/Authorization/Permissions.cs            ← mã quyền
Application/UseCases/<Module>/<Entity số nhiều>/<UseCase>/  ← 3-4 file của 1 use case
Application/Common/                                      ← dùng chung, ÍT khi phải sửa
Infrastructure/Persistence/Configurations/<Module>/      ← map entity với bảng
Api/Controllers/<Entity số nhiều>Controller.cs           ← controller
```

Module gồm: `Auth`, `Organization`, `Competency`, `Learning`, `Task`, `Assessment`, `Certificate`, `Intelligence`, `Shared`.

---

## 4. Quy tắc từng tầng

| Tầng | Được làm | Cấm |
|---|---|---|
| **Domain** | Khai báo entity, hằng số | Gọi database, dùng EF Core, viết nghiệp vụ |
| **Application** | Use case, validator, interface | Dùng `HttpContext`, `Request`, `IActionResult` |
| **Infrastructure** | Map bảng, JWT, mã hóa mật khẩu | Viết nghiệp vụ |
| **Api** | Nhận request → gọi use case → trả `ApiResponse` | Viết nghiệp vụ, gọi `DbContext` |

Use case **chỉ** được dùng `IApplicationDbContext`, không dùng `AppDbContext`.

---

## 5. Viết use case

Khuôn bắt buộc, đánh số từng bước cho dễ đọc:

```csharp
public class CreateDepartmentUseCase : IUseCase<CreateDepartmentUseCaseInput, CreateDepartmentUseCaseOutput>
{
    private readonly IApplicationDbContext _context;

    public CreateDepartmentUseCase(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CreateDepartmentUseCaseOutput> ExecuteAsync(CreateDepartmentUseCaseInput input)
    {
        // 1. Kiểm tra nghiệp vụ, sai thì throw
        // 2. Đọc / ghi database
        // 3. Trả Output
    }
}
```

**Bắt buộc:**
- Đúng **1 method** `ExecuteAsync`. Cần dùng lại đoạn code thì tách method `private` trong cùng class.
- Lỗi thì `throw`, **không** `return null` hay trả cờ `IsSuccess`.
- Query có `Select(...)` sang Output, đừng `ToList()` cả entity rồi mới map.
- Dữ liệu luôn lọc theo tổ chức: `Where(x => x.OrganizationId == _currentUser.OrganizationId)`.

**Cấm:**
- Use case này gọi use case khác. Cần dùng chung thì tách helper hoặc viết lại truy vấn.
- Viết SQL thô, trừ khi có lý do rõ và ghi comment giải thích.

---

## 6. Controller

Mỗi action đúng 3 dòng: nhận input, gọi use case, bọc `ApiResponse`.

```csharp
[HttpPost]
[HasPermission(Permissions.Department.CreateUpdate)]
public async Task<ActionResult<ApiResponse<CreateDepartmentUseCaseOutput>>> Create(
    [FromBody] CreateDepartmentUseCaseInput input,
    [FromServices] IUseCase<CreateDepartmentUseCaseInput, CreateDepartmentUseCaseOutput> useCase)
{
    var result = await useCase.ExecuteAsync(input);
    return Ok(ApiResponse<CreateDepartmentUseCaseOutput>.Ok(result, "Department created."));
}
```

- Id lấy từ URL thì gán `input.Id = id;`, và property đó phải có `[JsonIgnore]`.
- Không `try/catch` trong controller. Middleware lo hết.

---

## 7. Kiểm tra dữ liệu

| Loại kiểm tra | Viết ở đâu |
|---|---|
| Rỗng, độ dài, email, số âm, ngày tương lai | **Validator** (`...UseCaseValidator.cs`) |
| Trùng mã, không tồn tại, còn dữ liệu con | **Use case**, rồi `throw` |

Độ dài trong validator phải **khớp với cột trong database** (VD `code varchar(50)` → `MaximumLength(50)`).

---

## 8. Lỗi trả về

| Throw | Status |
|---|---|
| *(validator tự throw)* | 400 |
| `BadRequestException` | 400 |
| `ForbiddenException` | 403 |
| `NotFoundException` | 404 |
| `ConflictException` | 409 |

Thông điệp lỗi viết **tiếng Anh**, ngắn, không lộ thông tin nhạy cảm. Ví dụ đúng: `"Invalid email or password."` — không ghi rõ sai email hay sai mật khẩu.

---

## 9. Phân quyền

1. Thêm hằng số mã quyền vào `Domain/Constants/Authorization/Permissions.cs`, lấy **đúng mã trong doc 09 mục 6**.
2. Thêm dòng vào bảng `permissions` và `role_permissions` trong database.
3. Gắn `[HasPermission(...)]` lên **mọi** action.
4. Giới hạn theo dữ liệu (VD manager chỉ xem phòng mình) thì kiểm tra trong use case bằng `ICurrentUser`.

Không tự nghĩ mã quyền mới ngoài doc 09. Doc thiếu mã thì báo nhóm, sửa doc trước.

---

## 10. Database

- **Không dùng migration.** Database là gốc.
- Cần thêm/sửa bảng: sửa `docs/db/schema.sql` → báo nhóm → chạy SQL trên Neon → sinh lại entity (xem mục 11 `DEVELOPER_GUIDE.md`).
- **Không tự ý xóa/sửa dữ liệu trên Neon**, cả nhóm xài chung một database.
- Mật khẩu kết nối khai báo bằng `dotnet user-secrets`. **Tuyệt đối không commit** vào `appsettings.json`, repo này public.

---

## 11. Checklist trước khi tạo Pull Request

- [ ] `dotnet build` không lỗi
- [ ] Đã test bằng Swagger với **ít nhất 2 tài khoản khác role** (1 có quyền, 1 không có → phải ra 403)
- [ ] Mọi action có `[HasPermission]`
- [ ] Mã quyền mới đã thêm vào database
- [ ] Không trả entity, chỉ trả Output
- [ ] Input nhận từ body/query có Validator
- [ ] Không commit connection string, mật khẩu, token
- [ ] Đặt tên file và thư mục đúng mục 2 và 3
- [ ] Tự đọc lại diff một lượt trước khi tạo PR

---

## 12. Lỗi hay gặp

| Sai | Đúng |
|---|---|
| Viết query trong controller | Đưa hết vào use case |
| `return BadRequest("...")` trong use case | `throw new BadRequestException("...")` |
| Trả `Department` entity cho frontend | Trả `GetDepartmentByIdUseCaseOutput` |
| Một use case làm 3 việc khác nhau | Tách thành 3 use case |
| Sửa `Program.cs` để đăng ký use case | Không cần, hệ thống tự đăng ký |
| Quên `[HasPermission]` | API mở toang cho mọi người |
| Đặt tên `DepartmentService`, `DepartmentRepository` | Dự án không có Service/Repository, chỉ có use case |
