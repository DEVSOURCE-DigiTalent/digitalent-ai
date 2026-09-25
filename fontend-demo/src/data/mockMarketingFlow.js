// Dữ liệu mô phỏng chuẩn hóa theo khung vị trí công việc DigComp 3.0 & Thông tư Tiêu chuẩn Việt Nam

// Hướng dẫn 8 cấp độ chuẩn DigComp 3.0 theo mức độ Tự chủ, Độ phức tạp nhận thức & Đối soát Tiêu chuẩn Việt Nam
export const DIGCOMP_LEVEL_GUIDE = [
  {
    tier: "Cơ bản (Foundation)",
    levels: "Level 1 - 2",
    code: "F",
    autonomy: "Có hướng dẫn trực tiếp hoặc hỗ trợ từng bước",
    complexity: "Nhiệm vụ đơn giản, quen thuộc, thao tác lặp lại",
    vnStandardMapping: "Tương đương Chuẩn kỹ năng sử dụng CNTT cơ bản (Thông tư 03/2014/TT-BTTTT Mô-đun 01 - 06)",
    description: "Nhớ và hiểu các khái niệm số cơ bản, thực hiện các thao tác số có sẵn hướng dẫn."
  },
  {
    tier: "Trung cấp (Intermediate)",
    levels: "Level 3 - 4",
    code: "I",
    autonomy: "Độc lập, tự chủ trong phạm vi công việc được giao",
    complexity: "Nhiệm vụ có cấu trúc, giải quyết vấn đề thường gặp theo quy trình",
    vnStandardMapping: "Tương đương Chuẩn kỹ năng sử dụng CNTT nâng cao (Thông tư 03/2014/TT-BTTTT Mô-đun 07 - 12)",
    description: "Tự chủ áp dụng công cụ số vào công việc hàng ngày, lựa chọn công cụ phù hợp với nhiệm vụ thông thường."
  },
  {
    tier: "Nâng cao (Advanced)",
    levels: "Level 5 - 6",
    code: "A",
    autonomy: "Hoàn toàn độc lập, có khả năng hướng dẫn và giám sát người khác",
    complexity: "Nhiệm vụ phức tạp, phi cấu trúc, tối ưu hóa quy trình nghiệp vụ",
    vnStandardMapping: "Đạt chuẩn Quản trị & Chuyển đổi số doanh nghiệp (Nghị định 13/2023/NĐ-CP & Luật Giao dịch điện tử 2023)",
    description: "Làm chủ công nghệ số, phân tích đánh giá dữ liệu sâu, thiết kế chiến lược và dẫn dắt đội nhóm."
  },
  {
    tier: "Chuyên sâu (Highly Specialized)",
    levels: "Level 7 - 8",
    code: "S",
    autonomy: "Dẫn dắt chiến lược toàn doanh nghiệp / chuyên gia ngành",
    complexity: "Đổi mới sáng tạo, phát triển giải pháp mới, định hình tiêu chuẩn công nghệ",
    vnStandardMapping: "Chuẩn Kiến trúc sư giải pháp & Giám đốc Chuyển đổi số (Chief Digital Officer / Enterprise Architect)",
    description: "Sáng tạo các giải pháp số đột phá, chuyển đổi số toàn diện cho tổ chức."
  }
];

