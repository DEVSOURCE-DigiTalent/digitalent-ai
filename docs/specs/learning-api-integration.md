# Learning Flow — API Integration Guide (FE)

> Tài liệu dành cho FE (Quang) tích hợp luồng học tập.
> Cập nhật: 2026-10-10

Base URL: `/api/v1/learning`
Auth: JWT Bearer token (tất cả endpoint cần đăng nhập)

---

## Tổng quan hệ thống

### 18 khóa học = 6 năng lực × 3 cấp độ

| Lĩnh vực | Cơ bản (F) | Trung cấp (I) | Nâng cao (A) |
|-----------|-----------|---------------|-------------|
| M1 — Tìm kiếm & lưu trữ thông tin | M1-F | M1-I | M1-A |
| M2 — Giao tiếp & hợp tác | M2-F | M2-I | M2-A |
| M3 — Sáng tạo nội dung số | M3-F | M3-I | M3-A |
| M4 — An toàn & bảo mật | M4-F | M4-I | M4-A |
| M5 — Giải quyết vấn đề | M5-F | M5-I | M5-A |
| M6 — Phát triển nghề nghiệp | M6-F | M6-I | M6-A |

Tiên quyết: F → I → A trong cùng lĩnh vực. Phải PASSED khóa F mới được ghi danh khóa I.

### Cấu trúc mỗi khóa

Mỗi khóa gồm N chương thường (3–6 tùy lĩnh vực) + 1 chương FINAL:

**Chương thường** (mỗi chương có 4 bài):
- Bài 1: Mục tiêu và khái niệm (TEXT)
- Bài 2: Nội dung lý thuyết (TEXT)
- Bài 3: Bài thực hành (TEXT)
- Bài 4: Trắc nghiệm tự kiểm tra (QUIZ) — 5 câu, chấm tự động, chỉ để tự kiểm tra

**Chương FINAL**:
- Bài đánh giá cuối khóa (ASSIGNMENT) — Manager chấm thủ công

### Dữ liệu đã seed (production)

| Bảng | Số lượng | Giải thích |
|------|---------|-----------|
| course_modules | 90 | 6 lĩnh vực × số chương khác nhau (3–6) + FINAL, tổng = 90 |
| lessons | 306 | 72 chương thường × 4 bài + 18 FINAL × 1 bài = 306 |
| questions | 360 | 72 quiz × 5 câu = 360 (FINAL không có câu hỏi) |
| question_options | 1,440 | 360 câu × 4 đáp án |
| assessments | 90 | 72 QUIZ + 18 FINAL = 90 |

Nội dung câu hỏi là **dữ liệu thật** từ 6 file giáo trình TT02/2025, không phải placeholder.

---

## Luồng học tập (Giai đoạn I)

```
Staff xem catalog → Ghi danh khóa cơ bản
→ Đọc bài TEXT từng chương → Làm quiz tự kiểm tra (không bắt buộc)
→ Hoàn thành tất cả chương → Nộp bài cuối khóa (assignment)
→ Manager đánh giá (+ AI gợi ý — chưa làm)
→ PASSED → Cấp chứng chỉ + nâng năng lực + mở cấp tiếp theo
→ FAILED → Quay lại ôn tập, nộp lại (tối đa 2 lần — chưa làm)
```

### Trạng thái Enrollment

```
NOT_STARTED → IN_PROGRESS → READY_FOR_ASSESSMENT → COMPLETED
                    ↑              ↓ (FAILED)
                    └──────────────┘
```

> **Chưa làm:** trạng thái `NEEDS_SUPPORT` (khi hết lượt nộp lại), giới hạn 2 lần nộp lại.

---

## API Endpoints (10 endpoint — đã hoàn thành)

### 1. Danh sách khóa học (Catalog)

```
GET /api/v1/learning/courses
```

Permission: `course.read_catalog` (EMPLOYEE, TRAINER, HR, MANAGER, ADMIN)

