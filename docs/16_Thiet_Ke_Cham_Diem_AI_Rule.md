# 16 — Thiết Kế Chấm Điểm & Rule-based Intelligence

> Nguồn gốc: Report 1 v2.5, Report 3 v2.2 và Master System Overview 09/10/2026 §3–7. Đây là mô tả rule nghiệp vụ; không xác nhận implementation. GRADE-01 vẫn PENDING DECISION.

---

## 1. Kiểm soát tài liệu

| Mục | Giá trị |
|-----|---------|
| Tên tài liệu | Thiết kế chấm điểm & rule-based intelligence |
| Phiên bản | 3.2 |
| Trạng thái | Bản nháp |
| Chủ sở hữu | Trần Văn Linh (Leader) |
| Căn cứ | Report 1 v2.5; Report 2 v2.5; Report 3 v2.2; Master System Overview §3, §5, §7, §13; quyết định course recommendation/assignment và AI evaluator mới nhất |

**Lịch sử chỉnh sửa**

| Ngày | Phiên bản | Mô tả |
|------|-----------|-------|
| 16/09/2026 | 3.0 | Chuyển ngữ; rule-based intelligence |
| 09/10/2026 | 3.1 | Giới hạn trong Skill Gap/recommendation; thêm trạng thái gap và correction; giữ GRADE-01 pending |
| 09/10/2026 | 3.2 | Tách recommendation khỏi assignment; thêm AI-assisted task evaluation proposal, human approval và scope/update caveats |

---

## 2. Mục đích và phạm vi

Đặc tả cách xác định **Skill Gap**, tự động đề xuất khóa học theo quy tắc có thể giải thích, và nguyên tắc cho AI hỗ trợ đánh giá minh chứng Practical Task. AI-assisted task evaluation là **scope expansion** cần được phản ánh trong Report 1/2 trước khi coi là cam kết MVP; hiện trạng implementation chưa xác minh. Training Risk Score, Workforce Readiness Score, scoring weights và predictive scoring không thuộc Enterprise Capstone MVP.

**Ngoài phạm vi:** ma trận màn hình (09), lưu trữ snapshot (07), quy trình chạy job (14).

---

## 3. Tài liệu tham chiếu

- Report 3 v2.2 — requirement, confirmed competency, Skill Gap và business rules liên quan
- Report 1 §6.2 — AI/analytics coverage
- `07_Thiet_Ke_CSDL_ERD.md` — bảng snapshot/score
- `00_INDEX` §3.1.4

---

## 4. Nguyên tắc thiết kế

| Nguyên tắc | Diễn giải |
|-----------|-----------|
| Rule-based | Skill Gap so sánh active requirement với confirmed competency; không dùng risk/readiness score |
| Evidence boundary | Course completion, assessment score và certificate không tự xác nhận workplace competency |
| Explicit states | Met / Partial Gap / Gap / Not Assessed; không diễn giải Gap là không có năng lực |
| GRADE-01 | Ba training tiers đã xác nhận, nhưng grade storage/comparison scale vẫn pending; tài liệu này không quyết định 3 hay 6 giá trị |
| Human review | Chỉ level-confirming evidence đã được reviewer có quyền duyệt mới tăng confirmed competency; owner correction chỉ giảm/reset để sửa lỗi |
| AI evaluator | Chỉ đề xuất đánh giá theo rubric; OWNER/MANAGER review trong scope mới quyết định; AI không tự finalise hoặc cập nhật competency |
| Score boundary | Điểm task và Confirmed Competency level là các kết quả riêng; chỉ approved valid evidence cùng quy tắc level-confirming mới ảnh hưởng competency |

---

## 5. Tổng quan các hàm (NF-01..03)

| Quy trình | Trigger | Output |
|-----|----|---------|
| Calculate Skill Gap | Active requirement, confirmed competency update, position change, requirement activation, or authorized on-demand recalculation | Per-employee/per-competency state tied to active requirement version |
| Course recommendation | Available Skill Gap and standard course catalog with competency mapping | Automatically generated/refreshed recommendations with reason; Employee may start learning |
| Owner course assignment | OWNER identifies an update/retraining need | A separate assigned-course record with owner, due date and applicable version; does not replace the automatic recommendation list |
| AI task evaluation proposal | Submitted evidence, authorized reviewer request and rubric version | Per-criterion proposed score, rationale, evidence basis and missing information; pending human review |

