# DigiTalent AI — Tổng Quan Bộ Tài Liệu docs_v3 (INDEX)

> **Mục đích:** Đây là file chỉ mục (index) và **nguồn sự kiện chuẩn** (source of truth) của bộ tài liệu thiết kế dự án DigiTalent AI phiên bản 3 (`docs_v3`). Mọi số liệu phạm vi trong 17 file còn lại phải khớp với file này. Nếu có mâu thuẫn, ưu tiên file này và các Report đã nộp mentor.

---

## 1. Kiểm soát tài liệu

| Mục | Giá trị |
|-----|---------|
| Phiên bản bộ tài liệu | 3.0 |
| Ngôn ngữ chính | Tiếng Việt (thuật ngữ kỹ thuật giữ nguyên tiếng Anh) |
| Căn cứ chính | Reports 1–3 + Script defense (đã nộp mentor, ký *Hanoi, August 2026*) |
| Khung năng lực tham chiếu | **DigComp 3.0** (thay thế DigComp 2.2) |
| Ngày khởi tạo | 16/09/2026 |

**Lịch sử chỉnh sửa**

| Ngày | Phiên bản | Người chịu trách nhiệm | Mô tả |
|------|-----------|------------------------|-------|
| 16/09/2026 | 0.1 | Nhóm DigiTalent AI | Khởi tạo bộ tài liệu v3, căn chỉnh số liệu theo Reports, chuyển ngữ sang tiếng Việt, đổi chuẩn DigComp 2.2 → 3.0 |

---

## 2. Bản đồ bộ tài liệu

| # | File | Nội dung | Nguồn gốc |
|---|------|----------|-----------|
| 00 | `00_INDEX_Tong_Quan_Tai_Lieu.md` | Chỉ mục + sự kiện chuẩn + glossary + ma trận vết | Tổng hợp |
| 01 | `01_Tong_Quan_Du_An.md` | Tổng quan, vision, gap, scope | Report 1 |
| 02 | `02_BRD_Yeu_Cau_Nghiep_Vu.md` | Yêu cầu nghiệp vụ, As-Is/To-Be, capability map | Report 1 §2–4 |
| 03A | `03A_SRS_Yeu_Cau_Chuc_Nang.md` | Yêu cầu chức năng, 46 UC, 44 màn hình | Report 3 §2–3 |
| 03B | `03B_SRS_Yeu_Cau_Phi_Chuc_Nang.md` | NFR, chất lượng, security, interface | Report 3 §4–5 |
| 04 | `04_Use_Case_Danh_Sach_Dac_Ta.md` | Danh sách + đặc tả 46 use case / 8 package | Report 3 §2.2 |
| 05 | `05_Luong_Nghiep_Vu_User_Flow.md` | Luồng nghiệp vụ F00–F23, state machine | Report 3 §3.1 |
| 06 | `06_Kien_Truc_He_Thong.md` | Kiến trúc C4, Clean Architecture | Tổng hợp + code thực tế |
| 07 | `07_Thiet_Ke_CSDL_ERD.md` | 17 entity / ~50 bảng, ERD | Report 3 §3.1.5 |
| 08 | `08_Dac_Ta_API_OpenAPI.md` | Đặc tả API, envelope, endpoint | Tổng hợp + code thực tế |
| 09 | `09_Ma_Tran_Phan_Quyen_RBAC.md` | Ma trận phân quyền theo màn hình | Report 3 §3.1.3 |
| 10 | `10_Dac_Ta_UI_UX.md` | 44 màn hình / 7 khu vực, design token | Report 3 §3.1.2 |
| 11 | `11_Quy_Uoc_Code_Dev.md` | Coding convention, folder, clean arch | CLAUDE.md + code thực tế |
| 12 | `12_Git_Workflow_Nhanh.md` | Branching, commit, PR | Report 2 §6 |
| 13 | `13_Chien_Luoc_Kiem_Thu.md` | Chiến lược + kế hoạch kiểm thử | Report 2 §1.2/§2.2 |
| 14 | `14_DevOps_Trien_Khai.md` | Docker, CI/CD, triển khai | Report 2 §6.3 + infra |
| 15 | `15_Thiet_Ke_Bao_Mat.md` | Security design, OWASP, RBAC | Report 3 §4.2.4 |
| 16 | `16_Thiet_Ke_Cham_Diem_AI_Rule.md` | Rule-based scoring, công thức | Report 1 §6.2 + Report 3 §3.1.4/§3.7/§3.10 |
| 17 | `17_Kich_Ban_Demo_Bao_Ve.md` | Kịch bản bảo vệ (22 slide) — **tiếng Việt** | Script defense |

