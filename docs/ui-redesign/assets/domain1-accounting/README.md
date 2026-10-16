# Bộ ảnh Kế toán · Lĩnh vực I

99 ảnh PNG minh họa riêng từng slide của 9 mô đun thuộc ba cấp M1-F, M1-I, M1-A. Ảnh thay đổi chủ thể và góc chụp theo ý của slide; tiêu đề, chú giải và sơ đồ chính xác vẫn lấy từ học liệu Pulse. Xem toàn bộ tại `docs/ui-redesign/23-domain1-accounting-visual-gallery.html`.

Các ảnh được tạo bằng công cụ imagegen tích hợp, theo brief: ảnh hiện thực đồ vật nghiệp vụ Kế toán, giấy tờ/hồ sơ/sổ cái, không có người hoặc logo, bảng màu Pulse. Chứng từ và con số mờ trong ảnh chỉ là **đạo cụ giả lập**, không dùng làm dữ liệu nguồn, ví dụ tính toán hoặc minh chứng kết quả. Nhãn, thứ tự, số liệu và điều kiện đánh giá chính xác nằm ở phần HTML/CSS của slide.

| Ảnh | Chủ đề |
|---|---|
| `m1-f-m01.png` | Từ nhu cầu tìm đến hóa đơn gốc |
| `m1-f-m02.png` | Kiểm tra nguồn đáng tin cậy |
| `m1-f-m03.png` | Lưu trữ và tìm lại tài liệu |
| `m1-i-m01.png` | Kế hoạch tìm và điều kiện dừng |
| `m1-i-m02.png` | So sánh hai nguồn với chứng từ gốc |
| `m1-i-m03.png` | Kho thông tin và phân quyền |
| `m1-a-m01.png` | Nghiên cứu đa nguồn cho quyết định |
| `m1-a-m02.png` | Kiểm tra chất lượng dữ liệu |
| `m1-a-m03.png` | Quản trị và vòng đời dữ liệu |

Mỗi tên ảnh trên có thêm ba biến thể `-v2`, `-v3`, `-v4` cho slide 04, 07, 09 và bảy ảnh `-s02`, `-s03`, `-s05`, `-s06`, `-s08`, `-s10`, `-s11` cho các slide còn lại. Hàm `accountingPhoto` trong `pulse-domain1-depth.js` là ánh xạ chung cho trang học Pulse, bản học liệu HTML và gallery. Brief sinh ảnh riêng từng slide nằm trong `export-domain1-accounting-photo-briefs.cjs`.

## Brief tạo ảnh

**Quy tắc chung đã dùng:** Ảnh tĩnh vật giáo dục tỷ lệ 4:3; giấy tờ, sổ sách và vật dụng Kế toán trông có thật; nền sáng `#F6F8FD`, xanh đêm `#142550`, xanh điện `#3450C6`, điểm nhấn san hô `#FF8A6C` và teal `#157D74`; ánh sáng ban ngày mềm. Không có người, logo, giao diện ứng dụng giả hoặc biểu đồ chứa dữ liệu bịa. Chữ và số trên đạo cụ, nếu xuất hiện, không được dùng làm nội dung bài học.

**Chủ thể từng ảnh:**

1. M1-F/M01: Từ tập hóa đơn chưa phân loại, qua kính tìm và tiêu chí kỳ/nhà cung cấp, tới một chứng từ gốc trong hộp lưu.
2. M1-F/M02: Chứng từ gốc có dấu vết đơn vị/kỳ bên cạnh một bản sao thiếu ngữ cảnh; kính lúp kiểm nguồn trước khi dùng.
3. M1-F/M03: Chứng từ được sắp vào thư mục, sổ đăng ký và khóa quyền xem.
4. M1-I/M01: Yêu cầu rộng được chuyển thành ma trận từ khóa và tập nguồn có điều kiện dừng.
5. M1-I/M02: Hai tài liệu trên bảng kẹp được đối chiếu với sổ cái và chứng từ gốc; không vẽ biểu đồ số liệu.
6. M1-I/M03: Tủ hồ sơ, sổ đăng ký và ba mức chìa khóa thể hiện cấu trúc kho và giới hạn quyền.
7. M1-A/M01: Quyết định được đặt trước; sổ cái, hóa đơn và sao kê ngân hàng được truy về để đối chiếu đa nguồn.
8. M1-A/M02: Sổ cái dưới đèn kiểm tra với sáu điểm soi; chứng từ và khay ngoại lệ gợi việc đánh giá chất lượng.
9. M1-A/M03: Nguồn chính thức, từ điển dữ liệu, quyền vai trò, lưu trữ và xử lý cuối vòng đời; hình không quy định thời hạn lưu.
