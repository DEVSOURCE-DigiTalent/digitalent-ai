import {
  REFERENCE_POSITIONS,
  summarizeRequirements,
  TT02_DOMAINS,
  type ReferencePosition,
} from '@/lib/reference-positions';

export interface TrialQuestion {
  id: string;
  domainNumber: number;
  domainName: string;
  text: string;
  options: string[];
  correctIndex: number;
}

/** A short orientation only. The paid workspace keeps the full 18-question entry assessment. */
export const TRIAL_QUESTIONS: TrialQuestion[] = [
  {
    id: 'trial-d1',
    domainNumber: 1,
    domainName: TT02_DOMAINS[0].name,
    text: 'Bạn cần dùng một số liệu thị trường trong báo cáo. Cách nào đáng tin cậy nhất?',
    options: ['Dùng kết quả đầu tiên trên mạng', 'Tìm nguồn gốc, thời điểm và phương pháp tạo số liệu', 'Dùng số được chia sẻ nhiều nhất'],
    correctIndex: 1,
  },
  {
    id: 'trial-d2',
    domainNumber: 2,
    domainName: TT02_DOMAINS[1].name,
    text: 'Một tài liệu nội bộ cần nhiều người góp ý nhưng chỉ một người phê duyệt. Bạn nên làm gì?',
    options: ['Gửi nhiều bản qua email', 'Chia sẻ một bản chung và phân quyền phù hợp', 'Cho mọi người quyền quản trị'],
    correctIndex: 1,
  },
  {
    id: 'trial-d3',
    domainNumber: 3,
    domainName: TT02_DOMAINS[2].name,
    text: 'Bạn muốn dùng một ảnh tìm thấy trên mạng cho bài đăng thương mại. Việc đầu tiên là gì?',
    options: ['Tải về vì ảnh ở chế độ công khai', 'Kiểm tra giấy phép và điều kiện ghi nguồn', 'Chỉnh màu để thành ảnh mới'],
    correctIndex: 1,
  },
  {
    id: 'trial-d4',
    domainNumber: 4,
    domainName: TT02_DOMAINS[3].name,
    text: 'Trước khi đưa tài liệu công việc vào một công cụ AI, bạn cần làm gì?',
    options: ['Tải toàn bộ để AI có đủ bối cảnh', 'Kiểm tra và loại bỏ dữ liệu nhạy cảm', 'Đổi tên tệp là đủ'],
    correctIndex: 1,
  },
  {
    id: 'trial-d5',
    domainNumber: 5,
    domainName: TT02_DOMAINS[4].name,
    text: 'Khi một công cụ số không tạo ra kết quả mong muốn, bước phù hợp nhất là gì?',
    options: ['Đổi công cụ ngay', 'Xác định lại nhu cầu, dữ liệu vào và tiêu chí kết quả', 'Lặp lại thao tác cũ nhiều lần'],
    correctIndex: 1,
  },
  {
    id: 'trial-d6',
    domainNumber: 6,
    domainName: TT02_DOMAINS[5].name,
    text: 'AI tạo ra một nội dung nghe hợp lý. Bạn nên xử lý thế nào trước khi sử dụng?',
    options: ['Dùng ngay vì nội dung mạch lạc', 'Đối chiếu sự kiện, nguồn và rủi ro trước khi duyệt', 'Chỉ sửa chính tả'],
    correctIndex: 1,
  },
];

export interface TrialTakeaway {
  type: 'checklist' | 'prompt';
  title: string;
  description: string;
  items: string[];
}

export interface TrialSlice {
  competencyCode: string;
  title: string;
  objective: string;
  lesson: string[];
  scenario: string;
  scenarioOptions: string[];
  scenarioCorrectIndex: number;
  scenarioFeedback: string;
  selfCheck: string;
  selfCheckOptions: string[];
  selfCheckCorrectIndex: number;
  takeaway: TrialTakeaway;
}

const SHARED_AI_LESSON = [
  'Trước khi dùng AI, hãy xác định dữ liệu nào thực sự cần thiết và loại bỏ tên, số điện thoại, mã khách hàng hoặc thông tin nội bộ không liên quan.',
  'Một yêu cầu tốt nêu rõ mục tiêu, đối tượng, giới hạn và định dạng đầu ra. Kết quả do AI tạo vẫn phải được con người kiểm tra trước khi sử dụng.',
];

