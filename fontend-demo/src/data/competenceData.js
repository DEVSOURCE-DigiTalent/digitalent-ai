export const DIGCOMP_AREAS = [
  {
    id: "area_1",
    code: "1.0",
    name: "Thông tin & Dữ liệu",
    enName: "Information & Data Literacy",
    description: "Tìm kiếm, đánh giá, quản lý, phân tích và xử lý thông tin/dữ liệu số phục vụ công việc chuyên môn.",
    icon: "Database",
    color: "primary",
  },
  {
    id: "area_2",
    code: "2.0",
    name: "Giao tiếp & Cộng tác",
    enName: "Communication & Collaboration",
    description: "Giao tiếp, chia sẻ thông tin, tương tác và phối hợp đa phòng ban trên các nền tảng số.",
    icon: "MessageSquareShare",
    color: "primary",
  },
  {
    id: "area_3",
    code: "3.0",
    name: "Sáng tạo Nội dung số",
    enName: "Digital Content Creation",
    description: "Tạo lập, biên tập, định dạng tài liệu, hình ảnh, báo cáo số hóa và bản tin nội bộ.",
    icon: "FileEdit",
    color: "accent",
  },
  {
    id: "area_4",
    code: "4.0",
    name: "An toàn Thông tin & Thiết bị",
    enName: "Safety & Security",
    description: "Bảo vệ tài khoản, thiết bị, dữ liệu cá nhân nhân viên và tuân thủ bảo mật doanh nghiệp.",
    icon: "ShieldCheck",
    color: "success",
  },
  {
    id: "area_5",
    code: "5.0",
    name: "Giải quyết Vấn đề Số",
    enName: "Problem Solving",
    description: "Xử lý sự cố kỹ thuật số thường gặp, áp dụng AI và công cụ tự động hóa công việc sáng tạo.",
    icon: "Cpu",
    color: "warning",
  }
];

