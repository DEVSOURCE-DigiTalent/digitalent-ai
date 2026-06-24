**DIGITAL TALENT AI**

**BUSINESS REQUIREMENT DOCUMENT (BRD)**

*Nền tảng đào tạo, đánh giá năng lực số và cấp chứng chỉ nội bộ cho nhân viên doanh nghiệp kết hợp giao việc thực hành sau đào tạo*

| Field | Information |
| :---- | :---- |
| Project Name | DigiTalent AI: Digital Competency Training, Internal Certification and Work-Based Assessment Platform |
| Document Type | Business Requirement Document (BRD) |
| Version | 1.0 |
| Prepared For | Capstone Project \- Software Engineering |
| Prepared By | Project Team / Technical Mentor Support |
| Main Source Scope | Capstone\_Project\_Register\_DigiTalent\_AI\_Revised\_Scope.docx |
| Status | Draft for analysis, planning and pre-coding alignment |

*Important note: This BRD defines business needs, business scope, stakeholder expectations, business rules and acceptance direction. It is not a detailed API, database or UI specification. SRS, ERD, API Specification and UI/UX Specification should be prepared after this document is approved.*

# **Document Control**

| Version | Description | Owner | Status |
| :---- | :---- | :---- | :---- |
| 1.0 | Initial BRD prepared from revised capstone scope and supporting analysis documents. | Project Team | Draft |

## **Input Documents and Scope Basis**

| No. | Input | Usage in BRD |
| :---- | :---- | :---- |
| 01 | Capstone\_Project\_Register\_DigiTalent\_AI\_Revised\_Scope.docx | Primary official registered scope. Used as the main baseline for MVP, AI scope, modules and feasibility control. |
| 02 | Capstone\_Project\_Register\_DigiTalent\_AI.docx | Earlier broader scope. Used only as supporting context for optional features and terminology. |
| 03 | De\_tai\_DigiTalent\_AI\_Mo\_ta\_cap\_nhat\_14\_he\_thong.docx | Extended analysis with market comparison, business gap, business rules and bonus scope. Used to enrich business rationale. |
| 04 | 01\_Project\_Overview\_DigiTalent\_AI.docx | Project overview document. Used as a high-level alignment reference before BRD. |

## **How to Use This BRD**

* Use this document to align team members, mentor and stakeholders before writing code.  
* Use the business requirements and business rules as the baseline for SRS, Use Case Specification, ERD, API design and test cases.  
* Do not use this BRD as the final database schema or API contract. Technical details will be refined in later documents.  
* If scope conflict appears, the revised registered scope should have higher priority than optional enhancement documents.

# **Table of Contents**

1. 1\. Executive Summary  
2. 2\. Business Background and Problem Statement  
3. 3\. Business Vision and Objectives  
4. 4\. Stakeholders and User Roles  
5. 5\. Current Business Process (As-Is)  
6. 6\. Proposed Business Process (To-Be)  
7. 7\. Business Scope  
8. 8\. Business Capability Map  
9. 9\. Detailed Business Requirements  
10. 10\. Business Rules  
11. 11\. Data and Information Requirements  
12. 12\. Reporting and Analytics Requirements  
13. 13\. Non-Functional Business Requirements  
14. 14\. Assumptions, Constraints and Dependencies  
15. 15\. Risks and Mitigation Plan  
16. 16\. MVP Acceptance Criteria  
17. 17\. Requirement Prioritization and Roadmap  
18. 18\. Traceability Matrix  
19. 19\. Glossary  
20. 20\. Appendix: Demo Business Scenario

# **1\. Executive Summary**

DigiTalent AI is a web-based enterprise platform designed to support internal digital capability training, competency-based assessment, internal certification and work-based competency validation. The platform helps organizations manage digital competency requirements by department and job position, assign learning activities, measure learning progress, evaluate assessment results, issue verifiable digital certificates and collect practical task evidence after training.

The key business direction is to move beyond a traditional Learning Management System. Instead of only tracking whether an employee has completed a course, DigiTalent AI focuses on whether the employee has achieved the required competency level for the job position and whether there is sufficient evidence to prove that competency in practice.

The MVP is intentionally controlled. Core scoring such as Skill Gap Analysis, Learning Recommendation, Training Risk Score and Workforce Readiness Score should be implemented with transparent rule-based logic. AI services may be used as optional support for drafting task suggestions, question drafts or explanation text, but final business decisions remain under human review.

## **1.1 Business Value Summary**

| Stakeholder | Primary Business Value |
| :---- | :---- |
| HR / Training Manager | Plan training by skill gaps, monitor readiness, track certificate status, identify training risk and manage capability data at company level. |
| Department Manager | Track team capability, assign practical tasks, evaluate work evidence and understand whether team members are ready for work requirements. |
| Internal Trainer | Create courses, manage learning content, build assessments, review question performance and optionally use AI to draft training questions. |
| Employee | Understand assigned learning, complete training, take assessments, receive certificates and prove competency through practical tasks. |
| Company Leadership | Gain visibility into workforce digital readiness, department weaknesses, training effectiveness and capability improvement trends. |
| Certificate Verifier | Verify certificate validity through QR code or certificate code without accessing sensitive internal employee information. |

## **1.2 BRD Goal**

The goal of this BRD is to define what the business needs from DigiTalent AI, why the system is needed, who will use it, what capabilities must be delivered in the MVP, what is outside the MVP, what rules must govern the business process and how the project success should be measured.

# **2\. Business Background and Problem Statement**

## **2.1 Business Background**

Digital transformation requires employees to continuously develop digital competencies such as AI literacy, data literacy, cybersecurity awareness, digital collaboration, digital document management and modern workplace tool usage. In many organizations, internal training still depends on documents, chat groups, spreadsheets, manual quizzes and informal confirmation of completion.

