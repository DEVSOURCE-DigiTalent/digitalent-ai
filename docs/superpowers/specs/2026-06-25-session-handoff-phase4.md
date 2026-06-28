# DigiTalent AI - Session Handoff cho Phase 5 (Learning Management)

## Session vừa hoàn thành (2026-06-25)
**Branch:** feature/DT-001-database-setup  
**Build:** ✅ Success (0 warnings, 0 errors)

### Đã hoàn thành trong Phase 4 (Competency Framework)

| Module | Files | Endpoints |
|--------|-------|-----------|
| **DTOs** | [CompetencyDtos.cs](backend/src/DigiTalent.Application/Competency/DTOs/CompetencyDtos.cs) | 17 DTO classes: categories, competencies, levels, position requirements, employee profiles, evidence |
| **Service** | [CompetencyService.cs](backend/src/DigiTalent.Application/Competency/Services/CompetencyService.cs) | ~570 lines: CRUD categories, competencies, levels; save/replace position requirements; employee profiles + gap analysis; evidence with auto-sync to profile |
| **Controller** | [CompetenciesController.cs](backend/src/DigiTalent.Api/Controllers/V1/CompetenciesController.cs) | 19 endpoints (see below) |

### Files modified
- [IApplicationDbContext.cs](backend/src/DigiTalent.Application/Common/Interfaces/IApplicationDbContext.cs) — added `CompetencyEntity` alias for namespace conflict
- [Program.cs](backend/src/DigiTalent.Api/Program.cs) — registered `CompetencyService`

### Competency Endpoints Summary (19 endpoints)

| Method | Route | Permission |
|--------|-------|-----------|
| `GET` | `api/v1/competency-categories` | `competency_category.read` |
| `GET` | `api/v1/competency-categories/{id}` | `competency_category.read` |
| `POST` | `api/v1/competency-categories` | `competency_category.manage` |
| `PUT` | `api/v1/competency-categories/{id}` | `competency_category.manage` |
| `PATCH` | `api/v1/competency-categories/{id}/status` | `competency_category.manage` |
| `GET` | `api/v1/competencies` | `competency.read` |
| `GET` | `api/v1/competencies/by-category/{id}` | `competency.read` |
| `POST` | `api/v1/competencies` | `competency.manage` |
| `PUT` | `api/v1/competencies/{id}` | `competency.manage` |
| `GET` | `api/v1/competency-levels` | `competency.read` |
| `POST` | `api/v1/competency-levels` | `competency_category.manage` |
| `PUT` | `api/v1/competency-levels/{id}` | `competency_category.manage` |
| `GET` | `api/v1/job-positions/{id}/competency-requirements` | `position_requirement.read` |
| `PUT` | `api/v1/job-positions/{id}/competency-requirements` | `position_requirement.manage` |
| `GET` | `api/v1/employees/{id}/competency-profile` | `employee_competency_profile.read` |
| `PUT` | `api/v1/employees/{id}/competency-profile/{compId}` | `employee_competency_profile.override` |
| `GET` | `api/v1/employees/{id}/competency-evidences` | `evidence.read` |
| `POST` | `api/v1/employees/{id}/competency-evidences` | `evidence.create_manual` |
| `PUT` | `api/v1/competency-evidences/{id}/review` | `evidence.approve_confirm` |

### Domain logic built
- **Evidence → Profile auto-sync**: Khi duyệt APPROVED, tự động tạo/cập nhật `EmployeeCompetencyProfile`
- **Gap analysis**: `EmployeeCompetencyProfileDetailResponse` có `GapLevel` + `IsMet` dựa trên position requirements
- **Save/replace requirements**: Xoá hết cũ → thêm mới
- **Data scope**: Kế thừa pattern từ OrganizationService (chưa implement employee-level scoping)

---

## ✅ Phase 5: Learning Management — Đã hoàn thành (2026-06-25)

**Branch:** feature/DT-001-database-setup  
**Build:** ✅ Success (0 warnings, 0 errors)

### Files created

