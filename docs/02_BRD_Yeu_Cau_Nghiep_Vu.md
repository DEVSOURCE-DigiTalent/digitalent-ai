> **LEGACY / ARCHIVED — NOT CANONICAL.** Retained as historical context. Use `02_BRD_Business_Requirement_DigiTalent_AI.md` and `DigiTalent_AI_MASTER_SYSTEM_OVERVIEW_2026-10-09.md` for the current Enterprise Capstone baseline.

# 02 — BRD: Tài liệu Yêu Cầu Nghiệp Vụ

> Nguồn gốc: Report 1 (§2–4) + Report 2 (PMP). Phiên bản docs_v3, tiếng Việt.

---

## 1. Kiểm soát tài liệu

| Mục | Giá trị |
|-----|---------|
| Tên tài liệu | Business Requirements Document (BRD) |
| Phiên bản | 3.0 |
| Trạng thái | Bản nháp |
| Chủ sở hữu | Trần Văn Linh (Leader) |
| Căn cứ | Report 1, Report 2 |

**Lịch sử chỉnh sửa**

| Ngày | Phiên bản | Mô tả |
|------|-----------|-------|
| 16/09/2026 | 3.0 | Chuyển ngữ, căn chỉnh theo Reports |

---

## 2. Mục đích và phạm vi

BRD mô tả yêu cầu ở **tầm nghiệp vụ** — bài toán, mục tiêu, bên liên quan, quy trình As-Is/To-Be, năng lực nghiệp vụ, quy tắc và tiêu chí chấp nhận — **trước khi** chuyển thành yêu cầu hệ thống chi tiết (SRS). BRD trả lời "tại sao và cái gì ở mức nghiệp vụ"; SRS trả lời "hệ thống làm gì".

**Ngoài phạm vi:** chi tiết chức năng/NFR (xem 03A/03B), thiết kế kỹ thuật (06–08).

---

## 3. Tài liệu tham chiếu

- Report 1 — *Project Introduction*
- Report 2 — *Project Management Plan*
- `01_Tong_Quan_Du_An.md`, `00_INDEX_Tong_Quan_Tai_Lieu.md`

---

## 4. Tóm tắt nghiệp vụ

DigiTalent AI giải bài toán: **doanh nghiệp không xác minh được nhân viên đã đủ năng lực số cho vị trí hay chưa, và không có bằng chứng chứng minh điều đó.** Giá trị lõi là biến "đã đào tạo" thành "đủ năng lực + có bằng chứng xác minh được", gắn chặt với yêu cầu vị trí công việc.

---

## 5. Bối cảnh và phát biểu bài toán

**Bối cảnh:** chuyển đổi số khiến yêu cầu năng lực số với người lao động tăng nhanh. Đào tạo nội bộ hiện nay rời rạc, không cá nhân hóa theo vị trí, không đo được hiệu quả và không xác minh được kết quả.

**Vấn đề nghiệp vụ lõi (viết lại từ Report 1):**

| # | Vấn đề |
|---|--------|
| P-01 | Dữ liệu đào tạo phân mảnh (folder, email, chat, bảng tính) |
| P-02 | Hoàn thành khóa học ≠ đủ năng lực cho vị trí |
| P-03 | Khóa học không gắn với competency/level/vị trí/phòng ban |
| P-04 | Chứng chỉ nội bộ cấp thủ công, thiếu mã/QR/hết hạn/thu hồi/audit |
| P-05 | Quản lý thiếu tầm nhìn về tiến độ, rủi ro, readiness |
| P-06 | Bằng chứng sau đào tạo không liên kết về hồ sơ năng lực |

---

## 6. Tầm nhìn và mục tiêu nghiệp vụ

**Tầm nhìn:** Giúp doanh nghiệp vừa và nhỏ *Định nghĩa → Đào tạo → Đánh giá → Xác minh* đúng năng lực số từng vị trí cần.

**Mục tiêu nghiệp vụ:**

