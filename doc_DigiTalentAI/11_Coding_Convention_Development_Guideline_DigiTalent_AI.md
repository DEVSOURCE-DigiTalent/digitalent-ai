**DIGITALENT AI**

**Coding Convention & Development Guideline**

Document 11 - Development Standard for ReactJS, ASP.NET Core, PostgreSQL, MinIO, SignalR and Docker

| **Item** | **Value** |
| --- | --- |
| Project | DigiTalent AI - Digital Competency Training, Internal Certification and Work-Based Assessment Platform |
| Document Type | Coding Convention / Development Guideline |
| Primary Audience | Frontend developers, Backend developers, QA, Technical Lead, DevOps owner |
| Technology Stack | ReactJS, TypeScript, TailwindCSS, ShadCN/UI, ASP.NET Core/C#, PostgreSQL, MinIO, Redis optional, SignalR, Docker, Nginx, GitHub Actions |
| Architecture Direction | Modular Monolith with Clean Architecture boundaries and permission-based RBAC |
| Version | 1.0 |
| Status | Ready for development planning and team onboarding |

**Mentor note:** This document is written as an implementation contract. The team should follow it before creating repositories, branches, API controllers, database migrations, React components and pull requests.

# Table of Contents

1\. Purpose and Scope

2\. Development Principles

3\. Repository and Solution Structure

4\. Backend Coding Convention - ASP.NET Core/C#

5\. Database and EF Core Convention

6\. API and Integration Convention

7\. Frontend Coding Convention - React/TypeScript

8\. UI Implementation Convention - TailwindCSS/ShadCN/UI

9\. State Management and Data Fetching

10\. Form, Validation and Error Handling

11\. Authentication, RBAC and Security Guideline

12\. File Storage, MinIO and Upload Convention

13\. SignalR Notification Convention

14\. AI, Scoring and Rule-Based Logic Convention

15\. Logging, Audit and Observability

16\. Testing Guideline

17\. Git Workflow and Pull Request Standard

18\. Environment, Docker and CI/CD Convention

19\. Code Review Checklist

20\. Definition of Ready and Definition of Done

21\. Anti-patterns and Risk Controls

22\. Implementation Roadmap for Applying This Guideline

Appendix A. Naming Cheat Sheet

Appendix B. PR Template

Appendix C. Commit Message Examples

# 1\. Purpose and Scope

This document defines the coding convention, development rules and implementation standards for the DigiTalent AI capstone project. It exists to make the source code consistent, maintainable, secure and reviewable across a five-member team.

The guideline covers backend, frontend, database, API, file storage, security, testing, Git workflow, Docker and CI/CD practices. It should be treated as a practical standard, not as a theoretical document.

| **Scope Area** | **Included Standard** |
| --- | --- |
| Backend | ASP.NET Core Web API, Clean Architecture boundaries, DTOs, services, controllers, validation, error handling and authorization policies. |
| Frontend | ReactJS, TypeScript, route structure, feature modules, API client, components, hooks, forms and UI state. |
| Database | PostgreSQL naming, EF Core migrations, table conventions, audit fields, soft delete, indexes and transactions. |
| Security | JWT, refresh token, RBAC, data scope, file upload validation, audit logs and secret handling. |
| DevOps | Docker Compose, environment variables, GitHub Actions, branch workflow and deployment readiness. |
| Quality | Testing scope, code review checklist, Definition of Ready and Definition of Done. |

**Project baseline:** The guideline assumes the approved scope: RBAC, organization management, competency framework, learning/assessment, certificate QR, capability analysis, WMS-lite task evidence, dashboard and optional AI support.

# 2\. Development Principles

| **Principle** | **Meaning for DigiTalent AI** |
| --- | --- |
| Business first | Do not code isolated screens. Every feature must support a business flow: position requirement -> competency -> learning -> assessment -> certificate -> task evidence -> readiness. |
| MVP controlled | Core functions must be completed before bonus AI features. Rule-based scoring is prioritized over complex AI automation. |
| Clean but practical | Use clear layers and feature boundaries, but avoid over-engineering microservices or unnecessary abstract patterns. |
| Secure by default | Every protected API must validate authentication, permission and data scope. Frontend hiding is not security. |
| Observable changes | Important actions such as certificate issue/revoke, task evaluation and competency update must create audit logs. |
| Consistent user experience | Tables, buttons, dialogs, filters, validations and status chips must follow the UI/UX specification. |
| Reviewable code | Small PRs, clear naming, no hard-code, no secrets, no mixed unrelated changes. |

