**DIGITAL TALENT AI**

**SOFTWARE REQUIREMENT SPECIFICATION (SRS)**

*Volume 2 - Data, API, Non-Functional, Security and Acceptance Requirements*



|**Field**|**Information**|
|:---|:---|
|Document Code|03B_SRS_Technical_NFR_DigiTalent_AI|
|Document Type|Software Requirement Specification (SRS)|
|Project|DigiTalent AI - Digital Competency Training, Internal Certification and Work-Based Assessment Platform|
|Technology Baseline|ReactJS, TypeScript, TailwindCSS, ShadCN/UI; ASP.NET Core/C#; PostgreSQL; MinIO; Redis optional; SignalR; Docker; Nginx; GitHub Actions|
|Version|1.0|
|Status|Draft for team review before implementation|
|Prepared For|Capstone Project Implementation|
|Scope Priority|Revised registered scope is the main MVP baseline; optional AI features are treated as bonus/future unless explicitly prioritized.|


*Important: This SRS translates business requirements into software requirements. It must be reviewed before ERD, API implementation, UI coding and testing. Any change after approval should be tracked through a requirement change log.*



# Document Control

|Version|Date|Author/Owner|Description|
|:---|:---|:---|:---|
|1.0|19/06/2026|Project Team / Technical Mentor Support|Initial Volume 2 SRS draft prepared from Project Overview, BRD, revised capstone registration and extended analysis documents.|


## Input Documents and Scope Priority

|**Priority**|**Document**|**Usage in this SRS**|
|:---|:---|:---|
|1|Capstone_Project_Register_DigiTalent_AI_Revised_Scope.docx|Main registered scope. Highest priority when deciding MVP scope and commitments.|
|2|02_BRD_Business_Requirement_DigiTalent_AI.docx|Business requirements, business rules, stakeholder goals and acceptance direction.|
|3|01_Project_Overview_DigiTalent_AI.docx|High-level product vision, system positioning, MVP boundary and demo direction.|
|4|De_tai_DigiTalent_AI_Mo_ta_cap_nhat_14_he_thong.docx|Extended analysis and optional/bonus ideas, used carefully to avoid scope creep.|
|5|Capstone_Project_Register_DigiTalent_AI.docx|Earlier broader scope, used only for context and bonus planning.|


## Requirement Language

|**Keyword**|**Meaning**|
|:---|:---|
|MUST|Required for MVP. Team should implement unless explicitly descoped and approved.|
|SHOULD|Strongly recommended for production quality; may be simplified if time is limited.|
|COULD|Optional/bonus enhancement after MVP is stable.|
|WON'T|Out of current MVP scope; may be future scope.|




# Table of Contents

|**Section**|**Title**|
|:---|:---|
|1|Purpose and Relationship with Volume 1|
|2|System Architecture Requirements|
|3|Conceptual Data Requirements|
|4|API Contract Requirements|
|5|User Interface and Screen Requirements|
|6|Scoring and Intelligence Requirements|
|7|Non-Functional Requirements|
|8|Security and Privacy Requirements|
|9|File Storage and Object Management Requirements|
|10|Notification and Background Job Requirements|
|11|Deployment, Environment and DevOps Requirements|
|12|Validation, Error Handling and Logging|
|13|Testing and Quality Acceptance Requirements|
|14|Traceability Matrix|
|15|Glossary|




# 1. Purpose and Relationship with Volume 1

This volume complements Volume 1. Volume 1 defines functional behavior by module. Volume 2 defines supporting requirements for architecture, data, API, UI, non-functional quality, security, deployment and acceptance. Developers should not start implementation only from this volume; both volumes must be read together.

# 2. System Architecture Requirements

|**Layer**|**Requirement**|
|:---|:---|
|Frontend|ReactJS + TypeScript + TailwindCSS + ShadCN/UI. Must implement role-based navigation, form validation, API service layer and reusable enterprise dashboard components.|
|Backend|ASP.NET Core/C# Web API. Should follow layered or clean architecture style: API Controllers -> Application Services -> Domain/Business Logic -> Infrastructure/Data Access.|
|Database|PostgreSQL for relational data, transactions, reporting queries and auditability. EF Core recommended for migrations and ORM.|
|File Storage|MinIO or S3-compatible object storage for lesson materials, task submissions and certificate PDFs. Database stores metadata and object keys, not large binary files.|
|Cache / Jobs|Redis optional for dashboard cache, notification queues, refresh token/session strategy or background jobs if needed.|
|Realtime|SignalR optional/recommended for in-app notification. Polling fallback is acceptable for MVP if realtime delays schedule.|
|Reverse Proxy|Nginx for routing frontend/backend and serving HTTPS in deployment environment.|
|CI/CD|GitHub Actions for build/test pipeline and Docker image/deploy preparation.|


