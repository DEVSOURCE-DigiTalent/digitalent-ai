# 08 — Đặc Tả API & OpenAPI

> Nguồn gốc: code thực tế (`DigiTalent.Shared.ApiResponse`, controllers V1) + Report 3. Phiên bản docs_v3, tiếng Việt.

---

## 1. Kiểm soát tài liệu

| Mục | Giá trị |
|-----|---------|
| Tên tài liệu | Đặc tả API & OpenAPI |
| Phiên bản | 3.0 |
| Trạng thái | Bản nháp |
| Chủ sở hữu | Trần Văn Linh (Leader) |
| Căn cứ | Code thực tế + Report 3 §3 |

**Lịch sử chỉnh sửa**

| Ngày | Phiên bản | Mô tả |
|------|-----------|-------|
| 16/09/2026 | 3.0 | Chuyển ngữ; đặc tả envelope + endpoint theo controller thực tế |

---

## 2. Mục đích và phạm vi

Đặc tả chuẩn API REST của DigiTalent AI: **envelope response thống nhất**, quy ước đặt tên, mã lỗi, nhóm endpoint. Tài liệu là hợp đồng giữa frontend và backend; Swagger/OpenAPI phải khớp implementation.

**Ngoài phạm vi:** chi tiết từng DTO, chi tiết authorization (09), security (15).

---

## 3. Tài liệu tham chiếu

- `DigiTalent.Shared/ApiResponse/ApiResponse.cs`
- `DigiTalent.Api/Controllers/V1/*.cs`
- Report 3 §3
- OpenAPI 3.1

---

## 4. Quy ước chung

| Hạng mục | Quy ước |
|----------|---------|
| Base path | `/api/v1` |
| Định dạng | JSON (UTF-8), `application/json` |
| Envelope | Mọi response bọc `ApiResponse<T>` (xem §5) |
| Lỗi | Exception → middleware map mã HTTP (xem §6) |
| Auth | `Authorization: Bearer <access token>`; endpoint công khai không cần |
| Pagination | Query `page`, `pageSize` (mặc định 20), trả `PagedList<T>` |
| Định danh | `uuid` |
| Ngày giờ | ISO 8601 UTC (`Timestamptz`) |

---

## 5. Envelope response (`ApiResponse<T>`)

Mọi response đều qua một trong hai dạng (code thực tế `DigiTalent.Shared.ApiResponse`):

```json
{
  "success": true,
  "message": "Success",
  "data": { },
  "errors": [],
  "traceId": "00-...",
  "timestamp": "2026-09-16T08:00:00.000Z"
}
```

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `success` | bool | Thành công hay không |
| `message` | string | Thông báo ngắn gọn |
| `data` | T? | Payload (null khi lỗi) |
| `errors` | ApiError[] | Danh sách lỗi (trống khi thành công) |
| `traceId` | string? | Trace id để correlate log |
| `timestamp` | string | Thời điểm (ISO 8601 UTC) |

**ApiError:**

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `field` | string? | Trường bị lỗi (validation) |
| `code` | string | Mã lỗi (vd `DUPLICATE`, `NOT_FOUND`) |
| `message` | string | Mô tả lỗi |

**Ví dụ thành công:**

```json
{ "success": true, "message": "Success", "data": { "id": "…", "title": "…" }, "errors": [], "traceId": null, "timestamp": "…" }
```

**Ví dụ lỗi validation:**

```json
{ "success": false, "message": "Validation failed", "data": null, "errors": [{ "field": "email", "code": "REQUIRED", "message": "This field is required." }], "traceId": "…", "timestamp": "…" }
```

---

## 6. Mã HTTP & xử lý lỗi (ExceptionHandlingMiddleware)

| Exception | HTTP |
|-----------|------|
| `KeyNotFoundException` | 404 Not Found |
| `UnauthorizedAccessException` | 401 / 403 |
| `ValidationException` | 400 Bad Request |

Không lộ stack trace / SQL / đường dẫn file trong response; chi tiết ghi log server-side.

---

## 7. Nhóm endpoint (theo controller thực tế)

Route gốc `api/v1`, mỗi module một controller trong `Api/Controllers/V1/`.

