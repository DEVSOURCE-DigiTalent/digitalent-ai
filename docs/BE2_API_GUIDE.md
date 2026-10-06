# BE2 API Guide — Tài liệu tích hợp cho Frontend

> Base URL: `http://localhost:5000/api/v1`
> Auth: Tất cả API cần header `Authorization: Bearer <accessToken>`
> Lấy token: `POST /api/v1/auth/login` với `{ email, password }`

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

## Phân trang chung

Input query: `?pageIndex=1&pageSize=20&search=abc`
Output:

```json
{
  "items": [...],
  "totalItems": 50,
  "pageIndex": 1,
  "pageSize": 20,
  "totalPages": 3
}
```

---

## 1. KHÓA HỌC (Courses)

### GET /courses — Danh sách khóa học

```
Query: ?pageIndex=1&pageSize=10&search=&status=PUBLISHED
```

Response `data` = PagedList gồm các item:

| Field | Type | Mô tả |
|-------|------|-------|
| id | guid | |
| code | string | Mã khóa học (VD: "M1-A") |
| title | string | Tên khóa học |
| description | string | |
| level | string | F / I / A |
| status | string | DRAFT / PUBLISHED / ARCHIVED |
| durationHours | number | Thời lượng |
| modulesCount | number | Số module |
| prerequisiteIds | guid[] | Khóa tiên quyết |

### GET /courses/:id — Chi tiết khóa học

Response `data` = chi tiết đầy đủ gồm modules, lessons, materials.

---

## 2. PHÂN CÔNG KHÓA HỌC (Course Assignments)

### GET /course-assignments — Danh sách phân công

```
Query: ?pageIndex=1&pageSize=20&search=&status=ACTIVE
       &courseId=&employeeId=&departmentId=&jobPositionId=
       &overdue=true&dueSoon=true
```

Response item:

| Field | Type | Mô tả |
|-------|------|-------|
| id | guid | |
| employeeId | guid | |
| employeeName | string | |
| employeeCode | string | |
| departmentName | string? | |
| positionName | string? | |
| courseId | guid | |
| courseCode | string | |
| courseTitle | string | |
| assignedAt | datetime | |
| assignedByName | string | |
| dueDate | string? | "2025-12-31" |
| status | string | ACTIVE / COMPLETED / CANCELLED |
| progressPercent | number | 0-100 |
| completedAt | datetime? | |
| source | string | MANUAL / SKILL_GAP / DEPARTMENT / POSITION |
| overdue | boolean | |
| dueSoon | boolean | Hạn trong 7 ngày |

### GET /course-assignments/:id — Chi tiết phân công

Response `data` = một `AssignmentRow` (cùng shape với item trong danh sách ở trên).

Trả 404 nếu không tìm thấy hoặc khác tổ chức.

### GET /course-assignments/summary — Thống kê tổng quan

Response `data`:

```json
{
  "total": 120,
  "notStarted": 30,
  "inProgress": 50,
  "readyForAssessment": 10,
  "completed": 25,
  "overdue": 5,
  "dueSoon": 8,
  "completionRate": 20.8,
  "byDepartment": [
    { "departmentId": "...", "name": "OPS", "total": 50, "completed": 10, "overdue": 2, "averageProgress": 45 }
  ]
}
```

### POST /course-assignments — Tạo phân công

```json
{
  "courseId": "guid",
  "dueDate": "2025-12-31",
  "targets": {
    "employeeIds": ["guid1", "guid2"],
    "departmentId": "guid (tùy chọn, giao cả phòng)",
    "jobPositionId": "guid (tùy chọn)",
    "jobGrade": "string (tùy chọn)"
  }
}
```

Response: `{ created: [...], skipped: [{ employeeId, employeeName, reason }] }`

### DELETE /course-assignments/:id — Hủy phân công

```json
{ "reason": "Lý do hủy (tùy chọn)" }
```

---

## 3. BÀI HỌC (Lessons)

### GET /lessons/:id — Chi tiết bài học

### POST /lessons/:id/complete — Hoàn thành bài học

Không cần body. Tự cập nhật tiến trình enrollment.

---

## 4. HỌC TẬP CỦA TÔI (My Learning)

### GET /me/learning — Danh sách khóa đang học

Response `data` = danh sách enrollments + tiến trình của nhân viên hiện tại.

---

