/* Additional authored checks for Domain I. Each module now has five questions. */
(function () {
  const domain = window.PulseDomain1;
  if (!domain) return;
  const bank = {
    1: [
      [
        ['Yêu cầu nào đủ rõ để bắt đầu tìm?', ['Tìm mọi thứ về khách hàng', 'Tìm số đơn hàng kênh trực tuyến của tháng 9/2026 để đối chiếu báo cáo', 'Tìm kết quả mới nhất trên mạng'], 1, 'Cần có đối tượng, chỉ tiêu, kỳ và mục đích sử dụng.'],
        ['Một kết quả được tài trợ xuất hiện đầu danh sách. Bạn làm gì?', ['Dùng ngay vì đứng đầu', 'Bỏ hết kết quả được tài trợ', 'Mở và kiểm tra tác giả, nguồn gốc, kỳ dữ liệu như các kết quả khác'], 2, 'Vị trí quảng cáo không chứng minh nội dung đúng hoặc sai.'],
        ['Nhật ký tìm kiếm nào giúp đồng nghiệp lặp lại?', ['Chỉ ghi kết luận', 'Ghi câu hỏi, hai truy vấn đã thử, URL nguồn và lý do chọn', 'Chụp màn hình trang kết quả'], 1, 'Nhật ký phải giữ đường tìm và căn cứ chọn nguồn.']
      ],
      [
        ['Bài viết đăng hôm nay nhưng số liệu thuộc năm trước. Nhận xét nào đúng?', ['Luôn phù hợp vì mới đăng', 'Cần đối chiếu kỳ dữ liệu với kỳ của quyết định', 'Chỉ cần xem lượt chia sẻ'], 1, 'Ngày xuất bài và kỳ mà dữ liệu phản ánh là hai mốc khác nhau.'],
        ['Bài A và B đều trích báo cáo X. Có bao nhiêu nguồn gốc độc lập?', ['Một', 'Hai', 'Ba'], 0, 'Hai đường dẫn cùng quy về báo cáo X không tạo hai bằng chứng độc lập.'],
        ['Nhận xét nào về một nguồn là minh bạch nhất?', ['Nguồn này chắc chắn đúng mọi trường hợp', 'Nguồn này dùng được cho kỳ tháng 9, nhưng chưa rõ cách chọn mẫu', 'Nguồn này có biểu đồ đẹp'], 1, 'Đánh giá nguồn phải nói rõ phạm vi dùng được và giới hạn chưa xác minh.']
      ],
      [
        ['Bạn cần lưu một bản gốc và một bản để chỉnh sửa. Cách nào phù hợp?', ['Ghi đè bản gốc sau mỗi lần sửa', 'Giữ bản gốc, tạo bản làm việc có phiên bản và quyền phù hợp', 'Chỉ gửi cả hai qua chat'], 1, 'Bản gốc cần giữ dấu vết; bản làm việc cần phiên bản rõ.'],
        ['Đồng nghiệp chỉ cần đọc tài liệu đã chốt. Quyền nào là đủ?', ['Xem bản đã duyệt', 'Sửa tất cả tệp nguồn', 'Quản trị kho dữ liệu'], 0, 'Cấp quyền tối thiểu theo nhu cầu công việc.'],
        ['Tên tệp “final_moi_nhat2.xlsx” gây khó khăn chính gì?', ['Không thể mở bằng máy tính', 'Không thể nhận ra kỳ, nội dung và phiên bản một cách nhất quán', 'Tệp luôn quá lớn'], 1, 'Tên tệp có kỳ, chủ đề và phiên bản giúp tìm, sắp xếp và bàn giao.']
      ]
    ],
    2: [
      [
        ['Toán tử site: giúp việc gì?', ['Xác nhận mọi tài liệu trên trang đều đúng', 'Giới hạn kết quả theo website hoặc miền', 'Tìm tệp PDF ở mọi nơi'], 1, 'site: là bộ lọc phạm vi tìm, không phải phép xác thực.'],
        ['Truy vấn đầu cho quá nhiều kết quả. Bước tiếp theo hợp lý?', ['Bỏ câu hỏi công việc', 'Thêm kỳ, đối tượng hoặc từ đồng nghĩa rồi ghi lại thay đổi', 'Chỉ chọn kết quả đầu'], 1, 'Tinh chỉnh truy vấn có căn cứ và giữ nhật ký để lặp lại.'],
        ['Khi nào nên dừng tìm?', ['Ngay sau kết quả đầu tiên', 'Khi đã có nguồn đủ phù hợp cho quyết định và ghi rõ phần còn thiếu', 'Chỉ khi toàn bộ Internet được xem'], 1, 'Điều kiện dừng gắn với nhu cầu quyết định, không với số lượng kết quả tùy ý.']
      ],
      [
        ['Hai báo cáo cùng tên “doanh thu” nhưng khác tổng. Kiểm tra gì trước?', ['Màu biểu đồ', 'Định nghĩa gộp/thuần, kỳ, trạng thái giao dịch và phạm vi', 'Chọn số trung bình'], 1, 'Tên chỉ số giống nhau chưa bảo đảm cùng cách đo.'],
        ['Một ảnh biểu đồ không ghi kỳ và mẫu số. Bạn nên?', ['Dùng để chốt báo cáo', 'Tìm báo cáo gốc và xác nhận định nghĩa trước khi dùng', 'Ước lượng mẫu số theo hình'], 1, 'Bản gốc và phương pháp là căn cứ của con số.'],
        ['Khi chưa hòa giải được hai số, báo cáo nên viết gì?', ['Một số duy nhất không chú thích', 'Hai kịch bản có điều kiện cùng bước xác minh tiếp', 'Bỏ hẳn phần số liệu'], 1, 'Bất định cần thể hiện rõ cho người ra quyết định.']
      ],
      [
        ['Sổ đăng ký nguồn cần ghi bộ thông tin nào?', ['Tên nguồn, chủ sở hữu, kỳ, định nghĩa, phiên bản và quyền', 'Chỉ tên người tải', 'Chỉ đường dẫn chia sẻ công khai'], 0, 'Sổ đăng ký cần đủ thông tin truy vết và quản lý truy cập.'],
        ['Một tệp chứa dữ liệu nhân sự chỉ người phụ trách cần sửa. Thiết lập nào đúng?', ['Ai có link cũng sửa được', 'Người phụ trách sửa; người cần đối chiếu chỉ xem phần phù hợp', 'Không ai được xem kể cả người phụ trách'], 1, 'Quyền theo vai trò và nhu cầu sử dụng, tránh cấp rộng.'],
        ['Báo cáo tháng trước bị thay mà không ghi phiên bản. Rủi ro chính?', ['Màu sắc thay đổi', 'Không giải thích được vì sao kết quả cũ và mới khác nhau', 'Tên tệp ngắn hơn'], 1, 'Lịch sử thay đổi giúp kiểm tra và giải thích quyết định đã đưa ra.']
      ]
    ],
    3: [
      [
        ['Thiết kế nghiên cứu cho quyết định đầu tư nên bắt đầu từ đâu?', ['Thu mọi bảng đang có', 'Liệt kê phương án, ngưỡng quyết định, chỉ tiêu và nguồn cần kiểm', 'Vẽ biểu đồ trước'], 1, 'Câu hỏi quyết định định hướng việc cần đo và nguồn cần thu.'],
        ['Ba trang mạng đều sao chép cùng một bảng. Cách tính nguồn độc lập?', ['Ba nguồn', 'Một nguồn gốc; cần tìm cách thu thập độc lập nếu muốn kiểm tra chéo', 'Không có nguồn nào'], 1, 'Bản sao không tạo thêm bằng chứng độc lập.'],
        ['Một giả định làm đảo chiều khuyến nghị. Báo cáo nên?', ['Ẩn giả định', 'Trình bày hai kịch bản và ngưỡng làm đổi quyết định', 'Chỉ giữ kịch bản thuận lợi'], 1, 'Phân tích độ nhạy cho thấy điều kiện của khuyến nghị.']
      ],
      [
        ['Có 98/100 giao dịch đủ mã bắt buộc. Độ đầy đủ là?', ['98%', '2%', '100%'], 0, 'Tử số là 98 dòng đủ mã, mẫu số là 100 dòng cần mã.'],
        ['Một email đúng định dạng nhưng gắn sai người. Điều gì chưa đạt?', ['Tính hợp lệ định dạng', 'Tính chính xác so với thực tế', 'Tính kịp thời'], 1, 'Đúng cấu trúc không bảo đảm đúng đối tượng.'],
        ['Một cảnh báo lỗi được tạo nhưng không ai xử lý. Cần bổ sung gì?', ['Chỉ đổi màu cảnh báo', 'Chủ sở hữu, hạn xử lý và dấu vết sửa/đo lại', 'Xóa cảnh báo'], 1, 'Kiểm soát phát hiện chỉ hữu ích khi có luồng xử lý ngoại lệ.']
      ],
      [
        ['Mục từ điển cho chỉ số cần tối thiểu gì?', ['Tên và màu biểu đồ', 'Định nghĩa, công thức, kỳ, nguồn chính thức, chủ sở hữu', 'Chỉ tên người nhập dữ liệu'], 1, 'Người khác phải tính lại được và biết ai chịu trách nhiệm.'],
        ['Đổi công thức tính chỉ số. Hành động nào có kiểm soát?', ['Ghi đè mà không thông báo', 'Ghi tác động, người duyệt, ngày hiệu lực và phiên bản mới', 'Chỉ sửa ảnh biểu đồ'], 1, 'Lịch sử thay đổi giúp phân biệt thay đổi định nghĩa với thay đổi thực tế.'],
        ['Dữ liệu hết thời hạn sử dụng. Cách xử lý đúng?', ['Giữ mãi mọi bản sao', 'Theo chính sách áp dụng, xác định người phê duyệt và lưu dấu vết xử lý', 'Xóa tùy ý không ghi nhận'], 1, 'Vòng đời dữ liệu cần tuân thủ chính sách cụ thể của tổ chức và quy định áp dụng.']
      ]
    ]
  };
  const original = domain.modulesFor;
  domain.modulesFor = function (tier, track) {
    return original(tier, track).map((module, index) => ({
      ...module,
      questions: [...module.questions, ...bank[tier][index].map(([text, options, answer, reason]) => ({ text, options, answer, reason }))]
    }));
  };
  domain.quizQuestionsPerModule = 5;
})();