| File | Lines | Description |
|------|-------|-------------|
| [LearningDtos.cs](backend/src/DigiTalent.Application/Learning/DTOs/LearningDtos.cs) | 265 | 24 DTO classes: Courses, Modules, Lessons, Materials, CourseCompetencies, Assignments, Enrollments, LessonProgress |
| [CourseService.cs](backend/src/DigiTalent.Application/Learning/Services/CourseService.cs) | 514 | CRUD courses, modules, lessons, materials, course competencies |
| [EnrollmentService.cs](backend/src/DigiTalent.Application/Learning/Services/EnrollmentService.cs) | 407 | Assignments (CRUD + cancel), Enrollments (start/my/search), LessonProgress with auto-progress calc |
| [CoursesController.cs](backend/src/DigiTalent.Api/Controllers/V1/CoursesController.cs) | 223 | 23 endpoints (see below) |

### Files modified
- [Program.cs](backend/src/DigiTalent.Api/Program.cs) — registered `CourseService` and `EnrollmentService`

### Learning Endpoints Summary (23 endpoints)

| Method | Route | Permission |
|--------|-------|-----------|
| `GET` | `api/v1/courses` | `course.read_catalog` |
| `POST` | `api/v1/courses` | `course.create` |
| `GET` | `api/v1/courses/{id}` | `course.read_catalog` |
| `PUT` | `api/v1/courses/{id}` | `course.update` |
| `PATCH` | `api/v1/courses/{id}/status` | `course.publish_unpublish` |
| `DELETE` | `api/v1/courses/{id}` | `course.archive` |
| `GET` | `api/v1/courses/{id}/modules` | `course.read_catalog` |
| `GET` | `api/v1/courses/{id}/modules/{moduleId}` | `course.read_catalog` |
| `POST` | `api/v1/courses/{id}/modules` | `course.update` |
| `PUT` | `api/v1/courses/{id}/modules/{moduleId}` | `course.update` |
| `GET` | `api/v1/courses/{id}/modules/{moduleId}/lessons` | `course.read_catalog` |
| `GET` | `api/v1/courses/{id}/modules/{moduleId}/lessons/{lessonId}` | `course.read_catalog` |
| `POST` | `api/v1/courses/{id}/modules/{moduleId}/lessons` | `course.update` |
| `PUT` | `api/v1/courses/{id}/modules/{moduleId}/lessons/{lessonId}` | `course.update` |
| `GET` | `api/v1/courses/{id}/competencies` | `course.read_catalog` |
| `PUT` | `api/v1/courses/{id}/competencies` | `course_competency.manage` |
| `POST` | `api/v1/courses/{id}/materials` | `material.upload` |
| `POST` | `api/v1/course-assignments` | `course_assignment.create` |
| `GET` | `api/v1/course-assignments` | `course_assignment.read` |
| `PATCH` | `api/v1/course-assignments/{id}/cancel` | `course_assignment.cancel` |
| `POST` | `api/v1/enrollments/start` | `course.read_catalog` |
| `GET` | `api/v1/enrollments/my` | `course.read_catalog` |
| `GET` | `api/v1/enrollments` | `learning_progress.read` |
| `GET` | `api/v1/enrollments/{id}` | `learning_progress.read` |
| `PUT` | `api/v1/enrollments/{id}/lessons/{lessonId}/complete` | `lesson.complete` |

### Domain logic built
- **Course CRUD** with DRAFT → PUBLISHED/ACTIVE → ARCHIVED status flow
- **Module/Lesson nesting** — modules and lessons with sort order, lessons scoped to course via module
- **Course Competencies** — save/replace competency mappings for a course
- **Materials** — attach materials to course (with optional lesson association)
- **Assignments** — assign courses to employees/departments/positions, cancellation
- **Self-enrollment** — employees enroll via `enrollments/start`, duplicate check
- **Auto progress calculation** — `CompleteLessonAsync` calculates `ProgressPercentage` based on required lessons completed; auto-completes enrollment at 100%
- **Data scoping** — `enrollments/my` filters by current user's EmployeeId

---

## Phase 6: Assessment & Certificate — Cần implement tiếp theo (future)

### Thứ tự implement (giữ nguyên pattern)