| # | Mục tiêu |
|---|----------|
| OBJ-01 | Số hóa quy trình đào tạo năng lực nội bộ gắn với cấu trúc vị trí công việc |
| OBJ-02 | Đo được khoảng cách năng lực (skill gap) theo vị trí/cấp bậc |
| OBJ-03 | Cấp chứng chỉ nội bộ xác minh bằng QR/mã |
| OBJ-04 | Liên kết kết quả đào tạo với task thực hành tạo bằng chứng năng lực |
| OBJ-05 | Cung cấp dashboard readiness/risk cho HR và quản lý |

---

## 7. Bên liên quan và vai trò

| Vai trò | Trách nhiệm nghiệp vụ |
|---------|----------------------|
| System Administrator | Quản lý tài khoản, phân quyền, cấu hình, audit |
| HR / Training Manager | Sở hữu quản trị năng lực toàn công ty: job architecture, requirement set, competency library, giao khóa học, quản lý chứng chỉ |
| Department Manager | Chịu trách nhiệm năng lực thật của đội: theo dõi gap, giao task, duyệt bằng chứng (chỉ trong phòng ban mình quản lý) |
| Internal Trainer | Xây khóa học, bài học, ngân hàng câu hỏi, assessment, xem kết quả |
| Employee | Học, thi, nộp bằng chứng, giữ chứng chỉ |
| Public Visitor | Xác minh chứng chỉ công khai, không đăng nhập |

---

## 8. Quy trình hiện tại (As-Is) và đề xuất (To-Be)

### 8.1 As-Is

1. Nhu cầu đào tạo phát sinh từ phòng ban/HR, ghi nhận rời rạc.
2. Tài liệu gửi qua email/Drive/chat; học viên tự học hoặc tham dự buổi đào tạo tập trung.
3. Đánh giá bằng quiz thủ công hoặc không có.
4. Chứng chỉ (nếu có) cấp thủ công, không mã xác minh.
5. Hiệu quả sau đào tạo không được đo hoặc đo qua cảm nhận, không có bằng chứng.

**Tác động:** không truy vết được ai đủ năng lực, không phát hiện gap, không đo ROI đào tạo.

### 8.2 To-Be

1. HR định nghĩa **Position Requirement Set** cho từng vị trí (gồm mức yêu cầu Basic/Intermediate/Advanced cho từng năng lực).
2. Hệ thống so sánh với hồ sơ năng lực đã xác nhận → **Skill Gap**.
3. Gap thúc đẩy **gợi ý khóa học** gắn năng lực thiếu (HR duyệt/override).
4. Nhân viên học → **thi cuối** → đạt thì **cấp chứng chỉ QR**.
5. Quản lý giao **task thực hành** → nhân viên nộp → duyệt → **xác nhận bằng chứng**.
6. Bằng chứng cập nhật hồ sơ năng lực → phản hồi lại gap, risk, readiness.

### 8.3 Nguyên tắc nghiệp vụ

- **Competency-first:** mọi thứ gắn với năng lực và yêu cầu vị trí.
- **Evidence before confirmation:** không tự xác nhận năng lực khi chưa có bằng chứng + duyệt.
- **Explainable:** mọi điểm số giải thích được từ luật và trọng số.
- **Human-controlled AI:** AI hỗ trợ, người quyết định.

---

## 9. Phạm vi nghiệp vụ

**Trong phạm vi MVP:** luồng end-to-end competency (9 feature FE-01..09 ở file 01), 5 job family, 7 vị trí mẫu, 3 mức năng lực (Basic/Intermediate/Advanced), competency library ~40 mục, chứng chỉ QR, WMS-lite.

**Ngoài phạm vi:** payroll/attendance/leave/recruitment/compensation, marketplace khóa học, livestream, mobile app, SSO/LDAP, microservices, ML tự train, blockchain certificate.

**Tùy chọn:** AI nháp câu hỏi/ý tưởng task (có human review).

---

## 10. Bản đồ năng lực nghiệp vụ (Business Capability Map)

