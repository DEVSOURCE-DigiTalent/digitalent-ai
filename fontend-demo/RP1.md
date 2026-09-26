# RP1 — Phạm vi thử nghiệm DigiTalent AI cho SME

## 1. Vấn đề và người dùng

- **Doanh nghiệp** cần biết từng vị trí cần năng lực số nào, ai đang thiếu, học gì trước và cải thiện ra sao sau đào tạo. CEO xem tổng quan tất cả vị trí; trưởng phòng và người học xem khung theo công việc.
- **Người học** cần thấy mức hiện tại, mức yêu cầu, khoảng thiếu, lộ trình từ cơ bản đến nâng cao và tiêu chí được chấm.
- **Đơn vị cung cấp đào tạo** cần có gói miễn phí để thu hút người dùng, khóa trả phí để tạo doanh thu, và bằng chứng giá trị sau học.

## 2. Phạm vi RP1

| Hạng mục | Giới hạn bản thử |
|---|---|
| Doanh nghiệp mẫu | 3 SME: Sao Mai Digital (18 người), An Phát Retail (32 người), Minh Việt Foods (24 người). Số liệu minh họa, không phải dữ liệu thật. |
| Vị trí mẫu | 6 vị trí/doanh nghiệp: CEO, trưởng phòng, Marketing, kinh doanh, kế toán, nhân sự. Ưu tiên CEO và trưởng phòng. Có thể thêm vị trí đặc thù bằng giao diện. |
| Số người khi tự tạo doanh nghiệp | Trường quy mô cho phép 1–500; đây là giới hạn nhập liệu bản thử, không phải năng lực hệ thống đã kiểm tải. |
| Khung năng lực | 5 lĩnh vực; mức yêu cầu 1–6 trong bản thử, trọng số theo vị trí cộng 100%. Tài liệu hiện có còn nhắc DigComp 8 mức; cần thống nhất và chuyên gia thẩm định ánh xạ trước khi dùng chính thức. |
| Khóa học | Danh mục 15 khóa, 3 cấp/lĩnh vực. Đã đưa 63 module và 315 câu hỏi từ 5 giáo trình dự án vào lớp học; 8 khóa được gắn trạng thái chờ chuyên gia thẩm định trước khi mở bán. Video chỉ phát khi gắn liên kết/tệp. Giá giả định cho 7 khóa sẵn sàng thương mại trong demo: cơ bản miễn phí; trung cấp 390.000 đ/chỗ; nâng cao 790.000 đ/chỗ. |
| Đánh giá | Trang doanh nghiệp cho tự khai đầu vào và đánh giá lại; điểm là tỷ lệ đáp ứng yêu cầu vị trí. Không gian cá nhân có khảo sát 5 câu theo vị trí để gợi ý học tập, bài kiểm tra 5 câu/module đạt ≥80% và ôn tập cuối khóa đạt ≥70/100. Kết quả học chưa phải xác nhận năng lực thực tế. |
| Doanh thu | Ghi đơn hàng mô phỏng và ước tính nhu cầu học của hồ sơ đã nhập. Chưa có giao dịch hay doanh thu thực thu. |

## 3. Luồng thử cho doanh nghiệp

1. Vào trang đăng nhập doanh nghiệp bản demo, chọn doanh nghiệp mẫu hoặc nhập tên, ngành, quy mô và chi phí nhân công/giờ.
2. Kiểm tra 6 vị trí mẫu; thêm vị trí đặc thù, số người dự kiến, mức ưu tiên và chỉnh mức yêu cầu từng lĩnh vực.
3. Thêm nhân sự và chọn vị trí, cấp tên đăng nhập/mã demo, rồi nhân viên vào trang đăng nhập riêng. Nhân viên làm khảo sát theo khung vị trí; doanh nghiệp có thể điền mức tự đánh giá đầu vào 0–6 cho 5 lĩnh vực.
4. Xem điểm và khoảng thiếu; hệ thống ghép khóa học theo mức hiện tại, trọng số và năng lực cốt lõi. Ưu tiên theo `gap × trọng số × 1,5` nếu cốt lõi.
5. Người học xem 3 cấp khóa trong từng lĩnh vực, vào lớp để xem video khi có nguồn, đọc giáo trình, ghi chú, lưu nháp thực hành, làm câu hỏi từng module và ôn tập cuối khóa. Nộp sản phẩm thực hành theo đề bài giáo trình và đánh giá lại. Báo cáo trước/sau chỉ hiển thị khi đủ dữ liệu đánh giá lại. Chưa gọi đây là năng lực được chứng nhận nếu chưa có mentor thẩm định.
6. CEO xem bảng tất cả vị trí và hồ sơ đã có đánh giá. So sánh cải thiện cấp doanh nghiệp chỉ dùng cùng nhóm nhân sự có cả hai lần đánh giá; số liệu không suy rộng ra toàn bộ nhân viên khai báo.