```
DTOs → Service(s) → Controller → Register in Program.cs → Build
```

### 1. Learning DTOs
**File:** `backend/src/DigiTalent.Application/Learning/DTOs/LearningDtos.cs`

Cần tạo Request/Response cho:
- **Courses**: CreateCourseRequest, UpdateCourseRequest, CourseResponse, CourseDetailResponse
- **Modules**: CreateModuleRequest, UpdateModuleRequest, ModuleResponse (lồng trong course)
- **Lessons**: CreateLessonRequest, UpdateLessonRequest, LessonResponse, LessonDetailResponse
- **Materials**: CreateMaterialRequest, MaterialResponse
- **Course Competency mapping**: SaveCourseCompetenciesRequest, CourseCompetencyResponse
- **Assignments**: CreateAssignmentRequest, AssignmentResponse
- **Enrollments**: EnrollmentResponse, EnrollmentDetailResponse (kèm progress)
- **Lesson Progress**: UpdateLessonProgressRequest, LessonProgressResponse
- **Enroll/Start enrollment**: StartEnrollmentRequest

Follow pattern từ [OrganizationDtos.cs](backend/src/DigiTalent.Application/Organization/DTOs/OrganizationDtos.cs) và [CompetencyDtos.cs](backend/src/DigiTalent.Application/Competency/DTOs/CompetencyDtos.cs)

### 2. Services (nên tách 2 files)

#### CourseService
**File:** `backend/src/DigiTalent.Application/Learning/Services/CourseService.cs`

- **Courses**: CRUD + publish/unpublish/archive, search
- **Modules**: CRUD trong course, reorder
- **Lessons**: CRUD trong module, reorder
- **Materials**: CRUD gắn vào course/lesson
- **Course Competencies**: save/replace danh sách competencies cho course

```csharp
// Constructor pattern
private readonly IApplicationDbContext _context;
private readonly ICurrentUserService _currentUser;
public CourseService(IApplicationDbContext context, ICurrentUserService currentUser)
```

#### EnrollmentService
**File:** `backend/src/DigiTalent.Application/Learning/Services/EnrollmentService.cs`

- **Assignments**: tạo assignment (employee/department/position), cancel
- **Enrollments**: start enrollment (tạo từ assignment hoặc manual), get progress
- **Lesson Progress**: mark lesson complete, update progress, auto-calculate course progress %
- **Data scope**: nếu là EMPLOYEE, chỉ xem enrollment của chính mình

### 3. Controller
**File:** `backend/src/DigiTalent.Api/Controllers/V1/CoursesController.cs`

Endpoints cần implement:

| Method | Route | Permission |
|--------|-------|-----------|
| `GET` | `api/v1/courses` | `course.read_catalog` |
| `POST` | `api/v1/courses` | `course.create` |
| `GET` | `api/v1/courses/{id}` | `course.read_catalog` |
| `PUT` | `api/v1/courses/{id}` | `course.update` |
| `PATCH` | `api/v1/courses/{id}/status` | `course.publish_unpublish` |
| `DELETE` | `api/v1/courses/{id}` | `course.archive` |
| `GET` | `api/v1/courses/{id}/modules` | `course.read_catalog` |
| `POST` | `api/v1/courses/{id}/modules` | `course.update` |
| `PUT` | `api/v1/courses/{id}/modules/{moduleId}` | `course.update` |
| `GET` | `api/v1/courses/{id}/modules/{moduleId}/lessons` | `course.read_catalog` |
| `POST` | `api/v1/courses/{id}/modules/{moduleId}/lessons` | `course.update` |
| `PUT` | `api/v1/courses/{id}/modules/{moduleId}/lessons/{lessonId}` | `course.update` |
| `PUT` | `api/v1/courses/{id}/competencies` | `course_competency.manage` |
| `GET` | `api/v1/courses/{id}/competencies` | `course.read_catalog` |
| `POST` | `api/v1/courses/{id}/materials` | `material.upload` |
| `POST` | `api/v1/course-assignments` | `course_assignment.create` |
| `GET` | `api/v1/course-assignments` | `course_assignment.read` |
| `PATCH` | `api/v1/course-assignments/{id}/cancel` | `course_assignment.cancel` |
| `POST` | `api/v1/enrollments/start` | `course.read_catalog` (employee tự enroll) |
| `GET` | `api/v1/enrollments/my` | `course.read_catalog` (employee xem của mình) |
| `GET` | `api/v1/enrollments` | `learning_progress.read` (HR/trainer xem all) |
| `GET` | `api/v1/enrollments/{id}` | `learning_progress.read` |
| `PUT` | `api/v1/enrollments/{id}/lessons/{lessonId}/complete` | `lesson.complete` |

