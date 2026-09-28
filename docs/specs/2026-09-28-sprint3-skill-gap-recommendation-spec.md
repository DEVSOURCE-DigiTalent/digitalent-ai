# Sprint 3 Spec — Skill Gap Engine, Course Recommendation & Domain Events

| Thuộc tính | Giá trị |
| --- | --- |
| Phiên bản | 1.0 (đề xuất, chờ review) |
| Ngày | 28/09/2026 |
| Tác giả | LinhTV |
| Jira | DT-192 (S3-T002), DT-194 (S3-T003) — tài liệu này là sản phẩm bàn giao của 2 task |
| Reviewer | QuyTD (AC + test matrix), HoangNT (thuật toán + kiến trúc) |
| Phạm vi code | DT-210 (T015), DT-211 (T016), DT-212 (T017), DT-213 (T018), DT-216 (T020), DT-222 (T024) |
| Nguồn chuẩn | `docs/database/DigiTalent_AI_Canonical_v2_3.sql`, `docs/16_Thiet_Ke_Cham_Diem_AI_Rule.md`, `docs/09_Ma_Tran_Phan_Quyen_RBAC.md` |
| Plan thực thi | `docs/superpowers/plans/2026-09-28-sprint3-skill-gap-engine.md` |

---

## 1. Mục tiêu

1. HR / Department Manager tính được **khoảng trống năng lực** (skill gap) của nhân viên so với bộ tiêu chuẩn đang hiệu lực của vị trí, lưu thành **snapshot không ghi đè**.
2. Nhân viên xem được skill gap của mình (radar + bảng + KPI) và nhận **danh sách khóa học gợi ý có lý do giải thích được**.
3. Khi cấp độ năng lực được xác nhận hoặc tiêu chuẩn vị trí thay đổi, hệ thống **tự tính lại** skill gap (domain event), không cần HR bấm tay.
4. Mọi con số truy vết được: công thức cố định theo `calculation_version`, tham số lưu kèm snapshot (BR-08).

**Ngoài phạm vi Sprint 3:** Training Risk (NF-02), Workforce Readiness (NF-03), heatmap toàn công ty, skill gap lưu DB cho người học tự do, chấm bài thực hành (Sprint 4).

---

## 2. Hiện trạng hệ thống (đã kiểm tra 28/09/2026)

| Hạng mục | Trạng thái |
| --- | --- |
| Entity + EF configuration + DbSet (cả `AppDbContext` và `IApplicationDbContext`) | Đủ 60 bảng |
| Migration | **Chỉ 19 bảng** (Auth, Org, Competency, Position Requirement, LearnerProfile). `skill_gap_*`, `employee_competency_profiles`, `competency_evidences`, `courses`, `course_competencies`, `enrollments`, `assessments`, `scoring_configs`, `notifications`… **chưa có trong DB** |
| Permission keys | Đã có đủ `skill_gap.*`, `learning_recommendation.*`, `evidence.*`, `employee_competency_profile.*`; ma trận role đã seed; FE `PERMISSIONS` đã mirror |
| Use case Course / Assessment / Intelligence | Chưa có |
| Hạ tầng dùng lại được | `ICurrentUser` (có `EmployeeId`, `DepartmentId`), `INotificationSender` (SignalR), `IAuditService`, Scrutor auto-register use case + validator decorator |
| FE | `SkillGapPage`, `MyCompetencyProfilePage` là trang trống; route `/enterprise/intelligence/skill-gap` đã guard `skill_gap.read`; chưa cài `recharts`; vitest + testing-library đã có |
| Seed | Chỉ có org, role, permission, phòng OPS, 5 tài khoản. **Không có** competency, vị trí, requirement set, khóa học → không demo được nếu không seed thêm |
| Test | 47 unit test pass; 14 integration test cần `DIGITALENT_TEST_POSTGRES_CONNECTION` (CI đã cấu hình Postgres, local chưa) |
| Nợ Sprint 2 | Activate requirement set **không kiểm tra tổng trọng số = 100%** dù DoD S2-T014 ghi có |
| Lệch schema | `learner_profiles`, `job_positions.career_role_template_id` đã có migration nhưng **chưa có trong SQL canonical** |

---

## 3. Quyết định thiết kế (Decision Log)

Nguyên tắc chọn: (1) không phá schema v2.3 khi không bắt buộc; (2) bám `docs/16`; (3) tái dùng cơ chế đã có trong code; (4) ưu tiên phương án demo được trong Sprint 3 mà không chờ module của người khác.