# 3\. Repository and Solution Structure

The recommended approach is a mono-repository because the capstone team needs synchronized frontend, backend, docs and deployment configuration.

digitalent-ai/  
backend/  
DigiTalent.sln  
src/  
DigiTalent.Api/  
DigiTalent.Application/  
DigiTalent.Domain/  
DigiTalent.Infrastructure/  
DigiTalent.SharedKernel/  
DigiTalent.Worker/ # optional background jobs  
tests/  
DigiTalent.UnitTests/  
DigiTalent.IntegrationTests/  
frontend/  
src/  
app/  
routes/  
features/  
shared/  
components/  
lib/  
hooks/  
services/  
types/  
assets/  
infra/  
docker/  
nginx/  
scripts/  
docs/  
01\_Project\_Overview.docx  
02\_BRD.docx  
...  
.github/  
workflows/  
docker-compose.yml  
README.md  

| **Folder** | **Rule** |
| --- | --- |
| backend/src | Contains production source code only. Do not put test utilities or local scripts here. |
| frontend/src/features | Each business module owns its pages, components, hooks, schemas and API functions. |
| infra | Contains Docker, Nginx, seed script and environment setup documents. |
| docs | Stores project documentation and decision records. Do not mix generated binaries with source code unless necessary. |
| .github/workflows | CI/CD pipelines. Workflow names must be clear: backend-ci.yml, frontend-ci.yml, docker-build.yml. |

# 4\. Backend Coding Convention - ASP.NET Core/C#

## 4.1 Backend Layering Rule

| **Layer** | **Responsibility** | **Must Not Do** |
| --- | --- | --- |
| Api | Controllers, request binding, authentication middleware, response mapping, Swagger annotations. | Do not contain business calculations or EF Core query logic. |
| Application | Use cases, DTOs, service interfaces, validators, commands/queries, application rules. | Do not depend directly on ASP.NET HttpContext or concrete infrastructure implementation. |
| Domain | Core entities, value objects, domain enums, domain constants and domain-level methods. | Do not call database, MinIO, SignalR, OpenAI/Gemini or external services. |
| Infrastructure | EF Core DbContext, repositories/query services, MinIO, email/notification providers, external APIs. | Do not place controller logic or UI-specific DTOs here. |
| SharedKernel | Common base entities, result types, pagination, errors and reusable primitives. | Do not become a dumping ground for unrelated helpers. |

## 4.2 Backend Module Boundaries

| **Module** | **Examples of Use Cases** | **Main Owner** |
| --- | --- | --- |
| Auth | Login, refresh token, logout, password change, role and permission checks. | Backend security owner |
| Organization | Departments, job positions, employee profiles and manager assignments. | Backend business owner |
| Competency | Competency categories, levels, position requirements and employee competency profile. | Backend business owner |
| Learning | Courses, modules, lessons, materials, enrollment and progress. | Backend learning owner |
| Assessment | Question bank, assessments, attempts, answer scoring and pass/fail logic. | Backend learning owner |
| Certificate | Certificate issue, PDF generation metadata, QR verification, revoke and expiry. | Backend certificate owner |
| Task | WMS-lite task assignment, submission, evaluation and task evidence. | Backend task owner |
| Intelligence | Skill gap, learning recommendation, risk score, readiness score and AI explanation logs. | Backend analytics owner |
| Dashboard | Aggregated data for HR, Manager, Trainer and Employee views. | Backend analytics owner |

## 4.3 C# Naming Convention

| **Element** | **Convention** | **Example** |
| --- | --- | --- |
| Class / Record / Enum | PascalCase | CourseEnrollment, CertificateStatus |
| Method | PascalCase; async method ends with Async | IssueCertificateAsync |
| Local variable | camelCase | employeeId, readinessScore |
| Private field | \_camelCase | \_dbContext, \_clock |
| Interface | I + PascalCase | ICertificateService |
| DTO | Action + Entity + Request/Response | CreateCourseRequest, CourseDetailResponse |
| Validator | DTO name + Validator | CreateCourseRequestValidator |
| Controller | Plural resource name + Controller | CoursesController, CertificatesController |
| Constant | PascalCase in static class | CertificateRules.DefaultValidityMonths |

