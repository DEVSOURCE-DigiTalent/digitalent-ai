import { route } from '../router';
import type { PlatformTrialItem, MentorTrial, TrialEssayAiReview } from '../../../trial-program.service';
import type { PulseFinalReviewQueue } from '../../../pulse.service';

const MOCK_TRIALS: PlatformTrialItem[] = [
  {
    organizationId: 'org-acme',
    organizationName: 'DigiTalent AI Enterprise',
    stage: 'ASSIGNED',
    testDeadline: '2026-11-08T23:59:59Z',
    preferredReviewAt: '2026-11-05T14:00:00Z',
    requestNote: 'Đề nghị mentor hỗ trợ đánh giá kỹ phần phân tích dữ liệu số và an toàn thông tin toàn diện.',
    requestedAt: '2026-10-28T09:00:00Z',
    mentorUserId: 'mock-mentor',
    mentorName: 'Mentor DigiTalent',
    ownerName: 'Lê Quản Trị',
    ownerEmail: 'owner@acme.corp',
    startedAt: '2026-10-25T08:00:00Z',
    participants: 5,
    submitted: 4,
    reviewed: 1,
  },
  {
    organizationId: 'org-vintech',
    organizationName: 'Tập đoàn Công nghệ VinTech Solutions',
    stage: 'ASSIGNED',
    testDeadline: '2026-11-10T17:00:00Z',
    preferredReviewAt: '2026-11-06T10:00:00Z',
    requestNote: 'Đội ngũ chuyển đổi số khối vận hành, cần hoàn tất báo cáo năng lực trước phiên họp chiến lược ban giám đốc.',
    requestedAt: '2026-10-29T14:30:00Z',
    mentorUserId: 'mock-mentor',
    mentorName: 'Mentor DigiTalent',
    ownerName: 'Trần Đại Diện',
    ownerEmail: 'owner@vintech.vn',
    startedAt: '2026-10-26T09:00:00Z',
    participants: 8,
    submitted: 8,
    reviewed: 0,
  },
  {
    organizationId: 'org-eduglobal',
    organizationName: 'Công ty Cổ phần Giáo dục Số EduGlobal',
    stage: 'REPORTED',
    testDeadline: '2026-10-25T18:00:00Z',
    preferredReviewAt: '2026-10-27T09:00:00Z',
    requestNote: 'Đánh giá năng lực số toàn diện cho giảng viên và nhân sự nội dung.',
    requestedAt: '2026-10-20T08:00:00Z',
    reportPublishedAt: '2026-10-30T16:00:00Z',
    mentorUserId: 'mock-mentor',
    mentorName: 'Mentor DigiTalent',
    ownerName: 'Phạm Giảng Viên',
    ownerEmail: 'owner@eduglobal.edu.vn',
    startedAt: '2026-10-18T08:00:00Z',
    participants: 12,
    submitted: 12,
    reviewed: 12,
  },
];

const DOMAINS = [
  { categoryId: 'cat-1', number: 1, code: 'D1', name: 'Dữ liệu và thông tin số' },
  { categoryId: 'cat-2', number: 2, code: 'D2', name: 'Giao tiếp và hợp tác số' },
  { categoryId: 'cat-3', number: 3, code: 'D3', name: 'Sáng tạo nội dung số' },
  { categoryId: 'cat-4', number: 4, code: 'D4', name: 'An toàn và an ninh mạng' },
  { categoryId: 'cat-5', number: 5, code: 'D5', name: 'Giải quyết vấn đề trong môi trường số' },
];

