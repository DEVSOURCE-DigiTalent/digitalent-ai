# 03A — SRS: Tài liệu Đặc Tả Yêu Cầu Phần Mềm (Chức Năng)

> Nguồn gốc: Report 3 — *Software Requirement Specification* §2–§3, §5. Phiên bản docs_v3, tiếng Việt.

> **Baseline alignment 09/10/2026:** Tài liệu này dùng inventory UC/screen từ Report 3 v2.3; Master Overview hiện dẫn v2.2, nên version mismatch được ghi rõ trong file 04. Các nội dung cũ trái với Enterprise baseline (DigComp 3.0, năm role, public verification, certificate expiry, risk/readiness, weights, Trainer-owned content) không còn là yêu cầu. Requirement và implementation status là hai thông tin riêng; file này không xác nhận code đã triển khai. Report 3 v2.3 có **44 UC entries (UC-24 và UC-31 là internal functions)** và **42 screens**. `GRADE-01` vẫn **PENDING DECISION**.

> **Yêu cầu xác nhận để áp dụng khi đọc các mục dưới đây:** Enterprise có đúng bốn role nghiệp vụ `PLATFORM_ADMIN`, `OWNER`, `MANAGER` (optional), `EMPLOYEE`; PLATFORM_ADMIN sở hữu standard content. Hệ thống tự đề xuất course từ Skill Gap và competency-course mapping; OWNER cũng có thể chủ động giao course cho cập nhật tổ chức/đào tạo lại, hai cơ chế cùng tồn tại. Chỉ cấp Internal Employee Certificate cho course eligible, sau khi hoàn thành required lessons và đạt final assessment; certificate không hết hạn. QR chỉ mở verification đã đăng nhập cho OWNER/MANAGER thuộc đúng tổ chức phát hành, không có public verification. OWNER correction chỉ giảm/reset grade để sửa lỗi, cần reason + audit, không tự sửa grade của mình; tăng grade phải qua approved level-confirming evidence. Late submission được nhận, gắn `IsLate`, và vẫn được review. Assignment/attempt phải giữ Course/Assessment Version cùng snapshot. AI-assisted Practical Task evaluation là target requirement đang chờ xác nhận phạm vi Report 1/2; AI chỉ hỗ trợ đề xuất, người có quyền quyết định cuối. Các quy tắc này là yêu cầu, không xác nhận implementation.

---

## 1. Kiểm soát tài liệu

| Mục | Giá trị |
|-----|---------|
| Tên tài liệu | Software Requirements Specification — Yêu cầu chức năng |
| Phiên bản | 3.1 |
| Trạng thái | Bản nháp |
| Chủ sở hữu | Trần Văn Linh (Leader) |
| Căn cứ | Report 3 §1–§3, §5 |

**Lịch sử chỉnh sửa**

| Ngày | Phiên bản | Mô tả |
|------|-----------|-------|
| 16/09/2026 | 3.0 | Chuyển ngữ, căn chỉnh theo Reports, bỏ trục Career Grade (chỉ 3 mức năng lực) |
| 29/09/2026 | 3.1 | Sprint 3 (S3-T025): chi tiết hóa §7.6 theo phần đã hiện thực (công thức skill gap, gợi ý khóa học, tính lại tự động, ghi nhận năng lực thủ công), sửa §7.8.5 theo D-S3-08, bổ sung NF-01, MSG27–MSG34, §13 trạng thái hiện thực & điểm mở. Nguồn: `docs/specs/2026-09-28-sprint3-skill-gap-recommendation-spec.md` |

---

## 2. Mục đích và phạm vi

Đặc tả yêu cầu **chức năng** của DigiTalent AI theo chuẩn IEEE 29148:2018. Tài liệu trả lời "hệ thống làm gì" ở mức chi tiết đủ để triển khai và kiểm thử. Yêu cầu phi chức năng (NFR) nằm ở file `03B`.

