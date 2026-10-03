# 09 — Ma Trận Phân Quyền RBAC

> Nguồn gốc: Report 3 §3.1.3 (screen authorization) + `PermissionConstants.cs` (code thực tế). Phiên bản docs_v3, tiếng Việt.

---

## 1. Kiểm soát tài liệu

| Mục | Giá trị |
|-----|---------|
| Tên tài liệu | Ma trận phân quyền RBAC |
| Phiên bản | 3.0 |
| Trạng thái | Bản nháp |
| Chủ sở hữu | Trần Văn Linh (Leader) |
| Căn cứ | Report 3 §3.1.3 + `PermissionConstants.cs` |

**Lịch sử chỉnh sửa**

| Ngày | Phiên bản | Mô tả |
|------|-----------|-------|
| 16/09/2026 | 3.0 | Chuyển ngữ; ma trận theo 5 vai trò + public verify |
| 26/09/2026 | 3.1 | Chốt: đúng 5 role (bỏ `CERTIFICATE_VERIFIER` — verify là public); ma trận lưu trong database; mã quyền ở `Domain/Constants/Authorization/Permissions.cs` |

---

## 2. Mục đích và phạm vi

Đặc tả mô hình phân quyền **Role-Based Access Control (RBAC)**: 5 vai trò đăng nhập, ma trận màn hình, danh sách permission key (mirror `PermissionConstants` backend) và quy tắc data scope. Đây là **nguồn sự thật** cho cả backend (`[HasPermission]`) lẫn frontend (`RequirePermission`).

**Ngoài phạm vi:** chi tiết bảo mật (15).

---

## 3. Tài liệu tham chiếu

- Report 3 §3.1.3 — Screen Authorization
- `backend/src/DigiTalent.Domain/Constants/Authorization/Permissions.cs` — mã quyền (thêm dần theo module; mục 6 là danh sách đích)
- `backend/src/DigiTalent.Domain/Constants/Authorization/RolePermissions.cs` — ma trận **mặc định** dùng để seed
- `docs/database/DigiTalent_AI_Canonical_v2_3.sql` — bảng `roles`, `user_roles`, `permissions`, `role_permissions`
- `hooks/use-permission.ts` (frontend mirror)

**Cách lưu trữ (chốt 26/09/2026):** role và quyền nằm trong database. Lúc chạy, `[HasPermission]` tra bảng `role_permissions` (qua `IPermissionService`); `SYSTEM_ADMIN` luôn qua. Seeder chỉ **thêm** mã/cặp còn thiếu, không ghi đè ma trận admin đã chỉnh trên màn `permission.manage`. Không có role riêng cho xác minh chứng chỉ.
- `00_INDEX` §3.2

---

## 4. Mô hình vai trò

| Vai trò | Hằng số | Phạm vi dữ liệu (scope) | Mô tả |
|---------|---------|-------------------------|-------|
| System Administrator | `SYSTEM_ADMIN` | GLOBAL | Tài khoản, quyền, master data, cấu hình, audit |
| HR / Training Manager | `HR_MANAGER` | ORGANIZATION | Quản trị năng lực toàn công ty |
| Department Manager | `DEPARTMENT_MANAGER` | DEPARTMENT | Chỉ phòng ban mình quản lý |
| Internal Trainer | `TRAINER` | SELF (course của mình) | Nội dung học + đánh giá |
| Employee | `EMPLOYEE` | SELF | Học, thi, nộp bằng chứng |
| Public Visitor | *(không đăng nhập)* | PUBLIC | Chỉ xác minh chứng chỉ công khai |

> **Ghi chú:** Public Visitor **không phải vai trò hệ thống** — xác minh chứng chỉ là endpoint công khai, không auth. `SYSTEM_ADMIN` luôn vượt qua mọi kiểm tra `can()`.

---

## 5. Ma trận phân quyền màn hình (Report 3 §3.1.3)

> ✓ = role mở được màn hình. Đến màn hình **không** đồng nghĩa thấy mọi record — Department Manager chỉ thấy phòng ban mình, Employee chỉ thấy bản thân (scope áp ở server, không phải ẩn menu).

