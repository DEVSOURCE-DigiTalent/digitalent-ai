import type { CareerRole } from '../../public/data/careerData';

export interface DiagnosticQuestion {
  id: number;
  areaId: string;
  areaName: string;
  subTopic: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  competencyWeight: number;
}

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  // Lĩnh vực 1: Dữ liệu & Thông tin
  {
    id: 1,
    areaId: 'area_1',
    areaName: 'Dữ liệu & Thông tin',
    subTopic: 'Vector Database & Semantic Search',
    text: 'Thành phần nào đóng vai trò cốt lõi trong việc lưu trữ và truy xuất các đoạn văn bản tương đồng ngữ nghĩa trong kiến trúc RAG?',
    options: [
      'Cơ sở dữ liệu Vector (Vector Database) kết hợp Embedding Model',
      'Bộ nhớ đệm Redis lưu trữ chuỗi văn bản thuần',
      'Bảng quan hệ SQL chuẩn hóa dạng 3NF',
      'Hệ thống tệp JSON phân tán trên S3',
    ],
    correctIndex: 0,
    explanation: 'Vector Database lưu trữ các vector embedding đa chiều và thực hiện thuật toán tìm kiếm tương đồng (như Cosine Similarity hoặc HNSW) để truy xuất tài liệu phù hợp nhất.',
    competencyWeight: 6,
  },
  {
    id: 2,
    areaId: 'area_1',
    areaName: 'Dữ liệu & Thông tin',
    subTopic: 'Data Chunking & Preprocessing',
    text: 'Khi chuẩn bị tài liệu nội bộ dài cho mô hình LLM, chiến lược chia đoạn (chunking) nào giúp duy trì ngữ cảnh liền mạch tốt nhất?',
    options: [
      'Chia cố định đúng 500 ký tự mà không xét ranh giới câu',
      'Sử dụng Recursive Character Text Splitter kết hợp Overlap vừa phải (10-20%)',
      'Chỉ đưa tiêu đề văn bản vào bộ nhớ ngữ cảnh',
      'Nén toàn bộ file PDF thành một đoạn duy nhất',
    ],
    correctIndex: 1,
    explanation: 'Recursive Character Splitting tôn trọng các đoạn văn, dấu câu và việc có đoạn gối đầu (overlap) giúp không bị đứt gãy ngữ nghĩa giữa hai chunk liên tiếp.',
    competencyWeight: 5,
  },

  // Lĩnh vực 2: Giao tiếp & Cộng tác
  {
    id: 3,
    areaId: 'area_2',
    areaName: 'Giao tiếp & Cộng tác số',
    subTopic: 'API Integration & Webhook',
    text: 'Để hệ thống CRM tự động kích hoạt trợ lý AI xử lý phản hồi khi khách hàng gửi ticket mới, phương thức tích hợp nào là tối ưu nhất?',
    options: [
      'Cơ chế Webhook thời gian thực hoặc Hàng đợi Sự kiện (Event Queue)',
      'Chạy cron job quét database mỗi 24 giờ một lần',
      'Gửi email thông báo cho kỹ sư để copy vào AI thủ công',
      'Lưu trữ ticket vào file Excel trên Google Drive',
    ],
    correctIndex: 0,
    explanation: 'Webhook và Message Queue cho phép phản hồi tức thì sự kiện (Real-time Event-driven Architecture), giảm độ trễ và tăng tính ổn định của hệ thống cộng tác.',
    competencyWeight: 5,
  },
  {
    id: 4,
    areaId: 'area_2',
    areaName: 'Giao tiếp & Cộng tác số',
    subTopic: 'Git Workflow & Versioning',
    text: 'Trong quy trình phát triển sản phẩm công nghệ theo nhóm, phương pháp nào tốt nhất để quản lý các phiên bản Prompt và mã nguồn an toàn?',
    options: [
      'Sử dụng Git với Branching Strategy rõ ràng và Pull Request Code Review',
      'Chia sẻ file prompt qua nhóm chat Zalo',
      'Ghi đè trực tiếp lên file trên máy chủ môi trường production',
      'Lưu các bản nháp prompt trong ghi chú điện thoại',
    ],
    correctIndex: 0,
    explanation: 'Git quản lý lịch sử thay đổi rõ ràng, hỗ trợ rollback khi gặp sự cố và cho phép đồng đội review đánh giá trước khi merge vào nhánh chính.',
    competencyWeight: 5,
  },

  // Lĩnh vực 3: Sáng tạo nội dung & Prompting
  {
    id: 5,
    areaId: 'area_3',
    areaName: 'Sáng tạo nội dung & Prompting',
    subTopic: 'Prompt Design & Optimization',
    text: 'Kỹ thuật Prompting nào hiệu quả nhất để giảm thiểu hiện tượng ảo giác (hallucination) trong các bài toán suy luận logic và tính toán phức tạp?',
    options: [
      'Zero-shot prompting không kèm ngữ cảnh hay hướng dẫn',
      'Chain-of-Thought (CoT) prompting kết hợp ví dụ mẫu Few-shot',
      'Tăng tham số Temperature lên mức tối đa 1.0',
      'Rút ngắn câu lệnh chỉ còn 3 từ duy nhất',
    ],
    correctIndex: 1,
    explanation: 'Chain-of-Thought hướng dẫn mô hình suy nghĩ từng bước trước khi đưa ra kết luận cuối cùng, kết hợp ví dụ cụ thể giúp mô hình bám sát cấu trúc logic mong muốn.',
    competencyWeight: 6,
  },
  {
    id: 6,
    areaId: 'area_3',
    areaName: 'Sáng tạo nội dung & Prompting',
    subTopic: 'Structured Output Formatting',
    text: 'Để đảm bảo LLM luôn trả lời theo đúng định dạng dữ liệu cho ứng dụng backend dễ dàng parse mà không bị lỗi cú pháp, giải pháp nào là chuẩn mực?',
    options: [
      'Yêu cầu định dạng JSON Schema thông qua cơ chế Structured Outputs / Function Calling',
      'Yêu cầu mô hình trả lời bằng thơ tự do',
      'Nhắc AI "vui lòng chỉ trả về JSON đừng thêm gì khác" nhưng không đặt schema ràng buộc',
      'Để AI tự quyết định định dạng XML, YAML hay văn bản thuần tùy ý',
    ],
    correctIndex: 0,
    explanation: 'Cơ chế Structured Outputs cưỡng chế mô hình sinh token tuân thủ nghiêm ngặt theo JSON Schema định nghĩa trước, triệt tiêu 100% nguy cơ lỗi cú pháp parse.',
    competencyWeight: 6,
  },

  // Lĩnh vực 4: An toàn & Bảo mật số
  {
    id: 7,
    areaId: 'area_4',
    areaName: 'An toàn & Bảo mật số',
    subTopic: 'Prompt Injection Defense',
    text: 'Một kỹ thuật phổ biến được kẻ tấn công sử dụng nhằm vượt qua các ràng buộc an toàn của LLM bằng cách chèn câu lệnh ghi đè (override) chỉ dẫn hệ thống được gọi là gì?',
    options: [
      'Prompt Injection / Jailbreak Attack',
      'Cross-site Scripting (XSS)',
      'Distributed Denial of Service (DDoS)',
      'SQL Injection thuần túy',
    ],
    correctIndex: 0,
    explanation: 'Prompt Injection xảy ra khi dữ liệu đầu vào người dùng chứa chỉ dẫn độc hại nhằm đánh lừa LLM lờ đi System Prompt ban đầu của nhà phát triển.',
    competencyWeight: 6,
  },
  {
    id: 8,
    areaId: 'area_4',
    areaName: 'An toàn & Bảo mật số',
    subTopic: 'Privacy Compliance & Decree 13',
    text: 'Theo Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân tại Việt Nam, doanh nghiệp cần thực hiện hành động nào trước khi đưa dữ liệu khách hàng vào huấn luyện hoặc xử lý bằng AI?',
    options: [
      'Có sự đồng ý rõ ràng của chủ thể dữ liệu và thực hiện đánh giá tác động xử lý dữ liệu cá nhân (DPIA)',
      'Có thể sử dụng tự do bất kỳ dữ liệu nào mà không cần thông báo',
      'Chỉ cần lưu dữ liệu trên máy chủ nước ngoài',
      'Xóa tên khách hàng nhưng giữ nguyên số CCCD và số điện thoại công khai',
    ],
    correctIndex: 0,
    explanation: 'Nghị định 13 quy định nghiêm ngặt về quyền của chủ thể dữ liệu, bắt buộc phải có sự đồng ý hợp lệ và hồ sơ đánh giá tác động xử lý dữ liệu cá nhân.',
    competencyWeight: 6,
  },

  // Lĩnh vực 5: Giải quyết vấn đề & Tối ưu AI
  {
    id: 9,
    areaId: 'area_5',
    areaName: 'Giải quyết vấn đề & Tối ưu AI',
    subTopic: 'Model Evaluation & Benchmarking',
    text: 'Khung đánh giá RAGAS (Retrieval Augmented Generation Assessment) thường tập trung đo lường những chỉ số chính nào sau đây?',
    options: [
      'Faithfulness (Độ trung thực), Answer Relevance (Độ liên quan câu trả lời) và Context Precision (Độ chính xác ngữ cảnh)',
      'Số lượt like của người dùng trên mạng xã hội',
      'Tốc độ gõ phím của lập trình viên',
      'Độ dài số lượng từ ngữ trong phản hồi',
    ],
    correctIndex: 0,
    explanation: 'RAGAS đánh giá chất lượng hệ thống RAG độc lập ở cả khâu truy xuất (Context Precision & Recall) và khâu sinh phản hồi (Faithfulness & Answer Relevance).',
    competencyWeight: 6,
  },
  {
    id: 10,
    areaId: 'area_5',
    areaName: 'Giải quyết vấn đề & Tối ưu AI',
    subTopic: 'Performance & Cost Optimization',
    text: 'Khi xây dựng ứng dụng AI quy mô doanh nghiệp với hàng triệu lượt truy vấn mỗi ngày, giải pháp nào giúp tối ưu chi phí token và độ trễ phản hồi tốt nhất?',
    options: [
      'Sử dụng Semantic Caching để tái sử dụng câu trả lời cho các câu hỏi tương đồng và định tuyến mô hình thông minh (Model Routing)',
      'Luôn gửi toàn bộ cơ sở dữ liệu doanh nghiệp trong mỗi prompt gọi mô hình đắt tiền nhất',
      'Tăng context window lên tối đa 1 triệu tokens cho tất cả các câu hỏi đơn giản',
      'Bỏ qua bước lọc câu hỏi từ người dùng',
    ],
    correctIndex: 0,
    explanation: 'Semantic Cache giúp trả lời ngay các câu hỏi lặp lại với chi phí 0 token, kết hợp Model Router chuyển câu đơn giản cho mô hình nhẹ (như GPT-4o-mini hay Claude Haiku).',
    competencyWeight: 6,
  },
];