**Ngoài phạm vi:** NFR/chất lượng (03B), thiết kế kỹ thuật (06–08), phân quyền chi tiết (09).

---

## 3. Tài liệu tham chiếu

- Report 3 — *Software Requirement Specification* (08/2026)
- Report 1 — *Project Introduction* (FE-01..09, AI scope)
- `00_INDEX_Tong_Quan_Tai_Lieu.md` — sự kiện chuẩn
- `02_BRD_Yeu_Cau_Nghiep_Vu.md` — yêu cầu nghiệp vụ

---

## 4. Tổng quan sản phẩm

DigiTalent AI là nền tảng web nội bộ giúp doanh nghiệp IT vừa và nhỏ (~80–200 nhân sự) trả lời câu hỏi: **nhân viên có thực sự đủ năng lực mà vị trí công việc yêu cầu không, và có bằng chứng chứng minh điều đó không.** Hệ thống khép vòng 4 mảnh thường bị quản lý rời rạc: kiến trúc công việc, khung năng lực số, học tập–đánh giá nội bộ, và task thực hành sau đào tạo — thành một luồng duy nhất từ "vị trí này cần gì" đến "đây là sản phẩm công việc chứng minh nhân viên làm được".

**Vòng lặp nghiệp vụ lõi (legacy wording; dùng baseline alignment bên dưới khi có khác biệt):**

1. **Position Requirement Set** định nghĩa năng lực + mức yêu cầu cho một vị trí.
2. Hệ thống so sánh yêu cầu với hồ sơ năng lực đã xác nhận → **Skill Gap**.
3. Hệ thống tự đề xuất khóa học chuẩn theo competency còn thiếu và mapping competency-course có thể giải thích; nhân viên xem và có thể bắt đầu học. OWNER có thể giao khóa học rõ ràng khi có cập nhật hoặc yêu cầu đào tạo lại; recommendation và assignment là hai trạng thái/cơ chế riêng.
4. Nhân viên học course và làm final assessment. Certificate chỉ được cấp nếu course eligible, đủ required lessons và assessment đạt; kết quả học tập/chứng chỉ không tự xác nhận năng lực. QR verification là nội bộ, có đăng nhập và cùng organization.
5. OWNER/MANAGER trong scope giao **Practical Task**; nhân viên nộp evidence. (Target requirement, chờ xác nhận scope Report 1/2) AI có thể đối chiếu evidence được phép truy cập với rubric và đề xuất kết quả theo tiêu chí, lý do, căn cứ và phần thiếu; OWNER/MANAGER review, chỉnh sửa, approve hoặc yêu cầu bổ sung.
6. Chỉ review hợp lệ được approve mới cập nhật Confirmed Competency và kích hoạt tính lại Skill Gap. Điểm số task không đồng nghĩa competency level. Không có Training Risk/Workforce Readiness score trong Enterprise MVP.

Skill Gap dùng quy tắc xác định và giải thích được; Enterprise MVP không có Training Risk / Workforce Readiness scoring hoặc scoring weights.

> **GRADE-01 — PENDING DECISION:** Dùng TT02 làm khung tham chiếu; Report 3 v2.2 mô tả Grade 1–6. Basic / Intermediate / Advanced là ba Level đào tạo, chưa kết luận số mức lưu trữ. Không dùng Job Grade G1–G3. Requirement Set theo Position; không gắn Job Grade.

---

## 5. Actor hệ thống

