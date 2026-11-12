# DIGITALENT AI — KẾ HOẠCH ĐIỀU CHỈNH HỆ THỐNG TRƯỚC KIỂM THỬ END-TO-END

> **Phiên bản:** 1.0  
> **Mục tiêu:** Chuẩn hóa toàn bộ Frontend và Mock Data, loại bỏ triệt để các xung đột dữ liệu và logic kiến trúc, đưa hệ thống vào trạng thái hoàn hảo 100% trước khi thực thi Kịch bản Kiểm thử End-to-End và Demo với Mentor.  
> **Nguyên tắc cốt lõi:** **KHÔNG CAN THIỆP BACKEND CODE** — Toàn bộ điều chỉnh được thực hiện tập trung tại tầng Frontend (`frontend/src/`) trong chế độ `VITE_USE_MOCK=true`.

---

## 1. TỔNG QUAN CÁC ĐIỂM CẦN ĐIỀU CHỈNH

Dựa trên kết quả đối chiếu giữa tài liệu đặc tả (Spec v2.1, SRS, SDD, TT 02/2025/TT-BGDĐT) và hiện trạng mã nguồn frontend, có **5 hạng mục điều chỉnh bắt buộc** trước khi chạy kịch bản E2E:

```
[HẠNG MỤC 1] Bỏ hoàn toàn Job Grade G1-G3 khỏi UI & Wizard
      │
[HẠNG MỤC 2] Đồng bộ Seed Data Acme Corp theo Vị trí chuẩn SALES_CRM
      │
[HẠNG MỤC 3] Thống nhất Quy tắc: Level 1 thi lý thuyết vs Level 2/3 thực hành
      │
[HẠNG MỤC 4] Sửa lỗi bảo mật lộ PostgreSQL Connection String trong README.md
      │
[HẠNG MỤC 5] Chuẩn hóa thuật ngữ UI (Bỏ "seats/ghế", bỏ "WMS Task")
```

---

## 2. CHI TIẾT CÁC HẠNG MỤC ĐIỀU CHỈNH

### HẠNG MỤC 1: BỎ HOÀN TOÀN JOB GRADE G1–G3 TRÊN FRONTEND

#### 1.1. Lý do & Cơ sở học thuật
- **Triệt tiêu nguy cơ nhầm lẫn thuật ngữ**: Tránh việc Mentor/Hội đồng chất vấn sự nhập nhằng giữa *Cấp bậc chức vụ (Job Grade G1/G2/G3)* và *Bậc năng lực số (Competency Level L1/L2/L3)*.
- **Loại bỏ trùng lặp**: Khái niệm Vị trí công việc (*Job Position*) trong doanh nghiệp đã phản ánh đầy đủ cấp bậc chuyên môn (ví dụ: Trưởng phòng Kinh doanh vs Chuyên viên Kinh doanh).
- **Thống nhất với Backend**: Backend database không có bảng/entity `JobGrade`. Việc bỏ G1-G3 giúp Frontend khớp hoàn toàn với kiến trúc Backend.
- **Trục thực thể chuẩn hóa**:
  $$\text{Department (Phòng ban)} \longrightarrow \text{Job Position (Vị trí công việc)} \longrightarrow \text{Position Requirements (Yêu cầu năng lực)} \longrightarrow \text{Employee (Nhân sự)}$$

#### 1.2. Danh sách file và vị trí cần điều chỉnh
1. **`frontend/src/lib/screens/enterprise/owner.ts`**:
   - Đánh dấu màn hình `OW-12` (`/enterprise/positions/grades`) thành trạng thái `RETIRED`.
   - Loại bỏ khỏi danh sách navigation/sidebar của Owner.
2. **`frontend/src/features/onboarding/pages/SetupWizardPage.tsx`**:
   - Loại bỏ bước cấu hình Cấp bậc (Bước "Grades").
   - Wizard chỉ còn 3 bước tinh gọn:
     * Bước 1: Thông tin tổ chức (Tên công ty, ngành nghề, quy mô).
     * Bước 2: Thiết lập phòng ban.
     * Bước 3: Thiết lập vị trí công việc gắn với phòng ban.