## 2.1 Recommended Backend Project Structure

|**Project/Folder**|**Purpose**|
|:---|:---|
|DigiTalent.Api|Controllers, middleware, auth filters, Swagger/OpenAPI configuration.|
|DigiTalent.Application|DTOs, validators, services, use-case orchestration, interfaces.|
|DigiTalent.Domain|Entities, enums, business rules, domain services if needed.|
|DigiTalent.Infrastructure|EF Core DbContext, repositories, MinIO client, Redis, email/notification providers, external AI providers.|
|DigiTalent.Tests|Unit tests and integration tests for core services and APIs.|


# 3. Conceptual Data Requirements

This SRS does not replace the ERD document, but it defines required data groups and entities so the ERD can be created consistently. All important entities should include created_at, updated_at, created_by, updated_by where applicable. Sensitive operations should also produce audit logs.

|**Data Group**|**Key Entities**|**Purpose**|
|:---|:---|:---|
|Auth & RBAC|users, roles, permissions, user_roles, role_permissions, refresh_tokens, login_audit_logs|Supports secure access, protected APIs and role-based UI.|
|Organization|departments, job_positions, employees, manager_assignments|Defines enterprise structure and user scope.|
|Competency|competency_categories, competencies, competency_levels, position_competency_requirements, employee_competency_profiles, competency_evidences|Defines required and actual capability.|
|Learning|courses, course_modules, lessons, learning_materials, course_competencies, enrollments, lesson_progress|Supports internal training content and progress.|
|Assessment|question_banks, questions, question_options, assessments, assessment_questions, assessment_attempts, assessment_answers|Supports quiz/final assessment and scoring.|
|Certificate|certificate_templates, certificates, certificate_verification_logs|Supports QR verification and certificate lifecycle.|
|WMS-lite Task|practical_tasks, task_assignments, task_submissions, task_evaluations|Supports post-training practice and work-based evidence.|
|Intelligence|skill_gap_results, learning_recommendations, training_risk_scores, readiness_scores, ai_explanation_logs, scoring_config|Supports explainable scoring and recommendation.|
|Notification/Audit|notifications, notification_recipients, audit_logs, system_settings|Supports governance, reminders and traceability.|


## 3.1 Critical Data Integrity Rules

|**Rule ID**|**Data Requirement**|
|:---|:---|
|DR-01|Employee must be linked to a user account if the employee needs to login.|
|DR-02|Course cannot be published without at least one mapped competency.|
|DR-03|Job position requirement cannot be active if it has no required competencies.|
|DR-04|Assessment attempt must not expose correct answers before submission.|
|DR-05|Certificate code must be globally unique and immutable after issue.|
|DR-06|Revoked/expired certificate must not count as valid evidence for certificate score.|
|DR-07|Task evidence can affect readiness only after valid evaluation by authorized evaluator.|
|DR-08|Score weights and thresholds must be configurable or centralized, not duplicated as hard-code.|
|DR-09|Soft delete/archive should be preferred for master data already used by historical records.|
|DR-10|Audit logs should preserve enough information to explain important changes.|


# 4. API Contract Requirements

The backend API should be RESTful, DTO-based and documented through Swagger/OpenAPI. API naming should be predictable, versionable and aligned with modules. The frontend must consume API through a centralized service layer rather than scattered fetch calls.

|**ID**|**API Requirement**|
|:---|:---|
|API-01|All protected endpoints MUST require access token and backend permission validation.|
|API-02|All list endpoints SHOULD support page, pageSize, sortBy, sortDirection and common filters.|
|API-03|All mutation endpoints SHOULD return a consistent response format with success/message/data/errors.|
|API-04|Validation errors MUST return field-level error details when possible.|
|API-05|Endpoints MUST not expose internal stack traces or sensitive data.|
|API-06|Swagger/OpenAPI MUST be available in development/staging environment.|
|API-07|Public certificate verification endpoint MUST return limited data only.|


## 4.1 Recommended API Endpoint Inventory

