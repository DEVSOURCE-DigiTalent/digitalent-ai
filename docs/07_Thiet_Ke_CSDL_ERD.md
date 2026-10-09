# 07 — Thiết Kế CSDL & ERD

> Nguồn gốc: Report 3 v2.3 §3.1.5 (35 conceptual entities). Logical/physical schema remains separate. Phiên bản tiếng Việt.

> **Baseline 09/10/2026 — ưu tiên khi có mâu thuẫn:** Repository copy is Report 3 v2.3, while the Master Overview cites v2.2. Use v2.3 for compatible conceptual ERD detail; the overview controls conflicts. The old physical-schema text is not authoritative and does not prove current database state. `GRADE-01` remains **PENDING DECISION**. The v2.3 statements for 1–3 storage, grade-raising Owner override and late submissions not scored conflict with the overview; do not infer columns, constraints or migrations from them. No Requirement weight, risk/readiness, Job Family/Job Grade, public registry or certificate expiry. QR is authenticated and same-organization.

> **Phân lớp thiết kế:** conceptual ERD theo Report 3 v2.3; logical/physical schema ở Report 4 sau khi chốt các pending decisions. File SQL cũ và các bảng/cột phía dưới không được xem là chuẩn thắng thế hoặc bằng chứng về trạng thái repository hiện tại. Không suy luận constraint hoặc migration từ tài liệu legacy.

---

## 1. Kiểm soát tài liệu

| Mục | Giá trị |
|-----|---------|
| Tên tài liệu | Thiết kế cơ sở dữ liệu & ERD |
| Phiên bản | 3.0 |
| Trạng thái | Bản nháp |
| Chủ sở hữu | Trần Văn Linh (Leader) |
| Căn cứ | Report 3 §3.1.5 |

**Lịch sử chỉnh sửa**

| Ngày | Phiên bản | Mô tả |
|------|-----------|-------|
| 16/09/2026 | 3.0 | Chuyển ngữ; chuẩn hóa **17 entity** theo 3-level (bỏ Career Grade) |
| 26/09/2026 | 3.1 | Thiết kế vật lý chuyển sang `docs/database/DigiTalent_AI_Canonical_v2_3.sql`; tài liệu này giữ vai trò khái niệm |

---

## 2. Mục đích và phạm vi

Thiết kế dữ liệu ở mức **entity quan hệ (ERD)** và **từ điển dữ liệu** đủ để tạo entity EF Core, lập migration và căn chỉnh API. DigiTalent AI dùng PostgreSQL 16 + EF Core 10.

**Ngoài phạm vi:** chi tiết SQL DDL, chiến lược migration/seed đầy đủ.

---

## 3. Tài liệu tham chiếu

- Report 3 §3.1.5 — Entity Relationship Diagram
- `06_Kien_Truc_He_Thong.md` — kiến trúc dữ liệu
- `00_INDEX_Tong_Quan_Tai_Lieu.md` §3.5

---

## 4. Nguyên tắc thiết kế

| Nguyên tắc | Diễn giải |
|-----------|-----------|
| Competency-first | Mọi luồng bắt đầu/kết thúc ở competency record |
| Level/Grade | 3 Level là nhóm đào tạo; bậc lưu trữ 1–6 theo Report 3 đang chờ GRADE-01 |
| Skill Gap | Lưu kết quả truy vết requirement/evidence; không có risk/readiness score hoặc trọng số |
| File ngoài DB | Metadata ở `file_objects`, bytes ở MinIO |
| Retire không xóa | Bản ghi nghiệp vụ đổi status, không xóa cứng (BR-11) |

---

## 5. Quy ước PostgreSQL + EF Core

| Hạng mục | Quy ước |
|----------|---------|
| Đặt tên bảng | `snake_case` số nhiều (`employees`) |
| Entity C# | `PascalCase` số ít (`Employee`) |
| Khóa chính | `id uuid PK` (gen app-side) |
| Cột chung | `created_at`, `updated_at` (timestamptz), `status` (varchar) |
| Score | `numeric(5,2)` / `numeric(6,2)` — tránh float |
| Weight | Không áp dụng cho Requirement Item trong baseline |
| Enum | `varchar(30/80)` + `HasConversion<string>()`; thêm CHECK constraint khi status ổn định |

