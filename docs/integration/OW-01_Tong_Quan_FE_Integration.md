# Hướng dẫn tích hợp frontend: Trang Tổng quan tổ chức (OW-01)

| | |
|---|---|
| **Màn hình** | OW-01 Tổng quan tổ chức, route `/enterprise/dashboard` |
| **Trang React** | `frontend/src/features/organization/pages/OrganizationOverviewPage.tsx` |
| **API backend** | `GET /api/v1/organization/overview`, `GET /api/v1/intelligence/dashboard` |
| **PR backend** | #49 (`feature/DT-overview-dashboard-api`) |
| **Cập nhật** | 2026-10-06 |

Tài liệu này dành cho người làm frontend: cách bật API thật cho trang OW-01, dữ liệu mỗi API trả về, khối nào trên trang dùng trường nào, và những điểm khác so với mock.

---

## 1. Tóm tắt nhanh

- **Không cần sửa code gọi API.** Hai API backend dùng đúng đường dẫn và tên trường mà service frontend đang gọi:

  | Hook | Service | Endpoint |
  |---|---|---|
  | `useOrganizationOverview()` (`hooks/use-organization.ts`) | `organizationService.getOverview()` | `GET /organization/overview` |
  | `useCapabilityDashboard()` (`hooks/use-analytics.ts`) | `analyticsService.getDashboard()` | `GET /intelligence/dashboard` |

- **Chỉ cần:** chạy backend, tắt mock, đăng nhập bằng tài khoản HR hoặc Admin.
- **Nên sửa nhỏ ở frontend** (không bắt buộc), xem mục 6: `actorName` có thể `null`, `plan.status` là chữ HOA, empty state của radar.

---

## 2. Bật API thật

### 2.1. Chạy backend

```bash
cd backend
dotnet run --project src/DigiTalent.Api
```

- Môi trường Development tự chạy migration và seed dữ liệu demo. Swagger ở http://localhost:5000/swagger.
- Cần PostgreSQL theo chuỗi kết nối trong `backend/src/DigiTalent.Api/appsettings.json`.

### 2.2. Cấu hình frontend (`frontend/.env`)

```env
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

- Có thể bỏ trống `VITE_API_BASE_URL`: khi đó `apiClient` dùng `/api/v1` và Vite proxy chuyển `/api` sang `http://localhost:5000` (`vite.config.ts`).
- Đổi `.env` xong phải khởi động lại `npm run dev`.

### 2.3. Tài khoản dùng để test

Mật khẩu chung: `Admin@1234` (seed Development).

| Tài khoản | Vai trò backend | Vai trò frontend (sau `normalizeRoles`) | Gọi 2 API OW-01 |
|---|---|---|---|
| `hr@digitalent.ai` | `HR_MANAGER` | `OWNER` | 200 |
| `admin@digitalent.ai` | `SYSTEM_ADMIN` | `PLATFORM_ADMIN` + `OWNER` | 200 |
| `manager@digitalent.ai` | `DEPARTMENT_MANAGER` | `MANAGER` | 403 |
| `trainer@digitalent.ai`, `employee@digitalent.ai` | `TRAINER`, `EMPLOYEE` | `EMPLOYEE` | 403 |

Cả 2 API yêu cầu quyền `dashboard.hr_company.read`, giống mock frontend.

### 2.4. Chuẩn bị dữ liệu cho phần năng lực

Seed **không tự tính skill gap**, nên lần đầu radar và "Nhân sự cần chú ý" sẽ trống. Để có dữ liệu, đăng nhập bằng HR rồi gọi một lần (Swagger hoặc curl):

```http
POST /api/v1/intelligence/skill-gaps/calculate-batch
Authorization: Bearer <token>
Content-Type: application/json

{}
```

Kết quả mong đợi: `"Skill gap calculated for 2 employee(s)."` Sau đó tải lại trang OW-01.

---

## 3. Khối nào trên trang dùng trường nào