|**Module**|**Endpoint Candidates**|
|:---|:---|
|Auth|POST /api/auth/login; POST /api/auth/refresh-token; POST /api/auth/logout; GET /api/me; PUT /api/me/profile; PUT /api/me/password|
|RBAC|GET /api/roles; POST /api/roles; GET /api/permissions; PUT /api/roles/{id}/permissions; POST /api/users/{id}/roles|
|Organization|GET/POST /api/departments; PUT /api/departments/{id}; GET/POST /api/job-positions; PUT /api/job-positions/{id}; GET/POST /api/employees; PUT /api/employees/{id}|
|Competency|GET/POST /api/competency-categories; GET/POST /api/competencies; GET/POST /api/competency-levels; POST /api/job-positions/{id}/competency-requirements; GET /api/employees/{id}/competency-profile|
|Courses|GET/POST /api/courses; PUT /api/courses/{id}; POST /api/courses/{id}/publish; POST /api/courses/{id}/modules; POST /api/courses/{id}/lessons; POST /api/courses/{id}/competencies; POST /api/courses/{id}/assignments|
|Learning|GET /api/my/learning; GET /api/my/courses/{id}; POST /api/lessons/{id}/complete; GET /api/enrollments/{id}/progress|
|Assessment|GET/POST /api/question-banks; GET/POST /api/questions; GET/POST /api/assessments; POST /api/assessments/{id}/attempts; POST /api/assessment-attempts/{id}/submit|
|Certificate|POST /api/certificates/issue; GET /api/certificates; GET /api/my/certificates; POST /api/certificates/{id}/revoke; GET /api/certificates/verify/{code}|
|Intelligence|GET /api/employees/{id}/skill-gap; GET /api/employees/{id}/recommendations; GET /api/employees/{id}/risk-score; GET /api/employees/{id}/readiness-score; POST /api/intelligence/recalculate|
|WMS-lite|GET/POST /api/practical-tasks; POST /api/task-assignments; GET /api/my/tasks; POST /api/task-assignments/{id}/submit; POST /api/task-assignments/{id}/evaluate|
|Dashboard|GET /api/dashboard/hr; GET /api/dashboard/manager; GET /api/dashboard/trainer; GET /api/dashboard/employee|
|Notification/Audit|GET /api/notifications; POST /api/notifications/{id}/read; GET /api/audit-logs|


# 5. User Interface and Screen Requirements

|**Role**|**Required Screens**|
|:---|:---|
|System Admin|Login, Admin Dashboard, User Management, Role & Permission, System Settings, Audit Log.|
|HR / Training Manager|HR Dashboard, Department Management, Job Position Management, Employee Management, Competency Framework, Position Requirements, Course Assignment, Certificate Tracking, Workforce Readiness, Training Risk List.|
|Department Manager|Manager Dashboard, Team Employee List, Team Skill Gap, Practical Task Management, Task Evaluation, Team Readiness.|
|Internal Trainer|Trainer Dashboard, Course Management, Lesson Management, Material Upload, Question Bank, Assessment Management, AI Question Draft Review optional.|
|Employee|My Dashboard, My Learning, Course Detail, Lesson Viewer, Quiz/Assessment, My Certificates, My Tasks, My Competency Profile, Evidence Portfolio.|
|Certificate Verifier|Certificate Verification Page, Verification Result Page.|


## 5.1 UI Quality Requirements

|**ID**|**UI Requirement**|
|:---|:---|
|UI-01|UI MUST use consistent enterprise layout: sidebar, topbar, content area, table/list detail pages.|
|UI-02|UI MUST show loading, empty, error and permission denied states.|
|UI-03|Forms MUST provide client-side validation but backend remains source of truth.|
|UI-04|Tables SHOULD support search/filter/pagination and clear status badges.|
|UI-05|Dashboard charts SHOULD explain meaning; avoid decorative chart without business action.|
|UI-06|Sensitive action such as revoke certificate or evaluate task MUST require confirmation dialog.|


# 6. Scoring and Intelligence Requirements

|**Metric**|**Required Formula / Rule**|
|:---|:---|
|Skill Gap|Skill Gap = Required Competency Level - Current Competency Level. If result <= 0, competency is considered met.|
|Learning Recommendation|Recommendation priority should consider gap severity, mandatory flag, competency weight, course-competency mapping, course level and previous result.|
|Training Risk Score|Risk Score = Inactivity Score * 0.25 + Low Score Rate * 0.30 + Deadline Pressure * 0.20 + Failed Attempt Rate * 0.15 + Progress Delay * 0.10.|
|Workforce Readiness Score|Readiness Score = Competency Score * 0.35 + Certificate Score * 0.20 + Learning Progress Score * 0.15 + Compliance Score * 0.15 + Work Task Performance Score * 0.15.|
|Learning Improvement Rate|Improvement Rate = (Post Assessment Score - Pre Assessment Score) / Pre Assessment Score * 100. Handle pre score = 0 safely.|
|Career Readiness Optional|Readiness % = Achieved Required Competency Weight / Total Required Competency Weight * 100.|