## 4.4 Controller and Service Standard

\[ApiController\]  
\[Route("api/v1/courses")\]  
\[Authorize\]  
public sealed class CoursesController : ControllerBase  
{  
private readonly ICourseService \_courseService;  
  
public CoursesController(ICourseService courseService)  
{  
\_courseService = courseService;  
}  
  
\[HttpPost\]  
\[Authorize(Policy = Permissions.Courses.Create)\]  
public async Task<ActionResult<ApiResponse<CourseDetailResponse>>> CreateAsync(  
\[FromBody\] CreateCourseRequest request,  
CancellationToken cancellationToken)  
{  
var result = await \_courseService.CreateAsync(request, cancellationToken);  
return CreatedAtAction(nameof(GetByIdAsync), new { id = result.Data!.Id }, result);  
}  
}  

| **Rule** | **Explanation** |
| --- | --- |
| Controller should be thin | Only validate route/body binding, call service/use case, return mapped response. |
| Always pass CancellationToken | API calls, EF Core queries, MinIO operations and external calls must support cancellation. |
| Do not return EF entity directly | Always return DTO/Response objects. This protects internal schema and avoids circular serialization. |
| Use policy-based authorization | Do not check role string manually in every controller unless there is a data-scope rule. |
| Use service-level transaction when needed | For certificate issue, task evaluation or scoring updates, use transaction boundaries. |

# 5\. Database and EF Core Convention

PostgreSQL is the source of truth for relational business data. MinIO stores large files; PostgreSQL stores metadata and object keys only.

| **Topic** | **Convention** |
| --- | --- |
| Table naming | Use snake\_case in PostgreSQL. Example: employee\_profiles, course\_enrollments, certificate\_verification\_logs. |
| Column naming | Use snake\_case. Example: created\_at, created\_by, is\_deleted, certificate\_code. |
| Primary key | Use UUID/GUID for business entities. Use consistent Id in C# mapped to id in DB. |
| Audit fields | Most business tables should include created\_at, created\_by, updated\_at, updated\_by. |
| Soft delete | Use is\_deleted or status for master data; avoid hard delete for audit-sensitive entities. |
| Enums | Keep C# enums explicit; map to string or constrained text when readability matters. |
| Indexes | Add indexes for foreign keys, frequently filtered status fields, code fields and dashboard queries. |
| Migration naming | Use descriptive names: AddCertificateVerification, AddTaskEvaluationEvidence. |

public abstract class AuditableEntity  
{  
public Guid Id { get; set; }  
public DateTimeOffset CreatedAt { get; set; }  
public Guid? CreatedBy { get; set; }  
public DateTimeOffset? UpdatedAt { get; set; }  
public Guid? UpdatedBy { get; set; }  
}  
  
public abstract class SoftDeletableEntity : AuditableEntity  
{  
public bool IsDeleted { get; set; }  
public DateTimeOffset? DeletedAt { get; set; }  
public Guid? DeletedBy { get; set; }  
}  

## 5.1 EF Core Entity Configuration Rule

public sealed class CourseConfiguration : IEntityTypeConfiguration<Course>  
{  
public void Configure(EntityTypeBuilder<Course> builder)  
{  
builder.ToTable("courses");  
builder.HasKey(x => x.Id);  
builder.Property(x => x.Code).HasMaxLength(50).IsRequired();  
builder.Property(x => x.Title).HasMaxLength(255).IsRequired();  
builder.HasIndex(x => x.Code).IsUnique();  
builder.HasQueryFilter(x => !x.IsDeleted);  
}  
}  

**Database rule:** Never create EF Core migrations from unfinished experimental entities. Draft schema changes should be reviewed against the Database Design Document before migration is committed.

# 6\. API and Integration Convention

| **Item** | **Standard** |
| --- | --- |
| Base path | /api/v1 |
| Resource naming | Plural nouns: /courses, /employees, /certificates. |
| HTTP methods | GET read, POST create/action, PUT full update, PATCH partial status update, DELETE soft delete/archive when allowed. |
| Pagination | Use pageNumber and pageSize. Response must include totalItems and totalPages. |
| Filtering | Use query parameters with clear names: status, departmentId, keyword, fromDate, toDate. |
| Sorting | Use sortBy and sortDirection with whitelisted fields only. |
| Response envelope | Use a consistent success/message/data/errors format. |
| Swagger | Every public endpoint must appear in Swagger with request/response examples when possible. |