| Khối trên trang | API | Trường | Ghi chú |
|---|---|---|---|
| Banner "Việc thiết lập tổ chức chưa hoàn tất" | overview | `setupCompleted` | Hiện khi `false` |
| Thẻ "Thành viên hoạt động" | overview | `members.active`, `members.inactive`, `members.pending` | |
| Thẻ "Người dùng đã kích hoạt" | overview | `seats.used`, `seats.limit` | `limit = null` nghĩa là không giới hạn; trang đã xử lý |
| Thẻ "Tỷ lệ đáp ứng năng lực" | dashboard | `kpis.averageCoverage` | Đơn vị %, đã làm tròn 2 chữ số |
| Thẻ "Đợt đào tạo đang chạy" | overview | `runningBatches` | |
| Thẻ "Minh chứng chờ duyệt" | overview | `pendingReviews` | Nhiệm vụ thực tế đã nộp, chưa được đánh giá |
| Thẻ "Gói dịch vụ" | overview | `plan.name`, `plan.renewsAt` | `plan = null` khi chưa có gói; trang hiện `—` |
| Khối "Cơ cấu nhân sự theo tổ chức" | overview | `members.active`, `members.pending`, `seats.limit` | |
| Radar "Năng lực số theo 6 miền TT02" | dashboard | `domains[].name`, `averageRequired`, `averageCurrent` | Luôn đủ 6 trục |
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
    status: string;             // backend: 'ACTIVE' | 'EXPIRED' | 'PAYMENT_REQUIRED' (chữ HOA)
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
    "members": { "active": 1, "pending": 3, "inactive": 0 },
    "seats": { "used": 5, "limit": 50 },
    "plan": { "code": "BUSINESS", "name": "Gói Doanh nghiệp", "status": "ACTIVE", "renewsAt": "2027-10-06T04:55:13+00:00" },
    "pendingReviews": 0,
    "runningBatches": 1,
    "setup": [
      { "key": "departments",  "label": "Phòng ban",                    "done": true, "detail": "1 phòng ban", "path": "/enterprise/departments" },
      { "key": "positions",    "label": "Vị trí công việc",             "done": true, "detail": "5 vị trí", "path": "/enterprise/positions" },
      { "key": "requirements", "label": "Yêu cầu năng lực theo vị trí", "done": true, "detail": "5/5 vị trí đã có yêu cầu đang áp dụng", "path": "/enterprise/positions/requirements" },
      { "key": "members",      "label": "Thành viên",                   "done": true, "detail": "1 đang hoạt động, 3 chờ kích hoạt", "path": "/enterprise/members" }
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
| `seats.limit` | Hạn mức theo gói; `null` = không giới hạn hoặc chưa có gói |
| `plan` | Gói hiện tại; `null` nếu tổ chức chưa có gói |
| `pendingReviews` | Bài nộp nhiệm vụ thực tế ở trạng thái SUBMITTED / UNDER_REVIEW, chưa có đánh giá |
| `runningBatches` | Số đợt đào tạo đang chạy |
| `setup[]` | Luôn đủ 4 phần tử, thứ tự cố định: `departments`, `positions`, `requirements`, `members` |
| `setupCompleted` | Tổ chức đã hoàn tất wizard `/setup` hay chưa |
| `recentActivity[]` | Tối đa 5 dòng audit log mới nhất, mới nhất ở đầu |

Điều kiện `done` của `setup[]`:

| `key` | `done` khi |
|---|---|
| `departments` | Có ít nhất 1 phòng ban ACTIVE |
| `positions` | Có ít nhất 1 vị trí ACTIVE |
| `requirements` | Mọi vị trí ACTIVE đều có bộ yêu cầu năng lực đang áp dụng |
| `members` | `active + pending > 1` |

---

## 5. `GET /api/v1/intelligence/dashboard`

### 5.1. Kiểu TypeScript

Khớp hoàn toàn `DashboardDto` trong `frontend/src/services/analytics.service.ts`:

```ts
interface DashboardDto {
  kpis: {
    employees: number;              // số nhân viên đã có kết quả skill gap
    averageCoverage: number;        // % đáp ứng trung bình, 2 chữ số thập phân
    employeesWithHigh: number;      // số nhân viên có khoảng trống mức HIGH
    overdueAssignments: number;     // khóa được giao đã quá hạn, chưa hoàn thành
    completionRate: number;         // % khóa được giao đã hoàn thành (số nguyên)
    pendingRecommendations: number; // gợi ý khóa học chờ duyệt
  };
  domains: { categoryId: string; name: string; sortOrder: number; averageRequired: number; averageCurrent: number }[];
  atRisk: { employeeId: string; name: string; departmentName?: string; highCount: number; coveragePercent: number }[];
}
```

### 5.2. Response mẫu (sau khi tính skill gap ở mục 2.4)

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "kpis": {
      "employees": 2,
      "averageCoverage": 31.02,
      "employeesWithHigh": 2,
      "overdueAssignments": 0,
      "completionRate": 0,
      "pendingRecommendations": 6
    },
    "domains": [
      { "categoryId": "0b0808fc-…", "name": "1. Khai thác dữ liệu và thông tin", "sortOrder": 1, "averageRequired": 2.5, "averageCurrent": 0.5 },
      { "categoryId": "615597d6-…", "name": "2. Giao tiếp và hợp tác trong môi trường số", "sortOrder": 2, "averageRequired": 2.36, "averageCurrent": 0.55 },
      { "categoryId": "629e8a64-…", "name": "3. Sáng tạo nội dung số", "sortOrder": 3, "averageRequired": 1.5, "averageCurrent": 0.5 },
      { "categoryId": "cef7c56d-…", "name": "4. An toàn", "sortOrder": 4, "averageRequired": 2.0, "averageCurrent": 0.5 },
      { "categoryId": "3c25ace2-…", "name": "5. Giải quyết vấn đề", "sortOrder": 5, "averageRequired": 1.5, "averageCurrent": 0.5 },
      { "categoryId": "78e5dff7-…", "name": "6. Ứng dụng trí tuệ nhân tạo", "sortOrder": 6, "averageRequired": 1.67, "averageCurrent": 0.5 }
    ],
    "atRisk": [
      { "employeeId": "ed047fae-…", "name": "Department Manager", "departmentName": "Operations", "highCount": 15, "coveragePercent": 0 },
      { "employeeId": "23fd8356-…", "name": "Employee", "departmentName": "Operations", "highCount": 4, "coveragePercent": 62.03 }
    ]
  },
  "errors": []
}
```

### 5.3. Quy tắc tính cần biết khi hiển thị

- Mọi số liệu dựa trên **kết quả skill gap mới nhất** của mỗi nhân viên đang làm việc. Nhân viên chưa được tính skill gap thì không nằm trong số liệu.
- `domains[]` luôn trả **mọi miền năng lực** của tổ chức, kể cả miền chưa có dữ liệu (giá trị `0`), sắp theo `sortOrder`. Radar vì vậy luôn đủ 6 trục.
- `averageCurrent` **không bao giờ lớn hơn** `averageRequired`: mức hiện tại của từng năng lực được chặn trần ở mức yêu cầu trước khi lấy trung bình.
- `atRisk[]` tối đa 5 người, chỉ gồm người có `highCount > 0`, sắp theo `highCount` giảm dần, rồi `coveragePercent` tăng dần.
- `pendingRecommendations`: tổng số khóa trong top 3 gợi ý của mỗi nhân viên mà chưa ghi danh và chưa được duyệt. API duyệt gợi ý chưa có, nên hiện số này bằng tổng gợi ý chưa ghi danh.

---

## 6. Khác biệt so với mock và việc nên sửa ở frontend

| # | Điểm khác | Mock | Backend | Nên làm ở frontend |
|---|---|---|---|---|
| 1 | `recentActivity[].actorName` | Luôn có | Có thể `null` (hành động của hệ thống) | Hiển thị fallback, VD `entry.actorName ?? 'Hệ thống'`; sửa kiểu `MemberHistoryEntry.actorName` thành `string \| null` |
| 2 | `recentActivity[].targetLabel` | Luôn là tên dễ đọc | Log cũ không có nhãn sẽ trả tên kỹ thuật, VD `employee_competency_profiles` | Chấp nhận được; có thể map `targetType` sang tên tiếng Việt nếu cần |
| 3 | `recentActivity[].detail` | Có thể có | Không trả | Không dùng trên OW-01 |
| 4 | `plan.status` | `active` / `expired` / `payment_required` | `ACTIVE` / `EXPIRED` / `PAYMENT_REQUIRED` | OW-01 không dùng. Nếu so sánh ở nơi khác, so chữ HOA hoặc chuẩn hóa `toLowerCase()` |
| 5 | `plan.code` | Không có | Có | Bỏ qua hoặc thêm `code?: string` vào kiểu |
| 6 | `gradeDistribution` | Có | Chưa trả | OW-01 không hiển thị; giữ optional |
| 7 | Radar khi chưa tính skill gap | Đủ trục, giá trị 0 | Đủ 6 trục, giá trị 0 | Trang chỉ hiện "Chưa có dữ liệu miền năng lực." khi mảng rỗng, nên sẽ vẽ radar toàn 0. Nên đổi điều kiện empty state thành `capData?.kpis.employees === 0` |

---

## 7. Xử lý lỗi

Mọi response đều có dạng `ApiResponse<T>`:

```json
{ "success": false, "message": "You do not have permission to do this.", "data": null, "errors": [] }
```

| HTTP | Khi nào | Frontend xử lý |
|---|---|---|
| 200 | Thành công | Dùng `response.data.data` (hook hiện tại đã làm vậy) |
| 401 | Chưa đăng nhập, token hết hạn, hoặc tài khoản bị khóa | `apiClient` tự xóa token và chuyển về trang đăng nhập |
| 403 | Tài khoản không có quyền `dashboard.hr_company.read` | Overview lỗi thì trang hiện "Không tải được thông tin bảng điều khiển tổ chức."; dashboard lỗi thì các thẻ năng lực hiện `—` |
| 404 | Không tìm thấy tổ chức của người gọi (dữ liệu hỏng) | Trang hiện thông báo lỗi |

---

## 8. Kiểm tra nhanh sau khi tích hợp

- [ ] Đăng nhập `hr@digitalent.ai`, vào `/enterprise/dashboard`: đủ 6 thẻ KPI, thẻ "Gói dịch vụ" hiện "Gói Doanh nghiệp".
- [ ] "Người dùng đã kích hoạt" hiện `x / 50 người dùng`.
- [ ] "Đợt đào tạo đang chạy" = 1 (đợt demo trong seed).
- [ ] Chưa tính skill gap: "Tỷ lệ đáp ứng năng lực" = `0.0%`, "Nhân sự cần chú ý" hiện trạng thái rỗng.
- [ ] Gọi `calculate-batch` (mục 2.4), tải lại: radar có số liệu 6 miền, "Nhân sự cần chú ý" có 2 người.
- [ ] Đăng nhập `manager@digitalent.ai`: không vào được OW-01 hoặc API trả 403, đúng thiết kế.

---

## 9. Lưu ý khi PR #48 đã merge vào `develop`

`develop` (sau PR #48) cũng có một cài đặt `GET /api/v1/intelligence/dashboard` trong `ReportsController`. PR #49 đang ghi rõ xung đột này và sẽ được xử lý trước khi merge. Trong lúc chờ:

- Khi test trên nhánh `feature/DT-overview-dashboard-api`, dữ liệu dashboard là bản mô tả trong tài liệu này.
- Sau khi xử lý xung đột, endpoint và shape `DashboardDto` **giữ nguyên**; nếu có thay đổi sẽ cập nhật lại tài liệu này.