| # | Actor | Loại | Mô tả |
|---|-------|------|-------|
| 1 | `PLATFORM_ADMIN` (Platform Admin) | Primary | Quản lý organizations, platform users, TT02 framework, standard curriculum/question bank/assessment, reference positions, settings và platform audit; không mặc định truy cập private evidence của organization. |
| 2 | `OWNER` (Owner) | Primary | Quản trị một organization; members, departments, positions, requirements; giao course khi có yêu cầu tổ chức/đào tạo lại; giao practical tasks; review evidence; quản lý certificate registry; correction grade có kiểm soát. |
| 3 | `MANAGER` (Manager, optional) | Primary | Theo dõi learning; giao/review task và xác nhận evidence trong các department được phân công; không giao course hoặc sửa organization structure. |
| 4 | `EMPLOYEE` (Employee) | Primary | Xem course được đề xuất hoặc giao, tự bắt đầu course được đề xuất, làm assessment, nộp task evidence và xem hồ sơ cá nhân. |

`Account Holder` là người chưa đăng nhập, chỉ dùng cho Log In và Recover Forgotten Password; không phải role. System/internal functions không phải actor role. Enterprise MVP không có HR Manager, Trainer, Public Visitor, Training Risk hoặc Workforce Readiness actor/function.

---

## 6. Bản đồ chức năng — 8 package, 44 UC entries, 42 screens

Report 3 v2.3 là nguồn chi tiết cho package/use-case inventory; phần vết chuẩn đã được chép vào `04_Use_Case_Danh_Sach_Dac_Ta.md` §§4–6. Danh mục có 44 entries, trong đó UC-24 Recalculate Affected Skill Gap và UC-31 Issue Certificate là internal functions; tổng screens là 42. Không dùng bảng 46 UC / 44 screens của bản docs_v3 cũ.

| Package | UC entries | Phạm vi | Internal functions |
|---------|------------|---------|--------------------|
| AUTH | UC-01–06 | Authentication, workspace and account | — |
| MOD-01 — Platform Administration & Standard Content | UC-07–14 | TT02, standard curriculum/question bank/assessment, reference positions, platform users, audit/settings | — |
| MOD-02 — Organization, Positions & TT02 Requirements | UC-15–19 | TT02 reference, members, departments, positions, requirement sets | — |
| MOD-03 — Skill Gap & Competency | UC-20–24 | Own/team gap, analytics/history and recalculation | UC-24 |
| MOD-04 — Learning | UC-25–28 | Course assignment/monitoring, learner course list and study | — |
| MOD-05 — Assessment & Certificates | UC-29–34 | Assessment, results, certificate issuance/list/verification | UC-31 |
| MOD-06 — Practical Task & Evidence | UC-35–39 | Templates, task assignment/submission/review, evidence portfolio | — |
| MOD-07 — Dashboards & Notifications | UC-40–44 | Role dashboards and notifications | Notification creation is a system function |

UC-01 and UC-03 use the unsigned Account Holder actor; UC-24/UC-31 have no human actor. The four Enterprise roles are `PLATFORM_ADMIN`, `OWNER`, optional `MANAGER`, and `EMPLOYEE`. The exact 44 names, actor mappings, Report 1 trace, and all 42 screen names/roles are maintained in file 04; do not duplicate the old 46-entry list here.

## 6.1 Screen groups

The 42-screen inventory and authorization mapping are in `04_Use_Case_Danh_Sach_Dac_Ta.md` §6 and Report 3 v2.3 §§3.1.2–3.1.3. Three screens have no use case of their own: 403 Access Denied, 404 Not Found, and My Team. Screens are distinct from non-screen functions NS-1 to NS-6.

## 7. Đặc tả chức năng theo nhóm

> Lưu ý: các mục 7.1–7.5 và 7.7–7.9 dưới đây là mô tả từ bản SRS cũ; khi khác với inventory Report 3 v2.3 tại §6, business rules tại §9 hoặc Master Overview, các nguồn đó được ưu tiên. Trạng thái implementation không được suy ra từ nội dung yêu cầu.

### 7.1 Authentication, Workspace and Authorization (§3.2)

