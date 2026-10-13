# Pulse quality pass — bản duyệt trước khi áp dụng

## Bản mở để duyệt

- [Public, Owner, Manager và Platform Admin](06-pulse-flow-studio.html)
- [Employee learning](07-employee-learning-preview.html)
- [Danh mục nhiệm vụ và route của 63 màn](11-screen-task-inventory.md)
- [Kế hoạch và tiêu chí nghiệm thu](10-ui-quality-roadmap.md)

Toàn bộ giao diện mẫu hiển thị bằng tiếng Anh. Dữ liệu, giá, tiến độ, đánh giá khóa học và quyết định trên màn là minh họa. Prototype chạy trực tiếp bằng trình duyệt và không gửi yêu cầu tới API.

## Những gì đã làm trong vòng này

1. **Cấu trúc chung:** rút gọn phần mở đầu lặp trên Owner/Manager và các trang chức năng Public/Admin; trên điện thoại đặt lựa chọn vai trò và màn hình cạnh nhau. Tăng cỡ chữ nhỏ trong nội dung và điều khiển. Bổ sung focus rõ hơn.
2. **Manager MG-01:** thay ba thẻ số và hàng chờ lặp nhau bằng một việc ưu tiên, hồ sơ năng lực liên quan và hai việc tiếp theo. Giữ màu nền Manager dịu; san hô nhấn việc khẩn.
3. **Owner OW-02 và Manager MG-02:** bản đồ sáu lĩnh vực/24 năng lực có số gap và số chưa xác nhận bằng chữ. Chi tiết mức hiện tại, mức mục tiêu và nguồn xác nhận xuất hiện cạnh bản đồ trên desktop; trên điện thoại chọn lĩnh vực sẽ đưa focus tới chi tiết. Owner thấy ba hành động tiếp theo gắn trực tiếp với hồ sơ.
4. **Owner OW-07/OW-13:** luồng CSV vẫn có tải mẫu, kiểm tra từng dòng và xác nhận tổng số; trang khóa học đặt bộ chọn khóa sớm hơn trên mobile. Quyền mẫu giữ nguyên: Basic mở hết, khóa trả phí chưa mua mở một bài mẫu, khóa đã mua mở hết trong prototype.
5. **Employee EM-01:** sửa tràn ngang trên điện thoại và rút ngắn vùng minh họa để hành động học tiếp và phần việc hôm nay xuất hiện sớm hơn; vẫn giữ không gian học riêng và tranh trừu tượng.
6. **Public/Admin:** trang khám phá khóa có điểm nhấn hình ảnh cùng quy tắc miễn phí/trả phí; trang Admin thể hiện phiên bản và bản nháp; các trang nghiệp vụ Admin dùng tiêu đề ngắn để dữ liệu xuất hiện sớm. Bảng 18 khóa cuộn trong vùng riêng trên điện thoại và có hướng dẫn cuộn.

## Kiểm tra đã chạy

### Cập nhật Employee: không gian học trên một trang

Bản [Employee hiện tại](07-employee-learning-preview.html) đã gom 12 trạng thái vào ba mục Today, Path, Practice. Bản [gallery cũ](07-employee-learning-screen-gallery.html) giữ lại để so sánh. **Course overview** ở panel trong trang; [bài học chi tiết](08-employee-lesson-preview.html?course=communication&lesson=3) mở trên trang riêng có mục lục, nội dung, ví dụ, bài áp dụng và câu hỏi tự kiểm tra. Minh chứng, phản hồi, chứng chỉ và tài khoản vẫn mở ở panel. Hash `#EM-01` đến `#EM-12` từ bản flow tổng vẫn dẫn đúng ngữ cảnh, riêng `#EM-06` chuyển sang trang bài học. Kiểm tra mới chạy ở 1440, 768, 390 và 360 px: không tràn ngang, ảnh chính tải được, không lỗi JavaScript; đã kiểm tra khóa Basic mở bài đầy đủ, khóa Advanced chưa có ghế chỉ xem outline, bộ lọc, đáp án, minh chứng mẫu, phản hồi và các deep link.

Các số liệu trong bảng bên dưới thuộc đợt đánh giá trước khi gom Employee thành một trang; phần Owner, Manager, Public và Admin không đổi trong cập nhật này.

| Kiểm tra | Kết quả |
| --- | --- |
| 51 màn chính + 12 màn Employee tại 1440, 768, 390 và 360 px | 252 lần kiểm tra; không lỗi JavaScript và không có tràn ngang toàn trang. Bảng so sánh khóa và lộ trình học có vùng cuộn ngang có chủ ý. |
| Kích thước chữ trong nội dung và điều khiển nhìn thấy được | Không còn phần chữ được kiểm tra dưới 12 px; đoạn văn nhỏ được nâng lên 13 px. |
| Chọn lĩnh vực năng lực trên mobile | Chi tiết đổi sang lĩnh vực được chọn và nhận focus. |
| Bản đồ Owner | Đủ 24 ô năng lực và ba quyết định dẫn sang chức năng liên quan. |
| CSV minh họa | Một dòng hợp lệ và một dòng sai được phân loại đúng. |
| Quyền xem khóa | Basic: 4/4 bài mở; trả phí chưa mua: 1/4 bài mở; khóa mẫu đã mua: 4/4 bài mở. |

## Các điểm cần đánh giá cùng người dùng

- Với **Manager**: tìm bài cần xử lý, mở minh chứng, hiểu tiêu chí và đưa quyết định có lý do.
- Với **Owner**: từ gap của một nhân viên đi tới yêu cầu vị trí, khóa phù hợp và quyền mua; nhập một CSV có lỗi và sửa trước khi gửi.
- Với **Employee**: từ trang Today bắt đầu bài tiếp theo, tìm việc thực hành, đọc phản hồi và biết lý do khóa bị khóa.
- Với **Admin**: phân biệt bản đang phát hành với bản nháp, hiểu phạm vi thay đổi trước khi phát hành.

Đo tỉ lệ hoàn thành, thời gian, số lần phải hỏi người hướng dẫn và điểm thẩm mỹ bằng cùng bộ nhiệm vụ trước và sau. Chưa thể xác nhận mục tiêu 9/10 chỉ bằng ảnh chụp hay kiểm tra tự động.

## Trước khi chuyển sang ứng dụng thật

Người dùng cần duyệt hướng thiết kế này trước khi thay `frontend/src` hoặc `backend/src`, theo yêu cầu duyệt prototype trước đó. Giai đoạn triển khai cần đối chiếu route trong [danh mục 63 màn](11-screen-task-inventory.md) với router hiện tại; thêm trạng thái loading/empty/error/permission; kiểm tra WCAG 2.2 AA bằng bàn phím và công cụ đọc màn hình; đo Core Web Vitals trên ứng dụng thật.

Mô hình mua theo khóa và ghế ở bản mẫu là đề xuất sản phẩm. Ứng dụng hiện có plans/subscriptions, nên quy tắc giá, thanh toán, API entitlement, chuyển đổi gói và review học viên xác thực phải được chốt trước khi triển khai. Bản preview chưa thay đổi logic hay dữ liệu của ứng dụng chính.
