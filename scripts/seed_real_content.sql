-- Auto-generated seed from giao trinh TT02/2025
-- Real content from 6 curriculum markdown files
-- Run on production DB (digitalent)

DO $$
DECLARE
    v_org_id uuid;
    v_admin_id uuid;
    v_course_id uuid;
    v_module_id uuid;
    v_lesson_id uuid;
    v_bank_id uuid;
    v_question_id uuid;
    v_assessment_id uuid;
BEGIN
    SELECT id INTO v_org_id FROM organizations LIMIT 1;
    SELECT id INTO v_admin_id FROM users WHERE email = 'admin@digitalent.ai' LIMIT 1;

    IF NOT EXISTS (SELECT 1 FROM question_banks WHERE organization_id = v_org_id AND title = 'TT02 Quiz Bank') THEN
        v_bank_id := gen_random_uuid();
        INSERT INTO question_banks (id, organization_id, title, description, owner_user_id, status, created_at, updated_at)
        VALUES (v_bank_id, v_org_id, 'TT02 Quiz Bank', 'Ngan hang cau hoi trac nghiem TT02/2025', v_admin_id, 'ACTIVE', now(), now());
    ELSE
        SELECT id INTO v_bank_id FROM question_banks WHERE organization_id = v_org_id AND title = 'TT02 Quiz Bank';
    END IF;

    -- === M1-F ===
    SELECT id INTO v_course_id FROM courses WHERE code = 'M1-F' AND organization_id = v_org_id;
    IF v_course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM course_modules WHERE course_id = v_course_id) THEN
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M1-F-CH1', 'Chương 1: Tìm kiếm thông tin bằng từ khóa', 1, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M1-F-CH1-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Xác định được nhu cầu thông tin</li><li>Tìm được dữ liệu, thông tin và nội dung thông qua tìm kiếm đơn giản trong môi trường số</li><li>Tìm được cách truy cập những dữ liệu, thông tin và nội dung này cũng như điều hướng giữa chúng</li><li>Xác định được các chiến lược tìm kiếm đơn giản</li></ul><h2>Định nghĩa</h2><ul><li>Môi trường số (Điều 2, TT 02/2025/TT-BGDĐT): không gian ảo, nơi các hoạt động, dữ liệu, thông tin và nội dung được tạo ra, lưu trữ và trao đổi thông qua công nghệ số, như mạng Internet, phần mềm và các nền tảng trực tuyến</li><li>Điều hướng (Điều 2, TT 02/2025/TT-BGDĐT): quá trình định hướng và di chuyển trong một không gian vật lý hoặc kỹ thuật số nhằm xác định vị trí hiện tại và tìm ra đường đi đến đích mong muốn</li><li>Thông tin (Điều 2, TT 02/2025/TT-BGDĐT): dữ liệu đã được tổ chức, xử lý, hoặc phân tích để trở nên có ý nghĩa và có thể hiểu được và sử dụng để ra quyết định, giải quyết vấn đề hoặc truyền đạt ý tưởng</li><li>Công cụ tìm kiếm: dịch vụ khớp từ khóa người dùng nhập với chỉ mục các trang web đã thu thập sẵn, rồi xếp hạng kết quả theo mức độ liên quan</li><li>Từ khóa: các từ mang ý nghĩa chính được dùng để tìm kiếm, thường là danh từ, số, hoặc tên riêng</li><li>Kết quả tự nhiên (organic): kết quả được xếp hạng theo mức độ liên quan, không phải trả tiền</li><li>Kết quả được tài trợ (sponsored): kết quả xuất hiện do đơn vị trả phí quảng cáo</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M1-F-CH1-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Duyệt, tìm kiếm và lọc dữ liệu, thông tin và nội dung số nghĩa là xác định được nhu cầu thông tin và tìm kiếm được chúng trong môi trường số — không gian ảo nơi dữ liệu, thông tin và nội dung được tạo ra, lưu trữ và trao đổi qua Internet, phần mềm và nền tảng trực tuyến.</p><p>Công cụ tìm kiếm khớp từ khóa người dùng nhập với chỉ mục các trang đã thu thập sẵn, rồi xếp hạng theo mức độ liên quan — nó khớp CHỮ, không hiểu CÂU HỎI như con người. Vì vậy cần rút gọn câu hỏi thành 2–4 từ khóa mang nghĩa chính, thường là danh từ, số, hoặc tên riêng.</p><p>Điều hướng — quá trình định hướng và di chuyển trong không gian kỹ thuật số để tìm ra đường đi đến đích mong muốn — thể hiện qua việc đọc tiêu đề, đường dẫn, đoạn trích trên trang kết quả trước khi bấm vào. Kết quả tự nhiên khác với kết quả được tài trợ (quảng cáo trả phí). Khi lượt tìm đầu không ra kết quả phù hợp, cần biết cách đổi từ khóa — đây chính là chiến lược tìm kiếm đơn giản mà Thông tư 02/2025 yêu cầu người học xác định được ở bậc cơ bản.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M1-F-CH1-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Cấp trên nhắn bạn: “Tìm giúp anh mức lương tối thiểu vùng hiện tại, khu vực mình đang ở.” Hãy thực hiện:</p><p>- Viết từ khóa sẽ dùng - Thực hiện tìm kiếm thật - Nếu không ra kết quả tốt trong lần đầu, ghi lại đã đổi từ khóa như thế nào - Ghi lại đường dẫn của trang chính thức (cơ quan nhà nước) tìm được - Giới hạn: tối đa 3 lượt tìm Sản phẩm nộp: Nhật ký tìm kiếm (từ khóa dùng, số lần thử, lý do đổi nếu có) và đường dẫn nguồn chính thức tìm được.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M1-F-CH1-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M1-F-CH1-QUIZ', 1, 'Quiz chương 1: Tìm kiếm thông tin bằng từ khóa', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Công cụ tìm kiếm hoạt động bằng cách nào?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Quét toàn bộ Internet ngay lúc bạn gõ tìm kiếm', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tìm trong mục lục đã được xây dựng từ trước', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Hỏi trực tiếp các trang web', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ tìm trong các trang đã được xác minh', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Từ khóa nào sau đây hiệu quả nhất để tìm quy định về nghỉ phép năm?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Làm sao để xin nghỉ phép cho đúng', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'quy định nghỉ phép năm người lao động', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'nghỉ phép', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'tôi muốn biết về nghỉ phép năm', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Kết quả có nhãn “Được tài trợ” nghĩa là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Đây là kết quả chính xác nhất', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Trang này đã được kiểm chứng', false, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Đơn vị đó trả tiền để xuất hiện ở vị trí này', true, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Đây là kết quả mới nhất', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Tìm kiếm “dịch vụ ăn uống” chỉ ra toàn nhà hàng, trong khi bạn cần số liệu ngành ăn uống. Bạn nên làm gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tìm lại y hệt vào ngày khác', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Thêm từ như “báo cáo”, “thống kê” vào từ khóa', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Thêm nhiều từ nhỏ như “và”, “của”', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Bỏ cuộc và hỏi đồng nghiệp', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Đường dẫn (URL) của một kết quả cho bạn biết điều gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Trang đó có bao nhiêu lượt xem', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Ai là người/đơn vị đăng nội dung đó', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Trang đó có bao nhiêu quảng cáo', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Ngày trang được tạo', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M1-F-CH2', 'Chương 2: Nhận biết nguồn tin đáng tin cậy', 2, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M1-F-CH2-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Phát hiện được độ tin cậy và độ chính xác của các nguồn chung của dữ liệu, thông tin và nội dung số</li></ul><h2>Định nghĩa</h2><ul><li>Thông tin (Điều 2, TT 02/2025/TT-BGDĐT): dữ liệu đã được tổ chức, xử lý, hoặc phân tích để trở nên có ý nghĩa và có thể hiểu được và sử dụng để ra quyết định, giải quyết vấn đề hoặc truyền đạt ý tưởng</li><li>Dữ liệu (Điều 2, TT 02/2025/TT-BGDĐT): những con số hoặc dữ kiện rời rạc mà quan sát hoặc đo đếm được không cần có ngữ cảnh hay diễn giải; được thể hiện ra ngoài bằng cách mã hóa và dễ dàng truyền tải và được chuyển thành thông tin bằng cách thêm giá trị thông qua ngữ cảnh, phân loại, tính toán, hiệu chỉnh và đánh giá</li><li>Tên miền (domain): phần địa chỉ chính của một trang web, cho biết ai là đơn vị đứng sau trang đó</li><li>Đuôi tên miền: phần cuối của tên miền (.gov.vn, .com, .org…) thường gợi ý loại hình đơn vị sở hữu</li><li>Ngày công bố: thời điểm nội dung được đăng tải hoặc cập nhật lần gần nhất</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M1-F-CH2-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Đánh giá dữ liệu, thông tin và nội dung số nghĩa là phát hiện được độ tin cậy và độ chính xác của các nguồn chung. Thông tin là dữ liệu đã được tổ chức, xử lý để trở nên có ý nghĩa và dùng để ra quyết định — nhưng không phải thông tin nào tìm được cũng đáng tin.</p><p>Đường dẫn cho biết ai là đơn vị công bố. Đuôi tên miền như .gov.vn, .edu.vn, .org, .com mang ý nghĩa khác nhau về mức độ chính thức. Ngày công bố quan trọng vì thông tin có thể đã lỗi thời. Ba dấu hiệu cơ bản của tin không đáng tin: giật tít gây sốc, không có tác giả rõ ràng, không dẫn nguồn kiểm chứng được. Nhiều trang cùng nói một điều không có nghĩa là điều đó đúng — có thể tất cả cùng sao chép từ một nguồn sai.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M1-F-CH2-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Cho năm kết quả tìm kiếm về cùng một chủ đề (ví dụ quy mô thị trường bán lẻ Việt Nam), hãy xếp hạng theo độ tin cậy (1 là tin cậy nhất) và giải thích mỗi lựa chọn bằng một câu.</p><p>Sản phẩm nộp: Bảng xếp hạng 5 nguồn kèm lý do.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M1-F-CH2-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M1-F-CH2-QUIZ', 1, 'Quiz chương 2: Nhận biết nguồn tin đáng tin cậy', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Đuôi tên miền nào thường gắn với cơ quan nhà nước Việt Nam?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, '.com', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, '.gov.vn', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, '.net', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, '.info', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Một bài viết không ghi tên tác giả hay đơn vị xuất bản. Điều này có nghĩa gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Bài viết chắc chắn sai', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không ai chịu trách nhiệm nếu thông tin sai, nên cần thận trọng', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Bài viết được viết bởi chuyên gia ẩn danh', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không quan trọng, miễn nội dung đúng', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Với thông tin về mức giá hiện tại, yếu tố nào quan trọng nhất cần kiểm tra?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Độ dài bài viết', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Ngày công bố', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Số lượt chia sẻ', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Màu sắc trang web', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Tiêu đề “Sốc: Giá tăng gấp 10 lần chỉ sau một đêm!” là dấu hiệu của điều gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tin chính xác, cần hành động ngay', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tiêu đề giật gân, cần kiểm tra kỹ nội dung trước khi tin', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Bài viết khoa học', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Nguồn chính phủ', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', '.com có nghĩa là trang đó không đáng tin không?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Đúng, luôn luôn không đáng tin', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Sai, .com chỉ có nghĩa là doanh nghiệp/cá nhân đăng ký, cần đánh giá thêm', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Đúng, chỉ .gov.vn mới đáng tin', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, '.com chỉ dùng cho trang nước ngoài', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M1-F-CH3', 'Chương 3: Lưu trữ và sắp xếp tài liệu', 3, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M1-F-CH3-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Xác định được cách tổ chức, lưu trữ và truy xuất dữ liệu, thông tin và nội dung một cách đơn giản trong môi trường số</li><li>Nhận biết được nơi để sắp xếp chúng một cách đơn giản trong môi trường có cấu trúc</li></ul><h2>Định nghĩa</h2><ul><li>Dữ liệu (Điều 2, TT 02/2025/TT-BGDĐT): những con số hoặc dữ kiện rời rạc mà quan sát hoặc đo đếm được không cần có ngữ cảnh hay diễn giải; được thể hiện ra ngoài bằng cách mã hóa và dễ dàng truyền tải và được chuyển thành thông tin bằng cách thêm giá trị thông qua ngữ cảnh, phân loại, tính toán, hiệu chỉnh và đánh giá</li><li>Môi trường có cấu trúc (Điều 2, TT 02/2025/TT-BGDĐT): một không gian hoặc hệ thống trong đó các yếu tố, thành phần hoặc dữ liệu được tổ chức và sắp xếp theo một cách rõ ràng và có quy tắc, giúp dễ dàng tìm kiếm, truy cập và xử lý</li><li>Định dạng tệp: loại tệp được xác định bởi phần đuôi sau dấu chấm trong tên tệp (.pdf, .xlsx…), quyết định phần mềm nào mở được và có sửa được không</li><li>Thư mục: nơi chứa và tổ chức các tệp theo một cấu trúc nhất định</li><li>Quy tắc đặt tên: cách thống nhất đặt tên tệp để dễ tìm và sắp xếp đúng thứ tự</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M1-F-CH3-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Quản lý dữ liệu, thông tin và nội dung số nghĩa là xác định được cách tổ chức, lưu trữ và truy xuất chúng một cách đơn giản, và nhận biết nơi sắp xếp trong môi trường có cấu trúc — không gian mà các thành phần dữ liệu được tổ chức theo quy tắc rõ ràng, giúp dễ tìm kiếm và xử lý.</p><p>Các định dạng phổ biến — văn bản, bảng tính, trình chiếu, PDF, ảnh — mỗi loại phù hợp một mục đích khác nhau. Nên tải tệp có chủ đích thay vì để mặc định. Quy tắc đặt tên nhất quán (ngày trước, không dấu, không ký tự đặc biệt) giúp dễ tìm lại. Thư mục cơ bản nên phân theo chủ đề hoặc dự án. Cần phân biệt giữa lưu (ghi đè bản cũ) và lưu thành bản mới (tạo phiên bản riêng) để tránh mất dữ liệu gốc.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M1-F-CH3-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Tìm và tải ba tài liệu (PDF hoặc Excel) về một chủ đề công việc tự chọn. Tạo một thư mục mới đặt tên rõ ràng, đổi tên cả ba tệp theo công thức trên, và chụp ảnh màn hình thư mục hoàn chỉnh.</p><p>Sản phẩm nộp: Ảnh chụp thư mục chứa 3 tệp đặt tên đúng quy ước.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M1-F-CH3-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M1-F-CH3-QUIZ', 1, 'Quiz chương 3: Lưu trữ và sắp xếp tài liệu', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Bạn nhận được số liệu cần chỉnh sửa. Bạn nên yêu cầu định dạng nào?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, '.pdf', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, '.jpg', false, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, '.xlsx', true, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, '.pptx', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Mặc định, trình duyệt lưu file tải về ở đâu?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Thư mục Documents', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Thư mục Downloads', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Màn hình chính', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Ngẫu nhiên', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Tên tệp nào đúng quy tắc nhất?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'bao-cao-final-v2-that.docx', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, '2026-04-09_bao-cao-thang4.docx', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'document1.docx', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'BÁO CÁO MỚI!!.docx', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao nên đặt ngày ở đầu tên tệp theo định dạng năm-tháng-ngày?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Để tên ngắn hơn', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Để khi sắp xếp theo tên, tệp tự xếp theo thứ tự thời gian', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Vì máy tính yêu cầu', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có lý do đặc biệt', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'File PDF phù hợp nhất cho mục đích nào?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tính toán số liệu', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chia sẻ tài liệu giữ nguyên bố cục để in hoặc gửi', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Vẽ biểu đồ', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Soạn thảo cần chỉnh sửa nhiều', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M1-F-FINAL', 'Đánh giá cuối khóa', 4, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M1-F-FINAL-A', 'Bài đánh giá cuối khóa', 'ASSIGNMENT', '<p>Quản lý nhắn: “Em tìm giúp anh vài thông tin cơ bản về [chủ đề công việc], anh cần trước cuối ngày.” Hãy hoàn thành:</p><p>- Viết từ khóa sẽ dùng để tìm - Tìm 3 nguồn, đánh giá sơ bộ độ tin cậy mỗi nguồn bằng 1 câu - Tải 1 tệp về, lưu vào thư mục đặt tên đúng quy ước - Viết 5 gạch đầu dòng tóm tắt thông tin tìm được, mỗi gạch đầu dòng ghi rõ lấy từ nguồn nào Hình thức nộp: 1 tài liệu tổng hợp (tối đa 1 trang) và ảnh chụp thư mục.</p><p>Tiêu chí chấm:</p><p>Điểm đạt: ≥70/100.</p>', 60, 1, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M1-F-FINAL', 1, 'Đánh giá cuối khóa — TÌM KIẾM VÀ LƯU TRỮ THÔNG TIN CƠ BẢN', 'FINAL', true, 70, 1, 'PUBLISHED', v_admin_id, now(), now());
    END IF;
    RAISE NOTICE 'Done: M1-F';
    -- === M1-I ===
    SELECT id INTO v_course_id FROM courses WHERE code = 'M1-I' AND organization_id = v_org_id;
    IF v_course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM course_modules WHERE course_id = v_course_id) THEN
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M1-I-CH1', 'Chương 1: Chiến lược tìm kiếm và toán tử', 1, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M1-I-CH1-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Minh họa được nhu cầu thông tin</li><li>Tổ chức được tìm kiếm dữ liệu, thông tin và nội dung trong môi trường số</li><li>Mô tả được cách truy cập những dữ liệu, thông tin và nội dung này cũng như điều hướng giữa chúng</li><li>Tổ chức được các chiến lược tìm kiếm</li></ul><h2>Định nghĩa</h2><ul><li>Môi trường số (Điều 2, TT 02/2025/TT-BGDĐT): không gian ảo, nơi các hoạt động, dữ liệu, thông tin và nội dung được tạo ra, lưu trữ và trao đổi thông qua công nghệ số, như mạng Internet, phần mềm và các nền tảng trực tuyến</li><li>Điều hướng (Điều 2, TT 02/2025/TT-BGDĐT): quá trình định hướng và di chuyển trong một không gian vật lý hoặc kỹ thuật số nhằm xác định vị trí hiện tại và tìm ra đường đi đến đích mong muốn</li><li>Thông tin (Điều 2, TT 02/2025/TT-BGDĐT): dữ liệu đã được tổ chức, xử lý, hoặc phân tích để trở nên có ý nghĩa và có thể hiểu được và sử dụng để ra quyết định, giải quyết vấn đề hoặc truyền đạt ý tưởng</li><li>Nhu cầu thông tin: mô tả cụ thể về phạm vi, thời gian, mức chi tiết và sản phẩm đầu ra cần có trước khi bắt đầu tìm kiếm</li><li>Ma trận từ khóa: bảng liệt kê từ khóa lõi cùng các từ đồng nghĩa, từ thu hẹp, từ mở rộng liên quan</li><li>Toán tử tìm kiếm: ký hiệu đặc biệt (" ", site:, filetype:…) giúp thu hẹp hoặc mở rộng kết quả tìm kiếm theo ý muốn</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M1-I-CH1-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Ở mức trung cấp, việc tổ chức tìm kiếm dữ liệu và mô tả cách truy cập, điều hướng đòi hỏi trước tiên minh họa rõ nhu cầu thông tin: phạm vi, thời gian, mức chi tiết, và sản phẩm đầu ra mong muốn trước khi bắt đầu tìm kiếm.</p><p>Ma trận từ khóa — bảng liệt kê từ khóa lõi cùng từ đồng nghĩa, từ thu hẹp, từ mở rộng — giúp tổ chức chiến lược tìm kiếm có hệ thống thay vì tìm ngẫu nhiên. Toán tử tìm kiếm (dấu ngoặc kép để khóa cụm từ, site: để giới hạn nguồn, filetype: để lọc định dạng, dấu trừ để loại trừ) giúp thu hẹp hoặc mở rộng kết quả theo ý muốn. Chọn công cụ tìm kiếm phù hợp với loại nguồn cần tìm, và biết quy tắc dừng tìm kiếm khi đã đủ thông tin cần thiết.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M1-I-CH1-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Tìm văn bản quy định chính thức về một chủ đề (ví dụ an toàn thực phẩm, bảo vệ dữ liệu cá nhân), dạng PDF, ban hành trong ba năm gần nhất. Không được duyệt menu trang web — chỉ dùng toán tử. Ghi lại từng bước tinh chỉnh câu truy vấn (tối thiểu năm bước) và nộp đường dẫn văn bản gốc tìm được.</p><p>Sản phẩm nộp: Ma trận từ khóa, nhật ký tinh chỉnh truy vấn, đường dẫn văn bản gốc.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M1-I-CH1-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M1-I-CH1-QUIZ', 1, 'Quiz chương 1: Chiến lược tìm kiếm và toán tử', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'site:gov.vn "an toàn thực phẩm" filetype:pdf sẽ trả về kết quả nào?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tất cả trang nói về an toàn thực phẩm', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ file PDF trên các trang chính phủ có đúng cụm từ này', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ tin tức', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không ra kết quả nào', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Để loại bỏ kết quả về tuyển sinh khi tìm về đào tạo nhân viên, dùng cú pháp nào?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, '+tuyển sinh', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, '-tuyển-sinh', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, '"tuyển sinh"', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'site:tuyensinh', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao cần xây nhiều vựng từ đồng nghĩa thay vì chỉ một bộ từ khóa?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Để tìm nhanh hơn', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Vì các đơn vị khác nhau dùng từ ngữ khác nhau cho cùng khái niệm', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Vì công cụ yêu cầu', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Để tránh trùng lặp', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'OR phải viết như thế nào để có tác dụng?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Viết thường “or”', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Viết hoa “OR”', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không quan trọng', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Phải có dấu ngoặc', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Trước khi tìm kiếm, bước đầu tiên nên làm là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Gõ ngay câu hỏi vào công cụ tìm kiếm', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Xác định rõ phạm vi, thời gian, mức chi tiết, sản phẩm cần có', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Mở nhiều tab cùng lúc', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Hỏi đồng nghiệp trước', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M1-I-CH2', 'Chương 2: Đánh giá và so sánh nguồn tin', 2, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M1-I-CH2-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Thực hiện phân tích, so sánh và đánh giá được các nguồn dữ liệu, thông tin và nội dung số</li><li>Thực hiện phân tích, diễn giải và đánh giá được dữ liệu, thông tin và nội dung số</li></ul><h2>Định nghĩa</h2><ul><li>Thông tin (Điều 2, TT 02/2025/TT-BGDĐT): dữ liệu đã được tổ chức, xử lý, hoặc phân tích để trở nên có ý nghĩa và có thể hiểu được và sử dụng để ra quyết định, giải quyết vấn đề hoặc truyền đạt ý tưởng</li><li>Dữ liệu (Điều 2, TT 02/2025/TT-BGDĐT): những con số hoặc dữ kiện rời rạc mà quan sát hoặc đo đếm được không cần có ngữ cảnh hay diễn giải; được thể hiện ra ngoài bằng cách mã hóa và dễ dàng truyền tải và được chuyển thành thông tin bằng cách thêm giá trị thông qua ngữ cảnh, phân loại, tính toán, hiệu chỉnh và đánh giá</li><li>Tiêu chí đánh giá nguồn tin: các yếu tố dùng để xét độ tin cậy của một nguồn — tác giả, thời điểm, mục đích, bằng chứng, khả năng kiểm chứng</li><li>Nguồn sơ cấp: nơi số liệu hoặc thông tin được tạo ra lần đầu tiên</li><li>Nguồn thứ cấp: nơi trích dẫn hoặc tổng hợp lại từ nguồn sơ cấp</li><li>Trích dẫn vòng: hiện tượng nhiều nguồn cùng trích dẫn lẫn nhau nhưng thực chất bắt nguồn từ một nguồn gốc duy nhất chưa kiểm chứng</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M1-I-CH2-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Ở mức trung cấp, việc thực hiện phân tích, so sánh và đánh giá độ tin cậy của nguồn dữ liệu đã được tổ chức rõ ràng đòi hỏi áp dụng năm tiêu chí: tác giả, thời điểm, mục đích, bằng chứng, khả năng kiểm chứng.</p><p>Cần phân biệt nguồn sơ cấp (nơi thông tin được tạo ra lần đầu) và nguồn thứ cấp (nơi trích dẫn hoặc tổng hợp lại). Hiện tượng trích dẫn vòng xảy ra khi nhiều nguồn cùng trích dẫn lẫn nhau nhưng thực chất bắt nguồn từ một nguồn gốc duy nhất chưa kiểm chứng. Khi các nguồn uy tín đưa ra số liệu khác nhau, thường do khác biệt về định nghĩa hoặc phương pháp đo lường — nên báo cáo khoảng giá trị thay vì một con số duy nhất khi các nguồn còn mâu thuẫn.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M1-I-CH2-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Cấp trên cần một con số cho slide, ví dụ “số lượng doanh nghiệp vừa và nhỏ tại Việt Nam.” Tìm ba nguồn khác nhau, lập bảng so sánh năm cột như trên, chỉ ra ít nhất một điểm khác biệt về định nghĩa hoặc phương pháp, và viết hai câu khuyến nghị nên dùng con số nào và vì sao.</p><p>Sản phẩm nộp: Bảng so sánh ba nguồn kèm đoạn giải trình lựa chọn.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M1-I-CH2-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M1-I-CH2-QUIZ', 1, 'Quiz chương 2: Đánh giá và so sánh nguồn tin', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Nguồn sơ cấp là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Nguồn được xuất bản đầu tiên trên Google', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Nơi số liệu được tạo ra ban đầu', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Trang có nhiều lượt xem nhất', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Trang chính phủ', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Năm trang web cùng trích “theo một nghiên cứu” nhưng đều dẫn về một bài blog gốc chưa kiểm chứng. Đây là hiện tượng gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Bằng chứng đáng tin vì nhiều nguồn xác nhận', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Hiện tượng trích dẫn vòng — không phải xác nhận độc lập', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Dấu hiệu thông tin chính xác', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có vấn đề gì', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Hai nguồn uy tín đưa số liệu khác nhau về cùng một chỉ tiêu. Nguyên nhân phổ biến nhất là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Một trong hai chắc chắn sai', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Khác biệt về định nghĩa, kỳ báo cáo hoặc phương pháp đo', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Lỗi đánh máy', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có nguyên nhân hợp lý', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Tiêu chí nào trong năm tiêu chí đánh giá kiểm tra xem trang có mục đích bán hàng hay không?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tác giả', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Mục đích', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Bằng chứng', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Khả năng kiểm chứng', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khi so sánh hai nguồn có số liệu khác nhau, bước đầu tiên nên làm là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chọn số liệu cao hơn', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'So sánh định nghĩa và phương pháp trước khi so sánh con số', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Lấy trung bình cộng', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Bỏ qua cả hai', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M1-I-CH3', 'Chương 3: Tổ chức và quản lý khối lượng thông tin lớn', 3, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M1-I-CH3-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Sắp xếp được thông tin, dữ liệu, nội dung để dễ dàng lưu trữ và truy xuất</li><li>Tổ chức được thông tin, dữ liệu và nội dung trong một môi trường có cấu trúc</li></ul><h2>Định nghĩa</h2><ul><li>Dữ liệu (Điều 2, TT 02/2025/TT-BGDĐT): những con số hoặc dữ kiện rời rạc mà quan sát hoặc đo đếm được không cần có ngữ cảnh hay diễn giải; được thể hiện ra ngoài bằng cách mã hóa và dễ dàng truyền tải và được chuyển thành thông tin bằng cách thêm giá trị thông qua ngữ cảnh, phân loại, tính toán, hiệu chỉnh và đánh giá</li><li>Môi trường có cấu trúc (Điều 2, TT 02/2025/TT-BGDĐT): một không gian hoặc hệ thống trong đó các yếu tố, thành phần hoặc dữ liệu được tổ chức và sắp xếp theo một cách rõ ràng và có quy tắc, giúp dễ dàng tìm kiếm, truy cập và xử lý</li><li>Kiến trúc thông tin: cách tổ chức, phân nhóm và đặt tên tài liệu theo một logic nhất quán</li><li>Sổ đăng ký tài liệu: bảng liệt kê thông tin về mọi tài liệu trong một dự án để dễ tìm và báo cáo</li><li>Nguyên tắc quyền tối thiểu: chỉ cấp mức quyền truy cập thấp nhất đủ để hoàn thành công việc</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M1-I-CH3-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Ở mức trung cấp, việc sắp xếp thông tin để dễ lưu trữ và tổ chức trong môi trường có cấu trúc mở rộng sang quản lý khối lượng thông tin lớn cho cả một dự án nhiều luồng công việc.</p><p>Kiến trúc thông tin cần phân nhóm loại trừ lẫn nhau và giới hạn độ sâu thư mục để không quá phức tạp. Sổ đăng ký tài liệu ghi lại các trường bắt buộc (tên, chủ đề, phiên bản, người phụ trách) giúp tra cứu nhanh. Cần phân biệt lưu trữ cục bộ, đám mây, và thư mục dùng chung — đồng bộ không phải là sao lưu, vì thay đổi sai ở một nơi sẽ lan sang nơi khác. Nguyên tắc quyền tối thiểu áp dụng khi chia sẻ: chỉ cấp quyền cần thiết cho từng người.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M1-I-CH3-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Cho một thư mục hỗn độn gồm nhiều loại tài liệu (hợp đồng, hóa đơn, ghi chú họp, báo cáo, hình ảnh). Thiết kế cấu trúc thư mục (tối đa bốn cấp), lập sổ đăng ký với tối thiểu 20 dòng, và viết quy tắc phân loại thành văn bản.</p><p>Sản phẩm nộp: Ảnh chụp thư mục đã tái cấu trúc, sổ đăng ký, và tệp quy ước.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M1-I-CH3-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M1-I-CH3-QUIZ', 1, 'Quiz chương 3: Tổ chức và quản lý khối lượng thông tin lớn', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao nên giới hạn độ sâu thư mục ở khoảng bốn cấp?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Do giới hạn kỹ thuật của máy tính', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Vượt quá mức đó người dùng thường không lưu đúng chỗ nữa', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Để tiết kiệm dung lượng', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có lý do cụ thể', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Sổ đăng ký tài liệu dùng để làm gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Thay thế thư mục', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Giúp tìm và báo cáo theo thuộc tính tài liệu', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để trang trí', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần thiết nếu đã có thư mục', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Nguyên tắc quyền tối thiểu nghĩa là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Cấp quyền cao nhất cho tất cả để tiện lợi', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Cấp mức quyền thấp nhất đủ để hoàn thành công việc', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cấp quyền cho ai', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ quản lý mới có quyền', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Tài liệu nhạy cảm nên được chia sẻ bằng cách nào?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Bất kỳ ai có liên kết, quyền chỉnh sửa', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chia sẻ với người cụ thể theo tên, quyền hạn chế', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Đăng công khai để minh bạch', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Gửi qua email cho toàn công ty', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Trộn hai cách phân loại (theo dự án và theo loại tài liệu) ở cùng một cấp thư mục gây ra vấn đề gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có vấn đề gì', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Gây khó khăn khi quyết định lưu tệp vào đâu', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tăng tốc độ tìm kiếm', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Giảm dung lượng lưu trữ', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M1-I-FINAL', 'Đánh giá cuối khóa', 4, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M1-I-FINAL-A', 'Bài đánh giá cuối khóa', 'ASSIGNMENT', '<p>Ban giám đốc cân nhắc một quyết định kinh doanh và yêu cầu “một bản tóm tắt đúng nghĩa, không phải đống link.” Hãy hoàn thành:</p><p>- Viết nhu cầu thông tin đầy đủ (phạm vi, thời gian, mức chi tiết, sản phẩm) - Xây ma trận từ khóa, chạy tối thiểu 8 truy vấn có toán tử, ghi log - Thu thập 5 nguồn (tối thiểu 2 sơ cấp) - Lập bảng so sánh cho chỉ số quan trọng nhất - Viết bản tóm tắt 1 trang: điều đã biết, điều còn tranh cãi, con số khuyến nghị và lý do Tiêu chí chấm:</p><p>Điểm đạt: ≥70/100.</p>', 60, 1, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M1-I-FINAL', 1, 'Đánh giá cuối khóa — CHIẾN LƯỢC TÌM KIẾM VÀ QUẢN LÝ THÔNG TIN', 'FINAL', true, 70, 1, 'PUBLISHED', v_admin_id, now(), now());
    END IF;
    RAISE NOTICE 'Done: M1-I';
    -- === M1-A ===
    SELECT id INTO v_course_id FROM courses WHERE code = 'M1-A' AND organization_id = v_org_id;
    IF v_course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM course_modules WHERE course_id = v_course_id) THEN
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M1-A-CH1', 'Chương 1: Nghiên cứu phức hợp đa nguồn', 1, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M1-A-CH1-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Đánh giá được nhu cầu thông tin</li><li>Điều chỉnh được chiến lược tìm kiếm để tìm ra dữ liệu, thông tin và nội dung phù hợp nhất trong môi trường số</li><li>Giải thích được cách truy cập những dữ liệu, thông tin và nội dung thích hợp nhất và điều hướng giữa chúng</li><li>Sử dụng linh hoạt và đa dạng chiến lược tìm kiếm</li></ul><h2>Định nghĩa</h2><ul><li>Môi trường số (Điều 2, TT 02/2025/TT-BGDĐT): không gian ảo, nơi các hoạt động, dữ liệu, thông tin và nội dung được tạo ra, lưu trữ và trao đổi thông qua công nghệ số, như mạng Internet, phần mềm và các nền tảng trực tuyến</li><li>Điều hướng (Điều 2, TT 02/2025/TT-BGDĐT): quá trình định hướng và di chuyển trong một không gian vật lý hoặc kỹ thuật số nhằm xác định vị trí hiện tại và tìm ra đường đi đến đích mong muốn</li><li>Thông tin (Điều 2, TT 02/2025/TT-BGDĐT): dữ liệu đã được tổ chức, xử lý, hoặc phân tích để trở nên có ý nghĩa và có thể hiểu được và sử dụng để ra quyết định, giải quyết vấn đề hoặc truyền đạt ý tưởng</li><li>Tam giác hóa: phương pháp dùng từ ba nguồn độc lập trở lên để xác lập một khoảng giá trị đáng tin cậy</li><li>Khoảng trống thông tin: phần dữ liệu cần thiết nhưng không có sẵn, cần được ước lượng có căn cứ hoặc thu thập thêm</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M1-A-CH1-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Ở mức nâng cao, việc đánh giá nhu cầu thông tin và điều chỉnh chiến lược tìm kiếm phù hợp nhất trong bối cảnh phức tạp đòi hỏi thiết kế cả một phương pháp nghiên cứu, không chỉ một lượt tìm kiếm đơn lẻ.</p><p>Từ một câu hỏi kinh doanh mơ hồ, cần xây dựng kế hoạch nghiên cứu rõ ràng, phối hợp nguồn bên ngoài (báo cáo ngành, số liệu chính thức) với dữ liệu nội bộ của doanh nghiệp. Tam giác hóa — dùng từ ba nguồn độc lập trở lên để xác lập một khoảng giá trị đáng tin cậy — giúp tăng độ tin cậy của kết luận. Khi dữ liệu không tồn tại, cần nhận diện khoảng trống thông tin và đưa ra ước lượng có căn cứ thay vì bỏ qua. Ở mức này, người học còn cần hướng dẫn được đồng nghiệp cách tìm kiếm hiệu quả — đúng như Thông tư mô tả “hướng dẫn người khác” ở bậc 5.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M1-A-CH1-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Doanh nghiệp cân nhắc một quyết định kinh doanh quan trọng. Xây kế hoạch nghiên cứu theo khung bốn bước, thu thập bằng chứng từ tối thiểu hai loại nguồn (bên ngoài và nội bộ), xác định rõ phần nào còn là khoảng trống thông tin và đề xuất cách ước lượng, rồi trình bày phần bằng chứng thu được và phần còn thiếu cho nhóm.</p><p>Sản phẩm nộp: Kế hoạch nghiên cứu, hồ sơ bằng chứng, danh mục khoảng trống thông tin.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M1-A-CH1-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M1-A-CH1-QUIZ', 1, 'Quiz chương 1: Nghiên cứu phức hợp đa nguồn', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Bước đầu tiên khi đối mặt với một vấn đề nghiên cứu chưa rõ ràng là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tìm kiếm ngay trên Google', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Xác định quyết định nào đang cần được đưa ra', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Hỏi ý kiến đồng nghiệp', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Thu thập càng nhiều dữ liệu càng tốt', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao cần phối hợp cả nguồn bên ngoài và nội bộ khi nghiên cứu mở rộng thị trường?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Để có nhiều số liệu hơn', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Nguồn bên ngoài cho biết thị trường, nguồn nội bộ cho biết vị trí thực tế của doanh nghiệp', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Vì quy định yêu cầu', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần thiết, một loại là đủ', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khi dữ liệu cần thiết không tồn tại, cách xử lý đúng là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Bỏ qua vấn đề đó', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Nêu rõ khoảng trống và đưa ra ước lượng có căn cứ, ghi rõ đó là ước lượng', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Giả định một con số bất kỳ', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Trì hoãn toàn bộ nghiên cứu', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Tam giác hóa trong nghiên cứu nghĩa là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Vẽ biểu đồ hình tam giác', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Dùng ít nhất ba nguồn độc lập để xác lập khoảng giá trị đáng tin', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chia dữ liệu thành ba phần', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Kiểm tra dữ liệu ba lần', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Hướng dẫn đồng nghiệp tìm kiếm hiệu quả bao gồm việc gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tự làm hết thay họ', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chia sẻ mẫu chiến lược tìm kiếm và review cách đặt câu hỏi', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không can thiệp', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ giao việc mà không hướng dẫn', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M1-A-CH2', 'Chương 2: Đánh giá chất lượng dữ liệu', 2, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M1-A-CH2-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Đánh giá có tính phê phán được độ tin cậy và độ chính xác của các nguồn dữ liệu, thông tin và nội dung số</li><li>Đánh giá có tính phê phán được dữ liệu, thông tin và nội dung số</li></ul><h2>Định nghĩa</h2><ul><li>Thông tin (Điều 2, TT 02/2025/TT-BGDĐT): dữ liệu đã được tổ chức, xử lý, hoặc phân tích để trở nên có ý nghĩa và có thể hiểu được và sử dụng để ra quyết định, giải quyết vấn đề hoặc truyền đạt ý tưởng</li><li>Dữ liệu (Điều 2, TT 02/2025/TT-BGDĐT): những con số hoặc dữ kiện rời rạc mà quan sát hoặc đo đếm được không cần có ngữ cảnh hay diễn giải; được thể hiện ra ngoài bằng cách mã hóa và dễ dàng truyền tải và được chuyển thành thông tin bằng cách thêm giá trị thông qua ngữ cảnh, phân loại, tính toán, hiệu chỉnh và đánh giá</li><li>Chất lượng dữ liệu: mức độ dữ liệu đáp ứng được sáu tiêu chí — chính xác, đầy đủ, nhất quán, kịp thời, hợp lệ, duy nhất</li><li>Biện pháp phòng ngừa: hành động chặn dữ liệu sai ngay tại điểm nhập liệu</li><li>Biện pháp phát hiện: hành động tìm ra dữ liệu sai sau khi đã được nhập vào hệ thống</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M1-A-CH2-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Ở mức nâng cao, việc đánh giá có tính phê phán độ tin cậy và độ chính xác của nguồn dữ liệu mở rộng thành đánh giá chất lượng dữ liệu một cách hệ thống theo sáu chiều: chính xác, đầy đủ, nhất quán, kịp thời, hợp lệ, duy nhất.</p><p>Cần viết được quy tắc kiểm tra dữ liệu có thể áp dụng máy móc (ví dụ: số điện thoại phải đủ 10 chữ số). Biện pháp phòng ngừa được đặt tại điểm nhập liệu để chặn lỗi từ đầu; biện pháp phát hiện dùng báo cáo ngoại lệ và đối chiếu để tìm lỗi đã lọt qua. Xây bảng điểm chất lượng dữ liệu có ngưỡng cụ thể và người chịu trách nhiệm giúp duy trì chất lượng theo thời gian, đồng thời cần phân biệt dữ liệu sai với dữ liệu chỉ đơn thuần bất thường.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M1-A-CH2-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Cho một tập dữ liệu khách hàng thật của doanh nghiệp, hãy chấm điểm cả sáu chiều bằng số liệu cụ thể (ví dụ tính phần trăm trường trống), đề xuất tối thiểu sáu quy tắc kiểm tra, và với mỗi biện pháp cải thiện đề xuất, phân loại là phòng ngừa hay phát hiện, gán người phụ trách.</p><p>Sản phẩm nộp: Bảng điểm chất lượng dữ liệu, bộ quy tắc kiểm tra, kế hoạch kiểm soát.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M1-A-CH2-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M1-A-CH2-QUIZ', 1, 'Quiz chương 2: Đánh giá chất lượng dữ liệu', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Một email đúng định dạng nhưng gán sai cho khách hàng khác là vi phạm chiều nào?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Hợp lệ', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chính xác', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Đầy đủ', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Duy nhất', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Biện pháp nào sau đây là biện pháp phòng ngừa?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Báo cáo ngoại lệ hàng tuần', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Danh sách chọn sẵn bắt buộc khi nhập liệu', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Đối chiếu dữ liệu định kỳ', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Rà soát thủ công cuối tháng', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Một khách hàng có ba mã khách hàng khác nhau trong hệ thống là vấn đề của chiều nào?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Kịp thời', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Duy nhất', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Hợp lệ', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chính xác', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao nên ưu tiên biện pháp phòng ngừa hơn phát hiện?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Phòng ngừa rẻ hơn luôn luôn', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Phòng ngừa giải quyết tận gốc, giảm nhu cầu dọn dẹp lặp lại', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Phát hiện không hiệu quả', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có sự khác biệt', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Bảng điểm chất lượng dữ liệu cần có yếu tố nào để thực sự thúc đẩy cải thiện?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần con số phần trăm', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Ngưỡng mục tiêu và người chịu trách nhiệm cụ thể', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Màu sắc đẹp', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Càng nhiều chiều đo càng tốt', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M1-A-CH3', 'Chương 3: Quản trị dữ liệu và vòng đời thông tin', 3, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M1-A-CH3-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Điều chỉnh được việc quản lý thông tin, dữ liệu và nội dung để dễ dàng nhất cho việc thu hồi và lưu trữ</li><li>Điều chỉnh được thông tin, dữ liệu và nội dung để chúng được tổ chức và sắp xếp trong môi trường có cấu trúc phù hợp nhất</li></ul><h2>Định nghĩa</h2><ul><li>Dữ liệu (Điều 2, TT 02/2025/TT-BGDĐT): những con số hoặc dữ kiện rời rạc mà quan sát hoặc đo đếm được không cần có ngữ cảnh hay diễn giải; được thể hiện ra ngoài bằng cách mã hóa và dễ dàng truyền tải và được chuyển thành thông tin bằng cách thêm giá trị thông qua ngữ cảnh, phân loại, tính toán, hiệu chỉnh và đánh giá</li><li>Môi trường có cấu trúc (Điều 2, TT 02/2025/TT-BGDĐT): một không gian hoặc hệ thống trong đó các yếu tố, thành phần hoặc dữ liệu được tổ chức và sắp xếp theo một cách rõ ràng và có quy tắc, giúp dễ dàng tìm kiếm, truy cập và xử lý</li><li>Quản trị dữ liệu: hệ thống các quy tắc, vai trò và quy trình đảm bảo dữ liệu được định nghĩa, sử dụng và bảo vệ nhất quán trong tổ chức</li><li>Từ điển dữ liệu: bảng mô tả chi tiết từng trường dữ liệu — định nghĩa, kiểu, giá trị hợp lệ, nguồn, chủ sở hữu</li><li>Nguồn chân lý duy nhất: hệ thống được chỉ định là nguồn chính thức cho một chỉ tiêu, mọi bản sao khác chỉ mang tính tham khảo</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M1-A-CH3-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Ở mức nâng cao, việc điều chỉnh quản lý thông tin và tổ chức môi trường có cấu trúc phù hợp nhất trong bối cảnh phức tạp mở rộng thành quản trị dữ liệu và vòng đời thông tin cấp tổ chức.</p><p>Ba vai trò cần được phân định rõ: chủ sở hữu dữ liệu (chịu trách nhiệm cuối cùng), người quản lý dữ liệu (duy trì chất lượng hàng ngày), người vận hành (sử dụng dữ liệu trong công việc). Từ điển dữ liệu ghi lại tên trường, định nghĩa, kiểu dữ liệu, giá trị hợp lệ, nguồn gốc và mức nhạy cảm cho một tập dữ liệu cốt lõi. Khái niệm dữ liệu chủ và nguồn chân lý duy nhất giúp chấm dứt tình trạng các bộ phận báo cáo số liệu khác nhau cho cùng một chỉ tiêu. Lịch lưu trữ và hủy dữ liệu cần tuân theo yêu cầu pháp lý và nghiệp vụ.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M1-A-CH3-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Hai bộ phận trong doanh nghiệp báo cáo số khách hàng khác nhau mỗi tháng, gây tranh cãi liên tục. Xây từ điển dữ liệu tối thiểu 10 trường, phân định ba vai trò cho tập dữ liệu này, thống nhất một định nghĩa cho chỉ tiêu đang gây tranh cãi, và lập lịch lưu trữ cho ba loại dữ liệu khác nhau trong doanh nghiệp.</p><p>Sản phẩm nộp: Từ điển dữ liệu (≥10 trường), bảng phân vai, định nghĩa chỉ tiêu thống nhất, lịch lưu trữ.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M1-A-CH3-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M1-A-CH3-QUIZ', 1, 'Quiz chương 3: Quản trị dữ liệu và vòng đời thông tin', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Hai bộ phận báo cáo số khách hàng khác nhau. Cách xử lý đúng theo quản trị dữ liệu là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tính lại số liệu', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Thống nhất và ghi lại một định nghĩa trong từ điển dữ liệu', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Dùng số liệu cao hơn', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Lấy trung bình cộng', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Người quản lý dữ liệu (data steward) có vai trò gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chịu trách nhiệm cuối cùng và phê duyệt quyền truy cập', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Duy trì chất lượng và định nghĩa dữ liệu hàng ngày', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Vận hành hạ tầng kỹ thuật', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có vai trò cụ thể', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', '“Nguồn chân lý duy nhất” nghĩa là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Nguồn dữ liệu duy nhất tồn tại', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Một hệ thống được chỉ định là nguồn chính thức cho một chỉ tiêu, các bản khác chỉ là bản sao', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ có một người được xem dữ liệu', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Dữ liệu không bao giờ thay đổi', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Lịch lưu trữ và hủy dữ liệu nên được quyết định dựa trên điều gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Dung lượng lưu trữ còn trống', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Yêu cầu pháp lý và nhu cầu nghiệp vụ', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Sở thích cá nhân của quản lý', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần quyết định, giữ mãi mãi là an toàn nhất', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Từ điển dữ liệu chủ yếu giúp giải quyết vấn đề gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tăng tốc độ xử lý dữ liệu', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tranh cãi số liệu do khác biệt định nghĩa giữa các bộ phận', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Giảm dung lượng lưu trữ', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Mã hóa dữ liệu', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M1-A-FINAL', 'Đánh giá cuối khóa', 4, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M1-A-FINAL-A', 'Bài đánh giá cuối khóa', 'ASSIGNMENT', '<p>Ban giám đốc cần ra một quyết định kinh doanh quan trọng, nhưng dữ liệu nội bộ đang bị nghi ngờ về độ tin cậy. Hãy hoàn thành:</p><p>- Thực hiện nghiên cứu đa nguồn theo khung bốn bước - Đánh giá chất lượng một tập dữ liệu nội bộ liên quan theo sáu chiều - Xây bộ tài liệu quản trị: từ điển dữ liệu, phân vai, định nghĩa thống nhất - Viết báo cáo tổng hợp: khuyến nghị quyết định, mức độ tin cậy, giới hạn của phân tích Tiêu chí chấm:</p><p>Điểm đạt: ≥70/100, không tiêu chí nào dưới 50%.</p>', 60, 1, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M1-A-FINAL', 1, 'Đánh giá cuối khóa — PHÂN TÍCH THÔNG TIN VÀ QUẢN TRỊ DỮ LIỆU', 'FINAL', true, 70, 1, 'PUBLISHED', v_admin_id, now(), now());
    END IF;
    RAISE NOTICE 'Done: M1-A';
    -- === M2-F ===
    SELECT id INTO v_course_id FROM courses WHERE code = 'M2-F' AND organization_id = v_org_id;
    IF v_course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM course_modules WHERE course_id = v_course_id) THEN
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M2-F-CH1', 'Chương 1: Công cụ giao tiếp cơ bản', 1, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-F-CH1-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Lựa chọn được các công nghệ số đơn giản để tương tác</li><li>Xác định được các phương tiện giao tiếp đơn giản thích hợp cho một bối cảnh cụ thể</li></ul><h2>Định nghĩa</h2><ul><li>Phương tiện giao tiếp số (Điều 2, TT 02/2025/TT-BGDĐT): các nền tảng, công cụ và nội dung được tạo ra, lưu trữ, phân phối và truy cập thông qua công nghệ số, bao gồm mạng Internet, mạng xã hội, ứng dụng di động, các thiết bị điện tử</li><li>Đến (To): người nhận chính, người cần hành động</li><li>CC (Carbon Copy): người được thông báo để biết, không cần hành động</li><li>BCC (Blind Carbon Copy): người nhận ẩn, các người nhận khác không thấy nhau</li><li>Kênh giao tiếp: phương tiện dùng để truyền thông điệp — email, tin nhắn, họp trực tuyến, gọi điện</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-F-CH1-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Tương tác thông qua công nghệ số nghĩa là dùng các công cụ số (email, ứng dụng nhắn tin, họp trực tuyến) để trao đổi với người khác. Mỗi loại phương tiện giao tiếp số phù hợp với một bối cảnh khác nhau — việc gấp cần công cụ tức thời như gọi điện hoặc nhắn tin trực tiếp; việc cần lưu vết lâu dài nên dùng email; việc cần nhiều người cùng thảo luận phù hợp với họp trực tuyến hoặc nhóm chat.</p><p>Một email công việc cơ bản có bốn phần: tiêu đề rõ ràng, lời chào, nội dung chính, và chữ ký. Về việc dùng Đến, CC và BCC: đặt người cần hành động vào ô Đến, người chỉ cần biết vào ô CC.</p><p>Khi tham gia họp trực tuyến, cần kiểm tra âm thanh và hình ảnh trước khi họp bắt đầu, và tắt tiếng khi không phát biểu để tránh tạp âm ảnh hưởng người khác.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-F-CH1-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Soạn ba email cho ba tình huống khác nhau: xin thông tin từ đồng nghiệp, báo cáo tiến độ công việc cho cấp trên, và xin lỗi vì trễ hạn công việc. Sau đó tham gia thử một cuộc họp trực tuyến và ghi chú lại nội dung.</p><p>Sản phẩm nộp: 3 email mẫu và ghi chú cuộc họp.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-F-CH1-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M2-F-CH1-QUIZ', 1, 'Quiz chương 1: Công cụ giao tiếp cơ bản', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Người cần hành động với nội dung email nên được đặt ở đâu?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'CC', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'BCC', false, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Đến (To)', true, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không quan trọng', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'BCC được dùng khi nào?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Khi muốn tất cả người nhận biết nhau', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Khi gửi cho nhiều người không cần lộ thông tin liên hệ của nhau', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Khi chỉ gửi cho một người', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không bao giờ nên dùng', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Việc gấp cần xử lý ngay nên chọn kênh nào?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Email', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Gọi điện hoặc nhắn tin trực tiếp', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Ghi chú giấy', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Gửi thư', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao nên tắt tiếng khi không phát biểu trong cuộc họp trực tuyến?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Để tiết kiệm pin', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Để tránh tạp âm ảnh hưởng người khác', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Vì bắt buộc theo quy định', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có lý do cụ thể', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Tiêu đề email nên có đặc điểm gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Càng ngắn càng tốt, không cần rõ nghĩa', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Nói rõ nội dung để người nhận biết mức ưu tiên', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần viết “Quan trọng”', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần thiết', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M2-F-CH2', 'Chương 2: Chia sẻ tài liệu và thông tin', 2, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-F-CH2-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Nhận biết được các công nghệ số đơn giản, phù hợp để chia sẻ dữ liệu, thông tin và nội dung số</li><li>Nhận biết được tham chiếu và ghi chú nguồn cơ bản</li></ul><h2>Định nghĩa</h2><ul><li>Nội dung số (Điều 2, TT 02/2025/TT-BGDĐT): nội dung tồn tại dưới dạng dữ liệu số được mã hóa ở định dạng kỹ thuật số có thể đọc được và có thể được tạo, xem, phân phối, sửa đổi và lưu trữ bằng máy tính và công nghệ kỹ thuật số</li><li>Quyền xem: chỉ đọc, không thể thay đổi nội dung</li><li>Quyền bình luận: đọc và để lại nhận xét, không sửa nội dung gốc</li><li>Quyền chỉnh sửa: có thể thay đổi trực tiếp nội dung</li><li>Liên kết chia sẻ: đường dẫn cho phép truy cập tệp mà không cần gửi trực tiếp</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-F-CH2-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Chia sẻ thông tin và nội dung số nghĩa là gửi hoặc cấp quyền truy cập tài liệu cho người khác thông qua các công nghệ số phù hợp. Khi tệp quá lớn để đính kèm qua email, nên chia sẻ qua đường dẫn đám mây thay vì cố nén và gửi trực tiếp.</p><p>Ba mức quyền phổ biến là xem, bình luận, và chỉnh sửa — nên cấp mức thấp nhất phù hợp với nhu cầu người nhận. Tùy chọn “Bất kỳ ai có liên kết” tiềm ẩn rủi ro: đường dẫn có thể bị chuyển tiếp ngoài ý muốn tới người không nên xem.</p><p>Trước khi chuyển tiếp một email, cần kiểm tra xem nội dung phía trên (các email trước đó trong chuỗi) có thông tin không nên gửi cho người nhận mới hay không.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-F-CH2-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Chia sẻ một thư mục với một đồng nghiệp ở mức chỉ xem, và chụp lại màn hình cài đặt chia sẻ.</p><p>Sản phẩm nộp: Ảnh chụp cài đặt chia sẻ đúng nguyên tắc.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-F-CH2-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M2-F-CH2-QUIZ', 1, 'Quiz chương 2: Chia sẻ tài liệu và thông tin', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khi tệp quá lớn để đính kèm, nên làm gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Nén thật nhỏ và gửi', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chia sẻ qua đường dẫn đám mây', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Gửi qua nhiều email', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Bỏ bớt nội dung', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Mức quyền nào nên cấp mặc định khi chưa rõ nhu cầu người nhận?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉnh sửa', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Xem', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Quản trị', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Xóa', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', '“Bất kỳ ai có liên kết” tiềm ẩn rủi ro gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có rủi ro nào', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Liên kết có thể bị chuyển tiếp tới người không nên xem', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tốc độ tải chậm hơn', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tốn dung lượng hơn', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Trước khi chuyển tiếp một chuỗi email, nên kiểm tra điều gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Độ dài email', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Nội dung phía trên có thông tin không nên gửi cho người nhận mới không', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Ngày gửi ban đầu', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần kiểm tra gì', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Quyền “bình luận” khác quyền “chỉnh sửa” ở điểm nào?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có khác biệt', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Bình luận chỉ để lại nhận xét, không sửa nội dung gốc', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Bình luận có quyền cao hơn', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉnh sửa không được lưu lại', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M2-F-CH3', 'Chương 3: Dịch vụ công trực tuyến', 3, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-F-CH3-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Xác định được các dịch vụ số đơn giản để có thể tham gia vào xã hội</li><li>Nhận biết được các công nghệ số đơn giản, phù hợp để nâng cao năng lực cho bản thân và tham gia vào xã hội với tư cách là một công dân</li></ul><h2>Định nghĩa</h2><ul><li>Dịch vụ số (Điều 2, TT 02/2025/TT-BGDĐT): các dịch vụ được cung cấp thông qua phương tiện giao tiếp số</li><li>Cổng dịch vụ công: trang web chính thức của cơ quan nhà nước cho phép thực hiện thủ tục hành chính trực tuyến</li><li>Định danh điện tử: phương thức xác thực danh tính một cá nhân hoặc tổ chức trên môi trường số</li><li>Chữ ký số: hình thức xác nhận điện tử có giá trị pháp lý tương đương chữ ký tay</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-F-CH3-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Sử dụng công nghệ số để thực hiện trách nhiệm công dân nghĩa là tham gia vào xã hội thông qua các dịch vụ số công cộng và tư nhân — ví dụ cổng dịch vụ công trực tuyến cho phép thực hiện nhiều thủ tục hành chính mà không cần đến trực tiếp cơ quan nhà nước.</p><p>Khi tra cứu thông tin chính thức, cần xác nhận đang ở đúng trang của cơ quan nhà nước. Trang giả mạo thường có tên miền gần giống nhưng sai khác nhỏ, và thường yêu cầu cung cấp thông tin cá nhân qua kênh không chính thức. Cơ quan nhà nước không bao giờ yêu cầu mật khẩu hoặc mã xác thực qua điện thoại hoặc tin nhắn.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-F-CH3-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Tra cứu một thủ tục hành chính liên quan đến doanh nghiệp trên cổng chính thức và ghi lại các bước cùng giấy tờ cần có.</p><p>Sản phẩm nộp: Bảng tóm tắt thủ tục kèm đường dẫn chính thức.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-F-CH3-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M2-F-CH3-QUIZ', 1, 'Quiz chương 3: Dịch vụ công trực tuyến', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Cổng dịch vụ công dùng để làm gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Mua sắm trực tuyến', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Thực hiện thủ tục hành chính không cần đến trực tiếp', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Giải trí', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tìm việc làm', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Dấu hiệu nào cho thấy một trang có thể giả mạo cơ quan nhà nước?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Có đuôi .gov.vn', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tên miền gần giống nhưng sai khác nhỏ, yêu cầu thông tin bất thường', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Giao diện đơn giản', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Có nhiều thông tin liên hệ', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Cơ quan nhà nước có bao giờ yêu cầu cung cấp mật khẩu qua điện thoại không?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Có, đây là quy trình bình thường', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không, đây là dấu hiệu lừa đảo', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ trong trường hợp khẩn cấp', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tùy từng cơ quan', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Định danh điện tử dùng để làm gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Trang trí hồ sơ', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Xác thực danh tính trên môi trường số', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tăng tốc độ mạng', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có tác dụng cụ thể', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Chữ ký số có giá trị pháp lý như thế nào?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có giá trị pháp lý', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tương đương chữ ký tay', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ dùng cho mục đích nội bộ', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ có giá trị ở nước ngoài', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M2-F-CH4', 'Chương 4: Làm việc nhóm trên công cụ số', 4, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-F-CH4-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Chọn được những công cụ và công nghệ số đơn giản cho các quá trình hợp tác</li></ul><h2>Định nghĩa</h2><ul><li>Tài liệu dùng chung: tài liệu trực tuyến nhiều người có thể xem hoặc chỉnh sửa đồng thời</li><li>Bình luận (comment): ghi chú gắn vào một phần cụ thể của tài liệu, không thay đổi nội dung gốc</li><li>Bảng công việc (task board): công cụ hiển thị công việc theo trạng thái (chưa làm, đang làm, hoàn thành)</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-F-CH4-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Hợp tác thông qua công nghệ số nghĩa là dùng các công cụ số cho quá trình làm việc chung — tài liệu dùng chung cho phép nhiều người chỉnh sửa cùng lúc và tự động lưu thay đổi. Khi cần góp ý mà không muốn thay đổi trực tiếp nội dung, dùng tính năng bình luận.</p><p>Trên bảng công việc, mỗi thẻ công việc thường có người phụ trách, hạn hoàn thành, và trạng thái hiện tại. Một lưu ý quan trọng: không nên tạo bản sao riêng của tài liệu nhóm để chỉnh sửa cá nhân — điều này tạo ra nhiều phiên bản không đồng bộ, gây nhầm lẫn cho cả nhóm.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-F-CH4-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Cùng một hoặc hai người khác hoàn thành một tài liệu dùng chung, mỗi người phụ trách một phần, sử dụng bình luận để trao đổi.</p><p>Sản phẩm nộp: Tài liệu nhóm có lịch sử chỉnh sửa và bình luận.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-F-CH4-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M2-F-CH4-QUIZ', 1, 'Quiz chương 4: Làm việc nhóm trên công cụ số', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao không nên tạo bản sao riêng của tài liệu nhóm?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tốn dung lượng', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tạo ra nhiều phiên bản không đồng bộ, gây nhầm lẫn', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có lý do gì', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Vì quy định cấm', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Tính năng bình luận khác gì so với chỉnh sửa trực tiếp?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có khác biệt', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Bình luận không thay đổi nội dung gốc, chỉ thêm ghi chú', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Bình luận nhanh hơn', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉnh sửa không thể hoàn tác', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Lịch dùng chung giúp ích gì cho nhóm?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Trang trí', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Thấy được thời gian rảnh của nhau để đặt lịch họp', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tính lương', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có tác dụng', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Trên bảng công việc, thông tin nào cần được cập nhật thường xuyên?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tên công việc', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Trạng thái hiện tại', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Ngày tạo công việc', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần cập nhật gì', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Gắn thẻ (@) một người trong bình luận có tác dụng gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Xóa bình luận đó', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Gửi thông báo để người đó biết', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Ẩn bình luận', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có tác dụng', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M2-F-CH5', 'Chương 5: Ứng xử trên môi trường số', 5, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-F-CH5-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Phân biệt được các chuẩn mực hành vi đơn giản và biết cách sử dụng công nghệ số và tương tác trong môi trường số</li><li>Chọn được các phương thức và chiến lược giao tiếp đơn giản phù hợp trong môi trường số</li><li>Phân biệt được các khía cạnh đơn giản của sự đa dạng về văn hóa và thế hệ</li></ul><h2>Định nghĩa</h2><ul><li>Nghi thức số (Điều 2, TT 02/2025/TT-BGDĐT): tập hợp các quy tắc, chuẩn mực và hành vi ứng xử phù hợp trong môi trường số, bao gồm giao tiếp qua mạng Internet, sử dụng mạng xã hội, email, ứng dụng và các nền tảng trực tuyến</li><li>Văn phong: cách diễn đạt, mức độ trang trọng trong giao tiếp</li><li>Quấy rối trên môi trường số: hành vi lặp lại gây khó chịu, đe dọa hoặc xúc phạm qua kênh số</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-F-CH5-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Nghi thức số là tập hợp các quy tắc, chuẩn mực và hành vi ứng xử phù hợp trong môi trường số, bao gồm giao tiếp qua mạng Internet, sử dụng mạng xã hội, email, ứng dụng và các nền tảng trực tuyến. Cách giao tiếp với đồng nghiệp, cấp trên và khách hàng nên khác nhau về mức độ trang trọng.</p><p>Việc dùng biểu tượng cảm xúc hay viết hoa toàn bộ câu cần cân nhắc theo ngữ cảnh — viết hoa toàn bộ thường được hiểu là đang hét lên. Thời điểm gửi tin nhắn cũng là một phần của nghi thức số: gửi tin nhắn công việc ngoài giờ có thể tạo áp lực không cần thiết.</p><p>Khi nhận được tin nhắn mang tính công kích, nên lưu lại bằng chứng và báo cáo cho người phụ trách phù hợp thay vì tự giải quyết bằng cách đáp trả tương tự.</p><p>Đồng nghiệp trong một công ty có thể khác nhau về văn hóa (người miền Bắc/Nam/Trung, người nước ngoài) và về thế hệ (Gen Z mới đi làm, người đã đi làm 20 năm) — mỗi nhóm có thể quen với cách giao tiếp khác nhau. Ví dụ: một số người lớn tuổi thấy nhắn tin quá ngắn gọn là thiếu lễ độ, trong khi một số người trẻ thấy email dài dòng là mất thời gian. Nhận biết được sự khác biệt đơn giản này giúp chọn cách giao tiếp phù hợp hơn với từng người, thay vì áp dụng một kiểu duy nhất cho tất cả.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-F-CH5-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Cho năm tin nhắn công việc có vấn đề về văn phong, viết lại cho phù hợp và giải thích điều chỉnh.</p><p>Sản phẩm nộp: Bảng 5 tin nhắn trước và sau kèm giải thích.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-F-CH5-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M2-F-CH5-QUIZ', 1, 'Quiz chương 5: Ứng xử trên môi trường số', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Viết hoa toàn bộ câu trong tin nhắn thường được hiểu là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Nhấn mạnh lịch sự', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Đang hét lên, có thể gây hiểu lầm', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có ý nghĩa gì', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Thể hiện sự trang trọng', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Gửi tin nhắn công việc ngoài giờ có thể gây ra điều gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không ảnh hưởng gì', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tạo áp lực không cần thiết cho người nhận', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Luôn được hoan nghênh', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tăng hiệu suất làm việc', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khi nhận tin nhắn mang tính công kích, nên làm gì đầu tiên?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Đáp trả ngay lập tức bằng lời lẽ tương tự', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Lưu lại bằng chứng và báo cáo cho người phụ trách phù hợp', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Xóa ngay tin nhắn', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Phớt lờ hoàn toàn', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Văn phong khi giao tiếp với khách hàng nên như thế nào?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Giống hệt như với bạn bè', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Lịch sự, đầy đủ câu', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Ngắn gọn tối đa, không cần lịch sự', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không quan trọng', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao cần lưu ý sự khác biệt văn hóa và thế hệ khi giao tiếp với đồng nghiệp?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần thiết, giao tiếp giống nhau với tất cả mọi người', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Mỗi nhóm có thể quen với cách giao tiếp khác nhau, cần điều chỉnh phù hợp', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ áp dụng với đối tác nước ngoài', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ người lớn tuổi cần được lưu ý', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M2-F-CH6', 'Chương 6: Danh tính số cá nhân', 6, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-F-CH6-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Xác định được danh tính số</li><li>Mô tả được những cách đơn giản để bảo vệ danh tiếng trực tuyến của bản thân</li><li>Nhận biết được dữ liệu đơn giản do mình tạo ra thông qua các công cụ, môi trường hoặc dịch vụ số</li></ul><h2>Định nghĩa</h2><ul><li>Danh tính số (Điều 2, TT 02/2025/TT-BGDĐT): tổng hợp thông tin về một người tồn tại ở dạng kỹ thuật số để định danh và phân biệt với những người khác, có thể bao gồm các thông tin như giới tính, tính cách, sở thích, tín ngưỡng, quan điểm chính trị, họ tên, ngày tháng năm sinh, số điện thoại, địa chỉ nhà, địa chỉ thư điện tử và các thông tin cá nhân khác</li><li>Danh tiếng trực tuyến (Điều 2, TT 02/2025/TT-BGDĐT): sự đánh giá hoặc nhận thức của xã hội về giá trị, uy tín, hoặc hình ảnh của một cá nhân, tổ chức hay thương hiệu trên môi trường trực tuyến</li><li>Dấu vết số (digital footprint): toàn bộ thông tin về một người còn lại trên môi trường số qua các hoạt động trực tuyến</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-F-CH6-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Danh tính số là tổng hợp thông tin về một người tồn tại ở dạng kỹ thuật số để định danh và phân biệt với những người khác. Mọi hoạt động trực tuyến đều để lại dấu vết có thể tồn tại rất lâu, kể cả sau khi nội dung gốc đã bị xóa.</p><p>Việc tự tra cứu tên mình trên công cụ tìm kiếm giúp biết được người khác nhìn thấy gì về mình. Cài đặt quyền riêng tư trên mạng xã hội nên được rà soát định kỳ. Nên tách bạch tài khoản cá nhân và tài khoản dùng cho công việc khi có thể, để bảo vệ danh tiếng trực tuyến của bản thân.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-F-CH6-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Tự tra cứu tên mình trên công cụ tìm kiếm, liệt kê những gì công khai, rà soát và điều chỉnh cài đặt riêng tư của một tài khoản.</p><p>Sản phẩm nộp: Bảng kiểm dấu vết số cá nhân trước và sau điều chỉnh.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-F-CH6-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M2-F-CH6-QUIZ', 1, 'Quiz chương 6: Danh tính số cá nhân', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Dấu vết số là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chữ ký điện tử', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Toàn bộ thông tin về một người còn lại trên môi trường số', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Mật khẩu tài khoản', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Địa chỉ IP', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Nội dung đã xóa trên mạng có thể vẫn tồn tại vì sao?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không thể nào tồn tại được nữa', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Người khác có thể đã lưu hoặc chia sẻ lại trước khi xóa', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Máy chủ luôn giữ vĩnh viễn', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có lý do cụ thể', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao nên tách bạch tài khoản cá nhân và công việc?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần thiết', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tránh nội dung cá nhân ảnh hưởng hình ảnh nghề nghiệp và ngược lại', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để tiết kiệm dung lượng', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Vì quy định pháp luật bắt buộc', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Việc tự tra cứu tên mình trên công cụ tìm kiếm giúp ích gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có tác dụng gì', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Biết được người khác nhìn thấy gì về mình trên mạng', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tăng thứ hạng tìm kiếm', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Xóa dấu vết số', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Đăng hình ảnh đồng nghiệp lên tài khoản cá nhân mà không xin phép có vấn đề gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có vấn đề gì', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Có thể vi phạm quyền riêng tư của người khác', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Luôn được khuyến khích', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ có vấn đề nếu đăng công khai', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M2-F-FINAL', 'Đánh giá cuối khóa', 7, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-F-FINAL-A', 'Bài đánh giá cuối khóa', 'ASSIGNMENT', '<p>Trong một ngày làm việc, bạn gặp chuỗi tình huống sau: nhận yêu cầu công việc qua email, cần chia sẻ một tài liệu với đồng nghiệp, nhận được một tin nhắn khó chịu từ đối tác, và cần cập nhật tiến độ công việc nhóm. Hãy xử lý từng tình huống, thể hiện rõ cách áp dụng kiến thức đã học.</p><p>Tiêu chí chấm:</p><p>Điểm đạt: ≥70/100.</p>', 60, 1, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M2-F-FINAL', 1, 'Đánh giá cuối khóa — GIAO TIẾP SỐ CƠ BẢN NƠI CÔNG SỞ', 'FINAL', true, 70, 1, 'PUBLISHED', v_admin_id, now(), now());
    END IF;
    RAISE NOTICE 'Done: M2-F';
    -- === M2-I ===
    SELECT id INTO v_course_id FROM courses WHERE code = 'M2-I' AND organization_id = v_org_id;
    IF v_course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM course_modules WHERE course_id = v_course_id) THEN
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M2-I-CH1', 'Chương 1: Giao tiếp hiệu quả theo tình huống', 1, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-I-CH1-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Lựa chọn được nhiều công nghệ số để tương tác</li><li>Lựa chọn được nhiều phương tiện giao tiếp số phù hợp cho một bối cảnh cụ thể</li></ul><h2>Định nghĩa</h2><ul><li>Phương tiện giao tiếp số (Điều 2, TT 02/2025/TT-BGDĐT): các nền tảng, công cụ và nội dung được tạo ra, lưu trữ, phân phối và truy cập thông qua công nghệ số, bao gồm mạng Internet, mạng xã hội, ứng dụng di động, các thiết bị điện tử</li><li>Giao tiếp bất đồng bộ: giao tiếp không yêu cầu phản hồi ngay lập tức (email, bình luận)</li><li>Giao tiếp đồng bộ: giao tiếp yêu cầu phản hồi tức thời (gọi điện, họp trực tuyến, chat trực tiếp)</li><li>Biên bản họp: văn bản ghi lại nội dung, quyết định và việc cần làm sau cuộc họp</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-I-CH1-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Ở mức trung cấp, việc chọn phương tiện giao tiếp số cần dựa trên ba yếu tố: độ khẩn (cần trả lời ngay hay có thể chờ), độ phức tạp (câu trả lời đơn giản hay cần thảo luận qua lại), và nhu cầu lưu vết (có cần bằng chứng văn bản không).</p><p>Một email đạt mục đích trong một lần gửi cần nêu rõ ngay từ đầu: mục đích của email, thông tin cần thiết để người nhận hiểu bối cảnh, và hành động cụ thể mong muốn kèm thời hạn. Với email từ chối, nên nêu quyết định rõ ràng trước, sau đó mới giải thích lý do.</p><p>Khi điều hành họp trực tuyến, cần có chương trình họp gửi trước, phân công người ghi biên bản, và kết thúc bằng việc tóm tắt quyết định cùng việc cần làm cho từng người. Khi làm việc với người ở múi giờ khác, nên ưu tiên giao tiếp bất đồng bộ và ghi rõ thời hạn phản hồi mong muốn.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-I-CH1-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Viết ba email khó: từ chối yêu cầu của cấp trên, thúc tiến độ đối tác, và thông báo tin không tốt cho khách hàng. Với mỗi email, nêu rõ mục tiêu và lý do chọn cách viết như vậy.</p><p>Sản phẩm nộp: 3 email kèm giải trình chiến lược giao tiếp.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-I-CH1-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M2-I-CH1-QUIZ', 1, 'Quiz chương 1: Giao tiếp hiệu quả theo tình huống', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Việc nào nên dùng kênh giao tiếp đồng bộ (họp, gọi điện)?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Thông báo lịch nghỉ lễ', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Thảo luận phức tạp cần trao đổi qua lại', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Gửi tài liệu tham khảo', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Nhắc lịch hẹn', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Email từ chối nên bắt đầu bằng gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Lời xin lỗi dài dòng', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Nêu quyết định rõ ràng trước, sau đó giải thích', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Kể chuyện dẫn dắt', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần cấu trúc rõ ràng', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khi làm việc với người ở múi giờ khác, nên làm gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Yêu cầu phản hồi tức thời', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Ưu tiên giao tiếp bất đồng bộ, ghi rõ thời hạn mong muốn', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ liên lạc khi cùng múi giờ', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần điều chỉnh gì', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khi nào nên chuyển từ chat sang gọi điện để giải quyết bất đồng?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Ngay từ tin nhắn đầu tiên', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Sau hai đến ba lượt trao đổi chưa thống nhất được', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không bao giờ cần chuyển', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ khi được yêu cầu', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Một cuộc họp trực tuyến hiệu quả nên kết thúc bằng gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Kết thúc đột ngột không tổng kết', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tóm tắt quyết định và việc cần làm cho từng người', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ chào tạm biệt', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần kết luận gì', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M2-I-CH2', 'Chương 2: Chia sẻ thông tin có kiểm soát', 2, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-I-CH2-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Vận dụng được các công nghệ số phù hợp để chia sẻ dữ liệu, thông tin và nội dung số</li><li>Giải thích được cách đóng vai trò trung gian để chia sẻ thông tin và nội dung</li><li>Áp dụng được các phương pháp tham chiếu và ghi chú nguồn</li></ul><h2>Định nghĩa</h2><ul><li>Nội dung số (Điều 2, TT 02/2025/TT-BGDĐT): nội dung tồn tại dưới dạng dữ liệu số được mã hóa ở định dạng kỹ thuật số có thể đọc được và có thể được tạo, xem, phân phối, sửa đổi và lưu trữ bằng máy tính và công nghệ kỹ thuật số</li><li>Phân loại thông tin: việc gán một tài liệu vào một trong các mức nhạy cảm để xác định cách xử lý phù hợp</li><li>Bốn mức phân loại phổ biến: công khai, nội bộ, hạn chế, mật</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-I-CH2-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Ở mức trung cấp, việc chia sẻ thông tin và nội dung số cần thêm vai trò đóng làm người trung gian — lựa chọn công nghệ số phù hợp để trao đổi dữ liệu, đồng thời hiểu biết về thực hành trích dẫn và ghi chú nguồn khi chia sẻ nội dung không phải do mình tạo ra.</p><p>Bốn mức phân loại thông tin giúp xác định cách chia sẻ phù hợp: công khai (ai cũng xem được), nội bộ (chỉ nhân viên công ty), hạn chế (chỉ nhóm/bộ phận liên quan), mật (chỉ người được chỉ định cụ thể). Thông tin mật không bao giờ dùng liên kết chia sẻ mở, luôn chỉ định người nhận cụ thể.</p><p>Quyền truy cập cần được rà soát định kỳ, đặc biệt khi có nhân sự nghỉ việc hoặc chuyển vị trí. Khi phát hiện đã chia sẻ nhầm thông tin nhạy cảm, cần thu hồi quyền truy cập ngay lập tức.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-I-CH2-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Phân loại 10 loại tài liệu của doanh nghiệp theo bốn mức, thiết lập quyền tương ứng cho từng mức và lập lịch rà soát.</p><p>Sản phẩm nộp: Bảng phân loại tài liệu, bảng quyền, lịch rà soát.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-I-CH2-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M2-I-CH2-QUIZ', 1, 'Quiz chương 2: Chia sẻ thông tin có kiểm soát', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Thông tin mật nên được chia sẻ như thế nào?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Bằng liên kết mở cho tiện lợi', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ định người nhận cụ thể, có thể giới hạn thời hạn và quyền tải xuống', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Đăng công khai để minh bạch', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Gửi cho toàn công ty', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao cần rà soát quyền truy cập định kỳ?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần thiết nếu không có sự cố', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Quyền cũ không tự động mất khi nhân sự nghỉ việc hoặc chuyển vị trí', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để kiểm tra dung lượng', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Theo yêu cầu ngẫu nhiên', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khi phát hiện chia sẻ nhầm thông tin nhạy cảm, bước đầu tiên nên làm là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Im lặng chờ xem có ai phát hiện không', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Thu hồi quyền truy cập ngay lập tức', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Xóa toàn bộ tài liệu', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Đợi cuối tuần mới xử lý', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Bốn mức phân loại thông tin phổ biến là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Cao, trung bình, thấp, không có', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Công khai, nội bộ, hạn chế, mật', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Quan trọng, không quan trọng', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Mới, cũ', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Thông tin “nội bộ” nghĩa là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ một người được xem', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ nhân viên công ty được xem, không chia sẻ ra ngoài', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Ai cũng có thể xem', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ ban giám đốc được xem', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M2-I-CH3', 'Chương 3: Tham gia dịch vụ công và nghĩa vụ số của doanh nghiệp', 3, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-I-CH3-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Lựa chọn được các dịch vụ số để tham gia vào xã hội</li><li>Thảo luận về các công nghệ số phù hợp để nâng cao năng lực của bản thân và tham gia vào xã hội với tư cách là một công dân</li></ul><h2>Định nghĩa</h2><ul><li>Dịch vụ số (Điều 2, TT 02/2025/TT-BGDĐT): các dịch vụ được cung cấp thông qua phương tiện giao tiếp số</li><li>Hóa đơn điện tử: hóa đơn được lập, gửi và lưu trữ dưới dạng dữ liệu điện tử, có giá trị pháp lý như hóa đơn giấy</li><li>Mã số hồ sơ: mã định danh dùng để tra cứu trạng thái xử lý của một hồ sơ đã nộp</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-I-CH3-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Ở mức trung cấp, việc sử dụng dịch vụ số để tham gia xã hội mở rộng sang phạm vi công việc — thực hiện thủ tục hành chính trực tuyến cho doanh nghiệp như khai thuế, đóng bảo hiểm xã hội, đăng ký thay đổi thông tin doanh nghiệp.</p><p>Mỗi thủ tục thường yêu cầu chữ ký số để xác nhận tính hợp lệ của hồ sơ. Hóa đơn điện tử đã thay thế phần lớn hóa đơn giấy trong giao dịch doanh nghiệp. Sau khi nộp hồ sơ trực tuyến, nên lưu lại mã số hồ sơ để theo dõi trạng thái xử lý.</p><p>Lừa đảo mạo danh cơ quan thuế, bảo hiểm xã hội là hình thức phổ biến — cách xác minh là luôn kiểm tra lại qua kênh chính thức thay vì làm theo hướng dẫn trong tin nhắn/cuộc gọi đáng ngờ.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-I-CH3-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Lập quy trình chi tiết cho một thủ tục trực tuyến mà bộ phận thường xuyên thực hiện, kèm danh mục hồ sơ cần có và các điểm dễ sai sót.</p><p>Sản phẩm nộp: Quy trình thủ tục dạng các bước và danh mục kiểm tra.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-I-CH3-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M2-I-CH3-QUIZ', 1, 'Quiz chương 3: Tham gia dịch vụ công và nghĩa vụ số của doanh nghiệp', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Chữ ký số dùng để làm gì trong thủ tục hành chính trực tuyến?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Trang trí hồ sơ', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Xác nhận tính hợp lệ của hồ sơ, thay thế chữ ký tay', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tăng tốc độ xử lý', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có tác dụng thực tế', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Sau khi nộp hồ sơ trực tuyến, nên lưu lại gì để theo dõi?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần lưu gì', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Mã số hồ sơ', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Ảnh chụp màn hình bất kỳ', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần thiết vì hệ thống tự động thông báo', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Nhận được tin nhắn yêu cầu “nộp phạt gấp” mạo danh cơ quan thuế, nên làm gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chuyển tiền ngay theo hướng dẫn', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Xác minh lại qua kênh chính thức trước khi hành động', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Xóa tin nhắn và không làm gì', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Trả lời tin nhắn để hỏi thêm', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Hóa đơn điện tử có giá trị pháp lý như thế nào so với hóa đơn giấy?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có giá trị pháp lý', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Có giá trị pháp lý tương đương', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ có giá trị tham khảo', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ dùng nội bộ', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khi hồ sơ bị trả về do thiếu sót, nên làm gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Nộp lại từ đầu hoàn toàn mới', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Xử lý theo đúng hướng dẫn trong thông báo', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Bỏ qua và nộp lại y hệt', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Liên hệ người quen để “chạy” hồ sơ', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M2-I-CH4', 'Chương 4: Điều phối công việc nhóm', 4, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-I-CH4-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Lựa chọn được các công cụ và công nghệ số cho các quá trình hợp tác</li></ul><h2>Định nghĩa</h2><ul><li>Quy ước nhóm (team norms): các thỏa thuận chung về cách thức làm việc, kênh giao tiếp, thời gian phản hồi trong nhóm</li><li>Vi quản lý (micromanagement): việc kiểm soát quá chi tiết công việc của người khác, gây cản trở thay vì hỗ trợ</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-I-CH4-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Ở mức trung cấp, việc hợp tác qua công nghệ số cần lựa chọn công cụ phù hợp một cách có chủ đích hơn cho từng quy trình cụ thể của nhóm, không chỉ dùng công cụ mặc định.</p><p>Khi phân công công việc, cần nói rõ ba điều: ai làm, làm xong khi nào, và thế nào được coi là hoàn thành. Theo dõi tiến độ nên dựa trên cập nhật trạng thái trên bảng công việc, tránh việc liên tục hỏi han trực tiếp gây cảm giác bị vi quản lý.</p><p>Quy ước nhóm nên xác định rõ: kênh nào dùng cho loại việc gì, thời gian phản hồi kỳ vọng là bao lâu. Khi bàn giao công việc, cần có tài liệu bàn giao rõ ràng thay vì trao đổi miệng.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-I-CH4-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Thiết lập không gian làm việc cho một dự án thật của bộ phận: bảng công việc, cấu trúc tài liệu, và quy ước nhóm bằng văn bản.</p><p>Sản phẩm nộp: Không gian làm việc nhóm và bản quy ước nhóm.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-I-CH4-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M2-I-CH4-QUIZ', 1, 'Quiz chương 4: Điều phối công việc nhóm', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khi phân công công việc, ba điều cần nói rõ là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Ai làm, ở đâu, khi nào', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Ai làm, làm xong khi nào, thế nào là hoàn thành', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Ai làm, làm gì, tại sao', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần nói rõ gì', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vi quản lý là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Quản lý một nhóm nhỏ', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Kiểm soát quá chi tiết công việc người khác, gây cản trở', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Quản lý từ xa', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không giao việc cho ai', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Cách tốt để theo dõi tiến độ mà không gây cảm giác vi quản lý là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Hỏi han liên tục trực tiếp', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Dựa trên cập nhật trạng thái trên bảng công việc', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không theo dõi gì cả', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Yêu cầu báo cáo mỗi giờ', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Quy ước nhóm nên bao gồm nội dung gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần tên các thành viên', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Kênh nào dùng cho việc gì, thời gian phản hồi kỳ vọng', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần thiết lập quy ước', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ áp dụng cho nhóm lớn', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khi bàn giao công việc, nên làm gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Trao đổi miệng là đủ', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Có tài liệu bàn giao rõ ràng bằng văn bản', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần bàn giao nếu công việc đơn giản', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần gửi email ngắn gọn “bàn giao xong”', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M2-I-CH5', 'Chương 5: Chuẩn mực ứng xử và xử lý tình huống khó', 5, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-I-CH5-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Thảo luận về các chuẩn mực hành vi và cách sử dụng công nghệ số và tương tác trong môi trường số</li><li>Thảo luận các chiến lược giao tiếp phù hợp trong môi trường số</li><li>Thảo luận các khía cạnh đa dạng về văn hóa và thế hệ cần xem xét trong môi trường số</li></ul><h2>Định nghĩa</h2><ul><li>Nghi thức số (Điều 2, TT 02/2025/TT-BGDĐT): tập hợp các quy tắc, chuẩn mực và hành vi ứng xử phù hợp trong môi trường số, bao gồm giao tiếp qua mạng Internet, sử dụng mạng xã hội, email, ứng dụng và các nền tảng trực tuyến</li><li>Giao tiếp trực tiếp/gián tiếp: phong cách nói thẳng vấn đề (trực tiếp) so với diễn đạt vòng vo, ngụ ý (gián tiếp), khác nhau tùy văn hóa</li><li>Vai trò người chứng kiến (bystander): người nhìn thấy hành vi không phù hợp nhưng không phải là người bị ảnh hưởng trực tiếp</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-I-CH5-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Ở mức trung cấp, việc thực hiện nghi thức số cần mở rộng sang bối cảnh đa văn hóa và tình huống khó xử lý hơn. Khi giao tiếp với đối tác nước ngoài, cần lưu ý sự khác biệt văn hóa về mức độ trực tiếp trong cách nói, thái độ với thứ bậc, và kỳ vọng về thời gian phản hồi.</p><p>Khi khách hàng để lại phản hồi tiêu cực trên kênh công khai, nguyên tắc xử lý là phản hồi công khai một cách chuyên nghiệp và mời chuyển sang kênh riêng để giải quyết chi tiết.</p><p>Trong nhóm chat công việc, nếu phát hiện hành vi bắt nạt trên mạng, loại trừ hoặc quấy rối, người chứng kiến có vai trò quan trọng — có thể lên tiếng trực tiếp hoặc báo cáo cho người quản lý. Xây quy tắc ứng xử số cho bộ phận giúp thiết lập chuẩn mực chung.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-I-CH5-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Soạn phản hồi công khai cho một đánh giá tiêu cực của khách hàng, và soạn dự thảo quy tắc ứng xử số 1 trang cho bộ phận.</p><p>Sản phẩm nộp: Bản phản hồi khách hàng và dự thảo quy tắc ứng xử.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-I-CH5-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M2-I-CH5-QUIZ', 1, 'Quiz chương 5: Chuẩn mực ứng xử và xử lý tình huống khó', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khi khách hàng để lại phản hồi tiêu cực công khai, nên làm gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tranh luận công khai để bảo vệ danh dự công ty', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Phản hồi chuyên nghiệp, mời chuyển sang kênh riêng để giải quyết', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Xóa bình luận ngay lập tức', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Phớt lờ hoàn toàn', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vai trò của người chứng kiến khi thấy hành vi bắt nạt trong nhóm chat là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có vai trò gì vì không bị ảnh hưởng trực tiếp', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Có thể lên tiếng hoặc báo cáo cho người quản lý', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ nên xem và không làm gì', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Rời khỏi nhóm ngay', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khi giao tiếp với đối tác từ văn hóa coi trọng cách nói gián tiếp, nên lưu ý gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Nói thẳng mọi vấn đề không cần cân nhắc', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chú ý cách diễn đạt tế nhị hơn, hiểu ý ngụ ý', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần điều chỉnh gì', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Luôn dùng văn phong trang trọng nhất', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Quy tắc ứng xử số cho bộ phận nên bao gồm nội dung gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần danh sách thành viên', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Giờ giấc nhắn tin, cách xử lý bất đồng, quy trình khi có vi phạm', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần thiết lập', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ áp dụng cho nhân viên mới', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Kỳ vọng về thời gian phản hồi có giống nhau giữa các nền văn hóa không?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Luôn giống nhau ở mọi nơi', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Khác nhau tùy văn hóa, cần tìm hiểu trước khi làm việc với đối tác', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không quan trọng', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ phụ thuộc vào cấp bậc', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M2-I-CH6', 'Chương 6: Quản lý danh tính nghề nghiệp', 6, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-I-CH6-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Hiển thị được nhiều danh tính số cụ thể</li><li>Thảo luận những cách cụ thể để bảo vệ danh tiếng trực tuyến của bản thân</li><li>Thao tác dữ liệu cá nhân tạo ra thông qua các công cụ, môi trường hoặc dịch vụ số</li></ul><h2>Định nghĩa</h2><ul><li>Danh tính số (Điều 2, TT 02/2025/TT-BGDĐT): tổng hợp thông tin về một người tồn tại ở dạng kỹ thuật số để định danh và phân biệt với những người khác, có thể bao gồm các thông tin như giới tính, tính cách, sở thích, tín ngưỡng, quan điểm chính trị, họ tên, ngày tháng năm sinh, số điện thoại, địa chỉ nhà, địa chỉ thư điện tử và các thông tin cá nhân khác</li><li>Danh tiếng trực tuyến (Điều 2, TT 02/2025/TT-BGDĐT): sự đánh giá hoặc nhận thức của xã hội về giá trị, uy tín, hoặc hình ảnh của một cá nhân, tổ chức hay thương hiệu trên môi trường trực tuyến</li><li>Hồ sơ nghề nghiệp trực tuyến: thông tin về quá trình làm việc, kỹ năng, thành tích được thể hiện công khai trên môi trường số</li><li>Phát ngôn nhân danh doanh nghiệp: phát biểu được hiểu là đại diện cho quan điểm chính thức của tổ chức, không chỉ là ý kiến cá nhân</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-I-CH6-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Ở mức trung cấp, việc quản lý danh tính số mở rộng sang hình ảnh nghề nghiệp — xây dựng hồ sơ nghề nghiệp trực tuyến nhất quán tạo ấn tượng đáng tin cậy hơn so với thông tin rời rạc, mâu thuẫn.</p><p>Ranh giới giữa phát ngôn cá nhân và phát ngôn nhân danh công ty không phải lúc nào cũng rõ ràng, đặc biệt khi hồ sơ cá nhân có ghi rõ nơi làm việc — một bình luận về ngành nghề, dù với ý định cá nhân, có thể bị hiểu là quan điểm của công ty.</p><p>Khi quản lý nhiều tài khoản, cần có quy tắc rõ ràng để tránh đăng nhầm nội dung. Rà soát nội dung cũ định kỳ giúp phát hiện những bài đăng không còn phù hợp, ảnh hưởng đến danh tiếng trực tuyến hiện tại.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-I-CH6-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Rà soát toàn bộ hiện diện trực tuyến của bản thân, lập danh sách nội dung cần điều chỉnh, và cập nhật hồ sơ nghề nghiệp chính.</p><p>Sản phẩm nộp: Báo cáo rà soát danh tính số và hồ sơ nghề nghiệp đã cập nhật.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-I-CH6-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M2-I-CH6-QUIZ', 1, 'Quiz chương 6: Quản lý danh tính nghề nghiệp', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao một hồ sơ nghề nghiệp trực tuyến nhất quán lại quan trọng?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không quan trọng', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tạo ấn tượng đáng tin cậy hơn so với thông tin rời rạc, mâu thuẫn', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để trang trí', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không ảnh hưởng đến công việc', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Một bình luận cá nhân về đối thủ cạnh tranh trên mạng xã hội có rủi ro gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có rủi ro vì là ý kiến cá nhân', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Có thể bị hiểu là quan điểm của công ty, gây rủi ro uy tín hoặc pháp lý', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Luôn được khuyến khích', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ có vấn đề nếu đăng công khai', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao nên rà soát nội dung cũ trên mạng xã hội định kỳ?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần thiết', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Phát hiện nội dung không còn phù hợp với hình ảnh nghề nghiệp hiện tại', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để tăng lượt theo dõi', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có lý do cụ thể', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khi quản lý nhiều tài khoản (cá nhân, công việc), cần lưu ý điều gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần phân biệt gì', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Có quy tắc rõ ràng để tránh đăng nhầm nội dung vào sai tài khoản', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Dùng chung một mật khẩu cho tiện', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần nhiều tài khoản', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Quyền yêu cầu gỡ bỏ thông tin cá nhân tồn tại nhằm mục đích gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có mục đích cụ thể', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Cho phép cá nhân kiểm soát thông tin của mình trên một số nền tảng trong trường hợp nhất định', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ áp dụng cho người nổi tiếng', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có quyền này trong thực tế', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M2-I-FINAL', 'Đánh giá cuối khóa', 7, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-I-FINAL-A', 'Bài đánh giá cuối khóa', 'ASSIGNMENT', '<p>Thiết lập toàn bộ hệ thống giao tiếp và cộng tác cho một dự án liên bộ phận: chọn kênh giao tiếp phù hợp cho từng loại thông tin, phân loại và phân quyền tài liệu, xây bảng công việc, viết quy ước nhóm, và soạn quy tắc ứng xử.</p><p>Tiêu chí chấm:</p><p>Điểm đạt: ≥70/100.</p>', 60, 1, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M2-I-FINAL', 1, 'Đánh giá cuối khóa — GIAO TIẾP VÀ CỘNG TÁC CHUYÊN NGHIỆP', 'FINAL', true, 70, 1, 'PUBLISHED', v_admin_id, now(), now());
    END IF;
    RAISE NOTICE 'Done: M2-I';
    -- === M2-A ===
    SELECT id INTO v_course_id FROM courses WHERE code = 'M2-A' AND organization_id = v_org_id;
    IF v_course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM course_modules WHERE course_id = v_course_id) THEN
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M2-A-CH1', 'Chương 1: Chiến lược giao tiếp tổ chức', 1, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-A-CH1-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Thích nghi được với nhiều công nghệ số để có sự tương tác phù hợp nhất</li><li>Thích nghi được các phương tiện giao tiếp phù hợp nhất cho một bối cảnh cụ thể</li></ul><h2>Định nghĩa</h2><ul><li>Phương tiện giao tiếp số (Điều 2, TT 02/2025/TT-BGDĐT): các nền tảng, công cụ và nội dung được tạo ra, lưu trữ, phân phối và truy cập thông qua công nghệ số, bao gồm mạng Internet, mạng xã hội, ứng dụng di động, các thiết bị điện tử</li><li>Kiến trúc kênh giao tiếp: hệ thống các kênh được xác định rõ mục đích sử dụng cho từng loại thông điệp trong tổ chức</li><li>Phân tầng thông điệp: việc điều chỉnh cùng một nội dung theo cách phù hợp với từng nhóm đối tượng khác nhau</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-A-CH1-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Ở mức nâng cao, việc thích nghi công nghệ số và phương tiện giao tiếp không còn chỉ ở phạm vi cá nhân mà mở rộng ra cấp tổ chức. Cần thiết kế kiến trúc kênh giao tiếp cho cả tổ chức: xác định rõ kênh nào dùng cho loại thông điệp nào — thông báo chính thức toàn công ty, trao đổi công việc hàng ngày, phản hồi khẩn cấp.</p><p>Khi truyền đạt một thay đổi lớn, trình tự thông báo cần được lên kế hoạch: thông báo cho quản lý trực tiếp trước, sau đó đến toàn thể nhân viên liên quan, tránh để nhân viên nghe tin qua kênh không chính thức trước.</p><p>Cùng một thông điệp có thể cần trình bày khác nhau cho các nhóm đối tượng khác nhau. Đo lường hiệu quả giao tiếp nội bộ có thể qua tỷ lệ đọc/mở thông báo và khảo sát mức độ hiểu đúng thông điệp.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-A-CH1-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Xây kế hoạch truyền thông nội bộ cho một thay đổi lớn trong doanh nghiệp (đổi quy trình, sáp nhập bộ phận, hoặc triển khai hệ thống mới), gồm kênh sử dụng, trình tự thông báo, và thông điệp riêng cho từng nhóm đối tượng.</p><p>Sản phẩm nộp: Kế hoạch truyền thông thay đổi.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-A-CH1-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M2-A-CH1-QUIZ', 1, 'Quiz chương 1: Chiến lược giao tiếp tổ chức', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao cần có trình tự thông báo rõ ràng khi truyền đạt thay đổi lớn?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không quan trọng, thông báo đồng thời là đủ', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tránh nhân viên nghe tin qua kênh không chính thức trước, gây tin đồn', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để tiết kiệm thời gian', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có lý do cụ thể', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao cùng một thông điệp cần trình bày khác nhau cho các nhóm đối tượng khác nhau?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần thiết, nội dung giống nhau là đủ', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Mỗi nhóm cần loại thông tin và mức độ chi tiết khác nhau để hiểu và hành động đúng', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để tạo sự khác biệt', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có lý do thực tế', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Dấu hiệu quá tải giao tiếp trong tổ chức bao gồm gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có cuộc họp nào', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Quá nhiều cuộc họp không cần thiết, thông báo dồn dập ngoài giờ', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Giao tiếp quá ít', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có dấu hiệu cụ thể', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Đo lường hiệu quả giao tiếp nội bộ nên dựa vào điều gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cảm nhận chủ quan', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tỷ lệ đọc/mở thông báo và khảo sát mức độ hiểu đúng thông điệp', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Số lượng email gửi đi', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần đo lường', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Kiến trúc kênh giao tiếp trong tổ chức nhằm mục đích gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tăng số lượng kênh sử dụng', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Xác định rõ kênh nào dùng cho loại thông điệp nào, tránh lẫn lộn thông tin quan trọng', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có mục đích cụ thể', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để trang trí hệ thống', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M2-A-CH2', 'Chương 2: Quản trị luồng chia sẻ thông tin', 2, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-A-CH2-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Đánh giá được các công nghệ số phù hợp nhất để chia sẻ thông tin và nội dung</li><li>Thích ứng được vai trò trung gian của mình</li><li>Thay đổi được cách sử dụng các phương pháp tham chiếu và ghi chú phù hợp hơn</li></ul><h2>Định nghĩa</h2><ul><li>Nội dung số (Điều 2, TT 02/2025/TT-BGDĐT): nội dung tồn tại dưới dạng dữ liệu số được mã hóa ở định dạng kỹ thuật số có thể đọc được và có thể được tạo, xem, phân phối, sửa đổi và lưu trữ bằng máy tính và công nghệ kỹ thuật số</li><li>Phân quyền theo vai trò (role-based access): cấp quyền truy cập dựa trên chức năng công việc của một vai trò, thay vì cấp riêng lẻ cho từng cá nhân</li><li>Phân tách nhiệm vụ: nguyên tắc không để một người kiểm soát toàn bộ một quy trình nhạy cảm từ đầu đến cuối</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-A-CH2-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Ở mức nâng cao, việc chia sẻ thông tin và nội dung số đòi hỏi đánh giá công nghệ số phù hợp nhất và thích ứng vai trò trung gian của mình trong bối cảnh phức tạp — tức là xây dựng chính sách chia sẻ thông tin cấp tổ chức, không còn là quyết định cá nhân từng lần.</p><p>Chính sách này cần nêu rõ nguyên tắc chung, phạm vi áp dụng, và ngoại lệ được phép. Nên phân quyền theo vai trò (ai giữ vai trò nào sẽ có quyền tương ứng) thay vì cấp quyền riêng lẻ cho từng người, kèm nguyên tắc quyền tối thiểu và phân tách nhiệm vụ cho quy trình có rủi ro cao.</p><p>Quy trình ứng phó sự cố lộ dữ liệu cần được viết sẵn theo năm bước: khoanh vùng, đánh giá, thông báo, khắc phục, rà soát.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-A-CH2-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Xây mô hình phân quyền theo vai trò cho doanh nghiệp (tối thiểu bốn vai trò × năm nhóm dữ liệu), một sổ rủi ro sáu mục, và một quy trình ứng phó sự cố.</p><p>Sản phẩm nộp: Ma trận phân quyền, sổ rủi ro, quy trình ứng phó.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-A-CH2-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M2-A-CH2-QUIZ', 1, 'Quiz chương 2: Quản trị luồng chia sẻ thông tin', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Phân quyền theo vai trò có ưu điểm gì so với cấp quyền cá nhân?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có ưu điểm gì', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Dễ quản lý hơn, không phụ thuộc vào việc nhớ cấp quyền cho từng người', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chậm hơn', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tốn nhiều tài nguyên hơn', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Phân tách nhiệm vụ nhằm mục đích gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tăng khối lượng công việc', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Đảm bảo không ai một mình kiểm soát toàn bộ quy trình nhạy cảm', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Giảm số người tham gia công việc', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có mục đích cụ thể', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Bước đầu tiên trong quy trình ứng phó sự cố lộ dữ liệu là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Thông báo ngay cho cơ quan quản lý', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Khoanh vùng để ngăn chặn lan rộng', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tìm người chịu trách nhiệm', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Viết báo cáo chi tiết', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khi chia sẻ thông tin với bên thứ ba, cần có gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần ràng buộc gì đặc biệt', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Ràng buộc hợp đồng rõ ràng về cách sử dụng và bảo vệ thông tin', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần thỏa thuận miệng', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần gửi email xác nhận', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Sổ rủi ro thông tin nên bao gồm những gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần liệt kê tên rủi ro', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Rủi ro, khả năng xảy ra, mức tác động, biện pháp giảm thiểu, người chịu trách nhiệm', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần ngày phát hiện', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần lập sổ rủi ro', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M2-A-CH3', 'Chương 3: Doanh nghiệp trong môi trường số công cộng', 3, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-A-CH3-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Thay đổi được việc sử dụng các dịch vụ số phù hợp nhất để tham gia vào xã hội</li><li>Thay đổi được cách sử dụng các công nghệ số phù hợp nhất để nâng cao năng lực cho bản thân và tham gia vào xã hội với tư cách là một công dân</li></ul><h2>Định nghĩa</h2><ul><li>Dịch vụ số (Điều 2, TT 02/2025/TT-BGDĐT): các dịch vụ được cung cấp thông qua phương tiện giao tiếp số</li><li>Nghĩa vụ tuân thủ số: các yêu cầu pháp lý liên quan đến hoạt động số mà doanh nghiệp phải thực hiện (khai báo, báo cáo, lưu trữ)</li><li>Đánh giá tác động quy định: quá trình phân tích một quy định mới sẽ ảnh hưởng thế nào đến hoạt động và quy trình hiện tại của doanh nghiệp</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-A-CH3-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Ở mức nâng cao, việc tham gia xã hội qua công nghệ số mở rộng thành trách nhiệm của cả doanh nghiệp trong môi trường số công cộng — cần lập bản đồ nghĩa vụ số của doanh nghiệp theo lĩnh vực hoạt động và theo dõi thay đổi quy định từ nguồn cập nhật chính thức.</p><p>Xây dựng quy trình chuẩn cho giao dịch với cơ quan quản lý giúp đảm bảo tính nhất quán: ai chịu trách nhiệm chuẩn bị hồ sơ, ai phê duyệt trước khi nộp, lưu trữ hồ sơ ở đâu để phục vụ thanh kiểm tra.</p><p>Khi có quy định mới, cần đánh giá tác động: quy trình nào cần thay đổi, hệ thống nào cần cập nhật, nhân sự nào cần được đào tạo lại.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-A-CH3-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Lập bản đồ nghĩa vụ số của doanh nghiệp, xác định ba rủi ro tuân thủ lớn nhất và đề xuất biện pháp.</p><p>Sản phẩm nộp: Bản đồ nghĩa vụ tuân thủ và đánh giá rủi ro.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-A-CH3-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M2-A-CH3-QUIZ', 1, 'Quiz chương 3: Doanh nghiệp trong môi trường số công cộng', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao cần lập bản đồ đầy đủ các nghĩa vụ tuân thủ số?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần thiết', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Giúp tránh bỏ sót nghĩa vụ nào đó theo lĩnh vực hoạt động', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để báo cáo hình thức', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có tác dụng thực tế', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Nguồn cập nhật quy định nên dựa vào đâu?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tin đồn trên mạng xã hội', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Cổng thông tin chính thức của cơ quan quản lý', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Ý kiến cá nhân của đồng nghiệp', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần cập nhật thường xuyên', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khi có quy định mới, bước quan trọng cần làm là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Bỏ qua cho đến khi bị kiểm tra', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Đánh giá tác động lên quy trình, hệ thống và đào tạo nhân sự', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ thông báo bằng miệng cho nhân viên', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Đợi cơ quan quản lý nhắc nhở', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao cần quy trình chuẩn cho giao dịch với cơ quan quản lý?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần thiết nếu doanh nghiệp nhỏ', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Đảm bảo tính nhất quán, giảm rủi ro sai sót', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để tạo thủ tục rườm rà', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có lợi ích cụ thể', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Lưu trữ hồ sơ điện tử phục vụ mục đích gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để tiết kiệm giấy', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Phục vụ tra cứu và chứng minh tuân thủ khi có thanh kiểm tra', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có mục đích cụ thể', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần lưu trong một tháng', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M2-A-CH4', 'Chương 4: Dẫn dắt cộng tác nhóm phân tán', 4, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-A-CH4-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Thay đổi cách sử dụng các công cụ và công nghệ số phù hợp nhất cho các quy trình hợp tác</li><li>Chọn được các công cụ và công nghệ số thích hợp nhất để cùng xây dựng và tạo ra dữ liệu, tài nguyên và kiến thức</li></ul><h2>Định nghĩa</h2><ul><li>Nhóm phân tán: nhóm làm việc mà các thành viên không cùng một địa điểm, có thể khác múi giờ</li><li>Điểm bàn giao (handoff point): thời điểm công việc chuyển từ người/bộ phận này sang người/bộ phận khác trong một quy trình</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-A-CH4-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Ở mức nâng cao, việc hợp tác qua công nghệ số cần chọn công cụ thích hợp nhất để cùng xây dựng và đồng sáng tạo dữ liệu, tài nguyên và kiến thức ở quy mô nhóm phân tán và liên bộ phận.</p><p>Mô hình làm việc cho nhóm phân tán cần cân bằng giữa đồng bộ (họp trực tiếp định kỳ) và bất đồng bộ (phần lớn công việc hàng ngày). Khi thiết kế quy trình liên bộ phận, cần xác định rõ các điểm bàn giao — nơi công việc chuyển từ bộ phận này sang bộ phận khác thường là nơi thông tin dễ bị thất lạc nhất.</p><p>Xung đột trong nhóm làm việc từ xa thường xuất phát từ hiểu lầm qua văn bản nhiều hơn là bất đồng thực chất — khi phát hiện dấu hiệu căng thẳng qua chat, nên chủ động chuyển sang gọi video để làm rõ, vì kênh giao tiếp phong phú hơn (thấy được nét mặt, giọng điệu) giúp giảm hiểu lầm nhanh hơn tiếp tục trao đổi qua văn bản.</p><p>Xây dựng văn hóa nhóm khi làm việc từ xa đòi hỏi nỗ lực có chủ đích hơn so với làm việc tại văn phòng — vì thiếu sự kết nối tự nhiên như gặp mặt trực tiếp, cần chủ động tạo ra qua các hoạt động kết nối định kỳ. Hiệu quả cộng tác liên bộ phận có thể đo lường qua thời gian hoàn thành các điểm bàn giao và tỷ lệ công việc phải làm lại do hiểu sai — hai chỉ số này phản ánh trực tiếp chất lượng phối hợp giữa các bộ phận.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-A-CH4-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Thiết kế lại một quy trình liên bộ phận đang có vấn đề, chỉ ra điểm mất thông tin và đề xuất cơ chế khắc phục.</p><p>Sản phẩm nộp: Quy trình liên bộ phận thiết kế lại và phân tích điểm nghẽn.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-A-CH4-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M2-A-CH4-QUIZ', 1, 'Quiz chương 4: Dẫn dắt cộng tác nhóm phân tán', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Điểm bàn giao trong quy trình liên bộ phận thường là nơi gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Nơi công việc luôn suôn sẻ', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Nơi thông tin dễ bị thất lạc hoặc hiểu sai nhất', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có ý nghĩa đặc biệt', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ liên quan đến IT', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Xung đột trong nhóm làm việc từ xa thường xuất phát từ đâu?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Luôn từ bất đồng thực chất về công việc', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Thường từ hiểu lầm qua văn bản do thiếu ngữ điệu, cử chỉ', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có nguyên nhân cụ thể', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ do lỗi kỹ thuật', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khi phát hiện căng thẳng qua chat, nên làm gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tiếp tục trao đổi qua chat để có bằng chứng', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chủ động chuyển sang gọi video để làm rõ', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Phớt lờ và chờ tự hết', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Báo cáo ngay cho cấp trên', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao cần nỗ lực có chủ đích để xây dựng văn hóa nhóm khi làm việc từ xa?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần thiết vì tự nhiên sẽ hình thành', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Vì thiếu tương tác trực tiếp nên cần các hoạt động kết nối chủ động', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần cho nhóm lớn', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có lợi ích rõ ràng', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Chỉ số nào có thể dùng để đo lường hiệu quả cộng tác liên bộ phận?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Số lượng email gửi đi', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Thời gian hoàn thành các điểm bàn giao, tỷ lệ làm lại do hiểu sai', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Số cuộc họp tổ chức', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không thể đo lường được', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M2-A-CH5', 'Chương 5: Văn hóa ứng xử số và xử lý khủng hoảng', 5, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-A-CH5-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Điều chỉnh các chuẩn mực hành vi và cách phù hợp nhất khi sử dụng công nghệ số và tương tác trong môi trường số</li><li>Điều chỉnh các chiến lược giao tiếp phù hợp nhất trong môi trường số</li><li>Áp dụng được các khía cạnh đa dạng về văn hóa và thế hệ khác nhau trong môi trường số</li></ul><h2>Định nghĩa</h2><ul><li>Nghi thức số (Điều 2, TT 02/2025/TT-BGDĐT): tập hợp các quy tắc, chuẩn mực và hành vi ứng xử phù hợp trong môi trường số, bao gồm giao tiếp qua mạng Internet, sử dụng mạng xã hội, email, ứng dụng và các nền tảng trực tuyến</li><li>Khủng hoảng truyền thông: tình huống một sự việc lan truyền nhanh và rộng, gây ảnh hưởng tiêu cực đến uy tín tổ chức</li><li>Ngưỡng leo thang: mức độ nghiêm trọng mà tại đó một vấn đề cần được chuyển lên cấp quản lý cao hơn xử lý</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-A-CH5-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Ở mức nâng cao, nghi thức số cần được điều chỉnh phù hợp nhất trong bối cảnh phức tạp — tức là trở thành văn hóa thực hành của cả tổ chức, không chỉ nằm trên văn bản, đòi hỏi sự nhất quán giữa lời nói và hành động của cấp quản lý.</p><p>Khi xử lý khủng hoảng truyền thông, 24 giờ đầu tiên là quan trọng nhất: xác nhận sự việc, tránh phản ứng vội vàng, chuẩn bị thông điệp nhất quán. Nguyên tắc phản hồi là thừa nhận vấn đề nếu có, tránh đổ lỗi hoặc bao biện, và tuyệt đối không im lặng hoàn toàn hoặc xóa bằng chứng.</p><p>Cơ chế khiếu nại nội bộ cần đảm bảo người khiếu nại được bảo vệ khỏi trả đũa, có kênh báo cáo độc lập với người bị khiếu nại.</p><p>Ở mức lãnh đạo, việc áp dụng khía cạnh đa dạng văn hóa và thế hệ không còn dừng ở việc “lưu ý” như mức cơ bản, mà cần chủ động điều chỉnh chính sách ứng xử cho phù hợp với đội ngũ đa dạng — ví dụ khi soạn quy tắc ứng xử số cho một công ty có cả nhân viên Việt Nam và chuyên gia nước ngoài, cần cân nhắc để quy tắc không áp đặt một chuẩn mực văn hóa duy nhất lên mọi người, đồng thời vẫn đảm bảo tính nhất quán. Khi xử lý khủng hoảng truyền thông với đối tượng công chúng đa dạng, thông điệp cũng cần được điều chỉnh cách truyền tải (không phải nội dung cốt lõi) cho phù hợp với từng nhóm văn hóa, thế hệ tiếp nhận.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-A-CH5-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Diễn tập xử lý một khủng hoảng truyền thông: xây kịch bản phản ứng 24 giờ đầu, phân vai xử lý, soạn thông điệp cho từng nhóm đối tượng.</p><p>Sản phẩm nộp: Kịch bản ứng phó khủng hoảng và bộ thông điệp.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-A-CH5-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M2-A-CH5-QUIZ', 1, 'Quiz chương 5: Văn hóa ứng xử số và xử lý khủng hoảng', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Trong 24 giờ đầu của khủng hoảng truyền thông, điều quan trọng nhất là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Phản ứng vội vàng để có mặt sớm nhất', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Xác nhận sự việc, chuẩn bị thông điệp nhất quán, tránh phản ứng thiếu thông tin', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Im lặng hoàn toàn', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Xóa mọi bằng chứng liên quan', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Điều gì KHÔNG nên làm khi xử lý khủng hoảng truyền thông?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Thừa nhận vấn đề nếu có', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Im lặng hoàn toàn hoặc xóa bằng chứng', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chuẩn bị thông điệp nhất quán', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Xác nhận sự việc trước khi phản hồi', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Ngưỡng leo thang trong xử lý khủng hoảng dùng để làm gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Xác định khi nào cần chuyển vấn đề lên cấp quản lý cao hơn', true, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có tác dụng thực tế', false, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ áp dụng cho vấn đề nhỏ', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Để trì hoãn xử lý', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Cơ chế khiếu nại nội bộ cần đảm bảo điều gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Người khiếu nại được bảo vệ khỏi trả đũa', true, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ quản lý mới được khiếu nại', false, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần kênh độc lập', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Khiếu nại phải công khai danh tính ngay từ đầu', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khi soạn quy tắc ứng xử số cho đội ngũ đa văn hóa, cần lưu ý điều gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Áp đặt một chuẩn mực văn hóa duy nhất cho tất cả', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Điều chỉnh phù hợp với sự đa dạng nhưng vẫn đảm bảo tính nhất quán chung', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần quy tắc chung, mỗi người tự do', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ áp dụng quy tắc cho nhân viên nước ngoài', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M2-A-CH6', 'Chương 6: Danh tính số của tổ chức', 6, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-A-CH6-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Phân biệt được nhiều danh tính số</li><li>Giải thích được các cách thích hợp hơn để bảo vệ danh tiếng của bản thân</li><li>Thay đổi được dữ liệu được tạo ra thông qua một số công cụ, môi trường và dịch vụ</li></ul><h2>Định nghĩa</h2><ul><li>Danh tính số (Điều 2, TT 02/2025/TT-BGDĐT): tổng hợp thông tin về một người tồn tại ở dạng kỹ thuật số để định danh và phân biệt với những người khác, có thể bao gồm các thông tin như giới tính, tính cách, sở thích, tín ngưỡng, quan điểm chính trị, họ tên, ngày tháng năm sinh, số điện thoại, địa chỉ nhà, địa chỉ thư điện tử và các thông tin cá nhân khác</li><li>Danh tiếng trực tuyến (Điều 2, TT 02/2025/TT-BGDĐT): sự đánh giá hoặc nhận thức của xã hội về giá trị, uy tín, hoặc hình ảnh của một cá nhân, tổ chức hay thương hiệu trên môi trường trực tuyến</li><li>Hiện diện số của doanh nghiệp: tổng thể các kênh và nội dung mà doanh nghiệp xuất hiện trên môi trường số (website, mạng xã hội, đánh giá trực tuyến)</li><li>Uy tín số (digital reputation): nhận thức và đánh giá chung của công chúng về doanh nghiệp trên môi trường số</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-A-CH6-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Ở mức nâng cao, việc quản lý danh tính số mở rộng thành quản lý danh tính số của cả tổ chức — kiểm kê hiện diện số của doanh nghiệp là bước đầu để quản lý: liệt kê toàn bộ kênh chính thức, xác định kênh nào đang hoạt động, kênh nào bị bỏ hoang.</p><p>Chính sách phát ngôn cho nhân viên nên xác định rõ ai được phép phát ngôn chính thức thay mặt công ty, ở kênh nào, về chủ đề gì. Mạo danh doanh nghiệp là rủi ro cần được giám sát chủ động — khi phát hiện, cần có quy trình báo cáo tới nền tảng liên quan.</p><p>Sự nhất quán về thông tin liên hệ (số điện thoại, địa chỉ, email chính thức) giữa các kênh là một phần quan trọng của hiện diện số đáng tin cậy — khi thông tin liên hệ khác nhau giữa website, mạng xã hội, và các nền tảng khác, khách hàng dễ nghi ngờ đâu là kênh chính thức thật sự, tạo cơ hội cho các kênh mạo danh trà trộn.</p><p>Theo dõi danh tiếng trực tuyến có thể qua việc giám sát các đề cập đến thương hiệu trên mạng và phân tích cảm xúc của các đánh giá.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-A-CH6-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Kiểm kê toàn bộ hiện diện số của doanh nghiệp, phát hiện điểm không nhất quán hoặc rủi ro, và soạn chính sách phát ngôn cho nhân viên.</p><p>Sản phẩm nộp: Báo cáo kiểm kê hiện diện số và chính sách phát ngôn.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-A-CH6-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M2-A-CH6-QUIZ', 1, 'Quiz chương 6: Danh tính số của tổ chức', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao cần kiểm kê hiện diện số của doanh nghiệp định kỳ?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần thiết', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Phát hiện kênh bị bỏ hoang có thể là điểm yếu bị lợi dụng', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để trang trí báo cáo', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có tác dụng thực tế', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Chính sách phát ngôn cho nhân viên nhằm mục đích gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Cấm nhân viên nói về công ty', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Xác định rõ ai được phát ngôn chính thức, tránh thông tin mâu thuẫn', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có mục đích cụ thể', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ áp dụng cho quản lý cấp cao', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khi phát hiện tài khoản mạo danh doanh nghiệp, nên làm gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần làm gì', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Báo cáo tới nền tảng liên quan và thông báo khách hàng nếu cần', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chờ khách hàng tự phát hiện', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ theo dõi mà không hành động', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Sự thiếu nhất quán thông tin liên hệ giữa các kênh gây ra vấn đề gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có vấn đề gì', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Có thể khiến khách hàng nghi ngờ tính xác thực', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ ảnh hưởng đến thẩm mỹ', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không liên quan đến uy tín', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Theo dõi uy tín số bao gồm hoạt động nào?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ đếm số lượt theo dõi', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Giám sát đề cập thương hiệu, phân tích cảm xúc đánh giá, có kế hoạch phản ứng', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần theo dõi gì', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ quan tâm khi có khủng hoảng xảy ra', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M2-A-FINAL', 'Đánh giá cuối khóa', 7, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M2-A-FINAL-A', 'Bài đánh giá cuối khóa', 'ASSIGNMENT', '<p>Xây dựng bộ khung giao tiếp và cộng tác số hoàn chỉnh cho doanh nghiệp: kiến trúc kênh giao tiếp, chính sách chia sẻ và phân quyền, quy trình liên bộ phận, quy tắc ứng xử, kịch bản khủng hoảng, và chính sách phát ngôn.</p><p>Tiêu chí chấm:</p><p>Điểm đạt: ≥70/100, không tiêu chí nào dưới 50%.</p>', 60, 1, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M2-A-FINAL', 1, 'Đánh giá cuối khóa — LÃNH ĐẠO GIAO TIẾP VÀ CỘNG TÁC SỐ', 'FINAL', true, 70, 1, 'PUBLISHED', v_admin_id, now(), now());
    END IF;
    RAISE NOTICE 'Done: M2-A';
    -- === M3-F ===
    SELECT id INTO v_course_id FROM courses WHERE code = 'M3-F' AND organization_id = v_org_id;
    IF v_course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM course_modules WHERE course_id = v_course_id) THEN
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M3-F-CH1', 'Chương 1: Tạo tài liệu công việc cơ bản', 1, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-F-CH1-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Xác định được các cách tạo và chỉnh sửa nội dung đơn giản ở các định dạng đơn giản</li><li>Chọn được cách thể hiện bản thân thông qua việc tạo ra các phương tiện số đơn giản</li></ul><h2>Định nghĩa</h2><ul><li>Nội dung số (Điều 2, TT 02/2025/TT-BGDĐT): nội dung tồn tại dưới dạng dữ liệu số được mã hóa ở định dạng kỹ thuật số có thể đọc được và có thể được tạo, xem, phân phối, sửa đổi và lưu trữ bằng máy tính và công nghệ kỹ thuật số</li><li>Định dạng văn bản: cách trình bày chữ (tiêu đề, đoạn, danh sách, in đậm) giúp người đọc dễ theo dõi nội dung</li><li>Ô, hàng, cột: đơn vị cơ bản trong bảng tính — ô là giao điểm của một hàng và một cột</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-F-CH1-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Phát triển nội dung số nghĩa là tạo và chỉnh sửa được nội dung số ở các định dạng khác nhau. Định dạng văn bản cơ bản gồm tiêu đề, đoạn, danh sách, in đậm. Bảng tính tổ chức dữ liệu theo ô, hàng và cột. Trình chiếu nên tuân theo nguyên tắc đơn giản: mỗi slide truyền tải một ý chính.</p><p>Khi chọn định dạng, cần dựa vào mục đích sử dụng: báo cáo chi tiết dùng văn bản, số liệu cần tính toán dùng bảng tính, thuyết trình dùng trình chiếu. Khi cần gửi tài liệu để người khác không chỉnh sửa được, nên xuất ra định dạng PDF — đây chính là ví dụ cụ thể của khái niệm nội dung số: nội dung tồn tại dưới dạng dữ liệu được mã hóa, có thể tạo, xem, phân phối, sửa đổi và lưu trữ bằng máy tính.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-F-CH1-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Tạo ba tài liệu cho cùng một nội dung công việc: một văn bản, một bảng tính, một trình chiếu — và giải thích khi nào dùng loại nào.</p><p>Sản phẩm nộp: 3 tệp kèm giải thích lựa chọn định dạng.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-F-CH1-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M3-F-CH1-QUIZ', 1, 'Quiz chương 1: Tạo tài liệu công việc cơ bản', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khi cần trình bày số liệu để tính toán, nên dùng định dạng nào?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Văn bản', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Bảng tính', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Trình chiếu', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Hình ảnh', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Một slide trình chiếu hiệu quả nên có đặc điểm gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Càng nhiều chữ càng tốt', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Mỗi slide truyền tải một ý chính, chữ đủ lớn', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Dùng nhiều màu sắc sặc sỡ', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần hình ảnh minh họa', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao nên xuất tài liệu ra PDF trước khi gửi cho người khác?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Để giảm dung lượng', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Để người nhận không chỉnh sửa được nội dung', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Để tăng tốc độ tải', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có lý do cụ thể', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Trong bảng tính, mỗi hàng thường đại diện cho điều gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Một thuộc tính', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Một bản ghi (ví dụ một khách hàng)', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Một công thức', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có ý nghĩa cụ thể', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'In đậm trong văn bản nên dùng khi nào?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Cho toàn bộ đoạn văn', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Để nhấn mạnh từ khóa quan trọng, không lạm dụng', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không bao giờ nên dùng', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ dùng cho tiêu đề', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M3-F-CH2', 'Chương 2: Chỉnh sửa và tái sử dụng nội dung', 2, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-F-CH2-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Chọn được các cách sửa đổi, tinh chỉnh, cải thiện và tích hợp các mục đơn giản có nội dung và thông tin mới để tạo ra những nội dung và thông tin mới và độc đáo</li></ul><h2>Định nghĩa</h2><ul><li>Tri thức (Điều 2, TT 02/2025/TT-BGDĐT): sự hiểu biết, nhận thức và kinh nghiệm được tích lũy qua quá trình học hỏi, nghiên cứu và trải nghiệm</li><li>Dán giữ định dạng: sao chép nội dung và giữ nguyên kiểu chữ, màu sắc gốc</li><li>Dán văn bản thuần: sao chép chỉ lấy nội dung chữ, bỏ toàn bộ định dạng gốc</li><li>Mẫu tài liệu (template): tài liệu có sẵn cấu trúc và định dạng để tái sử dụng nhiều lần</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-F-CH2-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Tích hợp và tạo lập lại nội dung số nghĩa là sửa đổi, tinh chỉnh nội dung có sẵn để tạo ra nội dung mới. Khi nhận một tài liệu từ người khác để chỉnh sửa, cần thao tác cẩn thận để không làm hỏng định dạng đã có.</p><p>Khi sao chép nội dung từ nguồn khác, có hai lựa chọn: dán giữ định dạng hoặc dán văn bản thuần — dán văn bản thuần thường an toàn hơn khi muốn giữ tài liệu nhất quán. Mẫu tài liệu của doanh nghiệp giúp tiết kiệm thời gian và đảm bảo tính nhất quán. Trước khi gửi bất kỳ tài liệu nào, nên đọc lại toàn bộ một lượt để phát hiện lỗi.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-F-CH2-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Nhận một tài liệu thô, chỉnh sửa theo mẫu của doanh nghiệp, chèn một bảng số liệu và một hình ảnh, rồi xuất PDF.</p><p>Sản phẩm nộp: Tài liệu hoàn chỉnh theo mẫu và bản PDF.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-F-CH2-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M3-F-CH2-QUIZ', 1, 'Quiz chương 2: Chỉnh sửa và tái sử dụng nội dung', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Dán văn bản thuần khác dán giữ định dạng như thế nào?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có khác biệt', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Dán văn bản thuần bỏ định dạng gốc, dán giữ định dạng thì giữ nguyên', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Dán văn bản thuần nhanh hơn', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Dán giữ định dạng luôn tốt hơn', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao nên dùng mẫu tài liệu có sẵn của doanh nghiệp?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có lý do gì đặc biệt', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tiết kiệm thời gian và đảm bảo tính nhất quán', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để tuân thủ quy định', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Mẫu luôn đẹp hơn tự thiết kế', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khi nào nên chọn dán văn bản thuần thay vì dán giữ định dạng?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không bao giờ', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Khi muốn giữ tài liệu đích nhất quán về định dạng', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Khi cần giữ nguyên màu sắc gốc', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có sự khác biệt về khi nào nên dùng', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Trước khi gửi tài liệu, bước cuối cùng nên làm là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần kiểm tra lại', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Đọc lại toàn bộ để phát hiện lỗi chính tả và định dạng', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Gửi ngay để tiết kiệm thời gian', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần kiểm tra tiêu đề', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khi chèn bảng số liệu từ bảng tính vào văn bản, cần chú ý điều gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần chú ý gì đặc biệt', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Kiểm tra định dạng số và đơn vị hiển thị đúng', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần chèn càng nhanh càng tốt', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Luôn phải vẽ lại bảng thủ công', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M3-F-CH3', 'Chương 3: Nguyên tắc bản quyền cơ bản', 3, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-F-CH3-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Xác định được các quy tắc đơn giản về bản quyền và giấy phép áp dụng cho dữ liệu, thông tin và nội dung số</li></ul><h2>Định nghĩa</h2><ul><li>Bản quyền: quyền pháp lý bảo vệ tác phẩm sáng tạo (hình ảnh, văn bản, âm nhạc) khỏi việc sử dụng trái phép</li><li>Giấy phép sử dụng: điều kiện mà chủ sở hữu tác phẩm cho phép người khác sử dụng tác phẩm của mình</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-F-CH3-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Thực thi bản quyền và giấy phép nghĩa là hiểu được cách áp dụng bản quyền cho nội dung số. Bản quyền bảo vệ hầu hết các loại tác phẩm sáng tạo: hình ảnh, văn bản, âm nhạc, video. Một hiểu lầm phổ biến là nghĩ rằng bất cứ thứ gì tìm được trên mạng đều có thể tự do sử dụng.</p><p>Nhiều nền tảng cung cấp hình ảnh, nhạc, phông chữ miễn phí nhưng đi kèm điều kiện sử dụng cụ thể. Khi sử dụng nội dung của người khác được phép, cần ghi nguồn đầy đủ theo yêu cầu của giấy phép.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-F-CH3-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Tìm năm hình ảnh phù hợp cho một tài liệu công việc từ nguồn được phép sử dụng thương mại, ghi rõ giấy phép của từng hình.</p><p>Sản phẩm nộp: Bảng 5 hình ảnh kèm nguồn và loại giấy phép.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-F-CH3-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M3-F-CH3-QUIZ', 1, 'Quiz chương 3: Nguyên tắc bản quyền cơ bản', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Tìm được một hình ảnh trên mạng có nghĩa là được tự do sử dụng không?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Đúng, tìm được là được dùng', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Sai, cần kiểm tra điều kiện giấy phép trước khi sử dụng', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ đúng với hình ảnh cũ', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ đúng nếu không ghi tên tác giả', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khi sử dụng nội dung có giấy phép yêu cầu ghi nguồn, cần làm gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần ghi gì cả', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Ghi tên tác giả và đường dẫn tới nguồn gốc theo yêu cầu giấy phép', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần ghi tên trang tải về', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Ghi nguồn là tùy chọn', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Nội dung “miễn phí” trên mạng có luôn được dùng cho mục đích thương mại không?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Luôn được phép', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không nhất thiết, cần đọc điều kiện giấy phép cụ thể', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Miễn phí nghĩa là không có điều kiện gì', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ áp dụng cho hình ảnh', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Bản quyền bảo vệ những loại tác phẩm nào?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ văn bản', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Hình ảnh, văn bản, âm nhạc, video, phông chữ thiết kế riêng', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ hình ảnh', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ nội dung có đăng ký chính thức', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vi phạm bản quyền vô ý có gây rủi ro không?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không, chỉ vi phạm cố ý mới có rủi ro', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Có, vi phạm dù vô ý vẫn tạo ra rủi ro pháp lý và uy tín', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ có rủi ro với doanh nghiệp lớn', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có rủi ro thực tế', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M3-F-CH4', 'Chương 4: Làm quen tư duy tính toán', 4, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-F-CH4-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Liệt kê được các hướng dẫn đơn giản để hệ thống máy tính giải quyết một vấn đề đơn giản hoặc thực hiện một nhiệm vụ đơn giản</li></ul><h2>Định nghĩa</h2><ul><li>Bước tuần tự: các hành động được thực hiện theo thứ tự cố định để hoàn thành một công việc</li><li>Điều kiện nếu-thì: cấu trúc logic trong đó một hành động chỉ xảy ra khi một điều kiện cụ thể được thỏa mãn</li><li>Công thức bảng tính: biểu thức tính toán tự động dựa trên giá trị trong các ô</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-F-CH4-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Lập trình ở mức cơ bản nghĩa là liệt kê được các hướng dẫn đơn giản cho hệ thống máy tính. Chia một công việc thành các bước tuần tự rõ ràng là nền tảng của tư duy này. Nhiều công việc có chứa điều kiện nếu-thì, ví dụ “nếu đơn hàng trên 5 triệu thì áp dụng giảm giá 5%”.</p><p>Công thức bảng tính cơ bản như tính tổng, tính trung bình, đếm số lượng giúp xử lý số liệu nhanh hơn. Một nguyên tắc quan trọng: máy tính cần chỉ dẫn chính xác tuyệt đối, không thể “hiểu ý” như con người.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-F-CH4-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Viết ra quy trình một công việc hàng ngày của mình thành các bước rõ ràng, chỉ ra bước nào có điều kiện và bước nào lặp lại.</p><p>Sản phẩm nộp: Quy trình công việc dạng các bước, có đánh dấu điểm có thể tự động hóa.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-F-CH4-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M3-F-CH4-QUIZ', 1, 'Quiz chương 4: Làm quen tư duy tính toán', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao cần diễn đạt công việc thành các bước cụ thể, không mơ hồ?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không quan trọng', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Máy tính cần chỉ dẫn chính xác tuyệt đối, không thể “hiểu ý” như con người', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để trình bày đẹp', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có lý do cụ thể', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', '“Nếu đơn hàng trên 5 triệu thì giảm giá 5%” là ví dụ của cấu trúc gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Bước tuần tự', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Điều kiện nếu-thì', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Công thức tổng', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Vòng lặp', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Hàm điều kiện trong bảng tính có tác dụng gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để trang trí', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tự động đưa ra kết quả khác nhau tùy giá trị đầu vào', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có tác dụng thực tế', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ dùng để đếm số', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Nhận biết công việc lặp đi lặp lại thủ công có ích gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có ích gì', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Là bước đầu để nghĩ đến khả năng tự động hóa', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để phàn nàn về khối lượng công việc', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không liên quan đến tư duy tính toán', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Điều gì KHÔNG đúng về máy tính khi thực hiện chỉ dẫn?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Cần chỉ dẫn chính xác', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Có thể tự “hiểu ý” khi chỉ dẫn mơ hồ', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Thực hiện đúng theo logic được lập trình', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không tự suy luận ngoài chỉ dẫn đã cho', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M3-F-FINAL', 'Đánh giá cuối khóa', 5, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-F-FINAL-A', 'Bài đánh giá cuối khóa', 'ASSIGNMENT', '<p>Tạo một bộ tài liệu công việc hoàn chỉnh (báo cáo, bảng số liệu, slide tóm tắt), dùng hình ảnh có bản quyền hợp lệ, kèm quy trình các bước đã thực hiện.</p><p>Tiêu chí chấm:</p><p>Điểm đạt: ≥70/100.</p>', 60, 1, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M3-F-FINAL', 1, 'Đánh giá cuối khóa — TẠO LẬP NỘI DUNG SỐ CƠ BẢN', 'FINAL', true, 70, 1, 'PUBLISHED', v_admin_id, now(), now());
    END IF;
    RAISE NOTICE 'Done: M3-F';
    -- === M3-I ===
    SELECT id INTO v_course_id FROM courses WHERE code = 'M3-I' AND organization_id = v_org_id;
    IF v_course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM course_modules WHERE course_id = v_course_id) THEN
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M3-I-CH1', 'Chương 1: Sản xuất nội dung đa định dạng', 1, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-I-CH1-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Chỉ ra được cách tạo và chỉnh sửa nội dung ở các định dạng khác nhau</li><li>Thể hiện được bản thân thông qua việc tạo ra các phương tiện số</li></ul><h2>Định nghĩa</h2><ul><li>Nội dung số (Điều 2, TT 02/2025/TT-BGDĐT): nội dung tồn tại dưới dạng dữ liệu số được mã hóa ở định dạng kỹ thuật số có thể đọc được và có thể được tạo, xem, phân phối, sửa đổi và lưu trữ bằng máy tính và công nghệ kỹ thuật số</li><li>Bộ nhận diện (brand identity): tập hợp các yếu tố hình ảnh (màu sắc, phông chữ, logo) tạo nên sự nhất quán cho thương hiệu</li><li>Phân cấp thông tin: cách sắp xếp nội dung theo mức độ quan trọng để người xem dễ nắm bắt ý chính trước</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-I-CH1-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Ở mức trung cấp, việc phát triển nội dung số cần đạt chuẩn chuyên nghiệp hơn — tạo tài liệu theo bộ nhận diện thống nhất (cùng bảng màu, phông chữ, bố trí logo) giúp mọi tài liệu doanh nghiệp phát hành đều dễ nhận diện.</p><p>Nguyên tắc trình bày cơ bản gồm: sử dụng khoảng trắng hợp lý, phân cấp thông tin rõ ràng, tạo độ tương phản đủ để dễ đọc. Nội dung cần được điều chỉnh theo từng kênh: tài liệu in cần bố cục trang trọng, mạng xã hội cần ngắn gọn và bắt mắt.</p><p>Các công cụ thiết kế trực tuyến hiện nay cho phép người không chuyên tạo ra nội dung hình ảnh chuyên nghiệp thông qua mẫu có sẵn.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-I-CH1-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Chuyển một nội dung công việc thành ba định dạng cho ba kênh khác nhau, giữ nhất quán về nhận diện.</p><p>Sản phẩm nộp: Bộ 3 sản phẩm nội dung cho 3 kênh.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-I-CH1-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M3-I-CH1-QUIZ', 1, 'Quiz chương 1: Sản xuất nội dung đa định dạng', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Bộ nhận diện thống nhất mang lại lợi ích gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có lợi ích cụ thể', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Giúp tài liệu dễ nhận diện, tạo cảm giác chuyên nghiệp', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để làm đẹp', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tốn thời gian không cần thiết', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Nội dung cho mạng xã hội nên có đặc điểm gì so với tài liệu in?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Giống hệt nhau', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Ngắn gọn, bắt mắt ngay từ đầu', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Cần nhiều chữ hơn', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần điều chỉnh gì', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao cần cung cấp phụ đề cho video?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần thiết', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Giúp người xem trong môi trường ồn hoặc khiếm thính tiếp cận nội dung', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để trang trí', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Làm video chậm hơn', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Phân cấp thông tin trong thiết kế nghĩa là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có ý nghĩa cụ thể', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Sắp xếp nội dung theo mức độ quan trọng để dễ nắm bắt', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ dùng màu sắc khác nhau', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ áp dụng cho văn bản dài', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Công cụ thiết kế trực tuyến với mẫu có sẵn giúp ích gì cho người không chuyên?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có ích gì', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Cho phép tạo nội dung hình ảnh chuyên nghiệp không cần kiến thức thiết kế sâu', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ dùng được cho chuyên gia', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tốn nhiều thời gian hơn thiết kế thủ công', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M3-I-CH2', 'Chương 2: Tích hợp và chuyển đổi nội dung', 2, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-I-CH2-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Thảo luận các cách sửa đổi, tinh chỉnh, cải thiện và tích hợp nội dung và thông tin mới để tạo ra những nội dung và thông tin mới và độc đáo</li></ul><h2>Định nghĩa</h2><ul><li>Tri thức (Điều 2, TT 02/2025/TT-BGDĐT): sự hiểu biết, nhận thức và kinh nghiệm được tích lũy qua quá trình học hỏi, nghiên cứu và trải nghiệm</li><li>Trộn thư (mail merge): kỹ thuật tạo hàng loạt tài liệu cá nhân hóa từ một mẫu chung kết hợp với danh sách dữ liệu</li><li>Liên kết dữ liệu: việc kết nối một bảng số liệu với văn bản để khi số liệu thay đổi, văn bản tự động cập nhật theo</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-I-CH2-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Ở mức trung cấp, việc tích hợp và tạo lập lại nội dung cần tổng hợp từ nhiều nguồn thành sản phẩm mới, đưa tri thức (sự hiểu biết, kinh nghiệm tích lũy) vào nội dung mới một cách nhất quán, tránh tình trạng “chắp vá” giữa các đoạn.</p><p>Xây dựng bộ mẫu tài liệu chuẩn giúp toàn bộ phận tiết kiệm thời gian khi nhiều người cùng tạo tài liệu. Liên kết dữ liệu giữa bảng tính và văn bản cho phép biểu đồ tự động cập nhật khi số liệu gốc thay đổi. Trộn thư là kỹ thuật hữu ích khi cần tạo nhiều tài liệu cá nhân hóa cùng lúc. Quản lý phiên bản nội dung là kỹ năng quan trọng khi nhiều người tham gia chỉnh sửa.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-I-CH2-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Xây một bộ mẫu tài liệu cho bộ phận (tối thiểu 3 mẫu) và tạo tài liệu hàng loạt từ một danh sách dữ liệu.</p><p>Sản phẩm nộp: Bộ mẫu tài liệu và sản phẩm tạo hàng loạt.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-I-CH2-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M3-I-CH2-QUIZ', 1, 'Quiz chương 2: Tích hợp và chuyển đổi nội dung', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao cần giữ mạch nhất quán khi tổng hợp nội dung từ nhiều nguồn?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không quan trọng', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tránh cảm giác “chắp vá” khiến người đọc mất tin tưởng', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để tiết kiệm thời gian', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có lý do cụ thể', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Trộn thư (mail merge) hữu ích trong trường hợp nào?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ dùng cho một người nhận', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tạo nhiều tài liệu cá nhân hóa cùng lúc từ mẫu chung và danh sách dữ liệu', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có ứng dụng thực tế', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ dùng cho hình ảnh', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Liên kết dữ liệu giữa bảng tính và văn bản mang lại lợi ích gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có lợi ích cụ thể', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Báo cáo tự động cập nhật khi số liệu gốc thay đổi', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ làm tài liệu nặng hơn', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không thể thực hiện được', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khi chuyển đổi định dạng tệp, cần kiểm tra điều gì sau khi chuyển?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần kiểm tra gì', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Định dạng số, ký tự đặc biệt, cấu trúc bảng có bị mất không', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần kiểm tra dung lượng', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần kiểm tra tên tệp', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Quản lý phiên bản nội dung quan trọng khi nào?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không bao giờ quan trọng', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Khi nội dung được chỉnh sửa qua nhiều vòng, nhiều người tham gia', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ quan trọng với tài liệu ngắn', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ áp dụng cho hình ảnh', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M3-I-CH3', 'Chương 3: Bản quyền, giấy phép và sử dụng hợp pháp', 3, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-I-CH3-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Thảo luận các quy tắc về bản quyền và giấy phép áp dụng cho thông tin và nội dung số</li></ul><h2>Định nghĩa</h2><ul><li>Miền công cộng (public domain): tác phẩm không còn hoặc chưa từng thuộc bản quyền của riêng ai, có thể tự do sử dụng</li><li>Nội dung do AI tạo ra: nội dung được tạo bởi công cụ trí tuệ nhân tạo, có vấn đề pháp lý về quyền sở hữu chưa hoàn toàn rõ ràng ở nhiều nơi</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-I-CH3-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Ở mức trung cấp, việc áp dụng quy tắc bản quyền và giấy phép cần chi tiết hơn — phân biệt các loại giấy phép phổ biến khác nhau về mức độ tự do sử dụng, và xác định quyền sở hữu nội dung do nhân viên tạo ra trong quá trình làm việc (thường thuộc quyền sở hữu của công ty theo hợp đồng lao động).</p><p>Khi sử dụng nội dung có yếu tố bên thứ ba — ví dụ hình ảnh có người thật xuất hiện — cần có sự đồng ý của người đó. Nội dung do công cụ AI tạo ra đang là vùng pháp lý chưa hoàn toàn rõ ràng, cần thận trọng khi dùng cho mục đích thương mại. Xây dựng quy trình kiểm tra bản quyền trước khi công bố giúp giảm rủi ro.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-I-CH3-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Xây danh mục kiểm tra bản quyền cho quy trình xuất bản nội dung của bộ phận, áp dụng thử lên ba sản phẩm nội dung đã có.</p><p>Sản phẩm nộp: Danh mục kiểm tra bản quyền và kết quả rà soát ba sản phẩm.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-I-CH3-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M3-I-CH3-QUIZ', 1, 'Quiz chương 3: Bản quyền, giấy phép và sử dụng hợp pháp', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Nội dung do nhân viên tạo ra trong giờ làm việc thường thuộc quyền sở hữu của ai?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Luôn thuộc về nhân viên', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Thường thuộc công ty theo hợp đồng lao động', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không thuộc về ai', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Luôn cần thỏa thuận riêng mỗi lần', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khi hình ảnh có người thật xuất hiện được dùng cho mục đích thương mại, cần gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần gì đặc biệt', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Cần sự đồng ý của người đó', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần làm mờ mặt là đủ', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần ghi chú nguồn ảnh', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Nội dung do AI tạo ra hiện nay có vấn đề pháp lý gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Hoàn toàn rõ ràng về quyền sở hữu', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chưa hoàn toàn rõ ràng về ai sở hữu bản quyền ở nhiều nơi', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có vấn đề gì', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Luôn thuộc về người dùng công cụ', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Miền công cộng (public domain) nghĩa là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Nội dung phải trả phí để sử dụng', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tác phẩm không thuộc bản quyền riêng của ai, có thể tự do sử dụng', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ dành cho cơ quan nhà nước', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Nội dung bị cấm sử dụng', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Quy trình kiểm tra bản quyền trước khi công bố nên bao gồm gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần quy trình gì', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Xác nhận nguồn gốc nội dung sử dụng và lưu hồ sơ chứng minh quyền sử dụng', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần hỏi miệng đồng nghiệp', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ áp dụng cho nội dung lớn', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M3-I-CH4', 'Chương 4: Tự động hóa công việc lặp lại', 4, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-I-CH4-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Liệt kê được các hướng dẫn cho một hệ thống máy tính để giải quyết một vấn đề nhất định hoặc thực hiện một nhiệm vụ cụ thể</li></ul><h2>Định nghĩa</h2><ul><li>Hàm tra cứu (lookup function): công thức bảng tính tự động tìm và lấy giá trị tương ứng từ một bảng dữ liệu khác</li><li>Công cụ nối ứng dụng (no-code automation): công cụ cho phép kết nối và tự động hóa quy trình giữa các ứng dụng mà không cần viết mã lập trình</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-I-CH4-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Ở mức trung cấp, việc liệt kê hướng dẫn cho hệ thống máy tính giải quyết vấn đề cụ thể mở rộng sang tự động hóa công việc lặp lại — phân rã quy trình để xác định điểm có thể tự động hóa, thường là những bước lặp lại có quy tắc cố định.</p><p>Hàm điều kiện, hàm tra cứu, hàm xử lý văn bản trong bảng tính giúp xử lý khối lượng dữ liệu lớn nhanh hơn nhiều. Công cụ nối ứng dụng không cần lập trình cho phép kết nối các ứng dụng khác nhau. Không phải công việc lặp lại nào cũng đáng để tự động hóa — cần cân nhắc tần suất và mức độ ổn định của quy tắc.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-I-CH4-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Chọn một công việc lặp lại trong bộ phận, phân rã thành các bước, tự động hóa ít nhất một bước và đo thời gian tiết kiệm được.</p><p>Sản phẩm nộp: Sơ đồ quy trình, giải pháp tự động hóa, ước tính thời gian tiết kiệm.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-I-CH4-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M3-I-CH4-QUIZ', 1, 'Quiz chương 4: Tự động hóa công việc lặp lại', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Bước nào trong quy trình phù hợp nhất để tự động hóa?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Bước cần phán đoán chủ quan', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Bước lặp lại có quy tắc cố định', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Bước chỉ làm một lần', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Bước không có quy tắc rõ ràng', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Hàm tra cứu trong bảng tính dùng để làm gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tính tổng số liệu', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tự động tìm và lấy giá trị tương ứng từ bảng dữ liệu khác', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Định dạng chữ', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Xóa dữ liệu trùng lặp', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khi nào KHÔNG nên đầu tư công sức tự động hóa một công việc?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Khi công việc lặp lại hàng ngày', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Khi tần suất thấp và quy tắc hay thay đổi', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Khi quy tắc rất ổn định', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Khi khối lượng công việc lớn', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Rủi ro của việc tự động hóa sai là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có rủi ro gì đặc biệt', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Lỗi có thể lan rộng nhanh hơn lỗi thủ công', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ ảnh hưởng đến một trường hợp', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Dễ phát hiện hơn lỗi thủ công', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Công cụ nối ứng dụng không cần lập trình cho phép làm gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ dùng được bởi lập trình viên', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Kết nối và tự động hóa giữa các ứng dụng mà không cần viết mã', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có ứng dụng thực tế', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ dùng cho một ứng dụng duy nhất', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M3-I-FINAL', 'Đánh giá cuối khóa', 5, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-I-FINAL-A', 'Bài đánh giá cuối khóa', 'ASSIGNMENT', '<p>Sản xuất một chiến dịch nội dung nhỏ: bộ mẫu tài liệu, ba sản phẩm nội dung đa kênh, hồ sơ kiểm tra bản quyền, và một quy trình tự động hóa hỗ trợ.</p><p>Tiêu chí chấm:</p><p>Điểm đạt: ≥70/100.</p>', 60, 1, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M3-I-FINAL', 1, 'Đánh giá cuối khóa — TẠO LẬP NỘI DUNG CHUYÊN NGHIỆP', 'FINAL', true, 70, 1, 'PUBLISHED', v_admin_id, now(), now());
    END IF;
    RAISE NOTICE 'Done: M3-I';
    -- === M3-A ===
    SELECT id INTO v_course_id FROM courses WHERE code = 'M3-A' AND organization_id = v_org_id;
    IF v_course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM course_modules WHERE course_id = v_course_id) THEN
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M3-A-CH1', 'Chương 1: Chiến lược và hệ thống sản xuất nội dung', 1, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-A-CH1-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Thay đổi được nội dung bằng các định dạng phù hợp nhất</li><li>Điều chỉnh được cách thể hiện bản thân thông qua việc tạo ra các phương tiện số phù hợp nhất</li></ul><h2>Định nghĩa</h2><ul><li>Nội dung số (Điều 2, TT 02/2025/TT-BGDĐT): nội dung tồn tại dưới dạng dữ liệu số được mã hóa ở định dạng kỹ thuật số có thể đọc được và có thể được tạo, xem, phân phối, sửa đổi và lưu trữ bằng máy tính và công nghệ kỹ thuật số</li><li>Chân dung đối tượng (persona): hồ sơ mô tả đặc điểm, nhu cầu của một nhóm khách hàng hoặc đối tượng mục tiêu điển hình</li><li>Hành trình khách hàng: các giai đoạn một khách hàng trải qua từ khi biết đến sản phẩm đến khi mua và sử dụng</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-A-CH1-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Ở mức nâng cao, việc thể hiện bản thân qua các phương tiện số phù hợp nhất đòi hỏi một chiến lược sản xuất nội dung gắn với mục tiêu kinh doanh, không chỉ dừng ở từng sản phẩm đơn lẻ.</p><p>Xây dựng chân dung đối tượng giúp định hướng nội dung phù hợp với nhu cầu thực tế. Bản đồ nội dung theo hành trình khách hàng giúp nội dung phát huy đúng vai trò ở đúng thời điểm. Quy trình sản xuất nội dung có thể mở rộng cần các bước rõ ràng: lên ý tưởng, duyệt đề cương, sản xuất, duyệt nội dung cuối, xuất bản, đánh giá hiệu quả.</p><p>Khi khối lượng sản xuất nội dung tăng lên, một người không thể tự làm hết mà cần hướng dẫn người khác cùng tạo nội dung theo đúng chuẩn — vai trò này không phải là kiểm tra từng chi tiết mọi lúc (dễ sa vào vi quản lý), mà là thiết lập tiêu chuẩn chất lượng rõ ràng ngay từ đầu và chỉ duyệt kỹ ở các điểm kiểm soát quan trọng trong quy trình.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-A-CH1-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Xây chiến lược nội dung một quý cho doanh nghiệp: mục tiêu, đối tượng, chủ đề, kênh, lịch sản xuất, chỉ số đo lường.</p><p>Sản phẩm nộp: Chiến lược nội dung 1 quý, lịch sản xuất, bộ chỉ số.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-A-CH1-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M3-A-CH1-QUIZ', 1, 'Quiz chương 1: Chiến lược và hệ thống sản xuất nội dung', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Chiến lược nội dung nên bắt đầu từ đâu?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Từ việc chọn kênh trước', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Từ mục tiêu kinh doanh cụ thể', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Từ xu hướng thịnh hành', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Từ ngân sách có sẵn', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Chân dung đối tượng dùng để làm gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có tác dụng thực tế', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Định hướng nội dung phù hợp với nhu cầu thực tế của khách hàng', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để trang trí báo cáo', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ áp dụng cho quảng cáo', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao lượt xem không phải lúc nào cũng là chỉ số quan trọng nhất?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Lượt xem luôn là chỉ số quan trọng nhất', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tỷ lệ chuyển đổi mới phản ánh hiệu quả kinh doanh thực sự', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không nên đo lường lượt xem', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Lượt xem không có ý nghĩa gì', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Quy trình sản xuất nội dung có thể mở rộng cần điều gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần quy trình rõ ràng', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Các bước rõ ràng với người chịu trách nhiệm cụ thể ở mỗi bước', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần một người làm tất cả', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần duyệt nội dung', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vai trò hướng dẫn người khác trong sản xuất nội dung bao gồm gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Kiểm tra toàn bộ chi tiết mọi lúc', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Thiết lập tiêu chuẩn rõ ràng và duyệt ở các điểm kiểm soát quan trọng', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không can thiệp gì', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tự làm hết thay vì hướng dẫn', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M3-A-CH2', 'Chương 2: Quản trị và tái sử dụng tài sản nội dung', 2, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-A-CH2-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Đánh giá những cách phù hợp nhất để sửa đổi, sàng lọc, cải thiện và tích hợp các mục nội dung và thông tin cụ thể mới để tạo ra những nội dung và thông tin mới và độc đáo</li></ul><h2>Định nghĩa</h2><ul><li>Tri thức (Điều 2, TT 02/2025/TT-BGDĐT): sự hiểu biết, nhận thức và kinh nghiệm được tích lũy qua quá trình học hỏi, nghiên cứu và trải nghiệm</li><li>Tài sản nội dung: toàn bộ nội dung đã sản xuất (hình ảnh, văn bản, video) mà tổ chức sở hữu và có thể tái sử dụng</li><li>Nội dung mô-đun: nội dung được thiết kế thành các khối nhỏ độc lập, có thể kết hợp lại theo nhiều cách khác nhau</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-A-CH2-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Ở mức nâng cao, việc đánh giá cách phù hợp nhất để tích hợp nội dung mới vào tri thức hiện có đòi hỏi xây dựng hệ thống quản trị tài sản nội dung cấp tổ chức.</p><p>Một thư viện tài sản nội dung có tổ chức — phân loại theo chủ đề, loại nội dung, chiến dịch — giúp toàn bộ phận dễ tìm và tái sử dụng. Thiết kế nội dung theo hướng mô-đun (tách thành khối nhỏ độc lập) cho phép kết hợp linh hoạt cho nhiều mục đích khác nhau. Nội dung cần có chu kỳ rà soát định kỳ để phát hiện nội dung lỗi thời cần cập nhật hoặc loại bỏ.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-A-CH2-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Thiết kế thư viện tài sản nội dung cho doanh nghiệp, gồm cấu trúc phân loại, quy ước gắn thẻ và quy trình rà soát định kỳ.</p><p>Sản phẩm nộp: Thiết kế thư viện nội dung và quy trình vận hành.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-A-CH2-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M3-A-CH2-QUIZ', 1, 'Quiz chương 2: Quản trị và tái sử dụng tài sản nội dung', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Nội dung mô-đun là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Nội dung dài không thể chỉnh sửa', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Nội dung được thiết kế thành khối nhỏ độc lập, có thể kết hợp linh hoạt', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Nội dung chỉ dùng một lần', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Nội dung không cần phân loại', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao cần chu kỳ rà soát nội dung định kỳ?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần thiết nếu nội dung đã xuất bản', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Phát hiện nội dung lỗi thời cần cập nhật hoặc loại bỏ', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để tăng số lượng nội dung', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có tác dụng thực tế', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Bản địa hóa nội dung khi mở rộng thị trường bao gồm điều gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần dịch ngôn ngữ', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Điều chỉnh cả ví dụ, hình ảnh cho phù hợp văn hóa địa phương', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần điều chỉnh gì', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ áp dụng cho video', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Hệ thống gắn thẻ trong thư viện nội dung có vai trò gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có vai trò cụ thể', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Quyết định khả năng tìm kiếm hiệu quả của thư viện', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để trang trí', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Làm chậm quá trình lưu trữ', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Đo lường hiệu quả tái sử dụng nội dung có thể dựa trên chỉ số nào?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ số lượt thích', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'So sánh chi phí sản xuất mới với tái sử dụng, tỷ lệ nội dung được dùng lại', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không thể đo lường được', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ dựa vào cảm nhận', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M3-A-CH3', 'Chương 3: Quản trị rủi ro pháp lý về nội dung', 3, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-A-CH3-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Chọn được các quy tắc phù hợp nhất để áp dụng bản quyền và giấy phép cho dữ liệu, thông tin và nội dung số</li></ul><h2>Định nghĩa</h2><ul><li>Sở hữu trí tuệ: quyền pháp lý đối với các sáng tạo trí tuệ như tác phẩm, thiết kế, nhãn hiệu</li><li>Hồ sơ chứng minh quyền sử dụng: tài liệu lưu trữ chứng minh doanh nghiệp có quyền hợp pháp sử dụng một nội dung cụ thể</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-A-CH3-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Ở mức nâng cao, việc chọn quy tắc phù hợp nhất để áp dụng bản quyền và giấy phép mở rộng thành quản trị rủi ro pháp lý cấp tổ chức — bản đồ rủi ro nội dung cần bao quát: hình ảnh không rõ nguồn gốc, nhạc nền chưa có bản quyền, phông chữ thương mại dùng trái phép, dữ liệu cá nhân trong nội dung marketing.</p><p>Chính sách sở hữu trí tuệ nội bộ nên quy định rõ ai sở hữu nội dung nhân viên tạo ra và quy trình xin phép khi cần sử dụng tài sản trí tuệ bên ngoài. Khi làm việc với đơn vị sản xuất bên ngoài, hợp đồng cần có điều khoản rõ ràng về việc chuyển giao bản quyền.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-A-CH3-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Rà soát rủi ro pháp lý cho toàn bộ kho nội dung đang sử dụng, soạn chính sách sở hữu trí tuệ nội bộ và điều khoản mẫu cho hợp đồng sản xuất.</p><p>Sản phẩm nộp: Báo cáo rà soát rủi ro, chính sách sở hữu trí tuệ, điều khoản hợp đồng mẫu.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-A-CH3-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M3-A-CH3-QUIZ', 1, 'Quiz chương 3: Quản trị rủi ro pháp lý về nội dung', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khi thuê người làm tự do sản xuất nội dung mà không có điều khoản chuyển giao bản quyền, quyền sở hữu thuộc về ai?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Luôn thuộc về bên thuê', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Có thể vẫn thuộc về người sáng tạo theo mặc định', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không thuộc về ai', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tự động thuộc về công chúng', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao cần lưu hồ sơ chứng minh quyền sử dụng nội dung?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần thiết', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Là bằng chứng cần thiết khi có tranh chấp phát sinh', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để lưu trữ hình thức', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có tác dụng thực tế', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khi nhận được khiếu nại bản quyền, bước đầu tiên nên làm là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Phớt lờ khiếu nại', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Xác minh tính hợp lệ của khiếu nại trước khi phản hồi', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Ngay lập tức thừa nhận sai', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Xóa toàn bộ nội dung liên quan ngay lập tức', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Chính sách sở hữu trí tuệ nội bộ nên quy định điều gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần quy định gì cụ thể', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Ai sở hữu nội dung nhân viên tạo ra và quy trình xin phép sử dụng tài sản bên ngoài', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ áp dụng cho quản lý cấp cao', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ liên quan đến IT', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Bản đồ rủi ro nội dung nên bao quát những nguồn rủi ro nào?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ hình ảnh', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Hình ảnh, nhạc, phông chữ, dữ liệu cá nhân, phát ngôn gây tranh cãi', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ văn bản', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ liên quan đến video', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M3-A-CH4', 'Chương 4: Thiết kế giải pháp số cho nghiệp vụ', 4, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-A-CH4-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Xác định được các hướng dẫn thích hợp nhất cho hệ thống máy tính để giải quyết một vấn đề nhất định và thực hiện các nhiệm vụ cụ thể</li></ul><h2>Định nghĩa</h2><ul><li>Mô hình hóa dữ liệu: việc xác định các thực thể, thuộc tính và mối quan hệ giữa chúng để tổ chức dữ liệu một cách logic</li><li>Sơ đồ luồng xử lý: biểu diễn trực quan các bước và điểm quyết định trong một quy trình</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-A-CH4-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Ở mức nâng cao, việc xác định hướng dẫn thích hợp nhất cho hệ thống máy tính mở rộng thành thiết kế giải pháp số cho nghiệp vụ — từ một vấn đề nghiệp vụ cụ thể, chuyển hóa thành yêu cầu giải pháp rõ ràng.</p><p>Mô hình hóa dữ liệu bắt đầu bằng việc xác định các thực thể chính, thuộc tính, và mối quan hệ giữa chúng. Sơ đồ luồng xử lý giúp hình dung các bước và điểm quyết định, cần chú ý xử lý cả trường hợp ngoại lệ. Khi vấn đề vượt quá khả năng của công cụ không cần lập trình, cần chuyển sang giải pháp công nghệ chuyên nghiệp — tập hợp công cụ kỹ thuật (phần mềm, phần cứng) hoặc dịch vụ để giải quyết vấn đề đặt ra.</p><p>Khi giải pháp nối nhiều bước tự động hóa với nhau (đầu ra của bước này là đầu vào của bước sau), cần lường trước rủi ro phụ thuộc: nếu một ứng dụng trong chuỗi ngừng hoạt động hoặc thay đổi cách vận hành, toàn bộ quy trình phía sau có thể bị gián đoạn theo — nên có phương án dự phòng hoặc cảnh báo sớm cho các bước quan trọng nhất trong chuỗi.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-A-CH4-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Chọn một vấn đề nghiệp vụ thật, mô hình hóa dữ liệu và luồng xử lý, xây giải pháp tự động hóa và đánh giá hiệu quả.</p><p>Sản phẩm nộp: Tài liệu mô tả giải pháp, mô hình dữ liệu, sơ đồ luồng, giải pháp đã triển khai.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-A-CH4-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M3-A-CH4-QUIZ', 1, 'Quiz chương 4: Thiết kế giải pháp số cho nghiệp vụ', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Mô hình hóa dữ liệu bắt đầu từ việc gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Viết mã lập trình ngay', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Xác định các thực thể, thuộc tính và mối quan hệ giữa chúng', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chọn công cụ tự động hóa', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tính chi phí thực hiện', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Sơ đồ luồng xử lý cần chú ý điều gì ngoài luồng chính?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần luồng chính là đủ', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Cần xử lý các trường hợp ngoại lệ như dữ liệu thiếu, lỗi hệ thống', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần quan tâm đến ngoại lệ', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Ngoại lệ không quan trọng bằng tốc độ xử lý', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Rủi ro phụ thuộc trong tự động hóa nhiều bước là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có rủi ro gì', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Nếu một ứng dụng trong chuỗi ngừng hoạt động, toàn bộ quy trình có thể gián đoạn', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ ảnh hưởng đến tốc độ', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không liên quan đến vận hành', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khi nào nên chuyển từ công cụ không cần lập trình sang giải pháp lập trình chuyên nghiệp?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Luôn nên dùng lập trình ngay từ đầu', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Khi vấn đề đòi hỏi logic phức tạp hoặc tích hợp sâu vượt khả năng công cụ hiện có', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không bao giờ cần chuyển', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Khi chi phí thấp', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khi mô tả yêu cầu cho đơn vị phát triển phần mềm, điều gì quan trọng hơn?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ định công nghệ cụ thể cần dùng', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Mô tả rõ vấn đề cần giải quyết, kết quả mong muốn, ràng buộc', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần mô tả chi tiết', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần đưa ngân sách', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M3-A-FINAL', 'Đánh giá cuối khóa', 5, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M3-A-FINAL-A', 'Bài đánh giá cuối khóa', 'ASSIGNMENT', '<p>Xây dựng hệ thống nội dung hoàn chỉnh cho doanh nghiệp: chiến lược một quý, thư viện tài sản, chính sách pháp lý, và một giải pháp số hỗ trợ quy trình sản xuất nội dung.</p><p>Tiêu chí chấm:</p><p>Điểm đạt: ≥70/100, không tiêu chí nào dưới 50%.</p>', 60, 1, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M3-A-FINAL', 1, 'Đánh giá cuối khóa — CHIẾN LƯỢC NỘI DUNG VÀ GIẢI PHÁP SỐ', 'FINAL', true, 70, 1, 'PUBLISHED', v_admin_id, now(), now());
    END IF;
    RAISE NOTICE 'Done: M3-A';
    -- === M4-F ===
    SELECT id INTO v_course_id FROM courses WHERE code = 'M4-F' AND organization_id = v_org_id;
    IF v_course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM course_modules WHERE course_id = v_course_id) THEN
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M4-F-CH1', 'Chương 1: Bảo vệ thiết bị và tài khoản', 1, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-F-CH1-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Nhận biết được cách bảo vệ thiết bị và nội dung số một cách đơn giản</li><li>Phân biệt được rủi ro và mối đe dọa đơn giản trong môi trường số</li><li>Tuân theo được các biện pháp an toàn và bảo mật đơn giản</li><li>Nhận biết được những cách thức đơn giản để quan tâm đến mức độ tin cậy và quyền riêng tư</li></ul><h2>Định nghĩa</h2><ul><li>Thiết bị số (Điều 2, TT 02/2025/TT-BGDĐT): thiết bị điện tử, máy tính, viễn thông, truyền dẫn, thu phát sóng vô tuyến điện và thiết bị tích hợp khác được sử dụng để sản xuất, truyền đưa, thu thập, xử lý, lưu trữ và trao đổi thông tin số</li><li>Mật khẩu mạnh: mật khẩu đủ dài (tối thiểu 12 ký tự), kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt, không trùng với mật khẩu dùng ở nơi khác</li><li>Xác thực hai lớp (2FA): phương thức bảo mật yêu cầu thêm một bước xác nhận ngoài mật khẩu (mã gửi về điện thoại, ứng dụng xác thực)</li><li>Trình quản lý mật khẩu: phần mềm lưu trữ và tự động điền mật khẩu an toàn, giúp không cần nhớ nhiều mật khẩu phức tạp</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-F-CH1-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Bảo vệ thiết bị nghĩa là bảo vệ các thiết bị số — thiết bị điện tử, máy tính, viễn thông và thiết bị tích hợp khác dùng để xử lý, lưu trữ và trao đổi thông tin số. Mật khẩu mạnh cần đủ dài, kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt, không dùng lại ở nhiều nơi.</p><p>Xác thực hai lớp bổ sung một lớp bảo vệ: kể cả khi mật khẩu bị lộ, kẻ xấu vẫn cần thêm mã xác thực mới đăng nhập được. Cập nhật hệ điều hành và ứng dụng thường xuyên vá các lỗ hổng bảo mật đã biết. Dấu hiệu thiết bị bất thường bao gồm pin hết nhanh, thiết bị nóng hoặc chạy chậm không rõ nguyên nhân.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-F-CH1-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Rà soát các tài khoản công việc đang dùng (liệt kê tối thiểu 5 tài khoản: email, hệ thống nội bộ, mạng xã hội công ty…), bật xác thực hai lớp cho tối thiểu 3 tài khoản quan trọng nhất, và kiểm tra tình trạng cập nhật của thiết bị đang dùng.</p><p>Sản phẩm nộp: Bảng kiểm 5 tài khoản (đã bật 2FA hay chưa) và ảnh chụp trạng thái cập nhật thiết bị.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-F-CH1-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M4-F-CH1-QUIZ', 1, 'Quiz chương 1: Bảo vệ thiết bị và tài khoản', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao không nên dùng lại cùng một mật khẩu cho nhiều tài khoản?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Vì mất nhiều thời gian gõ hơn', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Nếu một dịch vụ bị lộ dữ liệu, các tài khoản khác dùng chung mật khẩu cũng gặp rủi ro', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Vì hệ thống sẽ báo lỗi', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có lý do cụ thể', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Xác thực hai lớp bổ sung điều gì so với chỉ dùng mật khẩu?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có gì khác biệt', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Yêu cầu thêm một bước xác nhận, bảo vệ tài khoản kể cả khi mật khẩu bị lộ', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Làm chậm quá trình đăng nhập không cần thiết', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ dùng cho tài khoản ngân hàng', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao nên cập nhật thiết bị và phần mềm thường xuyên?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để có giao diện mới', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Các bản cập nhật thường vá lỗ hổng bảo mật đã biết', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có lý do liên quan bảo mật', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để tăng dung lượng lưu trữ', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Dấu hiệu nào sau đây có thể cho thấy thiết bị bị xâm nhập?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Pin hết nhanh bất thường, xuất hiện ứng dụng lạ', true, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Thiết bị đang sạc pin bình thường', false, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Có bản cập nhật mới', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Wifi kết nối chậm do mạng yếu', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Trình quản lý mật khẩu giúp ích gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có tác dụng thực tế', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tạo và lưu mật khẩu riêng biệt, đủ mạnh cho từng tài khoản', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ dùng để ghi chú', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Làm chậm máy tính', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M4-F-CH2', 'Chương 2: Bảo vệ thông tin cá nhân', 2, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-F-CH2-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Lựa chọn được những cách thức đơn giản để bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số</li><li>Nhận biết được các cách sử dụng và chia sẻ thông tin định danh cá nhân một cách an toàn</li><li>Nhận diện được các tuyên bố cơ bản trong chính sách quyền riêng tư về cách sử dụng dữ liệu cá nhân</li></ul><h2>Định nghĩa</h2><ul><li>Thông tin cá nhân: thông tin gắn liền hoặc giúp xác định một người cụ thể — họ tên, ngày sinh, số điện thoại, địa chỉ, hình ảnh, số căn cước</li><li>Lừa đảo giả mạo (phishing): hình thức lừa đảo qua email, tin nhắn hoặc cuộc gọi giả danh một tổ chức đáng tin để lấy thông tin hoặc tiền</li><li>Quyền ứng dụng: các loại dữ liệu hoặc chức năng thiết bị mà một ứng dụng được phép truy cập (camera, vị trí, danh bạ)</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-F-CH2-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số bắt đầu từ việc nhận biết thông tin cá nhân — họ tên, ngày sinh, số điện thoại, địa chỉ, hình ảnh, số căn cước. Lừa đảo giả mạo thường tạo cảm giác khẩn cấp và yêu cầu cung cấp thông tin nhạy cảm qua liên kết.</p><p>Nguyên tắc an toàn cơ bản: không bấm vào liên kết lạ, không bao giờ cung cấp mã xác thực cho bất kỳ ai qua điện thoại. Trên điện thoại, nên rà soát định kỳ và thu hồi quyền truy cập ứng dụng không cần thiết. Theo Nghị định 13/2023/NĐ-CP, dữ liệu cá nhân được phân loại thành dữ liệu cơ bản và dữ liệu nhạy cảm, cần mức độ bảo vệ khác nhau.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-F-CH2-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Phân tích 5 email/tin nhắn mẫu (tự tìm hoặc dùng email lạ từng nhận được), xác định cái nào là lừa đảo và chỉ ra dấu hiệu; rà soát quyền ứng dụng trên điện thoại cá nhân.</p><p>Sản phẩm nộp: Bảng phân tích 5 tin nhắn và kết quả rà soát quyền ứng dụng.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-F-CH2-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M4-F-CH2-QUIZ', 1, 'Quiz chương 2: Bảo vệ thông tin cá nhân', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Dấu hiệu điển hình của một email lừa đảo là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Địa chỉ gửi chính xác 100%', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tạo cảm giác khẩn cấp, yêu cầu cung cấp thông tin qua liên kết', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có yêu cầu hành động gì', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Gửi từ đồng nghiệp quen biết', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khi nhận được yêu cầu cung cấp mã OTP qua điện thoại, nên làm gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Cung cấp ngay nếu người gọi tự xưng là ngân hàng', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Từ chối — không tổ chức hợp pháp nào yêu cầu mã OTP qua điện thoại', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Cung cấp nếu họ biết tên mình', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tùy vào giọng điệu người gọi', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Một ứng dụng đèn pin xin quyền truy cập danh bạ. Đây có phải dấu hiệu đáng ngờ không?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không, đây là điều bình thường', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Có, ứng dụng đèn pin không có lý do chính đáng cần quyền này', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ đáng ngờ nếu ứng dụng miễn phí', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần quan tâm đến quyền ứng dụng', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khi nghi ngờ thông tin cá nhân bị lộ, bước đầu tiên nên làm là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không làm gì, chờ xem có vấn đề gì xảy ra không', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Đổi mật khẩu tài khoản liên quan và bật xác thực hai lớp', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Xóa toàn bộ tài khoản', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Đổi số điện thoại ngay lập tức', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Thông tin nào sau đây được coi là thông tin cá nhân?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Giá sản phẩm của công ty', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Số điện thoại và địa chỉ nhà', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tỷ giá ngoại tệ', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Thời tiết hôm nay', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M4-F-CH3', 'Chương 3: Sức khỏe khi làm việc với thiết bị số', 3, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-F-CH3-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Phân biệt được các cách thức đơn giản để tránh rủi ro và đe dọa đến sức khỏe thể chất và tinh thần khi sử dụng công nghệ số</li><li>Lựa chọn được những cách thức đơn giản để bảo vệ bản thân khỏi nguy cơ trong môi trường số</li><li>Nhận biết được những công nghệ số đơn giản giúp tăng cường thịnh vượng xã hội và sự hòa hợp trong xã hội</li></ul><h2>Định nghĩa</h2><ul><li>An sinh số (Điều 2, TT 02/2025/TT-BGDĐT): trạng thái cân bằng giữa việc sử dụng công nghệ số và sức khỏe tinh thần, thể chất của người dùng trong việc sử dụng phương tiện kỹ thuật số</li><li>Bắt nạt trên mạng (Điều 2, TT 02/2025/TT-BGDĐT): những hành vi có chủ đích xấu được tiến hành bởi một người hoặc một nhóm người lên một cá nhân bằng cách đe dọa, xâm hại, làm nhục, làm ảnh hưởng, xúc phạm danh dự, nhân phẩm hoặc tra tấn tinh thần thông qua tin nhắn, mạng Internet, các trang mạng xã hội và qua các thiết bị điện tử</li><li>Tư thế làm việc đúng: cách bố trí màn hình, ghế, bàn phím giúp giảm căng thẳng cơ thể khi làm việc lâu với máy tính</li><li>Quá tải thông tin: trạng thái tiếp nhận quá nhiều thông báo, tin nhắn, email cùng lúc gây khó tập trung và căng thẳng</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-F-CH3-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Bảo vệ sức khỏe và an sinh số nghĩa là tránh rủi ro và đe dọa đến sức khỏe thể chất và tinh thần khi sử dụng công nghệ số — an sinh số là trạng thái cân bằng giữa việc sử dụng công nghệ số và sức khỏe tinh thần, thể chất của người dùng.</p><p>Tư thế làm việc đúng bắt đầu từ vị trí màn hình ngang tầm mắt, khoảng cách 50–70cm. Quy tắc 20-20-20 giúp giảm mỏi mắt: mỗi 20 phút nhìn màn hình, nhìn xa 20 feet trong 20 giây. Bắt nạt trên mạng là hành vi có chủ đích xấu đe dọa, xúc phạm qua tin nhắn, mạng xã hội — cần nhận biết và bảo vệ bản thân khỏi nguy cơ này.</p><p>Bên cạnh việc phòng tránh rủi ro, công nghệ số cũng có thể được dùng theo hướng tích cực để tăng cường thịnh vượng xã hội và sự hòa hợp trong xã hội — ví dụ các ứng dụng theo dõi giấc ngủ và vận động giúp duy trì thói quen lành mạnh, các nền tảng kết nối cộng đồng giúp người dùng tìm được nhóm hỗ trợ phù hợp, hoặc các công cụ thiền định/thư giãn trực tuyến giúp giảm căng thẳng. Nhận biết được những công nghệ này giúp người dùng chủ động sử dụng công nghệ số theo hướng có lợi cho sức khỏe tinh thần, không chỉ dừng ở việc phòng thủ trước rủi ro.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-F-CH3-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Chụp ảnh và đánh giá chỗ làm việc hiện tại theo danh mục kiểm tra dưới đây, thực hiện điều chỉnh và ghi lại.</p><p>Danh mục kiểm tra chỗ làm việc:</p><p>Sản phẩm nộp: Đánh giá chỗ làm việc trước và sau điều chỉnh (dùng bảng trên).</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-F-CH3-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M4-F-CH3-QUIZ', 1, 'Quiz chương 3: Sức khỏe khi làm việc với thiết bị số', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Quy tắc 20-20-20 nghĩa là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Làm việc 20 phút nghỉ 20 giờ', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Mỗi 20 phút nhìn màn hình, nhìn xa 20 feet trong 20 giây', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Nghỉ 20 phút mỗi 20 giờ làm việc', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có quy tắc như vậy', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vị trí màn hình đúng nên như thế nào?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Cao hơn tầm mắt nhiều', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Mép trên ngang hoặc thấp hơn tầm mắt một chút', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không quan trọng vị trí', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Càng gần mắt càng tốt', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Dấu hiệu nào cho thấy quá tải thông tin?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Cảm thấy thư giãn khi kiểm tra điện thoại', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Khó tập trung vì liên tục bị gián đoạn bởi thông báo', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có thông báo nào', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Làm việc hiệu quả hơn', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao nên tắt thông báo công việc ngoài giờ?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần thiết', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Giúp thiết lập ranh giới rõ ràng giữa làm việc và nghỉ ngơi', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Sẽ bị đánh giá là thiếu trách nhiệm', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có lợi ích gì', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khi căng thẳng công việc kéo dài, nên làm gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tự chịu đựng một mình', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tìm đến sự hỗ trợ chuyên môn khi cần thiết', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Bỏ qua vì đây là chuyện bình thường', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không nên chia sẻ với ai', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M4-F-CH4', 'Chương 4: Sử dụng công nghệ có ý thức môi trường', 4, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-F-CH4-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Nhận biết được tác động cơ bản của công nghệ số và việc sử dụng công nghệ số đối với môi trường</li></ul><h2>Định nghĩa</h2><ul><li>Vòng đời thiết bị: toàn bộ quá trình từ sản xuất, sử dụng đến thải bỏ một thiết bị điện tử</li><li>Rác thải điện tử: thiết bị điện tử đã hỏng hoặc không còn sử dụng, cần được xử lý đúng cách để tránh ô nhiễm</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-F-CH4-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Bảo vệ môi trường nghĩa là nhận thức được tác động của công nghệ số và việc sử dụng công nghệ số đối với môi trường. Mỗi thiết bị điện tử đều có tác động môi trường trong suốt vòng đời: khai thác nguyên liệu, tiêu thụ năng lượng khi sử dụng, trở thành rác thải khi loại bỏ.</p><p>Thói quen tiết kiệm năng lượng đơn giản gồm tắt máy tính khi không dùng, bật chế độ tiết kiệm năng lượng. Khi thiết bị cần thải bỏ, cần đưa đến điểm thu gom rác thải điện tử chuyên biệt và xóa sạch dữ liệu cá nhân trước khi thải bỏ.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-F-CH4-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Đánh giá thói quen sử dụng công nghệ của bản thân hoặc bộ phận trong một tuần, đề xuất 5 thay đổi khả thi và ước tính tác động.</p><p>Sản phẩm nộp: Bảng đánh giá thói quen và 5 đề xuất cải thiện.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-F-CH4-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M4-F-CH4-QUIZ', 1, 'Quiz chương 4: Sử dụng công nghệ có ý thức môi trường', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Dịch vụ lưu trữ đám mây có tác động môi trường không?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không, vì không dùng thiết bị vật lý', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Có, vì trung tâm dữ liệu tiêu thụ năng lượng thực tế', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ có tác động nếu dùng miễn phí', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có cách nào đo lường được', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao nên xóa dữ liệu cá nhân trước khi thải bỏ thiết bị điện tử?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần thiết', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Để tránh rủi ro rò rỉ thông tin cá nhân', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để tiết kiệm dung lượng', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có lý do liên quan bảo mật', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Rác thải điện tử nên được xử lý như thế nào?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Bỏ chung với rác sinh hoạt', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Đưa đến điểm thu gom rác thải điện tử chuyên biệt', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Đốt tại nhà', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần xử lý đặc biệt', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Kéo dài tuổi thọ thiết bị bằng cách nào?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Thay mới ngay khi có phiên bản mới', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Sửa chữa khi có thể thay vì thay mới ngay', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không bảo trì thiết bị', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Sử dụng liên tục không nghỉ', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Họp trực tuyến thay vì di chuyển có lợi ích môi trường gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có lợi ích gì', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Giảm phát thải gián tiếp từ việc đi lại', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ tiết kiệm thời gian', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không liên quan đến môi trường', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M4-F-FINAL', 'Đánh giá cuối khóa', 5, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-F-FINAL-A', 'Bài đánh giá cuối khóa', 'ASSIGNMENT', '<p>Hoàn thành bộ kiểm tra an toàn số cá nhân: tài khoản, thiết bị, quyền ứng dụng, chỗ làm việc, thói quen sử dụng — kèm kế hoạch cải thiện.</p><p>Tiêu chí chấm:</p><p>Điểm đạt: ≥70/100.</p>', 60, 1, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M4-F-FINAL', 1, 'Đánh giá cuối khóa — AN TOÀN SỐ CƠ BẢN', 'FINAL', true, 70, 1, 'PUBLISHED', v_admin_id, now(), now());
    END IF;
    RAISE NOTICE 'Done: M4-F';
    -- === M4-I ===
    SELECT id INTO v_course_id FROM courses WHERE code = 'M4-I' AND organization_id = v_org_id;
    IF v_course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM course_modules WHERE course_id = v_course_id) THEN
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M4-I-CH1', 'Chương 1: Bảo mật trong môi trường làm việc', 1, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-I-CH1-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Thiết lập được những cách thức bảo vệ thiết bị và nội dung số</li><li>Phân biệt được rủi ro và mối đe dọa trong môi trường số</li><li>Chọn lựa được các biện pháp an toàn và bảo mật</li><li>Giải thích được các cách thức để quan tâm đến mức độ tin cậy và quyền riêng tư</li></ul><h2>Định nghĩa</h2><ul><li>Thiết bị số (Điều 2, TT 02/2025/TT-BGDĐT): thiết bị điện tử, máy tính, viễn thông, truyền dẫn, thu phát sóng vô tuyến điện và thiết bị tích hợp khác được sử dụng để sản xuất, truyền đưa, thu thập, xử lý, lưu trữ và trao đổi thông tin số</li><li>Chính sách bảo mật doanh nghiệp: bộ quy định về cách nhân viên phải bảo vệ thông tin và hệ thống của công ty</li><li>Sao lưu (backup): bản sao dữ liệu độc lập, không thay đổi theo bản gốc, dùng để khôi phục khi có sự cố</li><li>Tấn công lừa đảo có chủ đích (spear phishing): hình thức lừa đảo được cá nhân hóa nhắm vào một người hoặc tổ chức cụ thể, thường có thông tin chính xác khiến nạn nhân dễ tin hơn</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-I-CH1-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Ở mức trung cấp, việc bảo vệ thiết bị và nội dung số mở rộng sang môi trường làm việc — áp dụng chính sách bảo mật doanh nghiệp: không chia sẻ tài khoản đăng nhập, không cài phần mềm ngoài danh sách được phê duyệt.</p><p>Khi làm việc ngoài văn phòng, cần tránh dùng wifi công cộng không có mật khẩu để truy cập hệ thống công ty. Sự khác biệt quan trọng giữa đồng bộ và sao lưu: đồng bộ sẽ lan truyền cả những thay đổi không mong muốn, trong khi sao lưu là một bản sao độc lập. Tấn công lừa đảo có chủ đích nguy hiểm hơn lừa đảo thông thường vì được cá nhân hóa — cách phòng vệ tốt nhất là luôn xác minh qua kênh khác khi nhận yêu cầu bất thường.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-I-CH1-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Lập danh mục kiểm tra bảo mật cho công việc của bộ phận mình, tự đánh giá và xác định 3 điểm yếu lớn nhất.</p><p>Sản phẩm nộp: Danh mục kiểm tra bảo mật và báo cáo tự đánh giá.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-I-CH1-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M4-I-CH1-QUIZ', 1, 'Quiz chương 1: Bảo mật trong môi trường làm việc', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Sự khác biệt cốt lõi giữa đồng bộ và sao lưu là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có khác biệt', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Đồng bộ lan truyền cả thay đổi không mong muốn, sao lưu là bản sao độc lập', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Sao lưu nhanh hơn đồng bộ', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Đồng bộ an toàn hơn sao lưu', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khi nhận yêu cầu chuyển tiền gấp qua email từ “giám đốc”, dù nội dung rất thuyết phục, nên làm gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chuyển ngay để không trễ hạn', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Xác minh qua kênh khác (gọi điện trực tiếp) trước khi hành động', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Trả lời email hỏi thêm chi tiết', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chuyển tiền một phần để giảm rủi ro', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao tấn công lừa đảo có chủ đích nguy hiểm hơn lừa đảo thông thường?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không nguy hiểm hơn', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Được cá nhân hóa với thông tin chính xác, khiến nạn nhân dễ tin hơn', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ nhắm vào doanh nghiệp lớn', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Dễ nhận biết hơn lừa đảo thông thường', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khi làm việc ở nơi công cộng với wifi không rõ nguồn gốc, nên làm gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Kết nối bình thường để tiết kiệm dữ liệu di động', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tránh truy cập hệ thống công ty, hoặc dùng VPN nếu bắt buộc', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có vấn đề gì cần lưu ý', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần tắt camera laptop', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khi phát hiện sự cố bảo mật, nên làm gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tự xử lý một mình để tránh phiền phức', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Báo cáo ngay cho bộ phận phụ trách theo quy trình nội bộ', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Im lặng vì sợ bị trách', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ kể cho đồng nghiệp thân thiết', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M4-I-CH2', 'Chương 2: Xử lý dữ liệu cá nhân trong công việc', 2, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-I-CH2-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Thảo luận về cách bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số</li><li>Thảo luận về cách sử dụng và chia sẻ thông tin định danh cá nhân một cách an toàn</li><li>Chỉ ra được các tuyên bố trong chính sách quyền riêng tư về cách sử dụng dữ liệu cá nhân</li></ul><h2>Định nghĩa</h2><ul><li>Dữ liệu cá nhân cơ bản: thông tin gắn liền hoặc giúp xác định một người, ví dụ họ tên, ngày sinh, giới tính, số điện thoại, địa chỉ, hình ảnh (theo Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân)</li><li>Dữ liệu cá nhân nhạy cảm: dữ liệu gắn liền với quyền riêng tư, khi bị xâm phạm sẽ ảnh hưởng trực tiếp đến quyền và lợi ích hợp pháp của cá nhân — ví dụ tình trạng sức khỏe, quan điểm chính trị, dữ liệu tài chính, dữ liệu sinh trắc học</li><li>Sự đồng ý của chủ thể dữ liệu: việc chủ thể dữ liệu tự nguyện xác nhận đồng ý cho một hoặc nhiều mục đích xử lý dữ liệu cụ thể của mình</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-I-CH2-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Ở mức trung cấp, việc bảo vệ dữ liệu cá nhân mở rộng sang xử lý dữ liệu khách hàng trong công việc. Nguyên tắc thu thập tối thiểu là chỉ thu thập dữ liệu cá nhân thực sự cần thiết cho mục đích cụ thể, không thu thập “phòng khi cần”.</p><p>Phân quyền truy cập theo mức nhạy cảm: dữ liệu cơ bản có thể được nhiều bộ phận truy cập theo nhu cầu, dữ liệu nhạy cảm cần giới hạn nghiêm ngặt hơn. Nên ẩn danh hoặc giả danh hóa khi phân tích để giảm rủi ro. Khách hàng có quyền yêu cầu truy cập, sửa đổi, hoặc yêu cầu xóa dữ liệu cá nhân của họ — doanh nghiệp cần có quy trình xử lý các yêu cầu này.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-I-CH2-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Rà soát một tập dữ liệu công việc thật (hoặc dùng bảng mẫu ở trên làm điểm khởi đầu, bổ sung thêm 5–10 trường của dữ liệu thật bộ phận đang dùng), phân loại từng trường theo mức nhạy cảm, tạo bản trích xuất tối thiểu cho một mục đích phân tích cụ thể.</p><p>Sản phẩm nộp: Bảng phân loại trường dữ liệu, bản trích xuất tối thiểu, giải trình.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-I-CH2-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M4-I-CH2-QUIZ', 1, 'Quiz chương 2: Xử lý dữ liệu cá nhân trong công việc', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Theo Nghị định 13/2023/NĐ-CP, dữ liệu cá nhân được phân thành mấy loại chính?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Một loại duy nhất', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Hai loại: cơ bản và nhạy cảm', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Ba loại', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không phân loại', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Nguyên tắc thu thập tối thiểu nghĩa là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Thu thập càng nhiều dữ liệu càng tốt', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ thu thập dữ liệu thực sự cần thiết cho mục đích cụ thể', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không thu thập dữ liệu nào', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ áp dụng cho doanh nghiệp lớn', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Dán danh sách khách hàng vào một công cụ trực tuyến miễn phí chưa được phê duyệt có vấn đề gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có vấn đề gì', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Là hình thức chuyển giao dữ liệu ra ngoài kiểm soát, tiềm ẩn rủi ro vi phạm', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ có vấn đề nếu công cụ đó tính phí', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Luôn an toàn nếu công cụ có tên tuổi', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khách hàng có quyền gì đối với dữ liệu cá nhân của họ?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có quyền gì', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Quyền yêu cầu truy cập, sửa đổi, hoặc yêu cầu xóa dữ liệu', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ có quyền xem, không được yêu cầu sửa', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ áp dụng cho khách hàng VIP', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Sự đồng ý của chủ thể dữ liệu cần có đặc điểm gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Có thể dùng một lần đồng ý chung cho mọi mục đích mãi mãi', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Rõ ràng, cụ thể cho từng mục đích sử dụng', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần thiết nếu doanh nghiệp nhỏ', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần đồng ý bằng miệng', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M4-I-CH3', 'Chương 3: Cân bằng số và sức khỏe nghề nghiệp', 3, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-I-CH3-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Giải thích được những cách thức để tránh những sự đe dọa liên quan đến việc sử dụng công nghệ số đối với sức khỏe thể chất và tinh thần</li><li>Lựa chọn được cách thức bảo vệ bản thân và người khác khỏi nguy cơ trong môi trường số</li><li>Thảo luận về những công nghệ số giúp tăng cường thịnh vượng xã hội và sự hòa hợp trong xã hội</li></ul><h2>Định nghĩa</h2><ul><li>An sinh số (Điều 2, TT 02/2025/TT-BGDĐT): trạng thái cân bằng giữa việc sử dụng công nghệ số và sức khỏe tinh thần, thể chất của người dùng trong việc sử dụng phương tiện kỹ thuật số</li><li>Bắt nạt trên mạng (Điều 2, TT 02/2025/TT-BGDĐT): những hành vi có chủ đích xấu được tiến hành bởi một người hoặc một nhóm người lên một cá nhân bằng cách đe dọa, xâm hại, làm nhục, làm ảnh hưởng, xúc phạm danh dự, nhân phẩm hoặc tra tấn tinh thần thông qua tin nhắn, mạng Internet, các trang mạng xã hội và qua các thiết bị điện tử</li><li>Làm việc theo khối thời gian (time blocking): kỹ thuật dành các khoảng thời gian cố định trong lịch cho từng loại công việc cụ thể, giảm việc chuyển đổi liên tục giữa các nhiệm vụ</li><li>Chi phí chuyển đổi ngữ cảnh: thời gian và năng lượng tinh thần bị mất khi chuyển đổi qua lại giữa các công việc khác nhau</li><li>Kiệt sức nghề nghiệp (burnout): trạng thái kiệt quệ về thể chất và tinh thần do căng thẳng công việc kéo dài</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-I-CH3-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Ở mức trung cấp, việc bảo vệ sức khỏe và an sinh số mở rộng sang quản lý thói quen làm việc bền vững. Quản lý thông báo hiệu quả bắt đầu từ việc phân loại: thông báo nào cần phản hồi ngay, thông báo nào có thể gộp lại kiểm tra theo khung giờ cố định.</p><p>Làm việc theo khối thời gian giúp tránh chi phí chuyển đổi ngữ cảnh — năng suất giảm mỗi lần bị gián đoạn. Dấu hiệu kiệt sức cần được nhận biết sớm: mệt mỏi kéo dài, mất hứng thú với công việc, dễ cáu gắt. Xây dựng quy ước nhóm rõ ràng về thời gian phản hồi kỳ vọng giúp giảm áp lực ngầm về việc phải phản hồi ngay lập tức ngoài giờ.</p><p>Đa nhiệm liên tục — cố gắng làm nhiều việc cùng lúc như vừa họp vừa trả lời email vừa nhắn tin — tạo cảm giác bận rộn nhưng thực chất làm giảm chất lượng và tốc độ hoàn thành công việc so với làm tuần tự từng việc, vì mỗi lần chuyển đổi đều phát sinh chi phí chuyển đổi ngữ cảnh nêu trên.</p><p>Ở mức này, việc thảo luận về công nghệ số giúp tăng cường thịnh vượng xã hội cần gắn với bối cảnh công việc cụ thể hơn — ví dụ đánh giá xem công cụ theo dõi khối lượng công việc nhóm có giúp phát hiện sớm dấu hiệu quá tải của đồng nghiệp không, hoặc kênh giao tiếp nội bộ có tạo không gian để nhân viên chia sẻ khó khăn và nhận hỗ trợ kịp thời không. Việc chọn lựa công cụ số có chủ đích cho mục đích này khác với việc chỉ dùng công nghệ theo thói quen.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-I-CH3-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Theo dõi thói quen số trong 3 ngày làm việc (ghi lại: số lần bị ngắt quãng bởi thông báo, thời gian phản hồi công việc ngoài giờ nếu có), phân tích và đề xuất quy ước cho nhóm.</p><p>Sản phẩm nộp: Nhật ký theo dõi 3 ngày, phân tích, dự thảo quy ước nhóm.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-I-CH3-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M4-I-CH3-QUIZ', 1, 'Quiz chương 3: Cân bằng số và sức khỏe nghề nghiệp', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Chi phí chuyển đổi ngữ cảnh là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chi phí mua phần mềm mới', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Thời gian và năng lượng mất khi chuyển đổi qua lại giữa các công việc khác nhau', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chi phí đào tạo nhân viên', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có khái niệm này', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Làm việc theo khối thời gian có lợi ích gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có lợi ích cụ thể', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Giảm chi phí chuyển đổi ngữ cảnh, tăng khả năng tập trung sâu', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ phù hợp với công việc đơn giản', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Làm chậm tiến độ công việc', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Dấu hiệu nào có thể cho thấy một người đang kiệt sức nghề nghiệp?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Năng suất làm việc tăng đều', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Mệt mỏi kéo dài không hồi phục, mất hứng thú với công việc', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Luôn vui vẻ và năng động', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có dấu hiệu cụ thể nào', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao nên xây dựng quy ước nhóm về thời gian phản hồi?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần thiết', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Giảm áp lực ngầm về kỳ vọng phản hồi tức thời ngoài giờ', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để có văn bản chính thức', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Làm chậm công việc nhóm', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Đa nhiệm liên tục (làm nhiều việc cùng lúc) thường dẫn đến điều gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tăng chất lượng công việc', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Giảm chất lượng và tốc độ hoàn thành so với làm tuần tự', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không ảnh hưởng gì đến hiệu suất', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Luôn hiệu quả hơn làm từng việc', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M4-I-CH4', 'Chương 4: Vận hành số bền vững', 4, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-I-CH4-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Thảo luận về các cách thức bảo vệ môi trường khỏi tác động của công nghệ số và việc sử dụng công nghệ số</li></ul><h2>Định nghĩa</h2><ul><li>Kiểm kê tác động số: quá trình liệt kê và đánh giá mức độ tiêu thụ tài nguyên số (lưu trữ, thiết bị, in ấn) của một bộ phận hoặc tổ chức</li><li>Dữ liệu quá hạn: dữ liệu không còn cần thiết cho mục đích ban đầu nhưng vẫn được lưu trữ, gây lãng phí tài nguyên</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-I-CH4-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Ở mức trung cấp, việc bảo vệ môi trường khỏi tác động công nghệ số mở rộng sang vận hành số bền vững ở cấp bộ phận. Kiểm kê tác động số của bộ phận là bước đầu để tối ưu: xác định dung lượng lưu trữ, số lượng thiết bị, khối lượng in ấn.</p><p>Tối ưu lưu trữ bao gồm loại bỏ dữ liệu trùng lặp, các bản sao không cần thiết, và dữ liệu quá hạn. Xây dựng quy trình ít giấy đòi hỏi ưu tiên ký số thay vì in ra ký tay. Khi mua sắm thiết bị mới, tiêu chí bền vững có thể bao gồm độ bền, khả năng nâng cấp, và chính sách thu hồi tái chế của nhà sản xuất.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-I-CH4-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Kiểm kê tài nguyên số của bộ phận (dung lượng lưu trữ, tài liệu trùng lặp, lượng in ấn trong một tháng), đề xuất kế hoạch tối ưu và ước tính tác động.</p><p>Sản phẩm nộp: Báo cáo kiểm kê và kế hoạch tối ưu.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-I-CH4-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M4-I-CH4-QUIZ', 1, 'Quiz chương 4: Vận hành số bền vững', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Bước đầu tiên để tối ưu tài nguyên số của một bộ phận là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Mua thiết bị mới ngay', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Kiểm kê hiện trạng để có cơ sở đặt mục tiêu cụ thể', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Xóa toàn bộ dữ liệu cũ ngay lập tức', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần bước chuẩn bị nào', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Dữ liệu quá hạn là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Dữ liệu mới được tạo', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Dữ liệu không còn cần thiết cho mục đích ban đầu nhưng vẫn được lưu trữ', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Dữ liệu đang được sử dụng tích cực', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Dữ liệu đã được sao lưu', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Tiêu chí bền vững khi mua sắm thiết bị mới có thể bao gồm gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ quan tâm giá rẻ nhất', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Độ bền, khả năng nâng cấp, hiệu suất năng lượng, chính sách tái chế', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ quan tâm thương hiệu nổi tiếng', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có tiêu chí đặc biệt nào', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao nên ưu tiên ký số thay vì in ra ký tay khi có thể?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có lý do cụ thể', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Giảm nhu cầu in ấn, góp phần vận hành ít giấy hơn', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Ký số luôn có giá trị pháp lý cao hơn', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để tiết kiệm thời gian', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Truyền thông nội bộ về thực hành bền vững có tác dụng gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có tác dụng thực tế', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Duy trì động lực thay đổi thói quen lâu dài', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để báo cáo hình thức', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Làm chậm công việc của bộ phận', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M4-I-FINAL', 'Đánh giá cuối khóa', 5, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-I-FINAL-A', 'Bài đánh giá cuối khóa', 'ASSIGNMENT', '<p>Xây dựng bộ thực hành an toàn và bền vững cho bộ phận: danh mục kiểm tra bảo mật, quy trình xử lý dữ liệu cá nhân, quy ước làm việc, kế hoạch tối ưu tài nguyên.</p><p>Tiêu chí chấm:</p><p>Điểm đạt: ≥70/100.</p>', 60, 1, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M4-I-FINAL', 1, 'Đánh giá cuối khóa — AN TOÀN THÔNG TIN TRONG CÔNG VIỆC', 'FINAL', true, 70, 1, 'PUBLISHED', v_admin_id, now(), now());
    END IF;
    RAISE NOTICE 'Done: M4-I';
    -- === M4-A ===
    SELECT id INTO v_course_id FROM courses WHERE code = 'M4-A' AND organization_id = v_org_id;
    IF v_course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM course_modules WHERE course_id = v_course_id) THEN
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M4-A-CH1', 'Chương 1: Quản trị an toàn thông tin doanh nghiệp', 1, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-A-CH1-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Chọn lựa được cách bảo vệ phù hợp nhất cho thiết bị và nội dung số</li><li>Phân biệt được rủi ro và mối đe dọa trong môi trường số</li><li>Chọn lựa được các biện pháp an toàn và bảo mật phù hợp nhất</li><li>Đánh giá được các biện pháp để quan tâm đến mức độ tin cậy và quyền riêng tư một cách phù hợp nhất</li></ul><h2>Định nghĩa</h2><ul><li>Thiết bị số (Điều 2, TT 02/2025/TT-BGDĐT): thiết bị điện tử, máy tính, viễn thông, truyền dẫn, thu phát sóng vô tuyến điện và thiết bị tích hợp khác được sử dụng để sản xuất, truyền đưa, thu thập, xử lý, lưu trữ và trao đổi thông tin số</li><li>Đánh giá rủi ro an toàn thông tin: quá trình xác định các mối đe dọa, khả năng xảy ra và mức độ tác động lên hệ thống thông tin của tổ chức</li><li>Kế hoạch khôi phục hoạt động: kế hoạch xác định cách tổ chức tiếp tục hoạt động và khôi phục hệ thống sau một sự cố nghiêm trọng</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-A-CH1-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Ở mức nâng cao, việc chọn lựa cách bảo vệ phù hợp nhất cho thiết bị và nội dung số mở rộng thành quản trị an toàn thông tin cấp doanh nghiệp — đánh giá rủi ro cần xem xét toàn diện: hệ thống nào quan trọng nhất, mối đe dọa nào có khả năng xảy ra cao.</p><p>Sổ rủi ro tổng hợp các rủi ro đã xác định, với bốn lựa chọn xử lý: tránh, giảm, chuyển, chấp nhận. Chính sách an toàn thông tin cấp tổ chức cần nêu rõ phạm vi, vai trò trách nhiệm, và chế tài khi vi phạm. Rủi ro từ nhà cung cấp và bên thứ ba cần được đánh giá riêng vì an toàn thông tin của tổ chức phụ thuộc một phần vào an toàn của các bên liên quan.</p><p>Phần lớn sự cố bảo mật trong thực tế bắt nguồn từ lỗi con người — bấm nhầm liên kết lừa đảo, dùng mật khẩu yếu, cấu hình sai quyền truy cập — nhiều hơn là từ tấn công kỹ thuật tinh vi. Đây là lý do chương trình đào tạo nhận thức an toàn định kỳ cho toàn thể nhân viên là một biện pháp phòng ngừa quan trọng ngang với đầu tư công nghệ.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-A-CH1-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Xây bộ hồ sơ quản trị an toàn cho doanh nghiệp: sổ rủi ro tối thiểu 8 mục có chấm điểm (dùng bảng mẫu dưới), ma trận phân quyền, quy trình ứng phó sự cố.</p><p>Bảng mẫu sổ rủi ro (điền theo tình huống thật của doanh nghiệp):</p><p>Sản phẩm nộp: Sổ rủi ro, ma trận phân quyền, quy trình ứng phó, kế hoạch đào tạo.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-A-CH1-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M4-A-CH1-QUIZ', 1, 'Quiz chương 1: Quản trị an toàn thông tin doanh nghiệp', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Bốn lựa chọn xử lý rủi ro trong quản trị an toàn thông tin là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tránh, giảm, chuyển, chấp nhận', true, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Xóa, sửa, thêm, giữ nguyên', false, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Cao, trung bình, thấp, không có', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Nhanh, chậm, tức thời, định kỳ', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Điểm hở bảo mật phổ biến nhất trong thực tế thường liên quan đến điều gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Lỗi phần cứng', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Quyền truy cập không được thu hồi khi nhân sự rời đi', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Lỗi mạng', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Thiết bị quá mới', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao cần đánh giá rủi ro từ nhà cung cấp và bên thứ ba?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần thiết', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'An toàn thông tin của tổ chức phụ thuộc một phần vào an toàn của các bên liên quan', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần quan tâm hệ thống nội bộ', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Nhà cung cấp luôn an toàn tuyệt đối', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Phần lớn sự cố bảo mật bắt nguồn từ đâu?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ từ lỗi kỹ thuật thuần túy', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Lỗi con người, như bấm nhầm liên kết hoặc dùng mật khẩu yếu', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Luôn từ tấn công có chủ đích tinh vi', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có nguyên nhân cụ thể', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', '“Chấp nhận rủi ro” trong quản trị an toàn thông tin nghĩa là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Bỏ qua rủi ro mà không xem xét', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Quyết định có chủ đích không hành động khi chi phí phòng ngừa vượt lợi ích, được ghi nhận rõ ràng', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Luôn là lựa chọn sai', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không áp dụng được trong thực tế', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M4-A-CH2', 'Chương 2: Tuân thủ bảo vệ dữ liệu cá nhân', 2, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-A-CH2-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Chọn lựa cách thức phù hợp nhất để bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số</li><li>Đánh giá cách thức phù hợp nhất để sử dụng và chia sẻ thông tin định danh cá nhân</li><li>Đánh giá mức độ phù hợp của các tuyên bố trong chính sách quyền riêng tư về cách sử dụng dữ liệu cá nhân</li></ul><h2>Định nghĩa</h2><ul><li>Bản đồ luồng dữ liệu: tài liệu mô tả dữ liệu cá nhân được thu thập ở đâu, lưu trữ ở đâu, ai truy cập, và được chuyển giao cho ai</li><li>Đánh giá tác động xử lý dữ liệu cá nhân: quá trình phân tích rủi ro khi xử lý dữ liệu cá nhân quy mô lớn hoặc dữ liệu nhạy cảm, nhằm giảm thiểu rủi ro trước khi triển khai</li><li>Bên xử lý dữ liệu: tổ chức hoặc cá nhân xử lý dữ liệu cá nhân thay mặt cho bên kiểm soát dữ liệu theo hợp đồng hoặc thỏa thuận</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-A-CH2-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Ở mức nâng cao, việc bảo vệ dữ liệu cá nhân mở rộng thành chương trình tuân thủ cấp tổ chức, căn cứ theo cả Nghị định 13/2023/NĐ-CP (có hiệu lực từ 1/7/2023) và Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 (hiệu lực từ 1/1/2026). Lập bản đồ luồng dữ liệu cá nhân là bước nền tảng: xác định dữ liệu thu thập ở đâu, lưu trữ ở đâu, ai có quyền truy cập, có chuyển giao cho bên thứ ba nào không.</p><p>Đánh giá tác động xử lý dữ liệu cá nhân nên được thực hiện khi triển khai xử lý dữ liệu quy mô lớn hoặc dữ liệu nhạy cảm. Quy trình tiếp nhận và xử lý yêu cầu của chủ thể dữ liệu cần có kênh tiếp nhận rõ ràng và thời hạn xử lý xác định, cùng nghĩa vụ thông báo sự cố trong 72 giờ theo quy định.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-A-CH2-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Lập bản đồ luồng dữ liệu cá nhân cho một quy trình nghiệp vụ thật của doanh nghiệp (ví dụ: quy trình từ khách hàng đăng ký đến hoàn tất đơn hàng), xác định các điểm rủi ro tuân thủ và đề xuất biện pháp khắc phục.</p><p>Sản phẩm nộp: Bản đồ luồng dữ liệu, đánh giá tuân thủ, kế hoạch khắc phục.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-A-CH2-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M4-A-CH2-QUIZ', 1, 'Quiz chương 2: Tuân thủ bảo vệ dữ liệu cá nhân', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Nghị định 13/2023/NĐ-CP có hiệu lực từ khi nào?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, '1/1/2023', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, '1/7/2023', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, '1/1/2024', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, '1/7/2024', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Bản đồ luồng dữ liệu cần thể hiện những thông tin gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần biết dữ liệu tồn tại', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Dữ liệu thu thập ở đâu, lưu ở đâu, ai truy cập, chuyển giao cho ai', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần biết số lượng bản ghi', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần biết định dạng tệp', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khi nào nên thực hiện đánh giá tác động xử lý dữ liệu cá nhân?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không bao giờ cần thiết', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Khi triển khai xử lý dữ liệu quy mô lớn hoặc dữ liệu nhạy cảm', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ khi có sự cố xảy ra', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ áp dụng cho doanh nghiệp nước ngoài', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao cần có hợp đồng rõ ràng với bên xử lý dữ liệu bên ngoài?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần thiết nếu tin tưởng đối tác', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Quy định rõ trách nhiệm bảo vệ dữ liệu, không chỉ dựa vào lòng tin', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để tăng chi phí hợp đồng', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần thỏa thuận miệng', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Chuyển dữ liệu cá nhân ra nước ngoài (ví dụ lưu trên máy chủ đám mây quốc tế) cần lưu ý điều gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần lưu ý gì đặc biệt', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Có yêu cầu riêng theo quy định hiện hành tại Việt Nam, nên tham vấn pháp lý cụ thể', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Luôn bị cấm hoàn toàn', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ áp dụng cho dữ liệu công khai', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M4-A-CH3', 'Chương 3: Chính sách phúc lợi số của tổ chức', 3, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-A-CH3-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Phân biệt được cách thức phù hợp nhất để tránh rủi ro và đe dọa đến sức khỏe thể chất và tinh thần khi sử dụng công nghệ số</li><li>Vận dụng được cách thức phù hợp nhất để bảo vệ bản thân và người khác khỏi nguy cơ trong môi trường số</li><li>Linh hoạt trong cách sử dụng những công nghệ số giúp tăng cường thịnh vượng xã hội và sự hòa hợp trong xã hội</li></ul><h2>Định nghĩa</h2><ul><li>An sinh số (Điều 2, TT 02/2025/TT-BGDĐT): trạng thái cân bằng giữa việc sử dụng công nghệ số và sức khỏe tinh thần, thể chất của người dùng trong việc sử dụng phương tiện kỹ thuật số</li><li>Bắt nạt trên mạng (Điều 2, TT 02/2025/TT-BGDĐT): những hành vi có chủ đích xấu được tiến hành bởi một người hoặc một nhóm người lên một cá nhân bằng cách đe dọa, xâm hại, làm nhục, làm ảnh hưởng, xúc phạm danh dự, nhân phẩm hoặc tra tấn tinh thần thông qua tin nhắn, mạng Internet, các trang mạng xã hội và qua các thiết bị điện tử</li><li>Quyền ngắt kết nối: khái niệm về quyền của nhân viên được không phải phản hồi công việc ngoài giờ làm việc đã thỏa thuận</li><li>Khả năng tiếp cận (accessibility): mức độ công cụ và tài liệu số có thể được sử dụng bởi người có những khả năng khác nhau, bao gồm người khuyết tật</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-A-CH3-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Ở mức nâng cao, việc bảo vệ sức khỏe và an sinh số mở rộng thành chính sách an sinh số cấp tổ chức. Khảo sát trải nghiệm làm việc số của nhân viên định kỳ giúp tổ chức nắm bắt vấn đề trước khi trở nên nghiêm trọng.</p><p>Nguyên nhân quá tải có tính hệ thống thường không nằm ở cá nhân mà ở cách tổ chức vận hành: quá nhiều kênh giao tiếp, quá nhiều cuộc họp. Chính sách về thời gian phản hồi và quyền ngắt kết nối nên được văn bản hóa chính thức. Khả năng tiếp cận trong công cụ và tài liệu số đảm bảo mọi nhân viên, bao gồm người khuyết tật, đều có thể tham gia công việc số một cách bình đẳng.</p><p>Chính sách chỉ có tác dụng thực tế khi cấp quản lý làm gương — nếu quản lý vẫn nhắn tin công việc ngoài giờ hoặc trả lời email lúc nửa đêm, chính sách “tôn trọng ranh giới thời gian” trên văn bản sẽ mất hiệu lực, vì nhân viên quan sát và học theo hành vi thực tế của cấp trên nhiều hơn là đọc quy định trên giấy.</p><p>Ở mức lãnh đạo, việc linh hoạt sử dụng công nghệ số để tăng cường thịnh vượng xã hội đòi hỏi chủ động tích hợp các công cụ hỗ trợ sức khỏe tinh thần vào chính sách nhân sự — ví dụ cung cấp quyền truy cập ứng dụng chăm sóc sức khỏe tinh thần cho nhân viên, xây kênh nội bộ ẩn danh để nhân viên chia sẻ khó khăn, hoặc tổ chức các hoạt động kết nối trực tuyến cho đội ngũ làm việc từ xa. Đây là phần bổ sung cho các chính sách phòng ngừa rủi ro đã nêu ở trên, thể hiện vai trò chủ động thay vì chỉ đối phó khi có vấn đề phát sinh.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-A-CH3-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Khảo sát trải nghiệm làm việc số trong doanh nghiệp (thiết kế bộ câu hỏi ngắn 8–10 câu về quá tải thông tin, chất lượng họp, ranh giới thời gian), phân tích kết quả và soạn dự thảo chính sách phúc lợi số.</p><p>Sản phẩm nộp: Kết quả khảo sát, phân tích, dự thảo chính sách.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-A-CH3-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M4-A-CH3-QUIZ', 1, 'Quiz chương 3: Chính sách phúc lợi số của tổ chức', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Nguyên nhân quá tải có tính hệ thống thường xuất phát từ đâu?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ từ năng lực cá nhân của từng nhân viên', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Cách tổ chức vận hành: quá nhiều kênh, quá nhiều họp, kỳ vọng phản hồi tức thời', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có nguyên nhân hệ thống nào', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ do thiết bị lỗi thời', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao chính sách về quyền ngắt kết nối nên được văn bản hóa chính thức?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần thiết, thỏa thuận ngầm là đủ', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Giúp nhân viên có căn cứ rõ ràng để bảo vệ thời gian nghỉ ngơi', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để tuân thủ hình thức', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có tác dụng thực tế', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khả năng tiếp cận (accessibility) trong công cụ số liên quan đến điều gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ liên quan đến tốc độ tải trang', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Mức độ công cụ có thể được sử dụng bởi người có khả năng khác nhau, bao gồm người khuyết tật', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ liên quan đến giao diện đẹp', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không quan trọng trong môi trường doanh nghiệp', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vai trò làm gương của cấp quản lý ảnh hưởng thế nào đến chính sách phúc lợi số?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không ảnh hưởng gì', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Quyết định hiệu quả thực tế của chính sách — hành vi thực tế quan trọng hơn văn bản', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ ảnh hưởng đến nhân viên mới', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không liên quan đến phúc lợi số', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Cuộc họp nào nên được cân nhắc thay bằng email hoặc kênh khác?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Cuộc họp cần thảo luận, trao đổi ý kiến qua lại', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Cuộc họp chỉ nhằm thông báo một chiều không cần trao đổi', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Cuộc họp ra quyết định quan trọng', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Cuộc họp giải quyết xung đột', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M4-A-CH4', 'Chương 4: Chiến lược bền vững số', 4, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-A-CH4-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Chọn lựa được giải pháp phù hợp nhất để bảo vệ môi trường khỏi tác động của công nghệ số và việc sử dụng công nghệ</li></ul><h2>Định nghĩa</h2><ul><li>Chỉ tiêu bền vững: thước đo cụ thể, đo lường được, dùng để theo dõi tiến độ hướng tới mục tiêu bền vững đã đặt ra</li><li>Vòng đời thiết bị (từ góc độ chính sách): chu trình mua, sử dụng, sửa chữa, và thanh lý thiết bị được quản lý có chủ đích ở cấp tổ chức</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-A-CH4-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Ở mức nâng cao, việc chọn giải pháp phù hợp nhất để bảo vệ môi trường mở rộng thành chiến lược bền vững số cấp toàn doanh nghiệp. Kiểm kê tác động số toàn doanh nghiệp bao gồm tổng dung lượng lưu trữ, tuổi thọ trung bình thiết bị, mức tiêu thụ năng lượng hạ tầng công nghệ thông tin.</p><p>Chỉ tiêu bền vững cần cụ thể và đo lường được, ví dụ “giảm 20% khối lượng in ấn trong năm tới”. Tiêu chí bền vững trong mua sắm nên được đưa vào chính thức trong quy trình lựa chọn nhà cung cấp. Báo cáo kết quả bền vững cần dựa trên số liệu thực tế đã đo lường, tránh công bố phóng đại.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-A-CH4-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Xây chiến lược bền vững số cho doanh nghiệp: kiểm kê hiện trạng, ba mục tiêu có chỉ tiêu đo được, kế hoạch triển khai, và khung báo cáo.</p><p>Sản phẩm nộp: Chiến lược bền vững số, bộ chỉ tiêu, khung báo cáo.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-A-CH4-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M4-A-CH4-QUIZ', 1, 'Quiz chương 4: Chiến lược bền vững số', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Chỉ tiêu bền vững tốt cần có đặc điểm gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chung chung, dễ đạt được', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Cụ thể và đo lường được', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần đo lường', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần có ý định tốt', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Xác định điểm can thiệp có tác động lớn nhất giúp ích gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có lợi ích cụ thể', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tập trung nguồn lực vào nơi mang lại hiệu quả cao nhất', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để báo cáo đẹp hơn', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Làm phức tạp thêm quy trình', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao không nên công bố kết quả bền vững phóng đại?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có vấn đề gì nếu không ai phát hiện', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Là rủi ro uy tín nếu bị phát hiện không đúng thực tế, ngoài vấn đề đạo đức', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không liên quan đến uy tín doanh nghiệp', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Luôn được chấp nhận trong marketing', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Chính sách vòng đời thiết bị ở cấp tổ chức nên ưu tiên điều gì trước khi thay mới?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Thay mới ngay khi có phiên bản mới hơn', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Ưu tiên sửa chữa trước khi thay mới', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần chính sách cụ thể', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Thay mới toàn bộ đồng loạt mỗi năm', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Tiêu chí bền vững khi chọn nhà cung cấp dịch vụ đám mây có thể bao gồm gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ quan tâm giá rẻ nhất', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Cam kết năng lượng tái tạo và hiệu suất năng lượng của trung tâm dữ liệu', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có tiêu chí liên quan đến bền vững', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ quan tâm tốc độ truy cập', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M4-A-FINAL', 'Đánh giá cuối khóa', 5, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M4-A-FINAL-A', 'Bài đánh giá cuối khóa', 'ASSIGNMENT', '<p>Xây dựng bộ khung quản trị an toàn và trách nhiệm số cho doanh nghiệp: hồ sơ rủi ro và phân quyền, chương trình tuân thủ dữ liệu cá nhân, chính sách phúc lợi số, chiến lược bền vững.</p><p>Tiêu chí chấm:</p><p>Điểm đạt: ≥70/100, không tiêu chí nào dưới 50%.</p><p>Lưu ý quan trọng gửi người triển khai: Toàn bộ nội dung liên quan đến Nghị định 13/2023/NĐ-CP và Luật Bảo vệ dữ liệu cá nhân trong khóa M4-I (Module 2) và M4-A (Module 2) đã được đối chiếu với thông tin tra cứu tại thời điểm biên soạn. Tuy nhiên, đây là lĩnh vực pháp lý có thể thay đổi (Luật Bảo vệ dữ liệu cá nhân dự kiến hiệu lực 1/1/2026), và nội dung này cần được bộ phận pháp lý hoặc chuyên gia tư vấn rà soát trước khi đưa vào giảng dạy chính thức, đặc biệt các nội dung liên quan đến chuyển dữ liệu ra nước ngoài, báo cáo đánh giá tác động, và các nghĩa vụ thông báo sự cố cụ thể — đây là những điểm dễ thay đổi hoặc cần diễn giải chuyên sâu hơn phạm vi một khóa đào tạo kỹ năng số phổ thông.</p>', 60, 1, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M4-A-FINAL', 1, 'Đánh giá cuối khóa — QUẢN TRỊ AN TOÀN VÀ TRÁCH NHIỆM SỐ', 'FINAL', true, 70, 1, 'PUBLISHED', v_admin_id, now(), now());
    END IF;
    RAISE NOTICE 'Done: M4-A';
    -- === M5-F ===
    SELECT id INTO v_course_id FROM courses WHERE code = 'M5-F' AND organization_id = v_org_id;
    IF v_course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM course_modules WHERE course_id = v_course_id) THEN
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M5-F-CH1', 'Chương 1: Xử lý sự cố thường gặp', 1, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-F-CH1-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Xác định được các vấn đề kỹ thuật đơn giản khi vận hành thiết bị và sử dụng môi trường số</li><li>Xác định được các giải pháp đơn giản để giải quyết chúng</li></ul><h2>Định nghĩa</h2><ul><li>Sự cố kỹ thuật: tình huống một thiết bị hoặc phần mềm không hoạt động như mong đợi</li><li>Thông báo lỗi: dòng chữ hệ thống hiển thị khi có sự cố, thường gợi ý nguyên nhân hoặc mã lỗi cụ thể</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-F-CH1-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Giải quyết các vấn đề kỹ thuật nghĩa là xác định được các vấn đề kỹ thuật đơn giản khi vận hành thiết bị số và sử dụng môi trường số. Mô tả sự cố chính xác là bước đầu tiên: đang làm gì khi sự cố xảy ra, điều gì đã xảy ra khác với mong đợi, có thông báo lỗi cụ thể nào không.</p><p>Các bước xử lý cơ bản theo thứ tự nên thử: khởi động lại ứng dụng hoặc thiết bị, kiểm tra kết nối mạng, kiểm tra bản cập nhật. Khi đã thử các bước cơ bản mà không giải quyết được, nên dừng tự xử lý và báo bộ phận kỹ thuật, cung cấp đầy đủ mô tả sự cố và các bước đã thử.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-F-CH1-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Với 5 tình huống sự cố mô phỏng dưới đây, viết mô tả sự cố đúng chuẩn và liệt kê các bước sẽ thử theo thứ tự.</p><p>5 tình huống mẫu:</p><p>- Máy in không in được, đèn báo nhấp nháy màu vàng - Không mở được một file PDF, hiện thông báo “file bị hỏng” - Không kết nối được wifi công ty dù các thiết bị khác vẫn kết nối bình thường - Trình duyệt web chạy rất chậm khi mở nhiều tab - Không đăng nhập được vào hệ thống email công ty, báo sai mật khẩu dù chắc chắn gõ đúng Sản phẩm nộp: Bảng 5 sự cố kèm mô tả chuẩn và các bước xử lý theo thứ tự.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-F-CH1-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M5-F-CH1-QUIZ', 1, 'Quiz chương 1: Xử lý sự cố thường gặp', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Một mô tả sự cố tốt cần trả lời những câu hỏi nào?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần nói “bị lỗi” là đủ', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Đang làm gì, điều gì xảy ra khác mong đợi, có thông báo lỗi cụ thể không', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần biết tên thiết bị', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần mô tả gì, chỉ cần gọi hỗ trợ', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Bước xử lý cơ bản nào thường giải quyết được nhiều sự cố đơn giản nhất?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Mua thiết bị mới', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Khởi động lại ứng dụng hoặc thiết bị', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Gọi ngay bộ phận kỹ thuật', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không làm gì và chờ tự hết', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khi gặp thông báo lỗi cụ thể, cách hiệu quả để tìm giải pháp là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Bỏ qua thông báo lỗi', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tra cứu nguyên văn thông báo lỗi đó', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Khởi động lại máy nhiều lần', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có cách nào hiệu quả', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khi báo cáo sự cố cho bộ phận kỹ thuật, thông tin nào nên cung cấp?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần nói “máy bị lỗi”', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Mô tả sự cố, các bước đã thử, thông báo lỗi cụ thể nếu có', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần cung cấp thông tin gì', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần tên người dùng', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao nên ghi lại cách đã xử lý thành công một sự cố?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần thiết', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Để lần sau gặp lại có thể tự xử lý nhanh hơn', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để báo cáo hình thức', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có tác dụng thực tế', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M5-F-CH2', 'Chương 2: Chọn công cụ phù hợp với công việc', 2, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-F-CH2-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Xác định được nhu cầu cá nhân</li><li>Nhận ra được các công cụ số đơn giản và các giải pháp công nghệ có thể có để giải quyết những nhu cầu đó</li><li>Chọn được những cách đơn giản để điều chỉnh và tùy chỉnh môi trường số theo nhu cầu cá nhân</li></ul><h2>Định nghĩa</h2><ul><li>Giải pháp công nghệ (Điều 2, TT 02/2025/TT-BGDĐT): tập hợp các công cụ kỹ thuật có liên quan (phần mềm, phần cứng) hoặc dịch vụ hoặc kết hợp để giải quyết vấn đề đặt ra</li><li>Nhu cầu công việc: mô tả cụ thể về việc cần làm, kết quả mong muốn, và ai sẽ sử dụng kết quả đó</li><li>Công cụ có sẵn của doanh nghiệp: phần mềm hoặc dịch vụ đã được doanh nghiệp cấp phép và phê duyệt sử dụng</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-F-CH2-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Xác định nhu cầu và giải pháp công nghệ ở mức cơ bản nghĩa là xác định được nhu cầu cá nhân và nhận ra các công cụ số đơn giản có thể giải quyết nhu cầu đó. Trước khi chọn công cụ, cần xác định rõ: cần làm gì cụ thể, kết quả sẽ được dùng bởi ai.</p><p>Nên ưu tiên dùng công cụ có sẵn của doanh nghiệp trước khi tìm công cụ mới. Dấu hiệu công cụ không còn phù hợp bao gồm phải thực hiện nhiều thao tác thủ công để bù đắp, hoặc thường xuyên xảy ra sai sót. Trước khi đưa dữ liệu công việc lên bất kỳ công cụ mới nào, nên hỏi ý kiến người phụ trách hoặc bộ phận IT.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-F-CH2-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Liệt kê 5 công việc thường làm trong tuần, xác định công cụ đang dùng cho mỗi việc và đánh giá mức độ phù hợp.</p><p>Bảng mẫu:</p><p>Sản phẩm nộp: Bảng công việc – công cụ – đánh giá phù hợp (5 dòng).</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-F-CH2-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M5-F-CH2-QUIZ', 1, 'Quiz chương 2: Chọn công cụ phù hợp với công việc', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Bước đầu tiên trước khi chọn công cụ cho một công việc là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chọn công cụ phổ biến nhất', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Xác định rõ nhu cầu: cần làm gì, kết quả dùng bởi ai', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Hỏi đồng nghiệp dùng gì', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần bước chuẩn bị nào', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao nên ưu tiên công cụ có sẵn của doanh nghiệp?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có lý do đặc biệt', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Đã được phê duyệt về bảo mật, dễ hợp tác với đồng nghiệp', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Luôn miễn phí', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần lý do gì', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Dấu hiệu nào cho thấy công cụ đang dùng không còn phù hợp?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Công việc hoàn thành nhanh chóng, chính xác', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Phải thực hiện nhiều thao tác thủ công lặp lại để bù đắp thiếu sót của công cụ', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có vấn đề gì', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Đồng nghiệp cũng dùng công cụ đó', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Trước khi đưa dữ liệu công việc lên một công cụ mới chưa được phê duyệt, nên làm gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Cứ dùng thử trước, hỏi sau', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Hỏi ý kiến người phụ trách hoặc bộ phận IT trước', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần hỏi ai', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần thông báo sau khi đã dùng', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Rủi ro của việc tự ý cài công cụ ngoài không qua phê duyệt là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có rủi ro gì', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Có thể vi phạm chính sách bảo mật, đưa dữ liệu ra ngoài kiểm soát', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ tốn thêm dung lượng', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ ảnh hưởng đến tốc độ máy', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M5-F-CH3', 'Chương 3: Cải tiến công việc bằng công cụ số', 3, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-F-CH3-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Xác định được các công cụ và công nghệ số đơn giản có thể được sử dụng để tạo ra kiến thức và đổi mới quy trình cũng như sản phẩm</li><li>Tuân theo quy trình nhận thức đơn giản của cá nhân và tập thể để hiểu và giải quyết các vấn đề khái niệm đơn giản và tình huống có vấn đề trong môi trường số</li></ul><h2>Định nghĩa</h2><ul><li>Điểm mất thời gian: công đoạn trong quy trình làm việc tốn nhiều thời gian hơn mức cần thiết so với cách làm khác hiệu quả hơn</li><li>Phím tắt: tổ hợp phím giúp thực hiện một thao tác nhanh hơn so với dùng chuột</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-F-CH3-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Sử dụng sáng tạo công nghệ số ở mức cơ bản nghĩa là xác định được các công cụ và công nghệ số đơn giản có thể dùng để tạo ra kiến thức và đổi mới quy trình. Nhận diện điểm mất thời gian trong công việc hàng ngày là bước đầu tiên.</p><p>Nhiều tính năng ít được để ý nhưng tiết kiệm đáng kể thời gian: phím tắt, mẫu tài liệu có sẵn, tìm kiếm nâng cao. Nguyên tắc “làm một lần rồi dùng lại” áp dụng cho nhiều tình huống. Khi đề xuất cải tiến với cấp trên, nên trình bày cụ thể với số liệu ước tính.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-F-CH3-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Chọn một công việc lặp lại hàng tuần, đo thời gian hiện tại đang mất, áp dụng một cải tiến (phím tắt, mẫu có sẵn, tính năng lọc/sắp xếp…) và đo lại thời gian sau khi cải tiến.</p><p>Sản phẩm nộp: Mô tả cải tiến và số liệu thời gian trước/sau (ví dụ: “Trước: 25 phút/tuần để tổng hợp báo cáo bằng cách chép tay từng dòng. Sau khi dùng tính năng lọc và công thức tổng trong Excel: 5 phút/tuần”).</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-F-CH3-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M5-F-CH3-QUIZ', 1, 'Quiz chương 3: Cải tiến công việc bằng công cụ số', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Phím tắt Ctrl+F thường dùng để làm gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Lưu tài liệu', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tìm kiếm nhanh trong tài liệu', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'In tài liệu', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Đóng tài liệu', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Nguyên tắc “làm một lần rồi dùng lại” áp dụng cho tình huống nào?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ áp dụng cho công việc làm một lần duy nhất', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tạo mẫu tài liệu hoặc danh mục kiểm tra dùng lại cho công việc hay lặp lại', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không áp dụng được trong thực tế', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ áp dụng cho công việc phức tạp', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khi đề xuất cải tiến với cấp trên, điều gì giúp đề xuất dễ được chấp thuận hơn?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Trình bày chung chung không cần số liệu', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Có số liệu cụ thể về lợi ích ước tính (ví dụ thời gian tiết kiệm)', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần giải thích gì', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần nói “cách này tốt hơn”', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao nên ghi lại cách làm hiệu quả đã tìm ra?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần thiết', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Để bản thân dùng lại và có thể chia sẻ cho đồng nghiệp', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để báo cáo hình thức', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có tác dụng thực tế', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Điểm mất thời gian trong công việc thường được nhận diện qua đâu?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không thể nhận diện được', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Công việc lặp lại thường xuyên, tốn công khó chịu, hay gây sai sót', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ qua báo cáo của cấp trên', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ qua phần mềm đo lường chuyên dụng', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M5-F-CH4', 'Chương 4: Nhận biết và bù đắp khoảng trống năng lực', 4, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-F-CH4-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Nhận ra được năng lực số của bản thân cần được cải thiện hoặc cập nhật ở đâu</li><li>Xác định được nơi để tìm kiếm cơ hội phát triển bản thân và cập nhật sự phát triển số</li></ul><h2>Định nghĩa</h2><ul><li>Năng lực số (Điều 2, TT 02/2025/TT-BGDĐT): khả năng sử dụng công nghệ số để hoàn thành nhiệm vụ cụ thể hoặc để giải quyết vấn đề trong thực tiễn</li><li>Khoảng trống năng lực: sự chênh lệch giữa năng lực hiện tại của một người và năng lực yêu cầu cho vị trí công việc</li><li>Kế hoạch học tập cá nhân: lộ trình cụ thể xác định kỹ năng cần học, nguồn học, và thời gian hoàn thành</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-F-CH4-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Xác định các vấn đề cần cải thiện về năng lực số ở mức cơ bản nghĩa là nhận ra được năng lực số của bản thân cần được cải thiện hoặc cập nhật ở đâu. Năng lực số là khả năng sử dụng công nghệ số để hoàn thành nhiệm vụ cụ thể hoặc giải quyết vấn đề trong thực tiễn.</p><p>Tự đánh giá theo khung năng lực chính thức giúp có cái nhìn khách quan hơn cảm giác chủ quan. So sánh với yêu cầu của vị trí công việc cho ra khoảng trống năng lực cụ thể. Cách học hiệu quả với người đi làm: học ít nhưng đều, gắn với công việc thực tế.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-F-CH4-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Hoàn thành bản tự đánh giá năng lực số theo 6 miền (dùng bảng mẫu dưới), so với yêu cầu vị trí công việc của mình, lập kế hoạch học tập 3 tháng.</p><p>Bảng tự đánh giá mẫu:</p><p>Sản phẩm nộp: Bản tự đánh giá và kế hoạch học tập cá nhân 3 tháng.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-F-CH4-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M5-F-CH4-QUIZ', 1, 'Quiz chương 4: Nhận biết và bù đắp khoảng trống năng lực', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khoảng trống năng lực được xác định như thế nào?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không thể xác định được', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'So sánh năng lực hiện tại với năng lực yêu cầu của vị trí công việc', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ dựa vào cảm giác chủ quan', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần xác định cụ thể', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Cách học hiệu quả với người đi làm nên như thế nào?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Dồn cả ngày cuối tuần để học', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Học ít nhưng đều đặn, gắn với công việc thực tế', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần lịch trình cụ thể', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ học lý thuyết tách rời công việc', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Câu hỏi nào khi nhờ đồng nghiệp hướng dẫn sẽ hiệu quả hơn?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, '“Chỉ em cách dùng Excel với”', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, '“Làm sao để lọc dữ liệu theo điều kiện cụ thể này trong Excel?”', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần đặt câu hỏi cụ thể', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Hỏi càng chung chung càng tốt', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao nên theo dõi tiến bộ học tập của bản thân?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần thiết', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Giúp duy trì động lực học tập lâu dài', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để báo cáo hình thức', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có tác dụng thực tế', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Nguồn học nào phù hợp cho người đi làm?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ có khóa học chính quy dài hạn', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tài liệu nội bộ, khóa học trực tuyến, học hỏi từ đồng nghiệp', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có nguồn học nào phù hợp', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ có thể tự học một mình', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M5-F-FINAL', 'Đánh giá cuối khóa', 5, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-F-FINAL-A', 'Bài đánh giá cuối khóa', 'ASSIGNMENT', '<p>Xử lý một chuỗi tình huống trong ngày làm việc: gặp sự cố kỹ thuật, chọn công cụ cho một nhiệm vụ mới, đề xuất một cải tiến, và lập kế hoạch học kỹ năng còn thiếu.</p><p>Tiêu chí chấm:</p><p>Điểm đạt: ≥70/100.</p>', 60, 1, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M5-F-FINAL', 1, 'Đánh giá cuối khóa — XỬ LÝ SỰ CỐ VÀ TỰ HỌC CÔNG NGHỆ', 'FINAL', true, 70, 1, 'PUBLISHED', v_admin_id, now(), now());
    END IF;
    RAISE NOTICE 'Done: M5-F';
    -- === M5-I ===
    SELECT id INTO v_course_id FROM courses WHERE code = 'M5-I' AND organization_id = v_org_id;
    IF v_course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM course_modules WHERE course_id = v_course_id) THEN
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M5-I-CH1', 'Chương 1: Chẩn đoán và xử lý vấn đề kỹ thuật', 1, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-I-CH1-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Phân biệt được các vấn đề kỹ thuật khi vận hành thiết bị và sử dụng môi trường số</li><li>Chọn được giải pháp cho chúng</li></ul><h2>Định nghĩa</h2><ul><li>Chẩn đoán có hệ thống: phương pháp xác định nguyên nhân sự cố bằng cách loại trừ dần các khả năng, thay vì đoán ngẫu nhiên</li><li>Sự cố cục bộ: sự cố chỉ ảnh hưởng đến một người hoặc một máy, khác với sự cố hệ thống ảnh hưởng nhiều người</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-I-CH1-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Ở mức trung cấp, việc phân biệt vấn đề kỹ thuật và chọn giải pháp cho chúng đòi hỏi phương pháp chẩn đoán có hệ thống gồm ba bước: tái hiện lại sự cố, thu hẹp phạm vi, loại trừ.</p><p>Phân biệt nguồn gốc vấn đề giúp xử lý đúng hướng: lỗi do thao tác, lỗi dữ liệu, lỗi phần mềm, lỗi kết nối, hoặc lỗi quyền truy cập. Phân biệt sự cố cục bộ (chỉ một người gặp) và sự cố hệ thống (nhiều người cùng gặp) là bước chẩn đoán quan trọng. Xây dựng tài liệu hướng dẫn xử lý sự cố thường gặp cho bộ phận giúp đồng nghiệp tự xử lý được các sự cố lặp lại.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-I-CH1-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Chẩn đoán 3 tình huống sự cố phức tạp dưới đây, ghi lại quá trình loại trừ; xây tài liệu hướng dẫn xử lý cho 5 sự cố hay gặp nhất của bộ phận.</p><p>3 tình huống mẫu để thực hành chẩn đoán:</p><p>- Một nhân viên báo không mở được file chia sẻ chung, nhưng đồng nghiệp khác vẫn mở bình thường - Hệ thống quản lý công việc chạy rất chậm vào buổi sáng, nhưng bình thường vào buổi chiều - Một báo cáo tự động hàng tuần đột nhiên không còn gửi email như trước Sản phẩm nộp: Nhật ký chẩn đoán 3 tình huống và tài liệu hướng dẫn xử lý 5 sự cố.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-I-CH1-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M5-I-CH1-QUIZ', 1, 'Quiz chương 1: Chẩn đoán và xử lý vấn đề kỹ thuật', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Ba bước của phương pháp chẩn đoán có hệ thống là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Đoán, thử, hy vọng', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tái hiện, thu hẹp phạm vi, loại trừ', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Báo cáo, chờ đợi, kiểm tra', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Khởi động lại, chờ, thử lại', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Một sự cố chỉ xảy ra với một người trong khi đồng nghiệp khác vẫn dùng bình thường gợi ý điều gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Đây chắc chắn là sự cố hệ thống', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Nguyên nhân thường liên quan đến máy hoặc tài khoản của riêng người đó', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không thể suy luận được gì', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Cần báo động toàn công ty ngay', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao nên ghi nhận và theo dõi các sự cố lặp lại?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần thiết', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Giúp tìm nguyên nhân gốc thay vì chỉ xử lý triệu chứng mỗi lần', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để có báo cáo đẹp', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có tác dụng thực tế', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khi trao đổi với bộ phận kỹ thuật, điều gì giúp tiết kiệm thời gian?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ nói “bị lỗi, sửa giúp em”', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Cung cấp thông tin đã chẩn đoán được và đã loại trừ những gì', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần cung cấp thông tin gì', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần gọi điện thoại nhiều lần', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Tài liệu hướng dẫn xử lý sự cố cho bộ phận có tác dụng gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có tác dụng thực tế', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Giúp đồng nghiệp tự xử lý sự cố lặp lại mà không cần chờ hỗ trợ mỗi lần', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để trang trí', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Làm phức tạp thêm quy trình', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M5-I-CH2', 'Chương 2: Đánh giá và lựa chọn giải pháp công nghệ', 2, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-I-CH2-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Giải thích nhu cầu cá nhân</li><li>Lựa chọn được các công cụ số và các giải pháp công nghệ có thể có để giải quyết những nhu cầu đó</li><li>Chọn được cách điều chỉnh và tùy chỉnh môi trường số theo nhu cầu cá nhân</li></ul><h2>Định nghĩa</h2><ul><li>Giải pháp công nghệ (Điều 2, TT 02/2025/TT-BGDĐT): tập hợp các công cụ kỹ thuật có liên quan (phần mềm, phần cứng) hoặc dịch vụ hoặc kết hợp để giải quyết vấn đề đặt ra</li><li>Chi phí toàn phần (total cost of ownership): tổng chi phí thực tế của một giải pháp công nghệ, bao gồm giá mua, đào tạo, chuyển đổi dữ liệu, không chỉ giá niêm yết</li><li>Rủi ro phụ thuộc nhà cung cấp: rủi ro khi một tổ chức phụ thuộc quá nhiều vào một nhà cung cấp, khó chuyển sang giải pháp khác nếu cần</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-I-CH2-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Ở mức trung cấp, việc lựa chọn công cụ số và giải pháp công nghệ có thể có cho nhu cầu cụ thể cần phân tích sâu hơn — phân biệt nhu cầu bắt buộc và nhu cầu mong muốn, tránh bị cuốn theo tính năng hấp dẫn nhưng không thực sự cần thiết.</p><p>Bảng so sánh giải pháp theo tiêu chí có trọng số giúp so sánh khách quan. Chi phí toàn phần không chỉ là giá mua mà còn gồm chi phí đào tạo, chuyển đổi dữ liệu, thời gian làm quen. Rủi ro phụ thuộc nhà cung cấp cần được cân nhắc — nên ưu tiên giải pháp cho phép xuất dữ liệu dễ dàng. Thử nghiệm quy mô nhỏ trước khi triển khai rộng giúp giảm rủi ro.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-I-CH2-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Chọn một nhu cầu công nghệ thật của bộ phận, so sánh tối thiểu 3 giải pháp theo bảng tiêu chí có trọng số, viết đề xuất 1 trang.</p><p>Bảng so sánh mẫu:</p><p>Sản phẩm nộp: Bảng so sánh giải pháp và đề xuất công nghệ 1 trang.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-I-CH2-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M5-I-CH2-QUIZ', 1, 'Quiz chương 2: Đánh giá và lựa chọn giải pháp công nghệ', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Chi phí toàn phần của một giải pháp công nghệ bao gồm những gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ giá mua hoặc phí đăng ký', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Giá mua, chi phí đào tạo, chuyển đổi dữ liệu, thời gian làm quen', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ chi phí bảo trì', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không thể tính được chi phí toàn phần', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao nên phân biệt nhu cầu bắt buộc và nhu cầu mong muốn khi chọn giải pháp công nghệ?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần phân biệt', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tránh bị cuốn theo tính năng hấp dẫn nhưng không thực sự cần thiết', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để làm phức tạp thêm quyết định', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có tác dụng thực tế', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Rủi ro phụ thuộc nhà cung cấp là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có rủi ro gì đặc biệt', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Khó chuyển sang giải pháp khác nếu dữ liệu bị “khóa” trong hệ thống hiện tại', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ liên quan đến giá cả', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không liên quan đến việc chọn công nghệ', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao nên thử nghiệm quy mô nhỏ trước khi triển khai rộng?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần thiết, triển khai toàn bộ ngay là tốt nhất', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Giúp phát hiện vấn đề trước khi đầu tư toàn bộ, giảm rủi ro', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ làm chậm quá trình triển khai', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có lợi ích thực tế', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Bảng so sánh giải pháp theo tiêu chí có trọng số giúp ích gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có tác dụng thực tế', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Cung cấp cơ sở so sánh khách quan hơn là chỉ dựa vào cảm tính', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để trình bày đẹp mắt', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Làm chậm quá trình ra quyết định không cần thiết', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M5-I-CH3', 'Chương 3: Cải tiến quy trình bằng công cụ số', 3, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-I-CH3-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Phân biệt được các công cụ và công nghệ số có thể được sử dụng để tạo ra kiến thức và đổi mới quy trình và sản phẩm</li><li>Gắn kết được cá nhân và tập thể vào quá trình xử lý nhận thức để hiểu và giải quyết các vấn đề khái niệm và tình huống có vấn đề trong môi trường số</li></ul><h2>Định nghĩa</h2><ul><li>Sơ đồ quy trình: biểu diễn trực quan các bước, người thực hiện, đầu vào và đầu ra của một quy trình công việc</li><li>Điểm nghẽn (bottleneck): bước trong quy trình gây chậm trễ hoặc tắc nghẽn, ảnh hưởng đến tốc độ hoàn thành toàn bộ quy trình</li><li>Điểm bàn giao: thời điểm công việc chuyển từ người này sang người khác trong quy trình</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-I-CH3-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Ở mức trung cấp, việc gắn kết cá nhân và tập thể vào quá trình xử lý nhận thức để giải quyết vấn đề mở rộng thành cải tiến quy trình bằng công nghệ số. Vẽ sơ đồ quy trình hiện tại giúp nhìn thấy toàn cảnh mà mô tả bằng lời dễ bỏ sót.</p><p>Nhận diện lãng phí theo các dạng phổ biến: chờ đợi, nhập liệu trùng lặp, phê duyệt thừa, thao tác thủ công lặp lại. Điểm bàn giao giữa người và giữa bộ phận thường là nơi dễ xảy ra chậm trễ nhất. Đo lường hiệu quả trước và sau cải tiến cần dựa trên số liệu cụ thể: thời gian hoàn thành, số lỗi phát sinh.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-I-CH3-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Chọn một quy trình đang có vấn đề trong bộ phận, vẽ sơ đồ hiện trạng, xác định điểm nghẽn, thiết kế phương án cải tiến và đo thử.</p><p>Sản phẩm nộp: Sơ đồ quy trình trước và sau, phân tích điểm nghẽn, số liệu đo lường.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-I-CH3-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M5-I-CH3-QUIZ', 1, 'Quiz chương 3: Cải tiến quy trình bằng công cụ số', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Điểm bàn giao giữa người hoặc bộ phận trong quy trình thường có đặc điểm gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Luôn diễn ra suôn sẻ', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Dễ xảy ra chậm trễ hoặc mất thông tin nhất', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không quan trọng bằng các bước khác', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần phân tích riêng', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', '“Nhập liệu trùng lặp” là loại lãng phí nào trong quy trình?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chờ đợi', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Cùng một thông tin phải nhập lại nhiều lần ở các bước khác nhau', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Phê duyệt thừa', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không phải là lãng phí', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao nên thử nghiệm thay đổi quy trình ở quy mô nhỏ trước?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần thiết', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Phát hiện vấn đề chưa lường trước trước khi áp dụng toàn bộ', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để làm chậm quá trình thay đổi', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có lợi ích thực tế', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Đo lường hiệu quả cải tiến nên dựa trên điều gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Cảm nhận chủ quan là đủ', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Số liệu cụ thể: thời gian hoàn thành, số lỗi, số bước thực hiện', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần đo lường', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần ý kiến của một người', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Cách hiệu quả để thuyết phục đồng nghiệp chấp nhận thay đổi quy trình là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Áp đặt từ trên xuống không cần giải thích', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Giải thích lợi ích cụ thể cho họ và cho họ tham gia thiết kế', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần thuyết phục, chỉ cần ra lệnh', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Thay đổi âm thầm không thông báo', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M5-I-CH4', 'Chương 4: Phát triển năng lực số cho bản thân và nhóm', 4, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-I-CH4-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Thảo luận về lĩnh vực năng lực số của bản thân cần được cải thiện hoặc cập nhật</li><li>Chỉ ra được cách hỗ trợ người khác phát triển năng lực số của họ</li><li>Chỉ ra được nơi để tìm kiếm cơ hội phát triển bản thân và cập nhật sự phát triển số</li></ul><h2>Định nghĩa</h2><ul><li>Năng lực số (Điều 2, TT 02/2025/TT-BGDĐT): khả năng sử dụng công nghệ số để hoàn thành nhiệm vụ cụ thể hoặc để giải quyết vấn đề trong thực tiễn</li><li>Bản đồ năng lực nhóm: tổng hợp mức năng lực số hiện tại của tất cả thành viên trong nhóm theo từng lĩnh vực</li><li>Học qua việc: phương thức phát triển năng lực thông qua thực hành trực tiếp trong công việc, thay vì đào tạo tách rời</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-I-CH4-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Ở mức trung cấp, việc thảo luận về lĩnh vực năng lực số cần cải thiện và hỗ trợ người khác phát triển mở rộng sang phát triển năng lực cho cả nhóm. Đánh giá năng lực nhóm theo khung chuẩn cho phép nhìn thấy bức tranh chung: nhóm mạnh ở đâu, yếu ở đâu.</p><p>Các phương thức phát triển năng lực khác nhau phù hợp với tình huống khác nhau: đào tạo chính thức, kèm cặp một-một, học qua việc, chia sẻ nội bộ. Kỹ năng hướng dẫn người khác hiệu quả gồm ba bước: chia nhỏ, làm mẫu, để người học tự làm có quan sát.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-I-CH4-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Đánh giá năng lực số của nhóm mình theo 6 miền, lập bản đồ khoảng trống và kế hoạch phát triển 6 tháng; thiết kế và thực hiện một buổi chia sẻ nội bộ 30 phút về một kỹ năng cụ thể.</p><p>Sản phẩm nộp: Bản đồ năng lực nhóm, kế hoạch phát triển, tài liệu buổi chia sẻ.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-I-CH4-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M5-I-CH4-QUIZ', 1, 'Quiz chương 4: Phát triển năng lực số cho bản thân và nhóm', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Phương thức phát triển năng lực nào phù hợp khi cần hướng dẫn sâu một kỹ năng cụ thể cho một người?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Đào tạo chính thức cho nhóm lớn', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Kèm cặp một-một', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần phương thức đặc biệt', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần gửi tài liệu đọc', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Ba bước của kỹ năng hướng dẫn người khác hiệu quả là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Nói, viết, kiểm tra', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chia nhỏ, làm mẫu, để người học tự làm có quan sát', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Ra lệnh, chờ đợi, đánh giá', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có quy trình cụ thể', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao cần cơ chế duy trì kỹ năng sau đào tạo?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần thiết', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Kỹ năng không được sử dụng thường xuyên dễ bị quên đi nhanh chóng', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để có thêm hoạt động', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có tác dụng thực tế', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Bản đồ khoảng trống năng lực nhóm giúp ích gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có tác dụng thực tế', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Xác định ai thiếu kỹ năng gì và mức độ ưu tiên xử lý', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để đánh giá cá nhân', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không liên quan đến kế hoạch phát triển', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', '“Học qua việc” phù hợp nhất khi nào?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Khi cần kiến thức nền tảng cho nhiều người', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Khi kỹ năng cần được thực hành trực tiếp trong bối cảnh công việc thật', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không bao giờ phù hợp', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ phù hợp với nhân viên mới', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M5-I-FINAL', 'Đánh giá cuối khóa', 5, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-I-FINAL-A', 'Bài đánh giá cuối khóa', 'ASSIGNMENT', '<p>Chọn một vấn đề thật của bộ phận, chẩn đoán nguyên nhân, đánh giá giải pháp công nghệ, thiết kế quy trình cải tiến, và lập kế hoạch nâng năng lực nhóm để vận hành quy trình mới.</p><p>Tiêu chí chấm:</p><p>Điểm đạt: ≥70/100.</p>', 60, 1, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M5-I-FINAL', 1, 'Đánh giá cuối khóa — GIẢI QUYẾT VẤN ĐỀ TRONG CÔNG VIỆC SỐ', 'FINAL', true, 70, 1, 'PUBLISHED', v_admin_id, now(), now());
    END IF;
    RAISE NOTICE 'Done: M5-I';
    -- === M5-A ===
    SELECT id INTO v_course_id FROM courses WHERE code = 'M5-A' AND organization_id = v_org_id;
    IF v_course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM course_modules WHERE course_id = v_course_id) THEN
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M5-A-CH1', 'Chương 1: Xây dựng năng lực xử lý vấn đề của tổ chức', 1, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-A-CH1-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Thẩm định được các vấn đề kỹ thuật khi vận hành thiết bị và sử dụng môi trường số</li><li>Giải quyết chúng bằng những giải pháp phù hợp nhất</li></ul><h2>Định nghĩa</h2><ul><li>Phân tích nguyên nhân gốc: phương pháp tìm ra nguyên nhân sâu xa thực sự gây ra vấn đề, thay vì chỉ xử lý triệu chứng bề mặt</li><li>Kho tri thức nội bộ: hệ thống lưu trữ tập trung các giải pháp, hướng dẫn đã được tích lũy, giúp tổ chức không phải giải quyết lại từ đầu các vấn đề đã từng gặp</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-A-CH1-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Ở mức nâng cao, việc thẩm định vấn đề kỹ thuật và giải quyết bằng giải pháp phù hợp nhất mở rộng thành xây dựng năng lực xử lý vấn đề của cả tổ chức. Mô hình hỗ trợ nội bộ theo cấp giúp phân bổ nguồn lực hợp lý, với ngưỡng chuyển cấp được xác định rõ.</p><p>Phân tích nguyên nhân gốc đi xa hơn việc chỉ xử lý triệu chứng — ví dụ một lỗi nhập liệu lặp lại có thể do giao diện thiết kế dễ gây nhầm lẫn, không phải do nhân viên bất cẩn. Kho tri thức nội bộ có cấu trúc rõ ràng giúp tổ chức không phải giải quyết lại từ đầu các vấn đề đã từng gặp.</p><p>Rủi ro phụ thuộc cá nhân xảy ra khi chỉ một người trong tổ chức nắm rõ cách vận hành một hệ thống quan trọng — khi người đó nghỉ phép hoặc rời đi, tổ chức gặp khó khăn nghiêm trọng; giảm rủi ro này đòi hỏi văn bản hóa quy trình và đào tạo dự phòng cho ít nhất một người khác. Khi làm việc với nhà cung cấp dịch vụ hỗ trợ bên ngoài, hợp đồng dịch vụ (SLA) nên quy định rõ thời gian phản hồi cam kết theo mức độ nghiêm trọng của sự cố, làm cơ sở đánh giá chất lượng dịch vụ nhận được.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-A-CH1-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Phân tích dữ liệu sự cố của doanh nghiệp trong một giai đoạn (có thể dùng dữ liệu mẫu dưới đây làm điểm khởi đầu, bổ sung dữ liệu thật nếu có), tìm 3 nguyên nhân gốc lặp lại, đề xuất mô hình hỗ trợ và kho tri thức.</p><p>Dữ liệu mẫu — Nhật ký sự cố 3 tháng (rút gọn):</p><p>(Gợi ý phân tích: sự cố đăng nhập tập trung sáng thứ Hai có thể liên quan đến việc hệ thống bảo trì cuối tuần hoặc quá tải đăng nhập đồng loạt; lỗi định dạng ngày lặp lại dù đã nhắc nhở gợi ý nguyên nhân gốc nằm ở thiết kế biểu mẫu chứ không phải ý thức nhân viên.)</p><p>Sản phẩm nộp: Phân tích nguyên nhân gốc, thiết kế mô hình hỗ trợ, cấu trúc kho tri thức.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-A-CH1-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M5-A-CH1-QUIZ', 1, 'Quiz chương 1: Xây dựng năng lực xử lý vấn đề của tổ chức', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Phân tích nguyên nhân gốc khác gì so với xử lý triệu chứng?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có khác biệt', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tìm nguyên nhân sâu xa thực sự, thay vì chỉ xử lý biểu hiện bề mặt', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Nguyên nhân gốc luôn khó tìm hơn', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ áp dụng cho vấn đề kỹ thuật', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Lỗi nhập sai định dạng ngày lặp lại dù đã nhắc nhở nhiều lần gợi ý điều gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Nhân viên không đủ năng lực', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Nguyên nhân gốc có thể nằm ở thiết kế biểu mẫu, không phải ý thức cá nhân', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Cần sa thải nhân viên vi phạm', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có nguyên nhân cụ thể', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Rủi ro phụ thuộc cá nhân trong vận hành là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có rủi ro gì', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Khi chỉ một người nắm rõ cách vận hành, tổ chức gặp khó khăn nếu người đó vắng mặt', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ liên quan đến lương thưởng', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không thể giảm thiểu được', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Kho tri thức nội bộ mang lại lợi ích gì khi có nhân sự rời đi?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có lợi ích gì', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Kiến thức không bị mất theo cá nhân, tổ chức không phải giải quyết lại từ đầu', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ giúp nhân sự mới làm quen nhanh hơn', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không liên quan đến nhân sự rời đi', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Hợp đồng dịch vụ (SLA) với nhà cung cấp hỗ trợ bên ngoài nên quy định gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần quy định gì cụ thể', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Thời gian phản hồi cam kết theo mức độ nghiêm trọng của sự cố', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần quy định giá dịch vụ', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ áp dụng cho hợp đồng lớn', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M5-A-CH2', 'Chương 2: Chiến lược công nghệ và triển khai thay đổi', 2, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-A-CH2-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Đánh giá được nhu cầu cá nhân</li><li>Chọn được các công cụ số phù hợp nhất và các giải pháp công nghệ có thể có để giải quyết những nhu cầu đó</li><li>Quyết định được những cách thích hợp nhất để điều chỉnh và tùy chỉnh môi trường số theo nhu cầu cá nhân</li></ul><h2>Định nghĩa</h2><ul><li>Giải pháp công nghệ (Điều 2, TT 02/2025/TT-BGDĐT): tập hợp các công cụ kỹ thuật có liên quan (phần mềm, phần cứng) hoặc dịch vụ hoặc kết hợp để giải quyết vấn đề đặt ra</li><li>Lộ trình công nghệ: kế hoạch có thứ tự ưu tiên về các khoản đầu tư và thay đổi công nghệ trong một khoảng thời gian, gắn với mục tiêu kinh doanh</li><li>Mức độ sẵn sàng của tổ chức: khả năng của tổ chức (về hạ tầng, năng lực nhân sự, văn hóa) trong việc tiếp nhận một thay đổi công nghệ mới</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-A-CH2-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Ở mức nâng cao, việc quyết định cách thích hợp nhất để điều chỉnh môi trường số theo nhu cầu mở rộng thành chiến lược công nghệ cấp tổ chức. Lộ trình công nghệ hiệu quả bắt đầu từ mục tiêu kinh doanh, không phải từ công nghệ đang thịnh hành.</p><p>Mức độ sẵn sàng của tổ chức không chỉ là vấn đề kỹ thuật mà còn là vấn đề con người — nhân viên có sẵn sàng thay đổi thói quen làm việc không. Nguyên nhân thất bại phổ biến của dự án công nghệ ở doanh nghiệp nhỏ thường là thiếu sự tham gia của người dùng cuối, đánh giá thấp chi phí đào tạo.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-A-CH2-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Xây lộ trình công nghệ 12 tháng cho doanh nghiệp: đánh giá hiện trạng, xác định ưu tiên, kế hoạch triển khai cho hạng mục ưu tiên nhất.</p><p>Sản phẩm nộp: Lộ trình công nghệ, kế hoạch triển khai, khung đánh giá hiệu quả.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-A-CH2-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M5-A-CH2-QUIZ', 1, 'Quiz chương 2: Chiến lược công nghệ và triển khai thay đổi', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Lộ trình công nghệ nên bắt đầu từ đâu?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Từ công nghệ đang thịnh hành', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Từ mục tiêu kinh doanh cụ thể', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Từ ngân sách có sẵn', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Từ sở thích cá nhân của lãnh đạo', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Nguyên nhân thất bại phổ biến của dự án công nghệ ở doanh nghiệp nhỏ thường là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Luôn do công nghệ kém chất lượng', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Thiếu sự tham gia của người dùng cuối, đánh giá thấp chi phí đào tạo', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có nguyên nhân phổ biến nào', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ do thiếu ngân sách', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Mức độ sẵn sàng của tổ chức bao gồm yếu tố nào ngoài kỹ thuật?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ có yếu tố kỹ thuật là quan trọng', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Sự sẵn sàng thay đổi thói quen làm việc và rào cản văn hóa', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có yếu tố nào khác', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ liên quan đến ngân sách', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Ma trận tác động và khả thi dùng để làm gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có tác dụng thực tế', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Ưu tiên đầu tư vào hạng mục vừa có tác động lớn vừa khả thi thực hiện', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để trình bày báo cáo', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ áp dụng cho dự án nhỏ', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Đánh giá hiệu quả sau triển khai nên dựa trên điều gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Cảm nhận chủ quan sau khi triển khai', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Các chỉ số đã đặt ra từ đầu, so sánh với mục tiêu ban đầu', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ tiêu tự đặt ra sau khi biết kết quả', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần đánh giá hiệu quả', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M5-A-CH3', 'Chương 3: Đổi mới sáng tạo bằng công nghệ số', 3, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-A-CH3-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Điều chỉnh được các công cụ và công nghệ số phù hợp nhất để tạo ra kiến thức cũng như đổi mới quy trình và sản phẩm</li><li>Giải quyết được các vấn đề khái niệm và tình huống có vấn đề của cá nhân và tập thể trong môi trường số</li></ul><h2>Định nghĩa</h2><ul><li>Giả thuyết kiểm chứng được: một dự đoán cụ thể có thể được xác nhận đúng hoặc sai thông qua thử nghiệm thực tế</li><li>Thử nghiệm quy mô nhỏ (pilot): việc áp dụng một ý tưởng mới ở phạm vi hạn chế để kiểm tra tính khả thi trước khi mở rộng</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-A-CH3-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Ở mức nâng cao, việc điều chỉnh công cụ và công nghệ số phù hợp nhất để tạo kiến thức mở rộng thành đổi mới sáng tạo cấp tổ chức. Cơ hội đổi mới thường xuất hiện từ ba nguồn: điểm đau của khách hàng, điểm kém hiệu quả nội bộ, công nghệ mới khả dụng.</p><p>Từ ý tưởng ban đầu, cần chuyển hóa thành giả thuyết kiểm chứng được với tiêu chí thành công xác định trước khi chạy thử nghiệm. Thiết kế thử nghiệm nhỏ, chi phí thấp giúp kiểm chứng giả thuyết mà không cần đầu tư lớn ngay từ đầu. Xây dựng văn hóa cho phép thử và sai có kiểm soát đòi hỏi lãnh đạo không trừng phạt thử nghiệm thất bại có phương pháp.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-A-CH3-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Nhận diện một cơ hội đổi mới trong doanh nghiệp, thiết kế thử nghiệm với giả thuyết và tiêu chí thành công rõ ràng, trình bày phương án.</p><p>Sản phẩm nộp: Đề xuất đổi mới, thiết kế thử nghiệm, tiêu chí đánh giá.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-A-CH3-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M5-A-CH3-QUIZ', 1, 'Quiz chương 3: Đổi mới sáng tạo bằng công nghệ số', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Ba nguồn phổ biến của cơ hội đổi mới là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ có công nghệ mới', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Điểm đau khách hàng, điểm kém hiệu quả nội bộ, công nghệ mới khả dụng', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ từ ý tưởng của lãnh đạo', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có nguồn cụ thể', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao cần chuyển ý tưởng thành giả thuyết kiểm chứng được?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần thiết', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Để có thể đo lường kết quả thử nghiệm một cách cụ thể', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để làm phức tạp thêm ý tưởng', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có tác dụng thực tế', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Tiêu chí thành công của thử nghiệm nên được xác định khi nào?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Sau khi có kết quả', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Trước khi chạy thử nghiệm', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần xác định', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tùy ý điều chỉnh trong quá trình', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao không nên trừng phạt thử nghiệm thất bại có phương pháp?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Nên trừng phạt để răn đe', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Sợ thất bại khiến nhân viên ngại đề xuất ý tưởng mới', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không liên quan đến văn hóa tổ chức', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Thất bại luôn nên được khen thưởng', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Cách phân biệt cơ hội công nghệ thật với sự cường điệu là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chạy theo vì nhiều người đang nói về nó', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Đặt câu hỏi cụ thể công nghệ đó giải quyết vấn đề gì của tổ chức', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không thể phân biệt được', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Luôn tin vào xu hướng truyền thông', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M5-A-CH4', 'Chương 4: Phát triển năng lực số toàn tổ chức', 4, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-A-CH4-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Quyết định được những cách thích hợp nhất để cải thiện hoặc cập nhật nhu cầu về năng lực số của chính mình</li><li>Đánh giá được sự phát triển năng lực số của người khác</li><li>Lựa chọn được những cơ hội thích hợp nhất để phát triển bản thân và cập nhật những phát triển mới</li></ul><h2>Định nghĩa</h2><ul><li>Năng lực số (Điều 2, TT 02/2025/TT-BGDĐT): khả năng sử dụng công nghệ số để hoàn thành nhiệm vụ cụ thể hoặc để giải quyết vấn đề trong thực tiễn</li><li>Đội ngũ nòng cốt: nhóm nhân sự được đào tạo chuyên sâu trước, đóng vai trò lan tỏa kiến thức và hỗ trợ đồng nghiệp trong tổ chức</li><li>Lộ trình nghề nghiệp gắn với năng lực số: việc đưa yêu cầu và kết quả phát triển năng lực số vào quá trình đánh giá và thăng tiến của nhân viên</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-A-CH4-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Ở mức nâng cao, việc quyết định cách thích hợp nhất để cải thiện năng lực số và đánh giá sự phát triển của người khác mở rộng thành phát triển năng lực số toàn tổ chức. Khảo sát và lập bản đồ năng lực số toàn tổ chức cho phép nhìn thấy bức tranh tổng thể.</p><p>Chiến lược phát triển năng lực số cấp tổ chức cần cân nhắc ba hướng: tuyển mới, đào tạo lại nhân sự hiện có, thuê ngoài. Xây dựng đội ngũ nòng cốt — đào tạo trước một nhóm nhỏ để lan tỏa kiến thức — là cách mở rộng đào tạo hiệu quả về chi phí. Đo lường hiệu quả đào tạo không nên chỉ dừng ở điểm số mà cần theo dõi thay đổi hành vi thực tế.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-A-CH4-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Xây chiến lược phát triển năng lực số cho doanh nghiệp: bản đồ hiện trạng theo vị trí, ma trận yêu cầu, phân tích khoảng trống, chương trình đào tạo ưu tiên và bộ chỉ số đo lường.</p><p>Sản phẩm nộp: Bản đồ năng lực tổ chức, ma trận yêu cầu theo vị trí, chiến lược phát triển, bộ chỉ số.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-A-CH4-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M5-A-CH4-QUIZ', 1, 'Quiz chương 4: Phát triển năng lực số toàn tổ chức', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Ba hướng chiến lược phát triển năng lực số cấp tổ chức là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ có đào tạo là lựa chọn duy nhất', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tuyển mới, đào tạo lại, thuê ngoài', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ có thuê ngoài', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có chiến lược cụ thể', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Đội ngũ nòng cốt có vai trò gì trong phát triển năng lực số?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có vai trò cụ thể', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Được đào tạo trước, sau đó lan tỏa kiến thức cho đồng nghiệp', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để quản lý hành chính', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ dành cho cấp lãnh đạo', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Đo lường hiệu quả đào tạo nên dựa vào điều gì thay vì chỉ điểm số bài kiểm tra?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần điểm số là đủ', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Thay đổi hành vi thực tế trong công việc sau đào tạo', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần đo lường gì thêm', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần số lượng người tham gia', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao nên gắn năng lực số vào lộ trình thăng tiến của nhân viên?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có lý do cụ thể', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tạo động lực thực chất cho việc học tập, thay vì đào tạo mang tính hình thức', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để tăng thêm thủ tục hành chính', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không liên quan đến hiệu quả đào tạo', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khi nào nên chọn hướng “thuê ngoài” thay vì đào tạo nội bộ?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Luôn nên thuê ngoài', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Khi nhu cầu không thường xuyên, không đáng đầu tư xây năng lực nội bộ', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không bao giờ nên thuê ngoài', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ khi không có ngân sách', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M5-A-FINAL', 'Đánh giá cuối khóa', 5, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M5-A-FINAL-A', 'Bài đánh giá cuối khóa', 'ASSIGNMENT', '<p>Xây dựng đề án chuyển đổi số cho doanh nghiệp: đánh giá hiện trạng, lộ trình công nghệ, một đề xuất đổi mới có thiết kế thử nghiệm, và chiến lược phát triển năng lực số đi kèm.</p><p>Tiêu chí chấm:</p><p>Điểm đạt: ≥70/100, không tiêu chí nào dưới 50%.</p>', 60, 1, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M5-A-FINAL', 1, 'Đánh giá cuối khóa — ĐỔI MỚI VÀ DẪN DẮT CHUYỂN ĐỔI SỐ', 'FINAL', true, 70, 1, 'PUBLISHED', v_admin_id, now(), now());
    END IF;
    RAISE NOTICE 'Done: M5-A';
    -- === M6-F ===
    SELECT id INTO v_course_id FROM courses WHERE code = 'M6-F' AND organization_id = v_org_id;
    IF v_course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM course_modules WHERE course_id = v_course_id) THEN
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M6-F-CH1', 'Chương 1: Hiểu biết cơ bản về AI', 1, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M6-F-CH1-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Xác định được khái niệm cơ bản của AI</li><li>Nhớ lại được các ứng dụng đơn giản của AI trong cuộc sống hằng ngày</li><li>Giải thích được nguyên tắc hoạt động cơ bản của AI</li><li>Diễn giải được các thuật ngữ liên quan đến AI</li></ul><h2>Định nghĩa</h2><ul><li>Trí tuệ nhân tạo (AI): theo Thông tư 02/2025/TT-BGDĐT, là việc phát triển các hệ thống máy móc có khả năng thực hiện các nhiệm vụ đòi hỏi trí tuệ con người như học tập, suy luận và giải quyết vấn đề</li><li>Trí tuệ nhân tạo tạo sinh (Gen AI): một lĩnh vực thuộc AI tập trung vào việc tạo ra dữ liệu mới — văn bản, hình ảnh, âm thanh, video, mã nguồn — dựa trên dữ liệu đầu vào đã được huấn luyện trước đó</li><li>Mô hình AI: hệ thống đã được huấn luyện trên một khối lượng lớn dữ liệu để nhận diện quy luật và đưa ra dự đoán hoặc tạo nội dung mới</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M6-F-CH1-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>AI, nói một cách đơn giản, là các chương trình máy tính được “huấn luyện” từ một khối lượng dữ liệu khổng lồ để nhận diện quy luật, sau đó áp dụng quy luật đó vào tình huống mới. Khác với phần mềm truyền thống được lập trình sẵn từng bước cụ thể, AI học từ ví dụ — giống như một người học nói tiếng Việt bằng cách nghe hàng ngàn câu nói, không phải học thuộc lòng từng quy tắc ngữ pháp.</p><p>Gen AI (trí tuệ nhân tạo tạo sinh) là nhóm công cụ AI phổ biến nhất hiện nay mà người đi làm hay gặp: các công cụ trò chuyện dạng văn bản (trả lời câu hỏi, viết nháp email), công cụ tạo hình ảnh từ mô tả bằng chữ, hoặc công cụ chuyển giọng nói thành văn bản.</p><p>Trong đời sống và công việc hằng ngày, AI đã hiện diện ở nhiều nơi tưởng chừng không liên quan đến “công nghệ cao”: gợi ý sản phẩm khi mua sắm trực tuyến, bộ lọc thư rác trong email, tính năng tự động hoàn thành khi gõ tin nhắn, ứng dụng dịch thuật, hay hệ thống nhận diện khuôn mặt để mở khóa điện thoại.</p><p>Nguyên tắc hoạt động cơ bản của AI có thể hình dung qua ba bước: (1) AI được “cho xem” một lượng lớn dữ liệu mẫu trong quá trình huấn luyện, (2) từ đó AI tự nhận diện các quy luật thống kê trong dữ liệu, (3) khi gặp dữ liệu mới, AI áp dụng quy luật đã học để đưa ra dự đoán hoặc tạo ra nội dung. Điều quan trọng cần hiểu: AI không “hiểu” theo nghĩa con người hiểu — nó dự đoán dựa trên xác suất và mẫu hình đã học, điều này giải thích vì sao đôi khi AI đưa ra câu trả lời nghe rất tự tin nhưng lại sai.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M6-F-CH1-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Liệt kê 5 công cụ hoặc ứng dụng có dùng AI mà bản thân từng gặp trong công việc hoặc đời sống hằng ngày (có thể là những thứ rất quen thuộc, không cần “cao siêu”), với mỗi công cụ, giải thích ngắn gọn AI đóng vai trò gì ở đó.</p><p>Sản phẩm nộp: Bảng 5 ứng dụng AI đã gặp kèm giải thích.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M6-F-CH1-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M6-F-CH1-QUIZ', 1, 'Quiz chương 1: Hiểu biết cơ bản về AI', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Theo Thông tư 02/2025/TT-BGDĐT, AI được định nghĩa là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Một loại phần mềm diệt virus', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Hệ thống máy móc có khả năng thực hiện nhiệm vụ đòi hỏi trí tuệ con người', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Một loại mạng xã hội', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Thiết bị lưu trữ dữ liệu', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Gen AI (trí tuệ nhân tạo tạo sinh) tập trung vào việc gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Lưu trữ dữ liệu', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tạo ra dữ liệu mới như văn bản, hình ảnh, âm thanh dựa trên dữ liệu đã huấn luyện', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Sửa lỗi phần cứng', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Quản lý mạng máy tính', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao AI đôi khi đưa ra câu trả lời sai dù nghe rất tự tin?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'AI luôn cố ý nói sai', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'AI dự đoán dựa trên xác suất và mẫu hình đã học, không thực sự “hiểu” như con người', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'AI không có khả năng trả lời', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Do lỗi kết nối mạng', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Đâu là ví dụ về AI trong đời sống hằng ngày?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ có robot công nghiệp mới là AI', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Gợi ý tự động hoàn thành khi gõ tin nhắn cũng là một dạng AI', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'AI chỉ tồn tại trong phim khoa học viễn tưởng', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'AI chỉ dùng trong nghiên cứu khoa học', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'AI học từ dữ liệu theo cách nào?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Được lập trình sẵn từng bước cụ thể như phần mềm truyền thống', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Nhận diện quy luật từ khối lượng lớn dữ liệu mẫu trong quá trình huấn luyện', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần dữ liệu để hoạt động', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ hoạt động khi có kết nối Internet', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M6-F-CH2', 'Chương 2: Sử dụng công cụ AI cơ bản', 2, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M6-F-CH2-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Nhận diện được các công cụ AI đơn giản</li><li>Thực hiện được các thao tác cơ bản với công cụ AI</li><li>Nhận thức được cơ bản về các vấn đề đạo đức và pháp lý liên quan đến AI</li><li>Áp dụng được công cụ AI để giải quyết vấn đề đơn giản</li></ul><h2>Định nghĩa</h2><ul><li>Yêu cầu (prompt): câu lệnh hoặc câu hỏi mà người dùng nhập vào công cụ AI để nhận được kết quả mong muốn</li><li>Công cụ AI công cộng: dịch vụ AI trực tuyến miễn phí hoặc trả phí, không thuộc quyền kiểm soát của doanh nghiệp, dữ liệu nhập vào có thể được lưu trữ hoặc dùng để huấn luyện thêm</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M6-F-CH2-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Làm quen với một công cụ AI tạo sinh dạng trò chuyện (chatbot văn bản) là bước khởi đầu phổ biến nhất. Các công cụ này nhận yêu cầu bằng ngôn ngữ tự nhiên (viết như nói chuyện bình thường) và trả về văn bản, có thể là câu trả lời, bản tóm tắt, hoặc bản nháp.</p><p>Cách đặt yêu cầu (prompt) cơ bản ảnh hưởng lớn đến chất lượng kết quả. Một yêu cầu mơ hồ (“viết cho tôi cái gì đó về báo cáo”) thường cho kết quả chung chung không dùng được; một yêu cầu cụ thể (nêu rõ chủ đề, độ dài mong muốn, đối tượng đọc) thường cho kết quả sát nhu cầu hơn nhiều.</p><p>Nguyên tắc an toàn quan trọng nhất ở mức cơ bản: không đưa thông tin nhạy cảm hoặc dữ liệu khách hàng vào công cụ AI công cộng chưa được doanh nghiệp phê duyệt. Dữ liệu nhập vào các công cụ AI miễn phí trên mạng có thể được lưu trữ trên máy chủ bên ngoài, thậm chí được dùng để huấn luyện lại mô hình — nghĩa là thông tin đó có thể “rò rỉ” ra ngoài phạm vi kiểm soát của doanh nghiệp theo cách không thể thu hồi lại.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M6-F-CH2-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Dùng một công cụ AI để hỗ trợ một việc công việc đơn giản (ví dụ: tóm tắt một văn bản, soạn nháp một email, dịch một đoạn văn bản ngắn). Ghi lại yêu cầu (prompt) đã đặt và đánh giá kết quả nhận được có đạt yêu cầu không, cần chỉnh sửa gì.</p><p>Sản phẩm nộp: Bản ghi thao tác (yêu cầu đã đặt) + kết quả nhận được + nhận xét.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M6-F-CH2-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M6-F-CH2-QUIZ', 1, 'Quiz chương 2: Sử dụng công cụ AI cơ bản', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao cách đặt yêu cầu (prompt) ảnh hưởng đến chất lượng kết quả AI?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có ảnh hưởng gì', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Yêu cầu càng cụ thể, kết quả càng sát nhu cầu thực tế', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'AI luôn cho kết quả giống nhau bất kể yêu cầu gì', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ ảnh hưởng đến tốc độ trả lời', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Nguyên tắc an toàn quan trọng nhất khi dùng công cụ AI công cộng là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Luôn dùng công cụ miễn phí', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không đưa thông tin nhạy cảm hoặc dữ liệu khách hàng vào công cụ chưa được phê duyệt', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ dùng vào buổi sáng', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Luôn dùng tiếng Anh khi đặt yêu cầu', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao dữ liệu nhập vào công cụ AI công cộng có thể là rủi ro?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có rủi ro gì', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Có thể được lưu trữ hoặc dùng để huấn luyện lại mô hình ngoài kiểm soát của doanh nghiệp', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ tốn thêm thời gian', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ ảnh hưởng đến tốc độ xử lý', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Yêu cầu (prompt) nào sau đây hiệu quả hơn?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, '“Viết cho tôi cái gì đó”', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, '“Tóm tắt báo cáo này thành 5 gạch đầu dòng, tập trung vào số liệu quan trọng”', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, '“Giúp tôi với”', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, '“Làm việc gì đó hay ho”', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Trước khi dán một văn bản công việc vào công cụ AI công cộng, nên làm gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần làm gì cả', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Loại bỏ thông tin nhạy cảm như tên khách hàng, số liệu tài chính', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Dịch sang tiếng Anh trước', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chụp ảnh màn hình lại', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M6-F-CH3', 'Chương 3: Nhận biết cơ bản về đánh giá AI', 3, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M6-F-CH3-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Nhận diện được các yếu tố cơ bản của hệ thống AI cần được đánh giá</li><li>Mô tả được các chức năng chính của hệ thống AI</li><li>Giải thích được cách hoạt động của các hệ thống AI đơn giản</li><li>Tóm tắt được đặc điểm và ứng dụng của hệ thống AI</li></ul><h2>Định nghĩa</h2><ul><li>Ảo giác AI (AI hallucination): hiện tượng công cụ AI tạo ra thông tin nghe có vẻ hợp lý, tự tin, nhưng thực chất sai hoặc không có căn cứ thật</li><li>Kiểm tra chéo: việc đối chiếu kết quả AI đưa ra với một nguồn khác đáng tin cậy trước khi sử dụng</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M6-F-CH3-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Một trong những hiểu lầm phổ biến nhất về AI tạo sinh là tin rằng nó luôn đúng vì trả lời rất tự tin và trôi chảy. Thực tế, các công cụ AI tạo sinh có thể tạo ra thông tin sai lệch — gọi là hiện tượng “ảo giác AI” — mà không hề có dấu hiệu báo trước nào trong cách trình bày. AI có thể bịa ra một con số thống kê, một trích dẫn không tồn tại, hoặc một sự kiện chưa từng xảy ra, tất cả đều được viết với giọng văn chắc chắn như thể đó là sự thật đã kiểm chứng.</p><p>Nguyên nhân của hiện tượng này bắt nguồn từ chính cách AI hoạt động: nó dự đoán từ tiếp theo có khả năng xuất hiện cao nhất dựa trên mẫu hình đã học, không phải tra cứu một cơ sở dữ liệu sự thật đã được xác minh. Vì vậy, với các câu hỏi mà AI “không chắc chắn”, nó vẫn có xu hướng tạo ra một câu trả lời nghe hợp lý thay vì nói “tôi không biết”.</p><p>Kiểm tra chéo là biện pháp phòng vệ cơ bản nhất: với bất kỳ thông tin quan trọng nào AI đưa ra — đặc biệt số liệu, tên riêng, sự kiện cụ thể — nên tìm một nguồn độc lập khác để xác nhận trước khi sử dụng, đặc biệt khi thông tin đó sẽ được dùng trong công việc hoặc chia sẻ cho người khác.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M6-F-CH3-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Yêu cầu một công cụ AI trả lời một câu hỏi mà bản thân đã biết đáp án chính xác từ trước (ví dụ một sự kiện lịch sử công ty, một quy định nội bộ, hoặc một kiến thức chuyên môn quen thuộc). So sánh câu trả lời của AI với đáp án đã biết và nhận xét về độ chính xác.</p><p>Sản phẩm nộp: Bản so sánh kết quả AI với đáp án đã biết, ghi rõ điểm đúng/sai nếu có.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M6-F-CH3-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M6-F-CH3-QUIZ', 1, 'Quiz chương 3: Nhận biết cơ bản về đánh giá AI', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', '“Ảo giác AI” (AI hallucination) là hiện tượng gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'AI bị lỗi kỹ thuật không hoạt động được', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'AI tạo ra thông tin nghe hợp lý, tự tin nhưng thực chất sai hoặc không có căn cứ', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'AI hiển thị hình ảnh sai định dạng', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'AI phản hồi chậm hơn bình thường', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao AI có thể tạo ra thông tin sai mà không có dấu hiệu báo trước?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'AI luôn cố tình lừa dối', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'AI dự đoán từ tiếp theo có khả năng cao nhất, không tra cứu cơ sở dữ liệu đã xác minh', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'AI không có khả năng ngôn ngữ', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'AI chỉ hoạt động khi có lỗi', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Kiểm tra chéo kết quả AI có ý nghĩa gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần thiết nếu AI trả lời tự tin', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Đối chiếu kết quả AI với nguồn độc lập khác trước khi sử dụng', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần hỏi lại AI một lần nữa', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ áp dụng cho câu hỏi đơn giản', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khi nào đặc biệt cần kiểm tra chéo kết quả AI?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không bao giờ cần thiết', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Với thông tin quan trọng như số liệu, tên riêng, sự kiện cụ thể sẽ dùng trong công việc', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ khi AI trả lời chậm', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ khi dùng công cụ AI miễn phí', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao không nên tin tưởng tuyệt đối vào giọng văn tự tin của AI?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'AI luôn nói giọng không chắc chắn', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Giọng văn tự tin không đồng nghĩa với thông tin chính xác', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'AI không có khả năng viết tự tin', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có lý do cụ thể', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M6-F-FINAL', 'Đánh giá cuối khóa', 4, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M6-F-FINAL-A', 'Bài đánh giá cuối khóa', 'ASSIGNMENT', '<p>Sử dụng một công cụ AI để hỗ trợ một việc công việc thật, có kiểm tra chéo kết quả trước khi dùng chính thức.</p><p>Yêu cầu:</p><p>- Xác định công việc cần hỗ trợ và công cụ AI sẽ dùng - Đặt yêu cầu (prompt) cụ thể, ghi lại yêu cầu đã đặt - Đảm bảo không đưa thông tin nhạy cảm vào công cụ (nếu có, phải ẩn/loại bỏ trước) - Kiểm tra chéo ít nhất một thông tin quan trọng trong kết quả AI đưa ra - Viết nhận xét: kết quả AI có dùng được không, cần chỉnh sửa gì, có phát hiện sai lệch nào không Tiêu chí chấm:</p><p>Điểm đạt: ≥70/100.</p>', 60, 1, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M6-F-FINAL', 1, 'Đánh giá cuối khóa — ỨNG DỤNG AI CƠ BẢN', 'FINAL', true, 70, 1, 'PUBLISHED', v_admin_id, now(), now());
    END IF;
    RAISE NOTICE 'Done: M6-F';
    -- === M6-I ===
    SELECT id INTO v_course_id FROM courses WHERE code = 'M6-I' AND organization_id = v_org_id;
    IF v_course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM course_modules WHERE course_id = v_course_id) THEN
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M6-I-CH1', 'Chương 1: Hiểu biết AI ứng dụng vào công việc', 1, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M6-I-CH1-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Áp dụng được nguyên tắc cơ bản của AI để giải quyết vấn đề đơn giản</li><li>Thực hiện được thao tác cơ bản trên các công cụ AI</li><li>Phân tích được cách AI hoạt động trong các ứng dụng cụ thể</li><li>So sánh được các hệ thống AI khác nhau và cách chúng xử lý dữ liệu</li></ul><h2>Định nghĩa</h2><ul><li>Công cụ AI chuyên biệt: công cụ AI được thiết kế tối ưu cho một loại tác vụ cụ thể (viết, thiết kế hình ảnh, phân tích dữ liệu, dịch thuật), khác với công cụ AI đa năng</li><li>Đầu vào đa phương tiện (multimodal input): khả năng một số công cụ AI nhận nhiều loại dữ liệu đầu vào — văn bản, hình ảnh, âm thanh — cùng lúc</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M6-I-CH1-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Công cụ AI hiện nay không còn là một loại duy nhất — có công cụ chuyên viết văn bản, công cụ chuyên tạo hình ảnh từ mô tả, công cụ chuyên phân tích số liệu trong bảng tính, công cụ chuyên tạo bản trình chiếu, công cụ chuyên dịch thuật. Việc chọn đúng công cụ cho đúng loại việc quan trọng hơn việc chọn công cụ “nổi tiếng nhất” — một công cụ giỏi viết văn bản không nhất thiết giỏi phân tích số liệu.</p><p>So sánh các công cụ AI khác nhau cho cùng một loại việc là kỹ năng thực tế cần có: một số công cụ xử lý tiếng Việt tốt hơn công cụ khác, một số có giới hạn về độ dài văn bản đầu vào, một số miễn phí có giới hạn số lượt dùng trong ngày. Không có công cụ nào “tốt nhất tuyệt đối” cho mọi việc — chỉ có công cụ phù hợp hơn cho từng loại nhu cầu cụ thể.</p><p>Phân tích cách một công cụ AI hoạt động trong một ứng dụng cụ thể giúp hiểu rõ giới hạn của nó: ví dụ một công cụ tóm tắt văn bản có thể xử lý tốt văn bản dưới một độ dài nhất định, nhưng bắt đầu bỏ sót thông tin khi văn bản quá dài — hiểu được giới hạn này giúp dùng công cụ hiệu quả hơn thay vì kỳ vọng sai.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M6-I-CH1-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>So sánh 2-3 công cụ AI khác nhau cho cùng một tác vụ công việc cụ thể (ví dụ: tóm tắt văn bản, dịch thuật, hoặc tạo nội dung). Nhận xét công cụ nào phù hợp hơn và vì sao.</p><p>Sản phẩm nộp: Bảng so sánh công cụ AI (tiêu chí so sánh, kết quả từng công cụ, nhận xét).</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M6-I-CH1-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M6-I-CH1-QUIZ', 1, 'Quiz chương 1: Hiểu biết AI ứng dụng vào công việc', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao không nên dùng cùng một công cụ AI cho mọi loại việc?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có sự khác biệt giữa các công cụ AI', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Mỗi công cụ được tối ưu cho loại tác vụ khác nhau, không có công cụ nào tốt nhất tuyệt đối', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ nên dùng công cụ đắt tiền nhất', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Công cụ miễn phí luôn kém hơn công cụ trả phí', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Hiểu giới hạn của một công cụ AI (ví dụ giới hạn độ dài văn bản xử lý) có ích gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có ích gì thực tế', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Giúp dùng công cụ hiệu quả hơn, tránh kỳ vọng sai', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để biết thông tin kỹ thuật', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không liên quan đến công việc thực tế', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Công cụ AI chuyên biệt khác công cụ AI đa năng như thế nào?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có khác biệt gì', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Công cụ chuyên biệt được tối ưu cho một loại tác vụ cụ thể', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Công cụ chuyên biệt luôn đắt hơn', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Công cụ đa năng luôn tốt hơn công cụ chuyên biệt', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Khi cần phân tích một bảng dữ liệu lớn, nên ưu tiên loại công cụ AI nào?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Công cụ AI chuyên viết văn bản thông thường', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Công cụ AI chuyên phân tích dữ liệu, có thể đọc trực tiếp file bảng tính', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Bất kỳ công cụ nào cũng được', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không nên dùng AI cho việc này', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'So sánh nhiều công cụ AI cho cùng một việc mang lại lợi ích gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có lợi ích thực tế', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Giúp nhận biết công cụ nào phù hợp hơn với nhu cầu cụ thể', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để tốn thời gian', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Luôn cho kết quả giống nhau nên không cần so sánh', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M6-I-CH2', 'Chương 2: Sử dụng AI có đạo đức và trách nhiệm trong công việc', 2, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M6-I-CH2-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Sử dụng được công cụ AI trong công việc hằng ngày</li><li>Thực hành được kỹ năng sử dụng AI qua bài tập, dự án nhỏ</li><li>Xem xét được khía cạnh đạo đức khi sử dụng AI, bảo đảm không vi phạm quyền riêng tư</li><li>Tối ưu hóa được việc sử dụng công cụ AI để đạt hiệu quả cao hơn</li></ul><h2>Định nghĩa</h2><ul><li>Sử dụng AI có trách nhiệm: việc áp dụng AI vào công việc có cân nhắc đến quyền riêng tư, tính chính xác, và ghi nhận rõ phần nào do AI hỗ trợ tạo ra</li><li>Kỹ thuật đặt yêu cầu nâng cao (prompt engineering cơ bản): cách xây dựng yêu cầu có ngữ cảnh, ví dụ mẫu, và tiêu chí rõ ràng để cải thiện chất lượng kết quả AI</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M6-I-CH2-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Ở mức trung cấp, việc đặt yêu cầu (prompt) cần tinh chỉnh hơn mức cơ bản: cung cấp ngữ cảnh đầy đủ (ai là đối tượng đọc, mục đích sử dụng), đưa ra ví dụ mẫu nếu có (giúp AI hiểu đúng định dạng mong muốn), và chia nhỏ yêu cầu phức tạp thành các bước thay vì yêu cầu AI làm mọi thứ trong một lần.</p><p>Quy tắc bảo vệ dữ liệu khi dùng AI trong dự án cần cụ thể hơn mức cơ bản: xác định rõ loại dữ liệu nào tuyệt đối không được đưa vào công cụ AI (thông tin định danh khách hàng, số liệu tài chính chưa công bố, thông tin hợp đồng), và loại dữ liệu nào có thể dùng sau khi đã được ẩn danh hoặc tổng quát hóa.</p><p>Ghi nguồn khi dùng nội dung do AI tạo là thực hành có trách nhiệm cần hình thành: khi một phần đáng kể của tài liệu (báo cáo, bài viết, bản trình bày) được AI hỗ trợ tạo ra, nên ghi chú rõ ràng — điều này không chỉ minh bạch mà còn giúp người đọc biết cần kiểm tra kỹ hơn phần nào.</p><p>Tối ưu hóa việc sử dụng công cụ AI bao gồm việc học các tính năng nâng cao của công cụ đang dùng (lưu lại các yêu cầu hay dùng, tạo mẫu yêu cầu chuẩn cho công việc lặp lại), giúp tiết kiệm thời gian đáng kể so với việc gõ lại yêu cầu từ đầu mỗi lần.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M6-I-CH2-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Dùng AI hỗ trợ một dự án nhỏ của bộ phận (ví dụ: viết loạt nội dung, tổng hợp thông tin từ nhiều nguồn, soạn thảo tài liệu). Áp dụng quy tắc bảo vệ dữ liệu phù hợp trong quá trình thao tác, và ghi chú rõ phần nào có sự hỗ trợ của AI.</p><p>Sản phẩm nộp: Sản phẩm dự án nhỏ có hỗ trợ AI + ghi chú tuân thủ (loại dữ liệu đã dùng/tránh dùng, phần nào AI hỗ trợ).</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M6-I-CH2-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M6-I-CH2-QUIZ', 1, 'Quiz chương 2: Sử dụng AI có đạo đức và trách nhiệm trong công việc', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Kỹ thuật đặt yêu cầu nâng cao ở mức trung cấp khác gì so với mức cơ bản?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có gì khác biệt', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Cung cấp ngữ cảnh, ví dụ mẫu, chia nhỏ yêu cầu phức tạp thành các bước', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần viết ngắn gọn hơn', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần nêu rõ mục đích sử dụng', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao nên ghi nguồn khi một phần đáng kể tài liệu được AI hỗ trợ tạo ra?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần thiết', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Minh bạch và giúp người đọc biết cần kiểm tra kỹ hơn phần nào', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để tuân thủ hình thức', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Làm chậm quá trình làm việc', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Tạo mẫu yêu cầu chuẩn cho công việc lặp lại mang lại lợi ích gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có lợi ích gì', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tiết kiệm thời gian và cho kết quả đồng đều hơn so với gõ lại từ đầu mỗi lần', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ làm phức tạp thêm quy trình', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ phù hợp với công việc một lần', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Loại dữ liệu nào tuyệt đối không nên đưa vào công cụ AI công cộng khi làm dự án?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Nội dung đã công khai trên website công ty', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Thông tin định danh khách hàng, số liệu tài chính chưa công bố', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tiêu đề bài viết chung chung', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Cấu trúc một bài viết mẫu', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Sử dụng AI có trách nhiệm bao gồm điều gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần dùng AI càng nhiều càng tốt', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Cân nhắc quyền riêng tư, tính chính xác, và ghi nhận rõ phần AI hỗ trợ tạo ra', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần quan tâm đến quyền riêng tư', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ áp dụng khi có yêu cầu từ cấp trên', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M6-I-CH3', 'Chương 3: Đánh giá công cụ AI trong công việc', 3, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M6-I-CH3-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Phân tích được hiệu quả của hệ thống AI trong việc giải quyết vấn đề cụ thể</li><li>So sánh được hiệu suất của các hệ thống AI khác nhau</li><li>Đánh giá được độ chính xác và tin cậy của các hệ thống AI</li><li>Xem xét được kết quả và đưa ra nhận xét về hiệu quả của hệ thống AI</li></ul><h2>Định nghĩa</h2><ul><li>Độ chính xác (accuracy) của AI: mức độ kết quả AI đưa ra khớp với thực tế hoặc kỳ vọng đúng</li><li>Thiên lệch (bias) trong AI: xu hướng hệ thống AI cho kết quả lệch theo một hướng nhất định do dữ liệu huấn luyện không đại diện đầy đủ</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M6-I-CH3-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Đánh giá hiệu quả của một hệ thống AI trong công việc cần dựa trên tiêu chí cụ thể, không chỉ cảm nhận chung chung “thấy hay” hay “thấy dở”. Các tiêu chí thực tế bao gồm: độ chính xác của kết quả so với việc tự làm thủ công, thời gian tiết kiệm được, mức độ cần chỉnh sửa lại trước khi dùng, và tính nhất quán khi lặp lại nhiều lần cho cùng loại việc.</p><p>So sánh hiệu suất giữa các hệ thống AI khác nhau cho cùng một loại việc giúp xác định công cụ nào thực sự phù hợp với nhu cầu của bộ phận, thay vì chọn theo cảm tính hoặc theo công cụ đang được nhắc đến nhiều.</p><p>Thiên lệch (bias) là vấn đề cần lưu ý khi đánh giá AI: nếu dữ liệu huấn luyện của một hệ thống AI không đại diện đầy đủ (ví dụ chủ yếu dữ liệu tiếng Anh, ít dữ liệu tiếng Việt hoặc bối cảnh Việt Nam), kết quả có thể kém chính xác hoặc kém phù hợp hơn khi áp dụng vào bối cảnh trong nước — đây là điều cần kiểm tra khi đánh giá độ tin cậy của một công cụ trước khi áp dụng rộng rãi.</p><p>Đưa ra nhận xét có căn cứ về hiệu quả AI đòi hỏi ghi lại số liệu cụ thể (không chỉ ấn tượng chủ quan): ví dụ “công cụ A tiết kiệm khoảng 30% thời gian so với làm thủ công, nhưng cần chỉnh sửa lại khoảng 20% nội dung trước khi dùng” là nhận xét có căn cứ hơn nhiều so với “công cụ A dùng khá ổn”.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M6-I-CH3-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Đánh giá độ chính xác/tin cậy của một kết quả AI tạo ra cho một việc công việc cụ thể. Chỉ ra điểm cần kiểm tra lại hoặc chỉnh sửa trước khi dùng chính thức.</p><p>Sản phẩm nộp: Bản đánh giá kết quả AI (tiêu chí đánh giá, kết quả, điểm cần chỉnh sửa).</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M6-I-CH3-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M6-I-CH3-QUIZ', 1, 'Quiz chương 3: Đánh giá công cụ AI trong công việc', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Đánh giá hiệu quả AI nên dựa trên điều gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần cảm nhận chung chung', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tiêu chí cụ thể: độ chính xác, thời gian tiết kiệm, mức cần chỉnh sửa, tính nhất quán', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ dựa vào độ nổi tiếng của công cụ', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần đánh giá, cứ dùng là được', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Thiên lệch (bias) trong AI xuất phát từ đâu?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có nguyên nhân cụ thể', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Dữ liệu huấn luyện không đại diện đầy đủ cho các nhóm hoặc bối cảnh khác nhau', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ do lỗi kỹ thuật ngẫu nhiên', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ xảy ra với công cụ miễn phí', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao cần kiểm tra thiên lệch khi áp dụng AI cho bối cảnh Việt Nam?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần thiết', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Nhiều hệ thống AI huấn luyện chủ yếu trên dữ liệu tiếng Anh, có thể kém phù hợp với bối cảnh trong nước', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần dùng công cụ tiếng Việt là đủ', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Thiên lệch không ảnh hưởng đến kết quả thực tế', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Nhận xét nào sau đây có căn cứ hơn khi đánh giá AI?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, '“Công cụ này dùng khá ổn”', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, '“Công cụ tiết kiệm 30% thời gian nhưng cần chỉnh sửa lại 20% nội dung”', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, '“Công cụ này rất tốt”', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, '“Không có ý kiến gì đặc biệt”', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Trong ví dụ sàng lọc sơ yếu lý lịch bằng AI, cách xử lý thiên lệch phù hợp là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Ngừng hoàn toàn việc dùng AI', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Dùng AI như bước sàng lọc sơ bộ hỗ trợ, vẫn có người xem lại các trường hợp bị đánh giá thấp', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tin tưởng hoàn toàn kết quả AI', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần điều chỉnh gì', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M6-I-FINAL', 'Đánh giá cuối khóa', 4, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M6-I-FINAL-A', 'Bài đánh giá cuối khóa', 'ASSIGNMENT', '<p>Hoàn thành một dự án nhỏ của bộ phận có ứng dụng AI, kèm đánh giá độ tin cậy kết quả và tuân thủ quy tắc bảo vệ dữ liệu.</p><p>Yêu cầu:</p><p>- Chọn một dự án nhỏ thật của bộ phận, xác định công cụ AI phù hợp - So sánh tối thiểu 2 công cụ AI trước khi chọn (áp dụng Module 1) - Thực hiện dự án với AI hỗ trợ, tuân thủ quy tắc bảo vệ dữ liệu, ghi chú phần AI hỗ trợ (áp dụng Module 2) - Đánh giá độ chính xác/tin cậy kết quả, chỉ ra điểm cần chỉnh sửa (áp dụng Module 3) Tiêu chí chấm:</p><p>Điểm đạt: ≥70/100.</p>', 60, 1, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M6-I-FINAL', 1, 'Đánh giá cuối khóa — ỨNG DỤNG AI TRUNG CẤP', 'FINAL', true, 70, 1, 'PUBLISHED', v_admin_id, now(), now());
    END IF;
    RAISE NOTICE 'Done: M6-I';
    -- === M6-A ===
    SELECT id INTO v_course_id FROM courses WHERE code = 'M6-A' AND organization_id = v_org_id;
    IF v_course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM course_modules WHERE course_id = v_course_id) THEN
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M6-A-CH1', 'Chương 1: Đánh giá và định hướng ứng dụng AI', 1, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M6-A-CH1-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Đánh giá được hiệu quả của hệ thống AI trong việc giải quyết vấn đề cụ thể</li><li>Kiểm tra được giới hạn và tiềm năng của AI trong các lĩnh vực khác nhau</li><li>Tổng hợp được kiến thức để đề xuất cải tiến cho các hệ thống AI</li><li>Thiết kế được giải pháp AI phù hợp cho vấn đề phức tạp của tổ chức</li></ul><h2>Định nghĩa</h2><ul><li>Cường điệu công nghệ (hype): hiện tượng một công nghệ được truyền thông và thị trường thổi phồng vượt quá khả năng thực tế của nó tại thời điểm hiện tại</li><li>Điểm phù hợp ứng dụng (use-case fit): mức độ một công nghệ AI cụ thể thực sự giải quyết đúng vấn đề của tổ chức, không chỉ vì đang là xu hướng</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M6-A-CH1-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Đánh giá cơ hội ứng dụng AI ở cấp tổ chức đòi hỏi phân biệt rõ giữa cường điệu công nghệ và giá trị thực tế. Không phải mọi quy trình đều cần hoặc nên tích hợp AI — câu hỏi cốt lõi cần trả lời trước tiên là “AI có thực sự giải quyết một vấn đề cụ thể, đo lường được của doanh nghiệp hay không”, chứ không phải “mọi người đang nói về AI nên chúng ta cũng nên dùng”.</p><p>Xu hướng ứng dụng AI theo ngành khác nhau đáng kể: một số ngành (nội dung, marketing) có nhiều điểm ứng dụng AI trưởng thành và dễ tiếp cận; một số ngành khác (sản xuất, hậu cần) cần đầu tư hạ tầng lớn hơn để ứng dụng AI hiệu quả. Hiểu rõ vị trí ngành của doanh nghiệp mình trong bức tranh này giúp đặt kỳ vọng thực tế.</p><p>Kiểm tra giới hạn và tiềm năng của AI trong một lĩnh vực cụ thể của doanh nghiệp cần dựa trên bằng chứng — thử nghiệm thực tế, không chỉ dựa vào lời quảng cáo của nhà cung cấp công nghệ. Một cách tiếp cận có kỷ luật là: xác định rõ vấn đề, thử nghiệm AI trên quy mô nhỏ, đo lường kết quả bằng số liệu cụ thể, rồi mới quyết định mở rộng.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M6-A-CH1-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Đánh giá một cơ hội ứng dụng AI cụ thể cho một quy trình của doanh nghiệp. Xác định rõ vấn đề cần giải quyết, đánh giá điểm phù hợp ứng dụng, và đề xuất cách thử nghiệm quy mô nhỏ trước khi mở rộng.</p><p>Sản phẩm nộp: Báo cáo đánh giá cơ hội ứng dụng AI (vấn đề, điểm phù hợp, đề xuất thử nghiệm).</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M6-A-CH1-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M6-A-CH1-QUIZ', 1, 'Quiz chương 1: Đánh giá và định hướng ứng dụng AI', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Câu hỏi cốt lõi cần trả lời trước khi ứng dụng AI vào một quy trình là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, '“Mọi người đang dùng AI nên chúng ta cũng nên dùng”', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, '“AI có thực sự giải quyết một vấn đề cụ thể, đo lường được của doanh nghiệp không”', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, '“Công cụ AI nào đắt tiền nhất”', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, '“Đối thủ cạnh tranh có dùng AI không”', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Cường điệu công nghệ (hype) là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Một loại công nghệ AI mới', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Hiện tượng một công nghệ được thổi phồng vượt quá khả năng thực tế', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Một phương pháp đánh giá hiệu quả', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Một loại dữ liệu huấn luyện', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Cách tiếp cận có kỷ luật khi đánh giá ứng dụng AI là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Đầu tư ngay lập tức vào quy mô lớn', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Xác định vấn đề, thử nghiệm quy mô nhỏ, đo lường bằng số liệu, rồi mới quyết định mở rộng', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ dựa vào lời quảng cáo của nhà cung cấp', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần đánh giá, cứ triển khai', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Trong ví dụ về AI tạo hình ảnh sản phẩm, kết luận thực tế sau thử nghiệm là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'AI hoàn toàn thay thế được thiết kế viên', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'AI phù hợp làm bước tạo bản nháp ban đầu, không thay thế hoàn toàn công đoạn thiết kế', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'AI hoàn toàn không có giá trị', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có kết luận rõ ràng', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao xu hướng ứng dụng AI khác nhau giữa các ngành?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có sự khác biệt nào', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Mức độ trưởng thành và dễ tiếp cận của điểm ứng dụng AI khác nhau theo ngành', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ do sở thích của lãnh đạo doanh nghiệp', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'AI chỉ áp dụng được cho một ngành duy nhất', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M6-A-CH2', 'Chương 2: Lãnh đạo ứng dụng AI có trách nhiệm', 2, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M6-A-CH2-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Phát triển được ứng dụng AI tùy chỉnh để giải quyết vấn đề cụ thể</li><li>Điều chỉnh được hệ thống AI để phù hợp với nhu cầu cụ thể</li><li>Đánh giá và giảm thiểu được các rủi ro đạo đức và pháp lý liên quan đến việc sử dụng AI</li><li>Tích hợp được công cụ AI vào quy trình làm việc hiện có</li></ul><h2>Định nghĩa</h2><ul><li>Quy tắc sử dụng AI nội bộ: văn bản do doanh nghiệp ban hành quy định rõ ai được dùng AI cho việc gì, dữ liệu nào không được đưa vào, và trách nhiệm khi có sai sót</li><li>Trách nhiệm giải trình (accountability): nguyên tắc con người vẫn phải chịu trách nhiệm cuối cùng về quyết định, kể cả khi quyết định đó có sự hỗ trợ của AI</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M6-A-CH2-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Xây quy tắc sử dụng AI cho bộ phận hoặc toàn doanh nghiệp là bước cần thiết khi việc dùng AI trở nên phổ biến, không còn là hoạt động cá nhân tự phát. Quy tắc này cần nêu rõ: những công cụ AI nào đã được phê duyệt sử dụng, loại dữ liệu nào tuyệt đối không được đưa vào bất kỳ công cụ AI nào, quy trình phê duyệt khi muốn dùng một công cụ AI mới, và ai chịu trách nhiệm khi có sai sót phát sinh từ việc dùng AI.</p><p>Nguyên tắc trách nhiệm giải trình cần được khẳng định rõ ràng: dù một quyết định có sự hỗ trợ hoặc gợi ý từ AI, người ra quyết định cuối cùng vẫn là con người và vẫn phải chịu trách nhiệm về quyết định đó. “AI gợi ý như vậy” không phải là lý do biện minh hợp lệ khi có sai sót xảy ra — đây là nguyên tắc quan trọng cần được quán triệt trong văn hóa sử dụng AI của tổ chức.</p><p>Rủi ro pháp lý khi dùng nội dung AI tạo cho mục đích thương mại cần được đánh giá cẩn trọng: vấn đề quyền sở hữu nội dung do AI tạo ra hiện vẫn là vùng pháp lý chưa hoàn toàn rõ ràng ở nhiều nơi, và một số công cụ AI có thể tạo ra nội dung gần giống với tài liệu có bản quyền đã tồn tại mà không có cảnh báo. Doanh nghiệp nên thận trọng khi dùng nội dung AI tạo cho các mục đích thương mại quan trọng (logo, khẩu hiệu thương hiệu chính thức) và có bước rà soát trước khi công bố chính thức.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M6-A-CH2-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Soạn dự thảo quy tắc sử dụng AI có trách nhiệm cho bộ phận hoặc doanh nghiệp, bao gồm: công cụ được phê duyệt, dữ liệu cấm đưa vào AI, quy trình phê duyệt công cụ mới, và trách nhiệm giải trình.</p><p>Sản phẩm nộp: Dự thảo quy tắc sử dụng AI (văn bản, tối thiểu các mục nêu trên).</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M6-A-CH2-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M6-A-CH2-QUIZ', 1, 'Quiz chương 2: Lãnh đạo ứng dụng AI có trách nhiệm', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Nguyên tắc trách nhiệm giải trình trong sử dụng AI nghĩa là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'AI chịu trách nhiệm hoàn toàn về quyết định', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Con người vẫn chịu trách nhiệm cuối cùng về quyết định, dù có sự hỗ trợ từ AI', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không ai chịu trách nhiệm khi có sai sót', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Trách nhiệm thuộc về nhà cung cấp công cụ AI', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Quy tắc sử dụng AI nội bộ cần nêu rõ những gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần nêu tên công cụ AI', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Công cụ được phê duyệt, dữ liệu cấm đưa vào, quy trình phê duyệt, trách nhiệm khi sai sót', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần văn bản chính thức', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ áp dụng cho cấp quản lý', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao cần thận trọng khi dùng nội dung AI tạo cho mục đích thương mại quan trọng?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần thận trọng gì', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Vấn đề quyền sở hữu nội dung AI tạo ra còn chưa hoàn toàn rõ ràng về pháp lý', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Nội dung AI tạo luôn có bản quyền rõ ràng', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần thận trọng với nội dung miễn phí', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Trong ví dụ về hợp đồng khách hàng bị dán vào công cụ AI công cộng, bài học rút ra là gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không nên dùng AI nữa', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Cần có quy tắc rõ ràng về công cụ được phép dùng và dữ liệu cấm đưa vào', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần nhắc nhở nhân viên bằng miệng', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có bài học gì đặc biệt', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Nội dung công khai ra bên ngoài có hỗ trợ AI nên được xử lý như thế nào trước khi công bố?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Công bố ngay không cần kiểm tra', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Qua một người kiểm duyệt trước khi công bố chính thức', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần AI tự kiểm tra', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần quy trình gì đặc biệt', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M6-A-CH3', 'Chương 3: Xây dựng năng lực đánh giá AI cho tổ chức', 3, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M6-A-CH3-L1', 'Mục tiêu và khái niệm', 'TEXT', '<h2>Mục tiêu học tập</h2><ul><li>Phê phán được các khía cạnh kỹ thuật và đạo đức của hệ thống AI</li><li>Kiểm tra và xác minh được tính chính xác của các quyết định do hệ thống AI đưa ra</li><li>Đưa ra được khuyến nghị cải tiến cho hệ thống AI dựa trên kết quả đánh giá</li><li>Phát triển được tiêu chuẩn và hướng dẫn đánh giá hệ thống AI cho tổ chức</li></ul><h2>Định nghĩa</h2><ul><li>Tiêu chí đánh giá công cụ AI: bộ tiêu chuẩn có hệ thống dùng để so sánh và lựa chọn công cụ AI trước khi đưa vào sử dụng chính thức trong tổ chức</li><li>Thử nghiệm có kiểm soát (pilot): việc áp dụng một công cụ AI ở phạm vi hạn chế, có đo lường kết quả, trước khi quyết định mở rộng toàn tổ chức</li></ul>', 10, 1, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M6-A-CH3-L2', 'Nội dung lý thuyết', 'TEXT', '<h2>Nội dung</h2><p>Xây bộ tiêu chí đánh giá có hệ thống để lựa chọn công cụ AI cho tổ chức giúp tránh quyết định theo cảm tính hoặc theo quảng cáo của nhà cung cấp. Các tiêu chí nên bao gồm: độ chính xác trên bài kiểm tra thử với dữ liệu thật của tổ chức, mức độ bảo mật dữ liệu của nhà cung cấp (dữ liệu có được dùng để huấn luyện lại không, có được lưu trữ ở đâu), chi phí và mô hình tính phí, khả năng tích hợp với hệ thống hiện có, và chất lượng hỗ trợ kỹ thuật.</p><p>Quy trình thử nghiệm có kiểm soát trước khi áp dụng rộng là bước không thể bỏ qua: chọn một nhóm nhỏ người dùng, một phạm vi công việc giới hạn, chạy thử trong một khoảng thời gian xác định, thu thập phản hồi và số liệu cụ thể, rồi mới quyết định có mở rộng hay không. Cách làm này giảm thiểu rủi ro nếu công cụ không phù hợp như kỳ vọng, đồng thời tạo ra bằng chứng cụ thể để thuyết phục các bên liên quan khi cần mở rộng đầu tư.</p><p>Phát triển hướng dẫn đánh giá không chỉ dừng ở việc chọn công cụ ban đầu — cần có cơ chế đánh giá định kỳ sau khi đã triển khai, vì cả nhu cầu của tổ chức và bản thân công nghệ AI đều thay đổi nhanh, một công cụ phù hợp hôm nay có thể không còn là lựa chọn tốt nhất sau một năm.</p>', 15, 2, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M6-A-CH3-L3', 'Bài thực hành', 'TEXT', '<h2>Bài thực hành</h2><p>Xây bộ tiêu chí đánh giá có trọng số để lựa chọn công cụ AI áp dụng cho một nhu cầu cụ thể của doanh nghiệp, và thiết kế kế hoạch thử nghiệm có kiểm soát trước khi mở rộng.</p><p>Sản phẩm nộp: Bộ tiêu chí đánh giá công cụ AI (có trọng số) + kế hoạch thử nghiệm có kiểm soát.</p>', 15, 3, true, 'VIEW', 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M6-A-CH3-Q', 'Trắc nghiệm tự kiểm tra', 'QUIZ', 10, 4, false, 'PASS_CHECK', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M6-A-CH3-QUIZ', 1, 'Quiz chương 3: Xây dựng năng lực đánh giá AI cho tổ chức', 'QUIZ', false, 60, null, 'PUBLISHED', v_admin_id, now(), now());
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao nên xây bộ tiêu chí đánh giá có hệ thống thay vì chọn công cụ AI theo cảm tính?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có sự khác biệt về kết quả', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Tránh quyết định theo quảng cáo, đảm bảo lựa chọn có căn cứ khách quan', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để tốn thêm thời gian', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần thiết nếu công cụ nổi tiếng', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 1);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Thử nghiệm có kiểm soát (pilot) trước khi áp dụng rộng có lợi ích gì?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có lợi ích cụ thể', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Giảm rủi ro nếu công cụ không phù hợp, tạo bằng chứng cụ thể để quyết định mở rộng', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ làm chậm quá trình triển khai', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần thiết nếu đã có tiêu chí đánh giá', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 2);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Trong ví dụ chọn công cụ AI chăm sóc khách hàng, vì sao doanh nghiệp không chọn công cụ có độ chính xác cao nhất?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Do nhầm lẫn trong đánh giá', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Vì đánh giá tổng thể theo nhiều tiêu chí có trọng số, không chỉ dựa vào một tiêu chí duy nhất', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Vì công cụ đó đắt hơn', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có lý do cụ thể', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 3);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Vì sao cần đánh giá định kỳ công cụ AI sau khi đã triển khai, không chỉ đánh giá một lần ban đầu?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không cần thiết một khi đã chọn xong', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Nhu cầu tổ chức và công nghệ AI đều thay đổi nhanh, công cụ phù hợp hôm nay có thể không còn tốt nhất sau này', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ để tăng thêm công việc', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Không có lý do liên quan đến hiệu quả', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 4);
    v_question_id := gen_random_uuid();
    INSERT INTO questions (id, bank_id, question_type, content, status, created_by_user_id, created_at, updated_at)
    VALUES (v_question_id, v_bank_id, 'MULTIPLE_CHOICE', 'Tiêu chí nào sau đây nên có trong bộ đánh giá công cụ AI cho tổ chức?', 'APPROVED', v_admin_id, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần xem giá cả', false, 1, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Độ chính xác, bảo mật dữ liệu, chi phí, khả năng tích hợp, chất lượng hỗ trợ kỹ thuật', true, 2, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần độ nổi tiếng của thương hiệu', false, 3, now(), now());
    INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), v_question_id, 'Chỉ cần ý kiến của một người quyết định', false, 4, now(), now());
    INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
    VALUES (v_assessment_id, v_question_id, 20, 5);
    v_module_id := gen_random_uuid();
    INSERT INTO course_modules (id, course_id, code, title, sort_order, is_required, status, created_at, updated_at)
    VALUES (v_module_id, v_course_id, 'M6-A-FINAL', 'Đánh giá cuối khóa', 4, true, 'ACTIVE', now(), now());
    INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes, sort_order, is_required, completion_rule, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_module_id, 'M6-A-FINAL-A', 'Bài đánh giá cuối khóa', 'ASSIGNMENT', '<p>Xây dựng bộ quy tắc và tiêu chí ứng dụng AI có trách nhiệm cho doanh nghiệp.</p><p>Yêu cầu:</p><p>- Đánh giá một cơ hội ứng dụng AI cụ thể cho doanh nghiệp, có đề xuất thử nghiệm quy mô nhỏ (áp dụng Module 1) - Soạn dự thảo quy tắc sử dụng AI có trách nhiệm cho doanh nghiệp (áp dụng Module 2) - Xây bộ tiêu chí đánh giá có trọng số để lựa chọn công cụ AI (áp dụng Module 3) Tiêu chí chấm:</p><p>Điểm đạt: ≥70/100, không tiêu chí nào dưới 50%.</p><p>Lưu ý gửi người triển khai: Toàn bộ nội dung Miền VI (Ứng dụng AI) là nội dung mới, chưa qua thẩm định chuyên môn. Đây là lĩnh vực công nghệ biến động nhanh — nội dung cần được rà soát và cập nhật định kỳ (đề xuất tối thiểu 6 tháng/lần), đặc biệt các ví dụ về công cụ cụ thể có thể nhanh chóng lỗi thời. Nội dung về rủi ro pháp lý liên quan bản quyền nội dung AI tạo ra (Module M6-A-2) nên được rà soát bởi chuyên gia pháp lý, vì đây là vùng pháp lý chưa ổn định tại nhiều quốc gia, bao gồm Việt Nam.</p>', 60, 1, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
    v_assessment_id := gen_random_uuid();
    INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final, passing_score, max_attempts, status, created_by_user_id, created_at, updated_at)
    VALUES (v_assessment_id, v_course_id, 'M6-A-FINAL', 1, 'Đánh giá cuối khóa — ỨNG DỤNG AI NÂNG CAO', 'FINAL', true, 70, 1, 'PUBLISHED', v_admin_id, now(), now());
    END IF;
    RAISE NOTICE 'Done: M6-A';
    RAISE NOTICE 'All courses seeded!';
END $$;

SELECT 'course_modules' AS tbl, count(*) FROM course_modules
UNION ALL SELECT 'lessons', count(*) FROM lessons
UNION ALL SELECT 'question_banks', count(*) FROM question_banks
UNION ALL SELECT 'questions', count(*) FROM questions
UNION ALL SELECT 'question_options', count(*) FROM question_options
UNION ALL SELECT 'assessments', count(*) FROM assessments
UNION ALL SELECT 'assessment_questions', count(*) FROM assessment_questions;