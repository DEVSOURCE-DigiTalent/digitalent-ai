DigiTalent AI - User Flow / Business Flow Document

\
\
**DigiTalent AI**\


**User Flow / Business Flow Document**\
Nền tảng đào tạo, đánh giá năng lực số và cấp chứng chỉ nội bộ kết hợp giao việc thực hành sau đào tạo

|**Document item**|**Value**|
| :-: | :-: |
|**Document code**|05\_USER\_FLOW\_BUSINESS\_FLOW\_DIGITALENT\_AI|
|**Version**|1\.0 - Development Baseline|
|**Status**|Draft for mentor/team review before detailed database/API implementation|
|**Prepared for**|DigiTalent AI Capstone Project - Software Engineering|
|**Technology baseline**|ReactJS, TypeScript, TailwindCSS, ShadCN/UI, ASP.NET Core/C#, PostgreSQL, MinIO, Redis optional, SignalR, Docker, Nginx, GitHub Actions|
|**Date**|19/06/2026|

|<p>**Document objective**</p><p>Tài liệu này chuẩn hóa các luồng người dùng và luồng nghiệp vụ chính trước khi team bước vào thiết kế database, API và UI. Mục tiêu là giúp toàn đội hiểu đúng thứ tự xử lý, actor chịu trách nhiệm, dữ liệu được tạo/cập nhật ở từng bước, trạng thái nghiệp vụ và các điểm kiểm soát quan trọng.</p>|
| :- |

# **Revision History**

|**Version**|**Date**|**Author / Owner**|**Change summary**|
| :-: | :-: | :-: | :-: |
|1\.0|19/06/2026|Project Team / Technical Mentor|Initial baseline document for user flow and business flow design.|

# **Table of Contents**
1\. Purpose and Scope

2\. Methodology and Flow Notation

3\. Actor Map and Responsibility Boundaries

4\. High-Level Business Value Chain

5\. Business Process Architecture

6\. Role-Based User Navigation Flow

7\. Detailed Business Flows F01-F23

8\. State Transition Models

9\. Screen and API Touchpoint Matrix

10\. Cross-Flow Business Rules

11\. Operational Risks and Controls

12\. End-to-End Demo Flow

13\. Implementation Readiness Checklist

14\. Appendix: Mermaid Sources
# **1. Purpose and Scope**
This document defines the user flows and business flows for DigiTalent AI. It translates the business vision, BRD, SRS and use case specification into practical end-to-end workflows that can be used by frontend developers, backend developers, database designers, testers and demo presenters.
## **1.1 Objectives**
- Clarify how each actor interacts with the system from login to dashboard usage.
- Define the full capability development lifecycle: organization setup -> competency requirement -> learning -> assessment -> certificate -> practical task -> evidence -> readiness dashboard.
- Identify what data is created, updated or validated at each step.
- Prevent implementation ambiguity before coding API, database schema and UI screens.
- Separate MVP flows from optional/bonus flows to control project scope.
## **1.2 Scope Covered**

|**Area**|**Included in this document**|**Notes for implementation**|
| :-: | :-: | :-: |
|**Authentication and RBAC**|Yes|Covers login, role-based redirection, permission checks and audit tracking.|
|**Organization and employee setup**|Yes|Covers department, position, employee and manager assignment flows.|
|**Competency management**|Yes|Covers competency categories, levels, position requirements and employee competency profile.|
|**Learning and assessment**|Yes|Covers course authoring, course assignment, learning progress, quiz/final assessment and scoring.|
|**Certificate QR verification**|Yes|Covers issuance, verification, expiry, revocation and verification logging.|
|**Capability intelligence**|Yes|Covers rule-based skill gap, recommendation, training risk and readiness score.|
|**WMS-lite task evidence**|Yes|Covers task suggestion/assignment, submission, evaluation, evidence and competency impact.|
|**AI learning assistant / semantic knowledge search**|Future only|Mentioned as future extension; not part of MVP critical path.|

## **1.3 Out-of-Scope for This Flow Document**
- Detailed database schema, indexes and migration scripts. These belong to the Database Design / ERD document.
- Full API request/response payloads. This document only lists API touchpoints and service responsibilities.
- Detailed UI wireframe pixel design. This document lists navigation and required screens; UI layout will be handled in the UI/UX Specification.
- Full HRM, payroll, attendance, meeting management, project management or Jira/Trello clone features.
- Complex microservices choreography. MVP is assumed to follow a modular monolith backend with clear domains.
# **2. Methodology and Flow Notation**
The document uses a practical business analysis format. Each flow is written from the user perspective, then mapped to system behavior, data status changes and implementation notes. This makes it useful for both technical implementation and mentor review.

|**Notation / Term**|**Meaning**|
| :-: | :-: |
|**Actor**|Human role or system component initiating or performing an action.|
|**Trigger**|Event or condition that starts a flow.|
|**Precondition**|Required state before the flow is allowed to start.|
|**Main flow**|Normal successful path from start to completion.|
|**Alternative flow**|Valid variation of the main flow, such as draft save, reassignment or retake.|
|**Exception flow**|Invalid, failed or blocked path that the system must handle safely.|
|**Data / Status update**|Database state change caused by a step.|
|**Business control**|Rule, permission, audit or validation that protects process correctness.|

|<p>**Core modeling principle**</p><p>Every important flow must answer four questions: who performs the action, why the action exists, what the system changes, and how the next process step is unlocked.</p>|
| :- |

# **3. Actor Map and Responsibility Boundaries**

|**Actor**|**Main responsibility**|**Data visibility boundary**|**Key flow ownership**|
| :-: | :-: | :-: | :-: |
|**System Admin**|Operate user accounts, roles, permissions, master data, configuration and audit logs.|System-wide technical and master data access.|F01, F02, F22|
|**HR / Training Manager**|Plan training, manage employees, competency framework, course assignment, certificate monitoring and company-wide analytics.|Company-wide training, competency, certificate and dashboard data.|F02, F03, F04, F07, F12, F19|
|**Department Manager**|Monitor employees in assigned department, review skill gaps, assign practical tasks and evaluate work evidence.|Department-level employees only.|F12, F15, F16, F18, F19|
|**Internal Trainer**|Create courses, lessons, learning materials, question banks, assessments and optional AI question drafts.|Learning content and assessment results for assigned courses.|F05, F06, F09|
|**Employee**|Learn assigned courses, complete assessments, receive certificates and submit practical tasks.|Own learning, assessment, certificate, task and competency profile.|F08, F09, F13, F16|
|**Certificate Verifier**|Verify certificate validity by code or QR URL.|Certificate verification result only; no sensitive internal profile access.|F13|
|**System / Scheduler**|Calculate risk/readiness scores, trigger reminders, update expired certificates and generate notifications.|Automated background access controlled by service rules.|F12, F14, F18, F20|

# **4. High-Level Business Value Chain**

|<p>**Main value chain**</p><p>Enterprise structure -> Job position -> Competency requirement -> Course and assessment -> Learning progress -> Assessment result -> Skill gap analysis -> Learning recommendation -> Certificate QR -> Practical task -> Manager evaluation -> Competency evidence -> Readiness dashboard -> HR/Manager decision.</p>|
| :- |

|**Stage**|**Business question answered**|**Primary owner**|**Main output**|
| :-: | :-: | :-: | :-: |
|**1. Organization setup**|Who belongs to which department and position?|Admin / HR|Departments, job positions, employee profiles, managers.|
|**2. Competency framework**|What digital capabilities are required?|HR|Competency categories, levels and position requirements.|
|**3. Learning design**|Which course can develop which competency?|Trainer / HR|Course, lesson, materials, question bank and assessment mapping.|
|**4. Assignment and learning**|Who needs to learn what and by when?|HR / Manager / Employee|Enrollment, progress, quiz attempts, learning completion.|
|**5. Assessment and certificate**|Has the employee achieved the required learning outcome?|System / Trainer|Scores, pass/fail result, certificate PDF, QR verification URL.|
|**6. Work-based validation**|Can the employee apply knowledge in practical work?|Manager / Employee|Task submission, score, feedback and competency evidence.|
|**7. Analytics and decision support**|Who is ready, at risk, missing skills or needs action?|HR / Manager / System|Skill gap, recommendation, risk, readiness, dashboard and notifications.|

# **5. Business Process Architecture**

|**Process group**|**Contained flows**|**Reason for grouping**|
| :-: | :-: | :-: |
|**A. Governance and master data**|F01-F04, F22|Defines who can access the system and what organizational structure the rest of the workflows depend on.|
|**B. Learning and assessment**|F05-F09|Creates learning content, assigns it to employees and records learning outcomes.|
|**C. Intelligence and decision support**|F10-F12, F18-F21|Transforms operational data into skill gaps, recommendations, risk, readiness and career insights.|
|**D. Certificate and evidence**|F13-F17|Converts learning results and practical task outcomes into verifiable records and competency evidence.|
|**E. Notification and operation**|F20, F22|Keeps users informed and preserves auditability across important actions.|