This creates a gap between learning completion and actual capability. HR may know that an employee attended a course, but still cannot confidently verify whether the employee can apply the learned knowledge in real work scenarios. Managers also lack a structured way to assign post-training practical tasks, review evidence and update the employee competency profile.

## **2.2 Core Business Problems**

| ID | Problem | Description | Business Impact |
| :---- | :---- | :---- | :---- |
| BP-01 | Scattered training data | Training materials, scores, certificates and progress may be stored in separate folders, spreadsheets, emails or chat messages. | HR cannot obtain a unified view of training and capability status. |
| BP-02 | Course completion does not prove competency | Existing training often confirms attendance or completion but not job-readiness. | Managers cannot verify whether employees can perform tasks requiring the competency. |
| BP-03 | No unified competency framework | Courses are not consistently mapped to digital competencies, levels or job position requirements. | Skill gaps by role, department and business need are difficult to measure. |
| BP-04 | Weak certificate governance | Internal certificates may be issued manually and may lack QR verification, expiry, revocation and audit history. | Certificate validity is hard to verify and maintain. |
| BP-05 | Limited management dashboards | Managers may not have focused dashboards for progress, risk, readiness and task evidence. | Capability governance becomes reactive rather than data-driven. |
| BP-06 | Post-training task evidence is not structured | Practical assignments may be handled through chat or email without tracking and evidence linkage. | Organizations cannot prove whether learning outcomes are applied in work. |
| BP-07 | AI and analytics are often unclear or too broad | Advanced AI systems can be hard to explain or too large for a capstone MVP. | The project needs transparent, feasible and defensible scoring logic. |

## **2.3 Opportunity for DigiTalent AI**

The business opportunity is to provide a lightweight workforce capability platform that connects competency requirements, training, assessment, certificate verification and post-training task evidence in one coherent workflow. The system should be small enough for a capstone team to implement, but structured enough to demonstrate enterprise thinking.

# **3\. Business Vision and Objectives**

## **3.1 Business Vision**

DigiTalent AI aims to become a focused internal workforce capability platform that helps enterprises answer five practical questions:

* What digital competencies are required for each department or job position?  
* Which competencies does each employee currently have and which ones are missing?  
* Which learning activities should be assigned to close the skill gap?  
* Which employees are at risk of failing or delaying training?  
* What evidence proves that an employee can apply learned knowledge in real work?

## **3.2 Business Objectives**

| ID | Objective | Business Meaning | Priority |
| :---- | :---- | :---- | :---- |
| OBJ-01 | Digitize internal digital competency training management | Replace fragmented spreadsheets and informal tracking with a centralized system. | MVP |
| OBJ-02 | Define and manage competency requirements by job position | Allow HR to map required digital competencies and levels to departments and positions. | MVP |
| OBJ-03 | Connect courses and assessments to competencies | Ensure learning content and assessment results contribute to employee competency profiles. | MVP |
| OBJ-04 | Provide explainable capability analysis | Support skill gap, recommendation, risk and readiness through transparent formulas. | MVP |
| OBJ-05 | Issue and verify internal digital certificates | Use certificate code, QR URL, status, expiry and audit trail to govern certificates. | MVP |
| OBJ-06 | Validate competency through practical task evidence | Use WMS-lite workflow to assign, submit, evaluate and store post-training task evidence. | MVP |
| OBJ-07 | Support HR and managers with actionable dashboards | Provide readiness, risk, progress and certificate views for decision support. | MVP |
| OBJ-08 | Use AI safely as an assistant, not as final decision maker | Use AI for optional task/question drafts and explanation; keep official scoring controllable. | Bonus / Future |

## **3.3 Success Criteria**

* A full demo can show the journey from job position requirement to skill gap, assigned course, assessment, certificate, practical task, evidence and updated readiness.  
* Every core score shown to HR/Manager can be explained by input factors and rule-based logic.  
* Certificate verification can be performed using a certificate code or QR link without exposing sensitive employee data.  
* Department Manager can only see and evaluate employees within authorized scope.  
* The MVP works as a coherent web application, not as disconnected screens.

# **4\. Stakeholders and User Roles**

## **4.1 Stakeholder Overview**

| Stakeholder / Role | Business Responsibility | Key Need |
| :---- | :---- | :---- |
| System Admin | Operates the platform, manages system configuration, users, roles and audit logs. | High control over master data and permissions. |
| HR / Training Manager | Owns company-wide training and capability management process. | Needs global visibility and reporting. |
| Department Manager | Owns department-level employee capability, task assignment and evidence review. | Needs department-limited access and task evaluation tools. |
| Internal Trainer | Owns courses, lessons, materials, questions and assessments. | Needs content and assessment management. |
| Employee | Learns, takes assessments, receives certificates and submits task evidence. | Needs simple learning portal and feedback visibility. |
| Certificate Verifier | Checks whether a certificate is valid. | Needs limited verification-only access. |
| Company Leadership | Uses aggregate insights for capability planning. | Usually consumes dashboards/reports, not daily operations. |

## **4.2 Role-Level Business Permissions**

| Role | Allowed Business Actions | Restriction |
| :---- | :---- | :---- |
| System Admin | All system configuration, users, roles, permissions, master data, audit logs. | Should not override business assessments without audit trail. |
| HR / Training Manager | Company-wide training planning, employee management, competency framework, course assignment, dashboard, certificate tracking. | Can view organization-wide capability data. |
| Department Manager | View own department employees, assign practical tasks, evaluate task submissions, view department dashboard. | Must be restricted by department scope. |
| Internal Trainer | Create/edit courses, lessons, materials, question bank, assessments and review AI question drafts. | Does not make HR promotion decisions. |
| Employee | View assigned courses, learn lessons, take assessments, submit tasks, view own certificates and feedback. | Cannot edit official scores, certificates or competency levels. |
| Certificate Verifier | Search/verify certificate by code or QR. | Cannot access internal learning or HR data. |

