**DigiTalent AI**

**08\. API Specification / OpenAPI Design**

_Digital Competency Training, Internal Certification and Work-Based Assessment Platform_

| **Document Item** | **Value** |
| --- | --- |
| Project | DigiTalent AI |
| Document Type | API Specification / OpenAPI Design |
| Technology Baseline | ReactJS + TypeScript + TailwindCSS + ShadCN/UI; ASP.NET Core/C#; PostgreSQL; MinIO; Redis optional; SignalR; Docker; Nginx; GitHub Actions |
| Backend Style | ASP.NET Core Web API, RESTful API, DTO-based contract, Swagger/OpenAPI |
| API Version | v1  |
| Primary Audience | Backend developers, frontend developers, testers, technical mentor, deployment owner |
| Status | Draft for implementation planning before coding |

**Architecture Decision**

The API is designed for a Modular Monolith backend, not microservices. This gives the capstone team a realistic implementation path while still keeping module boundaries clear enough for enterprise-style development.

# Table of Contents

1\. Purpose and Scope

2\. API Design Baseline and Assumptions

3\. API Consumers, Roles and Permission Model

4\. REST and OpenAPI Design Principles

5\. Common API Conventions

6\. Security and Authentication API Design

7\. Standard Response, Error and Validation Models

8\. Pagination, Filtering, Sorting and Search

9\. File Upload and MinIO Access Pattern

10\. SignalR Realtime API Surface

11\. Endpoint Catalog by Module

12\. DTO and Schema Design Examples

13\. OpenAPI / Swagger Structure

14\. Permission and Data Scope Rules

15\. Versioning, Compatibility and Deprecation

16\. Testing, Acceptance and Implementation Roadmap

17\. Appendix: OpenAPI Starter YAML Summary

# 1\. Purpose and Scope

This document defines the API contract and OpenAPI design direction for DigiTalent AI before implementation begins. It translates the business and software requirements into RESTful endpoints, security rules, request/response conventions, DTO naming guidelines and OpenAPI documentation rules.

The goal is to prevent fragmented backend implementation, inconsistent frontend integration and unclear permission handling. The document should be used together with the Project Overview, BRD, SRS, Use Case Specification, Business Flow, System Architecture and Database Design documents.

## 1.1 In Scope

*   REST API design for all MVP modules: authentication, users, organization, competency, learning, assessment, certificate, WMS-lite task, capability intelligence, dashboard, files, notifications and audit.
*   Common API conventions including endpoint naming, response structure, error handling, pagination, filtering, file upload and authorization rules.
*   OpenAPI/Swagger design rules for ASP.NET Core implementation.
*   DTO examples for critical integration points used by React frontend and backend services.
*   Permission and data-scope notes for role-based and department-scoped access.

## 1.2 Out of Scope

*   Full GraphQL API design.
*   Microservice-to-microservice API contracts.
*   External HRM/SSO integration contracts beyond future placeholders.
*   Full AI knowledge search API and advanced learning assistant API as MVP commitments.
*   Production payment, livestream, video conference or marketplace APIs.

# 2\. API Design Baseline and Assumptions

| **Area** | **Decision** |
| --- | --- |
| API Style | RESTful JSON API with documented DTOs and OpenAPI/Swagger. |
| Base Path | /api/v1 |
| Authentication | JWT Bearer access token and refresh token flow. |
| Authorization | Role-based access control plus data-scope checks for department and ownership. |
| Backend | ASP.NET Core Web API with Controllers or Minimal API grouped by module. Controllers are recommended for clearer capstone documentation. |
| Database | PostgreSQL via EF Core. IDs should use UUID/GUID. |
| File Storage | MinIO stores physical files; API stores file metadata and controls access. |
| Realtime | SignalR notification hub for reminders, task updates and training risk alerts. |
| Swagger | OpenAPI 3.0+, grouped by module tags. |
| Frontend Consumer | ReactJS + TypeScript app using generated or manually typed API client. |

**Implementation Rule**

The backend must not expose database entities directly. Every endpoint should use request DTOs and response DTOs to keep the API contract stable and secure.

# 3\. API Consumers, Roles and Permission Model

## 3.1 API Consumers

*   Enterprise web frontend: main React application for Admin, HR, Manager, Trainer and Employee.
*   Certificate verification page: public or limited-access certificate verification by QR code.
*   Swagger UI: development/testing interface for backend and QA team.
*   Future integrations: HRM, SSO/LDAP, enterprise document management or internal communication tools.

## 3.2 Role Catalog

| **Code** | **Role** | **API Responsibility** |
| --- | --- | --- |
| SYS\_ADMIN | System Admin | Full system configuration, users, roles, permissions, audit logs and master data. |
| HR\_MANAGER | HR / Training Manager | Company-wide employee, training, competency, certificate and dashboard management. |
| DEPT\_MANAGER | Department Manager | Department-scoped employee tracking, task assignment, task evaluation and readiness monitoring. |
| TRAINER | Internal Trainer | Course authoring, lesson material, question bank, assessment management and AI question draft review. |
| EMPLOYEE | Employee | Learning, assessment attempt, certificate viewing, task submission and personal competency profile. |
| CERT\_VERIFIER | Certificate Verifier | Certificate verification by code or QR URL with limited certificate data exposure. |

## 3.3 Permission Model