## 5. NHIỆM VỤ THỰC HÀNH (Practical Tasks)

### GET /tasks — Danh sách nhiệm vụ (Owner/Manager)

```
Query: ?pageIndex=1&pageSize=10&search=&status=&departmentId=
```

Response item:

| Field | Type | Mô tả |
|-------|------|-------|
| id | guid | TaskTemplate ID |
| title | string | |
| description | string | |
| expectedOutput | string | Yêu cầu đầu ra |
| competencyIds | guid[] | Năng lực liên quan |
| targetLevel | number | Cấp độ yêu cầu |
| departmentId | guid? | |
| departmentName | string? | |
| jobPositionId | guid? | |
| jobPositionName | string? | |
| assignedEmployeesCount | number | |
| assignedByName | string? | Người giao |
| assignedAt | datetime? | |
| dueDate | string? | |
| rubricCriteria | string? | Tiêu chí chấm (JSON) |
| status | string | |
| submissionsCount | number | |
| pendingReviewCount | number | Đang chờ chấm |
| approvedCount | number | Đã duyệt |

### GET /tasks/:id — Chi tiết nhiệm vụ

Response thêm:

| Field | Type | Mô tả |
|-------|------|-------|
| assignedEmployees | array | Danh sách NV được giao `{ id, fullName, employeeCode, workEmail }` |
| submissions | array | Danh sách bài nộp (xem bên dưới) |

Mỗi submission:

```json
{
  "id": "guid",
  "taskId": "guid",
  "employeeId": "guid",
  "employeeName": "string",
  "employeeCode": "string",
  "submittedAt": "datetime",
  "content": "string",
  "fileUrls": ["url1"],
  "linkUrls": ["url1"],
  "status": "PENDING_REVIEW | APPROVED | REVISION_REQUESTED | REJECTED",
  "evaluation": {
    "evaluatedBy": "string",
    "evaluatedAt": "datetime",
    "score": 85.5,
    "feedback": "string",
    "rubricScores": "string (JSON)",
    "decision": "APPROVED | REVISION_REQUESTED | REJECTED"
  }
}
```

### POST /tasks — Tạo nhiệm vụ mới

```json
{
  "title": "Phân tích dữ liệu bán hàng",
  "description": "Mô tả chi tiết...",
  "expectedOutput": "File báo cáo Excel + slide tóm tắt",
  "competencyIds": ["guid1", "guid2"],
  "targetLevel": 3,
  "departmentId": "guid (tùy chọn)",
  "jobPositionId": "guid (tùy chọn)",
  "assignedEmployeeIds": ["guid1", "guid2"],
  "dueDate": "2025-12-31T00:00:00Z",
  "rubricCriteria": "{ \"criteria\": [...] }"
}
```

### POST /tasks/:taskId/submit — Nộp minh chứng (Employee)

```json
{
  "content": "Bài nộp của tôi...",
  "linkUrls": ["https://docs.google.com/..."],
  "fileUrls": ["https://storage.example.com/file1.pdf"]
}
```

> `taskId` trong URL là **TaskTemplate ID** (cùng ID ở danh sách tasks).
> Nếu nộp lại → submission cũ bị supersede, tạo mới.

---

## 6. HÀNG ĐỢI CHẤM ĐIỂM (Review Queue)

### GET /review-queue — Danh sách chờ chấm (Trainer/Admin)

```
Query: ?pageIndex=1&pageSize=10&search=
```

Response item:

| Field | Type | Mô tả |
|-------|------|-------|
| id | guid | Submission ID |
| taskId | guid | |
| taskTitle | string | |
| taskDueDate | string? | |
| targetLevel | number | |
| employeeId | guid | |
| employeeName | string | |
| employeeCode | string? | |
| departmentName | string? | |
| submittedAt | datetime | |
| content | string | |
| linkUrls | string[] | |
| status | string | PENDING_REVIEW |

---

## 7. CHI TIẾT & CHẤM BÀI NỘP (Submissions)

### GET /submissions/:id — Chi tiết bài nộp

Response = submission + thêm context nhiệm vụ:

| Field thêm | Type | Mô tả |
|------------|------|-------|
| taskTitle | string | |
| taskDescription | string | |
| taskExpectedOutput | string | |
| taskDueDate | string? | |
| rubricCriteria | string? | |
| targetLevel | number | |
| departmentName | string? | |