export const ROLES_DATA = {
  hr: {
    id: "hr",
    title: "Chuyên viên Nhân sự (HR Specialist)",
    department: "Phòng Quản trị Nhân sự",
    profileType: "People & Data-oriented Digital User",
    avatar: "👩‍💼",
    description: "Phụ trách tuyển dụng, truyền thông nội bộ, quản lý hồ sơ nhân viên và vận hành hệ thống HRM/onboarding.",
    targets: {
      area_1: { requiredLevel: 4, label: "Level 3-4 (Intermediate)", note: "Quản lý employee records, recruitment data và HR reports" },
      area_2: { requiredLevel: 6, label: "Level 5-6 (Advanced)", note: "Tuyển dụng, giao tiếp nhân viên, online meetings và phối hợp liên phòng ban" },
      area_3: { requiredLevel: 4, label: "Level 3-4 (Intermediate)", note: "Tạo JD tuyển dụng, cẩm nang đào tạo, thông báo nội bộ" },
      area_4: { requiredLevel: 6, label: "Level 5-6 (Advanced)", note: "Bảo vệ thông tin cá nhân nhân viên, hợp đồng và quyền riêng tư" },
      area_5: { requiredLevel: 4, label: "Level 3-4 (Intermediate)", note: "Xử lý sự cố trong phần mềm nhân sự và quy trình số" }
    },
    initialProgress: {
      area_1: 75, // 75% completed towards required level
      area_2: 90,
      area_3: 60,
      area_4: 85,
      area_5: 50
    }
  },
  analyst: {
    id: "analyst",
    title: "Chuyên viên Phân tích Dữ liệu (Data Analyst)",
    department: "Phòng Chiến lược & Dữ liệu",
    profileType: "Advanced Digital Analytics User",
    avatar: "📊",
    description: "Khai thác báo cáo BI, xây dựng dashboard trực quan hóa và tư vấn số liệu tăng trưởng cho ban giám đốc.",
    targets: {
      area_1: { requiredLevel: 6, label: "Level 5-6 (Advanced)", note: "Xử lý kho dữ liệu lớn, ETL, truy vấn SQL và Business Intelligence" },
      area_2: { requiredLevel: 5, label: "Level 5-6 (Advanced)", note: "Trình bày insight số liệu và làm việc với các stakeholder" },
      area_3: { requiredLevel: 4, label: "Level 3-4 (Intermediate)", note: "Thiết kế dashboard báo cáo trực quan cho ban lãnh đạo" },
      area_4: { requiredLevel: 5, label: "Level 5-6 (Advanced)", note: "Bảo mật cơ sở dữ liệu doanh nghiệp và phân quyền truy cập" },
      area_5: { requiredLevel: 6, label: "Level 5-6 (Advanced)", note: "Tối ưu hóa pipeline xử lý dữ liệu và thuật toán phân tích" }
    },
    initialProgress: {
      area_1: 78,
      area_2: 65,
      area_3: 80,
      area_4: 45,
      area_5: 100
    }
  },
  marketing: {
    id: "marketing",
    title: "Chuyên viên Tiếp thị Số (Digital Marketing)",
    department: "Phòng Marketing & Truyền thông",
    profileType: "Advanced Digital Content & Analytics User",
    avatar: "🚀",
    description: "Quản lý chiến dịch quảng cáo đa kênh, sản xuất content số, phân tích hành vi khách hàng qua phễu chuyển đổi.",
    targets: {
      area_1: { requiredLevel: 6, label: "Level 5-6 (Advanced)", note: "Phân tích customer data, campaign metrics, web/social analytics" },
      area_2: { requiredLevel: 6, label: "Level 5-6 (Advanced)", note: "Giao tiếp số với khách hàng, agency và internal teams" },
      area_3: { requiredLevel: 6, label: "Level 5-6 (Advanced)", note: "Tạo/edit social posts, graphics, video, campaign content chất lượng cao" },
      area_4: { requiredLevel: 4, label: "Level 3-4 (Intermediate)", note: "Bảo vệ tài khoản quảng cáo, bản quyền dữ liệu và danh tính số" },
      area_5: { requiredLevel: 6, label: "Level 5-6 (Advanced)", note: "Tối ưu campaign, A/B testing và thử nghiệm công cụ AI marketing" }
    },
    initialProgress: {
      area_1: 65,
      area_2: 85,
      area_3: 95,
      area_4: 60,
      area_5: 70
    }
  },
  accounting: {
    id: "accounting",
    title: "Kế toán viên Doanh nghiệp (Corporate Accountant)",
    department: "Phòng Tài chính - Kế toán",
    profileType: "Digital Data & Compliance User",
    avatar: "📑",
    description: "Xử lý chứng từ hóa đơn điện tử, vận hành hệ thống phần mềm ERP kế toán và lập báo cáo tài chính tuân thủ.",
    targets: {
      area_1: { requiredLevel: 6, label: "Level 5-6 (Advanced)", note: "Kiểm tra, đối soát số liệu sổ sách, bảng tính và ERP tài chính" },
      area_2: { requiredLevel: 4, label: "Level 3-4 (Intermediate)", note: "Giao tiếp hóa đơn, giải trình số liệu với kiểm toán và cơ quan thuế" },
      area_3: { requiredLevel: 2, label: "Level 1-2 (Foundation)", note: "Xuất file biểu mẫu, biên bản bàn giao chuẩn định dạng quy định" },
      area_4: { requiredLevel: 6, label: "Level 5-6 (Advanced)", note: "Bảo mật tuyệt đối chữ ký số, tài khoản ngân hàng và số liệu thuế" },
      area_5: { requiredLevel: 4, label: "Level 3-4 (Intermediate)", note: "Xử lý sai lệch số liệu công thức và bảo trì dữ liệu kế toán" }
    },
    initialProgress: {
      area_1: 90,
      area_2: 50,
      area_3: 100,
      area_4: 85,
      area_5: 60
    }
  },
  ceo: {
    id: "ceo",
    title: "Giám đốc Điều hành (Chief Executive Officer)",
    department: "Ban Giám Đốc",
    profileType: "Strategic Digital User",
    avatar: "👔",
    description: "Định hướng chiến lược chuyển đổi số, ra quyết định dựa trên dữ liệu báo cáo kinh doanh và điều hành từ xa.",
    targets: {
      area_1: { requiredLevel: 6, label: "Level 5-6 (Advanced)", note: "Đọc hiểu BI dashboard, KPIs kinh doanh và ra quyết định chiến lược" },
      area_2: { requiredLevel: 6, label: "Level 5-6 (Advanced)", note: "Điều hành họp trực tuyến, truyền thông sứ mệnh và kết nối đối tác" },
      area_3: { requiredLevel: 4, label: "Level 3-4 (Intermediate)", note: "Xem xét slide thuyết trình đầu tư, báo cáo thường niên" },
      area_4: { requiredLevel: 6, label: "Level 5-6 (Advanced)", note: "Chịu trách nhiệm an ninh dữ liệu cấp cao và tuân thủ pháp lý số" },
      area_5: { requiredLevel: 6, label: "Level 5-6 (Advanced)", note: "Lựa chọn giải pháp công nghệ chiến lược và dẫn dắt đổi mới" }
    },
    initialProgress: {
      area_1: 85,
      area_2: 95,
      area_3: 70,
      area_4: 80,
      area_5: 90
    }
  }
};