export interface DiagnosticResult {
  roleId: string;
  roleTitle: string;
  roleCode: string;
  overallScore: number;
  totalAnswered: number;
  totalQuestions: number;
  areaBreakdown: {
    areaId: string;
    areaName: string;
    currentScore: number; // 0 - 100
    currentLevel: number; // 1 - 6
    requiredLevel: number; // 1 - 6
    gap: number;
    isMet: boolean;
    isCore: boolean;
    isExempt: boolean;
    recommendation: string;
  }[];
  exemptCount: number;
  gapCount: number;
  recommendedCourseIds: string[];
  evaluatedAt: string;
}

export function evaluateDiagnosticQuiz(
  answers: Record<number, number>,
  targetRole: CareerRole
): DiagnosticResult {
  const areas = ['area_1', 'area_2', 'area_3', 'area_4', 'area_5'];
  const areaNameMap: Record<string, string> = {
    area_1: 'Dữ liệu & Thông tin',
    area_2: 'Giao tiếp & Cộng tác số',
    area_3: 'Sáng tạo nội dung & Prompting',
    area_4: 'An toàn & Bảo mật số',
    area_5: 'Giải quyết vấn đề & Tối ưu AI',
  };

  let totalCorrect = 0;
  let totalQuestionsCount = DIAGNOSTIC_QUESTIONS.length;

  const areaBreakdown = areas.map((areaId) => {
    const areaQuestions = DIAGNOSTIC_QUESTIONS.filter((q) => q.areaId === areaId);
    let areaCorrect = 0;

    areaQuestions.forEach((q) => {
      if (answers[q.id] === q.correctIndex) {
        areaCorrect++;
        totalCorrect++;
      }
    });

    const percent = areaQuestions.length > 0 ? Math.round((areaCorrect / areaQuestions.length) * 100) : 50;

    // Convert percent to 1 - 6 level scale
    let currentLevel = 2;
    if (percent >= 90) currentLevel = 6;
    else if (percent >= 75) currentLevel = 5;
    else if (percent >= 50) currentLevel = 4;
    else if (percent >= 30) currentLevel = 3;
    else currentLevel = 2;

    const compReq = targetRole.competencies.find((c) => c.id === areaId);
    const requiredLevel = compReq ? compReq.requiredLevel : 5;
    const isCore = compReq ? compReq.isCore : false;
    const gap = Math.max(0, requiredLevel - currentLevel);
    const isMet = gap === 0;
    const isExempt = isMet;

    let recommendation = '';
    if (isExempt) {
      recommendation = 'Đạt chuẩn xuất sắc! Miễn học phần này để tập trung vào các kỹ năng chuyên sâu khác.';
    } else if (gap === 1) {
      recommendation = 'Thiếu hụt nhẹ so với chuẩn vị trí. Cần bổ sung 1 khóa học chuyên đề.';
    } else {
      recommendation = 'Khoảng cách lớn so với chuẩn vị trí. Cần ưu tiên hoàn thành lộ trình bù đắp nền tảng.';
    }

    return {
      areaId,
      areaName: compReq?.name || areaNameMap[areaId],
      currentScore: percent,
      currentLevel,
      requiredLevel,
      gap,
      isMet,
      isCore,
      isExempt,
      recommendation,
    };
  });

  const overallScore = Math.round((totalCorrect / totalQuestionsCount) * 100);
  const exemptCount = areaBreakdown.filter((a) => a.isExempt).length;
  const gapCount = areaBreakdown.filter((a) => !a.isExempt).length;

  // Derive recommended courses based on gaps
  const recommendedCourseIds = targetRole.recommendedCourses.map((c) => c.id);

  return {
    roleId: targetRole.id,
    roleTitle: targetRole.title,
    roleCode: targetRole.roleCode,
    overallScore,
    totalAnswered: Object.keys(answers).length,
    totalQuestions: totalQuestionsCount,
    areaBreakdown,
    exemptCount,
    gapCount,
    recommendedCourseIds,
    evaluatedAt: new Date().toISOString(),
  };
}