- Each of the four Enterprise roles signs in to a workspace scoped to its role. Account Holder is the unsigned actor for sign-in and password recovery, not a role.
- Profile, password and active-session actions apply to the signed-in user's own account. The server enforces authentication and permission for every request.
- Role names are `PLATFORM_ADMIN`, `OWNER`, `MANAGER` (optional), and `EMPLOYEE`; do not use the old System Administrator / HR / Trainer / Public Visitor model.

### 7.2 Organization, Members and Departments (§3.3)

- OWNER manages departments, members/invitations and organization positions; member records carry role, department and position.
- OWNER records Manager responsibility by department. MANAGER sees and acts only within currently assigned departments; assignment history supports scope and audit.
- EMPLOYEE sees only personal records. An absent position or Active Requirement Set produces `Not Assessed`, not an inferred gap.

### 7.3 TT02 Framework, Positions and Requirements (§3.4)

- PLATFORM_ADMIN maintains versioned TT02 reference data, platform reference positions and level criteria. OWNER maintains organization positions and requirement sets, optionally copied from a reference position.
- An Active Requirement Set is versioned by position and TT02 version. It defines required competencies, TT02 level and mandatory flag. There is no requirement weight or extra-evidence flag in the MVP. Mandatory affects labeling/order, not the gap state calculation.
- A position may select the competencies relevant to its work; do not impose the legacy 9–14 or 9–24 count, or require an invented fixed competency list.
- `GRADE-01` remains PENDING DECISION. TT02 has grades 1–6 in Report 3; Basic/Intermediate/Advanced are training groupings. Do not conclude how grades are stored or compared until the decision is recorded.

### 7.4 Learning Content, Course Recommendation and Assignment (§3.6)

- PLATFORM_ADMIN owns and versions the standard curriculum, modules, lessons, course materials and competency-course mappings. The system automatically maintains explainable recommended courses from current Skill Gap and mappings; each recommendation identifies the gap competency and mapped course coverage. It does not enroll the employee automatically. Employee can view the recommendation and start learning.
- OWNER may explicitly assign a standard course to employees for an organization update or retraining. Recommendation and assignment coexist; the UI and records distinguish their source, and an explicit assignment may include a due date/reason. MANAGER monitors progress but does not assign courses in this release.
- Assignments retain the Course Version selected at assignment time. A published course already in use is changed through a new version; prior learning records remain tied to their original version. Course learning records arising from recommendations are distinguishable from explicit assignments.
- Employee course list/API returns both current recommendations and active assignments with source, covered competency, course version, progress and due date when applicable. A server-authorized Employee action starts a recommendation; only an Owner-authorized assignment action creates an explicit assigned-course record. Detailed endpoint paths and screen layouts belong in the API/UI design documents and must be reconciled with Report 3 before implementation.
- Learning completion and assessment result remain learning records, not Confirmed Competency.

### 7.5 Assessment, Question Bank and Results (§3.7)

- PLATFORM_ADMIN maintains the standard question bank and standard assessments. AI-drafted items remain drafts until a human approves them.
- A published assessment with attempts is versioned. An attempt retains its Assessment Version; the assignment retains both Course Version and Assessment Version.
- A final assessment pass is required for course completion and, for certificate-eligible courses, certificate issuance. Assessment scores do not increase Confirmed Competency.

### 7.6 Competency Profile and Skill Gap

**7.6.1 Recalculate Skill Gap (UC-24; internal function)**
- Compare each affected employee's active Position Requirement Set with Confirmed Competency.
- `Met`: confirmed level is at or above required level. `Partial Gap`: a confirmed level exists but is below requirement. `Gap`: no confirmed level exists for a required competency; this records missing confirmation, not inability.
- Use `Not Assessed` if the employee has no position or its position has no Active Requirement Set. Do not report these cases as Gap.
- Recalculate after evidence confirmation, requirement activation or position change; Owner may request it organization-wide and Manager only within assigned departments. The recalculation is queued and reports Pending/Done/Failed with retry; retain prior result and history.
- Training completion, assessment results and certificates are shown as learning records and do not alter Confirmed Competency.
- Do not specify a grade-storage formula or number of stored levels while `GRADE-01` is pending.

