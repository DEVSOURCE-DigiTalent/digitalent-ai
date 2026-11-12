# Tài liệu Tổng hợp Quyết định & Kế hoạch Redesign Hệ thống Khảo thí & Mentor

- **Ngày ban hành**: 03/11/2026
- **Trạng thái**: Đã phê duyệt (Approved)
- **Tài liệu tham chiếu**: `docs/specs/2026-10-27-enterprise-trial-assessment.md`, `CLAUDE.md`

---

## PHẦN 1: TỔNG HỢP CÁC QUYẾT ĐỊNH NGHIỆP VỤ & KIẾN TRÚC

### 1. Bài đánh giá đầu vào của Nhân viên (Entrance Assessment)
* **Hình thức thi**:
  * **100% Trắc nghiệm**, loại bỏ hoàn toàn 3 bài thi tự luận và khâu chấm tự luận thủ công.
  * **Vẫn duy trì Giám sát phòng thi (Proctoring)**: Bật camera, micro và chia sẻ toàn bộ màn hình để đảm bảo tính liêm chính và tin cậy của kết quả đánh giá.
* **Cấu trúc đề thi (Phương án A - Nhóm theo 6 Miền năng lực Khung TT02)**:
  * Toàn bộ 18 câu hỏi trắc nghiệm nằm trong **1 phiên làm bài có giám sát duy nhất** (nhân viên chỉ cần cấp quyền camera/mic/màn hình 1 lần).
  * Đề thi được chia thành **6 phần tương ứng với 6 Miền năng lực số**.
  * Trong mỗi miền, các câu hỏi đi theo **bậc thang độ khó tăng dần**:
    * Câu 1: Mức 1 (Cơ bản)
    * Câu 2: Mức 2 (Trung cấp)
    * Câu 3: Mức 3 (Nâng cao)
* **Chấm điểm**: Hệ thống **tự động chấm điểm 100% (Auto-score)** ngay khi nhân viên bấm nộp bài. Mức năng lực từng miền (0, 1, 2, 3) được xác định trực tiếp từ số câu đúng theo cấp (`SuggestedLevel`).

### 2. Trạng thái sau khi nộp bài & Trách nhiệm của Doanh nghiệp
* **Trạng thái nhân viên**:
  * Sau khi nộp bài, nhân viên **chưa vào học tự do ngay**, mà chuyển sang trạng thái: *"Đã hoàn thành bài test. Đang chờ Doanh nghiệp xem tổng quan, thiết lập trần năng lực và công bố lộ trình."*
* **Trách nhiệm của Doanh nghiệp (Chủ DN - OW-T1)**:
  * **Xem kết quả Real-time (Tùy chọn A)**: Chủ DN xem ngay điểm số và mức năng lực của từng nhân viên cũng như biểu đồ phân bổ năng lực 6 miền toàn công ty trên trang Quản lý dùng thử.
  * **Thiết lập Trần năng lực (Capability Ceilings)**: Doanh nghiệp vào Ma trận trần nhà (`CapabilityCeilings`) để cấu hình mức trần cho từng phòng ban/vị trí, hoặc mua bổ sung các gói khóa học Trung cấp / Nâng cao.
  * **Chủ DN chủ động bấm nút "CÔNG BỐ KẾT QUẢ"** (chuyển quyền công bố từ Mentor về cho Chủ DN qua API `POST /api/v1/trial/publish`).

### 3. Phân luồng học tập sau khi Công bố (Skill Gap & Direct-to-Learn)
* Sau khi Doanh nghiệp công bố:
  * Nhân viên mở khóa cổng học tập và xem **Báo cáo Skill Gap cá nhân** (Mức đã xác nhận qua bài test vs. Trần doanh nghiệp đặt cho vị trí).
  * **Miền ĐÃ ĐẠT ($\ge$ Trần DN)**: Tự động đánh dấu hoàn thành và **MIỄN HỌC** ("pass thì thôi").
  * **Miền CHƯA ĐẠT (Skill Gap / Bắt buộc)**: **VÀO HỌC NGAY LẬP TỨC (Direct-to-Learn)**.
  * **Triệt tiêu hoàn toàn bài Pre-Assessment từng khóa**: Không bắt nhân viên làm thêm bài test trước khi học nào nữa (khắc phục lỗi logic trong `PulseLearnerReader.cs`).

