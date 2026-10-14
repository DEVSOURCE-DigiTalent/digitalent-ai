# DigiTalent Pulse · Hướng dẫn bản xem trước

Mở [index.html](index.html) bằng Edge hoặc Chrome. Đây là **web thiết kế tương tác bằng tiếng Việt**, chạy bằng `localStorage` trong trình duyệt. Bản này không gọi API của ứng dụng chính, không gửi email, không thanh toán hoặc thay đổi dữ liệu doanh nghiệp thật.

Tài liệu nghiệp vụ đầy đủ: [Đặc tả luồng chi tiết](../16-pulse-product-flow-detailed.md). Route và một số khóa dữ liệu trong mã giữ tên kỹ thuật bằng tiếng Anh; nội dung người dùng nhìn thấy đã được Việt hóa.

## Chọn hành trình để xem

- **Dùng thử miễn phí:** doanh nghiệp mẫu *Northstar Studio* có khung năng lực, phòng ban, quản lý, nhân viên và tiến độ khóa Cơ bản để duyệt từng vai trò. Doanh nghiệp mới được kích hoạt ngay sau bước xác minh email mô phỏng; không có hàng chờ duyệt, không giới hạn thời gian và có tối đa **10 nhân viên trên tất cả phòng ban**.
- **Đã mua khóa:** doanh nghiệp mẫu *Northstar Growth* có **ba suất** Dữ liệu và thông tin · Trung cấp. Mia đã có quyền học đầy đủ; hai suất còn lại dành cho nhân viên đủ điều kiện. Đây là suất của **một khóa**, không phải gói mở toàn bộ danh mục.
- **Bắt đầu từ đầu:** tạo doanh nghiệp tại `#/register`, xác minh tại `#/verify`, thiết lập và công bố khung tại `#/setup`, rồi gán quản lý và thêm nhân viên tại `#/people`. Bản xem trước không gửi lời mời thật.

## Luồng mua và tự mở khóa có phí

1. Chủ doanh nghiệp có thể xem đề cương, bài mẫu và đánh giá minh họa của khóa Trung cấp/Nâng cao, rồi mua mô phỏng một hoặc nhiều **suất theo khóa**. Có thể mua **trước** khi thiết lập/công bố khung năng lực.
2. Chủ doanh nghiệp đặt mục tiêu cho từng vị trí theo quy tắc **mục tiêu vị trí ≤ trần phòng ban ≤ trần doanh nghiệp ≤ trần Digital AI**, rồi công bố khung. Phòng ban xác định phạm vi phân bổ suất; vị trí xác định lĩnh vực và cấp khóa mà nhân viên cần học.
3. Nếu lượt mua chưa chọn phòng ban và chỉ một phòng ban có vị trí phù hợp, bản xem trước tự gắn suất vào phòng ấy. Nếu nhiều phòng ban phù hợp, chủ doanh nghiệp chọn tại trang khóa. Khi có nhân viên đúng phòng ban và vị trí, hệ thống **giữ suất** cho người phù hợp; nếu thiếu suất, chủ doanh nghiệp thấy số thiếu và có thể mua thêm hoặc ưu tiên người nhận trước khi kích hoạt.
4. Nhân viên làm **bài đầu vào dạng câu hỏi tình huống** theo mục tiêu vị trí, xem mức đầu vào so với mục tiêu và học khóa Cơ bản miễn phí. Khóa Trung cấp cần khóa Cơ bản **cùng lĩnh vực** được quản lý duyệt; khóa Nâng cao cần Trung cấp được duyệt.
5. Khi đã công bố khung, làm bài đầu vào, đủ điều kiện khóa cấp trước và có suất giữ đúng người/phòng ban, hệ thống **tự kích hoạt suất**, tạo lượt học và mở **toàn bộ** mô đun, câu hỏi, bài cuối khóa có phí. Chủ doanh nghiệp không phải cấp suất thêm lần nữa. Mỗi suất phục vụ một người trong một khóa; suất đã kích hoạt không chuyển sang phòng ban khác.

Chủ doanh nghiệp cũng có thể vào **Nhóm đào tạo** để chọn cả phòng ban hoặc nhiều nhân viên, giao một khóa chung hoặc khóa tiếp theo trên lộ trình riêng của từng người. Giao diện hiện người sẵn sàng/người bị loại và lý do, kiểm tra bài đầu vào, mục tiêu vị trí, khóa cấp trước và số suất đúng phòng ban trước khi gán. Đây là cách quản lý nhóm, không phải bước bắt buộc để kích hoạt suất đã tự giữ.

## Học, đánh giá và báo cáo

Mỗi khóa mẫu có **ba mô đun**; mỗi mô đun có ba trang nội dung và hai câu ôn tập. Cần đạt 2/2 câu để hoàn thành mô đun; sau ba mô đun, nhân viên nộp **bài cuối của đúng khóa**. Quản lý phòng ban xem minh chứng và gợi ý AI minh họa, rồi tự quyết định duyệt hoặc yêu cầu sửa, kèm lý do. Lần đầu chưa đạt có thời gian chờ **48 giờ** và hạn nộp lại **7 ngày sau khi mở** theo cấu hình mẫu; lần hai chưa đạt tạo cờ hỗ trợ.

Ba mốc năng lực được giữ riêng: **mức đầu vào → mức đã xác nhận → mục tiêu vị trí**. Mua suất, xem bài, qua câu hỏi hoặc gửi bài cuối **không** nâng mức đã xác nhận. Khi quản lý duyệt bài cuối khóa, cấp khóa có thể nâng mức đã xác nhận nếu cao hơn mức cũ; mức đầu vào không đổi. Chủ doanh nghiệp thấy báo cáo toàn doanh nghiệp sau khi có khóa được duyệt, còn quản lý chỉ thấy phòng ban mình. Khóa Cơ bản và khóa đã mua dùng cùng luồng học, chấm và báo cáo.

Nhân viên dùng ba mục điều hướng chính **Hôm nay / Lộ trình / Thực hành**; trang chi tiết khóa và trang học mở theo ngữ cảnh. Chủ doanh nghiệp, quản lý và quản trị nền tảng có hồ sơ vai trò và các màn phù hợp phạm vi. Nhiệm vụ thực tế/minh chứng là nhánh riêng với bài cuối khóa.

## Giới hạn bản xem trước

- Câu hỏi đầu vào, nội dung 18 khóa, gợi ý AI, đánh giá người học và thanh toán đều là dữ liệu/tương tác minh họa. Hiện có slide; chưa có video thật.
- CSV được đọc tại máy; lời mời, xác minh, phục hồi tài khoản, tệp minh chứng và chứng nhận không có dịch vụ thật. Phân quyền bằng trạng thái trình duyệt không thay thế quyền ở máy chủ.
- Dữ liệu lưu trong **một trình duyệt**. Tải lại tab sau khi mã web thay đổi; thao tác đặt lại dữ liệu mẫu sẽ xóa trạng thái xem trước cục bộ.
- Khi triển khai ứng dụng chính cần kiểm tra quyền học theo suất, phân quyền quản lý, kết quả bài đầu vào, quyết định chấm và lịch sử năng lực tại API/máy chủ.

Kiểm tra luồng hiện tại bằng `node docs/ui-redesign/14-pulse-product-site/audit-vi.cjs` từ gốc repository. Bộ kiểm tra duyệt các route chính và luồng mua → giữ suất → bài đầu vào → duyệt khóa Cơ bản → tự mở khóa Trung cấp → quản lý duyệt → cập nhật năng lực/báo cáo.
