// Dữ liệu chuẩn hóa theo tài liệu "Báo cáo xây dựng ma trận năng lực số" cho vị trí Marketing
export const MARKETING_ROLE = {
  id: "marketing",
  title: "Chuyên viên Tiếp thị Số (Digital Marketing)",
  department: "Phòng Marketing & Truyền thông",
  roleCode: "MKT-DIG-01",
  profileType: "Advanced Digital Content & Analytics User",
  avatar: "🚀",
  summary: "Vị trí có yêu cầu cao nhất về Digital Content Creation và Data Analytics trong doanh nghiệp, quản lý các chiến dịch đa kênh từ tiếp cận đến chuyển đổi.",
  keyTools: ["Meta Ads", "Google Analytics 4", "Canva/Adobe", "CapCut/Premiere", "HubSpot/CRM", "AI Copywriting"],
  targets: {
    area_1: {
      id: "area_1",
      name: "Thông tin & Phân tích Dữ liệu",
      enName: "Information & Data Literacy",
      requiredLevel: 6,
      requiredLabel: "Level 5-6 (Advanced)",
      currentScore: 70,
      status: "learning",
      description: "Phân tích customer data, chỉ số chiến dịch (CTR, CPA, ROAS), đọc hiểu báo cáo web/social analytics để tối ưu chi phí quảng cáo.",
      color: "primary"
    },
    area_2: {
      id: "area_2",
      name: "Giao tiếp & Phối hợp Số",
      enName: "Communication & Collaboration",
      requiredLevel: 6,
      requiredLabel: "Level 5-6 (Advanced)",
      currentScore: 90,
      status: "passed",
      description: "Giao tiếp số đa kênh với khách hàng trên mạng xã hội, phối hợp làm việc với Creative Agency, Designer và đội ngũ Sales qua nền tảng số.",
      color: "primary"
    },
    area_3: {
      id: "area_3",
      name: "Sáng tạo Nội dung Số (Đặc trưng)",
      enName: "Digital Content Creation",
      requiredLevel: 6,
      requiredLabel: "Level 5-6 (Advanced - Trọng tâm)",
      currentScore: 88,
      status: "passed",
      description: "Sáng tạo và biên tập bài viết social, thiết kế banner/infographic, sản xuất short-video, quản trị website và ứng dụng AI tạo nội dung.",
      color: "accent"
    },
    area_4: {
      id: "area_4",
      name: "An toàn Thông tin & Bản quyền Số",
      enName: "Safety & Brand Protection",
      requiredLevel: 4,
      requiredLabel: "Level 3-4 (Intermediate)",
      currentScore: 80,
      status: "passed",
      description: "Bảo mật tài khoản Business Manager (BM), fanpage, tuân thủ luật bản quyền hình ảnh/âm thanh và bảo vệ dữ liệu khách hàng theo Nghị định 13.",
      color: "success"
    },
    area_5: {
      id: "area_5",
      name: "Giải quyết Vấn đề & Tối ưu Chiến lược",
      enName: "Problem Solving & Optimization",
      requiredLevel: 6,
      requiredLabel: "Level 5-6 (Advanced)",
      currentScore: 58,
      status: "warning",
      description: "Xử lý sự cố quảng cáo bị vô hiệu hóa, chạy A/B testing tối ưu tỷ lệ chuyển đổi (CRO) và thử nghiệm các giải pháp tiếp thị MarTech mới.",
      color: "warning"
    }
  }
};

