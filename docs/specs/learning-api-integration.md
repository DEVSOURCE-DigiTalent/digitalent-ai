# Learning Flow — API Integration Guide (FE)

Base URL: `/api/v1/learning`
Auth: JWT Bearer token (tất cả endpoint cần đăng nhập)

## Luồng tổng quan

```
Employee xem catalog → Ghi danh (kiểm tra tiên quyết) → Đọc bài TEXT → Làm Quiz tự kiểm tra
→ Hoàn thành các chương → Nộp bài cuối khóa → Manager đánh giá
→ PASSED → Cấp certificate + nâng cấp năng lực
→ FAILED → Quay lại IN_PROGRESS, học và nộp lại
```

### Trạng thái Enrollment

```
NOT_STARTED → IN_PROGRESS → READY_FOR_ASSESSMENT → COMPLETED
                    ↑              ↓ (FAILED)
                    └──────────────┘
```

---

## 1. Danh sách khóa học (Catalog)

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
- Tiên quyết: F → I → A trong cùng lĩnh vực (VD: M1-F → M1-I → M1-A)

---

## 2. Ghi danh khóa học

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

**Lỗi có thể xảy ra:**
| HTTP | errors[].message | Ý nghĩa |
|------|-----------------|----------|
| 400 | `PREREQUISITES_NOT_MET` | Chưa hoàn thành khóa tiên quyết |
| 409 | (conflict) | Đã ghi danh rồi |

---

## 3. Danh sách khóa đang học

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

## 4. Cấu trúc khóa học (Modules + Lessons + Assessments)

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

**Cấu trúc mỗi khóa (18 khóa):**
- N chương thường (3–6 tùy lĩnh vực), mỗi chương:
  - Bài 1: Mục tiêu và khái niệm (TEXT)
  - Bài 2: Nội dung lý thuyết (TEXT)
  - Bài 3: Bài thực hành (TEXT)
  - Bài 4: Trắc nghiệm tự kiểm tra (QUIZ) — 5 câu, chỉ để tự kiểm tra
- 1 chương FINAL:
  - Bài đánh giá cuối khóa (ASSIGNMENT) — Manager chấm

**Lưu ý FE:**
- `enrollmentId = null` → chưa ghi danh, chỉ xem cấu trúc
- `lessonType = "TEXT"` → render HTML từ content_body (GET lesson detail cần thêm API nếu cần)
- `lessonType = "QUIZ"` → nút "Làm bài" gọi Start Quiz
- `lessonType = "ASSIGNMENT"` → nút "Nộp bài" gọi Submit For Evaluation
- `assessmentType = "QUIZ"` → link với lesson QUIZ cùng chương (match bằng code pattern `{course}-CH{n}-QUIZ`)

---

## 5. Hoàn thành bài học TEXT

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
- `courseProgressPercent` cập nhật progress bar tổng khóa
- Gọi lại `GET .../structure` sau khi complete để cập nhật UI, hoặc update local state

---

## 6. Bắt đầu Quiz (tự kiểm tra)

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
- `maxAttempts = null` (ở assessment) → làm lại bao nhiêu lần cũng được
- Quiz chỉ để TỰ KIỂM TRA, không ảnh hưởng enrollment status

---

## 7. Nộp bài Quiz

```
POST /api/v1/learning/attempts/{attemptId}/submit
```

Permission: `attempt.submit` (EMPLOYEE)

**Request body:**
```json
{
  "answers": [
    { "questionId": "uuid", "selectedOptionId": "uuid" },
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
- Hiện kết quả: đúng/sai từng câu, điểm tổng, đạt/không đạt
- `correctOptionId` → highlight đáp án đúng cho câu sai
- Quiz KHÔNG thay đổi enrollment status (chỉ tự kiểm tra)
- Nút "Làm lại" → gọi Start Quiz tạo attempt mới

---

## 8. Nộp bài cuối khóa (Employee → Manager)

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
- Sau khi submit → UI hiện trạng thái "Đang chờ Manager đánh giá"
- Disable các nút học/nộp bài

---

## 9. Danh sách chờ đánh giá (Manager view)

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
- Sắp xếp theo `submittedAt` (cũ nhất trước)

---

## 10. Manager đánh giá

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
- FAILED → enrollment quay về IN_PROGRESS, employee có thể nộp lại
- `feedback` hiển thị cho employee trong chi tiết enrollment

---

## Tài khoản test

| Email | Password | Role | Ghi chú |
|-------|----------|------|---------|
| employee@digitalent.ai | Admin@1234 | EMPLOYEE | Vị trí ACCOUNTANT, dùng để test luồng học |
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