Authorization must combine role permission and data scope. A user may have a role permission to call an endpoint, but still fail authorization if the requested data is outside their allowed organization boundary.

| **Access Type** | **Meaning** | **Example** |
| --- | --- | --- |
| Role-based permission | Whether the role is allowed to perform an action. | TRAINER can create questions; EMPLOYEE cannot create official questions. |
| Ownership scope | Whether the data belongs to the current user. | Employee can view own certificates and own task assignments. |
| Department scope | Whether the data is within the manager department. | Department Manager can view and evaluate tasks only for employees in managed department. |
| Public verification scope | Only exposes limited certificate verification data. | Verifier can see certificate status and holder name but not employee profile details. |

# 4\. REST and OpenAPI Design Principles

| **Principle** | **Rule for DigiTalent AI** |
| --- | --- |
| Resource-oriented URLs | Use nouns and clear resources such as /courses, /employees, /certificates, /task-assignments. |
| HTTP method semantics | GET for read, POST for create/action, PUT for full replace/update, PATCH for partial status changes, DELETE only for allowed soft delete. |
| Explicit action endpoints when needed | Use action endpoints for domain operations such as /certificates/issue, /certificates/{id}/revoke, /readiness/recalculate. |
| Stable DTO contract | Do not return EF Core entities directly. Use response DTOs. |
| OpenAPI first enough | Before coding a module, define endpoint, permission, request body, response body and error cases. |
| Audit-sensitive operations | Certificate issuance/revoke, task evaluation, competency change and scoring config update must write audit logs. |
| Explainability | Score/recommendation APIs must expose enough reason or explanationId for audit and defense. |
| Scope control | MVP APIs are prioritized; optional AI APIs must not block core learning/certificate/task workflows. |

# 5\. Common API Conventions

## 5.1 Base URL and Versioning

Local development: http://localhost:5000/api/v1

Production placeholder: https://api.digitalent-ai.example.com/api/v1

## 5.2 Naming Conventions

| **Item** | **Convention** | **Example** |
| --- | --- | --- |
| URL path | kebab-case plural resource names | /api/v1/job-positions |
| JSON field | camelCase | employeeId, createdAt, certificateCode |
| DTO class | PascalCase with Request/Response suffix | CreateCourseRequest, CourseDetailResponse |
| Enum value | UPPER\_SNAKE\_CASE | VALID, REVOKED, IN\_PROGRESS |
| ID type | UUID/GUID as string in API | "employeeId": "2dd0..." |
| Date/time | ISO 8601 UTC | 2026-06-19T08:00:00Z |

## 5.3 HTTP Status Code Rules

| **Status** | **Usage** |
| --- | --- |
| 200 OK | Successful read/update/action returning data. |
| 201 Created | Resource created successfully. Include created resource or location. |
| 204 No Content | Successful operation with no response body. |
| 400 Bad Request | Malformed request or invalid business operation. |
| 401 Unauthorized | Missing/invalid/expired access token. |
| 403 Forbidden | Authenticated but lacks permission or data scope. |
| 404 Not Found | Resource not found or hidden due to access policy. |
| 409 Conflict | Duplicate code, optimistic concurrency conflict or invalid state transition. |
| 422 Unprocessable Entity | Validation failed. Can also use 400 consistently if team prefers. |
| 500 Internal Server Error | Unexpected server error with traceId. |

# 6\. Security and Authentication API Design

## 6.1 JWT Authentication Flow

1\. User submits email and password to POST /auth/login.

2\. Backend validates credentials and account status.

3\. Backend returns short-lived access token and refresh token.

4\. Frontend stores token according to selected security strategy. For capstone, secure storage in app state plus refresh handling is acceptable; production should prefer httpOnly secure cookies for refresh token.

5\. Frontend sends Authorization: Bearer <accessToken> for protected APIs.

6\. When access token expires, frontend calls /auth/refresh-token.

7\. Logout revokes refresh token/session and prevents reuse.

## 6.2 Token Claims Recommendation

| **Claim** | **Purpose** |
| --- | --- |
| sub | User ID. |
| email | Authenticated email. |
| roles | Assigned role codes. |
| permissions | Optional permission codes. Can also be loaded server-side. |
| employeeId | Linked employee profile ID when available. |
| departmentIds | Optional scope hint; backend must still verify from database. |
| jti | Token identifier for audit and revocation strategy. |

**Security Warning**

Never trust JWT claims alone for sensitive department-scoped data. The backend should re-check the employee department/manager relationship from the database for Manager-level actions.

# 7\. Standard Response, Error and Validation Models

## 7.1 Success Response Envelope

{

"success": true,

"message": "Course created successfully",

"data": { },

"traceId": "00-...",

"timestamp": "2026-06-19T08:00:00Z"

}

## 7.2 Paged Response

{

"items": \[\],

"pageIndex": 1,

"pageSize": 20,

"totalItems": 145,

"totalPages": 8,

"hasNext": true,

"hasPrevious": false

}

## 7.3 Error Response Model

For ASP.NET Core, the team may use RFC 7807 ProblemDetails for errors. This is production-friendly and integrates well with validation middleware. The response should always include traceId for debugging.

{

"type": "https://httpstatuses.com/400",

"title": "Validation failed",

"status": 400,

"detail": "One or more validation errors occurred.",

"traceId": "00-...",

"errors": {

"email": \["Email is required"\],

"deadlineAt": \["Deadline must be in the future"\]

}

}

