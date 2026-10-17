# Đăng ký và đăng nhập doanh nghiệp · Pulse

## Đối chiếu tham khảo

| Sản phẩm | Cách bắt đầu được công bố | Bài học áp dụng cho DigiTalent Pulse |
| --- | --- | --- |
| [Slack](https://slack.com/help/articles/206845317-Create-a-Slack-workspace-Create-a-Slack-workspace) | Bắt đầu bằng email, xác minh rồi tạo workspace; người tạo là Primary Owner. | Tách danh tính chủ sở hữu khỏi bước thiết lập workspace và mời thành viên. |
| [Asana](https://help.asana.com/s/article/your-asana-account?language=en_US) | Tài khoản cần tên và email; email công việc gắn với tổ chức. | Giải thích lợi ích của email công việc, nhưng không chặn các địa chỉ khác khi API hiện chưa áp dụng chính sách domain. |
| [Atlassian](https://support.atlassian.com/jira-cloud-administration/docs/set-up-jira-products/) | Có thể bắt đầu bằng email hợp lệ; cấu hình site ở bước sau. | Chỉ hỏi thông tin cần để tạo tài khoản trước, chuyển cấu hình chuyên môn sang onboarding. |

Đây là so sánh về trình tự trải nghiệm, không phải yêu cầu DigiTalent phải sao chép chính sách tài khoản của các nền tảng trên.

## Dữ liệu hệ thống hiện cần

| Thời điểm | Trường | Lý do |
| --- | --- | --- |
| Dùng thử: tạo tài khoản | Tên tổ chức, tên chủ sở hữu, email, mật khẩu, đồng ý điều khoản | `TrialRegistrationRequest` và `TrialService.RegisterAsync` yêu cầu trước khi gửi email xác minh. |
| Dùng thử: bối cảnh | Ngành, quy mô, mục tiêu | API hiện bắt buộc giá trị, nhưng chưa dùng để ấn định trần năng lực; các mức được cấu hình sau đăng ký. |
| Dùng thử: xác minh | Mã OTP hoặc liên kết email dùng một lần | Tạo tổ chức, chủ sở hữu và trial sau khi xác minh. |
| Mua gói: tạo tài khoản | Họ tên, email, mật khẩu, xác nhận mật khẩu, điều khoản và lựa chọn gói từ URL | Đây là bước tạo account/draft; không tự ý thêm trường chưa có trong contract API. |
| Mua gói: hợp đồng | Tên pháp lý doanh nghiệp, mã số thuế, địa chỉ trụ sở, người đại diện và chức vụ | Luồng hợp đồng hiện có thu thập sau khi tạo tài khoản, tránh yêu cầu giấy tờ ngay trong đăng ký dùng thử. |
| Sau kích hoạt | Phòng ban, vị trí, trần năng lực, quản lý, nhân viên | Cấu hình chuyên môn phải gắn với framework và lộ trình của tổ chức, nên thuộc onboarding. |

## Quyết định giao diện

1. `/` và `/portal` mở landing doanh nghiệp. `/portal?intent=register` mở `/business/try`.
2. Trang dùng thử gom trường thành “Tài khoản chủ sở hữu” và “Bối cảnh doanh nghiệp”. Trường đáp ứng đúng API hiện có, có nhắc email công việc và mật khẩu 12–72 ký tự.
3. Sau gửi biểu mẫu, hiển thị trạng thái chờ email và thời hạn mã/liên kết. Liên kết demo chỉ hiện khi BE trả về `developmentLink` hợp lệ.
4. Trang đăng nhập giữ API, báo lỗi và điều hướng theo quyền tài khoản; chỉ đổi giao diện Pulse. Danh sách tài khoản demo chỉ hiển thị tài khoản doanh nghiệp/nền tảng trong môi trường phát triển.
5. Trang tạo tài khoản sau chọn gói dùng cùng khung Pulse, giữ tóm tắt gói và các bước hợp đồng/thanh toán.
6. Lối vào Cá nhân được bỏ khỏi điều hướng công khai; URL cá nhân cũ dẫn về luồng doanh nghiệp. Các trang xác minh email cũ còn được giữ để tránh làm mất liên kết đã phát hành.
7. Tài khoản mua gói xác minh bằng OTP trước khi vào hệ thống. Màn hình không có thao tác bỏ qua; khi gửi email thất bại, người dùng thấy lỗi và có thể gửi lại mã ngay.

## Điểm lệch nghiệp vụ cần chốt trước khi công bố

Mẫu thiết kế trước mô tả dùng thử không giới hạn thời gian, tối đa 10 nhân viên. `EnterpriseTrial:TrialOptions` hiện mặc định **14 ngày và 5 tài khoản**, trial bắt đầu với `EndsAt = StartedAt + DurationDays`. Vì vậy landing mới không công bố con số 10 hoặc “không giới hạn” như một cam kết đang hoạt động. Giao diện nên lấy hạn mức từ `TrialContextDto.limits` sau kích hoạt; nếu muốn đúng vision cũ, cần thay đổi chính sách BE riêng và kiểm thử luồng hết hạn/chỗ ngồi.

Trang đăng ký còn phụ thuộc `readiness`: email sender, bundle học liệu và chính sách dữ liệu. Khi chưa sẵn sàng, nút tạo trial bị khóa và hiển thị lý do từ server; thiết kế không giả lập đăng ký thành công.

Luồng tạo tài khoản mua gói hiện dùng chính sách mật khẩu tối thiểu 8 ký tự, còn trial dùng 12–72 ký tự. Đây là khác biệt API hiện tại; cần thống nhất chính sách ở BE trước khi đồng nhất hướng dẫn trên cả hai biểu mẫu.

`TermsCheckbox` của luồng mua gói hiện có liên kết điều khoản/chính sách bị vô hiệu hóa, còn trial chỉ có câu xác nhận. Repo chưa có trang pháp lý công khai tương ứng. Cần cung cấp nội dung được duyệt và URL thật trước khi công bố biểu mẫu ra môi trường production.
