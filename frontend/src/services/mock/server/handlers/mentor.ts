import { route } from '../router';
import type { PlatformTrialItem, MentorTrial, TrialEssayAiReview } from '../../../trial-program.service';
import type { PulseDecision, PulseFinalReviewItem, PulseFinalReviewQueue, PulseSupportAction } from '../../../pulse.service';

const MOCK_TRIALS: PlatformTrialItem[] = [
  {
    organizationId: 'org-acme',
    organizationName: 'DigiTalent AI Enterprise',
    stage: 'ASSIGNED',
    testDeadline: '2026-11-08T23:59:59Z',
    preferredReviewAt: '2026-11-05T14:00:00Z',
    requestNote: 'Đề nghị mentor hỗ trợ đánh giá kỹ phần phân tích dữ liệu số và an toàn thông tin.',
    requestedAt: '2026-10-28T09:00:00Z',
    mentorUserId: 'mock-mentor',
    mentorName: 'Mentor DigiTalent',
    ownerName: 'Nguyễn Văn Chủ',
    ownerEmail: 'owner@digitalent.ai',
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
    requestNote: 'Đội ngũ chuyển đổi số khối vận hành, cần hoàn tất báo cáo năng lực trước phiên họp tuần sau.',
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
    requestNote: 'Đánh giá năng lực số cho đội ngũ giảng viên và nhân sự nội dung.',
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
  requestNote: 'Đề nghị mentor hỗ trợ đánh giá kỹ phần phân tích dữ liệu số và an toàn thông tin.',
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
          text: 'Tôi áp dụng quy trình xác minh 3 bước: kiểm tra nguồn tài liệu chính thức, đối chiếu phản hồi kỹ thuật và thử nghiệm trên môi trường kiểm thử.',
          score: null,
        },
        {
          tier: 2,
          title: 'Thiết kế quy trình phân tích và chia sẻ dữ liệu',
          prompt: 'Xây dựng quy trình chia sẻ tài liệu và dữ liệu nội bộ giữa các phòng ban đảm bảo tính toàn vẹn và bảo mật.',
          text: 'Thiết lập phân quyền RBAC trên đám mây nội bộ, mã hóa dữ liệu nhạy cảm khi lưu trữ và truyền tải, rà soát phân quyền định kỳ 6 tháng.',
          score: null,
        },
        {
          tier: 3,
          title: 'Xử lý sự cố an toàn thông tin và giải pháp tối ưu hóa',
          prompt: 'Đề xuất giải pháp khi phát hiện một lỗ hổng rò rỉ khóa API hoặc token trong kho mã nguồn công khai.',
          text: 'Thu hồi khóa bí mật ngay, rà soát log truy cập trong 72 giờ, làm sạch lịch sử Git và cấu hình pre-commit hook chặn lộ khóa.',
          score: null,
        },
      ],
      aiReview: {
        model: 'gemini-1.5-pro',
        reviewedAt: '2026-11-01T10:18:00Z',
        summary: 'Bài làm trình bày rõ quy trình kiểm chứng, phân quyền dữ liệu và xử lý sự cố lộ khóa API theo đúng chuẩn.',
        essays: [
          { tier: 1, score: 8, passed: true, feedback: 'Quy trình kiểm tra nguồn rõ ràng và áp dụng được.' },
          { tier: 2, score: 8, passed: true, feedback: 'Nêu rõ RBAC, mã hóa dữ liệu và chu kỳ rà soát.' },
          { tier: 3, score: 9, passed: true, feedback: 'Thứ tự xử lý sự cố chính xác: thu hồi trước, lọc lịch sử Git và cấu hình hook.' },
        ],
      },
      choiceItems: [
        { number: 1, question: 'Để kiểm tra tính xác thực của trang web ngân hàng, người dùng nên chú ý yếu tố nào?', selected: 'Kiểm tra chứng chỉ SSL/TLS hợp lệ và tên miền chính xác', correct: 'Kiểm tra chứng chỉ SSL/TLS hợp lệ và tên miền chính xác', isCorrect: true },
        { number: 2, question: 'Quy tắc sao lưu dữ liệu 3-2-1 có ý nghĩa gì?', selected: '3 bản sao, 2 loại phương tiện lưu trữ, 1 bản lưu ngoài vị trí chính', correct: '3 bản sao, 2 loại phương tiện lưu trữ, 1 bản lưu ngoài vị trí chính', isCorrect: true },
        { number: 3, question: 'Tấn công Phishing thường giả mạo yếu tố nào?', selected: 'Tổ chức uy tín để đánh cắp thông tin đăng nhập hoặc dữ liệu nhạy cảm', correct: 'Tổ chức uy tín để đánh cắp thông tin đăng nhập hoặc dữ liệu nhạy cảm', isCorrect: true },
        { number: 4, question: 'Quyền riêng tư dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP yêu cầu gì?', selected: 'Chỉ chia sẻ dữ liệu khi được bên thứ ba trả phí', correct: 'Có sự đồng thuận rõ ràng của chủ thể dữ liệu trước khi xử lý', isCorrect: false },
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
        { tier: 1, title: 'Khái niệm & Thực hành tìm kiếm dữ liệu', prompt: 'Mô tả phương pháp tìm kiếm và đánh giá độ tin cậy của thông tin.', text: 'Dùng toán tử tìm kiếm, đối chiếu nguồn cơ quan thống kê và báo cáo có kiểm toán.', score: null },
        { tier: 2, title: 'Thiết kế quy trình phân tích và chia sẻ dữ liệu', prompt: 'Xây dựng quy trình chia sẻ tài liệu nội bộ đảm bảo bảo mật.', text: 'Áp dụng Power BI Workspace phân quyền theo đơn vị, che dữ liệu nhạy cảm với nhóm không liên quan.', score: null },
        { tier: 3, title: 'Xử lý sự cố an toàn thông tin và giải pháp tối ưu hóa', prompt: 'Đề xuất giải pháp khắc phục khi xảy ra sự cố bảo mật.', text: 'Báo ngay đội ứng cứu sự cố, cô lập phân vùng ảnh hưởng và trích xuất nhật ký.', score: null },
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
      reviewNote: 'Bài làm nắm chắc kiến trúc dữ liệu và an toàn thông tin.',
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
        { tier: 1, title: 'Khái niệm & Thực hành tìm kiếm dữ liệu', prompt: 'Prompt 1', text: 'Nội dung đạt yêu cầu.', score: 9 },
        { tier: 2, title: 'Thiết kế quy trình phân tích và chia sẻ dữ liệu', prompt: 'Prompt 2', text: 'Nội dung đạt yêu cầu.', score: 10 },
        { tier: 3, title: 'Xử lý sự cố an toàn thông tin và giải pháp tối ưu hóa', prompt: 'Prompt 3', text: 'Nội dung đạt yêu cầu.', score: 9 },
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
        { tier: 1, title: 'Khái niệm & Thực hành tìm kiếm dữ liệu', prompt: 'Prompt 1', text: 'Tìm kiếm theo cú pháp site: và filetype:...', score: null },
        { tier: 2, title: 'Thiết kế quy trình phân tích và chia sẻ dữ liệu', prompt: 'Prompt 2', text: 'Chia sẻ liên kết nội bộ giới hạn email công ty...', score: null },
        { tier: 3, title: 'Xử lý sự cố an toàn thông tin và giải pháp tối ưu hóa', prompt: 'Prompt 3', text: 'Đổi mật khẩu tài khoản và thu hồi token cũ.', score: null },
      ],
      choiceItems: [],
      recording: null,
    },
  ],
};