// Từ điển chuẩn năng lực số cho các vị trí công việc tiêu biểu trong doanh nghiệp (Theo Báo Cáo Ma Trận DigComp SME)
export const JOB_ROLE_BENCHMARKS = [
  {
    roleId: "marketing_specialist",
    roleTitle: "Chuyên viên Tiếp thị Số (Digital Marketing)",
    roleCode: "MKT-DIG-01",
    department: "Phòng Marketing & Truyền thông",
    badgeColor: "accent",
    vnStandardReference: "Luật Sở hữu Trí tuệ 2022 & Nguyên tắc bảo vệ dữ liệu cá nhân khách hàng (Nghị định 13/2023/NĐ-CP)",
    description: "Đòi hỏi mức Nâng cao (Level 5-6) ở Sáng tạo nội dung (Trọng tâm cốt lõi), Dữ liệu, Cộng tác và CRO; riêng An toàn thông tin chỉ yêu cầu mức Trung cấp (Level 3-4).",
    competencies: [
      { id: "area_1", name: "Dữ liệu & Thông tin", reqLevelNumber: 6, reqLevelLabel: "Level 5-6 (Nâng cao)", isCore: false, note: "Báo cáo GA4, ROAS/CAC, Single Source of Truth (SSOT)." },
      { id: "area_2", name: "Giao tiếp & Cộng tác", reqLevelNumber: 6, reqLevelLabel: "Level 5-6 (Nâng cao)", isCore: false, note: "Điều phối đa kênh, quản lý BM Partner với Agency, xử lý khủng hoảng." },
      { id: "area_3", name: "Tạo lập nội dung số", reqLevelNumber: 6, reqLevelLabel: "Level 5-6 (Trọng tâm cốt lõi)", isCore: true, note: "Chiến lược nội dung, AI Prompting, Video Reels, bản quyền số thương mại." },
      { id: "area_4", name: "An toàn & Bảo mật", reqLevelNumber: 4, reqLevelLabel: "Level 3-4 (Trung cấp)", isCore: false, note: "Bảo mật tài khoản BM/Fanpage 2FA, thu thập dữ liệu khách hàng theo Nghị định 13." },
      { id: "area_5", name: "Giải quyết vấn đề", reqLevelNumber: 6, reqLevelLabel: "Level 5-6 (Nâng cao)", isCore: false, note: "Tối ưu hóa chuyển đổi CRO, kiểm thử A/B Testing có ý nghĩa thống kê." }
    ]
  },
  {
    roleId: "accountant",
    roleTitle: "Chuyên viên Kế toán & Tài chính",
    roleCode: "ACC-FIN-02",
    department: "Phòng Tài chính - Kế toán",
    badgeColor: "primary",
    vnStandardReference: "Quy định Hóa đơn điện tử (Nghị định 123/2020/NĐ-CP, Thông tư 78/2021/TT-BTC) & Chữ ký số (Luật GDĐĐT 2023)",
    description: "Đòi hỏi mức Nâng cao (Level 5-6) ở An toàn bảo mật (Chữ ký số, chống lừa đảo hóa đơn) và Dữ liệu ERP; riêng Sáng tạo nội dung chỉ ở mức Cơ bản (Level 1-2).",
    competencies: [
      { id: "area_1", name: "Dữ liệu & Thông tin", reqLevelNumber: 6, reqLevelLabel: "Level 5-6 (Trọng tâm data)", isCore: true, note: "Báo cáo tài chính lớn, ERP, Power BI, đối soát doanh thu hóa đơn điện tử." },
      { id: "area_2", name: "Giao tiếp & Cộng tác", reqLevelNumber: 4, reqLevelLabel: "Level 3-4 (Trung cấp)", isCore: false, note: "Giao dịch điện tử với Thuế, Hải quan, Ngân hàng và chia sẻ báo cáo nội bộ." },
      { id: "area_3", name: "Tạo lập nội dung số", reqLevelNumber: 2, reqLevelLabel: "Level 1-2 (Cơ bản)", isCore: false, note: "Soạn thảo chứng từ, văn bản số hóa (Nội dung số không phải nhiệm vụ trọng tâm)." },
      { id: "area_4", name: "An toàn & Bảo mật", reqLevelNumber: 6, reqLevelLabel: "Level 5-6 (Trọng tâm an ninh)", isCore: true, note: "Ký số token, phòng chống hóa đơn giả mạo, bảo mật tài chính nhạy cảm." },
      { id: "area_5", name: "Giải quyết vấn đề", reqLevelNumber: 4, reqLevelLabel: "Level 3-4 (Trung cấp)", isCore: false, note: "Xử lý lỗi dữ liệu spreadsheet, phần mềm kế toán và quy trình thuế số." }
    ]
  },
  {
    roleId: "hr_specialist",
    roleTitle: "Chuyên viên Nhân sự & Đào tạo (HR & L&D)",
    roleCode: "HR-LND-03",
    department: "Ban Nhân sự & Đào tạo",
    badgeColor: "success",
    vnStandardReference: "Quy định bảo vệ dữ liệu cá nhân người lao động (Chương II Nghị định 13/2023/NĐ-CP) & Bộ luật Lao động 2019",
    description: "Đòi hỏi mức Nâng cao (Level 5-6) ở Giao tiếp cộng tác (Văn hóa số, tuyển dụng) và Bảo mật dữ liệu người lao động (Nghị định 13); các lĩnh vực khác ở mức Trung cấp (Level 3-4).",
    competencies: [
      { id: "area_1", name: "Dữ liệu & Thông tin", reqLevelNumber: 4, reqLevelLabel: "Level 3-4 (Trung cấp)", isCore: false, note: "Quản trị dữ liệu hồ sơ nhân sự, chỉ số biến động nhân sự, đánh giá KPI." },
      { id: "area_2", name: "Giao tiếp & Cộng tác", reqLevelNumber: 6, reqLevelLabel: "Level 5-6 (Trọng tâm con người)", isCore: true, note: "Tuyển dụng số, giao tiếp nhân viên đa kênh, họp online và truyền thông nội bộ." },
      { id: "area_3", name: "Tạo lập nội dung số", reqLevelNumber: 4, reqLevelLabel: "Level 3-4 (Trung cấp)", isCore: false, note: "Biên soạn JD tuyển dụng, tài liệu onboarding số, e-learning và biểu mẫu HR." },
      { id: "area_4", name: "An toàn & Bảo mật", reqLevelNumber: 6, reqLevelLabel: "Level 5-6 (Trọng tâm bảo mật)", isCore: true, note: "Bảo vệ thông tin cá nhân nhân viên theo Nghị định 13 và hồ sơ lương thưởng." },
      { id: "area_5", name: "Giải quyết vấn đề", reqLevelNumber: 4, reqLevelLabel: "Level 3-4 (Trung cấp)", isCore: false, note: "Xử lý sự cố hệ thống HR, quy trình đào tạo và hướng dẫn nhân viên dùng phần mềm số." }
    ]
  },
  {
    roleId: "b2b_sales",
    roleTitle: "Chuyên viên Kinh doanh & CRM (Sales & CRM)",
    roleCode: "SAL-CRM-04",
    department: "Phòng Kinh doanh & CRM",
    badgeColor: "warning",
    vnStandardReference: "Luật Bảo vệ quyền lợi người tiêu dùng 2023 & Thỏa thuận bảo mật thông tin thương mại (NDA)",
    description: "Đòi hỏi mức Nâng cao (Level 5-6) ở Giao tiếp & Đàm phán số với khách hàng; các lĩnh vực CRM Dữ liệu, Pitch Deck và An toàn ở mức Trung cấp (Level 3-4).",
    competencies: [
      { id: "area_1", name: "Dữ liệu & Thông tin", reqLevelNumber: 4, reqLevelLabel: "Level 3-4 (Trung cấp)", isCore: false, note: "Khai thác dữ liệu khách hàng CRM, theo dõi sales pipeline và báo cáo doanh số." },
      { id: "area_2", name: "Giao tiếp & Cộng tác", reqLevelNumber: 6, reqLevelLabel: "Level 5-6 (Trọng tâm chốt hợp đồng)", isCore: true, note: "Tư vấn chốt hợp đồng online, đàm phán số qua CRM/Zalo OA/Email và họp trực tuyến." },
      { id: "area_3", name: "Tạo lập nội dung số", reqLevelNumber: 4, reqLevelLabel: "Level 3-4 (Trung cấp)", isCore: false, note: "Tạo proposal báo giá, Pitch Deck trình bày giải pháp và email cá nhân hóa." },
      { id: "area_4", name: "An toàn & Bảo mật", reqLevelNumber: 4, reqLevelLabel: "Level 3-4 (Trung cấp)", isCore: false, note: "Bảo mật thông tin khách hàng, dữ liệu hợp đồng thầu và hợp đồng NDA." },
      { id: "area_5", name: "Giải quyết vấn đề", reqLevelNumber: 4, reqLevelLabel: "Level 3-4 (Trung cấp)", isCore: false, note: "Xử lý sự cố dữ liệu CRM và giải quyết từ chối mua hàng trong quy trình bán hàng." }
    ]
  },
  {
    roleId: "ceo_executive",
    roleTitle: "Giám đốc Điều hành (CEO & Executive)",
    roleCode: "CEO-EXEC-00",
    department: "Ban Giám đốc & Điều hành",
    badgeColor: "accent",
    vnStandardReference: "Luật An ninh mạng (Nghị định 53/2022/NĐ-CP) & Chiến lược Chuyển đổi số quốc gia",
    description: "Đòi hỏi mức Nâng cao (Level 5-6) ở Dữ liệu chiến lược, Điều hành số, An toàn rủi ro doanh nghiệp và Phê duyệt công nghệ; Nội dung số ở mức Trung cấp (Level 3-4).",
    competencies: [
      { id: "area_1", name: "Dữ liệu & Thông tin", reqLevelNumber: 6, reqLevelLabel: "Level 5-6 (Nâng cao)", isCore: true, note: "Đọc dashboard quản trị, báo cáo business intelligence và dùng dữ liệu ra quyết định." },
      { id: "area_2", name: "Giao tiếp & Cộng tác", reqLevelNumber: 6, reqLevelLabel: "Level 5-6 (Nâng cao)", isCore: true, note: "Điều hành doanh nghiệp, cộng tác trực tuyến với cổ đông, nhân sự và đối tác lớn." },
      { id: "area_3", name: "Tạo lập nội dung số", reqLevelNumber: 4, reqLevelLabel: "Level 3-4 (Trung cấp)", isCore: false, note: "Tạo presentation pitching đầu tư, thông điệp chiến lược và tài liệu điều hành." },
      { id: "area_4", name: "An toàn & Bảo mật", reqLevelNumber: 6, reqLevelLabel: "Level 5-6 (Nâng cao)", isCore: true, note: "Quản trị rủi ro an ninh mạng doanh nghiệp, phân quyền truy cập và bảo vệ tài sản số." },
      { id: "area_5", name: "Giải quyết vấn đề", reqLevelNumber: 6, reqLevelLabel: "Level 5-6 (Nâng cao)", isCore: true, note: "Đánh giá hiệu quả bài toán số và phê duyệt ứng dụng giải pháp công nghệ mới." }
    ]
  }
];

