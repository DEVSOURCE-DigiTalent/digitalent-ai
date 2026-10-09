# 08 — Đặc Tả API & OpenAPI

> Nguồn gốc: API design proposal; Report 3 v2.3 §4.1 and §4.2.6 require HTTPS REST and a maintained OpenAPI definition, without prescribing route or payload details.

> **Report 3 version/alignment:** Repository copy is v2.3 while the Master Overview cites v2.2. It requires OpenAPI kept current and specifies HTTPS REST, role/data scope, version snapshots and authenticated same-organization certificate verification; it does not define routes, response envelope or DTO schemas. Paths/envelope below are API-design proposals, not Report 3 requirements or verified implementation. The overview controls conflicts: GRADE-01 pending; OWNER correction decreases/resets only with reason/audit and no-self; late submissions remain reviewable. The v2.3 grade-storage, grade-raising override and late-not-scored statements are not adopted. Four roles only; no public certificate route/expiry, risk/readiness APIs or SignalR dependency.

---

## 1. Kiểm soát tài liệu

| Mục | Giá trị |
|-----|---------|
| Tên tài liệu | Đặc tả API & OpenAPI |
| Phiên bản | 3.0 |
| Trạng thái | Bản nháp |
| Chủ sở hữu | Trần Văn Linh (Leader) |
| Căn cứ | API design proposal; Report 3 v2.3 §4.1, §4.2.6 and relevant business rules |

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

- Report 3 v2.3 §4.1–4.2.6: REST interaction, OpenAPI maintainability, external interfaces
- Enterprise business rules in the Master System Overview and Report 3 v2.3, subject to documented conflicts above
- OpenAPI 3.1

---

## 4. Quy ước chung

| Hạng mục | Quy ước |
|----------|---------|
| Base path | `/api/v1` |
| Định dạng | JSON (UTF-8), `application/json` |
| Envelope | Mọi response bọc `ApiResponse<T>` (xem §5) |
| Lỗi | Exception → middleware map mã HTTP (xem §6) |
| Auth | `Authorization: Bearer <access token>`; unauthenticated access only for auth flows and health where applicable |
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

## 7. Nhóm endpoint (đề xuất theo domain; Report 3 không quy định route)

Route gốc `api/v1`, mỗi module một controller trong `Api/Controllers/V1/`.

| Controller | Endpoint (đại diện) | Actor chính | Ghi chú |
|-----------|---------------------|-------------|---------|
| Authentication API | Login, refresh/logout, forgot/reset password | All account holders | Login and recovery flows are unauthenticated; implementation needs verification |
| `UsersController` | `GET/POST/PUT /users`, `POST /users/{id}/lock`, `/unlock`, `POST /users/{id}/roles` | Admin | Gán vai trò |
| Organization API | Organization, departments, positions, members, manager assignments | OWNER; MANAGER scoped reads | No Job Family / Job Grade baseline |
| Competency API | TT02 references and Position Requirement versions | PLATFORM_ADMIN manages reference; OWNER manages requirements | Grade storage remains GRADE-01 pending |
| Course/Curriculum API | Standard courses, versions, lessons, recommendations, directed assignments | PLATFORM_ADMIN authors; system derives recommendations from Skill Gap/course coverage; OWNER creates separate update/retraining assignments; EMPLOYEE starts recommended learning or completes assignments | Recommendation is not a mandatory assignment; assignment retains course version |
| Assessment API | Assessment versions, question snapshots, attempts, results | PLATFORM_ADMIN configures; EMPLOYEE takes | Attempt retains assessment version snapshot |
| Certificate API | Registry, `/certificates/{code}/verify`, revoke, PDF | OWNER/MANAGER same-org verify; OWNER revoke; EMPLOYEE own | Verify is authenticated and same-org; no public route |
| Practical Task API | Templates, assignment, submission, optional AI evaluation proposal, reviewer decision/evidence | OWNER/MANAGER scoped; EMPLOYEE submits | Late submission remains reviewable; AI proposal is distinct from human decision; only approved review can update Confirmed Competency |
| Skill Gap API | Mine/team/analytics/recalculate | Role and scope limited | Met / Partial Gap / Gap / Not Assessed; no risk/readiness |
| Dashboard API | Role-scoped organization, team and personal dashboard data | OWNER/MANAGER/EMPLOYEE | No subscription, Trainer or risk/readiness dashboard baseline |
| Notifications API | List/mark own notifications | All authenticated roles | Browser polling in MVP |
| `AuditLogsController` | `GET /audit-logs` | Admin | Chỉ đọc |
| `FilesController` | `POST /files/upload`, `GET /files/{id}/download` | Theo quyền | File lên MinIO |
| `HealthController` | `GET /health` | Ops | Health check |

**Contract boundary for learning recommendations and AI review:** the domain capabilities above are target design only. The exact routes, request/response schemas, persistence semantics, error codes, retry/idempotency behavior, and permission keys have not been established by Report 3 or this design; do not treat an illustrative endpoint or field as a committed API. At minimum, a recommendation view should explain which gap competency and course coverage caused the suggestion, and an OWNER-directed assignment should remain distinguishable from that suggestion. An employee may start recommended learning; OWNER can separately assign courses for updates/retraining and monitor progress.

If AI-assisted Practical Task evaluation is approved in Report 1/2 scope, keep the API result as a preliminary proposal tied to the rubric version and authorized evidence references. Include model/provider/version only when available. Reviewer decision, reviewer edits, and any request for more evidence are separate actions and must be auditable. A numeric task score is not a competency grade. No AI endpoint, payload, or database contract is finalized here. OWNER-directed course reevaluation remains **PENDING DECISION**: assessment-only or assessment plus Practical Task.

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
- Certificate `/verify` requires an authenticated OWNER/MANAGER scoped to the issuing organization; no public certificate route. Health endpoint exposure follows deployment policy.
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