{  
"success": true,  
"message": "Course created successfully.",  
"data": {  
"id": "e3b0a1f2-...",  
"code": "DATA-101",  
"title": "Data Literacy Foundation"  
},  
"errors": \[\]  
}  

{  
"success": false,  
"message": "Validation failed.",  
"data": null,  
"errors": \[  
{ "field": "title", "code": "Required", "message": "Course title is required." }  
\]  
}  

| **Status Code** | **Use Case** |
| --- | --- |
| 200 OK | Successful read/update/action that returns data. |
| 201 Created | Resource created successfully. |
| 204 No Content | Successful operation with no response body, such as logout or delete. |
| 400 Bad Request | Invalid request format or business validation failure. |
| 401 Unauthorized | Missing/invalid/expired access token. |
| 403 Forbidden | Authenticated but lacks permission or data scope. |
| 404 Not Found | Resource does not exist or is not visible to the user scope. |
| 409 Conflict | Duplicate code, invalid state transition, concurrent update conflict. |
| 500 Internal Server Error | Unexpected server error. Must be logged, not exposed in detail. |

# 7\. Frontend Coding Convention - React/TypeScript

## 7.1 Frontend Folder Structure

frontend/src/  
app/  
App.tsx  
providers/  
router.tsx  
features/  
auth/  
pages/  
components/  
hooks/  
services/  
schemas/  
types.ts  
courses/  
competency/  
certificates/  
tasks/  
dashboard/  
shared/  
components/  
layouts/  
guards/  
constants/  
utils/  
components/ui/ # ShadCN generated base components  
lib/  
api-client.ts  
auth-storage.ts  
query-client.ts  
hooks/  
types/  

| **Frontend Item** | **Convention** | **Example** |
| --- | --- | --- |
| Component | PascalCase | CourseCard.tsx |
| Page | PascalCase + Page suffix | CourseManagementPage.tsx |
| Hook | use + PascalCase | useCourseList.ts |
| Schema | camelCase + Schema | createCourseSchema |
| Type/Interface | PascalCase | CourseDetail, CreateCoursePayload |
| API function | verb + resource | createCourse, getCourseDetail |
| Route path | kebab-case | /courses/course-management |
| File name | Prefer kebab-case for non-component files | course-service.ts, auth-guard.tsx |

## 7.2 TypeScript Rules

| **Rule** | **Correct Practice** |
| --- | --- |
| No any by default | Use unknown for uncertain values and narrow the type safely. |
| DTO alignment | Frontend API types must match backend response contracts. Do not invent fields. |
| Null handling | Use optional chaining and explicit empty states. |
| Constants | Move role names, permission keys and status values to constants/enums. |
| Date handling | API returns ISO string; UI formats dates in view layer only. |
| Error handling | Never assume error.response.data exists. Use a safe error parser. |

export type ApiResponse<T> = {  
success: boolean;  
message: string;  
data: T | null;  
errors: ApiError\[\];  
};  
  
export type ApiError = {  
field?: string;  
code: string;  
message: string;  
};  

# 8\. UI Implementation Convention - TailwindCSS/ShadCN/UI

The UI must follow the UI/UX Design Specification. Developers should not create arbitrary colors, random spacing or inconsistent button variants.

| **Component** | **Implementation Rule** |
| --- | --- |
| Button | Use ShadCN Button variants. Primary action only one per main section. Danger action requires confirmation. |
| Card | Use cards for dashboard metrics, profile summaries and grouped form sections. Avoid nested card overload. |
| Dialog | Use for confirmation and small forms. Long forms should use page or drawer. |
| Table | Use consistent header, search, filter, pagination, loading skeleton and row action menu. |
| Badge/Status Chip | Use fixed status color mapping from UI/UX spec. Do not choose colors per screen. |
| Toast | Use success for completed action, destructive for failed action, neutral for informational result. |
| Empty State | Always show next action when possible: Create course, Assign course, Add employee. |
| Loading State | Use skeleton for tables/cards; spinner only for local short actions. |

<Button type="submit" disabled={isSubmitting}>  
{isSubmitting ? "Saving..." : "Save changes"}  
</Button>  
  
<Button variant="outline" onClick={handleCancel}>  
Cancel  
</Button>  
  
