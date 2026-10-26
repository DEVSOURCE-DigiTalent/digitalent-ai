# BÁO CÁO RÀ SOÁT & PHÂN TÍCH UI/UX CHI TIẾT: CỔNG NHÂN VIÊN HỌC TẬP (PULSE EMPLOYEE PORTAL)

> **Môi trường khảo sát**: DigiTalent AI Pulse Employee Portal (`/enterprise/me/*`)  
> **Tài khoản kiểm thử**: `employee@digitalent.ai` (Kế toán Hoàng Anh Thư), `trainer@digitalent.ai` (Đào tạo Vũ Đình Nam)  
> **Kiến trúc bố cục đặc trưng**: Sử dụng `PulseEmployeeLayout` với thanh điều hướng đầu trang mỏng gọn (Hôm nay / Lộ trình / Thực hành / Kết quả), **không dùng sidebar bên trái** nhằm tối đa hóa diện tích tập trung học tập (Focus Mode).  
> **Nguyên tắc thiết kế**: Giảm tải văn bản giải thích lý thuyết, tôn trọng thời gian của nhân viên, hiển thị ngay hành động cần làm tiếp theo (1-Click Learning).

---

## MỤC LỤC CÁC MÀN HÌNH KHẢO SÁT (TỪ EM-01 ĐẾN EM-12)