---

## 6. Conceptual ERD entities (Report 3 v2.3 §3.1.5)

Report 3 v2.3 lists 35 conceptual entities in five readable ERD parts. The diagrams show entities and relationships only, not columns, keys or constraints. Report 4 owns the logical schema. The v2.3 change record and §5.4 state that competency levels are stored 1–3; this conflicts with the Master Overview's `GRADE-01 PENDING DECISION`. This document preserves the conceptual model but does not adopt that storage scale, constraints or migration implications until GRADE-01 is resolved.

| Part | Conceptual entities |
|---|---|
| 1. Organization, members and access | Organization; Department; Position; Member Profile; User Account; Invitation; Manager Assignment; Login Session; Audit Log |
| 2. TT02 framework, requirements, competency and gap | TT02 Version; Domain; Competency; Level Criteria; Requirement Set; Requirement Item; Confirmed Competency; Competency History; Skill Gap Result |
| 3. Learning content and assignment | Course; Module; Lesson; Course Version; Course Assignment; Learning Progress |
| 4. Assessment and certificate | Assessment; Assessment Version; Question; Assessment Attempt; Certificate |
| 5. Practical task, evidence and notification | Practical Task Template; Task Assignment; Submission; Review; Evidence Record; Notification |

The conceptual model excludes Job Family/Job Grade, risk/readiness scores and public certificate registry/expiry. Course Version and Assessment Version are explicit entities; assignments/attempts retain the versions used. The figures in Report 3 v2.3 are authoritative for conceptual relationships; this summary does not add physical schema detail.

### 6.1 Course recommendation and Practical Task evaluation semantics

- **Recommended Course** is a system-produced, explainable result from a Skill Gap competency and the competency coverage of a published standard course. It is distinct from **Course Assignment**: an employee may start learning from a recommendation, while an OWNER-created assignment is a separate, directed requirement for organizational updates or retraining. Whether recommendations are persisted or derived on read, their refresh/history policy, and how they relate to enrollment are **PENDING logical-schema decisions**.
- Practical Task submission, AI evaluation proposal, reviewer decision, and Confirmed Competency are separate concepts. AI evaluation, if included in approved scope, references the rubric version and authorized evidence; its result can include criterion proposals, numeric task score, rationale, evidence references, unmet criteria, and model/provider/version when available. Reviewer decision and human edits must be traceable.
- Numeric task score is not a competency grade/level. Only an approved reviewer decision may produce verified competency evidence and may update Confirmed Competency under the approved competency rules. AI output by itself, course completion, and course assessment do not confirm workplace competency.
- The conceptual model needs to support audit information for rubric version, AI proposal, evidence references, reviewer decision and amendments. This is a data requirement, not a finalized entity/table/column design; Report 4 must decide whether these are separate entities, immutable revisions, or another audited representation.
- For OWNER-directed course updates/retraining, whether reevaluation is assessment-only or also requires a Practical Task remains **PENDING DECISION**.

---

## 7. Logical and physical design boundary

The entity names above are conceptual, not table names. Report 4 must define primary/foreign keys, unique constraints, tenant scope, version snapshots, audit/history persistence, transaction boundaries and status constraints. Do not treat the legacy data dictionary in §8 as authoritative physical schema. In particular, do not derive a 1–3 grade constraint or migration while GRADE-01 is pending.

---

## 8. Từ điển dữ liệu legacy (không phải logical/physical schema)

### 8.1 Auth & RBAC

**users**

