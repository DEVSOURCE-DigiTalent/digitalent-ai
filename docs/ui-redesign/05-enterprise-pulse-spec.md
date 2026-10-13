# Enterprise Pulse — bản thiết kế để duyệt

**Xem:** [05-enterprise-pulse-preview.html](05-enterprise-pulse-preview.html)

**Màu đã chọn:** Pulse, nền sáng mặc định

**Trạng thái:** bản xem trước bằng HTML độc lập; chưa thay đổi React, API hoặc dữ liệu thật.

## Lộ trình người dùng

```text
/business
  ├─ Dùng thử → /business/try → /business/try/verify
  │    → /enterprise/dashboard (trial)
  │    → /enterprise/trial: chọn vị trí → mời Manager/Staff
  │    → Staff đánh giá → Owner xem kết quả
  └─ Xem gói → đăng ký/mua gói đang có → /setup
       → /enterprise/dashboard (Owner)
       → phòng ban + vị trí + thành viên
       → yêu cầu năng lực theo vị trí
       → đánh giá + hồ sơ + khoảng trống
       → chương trình chuẩn + đợt đào tạo + giao khóa
       → theo dõi + báo cáo + điều chỉnh chuẩn
```

Hai đường trial và mua gói được tách rõ. Trong trial, bốn bước trên dashboard theo `TrialDashboardOverview` và `TrialWorkspacePage`; số ghế, hạn và quyền ghi lấy từ trial context. Luồng paid dùng `/setup` và Owner workspace. Một đợt đào tạo mới trong code hiện **chưa tự giao khóa** cho học viên; sau khi tạo đợt, Owner cần mở **Phân công đào tạo**.

## Màn hình trong bản xem trước

Thanh điều hướng bên trái của file HTML có **48 khung trang**. Mỗi khung ghi route và có phần “Ghi chú chức năng và trạng thái” ở cuối. Các nhóm gồm:

| Nhóm | Trang chính | Đường đi quan trọng |
| --- | --- | --- |
| Bắt đầu | Landing, đăng ký trial, xác minh | `/business` → `/business/try` → `/business/try/verify` |
| Dùng thử | Tổng quan, chọn vị trí, mời nhóm, kết quả | `/enterprise/dashboard` và `/enterprise/trial` |
| Vận hành | Thiết lập, dashboard Owner | `/setup` → `/enterprise/dashboard` |
| Tổ chức | Phòng ban, vị trí, thành viên, phân quyền và các trang chi tiết | `/enterprise/departments`, `/positions`, `/members`, `/access` |
| Năng lực | Khung chuẩn, yêu cầu, builder, lịch sử, hồ sơ, skill gap và chi tiết | `/enterprise/framework`, `/requirements`, `/competency-profiles`, `/skill-gap` |
| Đào tạo | Catalog, chi tiết khóa, đợt, wizard, phân công, đề xuất, theo dõi, khóa nội bộ | `/enterprise/courses`, `/training-batches`, `/assignments`, `/training-monitor`, `/internal-courses` |
| Đánh giá & minh chứng | Kết quả, nhiệm vụ, giao nhiệm vụ, hàng đợi và chấm minh chứng | `/enterprise/assessment-results`, `/tasks`, `/reviews` |
| Điều hành | Báo cáo, gói, hạn mức, hóa đơn, cài đặt, nhật ký | `/enterprise/reports`, `/subscription`, `/settings` |

Các khung trang chi tiết dùng cùng hệ thành phần, trạng thái và điều hướng với trang danh sách. Khung dùng dữ liệu mẫu để duyệt bố cục; khi áp dụng sẽ nối query/hook/API hiện có.

## Hệ giao diện Pulse

| Token | Nền sáng | Dùng cho |
| --- | --- | --- |
| `background` | `#F7F8FF` | Nền trang chính |
| `surface` | `#FFFFFF` | Thẻ, bảng, biểu mẫu |
| `text` | `#17213B` | Chữ chính |
| `primary` | `#3446C8` | CTA, menu đang chọn, liên kết, tiến độ |
| `accent` | `#C43D2B` | Việc cần chú ý và điểm nhấn thương hiệu |
| `spark` | `#C9F16B` | Hình khối, tín hiệu tích cực có nhãn chữ |
| `border` | `#E1E5F3` | Phân tách nhẹ |