### 4. Định vị lại Vai trò của Mentor
* **Loại bỏ hoàn toàn vai trò chấm bài đầu vào**:
  * Bỏ màn hình hàng chờ chấm đầu vào `MT-01` (`/platform/reviews`).
  * Bỏ màn hình chấm chi tiết tự luận/chọn mức đầu vào `MT-02` (`/platform/reviews/:organizationId`).
  * Bỏ các UseCase chấm tự luận và gợi ý AI tự luận đầu vào.
* **Mentor chỉ chuyên trách duy nhất: Chấm bài cuối khóa (Course Final Review)**:
  * Mentor chấm bài thi cuối khóa (Final Exam & Practical Evidence) của học viên tại `MT-03` (`/platform/course-reviews`).
  * Khi Mentor đăng nhập, hệ thống điều hướng thẳng vào `/platform/course-reviews`.
  * Menu của Mentor chỉ có: *"Bài cuối khóa"* + các trang tài khoản cá nhân.

---

## PHẦN 2: KẾ HOẠCH REDESIGN KHU VỰC MENTOR (ƯU TIÊN 1)

Kế hoạch này tập trung tái cấu trúc toàn bộ trải nghiệm của Mentor, dọn dẹp các trang chấm đầu vào không còn sử dụng, và tối ưu hóa trang chấm bài cuối khóa.

### Giai đoạn M1: Backend - Quyền hạn, Endpoint & Phân luồng
1. **Chuyển giao quyền Công bố Báo cáo (`Publish`)**:
   - Thêm endpoint `POST /api/v1/trial/publish` trong `TrialProgramController.cs` dành cho Chủ doanh nghiệp (quyền `trial.manage`).
   - Đảm bảo khi Chủ DN gọi API này, `trial_workspaces.report_published_at` được gán mốc thời gian hiện tại và gửi thông báo tới toàn bộ nhân viên.
2. **Vô hiệu hóa / Điều chỉnh các API chấm đầu vào của Mentor**:
   - Trong `MentorTrialsController.cs`:
     - Deprecate endpoint `PUT /mentor/trials/{orgId}/assessments/{id}` (chấm đầu vào).
     - Deprecate endpoint `POST /mentor/trials/{orgId}/assessments/{id}/ai-review` (AI review tự luận).
     - Deprecate `GET /mentor/trials` và `GET /mentor/trials/{orgId}`.
3. **Đảm bảo API Chấm bài cuối khóa (`PulseFinalReviewsController`)**:
   - Kiểm tra endpoint `GET /api/v1/pulse/final-reviews` và `POST /api/v1/pulse/final-reviews/{submissionId}/decision`.
   - Đảm bảo tài khoản Mentor (quyền `trial.review`) truy vấn chính xác danh sách bài cuối khóa của các doanh nghiệp mình được phụ trách mà không bị vướng bài đánh giá trước khi học (`PreAssessment`).

