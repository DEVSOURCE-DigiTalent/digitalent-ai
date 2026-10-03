# 01 — Tổng Quan Dự Án DigiTalent AI

> Nguồn gốc: Report 1 — *Project Introduction*. Phiên bản docs_v3, ngôn ngữ tiếng Việt.

---

## 1. Kiểm soát tài liệu

| Mục | Giá trị |
|-----|---------|
| Tên tài liệu | Tổng quan dự án (Project Overview) |
| Phiên bản | 3.0 |
| Trạng thái | Bản nháp (Draft) |
| Chủ sở hữu | Trần Văn Linh (Leader) |
| Căn cứ | Report 1 — Project Introduction |

**Lịch sử chỉnh sửa**

| Ngày | Phiên bản | Mô tả |
|------|-----------|-------|
| 16/09/2026 | 3.0 | Chuyển ngữ tiếng Việt, căn chỉnh theo Reports, cập nhật DigComp 3.0 |

---

## 2. Mục đích và phạm vi

Tài liệu này định hướng cấp cao toàn bộ dự án: bối cảnh, khoảng trống thị trường, cơ hội kinh doanh, tầm nhìn sản phẩm, nguyên tắc, phạm vi và tiêu chí thành công của MVP. Đây là "kim chỉ nam" mà các tài liệu thiết kế chi tiết (BRD, SRS, Use Case, Architecture…) đều dẫn chiếu về.

**Ngoài phạm vi:** chi tiết chức năng (xem 03A), yêu cầu phi chức năng (xem 03B), thiết kế kỹ thuật (xem 06–08).

---

## 3. Tài liệu tham chiếu

- Report 1 — *Project Introduction* (nộp mentor, 08/2026)
- Report 3 — *Software Requirement Specification* (nộp mentor, 08/2026)
- **DigComp 3.0** (EU JRC, 2025, DOI 10.2760/0001149) — khung năng lực số tham chiếu
- `00_INDEX_Tong_Quan_Tai_Lieu.md` — sự kiện chuẩn của bộ tài liệu

---

## 4. Thông tin dự án

