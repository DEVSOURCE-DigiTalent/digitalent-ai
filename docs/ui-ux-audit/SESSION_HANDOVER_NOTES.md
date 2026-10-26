# TÀI LIỆU BÀN GIAO TIẾN ĐỘ & NGỮ CẢNH HỆ THỐNG DIGITALENT AI
*(SESSION HANDOVER & ARCHITECTURE BRIEFING)*

> **Dành cho**: AI Assistant / Developer tiếp nhận ở Session tiếp theo  
> **Thời điểm cập nhật**: 26/10/2026  
> **Dự án**: **DigiTalent AI** - Nền tảng Nâng chuẩn Năng lực số Doanh nghiệp Quốc gia theo **Thông tư 02/2025/TT-BGDĐT** của Bộ Giáo dục & Đào tạo.  
> **Phạm vi công việc**: Rà soát, chuẩn hóa giao diện UI/UX toàn hệ thống, dọn dẹp tàn dư Cấp bậc (Job Grade G1–G3), quy tụ 100% về Ma trận 6 Miền năng lực số.

---

## 1. BỐI CẢNH & HẠ TẦNG KỸ THUẬT (SYSTEM CONTEXT)

### 1.1. Hạ tầng đang chạy (Runtime Services)
Hệ thống kết nối trực tiếp với **Cơ sở dữ liệu PostgreSQL trên AWS EC2 Cloud**:
1. **Database Cloud**: `18.142.12.139:5432`  
   - Được kết nối an toàn qua **SSH Tunnel** cục bộ:  
     `ssh -i "d:\digitalent-ai\infra\terraform\digitalent_key.pem" -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -o ServerAliveCountMax=10 -N -L 5432:localhost:5432 ubuntu@18.142.12.139`
