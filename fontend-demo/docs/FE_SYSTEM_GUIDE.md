# DigiTalent — Hướng dẫn trải nghiệm hệ thống FE

> **Trang doanh nghiệp đã được tổ chức lại thành khu quản lý riêng.** Xem [menu và luồng quản lý mới](BUSINESS_MANAGEMENT_GUIDE.md). Biên tập khóa và học cá nhân không còn nằm trong không gian quản trị doanh nghiệp. Các mô tả phân hệ cũ bên dưới dùng để tham khảo.

> Luồng đầu vào mới: xem [Landing, đăng ký, lời mời và quyền học B2B/B2C](FE_ONBOARDING_COMMERCE.md). Hướng dẫn dưới đây mô tả các phân hệ đào tạo sẵn có sau khi vào đúng không gian.

## Khung đào tạo và giáo trình

Mở **Khung đào tạo** trên landing hoặc thanh điều hướng để xem DigComp 3.0, đối chiếu Thông tư 02/2025, nguồn tài liệu và 9 module AI. Quản trị có thêm mục **Ưu tiên phát triển**. Xem [báo cáo rà soát và kế hoạch](DIGCOMP3_REVIEW_AND_ROADMAP.md).

## Mục tiêu bản giao diện

Toàn bộ chức năng dưới đây phục vụ trải nghiệm sản phẩm bằng dữ liệu trình duyệt trước khi xây dựng BE. Các bản ghi và luồng bám mô hình canonical v2.2; người dùng có thể thực hiện thao tác, đổi tài khoản rồi quan sát kết quả ở vai trò còn lại. Giữ hệ màu và thư viện khóa học đã có.

## Điểm vào

- **Doanh nghiệp:** đăng nhập → Quản trị đào tạo & nhân sự. Có 9 mục: Tổng quan; Phòng ban & nhân sự; Kế hoạch đào tạo; Thực hành & thẩm định; Hồ sơ năng lực; Biên tập & học liệu; Xác nhận học tập; Báo cáo; Thiết lập.
- **Nhân viên được cấp tài khoản:** đăng nhập → Công việc & hồ sơ trên thanh tài khoản. Có 5 mục: Việc cần làm; Bài thực hành; Năng lực đã xác nhận; Thư viện học liệu; Xác nhận học tập.
- **Lớp học:** tiếp tục dùng luồng khảo sát → năng lực → khóa F/I/A. Nút nộp minh chứng của nhân viên được cấp tài khoản mở khu bài thực hành dùng chung với doanh nghiệp.
- Các tài khoản mẫu cũ vẫn giữ màn hình trải nghiệm riêng. Luồng liên tài khoản mới dùng nhân viên được doanh nghiệp cấp tài khoản, cùng một trình duyệt.

## Các màn hình và thao tác

| Màn hình | Thao tác có thể thử | Bảng định hướng |
|---|---|---|
| Phòng ban & nhân sự | Tạo phòng, chọn trưởng phòng, tìm nhân viên, phân công nhân viên vào phòng | departments, employees, job_positions, organizations |
| Kế hoạch đào tạo | Khung 9–14 năng lực/3 mức, nháp → kích hoạt → lưu trữ, giao khóa có hạn, theo dõi tiến độ | position_requirement_sets/items, course_assignments, enrollments, lesson_progress |
| Khoảng thiếu | Lưu các lần phân tích theo khung đang áp dụng, đọc hồ sơ xác nhận, xem lịch sử | skill_gap_runs/items, employee_competency_profiles |
| Giao bài | Lấy đề bài giáo trình, chọn người nhận, sửa hướng dẫn, chọn nhiều năng lực và mức mục tiêu, đặt hạn | practical_task_templates/targets, task_assignments, assigned_task_targets |
| Nộp minh chứng | Nội dung, nhiều liên kết, nhiều thông tin tệp, nộp lại v2 khi cần bổ sung; v1 được giữ | task_submissions, task_submission_files, file_objects |
| Thẩm định | Xem bản mới nhất, chấm từng năng lực, yêu cầu bổ sung hoặc duyệt tất cả | task_evaluations, competency_evaluation_results |
| Hồ sơ năng lực | Thanh 3 mức, so sánh mục tiêu vị trí, mở lịch sử minh chứng và người duyệt | employee_competency_profiles, competency_evidences |
| Biên tập khóa | Chọn khóa, soạn tiêu đề/mục tiêu, lưu bản chụp nội dung thành phiên bản, xuất bản demo, lưu trữ bản trước | courses, course_modules, lessons, learning_materials |
| Ngân hàng câu hỏi | Tìm câu hỏi theo khóa, xem đáp án và giải thích trong khu quản trị | question_banks, questions, question_options |
| Xác nhận học tập | Xem kết quả hoàn thành, mã tra cứu; quản trị thu hồi kèm lý do nội bộ | certificates, notifications, audit_logs |
| Tra cứu | Tìm mã giữa các công ty demo đã có dữ liệu; hiện trạng thái thu hồi, ghi lượt tra cứu, không lộ lý do nội bộ | certificate_verification_logs |
| Báo cáo | Lọc phòng ban, xem khóa/tiến độ/bài chờ duyệt/hồ sơ, xuất CSV, so sánh hai lần gap cùng phiên bản | enrollments, lesson_progress, task_evaluations, skill_gap_runs/items |
| Thiết lập | Lời hướng dẫn cho người học, chế độ danh sách gọn | system_settings |
| Thông báo & nhật ký | Giao khóa/giao bài/nộp bài/duyệt/bổ sung/thu hồi; đánh dấu thông báo đã đọc | notifications, audit_logs |