# **5\. Current Business Process (As-Is)**

The current process below describes the typical pain points that DigiTalent AI is designed to improve. It is intentionally written in business terms, not technical terms.

## **5.1 As-Is Process: Internal Training and Certification**

| Step | Current Activity | Pain Point |
| :---- | :---- | :---- |
| 1 | HR or Trainer prepares documents/slides manually. | No consistent mapping to competencies or job positions. |
| 2 | Employees receive training materials through email, shared folders or chat. | Learning history and material access are not centralized. |
| 3 | Employees complete training or simple quiz. | Completion may not represent actual competency. |
| 4 | Certificate or confirmation is issued manually. | Certificate validity, expiry and revocation are hard to control. |
| 5 | Manager may assign practical work informally. | Task result is not linked to competency evidence. |
| 6 | HR prepares reports manually. | Risk, readiness and department gap analysis are delayed or incomplete. |

## **5.2 Business Impact of As-Is Process**

* Training decisions are based on course completion rather than proven capability.  
* Skill gaps are difficult to identify at employee, department and job position level.  
* Managers have limited evidence to decide whether employees are ready for work responsibilities.  
* Certificate validity is hard to verify externally or internally.  
* Training investment is difficult to evaluate because practical improvement is not systematically captured.

# **6\. Proposed Business Process (To-Be)**

## **6.1 End-to-End Business Workflow**

The proposed workflow connects competency management, learning, assessment, certification and practical evidence into one business loop:

Organization Structure \-\> Job Position \-\> Required Competencies \-\> Course and Assessment \-\> Learning Progress \-\> Skill Gap / Recommendation \-\> Assessment Result \-\> Certificate \-\> Practical Task \-\> Task Evaluation \-\> Competency Evidence \-\> Readiness Dashboard

## **6.2 To-Be Process Details**

| Step | To-Be Activity | Expected Business Result |
| :---- | :---- | :---- |
| 1 | HR/Admin defines departments, job positions and employee profiles. | A structured organization base exists. |
| 2 | HR defines competency categories, competency levels and position requirements. | Each job position has required digital competencies. |
| 3 | Trainer creates courses, lessons, materials, question bank and assessments. | Learning assets are mapped to competencies. |
| 4 | HR/Manager assigns courses to employees, departments or positions. | Learning is aligned with business capability needs. |
| 5 | Employee learns and completes quizzes/assessments. | Progress and scores are recorded. |
| 6 | System calculates skill gap, recommendation, risk and readiness using rules. | HR/Manager receives explainable capability indicators. |
| 7 | System issues certificates when requirements are satisfied. | Certificate has code, QR, status and expiry. |
| 8 | Manager assigns post-training practical task. | Employee competency is verified through work evidence. |
| 9 | Employee submits output/file/link; Manager evaluates score and feedback. | Task evidence is captured and linked to competency. |
| 10 | Dashboard updates readiness, risk, evidence and certificate views. | Business decisions are data-driven and auditable. |

## **6.3 Business Principles**

* Competency-first: Courses, assessments, certificates and tasks must be linked to concrete competencies.  
* Evidence-based: Employee capability should be supported by assessment, certificate, task and manager review evidence.  
* Explainable: Core scores must be calculated using clear inputs and formulas.  
* Human-in-the-loop: AI may suggest but official decisions remain under HR, Manager or Trainer control.  
* Controlled scope: MVP focuses on a complete working capability loop, not a full enterprise HRM or LMS suite.

# **7\. Business Scope**

## **7.1 In-Scope for MVP**

| ID | Capability | MVP Business Scope |
| :---- | :---- | :---- |
| MVP-01 | Authentication and RBAC | Secure login, role-based access and protected dashboards. |
| MVP-02 | Organization and Employee Management | Departments, positions, employees, managers and employee status. |
| MVP-03 | Competency Framework | Competency categories, levels, required competencies and employee competency profile. |
| MVP-04 | Course and Learning Management | Courses, lessons, materials, assignment and progress tracking. |
| MVP-05 | Assessment and Question Bank | Question management, quizzes, final assessments, attempts and scoring. |
| MVP-06 | Basic Capability Analysis | Skill gap, learning recommendation, training risk and workforce readiness using rules. |
| MVP-07 | Digital Certificate Verification | Certificate issuance, code, QR URL, valid/expired/revoked status and audit. |
| MVP-08 | WMS-lite Task Evidence | Practical task assignment, submission, evaluation and competency evidence update. |
| MVP-09 | Dashboards | HR, Manager, Trainer and Employee dashboards at MVP level. |
| MVP-10 | Admin and Governance | Master data, system configuration, thresholds, audit logs and deployment preparation. |

## **7.2 Out of Scope for MVP**

* Native mobile application.  
* Full HRM suite such as payroll, attendance, leave management and performance appraisal cycle.  
* Full project management or Kanban system like Jira/Trello.  
* Full talent marketplace or internal mobility platform.  
* Complex microservices architecture at the start of the project.  
* Custom machine learning model training without sufficient real dataset.  
* Blockchain certificate verification.  
* Full AI tutor, semantic knowledge search or document chatbot as mandatory MVP scope.  
* Real-time video classroom, livestream, video call or online meeting management.

## **7.3 Optional / Bonus Scope**

