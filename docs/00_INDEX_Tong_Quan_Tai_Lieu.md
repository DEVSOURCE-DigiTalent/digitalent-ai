# DigiTalent AI — Chỉ Mục Tài Liệu và Baseline Enterprise Capstone

> **Mục đích:** Chỉ mục này giúp định vị tài liệu và ghi lại một số sự kiện chuẩn cho Enterprise Capstone MVP. Nguồn ưu tiên và cách xử lý xung đột được quy định tại `DigiTalent_AI_MASTER_SYSTEM_OVERVIEW_2026-10-09.md`; chỉ mục không thay thế Master Overview hoặc Reports 1–3.

---

## 1. Kiểm soát tài liệu

| Mục | Giá trị |
|-----|---------|
| Phiên bản bộ tài liệu | Working set; rà soát ngày 09/10/2026 |
| Ngôn ngữ chính | Tiếng Việt (thuật ngữ kỹ thuật giữ nguyên tiếng Anh) |
| Căn cứ chính | Master System Overview 09/10/2026; Reports 1 v2.5, 2 v2.5, 3 v2.2 theo thứ tự ưu tiên nêu trong Overview |
| Khung năng lực tham chiếu | **TT02/2025/TT-BGDĐT** (6 miền, 24 năng lực thành phần; 4 trình độ, 8 bậc; phạm vi đào tạo giới hạn bậc 1–6) |
| Ngày rà soát | 09/10/2026 |

**Lịch sử chỉnh sửa**

| Ngày | Phiên bản | Người chịu trách nhiệm | Mô tả |
|------|-----------|------------------------|-------|
| 16/09/2026 | 0.1 | Nhóm DigiTalent AI | Khởi tạo bộ tài liệu trước đây; nội dung cũ còn các mâu thuẫn scope cần rà soát. |
| 09/10/2026 | 1.1 | Nhóm DigiTalent AI | Làm rõ đề xuất khóa học tự động và giao khóa học chủ động; bổ sung AI hỗ trợ đánh giá evidence có người duyệt, giữ các quyết định chưa chốt ở trạng thái pending. |

---

## 2. Bản đồ bộ tài liệu

| # | File | Nội dung | Nguồn gốc |
|---|------|----------|-----------|
| 00 | `00_INDEX_Tong_Quan_Tai_Lieu.md` | Chỉ mục + sự kiện chuẩn + glossary + ma trận vết | Tổng hợp |
| 01 | `01_Project_Overview_DigiTalent_AI.md` | Tổng quan sản phẩm, roles, scope và luồng Enterprise MVP | Master Overview §§1–7 |
| 02 | `02_BRD_Business_Requirement_DigiTalent_AI.md` | Yêu cầu nghiệp vụ, As-Is/To-Be, capability và acceptance | Master Overview §§1–7, 11, 13–16 |
| 03A–17 | Các SRS, Use Case, Flow, kiến trúc, ERD, API, RBAC, UI/UX, Dev, test, DevOps, security, scoring và demo trong thư mục này | Tài liệu chi tiết cần rà soát đồng bộ; xem từng file và Master Overview §11 | Master Overview + Reports tương ứng |

---

## 3. Sự kiện chuẩn (Canonical Facts)

> Các sự kiện sau là baseline hiện tại theo Master System Overview; điểm chưa chốt phải giữ nhãn PENDING DECISION.

### 3.1 Phạm vi doanh nghiệp & cấu trúc vị trí

| Mục | Giá trị | Ghi chú |
|-----|---------|---------|
| Quy mô doanh nghiệp/demo mục tiêu | **80–200 nhân viên** | Doanh nghiệp vừa và nhỏ |
| Job Family / Job Grade | Không thuộc baseline mới | Không thêm Job Family, Career Grade/Job Grade G1–G3 vào scope MVP |
| Framework | **TT02/2025/TT-BGDĐT** | 6 miền, 24 năng lực; đào tạo giới hạn TT02 bậc 1–6 |
| Training Level | **3** | Basic (TT02 bậc 1–2), Intermediate (3–4), Advanced (5–6) |
| Grade representation | **PENDING DECISION GRADE-01** | Report 3 mô tả Grade 1–6; không tự kết luận schema/code là 3 hay 6 |

#### 3.1.1 Training Level và GRADE-01

| Training Level | Tên | Dải bậc TT02 |
|-----|---------------|------------------------------|
| 1 | **Basic** | 1–2 |
| 2 | **Intermediate** | 3–4 |
| 3 | **Advanced** | 5–6 |

**PENDING DECISION GRADE-01:** Report 3 v2.2 mô tả Position Requirement, Confirmed Competency, Skill Gap và grade criteria theo Grade 1–6; việc xác nhận 3 Level đào tạo không quyết định schema grade. Không tự sửa ERD, CHECK constraint, thuật toán hoặc migration trước khi chốt.

