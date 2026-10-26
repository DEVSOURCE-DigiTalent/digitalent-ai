# BÁO CÁO RÀ SOÁT & PHÂN TÍCH UI/UX CHI TIẾT: CỔNG CHỦ DOANH NGHIỆP & NHÂN SỰ (OWNER & HR PORTAL)

> **Môi trường khảo sát**: DigiTalent AI Enterprise Portal (`/enterprise/*`)  
> **Tài khoản kiểm thử**: `owner@digitalent.ai` (CEO Nguyễn Thế Hùng), `hr@digitalent.ai` (Trưởng phòng NS Phạm Quỳnh Nga)  
> **Nguyên tắc thiết kế**: UI/UX Pro Max (B2B SaaS Bento-Grid), Hallmark (Anti-Text Overload, Zero Slop), Taste Skill & Impeccable (WCAG AA, Pixel-perfect Spacing, Responsive).  
> **Quyết định kiến trúc đặc biệt**: **LOẠI BỎ HOÀN TOÀN CẤP BẬC (JOB GRADE G1–G3)** theo yêu cầu của Giám đốc. Dọn dẹp màn hình `OW-12` và các cột/bộ lọc cấp bậc trên toàn bộ giao diện để tập trung 100% vào **Ma trận 6 Miền năng lực số TT02**.

---

## MỤC LỤC CÁC MÀN HÌNH KHẢO SÁT (TỪ OW-01 ĐẾN OW-47)

