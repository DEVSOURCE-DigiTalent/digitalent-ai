import { PLANS, plansFor } from '@/lib/plans';
import {
  SECTION_IDS,
  SERIF_ITALIC,
  type HeroFragments,
  type LandingContent,
  type LandingLink,
  type LandingSectionConfig,
  type TextSegment,
} from './landing-content';

/**
 * Copy and sample data of the business landing page ("/business", PUB-02).
 * Roles follow Role/Sidebar/Page Spec v2.1: only OWNER, MANAGER (optional) and EMPLOYEE face the customer.
 * Terms are frozen by the same spec: "Trình độ" for Cơ bản / Trung cấp / Nâng cao, "Cấp bậc" only for G1–G3,
 * "Bậc năng lực" only for TT02 tiers 1–8.
 */

export const BUSINESS_HERO_EYEBROW = {
  title: 'Nền tảng phát triển năng lực số cho doanh nghiệp',
};

export const BUSINESS_HERO_HEADLINE: TextSegment[] = [
  { text: 'Biết đội ngũ đang thiếu gì.' },
  { text: 'Phát triển đúng năng lực.', className: SERIF_ITALIC },
];

export const BUSINESS_HERO_LEDE =
  'Đánh giá, đào tạo và xác nhận năng lực bằng minh chứng công việc thực tế.';

export const BUSINESS_HERO_FRAGMENTS: HeroFragments = {
  caption: 'Dữ liệu minh họa',
  items: [
    { label: 'Yêu cầu vị trí', value: '12 năng lực' },
    { label: 'Khoảng trống', value: '4 ưu tiên' },
    { label: 'Minh chứng', value: 'Chờ đánh giá' },
  ],
};

export const BUSINESS_ABOUT: LandingContent['about'] = {
  label: 'Khung chuẩn năng lực số',
  title: [
    { text: 'Mỗi vị trí cần' },
    { text: 'một bộ năng lực số riêng.', className: SERIF_ITALIC },
    { text: 'Thước đo là Khung chuẩn năng lực số 6 miền cốt lõi.' },
  ],
  body:
    'Khung chuẩn năng lực số gồm 6 miền, 24 năng lực thành phần, xếp theo 8 bậc. DigiTalent AI dùng khung này làm thước đo; chương trình đào tạo triển khai 3 tầng: Cơ bản, Trung cấp và Nâng cao.',
  specsLabel: 'Khung chuẩn tham chiếu',
  specs: [
    { value: '6', label: 'miền năng lực, gồm cả ứng dụng AI' },
    { value: '24', label: 'năng lực thành phần' },
    { value: '8', label: 'bậc năng lực của khung' },
  ],
  configured: {
    label: 'Cấu hình của DigiTalent AI',
    specs: [{ value: '9–24', label: 'năng lực có thể cấu hình cho một vị trí' }],
  },
};

const BRIDGE: LandingSectionConfig = {
  kind: 'bridge',
  statement: 'Đào tạo xong chưa có nghĩa là đội ngũ đã có năng lực.',
  questions: [
    'Ai đang thiếu năng lực nào?',
    'Nên đào tạo ai, về nội dung gì?',
    'Sau đào tạo, bằng chứng nào cho thấy họ thực sự làm được?',
  ],
  closing: 'DigiTalent AI nối ba câu hỏi đó thành một vòng phát triển năng lực.',
};

const PILLARS: LandingSectionConfig = {
  kind: 'pillars',
  label: 'Ba trụ cột của sản phẩm',
  items: [
    { label: 'Yêu cầu năng lực theo vị trí', to: SECTION_IDS.process },
    { label: 'Khoảng trống năng lực đội ngũ', to: SECTION_IDS.teamGap },
    { label: 'Minh chứng và xác nhận', to: SECTION_IDS.evidence },
  ],
};

