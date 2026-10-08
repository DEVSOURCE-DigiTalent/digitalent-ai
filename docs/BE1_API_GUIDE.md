# BE1 API Guide — Tài liệu tích hợp cho Frontend

> Base URL: `http://localhost:5000/api/v1`
> Auth: Tất cả API cần header `Authorization: Bearer <accessToken>`
> Lấy token: `POST /api/v1/auth/login` với `{ email, password }`
> Phạm vi: các API do nhánh `feature/DT-overview-dashboard-api` (PR #49, mục 1–2), `feature/DT-organization-api` (mục 3 — API nhóm Tổ chức, mục 4 — hướng dẫn tích hợp frontend) và `feature/DT-be1-competency-apis` (mục 5 — năng lực & nhân sự) thêm vào. Hướng dẫn chi tiết cho trang OW-01: `docs/integration/OW-01_Tong_Quan_FE_Integration.md`.

## Response chung

Mọi response đều có dạng:

```json
{
  "success": true,
  "message": "Success",
  "data": { ... },
  "errors": []
}
```

Lỗi trả `success: false`, HTTP status tương ứng (400/401/403/404/409).

---

## 1. TỔNG QUAN TỔ CHỨC (Organization Overview)

### GET /organization/overview — Tổng quan tổ chức (trang OW-01)

```
Quyền: dashboard.hr_company.read (HR_MANAGER; SYSTEM_ADMIN luôn qua)
Không có query parameter. Dữ liệu tự lọc theo tổ chức của user đang login.
```

FE đang gọi qua `organizationService.getOverview()` → hook `useOrganizationOverview()`. Shape khớp interface `OrganizationOverview` (`frontend/src/services/organization.service.ts`), **không cần sửa code gọi API**.

Response `data`:

| Field | Type | Mô tả |
|-------|------|-------|
| name | string | Tên tổ chức |
| members | object | Số thành viên theo trạng thái (xem bảng `members`) |
| seats | object | Số người dùng và hạn mức (xem bảng `seats`) |
| plan | object \| null | Gói dịch vụ hiện tại; `null` nếu tổ chức chưa có gói |
| pendingReviews | number | Bài nộp nhiệm vụ thực tế đang chờ chấm (SUBMITTED / UNDER_REVIEW, chưa có đánh giá) |
| runningBatches | number | Số đợt đào tạo trạng thái `ACTIVE` |
| setup | SetupItem[] | Luôn 4 bước, thứ tự cố định (xem bảng `setup`) |
| setupCompleted | boolean | Tổ chức đã hoàn tất wizard `/setup` hay chưa |
| recentActivity | ActivityItem[] | Tối đa 5 hoạt động mới nhất (audit log), mới nhất ở đầu |

`members`:

| Field | Type | Mô tả |
|-------|------|-------|
| active | number | Nhân viên ACTIVE, không có tài khoản hoặc tài khoản đã đăng nhập ít nhất 1 lần |
| pending | number | Nhân viên ACTIVE có tài khoản nhưng **chưa đăng nhập lần nào** (chờ kích hoạt) |
| inactive | number | Nhân viên INACTIVE (không tính ARCHIVED) |

`seats`:

| Field | Type | Mô tả |
|-------|------|-------|
| used | number | Số tài khoản người dùng ACTIVE của tổ chức |
| limit | number \| null | Hạn mức theo gói; `null` = không giới hạn hoặc chưa có gói |

`plan`:

| Field | Type | Mô tả |
|-------|------|-------|
| code | string | Mã gói (VD: `"BUSINESS"`) |
| name | string | Tên gói (VD: `"Gói Doanh nghiệp"`) |
| status | string | ACTIVE / EXPIRED / PAYMENT_REQUIRED / CANCELLED |
| renewsAt | datetime \| null | Ngày gia hạn |

`setup[]` (SetupItem):

| Field | Type | Mô tả |
|-------|------|-------|
| key | string | `departments` / `positions` / `requirements` / `members` |
| label | string | Nhãn tiếng Việt hiển thị |
| done | boolean | Bước đã hoàn thành chưa (điều kiện ở bảng dưới) |
| detail | string | Mô tả tiến độ, VD `"5/5 vị trí đã có yêu cầu đang áp dụng"` |
| path | string | Route FE để hoàn thành bước, VD `"/enterprise/departments"` |

| key | done khi |
|-----|----------|
| departments | Có ít nhất 1 phòng ban ACTIVE |
| positions | Có ít nhất 1 vị trí ACTIVE |
| requirements | Mọi vị trí ACTIVE đều có bộ yêu cầu năng lực ACTIVE |
| members | `active + pending > 1` |

`recentActivity[]` (ActivityItem):

| Field | Type | Mô tả |
|-------|------|-------|
| id | guid | |
| at | datetime | Thời điểm ghi log |
| actorName | string \| null | Người thực hiện; `null` nếu là hệ thống |
| action | string | Mã hành động, VD `"COMPETENCY_LEVEL_OVERRIDE"` |
| targetType | string | Loại đối tượng (tên bảng), VD `"employee_competency_profiles"` |
| targetLabel | string | Tên dễ đọc của đối tượng; nếu log không có nhãn thì bằng `targetType` |

Ví dụ response:

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "name": "DigiTalent Demo Company",
    "members": { "active": 2, "pending": 2, "inactive": 0 },
    "seats": { "used": 5, "limit": 50 },
    "plan": { "code": "BUSINESS", "name": "Gói Doanh nghiệp", "status": "ACTIVE", "renewsAt": "2027-10-06T13:20:41+00:00" },
    "pendingReviews": 0,
    "runningBatches": 1,
    "setup": [
      { "key": "departments", "label": "Phòng ban", "done": true, "detail": "1 phòng ban", "path": "/enterprise/departments" },
      { "key": "positions", "label": "Vị trí công việc", "done": true, "detail": "5 vị trí", "path": "/enterprise/positions" },
      { "key": "requirements", "label": "Yêu cầu năng lực theo vị trí", "done": true, "detail": "5/5 vị trí đã có yêu cầu đang áp dụng", "path": "/enterprise/requirements" },
      { "key": "members", "label": "Thành viên", "done": true, "detail": "2 đang hoạt động, 2 chờ kích hoạt", "path": "/enterprise/members" }
    ],
    "setupCompleted": true,
    "recentActivity": []
  },
  "errors": []
}
```

Lỗi:

| HTTP | Khi nào |
|------|---------|
| 401 | Chưa đăng nhập, token hết hạn hoặc tài khoản bị khóa |
| 403 | User không có quyền `dashboard.hr_company.read` (DEPARTMENT_MANAGER, TRAINER, EMPLOYEE) |
| 404 | Không tìm thấy tổ chức của user (dữ liệu hỏng) |

---

## 2. BẢNG DỮ LIỆU DÙNG CHUNG VỚI BE2

Nhánh này khai báo chính thức trong SQL gốc và migration 6 bảng mà các API của BE2 đang dùng. Trước đây các bảng này không được tạo trên DB dựng từ repo nên các API dưới đây trả 500. **Không đổi đường dẫn hay shape**, FE không cần sửa gì.

| Bảng | API BE2 dùng | Ảnh hưởng tới OW-01 |
|------|--------------|---------------------|
| subscriptions | `GET /subscription`, `GET /subscription/usage`, `POST /subscription/cancel`, `POST /subscription/resume` | `plan`, `seats.limit` trong `/organization/overview` |
| subscription_entitlements | `GET /subscription` | — |
| invoices | `GET /subscription` | — |
| training_batches | `/training-batches` (list, summary, detail, create, update, activate, cancel, complete) | `runningBatches` = số đợt `ACTIVE` |
| training_batch_employees | `POST /training-batches/:id/employees` | — |
| recommendation_reviews | `/intelligence/recommendation-reviews` (list, accept, dismiss, reopen) | — |

> Kích hoạt một đợt ở màn Đợt đào tạo (`POST /training-batches/:id/activate`) làm `runningBatches` trên OW-01 tăng theo, không cần đồng bộ thêm.

---

## 3. TỔ CHỨC (OW-02 … OW-13)

> Nhánh `feature/DT-organization-api`. Đường dẫn và shape giữ đúng như mock server của FE (`frontend/src/services/mock/server/handlers/{members,structure,organization}.ts`) và các interface trong `frontend/src/services/{member,department,job-position,job-grade}.service.ts`, nên FE chỉ cần tắt mock (`VITE_USE_MOCK=false`). Kích hoạt lời mời (3.3) đã được nối ở nhánh `feature/DT-organization-fe-integration` (mục 4).

### 3.0 Tổng quan thay đổi

| Màn hình | Endpoint | Loại |
|----------|----------|------|
| OW-02 Thành viên | `GET /members`, `POST /members/invitations`, `POST /members/{id}/resend-invitation`, `DELETE /members/invitations/{id}` | **Mới** |
| OW-03 Chi tiết thành viên | `GET /members/{id}`, `PUT /members/{id}`, `POST /members/{id}/deactivate`, `POST /members/{id}/reactivate` | **Mới** |
| Trang `/activate/:token` (public) | `GET /invitations/{token}`, `POST /invitations/activate` | **Mới** |
| OW-13 Phân quyền | `GET /roles` (gán vai trò qua `PUT /members/{id}`) | **Mới** |
| OW-12 Cấu hình cấp bậc | `GET /job-grades`, `PUT /job-grades/{code}` | **Mới** |
| OW-06, OW-07 Phòng ban | `/departments` (5 endpoint cũ) | **Bổ sung field** |
| OW-09, OW-10 Vị trí | `/job-positions` (5 endpoint cũ) | **Bổ sung field + bộ lọc** |

Thay đổi database (SQL gốc `docs/database/DigiTalent_AI_Canonical_v2_3.sql`, addendum 2026-10-06b; migration `20261006135215_AddOrganizationStructureAndInvitations`, tự chạy khi start Development):

| Bảng | Thay đổi |
|------|----------|
| `job_positions` | + `department_id uuid NULL` (FK `departments`, index `ix_job_positions_department`), + `job_grade varchar(10) NULL` (CHECK `G1`/`G2`/`G3`) |
| `users` | + `deactivated_reason varchar(500) NULL` |
| `job_grades` (mới) | `id, organization_id, code (G1/G2/G3), name varchar(120), description, created_at, updated_at`; UNIQUE `(organization_id, code)` |
| `member_invitations` (mới) | `id, organization_id, email (chữ thường), full_name, employee_code, role_id (FK roles), department_id, job_position_id, token_hash (UNIQUE, SHA-256), status (PENDING/ACCEPTED/REVOKED), invited_by_user_id, invited_at, expires_at, accepted_user_id, accepted_at, created_at, updated_at`; UNIQUE `(organization_id, email) WHERE status = 'PENDING'` |

Quyền (permission) mới / bổ sung vào ma trận mặc định:

| Mã quyền | Dùng cho | HR_MANAGER | DEPARTMENT_MANAGER | TRAINER / EMPLOYEE |
|----------|----------|:---:|:---:|:---:|
| `user.read` | `GET /members`, `GET /members/{id}` | ✔ (mới) | | |
| `user.create` | mời / gửi lại / thu hồi lời mời | ✔ (mới) | | |
| `user.update` | `PUT /members/{id}` | ✔ (mới) | | |
| `user.lock_unlock` | vô hiệu hóa / kích hoạt lại | ✔ (mới) | | |
| `role.read` | `GET /roles` | ✔ (mới) | | |
| `role.assign_business` | đổi vai trò; mời với vai trò khác EMPLOYEE | ✔ (mới) | | |
| `job_grade.read` (mã mới) | `GET /job-grades` | ✔ | ✔ | |
| `job_grade.manage` (mã mới) | `PUT /job-grades/{code}` | ✔ | | |

> `DbSeeder` tự thêm mã quyền và cặp role–quyền còn thiếu khi start Development. Môi trường khác phải chạy seed hoặc thêm tay vào `permissions` / `role_permissions`. SYSTEM_ADMIN luôn qua mọi kiểm tra quyền. FE đã có sẵn các mã này trong `hooks/use-permission.ts`.

Cấu hình mới (`appsettings.json`):

```json
"Invitations": {
  "FrontendBaseUrl": "http://localhost:5173",   // link kích hoạt = {FrontendBaseUrl}/activate/{token}
  "ExposeDebugLink": false                      // appsettings.Development.json đặt true
}
```

Chưa tích hợp dịch vụ email: link kích hoạt chỉ được ghi vào log backend. Khi `ExposeDebugLink = true` (Development) API trả thêm `token` và `debugLink` để FE/tester mở link; môi trường khác hai field này là `null` và link **không** được ghi ra log.

### 3.1 Ánh xạ vai trò FE ↔ BE

| FE (`roles[]`) | BE (bảng `roles`) | Ghi chú |
|----------------|-------------------|---------|
| `OWNER` | `HR_MANAGER` | `SYSTEM_ADMIN` cũng hiển thị là `OWNER` nhưng không thể sửa/vô hiệu hóa từ tổ chức (403) |
| `MANAGER` | `DEPARTMENT_MANAGER` | |
| `EMPLOYEE` | `EMPLOYEE` | `TRAINER` cũng hiển thị là `EMPLOYEE` |

- API thành viên/lời mời/vai trò **luôn trả mã FE**, sắp theo thứ tự `OWNER > MANAGER > EMPLOYEE`, không trùng lặp.
- Khi gửi lên (`role`, `roles[]`, query `role`) chấp nhận cả mã FE lẫn mã BE, không phân biệt hoa thường (`"owner"`, `"HR_MANAGER"` đều hợp lệ).
- `PUT /members/{id}` chỉ cấp/thu 3 role `HR_MANAGER`, `DEPARTMENT_MANAGER`, `EMPLOYEE`; `TRAINER` và `SYSTEM_ADMIN` của tài khoản được giữ nguyên.
- Tổ chức luôn phải còn **ít nhất 1 tài khoản HR_MANAGER không INACTIVE**.

### 3.2 Thành viên — `/members`

#### Đối tượng `MemberListItem` (dùng chung cho list, detail, update, deactivate, reactivate)

| Field | Type | Mô tả |
|-------|------|-------|
| id | guid | **ID dùng cho mọi endpoint `/members/{id}`**: user id (người có tài khoản), employee id (hồ sơ nhân viên chưa có tài khoản) hoặc invitation id (lời mời) |
| kind | `"member"` \| `"invitation"` | Thành viên hay lời mời chưa kích hoạt |
| fullName | string | `employees.full_name`; tài khoản chưa có hồ sơ dùng `users.display_name`; lời mời dùng tên khi mời |
| email | string | Email tài khoản; hồ sơ không có tài khoản dùng `work_email` (có thể `""`) |
| roles | string[] | Mã FE. Hồ sơ không có tài khoản luôn là `["EMPLOYEE"]` |
| status | `"ACTIVE"` \| `"INACTIVE"` \| `"PENDING"` | `PENDING` = lời mời. `INACTIVE` khi `users.status = INACTIVE` **hoặc** `employees.status = INACTIVE`. Tài khoản đang bị khóa tạm do sai mật khẩu (LOCKED) vẫn là `ACTIVE` |
| employeeId | guid \| null | Hồ sơ nhân viên (null với tài khoản chưa có hồ sơ và lời mời) |
| employeeCode | string \| null | Mã nhân viên; với lời mời là mã đã nhập khi mời (có thể null) |
| departmentId / departmentName | guid / string \| null | Phòng ban của hồ sơ, hoặc phòng ban đã chọn khi mời |
| jobPositionId / positionName | guid / string \| null | Vị trí công việc |
| jobGrade | `"G1"` \| `"G2"` \| `"G3"` \| null | Cấp bậc **của vị trí** |
| jobGradeName | string \| null | Tên cấp bậc theo cấu hình tổ chức (mục 3.5) |
| coveragePercent | number \| null | % đáp ứng yêu cầu vị trí trong lần tính skill gap mới nhất; `null` = chưa tính |
| highGapCount | number \| null | Số khoảng trống mức HIGH trong lần tính mới nhất (0 nếu chưa tính); `null` với tài khoản không có hồ sơ và lời mời |
| activeCourses | number \| null | Số enrollment `IN_PROGRESS` + `READY_FOR_ASSESSMENT`; `null` với tài khoản không có hồ sơ và lời mời |
| joinedAt | datetime \| null | `employees.joined_at` (00:00 UTC); nếu không có thì thời điểm tạo tài khoản |
| invitedAt | datetime \| null | Thời điểm mời / gửi lại gần nhất (chỉ với lời mời) |
| lastActiveAt | datetime \| null | Lần đăng nhập gần nhất (`users.last_login_at`) |
| deactivatedReason | string \| null | Lý do vô hiệu hóa, chỉ có khi `status = INACTIVE` và người đó có tài khoản |

Danh sách gồm 3 nguồn:
1. Hồ sơ nhân viên chưa `ARCHIVED` (kèm tài khoản nếu `employees.user_id` có giá trị).
2. Tài khoản thuộc tổ chức nhưng chưa có hồ sơ nhân viên (VD `admin@`).
3. Lời mời `PENDING` — kể cả lời mời đã quá `expiresAt` (vẫn chiếm ghế cho tới khi gửi lại hoặc thu hồi).

Thứ tự: thành viên trước, lời mời sau; trong mỗi nhóm sắp theo tên (collation tiếng Việt, không phân biệt hoa thường).

**Ghế (seat):** đang dùng = số tài khoản của tổ chức không `INACTIVE` + số lời mời `PENDING`. Giới hạn = `subscriptions.seat_limit` của tổ chức (`null` hoặc không có gói = không giới hạn).

---

#### GET /members — Danh sách thành viên (OW-02, OW-13, OW-07)

```
Quyền: user.read
Query: pageIndex (≥1, mặc định 1), pageSize (1–100, mặc định 20), search,
       status, role, departmentId, jobPositionId, jobGrade