### POST /submissions/:id/evaluate — Chấm điểm bài nộp

```json
{
  "score": 85.5,
  "feedback": "Bài làm tốt, cần bổ sung phần phân tích",
  "rubricScores": "{ \"criteria1\": 8, \"criteria2\": 9 }",
  "decision": "APPROVED"
}
```

`decision` nhận: `"APPROVED"` | `"REVISION_REQUESTED"` | `"REJECTED"`

---

## 8. NHIỆM VỤ CỦA TÔI (My Tasks — Employee view)

### GET /me/tasks — Nhiệm vụ được giao cho tôi

Response:

```json
{
  "items": [
    {
      "id": "guid (= TaskTemplate ID, dùng cho route /tasks/:id)",
      "title": "string",
      "description": "string",
      "expectedOutput": "string",
      "competencyIds": ["guid"],
      "targetLevel": 3,
      "assignedByName": "string",
      "dueDate": "string?",
      "rubricCriteria": "string?",
      "submission": { ... } | null
    }
  ],
  "total": 5
}
```

> `submission` = bài nộp mới nhất (null nếu chưa nộp). Có trường `evaluation` nếu đã chấm.

### GET /me/evidence — Tất cả minh chứng đã nộp

Response:

```json
{
  "items": [
    {
      "id": "guid",
      "taskId": "guid",
      "taskTitle": "string",
      "taskDescription": "string",
      "targetLevel": 3,
      "competencyIds": ["guid"],
      "submittedAt": "datetime",
      "content": "string",
      "linkUrls": ["url"],
      "fileUrls": ["url"],
      "status": "PENDING_REVIEW | APPROVED | ...",
      "evaluation": { ... } | null
    }
  ],
  "total": 10
}
```

---

## 9. NGÂN HÀNG CÂU HỎI (Question Banks)

### GET /question-banks — Danh sách ngân hàng

```
Query: ?pageIndex=1&pageSize=10&search=
```

Response item:

| Field | Type | Mô tả |
|-------|------|-------|
| id | guid | |
| title | string | |
| description | string? | |
| status | string | ACTIVE / ARCHIVED |
| questionCount | number | |
| createdAt | datetime | |

### GET /question-banks/:id — Chi tiết

### POST /question-banks — Tạo mới

```json
{
  "title": "Ngân hàng câu hỏi An toàn thông tin",
  "description": "Mô tả...",
  "ownerTrainerId": "guid (tùy chọn)"
}
```

### PUT /question-banks/:id — Cập nhật

```json
{ "title": "Tên mới", "description": "Mô tả mới" }
```

### DELETE /question-banks/:id — Xóa (archive)

### GET /question-banks/:bankId/questions — Câu hỏi trong bank

```
Query: ?pageIndex=1&pageSize=20&search=
```

### POST /question-banks/:bankId/questions — Tạo câu hỏi

```json
{
  "competencyId": "guid (tùy chọn)",
  "questionType": "SINGLE_CHOICE",
  "difficulty": "EASY | MEDIUM | HARD",
  "content": "Nội dung câu hỏi?",
  "explanation": "Giải thích đáp án...",
  "aiGeneratedFlag": false,
  "options": [
    { "content": "Đáp án A", "isCorrect": true, "sortOrder": 0 },
    { "content": "Đáp án B", "isCorrect": false, "sortOrder": 1 },
    { "content": "Đáp án C", "isCorrect": false, "sortOrder": 2 },
    { "content": "Đáp án D", "isCorrect": false, "sortOrder": 3 }
  ]
}
```

---

## 10. CÂU HỎI (Questions)

### GET /questions/:id — Chi tiết câu hỏi

### PUT /questions/:id — Cập nhật

```json
{
  "competencyId": "guid",
  "content": "Nội dung mới",
  "explanation": "Giải thích mới",
  "options": [...]
}
```

### DELETE /questions/:id — Xóa

### PATCH /questions/:id/status — Đổi trạng thái

```json
{ "status": "ACTIVE" }
```

### POST /questions/:id/approve — Duyệt câu hỏi

```json
{ "comment": "Đã duyệt, OK" }
```

---

## 11. BÀI ĐÁNH GIÁ (Assessments)

### GET /assessments/:id — Lấy bài đánh giá (để làm bài)

Response `data`:

```json
{
  "id": "guid",
  "courseId": "guid",
  "courseCode": "M1-A",
  "courseTitle": "...",
  "timeLimitMinutes": 30,
  "passPercentage": 70.0,
  "questions": [
    {
      "id": "guid",
      "questionText": "Câu hỏi...?",
      "options": ["A", "B", "C", "D"],
      "competencyCode": "TT02-1.1"
    }
  ]
}
```

> **Lưu ý:** `options` chỉ chứa text, KHÔNG có `isCorrect` (tránh gian lận).

### POST /assessments/:id/attempt — Nộp bài đánh giá

```json
{
  "startedAt": "2025-10-01T10:00:00Z",
  "durationSeconds": 1200,
  "answers": {
    "question-guid-1": 0,
    "question-guid-2": 2,
    "question-guid-3": 1
  }
}
```

> `answers` = map `questionId → index đáp án đã chọn` (0-based).

Response `data`:

```json
{
  "attempt": {
    "id": "guid",
    "assessmentId": "guid",
    "courseId": "guid",
    "courseTitle": "...",
    "employeeId": "guid",
    "employeeName": "...",
    "score": 80.0,
    "totalQuestions": 10,
    "correctAnswers": 8,
    "passed": true,
    "startedAt": "datetime",
    "submittedAt": "datetime",
    "durationSeconds": 1200
  },
  "passed": true,
  "score": 80.0,
  "passPercentage": 70.0,
  "correctCount": 8,
  "totalQuestions": 10,
  "certificate": {
    "id": "guid",
    "certificateCode": "CERT-2025-001"
  },
  "questions": [
    {
      "id": "guid",
      "questionText": "...",
      "options": ["A", "B", "C", "D"],
      "correctOptionIndex": 0,
      "explanation": "Vì...",
      "competencyCode": "TT02-1.1",
      "selectedOptionIndex": 0,
      "isCorrect": true
    }
  ]
}
```

> `certificate` = null nếu không đạt. Nếu đạt thì tự cấp chứng chỉ.

### GET /assessments — Lịch sử đánh giá

```
Query: ?pageIndex=1&pageSize=10&employeeId=&courseId=&passed=true&search=
```

---

## 12. CHỨNG CHỈ (Certificates)

### GET /certificates — Danh sách chứng chỉ

```
Query: ?pageIndex=1&pageSize=10&employeeId=&status=&search=
```

Response item:

| Field | Type | Mô tả |
|-------|------|-------|
| id | guid | |
| certificateCode | string | VD: "CERT-2025-001" |
| employeeId | guid | |
| employeeName | string | |
| employeeCode | string? | |
| courseId | guid | |
| courseTitle | string | |
| courseLevel | number | |
| frameworkCompetencyCodes | string[] | ["TT02-1.1", "TT02-1.2"] |
| issueDate | datetime | |
| expiryDate | datetime? | |
| score | number | Điểm đạt được |
| status | string | ACTIVE / REVOKED / EXPIRED |

---

## 13. THÔNG BÁO (Notifications)

### GET /notifications — Danh sách thông báo

```
Query: ?pageIndex=1&pageSize=20
```

Response `data`:

```json
{
  "items": [
    {
      "id": "guid",
      "type": "TASK_ASSIGNED",
      "title": "Nhiệm vụ mới",
      "message": "Bạn được giao nhiệm vụ...",
      "relatedEntityType": "TASK",
      "relatedEntityId": "guid",
      "isRead": false,
      "readAt": null,
      "createdAt": "datetime"
    }
  ],
  "total": 25,
  "unread": 3,
  "pageIndex": 1,
  "pageSize": 20
}
```

### PUT /notifications/:id/read — Đánh dấu đã đọc

Không cần body. Response: `{ success: true }`

### PUT /notifications/read-all — Đánh dấu tất cả đã đọc

Không cần body. Response: `{ markedCount: 3 }`

---

## 14. CÀI ĐẶT TỔ CHỨC (Organization Settings)

### GET /organization — Thông tin tổ chức

Response `data`:

```json
{
  "id": "guid",
  "code": "DIGITALENT",
  "name": "DigiTalent Demo Company",
  "domain": "digitalent.ai",
  "status": "ACTIVE",
  "settings": {
    "key1": "value1",
    "key2": "value2"
  }
}
```

### PUT /organization/settings — Cập nhật cài đặt

```json
{
  "settings": {
    "notification_email": "true",
    "max_attempts": "3"
  }
}
```