# **6. Role-Based User Navigation Flow**
This section defines what each user should see after login and how they move through the system. It should be used by the frontend team to design sidebar menu, route guards and role-based dashboard redirection.

|**Role**|**Login landing page**|**Primary navigation path**|**Important restrictions**|
| :-: | :-: | :-: | :-: |
|**System Admin**|Admin Dashboard|User Management -> Role/Permission -> System Settings -> Audit Logs|No direct learning action unless assigned another role.|
|**HR / Training Manager**|HR Dashboard|Organization -> Competency Framework -> Course Assignment -> Certificates -> Analytics|Can view company-wide capability data but should not edit assessment answers.|
|**Department Manager**|Manager Dashboard|Team Progress -> Skill Gap -> Practical Tasks -> Task Evaluation -> Team Readiness|Only employees under managed department or direct reports.|
|**Internal Trainer**|Trainer Dashboard|Course Builder -> Lesson Editor -> Material Upload -> Question Bank -> Assessment Builder|Cannot change employee competency level directly unless evidence workflow allows it.|
|**Employee**|Employee Dashboard|My Courses -> Lesson Viewer -> Quiz/Assessment -> My Certificates -> My Tasks -> My Competency Profile|Can only access own learning, certificate and task data.|
|**Certificate Verifier**|Certificate Verification Page|Enter code / scan QR -> View certificate status|Only sees minimal certificate validity data.|

# **7. Detailed Business Flows**
The following flows describe the expected system behavior at implementation level. They are intentionally detailed because this document will become a baseline for API, database, UI and testing work.
## **F01. Authentication and Role-Based Access Flow**

|**Business purpose**|Ensure only authenticated users access the system and every user is redirected to the correct role-based dashboard.|
| :- | :- |
|**Primary actors**|All users, System Admin, Backend Auth Service|
|**Trigger**|User opens the DigiTalent AI web application and submits login credentials.|
|**Preconditions**|User account exists, is active and has at least one role assigned.|

**Main flow**

|**Step**|**Actor / Role**|**User action**|**System behavior**|**Data / Status update**|
| :-: | :-: | :-: | :-: | :-: |
|**1**|User|Open login page.|Render login form and validate route is public.|No data change.|
|**2**|User|Enter email and password.|Validate required fields and submit credentials to API.|Login attempt created in audit context.|
|**3**|Auth Service|Authenticate credentials.|Verify password hash, account status and role assignment.|Generate access token and refresh token if valid.|
|**4**|System|Load profile and permissions.|Return user profile, roles and allowed permissions.|Session state stored on client; refresh token stored securely server-side.|
|**5**|Frontend|Redirect after login.|Route user to dashboard matching highest priority role or selected role.|User enters authorized area.|
|**6**|System|Record successful login.|Create audit log with timestamp, user id and login result.|Audit log inserted.|

**Alternative and exception flows**

|**Case**|**Condition**|**Expected handling**|
| :-: | :-: | :-: |
|**Invalid credentials**|Email/password does not match.|Return generic login error; do not reveal whether email exists.|
|**Inactive account**|Account status is inactive/archived.|Block login and display contact-admin message.|
|**Multiple roles**|User has more than one role.|Allow role selection or route by configured role priority.|

**Business controls and validation rules**

- JWT access token must expire within a controlled time window.
- Refresh token must be revocable and rotated if implemented.
- Every protected route must check permission, not only role name.
- Failed login attempts should be logged for security review.

**Outputs**

- Authenticated session.
- Role-based dashboard routing.
- Audit log for login success/failure.

|<p>**Implementation note**</p><p>Frontend should use route guards and permission hooks. Backend should centralize authorization policies in ASP.NET Core rather than scattering manual checks in controllers.</p>|
| :- |

## **F02. Organization and Employee Setup Flow**

|**Business purpose**|Create the enterprise structure required before assigning competencies, courses and tasks.|
| :- | :- |
|**Primary actors**|System Admin, HR / Training Manager|
|**Trigger**|HR starts initial system setup or updates organization data.|
|**Preconditions**|Admin/HR has permission to manage organization master data.|

**Main flow**

|**Step**|**Actor / Role**|**User action**|**System behavior**|**Data / Status update**|
| :-: | :-: | :-: | :-: | :-: |
|**1**|HR/Admin|Create or update departments.|Validate unique department code/name and hierarchy if used.|Department saved as Active.|
|**2**|HR/Admin|Create job positions.|Validate position code, title and department association if applicable.|Job position saved as Active.|
|**3**|HR/Admin|Create employee profile.|Validate required identity fields, email uniqueness and employment status.|Employee profile created.|
|**4**|HR/Admin|Assign employee to department and position.|Check referenced department/position are active.|Employee department\_id and position\_id updated.|
|**5**|HR/Admin|Assign direct manager.|Validate manager has proper role or manager flag.|Manager relationship created.|
|**6**|System|Update visibility scopes.|Recalculate which managers can view which employees.|Department-level access boundary updated.|

**Alternative and exception flows**

|**Case**|**Condition**|**Expected handling**|
| :-: | :-: | :-: |
|**Transfer employee**|Employee moves to another department/position.|Update profile, keep historical evidence and recalculate required competencies.|
|**Archive employee**|Employee leaves organization.|Set employee status to archived; keep historical certificates and audit logs.|
|**Duplicate email**|Email already belongs to another active user.|Reject save and display validation error.|

**Business controls and validation rules**

- Do not hard delete employee records that are linked to certificates, assessment attempts or task evidence.
- Manager must not be able to view employees outside configured scope.
- Any transfer should trigger a new skill gap recalculation.

**Outputs**

- Valid organization structure.
- Employee profiles ready for competency requirement mapping and course assignment.

|<p>**Implementation note**</p><p>Employee and user may be separate concepts. A user account controls authentication, while employee profile stores business data such as department, position and manager.</p>|
| :- |

## **F03. Competency Framework Setup Flow**

|**Business purpose**|Define the digital competency model used to evaluate employees and map learning content.|
| :- | :- |
|**Primary actors**|HR / Training Manager, System Admin|
|**Trigger**|HR defines or updates competency framework.|
|**Preconditions**|Competency categories and levels have not been locked by an active governance rule, or HR has edit permission.|

**Main flow**

|**Step**|**Actor / Role**|**User action**|**System behavior**|**Data / Status update**|
| :-: | :-: | :-: | :-: | :-: |
|**1**|HR|Create competency category.|Validate category name/code uniqueness.|Category created.|
|**2**|HR|Create competency item.|Link competency to category; define description and status.|Competency created.|
|**3**|HR|Define competency levels.|Create level scale such as Level 1 to Level 5 with criteria.|Competency level definitions saved.|
|**4**|HR|Set evidence rules if needed.|Define acceptable evidence sources: assessment, certificate, task, manager review, manual.|Evidence policy saved.|
|**5**|System|Expose framework for mapping.|Enable competency selection in position, course and assessment screens.|Competency framework available.|

**Alternative and exception flows**

|**Case**|**Condition**|**Expected handling**|
| :-: | :-: | :-: |
|**Archive competency**|Competency is no longer used.|Mark inactive; keep historical evidence and scoring records.|
|**Rename competency**|Label changes but meaning stays same.|Update display name; keep same competency id.|
|**Level definition change**|Level criteria change after employees have evidence.|Log change and consider recalculation policy.|

**Business controls and validation rules**

- A competency should not be deleted if referenced by courses, position requirements or employee evidence.
- Each competency level must have clear achievement criteria.
- Competency names should be business-friendly, not technical database names.

**Outputs**

- Digital competency framework ready for position requirements and course mapping.

|<p>**Implementation note**</p><p>Competency level should be numeric for calculation but displayed with readable labels and criteria.</p>|
| :- |

## **F04. Position Requirement Mapping Flow**

|**Business purpose**|Define what competency level each job position requires so the system can calculate skill gaps and readiness.|
| :- | :- |
|**Primary actors**|HR / Training Manager|
|**Trigger**|HR configures job position requirements.|
|**Preconditions**|At least one active position and one active competency exist.|

**Main flow**