3. **`frontend/src/features/organization/pages/PositionListPage.tsx` & `PositionDetailPage.tsx`**:
   - Ẩn cột/thẻ hiển thị "Cấp bậc G1/G2/G3" và bộ lọc Grade.
4. **`frontend/src/features/members/pages/MembersPage.tsx` & `MemberDetailPage.tsx`**:
   - Ẩn nhãn hiển thị Grade trên danh sách thành viên; chỉ hiển thị Phòng ban và Vị trí công việc.

---

### HẠNG MỤC 2: ĐỒNG BỘ SEED DATA THEO VỊ TRÍ CHUẨN `SALES_CRM`

#### 2.1. Lý do lựa chọn `SALES_CRM`
- Vị trí `Chuyên viên Kinh doanh (CRM)` là vị trí phổ biến nhất tại các doanh nghiệp SME, câu chuyện áp dụng AI (soạn email chào hàng, tóm tắt nhu cầu khách hàng) rất gần gũi và có tính thuyết phục cao.
- Trưởng phòng Kinh doanh trong seed chính là `Phạm Thị Quản Lý` (`manager@digitalent.demo`). Khi nhân viên demo là Sales, Manager sẽ chính là người quản lý trực tiếp, giải quyết triệt để lỗi phân quyền Department Scope (`tasks.ts:21`).
- Luồng Cá nhân (`/personal/target`) cũng hỗ trợ chọn vị trí tham chiếu `SALES_CRM`, tạo sự đồng nhất 100% giữa hai luồng.

#### 2.2. Danh sách file và vị trí cần điều chỉnh
1. **`frontend/src/services/mock/server/seed-acme.ts`**:
   - Tại mảng `EMPLOYEES`, cập nhật thông tin của nhân viên demo `emp-01` (`Hoàng Văn Nhân Viên` - `employee@digitalent.demo`):
     * `department`: Đổi từ `'dep-kt'` $\rightarrow$ `'dep-kd'` (Phòng Kinh doanh).
     * `position`: Đổi từ `'pos-acc'` $\rightarrow$ `'pos-sales'` (Kinh doanh CRM).
     * `base`: Đặt bằng `1` (Mức Cơ bản L1 cho tất cả các năng lực).
   - *Kết quả*:
     * Sếp trực tiếp của `employee@` là `Phạm Thị Quản Lý` (`manager@digitalent.demo`, Trưởng phòng Kinh doanh).
     * Yêu cầu năng lực vị trí `pos-sales` (`SALES_CRM`):
       - `TT02-6.1` (Ứng dụng AI): Yêu cầu **Trung cấp (Level 2)** $\rightarrow$ Nhân viên đang ở L1 $\rightarrow$ **Gap = 1**.
       - `TT02-4.2` (Bảo vệ dữ liệu khách hàng): Yêu cầu **Nâng cao (Level 3)** - Bắt buộc $\rightarrow$ Nhân viên đang ở L1 $\rightarrow$ **Gap = 2**.
2. **`frontend/src/services/mock/server/seed-work.ts`**:
   - Tại hàm `buildTasks()`, cập nhật nhiệm vụ `tsk-001`:
     * Tiêu đề: *Xây dựng quy trình ứng dụng Prompt AI và bảo mật dữ liệu khách hàng trên CRM*
     * Phòng ban: `'dep-kd'`, Vị trí: `'pos-sales'`.
     * Người giao: `empId(2)` (`Phạm Thị Quản Lý`).
     * Người được giao: Bổ sung `empId(1)` (`Hoàng Văn Nhân Viên`) vào `assignedEmployeeIds`.
     * Năng lực mục tiêu: `cmp-6-1` (Mức 2) và `cmp-4-2` (Mức 2).
   - Tại hàm `buildSubmissions()`:
     * Đảm bảo `empId(1)` **chưa có bài nộp nào được duyệt trước** cho `tsk-001`.
     * Điều này cho phép `employee@` trực tiếp nộp bài mới trong buổi demo, bài nộp chuyển sang trạng thái `PENDING_REVIEW` để `manager@` chấm điểm trước mặt Mentor.