<Button variant="destructive" onClick={openRevokeDialog}>  
Revoke certificate  
</Button>  

# 9\. State Management and Data Fetching

| **State Type** | **Recommended Tool** | **Examples** |
| --- | --- | --- |
| Server state | TanStack Query / React Query | Course list, employee detail, dashboard metrics, certificate verification result. |
| Form state | React Hook Form + Zod | Create course, update employee, evaluate task, configure scoring threshold. |
| Auth/session state | Small auth store plus secure token handling | Current user, permissions, refresh flow. |
| UI state | Local useState or small store | Sidebar collapsed, dialog open, selected table rows. |
| Derived state | Compute from query data using memoization when needed | Risk level label, progress percent, visible actions by permission. |

**Frontend rule:** Do not duplicate server state into global stores unless there is a strong reason. Prefer React Query cache for data returned from APIs.

# 10\. Form, Validation and Error Handling

| **Area** | **Guideline** |
| --- | --- |
| Frontend validation | Use Zod schemas for required fields, max length, enum values and basic format. |
| Backend validation | Backend remains source of truth. Frontend validation improves UX but never replaces API validation. |
| Validation message | Use clear user-facing language: Course title is required, Deadline must be in the future. |
| Business error | Show conflict or invalid state clearly: Certificate is already revoked, Task cannot be evaluated before submission. |
| Field error mapping | Backend errors with field names should attach to the matching form control when possible. |
| Unsaved changes | For long forms, warn before leaving if dirty. |

const createCourseSchema = z.object({  
code: z.string().min(1).max(50),  
title: z.string().min(1).max(255),  
description: z.string().max(2000).optional(),  
competencyIds: z.array(z.string().uuid()).min(1),  
});  

# 11\. Authentication, RBAC and Security Guideline

| **Security Area** | **Rule** |
| --- | --- |
| Access token | Short-lived JWT used for API requests. Do not store sensitive information beyond claims needed for identity and permissions. |
| Refresh token | Stored and rotated securely. Backend must support revoke/logout behavior. |
| Password | Hash using secure password hasher. Never store plain text password. |
| Permission | Use permission keys rather than hard-coded role-only checks. |
| Data scope | Department Manager must only access employees/tasks in assigned scope. Employee can only access own learning/tasks/certificates. |
| Frontend guard | Hide unavailable UI actions, but backend must enforce the rule again. |
| Sensitive data | Do not log password, token, personal phone/email beyond required audit metadata. |
| File upload | Validate extension, MIME type, size and user permission before uploading to MinIO. |

public static class Permissions  
{  
public const string CoursesCreate = "courses.create";  
public const string CoursesUpdate = "courses.update";  
public const string CertificatesIssue = "certificates.issue";  
public const string TasksEvaluateDepartment = "tasks.evaluate.department";  
}  

**Critical rule:** A passed frontend route guard does not mean the request is authorized. Every protected backend endpoint must validate permission and data scope.

# 12\. File Storage, MinIO and Upload Convention

Files uploaded by users or generated by the system must be stored in MinIO or compatible object storage. PostgreSQL stores only metadata such as object key, bucket, content type, size, checksum and owner.

| **File Type** | **Storage Rule** | **Example Object Key** |
| --- | --- | --- |
| Lesson material | Stored under course/lesson path. Only Trainer/HR/Admin can upload. | courses/{courseId}/lessons/{lessonId}/materials/{fileId}.pdf |
| Task submission | Stored under task assignment path. Employee can upload only for own task. | tasks/{assignmentId}/submissions/{submissionId}/{fileName} |
| Certificate PDF | Generated by backend and stored as immutable object when issued. | certificates/{certificateId}/certificate.pdf |
| Evidence attachment | Linked to competency evidence record. Access follows evidence permission. | evidence/{evidenceId}/{fileId} |

| **Validation** | **Requirement** |
| --- | --- |
| Max size | Define per file type, not a single magic value for all files. |
| Allowed extensions | PDF, DOCX, PPTX, XLSX, PNG, JPG depending on business case. |
| Object key | Generated by server. Never trust client-provided path. |
| Download | Use short-lived pre-signed URLs when possible. |
| Delete | Prefer soft-delete metadata or mark unavailable; avoid deleting evidence unless policy allows. |

# 13\. SignalR Notification Convention