const ACME_TRIAL_DATA: MentorTrial = {
  organizationId: 'org-acme',
  organizationName: 'DigiTalent AI Enterprise',
  stage: 'ASSIGNED',
  testDeadline: '2026-11-08T23:59:59Z',
  preferredReviewAt: '2026-11-05T14:00:00Z',
  requestNote: 'Đề nghị mentor hỗ trợ đánh giá kỹ phần phân tích dữ liệu số và an toàn thông tin toàn diện.',
  domains: DOMAINS,
  canPublish: true,
  aiAvailable: true,
  essayMaxScore: 10,
  essayPassScore: 7,
  participants: [
    {
      id: 'p-1',
      employeeId: 'emp-an',
      fullName: 'Nguyễn Văn An',
      email: 'an.nguyen@acme.corp',
      departmentName: 'Kỹ thuật Công nghệ',
      positionName: 'Trưởng nhóm Phát triển Frontend',
      status: 'SUBMITTED',
      assessmentId: 'asm-an-01',
      submittedAt: '2026-11-01T10:15:00Z',
      addedAt: '2026-10-28T09:00:00Z',
    },
    {
      id: 'p-2',
      employeeId: 'emp-mai',
      fullName: 'Trần Thị Mai',
      email: 'mai.tran@acme.corp',
      departmentName: 'Dữ liệu & Phân tích',
      positionName: 'Chuyên viên Phân tích Nghiệp vụ (BA)',
      status: 'SUBMITTED',
      assessmentId: 'asm-mai-02',
      submittedAt: '2026-11-01T14:20:00Z',
      addedAt: '2026-10-28T09:00:00Z',
    },
    {
      id: 'p-3',
      employeeId: 'emp-long',
      fullName: 'Lê Hoàng Long',
      email: 'long.le@acme.corp',
      departmentName: 'Dữ liệu & Phân tích',
      positionName: 'Kỹ sư Dữ liệu (Data Engineer)',
      status: 'REVIEWED',
      assessmentId: 'asm-long-03',
      submittedAt: '2026-10-31T16:45:00Z',
      reviewedAt: '2026-11-01T08:30:00Z',
      addedAt: '2026-10-28T09:00:00Z',
    },
    {
      id: 'p-4',
      employeeId: 'emp-bao',
      fullName: 'Phạm Quốc Bảo',
      email: 'bao.pham@acme.corp',
      departmentName: 'Kỹ thuật Công nghệ',
      positionName: 'Lập trình viên Backend',
      status: 'SUBMITTED',
      assessmentId: 'asm-bao-04',
      submittedAt: '2026-11-01T18:00:00Z',
      addedAt: '2026-10-28T09:00:00Z',
    },
    {
      id: 'p-5',
      employeeId: 'emp-trang',
      fullName: 'Vũ Thu Trang',
      email: 'trang.vu@acme.corp',
      departmentName: 'Nhân sự & Vận hành',
      positionName: 'Chuyên viên Nhân sự',
      status: 'ACTIVE',
      addedAt: '2026-10-28T09:00:00Z',
    },
  ],
  assessments: [
    {
      assessmentId: 'asm-an-01',
      employeeId: 'emp-an',
      fullName: 'Nguyễn Văn An',
      departmentName: 'Kỹ thuật Công nghệ',
      positionName: 'Trưởng nhóm Phát triển Frontend',
      submittedAt: '2026-11-01T10:15:00Z',
      choiceScore: 16,
      choiceTotal: 20,
      domains: [
        { categoryId: 'cat-1', number: 1, name: 'Dữ liệu và thông tin số', correct: [4, 3, 2], total: [4, 4, 3], suggestedLevel: 2 },
        { categoryId: 'cat-2', number: 2, name: 'Giao tiếp và hợp tác số', correct: [4, 4, 3], total: [4, 4, 3], suggestedLevel: 3 },
        { categoryId: 'cat-3', number: 3, name: 'Sáng tạo nội dung số', correct: [3, 3, 2], total: [4, 4, 3], suggestedLevel: 2 },
        { categoryId: 'cat-4', number: 4, name: 'An toàn và an ninh mạng', correct: [4, 4, 2], total: [4, 4, 3], suggestedLevel: 2 },
        { categoryId: 'cat-5', number: 5, name: 'Giải quyết vấn đề trong môi trường số', correct: [3, 2, 1], total: [4, 4, 3], suggestedLevel: 1 },
      ],
      essays: [
        {
          tier: 1,
          title: 'Khái niệm & Thực hành tìm kiếm dữ liệu',
          prompt: 'Mô tả phương pháp tìm kiếm và đánh giá độ tin cậy của thông tin kỹ thuật trực tuyến phục vụ dự án công nghệ.',
          text: 'Tôi thường áp dụng quy trình xác minh 3 bước: thứ nhất kiểm tra nguồn tài liệu gốc từ tài liệu chính thức (official documentation, RFC, MDN, standard specs). Thứ hai, đối chiếu phản hồi từ cộng đồng nhà phát triển trên GitHub issues, StackOverflow và các diễn đàn chuyên môn. Thứ ba, thử nghiệm trong môi trường sandbox để xác nhận tính chính xác và an toàn trước khi tích hợp vào dự án của công ty.',
          score: null,
        },
        {
          tier: 2,
          title: 'Thiết kế quy trình phân tích và chia sẻ dữ liệu',
          prompt: 'Xây dựng quy trình chia sẻ tài liệu và dữ liệu nội bộ giữa các phòng ban đảm bảo tính toàn vẹn và bảo mật.',
          text: 'Thiết lập mô hình phân quyền dựa trên vai trò (RBAC) trên hệ thống đám mây nội bộ. Tất cả dữ liệu nhạy cảm của khách hàng được mã hóa khi lưu trữ (at rest) và khi truyền tải (in transit). Tài liệu nội bộ được phân cấp: Công khai, Nội bộ, Tuyệt mật. Định kỳ 6 tháng kiểm toán phân quyền truy cập và thu hồi quyền của các tài khoản không còn hoạt động.',
          score: null,
        },
        {
          tier: 3,
          title: 'Xử lý sự cố an toàn thông tin và giải pháp tối ưu hóa',
          prompt: 'Đề xuất giải pháp khi phát hiện một lỗ hổng rò rỉ khóa API hoặc token trong kho mã nguồn công khai.',
          text: 'Ngay lập tức thu hồi (revoke) khóa bí mật trên nhà cung cấp dịch vụ, phát hành phiên bản khóa mới và cập nhật trên vault bảo mật. Đánh giá log truy cập trong 72 giờ qua để xác định có truy cập trái phép hay không. Sử dụng git-filter-repo hoặc BFG để xóa sạch lịch sử commit chứa khóa, đồng thời cấu hình pre-commit hook (như detect-secrets hoặc git-secrets) trong CI/CD để chặn mọi mã nhạy cảm trong tương lai.',
          score: null,
        },
      ],
      aiReview: {
        model: 'gemini-1.5-pro',
        reviewedAt: '2026-11-01T10:18:00Z',
        summary: 'Thí sinh thể hiện tư duy hệ thống mạch lạc, nắm chắc kiến thức thực tế về bảo mật và quy trình kỹ thuật. Các giải pháp đề xuất chi tiết, có tính khả thi cao.',
        essays: [
          { tier: 1, score: 8, passed: true, feedback: 'Quy trình kiểm tra nguồn mạch lạc, rõ ràng và có tính ứng dụng thực tế cao.' },
          { tier: 2, score: 8, passed: true, feedback: 'Đề xuất RBAC và mã hóa đầy đủ; có nêu rõ chu kỳ kiểm toán phân quyền.' },
          { tier: 3, score: 9, passed: true, feedback: 'Xử lý chuẩn xác tình huống rò rỉ khóa: revoke trước, lọc lịch sử git và tích hợp CI/CD hook phòng ngừa.' },
        ],
      },
      choiceItems: [
        { number: 1, question: 'Để kiểm tra tính xác thực của một trang web ngân hàng, người dùng nên chú ý yếu tố nào?', selected: 'Kiểm tra chứng chỉ SSL/TLS hợp lệ và tên miền chính xác trên thanh địa chỉ', correct: 'Kiểm tra chứng chỉ SSL/TLS hợp lệ và tên miền chính xác trên thanh địa chỉ', isCorrect: true },
        { number: 2, question: 'Phương pháp sao lưu dữ liệu 3-2-1 có ý nghĩa là gì?', selected: '3 bản sao, 2 loại phương tiện lưu trữ khác nhau, 1 bản lưu ngoại vi (offsite)', correct: '3 bản sao, 2 loại phương tiện lưu trữ khác nhau, 1 bản lưu ngoại vi (offsite)', isCorrect: true },
        { number: 3, question: 'Hình thức tấn công Phishing thường giả mạo điều gì?', selected: 'Tổ chức uy tín để lừa người dùng cung cấp thông tin đăng nhập hoặc dữ liệu nhạy cảm', correct: 'Tổ chức uy tín để lừa người dùng cung cấp thông tin đăng nhập hoặc dữ liệu nhạy cảm', isCorrect: true },
        { number: 4, question: 'Khung chuẩn năng lực số phân định thành bao nhiêu miền cơ bản?', selected: '5 miền năng lực số', correct: '5 miền năng lực số', isCorrect: true },
        { number: 5, question: 'Quyền riêng tư dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP bắt buộc bên xử lý phải làm gì?', selected: 'Chỉ chia sẻ dữ liệu khi được bên thứ ba trả phí', correct: 'Có sự đồng thuận rõ ràng của chủ thể dữ liệu trước khi xử lý', isCorrect: false },
      ],
      recording: {
        sessionId: 'rec-an-01',
        kind: 'FINAL' as const,
        status: 'SUBMITTED' as const,
        startedAt: '2026-11-01T15:00:00Z',
        flaggedCount: 0,
        segments: [],
        events: [],
      },
    },
    {
      assessmentId: 'asm-mai-02',
      employeeId: 'emp-mai',
      fullName: 'Trần Thị Mai',
      departmentName: 'Dữ liệu & Phân tích',
      positionName: 'Chuyên viên Phân tích Nghiệp vụ (BA)',
      submittedAt: '2026-11-01T14:20:00Z',
      choiceScore: 18,
      choiceTotal: 20,
      domains: [
        { categoryId: 'cat-1', number: 1, name: 'Dữ liệu và thông tin số', correct: [4, 4, 3], total: [4, 4, 3], suggestedLevel: 3 },
        { categoryId: 'cat-2', number: 2, name: 'Giao tiếp và hợp tác số', correct: [4, 4, 3], total: [4, 4, 3], suggestedLevel: 3 },
        { categoryId: 'cat-3', number: 3, name: 'Sáng tạo nội dung số', correct: [4, 3, 2], total: [4, 4, 3], suggestedLevel: 2 },
        { categoryId: 'cat-4', number: 4, name: 'An toàn và an ninh mạng', correct: [3, 3, 2], total: [4, 4, 3], suggestedLevel: 2 },
        { categoryId: 'cat-5', number: 5, name: 'Giải quyết vấn đề trong môi trường số', correct: [4, 3, 2], total: [4, 4, 3], suggestedLevel: 2 },
      ],
      essays: [
        {
          tier: 1,
          title: 'Khái niệm & Thực hành tìm kiếm dữ liệu',
          prompt: 'Mô tả phương pháp tìm kiếm và đánh giá độ tin cậy của thông tin.',
          text: 'Tìm kiếm dữ liệu dựa trên từ khóa Boolean, đối chiếu các nguồn dữ liệu từ cơ quan thống kê chính thức và các báo cáo ngành quốc tế có kiểm toán.',
          score: null,
        },
        {
          tier: 2,
          title: 'Thiết kế quy trình phân tích và chia sẻ dữ liệu',
          prompt: 'Xây dựng quy trình chia sẻ tài liệu nội bộ đảm bảo bảo mật.',
          text: 'Áp dụng Power BI Workspace phân quyền người xem theo đơn vị kinh doanh, dữ liệu doanh thu được làm mờ (data masking) đối với người dùng không thuộc ban giám đốc.',
          score: null,
        },
        {
          tier: 3,
          title: 'Xử lý sự cố an toàn thông tin và giải pháp tối ưu hóa',
          prompt: 'Đề xuất giải pháp khắc phục khi xảy ra sự cố bảo mật.',
          text: 'Báo cáo ngay cho Đội phản ứng sự cố thông tin (CERT), cô lập phân vùng dữ liệu bị ảnh hưởng và thực hiện trích xuất log phân tích.',
          score: null,
        },
      ],
      choiceItems: [],
      recording: null,
    },
    {
      assessmentId: 'asm-long-03',
      employeeId: 'emp-long',
      fullName: 'Lê Hoàng Long',
      departmentName: 'Dữ liệu & Phân tích',
      positionName: 'Kỹ sư Dữ liệu (Data Engineer)',
      submittedAt: '2026-10-31T16:45:00Z',
      reviewedAt: '2026-11-01T08:30:00Z',
      reviewNote: 'Bài làm rất tốt, am hiểu sâu sắc về kiến trúc dữ liệu và an toàn thông tin.',
      choiceScore: 19,
      choiceTotal: 20,
      domains: [
        { categoryId: 'cat-1', number: 1, name: 'Dữ liệu và thông tin số', correct: [4, 4, 3], total: [4, 4, 3], suggestedLevel: 3, mentorLevel: 3 },
        { categoryId: 'cat-2', number: 2, name: 'Giao tiếp và hợp tác số', correct: [4, 4, 3], total: [4, 4, 3], suggestedLevel: 3, mentorLevel: 3 },
        { categoryId: 'cat-3', number: 3, name: 'Sáng tạo nội dung số', correct: [4, 4, 3], total: [4, 4, 3], suggestedLevel: 3, mentorLevel: 3 },
        { categoryId: 'cat-4', number: 4, name: 'An toàn và an ninh mạng', correct: [4, 4, 3], total: [4, 4, 3], suggestedLevel: 3, mentorLevel: 3 },
        { categoryId: 'cat-5', number: 5, name: 'Giải quyết vấn đề trong môi trường số', correct: [4, 4, 3], total: [4, 4, 3], suggestedLevel: 3, mentorLevel: 3 },
      ],
      essays: [
        { tier: 1, title: 'Khái niệm & Thực hành tìm kiếm dữ liệu', prompt: 'Prompt 1', text: 'Nội dung chi tiết...', score: 9 },
        { tier: 2, title: 'Thiết kế quy trình phân tích và chia sẻ dữ liệu', prompt: 'Prompt 2', text: 'Nội dung chi tiết...', score: 10 },
        { tier: 3, title: 'Xử lý sự cố an toàn thông tin và giải pháp tối ưu hóa', prompt: 'Prompt 3', text: 'Nội dung chi tiết...', score: 9 },
      ],
      choiceItems: [],
      recording: null,
    },
    {
      assessmentId: 'asm-bao-04',
      employeeId: 'emp-bao',
      fullName: 'Phạm Quốc Bảo',
      departmentName: 'Kỹ thuật Công nghệ',
      positionName: 'Lập trình viên Backend',
      submittedAt: '2026-11-01T18:00:00Z',
      choiceScore: 14,
      choiceTotal: 20,
      domains: [
        { categoryId: 'cat-1', number: 1, name: 'Dữ liệu và thông tin số', correct: [3, 2, 1], total: [4, 4, 3], suggestedLevel: 1 },
        { categoryId: 'cat-2', number: 2, name: 'Giao tiếp và hợp tác số', correct: [3, 3, 2], total: [4, 4, 3], suggestedLevel: 2 },
        { categoryId: 'cat-3', number: 3, name: 'Sáng tạo nội dung số', correct: [2, 2, 1], total: [4, 4, 3], suggestedLevel: 1 },
        { categoryId: 'cat-4', number: 4, name: 'An toàn và an ninh mạng', correct: [3, 3, 2], total: [4, 4, 3], suggestedLevel: 2 },
        { categoryId: 'cat-5', number: 5, name: 'Giải quyết vấn đề trong môi trường số', correct: [2, 1, 0], total: [4, 4, 3], suggestedLevel: 0 },
      ],
      essays: [
        { tier: 1, title: 'Khái niệm & Thực hành tìm kiếm dữ liệu', prompt: 'Prompt 1', text: 'Sử dụng Google search với cú pháp site: và filetype:...', score: null },
        { tier: 2, title: 'Thiết kế quy trình phân tích và chia sẻ dữ liệu', prompt: 'Prompt 2', text: 'Dùng Google Drive và đặt link chế độ Anyone with link can view...', score: null },
        { tier: 3, title: 'Xử lý sự cố an toàn thông tin và giải pháp tối ưu hóa', prompt: 'Prompt 3', text: 'Đổi mật khẩu tài khoản và xóa commit gần nhất.', score: null },
      ],
      choiceItems: [],
      recording: null,
    },
  ],
};