export interface CourseLesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'reading' | 'lab';
  videoUrl?: string;
  content: string;
  completed: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  lessons: CourseLesson[];
}

export interface DetailedCourse {
  id: string;
  title: string;
  code: string;
  category: string;
  frameworkRef: string;
  level: string;
  duration: string;
  enrolledLearners: number;
  rating: number;
  description: string;
  outcomes: string[];
  instructor: {
    name: string;
    title: string;
    avatar: string;
    company: string;
  };
  materials: {
    id: string;
    name: string;
    type: 'pdf' | 'repo' | 'sandbox' | 'doc';
    url: string;
    size?: string;
  }[];
  modules: CourseModule[];
}

export const COURSE_LIBRARY: Record<string, DetailedCourse> = {
  'crs-01': {
    id: 'crs-01',
    code: 'crs-01',
    title: 'Kỹ nghệ Câu lệnh AI Nâng cao (Prompt Engineering Masterclass)',
    category: 'AI & Generative AI',
    frameworkRef: 'Khung DigiComp AI 2.0 & ISO/IEC 42001',
    level: 'Nâng cao',
    duration: '6 giờ học',
    enrolledLearners: 1240,
    rating: 4.9,
    description: 'Làm chủ nghệ thuật và khoa học điều khiển mô hình ngôn ngữ lớn (LLM). Học cách thiết kế, tối ưu, tự động hóa prompt và xây dựng các chuỗi tương tác thông minh cho các bài toán doanh nghiệp.',
    outcomes: [
      'Nắm vững cơ chế hoạt động của Attention, Tokenizer và Context Window của LLM.',
      'Thiết kế thành thạo System Prompts với Persona, Constraints và Structured Output JSON.',
      'Áp dụng chiến lược Few-shot, Chain-of-Thought (CoT) và Tree-of-Thoughts vào nghiệp vụ.',
      'Phát hiện và phòng thủ chủ động chống Prompt Injection và Jailbreak Attacks.',
    ],
    instructor: {
      name: 'TS. Nguyễn Hoàng Nam',
      title: 'Head of AI Engineering',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
      company: 'DigiTalent AI Institute & Tech Hub',
    },
    materials: [
      {
        id: 'mat-01',
        name: 'Slide Bài giảng: Nguyên lý Prompting Doanh nghiệp (PDF)',
        type: 'pdf',
        url: '#',
        size: '12.4 MB',
      },
      {
        id: 'mat-02',
        name: 'Kho mẫu System Prompts & JSON Schema chuẩn hóa (GitHub)',
        type: 'repo',
        url: 'https://github.com/digitalent-ai/prompt-engineering-toolkit',
      },
      {
        id: 'mat-03',
        name: 'Môi trường Thực hành Tương tác Prompt Sandbox',
        type: 'sandbox',
        url: '#',
      },
    ],
    modules: [
      {
        id: 'mod-01',
        title: 'Phần 1: Nền tảng Mô hình Ngôn ngữ Lớn & Tokenization',
        description: 'Hiểu rõ nguyên lý sinh từ kế tiếp của Transformer và cách tokenizer phân tách văn bản tiếng Việt/Anh.',
        lessons: [
          {
            id: 'les-01',
            title: '1. Cơ chế hoạt động của Attention & Tokenizer',
            duration: '25 phút',
            type: 'video',
            completed: true,
            content: `Trong bài học này, chúng ta phân tích cách các mô hình Transformer như GPT, Claude hay Llama biểu diễn từ ngữ dưới dạng các số thực đa chiều (Embeddings). Chúng ta cũng khảo sát cách Tokenizer chia nhỏ từ vựng tiếng Việt và tác động trực tiếp của nó đến chi phí tokens và context limit.`,
          },
          {
            id: 'les-02',
            title: '2. Zero-shot, Few-shot và System Prompts chuẩn xác',
            duration: '40 phút',
            type: 'video',
            completed: false,
            content: `Tìm hiểu sâu về cấu trúc của System Prompt: định hình Persona chuyên gia, thiết lập Guardrails ràng buộc và cung cấp ví dụ mẫu Few-shot để định hướng mô hình suy nghĩ chính xác theo văn phong doanh nghiệp.`,
          },
        ],
      },
      {
        id: 'mod-02',
        title: 'Phần 2: Kỹ thuật Suy luận Nâng cao & Cấu trúc Đầu ra',
        description: 'Phương pháp phân rã vấn đề phức tạp và bắt buộc mô hình trả kết quả theo chuẩn máy đọc được.',
        lessons: [
          {
            id: 'les-03',
            title: '3. Kỹ thuật Chain-of-Thought & Tree-of-Thoughts',
            duration: '45 phút',
            type: 'video',
            completed: false,
            content: `Khi đối mặt với bài toán suy luận logic hoặc phân tích tài chính phức tạp, ép mô hình "suy nghĩ từng bước" (Step-by-step reasoning) giúp giảm tỷ lệ sai sót lên tới 80%. Bài này hướng dẫn cách kết hợp CoT với các kỹ thuật tự kiểm tra Self-Consistency.`,
          },
          {
            id: 'les-04',
            title: '4. Kiểm soát Cấu trúc Đầu ra với JSON Schema & Function Calling',
            duration: '35 phút',
            type: 'lab',
            completed: false,
            content: `Thực hành thiết lập JSON Schema để LLM trả về đúng cấu trúc dữ liệu cho phần mềm backend xử lý, ứng dụng cho bài toán trích xuất thực thể hợp đồng và phân loại hóa đơn tự động.`,
          },
        ],
      },
      {
        id: 'mod-03',
        title: 'Phần 3: An toàn, Đạo đức & Phòng thủ Prompt Injection',
        description: 'Bảo vệ hệ thống AI của doanh nghiệp khỏi các rủi ro bảo mật và rò rỉ dữ liệu.',
        lessons: [
          {
            id: 'les-05',
            title: '5. Kỹ thuật Phòng thủ Prompt Injection & Tuân thủ An ninh Dữ liệu',
            duration: '50 phút',
            type: 'video',
            completed: false,
            content: `Khảo sát các cuộc tấn công Prompt Injection thực tế và triển khai bộ lọc Guardrails, quy trình xác thực dữ liệu đầu vào và tuân thủ các quy định bảo vệ dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP.`,
          },
        ],
      },
    ],
  },
  'crs-02': {
    id: 'crs-02',
    code: 'crs-02',
    title: 'Tư duy Đặt câu hỏi và Phân rã bài toán cho AI',
    category: 'AI & Problem Solving',
    frameworkRef: 'Khung DigiComp AI 2.0',
    level: 'Trung cấp',
    duration: '4 giờ học',
    enrolledLearners: 980,
    rating: 4.8,
    description: 'Rèn luyện tư duy phân tích, chuyển đổi các yêu cầu kinh doanh mông lung thành chuỗi bài toán con cụ thể cho AI xử lý đạt hiệu quả tối đa.',
    outcomes: [
      'Phân tách bài toán kinh doanh thành các mục tiêu con cụ thể.',
      'Xây dựng ma trận ngữ cảnh đầu vào tối ưu cho mô hình ngôn ngữ.',
      'Đánh giá tính khả thi và rủi ro của từng kịch bản ứng dụng AI.',
    ],
    instructor: {
      name: 'ThS. Trần Minh Khoa',
      title: 'Principal AI Solution Architect',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
      company: 'Global Digital Transformation Advisory',
    },
    materials: [
      {
        id: 'mat-04',
        name: 'Framework Phân rã Bài toán AI (PDF & Miro Template)',
        type: 'pdf',
        url: '#',
      },
    ],
    modules: [
      {
        id: 'mod-21',
        title: 'Phần 1: Tư duy Phân rã Vấn đề',
        description: 'Nguyên lý chia nhỏ vấn đề MECE trong kỷ nguyên AI.',
        lessons: [
          {
            id: 'les-21',
            title: '1. Khung tư duy MECE và Áp dụng cho AI',
            duration: '30 phút',
            type: 'video',
            completed: true,
            content: `Học cách chia tách vấn đề kinh doanh không trùng lặp và không bỏ sót để giao việc chính xác cho AI.`,
          },
          {
            id: 'les-22',
            title: '2. Xây dựng Sơ đồ Dòng dữ liệu AI Workflow',
            duration: '45 phút',
            type: 'lab',
            completed: true,
            content: `Mô hình hóa các bước tương tác người dùng - AI - hệ thống nghiệp vụ.`,
          },
        ],
      },
    ],
  },
  'crs-03': {
    id: 'crs-03',
    code: 'crs-03',
    title: 'Kiến trúc RAG từ cơ bản đến ứng dụng thực tiễn',
    category: 'AI & Data Engineering',
    frameworkRef: 'DigiComp 3.0 & Cloud AI Architecture',
    level: 'Nâng cao',
    duration: '8 giờ học',
    enrolledLearners: 840,
    rating: 4.95,
    description: 'Xây dựng giải pháp tìm kiếm ngữ nghĩa, kết nối cơ sở tri thức doanh nghiệp với LLM bằng LangChain, LlamaIndex và Vector DB hàng đầu.',
    outcomes: [
      'Làm chủ kiến trúc Naive RAG, Advanced RAG và Modular RAG.',
      'Sử dụng Vector DB (Chroma, Qdrant, Pinecone) để lưu trữ và truy vấn embeddings.',
      'Tối ưu hóa chiến lược Chunking, Hybrid Search và Reranking.',
    ],
    instructor: {
      name: 'TS. Nguyễn Hoàng Nam',
      title: 'Head of AI Engineering',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
      company: 'DigiTalent AI Institute',
    },
    materials: [
      {
        id: 'mat-05',
        name: 'Source code Dự án RAG hoàn chỉnh (GitHub Repo)',
        type: 'repo',
        url: 'https://github.com/digitalent-ai/rag-enterprise-starter',
      },
    ],
    modules: [
      {
        id: 'mod-31',
        title: 'Phần 1: Kiến trúc RAG và Vector Embedding',
        description: 'Từ embedding mô hình đến thuật toán tìm kiếm vector.',
        lessons: [
          {
            id: 'les-31',
            title: '1. Tổng quan Kiến trúc RAG & So sánh Fine-tuning',
            duration: '40 phút',
            type: 'video',
            completed: false,
            content: `Phân tích khi nào doanh nghiệp nên dùng RAG và khi nào cần Fine-tuning mô hình.`,
          },
        ],
      },
    ],
  },
};