### 3.2 Roles nghiệp vụ (Enterprise MVP)

| Role | Phạm vi |
|---|---|
| PLATFORM_ADMIN | Quản trị nền tảng, framework TT02 và standard learning content |
| OWNER | Quản trị tổ chức và chức năng doanh nghiệp trong organization scope |
| MANAGER (optional) | Thao tác nhân viên/task trong phòng ban được phân công |
| EMPLOYEE | Học tập, assessment, certificate và evidence cá nhân |

Account Holder và System là actor phi nghiệp vụ/nội bộ theo ngữ cảnh; TRAINER, PUBLIC_VISITOR, HR_MANAGER và DEPARTMENT_MANAGER không phải role của MVP.

### 3.3 Luồng học tập và AI-assisted evidence review

- Skill Gap được tính từ Confirmed Workplace Competency so với Active Position Requirement. Hệ thống tự đề xuất standard course dựa trên competency còn thiếu và course-competency mapping; EMPLOYEE có thể bắt đầu học từ danh sách đề xuất.
- Hai cơ chế học cùng tồn tại: **Recommended Course** do hệ thống đề xuất theo gap; **Assigned Course** do OWNER chủ động giao khi có cập nhật của tổ chức hoặc yêu cầu đào tạo lại. OWNER theo dõi tiến độ; việc giao khóa không tự xác nhận năng lực.
- OWNER/MANAGER có thể giao Practical Task trong phạm vi quyền. AI-assisted evaluator phân tích evidence được phép truy cập theo rubric, đề xuất điểm theo tiêu chí, lý do, căn cứ evidence và tiêu chí còn thiếu. OWNER/MANAGER review, chỉnh sửa hoặc phê duyệt; chỉ review hợp lệ đã được duyệt mới có thể cập nhật Confirmed Workplace Competency.
- Điểm Practical Task và Competency Level là kết quả riêng. Cần truy vết rubric version, AI evaluation/model version (nếu áp dụng), kết quả AI, quyết định reviewer và lịch sử chỉnh sửa.
- AI-assisted Practical Task Evaluation mở rộng AI scope/effort của Reports 1/2. Đây là yêu cầu cần phản ánh vào scope, estimate và tài liệu liên quan; nội dung này không khẳng định tính năng đã có trong source code.
- **PENDING DECISION:** Khi OWNER giao khóa do cập nhật/đào tạo lại, việc đánh giá lại bắt buộc chỉ cần final course assessment hay còn cần Practical Task. Course update và thay đổi competency requirement có thể cần quy tắc khác nhau.

### 3.4 Use Case (Report 3 §2.2)

- Report 3 v2.2 có **44 mục** trong Use Case Catalogue; UC-24 và UC-31 là internal functions để trace, không phải user-initiated UML use case.

### 3.5 Màn hình (Report 3 §3.1.2)

- Report 3 v2.2 liệt kê **42 screens** theo nhóm PLATFORM_ADMIN, OWNER, MANAGER và EMPLOYEE; Certificate Verification yêu cầu đăng nhập, không public.

### 3.6 Dữ liệu (Report 3 §3.1.5)

- Report 3 v2.2 có ERD khái niệm chia 5 phần; Course Version và Assessment Version cần thể hiện ở thiết kế logic. Không dùng số entity/bảng cũ làm căn cứ quyết định mới.

### 3.7 Business Rules & Requirements chung (Report 3)

- Report 3 v2.2 có business rules BR-01 đến BR-21; chi tiết theo Master Overview §7 và tài liệu SRS tương ứng.

### 3.8 Non-Functional (Report 3 §4)

- External interfaces: **4** (SMTP/TLS, S3-compatible storage/HTTPS, LLM API tùy chọn/HTTPS REST, Browser/HTTPS REST với in-app polling)
- Chất lượng: Usability, Reliability, Performance, Security, Compatibility/Portability, Maintainability (đều có chỉ số đo được).

### 3.9 Kế hoạch & ước lượng (Report 2)

| Mục | Giá trị |
|-----|---------|
| Tổng effort | **170 man-days** |
| Số WBS module | **12** (WBS 1 … WBS 12) |
| Số sprint | **6** |
| Số thành viên | 5 |
| Số deliverable | 8 (có ngày: 02/09 → 11/11/2026) |
| Rủi ro chính | 10 |
| Khoảng thời gian | ~11 tuần |

---

## 4. Chuẩn tham chiếu (Standards)