**7.6.2 View My Competency Profile and Gap (UC-20)**
- Show the employee's position requirements, Confirmed Competency, gap states, learning and assessment status.
- Employee can view only their own records; recalculation is not available to Employee.

**7.6.3 View Team Skill Gap Matrix (UC-21)**
- Owner sees the organization; Manager sees assigned departments only. Enforce scope on the server.
- Compare members against their position requirements and show the time/current state of the result.

**7.6.4 View Workforce Analytics and Gap Heatmap (UC-22)**
- Owner sees organization-wide coverage; Manager sees assigned departments. Support filtering by department, position or TT02 domain.

**7.6.5 View Confirmed Competency History (UC-23)**
- Show prior/new level, source, responsible person, time and reason for correction. Evidence and Manual Override are distinct sources.

**7.6.6 Course Suggestions**
- The system proposes published standard courses by matching each Gap/Partial Gap competency to the versioned competency-course mapping. Show which gap competency is addressed and the mapped coverage; no hidden AI decision, risk/readiness score, weight, or unsupported ranking formula is required. Recommendations update when relevant requirement, confirmed competency, mapping or course version changes.
- Employee can start a recommended course; this creates/records learner participation without implying that OWNER assigned it. Do not create duplicate active learning records for the same employee and course version; if already assigned or started, show that status alongside the recommendation.
- OWNER assignment remains available as an explicit organization action, including course updates and retraining. Keep assignment source/reason, due date when supplied, and selected course version. Whether Owner-triggered retraining requires only final course assessment or also a Practical Task is **PENDING DECISION**.

**7.6.7 AI-assisted Practical Task evaluation (target requirement; scope pending)**
- When enabled by an approved AI scope, an evaluator may read only evidence the reviewer/task is authorized to access and compare it with the task's rubric version. Return proposed per-criterion outcome/score, rationale, evidence references and unmet/unclear criteria. The output is advisory and must remain distinguishable from a human decision.
- OWNER/MANAGER reviewer checks the evidence and AI output, may edit the evaluation, approve the result or request more evidence. Only a valid, approved human review can create/update Confirmed Competency; preserve the submitted evidence and prior evaluation/review history.
- Keep task numeric score separate from TT02 competency level. A rubric-to-level rule must be explicit and versioned before an approved review can confirm a level; the `GRADE-01` storage decision remains pending.
- Record the rubric version, AI evaluation result, model/version when available, reviewer decision, edits and timestamps for audit. Do not send evidence to an external evaluator unless the evidence is permitted for that processor and the AI scope/data handling is approved.

## 8. Non-screen functions

| ID | System function | Mô tả |
|----|-----------------|------|
| NS-1 | Recalculate Skill Gap | Recalculate affected members after evidence confirmation, requirement activation, position change or authorized request; queued with Pending/Done/Failed and retry. |
| NS-2 | Update Confirmed Competency | Update when level-confirming evidence is confirmed; write history. |
| NS-3 | Issue Certificate | Create a private certificate when a certificate-eligible course is complete and its final assessment is passed. |
| NS-4 | Create Notification | Write in-app notifications for assignments, feedback, confirmations, certificates and invitations; client polling. |
| NS-5 | Send Email | Send password resets, invitations and optional assignment notices through SMTP. |
| NS-6 | Record Audit Entry | Append an audit entry for sensitive actions. |
| NS-7 | Refresh Course Recommendations | Recompute explainable course recommendations when Skill Gap or competency-course mapping/course availability changes; recommendation does not enroll the employee. |
| NS-8 | Evaluate Practical Task Evidence (scope pending) | Produce advisory criterion-level evaluation against a retained rubric version; never updates Confirmed Competency without valid human approval. |

