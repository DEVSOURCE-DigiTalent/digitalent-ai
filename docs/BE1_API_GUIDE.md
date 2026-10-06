# BE1 API Guide — Tài liệu tích hợp cho Frontend

> Base URL: `http://localhost:5000/api/v1`
> Auth: Tất cả API cần header `Authorization: Bearer <accessToken>`
> Lấy token: `POST /api/v1/auth/login` với `{ email, password }`
> Phạm vi: các API do nhánh `feature/DT-overview-dashboard-api` (PR #49) thêm vào. Hướng dẫn chi tiết cho trang OW-01: `docs/integration/OW-01_Tong_Quan_FE_Integration.md`.

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
      { "key": "requirements", "label": "Yêu cầu năng lực theo vị trí", "done": true, "detail": "5/5 vị trí đã có yêu cầu đang áp dụng", "path": "/enterprise/positions/requirements" },
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

| Email | Vai trò BE | Vai trò FE (sau `normalizeRoles`) | `GET /organization/overview` |
|-------|-----------|------------------------------------|------------------------------|
| hr@digitalent.ai | HR_MANAGER | OWNER | 200 |
| admin@digitalent.ai | SYSTEM_ADMIN | PLATFORM_ADMIN + OWNER | 200 |
| manager@digitalent.ai | DEPARTMENT_MANAGER | MANAGER | 403 |
| trainer@ / employee@digitalent.ai | TRAINER / EMPLOYEE | EMPLOYEE | 403 |

Seed tạo sẵn cho tổ chức demo: gói `BUSINESS` 50 người dùng, 1 đợt đào tạo `BATCH-Q4-2026` trạng thái `ACTIVE`, `setupCompleted = true`.

---

## Lưu ý quan trọng

1. **Tất cả API đều scoped theo organization**: dữ liệu tự lọc theo org của user đang login.
2. **Admin (SYSTEM_ADMIN)** bypass mọi permission check.
3. **Date format** trả về ISO 8601: `"2025-10-01T10:00:00+07:00"`.
4. **ID** là UUID (guid), truyền dạng string `"550e8400-e29b-41d4-a716-446655440000"`.
5. **Migration:** nếu trước đây đã tự tạo bằng tay một trong 6 bảng ở mục 2 trên DB local, hãy xóa các bảng đó (hoặc dựng DB mới) trước khi chạy backend, nếu không migration sẽ báo bảng đã tồn tại.
6. **Swagger** có sẵn tại `http://localhost:5000/swagger` khi chạy Development.