export const TRIAL_SLICE_BY_POSITION: Record<string, TrialSlice> = {
  CEO: {
    competencyCode: '6.3',
    title: 'Đánh giá đề xuất do AI tạo trước khi ra quyết định',
    objective: 'Nhận diện dữ kiện cần kiểm chứng và rủi ro trước khi phê duyệt.',
    lesson: SHARED_AI_LESSON,
    scenario: 'Một bản tóm tắt do AI đề xuất cắt 20% chi phí nhưng không nêu nguồn số liệu. Bạn sẽ làm gì trước?',
    scenarioOptions: ['Phê duyệt thử ngay', 'Yêu cầu nguồn, giả định và phương án kiểm chứng', 'Chỉ sửa lại cách trình bày'],
    scenarioCorrectIndex: 1,
    scenarioFeedback: 'Quyết định có trách nhiệm cần truy được nguồn, giả định và cách kiểm chứng, không chỉ dựa vào nội dung nghe hợp lý.',
    selfCheck: 'Checklist nào cần xuất hiện trước khi duyệt đầu ra AI?',
    selfCheckOptions: ['Nguồn, giả định và rủi ro', 'Màu sắc và độ dài', 'Số lần AI viết lại'],
    selfCheckCorrectIndex: 0,
    takeaway: {
      type: 'checklist',
      title: 'Checklist 4 bước kiểm chứng đề xuất AI trước khi phê duyệt',
      description: 'Dùng để rà soát bất kỳ báo cáo hoặc đề xuất chiến lược nào do AI hỗ trợ tạo ra.',
      items: [
        'Nguồn dữ liệu gốc: Xác minh bộ dữ liệu đầu vào, niên độ và phương pháp thu thập.',
        'Giả định cốt lõi: Làm rõ các giả định ngầm AI đã sử dụng để tính toán.',
        'Kịch bản rủi ro: Đánh giá tác động pháp lý, tài chính nếu dữ liệu sai lệch.',
        'Phản biện con người: Tham vấn chuyên môn liên quan trước khi ra quyết định cuối cùng.',
      ],
    },
  },
  HR: {
    competencyCode: '4.2',
    title: 'Bảo vệ dữ liệu ứng viên khi sử dụng AI',
    objective: 'Biết tối thiểu hóa và ẩn danh dữ liệu trước khi đưa vào công cụ.',
    lesson: SHARED_AI_LESSON,
    scenario: 'Bạn cần nhờ AI tóm tắt 30 CV để tìm nhóm kỹ năng phổ biến. Cách xử lý phù hợp nhất là gì?',
    scenarioOptions: ['Tải nguyên CV lên công cụ', 'Ẩn danh dữ liệu rồi chỉ cung cấp phần kỹ năng cần phân tích', 'Đổi tên tệp CV trước khi tải'],
    scenarioCorrectIndex: 1,
    scenarioFeedback: 'Ẩn danh và tối thiểu hóa dữ liệu giúp bảo vệ dữ liệu ứng viên trong khi vẫn đáp ứng mục tiêu phân tích.',
    selfCheck: 'Bước đầu tiên trước khi đưa hồ sơ ứng viên vào công cụ là gì?',
    selfCheckOptions: ['Kiểm tra dữ liệu nhạy cảm', 'Viết prompt thật dài', 'Chuyển tệp sang PDF'],
    selfCheckCorrectIndex: 0,
    takeaway: {
      type: 'checklist',
      title: 'Checklist tối thiểu hóa và ẩn danh hồ sơ ứng viên trước khi dùng AI',
      description: 'Bảo vệ thông tin định danh cá nhân và tuân thủ quy định bảo mật dữ liệu nhân sự.',
      items: [
        'Loại bỏ thông tin định danh: Tên, số điện thoại, email, địa chỉ, ảnh đại diện.',
        'Loại bỏ dữ liệu nhạy cảm: Số căn cước, tình trạng gia đình, mức lương hiện tại.',
        'Chỉ giữ ngữ cảnh phân tích: Trích xuất danh sách kỹ năng, số năm kinh nghiệm và dự án.',
        'Kiểm soát kênh sử dụng: Thao tác trên công cụ có chính sách bảo mật nội bộ được duyệt.',
      ],
    },
  },
  MARKETING: {
    competencyCode: '3.3',
    title: 'Tạo nội dung có kiểm chứng và đúng quyền sử dụng',
    objective: 'Kiểm tra tuyên bố, nguồn và quyền sử dụng tài sản trước khi xuất bản.',
    lesson: SHARED_AI_LESSON,
    scenario: 'AI tạo bài quảng cáo có số liệu “9/10 khách hàng hài lòng” nhưng brief không có nghiên cứu này. Bạn làm gì?',
    scenarioOptions: ['Giữ lại vì số liệu thuyết phục', 'Bỏ hoặc thay bằng số liệu có nguồn kiểm chứng', 'Đổi 9/10 thành “đa số”'],
    scenarioCorrectIndex: 1,
    scenarioFeedback: 'Không nên phát hành tuyên bố không có căn cứ. Hãy dùng dữ liệu có nguồn hoặc diễn đạt trung thực, không gây hiểu nhầm.',
    selfCheck: 'Điều gì cần kiểm tra trước khi xuất bản nội dung AI?',
    selfCheckOptions: ['Nguồn và quyền sử dụng', 'Số lượng tính từ', 'AI tạo nhanh đến đâu'],
    selfCheckCorrectIndex: 0,
    takeaway: {
      type: 'checklist',
      title: 'Checklist kiểm chứng thông điệp và bản quyền nội dung AI',
      description: 'Đảm bảo tính trung thực của tuyên bố quảng cáo và quyền sở hữu tài sản truyền thông.',
      items: [
        'Kiểm chứng số liệu (Fact-check): Mọi số liệu tỷ lệ, khảo sát phải có trích dẫn nguồn công khai.',
        'Rà soát quyền tác giả: Kiểm tra điều khoản thương mại (Commercial License) của hình ảnh/video.',
        'Tính chân thực & Đạo đức: Không phóng đại công năng sản phẩm hoặc tạo hiểu lầm cho người tiêu dùng.',
        'Chữ ký trách nhiệm: Thành viên phụ trách trực tiếp duyệt bản hoàn chỉnh trước khi đăng tải.',
      ],
    },
  },
  SALES_CRM: {
    competencyCode: '4.2',
    title: 'Dùng dữ liệu CRM an toàn khi chuẩn bị trao đổi',
    objective: 'Chỉ sử dụng dữ liệu cần thiết và giữ đúng quyền truy cập.',
    lesson: SHARED_AI_LESSON,
    scenario: 'Bạn muốn AI soạn email chăm sóc từ dữ liệu CRM. Dữ liệu nào nên đưa vào?',
    scenarioOptions: ['Toàn bộ lịch sử và thông tin định danh', 'Chỉ bối cảnh cần thiết đã loại bỏ dữ liệu nhạy cảm', 'Xuất cả CRM rồi để AI tự chọn'],
    scenarioCorrectIndex: 1,
    scenarioFeedback: 'Chỉ cung cấp bối cảnh tối thiểu cần thiết, theo chính sách công cụ và quyền xử lý dữ liệu của tổ chức.',
    selfCheck: 'Nguyên tắc phù hợp khi dùng dữ liệu CRM là gì?',
    selfCheckOptions: ['Tối thiểu hóa dữ liệu', 'Sao chép toàn bộ để đủ ngữ cảnh', 'Chia sẻ quyền quản trị'],
    selfCheckCorrectIndex: 0,
    takeaway: {
      type: 'checklist',
      title: 'Nguyên tắc bảo mật dữ liệu CRM khi cá nhân hóa giao tiếp qua AI',
      description: 'Soạn thảo email và kịch bản chăm sóc khách hàng mà không làm lộ dữ liệu nội bộ.',
      items: [
        'Tối thiểu hóa ngữ cảnh: Chỉ đưa vào prompt nhu cầu và ngành nghề chung của khách hàng.',
        'Bảo mật số liệu nhạy cảm: Giữ kín số tài khoản, hạn mức tín dụng và doanh thu chi tiết.',
        'Tuân thủ phân quyền CRM: Không xuất toàn bộ tệp khách hàng ra máy tính cá nhân.',
        'Rà soát tính cá nhân hóa: Đọc lại nội dung thư trước khi gửi, đảm bảo giọng điệu phù hợp.',
      ],
    },
  },
  ACCOUNTANT: {
    competencyCode: '1.2',
    title: 'Kiểm chứng dữ liệu trước khi dùng trong báo cáo',
    objective: 'Truy nguồn và đối chiếu số liệu thay vì tin vào đầu ra tự động.',
    lesson: SHARED_AI_LESSON,
    scenario: 'AI tóm tắt rằng chi phí quý này giảm 12%, nhưng một bảng dữ liệu chưa cập nhật. Bạn làm gì?',
    scenarioOptions: ['Dùng con số AI đã tính', 'Đối chiếu dữ liệu nguồn và kỳ báo cáo trước khi kết luận', 'Làm tròn thành 10%'],
    scenarioCorrectIndex: 1,
    scenarioFeedback: 'Kết luận tài chính phải dựa trên nguồn dữ liệu đầy đủ, đúng kỳ và có thể truy vết.',
    selfCheck: 'Trước khi dùng một số liệu trong báo cáo, cần ưu tiên điều gì?',
    selfCheckOptions: ['Nguồn và kỳ dữ liệu', 'Cách trình bày biểu đồ', 'Độ dài câu giải thích'],
    selfCheckCorrectIndex: 0,
    takeaway: {
      type: 'checklist',
      title: 'Checklist đối chiếu số liệu tài chính trước khi đưa vào báo cáo',
      description: 'Quy trình kiểm chứng độc lập số liệu và phân tích do AI tổng hợp.',
      items: [
        'Xác nhận kỳ kế toán: Đảm bảo dữ liệu trích xuất cùng niên độ và sổ sách đã khóa sổ.',
        'Đối chiếu chứng từ gốc: So khớp các chỉ tiêu trọng yếu với báo cáo tài chính kiểm toán.',
        'Kiểm toán logic công thức: Kiểm tra tính đúng đắn của các phép tính tỷ trọng và tốc độ tăng trưởng.',
        'Lưu vết kiểm toán (Audit Trail): Lưu lại nguồn dữ liệu và prompt phục vụ công tác giải trình.',
      ],
    },
  },
};