export const POSITION_REQUIREMENTS = {
  roleId: "marketing_specialist",
  roleTitle: "Chuyên viên Tiếp thị Số (Digital Marketing Specialist)",
  department: "Phòng Marketing & Truyền thông",
  roleCode: "MKT-DIG-01",
  framework: "European DigComp 3.0 & Thông tư 03/2014/TT-BTTTT",
  competencies: [
    {
      id: "area_1",
      code: "1",
      name: "Tìm kiếm, đánh giá, quản lý thông tin",
      enName: "Information & Data Literacy",
      requiredLevelNumber: 6, // Level 5-6 (Advanced)
      requiredLevelCode: "A1-A",
      requiredLabel: "Nâng cao (Level 5-6)",
      isCore: false,
      benchmarkNote: "Phân tích customer data, báo cáo GA4, chỉ số ROAS/CAC và quản trị nguồn chân lý duy nhất (SSOT)."
    },
    {
      id: "area_2",
      code: "2",
      name: "Giao tiếp và cộng tác",
      enName: "Communication & Collaboration",
      requiredLevelNumber: 6, // Level 5-6 (Advanced)
      requiredLevelCode: "A2-A",
      requiredLabel: "Nâng cao (Level 5-6)",
      isCore: false,
      benchmarkNote: "Điều phối đa kênh, làm việc với Agency đối tác qua BM Partner, xử lý khủng hoảng truyền thông 24h."
    },
    {
      id: "area_3",
      code: "3",
      name: "Tạo lập nội dung số",
      enName: "Digital Content Creation",
      requiredLevelNumber: 6, // Level 5-6 (Advanced)
      requiredLevelCode: "A3-A",
      requiredLabel: "Nâng cao (Level 5-6 - Trọng tâm cao nhất)",
      isCore: true, // Core competency of Marketing
      benchmarkNote: "Chiến lược nội dung đa kênh, sản xuất video ngắn, prompt engineering AI marketing và quản trị bản quyền."
    },
    {
      id: "area_4",
      code: "4",
      name: "An toàn, phúc lợi và trách nhiệm số",
      enName: "Safety & Security",
      requiredLevelNumber: 4, // Level 3-4 (Intermediate) -> Vị trí Marketing chỉ cần mức Trung cấp!
      requiredLevelCode: "A4-I",
      requiredLabel: "Trung cấp (Level 3-4)",
      isCore: false,
      benchmarkNote: "Bảo mật tài khoản Business Manager/Fanpage, tuân thủ dữ liệu khách hàng theo Nghị định 13, cân bằng số."
    },
    {
      id: "area_5",
      code: "5",
      name: "Nhận diện và giải quyết vấn đề",
      enName: "Problem Solving",
      requiredLevelNumber: 6, // Level 5-6 (Advanced)
      requiredLevelCode: "A5-A",
      requiredLabel: "Nâng cao (Level 5-6)",
      isCore: false,
      benchmarkNote: "Phân tích nguyên nhân gốc (5 Whys), tối ưu chuyển đổi CRO, kiểm thử A/B testing có ý nghĩa thống kê."
    }
  ]
};