export interface Milestone {
  id: string;
  stage: string;
  title: string;
  description: string;
  courses: {
    id: string;
    name: string;
    duration: string;
    completed: boolean;
    isExempt?: boolean;
  }[];
}

export const LEARNER_MILESTONES: Milestone[] = [
  {
    id: 'm-01',
    stage: 'Giai đoạn 1',
    title: 'Nền tảng Prompting & Tư duy AI',
    description: 'Xây dựng nền móng vững chắc về cơ chế Transformer, tokenization và prompt structures cơ bản.',
    courses: [
      { id: 'crs-01', name: 'Kỹ nghệ Câu lệnh AI Nâng cao (Prompt Engineering)', duration: '6 giờ', completed: false },
      { id: 'crs-02', name: 'Tư duy Đặt câu hỏi và Phân rã bài toán', duration: '4 giờ', completed: true },
    ],
  },
  {
    id: 'm-02',
    stage: 'Giai đoạn 2',
    title: 'Quy trình LLM & Tích hợp RAG',
    description: 'Ứng dụng các thư viện điều phối LangChain/LlamaIndex và kiến trúc tìm kiếm ngữ nghĩa vector.',
    courses: [
      { id: 'crs-03', name: 'Kiến trúc RAG từ cơ bản đến ứng dụng thực tiễn', duration: '8 giờ', completed: false },
      { id: 'crs-04', name: 'Đánh giá chất lượng và Guardrails cho LLM', duration: '5 giờ', completed: false },
    ],
  },
  {
    id: 'm-03',
    stage: 'Giai đoạn 3',
    title: 'Dự án Capstone & Khảo thí Chứng chỉ',
    description: 'Thực chiến xây dựng ứng dụng AI hoàn chỉnh và thi chứng chỉ chuẩn DigiTalent AI Certified Prompt Specialist.',
    courses: [
      { id: 'crs-05', name: 'Dự án tốt nghiệp: Trợ lý AI Enterprise đa tác vụ', duration: '12 giờ', completed: false },
    ],
  },
];