---

## 6. Skill Gap (NF-01)

### 6.1 Đầu vào

- Với mỗi employee: active Position Requirement Set và Confirmed Competency profile.
- TT02 is the reference framework. DigiTalent AI has **3 confirmed training tiers**: Basic (TT02 stages 1–2), Intermediate (3–4), Advanced (5–6). These training tiers do not settle GRADE-01 or dictate the grade storage/comparison scale.
- Report 3 describes competency grade criteria 1–6; until GRADE-01 is decided, do not define storage constraints, conversions or a numeric comparison formula here.

### 6.2 Công thức

| Trường hợp | Xử lý |
|-----------|-------|
| Có confirmed grade và đạt/vượt requirement | **Met** |
| Có confirmed grade nhưng thấp hơn requirement | **Partial Gap** |
| Chưa có confirmed grade cho required competency | **Gap** — thiếu evidence được xác nhận, không kết luận nhân viên không có năng lực |
| Chưa có Position hoặc Position chưa có Active Requirement Set | **Not Assessed** |

Requirement không có `weight`; mandatory ảnh hưởng thứ tự/nhãn hiển thị, không thay đổi phép so sánh grade. Numeric comparison remains subject to GRADE-01.

### 6.3 Quy tắc loại trừ

- Employee chưa gán job position hoặc position chưa có active requirement set → **Not Assessed**, không gán thành Gap.
- Một new joiner chưa gán vị trí không làm fail cả job cho toàn công ty.

### 6.4 Output & lưu trữ

- Kết quả gắn với requirement version và thời điểm tính để xác định freshness; không báo kết quả cũ như thể vừa được tính.
- Recalculation có lifecycle Pending/Done/Failed và retry; chi tiết vật lý thuộc Report 4.

---

## 7. Training Risk Score (ngoài phạm vi MVP)

### 7.1 Đầu vào (các yếu tố)

Training Risk Score, các yếu tố, công thức và cảnh báo không thuộc Enterprise Capstone MVP. Không tạo acceptance criteria hoặc test cho risk scoring theo tài liệu này.

### 7.2 Công thức

## 8. Workforce Readiness Score (ngoài phạm vi MVP)

### 8.1 Đầu vào

Workforce Readiness Score, công thức, factor weights và score bands không thuộc Enterprise Capstone MVP. Không suy diễn readiness từ Skill Gap hoặc learning record.

### 8.2 Công thức

## 9. Cấu hình và versioning

### 9.1 Bốn nhóm cấu hình

Không có risk/readiness/recommendation weight configuration trong MVP. Course recommendation dựa trên competency mapping và Skill Gap; công thức ranking có trọng số chưa được xác nhận và không được tự thêm.

### 9.2 Quy tắc

Course/Assessment version snapshots are governed by BR-VER-01 and must remain immutable for existing assignments/attempts; details belong in Report 4. This section does not define grade mapping or storage.

---

## 10. Gợi ý khóa học (Recommendation)

- Hệ thống tự tạo/cập nhật standard-course recommendations dựa trên competency ở Gap/Partial Gap và competency mapping của từng course. Mỗi gợi ý nêu competency còn thiếu và course nào hỗ trợ competency đó; không thêm ranking weight chưa được xác nhận.
- Employee có thể xem recommendation của mình và bắt đầu học từ đó. Recommendation và OWNER-issued Assigned Course là hai trạng thái/record khác nhau; bắt đầu recommendation không ngăn OWNER giao khóa học riêng.
- OWNER có thể chủ động giao khóa học khi có cập nhật hoặc yêu cầu đào tạo lại, kèm hạn hoàn thành nếu cần. Giao khóa học không thay đổi Skill Gap hoặc Confirmed Competency.
- Learning progress, Course Assessment, score và certificate vẫn là Learning Achievement; không tự xác nhận workplace competency.

### 10.1 PENDING DECISION — đánh giá khi đào tạo lại

