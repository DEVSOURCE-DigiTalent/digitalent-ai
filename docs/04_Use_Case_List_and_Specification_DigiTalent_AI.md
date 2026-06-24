

**DIGITAL COMPETENCY TRAINING, INTERNAL CERTIFICATION AND WORK-BASED ASSESSMENT PLATFORM**

**DigiTalent AI**

**Use Case List & Use Case Specification**

Document No.: 04 | Version: 1.0 | Status: Draft for Implementation Planning

Prepared for: Capstone Project Development Team | Date: 19/06/2026

| Item | Description |
| :---- | :---- |
| Project Name | DigiTalent AI: Digital Competency Training, Internal Certification and Work-Based Assessment Platform |
| Primary Purpose | Define system use cases in enough detail for analysis, UI/UX design, API design, database design, task breakdown and implementation. |
| Main Scope Source | Capstone revised scope, Project Overview, BRD and SRS documents prepared for DigiTalent AI. |
| Technology Context | ReactJS, TypeScript, TailwindCSS, ShadCN/UI, ASP.NET Core/C\#, PostgreSQL, MinIO, Redis optional, SignalR, Docker, Nginx and GitHub Actions. |

*Confidential for academic project planning and implementation alignment.*

# **0\. Document Control**

| Version | Date | Author/Owner | Change Summary |
| :---- | :---- | :---- | :---- |
| 1.0 | 19/06/2026 | Project Team / Technical Mentor | Initial use case list and detailed use case specification for implementation planning. |

## **0.1 Input References**

| Reference | How it is used in this document |
| :---- | :---- |
| 01\_Project\_Overview\_DigiTalent\_AI.docx | Used to align product vision, scope, stakeholders, workflow and demo scenario. |
| 02\_BRD\_Business\_Requirement\_DigiTalent\_AI.docx | Used to align business goals, business rules, processes and stakeholder responsibilities. |
| 03A\_SRS\_Functional\_Requirements\_DigiTalent\_AI.docx | Used to align module-level functional requirements and feature boundaries. |
| 03B\_SRS\_Technical\_NFR\_DigiTalent\_AI.docx | Used to align API, technical, security, data and non-functional assumptions. |
| Capstone Revised Scope | Used as the official source of MVP scope and AI/bonus/future separation. |

## **0.2 Reading Guide**

This document is intentionally detailed because use cases are the bridge between business requirements and implementation. The team should use this file before drawing wireframes, creating API tickets, designing the database schema and splitting implementation tasks.

* Sections 1 to 4 define the context, actors and complete use case list.  
* Section 5 defines the detailed specification for every use case.  
* Sections 6 to 9 provide cross-cutting rules, traceability, out-of-scope control and implementation checklist.

# **Table of Contents. Manual Navigation**

* 1\. Purpose, Scope and Use Case Method  
* 2\. System Context and Actor Catalog  
* 3\. Use Case Grouping and Prioritization  
* 4\. Complete Use Case List  
* 5\. Detailed Use Case Specifications  
* 6\. Use Case Dependency Matrix  
* 7\. Cross-cutting Business and Security Rules  
* 8\. Out-of-Scope and Future Use Cases  
* 9\. Implementation Readiness Checklist  
* 10\. Appendix: Demo Use Case Scenario

# **1\. Purpose, Scope and Use Case Method**

The purpose of this document is to define the user-system interactions required for DigiTalent AI in a structured, implementation-ready manner. The document helps the team prevent ambiguous coding, reduce rework and ensure that UI, API, database and authorization decisions are driven by clear business behavior.

## **1.1 Document Objectives**

* Clarify who uses each function, why they use it and what result the system must produce.  
* Separate Core MVP use cases from Optional/Bonus and Future use cases to control capstone scope.  
* Define preconditions, main flows, alternative flows, exceptions and postconditions for each use case.  
* Connect use cases to business rules, data entities, screens and candidate API endpoints.  
* Provide a practical reference for sprint planning, UI wireframes, API contracts, database design and testing.

## **1.2 Scope Boundary**

| In Scope for this Use Case Document | Out of Scope / Not Implemented in MVP |
| :---- | :---- |
| Authentication, role-based authorization, profile and session control. | Full enterprise SSO/LDAP integration, unless implemented as future enhancement. |
| Organization, employee, department and job position management. | Full HRM/payroll/timekeeping system. |
| Competency framework, position requirements and employee competency profile. | Full talent marketplace or workforce planning suite. |
| Course, lesson, material, assignment, progress and assessment management. | Full LMS clone with livestream, video conferencing or complex classroom scheduling. |
| Certificate generation, QR verification, expiry and revocation. | Blockchain-based certificate verification. |
| WMS-lite practical task assignment and evidence evaluation. | Full project management system like Jira/Trello. |
| Rule-based skill gap, learning recommendation, training risk and readiness score. | Custom machine learning model training using large enterprise datasets. |
| Optional AI-assisted question/task suggestion under human review. | AI making final official HR, certificate or promotion decisions. |

## **1.3 Use Case Specification Template**

Each detailed use case follows a consistent template so that the team can convert it into screens, APIs and implementation tickets.

| Field | Meaning |
| :---- | :---- |
| Use Case ID / Name | Unique identifier and clear business-oriented function name. |
| Primary Actor / Supporting Actor | User or system that initiates the use case and services that support it. |
| Trigger | Event that starts the use case. |
| Preconditions | Conditions that must be true before the use case starts. |
| Main Flow | Happy path from start to successful completion. |
| Alternative Flows | Valid variations of the happy path. |
| Exception Flows | Errors, policy violations or blocked cases. |
| Postconditions | State after the use case completes successfully. |
| Business Rules | Rules that must be enforced by UI and backend. |
| Data Entities / Candidate APIs / Screens | Implementation hints for database, backend API and frontend planning. |
| Acceptance Criteria | Concrete conditions to confirm the use case is implemented correctly. |

# **2\. System Context and Actor Catalog**

DigiTalent AI supports multiple roles. The most important implementation principle is that every feature must be controlled by role-based permissions and, where applicable, department-level data scope. The backend must enforce this scope even if the frontend hides unauthorized screens.

## **2.1 Actor Catalog**

| Actor | Type | Main Responsibilities | Important Access Restriction |
| :---- | :---- | :---- | :---- |
| System Admin | Primary administrator | Maintains users, roles, permissions, system configuration, audit logs, master data, and operational governance. | Full system administration; should not bypass audit requirements. |
| HR / Training Manager | Business owner for capability governance | Defines workforce capability requirements, manages employees, assigns learning, monitors company-wide competency, certificate status, risk and readiness. | Company-wide view, except technical system configuration reserved for Admin. |
| Department Manager | Department capability owner | Monitors employees in assigned department, reviews skill gaps, assigns practical tasks, evaluates submissions, confirms competency evidence. | Department-level access only; cannot view or evaluate employees outside managed scope. |
| Internal Trainer | Learning content owner | Creates courses, lessons, materials, question banks, assessments, and reviews AI-generated draft questions. | Can manage learning content but cannot make HR promotion decisions. |
| Employee | Learner and assessed user | Views assigned courses, studies lessons, takes assessments, receives certificates, submits practical tasks, and views own competency evidence. | Self-service access only; cannot modify scores, certificates, or confirmed competencies. |
| Certificate Verifier | External or limited internal verifier | Verifies certificate validity using certificate code or QR verification URL. | Can only access minimal certificate verification information. |
| System Scheduler / Background Job | Automated system actor | Runs scheduled calculations, expiration checks, reminders, score refresh, risk detection and notification generation. | Acts under system rules; all critical changes must be traceable. |
| AI Service | Supporting actor | Generates draft explanations, task suggestions or question drafts when enabled. | Does not make final decisions; outputs require human review when they affect official records. |

## **2.2 High-level System Interaction Context**

The system interaction context can be understood as follows:

* Admin configures users, roles, permissions and master data.  
* HR defines organizational structure, competency framework, position requirements and training plans.  
* Trainer creates courses, lessons, materials, question banks and assessments.  
* Employee learns assigned courses, takes assessments, receives certificates and submits practical tasks.  
* Manager monitors department employees, assigns or reviews practical tasks and confirms evidence.  
* Certificate Verifier checks certificate validity through QR/code with limited public information.  
* System Scheduler recalculates score, detects risk, checks certificate expiry and sends notifications.  
* AI Service may generate draft explanations, questions or task suggestions, but final decisions remain human-controlled.

# **3\. Use Case Grouping and Prioritization**

The use cases are grouped by business module. Priority uses Must, Should and Could. Must items are required for the capstone MVP. Should items can improve quality and defense value. Could/Future items should only be implemented after the core flow is stable.

## **3.1 Module Map**

| Module ID | Module Name | Use Case Coverage |
| :---- | :---- | :---- |
| M01 | Authentication & Authorization | Login, refresh token, role and permission enforcement, profile and session control. |
| M02 | Organization & Employee Management | Departments, job positions, employee records, manager assignment and employee status. |
| M03 | Competency Framework Management | Competency categories, competencies, levels, position requirements, employee competency profile and evidence. |
| M04 | Course & Learning Management | Courses, modules, lessons, materials, competency mapping, course assignment and learning progress. |
| M05 | Assessment & Question Bank | Question bank, quizzes, final assessments, attempts, scoring and assessment history. |
| M06 | Digital Certificate Management | Certificate templates, issuing, QR verification, expiry, revocation and verification logs. |
| M07 | Capability Intelligence Engine | Skill gap, learning recommendation, training risk, workforce readiness and career readiness. |
| M08 | WMS-lite Practical Task | Task suggestion, assignment, progress, submission, evaluation and competency evidence update. |
| M09 | Dashboards & Analytics | HR dashboard, Manager dashboard, Employee dashboard, heatmaps, readiness, risk and certificate tracking. |
| M10 | Notification, Audit & Configuration | Reminders, audit logs, configuration of thresholds and scoring weights. |

## **3.2 Priority Definition**

| Priority | Meaning | Implementation Guidance |
| :---- | :---- | :---- |
| Must | Required for MVP and final demo value. | Plan these use cases first. Do not spend time on optional AI before these are working end-to-end. |
| Should | Important support or bonus value. | Implement after the core workflow is stable, especially if it improves demo and defense. |
| Could | Nice-to-have or advanced extension. | Only implement if there is enough time and no risk to core scope. |
| Future | Explicitly outside MVP. | Document only. Do not commit to implementation unless the team finishes early. |

# **4\. Complete Use Case List**