| Cột | Kiểu | Key/Null | Mô tả |
|-----|------|----------|-------|
| id | uuid | PK | Định danh người dùng |
| email | varchar(255) | UNIQUE, NOT NULL | Email đăng nhập, chuẩn hóa lower-case |
| password_hash | text | NULL | Hash mật khẩu (không lưu plaintext) |
| full_name | varchar(255) | NOT NULL | Tên hiển thị |
| status | varchar(30) | NOT NULL | ACTIVE, LOCKED, DISABLED, PENDING |
| failed_login_count | int | NOT NULL DEFAULT 0 | Chính sách khóa tài khoản |
| last_login_at | timestamptz | NULL | Lần đăng nhập cuối |
| created_at / updated_at | timestamptz | NOT NULL | Timestamp audit |

**roles** — `code` UNIQUE (`SYSTEM_ADMIN`, `HR_MANAGER`, `DEPT_MANAGER`, `TRAINER`, `EMPLOYEE`); `scope_type` (GLOBAL/DEPARTMENT/SELF/PUBLIC).

**permissions** — `code` UNIQUE (vd `course.create`, `employee.view.all`), `module`, `action`.

**user_roles / role_permissions** — bảng nối nhiều-nhiều, kèm `assigned_by`, `assigned_at`.

**refresh_tokens** — lưu `token_hash` (không lưu raw), `expires_at`, `revoked_at`, `replaced_by_token_id` (rotation).

### 8.2 Job Architecture & Organization

**job_families** — `code` UNIQUE, `name` (5 family), `description`, `display_order`, `is_active`.

**departments** — `parent_department_id` (cây), `manager_employee_id`, `code`, `name`, `status` (ACTIVE/INACTIVE/ARCHIVED).

**job_positions** — `job_family_id` NOT NULL, `code` UNIQUE, `title`, `esco_code`, `sfia_category_reference`, `status`.

**employees** — `user_id` (0..1, UNIQUE), `department_id` NOT NULL, `job_position_id` NOT NULL, `direct_manager_id`, `employee_code` UNIQUE, `full_name`, `email`, `employment_status`, `joined_at`.

> ⚠️ Report 3 gốc có `career_grade_id` + `grade_assigned_date` → **đã bỏ**. Tiêu chí "chưa đủ dữ liệu tính gap" giờ là **`job_position_id` NULL hoặc vị trí chưa có active requirement set** (BR-09).

### 8.3 Competency Framework

**competency_categories** — `code`, `name`, `sort_order`, `status`.

**competencies** — `category_id`, `competency_type` (CORE_DIGITAL/PROFESSIONAL/INTERNAL/BEHAVIOURAL), `framework_source` (DigComp 3.0), `framework_code` (vd `DC-2.1`), `code`, `name`, `status`.

> **Cập nhật 30/09/2026 — khung Thông tư 02/2025 (theo SQL v2.3, đã có migration `AddCompetencyFrameworkMappingsAndCoursePrerequisites`):**
>
> - **competency_frameworks** — `code` (vd `TT02_2025`), `version` (`02/2025/TT-BGDĐT`), `name`, `authority`, `jurisdiction`, `source_url`, `is_active`; UNIQUE (`code`, `version`).
> - **competency_framework_mappings** — `competency_id` → competencies, `framework_id` → competency_frameworks, `source_area_code` (miền 1–6), `source_code` (vd `4.2`), `source_name`, `source_level_text`, `relationship` CHECK ∈ {DIRECT, STRONG_OVERLAP, PARTIAL_OVERLAP}, `is_primary`, `mapping_note`, `reviewed_by_user_id`; UNIQUE (`competency_id`, `framework_id`, `source_code`). Bộ tiêu chuẩn vị trí chỉ kích hoạt được khi đủ 24 năng lực có mapping tới khung `TT02_2025` (D-B4).
> - **course_prerequisites** — PK (`course_id`, `prerequisite_course_id`), CHECK `course_id <> prerequisite_course_id`; dùng cho chuỗi khóa F → I → A và quy tắc gợi ý khóa bậc kế tiếp.

**competency_levels** — thang **3 mức duy nhất**:

| Mức | level_value | name |
|-----|-------------|------|
| 1 | 1 | Basic |
| 2 | 2 | Intermediate |
| 3 | 3 | Advanced |