```

| Query | Mô tả |
|-------|-------|
| search | Chứa (không phân biệt hoa thường) trong `fullName`, `email` hoặc `employeeCode` |
| status | `ACTIVE` / `INACTIVE` / `PENDING`; bỏ trống = tất cả. Giá trị khác → 400 `Status must be ACTIVE, INACTIVE or PENDING.` |
| role | `OWNER` / `MANAGER` / `EMPLOYEE` hoặc mã BE. `OWNER` khớp HR_MANAGER + SYSTEM_ADMIN; `EMPLOYEE` khớp EMPLOYEE + TRAINER + hồ sơ chưa có tài khoản |
| departmentId, jobPositionId | Lọc theo phòng ban / vị trí (áp dụng cả cho lời mời) |
| jobGrade | `G1` / `G2` / `G3` (cấp bậc của vị trí). Giá trị khác → 400 `JobGrade must be G1, G2 or G3.` |

Response `data` = `PagedList<MemberListItem>`: `{ items, pageIndex, pageSize, totalItems, totalPages }`. Các chỉ số `coveragePercent`, `highGapCount`, `activeCourses` chỉ tính cho các dòng của trang hiện tại.

Ví dụ (id rút gọn, giá trị minh họa):

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "items": [
      {
        "id": "8b1f…", "kind": "member", "fullName": "Employee", "email": "employee@digitalent.ai",
        "roles": ["EMPLOYEE"], "status": "ACTIVE",
        "employeeId": "c2a4…", "employeeCode": "NV002",
        "departmentId": "43b0…", "departmentName": "Operations",
        "jobPositionId": "549f…", "positionName": "Kế toán",
        "jobGrade": "G1", "jobGradeName": "Cấp Tác nghiệp / Chuyên viên",
        "coveragePercent": null, "highGapCount": 0, "activeCourses": 0,
        "joinedAt": "2026-10-06T00:00:00+00:00", "invitedAt": null,
        "lastActiveAt": "2026-10-06T14:18:02+00:00", "deactivatedReason": null
      },
      {
        "id": "2752…", "kind": "invitation", "fullName": "Rev", "email": "rev@digitalent.ai",
        "roles": ["EMPLOYEE"], "status": "PENDING",
        "employeeId": null, "employeeCode": null, "departmentId": null, "departmentName": null,
        "jobPositionId": null, "positionName": null, "jobGrade": null, "jobGradeName": null,
        "coveragePercent": null, "highGapCount": null, "activeCourses": null,
        "joinedAt": null, "invitedAt": "2026-10-06T14:18:17+00:00", "lastActiveAt": null, "deactivatedReason": null
      }
    ],
    "pageIndex": 1, "pageSize": 20, "totalItems": 2, "totalPages": 1
  },
  "errors": []
}
```

---

#### GET /members/{id} — Chi tiết thành viên (OW-03)

```
Quyền: user.read
{id}: id lấy từ danh sách (user id / employee id / invitation id)
```

Response `data` = `MemberListItem` + các field:

