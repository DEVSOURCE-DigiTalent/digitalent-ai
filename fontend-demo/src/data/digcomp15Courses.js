// Toàn bộ cấu trúc 5 Lĩnh vực, 15 Khóa học và 63 Module theo đúng chuẩn khung-chuong-trinh-15-khoa-digcomp.docx

export const DIGCOMP_AREAS_FULL = [
  {
    id: "area_1",
    code: "1",
    name: "Tìm kiếm, đánh giá, quản lý thông tin",
    enName: "Information & Data Literacy",
    subCompetencies: [
      { code: "1.1", name: "Duyệt, tìm kiếm và lọc dữ liệu, thông tin và nội dung số" },
      { code: "1.2", name: "Đánh giá dữ liệu, thông tin và nội dung số" },
      { code: "1.3", name: "Quản lý dữ liệu, thông tin và nội dung số" }
    ],
    marketingTarget: "A1-A", // Nâng cao (Level 5-6)
    marketingTargetLabel: "Nâng cao (Level 5-6)"
  },
  {
    id: "area_2",
    code: "2",
    name: "Giao tiếp và cộng tác",
    enName: "Communication & Collaboration",
    subCompetencies: [
      { code: "2.1", name: "Tương tác thông qua công nghệ số" },
      { code: "2.2", name: "Chia sẻ thông tin và nội dung số" },
      { code: "2.3", name: "Tham gia vào quyền công dân qua công nghệ số" },
      { code: "2.4", name: "Cộng tác thông qua công cụ kỹ thuật số" },
      { code: "2.5", name: "Chuẩn mực ứng xử trên mạng (Netiquette)" },
      { code: "2.6", name: "Quản lý danh tính số" }
    ],
    marketingTarget: "A2-A", // Nâng cao (Level 5-6)
    marketingTargetLabel: "Nâng cao (Level 5-6)"
  },
  {
    id: "area_3",
    code: "3",
    name: "Tạo lập nội dung",
    enName: "Digital Content Creation",
    subCompetencies: [
      { code: "3.1", name: "Phát triển nội dung số" },
      { code: "3.2", name: "Tích hợp và chỉnh sửa lại nội dung số" },
      { code: "3.3", name: "Bản quyền và giấy phép" },
      { code: "3.4", name: "Tư duy tính toán và lập trình" }
    ],
    marketingTarget: "A3-A", // Nâng cao (Level 5-6) - Trọng tâm cao nhất của Marketing
    marketingTargetLabel: "Nâng cao (Level 5-6 - Trọng tâm)"
  },
  {
    id: "area_4",
    code: "4",
    name: "An toàn, phúc lợi và sử dụng có trách nhiệm",
    enName: "Safety & Brand Protection",
    subCompetencies: [
      { code: "4.1", name: "Bảo vệ thiết bị và tài khoản" },
      { code: "4.2", name: "Bảo vệ dữ liệu cá nhân và quyền riêng tư" },
      { code: "4.3", name: "Bảo vệ sức khỏe và phúc lợi số" },
      { code: "4.4", name: "Bảo vệ môi trường số" }
    ],
    marketingTarget: "A4-I", // Trung cấp (Level 3-4) theo ma trận Section A8
    marketingTargetLabel: "Trung cấp (Level 3-4)"
  },
  {
    id: "area_5",
    code: "5",
    name: "Nhận diện và giải quyết vấn đề",
    enName: "Problem Solving",
    subCompetencies: [
      { code: "5.1", name: "Giải quyết các vấn đề kỹ thuật" },
      { code: "5.2", name: "Xác định nhu cầu và các giải pháp công nghệ" },
      { code: "5.3", name: "Sử dụng sáng tạo các công nghệ số" },
      { code: "5.4", name: "Xác định khoảng trống năng lực số" }
    ],
    marketingTarget: "A5-A", // Nâng cao (Level 5-6)
    marketingTargetLabel: "Nâng cao (Level 5-6)"
  }
];