2. **Backend API (.NET 9 / C# ASP.NET Core)**:
   - Thư mục: `d:\digitalent-ai\backend\src\DigiTalent.Api`
   - Chạy trên cổng: `http://localhost:5000` (API Prefix: `/api/v1`)
3. **Frontend SPA (React 19, TypeScript, Vite, Tailwind v4)**:
   - Thư mục: `d:\digitalent-ai\frontend`
   - Chạy trên cổng: `http://localhost:5173`

### 1.2. Danh sách Tài khoản Demo Chuẩn hóa (Mật khẩu chung: `Admin@1234`)

| STT | Email | Họ và tên | Chức danh / Vai trò | Đơn vị / Phạm vi thẩm quyền |
| :---: | :--- | :--- | :--- | :--- |
| **1** | `owner@digitalent.ai` | **Nguyễn Thế Hùng** | Tổng Giám Đốc / CEO (`OWNER`) | Toàn doanh nghiệp (Ban Giám Đốc) |
| **2** | `manager@digitalent.ai` | **Lê Thị Thu Trang** | Trưởng phòng KD & KH (`MANAGER`) | Phòng Kinh doanh & Khách hàng |
| **3** | `hr@digitalent.ai` | **Phạm Quỳnh Nga** | Trưởng phòng Nhân sự (`OWNER`) | Phòng Nhân sự & Đào tạo |
| **4** | `employee@digitalent.ai` | **Hoàng Anh Thư** | Chuyên viên Kế toán (`EMPLOYEE`) | Phòng Tài chính - Kế toán |
| **5** | `trainer@digitalent.ai` | **Vũ Đình Nam** | Chuyên viên Đào tạo (`EMPLOYEE`) | Phòng Nhân sự & Đào tạo |
| **6** | `admin@digitalent.ai` / `platform@digitalent.ai` | **Trần Minh Hoàng** | Quản trị nền tảng (`PLATFORM_ADMIN`) | Nền tảng DigiTalent (Master Data) |

---

## 2. QUYẾT ĐỊNH CHIẾN LƯỢC ĐÃ CHỐT VỚI USER

### Khai tử hoàn toàn mô hình Cấp bậc (Job Grade G1, G2, G3):
- **Lý do**: Khái niệm G1-G3 là tàn dư phân cấp hành chính cũ, gây phình to và chia vụn dữ liệu các bảng Vị trí việc làm, Bảng Thành viên, Bảng Khoảng cách năng lực và Bảng Tham chiếu, làm người dùng doanh nghiệp bối rối.
- **Quyết định chốt**:
  1. Loại bỏ hoàn toàn màn hình `OW-12` (`/enterprise/positions/grades`), tự động **Redirect về `/enterprise/positions`**.
  2. Xóa sạch mọi cột Cấp bậc, chip lọc Cấp bậc, bộ lọc Dropdown Cấp bậc trên toàn bộ Frontend.
  3. **Quy tụ 100% trục dữ liệu và đào tạo về KHUNG 6 MIỀN NĂNG LỰC SỐ THÔNG TƯ 02/2025/TT-BGDĐT**:
     - *Miền 1*: Khai thác Dữ liệu & Thông tin
     - *Miền 2*: Giao tiếp & Hợp tác Số
     - *Miền 3*: Sáng tạo Nội dung Số
     - *Miền 4*: An toàn & An ninh Số
     - *Miền 5*: Giải quyết Vấn đề Số
     - *Miền 6*: Ứng dụng Trí tuệ Nhân tạo (AI)
     - Mỗi miền gồm 3 Cấp độ thành thạo thực chất (**Cơ bản - Trung cấp - Nâng cao**) tương ứng 18 khóa học chuẩn.
  4. **Loại trừ các màn hình cá nhân `/personal/*`** khỏi phạm vi rà soát giao diện (User không dùng phân hệ cá nhân này).

---

## 3. NHỮNG VIỆC ĐÃ HOÀN THÀNH 100% (ACCOMPLISHED WORK)

### 3.1. Rà soát & Xuất trọn bộ 6 tài liệu UI/UX Audit (111 màn hình)
Đã khảo sát chi tiết từng màn hình ở mức vi mô (chữ hiển thị, nút bấm, bố cục Bento, màu sắc tương phản WCAG AA, tính đầy đủ của nghiệp vụ):
- [`docs/ui-ux-audit/00_TONG_QUAN_MA_TRAN_DANH_GIA.md`](file:///d:/digitalent-ai/docs/ui-ux-audit/00_TONG_QUAN_MA_TRAN_DANH_GIA.md): Ma trận tổng quan 111 màn hình, 6 tiêu chuẩn thiết kế vi mô và lộ trình Sprint (P0/P1/P2).
- [`docs/ui-ux-audit/01_AUDIT_OWNER_HR_PORTAL.md`](file:///d:/digitalent-ai/docs/ui-ux-audit/01_AUDIT_OWNER_HR_PORTAL.md): 47 màn hình Owner & HR (`OW-01` -> `OW-47`).
- [`docs/ui-ux-audit/02_AUDIT_MANAGER_PORTAL.md`](file:///d:/digitalent-ai/docs/ui-ux-audit/02_AUDIT_MANAGER_PORTAL.md): 18 màn hình Manager (`MG-01` -> `MG-15`).
- [`docs/ui-ux-audit/03_AUDIT_PULSE_EMPLOYEE_PORTAL.md`](file:///d:/digitalent-ai/docs/ui-ux-audit/03_AUDIT_PULSE_EMPLOYEE_PORTAL.md): 14 màn hình Học viên Pulse (`EM-01` -> `EM-12`).
- [`docs/ui-ux-audit/04_AUDIT_PLATFORM_ADMIN_CONSOLE.md`](file:///d:/digitalent-ai/docs/ui-ux-audit/04_AUDIT_PLATFORM_ADMIN_CONSOLE.md): 15 màn hình Platform Admin (`PA-01` -> `PA-13`).
- [`docs/ui-ux-audit/05_AUDIT_PUBLIC_AUTH_ONBOARDING.md`](file:///d:/digitalent-ai/docs/ui-ux-audit/05_AUDIT_PUBLIC_AUTH_ONBOARDING.md): 17 màn hình Public, Auth & Onboarding.

### 3.2. Sửa lỗi Backend API Root Cause
- File: [`backend/.../ReportUseCases.cs`](file:///d:/digitalent-ai/backend/src/DigiTalent.Application/UseCases/Reports/ReportUseCases.cs)
- Bổ sung bộ lọc: `.Where(cc => cc.OrganizationId == orgId && cc.Status == "ACTIVE")`. Khắc phục triệt để lỗi Backend trả về 18 miền năng lực (bị nhân bản 3 lần) xuống đúng **6 miền chuẩn Thông tư 02**.

### 3.3. Hoàn thành Gói P0 (Dọn dẹp triệt để Job Grade G1–G3)
1. **Redirect màn hình `OW-12`**: Cập nhật [`owner.ts`](file:///d:/digitalent-ai/frontend/src/app/routes/enterprise-pages/owner.ts) để mọi truy cập vào `/enterprise/positions/grades` tự động chuyển hướng về `/enterprise/positions`.
2. **Danh mục Vị trí việc làm (`OW-11`)**: File [`PositionListPage.tsx`](file:///d:/digitalent-ai/frontend/src/features/organization/pages/PositionListPage.tsx) và [`JobPositionFormDialog.tsx`](file:///d:/digitalent-ai/frontend/src/features/organization/components/JobPositionFormDialog.tsx):
   - Đã xóa hoàn toàn cột "Cấp bậc" và dropdown lọc cấp bậc; bảng chỉ còn 6 cột chuẩn TT02.
   - Modal tạo vị trí không còn trường Cấp bậc G1–G3.
3. **Báo cáo Khoảng cách Năng lực (`OW-17` & `MG-05`)**: File [`SkillGapAnalyticsView.tsx`](file:///d:/digitalent-ai/frontend/src/features/intelligence/components/SkillGapAnalyticsView.tsx):
   - Xóa bỏ nút gom nhóm *"Theo Cấp bậc (G1–G3)"* và dropdown lọc cấp bậc.
   - Chỉ giữ lại 2 nhóm gom thực tế: **Theo phòng ban** và **Theo vị trí công việc**.
4. **Ma trận Năng lực Nhân sự (`OW-19`)**: File [`WorkforceCompetencyMatrix.tsx`](file:///d:/digitalent-ai/frontend/src/features/competency/components/WorkforceCompetencyMatrix.tsx):
   - Xóa bỏ dropdown lọc cấp bậc và các badge `[G1]` trên thẻ nhân sự.
5. **Giám sát Đào tạo (`OW-30` & `MG-06`)**: File [`TrainingMonitorPage.tsx`](file:///d:/digitalent-ai/frontend/src/features/assignments/pages/TrainingMonitorPage.tsx) và [`AssignCourseModal.tsx`](file:///d:/digitalent-ai/frontend/src/features/assignments/components/AssignCourseModal.tsx):
   - Xóa bỏ dropdown lọc cấp bậc.
   - Modal giao khóa học chỉ còn 4 mục thiết thực: *Từng nhân viên, Cả phòng ban, Mọi người ở một vị trí, Từ khoảng trống năng lực số*.
6. **Bộ yêu cầu Năng lực (`OW-16`)**: File [`RequirementSetListPage.tsx`](file:///d:/digitalent-ai/frontend/src/features/competency/pages/RequirementSetListPage.tsx): Gỡ bỏ nhãn Grade bên cạnh tên vị trí.
7. **Trình hướng dẫn Thiết lập Doanh nghiệp ban đầu (Setup Wizard - `/setup`)**: File [`SetupWizardPage.tsx`](file:///d:/digitalent-ai/frontend/src/features/onboarding/pages/SetupWizardPage.tsx) và [`InviteStep.tsx`](file:///d:/digitalent-ai/frontend/src/features/onboarding/components/InviteStep.tsx):
   - Khai tử hoàn toàn Bước Cấp bậc (G1–G3), rút ngắn quy trình còn **5 bước liền mạch**: *Thông tin tổ chức -> Phòng ban -> Vị trí -> Mời nhân sự -> Hoàn tất*.
   - Bảng danh sách mời nhân sự không còn nhãn `[G1]`.

### 3.4. Sửa các lỗi tiềm ẩn (Bug Fixes & Hardening)
1. **Lỗi Null Pointer tại Danh sách Thành viên (`OW-02`)**: Sửa [`OwnerMembersPage.tsx`](file:///d:/digitalent-ai/frontend/src/features/organization/pages/OwnerMembersPage.tsx) và [`InviteMembersModal.tsx`](file:///d:/digitalent-ai/frontend/src/features/members/components/InviteMembersModal.tsx) bằng cách thêm optional chaining `user?.subscription` và guard `if (!open) return null;` giúp trang nạp mượt mà trong 0.8s.
2. **Lỗi kiểu & Prop trong Bài học Pulse**: Sửa [`LessonSlide.tsx`](file:///d:/digitalent-ai/frontend/src/features/pulse-employee/components/LessonSlide.tsx) bổ sung đúng tham số `courseCode` và `moduleIndex` với giá trị mặc định.
3. **Dọn dẹp unused imports**: Xóa `useMemo` thừa trong [`TrainingMonitorPage.tsx`](file:///d:/digitalent-ai/frontend/src/features/assignments/pages/TrainingMonitorPage.tsx).

### 3.5. Kiểm chứng nghiệm thu (Verification)
- **Vite Production Build**: Chạy lệnh `npx vite build` thành công 100% trong **11.78 giây** (`✓ built in 11.78s`, 1413 modules transformed).
- **Playwright MCP Visual Audit**: Duyệt tự động 7 màn hình sau khi chỉnh, đạt **0 Errors, 0 Warnings** trên Console; chụp lưu 12 ảnh minh chứng trực quan tại thư mục Artifacts:
  - `final_p0_positions.png`
  - `final_p0_grades_redirect.png`
  - `final_p0_skillgap.png`
  - `final_p0_workforce_matrix.png`
  - `final_p0_training_monitor.png`
  - `final_p0_members.png`
  - `final_p0_dashboard.png`

---

## 4. NHỮNG VIỆC ĐANG VÀ SẼ THỰC HIỆN TIẾP THEO (NEXT ROADMAP)

Theo lộ trình đã thống nhất trong [`00_TONG_QUAN_MA_TRAN_DANH_GIA.md`](file:///d:/digitalent-ai/docs/ui-ux-audit/00_TONG_QUAN_MA_TRAN_DANH_GIA.md), các phiên tiếp theo sẽ triển khai **Gói P1** và **Gói P2**:

### 🎯 GÓI P1: TINH GỌN TRẢI NGHIỆM & THAO TÁC (QUAN TRỌNG)
- [ ] **P1-1 (Owner Microcopy)**: Tinh gọn câu chữ, cắt bỏ triệt để các đoạn khẩu hiệu lý thuyết dài dòng trên các trang Owner (`OW-01`, `OW-02`, `OW-10`, `OW-13`). Áp dụng quy tắc "3 giây hiểu ngay".
- [ ] **P1-2 (Manager Bento Grid)**: Nâng cấp Bento-Grid 4 thẻ chỉ số cho Bàn làm việc Quản lý (`MG-01`): Hiển thị rõ số bài thi kết khóa cần chấm, số cảnh báo gian lận và tỷ lệ đạt chuẩn của phòng ban.
- [ ] **P1-3 (Learner Sticky Bar)**: Cố định Thanh điều hướng hành động (Sticky Bottom Action Bar) trong Phòng học tập trung (`EM-03`) để học viên luôn thấy nút "Đánh dấu hoàn thành" và "Bài tiếp theo" mà không cần cuộn trang.
- [ ] **P1-4 (Course Builder 3 cột Studio)**: Tối ưu bộ công cụ soạn thảo khóa học (`PA-04`): Cột trái (Mục lục kéo thả) - Cột giữa (Vùng soạn thảo) - Cột phải (Thuộc tính chuẩn TT02) kèm chỉ báo Auto-save.
- [ ] **P1-5 (Trial Conversion)**: Rút gọn form Đăng ký dùng thử (`AU-02`) xuống 4 trường thông tin cốt lõi để tối đa hóa chuyển đổi.

### 🎨 GÓI P2: TỐI ƯU HÓA NÂNG CAO & HOÀN THIỆN THẨM MỸ
- [ ] **P2-1**: Modal xem trước tệp minh chứng (PDF & Ảnh chụp) trực tiếp trong màn hình chấm điểm của Quản lý (`MG-13` & `MG-08`), không bắt tải tệp về máy tính.
- [ ] **P2-2**: Tooltip trực quan giải thích các chỉ số chuyên môn: Radar Gap, Điểm chống gian lận Proctoring, Cấp độ Bloom.
- [ ] **P2-3**: Phím tắt duyệt bài thi cho Manager (`A` - Approve, `R` - Reject).

---

## 5. CÁCH KIỂM TRA & DUY TRÌ HỆ THỐNG CHO SESSION TIẾP THEO

Nếu session mới bị mất kết nối hoặc khởi động lại:
1. **Kiểm tra SSH Tunnel kết nối Database**:
   ```powershell
   ssh -i "d:\digitalent-ai\infra\terraform\digitalent_key.pem" -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -N -L 5432:localhost:5432 ubuntu@18.142.12.139
   ```
2. **Chạy Backend API**:
   ```powershell
   dotnet run --project "d:\digitalent-ai\backend\src\DigiTalent.Api" --no-build
   ```
3. **Chạy Frontend**:
   ```powershell
   npm --prefix "d:\digitalent-ai\frontend" run dev
   ```
4. **Quy tắc bắt buộc khi điều chỉnh UI**:
   - Luôn dùng Playwright MCP mở xem màn hình và chụp ảnh **TRƯỚC KHI SỬA**.
   - Chỉnh sửa mã nguồn.
   - Mở xem và chụp ảnh nghiệm thu **SAU KHI SỬA** để đảm bảo không vỡ layout và Console đạt **0 Errors**.
