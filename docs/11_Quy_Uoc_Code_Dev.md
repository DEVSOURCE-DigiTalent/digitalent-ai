# 11 — Quy Ước Code & Phát Triển

> Nguồn gốc: `CLAUDE.md` (repo) + `backend/DEVELOPER_GUIDE.md` + `frontend/DEVELOPER_GUIDE.md` (thực tế). Phiên bản docs_v3, tiếng Việt.

---

## 1. Kiểm soát tài liệu

| Mục | Giá trị |
|-----|---------|
| Tên tài liệu | Quy ước code & phát triển |
| Phiên bản | 3.0 |
| Trạng thái | Bản nháp |
| Chủ sở hữu | Trần Văn Linh (Leader) |
| Căn cứ | CLAUDE.md + DEVELOPER_GUIDE (backend/frontend) |

**Lịch sử chỉnh sửa**

| Ngày | Phiên bản | Mô tả |
|------|-----------|-------|
| 16/09/2026 | 3.0 | Chuyển ngữ; quy ước backend + frontend theo code thực tế |

---

## 2. Mục đích và phạm vi

Quy ước bắt buộc để code đồng bộ, dễ review và giữ kiến trúc sạch: **Backend (Clean Architecture)** và **Frontend (React SPA)**. Đây là chuẩn để mọi Pull Request được review đúng mức.

**Ngoài phạm vi:** Git workflow (12), chiến lược test (13), bảo mật (15).

---

## 3. Nguyên tắc chung

| Nguyên tắc | Áp dụng |
|-----------|---------|
| KISS / DRY / YAGNI | Trích hàm khi lặp thật, không đoán trước trừu tượng |
| Immutability | Không mutate object gốc — trả bản mới |
| File nhỏ | 200–400 dòng điển hình, ≤800 dòng |
| Fail fast | Validate tại biên hệ thống, lỗi rõ ràng |
| No magic number | Hằng số có tên cho ngưỡng/độ trễ/giới hạn |

---

## 4. Backend — Clean Architecture (bắt buộc)

### 4.1 Cấu trúc project

Năm project, chiều phụ thuộc nghiêm ngặt `Api → Application → Domain` và `Api → Infrastructure → Application`:

| Project | Chứa gì | Không được |
|---------|---------|-----------|
| `DigiTalent.Domain` | Entities + enums | Không DB, không EF Core |
| `DigiTalent.Shared` | `ApiResponse`, `PagedList`, `ErrorCodes`, constants | Không tham chiếu project khác |
| `DigiTalent.Application` | DTO + Services + Interfaces | Không `HttpContext`, không `[Authorize]` |
| `DigiTalent.Infrastructure` | EF Core, JWT, MinIO, Seed, CurrentUser | Không trả entity (project sang DTO) |
| `DigiTalent.Api` | Controllers, Middleware, Authorization, Program.cs | Không business logic |

### 4.2 Quy tắc bắt buộc

| # | Quy tắc |
|---|---------|
| 1 | **Controller → Service → DTO.** Controller không chứa logic nghiệp vụ. |
| 2 | Response luôn bọc `ApiResponse<T>.Ok(data)` / `ApiResponse<T>.Fail(...)`. |
| 3 | Lỗi ném exception, để `ExceptionHandlingMiddleware` map HTTP (`KeyNotFoundException → 404`, `UnauthorizedAccessException → 401/403`, `ValidationException → 400`). |
| 4 | Controllers ở `Api/Controllers/V1/` (route `api/v1`), mỗi module một controller. |
| 5 | Service là class thường, inject qua DI trong `Program.cs`. |
| 6 | Entity cấu hình **Fluent API** ở `Infrastructure/Persistence/Configurations/<Module>/<Entity>Configuration.cs`. |
| 7 | Enum lưu string: `HasConversion<string>()`. |
| 8 | Entity mới → configuration mới → thêm `DbSet` vào **cả** `AppDbContext` + `IApplicationDbContext` → migration mới. |
| 9 | Không sửa migration đã push; thêm migration mới. |
| 10 | DI phụ thuộc `IApplicationDbContext` (interface), không phụ thuộc `AppDbContext`. |
| 11 | Mỗi endpoint gắn `[HasPermission(PermissionConstants.X)]`. |
| 12 | Data scope qua `ResourceScopeAuthorizationService` (`EnsureDepartmentAccess`, `EnsureOwnership`, `EnsureGlobalAccess`, `EnsureTrainerAccess`). |
| 13 | Hành động nhạy cảm ghi `AuditLogService.LogAsync(...)` (đổi role, override điểm, cấp/revoke chứng chỉ, đánh giá task, override competency). |

### 4.3 File single-owner (phối hợp trước khi sửa)

| File | Lý do |
|------|-------|
| `Api/Program.cs` | Điểm khởi tạo, DI |
| `Infrastructure/Persistence/AppDbContext.cs` | DbSet trung tâm |
| `Application/Common/Interfaces/IApplicationDbContext.cs` | Interface DbSet |
| `Infrastructure/Persistence/Seed/AppDbContextSeed.cs` | Dữ liệu gốc |
| `Shared/Constants/PermissionConstants.cs` | 119 permission key — đóng băng trừ khi RBAC đổi |

