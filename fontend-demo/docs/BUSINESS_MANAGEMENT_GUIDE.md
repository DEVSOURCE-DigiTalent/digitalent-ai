# Không gian quản lý doanh nghiệp

Trang doanh nghiệp được tổ chức lại cho người mua và quản lý đào tạo. Đăng nhập quản trị → tổng quan → cấu hình gói → mời nhân viên → phân bổ khóa → theo dõi → xem năng lực và phản hồi thực hành.

## Menu chính

| Mục | Công việc |
|---|---|
| Tổng quan | Nhân viên đã được cấp khóa, hoàn thành, quá hạn, bài chờ duyệt, mức đáp ứng có minh chứng và việc cần xử lý |
| Nhân viên | Tìm nhân viên, xem tiến độ, mời email và chọn khóa khởi đầu, thu hồi lời mời, phân phòng ban |
| Tiến độ đào tạo | Lọc nhân viên/trạng thái, xem hạn và lần học gần nhất, thu hồi phân bổ; theo dõi, giao và phản hồi bài thực hành |
| Năng lực doanh nghiệp | Tổng hợp theo lĩnh vực/vị trí, hồ sơ từng người, yêu cầu vị trí có phiên bản và khoảng thiếu |
| Khóa học & phân bổ | Lọc cấp độ, đọc đề cương/đầu ra, xem gói phù hợp, chọn nhân viên và hạn học |
| Gói học & chi phí | Mua/gia hạn Growth, cấu hình số khóa/người và danh mục tài trợ, xem đơn và chi phí doanh nghiệp |
| Cấu hình doanh nghiệp | Sửa hồ sơ tổ chức, thêm/sửa vị trí và đặc thù, định biên, mức ưu tiên, chuẩn khảo sát nội bộ, thiết lập hiển thị và nhật ký quản lý |

## Các cấu hình được giữ lại

- **Thông tin doanh nghiệp**: tên, ngành nghề, quy mô và chi phí giờ công tham khảo. Quy mô khai báo không tự tăng số chỗ trong gói học.
- **Vị trí & đặc thù doanh nghiệp**: thêm vị trí, sửa tên/đặc thù, số người dự kiến và ưu tiên P1–P3. Sửa vị trí giữ nguyên mã liên kết với nhân viên, hồ sơ và khung đã có.
- Mở từng vị trí → **Mức yêu cầu & trọng số khảo sát nội bộ** để sửa mức 1–6, trọng số cân bằng 100% và năng lực cốt lõi như trang cũ. Đây là chuẩn khảo sát nội bộ; không tự quy đổi thành mức DigComp 3.0. Thay đổi chuẩn sẽ tính lại so sánh khảo sát theo chuẩn hiện tại.
- **Khung yêu cầu theo vị trí** dẫn đến phần soạn yêu cầu có phiên bản trong Năng lực doanh nghiệp; dữ liệu này độc lập với chuẩn khảo sát nội bộ.
- Nhân viên/phòng ban ở **Nhân viên**; danh mục tài trợ và số khóa/người ở **Gói học & chi phí**. Có lối tắt ngay trong trang cấu hình.
- Các thao tác lưu cấu hình chỉ cập nhật trường liên quan trên bản ghi mới nhất, giữ nguyên gói, nhân viên, đơn hàng và dữ liệu học đã lưu.

Không gian này không có thao tác vào lớp để học dưới tài khoản quản trị, làm khảo sát thay nhân viên, biên tập giáo trình, ngân hàng đáp án hoặc xuất bản khóa. Muốn tự học, người quản trị chọn **Tài khoản quản trị → Cá nhân & mục tiêu nghề nghiệp** để chuyển rõ sang ngữ cảnh cá nhân.

## Mua và cấp học

1. Vào **Gói học & chi phí**. Gói thử có 5 chỗ và tối đa 2 khóa cơ bản/người; Growth có 20 chỗ, tối đa 10 khóa/người.
2. Chọn danh mục tài trợ và số khóa/người, lưu chương trình.
3. Vào **Nhân viên**, mở biểu mẫu mời email, chọn vị trí và khóa khởi đầu. Nhân viên phải xác nhận lời mời.
4. Vào **Khóa học & phân bổ**, chọn khóa, thêm vào danh mục nếu cần, chọn nhân viên và hạn học.
5. Khi khóa cần Growth, chuyển tới trang gói doanh nghiệp để mua; thanh toán thành công mới nâng quyền. FE hiện mua theo gói, chưa hỗ trợ doanh nghiệp mua lẻ một khóa nhiều chỗ.
6. Nhân viên học bằng tài khoản của mình. Quản trị theo dõi kết quả trong **Tiến độ đào tạo**.

Doanh nghiệp mẫu giữ việc thêm hồ sơ và cấp mã đăng nhập demo. Luồng mua gói và mời email đầy đủ cần tài khoản doanh nghiệp đã đăng ký/xác thực.

## Cách tính tổng quan

- Tiến độ chỉ lấy enrollment gắn đúng assignment, employee và course của doanh nghiệp. Bỏ khóa bị thu hồi và lượt tự học không được doanh nghiệp giao.
- Tỷ lệ hoàn thành = lượt được giao đã hoàn thành / lượt được giao còn hiệu lực. Không có phân bổ thì chưa có tỷ lệ.
- Quá hạn: chưa hoàn thành và ngày đến hạn trước ngày hiện tại; ngày hôm nay chưa bị xem là quá hạn.
- Năng lực: đối chiếu profile đã xác nhận với từng yêu cầu của khung ACTIVE theo vị trí. Hiển thị riêng tiêu chí có minh chứng, đạt yêu cầu và chưa có minh chứng. Không quy điểm khảo sát thành mức xác nhận.
- Số tiêu chí là tổng các yêu cầu gắn với từng nhân viên, không phải số năng lực duy nhất trong khung. Chưa có khung không tính là đã đạt.
- Khảo sát trước/sau nằm trong mục tham khảo riêng, chỉ dùng nhân viên có đủ hai lần đánh giá. Không suy rộng ra quy mô khai báo.
- Chi phí chỉ cộng đơn team PAID của đúng doanh nghiệp; không cộng đơn cá nhân, thất bại hoặc hủy. Đây là giao dịch demo.

## Thay đổi kỹ thuật

`App.jsx` đưa quản trị vào `BusinessManagementWorkspace.jsx`; các đường mở khóa của quản trị chuyển tới phần phân bổ. Trang cũ `EnterpriseWorkspace` và luồng `DeploymentWorkspace` không còn được dùng làm điểm vào doanh nghiệp. Các phần quản lý nhân sự, hồ sơ, khung và thẩm định hữu ích được tái sử dụng; dữ liệu đã lưu vẫn được đọc.

`businessDashboard.js` tổng hợp cohort theo phân bổ để giữ số liệu nhất quán. Có test riêng cho dữ liệu tự học, thu hồi, người ngoài doanh nghiệp, thời hạn và minh chứng chưa đầy đủ. Bộ render SSR kiểm tra đủ 7 mục doanh nghiệp và không có nút vào lớp/biên tập.

Giới hạn: toàn bộ vẫn là FE demo; email/thanh toán mô phỏng, chưa xác thực quyền ở server. Công cụ browser trong phiên sửa này lỗi thiếu runtime, nên xác minh bằng build, test và SSR; chưa kiểm tra click/layout trực quan.