| ID | Use Case Name | Module | Primary Actor(s) | Priority | MVP Level | Summary |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| UC-01 | Authenticate User and Start Session | M01 | All registered users | Must | Core MVP | Allows a registered user to securely sign in and receive access according to role and permissions. |
| UC-02 | Manage Users, Roles and Permissions | M01 | System Admin | Must | Core MVP | Provides controlled account management, role assignment and permission governance. |
| UC-03 | Manage Departments | M02 | System Admin, HR / Training Manager | Must | Core MVP | Allows authorized users to manage departments used for employee grouping, reporting and department-level permission control. |
| UC-04 | Manage Job Positions | M02 | System Admin, HR / Training Manager | Must | Core MVP | Manages job positions used to map competency requirements, recommend learning and calculate readiness. |
| UC-05 | Manage Employee Profiles | M02 | System Admin, HR / Training Manager | Must | Core MVP | Maintains employee profiles, department assignment, job position, direct manager and employment status. |
| UC-06 | Manage Competency Categories and Competencies | M03 | HR / Training Manager, System Admin | Must | Core MVP | Creates competency categories and competency items such as AI Literacy, Data Literacy, Cybersecurity Awareness, Digital Collaboration and Digital Document Management. |
| UC-07 | Define Competency Levels and Achievement Criteria | M03 | HR / Training Manager | Must | Core MVP | Defines levels, descriptions and achievement criteria used in skill gap and readiness calculations. |
| UC-08 | Map Competency Requirements to Job Position | M03 | HR / Training Manager | Must | Core MVP | Defines required competency levels, weights and mandatory flags for a job position. |
| UC-09 | Manage Employee Competency Profile and Evidence | M03 | HR / Training Manager, Department Manager | Must | Core MVP | Maintains current employee competency levels and evidence portfolio from assessments, certificates, tasks, manager reviews or manual evidence. |
| UC-10 | Create and Manage Course | M04 | Internal Trainer, HR / Training Manager | Must | Core MVP | Allows trainers to create courses with metadata, completion rules, target audience and publication status. |
| UC-11 | Manage Lessons and Learning Materials | M04 | Internal Trainer | Must | Core MVP | Manages course modules, lessons, text content, video links and uploaded materials such as PDF, slides or documents. |
| UC-12 | Map Course to Competencies | M04 | Internal Trainer, HR / Training Manager | Must | Core MVP | Links courses to competencies with target level, coverage weight and learning outcome description. |
| UC-13 | Assign Course to Employee, Department or Position | M04 | HR / Training Manager, Department Manager | Must | Core MVP | Assigns courses to individual employees, departments or job positions with deadline and completion requirement. |
| UC-14 | Learn Lesson and Track Progress | M04 | Employee | Must | Core MVP | Enables employees to view course lessons and records learning progress for completion, risk and dashboard reporting. |
| UC-15 | Manage Question Bank | M05 | Internal Trainer | Must | Core MVP | Creates, edits and organizes questions, options, correct answers, explanations, difficulty and competency mapping. |
| UC-16 | Create and Manage Assessment | M05 | Internal Trainer, HR / Training Manager | Must | Core MVP | Defines assessment metadata, pass score, attempt limits, time limit, question set and scoring rules. |
| UC-17 | Take Assessment and Submit Attempt | M05 | Employee | Must | Core MVP | Allows employees to take assessments, submit answers, receive score and record attempt history. |
| UC-18 | Analyze Skill Gap | M07 | HR / Training Manager, Department Manager, Employee, System Scheduler | Must | Core MVP \- Rule-based | Compares current employee competency levels with required levels for current or target position and identifies missing capabilities. |
| UC-19 | Generate Learning Recommendation | M07 | Employee, HR / Training Manager, Department Manager | Must | Core MVP \- Rule-based | Recommends courses or learning paths based on skill gaps, course-competency mapping, assessment results and assignment history. |
| UC-20 | Calculate Training Risk Score | M07 | System Scheduler, HR / Training Manager, Department Manager | Must | Core MVP \- Rule-based | Detects employees who may delay or fail training based on progress, low scores, deadlines, failed attempts and inactivity. |
| UC-21 | Calculate Workforce Readiness Score | M07 | HR / Training Manager, Department Manager, Employee, System Scheduler | Must | Core MVP \- Rule-based | Calculates an explainable readiness score from competency, certificate, learning progress, compliance and task performance. |
| UC-22 | Issue Digital Certificate | M06 | System, HR / Training Manager, Internal Trainer | Must | Core MVP | Issues a verifiable digital certificate with certificate code, QR URL, status, issue date, expiry date and generated PDF. |
| UC-23 | Verify Digital Certificate by Code or QR | M06 | Certificate Verifier, Employee, HR / Training Manager | Must | Core MVP | Allows verification of certificate authenticity and status without exposing private employee records. |
| UC-24 | Revoke or Update Certificate Status | M06 | HR / Training Manager, System Admin | Must | Core MVP | Manages certificate lifecycle including status change, revocation reason, expiry and audit history. |
| UC-25 | Generate AI Question Draft | M05 | Internal Trainer | Should | Optional / Bonus | Uses AI to generate draft quiz or scenario-based questions that must be reviewed by a trainer before official use. |
| UC-26 | Generate AI Practical Task Suggestion | M08 | Department Manager, Internal Trainer | Should | Optional / Bonus | Suggests practical tasks and evaluation criteria based on missing competency, completed course or learning outcome. |
| UC-27 | Create and Assign Practical Task | M08 | Department Manager, HR / Training Manager, Internal Trainer | Must | Core MVP | Creates and assigns WMS-lite practical tasks with description, deadline, expected output and evaluation criteria. |
| UC-28 | Submit Practical Task Result | M08 | Employee | Must | Core MVP | Allows employees to submit task progress, final result, notes, links or evidence attachments. |
| UC-29 | Evaluate Practical Task and Confirm Evidence | M08 | Department Manager, Internal Trainer | Must | Core MVP | Allows authorized evaluator to score task, provide feedback, confirm competency impact and create competency evidence. |
| UC-30 | View HR Dashboard and Workforce Analytics | M09 | HR / Training Manager | Must | Core MVP | Provides HR-level dashboard for competency heatmap, risk list, readiness, certificate status, progress and task performance. |
| UC-31 | View Department Manager Dashboard | M09 | Department Manager | Must | Core MVP | Provides department-scoped dashboard for team progress, risk, readiness, skill gaps and practical tasks. |
| UC-32 | View Employee Learning, Certificates and Competency Profile | M09 | Employee | Must | Core MVP | Provides employee self-service dashboard with learning plan, progress, assessment results, certificates, tasks, evidence and competency summary. |
| UC-33 | Evaluate Career or Promotion Readiness | M07 | HR / Training Manager, Department Manager | Should | Optional / Bonus | Compares current employee capability with target position requirements and recommends missing competencies, courses and tasks. |
| UC-34 | Send Notification and Reminder | M10 | System Scheduler, Employee, Department Manager, HR / Training Manager | Should | MVP Support / Optional Depth | Sends in-app notifications and reminders for learning assignments, assessment deadlines, high risk, certificate expiry and task updates. |
| UC-35 | View Audit Log | M10 | System Admin, HR / Training Manager | Must | Core MVP | Provides audit trail for security-sensitive and business-critical actions such as login, role changes, certificate status changes, task evaluation and competency updates. |
| UC-36 | Configure Scoring Weights and Thresholds | M10 | System Admin, HR / Training Manager | Should | Core Config / Can be simplified | Allows authorized users to configure weights and thresholds for readiness, risk levels, pass scores, certificate expiry reminders and other rule-based calculations. |

## **4.1 Recommended MVP Delivery Order**

| Recommended Phase | Use Cases | Goal |
| :---- | :---- | :---- |
| Phase 1 \- Foundation | UC-01 to UC-05, UC-35 | Login, user/role setup, organization structure, employee profile and audit baseline. |
| Phase 2 \- Competency Core | UC-06 to UC-09 | Competency framework, levels, position requirements and employee competency profile/evidence. |
| Phase 3 \- Learning Core | UC-10 to UC-17 | Course content, materials, mapping, assignment, learning progress, question bank and assessment. |
| Phase 4 \- Intelligence Core | UC-18 to UC-21, UC-36 simplified | Skill gap, recommendation, risk score and readiness score with transparent formulas. |
| Phase 5 \- Certificate Core | UC-22 to UC-24 | Certificate issuing, PDF/QR verification and lifecycle management. |
| Phase 6 \- WMS-lite Evidence | UC-27 to UC-29 | Practical task assignment, submission, evaluation and competency evidence update. |
| Phase 7 \- Dashboards | UC-30 to UC-32 | HR, Manager and Employee dashboards using data from previous modules. |
| Phase 8 \- Bonus AI/Support | UC-25, UC-26, UC-33, UC-34 | AI draft question, AI task suggestion, career readiness and notification depth. |

# **5\. Detailed Use Case Specifications**

This section is the most important part of the document. Each use case is written so that the team can derive screens, backend endpoints, database entities, validation rules, permission checks and test cases.

## **UC-01 \- Authenticate User and Start Session**

| Module | M01 |
| :---- | :---- |
| **Priority / MVP Level** | Must / Core MVP |
| **Use Case Level** | User goal |
| **Primary Actor(s)** | All registered users |
| **Supporting Actor(s)** | Backend Auth Service, PostgreSQL, JWT middleware |
| **Trigger** | A user opens the login page and submits credentials. |
| **Description** | Allows a registered user to securely sign in and receive access according to role and permissions. |
| **Preconditions** | 1\. User account exists and is active. 2\. User has at least one assigned role. 3\. The authentication service and database are available. |
| **Main Flow** | 1\. User opens the Login screen. 2\. System displays username/email and password inputs. 3\. User submits credentials. 4\. System validates required fields and input format. 5\. System checks account status and password hash. 6\. System generates an access token and refresh token. 7\. System records login audit information. 8\. System redirects user to the correct role-based landing dashboard. |
| **Alternative Flow(s)** | A1 \- User has multiple roles: system loads the default role and allows role switch only if supported by permission. A2 \- First login or temporary password: system requires password change before entering the dashboard. |
| **Exception Flow(s)** | E1 \- Invalid credentials: system returns a generic error message without revealing whether email or password is wrong. E2 \- Inactive/archived user: system blocks login and logs the attempt. E3 \- Too many failed attempts: system can temporarily lock the account or require admin/HR intervention depending on configuration. |
| **Postconditions** | 1\. Valid session is created. 2\. Refresh token is stored securely. 3\. User permissions are available to frontend route guard and backend authorization middleware. |
| **Business Rules** | BR-AUTH-01: Only active users can log in. BR-AUTH-02: Password must never be stored in plain text. BR-AUTH-03: Every successful or failed login attempt should be auditable. |
| **Main Data Entities** | users, user\_roles, roles, permissions, refresh\_tokens, audit\_logs |
| **Candidate API Endpoints** | POST /api/auth/login; POST /api/auth/refresh-token; POST /api/auth/logout; GET /api/me |
| **Main UI Screen(s)** | Login Page, Change Password Page, Role-based Dashboard |
| **Acceptance Criteria** | \- Given an active user with valid credentials, when logging in, then the system returns tokens and redirects to the proper dashboard. \- Given an inactive user, when logging in, then access is denied and the event is audited. |
| **Security / Permission Notes** | Password hashing, JWT expiration, refresh token rotation, generic error messages and audit logging are mandatory. |

## **UC-02 \- Manage Users, Roles and Permissions**

| Module | M01 |
| :---- | :---- |
| **Priority / MVP Level** | Must / Core MVP |
| **Use Case Level** | Admin goal |
| **Primary Actor(s)** | System Admin |
| **Supporting Actor(s)** | HR / Training Manager for business account input |
| **Trigger** | Admin needs to create or maintain user access. |
| **Description** | Provides controlled account management, role assignment and permission governance. |
| **Preconditions** | 1\. Admin is authenticated. 2\. Role and permission master data exist. 3\. Organization structure is available if linking employee records. |
| **Main Flow** | 1\. Admin opens User Management. 2\. System lists users with filters by role, status and department. 3\. Admin creates or edits a user account. 4\. Admin assigns one or more roles. 5\. Admin links account to employee profile if applicable. 6\. System validates uniqueness of email/username. 7\. System saves user and role assignments. 8\. System writes audit log. |
| **Alternative Flow(s)** | A1 \- Admin disables a user instead of deleting the account. A2 \- Admin resets password or forces password change. A3 \- Admin updates permission mapping for a role if permission management is enabled in MVP. |
| **Exception Flow(s)** | E1 \- Duplicate email: system rejects the request. E2 \- Removing last System Admin: system blocks the operation. E3 \- Role assignment violates policy: system rejects and records the reason. |
| **Postconditions** | 1\. User account and role assignments are updated. 2\. Permission checks immediately reflect updated roles after next token refresh or re-login. |
| **Business Rules** | BR-AUTH-04: The system must prevent privilege escalation by non-admin users. BR-AUTH-05: User deletion should be logical deactivation, not hard deletion. BR-AUDIT-01: Role and permission changes must be audited. |
| **Main Data Entities** | users, roles, permissions, user\_roles, employees, audit\_logs |
| **Candidate API Endpoints** | GET /api/users; POST /api/users; PUT /api/users/{id}; PATCH /api/users/{id}/status; PUT /api/users/{id}/roles |
| **Main UI Screen(s)** | User Management, User Create/Edit Form, Role & Permission Matrix |
| **Acceptance Criteria** | \- Admin can create a user and assign roles. \- Non-admin users cannot access user management APIs. \- Role changes are visible in audit logs. |
| **Security / Permission Notes** | Only System Admin can manage technical roles and permission mapping. |

## **UC-03 \- Manage Departments**

| Module | M02 |
| :---- | :---- |
| **Priority / MVP Level** | Must / Core MVP |
| **Use Case Level** | Business admin goal |
| **Primary Actor(s)** | System Admin, HR / Training Manager |
| **Supporting Actor(s)** | Department Manager |
| **Trigger** | HR needs to define or update the company structure. |
| **Description** | Allows authorized users to manage departments used for employee grouping, reporting and department-level permission control. |
| **Preconditions** | 1\. User has permission to manage organization structure. 2\. No active dependency blocks update. |
| **Main Flow** | 1\. User opens Department Management. 2\. System displays department list and hierarchy if supported. 3\. User creates a new department with name, code and description. 4\. User assigns department manager if available. 5\. System validates uniqueness of code/name. 6\. System saves department record. 7\. System updates organization filters and dashboard dimensions. |
| **Alternative Flow(s)** | A1 \- User updates department metadata. A2 \- User archives a department when no active employees are assigned or after transfer. A3 \- User reassigns manager. |
| **Exception Flow(s)** | E1 \- Duplicate department code: system rejects. E2 \- Department has active employees: archive is blocked or requires transfer first. E3 \- Selected manager is inactive: system rejects. |
| **Postconditions** | 1\. Department is available for employee assignment, dashboards and access scope. 2\. Department changes are logged. |
| **Business Rules** | BR-ORG-01: Department code must be unique. BR-ORG-02: Department Manager can only access employees in managed department. BR-ORG-03: Master data should be archived instead of hard deleted. |
| **Main Data Entities** | departments, employees, users, audit\_logs |
| **Candidate API Endpoints** | GET /api/departments; POST /api/departments; PUT /api/departments/{id}; PATCH /api/departments/{id}/status |
| **Main UI Screen(s)** | Department List, Department Form, Organization Settings |
| **Acceptance Criteria** | \- HR can create departments. \- Duplicate department code is rejected. \- Archived departments are not available for new employee assignment by default. |
| **Security / Permission Notes** | Department operations are limited to Admin/HR; Department Manager can view own department metadata only if allowed. |

## **UC-04 \- Manage Job Positions**

| Module | M02 |
| :---- | :---- |
| **Priority / MVP Level** | Must / Core MVP |
| **Use Case Level** | Business admin goal |
| **Primary Actor(s)** | System Admin, HR / Training Manager |
| **Supporting Actor(s)** | Department Manager |
| **Trigger** | HR needs to create or maintain job positions and their capability expectations. |
| **Description** | Manages job positions used to map competency requirements, recommend learning and calculate readiness. |
| **Preconditions** | 1\. User has organization management permission. 2\. Departments exist if positions are department-specific. |
| **Main Flow** | 1\. User opens Job Position Management. 2\. System lists positions with department, status and requirement coverage. 3\. User creates a position with code, title, department and description. 4\. System validates code uniqueness. 5\. User saves the position. 6\. System allows competency requirement mapping through UC-08. |
| **Alternative Flow(s)** | A1 \- Position is generic and can be used across departments. A2 \- HR archives position after employees are transferred. A3 \- HR copies requirements from an existing position. |
| **Exception Flow(s)** | E1 \- Duplicate position code: system rejects. E2 \- Position used by active employees: archive requires confirmation and migration plan. E3 \- Missing department for department-specific position: system rejects. |
| **Postconditions** | 1\. Position can be assigned to employees and mapped to competency requirements. 2\. Readiness and skill gap calculations can reference this position. |
| **Business Rules** | BR-ORG-04: Each active employee should have one current job position. BR-COMP-01: Each active job position should have at least one required competency before capability analysis is considered complete. |
| **Main Data Entities** | job\_positions, departments, employees, position\_competency\_requirements, audit\_logs |
| **Candidate API Endpoints** | GET /api/job-positions; POST /api/job-positions; PUT /api/job-positions/{id}; PATCH /api/job-positions/{id}/status |
| **Main UI Screen(s)** | Job Position List, Job Position Form, Position Requirement View |
| **Acceptance Criteria** | \- HR can create a job position. \- A position without competency requirements is marked as incomplete. \- Active position cannot be removed without handling linked employees. |
| **Security / Permission Notes** | Only Admin/HR can create or archive positions; Manager may request changes but not directly modify master data unless permission is granted. |