### 4. Register trong Program.cs
```csharp
builder.Services.AddScoped<DigiTalent.Application.Learning.Services.CourseService>();
builder.Services.AddScoped<DigiTalent.Application.Learning.Services.EnrollmentService>();
```

### 5. Lưu ý
- **Competency** namespace conflict đã fix với `CompetencyEntity` alias — nếu Learning entity gặp lỗi tương tự thì dùng alias
- `CourseCompetency` dùng **composite key** (`CourseId`, `CompetencyId`) — khi query cần `.Where(cc => cc.CourseId == id)`
- `Employee.JobPositionId` là `Guid` (non-nullable) — check bằng `!= default` không phải `.HasValue`
- Các configuration đã dùng **column attributes** (`HasColumnName`) với naming convention snake_case
- Seed data cho Learning chưa có — nếu cần thì thêm vào `SeedCompetencyData.cs` hoặc tạo file mới

---

### Cấu trúc Backend hiện tại
```
DigiTalent.Api/
├── Authorization/         ← HasPermissionAttribute, Handler, ScopeService
├── Middlewares/            ← ExceptionHandlingMiddleware
├── Controllers/V1/
│   ├── HealthController
│   ├── AuthController
│   ├── UsersController
│   ├── OrganizationsController
│   └── CompetenciesController        ← [NEW Phase 4]

DigiTalent.Application/
├── Auth/DTOs/ + Services/
├── Users/DTOs/ + Services/
├── Organization/DTOs/ + Services/
├── Competency/DTOs/ + Services/      ← [NEW Phase 4]
│   └── CompetencyDtos.cs + CompetencyService.cs
├── Common/Interfaces/                ← IApplicationDbContext (updated)

DigiTalent.Infrastructure/
├── Auth/                   ← JwtTokenService, CurrentUserService
├── Persistence/
│   ├── Configurations/     ← 50+ EF configs (including Learning)
│   ├── Migrations/
│   └── Seed/               ← seed data for all modules

DigiTalent.Shared/
├── Constants/              ← PermissionConstants, AppConstants
├── ApiResponse/            ← ApiResponse<T>
├── Pagination/             ← PagedList<T>, PaginationRequest
```

### Seed Data Available
- 6 roles, 49+ permissions, 5 users, 1 org, 5 departments, 6 positions, 8 competencies (4 categories), 5 levels

---

## Phase 6: Assessment & Certificate — Implement tiếp theo

### Domain Entities (đã có, cần đọc)

**Assessment entities** — `DigiTalent.Domain.Entities.Assessment`:
- **QuestionBank** — `OrganizationId`, `Title`, `Description`, `OwnerTrainerId`, `Status`
- **Question** — `BankId`, `CompetencyId?`, `QuestionType` ("SINGLE_CHOICE"/"MULTIPLE_CHOICE"/"ESSAY"), `Difficulty`, `Content`, `Explanation`, `AiGeneratedFlag`, `Status` ("DRAFT"/"PUBLISHED"/"ARCHIVED")
- **QuestionOption** — `QuestionId`, `Content`, `IsCorrect`, `SortOrder` (chỉ dùng cho MCQ)
- **Assessment** — `CourseId`, `Title`, `AssessmentType` ("QUIZ"/"FINAL"/"PRACTICAL"), `TimeLimitMinutes?`, `MaxAttempts?`, `PassingScore`, `Status` ("DRAFT"/"PUBLISHED"/"CLOSED")
- **AssessmentQuestion** — `AssessmentId`, `QuestionId`, `ScoreWeight`, `SortOrder` (junction table — composite key AssessmentId + QuestionId)
- **AssessmentAttempt** — `AssessmentId`, `EnrollmentId`, `EmployeeId`, `AttemptNo`, `Status` ("IN_PROGRESS"/"SUBMITTED"/"GRADED"/"CANCELLED"), `StartedAt`, `SubmittedAt?`, `Score?`, `Passed?`
- **AssessmentAnswer** — `AttemptId`, `QuestionId`, `SelectedOptionId?`, `AnswerText?`, `IsCorrect?`, `ScoreAwarded?`, `GradedByUserId?`