| ID | Bonus Feature | Business Value |
| :---- | :---- | :---- |
| BON-01 | AI Question Draft | AI generates draft quiz or scenario questions; Trainer reviews before publishing. |
| BON-02 | AI Task Suggestion | AI suggests practical tasks and evaluation criteria based on skill gaps or completed courses. |
| BON-03 | Career & Promotion Readiness | Compare employee capability with a target position to identify missing competencies. |
| BON-04 | Competency Heatmap | Visualize capability gaps by department, position or competency category. |
| BON-05 | AI Explanation Detail | Generate readable explanation for recommendations, risks and readiness. |
| BON-06 | Learning ROI / Improvement Analysis | Analyze improvement between pre-assessment and post-assessment. |

# **8\. Business Capability Map**

The following capability map translates the business scope into major capability areas. These capabilities will later be expanded into SRS functional requirements, database entities, APIs and UI screens.

| Capability Area | Business Purpose | Primary Users |
| :---- | :---- | :---- |
| Identity & Access | Authenticate users, control role-based access and protect sensitive operations. | All roles |
| Organization Management | Maintain departments, job positions, employees and manager relationships. | Admin, HR |
| Competency Management | Define competency framework and position requirements. | HR, Admin |
| Learning Management | Manage courses, lessons, materials and course assignment. | Trainer, HR |
| Assessment Management | Manage question bank, quizzes, attempts and scoring. | Trainer, Employee |
| Capability Intelligence | Analyze skill gap, recommend learning, score risk and readiness. | System, HR, Manager |
| Certificate Management | Issue, revoke, expire and verify certificates. | System, HR, Employee, Verifier |
| Work-Based Task Evidence | Assign practical tasks, collect submissions and evaluate work evidence. | Manager, Employee |
| Dashboard & Analytics | Provide role-based business insights. | HR, Manager, Trainer, Employee |
| Notification & Reminder | Notify users about assignments, deadlines, risk and feedback. | All roles |
| Governance & Audit | Record key changes, approvals, score changes and certificate operations. | Admin, HR |

# **9\. Detailed Business Requirements**

Requirement priority uses MoSCoW style: Must \= required for MVP; Should \= important but can be simplified; Could \= optional bonus; Won't \= out of MVP. This table is the key baseline for SRS and task planning.

| Requirement ID | Area | Business Requirement | Actor | Priority | Phase |
| :---- | :---- | :---- | :---- | :---- | :---- |
| BRQ-AUTH-01 | Identity & Access | The system must allow authorized users to log in securely and access features based on assigned role. | All roles | Must | MVP |
| BRQ-AUTH-02 | Identity & Access | The system must support role-based dashboards for System Admin, HR/Training Manager, Department Manager, Internal Trainer, Employee and Certificate Verifier. | All roles | Must | MVP |
| BRQ-AUTH-03 | Identity & Access | The system should record important authentication and permission-related actions in audit logs. | Admin | Should | MVP |
| BRQ-ORG-01 | Organization | HR/Admin must be able to manage departments and their active/inactive status. | Admin, HR | Must | MVP |
| BRQ-ORG-02 | Organization | HR/Admin must be able to manage job positions and assign position requirements. | Admin, HR | Must | MVP |
| BRQ-ORG-03 | Organization | HR/Admin must be able to manage employee profiles, department assignment, job position and direct manager. | Admin, HR | Must | MVP |
| BRQ-ORG-04 | Organization | The system should support employee status such as active, inactive, transferred and archived. | Admin, HR | Should | MVP |
| BRQ-COMP-01 | Competency | HR must be able to define competency categories such as AI Literacy, Data Literacy, Cybersecurity, Digital Collaboration and Digital Document Management. | HR | Must | MVP |
| BRQ-COMP-02 | Competency | HR must be able to define competency levels and achievement criteria. | HR | Must | MVP |
| BRQ-COMP-03 | Competency | HR must be able to map required competencies to job positions with required level, weight and mandatory flag. | HR | Must | MVP |
| BRQ-COMP-04 | Competency | The system must maintain an employee competency profile that can be updated from assessment, certificate, task evidence or authorized manual review. | HR, Manager, System | Must | MVP |
| BRQ-LRN-01 | Learning | Trainer must be able to create and manage courses, modules, lessons and learning materials. | Trainer | Must | MVP |
| BRQ-LRN-02 | Learning | Trainer/HR must be able to link each course to one or more competencies. | Trainer, HR | Must | MVP |
| BRQ-LRN-03 | Learning | HR/Manager must be able to assign courses to employees, departments or job positions. | HR, Manager | Must | MVP |
| BRQ-LRN-04 | Learning | Employee must be able to view assigned courses, learn lessons and track learning progress. | Employee | Must | MVP |
| BRQ-ASM-01 | Assessment | Trainer must be able to manage question bank, options, correct answers and assessment configuration. | Trainer | Must | MVP |
| BRQ-ASM-02 | Assessment | Employee must be able to take quiz or final assessment and receive results according to scoring rules. | Employee | Must | MVP |
| BRQ-ASM-03 | Assessment | The system must store assessment attempts, score, pass/fail status and attempt history. | System | Must | MVP |
| BRQ-INT-01 | Capability Intelligence | The system must calculate skill gap by comparing required competency level with current employee competency level. | System, HR, Manager | Must | MVP |
| BRQ-INT-02 | Capability Intelligence | The system must recommend courses or learning paths based on skill gaps and course-competency mapping. | System, Employee, HR, Manager | Must | MVP |
| BRQ-INT-03 | Capability Intelligence | The system must calculate training risk score using progress, scores, failed attempts, inactivity and deadlines. | System, HR, Manager | Must | MVP |
| BRQ-INT-04 | Capability Intelligence | The system must calculate workforce readiness score using competency, certificate, progress and task performance data. | System, HR, Manager | Must | MVP |
| BRQ-INT-05 | Capability Intelligence | The system should provide explanation of why a recommendation, risk or readiness value is generated. | HR, Manager, Employee | Should | MVP / Bonus |
| BRQ-CER-01 | Certificate | The system must issue digital certificates when course completion and assessment conditions are satisfied. | System, HR, Employee | Must | MVP |
| BRQ-CER-02 | Certificate | Each certificate must have certificate code, QR verification URL, issue date, expiry date if applicable and status. | System | Must | MVP |
| BRQ-CER-03 | Certificate | Verifier must be able to verify certificate validity using certificate code or QR link without accessing sensitive internal data. | Verifier | Must | MVP |
| BRQ-CER-04 | Certificate | HR/Admin must be able to revoke a certificate with reason and audit log. | HR, Admin | Should | MVP |
| BRQ-TASK-01 | WMS-lite Task | Manager must be able to assign practical tasks with description, deadline, expected output and evaluation criteria. | Manager | Must | MVP |
| BRQ-TASK-02 | WMS-lite Task | Employee must be able to view assigned tasks, update progress and submit result/file/link as evidence. | Employee | Must | MVP |
| BRQ-TASK-03 | WMS-lite Task | Manager must be able to evaluate task score, give feedback and confirm competency evidence. | Manager | Must | MVP |
| BRQ-TASK-04 | WMS-lite Task | Task evaluation must be able to affect task performance score and workforce readiness score after manager approval. | System, Manager | Must | MVP |
| BRQ-EVD-01 | Evidence Portfolio | The system must store competency evidence from assessment, certificate, task, manager review or manual entry. | System, HR, Manager | Must | MVP |
| BRQ-DASH-01 | Dashboard | HR dashboard must show company-wide learning status, certificate summary, risk overview and readiness overview. | HR | Must | MVP |
| BRQ-DASH-02 | Dashboard | Manager dashboard must show department employee progress, risk list, task performance and readiness score. | Manager | Must | MVP |
| BRQ-DASH-03 | Dashboard | Trainer dashboard should show course statistics, assessment results and question performance. | Trainer | Should | MVP |
| BRQ-DASH-04 | Dashboard | Employee dashboard must show assigned courses, progress, certificates, tasks and recommendations. | Employee | Must | MVP |
| BRQ-NOT-01 | Notification | The system should send in-app notifications for course assignment, task assignment, deadlines, certificate expiry and feedback completion. | All roles | Should | MVP |
| BRQ-ADM-01 | Admin | Admin must be able to configure roles, permissions, master data, scoring thresholds, certificate expiry rules and readiness weights. | Admin | Must | MVP |
| BRQ-AI-01 | AI Optional | AI may suggest practical tasks and evaluation criteria based on skill gap or recently completed courses. | Manager, System | Could | Bonus |
| BRQ-AI-02 | AI Optional | AI may generate draft quiz questions for Trainer review before publishing. | Trainer | Could | Bonus |
| BRQ-AI-03 | AI Future | AI Learning Assistant and semantic knowledge search are future enhancements, not MVP commitments. | Employee | Won't | Future |