---

### HẠNG MỤC 3: THỐNG NHẤT QUY TẮC "ASSESSMENT VS. WORK-BASED EVIDENCE"

#### 3.1. Cơ sở chuẩn mực theo thiết kế hệ thống
- Tách bạch rõ 2 tầng kết quả theo đúng định nghĩa trong `catalog.ts`:
  * **Level 1 (Cơ bản)**: Đạt bài kiểm tra trắc nghiệm cuối khóa $\rightarrow$ Xác nhận kiến thức nền tảng.
  * **Level 2 (Trung cấp) & Level 3 (Nâng cao)**: Đạt bài kiểm tra trắc nghiệm $\rightarrow$ Nhận **Chứng nhận hoàn thành khóa học**, nhưng **CHƯA xác nhận năng lực làm việc**. Năng lực làm việc chỉ được xác nhận chính thức sau khi nộp **Nhiệm vụ thực tế (Work-based Task)** và được **Quản lý/Chủ doanh nghiệp phê duyệt**.

#### 3.2. Danh sách file và vị trí cần điều chỉnh
1. **`frontend/src/services/mock/server/handlers/learning.ts`**:
   - Tại hàm xử lý nộp bài thi (`route('POST', '/assessments/:id/attempt', ...)`):
     * Nếu học viên thi đạt khóa học có `course.level >= 2`:
       - Cập nhật trạng thái phân công: `COMPLETED`.
       - Cấp bản ghi chứng nhận: `CertificateRecord` (Mã DT-2026-...).
       - **KHÔNG TỰ ĐỘNG GHI ĐÈ** `data.profiles[employee.id]` lên Level 2.
       - Giữ nguyên confirmed level để chờ bằng chứng thực tế từ Work Task.
     * Nếu học viên thi đạt khóa `course.level === 1`:
       - Tự động cập nhật `data.profiles` lên Level 1 (phù hợp với định nghĩa năng lực Cơ bản).
2. **`frontend/src/features/learning/pages/AssessmentResultPage.tsx`**:
   - Tại khối thông báo kết quả (dòng 110–126):
     * Nếu `course.level >= 2`: Đổi thông điệp thành:  
       *"Bạn đã hoàn thành xuất sắc đánh giá kiến thức lý thuyết. Để được xác nhận năng lực Trung cấp tại nơi làm việc, hãy hoàn thành Nhiệm vụ thực tế được giao."*
     * Bỏ câu: *"Hồ sơ năng lực của bạn đã được cập nhật tự động lên hệ thống doanh nghiệp."*
3. **`frontend/src/services/mock/server/handlers/tasks.ts`**:
   - Tại hàm chấm điểm bài nộp (`route('POST', '/tasks/submissions/:id/evaluate', ...)`):
     * Khi Manager/Owner chọn `confirmedLevel = 2` và bấm Phê duyệt (`APPROVED`):
       - Cập nhật chính thức `data.profiles[employee.id][competencyId]` lên `level = 2`, `source = 'PRACTICAL_TASK'`.
       - Gọi `calculateRun()` để tính lại Skill Gap $\rightarrow$ Lúc này Gap của `TT02-6.1` mới chính thức đóng từ 1 về 0!

---

### HẠNG MỤC 4: SỬA LỖI BẢO MẬT CREDENTIAL TRONG `README.md`

#### 4.1. Hiện trạng
- File `D:\digitalent-ai\README.md` dòng 118 đang chứa chuỗi kết nối PostgreSQL thật của Neon Cloud:  
  `Host=ep-summer-tooth-b4r1l2fn...;Database=neondb;Username=neondb_owner;Password=npg_NfPQ...`

