# 05 — Luồng Nghiệp Vụ & User Flow

> Nguồn gốc: Report 3 §3 (functional flows) + cấu trúc flow F00–F23. Phiên bản docs_v3, tiếng Việt.

---

## 1. Kiểm soát tài liệu

| Mục | Giá trị |
|-----|---------|
| Tên tài liệu | Luồng nghiệp vụ & user flow |
| Phiên bản | 3.0 |
| Trạng thái | Bản nháp |
| Chủ sở hữu | Trần Văn Linh (Leader) |
| Căn cứ | Report 3 §3.1–§3.11 |

**Lịch sử chỉnh sửa**

| Ngày | Phiên bản | Mô tả |
|------|-----------|-------|
| 16/09/2026 | 3.0 | Chuyển ngữ; mô tả 24 flow F00–F23; căn chỉnh theo 3-level (bỏ career grade) |

---

## 2. Mục đích và phạm vi

Mô tả **luồng nghiệp vụ end-to-end** ở mức thao tác — ai làm gì, theo thứ tự nào, chuyển trạng thái ra sao. Tài liệu này kết nối 46 use case (file 04) thành chuỗi công việc và làm rõ **state transition** (nơi phần lớn bug xảy ra khi record chuyển sang trạng thái không hợp lệ).

**Ngoài phạm vi:** chi tiết chức năng (03A), đặc tả UC (04), thiết kế màn hình (10).

---

## 3. Tài liệu tham chiếu

- Report 3 — *Software Requirement Specification* §3
- `04_Use_Case_Danh_Sach_Dac_Ta.md`
- `03A_SRS_Yeu_Cau_Chuc_Nang.md`
- `00_INDEX_Tong_Quan_Tai_Lieu.md`

---

## 4. Ký hiệu luồng (Flow Notation)

| Ký hiệu | Ý nghĩa |
|---------|---------|
| **Actor** | Vai trò thực hiện bước (HR, Dept Manager, Trainer, Employee, Admin, Public, Scheduler) |
| **Precondition** | Điều kiện phải đúng trước khi luồng chạy |
| **Steps** | Các bước tuần tự |
| **Postcondition** | Trạng thái sau khi luồng thành công |
| **Exception path** | Nhánh thay thế / lỗi |
| **Scheduler** | Tiến trình nền, không có người điều khiển (xem 03A §8) |

---

## 5. Bản đồ actor và ranh giới trách nhiệm

| Actor | Trách nhiệm | Phạm vi dữ liệu | Flow |
|-------|-------------|-----------------|------|
| System Admin | Tài khoản, vai trò, quyền, master data, cấu hình, audit | Toàn hệ thống | F01, F02, F22 |
| HR / Training Manager | Đào tạo, nhân viên, khung năng lực, gán khóa học, chứng chỉ, analytics công ty | Toàn công ty | F00, F02, F03, F04, F07, F12, F19 |
| Department Manager | Theo dõi nhân viên phòng ban, gap, giao task, đánh giá bằng chứng | Chỉ phòng ban mình | F12, F15, F16, F18, F19 |
| Internal Trainer | Khóa học, bài học, ngân hàng câu hỏi, assessment, nháp AI | Nội dung khóa mình viết | F05, F06, F09 |
| Employee | Học, thi, nhận chứng chỉ, nộp task | Bản thân | F08, F09, F13, F16 |
| Public Visitor | Xác minh chứng chỉ công khai | Chỉ kết quả xác minh | F13 |
| System / Scheduler | Tính risk/readiness, nhắc hết hạn, expire cert, notification | Quy tắc dịch vụ | F12, F14, F18, F20 |

---

## 6. Kiến trúc quy trình nghiệp vụ (Business Process Architecture)

| Nhóm | Flow | Vai trò |
|------|------|---------|
| A. Quản trị & master data | F00–F04, F22 | Định nghĩa Job Architecture, quyền truy cập, cấu trúc tổ chức |
| B. Học tập & đánh giá | F05–F09 | Tạo nội dung học, gán, ghi nhận kết quả |
| C. Thông minh & hỗ trợ quyết định | F10–F12, F18–F21 | Biến dữ liệu vận hành thành gap, gợi ý, risk, readiness |
| D. Chứng chỉ & bằng chứng | F13–F17 | Biến kết quả học + task thành record xác minh được |
| E. Thông báo & vận hành | F20, F22 | Giữ người dùng được báo tin và truy vết được hành động |