| Chuẩn | Dùng cho | Ghi chú |
|-------|----------|---------|
| **TT02/2025/TT-BGDĐT** | Khung năng lực số (6 miền, 24 năng lực thành phần; 4 trình độ, 8 bậc) | Enterprise baseline; đào tạo giới hạn bậc 1–6 |
| IEEE 29148:2018 | Cấu trúc SRS / requirements | |
| ISO/IEC 25010:2023 | Mô hình chất lượng NFR | |
| C4 Model (Simon Brown) | Tả kiến trúc 4 tầng | |
| OpenAPI 3.1 | Đặc tả API | |
| OWASP ASVS / Top 10 | Security | |
| NIST SP 800-63B | Chính sách mật khẩu / khóa tài khoản | |

### 4.1 Thang năng lực

TT02 quy định 4 trình độ, 8 bậc; Report 1 xác định phạm vi đào tạo DigiTalent AI ở bậc 1–6, được nhóm thành ba Training Level như bảng §3.1.1. Cách biểu diễn grade nghiệp vụ vẫn thuộc PENDING DECISION GRADE-01.

---

## 5. Thuật ngữ (Glossary)

| Thuật ngữ | Nghĩa |
|-----------|-------|
| **Skill Gap** | Khoảng cách giữa mức năng lực yêu cầu (Required) và mức đã xác nhận (Confirmed) của nhân viên |
| **Confirmed Workplace Competency** | Năng lực được xác nhận từ evidence thực tế qua người review có thẩm quyền |
| **WMS-lite** | Phân hệ giao task thực hành sau đào tạo (làm bằng chứng năng lực), rút gọn so với hệ Work Management System đầy đủ |
| **Position Requirement Set** | Tập yêu cầu năng lực (có phiên bản) cho một Job Position |
| **Competency Evidence** | Evidence được review; certificate và learning score không tự xác nhận workplace competency |
| **RBAC** | Role-Based Access Control — phân quyền theo vai trò |
| **DTO** | Data Transfer Object — đối tượng truyền dữ liệu giữa các tầng |
| **TT02** | Thông tư 02/2025/TT-BGDĐT về Khung năng lực số cho người học |
| **Internal Certificate** | Chứng chỉ nội bộ cho EMPLOYEE từ course eligible; trạng thái Valid/Revoked, không expiry |
| **Recommended Course** | Khóa học standard được hệ thống gợi ý theo Skill Gap và competency-course mapping; EMPLOYEE có thể bắt đầu học |
| **Assigned Course** | Khóa học OWNER giao chủ động cho nhân viên, ví dụ khi tổ chức cập nhật nội dung hoặc yêu cầu đào tạo lại |
| **AI-assisted Practical Task Evaluation** | Phân tích evidence theo rubric để đề xuất đánh giá; OWNER/MANAGER chịu trách nhiệm review và quyết định cuối |
| **Practical Task Score** | Điểm đề xuất/được duyệt cho task theo rubric; không đồng nhất với Competency Level đã xác nhận |

---

## 6. Ma trận vết tổng (Traceability)

> Bảng tóm tắt feature baseline theo Report 1 và Master Overview; use case, business rules và file thiết kế cần truy vết trong tài liệu chi tiết tương ứng.

| Feature (Report 1) | Phạm vi tóm tắt theo Master Overview |
|--------------------|------------------------------------|
| FE-01 | Authentication, Workspace & RBAC |
| FE-02 | Organization, Departments, Positions & Members |
| FE-03 | TT02 Reference Framework |
| FE-04 | Position Competency Requirements |
| FE-05 | Competency Profile & Skill Gap |
| FE-06 | Competency-linked learning, rule-based course recommendation theo gap, OWNER course assignment và assessment; eligible internal certificate |
| FE-07 | Practical Task, AI-assisted evidence evaluation và human review; chỉ kết quả duyệt hợp lệ mới tác động competency |
| FE-08 | Team Competency & Learning Monitoring |
| FE-09 | Platform Administration & Reference Content |

---

## 7. Quy ước dùng chung cho bộ tài liệu

1. **Tiếng Việt** là ngôn ngữ chính; thuật ngữ kỹ thuật (skill gap, RBAC, DTO, endpoint…) giữ nguyên tiếng Anh và giải thích ở lần đầu.
2. **Baseline scope** theo Master System Overview và các làm rõ nghiệp vụ mới; giữ `PENDING DECISION` cho GRADE-01 và quyết định hình thức re-evaluation sau course assignment. Không suy diễn trạng thái implementation; AI-assisted Practical Task Evaluation cần được phản ánh rõ trong Reports 1/2 và effort.
3. Mỗi file có cấu trúc: *Kiểm soát tài liệu → Mục đích & Phạm vi → Tài liệu tham chiếu → Nội dung → Ma trận vết (nếu có)*.
4. Trích dẫn chuẩn quốc tế được đặt ở mục "Tài liệu tham chiếu" của từng file, không bịa nguồn.