## 4. Quy tắc chấm điểm và round match

- Điểm vị trí = `Σ [trọng số lĩnh vực × min(mức hiện tại / mức yêu cầu, 1)]`; 5 trọng số cộng 100%, làm tròn thành điểm trên 100.
- Mức chưa có minh chứng là 0. Thiếu dữ liệu thì chưa công bố điểm. Khoảng thiếu = `max(mức yêu cầu − mức hiện tại, 0)`.
- Mỗi vòng chọn khóa kế tiếp của lĩnh vực còn thiếu: mức hiện tại dưới 2 → cơ bản; từ 2 đến dưới 4 → trung cấp; từ 4 trở lên → nâng cao. Sau học và đánh giá lại, chạy ghép lại; không tự tăng mức chỉ vì đã mở khóa học.
- Điểm tự khai, bài trắc nghiệm và minh chứng thực hành là các nguồn khác nhau. Trang doanh nghiệp dùng điểm tự khai; trang cá nhân dùng khảo sát ngắn để gợi ý lộ trình, không tự tăng điểm năng lực khi học xong. Chuyên gia cần duyệt tiêu chí hành vi, trọng số và đối chiếu các văn bản nguồn trước khi vận hành thật.

## 5. Bảng dữ liệu DBML được dùng trong luồng

| Chức năng | Bảng canonical phù hợp |
|---|---|
| Doanh nghiệp và vị trí | `organizations`, `job_families`, `job_positions`, `departments`, `employees` |
| Đăng nhập, cấp tài khoản và phân quyền | `users`, `roles`, `permissions`, `user_roles`, `role_permissions`, `refresh_tokens`, `employees.user_id` |
| Chuẩn năng lực và phiên bản | `competency_frameworks`, `competency_categories`, `competencies`, `competency_level_criteria`, `position_requirement_sets`, `position_requirement_items` |
| Đầu vào, minh chứng, trước/sau | `employee_competency_profiles`, `competency_evidences`, `skill_gap_runs`, `skill_gap_items`, `scoring_configs`, `scoring_config_items`, `readiness_scores` |
| Khóa học và lộ trình | `courses`, `course_competencies`, `course_prerequisites`, `course_learning_outcomes`, `course_modules`, `lessons`, `lesson_learning_outcomes`, `learning_materials`, `file_objects`, `course_assignments`, `enrollments`, `lesson_progress` |
| Video, ghi chú, thực hành và bài kiểm tra | Video trong `learning_materials`/`file_objects`; câu hỏi và kết quả trong `question_banks`, `questions`, `question_options`, `assessments`, `assessment_questions`, `assessment_attempts`, `assessment_answers`; sản phẩm thực hành trong `practical_task_templates`, `task_assignments`, `task_submissions`, `task_submission_files` |
| Thẩm định | `practical_task_templates`, `task_assignments`, `task_submissions`, `task_evaluations`, `competency_evaluation_results` |
| Theo dõi và kiểm soát | `notifications`, `audit_logs`, `scoring_configs`, `scoring_config_items`, `training_risk_scores`, `readiness_scores`, `certificates`, `certificate_verification_logs` |