---

## 7. Luồng nghiệp vụ chi tiết (F00–F23)

### F00 — Job Architecture Setup

| Mục | Nội dung |
|------|----------|
| Actor | HR / Training Manager |
| Precondition | Đã có quyền HR |
| Steps | 1. Duy trì 5 job family → 2. Duy trì 7 vị trí mẫu (gán family + tham chiếu DigComp 3.0) → 3. Duy trì thư viện ~40 competency → 4. Viết level criteria 3 mức |
| Postcondition | Job architecture + competency library sẵn sàng cho requirement set |
| Exception | Archive family/vị trí còn dùng bị từ chối (BR-11) |

> ⚠️ docs_v3 **không có bước tạo Career Grade** — trục này bị loại bỏ (xem `00_INDEX` §3.1.3). Thang mức duy nhất là 3 competency level (Basic/Intermediate/Advanced), cấu hình ở UC-10.

### F01 — Authentication & Role-Based Access

| Mục | Nội dung |
|------|----------|
| Actor | Tất cả actor + Public (xác minh) |
| Steps | 1. Đăng nhập email/password → 2. Nhận access + refresh token, session gắn vai trò → 3. Điều hướng dashboard theo vai trò |
| Postcondition | Session đúng vai trò, scope đúng |
| Exception | Sai 5 lần → khóa 15 phút (NIST); khóa tài khoản; hết session; 403/404 |

### F02 — Organization & Employee Setup

| Mục | Nội dung |
|------|----------|
| Actor | Admin/HR |
| Steps | 1. Dựng cây phòng ban + gán manager → 2. Tạo hồ sơ nhân viên (phòng ban, vị trí, quản lý trực tiếp) |
| Postcondition | Nhân viên thuộc phòng ban + vị trí, sẵn sàng tính gap |
| Exception | Department còn nhân viên → không xóa, chỉ archive; manager loop → từ chối; nhân viên chưa gán vị trí → "Chưa có yêu cầu" (BR-09) |

> ⚠️ Report 3 gốc có trường "career grade" trong hồ sơ nhân viên và quy tắc "Not Graded". docs_v3 thay bằng **"chưa gán Job Position"** làm tiêu chí loại khỏi gap/risk/readiness.

### F03 — Competency Framework Setup

| Mục | Nội dung |
|------|----------|
| Actor | HR |
| Steps | 1. Nhóm competency (category) → 2. Tạo competency (4 loại: core digital/professional/internal/behavioural) → 3. Viết level criteria 3 mức |
| Postcondition | Thư viện năng lực + tiêu chí mức đầy đủ |

### F04 — Position Requirement Mapping

| Mục | Nội dung |
|------|----------|
| Actor | HR |
| Steps | 1. Chọn vị trí → 2. Nháp requirement set (9–14 competency, mỗi dòng: required level, weight, bắt buộc, cần evidence thực hành) → 3. Kích hoạt version |
| Postcondition | Có đúng 1 active set cho vị trí (BR-01, BR-03) |
| Exception | <9 hoặc >14 competency → từ chối (MSG07); kích hoạt bản 2 khi đã active → xác nhận archive bản cũ (MSG25); không nhảy draft → archived (BR-02) |

> ⚠️ Requirement set khóa theo **position** (đã bỏ "position + career grade").

### F05 — Course, Lesson & Material Authoring

| Mục | Nội dung |
|------|----------|
| Actor | Trainer |
| Steps | 1. Dựng course (code, title, difficulty, completion rule, validity cert) → 2. Thêm bài + material (file/link/text) → 3. Gắn ≥1 competency mục tiêu → 4. Đặt prerequisite → 5. Publish |
| Postcondition | Course published, sẵn sàng gán + xuất hiện trong gợi ý |
| Exception | Publish khi chưa gắn competency → từ chối; file không hợp lệ/quá cỡ → MSG11 (giữ form) |

### F06 — Question Bank & Assessment Authoring

| Mục | Nội dung |
|------|----------|
| Actor | Trainer |
| Steps | 1. Tạo câu hỏi (MCQ/true-false, gắn competency, độ khó) → 2. Ghép quiz → 3. Đặt pass score, thời gian, số attempt → 4. Publish |
| Postcondition | Assessment published |
| Exception | MCQ cần ≥2 đáp án + đúng 1 đáp án; publish khi chưa có câu hỏi → MSG08; câu hỏi AI nháp phải duyệt (Human-controlled AI) |