# **10\. Business Rules**

Business rules define mandatory conditions and constraints that must be respected by system behavior, UI, API, database design and test cases.

| Rule ID | Business Rule | Domain |
| :---- | :---- | :---- |
| BRU-01 | Each job position must have at least one required competency before it is considered complete. | Competency |
| BRU-02 | Each competency must have clear levels and achievement criteria. | Competency |
| BRU-03 | Each course must be linked to at least one competency to support capability tracking. | Learning |
| BRU-04 | An employee can only receive a certificate after completing required learning conditions and passing assessment criteria. | Certificate |
| BRU-05 | Expired or revoked certificates must not be counted as valid in Certificate Score. | Certificate |
| BRU-06 | Certificate revocation must require a reason and must be recorded in audit log. | Certificate |
| BRU-07 | Department Manager can only view and evaluate employees under authorized department scope. | Access Control |
| BRU-08 | HR/Training Manager can view organization-wide learning, certificate and competency data. | Access Control |
| BRU-09 | Trainer can create and manage learning content and assessment but cannot override official HR competency decisions without permission. | Learning |
| BRU-10 | Employee cannot modify assessment score, certificate status or official competency level. | Access Control |
| BRU-11 | Skill Gap is calculated by comparing required competency level with current employee competency level. | Intelligence |
| BRU-12 | Training Risk Score must be explainable by factors such as progress delay, low score, inactivity, deadline pressure and failed attempts. | Intelligence |
| BRU-13 | Workforce Readiness Score must be recalculated when competency, certificate, progress or task performance changes. | Intelligence |
| BRU-14 | Important score thresholds and score weights must not be hard-coded; they should be configurable or centrally managed. | Governance |
| BRU-15 | Practical task must have description, deadline, expected output and evaluation criteria before assignment. | Task |
| BRU-16 | Task score only affects competency/readiness after valid Manager or Trainer evaluation. | Task |
| BRU-17 | Task evidence must be linked to employee, competency, evaluator and timestamp. | Evidence |
| BRU-18 | AI-generated questions must be reviewed and approved by Trainer before being used in official assessment. | AI Governance |
| BRU-19 | AI-generated task suggestions must be reviewed or adjusted by Manager before assignment. | AI Governance |
| BRU-20 | AI must not automatically grant certificate, promote employee or make final HR decisions. | AI Governance |
| BRU-21 | Every important change to certificate, competency profile, task evaluation and scoring configuration must be auditable. | Audit |
| BRU-22 | Certificate verification page must expose only verification-safe information, not full internal employee profile. | Security |
| BRU-23 | Course assignment can be made by employee, department or job position, depending on business need. | Learning |
| BRU-24 | Assessment attempt limit, pass score and retake rule must be defined per assessment or configuration. | Assessment |
| BRU-25 | Learning progress should reflect completion at lesson/course level and should be available for dashboard reporting. | Learning |
| BRU-26 | Evidence source type must be categorized, for example ASSESSMENT, CERTIFICATE, TASK, MANAGER\_REVIEW or MANUAL. | Evidence |
| BRU-27 | Manual evidence entry must be limited to authorized roles and must include reason/source note. | Evidence |
| BRU-28 | Inactive or archived employees should not receive new mandatory assignments unless reactivated. | Organization |
| BRU-29 | Verifier access must not require internal employee account if public verification is enabled. | Certificate |
| BRU-30 | System should maintain consistent status values for course, task, certificate, employee and assessment lifecycle. | Governance |