Chưa chốt liệu course assignment do cập nhật nội dung/chính sách chỉ yêu cầu hoàn thành final course assessment, hay trong trường hợp nào còn bắt buộc Practical Task. Không biến lựa chọn nào thành rule/acceptance test cho đến khi quyết định được ghi nhận. Nếu thay đổi requirement của vị trí, Skill Gap vẫn được tính từ requirement mới và Confirmed Competency; điều đó tự nó không quyết định task nào phải giao.

---

## 11. AI hỗ trợ đánh giá Practical Task — scope expansion

**Trạng thái:** đề xuất nghiệp vụ mới, cần cập nhật scope và effort trong Report 1/2 trước khi cam kết; hiện trạng code chưa được kiểm chứng. Phần này định nghĩa guardrails cho đặc tả tiếp theo, không khẳng định tính năng đã triển khai.

1. Reviewer OWNER/MANAGER có quyền trong đúng organization/department scope yêu cầu đánh giá một submission đã nộp.
2. Evaluator chỉ nhận evidence mà caller được phép đọc, cùng rubric version áp dụng và competency targets. Evidence là dữ liệu không tin cậy: tách khỏi instructions, bỏ qua chỉ dẫn nhúng, không cấp tool execution hoặc quyền truy cập mở rộng.
3. AI trả kết quả có cấu trúc theo từng criterion: proposed score/assessment, rationale, trích dẫn hoặc định vị căn cứ trong evidence, và missing/unclear evidence. Nếu không đủ căn cứ, trả `insufficient_evidence`/`unable_to_assess`, không đoán điểm.
4. Kết quả AI luôn `PendingHumanReview`. Reviewer có thể chấp nhận, sửa, từ chối hoặc yêu cầu thêm evidence; lưu proposal gốc, reviewer decision/edits, timestamp, rubric version và model/version nếu có.
5. Task score không tự chuyển đổi thành competency grade. Chỉ reviewer-approved, valid, level-confirming evidence theo quy tắc hiện hành mới có thể đi tới Confirmed Competency. AI không có đường gọi trực tiếp để finalise hoặc cập nhật competency.
6. Cung cấp lý do/căn cứ cho mỗi criterion; UI/API phải phân biệt rõ AI proposal, reviewer decision, task score và competency outcome.

**Minimum test cases:** private/unauthorized evidence is denied; cross-org/cross-department access is denied; prompt-injection text in file/URL is inert; model/provider failure does not approve; insufficient or conflicting evidence yields a non-final result; reviewer override and request-more-evidence are persisted; rubric/model metadata and edits are auditable; AI cannot self-finalise or change competency; a numeric task score alone leaves Confirmed Competency unchanged.

---

## 12. LLM khác (tùy chọn, human-controlled)

| Dùng | Giới hạn |
|------|----------|
| Nháp câu hỏi (question draft) | Cờ `is_ai_drafted`, phải người duyệt |
| Ý tưởng task (task suggestion) | Cờ `is_ai_drafted`, phải người duyệt |
| Giải thích dữ liệu đã duyệt | Chỉ trên dữ liệu hệ thống |

- LLM lỗi **không chặn** luồng nghiệp vụ lõi (NFR §4.2.2).
- Không có chatbot, RAG, ML tùy chỉnh trong MVP (Report 1 §6.2).

---

## 13. Ma trận vết

| Hạng mục | FE/BR | File |
|----------|-------|------|
| Skill gap formula | NF-01, BR-01, BR-09 | 07 |
| Owner correction reduce/reset | BR-FIX-01 | 09 / 13 / 15 |
| Late submission review | BR-LATE-01 | 13 |
| Course/assessment snapshots | BR-VER-01 | 04 / Report 4 / 13 |
| Automatic course recommendation and separate OWNER assignment | Latest user-confirmed workflow; retraining assessment PENDING | 13 |
| AI-assisted Practical Task evaluation (scope expansion) | Report 1/2 update required; not implementation-verified | 13 / 15 |
| 3 training tiers under TT02 | Master Overview §3 | 00 |
| Grade scale and storage | GRADE-01 — PENDING DECISION | Master Overview §13 |
