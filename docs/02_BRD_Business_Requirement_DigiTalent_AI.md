**DIGITAL TALENT AI**

**BUSINESS REQUIREMENT DOCUMENT (BRD)**

*Nền tảng đào tạo, đánh giá năng lực số và cấp chứng chỉ nội bộ cho nhân viên doanh nghiệp kết hợp giao việc thực hành sau đào tạo*

| Field | Information |
| :---- | :---- |
| Project Name | DigiTalent AI: Digital Competency Training, Internal Certification and Work-Based Assessment Platform |
| Document Type | Business Requirement Document (BRD) |
| Version | 1.1 |
| Prepared For | Capstone Project \- Software Engineering |
| Prepared By | Project Team / Technical Mentor Support |
| Main Source Scope | DigiTalent_AI_MASTER_SYSTEM_OVERVIEW_2026-10-09.md; Reports 1 v2.5, 2 v2.5, 3 v2.2 |
| Status | Working Enterprise Capstone baseline; not mentor-approved |

*Important note: This BRD defines business needs, business scope, stakeholder expectations, business rules and acceptance direction. It is not a detailed API, database or UI specification. SRS, ERD, API Specification and UI/UX Specification should be prepared after this document is approved.*

# **Document Control**

| Version | Description | Owner | Status |
| :---- | :---- | :---- | :---- |
| 1.0 | Initial BRD prepared from revised capstone scope and supporting analysis documents. | Project Team | Draft |
| 1.1 | Aligned scope, roles, TT02, evidence, internal certificate and acceptance with Master System Overview; GRADE-01 remains pending. | Project Team | Working baseline |

## **Input Documents and Scope Basis**

| No. | Input | Usage in BRD |
| :---- | :---- | :---- |
| 01 | DigiTalent_AI_MASTER_SYSTEM_OVERVIEW_2026-10-09.md | Current working baseline and conflict-resolution guidance for the Enterprise Capstone MVP. |
| 02 | Reports 1 v2.5, 2 v2.5, 3 v2.2 | Scope, project plan and requirement details according to the precedence described in the Master Overview. |
| 02 | Capstone\_Project\_Register\_DigiTalent\_AI.docx | Earlier broader scope. Used only as supporting context for optional features and terminology. |
| 03 | De\_tai\_DigiTalent\_AI\_Mo\_ta\_cap\_nhat\_14\_he\_thong.docx | Extended analysis with market comparison, business gap, business rules and bonus scope. Used to enrich business rationale. |
| 04 | 01\_Project\_Overview\_DigiTalent\_AI.docx | Project overview document. Used as a high-level alignment reference before BRD. |

## **How to Use This BRD**

* Use this document to align team members, mentor and stakeholders before writing code.  
* Use the business requirements and business rules as the baseline for SRS, Use Case Specification, ERD, API design and test cases.  
* Do not use this BRD as the final database schema or API contract. Technical details will be refined in later documents.  
* If sources conflict, follow the precedence in the Master System Overview. The Capstone Project Register is historical and must not be edited; unresolved GRADE-01 remains pending.

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

The Enterprise Capstone MVP is controlled to FE-01 through FE-09. It includes confirmed competency, Skill Gap, rule-based course recommendations and OWNER-initiated course assignment. AI-assisted Practical Task Evaluation is a proposed scope/effort expansion that must be reflected in Report 1/2 before it is treated as an approved MVP commitment. Training Risk Score, Workforce Readiness Score, Individual/B2C workspace, public certificate verification and subscription/payment are outside this baseline. This BRD states requirements and does not claim code implementation has been verified.

## **1.1 Business Value Summary**

| Stakeholder | Primary Business Value |
| :---- | :---- |
| PLATFORM_ADMIN | Manage platform users, TT02 framework and standard learning content. |
| OWNER | Manage organization/requirements, monitor learning, explicitly assign courses for updates/retraining, review tasks and certificates within the organization. |
| MANAGER (optional) | Monitor learning and review task evidence within assigned departments; cannot manage standard content or revoke certificates. |
| EMPLOYEE | View and start recommended courses, complete assigned learning and assessment, view own certificate and submit practical evidence. |

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
* Which required competencies have reviewed evidence and which remain gaps?
* What evidence proves that an employee can apply learned knowledge in real work?

## **3.2 Business Objectives**

| ID | Objective | Business Meaning | Priority |
| :---- | :---- | :---- | :---- |
| OBJ-01 | Digitize internal digital competency training management | Replace fragmented spreadsheets and informal tracking with a centralized system. | MVP |
| OBJ-02 | Define and manage competency requirements by job position | Allow HR to map required digital competencies and levels to departments and positions. | MVP |
| OBJ-03 | Connect courses and assessments to competencies | Ensure learning content and assessment results contribute to employee competency profiles. | MVP |
| OBJ-04 | Provide explainable competency analysis and learning actions | Support Skill Gap and automatic course recommendations through transparent competency-course mapping; allow OWNER to assign courses for organizational updates or retraining. | MVP |
| OBJ-05 | Issue and verify internal digital certificates | Use eligible-course conditions, certificate code, internal QR, Valid/Revoked status and audit trail; no expiry. | MVP |
| OBJ-06 | Validate competency through practical task evidence | Use WMS-lite to assign tasks, submit evidence and store human-reviewed competency evidence. AI-assisted rubric evaluation is a scope expansion pending Report 1/2 alignment. | Core workflow; AI evaluator scope pending |
| OBJ-07 | Support organization roles with actionable dashboards | Provide scoped requirement, learning, evidence and certificate views. | MVP |
| OBJ-08 | Use AI safely as an assistant, not as final decision maker | AI-assisted Practical Task Evaluation may propose rubric-based scores and rationale; authorized OWNER/MANAGER review and decide. Must align Report 1/2 scope and effort. | Scope expansion / pending alignment |

