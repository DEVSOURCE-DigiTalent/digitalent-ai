/**
 * Question bank of the personal track: 4 workplace questions per domain of Circular 02/2025.
 * The first three of a domain are one per level (Cơ bản, Trung cấp, Nâng cao) and make up the entry assessment;
 * all four make up the end-of-course assessment of that domain's courses.
 */

export interface BankQuestion {
  id: string;
  domainNumber: number;
  competencyCode: string;
  /** 1 Cơ bản, 2 Trung cấp, 3 Nâng cao. */
  level: number;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const QUESTION_BANK: BankQuestion[] = [
  // ── Miền 1: Khai thác dữ liệu và thông tin ──
  {
    id: 'pq-1-1',
    domainNumber: 1,
    competencyCode: '1.1',
    level: 1,
    text: 'Bạn cần tìm mẫu hợp đồng lao động mới nhất trên mạng. Cách tìm nào cho kết quả đáng tin cậy nhất?',
    options: [
      'Gõ "mẫu hợp đồng" và mở kết quả đầu tiên',
      'Thêm từ khóa cụ thể (năm, "Bộ luật Lao động 2019") và ưu tiên trang có tên miền .gov.vn',
      'Hỏi trong một nhóm mạng xã hội và dùng tệp được gửi nhiều nhất',
      'Dùng lại mẫu cũ trong máy vì nội dung hợp đồng ít thay đổi',
    ],
    correctIndex: 1,
    explanation: 'Từ khóa cụ thể giúp lọc kết quả; nguồn cơ quan nhà nước (.gov.vn) là nguồn gốc của văn bản pháp lý.',
  },
  {
    id: 'pq-1-2',
    domainNumber: 1,
    competencyCode: '1.2',
    level: 2,
    text: 'Một bài báo dẫn số liệu "70% khách hàng bỏ giỏ hàng" để thuyết phục bạn mua công cụ. Bạn kiểm tra độ tin cậy thế nào?',
    options: [
      'Tin vì con số được nhiều trang khác nhắc lại',
      'Tìm nghiên cứu gốc, xem ai thực hiện, năm nào, mẫu khảo sát và ai được lợi từ con số',
      'Bỏ qua mọi số liệu trên mạng',
      'Chỉ tin nếu bài viết có biểu đồ',
    ],
    correctIndex: 1,
    explanation: 'Đánh giá thông tin là truy về nguồn gốc, phương pháp, thời điểm và động cơ của người công bố.',
  },
  {
    id: 'pq-1-3',
    domainNumber: 1,
    competencyCode: '1.3',
    level: 3,
    text: 'Nhóm bạn có 3 bảng tính khách hàng trùng lặp, mỗi người sửa một bản. Bạn đề xuất cách quản lý nào?',
    options: [
      'Gộp thủ công mỗi cuối tháng',
      'Giữ cả 3 bản để không ai mất dữ liệu',
      'Một nguồn dữ liệu chung có phân quyền, quy tắc đặt tên trường, lịch sử phiên bản và người chịu trách nhiệm',
      'Gửi bảng qua email mỗi khi có thay đổi',
    ],
    correctIndex: 2,
    explanation: 'Ở mức nâng cao, bạn thiết kế cách tổ chức dữ liệu cho cả nhóm: một nguồn duy nhất, quy tắc và quyền rõ ràng.',
  },
  {
    id: 'pq-1-4',
    domainNumber: 1,
    competencyCode: '1.3',
    level: 2,
    text: 'Cách đặt tên tệp nào giúp cả nhóm tìm lại tài liệu nhanh nhất?',
    options: [
      'baocao_final_final2.docx',
      '2026-09-30_BaoCaoDoanhThu_Q3_v02.docx',
      'Bao cao moi.docx',
      'Tên tùy mỗi người, miễn để đúng thư mục',
    ],
    correctIndex: 1,
    explanation: 'Ngày theo dạng năm-tháng-ngày, nội dung và phiên bản giúp sắp xếp và tìm kiếm nhất quán.',
  },

  // ── Miền 2: Giao tiếp và hợp tác trong môi trường số ──
  {
    id: 'pq-2-1',
    domainNumber: 2,
    competencyCode: '2.1',
    level: 1,
    text: 'Bạn cần báo cho cả phòng lịch họp thay đổi trong hôm nay. Kênh nào phù hợp nhất?',
    options: [
      'Nhắn riêng từng người',
      'Đăng trong nhóm chat công việc của phòng và cập nhật lịch họp chung',
      'Đăng lên trang mạng xã hội cá nhân',
      'Đợi đến cuộc họp tuần sau để thông báo',
    ],
    correctIndex: 1,
    explanation: 'Thông tin chung, gấp nên đi qua kênh chung của nhóm và công cụ lịch mà mọi người cùng dùng.',
  },
  {
    id: 'pq-2-2',
    domainNumber: 2,
    competencyCode: '2.4',
    level: 2,
    text: 'Ba người cùng soạn một đề xuất. Cách cộng tác nào tránh mất bản và chồng chéo?',
    options: [
      'Mỗi người soạn một tệp rồi gửi email cho người tổng hợp',
      'Soạn chung trên một tài liệu trực tuyến, chia mục theo người, dùng bình luận và lịch sử phiên bản',
      'Một người soạn hết cho nhanh',
      'Chụp màn hình từng phần gửi vào nhóm chat',
    ],
    correctIndex: 1,
    explanation: 'Tài liệu chung có phân công, bình luận và lịch sử phiên bản là cách hợp tác số hiệu quả.',
  },
  {
    id: 'pq-2-3',
    domainNumber: 2,
    competencyCode: '2.6',
    level: 3,
    text: 'Công ty muốn nhân viên dùng mạng xã hội để quảng bá thương hiệu. Bạn đề xuất nguyên tắc nào trước?',
    options: [
      'Mỗi người tự do đăng theo phong cách riêng',
      'Cấm hoàn toàn nhắc tới công ty trên mạng',
      'Bộ quy tắc: tách danh tính cá nhân và công việc, thông tin được phép chia sẻ, cách xử lý bình luận tiêu cực',
      'Dùng chung một tài khoản cho cả phòng',
    ],
    correctIndex: 2,
    explanation: 'Mức nâng cao là xây quy tắc cho người khác: quản lý danh tính số và ứng xử nhất quán của cả tổ chức.',
  },
  {
    id: 'pq-2-4',
    domainNumber: 2,
    competencyCode: '2.5',
    level: 2,
    text: 'Một khách hàng bình luận gay gắt, sai sự thật trên trang của công ty. Cách phản hồi phù hợp?',
    options: [
      'Xóa bình luận và chặn tài khoản ngay',
      'Phản hồi lịch sự, nêu thông tin đúng, mời trao đổi qua kênh riêng và lưu lại bằng chứng',
      'Đáp trả để bảo vệ uy tín công ty',
      'Nhờ đồng nghiệp vào bình luận phản bác',
    ],
    correctIndex: 1,
    explanation: 'Quy tắc ứng xử trên mạng: bình tĩnh, đúng sự thật, chuyển sang kênh riêng khi cần giải quyết.',
  },

  // ── Miền 3: Sáng tạo nội dung số ──
  {
    id: 'pq-3-1',
    domainNumber: 3,
    competencyCode: '3.1',
    level: 1,
    text: 'Bạn cần làm một trang giới thiệu sản phẩm gửi khách. Bước đầu tiên nên là gì?',
    options: [
      'Chọn phông chữ đẹp',
      'Xác định người đọc, thông điệp chính và hành động mong muốn',
      'Chèn càng nhiều hình càng tốt',
      'Sao chép trang của đối thủ',
    ],
    correctIndex: 1,
    explanation: 'Nội dung số bắt đầu từ người đọc và mục tiêu; hình thức đến sau.',
  },
  {
    id: 'pq-3-2',
    domainNumber: 3,
    competencyCode: '3.3',
    level: 2,
    text: 'Bạn muốn dùng một bức ảnh tìm thấy trên mạng cho bài đăng của công ty. Cần làm gì?',
    options: [
      'Dùng luôn vì ảnh đã công khai',
      'Kiểm tra giấy phép (ví dụ Creative Commons, kho ảnh có bản quyền) và ghi nguồn theo yêu cầu',
      'Cắt bớt hình mờ (watermark) rồi dùng',
      'Đổi màu ảnh để không bị nhận ra',
    ],
    correctIndex: 1,
    explanation: 'Ảnh công khai không có nghĩa là được dùng tự do; giấy phép quyết định cách dùng và ghi nguồn.',
  },
  {
    id: 'pq-3-3',
    domainNumber: 3,
    competencyCode: '3.2',
    level: 3,
    text: 'Phòng bạn có hàng trăm bài viết cũ. Cách tái sử dụng chúng hiệu quả nhất?',
    options: [
      'Đăng lại nguyên văn theo lịch',
      'Xây kho nội dung gắn thẻ chủ đề, cập nhật số liệu, chuyển thể sang định dạng mới (video ngắn, infographic) có kiểm duyệt',
      'Xóa hết để bắt đầu lại',
      'Nhờ AI viết lại toàn bộ và đăng ngay không cần đọc',
    ],
    correctIndex: 1,
    explanation: 'Tạo lập lại nội dung ở mức nâng cao là có hệ thống: phân loại, cập nhật và chuyển thể có kiểm soát.',
  },
  {
    id: 'pq-3-4',
    domainNumber: 3,
    competencyCode: '3.4',
    level: 2,
    text: 'Mỗi ngày bạn mất 30 phút chép dữ liệu đơn hàng từ email sang bảng tính. Bước hợp lý tiếp theo?',
    options: [
      'Tiếp tục làm thủ công cho chắc',
      'Mô tả rõ các bước lặp lại rồi dùng công cụ tự động hóa không cần lập trình (hoặc nhờ IT) để thử trên dữ liệu mẫu',
      'Bỏ không cập nhật bảng tính nữa',
      'Chuyển tiếp mọi email cho đồng nghiệp xử lý',
    ],
    correctIndex: 1,
    explanation: 'Tư duy lập trình bắt đầu từ việc mô tả quy trình thành các bước rõ ràng và thử trên dữ liệu mẫu.',
  },

  // ── Miền 4: An toàn ──
  {
    id: 'pq-4-1',
    domainNumber: 4,
    competencyCode: '4.1',
    level: 1,
    text: 'Bạn nhận email "từ Giám đốc" yêu cầu chuyển khoản gấp kèm đường link lạ. Bạn làm gì trước tiên?',
    options: [
      'Bấm link để xem nội dung',
      'Trả lời email hỏi lại',
      'Không bấm link, xác minh qua kênh khác (gọi điện) và báo bộ phận IT',
      'Chuyển tiếp cho cả phòng cảnh báo',
    ],
    correctIndex: 2,
    explanation: 'Email giả mạo dựa vào sự gấp gáp; xác minh qua kênh khác và báo IT là phản xạ an toàn cơ bản.',
  },
  {
    id: 'pq-4-2',
    domainNumber: 4,
    competencyCode: '4.2',
    level: 2,
    text: 'Bạn cần gửi danh sách khách hàng (có số điện thoại) cho đối tác in thiệp. Cách làm đúng?',
    options: [
      'Gửi nguyên tệp qua nhóm chat chung',
      'Chỉ gửi trường cần thiết, đặt mật khẩu hoặc dùng liên kết giới hạn người xem và thời hạn',
      'Đăng tệp lên ổ chia sẻ công khai để đối tác tự tải',
      'Gửi qua email cá nhân cho nhanh',
    ],
    correctIndex: 1,
    explanation: 'Bảo vệ dữ liệu cá nhân (Nghị định 13/2023): tối thiểu hóa dữ liệu và kiểm soát quyền truy cập.',
  },
  {
    id: 'pq-4-3',
    domainNumber: 4,
    competencyCode: '4.2',
    level: 3,
    text: 'Công ty bắt đầu dùng một phần mềm CRM trên đám mây. Bạn ưu tiên thiết lập gì về dữ liệu cá nhân?',
    options: [
      'Cho mọi nhân viên quyền quản trị để tiện làm việc',
      'Phân quyền theo vai trò, bật xác thực hai yếu tố, ghi nhật ký truy cập và quy trình xử lý khi lộ dữ liệu',
      'Tắt mật khẩu để đăng nhập nhanh',
      'Xuất toàn bộ dữ liệu ra máy cá nhân để sao lưu',
    ],
    correctIndex: 1,
    explanation: 'Mức nâng cao là thiết lập và duy trì biện pháp bảo vệ cho cả tổ chức, kể cả kế hoạch ứng phó sự cố.',
  },
  {
    id: 'pq-4-4',
    domainNumber: 4,
    competencyCode: '4.3',
    level: 2,
    text: 'Bạn thường trả lời tin nhắn công việc đến nửa đêm và thấy mệt mỏi. Cách điều chỉnh phù hợp?',
    options: [
      'Tắt điện thoại cả cuối tuần mà không báo ai',
      'Thống nhất khung giờ phản hồi với nhóm, dùng chế độ không làm phiền và hẹn giờ gửi tin',
      'Trả lời nhanh hơn để xong sớm',
      'Rời khỏi mọi nhóm chat công việc',
    ],
    correctIndex: 1,
    explanation: 'Bảo vệ sức khỏe số là chủ động đặt giới hạn và thống nhất cách làm việc với người khác.',
  },

  // ── Miền 5: Giải quyết vấn đề ──
  {
    id: 'pq-5-1',
    domainNumber: 5,
    competencyCode: '5.1',
    level: 1,
    text: 'Máy in văn phòng báo lỗi không in được. Bạn làm gì trước khi gọi kỹ thuật?',
    options: [
      'Gửi lệnh in thêm nhiều lần',
      'Kiểm tra giấy, kết nối, hàng chờ in và khởi động lại máy in',
      'Cài lại hệ điều hành máy tính',
      'Đổi sang máy in của phòng khác mà không báo ai',
    ],
    correctIndex: 1,
    explanation: 'Xử lý sự cố cơ bản: kiểm tra từ nguyên nhân đơn giản, thường gặp nhất.',
  },
  {
    id: 'pq-5-2',
    domainNumber: 5,
    competencyCode: '5.2',
    level: 2,
    text: 'Phòng bạn cần một công cụ quản lý công việc. Cách chọn hợp lý?',
    options: [
      'Chọn công cụ nhiều người dùng nhất',
      'Liệt kê nhu cầu, so 2–3 công cụ theo tiêu chí (chi phí, bảo mật, tích hợp) và dùng thử với nhóm nhỏ',
      'Chọn công cụ có giao diện đẹp nhất',
      'Để mỗi người dùng công cụ mình thích',
    ],
    correctIndex: 1,
    explanation: 'Xác định nhu cầu rồi mới chọn giải pháp, có tiêu chí và thử nghiệm trước khi áp dụng rộng.',
  },
  {
    id: 'pq-5-3',
    domainNumber: 5,
    competencyCode: '5.4',
    level: 3,
    text: 'Sau khi triển khai phần mềm mới, nhiều đồng nghiệp vẫn làm theo cách cũ. Bạn làm gì?',
    options: [
      'Báo cáo những người không dùng',
      'Khảo sát khó khăn, xác định khoảng trống kỹ năng, tổ chức hướng dẫn theo nhóm và đo mức sử dụng sau đó',
      'Quay lại cách làm cũ',
      'Gửi tài liệu hướng dẫn 100 trang',
    ],
    correctIndex: 1,
    explanation: 'Mức nâng cao là nhận ra và giải quyết khoảng trống năng lực số của cả nhóm, có đo lường.',
  },
  {
    id: 'pq-5-4',
    domainNumber: 5,
    competencyCode: '5.3',
    level: 2,
    text: 'Báo cáo tuần của bạn mất 3 giờ vì phải gom số liệu từ nhiều nơi. Cách cải thiện sáng tạo nhất?',
    options: [
      'Làm thêm giờ',
      'Dựng một bảng tổng hợp lấy dữ liệu tự động từ các nguồn và chỉ cập nhật phần nhận xét',
      'Giảm số liệu trong báo cáo',
      'Gửi báo cáo hai tuần một lần',
    ],
    correctIndex: 1,
    explanation: 'Dùng sáng tạo công nghệ số là đổi cách làm để công cụ đảm nhận phần lặp lại.',
  },

  // ── Miền 6: Ứng dụng trí tuệ nhân tạo ──
  {
    id: 'pq-6-1',
    domainNumber: 6,
    competencyCode: '6.1',
    level: 1,
    text: 'Phát biểu nào đúng về công cụ AI tạo sinh như chatbot?',
    options: [
      'Luôn trả lời chính xác vì đã học toàn bộ Internet',
      'Có thể tạo câu trả lời nghe hợp lý nhưng sai, nên cần kiểm tra lại thông tin quan trọng',
      'Chỉ dùng được cho lập trình viên',
      'Tự cập nhật thông tin theo thời gian thực',
    ],
    correctIndex: 1,
    explanation: 'AI tạo sinh có thể "bịa" thông tin; người dùng cần kiểm chứng trước khi dùng.',
  },
  {
    id: 'pq-6-2',
    domainNumber: 6,
    competencyCode: '6.2',
    level: 2,
    text: 'Bạn muốn nhờ chatbot AI công cộng tóm tắt hợp đồng có thông tin khách hàng. Cách làm đúng?',
    options: [
      'Dán nguyên văn hợp đồng vào chatbot',
      'Ẩn hoặc thay thế thông tin cá nhân, bí mật trước khi dùng, hoặc dùng công cụ AI công ty đã phê duyệt',
      'Chụp ảnh hợp đồng gửi chatbot',
      'Không bao giờ dùng AI trong công việc',
    ],
    correctIndex: 1,
    explanation: 'Dùng AI có trách nhiệm: không đưa dữ liệu nhạy cảm vào công cụ chưa được phê duyệt.',
  },
  {
    id: 'pq-6-3',
    domainNumber: 6,
    competencyCode: '6.3',
    level: 3,
    text: 'Công ty cân nhắc dùng một công cụ AI viết nội dung quảng cáo. Bạn đánh giá theo tiêu chí nào?',
    options: [
      'Giá rẻ nhất',
      'Chất lượng trên bộ đề thử của công ty, chính sách dữ liệu, rủi ro bản quyền, chi phí và quy trình duyệt của con người',
      'Số lượt tải trên kho ứng dụng',
      'Công cụ có nhiều tính năng nhất',
    ],
    correctIndex: 1,
    explanation: 'Đánh giá công cụ AI là thử trên bài toán thật và xét cả rủi ro dữ liệu, bản quyền, chi phí.',
  },
  {
    id: 'pq-6-4',
    domainNumber: 6,
    competencyCode: '6.1',
    level: 2,
    text: 'Câu lệnh (prompt) nào giúp AI viết email chăm sóc khách hàng tốt hơn?',
    options: [
      '"Viết email"',
      '"Viết email 120 chữ, giọng lịch sự, gửi khách đã mua gói A tháng trước, nhắc ưu đãi gia hạn đến 15/10, kết thúc bằng lời mời phản hồi"',
      '"Viết email hay nhất có thể"',
      '"Email khách hàng, nhanh"',
    ],
    correctIndex: 1,
    explanation: 'Câu lệnh tốt nêu rõ người nhận, mục đích, giọng văn, độ dài và chi tiết cần có.',
  },
];

export const ENTRY_QUESTIONS = [1, 2, 3, 4, 5, 6].flatMap((domain) =>
  QUESTION_BANK.filter((question) => question.domainNumber === domain).slice(0, 3),
);

export function questionsOfDomain(domainNumber: number): BankQuestion[] {
  return QUESTION_BANK.filter((question) => question.domainNumber === domainNumber);
}

export const QUESTION_BY_ID = new Map(QUESTION_BANK.map((question) => [question.id, question]));