## 7.4 Business Error Codes

| **Code** | **When to Use** |
| --- | --- |
| AUTH\_INVALID\_CREDENTIALS | Login failed due to wrong email/password. |
| AUTH\_ACCOUNT\_LOCKED | Account is locked or inactive. |
| RBAC\_PERMISSION\_DENIED | Role does not have permission. |
| SCOPE\_DEPARTMENT\_DENIED | Manager tries to access employee outside managed department. |
| COURSE\_NOT\_PUBLISHED | Employee tries to enroll/start unpublished course. |
| ASSESSMENT\_ATTEMPT\_LIMIT\_EXCEEDED | Attempt count exceeds assessment policy. |
| CERTIFICATE\_NOT\_ELIGIBLE | Certificate cannot be issued because completion rules are not met. |
| CERTIFICATE\_REVOKED | Certificate verification finds revoked status. |
| TASK\_INVALID\_STATE\_TRANSITION | Task cannot move from current status to requested status. |
| SCORING\_CONFIG\_INVALID | Scoring weights/thresholds are invalid. |

# 8\. Pagination, Filtering, Sorting and Search

## 8.1 Standard Query Parameters

| **Parameter** | **Type** | **Default** | **Description** |
| --- | --- | --- | --- |
| pageIndex | integer | 1   | 1-based page index. |
| pageSize | integer | 20  | Max should be limited, for example 100. |
| search | string | null | Keyword search across common fields. |
| sortBy | string | createdAt | Allowed field list per endpoint. |
| sortDirection | asc\|desc | desc | Sort direction. |
| status | enum | null | Filter by status. |
| fromDate / toDate | datetime | null | Filter date range where relevant. |

## 8.2 Example

GET /api/v1/employees?pageIndex=1&pageSize=20&departmentId=...&positionId=...&status=ACTIVE&search=linh&sortBy=fullName&sortDirection=asc

# 9\. File Upload and MinIO Access Pattern

DigiTalent AI stores lesson materials, task submission files and certificate PDFs in MinIO. The backend must own file validation, metadata, authorization and download rules.

| **Pattern** | **Recommendation** |
| --- | --- |
| MVP upload pattern | Use backend-proxy multipart upload through POST /files/upload. It is simpler and safer for capstone. |
| Future production pattern | Use pre-signed upload URL after backend creates upload session and validates intent. |
| File metadata | Store file\_objects record: objectKey, bucket, contentType, size, checksum, owner, purpose, visibility and status. |
| Access control | Never expose raw MinIO public bucket for sensitive files. Generate time-limited URL or stream through backend. |
| Validation | Validate allowed MIME type, size, extension and purpose before accepting file. |

## 9.1 File Purpose Enum

LESSON\_MATERIAL

TASK\_SUBMISSION

CERTIFICATE\_PDF

CERTIFICATE\_TEMPLATE\_ASSET

EMPLOYEE\_IMPORT

MANUAL\_EVIDENCE

# 10\. SignalR Realtime API Surface

SignalR is not a REST endpoint, but it is still part of the API surface because frontend must integrate with it. The MVP should keep SignalR focused on notifications and avoid complex collaboration features.

| **Hub / Event** | **Direction** | **Purpose** |
| --- | --- | --- |
| /hubs/notifications | Client connects | Authenticated users connect to receive personal notifications. |
| NotificationCreated | Server -> Client | New course assignment, task assignment, deadline reminder or risk alert. |
| TaskStatusChanged | Server -> Client | Task status/submission/evaluation update. |
| CertificateIssued | Server -> Client | Employee receives certificate notification. |
| TrainingRiskRaised | Server -> Client | Manager/HR receives risk notification. |

# 11\. Endpoint Catalog by Module

The following catalog defines the initial API surface. The backend team should implement endpoints by MVP priority and keep Swagger documentation synchronized with this document.

## Authentication & Account

| **Method** | **Endpoint** | **Permission / Scope** | **Purpose** | **Contract Notes** |
| --- | --- | --- | --- | --- |
| POST | /api/v1/auth/login | Public | Authenticate user and return access/refresh tokens. | LoginRequest -> LoginResponse |
| POST | /api/v1/auth/refresh-token | Authenticated by refresh token | Issue a new access token when refresh token is valid. | RefreshTokenRequest -> TokenResponse |
| POST | /api/v1/auth/logout | Authenticated | Revoke current refresh token/session. | No body / session token |
| GET | /api/v1/auth/me | Authenticated | Return current user profile, roles and permissions. | CurrentUserResponse |
| POST | /api/v1/auth/change-password | Authenticated | Change own password after verifying current password. | ChangePasswordRequest |
| POST | /api/v1/auth/forgot-password | Public / Optional | Create reset-password flow for future production hardening. | Optional MVP/Future |

## User, Role and Permission Management