### Giai đoạn M2: Frontend - Điều hướng & Menu Sidebar của Mentor
1. **Cập nhật Menu Navigation ([`platform-nav.ts`](file:///d:/digitalent-ai/frontend/src/features/platform/platform-nav.ts))**:
   - Sửa mảng `MENTOR_NAV`:
     ```typescript
     export const MENTOR_NAV: readonly PlatformNavItem[] = [
       { 
         to: '/platform/course-reviews', 
         label: 'Bài cuối khóa', 
         glyph: '', 
         icon: CheckCircle2, 
         description: 'Chấm bài thi & minh chứng cuối khóa' 
       },
     ] as const;
     ```
   - Xóa bỏ hoàn toàn mục *"Đánh giá doanh nghiệp"* (`/platform/reviews`).
2. **Cập nhật Điều hướng mặc định ([`navigation.ts`](file:///d:/digitalent-ai/frontend/src/lib/navigation.ts))**:
   - Sửa hàm `getHomePath`:
     ```typescript
     if (resolved === WORKSPACES.PLATFORM || normalized.includes(ROLES.PLATFORM_ADMIN)) {
       return normalized.includes(ROLES.MENTOR) && !normalized.includes(ROLES.PLATFORM_ADMIN) 
         ? '/platform/course-reviews' 
         : '/platform/dashboard';
     }
     ```
3. **Cập nhật Khung giao diện Platform ([`PulseAdminLayout.tsx`](file:///d:/digitalent-ai/frontend/src/features/platform/PulseAdminLayout.tsx))**:
   - Dọn dẹp `MENTOR_SEARCH_ITEMS`: Bỏ các liên kết tìm kiếm nhanh dẫn tới `/platform/reviews` và `/platform/reviews/org-acme`.
   - Cập nhật biến `home` của Mentor thành `/platform/course-reviews`.

### Giai đoạn M3: Frontend - Routing & Dọn dẹp Screen Registry
1. **Cấu hình Routes ([`platform.routes.tsx`](file:///d:/digitalent-ai/frontend/src/app/routes/platform.routes.tsx))**:
   - Chuyển hướng (Redirect) các link cũ:
     - `/platform/reviews` $\to$ chuyển hướng về `/platform/course-reviews`.
     - `/platform/reviews/:organizationId` $\to$ chuyển hướng về `/platform/course-reviews`.
   - Bỏ render `MentorTrialsPage` (`MT-01`) và `MentorTrialPage` (`MT-02`) khỏi active registry của Mentor.
2. **Cập nhật Danh mục Màn hình ([`platform.ts`](file:///d:/digitalent-ai/frontend/src/lib/screens/platform.ts))**:
   - Cập nhật thông tin các screen `MT-01`, `MT-02`, `MT-03`:
     - Giữ `MT-03` (`/platform/course-reviews`) là màn hình làm việc chính thức của role `MENTOR`.

### Giai đoạn M4: Frontend - Tối ưu hóa Trang Chấm bài cuối khóa (`MT-03`)
1. **Tối ưu hiển thị cho Mentor trên [`MentorCourseReviewsPage.tsx`](file:///d:/digitalent-ai/frontend/src/features/trial-program/pages/MentorCourseReviewsPage.tsx)**:
   - Trang này bọc `PulseFinalReviewsPage audience="mentor"`.
   - Kiểm tra bộ lọc: Bộ lọc theo Khóa học, Doanh nghiệp dùng thử, Trạng thái (Chờ chấm, Đã duyệt, Yêu cầu nộp lại).
   - Kiểm tra giao diện chấm:
     - Trình phát video giám sát màn hình, webcam và âm thanh của thí sinh trong lúc thi cuối khóa.
     - Câu trả lời trắc nghiệm và bài tập thực hành/minh chứng thực tế (`evidenceText`).
     - Form ra quyết định: Đạt (`PASSED`) / Chưa đạt (`NOT_YET`), ghi lý do nhận xét chi tiết gửi cho học viên.
     - Hỗ trợ học tập: Cho phép Mentor đề xuất hướng hỗ trợ (Coaching, Fresh Cycle, Pause).

### Giai đoạn M5: Kiểm thử & Xác minh (Verification)
1. **Kiểm thử Điều hướng Mentor**:
   - Chạy test suites `screens.test.ts` và `trial-program.test.ts` để đảm bảo:
     - Role `MENTOR` tự động vào đúng `/platform/course-reviews` khi đăng nhập.
     - Sidebar của Mentor chỉ hiển thị duy nhất mục "Bài cuối khóa".
     - Link cũ `/platform/reviews` không gây lỗi 404 mà redirect mượt mà.
2. **Kiểm thử E2E phân quyền Mentor**:
   - Đăng nhập với tài khoản `mentor@digitalent.ai`.
   - Xác nhận Mentor chỉ thấy danh sách bài cuối khóa cần chấm của các doanh nghiệp dùng thử được phân công.
   - Thử nghiệm chấm 1 bài cuối khóa và xác nhận học viên nhận được quyết định.