## **3.3 Success Criteria**

* Demo shows the journey from position requirement to Skill Gap, automatic course recommendation and optional OWNER assignment, assessment, eligible certificate, practical task, evidence review and recalculated Skill Gap.
* Skill Gap and course suggestions shown to users can be explained from their rule inputs.
* QR verification requires same-organization OWNER/MANAGER login and returns only verification-safe data.
* MANAGER can only see and evaluate employees within assigned department scope.
* The MVP works as a coherent web application, not as disconnected screens.

# **4\. Stakeholders and User Roles**

## **4.1 Stakeholder Overview**

| Stakeholder / Role | Business Responsibility | Key Need |
| :---- | :---- | :---- |
| PLATFORM_ADMIN | Manages platform-level users, TT02 reference and standard curriculum. | Needs controlled platform administration. |
| OWNER | Owns organization settings, members, positions, requirements, course assignment, task review and certificate governance. | Needs organization-wide access within own organization. |
| MANAGER (optional) | Supports assigned departments and reviews practical task evidence. | Needs department-scoped access. |
| EMPLOYEE | Learns, takes assessments, views own certificate and submits evidence. | Needs access limited to own records. |

## **4.2 Role-Level Business Permissions**

| Role | Allowed Business Actions | Restriction |
| :---- | :---- | :---- |
| PLATFORM_ADMIN | Manage platform users, TT02 reference versions/criteria, standard courses, lessons, question bank, assessments and reference positions. | No default access to private enterprise evidence/submissions. |
| OWNER | Manage organization, members, departments, positions, requirement sets, explicit course/task assignments, reviews and certificates; monitor recommended/assigned learning. | Cannot edit standard content or own grade; override can only decrease/reset with reason and audit. |
| MANAGER (optional) | View scoped team learning/gap/certificates; assign practical tasks and review/adjust AI evaluation proposals. | Limited to assigned departments; cannot edit requirements, standard content, assign standard courses or revoke certificates. |
| EMPLOYEE | View own requirements/gaps and recommended courses, start recommended learning, complete assigned courses/assessments, download certificates, submit evidence and view feedback. | Cannot self-confirm workplace competency or edit official records. |

# **5\. Current Business Process (As-Is)**

The current process below describes the typical pain points that DigiTalent AI is designed to improve. It is intentionally written in business terms, not technical terms.

## **5.1 As-Is Process: Internal Training and Certification**

| Step | Current Activity | Pain Point |
| :---- | :---- | :---- |
| 1 | Training owners prepare documents/slides manually. | No consistent mapping to competencies or job positions. |
| 2 | Employees receive training materials through email, shared folders or chat. | Learning history and material access are not centralized. |
| 3 | Employees complete training or simple quiz. | Completion may not represent actual competency. |
| 4 | Certificate or confirmation is issued manually. | Internal validity and revocation are difficult to audit. |
| 5 | Manager may assign practical work informally. | Task result is not linked to competency evidence. |
| 6 | HR prepares reports manually. | Risk, readiness and department gap analysis are delayed or incomplete. |

## **5.2 Business Impact of As-Is Process**

* Training decisions are based on course completion rather than proven capability.  
* Skill gaps are difficult to identify at employee, department and job position level.  
* Managers have limited evidence to decide whether employees are ready for work responsibilities.  
* Internal certificate validity and revocation are hard to verify consistently.
* Training investment is difficult to evaluate because practical improvement is not systematically captured.

# **6\. Proposed Business Process (To-Be)**

## **6.1 End-to-End Business Workflow**

The proposed workflow connects competency management, learning, assessment, certification and practical evidence into one business loop:

Organization Structure \-\> Position Requirement \-\> Confirmed Competency / Skill Gap \-\> Automatic Course Recommendation and/or OWNER Course Assignment \-\> Learning and Assessment \-\> Eligible Internal Certificate \-\> Practical Task \-\> AI Evaluation Proposal (if approved scope) \-\> OWNER/MANAGER Review and Decision \-\> Confirmed Competency \-\> Recalculated Skill Gap

## **6.2 To-Be Process Details**

| Step | To-Be Activity | Expected Business Result |
| :---- | :---- | :---- |
| 1 | OWNER defines departments, job positions and employee profiles. | Organization records are scoped and maintained. |
| 2 | PLATFORM_ADMIN maintains TT02 reference and standard content; OWNER configures versioned position requirements. | Each position has an active set of required competencies. |
| 3 | PLATFORM_ADMIN manages standard courses, lessons, question bank and assessments. | Learning assets are mapped to competencies. |
| 4 | System calculates Skill Gap and automatically recommends standard courses using competency-course mapping. | Employee can view and start recommended learning; recommendation is explainable. |
| 5 | OWNER may assign a course when the organization updates content or requires retraining. | Assignment coexists with recommendations; OWNER monitors progress within organization scope. |
| 6 | Employee learns and completes quizzes/assessments. | Progress and scores are recorded. Course assessment/certificate is a learning outcome, not confirmed workplace competency. |
| 7 | System issues a certificate only for an eligible course after required lessons and final assessment pass. | Certificate has code, QR and Valid/Revoked status; no expiry. |
| 8 | OWNER/MANAGER assigns a practical task within permitted scope, linked to target competencies and rubric. | Employee submits workplace evidence for review. |
| 9 | If AI evaluation is approved in Report 1/2, it proposes criterion scores, rationale, evidence references and gaps; OWNER/MANAGER reviews, edits, approves or requests more evidence. | Human reviewer makes final decision; task score stays separate from competency level. |
| 10 | System records reviewer decision and audit history; only valid approved level-confirming evidence updates Confirmed Competency and triggers Skill Gap recalculation. | Changes are attributable and auditable. |