## **UC-05 \- Manage Employee Profiles**

| Module | M02 |
| :---- | :---- |
| **Priority / MVP Level** | Must / Core MVP |
| **Use Case Level** | Business admin goal |
| **Primary Actor(s)** | System Admin, HR / Training Manager |
| **Supporting Actor(s)** | Department Manager, Employee |
| **Trigger** | A new employee joins or employee information changes. |
| **Description** | Maintains employee profiles, department assignment, job position, direct manager and employment status. |
| **Preconditions** | 1\. Departments and job positions exist. 2\. User has employee management permission. |
| **Main Flow** | 1\. HR opens Employee Management. 2\. System lists employees with filters by department, position and status. 3\. HR creates or updates employee profile. 4\. HR assigns department, position and direct manager. 5\. System validates required fields and references. 6\. System saves the employee profile. 7\. System initializes competency profile baseline if applicable. |
| **Alternative Flow(s)** | A1 \- HR transfers employee to another department or position. A2 \- HR archives inactive employee. A3 \- HR links an existing user account to employee profile. |
| **Exception Flow(s)** | E1 \- Employee code already exists. E2 \- Manager belongs to invalid department scope. E3 \- Required position is inactive. |
| **Postconditions** | 1\. Employee is available for course assignment, assessment, certificates, task assignment and dashboards. 2\. Employee profile changes are audited. |
| **Business Rules** | BR-EMP-01: Employee code must be unique. BR-EMP-02: Employee cannot edit official competency level, score or certificate status. BR-EMP-03: Department Manager access must be limited by managed department. |
| **Main Data Entities** | employees, users, departments, job\_positions, employee\_competency\_profiles, audit\_logs |
| **Candidate API Endpoints** | GET /api/employees; POST /api/employees; PUT /api/employees/{id}; PATCH /api/employees/{id}/status; PUT /api/employees/{id}/assignment |
| **Main UI Screen(s)** | Employee List, Employee Detail, Employee Create/Edit Form, Employee Competency Profile |
| **Acceptance Criteria** | \- HR can create employee and assign position. \- Manager can view employees in own department only. \- Employee can view own profile but cannot modify official evaluation fields. |
| **Security / Permission Notes** | Employee personal and performance data must be protected by role and department scope. |

## **UC-06 \- Manage Competency Categories and Competencies**

| Module | M03 |
| :---- | :---- |
| **Priority / MVP Level** | Must / Core MVP |
| **Use Case Level** | Business admin goal |
| **Primary Actor(s)** | HR / Training Manager, System Admin |
| **Supporting Actor(s)** | Internal Trainer, Department Manager |
| **Trigger** | The organization needs to define digital capabilities used for training and assessment. |
| **Description** | Creates competency categories and competency items such as AI Literacy, Data Literacy, Cybersecurity Awareness, Digital Collaboration and Digital Document Management. |
| **Preconditions** | 1\. User has competency management permission. 2\. Competency naming standard is available. |
| **Main Flow** | 1\. HR opens Competency Framework. 2\. System displays categories and competencies. 3\. HR creates a category. 4\. HR creates competency with code, name, description and category. 5\. HR defines whether competency is active. 6\. System validates uniqueness and required fields. 7\. System saves competency for mapping to courses and positions. |
| **Alternative Flow(s)** | A1 \- HR updates descriptions and achievement criteria. A2 \- HR archives unused competency. A3 \- Trainer suggests competency updates for course alignment. |
| **Exception Flow(s)** | E1 \- Duplicate competency code. E2 \- Competency is already used by position/course: archive is restricted or requires impact review. E3 \- Missing category. |
| **Postconditions** | 1\. Competency is available for position requirements, course mapping, assessment design and evidence portfolio. |
| **Business Rules** | BR-COMP-02: Every competency must belong to one active category. BR-COMP-03: Competency code must be unique. BR-COMP-04: Competency used in historical records should not be hard deleted. |
| **Main Data Entities** | competency\_categories, competencies, audit\_logs |
| **Candidate API Endpoints** | GET /api/competency-categories; POST /api/competencies; PUT /api/competencies/{id}; PATCH /api/competencies/{id}/status |
| **Main UI Screen(s)** | Competency Framework, Competency Form, Competency Detail |
| **Acceptance Criteria** | \- HR can create competency under category. \- Duplicate code is rejected. \- Archived competencies are hidden from new mapping but historical evidence remains readable. |
| **Security / Permission Notes** | Only HR/Admin can change official competency framework. |

## **UC-07 \- Define Competency Levels and Achievement Criteria**

| Module | M03 |
| :---- | :---- |
| **Priority / MVP Level** | Must / Core MVP |
| **Use Case Level** | Business admin goal |
| **Primary Actor(s)** | HR / Training Manager |
| **Supporting Actor(s)** | Internal Trainer, Department Manager |
| **Trigger** | HR needs measurable levels to compare required and current competency. |
| **Description** | Defines levels, descriptions and achievement criteria used in skill gap and readiness calculations. |
| **Preconditions** | 1\. Competency exists. 2\. The organization agrees on level scale, for example 1 to 5\. |
| **Main Flow** | 1\. HR opens a competency detail page. 2\. System displays existing level definitions. 3\. HR adds or updates level name, numeric value, description and evidence criteria. 4\. System validates sequence and uniqueness. 5\. HR saves level definitions. 6\. System applies levels to requirement mapping and employee profiles. |
| **Alternative Flow(s)** | A1 \- HR uses default level template. A2 \- HR configures different criteria by competency while keeping same numeric scale. |
| **Exception Flow(s)** | E1 \- Invalid level sequence. E2 \- Removing a level already used in historical records is blocked. E3 \- Missing achievement criteria. |
| **Postconditions** | 1\. Competency levels can be used for skill gap calculation and evaluation criteria. |
| **Business Rules** | BR-COMP-05: Level values must be comparable numerically. BR-COMP-06: Each level must have clear description and achievement criteria. BR-COMP-07: Historical levels should remain auditable. |
| **Main Data Entities** | competency\_levels, competencies, audit\_logs |
| **Candidate API Endpoints** | GET /api/competencies/{id}/levels; PUT /api/competencies/{id}/levels |
| **Main UI Screen(s)** | Competency Level Editor, Competency Detail |
| **Acceptance Criteria** | \- HR can configure level criteria. \- Skill gap calculation can compare required level and current level. \- Used level values cannot be silently deleted. |
| **Security / Permission Notes** | Level changes require HR/Admin permission and audit logging. |

## **UC-08 \- Map Competency Requirements to Job Position**

| Module | M03 |
| :---- | :---- |
| **Priority / MVP Level** | Must / Core MVP |
| **Use Case Level** | Business admin goal |
| **Primary Actor(s)** | HR / Training Manager |
| **Supporting Actor(s)** | Department Manager |
| **Trigger** | A job position needs required competencies for capability governance. |
| **Description** | Defines required competency levels, weights and mandatory flags for a job position. |
| **Preconditions** | 1\. Job position exists. 2\. Competencies and levels exist. 3\. User has competency requirement management permission. |
| **Main Flow** | 1\. HR opens Position Requirement screen. 2\. System displays current competency requirements. 3\. HR adds competency requirement with required level, weight and mandatory flag. 4\. System validates no duplicate competency for same position. 5\. HR saves requirement set. 6\. System marks position as capability-ready. 7\. System triggers recalculation or flags recalculation for employees in this position. |
| **Alternative Flow(s)** | A1 \- HR copies requirement set from similar position. A2 \- HR changes weight based on department priority. A3 \- Manager proposes changes for HR approval. |
| **Exception Flow(s)** | E1 \- Total weight is invalid according to configuration. E2 \- Required level does not exist. E3 \- Position is inactive. |
| **Postconditions** | 1\. Position has measurable capability requirements. 2\. Skill gap and career readiness can be calculated for employees linked to the position. |
| **Business Rules** | BR-COMP-08: Active job position should have at least one required competency. BR-COMP-09: Required level must be greater than or equal to the minimum configured level. BR-COMP-10: Weight and mandatory flag must be visible in analysis explanation. |
| **Main Data Entities** | job\_positions, competencies, competency\_levels, position\_competency\_requirements, audit\_logs |
| **Candidate API Endpoints** | GET /api/job-positions/{id}/competency-requirements; PUT /api/job-positions/{id}/competency-requirements |
| **Main UI Screen(s)** | Position Requirement Matrix, Job Position Detail |
| **Acceptance Criteria** | \- HR can map competencies to position. \- Duplicate competency requirement is rejected. \- Skill gap results use the latest active requirement set. |
| **Security / Permission Notes** | Only HR/Admin can finalize requirement mapping; Manager access is read-only or proposal-based. |

## **UC-09 \- Manage Employee Competency Profile and Evidence**

| Module | M03 |
| :---- | :---- |
| **Priority / MVP Level** | Must / Core MVP |
| **Use Case Level** | Business admin goal |
| **Primary Actor(s)** | HR / Training Manager, Department Manager |
| **Supporting Actor(s)** | Employee, Internal Trainer, System Scheduler |
| **Trigger** | An assessment, certificate, task evaluation or manual review confirms competency evidence. |
| **Description** | Maintains current employee competency levels and evidence portfolio from assessments, certificates, tasks, manager reviews or manual evidence. |
| **Preconditions** | 1\. Employee and competency exist. 2\. Evidence source is valid and authorized. 3\. User has permission to confirm or view evidence. |
| **Main Flow** | 1\. Authorized user opens Employee Competency Profile. 2\. System displays competency levels, evidence source and history. 3\. User adds or confirms evidence with source type, description, attachment/reference and confidence. 4\. System validates evidence source and permission. 5\. System saves evidence record. 6\. System updates current competency profile if the evidence meets update rules. 7\. System recalculates related readiness score or marks it for recalculation. |
| **Alternative Flow(s)** | A1 \- System creates evidence automatically after passed assessment. A2 \- System creates certificate evidence after certificate issuance. A3 \- Manager creates task evidence after evaluation. A4 \- HR adds manual evidence during data migration. |
| **Exception Flow(s)** | E1 \- Employee attempts to modify own official competency: blocked. E2 \- Evidence source is incomplete. E3 \- User lacks department scope. |
| **Postconditions** | 1\. Evidence is stored and traceable. 2\. Employee competency profile reflects confirmed evidence according to rules. |
| **Business Rules** | BR-EVID-01: Evidence must have source type. BR-EVID-02: Task evidence affects competency only after manager/trainer evaluation. BR-EVID-03: Official competency changes must be auditable. BR-EVID-04: Employee can view own evidence but cannot self-confirm official level. |
| **Main Data Entities** | employee\_competency\_profiles, competency\_evidences, assessment\_attempts, certificates, task\_evaluations, audit\_logs |
| **Candidate API Endpoints** | GET /api/employees/{id}/competency-profile; POST /api/employees/{id}/competency-evidences; PUT /api/competency-evidences/{id}/confirm |
| **Main UI Screen(s)** | Employee Competency Profile, Evidence Portfolio, Evidence Detail |
| **Acceptance Criteria** | \- Manager can confirm evidence for employees in own department. \- Employee can view evidence history. \- Confirmed evidence updates readiness inputs when valid. |
| **Security / Permission Notes** | Evidence confirmation requires strict role and department-level authorization. |

## **UC-10 \- Create and Manage Course**

| Module | M04 |
| :---- | :---- |
| **Priority / MVP Level** | Must / Core MVP |
| **Use Case Level** | Content owner goal |
| **Primary Actor(s)** | Internal Trainer, HR / Training Manager |
| **Supporting Actor(s)** | System Admin |
| **Trigger** | Trainer needs to create learning content for one or more competencies. |
| **Description** | Allows trainers to create courses with metadata, completion rules, target audience and publication status. |
| **Preconditions** | 1\. Trainer is authenticated and has course management permission. 2\. Competencies exist for mapping. 3\. Storage is available for materials if files are uploaded. |
| **Main Flow** | 1\. Trainer opens Course Management. 2\. System displays course list and status. 3\. Trainer creates course with title, code, description, difficulty, estimated duration and completion rule. 4\. Trainer sets draft status. 5\. Trainer saves course. 6\. System validates uniqueness and required metadata. 7\. Trainer later publishes course when lessons and assessment are ready. |
| **Alternative Flow(s)** | A1 \- Trainer duplicates existing course as template. A2 \- HR reviews course before publish if approval workflow is enabled. A3 \- Course remains draft until competency mapping is complete. |
| **Exception Flow(s)** | E1 \- Duplicate course code. E2 \- Missing required completion rule. E3 \- User lacks permission to publish. |
| **Postconditions** | 1\. Course exists and can receive lessons, materials, competency mapping and assignments. 2\. Published courses become available for enrollment/assignment. |
| **Business Rules** | BR-COURSE-01: Course code must be unique. BR-COURSE-02: Course should be mapped to at least one competency before assignment. BR-COURSE-03: Published course must have at least one lesson or learning material. |
| **Main Data Entities** | courses, course\_modules, lessons, course\_competencies, audit\_logs |
| **Candidate API Endpoints** | GET /api/courses; POST /api/courses; PUT /api/courses/{id}; PATCH /api/courses/{id}/status |
| **Main UI Screen(s)** | Course List, Course Form, Course Detail, Course Publish Checklist |
| **Acceptance Criteria** | \- Trainer can create draft course. \- Course cannot be assigned if not published. \- Course mapping status is visible. |
| **Security / Permission Notes** | Only Trainer/HR/Admin can manage courses; Employee has read-only access to assigned/published courses. |

## **UC-11 \- Manage Lessons and Learning Materials**