| Nhóm năng lực | Khả năng | Trạng thái MVP |
|---------------|----------|----------------|
| Quản trị tổ chức | Job family, position, department, employee | Có |
| Quản trị năng lực | Competency library, level criteria, requirement set | Có |
| Đào tạo | Course, lesson, material, assignment, progress | Có |
| Đánh giá | Question bank, assessment, scoring, attempt history | Có |
| Thông minh năng lực | Skill gap, recommendation, risk, readiness | Có (rule-based) |
| Chứng chỉ | Eligibility, PDF, QR, verification, registry | Có |
| Thực hành | Task template, assignment, submission, review, evidence | Có |
| Giám sát | Dashboard theo vai trò, notification, audit | Có |

---

## 11. Quy tắc nghiệp vụ (tổng hợp cấp cao)

> Chi tiết 12 Business Rule (BR-01..12) ở file 03A §5.1. Dưới đây là các quy tắc cấp nghiệp vụ then chốt.

| # | Quy tắc nghiệp vụ |
|---|-------------------|
| 1 | Skill gap luôn đo theo **Position Requirement Set active** của vị trí; không có active set thì bỏ qua và báo cáo, không đoán |
| 2 | Requirement set chỉ chuyển draft → active → archived; không nhảy draft → archived |
| 3 | Kích hoạt set mới tự archive set cũ trong cùng giao dịch |
| 4 | Xác nhận task tạo **một evidence cho mỗi competency** task nhắm tới |
| 5 | Level đã xác nhận không tự hạ; chỉ hạ qua override có ghi audit |
| 6 | Chứng chỉ cần **đạt quiz cuối**; task evidence riêng lẻ không tự cấp chứng chỉ |
| 7 | Hoàn thành khóa học = đủ material bắt buộc **và** đạt quiz cuối |
| 8 | Cấu hình scoring theo phiên bản: một bản active cho mỗi key |
| 9 | Nhân viên chưa gán Job Position, hoặc Position chưa có requirement set active, thì loại khỏi gap/risk/readiness (không đoán) |
| 10 | Xác minh chứng chỉ công khai chỉ trả về holder, competency/course, ngày cấp, trạng thái |
| 11 | Bản ghi nghiệp vụ "nghỉ hưu" bằng đổi status, không xóa cứng |
| 12 | Quản lý phòng ban chỉ thao tác nhân viên trong phòng ban mình quản lý |

---

## 12. Yêu cầu dữ liệu và báo cáo

**Dữ liệu cần lưu (nhóm):** tổ chức (department/position/employee), năng lực (competency/level/requirement), học tập (course/enrollment/progress), đánh giá (assessment/attempt), chứng chỉ (certificate/verification log), thực hành (task/submission/evidence), thông minh (gap/risk/readiness snapshot), governance (user/role/permission/audit).

**Báo cáo/analytics:** readiness toàn công ty, gap heatmap, rủi ro đào tạo, chứng chỉ sắp hết hạn, lịch sử năng lực theo thời gian.

---

## 13. Tiêu chí chấp nhận MVP (tổng hợp)

1. Luồng end-to-end chạy được từ yêu cầu vị trí đến xác nhận bằng chứng.
2. Gap/gợi ý/chứng chỉ theo luật, kết quả tái lập được.
3. Truy vết đầy đủ về nhân viên/năng lực/hành động có thẩm quyền.
4. Bằng chứng cần duyệt người; AI không tự thay đổi dữ liệu chính thức.
5. API bảo vệ theo vai trò và phạm vi dữ liệu.
6. Chứng chỉ cấp/tải/xác minh được bằng mã/QR, trạng thái đúng.
7. Triển khai được bằng PostgreSQL + Swagger + Docker Compose.

---

## 14. Ràng buộc và giả định

**Ràng buộc:** 5 thành viên, 170 man-days, ~11 tuần; dùng công cụ student/open-source; AI API tùy chọn không là dependency.

**Giả định:** doanh nghiệp mục tiêu ~80–200 nhân sự; tập demo dùng 5 job family / 7 vị trí / ~40 competency; thang hiển thị 3 mức (Basic/Intermediate/Advanced).