| ID | Vấn đề | Quyết định | Lý do |
| --- | --- | --- | --- |
| **D-S3-01** | Mức nghiêm trọng: S3-T015 ghi `CRITICAL/HIGH/MEDIUM/MET`, SQL chỉ cho `LOW/MEDIUM/HIGH`/NULL | **Giữ SQL.** `severity ∈ {HIGH, MEDIUM, LOW}` khi gap > 0; **NULL khi đã đạt** (FE hiển thị "Đạt"). Quy tắc ở §4.3 | Khớp CHECK `ck_skill_gap_items_severity`, khớp docs/16 §6.2 và S3-T003; không phải sửa SQL/Report 4 |
| **D-S3-02** | Chưa có cấp độ xác nhận | Lưu `current_level = NULL`; khi tính coi là 0 | CHECK `ck_gap_current_level` chỉ cho 1–3 hoặc NULL |
| **D-S3-03** | Priority: T003 dùng weight thô, T015 chia 100 | `priority = gap × weight_percent × (mandatory ? k : 1)`, **weight thô (0–100)** | Đúng docs/16 §6.2; giá trị tối đa 3×100×1.5 = 450 vừa `numeric(8,2)`; tránh mất chính xác khi làm tròn 2 chữ số (chia 100 → 0.125 bị làm tròn thành 0.13) |
| **D-S3-04** | Hệ số k và ngưỡng không được hard-code (docs/16 §4) nhưng `scoring_configs.config_type` không có loại cho skill gap | Đọc từ `system_settings` key `intelligence.skill_gap` (ưu tiên org → global → mặc định trong code `k = 1.5`, `mediumWeightThreshold = 20`). Tham số đã dùng lưu vào `summary_snapshot.config`; `calculation_version = "SG-1.0"` | Không đổi schema; mỗi snapshot tự giải thích được (BR-08) |
| **D-S3-05** | "Readiness index" trong T015 trùng tên với NF-03 Readiness Score (bảng `readiness_scores`, Sprint sau) | Đổi tên KPI thành **`coveragePercent` — Mức đáp ứng chuẩn vị trí**, công thức §4.4 | Tránh hai con số "readiness" khác nhau trên UI; coverage sẽ là 1 factor của NF-03 sau này |
| **D-S3-06** | Phạm vi dữ liệu | HR / Admin: toàn tổ chức. Department Manager: nhân viên **cùng `department_id`** (chưa tính phòng con — để Sprint 5). Employee/Trainer: chỉ bản thân. Ngoài phạm vi → **404** (giống lỗi không tồn tại) | Không lộ sự tồn tại của dữ liệu; khớp cách cô lập tenant hiện có; Sprint 5 đã có task data scoping đa phòng ban |
| **D-S3-07** | Snapshot | Mỗi lần tính **insert run mới**, không update run cũ. `generated_by = USER_REQUEST` (gọi API) hoặc `SYSTEM` (event). Chỉ tính cho employee `ACTIVE` | docs/16 §4 "Snapshot không ghi đè"; CHECK `ck_skill_gap_runs_generated_by` |
| **D-S3-08** ✅ *Đã chốt 28/09 (LinhTV — Team Leader)* | S3-T018 muốn "đỗ bài thi → nâng `confirmed_level`", nhưng profile chỉ được xác nhận qua `competency_evidences` với `source_type ∈ {PRACTICAL_TASK, MANUAL_OVERRIDE, MIGRATION}` và không có bảng ánh xạ bài thi ↔ năng lực | **Bài thi trắc nghiệm KHÔNG xác nhận cấp độ năng lực.** T018 đổi phạm vi thành: tự tính lại skill gap khi (a) cấp độ năng lực được xác nhận, (b) kích hoạt bộ tiêu chuẩn mới, (c) nhân viên đổi vị trí. Bổ sung API **ghi nhận bằng chứng thủ công** (`MANUAL_OVERRIDE`) cho HR để có nguồn dữ liệu thật trong Sprint 3 | Giữ đúng mô hình "đánh giá qua công việc thực tế" của đề tài (quiz đo hiểu biết, task thực hành mới xác nhận năng lực) — đây cũng là điểm dễ bị hội đồng hỏi; không cần sửa schema; Sprint 4 (chấm task) chỉ cần phát cùng một event |
| **D-S3-09** | Cơ chế domain event: T018 nhắc MediatR, dự án chưa dùng | Tự viết dispatcher tối giản (≈100 dòng): `IDomainEventQueue.Raise()` trong use case → `AppDbContext.SaveChangesAsync` lưu thay đổi chính, chạy handler, lưu tiếp, **commit một transaction**; tác vụ SignalR chạy **sau commit** qua `IAfterCommitQueue` | Không thêm dependency; đảm bảo profile và snapshot nhất quán (cùng transaction); lỗi gửi thông báo không làm hỏng nghiệp vụ |
| **D-S3-10** | Gợi ý khóa học: SQL không có bảng lưu gợi ý; T017 có `POST /generate` | **Tính trực tiếp (stateless)** từ snapshot skill gap mới nhất; chỉ có `GET`. Trọng số xếp hạng lấy từ `scoring_configs` loại `RECOMMENDATION_WEIGHTS`, tổng = 100%. Công thức §5 | Không đổi schema; kết quả luôn khớp snapshot mới nhất; `learning_recommendation.generate` để dành khi cần lưu lịch sử gợi ý |
| **D-S3-11** | Nợ S2: tổng trọng số | Kiểm tra `Σ weight_percent = 100.00` **khi Activate** (bản nháp được phép chưa đủ 100) | Công thức priority/coverage giả định tổng = 100; HR vẫn lưu nháp dần được |
| **D-S3-12** | Tuyến người học cá nhân `/learn` | Sprint 3 **chỉ tái sử dụng component** (radar, bảng gap) với dữ liệu minh họa, gắn nhãn "Dữ liệu minh họa". Skill gap thật cho learner chờ migration `AddPublicLearnerAndCatalogTables` (đã được hoãn trong `learner-identity-catalog-contract.md`) | `skill_gap_runs.employee_id` NOT NULL; `career_role_templates` chưa tồn tại |
| **D-S3-13** | S3-T024: `assessments` không có cột cooldown / hiển thị đáp án | Nâng SQL lên **v2.4**: thêm `retry_cooldown_minutes`, `answer_review_policy` (§7). Viết policy thuần + test; tích hợp vào use case làm bài khi engine thi của team sẵn sàng | Tuân thủ schema-first; tách phần LinhTV làm được khỏi phần phụ thuộc người khác |
| **D-S3-14** | `position_requirement_items.requires_practical_evidence` | Sprint 3 **không dùng** cờ này khi tính gap: `employee_competency_profiles` là nguồn sự thật duy nhất | Profile chỉ được ghi qua evidence đã xác nhận bởi người có quyền; cờ này dành cho Readiness (Sprint sau) |
| **D-S3-15** ✅ *Đã chốt 28/09* | Chiến lược migration — 41 config Phase 2–3 hóa ra chỉ là khung rỗng | (1) `AddSkillGapLearningEvidenceTables` — tạo **16 bảng** Sprint 3 cần (config viết đầy đủ theo SQL v2.3), 25 bảng còn lại `ExcludeFromMigrations()` cho tới khi module sở hữu viết config đầy đủ; (2) `AssessmentRetryPolicyV24` — cột mới của v2.4, làm cùng lúc tạo bảng `assessments` | Không tạo bảng lệch schema; không giẫm lên module Assessment/Certificate/Lesson của thành viên khác |