| Module | M04 |
| :---- | :---- |
| **Priority / MVP Level** | Must / Core MVP |
| **Use Case Level** | Content owner goal |
| **Primary Actor(s)** | Internal Trainer |
| **Supporting Actor(s)** | MinIO/Object Storage, HR / Training Manager |
| **Trigger** | Trainer needs to add learning content to a course. |
| **Description** | Manages course modules, lessons, text content, video links and uploaded materials such as PDF, slides or documents. |
| **Preconditions** | 1\. Course exists. 2\. Trainer has edit permission for the course. 3\. File storage is configured. |
| **Main Flow** | 1\. Trainer opens course content builder. 2\. Trainer creates module or lesson. 3\. Trainer enters lesson title, content and order. 4\. Trainer uploads material or adds external URL. 5\. System validates file type and size. 6\. System stores file in MinIO/object storage and metadata in database. 7\. System displays lesson in course structure. |
| **Alternative Flow(s)** | A1 \- Trainer reorders lessons. A2 \- Trainer replaces a material file while keeping version history if enabled. A3 \- Trainer marks a lesson as required or optional. |
| **Exception Flow(s)** | E1 \- Unsupported file type. E2 \- File exceeds size limit. E3 \- Storage service unavailable. E4 \- Lesson order conflict. |
| **Postconditions** | 1\. Lesson and materials are available for learners after course publication. 2\. File metadata and access path are stored. |
| **Business Rules** | BR-FILE-01: Uploaded learning materials must pass file type and size validation. BR-FILE-02: File access must require proper course access unless public by design. BR-COURSE-04: Lesson order must be deterministic. |
| **Main Data Entities** | course\_modules, lessons, learning\_materials, file\_objects, audit\_logs |
| **Candidate API Endpoints** | POST /api/courses/{id}/modules; POST /api/courses/{id}/lessons; POST /api/learning-materials/upload; PUT /api/lessons/{id}/order |
| **Main UI Screen(s)** | Course Builder, Lesson Editor, Material Upload Dialog |
| **Acceptance Criteria** | \- Trainer can upload valid PDF material. \- Invalid file type is rejected. \- Employee can view materials only when assigned/enrolled. |
| **Security / Permission Notes** | Use signed URL or controlled download endpoint to prevent unauthorized file access. |

## **UC-12 \- Map Course to Competencies**

| Module | M04 |
| :---- | :---- |
| **Priority / MVP Level** | Must / Core MVP |
| **Use Case Level** | Content owner goal |
| **Primary Actor(s)** | Internal Trainer, HR / Training Manager |
| **Supporting Actor(s)** | Department Manager |
| **Trigger** | A course must contribute to one or more competencies for recommendation and profile update. |
| **Description** | Links courses to competencies with target level, coverage weight and learning outcome description. |
| **Preconditions** | 1\. Course exists. 2\. Competencies and levels exist. 3\. User has course/competency mapping permission. |
| **Main Flow** | 1\. Trainer opens Course Competency Mapping. 2\. System shows current mapping and course objectives. 3\. Trainer selects competency and target level. 4\. Trainer enters learning outcome and coverage weight. 5\. System validates duplicates and level references. 6\. Trainer saves mapping. 7\. System uses mapping for recommendations and evidence generation. |
| **Alternative Flow(s)** | A1 \- HR validates mapping before course publish. A2 \- Course maps to multiple competencies. A3 \- Mapping can include prerequisite competencies. |
| **Exception Flow(s)** | E1 \- Mapping to inactive competency is blocked. E2 \- Duplicate competency mapping is rejected. E3 \- Coverage weight invalid. |
| **Postconditions** | 1\. Course can be recommended based on skill gap. 2\. Assessment and certificate results can update competency evidence. |
| **Business Rules** | BR-COURSE-05: Each assignable course should map to at least one competency. BR-REC-01: Learning recommendation must use course-competency mapping. BR-EVID-05: Competency evidence from course completion requires valid mapping. |
| **Main Data Entities** | courses, competencies, competency\_levels, course\_competencies, audit\_logs |
| **Candidate API Endpoints** | GET /api/courses/{id}/competencies; PUT /api/courses/{id}/competencies |
| **Main UI Screen(s)** | Course Competency Mapping, Course Detail |
| **Acceptance Criteria** | \- Mapped course appears in recommendation results for related skill gaps. \- Course without competency mapping is flagged as incomplete. |
| **Security / Permission Notes** | Mapping is limited to Trainer/HR/Admin. |

## **UC-13 \- Assign Course to Employee, Department or Position**

| Module | M04 |
| :---- | :---- |
| **Priority / MVP Level** | Must / Core MVP |
| **Use Case Level** | Business user goal |
| **Primary Actor(s)** | HR / Training Manager, Department Manager |
| **Supporting Actor(s)** | Employee, System Scheduler |
| **Trigger** | A training plan needs to be assigned to target learners. |
| **Description** | Assigns courses to individual employees, departments or job positions with deadline and completion requirement. |
| **Preconditions** | 1\. Course is published and active. 2\. Target employees exist and are active. 3\. Actor has permission and department scope. |
| **Main Flow** | 1\. HR/Manager opens Course Assignment. 2\. User selects course. 3\. User selects target type: employee, department or position. 4\. System resolves target employees. 5\. User sets deadline and notes. 6\. System validates eligibility and duplicate active assignments. 7\. System creates enrollments/assignments. 8\. System notifies employees. |
| **Alternative Flow(s)** | A1 \- Manager assigns course only to employees in own department. A2 \- HR assigns mandatory course to an entire position. A3 \- Re-assignment extends deadline if policy allows. |
| **Exception Flow(s)** | E1 \- Course not published. E2 \- Target includes inactive employees. E3 \- Manager attempts to assign outside department scope. E4 \- Duplicate assignment exists. |
| **Postconditions** | 1\. Employees can access assigned course. 2\. Dashboard reflects enrollment count and deadline. 3\. Notifications/reminders can be generated. |
| **Business Rules** | BR-ASSIGN-01: Only published courses can be assigned. BR-ASSIGN-02: Department Manager can assign only within managed department. BR-ASSIGN-03: Assignment deadline is required for risk calculation when training is time-bound. |
| **Main Data Entities** | course\_assignments, enrollments, employees, courses, notifications, audit\_logs |
| **Candidate API Endpoints** | POST /api/course-assignments; GET /api/enrollments/my; GET /api/courses/{id}/assignments |
| **Main UI Screen(s)** | Course Assignment Wizard, Assignment Detail, My Learning |
| **Acceptance Criteria** | \- HR can assign course to department. \- Manager cannot assign course outside department. \- Employee sees assigned course in My Learning. |
| **Security / Permission Notes** | Target resolution must be done on backend to prevent client-side scope bypass. |

## **UC-14 \- Learn Lesson and Track Progress**

| Module | M04 |
| :---- | :---- |
| **Priority / MVP Level** | Must / Core MVP |
| **Use Case Level** | Employee goal |
| **Primary Actor(s)** | Employee |
| **Supporting Actor(s)** | System Scheduler |
| **Trigger** | Employee opens an assigned course and studies lesson content. |
| **Description** | Enables employees to view course lessons and records learning progress for completion, risk and dashboard reporting. |
| **Preconditions** | 1\. Employee is authenticated. 2\. Employee is enrolled or assigned to the course. 3\. Course is published. 4\. Lessons are available. |
| **Main Flow** | 1\. Employee opens My Learning. 2\. Employee selects assigned course. 3\. System displays course structure and completion status. 4\. Employee opens a lesson. 5\. System validates access. 6\. Employee views content/materials. 7\. Employee marks lesson as completed or system auto-completes based on rule. 8\. System updates progress and timestamps. 9\. System refreshes enrollment progress. |
| **Alternative Flow(s)** | A1 \- Employee resumes from last viewed lesson. A2 \- Lesson requires minimum view time before completion. A3 \- Employee downloads allowed material. |
| **Exception Flow(s)** | E1 \- Employee not enrolled: access denied. E2 \- Material file unavailable. E3 \- Course archived after assignment: system follows policy to allow or block continuation. |
| **Postconditions** | 1\. Lesson progress is stored. 2\. Course progress is updated. 3\. Risk score and dashboard can use progress data. |
| **Business Rules** | BR-LEARN-01: Employee can access only assigned/enrolled courses unless course is open catalog. BR-LEARN-02: Progress must be traceable by lesson. BR-RISK-01: Inactivity and progress delay contribute to training risk. |
| **Main Data Entities** | enrollments, lesson\_progress, learning\_materials, courses, audit\_logs |
| **Candidate API Endpoints** | GET /api/my/courses; GET /api/courses/{id}/learn; POST /api/lessons/{id}/complete; GET /api/my/progress |
| **Main UI Screen(s)** | My Learning, Course Detail, Lesson Viewer |
| **Acceptance Criteria** | \- Employee progress increases after completing lesson. \- Unauthorized course access is denied. \- Dashboard reflects updated progress. |
| **Security / Permission Notes** | Lesson and file access must check enrollment and role. |

## **UC-15 \- Manage Question Bank**

| Module | M05 |
| :---- | :---- |
| **Priority / MVP Level** | Must / Core MVP |
| **Use Case Level** | Content owner goal |
| **Primary Actor(s)** | Internal Trainer |
| **Supporting Actor(s)** | AI Service optional, HR / Training Manager |
| **Trigger** | Trainer needs reusable questions for quizzes and assessments. |
| **Description** | Creates, edits and organizes questions, options, correct answers, explanations, difficulty and competency mapping. |
| **Preconditions** | 1\. Trainer has question management permission. 2\. Competencies exist if questions are competency-mapped. |
| **Main Flow** | 1\. Trainer opens Question Bank. 2\. System displays questions with filters by competency, difficulty and status. 3\. Trainer creates a question with type, content, options and correct answer. 4\. Trainer links question to competency and difficulty. 5\. System validates answer configuration. 6\. Trainer saves question as draft or active. 7\. System makes active questions available for assessment assembly. |
| **Alternative Flow(s)** | A1 \- Trainer imports questions from template if supported. A2 \- Trainer reviews AI-generated draft questions. A3 \- Trainer archives outdated questions. |
| **Exception Flow(s)** | E1 \- Multiple-choice question has no correct option. E2 \- Question content is empty. E3 \- User attempts to edit question used in published assessment; system creates version or blocks direct edit. |
| **Postconditions** | 1\. Question is stored and available for assessment if active. 2\. Question history is auditable if used in attempts. |
| **Business Rules** | BR-QB-01: Active question must have valid answer configuration. BR-QB-02: AI-generated question must be reviewed before official use. BR-QB-03: Questions used in historical attempts should be versioned or immutable. |
| **Main Data Entities** | question\_banks, questions, question\_options, competencies, audit\_logs |
| **Candidate API Endpoints** | GET /api/questions; POST /api/questions; PUT /api/questions/{id}; PATCH /api/questions/{id}/status |
| **Main UI Screen(s)** | Question Bank, Question Editor, Question Preview |
| **Acceptance Criteria** | \- Trainer can create valid multiple-choice question. \- Question without correct answer cannot be activated. \- Archived question is not selectable for new assessments. |
| **Security / Permission Notes** | Employees cannot access correct answers before attempt submission. |

## **UC-16 \- Create and Manage Assessment**

| Module | M05 |
| :---- | :---- |
| **Priority / MVP Level** | Must / Core MVP |
| **Use Case Level** | Content owner goal |
| **Primary Actor(s)** | Internal Trainer, HR / Training Manager |
| **Supporting Actor(s)** | Employee |
| **Trigger** | A course requires quiz, pre-assessment, post-assessment or final assessment. |
| **Description** | Defines assessment metadata, pass score, attempt limits, time limit, question set and scoring rules. |
| **Preconditions** | 1\. Course exists if assessment belongs to course. 2\. Question bank has active questions. 3\. Trainer has assessment management permission. |
| **Main Flow** | 1\. Trainer opens Assessment Management. 2\. Trainer creates assessment with type, title, pass score and attempt limit. 3\. Trainer selects questions manually or from question bank filters. 4\. System validates question count and scoring configuration. 5\. Trainer links assessment to course or competency. 6\. Trainer publishes assessment. 7\. System makes assessment available to eligible employees. |
| **Alternative Flow(s)** | A1 \- Assessment is configured as pre-assessment. A2 \- Assessment is configured as final certification assessment. A3 \- Random question selection is enabled if supported. |
| **Exception Flow(s)** | E1 \- Pass score outside allowed range. E2 \- Assessment has no questions. E3 \- Attempt limit invalid. E4 \- Publish blocked because linked course is draft. |
| **Postconditions** | 1\. Assessment is available to eligible learners. 2\. Assessment results can contribute to course completion, certificate issuance and competency evidence. |
| **Business Rules** | BR-ASMT-01: Published assessment must have at least one active question. BR-ASMT-02: Pass score must be configured before publishing. BR-ASMT-03: Final assessment result can trigger certificate eligibility. |
| **Main Data Entities** | assessments, assessment\_questions, questions, courses, competencies, audit\_logs |
| **Candidate API Endpoints** | GET /api/assessments; POST /api/assessments; PUT /api/assessments/{id}; POST /api/assessments/{id}/publish |
| **Main UI Screen(s)** | Assessment List, Assessment Builder, Assessment Preview |
| **Acceptance Criteria** | \- Trainer can publish a valid assessment. \- Assessment without questions cannot be published. \- Pass score is used during attempt submission. |
| **Security / Permission Notes** | Only Trainer/HR/Admin can create assessments; employees only access assigned assessments. |

## **UC-17 \- Take Assessment and Submit Attempt**

