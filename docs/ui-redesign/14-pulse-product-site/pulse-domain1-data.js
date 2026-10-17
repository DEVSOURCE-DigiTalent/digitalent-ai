/* Original teaching copy for Domain I. Sources and role adaptations are listed explicitly. */
window.PulseDomain1 = (() => {
  const sources = {
    moet: { title: 'Thông tư 02/2025/TT-BGDĐT · Khung năng lực số', url: 'https://datafiles.chinhphu.vn/cpp/files/vbpq/2025/01/02-bgddt.pdf' },
    digcomp: { title: 'Ủy ban châu Âu · DigComp 3.0', url: 'https://joint-research-centre.ec.europa.eu/scientific-activities/key-competences-lifelong-learning/digital-competence-framework-digcomp/digcomp-30_en' },
    search: { title: 'Google · Cách tinh chỉnh kết quả tìm kiếm', url: 'https://support.google.com/websearch/answer/2466433?hl=en' },
    quality: { title: 'Chính phủ Anh · Khung chất lượng dữ liệu', url: 'https://www.gov.uk/government/publications/the-government-data-quality-framework/the-government-data-quality-framework' },
    archive: { title: 'National Archives · Quy ước đặt tên tệp', url: 'https://www.archives.gov/records-mgmt/bulletins/2015/2015-04-appendix-b.html' },
    access: { title: 'NIST · Nguyên tắc quyền tối thiểu', url: 'https://csrc.nist.gov/glossary/term/least_privilege' },
    ga4: { title: 'Google Analytics · Báo cáo nguồn truy cập', url: 'https://support.google.com/analytics/answer/12923437?hl=en' },
    ga4scope: { title: 'Google Analytics · Người dùng và phiên truy cập', url: 'https://support.google.com/analytics/answer/14731736?hl=en' },
    ifrs: { title: 'IFRS Foundation · Khung báo cáo tài chính', url: 'https://www.ifrs.org/content/dam/ifrs/publications/pdf-standards/english/2021/issued/part-a/conceptual-framework-for-financial-reporting.pdf?bypass=on' }
  };

  const courses = {
    1: {
      code: 'M1-F', title: 'Tìm kiếm và lưu trữ thông tin cơ bản', hours: '6 giờ', framework: 'Bậc 1–2',
      outcome: 'Tìm đúng nguồn, kiểm tra dấu hiệu tin cậy và lưu lại tài liệu để người khác truy xuất được.',
      modules: [
        {
          title: 'Tìm kiếm thông tin bằng từ khóa', objective: 'Nêu nhu cầu thông tin, chọn từ khóa và tìm đến nguồn gốc.', source: 'search', minutes: 12,
          slides: [
            ['01 / Xác định', 'Biết mình cần tìm gì', 'Trước khi mở trình tìm kiếm, ghi rõ câu hỏi công việc, phạm vi, thời điểm cần số liệu và người sẽ dùng kết quả. Câu “cần thông tin thị trường” quá rộng; “số đơn hàng tháng 9 của kênh trực tuyến” có thể kiểm tra được.', 'Viết một câu nhu cầu thông tin có phạm vi và kỳ thời gian.'],
            ['02 / Tìm kiếm', 'Từ khóa thay cho câu hỏi dài', 'Công cụ tìm kiếm tra trong chỉ mục trang đã thu thập, không quét toàn bộ Internet ngay khi bạn gõ. Chọn 2–4 từ mang nghĩa chính: đối tượng, chỉ tiêu và thời điểm. Đọc tiêu đề, địa chỉ và mô tả của kết quả trước khi mở. Nhãn “Được tài trợ” nói về vị trí quảng cáo, không bảo đảm nội dung chính xác.', 'Ghi hai truy vấn: truy vấn đầu và truy vấn đã tinh chỉnh.'],
            ['03 / Truy vết', 'Đến tài liệu gốc', 'Đối chiếu trang tóm tắt với tài liệu do đơn vị tạo ra thông tin công bố. Ghi đường dẫn, tác giả hoặc đơn vị và ngày truy cập. Nếu không thấy tài liệu gốc, hãy ghi rõ giới hạn thay vì tự đoán.', 'Lưu nguồn gốc cùng nhật ký tìm kiếm.']
          ],
          question: ['Cách tìm nào có thể kiểm tra lại?', ['Gõ câu hỏi rất dài rồi chọn kết quả đầu', 'Ghi nhu cầu, dùng từ khóa chính và lưu đường dẫn nguồn', 'Chỉ đọc kết quả có nhãn quảng cáo'], 1, 'Truy vấn và nguồn gốc cần được ghi để người khác lặp lại việc tìm.']
        },
        {
          title: 'Nhận biết nguồn đáng tin cậy', objective: 'Nhận diện tác giả, thời điểm, mục đích và bằng chứng trước khi dùng thông tin.', source: 'digcomp', minutes: 12,
          slides: [
            ['01 / Nhận diện', 'Ai đứng sau thông tin?', 'Xem tên tổ chức, tác giả, tài liệu gốc và cách liên hệ. Tên miền chỉ là tín hiệu để xác định nơi xuất bản, không phải bằng chứng tự động rằng số liệu đúng.', 'Ghi người tạo dữ liệu và người đăng lại.'],
            ['02 / Kiểm tra', 'Thông tin có còn phù hợp?', 'Kiểm tra ngày công bố, kỳ dữ liệu, phương pháp và mục đích của bài viết. Một nguồn đáng tin ở chủ đề này có thể không phù hợp với câu hỏi khác. Bài không ghi nguồn hoặc chỉ giật tít cần được kiểm chứng thêm.', 'So thời điểm của nguồn với thời điểm quyết định.'],
            ['03 / Đối chiếu', 'Hai trang chưa chắc là hai nguồn', 'Nếu hai trang cùng trích một báo cáo, chúng không tạo thành hai bằng chứng độc lập. Mở liên kết về báo cáo gốc và ghi điểm trùng hoặc khác nhau trước khi kết luận.', 'Nêu một điểm còn chưa xác minh được.']
          ],
          question: ['Khi hai bài cùng ghi một con số, bạn nên làm gì?', ['Coi đó là hai xác nhận độc lập', 'Chọn bài có nhiều lượt xem hơn', 'Kiểm tra xem cả hai có cùng dẫn về một nguồn gốc không'], 2, 'Các trang cùng chép một báo cáo chỉ là một nguồn gốc dữ liệu.']
        },
        {
          title: 'Lưu trữ và sắp xếp tài liệu', objective: 'Lưu tệp có tên, phiên bản và vị trí có thể tìm lại.', source: 'archive', minutes: 12,
          slides: [
            ['01 / Định dạng', 'Chọn tệp đúng việc', 'Bảng tính phù hợp khi cần tính và lọc; PDF phù hợp khi cần chia sẻ bố cục cố định. Luôn giữ tệp gốc và ghi nơi lấy. Đừng biến ảnh chụp thành “dữ liệu gốc” nếu vẫn còn bảng nguồn.', 'Chọn định dạng phù hợp với việc xử lý tiếp theo.'],
            ['02 / Tổ chức', 'Tên tệp mô tả được nội dung', 'Dùng quy ước ổn định như năm-tháng-ngày_chủ-đề_phiên-bản. Đặt các thành phần ở cùng vị trí trong mọi tên tệp để sắp xếp và tìm lại. Tránh các tên “final2_moi_nhat”.', 'Đề xuất một tên tệp và thư mục dễ tra cứu.'],
            ['03 / Bàn giao', 'Giữ phiên bản và đường dẫn', 'Sổ ghi nguồn nên có tên, đường dẫn, người phụ trách, kỳ dữ liệu và phiên bản. Tài liệu nhạy cảm chỉ chia sẻ với người cần dùng. Khi sửa, tạo phiên bản mới hoặc ghi lịch sử thay đổi thay vì ghi đè không dấu vết.', 'Kiểm tra người nhận có quyền phù hợp.']
          ],
          question: ['Tên tệp nào dễ truy xuất và sắp xếp theo thời gian?', ['bao_cao_final_moi.xlsx', '2026-09_bao-cao-kpi_v01.xlsx', 'document1.xlsx'], 1, 'Tên nhất quán với kỳ, chủ đề và phiên bản dễ tìm lại hơn.']
        }
      ]
    },
    2: {
      code: 'M1-I', title: 'Chiến lược tìm kiếm và quản lý thông tin', hours: '7,5 giờ', framework: 'Bậc 3–4',
      outcome: 'Thiết kế chiến lược tìm, so sánh nguồn khác định nghĩa và tổ chức hồ sơ thông tin cho nhóm.',
      modules: [
        {
          title: 'Chiến lược tìm kiếm và toán tử', objective: 'Biến yêu cầu mơ hồ thành kế hoạch tìm có phạm vi và nhật ký.', source: 'search', minutes: 15,
          slides: [
            ['01 / Lập kế hoạch', 'Đặt câu hỏi trước khi tìm', 'Chốt đối tượng, chỉ tiêu, kỳ, địa bàn, mức chi tiết và sản phẩm cần nộp. Tạo ma trận từ khóa gồm thuật ngữ chính, từ đồng nghĩa và từ cần loại trừ. Ghi cả điều kiện dừng tìm khi đã đủ bằng chứng.', 'Viết nhu cầu thông tin theo sáu yếu tố.'],
            ['02 / Tinh chỉnh', 'Dùng toán tử có chủ đích', 'Dấu ngoặc kép tìm cụm từ chính xác; site: giới hạn miền; filetype: lọc định dạng; dấu trừ loại chủ đề không liên quan; OR viết hoa tìm một trong hai thuật ngữ. Toán tử giúp lọc kết quả nhưng không tự xác nhận độ tin cậy của tài liệu.', 'Lập hai truy vấn khác nhau cho cùng nhu cầu.'],
            ['03 / Nhật ký', 'Cho người khác lặp lại việc tìm', 'Ghi truy vấn, công cụ, thời điểm, số kết quả đáng xem và lý do đổi truy vấn. Chỉ giữ các nguồn trả lời đúng phạm vi và kỳ; đánh dấu phần chưa tìm được thay vì kéo dài tìm kiếm vô hạn.', 'Chọn một quy tắc dừng tìm có lý do.']
          ],
          question: ['Truy vấn nào giới hạn nguồn và định dạng?', ['"báo cáo thị trường" site:gov.vn filetype:pdf', 'báo cáo thị trường mới nhất đúng nhất', 'filetype pdf site gov vn báo cáo'], 0, 'site: và filetype: phải gắn liền với giá trị; dấu ngoặc kép khóa cụm từ.']
        },
        {
          title: 'Đánh giá và so sánh nguồn tin', objective: 'So tác giả, kỳ, định nghĩa, mục đích và nguồn gốc trước khi chọn chỉ số.', source: 'digcomp', minutes: 15,
          slides: [
            ['01 / Nguồn gốc', 'Phân biệt sơ cấp và thứ cấp', 'Nguồn sơ cấp là nơi dữ liệu được tạo ra; nguồn thứ cấp diễn giải hoặc trích lại. Nhiều bài cùng dẫn một báo cáo không phải nhiều xác nhận độc lập. Lưu đường dẫn tới tài liệu gốc và mô tả cách thu thập.', 'Chỉ ra nguồn gốc của một chỉ số.'],
            ['02 / Định nghĩa', 'Hai số khác nhau vì sao?', 'Trước khi tính trung bình hay chọn số lớn hơn, so định nghĩa chỉ tiêu, mẫu số, kỳ, phạm vi, đơn vị và cách lọc. Các số có thể đều đúng trong phạm vi riêng nhưng không cộng hoặc so trực tiếp được.', 'Lập bảng so sánh hai con số mâu thuẫn.'],
            ['03 / Kết luận', 'Nêu con số kèm giới hạn', 'Chọn số phù hợp quyết định cần đưa ra và giải thích nguồn, cách đo, độ mới, độ tin cậy. Nếu chưa thể hòa giải, báo cáo khoảng ước lượng hoặc hai cách hiểu; ghi việc phải kiểm tra tiếp.', 'Viết kết luận hai câu có điều kiện sử dụng.']
          ],
          question: ['Hai báo cáo cho cùng tên chỉ tiêu nhưng khác số. Bước đầu là gì?', ['Chọn số cao hơn', 'So định nghĩa, kỳ và phạm vi đo', 'Lấy trung bình cộng'], 1, 'Khác biệt phạm vi hoặc phương pháp phải được giải thích trước khi chọn số.']
        },
        {
          title: 'Tổ chức và quản lý kho thông tin', objective: 'Thiết kế thư mục, sổ đăng ký và quyền truy cập cho nhóm.', source: 'access', minutes: 15,
          slides: [
            ['01 / Cấu trúc', 'Một nguyên tắc phân loại', 'Chọn cách phân loại chính theo dự án hoặc loại hồ sơ rồi dùng nhất quán. Tránh pha hai cách cùng cấp khiến người dùng không biết lưu ở đâu. Giữ cây thư mục đủ nông để người khác tìm được.', 'Vẽ cấu trúc thư mục cho một chu kỳ công việc.'],
            ['02 / Sổ đăng ký', 'Thư mục chưa đủ để quản lý', 'Sổ đăng ký ghi tên, phiên bản, nguồn, kỳ dữ liệu, chủ sở hữu, mức nhạy cảm và liên kết. Nó giúp tra cứu theo thuộc tính mà cây thư mục không thể hiện hết.', 'Liệt kê các trường bắt buộc của sổ đăng ký.'],
            ['03 / Quyền truy cập', 'Cấp đúng người, đúng mục đích', 'Áp dụng quyền tối thiểu: mỗi người chỉ có quyền đủ để làm phần việc. Đồng bộ tệp không thay thế bản sao lưu; một thay đổi sai cũng có thể đồng bộ sang các bản khác.', 'Nêu ai được xem, ai được sửa và nơi sao lưu.']
          ],
          question: ['Đồng nghiệp chỉ cần đọc báo cáo đã duyệt. Quyền nào phù hợp?', ['Chỉnh sửa cả thư mục nguồn', 'Quyền xem bản đã duyệt', 'Quyền quản trị hệ thống'], 1, 'Quyền tối thiểu chỉ cấp mức cần để thực hiện công việc.']
        }
      ]
    },
    3: {
      code: 'M1-A', title: 'Phân tích thông tin và quản trị dữ liệu', hours: '9 giờ', framework: 'Bậc 5–6',
      outcome: 'Dẫn dắt nghiên cứu đa nguồn, đo chất lượng dữ liệu và thiết lập chuẩn quản trị cho quyết định quan trọng.',
      modules: [
        {
          title: 'Nghiên cứu phức hợp đa nguồn', objective: 'Thiết kế nghiên cứu cho quyết định có dữ liệu nội bộ và bên ngoài.', source: 'digcomp', minutes: 18,
          slides: [
            ['01 / Quyết định', 'Bắt đầu bằng quyết định cần hỗ trợ', 'Nêu quyết định, phương án có thể chọn, ngưỡng rủi ro, chỉ tiêu và thời hạn. Tách điều đã biết, giả định và dữ liệu còn thiếu. Không thu thập “mọi thứ” khi chưa biết kết quả dùng để quyết định gì.', 'Viết một câu quyết định và hai chỉ tiêu.'],
            ['02 / Thiết kế nguồn', 'Phối hợp nội bộ và bên ngoài', 'Nguồn bên ngoài cho bối cảnh thị trường hoặc chuẩn tham chiếu; nguồn nội bộ cho vị thế thực tế của doanh nghiệp. Đánh dấu mức độc lập và phương pháp từng nguồn. Ba bản sao của một báo cáo không phải ba nguồn độc lập.', 'Vẽ bản đồ nguồn và điểm thiếu bằng chứng.'],
            ['03 / Bất định', 'Trình bày khoảng trống và giả định', 'Khi dữ liệu thiếu, công bố khoảng trống, đề xuất cách bổ sung hoặc ước lượng có điều kiện. Dùng nhiều nguồn độc lập để kiểm tra chéo hướng kết luận, nhưng không gọi số nguồn là bằng chứng chắc chắn nếu định nghĩa vẫn khác.', 'Nêu giới hạn có thể làm đổi quyết định.']
          ],
          question: ['Khi chưa có dữ liệu cho một phần quyết định, cách làm nào minh bạch?', ['Tự điền số hợp lý', 'Bỏ qua phần đó', 'Nêu khoảng trống, giả định và cách kiểm tra tiếp'], 2, 'Khoảng trống và giả định cần được công bố để người ra quyết định hiểu độ chắc chắn.']
        },
        {
          title: 'Đánh giá chất lượng dữ liệu', objective: 'Đo sáu chiều chất lượng và đề xuất kiểm soát phòng ngừa/phát hiện.', source: 'quality', minutes: 18,
          slides: [
            ['01 / Sáu chiều', 'Dữ liệu có đủ tốt cho mục đích?', 'Đo độ đầy đủ, duy nhất, nhất quán, kịp thời, hợp lệ và chính xác. Dữ liệu đúng định dạng vẫn có thể sai thực tế; dữ liệu đầy đủ vẫn có thể cũ. Chọn ngưỡng theo rủi ro của quyết định.', 'Chỉ ra hai chiều quan trọng nhất trong ca này.'],
            ['02 / Quy tắc', 'Phòng ngừa trước, phát hiện sau', 'Quy tắc ở điểm nhập có thể chặn giá trị ngoài phạm vi; báo cáo ngoại lệ tìm lỗi đã đi vào hệ thống. Mỗi kiểm soát cần công thức đo, ngưỡng, người phụ trách và tần suất kiểm tra.', 'Viết một quy tắc phòng ngừa và một quy tắc phát hiện.'],
            ['03 / Ưu tiên', 'Không che giấu dữ liệu yếu', 'Bảng điểm nêu số bản ghi kiểm tra, số lỗi, tỷ lệ và ảnh hưởng tới quyết định. Phân biệt dữ liệu sai với giá trị bất thường cần điều tra. Nếu chất lượng chưa đạt ngưỡng, nêu rõ khuyến nghị tạm thời.', 'Ghi quyết định có thể hoặc chưa thể đưa ra.']
          ],
          question: ['Email đúng định dạng nhưng thuộc sai khách hàng vi phạm chiều nào?', ['Tính hợp lệ', 'Tính chính xác', 'Tính đầy đủ'], 1, 'Định dạng có thể hợp lệ nhưng thông tin không phản ánh đúng thực tế.']
        },
        {
          title: 'Quản trị dữ liệu và vòng đời thông tin', objective: 'Thống nhất định nghĩa, nguồn chính thức, vai trò và vòng đời dữ liệu.', source: 'quality', minutes: 18,
          slides: [
            ['01 / Định nghĩa', 'Một chỉ số cần một cách hiểu', 'Từ điển dữ liệu ghi tên trường, ý nghĩa, kiểu, giá trị hợp lệ, đơn vị, kỳ, nguồn và chủ sở hữu. Khi hai phòng báo số khác nhau, trước hết kiểm tra định nghĩa và nguồn chính thức; không sửa số bằng cách lấy trung bình.', 'Viết định nghĩa cho một chỉ số hay tranh cãi.'],
            ['02 / Trách nhiệm', 'Ai quyết, ai giữ chất lượng?', 'Chủ sở hữu dữ liệu chịu trách nhiệm cuối cùng; người quản lý dữ liệu theo dõi định nghĩa và chất lượng hằng ngày; người sử dụng tuân thủ quy tắc. Ghi quyền phê duyệt thay đổi, nơi lưu nguồn chính thức và đường dẫn truy vết.', 'Gán ba vai trò cho một bộ dữ liệu.'],
            ['03 / Vòng đời', 'Giữ dữ liệu đúng thời hạn và mục đích', 'Quy trình phải nói rõ tạo, kiểm tra, chia sẻ, lưu, lưu trữ và hủy dữ liệu. Thời hạn giữ cần được đối chiếu quy định và nhu cầu nghiệp vụ tại nơi triển khai; bản demo không tự đặt thời hạn pháp lý.', 'Viết một điểm kiểm soát khi kết thúc vòng đời.']
          ],
          question: ['Hai phòng ban báo một chỉ số khác nhau vì định nghĩa khác. Cần làm gì trước?', ['Lấy trung bình hai số', 'Chọn số cao hơn', 'Thống nhất định nghĩa và nguồn chính thức trong từ điển dữ liệu'], 2, 'Quản trị giải quyết khác biệt định nghĩa trước khi xử lý phép tính.']
        }
      ]
    }
  };

  const tracks = {
    general: { label: 'Vị trí khác', department: '', target: null, sources: [], cases: {} },
    accounting: { label: 'Kế toán', department: 'Kế toán', target: 3, sources: ['ifrs'], cases: {
      1: { situation: 'Quản lý cần bộ chứng từ chi phí tháng 9 để kiểm tra một khoản đã ghi sổ.', examples: ['Tìm hóa đơn gốc theo mã, ngày và nhà cung cấp; không lấy ảnh gửi qua chat làm nguồn duy nhất.', 'So tên đơn vị, kỳ và số tiền trên chứng từ với bản ghi sổ; đánh dấu bản thiếu ngày.', 'Lưu PDF chứng từ và bảng kê dưới tên có kỳ, mã và phiên bản; chỉ cấp người kiểm tra quyền xem.'], quiz: ['Hóa đơn trong email có số tiền khác ảnh chụp được chuyển tiếp. Nguồn cần kiểm tra trước là gì?', 'Tài liệu nào giúp chứng minh khoản chi đã ghi sổ?', 'Tên tệp nào giúp tìm lại chứng từ kỳ tháng 9?'], correct: ['Chứng từ gốc trong hệ thống lưu trữ cùng mã giao dịch', 'Chứng từ gốc và bút toán có mã đối chiếu', '2026-09_chung-tu_CP017_v01.pdf'], wrong: ['Ảnh chụp gửi trong nhóm chat', 'Một ghi chú không có mã chứng từ', 'chungtu_moinhat.pdf'], assignment: 'Tìm ba chứng từ chi phí của một kỳ giả lập; ghi truy vấn, đánh giá nguồn, lập bảng mã chứng từ–bút toán và quy ước tên tệp.', deliverables: ['Nhật ký tìm và ba đường dẫn/mã nguồn', 'Bảng đối chiếu chứng từ–bút toán', 'Thư mục/tên tệp có kỳ và phiên bản'] },
      2: { situation: 'Sổ cái ghi doanh thu tháng 9 khác bảng tổng hợp hóa đơn cùng kỳ.', examples: ['Xác định doanh thu gộp hay thuần, kỳ ghi nhận và đơn vị tiền trước khi tìm tài liệu.', 'So mã giao dịch, kỳ, trạng thái điều chỉnh và phạm vi hai báo cáo; không lấy trung bình hai tổng.', 'Lập sổ đăng ký nguồn cho sổ cái, hóa đơn, bảng điều chỉnh; chỉ cấp quyền sửa cho người phụ trách.'], quiz: ['Hai báo cáo doanh thu khác nhau. Cần chốt gì trước?', 'Một hóa đơn hủy vẫn nằm trong bảng tổng. Nên làm gì?', 'Ai cần quyền chỉnh sửa sổ đăng ký đối chiếu?'], correct: ['Định nghĩa doanh thu, kỳ và trạng thái giao dịch', 'Đối chiếu trạng thái hủy/điều chỉnh trước khi cộng', 'Người phụ trách đối chiếu được phân quyền'], wrong: ['Chọn tổng cao hơn', 'Xóa dòng đó mà không ghi lý do', 'Mọi người có liên kết'], assignment: 'Lập kế hoạch tìm và đối chiếu doanh thu giả lập giữa sổ cái, hóa đơn và bảng điều chỉnh; nêu khoản chênh có thể truy vết.', deliverables: ['Nhu cầu thông tin và nhật ký truy vấn', 'Bảng nguồn–định nghĩa–kỳ–chênh lệch', 'Kết luận một trang kèm giới hạn'] },
      3: { situation: 'Ban giám đốc nghi ngờ chất lượng dữ liệu chi phí và doanh thu từ ba hệ thống.', examples: ['Thiết kế nghiên cứu dùng sổ cái, hóa đơn và số liệu ngân hàng; ghi giả định về thời điểm ghi nhận.', 'Đo độ đầy đủ chứng từ, mã trùng, kỳ sai, định dạng lỗi và khoản không khớp; phân biệt bất thường với sai.', 'Định nghĩa chỉ số doanh thu/chi phí, hệ thống nguồn, chủ sở hữu và lịch xử lý dữ liệu theo quy định áp dụng.'], quiz: ['Ba hệ thống cho ba tổng doanh thu. Bước nghiên cứu đầu là gì?', 'Mã hóa đơn lặp hai lần vi phạm chiều chất lượng nào?', 'Cần ghi gì trong từ điển chỉ số doanh thu?'], correct: ['Chốt quyết định, định nghĩa, kỳ và nguồn từng tổng', 'Tính duy nhất', 'Định nghĩa, kỳ, nguồn chính thức và chủ sở hữu'], wrong: ['Lấy trung bình ba tổng', 'Tính kịp thời', 'Chỉ tên chỉ số và màu biểu đồ'], assignment: 'Xây hồ sơ chất lượng và quản trị dữ liệu doanh thu giả lập cho ban giám đốc, dùng ít nhất ba hệ thống nguồn.', deliverables: ['Kế hoạch nghiên cứu và các khoảng trống', 'Bảng điểm sáu chiều có mẫu số/ngưỡng', 'Từ điển dữ liệu, phân vai và khuyến nghị có điều kiện'] }
    } },
    marketing: { label: 'Marketing', department: 'Marketing', target: 3, sources: ['ga4','ga4scope'], cases: {
      1: { situation: 'Nhóm cần tìm bản định hướng chiến dịch và số lượt truy cập của tháng 9.', examples: ['Tìm brief đã duyệt và báo cáo nguồn truy cập theo đúng tên chiến dịch, kỳ và nền tảng.', 'Kiểm tra báo cáo do ai xuất, ngày xuất và liệu số là người dùng hay phiên truy cập.', 'Lưu brief, ảnh/bảng báo cáo và đường dẫn nguồn dưới một mã chiến dịch nhất quán.'], quiz: ['Bản brief nào nên dùng?', 'Hai ảnh báo cáo cùng số liệu nhưng khác ngày. Cần kiểm tra gì?', 'Tên tệp nào giúp tìm báo cáo chiến dịch?'], correct: ['Bản brief có trạng thái đã duyệt và phiên bản rõ', 'Ngày xuất và kỳ dữ liệu của báo cáo nguồn', '2026-09_CAMP07_nguon-truy-cap_v01.xlsx'], wrong: ['Bản gần nhất trong chat nhưng chưa rõ duyệt', 'Chỉ màu của biểu đồ', 'bao-cao-mkt-final.xlsx'], assignment: 'Tìm brief và ba nguồn số liệu cho một chiến dịch giả lập; mô tả nguồn, kỳ và lưu bộ tài liệu có phiên bản.', deliverables: ['Nhật ký tìm và đường dẫn nguồn', 'Bảng ba nguồn kèm đánh giá tin cậy', 'Thư mục chiến dịch có quy ước tên'] },
      2: { situation: 'Báo cáo nền tảng quảng cáo ghi 1.200 lượt nhấp, GA4 ghi 980 phiên và 740 người dùng.', examples: ['Đặt nhu cầu: đánh giá hiệu quả chiến dịch theo phiên hay người mới, trong kỳ nào.', 'Không so trực tiếp nhấp, phiên và người dùng; kiểm tra phạm vi đo, gắn thẻ và thời gian báo cáo.', 'Lập sổ đăng ký nguồn GA4, nền tảng quảng cáo, quy ước UTM và người phụ trách.'], quiz: ['Trước khi so lượt nhấp và phiên cần làm gì?', 'Báo cáo thu hút người dùng và nguồn truy cập khác nhau ở đâu?', 'Thông tin nào cần lưu cùng bảng GA4?'], correct: ['Ghi rõ định nghĩa, phạm vi và kỳ của từng chỉ số', 'Một báo người dùng mới theo người, một báo nguồn theo phiên', 'Phạm vi chỉ số, kỳ, nguồn và quy ước gắn thẻ'], wrong: ['Lấy trung bình các số', 'Hai báo cáo luôn dùng cùng mẫu số', 'Chỉ ảnh biểu đồ'], assignment: 'So báo cáo nguồn truy cập GA4 với nền tảng quảng cáo cho chiến dịch giả lập; giải thích khác biệt giữa nhấp, phiên và người dùng.', deliverables: ['Kế hoạch tìm và nhật ký truy vấn', 'Bảng so chỉ số/phạm vi/kỳ/nguồn', 'Khuyến nghị một trang cho quyết định tối ưu chiến dịch'] },
      3: { situation: 'Các nhóm Marketing báo chuyển đổi khác nhau vì UTM, trùng lead và kỳ xử lý khác nhau.', examples: ['Thiết kế nghiên cứu kết hợp GA4, nền tảng quảng cáo và CRM; ghi quyết định cần đưa ra.', 'Đo lead trùng, nguồn thiếu, UTM sai và thời gian đồng bộ; đặt ngưỡng theo tác động tới quyết định.', 'Lập từ điển lead đủ điều kiện, nguồn chiến dịch, chủ sở hữu và kiểm soát gắn thẻ.'], quiz: ['Nghiên cứu hiệu quả đa kênh nên bắt đầu từ đâu?', 'Lead trùng trong CRM ảnh hưởng chiều nào?', 'Trường nào cần trong từ điển “lead đủ điều kiện”?'], correct: ['Quyết định, định nghĩa chuyển đổi và phạm vi từng hệ thống', 'Tính duy nhất', 'Điều kiện đủ chuẩn, nguồn, kỳ và người sở hữu'], wrong: ['Chọn báo cáo có chuyển đổi cao nhất', 'Tính hợp lệ của email', 'Chỉ tên trường'], assignment: 'Thiết kế chuẩn dữ liệu chiến dịch xuyên GA4–quảng cáo–CRM, đo sáu chiều chất lượng và khuyến nghị quyết định ngân sách có điều kiện.', deliverables: ['Bản đồ nguồn và khoảng trống', 'Bảng điểm chất lượng có ngưỡng', 'Từ điển chỉ số, phân vai và bản đề xuất'] }
    } },
    hr: { label: 'Nhân sự', department: 'Nhân sự', target: 2, sources: ['access'], cases: {
      1: { situation: 'Cần tìm phiên bản chính sách nghỉ phép đã duyệt cho nhân viên mới.', examples: ['Tìm tên chính sách, ngày hiệu lực và đầu mối ban hành.', 'Không dùng bản tóm tắt trong chat nếu chưa thấy tài liệu chính thức.', 'Lưu phiên bản có ngày hiệu lực; hạn chế quyền với hồ sơ nhân sự cá nhân.'], quiz: ['Nên tìm văn bản nào?', 'Cần kiểm tra gì trên chính sách?', 'Ai cần xem hồ sơ nhân sự chi tiết?'], correct: ['Bản chính sách đã ban hành', 'Ngày hiệu lực và đơn vị ban hành', 'Người được giao xử lý hồ sơ'], wrong: ['Bản chụp chưa rõ nguồn', 'Chỉ số lượt xem', 'Toàn bộ công ty'], assignment: 'Tìm và lưu ba chính sách nhân sự giả lập có phiên bản, ngày hiệu lực và nguồn.', deliverables: ['Nhật ký nguồn', 'Bảng đánh giá hiệu lực', 'Cấu trúc thư mục có quyền phù hợp'] },
      2: { situation: 'HRIS và bảng lương cho số nhân viên đang làm việc khác nhau ở cuối tháng.', examples: ['Chốt nghĩa của “đang làm việc” và mốc chốt dữ liệu.', 'So trạng thái nghỉ, ngày vào/ra, kỳ trả lương và bản ghi trùng.', 'Lập sổ đăng ký nguồn chỉ cho người phụ trách xem/sửa.'], quiz: ['Bước đầu khi hai số nhân viên khác nhau?', 'Nhân viên nghỉ giữa tháng có thể gây khác biệt vì đâu?', 'Ai được sửa bảng đối chiếu?'], correct: ['Thống nhất định nghĩa và ngày chốt', 'Kỳ và tiêu chí tính khác nhau', 'Người phụ trách được cấp quyền'], wrong: ['Lấy trung bình hai số', 'Cả hai hệ thống chắc chắn sai', 'Mọi người có liên kết'], assignment: 'Đối chiếu số nhân viên giả lập giữa HRIS và bảng lương, ghi khác biệt định nghĩa/kỳ.', deliverables: ['Nhu cầu và truy vấn', 'Bảng đối chiếu theo trạng thái', 'Kết luận và quyền truy cập'] }
    } },
    sales: { label: 'Sales/CRM', department: 'Sales/CRM', target: 2, sources: ['quality'], cases: {
      1: { situation: 'Nhân viên cần tìm hồ sơ khách hàng và bảng giá đã được duyệt.', examples: ['Tìm mã khách hàng, nhu cầu và phiên bản bảng giá.', 'Đối chiếu CRM với tài liệu đã duyệt, không dùng bảng giá gửi qua chat.', 'Lưu ghi chú theo mã khách hàng và ngày, tránh tạo bản sao không kiểm soát.'], quiz: ['Bảng giá nào nên dùng?', 'Thông tin nào xác nhận hồ sơ khách?', 'Tên tệp nào hợp lý?'], correct: ['Bản có phiên bản và trạng thái đã duyệt', 'Mã khách hàng và lịch sử trong CRM', '2026-09_KH102_bao-gia_v01.pdf'], wrong: ['Bản không rõ ngày', 'Chỉ tên người gọi', 'gia_moi_nhat.pdf'], assignment: 'Tìm và sắp xếp bộ hồ sơ khách hàng giả lập cùng báo giá đã duyệt.', deliverables: ['Nguồn và mã khách hàng', 'Đánh giá phiên bản báo giá', 'Thư mục/hồ sơ có ngày'] },
      2: { situation: 'CRM và báo cáo đơn hàng cho hai tỷ lệ chuyển đổi khác nhau.', examples: ['Xác định đầu vào là lead, cơ hội hay đơn hàng; chốt kỳ và phạm vi.', 'So giai đoạn CRM, bản ghi trùng, giao dịch hủy và điều kiện “chuyển đổi”.', 'Lập sổ đăng ký định nghĩa chỉ số và cấp quyền cho Sales Ops.'], quiz: ['Trước khi so tỷ lệ chuyển đổi?', 'Bản ghi khách trùng ảnh hưởng gì?', 'Ai được sửa định nghĩa chỉ số?'], correct: ['Thống nhất mẫu số, tử số và kỳ', 'Tính duy nhất và mẫu số', 'Người sở hữu chỉ số được phê duyệt'], wrong: ['Chọn tỷ lệ cao hơn', 'Chỉ màu báo cáo', 'Mọi nhân viên bán hàng'], assignment: 'Đối chiếu tỷ lệ chuyển đổi giả lập giữa CRM và báo cáo đơn hàng.', deliverables: ['Định nghĩa và truy vấn', 'Bảng đối chiếu giao dịch', 'Khuyến nghị cách đo thống nhất'] }
    } },
    ceo: { label: 'CEO', department: 'Ban điều hành', target: 3, sources: ['digcomp','quality'], cases: {
      1: { situation: 'CEO cần một nguồn ngành và một báo cáo nội bộ để chuẩn bị cuộc họp.', examples: ['Ghi quyết định cần hỗ trợ, chủ đề và kỳ số liệu.', 'Kiểm tra tác giả, kỳ và nguồn gốc trước khi dùng một slide tóm tắt.', 'Lưu nguồn nội bộ/ngoài doanh nghiệp theo mã cuộc họp và phiên bản.'], quiz: ['Cần chốt gì trước khi tìm?', 'Một slide không ghi nguồn có dùng ngay?', 'Cách lưu nào dễ truy lại?'], correct: ['Quyết định và kỳ cần xem', 'Không; cần tìm tài liệu gốc', 'Lưu cùng nguồn, kỳ và phiên bản'], wrong: ['Chọn báo cáo đẹp nhất', 'Có vì đã lên slide', 'Chỉ gửi qua chat'], assignment: 'Chuẩn bị bộ nguồn giả lập cho một quyết định trong cuộc họp.', deliverables: ['Câu hỏi quyết định', 'Nguồn nội bộ và ngoài', 'Bảng tóm tắt có phiên bản'] },
      2: { situation: 'Báo cáo thị trường và báo cáo nội bộ đưa ra hai dự báo tăng trưởng khác nhau.', examples: ['Chốt ngành, địa bàn, kỳ và quyết định đầu tư.', 'So phương pháp, định nghĩa tăng trưởng và giả định của từng nguồn.', 'Lưu bảng đối chiếu và người phê duyệt bản dùng cho cuộc họp.'], quiz: ['Hai dự báo khác nhau: cần kiểm tra gì?', 'Có thể lấy trung bình ngay không?', 'Bản trình bày cần kèm gì?'], correct: ['Phạm vi, kỳ, phương pháp và giả định', 'Không; cần hiểu cơ sở từng nguồn', 'Nguồn, phiên bản và giới hạn'], wrong: ['Chọn số cao hơn', 'Có, luôn luôn', 'Chỉ đồ thị'], assignment: 'So hai dự báo giả lập và viết một trang phương án quyết định.', deliverables: ['Ma trận nguồn', 'Bảng giả định khác biệt', 'Khuyến nghị có giới hạn'] },
      3: { situation: 'Ban điều hành quyết định mở thị trường khi dữ liệu vận hành chưa đồng nhất.', examples: ['Xác định quyết định và ngưỡng rủi ro; phối hợp nguồn thị trường, bán hàng và tài chính.', 'Chấm chất lượng sáu chiều của dữ liệu đầu vào, nêu dữ liệu còn thiếu.', 'Chỉ định nguồn chính thức, chủ sở hữu dữ liệu và kiểm soát thay đổi trước khi dùng lại báo cáo.'], quiz: ['Thiết kế nghiên cứu bắt đầu bằng gì?', 'Dữ liệu đầy đủ nhưng cũ vi phạm chiều nào?', 'CEO nên yêu cầu gì ở báo cáo quyết định?'], correct: ['Quyết định, phương án và ngưỡng rủi ro', 'Tính kịp thời', 'Nguồn, mức tin cậy và giới hạn phân tích'], wrong: ['Thu mọi dữ liệu sẵn có', 'Tính duy nhất', 'Một số chắc chắn duy nhất'], assignment: 'Lập hồ sơ quyết định mở thị trường giả lập có nghiên cứu đa nguồn, chất lượng dữ liệu và cơ chế quản trị.', deliverables: ['Cây quyết định và bản đồ nguồn', 'Bảng điểm sáu chiều/độ bất định', 'Từ điển chỉ số, chủ sở hữu và khuyến nghị'] }
    } }
  };

  const caseFacts = {
    accounting: {
      1: ['CP017 · 04/09/2026 · hóa đơn PDF lưu kho chứng từ: 12.000.000 đ · đã duyệt', 'BT017 · 05/09/2026 · bút toán sổ cái: 12.000.000 đ · tham chiếu CP017', 'Ảnh chuyển tiếp qua chat ghi CP017: 21.000.000 đ · không có chữ ký/phiên bản', 'CP018 · 12/09/2026 · hóa đơn PDF: 8.500.000 đ · chưa có mã bút toán'],
      2: ['Sổ cái tháng 09/2026: 125.000.000 đ; định nghĩa gồm doanh thu đã ghi nhận', 'Tổng hóa đơn xuất tháng 09/2026: 130.000.000 đ; có hóa đơn HD031 trị giá 5.000.000 đ đã hủy', 'Bảng điều chỉnh: HD031 · hủy ngày 29/09/2026 · lý do xuất trùng', 'Câu hỏi: chênh lệch 5.000.000 đ có thể giải thích được không và cần kiểm tra gì tiếp?'],
      3: ['Sổ cái: 100 giao dịch · 2 giao dịch thiếu mã chứng từ · tổng 290.000.000 đ', 'Hóa đơn: 101 dòng · 1 mã lặp · 1 hóa đơn hủy chưa gắn trạng thái vào bảng xuất', 'Ngân hàng: 96 giao dịch khớp mã, 4 giao dịch cần đối chiếu thời điểm', 'Ngưỡng minh họa: mã chứng từ đầy đủ ≥98%; không có mã trùng; khoản chưa khớp phải có chủ sở hữu xử lý']
    },
    marketing: {
      1: ['CAMP07 · brief v02 · duyệt 01/09/2026; brief v03 đang chờ duyệt', 'GA4 · báo cáo nguồn truy cập · kỳ 01–30/09/2026 · xuất 02/10/2026', 'Nền tảng quảng cáo · báo cáo lượt nhấp · cùng kỳ · xuất 01/10/2026', 'Ảnh chụp dashboard · không ghi ngày xuất hoặc người tạo'],
      2: ['Nền tảng quảng cáo: 1.200 lượt nhấp vào quảng cáo trong kỳ 01–30/09/2026', 'GA4 Traffic acquisition: 980 phiên được ghi nhận cho chiến dịch trong cùng kỳ', 'GA4 User acquisition: 740 người dùng mới có nguồn đầu tiên từ chiến dịch', 'Chưa đối soát UTM, múi giờ, bộ lọc và cơ chế đo; các số trên không cùng đơn vị đếm'],
      3: ['CRM: 500 dòng lead · 30 email lặp · 25 dòng thiếu mã nguồn chiến dịch', 'GA4: 440 sự kiện gửi biểu mẫu · kỳ 01–30/09/2026', 'Nền tảng quảng cáo: 620 lượt nhấp vào trang đích · cùng kỳ', 'Định nghĩa “lead đủ điều kiện” chưa thống nhất; dữ liệu CRM đồng bộ trễ tối đa 48 giờ trong giả lập']
    }
  };
  const trackFor = (person, preview) => {
    if (preview && tracks[preview]) return preview;
    const text = `${person?.dept || ''} ${person?.position || ''}`.toLowerCase();
    if (/account|kế toán/.test(text)) return 'accounting';
    if (/market|tiếp thị/.test(text)) return 'marketing';
    if (/sales|crm|bán hàng/.test(text)) return 'sales';
    if (/human|nhân sự|\bhr\b/.test(text)) return 'hr';
    if (/ceo|điều hành|giám đốc/.test(text)) return 'ceo';
    return 'general';
  };
  const caseFor = (tier, track) => tracks[track]?.cases[tier] || null;
  const modulesFor = (tier, track) => {
    const course = courses[tier], context = caseFor(tier, track);
    return course.modules.map((module, index) => {
      const example = context?.examples[index] || 'Hãy áp dụng với một nguồn dữ liệu phù hợp vị trí và ghi lại cách kiểm tra.';
      const slides = module.slides.map(([tag,title,body,prompt], slideIndex) => ({
        tag, title, body: `${body}${slideIndex === 1 ? ` Tình huống ${tracks[track]?.label || 'công việc'}: ${example}` : ''}`,
        prompt, source: sources[module.source]
      }));
      const [text, options, answer, reason] = module.question;
      const questions = [{text,options,answer,reason}];
      if (context) questions.push({
        text: context.quiz[index],
        options: [context.wrong[index], context.correct[index], 'Bỏ qua nguồn và chỉ báo cáo kết quả'],
        answer: 1, reason: `Trong tình huống ${tracks[track].label}, cần: ${context.correct[index].toLowerCase()}.`
      });
      else questions.push({text:'Kết quả công việc nào kiểm tra được?',options:['Một kết luận không ghi nguồn', 'Nguồn, cách làm và kết luận có giới hạn', 'Chỉ một ảnh chụp'],answer:1,reason:'Nguồn và cách làm phải đi cùng kết luận.'});
      return {title:module.title,body:module.objective,callout:example,slides,questions,minutes:module.minutes,source:sources[module.source]};
    });
  };
  const assignmentFor = (tier, track) => {
    const context = caseFor(tier, track), course = courses[tier];
    return context ? {title:`Bài cuối khóa ${course.code} · ${tracks[track].label}`,situation:context.situation,prompt:context.assignment,deliverables:context.deliverables,caseFacts:caseFacts[track]?.[tier] || [],
      rubric:tier===1 ? [['Nhu cầu và truy vết nguồn',20],['Đánh giá độ tin cậy',25],['Tổ chức tài liệu',20],['Tóm tắt có dẫn nguồn',20],['Trình bày và giới hạn',15]]
        :tier===2 ? [['Nhu cầu và chiến lược tìm',20],['Nguồn và định nghĩa chỉ số',25],['Bảng đối chiếu',20],['Lưu trữ và phân quyền',20],['Khuyến nghị có căn cứ',15]]
          :[['Thiết kế nghiên cứu đa nguồn',25],['Đo sáu chiều chất lượng',25],['Từ điển và trách nhiệm dữ liệu',25],['Khuyến nghị, giới hạn và rủi ro',25]],pass:70,minimumCriterion:tier===3?50:null}
      : {title:`Bài cuối khóa ${course.code} · vị trí của bạn`,situation:'Áp dụng vào một quyết định thực tế của vị trí.',prompt:'Nêu nhu cầu, nguồn, cách kiểm tra, sản phẩm công việc và kết luận có giới hạn.',deliverables:['Nhật ký nguồn và định nghĩa', 'Sản phẩm công việc có thể kiểm tra', 'Giới hạn và đề xuất tiếp theo'],caseFacts:[],
        rubric:tier===1 ? [['Nhu cầu và truy vết nguồn',20],['Đánh giá độ tin cậy',25],['Tổ chức tài liệu',20],['Tóm tắt có dẫn nguồn',20],['Trình bày và giới hạn',15]]
          :tier===2 ? [['Nhu cầu và chiến lược tìm',20],['Nguồn và định nghĩa chỉ số',25],['Bảng đối chiếu',20],['Lưu trữ và phân quyền',20],['Khuyến nghị có căn cứ',15]]
            :[['Thiết kế nghiên cứu đa nguồn',25],['Đo sáu chiều chất lượng',25],['Từ điển và trách nhiệm dữ liệu',25],['Khuyến nghị, giới hạn và rủi ro',25]],pass:70,minimumCriterion:tier===3?50:null};
  };
  return {sources,courses,tracks,trackFor,modulesFor,assignmentFor};
})();