### 3.1. Thay đổi so với mô tả Jira (cần cập nhật Jira/Report)

| Task | Mô tả Jira cũ | Theo spec này |
| --- | --- | --- |
| S3-T015 | Severity `CRITICAL/HIGH/MEDIUM/MET`; `readiness_index`; priority chia 100 | `HIGH/MEDIUM/LOW` + NULL; `coveragePercent`; priority dùng weight thô; thêm endpoint batch và `me/latest` |
| S3-T017 | `POST /recommendations/generate` + `GET` | Chỉ `GET` (stateless); công thức weighted-sum 3 thành phần |
| S3-T018 | "AssessmentPassed → nâng confirmed_level"; MediatR; bảng `assessment_competency_mappings` | Đổi tên: **"Domain events auto-recalculate skill gap on competency confirmation & position changes"**; dispatcher nội bộ; thêm API ghi nhận bằng chứng thủ công |
| S3-T024 | Cờ `ShowAnswersImmediately` | Enum `answer_review_policy` (3 giá trị) + `retry_cooldown_minutes`, qua SQL v2.4 |

---

## 4. Skill Gap Engine (NF-01) — S3-T015

### 4.1. Đầu vào

- Employee `status = ACTIVE`, thuộc tổ chức của người gọi, nằm trong phạm vi D-S3-06.
- Bộ tiêu chuẩn: `requirementSetId` nếu truyền vào (phải `ACTIVE` và thuộc tổ chức, dùng cho "so với vị trí khác"), mặc định là bộ `ACTIVE` của `employees.job_position_id`.
- Cấp độ đã xác nhận: `employee_competency_profiles.confirmed_level` theo `(employee_id, competency_id)`. Evidence `PENDING` / `REJECTED` bị bỏ qua.
- Tham số: `SkillGapSettings { MandatoryMultiplier = 1.5, MediumWeightThreshold = 20 }` (D-S3-04).

### 4.2. Công thức cho từng dòng yêu cầu

```
current   = confirmed_level ?? 0                 // lưu DB: NULL nếu chưa có
gap_steps = max(0, required_level − current)
multiplier = mandatory ? k : 1.00                // lưu vào mandatory_multiplier
priority  = gap_steps × weight_percent × multiplier   // numeric(8,2), 0 khi đã đạt
```

Làm tròn: `Math.Round(x, 2, MidpointRounding.AwayFromZero)`, chỉ làm tròn ở kết quả cuối cùng.

### 4.3. Phân loại mức nghiêm trọng

| Điều kiện (xét theo thứ tự) | severity |
| --- | --- |
| `gap_steps = 0` | `NULL` (hiển thị "Đạt") |
| `gap_steps ≥ 2` **hoặc** `mandatory = true` | `HIGH` |
| `gap_steps = 1` và `weight_percent ≥ MediumWeightThreshold` | `MEDIUM` |
| `gap_steps = 1` và `weight_percent < MediumWeightThreshold` | `LOW` |

### 4.4. Tổng hợp run (`skill_gap_runs`)

| Trường | Giá trị |
| --- | --- |
| `gap_count` | số dòng `gap_steps > 0` |
| `calculation_version` | `"SG-1.0"` |
| `generated_by` | `USER_REQUEST` / `SYSTEM` |
| `summary_snapshot` (jsonb, camelCase) | xem dưới |

```json
{
  "jobPositionId": "…",
  "requirementSetVersionNo": 2,
  "totalRequired": 5,
  "totalMet": 2,
  "totalGap": 3,
  "highCount": 2,
  "mediumCount": 0,
  "lowCount": 1,
  "coveragePercent": 47.50,
  "config": { "mandatoryMultiplier": 1.5, "mediumWeightThreshold": 20 }
}
```

`coveragePercent = Σ(weight × min(current, required) / required) / Σ weight × 100`

### 4.5. Ví dụ tính tay (dùng làm test chuẩn — golden test)

Vị trí **Data Analyst**, bộ tiêu chuẩn v1 (tổng trọng số 100):

| Mã | Năng lực | Yêu cầu | Trọng số | Bắt buộc | Đã xác nhận | gap | priority | severity |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C1 | Data literacy | 3 | 30 | ✔ | 1 | 2 | 2×30×1.5 = **90.00** | HIGH |
| C2 | Digital communication | 2 | 20 | ✘ | 2 | 0 | 0.00 | NULL |
| C3 | Information security | 2 | 25 | ✔ | — (NULL) | 2 | 2×25×1.5 = **75.00** | HIGH |
| C4 | AI literacy | 2 | 15 | ✘ | 1 | 1 | 1×15×1 = **15.00** | LOW |
| C5 | Problem solving | 1 | 10 | ✘ | 3 | 0 | 0.00 | NULL |

Kết quả: `gap_count = 3`, `totalMet = 2`, `highCount = 2`, `lowCount = 1`.
`coveragePercent = (30×1/3 + 20×1 + 25×0 + 15×1/2 + 10×1) / 100 × 100 = 47.50`.
Thứ tự hiển thị: C1 (90) → C3 (75) → C4 (15) → C2, C5 (đạt, xếp theo tên).

### 4.6. Quy tắc loại trừ và lỗi

| Tình huống | Tính 1 nhân viên (`/calculate`) | Tính hàng loạt (`/calculate-batch`) |
| --- | --- | --- |
| Nhân viên không tồn tại / khác org / ngoài phạm vi | 404 | không nằm trong tập quét |
| `status ≠ ACTIVE` | 400 `EMPLOYEE_NOT_ACTIVE` | không nằm trong tập quét (batch chỉ lấy nhân viên ACTIVE — tránh danh sách skipped đầy nhân viên đã nghỉ/archive) |
| Chưa gán vị trí (`job_position_id` NULL) | 400 `NO_JOB_POSITION` | skipped, `NO_JOB_POSITION` |
| Vị trí chưa có bộ `ACTIVE` | 400 `NO_ACTIVE_REQUIREMENT_SET` | skipped, `NO_ACTIVE_REQUIREMENT_SET` |
| `requirementSetId` truyền vào không `ACTIVE` / khác org | 400 / 404 | — |
| Tập quét > 500 nhân viên | — | 400 `BATCH_TOO_LARGE` (lọc thêm theo phòng ban / vị trí) |