|**Step**|**Actor / Role**|**User action**|**System behavior**|**Data / Status update**|
| :-: | :-: | :-: | :-: | :-: |
|**1**|HR|Open job position detail.|Load current position and assigned competency requirements.|No data change.|
|**2**|HR|Add required competency.|Validate competency is active and not duplicated for same position.|Requirement draft added.|
|**3**|HR|Set required level, weight and mandatory flag.|Validate level range and weight total if configured.|Requirement parameters saved.|
|**4**|HR|Publish requirement set.|Check position has at least one requirement.|Position requirement version becomes active.|
|**5**|System|Recalculate impacted employees.|Find employees assigned to the position and enqueue skill gap/readiness recalculation.|Skill gap results become stale or recalculated.|

**Alternative and exception flows**

|**Case**|**Condition**|**Expected handling**|
| :-: | :-: | :-: |
|**Draft mode**|HR is not ready to publish.|Save requirement as draft; do not affect employee calculations.|
|**Requirement versioning**|Requirement changes after employees already have scores.|Create new version and keep historical comparison if feasible.|
|**Invalid weight**|Total weights exceed allowed threshold.|Block publishing until fixed.|

**Business controls and validation rules**

- Each job position must have at least one required competency.
- Required level must be within defined competency level scale.
- Published requirement changes should be audited because they affect readiness score.

**Outputs**

- Active position competency requirements.
- Impacted employee skill gap results ready for dashboard and recommendation.

|<p>**Implementation note**</p><p>Use requirement versioning if time allows. MVP can keep current active version but must still audit changes.</p>|
| :- |

## **F05. Course, Lesson and Material Authoring Flow**

|**Business purpose**|Allow trainers to create learning content and map courses to competencies.|
| :- | :- |
|**Primary actors**|Internal Trainer, HR / Training Manager|
|**Trigger**|Trainer creates or updates a course.|
|**Preconditions**|Trainer has permission to manage courses; competencies exist for course mapping.|

**Main flow**

|**Step**|**Actor / Role**|**User action**|**System behavior**|**Data / Status update**|
| :-: | :-: | :-: | :-: | :-: |
|**1**|Trainer|Create course draft.|Validate title, code, description, duration and target audience.|Course created with Draft status.|
|**2**|Trainer|Add modules and lessons.|Validate lesson order and required fields.|Course structure saved.|
|**3**|Trainer|Upload materials or add video links.|Validate file type, size and storage permissions.|Material file saved to MinIO; metadata saved in DB.|
|**4**|Trainer/HR|Map course to competencies.|Validate active competencies and expected level improvement.|Course-competency mapping saved.|
|**5**|Trainer|Submit course for publish or publish directly.|Check minimum publish requirements.|Course status becomes Published.|

**Alternative and exception flows**

|**Case**|**Condition**|**Expected handling**|
| :-: | :-: | :-: |
|**Save draft**|Course is incomplete.|Allow draft save; prevent assignment until published.|
|**Material upload failed**|MinIO or file validation error.|Do not create broken material reference; show retry.|
|**Archive course**|Course no longer used.|Disable new assignments but keep learning history.|

**Business controls and validation rules**

- A course must link to at least one competency before it can be used for recommendation.
- Only published courses can be assigned to employees.
- File access must be permission-based; private materials should not be public URLs.

**Outputs**

- Published course with lessons, materials and competency mapping.

|<p>**Implementation note**</p><p>Store file metadata in the database and physical object in MinIO. Backend should generate signed or controlled download URLs.</p>|
| :- |

## **F06. Question Bank and Assessment Authoring Flow**

|**Business purpose**|Create quizzes and assessments to measure learning outcomes and support certificate conditions.|
| :- | :- |
|**Primary actors**|Internal Trainer, HR / Training Manager, Optional AI Service|
|**Trigger**|Trainer creates question bank or assessment.|
|**Preconditions**|Course and competencies exist; trainer has content management permission.|

**Main flow**

|**Step**|**Actor / Role**|**User action**|**System behavior**|**Data / Status update**|
| :-: | :-: | :-: | :-: | :-: |
|**1**|Trainer|Create question bank.|Validate topic, competency, level and difficulty fields.|Question bank created.|
|**2**|Trainer|Add questions and options.|Validate correct answer, score weight and question type.|Question saved as Draft/Active.|
|**3**|Trainer|Create assessment.|Define assessment type, pass score, attempt limit and time limit.|Assessment created.|
|**4**|Trainer|Attach questions to assessment.|Validate total score and required coverage.|Assessment-question mapping saved.|
|**5**|Trainer|Publish assessment.|Check minimum questions and scoring consistency.|Assessment becomes Published.|

**Alternative and exception flows**

|**Case**|**Condition**|**Expected handling**|
| :-: | :-: | :-: |
|**AI question draft**|Trainer requests draft questions.|AI creates draft only; trainer must review before publish.|
|**Question invalid**|Question lacks correct answer or score.|Prevent activation and show validation error.|
|**Assessment update after attempts**|Assessment already has submitted attempts.|Create new version or restrict edit to non-scoring metadata.|

**Business controls and validation rules**

- AI-generated questions must never be automatically published.
- Pass score and attempt limit must be visible before employee starts assessment.
- Submitted answers and scores must be immutable except through admin audit-controlled correction.

**Outputs**

- Published quiz/final assessment ready for course completion and certificate issuance rules.

|<p>**Implementation note**</p><p>MVP should support multiple-choice, true/false and scenario short text. Automatic grading for short text can be manual/optional.</p>|
| :- |

## **F07. Course Assignment and Enrollment Flow**

|**Business purpose**|Assign appropriate training to employees, departments or job positions and create trackable enrollments.|
| :- | :- |
|**Primary actors**|HR / Training Manager, Department Manager, System Recommendation Service|
|**Trigger**|HR or Manager assigns course manually, or accepts system recommendation.|
|**Preconditions**|Course is published; target employee/department/position is active.|

**Main flow**

|**Step**|**Actor / Role**|**User action**|**System behavior**|**Data / Status update**|
| :-: | :-: | :-: | :-: | :-: |
|**1**|HR/Manager|Select course to assign.|Load course details, competencies and completion requirements.|No data change.|
|**2**|HR/Manager|Select target employees, department or position.|Resolve target employees and remove duplicates.|Target list prepared.|
|**3**|HR/Manager|Set due date and assignment note.|Validate due date is in the future and not unreasonable.|Assignment parameters prepared.|
|**4**|System|Create enrollments.|Create one enrollment per target employee if not already active.|Enrollment status = Assigned.|
|**5**|System|Notify employees.|Create in-app notification and optional SignalR push.|Notification created.|

**Alternative and exception flows**

|**Case**|**Condition**|**Expected handling**|
| :-: | :-: | :-: |
|**Already enrolled**|Employee already has active enrollment for same course.|Skip duplicate or update due date based on policy.|
|**Manager limited scope**|Manager selects employee outside department.|Reject selection based on data visibility boundary.|
|**Bulk assignment**|Large target list.|Process in batch and display success/failure summary.|

**Business controls and validation rules**

- Only published courses can be assigned.
- Department Manager assignment is limited to own department/direct reports.
- All assignments should include created\_by and due\_date for risk calculation.

**Outputs**

- Course enrollments created.
- Employee notifications.
- Data available for progress tracking and training risk scoring.

|<p>**Implementation note**</p><p>Enrollment should be the core link between employee and course. Avoid using only course\_id on progress rows without an enrollment context.</p>|
| :- |

## **F08. Employee Learning Flow**

|**Business purpose**|Allow employees to consume assigned learning content and record learning progress.|
| :- | :- |
|**Primary actors**|Employee, Frontend Learning Portal, Learning Service|
|**Trigger**|Employee opens assigned course.|
|**Preconditions**|Employee has an active enrollment and course is available.|

**Main flow**

|**Step**|**Actor / Role**|**User action**|**System behavior**|**Data / Status update**|
| :-: | :-: | :-: | :-: | :-: |
|**1**|Employee|Open My Courses.|Load assigned, in-progress, completed and overdue enrollments.|No data change.|
|**2**|Employee|Open course detail.|Check enrollment access and load course structure.|Course viewed event can be logged.|
|**3**|Employee|Open lesson/material.|Verify permission and stream/download material.|Lesson progress started.|
|**4**|Employee|Mark lesson complete or reach completion condition.|Validate material activity if implemented.|Lesson progress = Completed.|
|**5**|System|Update enrollment progress.|Recalculate percentage based on completed lessons/quizzes.|Enrollment status = In Progress or Completed.|
|**6**|System|Unlock assessment when conditions are met.|Check course completion rules.|Assessment becomes available if conditions pass.|

**Alternative and exception flows**

|**Case**|**Condition**|**Expected handling**|
| :-: | :-: | :-: |
|**Course expired/archived**|Course was archived after assignment.|Allow completion if policy permits, or block and notify HR.|
|**Material unavailable**|File missing or MinIO error.|Show controlled error and log technical issue.|
|**Resume learning**|Employee returns later.|Continue from last incomplete lesson.|