### F07 — Course Assignment & Enrollment

| Mục | Nội dung |
|------|----------|
| Actor | HR |
| Steps | 1. Chọn course → 2. Chọn nhân viên (lọc theo phòng ban/family) → 3. Đặt due date + lý do (manual/skill gap/department-wide/position-wide) → 4. Gán |
| Postcondition | Mỗi người nhận enrollment Not Started + notification |
| Exception | Đã enroll → bỏ qua; thiếu prerequisite → cảnh báo (MSG14, không chặn) |

### F08 — Employee Learning

| Mục | Nội dung |
|------|----------|
| Actor | Employee |
| Steps | 1. Mở khóa học từ danh sách → 2. Học material bắt buộc → 3. Resume tại material dở dang → 4. Hoàn thành material bắt buộc → mở khóa quiz cuối |
| Postcondition | Progress cập nhật; quiz cuối mở khi đủ material bắt buộc (BR-07) |
| Exception | Material lỗi load → retry/download trực tiếp |

### F09 — Assessment Attempt & Scoring

| Mục | Nội dung |
|------|----------|
| Actor | Employee |
| Steps | 1. Mở assessment → 2. Làm quiz (đếm ngược) → 3. Nộp → 4. Chấm server → 5. Nhận pass/fail |
| Postcondition | Attempt được lưu; đạt quiz cuối → kích hoạt cấp chứng chỉ (BR-06) |
| Exception | Hết giờ → tự nộp (câu chưa trả lời = 0); hết attempt → chặn trước khi bắt đầu (MSG10); mất kết nối → resume cùng attempt |

### F10 — Skill Gap Analysis

| Mục | Nội dung |
|------|----------|
| Actor | Scheduler (đêm) + HR (recalculate thủ công) |
| Steps | 1. Với mỗi nhân viên có vị trí: lấy active requirement set → 2. Trừ confirmed level → 3. Phân loại gap low/medium/high → 4. Ưu tiên theo gap × weight (mandatory nâng) → 5. Lưu snapshot theo version + run number |
| Postcondition | Mỗi nhân viên + competency có 1 dòng snapshot, không ghi đè (giữ lịch sử) |
| Exception | Không có active set → bỏ qua + báo cáo (BR-01); chưa gán vị trí → bỏ qua + báo "chưa có yêu cầu" (BR-09) |

### F11 — Learning Recommendation

| Mục | Nội dung |
|------|----------|
| Actor | HR / Employee |
| Steps | 1. Từ gap → xếp hạng khóa học theo mức lấp gap còn lại → 2. Gắn lý do gợi ý → 3. HR duyệt/override hoặc Employee tự enroll (nếu mở) |
| Postcondition | Gợi ý khóa học khép kín gap |
| Exception | Gợi ý là advice, HR có thể override |

### F12 — Training Risk Detection & Escalation

| Mục | Nội dung |
|------|----------|
| Actor | Scheduler |
| Steps | 1. Tổng hợp: inactivity, điểm thấp, áp lực deadline, attempt fail, chậm tiến độ → 2. Tính risk theo trọng số active → 3. Lưu score + factor breakdown |
| Postcondition | Mỗi nhân viên 1 dòng risk mỗi run |
| Exception | Risk chuyển high → cảnh báo manager (MSG17) |

### F13 — Certificate Issuance & QR Verification

| Mục | Nội dung |
|------|----------|
| Actor | Scheduler (cấp tự động) + Employee + Public |
| Steps | 1. Đạt quiz cuối của course hoàn thành → 2. Sinh code duy nhất + link xác minh + QR + ngày cấp/hết hạn → 3. Ghi PDF lên MinIO → 4. Thông báo holder → 5. Public quét QR nhập code → xem holder/competency/ngày/status |
| Postcondition | Certificate VALID, xác minh được công khai (BR-10) |
| Exception | PDF fail → cert vẫn tạo, PDF sinh lại khi cần; code không tồn tại → MSG12; >20 check/phút → MSG13 |

### F14 — Certificate Expiry, Revocation & Renewal