Lỗi trả theo chuẩn `ApiResponse` hiện có: `message` tiếng Anh + mã lý do trong `errors[].message` với `field = "employeeId"`; FE ánh xạ mã sang tiếng Việt.

> **Hợp đồng cho FE:** với lỗi 400 nghiệp vụ (`BadRequestException` có mã), `errors[].message` là **mã máy** (`NO_JOB_POSITION`, `BATCH_TOO_LARGE`…) để dịch; với lỗi 400 validate (`message = "Validation failed."`), `errors[].message` là **câu mô tả** của FluentValidation. Phân biệt bằng `message` của response.

### 4.7. API

Controller `SkillGapsController`, route `api/v1/intelligence/skill-gaps`.

| Method & path | Permission | Input | Output |
| --- | --- | --- | --- |
| `POST /calculate` | `skill_gap.calculate` | `{ employeeId, requirementSetId? }` | `SkillGapRunDetail` |
| `POST /calculate-batch` | `skill_gap.calculate` | `{ departmentId?, jobPositionId? }` (DM: bắt buộc là phòng của mình, mặc định phòng của mình) | `{ calculatedCount, runs[{employeeId, runId, gapCount}], skipped[{employeeId, employeeName, reason}] }` |
| `GET /` | `skill_gap.read` | `pageIndex, pageSize ≤ 100, search, employeeId?, departmentId?, jobPositionId?, latestOnly = true` | `PagedList<SkillGapRunListItem>`, sắp theo `gapCount` giảm dần rồi tên |
| `GET /{runId:guid}` | `skill_gap.read` | — | `SkillGapRunDetail` |
| `GET /me/latest` | `skill_gap.read` | — | `SkillGapRunDetail` hoặc `data = null` (chưa có run / tài khoản không có hồ sơ employee) |

Phân quyền theo ma trận hiện có (không đổi): HR có calculate + read; DM có calculate + read (trong phòng); Employee chỉ có read → **Employee không tự bấm tính lại**, snapshot của họ được tạo bởi HR/DM hoặc event.

```ts
SkillGapRunListItem = {
  runId, employeeId, employeeCode, employeeName, departmentName, jobPositionName,
  requirementSetVersionNo, generatedAt, generatedBy, gapCount, highCount, coveragePercent
}
SkillGapRunDetail = SkillGapRunListItem & {
  requirementSetId, calculationVersion,
  summary: { totalRequired, totalMet, totalGap, highCount, mediumCount, lowCount, coveragePercent,
             config: { mandatoryMultiplier, mediumWeightThreshold } },
  items: Array<{
    competencyId, competencyCode, competencyName, categoryName,
    requiredLevel, currentLevel /* null */, gapSteps, weightPercent,
    mandatory, mandatoryMultiplier, priorityScore, severity /* 'HIGH'|'MEDIUM'|'LOW'|null */
  }>   // sắp priority giảm dần, rồi competencyName
}
```

---

## 5. Course Recommendation — S3-T017

### 5.1. Đầu vào

- Snapshot skill gap **mới nhất** của nhân viên và các item `gap_steps > 0`. Chưa có snapshot → trả danh sách rỗng, `reason = "NO_SKILL_GAP_RUN"`.
- Khóa học ứng viên: cùng org, `status = PUBLISHED`; với cùng `code` chỉ lấy `version_no` lớn nhất đang PUBLISHED.
- `course_competencies` trỏ tới các năng lực đang thiếu, với **`target_level > current`** (khóa học phải nâng được ít nhất 1 bậc).
- Loại khóa học mà nhân viên đã có enrollment `COMPLETED`. Enrollment `NOT_STARTED/IN_PROGRESS/READY_FOR_ASSESSMENT` vẫn gợi ý, trả kèm `enrollmentStatus` để FE hiện "Đang học".

### 5.2. Công thức xếp hạng (thang 0–100)

Với khóa học K và các năng lực thiếu c mà K dạy:

```
closeFraction(c)  = (min(target_level, required_level) − current) / (required_level − current)
coverageFactor(c) = course_competencies.coverage_weight / 100
                    nếu NULL: PRIMARY = 1.0, SECONDARY = 0.6, SUPPORTING = 0.3

GAP_PRIORITY_COVERAGE = Σ_c priority(c) × closeFraction(c) × coverageFactor(c) / Σ_tất cả gap priority
MANDATORY_COVERAGE    = (số năng lực bắt buộc đang thiếu mà K dạy) / (tổng số năng lực bắt buộc đang thiếu)   // 0 nếu mẫu = 0
ENTRY_LEVEL_FIT       = 1 nếu entry_level NULL hoặc current_min ≥ entry_level − 1, ngược lại 0
                        (current_min = current nhỏ nhất trong các năng lực PRIMARY mà K lấp; không có PRIMARY thì lấy mọi năng lực K lấp)

score = W_GAP × GAP_PRIORITY_COVERAGE + W_MANDATORY × MANDATORY_COVERAGE + W_ENTRY × ENTRY_LEVEL_FIT
```

Trọng số mặc định (`scoring_configs` loại `RECOMMENDATION_WEIGHTS`, version 1, tổng = 100):

| component_code | weight |
| --- | --- |
| `GAP_PRIORITY_COVERAGE` | 70 |
| `MANDATORY_COVERAGE` | 20 |
| `ENTRY_LEVEL_FIT` | 10 |

Không có config active → dùng mặc định trên, trả `scoringConfigVersion = "DEFAULT"`.
Sắp xếp: `score` giảm dần → `estimated_duration_minutes` tăng dần (NULL xếp cuối) → `title`. `limit` mặc định 10, tối đa 20. Khóa học `score = 0` bị loại.

