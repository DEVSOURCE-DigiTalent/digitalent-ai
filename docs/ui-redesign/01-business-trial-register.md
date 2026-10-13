# Trang 1 · Đăng ký dùng thử doanh nghiệp

**Route hiện có:** `/business/try`

**Vai trò:** người đại diện doanh nghiệp, chưa đăng nhập

**Component:** `EnterpriseTrialRegisterPage`
**API:** `POST /api/v1/enterprise-trial/register`

## Mục tiêu

Người đại diện tạo yêu cầu dùng thử, hiểu bước tiếp theo là xác minh email, rồi đăng nhập để thiết lập tổ chức và mời Manager/Staff.

## Bố cục đề xuất

```text
┌──────────────────────────────────────────────────────────────┐
│ Logo                                      Đăng nhập           │
├──────────────────────────────┬───────────────────────────────┤
│ Dùng thử cho doanh nghiệp     │ Tạo tài khoản dùng thử       │
│ 1. Đăng ký                   │ Tên doanh nghiệp            │
│ 2. Xác minh email             │ Ngành nghề · Quy mô          │
│ 3. Thiết lập tổ chức          │ Họ tên người quản trị        │
│ 4. Mời nhóm                   │ Email công việc              │
│                              │ Mật khẩu                     │
│ Điều người dùng sẽ trải      │ Đồng ý điều khoản           │
│ nghiệm: vị trí mẫu, đánh giá, │ [Tạo tài khoản dùng thử]     │
│ lộ trình và kết quả.          │ Đã có tài khoản? Đăng nhập   │
└──────────────────────────────┴───────────────────────────────┘
```

Trên điện thoại, phần giới thiệu rút còn một câu và bốn bước hiển thị thành chỉ báo gọn; biểu mẫu chiếm toàn chiều rộng.

## Dữ liệu và hành vi

- Biểu mẫu gửi đúng các trường API đang nhận: `organizationName`, `ownerName`, `email`, `password`, `industry`, `size`, `goal`, `acceptedTerms`. Component hiện tại đã hiển thị cả ngành nghề, quy mô và mục tiêu bên cạnh bốn trường đầu cùng điều khoản.
- Bản Pulse giữ ngành nghề, quy mô và mục tiêu thành các lựa chọn ngắn; bố cục và trạng thái xem ở [bản duyệt Enterprise Pulse](05-enterprise-pulse-preview.html#register).
- Xác thực từng trường tại chỗ; trạng thái đang gửi khóa nút để tránh đăng ký lặp; lỗi API xuất hiện cạnh biểu mẫu, giữ lại dữ liệu đã nhập.
- Thành công chuyển sang trạng thái **“Kiểm tra email để xác minh”** và chỉ rõ địa chỉ đã gửi. Liên kết xác minh phục vụ development chỉ xuất hiện khi API trả về `developmentLink`; không dùng từ “tenant” hoặc “Development” trong nội dung dành cho khách hàng.
- Sau xác minh, route hiện có là `/business/try/verify`, tiếp đến đăng nhập. Lời mời Manager/Staff đi qua `/business/try/accept`.

## Trạng thái cần thiết kế

Mặc định · đang gửi · lỗi trường nhập · lỗi từ API · đăng ký thành công · liên kết xác minh hết hạn ở trang kế tiếp. Không giới thiệu quyền mua khóa, giá hoặc thời hạn dùng thử cố định trên trang này nếu chưa có cấu hình/API xác nhận.

## Quyết định trong bản Pulse

Luồng bắt đầu ở trang công khai `/business`, CTA dùng thử dẫn đến `/business/try`. Mục tiêu trải nghiệm là trường chọn trong biểu mẫu. Trang xác minh và các màn hình trial tiếp theo đã nằm trong bản duyệt Enterprise Pulse.
