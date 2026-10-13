# Đối chiếu luồng và giao diện

> **Bản web mẫu liền mạch:** Mở [DigiTalent Pulse product site](14-pulse-product-site/index.html#/welcome) để đi từ landing page đến báo cáo sau khóa học. [Flow Studio](06-pulse-flow-studio.html#home) vẫn giữ vai trò thư viện màn hình chi tiết; [quy tắc thiết kế](13-enterprise-operating-flow-spec.md) là nguồn cho chính sách mới. Yêu cầu mới của người dùng thay thế các số 14/30 ngày, 5/20 tài khoản và số lần nộp lại trong tài liệu cũ. Bản HTML là prototype; backend chưa thực thi các chính sách mới.

Web mẫu hiện có thêm các luồng phụ từ file User Flow và Wireframe: nhiệm vụ thực tế và minh chứng (Owner → Employee → Manager), đợt đào tạo và theo dõi team, khung chuẩn và phát hành nội dung của Platform Admin, vòng đời khách hàng, chứng chỉ, thông báo và phục hồi/kích hoạt tài khoản. Chúng được đặt cạnh màn chính của từng vai trò trong cùng trạng thái mẫu; xem [hướng dẫn web](14-pulse-product-site/README.md) để đi theo từng nhánh.

Tài liệu làm việc cho nhánh `design/ui-flow-redesign`. Các mô tả trong bốn file tham khảo là đầu vào sản phẩm; khi thiết kế một trang, đối chiếu với route, component và API hiện có trước khi chốt hành vi.

## Nguồn tham khảo

- `DigiTalent AI User Flow và Wireframe.html`: bản đồ màn hình, 7 luồng và wireframe theo vai trò.
- `Luồng vận hành Digital AI.html`: 4 vai trò, dùng thử, xử lý chưa đạt, lộ trình và trần năng lực.
- `Luồng.txt`: mô tả mục tiêu nghiệp vụ ban đầu.
- `learning-api-integration.md`: 10 endpoint của luồng học tập, trạng thái và các mục chưa làm.

## Nhóm trang hiện có trong code

| Nhóm | Route/component hiện có | Đầu vào thiết kế |
| --- | --- | --- |
| Công khai và dùng thử | `/business`, `/business/try`, `/business/try/verify`, `/business/try/accept`, `/login` | Đăng ký, xác minh Owner, kích hoạt lời mời |
| Onboarding Owner | `/setup`, `/enterprise/trial`, `/enterprise/members`, `/enterprise/departments`, `/enterprise/positions` | Hồ sơ tổ chức, vị trí, Manager/Staff |
| Owner: năng lực và đào tạo | `/enterprise/requirements`, `/enterprise/skill-gap`, `/enterprise/courses`, `/enterprise/training-batches`, `/enterprise/reports` | Yêu cầu năng lực, Skill Gap, giao học, báo cáo |
| Employee | `/enterprise/me`, `/enterprise/me/courses`, `/enterprise/me/assessments`, `/enterprise/me/tasks`, `/enterprise/me/achievements` | Học, quiz, nộp bài, minh chứng, chứng chỉ |
| Manager | `/enterprise/team`, `/enterprise/team/training` và các trang công việc dùng chung | Theo dõi nhóm, chấm bài, duyệt minh chứng |
| Platform Admin | `/platform/dashboard`, `/platform/organizations`, `/platform/curriculum`, `/platform/questions`, `/platform/plans` | Khách hàng, nội dung chuẩn, thương mại |

Mã `OW-*`, `MG-*`, `EM-*` trong HTML wireframe không khớp hoàn toàn với mã trong `frontend/src/lib/screens`. Khi sửa giao diện, dùng **route + tên trang** làm khóa đối chiếu và giữ mã màn hình hiện có cho đến khi có bảng chuyển đổi được chốt.

## Điểm cần giải quyết khi thiết kế

| Chủ đề | File mô tả | Code hiện tại | Hướng cho bản thiết kế |
| --- | --- | --- | --- |
| Dùng thử và mua hàng | Wireframe mua từng khóa theo số suất, không dùng gói; `Luồng vận hành` bắt đầu bằng gói cơ bản | Có luồng trial riêng và luồng đăng ký/gói/thuê bao | Thiết kế rõ đường trial đang chạy; mô hình mua từng khóa cần quyết định sản phẩm và API trước khi thành CTA hoạt động |
| Cấp bậc G | Wireframe bỏ cấp bậc G khỏi MVP | `SetupWizardPage` vẫn có bước G1–G3; route cấp bậc đã đánh dấu retired | Không đưa cấp bậc vào wireframe mới; việc xóa bước và dữ liệu hiện có cần xử lý riêng |
| Đánh giá cuối khóa | Wireframe mô tả chấm tự động; `learning-api-integration.md` mô tả Manager chấm assignment | `LearningController` có submit + pending + evaluate; verdict là PASSED/FAILED | Thiết kế theo luồng Manager đánh giá đang có; tự động chấm cuối khóa là thay đổi nghiệp vụ |
| Quiz và nộp lại | Tài liệu đề xuất giới hạn 2 lần, NEEDS_SUPPORT, AI gợi ý ôn | API quiz có start/submit; đánh giá FAILED đưa enrollment về IN_PROGRESS; chưa thấy giới hạn 2 lần hoặc NEEDS_SUPPORT | Hiển thị trạng thái đang có; không hứa số lượt nộp lại hoặc AI nếu chưa có API |
| Học tập frontend | Hướng dẫn API mô tả 10 endpoint | Backend có đủ 10 route trong `LearningController`; frontend chưa gọi trực tiếp `/api/v1/learning` | Thiết kế trang học kèm việc tích hợp API, kiểm tra lại model dữ liệu của các trang hiện có |

## Thứ tự thiết kế đề xuất

1. Công khai và onboarding doanh nghiệp: vào trial, xác minh, setup, mời người.
2. Owner: cơ cấu tổ chức, vị trí, yêu cầu năng lực và Skill Gap.
3. Employee: danh sách khóa, chi tiết, bài học, quiz, nộp bài và kết quả.
4. Manager: hàng chờ đánh giá khóa học, quyết định và phản hồi.
5. Nhiệm vụ thực tế và minh chứng giữa Owner, Manager, Employee.
6. Báo cáo, chứng chỉ, thương mại và Platform Admin.

Mỗi trang sẽ có: mục tiêu người dùng, dữ liệu/API, trạng thái giao diện, bố cục desktop/mobile, luồng điều hướng và danh sách điểm cần chốt. Chỉ sửa component sau khi nội dung trang đó được thống nhất.