| Module | M05 |
| :---- | :---- |
| **Priority / MVP Level** | Must / Core MVP |
| **Use Case Level** | Employee goal |
| **Primary Actor(s)** | Employee |
| **Supporting Actor(s)** | Assessment Service, System Scheduler |
| **Trigger** | Employee starts a quiz or assessment for an assigned course. |
| **Description** | Allows employees to take assessments, submit answers, receive score and record attempt history. |
| **Preconditions** | 1\. Employee is eligible for the assessment. 2\. Assessment is published. 3\. Attempt limit has not been exceeded. 4\. Assessment window is open if time-bound. |
| **Main Flow** | 1\. Employee opens assessment from course or My Learning. 2\. System checks eligibility and attempt limit. 3\. System creates an assessment attempt. 4\. System displays questions without exposing correct answers. 5\. Employee answers questions. 6\. Employee submits attempt. 7\. System scores answers using configured rules. 8\. System stores attempt result, pass/fail status and answer details. 9\. System updates enrollment completion and competency evidence if applicable. |
| **Alternative Flow(s)** | A1 \- Auto-submit when time limit expires. A2 \- Employee saves draft if assessment allows resume. A3 \- Failed attempt allows retry if remaining attempts exist. |
| **Exception Flow(s)** | E1 \- Attempt limit exceeded. E2 \- Assessment expired or unpublished. E3 \- Network failure during submission: system should prevent duplicate scoring using idempotent submit behavior. E4 \- Employee tries to submit invalid answer format. |
| **Postconditions** | 1\. Attempt result is stored. 2\. Course progress and certificate eligibility may be updated. 3\. Risk score inputs are updated. |
| **Business Rules** | BR-ASMT-04: Employee cannot modify submitted answers after final submission. BR-ASMT-05: Failed attempts contribute to training risk. BR-CERT-01: Certificate eligibility depends on configured course and assessment completion rules. |
| **Main Data Entities** | assessment\_attempts, assessment\_answers, enrollments, competency\_evidences, training\_risk\_scores |
| **Candidate API Endpoints** | POST /api/assessments/{id}/attempts; GET /api/assessment-attempts/{id}; POST /api/assessment-attempts/{id}/submit; GET /api/my/assessment-results |
| **Main UI Screen(s)** | Assessment Start, Assessment Player, Assessment Result |
| **Acceptance Criteria** | \- Eligible employee can submit assessment and receive score. \- Attempt limit is enforced. \- Correct answers are hidden before submission. |
| **Security / Permission Notes** | Assessment access and answer visibility must be strictly controlled. |

## **UC-18 \- Analyze Skill Gap**

| Module | M07 |
| :---- | :---- |
| **Priority / MVP Level** | Must / Core MVP \- Rule-based |
| **Use Case Level** | System/business analysis goal |
| **Primary Actor(s)** | HR / Training Manager, Department Manager, Employee, System Scheduler |
| **Supporting Actor(s)** | Capability Intelligence Engine |
| **Trigger** | User views competency gap or system recalculates after profile/requirement changes. |
| **Description** | Compares current employee competency levels with required levels for current or target position and identifies missing capabilities. |
| **Preconditions** | 1\. Employee has assigned job position. 2\. Position has competency requirements. 3\. Employee competency profile exists. 4\. Calculation weights and level scale are configured. |
| **Main Flow** | 1\. User opens Skill Gap view. 2\. System loads employee current competency profile. 3\. System loads required competencies for current position. 4\. System calculates gap \= required level \- current level for each competency. 5\. System classifies gap severity based on configured thresholds. 6\. System displays missing competencies and priority. 7\. System stores calculation result if required for dashboard/reporting. |
| **Alternative Flow(s)** | A1 \- HR views skill gap by department. A2 \- Employee views own skill gaps. A3 \- Manager views skill gaps for team members only. |
| **Exception Flow(s)** | E1 \- Position has no requirements: system shows setup warning. E2 \- Employee profile has no current levels: system treats as unknown or baseline according to configuration. E3 \- User lacks scope. |
| **Postconditions** | 1\. Skill gap results are available for learning recommendation and dashboard. 2\. User can drill down to recommended courses or evidence. |
| **Business Rules** | BR-SCORE-01: Skill gap formula must be transparent. BR-SCOPE-01: Manager can view gap only for employees in own department. BR-REC-02: Recommendation must be based on gap and course mapping. |
| **Main Data Entities** | position\_competency\_requirements, employee\_competency\_profiles, skill\_gap\_results, competencies |
| **Candidate API Endpoints** | GET /api/employees/{id}/skill-gap; POST /api/skill-gap/recalculate; GET /api/departments/{id}/skill-gaps |
| **Main UI Screen(s)** | Skill Gap Detail, Team Skill Gap View, Employee Competency Profile |
| **Acceptance Criteria** | \- System calculates gaps using required and current levels. \- Missing setup is clearly displayed. \- Manager cannot access employees outside department. |
| **Security / Permission Notes** | Skill gap data is sensitive performance data and must follow role and department access rules. |

## **UC-19 \- Generate Learning Recommendation**

| Module | M07 |
| :---- | :---- |
| **Priority / MVP Level** | Must / Core MVP \- Rule-based |
| **Use Case Level** | System/business analysis goal |
| **Primary Actor(s)** | Employee, HR / Training Manager, Department Manager |
| **Supporting Actor(s)** | Capability Intelligence Engine, AI Service optional |
| **Trigger** | Skill gaps exist or user requests learning path recommendation. |
| **Description** | Recommends courses or learning paths based on skill gaps, course-competency mapping, assessment results and assignment history. |
| **Preconditions** | 1\. Skill gap result exists or can be calculated. 2\. Courses are mapped to competencies. 3\. User has access to employee learning plan. |
| **Main Flow** | 1\. User opens recommendation view. 2\. System identifies missing competencies and severity. 3\. System finds active published courses mapped to missing competencies. 4\. System ranks courses by gap severity, target level, course difficulty and completion status. 5\. System generates recommendation list with explanation. 6\. User can assign course, add to learning plan or start learning depending on role. |
| **Alternative Flow(s)** | A1 \- AI generates human-readable explanation text from rule-based result. A2 \- If no course exists, system suggests creating course or practical task. A3 \- HR recommends path for entire department. |
| **Exception Flow(s)** | E1 \- No mapped courses: system shows content gap. E2 \- Course already completed: system may recommend advanced course or task instead. E3 \- User lacks permission to assign course. |
| **Postconditions** | 1\. Recommendation is displayed and optionally stored. 2\. HR/Manager can assign courses from recommendation. |
| **Business Rules** | BR-REC-03: Recommendation should not be random; it must reference skill gap and course mapping. BR-AI-01: AI text cannot override rule-based recommendation source. BR-REC-04: Recommendation explanation should be visible. |
| **Main Data Entities** | learning\_recommendations, skill\_gap\_results, course\_competencies, courses, enrollments, ai\_explanation\_logs |
| **Candidate API Endpoints** | GET /api/employees/{id}/learning-recommendations; POST /api/learning-recommendations/generate; POST /api/course-assignments/from-recommendation |
| **Main UI Screen(s)** | Learning Recommendation Panel, Skill Gap Detail, HR Learning Plan |
| **Acceptance Criteria** | \- System recommends courses mapped to missing competencies. \- Recommendation includes reason. \- No mapped course scenario is handled clearly. |
| **Security / Permission Notes** | Employee can view own recommendations; assignment actions require HR/Manager permission. |

## **UC-20 \- Calculate Training Risk Score**

| Module | M07 |
| :---- | :---- |
| **Priority / MVP Level** | Must / Core MVP \- Rule-based |
| **Use Case Level** | System analysis goal |
| **Primary Actor(s)** | System Scheduler, HR / Training Manager, Department Manager |
| **Supporting Actor(s)** | Notification Service |
| **Trigger** | Scheduled job runs or user opens risk dashboard. |
| **Description** | Detects employees who may delay or fail training based on progress, low scores, deadlines, failed attempts and inactivity. |
| **Preconditions** | 1\. Employees have active course assignments. 2\. Progress, attempts and deadline data exist. 3\. Risk scoring weights and thresholds are configured. |
| **Main Flow** | 1\. Scheduler loads active enrollments and assignments. 2\. System computes inactivity score. 3\. System computes low score rate and failed attempt rate. 4\. System computes deadline pressure and progress delay. 5\. System calculates total risk score using configured weights. 6\. System classifies risk level such as Low, Medium, High. 7\. System stores risk result and explanation factors. 8\. System triggers notification if threshold is exceeded. |
| **Alternative Flow(s)** | A1 \- Manager manually refreshes risk for department. A2 \- HR filters high-risk employees across company. A3 \- AI generates intervention suggestions from rule-based risk factors. |
| **Exception Flow(s)** | E1 \- Missing deadline: deadline pressure is skipped or defaulted according to configuration. E2 \- No assessment attempts: system avoids division-by-zero and uses neutral/default value. E3 \- Invalid weights: calculation is blocked and admin warning is shown. |
| **Postconditions** | 1\. Risk score and explanation are available for dashboards. 2\. High-risk learners can receive reminders. |
| **Business Rules** | BR-RISK-02: Risk formula must be explainable. BR-RISK-03: Thresholds and weights should be configurable, not hard-coded. BR-NOTI-01: High risk can trigger reminders to employee and manager. |
| **Main Data Entities** | training\_risk\_scores, enrollments, lesson\_progress, assessment\_attempts, course\_assignments, notifications, ai\_explanation\_logs |
| **Candidate API Endpoints** | POST /api/risk-scores/recalculate; GET /api/risk-scores; GET /api/departments/{id}/training-risk |
| **Main UI Screen(s)** | Training Risk Dashboard, Employee Risk Detail |
| **Acceptance Criteria** | \- High-risk employees are identified with reason factors. \- Score calculation handles missing data safely. \- Managers see only department risk list. |
| **Security / Permission Notes** | Risk data is sensitive and must not be exposed to unauthorized employees except own status if allowed. |

## **UC-21 \- Calculate Workforce Readiness Score**

| Module | M07 |
| :---- | :---- |
| **Priority / MVP Level** | Must / Core MVP \- Rule-based |
| **Use Case Level** | System analysis goal |
| **Primary Actor(s)** | HR / Training Manager, Department Manager, Employee, System Scheduler |
| **Supporting Actor(s)** | Capability Intelligence Engine |
| **Trigger** | Readiness dashboard is opened or relevant data changes. |
| **Description** | Calculates an explainable readiness score from competency, certificate, learning progress, compliance and task performance. |
| **Preconditions** | 1\. Employee profile exists. 2\. Scoring weights and thresholds are configured. 3\. Relevant learning/certificate/task data exists or default rules are defined. |
| **Main Flow** | 1\. System loads employee competency score. 2\. System loads certificate score. 3\. System loads learning progress score. 4\. System loads compliance score. 5\. System loads work task performance score. 6\. System applies configured weighted formula. 7\. System classifies readiness level. 8\. System stores score and component breakdown. 9\. System displays readiness with explanation. |
| **Alternative Flow(s)** | A1 \- HR views readiness aggregation by department. A2 \- Employee views own readiness summary. A3 \- Manager drills down from team readiness to employee details. |
| **Exception Flow(s)** | E1 \- Required scoring component missing: system uses configured fallback and flags data quality. E2 \- Weights do not sum to expected total: calculation is blocked. E3 \- User lacks scope. |
| **Postconditions** | 1\. Readiness score is available for dashboards and career readiness. 2\. Component breakdown helps explain why the score is low/high. |
| **Business Rules** | BR-READY-01: Readiness formula must be transparent. BR-READY-02: Certificate expired/revoked should not contribute positively. BR-READY-03: Task score affects readiness only after valid manager/trainer evaluation. BR-CONFIG-01: Weights must be configurable. |
| **Main Data Entities** | readiness\_scores, employee\_competency\_profiles, certificates, enrollments, task\_evaluations, scoring\_configurations, audit\_logs |
| **Candidate API Endpoints** | GET /api/employees/{id}/readiness; POST /api/readiness/recalculate; GET /api/departments/{id}/readiness-summary |
| **Main UI Screen(s)** | Workforce Readiness Dashboard, Employee Readiness Detail, Manager Dashboard |
| **Acceptance Criteria** | \- Score includes component breakdown. \- Expired certificate does not count as valid certificate score. \- Changing task evaluation can trigger readiness refresh. |
| **Security / Permission Notes** | Aggregated readiness views must respect role and department scope. |

## **UC-22 \- Issue Digital Certificate**

| Module | M06 |
| :---- | :---- |
| **Priority / MVP Level** | Must / Core MVP |
| **Use Case Level** | System goal |
| **Primary Actor(s)** | System, HR / Training Manager, Internal Trainer |
| **Supporting Actor(s)** | Employee, PDF/QR Service, MinIO/Object Storage |
| **Trigger** | Employee satisfies course completion and assessment pass conditions. |
| **Description** | Issues a verifiable digital certificate with certificate code, QR URL, status, issue date, expiry date and generated PDF. |
| **Preconditions** | 1\. Employee completed course requirements. 2\. Employee passed required assessment. 3\. Certificate template exists. 4\. Certificate generation service and storage are available. |
| **Main Flow** | 1\. System checks certificate eligibility after assessment/course completion. 2\. System generates unique certificate code. 3\. System creates verification URL and QR code. 4\. System generates certificate PDF using template. 5\. System stores PDF in object storage. 6\. System creates certificate record with VALID status or PENDING if approval is required. 7\. System links certificate to employee, course and competencies. 8\. System notifies employee. |
| **Alternative Flow(s)** | A1 \- HR manually approves certificate before VALID status. A2 \- Certificate has expiry date based on course/certification rule. A3 \- Certificate is regenerated if template changes before final issuance. |
| **Exception Flow(s)** | E1 \- Eligibility condition not met: certificate is not issued. E2 \- Duplicate code generation collision: system retries. E3 \- PDF generation fails: system records error and allows retry. E4 \- Storage unavailable: certificate remains pending generation. |
| **Postconditions** | 1\. Certificate is available to employee. 2\. Certificate can be verified by code/QR. 3\. Certificate evidence may update employee competency profile. |
| **Business Rules** | BR-CERT-01: Certificate requires course completion and minimum assessment score. BR-CERT-02: Certificate code must be unique. BR-CERT-03: Issuance, revocation and regeneration must be audited. BR-CERT-04: Certificate can have expiry date. |
| **Main Data Entities** | certificates, certificate\_templates, certificate\_verification\_logs, courses, assessment\_attempts, competency\_evidences, file\_objects, audit\_logs |
| **Candidate API Endpoints** | POST /api/certificates/issue; GET /api/my/certificates; GET /api/certificates/{id}; GET /api/certificates/{id}/download |
| **Main UI Screen(s)** | Certificate Detail, My Certificates, Certificate Template Management |
| **Acceptance Criteria** | \- Eligible employee receives certificate. \- Certificate PDF contains code and QR. \- Ineligible employee cannot receive certificate. |
| **Security / Permission Notes** | Certificate files should be protected; public verification page exposes minimal information only. |