| **Method** | **Endpoint** | **Permission / Scope** | **Purpose** | **Contract Notes** |
| --- | --- | --- | --- | --- |
| GET | /api/v1/users | SYS\_ADMIN, HR\_MANAGER | Search/list user accounts with filters and pagination. | Paged<UserSummaryResponse> |
| POST | /api/v1/users | SYS\_ADMIN, HR\_MANAGER | Create user account and optionally link employee profile. | CreateUserRequest |
| GET | /api/v1/users/{userId} | SYS\_ADMIN, HR\_MANAGER | View user detail and assigned roles. | UserDetailResponse |
| PUT | /api/v1/users/{userId} | SYS\_ADMIN, HR\_MANAGER | Update user account metadata and status. | UpdateUserRequest |
| POST | /api/v1/users/{userId}/roles | SYS\_ADMIN | Replace/assign roles for a user. | AssignUserRolesRequest |
| POST | /api/v1/users/{userId}/lock | SYS\_ADMIN | Lock compromised or inactive account. | Reason required |
| GET | /api/v1/roles | SYS\_ADMIN | List roles and permissions. | RoleResponse\[\] |
| GET | /api/v1/permissions | SYS\_ADMIN | List system permissions for RBAC matrix. | PermissionResponse\[\] |

## Organization & Employee Management

| **Method** | **Endpoint** | **Permission / Scope** | **Purpose** | **Contract Notes** |
| --- | --- | --- | --- | --- |
| GET | /api/v1/departments | SYS\_ADMIN, HR\_MANAGER | List departments with status and manager summary. | Paged<DepartmentResponse> |
| POST | /api/v1/departments | SYS\_ADMIN, HR\_MANAGER | Create department. | CreateDepartmentRequest |
| PUT | /api/v1/departments/{departmentId} | SYS\_ADMIN, HR\_MANAGER | Update department metadata. | UpdateDepartmentRequest |
| PATCH | /api/v1/departments/{departmentId}/status | SYS\_ADMIN, HR\_MANAGER | Activate/inactivate/archive department. | StatusChangeRequest |
| GET | /api/v1/job-positions | SYS\_ADMIN, HR\_MANAGER | List job positions with department and competency count. | Paged<JobPositionResponse> |
| POST | /api/v1/job-positions | SYS\_ADMIN, HR\_MANAGER | Create job position. | CreateJobPositionRequest |
| PUT | /api/v1/job-positions/{positionId} | SYS\_ADMIN, HR\_MANAGER | Update job position. | UpdateJobPositionRequest |
| GET | /api/v1/employees | SYS\_ADMIN, HR\_MANAGER, DEPT\_MANAGER | List employees; manager is department-scoped. | Paged<EmployeeSummaryResponse> |
| POST | /api/v1/employees | SYS\_ADMIN, HR\_MANAGER | Create employee profile and optionally user account. | CreateEmployeeRequest |
| GET | /api/v1/employees/{employeeId} | Authorized by role/scope | View employee detail, department, position and status. | EmployeeDetailResponse |
| PUT | /api/v1/employees/{employeeId} | SYS\_ADMIN, HR\_MANAGER | Update employee profile. | UpdateEmployeeRequest |
| PATCH | /api/v1/employees/{employeeId}/assignment | SYS\_ADMIN, HR\_MANAGER | Transfer employee to department/position/manager. | EmployeeAssignmentRequest |

## Competency Framework

| **Method** | **Endpoint** | **Permission / Scope** | **Purpose** | **Contract Notes** |
| --- | --- | --- | --- | --- |
| GET | /api/v1/competency-categories | SYS\_ADMIN, HR\_MANAGER, TRAINER | List competency categories. | CategoryResponse\[\] |
| POST | /api/v1/competency-categories | SYS\_ADMIN, HR\_MANAGER | Create competency category. | CreateCategoryRequest |
| GET | /api/v1/competencies | SYS\_ADMIN, HR\_MANAGER, TRAINER | Search/list competencies with category and status. | Paged<CompetencyResponse> |
| POST | /api/v1/competencies | SYS\_ADMIN, HR\_MANAGER | Create competency with level model reference. | CreateCompetencyRequest |
| PUT | /api/v1/competencies/{competencyId} | SYS\_ADMIN, HR\_MANAGER | Update competency metadata and criteria. | UpdateCompetencyRequest |
| GET | /api/v1/competency-levels | SYS\_ADMIN, HR\_MANAGER, TRAINER | List level definitions used by competencies. | LevelResponse\[\] |
| GET | /api/v1/job-positions/{positionId}/competency-requirements | SYS\_ADMIN, HR\_MANAGER, DEPT\_MANAGER | View required competencies for a position. | PositionRequirementResponse\[\] |
| PUT | /api/v1/job-positions/{positionId}/competency-requirements | SYS\_ADMIN, HR\_MANAGER | Replace position competency matrix with weights/mandatory flags. | SavePositionRequirementsRequest |
| GET | /api/v1/employees/{employeeId}/competency-profile | Authorized by role/scope | View employee current competency levels and evidence summary. | EmployeeCompetencyProfileResponse |
| POST | /api/v1/employees/{employeeId}/competency-evidences | SYS\_ADMIN, HR\_MANAGER, DEPT\_MANAGER, TRAINER | Add manual/manager evidence when permission allows. | CreateCompetencyEvidenceRequest |

## Course & Learning Management