## **6.3 Business Principles**

* Competency-first: Courses, assessments, certificates and tasks must be linked to concrete competencies.  
* Evidence-based: Confirmed Workplace Competency requires reviewed evidence; learning completion and certificate remain learning achievements.
* Explainable: Skill Gap and course recommendations use clear rules and competency-course mapping; risk/readiness scoring is outside this baseline.
* Dual learning mechanism: automatic course recommendations and explicit OWNER course assignments coexist. Recommended course does not mean automatic enrollment; employee can start learning from the recommendation.
* Human review: OWNER/MANAGER review task evidence and retain final authority; AI evaluation is advisory and only if approved in Reports 1/2. PLATFORM_ADMIN owns standard learning content.
* Controlled scope: AI-assisted Practical Task Evaluation expands AI scope and effort and must be planned in Report 1/2 before it becomes an MVP commitment.
* **PENDING DECISION:** For OWNER-assigned courses triggered by content updates/retraining, does required reevaluation mean final course assessment only or also Practical Task? The rule may differ for a content update versus a changed position competency requirement.

# **7\. Business Scope**

## **7.1 In-Scope for MVP**

| ID | Capability | MVP Business Scope |
| :---- | :---- | :---- |
| FE-01 | Authentication, Workspace & RBAC | Sign in/out, account/profile/session and server-side role access. |
| FE-02 | Organization, Departments, Positions & Members | Organization structure, membership, invitations and Manager assignment scope. |
| FE-03 | TT02 Reference Framework | Platform-managed framework versions, grade criteria and reference positions. |
| FE-04 | Position Competency Requirements | Draft/Active/Archived requirement sets and version history. |
| FE-05 | Competency Profile & Skill Gap | Confirmed competency, Not Assessed/Met/Partial Gap/Gap and controlled correction. |
| FE-06 | Competency-Linked Learning & Assessment | Standard content, assignment, learning, assessment and eligible internal certificate. |
| FE-07 | Practical Task & Evidence Review | Task assignment, submission, per-competency review, evidence and competency history. |
| FE-08 | Team Competency & Learning Monitoring | Scoped dashboards and in-app notifications. |
| FE-09 | Platform Administration & Reference Content | Platform users, dashboard, audit and settings. |

Out of scope: Individual/B2C workspace and trial/subscription/payment; public certificate verification; certificate expiry/renewal; internal Trainer role; Job Family/Career Grade; risk/readiness scoring and configurable weights. Full HRM, marketplace, enterprise SSO/LDAP, microservices and custom ML are also outside the MVP.

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
| BON-01 | AI Question Draft | If explored later, generated content requires authorized human review before use. |
| BON-02 | AI Task Suggestion | AI suggests practical tasks and evaluation criteria based on skill gaps or completed courses. |
| BON-03 | Career & Promotion Readiness | Compare employee capability with a target position to identify missing competencies. |
| BON-04 | Competency Heatmap | Visualize capability gaps by department, position or competency category. |
| BON-05 | AI Explanation Detail | Generate readable explanation for rule-based course suggestions, if approved for later scope. |
| BON-06 | Learning ROI / Improvement Analysis | Analyze improvement between pre-assessment and post-assessment. |

# **8\. Business Capability Map**

The following capability map translates the business scope into major capability areas. These capabilities will later be expanded into SRS functional requirements, database entities, APIs and UI screens.

| Capability Area | Business Purpose | Primary Users |
| :---- | :---- | :---- |
| Identity & Access | Authenticate users, control role-based access and protect sensitive operations. | All roles |
| Organization Management | Maintain departments, job positions, members and manager assignments. | OWNER |
| Competency Management | Maintain TT02 reference and configure versioned position requirements. | PLATFORM_ADMIN, OWNER |
| Learning Management | Maintain standard course, lessons, materials and competency mapping; recommend courses automatically from Skill Gap; allow OWNER course assignment for organizational updates/retraining. | PLATFORM_ADMIN, OWNER, EMPLOYEE |
| Assessment Management | Manage question bank, assessment versions, attempts and learning results. | PLATFORM_ADMIN, EMPLOYEE |
| Competency Analysis | Calculate Skill Gap and suggest learning; risk/readiness scores are out of scope. | System, OWNER, MANAGER |
| Certificate Management | Issue eligible internal certificates, revoke and verify within issuing organization. | System, OWNER, MANAGER, EMPLOYEE |
| Work-Based Task Evidence | Assign practical tasks, collect submissions and review evidence by competency. | OWNER, MANAGER, EMPLOYEE |
| Dashboard & Analytics | Provide role-scoped business views. | PLATFORM_ADMIN, OWNER, MANAGER, EMPLOYEE |
| Notification & Reminder | Notify users about assignments, deadlines and feedback. | All roles |
| Governance & Audit | Record key changes, evidence reviews, correction and certificate operations. | PLATFORM_ADMIN, OWNER |

# **9\. Detailed Business Requirements**