**Business controls and validation rules**

- Employee can only access courses assigned to them.
- Progress updates must be idempotent to prevent duplicate completion records.
- Learning progress affects training risk and readiness calculations, so changes must be reliable.

**Outputs**

- Lesson progress records.
- Enrollment progress percentage.
- Assessment unlock status.

|<p>**Implementation note**</p><p>Frontend should support clear learning states: Not Started, In Progress, Completed, Overdue. Backend owns progress calculation.</p>|
| :- |

## **F09. Assessment Attempt and Scoring Flow**

|**Business purpose**|Measure learning outcomes through quizzes, final assessments or pre/post assessments.|
| :- | :- |
|**Primary actors**|Employee, Assessment Service, Internal Trainer|
|**Trigger**|Employee starts an available assessment.|
|**Preconditions**|Assessment is published; employee has access; attempt limit not exceeded.|

**Main flow**

|**Step**|**Actor / Role**|**User action**|**System behavior**|**Data / Status update**|
| :-: | :-: | :-: | :-: | :-: |
|**1**|Employee|Start assessment.|Check access, attempt limit and time limit.|Assessment attempt = Started.|
|**2**|Employee|Answer questions.|Save draft answers if autosave is supported.|Attempt answers stored.|
|**3**|Employee|Submit assessment.|Validate unanswered required questions and submit timestamp.|Attempt = Submitted.|
|**4**|System|Calculate score.|Grade auto-scorable questions and compute total percentage.|Attempt = Scored; score saved.|
|**5**|System|Determine pass/fail.|Compare score with pass threshold and course completion rules.|Result = Passed/Failed.|
|**6**|System|Update learning and competency signals.|Update enrollment completion, training risk and evidence candidates.|Progress/readiness recalculation may be triggered.|

**Alternative and exception flows**

|**Case**|**Condition**|**Expected handling**|
| :-: | :-: | :-: |
|**Time limit exceeded**|Employee does not submit before timeout.|Auto-submit or mark expired based on assessment policy.|
|**Manual review needed**|Question type requires trainer review.|Set result pending review until trainer scores it.|
|**Retake allowed**|Employee fails but attempts remain.|Allow retake; keep previous attempt history.|

**Business controls and validation rules**

- Assessment answers and scores must not be editable by employee after submission.
- Pass/fail threshold must come from configuration or assessment settings, not hard-coded.
- Attempt history must be kept for audit and training risk calculation.

**Outputs**

- Assessment attempt history.
- Score and pass/fail result.
- Potential certificate eligibility signal.

|<p>**Implementation note**</p><p>Scoring should be inside backend service and covered by unit tests. Avoid score calculation in frontend.</p>|
| :- |

## **F10. Skill Gap Analysis Flow**

|**Business purpose**|Compare employee current competency level against job position requirements to identify missing capability.|
| :- | :- |
|**Primary actors**|System Intelligence Service, HR, Manager, Employee|
|**Trigger**|Employee position changes, assessment result changes, evidence is confirmed, or HR requests recalculation.|
|**Preconditions**|Employee has position; position has required competencies; employee competency profile exists or can be initialized.|

**Main flow**

|**Step**|**Actor / Role**|**User action**|**System behavior**|**Data / Status update**|
| :-: | :-: | :-: | :-: | :-: |
|**1**|System|Load position requirements.|Retrieve required competency level, weight and mandatory flag.|Requirement snapshot prepared.|
|**2**|System|Load employee current competency profile.|Retrieve current level from evidence, assessment, certificate or manual baseline.|Current competency snapshot prepared.|
|**3**|System|Calculate gap.|Gap = Required Level - Current Level. Negative gaps are treated as no shortage.|Skill gap result stored.|
|**4**|System|Classify priority.|Use mandatory flag, gap size and weight to determine priority.|Gap priority = Low/Medium/High.|
|**5**|System|Expose results.|Show gap on HR/Manager/Employee views based on permission.|Dashboard and detail pages updated.|

**Alternative and exception flows**

|**Case**|**Condition**|**Expected handling**|
| :-: | :-: | :-: |
|**No competency profile**|Employee has no current level.|Default current level to baseline configured by HR or 0/Not Assessed.|
|**No position requirements**|Position has not been configured.|Mark analysis unavailable and notify HR to configure requirements.|
|**Requirement changed**|HR changes requirement after calculation.|Mark previous result stale and recalculate.|

**Business controls and validation rules**

- Skill gap must be explainable with required level, current level and calculation timestamp.
- Department Manager can only see skill gap of employees in scope.
- Skill gap should not automatically modify employee competency level.

**Outputs**

- Skill gap result records.
- Missing competency list.
- Input for learning recommendation and task suggestion.

|<p>**Implementation note**</p><p>Store a snapshot of required/current levels or at least calculation timestamp to support explanation during demo.</p>|
| :- |

## **F11. Learning Recommendation Flow**

|**Business purpose**|Recommend suitable courses or learning paths based on skill gaps and available course-competency mapping.|
| :- | :- |
|**Primary actors**|System Recommendation Service, HR, Manager, Employee|
|**Trigger**|Skill gap result exists or employee requests recommendation.|
|**Preconditions**|There are published courses mapped to competencies.|

**Main flow**

|**Step**|**Actor / Role**|**User action**|**System behavior**|**Data / Status update**|
| :-: | :-: | :-: | :-: | :-: |
|**1**|System|Read employee skill gaps.|Filter gaps greater than zero and sort by priority.|Recommendation input prepared.|
|**2**|System|Find matching courses.|Match course competencies with missing competencies and target levels.|Candidate course list generated.|
|**3**|System|Rank recommendations.|Use gap priority, course relevance, previous attempts and due needs.|Recommendation score computed.|
|**4**|System|Generate explanation.|Explain why each course is recommended using rule-based reason text or optional LLM.|Explanation stored/displayed.|
|**5**|HR/Manager/Employee|View recommendation.|Display recommended course list and next actions.|No direct enrollment unless assigned/accepted.|

**Alternative and exception flows**

|**Case**|**Condition**|**Expected handling**|
| :-: | :-: | :-: |
|**No matching course**|No course covers missing competency.|Show content gap to HR/Trainer and suggest creating a course.|
|**Already completed course**|Employee already completed same course.|Recommend advanced course or practical task instead.|
|**Manager accepts recommendation**|Manager decides to assign recommended course.|Continue to course assignment flow F07.|

**Business controls and validation rules**

- Recommendation is advisory; HR/Manager keeps decision control.
- Only published courses should appear.
- Explanation should show gap and mapping to avoid black-box behavior.

**Outputs**

- Recommendation list.
- Reason text.
- Possible course assignment action.

|<p>**Implementation note**</p><p>MVP can implement deterministic ranking. LLM is optional for more natural explanation text, not required for score correctness.</p>|
| :- |

## **F12. Training Risk Detection and Escalation Flow**

|**Business purpose**|Detect employees at risk of failing or delaying training so managers can intervene early.|
| :- | :- |
|**Primary actors**|System Scheduler, HR, Department Manager, Employee|
|**Trigger**|Scheduled job runs daily or important learning data changes.|
|**Preconditions**|Employee has active enrollment with due date, progress and assessment records.|

**Main flow**

|**Step**|**Actor / Role**|**User action**|**System behavior**|**Data / Status update**|
| :-: | :-: | :-: | :-: | :-: |
|**1**|System|Collect risk signals.|Read inactivity, low score rate, deadline pressure, failed attempts and progress delay.|Risk input snapshot prepared.|
|**2**|System|Calculate risk score.|Apply configured formula and thresholds.|Risk score saved.|
|**3**|System|Classify risk level.|Map score to Low/Medium/High/Critical.|Risk level updated.|
|**4**|System|Generate reason.|Explain key factors causing risk.|Risk explanation saved.|
|**5**|System|Notify impacted users.|Send alert to employee and manager if threshold is met.|Notification created.|
|**6**|Manager/HR|Review risk list.|Open employee risk detail and choose intervention.|Intervention note can be recorded.|

**Alternative and exception flows**

|**Case**|**Condition**|**Expected handling**|
| :-: | :-: | :-: |
|**No due date**|Enrollment has no deadline.|Risk formula ignores deadline pressure or marks as not applicable.|
|**Risk decreases**|Employee progresses or passes assessment.|Lower risk level and resolve open alert if applicable.|
|**Manager intervention**|Manager assigns support task or extends deadline.|Record decision and audit important changes.|

**Business controls and validation rules**

