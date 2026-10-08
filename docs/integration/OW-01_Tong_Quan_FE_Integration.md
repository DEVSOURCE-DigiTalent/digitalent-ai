# Hướng dẫn tích hợp frontend: Trang Tổng quan tổ chức (OW-01)

| | |
|---|---|
| **Màn hình** | OW-01 Tổng quan tổ chức, route `/enterprise/dashboard` |
| **Trang React** | `frontend/src/features/organization/pages/OrganizationOverviewPage.tsx` |
| **API backend** | `GET /api/v1/organization/overview` (`OrganizationController`), `GET /api/v1/intelligence/dashboard` (`ReportsController`, module BE2) |
| **PR backend** | #49 (`feature/DT-overview-dashboard-api`) |
| **Cập nhật** | 2026-10-06, sau khi ghép với `develop` (PR #48, #50, #51, #52) |

Tài liệu này dành cho người làm frontend: cách bật API thật cho trang OW-01, dữ liệu mỗi API trả về, khối nào trên trang dùng trường nào, và những điểm khác so với mock.

---

## 1. Tóm tắt nhanh

- **Không cần sửa code gọi API.** Hai API dùng đúng đường dẫn và shape mà service frontend đang gọi:

  | Hook | Service | Endpoint | Cài đặt backend |
  |---|---|---|---|
  | `useOrganizationOverview()` (`hooks/use-organization.ts`) | `organizationService.getOverview()` | `GET /organization/overview` | `GetOrganizationOverviewUseCase` (PR #49) |
  | `useCapabilityDashboard()` (`hooks/use-analytics.ts`) | `analyticsService.getDashboard()` | `GET /intelligence/dashboard` | `GetDashboardUseCase` (module BE2, `ReportsController`) |

- **Chỉ cần:** chạy backend, tắt mock, đăng nhập bằng tài khoản HR hoặc Admin.
- **Lưu ý:** dashboard năng lực của BE2 hiện còn trả `0` cho một số trường (tỷ lệ đáp ứng, số liệu radar). Xem mục 5.3.
- **Nên sửa nhỏ ở frontend** (không bắt buộc), xem mục 6.

---

## 2. Bật API thật

### 2.1. Chạy backend

```bash
cd backend
dotnet run --project src/DigiTalent.Api
```

- Môi trường Development tự chạy migration và seed dữ liệu demo. Swagger ở http://localhost:5000/swagger.
- Cần PostgreSQL theo chuỗi kết nối trong `backend/src/DigiTalent.Api/appsettings.json`.
- **Nếu trước đây bạn đã tự tạo bằng tay** các bảng `subscriptions`, `subscription_entitlements`, `invoices`, `training_batches`, `training_batch_employees`, `recommendation_reviews` trên DB local, hãy xóa chúng (hoặc dựng DB mới) trước khi chạy. Migration mới sẽ tạo lại các bảng này, và báo lỗi nếu bảng đã tồn tại.

### 2.2. Cấu hình frontend (`frontend/.env`)

```env
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

- Có thể bỏ trống `VITE_API_BASE_URL`: khi đó `apiClient` dùng `/api/v1` và Vite proxy chuyển `/api` sang `http://localhost:5000` (`vite.config.ts`).
- Đổi `.env` xong phải khởi động lại `npm run dev`.

### 2.3. Tài khoản dùng để test

Mật khẩu chung: `Admin@1234` (seed Development).

| Tài khoản | Vai trò | Workspace | `/organization/overview` | `/intelligence/dashboard` |
|---|---|---|---|---|
| `owner@digitalent.ai` | `OWNER` | `enterprise` | 200 | 200 |
| `platform@digitalent.ai` | `PLATFORM_ADMIN` | `platform` | 403 | 403 |
| `manager@digitalent.ai` | `MANAGER` | `enterprise` | 403 | 200 |
| `employee@digitalent.ai` | `EMPLOYEE` | `enterprise` | 403 | 403 |

- `/organization/overview` yêu cầu quyền `dashboard.hr_company.read`.
- `/intelligence/dashboard` chấp nhận `dashboard.hr_company.read` **hoặc** `dashboard.department.read`, nên Manager gọi được (trang Team của Manager dùng chung endpoint này).

### 2.4. Chuẩn bị dữ liệu cho phần năng lực

Seed **không tự tính skill gap**, nên lần đầu "Nhân sự cần chú ý" sẽ trống. Để có dữ liệu, đăng nhập Owner rồi gọi một lần:

```http
POST /api/v1/intelligence/skill-gaps/calculate-batch
Authorization: Bearer <token>
Content-Type: application/json

{}
```

Kết quả mong đợi: `"Skill gap calculated for 2 employee(s)."` Sau đó tải lại trang.

---

## 3. Khối nào trên trang dùng trường nào

| Khối trên trang | API | Trường | Ghi chú |
|---|---|---|---|
| Banner "Việc thiết lập tổ chức chưa hoàn tất" | overview | `setupCompleted` | Hiện khi `false` |
| Thẻ "Thành viên hoạt động" | overview | `members.active`, `members.inactive`, `members.pending` | |
| Thẻ "Người dùng đã kích hoạt" | overview | `seats.used`, `seats.limit` | `limit = null` nghĩa là không giới hạn; trang đã xử lý |
| Thẻ "Tỷ lệ đáp ứng năng lực" | dashboard | `kpis.averageCoverage` | **Hiện luôn bằng 0** (mục 5.3) |
| Thẻ "Đợt đào tạo đang chạy" | overview | `runningBatches` | Số đợt `ACTIVE` trong `training_batches` |
| Thẻ "Minh chứng chờ duyệt" | overview | `pendingReviews` | Nhiệm vụ thực tế đã nộp, chưa được đánh giá |
| Thẻ "Gói dịch vụ" | overview | `plan.name`, `plan.renewsAt` | `plan = null` khi chưa có gói; trang hiện `—` |
| Khối "Cơ cấu nhân sự theo tổ chức" | overview | `members.active`, `members.pending`, `seats.limit` | |
| Radar "Năng lực số theo 6 miền TT02" | dashboard | `domains[]` | Đủ trục, nhưng **giá trị hiện luôn bằng 0** (mục 5.3) |
| Khối "Nhân sự cần chú ý" | dashboard | `atRisk[]` | Trang hiển thị 4 người đầu |
| Khối "Mức sẵn sàng thiết lập tổ chức" | overview | `setup[]` | 4 bước, có `path` để điều hướng |
| Khối "Hoạt động gần đây" | overview | `recentActivity[]` | 5 dòng mới nhất |

---

## 4. `GET /api/v1/organization/overview`

### 4.1. Kiểu TypeScript

Khớp `OrganizationOverview` trong `frontend/src/services/organization.service.ts`. Chú thích `// backend:` là chỗ backend trả khác hoặc thêm so với kiểu hiện tại.

```ts
interface OrganizationOverview {
  name: string;
  members: { active: number; pending: number; inactive: number };
  seats: { used: number; limit: number | null };
  plan: {
    name: string;
    renewsAt?: string;          // ISO 8601, có thể null
    status: string;             // backend: 'ACTIVE' | 'EXPIRED' | 'PAYMENT_REQUIRED' | 'CANCELLED' (chữ HOA)
    code?: string;              // backend: có thêm, VD 'BUSINESS'
  } | null;
  gradeDistribution?: GradeDistributionItem[]; // backend: CHƯA trả về
  pendingReviews?: number;      // backend: luôn có
  runningBatches?: number;      // backend: luôn có
  setup: SetupItem[];           // { key, label, done, detail, path }
  recentActivity: MemberHistoryEntry[];
  setupCompleted: boolean;
}

// recentActivity[] — backend trả:
// { id: string; at: string; actorName: string | null; action: string; targetType: string; targetLabel: string }
// (không có trường detail)
```

### 4.2. Response mẫu (seed Development)

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
      { "key": "departments",  "label": "Phòng ban",                    "done": true, "detail": "1 phòng ban", "path": "/enterprise/departments" },
      { "key": "positions",    "label": "Vị trí công việc",             "done": true, "detail": "5 vị trí", "path": "/enterprise/positions" },
      { "key": "requirements", "label": "Yêu cầu năng lực theo vị trí", "done": true, "detail": "5/5 vị trí đã có yêu cầu đang áp dụng", "path": "/enterprise/positions/requirements" },
      { "key": "members",      "label": "Thành viên",                   "done": true, "detail": "2 đang hoạt động, 2 chờ kích hoạt", "path": "/enterprise/members" }
    ],
    "setupCompleted": true,
    "recentActivity": []
  },
  "errors": []
}
```

### 4.3. Ý nghĩa từng trường

| Trường | Ý nghĩa |
|---|---|
| `members.active` | Nhân viên đang làm việc, không có tài khoản hoặc tài khoản đã đăng nhập ít nhất 1 lần |
| `members.pending` | Nhân viên đang làm việc, có tài khoản nhưng **chưa đăng nhập lần nào** (chưa có bảng lời mời nên dùng định nghĩa này) |
| `members.inactive` | Nhân viên ngừng hoạt động (không tính nhân viên đã lưu trữ) |
| `seats.used` | Số tài khoản người dùng đang ACTIVE |
| `seats.limit` | `subscriptions.seat_limit` của tổ chức; `null` = không giới hạn hoặc chưa có gói |
| `plan` | Gói hiện tại trong bảng `subscriptions` (mỗi tổ chức 1 dòng); `null` nếu chưa có |
| `pendingReviews` | Bài nộp nhiệm vụ thực tế ở trạng thái SUBMITTED / UNDER_REVIEW, chưa có đánh giá |
| `runningBatches` | Số đợt đào tạo có `status = ACTIVE` (cùng dữ liệu với màn Đợt đào tạo của BE2) |
| `setup[]` | Luôn đủ 4 phần tử, thứ tự cố định: `departments`, `positions`, `requirements`, `members` |
| `setupCompleted` | Tổ chức đã hoàn tất wizard `/setup` hay chưa (`organizations.setup_completed_at`) |
| `recentActivity[]` | Tối đa 5 dòng audit log mới nhất, mới nhất ở đầu |

Điều kiện `done` của `setup[]`:

| `key` | `done` khi |
|---|---|
| `departments` | Có ít nhất 1 phòng ban ACTIVE |
| `positions` | Có ít nhất 1 vị trí ACTIVE |
| `requirements` | Mọi vị trí ACTIVE đều có bộ yêu cầu năng lực đang áp dụng |
| `members` | `active + pending > 1` |

---

## 5. `GET /api/v1/intelligence/dashboard` (module BE2)

### 5.1. Kiểu TypeScript

Khớp `DashboardDto` trong `frontend/src/services/analytics.service.ts`:

```ts
interface DashboardDto {
  kpis: {
    employees: number;
    averageCoverage: number;
    employeesWithHigh: number;
    overdueAssignments: number;
    completionRate: number;
    pendingRecommendations: number;
  };
  domains: { categoryId: string; name: string; sortOrder: number; averageRequired: number; averageCurrent: number }[];
  atRisk: { employeeId: string; name: string; departmentName?: string; highCount: number; coveragePercent: number }[];
}
```

### 5.2. Cách BE2 tính hiện tại

| Trường | Giá trị trả về |
|---|---|
| `kpis.employees` | Số nhân viên ACTIVE của tổ chức (không phụ thuộc đã tính skill gap hay chưa) |
| `kpis.employeesWithHigh` | Số nhân viên có ít nhất một khoảng trống HIGH |
| `kpis.overdueAssignments` | Phân công ACTIVE quá hạn, chưa có enrollment COMPLETED |
| `kpis.completionRate` | % phân công ACTIVE đã có enrollment COMPLETED, 1 chữ số thập phân |
| `domains[]` | Danh sách miền năng lực, sắp theo `sortOrder` |
| `atRisk[]` | Tối đa 10 nhân viên có khoảng trống HIGH, nhiều nhất ở đầu |

### 5.3. Giới hạn hiện có của bản BE2

| Trường | Hiện trạng | Ảnh hưởng tới OW-01 |
|---|---|---|
| `kpis.averageCoverage` | Luôn `0` | Thẻ "Tỷ lệ đáp ứng năng lực" luôn `0.0%`, màu đỏ |
| `domains[].averageRequired`, `averageCurrent` | Luôn `0` | Radar đủ 6 trục nhưng không có hình |
| `atRisk[].coveragePercent` | Luôn `0` | Dòng "đáp ứng 0.0%" ở "Nhân sự cần chú ý" |
| `kpis.pendingRecommendations` | Luôn `0` | Không dùng trên OW-01 |
| `kpis.employeesWithHigh`, `atRisk[].highCount` | Đếm trên **mọi** lần tính skill gap, không chỉ lần mới nhất | Tính lại skill gap nhiều lần sẽ làm số tăng dần |
| `domains[]` | Lấy miền năng lực của mọi tổ chức, không lọc theo tổ chức của người gọi | Môi trường có nhiều tổ chức sẽ thấy trục trùng |

Shape không đổi, nên khi BE2 sửa các giới hạn trên, frontend không cần chỉnh gì.

---

## 6. Khác biệt so với mock và việc nên sửa ở frontend

| # | Điểm khác | Mock | Backend | Nên làm ở frontend |
|---|---|---|---|---|
| 1 | `recentActivity[].actorName` | Luôn có | Có thể `null` (hành động của hệ thống) | Hiển thị fallback, VD `entry.actorName ?? 'Hệ thống'`; sửa kiểu `MemberHistoryEntry.actorName` thành `string \| null` |
| 2 | `recentActivity[].targetLabel` | Luôn là tên dễ đọc | Log cũ không có nhãn trả tên kỹ thuật, VD `employee_competency_profiles` | Chấp nhận được; có thể map `targetType` sang tên tiếng Việt |
| 3 | `recentActivity[].detail` | Có thể có | Không trả | Không dùng trên OW-01 |
| 4 | `plan.status` | `active` / `expired` / `payment_required` | `ACTIVE` / `EXPIRED` / `PAYMENT_REQUIRED` / `CANCELLED` | OW-01 không dùng. Nếu so sánh ở nơi khác, chuẩn hóa `toLowerCase()` |
| 5 | `plan.code` | Không có | Có | Bỏ qua hoặc thêm `code?: string` vào kiểu |
| 6 | `gradeDistribution` | Có | Chưa trả | OW-01 không hiển thị; giữ optional |
| 7 | Radar | Có số liệu | Đủ trục, giá trị 0 (mục 5.3) | Nên hiện empty state khi mọi `averageRequired` bằng 0, thay vì vẽ radar rỗng |

---

## 7. Xử lý lỗi

Mọi response đều có dạng `ApiResponse<T>`:

```json
{ "success": false, "message": "You do not have permission to do this.", "data": null, "errors": [] }
```

| HTTP | Khi nào | Frontend xử lý |
|---|---|---|
| 200 | Thành công | Dùng `response.data.data` (hook hiện tại đã làm vậy) |
| 401 | Chưa đăng nhập, token hết hạn, hoặc tài khoản bị khóa | `apiClient` thử refresh một lần; nếu refresh thất bại thì xóa phiên và chuyển về trang đăng nhập |
| 403 | Thiếu quyền (xem mục 2.3) | Overview lỗi thì trang hiện "Không tải được thông tin bảng điều khiển tổ chức."; dashboard lỗi thì các thẻ năng lực hiện `—` |
| 404 | Không tìm thấy tổ chức của người gọi (dữ liệu hỏng) | Trang hiện thông báo lỗi |

---

## 8. Kiểm tra nhanh sau khi tích hợp

- [ ] Đăng nhập `owner@digitalent.ai`, vào `/enterprise/dashboard`: đủ 6 thẻ KPI, thẻ "Gói dịch vụ" hiện "Gói Doanh nghiệp", gia hạn sau 1 năm.
- [ ] "Người dùng đã kích hoạt" hiện `x / 50 người dùng`.
- [ ] "Đợt đào tạo đang chạy" = 1 (đợt demo `BATCH-Q4-2026` trong seed).
- [ ] "Mức sẵn sàng thiết lập tổ chức": 4/4 hoàn thành.
- [ ] Gọi `calculate-batch` (mục 2.4), tải lại: "Nhân sự cần chú ý" có dữ liệu. Thẻ "Tỷ lệ đáp ứng" và radar vẫn bằng 0 (giới hạn của BE2, mục 5.3).
- [ ] Đăng nhập `manager@digitalent.ai`: không vào được OW-01 (trang chỉ cho `OWNER`).

---

## 9. Dữ liệu dùng chung với module BE2

Sau khi ghép với `develop`, trang Tổng quan và các màn của BE2 dùng **cùng bảng**:

| Bảng | Màn BE2 ghi dữ liệu | OW-01 đọc |
|---|---|---|
| `subscriptions` | Gói dịch vụ (`/subscription`) | Thẻ "Gói dịch vụ", "Người dùng đã kích hoạt" |
| `training_batches` | Đợt đào tạo (`/training-batches`) | Thẻ "Đợt đào tạo đang chạy" (đợt `ACTIVE`) |

Tạo hoặc kích hoạt một đợt ở màn Đợt đào tạo sẽ làm số trên OW-01 thay đổi theo, không cần đồng bộ thêm.