| **Method** | **Endpoint** | **Permission / Scope** | **Purpose** | **Contract Notes** |
| --- | --- | --- | --- | --- |
| GET | /api/v1/courses | Authorized | Search/list courses with competency, status and publication filters. | Paged<CourseSummaryResponse> |
| POST | /api/v1/courses | SYS\_ADMIN, HR\_MANAGER, TRAINER | Create course draft. | CreateCourseRequest |
| GET | /api/v1/courses/{courseId} | Authorized | View course detail, modules, lessons and completion rule. | CourseDetailResponse |
| PUT | /api/v1/courses/{courseId} | SYS\_ADMIN, HR\_MANAGER, TRAINER(owner) | Update course metadata. | UpdateCourseRequest |
| POST | /api/v1/courses/{courseId}/publish | HR\_MANAGER, TRAINER(owner) | Publish course when required content is valid. | PublishCourseRequest |
| GET | /api/v1/courses/{courseId}/modules | Authorized | List course modules. | ModuleResponse\[\] |
| POST | /api/v1/courses/{courseId}/modules | TRAINER, HR\_MANAGER | Create course module. | CreateModuleRequest |
| POST | /api/v1/modules/{moduleId}/lessons | TRAINER, HR\_MANAGER | Create lesson. | CreateLessonRequest |
| PUT | /api/v1/lessons/{lessonId} | TRAINER, HR\_MANAGER | Update lesson content metadata. | UpdateLessonRequest |
| POST | /api/v1/lessons/{lessonId}/materials | TRAINER, HR\_MANAGER | Attach material file/link to lesson. | CreateMaterialRequest or multipart |
| PUT | /api/v1/courses/{courseId}/competencies | TRAINER, HR\_MANAGER | Map course to competencies and target levels. | SaveCourseCompetenciesRequest |
| POST | /api/v1/course-assignments | SYS\_ADMIN, HR\_MANAGER, DEPT\_MANAGER | Assign course to employees, departments or positions. | CreateCourseAssignmentRequest |
| GET | /api/v1/enrollments/my | EMPLOYEE | View current user enrollments and progress. | Paged<MyEnrollmentResponse> |
| POST | /api/v1/lessons/{lessonId}/complete | EMPLOYEE | Mark lesson completed and update learning progress. | LessonCompletionRequest |

## Assessment & Question Bank

| **Method** | **Endpoint** | **Permission / Scope** | **Purpose** | **Contract Notes** |
| --- | --- | --- | --- | --- |
| GET | /api/v1/question-banks | TRAINER, HR\_MANAGER | List question banks. | Paged<QuestionBankResponse> |
| POST | /api/v1/question-banks | TRAINER, HR\_MANAGER | Create question bank. | CreateQuestionBankRequest |
| GET | /api/v1/questions | TRAINER, HR\_MANAGER | Search/list questions by competency, difficulty and status. | Paged<QuestionResponse> |
| POST | /api/v1/questions | TRAINER, HR\_MANAGER | Create question manually. | CreateQuestionRequest |
| POST | /api/v1/questions/ai-drafts | TRAINER, HR\_MANAGER | Generate draft questions using AI for trainer review. | Optional bonus |
| POST | /api/v1/questions/{questionId}/approve | TRAINER, HR\_MANAGER | Approve AI/manual draft for official use. | ApprovalRequest |
| GET | /api/v1/assessments | TRAINER, HR\_MANAGER | List assessments. | Paged<AssessmentSummaryResponse> |
| POST | /api/v1/assessments | TRAINER, HR\_MANAGER | Create assessment and scoring rule. | CreateAssessmentRequest |
| PUT | /api/v1/assessments/{assessmentId}/questions | TRAINER, HR\_MANAGER | Save assessment-question mapping. | SaveAssessmentQuestionsRequest |
| POST | /api/v1/assessments/{assessmentId}/attempts | EMPLOYEE | Start assessment attempt if eligible. | AttemptStartResponse |
| POST | /api/v1/assessment-attempts/{attemptId}/submit | EMPLOYEE | Submit answers and calculate score. | SubmitAssessmentRequest |
| GET | /api/v1/assessment-attempts/{attemptId}/result | Authorized by scope | View result, score and feedback if allowed. | AssessmentResultResponse |

## Certificate Management & Verification

| **Method** | **Endpoint** | **Permission / Scope** | **Purpose** | **Contract Notes** |
| --- | --- | --- | --- | --- |
| GET | /api/v1/certificate-templates | SYS\_ADMIN, HR\_MANAGER | List certificate templates. | TemplateResponse\[\] |
| POST | /api/v1/certificate-templates | SYS\_ADMIN, HR\_MANAGER | Create/update certificate visual template metadata. | CreateTemplateRequest |
| POST | /api/v1/certificates/issue | SYS\_ADMIN, HR\_MANAGER, System job | Issue certificate when completion rules are met. | IssueCertificateRequest |
| GET | /api/v1/certificates | Authorized by role/scope | Search/list certificates with status, expiry and course filters. | Paged<CertificateSummaryResponse> |
| GET | /api/v1/certificates/{certificateId} | Authorized by role/scope | View certificate detail and PDF link. | CertificateDetailResponse |
| GET | /api/v1/certificates/my | EMPLOYEE | List current employee certificates. | Paged<MyCertificateResponse> |
| GET | /api/v1/certificates/verify/{certificateCode} | Public / CERT\_VERIFIER | Verify certificate code or QR URL. | CertificateVerificationResponse |
| POST | /api/v1/certificates/{certificateId}/revoke | SYS\_ADMIN, HR\_MANAGER | Revoke certificate with reason and audit log. | RevokeCertificateRequest |
| POST | /api/v1/certificates/{certificateId}/renew | SYS\_ADMIN, HR\_MANAGER | Renew or reissue certificate when policy allows. | RenewCertificateRequest |