# **11\. Data and Information Requirements**

This section defines high-level business data groups. The detailed ERD and database schema will be created in a separate Database Design document.

| Data Group | Key Information | Business Usage |
| :---- | :---- | :---- |
| User and Role Data | Account, role, permission, refresh token, login audit, profile information. | Used for access control and accountability. |
| Organization Data | Department, job position, employee profile, direct manager, status. | Used to map employees to business structure and permission scope. |
| Competency Data | Competency category, competency, level, description, achievement criteria, position requirement. | Used as the core business framework. |
| Learning Data | Course, module, lesson, material, enrollment, progress. | Used to track training activities. |
| Assessment Data | Question bank, questions, options, assessments, attempts, answers, scores. | Used to evaluate learning outcomes. |
| Certificate Data | Template, certificate, code, QR link, issue/expiry date, status, revocation reason. | Used for internal certification and external verification. |
| Task Evidence Data | Practical task, assignment, submission, attachment, evaluation, score, feedback. | Used to prove applied competency. |
| Capability Analysis Data | Skill gap result, recommendation, risk score, readiness score, score inputs, explanation logs. | Used for HR/Manager decision support. |
| Notification Data | Notification type, recipient, content, status and related object. | Used to remind users and track updates. |
| Audit Data | Actor, action, object, before/after snapshot, timestamp and reason. | Used for governance and accountability. |

## **11.1 Data Quality Requirements**

* Competency, course, assessment and certificate data must be uniquely identifiable.  
* Status values must be controlled to avoid inconsistent states such as duplicate meanings for completed/done/finished.  
* Score records should preserve enough input information for explanation and recalculation.  
* Uploaded files must be linked to business objects such as lesson material, task submission or certificate PDF.  
* Important business data should support soft delete or archive instead of destructive deletion where appropriate.

# **12\. Reporting and Analytics Requirements**

Reporting requirements focus on management questions rather than only system statistics. Dashboards must help stakeholders make training and capability decisions.

| Report ID | Report / Dashboard | Business Question Answered | Primary User | Phase |
| :---- | :---- | :---- | :---- | :---- |
| RPT-01 | HR Dashboard | Company-wide learning progress, certificate status, training risk summary, readiness overview. | HR / Training Manager | MVP |
| RPT-02 | Manager Dashboard | Department employee progress, risk list, practical task status, task performance, readiness score. | Department Manager | MVP |
| RPT-03 | Trainer Dashboard | Course participation, completion rate, assessment results, question performance. | Internal Trainer | MVP |
| RPT-04 | Employee Dashboard | Assigned courses, progress, certificates, tasks, recommendations and feedback. | Employee | MVP |
| RPT-05 | Certificate Tracking | Valid, expired, revoked and near-expiry certificates. | HR, Admin | MVP |
| RPT-06 | Training Risk List | Employees at risk of failing or delaying training, with reason factors. | HR, Manager | MVP |
| RPT-07 | Competency Heatmap | Capability strengths and weaknesses by department, position and competency. | HR, Leadership | Bonus |
| RPT-08 | Learning Improvement / ROI | Pre/post assessment improvement and task performance after training. | HR, Leadership | Bonus |
| RPT-09 | Career Readiness Report | Readiness against target position and missing competencies. | HR, Manager | Bonus |

## **12.1 Dashboard Design Principles**

* Dashboard should prioritize actionable items such as risk employees, expiring certificates and missing competencies.  
* Dashboard numbers must be traceable to records and not appear as unexplained black-box values.  
* Department Manager dashboard must filter by department permission scope.  
* Employee dashboard should be simple and focused on next action: learn, take assessment, submit task or view feedback.

# **13\. Non-Functional Business Requirements**

The following requirements are business-level expectations. Technical implementation details will be expanded in the Architecture, Security and Deployment documents.

| ID | Category | Requirement | Priority |
| :---- | :---- | :---- | :---- |
| NFR-01 | Security | The system must protect employee data, assessment results, certificate information and competency records through authentication and authorization. | Must |
| NFR-02 | Access Control | Role and department-level access must be enforced consistently across pages and APIs. | Must |
| NFR-03 | Auditability | Important business actions must be traceable for review and defense. | Must |
| NFR-04 | Usability | Core users should understand their next action without technical support. | Must |
| NFR-05 | Reliability | The system should handle normal demo and MVP usage without data loss or inconsistent status. | Must |
| NFR-06 | Performance | Dashboards should load within reasonable time using optimized queries or cached data if needed. | Should |
| NFR-07 | Maintainability | The system should be modular so that team members can work on domains without heavy conflict. | Must |
| NFR-08 | Scalability Direction | Architecture should allow future expansion to AI assistant, semantic search or HRM integration without major rewrite. | Should |
| NFR-09 | Deployment Readiness | The system should be deployable using Docker Compose and reverse proxy configuration. | Must |
| NFR-10 | Data Privacy | Verifier and public pages must expose only necessary certificate verification data. | Must |