**Response:**
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "courseId": "uuid",
        "code": "M1-F",
        "title": "TÌM KIẾM VÀ LƯU TRỮ THÔNG TIN CƠ BẢN",
        "description": "...",
        "entryLevel": 1,
        "estimatedDurationMinutes": 360,
        "status": "PUBLISHED",
        "isEnrolled": false,
        "prerequisitesMet": true
      }
    ]
  }
}
```

**Lưu ý FE:**
- `prerequisitesMet = false` → disable nút Ghi danh, hiện tooltip "Cần hoàn thành khóa tiên quyết trước"
- `isEnrolled = true` → đổi nút thành "Tiếp tục học"

---

### 2. Ghi danh khóa học

```
POST /api/v1/learning/courses/{courseId}/enroll
```

Permission: `enrollment.self_enroll` (EMPLOYEE)

**Response (201):**
```json
{
  "success": true,
  "message": "Enrolled successfully.",
  "data": {
    "enrollmentId": "uuid",
    "courseId": "uuid",
    "courseTitle": "TÌM KIẾM VÀ LƯU TRỮ THÔNG TIN CƠ BẢN",
    "status": "NOT_STARTED"
  }
}
```

**Lỗi:**
| HTTP | errors[].message | Ý nghĩa |
|------|-----------------|----------|
| 400 | `PREREQUISITES_NOT_MET` | Chưa hoàn thành khóa tiên quyết |
| 409 | (conflict) | Đã ghi danh rồi |

---

### 3. Danh sách khóa đang học

```
GET /api/v1/learning/my-enrollments
```

Permission: `learning_progress.read` (EMPLOYEE)

**Response:**
```json
{
  "success": true,
  "data": {
    "enrollments": [
      {
        "enrollmentId": "uuid",
        "courseId": "uuid",
        "courseCode": "M1-F",
        "courseTitle": "...",
        "status": "IN_PROGRESS",
        "progressPercent": 45.5,
        "startedAt": "2026-10-10T...",
        "completedAt": null,
        "dueDate": null
      }
    ]
  }
}
```

---

### 4. Cấu trúc khóa học (Modules + Lessons + Assessments)

```
GET /api/v1/learning/courses/{courseId}/structure
```

Permission: `course.read_catalog`

**Response:**
```json
{
  "success": true,
  "data": {
    "courseId": "uuid",
    "courseTitle": "...",
    "courseCode": "M1-F",
    "status": "PUBLISHED",
    "enrollmentId": "uuid | null",
    "enrollmentStatus": "IN_PROGRESS | null",
    "courseProgressPercent": 33.3,
    "modules": [
      {
        "moduleId": "uuid",
        "title": "Chương 1: Tìm kiếm thông tin bằng từ khóa",
        "sortOrder": 1,
        "lessons": [
          {
            "lessonId": "uuid",
            "title": "Mục tiêu và khái niệm",
            "lessonType": "TEXT",
            "sortOrder": 1,
            "estimatedMinutes": 10,
            "progressStatus": "COMPLETED",
            "progressPercent": 100
          },
          {
            "lessonId": "uuid",
            "title": "Nội dung lý thuyết",
            "lessonType": "TEXT",
            "sortOrder": 2,
            "estimatedMinutes": 15,
            "progressStatus": "NOT_STARTED",
            "progressPercent": 0
          },
          {
            "lessonId": "uuid",
            "title": "Bài thực hành",
            "lessonType": "TEXT",
            "sortOrder": 3,
            "estimatedMinutes": 15,
            "progressStatus": "NOT_STARTED",
            "progressPercent": 0
          },
          {
            "lessonId": "uuid",
            "title": "Trắc nghiệm tự kiểm tra",
            "lessonType": "QUIZ",
            "sortOrder": 4,
            "estimatedMinutes": 10,
            "progressStatus": "NOT_STARTED",
            "progressPercent": 0
          }
        ]
      }
    ],
    "assessments": [
      {
        "assessmentId": "uuid",
        "title": "Quiz chương 1: Tìm kiếm thông tin bằng từ khóa",
        "assessmentType": "QUIZ",
        "isFinal": false,
        "passingScore": 60,
        "timeLimitMinutes": null,
        "maxAttempts": null,
        "attemptsUsed": 0,
        "bestScore": null,
        "passed": null
      },
      {
        "assessmentId": "uuid",
        "title": "Đánh giá cuối khóa — ...",
        "assessmentType": "FINAL",
        "isFinal": true,
        "passingScore": 70,
        "timeLimitMinutes": null,
        "maxAttempts": 1,
        "attemptsUsed": 0,
        "bestScore": null,
        "passed": null
      }
    ]
  }
}
```

**Lưu ý FE:**
- `enrollmentId = null` → chưa ghi danh, chỉ xem cấu trúc
- `lessonType = "TEXT"` → render HTML content
- `lessonType = "QUIZ"` → nút "Làm bài" gọi Start Quiz (endpoint 6)
- `lessonType = "ASSIGNMENT"` → nút "Nộp bài" gọi Submit For Evaluation (endpoint 8)

---

### 5. Hoàn thành bài học TEXT

```
POST /api/v1/learning/lessons/{lessonId}/complete
```

Permission: `lesson.complete` (EMPLOYEE)

**Response:**
```json
{
  "success": true,
  "message": "Lesson completed.",
  "data": {
    "lessonProgressId": "uuid",
    "status": "COMPLETED",
    "progressPercent": 100,
    "courseProgressPercent": 25.0
  }
}
```

**Lưu ý FE:**
- Gọi khi user bấm "Hoàn thành bài học" ở cuối bài TEXT
- `courseProgressPercent` dùng cập nhật progress bar tổng khóa

---

### 6. Bắt đầu Quiz (tự kiểm tra)

```
POST /api/v1/learning/assessments/{assessmentId}/start
```

Permission: `attempt.start` (EMPLOYEE)

**Response:**
```json
{
  "success": true,
  "message": "Quiz started.",
  "data": {
    "attemptId": "uuid",
    "attemptNo": 1,
    "timeLimitMinutes": null,
    "questions": [
      {
        "questionId": "uuid",
        "content": "Công cụ tìm kiếm hoạt động bằng cách nào?",
        "questionType": "MULTIPLE_CHOICE",
        "sortOrder": 1,
        "points": 20,
        "options": [
          { "optionId": "uuid", "content": "Quét toàn bộ Internet ngay lúc bạn gõ", "sortOrder": 1 },
          { "optionId": "uuid", "content": "Tìm trong mục lục đã được xây dựng từ trước", "sortOrder": 2 },
          { "optionId": "uuid", "content": "Hỏi trực tiếp các trang web", "sortOrder": 3 },
          { "optionId": "uuid", "content": "Chỉ tìm trong các trang đã được xác minh", "sortOrder": 4 }
        ]
      }
    ]
  }
}
```

**Lưu ý FE:**
- `options` KHÔNG có `isCorrect` — chỉ hiện sau khi submit
- `timeLimitMinutes = null` → không giới hạn thời gian
- Quiz chỉ để TỰ KIỂM TRA, không ảnh hưởng enrollment status
- Làm lại bao nhiêu lần cũng được

---

### 7. Nộp bài Quiz

```
POST /api/v1/learning/attempts/{attemptId}/submit
```

Permission: `attempt.submit` (EMPLOYEE)

**Request body:**
```json
{
  "answers": [
    { "questionId": "uuid", "selectedOptionId": "uuid" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Quiz submitted and graded.",
  "data": {
    "attemptId": "uuid",
    "score": 80,
    "passingScore": 60,
    "passed": true,
    "results": [
      {
        "questionId": "uuid",
        "isCorrect": true,
        "pointsAwarded": 20,
        "correctOptionId": "uuid"
      },
      {
        "questionId": "uuid",
        "isCorrect": false,
        "pointsAwarded": 0,
        "correctOptionId": "uuid"
      }
    ],
    "certificateCode": null,
    "courseCompleted": false
  }
}
```

**Lưu ý FE:**
- Hiện kết quả: đúng/sai từng câu, điểm tổng
- `correctOptionId` → highlight đáp án đúng cho câu sai
- Quiz KHÔNG thay đổi enrollment status
- Nút "Làm lại" → gọi Start Quiz tạo attempt mới

---

### 8. Nộp bài cuối khóa (Staff → Manager)

```
POST /api/v1/learning/enrollments/{enrollmentId}/submit
```

Permission: `task.submit` (EMPLOYEE)

**Response:**
```json
{
  "success": true,
  "message": "Submitted for manager evaluation.",
  "data": {
    "enrollmentId": "uuid",
    "status": "READY_FOR_ASSESSMENT"
  }
}
```

**Lưu ý FE:**
- Chỉ gọi khi enrollment đang `IN_PROGRESS`
- Sau khi submit → UI hiện "Đang chờ Manager đánh giá"
- Disable các nút học/nộp bài

---

### 9. Danh sách chờ đánh giá (Manager view)

```
GET /api/v1/learning/pending-evaluations
```

Permission: `task.evaluate` (DEPARTMENT_MANAGER, ADMIN)

**Response:**
```json
{
  "success": true,
  "data": {
    "enrollments": [
      {
        "enrollmentId": "uuid",
        "employeeId": "uuid",
        "employeeName": "Nguyễn Văn A",
        "courseId": "uuid",
        "courseCode": "M1-F",
        "courseTitle": "TÌM KIẾM VÀ LƯU TRỮ THÔNG TIN CƠ BẢN",
        "bestQuizScore": 80,
        "submittedAt": "2026-10-10T..."
      }
    ]
  }
}
```

**Lưu ý FE:**
- DEPARTMENT_MANAGER chỉ thấy nhân viên trong phòng ban mình
- SYSTEM_ADMIN thấy toàn bộ tổ chức

---

### 10. Manager đánh giá

```
POST /api/v1/learning/enrollments/{enrollmentId}/evaluate
```

Permission: `task.evaluate` (DEPARTMENT_MANAGER, ADMIN)

**Request body:**
```json
{
  "verdict": "PASSED",
  "feedback": "Bài làm tốt, đáp ứng yêu cầu."
}
```

`verdict`: `"PASSED"` hoặc `"FAILED"`

**Response (PASSED):**
```json
{
  "success": true,
  "message": "Enrollment evaluated.",
  "data": {
    "enrollmentId": "uuid",
    "enrollmentStatus": "COMPLETED",
    "verdict": "PASSED",
    "certificateCode": "CERT-2026-XXXX",
    "competencyUpdates": [
      {
        "competencyId": "uuid",
        "competencyName": "Duyệt, tìm kiếm và lọc dữ liệu",
        "previousLevel": 0,
        "newLevel": 2
      }
    ]
  }
}
```

**Response (FAILED):**
```json
{
  "success": true,
  "data": {
    "enrollmentId": "uuid",
    "enrollmentStatus": "IN_PROGRESS",
    "verdict": "FAILED",
    "certificateCode": null,
    "competencyUpdates": []
  }
}
```

**Lưu ý FE:**
- PASSED → hiện certificate code, danh sách năng lực được nâng cấp
- FAILED → enrollment quay về IN_PROGRESS, staff có thể nộp lại
- `feedback` hiển thị cho staff trong chi tiết enrollment

---

## Tài khoản test

| Email | Password | Role | Ghi chú |
|-------|----------|------|---------|
| employee@digitalent.ai | Admin@1234 | EMPLOYEE (Staff) | Vị trí ACCOUNTANT, dùng để test luồng học |
| manager@digitalent.ai | Admin@1234 | DEPARTMENT_MANAGER | Trưởng phòng OPS, dùng để đánh giá |
| admin@digitalent.ai | Admin@1234 | SYSTEM_ADMIN | Toàn quyền |

## Luồng test đề xuất

1. Login `employee@` → `GET /courses` → thấy 18 khóa
2. Ghi danh M1-F → `POST /courses/{id}/enroll`
3. Xem cấu trúc → `GET /courses/{id}/structure` → thấy 3 chương + FINAL
4. Đọc bài → `POST /lessons/{id}/complete` cho từng bài TEXT
5. Làm quiz → `POST /assessments/{id}/start` → `POST /attempts/{id}/submit`
6. Nộp bài cuối khóa → `POST /enrollments/{id}/submit`
7. Login `manager@` → `GET /pending-evaluations` → thấy enrollment
8. Đánh giá → `POST /enrollments/{id}/evaluate` với verdict PASSED
9. Kiểm tra certificate được cấp + năng lực được nâng

---

## Tính năng chưa làm (backlog)

Các tính năng dưới đây nằm trong thiết kế luồng vận hành nhưng chưa có API:

### Ưu tiên cao (liên quan luồng học)

| Tính năng | Mô tả | Giai đoạn |
|-----------|-------|-----------|
| **AI phân tích bài** | AI gợi ý điểm + điểm yếu cho Manager khi chấm assignment | I — bước 8 |
| **Giới hạn nộp lại** | Tối đa 2 lần nộp lại assignment, mỗi lần cách vài ngày | I — bước 11 |
| **Trạng thái NEEDS_SUPPORT** | Khi hết lượt nộp, chuyển enrollment sang trạng thái cần hỗ trợ. Manager chọn: cho học lại / kèm cặp / tạm dừng | I — bước 11 |
| **Gói ôn tập khi FAILED** | AI gom điểm yếu thành gói ôn tập gồm vài mục cụ thể, không phải học lại cả khóa | I — bước 11 |

### Ưu tiên trung bình (quản trị doanh nghiệp)

| Tính năng | Mô tả | Giai đoạn |
|-----------|-------|-----------|
| **Admin DN tạo Manager/Staff** | Admin doanh nghiệp tạo phòng ban, tạo Manager, thêm Staff, gán khóa học | I — bước 3–5 |
| **Báo cáo dùng thử** | Số liệu kết quả dùng thử: tỷ lệ đạt, điểm yếu theo năng lực/phòng ban | I — bước 13 |
| **Trần nhà & lộ trình** | Ma trận 6×3, trần DN ≤ trần Digital AI, trần phòng ban ≤ trần DN | II, III |
| **Chốt lộ trình & báo giá** | Chọn khóa trong lộ trình, tính chi phí theo số khóa × số Staff | II |

### Ưu tiên thấp (admin Digital AI, nâng cấp)

| Tính năng | Mô tả | Giai đoạn |
|-----------|-------|-----------|
| **Admin Digital AI dashboard** | Tổng quan DN đang dùng thử/trả phí, tỷ lệ chuyển đổi | A |
| **Quản lý nội dung khóa** | CRUD 18 khóa, câu hỏi, rubric chấm | A |
| **Phiên bản nội dung** | Phát hành bản mới, Staff đang học giữ bản cũ | IV |
| **Chứng chỉ ghi phiên bản** | Khi cần làm mới, chỉ học phần thay đổi | IV |