| Field | Type | Mô tả |
|-------|------|-------|
| directManagerId | guid \| null | `employees.direct_manager_id` |
| directManagerName | string \| null | Tên quản lý trực tiếp |
| history | MemberHistoryEntry[] | Tối đa 20 audit log mới nhất của tổ chức có `entity_id` = id thành viên, user id hoặc employee id; mới nhất ở đầu |

`MemberHistoryEntry`: `{ id, at, actorName (null = hệ thống), action, targetType (tên bảng), targetLabel (nếu log không có nhãn thì là fullName) }`. Không có field `detail` như mock.

Lỗi: 404 `Member '{id}' not found.` (không tồn tại hoặc thuộc tổ chức khác).

---

#### POST /members/invitations — Mời thành viên (OW-02)

```
Quyền: user.create
Body:
{
  "rows": [
    {
      "email": "a@company.vn",          // bắt buộc; tự trim + chuyển chữ thường; ≤255
      "fullName": "Nguyễn Văn A",       // bắt buộc; ≤200
      "role": "EMPLOYEE",               // OWNER | MANAGER | EMPLOYEE (mặc định EMPLOYEE)
      "employeeCode": "NV010",          // tùy chọn; ≤50; tự viết HOA
      "departmentId": "…",              // tùy chọn; phòng ban ACTIVE của tổ chức
      "jobPositionId": "…"              // tùy chọn; vị trí ACTIVE của tổ chức
    }
  ]
}
```

- `rows` phải có 1–200 phần tử, nếu không → 400 `Validation failed.` (`Rows must contain at least one invitee.` / `At most 200 invitations can be sent at once.`).
- Từng dòng được kiểm tra riêng; dòng lỗi vào `rejected`, **không** làm hỏng cả lô. HTTP luôn 200 kể cả khi mọi dòng bị từ chối (`message = "0 invitation(s) sent."`).
- Mỗi dòng hợp lệ tạo 1 lời mời `PENDING`, hạn **7 ngày**, chiếm 1 ghế.

Thứ tự kiểm tra một dòng và `reason` trả về (tiếng Việt, hiển thị thẳng):

| # | Điều kiện | reason |
|---|-----------|--------|
| 1 | Email sai định dạng hoặc >255 ký tự | `Email không hợp lệ.` |
| 2 | Họ tên rỗng hoặc >200 ký tự | `Thiếu họ tên hoặc họ tên quá dài.` |
| 3 | `role` không thuộc OWNER/MANAGER/EMPLOYEE (hoặc mã BE tương ứng) | `Vai trò không hợp lệ.` |
| 4 | Vai trò khác EMPLOYEE mà người mời không có `role.assign_business` | `Bạn không được cấp vai trò này.` |
| 5 | Email đã có tài khoản (bất kỳ tổ chức nào), đang có lời mời PENDING trong tổ chức, hoặc trùng dòng trước trong cùng lô | `Email đã có tài khoản hoặc đã được mời.` |
| 6 | `employeeCode` >50 ký tự hoặc trùng mã nhân viên của tổ chức / dòng trước trong lô | `Mã nhân viên không hợp lệ hoặc đã tồn tại.` |
| 7 | `departmentId` không phải phòng ban ACTIVE của tổ chức | `Phòng ban không hợp lệ.` |
| 8 | `jobPositionId` không phải vị trí ACTIVE của tổ chức | `Vị trí công việc không hợp lệ.` |
| 9 | Hết ghế (tính cả các dòng hợp lệ phía trước trong lô) | `Đã hết quyền sử dụng của gói.` |

Response:

```json
{
  "success": true,
  "message": "1 invitation(s) sent.",
  "data": {
    "created": [
      {
        "id": "b7d3…",
        "email": "smoke.user@digitalent.ai",
        "fullName": "Smoke User",
        "role": "MANAGER",
        "employeeCode": null,
        "departmentName": "Operations",
        "positionName": null,
        "status": "pending",
        "expiresAt": "2026-10-13T14:17:47.82+00:00",
        "token": "N2v…",                                            // chỉ Development
        "debugLink": "http://localhost:5173/activate/N2v…"          // chỉ Development
      }
    ],
    "rejected": [ { "email": "bad", "reason": "Email không hợp lệ." } ]
  },
  "errors": []
}
```

> `id` trong `created` là invitation id — dùng cho resend/revoke và trùng với `id` của dòng lời mời trong `GET /members`.

---

#### POST /members/{id}/resend-invitation — Gửi lại lời mời

```
Quyền: user.create
{id}: invitation id. Không có body.
```

Sinh token mới (**link cũ hết hiệu lực ngay**), đặt lại `invitedAt = now`, `expiresAt = now + 7 ngày`.

Response `data`: `{ id, expiresAt, token, debugLink }` (`token`/`debugLink` chỉ có ở Development). Message `Invitation resent.`

| HTTP | Khi nào |
|------|---------|
| 404 | `Invitation '{id}' not found.` |
| 409 | `Only a pending invitation can be resent.` (đã chấp nhận hoặc đã thu hồi) |

---

#### DELETE /members/invitations/{id} — Thu hồi lời mời

```
Quyền: user.create
{id}: invitation id
```

Đặt `status = REVOKED` (không xóa dòng), link không còn dùng được, trả lại ghế. Gọi lại với lời mời đã thu hồi vẫn trả 200 (idempotent). Response `data`: `{ id }`, message `Invitation revoked.`

| HTTP | Khi nào |
|------|---------|
| 404 | `Invitation '{id}' not found.` |
| 409 | `The invitation has already been accepted.` |

---

#### PUT /members/{id} — Đổi vai trò / phòng ban / vị trí (OW-03, OW-13)

```
Quyền: user.update (đổi vai trò cần thêm role.assign_business)
Body (chỉ gửi field cần đổi):
{
  "roles": ["MANAGER"],         // không gửi = giữ nguyên; mảng ≥1 phần tử
  "departmentId": "…",          // không gửi = giữ nguyên
  "jobPositionId": "…"          // không gửi = giữ nguyên; "" = bỏ vị trí; GUID = gán
}
```

- `roles`: thay toàn bộ nhóm role quản lý (HR_MANAGER / DEPARTMENT_MANAGER / EMPLOYEE) bằng danh sách gửi lên; TRAINER, SYSTEM_ADMIN giữ nguyên. Ghi audit `ROLE_CHANGED`.
- `departmentId` / `jobPositionId`: phải là phòng ban / vị trí **ACTIVE** của tổ chức. Ghi audit `MEMBER_PLACEMENT_CHANGED` khi có thay đổi.
- Thành viên có tài khoản nhưng **chưa có hồ sơ nhân viên** (VD Owner tạo lúc đăng ký): gửi `departmentId` sẽ tạo hồ sơ mới (mã `NV###` tự sinh, `work_email` = email tài khoản, `joined_at` = hôm nay).
- Response `data` = `MemberListItem` sau khi cập nhật (đã có chỉ số). Message `Member updated.`

| HTTP | `message` | `errors` | Khi nào |
|------|-----------|----------|---------|
| 400 | `Validation failed.` | `roles`: `Roles must contain at least one role.` / `Roles must be OWNER, MANAGER or EMPLOYEE.`; `jobPositionId`: `JobPositionId must be a GUID or an empty string.` | Sai định dạng |
| 400 | `This employee has no account yet, so roles cannot be assigned.` | `[{ field: "roles", message: "NO_ACCOUNT" }]` | Đổi vai trò cho hồ sơ chưa có tài khoản |
| 400 | `This member has no employee profile yet. Choose a department to create it.` | `[{ field: "departmentId", message: "NO_EMPLOYEE_PROFILE" }]` | Gán vị trí cho tài khoản chưa có hồ sơ mà không gửi `departmentId` |
| 400 | `Department does not exist or is not active.` | `[{ field: "departmentId", message: "INVALID_DEPARTMENT" }]` | |
| 400 | `Job position does not exist or is not active.` | `[{ field: "jobPositionId", message: "INVALID_JOB_POSITION" }]` | |
| 403 | `You are not allowed to assign roles.` | | Gửi `roles` khi thiếu `role.assign_business` |
| 403 | `Platform administrator accounts cannot be changed from the organization.` | | Thành viên là SYSTEM_ADMIN |
| 404 | `Member '{id}' not found.` | | |
| 409 | `The invitation has not been activated yet. Resend or revoke it instead.` | | `{id}` là lời mời |
| 409 | `The organization must keep at least one active Owner.` | | Bỏ OWNER của HR_MANAGER đang hoạt động cuối cùng (kể cả tự hạ quyền mình) |

---

#### POST /members/{id}/deactivate — Vô hiệu hóa (OW-03)

```
Quyền: user.lock_unlock
Body: { "reason": "Nghỉ việc" }     // bắt buộc, ≤500, tự trim
```

- Tài khoản → `users.status = INACTIVE`, lưu `deactivated_reason`. Mọi request tiếp theo bằng token cũ trả **401** `Your session is no longer valid. Please log in again.`; đăng nhập lại trả **403** `Account is inactive.`
- Hồ sơ nhân viên đang `ACTIVE` → `INACTIVE` (bị loại khỏi sĩ số phòng ban/vị trí). Lịch sử học tập, minh chứng, chứng chỉ giữ nguyên. Ghế được trả lại.
- Hồ sơ không có tài khoản cũng vô hiệu hóa được (chỉ đổi trạng thái hồ sơ; lý do chỉ lưu trong audit log).
- Response `data` = `MemberListItem` (`status = INACTIVE`). Message `Member deactivated.`

| HTTP | Khi nào |
|------|---------|
| 400 | `Validation failed.` — `reason` rỗng hoặc >500 |
| 403 | Thành viên là SYSTEM_ADMIN |
| 404 | `Member '{id}' not found.` |
| 409 | `You cannot deactivate your own account.` / `The member is already deactivated.` / `The organization must keep at least one active Owner.` / `{id}` là lời mời |

---

#### POST /members/{id}/reactivate — Kích hoạt lại (OW-03)

```
Quyền: user.lock_unlock. Không có body.
```

- Tài khoản → `ACTIVE`, xóa `deactivated_reason`, reset bộ đếm sai mật khẩu và khóa tạm. Hồ sơ `INACTIVE` → `ACTIVE`.
- Nếu thành viên có tài khoản thì cần còn ghế (ghế đang dùng < `seat_limit`).
- Response `data` = `MemberListItem` (`status = ACTIVE`). Message `Member reactivated.`