UC-24 maps to NS-1 and UC-31 maps to NS-3. NS-7/NS-8 are target system functions requiring Report 3 inventory/scope reconciliation; they do not assert implementation. Remaining NS functions are system behavior, not additional user-goal use cases.

## 9. Business Rules (BR)

| ID | Quy tắc |
|----|---------|
| BR-01 | Skill Gap is measured against the active requirement set of the employee's current position and Confirmed Competency. If none is active, skip and report; `Gap` means no confirmed level is available. |
| BR-02 | A requirement set moves Draft → Active → Archived; it cannot jump from Draft to Archived. |
| BR-03 | Activating a requirement set archives the previously active version for that position and starts recalculation. |
| BR-04 | Each requirement item references a competency in its TT02 version and a level supported by that version; the storage scale remains subject to GRADE-01. |
| BR-05 | Review creates evidence only for target competencies marked Passed. A Not Passed target has no evidence and does not change Confirmed Competency. |
| BR-06 | Confirmed Competency increases through authorized, level-confirming evidence. An Owner may decrease or reset it only to correct a data error, with reason and audit; Owner cannot correct their own grade. |
| BR-07 | Assessment results, course completion and certificates never change Confirmed Competency. |
| BR-08 | Course completion requires all required lessons and a passed final assessment. Certificate issuance additionally requires a certificate-eligible course. |
| BR-09 | A certificate is private to one employee, has Valid/Revoked status and no expiry. Only an eligible completed-and-passed course issues one. |
| BR-10 | Certificate QR verification requires a signed-in Owner or Manager of the issuing organization; only holder name, course/competency, issue date and status are returned. No public verification. |
| BR-11 | Business records are retired by status change, not hard delete. |
| BR-12 | Owner acts across their organization; Manager acts only on employees in currently assigned departments; Employee sees own records. The server enforces scope. |
| BR-13 | Platform Admin alone maintains TT02 versions, standard curriculum, question bank, standard assessments and reference positions. |
| BR-14 | The system recommends courses from Skill Gap and competency-course mapping; Employee may start a recommendation. Owner may also explicitly assign standard courses for organization updates/retraining. Manager may monitor training progress but does not assign courses in this release. |
| BR-15 | AI drafts require human approval before use; retain the AI-origin flag. |
| BR-16 | Published TT02 versions are immutable; a change creates a new version and requirement sets retain their framework version. |
| BR-17 | A member without a position or active requirement set is Not Assessed and excluded from gap calculation. |
| BR-18 | Editing a published course already assigned creates a new Course Version; an assignment retains its version. |
| BR-19 | Email delivery status is separate from the business record; a failed message is not reported as sent and can be resent. |
| BR-20 | Gap recalculation runs as a queued job after its triggering transaction; retry/failure does not undo confirmed evidence or history. |
| BR-21 | An assessment attempt retains its Assessment Version; assignment retains Course Version and Assessment Version. |
| BR-22 | System recommendations are derived from Skill Gap and versioned competency-course mappings; they are not enrollments or assignments. Employee may start a recommendation. |
| BR-23 | OWNER may separately assign courses for organization updates/retraining. Recommendation and assignment coexist and remain distinguishable; MANAGER has no course-assignment right in this baseline. |
| BR-24 | Course completion/assessment/certificate do not change Confirmed Competency. Whether an Owner-triggered retraining assignment additionally requires a Practical Task is PENDING DECISION. |
| BR-25 | AI Practical Task evaluation is advisory and scope-pending. Only a valid human-approved review may update Confirmed Competency; task score is distinct from competency level. Retain rubric version, AI output/model version when available, reviewer decision and edits. |
| BR-26 | Report 3 v2.3 does not yet inventory the recommendation/assignment distinction or AI-assisted evaluation consistently; reconcile UC, screens, API and permissions and Report 1/2 AI scope before treating these target requirements as implementation scope. |
| BR-LATE-01 | Late submissions are accepted, marked `IsLate`, and remain eligible for review and scoring. If a target competency passes, the review may create evidence under the normal confirmation rules. This confirmed rule supersedes Report 3 v2.3 §3.8.3, which says late submissions are not scored. |