Requirement priority uses MoSCoW style: Must \= required for MVP; Should \= important but can be simplified; Could \= optional bonus; Won't \= out of MVP. This table is the key baseline for SRS and task planning.

| Requirement ID | Area | Business Requirement | Actor | Priority | Phase |
| :---- | :---- | :---- | :---- | :---- | :---- |
| BRQ-AUTH-01 | Identity & Access | The system must allow authorized users to log in securely and access features based on assigned role. | All roles | Must | MVP |
| BRQ-AUTH-02 | Identity & Access | The system must enforce role and data scope for PLATFORM_ADMIN, OWNER, MANAGER (optional) and EMPLOYEE. | All roles | Must | MVP |
| BRQ-AUTH-03 | Identity & Access | The system should record important authentication and permission-related actions in audit logs. | PLATFORM_ADMIN | Should | MVP |
| BRQ-ORG-01 | Organization | OWNER must be able to manage departments and their active/inactive status. | OWNER | Must | MVP |
| BRQ-ORG-02 | Organization | OWNER must manage job positions and versioned requirement sets; PLATFORM_ADMIN manages reference positions. | OWNER, PLATFORM_ADMIN | Must | MVP |
| BRQ-ORG-03 | Organization | OWNER must manage members, department assignment, job position and Manager assignment scope. | OWNER | Must | MVP |
| BRQ-ORG-04 | Organization | The system should support employee status such as active, inactive, transferred and archived. | Admin, HR | Should | MVP |
| BRQ-COMP-01 | Competency | PLATFORM_ADMIN must manage the TT02 framework versions and competency reference data. | PLATFORM_ADMIN | Must | MVP |
| BRQ-COMP-02 | Competency | The system must preserve TT02 grade criteria; mapping between 3 Training Levels and stored grade remains PENDING DECISION GRADE-01. | PLATFORM_ADMIN | Must | MVP |
| BRQ-COMP-03 | Competency | OWNER must configure versioned position requirements with competency, required grade and mandatory flag; no weight. | OWNER | Must | MVP |
| BRQ-COMP-04 | Competency | The system must maintain Confirmed Competency from approved level-confirming evidence; controlled correction may decrease/reset grade. Learning score/certificate alone cannot update it. | OWNER, MANAGER, System | Must | MVP |
| BRQ-LRN-01 | Learning | PLATFORM_ADMIN must manage standard courses, modules, lessons and learning materials. | PLATFORM_ADMIN | Must | MVP |
| BRQ-LRN-02 | Learning | PLATFORM_ADMIN must map standard courses to competencies and configure certificate eligibility. | PLATFORM_ADMIN | Must | MVP |
| BRQ-LRN-03 | Learning | OWNER may explicitly assign standard courses to employees for organizational updates or retraining; this coexists with automatic course recommendations. | OWNER | Must | MVP |
| BRQ-LRN-04 | Learning | Employee must be able to view and start eligible recommended courses, view assigned courses, learn lessons and track learning progress. Recommendation shows missing competency and mapped course. | System, Employee | Must | MVP |
| BRQ-ASM-01 | Assessment | PLATFORM_ADMIN must manage question bank, options, correct answers and assessment versions. | PLATFORM_ADMIN | Must | MVP |
| BRQ-ASM-02 | Assessment | Employee must be able to take quiz or final assessment and receive results according to scoring rules. | Employee | Must | MVP |
| BRQ-ASM-03 | Assessment | The system must store assessment attempts, score, pass/fail status and attempt history. | System | Must | MVP |
| BRQ-INT-01 | Competency Analysis | The system must calculate Skill Gap by comparing Active Requirement grade with Confirmed Competency; absence of position/active set is Not Assessed. | System, OWNER, MANAGER | Must | MVP |
| BRQ-INT-02 | Learning Recommendation | The system must automatically recommend eligible standard courses based on missing competencies and standard course-competency mapping; employees can start learning from recommendations. | System, EMPLOYEE | Must | MVP |
| BRQ-INT-03 | Capability Intelligence | Training risk score is outside Enterprise Capstone MVP. | N/A | Won't | Out of scope |
| BRQ-INT-04 | Capability Intelligence | Workforce readiness score is outside Enterprise Capstone MVP. | N/A | Won't | Out of scope |
| BRQ-INT-05 | Capability Intelligence | The system must explain Skill Gap and course suggestions using visible rule-based inputs. | OWNER, MANAGER, EMPLOYEE | Must | MVP |
| BRQ-CER-01 | Certificate | The system must issue an internal certificate only for an eligible course after required lessons are complete and final assessment is passed. | System | Must | MVP |
| BRQ-CER-02 | Certificate | Each certificate must have a unique code, internal QR, issue date and Valid/Revoked status; certificates do not expire. | System | Must | MVP |
| BRQ-CER-03 | Certificate | OWNER/MANAGER of the issuing organization must sign in to verify a certificate by QR; show only holder name, course/competency, issue date and status. | OWNER, MANAGER | Must | MVP |
| BRQ-CER-04 | Certificate | OWNER may revoke a certificate with reason and audit log; MANAGER may view scoped registry but cannot revoke. | OWNER | Must | MVP |
| BRQ-TASK-01 | WMS-lite Task | OWNER/MANAGER must be able to assign practical tasks with description, deadline, expected output, target competencies and evaluation rubric within permission scope. | OWNER, MANAGER | Must | MVP |
| BRQ-TASK-02 | WMS-lite Task | Employee must be able to view assigned tasks, update progress and submit result/file/link as evidence. | Employee | Must | MVP |
| BRQ-TASK-03 | WMS-lite Task | OWNER/MANAGER must review each target competency as Passed/Not Passed and mark whether passing evidence confirms a level. | OWNER, MANAGER | Must | MVP |
| BRQ-TASK-04 | WMS-lite Task | Approved level-confirming evidence may increase Confirmed Competency; late submissions remain eligible for review. | System, OWNER, MANAGER | Must | MVP |
| BRQ-AI-04 | AI-assisted Evaluation | If approved after Report 1/2 scope and effort alignment, AI analyzes accessible evidence against a versioned rubric and proposes per-criterion score, rationale, evidence references and unmet criteria. | AI Evaluator | Must if approved | Scope expansion / pending approval |
| BRQ-AI-05 | AI-assisted Evaluation | OWNER/MANAGER must review, edit, approve or request more evidence; only a valid approved review may produce level-confirming evidence. Task score remains distinct from Confirmed Competency Level. | OWNER, MANAGER | Must if approved | Scope expansion / pending approval |
| BRQ-AI-06 | AI Governance | Preserve rubric version, AI evaluation result, model/version if available, evidence references, reviewer decision and edit history. Protect evidence by organization/department permissions. | System, Reviewer | Must if approved | Scope expansion / pending approval |
| BRQ-EVD-01 | Evidence Portfolio | The system must store evidence review, source, reviewer, time, reason and competency; certificate/learning result alone is not competency evidence. | System, OWNER, MANAGER | Must | MVP |
| BRQ-DASH-01 | Dashboard | OWNER dashboard must show organization-scoped learning, certificate, requirement and Skill Gap views. | OWNER | Must | MVP |
| BRQ-DASH-02 | Dashboard | MANAGER dashboard must show assigned-department learning, task and Skill Gap views. | MANAGER | Must | MVP |
| BRQ-DASH-03 | Dashboard | PLATFORM_ADMIN dashboard should show platform administration and reference-content status. | PLATFORM_ADMIN | Should | MVP |
| BRQ-DASH-04 | Dashboard | Employee dashboard must show assigned courses, progress, certificates, tasks and recommendations. | Employee | Must | MVP |
| BRQ-NOT-01 | Notification | The system should send in-app notifications for course/task assignment, deadlines and feedback completion. | All roles | Should | MVP |
| BRQ-ADM-01 | Admin | PLATFORM_ADMIN manages platform users, reference content, audit and settings; no risk/readiness weights or certificate expiry rules are defined. | PLATFORM_ADMIN | Must | MVP |
| BRQ-AI-01 | AI Optional | AI task suggestion/drafting is not committed in Enterprise Capstone MVP; any later use requires authorized human review. This is distinct from AI-assisted evaluation of submitted evidence, which is a separate scope expansion under BRQ-AI-04 to BRQ-AI-06. | N/A | Won't | Future |
| BRQ-AI-02 | AI Optional | AI question drafting is not committed in Enterprise Capstone MVP; any later use requires authorized content review. | PLATFORM_ADMIN | Won't | Future |
| BRQ-AI-03 | AI Future | AI Learning Assistant and semantic knowledge search are future enhancements, not MVP commitments. | Employee | Won't | Future |

