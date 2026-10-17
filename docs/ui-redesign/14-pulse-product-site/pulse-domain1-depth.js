/* Expanded, authored teaching decks. Visuals are semantic HTML diagrams, never unrelated stock art. */
(function () {
  const domain = window.PulseDomain1;
  if (!domain) return;
  const V = (type, title, rows, caption) => ({ type, title, rows, caption });
  const S = (tag, title, body, prompt, visual) => ({ tag, title, body, prompt, visual });

  domain.accountingPhoto = (tier, moduleIndex, slideIndex, prefix = 'assets/domain1-accounting') => {
    const level = { 1: 'f', 2: 'i', 3: 'a' }[tier];
    const variant = { 0: '', 3: '-v2', 6: '-v3', 8: '-v4' }[slideIndex]
      ?? `-s${String(slideIndex + 1).padStart(2, '0')}`;
    return `${prefix}/m1-${level}-m${String(moduleIndex + 1).padStart(2, '0')}${variant}.png`;
  };

  // The teaching method is shared across positions. Reuse those photographs,
  // but replace visibly financial scenes in other roles and give each job case
  // its own image. The diagram and copy still carry the exact teaching detail.
  const sharedPhotoOverrides = {
    '1-0-0': [2, 0, 0], '1-0-2': [2, 0, 4], '1-0-3': [2, 0, 3],
    '1-0-7': [2, 0, 7], '1-0-8': [1, 1, 7],
    '1-0-9': [2, 0, 9], '1-0-10': [2, 0, 10],
    '1-2-0': [2, 2, 0], '1-2-3': [2, 2, 3], '1-2-8': [2, 2, 8],
    '2-1-0': [1, 1, 2], '2-1-1': [1, 1, 1], '2-1-3': [3, 1, 2],
    '2-1-4': [1, 1, 7], '2-1-5': [3, 1, 7],
    '2-1-8': [1, 1, 8],
    '3-0-0': [2, 0, 0], '3-0-2': [2, 0, 2],
    '3-0-3': [2, 0, 7], '3-0-8': [2, 0, 10], '3-0-9': [2, 2, 9],
    '3-1-0': [3, 0, 7], '3-1-2': [2, 1, 10],
    '3-1-3': [2, 1, 2], '3-1-4': [1, 1, 7],
    '3-1-8': [2, 2, 8], '3-1-9': [3, 2, 10],
    '3-2-9': [2, 2, 9]
  };

  domain.photoForTrack = (tier, moduleIndex, slideIndex, track, prefix = 'assets') => {
    if (track !== 'accounting' && ['marketing', 'hr', 'sales', 'ceo'].includes(track) && slideIndex === 6) {
      const level = { 1: 'f', 2: 'i', 3: 'a' }[tier];
      return `${prefix}/domain1-role-cases/${track}-m1-${level}-m${String(moduleIndex + 1).padStart(2, '0')}.png`;
    }
    const key = `${tier}-${moduleIndex}-${slideIndex}`;
    const shared = track === 'accounting' || (track === 'marketing' && key === '2-1-4')
      ? null : sharedPhotoOverrides[key];
    const [photoTier, photoModule, photoSlide] = shared || [tier, moduleIndex, slideIndex];
    return domain.accountingPhoto(photoTier, photoModule, photoSlide, `${prefix}/domain1-accounting`);
  };

  const overview = {
    1: [
      [
        V('steps', 'Từ nhu cầu đến truy vấn', [['01', 'Câu hỏi', 'Cần thông tin gì?'], ['02', 'Phạm vi', 'Đối tượng · kỳ · đơn vị'], ['03', 'Nguồn', 'Đường dẫn gốc']], 'Ba ô nối tiếp mô tả cách chuyển một yêu cầu công việc thành truy vấn có thể lặp lại.'),
        V('records', 'Hai truy vấn cùng một nhu cầu', [['Rộng', 'doanh thu', 'Quá nhiều kết quả'], ['Rõ hơn', 'doanh thu trực tuyến 09/2026', 'Có phạm vi và kỳ']], 'Minh họa truy vấn mơ hồ và truy vấn được thu hẹp bằng đối tượng, chỉ tiêu, thời gian.'),
        V('flow', 'Dấu vết nguồn', [['Kết quả tìm', 'Trang tóm tắt'], ['Tài liệu gốc', 'Đơn vị tạo dữ liệu'], ['Nhật ký', 'URL · ngày truy cập']], 'Sơ đồ lần ngược từ kết quả tìm kiếm về tài liệu gốc và nhật ký nguồn.')
      ],
      [
        V('records', 'Hồ sơ một nguồn', [['Tác giả', 'Ai tạo ra số liệu?'], ['Kỳ dữ liệu', 'Tháng nào, năm nào?'], ['Mục đích', 'Báo cáo hay quảng cáo?']], 'Phiếu kiểm nguồn gồm tác giả, kỳ dữ liệu và mục đích công bố.'),
        V('compare', 'Mới chưa chắc phù hợp', [['Nguồn A', 'Xuất hôm nay', 'Dữ liệu năm trước'], ['Nguồn B', 'Xuất tuần trước', 'Dữ liệu đúng kỳ cần']], 'Hai nguồn được so theo ngày xuất và kỳ dữ liệu, cho thấy ngày xuất mới không tự bảo đảm phù hợp.'),
        V('flow', 'Hai trang, một nguồn gốc', [['Trang A', 'Trích báo cáo X'], ['Trang B', 'Trích báo cáo X'], ['Nguồn gốc', 'Báo cáo X']], 'Hai trang dẫn cùng báo cáo X được gom về một nguồn gốc thay vì đếm thành hai bằng chứng độc lập.')
      ],
      [
        V('compare', 'Tệp để xử lý và tệp để đọc', [['Bảng tính', 'Lọc · tính · kiểm tra'], ['PDF', 'Đọc bản đã chốt']], 'Hai thẻ minh họa chọn định dạng theo mục đích xử lý tiếp hay chia sẻ bản cố định.'),
        V('records', 'Quy ước tên tệp', [['Kỳ', '2026-09'], ['Chủ đề', 'chung-tu_CP017'], ['Phiên bản', 'v01.pdf']], 'Tên tệp được ghép từ kỳ, chủ đề và phiên bản để sắp xếp, tra cứu.'),
        V('flow', 'Chuỗi bàn giao', [['Nguồn gốc', 'Tệp gốc'], ['Bản làm việc', 'Có phiên bản'], ['Người nhận', 'Đúng quyền']], 'Sơ đồ lưu bản gốc, tạo bản làm việc có phiên bản và chia sẻ đúng quyền.')
      ]
    ],
    2: [
      [
        V('steps', 'Kế hoạch tìm có điều kiện dừng', [['01', 'Câu hỏi', 'Đối tượng · kỳ · phạm vi'], ['02', 'Từ khóa', 'Chính · đồng nghĩa'], ['03', 'Dừng', 'Đủ nguồn cho quyết định']], 'Ba giai đoạn tạo kế hoạch tìm trước khi mở công cụ.'),
        V('records', 'Các toán tử có chức năng khác nhau', [['"…"', 'Khóa cụm từ'], ['site:', 'Giới hạn website/miền'], ['filetype:', 'Giới hạn định dạng']], 'Ba dòng ví dụ phân biệt lọc cụm từ, miền và định dạng trong truy vấn.'),
        V('timeline', 'Nhật ký truy vấn', [['09:00', 'Truy vấn rộng', 'Ít liên quan'], ['09:10', 'Thêm kỳ và site:', 'Đúng phạm vi'], ['09:20', 'Lưu nguồn', 'Có URL']], 'Trục thời gian cho thấy truy vấn được chỉnh và lý do dừng tìm.')
      ],
      [
        V('flow', 'Dòng gốc của chỉ số', [['Bản gốc', 'Hệ thống tạo dữ liệu'], ['Báo cáo', 'Tổng hợp từ bản gốc'], ['Bài viết', 'Diễn giải lại']], 'Sơ đồ phân biệt dữ liệu sơ cấp, báo cáo tổng hợp và bài diễn giải.'),
        V('compare', 'Cùng tên, khác cách đo', [['Báo cáo A', 'Tháng 9 · doanh thu gộp'], ['Báo cáo B', 'Tháng 9 · doanh thu thuần']], 'Hai cột doanh thu có cùng kỳ nhưng định nghĩa khác nên chưa so trực tiếp.'),
        V('decision', 'Kết luận có giới hạn', [['Dùng được', 'Định nghĩa khớp quyết định'], ['Chưa dùng', 'Chưa rõ kỳ hoặc phạm vi'], ['Việc tiếp', 'Xác minh nguồn gốc']], 'Ba trạng thái cho quyết định dùng, tạm giữ hoặc kiểm tra thêm một chỉ số.')
      ],
      [
        V('tree', 'Một cây thư mục nhất quán', [['Chiến dịch 2026', 'Thư mục gốc'], ['01_Nguồn', 'Tệp gốc'], ['02_Phân tích', 'Bản làm việc'], ['03_Duyệt', 'Bản chốt']], 'Cây thư mục ví dụ được sắp theo một nguyên tắc từ nguồn tới bản duyệt.'),
        V('records', 'Sổ đăng ký dữ liệu', [['Tên', 'KPI_09_2026'], ['Nguồn', 'Hệ thống gốc'], ['Phiên bản', 'v02 · 02/10/2026']], 'Ba trường mẫu trong sổ đăng ký liên kết tệp với nguồn và phiên bản.'),
        V('compare', 'Quyền theo nhiệm vụ', [['Người soạn', 'Được sửa bản làm việc'], ['Người duyệt', 'Được xem và duyệt'], ['Người đọc', 'Chỉ xem bản đã chốt']], 'Ba mức quyền minh họa nguyên tắc chỉ cấp quyền cần cho công việc.')
      ]
    ],
    3: [
      [
        V('decision', 'Nghiên cứu bắt đầu ở quyết định', [['Quyết định', 'Có mở rộng thị trường?'], ['Chỉ tiêu', 'Nhu cầu · chi phí · rủi ro'], ['Thời điểm', 'Trước kỳ ngân sách']], 'Khung quyết định xác định câu hỏi, tiêu chí và hạn trước khi thu thập.'),
        V('flow', 'Bản đồ nguồn độc lập', [['Bên ngoài', 'Bối cảnh thị trường'], ['Nội bộ', 'Bán hàng · tài chính'], ['Đối chiếu', 'Phương pháp · phạm vi']], 'Hai nhóm nguồn ngoài/nội bộ cùng đi vào bước đối chiếu; bản sao cùng nguồn không được tính độc lập.'),
        V('decision', 'Nơi chưa chắc chắn', [['Đã biết', 'Nguồn và định nghĩa rõ'], ['Giả định', 'Cần thử độ nhạy'], ['Thiếu', 'Cần thu thập tiếp']], 'Ba ô tách dữ liệu đã xác nhận, giả định và khoảng trống cần bổ sung.')
      ],
      [
        V('quality', 'Sáu chiều chất lượng', [['Đủ', 'Thiếu trường?'], ['Duy nhất', 'Mã trùng?'], ['Nhất quán', 'Hai nơi khác?'], ['Kịp thời', 'Dữ liệu cũ?'], ['Hợp lệ', 'Sai định dạng?'], ['Chính xác', 'Sai thực tế?']], 'Lưới sáu chiều giúp người học phân loại lỗi trước khi tính tỷ lệ.'),
        V('flow', 'Hai lớp kiểm soát', [['Phòng ngừa', 'Ràng buộc lúc nhập'], ['Phát hiện', 'Báo cáo ngoại lệ'], ['Xử lý', 'Giao người sửa']], 'Sơ đồ đi từ ngăn lỗi mới tới phát hiện lỗi cũ và giao xử lý.'),
        V('metrics', 'Bảng điểm có mẫu số', [['Mẫu kiểm', '100 giao dịch'], ['Thiếu mã', '2 giao dịch'], ['Tỷ lệ đủ', '98%']], 'Ba ô số chỉ rõ mẫu số 100, hai lỗi thiếu mã và tỷ lệ đủ 98%.')
      ],
      [
        V('records', 'Một mục từ điển dữ liệu', [['Tên', 'Doanh thu thuần'], ['Định nghĩa', 'Sau điều chỉnh hợp lệ'], ['Nguồn', 'Sổ cái đã chốt']], 'Phiếu từ điển dữ liệu làm rõ tên, định nghĩa và nguồn chính thức của chỉ số.'),
        V('steps', 'Ba vai trò', [['01', 'Chủ sở hữu', 'Phê duyệt định nghĩa'], ['02', 'Người quản lý', 'Theo dõi chất lượng'], ['03', 'Người dùng', 'Áp dụng đúng quy tắc']], 'Ba vai trò tách quyền phê duyệt, vận hành chất lượng và sử dụng dữ liệu.'),
        V('timeline', 'Vòng đời dữ liệu', [['Tạo', 'Ghi nguồn'], ['Dùng', 'Kiểm tra · chia sẻ'], ['Lưu', 'Bảo quản theo quy định'], ['Hủy', 'Theo chính sách áp dụng']], 'Trục vòng đời đi từ tạo đến hủy; không ngụ ý một thời hạn lưu giữ chung cho mọi dữ liệu.')
      ]
    ],
  };



  const extra = {
    1: [
      [
        S('04 / Tách yêu cầu', 'Biến lời nhờ mơ hồ thành câu hỏi tìm', 'Khi ai đó yêu cầu “tìm số liệu mới nhất”, hãy hỏi số liệu nào, cho đơn vị nào, kỳ nào và dùng để làm gì. Câu trả lời quyết định từ khóa cũng như nguồn có thẩm quyền. Nếu thiếu một trong các yếu tố này, hãy ghi giả định trước khi tìm.', 'Viết lại yêu cầu thành một câu có đối tượng, chỉ tiêu và kỳ.', V('compare', 'Hai yêu cầu', [['Mơ hồ', 'Tìm doanh thu mới nhất'], ['Có thể làm', 'Doanh thu online · 09/2026 · chi nhánh A']], 'So sánh lời nhờ mơ hồ với câu hỏi công việc có phạm vi kiểm tra được.')),
        S('05 / Chọn từ khóa', 'Tạo nhóm từ khóa rồi tinh chỉnh', 'Bắt đầu với danh từ chỉ đối tượng và chỉ tiêu, sau đó thêm thời gian hoặc mã nội bộ. Nếu kết quả quá rộng, thu hẹp phạm vi; nếu không có kết quả, thử tên đồng nghĩa hoặc bỏ bớt điều kiện. Lưu cả truy vấn đầu và truy vấn đã sửa để người khác lặp lại.', 'Nêu lý do đổi một từ khóa trong truy vấn.', V('steps', 'Vòng tinh chỉnh', [['1', 'Tìm rộng', 'Chủ đề chính'], ['2', 'Đọc kết quả', 'Xem lệch ở đâu'], ['3', 'Tinh chỉnh', 'Thêm kỳ · mã · nguồn']], 'Ba bước phản hồi cho thấy truy vấn được điều chỉnh dựa trên kết quả, không tìm tùy tiện.')),
        S('06 / Đọc kết quả', 'Không chọn nguồn vì đứng đầu danh sách', 'Dòng kết quả tìm kiếm chỉ cho biết tiêu đề, địa chỉ và đoạn trích. Mở tài liệu để kiểm tra người công bố, kỳ số liệu và phương pháp. Kết quả quảng cáo hoặc bản sao có thể hữu ích để định hướng, nhưng không trở thành nguồn gốc chỉ vì xuất hiện trước.', 'Chỉ ra ba dữ kiện cần xem sau khi mở kết quả.', V('records', 'Một kết quả cần kiểm tra', [['Tiêu đề', 'Báo cáo tháng 9'], ['Địa chỉ', 'Nơi đăng chưa rõ'], ['Cần mở', 'Tác giả · kỳ · tài liệu gốc']], 'Thẻ kết quả tìm kiếm minh họa thông tin hiện ra và thông tin phải kiểm tra tiếp.')),
        S('07 / Ca theo vị trí', 'Tìm đúng hồ sơ của công việc mình', 'Áp dụng cách tìm vào bộ dữ liệu của vị trí đang học. Ghi rõ mã, kỳ và nơi giữ tài liệu gốc; nếu chỉ có bản chụp hoặc bản chưa duyệt, hãy đánh dấu cần xác minh. Cùng một kỹ năng tìm kiếm sẽ cho câu hỏi và nguồn khác nhau ở Kế toán và Marketing.', 'Nêu nguồn đầu tiên sẽ mở và lý do.', V('records', 'Hồ sơ tình huống', [['Nguồn 1', 'Mã và kỳ'], ['Nguồn 2', 'Trạng thái duyệt'], ['Nguồn 3', 'Đường dẫn gốc']], 'Ba trường kiểm tra hồ sơ sẽ được thay bằng chứng cứ của đúng vị trí khi hiển thị.')),
        S('08 / Tự kiểm', 'Nộp nhật ký tìm ngắn gọn', 'Trước khi sang mô đun sau, hãy lưu câu hỏi ban đầu, hai truy vấn, nguồn cuối cùng và một nguồn đã loại cùng lý do. Một đồng nghiệp phải có thể lặp lại đường tìm mà không hỏi lại bạn. Đây là bước chuẩn bị trực tiếp cho bài cuối khóa.', 'Kiểm tra xem người khác có mở lại nguồn gốc từ nhật ký không.', V('steps', 'Sản phẩm của mô đun', [['01', 'Câu hỏi', 'Nêu phạm vi'], ['02', 'Nhật ký', 'Hai truy vấn'], ['03', 'Nguồn', 'URL · lý do chọn']], 'Ba thành phần của nhật ký tìm là câu hỏi, truy vấn và nguồn được chọn có lý do.'))
      ],
      [
        S('04 / Bằng chứng', 'Tách người đăng khỏi người tạo dữ liệu', 'Một bài tổng hợp có thể dẫn nguồn đáng tin nhưng vẫn diễn giải sai. Hãy lần về báo cáo do đơn vị tạo dữ liệu công bố, xem bảng và phần phương pháp. Ghi rõ đâu là dữ liệu, đâu là nhận định của tác giả và đâu là suy luận của mình.', 'Phân loại một câu trong tài liệu thành số liệu hay nhận định.', V('flow', 'Chuỗi truyền thông tin', [['Đơn vị tạo', 'Bảng gốc'], ['Người đăng', 'Bài tóm tắt'], ['Người học', 'Kết luận có dẫn nguồn']], 'Ba lớp thể hiện số liệu có thể bị diễn giải qua từng lần đăng lại.')),
        S('05 / Thời điểm', 'So ngày công bố với kỳ dữ liệu', 'Bài xuất hôm nay có thể dùng số liệu từ năm trước. Mỗi nguồn cần hai mốc: ngày tài liệu được công bố hoặc cập nhật và kỳ mà số liệu thực sự phản ánh. Quyết định cần số hiện tại thì nguồn quá cũ phải ghi rõ hạn chế, dù tổ chức xuất bản rất uy tín.', 'Đánh dấu nguồn đúng kỳ và nguồn cần bổ sung.', V('timeline', 'Hai mốc khác nhau', [['09/2025', 'Kỳ dữ liệu'], ['10/2026', 'Ngày xuất bài']], 'Trục thời gian cho thấy bài mới xuất nhưng dữ liệu bên trong cũ hơn một năm.')),
        S('06 / Độc lập', 'Hai đường link có thể cùng một bằng chứng', 'Trước khi nói đã kiểm tra chéo, xem hai trang lấy số từ đâu. Nếu cả hai trích báo cáo X, số nguồn độc lập là một. Muốn kiểm chứng mạnh hơn, tìm nguồn có cách thu thập riêng hoặc kiểm tra trực tiếp sổ/hệ thống gốc.', 'Vẽ mũi tên từ từng trang tới nơi tạo số liệu.', V('flow', 'Nguồn lặp không tăng độ chắc', [['Bài A', 'Dẫn X'], ['Bài B', 'Dẫn X'], ['Báo cáo X', 'Một nguồn gốc']], 'Hai bài A/B quy về cùng báo cáo X; sơ đồ không đếm thành hai xác nhận độc lập.')),
        S('07 / Ca theo vị trí', 'Chấm độ tin cậy trước khi dùng', 'Trong hồ sơ của vị trí, hãy so bản gốc, bản sao và bản chưa duyệt. Nguồn phù hợp phải đúng đối tượng, kỳ và trạng thái. Một ảnh chụp có thể giúp nhận ra vấn đề nhưng không thay thế tệp gốc có lịch sử/phiên bản.', 'Chọn một nguồn chính và ghi một điều còn nghi vấn.', V('compare', 'Ba lựa chọn nguồn', [['Bản gốc', 'Có mã · kỳ · duyệt'], ['Bản sao', 'Thiếu phiên bản'], ['Ảnh chụp', 'Khó truy vết']], 'Ba thẻ mô tả dấu vết khác nhau để người học so mức phù hợp của nguồn.')),
        S('08 / Tự kiểm', 'Viết nhận xét nguồn không tuyệt đối hóa', 'Ghi kết luận theo cấu trúc: nguồn này đủ dùng cho câu hỏi nào, vì sao và giới hạn ở đâu. Tránh gắn nhãn “đáng tin hoàn toàn” hoặc “sai hoàn toàn” nếu chưa kiểm tra phương pháp. Minh bạch giới hạn là một phần của năng lực đánh giá nguồn.', 'Viết hai câu đánh giá một nguồn, có điều kiện sử dụng.', V('decision', 'Ba phần nhận xét', [['Phù hợp', 'Đúng câu hỏi · kỳ'], ['Căn cứ', 'Có gốc · phương pháp'], ['Giới hạn', 'Điều chưa xác minh']], 'Khung nhận xét nguồn có phần dùng được, lý do và giới hạn chưa kiểm tra.'))
      ],
      [
        S('04 / Cây thư mục', 'Sắp theo một quy tắc mà cả nhóm hiểu', 'Chọn một trục chính như kỳ công việc hoặc dự án; bên dưới mới tách nguồn, bản làm việc và bản duyệt. Nếu một tệp hợp với hai thư mục, hãy dùng sổ đăng ký hoặc liên kết thay vì tạo hai bản không đồng bộ. Tên thư mục cần ngắn nhưng đủ phân biệt.', 'Vẽ cây ba tầng cho ca học của bạn.', V('tree', 'Thư mục mẫu', [['2026-09', 'Kỳ'], ['01_Nguồn', 'Tệp gốc'], ['02_Làm-việc', 'Bản đang sửa'], ['03_Duyệt', 'Bản chốt']], 'Cây thư mục minh họa một kỳ và ba trạng thái tài liệu thay vì nhiều bản rải rác.')),
        S('05 / Phiên bản', 'Đừng dùng tên “final_final”', 'Phiên bản nên tăng có quy tắc: v01 là bản đầu, v02 là bản sửa; ngày hoặc kỳ đứng đầu giúp sắp xếp. Giữ ghi chú ngắn về thay đổi quan trọng. Nếu tài liệu được duyệt lại, trạng thái duyệt là trường riêng, không chỉ suy từ tên tệp.', 'Đặt tên cho bản gốc và bản sửa của cùng tài liệu.', V('timeline', 'Hai bản có dấu vết', [['v01', 'Bản nhận'], ['v02', 'Sửa số liệu'], ['Duyệt', 'Có trạng thái riêng']], 'Trục phiên bản phân biệt số phiên bản với trạng thái phê duyệt.')),
        S('06 / Quyền xem', 'Chia sẻ theo nhiệm vụ', 'Trước khi gửi liên kết, hỏi người nhận cần xem hay sửa, trong bao lâu và có dữ liệu cá nhân không. Chia sẻ tệp đã duyệt để đọc nếu chỉ cần tham khảo; giữ thư mục nguồn và bản làm việc cho người có trách nhiệm. Không đưa tệp nhạy cảm vào kho công khai.', 'Chỉ định quyền xem/sửa cho hai người nhận khác nhau.', V('compare', 'Quyền tương ứng việc', [['Người kiểm tra', 'Xem bản chốt'], ['Người soạn', 'Sửa bản làm việc'], ['Công khai', 'Không chứa dữ liệu nhạy cảm']], 'Ba ví dụ gắn quyền với nhu cầu, theo nguyên tắc quyền tối thiểu.')),
        S('07 / Ca theo vị trí', 'Bàn giao một bộ hồ sơ tìm được', 'Tạo sổ ghi tên, mã, kỳ, nguồn và phiên bản cho các tệp trong ca học. Kiểm tra bản nào đã duyệt và bản nào chỉ là tài liệu tham khảo. Với Kế toán, giữ dấu vết chứng từ–bút toán; với Marketing, giữ mã chiến dịch–brief–báo cáo.', 'Nêu khóa tra cứu giúp đồng nghiệp tìm đúng bản.', V('records', 'Phiếu bàn giao', [['Mã', 'Khóa tra cứu'], ['Nguồn', 'Nơi tạo dữ liệu'], ['Trạng thái', 'Duyệt hay tham khảo']], 'Phiếu bàn giao thể hiện ba trường bắt buộc, sau đó bổ sung kỳ và phiên bản.')),
        S('08 / Tự kiểm', 'Thử tìm lại bằng mắt của đồng nghiệp', 'Giả sử bạn rời nhóm một tuần: người khác có biết tài liệu nằm đâu, bản nào được dùng và ai được hỏi khi số liệu sai không? Nếu câu trả lời là không, hãy sửa tên, sổ đăng ký hoặc quyền trước khi nộp. Khả năng tìm lại là tiêu chí thực tế của việc quản lý thông tin.', 'Tự tìm lại một tệp chỉ bằng mã và kỳ.', V('steps', 'Kiểm thử truy xuất', [['01', 'Có mã', 'Tìm trong sổ'], ['02', 'Có đường dẫn', 'Mở đúng bản'], ['03', 'Có chủ sở hữu', 'Hỏi khi cần']], 'Ba bước kiểm thử cho thấy một người khác có thể tìm và kiểm tra tài liệu.'))
      ]
    ]
,
    2: [
      [
        S('04 / Ma trận từ khóa', 'Tìm bằng các nhóm thuật ngữ', 'Lập bảng gồm khái niệm chính, từ đồng nghĩa, tên hệ thống, kỳ và điều cần loại trừ. Ví dụ “doanh thu” có thể là doanh thu gộp hoặc thuần; “truy cập” có thể là nhấp hay phiên. Từ khóa phải phản ánh định nghĩa bạn đang cần, không chỉ một từ nghe quen.', 'Ghi hai từ đồng nghĩa và một từ cần loại.', V('records', 'Ma trận truy vấn', [['Khái niệm', 'Doanh thu / phiên'], ['Đồng nghĩa', 'Tên cũ / tên mới'], ['Giới hạn', '09/2026 · nguồn chính']], 'Phiếu ma trận chứa ba nhóm từ giúp truy vấn vừa đủ rộng vừa đúng phạm vi.')),
        S('05 / Toán tử', 'Dùng cú pháp để thu hẹp, không để xác thực', 'Dấu ngoặc kép giữ nguyên cụm từ; site: thu hẹp trang hoặc miền; filetype: tìm định dạng. Kết hợp toán tử khi có lý do rõ, rồi mở từng kết quả để kiểm tra nguồn. Một PDF trên website uy tín vẫn có thể chứa số liệu không đúng kỳ hoặc không đúng câu hỏi.', 'Viết một truy vấn và nói từng toán tử làm gì.', V('records', 'Truy vấn minh họa', [['Cụm', '"báo cáo quý 3"'], ['Miền', 'site:gov.vn'], ['Dạng', 'filetype:pdf']], 'Ba thành phần hợp thành truy vấn; hình không khẳng định kết quả tìm được là đúng.')),
        S('06 / Nhật ký', 'Lưu cả kết quả không được chọn', 'Nhật ký tối thiểu có truy vấn, thời điểm, nguồn mở, lý do chọn hoặc loại và khoảng trống còn lại. Người khác cần hiểu vì sao báo cáo A được dùng thay B. Nếu tài liệu gốc không mở được, ghi trạng thái đó thay vì tự điền nội dung từ đoạn trích.', 'Viết một dòng nhật ký cho nguồn đã loại.', V('timeline', 'Ba lần thử có lý do', [['Lần 1', 'Rộng · nhiễu'], ['Lần 2', 'Thêm kỳ'], ['Lần 3', 'Nguồn gốc phù hợp']], 'Trục nhật ký thể hiện mỗi lần đổi truy vấn đều có lý do và kết quả.')),
        S('07 / Ca theo vị trí', 'Lập kế hoạch tìm phục vụ quyết định', 'Trong ca của vị trí, ghi quyết định cần hỗ trợ rồi tìm ít nhất hai hệ thống nguồn có định nghĩa rõ. Kế toán có thể cần sổ cái và hóa đơn; Marketing cần GA4 và nền tảng quảng cáo. Không trộn các chỉ tiêu khác đơn vị đếm vào một tổng.', 'Ghi một câu hỏi quyết định và hai nguồn cần truy.', V('flow', 'Từ quyết định tới nguồn', [['Câu hỏi', 'Chỉ tiêu cần đo'], ['Hệ thống A', 'Định nghĩa · kỳ'], ['Hệ thống B', 'Định nghĩa · kỳ']], 'Sơ đồ bắt đầu ở quyết định và nối tới hai hệ thống có điều kiện so sánh.')),
        S('08 / Tự kiểm', 'Biết khi nào ngừng tìm', 'Dừng khi đã có nguồn gốc đáp ứng đúng phạm vi, đủ căn cứ để trả lời và đã ghi giới hạn còn lại. Không dừng chỉ vì có con số đầu tiên; cũng không tìm vô hạn để loại mọi bất định. Nêu rõ điều gì sẽ khiến phải mở lại việc tìm kiếm.', 'Viết điều kiện dừng và một điều kiện mở lại.', V('decision', 'Quy tắc dừng', [['Đủ', 'Nguồn · kỳ · định nghĩa rõ'], ['Còn thiếu', 'Ghi khoảng trống'], ['Mở lại', 'Khi giả định đổi']], 'Ba ô quyết định cho biết khi nào kết thúc hoặc lặp lại quá trình tìm.'))
      ],
      [
        S('04 / Bảng so nguồn', 'So những thuộc tính tạo ra khác biệt', 'Lập mỗi hàng là một nguồn; các cột gồm người tạo, kỳ, phạm vi, đơn vị, phương pháp và tình trạng duyệt. Chỉ sau khi cột khớp mới so các con số. Nếu không khớp, nêu rõ khác biệt nào có thể giải thích chênh lệch và khác biệt nào cần xác minh.', 'Tạo ba cột so sánh quan trọng nhất của ca học.', V('compare', 'Hai bản ghi cần so', [['Bản A', 'Kỳ 09 · doanh thu gộp'], ['Bản B', 'Kỳ 09 · doanh thu thuần'], ['Điểm lệch', 'Định nghĩa chỉ tiêu']], 'Bảng so nhấn mạnh khác biệt định nghĩa trước khi tính chênh lệch.')),
        S('05 / Phạm vi đo', 'Không đồng nhất nhấp, phiên và người dùng', 'Một lượt nhấp quảng cáo là hành động trên nền tảng quảng cáo; phiên và người dùng là chỉ số của công cụ phân tích với phạm vi đo riêng. Chênh lệch không tự chứng minh lỗi. Cần kiểm tra thẻ đo, UTM, múi giờ, bộ lọc và phạm vi báo cáo trước khi giải thích.', 'Nói vì sao 1.200 nhấp không thể lấy trừ trực tiếp 980 phiên để kết luận mất 220 người.', V('metrics', 'Ba đơn vị khác nhau', [['Nhấp', '1.200 · nền tảng quảng cáo'], ['Phiên', '980 · GA4'], ['Người mới', '740 · GA4']], 'Ba ô số giả lập dùng ba đơn vị đếm khác nhau, không phải ba giai đoạn của cùng một phễu đã đối soát.')),
        S('06 / Giải thích chênh', 'Giả thuyết phải có phép kiểm tra', 'Với mỗi nguyên nhân dự đoán, ghi cách kiểm chứng. Nếu nghi lệch kỳ, so múi giờ và ngày chốt; nếu nghi thiếu UTM, kiểm tra liên kết; nếu nghi bản ghi trùng, xem mã giao dịch hoặc lead. Đừng kết luận lỗi hệ thống chỉ từ hai tổng không bằng nhau.', 'Viết một giả thuyết và phép thử tương ứng.', V('records', 'Giả thuyết có kiểm tra', [['Giả thuyết', 'Khác múi giờ'], ['Phép thử', 'So ngày theo cùng múi giờ'], ['Kết quả', 'Ghi số dòng thay đổi']], 'Phiếu giả thuyết buộc người phân tích nêu phép thử thay vì đoán nguyên nhân.')),
        S('07 / Ca theo vị trí', 'Chọn số phù hợp câu hỏi quản lý', 'Kế toán cần số phù hợp định nghĩa doanh thu và trạng thái hóa đơn; Marketing cần chỉ số đúng mục tiêu chiến dịch. Trình bày cả nguồn không chọn và lý do. Khi chưa thể hòa giải, dùng hai kịch bản có điều kiện hoặc nêu bước xác minh tiếp.', 'Chọn chỉ số cho quyết định và nêu một giới hạn.', V('decision', 'Khung báo cáo', [['Chỉ số dùng', 'Đúng định nghĩa'], ['Chỉ số chưa dùng', 'Khác phạm vi'], ['Giới hạn', 'Cần đối soát thêm']], 'Ba ô cho thấy lựa chọn số phải kèm lý do loại và giới hạn.')),
        S('08 / Tự kiểm', 'Viết một brief không che giấu bất định', 'Brief một trang nên có câu hỏi, bảng nguồn, chênh lệch được giải thích, điều chưa giải thích và khuyến nghị. Người đọc phải phân biệt quan sát thực tế với giả định. Dùng câu kết luận có điều kiện nếu một định nghĩa hoặc nguồn vẫn chưa được xác nhận.', 'Viết khuyến nghị hai câu với điều kiện áp dụng.', V('steps', 'Brief quyết định', [['01', 'Nguồn', 'Định nghĩa · kỳ'], ['02', 'Đối chiếu', 'Khớp và chưa khớp'], ['03', 'Đề xuất', 'Có điều kiện']], 'Ba phần cốt lõi của brief kết nối nguồn, phân tích và hành động.'))
      ],
      [
        S('04 / Phân loại', 'Một kho thông tin cần quy ước chung', 'Chọn cách phân loại phản ánh hành trình công việc: nguồn gốc, bản đang xử lý, bản duyệt và lưu trữ. Tránh để mỗi cá nhân tạo một cây riêng. Khi một tệp thuộc nhiều chủ đề, lưu một bản chính và dùng metadata hoặc liên kết để tìm lại, giảm trùng lặp.', 'Đề xuất thư mục gốc và ba thư mục con.', V('tree', 'Một bản chính', [['Kho dữ liệu', 'Gốc'], ['01_Nguồn', 'Bản chính'], ['02_Làm-việc', 'Bản phân tích'], ['03_Duyệt', 'Bản công bố']], 'Cây thư mục thể hiện một bản chính và các trạng thái xử lý.')),
        S('05 / Metadata', 'Sổ đăng ký giúp tìm bằng thuộc tính', 'Bên cạnh đường dẫn, ghi tên bộ dữ liệu, hệ thống nguồn, chủ sở hữu, kỳ, phiên bản, ngày cập nhật và mức nhạy cảm. Nhờ vậy người dùng biết bảng nào đã chốt và hỏi ai khi có sai lệch. Không dùng tên file “mới nhất” như một trường trạng thái đáng tin.', 'Chọn bảy trường sổ đăng ký cho ca học.', V('records', 'Một dòng sổ đăng ký', [['Bộ dữ liệu', 'Báo cáo kỳ 09'], ['Nguồn', 'Hệ thống chính'], ['Chủ sở hữu', 'Người chịu trách nhiệm'], ['Phiên bản', 'v02 · đã duyệt']], 'Dòng metadata mẫu làm rõ nguồn, người phụ trách và phiên bản của báo cáo.')),
        S('06 / Quyền và sao lưu', 'Quyền xem không đồng nghĩa quyền sửa', 'Gắn quyền cho vai trò thực tế: người soạn sửa bản làm việc, người duyệt đọc và phê duyệt, người nhận chỉ xem bản chốt. Kiểm tra nơi lưu bản sao và khả năng khôi phục. Đồng bộ tệp là cơ chế cập nhật giữa thiết bị, không thay thế kiểm tra sao lưu.', 'Phân hai quyền và một người chịu trách nhiệm sao lưu.', V('compare', 'Ma trận quyền', [['Soạn', 'Sửa bản làm việc'], ['Duyệt', 'Xem · xác nhận'], ['Nhận', 'Xem bản chốt']], 'Ba hàng quyền được gắn với nhiệm vụ cụ thể, không cấp quản trị cho mọi người.')),
        S('07 / Ca theo vị trí', 'Tổ chức hồ sơ để người khác kiểm tra', 'Với Kế toán, sổ đăng ký nối số chứng từ, bút toán và trạng thái điều chỉnh. Với Marketing, nối mã chiến dịch, nguồn GA4, quy ước UTM và thời điểm xuất báo cáo. Cả hai cần người phụ trách định nghĩa chỉ số, không chỉ một thư mục đẹp.', 'Ghi khóa liên kết giữa hai hệ thống của ca học.', V('flow', 'Khóa nối hồ sơ', [['Mã công việc', 'Chứng từ / chiến dịch'], ['Nguồn số', 'Sổ cái / GA4'], ['Bản phân tích', 'Có phiên bản']], 'Ba nút thể hiện khóa chung nối hồ sơ nghiệp vụ với nguồn số và bản phân tích.')),
        S('08 / Tự kiểm', 'Thử tình huống bàn giao nhóm', 'Một đồng nghiệp mới phải tìm được báo cáo đúng kỳ, mở nguồn gốc và biết ai phê duyệt mà không hỏi tác giả. Nếu không làm được, cần sửa sổ đăng ký, đường dẫn hoặc quyền. Đây là kiểm thử quản lý thông tin, không chỉ kiểm tra kỹ năng đặt tên.', 'Nhờ người khác tìm một bộ dữ liệu từ mã và kỳ.', V('steps', 'Kiểm tra bàn giao', [['01', 'Tìm', 'Theo mã · kỳ'], ['02', 'Mở', 'Đúng nguồn và bản'], ['03', 'Xác nhận', 'Người duyệt']], 'Ba bước kiểm thử giúp đánh giá kho thông tin có dùng được bởi người khác.'))
      ]
    ],
    3: [
      [
        S('04 / Thiết kế', 'Phân rã quyết định thành câu hỏi dữ liệu', 'Viết các phương án có thể chọn, điều kiện để chọn mỗi phương án và rủi ro của quyết định sai. Từ đó suy ra chỉ tiêu cần đo, nguồn và độ mới mong muốn. Không thu thập một trường dữ liệu chỉ vì nó sẵn có nếu không biết nó đổi quyết định nào.', 'Nêu một chỉ tiêu có thể làm đổi phương án.', V('decision', 'Cây quyết định nhỏ', [['Phương án A', 'Nếu nhu cầu và năng lực đủ'], ['Phương án B', 'Nếu chi phí vượt ngưỡng'], ['Tạm hoãn', 'Nếu dữ liệu chất lượng thấp']], 'Ba nhánh quyết định gắn điều kiện dữ liệu và lựa chọn hành động.')),
        S('05 / Nguồn độc lập', 'Phối hợp nguồn nhưng không đếm bản sao', 'Nguồn nội bộ cho thấy thực lực; nguồn ngoài cho bối cảnh hoặc chuẩn. Ghi hệ thống nào tạo số, ai xuất báo cáo và phương pháp. Nếu ba trang đều lấy một bảng, chúng là một đường nguồn. Cần ưu tiên nguồn thu thập độc lập cho kiểm tra chéo.', 'Vẽ sơ đồ nguồn gốc của ba báo cáo.', V('flow', 'Ba hệ thống, hai loại nguồn', [['Ngoài', 'Bối cảnh ngành'], ['Nội bộ A', 'Giao dịch'], ['Nội bộ B', 'Vận hành'], ['Quyết định', 'Đối chiếu phạm vi']], 'Sơ đồ ba nguồn đi vào cùng quyết định nhưng giữ rõ nguồn gốc từng hệ thống.')),
        S('06 / Giả định', 'Tính độ nhạy của kết luận', 'Nếu một chỉ số quan trọng chỉ là ước lượng, hãy tính kết luận trong ít nhất hai giả định hợp lý. Đánh dấu giả định nào khiến phương án đổi. Chỉ trình bày một con số đẹp sẽ che rủi ro; một khoảng có điều kiện giúp người ra quyết định biết cần thu thập gì tiếp.', 'Nêu một giả định làm đổi khuyến nghị.', V('compare', 'Hai kịch bản', [['Thận trọng', 'Chi phí cao · nhu cầu thấp'], ['Cơ sở', 'Theo dữ liệu đã xác nhận'], ['Điểm đổi', 'Ngưỡng quyết định']], 'Ba thẻ so hai kịch bản và chỉ ra điểm mà khuyến nghị có thể thay đổi.')),
        S('07 / Ca theo vị trí', 'Lập bản đồ nguồn cho đúng quyết định', 'Kế toán có thể nối sổ cái, hóa đơn và ngân hàng; Marketing nối GA4, quảng cáo và CRM. Với mỗi nguồn, ghi định nghĩa, kỳ, khóa nối và chất lượng sơ bộ. Nếu không có khóa nối tin cậy, không hợp nhất dòng dữ liệu bằng tên gần giống.', 'Nêu khóa nối nào đã xác minh và khóa nào chưa.', V('records', 'Bản đồ nguồn', [['Nguồn A', 'Chỉ tiêu · kỳ'], ['Nguồn B', 'Khóa nối · phương pháp'], ['Nguồn C', 'Giới hạn chất lượng']], 'Ba hàng nguồn phục vụ một quyết định, mỗi hàng có điều kiện đối chiếu.')),
        S('08 / Tự kiểm', 'Để lãnh đạo thấy cả điều chưa biết', 'Bản nghiên cứu cần một trang đầu nêu quyết định, kết quả chính, độ chắc chắn, giả định và việc cần làm tiếp. Phụ lục giữ bảng nguồn và phép tính để kiểm tra. Không dùng thuật ngữ “chắc chắn” khi dữ liệu còn thiếu hoặc các nguồn khác định nghĩa.', 'Viết một kết luận có mức tin cậy và điều kiện.', V('steps', 'Báo cáo điều hành', [['01', 'Quyết định', 'Nêu lựa chọn'], ['02', 'Căn cứ', 'Nguồn · bất định'], ['03', 'Điều kiện', 'Kiểm tra tiếp']], 'Ba phần của báo cáo điều hành giúp quyết định và giới hạn cùng hiện ra.'))
      ],
      [
        S('04 / Công thức', 'Mỗi chiều phải có phép đo', 'Ví dụ độ đầy đủ mã chứng từ bằng số giao dịch có mã chia tổng giao dịch cần mã. Tính duy nhất đo số mã không trùng; tính kịp thời so thời điểm cập nhật với hạn dùng. Ghi rõ mẫu số và ngoại lệ hợp lệ; một tỷ lệ không có mẫu số không đủ để ra quyết định.', 'Viết công thức và mẫu số cho một chiều.', V('metrics', 'Công thức độ đầy đủ', [['Có mã', '98 giao dịch'], ['Cần mã', '100 giao dịch'], ['Tỷ lệ', '98 / 100 = 98%']], 'Ba ô số giả lập thể hiện tử số, mẫu số và tỷ lệ đầy đủ mã chứng từ.')),
        S('05 / Phân biệt', 'Hợp lệ chưa chắc chính xác', 'Một email đúng cấu trúc có thể thuộc sai khách hàng: hợp lệ về định dạng nhưng sai thực tế. Một giao dịch giá trị lớn có thể là bất thường nhưng chưa chắc sai. Hãy kiểm tra bằng nguồn gốc và quy trình thay vì tự xóa những dòng khác thường.', 'Nêu một trường hợp hợp lệ nhưng sai thực tế.', V('compare', 'Hai loại kiểm tra', [['Hợp lệ', 'Đúng định dạng/quy tắc'], ['Chính xác', 'Đúng sự thật theo nguồn gốc'], ['Bất thường', 'Cần điều tra, chưa phải lỗi']], 'Ba thẻ phân biệt kiểm tra định dạng, đối chiếu thực tế và tín hiệu bất thường.')),
        S('06 / Kiểm soát', 'Chặn lỗi mới, tìm lỗi cũ', 'Kiểm soát phòng ngừa ở điểm nhập có thể buộc mã nguồn hoặc kiểm tra định dạng; kiểm soát phát hiện chạy báo cáo thiếu/trùng sau nhập. Với mỗi quy tắc phải có người nhận ngoại lệ, hạn xử lý và bằng chứng đã sửa. Nếu chỉ tạo cảnh báo mà không giao xử lý, chất lượng không cải thiện.', 'Viết một quy tắc phòng ngừa và một quy tắc phát hiện.', V('flow', 'Vòng kiểm soát', [['Nhập', 'Kiểm tra bắt buộc'], ['Sau nhập', 'Báo cáo ngoại lệ'], ['Sửa', 'Giao người · ghi dấu']], 'Sơ đồ ba bước cho thấy kiểm soát phòng ngừa và phát hiện cần bước xử lý cuối.')),
        S('07 / Ca theo vị trí', 'Ưu tiên lỗi ảnh hưởng quyết định', 'Kế toán ưu tiên mã chứng từ thiếu, mã trùng và khoản chưa khớp ngân hàng; Marketing ưu tiên lead trùng, nguồn thiếu và UTM không hợp lệ. Chọn ngưỡng theo tác động đến báo cáo, không theo một con số chung cho mọi ngành. Ghi rõ khi nào phải tạm dừng kết luận.', 'Chọn hai lỗi cần xử lý trước và vì sao.', V('quality', 'Bảng lỗi theo vị trí', [['Đầy đủ', 'Thiếu trường'], ['Duy nhất', 'Mã/lead trùng'], ['Kịp thời', 'Đồng bộ trễ'], ['Chính xác', 'Sai đối tượng']], 'Bốn ô chất lượng liên hệ trực tiếp với hồ sơ Kế toán hoặc Marketing của người học.')),
        S('08 / Tự kiểm', 'Đọc bảng điểm như một quyết định', 'Báo cáo chất lượng phải ghi bộ dữ liệu, thời điểm đo, mẫu số, số lỗi, tỷ lệ, ngưỡng và người xử lý. Nêu tác động: liệu còn đủ tin cậy để duyệt ngân sách hay chốt báo cáo không? Một bảng toàn màu xanh nhưng không có phép đo là hình trang trí, không phải minh chứng.', 'Viết một quyết định dùng/chưa dùng dữ liệu có điều kiện.', V('decision', 'Quyết định chất lượng', [['Đạt ngưỡng', 'Dùng có lưu vết'], ['Chưa đạt', 'Sửa và đo lại'], ['Chưa rõ', 'Nêu giả định']], 'Ba trạng thái sử dụng dữ liệu dựa trên kết quả đo, không dựa vào màu sắc đơn thuần.'))
      ],
      [
        S('04 / Từ điển', 'Định nghĩa chỉ số đủ để người khác tính lại', 'Một mục từ điển có tên, định nghĩa, công thức, tử số, mẫu số, đơn vị, kỳ, nguồn chính thức, chủ sở hữu và lịch sử thay đổi. Ví dụ “lead đủ điều kiện” cần điều kiện loại trùng và trạng thái xử lý; “doanh thu” cần cách xử lý hóa đơn hủy.', 'Viết định nghĩa và nguồn chính thức cho một chỉ số.', V('records', 'Mục từ điển tối thiểu', [['Tên', 'Chỉ số nghiệp vụ'], ['Cách tính', 'Tử số / mẫu số'], ['Nguồn', 'Hệ thống đã chốt'], ['Chủ sở hữu', 'Người phê duyệt']], 'Phiếu từ điển kết nối tên chỉ số với phép tính, nguồn và trách nhiệm.')),
        S('05 / Chủ sở hữu', 'Phân vai để lỗi có người giải quyết', 'Chủ sở hữu phê duyệt định nghĩa và mức chất lượng; người quản lý dữ liệu theo dõi lỗi và điều phối sửa; người vận hành tạo hoặc cập nhật bản ghi; người dùng báo sai lệch. Ghi ai có quyền đổi định nghĩa vì một thay đổi nhỏ có thể làm đứt chuỗi báo cáo.', 'Gán người phê duyệt và người xử lý lỗi khác nhau.', V('steps', 'Chuỗi trách nhiệm', [['01', 'Chủ sở hữu', 'Phê duyệt chuẩn'], ['02', 'Người quản lý', 'Theo dõi ngoại lệ'], ['03', 'Người vận hành', 'Sửa có dấu vết']], 'Ba vai trò tách quyết định chuẩn, theo dõi chất lượng và cập nhật dữ liệu.')),
        S('06 / Thay đổi', 'Phiên bản hóa định nghĩa, không sửa âm thầm', 'Khi đổi cách tính, ghi đề xuất, tác động tới báo cáo cũ, người duyệt, ngày hiệu lực và phiên bản mới. Giữ khả năng giải thích vì sao số tháng trước khác sau thay đổi. Không ghi đè từ điển mà không có lịch sử; người đọc có thể hiểu nhầm sự thay đổi là tăng trưởng thật.', 'Nêu ba thông tin bắt buộc trong nhật ký thay đổi.', V('timeline', 'Thay đổi có kiểm soát', [['v1', 'Định nghĩa cũ'], ['Duyệt', 'Tác động và người duyệt'], ['v2', 'Ngày hiệu lực rõ']], 'Trục phiên bản cho thấy định nghĩa mới cần phê duyệt và ngày áp dụng.')),
        S('07 / Ca theo vị trí', 'Thiết kế chuẩn cho bộ dữ liệu đang dùng', 'Với Kế toán, xác định nguồn chính thức của doanh thu, trạng thái hóa đơn và người xử lý đối chiếu; với Marketing, xác định lead đủ điều kiện, nguồn chiến dịch và người quản trị UTM. Quyền truy cập phải phù hợp mức nhạy cảm, nhất là thông tin khách hàng và tài chính.', 'Ghi một quy tắc truy cập và một quy tắc chất lượng.', V('flow', 'Từ chỉ số tới người chịu trách nhiệm', [['Định nghĩa', 'Công thức · kỳ'], ['Nguồn chính', 'Hệ thống đã chốt'], ['Chủ sở hữu', 'Phê duyệt và xử lý']], 'Sơ đồ nối chỉ số nghiệp vụ với nguồn chính thức và người chịu trách nhiệm.')),
        S('08 / Tự kiểm', 'Kiểm tra toàn vòng đời', 'Mô tả cách dữ liệu được tạo, xác minh, chia sẻ, lưu, lưu trữ và hủy theo chính sách áp dụng. Không đặt một thời hạn lưu chung trong bài học vì yêu cầu pháp lý và nghiệp vụ có thể khác. Bản cuối phải cho thấy cách duy trì chất lượng sau khi dự án phân tích kết thúc.', 'Nêu điểm kiểm soát ở lúc tạo và lúc kết thúc vòng đời.', V('timeline', 'Vòng đời có điểm kiểm soát', [['Tạo', 'Mã · nguồn'], ['Dùng', 'Quyền · chất lượng'], ['Lưu', 'Theo chính sách'], ['Hủy', 'Có phê duyệt']], 'Trục vòng đời chỉ vị trí cần kiểm soát, không tự quy định số năm lưu giữ.'))
      ]
    ]
  };

  const originalModulesFor = domain.modulesFor;
  domain.modulesFor = function (tier, track) {
    const modules = originalModulesFor(tier, track);
    return modules.map((module, moduleIndex) => {
      const opening = module.slides.map((slide, slideIndex) => ({
        ...slide, visual: overview[tier]?.[moduleIndex]?.[slideIndex]
      }));
      const roleFacts = domain.assignmentFor(tier, track).caseFacts || [];
      const deeper = (extra[tier]?.[moduleIndex] || []).map(slide => {
        if (!slide.tag.includes('Ca theo vị trí')) return { ...slide, source: module.source };
        const rows = roleFacts.length
          ? Array.from({ length: Math.min(3, roleFacts.length) }, (_, index) =>
              [`Dữ kiện 0${index + 1}`, roleFacts[(moduleIndex + index) % roleFacts.length]])
          : [['Nhiệm vụ', module.callout], ['Nguồn', 'Ghi tài liệu gốc và kỳ dữ liệu'], ['Sản phẩm', 'Có thể kiểm tra lại']];
        return {
          ...slide,
          body: `${slide.body} Trong tình huống ${domain.tracks[track]?.label || 'công việc'}: ${module.callout}`,
          visual: V('records', `Dữ kiện của ${domain.tracks[track]?.label || 'vị trí'}`, rows,
            'Bảng dữ kiện giả lập của đúng vị trí được dùng để luyện tập, không phải số liệu doanh nghiệp thật.'),
          source: module.source
        };
      });
      return { ...module, slides: [...opening, ...deeper], minutes: tier === 1 ? 35 : tier === 2 ? 45 : 55 };
    });
  };

  const escape = value => String(value ?? '').replace(/[&<>"']/g, character =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  domain.renderVisual = (visual, photo = '') => {
    if (!visual) return '';
    const rows = (visual.rows || []).map(([label, value, note], index) =>
      `<div class="domain1-figure-row"><span class="domain1-figure-index">${String(index + 1).padStart(2, '0')}</span><div>${/^\d+$/.test(String(label)) ? '' : `<strong>${escape(label)}</strong>`}<span>${escape(value)}</span>${note ? `<small>${escape(note)}</small>` : ''}</div></div>`
    ).join('');
    return `<figure class="domain1-slide-figure domain1-figure-${escape(visual.type)}${photo ? ' has-photo' : ''}" role="img" aria-label="${escape(visual.caption)}">
      ${photo ? `<div class="domain1-figure-photo"><img src="${escape(photo)}" alt="" loading="lazy" decoding="async"></div>` : ''}
      <div class="domain1-figure-content"><div class="domain1-figure-top"><span>HÌNH MINH HỌA · ${escape(visual.type === 'metrics' ? 'DỮ LIỆU' : visual.type === 'quality' ? 'CHẤT LƯỢNG' : visual.type === 'timeline' ? 'TIẾN TRÌNH' : 'QUY TRÌNH')}</span><i aria-hidden="true"></i></div>
      <strong class="domain1-figure-title">${escape(visual.title)}</strong><div class="domain1-figure-rows">${rows}</div>
      <figcaption>${escape(visual.caption)}</figcaption></div></figure>`;
  };

  const previousLessonPage = lessonPage;
  lessonPage = function (value, index) {
    const html = previousLessonPage(value, index);
    const course = parseCourse(value);
    if (course.domain !== 0 || !html.includes('Abstract learning journey artwork')) return html;
    const track = state.role === 'employee'
      ? domain.trackFor(employee())
      : state.domain1PreviewTrack || domain.trackFor(employee());
    const slides = domain.modulesFor(course.tier, track)[Math.min(2, Math.max(0, Number(index) || 0))].slides;
    const image = /<img src="\.\.\/assets\/learning-journey-abstract\.png" alt="Abstract learning journey artwork">/g;
    let visualIndex = 0;
    const updated = html.replace(image, () => {
      const slideIndex = visualIndex++;
      const photo = domain.photoForTrack(course.tier, Math.min(2, Math.max(0, Number(index) || 0)), slideIndex, track, '../assets');
      return domain.renderVisual(slides[slideIndex].visual, photo);
    });
    return updated
      .replace('Read all three slides to open this quiz.', `Đọc hết ${visualIndex} trang nội dung để mở câu hỏi ôn tập.`)
      .replace(/ Think of one task in [^<]*? where you could show the source, action and result\./,
        ' Hãy chọn một việc ở vị trí hiện tại để ghi rõ nguồn, thao tác và kết quả có thể kiểm tra.');
  };
})();