| Màn hình | Admin | HR | Dept Mgr | Trainer | Employee | Public |
|----------|:---:|:--:|:---:|:---:|:--:|:--:|
| Login / Forgot / 403 / 404 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Profile & Security Settings | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Notification Center | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| User Account Management | ✓ | — | — | — | — | — |
| RBAC Permission Matrix | ✓ | — | — | — | — | — |
| System Settings & Level Mapping | ✓ | — | — | — | — | — |
| Audit Logs | ✓ | — | — | — | — | — |
| Capability Executive Dashboard | ✓ | ✓ | — | — | — | — |
| Job Families / Career Grades† / Job Positions / Requirement Editor | ✓ | ✓ | — | — | — | — |
| Departments / Employee Roster | ✓ | ✓ | — | — | — | — |
| Competency Library / Level Criteria | ✓ | ✓ | — | view | — | — |
| Course Assignment & Tracking | ✓ | ✓ | — | — | — | — |
| Capability Analytics & Gap Heatmap | ✓ | ✓ | — | — | — | — |
| Employee Capability History | ✓ | ✓ | — | — | — | — |
| Certificate Registry | ✓ | ✓ | — | — | — | — |
| Department Capability Dashboard | — | — | ✓ | — | — | — |
| Team Skill Gap Matrix | — | — | ✓ | — | — | — |
| Practical Task Assignment / Template Library | — | — | ✓ | — | — | — |
| Submission Review & Evidence Approval | — | — | ✓ | — | — | — |
| Team Evidence Portfolio | — | — | ✓ | — | — | — |
| Trainer Dashboard | — | — | — | ✓ | — | — |
| Course & Lesson Builder / Question Bank / Assessment Setup / Learner Results | — | — | — | ✓ | — | — |
| My Learning Dashboard | — | — | — | — | ✓ | — |
| My Competency Profile & Gap / My Courses / Course Player / Assessment Interface / My Tasks / My Certificates | — | — | — | — | ✓ | — |
| Certificate Verification / Invalid / Rate Limit | — | — | — | — | — | ✓ |

> † **Career Grades Management** (màn hình 13) **đã gỡ** theo chỉ đạo 3-level — xem `00_INDEX` §3.1.3.

---

## 6. Danh mục permission key (mirror `PermissionConstants`)

> Nguồn sự thật backend. Frontend mirror ở `hooks/use-permission.ts`. Mỗi endpoint gắn `[HasPermission(PermissionConstants.X)]`.

### 6.1 Auth & Account

`auth.login`, `auth.refresh_token`, `auth.logout`, `account.view_own`, `account.update_own_profile`, `account.change_own_password`, `account.reset_password_for_user`

### 6.2 User & Role (Admin)

`user.read`, `user.create`, `user.update`, `user.lock_unlock`, `role.read`, `role.assign_business`, `permission.read`, `permission.manage`

### 6.3 Organization

`department.read`, `department.create_update`, `job_position.read`, `job_position.create_update`, `employee.read`, `employee.create_update`, `employee.transfer`, `employee.archive_restore`, `manager_assignment.manage`

### 6.4 Competency

`competency_category.read`, `competency_category.manage`, `competency.read`, `competency.manage`, `position_requirement.read`, `position_requirement.manage`, `employee_competency_profile.read`, `employee_competency_profile.override`, `evidence.read`, `evidence.create_manual`, `evidence.approve_confirm`, `evidence.revoke`

### 6.5 Learning

`course.read_catalog`, `course.create`, `course.update`, `course.publish_unpublish`, `course.archive`, `course_competency.manage`, `material.upload`, `material.download_view`, `material.delete_archive`, `course_assignment.create`, `course_assignment.read`, `course_assignment.cancel`, `learning_progress.read`, `lesson.complete`

### 6.6 Assessment

`question_bank.read`, `question.create_update`, `question.ai_generate_draft`, `question.approve_publish`, `assessment.read`, `assessment.create_update`, `assessment.publish_close`, `attempt.start`, `attempt.submit`, `attempt.read_result`, `attempt.regrade_override`, `assessment_result.export`