| Mục | Nội dung |
|------|----------|
| Actor | Scheduler (expire) + HR/Admin (revoke) |
| Steps | 1. Quá hạn → set EXPIRED → 2. Trước 30 ngày nhắc holder (MSG16) → 3. HR thu hồi kèm lý do + xác nhận (MSG24) |
| Postcondition | Status cập nhật VALID/EXPIRED/REVOKED, ghi audit |
| Exception | Revoke không undo từ màn hình; đảo ngược là việc admin |

### F15 — WMS-lite Practical Task Assignment

| Mục | Nội dung |
|------|----------|
| Actor | Department Manager |
| Steps | 1. Chọn template (hoặc viết mới) → 2. Gán competency mục tiêu + target level → 3. Gán nhân viên trong phòng ban → 4. Đặt due date + reviewer |
| Postcondition | Task được gán + notification |
| Exception | Gán người ngoài phòng ban → server từ chối (BR-12); template thiếu competency → từ chối |

### F16 — Task Submission & Evaluation

| Mục | Nội dung |
|------|----------|
| Actor | Employee (nộp) + Department Manager (đánh giá) |
| Steps | 1. Nộp note + file/link (PR/repo) → 2. Reviewer chấm theo rubric + level criteria → 3. Verdict passed/needs revision/failed → 4. Confirm → tạo evidence mỗi competency |
| Postcondition | Evidence Confirmed → profile nâng (BR-04, BR-05) |
| Exception | Nộp thiếu file+link → MSG09; nộp trễ → đánh dấu late, feed risk; cần sửa → giữ version cũ (superseded) |

### F17 — Competency Evidence Portfolio Update

| Mục | Nội dung |
|------|----------|
| Actor | Department Manager |
| Steps | 1. Duyệt evidence tích lũy (employee/competency/nguồn) → 2. Evidence mới mạnh hơn thay thế (giữ cũ, đánh dấu) |
| Postcondition | Portfolio phản ánh progression |
| Exception | Evidence cũ không xóa (BR-11) |

### F18 — Workforce Readiness Score Calculation

| Mục | Nội dung |
|------|----------|
| Actor | Scheduler (sau job gap) |
| Steps | 1. Tổng hợp: competency coverage, certificate, learning progress, task performance → 2. Tính readiness theo trọng số → 3. Lưu score + band + breakdown |
| Postcondition | Mỗi nhân viên 1 dòng readiness mỗi run |
| Exception | Chưa gán vị trí → bỏ qua (BR-09) |

### F19 — HR & Manager Dashboard

| Mục | Nội dung |
|------|----------|
| Actor | HR (toàn công ty) + Dept Manager (phòng ban mình) |
| Steps | 1. Xem readiness/risk/gap → 2. HR: lọc theo family, cert sắp hết hạn → 3. Manager: submission chờ duyệt → 4. Click-through vào record gốc |
| Postcondition | Số liệu luôn kèm thời gian tính |
| Exception | Manager chỉ thấy phòng ban mình (BR-12) |

### F20 — Notification & Reminder

| Mục | Nội dung |
|------|----------|
| Actor | Scheduler (sinh) + tất cả actor (đọc) |
| Steps | 1. Sự kiện tạo thông báo (gán course/task/assessment, feedback, cấp cert, hết hạn 30 ngày, risk high) → 2. Realtime qua SignalR → 3. Click mở record + đánh dấu đọc |
| Postcondition | Người dùng chỉ thấy thông báo gửi cho mình |

### F21 — Career & Promotion Readiness (Optional / Bonus)

| Mục | Nội dung |
|------|----------|
| Actor | HR |
| Ghi chú | Ngoài MVP. docs_v3 không dùng trục career grade; nếu cần "Senior/Manager/Director" thì mô hình hóa thành **Job Position riêng**, không phải bậc gắn lên vị trí. |

### F22 — Admin Configuration & Audit

| Mục | Nội dung |
|------|----------|
| Actor | System Admin |
| Steps | 1. Quản lý tài khoản + gán vai trò → 2. Cấu hình ma trận RBAC → 3. Cấu hình scoring weight + level mapping (3 mức) + general settings → 4. Tra cứu audit log |
| Postcondition | Cấu hình versioned (một active/key, BR-08); mọi thay đổi nhạy cảm ghi audit |
| Exception | Không thể xóa quyền admin của chính mình; weight phải cộng = 100% |