Bản web hiện là prototype React lưu trong `localStorage`, chưa kết nối PostgreSQL. Tài khoản demo là mã rõ trong trình duyệt, không dùng cho dữ liệu thật. Khi làm backend cần xác thực máy chủ, mật khẩu băm/lời mời một lần, phân quyền theo `organization_id`, liên kết `users` ↔ `employees`, và lịch sử hoạt động. DBML v2.2 có 59 bảng nền nhưng chưa có bảng giá/đơn hàng; để triển khai doanh thu cần bổ sung `course_prices`, `orders`, `order_items`, `payments` và quy tắc trạng thái thanh toán. Nếu có mentor thật, cần thêm `mentor_profiles`, `mentor_sessions`, `mentor_messages`; nếu có agent AI, thêm `ai_conversations`, `ai_messages`, `ai_recommendation_runs` với nguồn dữ liệu và phiên bản prompt. Ghi chú học tập cá nhân cũng chưa có bảng riêng; đề xuất `lesson_notes`. Đây là bảng mở rộng, chưa thuộc 59 bảng đã gửi. Hai dòng `Ref` nối các cột `scoring_config_items.max_value/min_value` với các cột cùng bảng ở cuối file DBML là quan hệ sai ngữ nghĩa; nên loại bỏ trước khi dùng làm lược đồ triển khai.

## 6. Giá trị kinh tế và rủi ro

- Doanh thu ghi nhận trong demo = tổng `đơn giá × số chỗ` của đơn mô phỏng. Nhu cầu tiềm năng chỉ tính các khóa đã có nội dung học trong ứng dụng; khóa đề cương không được tính vào doanh thu tiềm năng hoặc ghi đơn. Không xem đây là dự báo bán hàng.
- Chi phí thời gian học = giờ của các khóa sẵn học còn thiếu × chi phí nhân công/giờ do doanh nghiệp nhập. ROI thực tế chỉ tính sau khi có thời gian tiết kiệm, doanh thu kinh doanh tăng thêm, chi phí đào tạo thực trả và kỳ đo trước/sau nhất quán.
- Rủi ro chính: thời gian triển khai, năng lực số của người dùng, chất lượng tự khai, cập nhật và đối chiếu nhiều văn bản nguồn. Cần mentor hướng dẫn onboarding và chuyên gia chuyển đổi số thẩm định khung, câu hỏi, minh chứng và nguồn pháp lý.
- Trợ lý trong bản thử chỉ trả lời bằng quy tắc theo vị trí và khoảng thiếu. Agent AI cá nhân hóa thật cần dữ liệu đã được phê duyệt, quyền truy cập theo vai trò, kiểm soát nguồn và đánh giá chất lượng trước khi phát hành.

## 7. Giới hạn và bước tiếp theo

Trong RP1 chỉ tập trung mô hình doanh thu đào tạo. Tính thuế, hóa đơn điện tử, hợp đồng, cổng thanh toán và mentor người thật nằm ngoài phạm vi bản thử. Cần chuyển dữ liệu trình duyệt sang backend có phân quyền, lịch sử đánh giá và chứng cứ có người duyệt trước khi thử nghiệm thực tế.

Giao diện cá nhân, lớp học, quản lý và HR dùng cùng hệ màu xanh/cam. Mã hoàn thành khóa học `DEMO-...` chỉ tra cứu dữ liệu học trong trình duyệt; không phải chứng chỉ điện tử, mã QR thật hay chữ ký số. Trang HR chỉ hiển thị số liệu của phiên trải nghiệm hiện tại, không suy rộng ra toàn doanh nghiệp. Cả 15 khóa có nội dung giáo trình để học thử; 8 khóa chờ rà soát chuyên gia và chưa ghi đơn mô phỏng. Video chưa có tệp nguồn trong dự án nên lớp học cung cấp trình phát và cấu hình liên kết demo, chưa thể xem video nếu chưa gắn nguồn. Bài thực hành được trưởng phòng chấm theo 3 tiêu chí tổng 100 điểm và nhận xét, chưa phát hành chứng nhận năng lực.

Chưa có **file đăng ký dự án** trong thư mục được cung cấp, nên chưa thể xác nhận tỷ lệ đáp ứng 70% so với nội dung đăng ký. Khi có file đó, cần lập ma trận yêu cầu → chức năng → bằng chứng thử nghiệm để đo tỷ lệ hoàn thành một cách kiểm chứng được.