**Certificate entities** — `DigiTalent.Domain.Entities.Certificate`:
- **CertificateTemplate** — `OrganizationId`, `Name`, `TemplateHtml`, `BackgroundFileObjectId?`, `Status` ("DRAFT"/"ACTIVE"/"ARCHIVED"), `CreatedByUserId?`
- **Certificate** — `EmployeeId`, `CourseId`, `AssessmentAttemptId?`, `CertificateTemplateId`, `CertificateCode`, `QrUrl`, `Status` ("VALID"/"REVOKED"/"EXPIRED"), `IssuedAt`, `ExpiresAt?`, `RevokedAt?`, `RevokedReason?`, `PdfFileObjectId?`
- **CertificateVerificationLog** — `CertificateId?`, `CertificateCode`, `VerifiedAt`, `ResultStatus`, `VerifierIp?`, `UserAgent?`

### EF Configs đã tồn tại (không cần tạo mới)
Tất cả configs đều có sẵn trong:
- `Configurations/Assessment/QuestionBankConfiguration.cs`
- `Configurations/Assessment/QuestionConfiguration.cs`
- `Configurations/Assessment/QuestionOptionConfiguration.cs`
- `Configurations/Assessment/AssessmentConfiguration.cs`
- `Configurations/Assessment/AssessmentQuestionConfiguration.cs`
- `Configurations/Assessment/AssessmentAttemptConfiguration.cs`
- `Configurations/Assessment/AssessmentAnswerConfiguration.cs`
- `Configurations/Certificate/CertificateTemplateConfiguration.cs`
- `Configurations/Certificate/CertificateConfiguration.cs`
- `Configurations/Certificate/CertificateVerificationLogConfiguration.cs`

### DbSets đã khai báo (không cần thêm)
Tất cả DbSets đã có trong `IApplicationDbContext` và `AppDbContext`.

### Permissions đã defined
- **Assessment & Question Bank (6.10):** `question_bank.read`, `question.create_update`, `question.ai_generate_draft`, `question.approve_publish`, `assessment.read`, `assessment.create_update`, `assessment.publish_close`
- **Assessment Attempt (6.11):** `attempt.start`, `attempt.submit`, `attempt.read_result`, `attempt.regrade_override`, `assessment_result.export`
- **Certificate (6.12):** `certificate_template.manage`, `certificate.issue_auto`, `certificate.issue_manual`, `certificate.read`, `certificate.download_pdf`, `certificate.verify_public`, `certificate.revoke`, `certificate.renew`, `certificate_verification_log.read`

### Thứ tự implement

```
Assessment DTOs → QuestionBankService → AssessmentService → AttemptService → CertificateService → Controllers → Register in Program.cs → Build
```

### 1. Assessment DTOs
**File:** `backend/src/DigiTalent.Application/Assessment/DTOs/AssessmentDtos.cs`

Cần tạo Request/Response cho:

**Question Banks:**
- `CreateQuestionBankRequest` — Title, Description, OwnerTrainerId?
- `UpdateQuestionBankRequest` — Title?, Description?
- `QuestionBankResponse` — Id, Title, Description, Status, QuestionCount, CreatedAt