#### 4.2. Hành động cần làm
1. Chỉnh sửa ngay dòng 118 trong `README.md`:
   - Thay thế toàn bộ chuỗi thật bằng chuỗi placeholder tiêu chuẩn:  
     `dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=<YOUR_POSTGRES_HOST>;Database=<YOUR_DB>;Username=<YOUR_USER>;Password=<YOUR_PASSWORD>;SSL Mode=Require;Trust Server Certificate=true"`
2. Khuyến nghị xoay vòng (rotate/reset) mật khẩu tài khoản `neondb_owner` trên bảng điều khiển Neon Cloud để đảm bảo an toàn tuyệt đối.

---

### HẠNG MỤC 5: CHUẨN HÓA THUẬT NGỮ & GIAO DIỆN

#### 5.1. Bỏ thuật ngữ "Seats / Ghế"
- **Hiện trạng**: Một số trang ghi `50 seats`, `số ghế sử dụng`.
- **Điều chỉnh**: Đổi sang tiếng Việt chuẩn quản trị nhân sự:  
  * `Gói tối đa 50 người dùng` (hoặc `Quyền sử dụng`).  
  * Trên Dashboard / Subscription: `13 / 50 người dùng đã kích hoạt`.

#### 5.2. Bỏ thuật ngữ "WMS Task"
- **Hiện trạng**: Một số tài liệu gọi nhầm là WMS Task (dễ bị Mentor nhầm sang Warehouse Management System).
- **Điều chỉnh**: Thống nhất dùng thuật ngữ chuẩn:  
  * Tiếng Việt: **Nhiệm vụ thực tế** (hoặc *Nhiệm vụ nơi làm việc*).  
  * Tiếng Anh: **Work-based Practical Task**.

#### 5.3. Xử lý nút Tải PDF Chứng chỉ
- **Hiện trạng**: `MyCertificatesPage.tsx` bấm tải PDF chỉ hiện Toast giả lập.
- **Điều chỉnh**: Bổ sung chú thích rõ ràng cạnh nút: *"Chứng chỉ số xác thực nội bộ. Bản in PDF tích hợp QuestPDF sẵn sàng khi kết nối dịch vụ backend."*

---

## 3. CHECKLIST KIỂM CHỨNG TRƯỚC KHI BẮT ĐẦU TEST E2E

| STT | Tiêu chí kiểm chứng (Acceptance Criteria) | File phụ trách | Trạng thái |
| :---: | :--- | :--- | :---: |
| 1 | `README.md` không còn chứa credential database thật | `README.md` | [x] |
| 2 | Màn hình `OW-12` Cấp bậc không còn hiển thị trên Sidebar Owner | `owner.ts`, `RoleSidebar` | [x] |
| 3 | Setup Wizard chạy qua 3 bước (Tổ chức $\rightarrow$ Phòng ban $\rightarrow$ Vị trí), không còn bước Grades | `SetupWizardPage.tsx` | [x] |
| 4 | `employee@digitalent.demo` hiển thị thuộc Phòng Kinh doanh, chức danh Kinh doanh CRM | `seed-acme.ts` | [x] |
| 5 | Quản lý `manager@digitalent.demo` thấy `employee@` trong màn hình `/enterprise/team/members` | `TeamMembersPage.tsx` | [x] |
| 6 | Khi `employee@` làm bài thi AI đạt 90/100, UI thông báo hoàn thành lý thuyết, KHÔNG tự động cập nhật năng lực làm việc | `AssessmentResultPage.tsx` | [x] |
| 7 | `employee@` có nhiệm vụ thực tế `tsk-001` đang mở để bấm nộp bài | `seed-work.ts` | [x] |
| 8 | Sau khi `employee@` nộp bài, `manager@` vào `/enterprise/reviews` thấy bài nộp và chấm điểm thành công | `ReviewQueuePage.tsx` | [x] |
| 9 | Sau khi Quản lý duyệt bài, Gap của `TT02-6.1` giảm từ 1 về 0; Gap của `TT02-4.2` vẫn giữ nguyên 1 | `TeamSkillGapPage.tsx` | [x] |