# **10\. Business Rules**

Business rules define mandatory conditions and constraints that must be respected by system behavior, UI, API, database design and test cases.

| Rule ID | Business Rule | Domain |
| :---- | :---- | :---- |
| BRU-01 | Each job position must have at least one required competency before it is considered complete. | Competency |
| BRU-02 | Each competency must have clear levels and achievement criteria. | Competency |
| BRU-03 | Each course must be linked to at least one competency to support capability tracking. | Learning |
| BRU-04 | An employee receives a certificate only for a certificate-eligible course after required lessons are completed and final assessment is passed. | Certificate |
| BRU-05 | Certificate status is Valid or Revoked; certificates have no expiry in the MVP. | Certificate |
| BRU-06 | OWNER may revoke a certificate with a reason recorded in audit history; MANAGER cannot revoke. | Certificate |
| BRU-07 | MANAGER can only view and evaluate employees in assigned department scope. | Access Control |
| BRU-08 | OWNER can view organization-scoped learning, certificate and competency data. | Access Control |
| BRU-09 | PLATFORM_ADMIN manages standard learning content; OWNER/MANAGER review enterprise evidence in their scope. | Learning |
| BRU-10 | Employee cannot modify assessment score, certificate status or official competency level. | Access Control |
| BRU-11 | Skill Gap compares required grade with Confirmed Competency; absent position or Active Requirement Set is Not Assessed. | Intelligence |
| BRU-12 | Training Risk Score is outside the Enterprise Capstone MVP. | Scope |
| BRU-13 | Workforce Readiness Score is outside the Enterprise Capstone MVP. | Scope |
| BRU-14 | Position Requirement has no weight; mandatory affects display/order, not the grade-gap formula. | Governance |
| BRU-15 | Practical task must have description, deadline, expected output and evaluation criteria before assignment. | Task |
| BRU-16 | Only Passed, level-confirming evidence can increase Confirmed Competency; a controlled correction may decrease/reset grade. | Task |
| BRU-17 | Task evidence must be linked to employee, competency, evaluator and timestamp. | Evidence |
| BRU-18 | Standard course and assessment content is managed by PLATFORM_ADMIN. | Learning |
| BRU-19 | AI task suggestions/drafts, if added later, require OWNER/MANAGER review before assignment; this rule does not describe evaluation of submitted task evidence. | Future AI Governance |
| BRU-20 | AI must not automatically grant certificate, set Confirmed Competency, promote an employee or make a final HR decision. AI evaluation is advisory; authorized OWNER/MANAGER makes the final evidence decision. | AI Governance |
| BRU-21 | Every important change to certificate, competency profile, task evaluation and scoring configuration must be auditable. | Audit |
| BRU-22 | Certificate verification page must expose only verification-safe information, not full internal employee profile. | Security |
| BRU-23 | OWNER assigns standard courses to employees; course content remains platform-managed. | Learning |
| BRU-24 | Assessment attempt limit, pass score and retake rule must be defined per assessment or configuration. | Assessment |
| BRU-25 | Learning progress should reflect completion at lesson/course level and should be available for dashboard reporting. | Learning |
| BRU-26 | Learning completion, assessment result and certificate are learning records; they do not automatically confirm workplace competency. | Evidence |
| BRU-27 | Manual evidence entry must be limited to authorized roles and must include reason/source note. | Evidence |
| BRU-28 | Inactive or archived employees should not receive new mandatory assignments unless reactivated. | Organization |
| BRU-29 | QR verification requires an authenticated OWNER or MANAGER in the issuing organization; there is no public verifier. | Certificate |
| BRU-30 | System should maintain consistent status values for course, task, certificate, employee and assessment lifecycle. | Governance |
| BRU-31 | OWNER correction may only decrease/reset a grade, requires reason/audit history and cannot target the acting OWNER's own grade. | Competency Correction |
| BRU-32 | Late task submissions are accepted, marked IsLate and remain eligible for review and evidence. | Task |