## WMS-lite Practical Task & Evidence

| **Method** | **Endpoint** | **Permission / Scope** | **Purpose** | **Contract Notes** |
| --- | --- | --- | --- | --- |
| GET | /api/v1/practical-tasks | HR\_MANAGER, DEPT\_MANAGER, TRAINER | Search task templates/tasks by competency and status. | Paged<TaskResponse> |
| POST | /api/v1/practical-tasks | HR\_MANAGER, DEPT\_MANAGER, TRAINER | Create practical task template or assignable task. | CreatePracticalTaskRequest |
| POST | /api/v1/practical-tasks/ai-suggestions | HR\_MANAGER, DEPT\_MANAGER, TRAINER | Generate task suggestion based on skill gap/course. | Optional bonus |
| POST | /api/v1/task-assignments | DEPT\_MANAGER, HR\_MANAGER | Assign task to employee with deadline and criteria. | AssignTaskRequest |
| GET | /api/v1/task-assignments | Authorized by role/scope | List task assignments. Employee sees own; Manager sees department. | Paged<TaskAssignmentResponse> |
| GET | /api/v1/task-assignments/{assignmentId} | Authorized by scope | View task assignment detail and submission/evaluation status. | TaskAssignmentDetailResponse |
| PATCH | /api/v1/task-assignments/{assignmentId}/status | Authorized by workflow | Update accepted/in-progress/cancelled status. | TaskStatusUpdateRequest |
| POST | /api/v1/task-assignments/{assignmentId}/submissions | EMPLOYEE | Submit output file/link/note for evaluation. | CreateTaskSubmissionRequest |
| POST | /api/v1/task-assignments/{assignmentId}/evaluations | DEPT\_MANAGER, HR\_MANAGER, TRAINER(if assigned) | Evaluate task, score, feedback and competency confirmation. | EvaluateTaskRequest |

## Capability Intelligence & Scoring

| **Method** | **Endpoint** | **Permission / Scope** | **Purpose** | **Contract Notes** |
| --- | --- | --- | --- | --- |
| POST | /api/v1/intelligence/skill-gaps/analyze | SYS\_ADMIN, HR\_MANAGER, DEPT\_MANAGER, EMPLOYEE(own) | Calculate skill gap for employee and position. | AnalyzeSkillGapRequest -> SkillGapResponse |
| GET | /api/v1/intelligence/skill-gaps | Authorized by role/scope | List latest skill gap results. | Paged<SkillGapResultResponse> |
| POST | /api/v1/intelligence/learning-recommendations/generate | Authorized by role/scope | Generate learning recommendations from skill gap and course mapping. | GenerateRecommendationRequest |
| GET | /api/v1/intelligence/learning-recommendations | Authorized by role/scope | View recommended courses/paths. | Paged<LearningRecommendationResponse> |
| POST | /api/v1/intelligence/training-risks/recalculate | SYS\_ADMIN, HR\_MANAGER, DEPT\_MANAGER | Recalculate training risk scores. | RiskRecalculationRequest |
| GET | /api/v1/intelligence/training-risks | SYS\_ADMIN, HR\_MANAGER, DEPT\_MANAGER | List high-risk employees/enrollments. | Paged<TrainingRiskResponse> |
| POST | /api/v1/intelligence/readiness/recalculate | SYS\_ADMIN, HR\_MANAGER, DEPT\_MANAGER | Recalculate workforce readiness score. | ReadinessRecalculationRequest |
| GET | /api/v1/intelligence/readiness | Authorized by role/scope | View readiness results by employee/department. | Paged<ReadinessScoreResponse> |
| POST | /api/v1/intelligence/career-readiness/analyze | HR\_MANAGER, DEPT\_MANAGER, EMPLOYEE(own optional) | Analyze readiness against target position. | Optional bonus |
| GET | /api/v1/intelligence/explanations/{explanationId} | Authorized by scope | View score/recommendation explanation log. | AIExplanationResponse |

## Dashboard, Reports and Analytics

| **Method** | **Endpoint** | **Permission / Scope** | **Purpose** | **Contract Notes** |
| --- | --- | --- | --- | --- |
| GET | /api/v1/dashboards/hr/overview | HR\_MANAGER, SYS\_ADMIN | Company-wide training, competency, certificate and readiness overview. | HrDashboardResponse |
| GET | /api/v1/dashboards/hr/competency-heatmap | HR\_MANAGER, SYS\_ADMIN | Competency heatmap by department/position. | HeatmapResponse |
| GET | /api/v1/dashboards/hr/risk-list | HR\_MANAGER, SYS\_ADMIN | Employees/enrollments at training risk. | Paged<RiskItemResponse> |
| GET | /api/v1/dashboards/manager/overview | DEPT\_MANAGER | Department-scoped dashboard. | ManagerDashboardResponse |
| GET | /api/v1/dashboards/trainer/overview | TRAINER | Course/assessment authoring and learner outcome summary. | TrainerDashboardResponse |
| GET | /api/v1/dashboards/employee/overview | EMPLOYEE | My learning, tasks, certificates and competency summary. | EmployeeDashboardResponse |
| GET | /api/v1/reports/certificates | HR\_MANAGER, SYS\_ADMIN | Certificate status report. | Paged<CertificateReportRow> |
| GET | /api/v1/reports/task-performance | HR\_MANAGER, DEPT\_MANAGER | Task performance and evidence report. | Paged<TaskPerformanceRow> |