| Controller | Endpoint (đại diện) | Actor chính | Ghi chú |
|-----------|---------------------|-------------|---------|
| `AuthController` | `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/forgot-password`, `POST /auth/reset-password` | Tất cả | Login công khai; lockout 5 lần |
| `UsersController` | `GET/POST/PUT /users`, `POST /users/{id}/lock`, `/unlock`, `POST /users/{id}/roles` | Admin | Gán vai trò |
| `OrganizationsController` | `GET/POST/PUT /departments`, `/job-families`, `/job-positions`, `/employees` | HR/Admin | Org tree |
| `CompetenciesController` | `GET/POST/PUT /competencies`, `/competency-categories`, `/competency-levels`, `/position-requirements` | HR | Requirement set versioned |
| `CoursesController` | `GET/POST/PUT /courses`, `/courses/{id}/lessons`, `/courses/{id}/materials`, `/assignments` | Trainer/HR | — |
| `AssessmentsController` | `GET/POST/PUT /assessments`, `/questions`, `/assessments/{id}/attempts`, `POST /attempts/{id}/submit` | Trainer/Employee | Chấm server |
| `CertificatesController` | `GET /certificates`, `GET /certificates/mine`, `GET /certificates/{code}/verify`, `POST /certificates/{id}/revoke`, `GET /certificates/{id}/pdf` | HR/Employee/Public | `verify` công khai, rate-limit |
| `TasksController` | `GET/POST/PUT /task-templates`, `/task-assignments`, `/task-submissions`, `/task-evaluations` | Dept Manager/Employee | WMS-lite |
| `IntelligenceController` | `GET /skill-gap/mine`, `/skill-gap/team`, `/skill-gap/analytics`, `POST /skill-gap/recalculate`, `GET /readiness`, `/risk` | HR/Manager/Employee | Đọc snapshot |
| `DashboardController` | `GET /dashboard/executive`, `/department`, `/trainer`, `/my-learning` | Theo vai trò | — |
| `ScoringConfigsController` | `GET/PUT /scoring-configs` | Admin | Weights versioned |
| `NotificationsController` | `GET /notifications`, `POST /notifications/{id}/read` | Tất cả | SignalR realtime |
| `AuditLogsController` | `GET /audit-logs` | Admin | Chỉ đọc |
| `FilesController` | `POST /files/upload`, `GET /files/{id}/download` | Theo quyền | File lên MinIO |
| `HealthController` | `GET /health` | Ops | Health check |

---

## 8. Quy ước endpoint chuẩn (REST)

| Phương thức | Ý nghĩa | Ví dụ |
|-------------|---------|-------|
| `GET /resource` | Danh sách (phân trang) | `GET /api/v1/employees?page=1&pageSize=20` |
| `GET /resource/{id}` | Chi tiết | `GET /api/v1/employees/{id}` |
| `POST /resource` | Tạo | `POST /api/v1/employees` |
| `PUT /resource/{id}` | Cập nhật | `PUT /api/v1/employees/{id}` |
| `POST /resource/{id}/<action>` | Hành động domain | `POST /certificates/{id}/revoke` |

- `my-*` route: auth bắt buộc, không cần permission (dữ liệu bản thân).
- `/verify` và `/health`: công khai, không auth.
- Mọi endpoint khác gắn `[HasPermission(PermissionConstants.X)]`.

---

## 9. Ví dụ OpenAPI (trích)

```yaml
openapi: 3.1.0
info:
  title: DigiTalent AI API
  version: 1.0.0
servers:
  - url: /api/v1
paths:
  /auth/login:
    post:
      summary: Đăng nhập
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password]
              properties:
                email: { type: string, format: email }
                password: { type: string, format: password }
      responses:
        '200':
          description: Thành công
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiResponse'
        '401':
          description: Sai thông tin hoặc khóa tài khoản
components:
  schemas:
    ApiResponse:
      type: object
      properties:
        success: { type: boolean }
        message: { type: string }
        data: { type: object }
        errors:
          type: array
          items: { $ref: '#/components/schemas/ApiError' }
        traceId: { type: string, nullable: true }
        timestamp: { type: string, format: date-time }
    ApiError:
      type: object
      properties:
        field: { type: string, nullable: true }
        code: { type: string }
        message: { type: string }
```

---

## 10. Ma trận vết

| Nhóm API | UC liên quan | File liên quan |
|----------|--------------|----------------|
| Auth | UC-01..06 | 15 |
| Users/Org | UC-08, 18, 19 | 09 |
| Competencies | UC-14..22 | 07 |
| Courses/Assessments | UC-35..43 | 07 |
| Certificates | UC-27, 45, 46 | 15 |
| Tasks | UC-30..33, 44 | 07 |
| Intelligence/Dashboard | UC-23, 25, 26, 28, 29, 39, 40 | 16 |
| Notifications/Audit | UC-07, 12 | 15 |