// 15 Khóa học chuẩn hóa (3 khóa / 1 lĩnh vực)
export const DIGCOMP_15_COURSES = {
  // ================= LĨNH VỰC 1 =================
  "A1-F": {
    id: "A1-F",
    areaId: "area_1",
    level: "Cơ bản (Level 1-2)",
    title: "Tìm kiếm và lưu trữ thông tin cơ bản",
    duration: "6 giờ",
    prerequisite: "Không",
    targetRoles: ["Tất cả vị trí khởi đầu"],
    objective: "Người học tìm được thông tin cần thiết bằng từ khóa đơn giản, nhận biết nguồn tin cơ bản và lưu trữ tài liệu có chủ đích.",
    modules: [
      {
        id: "A1-F-M1",
        code: "A1-F-M1",
        competenceCode: "1.1",
        title: "Module 1: Tìm kiếm thông tin bằng từ khóa",
        duration: "2 giờ",
        description: "Bản chất công cụ tìm kiếm, rút gọn câu hỏi thành 2-4 từ khóa, phân biệt kết quả tự nhiên và quảng cáo.",
        quiz: [
          {
            q: "Công cụ tìm kiếm hoạt động bằng cách nào?",
            opts: [
              "Quét toàn bộ Internet ngay lúc bạn gõ tìm kiếm",
              "Khớp từ khóa với chỉ mục (index) đã được thu thập sẵn từ trước",
              "Hỏi trực tiếp các trang web đối tác",
              "Chỉ quét các trang web chính phủ"
            ],
            ans: 1,
            exp: "Search Engine tìm trong chỉ mục đã lập sẵn từ trước, không quét Internet thời gian thực."
          }
        ]
      },
      {
        id: "A1-F-M2",
        code: "A1-F-M2",
        competenceCode: "1.2",
        title: "Module 2: Nhận biết nguồn tin đáng tin cậy",
        duration: "2 giờ",
        description: "Đọc tên miền (.gov.vn, .edu.vn, .com), kiểm tra ngày xuất bản, nhận diện 3 dấu hiệu tin rác.",
        quiz: [
          {
            q: "Đuôi tên miền nào ở Việt Nam được cấp riêng cho cơ quan nhà nước?",
            opts: [".com.vn", ".gov.vn", ".org.vn", ".net.vn"],
            ans: 1,
            exp: ".gov.vn là tên miền độc quyền của cơ quan nhà nước."
          }
        ]
      },
      {
        id: "A1-F-M3",
        code: "A1-F-M3",
        competenceCode: "1.3",
        title: "Module 3: Lưu trữ và sắp xếp tài liệu",
        duration: "2 giờ",
        description: "Các định dạng tệp (.docx, .xlsx, .pdf), quy tắc đặt tên theo chuẩn Năm-Tháng-Ngày_NộiDung.",
        quiz: [
          {
            q: "Tên tệp nào sau đây đúng quy tắc chuẩn hóa lưu trữ nhất?",
            opts: [
              "bao-cao-final-v2-that.docx",
              "2026-04-09_bao-cao-thang4_v01.docx",
              "document1.docx",
              "BÁO CÁO MỚI!!.docx"
            ],
            ans: 1,
            exp: "Định dạng YYYY-MM-DD giúp tệp tự sắp xếp thứ tự thời gian trên hệ điều hành."
          }
        ]
      }
    ]
  },
  "A1-I": {
    id: "A1-I",
    areaId: "area_1",
    level: "Trung cấp (Level 3-4)",
    title: "Chiến lược tìm kiếm và quản lý thông tin",
    duration: "7.5 giờ",
    prerequisite: "A1-F",
    targetRoles: ["HR", "Sales/CRM"],
    objective: "Người học tự thiết kế chiến lược tìm kiếm, đánh giá nguồn tin theo bộ 5 tiêu chí và quản lý khối lượng tài liệu lớn.",
    modules: [
      {
        id: "A1-I-M1",
        code: "A1-I-M1",
        competenceCode: "1.1",
        title: "Module 1: Chiến lược tìm kiếm và toán tử",
        duration: "2.5 giờ",
        description: "Sử dụng 6 toán tử chuyên sâu: site:, filetype:pdf, \"ngoặc kép\", toán tử loại trừ (-), OR.",
        quiz: [
          {
            q: "Cú pháp nào lọc chính xác file PDF trên trang chính phủ có chứa cụm từ 'đào tạo nhân sự'?",
            opts: [
              "site:gov.vn \"đào tạo nhân sự\" filetype:pdf",
              "gov.vn pdf đào tạo nhân sự",
              "\"site:gov.vn\" + filetype",
              "dao-tao-nhan-su.pdf"
            ],
            ans: 0,
            exp: "Kết hợp site:, ngoặc kép và filetype: cho kết quả chuẩn tuyệt đối."
          }
        ]
      },
      {
        id: "A1-I-M2",
        code: "A1-I-M2",
        competenceCode: "1.2",
        title: "Module 2: Đánh giá và so sánh nguồn tin",
        duration: "2.5 giờ",
        description: "Bộ 5 tiêu chí (Tác giả, Thời điểm, Mục đích, Bằng chứng, Kiểm chứng), phân biệt nguồn sơ cấp và thứ cấp.",
        quiz: [
          {
            q: "Hiện tượng 5 trang web cùng trích dẫn một bài blog chưa kiểm chứng được gọi là gì?",
            opts: ["Xác thực đa nguồn", "Hiện tượng trích dẫn vòng (Circular citation)", "Dữ liệu lớn", "Bằng chứng sơ cấp"],
            ans: 1,
            exp: "Trích dẫn vòng tạo cảm giác tin cậy giả tạo nhưng thực chất chỉ có 1 nguồn gốc duy nhất."
          }
        ]
      },
      {
        id: "A1-I-M3",
        code: "A1-I-M3",
        competenceCode: "1.3",
        title: "Module 3: Tổ chức và quản lý khối lượng thông tin lớn",
        duration: "2.5 giờ",
        description: "Thiết kế sổ đăng ký tài liệu, lưu trữ đám mây có kiểm soát phiên bản và phân quyền chia sẻ.",
        quiz: [
          {
            q: "Phát biểu nào sau đây đúng về cơ chế sao lưu (Backup)?",
            opts: [
              "Đồng bộ hóa Google Drive chính là sao lưu hoàn chỉnh",
              "Đồng bộ không phải sao lưu; nếu tệp bị xóa hoặc dính mã độc ở máy tính, đám mây cũng sẽ bị xóa đồng bộ",
              "Chỉ cần lưu vào ổ đĩa D là an toàn tuyệt đối",
              "Không cần sao lưu nếu dùng tài khoản công ty"
            ],
            ans: 1,
            exp: "Đồng bộ hóa 2 chiều lan truyền cả thao tác xóa lỗi, bắt buộc phải có bản sao lưu độc lập (versioning/cold backup)."
          }
        ]
      }
    ]
  },
  "A1-A": {
    id: "A1-A",
    areaId: "area_1",
    level: "Nâng cao (Level 5-6)",
    title: "Phân tích thông tin và quản trị dữ liệu",
    duration: "9 giờ",
    prerequisite: "A1-I",
    targetRoles: ["Marketing (Đích)", "CEO", "Kế toán"],
    objective: "Xử lý vấn đề thông tin phức tạp đa nguồn, đánh giá 6 chiều chất lượng dữ liệu và thiết lập từ điển dữ liệu quản trị.",
    modules: [
      {
        id: "A1-A-M1",
        code: "A1-A-M1",
        competenceCode: "1.1",
        title: "Module 1: Nghiên cứu phức hợp đa nguồn",
        duration: "3 giờ",
        description: "Phối hợp nguồn bên ngoài và dữ liệu nội bộ, tam giác hóa bằng chứng, xử lý khoảng trống thông tin thị trường.",
        quiz: [
          {
            q: "Khi dữ liệu thị trường về đối thủ cạnh tranh không công khai đầy đủ, phương pháp nghiên cứu nào chuẩn khoa học?",
            opts: [
              "Tự bịa số liệu cho đẹp báo cáo",
              "Tam giác hóa bằng chứng (kết hợp báo cáo ngành, phỏng vấn chuyên gia và dữ liệu gián tiếp) để ước lượng có căn cứ",
              "Bỏ qua không phân tích đối thủ",
              "Chỉ dùng số liệu của 1 trang báo lá cải"
            ],
            ans: 1,
            exp: "Tam giác hóa (Triangulation) đa nguồn cho phép ước lượng độ tin cậy khoa học khi thiếu dữ liệu trực tiếp."
          }
        ]
      },
      {
        id: "A1-A-M2",
        code: "A1-A-M2",
        competenceCode: "1.2",
        title: "Module 2: Đánh giá chất lượng dữ liệu",
        duration: "3 giờ",
        description: "Đánh giá theo 6 chiều: Chính xác, Đầy đủ, Nhất quán, Kịp thời, Hợp lệ, Duy nhất. Thiết lập quy tắc kiểm tra tự động.",
        quiz: [
          {
            q: "Trong 6 chiều chất lượng dữ liệu, kiểm tra trường 'Email' hoặc 'Số điện thoại' có đúng định dạng thuộc chiều nào?",
            opts: ["Tính hợp lệ (Validity)", "Tính kịp thời (Timeliness)", "Tính độc nhất (Uniqueness)", "Tính bao trùm"],
            ans: 0,
            exp: "Tính hợp lệ kiểm tra dữ liệu có tuân thủ đúng định dạng và miền giá trị quy định hay không."
          }
        ]
      },
      {
        id: "A1-A-M3",
        code: "A1-A-M3",
        competenceCode: "1.3",
        title: "Module 3: Quản trị dữ liệu và vòng đời thông tin",
        duration: "3 giờ",
        description: "Xây từ điển dữ liệu (Data Dictionary), xác định nguồn chân lý duy nhất (Single Source of Truth), lịch lưu trữ và hủy.",
        quiz: [
          {
            q: "Để chấm dứt tình trạng phòng Marketing và phòng Kế toán báo cáo doanh thu lệch nhau, giải pháp quản trị cốt lõi là gì?",
            opts: [
              "Bắt hai phòng họp cãi nhau mỗi tuần",
              "Xây dựng Từ điển dữ liệu thống nhất định nghĩa chỉ tiêu và xác định Nguồn chân lý duy nhất (Single Source of Truth)",
              "Chỉ tin số liệu của Giám đốc",
              "Xóa sổ sách cả hai bên"
            ],
            ans: 1,
            exp: "Single Source of Truth và Từ điển dữ liệu chuẩn hóa loại bỏ hoàn toàn sự mâu thuẫn về định nghĩa chỉ tiêu."
          }
        ]
      }
    ]
  },

  // ================= LĨNH VỰC 2 =================
  "A2-A": {
    id: "A2-A",
    areaId: "area_2",
    level: "Nâng cao (Level 5-6)",
    title: "Lãnh đạo giao tiếp và cộng tác số",
    duration: "18 giờ",
    prerequisite: "A2-I",
    targetRoles: ["Marketing (Đích)", "CEO", "HR", "Sales/CRM"],
    objective: "Thiết kế hệ thống kênh giao tiếp toàn diện cho tổ chức, quản trị khủng hoảng truyền thông mạng xã hội và dẫn dắt đội ngũ làm việc số.",
    modules: [
      {
        id: "A2-A-M1",
        code: "A2-A-M1",
        competenceCode: "2.1",
        title: "Module 1: Chiến lược giao tiếp tổ chức",
        duration: "3 giờ",
        description: "Thiết kế kiến trúc kênh, giao tiếp bất đồng bộ, truyền thông thay đổi và đo lường tỷ lệ hiểu đúng thông điệp.",
        quiz: [{ q: "Ưu điểm lớn nhất của văn hóa giao tiếp bất đồng bộ (Asynchronous) trong doanh nghiệp là gì?", opts: ["Nhân sự có thời gian tập trung sâu (Deep work) và phản hồi thấu đáo", "Bắt buộc mọi người phải trả lời sau 2 phút", "Không cần ghi chép gì", "Thay thế hoàn toàn giám đốc"], ans: 0, exp: "Giao tiếp bất đồng bộ giảm tải họp hành vụn vặt và tăng thời gian làm việc tập trung." }]
      },
      {
        id: "A2-A-M2",
        code: "A2-A-M2",
        competenceCode: "2.2",
        title: "Module 2: Quản trị luồng chia sẻ thông tin",
        duration: "3 giờ",
        description: "Ma trận phân quyền theo vai trò (RBAC), bảo mật thông tin khi làm việc với Creative Agency bên ngoài.",
        quiz: [{ q: "Phương thức chia sẻ dữ liệu chiến dịch cho Agency bên ngoài an toàn nhất là gì?", opts: ["Gửi qua chat cá nhân", "Phân quyền Đối tác qua Business Manager ID có ràng buộc bảo mật", "Đưa mật khẩu tài khoản Admin", "Đăng lên mạng xã hội"], ans: 1, exp: "Phân quyền Partner ID tách biệt hoàn toàn tài sản doanh nghiệp và dễ dàng thu hồi." }]
      },
      {
        id: "A2-A-M3",
        code: "A2-A-M3",
        competenceCode: "2.3",
        title: "Module 3: Doanh nghiệp trong môi trường số công cộng",
        duration: "3 giờ",
        description: "Nghĩa vụ tuân thủ số, lưu trữ chứng từ điện tử phục vụ thanh kiểm tra, giao dịch cổng dịch vụ công.",
        quiz: [{ q: "Doanh nghiệp có nghĩa vụ pháp lý gì khi phát hiện sự cố lộ lọt dữ liệu khách hàng theo Nghị định 13?", opts: ["Giấu kín không báo ai", "Thông báo cho Bộ Công an (A05) trong vòng 72 giờ và thông báo cho khách hàng", "Đợi 1 năm sau mới báo", "Chỉ cần xóa fanpage"], ans: 1, exp: "Nghị định 13 quy định thời hạn thông báo sự cố trong 72 giờ." }]
      },
      {
        id: "A2-A-M4",
        code: "A2-A-M4",
        competenceCode: "2.4",
        title: "Module 4: Dẫn dắt cộng tác nhóm phân tán",
        duration: "3 giờ",
        description: "Mô hình làm việc kết hợp (Hybrid work), giải quyết xung đột trên không gian ảo và cải tiến quy trình liên phòng ban.",
        quiz: [{ q: "Yếu tố nào quan trọng nhất để điều phối nhóm làm việc từ xa hiệu quả?", opts: ["Camera soi màn hình 24/7", "Mục tiêu đầu ra rõ ràng (Deliverables) và tài liệu quy trình minh bạch", "Gọi điện liên tục", "Cắt giảm lương"], ans: 1, exp: "Quản trị dựa trên kết quả đầu ra (Output-based) là nguyên tắc cốt lõi của làm việc số." }]
      },
      {
        id: "A2-A-M5",
        code: "A2-A-M5",
        competenceCode: "2.5",
        title: "Module 5: Văn hóa ứng xử số và xử lý khủng hoảng",
        duration: "3 giờ",
        description: "Kịch bản phản ứng khủng hoảng 24 giờ đầu, quy tắc phát ngôn thương hiệu và tiếp nhận khiếu nại khách hàng.",
        quiz: [{ q: "Trong 24 giờ đầu của khủng hoảng truyền thông mạng xã hội, điều cấm kỵ nhất là gì?", opts: ["Lắng nghe phản hồi", "Xóa bình luận chỉ trích của khách hàng và đăng đàn đôi co thách thức", "Thành lập ban xử lý khủng hoảng", "Rà soát nguyên nhân gốc"], ans: 1, exp: "Xóa bình luận và đôi co kích hoạt hiệu ứng Streisand khiến khủng hoảng bùng phát dữ dội hơn." }]
      },
      {
        id: "A2-A-M6",
        code: "A2-A-M6",
        competenceCode: "2.6",
        title: "Module 6: Danh tính số của tổ chức",
        duration: "3 giờ",
        description: "Quản lý hiện diện số thương hiệu, chính sách nhân viên là đại sứ thương hiệu, phòng chống mạo danh doanh nghiệp.",
        quiz: [{ q: "Chính sách phát ngôn mạng xã hội cho nhân viên nhằm mục đích chính là gì?", opts: ["Cấm nhân viên dùng mạng xã hội", "Bảo vệ uy tín thương hiệu và hướng dẫn nhân viên chia sẻ thông tin đúng mực, an toàn", "Bắt nhân viên like bài 100 lần", "Đọc trộm tin nhắn cá nhân"], ans: 1, exp: "Chính sách phát ngôn thiết lập ranh giới rõ ràng giữa phát ngôn cá nhân và đại diện tổ chức." }]
      }
    ]
  },

  // ================= LĨNH VỰC 3 =================
  "A3-A": {
    id: "A3-A",
    areaId: "area_3",
    level: "Nâng cao (Level 5-6)",
    title: "Chiến lược nội dung và giải pháp số",
    duration: "12 giờ",
    prerequisite: "A3-I",
    targetRoles: ["Marketing (Đích - Trọng tâm cao nhất)"],
    objective: "Người học xây dựng chiến lược nội dung đa kênh, thiết kế thư viện tài sản nội dung mô-đun, quản trị rủi ro pháp lý bản quyền và ứng dụng AI tự động hóa MarTech.",
    modules: [
      {
        id: "A3-A-M1",
        code: "A3-A-M1",
        competenceCode: "3.1",
        title: "Module 1: Chiến lược và hệ thống sản xuất nội dung",
        duration: "3 giờ",
        description: "Bản đồ nội dung theo hành trình khách hàng (AIDA), lịch xuất bản đa kênh, quy trình kiểm soát chất lượng và Prompt Engineering.",
        quiz: [
          {
            q: "Cấu trúc Prompt AI nào sau đây tạo ra bài viết chuyển đổi cao và chuẩn định vị thương hiệu nhất?",
            opts: [
              "Viết cho tôi một bài quảng cáo thật hay",
              "Xác định rõ Role (Chuyên gia), Context, Đối tượng độc giả, Framework cấu trúc (PAS/AIDA), Tone & Voice và CTA",
              "Copy nội dung đối thủ dán vào",
              "Gõ 1 từ duy nhất: 'Marketing'"
            ],
            ans: 1,
            exp: "Prompt có cấu trúc đầy đủ Role-Task-Context-Tone-Format giúp AI tạo sản phẩm chuẩn xác nhất."
          }
        ]
      },
      {
        id: "A3-A-M2",
        code: "A3-A-M2",
        competenceCode: "3.2",
        title: "Module 2: Quản trị và tái sử dụng tài sản nội dung",
        duration: "3 giờ",
        description: "Xây thư viện tài sản nội dung (Digital Asset Management), thiết kế nội dung dạng mô-đun để tái chuyển đổi (1 video dài -> 5 short clips).",
        quiz: [
          {
            q: "Kỹ thuật 'Nội dung mô-đun' (Modular Content) mang lại lợi ích gì lớn nhất cho bộ phận Marketing?",
            opts: [
              "Làm cho file nặng hơn",
              "Cho phép tách một nội dung lớn thành nhiều khối nhỏ để tái sử dụng linh hoạt trên TikTok, Reels, Blog, Email với chi phí sản xuất tối thiểu",
              "Bắt buộc dùng giấy",
              "Chỉ dùng cho lập trình viên"
            ],
            ans: 1,
            exp: "Nội dung mô-đun tối ưu hóa chi phí sản xuất nội dung đa kênh theo cấp số nhân."
          }
        ]
      },
      {
        id: "A3-A-M3",
        code: "A3-A-M3",
        competenceCode: "3.3",
        title: "Module 3: Quản trị rủi ro pháp lý về nội dung",
        duration: "3 giờ",
        description: "Bản quyền hình ảnh, âm thanh, phông chữ thương mại; điều khoản sở hữu trí tuệ trong hợp đồng với KOL/Agency; rủi ro pháp lý của nội dung AI.",
        quiz: [
          {
            q: "Khi mua một bản nhạc thương mại có giấy phép 'Standard Commercial License' để chạy quảng cáo Facebook Ads, bạn cần lưu ý gì?",
            opts: [
              "Được phép bán lại bản nhạc cho người khác",
              "Lưu giữ hóa đơn và mã số giấy phép (License Key) vào kho hồ sơ bản quyền để kháng nghị khi bị gắn cờ tự động",
              "Không cần hóa đơn",
              "Chỉ được nghe một mình"
            ],
            ans: 1,
            exp: "Hồ sơ bản quyền thương mại là căn cứ bắt buộc để kháng nghị gỡ cờ vi phạm trên các nền tảng quảng cáo."
          }
        ]
      },
      {
        id: "A3-A-M4",
        code: "A3-A-M4",
        competenceCode: "3.4",
        title: "Module 4: Thiết kế giải pháp số cho nghiệp vụ Marketing",
        duration: "3 giờ",
        description: "Thiết kế kịch bản tự động hóa phễu (Lead Nurturing Automation), mô hình hóa luồng dữ liệu khách hàng giữa Landing Page, CRM và Ads.",
        quiz: [
          {
            q: "Khi khách hàng điền form trên Landing Page, luồng xử lý tự động nào thể hiện giải pháp MarTech hiệu quả?",
            opts: [
              "Để nguyên đó cuối tháng xuất Excel",
              "Bắn dữ liệu ngay lập tức vào CRM qua Webhook, kích hoạt email chào mừng tự động và đẩy sự kiện Lead về Meta Pixel",
              "In form ra giấy cất vào tủ",
              "Xóa ngay số điện thoại khách hàng"
            ],
            ans: 1,
            exp: "Tự động hóa luồng dữ liệu thời gian thực giúp tỷ lệ tiếp cận khách hàng tiềm năng đạt đỉnh cao nhất."
          }
        ]
      }
    ]
  },

  // ================= LĨNH VỰC 4 =================
  "A4-I": {
    id: "A4-I",
    areaId: "area_4",
    level: "Trung cấp (Level 3-4)",
    title: "An toàn thông tin trong công việc",
    duration: "10 giờ",
    prerequisite: "A4-F",
    targetRoles: ["Marketing (Đích)", "Sales/CRM"],
    objective: "Bảo mật tài khoản Business Manager, xử lý dữ liệu khách hàng tuân thủ nguyên tắc tối thiểu và Nghị định 13, duy trì sức khỏe làm việc số.",
    modules: [
      {
        id: "A4-I-M1",
        code: "A4-I-M1",
        competenceCode: "4.1",
        title: "Module 1: Bảo mật trong môi trường làm việc",
        duration: "2.5 giờ",
        description: "Chính sách an toàn thiết bị làm việc từ xa, nhận diện tấn công giả mạo (Phishing) chiếm đoạt Fanpage/BM, sao lưu phục hồi.",
        quiz: [
          {
            q: "Kẻ xấu gửi email giả mạo thông báo 'Trang của bạn sắp bị khóa trong 24h, bấm vào link để kháng nghị'. Hành động đúng là gì?",
            opts: [
              "Bấm link và nhập ngay tài khoản mật khẩu Facebook",
              "Kiểm tra địa chỉ email thực tế của người gửi, không click link và báo cáo cho bộ phận An toàn thông tin",
              "Chuyển tiếp cho cả công ty bấm cùng",
              "Tự xóa tài khoản"
            ],
            ans: 1,
            exp: "Đây là hình thức lừa đảo Phishing kinh điển nhắm vào các quản trị viên Fanpage/BM doanh nghiệp."
          }
        ]
      },
      {
        id: "A4-I-M2",
        code: "A4-I-M2",
        competenceCode: "4.2",
        title: "Module 2: Xử lý dữ liệu cá nhân trong công việc",
        duration: "2.5 giờ",
        description: "Tuân thủ Nghị định 13/2023/NĐ-CP: nguyên tắc thu thập tối thiểu, sự đồng ý của khách hàng, phân quyền truy cập danh sách Lead.",
        quiz: [
          {
            q: "Theo nguyên tắc 'Thu thập tối thiểu' (Data Minimization), khi tạo form đăng ký nhận ebook tài liệu, bạn chỉ nên yêu cầu:",
            opts: [
              "Số CCCD, sổ hộ khẩu và tài khoản ngân hàng",
              "Họ tên và Email nhận tài liệu",
              "Địa chỉ nhà riêng và nhóm máu",
              "Mật khẩu Facebook của khách"
            ],
            ans: 1,
            exp: "Chỉ thu thập đúng các trường dữ liệu cần thiết phục vụ mục đích gửi tài liệu."
          }
        ]
      },
      {
        id: "A4-I-M3",
        code: "A4-I-M3",
        competenceCode: "4.3",
        title: "Module 3: Cân bằng số và sức khỏe nghề nghiệp",
        duration: "2.5 giờ",
        description: "Quản lý thông báo mạng xã hội, tránh kiệt sức số (Digital Burnout), phân chia thời gian tập trung làm việc và nghỉ ngơi.",
        quiz: [
          {
            q: "Kỹ thuật 'Khối thời gian tập trung' (Time Blocking) mang lại lợi ích gì cho chuyên viên Marketing?",
            opts: [
              "Ngăn chặn việc chuyển đổi ngữ cảnh liên tục giữa các thông báo tin nhắn để hoàn thành các chiến dịch sáng tạo chất lượng cao",
              "Bắt buộc thức trắng đêm",
              "Không được ăn cơm",
              "Chỉ làm việc 5 phút mỗi ngày"
            ],
            ans: 0,
            exp: "Time blocking giảm thiểu tối đa chi phí chuyển đổi ngữ cảnh (context switching cost)."
          }
        ]
      },
      {
        id: "A4-I-M4",
        code: "A4-I-M4",
        competenceCode: "4.4",
        title: "Module 4: Vận hành số bền vững",
        duration: "2.5 giờ",
        description: "Tối ưu hóa dung lượng lưu trữ đám mây, dọn dẹp dữ liệu rác, quy trình làm việc số giảm thiểu giấy tờ và thiết bị tiêu thụ năng lượng.",
        quiz: [
          {
            q: "Hành động nào sau đây thể hiện thói quen vận hành số bền vững?",
            opts: [
              "In tất cả báo cáo chiến dịch ra 1,000 tờ giấy",
              "Định kỳ rà soát và xóa các video nháp trùng lặp, tối ưu dung lượng đám mây và số hóa quy trình phê duyệt không dùng giấy",
              "Để máy tính chạy qua đêm không tắt",
              "Gửi email đính kèm file 500MB cho 100 người"
            ],
            ans: 1,
            exp: "Tối ưu hóa dữ liệu số và giảm giấy tờ góp phần trực tiếp vào mục tiêu chuyển đổi xanh bền vững."
          }
        ]
      }
    ]
  },

  // ================= LĨNH VỰC 5 =================
  "A5-A": {
    id: "A5-A",
    areaId: "area_5",
    level: "Nâng cao (Level 5-6)",
    title: "Đổi mới và dẫn dắt chuyển đổi số",
    duration: "12 giờ",
    prerequisite: "A5-I",
    targetRoles: ["Marketing (Đích)", "CEO"],
    objective: "Người học chẩn đoán và khắc phục sự cố MarTech phức tạp, kiểm thử A/B Testing chuẩn khoa học, tối ưu hóa tỷ lệ chuyển đổi (CRO) và xây dựng lộ trình công nghệ số.",
    modules: [
      {
        id: "A5-A-M1",
        code: "A5-A-M1",
        competenceCode: "5.1",
        title: "Module 1: Xây dựng năng lực xử lý vấn đề của tổ chức",
        duration: "3 giờ",
        description: "Phương pháp phân tích nguyên nhân gốc rễ (Root Cause Analysis - 5 Whys) khi chiến dịch sụt giảm hiệu quả hoặc tài khoản bị hạn chế.",
        quiz: [
          {
            q: "Khi chi phí mỗi lượt mua hàng (CPA) đột ngột tăng vọt 200%, bước đầu tiên cần làm là gì?",
            opts: [
              "Vội vã tắt hết quảng cáo",
              "Truy vết theo phương pháp 5 Whys: Kiểm tra phân phối Ads, tỷ lệ hiển thị, tốc độ tải trang đích và tính ổn định của cổng thanh toán",
              "Đổ lỗi cho đối thủ chơi xấu",
              "Tăng giá sản phẩm gấp đôi"
            ],
            ans: 1,
            exp: "Phân tích nguyên nhân gốc rễ có hệ thống giúp giải quyết triệt để nút thắt kỹ thuật."
          }
        ]
      },
      {
        id: "A5-A-M2",
        code: "A5-A-M2",
        competenceCode: "5.2",
        title: "Module 2: Chiến lược công nghệ và triển khai thay đổi",
        duration: "3 giờ",
        description: "Đánh giá MarTech Stack (công cụ email, tracking, chatbot, CRM), tính toán chi phí toàn phần (TCO) và quản lý rủi ro phụ thuộc nền tảng.",
        quiz: [
          {
            q: "Chi phí toàn phần (TCO - Total Cost of Ownership) của một phần mềm MarTech bao gồm những gì?",
            opts: [
              "Chỉ duy nhất tiền bản quyền mua ban đầu",
              "Phí bản quyền, chi phí tích hợp kỹ thuật, thời gian đào tạo nhân sự và rủi ro chuyển đổi dữ liệu khi thay đổi",
              "Tiền mừng khai trương",
              "Không có chi phí nào"
            ],
            ans: 1,
            exp: "TCO phản ánh toàn diện mọi chi phí phát sinh trong suốt vòng đời sử dụng giải pháp công nghệ."
          }
        ]
      },
      {
        id: "A5-A-M3",
        code: "A5-A-M3",
        competenceCode: "5.3",
        title: "Module 3: Đổi mới sáng tạo bằng công nghệ số",
        duration: "3 giờ",
        description: "Thiết kế thử nghiệm A/B Testing có ý nghĩa thống kê (Statistical Significance), thử nghiệm giải pháp GenAI mới và mở rộng quy mô thành công.",
        quiz: [
          {
            q: "Nguyên tắc cốt lõi để một thử nghiệm A/B Testing có giá trị khoa học là gì?",
            opts: [
              "Thay đổi 5 yếu tố cùng một lúc",
              "Chỉ thay đổi duy nhất một biến số độc lập (Isolated Variable) và thu thập đủ cỡ mẫu để đạt độ tin cậy thống kê tối thiểu 95%",
              "Chạy thử trong 5 phút rồi dừng",
              "Chọn mẫu nào người thân mình thích"
            ],
            ans: 1,
            exp: "Cô lập biến số và đảm bảo ý nghĩa thống kê (p-value < 0.05) là tiêu chuẩn vàng của kiểm thử số."
          }
        ]
      },
      {
        id: "A5-A-M4",
        code: "A5-A-M4",
        competenceCode: "5.4",
        title: "Module 4: Phát triển năng lực số toàn tổ chức",
        duration: "3 giờ",
        description: "Bản đồ khoảng cách kỹ năng (Skill Gap Map), văn hóa chia sẻ tri thức nội bộ và gắn năng lực số vào lộ trình thăng tiến nhân sự.",
        quiz: [
          {
            q: "Làm thế nào để duy trì và lan tỏa năng lực số bền vững trong phòng Marketing sau khi hoàn thành khóa đào tạo?",
            opts: [
              "Cất chứng chỉ vào ngăn kéo và quay lại cách làm thủ công cũ",
              "Chuẩn hóa các quy trình mẫu (SOP), tổ chức buổi chia sẻ nội bộ định kỳ và áp dụng ngay kiến thức vào các chiến dịch thực tế",
              "Không cho ai biết bí quyết",
              "Chuyển sang làm việc bằng giấy"
            ],
            ans: 1,
            exp: "Áp dụng vào công việc thực tế và chuẩn hóa SOP giúp biến năng lực cá nhân thành tài sản trí tuệ của tổ chức."
          }
        ]
      }
    ]
  }
};