| **Event** | **Triggered When** | **Recipients** |
| --- | --- | --- |
| course.assigned | HR/Manager assigns course to employee or department. | Affected employees. |
| assessment.completed | Employee submits final assessment. | Employee, Trainer/Manager depending on course ownership. |
| certificate.issued | Certificate is issued successfully. | Employee, HR/Manager if relevant. |
| certificate.expiring | Certificate is near expiry. | Employee and HR/Manager. |
| task.assigned | Manager assigns WMS-lite practical task. | Employee. |
| task.submitted | Employee submits task evidence. | Manager/Trainer evaluator. |
| task.evaluated | Manager evaluates task. | Employee and HR if high impact. |
| training.risk.high | Training risk score crosses configured threshold. | Employee and responsible Manager. |

**SignalR rule:** SignalR is for notification delivery, not for core business transaction correctness. The database must remain the source of truth.

# 14\. AI, Scoring and Rule-Based Logic Convention

Core scoring in DigiTalent AI must remain explainable and testable. LLM features are support tools for suggestions and explanations, not final authority.

| **Feature** | **MVP Implementation** | **Code Ownership Rule** |
| --- | --- | --- |
| Skill Gap Analysis | Rule-based comparison: required level minus current level. | Implemented in deterministic service with unit tests. |
| Learning Recommendation | Rule-based mapping from skill gaps to courses and learning paths. | Recommendation reason must be saved or returned. |
| Training Risk Score | Weighted formula based on progress, low scores, failed attempts, inactivity and deadlines. | Weights must come from configuration, not hard-code. |
| Workforce Readiness Score | Weighted formula combining competency, certificate, progress, compliance and task performance. | Store score snapshot for audit/reporting. |
| AI Question Draft | LLM generates draft questions for Trainer review. | Never publish directly without human review. |
| AI Task Suggestion | LLM suggests task ideas and criteria based on skill gap/course. | Manager edits and approves before assignment. |

ReadinessScore =  
CompetencyScore \* 0.35  
\+ CertificateScore \* 0.20  
\+ LearningProgressScore \* 0.15  
\+ ComplianceScore \* 0.15  
\+ WorkTaskPerformanceScore \* 0.15  

| **AI Log Field** | **Reason** |
| --- | --- |
| feature\_name | Identify which AI/scoring feature produced the result. |
| input\_snapshot | Support explainability and debugging. |
| output\_text | Store generated explanation/suggestion when needed. |
| model\_name | Track provider/model for reproducibility. |
| review\_status | Pending, approved, rejected when human review is required. |
| created\_by / created\_at | Audit who requested the AI output and when. |

# 15\. Logging, Audit and Observability

| **Type** | **Examples** | **Storage** |
| --- | --- | --- |
| Application log | API error, external service timeout, failed PDF generation. | Structured logs / console / file depending on environment. |
| Audit log | User role changed, certificate revoked, task evaluated, competency updated. | PostgreSQL audit\_logs table. |
| Business event | Course assigned, certificate issued, risk score high. | Notification/events table if needed. |
| Security event | Failed login, refresh token reuse, forbidden access attempt. | Security log + audit log when relevant. |

| **Do Log** | **Do Not Log** |
| --- | --- |
| Request ID, user ID, action name, resource ID, status code, exception type. | Password, raw JWT, refresh token, secret keys, full personal profile when not needed. |
| Certificate code action, task evaluation action, permission denial reason. | Uploaded file content, raw AI prompt containing sensitive data unless intentionally logged with masking. |

# 16\. Testing Guideline

| **Test Type** | **What to Cover** | **Priority** |
| --- | --- | --- |
| Unit test | Scoring formulas, validation rules, service logic, permission helper, state transition. | High |
| Integration test | Login, course assignment, assessment submit, certificate issue, task evaluation. | High |
| API contract test | Request/response format, error format, status codes. | Medium |
| Frontend component test | Complex forms, permission-based action visibility, status chips. | Medium |
| Manual QA | End-to-end demo flow and role-based screens. | High |
| Security test | Unauthorized/forbidden access, department scope, employee-own-resource access. | High |

| **Module** | **Must-Have Tests** |
| --- | --- |
| Auth/RBAC | Login success/failure, expired token, forbidden action, department-scope denial. |
| Assessment | Score calculation, pass/fail, multiple attempts, invalid answer format. |
| Certificate | Issue only when conditions met, verify by code, revoked/expired not valid. |
| Task | Employee submit own task, Manager evaluate department task, cannot evaluate pending task. |
| Intelligence | Skill gap formula, risk thresholds, readiness formula, config-driven weights. |