const MOCK_PULSE_FINAL_QUEUE: PulseFinalReviewQueue = {
  pendingCount: 2,
  preAssessmentCount: 1,
  retryCount: 0,
  deadlineMissedCount: 0,
  flaggedCount: 1,
  criteria: [
    { number: '01', title: 'Tính đúng đắn & Tuân thủ quy định', description: 'Đảm bảo độ chính xác kỹ thuật và đáp ứng yêu cầu chuyên môn' },
    { number: '02', title: 'Phương pháp phân tích & Giải quyết vấn đề', description: 'Có phương pháp đo lường, cấu trúc giải pháp mạch lạc' },
    { number: '03', title: 'Khả năng ứng dụng vào thực tế doanh nghiệp', description: 'Minh chứng đã tích hợp hoặc ứng dụng vào luồng làm việc thực tế' },
  ],
  items: [
    {
      kind: 'FINAL',
      submissionId: 'sub-001',
      status: 'PENDING',
      employeeId: 'emp-an',
      employeeName: 'Nguyễn Văn An',
      organizationName: 'DigiTalent AI Enterprise',
      departmentName: 'Kỹ thuật Công nghệ',
      positionName: 'Trưởng nhóm Phát triển Frontend',
      courseId: 'crs-d1-basic',
      courseCode: 'D1-101',
      courseTitle: 'Khai thác & Xử lý Dữ liệu Số Cơ bản',
      domainName: 'Dữ liệu và thông tin số',
      tier: 1,
      attemptNo: 1,
      maxAttempts: 2,
      attempts: [
        {
          submissionId: 'sub-001',
          attemptNo: 1,
          submittedAt: '2026-11-01T15:30:00Z',
          evidenceText: 'Em đã xây dựng dashboard quản trị theo dõi chỉ số tải trang và phân tích nguồn dữ liệu truy cập người dùng theo đúng yêu cầu đề bài. Báo cáo kèm theo phân tích xu hướng và đề xuất phương án cải thiện.',
          choice: { score: 18, total: 20, passed: true, passMark: 14 },
        },
      ],
      aiHint: {
        checks: [true, true, true],
        summary: 'Học viên đạt 18/20 câu trắc nghiệm. Báo cáo thực hành chi tiết, đính kèm đầy đủ minh chứng dashboard và phương pháp đo lường khoa học.',
      },
    },
    {
      kind: 'PRE_ASSESSMENT',
      submissionId: 'sub-pre-002',
      status: 'PENDING',
      employeeId: 'emp-mai',
      employeeName: 'Trần Thị Mai',
      organizationName: 'Tập đoàn Công nghệ VinTech Solutions',
      departmentName: 'Dữ liệu & Phân tích',
      positionName: 'Chuyên viên Phân tích Nghiệp vụ (BA)',
      courseId: 'crs-d4-sec',
      courseCode: 'D4-201',
      courseTitle: 'An toàn Thông tin & Bảo vệ Dữ liệu Doanh nghiệp',
      domainName: 'An toàn và an ninh mạng',
      tier: 2,
      attemptNo: 1,
      maxAttempts: 1,
      attempts: [
        {
          submissionId: 'sub-pre-002',
          attemptNo: 1,
          submittedAt: '2026-11-02T08:45:00Z',
          evidenceText: 'Bài đánh giá trước khóa học: đề xuất chính sách phân loại dữ liệu và kế hoạch ứng phó sự cố rò rỉ thông tin cá nhân khách hàng.',
          choice: { score: 19, total: 20, passed: true, passMark: 14 },
        },
      ],
      aiHint: {
        checks: [true, true, true],
        summary: 'Thí sinh đạt 19/20 điểm trắc nghiệm và phương án ứng phó đạt tiêu chuẩn chuyên nghiệp. Khuyến nghị công nhận đạt chuẩn để miễn học phần cơ bản.',
      },
    },
    {
      kind: 'FINAL',
      submissionId: 'sub-003',
      status: 'FLAGGED',
      employeeId: 'emp-bao',
      employeeName: 'Phạm Quốc Bảo',
      organizationName: 'DigiTalent AI Enterprise',
      departmentName: 'Kỹ thuật Công nghệ',
      positionName: 'Lập trình viên Backend',
      courseId: 'crs-d2-collab',
      courseCode: 'D2-101',
      courseTitle: 'Giao tiếp & Hợp tác Số Nâng cao',
      domainName: 'Giao tiếp và hợp tác số',
      tier: 2,
      attemptNo: 2,
      maxAttempts: 2,
      attempts: [
        {
          submissionId: 'sub-003-1',
          attemptNo: 1,
          submittedAt: '2026-10-25T11:00:00Z',
          evidenceText: 'Lần 1: Bài nộp thiếu phần quy trình phản hồi sự cố giữa các team.',
          choice: { score: 12, total: 20, passed: false, passMark: 14 },
        },
        {
          submissionId: 'sub-003-2',
          attemptNo: 2,
          submittedAt: '2026-10-30T17:00:00Z',
          evidenceText: 'Lần 2: Đã bổ sung tài liệu quy trình nhưng chưa có minh chứng áp dụng thực tế vào công cụ Git/Jira của doanh nghiệp.',
          choice: { score: 13, total: 20, passed: false, passMark: 14 },
        },
      ],
      aiHint: {
        checks: [false, true, false],
        summary: 'Hai lần nộp chưa đạt chuẩn yêu cầu thực hành. Cần kích hoạt quy trình kèm cặp 1-1 từ mentor hoặc thiết lập chu kỳ học bổ trợ.',
      },
    },
  ],
};