## 6.1 Explainability Requirements

|**ID**|**Requirement**|
|:---|:---|
|EXPL-01|Every skill gap result MUST show required level, current level and gap.|
|EXPL-02|Every training risk score MUST show factor breakdown and main reasons.|
|EXPL-03|Every readiness score MUST show component scores and weights.|
|EXPL-04|Any LLM-generated suggestion MUST be marked as suggestion and require human review if it affects official data.|
|EXPL-05|AI explanation logs SHOULD store prompt template, input snapshot, output summary and reviewer status when applicable.|


# 7. Non-Functional Requirements

|**ID**|**Category**|**Requirement**|
|:---|:---|:---|
|NFR-PERF-01|Performance|Common list/detail pages SHOULD respond within 2 seconds for normal capstone demo data; dashboard SHOULD respond within 5 seconds.|
|NFR-PERF-02|Performance|Backend MUST use pagination for large lists and avoid loading entire datasets into memory.|
|NFR-SEC-01|Security|Protected APIs MUST validate JWT and permission at backend.|
|NFR-SEC-02|Security|Password MUST be hashed; secrets MUST be stored in environment variables, not source code.|
|NFR-SEC-03|Security|Department-level data access MUST be enforced server-side.|
|NFR-REL-01|Reliability|Critical mutations such as certificate issue and assessment submit SHOULD be transaction-safe.|
|NFR-MAINT-01|Maintainability|Backend SHOULD separate controller, service, DTO, validation and data access concerns.|
|NFR-MAINT-02|Maintainability|Frontend SHOULD use reusable components, API service layer and typed models.|
|NFR-OBS-01|Observability|Application SHOULD log errors and important actions with correlation information where practical.|
|NFR-USAB-01|Usability|Role-based dashboard SHOULD guide users to next actions and not expose irrelevant menu items.|
|NFR-COMP-01|Compatibility|Application MUST run in modern Chrome/Edge browsers for demo.|
|NFR-BACKUP-01|Backup|Deployment guide SHOULD include database backup/restore and MinIO volume considerations.|


# 8. Security and Privacy Requirements

|**ID**|**Area**|**Requirement**|
|:---|:---|:---|
|SEC-01|Authentication|Use JWT access token and refresh token. Refresh tokens must be revocable.|
|SEC-02|Authorization|All sensitive endpoints must enforce role/permission. UI hiding alone is not sufficient.|
|SEC-03|Data Scope|Department Manager must not access employees outside assigned scope.|
|SEC-04|Certificate Privacy|Public verification page must not expose assessment score, full competency profile, phone, internal notes or task evidence.|
|SEC-05|File Upload|Validate file type, extension, size and ownership. Store file metadata in database and file object in MinIO.|
|SEC-06|Audit|Certificate revoke, competency update, task evaluation and permission change must be audit logged.|
|SEC-07|CORS|CORS must be configured for allowed frontend domains only in production.|
|SEC-08|Secrets|Database password, JWT secret, MinIO credentials and AI API keys must come from environment variables.|
|SEC-09|AI Data|Avoid sending unnecessary personal/sensitive data to LLM provider. Use minimal context and human review.|
|SEC-10|Error Disclosure|Do not return stack traces, SQL errors or internal object keys to users.|


# 9. File Storage and Object Management Requirements

|**ID**|**Requirement**|
|:---|:---|
|FILE-01|Lesson materials, task attachments and certificate PDFs SHOULD be stored in MinIO/object storage.|
|FILE-02|Database MUST store only metadata: file name, content type, size, object key, owner, module, created time.|
|FILE-03|File access MUST check permission before returning download URL or stream.|
|FILE-04|Certificate PDF SHOULD be immutable after issue; regenerate only through controlled process if needed.|
|FILE-05|Task attachment MUST remain linked to submission/evidence for audit.|


# 10. Notification and Background Job Requirements