# 17\. Git Workflow and Pull Request Standard

| **Branch Type** | **Naming Pattern** | **Example** |
| --- | --- | --- |
| Main branch | main | main |
| Integration branch | develop | develop |
| Feature branch | feature/{module}-{short-description} | feature/certificate-qr-verification |
| Bug fix branch | fix/{module}-{short-description} | fix/auth-refresh-token-expiry |
| Documentation branch | docs/{topic} | docs/api-spec-update |
| Hotfix branch | hotfix/{issue} | hotfix/login-production-error |

| **Commit Type** | **Meaning** | **Example** |
| --- | --- | --- |
| feat | New feature | feat(course): implement course assignment API |
| fix | Bug fix | fix(auth): handle expired refresh token |
| refactor | Improve structure without behavior change | refactor(task): split evaluation service |
| docs | Documentation only | docs(rbac): update permission matrix |
| test | Add/update tests | test(certificate): add verification test cases |
| chore | Build/config/maintenance | chore(ci): add backend pipeline |

**PR rule:** A pull request should solve one logical task. Do not mix unrelated database migrations, UI changes, API changes and formatting-only changes in the same PR.

# 18\. Environment, Docker and CI/CD Convention

| **Environment** | **Purpose** | **Data Rule** |
| --- | --- | --- |
| local | Developer machine with Docker Compose dependencies. | May use seed demo data. Never use real personal data. |
| dev | Shared integration environment for team testing. | Resettable seed data, used for PR verification. |
| staging | Pre-demo/pre-defense environment. | Stable demo data, close to production config. |
| production/demo | Final deployment or defense demo. | Backed up, protected, no experimental migrations. |

\# Backend  
ASPNETCORE\_ENVIRONMENT=Development  
ConnectionStrings\_\_DefaultConnection=Host=postgres;Port=5432;Database=digitalent;Username=app;Password=\*\*\*  
Jwt\_\_Issuer=DigiTalentAI  
Jwt\_\_Audience=DigiTalentAIWeb  
Minio\_\_Endpoint=minio:9000  
Minio\_\_AccessKey=\*\*\*  
Minio\_\_SecretKey=\*\*\*  
  
\# Frontend  
VITE\_API\_BASE\_URL=http://localhost:8080/api/v1  
VITE\_SIGNALR\_HUB\_URL=http://localhost:8080/hubs/notifications  

| **CI Step** | **Required Check** |
| --- | --- |
| Backend restore/build | dotnet restore and dotnet build must pass. |
| Backend tests | Unit tests must pass before merge. Integration tests are added progressively. |
| Frontend install/build | npm ci and npm run build must pass. |
| Lint/type check | TypeScript check and lint should run in CI. |
| Docker build | At least backend and frontend images should be buildable before demo. |

# 19\. Code Review Checklist

| **Checklist Area** | **Questions Reviewer Must Ask** |
| --- | --- |
| Business correctness | Does this code implement the approved use case and business rule? |
| Permission | Does the API check permission and data scope? |
| Validation | Are invalid inputs and state transitions handled? |
| Database | Are migrations safe, reviewed and consistent with naming conventions? |
| API contract | Does request/response follow API specification and Swagger? |
| Frontend UX | Does the screen follow UI/UX specification, loading state, empty state and errors? |
| Testing | Are important service logic and edge cases tested? |
| Security | No secrets, no sensitive logs, no client-only security assumption? |
| Maintainability | Clear naming, small functions, no hard-code, no duplicated business logic? |

# 20\. Definition of Ready and Definition of Done

## 20.1 Definition of Ready

*   Use case or user story is clearly described.
*   Acceptance criteria are written and testable.
*   Required API contract or DTO is agreed if the task crosses frontend/backend.
*   Database impact is known if schema changes are needed.
*   Permission/data scope rule is identified.
*   UI state and edge cases are clear for frontend tasks.

## 20.2 Definition of Done

*   Code compiles and passes local checks.
*   Feature follows naming and folder conventions.
*   API is protected and documented in Swagger when applicable.
*   Database migration is reviewed and does not break seed data.
*   Important business logic has tests or clear manual test evidence.
*   UI has loading, empty, error and success states.
*   PR is reviewed and merged according to branch policy.