| HTTP | Khi nào |
|------|---------|
| 403 | Thành viên là SYSTEM_ADMIN |
| 404 | `Member '{id}' not found.` |
| 409 | `The member is already active.` / `No seats left on the plan. Upgrade the plan or free a seat first.` / `{id}` là lời mời |

### 3.3 Kích hoạt lời mời (public) — `/invitations`

Không cần `Authorization` (giống `POST /auth/login`): token kích hoạt chính là quyền truy cập. DB chỉ lưu SHA-256 của token. Mọi trường hợp token không dùng được (sai, đã dùng, đã thu hồi, đã gửi lại token mới, quá hạn) đều trả **cùng** lỗi 404 `The invitation link is invalid or has expired.` để không lộ thông tin.

#### GET /invitations/{token} — Thông tin lời mời

Response `data`:

| Field | Type | Mô tả |
|-------|------|-------|
| organizationName | string | Tên tổ chức mời |
| email | string | Email được mời (tài khoản sẽ dùng email này) |
| fullName | string | Tên khi mời |
| role | string | `OWNER` / `MANAGER` / `EMPLOYEE` |
| status | string | Luôn `"pending"` (token không mở được thì đã trả 404) |
| expiresAt | datetime | Hạn của link |

#### POST /invitations/activate — Kích hoạt tài khoản

```
Body:
{
  "token": "N2v…",                 // bắt buộc, ≤200
  "fullName": "Nguyễn Văn A",      // tùy chọn, ≤200; bỏ trống = giữ tên khi mời
  "password": "…"                  // 12–128 ký tự
}
```

Trong một lần lưu, backend:
1. Tạo tài khoản (`users`, ACTIVE, thuộc tổ chức mời) với mật khẩu đã băm BCrypt.
2. Gán role đã mời (`user_roles`, `assigned_by` = người mời).
3. Hồ sơ nhân viên:
   - Nếu tổ chức đã có hồ sơ **chưa có tài khoản**, chưa ARCHIVED, có `work_email` trùng email mời → liên kết tài khoản vào hồ sơ đó (giữ nguyên phòng ban/vị trí của hồ sơ).
   - Nếu không → tạo hồ sơ mới: phòng ban đã mời (nếu còn ACTIVE), không thì phòng ban ACTIVE đầu tiên theo mã; vị trí đã mời nếu còn ACTIVE; quản lý trực tiếp = trưởng phòng ban; mã NV = mã đã mời nếu còn trống, không thì `NV###` tự sinh; `joined_at` = hôm nay.
   - Tổ chức chưa có phòng ban ACTIVE nào → không tạo hồ sơ (`employeeId = null`); Owner gán phòng ban sau qua `PUT /members/{id}`.
4. Lời mời → `ACCEPTED`; ghi audit `INVITATION_ACCEPTED` (người thực hiện = tài khoản mới).

Response `data`: `{ email, userId, employeeId }`, message `Account activated.` Sau đó FE chuyển sang đăng nhập bằng `POST /auth/login`.

| HTTP | `message` / `errors` | Khi nào |
|------|----------------------|---------|
| 400 | `Validation failed.` — `password`: `'Password' must be between 12 and 128 characters. …` hoặc `The password is too common.`; `token`, `fullName` quá dài | |
| 400 | `The password must not be the e-mail address.` — `[{ field: "password", message: "PASSWORD_SAME_AS_EMAIL" }]` | Mật khẩu trùng email (không phân biệt hoa thường) |
| 404 | `The invitation link is invalid or has expired.` | |
| 409 | `An account with this e-mail already exists.` | Email đã được đăng ký sau khi mời |

> FE: `services/invitation.service.ts` gọi `getInvitation(token)` → `GET /invitations/{token}` và `activate({ token, fullName, password })` → `POST /invitations/activate` khi tắt mock (mục 4.4).

### 3.4 Phân quyền — GET /roles (OW-13)

```
Quyền: role.read. Không có query.
```

Response `data` là **mảng 3 phần tử** theo thứ tự OWNER, MANAGER, EMPLOYEE:

| Field | Type | Mô tả |
|-------|------|-------|
| role | string | `OWNER` / `MANAGER` / `EMPLOYEE` |
| roleCode | string | Role BE được cấp: `HR_MANAGER` / `DEPARTMENT_MANAGER` / `EMPLOYEE` |
| name | string | `Chủ doanh nghiệp` / `Quản lý` / `Nhân viên` |
| summary | string | Mô tả ngắn (giống `ROLE_DESCRIPTIONS` trong `lib/role-policy.ts`) |
| can | string[] | Các việc vai trò làm được (giống FE) |
| permissions | string[] | Mã quyền của `roleCode` đọc từ `role_permissions`, sắp xếp A→Z (thay đổi theo ma trận quyền thực tế trong DB) |
| memberCount | number | Số tài khoản của tổ chức (không INACTIVE) giữ vai trò. OWNER đếm cả SYSTEM_ADMIN, EMPLOYEE đếm cả TRAINER |
| assignable | boolean | Người gọi có `role.assign_business` hay không |

```json
{
  "success": true,
  "message": "Success",
  "data": [
    { "role": "OWNER", "roleCode": "HR_MANAGER", "name": "Chủ doanh nghiệp", "summary": "…", "can": ["…"], "permissions": ["account.change_own_password", "…"], "memberCount": 2, "assignable": true },
    { "role": "MANAGER", "roleCode": "DEPARTMENT_MANAGER", "name": "Quản lý", "summary": "…", "can": ["…"], "permissions": ["…"], "memberCount": 1, "assignable": true },
    { "role": "EMPLOYEE", "roleCode": "EMPLOYEE", "name": "Nhân viên", "summary": "…", "can": ["…"], "permissions": ["…"], "memberCount": 2, "assignable": true }
  ],
  "errors": []
}
```

Gán/bỏ vai trò: `PUT /members/{id}` với `{ "roles": [...] }` (mục 3.2). Gán trưởng phòng ban: `PUT /departments/{id}` với `managerEmployeeId` (mục 3.6).

### 3.5 Cấp bậc — `/job-grades` (OW-12)

Thang cấp bậc cố định 3 mã `G1`, `G2`, `G3` dùng chung cho vị trí. Mỗi tổ chức chỉ đổi được **tên và mô tả**; chưa đổi thì dùng mặc định:

| Mã | Tên mặc định | Mô tả mặc định |
|----|--------------|----------------|
| G1 | Cấp Tác nghiệp / Chuyên viên | Thực hiện công việc chuyên môn, tác nghiệp trực tiếp |
| G2 | Cấp Quản lý trực tiếp / Trưởng nhóm | Quản lý nhóm, phân công, giám sát và đánh giá công việc |
| G3 | Cấp Lãnh đạo / Quản lý cấp cao | Định hướng chiến lược, quản trị phòng ban và tổ chức |

#### GET /job-grades

```
Quyền: job_grade.read
```

Response `data` là mảng luôn đủ 3 phần tử G1, G2, G3:

| Field | Type | Mô tả |
|-------|------|-------|
| code | string | `G1` / `G2` / `G3` |
| name | string | Tên theo tổ chức, hoặc mặc định |
| description | string \| null | Mô tả theo tổ chức, hoặc mặc định (đã tùy chỉnh mà để trống thì `null`) |
| isCustomized | boolean | Tổ chức đã đổi tên cấp bậc này chưa |
| positionCount | number | Số vị trí `ACTIVE` có cấp bậc này |
| employeeCount | number | Số nhân viên `ACTIVE` đang giữ vị trí có cấp bậc này |

#### PUT /job-grades/{code}

```
Quyền: job_grade.manage
{code}: G1 | G2 | G3 (không phân biệt hoa thường)
Body: { "name": "Trưởng nhóm", "description": "Quản lý nhóm" }   // name bắt buộc ≤120; description ≤1000, trống = null
```

Lần đầu tạo dòng `job_grades`, các lần sau cập nhật dòng đó. Ghi audit `JOB_GRADE_UPDATED` (nhãn `"G2 - Trưởng nhóm"`). Response `data` = 1 phần tử như `GET` (đã có `isCustomized = true` và số đếm). Message `Job grade updated.`

| HTTP | Khi nào |
|------|---------|
| 400 | `Validation failed.` — `code`: `Code must be G1, G2 or G3.`; `name` rỗng / >120; `description` >1000 |
| 403 | Thiếu `job_grade.manage` (VD DEPARTMENT_MANAGER) |

### 3.6 Phòng ban — `/departments` (OW-06, OW-07) — bổ sung

Endpoint và quyền không đổi (`department.read` / `department.create_update`).

**Request mới:**

| Endpoint | Field mới | Mô tả |
|----------|-----------|-------|
| `POST /departments` | `managerEmployeeId` (guid, tùy chọn) | Trưởng phòng: phải là nhân viên `ACTIVE` của tổ chức |
| `PUT /departments/{id}` | `managerEmployeeId` (guid \| null) | Chỉ kiểm tra khi đổi sang người khác. **`PUT` thay toàn bộ**: không gửi = bỏ trưởng phòng (tương tự `parentDepartmentId`, `description`) |

**Response bổ sung:**

| Endpoint | Field mới |
|----------|-----------|
| `GET /departments` (mỗi item) | `parentDepartmentId`, `managerEmployeeId`, `managerName`, `headcount`, `gradeDistribution` |
| `GET /departments/{id}` | `headcount`, `gradeDistribution`, `positionCount`, `subDepartmentCount` (đã có sẵn `managerEmployeeId`, `managerName`) |

| Field | Type | Mô tả |
|-------|------|-------|
| headcount | number | Số nhân viên `ACTIVE` thuộc phòng ban |
| gradeDistribution | object | Luôn đủ 3 khóa `{ "G1": n, "G2": n, "G3": n }` — đếm nhân viên ACTIVE theo cấp bậc **của vị trí họ giữ**; nhân viên chưa có vị trí / vị trí chưa có cấp bậc chỉ tính vào `headcount` |
| positionCount | number | Số vị trí chưa ARCHIVED có `department_id` = phòng ban |
| subDepartmentCount | number | Số phòng ban con chưa ARCHIVED |

```json
{
  "id": "43b0…", "code": "OPS", "name": "Operations",
  "parentDepartmentId": null, "parentDepartmentName": null,
  "managerEmployeeId": "ff5f…", "managerName": "Department Manager",
  "headcount": 5, "gradeDistribution": { "G1": 1, "G2": 0, "G3": 0 },
  "status": "ACTIVE"
}
```