> ⚠️ docs_v2 dùng `scale_type` (RESEARCH 5 mức / DISPLAY 3 mức) + `level_scale_mappings`. docs_v3 **gộp về một thang 3 mức**, bỏ `scale_type` và `level_scale_mappings`.

**position_requirement_sets** — `job_position_id` NOT NULL (**không còn `career_grade_id`**), `version_number`, `effective_date`, `review_date`, `is_current` (chỉ 1 active/position).

**position_competency_requirements** — `position_requirement_set_id`, `competency_id`, `required_level` (1–3), `weight` (numeric(5,2)), `is_mandatory`, `requires_practical_evidence`.

**employee_competency_profiles** — `employee_id`, `competency_id`, `confirmed_level` (1–3), `evidence_source`, `assessed_by`, `assessed_at`, `last_evidence_id`.

**competency_evidences** — `employee_id`, `competency_id`, `evidence_type` (ASSESSMENT/CERTIFICATE/TASK/MANAGER_REVIEW/MANUAL), `source_entity_type`, `source_entity_id`, `confirmed_level_value`, `verified_by_user_id`, `status` (PENDING/VERIFIED/REJECTED/SUPERSEDED).

### 8.4 Learning Management

**courses** — `code`, `title`, `difficulty_level`, `owner_trainer_id`, `passing_score`, `status` (DRAFT/PUBLISHED/ARCHIVED).

**course_modules / lessons / learning_materials** — cấu trúc course → module → lesson → material; `is_required` (material bắt buộc).

**course_competencies** — `course_id`, `competency_id`, `target_level_value`, `coverage_weight`.

**enrollments** — `employee_id`, `course_id`, `status` (ASSIGNED/IN_PROGRESS/COMPLETED/FAILED/OVERDUE/CANCELLED), `due_date`, `assign_reason`.

**lesson_progress** — `enrollment_id`, `lesson_id`, `status` (NOT_STARTED/IN_PROGRESS/COMPLETED).

### 8.5 Assessment

**questions** — `type` (MCQ/TRUE_FALSE), `competency_id`, `difficulty`, `is_ai_drafted` (flag, phải duyệt).

**assessments** — `course_id`, `is_final`, `pass_score`, `time_limit_minutes`, `max_attempts`.

**assessment_questions** — `assessment_id`, `question_id`, `points`, `sort_order`.

**assessment_attempts** — `enrollment_id`, `assessment_id`, `status` (STARTED/SUBMITTED/SCORED/PASSED/FAILED), `score`, `started_at`, `submitted_at`.

**attempt_answers** — `attempt_id`, `question_id`, `selected_option`, `is_correct`.

### 8.6 Certificate

**certificates** — `employee_id`, `course_id`, `competency_id`, `code` UNIQUE, `verification_url`, `qr_image`, `pdf_object_id`, `issued_at`, `expires_at`, `status` (VALID/EXPIRED/REVOKED), `revoked_reason`.

**certificate_verification_logs** — `certificate_id`, `result`, `hashed_requester_address`, `checked_at`.

### 8.7 WMS-lite

**task_templates** — `title`, `expected_output`, `marking_criteria`, `is_ai_drafted`.

**task_assignments** — `template_id` (NULL nếu ad hoc), `employee_id`, `due_date`, `reviewer_id`, `status` (DRAFT/ASSIGNED/IN_PROGRESS/SUBMITTED/EVALUATED/CLOSED).

**task_submissions** — `assignment_id`, `note`, `file_object_id`, `external_url`, `version_number`, `submitted_at`, `is_late`, `status` (SUBMITTED/SUPERSEDED).

**task_evaluations** — `submission_id`, `score`, `verdict` (PASSED/NEEDS_REVISION/FAILED), `counts_as_evidence`, `confirmed_level`, `feedback`.

### 8.8 Intelligence & Scoring

**skill_gap_snapshots** — `employee_id`, `competency_id`, `required_level`, `confirmed_level`, `gap`, `priority`, `requirement_version_id`, `run_number`, `calculated_at`.