Nền tối và các token đầy đủ đã có ở [03-bold-directions.md](03-bold-directions.md). Trong workspace, màu xanh dẫn hành động; màu san hô dành cho thông tin ưu tiên, không thay màu lỗi. Xanh chanh dùng ít trong dashboard để nội dung và số liệu nổi bật hơn hình trang trí.

### Quy tắc dễ dùng

1. Trang có một hành động chính; các bước tiếp theo được đặt cạnh kết quả vừa xem.
2. Dashboard cho biết **nên làm gì tiếp**, không chỉ hiển thị số liệu. Bản đồ 6 giai đoạn điều hướng được.
3. Biểu mẫu chia nhóm ngắn, giữ dữ liệu khi có lỗi, nêu điều kiện ngay cạnh trường nhập.
4. Danh sách có tìm kiếm/lọc; trạng thái ghi bằng chữ và màu. “Chưa đánh giá” khác với mức 0 và khác với “không có khoảng trống”.
5. Trước khi kích hoạt bộ yêu cầu hoặc thay đổi quyền, cho thấy phạm vi tác động và bước xác nhận.
6. Trial hết hạn chuyển chỉ đọc; quyền và hạn mức phải lấy từ backend. Không ghi cứng thời hạn hay số ghế từ mẫu.
7. Các chỉ số trong báo cáo đi kèm cỡ mẫu, bộ lọc và trạng thái thiếu dữ liệu.

## Những khác biệt đã được phản ánh trong thiết kế

| Chủ đề | Tài liệu mô tả | Code hiện tại | Bản duyệt |
| --- | --- | --- | --- |
| Cấp bậc G1–G3 | Wireframe mới bỏ cấp G | `/setup`, wizard đợt đào tạo và một số báo cáo vẫn dùng G | Không hiện G; khi áp dụng cần sửa code và kiểm tra dữ liệu/API liên quan |
| Thương mại | Wireframe đề xuất mua khóa theo số suất; tài liệu vận hành nói gói cơ bản | Trial và gói/thuê bao đang chạy | Dùng hai đường trial/gói hiện hành; mô hình mua theo khóa chờ quyết định sản phẩm |
| Bài cuối khóa | Có mô tả tự chấm và Manager chấm | Learning API nhận Manager đánh giá FINAL | Thiết kế Manager chấm; quiz chương là tự kiểm tra |
| AI hỗ trợ và nộp lại | Có đề xuất AI, tối đa hai lần, `NEEDS_SUPPORT` | Learning guide đánh dấu chưa làm | Không hiển thị như tính năng đã có |
| Learning API | 18 khóa và 10 endpoint backend | Frontend chưa gọi trực tiếp `/api/v1/learning` | Bản duyệt giữ route UI hiện có; tích hợp API là việc riêng khi áp dụng |
| Tạo đợt | Tài liệu muốn giao học theo lộ trình | Live code tạo đợt nhưng chưa tự giao khóa | Có chỉ dẫn sang Phân công đào tạo sau khi tạo đợt |
| Điều hướng trial | Tài liệu trình bày một hành trình liên tục | Dashboard trial có link sang các trang Enterprise; `/enterprise/trial` cũng có panel chọn vị trí và mời nhóm | Bản duyệt gom hai thao tác trong `/enterprise/trial`; khi áp dụng cần thống nhất đích link trên dashboard |

Các tài liệu người dùng cung cấp là nguồn nghiệp vụ để đối chiếu. Hành vi của trang được chốt theo route, component và API đang có; khác biệt ở bảng trên cần được giải quyết khi đưa thiết kế vào sản phẩm.

## Kiểm tra bản xem trước

- File mở trực tiếp bằng trình duyệt, không cần build hoặc server.
- Đã chạy kiểm tra JavaScript và duyệt DOM cho toàn bộ 48 khung trang.
- Đã kiểm tra điều hướng, xác thực tối thiểu của form trial, biểu mẫu mẫu, wizard bốn bước và các tab báo cáo.
- Nút “Xem khi hết hạn” trên tổng quan trial cho xem trạng thái chỉ đọc.
- Dữ liệu, thao tác lưu, gửi lời mời và xuất file trong bản xem trước không gọi backend.
