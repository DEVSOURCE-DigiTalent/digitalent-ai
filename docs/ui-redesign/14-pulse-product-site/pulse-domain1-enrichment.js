/* Guided practice and worked examples for the nine Domain I modules. */
(function () {
  const domain = window.PulseDomain1;
  if (!domain) return;

  const practice = {
    1: [
      {
        title: 'Lập nhật ký tìm và truy nguồn',
        goal: 'Từ một yêu cầu mơ hồ, tạo truy vấn có phạm vi và dẫn được người khác tới nguồn gốc.',
        example: 'Yêu cầu “tìm số liệu tháng 9” chưa đủ để tìm. Viết lại thành “số đơn hàng trực tuyến của chiến dịch CAMP07 trong 01–30/09/2026 để so với báo cáo bán hàng”. Truy vấn đầu “đơn hàng CAMP07” còn rộng; truy vấn sau thêm kỳ và hệ thống nguồn. Nhật ký ghi cả hai truy vấn, đường dẫn báo cáo gốc, người xuất và thời điểm truy cập. Nếu chỉ thấy ảnh chụp, ghi trạng thái “chưa xác minh”, không tự tạo số.',
        steps: ['Viết câu hỏi công việc gồm đối tượng, chỉ tiêu, kỳ và mục đích.', 'Tìm tối đa ba lượt; ghi từ khóa ở mỗi lượt và vì sao đổi từ khóa.', 'Mở tài liệu gốc, ghi đơn vị tạo dữ liệu, ngày/kỳ và URL hoặc mã hồ sơ.', 'Nêu một kết quả bị loại và lý do; bàn giao nhật ký để người khác lặp lại.'],
        output: 'Nhật ký một trang: câu hỏi, tối đa ba lượt tìm, nguồn chọn, nguồn loại và giới hạn còn chưa xác minh.',
        checks: ['Truy vấn thứ hai khác có chủ đích so với truy vấn đầu.', 'Nguồn được chọn là nguồn gốc hoặc ghi rõ không tìm được nguồn gốc.', 'Người nhận có thể tìm lại tài liệu mà không hỏi người lập.'],
        mistake: 'Chọn kết quả đầu tiên hoặc ảnh chụp vì nhìn có vẻ đúng mà không giữ dấu vết nguồn.'
      },
      {
        title: 'Chấm độ phù hợp của ba nguồn',
        goal: 'Xếp hạng năm nguồn theo nguồn gốc, kỳ dữ liệu, mục đích và khả năng kiểm chứng trước khi dùng.',
        example: 'Có ba lựa chọn: báo cáo gốc đã duyệt của đúng kỳ; bài tóm tắt trích báo cáo đó; ảnh chụp bảng không ghi người xuất. Báo cáo gốc là nguồn chính. Bài tóm tắt hữu ích để định hướng nhưng không phải xác nhận độc lập. Ảnh chụp chỉ là dấu hiệu cần kiểm tra. Kết luận phải nêu báo cáo gốc phù hợp cho câu hỏi nào và điểm còn thiếu, ví dụ phương pháp chọn mẫu.',
        steps: ['Chọn năm kết quả cùng chủ đề; lập bảng tác giả/đơn vị tạo, ngày xuất, kỳ dữ liệu, phương pháp và mục đích.', 'Vẽ mũi tên từ bài tóm tắt và ảnh chụp về nguồn được trích, nếu có.', 'Xếp hạng năm nguồn; ghi nguồn nào chỉ dùng để định hướng và vì sao.', 'Viết hai câu kết luận: phạm vi sử dụng được và giới hạn cần xác minh.'],
        output: 'Bảng xếp hạng năm nguồn, mỗi nguồn có một câu giải thích và quyết định dùng/chưa dùng.',
        checks: ['Không đếm hai trang cùng trích một báo cáo là hai nguồn độc lập.', 'Phân biệt ngày đăng bài với kỳ số liệu.', 'Không dùng nhãn “đáng tin tuyệt đối” khi phương pháp chưa rõ.'],
        mistake: 'Coi nhiều đường link là nhiều xác nhận dù tất cả lấy từ một bảng gốc.'
      },
      {
        title: 'Thiết kế thư mục bàn giao có phiên bản',
        goal: 'Tổ chức bản gốc, bản làm việc và bản đã duyệt để truy xuất, phân quyền và đối chiếu.',
        example: 'Một bộ chứng từ mẫu gồm PDF gốc, bảng đối chiếu và bản xuất để đọc. Đặt tên theo kỳ–mã–chủ đề–phiên bản, ví dụ 2026-09_CP017_chung-tu_v01.pdf; không dùng “final_moi_nhat”. Giữ bản gốc ở thư mục chỉ đọc. Bản làm việc có phiên bản và người sửa; bản đã duyệt có ngày duyệt. Người kiểm tra chỉ cần quyền xem bản phù hợp.',
        steps: ['Phân loại tệp: bản gốc, bản làm việc, bản đã duyệt.', 'Viết quy ước tên gồm kỳ, mã/chủ đề, phiên bản và phần mở rộng.', 'Vẽ cấu trúc thư mục và gán quyền xem/sửa cho từng vai trò.', 'Mô phỏng đổi v01 thành v02 và ghi nguyên nhân thay đổi.'],
        output: 'Ảnh hoặc sơ đồ thư mục chứa ba tệp đặt tên theo quy ước, bảng quyền và một dòng nhật ký phiên bản.',
        checks: ['Bản gốc không bị ghi đè.', 'Tên tệp tự thể hiện được kỳ và phiên bản.', 'Người chỉ cần đọc không có quyền chỉnh sửa toàn bộ thư mục.'],
        mistake: 'Dùng tên “bản cuối” cho nhiều tệp và cấp quyền sửa cho bất kỳ ai có liên kết.'
      }
    ],
    2: [
      {
        title: 'Lập chiến lược tìm kiếm phục vụ quyết định',
        goal: 'Xác định câu hỏi, nguồn ưu tiên, truy vấn và điều kiện dừng trước khi tìm sâu.',
        example: 'Để so hiệu quả một chiến dịch theo tháng, không tìm “chiến dịch tốt không”. Hãy xác định quyết định cần hỗ trợ, kỳ, phạm vi, chỉ số và nơi tạo số liệu. Truy vấn có thể dùng cụm từ trong ngoặc kép, site: để giới hạn miền, filetype: để tìm PDF, dấu trừ để loại từ và OR viết hoa để thử hai thuật ngữ tương đương; sau đó vẫn phải mở tài liệu để xác nhận định nghĩa và kỳ. Dừng khi có đủ nguồn cho từng chỉ số hoặc ghi khoảng trống rõ ràng.',
        steps: ['Ghi một quyết định và hai chỉ số có thể làm đổi quyết định.', 'Lập ma trận từ khóa và ghi ít nhất năm lần tinh chỉnh truy vấn; dùng toán tử phù hợp, giải thích tác dụng.', 'Xếp thứ tự nguồn nội bộ/chính thức/thứ cấp; ghi lý do.', 'Lập tiêu chí dừng và nhật ký kết quả tìm/không tìm được.'],
        output: 'Kế hoạch tìm có ma trận từ khóa, ít nhất năm bước tinh chỉnh, nguồn và điều kiện dừng.',
        checks: ['Toán tử tìm kiếm được dùng để lọc, không được coi là xác nhận tính đúng.', 'Mỗi chỉ số có định nghĩa và kỳ cần tìm.', 'Khoảng trống nguồn được ghi lại thay vì tự điền số.'],
        mistake: 'Thu thật nhiều kết quả mà không biết kết quả nào phục vụ quyết định.'
      },
      {
        title: 'Lập bảng so hai báo cáo không đồng nhất',
        goal: 'Giải thích chênh lệch bằng định nghĩa, phạm vi, kỳ và trạng thái trước khi khuyến nghị.',
        example: 'Báo cáo A là doanh thu đã ghi nhận, báo cáo B là hóa đơn đã xuất. Hai tổng có thể lệch vì hóa đơn hủy hoặc thời điểm ghi nhận. Tương tự, lượt nhấp quảng cáo, phiên GA4 và người dùng mới là ba đơn vị đếm khác nhau; không lấy trung bình hay trừ trực tiếp để gọi là “sai lệch”. Bảng so phải có cột đơn vị đếm, kỳ, bộ lọc, trạng thái và nguồn gốc.',
        steps: ['Chọn ba nguồn cùng chủ đề; ghi số, đơn vị đếm và loại nguồn sơ cấp/thứ cấp.', 'So tác giả, thời điểm, mục đích, bằng chứng, khả năng kiểm chứng, định nghĩa và kỳ.', 'Truy một bản ghi/hóa đơn/chiến dịch mẫu để xác minh nguyên nhân chênh lệch.', 'Viết khuyến nghị có điều kiện và một bước đối soát tiếp.'],
        output: 'Ma trận ba nguồn theo năm tiêu chí, bảng giải thích chênh lệch và brief quyết định một trang.',
        checks: ['Không so trực tiếp các chỉ số khác phạm vi.', 'Mỗi nguyên nhân chênh lệch có bằng chứng hoặc được ghi là giả định.', 'Kết luận cho biết số nào dùng được cho câu hỏi nào.'],
        mistake: 'Lấy trung bình hai tổng khi một số gồm giao dịch hủy còn số kia không.'
      },
      {
        title: 'Tạo sổ đăng ký nguồn và ma trận quyền',
        goal: 'Giữ định nghĩa, chủ sở hữu và lịch sử thay đổi của các nguồn dùng trong báo cáo.',
        example: 'Sổ đăng ký cho một báo cáo cần ghi tên hệ thống, người tạo, định nghĩa chỉ số, kỳ, URL/mã tệp, phiên bản và người phê duyệt. Bảng đối chiếu chỉ người phụ trách được sửa; quản lý nhận bản đọc. Khi dữ liệu kỳ trước được cập nhật, tạo dòng phiên bản mới và nêu tác động tới kết luận cũ thay vì ghi đè âm thầm.',
        steps: ['Thiết kế cây thư mục tối đa bốn cấp và sổ đăng ký tối thiểu 20 tài liệu giả lập với tên, chủ đề, phiên bản, người phụ trách.', 'Gán chủ sở hữu, người duyệt và người chỉ xem; ghi nơi lưu bản sao có thể khôi phục.', 'Mô phỏng nguồn A đổi định nghĩa hoặc phiên bản; ghi tác động.', 'Kiểm tra một đồng nghiệp có thể dựng lại báo cáo theo sổ đăng ký và quy tắc phân loại.'],
        output: 'Ảnh hoặc sơ đồ thư mục tối đa bốn cấp, sổ đăng ký ít nhất 20 dòng, ma trận quyền và quy tắc phân loại.',
        checks: ['Nguồn có định nghĩa, kỳ và phiên bản.', 'Quyền sửa được giới hạn theo trách nhiệm.', 'Số cũ có thể giải thích sau khi nguồn thay đổi.'],
        mistake: 'Chia sẻ liên kết sửa cho cả phòng ban để “tiện” rồi không biết ai đổi dữ liệu.'
      }
    ],
    3: [
      {
        title: 'Thiết kế bản đồ nguồn cho một quyết định',
        goal: 'Chuyển quyết định thành chỉ số, nguồn, giả định và phép thử độ nhạy.',
        example: 'Quyết định mở rộng thị trường cần ít nhất hai phương án và điều kiện chọn. Nguồn thị trường cho bối cảnh, dữ liệu bán hàng cho nhu cầu thực tế, tài chính cho khả năng chi trả. Tam giác hóa đòi hỏi ít nhất ba nguồn gốc độc lập nếu muốn xác lập một khoảng có kiểm chứng; ba báo cáo cùng trích một bảng khảo sát chỉ là một nguồn gốc. Hãy tính kết luận dưới kịch bản cơ sở và thận trọng; chỉ ra giả định nào làm đổi phương án.',
        steps: ['Vẽ hai phương án và một điều kiện tạm hoãn.', 'Nối từng tiêu chí với ít nhất một nguồn nội bộ và một nguồn bên ngoài, kỳ và người sở hữu.', 'Đánh dấu nguồn sao chép, khóa nối chưa xác minh và dữ liệu còn thiếu.', 'Viết hai kịch bản, ngưỡng làm đổi khuyến nghị và mẫu hướng dẫn một đồng nghiệp kiểm tra lại nguồn.'],
        output: 'Cây quyết định, bản đồ nguồn và memo nêu giả định/độ bất định.',
        checks: ['Mỗi dữ liệu thu thập có vai trò trong quyết định.', 'Nguồn độc lập được phân biệt với bản sao.', 'Khuyến nghị nêu điều kiện và việc cần đo tiếp.'],
        mistake: 'Dùng một con số dự báo duy nhất mà không cho thấy giả định quan trọng.'
      },
      {
        title: 'Tính bảng điểm chất lượng có mẫu số',
        goal: 'Đo sáu chiều chất lượng, chọn ngưỡng và giao xử lý ngoại lệ.',
        example: 'Giả sử 100 giao dịch phải có mã chứng từ và 98 giao dịch có mã: độ đầy đủ là 98/100 = 98%. Một mã lặp ảnh hưởng tính duy nhất; email đúng cú pháp nhưng thuộc sai người ảnh hưởng tính chính xác. Ghi rõ mẫu số, kỳ đo, ngoại lệ hợp lệ và chủ sở hữu. Không tô ô xanh nếu chưa có phép đo; lỗi chưa giải quyết cần quyết định dùng dữ liệu có điều kiện hay tạm dừng.',
        steps: ['Chọn tập dữ liệu, thời điểm và sáu chiều: đầy đủ, duy nhất, nhất quán, kịp thời, hợp lệ, chính xác.', 'Viết tử số, mẫu số/ngưỡng và ít nhất sáu quy tắc kiểm tra có thể áp dụng; phân loại phòng ngừa hoặc phát hiện.', 'Phân loại một bất thường chưa xác minh và một lỗi đã xác nhận.', 'Giao người xử lý, hạn đo lại và quyết định dùng hoặc tạm dừng dữ liệu.'],
        output: 'Bảng điểm sáu chiều, ít nhất sáu quy tắc kiểm tra, danh sách ngoại lệ và kế hoạch kiểm soát.',
        checks: ['Tỷ lệ có cả tử số, mẫu số và kỳ.', 'Hợp lệ định dạng không bị nhầm với chính xác thực tế.', 'Mỗi ngoại lệ ưu tiên có người xử lý và hạn kiểm tra lại.'],
        mistake: 'Xóa dòng bất thường để bảng đẹp hơn mà không điều tra và lưu dấu vết.'
      },
      {
        title: 'Tạo từ điển chỉ số và kiểm soát thay đổi',
        goal: 'Định nghĩa một chỉ số để phòng ban khác tính lại được và biết ai chịu trách nhiệm.',
        example: '“Lead đủ điều kiện” không thể chỉ là tên cột; cần điều kiện đủ chuẩn, cách loại trùng, trạng thái, kỳ, nguồn chính thức và chủ sở hữu. Tương tự, “doanh thu” phải nêu xử lý hóa đơn hủy/điều chỉnh. Nếu thay điều kiện, ghi đề xuất, tác động tới số cũ, người duyệt, ngày hiệu lực và phiên bản. Truy cập dữ liệu nhạy cảm theo quyền phù hợp, không tự đặt một thời hạn lưu chung cho mọi tổ chức.',
        steps: ['Chọn một chỉ số có tranh cãi giữa hai phòng ban.', 'Tạo từ điển ít nhất mười trường, mỗi trường có định nghĩa, kiểu/giá trị hợp lệ, nguồn, mức nhạy cảm và chủ sở hữu.', 'Gán chủ sở hữu, người quản lý chất lượng và người vận hành; xác định nguồn chính thức.', 'Mô phỏng thay đổi v1→v2 và lập lịch lưu/hủy cho ba loại dữ liệu theo chính sách áp dụng.'],
        output: 'Từ điển tối thiểu 10 trường, ma trận ba vai trò, định nghĩa chỉ số thống nhất và lịch lưu/hủy cho ba loại dữ liệu.',
        checks: ['Một người ngoài nhóm có thể tính lại chỉ số từ định nghĩa.', 'Nguồn chính thức và quyền truy cập rõ ràng.', 'Thay đổi định nghĩa không bị nhầm với tăng/giảm thực tế.'],
        mistake: 'Sửa công thức trong dashboard nhưng không cập nhật từ điển và lịch sử.'
      }
    ]
  };

  const additionalCaseFacts = {
    hr: {
      1: ['Chính sách nghỉ phép v03 · hiệu lực 01/09/2026 · đã ban hành trên cổng nhân sự', 'Bản v02 · hiệu lực 01/01/2025 · còn nằm trong thư mục chia sẻ cũ', 'Ảnh chụp trao đổi trong chat không ghi mã văn bản hoặc ngày hiệu lực', 'Hồ sơ nhân viên mới NV024 cần hướng dẫn về quyền nghỉ phép hiện hành'],
      2: ['HRIS · chốt 30/09/2026 · 48 nhân viên trạng thái đang làm việc', 'Bảng lương tháng 09/2026 · 49 người có phát sinh lương', 'NV019 nghỉ ngày 20/09 nhưng vẫn có lương 20 ngày trong kỳ', 'Hai nguồn khác nhau về nghĩa “đang làm việc tại ngày chốt” và “có lương trong kỳ”'],
      3: ['HRIS giả lập · 100 hồ sơ · 3 hồ sơ thiếu mã nhân viên', '2 hồ sơ trùng mã theo bản xuất; cần xác minh có phải bản ghi lịch sử', '6 thay đổi trạng thái cập nhật sau hạn nội bộ 48 giờ', 'Hồ sơ chứa thông tin cá nhân; chỉ người được giao nhiệm vụ mới xem bản chi tiết']
    },
    sales: {
      1: ['CRM · KH102 · nhu cầu gói dịch vụ A · cập nhật 03/09/2026', 'Bảng giá v02 · hiệu lực tháng 09/2026 · đã duyệt · 10.000.000 đ', 'Bảng giá v03 · 9.500.000 đ · đang chờ duyệt', 'Ảnh báo giá cũ gửi qua chat không ghi mã khách hàng hoặc phiên bản'],
      2: ['CRM tháng 09/2026 · 80 lead mới; 32 chuyển thành cơ hội', 'Hệ thống đơn hàng · 18 đơn tạo; 17 hoàn tất và 1 đơn hủy', 'Báo cáo A gọi “chuyển đổi” là cơ hội/lead = 32/80', 'Báo cáo B gọi “chuyển đổi” là đơn hoàn tất/lead = 17/80'],
      3: ['CRM giả lập · 200 dòng lead · 8 mã khách hàng lặp cần kiểm tra', '15 dòng thiếu nguồn lead và 4 trạng thái đơn hàng chưa đồng bộ', 'Báo cáo chuyển đổi dùng định nghĩa đơn hoàn tất/lead đủ điều kiện', 'Sales Ops sở hữu định nghĩa; người bán chỉ sửa hồ sơ khách mình phụ trách']
    },
    ceo: {
      1: ['Báo cáo ngành công bố 10/2026 nhưng dùng số liệu thị trường năm 2025', 'Báo cáo bán hàng nội bộ kỳ 01–09/2026 có nguồn hệ thống CRM', 'Một slide họp ghi “thị trường tăng mạnh” nhưng không dẫn bảng gốc', 'Cuộc họp cần quyết định có mở nghiên cứu thị trường quý 4/2026'],
      2: ['Báo cáo ngoài dự báo tăng trưởng năm 2026 là 12% cho toàn ngành', 'Báo cáo nội bộ tăng 8% trong 9 tháng đầu 2026 cho một nhóm sản phẩm', 'Hai số khác phạm vi và kỳ; không thể lấy trung bình thành dự báo công ty', 'Quyết định thử thị trường cần thêm chi phí, biên lợi nhuận và kịch bản thận trọng'],
      3: ['Phương án A · mở rộng ngay · chi phí giả lập 2 tỷ đồng', 'Phương án B · thử nghiệm giới hạn · chi phí giả lập 500 triệu đồng', 'Dữ liệu cầu thị trường là ước lượng; dữ liệu vận hành nội bộ chưa cùng kỳ', 'Ban điều hành cần ngưỡng dừng, người sở hữu dữ liệu và lịch kiểm tra sau thử nghiệm']
    }
  };
  const originalAssignmentFor = domain.assignmentFor;
  domain.assignmentFor = function (tier, track) {
    const assignment = originalAssignmentFor(tier, track);
    const facts = additionalCaseFacts[track]?.[tier];
    const requirements = {
      1: [
        'Nêu nhu cầu và từ khóa; tìm 3 nguồn, ghi tác giả hoặc đơn vị, kỳ và lý do tin cậy của từng nguồn.',
        'Lưu ít nhất 1 tệp vào thư mục có tên và phiên bản; nộp ảnh hoặc sơ đồ thư mục.',
        'Viết 5 ý tóm tắt, mỗi ý ghi nguồn; bản tổng hợp tối đa 1 trang, kèm minh chứng thư mục.'
      ],
      2: [
        'Viết nhu cầu thông tin có phạm vi, thời gian, mức chi tiết và sản phẩm đầu ra; lập ma trận từ khóa.',
        'Ghi nhật ký ít nhất 8 truy vấn, sử dụng ít nhất 4 dạng toán tử hoặc cách lọc có giải thích.',
        'Thu thập 5 nguồn, trong đó ít nhất 2 nguồn sơ cấp; so sánh định nghĩa, kỳ và phương pháp của chỉ số quan trọng.',
        'Nộp brief 1 trang: điều đã biết, điều còn tranh cãi, con số hoặc khoảng giá trị khuyến nghị và lý do.'
      ],
      3: [
        'Lập kế hoạch nghiên cứu 4 bước, phối hợp nguồn nội bộ và bên ngoài, ghi khoảng trống và giả định.',
        'Chấm sáu chiều chất lượng bằng phép đo có tử số, mẫu số/ngưỡng; viết ít nhất 6 quy tắc kiểm tra và phân loại phòng ngừa hoặc phát hiện.',
        'Tạo từ điển tối thiểu 10 trường, phân vai chủ sở hữu, người quản lý dữ liệu và người vận hành; xác định nguồn chính thức.',
        'Lập lịch lưu trữ và hủy cho 3 loại dữ liệu theo chính sách áp dụng; viết khuyến nghị, độ tin cậy và giới hạn.'
      ]
    }[tier];
    const rubric = {
      1: [
        ['Từ khóa hợp lý, không chép nguyên câu hỏi', 20],
        ['3 nguồn có đánh giá độ tin cậy', 25],
        ['Tệp lưu đúng thư mục và tên quy ước', 20],
        ['5 ý tóm tắt có nguồn cho từng ý', 20],
        ['Trình bày rõ, đúng hạn', 15]
      ],
      2: [
        ['Nhu cầu thông tin đầy đủ, cụ thể', 20],
        ['Chiến lược tìm kiếm: ≥8 truy vấn, ≥4 toán tử', 25],
        ['Chất lượng nguồn: ≥2 sơ cấp, đánh giá đầy đủ', 20],
        ['Bảng so sánh, phát hiện khác biệt', 20],
        ['Khuyến nghị có căn cứ', 15]
      ],
      3: [
        ['Kế hoạch và thực hiện nghiên cứu đa nguồn', 25],
        ['Đánh giá chất lượng định lượng sáu chiều', 25],
        ['Bộ tài liệu quản trị hoàn chỉnh', 25],
        ['Báo cáo có khuyến nghị và giới hạn', 25]
      ]
    }[tier];
    return { ...assignment, caseFacts: facts || assignment.caseFacts, requirements, rubric };
  };

  const originalModulesFor = domain.modulesFor;
  domain.modulesFor = function (tier, track) {
    const assignment = domain.assignmentFor(tier, track);
    return originalModulesFor(tier, track).map((module, index) => {
      const spec = practice[tier][index];
      const role = domain.tracks[track]?.label || 'vị trí của bạn';
      const facts = assignment.caseFacts || [];
      const contextual = facts.length
        ? facts.slice(index, index + 2).concat(facts.slice(0, Math.max(0, index + 2 - facts.length)))
        : [assignment.situation, module.callout];
      const lab = { ...spec, minutes: tier === 1 ? 40 : tier === 2 ? 55 : 65,
        role, situation: assignment.situation, contextual, modulePrompt: module.callout };
      const newSlides = [
        { tag: '09 / Làm mẫu', title: `Làm mẫu · ${spec.title}`, body: `${spec.example} Trong tình huống ${role}: ${module.callout}`, prompt: 'Đánh dấu nơi ví dụ nêu nguồn, thao tác và giới hạn.', visual: { type: 'records', title: 'Dữ kiện để làm mẫu', rows: contextual.map((fact, n) => [`Nguồn ${n + 1}`, fact]), caption: `Dữ kiện giả lập của ${role} dùng để minh họa cách xử lý trong mô đun.` }, source: module.source },
        { tag: '10 / Thực hành', title: `Tự làm · ${spec.title}`, body: `${spec.goal} Thực hiện theo bốn bước: ${spec.steps.map((step, n) => `${n + 1}) ${step}`).join(' ')} Sản phẩm cần tạo: ${spec.output}`, prompt: 'Tạo sản phẩm trên dữ liệu mẫu hoặc dữ liệu công việc đã được phép sử dụng.', visual: { type: 'steps', title: 'Bốn bước thực hành', rows: spec.steps.map((step, n) => [String(n + 1).padStart(2, '0'), step]), caption: `Quy trình thực hành ${spec.title.toLowerCase()} có sản phẩm kiểm tra được.` }, source: module.source },
        { tag: '11 / Tự chấm', title: 'So sản phẩm với tiêu chí', body: `Sản phẩm cần đạt ba dấu hiệu: ${spec.checks.join(' ')} Lỗi thường gặp: ${spec.mistake} Nếu thiếu nguồn hoặc giả định chưa rõ, bổ sung trước khi chuyển sang quiz. Bài thực hành này giúp chuẩn bị minh chứng cho bài cuối khóa; quiz vẫn kiểm tra hiểu biết cá nhân.`, prompt: 'Đánh dấu tiêu chí chưa đạt và sửa một điểm cụ thể.', visual: { type: 'quality', title: 'Phiếu tự kiểm', rows: spec.checks.map((check, n) => [`Tiêu chí ${n + 1}`, check]), caption: 'Ba tiêu chí kiểm tra kết quả thực hành trước khi nộp bài cuối khóa.' }, source: module.source }
      ];
      return { ...module, practice: lab, slides: [...module.slides, ...newSlides], minutes: tier === 1 ? 45 : tier === 2 ? 55 : 65 };
    });
  };
  domain.capstoneMinutes = { 1: 60, 2: 60, 3: 90 };
  domain.glossary = {
    1: [
      ['Môi trường số', 'Không gian hoạt động và trao đổi dữ liệu qua Internet, phần mềm hoặc nền tảng số.'],
      ['Dữ liệu', 'Số hoặc dữ kiện được ghi nhận; cần ngữ cảnh và xử lý để trở thành thông tin hữu ích.'],
      ['Thông tin', 'Dữ liệu đã được tổ chức và diễn giải để người dùng hiểu hoặc ra quyết định.'],
      ['Điều hướng', 'Xác định vị trí và đường đi để truy cập đúng nội dung trong không gian số.'],
      ['Môi trường có cấu trúc', 'Nơi tài liệu/dữ liệu được sắp xếp theo quy tắc rõ để tìm và xử lý lại.']
    ],
    2: [
      ['Ma trận từ khóa', 'Bảng thuật ngữ chính, từ đồng nghĩa, giới hạn và từ cần loại cho một nhu cầu tìm.'],
      ['Nguồn sơ cấp', 'Nơi dữ liệu hoặc thông tin được tạo ra ban đầu.'],
      ['Nguồn thứ cấp', 'Nơi trích, tổng hợp hoặc diễn giải lại nguồn sơ cấp.'],
      ['Trích dẫn vòng', 'Nhiều bài cùng quy về một nguồn gốc, nhưng bị hiểu nhầm là nhiều xác nhận độc lập.'],
      ['Sổ đăng ký tài liệu', 'Bảng metadata về tên, phiên bản, kỳ, nguồn, chủ sở hữu và quyền của tài liệu.'],
      ['Quyền tối thiểu', 'Chỉ cấp quyền đủ để người dùng hoàn thành phần việc được giao.']
    ],
    3: [
      ['Tam giác hóa', 'Đối chiếu từ ít nhất ba nguồn gốc độc lập để tăng độ tin cậy của khoảng kết quả.'],
      ['Khoảng trống thông tin', 'Dữ liệu cần cho quyết định nhưng chưa có hoặc chưa kiểm chứng được.'],
      ['Sáu chiều chất lượng', 'Đầy đủ, duy nhất, nhất quán, kịp thời, hợp lệ và chính xác.'],
      ['Biện pháp phòng ngừa', 'Quy tắc chặn lỗi tại điểm tạo hoặc nhập dữ liệu.'],
      ['Biện pháp phát hiện', 'Kiểm tra sau khi dữ liệu đã vào hệ thống để tìm ngoại lệ.'],
      ['Từ điển dữ liệu', 'Tập định nghĩa trường/chỉ số, kiểu, giá trị hợp lệ, nguồn và trách nhiệm quản lý.'],
      ['Nguồn chính thức', 'Hệ thống được chỉ định làm nơi lấy giá trị được phê duyệt của một chỉ số.']
    ]
  };

  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
  domain.renderPractice = lab => `<section class="domain1-practice" aria-label="Thực hành có hướng dẫn"><div class="domain1-practice-head"><span>THỰC HÀNH · ${lab.minutes} PHÚT DỰ KIẾN</span><h2>${escape(lab.title)}</h2><p>${escape(lab.goal)}</p></div><div class="domain1-practice-body"><div><h3>Tình huống ${escape(lab.role)}</h3><p>${escape(lab.situation)}</p><ul>${lab.contextual.map(fact => `<li>${escape(fact)}</li>`).join('')}</ul></div><div><h3>Bốn bước thực hiện</h3><ol>${lab.steps.map(step => `<li>${escape(step)}</li>`).join('')}</ol></div><div class="domain1-practice-output"><strong>Sản phẩm cần tạo</strong><p>${escape(lab.output)}</p></div><details><summary>Xem ví dụ đã làm và tự kiểm</summary><p>${escape(lab.example)}</p><strong>Đối chiếu sản phẩm của bạn:</strong><ul>${lab.checks.map(check => `<li>${escape(check)}</li>`).join('')}</ul><p><strong>Lỗi cần tránh:</strong> ${escape(lab.mistake)}</p></details></div></section>`;

  const previousLessonPage = lessonPage;
  lessonPage = function (value, index) {
    const html = previousLessonPage(value, index);
    const course = parseCourse(value);
    if (course.domain !== 0 || !html.includes('pulse-slide-player') || !html.includes('data-slide="1"')) return html;
    const track = state.role === 'employee' ? domain.trackFor(employee()) : state.domain1PreviewTrack || 'accounting';
    const module = domain.modulesFor(course.tier, track)[Math.min(2, Math.max(0, Number(index) || 0))];
    const practiceHtml = domain.renderPractice(module.practice);
    return html.replace('<div class="pulse-module-reflection">', practiceHtml + '<div class="pulse-module-reflection">');
  };
})();