---

## 3. Sự kiện chuẩn (Canonical Facts)

> Các số liệu sau được **khóa theo Reports đã nộp**. Không tự ý thay đổi trừ khi Report được cập nhật lại.

### 3.1 Phạm vi doanh nghiệp & cấu trúc vị trí

| Mục | Giá trị | Ghi chú |
|-----|---------|---------|
| Quy mô doanh nghiệp mục tiêu | ~80–200 nhân sự | SME đa ngành |
| Số Job Family | **5** | Leadership, HR/Admin, Finance, Sales & Marketing, Operations |
| Số Job Position mẫu | **7** | Reports không liệt kê tên → xem §3.1.2 |
| Số Competency Level | **3** | Basic / Intermediate / Advanced (thang đo duy nhất) |

#### 3.1.1 Năm Job Family (theo Report 3 §3.4.1 — nguyên văn)

1. **Leadership** (Lãnh đạo)
2. **HR/Admin** (Nhân sự / Hành chính)
3. **Finance** (Tài chính – Kế toán)
4. **Sales & Marketing** (Bán hàng & Tiếp thị)
5. **Operations** (Vận hành)

#### 3.1.2 Bảy Job Position (đề xuất — cần xác nhận)

> ⚠️ Reports chỉ nêu **"7 reference job positions"** mà không liệt kê tên. Danh sách dưới đây là **đề xuất** khớp 5 job family; **cần hội đồng/mentor xác nhận** trước khi dùng cho demo.

| # | Đề xuất vị trí | Job Family |
|---|----------------|------------|
| 1 | CEO / General Director | Leadership |
| 2 | HR Executive (HR Officer) | HR/Admin |
| 3 | Accountant | Finance |
| 4 | Sales Representative | Sales & Marketing |
| 5 | Marketing Executive | Sales & Marketing |
| 6 | Operations Executive | Operations |
| 7 | IT/Office Support Specialist | Operations |

#### 3.1.3 Ba Competency Level (thang đo duy nhất)

> ⚠️ **Thay đổi so với Reports:** Reports gốc dùng **5 Career Grade (G1–G5)** cho khái niệm "cấp bậc tổ chức" (Junior → Head), tách riêng khỏi mức năng lực DigComp, và định nghĩa `Position Requirement Set = Position + Career Grade`. Theo chỉ đạo (16/09/2026), docs_v3 **bỏ hẳn trục Career Grade**, chỉ giữ **3 mức năng lực DigComp** làm thang đo duy nhất. `Position Requirement Set` do đó chỉ khóa theo **Job Position** (không còn "Position + Career Grade"). Khái niệm "Senior/Manager/Director" khi cần sẽ được mô hình hóa thành các **Job Position riêng biệt**, không phải bậc gắn lên một vị trí.

| Mức | Tên tiếng Anh | Diễn giải (theo DigComp 3.0) |
|-----|---------------|------------------------------|
| 1 | **Basic** | Thực hiện tác vụ đơn giản; cần hướng dẫn khi cần |
| 2 | **Intermediate** | Thực hiện tác vụ/vấn đề được xác định rõ; tự chủ thực hiện |
| 3 | **Advanced** | Tác vụ phức tạp, đa dạng; tự đánh giá và áp dụng giải pháp; thích ứng theo ngữ cảnh; hướng dẫn người khác khi cần |

### 3.2 Actor hệ thống (Report 3 §2.1)

| # | Actor | Ghi chú |
|---|-------|---------|
| 1 | System Administrator | Quản trị hệ thống, phân quyền, audit |
| 2 | HR / Training Manager | Quản trị năng lực toàn công ty |
| 3 | Department Manager | Quản lý đội nhóm, giao task, duyệt evidence |
| 4 | Internal Trainer | Xây khóa học, ngân hàng câu hỏi |
| 5 | Employee | Người học, thi, nộp bằng chứng |
| 6 | Public Visitor | Xác minh chứng chỉ, **không đăng nhập** |
| 7 | Scheduled system process | Tiến trình nền (tính gap/risk/readiness, hết hạn cert) — **không phải actor** |

### 3.3 Use Case (Report 3 §2.2)

- Tổng số use case: **46** (UC-01 … UC-46)
- Nhóm: **8 package** (PKG-01 … PKG-08)
- Package bao phủ mục SRS: PKG-01 → §3.2/§3.11; PKG-02 → §3.3/§3.4; PKG-03 → §3.5; PKG-04 → §3.6; PKG-05 → §3.7; PKG-06 → §3.8; PKG-07 → §3.9; PKG-08 → §3.10.