## 10. Common Requirements (CR)

| ID | Yêu cầu chung |
|----|---------------|
| CR-01 | Mọi list có search, sort, server-side pagination (mặc định 20 dòng/trang) |
| CR-02 | Mọi form validate client + server; server là thẩm quyền cuối |
| CR-03 | Field bắt buộc đánh dấu trước khi submit |
| CR-04 | Xóa/thu hồi/archive hỏi xác nhận và nêu tên record |
| CR-05 | Ngày hiển thị dd/mm/yyyy, lưu UTC |
| CR-06 | Màn hình không được phép → trang access denied; API phía sau cũng chặn |
| CR-07 | Thao tác dài hiện loading; empty state có giải thích + hành động gợi ý |
| CR-08 | Giao diện dùng tiếng Anh (phạm vi demo) |

---

## 11. Application Messages (MSG)

| Mã | Loại | Ngữ cảnh | Nội dung |
|----|------|----------|----------|
| MSG01 | Error | Sai credentials | The email or password is incorrect. |
| MSG02 | Error | Khóa sau 5 lần sai | This account is temporarily locked after five failed attempts. Try again in 15 minutes. |
| MSG03 | Error | Session hết hạn | Your session has ended. Please sign in again. |
| MSG04 | Error | Ngoài quyền | You do not have permission to view this page. |
| MSG05 | Error | Thiếu field bắt buộc | This field is required. |
| MSG06 | Error | Trùng code/email | This value is already in use. Please enter a different one. |
| MSG07 | Error | Bộ tiêu chuẩn có dưới 9 (hoặc trên 24) năng lực của khung Thông tư 02/2025 | A requirement set needs between 9 and 24 competencies of the national digital competence framework (Circular 02/2025) before it can be activated (current: {count}). |
| MSG07b | Error | Bộ tiêu chuẩn thiếu năng lực lõi 4.1 / 4.2 | A requirement set must include the core safety competencies 4.1 (protecting devices) and 4.2 (protecting personal data and privacy). Missing: {codes}. |
| MSG08 | Error | Assessment không câu hỏi | Add at least one question before publishing this assessment. |
| MSG09 | Error | Task thiếu file/link | Attach a file or provide a link before submitting. |
| MSG10 | Error | Vượt attempt limit | You have used all attempts allowed for this assessment. |
| MSG11 | Error | File không hợp lệ | This file type or size is not accepted. Allowed types are listed beside the upload button. |
| MSG12 | Error | Mã xác minh không tồn tại | No certificate matches this code. Please check the code and try again. |
| MSG13 | Error | Vượt rate limit | Too many verification requests. Please wait a minute and try again. |
| MSG14 | Warning | Thiếu prerequisite | This employee has not completed the prerequisite course. You may continue, but the recommendation was based on completing it first. |
| MSG15 | Warning | Chưa có yêu cầu vị trí | This employee has no active position requirement, so gap and readiness figures cannot be calculated yet. |
| MSG16 | Warning | Chứng chỉ sắp hết hạn | This certificate expires in 30 days. |
| MSG17 | Warning | Risk chuyển high | Training risk for this employee is now high. |
| MSG18 | Information | Đã lưu | Your changes have been saved. |
| MSG19 | Information | Đã giao khóa | The course has been assigned and the employees have been notified. |
| MSG20 | Information | Đã cấp chứng chỉ | The certificate has been issued and is now available to the employee. |
| MSG21 | Information | Đã xác nhận evidence | The evidence has been confirmed and the competency profile has been updated. |
| MSG22 | Information | Danh sách rỗng | There is nothing to show here yet. |
| MSG23 | Confirm | Archive | Archive this record? It will no longer appear in active lists. |
| MSG24 | Confirm | Thu hồi chứng chỉ | Revoke this certificate? Anyone verifying it will see that it is no longer valid. A reason is required. |
| MSG25 | Confirm | Activate version mới | Activate this version? The current active version will be archived. |
| MSG26 | Confirm | Nộp bài | Submit your answers? You cannot change them afterwards. |
| MSG27 | Error | Tính gap: chưa có vị trí | The employee has no job position assigned. |
| MSG28 | Error | Tính gap: vị trí chưa có tiêu chuẩn | The employee's position has no active requirement set yet. |
| MSG29 | Error | Tính gap: nhân viên không active | Skill gap can only be calculated for active employees. |
| MSG30 | Error | Tính hàng loạt quá lớn | Too many employees in one batch — filter by department or position. |
| MSG31 | Error | Tự xác nhận năng lực | You cannot confirm your own competency level. |
| MSG32 | Error | Xung đột ghi đồng thời | The record was changed by someone else. Reload it and try again. |
| MSG33 | Information | Đã xác nhận cấp độ | {Level} confirmed — skill gap recalculated. |
| MSG34 | Information | Thông báo skill gap (in-app + realtime) | Your skill gap analysis was updated: {n} competency gap(s) remaining. |