- Risk formula and thresholds must be configurable.
- Risk is not a disciplinary decision; it is a training support indicator.
- Risk explanation must be visible to avoid black-box scoring.

**Outputs**

- Training risk score and level.
- Risk notification.
- Manager action list.

|<p>**Implementation note**</p><p>Run recalculation in background job or service. Avoid recalculating heavy dashboard metrics in frontend.</p>|
| :- |

## **F13. Certificate Issuance and QR Verification Flow**

|**Business purpose**|Issue verifiable digital certificates when employees meet completion and assessment rules.|
| :- | :- |
|**Primary actors**|System Certificate Service, Employee, HR, Certificate Verifier|
|**Trigger**|Employee completes course and passes required assessment.|
|**Preconditions**|Course has certificate rule/template; employee meets completion and pass score requirements.|

**Main flow**

|**Step**|**Actor / Role**|**User action**|**System behavior**|**Data / Status update**|
| :-: | :-: | :-: | :-: | :-: |
|**1**|System|Check certificate eligibility.|Validate course completion, assessment score and certificate rule.|Eligibility confirmed.|
|**2**|System|Generate certificate record.|Create unique certificate code, issue date, expiry date and status.|Certificate status = Valid.|
|**3**|System|Generate PDF and QR.|Create certificate PDF and QR verification URL.|PDF saved to MinIO; QR URL saved.|
|**4**|System|Notify employee.|Inform employee that certificate is available.|Notification created.|
|**5**|Employee|Open My Certificates.|View/download certificate and QR.|Certificate viewed event optional.|
|**6**|Verifier|Scan QR or enter code.|Load public verification page with minimal certificate data.|Verification log created.|

**Alternative and exception flows**

|**Case**|**Condition**|**Expected handling**|
| :-: | :-: | :-: |
|**Already issued**|Certificate for same course and valid period already exists.|Return existing certificate or create renewal based on policy.|
|**Certificate generation failed**|PDF/QR generation error.|Mark generation pending and retry without losing eligibility.|
|**Invalid code**|Verifier enters unknown code.|Show invalid certificate message without exposing system details.|

**Business controls and validation rules**

- Certificate code must be unique and hard to guess.
- Verification page must not expose sensitive employee data beyond necessary certificate validity fields.
- Certificate issuance, revocation and verification must be auditable.

**Outputs**

- Certificate record.
- PDF certificate file.
- QR verification URL.
- Verification log.

|<p>**Implementation note**</p><p>Certificate verification should work without login if public verification is chosen, but the returned data must be minimal.</p>|
| :- |

## **F14. Certificate Expiry, Revocation and Renewal Flow**

|**Business purpose**|Maintain certificate trust by handling expired, revoked or renewal-needed certificates.|
| :- | :- |
|**Primary actors**|HR / Training Manager, System Scheduler, Employee, Verifier|
|**Trigger**|Expiry date is reached, HR revokes certificate, or renewal is requested.|
|**Preconditions**|Certificate exists and has identifiable status.|

**Main flow**

|**Step**|**Actor / Role**|**User action**|**System behavior**|**Data / Status update**|
| :-: | :-: | :-: | :-: | :-: |
|**1**|System|Check certificate validity.|Scheduled job compares expiry date with current date.|Expired certificates marked Expired.|
|**2**|HR|Revoke certificate if needed.|Enter revocation reason and confirm action.|Certificate status = Revoked.|
|**3**|System|Update certificate score impact.|Recalculate certificate score/readiness if certificate no longer valid.|Readiness recalculation triggered.|
|**4**|System|Notify employee/manager.|Send expiry/revocation notification.|Notification created.|
|**5**|Verifier|Verify code after status change.|Show Expired/Revoked status clearly.|Verification log created.|

**Alternative and exception flows**

|**Case**|**Condition**|**Expected handling**|
| :-: | :-: | :-: |
|**Renewal flow**|Certificate is near expiry and renewal is allowed.|Create renewal recommendation or assign refresher course.|
|**Revocation mistake**|HR revokes wrong certificate.|Do not delete; allow controlled status correction with audit if policy permits.|
|**No expiry date**|Certificate is lifetime.|Skip expiry job for that certificate.|

**Business controls and validation rules**

- Revocation requires reason and audit log.
- Expired/revoked certificates must not count as valid certificate score.
- Employees must not be allowed to edit certificate status.

**Outputs**

- Updated certificate status.
- Audit log.
- Readiness recalculation event.
- Notification.

|<p>**Implementation note**</p><p>Certificate status should be enum: Valid, Expired, Revoked, Pending Renewal. Business logic should not depend on display labels.</p>|
| :- |

## **F15. WMS-lite Practical Task Assignment Flow**

|**Business purpose**|Assign practical work-based tasks to validate whether employees can apply learned competency in real work scenarios.|
| :- | :- |
|**Primary actors**|Department Manager, HR, Employee, Optional AI Task Suggestion Service|
|**Trigger**|Employee completes course, skill gap remains, or manager wants practical validation.|
|**Preconditions**|Employee belongs to manager scope; task competency target is defined.|

**Main flow**

|**Step**|**Actor / Role**|**User action**|**System behavior**|**Data / Status update**|
| :-: | :-: | :-: | :-: | :-: |
|**1**|Manager|Open employee skill gap or course completion detail.|Load competency gaps, completed courses and readiness context.|No data change.|
|**2**|System/AI optional|Suggest practical task.|Generate task idea, expected output and evaluation criteria based on competency.|Task suggestion draft created.|
|**3**|Manager|Review and edit task.|Manager confirms description, deadline, expected output and rubric.|Task draft updated.|
|**4**|Manager|Assign task to employee.|Validate manager scope and deadline.|Task assignment status = Assigned.|
|**5**|System|Notify employee.|Send task assignment notification.|Notification created.|

**Alternative and exception flows**

|**Case**|**Condition**|**Expected handling**|
| :-: | :-: | :-: |
|**Manual task**|Manager does not use AI suggestion.|Create task manually with required fields.|
|**Task template**|Manager selects predefined task template.|Populate task fields from template.|
|**Invalid assignee**|Employee is outside manager scope.|Block assignment.|

**Business controls and validation rules**

- Task must have description, deadline, expected output and evaluation criteria before assignment.
- AI task suggestion must be reviewed by Manager before assignment.
- WMS-lite must stay focused on training competency validation, not full enterprise project management.

**Outputs**

- Assigned practical task.
- Task rubric/evaluation criteria.
- Employee notification.

|<p>**Implementation note**</p><p>Task assignment should reference target competency so the evaluation can generate competency evidence later.</p>|
| :- |

## **F16. Task Submission and Evaluation Flow**

|**Business purpose**|Collect task results, evaluate practical performance and confirm competency evidence.|
| :- | :- |
|**Primary actors**|Employee, Department Manager, Trainer optional|
|**Trigger**|Employee works on assigned practical task and submits output.|
|**Preconditions**|Task is assigned to employee and still open.|

**Main flow**

|**Step**|**Actor / Role**|**User action**|**System behavior**|**Data / Status update**|
| :-: | :-: | :-: | :-: | :-: |
|**1**|Employee|Open My Tasks.|Load assigned and in-progress tasks.|No data change.|
|**2**|Employee|Update task progress.|Validate status transition and optional progress note.|Task status = In Progress.|
|**3**|Employee|Submit result/file/link.|Validate required output, file type/size and submission deadline.|Task submission created; status = Submitted.|
|**4**|Manager|Review submission.|Open submitted files, rubric and employee context.|No data change.|
|**5**|Manager|Evaluate task.|Enter score, feedback and competency confirmation decision.|Task evaluation saved.|
|**6**|System|Close or return task.|If accepted, create competency evidence; if revision, return to employee.|Task status = Evaluated/Revision Required/Closed.|

**Alternative and exception flows**

|**Case**|**Condition**|**Expected handling**|
| :-: | :-: | :-: |
|**Late submission**|Employee submits after deadline.|Allow or reject based on policy; flag late submission in evaluation.|
|**Revision required**|Manager requests improvement.|Task returns to In Revision; employee resubmits.|
|**Rejected evidence**|Task score below threshold.|Close task as not confirmed; do not update competency level.|

**Business controls and validation rules**

- Employee cannot evaluate their own task.
- Evaluation must include score and feedback.
- Task score should affect readiness only after valid manager/trainer evaluation.

**Outputs**

- Task submission record.
- Task evaluation score and feedback.
- Potential competency evidence.

|<p>**Implementation note**</p><p>Separate task assignment, submission and evaluation entities for clean audit and future multi-submission support.</p>|
| :- |

## **F17. Competency Evidence Portfolio Update Flow**