// Course Modules extracted directly from the user's curricula
export const COURSE_MODULES = [
  {
    id: "mod-1-1",
    areaId: "area_1",
    level: "Foundation (DigComp 1-2)",
    courseCode: "A1-F",
    title: "Module 1: Tìm kiếm thông tin bằng từ khóa chuẩn xác",
    duration: "2 giờ",
    lessonsCount: 4,
    description: "Hiểu bản chất công cụ tìm kiếm, chuyển đổi câu hỏi tự nhiên thành từ khóa chuẩn xác (2-4 từ), loại bỏ từ thừa.",
    topics: [
      "Bản chất cơ chế chỉ mục (Indexing) của Search Engine",
      "Quy tắc rút gọn câu hỏi thành từ khóa hiệu quả",
      "Phân biệt kết quả tự nhiên (Organic) và tài trợ (Sponsored)",
      "Kỹ thuật đổi từ khóa khi tìm kiếm thất bại"
    ],
    quiz: [
      {
        id: "q1",
        question: "Công cụ tìm kiếm hoạt động bằng cách nào?",
        options: [
          "Quét toàn bộ Internet ngay lúc bạn gõ tìm kiếm",
          "Tìm trong mục lục (chỉ mục) đã được xây dựng và thu thập từ trước",
          "Hỏi trực tiếp các trang web đối tác theo thời gian thực",
          "Chỉ tìm trong các trang web chính phủ đã được xác minh"
        ],
        correct: 1,
        explanation: "Công cụ tìm kiếm khớp từ khóa với cơ sở dữ liệu chỉ mục (index) đã thu thập sẵn từ trước, không quét trực tiếp toàn Internet theo thời gian thực."
      },
      {
        id: "q2",
        question: "Từ khóa nào sau đây hiệu quả nhất để tìm quy định về nghỉ phép năm cho nhân viên?",
        options: [
          "Làm sao để xin nghỉ phép cho đúng và chuẩn",
          "quy định nghỉ phép năm người lao động",
          "nghỉ phép",
          "tôi muốn biết về chế độ nghỉ phép năm công ty"
        ],
        correct: 1,
        explanation: "'quy định nghỉ phép năm người lao động' là các danh từ và thuật ngữ chuyên ngành chuẩn, không chứa từ thừa hay ngôn ngữ hội thoại tự nhiên."
      },
      {
        id: "q3",
        question: "Kết quả có nhãn 'Được tài trợ' (Sponsored) trên Google có nghĩa là gì?",
        options: [
          "Đây là kết quả có độ chính xác cao nhất được Google chứng nhận",
          "Trang này đã được nhà nước kiểm duyệt",
          "Đơn vị sở hữu đã trả phí quảng cáo để xuất hiện ở vị trí ưu tiên này",
          "Đây là kết quả mới nhất được cập nhật trong ngày"
        ],
        correct: 2,
        explanation: "Quảng cáo trả phí được gắn nhãn tài trợ, không đồng nghĩa với độ tin cậy nội dung hay mức độ phù hợp khách quan cao nhất."
      }
    ]
  },
  {
    id: "mod-1-2",
    areaId: "area_1",
    level: "Foundation (DigComp 1-2)",
    courseCode: "A1-F",
    title: "Module 2: Nhận biết và đánh giá nguồn tin đáng tin cậy",
    duration: "2 giờ",
    lessonsCount: 3,
    description: "Đọc tên miền (.gov.vn, .edu.vn, .com), phân tích ngày ban hành, nhận diện 3 dấu hiệu tin rác/giật gân.",
    topics: [
      "Giải mã ý nghĩa các đuôi tên miền uy tín",
      "Tầm quan trọng của ngày xuất bản và tính cập nhật",
      "3 dấu hiệu cảnh báo tin không đáng tin cậy (Thiếu tác giả, giật gân, không dẫn nguồn)"
    ],
    quiz: [
      {
        id: "q4",
        question: "Đuôi tên miền nào ở Việt Nam được cấp riêng cho cơ quan nhà nước?",
        options: [
          ".com.vn",
          ".gov.vn",
          ".org.vn",
          ".net.vn"
        ],
        correct: 1,
        explanation: ".gov.vn (Government) là tên miền độc quyền dành riêng cho cơ quan ban ngành nhà nước Việt Nam, có độ tin cậy tham chiếu cao nhất."
      },
      {
        id: "q5",
        question: "Một bài viết ghi nhận số liệu thị trường nhưng không đề cập tác giả, đơn vị xuất bản hay nguồn gốc. Bạn nên đánh giá thế nào?",
        options: [
          "Bài viết chắc chắn là tin giả mạo",
          "Thiếu trách nhiệm giải trình và không thể kiểm chứng, cần hết sức thận trọng và đối chiếu nguồn gốc",
          "Chắc chắn là bài viết của chuyên gia bí mật",
          "Không quan trọng miễn là số liệu nghe hợp lý"
        ],
        correct: 1,
        explanation: "Thiếu tác giả và nguồn gốc là tín hiệu cảnh báo quan trọng về tính xác thực, cần đối chiếu với nguồn dữ liệu sơ cấp."
      }
    ]
  },
  {
    id: "mod-1-3",
    areaId: "area_1",
    level: "Intermediate (DigComp 3-4)",
    courseCode: "A1-I",
    title: "Module 3: Chiến lược tìm kiếm nâng cao với Toán tử",
    duration: "3 giờ",
    lessonsCount: 4,
    description: "Sử dụng thành thạo các toán tử tìm kiếm chuyên sâu: site:, filetype:pdf, \"ngoặc kép\", toán tử loại trừ (-).",
    topics: [
      "Cú pháp kết hợp đa toán tử trong nghiên cứu doanh nghiệp",
      "Toán tử tìm file tài liệu chuyên ngành: filetype:pdf, filetype:xlsx",
      "Cách loại trừ nhiễu tuyển sinh, quảng cáo bằng dấu trừ (-)",
      "Xây dựng ma trận từ khóa đồng nghĩa"
    ],
    quiz: [
      {
        id: "q6",
        question: "Cú pháp tìm kiếm nào sau đây chỉ trả về file PDF trên các website chính phủ chứa chính xác cụm từ 'an toàn thực phẩm'?",
        options: [
          "an toàn thực phẩm gov pdf",
          "site:gov.vn \"an toàn thực phẩm\" filetype:pdf",
          "\"site:gov.vn\" + an toàn thực phẩm + pdf",
          "gov.vn/an-toan-thuc-pham.pdf"
        ],
        correct: 1,
        explanation: "Toán tử site: giới hạn tên miền, dấu \"\" cố định cụm từ chính xác, và filetype: lọc đúng định dạng tài liệu."
      },
      {
        id: "q7",
        question: "Khi cần loại bỏ các kết quả về 'tuyển sinh' trong quá trình tìm hiểu về 'đào tạo nhân viên', bạn nên dùng:",
        options: [
          "+tuyển sinh",
          "-tuyển sinh",
          "/tuyển sinh",
          "*tuyển sinh"
        ],
        correct: 1,
        explanation: "Toán tử dấu trừ '-' (không có khoảng trắng sau dấu trừ) loại bỏ triệt để các trang có chứa từ khóa đó khỏi kết quả."
      }
    ]
  },
  {
    id: "mod-2-1",
    areaId: "area_2",
    level: "Advanced (DigComp 5-6)",
    courseCode: "A2-A",
    title: "Giao tiếp & Phối hợp Liên phòng ban trên Nền tảng số",
    duration: "3.5 giờ",
    lessonsCount: 4,
    description: "Chuẩn hóa quy trình trao đổi số, văn hóa họp trực tuyến không đồng bộ (asynchronous), quản lý nhóm số hóa.",
    topics: [
      "Thiết lập kênh trao đổi MS Teams / Slack chuẩn doanh nghiệp",
      "Văn hóa phản hồi và quy định bảo mật khi gửi email nội bộ",
      "Điều phối cuộc họp trực tuyến chuyên nghiệp và ghi biên bản số"
    ],
    quiz: [
      {
        id: "q8",
        question: "Khi gửi email chứa danh sách thông tin cá nhân và mức lương của nhân sự, giải pháp nào an toàn nhất?",
        options: [
          "Gửi file Excel đính kèm công khai bình thường",
          "Mã hóa file có mật khẩu bảo vệ riêng, gửi link phân quyền trên SharePoint/OneDrive nội bộ có log truy cập",
          "Chụp ảnh gửi qua ứng dụng chat cá nhân",
          "Đưa lên Google Drive công khai"
        ],
        correct: 1,
        explanation: "Dữ liệu lương thưởng thuộc diện nhạy cảm cao, bắt buộc mã hóa, phân quyền danh tính nội bộ và kiểm soát nhật ký truy cập."
      }
    ]
  },
  {
    id: "mod-4-1",
    areaId: "area_4",
    level: "Advanced (DigComp 5-6)",
    courseCode: "A4-A",
    title: "Bảo vệ Dữ liệu Nhân sự & An toàn Định danh Số",
    duration: "4 giờ",
    lessonsCount: 5,
    description: "Nhận diện tấn công phi kỹ thuật (Phishing), quy tắc đặt mật khẩu đa yếu tố (2FA), tuân thủ Nghị định 13/2023/NĐ-CP.",
    topics: [
      "Bảo vệ dữ liệu cá nhân theo Nghị định 13 về Bảo vệ Dữ liệu Cá nhân",
      "Nhận diện thư giả mạo thương hiệu và đường link độc hại trong HR",
      "Cơ chế sao lưu dự phòng và phân quyền theo vai trò (RBAC)"
    ],
    quiz: [
      {
        id: "q9",
        question: "Một email gửi đến có tiêu đề 'Thông báo khẩn từ Ngân hàng - Tài khoản nhận lương bị khóa, click vào link để xác thực'. Bước xử lý đúng nhất là gì?",
        options: [
          "Click ngay vào link để mở khóa tài khoản kịp kỳ lương",
          "Chuyển tiếp cho đồng nghiệp xem thử",
          "Không click link, kiểm tra địa chỉ email người gửi thực tế và báo ngay cho bộ phận An toàn thông tin/IT",
          "Điền thông tin tài khoản thử xem sao"
        ],
        correct: 2,
        explanation: "Đây là hình thức tấn công lừa đảo giả mạo (Phishing) phổ biến. Tuyệt đối không click và cần báo cáo IT doanh nghiệp kiểm tra."
      }
    ]
  }
];