**Questions:**
- `CreateQuestionRequest` — BankId, CompetencyId?, QuestionType, Difficulty?, Content, Explanation?, AiGeneratedFlag (false), Options list
- `CreateQuestionOptionRequest` — Content, IsCorrect, SortOrder (riêng rẽ hoặc lồng trong Question)
- `UpdateQuestionRequest` — Content?, Explanation?, Difficulty?, Status?
- `QuestionResponse` — Id, BankId, CompetencyId?, QuestionType, Difficulty, Content, Explanation, AiGeneratedFlag, Status, CreatedAt, Options list
- `QuestionDetailResponse : QuestionResponse` — thêm Answers/IsCorrect (ẩn IsCorrect nếu không phải owner), Option[] with isCorrect

**Assessments:**
- `CreateAssessmentRequest` — CourseId, Title, AssessmentType, TimeLimitMinutes?, MaxAttempts?, PassingScore
- `UpdateAssessmentRequest` — Title?, TimeLimitMinutes?, MaxAttempts?, PassingScore?
- `AssessmentResponse` — Id, CourseId, CourseTitle, Title, AssessmentType, TimeLimitMinutes, MaxAttempts, PassingScore, Status, QuestionCount, CreatedAt
- `AssessmentDetailResponse : AssessmentResponse` — Questions list với ScoreWeight, SortOrder

**Assessment Questions (link):**
- `AddAssessmentQuestionRequest` — QuestionId, ScoreWeight, SortOrder
- `SaveAssessmentQuestionsRequest` — List<AddAssessmentQuestionRequest>
- `AssessmentQuestionResponse` — AssessmentId, QuestionId, QuestionContent, QuestionType, ScoreWeight, SortOrder

### 2. Certificate DTOs
**File:** `backend/src/DigiTalent.Application/Certificate/DTOs/CertificateDtos.cs`

- `CreateCertificateTemplateRequest` — Name, TemplateHtml, BackgroundFileObjectId?
- `UpdateCertificateTemplateRequest` — Name?, TemplateHtml?, Status?
- `CertificateTemplateResponse` — Id, Name, Status, CreatedAt
- `CertificateTemplateDetailResponse : CertificateTemplateResponse` — TemplateHtml, BackgroundFileObjectId
- `CertificateResponse` — Id, EmployeeId, EmployeeName, CourseId, CourseTitle, CertificateCode, Status, IssuedAt, ExpiresAt?
- `CertificateDetailResponse : CertificateResponse` — QrUrl, AssessmentAttemptId, PdfFileObjectId, RevokedAt?, RevokedReason?
- `IssueCertificateRequest` — EmployeeId, CourseId, AssessmentAttemptId?, CertificateTemplateId
- `VerifyCertificateRequest` — CertificateCode
- `CertificateVerificationResponse` — IsValid, CertificateCode, EmployeeName, CourseTitle, IssuedAt, ExpiresAt

### 3. Services (nên tách 3 files)

#### QuestionBankService
**File:** `backend/src/DigiTalent.Application/Assessment/Services/QuestionBankService.cs`

- **Question Banks:** CRUD, search (paged)
- **Questions:** CRUD trong bank, publish/unpublish, search theo bank
- **Question Options:** CRUD cùng với question (lồng trong CreateQuestionRequest)
- **AI Generate Draft:** nhận competencyId → tạo câu hỏi draft (placeholder)
- **Import/Export:** tạm thời skip

```csharp
// Constructor pattern (giống CompetencyService)
private readonly IApplicationDbContext _context;
private readonly ICurrentUserService _currentUser;
```

#### AssessmentService
**File:** `backend/src/DigiTalent.Application/Assessment/Services/AssessmentService.cs`

- **Assessments:** CRUD, publish/close, search theo course
- **Assessment Questions:** add/remove questions từ assessment, reorder, save/replace toàn bộ
- **Auto-scoring logic:** sau này cho Attempt

#### AttemptService (riêng vì nhiều logic)
**File:** `backend/src/DigiTalent.Application/Assessment/Services/AttemptService.cs`

- **Start Attempt:** tạo mới `AssessmentAttempt`, kiểm tra maxAttempts, auto-increment AttemptNo
- **Submit Attempt:** tính score tự động cho SINGLE_CHOICE/MULTIPLE_CHOICE (so sánh SelectedOptionId với IsCorrect), cập nhật Attempt.Score và Attempt.Passed
- **Get Attempt Result:** xem lại bài làm, điểm, đáp án đúng
- **Regrade/Override:** cho phép giám khảo sửa điểm
- **Auto-certificate issuance:** khi attempt passed + course completed → tự động tạo Certificate