export const MARKETING_COURSES = [
  {
    id: "mkt-mod-1",
    areaId: "area_3",
    code: "MKT-301",
    title: "Sáng tạo Nội dung Đa kênh & Ứng dụng AI Content",
    level: "Advanced (Level 5-6)",
    duration: "4 giờ",
    badge: "Trọng tâm vị trí",
    status: "completed",
    score: 95,
    description: "Làm chủ quy trình sản xuất nội dung số: copywriting, thiết kế visual đa định dạng (ảnh, carousel, reels) và kỹ năng viết prompt AI chuyên nghiệp.",
    lessons: [
      { id: "l1", title: "Cấu trúc Content Viral & Phễu chuyển đổi AIDA trên Social Media", duration: "25 phút" },
      { id: "l2", title: "Nguyên tắc bản quyền hình ảnh, âm thanh thương mại & sở hữu trí tuệ số", duration: "30 phút" },
      { id: "l3", title: "Tối ưu hóa sản xuất Video ngắn (TikTok, Reels, Shorts) bằng CapCut", duration: "40 phút" },
      { id: "l4", title: "Khai thác ChatGPT & Midjourney tạo kịch bản, ấn phẩm truyền thông", duration: "35 phút" }
    ],
    quiz: [
      {
        id: "q1_1",
        question: "Khi sử dụng âm thanh hoặc hình ảnh từ Internet cho một chiến dịch quảng cáo trả phí (Commercial Ads), hành động nào sau đây là đúng luật bản quyền?",
        options: [
          "Ghi nguồn 'Sưu tầm từ Internet' ở cuối bài viết là được phép dùng tự do",
          "Chỉ sử dụng tài nguyên có giấy phép thương mại (Commercial License / Royalty-Free) hoặc đã mua bản quyền từ tác giả",
          "Bất kỳ hình ảnh nào tìm được trên Google Hình ảnh đều được quyền dùng quảng cáo",
          "Chỉnh sửa thay đổi màu sắc 20% thì không còn vi phạm bản quyền"
        ],
        correct: 1,
        explanation: "Trong hoạt động thương mại doanh nghiệp, bắt buộc phải có giấy phép bản quyền thương mại (Commercial License) rõ ràng để tránh rủi ro pháp lý và khóa tài khoản quảng cáo."
      },
      {
        id: "q1_2",
        question: "Công thức Prompt nào sau đây giúp AI tạo ra bài viết content marketing chính xác và đúng định vị thương hiệu nhất?",
        options: [
          "Viết cho tôi một bài bán hàng thật hay về mỹ phẩm",
          "Hãy đóng vai chuyên gia copywriter, viết bài giới thiệu serum chống lão hóa cho phụ nữ 25-35 tuổi, tone giọng chuyên nghiệp, áp dụng cấu trúc PAS và có lời kêu gọi CTA rõ ràng",
          "Viết bài quảng cáo dài 1000 từ để đăng Facebook",
          "Copy nội dung đối thủ và sửa lại cho tôi"
        ],
        correct: 1,
        explanation: "Prompt chất lượng cao cần xác định rõ: Vai trò (Role), Đối tượng mục tiêu (Audience), Bối cảnh, Cấu trúc nội dung (Framework) và Tone & Voice của thương hiệu."
      }
    ]
  },
  {
    id: "mkt-mod-2",
    areaId: "area_1",
    code: "MKT-102",
    title: "Phân tích Dữ liệu Marketing & Đo lường Hiệu quả Chiến dịch (Analytics)",
    level: "Advanced (Level 5-6)",
    duration: "5 giờ",
    badge: "Đang học",
    status: "in_progress",
    score: 70,
    description: "Đọc hiểu báo cáo Google Analytics 4, thiết lập theo dõi sự kiện (Event tracking), phân tích chỉ số CTR, CPC, CAC, ROAS và LTV.",
    lessons: [
      { id: "l5", title: "Tổng quan về GA4: Khác biệt chỉ số Phiên (Sessions) và Người dùng (Users)", duration: "30 phút" },
      { id: "l6", title: "Giải mã các chỉ số cốt lõi trong Paid Ads: CPM, CPC, CTR, CPA và ROAS", duration: "45 phút" },
      { id: "l7", title: "Phân tích hành vi người dùng trên Landing Page thông qua Heatmap", duration: "30 phút" },
      { id: "l8", title: "Xây dựng Dashboard tự động hóa báo cáo Marketing trên Looker Studio", duration: "50 phút" }
    ],
    quiz: [
      {
        id: "q2_1",
        question: "Chiến dịch quảng cáo Facebook có ngân sách 10.000.000 VNĐ, mang về doanh thu bán hàng trực tiếp là 40.000.000 VNĐ. Chỉ số ROAS (Return on Ad Spend) của chiến dịch này là bao nhiêu?",
        options: [
          "0.25",
          "2.5x",
          "4.0x (hay 400%)",
          "40%"
        ],
        correct: 2,
        explanation: "ROAS = Doanh thu từ quảng cáo / Chi phí quảng cáo = 40.000.000 / 10.000.000 = 4.0x (nghĩa là 1 đồng chi phí quảng cáo tạo ra 4 đồng doanh thu)."
      },
      {
        id: "q2_2",
        question: "Một chiến dịch quảng cáo có chỉ số CTR (Click-Through Rate) rất cao (5%) nhưng tỷ lệ chuyển đổi mua hàng trên website (Conversion Rate) lại cực thấp (< 0.2%). Vấn đề chính có khả năng cao nằm ở đâu?",
        options: [
          "Nội dung quảng cáo trên Facebook chưa thu hút",
          "Landing Page có trải nghiệm kém, nội dung không khớp với quảng cáo hoặc nút thanh toán gặp lỗi",
          "Ngân sách quảng cáo quá nhỏ",
          "Facebook không phân phối quảng cáo đến đúng người"
        ],
        correct: 1,
        explanation: "CTR cao chứng tỏ mẫu quảng cáo tiếp cận và thu hút người xem tốt; tuy nhiên tỷ lệ chuyển đổi thấp tại web cho thấy nút thắt nằm ở trải nghiệm Landing Page, giá cả hoặc quy trình checkout."
      }
    ]
  },
  {
    id: "mkt-mod-3",
    areaId: "area_5",
    code: "MKT-501",
    title: "Tối ưu hóa Tỷ lệ Chuyển đổi (CRO) & Xử lý Sự cố Kỹ thuật số",
    level: "Advanced (Level 5-6)",
    duration: "3.5 giờ",
    badge: "Cần cải thiện",
    status: "not_started",
    score: 55,
    description: "Thực hiện kiểm thử A/B Testing chuẩn khoa học, quy trình kháng nghị tài khoản quảng cáo và áp dụng Marketing Automation.",
    lessons: [
      { id: "l9", title: "Phương pháp thiết lập giả thuyết và chạy A/B Testing đa biến", duration: "35 phút" },
      { id: "l10", title: "Xử lý sự cố: Tài khoản Business Manager bị hạn chế và kháng nghị chính sách", duration: "40 phút" },
      { id: "l11", title: "Thiết lập kịch bản Email Marketing tự động nuôi dưỡng khách hàng tiềm năng", duration: "45 phút" }
    ],
    quiz: [
      {
        id: "q3_1",
        question: "Khi tiến hành kiểm thử A/B testing cho 2 tiêu đề (headline) của một mẫu quảng cáo, nguyên tắc quan trọng nhất cần tuân thủ là gì?",
        options: [
          "Thay đổi đồng thời cả tiêu đề, hình ảnh và giá sản phẩm để xem cái nào tốt hơn",
          "Chỉ thay đổi duy nhất một yếu tố (tiêu đề), giữ nguyên hình ảnh, đối tượng nhắm mục tiêu và phân bổ ngân sách đồng đều",
          "Chạy 2 mẫu vào 2 thời điểm khác nhau trong năm",
          "Mẫu nào có nhiều like hơn thì lập tức kết luận là chiến thắng"
        ],
        correct: 1,
        explanation: "Trong A/B testing chuẩn, chỉ được kiểm tra một biến số độc lập duy nhất tại một thời điểm để đảm bảo tính chuẩn xác của nguyên nhân dẫn đến sự khác biệt kết quả."
      },
      {
        id: "q3_2",
        question: "Khi tài khoản quảng cáo Meta Ads bị gắn cờ vi phạm chính sách do nghi ngờ gian lận, bước đầu tiên chuyên viên Marketing nên làm là gì?",
        options: [
          "Lập tức tạo tài khoản cá nhân mới để chạy tiếp",
          "Kiểm tra kỹ thông báo lỗi trong Chất lượng tài khoản (Account Quality), rà soát nội dung/trang đích vi phạm và chuẩn bị giấy tờ doanh nghiệp để gửi kháng nghị chính thức",
          "Spam nút yêu cầu xem xét liên tục 10 lần",
          "Xóa toàn bộ chiến dịch cũ"
        ],
        correct: 1,
        explanation: "Cần rà soát chính xác vi phạm tại Account Quality và gửi kháng nghị bằng tài liệu định danh xác thực để bảo toàn độ uy tín (trust) của Business Manager."
      }
    ]
  },
  {
    id: "mkt-mod-4",
    areaId: "area_4",
    code: "MKT-401",
    title: "An toàn Thông tin & Quản trị Danh tính Thương hiệu Số",
    level: "Intermediate (Level 3-4)",
    duration: "2.5 giờ",
    badge: "Đạt chuẩn",
    status: "completed",
    score: 85,
    description: "Bảo mật tài sản số doanh nghiệp: Fanpage, Kênh TikTok, Business Manager, kích hoạt xác thực 2 lớp (2FA) và quản lý phân quyền Agency.",
    lessons: [
      { id: "l12", title: "Mô hình phân quyền an toàn trên Meta Business Suite & Google Ads", duration: "25 phút" },
      { id: "l13", title: "Cảnh giác với các chiêu trò lừa đảo chiếm quyền Fanpage qua link độc hại", duration: "35 phút" },
      { id: "l14", title: "Quy chuẩn lưu trữ và bảo vệ danh sách dữ liệu số điện thoại khách hàng (Lead)", duration: "30 phút" }
    ],
    quiz: [
      {
        id: "q4_1",
        question: "Khi hợp tác với một Digital Agency bên ngoài để chạy chiến dịch, cách phân quyền an toàn nhất trên Meta Business Manager là gì?",
        options: [
          "Gửi tài khoản mật khẩu Facebook cá nhân của bạn cho Agency đăng nhập",
          "Thêm nhân viên Agency làm Quản trị viên (Admin) trực tiếp của Fanpage",
          "Yêu cầu Agency cung cấp ID Business Manager của họ và phân quyền Đối tác (Partner) với quyền hạn phù hợp (Advertiser)",
          "Tải toàn bộ cookie trình duyệt gửi qua tin nhắn"
        ],
        correct: 2,
        explanation: "Phân quyền Đối tác (Partner) qua Business Manager ID đảm bảo tách biệt tài sản doanh nghiệp, dễ dàng thu hồi quyền khi hết hợp đồng và bảo mật tài khoản cá nhân."
      }
    ]
  }
];