## **UC-23 \- Verify Digital Certificate by Code or QR**

| Module | M06 |
| :---- | :---- |
| **Priority / MVP Level** | Must / Core MVP |
| **Use Case Level** | Verifier goal |
| **Primary Actor(s)** | Certificate Verifier, Employee, HR / Training Manager |
| **Supporting Actor(s)** | Certificate Verification Service |
| **Trigger** | Verifier opens QR URL or enters certificate code. |
| **Description** | Allows verification of certificate authenticity and status without exposing private employee records. |
| **Preconditions** | 1\. Certificate record exists. 2\. Verification page is accessible. 3\. Certificate code or QR URL is provided. |
| **Main Flow** | 1\. Verifier opens verification URL or enters certificate code. 2\. System looks up certificate by code. 3\. System checks status, expiry date and revocation flag. 4\. System displays verification result: valid, expired, revoked or not found. 5\. System displays minimal certificate information such as recipient name, course, issue date and status. 6\. System records verification log. |
| **Alternative Flow(s)** | A1 \- Employee opens own certificate verification page. A2 \- HR views detailed certificate history from internal dashboard. A3 \- Verifier downloads verification summary if supported. |
| **Exception Flow(s)** | E1 \- Certificate code does not exist. E2 \- Certificate expired. E3 \- Certificate revoked with public reason hidden or limited. E4 \- Too many verification attempts may trigger rate limiting. |
| **Postconditions** | 1\. Verifier sees certificate status. 2\. Verification attempt is logged. |
| **Business Rules** | BR-CERT-05: A certificate is valid only when status is VALID and not expired. BR-CERT-06: Public verification must not expose sensitive employee profile or assessment details. BR-CERT-07: Verification attempts should be logged. |
| **Main Data Entities** | certificates, certificate\_verification\_logs, employees, courses |
| **Candidate API Endpoints** | GET /api/certificates/verify/{code}; POST /api/certificates/verify; GET /api/certificates/{id}/history |
| **Main UI Screen(s)** | Public/Internal Certificate Verification Page, Certificate Detail |
| **Acceptance Criteria** | \- Valid code shows valid certificate result. \- Expired/revoked status is shown clearly. \- Unknown code returns not found without leaking data. |
| **Security / Permission Notes** | Public endpoint must be read-only, rate-limited and minimal in returned fields. |

## **UC-24 \- Revoke or Update Certificate Status**

| Module | M06 |
| :---- | :---- |
| **Priority / MVP Level** | Must / Core MVP |
| **Use Case Level** | Business admin goal |
| **Primary Actor(s)** | HR / Training Manager, System Admin |
| **Supporting Actor(s)** | Employee, Certificate Verifier |
| **Trigger** | A certificate must be revoked, expired, renewed or corrected. |
| **Description** | Manages certificate lifecycle including status change, revocation reason, expiry and audit history. |
| **Preconditions** | 1\. Certificate exists. 2\. User has certificate management permission. 3\. Revocation/renewal reason is provided where required. |
| **Main Flow** | 1\. HR opens Certificate Management. 2\. System displays certificate list and status. 3\. HR selects certificate. 4\. HR chooses action such as revoke, renew, expire or correct metadata. 5\. System requires reason for revocation or critical update. 6\. System updates status and audit log. 7\. System updates certificate verification result. 8\. System recalculates certificate score/readiness if impacted. |
| **Alternative Flow(s)** | A1 \- Scheduler automatically marks expired certificates. A2 \- HR renews certificate after re-assessment. A3 \- Admin corrects template/file generation issue. |
| **Exception Flow(s)** | E1 \- Missing revocation reason. E2 \- User lacks permission. E3 \- Certificate already revoked. |
| **Postconditions** | 1\. Certificate status is updated. 2\. Verification page reflects new status. 3\. Readiness/certificate score is refreshed if needed. |
| **Business Rules** | BR-CERT-08: Revocation requires reason and audit log. BR-CERT-09: Expired/revoked certificate must not count toward certificate score. BR-CERT-10: Status history must be traceable. |
| **Main Data Entities** | certificates, certificate\_status\_history, certificate\_verification\_logs, readiness\_scores, audit\_logs |
| **Candidate API Endpoints** | PATCH /api/certificates/{id}/status; POST /api/certificates/{id}/revoke; POST /api/certificates/{id}/renew |
| **Main UI Screen(s)** | Certificate Management, Certificate Status Dialog, Certificate History |
| **Acceptance Criteria** | \- HR can revoke certificate with reason. \- Revoked certificate verification shows revoked status. \- Audit log records who changed status and why. |
| **Security / Permission Notes** | Certificate lifecycle actions are restricted to HR/Admin. |

## **UC-25 \- Generate AI Question Draft**

| Module | M05 |
| :---- | :---- |
| **Priority / MVP Level** | Should / Optional / Bonus |
| **Use Case Level** | Content owner goal |
| **Primary Actor(s)** | Internal Trainer |
| **Supporting Actor(s)** | AI Service |
| **Trigger** | Trainer wants AI-assisted draft questions for a lesson or competency. |
| **Description** | Uses AI to generate draft quiz or scenario-based questions that must be reviewed by a trainer before official use. |
| **Preconditions** | 1\. AI integration is configured. 2\. Trainer has permission. 3\. Lesson content or competency context is available. 4\. AI usage policy is accepted. |
| **Main Flow** | 1\. Trainer opens AI Question Draft tool. 2\. Trainer selects source lesson or competency. 3\. Trainer configures question type, difficulty and quantity. 4\. System sends controlled prompt to AI service. 5\. AI returns draft questions and explanations. 6\. System stores drafts with AI-generated status. 7\. Trainer reviews, edits and approves selected questions. 8\. Approved questions become official question bank items. |
| **Alternative Flow(s)** | A1 \- Trainer rejects all generated questions. A2 \- Trainer edits question before approval. A3 \- System logs prompt and response snapshot for audit/demo. |
| **Exception Flow(s)** | E1 \- AI service unavailable. E2 \- Response violates format schema. E3 \- Generated content is low quality or unsafe; trainer rejects. |
| **Postconditions** | 1\. Approved questions are stored in question bank. 2\. Rejected drafts are not used in official assessments. 3\. AI log is saved if enabled. |
| **Business Rules** | BR-AI-02: AI-generated question must be reviewed by Trainer before publishing. BR-AI-03: AI output is a draft, not an official assessment item. BR-AI-04: Prompt/response logs should be stored for transparency if used in demo. |
| **Main Data Entities** | ai\_question\_drafts, questions, question\_options, ai\_explanation\_logs, lessons, competencies |
| **Candidate API Endpoints** | POST /api/ai/question-drafts; GET /api/ai/question-drafts; POST /api/ai/question-drafts/{id}/approve |
| **Main UI Screen(s)** | AI Question Draft Tool, Draft Review Page, Question Editor |
| **Acceptance Criteria** | \- AI drafts are not active until trainer approval. \- Trainer can edit draft before saving to question bank. \- AI service failure does not block manual question creation. |
| **Security / Permission Notes** | Do not send sensitive employee data to AI for question generation. |

## **UC-26 \- Generate AI Practical Task Suggestion**

| Module | M08 |
| :---- | :---- |
| **Priority / MVP Level** | Should / Optional / Bonus |
| **Use Case Level** | Manager support goal |
| **Primary Actor(s)** | Department Manager, Internal Trainer |
| **Supporting Actor(s)** | AI Service, Capability Intelligence Engine |
| **Trigger** | Manager needs a task to verify practical application after training or skill gap detection. |
| **Description** | Suggests practical tasks and evaluation criteria based on missing competency, completed course or learning outcome. |
| **Preconditions** | 1\. AI integration is configured. 2\. Skill gap or course completion context exists. 3\. Manager/Trainer has task creation permission. |
| **Main Flow** | 1\. Manager opens Task Suggestion panel. 2\. Manager selects employee, competency or completed course. 3\. System prepares context without unnecessary sensitive data. 4\. AI generates task description, expected output and evaluation criteria. 5\. Manager reviews and edits suggestion. 6\. Manager creates official task from approved suggestion. 7\. System stores AI explanation/log if enabled. |
| **Alternative Flow(s)** | A1 \- Manager writes task manually without AI. A2 \- Trainer creates task template from AI suggestion. A3 \- AI suggests multiple difficulty levels. |
| **Exception Flow(s)** | E1 \- AI response invalid. E2 \- AI service unavailable. E3 \- Manager lacks department scope for selected employee. |
| **Postconditions** | 1\. Official task is created only after human review. 2\. Suggestion may be reused as template. |
| **Business Rules** | BR-AI-05: AI task suggestion requires Manager/Trainer review. BR-TASK-01: Official task must have description, deadline, expected output and evaluation criteria. BR-AI-06: AI cannot directly assign tasks without human confirmation. |
| **Main Data Entities** | ai\_task\_suggestions, practical\_tasks, task\_assignments, skill\_gap\_results, courses, ai\_explanation\_logs |
| **Candidate API Endpoints** | POST /api/ai/task-suggestions; POST /api/tasks/from-suggestion |
| **Main UI Screen(s)** | AI Task Suggestion Panel, Task Create Form |
| **Acceptance Criteria** | \- AI suggestion can be converted to task after manager review. \- Manager can edit suggested criteria before assignment. \- Manual task creation remains available. |
| **Security / Permission Notes** | AI prompt should minimize personal data and must respect department scope. |

## **UC-27 \- Create and Assign Practical Task**

| Module | M08 |
| :---- | :---- |
| **Priority / MVP Level** | Must / Core MVP |
| **Use Case Level** | Manager goal |
| **Primary Actor(s)** | Department Manager, HR / Training Manager, Internal Trainer |
| **Supporting Actor(s)** | Employee, AI Service optional |
| **Trigger** | Employee needs practical work-based validation after training or skill gap identification. |
| **Description** | Creates and assigns WMS-lite practical tasks with description, deadline, expected output and evaluation criteria. |
| **Preconditions** | 1\. Employee exists and is active. 2\. Actor has permission and department scope. 3\. Task criteria are defined. 4\. Competency to validate is known. |
| **Main Flow** | 1\. Manager opens Practical Task Management. 2\. Manager creates task or selects from suggestion/template. 3\. Manager selects employee(s) within scope. 4\. Manager defines competency, expected output, deadline and evaluation criteria. 5\. System validates required fields. 6\. System creates task assignment. 7\. System notifies employee. 8\. System displays task in employee My Tasks. |
| **Alternative Flow(s)** | A1 \- HR assigns cross-department training task if authorized. A2 \- Trainer assigns task related to course completion. A3 \- Manager saves task as draft before assignment. |
| **Exception Flow(s)** | E1 \- Missing deadline or criteria. E2 \- Manager selects employee outside department. E3 \- Employee inactive. E4 \- Task competency not mapped. |
| **Postconditions** | 1\. Task assignment is active. 2\. Employee can submit progress/result. 3\. Task is available for tracking and evaluation. |
| **Business Rules** | BR-TASK-02: Practical task must have description, deadline, expected output and evaluation criteria. BR-TASK-03: Manager can assign tasks only within managed scope unless HR permission applies. BR-TASK-04: Task should be linked to at least one competency. |
| **Main Data Entities** | practical\_tasks, task\_assignments, competencies, employees, notifications, audit\_logs |
| **Candidate API Endpoints** | GET /api/tasks; POST /api/tasks; POST /api/tasks/{id}/assign; GET /api/my/tasks |
| **Main UI Screen(s)** | Practical Task List, Task Create/Edit Form, Task Assignment Detail, My Tasks |
| **Acceptance Criteria** | \- Manager can assign task to department employee. \- Employee sees assigned task. \- Task without criteria cannot be assigned. |
| **Security / Permission Notes** | Task assignment must enforce department scope on backend. |

## **UC-28 \- Submit Practical Task Result**

| Module | M08 |
| :---- | :---- |
| **Priority / MVP Level** | Must / Core MVP |
| **Use Case Level** | Employee goal |
| **Primary Actor(s)** | Employee |
| **Supporting Actor(s)** | MinIO/Object Storage, Department Manager |
| **Trigger** | Employee completes or updates an assigned practical task. |
| **Description** | Allows employees to submit task progress, final result, notes, links or evidence attachments. |
| **Preconditions** | 1\. Employee has active assigned task. 2\. Submission deadline and policy allow submission. 3\. File storage is available if attachment is uploaded. |
| **Main Flow** | 1\. Employee opens My Tasks. 2\. Employee selects task detail. 3\. System displays requirements, deadline and criteria. 4\. Employee updates progress or writes submission note. 5\. Employee uploads file/link/evidence if required. 6\. System validates file and required output. 7\. Employee submits final result. 8\. System changes status to Submitted or Pending Evaluation. 9\. System notifies manager. |
| **Alternative Flow(s)** | A1 \- Employee saves draft progress before final submission. A2 \- Employee resubmits after manager requests revision. A3 \- Employee submits link instead of file if allowed. |
| **Exception Flow(s)** | E1 \- Deadline passed: system follows policy for late submission. E2 \- Unsupported file type or oversized file. E3 \- Task already evaluated and locked. E4 \- Employee tries to submit task not assigned to them. |
| **Postconditions** | 1\. Submission is stored. 2\. Manager can evaluate task. 3\. Submitted evidence is available in task history. |
| **Business Rules** | BR-TASK-05: Employee can submit only own assigned tasks. BR-FILE-03: Task evidence attachment must pass validation. BR-TASK-06: Evaluated task should be locked from normal resubmission unless revision is requested. |
| **Main Data Entities** | task\_assignments, task\_submissions, file\_objects, notifications, audit\_logs |
| **Candidate API Endpoints** | GET /api/my/tasks/{id}; POST /api/my/tasks/{id}/progress; POST /api/my/tasks/{id}/submit; POST /api/task-submissions/{id}/attachments |
| **Main UI Screen(s)** | My Tasks, Task Detail, Task Submission Form |
| **Acceptance Criteria** | \- Employee can submit assigned task with evidence. \- Invalid file upload is rejected. \- Manager receives notification after submission. |
| **Security / Permission Notes** | Employee cannot view or submit another employee task. |

