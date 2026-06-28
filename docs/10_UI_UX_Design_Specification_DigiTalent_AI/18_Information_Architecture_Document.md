**DigiTalent AI**

**18. Information Architecture Document**

Enterprise Web Application Information Architecture — Sitemap, Navigation Structure, Content Organization, Labeling, Search and IA Principles

| | |
|---|---|
| **Project** | DigiTalent AI - Digital Competency Training, Internal Certification and Work-Based Assessment Platform |
| **Document Type** | Information Architecture Document |
| **Target Product** | Enterprise web application for HR, Managers, Trainers, Employees, Admins and Certificate Verifiers |
| **Primary Frontend Stack** | ReactJS, TypeScript, TailwindCSS, ShadCN/UI |
| **Version** | v1.0 |

---

# Table of Contents

1. [Purpose and Scope](#1-purpose-and-scope)
2. [IA Principles and Strategy](#2-ia-principles-and-strategy)
3. [User Roles and Mental Models](#3-user-roles-and-mental-models)
4. [Global Navigation Structure](#4-global-navigation-structure)
5. [Full Sitemap by Role](#5-full-sitemap-by-role)
6. [Navigation Hierarchy and Depth Analysis](#6-navigation-hierarchy-and-depth-analysis)
7. [Page Types and Content Templates](#7-page-types-and-content-templates)
8. [Labeling System](#8-labeling-system)
9. [Search Strategy](#9-search-strategy)
10. [Breadcrumb and Wayfinding](#10-breadcrumb-and-wayfinding)
11. [Cross-Linking and Related Content](#11-cross-linking-and-related-content)
12. [Content Organization Models by Module](#12-content-organization-models-by-module)
13. [State-Based Navigation Rules](#13-state-based-navigation-rules)
14. [Responsive IA and Breakpoints](#14-responsive-ia-and-breakpoints)
15. [IA Governance and Evolution](#15-ia-governance-and-evolution)

---

# 1. Purpose and Scope

## 1.1 Document Objectives

This Information Architecture (IA) document defines how DigiTalent AI organizes, labels and structures content so that users can find what they need and complete their tasks efficiently. It sits between the Use Case / User Flow documents and the detailed Screen Specification document.

| Objective | Description |
|---|---|
| Define navigation structure | Left sidebar menu, topbar, breadcrumb, landing pages and global actions for each role. |
| Organize content hierarchy | Ensure pages, sections and data are grouped logically and consistently across modules. |
| Establish labeling conventions | Standardize menu labels, page titles, section headings and action labels. |
| Plan cross-linking strategy | Connect related content: competency profiles from courses, evidence from certificates, tasks from dashboards. |
| Optimize findability | Reduce clicks to reach core tasks; make navigation predictable and role-aware. |

## 1.2 Scope

| In Scope | Out of Scope |
|---|---|
| Global navigation (sidebar, topbar, breadcrumb) | Visual UI design (colors, typography, spacing) — covered in UI/UX Spec |
| Role-based sitemap and route structure | Component-level interaction design — covered in Screen Spec |
| Page types and content templates | API data contracts — covered in API Specification |
| Labeling conventions and terminology | Database schema — covered in ERD |
| Cross-linking and navigation rules | Business logic and validation rules — covered in Use Case / BRD |
| Search strategy | |

## 1.3 Key IA Goals

1. **Three-click rule**: Users should reach any core task within three clicks from their dashboard.
2. **Role-first**: Every user sees only what their role allows; menus adapt automatically.
3. **Consistent patterns**: List → Detail → Action flows follow the same pattern across all modules.
4. **Progressive disclosure**: Advanced features are revealed only when needed, not crammed into first view.
5. **Context preservation**: Navigating between related items (e.g., employee → competency → course) keeps the user oriented.

---

# 2. IA Principles and Strategy

## 2.1 Core IA Principles

| Principle | Application |
|---|---|
| **Role-based filtering** | Each role sees a tailored menu. Users should never see actions they cannot perform. |
| **Task-oriented grouping** | Menu items are grouped by business task (e.g., "Learning Management"), not by technical module (e.g., "CRUD Course"). |
| **Consistent hierarchy** | All management modules follow a consistent pattern: List page → Detail page → Create/Edit form. |
| **Contextual navigation** | Detail pages expose related content through tabs and cross-links, not through separate disconnected pages. |
| **Search as navigation** | Global search provides an alternative to menu browsing for experienced users. |
| **Progressive disclosure** | Optional/bonus features (AI suggestions, advanced analytics) are accessible but not presented as primary navigation. |

## 2.2 Content Classification Scheme

DigiTalent AI content can be classified into four broad categories:

| Category | Description | Examples |
|---|---|---|
| **Master Data** | Core entities that other content depends on | Departments, Job Positions, Users, Competency Framework |
| **Learning Content** | Educational materials and assessment | Courses, Lessons, Materials, Question Banks, Assessments |
| **Evidence & Results** | Records of learning and work output | Certificates, Assessment Attempts, Task Submissions, Competency Evidence |
| **Analytics & Intelligence** | Calculated insights and dashboards | Skill Gap, Risk Scores, Readiness, Workforce Analytics |

---

# 3. User Roles and Mental Models

## 3.1 Role-Based Mental Models

Each role approaches the system with a distinct mental model. The IA must match these expectations.

| Role | Mental Model | Primary Question | IA Implication |
|---|---|---|---|
| **System Admin** | "I govern the system." | Who can access what? Is the system healthy? | Menu focuses on Users, Roles, Config, Audit Logs. |
| **HR / Training Manager** | "I plan and monitor workforce capability." | Which departments are weak? Who needs training? | Menu spans Organization, Competency, Courses, Certificates, Analytics. |
| **Department Manager** | "I manage my team's capability." | Is my team ready? Who is behind? | Menu scoped to Team, Tasks, Skill Gaps, Readiness. |
| **Internal Trainer** | "I create learning content." | Are my courses ready? Did learners pass? | Menu focuses on Courses, Lessons, Questions, Assessments, Learner Results. |
| **Employee** | "I learn and grow." | What do I need to do now? What have I achieved? | Menu centers on My Learning, My Assessments, My Certificates, My Tasks. |
| **Certificate Verifier** | "I verify a single certificate." | Is this certificate valid? | Minimal interface: one search/verify action. |

## 3.2 Cross-Role Viewing Rules

| Content Type | Admin | HR | Dept Manager | Trainer | Employee | Verifier |
|---|---|---|---|---|---|---|
| User accounts | CRUD | View | — | — | — | — |
| Departments | CRUD | CRUD | View own | — | — | — |
| Employees | CRUD | CRUD | View dept | — | View self | — |
| Competency Framework | View | CRUD | View | View | View | — |
| Courses | — | CRUD | View | CRUD | View assigned | — |
| Assessments | — | View | — | CRUD | Take assigned | — |
| Certificates | View | CRUD | View dept | View | View own | Verify |
| Tasks | — | View | CRUD dept | View | CRUD own | — |
| Dashboards | Admin | HR | Manager | Trainer | Employee | — |

---

# 4. Global Navigation Structure

## 4.1 Application Shell

```
┌─────────────────────────────────────────────────────────────┐
│ Topbar: Logo | Breadcrumb | Page Title | Search | Notif | Profile │
├──────────┬──────────────────────────────────────────────────┤
│ Sidebar  │  Content Area                                      │
│          │                                                    │
│ - Group 1│  ┌──────────────────────────────────────────────┐  │
│   ∙ Item │  │ Content Header: Title + Subtitle + Actions   │  │
│   ∙ Item │  ├──────────────────────────────────────────────┤  │
│ - Group 2│  │ Main Content:                                 │  │
│   ∙ Item │  │ Tables, Cards, Forms, Detail Panels          │  │
│   ∙ Item │  │                                              │  │
│ - Group 3│  │                                              │  │
│   ∙ Item │  └──────────────────────────────────────────────┘  │
└──────────┴──────────────────────────────────────────────────┘
```

## 4.2 Topbar Components

| Element | Purpose | Behavior |
|---|---|---|
| Logo | Brand + home link | Click navigates to role-based dashboard |
| Breadcrumb | Location context | Shows current page path; segments are clickable |
| Page Title | Current page name | Dynamic, set by route metadata |
| Global Search | Find employees, courses, certificates | Opens search overlay/modal; searches across indexed entities |
| Notification Bell | Unread notifications count | Dropdown list of recent notifications; click navigates to Notification Center |
| Profile Dropdown | Profile, settings, logout | Avatar + name; menu: My Profile, Change Password, Logout |

## 4.3 Sidebar Design Rules

| Rule | Description |
|---|---|
| Grouped by business domain | Menu items are organized under logical group headings (e.g., "Organization", "Learning", "Intelligence"). |
| Active item highlight | Current page or parent group is visually highlighted. |
| Collapsible groups | Groups can be expanded/collapsed; state persists per session. |
| Icons + labels | Each menu item has an icon and text label for quick scanning. |
| No empty groups | If a role has no items in a group, the group is hidden entirely. |
| Badge support | Optional count badges (e.g., pending tasks, unread notifications) on menu items. |

---

# 5. Full Sitemap by Role

## 5.1 System Admin

```
Dashboard
├── Admin Dashboard (landing)

Administration
├── User Management
│   ├── User List
│   ├── Create User
│   └── User Detail
│       ├── Profile Tab
│       ├── Roles Tab
│       └── Activity Tab
├── Role & Permission
│   ├── Role List
│   ├── Create Role
│   └── Role Detail
│       ├── Permissions Tab
│       └── Members Tab
├── System Configuration
│   └── Configuration Form (scoring weights, thresholds, system settings)
└── Audit Log
    ├── Audit Log List
    └── Audit Log Detail
```

## 5.2 HR / Training Manager

```
Dashboard
├── HR Dashboard (landing)

Organization
├── Departments
│   ├── Department List
│   ├── Create Department
│   └── Department Detail
├── Job Positions
│   ├── Position List
│   ├── Create Position
│   └── Position Detail
│       ├── Info Tab
│       ├── Requirements Tab
│       └── Employees Tab
└── Employees
    ├── Employee List
    ├── Create Employee
    └── Employee Detail
        ├── Overview Tab
        ├── Learning Tab
        ├── Competency Tab
        ├── Certificates Tab
        ├── Tasks Tab
        └── Evidence Tab

Competency Framework
├── Competency Categories
│   ├── Category List
│   └── Category Detail (with competencies)
├── Competency Management
│   ├── Competency List
│   └── Competency Detail
│       ├── Info Tab
│       ├── Levels Tab
│       └── Mappings Tab (courses, positions)
└── Position Requirement Mapping
    └── Position Requirement Matrix

Learning Management
├── Course Catalog
│   ├── Course List
│   ├── Create Course
│   └── Course Detail
│       ├── Overview Tab
│       ├── Modules/Lessons Tab
│       ├── Materials Tab
│       ├── Competencies Tab
│       └── Assignments Tab
├── Course Assignment
│   ├── Assign Course Wizard
│   └── Assignment History
└── Learner Results
    └── Results Overview

Certificates
├── Certificate Tracking
│   ├── Certificate List
│   └── Certificate Detail
└── Issue Certificate

Intelligence
├── Skill Gap Analysis
├── Training Risk
├── Workforce Readiness
└── Analytics & Reports
    ├── Competency Heatmap
    └── Export Center

Settings
└── Notification Templates (optional)
```

## 5.3 Department Manager

```
Dashboard
├── Manager Dashboard (landing)

Team
├── Team Employees
│   └── Employee Detail (scoped to department)
├── Skill Gaps (department view)
└── Team Readiness

Practical Tasks
├── Task Board (Kanban / List)
├── Create Task
├── Task Detail
│   ├── Info Tab
│   ├── Submissions Tab
│   └── Evaluation Tab
└── Task Evaluation

Learning
├── Team Learning Progress
└── Course Assignment (department scoped)

Certificates
└── Team Certificates (view only)
```

## 5.4 Internal Trainer

```
Dashboard
├── Trainer Dashboard (landing)

Courses
├── My Courses
│   ├── Course List
│   ├── Create Course
│   └── Course Builder
│       ├── Overview Tab
│       ├── Modules/Lessons Tab
│       ├── Materials Tab
│       ├── Competencies Tab
│       ├── Completion Rules Tab
│       └── Preview Tab
├── Lesson Editor
└── Material Upload

Assessment
├── Question Bank
│   ├── Question List
│   ├── Create Question
│   ├── Import Questions
│   └── AI Draft Review
├── Assessment Builder
│   ├── Assessment List
│   ├── Create Assessment
│   └── Assessment Detail
│       ├── Info Tab
│       ├── Questions Tab
│       └── Attempts Tab
└── Learner Results
    ├── Results Overview
    └── Attempt Detail

Intelligence
└── AI Draft Review (question suggestions)
```

## 5.5 Employee

```
Dashboard
├── My Dashboard (landing)

My Learning
├── My Courses
│   ├── Course List (assigned/enrolled)
│   └── Course Detail
│       └── Lesson Viewer
├── Lesson Viewer (embedded content player)
│   └── Material Download
└── Learning Progress

My Assessments
├── Assessment List (pending/completed)
├── Assessment Attempt (quiz interface)
└── Assessment Result

My Certificates
├── Certificate List
└── Certificate Detail (with QR)

My Tasks
├── Task List
├── Task Detail
└── Task Submission

My Competency Profile
├── Competency Summary
├── Evidence Portfolio
└── Skill Gap (self view)

Notifications
└── Notification Center
```

## 5.6 Certificate Verifier

```
Verify Certificate
├── Verification Input (code / QR scan)
└── Verification Result
    └── Status Card

Optional:
Verification History (recent verifications)
```

---

# 6. Navigation Hierarchy and Depth Analysis

## 6.1 Depth Limits

| Level | Description | Example |
|---|---|---|
| L0 | Dashboard/Landing | Manager Dashboard |
| L1 | Module List | My Courses, Employee List |
| L2 | Detail Page | Employee Detail, Course Detail |
| L3 | Tab Section | Course Detail → Competencies Tab |
| L4 | Nested Action | Course Detail → Competencies → Edit Mapping |

**Rule**: Core tasks must not exceed L3. Deeply nested configuration (L4+) should use modals or side sheets instead of stacking pages.

## 6.2 Click Depth by Core Task

| Task | Role | Path | Depth |
|---|---|---|---|
| View employee competency | HR | Dashboard → Employees → Employee Detail → Competency Tab | 3 clicks |
| Assign course to employee | HR | Dashboard → Course Assignment → Select Course → Select Employees → Confirm | 4 clicks (wizard) |
| Take an assessment | Employee | Dashboard → My Assessments → Select Assessment → Start | 3 clicks |
| Evaluate a task | Manager | Dashboard → Task Board → Task Detail → Evaluate | 3 clicks |
| Verify a certificate | Verifier | Landing → Enter Code → View Result | 2 clicks |
| View skill gap | HR | Dashboard → Skill Gap Analysis → Select Position/Employee | 2 clicks |

## 6.3 Sidebar Group Collapse Defaults

| Role | Groups Expanded by Default | Groups Collapsed by Default |
|---|---|---|
| System Admin | Dashboard, Administration | — |
| HR Manager | Dashboard, Organization, Competency Framework, Learning Management | Certificates, Intelligence, Settings |
| Department Manager | Dashboard, Team, Practical Tasks | Learning, Certificates |
| Trainer | Dashboard, Courses, Assessment | Intelligence |
| Employee | Dashboard, My Learning, My Assessments | My Certificates, My Tasks, My Competency Profile |
| Verifier | Verify Certificate (only group) | — |

---

# 7. Page Types and Content Templates

DigiTalent AI uses a set of reusable page templates. Every screen must map to one of these templates.

## 7.1 Page Type Catalog

| Page Type | Purpose | Layout Pattern | Examples |
|---|---|---|---|
| **Dashboard** | Role landing page with KPI cards and summaries | Grid of cards, widgets, charts | HR Dashboard, Manager Dashboard, Employee Dashboard |
| **List Page** | Browse/search/filter a collection of entities | Toolbar (search + filters) + Data Table + Pagination | Employee List, Course List, Certificate List |
| **Detail Page** | View full information about one entity | Tabs: Info, Related entities, Activity | Employee Detail, Course Detail, Certificate Detail |
| **Create/Edit Form** | Create or update an entity | Single or multi-section form with save/cancel | Create Course, Edit Employee, Create Assessment |
| **Wizard** | Multi-step guided process | Step indicator + form per step + navigation | Course Assignment Wizard, Course Builder |
| **Content Viewer** | Read/consume content | Sidebar index + main content area | Lesson Viewer |
| **Interactive Tool** | User performs a complex action | Tool-specific layout | Assessment Attempt (quiz), Task Board (Kanban) |
| **Verification Page** | Quick lookup and status display | Search input + prominent result card | Certificate Verification |
| **Settings Page** | Configure system parameters | Grouped sections or single form | System Configuration, My Profile |

## 7.2 List Page Template

```
┌──────────────────────────────────────────────────────┐
│ Page Header                                          │
│ Title: Employee Management              [Create] [+] │
│ Subtitle: View and manage all employees               │
├──────────────────────────────────────────────────────┤
│ Toolbar                                              │
│ [Search...                ] [Department ▼] [Status ▼] │
├──────────────────────────────────────────────────────┤
│ Data Table                                           │
│ ┌─────┬──────────┬──────────┬──────────┬─────────┐  │
│ │ #   │ Name     │ Dept     │ Position │ Status  │  │
│ ├─────┼──────────┼──────────┼──────────┼─────────┤  │
│ │ 1   │ John Doe │ IT       │ Dev      │ Active  │  │
│ │ 2   │ Jane Roe │ HR       │ Manager  │ Active  │  │
│ └─────┴──────────┴──────────┴──────────┴─────────┘  │
│                                             1-10/50  │
├──────────────────────────────────────────────────────┤
│ Empty State (when no data)                           │
│ [Icon] No employees yet.                             │
│ Create the first employee to get started.            │
│                                           [Create]   │
└──────────────────────────────────────────────────────┘
```

## 7.3 Detail Page Template (Tabbed)

```
┌──────────────────────────────────────────────────────┐
│ Page Header                                          │
│ ← Back to Employees                                  │
│ Employee: John Doe                     [Edit] [...]  │
│ Subtitle: IT Department · Software Engineer · Active │
├──────────────────────────────────────────────────────┤
│ Tabs: [Overview] [Learning] [Competency] [Certs] [Tasks] [Evidence] │
├──────────────────────────────────────────────────────┤
│ Tab Content Area                                     │
│ ┌──────────────────────────────────────────────────┐ │
│ │ Detail Card / Panel                              │ │
│ │                                                  │ │
│ │ Field: Value                                     │ │
│ │ Field: Value                                     │ │
│ └──────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────┐ │
│ │ Related List (table or cards)                    │ │
│ │                                                  │ │
│ └──────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

---

# 8. Labeling System

## 8.1 Menu Label Conventions

| Convention | Rule | Good | Bad |
|---|---|---|---|
| Noun-based | Menu items are nouns, not verbs | "Employees", "Courses" | "Manage Employees", "View Courses" |
| Short | Max 3 words, preferably 1-2 | "Competency Framework" | "Competency Framework and Position Requirements Management" |
| Consistent capitalisation | Title Case for all menu items | "Skill Gap Analysis" | "Skill gap analysis" |
| Familiar terms | Use business language, not technical | "Job Positions" | "Positions Master Table" |

## 8.2 Action Label Conventions

| Action | Label | Notes |
|---|---|---|
| Create | Create [Entity] | "Create Course", "Add Employee" |
| Edit | Edit | Consistent across all modules |
| View | View Details | Row action in tables |
| Delete | Archive / Deactivate | Prefer soft delete language |
| Publish | Publish | For course/assessment status change |
| Save | Save Changes | For form submission |
| Cancel | Cancel | Discard changes |
| Search | [Placeholder] | "Search by name, email..." |

## 8.3 Status Labels

| Domain | Statuses |
|---|---|
| User | Active, Inactive |
| Employee | Active, Archived |
| Course | Draft, Published, Archived |
| Enrollment | Assigned, In Progress, Completed, Overdue, Cancelled |
| Assessment Attempt | Not Started, In Progress, Submitted, Passed, Failed |
| Certificate | Valid, Expired, Revoked, Pending Renewal |
| Task | Draft, Assigned, In Progress, Submitted, Under Review, Approved, Rejected, Overdue |
| Risk | Low, Medium, High, Critical |
| Readiness | Not Ready, Developing, Nearly Ready, Ready |

---

# 9. Search Strategy

## 9.1 Global Search Scope

The global search bar in the topbar searches across the following entities:

| Entity | Searchable Fields | Result Action |
|---|---|---|
| Employees | Name, Employee Code, Email | Navigate to Employee Detail |
| Courses | Title, Code | Navigate to Course Detail |
| Certificates | Certificate Code, Employee Name | Navigate to Certificate Detail |
| Competencies | Name, Code | Navigate to Competency Detail |
| Departments | Name, Code | Navigate to Department Detail |
| Job Positions | Title, Code | Navigate to Position Detail |

## 9.2 Search Behavior

| Feature | Behavior |
|---|---|
| Trigger | Click search icon or press Ctrl+K |
| Minimum characters | 2 characters before results appear |
| Result groups | Results grouped by entity type |
| Max results | 5 per entity, 20 total per search |
| Empty state | "No results found for [query]" with suggestions |
| Keyboard navigation | Arrow keys to select, Enter to navigate |
| Dismiss | ESC or click outside |

## 9.3 Per-Page Search

Each List Page has its own search input in the toolbar, scoped to that entity type. Per-page search is the primary find mechanism; global search is a shortcut.

---

# 10. Breadcrumb and Wayfinding

## 10.1 Breadcrumb Pattern

Breadcrumbs follow a hierarchical pattern: Home > Module > Submodule > Current Page

```
Home > Organization > Employees > John Doe
Home > Learning > Courses > React Basics > Edit
Home > Certificates > CBC-2026-001
```

## 10.2 Breadcrumb Rules

| Rule | Description |
|---|---|
| Always visible | Breadcrumb appears on all pages except modals/sheets |
| Clickable segments | Each segment is a link except the current (last) segment |
| Home = Dashboard | "Home" links to the user's role-based dashboard |
| Dynamic resolution | Breadcrumb segments are derived from route metadata, not hard-coded |
| Truncation | On narrow screens, collapse intermediate segments with "..." |

## 10.3 Wayfinding Aids

| Aid | Implementation |
|---|---|
| Page title | Matches menu label for consistency |
| Active sidebar item | Current page's parent menu item is highlighted |
| Tab highlight | Active tab in detail pages is visually distinct |
| Section headers | Within long pages, sticky section headers show current position |
| Back navigation | "← Back to [Parent List]" link at top of detail pages |

---

# 11. Cross-Linking and Related Content

## 11.1 Cross-Link Matrix

| From Page | Linked To | Context |
|---|---|---|
| Employee Detail → Competency Tab | Competency Detail | View competency definition and criteria |
| Employee Detail → Learning Tab | Course Detail | View course content the employee is taking |
| Employee Detail → Certificates Tab | Certificate Detail | View certificate details and QR |
| Employee Detail → Tasks Tab | Task Detail | View specific task submission/status |
| Course Detail → Competencies Tab | Competency Detail | View mapped competency definition |
| Course Detail → Assignments Tab | Employee Detail | View assigned employee profile |
| Certificate Detail | Employee Detail | View certificate holder profile |
| Task Detail | Employee Detail | View assignee profile |
| Task Detail | Competency Detail | View competency being evaluated |
| Risk/Readiness cards | Employee Detail | Drill down to employee who needs attention |
| Skill Gap result | Course Detail | View recommended course for gap |

## 11.2 Cross-Link Visualization Rules

| Rule | Implementation |
|---|---|
| Links appear as blue text | Consistent with link button style |
| Open in same tab | Navigation replaces current page; use browser Back to return |
| External references | Open in new tab only for truly external links (e.g., uploaded material) |
| Context chips | Show parent context next to link: "View Course (React Basics)" |

---

# 12. Content Organization Models by Module

## 12.1 Organization Module

```
Departments
├── List (table: name, code, manager, status, employee count)
├── Create/Edit Form
└── Detail
    ├── Info (metadata)
    ├── Employees (related list)
    └── Positions (related list)

Job Positions
├── List (table: title, code, department, status, requirement count)
├── Create/Edit Form
└── Detail
    ├── Info
    ├── Requirements (competency mapping table)
    └── Employees (employees in this position)

Employees
├── List (table: name, code, department, position, status, manager)
├── Create/Edit Form
└── Detail (tabbed — see section 7.3)
```

## 12.2 Competency Module

```
Competency Framework
├── Categories (left panel tree or list)
├── Competencies (right panel table, filtered by category)
│   ├── Competency Detail (tabbed: Info, Levels, Mappings)
│   └── Level Editor
└── Position Requirement Mapping (matrix view)
```

## 12.3 Learning Module

```
Courses
├── List (table/cards: title, code, status, competencies, owner, updated)
├── Create/Edit Form
└── Detail (tabbed: Overview, Modules/Lessons, Materials, Competencies, Completion, Assignments)

Course Builder
├── Wizard/step-by-step: Info → Modules → Lessons → Materials → Competencies → Review
└── Lesson Editor (rich text editor + material attachments)

Course Assignment
├── Step 1: Select Course
├── Step 2: Select Target (employees/department/position)
├── Step 3: Set Deadline & Notes
└── Step 4: Review & Confirm
```

## 12.4 Assessment Module

```
Question Bank
├── List (table: question, type, difficulty, competency, status)
├── Create/Edit Form (question text, options, answer, explanation)
└── AI Draft Review (list of AI-generated questions pending review)

Assessments
├── List (table: title, course, pass score, attempts, status)
├── Create/Edit Form (metadata + question selection)
└── Detail (tabbed: Info, Questions, Attempts)

Assessment Attempt (Employee)
├── Start screen (instructions, time limit, attempt count)
├── Quiz interface (question navigation, timer, save/progress)
└── Result screen (score, pass/fail, answers review)
```

## 12.5 Certificate Module

```
Certificates
├── List (table: code, employee, course, status, issue date, expiry)
├── Issue Certificate (select employee + course → generate)
└── Detail (info card, QR code, status history, verification link)

Verification (Verifier)
├── Input (text field for code, QR scanner placeholder)
└── Result (dominant status card + minimal metadata)
```

## 12.6 Task Module

```
Practical Tasks
├── Task Board (Kanban columns by status OR list with filters)
├── Create Task Form
└── Task Detail
    ├── Info (description, criteria, deadline, assignee)
    ├── Submission (employee: upload evidence, notes)
    └── Evaluation (manager: score, feedback, competency impact)
```

## 12.7 Intelligence Module

```
Skill Gap Analysis
├── Input selection (employee or position)
├── Result table (competency: required vs current, gap, recommendation)
└── Explanation drawer (factor breakdown)

Training Risk
├── Risk list (employees sorted by risk level)
├── Detailed view (risk factors, progress, scores, deadlines)
└── Action drawer (assign course, notify)

Workforce Readiness
├── Readiness distribution (by department/position)
├── Employee readiness list (score + level label)
└── Explanation drawer (competency breakdown)
```

---

# 13. State-Based Navigation Rules

## 13.1 Entity State → Available Actions

| Entity | State | Available Navigation/Actions |
|---|---|---|
| Course | Draft | Edit, Preview, Publish, Delete Draft |
| Course | Published | View, Assign, Archive, Create New Version |
| Course | Archived | View (read-only), Restore |
| Enrollment | Assigned | Start Course |
| Enrollment | In Progress | Continue Course |
| Enrollment | Completed | View Certificate (if issued) |
| Enrollment | Overdue | Continue Course (if allowed), Contact Manager |
| Certificate | Valid | View, Download PDF, Verify QR |
| Certificate | Expired | View (read-only), Request Renewal |
| Certificate | Revoked | View (read-only with reason) |
| Task | Assigned | Start Task |
| Task | Submitted | View (awaiting evaluation) |
| Task | Under Review | View (cannot edit) |
| Task | Approved/Rejected | View Feedback |

## 13.2 Empty State Navigation

| Page | Empty State | Suggested Action |
|---|---|---|
| Employee List | "No employees yet." | Create Employee |
| Course List (Trainer) | "You haven't created any courses." | Create Course |
| My Learning (Employee) | "No learning assignments yet." | (none — notify manager) |
| Task Board | "No tasks assigned." | Create Task (manager) |
| Certificate List | "No certificates issued." | Issue Certificate |
| Question Bank | "No questions yet." | Create Question or Import |
| Assessment List | "No assessments created." | Create Assessment |

## 13.3 Error / Forbidden Navigation

| Condition | Navigation Behavior |
|---|---|
| 403 Forbidden | Redirect to Dashboard with toast notification |
| 404 Not Found | Show "Page not found" with link back to parent list |
| 500 Server Error | Show error page with retry button and "Contact support" message |
| Network offline | Show offline banner; disable write operations; read cached data if available |

---

# 14. Responsive IA and Breakpoints

## 14.1 Breakpoint Strategy

| Breakpoint | Width | Sidebar | Content |
|---|---|---|---|
| Desktop | ≥1280px | Expanded sidebar, 240px | Full content area |
| Small Desktop | 1024-1279px | Icons-only sidebar, 64px | Full content area |
| Tablet | 768-1023px | Collapsed to hamburger menu | Full width, single column |
| Mobile | <768px | Hidden, overlay drawer | Full width, single column, stacked cards |

## 14.2 Responsive Adaptations

| Component | Desktop | Tablet | Mobile |
|---|---|---|---|
| Sidebar | Always visible | Collapsible hamburger | Overlay drawer |
| Topbar | Full (search, notif, profile) | Search icon-only, rest visible | Hamburger + title + notif |
| Data Table | Full columns | Key columns only | Card list or horizontal scroll |
| Detail Tabs | Horizontal tabs | Horizontal tabs | Dropdown/accordion |
| Breadcrumb | Full path | Show last 2 segments | Hide, use Back |
| Page Header | Title + actions | Title stacked | Title stacked, actions in menu |

---

# 15. IA Governance and Evolution

## 15.1 Rules for Adding New Pages

1. **Map to page type**: Every new page must fit one of the defined page templates.
2. **Assign to role(s)**: Specify which roles can access the page.
3. **Determine depth**: The page should not exceed L3 depth without strong justification.
4. **Add to sitemap**: Update this document and the role-based sitemap.
5. **Update navigation**: Add to sidebar under appropriate group; update route configuration.
6. **Add cross-links**: Identify which existing pages should link to the new page.

## 15.2 Rules for Deprecating Pages

1. **Check cross-links**: Ensure no remaining pages reference the deprecated page.
2. **Redirect**: Set up route redirect from old path to replacement.
3. **Remove from sitemap**: Update this document.
4. **Remove from navigation**: Update sidebar configuration.
5. **Communicate**: Notify team about the change.

## 15.3 IA Review Triggers

| Trigger | Action |
|---|---|
| New module added | Review sitemap, navigation depth, cross-links |
| User feedback: "I can't find X" | Review labeling and placement of X |
| Analytics show deep navigation paths | Simplify path or add direct shortcut |
| Role definition changes | Update role-based sitemap and menu configuration |
| Before major release | Full IA audit against this document |

---

**Document Version**: v1.0
**Last Updated**: 2026-06-26
**Prepared for**: DigiTalent AI Frontend Implementation
**Related Documents**: UI/UX Design Specification, Screen Specification Document, Use Case Specification, User Flow Document