const WORKFLOW: LandingSectionConfig = {
  kind: 'workflow',
  intro: {
    label: 'Cách hoạt động',
    title: [{ text: 'Cách DigiTalent AI vận hành:' }, { text: 'một vòng phát triển năng lực.', className: SERIF_ITALIC }],
  },
  steps: [
    {
      label: 'Vị trí',
      title: 'Xác định yêu cầu theo vị trí',
      text: 'Chủ doanh nghiệp chọn năng lực và mức yêu cầu cho từng vị trí.',
      preview: 'requirements',
    },
    {
      label: 'Đánh giá',
      title: 'Đánh giá năng lực hiện tại',
      text: 'Mỗi nhân viên làm bài đánh giá theo đúng những năng lực mà vị trí của họ yêu cầu.',
      preview: 'assessment',
    },
    {
      label: 'Khoảng trống',
      title: 'Nhận diện khoảng trống năng lực',
      text: 'So trình độ hiện tại với trình độ yêu cầu, theo từng năng lực, từng nhân viên và từng nhóm.',
      preview: 'gap',
    },
    {
      label: 'Học tập',
      title: 'Giao đúng khóa học',
      text: 'Khóa học được đề xuất theo năng lực cần cải thiện. Chủ doanh nghiệp duyệt và phân công.',
      preview: 'assignment',
    },
    {
      label: 'Nhiệm vụ',
      title: 'Áp dụng qua nhiệm vụ thực tế',
      text: 'Nhân viên làm nhiệm vụ gắn với năng lực cần chứng minh và nộp minh chứng.',
      preview: 'task',
    },
    {
      label: 'Xác nhận',
      title: 'Review minh chứng và xác nhận năng lực',
      text: 'Chủ doanh nghiệp hoặc quản lý đánh giá minh chứng theo tiêu chí trước khi xác nhận năng lực.',
      preview: 'profile',
    },
  ],
};

const TEAM_GAP: LandingSectionConfig = {
  kind: 'team-gap',
  intro: {
    label: 'Khoảng trống năng lực đội ngũ',
    title: [{ text: 'Nhìn thấy đội ngũ thiếu gì,' }, { text: 'ngay trên một màn hình.', className: SERIF_ITALIC }],
    lead: 'Mỗi nhóm được so với yêu cầu của vị trí. Năng lực thiếu nhiều nhất nổi lên đầu, kèm gợi ý đào tạo.',
  },
  tabsLabel: 'Chọn phòng ban',
  samples: [
    {
      label: 'Marketing',
      department: 'Marketing',
      positionCode: 'MARKETING',
      headcount: 12,
      coverage: 72,
      rows: [
        { code: '6.1', current: 1, behind: 8 },
        { code: '4.1', current: 1, behind: 5 },
        { code: '1.1', current: 2, behind: 4 },
        { code: '2.1', current: 3, behind: 0 },
      ],
      radarCurrent: [2, 3, 2, 1, 2, 1],
      recommendLabel: 'Đề xuất đào tạo',
    },
    {
      label: 'Kế toán',
      department: 'Kế toán',
      positionCode: 'ACCOUNTANT',
      headcount: 8,
      coverage: 68,
      rows: [
        { code: '1.2', current: 1, behind: 4 },
        { code: '4.2', current: 2, behind: 3 },
        { code: '6.3', current: 1, behind: 2 },
        { code: '2.1', current: 2, behind: 0 },
      ],
      radarCurrent: [2, 2, 1, 2, 1, 1],
      recommendLabel: 'Đề xuất đào tạo',
    },
    {
      label: 'Kinh doanh (CRM)',
      department: 'Kinh doanh',
      positionCode: 'SALES_CRM',
      headcount: 15,
      coverage: 64,
      rows: [
        { code: '1.3', current: 1, behind: 6 },
        { code: '4.2', current: 2, behind: 4 },
        { code: '2.1', current: 2, behind: 5 },
        { code: '6.1', current: 2, behind: 0 },
      ],
      radarCurrent: [2, 2, 1, 2, 1, 2],
      recommendLabel: 'Đề xuất đào tạo',
    },
  ],
};

const EVIDENCE: LandingSectionConfig = {
  kind: 'evidence',
  intro: {
    label: 'Minh chứng và xác nhận',
    title: [{ text: 'Từ nhiệm vụ thực tế đến' }, { text: 'năng lực được xác nhận.', className: SERIF_ITALIC }],
    lead: 'Năng lực được xác nhận qua bài thực hành và minh chứng công việc đã được đánh giá.',
  },
  note: 'Chủ doanh nghiệp hoặc quản lý phụ trách đánh giá và xác nhận minh chứng.',
  sample: {
    competencyCode: '4.2',
    positionCode: 'MARKETING',
    levelChange: { from: 1, to: 2 },
    task: 'Lập quy trình xử lý dữ liệu khách hàng cho bộ phận Marketing',
    criteria: [
      'Nêu đủ các loại dữ liệu cá nhân được xử lý',
      'Có bước xin sự đồng ý của chủ thể dữ liệu',
      'Quy định ai được truy cập và trong bao lâu',
    ],
    feedback: 'Quy trình rõ ràng và áp dụng được ngay. Đạt cả ba tiêu chí.',
    stages: ['Nhiệm vụ', 'Đã nộp', 'Đang đánh giá', 'Đạt tiêu chí', 'Đã xác nhận năng lực'],
  },
};

