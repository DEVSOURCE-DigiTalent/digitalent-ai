# Kiểm tra luồng năng lực và quyền học của Pulse

**Phạm vi:** bản xem trước tương tác [Pulse](14-pulse-product-site/index.html), kiểm tra năng lực ban đầu ngày 13/10/2026 và kiểm tra lại luồng suất học ngày 14/10/2026. Nguồn yêu cầu là hai tài liệu luồng do chủ dự án cung cấp cùng các quyết định sau đó. Đây là kết quả cho bản mẫu dùng `localStorage`, **chưa phải xác nhận ứng dụng chính**. Xem [đặc tả luồng hiện hành](16-pulse-product-flow-detailed.md) để có đủ điều kiện và route.

## Quy tắc đã kiểm tra

- Trong mỗi lĩnh vực, bản Pulse giữ riêng **mức đầu vào → mức đã xác nhận → mục tiêu vị trí**. Bài đầu vào dùng câu hỏi tình huống theo lĩnh vực và cấp thuộc mục tiêu vị trí; để được ghi mức L2/L3 phải trả lời đúng liên tiếp từ L1.
- Hoàn thành nội dung, qua câu hỏi mô đun, mua/giữ suất hoặc nộp bài cuối khóa **không** nâng mức đã xác nhận. Quản lý đúng phòng ban duyệt bài cuối khóa thì cấp của khóa được xác nhận; mức hiện tại chỉ tăng nếu cấp này cao hơn mức cũ. Minh chứng công việc được duyệt là nguồn xác nhận riêng. Mức đầu vào không bị ghi đè.
- Khóa Cơ bản miễn phí toàn bộ. Khóa Trung cấp/Nâng cao cần **một suất cho một người trong một khóa**, thuộc đúng phòng ban. Có thể mua suất trước khi công bố khung; sau khi công bố và có người đúng vị trí, hệ thống giữ suất. Khi người đó đã làm bài đầu vào và khóa cấp trước cùng lĩnh vực đã được duyệt, suất tự kích hoạt và toàn bộ khóa được mở mà không cần chủ doanh nghiệp cấp lại.
- Khoảng cách năng lực còn lại lấy mức đã xác nhận so với mục tiêu vị trí. Mức chưa đo được hoặc bằng 0 là **chờ xác nhận**, không đếm như khoảng cách đã đo. Bài chưa được duyệt, bị trả lại hoặc gắn cờ không nâng mức.

**Ví dụ năng lực:** Mia có mức đầu vào L1, mục tiêu L2 ở Dữ liệu và thông tin. Duyệt khóa Cơ bản L1 giữ mức đã xác nhận ở L1. Suất Trung cấp L2 đã mua/giữ tự mở sau khi đủ điều kiện; học và nộp bài không nâng mức. Khi quản lý duyệt bài cuối Trung cấp, mức đã xác nhận lên **L2**, khoảng cách từ **1 xuống 0**, mức đầu vào vẫn L1.

**Ví dụ quyền học:** doanh nghiệp mua một suất Nội dung số · Trung cấp rồi công bố mục tiêu L2 cho vị trí thuộc phòng Tiếp thị. Nhân viên Tiếp thị phù hợp làm bài đầu vào, học Cơ bản và được quản lý duyệt. Suất đã giữ tự kích hoạt để mở toàn bộ Trung cấp. Nếu hai người phù hợp nhưng chỉ có một suất, người còn lại chưa thể học đầy đủ cho tới khi được ưu tiên suất chưa kích hoạt hoặc doanh nghiệp mua thêm.

## Ma trận kiểm tra bản xem trước

| Luồng | Kết quả | Ý nghĩa nghiệp vụ |
| --- | --- | --- |
| Đăng ký dùng thử → công bố khung → tạo quản lý/nhân viên | Đạt | Dùng thử kích hoạt sau xác minh mô phỏng; không cần duyệt, không hết hạn; giới hạn 10 nhân viên chung toàn doanh nghiệp. |
| Trần Digital AI ≥ doanh nghiệp ≥ phòng ban ≥ vị trí | Đạt | Mức con không vượt cha; quản lý đề xuất, chủ doanh nghiệp công bố. |
| Bài đầu vào theo vị trí → so mức đầu vào/mục tiêu | Đạt | Câu hỏi chỉ ở lĩnh vực/cấp thuộc vị trí; tính mức liên tiếp đúng từ L1, giữ kết quả đầu vào riêng. |
| Mua suất trước khung → công bố → giữ suất theo phòng ban/vị trí | Đạt | Tự chọn phòng ban khi chỉ có một phòng phù hợp; nhiều phòng cần chủ doanh nghiệp chọn; không vượt số suất. |
| Duyệt Cơ bản → tự kích hoạt Trung cấp đã giữ | Đạt | Sau bài đầu vào và khóa cấp trước được duyệt, nhân viên mở toàn bộ khóa đã mua; không cần thao tác cấp suất lần hai. |
| Suất thuộc phòng ban khác hoặc đã dùng | Đạt | Không mượn suất khác phòng và không cấp trùng một suất đã kích hoạt. |
| Mô đun → câu hỏi → bài cuối → quản lý duyệt | Đạt | Bài cuối chỉ mở đúng khóa sau ba mô đun; duyệt mới xác nhận cấp năng lực. |
| Trung cấp L2 được duyệt từ mức L1 | Đạt | Mức đã xác nhận L1 → L2, khoảng cách giảm; mức đầu vào giữ L1; các vai trò và báo cáo dùng cùng kết quả. |
| Báo cáo theo vai trò | Đạt | Quản lý chỉ thấy phòng ban mình, chủ doanh nghiệp thấy toàn công ty. |
| Gán cả phòng ban/nhiều nhân viên | Đạt | Xem người sẵn sàng/bị loại, chặn thiếu suất, sai mục tiêu vị trí hoặc thiếu khóa cấp trước. |
| Lần nộp đầu chưa đạt → chờ/hạn → lần hai chưa đạt | Đạt trong kiểm tra luồng trước | Không nâng mức; quá hạn hoặc hai lần chưa đạt chuyển sang hỗ trợ theo chính sách mẫu. |

Bộ kiểm tra hiện hành: `node docs/ui-redesign/14-pulse-product-site/audit-vi.cjs`. Lần chạy 14/10/2026 đã duyệt **83 trang/trạng thái**, không có lỗi JavaScript; kiểm tra mua/giữ/tự mở suất, bài học đến duyệt và mức L1 → L2, cùng phạm vi báo cáo. Các bộ kiểm tra cũ dùng nhãn giao diện tiếng Anh thuộc phiên bản trước; kết quả lịch sử của chúng không thay thế kiểm tra hiện hành.

## Giới hạn trước khi triển khai ứng dụng chính

- Câu hỏi đầu vào và học liệu là ví dụ minh họa, chưa có ngân hàng đề, thang đo kiểm định hoặc lưu phiên bản nội dung học.
- Gợi ý AI, thanh toán, gửi lời mời, tải minh chứng và chứng nhận là mô phỏng. Quyền quản lý, giữ/kích hoạt suất, quyết định chấm và công thức mức năng lực/khoảng cách phải được thực thi ở máy chủ.
- Bản mẫu giữ mức cao nhất đã được xác nhận; chưa có chính sách hết hạn bằng chứng, thu hồi quyết định hoặc đánh giá lại làm giảm mức. Các trường hợp này cần quy tắc và nhật ký kiểm toán trước khi dùng thật.