|**Business purpose**|Maintain a reliable evidence history proving how each competency level was achieved or confirmed.|
| :- | :- |
|**Primary actors**|System, HR, Manager, Trainer, Employee|
|**Trigger**|Assessment passed, certificate issued, task evaluated, manager review added or manual evidence recorded.|
|**Preconditions**|Evidence source is valid and linked to employee and competency.|

**Main flow**

|**Step**|**Actor / Role**|**User action**|**System behavior**|**Data / Status update**|
| :-: | :-: | :-: | :-: | :-: |
|**1**|System/User|Receive evidence source event.|Identify source type: Assessment, Certificate, Task, Manager Review or Manual.|Evidence candidate created.|
|**2**|System|Validate evidence eligibility.|Check source status, score threshold, reviewer permission and target competency.|Evidence accepted or rejected.|
|**3**|System/Manager/HR|Confirm competency impact.|Determine confirmed level, score impact and evidence confidence.|Evidence status = Confirmed.|
|**4**|System|Update employee competency profile.|Apply update policy: latest evidence, highest confirmed level or weighted logic.|Employee competency level updated if allowed.|
|**5**|System|Trigger recalculation.|Skill gap and readiness become stale or are recalculated.|Dashboard update event created.|

**Alternative and exception flows**

|**Case**|**Condition**|**Expected handling**|
| :-: | :-: | :-: |
|**Manual evidence**|HR enters external evidence.|Require attachment/note and HR permission.|
|**Evidence rejected**|Task failed or certificate revoked.|Keep evidence record but mark rejected; do not affect competency.|
|**Evidence superseded**|New stronger evidence replaces old evidence.|Keep history and mark old evidence superseded if policy applies.|

**Business controls and validation rules**

- Evidence must preserve source reference for audit.
- Employee can view own evidence but cannot confirm or edit official evidence.
- Every competency level change should be explainable by evidence.

**Outputs**

- Competency evidence portfolio record.
- Updated employee competency profile.
- Recalculated analytics.

|<p>**Implementation note**</p><p>Evidence is the bridge between learning and workforce readiness. It should be designed carefully in database and API.</p>|
| :- |

## **F18. Workforce Readiness Score Calculation Flow**

|**Business purpose**|Calculate an explainable readiness score showing how prepared an employee or department is for required digital capability.|
| :- | :- |
|**Primary actors**|System Intelligence Service, HR, Manager, Employee|
|**Trigger**|Competency, certificate, learning progress, compliance or task performance data changes.|
|**Preconditions**|Employee has position requirements and sufficient calculation inputs.|

**Main flow**

|**Step**|**Actor / Role**|**User action**|**System behavior**|**Data / Status update**|
| :-: | :-: | :-: | :-: | :-: |
|**1**|System|Load readiness inputs.|Collect competency score, certificate score, learning progress, compliance and task performance.|Input snapshot prepared.|
|**2**|System|Apply configured weights.|Use default or admin-configured formula.|Weighted score computed.|
|**3**|System|Classify readiness level.|Map score to Not Ready, Developing, Ready or Strong.|Readiness level saved.|
|**4**|System|Generate explanation.|Show contribution of each component and missing factors.|Readiness explanation stored.|
|**5**|HR/Manager/Employee|View readiness detail.|Display score, trend, breakdown and recommended next action.|No direct data change.|

**Alternative and exception flows**

|**Case**|**Condition**|**Expected handling**|
| :-: | :-: | :-: |
|**Missing data**|Employee lacks assessment/task data.|Score available components and mark missing inputs clearly.|
|**Weight changed**|Admin updates scoring weights.|Recalculate affected readiness scores and audit config change.|
|**Department readiness**|HR views department aggregate.|Aggregate individual scores by department/position.|

**Business controls and validation rules**

- Weights and thresholds should not be hard-coded.
- Readiness is decision support, not an automatic promotion/discipline decision.
- Readiness score must provide explanation for mentor/demo review.

**Outputs**

- Employee readiness score.
- Readiness breakdown.
- Department aggregate readiness.

|<p>**Implementation note**</p><p>Readiness score is one of the strongest demo features. Build it after core data flows are stable.</p>|
| :- |

## **F19. HR and Manager Dashboard Flow**

|**Business purpose**|Provide role-based analytics for monitoring learning, risk, certificates, tasks and readiness.|
| :- | :- |
|**Primary actors**|HR / Training Manager, Department Manager, Trainer, Employee|
|**Trigger**|User opens role-based dashboard.|
|**Preconditions**|User is authenticated and has permission to view dashboard data.|

**Main flow**

|**Step**|**Actor / Role**|**User action**|**System behavior**|**Data / Status update**|
| :-: | :-: | :-: | :-: | :-: |
|**1**|User|Open dashboard.|Frontend requests dashboard summary API based on role.|No data change.|
|**2**|Backend|Resolve data scope.|Apply company-wide scope for HR or department scope for Manager.|Scoped query context created.|
|**3**|Backend|Aggregate metrics.|Calculate or fetch cached metrics: progress, risk, certificate status, readiness, task performance.|Dashboard DTO returned.|
|**4**|User|Filter dashboard.|Apply filters by department, position, course, risk level or time period.|Filtered results returned.|
|**5**|User|Drill down to detail.|Open employee/course/certificate/task detail page.|No data change unless action is taken.|

**Alternative and exception flows**

|**Case**|**Condition**|**Expected handling**|
| :-: | :-: | :-: |
|**No data yet**|System setup incomplete.|Show empty state with next setup actions.|
|**Large dataset**|Dashboard query becomes slow.|Use server-side pagination, aggregates and Redis cache if needed.|
|**Permission mismatch**|User requests dashboard outside scope.|Return forbidden and log security event if suspicious.|

**Business controls and validation rules**

- Dashboard data scope must be enforced on backend.
- Frontend must not receive unauthorized rows then hide them visually.
- Dashboard formulas must be aligned with SRS/AI scoring design.

**Outputs**

- Dashboard summary cards.
- Risk list.
- Readiness list.
- Certificate status report.
- Task performance report.

|<p>**Implementation note**</p><p>Dashboard should be API-driven. Avoid computing metrics directly in React from raw full tables.</p>|
| :- |

## **F20. Notification and Reminder Flow**

|**Business purpose**|Notify users about assigned courses, task deadlines, certificate expiry, risk alerts and evaluation feedback.|
| :- | :- |
|**Primary actors**|System Scheduler, SignalR Hub, HR, Manager, Trainer, Employee|
|**Trigger**|Business event occurs or scheduled reminder job runs.|
|**Preconditions**|Notification rule is enabled and recipient can be resolved.|

**Main flow**

|**Step**|**Actor / Role**|**User action**|**System behavior**|**Data / Status update**|
| :-: | :-: | :-: | :-: | :-: |
|**1**|System|Receive notification event.|Identify event type: course assigned, deadline approaching, risk high, certificate expiring, task feedback.|Notification request created.|
|**2**|System|Resolve recipients.|Apply role and scope rules to determine recipients.|Recipient list prepared.|
|**3**|System|Create notification records.|Save message, target URL, priority and status.|Notification status = Created.|
|**4**|SignalR optional|Push real-time update.|Send notification to connected clients.|Delivery status updated if applicable.|
|**5**|User|Open notification center.|Read notification and navigate to related page.|Notification status = Read.|

**Alternative and exception flows**

|**Case**|**Condition**|**Expected handling**|
| :-: | :-: | :-: |
|**User offline**|Real-time delivery fails.|Keep unread notification for next login.|
|**Duplicate event**|Same reminder generated repeatedly.|Deduplicate based on event key and reminder window.|
|**Email future enhancement**|Email channel enabled later.|Send email in addition to in-app notification.|

**Business controls and validation rules**

- Notification must respect data access rules.
- Do not include sensitive score details in public/email content unless approved.
- Reminder frequency should avoid spam.

**Outputs**

- Notification records.
- Real-time push event if enabled.
- Unread count.

|<p>**Implementation note**</p><p>SignalR is useful but should not be required for core workflow correctness. Database notification record is the source of truth.</p>|
| :- |

## **F21. Career and Promotion Readiness Flow (Optional / Bonus)**

|**Business purpose**|Compare an employee with a target position and suggest development actions.|
| :- | :- |
|**Primary actors**|HR / Training Manager, Department Manager, System Intelligence Service|
|**Trigger**|HR or Manager selects employee and target position.|
|**Preconditions**|Target position has competency requirements; employee has competency profile.|

**Main flow**