## **UC-29 \- Evaluate Practical Task and Confirm Evidence**

| Module | M08 |
| :---- | :---- |
| **Priority / MVP Level** | Must / Core MVP |
| **Use Case Level** | Manager goal |
| **Primary Actor(s)** | Department Manager, Internal Trainer |
| **Supporting Actor(s)** | Employee, Capability Intelligence Engine |
| **Trigger** | Employee submits a practical task result. |
| **Description** | Allows authorized evaluator to score task, provide feedback, confirm competency impact and create competency evidence. |
| **Preconditions** | 1\. Task submission exists. 2\. Evaluator has permission and scope. 3\. Evaluation criteria are defined. 4\. Task is not already locked unless re-evaluation is allowed. |
| **Main Flow** | 1\. Manager opens Pending Evaluation list. 2\. Manager reviews task requirement, submission, attachments and criteria. 3\. Manager enters score for each criterion or overall score. 4\. Manager writes feedback. 5\. Manager selects competency confirmed and suggested level impact if applicable. 6\. System validates score range and required feedback. 7\. Manager submits evaluation. 8\. System creates task evaluation record. 9\. System creates competency evidence if evaluation confirms competency. 10\. System recalculates task performance and readiness score. |
| **Alternative Flow(s)** | A1 \- Manager requests revision instead of final score. A2 \- Trainer evaluates task linked to trainer-owned course if allowed. A3 \- HR reviews evaluation for audit. |
| **Exception Flow(s)** | E1 \- Manager outside department scope. E2 \- Score outside allowed range. E3 \- Missing feedback for failed task. E4 \- Attachment unavailable. |
| **Postconditions** | 1\. Task status becomes Evaluated, Revision Required or Failed. 2\. Feedback is visible to employee. 3\. Competency evidence and readiness inputs are updated according to rules. |
| **Business Rules** | BR-TASK-07: Task score only affects readiness after valid evaluation. BR-EVID-06: Competency evidence from task requires evaluator confirmation. BR-TASK-08: Evaluation must be auditable. BR-READY-04: Readiness should be recalculated after task evaluation. |
| **Main Data Entities** | task\_evaluations, task\_submissions, task\_assignments, competency\_evidences, employee\_competency\_profiles, readiness\_scores, audit\_logs |
| **Candidate API Endpoints** | GET /api/tasks/pending-evaluation; POST /api/task-submissions/{id}/evaluate; POST /api/task-submissions/{id}/request-revision |
| **Main UI Screen(s)** | Pending Task Evaluation, Task Evaluation Form, Evidence Portfolio |
| **Acceptance Criteria** | \- Manager can score submitted task. \- Evaluation creates evidence when competency confirmed. \- Employee can see feedback after evaluation. |
| **Security / Permission Notes** | Evaluation is one of the most sensitive operations and must enforce scope, audit and role checks. |

## **UC-30 \- View HR Dashboard and Workforce Analytics**

| Module | M09 |
| :---- | :---- |
| **Priority / MVP Level** | Must / Core MVP |
| **Use Case Level** | Business monitoring goal |
| **Primary Actor(s)** | HR / Training Manager |
| **Supporting Actor(s)** | System Scheduler |
| **Trigger** | HR needs company-wide training and capability insight. |
| **Description** | Provides HR-level dashboard for competency heatmap, risk list, readiness, certificate status, progress and task performance. |
| **Preconditions** | 1\. HR is authenticated. 2\. Dashboard data sources are available. 3\. User has company-wide analytics permission. |
| **Main Flow** | 1\. HR opens dashboard. 2\. System loads summary KPIs: active employees, course completion, certificate status, high-risk learners and readiness. 3\. System displays competency heatmap by department/position. 4\. System displays high risk employee list. 5\. System displays certificate expiry/revocation status. 6\. System displays task performance and evidence coverage. 7\. HR filters by department, position, course or time range. 8\. HR drills down to employee, department or course detail. |
| **Alternative Flow(s)** | A1 \- Dashboard uses cached data for performance. A2 \- HR exports summary report if supported. A3 \- HR clicks risk item to assign intervention course/task. |
| **Exception Flow(s)** | E1 \- Dashboard data partially unavailable: system shows fallback and data quality warning. E2 \- Cache unavailable: system queries live data with performance limits. E3 \- User lacks HR role. |
| **Postconditions** | 1\. HR obtains actionable workforce capability insight. 2\. Dashboard filters are applied and drill-down data is available. |
| **Business Rules** | BR-DASH-01: Dashboard should answer capability management questions, not only course completion. BR-DASH-02: Aggregated data must be consistent with role permissions. BR-DASH-03: Score explanations should be available from dashboard drill-down. |
| **Main Data Entities** | employees, departments, job\_positions, readiness\_scores, training\_risk\_scores, certificates, enrollments, task\_evaluations, competency\_evidences |
| **Candidate API Endpoints** | GET /api/dashboard/hr; GET /api/dashboard/hr/competency-heatmap; GET /api/dashboard/hr/risk-list; GET /api/dashboard/hr/certificates |
| **Main UI Screen(s)** | HR Dashboard, Competency Heatmap, Risk List, Certificate Tracking |
| **Acceptance Criteria** | \- HR sees company-wide KPIs. \- Heatmap can be filtered by department/position. \- Dashboard does not expose technical admin-only data. |
| **Security / Permission Notes** | HR analytics access must be restricted and audited where necessary. |

## **UC-31 \- View Department Manager Dashboard**

| Module | M09 |
| :---- | :---- |
| **Priority / MVP Level** | Must / Core MVP |
| **Use Case Level** | Business monitoring goal |
| **Primary Actor(s)** | Department Manager |
| **Supporting Actor(s)** | Employee, System Scheduler |
| **Trigger** | Manager needs to monitor team training, competency gaps, task status and readiness. |
| **Description** | Provides department-scoped dashboard for team progress, risk, readiness, skill gaps and practical tasks. |
| **Preconditions** | 1\. Manager is authenticated. 2\. Manager is assigned to one or more departments. 3\. Department-scoped data exists. |
| **Main Flow** | 1\. Manager opens dashboard. 2\. System identifies departments managed by user. 3\. System loads team KPIs: assigned courses, progress, risk, readiness and pending task evaluations. 4\. System displays employee list with status indicators. 5\. Manager opens employee detail or task evaluation. 6\. Manager assigns course/task or requests follow-up action within scope. |
| **Alternative Flow(s)** | A1 \- Manager manages multiple departments and switches scope. A2 \- Manager filters by course, risk level, task status or competency. A3 \- Manager receives notification from dashboard item. |
| **Exception Flow(s)** | E1 \- Manager has no assigned department: system shows setup warning. E2 \- Attempt to open employee outside department: access denied. E3 \- Data unavailable: partial dashboard shown. |
| **Postconditions** | 1\. Manager can identify at-risk employees and pending actions. 2\. Manager can navigate to task assignment/evaluation flows. |
| **Business Rules** | BR-SCOPE-02: Department Manager can only view employees under managed department. BR-DASH-04: Manager dashboard should show actionable items such as pending evaluations and high risk employees. BR-TASK-09: Manager can evaluate only authorized tasks. |
| **Main Data Entities** | departments, employees, enrollments, readiness\_scores, training\_risk\_scores, task\_assignments, task\_submissions |
| **Candidate API Endpoints** | GET /api/dashboard/manager; GET /api/dashboard/manager/employees; GET /api/dashboard/manager/pending-tasks |
| **Main UI Screen(s)** | Manager Dashboard, Team Readiness View, Pending Task Evaluations |
| **Acceptance Criteria** | \- Manager sees only department employees. \- Pending task evaluations are visible. \- Out-of-scope employee access is denied. |
| **Security / Permission Notes** | Backend must enforce department scope independently of frontend filters. |

## **UC-32 \- View Employee Learning, Certificates and Competency Profile**

| Module | M09 |
| :---- | :---- |
| **Priority / MVP Level** | Must / Core MVP |
| **Use Case Level** | Employee goal |
| **Primary Actor(s)** | Employee |
| **Supporting Actor(s)** | Department Manager, HR / Training Manager |
| **Trigger** | Employee wants to understand assigned learning, progress, certificates, tasks and competency status. |
| **Description** | Provides employee self-service dashboard with learning plan, progress, assessment results, certificates, tasks, evidence and competency summary. |
| **Preconditions** | 1\. Employee is authenticated and linked to employee profile. 2\. Employee has assigned courses/tasks or existing records. |
| **Main Flow** | 1\. Employee opens dashboard. 2\. System loads assigned courses and progress. 3\. System loads upcoming deadlines and pending assessments. 4\. System loads certificate list and status. 5\. System loads tasks and feedback. 6\. System displays own competency profile and evidence summary. 7\. Employee navigates to learning, assessment, certificate or task detail. |
| **Alternative Flow(s)** | A1 \- Employee has no assigned course: system shows empty state and recommended learning if available. A2 \- Employee views own readiness score if policy allows. A3 \- Employee downloads certificate PDF. |
| **Exception Flow(s)** | E1 \- User account not linked to employee profile. E2 \- Certificate PDF unavailable. E3 \- Employee tries to access another employee profile. |
| **Postconditions** | 1\. Employee understands current learning and capability status. 2\. Employee can take next action. |
| **Business Rules** | BR-EMP-04: Employee can view own official records but cannot edit official score/certificate/competency level. BR-CERT-11: Employee can download own certificate if valid file exists. BR-EVID-07: Evidence visibility should follow organization policy. |
| **Main Data Entities** | employees, enrollments, lesson\_progress, assessment\_attempts, certificates, task\_assignments, task\_evaluations, competency\_evidences |
| **Candidate API Endpoints** | GET /api/my/dashboard; GET /api/my/competency-profile; GET /api/my/certificates; GET /api/my/tasks |
| **Main UI Screen(s)** | Employee Dashboard, My Learning, My Certificates, My Tasks, My Competency Profile |
| **Acceptance Criteria** | \- Employee can see own assigned learning and certificates. \- Employee cannot edit official score. \- Empty states guide next action. |
| **Security / Permission Notes** | Self-service endpoints must always resolve employee from authenticated user, not from arbitrary client-supplied employee ID. |

## **UC-33 \- Evaluate Career or Promotion Readiness**

| Module | M07 |
| :---- | :---- |
| **Priority / MVP Level** | Should / Optional / Bonus |
| **Use Case Level** | HR/Manager decision support goal |
| **Primary Actor(s)** | HR / Training Manager, Department Manager |
| **Supporting Actor(s)** | Employee, Capability Intelligence Engine, AI Service optional |
| **Trigger** | HR/Manager wants to compare an employee with a target position or career path. |
| **Description** | Compares current employee capability with target position requirements and recommends missing competencies, courses and tasks. |
| **Preconditions** | 1\. Employee profile exists. 2\. Target position has competency requirements. 3\. User has permission and scope. 4\. Readiness/skill gap calculation is available. |
| **Main Flow** | 1\. HR/Manager opens Career Readiness screen. 2\. User selects employee and target position. 3\. System loads target requirements. 4\. System compares current competency with target requirements. 5\. System calculates readiness percentage based on achieved required competency weight. 6\. System lists missing competencies and priority. 7\. System recommends courses/tasks. 8\. System displays explanation and development actions. |
| **Alternative Flow(s)** | A1 \- HR compares multiple employees for a target position. A2 \- AI explains recommendation in natural language. A3 \- Manager creates development plan from result. |
| **Exception Flow(s)** | E1 \- Target position has no requirements. E2 \- Employee outside manager scope. E3 \- Data insufficient: system shows data quality warning. |
| **Postconditions** | 1\. Career readiness result is available for planning. 2\. No official promotion decision is made automatically. |
| **Business Rules** | BR-CAREER-01: Career readiness is advisory and does not replace official HR decision. BR-CAREER-02: Explanation must show missing competencies and required levels. BR-SCOPE-03: Manager can evaluate only own employees unless HR permission applies. |
| **Main Data Entities** | career\_readiness\_results, employees, job\_positions, position\_competency\_requirements, employee\_competency\_profiles, learning\_recommendations |
| **Candidate API Endpoints** | POST /api/career-readiness/evaluate; GET /api/employees/{id}/career-readiness |
| **Main UI Screen(s)** | Career Readiness Evaluator, Development Recommendation Panel |
| **Acceptance Criteria** | \- System calculates readiness against target position. \- Result includes missing competency list. \- Result is clearly marked advisory. |
| **Security / Permission Notes** | Promotion/career data is sensitive and should be restricted to HR/Manager roles. |

## **UC-34 \- Send Notification and Reminder**

| Module | M10 |
| :---- | :---- |
| **Priority / MVP Level** | Should / MVP Support / Optional Depth |
| **Use Case Level** | System support goal |
| **Primary Actor(s)** | System Scheduler, Employee, Department Manager, HR / Training Manager |
| **Supporting Actor(s)** | SignalR, Email provider optional |
| **Trigger** | A course/task deadline, risk threshold, certificate expiry or assignment event occurs. |
| **Description** | Sends in-app notifications and reminders for learning assignments, assessment deadlines, high risk, certificate expiry and task updates. |
| **Preconditions** | 1\. Notification settings exist. 2\. Target user exists and is active. 3\. Trigger event is generated. |
| **Main Flow** | 1\. System receives event or scheduler finds reminder condition. 2\. System determines notification recipients. 3\. System creates notification record with type and payload. 4\. System sends real-time update through SignalR if user is online. 5\. System marks notification as unread. 6\. User opens notification center. 7\. User clicks notification to navigate to related action. |
| **Alternative Flow(s)** | A1 \- Email notification is sent if configured. A2 \- Manager receives digest of high-risk employees. A3 \- User marks notification as read. |
| **Exception Flow(s)** | E1 \- SignalR unavailable: notification is stored for later. E2 \- Recipient inactive: notification skipped. E3 \- Duplicate reminder within cooldown period: system suppresses duplicate. |
| **Postconditions** | 1\. Notification is available to recipient. 2\. User can take action from notification. 3\. Notification history is retained. |
| **Business Rules** | BR-NOTI-02: Reminder conditions and cooldown should be configurable. BR-NOTI-03: Notifications must respect user scope and data visibility. BR-NOTI-04: System should avoid duplicate spam. |
| **Main Data Entities** | notifications, notification\_preferences, users, course\_assignments, task\_assignments, certificates, training\_risk\_scores |
| **Candidate API Endpoints** | GET /api/notifications; PATCH /api/notifications/{id}/read; POST /api/notifications/test; SignalR /hubs/notifications |
| **Main UI Screen(s)** | Notification Center, Header Notification Dropdown |
| **Acceptance Criteria** | \- Assignment creates notification. \- Unread notifications are visible. \- SignalR failure does not lose notification record. |
| **Security / Permission Notes** | Notification payload must not include data the recipient is not authorized to view. |