// Từ điển Bài thi đánh giá năng lực đầu vào theo từng vị trí (Role-Specific Placement Diagnostics)
export const ROLE_DIAGNOSTIC_ASSESSMENTS = {
  ceo_executive: [
    {
      id: "diag_ceo_1",
      areaId: "area_1",
      areaCode: "1",
      areaName: "Tìm kiếm, đánh giá, quản lý thông tin",
      subCompetence: "1.2 Dữ liệu Quản trị & BI Dashboard",
      targetLevelReq: "Level 5-6 (Nâng cao)",
      question: "Để điều hành doanh nghiệp dựa trên dữ liệu (Data-Driven Decision), việc CEO yêu cầu xây dựng hệ thống Nguồn chân lý duy nhất (Single Source of Truth - SSOT) có vai trò chiến lược nào?",
      options: [
        "Chỉ để giảm dung lượng lưu trữ trên máy tính của nhân viên",
        "Thống nhất định nghĩa chỉ tiêu giữa các phòng ban, giúp báo cáo BI không bị mâu thuẫn dữ liệu khi ra quyết định kinh doanh",
        "Ép buộc tất cả các phòng ban phải dùng chung 1 phần mềm Excel duy nhất",
        "Không có vai trò gì vì CEO chỉ cần xem doanh thu cuối tháng"
      ],
      correct: 1,
      assignedLevelIfCorrect: 6,
      assignedLevelIfWrong: 3,
      failedModuleCode: "A1-A-M3",
      explanation: "Nguồn chân lý duy nhất (SSOT) loại bỏ xung đột định nghĩa chỉ tiêu (như doanh thu thực ghi nhận vs doanh thu phát sinh), đảm bảo tính nhất quán dữ liệu ở cấp điều hành."
    },
    {
      id: "diag_ceo_2",
      areaId: "area_2",
      areaCode: "2",
      areaName: "Giao tiếp và cộng tác",
      subCompetence: "2.4 Điều hành trực tuyến & Quản trị cổ đông",
      targetLevelReq: "Level 5-6 (Nâng cao)",
      question: "Khi điều hành cuộc họp Đại hội cổ đông hoặc Ban Giám đốc trực tuyến, cơ chế nào đảm bảo tính pháp lý và bảo mật thông tin cấp độ Nâng cao?",
      options: [
        "Quay màn hình cuộc họp rồi gửi công khai lên mạng xã hội",
        "Yêu cầu xác thực 2 yếu tố (2FA), phân quyền mã hóa đường truyền, và lưu ký biên bản họp số có chữ ký số PKI",
        "Chỉ gửi tin nhắn trao đổi qua nhóm chat cá nhân không phân quyền",
        "Không cần bảo mật vì nội dung họp công ty nào cũng giống nhau"
      ],
      correct: 1,
      assignedLevelIfCorrect: 6,
      assignedLevelIfWrong: 4,
      failedModuleCode: "A2-A-M1",
      explanation: "Điều hành số cấp độ Nâng cao đòi hỏi mã hóa phòng họp trực tuyến, phân quyền truy cập chặt chẽ và xác thực biên bản bằng chữ ký số."
    },
    {
      id: "diag_ceo_3",
      areaId: "area_3",
      areaCode: "3",
      areaName: "Tạo lập nội dung số",
      subCompetence: "3.2 Biên tập thông điệp & Presentation chiến lược",
      targetLevelReq: "Level 3-4 (Trung cấp)",
      question: "CEO cần duyệt bản trình bày Pitch Deck chiến lược để gọi vốn đầu tư. Nguyên tắc tối ưu nhất về nội dung số cấp độ Trung cấp là gì?",
      options: [
        "Nhồi nhét thật nhiều văn bản nhỏ vào từng slide để tỏ ra phức tạp",
        "Cấu trúc nội dung mạch lạc (Bài toán - Giải pháp - Quy mô thị trường - Mô hình tài chính), trực quan hóa dữ liệu và đồng bộ bộ nhận diện thương hiệu",
        "Sử dụng thật nhiều hiệu ứng hoạt hình chuyển trang nhấp nháy",
        "Để nhân viên tự làm và không cần xem lại trước khi trình bày"
      ],
      correct: 1,
      assignedLevelIfCorrect: 4,
      assignedLevelIfWrong: 2,
      failedModuleCode: "A3-I-M1",
      explanation: "Nội dung số dành cho cấp điều hành đòi hỏi sự cô đọng, trực quan hóa biểu đồ dữ liệu và nhất quán thông điệp chiến lược."
    },
    {
      id: "diag_ceo_4",
      areaId: "area_4",
      areaCode: "4",
      areaName: "An toàn, phúc lợi và trách nhiệm số",
      subCompetence: "4.1 Quản trị rủi ro an toàn thông tin doanh nghiệp (Nghị định 53/2022/NĐ-CP)",
      targetLevelReq: "Level 5-6 (Nâng cao - Trọng tâm)",
      question: "Theo Luật An ninh mạng và Nghị định 53/2022/NĐ-CP, trách nhiệm của CEO trong việc bảo vệ tài sản số và hệ thống thông tin doanh nghiệp là gì?",
      options: [
        "Đổ toàn bộ trách nhiệm cho nhân viên IT nếu xảy ra sự cố rò rỉ dữ liệu",
        "Chỉ đạo ban hành Quy chế An toàn thông tin, phê duyệt phương án Zero-Trust, sao lưu dữ liệu định kỳ và diễn tập ứng cứu sự cố an ninh mạng",
        "Không cần làm gì vì công ty nhỏ không bao giờ bị hacker tấn công",
        "Mua phần mềm diệt virus miễn phí cài cho tất cả máy tính"
      ],
      correct: 1,
      assignedLevelIfCorrect: 6,
      assignedLevelIfWrong: 3,
      failedModuleCode: "A4-A-M1",
      explanation: "Nghị định 53 quy định người đứng đầu doanh nghiệp chịu trách nhiệm ban hành quy chế an toàn thông tin và phương án ứng cứu sự cố an ninh mạng."
    },
    {
      id: "diag_ceo_5",
      areaId: "area_5",
      areaCode: "5",
      areaName: "Nhận diện và giải quyết vấn đề",
      subCompetence: "5.4 Phê duyệt giải pháp Chuyển đổi số (Quyết định 749/QĐ-TTg)",
      targetLevelReq: "Level 5-6 (Nâng cao - Trọng tâm)",
      question: "Khi quyết định đầu tư hệ thống ERP/CRM mới cho doanh nghiệp, CEO cần đánh giá bài toán số dựa trên tiêu chí chiến lược nào?",
      options: [
        "Chọn phần mềm đắt nhất thị trường mà không cần phân tích bài toán nghiệp vụ",
        "Đánh giá Chỉ số hoàn vốn (ROI), khả năng mở rộng (Scalability), độ thích ứng của nhân sự và tính kết nối dữ liệu liên phòng ban",
        "Chỉ nghe theo lời quảng cáo của đơn vị bán phần mềm",
        "Từ chối mọi ứng dụng công nghệ vì chi phí tốn kém"
      ],
      correct: 1,
      assignedLevelIfCorrect: 6,
      assignedLevelIfWrong: 3,
      failedModuleCode: "A5-A-M4",
      explanation: "Đánh giá bài toán số ở cấp điều hành yêu cầu phân tích toàn diện giữa ROI, năng lực sẵn sàng của tổ chức và kiến trúc tích hợp hệ thống."
    }
  ],

  marketing_specialist: [
    {
      id: "diag_mkt_1",
      areaId: "area_1",
      areaCode: "1",
      areaName: "Tìm kiếm, đánh giá, quản lý thông tin",
      subCompetence: "1.2 Phân tích Dữ liệu Marketing & ROAS/CAC",
      targetLevelReq: "Level 5-6 (Nâng cao)",
      question: "Trong 6 chiều đánh giá chất lượng dữ liệu của doanh nghiệp, việc kiểm tra tính nhất quán giữa số liệu báo cáo chiến dịch Marketing và số liệu doanh thu thực tế của Kế toán nhằm đảm bảo mục tiêu quản trị nào?",
      options: [
        "Chỉ để phát hiện nhân viên gian lận",
        "Xây dựng Nguồn chân lý duy nhất (Single Source of Truth) và loại bỏ sự sai lệch định nghĩa chỉ tiêu giữa các phòng ban",
        "Bắt buộc phòng Marketing phải sửa số liệu theo Kế toán",
        "Không có mục tiêu nào vì hai phòng luôn luôn phải lệch nhau"
      ],
      correct: 1,
      assignedLevelIfCorrect: 6,
      assignedLevelIfWrong: 3,
      failedModuleCode: "A1-A-M2",
      explanation: "Đánh giá chất lượng dữ liệu đa nguồn giúp thiết lập Nguồn chân lý duy nhất (SSOT) và từ điển dữ liệu chuẩn hóa toàn doanh nghiệp."
    },
    {
      id: "diag_mkt_2",
      areaId: "area_2",
      areaCode: "2",
      areaName: "Giao tiếp và cộng tác",
      subCompetence: "2.2 Quản trị luồng chia sẻ thông tin & Agency Partner",
      targetLevelReq: "Level 5-6 (Nâng cao)",
      question: "Khi hợp tác với một Digital Creative Agency bên ngoài để triển khai chiến dịch quảng cáo, phương án phân quyền nào sau đây đảm bảo chuẩn an toàn số cấp độ Nâng cao (Level 5-6)?",
      options: [
        "Gửi tài khoản mật khẩu Facebook cá nhân của bạn cho nhân viên Agency",
        "Thêm nhân viên Agency làm Quản trị viên (Admin) trực tiếp của Fanpage công ty",
        "Gán quyền Đối tác (Partner) thông qua Meta Business Manager ID, phân quyền tối thiểu (Advertiser) và ký thỏa thuận bảo mật dữ liệu (NDA)",
        "Tải toàn bộ tệp khách hàng gửi qua ứng dụng chat cá nhân"
      ],
      correct: 2,
      assignedLevelIfCorrect: 6,
      assignedLevelIfWrong: 4,
      failedModuleCode: "A2-A-M2",
      explanation: "Phân quyền Partner ID tách biệt hoàn toàn tài sản doanh nghiệp, kiểm soát truy cập và thu hồi quyền ngay khi hết hợp đồng."
    },
    {
      id: "diag_mkt_3",
      areaId: "area_3",
      areaCode: "3",
      areaName: "Tạo lập nội dung số (Trọng tâm vị trí)",
      subCompetence: "3.1 & 3.3 Chiến lược sản xuất & Bản quyền số (Luật SHTT 2022)",
      targetLevelReq: "Level 5-6 (Nâng cao - Trọng tâm)",
      question: "Bộ phận Marketing cần sản xuất một loạt video ngắn (TikTok/Reels) có gắn nhạc thịnh hành để chạy quảng cáo trả phí (Paid Ads). Hành động nào sau đây là tuân thủ đúng pháp lý bản quyền thương mại?",
      options: [
        "Tải nhạc trend bất kỳ trên mạng xã hội về lồng vào video vì ai cũng làm như vậy",
        "Chỉ sử dụng âm thanh có giấy phép thương mại (Commercial License / Royalty-Free) và lưu trữ mã bản quyền vào kho hồ sơ để kháng nghị",
        "Ghi dòng chữ 'Nguồn: Internet' ở cuối video là được miễn trừ mọi trách nhiệm",
        "Chỉnh tốc độ nhạc nhanh lên 10% thì không bao giờ bị vi phạm bản quyền"
      ],
      correct: 1,
      assignedLevelIfCorrect: 6,
      assignedLevelIfWrong: 3,
      failedModuleCode: "A3-A-M3",
      explanation: "Hoạt động thương mại bắt buộc phải có Commercial License để tránh rủi ro bị khóa tài khoản quảng cáo và khiếu nại tài chính."
    },
    {
      id: "diag_mkt_4",
      areaId: "area_4",
      areaCode: "4",
      areaName: "An toàn, phúc lợi và trách nhiệm",
      subCompetence: "4.2 Xử lý dữ liệu cá nhân & Nghị định 13/2023/NĐ-CP",
      targetLevelReq: "Level 3-4 (Trung cấp)",
      question: "Khi tạo form biểu mẫu trên Landing Page để khách hàng đăng ký nhận tài liệu Ebook, theo nguyên tắc 'Thu thập dữ liệu tối thiểu' (Nghị định 13/2023/NĐ-CP), bạn nên yêu cầu trường thông tin nào?",
      options: [
        "Họ tên, Số CCCD, Ngày cấp, Địa chỉ thường trú và Số tài khoản",
        "Chỉ yêu cầu Họ tên và Địa chỉ Email để nhận tài liệu",
        "Yêu cầu gửi ảnh chụp hai mặt thẻ căn cước",
        "Bắt khách hàng cung cấp số điện thoại của người thân"
      ],
      correct: 1,
      assignedLevelIfCorrect: 4,
      assignedLevelIfWrong: 2,
      failedModuleCode: "A4-I-M2",
      explanation: "Nguyên tắc thu thập tối thiểu quy định chỉ thu thập đúng các trường dữ liệu thực sự cần thiết phục vụ mục đích gửi tài liệu."
    },
    {
      id: "diag_mkt_5",
      areaId: "area_5",
      areaCode: "5",
      areaName: "Nhận diện và giải quyết vấn đề",
      subCompetence: "5.3 Đổi mới sáng tạo & Kiểm thử A/B Testing",
      targetLevelReq: "Level 5-6 (Nâng cao)",
      question: "Khi triển khai A/B Testing cho hai mẫu quảng cáo để tối ưu tỷ lệ chuyển đổi (CRO), để kết luận mẫu nào chiến thắng mang tính khoa học, bạn cần đảm bảo nguyên tắc nào?",
      options: [
        "Thay đổi cùng lúc cả hình ảnh, giá bán, tiêu đề và đối tượng nhắm mục tiêu",
        "Chỉ thay đổi duy nhất một biến số độc lập (tiêu đề), giữ nguyên các yếu tố khác và thu thập đủ cỡ mẫu để đạt độ tin cậy thống kê tối thiểu 95%",
        "Mẫu nào có số lượt xem nhiều hơn trong 10 phút đầu thì chọn mẫu đó",
        "Hỏi ý kiến bạn bè xem mẫu nào đẹp hơn"
      ],
      correct: 1,
      assignedLevelIfCorrect: 6,
      assignedLevelIfWrong: 3,
      failedModuleCode: "A5-A-M3",
      explanation: "Tiêu chuẩn khoa học của A/B testing yêu cầu cô lập một biến số duy nhất và đảm bảo ý nghĩa thống kê (Statistical Significance)."
    }
  ],

  accountant: [
    {
      id: "diag_acc_1",
      areaId: "area_1",
      areaCode: "1",
      areaName: "Tìm kiếm, đánh giá, quản lý thông tin",
      subCompetence: "1.3 Kiểm soát Dữ liệu Tài chính & ERP Audit",
      targetLevelReq: "Level 5-6 (Nâng cao - Trọng tâm)",
      question: "Trong quy trình kế toán doanh nghiệp, việc đối soát dữ liệu hóa đơn điện tử đầu vào tự động với hệ thống quản trị ERP nhằm đảm bảo chiều chất lượng dữ liệu nào?",
      options: [
        "Tính thẩm mỹ của bảng tính Excel",
        "Tính chính xác, tính nhất quán và tính hoàn toàn hợp lệ của chứng từ sổ sách tài chính",
        "Giúp nhân viên kế toán gõ lại toàn bộ dữ liệu bằng tay cho nhớ",
        "Không có mục tiêu vì hóa đơn nào cũng giống nhau"
      ],
      correct: 1,
      assignedLevelIfCorrect: 6,
      assignedLevelIfWrong: 3,
      failedModuleCode: "A1-A-M2",
      explanation: "Đối soát tự động ERP giúp kiểm tra tính chính xác và nhất quán dữ liệu chứng từ số, loại bỏ lỗi nhập liệu thủ công."
    },
    {
      id: "diag_acc_2",
      areaId: "area_2",
      areaCode: "2",
      areaName: "Giao tiếp và cộng tác",
      subCompetence: "2.3 Giao dịch điện tử với Thuế & Ngân hàng",
      targetLevelReq: "Level 3-4 (Trung cấp)",
      question: "Khi thực hiện nộp báo cáo thuế điện tử qua Cổng thông tin Tổng cục Thuế (gdt.gov.vn), thao tác chuẩn nào đảm bảo báo cáo đã được tiếp nhận hợp lệ?",
      options: [
        "Chụp ảnh màn hình rồi lưu lại trong máy tính cá nhân",
        "Ký số PKI thành công, kiểm tra thông báo xác nhận tiếp nhận của Cơ quan Thuế và lưu giữ tệp XML kèm chữ ký số trong thư mục lưu trữ chứng từ",
        "Gửi email báo cáo thuế qua tài khoản Gmail cá nhân",
        "In ra giấy rồi cất vào tủ hồ sơ mà không cần nộp bản điện tử"
      ],
      correct: 1,
      assignedLevelIfCorrect: 4,
      assignedLevelIfWrong: 2,
      failedModuleCode: "A2-I-M3",
      explanation: "Giao dịch điện tử cơ quan nhà nước bắt buộc có thông báo tiếp nhận mã hóa XML kèm chữ ký số PKI xác thực."
    },
    {
      id: "diag_acc_3",
      areaId: "area_3",
      areaCode: "3",
      areaName: "Tạo lập nội dung số",
      subCompetence: "3.1 Chuẩn hóa văn bản chứng từ số",
      targetLevelReq: "Level 1-2 (Cơ bản)",
      question: "Nhiệm vụ tạo lập nội dung số của vị trí Kế toán chủ yếu tập trung vào hoạt động nào sau đây?",
      options: [
        "Sản xuất video marketing giới thiệu dịch vụ doanh nghiệp",
        "Soạn thảo chứng từ kế toán, phiếu thu/chi, hóa đơn số hóa đúng định dạng quy chuẩn của công ty",
        "Thiết kế hình ảnh banner đồ họa cho mạng xã hội",
        "Viết bài PR bài đăng quảng cáo tuyển dụng"
      ],
      correct: 1,
      assignedLevelIfCorrect: 2,
      assignedLevelIfWrong: 1,
      failedModuleCode: "A3-F-M1",
      explanation: "Vị trí Kế toán chỉ yêu cầu mức Cơ bản (Level 1-2) ở Tạo lập nội dung, tập trung vào chứng từ văn bản số hóa."
    },
    {
      id: "diag_acc_4",
      areaId: "area_4",
      areaCode: "4",
      areaName: "An toàn, phúc lợi và trách nhiệm",
      subCompetence: "4.1 Bảo mật Chữ ký số PKI & Hóa đơn điện tử (Nghị định 123/2020 & Luật GDĐĐT 2023)",
      targetLevelReq: "Level 5-6 (Nâng cao - Trọng tâm)",
      question: "Để phòng chống rủi ro gian lận hóa đơn điện tử giả mạo và mất an toàn Chữ ký số (USB Token) của doanh nghiệp, quy trình bảo mật nào là đúng chuẩn Nâng cao?",
      options: [
        "Cắm sẵn USB Token Chữ ký số vào máy tính công ty và chia sẻ PIN công khai cho mọi người",
        "Phân quyền quản lý Token chặt chẽ, cài đặt mật khẩu phức tạp, kiểm tra mã hash hóa đơn điện tử trên cổng xác minh Thuế trước khi hạch toán",
        "Cho mượn USB Token để ký thay mà không có văn bản ủy quyền",
        "Không cần dùng chữ ký số vì ký tay scan lên là đủ"
      ],
      correct: 1,
      assignedLevelIfCorrect: 6,
      assignedLevelIfWrong: 3,
      failedModuleCode: "A4-A-M1",
      explanation: "Chữ ký số có giá trị pháp lý tương đương con dấu doanh nghiệp, yêu cầu quy trình bảo vệ Token và kiểm tra mã xác thực hóa đơn chặt chẽ."
    },
    {
      id: "diag_acc_5",
      areaId: "area_5",
      areaCode: "5",
      areaName: "Nhận diện và giải quyết vấn đề",
      subCompetence: "5.2 Xử lý lỗi dữ liệu Spreadsheet & Thuế số",
      targetLevelReq: "Level 3-4 (Trung cấp)",
      question: "Khi phát hiện bảng tính Excel đối soát dòng tiền bị lệch số liệu do lỗi công thức tham chiếu (#REF! hoặc #VALUE!), bước xử lý chuẩn của Kế toán là gì?",
      options: [
        "Gõ chèn một con số giả lập để bảng tính ra kết quả cân bằng",
        "Truy vết nguồn dữ liệu tham chiếu (Trace Precedents), kiểm tra kiểu dữ liệu (Text vs Number) và sửa lại công thức logic đúng quy trình",
        "Xóa bỏ toàn bộ bảng tính và làm lại từ đầu không cần kiểm tra lỗi",
        "Bỏ qua vì số lệch nhỏ không đáng kể"
      ],
      correct: 1,
      assignedLevelIfCorrect: 4,
      assignedLevelIfWrong: 2,
      failedModuleCode: "A5-I-M2",
      explanation: "Giải quyết vấn đề spreadsheet yêu cầu truy vết nguyên nhân gốc ô tham chiếu và sửa lỗi logic công thức tài chính."
    }
  ],

  hr_specialist: [
    {
      id: "diag_hr_1",
      areaId: "area_1",
      areaCode: "1",
      areaName: "Tìm kiếm, đánh giá, quản lý thông tin",
      subCompetence: "1.3 Quản trị Hồ sơ & Dữ liệu Nhân sự (HRIS)",
      targetLevelReq: "Level 3-4 (Trung cấp)",
      question: "Khi quản lý phần mềm cơ sở dữ liệu nhân sự (HRIS), thao tác sắp xếp và lưu trữ thông tin nào sau đây đảm bảo tìm kiếm nhanh và chính xác?",
      options: [
        "Lưu tất cả hồ sơ ứng viên ra màn hình Desktop theo tên tự do",
        "Thiết lập cấu trúc thư mục quy chuẩn theo Mã nhân viên - Họ tên - Phòng ban và gắn thẻ metadata chỉ số KPI/Hợp đồng",
        "Chụp ảnh hồ sơ gửi vào nhóm chat chung của công ty",
        "Không lưu trữ số vì đã có hồ sơ giấy"
      ],
      correct: 1,
      assignedLevelIfCorrect: 4,
      assignedLevelIfWrong: 2,
      failedModuleCode: "A1-I-M3",
      explanation: "Quản lý dữ liệu HRIS chuẩn Trung cấp yêu cầu cấu trúc thư mục quy chuẩn và phân loại thuộc tính hồ sơ khoa học."
    },
    {
      id: "diag_hr_2",
      areaId: "area_2",
      areaCode: "2",
      areaName: "Giao tiếp và cộng tác",
      subCompetence: "2.1 Tuyển dụng số & Truyền thông nội bộ",
      targetLevelReq: "Level 5-6 (Nâng cao - Trọng tâm)",
      question: "Để xây dựng quy trình Tuyển dụng số (Digital Recruitment) và Onboarding trực tuyến hiệu quả cho nhân sự mới, giải pháp nào đạt chuẩn Nâng cao?",
      options: [
        "Chỉ phỏng vấn qua điện thoại 2 phút và gửi tin nhắn bảo đến làm việc",
        "Xây dựng Cổng thông tin Tuyển dụng (Career Site), hệ thống theo dõi ứng viên (ATS), quy trình họp phỏng vấn MS Teams/Zoom chuyên nghiệp và kho tài liệu số Onboarding tự động",
        "Bắt nhân sự mới tự đi hỏi đồng nghiệp thông tin công ty mà không hướng dẫn",
        "Gửi tệp tài liệu 500 trang qua email bắt tự đọc trong ngày đầu tiên"
      ],
      correct: 1,
      assignedLevelIfCorrect: 6,
      assignedLevelIfWrong: 3,
      failedModuleCode: "A2-A-M4",
      explanation: "Tuyển dụng & Onboarding số cấp độ Nâng cao đòi hỏi quy trình tự động hóa qua hệ thống ATS và trải nghiệm truyền thông tích cực."
    },
    {
      id: "diag_hr_3",
      areaId: "area_3",
      areaCode: "3",
      areaName: "Tạo lập nội dung số",
      subCompetence: "3.1 Biên soạn JD Tuyển dụng & E-Learning HR",
      targetLevelReq: "Level 3-4 (Trung cấp)",
      question: "Khi biên soạn Bản mô tả công việc (JD) và bài giảng E-learning đào tạo nội bộ, quy tắc thiết kế nội dung số chuẩn là gì?",
      options: [
        "Sao chép nguyên văn JD của công ty khác bất chấp khác biệt mô hình",
        "Cấu trúc thông tin rõ ràng (Mục tiêu vị trí, Nhiệm vụ chính, Chuẩn năng lực DigComp, Quyền lợi), sử dụng định dạng số tương tác và tương thích thiết bị di động",
        "Viết một đoạn văn thật dài không phân dòng gạch đầu dòng",
        "Dùng font chữ trang trí cầu kỳ khó đọc"
      ],
      correct: 1,
      assignedLevelIfCorrect: 4,
      assignedLevelIfWrong: 2,
      failedModuleCode: "A3-I-M1",
      explanation: "Nội dung số HR đòi hỏi chuẩn hóa cấu trúc bài đăng tuyển dụng và thiết kế bài giảng số dễ hấp thụ."
    },
    {
      id: "diag_hr_4",
      areaId: "area_4",
      areaCode: "4",
      areaName: "An toàn, phúc lợi và trách nhiệm",
      subCompetence: "4.2 Bảo vệ Dữ liệu cá nhân người lao động (Chương II Nghị định 13/2023/NĐ-CP)",
      targetLevelReq: "Level 5-6 (Nâng cao - Trọng tâm)",
      question: "Theo Chương II Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân, Ban Nhân sự xử lý dữ liệu cá nhân nhạy cảm của người lao động (lương, sức khỏe, lý lịch) phải tuân thủ nguyên tắc nào?",
      options: [
        "Công khai bảng lương và hồ sơ sức khỏe của nhân viên lên bảng tin chung",
        "Lấy sự đồng ý (Consent) bằng văn bản/điện tử của người lao động, phân quyền truy cập tối thiểu cho cán bộ HR phụ trách và mã hóa hồ sơ lương",
        "Chia sẻ dữ liệu nhân sự cho các đơn vị quảng cáo bên ngoài để lấy tiền",
        "Không cần bảo mật vì nhân viên làm việc trong cùng một công ty"
      ],
      correct: 1,
      assignedLevelIfCorrect: 6,
      assignedLevelIfWrong: 3,
      failedModuleCode: "A4-A-M2",
      explanation: "Nghị định 13 quy định nghiêm ngặt việc xử lý dữ liệu cá nhân người lao động phải có sự đồng ý (Consent) và mã hóa bảo mật."
    },
    {
      id: "diag_hr_5",
      areaId: "area_5",
      areaCode: "5",
      areaName: "Nhận diện và giải quyết vấn đề",
      subCompetence: "5.1 Hướng dẫn & Hỗ trợ kỹ năng số cho nhân viên",
      targetLevelReq: "Level 3-4 (Trung cấp)",
      question: "Khi nhân viên gặp khó khăn trong việc thao tác trên hệ thống đánh giá KPI số mới của công ty, phương án giải quyết của chuyên viên HR/L&D là gì?",
      options: [
        "Trách mạo nhân viên chậm tiến bộ và đe dọa trừ điểm KPI",
        "Xây dựng tài liệu hướng dẫn nhanh (Quick Guide Video/PDF), tổ chức buổi hướng dẫn thao tác trực tiếp và tiếp nhận hỗ trợ sự cố qua ticket",
        "Bỏ qua hệ thống số và quay lại làm trên giấy",
        "Tự làm thay cho tất cả nhân viên"
      ],
      correct: 1,
      assignedLevelIfCorrect: 4,
      assignedLevelIfWrong: 2,
      failedModuleCode: "A5-I-M1",
      explanation: "Giải quyết vấn đề đào tạo số đòi hỏi tạo công cụ hỗ trợ người dùng (User Support Guide) và thúc đẩy văn hóa số."
    }
  ],

  b2b_sales: [
    {
      id: "diag_sales_1",
      areaId: "area_1",
      areaCode: "1",
      areaName: "Tìm kiếm, đánh giá, quản lý thông tin",
      subCompetence: "1.3 Quản lý Pipeline & Dữ liệu Khách hàng CRM",
      targetLevelReq: "Level 3-4 (Trung cấp)",
      question: "Để theo dõi hiệu quả phễu bán hàng (Sales Pipeline) trên phần mềm CRM, thao tác cập nhật dữ liệu nào là chuẩn chuyên nghiệp?",
      options: [
        "Ghi chép thông tin khách hàng vào sổ tay cá nhân và không nhập lên CRM",
        "Cập nhật trạng thái cơ hội (Lead Stage), giá trị hợp đồng dự kiến, lịch sử tiếp xúc và ngày dự kiến đóng deal ngay sau mỗi lần làm việc với khách",
        "Chỉ nhập dữ liệu CRM một lần vào ngày cuối năm",
        "Tạo các tài khoản khách hàng giả để báo cáo doanh số cho đẹp"
      ],
      correct: 1,
      assignedLevelIfCorrect: 4,
      assignedLevelIfWrong: 2,
      failedModuleCode: "A1-I-M3",
      explanation: "Quản lý dữ liệu CRM chuẩn Trung cấp yêu cầu cập nhật thời gian thực lịch sử làm việc và theo dõi chính xác tiến độ Sales Pipeline."
    },
    {
      id: "diag_sales_2",
      areaId: "area_2",
      areaCode: "2",
      areaName: "Giao tiếp và cộng tác",
      subCompetence: "2.1 Đàm phán & Tư vấn chốt hợp đồng online",
      targetLevelReq: "Level 5-6 (Nâng cao - Trọng tâm)",
      question: "Khi triển khai đàm phán hợp đồng thương mại lớn với đối tác qua kênh số (Video call meeting, Email, Zalo OA), kỹ năng giao tiếp số cấp Nâng cao đòi hỏi điều gì?",
      options: [
        "Nói thật nhanh và ngắt lời đối tác qua cuộc gọi trực tuyến",
        "Chuẩn bị tài liệu số trực quan, ghi lại biên bản ghi nhớ cuộc họp (MOU) bằng văn bản xác nhận điện tử và chốt điều khoản rõ ràng qua email chính thức",
        "Chỉ trao đổi qua tin nhắn thoại nhắn tin cá nhân không có hồ sơ xác nhận",
        "Hủy cuộc họp trực tuyến nếu đối tác tắt camera"
      ],
      correct: 1,
      assignedLevelIfCorrect: 6,
      assignedLevelIfWrong: 3,
      failedModuleCode: "A2-A-M1",
      explanation: "Đàm phán thương mại số Nâng cao yêu cầu xác nhận điều khoản bằng biên bản ghi nhớ điện tử và lưu trữ nhật ký giao dịch hợp pháp."
    },
    {
      id: "diag_sales_3",
      areaId: "area_3",
      areaCode: "3",
      areaName: "Tạo lập nội dung số",
      subCompetence: "3.1 Tạo Báo giá & Presentation Pitch Deck B2B",
      targetLevelReq: "Level 3-4 (Trung cấp)",
      question: "Chuyên viên Sales cần chuẩn bị Hồ sơ đề xuất giải pháp (Proposal / Pitch Deck) gửi cho khách hàng doanh nghiệp. Tiêu chuẩn nội dung số là gì?",
      options: [
        "Gửi bản nháp thô chưa định dạng và bị lỗi font chữ",
        "Tạo file PDF chuẩn khóa chỉnh sửa, thiết kế bố cục chuyên nghiệp, cá nhân hóa theo nỗi đau khách hàng và tính toán sẵn bảng so sánh giá trị ROI",
        "Gửi bảng giá bằng hình ảnh chụp mờ từ điện thoại",
        "Sao chép proposal của đối thủ cạnh tranh và quên thay tên công ty"
      ],
      correct: 1,
      assignedLevelIfCorrect: 4,
      assignedLevelIfWrong: 2,
      failedModuleCode: "A3-I-M1",
      explanation: "Proposal kinh doanh số yêu cầu định dạng chuẩn PDF chuyên nghiệp, cá nhân hóa giải pháp và trực quan hóa lợi ích thương mại."
    },
    {
      id: "diag_sales_4",
      areaId: "area_4",
      areaCode: "4",
      areaName: "An toàn, phúc lợi và trách nhiệm",
      subCompetence: "4.1 Bảo mật Thông tin thương mại & Thỏa thuận NDA",
      targetLevelReq: "Level 3-4 (Trung cấp)",
      question: "Khi tiếp nhận thông tin dữ liệu kinh doanh bảo mật của khách hàng trong quá trình làm báo giá, nguyên tắc tuân thủ an toàn thông tin là gì?",
      options: [
        "Tiết lộ thông tin báo giá của khách hàng này cho đối thủ cạnh tranh để lấy thưởng",
        "Ký thỏa thuận bảo mật thông tin (NDA), lưu trữ tài liệu trong thư mục mã hóa phân quyền và không chia sẻ cho bên thứ ba chưa được cấp phép",
        "Đăng tải tài liệu dự án của khách hàng lên mạng xã hội cá nhân",
        "Lưu file dữ liệu nhạy cảm trên máy tính công cộng"
      ],
      correct: 1,
      assignedLevelIfCorrect: 4,
      assignedLevelIfWrong: 2,
      failedModuleCode: "A4-I-M1",
      explanation: "Tuân thủ an toàn thương mại yêu cầu thực thi thỏa thuận bảo mật NDA và bảo vệ dữ liệu dự án kinh doanh của đối tác."
    },
    {
      id: "diag_sales_5",
      areaId: "area_5",
      areaCode: "5",
      areaName: "Nhận diện và giải quyết vấn đề",
      subCompetence: "5.2 Xử lý rào cản từ chối mua hàng trong quy trình số",
      targetLevelReq: "Level 3-4 (Trung cấp)",
      question: "Khách hàng phản hồi từ chối mua hàng qua email vì lý do 'chi phí công nghệ quá cao'. Cách giải quyết vấn đề bằng công cụ số hiệu quả là gì?",
      options: [
        "Tranh cãi gay gắt với khách hàng qua email và ngừng liên lạc",
        "Phân tích nguyên nhân, gửi bảng tính mô phỏng điểm hòa vốn (Break-even Analysis) và tài liệu Case Study thành công qua liên kết tương tác",
        "Giảm giá 90% ngay lập tức mà không cần xin ý kiến cấp trên",
        "Xóa khách hàng khỏi CRM và đánh dấu thất bại"
      ],
      correct: 1,
      assignedLevelIfCorrect: 4,
      assignedLevelIfWrong: 2,
      failedModuleCode: "A5-I-M3",
      explanation: "Giải quyết rào cản bán hàng bằng công cụ số đòi hỏi chứng minh giá trị kinh tế bằng mô hình bảng tính tài chính và dữ liệu minh chứng."
    }
  ]
};