# **14\. Assumptions, Constraints and Dependencies**

## **14.1 Assumptions**

* The project is implemented by a 5-member capstone team within limited time; therefore, scope must be controlled.  
* The organization data used for demo can be seeded as sample data rather than integrated from a real HRM system.  
* Core scoring can use transparent rule-based formulas without training a custom machine learning model.  
* AI provider integration, if implemented, is used only for optional suggestions and explanations, not final decisions.  
* Certificate verification can be implemented as a web verification page using certificate code or QR URL.

## **14.2 Constraints**

| ID | Constraint | Business Implication |
| :---- | :---- | :---- |
| CST-01 | Time and team capacity | The MVP must prioritize the end-to-end capability loop over advanced AI or large enterprise features. |
| CST-02 | Data availability | Real enterprise training data may not be available; demo data must be realistic and consistent. |
| CST-03 | AI reliability | LLM output may be inconsistent; all AI output must be reviewed or treated as suggestions. |
| CST-04 | Technical stack | The project technology stack has been selected: ReactJS, TypeScript, TailwindCSS, ShadCN/UI, ASP.NET Core/C\#, PostgreSQL, MinIO, optional Redis, SignalR, Docker, Nginx and GitHub Actions. |
| CST-05 | Scope clarity | Full HRM, mobile app, blockchain, custom ML and full AI tutor are outside MVP. |

## **14.3 Dependencies**

* BRD approval before detailed SRS and database design.  
* Agreement on role names, permissions and department visibility rules.  
* Agreement on initial competency categories, levels and sample job positions.  
* Agreement on scoring formulas and thresholds before implementing dashboards.  
* Availability of file storage for lesson materials, task submissions and certificate PDFs.

# **15\. Risks and Mitigation Plan**

| Risk ID | Risk | Impact | Likelihood | Mitigation |
| :---- | :---- | :---- | :---- | :---- |
| RSK-01 | Scope creep from too many AI features | High | Medium | Keep AI Learning Assistant, semantic search and custom ML as future; implement rule-based scoring first. |
| RSK-02 | Team builds screens before business flow is clear | High | Medium | Approve BRD, Use Case List and main workflow before UI/API coding. |
| RSK-03 | RBAC becomes inconsistent across frontend/backend | High | Medium | Create RBAC matrix and enforce permission checks on backend APIs. |
| RSK-04 | Scoring formulas are hard-coded and hard to explain | Medium | Medium | Create AI/Scoring Design document and centralize thresholds/weights. |
| RSK-05 | Database design becomes too complex | High | Medium | Start with core entities; use optional entities only after MVP loop works. |
| RSK-06 | WMS-lite becomes full project management tool | High | Low | Limit task module to training-related practical tasks and evidence only. |
| RSK-07 | Dashboard is visually nice but not business-useful | Medium | Medium | Design dashboard around business questions: risk, readiness, certificate, progress, evidence. |
| RSK-08 | AI output creates wrong or unsafe business decision | Medium | Low | Use AI only as draft/suggestion; require Trainer/Manager/HR review. |
| RSK-09 | Certificate verification exposes too much information | High | Low | Verifier page shows only certificate-safe data and status. |
| RSK-10 | Deployment issues near deadline | High | Medium | Prepare Docker Compose and deployment guide early; keep local demo fallback. |

# **16\. MVP Acceptance Criteria**

The MVP should be considered business-ready for capstone demonstration when the following acceptance criteria are satisfied.

| ID | Acceptance Criterion | Validation Method |
| :---- | :---- | :---- |
| AC-01 | User roles can log in and see only appropriate dashboard/menu/features. | RBAC verified with at least Admin, HR, Manager, Trainer, Employee and Verifier. |
| AC-02 | HR/Admin can create organization structure, job positions and employees. | Sample company data can be maintained. |
| AC-03 | HR can define competencies, levels and position requirements. | At least 5 competency categories and sample positions are configured. |
| AC-04 | Trainer can create course, lesson, material and assessment linked to competencies. | Course-to-competency mapping works. |
| AC-05 | HR/Manager can assign course; Employee can learn and complete assessment. | Progress and score are recorded. |
| AC-06 | System can calculate skill gap and recommend learning based on mapped competencies. | Gap/recommendation result is explainable. |
| AC-07 | System can calculate training risk and readiness score from available data. | Scores show reason factors or input breakdown. |
| AC-08 | System can issue certificate after completion/pass condition and verify by QR/code. | Certificate status valid/expired/revoked is respected. |
| AC-09 | Manager can assign practical task; Employee can submit; Manager can evaluate. | Task evidence updates evidence portfolio and readiness input. |
| AC-10 | HR and Manager dashboards show progress, risk, certificate and readiness views. | Dashboard supports the main demo scenario. |
| AC-11 | Important actions such as certificate issue/revoke and task evaluation are auditable. | Audit log can be demonstrated. |
| AC-12 | Application can run with Docker Compose or documented local deployment steps. | Demo environment is reproducible. |

# **17\. Requirement Prioritization and Roadmap**

## **17.1 Recommended Delivery Phases**