### 5.3. Ví dụ (nối tiếp §4.5, tổng priority thiếu = 90 + 75 + 15 = 180)

| Khóa học | Trạng thái | Dạy | Tính | score |
| --- | --- | --- | --- | --- |
| K3 Phân tích dữ liệu nâng cao (entry 2) | PUBLISHED | C1 → 3 PRIMARY | GAP = 90×1×1/180 = 0.5; MAND = 1/2; ENTRY: 1 ≥ 1 → 1 | 35 + 10 + 10 = **55.00** |
| K2 An toàn thông tin cơ bản (entry NULL) | PUBLISHED | C3 → 2 PRIMARY | GAP = 75/180 = 0.4167; MAND = 1/2; ENTRY 1 | 29.17 + 10 + 10 = **49.17** |
| K1 Excel & Power BI (entry 1) | PUBLISHED | C1 → 2 PRIMARY, C4 → 2 SUPPORTING | GAP = (90×0.5×1 + 15×1×0.3)/180 = 0.275; MAND = 1/2; ENTRY 1 | 19.25 + 10 + 10 = **39.25** |
| K4 AI cho văn phòng | DRAFT | C4 → 2 | bị loại | — |

Thứ tự trả về: K3 → K2 → K1.

### 5.4. Giải thích (explainability)

Mỗi gợi ý trả **dữ liệu có cấu trúc** kèm một câu tóm tắt do server sinh ra:

```ts
CourseRecommendation = {
  courseId, courseCode, title, estimatedDurationMinutes, entryLevel, enrollmentStatus /* null */,
  score, breakdown: { gapPriorityCoverage, mandatoryCoverage, entryLevelFit },
  reasons: Array<{ competencyId, competencyName, currentLevel, requiredLevel, courseTargetLevel,
                   coverageType, closesSteps, mandatory, severity }>,
  explanation: string   // "Nâng 'Data literacy' từ Cơ bản lên Nâng cao (yêu cầu: Nâng cao, bắt buộc)."
  warnings: string[]    // ["ENTRY_LEVEL_NOT_MET"] khi ENTRY_LEVEL_FIT = 0
}
GetRecommendationsOutput = { skillGapRunId, generatedAt, scoringConfigVersion, reason /* null | 'NO_SKILL_GAP_RUN' | 'NO_GAP' */, items: CourseRecommendation[] }
```

Nhãn cấp độ: 1 = Cơ bản (Basic), 2 = Trung cấp (Intermediate), 3 = Nâng cao (Advanced), NULL = Chưa xác nhận.

### 5.5. API

| Method & path | Permission | Input | Ghi chú |
| --- | --- | --- | --- |
| `GET /api/v1/intelligence/recommendations` | `learning_recommendation.read` | `employeeId?` (mặc định bản thân), `limit?` | Xem người khác theo phạm vi D-S3-06; hiệu năng mục tiêu < 200 ms (3 truy vấn: run + items, khóa học ứng viên, enrollments) |

---

## 6. Domain Events & bằng chứng thủ công — S3-T018

### 6.1. Cơ chế

```
Use case ──Raise(event)──▶ IDomainEventQueue (scoped)
      └─ SaveChangesAsync()
            ├─ nếu queue rỗng: lưu bình thường
            └─ nếu có event:
                 BEGIN TRANSACTION (chỉ khi provider relational)
                 SaveChanges #1               ← thay đổi chính đã được flush, handler đọc được
                 dispatch handlers (tối đa 3 vòng, event sinh thêm event được xử lý vòng sau)
                 SaveChanges #2               ← snapshot, notification rows
                 COMMIT
                 chạy IAfterCommitQueue       ← SignalR push; lỗi chỉ ghi log, không throw
```

- `IDomainEvent` (Domain/Common): marker có `OccurredAt`.
- `IDomainEventHandler<TEvent>`: chỉ **stage** thay đổi, **không** gọi `SaveChangesAsync`.
- Handler đăng ký tự động bằng Scrutor (giống use case).
- InMemory provider (unit test) bỏ qua transaction (`Database.IsRelational() == false`).
- Chống tính trùng: handler skill gap là scoped, giữ `HashSet<employeeId>` đã tính trong request → nhiều event của cùng một nhân viên chỉ sinh **1 run**.

### 6.2. Danh sách event Sprint 3

| Event | Nơi phát | Handler |
| --- | --- | --- |
| `EmployeeCompetencyLevelConfirmed(employeeId, competencyId, confirmedLevel, evidenceId)` | `CreateManualEvidenceUseCase` (S3); Sprint 4: chấm task thực hành | Tính lại skill gap (`SYSTEM`) + tạo `notifications` row + push SignalR tới user của nhân viên |
| `PositionRequirementSetActivated(requirementSetId, jobPositionId)` | `ActivatePositionRequirementSetUseCase` | Tính lại cho mọi nhân viên `ACTIVE` ở vị trí đó (tối đa 500; vượt quá thì ghi log cảnh báo và bỏ qua — HR dùng batch) |
| `EmployeeJobPositionChanged(employeeId, oldPositionId, newPositionId)` | `UpdateEmployeeUseCase` (module của HoangNT — thay đổi 3 dòng, cần báo trước) | Tính lại nếu vị trí mới có bộ tiêu chuẩn `ACTIVE` |

Bài thi trắc nghiệm **không** phát event xác nhận năng lực (D-S3-08). Khi engine thi hoàn thiện, nhóm Assessment có thể phát `AssessmentAttemptScored` để gửi thông báo và cập nhật enrollment — không nằm trong Sprint 3.

### 6.3. API ghi nhận bằng chứng thủ công

`POST /api/v1/competency-evidences/manual` — `[HasPermission(evidence.create_manual)]` (HR).

Input: `{ employeeId, competencyId, confirmedLevel (1–3), reviewNote (bắt buộc, ≤ 2000 ký tự) }`.