// Default fallback diagnostic questions (Marketing Specialist)
export const DIAGNOSTIC_ASSESSMENT = ROLE_DIAGNOSTIC_ASSESSMENTS.marketing_specialist;

export const USER_ACCOUNTS = [
  {
    id: "employee_mkt",
    username: "an.nguyen@company.com",
    name: "Nguyễn Văn An",
    role: "employee",
    roleLabel: "Nhân viên (Chuyên viên Marketing)",
    jobTitle: "Digital Marketing Specialist",
    department: "Phòng Marketing & Truyền thông",
    avatar: "👨‍💻",
    description: "Nhân sự được theo dõi năng lực số, tham gia bài thi, học tập và nộp bài tập thực hành."
  },
  {
    id: "manager_mkt",
    username: "long.tran@company.com",
    name: "Trần Hoàng Long",
    role: "dept_manager",
    roleLabel: "Trưởng phòng (Department Manager)",
    jobTitle: "Head of Marketing",
    department: "Phòng Marketing & Truyền thông",
    avatar: "👔",
    description: "Theo dõi khoảng cách kỹ năng của đội ngũ, giao bài tập, chấm duyệt bằng chứng và xác nhận năng lực."
  },
  {
    id: "hr_director",
    username: "ha.le@company.com",
    name: "Lê Thu Hà",
    role: "hr_manager",
    roleLabel: "Quản trị Đào tạo (HR / Training Manager)",
    jobTitle: "Head of L&D & Competency Governance",
    department: "Ban Nhân sự & Đào tạo Tập đoàn",
    avatar: "👩‍💼",
    description: "Quản lý khung năng lực toàn công ty, phân bổ chỉ tiêu, phê duyệt ngân sách đào tạo và giám sát rủi ro."
  },
  {
    id: "public_verifier",
    username: "guest@external.org",
    name: "Khách ngoài / Nhà tuyển dụng",
    role: "public_visitor",
    roleLabel: "Khách tra cứu công khai (Public Visitor)",
    jobTitle: "Đối tác / Kiểm định độc lập",
    department: "External Verifier",
    avatar: "🔍",
    description: "Tra cứu tính xác thực của Chứng chỉ Năng lực số thông qua Mã số hoặc Quét mã QR."
  }
];