## Files, Notifications, Audit and Configuration

| **Method** | **Endpoint** | **Permission / Scope** | **Purpose** | **Contract Notes** |
| --- | --- | --- | --- | --- |
| POST | /api/v1/files/upload | Authorized | Upload material/task/certificate-support file through backend validation. | multipart/form-data -> FileObjectResponse |
| GET | /api/v1/files/{fileId}/download-url | Authorized by owner/scope | Create time-limited download URL or stream file. | FileDownloadResponse |
| DELETE | /api/v1/files/{fileId} | Authorized owner/admin | Soft-delete or detach file when allowed. | Audit required |
| GET | /api/v1/notifications | Authenticated | List current user notifications. | Paged<NotificationResponse> |
| PATCH | /api/v1/notifications/{notificationId}/read | Authenticated | Mark notification as read. | No body |
| POST | /api/v1/notifications/read-all | Authenticated | Mark all current user notifications as read. | No body |
| GET | /api/v1/audit-logs | SYS\_ADMIN, HR\_MANAGER(limited) | Search audit logs. | Paged<AuditLogResponse> |
| GET | /api/v1/scoring-configs | SYS\_ADMIN, HR\_MANAGER | View scoring weights and thresholds. | ScoringConfigResponse\[\] |
| PUT | /api/v1/scoring-configs/{configKey} | SYS\_ADMIN | Update scoring rule/threshold without code change. | UpdateScoringConfigRequest |

# 12\. DTO and Schema Design Examples

The following examples are not final generated code. They describe the contract shape expected by the frontend. During implementation, every DTO should be represented in Swagger/OpenAPI.

### LoginRequest

{

"email": "employee01@company.com",

"password": "P@ssw0rd!"

}

### LoginResponse

{

"accessToken": "jwt-access-token",

"refreshToken": "refresh-token",

"expiresIn": 900,

"user": { "id": "uuid", "fullName": "Nguyen Van A", "roles": \["EMPLOYEE"\] }

}

### CreateCourseRequest

{

"code": "DATA-101",

"title": "Data Literacy Foundation",

"description": "Basic data literacy for business staff",

"level": "BASIC",

"estimatedDurationMinutes": 180,

"competencyIds": \["uuid-1", "uuid-2"\],

"completionRule": { "requiredProgressPercent": 100, "finalAssessmentMinScore": 70 }

}

### SubmitAssessmentRequest

{

"answers": \[

{ "questionId": "uuid-q1", "selectedOptionIds": \["uuid-opt1"\] },

{ "questionId": "uuid-q2", "textAnswer": "Short explanation" }

\]

}

### CertificateVerificationResponse

{

"certificateCode": "DIGI-2026-000001",

"status": "VALID",

"holderName": "Nguyen Van A",

"courseTitle": "Data Literacy Foundation",

"issuedAt": "2026-06-19T00:00:00Z",

"expiresAt": "2027-06-19T00:00:00Z",

"verificationResult": "Certificate is valid and has not expired or been revoked."

}

### EvaluateTaskRequest

{

"score": 85,

"feedback": "Good report structure and valid insight explanation.",

"criteriaResults": \[

{ "criterionId": "uuid-c1", "score": 40, "comment": "Accurate analysis" },

{ "criterionId": "uuid-c2", "score": 45, "comment": "Clear presentation" }

\],

"confirmedCompetencies": \[

{ "competencyId": "uuid-data", "confirmedLevel": 3 }

\]

}

### SkillGapResponse

{

"employeeId": "uuid-employee",

"positionId": "uuid-position",

"items": \[

{ "competencyId": "uuid-data", "requiredLevel": 3, "currentLevel": 1, "gap": 2, "priority": "HIGH" }

\],

"summary": "Employee lacks two levels in Data Literacy."

}

### ReadinessScoreResponse

{

"employeeId": "uuid-employee",

"score": 78.5,

"level": "READY\_WITH\_MINOR\_GAP",

"breakdown": {

"competencyScore": 80,

"certificateScore": 75,

"learningProgressScore": 90,

"complianceScore": 100,

"taskPerformanceScore": 60

},

"explanationId": "uuid-explanation"

}

# 13\. OpenAPI / Swagger Structure

## 13.1 Swagger Tags

*   Auth
*   Users
*   Roles
*   Organization
*   Employees
*   Competencies
*   Courses
*   Assessments
*   Certificates
*   Tasks
*   Intelligence
*   Dashboards
*   Files
*   Notifications
*   Audit
*   Configuration

## 13.2 Recommended ASP.NET Core Setup

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>

{

options.SwaggerDoc("v1", new OpenApiInfo

{

Title = "DigiTalent AI API",

Version = "v1"

});

options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme

{

In = ParameterLocation.Header,

Description = "Enter JWT Bearer token",

Name = "Authorization",

Type = SecuritySchemeType.Http,

Scheme = "bearer",

BearerFormat = "JWT"

});

});

## 13.3 OpenAPI Starter File