export interface PracticalTask {
  id: string;
  title: string;
  courseTitle: string;
  courseId: string;
  dueDate: string;
  rubrics: string[];
  status: 'PENDING' | 'SUBMITTED' | 'GRADED';
  score?: number;
  submission?: {
    repoUrl: string;
    reportUrl: string;
    summaryNotes: string;
    submittedAt: string;
    evaluatorNotes?: string;
  };
}

export const PRACTICAL_TASKS: PracticalTask[] = [
  {
    id: 'tsk-01',
    title: 'Xây dựng Few-shot Prompt phân loại cảm xúc khách hàng hỗ trợ đa ngôn ngữ',
    courseTitle: 'Kỹ nghệ Câu lệnh AI Nâng cao (crs-01)',
    courseId: 'crs-01',
    dueDate: '2026-10-15',
    rubrics: [
      'Định hình System Persona và tiêu chí gán nhãn chính xác (Tích cực, Trung tính, Tiêu cực, Khiếu nại khẩn).',
      'Cung cấp tối thiểu 5 ví dụ Few-shot bao gồm cả tiếng Việt tiếng lóng và tiếng Anh.',
      'Cưỡng chế đầu ra chuẩn JSON Schema với trường reason và sentimentScore.',
      'Độ chính xác phân loại đạt trên 90% trên tập dữ liệu kiểm thử 50 mẫu.',
    ],
    status: 'GRADED',
    score: 92,
    submission: {
      repoUrl: 'https://github.com/learner/prompt-sentiment-analysis',
      reportUrl: 'https://drive.google.com/file/d/sentiment-report-v1',
      summaryNotes: 'Đã hoàn thành thiết kế prompt với 6 ví dụ đa ngôn ngữ, tích hợp JSON Mode và kiểm thử trên 60 bình luận thực tế của người dùng.',
      submittedAt: '2026-09-18 14:32',
      evaluatorNotes: 'Prompt có cấu trúc rất chặt chẽ, xử lý ngoại lệ tốt, giải thích lý do gán nhãn rõ ràng. Điểm 92/100.',
    },
  },
  {
    id: 'tsk-02',
    title: 'Thiết kế System Prompt với JSON Schema Output cho Trợ lý Trích xuất Hợp đồng',
    courseTitle: 'Kỹ nghệ Câu lệnh AI Nâng cao (crs-01)',
    courseId: 'crs-01',
    dueDate: '2026-10-25',
    rubrics: [
      'Trích xuất đầy đủ: Bên A, Bên B, Giá trị hợp đồng, Thời hạn, Điều khoản phạt.',
      'Ràng buộc kiểu dữ liệu số, ngày tháng theo định dạng ISO chuẩn.',
      'Thiết lập cờ cảnh báo nếu hợp đồng thiếu chữ ký hoặc điều khoản bất thường.',
    ],
    status: 'SUBMITTED',
    submission: {
      repoUrl: 'https://github.com/learner/contract-extractor-llm',
      reportUrl: 'https://drive.google.com/file/d/contract-extract-report',
      summaryNotes: 'Đã nộp bài giải với 4 schema lồng nhau và xử lý trường hợp thông tin bị khuyết trong hợp đồng scan OCR.',
      submittedAt: '2026-09-24 09:15',
    },
  },
  {
    id: 'tsk-03',
    title: 'Thực nghiệm Prompt Injection Defense và đo lường tỷ lệ vượt rào',
    courseTitle: 'Đánh giá chất lượng và Guardrails cho LLM (crs-04)',
    courseId: 'crs-04',
    dueDate: '2026-11-05',
    rubrics: [
      'Thu thập và chạy thử nghiệm tối thiểu 20 vector tấn công Prompt Injection (Jailbreak, DAN, Role-play).',
      'Triển khai ít nhất 2 lớp phòng vệ (Input sanitization & Secondary judge LLM).',
      'Báo cáo đo lường tỷ lệ vượt rào (Attack Success Rate) trước và sau khi kích hoạt Guardrails.',
    ],
    status: 'PENDING',
  },
];