# 21\. Anti-patterns and Risk Controls

| **Anti-pattern** | **Why It Is Dangerous** | **Correct Approach** |
| --- | --- | --- |
| Role-only security | Department Manager may access data outside department. | Use permission + data scope checks. |
| Hard-coded scoring weights | Difficult to tune and defend during evaluation. | Store weights in configuration or scoring rules table. |
| Returning EF entities to frontend | Leaks schema and causes serialization issues. | Use DTO responses. |
| Business logic in React | Backend and dashboard data become inconsistent. | Backend computes authoritative results; frontend displays. |
| One giant service class | Difficult to test and maintain. | Split by use case or module service. |
| AI directly changing data | Unsafe and hard to explain. | AI suggests; human or rule approves. |
| Deleting audit-sensitive data | Loses evidence for certificate/task/competency decisions. | Use status, soft delete and audit logs. |
| Large mixed PR | Hard to review and likely to introduce bugs. | Small feature-focused PRs. |

# 22\. Implementation Roadmap for Applying This Guideline

| **Phase** | **Development Standard Focus** |
| --- | --- |
| Phase 1 - Project bootstrap | Create mono-repo, backend solution, frontend app, Docker Compose, CI skeleton and shared coding convention. |
| Phase 2 - Auth and RBAC | Implement JWT, refresh token, roles, permissions, route guards and policy-based authorization. |
| Phase 3 - Core master data | Implement departments, job positions, employees, competency framework and position requirements. |
| Phase 4 - Learning and assessment | Implement course, lesson, material upload, enrollment, progress, question bank and scoring. |
| Phase 5 - Certificate and task evidence | Implement certificate QR verification, WMS-lite task, submission, evaluation and evidence portfolio. |
| Phase 6 - Intelligence and dashboard | Implement skill gap, recommendation, risk, readiness and dashboards. |
| Phase 7 - Bonus AI and hardening | Add AI question/task suggestion, explanation logs, stronger tests and deployment polishing. |

# Appendix A. Naming Cheat Sheet

| **Area** | **Good Example** | **Bad Example** |
| --- | --- | --- |
| Backend service | CertificateIssueService | CertSvc, HandleStuffService |
| Backend DTO | EvaluateTaskRequest | TaskDto2, DataInput |
| API route | /api/v1/certificates/{id}/revoke | /api/revokeCert |
| React page | CertificateVerificationPage | page1, Verify |
| React hook | useAssignedCourses | getDataHook |
| DB table | task\_evaluations | TaskEval, tbl\_task\_eval |
| Branch | feature/task-evaluation | linh-code-new |
| Commit | feat(task): add evaluation API | update code |

# Appendix B. Pull Request Template

\## Summary  
\- What feature/fix does this PR implement?  
  
\## Related Task / Use Case  
\- UC-XX: ...  
  
\## Changes  
\- Backend:  
\- Frontend:  
\- Database:  
\- Docs:  
  
\## Permission / Security Impact  
\- Required permissions:  
\- Data scope rule:  
  
\## Test Evidence  
\- Unit tests:  
\- Manual test steps:  
\- Screenshots if UI changed:  
  
\## Checklist  
\- \[ \] Code follows naming and folder convention  
\- \[ \] No hard-coded secrets or credentials  
\- \[ \] API response follows standard format  
\- \[ \] Validation and error states handled  
\- \[ \] Permission and data scope checked  
\- \[ \] Migration reviewed if database changed  
\- \[ \] UI follows design specification  

# Appendix C. Commit Message Examples

feat(auth): implement login and refresh token API  
feat(competency): add position requirement mapping  
feat(course): implement course assignment workflow  
feat(certificate): add QR verification endpoint  
feat(task): add task submission and evaluation  
feat(intelligence): calculate workforce readiness score  
fix(rbac): restrict manager access to department employees  
fix(assessment): prevent submitting completed attempt twice  
docs(api): update certificate endpoint specification  
test(readiness): add readiness score formula unit tests  
chore(docker): add postgres and minio services  

# Final Development Recommendation

Before starting coding, the team should review this guideline together and convert it into repository rules, README setup, PR template, branch protection and seed development tasks. The most important rule is consistency: one predictable structure is better than many individual coding styles.