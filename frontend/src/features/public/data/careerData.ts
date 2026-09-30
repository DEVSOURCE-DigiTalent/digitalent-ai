export interface CompetencyRequirement {
  id: string;
  areaCode: string;
  name: string;
  requiredLevel: number; // 1 - 6
  requiredLabel: string;
  isCore: boolean;
  benchmarkNote: string;
}

export interface RecommendedCourse {
  id: string;
  title: string;
  duration: string;
  level: string;
  lessonsCount: number;
  description: string;
}

export interface CareerRole {
  id: string;
  slug: string;
  roleCode: string;
  title: string;
  department: string;
  levelBadge: string;
  salaryRange: string;
  vnStandardReference: string;
  description: string;
  summary: string;
  competencies: CompetencyRequirement[];
  recommendedCourses: RecommendedCourse[];
}

export interface DigCompArea {
  id: string;
  code: string;
  name: string;
  enName: string;
  description: string;
  coreFocus: string;
}

export const DIGCOMP_AREAS: DigCompArea[] = [
  {
    id: 'area_1',
    code: '1',
    name: 'Dữ liệu & Thông tin',
    enName: 'Information & Data Literacy',
    description: 'Tìm kiếm, lọc, đánh giá tính xác thực và quản lý tổ chức dữ liệu số.',
    coreFocus: 'Định danh nguồn tin, SQL/Data analysis, quản lý tài sản dữ liệu',
  },
  {
    id: 'area_2',
    code: '2',
    name: 'Giao tiếp & Cộng tác số',
    enName: 'Communication & Collaboration',
    description: 'Tương tác đa kênh, chia sẻ tài nguyên số và phối hợp qua công cụ trực tuyến.',
    coreFocus: 'Cộng tác Git/DevOps, điều phối đội ngũ phân tán, quản trị danh tính số',
  },
  {
    id: 'area_3',
    code: '3',
    name: 'Sáng tạo nội dung & Prompting',
    enName: 'Digital Content Creation & AI Prompting',
    description: 'Sáng tạo, chỉnh sửa nội dung đa phương tiện, lập trình và điều khiển mô hình AI.',
    coreFocus: 'System Prompting, Few-shot design, Microservices coding, Code generation',
  },
  {
    id: 'area_4',
    code: '4',
    name: 'An toàn & Bảo mật số',
    enName: 'Safety & Security',
    description: 'Bảo vệ thiết bị số, dữ liệu cá nhân, tuân thủ an toàn thông tin và Nghị định 13.',
    coreFocus: 'Nghị định 13/2023/NĐ-CP, phòng chống Prompt Injection, 2FA, mã hóa dữ liệu',
  },
  {
    id: 'area_5',
    code: '5',
    name: 'Giải quyết vấn đề & Tối ưu AI',
    enName: 'Problem Solving & AI Optimization',
    description: 'Xác định sự cố kỹ thuật, giải quyết bài toán phức tạp và tối ưu hóa quy trình tự động.',
    coreFocus: 'RAG architecture, fine-tuning evaluation, troubleshooting & RCA',
  },
];