// Register Mock Routes for Mentor
route('GET', '/mentor/trials', () => ({ items: MOCK_TRIALS }), { roles: ['MENTOR', 'PLATFORM_ADMIN'] });

route('GET', '/mentor/trials/:organizationId', (ctx) => {
  const { organizationId } = ctx.params;
  if (organizationId === 'org-vintech') {
    return {
      ...ACME_TRIAL_DATA,
      organizationId: 'org-vintech',
      organizationName: 'Tập đoàn Công nghệ VinTech Solutions',
      participants: ACME_TRIAL_DATA.participants.slice(0, 3),
      assessments: ACME_TRIAL_DATA.assessments.slice(0, 2),
    };
  }
  return ACME_TRIAL_DATA;
}, { roles: ['MENTOR', 'PLATFORM_ADMIN'] });

route('PUT', '/mentor/trials/:organizationId/assessments/:assessmentId', (ctx) => {
  const { assessmentId } = ctx.params;
  const input = ctx.body as { levels: { categoryId: string; level: number }[]; essayScores: number[]; note?: string };
  const target = ACME_TRIAL_DATA.assessments.find((a) => a.assessmentId === assessmentId);
  if (target) {
    target.reviewedAt = new Date().toISOString();
    target.reviewNote = input.note ?? null;
    target.essays.forEach((e, i) => {
      e.score = input.essayScores[i] ?? e.score;
    });
    target.domains.forEach((d) => {
      const match = input.levels.find((l) => l.categoryId === d.categoryId);
      if (match) d.mentorLevel = match.level;
    });
  }
  return { success: true };
}, { roles: ['MENTOR', 'PLATFORM_ADMIN'] });