---

## 12. Ma trận vết (Traceability)

| Feature (Report 1) | UC entries (Report 3 v2.3) |
|--------------------|----------------------------|
| FE-01 Authentication & Workspace | UC-01–06 |
| FE-02 Organization, Departments, Positions & Members | UC-16–18 |
| FE-03 TT02 Framework & Reference Positions | UC-07, UC-11, UC-15 |
| FE-04 Position Competency Requirements | UC-19 |
| FE-05 Competency Profile, Skill Gap & History | UC-20–24 |
| FE-06 Standard Learning, Assessment & Certificates | UC-08–10, UC-25–34 |
| FE-07 Practical Task & Evidence | UC-35–39 |
| FE-08 Dashboards & Notifications | UC-40–43 |
| FE-09 Platform Administration | UC-12–14, UC-44 |

Detailed UC-to-screen and Report 1 traceability is in `04_Use_Case_Danh_Sach_Dac_Ta.md` §8. The source report's course eligibility, private QR verification, role scope, version retention, evidence rules and the confirmed overrides are summarized in §9 above.

## 13. Trạng thái implementation và điểm mở

Các trạng thái “Đã hiện thực” dưới đây không được xác minh lại theo một commit cụ thể và đã được gỡ khỏi SRS để tránh nhầm requirement với implementation. Master Overview xác định requirement; trạng thái code cần kiểm tra source và test evidence riêng.

| Khu vực | Requirement | Trạng thái implementation |
|---------|-------------|----------------------------|
| 4 Enterprise roles và server-side scope | Theo §§5–7 và file 04 | Not verified |
| TT02, Position Requirement và Skill Gap states | Theo BR-01–04, BR-17 | Not verified |
| Course/Assessment version retention | Theo BR-18, BR-21 | Not verified |
| Eligible-course certificate, no expiry, same-org QR | Theo BR-08–10 | Not verified |
| Owner correction and late submission | Theo BR-06, BR-LATE-01 | Not verified |
| Recalculation queue, history, notifications and audit | Theo NS-1–NS-6 | Not verified |
| Course recommendation + explicit assignment coexistence | Theo BR-22–24; target inventory in file 04 §5.2 | Not verified; reconcile Report 3 |
| AI-assisted Practical Task evaluation | Theo BR-25–26; scope pending Report 1/2 | Scope not approved; implementation not verified |

`GRADE-01` remains **PENDING DECISION**. Report 3 v2.3's Record of Changes and §5.4 choose storage values 1–3; Master Overview says not to close that choice. Resolve it through a decision record before changing ERD, constraints, migrations or calculation logic.
