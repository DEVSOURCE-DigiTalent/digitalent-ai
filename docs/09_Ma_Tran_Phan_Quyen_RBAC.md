# 09 — Ma Trận Phân Quyền RBAC

> Nguồn gốc: Report 3 v2.3 §2.1 and §3.1.3. Permission-key list retained from earlier draft is marked legacy and unverified.

> **Baseline 09/10/2026:** The repository contains Report 3 v2.3, while the Master Overview cites v2.2. Use v2.3 for compatible role scope and 42-screen authorization. The overview controls conflicts: GRADE-01 pending; OWNER correction decrease/reset only with reason/audit and no-self; late submission remains reviewable. The v2.3 storage-scale, grade-raising override and late-not-scored statements are not adopted. Permission keys below are legacy proposals, not verified implementation.

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
| 09/10/2026 | 3.2 | Đồng bộ baseline Enterprise 4 role; authenticated same-org QR; platform-owned standard content |

---

## 2. Mục đích và phạm vi

Đặc tả mục tiêu cho mô hình RBAC bốn vai trò, ma trận màn hình và data scope. Permission key/implementation cần đối chiếu source trước khi xem là hiện trạng.

**Ngoài phạm vi:** chi tiết bảo mật (15).

---

## 3. Tài liệu tham chiếu

- Report 3 §3.1.3 — Screen Authorization
- `backend/src/DigiTalent.Domain/Constants/Authorization/Permissions.cs` — mã quyền (thêm dần theo module; mục 6 là danh sách đích)
- `backend/src/DigiTalent.Domain/Constants/Authorization/RolePermissions.cs` — ma trận **mặc định** dùng để seed
- `docs/database/DigiTalent_AI_Canonical_v2_3.sql` — bảng `roles`, `user_roles`, `permissions`, `role_permissions`
- `hooks/use-permission.ts` (frontend mirror)

**Ghi chú hiện trạng:** các câu về role seeding, database-backed permission lookup và `SYSTEM_ADMIN` bypass là mô tả legacy chưa xác minh; không thay thế baseline 4 role hoặc scope policy đầu tài liệu.
- `00_INDEX` §3.2

---

## 4. Mô hình vai trò

| Vai trò | Hằng số | Phạm vi dữ liệu (scope) | Mô tả |
|---------|---------|-------------------------|-------|
| PLATFORM_ADMIN | `PLATFORM_ADMIN` | Platform modules | Quản lý reference framework và standard learning content |
| OWNER | `OWNER` | Organization | Quản trị organization; quản lý yêu cầu; giao khóa học khi có cập nhật/đào tạo lại; theo dõi tiến độ; giao Practical Task và review trong phạm vi tổ chức |
| MANAGER | `MANAGER` | Assigned departments | Xem team trong phạm vi được giao; giao và review Practical Task theo phạm vi; không giao standard course trong baseline này |
| EMPLOYEE | `EMPLOYEE` | Self | Xem Recommended Course và bắt đầu học; hoàn thành course được giao; làm assessment; xem hồ sơ và nộp evidence |

> QR verification is an authenticated OWNER/MANAGER flow constrained to the issuing organization. No public route or implicit administrator bypass is specified by this baseline.

---

## 5. Ma trận phân quyền màn hình (Report 3 v2.3 §3.1.3)

Report 3 v2.3 defines access for the 42 screens listed in `10_Dac_Ta_UI_UX.md`. Shared screens 1–8 are available to all signed-in roles. Platform Admin has screens 9–17; Owner has organization screens 18–31 and screen 34; Manager has screens 32–34 and scoped access to Owner screens 23–31 as specified in the report; Employee has screens 35–41; certificate verification (screen 42) is available to Owner and Manager.

`scoped` means limited to the Manager's assigned departments; `view` means read-only. Owner access is limited to the organization, Manager access to assigned departments, and Employee access to their own records. Platform Admin has no default access to private organization evidence or submissions. The server enforces scope on each request; frontend menu visibility is not an authorization control.

---

## 6. Danh mục permission key (legacy proposal; implementation chưa xác minh)

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

## 7. Gán vai trò → quyền (ma trận năng lực mục tiêu; permission keys vẫn là legacy proposal)

| Nhóm năng lực | PLATFORM_ADMIN | OWNER | MANAGER | EMPLOYEE |
|----------------|:---:|:---:|:---:|:---:|
| Quản trị standard content / TT02 reference | ✓ | — | — | — |
| Quản trị organization, members, positions, requirements | — | organization | — | — |
| Đọc Skill Gap / competency history | platform reference only | organization | assigned departments | own |
| Xem và bắt đầu Recommended Course | — | — | — | own |
| Tạo Assigned Course cho update/retraining | — | organization | — | — |
| Theo dõi learning progress | — | organization | assigned departments as scoped read | own |
| Làm course assessment | — | — | — | own |
| Giao / review Practical Task | — | organization | assigned departments | — |
| Nộp Practical Task evidence | — | — | — | own |
| Review certificate QR | — | same issuing org | same issuing org | — |

> Permission key cụ thể vẫn là proposal, chưa xác minh/đóng băng. Các key legacy như `certificate.verify_public`, Trainer access, risk/readiness, hoặc SignalR không biểu thị quyền thuộc baseline hiện hành. Recommendation không phải assignment bắt buộc. Quyền OWNER tạo course assignment không tự cấp cho PLATFORM_ADMIN hoặc MANAGER.

Trong Practical Task review, AI (nếu được bật theo scope đã duyệt) chỉ trả assessment proposal có căn cứ theo rubric. OWNER/MANAGER có quyền theo data scope để xác nhận, điều chỉnh, từ chối hoặc yêu cầu bổ sung evidence. Chỉ reviewer decision đã approve mới có thể dẫn tới cập nhật Confirmed Competency; numeric task score không phải competency grade. Model/version, rubric version, evidence references, proposal, reviewer decision và edits cần truy vết, nhưng permission keys và endpoint cụ thể chưa được chốt.

OWNER-directed course update/retraining reevaluation remains **PENDING DECISION**: course assessment only, or course assessment plus Practical Task. Không mặc định cấp thêm quyền/luồng cho đến khi quyết định được ghi vào baseline.

---

## 8. Quy tắc data scope (bắt buộc ở server; mục tiêu baseline)

| Quy tắc | Áp dụng |
|---------|---------|
| Platform scope | PLATFORM_ADMIN — reference framework và standard content; không mặc định đọc evidence riêng tư của tổ chức |
| Organization scope | OWNER — dữ liệu của tổ chức |
| Department scope | MANAGER — chỉ phòng ban được giao (BR-12) |
| Self scope | EMPLOYEE — dữ liệu cá nhân; recommendation/read/start only for self |

> Scope áp ở **server**, không phải ẩn menu — kể cả request build bằng tay cũng bị từ chối. Tên helper/service implementation nêu trong tài liệu legacy chưa được xác minh. AI evaluator phải chỉ nhận evidence mà reviewer có quyền truy cập.

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