**Lỗi mới / thay đổi hành vi:**

| HTTP | `message` / `errors` | Khi nào |
|------|----------------------|---------|
| 400 | `Manager must be an active employee of the organization.` — `[{ field: "managerEmployeeId", message: "INVALID_MANAGER" }]` | `POST`/`PUT` với trưởng phòng không hợp lệ |
| 409 | `Department still has job positions. Move or archive them first.` | **Mới:** `DELETE` khi còn vị trí chưa ARCHIVED thuộc phòng ban (ngoài 2 điều kiện cũ: còn nhân viên, còn phòng ban con) |

Thao tác tạo / sửa / lưu trữ ghi audit `DEPARTMENT_CREATED` / `DEPARTMENT_UPDATED` / `DEPARTMENT_ARCHIVED`.

### 3.7 Vị trí — `/job-positions` (OW-09, OW-10) — bổ sung

Endpoint và quyền không đổi (`job_position.read` / `job_position.create_update`).

**Request mới:**

| Endpoint | Field mới | Mô tả |
|----------|-----------|-------|
| `POST /job-positions`, `PUT /job-positions/{id}` | `departmentId` (guid \| null) | Phòng ban sở hữu: phải thuộc tổ chức và chưa ARCHIVED (INACTIVE vẫn được) |
| | `jobGrade` (string \| null) | `G1` / `G2` / `G3`, không phân biệt hoa thường; rỗng = chưa xếp cấp bậc |
| `GET /job-positions` | query `departmentId`, `jobGrade` | Lọc theo phòng ban / cấp bậc (cùng các query cũ `pageIndex`, `pageSize` (mặc định 10, tự kẹp 1–100), `search`, `status`, `jobFamilyId`) |

`PUT` vẫn thay toàn bộ: không gửi `departmentId` / `jobGrade` = xóa giá trị.

**Response bổ sung:**

| Endpoint | Field mới |
|----------|-----------|
| `GET /job-positions` (mỗi item) | `description`, `departmentId`, `departmentName`, `jobGrade`, `jobGradeName`, `headcount`, `hasRequirementSet` |
| `GET /job-positions/{id}` | `departmentId`, `departmentName`, `jobGrade`, `jobGradeName`, `headcount`, `hasRequirementSet`, `activeRequirementSetVersionNo` |

| Field | Type | Mô tả |
|-------|------|-------|
| jobGradeName | string \| null | Tên cấp bậc theo cấu hình tổ chức (mục 3.5) |
| headcount | number | Số nhân viên `ACTIVE` giữ vị trí |
| hasRequirementSet | boolean | Vị trí có bộ yêu cầu năng lực `ACTIVE` (tính được skill gap) |
| activeRequirementSetVersionNo | number \| null | Số phiên bản của bộ yêu cầu `ACTIVE`; null nếu chưa có |

```json
{
  "id": "549f…", "code": "ACCOUNTANT", "name": "Kế toán", "description": null,
  "jobFamilyId": null, "jobFamilyName": null,
  "departmentId": "43b0…", "departmentName": "Operations",
  "jobGrade": "G1", "jobGradeName": "Cấp Tác nghiệp / Chuyên viên",
  "headcount": 1, "hasRequirementSet": true, "status": "ACTIVE"
}
```

**Lỗi mới / thay đổi hành vi:**

| HTTP | `message` / `errors` | Khi nào |
|------|----------------------|---------|
| 400 | `Validation failed.` — `jobGrade`: `JobGrade must be G1, G2 or G3.` | `POST`/`PUT` với cấp bậc sai |
| 400 | `Department does not exist or is archived.` — `[{ field: "departmentId", message: "INVALID_DEPARTMENT" }]` | |
| 409 | `Archived job positions cannot be edited.` | **Mới:** `PUT` vị trí đã ARCHIVED |

> Query `jobGrade` của `GET /job-positions` không bị validate: giá trị sai chỉ trả danh sách rỗng.

Thao tác tạo / sửa / lưu trữ ghi audit `POSITION_CREATED` / `POSITION_UPDATED` / `POSITION_ARCHIVED`.

### 3.8 Nhật ký thao tác (audit log) mới

Hiện ở `recentActivity` của `GET /organization/overview` (OW-01) và `history` của `GET /members/{id}` (OW-03). Các mã khớp `AUDIT_ACTION_LABELS` trong `features/members/member-labels.ts` (trừ `INVITATION_ACCEPTED`, `JOB_GRADE_UPDATED` — FE cần thêm nhãn).

| action | targetType | Khi nào |
|--------|------------|---------|
| MEMBER_INVITED | member_invitations | Mỗi lời mời được tạo |
| INVITATION_RESENT | member_invitations | Gửi lại |
| INVITATION_REVOKED | member_invitations | Thu hồi |
| INVITATION_ACCEPTED | users | Người được mời kích hoạt (actor = chính họ) |
| ROLE_CHANGED | users | Đổi vai trò (old/new roles) |
| MEMBER_PLACEMENT_CHANGED | employees | Đổi phòng ban / vị trí, hoặc tạo hồ sơ khi gán phòng ban lần đầu |
| MEMBER_DEACTIVATED | users (hoặc employees nếu không có tài khoản) | Vô hiệu hóa (lưu lý do) |
| MEMBER_REACTIVATED | users (hoặc employees) | Kích hoạt lại |
| JOB_GRADE_UPDATED | job_grades | Đổi tên cấp bậc |
| DEPARTMENT_CREATED / DEPARTMENT_UPDATED / DEPARTMENT_ARCHIVED | departments | |
| POSITION_CREATED / POSITION_UPDATED / POSITION_ARCHIVED | job_positions | |

### 3.9 Khác biệt so với mock / lưu ý cho FE

> Việc cụ thể cần làm ở từng file FE: xem **mục 4**.

| # | Nội dung | Gợi ý xử lý ở FE |
|---|----------|------------------|
| 1 | `AssignManagerDepartmentsModal` gửi `PUT /departments/{id}` với `parentDepartmentId: undefined` và không gửi `description` → mỗi lần gán quản lý sẽ **xóa phòng ban cha và mô tả** (vì `PUT` thay toàn bộ) | Gửi lại đủ `parentDepartmentId`, `description` hiện có |
| 2 | `message` của lỗi 400/403/404/409 là tiếng Anh (như toàn backend); riêng `rejected[].reason` khi mời là tiếng Việt | Dùng thông báo dự phòng tiếng Việt của `apiErrorMessage`, hoặc dịch theo mã trong `errors[].message` (`NO_ACCOUNT`, `NO_EMPLOYEE_PROFILE`, `INVALID_DEPARTMENT`, `INVALID_JOB_POSITION`, `INVALID_MANAGER`, `PASSWORD_SAME_AS_EMAIL`) |
| 3 | Kết quả mời: modal dùng `person.token` làm link "giả lập email"; BE chỉ trả `token`/`debugLink` ở Development, môi trường khác là `null` | Ẩn link khi `token` null |
| 4 | Kiểu FE `InvitationSummary.token` là `string` bắt buộc; BE trả `token: string \| null` và thêm `id`, `expiresAt`, `debugLink` | Đổi `token` thành optional, thêm các field mới vào kiểu |
| 5 | `history[]` của BE không có `detail`; `actorName` có thể `null` | `entry.actorName ?? 'Hệ thống'` |
| 6 | `coveragePercent` là `null` khi chưa tính skill gap; `highGapCount`/`activeCourses` là `null` với tài khoản không có hồ sơ và lời mời | Kiểu FE đã optional — giữ nguyên |
| 7 | Danh sách có cả hồ sơ nhân viên chưa có tài khoản (tạo qua `/employees`): `id` = employee id, `roles = ["EMPLOYEE"]`, `email` có thể rỗng. Đổi vai trò cho dòng này trả 400 `NO_ACCOUNT` | Hiển thị lỗi `NO_ACCOUNT` thành "Nhân viên chưa có tài khoản" |
| 8 | `DepartmentFormDialog` lấy trưởng phòng từ `useMembers` với value `employeeId ?? id`: tài khoản chưa có hồ sơ sẽ gửi user id → 400 `INVALID_MANAGER` | Chỉ liệt kê thành viên có `employeeId` |
| 9 | `invitationService` chưa nối backend | Xem mục 3.3 |
| 10 | Thẻ "chờ kích hoạt" ở OW-01 (`members.pending`) vẫn đếm tài khoản chưa đăng nhập lần nào, chưa tính lời mời `PENDING` | Số lời mời: `GET /members?status=PENDING` → `totalItems` |

---

## 4. HƯỚNG DẪN TÍCH HỢP FRONTEND — NHÓM TỔ CHỨC

> Dành cho FE1 khi nối các màn OW-02 … OW-13 với backend thật. Mục 3 là hợp đồng API; mục này nói **làm gì ở FE, ở file nào**. Số dòng tham chiếu theo code tại thời điểm viết (nhánh `feature/DT-organization-api`), có thể lệch vài dòng.
>
> **Trạng thái:** đã làm ở nhánh `feature/DT-organization-fe-integration`: kiểu TypeScript (4.3), `invitationService` (4.4), các lỗi ①–⑨ (4.5) và helper dịch lỗi `organizationErrorMessage` (`frontend/src/lib/organization-errors.ts`, 4.6). Cột "Trạng thái" ở bảng 4.2 là tình trạng trước khi tích hợp.

### 4.1 Bật kết nối backend

1. Chạy backend Development: `cd backend && dotnet run --project src/DigiTalent.Api` (migration + seed tự chạy, Swagger `http://localhost:5000/swagger`).
2. `frontend/.env`: `VITE_USE_MOCK=false`. Vite proxy `/api`, `/hubs` → `http://localhost:5000`.
3. Đăng nhập `hr@digitalent.ai` / `Admin@1234` (FE chuẩn hóa `HR_MANAGER` → `OWNER`).

Cơ chế: mọi service dùng `apiClient` (`services/api-client.ts`) tự gọi backend khi tắt mock (mock chỉ là `axios adapter`), nên `memberService`, `departmentService`, `jobPositionService`, `jobGradeService` **không cần sửa đường dẫn**. Ngoại lệ duy nhất: `invitationService` — khi tắt mock đang là `unavailableAdapter` (luôn lỗi), phải nối tay (mục 4.4).

### 4.2 Bản đồ màn hình → code FE → API