const ROLES: LandingSectionConfig = {
  kind: 'roles',
  intro: {
    label: 'Ai dùng',
    title: [{ text: 'Ai vận hành DigiTalent AI' }, { text: 'trong công ty bạn?', className: SERIF_ITALIC }],
  },
  personas: [
    {
      role: 'Chủ doanh nghiệp',
      badge: 'CHỦ DOANH NGHIỆP',
      points: [
        'Nhìn toàn bộ năng lực của đội ngũ',
        'Thiết lập phòng ban, vị trí và yêu cầu năng lực',
        'Triển khai đào tạo và quản lý gói dịch vụ',
      ],
    },
    {
      role: 'Quản lý',
      badge: 'QUẢN LÝ · TÙY CHỌN',
      points: ['Theo dõi đội ngũ', 'Giao nhiệm vụ thực tế', 'Đánh giá minh chứng'],
      note: 'Doanh nghiệp nhỏ có thể để chủ doanh nghiệp trực tiếp phụ trách.',
    },
    {
      role: 'Nhân viên',
      badge: 'NHÂN VIÊN',
      points: ['Hiểu mình đang thiếu gì', 'Học đúng phần còn thiếu', 'Nộp minh chứng'],
    },
  ],
};

const DEPLOYMENT: LandingSectionConfig = {
  kind: 'deployment',
  intro: {
    label: 'Triển khai',
    title: [{ text: 'Từ đăng ký đến triển khai,' }, { text: 'theo một luồng rõ ràng.', className: SERIF_ITALIC }],
  },
  steps: [
    { title: 'Chọn gói', note: 'Quyền sử dụng tính cả thành viên đang hoạt động và lời mời chưa kích hoạt.' },
    { title: 'Tạo tổ chức', note: 'Đăng ký tài khoản chủ doanh nghiệp và khai báo thông tin tổ chức.', chip: 'Tổ chức đã được tạo' },
    { title: 'Thiết lập phòng ban và vị trí', note: 'Có thể bắt đầu từ các vị trí tham chiếu.', chip: '3 vị trí đã cấu hình' },
    { title: 'Đặt yêu cầu năng lực', note: 'Chọn 9–24 năng lực cho mỗi vị trí.' },
    { title: 'Mời nhân viên', note: 'Nhập hàng loạt từ tệp CSV có ở gói Pro.', chip: '12 nhân viên đã được mời' },
    { title: 'Bắt đầu đánh giá và đào tạo' },
  ],
  sampleNote: 'Ví dụ minh họa',
};

const PRICING: LandingSectionConfig = {
  kind: 'pricing',
  audience: 'enterprise',
  intro: {
    label: 'Bảng giá',
    title: [{ text: 'Chọn gói theo quy mô' }, { text: 'đội ngũ của bạn.', className: SERIF_ITALIC }],
    lead: 'Giá tính theo gói người dùng linh hoạt. Mua theo năm tiết kiệm 20%.',
  },
  compareLabel: 'So sánh chi tiết các gói',
};

/** User capacity limits are read from the plan catalogue so the answer never drifts from the pricing page. */
const userCapacityAnswer = (): string =>
  `${plansFor('enterprise')
    .map((plan) => (plan.seatRange ? `${plan.name}: tối đa ${plan.seatRange.max} người dùng` : `${plan.name}: người dùng theo thỏa thuận`))
    .join('; ')}. Mỗi thành viên đang hoạt động và lời mời đang chờ kích hoạt đều tính vào quyền sử dụng. Khi hết quyền sử dụng của gói, hệ thống từ chối từng lời mời thừa chứ không mất cả danh sách.`;