#### CertificateService
**File:** `backend/src/DigiTalent.Application/Certificate/Services/CertificateService.cs`

- **Templates:** CRUD, activate/archive
- **Issue Certificate:** tạo certificate mới (auto từ attempt hoặc manual)
- **Revoke Certificate:** đổi status + lý do
- **Verify Certificate:** lookup theo code, trả về thông tin
- **Download PDF:** (placeholder — cần PDF generation sau)
- **Verification Log:** ghi log mỗi lần verify

### 4. Controllers

Có thể gộp vào 1 controller hoặc tách:

#### Option A (gộp): AssessmentsController
**File:** `backend/src/DigiTalent.Api/Controllers/V1/AssessmentsController.cs`

Endpoints:

| Method | Route | Permission |
|--------|-------|-----------|
| `GET` | `api/v1/question-banks` | `question_bank.read` |
| `POST` | `api/v1/question-banks` | `question.create_update` |
| `GET` | `api/v1/question-banks/{id}` | `question_bank.read` |
| `PUT` | `api/v1/question-banks/{id}` | `question.create_update` |
| `GET` | `api/v1/question-banks/{id}/questions` | `question_bank.read` |
| `POST` | `api/v1/question-banks/{id}/questions` | `question.create_update` |
| `GET` | `api/v1/questions/{id}` | `question_bank.read` |
| `PUT` | `api/v1/questions/{id}` | `question.create_update` |
| `PATCH` | `api/v1/questions/{id}/status` | `question.approve_publish` |
| `GET` | `api/v1/assessments` | `assessment.read` |
| `POST` | `api/v1/assessments` | `assessment.create_update` |
| `GET` | `api/v1/assessments/{id}` | `assessment.read` |
| `PUT` | `api/v1/assessments/{id}` | `assessment.create_update` |
| `PATCH` | `api/v1/assessments/{id}/status` | `assessment.publish_close` |
| `GET` | `api/v1/assessments/{id}/questions` | `assessment.read` |
| `PUT` | `api/v1/assessments/{id}/questions` | `assessment.create_update` |
| `POST` | `api/v1/assessments/{id}/attempts/start` | `attempt.start` |
| `POST` | `api/v1/assessment-attempts/{id}/submit` | `attempt.submit` |
| `GET` | `api/v1/assessment-attempts/{id}` | `attempt.read_result` |

**OR Option B (tách riêng):**
- `QuestionBanksController.cs` — question bank + question endpoints
- `AssessmentsController.cs` — assessment + attempt endpoints

Khuyên dùng **Option A** (gộp) để giữ pattern giống CompetenciesController và CoursesController. Nếu file quá lớn (>300 dòng) thì tách sau.

#### CertificatesController
**File:** `backend/src/DigiTalent.Api/Controllers/V1/CertificatesController.cs`

| Method | Route | Permission |
|--------|-------|-----------|
| `GET` | `api/v1/certificate-templates` | `certificate_template.manage` |
| `POST` | `api/v1/certificate-templates` | `certificate_template.manage` |
| `PUT` | `api/v1/certificate-templates/{id}` | `certificate_template.manage` |
| `PATCH` | `api/v1/certificate-templates/{id}/status` | `certificate_template.manage` |
| `GET` | `api/v1/certificates` | `certificate.read` |
| `GET` | `api/v1/certificates/{id}` | `certificate.read` |
| `POST` | `api/v1/certificates/issue` | `certificate.issue_manual` |
| `PATCH` | `api/v1/certificates/{id}/revoke` | `certificate.revoke` |
| `POST` | `api/v1/certificates/verify` | `certificate.verify_public` |

### 5. Register trong Program.cs
```csharp
builder.Services.AddScoped<DigiTalent.Application.Assessment.Services.QuestionBankService>();
builder.Services.AddScoped<DigiTalent.Application.Assessment.Services.AssessmentService>();
builder.Services.AddScoped<DigiTalent.Application.Assessment.Services.AttemptService>();
builder.Services.AddScoped<DigiTalent.Application.Certificate.Services.CertificateService>();
```