| Màn | Page / component | Hook | Service → Endpoint | Trạng thái |
|-----|------------------|------|--------------------|------------|
| OW-02 Thành viên | `features/members/pages/MembersPage.tsx` | `useMembers` | `memberService.getList` → `GET /members` | Chạy được ngay |
| | `features/members/components/InviteMembersModal.tsx` | `useInviteMembers` | `memberService.invite` → `POST /members/invitations` | Cần sửa nhỏ (4.5-②) |
| OW-03 Chi tiết thành viên | `features/members/pages/MemberDetailPage.tsx`, `components/employee-tabs/OverviewTab.tsx` (`history`) | `useMember` | `memberService.getById` → `GET /members/{id}` | Cần sửa nhỏ (4.5-④) |
| | `features/members/components/MemberDialogs.tsx` (đổi vai trò, đổi vị trí, vô hiệu hóa, kích hoạt lại, gửi lại / thu hồi lời mời) | `useUpdateMember`, `useDeactivateMember`, `useReactivateMember`, `useResendInvitation`, `useRevokeInvitation` | `PUT /members/{id}`, `POST …/deactivate`, `POST …/reactivate`, `POST …/resend-invitation`, `DELETE /members/invitations/{id}` | Chạy được ngay |
| OW-06 Phòng ban | `features/organization/pages/DepartmentListPage.tsx`, `components/DepartmentFormDialog.tsx` | `useDepartments`, `useCreateDepartment`, `useUpdateDepartment`, `useDeleteDepartment` | `/departments` | Cần sửa nhỏ (4.5-⑤) |
| OW-07 Chi tiết phòng ban | `features/organization/pages/DepartmentDetailPage.tsx` | `useDepartment`, `useMembers({ departmentId })`, `useJobPositions({ departmentId })` | `GET /departments/{id}`, `GET /members?departmentId=`, `GET /job-positions?departmentId=` | Chạy được ngay |
| OW-09 Vị trí | `features/organization/pages/PositionListPage.tsx`, `components/JobPositionFormDialog.tsx` | `useJobPositions`, `useCreateJobPosition`, `useUpdateJobPosition`, `useDeleteJobPosition` | `/job-positions` (thêm `departmentId`, `jobGrade`) | **Phải sửa** (4.5-⑨) |
| OW-10 Chi tiết vị trí | `features/organization/pages/PositionDetailPage.tsx` | `useJobPosition` (+ `usePositionRequirements`, `useWorkforce`, `useAssignments` của module khác) | `GET /job-positions/{id}` | Chạy được ngay |
| OW-12 Cấp bậc | `features/organization/pages/JobGradeConfigPage.tsx` | `useJobGrades`, `useUpdateJobGrade` | `GET /job-grades`, `PUT /job-grades/{code}` | Cần sửa nhỏ (4.5-③) |
| OW-13 Phân quyền | `features/members/pages/RolesAccessPage.tsx`, `components/AssignManagerDepartmentsModal.tsx` | `useRoles`, `useMembers({ role })`, `useUpdateMember`, `useUpdateDepartment` | `GET /roles`, `GET /members?role=MANAGER`, `PUT /members/{id}`, `PUT /departments/{id}` | **Phải sửa** (4.5-①) |
| `/activate/:token` | `features/auth/pages/ActivateInvitationPage.tsx` | `useQuery(['invitation', token])` | `invitationService.getInvitation` / `.activate` → `/invitations/*` | **Phải nối** (4.4) |

> OW-12 đang đánh dấu `status: 'RETIRED'` trong `lib/screens/enterprise/owner.ts`, nhưng API vẫn được dùng để hiển thị tên cấp bậc (`jobGradeName`) ở danh sách thành viên, phòng ban, vị trí.

### 4.3 Cập nhật kiểu TypeScript

Backend trả `null` (không phải `undefined`) cho field trống — các field optional của FE đã chịu được với `?? '—'`; chỉ cần sửa các chỗ dưới.

**`services/member.service.ts`**

```ts
export interface MemberListItem {
  // … giữ nguyên các field hiện có, thêm "| null" cho các field optional:
  coveragePercent?: number | null;
  highGapCount?: number | null;
  activeCourses?: number | null;
  deactivatedReason?: string | null;
}

export interface MemberHistoryEntry {
  id: string;
  at: string;
  actorName: string | null;     // null = hệ thống
  action: string;
  targetType: string;
  targetLabel: string;
  detail?: string;              // BE không trả, giữ optional
}

export interface MemberDetail extends MemberListItem {
  directManagerId?: string | null;   // mới
  directManagerName?: string | null;
  history: MemberHistoryEntry[];
}

export interface RoleSummary {
  role: string;
  roleCode?: string;            // mới: HR_MANAGER | DEPARTMENT_MANAGER | EMPLOYEE
  name: string;
  summary: string;
  can: string[];
  permissions?: string[];       // mới: mã quyền thực tế trong role_permissions
  memberCount: number;
  assignable: boolean;
}

export interface UpdateMemberRequest {
  roles?: string[];
  departmentId?: string;
  jobPositionId?: string;       // "" = bỏ vị trí (giữ nguyên hành vi hiện tại của PlacementModal)
}
```

**`types/commerce.ts`**

```ts
export interface InvitationSummary extends InviteRow {
  id?: string;                  // mới: invitation id (BE)
  token?: string | null;        // BE chỉ trả ở Development
  debugLink?: string | null;    // mới
  expiresAt?: string;           // mới
  status: 'pending' | 'accepted';
}

export interface InvitationDetail {
  organizationName: string;
  email: string;
  fullName: string;
  role: MemberRole;
  status: 'pending' | 'accepted';  // BE luôn trả 'pending' (link không dùng được → 404)
  expiresAt?: string;              // mới
}
```

**`services/job-grade.service.ts`**

```ts
export interface JobGradeItem {
  code: 'G1' | 'G2' | 'G3';
  name: string;
  description: string | null;   // đổi: có thể null
  isCustomized?: boolean;       // mới
  positionCount: number;
  employeeCount: number;
}
```

**`services/department.service.ts`** — thêm vào `DepartmentDto` (chi tiết): `positionCount?: number; subDepartmentCount?: number;` và vào `DepartmentListItem`: `parentDepartmentId?: string;`. Các field `headcount`, `gradeDistribution`, `managerEmployeeId`, `managerName` đã có sẵn.

**`services/job-position.service.ts`** — thêm vào `JobPositionDto`: `activeRequirementSetVersionNo?: number | null;`. Các field còn lại đã có sẵn.

### 4.4 Nối `invitationService` với backend

Thay phần `unavailableAdapter` trong `services/invitation.service.ts`:

```ts
import apiClient from './api-client';
import type { ApiResponse } from '../types/api';
import type { ActivateInvitationInput, InvitationDetail } from '../types/commerce';

const apiInvitationService = {
  getInvitation: (token: string) =>
    apiClient.get<ApiResponse<InvitationDetail>>(`/invitations/${encodeURIComponent(token)}`),
  activate: (input: ActivateInvitationInput) =>
    apiClient.post<ApiResponse<{ email: string; userId: string; employeeId: string | null }>>('/invitations/activate', input),
};

export const invitationService: InvitationService = USE_MOCK ? lazyAdapter(loadMock) : apiInvitationService;
```

`ActivateInvitationPage` không cần đổi: nó gọi `activate` rồi `login` bằng email + mật khẩu vừa đặt và chuyển tới `/enterprise/initial-assessment`. Lỗi 404 (`The invitation link is invalid or has expired.`) hiển thị qua `errorMessage(...)` sẵn có; nên thay bằng câu tiếng Việt khi `status === 404`.

### 4.5 Các lỗi FE cần sửa

| # | File | Vấn đề với backend thật | Cách sửa |
|---|------|-------------------------|----------|
| ① | `features/members/components/AssignManagerDepartmentsModal.tsx` (vòng `toAssign` / `toUnassign`, ~dòng 49–70) | Gửi `PUT /departments/{id}` với `parentDepartmentId: undefined` và không có `description` → BE (PUT thay toàn bộ) **xóa phòng ban cha và mô tả** mỗi lần gán/bỏ quản lý | Gửi lại `parentDepartmentId: d.parentDepartmentId` (đã có trong list item) và `description` (lấy qua `departmentService.getById` hoặc thêm vào list nếu cần) |
| ② | `features/members/components/InviteMembersModal.tsx` (~dòng 229–233) | Dùng `person.token` làm `key` và link "giả lập email"; ngoài Development BE trả `token: null` → key trùng, link hỏng | `key={person.id ?? person.email}`; chỉ render link khi `person.token`; có thể dùng `person.debugLink` |
| ③ | `features/organization/pages/JobGradeConfigPage.tsx` (~dòng 26) | `setDescription(g.description)` với `null` → input controlled nhận `null` | `setDescription(g.description ?? '')` |
| ④ | `features/members/pages/MemberDetailPage.tsx` (~dòng 70) | `employeeId = member?.employeeId ?? id`: tài khoản chưa có hồ sơ (VD `admin@`) dùng **user id** gọi capability API → 404 | Chỉ gọi `useEmployeeCapability` khi `member?.employeeId` có giá trị; hiển thị "Chưa có hồ sơ nhân viên" |
| ⑤ | `features/organization/components/DepartmentFormDialog.tsx` (~dòng 166) | Danh sách chọn trưởng phòng lấy từ `useMembers` với value `m.employeeId ?? m.id` → chọn tài khoản chưa có hồ sơ gửi user id → 400 `INVALID_MANAGER` | Lọc `members.filter(m => m.employeeId && m.status === 'ACTIVE')` và dùng `m.employeeId` |
| ⑥ | `features/members/member-labels.ts` (`AUDIT_ACTION_LABELS`) | Thiếu nhãn cho 2 action mới → hiện mã thô | Thêm `INVITATION_ACCEPTED: 'Kích hoạt lời mời'`, `JOB_GRADE_UPDATED: 'Cập nhật cấp bậc'` |
| ⑦ | `hooks/use-members.ts` (`useMemberMutation`) | Đổi phòng ban/vị trí, vô hiệu hóa thay đổi sĩ số phòng ban/vị trí/cấp bậc nhưng chỉ invalidate `members`, `organization`, `subscription`, `workforce` | Thêm `['departments']`, `['job-positions']`, `['job-grades']` vào danh sách invalidate |
| ⑧ | `hooks/use-departments.ts`, `hooks/use-job-positions.ts` | Đổi trưởng phòng / phòng ban của vị trí không làm mới danh sách thành viên & tổng quan | Invalidate thêm `['members']`, `['organization', 'overview']` |
| ⑨ | `features/organization/components/JobPositionFormDialog.tsx`, `pages/PositionListPage.tsx` | Form **không có trường `jobGrade`** mà `PUT /job-positions/{id}` thay toàn bộ → mỗi lần sửa vị trí qua form sẽ **xóa cấp bậc**; danh sách chưa hiển thị/lọc cấp bậc | Thêm select cấp bậc (G1/G2/G3, nhãn lấy từ `useJobGrades`) vào schema zod + `defaultValues` (`position.jobGrade ?? ''`) và gửi `jobGrade: data.jobGrade \|\| undefined`; thêm cột `jobGradeName` + bộ lọc `jobGrade` ở danh sách |