### 3.4 Màn hình (Report 3 §3.1.2)

- Tổng số màn hình: **44**, nhóm 7 khu vực (Common & Auth, Administration, Job Architecture, Organization, Competency, HR/Manager/Trainer/Employee, Public).
- Ma trận phân quyền màn hình: Report 3 §3.1.3 (chi tiết tại file 09).

### 3.5 Dữ liệu (Report 3 §3.1.5)

- Entity cốt lõi: **17** (Department, Employee, User Account, System Role, Notification, Job Position, Position Requirement, Competency, Competency Level, Course, Enrollment, Assessment, Certificate, Practical Task, Task Submission, Competency Evidence, Capability Score). ⚠️ Reports ghi 18 entity (gồm "Career Grade"); docs_v3 bỏ entity Career Grade theo chỉ đạo 3-level → còn 17.
- Bảng vật lý đầy đủ: **~50** (Reports chỉ nêu con số, chi tiết cần xác nhận theo ERD ở file 07).

### 3.6 Business Rules & Requirements chung (Report 3 §5)

- Business Rules: **12** (BR-01 … BR-12)
- Common Requirements: **8** (CR-01 … CR-08)
- Application Messages: **26** (MSG01 … MSG26)

### 3.7 Non-Functional (Report 3 §4)

- External interfaces: **4** (SMTP, MinIO S3, LLM API tùy chọn, Browser + SignalR WebSocket)
- Chất lượng: Usability, Reliability, Performance, Security, Compatibility/Portability, Maintainability (đều có chỉ số đo được).

### 3.8 Kế hoạch & ước lượng (Report 2)

| Mục | Giá trị |
|-----|---------|
| Tổng effort | **170 man-days** |
| Số WBS module | **12** (WBS 1 … WBS 12) |
| Số sprint | **5** |
| Số thành viên | 5 |
| Số deliverable | 8 (có ngày: 02/09 → 11/11/2026) |
| Rủi ro chính | 10 |
| Khoảng thời gian | ~11 tuần |

---

## 4. Chuẩn tham chiếu (Standards)

| Chuẩn | Dùng cho | Ghi chú |
|-------|----------|---------|
| **DigComp 3.0** (EU JRC, 2025) | Khung năng lực số (5 lĩnh vực × 21 năng lực) | Thay DigComp 2.2 theo yêu cầu |
| IEEE 29148:2018 | Cấu trúc SRS / requirements | |
| ISO/IEC 25010:2023 | Mô hình chất lượng NFR | |
| C4 Model (Simon Brown) | Tả kiến trúc 4 tầng | |
| OpenAPI 3.1 | Đặc tả API | |
| OWASP ASVS / Top 10 | Security | |
| NIST SP 800-63B | Chính sách mật khẩu / khóa tài khoản | |

### 4.1 DigComp 3.0 — 5 lĩnh vực × 21 năng lực

> Nguồn: Cosgrove, J. & Cachia, R., *DigComp 3.0: Khung năng lực kỹ thuật số Châu Âu — Phiên bản thứ năm*, 2025, DOI `10.2760/0001149`, JRC144121. Bản dịch tiếng Việt tham khảo: `giaoducmo.avnuc.vn` (Hiệp hội các trường ĐH-CĐ Việt Nam).

| Lĩnh vực (Area) | Năng lực (Competences) |
|-----------------|------------------------|
| **1. Tìm kiếm, đánh giá và quản lý thông tin** | 1.1 Duyệt/tìm kiếm/lọc · 1.2 Đánh giá thông tin · 1.3 Quản lý thông tin |
| **2. Giao tiếp và cộng tác** | 2.1 Tương tác · 2.2 Chia sẻ · 2.3 Quyền công dân · 2.4 Cộng tác · 2.5 Hành vi số · 2.6 Danh tính số |
| **3. Tạo lập nội dung** | 3.1 Phát triển · 3.2 Tích hợp & chỉnh sửa · 3.3 Bản quyền & giấy phép · 3.4 Tư duy tính toán & lập trình |
| **4. An toàn, phúc lợi & sử dụng có trách nhiệm** | 4.1 Thiết bị · 4.2 Dữ liệu cá nhân & quyền riêng tư · 4.3 Phúc lợi · 4.4 Môi trường |
| **5. Nhận diện & giải quyết vấn đề** | 5.1 Vấn đề kỹ thuật · 5.2 Nhu cầu & phản ứng công nghệ · 5.3 Giải pháp sáng tạo · 5.4 Nhu cầu năng lực số |