export interface TrialPathItem {
  domainNumber: number;
  domainName: string;
  currentLevel: number;
  requiredLevel: number;
  unlockBenefit?: string;
}

export function trialPathFor(
  position: ReferencePosition,
  answers: Record<string, number>,
  diagnosticMode?: 'completed' | 'skipped' | null,
): TrialPathItem[] {
  const required = summarizeRequirements(position).domains;
  const trialDomain = Number(TRIAL_SLICE_BY_POSITION[position.code].competencyCode.split('.')[0]);
  const isSkipped = diagnosticMode === 'skipped';

  const items: TrialPathItem[] = required
    .filter((domain) => domain.highestLevel > 0)
    .map((domain) => {
      const question = TRIAL_QUESTIONS.find((item) => item.domainNumber === domain.number)!;
      const currentLevel = isSkipped
        ? 0
        : answers[question.id] === question.correctIndex
          ? 1
          : 0;
      return {
        domainNumber: domain.number,
        domainName: domain.name,
        currentLevel,
        requiredLevel: domain.highestLevel,
      };
    })
    .sort((a, b) => {
      if (a.domainNumber === trialDomain) return -1;
      if (b.domainNumber === trialDomain) return 1;
      return (b.requiredLevel - b.currentLevel) - (a.requiredLevel - a.currentLevel) || a.domainNumber - b.domainNumber;
    })
    .slice(0, 3);

  // Add specific value unlock benefits for locked items (Priority 2 & 3)
  if (items[1]) {
    items[1].unlockBenefit = 'Mở 4 bài học tiếp theo và bài thực hành theo vị trí';
  }
  if (items[2]) {
    items[2].unlockBenefit = 'Mở bài đánh giá đầy đủ để xác nhận khoảng trống này và theo dõi trong hồ sơ năng lực';
  }

  return items;
}

export const TRIAL_POSITIONS = REFERENCE_POSITIONS;