### 4.6 Hiển thị lỗi bằng tiếng Việt

`message` lỗi của BE là tiếng Anh; `apiErrorMessage(error, fallback)` hiện ưu tiên `message`. Gợi ý thêm helper dịch theo mã máy trong `errors[].message` (chỉ áp dụng khi BE có mã), đặt ở `lib/` (không dùng React):

```ts
const ORG_ERROR_MESSAGES: Record<string, string> = {
  NO_ACCOUNT: 'Nhân viên này chưa có tài khoản nên chưa thể gán vai trò.',
  NO_EMPLOYEE_PROFILE: 'Thành viên chưa có hồ sơ nhân viên. Hãy chọn phòng ban để tạo hồ sơ.',
  INVALID_DEPARTMENT: 'Phòng ban không tồn tại hoặc không còn hoạt động.',
  INVALID_JOB_POSITION: 'Vị trí công việc không tồn tại hoặc không còn hoạt động.',
  INVALID_MANAGER: 'Trưởng phòng phải là nhân viên đang hoạt động của tổ chức.',
  PASSWORD_SAME_AS_EMAIL: 'Mật khẩu không được trùng với email.',
};

export function orgErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<ApiResponse<unknown>>(error)) {
    const code = error.response?.data?.errors?.[0]?.message;
    if (code && ORG_ERROR_MESSAGES[code]) return ORG_ERROR_MESSAGES[code];
    if (error.response?.status === 409 || error.response?.status === 403) return fallback;
  }
  return apiErrorMessage(error, fallback);
}
```

Các lỗi 409 thường gặp nên có câu riêng ở dialog tương ứng: còn 1 Owner (`The organization must keep at least one active Owner.`), tự vô hiệu hóa chính mình, hết ghế khi kích hoạt lại, lưu trữ phòng ban còn nhân viên / phòng ban con / vị trí, sửa vị trí đã lưu trữ. Danh sách đầy đủ ở các bảng lỗi mục 3.2, 3.6, 3.7.

### 4.7 Quy tắc hiển thị nên áp dụng

- **Phân biệt 3 loại dòng thành viên:** `kind === 'invitation'` → lời mời; `employeeId == null` → tài khoản chưa có hồ sơ (ẩn tab năng lực/học tập, cho "Đổi phòng ban" để tạo hồ sơ); `email === ''` hoặc đổi vai trò trả `NO_ACCOUNT` → hồ sơ chưa có tài khoản.
- **Nút theo quyền:** đổi vai trò cần `ROLE_ASSIGN_BUSINESS`; vô hiệu hóa/kích hoạt lại cần `USER_LOCK_UNLOCK`; mời/gửi lại/thu hồi cần `USER_CREATE`; sửa cấp bậc cần `JOB_GRADE_MANAGE`. Ẩn "Vô hiệu hóa" với chính mình và với `SYSTEM_ADMIN` (BE vẫn chặn).
- **Ghế:** `seatsUsed` (FE lấy từ `/auth/me`) có thể chưa tính lời mời; số lời mời PENDING lấy từ `GET /members?status=PENDING&pageSize=1` → `totalItems`.
- **Cấp bậc:** luôn hiển thị `jobGradeName` (tên theo tổ chức) thay vì mã `G1/G2/G3`.
- **Chỉ số năng lực:** `coveragePercent === null` → "Chưa đánh giá" (MembersPage đã làm đúng).
- **Lời mời hết hạn:** BE vẫn liệt kê như `PENDING`; có thể so `invitedAt + 7 ngày` để gợi ý "Gửi lại".

### 4.8 Kịch bản kiểm thử thủ công (backend thật)

| # | Tài khoản | Thao tác | Kết quả mong đợi |
|---|-----------|----------|------------------|
| 1 | hr@ | Mở `/enterprise/members` | 5 thành viên seed; `admin@` là OWNER không có phòng ban |
| 2 | hr@ | Mời 1 email mới vai trò MANAGER + 1 email sai | 1 created (có link ở Development), 1 rejected "Email không hợp lệ."; dòng lời mời PENDING ở cuối danh sách |
| 3 | (ẩn danh) | Mở link `/activate/{token}`, đặt mật khẩu ≥12 ký tự | Tạo tài khoản, tự đăng nhập, vào enterprise; link dùng lại → báo hết hạn |
| 4 | hr@ | Chi tiết thành viên vừa kích hoạt → đổi vai trò EMPLOYEE, đổi vị trí | Vai trò, vị trí cập nhật; tab lịch sử có `INVITATION_ACCEPTED`, `ROLE_CHANGED` |
| 5 | hr@ | Vô hiệu hóa thành viên đó (nhập lý do) rồi kích hoạt lại | Trạng thái + lý do hiển thị; người đó bị đăng xuất khi đang dùng; đăng nhập lại khi INACTIVE → 403 |
| 6 | hr@ | Tự hạ vai trò của chính mình xuống EMPLOYEE | 409, giữ nguyên vai trò |
| 7 | hr@ | `/enterprise/departments` → gán trưởng phòng | `managerName`, `headcount`, phân bố cấp bậc đúng; phòng ban cha **không bị mất** (sau khi sửa 4.5-①) |
| 8 | hr@ | `/enterprise/positions` → gán phòng ban + cấp bậc G1 cho ACCOUNTANT | Lọc theo phòng ban/cấp bậc ra đúng; thành viên `employee@` hiện cấp bậc G1 |
| 9 | hr@ | `/enterprise/positions/grades` → đổi tên G1 | Tên mới xuất hiện ở danh sách vị trí, thành viên |
| 10 | hr@ | `/enterprise/access` | 3 vai trò, số người giữ đúng, `assignable = true` |
| 11 | manager@ | Mở `/enterprise/members` hoặc gọi `/roles` | 403; `GET /job-grades` vẫn 200 |
| 12 | employee@ | Gọi bất kỳ API `/members` | 403 |

---

## 5. NĂNG LỰC & NHÂN SỰ (OW-03, OW-10, OW-15, OW-16, OW-19, OW-20, OW-21)

> Nhánh `feature/DT-be1-competency-apis`. Trước đây 7 endpoint dưới đây chỉ có ở mock FE (`services/mock/server/handlers/{workforce,competency,analytics}.ts`), nên với backend thật các màn này trống (`/workforce/{id}` trả 404). Đường dẫn và shape giữ đúng kiểu TS trong `services/{workforce,competency,analytics}.service.ts`; FE không phải đổi code gọi API.

| Endpoint | Quyền | Màn |
|----------|-------|-----|
| `GET /workforce` | `employee.read` | OW-10 (tab Nhân sự), OW-19 |
| `GET /workforce/{employeeId}` | `employee_competency_profile.read` | OW-03 (các tab), OW-20 |
| `GET /competency-profiles/matrix` | `employee_competency_profile.read` | OW-19, MG-04 |
| `GET /competencies/{id}/usage` | `competency.read` | OW-15 |
| `GET /position-requirements/summaries` | `position_requirement.read` | OW-16 |
| `GET /intelligence/analytics/overview` | `skill_gap.read` | OW-21 |
| `GET /intelligence/analytics/competencies` | `skill_gap.read` | OW-21, OW-40 |

**Phạm vi dữ liệu:** mọi số liệu theo nhân viên đi qua `EmployeeScope` — HR/Admin: cả tổ chức; Department Manager: phòng ban của mình; vai trò khác: chính mình. Nhân viên ngoài phạm vi → 404. Không cần migration, không thêm mã quyền.

**"Snapshot mới nhất":** lần tính skill gap gần nhất (`skill_gap_runs`) của mỗi nhân viên. Nhân viên chưa từng tính thì không có snapshot (`hasSnapshot = false`, các chỉ số `null`) và không được tính vào analytics. Tính bằng `POST /intelligence/skill-gaps/calculate` hoặc `calculate-batch`.

### 5.1 GET /workforce — Danh sách nhân sự

```
Query: pageIndex (≥1), pageSize (1–100, mặc định 20), search (họ tên / mã NV),
       departmentId, jobPositionId,
       status   ACTIVE | INACTIVE | TRANSFERRED | ARCHIVED (bỏ trống = ACTIVE + INACTIVE),
       gap      HIGH (có khoảng trống HIGH) | ANY (có khoảng trống) | NONE (đã tính, không thiếu) | UNKNOWN (chưa tính),
       learning OVERDUE (có khóa quá hạn) | ACTIVE (có khóa chưa xong) | NONE (không có khóa đang học)
Giá trị sai (status/gap/learning, pageSize) → 400 Validation failed.
```

`data` = `PagedList<WorkforceRow>`. Mỗi dòng = các field của `EmployeeListItem` (như `GET /employees`) cộng:

| Field | Mô tả |
|-------|-------|
| hasSnapshot | Đã có snapshot skill gap |
| blocker | Lý do không tính được skill gap: `EMPLOYEE_NOT_ACTIVE` / `NO_JOB_POSITION` / `NO_ACTIVE_REQUIREMENT_SET`; `null` khi tính được |
| coveragePercent, gapCount, highCount | Của snapshot mới nhất; `null` khi chưa có snapshot |
| activeCourses, completedCourses, overdueCourses | Phân công khóa học (bỏ CANCELLED): chưa hoàn thành / đã hoàn thành / quá hạn mà chưa hoàn thành |

Thứ tự: nhiều khoảng trống HIGH trước, rồi nhiều khoảng trống, rồi họ tên (collation tiếng Việt). Lọc `gap`/`learning` cần số liệu đã tính nên danh sách được dựng cho cả phạm vi rồi mới phân trang.

### 5.2 GET /workforce/{employeeId} — Hồ sơ năng lực một nhân viên

`{employeeId}` là **employee id** (không phải user id). Ngoài phạm vi / không tồn tại → 404.

