# BÁO CÁO RÀ SOÁT & PHÂN TÍCH UI/UX CHI TIẾT: CỔNG CÔNG KHAI, XÁC THỰC & ONBOARDING

> **Môi trường khảo sát**: Cổng công khai (`/business`, `/careers`, `/verify`), Luồng xác thực (`/login`, `/business/try`, `/register`), và Luồng khởi tạo doanh nghiệp (`/checkout`, `/setup`, `/contract`).  
> **Mục đích khảo sát**: Rà soát trải nghiệm điểm chạm đầu tiên (First Impression) của khách hàng doanh nghiệp và người dùng học viên, đảm bảo tỷ lệ chuyển đổi cao, thông điệp rõ ràng, không gây quá tải thông tin, loại bỏ các khái niệm hành chính rườm rà.  
> **Bộ kỹ năng ứng dụng**: `design-taste-frontend`, `impeccable`, `ui-styling`, `brand`.

---

## MỤC LỤC CÁC MÀN HÌNH KHẢO SÁT

- [1. Phân nhóm Tiếp thị & Khám phá Công khai (`PB-01` đến `PB-05`)](#1-phân-nhóm-tiếp-thị--khám-phá-công-khai)
- [2. Phân nhóm Định danh & Xác thực Người dùng (`AU-01` đến `AU-08`)](#2-phân-nhóm-định-danh--xác-thực-người-dùng)
- [3. Phân nhóm Đón tiếp & Ký kết Hợp đồng Doanh nghiệp (`OB-01` đến `OB-05`)](#3-phân-nhóm-đón-tiếp--ký-kết-hợp-đồng-doanh-nghiệp)

---

## 1. PHÂN NHÓM TIẾP THỊ & KHÁM PHÁ CÔNG KHAI

### [PB-01] Trang chủ Tiếp thị Doanh nghiệp (Enterprise Landing Page - `/business`)
* **Vai trò**: Khách vãng lai, Chủ doanh nghiệp (CEO), Giám đốc Nhân sự (CHRO).
* **Mục đích nghiệp vụ**: Thuyết phục doanh nghiệp chuyển đổi đào tạo số theo chuẩn Thông tư 02/2025/TT-BGDĐT. Giới thiệu giá trị cốt lõi: Đánh giá khoảng cách năng lực -> Đào tạo cá nhân hóa -> Thẩm định minh chứng thực tế.
* **Đánh giá mức độ hoàn thiện tính năng**: **RẤT TỐT (Chuẩn phong cách Pulse Design hiện đại)**.

#### Phân tích chi tiết 6 yếu tố thiết kế:
1. **Chữ hiển thị (Copywriting)**:
   - Thông điệp Hero chính súc tích, đắt giá: `"Nền tảng Nâng chuẩn Năng lực số Doanh nghiệp Quốc gia"`.
   - Phụ đề (Sub-headline): `"Đo lường khoảng cách kỹ năng số, đào tạo theo 6 miền năng lực Thông tư 02/2025/TT-BGDĐT và cấp chứng chỉ số định danh"`.
   - Giảm thiểu các khối văn bản dài trên 3 dòng; thay bằng các gạch đầu dòng ngắn có icon minh họa.
2. **Nút bấm & Hành động (Buttons & CTAs)**:
   - Primary CTA: Nút `"Trải nghiệm Dùng thử Miễn phí"` (Xanh Indigo nổi bật, hiệu ứng đổ bóng mờ).
   - Secondary CTA: Nút `"Xem Khung 6 Miền năng lực"` dẫn tới `/careers` hoặc video demo ngắn.
3. **Bố cục & Phân chia khung (Layout & Bento-Grid)**:
   - Phần Hero cân đối: Cột trái chứa thông điệp và CTA, cột phải minh họa mô hình 3D/Radar trực quan về 6 Miền năng lực số.
   - Phần Bento-Grid 4 cột minh họa: `Chuẩn hóa TT02`, `Khảo sát AI thích ứng`, `Chấm điểm minh chứng thực tế`, `Chứng chỉ số QR`.
4. **Phối màu & Tương phản (Colors & Contrast)**:
   - Nền sáng `bg-[#F8FAFC]` kết hợp các khối kính mờ (Glassmorphism), viền thẻ xám tinh tế `border-slate-200/80`, văn bản màu than `text-slate-900` đạt chuẩn WCAG AAA.
5. **Khoảng cách & Responsive (Spacing & Adaptive)**:
   - Hero section có khoảng đệm chuẩn `py-16` đến `py-24`, trên điện thoại tự động xếp chồng (stacking) mượt mà không bị vỡ layout.
* **Mức độ ưu tiên**: **P1 (Giữ vững phong cách cao cấp)**.

---

### [PB-02] Trang Chi tiết Giải pháp Đào tạo Số (`/business/solution`)
* **Vai trò**: Khách hàng doanh nghiệp quan tâm sâu về nghiệp vụ đào tạo.
* **Mục đích nghiệp vụ**: Trình bày chi tiết cơ chế hoạt động của DigiTalent AI:
  1. Cách thức chẩn đoán đầu vào không thiên vị (Pre-assessment).
  2. Lộ trình vi học tập (Micro-learning) rút gọn từ 40 giờ xuống 12 giờ có trọng tâm.
  3. Cơ chế giám sát chống gian lận thi cử và thẩm định minh chứng dự án thật.
* **Đánh giá mức độ hoàn thiện tính năng**: **ĐẠT TỐT**.

#### Đề xuất cải tiến UI/UX:
- **Cải tiến Copywriting**: Sử dụng biểu đồ luồng 4 bước trực quan thay cho 5 đoạn văn bản dài.
- **Tương tác**: Cho phép người xem bấm vào từng bước để xem ảnh chụp màn hình thực tế tương ứng.
* **Mức độ ưu tiên**: **P1**.

---

### [PB-03] Bảng giá Dịch vụ & Gói Thuê bao (`/business/pricing`)
* **Vai trò**: Chủ doanh nghiệp, Trưởng phòng Mua hàng / Tài chính.
* **Mục đích nghiệp vụ**: Cung cấp thông tin minh bạch về các gói cước:
  - Gói Dùng thử (Trial 14 ngày - Tối đa 10 nhân sự).
  - Gói Tăng trưởng (Growth - Cho doanh nghiệp SME dưới 100 nhân sự).
  - Gói Doanh nghiệp Lớn (Enterprise - Không giới hạn quy mô, tích hợp SSO/LMS chuyên biệt).
* **Đánh giá mức độ hoàn thiện tính năng**: **RẤT TỐT**.

#### Phân tích chi tiết 6 yếu tố thiết kế:
1. **Chữ hiển thị (Copywriting)**:
   - Nêu bật quyền lợi rõ ràng: `Giá niêm yết trên mỗi người dùng / tháng`, cam kết không chi phí ẩn.
2. **Nút bấm & Hành động (Buttons & CTAs)**:
   - Nút bật tắt chu kỳ thanh toán: `Thanh toán theo Tháng` / `Thanh toán theo Năm (Tiết kiệm 20%)` dạng Toggle Switch mượt mà.
   - Gói phổ biến nhất (Growth) được đánh dấu nhãn `"Được khuyên dùng nhiều nhất"` kèm nút CTA màu tím Indigo.
3. **Bố cục & Phân chia khung (Layout & Grid)**:
   - Lưới so sánh 3 cột thẻ giá với chiều cao đồng đều. Bảng tính năng chi tiết dạng ma trận đánh dấu kiểm (`✓`) bên dưới.
4. **Phối màu & Tương phản (Colors & Contrast)**:
   - Nền thẻ gói khuyên dùng nổi bật với viền sáng màu xanh dương ngọc.
* **Mức độ ưu tiên**: **P1**.

---

### [PB-04] Cổng Tra cứu Danh mục Nghề nghiệp & Yêu cầu Năng lực (`/careers`, `/careers/:slug`)
* **Vai trò**: Học viên, Doanh nghiệp muốn đối sánh khung chuẩn.
* **Mục đích nghiệp vụ**: Tra cứu 5 vị trí tham chiếu chuẩn quốc gia và yêu cầu năng lực số tương ứng theo Thông tư 02:
  - Xem mô tả công việc, chuẩn đầu ra cần đạt ở 6 Miền năng lực.
* **Đánh giá mức độ hoàn thiện tính năng**: **ĐẠT TỐT**.

#### Đề xuất dọn dẹp cấp thiết (Chỉ đạo bỏ Job Grade):
- **Xóa bỏ các tab lọc G1, G2, G3**: Trước đây trang có 3 nút lọc cấp bậc G1/G2/G3 gây bối rối cho ứng viên bên ngoài.
- **Thay thế bằng**: Bộ lọc theo ngành nghề / phòng ban và thanh trượt mức độ thành thạo (Cơ bản - Trung cấp - Nâng cao).
* **Mức độ ưu tiên**: **P0 (Loại bỏ nhãn G1-G3)**.

---

### [PB-05] Cổng Tra cứu & Xác thực Chứng chỉ Số Công khai (QR Verify - `/verify`, `/verify/:code`)
* **Vai trò**: Nhà tuyển dụng, Khách hàng, Cơ quan thẩm định bên ngoài quét mã QR từ chứng chỉ của nhân viên.
* **Mục đích nghiệp vụ**: Xác minh tính xác thực, toàn vẹn của Chứng chỉ số DigiTalent AI:
  - Tra cứu mã định danh chứng chỉ (VD: `DGT-2026-X892K`).
  - Hiển thị ngày cấp, người được cấp, vị trí công việc, điểm số thẩm định và chữ ký số mật mã.
* **Đánh giá mức độ hoàn thiện tính năng**: **XUẤT SẮC**.

#### Phân tích chi tiết 6 yếu tố thiết kế:
1. **Chữ hiển thị (Copywriting)**:
   - Thông báo tình trạng xác thực rõ ràng: `"Chứng chỉ số Hợp lệ & Đã được Xác minh"` (Kèm dấu tích xanh chính phủ).
2. **Nút bấm & Hành động (Buttons & CTAs)**:
   - Nút `"Tải bản sao điện tử PDF"`, `"Sao chép liên kết chia sẻ LinkedIn"`.
3. **Bố cục & Phân chia khung (Layout & Grid)**:
   - Khung xem trước chứng chỉ số ở giữa trang, thiết kế trang trọng đạt chuẩn bằng cấp số quốc tế.
4. **Phối màu & Tương phản (Colors & Contrast)**:
   - Viền vàng kim loại và hoa văn bảo an chìm tinh xảo.
* **Mức độ ưu tiên**: **P1 (Bảo chứng uy tín)**.

---

## 2. PHÂN NHÓM ĐỊNH DANH & XÁC THỰC NGƯỜI DÙNG

### [AU-01] Màn hình Đăng nhập Hợp nhất (`/login`)
* **Vai trò**: Toàn bộ người dùng trong hệ thống (Owner, Manager, Employee, Platform Admin).
* **Mục đích nghiệp vụ**: Đăng nhập vào không gian làm việc tương ứng với một cổng duy nhất:
  - Hỗ trợ đăng nhập bằng Email / Mật khẩu.
  - Tự động điều hướng thông minh dựa trên Role của người dùng (`Owner` -> `/enterprise/dashboard`, `Manager` -> `/enterprise/team`, `Employee` -> `/enterprise/me`, `Platform Admin` -> `/platform/dashboard`).
* **Đánh giá mức độ hoàn thiện tính năng**: **RẤT TỐT**.

#### Phân tích chi tiết 6 yếu tố thiết kế:
1. **Chữ hiển thị (Copywriting)**:
   - Tiêu đề thân thiện: `"Chào mừng trở lại với DigiTalent"`.
   - Lời nhắc súc tích: `"Nhập email doanh nghiệp của bạn để tiếp tục"`.
2. **Nút bấm & Hành động (Buttons & CTAs)**:
   - Nút `"Đăng nhập"` toàn chiều rộng (Full-width), có trạng thái loading spinner khi đang kết nối API.
   - Nút liên kết `"Quên mật khẩu?"` nằm thẳng hàng bên phải ô mật khẩu.
3. **Bố cục & Phân chia khung (Layout & Grid - Bố cục Chia đôi Split Screen)**:
   - **Cột trái (50%)**: Form nhập liệu tinh gọn, gọn gàng ở tâm mắt.
   - **Cột phải (50%)**: Banner hình ảnh công nghệ cao cấp kèm trích dẫn về chuyển đổi số nguồn nhân lực quốc gia.
4. **Phối màu & Tương phản (Colors & Contrast)**:
   - Ô nhập liệu có viền nổi rõ `border-slate-300`, hiệu ứng `focus:ring-2 focus:ring-indigo-500` rõ ràng.
5. **Khoảng cách & Responsive (Spacing & Adaptive)**:
   - Trên điện thoại di động: Ẩn cột banner bên phải, tập trung 100% vào form đăng nhập để người dùng thao tác một chạm nhanh nhất.
* **Mức độ ưu tiên**: **P1**.

---

### [AU-02] Đăng ký Dùng thử Dành cho Doanh nghiệp (`/business/try`) & [AU-03] Xác thực Dùng thử
* **Vai trò**: Chủ doanh nghiệp, Trưởng phòng Nhân sự đăng ký trải nghiệm.
* **Mục đích nghiệp vụ**: Thu thập thông tin doanh nghiệp nhanh gọn để cấp tài khoản Sandbox trải nghiệm ngay lập tức trong 14 ngày.
* **Đánh giá mức độ hoàn thiện tính năng**: **ĐẠT TỐT**.

#### Đề xuất tối ưu hóa chuyển đổi:
- **Giảm số trường nhập liệu**: Chỉ yêu cầu 4 trường cốt lõi: `Họ và tên`, `Email công việc`, `Tên công ty`, `Số điện thoại`. Bỏ trường mã số thuế và địa chỉ (chuyển sang bước Onboarding sau).
- **Tránh gây nghẽn OTP**: Cho phép gửi lại mã OTP sau 60 giây có bộ đếm ngược trực quan.
* **Mức độ ưu tiên**: **P1**.

---

### [AU-04] Đăng ký Tài khoản Doanh nghiệp Chính thức (`/business/register`) & [AU-07] Xác thực Email
* **Vai trò**: Doanh nghiệp mua gói cước chính thức.
* **Mục đích nghiệp vụ**: Thiết lập tài khoản tổ chức (Tenant Creation), định danh người đại diện pháp luật.
* **Đánh giá mức độ hoàn thiện tính năng**: **ĐẠT CHUẨN**.
* **Đề xuất**: Tích hợp kiểm tra tính hợp lệ của mật khẩu ngay khi gõ (Độ dài >= 8 ký tự, có chữ hoa, số và ký tự đặc biệt) bằng thanh tiến độ màu sắc trực quan thay vì báo lỗi sau khi bấm Đăng ký.
* **Mức độ ưu tiên**: **P1**.

---

### [AU-05] Kích hoạt Lời mời & Thiết lập Mật khẩu (`/activate/:token`) & [AU-06] Quên Mật khẩu
* **Vai trò**: Nhân viên mới được công ty thêm vào hệ thống qua email mời.
* **Mục đích nghiệp vụ**: Kích hoạt tài khoản lần đầu không cần quản trị viên gửi mật khẩu thủ công qua chat/email nội bộ (Đảm bảo an toàn bảo mật).
* **Đánh giá mức độ hoàn thiện tính năng**: **RẤT TỐT**.
* **Đề xuất**: Sau khi đặt mật khẩu thành công, hiển thị nút to bản `"Bắt đầu bài khảo sát năng lực đầu vào ngay"` để đưa nhân viên vào luồng đào tạo tức thì.
* **Mức độ ưu tiên**: **P1**.

---

## 3. PHÂN NHÓM ĐÓN TIẾP & KÝ KẾT HỢP ĐỒNG DOANH NGHIỆP

### [OB-01] Màn hình Thanh toán Gói Dịch vụ (`/checkout`) & [OB-02] Kết quả Giao dịch (`/checkout/result`)
* **Vai trò**: Chủ doanh nghiệp (Owner), Người đại diện mua hàng.
* **Mục đích nghiệp vụ**: Thực hiện thanh toán trực tuyến cho gói dịch vụ đã chọn:
  - Hỗ trợ thanh toán qua Cổng VietQR tự động khớp đơn (Không cần nhập tay nội dung chuyển khoản).
  - Tích hợp cổng thanh toán thẻ tín dụng quốc tế / thẻ ATM nội địa.
* **Đánh giá mức độ hoàn thiện tính năng**: **RẤT TỐT**.

#### Phân tích chi tiết 6 yếu tố thiết kế:
1. **Chữ hiển thị (Copywriting)**:
   - Tóm tắt đơn hàng rõ ràng bên phải: `Gói dịch vụ`, `Số lượng nhân sự`, `Đơn giá`, `Giảm giá khuyến mãi`, `Tổng tiền thanh toán (Đã bao gồm VAT 10%)`.
2. **Nút bấm & Hành động (Buttons & CTAs)**:
   - Nút `"Xác nhận & Thanh toán ngay"` kèm khóa bảo mật SSL 256-bit tạo sự an tâm tuyệt đối.
3. **Bố cục & Phân chia khung (Layout & Grid)**:
   - Cột trái: Lựa chọn phương thức thanh toán (VietQR / Chuyển khoản doanh nghiệp / Thẻ ngân hàng).
   - Cột phải: Bảng kê tóm tắt hóa đơn dính cố định khi cuộn trang (Sticky Invoice Summary).
4. **Phối màu & Tương phản (Colors & Contrast)**:
   - Mã VietQR hiển thị to bản ở giữa khung nền trắng với bộ đếm thời gian hiệu lực 15 phút.
* **Mức độ ưu tiên**: **P1**.

---

### [OB-03] Ký Hợp đồng Dịch vụ Điện tử Doanh nghiệp (`/checkout/contract` & `/enterprise/contract`)
* **Vai trò**: Chủ doanh nghiệp (Owner).
* **Mục đích nghiệp vụ**: Ký kết hợp đồng cung cấp dịch vụ đào tạo số trực tuyến hợp pháp:
  - Tự động điền thông tin pháp nhân doanh nghiệp vào biểu mẫu hợp đồng mẫu.
  - Hỗ trợ ký số điện tử (OTP ký kết / Tải lên chứng thư số doanh nghiệp).
* **Đánh giá mức độ hoàn thiện tính năng**: **ĐẠT TỐT**.

#### Phân tích chi tiết 6 yếu tố thiết kế:
1. **Chữ hiển thị (Copywriting)**:
   - Thể hiện rõ các điều khoản cam kết bảo mật dữ liệu nhân sự (NDPA compliant).
2. **Nút bấm & Hành động (Buttons & CTAs)**:
   - Nút `"Ký xác nhận hợp đồng"` (Chỉ kích hoạt khi người dùng đã cuộn đọc hết các trang hợp đồng).
   - Nút `"Tải bản hợp đồng PDF mẫu"`.
3. **Bố cục & Phân chia khung (Layout & Grid)**:
   - Trình đọc hợp đồng PDF thu nhỏ ở giữa trang, các trường thông tin chữ ký nổi bật ở chân trang.
* **Mức độ ưu tiên**: **P1**.

---

### [OB-04] Trình hướng dẫn Thiết lập Tổ chức Ban đầu (Setup Wizard - `/setup`)
* **Vai trò**: Chủ doanh nghiệp (Owner) sau khi thanh toán hoặc kích hoạt gói dùng thử.
* **Mục đích nghiệp vụ**: Giúp doanh nghiệp hoàn tất thiết lập hệ thống trong 5 phút qua 3 bước đơn giản:
  - **Bước 1**: Xác nhận cơ cấu phòng ban (Kinh doanh, Kế toán, Nhân sự, Vận hành...).
  - **Bước 2**: Chọn vị trí việc làm mẫu hoặc áp dụng khung 6 miền năng lực TT02.
  - **Bước 3**: Nhập danh sách nhân viên ban đầu (Nhập nhanh từng người hoặc Tải file Excel mẫu).
* **Đánh giá mức độ hoàn thiện tính năng**: **RẤT XUẤT SẮC**.

#### Đề xuất hoàn thiện dứt điểm (Theo chỉ đạo loại bỏ Job Grade):
- **Ở Bước 2 (Vị trí việc làm)**: Tuyệt đối không yêu cầu người dùng chọn cấp bậc G1, G2, hay G3. Chỉ cần chọn tên vị trí và mục tiêu trình độ năng lực số (Cơ bản / Nâng cao).
- **Ở Bước 3 (Mời nhân sự)**: Bỏ cột Cấp bậc trong bảng danh sách và trong file Excel mẫu tải về. Chỉ cần: `Họ tên`, `Email`, `Phòng ban`, `Vị trí`.
* **Mức độ ưu tiên**: **P0 (Xóa bỏ hoàn toàn trường G1-G3 trong Setup Wizard)**.

---

### [OB-05] Khảo sát & Đánh giá Năng lực Ban đầu (`/enterprise/initial-assessment`)
* **Vai trò**: Học viên / Quản lý lần đầu truy cập hệ thống.
* **Mục đích nghiệp vụ**: Xác định mặt bằng kiến thức số hiện tại để hệ thống đề xuất bài học phù hợp, không bắt học viên học lại những gì họ đã thành thạo.
* **Đánh giá mức độ hoàn thiện tính năng**: **RẤT TỐT**.
* **Đề xuất**:
  - Giao diện bài thi trắc nghiệm tình huống dạng thẻ trượt (Card Slide), hiển thị thanh tiến độ `% hoàn thành` ở đỉnh màn hình.
  - Bấm nộp bài tự động tính toán và điều hướng thẳng vào Lộ trình học tập cá nhân tại `EM-01` (`/enterprise/me`).
* **Mức độ ưu tiên**: **P1**.

---

## TỔNG KẾT HÀNH ĐỘNG CHO CỔNG CÔNG KHAI, AUTH & ONBOARDING:
1. **P0 (Cốt lõi)**: Loại bỏ các nhãn cấp bậc G1-G3 trong [PB-04] Tra cứu nghề nghiệp (`/careers`) và [OB-04] Setup Wizard (`/setup`).
2. **P1 (Nghiệp vụ)**: Tinh gọn biểu mẫu đăng ký dùng thử [AU-02] để tối đa hóa chuyển đổi; tối ưu giao diện Split Screen cho [AU-01] Đăng nhập.
3. **P2 (Nâng cao)**: Tích hợp hiệu ứng xem trước hợp đồng điện tử [OB-03] và bộ đếm ngược thời gian thanh toán VietQR [OB-01].