| Mục | Giá trị |
|-----|---------|
| Tên dự án | DigiTalent AI — Nền tảng đào tạo năng lực số, cấp chứng chỉ nội bộ và đánh giá thực tế nơi làm việc |
| Mã dự án | DTA |
| Nhóm | DigiTalent AI Capstone Team (5 thành viên, Leader: Trần Văn Linh) |
| Loại phần mềm | Ứng dụng web doanh nghiệp (React/TypeScript frontend, ASP.NET Core/C# backend, PostgreSQL, triển khai Docker) |
| Quy mô mục tiêu | Doanh nghiệp vừa và nhỏ ~80–200 nhân sự |

### Đội ngũ

| Họ tên | Vai trò |
|--------|---------|
| Phạm Thị Minh Trang | Mentor |
| Võ Quốc Trình | Mentor |
| Trần Văn Linh | Leader |
| Nguyễn Thiên Hoàng | Member |
| Nguyễn Văn Quang | Member |
| Trương Ngọc Việt | Member |
| Trần Đình Quy | Member |

---

## 5. Bối cảnh và bài toán

Trong quá trình chuyển đổi số, doanh nghiệp cần nhân viên biết dùng công cụ số, hiểu dữ liệu, tuân thủ an toàn thông tin, cộng tác trực tuyến, quản lý tài liệu số và ứng dụng AI ở mức phù hợp với vị trí. Tuy nhiên, nhiều công ty vẫn đào tạo nội bộ bằng tài liệu rời rạc, email, chat nhóm, bảng tính và chấm điểm thủ công — hoặc dùng một LMS tách rời khỏi dữ liệu HR và hiệu suất.

Cách làm này tạo ra khoảng cách lớn giữa **"đã tham gia đào tạo"** và **"đủ năng lực làm việc"**. HR biết nhân viên đã học xong khóa học, nhưng không xác minh được nhân viên đã đạt mức năng lực mà vị trí yêu cầu hay chưa. Quản lý phòng ban cũng thiếu công cụ để nhanh chóng nhìn thấy năng lực của đội nhóm.

**Sáu vấn đề lặp lại:**

1. Dữ liệu đào tạo phân mảnh qua folder, email, chat, bảng tính.
2. "Hoàn thành khóa học" ≠ "đủ năng lực" cho vị trí.
3. Khóa học không gắn rõ với competency, level, vị trí hoặc phòng ban.
4. Chứng chỉ nội bộ cấp và xác minh thủ công, thiếu mã xác minh, QR, trạng thái hết hạn/thu hồi và audit trail.
5. Quản lý có tầm nhìn hạn chế về tiến độ, rủi ro và mức sẵn sàng của đội.
6. Bằng chứng hiệu quả sau đào tạo xử lý qua email/chat, không liên kết về hồ sơ năng lực.

---

## 6. Khảo sát hệ thống hiện có (Gap Analysis)

Nhóm đã khảo sát các hệ thống thuộc 4 nhóm để định vị khoảng trống: LMS truyền thống, LXP dùng AI, HCM/Workforce Intelligence, và Talent Intelligence/Skills Marketplace. Tiêu chí so sánh: (1) quản lý khóa học/bài học/quiz; (2) quản trị năng lực theo vị trí; (3) phân tích skill gap & gợi ý học tập; (4) cấp chứng chỉ & xác minh QR; (5) đo hiệu suất sau đào tạo; (6) khả thi cho nhóm capstone 5 người.

| Hệ thống | Nhận xét ngắn |
|----------|---------------|
| **Moodle** | Mạnh về khóa học/quiz, nhưng không quản trị năng lực, không đo readiness, không bằng chứng thực tế |
| **TalentLMS** | Triển khai nhanh cho SME, nhưng chứng chỉ chỉ xác nhận hoàn thành, không có task-evidence |
| **Docebo** | AI gợi ý khóa học tốt, nhưng dừng ở gợi ý nội dung, không xác minh năng lực áp dụng |
| **SAP SuccessFactors Learning** | HCM đầy đủ, nhưng chi phí cao, phức tạp, quá mức cho SME |
| **Cornerstone** | Mạnh ở quy mô doanh nghiệp lớn, không khả thi cho capstone |
| **365Talents / Sana Labs / Gloat** | Mỗi nền tảng chỉ giải một lát cắt (skill mapping / AI learning / talent marketplace), không khép vòng về hiệu suất |
| **akaJob LevelUp (FPT)** | Thực chiến, gắn đào tạo–đánh giá–việc làm, nhưng thiên về IT và khung năng lực cố định |

**Kết luận khoảng trống:** Không hệ thống nào kết hợp đủ *quản trị năng lực theo vị trí + phân tích gap/readiness dựa luật + chứng chỉ QR xác minh được + bằng chứng thực tế sau đào tạo* trong một nền tảng gọn nhẹ. DigiTalent AI khép kín vòng đời năng lực đó.

---

## 7. Cơ hội kinh doanh

Cơ hội đến từ bài toán vận hành thực tế: doanh nghiệp SME không cần cả một HCM enterprise, mà cần **kết nối một chuỗi bằng chứng** — từ yêu cầu vị trí → xác định gap → học tập phù hợp → đánh giá → chứng chỉ xác minh được → bằng chứng thực tế. Thay vì chỉ hỏi "nhân viên đã học gì?", hệ thống trả lời 4 câu hỏi: *vị trí cần năng lực gì, đang thiếu gì, học gì để lấp, có bằng chứng gì đã làm được.*

**Giá trị theo bên liên quan:**

| Bên liên quan | Giá trị kỳ vọng |
|---------------|-----------------|
| Employee | Hiểu gap, nhận học tập phù hợp, xem kết quả/chứng chỉ, nhận phản hồi task |
| HR / Training Manager | Định nghĩa yêu cầu vị trí, gắn với khóa học/đánh giá/chứng chỉ/bằng chứng trong một luồng |
| Department Manager / Trainer | Theo dõi gap, giao task, duyệt bằng chứng năng lực |
| System Administrator | Quản lý user/role/permission/master data an toàn |
| Tổ chức | Audit trail rõ ràng từ nhu cầu đào tạo đến bằng chứng năng lực |

---

## 8. Tầm nhìn sản phẩm

> **Tuyên bố tầm nhìn:** Dành cho HR/training, quản lý phòng ban và nhân viên trong doanh nghiệp tri thức vừa và nhỏ, DigiTalent AI là nền tảng nội bộ kết nối yêu cầu năng lực theo vị trí với học tập, đánh giá, chứng chỉ nội bộ và bằng chứng thực tế — giữ cho mối quan hệ *năng lực yêu cầu → khoảng trống → học tập → bằng chứng được xác nhận* luôn hiển thị trong suốt vòng đời phát triển nhân viên.

Sản phẩm thiết kế xoay quanh **xác minh năng lực**, không phải chỉ phân phối khóa học. Hoàn thành khóa học không tự động coi là bằng chứng làm việc được; khi cần áp dụng thực tế, quản lý/trainer có thẩm quyền phải duyệt sản phẩm công việc trước khi xác nhận năng lực.

### Nguyên tắc sản phẩm

| Nguyên tắc | Ý nghĩa |
|-----------|---------|
| **Competency-first** | Yêu cầu vị trí + bằng chứng năng lực là lõi; khóa học/đánh giá/chứng chỉ/task gắn với năng lực |
| **Evidence before confirmation** | Học xong/đạt quiz không tự xác nhận năng lực; cần bằng chứng + duyệt có thẩm quyền |
| **Explainable rules** | Gap, gợi ý, cấp chứng chỉ dùng luật tường minh, kiểm tra và tái lập được |
| **Human-controlled AI** | AI chỉ hỗ trợ nháp câu hỏi/ý tưởng task, không tự cấp chứng chỉ/xác nhận năng lực |
| **Scope before scale** | Ưu tiên một luồng end-to-end hoàn chỉnh trước các phần mở rộng |
| **Enterprise-ready engineering** | Áp dụng RBAC, data scope, validation, file bảo vệ, audit, API doc, kiến trúc sẵn triển khai |

### Luồng TO-BE mục tiêu

HR định nghĩa yêu cầu năng lực của một vị trí → hệ thống so sánh với mức năng lực đã xác nhận để tìm gap → gợi ý khóa học gắn với năng lực thiếu → nhân viên học + đạt quiz cuối → hệ thống cấp chứng chỉ QR khi đủ điều kiện → quản lý giao task thực hành nhỏ → nhân viên nộp file/URL → người duyệt phản hồi → chấp nhận/từ chối làm bằng chứng năng lực.

---

## 9. Phạm vi dự án

### 9.1 Tính năng chính (9 feature)

| ID | Tính năng | Mô tả MVP |
|----|-----------|-----------|
| FE-01 | Authentication & RBAC | Đăng nhập, JWT, kiểm tra quyền, data scope theo vai trò |
| FE-02 | Organization & Employee | Phòng ban, vị trí, nhân viên, quản lý trực tiếp |
| FE-03 | Competency Framework & Requirements | Danh mục năng lực, mức thông thạo, yêu cầu theo vị trí, hồ sơ năng lực |
| FE-04 | Competency-Linked Learning | Khóa học, học liệu, gắn năng lực, giao việc, theo dõi tiến độ |
| FE-05 | Assessment & Final Quiz | Ngân hàng câu hỏi, quiz cuối, chấm điểm server, đạt/trượt |
| FE-06 | Skill Gap & Course Recommendation | So sánh required vs confirmed, gợi ý khóa học theo gap |
| FE-07 | Digital Certificate & QR | Đủ điều kiện cấp chứng chỉ, sinh PDF, mã duy nhất, QR, trạng thái VALID/EXPIRED/REVOKED |
| FE-08 | Practical Task & Evidence | Giao task sau đào tạo, nộp file/URL, duyệt, xác nhận bằng chứng |
| FE-09 | Dashboards & Notifications | Dashboard theo vai trò + thông báo trong ứng dụng |

**Năng lực kỹ thuật hỗ trợ:** truy cập file có kiểm soát, PostgreSQL, Swagger/OpenAPI, cấu trúc modular monolith, audit cơ bản, Docker Compose.

### 9.2 Phạm vi AI và ranh giới quyết định

AI **không phải nguồn sự thật** của MVP. Lõi thông minh là các luật nghiệp vụ tường minh (so sánh level, gắn học tập với gap, kiểm tra điều kiện chứng chỉ, bắt buộc duyệt con người cho bằng chứng).

| Chức năng / quyết định | Cách tiếp cận MVP | Ranh giới |
|------------------------|-------------------|-----------|
| Skill-gap analysis | **Lõi — rule-based** | So sánh required vs confirmed; không cần AI |
| Course recommendation | **Lõi — rule-based** | Gợi ý khóa học gắn năng lực thiếu; có thể override |
| Certificate eligibility | **Lõi — rule-based** | Chỉ cấp khi đủ điều kiện hoàn thành + đạt quiz |
| Competency evidence | **Lõi — human review** | Quản lý/trainer duyệt bài thực hành |
| AI nháp câu hỏi quiz | Tùy chọn | Bản nháp phải được trainer duyệt |
| AI ý tưởng task | Tùy chọn | Bản nháp phải được quản lý duyệt |
| AI giải thích / predictive | Tương lai | Ngoài MVP |

### 9.3 Giới hạn & loại trừ

| ID | Giới hạn |
|----|----------|
| LI-01 | Chỉ dùng tập demo các phòng ban/vị trí/năng lực, không mô hình hóa toàn bộ doanh nghiệp |
| LI-02 | Không có payroll, chấm công, nghỉ phép, tuyển dụng, lương |
| LI-03 | Không livestream, marketplace khóa học, social learning, SCORM đầy đủ |
| LI-04 | WMS-lite chỉ giao task thực hành sau đào tạo, không phải Jira/Trello |
| LI-05 | Không tự train ML, không chatbot/RAG/semantic search |
| LI-06 | Không SSO/LDAP, tích hợp HRM ngoài, microservices, Redis |
| LI-07 | Chỉ ứng dụng web responsive; không app mobile, không blockchain certificate |

### 9.4 Tiêu chí thành công MVP

| Nhóm | Tiêu chí |
|------|----------|
| End-to-end | Một kịch bản chạy từ yêu cầu vị trí → gap → học → quiz → chứng chỉ QR → task → xác nhận bằng chứng |
| Đúng luật | Gap/gợi ý/chứng chỉ theo luật đã ghi, kết quả tái lập được |
| Truy vết | Khóa học/đánh giá/chứng chỉ/bằng chứng truy được về nhân viên, năng lực, hành động có thẩm quyền |
| Human control | Bằng chứng cần duyệt người; AI không đổi dữ liệu chính thức |
| Bảo mật & scope | API bảo vệ theo vai trò & phạm vi dữ liệu |
| Xác minh chứng chỉ | Cấp/tải/xác minh bằng mã/QR, kết quả đúng VALID/EXPIRED/REVOKED |
| Sẵn sàng triển khai | PostgreSQL, Swagger, Docker Compose đủ cho demo |

> **Quy tắc kiểm soát phạm vi:** tính năng không cần cho luồng end-to-end thì để tùy chọn cho đến khi luồng lõi hoàn thành.

---

## 10. Ma trận vết tóm tắt

| Report 1 | Mục SRS | File liên quan |
|----------|---------|----------------|
| §2 Product Background | Report 3 §1 | 01, 02 |
| §3 Existing Systems | — | 01 |
| §5 Vision & Principles | Report 3 §1 | 01, 02 |
| §6.1 Major Features (FE-01..09) | Report 3 §3.2–3.11 | 03A, 04, 09 |
| §6.2 AI Scope | Report 3 §3.7/§3.10 | 16 |
| §6.3 Limitations | Report 3 §5.4 | 01, 03A |
| §6.4 Success Criteria | Report 3 §4 | 03B, 13 |