### 6.7 Certificate

`certificate_template.manage`, `certificate.issue_auto`, `certificate.issue_manual`, `certificate.read`, `certificate.download_pdf`, `certificate.verify_public`, `certificate.revoke`, `certificate.renew`, `certificate_verification_log.read`

### 6.8 Intelligence & Scoring

`skill_gap.calculate`, `skill_gap.read`, `learning_recommendation.generate`, `learning_recommendation.read`, `training_risk.calculate`, `training_risk.read`, `readiness.calculate`, `readiness.read`, `career_readiness.read`, `ai_explanation.read`, `scoring_config.manage`, `ai_prompt_template.manage`

### 6.9 Task (WMS-lite)

`task_suggestion.generate`, `task.create`, `task.assign`, `task.read`, `task.update_progress`, `task.submit`, `task.evaluate`, `task.reopen`, `task.cancel`, `task_attachment.download`

### 6.10 Dashboard & Notification

`dashboard.hr_company.read`, `dashboard.department.read`, `dashboard.trainer.read`, `dashboard.employee.read`, `report.export`, `competency_heatmap.read`, `notification.read_own`, `notification.mark_read`, `notification.send`, `notification_template.manage`, `signalr.connect`

### 6.11 File & Audit & Config

`file.upload_material`, `file.upload_task_submission`, `file.download_authorized`, `file.delete_archive`, `audit_log.read_system`, `audit_log.read_department`, `system_config.manage`, `business_config.manage`, `master_data.manage`

---

## 7. Gán vai trò → quyền (tóm tắt)

| Nhóm module | Admin | HR | Dept Mgr | Trainer | Employee |
|-------------|:---:|:--:|:---:|:---:|:--:|
| Auth / Account (own) | ✓ | ✓ | ✓ | ✓ | ✓ |
| User/Role/Config/Audit (system) | ✓ | — | — | — | — |
| Organization (department/position/employee) | ✓ | ✓ | — | — | — |
| Competency & Requirement | ✓ | ✓ | — | view | — |
| Course authoring | — | — | — | ✓ | — |
| Course assignment | ✓ | ✓ | — | — | — |
| Assessment setup | — | — | — | ✓ | — |
| Attempt (start/submit) | — | — | — | — | ✓ |
| Certificate (issue/revoke) | ✓ | ✓ | — | — | — |
| Certificate (read own / download) | — | — | — | — | ✓ |
| Skill gap / readiness (read) | ✓ | ✓ | dept | — | own |
| Task (assign/evaluate) | — | — | ✓ | — | — |
| Task (submit) | — | — | — | — | ✓ |
| Dashboard | ✓ | company | dept | own | own |

---

## 8. Quy tắc data scope (bắt buộc ở server)

| Quy tắc | Áp dụng |
|---------|---------|
| `EnsureGlobalAccess` | Admin/HR — toàn công ty |
| `EnsureDepartmentAccess` | Department Manager — chỉ phòng ban đang quản lý (BR-12) |
| `EnsureOwnership` | Employee — chỉ bản thân |
| `EnsureTrainerAccess` | Trainer — chỉ khóa học mình viết |

> Scope áp ở **server** (qua `ResourceScopeAuthorizationService`), không phải ẩn menu — kể cả request build bằng tay cũng bị từ chối.

---

## 9. Ma trận vết

| RBAC hạng mục | UC liên quan | File liên quan |
|----------------|--------------|----------------|
| Auth & Account | UC-01..06 | 15 |
| User/Role/Permission | UC-08, 09 | 15 |
| Org & Employee | UC-18, 19 | 04 |
| Competency & Requirement | UC-14..22 | 04 |
| Learning & Assessment | UC-24, 35..43 | 04 |
| Certificate | UC-27, 45, 46 | 15 |
| Intelligence | UC-23, 25, 26, 28, 29, 40 | 16 |
| Task | UC-30..33, 44 | 04 |