### GET /organization/audit-log — Nhật ký hoạt động

```
Query: ?pageIndex=1&pageSize=20&entityType=&action=&search=
```

Response item:

| Field | Type | Mô tả |
|-------|------|-------|
| id | guid | |
| actorUserId | guid? | |
| actorName | string? | |
| action | string | CREATE / UPDATE / DELETE / ... |
| entityType | string | EMPLOYEE / COURSE / ... |
| entityId | string? | |
| oldValues | string? | JSON |
| newValues | string? | JSON |
| createdAt | datetime | |

---

## 15. LÔ ĐÀO TẠO (Training Batches)

### GET /training-batches/summary — Thống kê tổng

Response `data`:

```json
{
  "total": 12,
  "running": 3,
  "scheduled": 2,
  "completed": 5,
  "cancelled": 2,
  "totalParticipants": 85
}
```

> `running` = ACTIVE, `scheduled` = DRAFT

### GET /training-batches — Danh sách lô

```
Query: ?pageIndex=1&pageSize=20&search=&status=&courseId=&departmentId=
```

Response item:

| Field | Type | Mô tả |
|-------|------|-------|
| id | guid | |
| code | string | Mã lô (unique) |
| title | string | |
| courseName | string? | |
| departmentName | string? | |
| startDate | datetime | |
| endDate | datetime? | |
| dueDate | datetime? | |
| status | string | DRAFT / ACTIVE / COMPLETED / CANCELLED |
| totalEmployees | number | |
| completedCount | number | |
| createdAt | datetime | |

### GET /training-batches/:id — Chi tiết lô

Response thêm `employees`:

```json
{
  "employees": [
    {
      "id": "guid (batch-employee ID)",
      "employeeId": "guid",
      "employeeName": "Nguyễn Văn A",
      "employeeCode": "EMP001",
      "departmentName": "OPS",
      "status": "ENROLLED | IN_PROGRESS | COMPLETED | DROPPED",
      "courseAssignmentId": "guid?",
      "progressPercent": 45
    }
  ]
}
```

### POST /training-batches — Tạo lô

```json
{
  "code": "BATCH-2025-001",
  "title": "Đào tạo An toàn thông tin Q4",
  "description": "Mô tả...",
  "courseId": "guid",
  "departmentId": "guid (tùy chọn)",
  "jobPositionId": "guid (tùy chọn)",
  "startDate": "2025-10-01T00:00:00Z",
  "endDate": "2025-12-31T00:00:00Z",
  "dueDate": "2025-12-15T00:00:00Z",
  "employeeIds": ["guid1", "guid2", "guid3"]
}
```

Response: `{ id: "guid", employeesAdded: 3 }`

### PUT /training-batches/:id — Cập nhật

```json
{
  "title": "Tên mới",
  "description": "Mô tả mới",
  "endDate": "2025-12-31T00:00:00Z",
  "dueDate": "2025-12-15T00:00:00Z"
}
```

### POST /training-batches/:id/cancel — Hủy lô

Không cần body.

### POST /training-batches/:id/complete — Hoàn thành lô

Không cần body. Chỉ lô ACTIVE mới complete được.

### POST /training-batches/:id/employees — Thêm nhân viên

```json
{ "employeeIds": ["guid1", "guid2"] }
```

Response: `{ added: 2 }`

### DELETE /training-batches/:id/employees/:employeeId — Xóa nhân viên

---

## 16. GÓI DỊCH VỤ (Subscription)

### GET /subscription — Gói hiện tại

Response `data`:

```json
{
  "planCode": "ENT_PRO",
  "planName": "Pro",
  "status": "active",
  "cycle": "month",
  "seatLimit": 200,
  "seatsUsed": 45,
  "renewsAt": "2025-11-01T00:00:00Z",
  "cancelAtPeriodEnd": false,
  "amountPerPeriod": 1990000,
  "entitlements": ["practical_tasks", "internal_learning", "advanced_analytics", "bulk_import"],
  "invoices": [
    {
      "id": "guid",
      "code": "INV-2025-001",
      "issuedAt": "datetime",
      "description": "Pro plan - October 2025",
      "amount": 1990000,
      "status": "PAID"
    }
  ]
}
```

### GET /subscription/usage — Sử dụng hiện tại

Response `data`:

```json
{
  "planName": "Pro",
  "seats": { "used": 45, "limit": 200 },
  "storage": { "usedMb": 1024, "limitMb": 5120 },
  "members": { "active": 40, "pending": 3, "inactive": 2 },
  "features": [
    { "key": "practical_tasks", "label": "Nhiệm vụ thực hành", "enabled": true },
    { "key": "internal_learning", "label": "Khóa học nội bộ", "enabled": true },
    { "key": "advanced_analytics", "label": "Phân tích nâng cao", "enabled": true },
    { "key": "bulk_import", "label": "Nhập hàng loạt", "enabled": true }
  ]
}
```

### POST /subscription/cancel — Hủy gói (cuối kỳ)

Không cần body. Response: `{ cancelAtPeriodEnd: true }`

### POST /subscription/resume — Tiếp tục gói (bỏ hủy)

Không cần body. Response: `{ cancelAtPeriodEnd: false }`

---

## 17. BÁO CÁO & DASHBOARD (Reports)

### GET /intelligence/dashboard — Dashboard tổng quan

Response `data`:

```json
{
  "kpis": {
    "employees": 120,
    "averageCoverage": 65.5,
    "employeesWithHigh": 8,
    "overdueAssignments": 5,
    "completionRate": 45.2,
    "pendingRecommendations": 12
  },
  "domains": [
    {
      "categoryId": "guid",
      "name": "An toàn thông tin",
      "sortOrder": 1,
      "averageRequired": 3.5,
      "averageCurrent": 2.1
    }
  ],
  "atRisk": [
    {
      "employeeId": "guid",
      "name": "Nguyễn Văn A",
      "departmentName": "OPS",
      "highCount": 5,
      "coveragePercent": 40.0
    }
  ]
}
```

### GET /intelligence/reports/overview — Báo cáo tổng hợp

```
Query: ?departmentId=&jobPositionId=
```

Response `data`:

```json
{
  "workforce": {
    "totalEmployees": 120,
    "activeEmployees": 110,
    "departmentsCount": 5,
    "positionsCount": 15,
    "g1Count": 0,
    "g2Count": 0,
    "g3Count": 0,
    "byDepartment": [
      { "id": "guid", "code": "OPS", "name": "Operations", "employeeCount": 30, "averageCoverage": 0 }
    ]
  },
  "training": {
    "totalAssignments": 200,
    "completedAssignments": 80,
    "inProgressAssignments": 100,
    "completionRate": 40.0,
    "courses": [
      { "id": "guid", "code": "M1-A", "title": "...", "domainName": null, "learnerCount": 25, "averageProgress": 55.3 }
    ]
  },
  "assessment": {
    "totalAttempts": 150,
    "passRate": 72.0,
    "averageScore": 75.5,
    "retakeCount": 0,
    "excellentCount": 30,
    "excellentPercent": 20.0,
    "standardCount": 78,
    "standardPercent": 52.0,
    "failedCount": 42,
    "failedPercent": 28.0,
    "averageDurationMinutes": 0,
    "firstTimePassRate": 0
  },
  "evidence": {
    "totalTasks": 20,
    "totalSubmissions": 85,
    "approvedCount": 60,
    "approvalRate": 70.6,
    "byDepartment": [
      { "departmentId": "guid", "departmentName": "OPS", "assignedCount": 30, "submittedCount": 25, "approvedCount": 18, "approvalRate": 72.0 }
    ]
  }
}
```

---

## 18. ĐỀ XUẤT ĐÀO TẠO (Recommendation Reviews)

Route: `api/v1/intelligence/recommendation-reviews`

### GET /intelligence/recommendation-reviews — Danh sách đề xuất

```
Query: ?pageIndex=1&pageSize=20&status=&departmentId=&jobPositionId=
```

Response item:

| Field | Type | Mô tả |
|-------|------|-------|
| employeeId | guid | |
| employeeName | string | |
| employeeCode | string? | |
| departmentName | string? | |
| positionName | string? | |
| courseId | guid | |
| courseCode | string | |
| title | string | Tên khóa học |
| score | decimal | Điểm ưu tiên |
| gapsClosed | int | Số gap đóng được |
| mandatoryClosed | int | Gap bắt buộc |
| highClosed | int | Gap mức cao |
| explanation | string? | Giải thích |
| enrollmentStatus | string? | |
| status | string | PENDING / ACCEPTED / DISMISSED |
| decisionReason | string? | Lý do bỏ qua |
| decidedAt | datetime? | |
| decidedByName | string? | |