### 6. Lưu ý quan trọng

1. **Auto-certificate on attempt pass:** Khi `AttemptService.SubmitAttemptAsync` tính ra `Passed == true`, kiểm tra nếu enrollment đã COMPLETED → tự động gọi `CertificateService.IssueCertificateAsync`. Pattern tương tự Evidence → Profile auto-sync ở Competency module.

2. **Scoring logic:**
   - `SINGLE_CHOICE`: So sánh `SelectedOptionId` với option có `IsCorrect == true` → 1 điểm nếu đúng
   - `MULTIPLE_CHOICE`: Tất cả selected option phải match all correct options → điểm theo tỉ lệ (hoặc all-or-nothing)
   - `ESSAY`: `ScoreAwarded = null`, chờ giám khảo chấm (`GradedByUserId`)
   - `ScoreWeight` trong `AssessmentQuestion` quyết định điểm tối đa cho mỗi câu

3. **MaxAttempts check:** Trước khi start attempt, đếm số attempt đã SUBMITTED/GRADED, nếu >= MaxAttempts thì throw `InvalidOperationException`.

4. **AttemptNo auto-increment:** `await _context.Attempts.CountAsync(a => a.AssessmentId == id && a.EmployeeId == employeeId) + 1`

5. **CertificateCode generation:** Dùng format `CERT-{YYYYMMDD}-{GUID ngắn(6 ký tự)}` hoặc `{EmployeeCode}-{CourseCode}-{AttemptNo}`.

6. **Seed data:** Nếu cần, tạo `SeedAssessmentData.cs` + `SeedCertificateData.cs`, đăng ký trong `AppDbContextSeed.cs`.

7. **Cấu trúc folder cho Phase 6:**
```
DigiTalent.Application/
├── Assessment/
│   ├── DTOs/
│   │   └── AssessmentDtos.cs
│   └── Services/
│       ├── QuestionBankService.cs
│       ├── AssessmentService.cs
│       └── AttemptService.cs
├── Certificate/
│   ├── DTOs/
│   │   └── CertificateDtos.cs
│   └── Services/
│       └── CertificateService.cs

DigiTalent.Api/Controllers/V1/
├── AssessmentsController.cs
└── CertificatesController.cs
```

### Cấu trúc Backend hiện tại (đã update với Phase 5 + 6)
```
DigiTalent.Api/
├── Authorization/         ← HasPermissionAttribute, Handler, ScopeService
├── Middlewares/            ← ExceptionHandlingMiddleware
├── Controllers/V1/
│   ├── HealthController
│   ├── AuthController
│   ├── UsersController
│   ├── OrganizationsController
│   ├── CompetenciesController        ← [Phase 4]
│   ├── CoursesController             ← [Phase 5]
│   ├── AssessmentsController         ← [Phase 6 — cần tạo]
│   └── CertificatesController        ← [Phase 6 — cần tạo]

DigiTalent.Application/
├── Auth/DTOs/ + Services/
├── Users/DTOs/ + Services/
├── Organization/DTOs/ + Services/
├── Competency/DTOs/ + Services/      ← [Phase 4]
├── Learning/DTOs/ + Services/        ← [Phase 5]
├── Assessment/DTOs/ + Services/      ← [Phase 6 — cần tạo]
├── Certificate/DTOs/ + Services/     ← [Phase 6 — cần tạo]
├── Common/Interfaces/                ← IApplicationDbContext (updated)

DigiTalent.Infrastructure/
├── Auth/                   ← JwtTokenService, CurrentUserService
├── Persistence/
│   ├── Configurations/     ← 60+ EF configs (all modules)
│   ├── Migrations/
│   └── Seed/               ← seed data for all modules

DigiTalent.Shared/
├── Constants/              ← PermissionConstants, AppConstants
├── ApiResponse/            ← ApiResponse<T>
├── Pagination/             ← PagedList<T>, PaginationRequest
```
