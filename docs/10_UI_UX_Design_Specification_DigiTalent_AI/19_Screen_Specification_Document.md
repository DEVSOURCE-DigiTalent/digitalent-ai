**DigiTalent AI**

**19. Screen Specification Document**

Enterprise Web Application Screen Specifications — Detailed Layout, Fields, Actions, States and Data Mapping for Every Screen

| | |
|---|---|
| **Project** | DigiTalent AI - Digital Competency Training, Internal Certification and Work-Based Assessment Platform |
| **Document Type** | Screen Specification Document |
| **Target Product** | Enterprise web application for HR, Managers, Trainers, Employees, Admins and Certificate Verifiers |
| **Primary Frontend Stack** | ReactJS, TypeScript, TailwindCSS, ShadCN/UI |
| **Version** | v1.0 |

---

# Table of Contents

1. [Purpose and Scope](#1-purpose-and-scope)
2. [How to Read Screen Specs](#2-how-to-read-screen-specs)
3. [Shared Component Specifications](#3-shared-component-specifications)
4. [Authentication Screens (AUTH)](#4-authentication-screens-auth)
5. [Dashboard Screens (DASH)](#5-dashboard-screens-dash)
6. [Admin Screens (ADMIN)](#6-admin-screens-admin)
7. [Organization Screens (ORG)](#7-organization-screens-org)
8. [Competency Screens (COMP)](#8-competency-screens-comp)
9. [Course & Learning Screens (COURSE / LEARN)](#9-course--learning-screens-course--learn)
10. [Assessment Screens (ASSESS)](#10-assessment-screens-assess)
11. [Certificate Screens (CERT)](#11-certificate-screens-cert)
12. [Task Screens (TASK)](#12-task-screens-task)
13. [Intelligence Screens (INTEL)](#13-intelligence-screens-intel)
14. [Notification Screens (NOTI)](#14-notification-screens-noti)
15. [Evidence Screens (EVID)](#15-evidence-screens-evid)
16. [Audit Screens (AUDIT)](#16-audit-screens-audit)
17. [Settings Screens (SETTING)](#17-settings-screens-setting)
18. [Error & Empty State Screens](#18-error--empty-state-screens)
19. [Appendix: Screen-ID to Route Mapping](#19-appendix-screen-id-to-route-mapping)

---

# 1. Purpose and Scope

## 1.1 Document Objectives

This Screen Specification Document provides a detailed, implementation-ready specification for every screen in DigiTalent AI. Each screen spec defines the page layout, UI fields, buttons/actions, data requirements, validation rules, permission checks, loading states and edge cases.

| Objective | Description |
|---|---|
| Bridge design and code | Convert the UI/UX visual guidelines into precise specs that frontend developers can implement directly. |
| Define field-level detail | Every input field, table column, button and state is specified with labels, data types and validation. |
| Map to backend API | Each screen references the API endpoints it consumes. |
| Cover all states | Loading, empty, error, success and edge case states are documented for every screen. |
| Ensure role consistency | Each screen specifies which roles can access it and what data scope applies. |

## 1.2 Relationship to Other Documents

```
Use Case Spec  ──>  User Flow Doc  ──>  IA Document  ──>  Screen Spec  ──>  Frontend Code
                                                               │
                                                    UI/UX Design Spec  ──┘
```

---

# 2. How to Read Screen Specs

Each screen specification follows a standard template:

```
SCREEN-ID Screen Name
├── Goal                 : What the user accomplishes on this screen
├── Route                : URL path
├── Roles                : Which roles can access
├── Page Type            : List, Detail, Form, Wizard, Dashboard, etc.
├── Main Layout          : Visual structure description
├── Data Requirements    : API endpoints and data needed
├── UI Sections          : Ordered list of sections on the page
│   ├── Fields / Columns : Each input field, display field or table column
│   └── Actions          : Buttons, links and interactive elements
├── States
│   ├── Loading          : What the user sees during data fetch
│   ├── Empty            : What the user sees when no data exists
│   ├── Error            : What the user sees on API failure
│   └── Edge Cases       : Special conditions
├── Validation           : Field-level and form-level validation rules
├── Permission Checks    : Role and scope authorization rules
└── Related Screens      : Navigation targets from this screen
```

---

# 3. Shared Component Specifications

These components are reused across multiple screens. Their behavior is defined here once.

## 3.1 PageHeader

| Field | Specification |
|---|---|
| Content | Back link (optional), page title, subtitle, breadcrumb |
| Primary Action | One main CTA button on the right |
| Secondary Actions | Dropdown or ghost buttons for additional actions |
| Behavior | Title reflects current page; subtitle provides context (e.g., record count, department name) |
| States | Default; Title-only (no subtitle for simple pages) |
| Edge Cases | Very long titles truncate with ellipsis on narrow screens |

## 3.2 DataTable

| Field | Specification |
|---|---|
| Content | Column headers, sortable rows, row selection checkboxes (optional) |
| Toolbar | Search input (left), filters (middle), action buttons (right) |
| Pagination | Page size selector (10/20/50), page navigation, total count |
| Sorting | Click column header to sort asc/desc; active sort indicator |
| Row Actions | Menu icon on each row: View, Edit, Archive/Activate, Delete options |
| States | Loading skeleton; Empty with illustration and message; Filtered-empty with "Clear filters" button; Error with retry |
| Edge Cases | Very long text truncated with tooltip; No data after filter with clear action |

## 3.3 StatusBadge

| Field | Specification |
|---|---|
| Content | Status label with semantic color dot/background |
| Colors | Green=success; Amber=warning; Red=danger; Blue=info/published; Gray=draft/inactive; Purple=AI draft |
| Behavior | Always shows text label (not color-only); clickable only if it navigates to status filter |
| States | Default; With icon option for high-importance statuses |

## 3.4 ConfirmActionDialog

| Field | Specification |
|---|---|
| Content | Title, description/impact message, optional reason textarea |
| Buttons | Cancel (secondary), Confirm (primary/danger depending on action) |
| Behavior | Traps focus; prevents background interaction; ESC to cancel |
| States | Default; Loading (during API call); Error (if API fails, stays open with error message) |
| Edge Cases | Reason required for destructive actions (Revoke, Archive, Delete); Confirm button disabled until reason provided |

## 3.5 EmptyState

| Field | Specification |
|---|---|
| Content | Illustration/icon, title, description, optional CTA button |
| Variants | No data (first use), Filtered-empty (no results match), Permission-empty (no access to any records) |
| Behavior | Primary CTA when user can create; informational message when only admin can create |

## 3.6 ScoreExplanationDrawer

| Field | Specification |
|---|---|
| Content | Slide-in panel from right with factor breakdown, data sources, weight contributions |
| Sections | Overall score, factor list (name, weight, score, contribution), evidence links |
| Buttons | Close, View Evidence, View Details |
| States | Loading skeleton; Data available; Missing data warning |
| Edge Cases | AI explanation unavailable fallback with rule-based explanation |

---

# 4. Authentication Screens (AUTH)

## AUTH-01 Login Page

| Field | Specification |
|---|---|
| **Goal** | All users authenticate securely and are redirected to their role-based dashboard |
| **Route** | `/login` (public) |
| **Roles** | Unauthenticated users only (redirect to dashboard if already logged in) |
| **Page Type** | Form - Centered Card |
| **Main Layout** | Centered card on neutral background; app logo at top; email input; password input with show/hide toggle; "Remember me" checkbox; "Sign In" primary button; "Forgot Password?" link; footer with app version |
| **API** | `POST /api/auth/login` |

| **UI Sections** | Content |
|---|---|
| Logo Area | App logo (SVG), app name "DigiTalent AI" |
| Form Fields | Email (text input, type=email, placeholder "Enter your email"), Password (password input with show/hide icon), Remember Me (checkbox, default unchecked) |
| Actions | Sign In (primary button, full width), Forgot Password? (link, navigates to reset flow) |
| Footer | App version, copyright |

| **States** | Specification |
|---|---|
| Loading | Button shows spinner; inputs disabled; "Signing in..." text |
| Error - Invalid Credentials | "Invalid email or password" inline error above form; inputs remain filled |
| Error - Inactive Account | "Your account has been deactivated. Please contact your administrator." |
| Error - Network | "Unable to connect. Please check your internet connection and try again." |
| Already Authenticated | Redirect to role-based dashboard immediately |

| **Validation** | Rule |
|---|---|
| Email | Required; valid email format (regex) |
| Password | Required; min 6 characters |
| Rate Limiting | Show "Too many attempts. Please try again in X minutes." after 5 failed attempts |

| **Related Screens** | AUTH-02 My Profile, DASH-01/02/03/04 Dashboard |

---

## AUTH-02 My Profile

| Field | Specification |
|---|---|
| **Goal** | User reviews personal information and updates password |
| **Route** | `/my-profile` |
| **Roles** | All authenticated users |
| **Page Type** | Detail + Form (Tabbed) |
| **Main Layout** | Profile card with avatar and name at top; two tabs: "Profile" and "Change Password" |
| **API** | `GET /api/me`, `PUT /api/me/profile`, `PUT /api/me/change-password` |

| **UI Sections** | Content |
|---|---|
| Profile Card | Avatar (initials fallback), Full Name, Email, Role badges, Department if applicable |
| Profile Tab | First Name (text), Last Name (text), Email (read-only if managed by admin), Phone (text, optional), Timezone (select) |
| Change Password Tab | Current Password (password), New Password (password with strength indicator), Confirm New Password (password) |
| Actions | Save Changes (primary), Cancel (secondary); For password tab: Change Password (primary) |

| **States** | Specification |
|---|---|
| Loading | Skeleton for profile card and form fields |
| Success | Toast "Profile updated successfully" or "Password changed successfully" |
| Error - Password Complexity | "Password must contain at least 8 characters, one uppercase letter, one number" |
| Error - Wrong Current Password | "Current password is incorrect" |

| **Validation** | Rule |
|---|---|
| Name fields | Required; max 100 characters |
| New Password | Min 8 chars; must include uppercase, lowercase, number; optional special char |
| Confirm Password | Must match New Password |

| **Permission** | All authenticated users can access own profile only |

| **Related Screens** | AUTH-01 Login, respective Dashboard |

---

# 5. Dashboard Screens (DASH)

## DASH-01 Admin Dashboard

| Field | Specification |
|---|---|
| **Goal** | System Admin monitors system health, user activity and configuration status |
| **Route** | `/admin/dashboard` |
| **Roles** | System Admin |
| **Page Type** | Dashboard |
| **Main Layout** | KPI cards row: Total Users, Active Users, Roles, Departments; Charts section: User registrations over time, Login activity; Recent audit log widget; System status card |
| **API** | `GET /api/admin/dashboard/summary`, `GET /api/admin/dashboard/activity` |

| **KPI Cards** | Specification |
|---|---|
| Total Users | Count, trend indicator (up/down from last month) |
| Active Users (30d) | Count of users who logged in within 30 days |
| Roles & Permissions | Count of roles |
| Departments | Count of active departments |

| **Widgets** | Specification |
|---|---|
| Recent Activity | Last 10 audit log entries: timestamp, actor, action, target |
| System Status | Database connection, storage service, background job status (green/amber/red) |

| **States** | Specification |
|---|---|
| Loading | Skeleton cards (4 cards per row, chart placeholder) |
| Empty | First-time setup: "Welcome to DigiTalent AI. Start by creating users and departments." |
| Error | Dashboard-level alert: "Unable to load dashboard data" with Retry button |

| **Related Screens** | ADMIN-01, ADMIN-02, ADMIN-03, AUDIT-01 |

---

## DASH-02 HR Dashboard

| Field | Specification |
|---|---|
| **Goal** | HR monitors workforce capability across departments |
| **Route** | `/hr/dashboard` |
| **Roles** | HR / Training Manager |
| **Page Type** | Dashboard |
| **Main Layout** | KPI cards: Total Employees, Active Courses, Certificates Issued, High Risk Employees; Competency Heatmap (department vs competency matrix); Risk List (top 5 high-risk employees with score); Readiness Distribution (pie/bar chart by readiness level); Certificate Expiry (next 30 days) |
| **API** | `GET /api/hr/dashboard/summary`, `GET /api/hr/dashboard/heatmap`, `GET /api/hr/dashboard/risk-summary` |

| **Actions** | Specification |
|---|---|
| Export Report | Download dashboard data as CSV/PDF |
| View Risk Employees | Navigate to risk list filtered view |
| Filter Controls | Department dropdown, Date range selector (default: current month) |

| **States** | Specification |
|---|---|
| Loading | Skeleton layout matching card grid |
| Empty | No data state: "Upload employee data and create courses to see workforce analytics" |
| Warning | "Some data may be outdated. Last calculated: [timestamp]" banner when scores are stale |

| **Related Screens** | ORG-03, INTEL-01, INTEL-02, INTEL-03, CERT-01 |

---

## DASH-03 Manager Dashboard

| Field | Specification |
|---|---|
| **Goal** | Department Manager monitors team progress, risk and readiness |
| **Route** | `/manager/dashboard` |
| **Roles** | Department Manager |
| **Page Type** | Dashboard |
| **Main Layout** | Team summary card: employee count, active tasks, pending evaluations; Skill Gap overview (top competencies where team is weakest); Risk employees list (department-scoped); Pending evaluations count with quick links; Readiness distribution for team |
| **API** | `GET /api/manager/dashboard/summary` |

| **Actions** | Specification |
|---|---|
| View Team | Navigate to team employee list |
| Evaluate Tasks | Navigate to pending evaluation list |
| Assign Course | Quick action to assign course to team |

| **States** | Specification |
|---|---|
| Loading | Skeleton cards |
| Empty | "Your team has no employees assigned yet. Contact HR to update department assignments." |

| **Permission** | Department-scoped: manager sees only own department |

| **Related Screens** | ORG-03 (scoped), TASK-01, TASK-03, INTEL-01 |

---

## DASH-04 Trainer Dashboard

| Field | Specification |
|---|---|
| **Goal** | Trainer monitors course status, learner results and content readiness |
| **Route** | `/trainer/dashboard` |
| **Roles** | Internal Trainer |
| **Page Type** | Dashboard |
| **Main Layout** | Course stats: total courses, published, draft; Recent learner results: last 10 assessment completions; Pending AI draft reviews count; Quick action buttons |
| **API** | `GET /api/trainer/dashboard/summary` |

| **Actions** | Specification |
|---|---|
| Create Course | Navigate to Course Builder |
| Review AI Drafts | Navigate to AI Draft Review list |
| View Learner Results | Navigate to Learner Results |

| **Related Screens** | COURSE-01, COURSE-02, ASSESS-01, ASSESS-03 |

---

## DASH-05 Employee Dashboard

| Field | Specification |
|---|---|
| **Goal** | Employee sees learning plan, pending items and achievements |
| **Route** | `/my-dashboard` |
| **Roles** | Employee |
| **Page Type** | Dashboard |
| **Main Layout** | Welcome card with name and role; Learning progress card: overall progress bar, next course to start; Upcoming deadlines: assignments due soon; Recent achievements: certificates earned, assessments passed; Alert cards: overdue tasks, high-priority notifications |
| **API** | `GET /api/employee/dashboard/summary` |

| **Widgets** | Specification |
|---|---|
| Learning Progress | Progress bar with percentage, course count (completed/total) |
| Upcoming Deadlines | List of assignments with course name, due date, days remaining |
| Recent Activity | Last 5 items: course completed, certificate issued, task submitted, assessment result |
| Quick Actions | Continue Learning, View Certificates, View Tasks |

| **States** | Specification |
|---|---|
| Empty - No Learning | "No learning assignments yet. Your manager or HR will assign courses when needed." with illustration |
| Warning - Overdue | Red alert card: "You have X overdue tasks. Please submit them as soon as possible." |

| **Related Screens** | LEARN-01, LEARN-03, CERT-02, TASK-02, ASSESS-02 |

---

# 6. Admin Screens (ADMIN)

## ADMIN-01 User Management

| Field | Specification |
|---|---|
| **Goal** | Admin manages user accounts, roles and status |
| **Route** | `/admin/users` |
| **Roles** | System Admin |
| **Page Type** | List Page |
| **Main Layout** | DataTable with columns: Avatar+Name, Email, Roles, Department, Last Login, Status (Active/Inactive), Actions menu |
| **API** | `GET /api/users`, `POST /api/users`, `PUT /api/users/{id}`, `PATCH /api/users/{id}/status` |

| **Toolbar Items** | Specification |
|---|---|
| Search | "Search by name or email..." |
| Filters | Role dropdown, Status dropdown (Active/Inactive/All), Department dropdown |
| Create Button | "Create User" (primary) |

| **Row Actions** | Specification |
|---|---|
| Edit | Opens User Edit form/sheet |
| Activate/Deactivate | Confirmation dialog: "Are you sure you want to deactivate [name]?" |
| Reset Password | Confirmation: "Send password reset email to [email]?" |
| Assign Role | Role assignment dialog with multi-select |

| **States** | Specification |
|---|---|
| Loading | Table skeleton with 5 rows |
| Empty | "No users found. Create the first user to get started." with Create button |
| Filtered Empty | "No users match the current filters." with Clear Filters button |
| Error | "Unable to load users" with Retry button |

| **Validation / Edge Cases** | Rule |
|---|---|
| Duplicate email | Rejected with inline error: "A user with this email already exists" |
| Last System Admin deactivation | Blocked: "Cannot deactivate the last System Admin account" |
| Self-deactivation | Show warning: "Are you sure you want to deactivate your own account?" |

| **Permission** | System Admin only; read-only view for HR |

| **Related Screens** | ADMIN-02, AUTH-02 |

---

## ADMIN-02 Role & Permission

| Field | Specification |
|---|---|
| **Goal** | Admin configures roles and their permission assignments |
| **Route** | `/admin/roles` |
| **Roles** | System Admin |
| **Page Type** | Detail + Matrix |
| **Main Layout** | Left panel: Role list with selection; Right panel: Permission matrix showing modules vs permissions (Create/Read/Update/Delete/Approve) with checkboxes; Data scope explanation section |
| **API** | `GET /api/roles`, `PUT /api/roles/{id}/permissions` |

| **UI Sections** | Content |
|---|---|
| Role List | Role name, user count, system role badge; click to select |
| Permission Matrix | Grouped by module; permissions as columns (View, Create, Edit, Delete, Approve, Assign); checkboxes for each cell |
| Data Scope Section | Description of data visibility for selected role (e.g., "Department-scoped: can only view own department employees") |
| Actions | Save Permissions (primary), Reset Changes (secondary), Create Role (optional) |

| **States** | Specification |
|---|---|
| Loading | Skeleton for role list and matrix |
| Warning | "You are about to modify your own role permissions. This may affect your current session." when admin edits own role |
| Error | "Unable to save permissions" with Retry |

| **Edge Cases** | Handling |
|---|---|
| Removing own admin access | Warning dialog: "This will remove your System Admin access. You may lose ability to manage permissions." Confirm requires typing "CONFIRM" |
| System roles | Locked rename/delete for "System Admin", "Employee", "Certificate Verifier" base roles |

| **Related Screens** | ADMIN-01 |

---

## ADMIN-03 System Configuration

| Field | Specification |
|---|---|
| **Goal** | Admin configures scoring weights, thresholds and system parameters |
| **Route** | `/admin/settings` |
| **Roles** | System Admin |
| **Page Type** | Settings Form |
| **Main Layout** | Grouped sections: Scoring Weights, Risk Thresholds, Certificate Settings, System Parameters |
| **API** | `GET /api/admin/settings`, `PUT /api/admin/settings` |

| **Configuration Groups** | Fields |
|---|---|
| Scoring Weights | Readiness formula weights: Competency Score (%), Certificate Compliance (%), Learning Progress (%), Task Performance (%) — must total 100% |
| Risk Thresholds | Low Risk (0-X), Medium Risk (X-Y), High Risk (Y-Z), Critical Risk (Z-100) — configurable range values |
| Certificate Settings | Default Validity Period (months), Expiry Warning Days, Max Allowed Revocations per employee |
| System Parameters | Session Timeout (minutes), Max Login Attempts, Password Complexity toggle |

| **Actions** | Save Changes (primary), Reset to Defaults (secondary) |

| **Validation** | Weights must total 100%; Thresholds must be sequential (Low \< Medium \< High \< Critical) |

| **Related Screens** | DASH-01 |

---

# 7. Organization Screens (ORG)

## ORG-01 Department Management

| Field | Specification |
|---|---|
| **Goal** | HR manages departments used for employee grouping and scope control |
| **Route** | `/organization/departments` |
| **Roles** | System Admin, HR / Training Manager |
| **Page Type** | List Page |
| **Main Layout** | DataTable: Name, Code, Manager, Status (Active/Archived), Employee Count, Created Date, Actions menu |
| **API** | `GET /api/departments`, `POST /api/departments`, `PUT /api/departments/{id}`, `PATCH /api/departments/{id}/status` |

| **Toolbar** | Search by name/code, Status filter, Create Department button |
|---|---|
| **Row Actions** | Edit, Assign Manager (user select), Archive (with confirmation and employee transfer check) |

| **Form Fields (Create/Edit)** | Specification |
|---|---|
| Department Name | Text, required, max 100 chars |
| Department Code | Text, required, uppercase, unique, max 20 chars, letters/numbers/hyphens |
| Description | Textarea, optional, max 500 chars |
| Manager | User select (searchable), optional |

| **States** | Specification |
|---|---|
| Empty | "No departments created yet. Departments help organize employees and control access." |
| Filtered Empty | "No departments match the current filters." |

| **Edge Cases** | Handling |
|---|---|
| Deactivate with active employees | Blocked: "Cannot archive department with X active employees. Reassign employees first." |
| Duplicate code | Inline error: "Department code already exists" |

| **Related Screens** | ORG-02, ORG-03 |

---

## ORG-02 Job Position Management

| Field | Specification |
|---|---|
| **Goal** | HR manages job positions and links them to competency requirements |
| **Route** | `/organization/positions` |
| **Roles** | System Admin, HR / Training Manager |
| **Page Type** | List Page + Tabbed Detail |
| **Main Layout** | List: DataTable with Title, Code, Department, Status, Requirements Count, Employees Count, Actions |
| **API** | `GET /api/job-positions`, `POST /api/job-positions`, `PUT /api/job-positions/{id}`, `PATCH /api/job-positions/{id}/status` |

| **Detail Tabs** | Content |
|---|---|
| Info | Position metadata: title, code, department, description, status |
| Requirements | Table: Competency, Required Level, Weight (%), Mandatory flag, Actions (Edit, Remove). Add Requirement button |
| Employees | Table of employees in this position: Name, Department, Status, Competency Coverage (%) |

| **Form Fields (Create/Edit)** | Specification |
|---|---|
| Position Title | Text, required, max 150 chars |
| Position Code | Text, required, uppercase, unique, max 20 chars |
| Department | Select from active departments |
| Description | Textarea, optional, max 1000 chars |

| **Edge Cases** | Handling |
|---|---|
| Active employees in position | Archive requires confirmation: "X employees are in this position. They will need reassignment." |
| No requirements configured | Show warning badge: "No competency requirements. Position analysis will be incomplete." |

| **Related Screens** | COMP-02, ORG-03 |

---

## ORG-03 Employee List and Detail

| Field | Specification |
|---|---|
| **Goal** | HR/Manager views and manages employee profiles and capability data |
| **Route** | `/organization/employees` (list), `/organization/employees/{id}` (detail) |
| **Roles** | HR (all), Department Manager (own dept only), Employee (self only) |
| **Page Type** | List Page + Tabbed Detail |

### List View

| **Toolbar** | Search by name/code/email; Filters: Department, Position, Status; Create Employee button |
|---|---|
| **Table Columns** | Avatar+Name, Employee Code, Email, Department, Position, Manager, Status (Active/Archived), Last Activity, Actions |

### Detail View - Tabs

| Tab | Content | Data Source |
|---|---|---|
| **Overview** | Profile card (avatar, name, department, position, manager, status); Contact info card (email, phone); Employment info card (hire date, employee code); Quick stats (courses completed, certificates, tasks, score) | `GET /api/employees/{id}` |
| **Learning** | Enrollment table: Course, Status, Progress %, Score, Due Date, Actions (View Course) | `GET /api/employees/{id}/enrollments` |
| **Competency** | Competency profile table: Competency, Current Level, Required Level (by position), Gap, Last Updated, Evidence source; Visual gap indicator bars | `GET /api/employees/{id}/competency-profile` |
| **Certificates** | Certificate table: Code, Name, Issue Date, Expiry Date, Status (Valid/Expired/Revoked), Actions (View, Download PDF) | `GET /api/employees/{id}/certificates` |
| **Tasks** | Task table: Title, Status, Due Date, Competency, Evaluator, Actions (View) | `GET /api/employees/{id}/tasks` |
| **Evidence** | Evidence timeline: grouped by type (Assessment, Certificate, Task, Manager Review, Manual), source link, date, confirming authority | `GET /api/employees/{id}/evidence` |

| **Actions** | Specification |
|---|---|
| Create Employee | Opens create form (wizard or dialog) |
| Edit Profile | Opens edit form/sheet for basic info |
| Assign Course | Navigate to Course Assignment with employee pre-selected |
| View Evidence | Navigate to evidence detail |
| Export | Download employee profile summary as PDF |

| **States** | Specification |
|---|---|
| Loading | Table skeleton for list; Tab skeleton for detail |
| Empty - No Employees | "No employees found. Create the first employee to build your organization." |
| Empty - Tab | Each tab shows own empty state: "No learning assignments yet", "No certificates issued", etc. |
| Inactive Employee Banner | Amber banner: "This employee is archived. Historical data is preserved." |
| Missing Position Warning | Amber badge: "No position assigned. Competency analysis unavailable." |

| **Edge Cases** | Handling |
|---|---|
| Manager outside scope | 403 page: "You do not have permission to view this employee" |
| Employee transfer | Position/department change triggers recalculation notice |
| Duplicate employee code | Rejected with inline error |

| **Permission** | HR: full access; Department Manager: own dept only; Employee: self-only read |

| **Related Screens** | COMP-01, COURSE-03, CERT-01, TASK-01, EVID-01 |

---

# 8. Competency Screens (COMP)

## COMP-01 Competency Framework

| Field | Specification |
|---|---|
| **Goal** | HR defines competency categories, competencies and levels |
| **Route** | `/competency-framework` |
| **Roles** | HR / Training Manager (CRUD), Other roles (view) |
| **Page Type** | Management (split panel) |
| **Main Layout** | Left panel: Category tree/list; Right panel: Competency table filtered by selected category; Level criteria panel at bottom or side |
| **API** | `GET /api/competency-categories`, `GET /api/competencies`, `POST /api/competencies`, `PUT /api/competencies/{id}`, `GET /api/competencies/{id}/levels` |

| **UI Sections** | Content |
|---|---|
| Category Panel | List of categories: Name, Description, Competency count; Create Category button; Click to select |
| Competency Table | Columns: Code, Name, Category, Levels count, Mappings (courses/positions), Status, Actions |
| Level Panel | Displayed when competency selected: Level value, Name, Description, Achievement Criteria; Add Level, Edit Level, Reorder |

| **Actions** | Specification |
|---|---|
| Create Category | Dialog: Name (required), Code (required, unique), Description (optional) |
| Create Competency | Form: Code (required, unique), Name (required), Category (pre-selected from tree), Description (optional) |
| Add Level | Dialog: Level Value (numeric), Name (text), Description, Achievement Criteria (textarea) |
| Archive | Confirmation dialog with impact warning if linked to courses/positions |

| **States** | Specification |
|---|---|
| Loading | Split-panel skeleton |
| Empty - No Categories | "No categories yet. Create a category to organize your competency framework." |
| Empty - No Competencies | "No competencies in this category. Click 'Create Competency' to add one." |

| **Edge Cases** | Handling |
|---|---|
| Duplicate competency code | Inline error |
| Delete linked competency | Blocked: "Cannot archive — competency is linked to X courses and X positions" |
| Level in use | Warning when modifying level used by employee profiles |

| **Related Screens** | COMP-02, ORG-02 |

---

## COMP-02 Position Requirement Mapping

| Field | Specification |
|---|---|
| **Goal** | HR maps required competencies to job positions with levels and weights |
| **Route** | `/competency-framework/position-requirements` |
| **Roles** | HR / Training Manager |
| **Page Type** | Matrix / Management |
| **Main Layout** | Position selector dropdown; Requirements table: Competency, Required Level (dropdown), Weight (%), Mandatory (toggle), Actions; Add Requirement button; Preview Skill Gap button |
| **API** | `GET /api/job-positions/{id}/competency-requirements`, `PUT /api/job-positions/{id}/competency-requirements` |

| **Table Columns** | Specification |
|---|---|
| Competency | Read-only, selected from competency list |
| Required Level | Dropdown of available levels for that competency |
| Weight | Numeric input with % suffix; all weights for a position should total 100 |
| Mandatory | Toggle/switch — mandatory competencies are required for position qualification |
| Actions | Remove requirement (with confirmation) |

| **Validation** | Rule |
|---|---|
| Duplicate competency | Blocked: "Competency already mapped to this position" |
| Weight total | If weight config enabled, show running total; warn if not 100% |
| No requirements | Cannot enable position for capability analysis: "Add at least one competency requirement" |

| **Related Screens** | COMP-01, ORG-02, INTEL-01 |

---

# 9. Course & Learning Screens (COURSE / LEARN)

## COURSE-01 Course List

| Field | Specification |
|---|---|
| **Goal** | Trainer/HR browses and manages course catalog |
| **Route** | `/courses` |
| **Roles** | Trainer (own courses), HR (all courses), Employee (assigned only) |
| **Page Type** | List Page |
| **Main Layout** | DataTable or Card grid: Title, Code, Status (Draft/Published/Archived), Competencies, Owner, Last Updated, Enrollments count, Actions |
| **API** | `GET /api/courses`, `POST /api/courses`, `PATCH /api/courses/{id}/status` |

| **Toolbar** | Search by title/code; Filters: Status (Draft/Published/Archived), Competency, Owner; Create Course button (Trainer/HR) |
|---|---|
| **Row Actions** | View, Edit, Preview, Publish (if draft), Archive, Duplicate |

| **States** | Specification |
|---|---|
| Loading | Card skeleton grid |
| Empty (Trainer) | "You haven't created any courses yet. Create your first course to start building learning content." |
| Empty (Employee) | "No courses assigned to you yet." |
| Filtered Empty | "No courses match the current filters." |

| **Edge Cases** | Handling |
|---|---|
| Publish blocked | Show validation checklist: "Cannot publish — missing: lessons, competency mapping, assessment" |
| Duplicate course code | Rejected |

| **Related Screens** | COURSE-02, COURSE-03, COURSE-04 |

---

## COURSE-02 Course Builder (Wizard)

| Field | Specification |
|---|---|
| **Goal** | Trainer creates full course structure with modules, lessons and materials |
| **Route** | `/courses/create`, `/courses/{id}/edit` |
| **Roles** | Internal Trainer, HR / Training Manager |
| **Page Type** | Wizard / Multi-tab Form |
| **Main Layout** | Step indicator or tabs: Overview → Modules/Lessons → Materials → Competencies → Completion Rules → Preview |
| **API** | `POST /api/courses`, `PUT /api/courses/{id}`, `POST /api/courses/{id}/modules`, `POST /api/courses/{id}/lessons`, `POST /api/learning-materials/upload` |

| **Tab / Step** | Fields |
|---|---|
| **Overview** | Title (required), Code (required, unique), Description (textarea), Difficulty (Beginner/Intermediate/Advanced), Estimated Duration (hours), Thumbnail (image upload), Category (select) |
| **Modules/Lessons** | Module list (drag to reorder): Module Title (required), Lessons within module (drag to reorder): Lesson Title (required), Content Type (Text/Video/PDF/Quiz), Required/Optional toggle |
| **Materials** | Upload area: drag-and-drop + browse; File list with name, size, type, progress, remove button |
| **Competencies** | Add competency mapping: Competency (select), Target Level (select), Coverage Weight (%), Learning Outcome Description (textarea) |
| **Completion Rules** | Completion Type (All Lessons / Min Score / Both), Min Score %, Required Assessment ID (select), Issue Certificate toggle |
| **Preview** | Read-only preview of course structure; Publish button |

| **Actions** | Specification |
|---|---|
| Save Draft | Save current progress, stay on same tab |
| Save \& Next | Save and advance to next tab |
| Publish | Validate all required sections, then publish |
| Preview | Opens course preview in new tab |

| **States** | Specification |
|---|---|
| Unsaved Changes Warning | "You have unsaved changes. Leave without saving?" dialog on navigate away |
| File Upload Progress | Progress bar per file, success/error state, retry button |
| Publish Validation Error | Inline error list: "Please complete: Lessons, Competency Mapping, Assessment" |

| **Edge Cases** | Handling |
|---|---|
| Empty module | Cannot publish: "Each module should contain at least one lesson" |
| No competency mapping | Warning: "Course without competency mapping will not appear in recommendations" |
| File too large | "File exceeds the maximum size of 50MB" |

| **Related Screens** | COURSE-01, COURSE-03, COURSE-04 |

---

## COURSE-03 Course Detail

| Field | Specification |
|---|---|
| **Goal** | View full course information, structure, assignments and learner progress |
| **Route** | `/courses/{id}` |
| **Roles** | Trainer, HR, Employee (if assigned) |
| **Page Type** | Detail Page (Tabbed) |
| **Main Layout** | Page header with title, status badge, owner; Tabs: Overview, Modules/Lessons, Materials, Competencies, Assignments (HR/Trainer), Learners (HR/Trainer) |
| **API** | `GET /api/courses/{id}`, `GET /api/courses/{id}/modules`, `GET /api/courses/{id}/competencies`, `GET /api/courses/{id}/assignments` |

| **Tabs** | Content |
|---|---|
| Overview | Description, difficulty, duration, completion rules, thumbnail, created/updated dates |
| Modules/Lessons | Accordion list: Module → Lessons with titles, content type icons, required badge, duration |
| Materials | List of downloadable materials with file type icon, size, download button |
| Competencies | Table: Competency name, target level, coverage weight, learning outcome |
| Assignments | Table: Target (Employee/Dept/Position), Assigned By, Date, Due Date, Enrollments count (HR/Trainer only) |
| Learners | Table: Employee name, department, status (Not Started/In Progress/Completed), progress %, score (HR/Trainer only) |

| **Related Screens** | COURSE-01, COURSE-02, COURSE-04 |

---

## COURSE-04 Course Assignment

| Field | Specification |
|---|---|
| **Goal** | HR/Manager assigns course to employees, departments or positions |
| **Route** | `/course-assignment` |
| **Roles** | HR / Training Manager, Department Manager (dept-scoped) |
| **Page Type** | Wizard |
| **Main Layout** | Step 1: Select Course (searchable list of published courses); Step 2: Select Target Type (Employees / Department / Position) + specific targets; Step 3: Set Details (Due Date, Notes, Mandatory toggle, Notification toggle); Step 4: Review \& Confirm |
| **API** | `POST /api/course-assignments`, `GET /api/courses/published` |

| **Review Section** | Specification |
|---|---|
| Summary | Course name, X employees affected, due date, mandatory flag |
| Employee Preview | Table of affected employees: Name, Department, Current similar assignments |
| Confirm | "Assign Course" primary button; "Back" secondary |

| **Validation** | Rule |
|---|---|
| Duplicate assignment | Warning: "X employees already have this course assigned. Skipping duplicates." |
| Past due date | Blocked: "Due date cannot be in the past" |
| No active employees | "No active employees found for selected department/position" |

| **Edge Cases** | Handling |
|---|---|
| Course not published | Only published courses appear in selection |
| Manager outside scope | Manager can only assign to own department employees |

| **Related Screens** | COURSE-01, COURSE-03 |

---

## LEARN-01 Lesson Viewer

| Field | Specification |
|---|---|
| **Goal** | Employee consumes lesson content and tracks progress |
| **Route** | `/my-learning/courses/{courseId}/lessons/{lessonId}` |
| **Roles** | Employee (assigned to course) |
| **Page Type** | Content Viewer |
| **Main Layout** | Left sidebar: Course module/lesson index with completion checkmarks; Main area: Lesson title, content (rich text/video embed/PDF viewer), material download buttons; Bottom bar: Mark Complete, Previous/Next Lesson buttons; Top progress indicator |
| **API** | `GET /api/courses/{id}/lessons/{lessonId}`, `POST /api/lessons/{id}/progress` |

| **UI Sections** | Content |
|---|---|
| Lesson Index | Collapsible modules, lesson titles with status icons (not started/in progress/completed) |
| Content Area | Rendered lesson content (HTML from rich text editor, video iframe, PDF embed) |
| Materials | Download links with file type icons |
| Navigation | Previous Lesson, Next Lesson, Mark Complete (toggle) |

| **States** | Specification |
|---|---|
| Loading | Content skeleton |
| No Access | "You do not have access to this course" with contact manager message |
| Material Unavailable | "This material is no longer available" with fallback message |
| Progress Save Failure | Toast error but content remains accessible; retry on next action |

| **Edge Cases** | Handling |
|---|---|
| Completed lesson | Read-only mode; Mark Complete disabled; checkmark indicator |
| Video content | Embed with responsive aspect ratio; fallback download link |
| Course completed | Banner: "Congratulations! You have completed all lessons." |

| **Related Screens** | DASH-05, LEARN-02 |

---

## LEARN-02 My Learning (Employee)

| Field | Specification |
|---|---|
| **Goal** | Employee views assigned courses and learning progress |
| **Route** | `/my-learning` |
| **Roles** | Employee |
| **Page Type** | List Page |
| **Main Layout** | Card grid or table: Course Title, Status (Assigned/In Progress/Completed/Overdue), Progress bar, Due Date, Score (if completed), Actions (Continue/View/Retake) |
| **API** | `GET /api/enrollments/my` |

| **Actions** | Specification |
|---|---|
| Start Course | First time: navigate to first lesson |
| Continue | Navigate to last uncompleted lesson |
| View Certificate | If completed and certificate issued |

| **States** | Specification |
|---|---|
| Empty | "No learning assignments yet. Your manager or HR will assign courses when needed." |
| Overdue Warning | Red badge: "Overdue by X days" |

| **Related Screens** | LEARN-01, DASH-05 |

---

# 10. Assessment Screens (ASSESS)

## ASSESS-01 Question Bank

| Field | Specification |
|---|---|
| **Goal** | Trainer manages reusable questions for assessments |
| **Route** | `/trainer/question-bank` |
| **Roles** | Internal Trainer |
| **Page Type** | List Page |
| **Main Layout** | DataTable: Question (truncated text), Type (Multiple Choice / True-False / Essay), Difficulty (Easy/Medium/Hard), Competency, Status (Draft/Approved/Archived), Last Updated, Actions |
| **API** | `GET /api/questions`, `POST /api/questions`, `PUT /api/questions/{id}`, `PATCH /api/questions/{id}/status` |

| **Toolbar** | Search by question text; Filters: Type, Difficulty, Competency, Status; Create Question, Import, Generate AI Draft buttons |
|---|---|
| **Row Actions** | Edit, Approve (if draft), Archive, View Usage |

| **Form Fields (Create/Edit)** | Specification |
|---|---|
| Question Text | Rich text editor, required |
| Question Type | Select: Multiple Choice (Single), Multiple Choice (Multi), True/False, Essay |
| Difficulty | Select: Easy, Medium, Hard |
| Competency | Select from active competencies |
| Options (for MC) | Dynamic list: Option text + Is Correct toggle; at least 2 options |
| Explanation | Textarea, optional — shown after answering |
| Status | Default: Draft; can be set to Approved if complete |

| **States** | Specification |
|---|---|
| Loading | Table skeleton |
| Empty | "No questions yet. Create your first question or import from a file." |
| AI Draft Tab | Separate tab: "AI Drafts" — questions generated by AI, pending review; Approve/Edit/Reject actions per question |

| **Edge Cases** | Handling |
|---|---|
| Delete used question | Blocked: "This question is used in X active assessments. Archive instead of delete." |
| AI draft publish | AI draft cannot be set to Approved without trainer review/edit |
| Import format error | Show error details: "Row 5: Missing answer field" |

| **Related Screens** | ASSESS-03 |

---

## ASSESS-02 Assessment Attempt (Quiz Interface)

| Field | Specification |
|---|---|
| **Goal** | Employee takes a quiz or final assessment |
| **Route** | `/my-assessments/{id}/attempt` |
| **Roles** | Employee |
| **Page Type** | Interactive Tool |
| **Main Layout** | Top bar: Timer, Question progress (X of Y), Submit button; Main area: Question text + answer options; Navigation: Previous/Next buttons; Question palette (numbered buttons showing answered/unanswered status) |
| **API** | `POST /api/assessments/{id}/start`, `POST /api/assessment-attempts/{attemptId}/answers`, `POST /api/assessment-attempts/{attemptId}/submit` |

| **UI Sections** | Content |
|---|---|
| Header | Assessment title, timer (if time-limited), progress indicator |
| Question Area | Question text, options (radio for single, checkbox for multi, textarea for essay) |
| Navigation | Previous, Next, Question palette (grid of question numbers: green=answered, white=unanswered, red=flagged) |
| Footer | Submit Assessment button (disabled until all required questions answered) |

| **States** | Specification |
|---|---|
| Start Screen | Assessment info: title, time limit, question count, max attempts, passing score; Start Attempt button |
| In Progress | Active quiz interface with timer ticking |
| Timeout | Auto-submit: "Time is up! Your answers will be submitted automatically." |
| Submitted | Redirect to result screen |
| Lost Connection | Banner: "Connection lost. Your answers are saved locally. Reconnecting..." |
| Max Attempts Reached | Blocked: "You have used all X attempts for this assessment." |

| **Edge Cases** | Handling |
|---|---|
| Unanswered questions on submit | Warning: "You have X unanswered questions. Submit anyway?" |
| Page refresh | Saved answers restored from draft/local storage; timer continues |
| Essay question | Auto-save draft every 30 seconds |

| **Validation** | All required questions must be answered before final submit (essay exempted if optional) |

| **Related Screens** | ASSESS-04, LEARN-02 |

---

## ASSESS-03 Assessment Builder

| Field | Specification |
|---|---|
| **Goal** | Trainer creates assessments with questions and scoring rules |
| **Route** | `/trainer/assessments/create`, `/trainer/assessments/{id}/edit` |
| **Roles** | Internal Trainer, HR / Training Manager |
| **Page Type** | Form + Question Selection |
| **Main Layout** | Tabbed: Info, Questions, Preview |
| **API** | `POST /api/assessments`, `PUT /api/assessments/{id}`, `PUT /api/assessments/{id}/questions` |

| **Info Tab Fields** | Specification |
|---|---|
| Title (required) | Text |
| Description | Textarea |
| Course | Select from published courses |
| Assessment Type | Quiz (formative) or Final (summative) |
| Passing Score (%) | Numeric, required, 0-100 |
| Time Limit (minutes) | Numeric, 0 = no limit |
| Max Attempts | Numeric, default 1 |
| Shuffle Questions | Toggle |
| Show Result Immediately | Toggle |

| **Questions Tab** | Search/filter question bank; Add Questions (multi-select); Table: Order, Question, Type, Difficulty, Competency, Points, Actions (Remove, Reorder) |
|---|---|
| **Preview Tab** | Read-only preview of assessment as employee would see it |

| **Edge Cases** | Handling |
|---|---|
| No questions added | Cannot publish: "Add at least one question" |
| Total points zero | Warning |
| Question removed from bank after added | Warning if question is archived: "X questions are no longer available" |

| **Related Screens** | ASSESS-01, ASSESS-04 |

---

## ASSESS-04 Assessment Result

| Field | Specification |
|---|---|
| **Goal** | Employee views assessment result; Trainer/HR reviews learner performance |
| **Route** | `/my-assessments/{id}/result` (employee), `/trainer/learners/{attemptId}` (trainer) |
| **Roles** | Employee (own), Trainer (all), HR (all) |
| **Page Type** | Result / Report |
| **Main Layout** | Result card: Score, Pass/Fail badge, Time taken, Attempt X of Y; Answer review: question-by-question with user answer, correct answer (if revealed), explanation, points earned |
| **API** | `GET /api/assessment-attempts/{id}` |

| **Actions** | Specification |
|---|---|
| View Correct Answers | Toggle (if enabled by trainer) |
| Retry | If attempts remaining, navigate to start screen |
| View Certificate | If passed and certificate issued |
| Back to Dashboard | Navigate to employee dashboard |

| **States** | Specification |
|---|---|
| Passed | Green success card with confetti (subtle); "Congratulations! You passed with X%." |
| Failed | Amber card: "You scored X%. The passing score is Y%."; Retry button if attempts remain |
| Training Review | Side panel for trainer: question-by-question performance stats |

| **Related Screens** | ASSESS-02, CERT-01, LEARN-02 |

---

# 11. Certificate Screens (CERT)

## CERT-01 Certificate Management

| Field | Specification |
|---|---|
| **Goal** | HR/Trainer tracks issued certificates and manages lifecycle |
| **Route** | `/certificates` |
| **Roles** | HR / Training Manager (CRUD), Department Manager (view dept), Employee (view own) |
| **Page Type** | List Page |
| **Main Layout** | DataTable: Certificate Code, Employee Name, Course, Issue Date, Expiry Date, Status (Valid/Expired/Revoked), Actions |
| **API** | `GET /api/certificates`, `POST /api/certificates`, `PATCH /api/certificates/{id}/status` |

| **Toolbar** | Search by code/employee name; Filters: Status, Course, Date range; Issue Certificate button |
|---|---|
| **Row Actions** | View Details, Download PDF, Revoke (with reason dialog), Renew |

| **Issue Certificate Dialog** | Specification |
|---|---|
| Employee | Searchable select (must have completed assessment/course) |
| Course | Select from completed courses (with passing assessment) |
| Issue Date | Date picker, default today |
| Expiry Date | Date picker, default based on system setting |
| Issue Button | Primary; disabled if completion criteria not met |

| **Revoke Dialog** | Specification |
|---|---|
| Reason | Textarea (required) with placeholder: "Explain why this certificate is being revoked..." |
| Impact Note | "Revoking this certificate will: update status to Revoked, remove from active score calculation, create audit log entry." |
| Confirm | Danger button: "Revoke Certificate" — disabled until reason provided |

| **States** | Specification |
|---|---|
| Loading | Table skeleton |
| Empty | "No certificates issued yet. Issue certificates to employees who complete courses." |
| Expired Banner | Amber banner on certificate detail if expired |

| **Edge Cases** | Handling |
|---|---|
| Issue blocked | "Employee has not met completion criteria for this course" with checklist |
| Revoke requires reason | Confirm button disabled until reason entered |
| Certificate auto-expire | System checks expiry daily; status updated by background job |

| **Related Screens** | CERT-02, ORG-03 (Certificates tab) |

---

## CERT-02 Certificate Verification Page

| Field | Specification |
|---|---|
| **Goal** | Verifier checks certificate validity using code or QR |
| **Route** | `/verify` (public) |
| **Roles** | Certificate Verifier, Employee, HR (any authenticated user) |
| **Page Type** | Verification Page |
| **Main Layout** | Large centered input: "Enter Certificate Code" with Verify button; Or instruction: "Scan QR code with your device camera"; Result card: Dominant status (Valid/Expired/Revoked) with full-width color banner; Certificate metadata below |
| **API** | `GET /api/certificates/verify?code={code}` |

| **Result Card** | Content |
|---|---|
| Status Banner | Valid = green "✓ Valid Certificate"; Expired = amber "⚠ Expired Certificate"; Revoked = red "✗ Revoked Certificate" with revocation date |
| Certificate Info | Certificate Code, Employee Name (limited), Course Title, Issue Date, Expiry Date |
| Verification Mark | "Verified on [timestamp]" |
| Actions | Download Public Proof (optional), Verify Another (primary) |

| **States** | Specification |
|---|---|
| Initial | Clean input with placeholder text and illustration |
| Loading | Spinner on Verify button |
| Valid Certificate | Green status card with certificate details |
| Expired Certificate | Amber status card with "Expired on [date]" |
| Revoked Certificate | Red status card with "Revoked on [date]" — reason not shown publicly |
| Invalid Code | "No certificate found with this code. Please check and try again." |
| Network Error | "Unable to verify. Please check your connection." with Retry |

| **Edge Cases** | Handling |
|---|---|
| QR scan | Placeholder: camera icon with "Scan QR code" (MVP: manual code entry, QR scanning as future) |
| Expired but valid QR | Show expired status clearly; do not show as valid |
| Private data | Do not expose: employee email, phone, department, competency scores, training history |

| **Related Screens** | CERT-01 |

---

# 12. Task Screens (TASK)

## TASK-01 Practical Task Board

| Field | Specification |
|---|---|
| **Goal** | Manager tracks practical tasks assigned to team members |
| **Route** | `/tasks` |
| **Roles** | Department Manager (dept), HR (all), Employee (own) |
| **Page Type** | List / Kanban |
| **Main Layout** | Kanban columns OR List view toggle: Columns by status (Assigned / In Progress / Submitted / Under Review / Approved / Rejected); Cards with: Task Title, Assignee Avatar+Name, Due Date, Priority, Competency; Filters: Assignee, Status, Deadline, Competency |
| **API** | `GET /api/tasks`, `POST /api/tasks` |

| **Kanban Card** | Content |
|---|---|
| Title | Task title (clickable to detail) |
| Assignee | Avatar + name |
| Due Date | Date with overdue highlighting |
| Badge | Competency name |
| Priority | High/Medium/Low indicator |

| **Actions** | Create Task (primary), Use AI Suggestion (secondary/optional), Bulk Reminder |

| **States** | Specification |
|---|---|
| Loading | Kanban skeleton with column placeholders |
| Empty (Manager) | "No tasks yet. Create a task to assign practical work to your team." |
| Empty (Employee) | "No tasks assigned to you." |
| Filtered Empty | "No tasks match current filters." |

| **Permission** | Manager: department-scoped; HR: all departments; Employee: own tasks only |

| **Related Screens** | TASK-02, TASK-03 |

---

## TASK-02 Task Detail and Submission

| Field | Specification |
|---|---|
| **Goal** | Employee views task details, submits evidence; Manager views submissions |
| **Route** | `/tasks/{id}` |
| **Roles** | Employee (assigned), Manager (dept), HR (all) |
| **Page Type** | Detail Page (Tabbed) |
| **Main Layout** | Header: Title, Status badge, Due Date, Assignee; Tabs: Info, Submission (employee), Evaluation (manager) |
| **API** | `GET /api/tasks/{id}`, `POST /api/tasks/{id}/submit`, `POST /api/tasks/{id}/attachments` |

| **Info Tab** | Content |
|---|---|
| Description | Full task description (rich text) |
| Evaluation Criteria | Criteria list that manager will use to evaluate |
| Competency | Linked competency with target level |
| Attachments | Reference materials from manager |
| Timeline | History of status changes |

| **Submission Tab (Employee)** | Specification |
|---|---|
| Submission Form | Textarea for notes/description of work done; File upload area for evidence documents; Link input for external references |
| Buttons | Submit (primary, disabled until files uploaded or notes entered), Save Draft (secondary), Withdraw (before review) |
| Status | If already submitted: read-only view of submission; "Submitted on [date]" |

| **States** | Specification |
|---|---|
| Before Deadline | Normal submission flow |
| After Deadline | Warning: "This task is overdue. Late submissions may still be accepted." |
| Under Review | Read-only: "Your submission is under review. You will receive feedback once evaluation is complete." |
| Approved/Rejected | Show evaluation result with feedback |

| **Edge Cases** | Handling |
|---|---|
| File upload fails | Failed state with retry; keep other attachments |
| Already under review | Withdraw disabled |
| No submission yet | Show submission form; "Start Task" to begin |

| **Related Screens** | TASK-01, TASK-03 |

---

## TASK-03 Task Evaluation

| Field | Specification |
|---|---|
| **Goal** | Manager evaluates submitted task and confirms competency evidence |
| **Route** | `/tasks/{id}/evaluate` |
| **Roles** | Department Manager, Internal Trainer |
| **Page Type** | Evaluation Form |
| **Main Layout** | Top: Submission preview (employee notes, attachments); Middle: Scoring rubric with criteria; Bottom: Feedback textarea, Competency impact selector, Decision buttons |
| **API** | `POST /api/tasks/{id}/evaluate` |

| **UI Sections** | Content |
|---|---|
| Submission Preview | Employee's submitted notes and attachments (read-only view) |
| Scoring Rubric | Criteria list from task definition; each criterion: score input (1-5 or 0-100), optional comment |
| Overall Score | Auto-calculated from rubric if defined; Manual if not |
| Feedback | Textarea (required on Reject/Revision) |
| Competency Impact | Toggle: "Confirm competency evidence" + Level selector (if score meets threshold) |
| Decision Buttons | Approved (green), Request Revision (amber), Rejected (red) |

| **Validation** | Rule |
|---|---|
| Score range | Numeric input with min/max validation |
| Reject requires reason | Feedback field becomes required when Reject or Request Revision selected |
| Competency confirmation | Only available when score meets configured threshold |

| **States** | Specification |
|---|---|
| Loading | Skeleton for submission preview |
| Already Evaluated | Read-only: "Evaluated by [name] on [date]" with results |
| Error saving | Toast error; keep form state for retry |

| **Edge Cases** | Handling |
|---|---|
| Score below threshold | Competency confirmation auto-disabled: "Score does not meet the minimum threshold for competency confirmation" |
| Audit log | All evaluations logged: who, when, score, decision |

| **Related Screens** | TASK-01, TASK-02, EVID-01 |

---

# 13. Intelligence Screens (INTEL)

## INTEL-01 Skill Gap Analysis

| Field | Specification |
|---|---|
| **Goal** | User identifies missing competencies for an employee or position |
| **Route** | `/intelligence/skill-gap` |
| **Roles** | HR (all), Department Manager (dept), Employee (self) |
| **Page Type** | Analysis Page |
| **Main Layout** | Input selection: Employee or Position selector; Results table: Competency, Required Level, Current Level, Gap (visual bar), Status (Met/Gap/Critical), Recommended Actions; Recommended course cards below |
| **API** | `GET /api/intelligence/skill-gap?employeeId=&positionId=` |

| **UI Sections** | Content |
|---|---|
| Selector | Radio: Analyze by Employee or Position; Dropdown for selected type |
| Gap Table | Columns: Competency, Required Level, Current Level, Gap (color-coded bar: green=met, amber=partial, red=gap), Status icon, Recommended course link |
| Recommendation Cards | Course cards with: Title, Target level, Duration, Enroll button (if has permission) |
| Explanation Drawer | Right panel: factor breakdown, data sources, calculation method |

| **Actions** | Run Analysis (primary), View Explanation, Assign Recommended Course |

| **States** | Specification |
|---|---|
| No selection | "Select an employee or position to analyze skill gaps" |
| Loading | Table skeleton |
| No data | "Insufficient data. Employee may not have a competency profile or position requirements configured." |
| All gaps met | Green success card: "All required competencies are met." |

| **Edge Cases** | Handling |
|---|---|
| No position mapped | "Employee has no assigned job position. Skill gap cannot be fully calculated." |
| Insufficient assessment data | "Some competencies lack assessment data. Levels shown may not reflect true capability." |

| **Related Screens** | INTEL-02, INTEL-03, COURSE-04 |

---

## INTEL-02 Training Risk

| Field | Specification |
|---|---|
| **Goal** | HR/Manager identifies employees at risk of failing or delaying training |
| **Route** | `/intelligence/training-risk` |
| **Roles** | HR / Training Manager (all), Department Manager (dept) |
| **Page Type** | List Page |
| **Main Layout** | Risk distribution summary (card: Low/Medium/High/Critical counts); Employee risk table: Name, Department, Position, Risk Level (badge), Risk Score, Factors (overdue/ low score/inactivity), Last Activity, Actions |
| **API** | `GET /api/intelligence/training-risk` |

| **Actions** | View Explanation (opens drawer with factor breakdown), Notify Employee, Assign Support Course |
|---|---|
| **States** | Empty: "No risk data available. Risk is calculated based on enrollment progress and assessment scores." |
| **Edge Cases** | Score stale warning: "Risk data last calculated [timestamp]. May not reflect recent activity." |

| **Related Screens** | INTEL-01, COURSE-04, DASH-02 |

---

## INTEL-03 Workforce Readiness

| Field | Specification |
|---|---|
| **Goal** | HR/Manager views overall workforce readiness score and breakdown |
| **Route** | `/intelligence/readiness` |
| **Roles** | HR / Training Manager (all), Department Manager (dept), Employee (self) |
| **Page Type** | Analysis Page |
| **Main Layout** | Overall readiness score (large circular progress or card); Readiness distribution chart (Not Ready / Developing / Nearly Ready / Ready); Employee readiness table: Name, Readiness Level, Score, Trend, Key gaps |
| **API** | `GET /api/intelligence/readiness` |

| **Actions** | View Explanation (drawer with competency breakdown, certificate compliance, learning progress, task performance factors); Export Report |
|---|---|
| **States** | No data: "Configure position competency requirements and complete assessments to calculate readiness." |

| **Related Screens** | INTEL-01, EVID-01 |

---

# 14. Notification Screens (NOTI)

## NOTI-01 Notification Center

| Field | Specification |
|---|---|
| **Goal** | Users view and manage their notifications |
| **Route** | `/notifications` |
| **Roles** | All authenticated users |
| **Page Type** | List Page |
| **Main Layout** | Inbox-style list: Avatar/icon, Title, Message preview, Type badge (Info/Warning/Action Required), Timestamp, Read/Unread indicator; Filters: Type, Status (All/Unread), Date range |
| **API** | `GET /api/notifications`, `PATCH /api/notifications/read`, `PATCH /api/notifications/{id}/read` |

| **Row Actions** | Mark as Read/Unread, Open Related Item (navigates to relevant screen), Dismiss (archive) |
|---|---|
| **Topbar Badge** | Unread count badge on bell icon in topbar |

| **Notification Types** | Source |
|---|---|
| Course Assignment | New course assigned |
| Assessment Due | Assessment deadline approaching |
| Task Assigned | New practical task |
| Task Evaluation | Task evaluated with result |
| Certificate Issued | New certificate available |
| Certificate Expiring | Certificate expires within X days |
| Risk Alert | Employee flagged as high risk (manager) |
| AI Draft Ready | AI-generated questions ready for review (trainer) |

| **States** | Empty: "No notifications yet." |
|---|---|
| **Edge Cases** | Deleted related item: "This item is no longer available" instead of broken link; Expired notification auto-archived |

| **Related Screens** | Respective source screens |

---

# 15. Evidence Screens (EVID)

## EVID-01 Competency Evidence Portfolio

| Field | Specification |
|---|---|
| **Goal** | User reviews evidence supporting an employee's competency profile |
| **Route** | `/employees/{id}/evidence` |
| **Roles** | HR (all), Department Manager (dept), Employee (self) |
| **Page Type** | Timeline / List |
| **Main Layout** | Timeline grouped by evidence type: Assessment, Certificate, Task, Manager Review, Manual; Each entry: Competency, Level achieved, Source type, Date, Confirmed by, Status (Confirmed/Pending), Actions (View Source, Confirm if pending) |
| **API** | `GET /api/employees/{id}/evidence`, `POST /api/employees/{id}/evidence`, `PUT /api/evidence/{id}/confirm` |

| **Actions** | Add Manual Evidence (HR only), View Source (navigates to origin), Confirm Evidence (manager) |

| **States** | Empty: "No evidence recorded yet. Evidence is created automatically from assessment results, certificates and task evaluations." |
|---|---|
| **Edge Cases** | Stale evidence indicator: "Evidence from [X months ago]. Consider reassessment if competency may have changed."; Employee self-confirm blocked; Hidden evidence by permission level |

| **Related Screens** | ORG-03 (Evidence tab), INTEL-03 |

---

# 16. Audit Screens (AUDIT)

## AUDIT-01 Audit Log

| Field | Specification |
|---|---|
| **Goal** | Admin reviews sensitive action history |
| **Route** | `/admin/audit-log` |
| **Roles** | System Admin, HR / Training Manager |
| **Page Type** | List Page |
| **Main Layout** | DataTable: Timestamp, Actor (name + email), Action (Create/Update/Delete/Login/Revoke/Evaluate/etc.), Module, Target (entity type + ID/name), IP Address (optional), Details preview, Actions |
| **API** | `GET /api/audit-logs` |

| **Toolbar** | Filters: Date range (default: last 7 days), Actor, Action type, Module; Export button |
|---|---|
| **Row Actions** | View Detail (opens side panel with full payload/change details) |

| **States** | Empty: "No audit log entries match the current filters." |
|---|---|
| **Edge Cases** | Immutable records: audit logs cannot be deleted or edited; Sensitive payload masking: passwords and tokens masked in details |

| **Related Screens** | DASH-01 |

---

# 17. Settings Screens (SETTING)

## SETTING-01 Notification Templates (Optional)

| Field | Specification |
|---|---|
| **Goal** | Admin manages notification message templates |
| **Route** | `/admin/notification-templates` |
| **Roles** | System Admin |
| **Page Type** | List Page + Editor |
| **Main Layout** | Template list: Event Type, Subject preview, Last Modified, Status (Active/Inactive); Editor panel: Subject, Body (rich text with variable placeholders like {employee_name}, {course_title}), Active toggle |
| **API** | `GET /api/notification-templates`, `PUT /api/notification-templates/{id}` |

| **States** | Default templates pre-seeded; "Reset to Default" button per template |
|---|---|
| **Edge Cases** | Invalid variable placeholder: preview shows warning |

---

# 18. Error & Empty State Screens

## ERR-01 403 Forbidden Page

| Field | Specification |
|---|---|
| **Layout** | Centered content: Lock icon, "Access Denied", Description: "You do not have permission to access this page.", "Return to Dashboard" button |
| **Behavior** | Auto-redirect to dashboard after 10 seconds |

## ERR-02 404 Not Found Page

| Field | Specification |
|---|---|
| **Layout** | Centered content: Search icon, "Page Not Found", Description: "The page you are looking for does not exist or has been moved.", "Go to Dashboard" and "Go Back" buttons |

## ERR-03 500 Server Error Page

| Field | Specification |
|---|---|
| **Layout** | Centered content: Warning icon, "Something Went Wrong", Description: "An unexpected error occurred. Please try again or contact support.", "Try Again" button (retries last action), "Return to Dashboard" button |

## ERR-04 Network Offline Banner

| Field | Specification |
|---|---|
| **Layout** | Fixed top banner: Red/warning background, "You are offline. Some features may be unavailable." |
| **Behavior** | Automatically dismisses when connection restored |

---

# 19. Appendix: Screen-ID to Route Mapping

| Screen ID | Screen Name | Route | Roles |
|---|---|---|---|
| AUTH-01 | Login Page | `/login` | Public |
| AUTH-02 | My Profile | `/my-profile` | All authenticated |
| DASH-01 | Admin Dashboard | `/admin/dashboard` | System Admin |
| DASH-02 | HR Dashboard | `/hr/dashboard` | HR / Training Manager |
| DASH-03 | Manager Dashboard | `/manager/dashboard` | Department Manager |
| DASH-04 | Trainer Dashboard | `/trainer/dashboard` | Internal Trainer |
| DASH-05 | Employee Dashboard | `/my-dashboard` | Employee |
| ADMIN-01 | User Management | `/admin/users` | System Admin |
| ADMIN-02 | Role \& Permission | `/admin/roles` | System Admin |
| ADMIN-03 | System Configuration | `/admin/settings` | System Admin |
| ORG-01 | Department Management | `/organization/departments` | Admin, HR |
| ORG-02 | Job Position Management | `/organization/positions` | Admin, HR |
| ORG-03 | Employee List and Detail | `/organization/employees` | Admin, HR, Manager, Employee |
| COMP-01 | Competency Framework | `/competency-framework` | HR (CRUD), others (view) |
| COMP-02 | Position Requirement Mapping | `/competency-framework/position-requirements` | HR |
| COURSE-01 | Course List | `/courses` | Trainer, HR, Employee |
| COURSE-02 | Course Builder | `/courses/create`, `/courses/{id}/edit` | Trainer, HR |
| COURSE-03 | Course Detail | `/courses/{id}` | Trainer, HR, Employee |
| COURSE-04 | Course Assignment | `/course-assignment` | HR, Manager |
| LEARN-01 | Lesson Viewer | `/my-learning/courses/{courseId}/lessons/{lessonId}` | Employee |
| LEARN-02 | My Learning | `/my-learning` | Employee |
| ASSESS-01 | Question Bank | `/trainer/question-bank` | Trainer |
| ASSESS-02 | Assessment Attempt | `/my-assessments/{id}/attempt` | Employee |
| ASSESS-03 | Assessment Builder | `/trainer/assessments/create`, `/trainer/assessments/{id}/edit` | Trainer, HR |
| ASSESS-04 | Assessment Result | `/my-assessments/{id}/result` | Employee, Trainer, HR |
| CERT-01 | Certificate Management | `/certificates` | HR, Trainer, Manager, Employee |
| CERT-02 | Certificate Verification | `/verify` | Verifier, Public |
| TASK-01 | Practical Task Board | `/tasks` | Manager, HR, Employee |
| TASK-02 | Task Detail \& Submission | `/tasks/{id}` | Employee, Manager, HR |
| TASK-03 | Task Evaluation | `/tasks/{id}/evaluate` | Manager, Trainer |
| INTEL-01 | Skill Gap Analysis | `/intelligence/skill-gap` | HR, Manager, Employee |
| INTEL-02 | Training Risk | `/intelligence/training-risk` | HR, Manager |
| INTEL-03 | Workforce Readiness | `/intelligence/readiness` | HR, Manager, Employee |
| NOTI-01 | Notification Center | `/notifications` | All authenticated |
| EVID-01 | Competency Evidence Portfolio | `/employees/{id}/evidence` | HR, Manager, Employee |
| AUDIT-01 | Audit Log | `/admin/audit-log` | Admin, HR |
| SETTING-01 | Notification Templates | `/admin/notification-templates` | Admin |

---

**Document Version**: v1.0
**Last Updated**: 2026-06-26
**Prepared for**: DigiTalent AI Frontend Implementation
**Related Documents**: UI/UX Design Specification, Information Architecture Document, Use Case Specification, API Specification