# **11\. Data and Information Requirements**

This section defines high-level business data groups. The detailed ERD and database schema will be created in a separate Database Design document.

| Data Group | Key Information | Business Usage |
| :---- | :---- | :---- |
| User and Role Data | Account, role, permission, refresh token, login audit, profile information. | Used for access control and accountability. |
| Organization Data | Department, job position, employee profile, direct manager, status. | Used to map employees to business structure and permission scope. |
| Competency Data | Competency category, competency, level, description, achievement criteria, position requirement. | Used as the core business framework. |
| Learning Data | Course, module, lesson, material, enrollment, progress. | Used to track training activities. |
| Assessment Data | Question bank, questions, options, assessments, attempts, answers, scores. | Used to evaluate learning outcomes. |
| Certificate Data | Certificate, code, internal QR route, issue date, Valid/Revoked status and revocation reason; no expiry. | Used for authenticated verification inside the issuing organization. |
| Task Evidence Data | Practical task, assignment, submission, attachment, rubric version, AI evaluation result/model version when applicable, reviewer decision/edit history, task score, feedback and evidence references. | Used to review practical work, audit decisions and prove applied competency. Task score remains distinct from confirmed level. |
| Capability Analysis Data | Versioned position requirements, Confirmed Competency, Skill Gap state, recommendation inputs/results and OWNER course assignment/reason. | Used for organization-scoped competency and learning decisions. |
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
| RPT-01 | OWNER Dashboard | Organization-scoped learning, certificate, requirement and Skill Gap views. | OWNER | MVP |
| RPT-02 | Manager Dashboard | Assigned-department learning, practical task and Skill Gap views. | MANAGER | MVP |
| RPT-03 | Platform Administration Dashboard | Platform/reference-content administration status. | PLATFORM_ADMIN | MVP |
| RPT-04 | Employee Dashboard | Assigned courses, progress, certificates, tasks, recommendations and feedback. | Employee | MVP |
| RPT-05 | Certificate Registry | Valid and revoked certificates; no expiry tracking. | OWNER, MANAGER (scoped) | MVP |
| RPT-06 | Training Risk List | Out of Enterprise Capstone MVP. | N/A | Out of scope |
| RPT-07 | Competency Heatmap | Optional future view of competency gap by department, position and competency. | OWNER | Future |
| RPT-08 | Learning Improvement / ROI | Optional future analysis, dependent on separately approved scope and sufficient data. | OWNER | Future |
| RPT-09 | Career Readiness Report | Out of baseline; requires a separate scope decision. | N/A | Future |

## **12.1 Dashboard Design Principles**

* Dashboard should prioritize active requirements, learning actions, certificate status and competency evidence; no risk or expiry alerts.
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
| NFR-10 | Data Privacy | Authenticated internal verification must expose only necessary certificate data to OWNER/MANAGER in the issuing organization. | Must |
| NFR-11 | AI Evidence Privacy | If AI-assisted evaluation is approved, evidence processing must honor organization/department authorization, disclose only necessary evidence to the configured provider, validate AI output before display/storage and preserve a human review gate. | Must if approved |

# **14\. Assumptions, Constraints and Dependencies**

## **14.1 Assumptions**

* The project is implemented by a 5-member capstone team within limited time; therefore, scope must be controlled.  
* The organization data used for demo can be seeded as sample data rather than integrated from a real HRM system.  
* Skill Gap and automatic course recommendations use transparent rules; risk/readiness scoring is outside the MVP.
* AI-assisted Practical Task Evaluation is a new AI scope/effort expansion relative to Reports 1/2. Report 1/2 must be updated with scope and estimate before this is treated as an approved MVP commitment; this BRD does not claim implementation exists.
* Internal certificate verification uses a QR route and requires an authenticated OWNER/MANAGER from the issuing organization.

## **14.2 Constraints**