- [1. Phân nhóm Tổng quan & Thiết lập nền móng (`OW-01`, `OW-05`)](#1-phân-nhóm-tổng-quan--thiết-lập-nền-móng)
- [2. Phân nhóm Cơ cấu Tổ chức & Phân quyền (`OW-02`, `OW-03`, `OW-06`, `OW-07`, `OW-09`, `OW-10`, `OW-12`, `OW-13`)](#2-phân-nhóm-cơ-cấu-tổ-chức--phân-quyền)
- [3. Phân nhóm Khung chuẩn Năng lực & Yêu cầu vị trí (`OW-14`, `OW-15`, `OW-16`, `OW-17`, `OW-18`)](#3-phân-nhóm-khung-chuẩn-năng-lực--yêu-cầu-vị-trí)
- [4. Phân nhóm Hồ sơ & Khoảng cách Năng lực (`OW-19`, `OW-20`, `OW-21`, `OW-22`)](#4-phân-nhóm-hồ-sơ--khoảng-cách-năng-lực)
- [5. Phân nhóm Chương trình Đào tạo & Khóa học (`OW-23` đến `OW-34`)](#5-phân-nhóm-chương-trình-đào-tạo--khóa-học)
- [6. Phân nhóm Nhiệm vụ thực tế & Minh chứng (`OW-35` đến `OW-39` - Dùng chung Work)](#6-phân-nhóm-nhiệm-vụ-thực-tế--minh-chứng)
- [7. Phân nhóm Chứng nhận số, Báo cáo & Cài đặt (`OW-40` đến `OW-47`, `SHR-01` đến `SHR-03`)](#7-phân-nhóm-chứng-nhận-số-báo-cáo--cài-đặt)

---

## 1. PHÂN NHÓM TỔNG QUAN & THIẾT LẬP NỀN MÓNG

### [OW-01] Bàn làm việc Tổng quan Doanh nghiệp (`/enterprise/dashboard`)
* **Vai trò**: `OWNER` (CEO), `HR` (Trưởng phòng Nhân sự).
* **Mục đích nghiệp vụ**: Bàn làm việc trung tâm (Executive Command Center) giúp Chủ doanh nghiệp nắm bắt ngay lập tức 4 trọng số: Tỷ lệ phủ năng lực tổ chức, Hạn mức bản quyền sử dụng, Việc cần xử lý ngay (Bài tập chờ duyệt), và Quy trình 6 bước triển khai.
* **Đánh giá mức độ hoàn thiện tính năng**: **ĐẠT XUẤT SẮC** sau khi nâng cấp lên Bento-Grid.

#### Phân tích chi tiết 6 yếu tố thiết kế:
1. **Chữ hiển thị (Copywriting)**:
   - *Trước đây*: Khối chữ triết lý dài dòng chiếm 40% màn hình (*"Thiết lập mục tiêu. Xem khoảng cách năng lực. Chọn khóa học tiếp theo..."*).
   - *Hiện tại*: Đã thay bằng thẻ Executive Banner ngắn gọn: `"Quản trị Lộ trình & Năng lực số Doanh nghiệp"`, phụ đề 1 câu súc tích. Các thẻ KPI ghi rõ: `Tài khoản bản quyền`, `Phòng ban & Vị trí`, `Minh chứng chờ duyệt`, `Đợt đào tạo kích hoạt`.
2. **Nút bấm & Hành động (Buttons & CTAs)**:
   - Primary CTA: Nút `"Báo cáo chu kỳ"` (Blue-600) góc trên phải.
   - Quick Action: Nút `"Thêm nhân sự"` (`/enterprise/members`) và nút `"Khám phá khóa học"` (`/enterprise/courses`).
   - Mỗi thẻ Bento đều có 1 text link hành động kèm icon `ChevronRight` dẫn thẳng đến trang quản lý tương ứng.
3. **Bố cục & Phân chia khung (Layout & Grid)**:
   - Grid 4 cột đều đặn (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`).
   - Phía trên là Banner tổng quan + 2 mini radial widget (Độ phủ năng lực, Tỷ lệ hoàn thành).
   - Ở giữa là Stepper quy trình 6 bước (`OwnerProcessTrack`).
   - Phía dưới chia 2 cột cân xứng: Kiến trúc năng lực tổ chức + Vòng đời đào tạo gần đây.
4. **Phối màu & Tương phản (Colors & Contrast)**:
   - Nền trang `bg-slate-50`, thẻ card `bg-white` viền `border-slate-200/80`.
   - Màu sắc ngữ nghĩa nổi bật: Bản quyền (Blue `#2563EB`), Phòng ban (Emerald `#059669`), Minh chứng chờ duyệt (Amber `#D97706`), Đợt đào tạo (Indigo `#4F46E5`). Đạt độ tương phản WCAG AAA.
5. **Khoảng cách & Responsive (Spacing & Adaptive)**:
   - Desktop 1920: Hiển thị trọn vẹn toàn bộ thông tin quan trọng mà không cần cuộn trang nhiều.
   - Laptop 1366: Tự động co giãn padding từ `p-6` xuống `p-5`, nội dung hiển thị sắc nét.
   - Tablet 768: Chuyển thành 2 cột cân đối, thanh Stepper 6 bước tự động bẻ thành 2 dòng × 3 cột gọn gàng.
* **Mức độ ưu tiên**: **ĐÃ TỐI ƯU (P0 Done)**.

---

### [OW-05] Thiết lập Kiến trúc & Trần Năng Lực (`/enterprise/setup`)
* **Vai trò**: `OWNER`, `HR`.
* **Mục đích nghiệp vụ**: Thể hiện "Lý thuyết trần nhà" (Ceiling Theory). Doanh nghiệp và từng phòng ban tự chọn cấp trần khóa học mở (tối đa cấp 3) cho 6 miền năng lực Thông tư 02. Đảm bảo quy tắc: `Trần phòng ban ≤ Trần doanh nghiệp ≤ Trần DigiTalent`.
* **Đánh giá mức độ hoàn thiện tính năng**: **HOÀN THÀNH TỐT** (Đã sửa lỗi console duplicate key và lọc chuẩn 6 miền).

#### Phân tích chi tiết 6 yếu tố thiết kế:
1. **Chữ hiển thị (Copywriting)**:
   - Tiêu đề đã chuẩn hóa: `"Kiến trúc Năng lực & Trần Khóa học Doanh nghiệp"`.
   - *Cần tối ưu thêm*: Khối giải thích bên phải (`.cc-side`) vẫn còn 3 đoạn văn dài về quy tắc trần nhà và dữ liệu thử nghiệm. Nên chuyển thành dạng danh sách gạch đầu dòng (bullet points) có icon trực quan: 📌 *Quy tắc kế thừa*, 💡 *Nguồn gợi ý*.
2. **Nút bấm & Hành động (Buttons & CTAs)**:
   - Nút chọn phạm vi (Tabs): `Cả doanh nghiệp` và danh sách các phòng ban. Trạng thái `aria-pressed` hiển thị rõ ràng.
   - Nút hành động dưới ma trận: `Lưu trần doanh nghiệp` (Primary Blue-600) và `Hủy` (Ghost).
   - Nút gợi ý: `Dùng mức tổng hợp theo vị trí` và `Dùng mẫu DigiTalent` hoạt động chuẩn.
3. **Bố cục & Phân chia khung (Layout & Grid)**:
   - 2 cột: Cột trái (Ma trận năng lực 6 miền × 3 cấp độ F-I-A) chiếm 60%; Cột phải (Quy tắc & Gợi ý tham chiếu) chiếm 40%.
   - Bảng so sánh nguồn tham khảo đặt gọn gàng phía dưới.
4. **Phối màu & Tương phản (Colors & Contrast)**:
   - Ô trong lộ trình: Xanh Navy đậm (`#1E40AF`), chữ trắng rõ ràng.
   - Ô trong trần doanh nghiệp: Nền xanh nhạt (`#EFF6FF`), viền xanh mềm.
   - Ô ngoài trần: Viền nét đứt màu xám trung tính (`#CBD5E1`), thể hiện khóa chưa mở.
5. **Khoảng cách & Responsive (Spacing & Adaptive)**:
   - Đã bọc ma trận trong container `.cc-mx-container` có `min-width: 440px`. Khi xem trên Tablet (768px), bảng tự động cho phép cuộn ngang độc lập, không làm tràn vỡ layout trang.
* **Mức độ ưu tiên**: **P1 (Tinh gọn thêm text khối hướng dẫn bên phải)**.

---

## 2. PHÂN NHÓM CƠ CẤU TỔ CHỨC & PHÂN QUYỀN

### [OW-02] Danh sách Thành viên (`/enterprise/members`)
* **Vai trò**: `OWNER`, `HR`.
* **Mục đích nghiệp vụ**: Quản lý toàn bộ nhân sự trong tổ chức. Phân quyền vai trò (Owner, Manager, Employee), gán phòng ban, gán vị trí công việc, theo dõi tỷ lệ phủ năng lực cá nhân và trạng thái kích hoạt lời mời.
* **Đánh giá mức độ hoàn thiện tính năng**: Đầy đủ tính năng, nhưng **CẦN DỌN DẸP CỘT CẤP BẬC (JOB GRADE)**.

#### Phân tích chi tiết 6 yếu tố thiết kế:
1. **Chữ hiển thị (Copywriting)**:
   - Cần xóa bỏ cột `"Cấp bậc"` (hiện đang hiển thị G1, G2, G3) theo chỉ đạo bỏ Job Grade.
   - Thanh tìm kiếm: Đổi placeholder từ `"Tìm kiếm..."` thành `"Tìm theo tên, email hoặc mã nhân viên..."`.
2. **Nút bấm & Hành động (Buttons & CTAs)**:
   - Nút chính: `"Mời thành viên"` (Primary Blue-600) đặt ở vị trí trên cùng bên phải.
   - Hành động trên từng dòng: Cột menu 3 chấm thao tác nhanh (Đổi vai trò, Gán phòng ban, Gán vị trí, Thu hồi lời mời, Vô hiệu hóa tài khoản).
3. **Bố cục & Phân chia khung (Layout & Grid)**:
   - Bảng dữ liệu (Data Table) phân trang, kèm thanh bộ lọc phía trên (Lọc theo Phòng ban, Lọc theo Vai trò, Lọc theo Trạng thái).
   - Xóa bỏ dropdown bộ lọc Cấp bậc (G1-G3) khỏi thanh filter toolbar.
4. **Phối màu & Tương phản (Colors & Contrast)**:
   - Badge vai trò: `OWNER` (Tím nhạt `#FAF5FF` / chữ tím `#7C3AED`), `MANAGER` (Xanh dương `#EFF6FF` / chữ xanh `#2563EB`), `EMPLOYEE` (Xám Slate `#F1F5F9` / chữ `#475569`).
   - Badge trạng thái: Hoạt động (Xanh lá `#ECFDF5`), Chờ kích hoạt (Vàng `#FFFBEB`).
5. **Khoảng cách & Responsive (Spacing & Adaptive)**:
   - Thêm class `overflow-x-auto` cho table container.
   - Cố định cột đầu (Avatar & Tên nhân viên) dạng `sticky left-0 bg-white` khi cuộn ngang trên tablet.
* **Mức độ ưu tiên**: **P0 (Xóa bỏ cột & bộ lọc Cấp bậc G1-G3)**.

---

### [OW-03] Chi tiết Thành viên (`/enterprise/members/:id`)
* **Vai trò**: `OWNER`, `HR`.
* **Mục đích nghiệp vụ**: Xem toàn cảnh 360 độ về 1 nhân viên: Thông tin hành chính, phòng ban, vị trí công việc, lộ trình học tập, lịch sử nộp bài tập thực hành và tiến độ đạt chuẩn 6 miền năng lực.
* **Đánh giá mức độ hoàn thiện tính năng**: Đạt tốt.
* **Đề xuất cải tiến**:
  - Bỏ trường `"Cấp bậc: G1/G2/G3"` khỏi thẻ thông tin chung.
  - Tinh gọn tab `Năng lực`: Hiển thị ma trận 6 miền trực quan (Radar chart hoặc Bar chart) thay vì danh sách text dài.
* **Mức độ ưu tiên**: **P1**.

---

### [OW-06] Danh sách Phòng ban (`/enterprise/departments`) & [OW-07] Chi tiết Phòng ban (`/enterprise/departments/:id`)
* **Vai trò**: `OWNER`, `HR`.
* **Mục đích nghiệp vụ**: Quản lý cơ cấu phòng ban công ty (Phòng KD, Marketing, Nhân sự, Tài chính, Ban Giám Đốc). Gán Trưởng phòng (Manager phụ trách) và theo dõi số lượng nhân sự, số lượng vị trí trực thuộc phòng ban.
* **Đánh giá mức độ hoàn thiện tính năng**: Đạt chuẩn.
* **Đề xuất cải tiến**:
  - Danh sách phòng ban nên hỗ trợ 2 chế độ hiển thị: Dạng lưới thẻ (Card Grid) cho trực quan và Dạng bảng (Table View) cho quản trị nhanh.
  - Trên mỗi thẻ phòng ban: Hiển thị rõ Avatar Trưởng phòng (hoặc cảnh báo màu cam: `"Chưa gán Trưởng phòng"` để nhắc Owner chỉ định người chấm bài).
* **Mức độ ưu tiên**: **P1**.

---

### [OW-09] Danh sách Vị trí Công việc (`/enterprise/positions`) & [OW-10] Chi tiết Vị trí (`/enterprise/positions/:id`)
* **Vai trò**: `OWNER`, `HR`.
* **Mục đích nghiệp vụ**: Quản lý danh mục các chức danh nghề nghiệp trong công ty (Ví dụ: Chuyên viên Kế toán, Nhân viên Kinh doanh, Trưởng phòng Marketing...). Gắn vị trí với phòng ban và liên kết trực tiếp với **Bộ yêu cầu năng lực (Requirement Set)**.
* **Đánh giá mức độ hoàn thiện tính năng**: Đầy đủ tính năng.
* **Đề xuất cải tiến dứt điểm**:
  - **Xóa bỏ triệt để cột Cấp bậc (G1-G3)** trong bảng vị trí công việc.
  - Trong Modal tạo/sửa vị trí: Bỏ trường chọn Cấp bậc G1-G3.
  - Bổ sung nút liên kết nhanh: `"Thiết lập mục tiêu năng lực"` dẫn thẳng sang `OW-17` (`/enterprise/requirements/builder`).
* **Mức độ ưu tiên**: **P0 (Loại bỏ G1-G3)**.

---

### [OW-12] Cấu hình Cấp bậc (`/enterprise/positions/grades`)
* **Tình trạng hiện tại**: Đã được gắn cờ `status: 'RETIRED'` trong mã nguồn sitemap.
* **HÀNH ĐỘNG DỨT ĐIỂM**:
  - **Xóa bỏ hoàn toàn khỏi menu điều hướng và sitemap**.
  - Không cho phép người dùng truy cập route này nữa (Redirect tự động về `/enterprise/positions`).
  - Gỡ bỏ hoàn toàn logic Job Grade G1-G3 để giao diện tinh gọn, không còn tàn dư của cách phân cấp cũ.
* **Mức độ ưu tiên**: **P0 (Thực hiện dọn dẹp code & điều hướng)**.

---

### [OW-13] Phân quyền Quản lý (`/enterprise/access`)
* **Vai trò**: `OWNER`.
* **Mục đích nghiệp vụ**: Chỉ định nhân sự nào giữ vai trò `MANAGER` và quản lý phòng ban cụ thể nào. Quản lý phân quyền hệ thống cho vai trò Nhân sự (`HR`).
* **Đánh giá mức độ hoàn thiện tính năng**: Hoạt động tốt.
* **Đề xuất cải tiến**:
  - Giao diện dạng 2 bảng rõ ràng: Bảng 1 (Danh sách Manager và phòng ban phụ trách); Bảng 2 (Danh sách HR và quyền hạn tổ chức).
  - Tránh các khối giải thích phân quyền dài dòng, thay bằng tooltip giải thích quyền hạn khi rê chuột.
* **Mức độ ưu tiên**: **P1**.

---

## 3. PHÂN NHÓM KHUNG CHUẨN NĂNG LỰC & YÊU CẦU VỊ TRÍ

### [OW-14] Khung chuẩn Năng lực số TT02 (`/enterprise/framework`) & [OW-15] Chi tiết Năng lực (`/enterprise/framework/:id`)
* **Vai trò**: `OWNER`, `HR`.
* **Mục đích nghiệp vụ**: Xem toàn bộ thư viện 6 miền và 24 năng lực thành phần của Thông tư 02/2025/TT-BGDĐT. Giúp doanh nghiệp hiểu chuẩn năng lực số quốc gia trước khi áp dụng vào vị trí công việc.
* **Đánh giá mức độ hoàn thiện tính năng**: Đạt chuẩn.
* **Đề xuất cải tiến**:
  - Chia 6 miền năng lực thành 6 Accordion hoặc Tabs hiện đại. Mỗi miền hiển thị số lượng năng lực con (VD: Miền 1 có 3 năng lực, Miền 2 có 6 năng lực).
  - Thu gọn các đoạn mô tả định nghĩa dài trong Điều 2 Thông tư 02 thành nút `"Xem chi tiết chuẩn"` dạng modal hoặc drawer trượt bên phải, tránh làm trang bị dài hàng nghìn pixel.
* **Mức độ ưu tiên**: **P1**.

---

### [OW-16] Yêu cầu theo Vị trí (`/enterprise/requirements`) & [OW-17] Trình thiết lập Yêu cầu (`/enterprise/requirements/builder`)
* **Vai trò**: `OWNER`, `HR`.
* **Mục đích nghiệp vụ**: **TRÁI TIM NGHIỆP VỤ CỦA HỆ THỐNG**. Cho phép doanh nghiệp thiết lập mức cần đạt (Cơ bản - 1, Trung cấp - 2, Nâng cao - 3) cho từng năng lực trên từng vị trí công việc, sau đó bấm `"Công bố (Publish)"` để sinh ra lộ trình học cho nhân viên.
* **Đánh giá mức độ hoàn thiện tính năng**: Chức năng hoạt động rất tốt, nhưng giao diện builder khá nhiều bảng số liệu.

#### Phân tích chi tiết 6 yếu tố thiết kế:
1. **Chữ hiển thị (Copywriting)**:
   - Các cột mức cần đạt: Giữ rõ ràng `Cơ bản (1)`, `Trung cấp (2)`, `Nâng cao (3)`.
   - Bỏ các đoạn văn lý thuyết về nguồn gốc dữ liệu.
2. **Nút bấm & Hành động (Buttons & CTAs)**:
   - Nút chính: `"Công bố bộ yêu cầu"` (Primary Blue-600) đặt nổi bật ở thanh sticky bar trên cùng.
   - Nút phụ: `"Áp dụng gợi ý theo mẫu chuẩn"` (Secondary) để tự động điền mức chuẩn theo 5 vị trí tham chiếu DigiTalent.
3. **Bố cục & Phân chia khung (Layout & Grid)**:
   - 6 miền năng lực phân nhóm rõ ràng theo từng block thẻ.
   - Có thanh tiến độ cố định: `"Đã thiết lập 24/24 năng lực · Sẵn sàng công bố"`.
4. **Khoảng cách & Responsive**:
   - Khi màn hình nhỏ co lại, các nút chọn mức 1 - 2 - 3 nên thiết kế dạng Toggle Button Group (Segmented Controls) to rõ để dễ bấm bằng chuột hoặc cảm ứng.
* **Mức độ ưu tiên**: **P1 (Làm đẹp UI Builder dạng Segmented Controls)**.

---

### [OW-18] Lịch sử Phiên bản Yêu cầu (`/enterprise/requirements/history`)
* **Vai trò**: `OWNER`, `HR`.
* **Mục đích nghiệp vụ**: Theo dõi audit log các lần thay đổi mục tiêu năng lực của vị trí (Ai đổi, đổi mức nào sang mức nào, vào ngày giờ nào).
* **Đánh giá**: Hoạt động đầy đủ, bảng dữ liệu sạch sẽ.
* **Mức độ ưu tiên**: **P2**.

---

## 4. PHÂN NHÓM HỒ SƠ & KHOẢNG CÁCH NĂNG LỰC

### [OW-19] Hồ sơ Năng lực (`/enterprise/competency-profiles`) & [OW-20] Chi tiết Hồ sơ (`/enterprise/competency-profiles/:employeeId`)
* **Vai trò**: `OWNER`, `HR`.
* **Mục đích nghiệp vụ**: Xem năng lực thực tế hiện tại của từng nhân viên sau khi làm bài kiểm tra đầu vào hoặc hoàn thành khóa học.
* **Đề xuất cải tiến**:
  - Bổ sung thanh đo trực quan: Thanh Progress Bar thể hiện tỷ lệ % năng lực đã xác nhận so với mục tiêu vị trí.
  - Màu sắc: Năng lực đạt chuẩn (Xanh lá `#059669`), Năng lực còn thiếu (Đỏ hồng `#E11D48`).
* **Mức độ ưu tiên**: **P1**.

---

### [OW-21] Khoảng cách Năng lực Tổ chức (Skill Gap Analytics) (`/enterprise/skill-gap`) & [OW-22] Chi tiết Khoảng cách (`/enterprise/skill-gap/:employeeId`)
* **Vai trò**: `OWNER`, `HR`.
* **Mục đích nghiệp vụ**: Màn hình phân tích tình báo đào tạo (Intelligence). Giúp lãnh đạo nhận diện ngay phòng ban nào, vị trí nào đang thiếu hụt kỹ năng nghiêm trọng (High Risk Gap) để ưu tiên phân bổ ngân sách đào tạo.
* **Đánh giá mức độ hoàn thiện tính năng**: Rất mạnh về phân tích số liệu.

#### Phân tích chi tiết 6 yếu tố thiết kế:
1. **Chữ hiển thị (Copywriting)**:
   - Thay các thuật ngữ kỹ thuật như `"Calculate Run"` thành `"Tính toán lại khoảng cách năng lực"`.
   - Badge cảnh báo: `"Thiếu hụt nghiêm trọng (≥ 2 cấp)"`, `"Thiếu hụt nhẹ (1 cấp)"`, `"Đạt chuẩn"`.
2. **Nút bấm & Hành động (Buttons & CTAs)**:
   - Primary CTA: Nút `"Tạo đợt đào tạo từ khoảng thiếu này"` (Chuyển nhanh sang màn `OW-26`).
3. **Bố cục & Ma trận Heatmap**:
   - Ma trận nhiệt (Heatmap) giữa Nhân viên và 6 Miền năng lực cần có thanh cuộn ngang độc lập `overflow-x-auto`, cố định cột tên nhân viên bên trái.
   - Bỏ hoàn toàn cột và bộ lọc Cấp bậc G1-G3.
* **Mức độ ưu tiên**: **P0 (Bỏ filter G1-G3 & Thêm nút tạo đợt học nhanh)**.

---

## 5. PHÂN NHÓM CHƯƠNG TRÌNH ĐÀO TẠO & KHÓA HỌC

### [OW-23] Thư viện Khóa học Chuẩn (`/enterprise/courses`) & [OW-24] Chi tiết Khóa học (`/enterprise/courses/:id`)
* **Vai trò**: `OWNER`, `HR`.
* **Mục đích nghiệp vụ**: Duyệt kho 18 khóa học chuẩn hóa theo Khung năng lực số TT02 (từ M1-F đến M6-A). Xem giáo trình, bài giảng, bài tập thực hành và tiêu chí chấm điểm cuối khóa.
* **Đánh giá**: Hoạt động mượt mà.
* **Đề xuất cải tiến**:
  - Thiết kế thẻ khóa học dạng Card hiện đại: Có badge cấp độ (F: Xanh lá, I: Xanh dương, A: Cam), thời lượng học ước tính, số lượng mô đun.
  - Nút bấm: `"Xem chi tiết khóa học"`, `"Phân công cho nhân viên"`.
* **Mức độ ưu tiên**: **P1**.

---

### [OW-25] Danh sách Đợt Đào tạo (`/enterprise/training-batches`) & [OW-26] Tạo Đợt Đào tạo (`/enterprise/training-batches/new`) & [OW-27] Chi tiết Đợt (`/enterprise/training-batches/:id`)
* **Vai trò**: `OWNER`, `HR`.
* **Mục đích nghiệp vụ**: Quản lý các chiến dịch đào tạo có thời hạn (Ví dụ: "Đợt chuẩn hóa năng lực số Q4/2026 cho Phòng Kinh doanh"). Đặt thời hạn hoàn thành, phân bổ nhân sự và theo dõi tiến độ hoàn thành theo thời gian thực.
* **Đánh giá**: Chức năng hoạt động chuẩn xác.
* **Đề xuất cải tiến**:
  - Giao diện Wizard tạo đợt học (`OW-26`): Chia 3 bước rõ ràng: `1. Đặt tên & Thời hạn` -> `2. Chọn khóa học` -> `3. Chọn danh sách nhân viên tham gia`.
  - Trên màn chi tiết (`OW-27`): Bổ sung biểu đồ tiến độ dạng Donut/Radial chart hiển thị tỷ lệ nhân viên đã hoàn thành đợt học.
* **Mức độ ưu tiên**: **P1**.

---

### [OW-28] Phân công Đào tạo (`/enterprise/assignments`) & [OW-29] Đề xuất Học tập AI (`/enterprise/assignments/recommendations`)
* **Vai trò**: `OWNER`, `HR`.
* **Mục đích nghiệp vụ**: Quản lý việc giao khóa học cho nhân viên. Tính năng AI Recommendations tự động phân tích khoảng trống của từng người để gợi ý giao đúng khóa học còn thiếu với 1 cú click `"Duyệt đề xuất"`.
* **Đánh giá**: Tính năng rất hữu ích. Cần làm nổi bật nút `"Giao hàng loạt theo đề xuất AI"`.
* **Mức độ ưu tiên**: **P1**.

---

### [OW-30] Theo dõi Tiến độ (`/enterprise/training-monitor`) & [OW-34] Kết quả Đánh giá (`/enterprise/assessment-results`)
* **Vai trò**: `OWNER`, `HR`.
* **Mục đích nghiệp vụ**: Dashboard giám sát học tập theo thời gian thực. Ai đang học, ai sắp quá hạn (Overdue), ai đã hoàn thành bài thi trắc nghiệm và tự luận.
* **Đề xuất cải tiến**:
  - Bổ sung bộ lọc nhanh: `"Sắp quá hạn (< 3 ngày)"`, `"Đã hoàn thành"`, `"Chưa bắt đầu"`.
  - Cảnh báo màu đỏ nổi bật cho những nhân viên quá hạn nộp bài.
* **Mức độ ưu tiên**: **P1**.

---

### [OW-31] Khóa học Nội bộ (`/enterprise/internal-courses`), [OW-32] Soạn thảo Khóa (`/enterprise/internal-courses/:id/edit`), [OW-33] Chi tiết Khóa (`/enterprise/internal-courses/:id`)
* **Vai trò**: `OWNER`, `HR`.
* **Mục đích nghiệp vụ**: Cho phép doanh nghiệp tự đưa các tài liệu đào tạo, quy trình nội bộ của công ty lên hệ thống để đào tạo kết hợp cùng các khóa chuẩn TT02.
* **Đánh giá**: Hoạt động ổn định.
* **Mức độ ưu tiên**: **P2**.

---

## 6. PHÂN NHÓM NHIỆM VỤ THỰC TẾ & MINH CHỨNG (DÙNG CHUNG WORK)

### [OW-35] Nhiệm vụ Thực tế (`/enterprise/tasks`) & [OW-36] Giao Nhiệm vụ (`/enterprise/tasks/new`) & [OW-37] Chi tiết Nhiệm vụ (`/enterprise/tasks/:id`)
* **Vai trò**: `OWNER`, `HR`, `MANAGER` (Alias: `MG-08`, `MG-09`, `MG-10`).
* **Mục đích nghiệp vụ**: Giao các bài toán thực tế ngoài công việc (Action Learning) cho nhân viên giải quyết để lấy minh chứng thực tế (Evidence-based evaluation).
* **Đánh giá**: Hoạt động tốt.
* **Đề xuất cải tiến**:
  - Thẻ nhiệm vụ hiển thị rõ hạn chót nộp bài, tệp đính kèm và tiêu chí chấm điểm.
* **Mức độ ưu tiên**: **P1**.

---

### [OW-38] Hàng đợi Đánh giá Minh chứng (`/enterprise/reviews`) & [OW-39] Chấm Minh chứng (`/enterprise/reviews/:submissionId`)
* **Vai trò**: `OWNER`, `HR`, `MANAGER` (Alias: `MG-11`, `MG-12`).
* **Mục đích nghiệp vụ**: Nơi người quản lý/nhân sự thẩm định bài nộp của nhân viên (file tài liệu, video, đường link sản phẩm thực tế) để quyết định cấp điểm đạt hoặc yêu cầu nộp lại.
* **Đánh giá**: Cần giao diện chấm 2 cột: Cột trái xem file nộp của nhân viên; Cột phải nhập điểm 4 tiêu chí và lý do nhận xét.
* **Mức độ ưu tiên**: **P1**.

---

## 7. PHÂN NHÓM CHỨNG NHẬN SỐ, BÁO CÁO & CÀI ĐẶT

### [OW-46] Danh sách Chứng chỉ Số (`/enterprise/certificates`) & [OW-47] Chi tiết Chứng chỉ (`/enterprise/certificates/:id`)
* **Vai trò**: `OWNER`, `HR`.
* **Mục đích nghiệp vụ**: Quản lý toàn bộ chứng nhận số đã cấp cho nhân viên sau khi hoàn thành khóa học và đạt chuẩn năng lực. Mỗi chứng chỉ có mã Hash và mã QR tra cứu công khai.
* **Đánh giá**: Đạt chuẩn. Có nút `"Tải PDF"` và `"Xem trang tra cứu QR công khai"`.
* **Mức độ ưu tiên**: **P1**.

---

### [OW-40] Báo cáo & Phân tích Chu kỳ (`/enterprise/reports`)
* **Vai trò**: `OWNER`, `HR`.
* **Mục đích nghiệp vụ**: Báo cáo tổng kết theo tháng/quý cho Ban Giám đốc: Mức độ tăng trưởng năng lực số toàn công ty, tỷ lệ hoàn thành, phân tích ROI chi phí đào tạo trên từng đầu nhân sự.
* **Đề xuất cải tiến**:
  - Bổ sung nút `"Xuất báo cáo PDF / Excel"` ở góc trên phải.
  - Các biểu đồ cột/tròn cần có tooltip giải thích số liệu chi tiết khi rê chuột.
* **Mức độ ưu tiên**: **P1**.

---

### [OW-41] Gói dịch vụ (`/enterprise/subscription`), [OW-42] Hạn mức Bản quyền (`/enterprise/subscription/usage`), [OW-43] Lịch sử Hóa đơn (`/enterprise/subscription/billing`)
* **Vai trò**: `OWNER`.
* **Mục đích nghiệp vụ**: Quản lý gói thuê bao doanh nghiệp (Enterprise Tier), số lượng tài khoản (Seats) đã mua, dung lượng lưu trữ bài giảng và tải hóa đơn VAT.
* **Đánh giá**: Đạt chuẩn.
* **Mức độ ưu tiên**: **P2**.

---

### [OW-44] Cài đặt Tổ chức (`/enterprise/settings`) & [OW-45] Nhật ký Kiểm toán (`/enterprise/settings/audit-log`)
* **Vai trò**: `OWNER`.
* **Mục đích nghiệp vụ**: Cập nhật logo công ty, tên tổ chức, domain tùy chỉnh và xem lịch sử truy cập, thay đổi dữ liệu của toàn bộ quản trị viên.
* **Đánh giá**: Hoạt động tốt.
* **Mức độ ưu tiên**: **P2**.

---

### [SHR-01] Hồ sơ Cá nhân (`/enterprise/account`), [SHR-02] Bảo mật (`/enterprise/account/security`), [SHR-03] Thông báo (`/enterprise/notifications`)
* **Vai trò**: Mọi người dùng trong phân hệ Enterprise (`OWNER`, `HR`, `MANAGER`, `EMPLOYEE`).
* **Mục đích nghiệp vụ**: Quản lý thông tin tài khoản cá nhân, đổi mật khẩu và xem danh sách thông báo hệ thống.
* **Đánh giá**: Đạt chuẩn.
* **Mức độ ưu tiên**: **P2**.

---

## BẢNG TỔNG HỢP HÀNH ĐỘNG CẢI TIẾN TRỌNG TÂM CỔNG OWNER / HR

| STT | Mã màn hình | Tên màn hình | Vấn đề cốt lõi cần xử lý | Hành động kỹ thuật cụ thể | Mức ưu tiên |
|:---:|---|---|---|---|:---:|
| 1 | `OW-12` | Cấu hình cấp bậc | Không còn dùng mô hình Job Grade G1-G3 | **Xóa bỏ vĩnh viễn khỏi menu & sitemap**, redirect về `/positions`. | **P0** |
| 2 | `OW-02` | Danh sách thành viên | Cột Cấp bậc G1-G3 gây thừa thông tin | Xóa bỏ cột Cấp bậc và dropdown filter G1-G3. | **P0** |
| 3 | `OW-09` | Vị trí công việc | Cột Cấp bậc G1-G3 không còn giá trị | Xóa cột Cấp bậc trong bảng và trong Modal tạo vị trí. | **P0** |
| 4 | `OW-21` | Khoảng cách năng lực | Filter Cấp bậc G1-G3 gây rối mắt | Bỏ filter G1-G3; bổ sung nút "Tạo đợt học nhanh". | **P0** |
| 5 | `OW-05` | Kiến trúc trần năng lực | Text hướng dẫn cột phải còn dài dòng | Thu gọn thành các bullet point trực quan có icon. | **P1** |
| 6 | `OW-17` | Builder yêu cầu vị trí | Bảng số liệu dài | Chuyển các nút chọn mức 1-2-3 thành Segmented Control hiện đại. | **P1** |
| 7 | `OW-26` | Tạo đợt đào tạo | Form dài 1 trang | Chia thành Wizard 3 bước rõ ràng có tiến trình. | **P1** |
| 8 | `OW-40` | Báo cáo chu kỳ | Thiếu nút xuất dữ liệu | Bổ sung nút Xuất PDF / Excel phục vụ họp giao ban. | **P1** |