> `PermissionConstants.cs` là nguồn sự thật (map từ file 09). Frontend mirror ở `hooks/use-permission.ts`.

### 4.4 Transaction boundary

Thao tác đa bảng phải trọn vẹn hoặc không (03B §5.2): cấp chứng chỉ, xác nhận evidence, kích hoạt requirement set (archive bản cũ cùng giao dịch — BR-03). Dùng `IApplicationDbContext` transaction.

---

## 5. Frontend — React SPA (bắt buộc)

### 5.1 Cấu trúc `frontend/src/`

| Thư mục | Vai trò |
|---------|---------|
| `app/` | `router.tsx` (toàn bộ route, một file) + `providers.tsx` (React Query) |
| `components/` | `guards/` (AuthGuard, RequirePermission, RequireRole), `layout/`, `shared/` (DataTable, PageHeader, StatusBadge, EmptyState…) |
| `features/<module>/pages/*.tsx` | Một page một file |
| `hooks/` | React Query hooks + Zustand stores |
| `lib/` | `constants.ts`, `sidebar-config.ts`, `utils.ts` (không React) |
| `services/` | API calls qua `apiClient` — `<module>.service.ts` |
| `types/` | Interface TS dùng chung (`api.ts`, `auth.ts`, `common.ts`) |

### 5.2 Quy tắc bắt buộc

| # | Quy tắc |
|---|---------|
| 1 | Data fetching: **TanStack Query**; client/auth state: **Zustand** (`useCurrentUser`) — không thêm pattern khác. |
| 2 | API chỉ qua `apiClient` (`services/api-client.ts`) — không `fetch`/`axios` trực tiếp. |
| 3 | Service export object (không class): `export const courseService = { getList, getById, create }`. |
| 4 | Route guard: `<RequirePermission permission="...">` / `<RequireRole roles={[...]}>` trong `router.tsx`. |
| 5 | `SYSTEM_ADMIN` luôn qua `can()`; route `my-*` chỉ cần auth; `/verify` công khai. |
| 6 | Permission key từ `hooks/use-permission.ts` (`PERMISSIONS`) — mirror `PermissionConstants`. |
| 7 | Path alias `@/` → `src/` (cấu hình `vite.config.ts` + `tsconfig`). |
| 8 | Form: `react-hook-form` + `zod`; toast `sonner`; icon `lucide-react`. |
| 9 | Vite dev proxy: `/api` và `/hubs` → `http://localhost:5000`. |

---

## 6. Quy ước đặt tên

| Hạng mục | Backend (C#) | Frontend (TS) |
|----------|--------------|---------------|
| Biến/hàm | `camelCase` | `camelCase` |
| Class/Interface/Component | `PascalCase` | `PascalCase` |
| Interface | `I` prefix (`IApplicationDbContext`) | — |
| Hằng số | `UPPER_SNAKE_CASE` | `UPPER_SNAKE_CASE` |
| Bảng DB | `snake_case` số nhiều | — |
| Hook | — | `use` prefix |
| Boolean | `is`/`has`/`should`/`can` | `is`/`has`/`should`/`can` |

---

## 7. Quy ước đặt tên commit

Theo **Conventional Commits**:

```
<type>(<scope>): <mô tả ngắn gọn>

<thân tùy chọn>
```

| Type | Dùng khi |
|------|----------|
| `feat` | Tính năng mới |
| `fix` | Sửa lỗi |
| `refactor` | Tái cấu trúc, không đổi hành vi |
| `docs` | Tài liệu |
| `test` | Test |
| `chore` | Việc vặt (config, dependency) |
| `perf` | Hiệu năng |
| `ci` | CI/CD |

Ví dụ: `feat(competency): add position requirement editor`, `fix(auth): lock account after 5 failed logins`.

---

## 8. Quy tắc error handling & validation

| Tầng | Quy tắc |
|------|---------|
| API boundary | Validate input ở DTO/endpoint, fail fast với mã lỗi rõ |
| Service | Ném exception có ngữ cảnh, không nuốt lỗi |
| Middleware | Map exception → HTTP, không lộ stack/SQL/đường dẫn |
| UI | Hiển thị message từ `ApiResponse`; không render HTML từ dữ liệu người dùng |

---

## 9. Danh sách kiểm tra trước push (checklist)

**Backend:**
- [ ] `dotnet build` sạch
- [ ] Controller gắn `[HasPermission]`
- [ ] Service trả DTO (không entity)
- [ ] Response bọc `ApiResponse`
- [ ] Entity mới có DbSet ở 2 file + migration
- [ ] Hành động nhạy cảm có audit log

**Frontend:**
- [ ] `tsc --noEmit` sạch
- [ ] Dùng `apiClient`, không fetch trực tiếp
- [ ] Route được guard
- [ ] File đúng thư mục (`features/<module>/pages/`)
- [ ] Không `console.log`/debug statement

---

## 10. Ma trận vết

| Quy ước | Liên quan | File |
|---------|-----------|------|
| Clean Architecture | Kiến trúc | 06 |
| ApiResponse / DTO | API | 08 |
| Permission key | RBAC | 09 |
| Enum → string, DbSet | CSDL | 07 |
| Conventional commits | Git | 12 |
| Test coverage | Test | 13 |
| Validation/error | Bảo mật | 15 |