Xử lý trong 1 transaction:
1. Kiểm tra employee `ACTIVE` cùng org; competency `ACTIVE`.
2. Evidence xác nhận cũ của cùng `(employee, competency)` (nếu có) → `status = SUPERSEDED`.
3. Tạo evidence mới: `source_type = MANUAL_OVERRIDE`, `status = CONFIRMED`, `is_level_confirming = true`, `confirmed_level`, `confirmed_by_user_id`, `confirmed_at`, `supersedes_evidence_id`.
4. Upsert `employee_competency_profiles`: `confirmed_level`, `latest_confirming_evidence_id`, `confirmed_at`, `row_version + 1` (`RowVersion` cấu hình `IsConcurrencyToken`).
5. `IAuditService.LogAsync("COMPETENCY_LEVEL_OVERRIDE", "employee_competency_profiles", …, old, new)`.
6. `Raise(EmployeeCompetencyLevelConfirmed)`.

Xung đột ghi đồng thời (unique `(employee_id, competency_id)` hoặc row version) → 409 `ConflictException`.

---

## 7. Quy chế thi lại & hiển thị đáp án — S3-T024

### 7.1. Thay đổi SQL v2.4 (sửa SQL trước, rồi entity, rồi migration)

```sql
ALTER TABLE assessments
  ADD COLUMN retry_cooldown_minutes integer,
  ADD COLUMN answer_review_policy varchar(30) NOT NULL DEFAULT 'SCORE_ONLY',
  ADD CONSTRAINT ck_assessments_retry_cooldown
      CHECK (retry_cooldown_minutes IS NULL OR retry_cooldown_minutes > 0),
  ADD CONSTRAINT ck_assessments_answer_review_policy
      CHECK (answer_review_policy IN ('SCORE_ONLY','AFTER_SUBMIT','AFTER_PASS'));
```

Cùng đợt v2.4, bổ sung vào SQL phần đã có migration nhưng còn thiếu: bảng `learner_profiles` và cột `job_positions.career_role_template_id`.

### 7.2. Quy tắc (policy thuần, không phụ thuộc DB)

`AssessmentRetryPolicy.Evaluate(assessment, attemptsOfThisEnrollment, now)`:

| Điều kiện | Kết quả |
| --- | --- |
| Có attempt `STARTED` chưa nộp | Không cho tạo mới; trả attempt đang mở (`RESUME_EXISTING`) |
| Đã có attempt `passed = true` | 409 `ALREADY_PASSED` |
| `max_attempts` khác NULL và số attempt ≥ `max_attempts` | 409 `MAX_ATTEMPTS_REACHED` |
| `retry_cooldown_minutes` khác NULL và `now < last.submitted_at + cooldown` | 409 `RETRY_COOLDOWN`, kèm `retryAvailableAt` |
| Còn lại | Cho phép, trả `remainingAttempts` (NULL = không giới hạn) |

`AnswerReviewPolicy.CanRevealAnswers(policy, attempt)`: `SCORE_ONLY` → không bao giờ; `AFTER_SUBMIT` → khi attempt đã `SCORED`; `AFTER_PASS` → khi `passed = true` **hoặc** đã hết lượt thi.

Tích hợp: gọi hai policy trong use case bắt đầu / xem kết quả attempt của module Assessment. Nếu đến 10/10 use case đó chưa có, bàn giao SQL + migration + policy + test, phần tích hợp và UI chuyển sang Sprint 4.

---

## 8. Frontend — S3-T016

> **Ngôn ngữ UI:** theo quy ước hiện hành của từng tuyến — trang `/enterprise/*` dùng **tiếng Anh** (như mọi trang enterprise khác), tuyến `/learn/*` dùng tiếng Việt. Mã lỗi (`NO_JOB_POSITION`…) được dịch trong `lib/competency-levels.ts`.

### 8.1. Thành phần dùng chung (`features/intelligence/components/`)

| Component | Mô tả |
| --- | --- |
| `CompetencyRadarChart` | Recharts `RadarChart`: lớp "Yêu cầu" (viền nét đứt) và lớp "Đã xác nhận" (vùng tô mờ), trục 0–3 có nhãn cấp độ. **Dưới 3 năng lực** thì hiển thị bar chart ngang (radar 1–2 trục vô nghĩa) |
| `SkillGapKpiCards` | Tổng yêu cầu, Đã đạt, Còn thiếu, Mức đáp ứng chuẩn vị trí (%) |
| `SkillGapTable` | Cột: năng lực, nhóm, yêu cầu, hiện tại, số bậc thiếu, trọng số, bắt buộc, `SeverityBadge`, priority |
| `SeverityBadge` | HIGH đỏ (danger), MEDIUM hổ phách (warning), LOW xám (default), NULL xanh lục "Met" — dùng đúng bảng màu `StatusBadge` hiện có |
| `RecommendationList` | Thẻ khóa học: điểm, lý do (reasons), cảnh báo entry level, trạng thái đang học |
| `lib/competency-levels.ts` | Nhãn 0–3 và map mã lỗi → tiếng Việt |

### 8.2. Trang

| Trang | Route | Nội dung |
| --- | --- | --- |
| `MyCompetencyProfilePage` | `/enterprise/my-competency-profile` | Tab "Khoảng trống năng lực" (`GET me/latest`) + tab "Khóa học gợi ý". Empty state: "Chưa có phân tích — quản lý/HR sẽ chạy phân tích cho bạn" |
| `SkillGapPage` | `/enterprise/intelligence/skill-gap` | Lọc phòng ban (DM bị khóa ở phòng mình), vị trí, tìm kiếm; bảng snapshot mới nhất; bấm dòng mở drawer chi tiết (radar + bảng + gợi ý). Nút "Phân tích lại" (1 người) và "Phân tích cả phòng" (batch, hiện danh sách bị bỏ qua kèm lý do). Nút chỉ hiện khi `can(SKILL_GAP_CALCULATE)` |
| Learner `/learn/progress`, `/learn/target` | — | **Hoãn:** dữ liệu demo tuyến learner đang dùng thang **6 mức** ("Level 4/6"), trái quyết định thang 3 mức. Chỉ gắn radar sau khi dữ liệu learner chuyển sang thang 3 mức (D-S3-12) |