### F23 — End-to-End Capability Development Demo

| Mục | Nội dung |
|------|----------|
| Actor | HR → Employee → Dept Manager → Public |
| Steps | 1. HR định nghĩa yêu cầu vị trí → 2. Hệ thống tính gap → 3. Gợi ý khóa học → 4. Employee học + đạt quiz → 5. Cấp chứng chỉ QR → 6. Public xác minh → 7. Manager giao task → 8. Employee nộp → 9. Manager confirm evidence → 10. Gap/readiness cập nhật lại |
| Postcondition | Vòng lặp kín từ yêu cầu → gap → học → chứng chỉ → bằng chứng |

---

## 8. Mô hình chuyển trạng thái (State Transition)

> Phần lớn bug xảy ra khi record chuyển sang trạng thái không hợp lệ — các luồng chuyển hợp lệ được khóa dưới đây.

| Entity | Luồng trạng thái hợp lệ | Quy tắc quan trọng |
|--------|-------------------------|---------------------|
| Course | Draft → Published → Archived | Chỉ Published gán được |
| Lesson progress | Not Started → In Progress → Completed | Cập nhật idempotent |
| Enrollment | Assigned → In Progress → Completed / Failed / Overdue / Cancelled | Completion theo course rule (BR-07) |
| Assessment attempt | Started → Submitted → Scored → Passed / Failed | Không sửa sau nộp |
| Certificate | Valid → Expired / Revoked | Chỉ Valid tính vào score |
| Practical task | Draft → Assigned → In Progress → Submitted → Evaluated → Closed | Evidence chỉ tạo sau evaluation hợp lệ |
| Competency evidence | Candidate → Confirmed / Rejected / Superseded | Confirmed có thể nâng profile |
| Position Requirement Set | Draft → Active → Archived | Một active cho mỗi position (BR-02, BR-03) |

---

## 9. Quy tắc nghiệp vụ xuyên flow (Cross-Flow Business Rules)

| Rule ID | Quy tắc | Flow liên quan |
|---------|---------|----------------|
| CF-BR-01 | Competency Level ≠ bậc tổ chức; một thang 3 mức duy nhất (Basic/Intermediate/Advanced) | F00, F02 |
| CF-BR-02 | Requirement Set phải active trước khi tính Skill Gap | F10 |
| CF-BR-03 | Khi cập nhật Requirement Set → recalculate gap cho mọi employee có vị trí đó | F00, F10 |
| CF-BR-04 | Chứng chỉ chỉ cấp khi đủ hoàn thành course + đạt quiz | F09, F13 |
| CF-BR-05 | Department Manager chỉ xem/đánh giá nhân viên trong phòng ban được ủy quyền | F02, F15, F16, F19 |

---

## 10. Ma trận vết (Flow → UC → Section Report 3)

| Flow | UC liên quan | Section Report 3 |
|------|--------------|------------------|
| F00 | UC-14, 16, 20, 21, 22 | §3.4 |
| F01 | UC-01..06, 46 | §3.2, §3.8 |
| F02 | UC-18, 19 | §3.3 |
| F03 | UC-20, 21, 22 | §3.4 |
| F04 | UC-17 | §3.4.4 |
| F05 | UC-35 | §3.5.1 |
| F06 | UC-36, 37 | §3.6 |
| F07 | UC-24 | §3.5.2 |
| F08 | UC-41, 42 | §3.5.3–3.5.4 |
| F09 | UC-43 | §3.6.3 |
| F10 | NF-01 | §3.7.1 |
| F11 | UC-24, 41 | §3.7 |
| F12 | NF-02 | §3.10.1 |
| F13 | NF-03, UC-45, 46 | §3.8 |
| F14 | NF-04, UC-27 | §3.8.3 |
| F15 | UC-30, 31 | §3.9.1–3.9.2 |
| F16 | UC-32, 44 | §3.9.3–3.9.4 |
| F17 | UC-33 | §3.9.5 |
| F18 | NF-02 | §3.10.1 |
| F19 | UC-23, 28, 34, 39 | §3.10.2 |
| F20 | NF-05, NF-06, UC-07 | §3.10.3 |
| F21 | (ngoài MVP) | — |
| F22 | UC-08..13 | §3.11 |
| F23 | Tổng hợp end-to-end | §3.1 |
