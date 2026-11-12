# DIGITALENT AI — KỊCH BẢN KIỂM THỬ END-TO-END VÀ TRÌNH DIỄN HỆ THỐNG CHI TIẾT

> **Tài liệu:** Kịch bản Kiểm thử End-to-End & Thao tác Trình diễn Toàn diện (Walkthrough Test Protocol)  
> **Phiên bản:** 2.0 (Khớp hoàn toàn kiến trúc 4 Role + Individual Workspace, chuẩn TT 02/2025/TT-BGDĐT)  
> **Vị trí chuẩn xuyên suốt:** **Chuyên viên Kinh doanh (CRM) — Mã: `SALES_CRM`**  
> **Môi trường thực thi:** Frontend React (Vite Dev Server `http://localhost:5173/`, `VITE_USE_MOCK=true`)  
> **Mật khẩu dùng chung cho tất cả tài khoản:** `Admin@1234`

---

## MỤC LỤC KỊCH BẢN
1. [Bảng Tra cứu Tài khoản & Dữ liệu Nền](#1-bảng-tra-cứu-tài-khoản--dữ-liệu-nền)
2. [Giai đoạn 1: Khám phá Public, Đăng ký B2B, Hợp đồng & Setup Tổ chức](#2-giai-đoạn-1-khám-phá-public-đăng-ký-b2b-hợp-đồng--setup-tổ-chức)
3. [Giai đoạn 2: Owner Journey — Quản trị Tổ chức, Chuẩn Năng lực & Đào tạo](#3-giai-đoạn-2-owner-journey--quản-trị-tổ-chức-chuẩn-năng-lực--đào-tạo)
4. [Giai đoạn 3: Employee Journey — Học tập, Sát hạch & Nộp Minh chứng Thực tế](#4-giai-đoạn-3-employee-journey--học-tập-sát-hạch--nộp-minh-chứng-thực-tế)
5. [Giai đoạn 4: Manager Journey — Giám sát Đội ngũ & Thẩm định Minh chứng](#5-giai-đoạn-4-manager-journey--giám-sát-đội-ngũ--thẩm-định-minh-chứng)
6. [Giai đoạn 5: Individual Workspace — Lộ trình Phát triển Nghề nghiệp Cá nhân](#6-giai-đoạn-5-individual-workspace--lộ-trình-phát-triển-nghề-nghiệp-cá-nhân)
7. [Giai đoạn 6: Platform Admin Journey — Quản trị Nền tảng Toàn Sàn](#7-giai-đoạn-6-platform-admin-journey--quản-trị-nền-tảng-toàn-sàn)
8. [Giai đoạn 7: Kiểm thử Các Ca Biên, Quyền hạn & Giới hạn Gói (Edge Cases)](#8-giai-đoạn-7-kiểm-thử-các-ca-biên-quyền-hạn--giới-hạn-gói-edge-cases)
9. [Bảng Ma trận Kiểm tra 100% Màn hình (Verification Matrix)](#9-bảng-ma-trận-kiểm-tra-100-màn-hình-verification-matrix)

---

## 1. BẢNG TRA CỨU TÀI KHOẢN & DỮ LIỆU NỀN

| Vai trò (Role) | Email đăng nhập | Họ tên hiển thị | Phạm vi quyền (Scope) | Mục đích trong Kịch bản |
| :--- | :--- | :--- | :--- | :--- |
| **OWNER** | `owner@digitalent.ai` | Nguyễn Văn Chủ | Toàn tổ chức Acme Corp | Quản trị chuẩn vị trí, phát hiện gap, tạo đợt đào tạo |
| **MANAGER** | `manager@digitalent.ai` | Phạm Thị Quản Lý | Phòng Kinh doanh (`dep-kd`) | Theo dõi team, chấm điểm rubric và duyệt bài thực hành |
| **EMPLOYEE** | `employee@digitalent.ai` | Hoàng Văn Nhân Viên | Cá nhân (`dep-kd`, `pos-sales`) | Nhận diện gap, học bài giảng focus, thi quiz, nộp bài |
| **PERSONAL** | `personal@digitalent.ai` | Bùi Thị Cá Nhân | Không gian cá nhân | Chọn vị trí mục tiêu `SALES_CRM`, thi diagnostic, tự học |
| **PLATFORM_ADMIN** | `platform@digitalent.ai` | Ngô Văn Nền Tảng | Toàn bộ nền tảng DigiTalent | Quản lý khung TT02, ngân hàng đề thi, quản trị khách hàng |
| **OWNER (No Manager)** | `owner2@digitalent.ai` | Trần Văn Chủ Nhỏ | Toàn tổ chức Giải Pháp Trẻ | Test trường hợp SME không có Manager, Owner tự duyệt bài |
| **OWNER (Starter)** | `starter@digitalent.ai` | Đặng Văn Starter | Tổ chức Khởi Nghiệp Số | Test Paywall khi bấm vào tính năng Khóa nội bộ |
| **OWNER (Expired)** | `expired@digitalent.ai` | Vũ Thị Hết Hạn | Tổ chức Cũ Kỹ | Test trạng thái cảnh báo hết hạn gói (Read-only state) |

---

## 2. GIAI ĐOẠN 1: KHÁM PHÁ PUBLIC, ĐĂNG KÝ B2B, HỢP ĐỒNG & SETUP TỔ CHỨC

### Bước 1.1: Cổng chọn Hướng (Portal Selector)
* **URL**: `http://localhost:5173/portal` (hoặc `/`)
* **Mục tiêu**: Xác minh trải nghiệm phân luồng rõ ràng giữa Doanh nghiệp và Cá nhân.
* **Thao tác**:
  1. Màn hình hiển thị 2 thẻ lớn: **Dành cho doanh nghiệp** và **Dành cho cá nhân**.
  2. Bấm vào nút **"Xem giải pháp doanh nghiệp"** tại thẻ Doanh nghiệp $\rightarrow$ Điều hướng tới `/business`.

### Bước 1.2: Trang chủ Doanh nghiệp (Enterprise Landing) & Bảng giá
* **URL**: `/business`
* **Mục tiêu**: Thuyết minh giá trị cốt lõi của đề tài với Mentor: Vòng lặp khép kín 6 bước (Vị trí $\rightarrow$ Chuẩn TT02 $\rightarrow$ Skill Gap $\rightarrow$ Đào tạo $\rightarrow$ Đánh giá $\rightarrow$ Minh chứng thực tế).
* **Thao tác**: Bấm nút **"Xem bảng giá & gói dịch vụ"** trên thanh điều hướng $\rightarrow$ Điều hướng tới `/business/pricing`.

### Bước 1.3: Chọn Gói Dịch vụ & Đăng ký Tài khoản Chủ Doanh nghiệp
* **URL**: `/business/pricing`
* **Kiểm tra**: Bảng so sánh 3 gói cước (Starter, Pro, Enterprise). Gói Pro hỗ trợ tối đa 50 người dùng cơ bản kèm tính năng Khóa học nội bộ và Nhiệm vụ thực tế.
* **Thao tác**: Bấm nút **"Bắt đầu với gói Pro"** $\rightarrow$ Điều hướng tới `/business/register`.
* **Dữ liệu mẫu điền form đăng ký tối giản**:
  ```text
  Họ và tên:          Đặng Quang Minh
  Email công việc:    ceo@tantiensolutions.vn
  Mật khẩu:          Admin@1234
  Điều khoản:         [Tích chọn] Đồng ý với Điều khoản dịch vụ và Chính sách bảo mật
  ```
* **Thao tác**: Bấm **"Tiếp tục"** $\rightarrow$ Hệ thống tự động chuyển sang trang Hợp đồng điện tử.

### Bước 1.4: Ký Hợp đồng Điện tử & Thanh toán
* **URL**: `/checkout/contract`
* **Kiểm tra**: Điều khoản hợp đồng dịch vụ đào tạo số hóa, cam kết an toàn thông tin theo Nghị định 13/2023/NĐ-CP.
* **Thao tác**: Bấm **"Ký hợp đồng và Chuyển đến thanh toán"** $\rightarrow$ Điều hướng tới `/checkout`.
* **Kiểm tra tại Checkout**:
  - Thông tin gói: *Doanh nghiệp Pro — Gói bao gồm tối đa 50 người dùng*.
  - Chu kỳ: Hàng năm (tiết kiệm 20%).
* **Thao tác**: Bấm **"Xác nhận thanh toán mô phỏng"** $\rightarrow$ Chuyển tới `/checkout/result` hiển thị trạng thái **Thành công** $\rightarrow$ Bấm nút **"Bắt đầu thiết lập tổ chức"** $\rightarrow$ Điều hướng tới `/setup`.

### Bước 1.5: Wizard Thiết lập Cơ cấu Tổ chức Ban đầu (`/setup`)
* **Mục tiêu**: Trải nghiệm Setup Wizard tinh gọn 3 bước (Đã loại bỏ hoàn toàn bước Job Grade G1–G3).
* **Thao tác & Dữ liệu mẫu**:
  - **Bước 1 — Thông tin tổ chức**:
    ```text
    Tên doanh nghiệp:  Công ty Cổ phần Giải pháp Số Tân Tiến
    Ngành nghề:        Công nghệ thông tin & Dịch vụ số
    Quy mô:            20 - 50 nhân sự
    Múi giờ:           (GMT+07:00) Bangkok, Hanoi, Jakarta
    ```
    Bấm *Tiếp tục*.
  - **Bước 2 — Thiết lập phòng ban**:
    ```text
    Phòng ban 1:       Phòng Kinh doanh (Mã: KD)
    Phòng ban 2:       Phòng Kế toán & Vận hành (Mã: KT)
    ```
    Bấm *Tiếp tục*.
  - **Bước 3 — Thiết lập vị trí công việc**:
    ```text
    Vị trí 1:          Chuyên viên Kinh doanh (CRM) (Gán vào: Phòng Kinh doanh)
    Vị trí 2:          Kế toán viên tổng hợp (Gán vào: Phòng Kế toán & Vận hành)
    ```
    Bấm *Tiếp tục*.
  - **Bước 4 — Hoàn tất thiết lập**:
    Bấm nút **"Vào Bảng điều khiển Doanh nghiệp"** $\rightarrow$ Điều hướng tới `/enterprise/dashboard`.

---

## 3. GIAI ĐOẠN 2: OWNER JOURNEY — QUẢN TRỊ TỔ CHỨC, CHUẨN NĂNG LỰC & ĐÀO TẠO

> **Tài khoản đăng nhập:** `owner@digitalent.ai` | **Mật khẩu:** `Admin@1234`  
> *(Để tận dụng trọn vẹn bộ dữ liệu seed phong phú của tổ chức Acme Corp)*

### Bước 2.1: Tổng quan Tổ chức (Organization Dashboard)
* **URL**: `/enterprise/dashboard` (`OW-01`)
* **Kiểm tra**:
  - Thẻ chỉ số: 13 nhân viên, 5 phòng ban, 42/50 quyền sử dụng đã kích hoạt.
  - Khối biểu đồ phân bố năng lực và cảnh báo Skill Gap: Cảnh báo đỏ ở nhóm *Ứng dụng AI* và *Bảo vệ dữ liệu*.
  - Hàng đợi minh chứng cần duyệt: Hiển thị nhiệm vụ đang chờ đánh giá.

### Bước 2.2: Quản lý Cơ cấu Tổ chức & Nhân sự
* **URL**: `/enterprise/departments` (`OW-06`) $\rightarrow$ Xem danh sách 5 phòng ban. Bấm vào `Phòng Kinh doanh` (`dep-kd`) xem chi tiết: Trưởng phòng là `Phạm Thị Quản Lý` (`emp-02`).
* **URL**: `/enterprise/positions` (`OW-09`) $\rightarrow$ Xem danh mục các vị trí công việc. Vị trí trung tâm: `Kinh doanh (CRM)` (`pos-sales`). *(Xác nhận: Menu Cấp bậc OW-12 đã được ẩn an toàn)*.
* **URL**: `/enterprise/members` (`OW-02`) $\rightarrow$ Thấy nhân viên demo `Hoàng Văn Nhân Viên` (`employee@digitalent.ai`) thuộc Phòng Kinh doanh, vị trí Kinh doanh (CRM).
* **Thao tác thêm nhân viên mới (Kiểm tra Form thêm nhanh)**:
  - Bấm nút **"Thêm thành viên"** (hoặc "Mời nhân viên"):
    ```text
    Họ và tên:         Nguyễn Hải Yến
    Email công việc:   yen.nh@acme.vn
    Mã nhân viên:      EMP-014
    Phòng ban:         Phòng Kinh doanh
    Vị trí:            Kinh doanh (CRM)
    Vai trò hệ thống:  Nhân viên (EMPLOYEE)
    ```
  - Bấm **"Lưu thành viên"** $\rightarrow$ Thành viên mới xuất hiện trong danh sách.
* **URL**: `/enterprise/access` (`OW-13`) $\rightarrow$ Xem ma trận phân quyền: `Phạm Thị Quản Lý` nắm quyền `MANAGER` phạm vi phòng Kinh doanh.

### Bước 2.3: Khám phá Khung Năng Lực TT 02/2025
* **URL**: `/enterprise/framework` (`OW-14`)
* **Thuyết minh trước Mentor**:
  - Hệ thống tích hợp chuẩn **6 miền năng lực — 24 năng lực thành phần** theo Thông tư 02/2025/TT-BGDĐT.
  - Mở xem **Miền 6: Ứng dụng trí tuệ nhân tạo (AI)**:
    * `TT02-6.1`: Hiểu biết về AI (GenAI, prompt engineering).
    * `TT02-6.2`: Sử dụng AI có đạo đức và trách nhiệm (bảo mật dữ liệu, tránh bias).
    * `TT02-6.3`: Đánh giá các công cụ AI.
  - Bấm vào chi tiết năng lực `TT02-6.1` (`OW-15`) $\rightarrow$ Xem tiêu chí và chỉ số hành vi 3 cấp độ: Cơ bản (L1), Trung cấp (L2), Nâng cao (L3).

### Bước 2.4: Thiết lập Chuẩn Năng lực theo Vị trí (Position Requirements)
* **URL**: `/enterprise/requirements` (`OW-16`) $\rightarrow$ Bấm nút **"Thiết lập yêu cầu"** (`/enterprise/requirements/builder` - `OW-17`).
* **Thao tác thiết lập chuẩn cho vị trí `Kinh doanh (CRM)`**:
  1. Chọn vị trí: `Kinh doanh (CRM)`.
  2. Cấu hình mức yêu cầu cho các năng lực trọng yếu:
     ```text
     TT02-1.1 (Tìm kiếm & lọc dữ liệu):          Mức 2 (Trung cấp)
     TT02-2.1 (Tương tác trong môi trường số):    Mức 3 (Nâng cao)
     TT02-4.2 (Bảo vệ dữ liệu cá nhân & CRM):     Mức 3 (Nâng cao) — [Tích chọn] Bắt buộc (Mandatory)
     TT02-6.1 (Hiểu biết & Ứng dụng AI):         Mức 2 (Trung cấp)
     TT02-6.2 (Đạo đức & Trách nhiệm AI):        Mức 2 (Trung cấp)
     ```
  3. Bấm nút **"Chia đều trọng số theo miền"** $\rightarrow$ Hệ thống tự động tính toán trọng số chuẩn, thanh tổng trọng số báo **100.00% (Hợp lệ)**.
  4. Bấm **"Kích hoạt phiên bản mới (Activate)"** $\rightarrow$ Hệ thống tự động tính toán lại ma trận Skill Gap cho toàn bộ nhân sự vị trí này.

### Bước 2.5: Phân tích Khoảng trống Năng lực (Skill Gap Analytics)
* **URL**: `/enterprise/skill-gap` (`OW-21`)
* **Thao tác**:
  1. Lọc theo Phòng ban: `Phòng Kinh doanh`.
  2. Bấm vào dòng của `Hoàng Văn Nhân Viên` $\rightarrow$ Mở trang chi tiết `/enterprise/skill-gap/:id` (`OW-22`).
* **Kiểm tra & Thuyết minh**:
  - Năng lực `TT02-6.1`: Vị trí yêu cầu **Trung cấp (Level 2)**, nhân viên hiện tại mới đạt **Cơ bản (Level 1)** $\rightarrow$ **Gap = 1** (Cảnh báo cam).
  - Năng lực `TT02-4.2`: Vị trí yêu cầu **Nâng cao (Level 3)**, nhân viên hiện tại mới đạt **Cơ bản (Level 1)** $\rightarrow$ **Gap = 2** (Cảnh báo đỏ — Năng lực bắt buộc).

### Bước 2.6: Đề xuất Học tập Tự động & Tạo Đợt Đào tạo (Training Batch)
* **URL**: `/enterprise/assignments/recommendations` (`OW-29`)
  - Thuật toán Rule-based phân tích khoảng trống và đề xuất: Khóa `M6-I: Ứng dụng AI trung cấp` để đóng Gap của `TT02-6.1`.
* **URL**: `/enterprise/training-batches/new` (`OW-26`)
* **Dữ liệu mẫu điền Wizard tạo đợt đào tạo**:
  ```text
  Tên đợt đào tạo:     Bồi dưỡng Ứng dụng AI & Kỹ năng Số trong Bán hàng Q4/2026
  Mô tả:               Đào tạo chuẩn hóa kỹ năng ứng dụng Prompt GenAI và bảo mật dữ liệu CRM
  Khóa học áp dụng:    Ứng dụng AI trung cấp (M6-I)
  Đối tượng tham gia:  Chọn nhân viên "Hoàng Văn Nhân Viên" (Phòng Kinh doanh)
  Thời hạn hoàn thành: 14 ngày kể từ hôm nay
  ```
* **Thao tác**: Bấm **"Phát động đợt đào tạo"** $\rightarrow$ Chuyển về danh sách đợt đào tạo (`OW-25`) với trạng thái `RUNNING`.

### Bước 2.7: Quản lý Khóa học Nội bộ (Internal Courses — SOP Company Culture)
* **URL**: `/enterprise/internal-courses` (`OW-31`)
* **Thao tác**:
  1. Bấm **"Tạo khóa học nội bộ"** (`OW-32`).
  2. Nhập thông tin:
     ```text
     Tiêu đề khóa học:    Quy định An toàn Dữ liệu Khách hàng & Sử dụng AI Tân Tiến
     Mã khóa:             SOP-SEC-01
     Thời lượng:          45 phút
     Nội dung bài học 1:  Quy tắc không đưa dữ liệu PII của khách hàng lên LLM công cộng
     Nội dung bài học 2:  Quy trình sao lưu và bảo mật tài khoản CRM 2FA
     ```
  3. Bấm **"Lưu và Xuất bản"**.

### Bước 2.8: Giám sát Tiến độ Đào tạo (Training Monitor)
* **URL**: `/enterprise/training-monitor` (`OW-30`)
* **Kiểm tra**: Bảng theo dõi thời gian thực tiến độ học tập của các phòng ban, tỷ lệ hoàn thành, cảnh báo nhân viên sắp đến hạn (Overdue warning).

---

## 4. GIAI ĐOẠN 3: EMPLOYEE JOURNEY — HỌC TẬP, SÁT HẠCH & NỘP MINH CHỨNG THỰC TẾ

> **Tài khoản đăng nhập:** `employee@digitalent.ai` | **Mật khẩu:** `Admin@1234`  
> *(Nhân vật: Hoàng Văn Nhân Viên — Chuyên viên Kinh doanh CRM)*

### Bước 3.1: Nhận diện Khoảng trống Năng lực của Bản thân
* **URL**: `/enterprise/me` (`EM-01` — Bảng phát triển cá nhân)
  - Thông báo nổi bật: Bạn được phân công tham gia đợt đào tạo *Ứng dụng AI trung cấp (M6-I)*.
* **URL**: `/enterprise/me/skill-gap` (`EM-03`)
  - Xem biểu đồ so sánh: Chỉ rõ bản thân đang thiếu 1 bậc ở năng lực AI `6.1` và thiếu 2 bậc ở năng lực Bảo vệ dữ liệu `4.2`.
* **URL**: `/enterprise/me/learning-path` (`EM-05`)
  - Xem lộ trình học tập được cá nhân hóa xếp theo thứ tự ưu tiên giải quyết Skill Gap.

### Bước 3.2: Học Bài giảng Tương tác (Focus Lesson Viewer)
* **URL**: `/enterprise/me/courses` (`EM-06`) $\rightarrow$ Bấm vào khóa học `Ứng dụng AI trung cấp (M6-I)` (`EM-07`).
* **URL**: Bấm vào bài học 1 $\rightarrow$ Điều hướng sang `/enterprise/me/courses/:id/lessons/:lessonId` (`EM-08`).
* **Kiểm tra & Thao tác**:
  - Giao diện Focus Layout tối giản, ẩn sidebar để tập trung tối đa cho người học.
  - Nội dung bài học: *Kỹ thuật Prompting nâng cao phục vụ phân loại nhu cầu khách hàng và soạn thư chào giá*.
  - Đọc nội dung, xem tài liệu hướng dẫn $\rightarrow$ Bấm nút **"Đã hoàn thành bài học này"**.
  - Thanh tiến độ khóa học nhảy lên **100%**.

### Bước 3.3: Làm Bài thi Sát hạch Trắc nghiệm & Nhận Chứng nhận Hoàn thành
* **URL**: `/enterprise/me/assessments` (`EM-09`) $\rightarrow$ Bấm **"Làm bài đánh giá"** (`EM-11`).
* **Thao tác trong phòng thi**:
  - Đồng hồ đếm ngược (30 phút, 10 câu hỏi tình huống).
  - Trả lời các câu hỏi về: Nguyên tắc bảo mật khi dùng ChatGPT/Claude, Cách nhận biết AI Hallucination, Quyền riêng tư khách hàng.
  - Bấm **"Nộp bài thi"** $\rightarrow$ Hệ thống tự động chấm điểm và chuyển sang màn hình kết quả (`EM-12`).
* **Kiểm tra kết quả & Thông điệp chuẩn học thuật**:
  - Điểm số: **90 / 100 — ĐẠT (PASSED)**.
  - Mã chứng nhận số: `DT-2026-M6I-001`.
  - **Thông điệp chuẩn mực**: *"Bạn đã hoàn thành xuất sắc đánh giá kiến thức lý thuyết. Để được công nhận năng lực Trung cấp tại nơi làm việc, hãy hoàn thành Nhiệm vụ thực tế được giao."*
* **URL**: `/enterprise/me/achievements` (`EM-18`) $\rightarrow$ Xem thẻ Chứng nhận hoàn thành khóa học và mã QR xác thực nội bộ.

### Bước 3.4: Thực hiện Nhiệm vụ Thực tế (Work-based Practical Task)
* **URL**: `/enterprise/me/tasks` (`EM-14`) $\rightarrow$ Mở nhiệm vụ `tsk-001`:  
  *Tiêu đề*: `Xây dựng quy trình ứng dụng Prompt AI và bảo mật dữ liệu khách hàng trên CRM`  
  *Năng lực mục tiêu*: `TT02-6.1 (Mức 2)` và `TT02-4.2 (Mức 2)`.  
  *Hạn hoàn thành*: Còn 7 ngày.
* **URL**: Bấm **"Nộp minh chứng"** (`/enterprise/me/tasks/:id/submit` - `EM-16`).
* **Dữ liệu mẫu điền Form nộp minh chứng**:
  ```text
  Tiêu đề minh chứng:    Báo cáo Thực hành: Bộ Template Prompt tư vấn giải pháp & Quy chuẩn an toàn dữ liệu CRM
  Đường dẫn tài liệu:    https://docs.google.com/document/d/demo-prompt-crm-evidence-hoang
  Nội dung tường trình:  Kính gửi Trưởng phòng, em đã xây dựng 3 template prompt hỗ trợ tóm tắt nhu cầu khách hàng từ biên bản họp và soạn thảo thư chào giá chuẩn. Em đã thiết lập cơ chế ẩn toàn bộ thông tin PII (số điện thoại, thẻ ngân hàng, CMND) trước khi gửi truy vấn sang công cụ AI, tuân thủ đúng quy định bảo mật của công ty. Kính gửi Quản lý thẩm định và phê duyệt ạ.
  ```
* **Thao tác**: Bấm **"Gửi minh chứng để đánh giá"** $\rightarrow$ Trạng thái nhiệm vụ chuyển sang `PENDING_REVIEW` (Chờ đánh giá).

---

## 5. GIAI ĐOẠN 4: MANAGER JOURNEY — GIÁM SÁT ĐỘI NGŨ & THẨM ĐỊNH MINH CHỨNG

> **Tài khoản đăng nhập:** `manager@digitalent.ai` | **Mật khẩu:** `Admin@1234`  
> *(Nhân vật: Phạm Thị Quản Lý — Trưởng phòng Kinh doanh)*

### Bước 4.1: Giám sát Năng lực & Đào tạo Phòng Kinh doanh
* **URL**: `/enterprise/team` (`MG-01` — Tổng quan nhóm)
* **Kiểm tra**:
  - Quản lý **chỉ nhìn thấy nhân viên thuộc Phòng Kinh doanh** (Hoàng Văn Nhân Viên, Đỗ Minh Quân, Vũ Thu Hà), không thấy nhân viên phòng khác (chứng minh tính năng Department Scope Guard hoạt động hoàn hảo).
* **URL**: `/enterprise/team/members` (`MG-02`) $\rightarrow$ Xem hồ sơ thành viên nhóm.
* **URL**: `/enterprise/team/training` (`MG-06`) $\rightarrow$ Thấy `Hoàng Văn Nhân Viên` đã hoàn thành khóa học và vừa nộp bài thực hành.

### Bước 4.2: Thẩm định Minh chứng & Phê duyệt Nâng bậc Năng lực
* **URL**: `/enterprise/reviews` (`MG-11` — Hàng đợi đánh giá)
* **Thao tác**:
  1. Thấy bài nộp đang chờ của nhân viên `Hoàng Văn Nhân Viên` (Nhiệm vụ `tsk-001`).
  2. Bấm vào bài nộp để chấm điểm (`/enterprise/reviews/:submissionId` - `MG-12`).
* **Kiểm tra giao diện thẩm định**:
  - Hiển thị đầy đủ: Kết quả thi lý thuyết (90 điểm) + Link tài liệu minh chứng + Lời tường trình của nhân viên.
* **Dữ liệu mẫu chấm điểm theo tiêu chí Rubric**:
  ```text
  Tiêu chí 1: Tính an toàn dữ liệu khách hàng CRM (Max 40 điểm):   Chấm 38 điểm
  Tiêu chí 2: Hiệu quả ứng dụng Prompt AI (Max 60 điểm):            Chấm 56 điểm
  Tổng điểm: 94 / 100 điểm
  Nhận xét đánh giá (Feedback):
  "Bài làm rất thực tế, các mẫu prompt được xây dựng chỉn chu, đặc biệt có ý thức che giấu dữ liệu khách hàng nhạy cảm rất tốt theo quy chế công ty. Phê duyệt đạt yêu cầu năng lực Trung cấp."
  Mức năng lực phê duyệt: Chọn "Trung cấp (Level 2)" cho năng lực TT02-6.1.
  ```
* **Thao tác**: Bấm nút **"Phê duyệt & Xác nhận năng lực (Approve & Confirm)"**.

### Bước 4.3: Kiểm chứng Đóng Gap Thực chất (Điểm "Ăn điểm" Thuyết trình)
* **URL**: `/enterprise/team/skill-gap` (`MG-05`)
* **Thuyết minh trước Mentor**:
  - Quan sát dòng của nhân viên `Hoàng Văn Nhân Viên`:
    * Năng lực `TT02-6.1` (Ứng dụng AI): Yêu cầu L2 $\rightarrow$ Đã xác nhận L2 qua bài thực hành $\rightarrow$ **Khoảng trống kỹ năng chính thức giảm từ 1 về 0 (Đã đạt chuẩn ✅)**.
    * Năng lực `TT02-4.2` (Bảo vệ dữ liệu): Yêu cầu L3 $\rightarrow$ Hiện tại mới đạt L2 $\rightarrow$ **Vẫn còn Gap = 1 ❌**.
  - **Thông điệp kết luận**: *"Hệ thống kiểm chứng năng lực dựa trên bằng chứng thực tế tại nơi làm việc, không cào bằng, phản ánh đúng thực chất trình độ của người lao động."*

---

## 6. GIAI ĐOẠN 5: INDIVIDUAL WORKSPACE — LỘ TRÌNH PHÁT TRIỂN NGHỀ NGHIỆP CÁ NHÂN

> **Tài khoản đăng nhập:** `personal@digitalent.ai` (hoặc `personal@digitalent.demo`) | **Mật khẩu:** `Admin@1234`  
> *(Nhân vật: Bùi Thị Cá Nhân — Người học tự do)*  
> *(Xem kịch bản chi tiết 35 ca kiểm thử full luồng public & cá nhân kèm bằng chứng Dark/Light Mode tại: [docs/test-evidence/2026-10-09-individual-learner-e2e](file:///d:/digitalent-ai/docs/test-evidence/2026-10-09-individual-learner-e2e/KICH_BAN_TEST_INDIVIDUAL_E2E.md))*

### Bước 6.1: Không gian Cá nhân (Personal Dashboard)
* **URL**: `/personal/dashboard`
* **Kiểm tra**: Giao diện cá nhân hóa hiện đại, không có cấu trúc phòng ban/tổ chức, tập trung hoàn toàn vào mục tiêu nghề nghiệp và năng lực số cá nhân.

### Bước 6.2: Chọn Vị trí Mục tiêu Nghề nghiệp
* **URL**: `/personal/target`
* **Mục tiêu**: Chọn vị trí **`Kinh doanh (CRM)`** (Mã `SALES_CRM` — Đồng nhất 100% với vị trí demo ở doanh nghiệp).
* **Thao tác**: Xem ma trận yêu cầu của vị trí $\rightarrow$ Bấm nút **"Đặt làm vị trí mục tiêu"**.

### Bước 6.3: Đánh giá Năng lực Đầu vào (Personal Diagnostic Assessment)
* **URL**: `/personal/diagnostic`
* **Thao tác**:
  - Làm bài kiểm tra chẩn đoán đầu vào 18 câu hỏi tình huống công việc (3 câu/miền tương ứng 3 bậc Cơ bản - Trung cấp - Nâng cao theo chuẩn TT 02/2025/TT-BGDĐT).
  - Bấm **"Hoàn thành chẩn đoán"** $\rightarrow$ Hệ thống tự động phân tích điểm mạnh và các lỗ hổng kỹ năng so với chuẩn của vị trí `SALES_CRM`.

### Bước 6.4: Lộ trình Học tập Cá nhân hóa & Lớp học
* **URL**: `/personal/path`
  - Hệ thống tự động vạch ra lộ trình học tập từng chặng: Bắt đầu từ môn nền tảng $\rightarrow$ Môn trung cấp AI (`M6-I`) $\rightarrow$ Môn bảo mật thông tin (`A4-I`).
* **URL**: `/personal/classroom/:id` $\rightarrow$ Trải nghiệm học tập trong không gian lớp học cá nhân.
* **URL**: `/personal/certificates` $\rightarrow$ Quản lý các chứng chỉ cá nhân đã tích lũy để đưa vào CV ứng tuyển.
* **URL**: `/personal/subscription` $\rightarrow$ Quản lý gói cước cá nhân (*Cá nhân Plus*).

---

## 7. GIAI ĐOẠN 6: PLATFORM ADMIN JOURNEY — QUẢN TRỊ NỀN TẢNG TOÀN SÀN

> **Tài khoản đăng nhập:** `platform@digitalent.ai` | **Mật khẩu:** `Admin@1234`  
> *(Nhân vật: Ngô Văn Nền Tảng — Quản trị viên cấp cao DigiTalent AI)*

### Bước 7.1: Bảng Điều khiển Toàn Nền tảng (Platform Dashboard)
* **URL**: `/platform/dashboard` (`PA-01`)
* **Kiểm tra**: KPI toàn sàn: Tổng số khách hàng doanh nghiệp B2B (Acme Corp, Tân Tiến, Giải Pháp Trẻ), Tổng người dùng, Doanh thu thuê bao, Tình trạng tài nguyên hệ thống.
* **URL**: `/platform/organizations` (`PA-02`) $\rightarrow$ Quản lý danh sách doanh nghiệp; thao tác tạm khóa hoặc kích hoạt tổ chức.
* **URL**: `/platform/users` (`PA-04`) $\rightarrow$ Quản lý tài khoản người dùng toàn sàn, hỗ trợ mở khóa và reset bảo mật.

### Bước 7.2: Quản trị Nguồn Tri thức Khung Năng Lực TT 02/2025
* **URL**: `/platform/framework` (`PA-06`)
* **Thuyết minh trước Mentor**:
  - Đây là **Source-of-Truth** duy nhất của toàn bộ hệ thống.
  - Nền tảng quản lý phiên bản dữ liệu chuẩn theo Thông tư 02/2025/TT-BGDĐT (Phiên bản `2025.1 — Published`).
  - Dữ liệu được bảo vệ nghiêm ngặt: Doanh nghiệp chỉ có quyền đọc (Read-only tham chiếu), chỉ Platform Admin có quyền cập nhật phiên bản mới khi cơ quan nhà nước sửa đổi thông tư, có nhật ký kiểm toán (Audit Trail) đầy đủ.

### Bước 7.3: Quản lý Khung Chương trình Chuẩn & Ngân hàng Đề thi
* **URL**: `/platform/curriculum` (`PA-08`) $\rightarrow$ Quản lý 18 khóa học chuẩn hóa tương ứng 6 miền năng lực. Mở xem trình soạn thảo khóa học chuẩn (`PA-10`).
* **URL**: `/platform/assessment-bank` (`PA-11`) $\rightarrow$ Ngân hàng câu hỏi trắc nghiệm đánh giá kiến thức theo từng năng lực TT02.
* **URL**: `/platform/positions` (`PA-14`) $\rightarrow$ Thư viện 5 Vị trí tham chiếu chuẩn thị trường (CEO, HR, Marketing, Sales CRM, Accountant).
* **URL**: `/platform/plans` (`PA-16`) $\rightarrow$ Cấu hình tính năng và hạn mức của các gói thương mại (Starter, Pro, Enterprise).

### Bước 7.4: Nhật ký Hoạt động Hệ thống (Audit Log)
* **URL**: `/platform/audit-log` (`PA-20`)
* **Kiểm tra**: Lịch sử ghi nhận toàn bộ các thao tác nhạy cảm: Đăng ký tổ chức, Thay đổi gói cước, Cập nhật khung năng lực, Đăng nhập quản trị.

---

## 8. GIAI ĐOẠN 7: KIỂM THỬ CÁC CA BIÊN, QUYỀN HẠN & GIỚI HẠN GÓI (EDGE CASES)

### Ca 7.1: Doanh nghiệp Siêu nhỏ Không có Role Manager
* **Đăng nhập**: `owner2@digitalent.ai` (Trần Văn Chủ Nhỏ — Công ty TNHH Giải Pháp Trẻ).
* **Mục tiêu**: Chứng minh mô hình SME linh hoạt: Khi doanh nghiệp nhỏ không phân công Manager, Owner có toàn quyền tự duyệt minh chứng và xác nhận năng lực cho nhân viên toàn công ty.
* **Thao tác**: Owner vào thẳng `/enterprise/reviews` $\rightarrow$ Thấy bài nộp và tự tay chấm điểm, phê duyệt thành công.

### Ca 7.2: Kiểm tra Giới hạn Tính năng theo Gói Cước (Paywall / Entitlement)
* **Đăng nhập**: `starter@digitalent.ai` (Đặng Văn Starter — Gói Doanh nghiệp Starter).
* **Mục tiêu**: Chứng minh cơ chế bảo vệ quyền lợi gói cước (Feature Gate / Paywall).
* **Thao tác**: Bấm vào mục **Khóa nội bộ** (`/enterprise/internal-courses`).
* **Kết quả mong đợi**: Màn hình hiển thị thông báo **"Tính năng chưa được kích hoạt cho gói này"** kèm nút kêu gọi nâng cấp lên gói Pro (*Upgrade Prompt*).

### Ca 7.3: Kiểm tra Trạng thái Hết hạn Thuê bao (Expired Subscription)
* **Đăng nhập**: `expired@digitalent.ai` (Vũ Thị Hết Hạn — Gói cước đã hết hạn).
* **Mục tiêu**: Chứng minh cơ chế xử lý khi khách hàng chưa gia hạn dịch vụ.
* **Kết quả mong đợi**: Hệ thống hiển thị thanh thông báo màu vàng cảnh báo thanh toán (`payment_required`), toàn bộ dữ liệu tổ chức được bảo lưu ở chế độ chỉ đọc (Read-only), ngăn chặn thao tác tạo mới hoặc giao khóa học.

### Ca 7.4: Cài đặt Tài khoản & Bảo mật Dùng chung (Shared Account Pages)
* **URL**: `/enterprise/account` (`SHR-01`) $\rightarrow$ Xem và cập nhật thông tin cá nhân.
* **URL**: `/enterprise/account/security` (`SHR-02`) $\rightarrow$ Đổi mật khẩu, quản lý phiên đăng nhập.
* **URL**: `/enterprise/notifications` (`SHR-03`) $\rightarrow$ Trung tâm thông báo về hạn nộp bài, phân công khóa học mới và kết quả duyệt bài.

---

## 9. BẢNG MA TRẬN KIỂM TRA 100% MÀN HÌNH (VERIFICATION MATRIX)

| Screen ID | Tên trang | Route URL | Role chính | Trạng thái Route | Trạng thái UI | Mock Data | Kết quả Test E2E |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **PUB-01** | Cổng chọn Portal | `/portal` | Public | ✅ | ✅ | ✅ | **DEMO READY** |
| **PUB-02** | Landing Doanh nghiệp | `/business` | Public | ✅ | ✅ | ✅ | **DEMO READY** |
| **PUB-03** | Bảng giá Doanh nghiệp | `/business/pricing` | Public | ✅ | ✅ | ✅ | **DEMO READY** |
| **AUTH-01** | Đăng ký Doanh nghiệp | `/business/register` | Public | ✅ | ✅ | ✅ | **DEMO READY** |
| **AUTH-02** | Thanh toán (Checkout) | `/checkout` | Buyer | ✅ | ✅ | ✅ | **DEMO READY** |
| **AUTH-03** | Kết quả thanh toán | `/checkout/result` | Buyer | ✅ | ✅ | ✅ | **DEMO READY** |
| **AUTH-05** | Thiết lập ban đầu (Setup) | `/setup` | Owner | ✅ | ✅ | ✅ | **DEMO READY** |
| **AUTH-07** | Đăng nhập tập trung | `/login` | All | ✅ | ✅ | ✅ | **DEMO READY** |
| **OW-01** | Dashboard Doanh nghiệp | `/enterprise/dashboard` | Owner | ✅ | ✅ | ✅ | **DEMO READY** |
| **OW-02** | Danh sách Thành viên | `/enterprise/members` | Owner | ✅ | ✅ | ✅ | **DEMO READY** |
| **OW-06** | Danh sách Phòng ban | `/enterprise/departments` | Owner | ✅ | ✅ | ✅ | **DEMO READY** |
| **OW-09** | Danh sách Vị trí | `/enterprise/positions` | Owner | ✅ | ✅ | ✅ | **DEMO READY** |
| **OW-12** | Cấu hình cấp bậc | `/enterprise/positions/grades` | Owner | ⚠️ *(Retired)* | ⚠️ *(Bỏ demo)*| N/A | **RETIRED** |
| **OW-13** | Phân quyền Manager | `/enterprise/access` | Owner | ✅ | ✅ | ✅ | **DEMO READY** |
| **OW-14** | Khung năng lực TT02 | `/enterprise/framework` | Owner | ✅ | ✅ | ✅ | **DEMO READY** |
| **OW-16** | Yêu cầu theo vị trí | `/enterprise/requirements` | Owner | ✅ | ✅ | ✅ | **DEMO READY** |
| **OW-17** | Builder yêu cầu vị trí | `/enterprise/requirements/builder` | Owner | ✅ | ✅ | ✅ | **DEMO READY** |
| **OW-21** | Khoảng trống năng lực | `/enterprise/skill-gap` | Owner | ✅ | ✅ | ✅ | **DEMO READY** |
| **OW-23** | Danh mục Khóa học chuẩn | `/enterprise/courses` | Owner | ✅ | ✅ | ✅ | **DEMO READY** |
| **OW-25** | Danh sách Đợt đào tạo | `/enterprise/training-batches` | Owner | ✅ | ✅ | ✅ | **DEMO READY** |
| **OW-26** | Tạo Đợt đào tạo mới | `/enterprise/training-batches/new` | Owner | ✅ | ✅ | ✅ | **DEMO READY** |
| **OW-29** | Đề xuất học tập tự động | `/enterprise/assignments/recommendations` | Owner | ✅ | ✅ | ✅ | **DEMO READY** |
| **OW-30** | Giám sát tiến độ học tập | `/enterprise/training-monitor` | Owner/Manager | ✅ | ✅ | ✅ | **DEMO READY** |
| **OW-31** | Khóa học nội bộ | `/enterprise/internal-courses` | Owner | ✅ | ✅ | ✅ | **DEMO READY** |
| **OW-35** | Quản lý Nhiệm vụ thực tế | `/enterprise/tasks` | Owner/Manager | ✅ | ✅ | ✅ | **DEMO READY** |
| **OW-38** | Hàng đợi đánh giá minh chứng | `/enterprise/reviews` | Owner/Manager | ✅ | ✅ | ✅ | **DEMO READY** |
| **OW-41** | Quản lý Gói dịch vụ | `/enterprise/subscription` | Owner | ✅ | ✅ | ✅ | **DEMO READY** |
| **OW-44** | Cài đặt tổ chức | `/enterprise/settings` | Owner | ✅ | ✅ | ✅ | **DEMO READY** |
| **MG-01** | Tổng quan Nhóm | `/enterprise/team` | Manager | ✅ | ✅ | ✅ | **DEMO READY** |
| **MG-02** | Thành viên nhóm | `/enterprise/team/members` | Manager | ✅ | ✅ | ✅ | **DEMO READY** |
| **MG-05** | Khoảng trống năng lực nhóm | `/enterprise/team/skill-gap` | Manager | ✅ | ✅ | ✅ | **DEMO READY** |
| **MG-06** | Tiến độ đào tạo nhóm | `/enterprise/team/training` | Manager | ✅ | ✅ | ✅ | **DEMO READY** |
| **EM-01** | Bảng phát triển cá nhân | `/enterprise/me` | Employee | ✅ | ✅ | ✅ | **DEMO READY** |
| **EM-03** | Khoảng trống năng lực của tôi | `/enterprise/me/skill-gap` | Employee | ✅ | ✅ | ✅ | **DEMO READY** |
| **EM-06** | Khóa học của tôi | `/enterprise/me/courses` | Employee | ✅ | ✅ | ✅ | **DEMO READY** |
| **EM-08** | Bài học tương tác (Focus) | `/enterprise/me/courses/:id/lessons/:lessonId` | Employee | ✅ | ✅ | ✅ | **DEMO READY** |
| **EM-11** | Làm bài thi sát hạch (Quiz) | `/enterprise/me/assessments/:id/attempt` | Employee | ✅ | ✅ | ✅ | **DEMO READY** |
| **EM-12** | Kết quả đánh giá lý thuyết | `/enterprise/me/assessments/:id/result` | Employee | ✅ | ✅ | ✅ | **DEMO READY** |
| **EM-14** | Nhiệm vụ thực tế của tôi | `/enterprise/me/tasks` | Employee | ✅ | ✅ | ✅ | **DEMO READY** |
| **EM-16** | Nộp minh chứng thực tế | `/enterprise/me/tasks/:id/submit` | Employee | ✅ | ✅ | ✅ | **DEMO READY** |
| **EM-18** | Thành tựu & Chứng nhận số | `/enterprise/me/achievements` | Employee | ✅ | ✅ | ✅ | **DEMO READY** |
| **IND-01** | Landing Cá nhân | `/individual` | Public | ✅ | ✅ | ✅ | **DEMO READY** |
| **IND-05** | Dashboard Người học Cá nhân | `/personal/dashboard` | Personal | ✅ | ✅ | ✅ | **DEMO READY** |
| **IND-06** | Chọn Vị trí Mục tiêu | `/personal/target` | Personal | ✅ | ✅ | ✅ | **DEMO READY** |
| **IND-07** | Đánh giá Đầu vào (Diagnostic)| `/personal/diagnostic` | Personal | ✅ | ✅ | ✅ | **DEMO READY** |
| **IND-08** | Lộ trình Cá nhân hóa | `/personal/path` | Personal | ✅ | ✅ | ✅ | **DEMO READY** |
| **PA-01** | Platform Dashboard | `/platform/dashboard` | Admin | ✅ | ✅ | ✅ | **DEMO READY** |
| **PA-02** | Quản lý Khách hàng B2B | `/platform/organizations` | Admin | ✅ | ✅ | ✅ | **DEMO READY** |
| **PA-06** | Quản trị Khung chuẩn TT02 | `/platform/framework` | Admin | ✅ | ✅ | ✅ | **DEMO READY** |
| **PA-08** | Quản trị Chương trình chuẩn | `/platform/curriculum` | Admin | ✅ | ✅ | ✅ | **DEMO READY** |
| **PA-11** | Ngân hàng câu hỏi trắc nghiệm | `/platform/assessment-bank` | Admin | ✅ | ✅ | ✅ | **DEMO READY** |
| **PA-14** | Danh mục Vị trí tham chiếu | `/platform/positions` | Admin | ✅ | ✅ | ✅ | **DEMO READY** |
| **PA-16** | Quản trị Gói thương mại | `/platform/plans` | Admin | ✅ | ✅ | ✅ | **DEMO READY** |
| **PA-20** | Nhật ký Audit toàn sàn | `/platform/audit-log` | Admin | ✅ | ✅ | ✅ | **DEMO READY** |