### POST /intelligence/recommendation-reviews/accept — Chấp nhận đề xuất

Tự tạo `CourseAssignment` (source = RECOMMENDATION) cho nhân viên.

```json
{
  "employeeId": "guid",
  "courseId": "guid",
  "dueDate": "2025-12-31 (tùy chọn)"
}
```

Response: `{ status: "ACCEPTED" }`

> Lỗi 409 nếu nhân viên đã được giao khóa này (ACTIVE).

### POST /intelligence/recommendation-reviews/dismiss — Bỏ qua đề xuất

```json
{
  "employeeId": "guid",
  "courseId": "guid",
  "reason": "Lý do bỏ qua"
}
```

Response: `{ status: "DISMISSED" }`

### POST /intelligence/recommendation-reviews/reopen — Mở lại đề xuất

```json
{
  "employeeId": "guid",
  "courseId": "guid"
}
```

Response: `{ status: "PENDING" }`

---

## 19. KHÓA HỌC NỘI BỘ (Internal Courses)

Route: `api/v1/internal-courses`

> Dùng bảng `courses` có sẵn. `Category` trong DTO map sang field `Purpose` trong DB.

### GET /internal-courses — Danh sách khóa nội bộ

```
Query: ?pageIndex=1&pageSize=20&search=&status=
```

Response item:

| Field | Type | Mô tả |
|-------|------|-------|
| id | guid | |
| code | string | VD: "INT-001" |
| title | string | |
| description | string | |
| category | string | Map từ `Purpose` |
| modulesCount | number | Số module |
| durationMinutes | number | |
| status | string | DRAFT / PUBLISHED / ARCHIVED |
| createdAt | datetime | |
| updatedAt | datetime | |

### GET /internal-courses/:id — Chi tiết khóa nội bộ

Response `data` = `InternalCourseDto` (cùng shape ở trên).

### POST /internal-courses — Tạo khóa nội bộ

```json
{
  "code": "INT-001 (tùy chọn, tự sinh nếu bỏ trống)",
  "title": "Tên khóa học",
  "description": "Mô tả...",
  "category": "Phân loại",
  "durationMinutes": 120,
  "status": "DRAFT (mặc định)"
}
```

> Lỗi 409 nếu `code` đã tồn tại trong tổ chức.

### PUT /internal-courses/:id — Cập nhật khóa nội bộ

```json
{
  "title": "Tên mới",
  "description": "Mô tả mới",
  "category": "Phân loại mới",
  "durationMinutes": 180,
  "status": "PUBLISHED (tùy chọn)"
}
```

---

## Mapping trạng thái Task (FE ↔ BE)

| FE hiển thị | FE gửi lên (decision) | BE TaskAssignment status | BE TaskEvaluation verdict |
|-------------|----------------------|--------------------------|---------------------------|
| Chờ duyệt | — | SUBMITTED | — |
| Đã duyệt | `"APPROVED"` | PASSED | PASSED |
| Yêu cầu sửa | `"REVISION_REQUESTED"` | NEEDS_REVISION | NEEDS_REVISION |
| Từ chối | `"REJECTED"` | FAILED | FAILED |

Khi FE gọi `POST /submissions/:id/evaluate`, gửi `decision` = `"APPROVED"` / `"REVISION_REQUESTED"` / `"REJECTED"`.
BE tự map sang verdict tương ứng.

Khi FE nhận submission status (GET tasks, GET me/tasks...), nhận giá trị đã map: `"PENDING_REVIEW"` / `"APPROVED"` / `"REVISION_REQUESTED"` / `"REJECTED"`.

---

## Lưu ý quan trọng

1. **Tất cả API đều scoped theo organization** — dữ liệu tự lọc theo org của user đang login.
2. **Admin (SYSTEM_ADMIN)** bypass mọi permission check.
3. **Pagination** mặc định `pageIndex=1, pageSize=20`. Max `pageSize=100`.
4. **Date format** trả về ISO 8601: `"2025-10-01T10:00:00+07:00"`.
5. **ID** là UUID (guid), truyền dạng string `"550e8400-e29b-41d4-a716-446655440000"`.
6. **Swagger** có sẵn tại `http://localhost:5000/swagger` khi chạy Development.