### 8.3. Mạng & trạng thái

- `services/intelligence.service.ts` export object `skillGapService`, `recommendationService` qua `apiClient`.
- `hooks/use-skill-gaps.ts`, `hooks/use-recommendations.ts` (TanStack Query). Tính lại thành công → invalidate `['skill-gaps']` và `['recommendations']`.
- Mọi màn có đủ: skeleton loading, empty, error (toast `sonner`), success toast.
- Heatmap năng lực × nhân viên: **Should** — làm nếu còn thời gian, là mục cắt đầu tiên.

---

## 9. Acceptance Criteria (Given–When–Then)

### Skill Gap
- **AC-SG-01** Given nhân viên ACTIVE có vị trí với bộ tiêu chuẩn ACTIVE và profile như §4.5, When HR gọi `POST /calculate`, Then tạo 1 run với `gap_count = 3`, `generated_by = USER_REQUEST`, 5 item có priority/severity đúng bảng §4.5, `coveragePercent = 47.50`.
- **AC-SG-02** Given nhân viên chưa có profile nào, When tính, Then mọi item có `current_level = NULL`, `gap_steps = required_level`.
- **AC-SG-03** Given confirmed ≥ required, When tính, Then `gap_steps = 0`, `priority = 0`, `severity = NULL`.
- **AC-SG-04** Given nhân viên chưa gán vị trí, When tính đơn, Then 400 `NO_JOB_POSITION` và không tạo run.
- **AC-SG-05** Given vị trí không có bộ ACTIVE, When tính đơn, Then 400 `NO_ACTIVE_REQUIREMENT_SET`.
- **AC-SG-06** Given phòng có 3 nhân viên (1 chưa gán vị trí), When DM gọi batch cho phòng mình, Then `calculatedCount = 2` và 1 skipped `NO_JOB_POSITION`.
- **AC-SG-07** Given DM phòng A, When tính hoặc đọc run của nhân viên phòng B, Then 404.
- **AC-SG-08** Given Employee, When gọi `GET /{runId}` của người khác, Then 404; When gọi `POST /calculate`, Then 403.
- **AC-SG-09** Given đã có run R1, When tính lại, Then có run R2 mới và R1 giữ nguyên.
- **AC-SG-10** Given `system_settings` của org đặt `mandatoryMultiplier = 2`, When tính, Then priority dùng 2 và `summary.config.mandatoryMultiplier = 2`.

### Recommendation
- **AC-REC-01** Given run §4.5 và khóa K1–K4 §5.3, When gọi `GET /recommendations`, Then thứ tự K3, K2, K1 với score 55.00 / 49.17 / 39.25 và không có K4.
- **AC-REC-02** Given nhân viên đã COMPLETED K3, Then K3 không xuất hiện.
- **AC-REC-03** Given course có 2 version PUBLISHED cùng code, Then chỉ version lớn nhất xuất hiện.
- **AC-REC-04** Given chưa có run, Then `items = []`, `reason = NO_SKILL_GAP_RUN`; Given run không còn gap, Then `reason = NO_GAP`.
- **AC-REC-05** Given course entry_level 3 và current của năng lực PRIMARY là 1, Then `entryLevelFit = 0` và `warnings` có `ENTRY_LEVEL_NOT_MET`.
- **AC-REC-06** Given course dạy năng lực thiếu với `target_level ≤ current`, Then không được gợi ý.

### Domain Events & Evidence
- **AC-EVT-01** Given HR ghi nhận bằng chứng thủ công C3 = 2 cho nhân viên, When thành công, Then trong cùng transaction: evidence CONFIRMED, profile C3 = 2, 1 run mới `generated_by = SYSTEM` với C3 đạt, 1 dòng `notifications`, 1 audit log; sau commit có push SignalR.
- **AC-EVT-02** Given bước tính skill gap trong handler ném lỗi, Then evidence và profile cũng **không** được lưu (rollback).
- **AC-EVT-03** Given kích hoạt bộ tiêu chuẩn v2 cho vị trí có 4 nhân viên ACTIVE, Then có 4 run SYSTEM mới gắn `requirement_set_id` của v2.
- **AC-EVT-04** Given một request phát 2 event cho cùng nhân viên, Then chỉ tạo 1 run.
- **AC-EVT-05** Given gửi SignalR lỗi, Then API vẫn trả thành công và dữ liệu đã commit.

### Activation (nợ S2)
- **AC-ACT-01** Given bộ nháp có tổng trọng số 90, When Activate, Then 400 và bộ vẫn là DRAFT; Given tổng = 100, Then ACTIVE.

### Retry policy
- **AC-RET-01** `max_attempts = 3`, đã có 3 attempt → 409 `MAX_ATTEMPTS_REACHED`.
- **AC-RET-02** cooldown 30 phút, lần trước nộp lúc 10:00, now 10:20 → 409 `RETRY_COOLDOWN`, `retryAvailableAt = 10:30`.
- **AC-RET-03** `AFTER_PASS`, attempt trượt và còn lượt → không trả đáp án; hết lượt → trả đáp án.

---

## 10. Test Matrix (S3-T020 — tối thiểu 15 case, mục tiêu ≥ 25)

