# BÁO CÁO RÀ SOÁT & PHÂN TÍCH UI/UX CHI TIẾT: CỔNG QUẢN LÝ ĐỘI NGŨ (MANAGER PORTAL)

> **Môi trường khảo sát**: DigiTalent AI Manager Portal (`/enterprise/team/*` & `/enterprise/tasks/*`)  
> **Tài khoản kiểm thử**: `manager@digitalent.ai` (Trưởng phòng KD & KH Lê Thị Thu Trang)  
> **Phạm vi dữ liệu**: Phân quyền theo phòng ban (Department Scope) — Quản lý chỉ nhìn thấy và chỉ được chấm điểm cho nhân viên trực thuộc phòng ban mình phụ trách.  
> **Nguyên tắc thiết kế**: Tinh gọn, thao tác nhanh, trực quan hóa rủi ro thi cử (Proctoring Risk), giảm thiểu văn bản thừa. Bỏ toàn bộ cột và bộ lọc Cấp bậc G1-G3.

---

## MỤC LỤC CÁC MÀN HÌNH KHẢO SÁT

- [1. Phân nhóm Tổng quan & Đội ngũ (`MG-01`, `MG-02`, `MG-03`, `MG-15`)](#1-phân-nhóm-tổng-quan--đội-ngũ)
- [2. Phân nhóm Phân tích Năng lực & Khoảng cách Kỹ năng (`MG-04`, `MG-05`)](#2-phân-nhóm-phân-tích-năng-lực--khoảng-cách-kỹ-năng)
- [3. Phân nhóm Theo dõi Đào tạo & Tiến độ (`MG-06`, `MG-07`, `MG-14`)](#3-phân-nhóm-theo-dõi-đào-tạo--tiến-độ)
- [4. Phân nhóm Chấm điểm & Thẩm định Minh chứng (`MG-13`, `MG-08` đến `MG-12`)](#4-phân-nhóm-chấm-điểm--thẩm-định-minh-chứng)

---

## 1. PHÂN NHÓM TỔNG QUAN & ĐỘI NGŨ

### [MG-01] Bàn làm việc Tổng quan Nhóm (`/enterprise/team`)
* **Vai trò**: `MANAGER` (Trưởng phòng).
* **Mục đích nghiệp vụ**: Màn hình trung tâm của người quản lý chuyên môn. Giúp Manager trả lời 3 câu hỏi ngay khi đăng nhập:
  1. Có bao nhiêu bài nộp của nhân viên đang chờ mình chấm?
  2. Có ai thi bị cờ cảnh báo (Flagged) hoặc quá hạn (Overdue) không?
  3. Tỷ lệ phủ năng lực của phòng ban hiện tại đạt bao nhiêu % so với yêu cầu vị trí?
* **Đánh giá mức độ hoàn thiện tính năng**: **ĐẠT TỐT**.

#### Phân tích chi tiết 6 yếu tố thiết kế:
1. **Chữ hiển thị (Copywriting)**:
   - Phần đầu trang: Cần hiển thị rõ tên phòng ban phụ trách (VD: `"Phòng Kinh doanh & Khách hàng"`).
   - Đã tinh gọn các khẩu hiệu dài dòng thành: `"Quyết định việc cần ưu tiên theo thời gian thực"`.
2. **Nút bấm & Hành động (Buttons & CTAs)**:
   - Primary CTA: Nút `"Mở hàng chờ bài cuối khóa"` dẫn thẳng sang `MG-13` (kèm badge số bài chờ duyệt màu cam nếu > 0).
   - Secondary CTA: Nút `"Xem khoảng cách năng lực đội"` dẫn sang `MG-05`.
3. **Bố cục & Phân chia khung (Layout & Grid)**:
   - Phía trên: Thẻ Hero tổng quan phòng ban.
   - Ở giữa: 3 thẻ KPI hàng chờ (`Bài chờ quyết định`, `Cờ hỗ trợ cần xử lý`, `Nhân sự đang làm việc`).
   - Phía dưới: Danh sách nhân viên trong phòng ban kèm tiến độ học tập.
4. **Phối màu & Tương phản (Colors & Contrast)**:
   - Tông màu quản trị: Nền `bg-slate-50`, thẻ `bg-white`, các badge cảnh báo rủi ro màu cam hổ phách (`#D97706`).
5. **Khoảng cách & Responsive (Spacing & Adaptive)**:
   - Laptop 1366: Hiển thị trọn vẹn 3 khối KPI trên màn hình đầu tiên (above the fold).
   - Tablet 768: Bảng nhân sự tự động chuyển sang dạng thẻ card gọn gàng.
* **Mức độ ưu tiên**: **P1**.

---

### [MG-02] Danh sách Thành viên Nhóm (`/enterprise/team/members`) & [MG-03] Chi tiết Nhân sự (`/enterprise/team/members/:id`)
* **Vai trò**: `MANAGER`.
* **Mục đích nghiệp vụ**: Quản lý danh sách nhân viên trực thuộc phòng ban. Khác với màn của Owner/HR, Manager **không có quyền xóa hay đổi vai trò** mà chỉ có quyền xem tiến độ học tập, giao bài thực hành và chỉ định người kèm cặp (mentor).
* **Đánh giá mức độ hoàn thiện tính năng**: Đạt chuẩn.
* **Đề xuất cải tiến dứt điểm**:
  - **Xóa bỏ hoàn toàn cột Cấp bậc G1-G3** trong bảng thành viên nhóm.
  - Hiển thị nổi bật: Cột `"Khóa học đang học"`, `"Tiến độ %"`, và `"Bài tập chờ nộp"`.
* **Mức độ ưu tiên**: **P0 (Loại bỏ cột G1-G3)**.

---

### [MG-15] Khung Năng lực Chung Phòng ban (`/enterprise/team/framework`)
* **Vai trò**: `MANAGER`.
* **Mục đích nghiệp vụ**: Chế độ chỉ đọc (Read-only) của Khung năng lực số TT02 giúp Manager tra cứu tiêu chí các bài thi và năng lực mà nhân viên phòng mình cần đạt.
* **Đánh giá**: Hoạt động ổn định.
* **Mức độ ưu tiên**: **P2**.

---

## 2. PHÂN NHÓM PHÂN TÍCH NĂNG LỰC & KHOẢNG CÁCH KỸ NĂNG

### [MG-04] Ma trận Năng lực Nhóm (`/enterprise/team/competency`)
* **Vai trò**: `MANAGER`.
* **Mục đích nghiệp vụ**: Thể hiện trực quan trình độ hiện tại của từng nhân viên trên 6 miền năng lực Thông tư 02 (Dữ liệu, Giao tiếp, Nội dung số, An toàn, Giải quyết vấn đề, AI).
* **Đánh giá**: Rất trực quan nhưng bảng ma trận khá rộng.
* **Đề xuất cải tiến**:
  - Bọc ma trận trong container cuộn ngang độc lập `overflow-x-auto`.
  - Cố định cột Họ tên nhân viên bên trái dạng `sticky left-0 bg-white` để khi cuộn xem miền 5, miền 6 không bị mất dấu nhân viên.
* **Mức độ ưu tiên**: **P1**.

---

### [MG-05] Khoảng cách Năng lực Nhóm (Team Skill Gap) (`/enterprise/team/skill-gap`)
* **Vai trò**: `MANAGER`.
* **Mục đích nghiệp vụ**: Bảng phân tích khoảng cách kỹ năng giữa năng lực thực tế và yêu cầu vị trí của các nhân sự trong phòng ban.
* **Đánh giá mức độ hoàn thiện tính năng**: Đạt chuẩn nghiệp vụ.
* **Đề xuất cải tiến**:
  - **Xóa bỏ hoàn toàn bộ lọc Cấp bậc (G1, G2, G3)** trên thanh công cụ lọc.
  - Phân loại rõ: Nhân sự đã đạt mục tiêu vị trí (Xanh lá `#059669`) vs Nhân sự có khoảng thiếu nghiêm trọng (Đỏ cam `#E11D48`).
* **Mức độ ưu tiên**: **P0 (Bỏ filter G1-G3)**.

---

## 3. PHÂN NHÓM THEO DÕI ĐÀO TẠO & TIẾN ĐỘ

### [MG-06] Tiến độ Đào tạo Nhóm (`/enterprise/team/training`) & [MG-07] Chi tiết Phân công (`/enterprise/team/training/:assignmentId`)
* **Vai trò**: `MANAGER`.
* **Mục đích nghiệp vụ**: Giám sát nhân viên trong phòng ban học đến đâu trong từng khóa học. Phát hiện nhân viên bị chậm tiến độ (Stuck) để đôn đốc kịp thời trước ngày thi cuối khóa.
* **Đề xuất cải tiến**:
  - Bổ sung thanh tiến độ màu sắc: Xanh dương (Đang học đúng hạn), Đỏ (Quá hạn hoàn thành mô đun), Xanh lá (Đã học 100% chờ thi).
  - Nút hành động nhanh: `"Nhắc nhở học tập qua thông báo"` gửi thông báo đẩy (In-app notification) cho nhân viên lười học.
* **Mức độ ưu tiên**: **P1**.

---

### [MG-14] Báo cáo Chu kỳ Phòng ban (`/enterprise/team/reports`)
* **Vai trò**: `MANAGER`.
* **Mục đích nghiệp vụ**: Báo cáo tổng kết hiệu quả đào tạo của riêng phòng ban theo chu kỳ tháng/quý: Số giờ học trung bình, số chứng chỉ đạt được, tỷ lệ nhân viên vượt qua bài thi ngay từ lần 1.
* **Đánh giá**: Đạt chuẩn.
* **Mức độ ưu tiên**: **P2**.

---

## 4. PHÂN NHÓM CHẤM ĐIỂM & THẨM ĐỊNH MINH CHỨNG (CỐT LÕI)

### [MG-13] Hàng chờ Chấm bài Cuối khóa & Giám sát thi (Pulse Final Reviews) (`/enterprise/team/final-reviews`)
* **Vai trò**: `MANAGER` (và `OWNER` khi làm thay).
* **Mục đích nghiệp vụ**: **TRỌNG TÂM CÔNG VIỆC CỦA TRƯỞNG PHÒNG**. 
  - Đánh giá 2 loại bài: Bài đánh giá đầu vào (`PRE_ASSESSMENT`) và Bài thi cuối khóa (`FINAL`).
  - Kiểm tra các bản ghi giám sát thi cử (Proctoring): Bản ghi camera, màn hình, micro, phát hiện gian lận chuyển tab (Tab switch detection).
  - Đọc bài tự luận thực hành, chấm điểm 3 tiêu chí chuyên môn và ghi nhận quyết định Đạt / Chưa đạt kèm nhận xét bắt buộc (tối thiểu 10 ký tự).
* **Đánh giá mức độ hoàn thiện tính năng**: **RẤT XUẤT SẮC** sau khi đã tinh gọn tiêu đề và gắn nhãn cảnh báo rủi ro AI.

#### Phân tích chi tiết 6 yếu tố thiết kế:
1. **Chữ hiển thị (Copywriting)**:
   - Tiêu đề đã tinh gọn: `"Chấm điểm & Ra quyết định Minh chứng"` kèm tên phòng ban.
   - Nhãn tình trạng bài thi: `Chờ quyết định` (Xám), `Chờ nộp lại lần 2` (Xanh nhạt), `Quá hạn nộp lại` (Đỏ cam), `Cần hỗ trợ` (Đỏ đậm).
2. **Nút bấm & Hành động (Buttons & CTAs)**:
   - Trên mỗi thẻ bài thi: Nút `"Chấm bài ngay"` (Primary Blue-600) to rõ, nổi bật.
   - Trong Modal/Drawer chấm bài: Hai nút quyết định rõ ràng: `"Đạt (Pass)"` (Xanh lá) và `"Chưa đạt (Need Revision)"` (Cam/Đỏ).
3. **Bố cục & Phân chia khung (Layout & Grid)**:
   - 5 thẻ KPI hàng chờ nằm ngang trên cùng: Chờ quyết định, Đánh giá trước khi học, Chờ nộp lại, Quá hạn, Cần hỗ trợ.
   - Thanh Tab lọc kép: Lọc theo loại bài thi (Tất cả / Đánh giá trước học / Cuối khóa) và Lọc theo trạng thái.
   - Danh sách thẻ bài thi bố trí theo dạng dọc (Card Stack) dễ cuộn xem.
4. **Phối màu & Tương phản (Colors & Contrast)**:
   - Nhãn rủi ro giám sát thi (Proctoring Risk Tag):
     - Rủi ro thấp: Xanh ngọc (`#059669`)
     - Rủi ro trung bình (rời tab 1-2 lần): Hổ phách (`#D97706`)
     - Rủi ro cao (mất camera/micro, rời tab nhiều lần): Đỏ hồng (`#E11D48`).
5. **Khoảng cách & Responsive (Spacing & Adaptive)**:
   - Player phát video ghi hình camera và màn hình (RecordingPlayer) co giãn tự động theo tỷ lệ 16:9, không bị tràn màn hình khi xem trên Laptop 1366px.
* **Mức độ ưu tiên**: **ĐÃ TỐI ƯU (P0 Done)**.

---

### [MG-08] Danh sách Nhiệm vụ Thực tế (`/enterprise/tasks`) & [MG-09] Giao Việc (`/enterprise/tasks/new`) & [MG-10] Chi tiết (`/enterprise/tasks/:id`)
* **Vai trò**: `MANAGER`.
* **Mục đích nghiệp vụ**: Giao các bài tập tình huống thực tế cho nhân viên trong nhóm để kiểm tra năng lực ứng dụng số (Ví dụ: "Thiết lập pipeline CRM và gửi báo cáo phân tích tuần").
* **Đề xuất cải tiến**:
  - Giao việc nhanh: Cho phép Manager nhân bản (Clone) một nhiệm vụ đã giao trước đó để giao cho nhân viên mới mà không phải gõ lại từ đầu.
* **Mức độ ưu tiên**: **P1**.

---

### [MG-11] Hàng đợi Duyệt Minh chứng (`/enterprise/reviews`) & [MG-12] Đánh giá Minh chứng (`/enterprise/reviews/:submissionId`)
* **Vai trò**: `MANAGER`.
* **Mục đích nghiệp vụ**: Chấm bài tập tình huống thực tế ngoài công việc (khác với bài thi trắc nghiệm cuối khóa học ở màn `MG-13`).
* **Đề xuất cải tiến**:
  - Hỗ trợ xem trước file (File Previewer): PDF, ảnh PNG/JPG, link Google Docs / Figma ngay trên giao diện mà không cần tải file về máy tính.
* **Mức độ ưu tiên**: **P1**.

---

## BẢNG TỔNG HỢP HÀNH ĐỘNG CẢI TIẾN TRỌNG TÂM CỔNG MANAGER

| STT | Mã màn hình | Tên màn hình | Vấn đề cốt lõi cần xử lý | Hành động kỹ thuật cụ thể | Mức ưu tiên |
|:---:|---|---|---|---|:---:|
| 1 | `MG-02` | Thành viên nhóm | Cột Cấp bậc G1-G3 thừa thãi | **Xóa bỏ cột Cấp bậc G1-G3** khỏi bảng nhân sự phòng ban. | **P0** |
| 2 | `MG-05` | Khoảng cách năng lực nhóm | Bộ lọc Cấp bậc G1-G3 gây rối | **Xóa bỏ filter G1-G3**; giữ lại lọc theo vị trí và mức khoảng trống. | **P0** |
| 3 | `MG-04` | Ma trận năng lực nhóm | Tràn màn hình khi xem trên laptop | Bọc ma trận trong `overflow-x-auto` và cố định cột tên nhân viên (`sticky`). | **P1** |
| 4 | `MG-06` | Tiến độ đào tạo nhóm | Khó nhận biết ai sắp trễ hạn | Bổ sung thanh màu tiến độ trực quan và nút nhắc nhở học tập. | **P1** |
| 5 | `MG-12` | Đánh giá minh chứng | Phải tải file bài nộp về máy | Tích hợp trình xem trước file PDF/ảnh trực tiếp trong modal chấm điểm. | **P1** |