> **Lưu ý chuyển đổi DigComp 2.2 → 3.0:** 5 lĩnh vực giữ nguyên cấu trúc; thay đổi chính gồm (1) tên lĩnh vực 4 mở rộng thành "An toàn, **phúc lợi và sử dụng có trách nhiệm**", (2) bổ sung năng lực 3.4 *Tư duy tính toán và lập trình*, (3) cập nhật nội dung AI. Script defense gốc nói "DigComp 2.2" — bộ docs_v3 **cập nhật thành DigComp 3.0** theo chỉ đạo; khi bảo vệ cần thống nhất slide với tài liệu.

---

## 5. Thuật ngữ (Glossary)

| Thuật ngữ | Nghĩa |
|-----------|-------|
| **Skill Gap** | Khoảng cách giữa mức năng lực yêu cầu (Required) và mức đã xác nhận (Confirmed) của nhân viên |
| **Workforce Readiness Score** | Điểm tổng hợp mức sẵn sàng đảm nhận vị trí hiện tại |
| **Training Risk Score** | Điểm dự báo rủi ro không hoàn thành đào tạo |
| **WMS-lite** | Phân hệ giao task thực hành sau đào tạo (làm bằng chứng năng lực), rút gọn so với hệ Work Management System đầy đủ |
| **Position Requirement Set** | Tập yêu cầu năng lực (có phiên bản) cho một Job Position |
| **Competency Evidence** | Bằng chứng năng lực đã được xác nhận (Confirmed) từ task/assessment/certificate |
| **RBAC** | Role-Based Access Control — phân quyền theo vai trò |
| **DTO** | Data Transfer Object — đối tượng truyền dữ liệu giữa các tầng |
| **DigComp 3.0** | Khung năng lực số Châu Âu, phiên bản 5 (2025) |
| **Certification / Certificate** | Chứng chỉ nội bộ có mã + QR, xác minh công khai |

---

## 6. Ma trận vết tổng (Traceability)

> Bảng tóm tắt liên kết giữa feature (FE), use case (UC), business rule (BR) và file thiết kế. Chi tiết mở rộng ở cuối từng file liên quan.

| Feature (Report 1) | Mục SRS (Report 3) | UC liên quan | BR liên quan | File thiết kế |
|--------------------|--------------------|--------------|--------------|---------------|
| FE-01 Auth & RBAC | §3.2, §3.11 | UC-01..13 | BR-12 | 03A, 09, 15 |
| FE-02 Org & Employee | §3.3 | UC-18, 19 | BR-09, 11, 12 | 03A, 07, 09 |
| FE-03 Competency & Requirement | §3.4 | UC-14..22 | BR-01, 02, 03 | 03A, 07 |
| FE-04 Learning | §3.5 | UC-24, 35, 41, 42 | BR-07 | 03A, 07 |
| FE-05 Assessment & Quiz | §3.6 | UC-36, 37, 38, 43 | BR-06, 07 | 03A, 07 |
| FE-06 Skill Gap & Recommend | §3.7 | UC-25, 26, 29, 40 | BR-01, 09 | 03A, 16 |
| FE-07 Certificate & QR | §3.8 | UC-27, 45, 46 | BR-06, 10, 11 | 03A, 07, 15 |
| FE-08 Task & Evidence | §3.9 | UC-30..33, 44 | BR-04, 05, 12 | 03A, 07, 16 |
| FE-09 Dashboard & Notify | §3.10 | UC-07, 23, 28, 34, 39 | BR-09 | 03A, 10 |

---

## 7. Quy ước dùng chung cho toàn bộ docs_v3

1. **Tiếng Việt** là ngôn ngữ chính; thuật ngữ kỹ thuật (skill gap, readiness, RBAC, DTO, endpoint…) giữ nguyên tiếng Anh và giải thích ở lần đầu.
2. **Mọi số liệu** khớp §3 của file này; chỗ Reports chưa nêu rõ ghi `⚠️ cần xác nhận`.
3. Mỗi file có cấu trúc: *Kiểm soát tài liệu → Mục đích & Phạm vi → Tài liệu tham chiếu → Nội dung → Ma trận vết (nếu có)*.
4. Trích dẫn chuẩn quốc tế được đặt ở mục "Tài liệu tham chiếu" của từng file, không bịa nguồn.