A companion starter YAML file was generated with this document: 08\_OpenAPI\_Starter\_DigiTalent\_AI.yaml. It should be expanded once DTOs and controllers are implemented.

openapi: 3.0.3

info:

title: DigiTalent AI API

version: 1.0.0

servers:

\- url: http://localhost:5000/api/v1

security:

\- bearerAuth: \[\]

paths:

/auth/login:

post:

summary: Login

components:

securitySchemes:

bearerAuth:

type: http

scheme: bearer

bearerFormat: JWT

# 14\. Permission and Data Scope Rules

| **Rule ID** | **Rule** |
| --- | --- |
| API-RBAC-01 | Every protected endpoint must declare required permission in code and Swagger description. |
| API-RBAC-02 | System Admin can manage users, roles, permissions, config and audit logs. |
| API-RBAC-03 | HR Manager can view company-wide employees, training, certificates and dashboards. |
| API-RBAC-04 | Department Manager can only access employees, tasks and readiness data within managed department. |
| API-RBAC-05 | Trainer can manage courses, lessons, questions and assessments but cannot arbitrarily change employee competency unless through approved workflow. |
| API-RBAC-06 | Employee can access own learning, own attempts, own certificates, own tasks and own competency profile. |
| API-RBAC-07 | Certificate verification endpoint must expose limited certificate information only. |
| API-RBAC-08 | Sensitive actions must create audit logs: certificate issue/revoke, task evaluation, competency change, scoring config update. |
| API-RBAC-09 | AI suggestion endpoints return drafts only. Official questions/tasks require human approval. |
| API-RBAC-10 | Score recalculation endpoints must use server-side formulas/config; clients cannot submit final score directly except authorized task evaluation score. |

# 15\. Versioning, Compatibility and Deprecation

*   Initial version should be /api/v1.
*   Avoid breaking frontend by changing response fields without coordination.
*   Add optional fields instead of renaming existing fields when possible.
*   Use enum values consistently and document status transitions.
*   If future v2 is needed, create /api/v2 rather than changing v1 behavior silently.
*   Swagger must be updated in the same pull request as API behavior changes.

# 16\. Testing, Acceptance and Implementation Roadmap

## 16.1 API Testing Strategy

| **Test Type** | **Target** |
| --- | --- |
| Unit tests | Service-level logic: scoring, skill gap, certificate eligibility, task status transition. |
| Integration tests | Auth, RBAC, EF Core/PostgreSQL, file metadata, certificate issue, assessment submit. |
| Contract tests/manual Swagger checks | Request/response DTO shape for frontend integration. |
| Permission tests | Admin/HR/Manager/Trainer/Employee scope enforcement. |
| Regression tests | Core demo flow: position -> skill gap -> course -> assessment -> certificate -> task -> readiness. |

## 16.2 Implementation Roadmap

1\. Implement Auth/RBAC APIs first because all modules depend on identity and permissions.

2\. Implement Organization and Employee APIs to provide base data for competency and training.

3\. Implement Competency Framework and Position Requirement APIs.

4\. Implement Course/Lesson/Material APIs and Course Assignment APIs.

5\. Implement Assessment Attempt/Submit APIs.

6\. Implement Certificate Issue/Verify APIs.

7\. Implement WMS-lite Task Assignment/Submission/Evaluation APIs.

8\. Implement Skill Gap, Recommendation, Risk and Readiness APIs using rule-based formulas.

9\. Implement Dashboard APIs after enough transactional data exists.

10\. Add optional AI endpoints for question drafts and task suggestions only after core workflow is stable.

## 16.3 API Acceptance Checklist

| **Checklist Item** | **Done?** |
| --- | --- |
| Every endpoint has method, path, permission, request, response and error cases documented. |     |
| Every protected endpoint validates JWT and role permission. |     |
| Department-scoped endpoints verify manager data scope from database. |     |
| DTOs are used instead of exposing EF Core entities. |     |
| Validation errors are consistent and frontend-friendly. |     |
| Swagger groups endpoints by module tags. |     |
| Certificate verification exposes limited public data. |     |
| File upload validates size, type, purpose and access scope. |     |
| Important business actions write audit logs. |     |
| Core demo flow can be completed through API calls from Swagger/Postman. |     |

# 17\. Appendix: OpenAPI Starter YAML Summary

The generated companion YAML is intentionally a starter contract rather than a complete final API file. It defines OpenAPI metadata, server URLs, JWT bearer scheme, common schemas and representative endpoint paths. During implementation, backend developers should extend it through Swagger annotations or generated OpenAPI output.

## 17.1 Suggested Folder Placement

docs/api/08\_API\_Specification\_OpenAPI\_Design\_DigiTalent\_AI.docx

docs/api/openapi/digitalent-ai.v1.yaml

backend/src/DigiTalent.Api/Controllers/...

## 17.2 Controller-to-Tag Mapping

| **Controller** | **Swagger Tag** |
| --- | --- |
| AuthController | Auth |
| UsersController | Users |
| DepartmentsController | Organization |
| EmployeesController | Employees |
| CompetenciesController | Competencies |
| CoursesController | Courses |
| AssessmentsController | Assessments |
| CertificatesController | Certificates |
| TaskAssignmentsController | Tasks |
| IntelligenceController | Intelligence |
| DashboardsController | Dashboards |
| FilesController | Files |
| NotificationsController | Notifications |
| AuditLogsController | Audit |