|**ID**|**Requirement**|
|:---|:---|
|JOB-01|System SHOULD have a mechanism to detect overdue course/task and expiring certificate.|
|JOB-02|System SHOULD calculate/recalculate score through service methods that can be called by API or background job.|
|JOB-03|Notification SHOULD support in-app notification; SignalR can push realtime event if implemented.|
|JOB-04|If Redis/background jobs are not ready in MVP, scheduled/manual recalculation is acceptable but must be documented.|


# 11. Deployment, Environment and DevOps Requirements

|**ID**|**Requirement**|
|:---|:---|
|ENV-01|Repository SHOULD include .env.example for frontend, backend and docker-compose.|
|ENV-02|Docker Compose SHOULD define frontend, backend-api, postgres, minio, redis optional and nginx.|
|ENV-03|Database migrations MUST be documented and reproducible.|
|ENV-04|GitHub Actions SHOULD build frontend and backend, run tests and validate Docker build if possible.|
|ENV-05|Production deployment SHOULD use Nginx reverse proxy and HTTPS-ready configuration.|
|ENV-06|Deployment guide MUST explain seed data and demo account setup.|


# 12. Validation, Error Handling and Logging

|**ID**|**Requirement**|
|:---|:---|
|VAL-01|All create/update APIs MUST validate required fields, data type, status transition and business rules.|
|VAL-02|Duplicate code/name rules SHOULD be enforced for department code, employee code, course code, competency code and certificate code.|
|VAL-03|Invalid permission MUST return 403; unauthenticated request MUST return 401.|
|VAL-04|Not found resource MUST return 404 without leaking whether private data exists outside user scope.|
|VAL-05|Business rule violation SHOULD return 400 or 409 with clear message.|
|LOG-01|Unexpected errors MUST be logged server-side with enough context for debugging.|
|LOG-02|Logs MUST not contain passwords, tokens or secret keys.|


# 13. Testing and Quality Acceptance Requirements

|**ID**|**Testing Requirement**|
|:---|:---|
|TEST-01|Unit tests SHOULD cover scoring formulas: skill gap, risk, readiness.|
|TEST-02|Integration/API tests SHOULD cover login, RBAC, course assignment, assessment submit, certificate issue/verify, task evaluate.|
|TEST-03|Manual test checklist MUST cover each role dashboard and permission boundary.|
|TEST-04|Security test MUST verify Employee cannot edit own score/certificate/competency and Manager cannot access other department.|
|TEST-05|Demo test MUST run the full flow: position requirement -> skill gap -> course -> assessment -> certificate -> task -> evidence -> readiness dashboard.|
|TEST-06|File upload test MUST verify allowed type/size and permission-controlled download.|


# 14. Traceability Matrix

|**Business Capability**|**Requirement Modules**|**Related Use Cases**|**Acceptance Direction**|
|:---|:---|:---|:---|
|Organization Setup|ORG, COMP|UC-02 to UC-06|HR/Admin can define company structure and requirements.|
|Learning Flow|COURSE, ASSESS|UC-07 to UC-11|Employee can learn and be assessed.|
|Capability Analysis|INTEL, DASH|UC-12, UC-13, UC-17, UC-18|Skill gap, recommendation, risk and readiness are visible.|
|Certificate Flow|CERT|UC-15, UC-16|Certificate can be issued and verified with QR/code.|
|Work-Based Assessment|WMS, EVID|UC-19 to UC-24|Practical task creates competency evidence after evaluation.|
|Governance|AUTH, AUDIT, CONFIG|UC-01, UC-27|Role access and important changes are controlled and traceable.|


# 15. Glossary

|**Term**|**Definition**|
|:---|:---|
|Competency|A measurable capability required for a job position, such as Data Literacy or Cybersecurity Awareness.|
|Competency Level|A defined proficiency level for a competency, usually numeric 1-5 or named levels.|
|Skill Gap|Difference between required competency level and employee current level.|
|Learning Recommendation|Course or learning path suggested to close a skill gap.|
|Training Risk Score|Score estimating risk of failing/delaying training based on progress, score, inactivity and deadline.|
|Workforce Readiness Score|Composite score showing employee readiness using competency, certificate, learning, compliance and task performance.|
|Certificate Verification|Process of checking a certificate status through code or QR URL.|
|WMS-lite|Lightweight practical task workflow used only for post-training competency validation, not full project management.|
|Competency Evidence|Proof that supports an employee competency level, from assessment, certificate, task or manager review.|
|Human-in-the-loop|AI can suggest, but a responsible human reviews/approves important decisions.|


DigiTalent AI - SRS Volume 2 | Page