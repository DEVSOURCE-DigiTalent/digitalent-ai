# BÁO CÁO RÀ SOÁT & PHÂN TÍCH UI/UX CHI TIẾT: BÀN ĐIỀU HÀNH NỀN TẢNG (PLATFORM ADMIN CONSOLE)

> **Môi trường khảo sát**: DigiTalent AI Platform Console (`/platform/*`)  
> **Tài khoản kiểm thử**: `admin@digitalent.ai` / `platform@digitalent.ai` (Quản trị viên Nền tảng Trần Minh Hoàng)  
> **Phạm vi thẩm quyền**: Toàn quyền cấu hình danh mục dữ liệu gốc (Master Data), quản lý danh mục khung năng lực chuẩn Thông tư 02/2025/TT-BGDĐT, kho 18 khóa học chuẩn, 5 vị trí tham chiếu, hồ sơ các doanh nghiệp khách hàng và cấu hình thương mại.  
> **Nguyên tắc thiết kế**: Giao diện điều hành cấp cao chuyên nghiệp (SaaS Operations Console), trực quan hóa dữ liệu vận hành, tối ưu hóa thao tác biên soạn nội dung đào tạo (Course Builder) và quản lý thuê bao, loại trừ triệt để khái niệm cấp bậc G1-G3.

---

## MỤC LỤC CÁC MÀN HÌNH KHẢO SÁT