## **UC-35 \- View Audit Log**

| Module | M10 |
| :---- | :---- |
| **Priority / MVP Level** | Must / Core MVP |
| **Use Case Level** | Admin/governance goal |
| **Primary Actor(s)** | System Admin, HR / Training Manager |
| **Supporting Actor(s)** | All modules |
| **Trigger** | Admin/HR needs to review critical changes or trace system actions. |
| **Description** | Provides audit trail for security-sensitive and business-critical actions such as login, role changes, certificate status changes, task evaluation and competency updates. |
| **Preconditions** | 1\. Audit logging is enabled. 2\. User has audit view permission. 3\. Audit records exist. |
| **Main Flow** | 1\. User opens Audit Log. 2\. System displays audit entries with filters. 3\. User filters by actor, action, module, entity type, date or severity. 4\. System displays details such as before/after snapshot if stored. 5\. User reviews event detail. 6\. User exports audit report if supported. |
| **Alternative Flow(s)** | A1 \- HR sees business audit logs but not technical security logs if restricted. A2 \- Admin filters failed login attempts. A3 \- User opens audit log from entity history. |
| **Exception Flow(s)** | E1 \- User lacks permission. E2 \- Large result set: system requires filters or pagination. E3 \- Old logs archived: system shows archive notice. |
| **Postconditions** | 1\. Critical changes are traceable. 2\. Governance and defense explanation are supported. |
| **Business Rules** | BR-AUDIT-02: Role changes, certificate lifecycle, task evaluation and competency changes must be logged. BR-AUDIT-03: Audit records should be append-only from application perspective. BR-AUDIT-04: Audit view must be restricted. |
| **Main Data Entities** | audit\_logs, users, employees, certificates, task\_evaluations, competency\_evidences |
| **Candidate API Endpoints** | GET /api/audit-logs; GET /api/audit-logs/{id}; GET /api/entities/{type}/{id}/audit-logs |
| **Main UI Screen(s)** | Audit Log List, Audit Log Detail, Entity History Panel |
| **Acceptance Criteria** | \- Admin can filter audit logs. \- Critical actions create audit records. \- Unauthorized users cannot access audit logs. |
| **Security / Permission Notes** | Audit logs can contain sensitive data; use masking and role-based access. |

## **UC-36 \- Configure Scoring Weights and Thresholds**

| Module | M10 |
| :---- | :---- |
| **Priority / MVP Level** | Should / Core Config / Can be simplified |
| **Use Case Level** | Admin/HR configuration goal |
| **Primary Actor(s)** | System Admin, HR / Training Manager |
| **Supporting Actor(s)** | Capability Intelligence Engine |
| **Trigger** | Organization needs to adjust score formulas, thresholds or reminder policies without code changes. |
| **Description** | Allows authorized users to configure weights and thresholds for readiness, risk levels, pass scores, certificate expiry reminders and other rule-based calculations. |
| **Preconditions** | 1\. User has configuration permission. 2\. System supports configurable scoring settings. 3\. Default values exist. |
| **Main Flow** | 1\. Admin/HR opens System Configuration. 2\. System displays current scoring weights and thresholds. 3\. User edits readiness weights, risk thresholds or reminder days. 4\. System validates numeric ranges and total weight rules. 5\. User saves configuration. 6\. System versions configuration or logs changes. 7\. System applies new configuration to future calculations or triggers recalculation if requested. |
| **Alternative Flow(s)** | A1 \- User restores default configuration. A2 \- User previews calculation impact before saving. A3 \- Configuration is limited to Admin in MVP to reduce complexity. |
| **Exception Flow(s)** | E1 \- Weights do not sum to required total. E2 \- Threshold ranges overlap incorrectly. E3 \- User lacks permission. E4 \- Recalculation job fails and system records error. |
| **Postconditions** | 1\. New configuration is stored and auditable. 2\. Score calculations use updated settings according to policy. |
| **Business Rules** | BR-CONFIG-02: Important scoring weights should not be hard-coded. BR-CONFIG-03: Configuration changes must be audited. BR-SCORE-02: Score explanation must reference the active formula/configuration. |
| **Main Data Entities** | scoring\_configurations, risk\_thresholds, readiness\_thresholds, notification\_preferences, audit\_logs |
| **Candidate API Endpoints** | GET /api/config/scoring; PUT /api/config/scoring; POST /api/config/scoring/preview; POST /api/config/scoring/recalculate |
| **Main UI Screen(s)** | Scoring Configuration, Threshold Settings, Formula Preview |
| **Acceptance Criteria** | \- Invalid weight configuration is rejected. \- Saved configuration is audited. \- Calculations use active configuration. |
| **Security / Permission Notes** | Configuration changes can affect business decisions; restrict to Admin/HR and audit all changes. |

# **6\. Use Case Dependency Matrix**

The dependency matrix helps the team avoid implementing dependent features before their foundation exists. It also helps with sprint planning and GitHub issue sequencing.

| Use Case(s) | Dependency Meaning | Depends On |
| :---- | :---- | :---- |
| UC-01 | Foundation for all authenticated use cases | None |
| UC-02 | Needed before role-based operation | UC-01 |
| UC-03 to UC-05 | Organization setup must exist before competency assignment and dashboards | UC-01, UC-02 |
| UC-06 to UC-09 | Competency framework and requirements enable skill gap, recommendation and readiness | UC-03, UC-04, UC-05 |
| UC-10 to UC-14 | Learning flow depends on course content, competency mapping and assignment | UC-06, UC-12, UC-13 |
| UC-15 to UC-17 | Assessment flow depends on question bank and published assessments | UC-10, UC-15, UC-16 |
| UC-18 to UC-21 | Capability analysis depends on position requirements, employee profile, learning and task data | UC-05, UC-08, UC-09, UC-14, UC-17, UC-29 |
| UC-22 to UC-24 | Certificate lifecycle depends on course completion and assessment results | UC-13, UC-14, UC-17 |
| UC-25 to UC-26 | AI support depends on content/competency context and human review workflow | UC-06, UC-10, UC-15, UC-18 |
| UC-27 to UC-29 | WMS-lite task evidence depends on employee, competency and manager scope | UC-05, UC-06, UC-09 |
| UC-30 to UC-32 | Dashboards depend on core operational data and score outputs | UC-13, UC-17, UC-18, UC-20, UC-21, UC-22, UC-29 |
| UC-33 | Career readiness depends on current profile and target position requirements | UC-05, UC-08, UC-18, UC-21 |
| UC-34 to UC-36 | Support/governance use cases depend on events, logs and scoring rules | All relevant core modules |

# **7\. Cross-cutting Business and Security Rules**

The following rules apply across multiple use cases and should be reflected in backend authorization, validation, service logic, database constraints and test cases.

| Rule ID | Rule |
| :---- | :---- |
| BR-01 | Each active job position should have at least one required competency before capability analysis is considered complete. |
| BR-02 | Each competency must have comparable levels and clear achievement criteria. |
| BR-03 | Each assignable course should be linked to at least one competency. |
| BR-04 | Employees can only receive certificates after completing required learning and passing required assessment rules. |
| BR-05 | Expired or revoked certificates must not contribute positively to certificate/readiness score. |
| BR-06 | Department Manager can only view and evaluate employees within managed department scope. |
| BR-07 | AI-generated questions and practical task suggestions must be reviewed by a human before official use. |
| BR-08 | Skill gap, risk and readiness scores must be explainable and based on visible formulas/configuration. |
| BR-09 | Task evidence affects competency/readiness only after valid Manager/Trainer evaluation. |
| BR-10 | Employees cannot modify official assessment scores, certificate status or confirmed competency levels. |
| BR-11 | Critical operations must be audited: role changes, certificate status changes, task evaluation, competency evidence confirmation and scoring configuration changes. |
| BR-12 | Important scoring weights and thresholds should be configurable or at minimum centralized, not scattered as hard-coded values. |

## **7.1 Permission Enforcement Principles**

* Frontend route guards are useful for UX, but backend authorization is the source of truth.  
* Every endpoint that accepts employeeId, departmentId, courseId, taskId or certificateId must verify whether the authenticated user is allowed to access that resource.  
* Department Manager scope must be checked on the backend by resolving managed departments from the authenticated user, not by trusting client-side filters.  
* Employee self-service endpoints should resolve the employee profile from the authenticated user instead of accepting arbitrary employeeId from the request body.  
* Audit logs should be generated for all critical state transitions and should include actor, action, entity type, entity id, timestamp and reason where applicable.

## **7.2 Critical State Transitions**

| Entity | Critical State Transition | Required Control |
| :---- | :---- | :---- |
| User | Active \-\> Inactive; role changed; password reset | Admin permission and audit log. |
| Course | Draft \-\> Published; Published \-\> Archived | Trainer/HR permission and publish checklist. |
| Assessment | Draft \-\> Published; attempt submitted | Trainer permission for publishing; immutable attempt after submit. |
| Certificate | Pending \-\> Valid; Valid \-\> Revoked/Expired | Eligibility rule, reason for revocation and audit log. |
| Task | Assigned \-\> Submitted \-\> Evaluated / Revision Required | Employee ownership, Manager scope, evaluation criteria and audit log. |
| Competency Evidence | Draft/Created \-\> Confirmed/Rejected | Authorized evaluator or system rule; audit log. |
| Scoring Configuration | Old weights \-\> New weights | Admin/HR permission, validation and audit log. |

# **8\. Out-of-Scope and Future Use Cases**

These use cases may be mentioned in presentation as future scope, but they should not block MVP delivery. The team should implement them only after the end-to-end demo flow is stable.

| Future Use Case | Reason for Exclusion from MVP | Possible Future Direction |
| :---- | :---- | :---- |
| Full AI Learning Assistant | Requires robust lesson indexing, prompt safety, conversation history and answer quality control. | Add Q\&A over learning content after core course/assessment modules are stable. |
| Semantic Knowledge Search | Requires embeddings, vector database or pgvector, data cleaning and ranking design. | Use pgvector or external vector store to search lessons, competencies and internal knowledge. |
| Full HRM Integration | Requires external HRM API contracts and enterprise identity integration. | Integrate with HRM, SSO/LDAP or enterprise directory. |
| Full Talent Marketplace | Too large for capstone MVP and overlaps with enterprise workforce planning products. | Extend career readiness into internal mobility recommendations. |
| Blockchain Certificate Verification | Unnecessary complexity for MVP; QR/code verification is sufficient. | Use blockchain only if certificate trust model requires external immutability. |
| Full Project Management / WMS | DigiTalent AI only needs WMS-lite for training evidence, not full project execution. | Integrate with Jira/Trello or expand task management in future product version. |

# **9\. Implementation Readiness Checklist**

Before coding each use case, the team should confirm the following checklist. This prevents unclear implementation and reduces rework.

| Checklist Area | Question to Confirm |
| :---- | :---- |
| Requirement clarity | Use case has actor, trigger, main flow, alternative flow, exception flow and acceptance criteria. |
| Permission clarity | Role and department scope are clear for the use case. |
| Data clarity | Main entities, required fields and state transitions are known. |
| API clarity | Candidate endpoints, request validation and response behavior are known. |
| UI clarity | Main screen, form, table, empty state, loading state and error state are planned. |
| Business rule clarity | Business rules are mapped and can be tested. |
| Audit/security clarity | Sensitive actions are audited and protected. |
| MVP boundary clarity | Use case is classified as Must/Should/Future to prevent scope creep. |

# **10\. Appendix: Demo Use Case Scenario**

The following scenario is recommended as the main capstone demo because it connects the most important use cases into one coherent business story.

1. HR creates Department: Marketing and Job Position: Marketing Executive.  
2. HR defines required competencies for Marketing Executive: Data Literacy level 3 and AI Productivity level 2\.  
3. HR creates Employee A and assigns the employee to Marketing Executive position.  
4. System analyzes Employee A skill gap and detects that Data Literacy is below required level.  
5. System recommends Data Analytics Basic course based on the missing competency.  
6. HR assigns the course to Employee A with a deadline.  
7. Employee A studies lessons and completes progress.  
8. Employee A takes final assessment and passes.  
9. System issues digital certificate with QR verification.  
10. Manager assigns a practical task: create a campaign performance report using spreadsheet data.  
11. Employee A submits the report file as task evidence.  
12. Manager evaluates the task, provides feedback and confirms Data Literacy evidence.  
13. System updates competency evidence portfolio and recalculates readiness score.  
14. HR dashboard shows improved readiness and evidence coverage for the Marketing department.

## **10.1 Demo Use Case Coverage**

| Demo Step Group | Covered Use Cases |
| :---- | :---- |
| Organization setup | UC-03, UC-04, UC-05 |
| Competency framework and requirement mapping | UC-06, UC-07, UC-08, UC-09 |
| Skill gap and learning recommendation | UC-18, UC-19 |
| Course assignment and learning | UC-10, UC-11, UC-12, UC-13, UC-14 |
| Assessment and certificate | UC-15, UC-16, UC-17, UC-22, UC-23 |
| WMS-lite evidence | UC-27, UC-28, UC-29 |
| Dashboard and readiness | UC-21, UC-30, UC-31, UC-32 |

End of document.