|**Step**|**Actor / Role**|**User action**|**System behavior**|**Data / Status update**|
| :-: | :-: | :-: | :-: | :-: |
|**1**|HR/Manager|Select employee and target position.|Check permission and load target position requirements.|Comparison context prepared.|
|**2**|System|Compare competency profile.|Calculate achieved required weight over total required weight.|Career readiness percentage computed.|
|**3**|System|Identify missing competencies.|List gaps by priority and required level.|Missing competency list stored/displayed.|
|**4**|System|Recommend actions.|Suggest courses, certificates or practical tasks.|Development plan suggestion generated.|
|**5**|HR/Manager|Review result.|Use result for development planning, not automatic promotion.|Optional action: assign courses/tasks.|

**Alternative and exception flows**

|**Case**|**Condition**|**Expected handling**|
| :-: | :-: | :-: |
|**No target requirements**|Target position has not been mapped.|Show setup-required message.|
|**Out-of-scope manager**|Manager selects employee outside scope.|Block action.|
|**Incomplete data**|Employee lacks evidence.|Show confidence warning.|

**Business controls and validation rules**

- This is an optional feature and should not block MVP completion.
- Result is advisory and does not replace HR decision.
- Explanation should list exact missing competencies and recommended actions.

**Outputs**

- Career readiness percentage.
- Missing competency list.
- Suggested development plan.

|<p>**Implementation note**</p><p>Build this only after the core readiness and skill gap services are stable. It reuses many calculations from F10 and F18.</p>|
| :- |

## **F22. Admin Configuration and Audit Flow**

|**Business purpose**|Allow controlled management of system configuration, thresholds, permissions and audit tracking.|
| :- | :- |
|**Primary actors**|System Admin, HR Admin, Backend Services|
|**Trigger**|Admin updates configuration or reviews audit logs.|
|**Preconditions**|Admin has required permission.|

**Main flow**

|**Step**|**Actor / Role**|**User action**|**System behavior**|**Data / Status update**|
| :-: | :-: | :-: | :-: | :-: |
|**1**|Admin|Open system settings.|Load configurable thresholds, weights and certificate rules.|No data change.|
|**2**|Admin|Update configuration.|Validate values and dependency constraints.|Configuration version saved.|
|**3**|System|Apply configuration.|Mark impacted calculations stale or trigger recalculation.|Affected scores/rules updated.|
|**4**|System|Write audit log.|Record actor, action, old value, new value and timestamp.|Audit log inserted.|
|**5**|Admin|Review audit log.|Filter logs by actor, entity, action and date.|Audit data displayed.|

**Alternative and exception flows**

|**Case**|**Condition**|**Expected handling**|
| :-: | :-: | :-: |
|**Invalid config**|Weights do not add up or threshold overlaps.|Reject save and explain validation error.|
|**Rollback needed**|New config causes unexpected results.|Create new configuration version or revert if supported.|
|**Audit export**|Admin needs evidence for mentor/demo.|Export filtered audit logs if implemented.|

**Business controls and validation rules**

- Configuration affecting scoring must not be hard-coded.
- Important data changes must be audited.
- Audit logs should be append-only for normal users.

**Outputs**

- Updated configuration.
- Audit trail.
- Recalculation event if needed.

|<p>**Implementation note**</p><p>At minimum, store scoring thresholds, readiness weights, risk thresholds and certificate expiry defaults in configuration table or application settings.</p>|
| :- |

## **F23. End-to-End Capability Development Demo Flow**

|**Business purpose**|Provide the recommended storyline for final defense demo and integration testing.|
| :- | :- |
|**Primary actors**|Admin, HR, Trainer, Employee, Manager, Verifier, System|
|**Trigger**|Demo starts with a sample company, department, employee and competency gap.|
|**Preconditions**|Seed data exists: company departments, positions, competencies, courses, assessment, employee, manager and certificate template.|

**Main flow**

|**Step**|**Actor / Role**|**User action**|**System behavior**|**Data / Status update**|
| :-: | :-: | :-: | :-: | :-: |
|**1**|HR|Create position requirement for Marketing Executive.|Map Data Literacy level 3 and AI Productivity level 2.|Position requirements active.|
|**2**|System|Calculate employee skill gap.|Employee currently has Data Literacy level 1.|Gap result = missing 2 levels.|
|**3**|System/HR|Recommend course.|Recommend Data Analytics Basic based on Data Literacy gap.|Recommendation shown.|
|**4**|HR|Assign course to employee.|Create enrollment and due date.|Enrollment = Assigned.|
|**5**|Employee|Learn lessons and take assessment.|Record progress and score.|Assessment passed; enrollment completed.|
|**6**|System|Issue certificate.|Generate certificate PDF and QR verification URL.|Certificate = Valid.|
|**7**|Verifier|Scan QR.|Verification page shows certificate valid.|Verification log created.|
|**8**|Manager|Assign practical task.|Task: create campaign analysis report using spreadsheet.|Task = Assigned.|
|**9**|Employee|Submit task output.|Upload report file/link.|Task = Submitted.|
|**10**|Manager|Evaluate task and confirm evidence.|Score task and give feedback.|Evidence confirmed; competency updated.|
|**11**|System|Recalculate readiness.|Skill gap decreases, readiness improves.|Dashboard updated.|
|**12**|HR/Manager|Open dashboard.|View heatmap, risk list, readiness and evidence portfolio.|Demo value completed.|

**Alternative and exception flows**

|**Case**|**Condition**|**Expected handling**|
| :-: | :-: | :-: |
|**Employee fails assessment**|Score below pass threshold.|No certificate issued; risk increases; retake/recommendation shown.|
|**Task not accepted**|Manager score below criteria.|Evidence not confirmed; readiness does not improve.|
|**Certificate revoked**|HR revokes certificate with reason.|Verifier sees Revoked; certificate score removed.|

**Business controls and validation rules**

- Demo seed data must show before/after improvement clearly.
- Each step should map to a UI screen and at least one backend domain.
- Final dashboard should prove the system is more than a normal LMS.

**Outputs**

- Complete evidence-backed capability development lifecycle.
- Strong defense story.
- Integration test scenario for MVP.

|<p>**Implementation note**</p><p>Use this flow as the main integration test. If this flow works smoothly, the project demo will be coherent and convincing.</p>|
| :- |

# **8. State Transition Models**
State transitions are important because most implementation bugs occur when a record moves to an invalid status. The backend must enforce allowed transitions and the frontend should only show actions valid for the current status.

|**Entity**|**Allowed status flow**|**Important rule**|
| :-: | :-: | :-: |
|**Course**|Draft -> Published -> Archived|Only Published courses can be assigned.|
|**Lesson progress**|Not Started -> In Progress -> Completed|Progress update must be idempotent.|
|**Enrollment**|Assigned -> In Progress -> Completed / Failed / Overdue / Cancelled|Completion depends on course rules and assessment result.|
|**Assessment attempt**|Started -> Submitted -> Scored -> Passed / Failed|Employee cannot modify after submission.|
|**Certificate**|Valid -> Expired / Revoked / Pending Renewal|Only Valid and not expired certificate counts in score.|
|**Practical task**|Draft/Suggested -> Assigned -> In Progress -> Submitted -> Evaluated -> Closed|Task evidence only created after valid evaluation.|
|**Competency evidence**|Candidate -> Confirmed / Rejected / Superseded|Confirmed evidence may update competency profile.|
|**Notification**|Created -> Delivered -> Read / Dismissed|Unread notification should persist if user is offline.|
|**Risk alert**|Open -> Acknowledged -> Resolved|Risk can be recalculated lower when employee improves.|

# **9. Screen and API Touchpoint Matrix**
The matrix below helps frontend and backend teams align each flow with screens and candidate API domains. Endpoint names are indicative and should be finalized in the API Specification document.

|**Flow**|**Main UI screens**|**Backend domains / candidate APIs**|
| :-: | :-: | :-: |
|**F01**|Login, My Profile, Role Selection|/auth, /users/me, /permissions|
|**F02**|Department List, Position List, Employee Management|/departments, /job-positions, /employees|
|**F03-F04**|Competency Framework, Position Requirement Matrix|/competencies, /competency-levels, /position-requirements|
|**F05-F06**|Course Builder, Lesson Editor, Material Upload, Question Bank, Assessment Builder|/courses, /lessons, /materials, /questions, /assessments|
|**F07-F09**|Course Assignment, My Courses, Lesson Viewer, Quiz Page, Assessment Result|/enrollments, /learning-progress, /assessment-attempts|
|**F10-F12**|Skill Gap Result, Recommendation, Training Risk Detail|/analytics/skill-gaps, /recommendations, /risk-scores|
|**F13-F14**|My Certificates, Certificate Detail, Certificate Verify Page, Certificate Admin|/certificates, /certificates/verify, /certificate-templates|
|**F15-F17**|Task Recommendation, Create Task, My Tasks, Submit Task, Task Evaluation, Evidence Portfolio|/tasks, /task-submissions, /task-evaluations, /competency-evidence|
|**F18-F19**|Readiness Detail, HR Dashboard, Manager Dashboard, Employee Dashboard|/readiness-scores, /dashboards/hr, /dashboards/manager, /dashboards/employee|
|**F20-F22**|Notification Center, Reminder Settings, Audit Logs, System Settings|/notifications, /settings, /audit-logs|