export const CAREER_ROLES: CareerRole[] = [
  {
    id: 'tg-01',
    slug: 'ai-engineer',
    roleCode: 'AI-ENG-01',
    title: 'AI Engineer (Kỹ sư Trí tuệ Nhân tạo & LLM)',
    department: 'AI & Machine Learning Lab',
    levelBadge: 'Chuyên viên Nâng cao (Senior/Lead)',
    salaryRange: '35 - 65 triệu VNĐ',
    vnStandardReference: 'Chiến lược Quốc gia về Nghiên cứu & Phát triển AI 2030 (Quyết định 127/QĐ-TTg)',
    description: 'Làm chủ kiến trúc mô hình ngôn ngữ lớn (LLM), kỹ nghệ Prompting chuyên sâu, tích hợp RAG và xây dựng trợ lý AI doanh nghiệp tuân thủ an toàn.',
    summary: 'Phụ trách toàn diện vòng đời giải pháp AI: từ thiết kế prompt, đánh giá chất lượng phản hồi, triển khai Vector DB đến xây dựng hàng rào bảo vệ (Guardrails).',
    competencies: [
      {
        id: 'area_1',
        areaCode: '1',
        name: 'Dữ liệu & Embedding Vector',
        requiredLevel: 6,
        requiredLabel: 'Nâng cao (bậc 5–6)',
        isCore: true,
        benchmarkNote: 'Xử lý dữ liệu văn bản lớn, chunking thông minh và semantic search với Vector DB.',
      },
      {
        id: 'area_2',
        areaCode: '2',
        name: 'Giao tiếp & Tích hợp Hệ thống',
        requiredLevel: 5,
        requiredLabel: 'Nâng cao (bậc 5–6)',
        isCore: false,
        benchmarkNote: 'Tích hợp API LLM với hệ thống doanh nghiệp (Slack, MS Teams, CRM).',
      },
      {
        id: 'area_3',
        areaCode: '3',
        name: 'Kỹ nghệ Prompt & Workflow LLM',
        requiredLevel: 6,
        requiredLabel: 'Nâng cao (bậc 5–6) · trọng tâm cốt lõi',
        isCore: true,
        benchmarkNote: 'Làm chủ Chain-of-Thought, ReAct, Function Calling và kiến trúc Agentic workflows.',
      },
      {
        id: 'area_4',
        areaCode: '4',
        name: 'An toàn AI & Guardrails',
        requiredLevel: 5,
        requiredLabel: 'Nâng cao (bậc 5–6)',
        isCore: true,
        benchmarkNote: 'Phòng chống Prompt Injection, rò rỉ dữ liệu cá nhân (Nghị định 13) và kiểm soát hallucination.',
      },
      {
        id: 'area_5',
        areaCode: '5',
        name: 'Đánh giá & Tối ưu Mô hình',
        requiredLevel: 6,
        requiredLabel: 'Nâng cao (bậc 5–6)',
        isCore: false,
        benchmarkNote: 'Benchmark hiệu năng RAGAS, giảm chi phí token và độ trễ phản hồi inference.',
      },
    ],
    recommendedCourses: [
      {
        id: 'crs-01',
        title: 'Kỹ nghệ Câu lệnh AI Nâng cao (Prompt Engineering Masterclass)',
        duration: '6 giờ học',
        level: 'Nâng cao',
        lessonsCount: 5,
        description: 'Làm chủ nghệ thuật và khoa học điều khiển mô hình ngôn ngữ lớn (LLM). Thiết kế system prompts và chuỗi tương tác phức tạp.',
      },
      {
        id: 'crs-02',
        title: 'Tư duy Đặt câu hỏi và Phân rã bài toán cho AI',
        duration: '4 giờ học',
        level: 'Trung bình',
        lessonsCount: 4,
        description: 'Phương pháp phân rã bài toán kinh doanh thành các chuỗi nhiệm vụ logic để AI thực thi chính xác.',
      },
      {
        id: 'crs-03',
        title: 'Kiến trúc RAG từ cơ bản đến ứng dụng thực tiễn',
        duration: '8 giờ học',
        level: 'Nâng cao',
        lessonsCount: 6,
        description: 'Xây dựng giải pháp tìm kiếm ngữ nghĩa, kết nối cơ sở tri thức doanh nghiệp với LLM bằng LangChain và Vector DB.',
      },
      {
        id: 'crs-04',
        title: 'Đánh giá chất lượng và Guardrails cho LLM',
        duration: '5 giờ học',
        level: 'Nâng cao',
        lessonsCount: 4,
        description: 'Thiết lập các bộ lọc an toàn, ngăn chặn jailbreak và đo lường độ chính xác phản hồi theo chuẩn bảo mật.',
      },
      {
        id: 'crs-05',
        title: 'Dự án tốt nghiệp: Trợ lý AI Enterprise đa tác vụ',
        duration: '12 giờ học',
        level: 'Thực chiến Capstone',
        lessonsCount: 3,
        description: 'Xây dựng hoàn chỉnh trợ lý AI nội bộ phục vụ tra cứu chính sách và phân tích nghiệp vụ.',
      },
    ],
  },
  {
    id: 'tg-02',
    slug: 'data-analyst',
    roleCode: 'DATA-ANA-02',
    title: 'Data Analyst (Chuyên viên Phân tích Dữ liệu & BI)',
    department: 'Business Intelligence & Insights',
    levelBadge: 'Chuyên viên (Mid-level)',
    salaryRange: '20 - 40 triệu VNĐ',
    vnStandardReference: 'Chuẩn kỹ năng ứng dụng CNTT theo Thông tư 03/2014/TT-BTTTT & DigComp 3.0',
    description: 'Chuyển hóa dữ liệu thô từ nhiều nguồn thành các báo cáo trực quan, dashboard thời gian thực và insight hành động hỗ trợ lãnh đạo ra quyết định.',
    summary: 'Thành thạo SQL truy vấn dữ liệu lớn, mô hình hóa dữ liệu sao/tuyết (Star/Snowflake), thiết kế Dashboard Power BI/Tableau và phân tích xu hướng kinh doanh.',
    competencies: [
      {
        id: 'area_1',
        areaCode: '1',
        name: 'Mô hình hóa Dữ liệu & SQL',
        requiredLevel: 6,
        requiredLabel: 'Nâng cao (bậc 5–6) · trọng tâm cốt lõi',
        isCore: true,
        benchmarkNote: 'Thiết kế cơ sở dữ liệu quan hệ, viết query phức tạp và pipeline trích xuất ETL.',
      },
      {
        id: 'area_2',
        areaCode: '2',
        name: 'Chia sẻ Báo cáo & Trực quan',
        requiredLevel: 5,
        requiredLabel: 'Nâng cao (bậc 5–6)',
        isCore: false,
        benchmarkNote: 'Trình bày kết quả phân tích cho các phòng ban kinh doanh hiểu rõ.',
      },
      {
        id: 'area_3',
        areaCode: '3',
        name: 'Thiết kế Dashboard tương tác',
        requiredLevel: 5,
        requiredLabel: 'Nâng cao (bậc 5–6)',
        isCore: true,
        benchmarkNote: 'Tạo dashboard Power BI/Tableau với DAX measures và drill-down linh hoạt.',
      },
      {
        id: 'area_4',
        areaCode: '4',
        name: 'Bảo mật Dữ liệu Kinh doanh',
        requiredLevel: 4,
        requiredLabel: 'Trung bình (bậc 3–4)',
        isCore: false,
        benchmarkNote: 'Phân quyền truy cập theo vai trò (RLS) và bảo vệ thông tin tài chính nhạy cảm.',
      },
      {
        id: 'area_5',
        areaCode: '5',
        name: 'Phân tích Thống kê & Giải quyết sự cố dữ liệu',
        requiredLevel: 5,
        requiredLabel: 'Nâng cao (bậc 5–6)',
        isCore: false,
        benchmarkNote: 'Phát hiện dữ liệu bất thường (Anomalies) và kiểm định giả thuyết A/B.',
      },
    ],
    recommendedCourses: [
      {
        id: 'crs-da-01',
        title: 'SQL Nâng cao & Data Modeling Doanh nghiệp',
        duration: '8 giờ học',
        level: 'Nâng cao',
        lessonsCount: 5,
        description: 'Tối ưu truy vấn SQL trên tập dữ liệu hàng triệu dòng, thiết kế schema Star/Snowflake.',
      },
      {
        id: 'crs-da-02',
        title: 'Xây dựng Dashboard Quản trị Doanh nghiệp với Power BI',
        duration: '10 giờ học',
        level: 'Nâng cao',
        lessonsCount: 6,
        description: 'Làm chủ DAX nâng cao, thiết kế giao diện báo cáo chuyên nghiệp theo chuẩn UI/UX dữ liệu.',
      },
      {
        id: 'crs-da-03',
        title: 'Phân tích Thống kê và Dự báo Kinh doanh bằng Python',
        duration: '12 giờ học',
        level: 'Nâng cao',
        lessonsCount: 6,
        description: 'Ứng dụng Pandas, NumPy và Seaborn để tìm kiếm quy luật và phân khúc khách hàng.',
      },
      {
        id: 'crs-da-04',
        title: 'Đồ án Thực chiến: Xây dựng Hệ thống BI Toàn diện',
        duration: '14 giờ học',
        level: 'Thực chiến Capstone',
        lessonsCount: 4,
        description: 'Kết nối nguồn dữ liệu bán hàng thực tế và xuất bản dashboard cho ban giám đốc.',
      },
    ],
  },
  {
    id: 'tg-03',
    slug: 'cloud-devops',
    roleCode: 'CLD-OPS-03',
    title: 'Cloud & DevOps Engineer (Kỹ sư Đám mây & Tự động hóa)',
    department: 'Cloud Infrastructure & DevOps',
    levelBadge: 'Kỹ sư Cấp cao (Senior)',
    salaryRange: '30 - 60 triệu VNĐ',
    vnStandardReference: 'Tiêu chuẩn Bảo mật Hạ tầng Đám mây ISO/IEC 27017 & Luật Viễn thông',
    description: 'Thiết kế, xây dựng và tự động hóa hệ thống hạ tầng đám mây tin cậy cao trên AWS/GCP/Azure với container Docker và điều phối Kubernetes.',
    summary: 'Chịu trách nhiệm thiết lập CI/CD pipeline tự động, triển khai hạ tầng dưới dạng mã nguồn (IaC Terraform) và giám sát hệ thống 24/7.',
    competencies: [
      {
        id: 'area_1',
        areaCode: '1',
        name: 'Quản trị Hạ tầng & Lưu trữ Đám mây',
        requiredLevel: 5,
        requiredLabel: 'Nâng cao (bậc 5–6)',
        isCore: false,
        benchmarkNote: 'Kiến trúc VPC, S3, RDS, CloudFront và tối ưu hóa chi phí đám mây FinOps.',
      },
      {
        id: 'area_2',
        areaCode: '2',
        name: 'Cộng tác GitOps & Điều phối',
        requiredLevel: 6,
        requiredLabel: 'Nâng cao (bậc 5–6) · trọng tâm cốt lõi',
        isCore: true,
        benchmarkNote: 'Tự động hóa triển khai đa môi trường qua ArgoCD và Git branching workflows.',
      },
      {
        id: 'area_3',
        areaCode: '3',
        name: 'Infrastructure as Code & CI/CD Scripts',
        requiredLevel: 6,
        requiredLabel: 'Nâng cao (bậc 5–6)',
        isCore: true,
        benchmarkNote: 'Viết mã Terraform, Ansible và GitHub Actions pipeline chuẩn hóa.',
      },
      {
        id: 'area_4',
        areaCode: '4',
        name: 'Bảo mật Hạ tầng & DevSecOps',
        requiredLevel: 6,
        requiredLabel: 'Nâng cao (bậc 5–6)',
        isCore: true,
        benchmarkNote: 'Quản lý secrets, rà quét lỗ hổng image container (Trivy) và IAM Zero Trust.',
      },
      {
        id: 'area_5',
        areaCode: '5',
        name: 'Khắc phục Sự cố & Giám sát Hệ thống',
        requiredLevel: 6,
        requiredLabel: 'Nâng cao (bậc 5–6)',
        isCore: false,
        benchmarkNote: 'Thiết lập Prometheus, Grafana, OpenTelemetry và phản ứng sự cố khẩn cấp.',
      },
    ],
    recommendedCourses: [
      {
        id: 'crs-dev-01',
        title: 'Nền tảng Điện toán Đám mây Chuẩn Doanh nghiệp',
        duration: '10 giờ học',
        level: 'Nâng cao',
        lessonsCount: 5,
        description: 'Kiến trúc đám mây an toàn, có khả năng mở rộng cao trên nền tảng AWS và Hybrid-Cloud.',
      },
      {
        id: 'crs-dev-02',
        title: 'Docker Containerization & Kubernetes Thực chiến',
        duration: '14 giờ học',
        level: 'Nâng cao',
        lessonsCount: 7,
        description: 'Đóng gói ứng dụng microservices, quản lý Pods, Deployments, Ingress và Helm Charts.',
      },
      {
        id: 'crs-dev-03',
        title: 'Xây dựng CI/CD Pipeline Tự động với GitHub Actions',
        duration: '8 giờ học',
        level: 'Trung bình',
        lessonsCount: 4,
        description: 'Kiểm thử mã nguồn tự động, build docker images và deploy lên môi trường staging/production.',
      },
      {
        id: 'crs-dev-04',
        title: 'Đồ án Tốt nghiệp: Hệ thống Multi-Tier Tự động Khắc phục Lỗi',
        duration: '16 giờ học',
        level: 'Thực chiến Capstone',
        lessonsCount: 4,
        description: 'Thiết kế hạ tầng chịu tải 100k người dùng với tính năng Auto-scaling và Alerting.',
      },
    ],
  },
  {
    id: 'tg-04',
    slug: 'cybersecurity',
    roleCode: 'SEC-OPS-04',
    title: 'Cybersecurity Specialist (Chuyên viên An toàn Thông tin & Bảo mật)',
    department: 'Information Security & Compliance',
    levelBadge: 'Chuyên gia (Senior)',
    salaryRange: '28 - 55 triệu VNĐ',
    vnStandardReference: 'Luật An ninh mạng Việt Nam (Nghị định 53/2022/NĐ-CP) & Tiêu chuẩn ISO/IEC 27001',
    description: 'Bảo vệ hệ thống số, phát hiện và ngăn chặn các nguy cơ tấn công mạng, đánh giá lỗ hổng bảo mật và đảm bảo tuân thủ pháp lý số.',
    summary: 'Chuyên trách vận hành Trung tâm Giám sát An ninh (SOC), điều tra sự cố số, kiểm thử xâm nhập (PenTest) và đào tạo nâng cao nhận thức an ninh số.',
    competencies: [
      {
        id: 'area_1',
        areaCode: '1',
        name: 'Quản trị Dữ liệu Nhạy cảm & Mã hóa',
        requiredLevel: 5,
        requiredLabel: 'Nâng cao (bậc 5–6)',
        isCore: false,
        benchmarkNote: 'Mã hóa dữ liệu tại chỗ (At rest) và truyền tải (In transit), phân loại dữ liệu.',
      },
      {
        id: 'area_2',
        areaCode: '2',
        name: 'Quy trình Phối hợp Ứng cứu Sự cố',
        requiredLevel: 5,
        requiredLabel: 'Nâng cao (bậc 5–6)',
        isCore: false,
        benchmarkNote: 'Kế hoạch phản ứng sự cố (IRP) và liên lạc khẩn cấp khi xảy ra tấn công mã độc.',
      },
      {
        id: 'area_3',
        areaCode: '3',
        name: 'Phân tích Mã độc & Scripting Bảo mật',
        requiredLevel: 5,
        requiredLabel: 'Nâng cao (bậc 5–6)',
        isCore: false,
        benchmarkNote: 'Viết script tự động rà quét kiểm tra an ninh và phân tích log tấn công.',
      },
      {
        id: 'area_4',
        areaCode: '4',
        name: 'Phòng thủ Mạng & Tuân thủ Luật An ninh mạng',
        requiredLevel: 6,
        requiredLabel: 'Nâng cao (bậc 5–6) · trọng tâm cốt lõi',
        isCore: true,
        benchmarkNote: 'Thiết lập Firewall WAF, SIEM, xác thực đa yếu tố và tuân thủ Nghị định 13/2023/NĐ-CP.',
      },
      {
        id: 'area_5',
        areaCode: '5',
        name: 'Đánh giá Lỗ hổng & Xử lý Tấn công',
        requiredLevel: 6,
        requiredLabel: 'Nâng cao (bậc 5–6)',
        isCore: true,
        benchmarkNote: 'Thực hiện Penetration Testing theo OWASP Top 10 và vá lỗi kịp thời.',
      },
    ],
    recommendedCourses: [
      {
        id: 'crs-sec-01',
        title: 'Nguyên lý An toàn Thông tin & Phòng thủ Không gian Số',
        duration: '8 giờ học',
        level: 'Cơ bản - Trung bình',
        lessonsCount: 5,
        description: 'Các hình thái tấn công phổ biến (Phishing, Ransomware, MITM) và nguyên tắc Zero Trust.',
      },
      {
        id: 'crs-sec-02',
        title: 'Giám sát An ninh Mạng (SOC) và Điều tra Sự cố',
        duration: '12 giờ học',
        level: 'Nâng cao',
        lessonsCount: 6,
        description: 'Vận hành hệ thống SIEM, phân tích nhật ký log máy chủ và xác định nguồn gốc tấn công.',
      },
      {
        id: 'crs-sec-03',
        title: 'Kiểm thử Xâm nhập Ứng dụng Web theo chuẩn OWASP',
        duration: '14 giờ học',
        level: 'Nâng cao',
        lessonsCount: 7,
        description: 'Thực hành tấn công thử nghiệm SQL Injection, XSS, CSRF và kỹ thuật phòng chống.',
      },
      {
        id: 'crs-sec-04',
        title: 'Đồ án Thực hành: Thiết kế Hệ thống Phòng thủ An ninh Đa lớp',
        duration: '12 giờ học',
        level: 'Thực chiến Capstone',
        lessonsCount: 3,
        description: 'Xây dựng sơ đồ kiến trúc phòng thủ và tài liệu tuân thủ chuẩn ISO 27001.',
      },
    ],
  },
  {
    id: 'tg-05',
    slug: 'fullstack',
    roleCode: 'DEV-FS-05',
    title: 'Fullstack Software Engineer (Kỹ sư Phát triển Phần mềm Toàn diện)',
    department: 'Software Engineering & Product',
    levelBadge: 'Kỹ sư Chuyên nghiệp (Mid/Senior)',
    salaryRange: '25 - 50 triệu VNĐ',
    vnStandardReference: 'Chuẩn phát triển phần mềm doanh nghiệp & Kiến trúc Cloud-Native Hiện đại',
    description: 'Xây dựng ứng dụng hoàn chỉnh từ giao diện người dùng tương tác cao (React/Next.js) đến hệ thống backend API hiệu năng cao, tối ưu cơ sở dữ liệu.',
    summary: 'Làm chủ toàn bộ luồng phát triển sản phẩm: xây dựng REST/GraphQL APIs, xử lý bất đồng bộ, tích hợp cổng thanh toán và triển khai đám mây.',
    competencies: [
      {
        id: 'area_1',
        areaCode: '1',
        name: 'Thiết kế & Tối ưu Cơ sở Dữ liệu',
        requiredLevel: 6,
        requiredLabel: 'Nâng cao (bậc 5–6)',
        isCore: true,
        benchmarkNote: 'Thiết kế cơ sở dữ liệu quan hệ (PostgreSQL) và NoSQL (Redis, MongoDB), tối ưu chỉ mục Index.',
      },
      {
        id: 'area_2',
        areaCode: '2',
        name: 'Cộng tác Mã nguồn & Code Review',
        requiredLevel: 5,
        requiredLabel: 'Nâng cao (bậc 5–6)',
        isCore: false,
        benchmarkNote: 'Quy trình Git Flow, viết tài liệu API OpenAPI/Swagger và review mã đồng nghiệp.',
      },
      {
        id: 'area_3',
        areaCode: '3',
        name: 'Lập trình Frontend & Backend Hiện đại',
        requiredLevel: 6,
        requiredLabel: 'Nâng cao (bậc 5–6) · trọng tâm cốt lõi',
        isCore: true,
        benchmarkNote: 'Xây dựng giao diện React/TypeScript mượt mà kết hợp backend Node.js/Go mạnh mẽ.',
      },
      {
        id: 'area_4',
        areaCode: '4',
        name: 'Bảo mật Ứng dụng & Xác thực (Auth)',
        requiredLevel: 5,
        requiredLabel: 'Nâng cao (bậc 5–6)',
        isCore: false,
        benchmarkNote: 'Triển khai JWT, OAuth2, RBAC phân quyền bảo mật và chống tấn công web.',
      },
      {
        id: 'area_5',
        areaCode: '5',
        name: 'Giải quyết Bài toán Hiệu năng & Khả năng chịu tải',
        requiredLevel: 6,
        requiredLabel: 'Nâng cao (bậc 5–6)',
        isCore: true,
        benchmarkNote: 'Cache dữ liệu với Redis, xử lý hàng đợi tin nhắn (RabbitMQ/Kafka) và debug lỗi memory leak.',
      },
    ],
    recommendedCourses: [
      {
        id: 'crs-fs-01',
        title: 'React & TypeScript Hiện đại cho Dự án Quy mô Lớn',
        duration: '12 giờ học',
        level: 'Nâng cao',
        lessonsCount: 6,
        description: 'Kiến trúc Component tái sử dụng, state management với Zustand, tối ưu render hiệu năng cao.',
      },
      {
        id: 'crs-fs-02',
        title: 'Thiết kế RESTful API & Microservices với Node.js/Express',
        duration: '14 giờ học',
        level: 'Nâng cao',
        lessonsCount: 7,
        description: 'Xây dựng backend an toàn, tích hợp validation, logging, rate limiting và bảo mật.',
      },
      {
        id: 'crs-fs-03',
        title: 'Tối ưu hóa Cơ sở Dữ liệu PostgreSQL & Caching với Redis',
        duration: '10 giờ học',
        level: 'Nâng cao',
        lessonsCount: 5,
        description: 'Chiến lược đánh chỉ mục hiệu quả, transaction an toàn và cache đa tầng.',
      },
      {
        id: 'crs-fs-04',
        title: 'Đồ án Tốt nghiệp: Hệ thống Nền tảng SaaS Đa người dùng',
        duration: '18 giờ học',
        level: 'Thực chiến Capstone',
        lessonsCount: 5,
        description: 'Xây dựng trọn gói ứng dụng thương mại điện tử hoặc quản lý doanh nghiệp từ A-Z.',
      },
    ],
  },
];