## Kịch bản thử liên tục

1. Vào doanh nghiệp, thêm hoặc chọn nhân viên; cấp tài khoản ở Cấu hình doanh nghiệp.
2. Mở Quản trị đào tạo & nhân sự → Phòng ban & nhân sự, tạo phòng và phân công nhân viên.
3. Trong Kế hoạch đào tạo → Khung vị trí, tạo bản nháp 10 năng lực, tổng trọng số 100%, rồi kích hoạt.
4. Phân tích khoảng thiếu lần đầu cho nhân viên. Nếu chưa có minh chứng được duyệt, mức hiện tại là “Chưa xác nhận”.
5. Giao một khóa và hạn học. Trong Thực hành & thẩm định → Giao bài mới, chọn nhân viên, dùng đề bài giáo trình, chọn năng lực mục tiêu và giao.
6. Đăng xuất, đăng nhập bằng tài khoản vừa được cấp. Nhân viên thấy khóa, thông báo và bài thực hành. Có thể học các bài, lưu ghi chú, làm bài kiểm tra.
7. Vào Công việc & hồ sơ → Bài thực hành, chọn bài và nộp v1.
8. Đăng nhập doanh nghiệp, mở bài chờ duyệt, chấm từng năng lực và yêu cầu bổ sung với nhận xét.
9. Nhân viên đăng nhập lại, đọc phản hồi và nộp v2. Bản v1 được giữ trong lịch sử.
10. Doanh nghiệp chấm v2: tất cả năng lực phải đạt ít nhất 70/100 mới duyệt được. Khi duyệt, hồ sơ năng lực cập nhật theo mục tiêu của bài; không tự hạ mức đã đạt cao hơn.
11. Xem Hồ sơ năng lực, mở căn cứ từng mức, rồi phân tích khoảng thiếu lần nữa. Báo cáo so sánh hai lần cùng khung để nhìn tiến bộ.
12. Khi đã học xong khóa, mở Xác nhận học tập để xem mã. Thử thu hồi và tra lại mã: trạng thái thu hồi xuất hiện cả ở modal kết quả lẫn trang tra cứu.

## Các nguyên tắc được thể hiện trong FE

- Kết quả khảo sát 0–6 là gợi ý học ban đầu; hồ sơ vận hành dùng 3 mức và đến từ thẩm định minh chứng.
- Điểm học/hoàn thành khóa không tự xác nhận năng lực công việc.
- Không duyệt bản nộp cũ khi đã có v2; không duyệt lại một bản đã chốt.
- Chỉ người được giao duyệt mới thực hiện hành động duyệt trong luồng dữ liệu demo. Hiện người giao bài quản trị cũng là người duyệt; chưa có màn phân quyền quản lý theo phòng ban.
- Nếu một năng lực dưới 70, chưa phát sinh hồ sơ xác nhận nào từ bài đó.
- Hồ sơ không tự giảm mức khi duyệt bài có mục tiêu thấp hơn mức đã xác nhận.
- Các lần phân tích giữ đầu vào của khung và mức hiện tại tại thời điểm tính.
- Bản xuất bản khóa được giữ thành snapshot; chỉ biên tập tiêu đề/mục tiêu trong lần mở rộng này, chưa có trình soạn rich text cho từng lesson.
- Thông tin tệp đính kèm gồm tên/loại/dung lượng để nhìn thao tác FE; liên kết sản phẩm có thể mở. Không mô phỏng đã upload bytes của tệp.
- Xác nhận hoàn thành trong demo chưa có mẫu PDF, thời hạn hoặc chữ ký. Thu hồi không xóa lịch sử học hay giảm hồ sơ năng lực.

## Định hướng nối BE sau này

Các hàm thao tác được tách trong `trainingOperations.js`, `systemDemo.js`, `learningConfirmations.js`; có thể thay lớp lưu localStorage bằng API từng nghiệp vụ. Không cần thay thiết kế màn hình để bắt đầu nối dữ liệu. Cấu trúc lồng nhau hiện tại là view-model FE, không phải schema vật lý hoàn chỉnh của 59 bảng. Các màn dùng dữ liệu thực tế phát sinh nên ban đầu có trạng thái trống, không tạo tiến bộ hoặc minh chứng được duyệt giả.

Những phần chưa mô phỏng đầy đủ: phân quyền theo phòng ban, rubric chi tiết từng hành vi, biên tập K/S/A và ánh xạ framework, giới hạn số lượt thi/lịch sử từng đáp án, chứng chỉ PDF và hết hạn, dữ liệu risk/readiness có cấu hình. Bốn bảng Intelligence vẫn không chặn luồng cốt lõi. Thuế, hóa đơn điện tử và hợp đồng tiếp tục theo giới hạn RP1.
