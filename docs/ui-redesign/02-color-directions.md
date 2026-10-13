# Ba hướng màu cho DigiTalent AI

Trạng thái: **đề xuất để chọn**, chưa áp dụng vào ứng dụng. Nền sáng là mặc định cho website công khai và các workspace; nền tối là lựa chọn phụ. Các mã dưới đây là bảng màu riêng cho DigiTalent AI, được xây dựng sau khi xem các mẫu tham khảo, không sao chép nguyên bảng màu của mẫu.

## Cách dùng chung

- Nền chính chiếm phần lớn giao diện; thẻ dùng mặt nền riêng. Màu chính dùng cho CTA, mục menu đang chọn, liên kết và trạng thái có thể thao tác.
- Màu nhấn dùng ít hơn để làm nổi bật lộ trình học, biểu đồ hoặc thông tin cần chú ý; không thay thế màu cảnh báo/lỗi.
- Các màu được đặt theo **vai trò** (`background`, `surface`, `text`, `primary`, `accent`, `border`), để cùng một component đổi từ sáng sang tối bằng token.
- Trạng thái dùng chung sau khi chốt hướng: sáng `success #19805B`, `warning #955C0A`, `danger #B33A48`; tối `success #74D9A3`, `warning #F1C66D`, `danger #FF8893`. Luôn kèm chữ hoặc biểu tượng, không diễn đạt trạng thái chỉ bằng màu.

## A · Xanh tin cậy

Phù hợp dashboard doanh nghiệp, quản lý nhân sự và báo cáo nhiều dữ liệu. Đây là hướng mình **đề xuất** vì gần với xanh hiện có trong giao diện sáng và dễ dùng nhất cho bốn vai trò.

| Vai trò | Sáng | Tối |
| --- | --- | --- |
| Nền chính | `#F7F9FC` | `#0D1728` |
| Sidebar | `#EEF3FA` | `#101C30` |
| Thẻ | `#FFFFFF` | `#152238` |
| Chữ chính | `#17243A` | `#F3F7FF` |
| Chữ phụ | `#526177` | `#B3C0D3` |
| Nút chính | `#2448C4` | `#8FA7FF` |
| Chữ trên nút | `#FFFFFF` | `#0B1630` |
| Nhấn | `#087F74` | `#5DD8C3` |
| Viền | `#DDE5F0` | `#2C3B54` |

## B · Xanh ngọc học tập

Cảm giác gần gũi, dễ theo dõi tiến độ và năng lực cá nhân. Gần với màu mint đang dùng ở khu vực học viên, nhưng cần chỉnh khu vực doanh nghiệp nhiều hơn.

| Vai trò | Sáng | Tối |
| --- | --- | --- |
| Nền chính | `#F4F9F7` | `#0B1D1C` |
| Sidebar | `#EAF4EF` | `#102723` |
| Thẻ | `#FFFFFF` | `#14302D` |
| Chữ chính | `#12332E` | `#F1FAF6` |
| Chữ phụ | `#47645E` | `#B6D0C8` |
| Nút chính | `#087768` | `#70DEC4` |
| Chữ trên nút | `#FFFFFF` | `#06231B` |
| Nhấn | `#A64A1C` | `#FFAD7D` |
| Viền | `#D5E5DF` | `#2D5049` |

## C · Chàm và vàng ấm

Có nét nhận diện sáng tạo cho EdTech, đồng thời giữ chút vàng từ giao diện hiện tại. Màu vàng dùng cho điểm nhấn, không phủ lên các vùng dữ liệu lớn.

| Vai trò | Sáng | Tối |
| --- | --- | --- |
| Nền chính | `#FAF8F3` | `#171628` |
| Sidebar | `#F2EEE7` | `#1C1B30` |
| Thẻ | `#FFFFFF` | `#23223A` |
| Chữ chính | `#24213B` | `#F8F5FF` |
| Chữ phụ | `#625E73` | `#C6C1D5` |
| Nút chính | `#4C3FC2` | `#B3A8FF` |
| Chữ trên nút | `#FFFFFF` | `#211B4D` |
| Nhấn | `#98610B` | `#F0C46A` |
| Viền | `#E6E0D7` | `#45415C` |

## Kiểm tra tương phản

Đã tính tỷ lệ WCAG cho chữ chính trên nền, chữ phụ trên nền, chữ trên nút chính và màu nhấn trên thẻ. Cả ba hướng đều đạt ít nhất **4,5:1** ở các cặp này; các thành phần mới vẫn phải được kiểm tra ở kích thước và nền sử dụng thực tế. Riêng màu viền nhạt là đường phân cách trang trí; viền điều khiển nhập liệu cần token đậm hơn để đạt 3:1 khi cần.

## Mẫu tham khảo

- [SaaS Analytics Dashboard UI](https://dribbble.com/shots/26388093-SaaS-Analytics-Dashboard-UI): nền rất sáng và màu xanh dùng tiết chế cho hành động, tham khảo cho A.
- [LMS Dashboard UI](https://dribbble.com/shots/25625957-LMS-Dashboard-UI-Modern-Intuitive): nền xanh nhạt, phân cấp nội dung học tập, tham khảo cho A/B.
- [HR Dashboard UI](https://dribbble.com/shots/25860030-HR-Dashboard-UI-Clear-Metrics-Human-Centered-Design): thẻ dữ liệu trên nền trung tính, tham khảo cho B/C.
- [LMS Admin Dashboard](https://dribbble.com/shots/26444007-LMS-Admin-Dashboard-Clean-Modern-UI-UX): chàm trên nền sáng, tham khảo cho C.
- [Atlassian Design: Color](https://atlassian.design/foundations/color) và [Figma: Define your design system](https://help.figma.com/hc/en-us/articles/14552740206743-Lesson-2-Define-your-design-system): tham khảo cách đặt token và xử lý sáng/tối.