| ID | Constraint | Business Implication |
| :---- | :---- | :---- |
| CST-01 | Time and team capacity | The MVP must prioritize the end-to-end capability loop over advanced AI or large enterprise features. |
| CST-02 | Data availability | Real enterprise training data may not be available; demo data must be realistic and consistent. |
| CST-03 | AI reliability | LLM output may be inconsistent; all AI output must be reviewed or treated as suggestions. |
| CST-04 | Technical stack | The baseline names React/TypeScript, ASP.NET Core/C#, PostgreSQL, responsive UI, local/S3-compatible file storage and Docker Compose. Redis and SignalR are not required MVP dependencies; implementation must be verified separately. |
| CST-05 | Scope clarity | Full HRM, mobile app, blockchain, custom ML and full AI tutor are outside MVP. |

## **14.3 Dependencies**

* BRD approval before detailed SRS and database design.  
* Agreement on role names, permissions and department visibility rules.  
* Agreement on initial competency categories, levels and sample job positions.  
* Confirm assessment pass rules/course eligibility and resolve GRADE-01 before fixing grade representation.
* Update Report 1 scope and Report 2 effort/estimates before treating AI-assisted Practical Task Evaluation as an MVP commitment.
* Availability of file storage for lesson materials, task submissions and certificate PDFs.

# **15\. Risks and Mitigation Plan**

| Risk ID | Risk | Impact | Likelihood | Mitigation |
| :---- | :---- | :---- | :---- | :---- |
| RSK-01 | Scope creep from too many AI features | High | Medium | Keep AI Learning Assistant, semantic search and custom ML as future; implement rule-based scoring first. |
| RSK-02 | Team builds screens before business flow is clear | High | Medium | Approve BRD, Use Case List and main workflow before UI/API coding. |
| RSK-03 | RBAC becomes inconsistent across frontend/backend | High | Medium | Create RBAC matrix and enforce permission checks on backend APIs. |
| RSK-04 | Competency calculations are hard to explain | Medium | Medium | Document Skill Gap inputs and rules; no requirement weights are used. |
| RSK-05 | Database design becomes too complex | High | Medium | Start with core entities; use optional entities only after MVP loop works. |
| RSK-06 | WMS-lite becomes full project management tool | High | Low | Limit task module to training-related practical tasks and evidence only. |
| RSK-07 | Dashboard is visually nice but not business-useful | Medium | Medium | Design dashboard around scoped requirements, learning, certificate status and evidence. |
| RSK-08 | AI evaluation may misread evidence or rubric | Medium | Medium | Treat AI output as a proposal only; show cited evidence and unmet criteria; require OWNER/MANAGER review/edit/approval; preserve model/rubric versions and decision history; protect evidence access. |
| RSK-09 | Certificate verification exposes too much information | High | Low | Require same-organization OWNER/MANAGER login and return only certificate-safe data and status. |
| RSK-10 | Deployment issues near deadline | High | Medium | Prepare Docker Compose and deployment guide early; keep local demo fallback. |

# **16\. MVP Acceptance Criteria**

The MVP should be considered business-ready for capstone demonstration when the following acceptance criteria are satisfied.

| ID | Acceptance Criterion | Validation Method |
| :---- | :---- | :---- |
| AC-01 | Four roles can access only their allowed features and data scope. | Verify PLATFORM_ADMIN, OWNER, optional MANAGER and EMPLOYEE permissions. |
| AC-02 | OWNER can maintain organization structure, positions, members and manager assignments. | Organization sample data is maintained in scope. |
| AC-03 | PLATFORM_ADMIN manages TT02 framework; OWNER maintains versioned position requirements. | Three Training Levels are documented; GRADE-01 stays pending for grade representation. |
| AC-04 | PLATFORM_ADMIN manages standard course, lesson, question bank and assessment content linked to competencies. | Course-to-competency mapping works. |
| AC-05 | System automatically recommends mapped standard courses from Skill Gap and EMPLOYEE can start one; OWNER can also explicitly assign courses for organizational updates/retraining. | Recommendation and assignment coexist; progress and assessment result are recorded; OWNER can monitor progress in organization scope. |
| AC-06 | System calculates Skill Gap and automatic course recommendations from active requirements and Confirmed Competency. | Not Assessed, Met, Partial Gap and Gap are distinguishable; recommendations identify missing competencies and mapped courses. |
| AC-07 | A certificate is issued only for an eligible course after required lessons and a passed final assessment. | Internal QR requires same-organization OWNER/MANAGER login; status is Valid/Revoked with no expiry. |
| AC-08 | OWNER/MANAGER assigns task linked to target competencies and rubric; EMPLOYEE submits evidence. | AI may propose criterion-level scores/rationale/evidence/gaps if approved in Report 1/2; OWNER/MANAGER reviews/edits/approves or requests more evidence. Only a valid approved level-confirming review updates competency; task score is stored separately. |
| AC-13 | Evaluation history is auditable when AI assistance is used. | Rubric version, AI output/model version if available, reviewer decision and edit history are retained with access controls. |
| AC-09 | Late task submissions remain reviewable and may produce evidence. | Late state is recorded and visible to reviewer. |
| AC-10 | Dashboards expose scoped learning, certificate, requirement and evidence views. | Demonstrate the main Enterprise workflow without risk/readiness scores. |
| AC-11 | Certificate issuance/revocation and task evidence review/correction are auditable. | Demonstrate actor, time, reason and history. |
| AC-12 | Application can run with Docker Compose or documented local deployment steps. | Demo environment is reproducible. |

# **17\. Requirement Prioritization and Roadmap**

## **17.1 Recommended Delivery Phases**