const CRITERIA = [
  { number: '01', title: 'Nguồn có thể truy vết', description: 'Xác định được nguồn hoặc bối cảnh của công việc.' },
  { number: '02', title: 'Hành động có thể kiểm tra', description: 'Người khác kiểm tra lại được thao tác hoặc phép tính.' },
  { number: '03', title: 'Kết luận có căn cứ', description: 'Kết luận và bước tiếp theo dựa trên minh chứng.' },
];

const MOCK_ITEMS: PulseFinalReviewItem[] = [
  {
    kind: 'FINAL',
    submissionId: 'sub-001',
    status: 'PENDING',
    employeeId: 'emp-an',
    employeeName: 'Nguyễn Văn An',
    organizationName: 'Công ty Cổ phần Thương mại Sao Việt',
    departmentName: 'Kỹ thuật Công nghệ',
    positionName: 'Trưởng nhóm Phát triển Frontend',
    courseId: 'crs-m1-f',
    courseCode: 'M1-F',
    courseTitle: 'Tìm kiếm và lưu trữ thông tin cơ bản',
    domainName: 'Khai thác dữ liệu và thông tin',
    tier: 1,
    attemptNo: 1,
    maxAttempts: 2,
    assignment: {
      title: 'Bài tập thực hành cấp Cơ bản: Đối chiếu nguồn dữ liệu bán hàng',
      promptHtml:
        '<p>Trích xuất báo cáo doanh thu tuần từ hệ thống bán hàng, đối chiếu với file sổ cái phòng kế toán và nêu bước xử lý phần chênh lệch.</p>',
      criteria: [
        'Đính kèm đủ đường dẫn hoặc tên hai tệp dữ liệu nguồn.',
        'Ghi rõ công thức hoặc bước đối chiếu hai bảng số liệu.',
        'Đề xuất bước xác minh tiếp theo với phòng kế toán.',
      ],
    },
    attempts: [
      {
        submissionId: 'sub-001',
        attemptNo: 1,
        submittedAt: '2026-11-01T15:30:00Z',
        evidenceText:
          'Nguồn: Bảng xuất doanh thu POS tuần 44 (pos_w44.xlsx) và Sổ cái tháng 10 (socai_t10.xlsx). Tôi đối chiếu cột Mã đơn bằng VLOOKUP và phát hiện 3 đơn chưa ghi nhận do đồng bộ trễ lúc 23:55 ngày 31/10. Kết luận: cập nhật lại đồng bộ chốt ngày và gửi biên bản cho kế toán trưởng duyệt.',
        choice: {
          score: 9,
          total: 10,
          passed: true,
          passMark: 7,
          items: [
            { number: 1, question: 'Bước đầu tiên khi kiểm tra chênh lệch số liệu là gì?', selected: 'Đối chiếu trực tiếp từ nguồn dữ liệu gốc', correct: 'Đối chiếu trực tiếp từ nguồn dữ liệu gốc', isCorrect: true },
            { number: 2, question: 'Quy tắc đặt tên phiên bản tài liệu nào giúp dễ truy vết?', selected: 'Tên tài liệu + ngày tạo + số phiên bản', correct: 'Tên tài liệu + ngày tạo + số phiên bản', isCorrect: true },
            { number: 3, question: 'Khi hai báo cáo khác tổng số, cần làm gì trước tiên?', selected: 'Tìm dòng giao dịch sai lệch ở file gốc', correct: 'Tìm dòng giao dịch sai lệch ở file gốc', isCorrect: true },
          ],
        },
      },
    ],
    aiHint: {
      checks: [true, true, true],
      summary: 'Bài nộp nêu rõ hai tệp nguồn, cách đối chiếu bằng VLOOKUP và hành động chốt ngày đồng bộ.',
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
    courseId: 'crs-m4-i',
    courseCode: 'M4-I',
    courseTitle: 'An toàn thông tin trong công việc',
    domainName: 'An toàn',
    tier: 2,
    attemptNo: 1,
    maxAttempts: 1,
    attempts: [
      {
        submissionId: 'sub-pre-002',
        attemptNo: 1,
        submittedAt: '2026-11-02T08:45:00Z',
        evidenceText:
          'Nguồn: Quy trình phân loại dữ liệu khách hàng V2. Khi chia sẻ báo cáo có email và số điện thoại, tôi ẩn 4 ký tự giữa bằng hàm masking, thiết lập quyền chỉ xem cho nhóm trưởng trên thư mục SharePoint nội bộ và đặt hạn chia sẻ 7 ngày.',
        choice: { score: 9, total: 10, passed: true, passMark: 7 },
      },
    ],
    aiHint: {
      checks: [true, true, true],
      summary: 'Đạt 9/10 câu trắc nghiệm và mô tả rõ biện pháp che dữ liệu, giới hạn quyền truy cập.',
    },
  },
  {
    kind: 'FINAL',
    submissionId: 'sub-004',
    status: 'PENDING',
    employeeId: 'emp-linh',
    employeeName: 'Hoàng Ngọc Linh',
    organizationName: 'DigiTalent AI Enterprise',
    departmentName: 'Marketing & Truyền thông',
    positionName: 'Chuyên viên Nội dung Số',
    courseId: 'crs-m6-a',
    courseCode: 'M6-A',
    courseTitle: 'Ứng dụng AI nâng cao',
    domainName: 'Ứng dụng trí tuệ nhân tạo',
    tier: 3,
    attemptNo: 1,
    maxAttempts: 2,
    attempts: [
      {
        submissionId: 'sub-004',
        attemptNo: 1,
        submittedAt: '2026-11-03T10:15:00Z',
        evidenceText:
          'Nguồn: Bản ghi câu lệnh kiểm chứng tài liệu kỹ thuật Q4. Tôi yêu cầu mô hình trích dẫn đúng số bảng trong tài liệu gốc, phát hiện 1 số liệu không có trong nguồn nên đã loại bỏ trước khi bàn giao.',
        choice: { score: 8, total: 10, passed: true, passMark: 7 },
      },
    ],
    aiHint: {
      checks: [true, true, true],
      summary: 'Nêu rõ bước kiểm chứng thông tin do AI sinh so với tài liệu gốc trước khi bàn giao.',
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
    courseId: 'crs-m2-i',
    courseCode: 'M2-I',
    courseTitle: 'Giao tiếp và cộng tác chuyên nghiệp',
    domainName: 'Giao tiếp và hợp tác trong môi trường số',
    tier: 2,
    attemptNo: 2,
    maxAttempts: 2,
    attempts: [
      {
        submissionId: 'sub-003-1',
        attemptNo: 1,
        submittedAt: '2026-10-25T11:00:00Z',
        evidenceText: 'Lần 1: Gửi tin nhắn thông báo chung trên nhóm chat sau khi deploy lỗi.',
        decision: 'NOT_YET',
        decisionReason: 'Thiếu đầu mối xác nhận xử lý và biên bản tổng hợp nguyên nhân.',
        reviewerName: 'Mentor DigiTalent',
        reviewedAt: '2026-10-26T09:00:00Z',
        choice: { score: 6, total: 10, passed: false, passMark: 7 },
      },
      {
        submissionId: 'sub-003',
        attemptNo: 2,
        submittedAt: '2026-10-30T17:00:00Z',
        evidenceText: 'Lần 2: Đã thêm người phụ trách nhưng chưa nêu nguồn log lỗi và các bước phối hợp trên Jira.',
        decision: 'NOT_YET',
        decisionReason: 'Vẫn thiếu liên kết phiếu xử lý và kiểm chứng kết quả.',
        reviewerName: 'Mentor DigiTalent',
        reviewedAt: '2026-10-31T08:30:00Z',
        choice: { score: 6, total: 10, passed: false, passMark: 7 },
      },
    ],
    aiHint: {
      checks: [false, false, false],
      summary: 'Hai lần nộp liên tiếp chưa đạt điểm trắc nghiệm tối thiểu và thiếu minh chứng phối hợp cụ thể.',
    },
  },
  {
    kind: 'FINAL',
    submissionId: 'sub-005',
    status: 'APPROVED',
    employeeId: 'emp-nam',
    employeeName: 'Lê Hải Nam',
    organizationName: 'Công ty Cổ phần Thương mại Sao Việt',
    departmentName: 'Vận hành Hệ thống',
    positionName: 'Chuyên viên Kiểm thử',
    courseId: 'crs-m5-f',
    courseCode: 'M5-F',
    courseTitle: 'Xử lý sự cố và tự học công nghệ',
    domainName: 'Giải quyết vấn đề',
    tier: 1,
    attemptNo: 1,
    maxAttempts: 2,
    attempts: [
      {
        submissionId: 'sub-005',
        attemptNo: 1,
        submittedAt: '2026-10-28T14:00:00Z',
        evidenceText:
          'Nguồn: Nhật ký lỗi máy in hóa đơn ngày 27/10. Tôi tách riêng lỗi kết nối mạng nội bộ khỏi lỗi driver bằng cách ping IP máy chủ in, cài lại bản driver chuẩn 2.4 và kiểm thử in 5 hóa đơn liên tiếp thành công.',
        decision: 'PASSED',
        decisionReason: 'Khoanh vùng nguyên nhân chính xác, thử nghiệm và xác nhận đầu ra rõ ràng.',
        reviewerName: 'Mentor DigiTalent',
        reviewedAt: '2026-10-29T09:15:00Z',
        choice: { score: 10, total: 10, passed: true, passMark: 7 },
      },
    ],
    aiHint: {
      checks: [true, true, true],
      summary: 'Đạt cả phần trắc nghiệm và mô tả đúng phương pháp xử lý sự cố.',
    },
  },
];

function isReviewedStatus(status: PulseFinalReviewItem['status']) {
  return status === 'APPROVED' || status === 'NOT_YET';
}

function buildQueue(includeReviewed: boolean): PulseFinalReviewQueue {
  const items = includeReviewed ? MOCK_ITEMS : MOCK_ITEMS.filter((i) => !isReviewedStatus(i.status));
  return {
    pendingCount: items.filter((i) => i.status === 'PENDING').length,
    preAssessmentCount: items.filter((i) => i.kind === 'PRE_ASSESSMENT' && i.status === 'PENDING').length,
    retryCount: items.filter((i) => i.status === 'RETRY_WAIT' || i.status === 'RETRY_READY').length,
    deadlineMissedCount: items.filter((i) => i.status === 'DEADLINE_MISSED').length,
    flaggedCount: items.filter((i) => i.status === 'FLAGGED').length,
    reviewedCount: MOCK_ITEMS.filter((i) => isReviewedStatus(i.status)).length,
    criteria: CRITERIA,
    items,
  };
}

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
    summary: 'AI đã phân tích nội dung tự luận: các câu trả lời đáp ứng yêu cầu thực tế của đề bài.',
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

route('GET', '/pulse/final-reviews', (ctx) => {
  const raw = ctx.query?.includeReviewed;
  const includeReviewed = raw === 'true' || raw === '1';
  return buildQueue(includeReviewed);
}, { roles: ['MENTOR', 'PLATFORM_ADMIN', 'MANAGER'] });

route('POST', '/pulse/final-reviews/:submissionId/decision', (ctx) => {
  const { submissionId } = ctx.params;
  const { decision, reason } = ctx.body as { decision: PulseDecision; reason: string };
  const item = MOCK_ITEMS.find((i) => i.submissionId === submissionId && i.kind === 'FINAL');
  const now = new Date();
  let nextStatus: 'APPROVED' | 'RETRY_WAIT' | 'FLAGGED' = 'APPROVED';
  if (decision !== 'PASSED') {
    nextStatus = item && item.attemptNo >= item.maxAttempts ? 'FLAGGED' : 'RETRY_WAIT';
  }
  if (item) {
    item.status = nextStatus;
    const latest = item.attempts[item.attempts.length - 1];
    if (latest) {
      latest.decision = decision;
      latest.decisionReason = reason;
      latest.reviewerName = 'Mentor DigiTalent';
      latest.reviewedAt = now.toISOString();
      if (nextStatus === 'RETRY_WAIT') {
        latest.retryOpensAt = new Date(now.getTime() + 48 * 3600_000).toISOString();
        latest.retryDueAt = new Date(now.getTime() + 9 * 86400_000).toISOString();
      }
    }
  }
  return {
    submissionId,
    decision,
    status: nextStatus,
    enrollmentStatus: nextStatus === 'APPROVED' ? 'COMPLETED' : 'IN_PROGRESS',
    retryOpensAt: nextStatus === 'RETRY_WAIT' ? new Date(now.getTime() + 48 * 3600_000).toISOString() : null,
    retryDueAt: nextStatus === 'RETRY_WAIT' ? new Date(now.getTime() + 9 * 86400_000).toISOString() : null,
  };
}, { roles: ['MENTOR', 'PLATFORM_ADMIN', 'MANAGER'] });

route('POST', '/pulse/final-reviews/pre-assessments/:preAssessmentId/decision', (ctx) => {
  const { preAssessmentId } = ctx.params;
  const { decision, reason } = ctx.body as { decision: PulseDecision; reason: string };
  const item = MOCK_ITEMS.find((i) => i.submissionId === preAssessmentId && i.kind === 'PRE_ASSESSMENT');
  const now = new Date().toISOString();
  const nextStatus = decision === 'PASSED' ? 'APPROVED' : 'NOT_YET';
  if (item) {
    item.status = nextStatus;
    const latest = item.attempts[item.attempts.length - 1];
    if (latest) {
      latest.decision = decision;
      latest.decisionReason = reason;
      latest.reviewerName = 'Mentor DigiTalent';
      latest.reviewedAt = now;
    }
  }
  return {
    preAssessmentId,
    decision,
    status: decision === 'PASSED' ? 'PASSED' : 'NOT_YET',
    enrollmentId: 'mock-enr-1',
  };
}, { roles: ['MENTOR', 'PLATFORM_ADMIN', 'MANAGER'] });

route('POST', '/pulse/final-reviews/:submissionId/support', (ctx) => {
  const { submissionId } = ctx.params;
  const { action, note } = ctx.body as { action: PulseSupportAction; note?: string | null };
  const now = new Date().toISOString();
  const item = MOCK_ITEMS.find((i) => i.submissionId === submissionId);
  if (item) {
    const latest = item.attempts[item.attempts.length - 1];
    if (latest) {
      latest.supportAction = action;
      latest.supportNote = note ?? null;
      latest.supportRecordedAt = now;
    }
  }
  return {
    submissionId,
    action,
    recordedAt: now,
  };
}, { roles: ['MENTOR', 'PLATFORM_ADMIN', 'MANAGER'] });