| Phase | Name | Scope | Reason |
| :---- | :---- | :---- | :---- |
| Phase 1 | Foundation | Auth/RBAC, organization, employee, department, job position, basic layout. | Required before all business modules. |
| Phase 2 | Competency Core | Competency categories, levels, position requirements, employee competency profile. | Defines the core business data model. |
| Phase 3 | Learning & Assessment | Course, lesson, material, assignment, progress, question bank, assessment attempts. | Enables learning and score data. |
| Phase 4 | Capability Analysis | Skill gap, recommendation, training risk, readiness score. | Should be implemented after enough data exists. |
| Phase 5 | Certificate & WMS-lite | Certificate QR, verification, practical task, submission, evaluation, evidence. | Completes the unique value proposition. |
| Phase 6 | Dashboards & Governance | HR/Manager/Trainer/Employee dashboards, audit logs, notifications, configs. | Improves demo and production readiness. |
| Phase 7 | Bonus AI | AI question draft, AI task suggestion, AI explanation, career readiness. | Only after MVP loop is stable. |

## **17.2 MVP Priority Logic**

The team should not start with AI chatbot or advanced dashboards. The first target is to prove the main business loop. Once the loop works end-to-end, optional AI and visualization features can be added safely.

# **18\. Traceability Matrix**

This matrix links business problems to the capabilities and requirements that address them. It helps the team defend why each module exists.

| Business Problem | Capability Response | Related Requirements / Rules |
| :---- | :---- | :---- |
| BP-01 Scattered training data | Learning Management, Assessment Management, Certificate Management | BRQ-LRN-01 to BRQ-LRN-04, BRQ-ASM-01 to BRQ-ASM-03, BRQ-CER-01 to BRQ-CER-03 |
| BP-02 Completion does not prove competency | Competency Management, WMS-lite Task, Evidence Portfolio | BRQ-COMP-04, BRQ-TASK-01 to BRQ-TASK-04, BRQ-EVD-01 |
| BP-03 No competency framework | Competency Framework, Position Requirement | BRQ-COMP-01 to BRQ-COMP-03 |
| BP-04 Weak certificate governance | Certificate Management, Audit | BRQ-CER-01 to BRQ-CER-04, BRU-04 to BRU-06 |
| BP-05 Limited dashboards | Dashboard & Analytics | BRQ-DASH-01 to BRQ-DASH-04, RPT-01 to RPT-09 |
| BP-06 Post-training evidence not structured | WMS-lite Task, Competency Evidence Portfolio | BRQ-TASK-01 to BRQ-TASK-04, BRQ-EVD-01 |
| BP-07 AI/analytics unclear | Capability Intelligence, Explainable Scoring, Human Review | BRQ-INT-01 to BRQ-INT-05, BRU-18 to BRU-20 |

# **19\. Glossary**

| Term | Definition |
| :---- | :---- |
| BRD | Business Requirement Document. Defines business needs, scope, stakeholders, rules and acceptance direction. |
| Competency | A measurable capability or skill area required for a job position, such as AI Literacy or Data Literacy. |
| Competency Level | A level describing competency maturity or achievement, for example level 1 to level 5\. |
| Position Requirement | The required competencies and levels for a job position. |
| Employee Competency Profile | The employee's current competency status based on evidence and evaluation. |
| Skill Gap | Difference between required competency level and current competency level. |
| Learning Recommendation | Suggested course or learning path based on skill gap and course-competency mapping. |
| Training Risk Score | Score estimating risk of failing or delaying training based on progress, score, attempts, inactivity and deadlines. |
| Workforce Readiness Score | Score showing how ready an employee or team is based on competency, certificate, progress and task evidence. |
| Certificate Verification | Process of checking a certificate status using certificate code or QR URL. |
| WMS-lite | A lightweight training-related task workflow for post-training practical assignment and evidence collection. |
| Competency Evidence | Proof that supports employee competency, such as assessment result, certificate, task submission or manager review. |
| Human-in-the-loop | A design principle where AI suggestions require human review before official use. |
| MVP | Minimum Viable Product. The smallest coherent version that demonstrates the core business value. |

# **20\. Appendix: Demo Business Scenario**

This scenario should be used later for demo script, sample data, test cases and presentation storytelling.

## **20.1 Scenario: Marketing Department Digital Capability Improvement**

1\. HR creates Marketing Department and Marketing Executive job position.

2\. HR defines required competencies: Data Literacy level 3, AI Productivity level 2 and Cybersecurity Awareness level 2\.

3\. Trainer creates a course named Data Analytics for Marketing and links it to Data Literacy.

4\. Employee Nguyen Van A is assigned as Marketing Executive but currently has Data Literacy level 1\.

5\. System calculates Skill Gap: Data Literacy missing 2 levels.

6\. System recommends Data Analytics for Marketing course.

7\. HR assigns the course to the employee.

8\. Employee learns lessons and completes final assessment with passing score.

9\. System issues a digital certificate with certificate code and QR verification URL.

10\. Manager assigns a practical task: create a campaign performance report using spreadsheet data.

11\. Employee submits the report file and explanation.

12\. Manager evaluates the task, gives score and confirms Data Literacy evidence.

13\. System updates competency evidence and recalculates workforce readiness score.

14\. HR dashboard shows Marketing Department readiness improvement and reduced skill gap.

## **20.2 Why This Scenario Is Strong for Defense**

* It demonstrates the difference between course completion and proven competency.  
* It uses all core modules in one coherent business flow.  
* It shows QR certificate verification and task evidence as unique values beyond standard LMS.  
* It allows the team to explain AI/rule-based scoring safely without claiming unrealistic machine learning.

# **Final BRD Conclusion**

DigiTalent AI should be implemented as a controlled, competency-first workforce capability platform. The MVP should prioritize a complete and defensible business loop: position requirement \-\> competency gap \-\> learning \-\> assessment \-\> certificate \-\> practical task \-\> evidence \-\> readiness dashboard. This approach is more valuable and feasible than attempting to clone a full LMS, HRM suite or AI tutor system.

Once this BRD is reviewed and accepted, the next recommended documents are SRS, Use Case Specification, ERD/Database Design, API Specification, RBAC Matrix and UI/UX Specification.