export const PRACTICAL_TASK = {
  id: "task_mkt_q4",
  title: "Xây Dựng & Tối Ưu Chiến Dịch Tiếp Thị Đa Kênh Tích Hợp Năng Lực Số (Multi-channel Growth Campaign)",
  roleCode: "MKT-DIG-01",
  targetLevel: "Level 5-6 (Nâng cao)",
  objective: "Vận dụng kiến thức DigComp đã học để lập kế hoạch truyền thông, sản xuất ấn phẩm đa phương tiện tuân thủ bản quyền thương mại, thiết lập tracking dữ liệu GA4/ROAS và xây dựng phương án kiểm thử A/B Testing có ý nghĩa thống kê.",
  requirements: [
    "Kế hoạch truyền thông & Bảng phân bổ ngân sách dự toán ROAS/CAC (Minh chứng Lĩnh vực 1)",
    "Quy trình phối hợp Agency và thiết lập phân quyền an toàn qua Meta Business Manager ID (Minh chứng Lĩnh vực 2 & 4)",
    "Bộ ấn phẩm gồm Video ngắn đa nền tảng có chứng nhận bản quyền âm thanh thương mại (Minh chứng Lĩnh vực 3 - Trọng tâm)",
    "Kịch bản kiểm thử A/B Testing và quy trình xử lý khủng hoảng truyền thông 24h (Minh chứng Lĩnh vực 5)"
  ]
};