| Phase | Name | Scope | Reason |
| :---- | :---- | :---- | :---- |
| Phase 1 | Foundation | Auth/RBAC, organization, employee, department, job position, basic layout. | Required before all business modules. |
| Phase 2 | Competency Core | Competency categories, levels, position requirements, employee competency profile. | Defines the core business data model. |
| Phase 3 | Learning & Assessment | Course, lesson, material, assignment, progress, question bank, assessment attempts. | Enables learning and score data. |
| Phase 4 | Competency Analysis & Learning Recommendation | Confirmed Competency, Skill Gap, automatic course recommendations and OWNER course assignments. | Depends on active requirement sets and reviewed evidence. |
| Phase 5 | Certificate & WMS-lite | Certificate QR, verification, practical task, submission, evaluation, evidence. | Completes the unique value proposition. |
| Phase 6 | Dashboards & Governance | PLATFORM_ADMIN/OWNER/MANAGER/EMPLOYEE views, audit logs and notifications. | Improves demo and governance. |
| Phase 7 | Scope Alignment & Extensions | Update Report 1/2 for AI-assisted Practical Task Evaluation, including effort, then decide its MVP commitment; AI content drafts and Individual workspace remain separately scoped. | AI evaluator is a scope/effort expansion until aligned; no implementation claim. |

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
| Competency Grade | Grade criteria described by Report 3 in the 1–6 range; representation remains PENDING DECISION GRADE-01. |
| Position Requirement | The required competencies and levels for a job position. |
| Employee Competency Profile | The employee's current competency status based on evidence and evaluation. |
| Skill Gap | Difference between required competency level and current competency level. |
| Learning Recommendation | Suggested course or learning path based on skill gap and course-competency mapping. |
| Learning Achievement | Course completion, assessment result or certificate; it does not itself confirm workplace competency. |
| Certificate Verification | Process of checking a certificate status using certificate code or QR URL. |
| WMS-lite | A lightweight training-related task workflow for post-training practical assignment and evidence collection. |
| Competency Evidence | Evidence reviewed against a target competency; only Passed, level-confirming evidence increases Confirmed Competency. |
| Human-in-the-loop | A design principle where AI suggestions require human review before official use. |
| MVP | Minimum Viable Product. The smallest coherent version that demonstrates the core business value. |

# **20\. Appendix: Demo Business Scenario**

This scenario should be used later for demo script, sample data, test cases and presentation storytelling.

## **20.1 Scenario: Marketing Department Digital Capability Improvement**

1\. OWNER creates Marketing Department and Marketing Executive job position.

2\. PLATFORM_ADMIN maintains TT02 reference data; OWNER activates a versioned requirement set for the position.

3\. PLATFORM_ADMIN maintains an eligible standard course named Data Analytics for Marketing, linked to Data Literacy.

4\. EMPLOYEE Nguyen Van A is assigned as Marketing Executive; the current confirmed grade is evaluated against the active requirement (grade representation remains subject to GRADE-01)\.

5\. System calculates the applicable Skill Gap from confirmed and required grade; if no active requirement or position exists, it shows Not Assessed.

6\. System recommends Data Analytics for Marketing because it maps to a competency gap; EMPLOYEE can start learning from the recommendation.

7\. If the organization updates course content or requires retraining, OWNER may also explicitly assign the course and monitor progress. The reassessment requirement for such assignments is PENDING DECISION.

8\. Employee learns lessons and completes final assessment with passing score.

9\. If the course is certificate-eligible, the system issues an internal certificate with unique code and QR; status is Valid/Revoked and there is no expiry.

10\. OWNER or assigned MANAGER assigns a practical task: create a campaign performance report using spreadsheet data.

11\. Employee submits the report file and explanation.

12\. If approved in Report 1/2 scope, AI analyzes the task evidence against the rubric and proposes per-criterion score, rationale, evidence references and gaps. OWNER/MANAGER reviews, edits, approves or requests additional evidence; late submissions remain eligible for review.

13\. Only a valid approved review marked level-confirming can update Confirmed Competency. The Practical Task score is stored separately from Competency Level, and rubric/model (if applicable)/AI/reviewer edit history is auditable.

14\. System stores the evidence review/history and recalculates Skill Gap.

15\. OWNER dashboard shows scoped learning, evidence and the updated Skill Gap.

## **20.2 Why This Scenario Is Strong for Defense**

* It demonstrates the difference between course completion and proven competency.  
* It uses all core modules in one coherent business flow.  
* It shows authenticated internal QR certificate verification and task evidence as value beyond a standard LMS.
* It allows the team to explain AI/rule-based scoring safely without claiming unrealistic machine learning.

# **Final BRD Conclusion**

DigiTalent AI should be delivered as a controlled Enterprise Capstone platform. The core loop is: position requirement \-\> confirmed competency/Skill Gap \-\> automatic course recommendation and optional OWNER course assignment \-\> learning/assessment \-\> eligible internal certificate \-\> practical task/evidence \-\> optional AI evaluation proposal with OWNER/MANAGER decision \-\> confirmed competency \-\> recalculated Skill Gap. The AI evaluator is a scope/effort expansion that requires Report 1/2 alignment; re-evaluation required after an OWNER-assigned update/retraining course remains PENDING DECISION. This BRD is a working baseline, not a statement that implementation is complete or mentor-approved.

Once this BRD is reviewed and accepted, the next recommended documents are SRS, Use Case Specification, ERD/Database Design, API Specification, RBAC Matrix and UI/UX Specification.
