# Kiểm tra luồng năng lực và gap của Pulse

**Phạm vi:** bản duyệt tương tác `14-pulse-product-site/index.html`, kiểm tra ngày 13/10/2026. Đối chiếu `Luồng vận hành Digital AI.html` làm luồng gốc, `DigiTalent AI User Flow và Wireframe.html` làm mô tả mở rộng, cùng các yêu cầu cập nhật trực tiếp của chủ dự án. Đây là kết quả cho **prototype dùng `localStorage`**, chưa phải xác nhận backend production.

## Quy tắc sau khi kiểm tra

Trong mỗi lĩnh vực, giao diện giữ ba mốc riêng: **Baseline đầu vào → Current đã xác nhận → mục tiêu của vị trí**. Hoàn thành slide, quiz hoặc gửi final assignment không làm tăng Current. Manager đúng phòng ban duyệt final assignment thì cấp của khóa được xác nhận; Current chỉ tăng nếu cấp này cao hơn mức đã xác nhận. Minh chứng thực tế do Manager duyệt là nguồn xác nhận thứ hai. Baseline gốc không bị ghi đè. Gap còn lại dùng Current đã xác nhận so với mục tiêu vị trí; kết quả `Pending` không bị đếm như gap đã đo.

Ví dụ từ account trả phí: Mia ở Data & information có **Baseline L1, Target L2**. Basic L1 đã đạt nên Current vẫn L1. Mua và gán Intermediate L2, học ba module, qua quiz và nộp bài đều **chưa** thay đổi Current. Sau khi Manager duyệt bài cuối Intermediate, Current thành **L2**, gap Data từ **1 xuống 0**; Baseline vẫn L1. Bài bị trả lại hoặc gắn cờ sau hai lần nộp không nâng Current.

## Ma trận kiểm tra

| Luồng | Kết quả kiểm tra | Ý nghĩa nghiệp vụ |
| --- | --- | --- |
| Đăng ký thử → Blueprint → Manager → Employee/CSV → test đầu vào | Đạt | Trial tự kích hoạt; công bố trần trước khi thêm người; 10 suất Employee chung toàn doanh nghiệp; test đầu vào trước lộ trình. |
| Trần Digital AI ≥ doanh nghiệp ≥ phòng ban ≥ vị trí | Đạt | Trần thấp hơn con bị chặn; Manager chỉ đề xuất, Owner công bố. |
| Employee học module → slide/quiz → final assignment | Đạt | Module chưa qua quiz không mở tiếp; bài cuối theo đúng khóa, cấp học chưa tăng trước khi duyệt. |
| Manager đúng phòng ban chấm, AI gợi ý | Đạt trong prototype | Manager ghi quyết định và lý do; gửi form chấm từ phòng ban khác bị chặn. Gợi ý AI chỉ là kiểm tra văn bản mẫu. |
| Basic đạt khi đầu vào đã là L1 | Đạt | Khóa hoàn thành, báo cáo có kết quả; Current vẫn L1 vì không thể cộng cấp trùng. |
| Intermediate đạt từ L1 với Target L2 | Đạt | Current L1 → L2, gap lĩnh vực 1 → 0; baseline L1 giữ nguyên; Owner, Manager, Employee và report hiển thị cùng kết quả. |
| Mở lại tab sau khi Manager đã duyệt Intermediate | Đạt | Dữ liệu duyệt cũ trong `localStorage` được đối chiếu lại, Mia hiển thị L1 → L2 trên Employee Today sau khi tải lại trang. |
| Nhân viên xem Today, Path và test đầu vào | Đạt sau sửa | Ba màn dùng cùng một Employee đang được chọn trong bản preview; không ghi bài test của người khác. |
| Lần 1 chưa đạt → chờ → hạn nộp lần 2 → lần 2 chưa đạt | Đạt | Không tăng Current; sau hai lần có cờ hỗ trợ và không mở cấp tiếp. |
| Employee có đầu vào `Pending` nhưng đã hoàn thành test | Đạt sau sửa | Khi gán lộ trình cho nhóm, người này có thể bắt đầu Basic; `Pending` vẫn không hiển thị như gap đo được. |
| Mua suất → gán cả phòng ban/nhiều người → học tiếp | Đạt | Chặn thiếu suất, ngoài target vị trí, thiếu prerequisite; mua suất không tự nâng năng lực. |
| Minh chứng thực tế → Manager duyệt | Đạt | Có thể nâng Current riêng, giữ baseline; không dùng giới hạn hai lần của bài cuối khóa. |
| Báo cáo khóa thử và khóa mua thêm | Đạt | Cùng mô hình báo cáo; nêu baseline, mức đã xác nhận, gap còn lại, quyết định Manager và lịch sử học. |
| Phân quyền và hiển thị 1440px/390px | Đạt trong prototype | Manager chỉ thấy phòng ban; cả timeline trong report được lọc theo người thuộc phòng ban. Kiểm tra các route chính, profile và nhánh phụ, không lỗi JavaScript hoặc tràn ngang ở màn đã thử. |

**Bộ chạy thực tế:** `audit-product-site.cjs`, `audit-secondary-flows.cjs`, `audit-role-profiles.cjs`, `audit-paid-bulk.cjs` và `audit-capability-progression.cjs` trong thư mục kiểm tra cục bộ. Bộ mới kiểm tra rõ cả trạng thái dữ liệu trước/sau duyệt và nội dung so sánh của ba role.

## Giới hạn cần giữ rõ khi triển khai production

- Test đầu vào hiện là chọn cấp mẫu; cần câu hỏi, thang điểm, quy tắc xác nhận và lưu phiên bản đề thi thật.
- AI gợi ý, thanh toán, gửi lời mời, upload minh chứng và chứng chỉ hiện chỉ là mô phỏng. Quyền Manager, duyệt bài, cấp suất và công thức Current/gap phải được thực thi ở API, không dựa vào `localStorage` hoặc trạng thái client.
- Mức năng lực đã xác nhận được giữ theo mức cao nhất đã đạt; prototype chưa có chính sách hết hạn chứng cứ, đánh giá lại làm giảm cấp hoặc thu hồi quyết định. Nếu sản phẩm cần các trường hợp này, phải định nghĩa quy tắc và nhật ký kiểm toán trước khi đưa vào production.