**training_risk_scores** — `employee_id`, `score`, `band`, `factor_breakdown` (JSONB), `weight_version_id`, `calculated_at`.

**readiness_scores** — `employee_id`, `score`, `band`, `factor_breakdown` (JSONB), `weight_version_id`, `calculated_at`.

**scoring_configs** — `config_key` (risk/readiness/recommendation weights), `version_number`, `config_json`, `is_active` (một active/key — BR-08).

### 8.9 File & Notification

**file_objects** — `object_key`, `file_name`, `mime_type`, `size_bytes`, `owner_id`, `entity_type`, `entity_id`, `access_policy`.

**notifications** — `recipient_id`, `type`, `message`, `entity_type`, `entity_id`, `is_read`, `created_at`.

**audit_logs** — `actor_id`, `action`, `entity_type`, `entity_id`, `before_value` (JSONB), `after_value` (JSONB), `ip_address`, `created_at` (chỉ-thêm).

---

## 9. Quy tắc nghiệp vụ & toàn vẹn dữ liệu

| BR | Ràng buộc dữ liệu |
|----|-------------------|
| BR-01 | Gap đo theo active requirement set của position; snapshot ghi `requirement_version_id` |
| BR-02 | `position_requirement_sets.status` chỉ DRAFT → ACTIVE → ARCHIVED |
| BR-03 | Một active set/position; kích hoạt mới archive cũ cùng transaction |
| BR-04 | Chỉ reviewer decision hợp lệ đã được approve mới có thể tạo verified competency evidence; AI proposal không tự sinh evidence được xác nhận |
| BR-05 | `employee_competency_profiles.confirmed_level` không hạ nếu không override + audit |
| BR-06 | Certificate chỉ tạo khi có attempt PASSED của final assessment |
| BR-08 | `scoring_configs` một active/key |
| BR-09 | No position or no Active Requirement Set → Not Assessed; do not infer Gap |
| BR-11 | Bản ghi nghiệp vụ đổi status, không DELETE |
| BR-12 | Scope department ở tầng query, không chỉ ẩn menu |
| BR-13 | Course recommendation và directed course assignment là hai khái niệm riêng; course assessment và numeric task score không tự cập nhật Confirmed Competency |

---

## 10. Mô hình trạng thái & enum

| Entity | Luồng trạng thái |
|--------|------------------|
| course | DRAFT → PUBLISHED → ARCHIVED |
| enrollment | ASSIGNED → IN_PROGRESS → COMPLETED/FAILED/OVERDUE/CANCELLED |
| assessment_attempt | STARTED → SUBMITTED → SCORED → PASSED/FAILED |
| certificate | VALID → EXPIRED/REVOKED |
| task_assignment | DRAFT → ASSIGNED → IN_PROGRESS → SUBMITTED → EVALUATED → CLOSED; nếu có AI thì proposal chưa phải reviewer decision |
| competency_evidence | PENDING → VERIFIED/REJECTED/SUPERSEDED |
| position_requirement_set | DRAFT → ACTIVE → ARCHIVED |

---

## 11. Indexing & hiệu năng

- Index trên mọi FK; unique trên `email`, `employee_code`, `code` (theo scope).
- Index `(employee_id, calculated_at DESC)` trên snapshot/score để xem lịch sử.
- `certificate_verification_logs(certificate_id, checked_at)` cho rate-limit và tra cứu.
- Skill Gap result/run records should expose calculation status and freshness; no readiness snapshot is in MVP scope.

---

## 12. Ma trận vết

| Nhóm bảng | UC liên quan | File liên quan |
|-----------|--------------|----------------|
| Auth & RBAC | UC-01..13 | 09, 15 |
| Organization | UC-18, 19 | 04 |
| Competency | UC-14..22 | 16 |
| Learning | UC-24, 35, 41, 42 | 04 |
| Assessment | UC-36..38, 43 | 04 |
| Certificate | UC-27, 45, 46 | 15 |
| WMS-lite | UC-30..33, 44 | 04 |
| Intelligence | NF-01..03 | 16 |