| Field | Mô tả |
|-------|-------|
| employee | `EmployeeListItem` |
| summary | `WorkforceRow` (như 5.1) |
| competencies[] | Mọi năng lực ACTIVE của tổ chức có mapping Thông tư 02/2025, cộng năng lực vị trí yêu cầu hoặc nhân viên đang giữ. `{ competencyId, frameworkCode, name, categoryName, categorySortOrder, currentLevel (null = chưa xác nhận), requiredLevel (0 = vị trí không yêu cầu), source, confirmedAt, note }`; sắp theo miền rồi mã TT02 (1.2 trước 1.10) |
| skillGap | `{ runId, generatedAt, requirementSetVersionNo, summary, items }` của snapshot mới nhất (giống `GET /intelligence/skill-gaps/{runId}`); `null` nếu chưa tính |
| recommendations | Luôn `[]` — gợi ý khóa học lấy qua `GET /intelligence/recommendations?employeeId=` (tab Khoảng trống đã gọi API này) |
| learning[] | Phân công khóa học (bỏ CANCELLED), mới nhất trước — cùng shape `AssignmentRow` của `GET /course-assignments` |
| evidence[] | Mức đang xác nhận của từng năng lực: `{ competencyId, competencyName, frameworkCode, level, source, confirmedAt, note }`, mới nhất trước |
| tasks[] | Nhiệm vụ thực tế (bỏ CANCELLED): `{ id, title, description, dueDate, status, competencyIds }` — status `ASSIGNED / SUBMITTED / NEEDS_REVISION / PASSED / FAILED` |
| submissions[] | Bài nộp: `{ id, taskTitle, content (ghi chú hoặc link đầu tiên), status, submittedAt, evaluatorName }` — status `EVALUATED` (đạt) / `REJECTED` (cần sửa hoặc không đạt) / trạng thái bài nộp khi chưa chấm |
| assessments[] | Lần làm bài đã nộp: `{ id, assessmentId, courseTitle, score, totalQuestions, correctAnswers, passed, submittedAt }` |
| certificates[] | `{ id, certificateCode, courseTitle, issueDate, expiryDate, status }` |

`source` của mức năng lực: `MIGRATION` (dữ liệu ban đầu), `TASK` (từ nhiệm vụ thực tế), `MANUAL` (Owner xác nhận tay).

### 5.3 GET /competency-profiles/matrix — Ma trận năng lực

```
Query: departmentId, jobPositionId, jobGrade (G1|G2|G3, sai → 400), categoryId (chỉ cột của miền này), search
```

| Field | Mô tả |
|-------|-------|
| categories[] | `{ id, code, name, sortOrder }` — các miền có cột |
| competencies[] | Cột: năng lực ACTIVE có mapping TT02 `{ id, code, frameworkCode, name, categoryId }`, theo miền rồi mã |
| employees[] | Nhân viên ACTIVE trong phạm vi, theo họ tên: `{ employeeId, employeeCode, fullName, departmentId, departmentName, jobPositionId, jobPositionName, jobGrade, coveragePercent (snapshot mới nhất, null nếu chưa tính), totalGaps (số cột current < required), cells }` |
| cells | Object theo competency id: `{ currentLevel (0 = chưa xác nhận), requiredLevel (0 = không yêu cầu), gap = max(0, required − current), evidenceSource, evidenceStatus (CONFIRMED / NONE), confirmedAt }` |

### 5.4 GET /competencies/{id}/usage — Năng lực được dùng ở đâu

Năng lực không thuộc tổ chức → 404.

| Field | Mô tả |
|-------|-------|
| positions[] | Vị trí ACTIVE có bộ yêu cầu ACTIVE chứa năng lực: `{ positionId, positionName, requiredLevel, isMandatory, weightPercent, employees (nhân viên ACTIVE trong phạm vi) }` |
| courses[] | Khóa PUBLISHED (bản mới nhất của mỗi mã) dạy năng lực: `{ id, code, title, level (target_level), assigned (phân công chưa hủy) }` |
| levelDistribution | `{ "0": n, "1": n, "2": n, "3": n }` — nhân viên ACTIVE trong phạm vi theo mức xác nhận |
| employeesWithGap[] | Nhân viên ACTIVE trong phạm vi có mức < mức vị trí yêu cầu: `{ employeeId, fullName, email, departmentName, jobPositionName, jobGrade, currentLevel, requiredLevel, gap }`, gap lớn trước |

### 5.5 GET /position-requirements/summaries — Tình trạng yêu cầu theo vị trí

Mảng, mỗi vị trí chưa ARCHIVED (theo mã): `{ jobPositionId, jobPositionCode, jobPositionName, jobGrade, departmentId, departmentName (null nếu chưa gắn phòng ban), employeeCount (nhân viên ACTIVE), activeSet, draftSet, totalVersions, status }`.

- `activeSet` / `draftSet`: `{ id, versionNo, effectiveFrom, activatedAt, competencyCount }` hoặc `null` (draft lấy bản mới nhất).
- `status`: `ACTIVE` (có bộ đang áp dụng) / `DRAFT` (chỉ có nháp) / `NOT_CONFIGURED`.
- Không có `changeReason` (bảng `position_requirement_sets` không có cột này).

### 5.6 GET /intelligence/analytics/overview — Tổng quan khoảng trống

```
Query: groupBy department (mặc định) | position | grade (sai → 400), departmentId, jobPositionId, jobGrade
```

`data = { groupBy, totals, groups[] }`. `totals` và mỗi nhóm có `{ employees, averageCoverage, totalGaps, highCount, mediumCount, lowCount, employeesWithHigh }` tính trên snapshot mới nhất của nhân viên ACTIVE trong phạm vi. Nhóm: `{ id, name }` + chỉ số — phòng ban/vị trí ACTIVE hoặc cấp bậc G1–G3 (tên theo cấu hình tổ chức, mục 3.5); bỏ nhóm không có ai được phân tích; độ đáp ứng thấp nhất trước.

### 5.7 GET /intelligence/analytics/competencies — Khoảng trống theo năng lực

Cùng bộ lọc (trừ `groupBy`). Mảng `{ competencyId, frameworkCode, name, categoryName, employeesRequired, employeesWithGap, highCount, mediumCount, lowCount, averageRequiredLevel, averageCurrentLevel (chưa xác nhận tính là 0) }`, nhiều HIGH trước, rồi nhiều người thiếu, rồi mã TT02.

### 5.8 Kiểm thử

- `tests/DigiTalent.Tests/Organization/WorkforceTests.cs`, `Competency/CompetencyInsightTests.cs`, `Intelligence/SkillGapAnalyticsTests.cs` (PostgreSQL), `Organization/WorkforceValidatorTests.cs`.
- Seed Development sau `POST /intelligence/skill-gaps/calculate-batch`: `employee@` (Kế toán) có 21 năng lực yêu cầu, 15 khoảng trống, 4 HIGH, độ đáp ứng 62.03% — khớp spec `docs/specs/2026-09-29-tt02-position-competency-matrix.md` §8.

---

## Mapping trạng thái gói dịch vụ (FE ↔ BE)

| FE mock (`SubscriptionStatus`) | BE trả về (`plan.status`) |
|--------------------------------|---------------------------|
| `"active"` | `"ACTIVE"` |
| `"expired"` | `"EXPIRED"` |
| `"payment_required"` | `"PAYMENT_REQUIRED"` |
| — | `"CANCELLED"` |

Trang OW-01 chỉ dùng `plan.name` và `plan.renewsAt`. Nếu nơi khác cần so sánh trạng thái, chuẩn hóa bằng `status.toLowerCase()`.

---

## Khác biệt so với mock cần lưu ý

| Field | Mock | BE | Gợi ý xử lý ở FE |
|-------|------|----|-------------------|
| `recentActivity[].actorName` | luôn có | có thể `null` | `entry.actorName ?? 'Hệ thống'`; sửa kiểu thành `string \| null` |
| `recentActivity[].detail` | có thể có | không trả | không dùng trên OW-01 |
| `plan.code` | không có | có | thêm `code?: string` vào kiểu hoặc bỏ qua |
| `gradeDistribution` | có | chưa trả | giữ optional |

---

## Tài khoản test (seed Development)

Mật khẩu chung: `Admin@1234`.

| Email | Vai trò BE | Vai trò FE (sau `normalizeRoles`) | `GET /organization/overview` | `/members`, `/roles`, `PUT /job-grades` | `GET /job-grades` |
|-------|-----------|------------------------------------|------------------------------|------------------------------------------|-------------------|
| hr@digitalent.ai | HR_MANAGER | OWNER | 200 | 200 | 200 |
| admin@digitalent.ai | SYSTEM_ADMIN | PLATFORM_ADMIN + OWNER | 200 | 200 | 200 |
| manager@digitalent.ai | DEPARTMENT_MANAGER | MANAGER | 403 | 403 | 200 |
| trainer@ / employee@digitalent.ai | TRAINER / EMPLOYEE | EMPLOYEE | 403 | 403 | 403 |

> Quyền mới (`user.*`, `role.*`, `job_grade.*` cho HR_MANAGER; `job_grade.read` cho DEPARTMENT_MANAGER) được `DbSeeder` tự thêm khi chạy Development. Môi trường khác cần chạy seed hoặc thêm vào `role_permissions`.

Seed tạo sẵn cho tổ chức demo: gói `BUSINESS` 50 người dùng, 1 đợt đào tạo `BATCH-Q4-2026` trạng thái `ACTIVE`, `setupCompleted = true`.

---

## Lưu ý quan trọng

1. **Tất cả API đều scoped theo organization**: dữ liệu tự lọc theo org của user đang login.
2. **Admin (SYSTEM_ADMIN)** bypass mọi permission check.
3. **Date format** trả về ISO 8601: `"2025-10-01T10:00:00+07:00"`.
4. **ID** là UUID (guid), truyền dạng string `"550e8400-e29b-41d4-a716-446655440000"`.
5. **Migration:** nếu trước đây đã tự tạo bằng tay một trong 6 bảng ở mục 2 trên DB local, hãy xóa các bảng đó (hoặc dựng DB mới) trước khi chạy backend, nếu không migration sẽ báo bảng đã tồn tại.
   Mục 3 thêm migration `AddOrganizationStructureAndInvitations` (2 bảng `job_grades`, `member_invitations` + 3 cột); Development tự áp dụng khi start, môi trường khác chạy `dotnet ef database update`.
6. **Swagger** có sẵn tại `http://localhost:5000/swagger` khi chạy Development.