- [1. Phân nhóm Bàn điều hành & Giám sát Vận hành (`PA-01`, `PA-10`)](#1-phân-nhóm-bàn-điều-hành--giám-sát-vận-hành)
- [2. Phân nhóm Quản trị Chuẩn Năng lực & Vị trí Tham chiếu (`PA-02`, `PA-13`)](#2-phân-nhóm-quản-trị-chuẩn-năng-lực--vị-trí-tham-chiếu)
- [3. Phân nhóm Kho Khóa học & Bộ công cụ Soạn thảo Builder (`PA-03`, `PA-12`, `PA-04`)](#3-phân-nhóm-kho-khóa-học--bộ-công-cụ-soạn-thảo-builder)
- [4. Phân nhóm Quản lý Doanh nghiệp Khách hàng & Người dùng (`PA-05`, `PA-06`, `PA-07`, `PA-08`)](#4-phân-nhóm-quản-lý-doanh-nghiệp-khách-hàng--người-dùng)
- [5. Phân nhóm Quản lý Thương mại & Bảng giá Dịch vụ (`PA-09`)](#5-phân-nhóm-quản-lý-thương-mại--bảng-giá-dịch-vụ)
- [6. Phân nhóm Tài khoản & Bảo mật Quản trị (`SHR-01`, `SHR-02`, `SHR-03`)](#6-phân-nhóm-tài-khoản--bảo-mật-quản-trị)

---

## 1. PHÂN NHÓM BÀN ĐIỀU HÀNH & GIÁM SÁT VẬN HÀNH

### [PA-01] Bàn làm việc Tổng quan Vận hành Nền tảng (`/platform/dashboard`)
* **Vai trò**: `PLATFORM_ADMIN`.
* **Mục đích nghiệp vụ**: Cung cấp bức tranh toàn cảnh sức khỏe kỹ thuật và kinh doanh của hệ thống:
  1. Số lượng Doanh nghiệp đang hoạt động (`Active Tenants`) và Tổng số người học (`Learners`).
  2. Tải học tập theo thời gian thực (Lượt thi Pre-assessment, Final Exam, số bài nộp chờ duyệt).
  3. Trạng thái hạ tầng (Database, AI Service latency, Storage usage).
* **Đánh giá mức độ hoàn thiện tính năng**: **RẤT TỐT**.

#### Phân tích chi tiết 6 yếu tố thiết kế:
1. **Chữ hiển thị (Copywriting)**:
   - Tiêu đề súc tích: `"Điều hành Nền tảng DigiTalent AI"`.
   - Bỏ các đoạn giải thích kỹ thuật thừa; giữ lại thẻ trạng thái: `"Hạ tầng ổn định (99.98% SLA)"`.
2. **Nút bấm & Hành động (Buttons & CTAs)**:
   - Nút tác vụ nhanh: `"Thêm doanh nghiệp mới"`, `"Xuất bản phiên bản khóa học mới"`.
   - Nút lọc thời gian (Hôm nay / 7 ngày / 30 ngày) dạng Segmented Pill trực quan.
3. **Bố cục & Phân chia khung (Layout & Grid)**:
   - Hệ thống Bento-Grid 4 thẻ chỉ số chính trên đỉnh: `Tổng số Doanh nghiệp`, `Tổng người dùng active`, `Khóa học chuẩn đã xuất bản`, `Doanh thu MRR`.
   - Khu vực biểu đồ bên dưới: Biểu đồ tăng trưởng người học và biểu đồ phân bổ học tập theo 6 Miền năng lực.
4. **Phối màu & Tương phản (Colors & Contrast)**:
   - Sử dụng theme Dark Slate chuyên biệt cho Admin (`#0F172A` làm nền sidebar và header), các thẻ nội dung màu trắng với viền Slate-200, tương phản WCAG AAA.
5. **Khoảng cách & Responsive (Spacing & Adaptive)**:
   - Padding tiêu chuẩn `p-6` rộng rãi. Khung lưới tự động co giãn từ 4 cột trên màn hình 1920 sang 2 cột trên Laptop 1366.
* **Mức độ ưu tiên**: **P1 (Giữ nguyên phong cách Bento tối giản)**.

---

### [PA-10] Nhật ký Hoạt động Toàn hệ thống (Audit Logs) (`/platform/audit-logs`)
* **Vai trò**: `PLATFORM_ADMIN`.
* **Mục đích nghiệp vụ**: Truy vết toàn bộ sự kiện nhạy cảm diễn ra trên nền tảng:
  - Ai đã kích hoạt tài khoản doanh nghiệp mới?
  - Ai đã chỉnh sửa trọng số bài thi hoặc ghi đè kết quả thẩm định?
  - Phát hiện các bất thường về bảo mật (Brute force login, Token refresh vượt ngưỡng).
* **Đánh giá mức độ hoàn thiện tính năng**: **ĐẠT CHUẨN**.

#### Phân tích chi tiết 6 yếu tố thiết kế:
1. **Chữ hiển thị (Copywriting)**:
   - Cột nhật ký rõ ràng: `Thời gian`, `Tác nhân (Actor)`, `Loại sự kiện`, `Đối tượng bị tác động`, `Địa chỉ IP`, `Trạng thái`.
   - Đã loại bỏ các chuỗi JSON thô kềnh càng, chỉ hiển thị tóm tắt có thể đọc được bằng mắt thường (`Human-readable message`).
2. **Nút bấm & Hành động (Buttons & CTAs)**:
   - Nút `"Xuất file CSV kiểm toán"`.
   - Bộ lọc theo `Tổ chức`, `Loại hành vi`, và `Mức độ nghiêm trọng (Info / Warning / Critical)`.
3. **Bố cục & Phân chia khung (Layout & Grid)**:
   - Thanh bộ lọc gắn liền phía trên bảng; bảng hỗ trợ cuộn ngang cố định cột hành động bên phải.
   - Khi bấm vào một dòng, mở ngăn kéo (Slide-over drawer) bên phải hiển thị Payload chi tiết dạng JSON có highlight cú pháp.
4. **Phối màu & Tương phản (Colors & Contrast)**:
   - Badge `Info` (Xanh dương), `Warning` (Hổ phách cam), `Critical` (Đỏ thắm) sắc nét, dễ quét bằng mắt.
5. **Khoảng cách & Responsive (Spacing & Adaptive)**:
   - Bảng hiển thị tối thiểu 15 bản ghi mỗi trang, phân trang gọn nhẹ phía dưới.
* **Mức độ ưu tiên**: **P1**.

---

## 2. PHÂN NHÓM QUẢN TRỊ CHUẨN NĂNG LỰC & VỊ TRÍ THAM CHIẾU

### [PA-02] Khung Năng lực Chuẩn Thông tư 02/2025/TT-BGDĐT (`/platform/frameworks`)
* **Vai trò**: `PLATFORM_ADMIN`.
* **Mục đích nghiệp vụ**: Định nghĩa và duy trì Bộ khung năng lực số Quốc gia theo Thông tư 02/2025/TT-BGDĐT. Đây là "Bộ gen gốc" (Master Schema) của toàn bộ hệ thống:
  - 6 Miền năng lực số (Digital Competency Domains).
  - 24 Tiêu chí con (Competency Sub-domains).
  - 3 Cấp độ thành thạo: Cơ bản (Foundation), Trung cấp (Intermediate), Nâng cao (Advanced).
* **Đánh giá mức độ hoàn thiện tính năng**: **RẤT TỐT & ĐÃ CHUẨN HÓA**.

#### Phân tích chi tiết 6 yếu tố thiết kế:
1. **Chữ hiển thị (Copywriting)**:
   - Tiêu chuẩn hóa danh pháp tiếng Việt chuẩn quy chuẩn giáo dục:
     - Miền 1: `Khai thác Dữ liệu & Thông tin (Data & Information Literacy)`
     - Miền 2: `Giao tiếp & Hợp tác Số (Communication & Collaboration)`
     - Miền 3: `Sáng tạo Nội dung Số (Digital Content Creation)`
     - Miền 4: `An toàn & An ninh Số (Safety & Security)`
     - Miền 5: `Giải quyết Vấn đề Số (Problem Solving)`
     - Miền 6: `Ứng dụng Trí tuệ Nhân tạo (Artificial Intelligence)`
2. **Nút bấm & Hành động (Buttons & CTAs)**:
   - Nút `"Khóa cấu hình chuẩn"` (Ngăn ngừa sửa đổi ngoài ý muốn khi các doanh nghiệp đang áp dụng).
   - Nút `"Tạo phiên bản sửa đổi (New Revision)"`.
3. **Bố cục & Phân chia khung (Layout & Grid)**:
   - Bố cục dạng Cây danh mục phân cấp 3 tầng (Accordion Tree): `Miền -> Tiêu chí -> Chuẩn đầu ra (Bloom's Taxonomy)`.
   - Mỗi tiêu chí hiển thị rõ số giờ học đề xuất và số câu hỏi đánh giá tương ứng.
4. **Phối màu & Tương phản (Colors & Contrast)**:
   - Mỗi Miền năng lực có mã màu nhận diện thương hiệu riêng biệt (Indigo, Emerald, Violet, Rose, Amber, Cyan) giúp người dùng nhận diện ngay tức thì.
5. **Khoảng cách & Responsive (Spacing & Adaptive)**:
   - Cây danh mục lùi lề chuẩn `pl-4`, `pl-8` đều đặn, không bị tràn dòng trên màn hình nhỏ.
* **Mức độ ưu tiên**: **P1 (Cực kỳ ổn định)**.

---

### [PA-13] Danh mục 5 Vị trí Tham chiếu Chuẩn (`/platform/reference-positions`)
* **Vai trò**: `PLATFORM_ADMIN`.
* **Mục đích nghiệp vụ**: Cung cấp 5 mẫu vị trí việc làm điển hình trong doanh nghiệp (Reference Job Roles) với ma trận năng lực số mẫu để các doanh nghiệp mới thành lập áp dụng chỉ với 1 cú click:
  1. `Nhân viên Kinh doanh & Tiếp thị Số (Sales & Marketing)`
  2. `Chuyên viên Tài chính - Kế toán (Finance & Accounting)`
  3. `Chuyên viên Nhân sự & Đào tạo (HR & Talent)`
  4. `Chuyên viên Vận hành & Hành chính (Operations & Admin)`
  5. `Kỹ sư Công nghệ & Phân tích Dữ liệu (IT & Data Specialist)`
* **Đánh giá mức độ hoàn thiện tính năng**: **HOÀN THÀNH TỐT**.

#### Đề xuất cải tiến dứt điểm (Theo chỉ đạo loại bỏ Job Grade):
1. **Xóa bỏ triệt để phân cấp Cấp bậc G1, G2, G3**:
   - Trước đây mỗi vị trí mẫu chia nhỏ thành 3 hàng G1/G2/G3 khiến ma trận bị rối và phình to gấp 3 lần.
   - **Cải tiến**: Mỗi vị trí tham chiếu chỉ hiển thị duy nhất **Mục tiêu cấp độ 6 Miền (Level 1 Foundation / Level 2 Intermediate / Level 3 Advanced)** tương ứng với lộ trình nghề nghiệp.
2. **Nút bấm & Hành động**:
   - Nút `"Áp dụng ma trận cho Khách hàng mới"`.
   - Modal tinh chỉnh ma trận năng lực 6 miền dạng thanh trượt (Slider 1 đến 3) trực quan, có biểu đồ Radar xem trước ngay lập tức.
* **Mức độ ưu tiên**: **P0 (Xóa sạch các nhãn G1-G3 trong màn hình này)**.

---

## 3. PHÂN NHÓM KHO KHÓA HỌC & BỘ CÔNG CỤ SOẠN THẢO BUILDER

### [PA-03] Thư viện Khóa học & [PA-12] Quản lý Phiên bản Nội dung (`/platform/versions`)
* **Vai trò**: `PLATFORM_ADMIN`.
* **Mục đích nghiệp vụ**: Quản lý vòng đời phát hành của 18 khóa học chuẩn (6 miền x 3 cấp độ F-I-A):
  - Theo dõi phiên bản nháp (`Draft`), phiên bản thử nghiệm (`Staging`), và phiên bản phát hành chính thức (`Published v2.1`).
  - Kiểm soát thay đổi ngân hàng câu hỏi Pre-assessment và Final Exam.
* **Đánh giá mức độ hoàn thiện tính năng**: **ĐẠT TỐT**.

#### Phân tích chi tiết 6 yếu tố thiết kế:
1. **Chữ hiển thị (Copywriting)**:
   - Thẻ khóa học hiển thị rõ: `Mã khóa (VD: DCL-F-01)`, `Tên khóa`, `Miền năng lực`, `Phiên bản hiện tại`, `Ngày phát hành gần nhất`.
2. **Nút bấm & Hành động (Buttons & CTAs)**:
   - Primary CTA: Nút `"Vào bộ soạn thảo (Course Builder)"` màu xanh Indigo nổi bật.
   - Secondary CTA: Nút `"Lịch sử phiên bản"`, `"Nhân bản khóa học"`.
3. **Bố cục & Phân chia khung (Layout & Grid)**:
   - Phân loại tab theo 6 Miền năng lực trên đỉnh (Filter Tabs dạng Segmented Control).
   - Lưới thẻ khóa học (Grid 3 cột) hiển thị ảnh thumbnail minh họa công nghệ, huy hiệu cấp độ F/I/A.
4. **Phối màu & Tương phản (Colors & Contrast)**:
   - Badge trạng thái phiên bản: `Xuất bản` (Xanh lá - Emerald), `Đang soạn thảo` (Vàng cam - Amber), `Lưu trữ` (Xám - Slate).
5. **Khoảng cách & Responsive (Spacing & Adaptive)**:
   - Grid tự co giãn từ 3 cột (màn hình rộng) sang 2 cột (laptop) và 1 cột (tablet).
* **Mức độ ưu tiên**: **P1**.

---

### [PA-04] Bộ công cụ Thiết kế & Soạn thảo Khóa học Course Builder (`/platform/builder`)
* **Vai trò**: `PLATFORM_ADMIN`.
* **Mục đích nghiệp vụ**: Màn hình làm việc quan trọng bậc nhất của đội ngũ học liệu. Cho phép:
  1. Xây dựng cấu trúc bài giảng (Mô đun -> Chương -> Bài học).
  2. Soạn thảo nội dung đa phương tiện (Video, Slide, Markdown, Code snippet).
  3. Cấu hình bài đánh giá Pre-assessment và ngân hàng đề thi Final Exam kèm rubric chấm điểm thực hành.
* **Đánh giá mức độ hoàn thiện tính năng**: **RẤT ĐẦY ĐỦ NHƯNG CẦN TINH GỌN GIAO DIỆN**.

#### Phân tích chi tiết và giải pháp tối ưu UI/UX:
1. **Chữ hiển thị (Copywriting)**:
   - Chuyển đổi các nhãn kỹ thuật phức tạp thành ngôn ngữ trực quan: `"Cấu hình chấm điểm AI"`, `"Trọng số câu hỏi"`, `"Yêu cầu nộp tệp minh chứng"`.
2. **Nút bấm & Hành động (Buttons & CTAs)**:
   - Thanh công cụ dính trên đỉnh (Sticky Top Bar): Nút `"Lưu nháp"`, `"Xem trước giao diện học viên (Learner Preview)"`, và nút `"Xuất bản phiên bản mới"`.
   - Kèm chỉ báo tự động lưu (`Đã lưu tự động lúc 10:45`).
3. **Bố cục & Phân chia khung (Layout & Grid - 3 Cột Studio)**:
   - **Cột trái (25%)**: Cây mục lục khóa học (Course Outline Tree) hỗ trợ kéo thả sắp xếp (Drag & Drop).
   - **Cột giữa (55%)**: Vùng soạn thảo nội dung trực quan (Rich Text / Video embed / Quiz config).
   - **Cột phải (20%)**: Bảng thuộc tính đối tượng (Thuộc tính bài học, thời lượng dự kiến, chuẩn đầu ra TT02 liên kết).
4. **Phối màu & Tương phản (Colors & Contrast)**:
   - Sử dụng tông màu Studio dịu mắt (`bg-slate-50` cho không gian làm việc, `bg-white` cho trang giấy soạn thảo).
5. **Khoảng cách & Responsive (Spacing & Adaptive)**:
   - Hỗ trợ nút thu gọn 2 cột bên để phóng to tối đa vùng soạn thảo (Zen Writing Mode).
* **Mức độ ưu tiên**: **P1 (Cực kỳ quan trọng để đảm bảo trải nghiệm tác giả)**.

---

## 4. PHÂN NHÓM QUẢN LÝ DOANH NGHIỆP KHÁCH HÀNG & NGƯỜI DÙNG

### [PA-05] Danh mục Doanh nghiệp Khách hàng (`/platform/organizations`) & [PA-06] Hồ sơ Doanh nghiệp 360 (`/platform/organizations/:id`)
* **Vai trò**: `PLATFORM_ADMIN`.
* **Mục đích nghiệp vụ**: Giám sát và quản lý các tổ chức / doanh nghiệp đã đăng ký sử dụng dịch vụ:
  - Xem thông tin pháp lý, hợp đồng, số lượng seat bản quyền (Số nhân viên được phép hoạt động).
  - Khóa tạm thời hoặc khôi phục hoạt động khi có yêu cầu hoặc quá hạn thanh toán.
  - Phân tích mức độ gắn kết học tập của từng doanh nghiệp.
* **Đánh giá mức độ hoàn thiện tính năng**: **ĐẠT TỐT**.

#### Phân tích chi tiết 6 yếu tố thiết kế:
1. **Chữ hiển thị (Copywriting)**:
   - Thông tin doanh nghiệp hiển thị rõ ràng: `Tên doanh nghiệp`, `Mã số thuế`, `Gói dịch vụ (Trial / Starter / Pro / Enterprise)`, `Số ghế sử dụng / tổng số mua`, `Hạn dùng`.
2. **Nút bấm & Hành động (Buttons & CTAs)**:
   - Nút `"Thêm tổ chức mới"`.
   - Nút `"Đăng nhập với tư cách Owner (Impersonate / Ghost Login)"` giúp Admin hỗ trợ kỹ thuật khách hàng chỉ với 1 cú click.
3. **Bố cục & Phân chia khung (Layout & Grid)**:
   - Trang chi tiết [PA-06] sử dụng bố cục Bento:
     - Khối thông tin hợp đồng và gói thuê bao bên trái.
     - Khối biểu đồ phân bổ học tập và danh sách phòng ban bên phải.
4. **Phối màu & Tương phản (Colors & Contrast)**:
   - Badge tình trạng: `Đang hoạt động` (Emerald), `Dùng thử` (Blue), `Quá hạn thanh toán` (Rose), `Đã khóa` (Slate).
5. **Khoảng cách & Responsive (Spacing & Adaptive)**:
   - Bảng danh sách doanh nghiệp có ô tìm kiếm tức thì theo tên công ty hoặc mã số thuế, tải dữ liệu mượt mà.
* **Mức độ ưu tiên**: **P1**.

---

### [PA-07] Quản lý Tài khoản Người dùng Toàn hệ thống (`/platform/users`) & [PA-08] Chi tiết Tài khoản (`/platform/users/:id`)
* **Vai trò**: `PLATFORM_ADMIN`.
* **Mục đích nghiệp vụ**: Tra cứu và hỗ trợ người dùng toàn cầu:
  - Đặt lại mật khẩu, mở khóa tài khoản bị khóa do đăng nhập sai nhiều lần.
  - Xem lịch sử hoạt động, kiểm tra các vai trò và phạm vi quyền được gán.
* **Đánh giá mức độ hoàn thiện tính năng**: **ĐẠT CHUẨN**.

#### Phân tích chi tiết 6 yếu tố thiết kế:
1. **Chữ hiển thị (Copywriting)**:
   - Cột thông tin: `Họ tên`, `Email`, `Tổ chức`, `Vai trò hệ thống (OWNER / MANAGER / EMPLOYEE / PLATFORM_ADMIN)`, `Trạng thái xác thực email`, `Lần đăng nhập cuối`.
   - **Tuyệt đối không hiển thị cột Cấp bậc G1-G3**.
2. **Nút bấm & Hành động (Buttons & CTAs)**:
   - Nút `"Gửi email đặt lại mật khẩu"`, `"Mở khóa tài khoản"`, `"Vô hiệu hóa"`.
3. **Bố cục & Phân chia khung (Layout & Grid)**:
   - Bảng dữ liệu có bộ lọc thông minh: Theo tổ chức, theo vai trò, theo trạng thái hoạt động.
4. **Phối màu & Tương phản (Colors & Contrast)**:
   - Font chữ đơn sắc cho email và ngày giờ, độ tương phản cao, dễ nhìn.
* **Mức độ ưu tiên**: **P1**.

---

## 5. PHÂN NHÓM QUẢN LÝ THƯƠNG MẠI & BẢNG GIÁ DỊCH VỤ

### [PA-09] Quản lý Thương mại, Doanh thu & Bảng giá Dịch vụ (`/platform/commerce`)
* **Vai trò**: `PLATFORM_ADMIN`.
* **Mục đích nghiệp vụ**: Quản trị chính sách giá và theo dõi doanh thu thanh toán trực tuyến:
  - Cấu hình các gói dịch vụ doanh nghiệp (Giá trên mỗi người học / tháng, chính sách giảm giá theo số lượng ghế).
  - Theo dõi danh sách đơn hàng checkout thành công, tra cứu mã giao dịch VNPay/VietQR/Stripe.
* **Đánh giá mức độ hoàn thiện tính năng**: **ĐẠT CHUẨN**.

#### Phân tích chi tiết 6 yếu tố thiết kế:
1. **Chữ hiển thị (Copywriting)**:
   - Thẻ chỉ số tài chính: `Tổng doanh thu lũy kế`, `MRR (Doanh thu định kỳ hàng tháng)`, `Số đơn hàng thành công`, `Tỷ lệ chuyển đổi dùng thử sang trả phí`.
2. **Nút bấm & Hành động (Buttons & CTAs)**:
   - Nút `"Cập nhật biểu phí"`, `"Tạo mã ưu đãi (Voucher Code)"`.
3. **Bố cục & Phân chia khung (Layout & Grid)**:
   - Tab 1: Danh sách Đơn đặt hàng & Thanh toán.
   - Tab 2: Cấu hình Bảng giá và Tính năng mở rộng cho từng gói.
4. **Phối màu & Tương phản (Colors & Contrast)**:
   - Biểu đồ tài chính xanh lục ngọc (`Emerald-600`) tạo cảm giác tin cậy và tích cực.
* **Mức độ ưu tiên**: **P1**.

---

## 6. PHÂN NHÓM TÀI KHOẢN & BẢO MẬT QUẢN TRỊ

### [SHR-01] Hồ sơ Quản trị viên (`/platform/profile`), [SHR-02] Trung tâm Bảo mật, & [SHR-03] Thông báo Quản trị
* **Vai trò**: `PLATFORM_ADMIN`.
* **Mục đích nghiệp vụ**: Bảo vệ tài khoản đặc quyền cao nhất của nền tảng:
  - Thiết lập xác thực 2 yếu tố (2FA TOTP qua Google Authenticator / Authy).
  - Quản lý phiên đăng nhập chủ động và thu hồi token từ xa.
  - Cấu hình nhận thông báo khẩn khi có sự cố hệ thống hoặc thanh toán lỗi.
* **Đánh giá mức độ hoàn thiện tính năng**: **ĐẠT TỐT**.
* **Đề xuất cải tiến**:
  - Tích hợp cảnh báo mã QR quét 2FA trực tiếp trong modal sắc nét.
  - Nhóm thông báo thành 3 luồng: `Vận hành`, `Bảo mật`, `Kinh doanh`.
* **Mức độ ưu tiên**: **P2**.

---

## TỔNG KẾT HÀNH ĐỘNG CHO PLATFORM ADMIN CONSOLE:
1. **P0 (Cốt lõi)**: Xóa bỏ toàn bộ tàn dư nhãn Cấp bậc G1, G2, G3 trong [PA-13] Reference Positions và [PA-07] User Management.
2. **P1 (Nghiệp vụ)**: Tối ưu Course Builder [PA-04] với bố cục 3 cột Studio mượt mà, phân loại 18 khóa học chuẩn theo 6 Miền năng lực TT02 trong [PA-03].
3. **P2 (Nâng cao)**: Tối ưu ngăn kéo xem Payload JSON trong Nhật ký hệ thống [PA-10] và tích hợp 2FA cho [SHR-02].