| ID | Lớp test | Loại | AC |
| --- | --- | --- | --- |
| T-SG-01 | `SkillGapCalculatorTests` golden §4.5 (theory 5 dòng) | Unit | SG-01 |
| T-SG-02 | Chưa có profile → full gap, current NULL | Unit | SG-02 |
| T-SG-03 | Đạt / vượt chuẩn → severity NULL, priority 0 | Unit | SG-03 |
| T-SG-04 | Bảng severity: (gap 2, không bắt buộc) HIGH; (1, bắt buộc) HIGH; (1, w 20) MEDIUM; (1, w 19.99) LOW | Unit theory | §4.3 |
| T-SG-05 | Multiplier tùy chỉnh được áp dụng và ghi vào snapshot | Unit | SG-10 |
| T-SG-06 | Làm tròn AwayFromZero (weight 12.35, gap 1, bắt buộc, k 1.5 → 18.525 → **18.53**, không phải 18.52 như banker's rounding) | Unit | §4.2 |
| T-SG-07 | coveragePercent golden = 47.50 | Unit | SG-01 |
| T-SG-08 | `CalculateSkillGapUseCase` NO_JOB_POSITION / NO_ACTIVE_REQUIREMENT_SET / EMPLOYEE_NOT_ACTIVE | Use case (InMemory) | SG-04, SG-05 |
| T-SG-09 | Phạm vi: DM khác phòng → 404; Employee xem người khác → 404 | Use case | SG-07, SG-08 |
| T-SG-10 | Batch trả skipped đúng lý do | Use case | SG-06 |
| T-SG-11 | Append-only: tính 2 lần → 2 run | Use case | SG-09 |
| T-REC-01 | `CourseRecommenderTests` golden §5.3 | Unit | REC-01 |
| T-REC-02 | Loại DRAFT/ARCHIVED; chỉ version mới nhất | Unit | REC-03 |
| T-REC-03 | Loại COMPLETED; giữ IN_PROGRESS kèm enrollmentStatus | Unit | REC-02 |
| T-REC-04 | target ≤ current bị loại | Unit | REC-06 |
| T-REC-05 | Entry level fit / cảnh báo | Unit | REC-05 |
| T-REC-06 | coverage_weight ghi đè hệ số mặc định theo coverage_type | Unit | §5.2 |
| T-REC-07 | Nội dung explanation đúng định dạng | Unit | §5.4 |
| T-REC-08 | NO_SKILL_GAP_RUN / NO_GAP | Use case | REC-04 |
| T-EVT-01 | Manual evidence → profile + run SYSTEM + notification + audit | Integration (Postgres) | EVT-01 |
| T-EVT-02 | Handler lỗi → rollback toàn bộ | Integration (Postgres) | EVT-02 |
| T-EVT-03 | Dedupe nhiều event cùng nhân viên | Unit (dispatcher) | EVT-04 |
| T-EVT-04 | After-commit lỗi không làm hỏng request | Unit | EVT-05 |
| T-ACT-01 | Activate tổng ≠ 100 → 400 | Use case | ACT-01 |
| T-RET-01..03 | `AssessmentRetryPolicyTests`, `AnswerReviewPolicyTests` | Unit | RET-01..03 |
| T-MIG-01 | Migration áp dụng lên DB trắng, đủ 60 bảng + CHECK chính | Integration (mở rộng `FoundationMigrationTests`) | D-S3-15 |
| FE-01 | `SeverityBadge` map đúng 4 trạng thái | Vitest | §8 |
| FE-02 | Radar < 3 năng lực chuyển sang bar | Vitest | §8.1 |
| FE-03 | `MyCompetencyProfilePage` loading / empty / data | Vitest + mock service | §8.3 |

---

## 11. Dữ liệu seed

**Reference (mọi môi trường, idempotent):**
- `system_settings` global `intelligence.skill_gap = {"mandatoryMultiplier":1.5,"mediumWeightThreshold":20}`.
- `scoring_configs` `RECOMMENDATION_WEIGHTS` v1 active cho mỗi org + 3 item §5.2.

**Demo (chỉ Development):** đúng bộ dữ liệu §4.5 và §5.3 để demo và làm golden test.
- 1 category DigComp, 5 competency C1–C5 (mỗi cái có 3 level criterion).
- Job family "Data & Analytics", vị trí "Data Analyst", requirement set v1 ACTIVE như §4.5.
- `employee@` và `manager@` gán vị trí Data Analyst.
- Profile của `employee@` như §4.5 qua evidence `source_type = MIGRATION`, `CONFIRMED`.
- 4 khóa học K1–K4 kèm `course_competencies`.

---

## 12. Rủi ro & phụ thuộc

| Rủi ro | Ảnh hưởng | Giảm thiểu |
| --- | --- | --- |
| Migration 41 bảng lệch SQL (config viết từ trước, chưa chạy thật) | Chặn mọi task | Làm đầu tiên; `FoundationMigrationTests` đối chiếu CHECK/unique chính; review cùng HoangNT |
| Module Course / Assessment của team chưa có | T017 thiếu dữ liệu thật; T024 không tích hợp được | Seed demo; policy T024 thuần + bàn giao tách phần tích hợp |
| Sửa `UpdateEmployeeUseCase` (module của HoangNT) | Xung đột merge | Báo trước, PR nhỏ riêng, HoangNT review |
| 140 giờ / 2 tuần cho một người | Trễ sprint | Thứ tự cắt: heatmap → UI đồng hồ đếm ngược T024 → radar tuyến learner |
| Hai giao dịch SaveChanges trong một transaction | Deadlock / lock lâu khi batch lớn | Giới hạn 500; batch chạy bằng API riêng, không qua event |

---

## 13. Việc cần reviewer xác nhận

1. D-S3-08 (quiz không xác nhận năng lực) — **Team Leader đã chốt phương án (a) ngày 28/09**; báo Mentor tại buổi review kế tiếp vì mô tả S3-T018 trên Jira thay đổi. Phương án (b) — thêm `source_type = 'ASSESSMENT'` + bảng ánh xạ bài thi ↔ năng lực — đã bị loại vì phải sửa schema và phụ thuộc engine thi chưa có.
2. D-S3-13 (SQL v2.4) — cần cả nhóm biết để không sửa `assessments` song song.
3. Trọng số recommendation 70/20/10 và ngưỡng MEDIUM = 20% — giá trị khởi điểm, chỉnh được qua cấu hình.