# **10. Cross-Flow Business Rules**

|**Rule ID**|**Rule statement**|**Affected flows**|
| :-: | :-: | :-: |
|**BF-BR-01**|Every active job position must have at least one required competency before skill gap can be calculated.|F04, F10, F18|
|**BF-BR-02**|Every published course used for recommendation must be mapped to at least one competency.|F05, F11|
|**BF-BR-03**|Certificate can only be issued when course completion and assessment pass conditions are satisfied.|F09, F13|
|**BF-BR-04**|Expired or revoked certificates must not contribute to certificate score or readiness score.|F14, F18|
|**BF-BR-05**|Department Manager can only view and evaluate employees within authorized department/direct-report scope.|F02, F15, F16, F19|
|**BF-BR-06**|AI-generated questions or tasks are drafts/suggestions and require human review before official use.|F06, F15|
|**BF-BR-07**|Employees cannot edit their assessment score, certificate status, official competency level or manager evaluation.|F09, F13, F16, F17|
|**BF-BR-08**|All important actions must create audit logs: permission change, certificate issue/revoke, task evaluation, competency update and scoring config change.|F01, F13, F16, F17, F22|
|**BF-BR-09**|Scoring formulas and thresholds should be configurable or at least centralized, not duplicated across frontend/backend.|F12, F18, F22|
|**BF-BR-10**|Dashboard data scope must be enforced by backend service, not only by frontend filtering.|F19|

# **11. Operational Risks and Controls**

|**Risk**|**Impact**|**Control / Mitigation**|
| :-: | :-: | :-: |
|**Scope becomes too large**|Team may not finish core MVP.|Use F23 as main demo flow. Defer AI Learning Assistant and Semantic Search to future scope.|
|**Permission leakage**|Employee data or scores may be exposed incorrectly.|Backend-scoped queries, RBAC tests and audit logs.|
|**Unclear scoring**|Mentor may question reliability of AI/readiness result.|Use explainable rule-based formula and store input snapshots/reasons.|
|**Task evidence is subjective**|Readiness may look unreliable.|Require rubric, score, feedback and manager confirmation.|
|**Dashboard performance issue**|Slow UX and poor demo.|Aggregate server-side, paginate details and cache if needed.|
|**Poor seed data**|Demo does not show value chain clearly.|Prepare realistic company, department, position, employee, gaps, course, certificate and task data.|
|**Certificate spoofing**|Verification loses trust.|Unique certificate code, QR URL, status check and verification log.|

# **12. End-to-End Demo Flow**
The recommended demo should follow a single employee journey. Do not demo isolated screens randomly. The goal is to prove that DigiTalent AI creates a closed loop from required competency to practical evidence and readiness analytics.

|**Demo phase**|**Demo action**|**Value shown to mentor/hội đồng**|
| :-: | :-: | :-: |
|**Setup**|Show Marketing department, Marketing Executive position and required competencies.|The system starts from business capability requirements, not only courses.|
|**Gap analysis**|Open employee profile and show missing Data Literacy competency.|The system identifies what the employee lacks.|
|**Recommendation**|Show recommended course based on gap.|The system suggests an action based on evidence, not random content.|
|**Learning**|Employee completes lesson and assessment.|The system records learning progress and learning outcome.|
|**Certificate**|System issues certificate with QR and verifier checks it.|The certificate is verifiable and status-based.|
|**Task evidence**|Manager assigns practical task and evaluates submitted output.|The system validates application of knowledge in work context.|
|**Analytics**|HR/Manager dashboard shows readiness improvement and evidence portfolio.|The system supports capability governance and decisions.|

# **13. Implementation Readiness Checklist**

|**Checklist item**|**Why it matters**|**Recommended owner**|
| :-: | :-: | :-: |
|**Define seed departments, positions and employees**|Required to test role scope and dashboard.|Backend Core / Team Lead|
|**Define competency categories and level scale**|Required before skill gap and course mapping.|Business Analyst / Backend Analytics|
|**Prepare at least 3 courses mapped to competencies**|Required for recommendation and learning flow.|Trainer UI / Learning Backend|
|**Prepare assessment questions and pass rules**|Required for certificate eligibility.|Trainer UI / Assessment Backend|
|**Prepare certificate template and QR verification URL pattern**|Required for certificate demo.|Backend Learning & Certification|
|**Prepare WMS-lite task templates and rubrics**|Required for task evidence demo.|Manager UI / Analytics Backend|
|**Implement RBAC test cases by role**|Prevents data leakage and demo accidents.|Backend Core / QA|
|**Implement scoring unit tests**|Protects skill gap, risk and readiness formulas.|Analytics Backend|
|**Prepare dashboard aggregates**|Makes final demo cohesive.|Dashboard Frontend / Analytics Backend|
|**Prepare Docker Compose dev environment**|Ensures team can run system consistently.|DevOps owner|

# **14. Appendix: Mermaid Sources for Documentation**
The following Mermaid sources can be reused in README, presentation or future diagrams. They are intentionally text-based to keep this Word document portable.

**A. Core business value chain**

|flowchart LR<br>A[Organization Structure] --> B[Job Position]<br>B --> C[Competency Requirements]<br>C --> D[Course and Assessment]<br>D --> E[Learning Progress]<br>E --> F[Assessment Result]<br>F --> G[Certificate QR]<br>G --> H[Practical Task]<br>H --> I[Manager Evaluation]<br>I --> J[Competency Evidence]<br>J --> K[Readiness Dashboard]<br>K --> L[HR/Manager Decision]|
| :- |

**B. WMS-lite task flow**

|flowchart TD<br>A[Skill Gap or Completed Course] --> B[Task Suggestion Draft]<br>B --> C[Manager Review and Edit]<br>C --> D[Assign Task]<br>D --> E[Employee Submits Output]<br>E --> F[Manager Evaluates]<br>F --> G{Accepted?}<br>G -->|Yes| H[Create Competency Evidence]<br>G -->|No| I[Revision Required or Rejected]<br>H --> J[Recalculate Readiness]|
| :- |

**C. Certificate verification flow**

|sequenceDiagram<br>participant E as Employee<br>participant S as System<br>participant M as MinIO<br>participant V as Verifier<br>E->>S: Complete course and pass assessment<br>S->>S: Check certificate eligibility<br>S->>M: Store generated PDF certificate<br>S->>S: Create certificate code and QR URL<br>V->>S: Open verify URL or enter code<br>S->>S: Check status and expiry<br>S-->>V: Return Valid/Expired/Revoked result|
| :- |

# **15. Source Baseline**
This document was prepared based on the approved revised capstone scope and the supporting analysis documents already prepared for DigiTalent AI. The business baseline prioritizes the controlled MVP: RBAC, organization, competency framework, learning and assessment, certificate QR, rule-based capability analysis, WMS-lite task evidence, role dashboards and deployment preparation.

|**Source document**|**How it was used**|
| :-: | :-: |
|**Capstone\_Project\_Register\_DigiTalent\_AI\_Revised\_Scope.docx**|Primary approved scope and MVP boundaries.|
|**Capstone\_Project\_Register\_DigiTalent\_AI.docx**|Expanded AI/capability intelligence ideas used for optional/bonus references.|
|**De\_tai\_DigiTalent\_AI\_Mo\_ta\_cap\_nhat\_14\_he\_thong.docx**|Market gap, WMS-lite evidence concept, role modules, demo scenario and roadmap support.|
|**01\_Project\_Overview\_DigiTalent\_AI.docx**|High-level product vision and project positioning.|
|**02\_BRD\_Business\_Requirement\_DigiTalent\_AI.docx**|Business goals, stakeholders, business requirements and business rules.|
|**03A/03B SRS Documents**|Functional, technical, security and non-functional requirements.|
|**04\_Use\_Case\_List\_and\_Specification\_DigiTalent\_AI.docx**|Use case baseline for flow decomposition and implementation readiness.|

|<p>**Technical Mentor note**</p><p>Before coding, the team should validate this flow document with the BRD, SRS, Use Case and future ERD/API documents. If a screen, API or table does not support the core flow F23, it should be considered lower priority until the main demo lifecycle runs successfully.</p>|
| :- |

Prepared for Capstone Project development baseline