export interface DigitalCertificate {
  id: string;
  credentialId: string;
  title: string;
  courseTitle: string;
  recipientName: string;
  recipientEmail: string;
  issueDate: string;
  expiryDate: string;
  verificationCode: string;
  credentialUrl: string;
  frameworkStandard: string;
  score: number;
  issuer: {
    name: string;
    organization: string;
    signatory: string;
    title: string;
  };
}

export const ISSUED_CERTIFICATES: DigitalCertificate[] = [
  {
    id: 'cert-dt-2026-001',
    credentialId: 'cert-dt-2026-001',
    title: 'DigiTalent AI Certified Prompt Specialist',
    courseTitle: 'Kỹ nghệ Câu lệnh AI Nâng cao (crs-01)',
    recipientName: 'Trần Văn Hoàng',
    recipientEmail: 'hoang.tran@company.com',
    issueDate: '2026-08-15',
    expiryDate: 'Không thời hạn',
    verificationCode: 'DTAI-PRM-9831',
    credentialUrl: '/verify?id=cert-dt-2026-001',
    frameworkStandard: 'Khung năng lực số DigiComp 3.0 & ISO/IEC 42001 AI Management',
    score: 94,
    issuer: {
      name: 'DigiTalent AI Global Assessment Board',
      organization: 'DigiTalent AI Inc.',
      signatory: 'GS. David Nguyễn',
      title: 'Hội đồng Khoa học & Chuẩn hóa Năng lực Số',
    },
  },
  {
    id: 'cert-dt-2026-002',
    credentialId: 'cert-dt-2026-002',
    title: 'Foundations of Modern AI & Prompt Engineering',
    courseTitle: 'Tư duy Đặt câu hỏi và Phân rã bài toán (crs-02)',
    recipientName: 'Trần Văn Hoàng',
    recipientEmail: 'hoang.tran@company.com',
    issueDate: '2026-07-20',
    expiryDate: 'Không thời hạn',
    verificationCode: 'DTAI-FND-4412',
    credentialUrl: '/verify?id=cert-dt-2026-002',
    frameworkStandard: 'Thông tư 03/2014/TT-BTTTT & Chuẩn DigComp 3.0',
    score: 90,
    issuer: {
      name: 'DigiTalent AI Certification Authority',
      organization: 'DigiTalent AI Inc.',
      signatory: 'TS. Nguyễn Hoàng Nam',
      title: 'Giám đốc Chương trình Đào tạo',
    },
  },
];