const FAQ: LandingSectionConfig = {
  kind: 'faq',
  intro: {
    label: 'Giải đáp',
    title: [{ text: 'Câu hỏi thường gặp' }, { text: 'trước khi bạn chọn gói.', className: SERIF_ITALIC }],
  },
  // Not shown yet because the policy is not decided or the product does not guarantee it: refunds, cancellation,
  // data retention, data isolation between customers, failed payments and automatic renewal.
  items: [
    { question: 'Quyền sử dụng và số người dùng được tính như thế nào?', answer: userCapacityAnswer() },
    {
      question: 'Có cần phân công quản lý không?',
      answer:
        'Không bắt buộc. Chủ doanh nghiệp có thể trực tiếp quản lý đội ngũ; khi cần, hãy phân công quản lý theo phòng ban.',
    },
    {
      question: 'Ai đánh giá minh chứng nếu chưa có quản lý?',
      answer: 'Chủ doanh nghiệp có thể giao nhiệm vụ, đánh giá minh chứng và xác nhận năng lực cho toàn tổ chức.',
    },
    {
      question: 'Yêu cầu năng lực theo vị trí được thiết lập ra sao?',
      answer:
        'Chủ doanh nghiệp chọn 9–24 năng lực và mức yêu cầu cho mỗi vị trí. Năng lực an toàn 4.1 và 4.2 luôn được giữ lại. Mỗi lần cập nhật tạo một phiên bản mới.',
    },
    {
      question: 'Hoàn thành khóa học có đồng nghĩa năng lực được xác nhận không?',
      answer:
        'Không. Kết quả học tập và năng lực được xác nhận là hai kết quả riêng. Chủ doanh nghiệp hoặc quản lý cần đánh giá minh chứng thực tế trước khi xác nhận năng lực.',
    },
    {
      question: 'Có thể đổi gói khi quy mô doanh nghiệp thay đổi không?',
      answer: 'Có. Chủ doanh nghiệp có thể thay đổi gói trong mục Gói và thanh toán.',
    },
    {
      question: 'Khung chuẩn năng lực số được dùng trong DigiTalent AI như thế nào?',
      answer:
        'Khung chuẩn năng lực số gồm 6 miền, 24 năng lực thành phần và 8 bậc được DigiTalent AI vận dụng làm thước đo tham chiếu. Các vị trí công việc và yêu cầu năng lực của từng vị trí do doanh nghiệp và nền tảng thiết lập phù hợp với bối cảnh thực tế.',
    },
  ],
};

export const BUSINESS_SECTIONS: LandingSectionConfig[] = [
  BRIDGE,
  PILLARS,
  WORKFLOW,
  { kind: 'about' },
  TEAM_GAP,
  EVIDENCE,
  ROLES,
  DEPLOYMENT,
  PRICING,
  FAQ,
  { kind: 'finale' },
];

export const BUSINESS_MAIN_NAV: LandingLink[] = [
  { label: 'Cách hoạt động', to: SECTION_IDS.process, kind: 'section' },
  { label: 'Vai trò', to: SECTION_IDS.roles, kind: 'section', wideOnly: true },
  { label: 'Bảng giá', to: '/business/pricing', kind: 'route', wideOnly: true },
  { label: 'Đăng nhập', to: '/login', kind: 'route' },
];

export const BUSINESS_DOCK_NAV: LandingLink[] = [
  { label: 'Cách hoạt động', to: SECTION_IDS.process, kind: 'section' },
  { label: 'Vai trò', to: SECTION_IDS.roles, kind: 'section' },
  { label: 'Bảng giá', to: '/business/pricing', kind: 'route' },
  { label: 'Đăng nhập', to: '/login', kind: 'route' },
];

export const BUSINESS_FOOTER_PRODUCT: LandingLink[] = [
  { label: 'Cách hoạt động', to: SECTION_IDS.process, kind: 'section' },
  { label: 'Khung năng lực', to: SECTION_IDS.about, kind: 'section' },
  { label: 'Bảng giá', to: '/business/pricing', kind: 'route' },
];

export const BUSINESS_FINALE = {
  lead: 'Biết đội ngũ cần phát triển gì.',
  leadMuted: 'Và biết khi nào',
  tail: '',
  tailMuted: 'họ thực sự đạt được nó.',
  guestBody: 'Chọn gói theo số nhân viên, thiết lập vị trí và bắt đầu đo năng lực số của đội ngũ.',
  memberBody: 'Bảng năng lực của đội ngũ bạn đang chờ trong hệ thống.',
};

/** Plans offered on the business page, in order. Kept as a function of the catalogue, not a copy of it. */
export const BUSINESS_PLAN_CODES = PLANS.filter((plan) => plan.audience === 'enterprise').map((plan) => plan.code);