route('POST', '/mentor/trials/:organizationId/assessments/:assessmentId/ai-review', () => {
  const review: TrialEssayAiReview = {
    model: 'gemini-1.5-pro',
    reviewedAt: new Date().toISOString(),
    summary: 'AI đã phân tích nội dung tự luận: các câu trả lời đáp ứng tốt yêu cầu thực tế của đề bài.',
    essays: [
      { tier: 1, score: 8, passed: true, feedback: 'Ý tưởng rõ ràng, phương pháp kiểm tra nguồn đáng tin cậy.' },
      { tier: 2, score: 8, passed: true, feedback: 'Phân quyền mạch lạc, tuân thủ nguyên tắc bảo mật thông tin.' },
      { tier: 3, score: 9, passed: true, feedback: 'Quy trình xử lý sự cố chuẩn mực và có giải pháp ngăn chặn lặp lại.' },
    ],
  };
  return review;
}, { roles: ['MENTOR', 'PLATFORM_ADMIN'] });

route('POST', '/mentor/trials/:organizationId/publish', (ctx) => {
  const { organizationId } = ctx.params;
  const trial = MOCK_TRIALS.find((t) => t.organizationId === organizationId);
  if (trial) {
    trial.stage = 'REPORTED';
    trial.reportPublishedAt = new Date().toISOString();
  }
  ACME_TRIAL_DATA.stage = 'REPORTED';
  ACME_TRIAL_DATA.reportPublishedAt = new Date().toISOString();
  return { success: true };
}, { roles: ['MENTOR', 'PLATFORM_ADMIN'] });

route('GET', '/pulse/final-reviews', () => MOCK_PULSE_FINAL_QUEUE, { roles: ['MENTOR', 'PLATFORM_ADMIN', 'MANAGER'] });

route('POST', '/pulse/final-reviews/:submissionId/decision', (ctx) => {
  const { submissionId } = ctx.params;
  const { decision } = ctx.body as { decision: string; reason?: string };
  const item = MOCK_PULSE_FINAL_QUEUE.items.find((i) => i.submissionId === submissionId);
  if (item) {
    item.status = decision === 'APPROVE' ? 'RETRY_WAIT' : 'FLAGGED';
  }
  return {
    submissionId,
    decision,
    status: decision === 'APPROVE' ? 'APPROVED' : 'FLAGGED',
    enrollmentStatus: 'COMPLETED',
  };
}, { roles: ['MENTOR', 'PLATFORM_ADMIN', 'MANAGER'] });