- [1. Trang Hôm Nay & Lộ Trình Năng Lực (`EM-01`, `EM-02`)](#1-trang-hôm-nay--lộ-trình-năng-lực)
- [2. Không Gian Học Tập & Phòng Học Mô Đun (`EM-05`, `EM-06`)](#2-không-gian-học-tập--phòng-học-mô-đun)
- [3. Luồng Kiểm Tra & Thi Cử Giám Sát (`EM-12`, `EM-07`)](#3-luồng-kiểm-tra--thi-cử-giám-sát)
- [4. Thực Hành, Kết Quả & Hồ Sơ Năng Lực (`EM-03`, `EM-08`, `EM-09`, `EM-10`, `EM-11`)](#4-thực-hành-kết-quả--hồ-sơ-năng-lực)

---

## 1. TRANG HÔM NAY & LỘ TRÌNH NĂNG LỰC

### [EM-01] Bàn làm việc Hôm Nay (Pulse Today) (`/enterprise/me`)
* **Vai trò**: `EMPLOYEE` (Toàn bộ nhân viên học tập).
* **Mục đích nghiệp vụ**: Màn hình "Home" của nhân viên mỗi khi mở DigiTalent. Mục tiêu tối thượng là giúp nhân viên biết ngay:
  1. Mình đang học khóa nào?
  2. Bài học tiếp theo là gì?
  3. Bấm vào đâu để học tiếp ngay lập tức mà không phải tìm kiếm qua nhiều menu.
* **Đánh giá mức độ hoàn thiện tính năng**: **RẤT TỐT** sau khi đã tinh gọn lời chào và đưa thẻ hành động học tập lên đầu.

#### Phân tích chi tiết 6 yếu tố thiết kế:
1. **Chữ hiển thị (Copywriting)**:
   - *Trước đây*: Đoạn văn dài lặp đi lặp lại về nguyên lý Thông tư 02 và cách làm bài pre-assessment.
   - *Hiện tại*: Lời chào cá nhân hóa ngắn gọn: `"Chào Thư, lộ trình Kế toán đã đạt 0/12 khóa. Bắt đầu bài đánh giá hoặc bài học đầu tiên để kích hoạt lộ trình năng lực số của bạn."`
2. **Nút bấm & Hành động (Buttons & CTAs)**:
   - Primary CTA: Nút `"Học tiếp"` hoặc `"Làm bài đánh giá"` đặt nổi bật trong khối Việc tiếp theo (`.pu-next-item`).
   - Link xem lộ trình: `"Xem chi tiết lộ trình →"` dẫn sang `EM-02`.
3. **Bố cục & Phân chia khung (Layout & Grid)**:
   - Cột trái: Thẻ tóm tắt lộ trình 12 khóa học + Danh sách các miền cần học dạng Accordion.
   - Cột phải (Sidebar phụ): Thẻ thông tin Vị trí công việc & Người chấm bài (`Manager Lê Thị Thu Trang`) + Khối `"Việc tiếp theo cần làm"`.
4. **Phối màu & Tương phản (Colors & Contrast)**:
   - Nền trang màu kem dịu nhẹ `#F7F9FD`, thẻ card màu trắng tinh khôi `#FFFFFF` bo góc mềm mại.
   - Trạng thái khóa học: Đang mở (Xanh dương), Đã hoàn thành (Xanh ngọc lục bảo), Chờ người chấm (Cam).
5. **Khoảng cách & Responsive (Spacing & Adaptive)**:
   - Laptop 1366: Bố cục 2 cột cân đối.
   - Mobile/Tablet 768: Cột thông tin phụ tự động nhảy xuống dưới khối hành động chính, đảm bảo nút học tiếp luôn nằm ở màn hình đầu tiên.
* **Mức độ ưu tiên**: **ĐÃ TỐI ƯU (P0 Done)**.

---

### [EM-02] Lộ trình Năng lực Cá nhân (Roadmap Path) (`/enterprise/me/path`)
* **Vai trò**: `EMPLOYEE`.
* **Mục đích nghiệp vụ**: Cung cấp bức tranh toàn cảnh (Blueprint) về hành trình phát triển nghề nghiệp của nhân viên: từ mức hiện tại đến mức mục tiêu của vị trí theo 3 chặng: Cơ bản (F) -> Trung cấp (I) -> Nâng cao (A).
* **Đánh giá mức độ hoàn thiện tính năng**: Đạt chuẩn.

#### Phân tích chi tiết 6 yếu tố thiết kế:
1. **Chữ hiển thị (Copywriting)**:
   - Bảng thông số rõ ràng: `12 Khóa trong lộ trình` · `24 Năng lực yêu cầu` · `6 Lĩnh vực`.
   - Bỏ bớt đoạn văn dài giải thích trần phòng ban.
2. **Nút bấm & Hành động (Buttons & CTAs)**:
   - Trên từng thẻ khóa học: Nút `"Bắt đầu học"`, `"Làm bài test"`, hoặc icon ổ khóa màu xám nếu chưa mở khóa.
3. **Bố cục & Blueprint Visual**:
   - Bản vẽ lộ trình dạng ma trận thu nhỏ (Mini Roadmap Plan) hiển thị lưới các ô khóa học F-I-A rất đẹp mắt và mang tính công nghệ cao.
4. **Khoảng cách & Responsive**:
   - Khi xem trên Tablet, ma trận lộ trình tự động co giãn lưới, không bị vỡ chữ trong các ô khóa học.
* **Mức độ ưu tiên**: **P1**.

---

## 2. KHÔNG GIAN HỌC TẬP & PHÒNG HỌC MÔ ĐUN

### [EM-05] Chi tiết Khóa học (`/enterprise/me/courses/:courseId`)
* **Vai trò**: `EMPLOYEE`.
* **Mục đích nghiệp vụ**: Trang tổng quan của 1 khóa học cụ thể (Ví dụ: `M1-F Khai thác dữ liệu cơ bản`): Giới thiệu mục tiêu đầu ra, danh sách các bài giảng (mô đun 1, 2, 3), tài liệu đính kèm và bài tập thực hành.
* **Đề xuất cải tiến**:
  - Tinh gọn phần giới thiệu khóa học thành 3 gạch đầu dòng: `🎯 Bạn sẽ làm được gì sau khóa học`.
  - Danh sách mô đun có thanh tiến độ % hoàn thành và dấu tích xanh cho các bài đã học xong.
* **Mức độ ưu tiên**: **P1**.

---

### [EM-06] Phòng học Mô đun (Classroom & Player) (`/enterprise/me/courses/:courseId/modules/:moduleId`)
* **Vai trò**: `EMPLOYEE`.
* **Mục đích nghiệp vụ**: Không gian học tập trung (Immersive Classroom). Nhân viên đọc bài giảng, xem video, làm các bài tập trắc nghiệm mini giữa bài và bấm nút `"Hoàn thành mô đun"` để chuyển sang bài tiếp theo.
* **Đánh giá mức độ hoàn thiện tính năng**: Giao diện tập trung tốt.

#### Phân tích chi tiết 6 yếu tố thiết kế:
1. **Chữ hiển thị (Typography)**:
   - Cỡ chữ bài giảng đạt chuẩn dễ đọc: `text-base` (16px) hoặc `text-lg` (18px), khoảng cách dòng `leading-relaxed` (1.65), font chữ Inter/Geist không chân rõ nét.
2. **Nút bấm & Điều hướng bài học**:
   - Thanh điều hướng chân trang (Sticky Bottom Bar): Nút `"← Bài trước"` (Secondary) và nút `"Hoàn thành & Bài tiếp theo →"` (Primary Blue-600) to rõ, cố định ở dưới cùng màn hình giúp người học không phải cuộn ngược lên đầu để chuyển bài.
3. **Màu sắc & Chống mỏi mắt**:
   - Nền vùng đọc sách màu trắng hoặc xám ngà dịu mắt (`#FAF9F6`), viền ngăn cách mềm `#E2E8F0`.
* **Mức độ ưu tiên**: **P1 (Hoàn thiện thanh Sticky Bottom Bar chuyển bài)**.

---

## 3. LUỒNG KIỂM TRA & THI CỬ GIÁM SÁT (PROCTORING)

### [EM-12] Bài Đánh giá Đầu vào (Pre-Assessment) (`/enterprise/me/courses/:courseId/pre-assessment`)
* **Vai trò**: `EMPLOYEE`.
* **Mục đích nghiệp vụ**: Kiểm tra chẩn đoán trước khi học. Nếu nhân viên đạt điểm chuẩn (≥ 7/10 trắc nghiệm và đạt bài tự luận), họ được **miễn học toàn bộ khóa học đó và được công nhận năng lực ngay lập tức**.
* **Cơ chế thi cử**: Bắt buộc chia sẻ màn hình, bật camera và micro để hệ thống ghi hình giám sát.
* **Đề xuất cải tiến**:
  - Màn hình khởi động thi (Pre-flight Check): Hiển thị checklist 3 bước rõ ràng: `✅ Đã nhận diện Camera` -> `✅ Đã nhận diện Micro` -> `✅ Đã chia sẻ toàn màn hình`.
  - Nút bấm `"Bắt đầu làm bài thi"` chỉ sáng lên khi cả 3 điều kiện giám sát đã sẵn sàng.
* **Mức độ ưu tiên**: **P1**.

---

### [EM-07] Bài Thi Cuối Khóa (Final Exam) (`/enterprise/me/courses/:courseId/final`)
* **Vai trò**: `EMPLOYEE`.
* **Mục đích nghiệp vụ**: Bài thi tốt nghiệp khóa học sau khi nhân viên đã học đủ 100% các mô đun. Gồm 10 câu trắc nghiệm ngẫu nhiên từ ngân hàng câu hỏi + 1 đề bài tự luận giải quyết tình huống thực tế.
* **Đánh giá mức độ hoàn thiện tính năng**: Hoạt động rất bảo mật.

#### Phân tích chi tiết 6 yếu tố thiết kế:
1. **Chữ hiển thị & Đồng hồ đếm ngược**:
   - Đồng hồ thời gian thi (`Timer`) hiển thị dạng số to rõ, đổi sang màu đỏ cam khi thời gian còn dưới 5 phút.
   - Cảnh báo chuyển tab: Thông báo pop-up nổi bật nếu học viên vô tình nhấn Alt+Tab hoặc rời khỏi màn hình thi.
2. **Nút bấm nộp bài**:
   - Nút `"Nộp bài thi cuối khóa"` yêu cầu xác nhận 2 bước (Modal confirm) để tránh việc học viên vô tình bấm nhầm khi chưa làm xong câu tự luận.
3. **Bố cục thi**:
   - Chia 2 tab: Tab 1 (10 câu trắc nghiệm chọn đáp án A-B-C-D); Tab 2 (Trình soạn thảo văn bản tự luận hoặc upload file minh chứng).
* **Mức độ ưu tiên**: **P1**.

---

## 4. THỰC HÀNH, KẾT QUẢ & HỒ SƠ NĂNG LỰC

### [EM-03] Thực hành & Nộp bài (`/enterprise/me/practice`)
* **Vai trò**: `EMPLOYEE`.
* **Mục đích nghiệp vụ**: Nơi nhân viên theo dõi các nhiệm vụ thực tế được Trưởng phòng giao, tải lên sản phẩm hoàn thành (báo cáo, file Excel, link dự án) và xem lịch sử các lần nộp bài trước đó.
* **Đề xuất cải tiến**:
  - Hỗ trợ vùng kéo thả tệp (Drag & Drop zone) hiện đại, hiển thị thanh tiến trình tải lên (% upload progress).
  - Trạng thái bài nộp: `Chờ chấm điểm` (Vàng), `Cần chỉnh sửa lại` (Đỏ cam), `Đã phê duyệt` (Xanh lá).
* **Mức độ ưu tiên**: **P1**.

---

### [EM-08] Kết quả đã Xác nhận (Outcomes) (`/enterprise/me/outcomes`) & [EM-09] Chi tiết Kết quả (`/enterprise/me/outcomes/:outcomeId`)
* **Vai trò**: `EMPLOYEE`.
* **Mục đích nghiệp vụ**: "Phòng truyền thống" cá nhân của học viên. Trưng bày toàn bộ các khóa học đã vượt qua, huy hiệu kỹ năng đạt được và chứng chỉ số đã được cấp có mã QR xác thực.
* **Đề xuất cải tiến**:
  - Thẻ chứng nhận thiết kế sang trọng dạng Giấy khen số (Digital Certificate Badge), có nút bấm nhanh: `"Tải file PDF"`, `"Chia sẻ chứng nhận"`, `"Quét mã QR tra cứu"`.
* **Mức độ ưu tiên**: **P1**.

---

### [EM-10] Nhật ký Hoạt động (`/enterprise/me/activity`) & [EM-11] Hồ sơ Năng lực của Tôi (`/enterprise/me/profile`)
* **Vai trò**: `EMPLOYEE`.
* **Mục đích nghiệp vụ**: Xem lịch sử thời gian biểu học tập (Timeline) và hồ sơ ma trận năng lực cá nhân so với tiêu chuẩn vị trí.
* **Đánh giá**: Hoạt động tốt.
* **Mức độ ưu tiên**: **P2**.

---

## BẢNG TỔNG HỢP HÀNH ĐỘNG CẢI TIẾN TRỌNG TÂM CỔNG NHÂN VIÊN PULSE

| STT | Mã màn hình | Tên màn hình | Vấn đề cốt lõi cần xử lý | Hành động kỹ thuật cụ thể | Mức ưu tiên |
|:---:|---|---|---|---|:---:|
| 1 | `EM-01` | Hôm nay | Lời chào & giải thích dài dòng | **Đã cắt tỉa text thừa**, hiển thị thẻ hành động học tập lên đầu. | **P0 (Done)** |
| 2 | `EM-06` | Phòng học mô đun | Chuyển bài bất tiện khi cuộn xuống dưới | Bổ sung thanh **Sticky Bottom Bar** cố định với nút Chuyển bài tiếp theo. | **P1** |
| 3 | `EM-12` | Đánh giá trước khi học | Khó kiểm tra thiết bị ghi hình | Thiết kế màn hình **Pre-flight Check 3 bước** (Camera, Mic, Màn hình). | **P1** |
| 4 | `EM-07` | Bài thi cuối khóa | Dễ bấm nhầm nộp bài | Bổ sung **Modal xác nhận nộp bài 2 bước** và đồng hồ cảnh báo < 5 phút. | **P1** |
| 5 | `EM-03` | Thực hành | Form tải tệp đơn điệu | Nâng cấp **Drag & Drop Zone** hiển thị tiến độ tải file trực quan. | **P1** |
| 6 | `EM-08` | Kết quả xác nhận | Thẻ chứng chỉ hiển thị text đơn thuần | Thiết kế **Certificate Card sang trọng** có mã QR và nút Tải PDF. | **P1** |
