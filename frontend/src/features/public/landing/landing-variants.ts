import { INDIVIDUAL_TRIAL, plansFor } from '@/lib/plans';
import {
  BUSINESS_ABOUT, BUSINESS_DOCK_NAV, BUSINESS_FINALE, BUSINESS_FOOTER_PRODUCT, BUSINESS_HERO_EYEBROW, BUSINESS_HERO_HEADLINE,
  BUSINESS_HERO_LEDE, BUSINESS_MAIN_NAV, BUSINESS_SECTIONS,
} from './landing-enterprise';
import {
  FEATURES, FEATURES_HEADLINE, FEATURES_SUBLINE, FOOTER_TEXT,
  LANDING_MEDIA, MEDIA_CARD, SECTION_IDS, SERIF_ITALIC, type BackgroundVideo, type LandingContent, type LandingSectionConfig,
} from './landing-content';

/** Landing page of the enterprise product ("/business", PUB-02). The copy is the one in landing-content.ts. */
export const ENTERPRISE_CONTENT: LandingContent = {
  variant: 'enterprise',
  // The closing clip opens the page and the opening clip closes it.
  media: { ...LANDING_MEDIA, hero: LANDING_MEDIA.finale, finale: LANDING_MEDIA.hero },
  sections: BUSINESS_SECTIONS,
  mainNav: BUSINESS_MAIN_NAV,
  dockNav: BUSINESS_DOCK_NAV,
  footerGroups: [
    {
      title: 'Sản phẩm',
      links: BUSINESS_FOOTER_PRODUCT,
    },
    {
      title: 'Truy cập',
      links: [
        { label: 'Đăng nhập', to: '/login', kind: 'route' },
        { label: 'Bảng giá', to: '/business/pricing', kind: 'route' },
        { label: 'Dành cho cá nhân', to: '/individual', kind: 'route' },
        { label: 'Đổi hướng sử dụng', to: '/portal', kind: 'route' },
      ],
    },
  ],
  heroEyebrow: BUSINESS_HERO_EYEBROW,
  heroHeadline: BUSINESS_HERO_HEADLINE,
  heroLede: BUSINESS_HERO_LEDE,
  heroWordmarkScale: 0.7,
  about: BUSINESS_ABOUT,
  featuresLabel: 'Giải pháp toàn diện',
  featuresHeadline: FEATURES_HEADLINE,
  featuresSubline: FEATURES_SUBLINE,
  mediaCard: MEDIA_CARD,
  features: FEATURES,
  finale: BUSINESS_FINALE,
  footerText: FOOTER_TEXT,
  cta: {
    guestTo: '/business/pricing',
    secondaryLabel: 'Xem cách hoạt động',
    secondaryTo: SECTION_IDS.process,
    trialLabel: 'Trải nghiệm Enterprise',
    trialTo: '/business/try',
    heroLabel: 'Xem bảng giá',
    dockLabel: 'Bảng giá',
    finaleLabel: 'Xem bảng giá',
    signedInTo: '/enterprise',
    loginPath: '/login',
  },
};

const SKILL_PATH_SECTION: LandingSectionConfig = {
  kind: 'skill-path',
  intro: {
    label: 'Khoảng trống kỹ năng và lộ trình',
    title: [{ text: 'Bắt đầu từ khoảng cách' }, { text: 'giữa bạn và vị trí mục tiêu.', className: SERIF_ITALIC }],
    lead: 'Không bắt đầu từ một catalog khóa học. DigiTalent AI bắt đầu từ khoảng cách giữa năng lực hiện tại của bạn và yêu cầu của vị trí, rồi chỉ đề xuất những khóa bạn còn cần.',
  },
  sample: {
    positionCode: 'ACCOUNTANT',
    rows: [
      { code: '4.2', current: 1 },
      { code: '1.2', current: 2 },
      { code: '6.3', current: 1 },
      { code: '2.1', current: 2 },
    ],
    roadmap: [
      { courseCode: 'A4-I', title: 'An toàn thông tin trong công việc', competencyCode: '4.2' },
      { courseCode: 'A4-A', title: 'Quản trị an toàn và trách nhiệm số', competencyCode: '4.2', after: 'A4-I' },
      { courseCode: 'A1-A', title: 'Phân tích thông tin và quản trị dữ liệu', competencyCode: '1.2' },
      { courseCode: 'M6-I', title: 'Ứng dụng AI trung cấp', competencyCode: '6.3' },
    ],
  },
};

const LEARNING_PREVIEW_SECTION: LandingSectionConfig = {
  kind: 'learning-preview',
  intro: {
    label: 'Trải nghiệm học',
    title: [{ text: 'Bên trong một khóa học:' }, { text: 'học gì, làm gì, được đánh giá thế nào.', className: SERIF_ITALIC }],
    lead: 'Mỗi khóa chia thành các module. Mỗi module có mục tiêu rõ ràng, ví dụ sát công việc, bài thực hành và một bài đánh giá.',
  },
  sample: {
    courseCode: 'A4-I',
    courseTitle: 'An toàn thông tin trong công việc',
    modules: [
      'Bảo mật trong môi trường làm việc',
      'Xử lý dữ liệu cá nhân trong công việc',
      'Cân bằng số và sức khỏe nghề nghiệp',
      'Vận hành số bền vững',
    ],
    currentModule: 1,
    lesson: {
      objective: 'Phân biệt dữ liệu cá nhân thông thường và nhạy cảm trong công việc của bạn, và biết khi nào cần cẩn trọng hơn.',
      example: 'Bảng lương của nhân viên bị gửi nhầm vào nhóm chat chung. Bạn làm gì trong 15 phút đầu tiên?',
      practice: 'Rà soát một bảng tính mẫu, đánh dấu các cột chứa dữ liệu cá nhân và đề xuất cách che hoặc ẩn trước khi chia sẻ.',
      quiz: {
        question: 'Trường hợp nào cần có sự đồng ý của người có dữ liệu trước khi xử lý?',
        options: [
          'Thu thập số điện thoại khách hàng để gửi quảng cáo',
          'Lưu mã đơn hàng đã giao',
          'Đếm số lượt truy cập trang web không gắn với cá nhân nào',
        ],
      },
      progress: 'Đã hoàn thành 1 trên 4 module. Bài đánh giá sau khóa sẽ mở khi bạn học xong cả 4.',
    },
  },
};

const PRICING_SECTION: LandingSectionConfig = {
  kind: 'pricing',
  audience: 'individual',
  intro: {
    label: 'Gói cá nhân',
    title: [{ text: 'Chọn gói phù hợp' }, { text: 'với mục tiêu của bạn.', className: SERIF_ITALIC }],
    lead: 'Giá tính theo tháng. Mua theo năm tiết kiệm 20%.',
  },
  compareLabel: 'So sánh chi tiết các gói',
};

const FAQ_SECTION: LandingSectionConfig = {
  kind: 'faq',
  intro: {
    label: 'Giải đáp',
    title: [{ text: 'Câu hỏi thường gặp' }, { text: 'trước khi bạn chọn gói.', className: SERIF_ITALIC }],
  },
  // Not shown yet because the business policy is not decided: refunds, when a cancellation takes effect,
  // how long personal data is kept, failed payments and automatic renewal. Add each answer once it is agreed.
  items: [
    {
      question: 'DigiTalent AI đánh giá năng lực số của tôi bằng cách nào?',
      answer:
        'Bằng bài đánh giá đầu vào theo từng năng lực của vị trí bạn chọn. Mỗi năng lực được hỏi lần lượt từng tầng, từ Cơ bản đến Trung cấp rồi Nâng cao, đạt tầng này mới lên tầng kế tiếp. Kết quả là mức hiện tại của bạn, không mặc định bằng không.',
    },
    {
      question: 'Khung chuẩn năng lực số được dùng như thế nào?',
      answer:
        'Khung chuẩn năng lực số gồm 6 miền, 24 năng lực thành phần và 8 bậc được DigiTalent AI vận dụng làm thước đo tham chiếu. Các vị trí tham chiếu và yêu cầu năng lực do DigiTalent AI xây dựng bám sát bối cảnh thực tế.',
    },
    {
      question: 'Tôi có thể thay đổi vị trí nghề nghiệp mục tiêu không?',
      answer:
        'Có. Khi bạn đổi mục tiêu, hệ thống so mức hiện tại của bạn với yêu cầu của vị trí mới và dựng lại khoảng trống kỹ năng cùng lộ trình học.',
    },
    {
      question: 'Nếu tôi đã đạt một số năng lực thì có phải học lại không?',
      answer:
        'Không. Lộ trình chỉ gồm các khóa ứng với phần bạn còn thiếu so với yêu cầu của vị trí, theo đúng thứ tự tiên quyết.',
    },
    {
      question: 'Mức được đánh giá có nghĩa là gì?',
      answer:
        'Đó là mức do bài đánh giá của DigiTalent AI cho ra, ghi trong hồ sơ năng lực cá nhân của bạn. Đây không phải kết quả doanh nghiệp đã kiểm chứng bằng bằng chứng công việc; việc đó thuộc phần dành cho doanh nghiệp.',
    },
    {
      question: 'Gói cá nhân bao gồm những gì?',
      answer: `${plansFor('individual')
        .map((plan) => `${plan.name}: ${plan.highlights.join('; ')}.`)
        .join(' ')} Xem bảng giá để so sánh chi tiết.`,
    },
  ],
};

const PROGRESS_SECTION: LandingSectionConfig = {
  kind: 'progress',
  intro: {
    label: 'Hồ sơ năng lực cá nhân',
    title: [{ text: 'Tiến bộ của bạn,' }, { text: 'từng bài đánh giá một.', className: SERIF_ITALIC }],
    lead: 'Mỗi bài đánh giá cập nhật mức của từng năng lực. Bạn thấy mình đã đi từ đâu, đang ở đâu và còn bao xa tới vị trí mục tiêu.',
  },
  profileLabel: 'Hồ sơ năng lực',
  timeline: [
    { when: 'Tuần 1', title: 'Bài đánh giá đầu vào', detail: 'Năng lực 4.2: Cơ bản' },
    { when: 'Tuần 3', title: 'Hoàn thành khóa A4-I', detail: 'An toàn thông tin trong công việc' },
    { when: 'Tuần 4', title: 'Bài đánh giá sau khóa', detail: 'Năng lực 4.2: Trung cấp' },
    { when: 'Tuần 4', title: 'Thành tựu', detail: 'Hoàn thành tầng Trung cấp của miền An toàn' },
  ],
};

/** Landing page of the individual product ("/individual", PUB-03). */
/**
 * A person studying alone under the stars (self-made, 1280×720, 10 s, 2 MB), behind the course column of the
 * learning section. The generator's mark sits in the bottom-right corner, so the clip is enlarged around the
 * upper left to keep it out of the frame.
 */
const STUDY_CLIP: BackgroundVideo = { src: '/videos/individual-study.mp4', zoom: 1.2, origin: '20% 30%' };

export const INDIVIDUAL_CONTENT: LandingContent = {
  variant: 'individual',
  media: { ...LANDING_MEDIA, learning: STUDY_CLIP },
  sections: [
    {
      kind: 'careers',
      intro: {
        label: 'Vị trí tham chiếu',
        title: [
          { text: 'Bạn muốn hướng tới vị trí nào?' },
          { text: 'Mỗi vị trí một bộ năng lực số riêng.', className: SERIF_ITALIC },
        ],
        lead: 'Chọn mục tiêu để xem bạn cần phát triển những gì. Đây là các vị trí tham chiếu do DigiTalent AI xây dựng dựa trên Khung chuẩn năng lực số.',
      },
      cardLinkLabel: 'Xem yêu cầu vị trí',
      exploreAllLabel: 'Khám phá tất cả vị trí',
    },
    {
      kind: 'process',
      intro: {
        label: 'Cách hoạt động',
        title: [{ text: 'Từ chọn mục tiêu đến' }, { text: 'hồ sơ năng lực của bạn.', className: SERIF_ITALIC }],
      },
      steps: [
        { title: 'Chọn vị trí mục tiêu', text: 'Xem yêu cầu năng lực của vị trí bạn muốn đạt tới.' },
        { title: 'Làm đánh giá đầu vào', text: 'Hệ thống biết mức hiện tại của bạn, không mặc định bằng không.' },
        { title: 'Xem khoảng trống năng lực', text: 'So mức hiện tại với yêu cầu của vị trí, theo từng năng lực.' },
        { title: 'Nhận lộ trình theo thứ tự tiên quyết', text: 'Chỉ học phần còn thiếu, đúng thứ tự các khóa.' },
        { title: 'Học và làm bài đánh giá', text: 'Mỗi khóa kết thúc bằng một bài đánh giá.' },
        { title: 'Theo dõi hồ sơ năng lực', text: 'Mức được đánh giá cập nhật sau mỗi bài.' },
      ],
    },
    { kind: 'about' },
    { kind: 'features' },
    SKILL_PATH_SECTION,
    LEARNING_PREVIEW_SECTION,
    PROGRESS_SECTION,
    PRICING_SECTION,
    FAQ_SECTION,
    { kind: 'finale' },
  ],
  mainNav: [
    { label: 'Vị trí nghề nghiệp', shortLabel: 'Vị trí', to: SECTION_IDS.careers, kind: 'section' },
    { label: 'Cách hoạt động', to: SECTION_IDS.process, kind: 'section' },
    { label: 'Khung năng lực', to: SECTION_IDS.about, kind: 'section', wideOnly: true },
    { label: 'Bảng giá', to: '/individual/pricing', kind: 'route', wideOnly: true },
    { label: 'Đăng nhập', to: '/login', kind: 'route' },
  ],
  dockNav: [
    { label: 'Vị trí nghề nghiệp', to: SECTION_IDS.careers, kind: 'section' },
    { label: 'Cách hoạt động', to: SECTION_IDS.process, kind: 'section' },
    { label: 'Bảng giá', to: '/individual/pricing', kind: 'route' },
    { label: 'Đăng nhập', to: '/login', kind: 'route' },
  ],
  footerGroups: [
    {
      title: 'Sản phẩm',
      links: [
        { label: 'Khung năng lực', to: SECTION_IDS.about, kind: 'section' },
        { label: 'Tính năng', to: SECTION_IDS.features, kind: 'section' },
        { label: 'Vị trí nghề nghiệp', to: '/careers', kind: 'route' },
        { label: 'Bảng giá', to: '/individual/pricing', kind: 'route' },
      ],
    },
    {
      title: 'Truy cập',
      links: [
        { label: 'Đăng nhập', to: '/login', kind: 'route' },
        { label: 'Xem gói cá nhân', to: '/individual/pricing', kind: 'route' },
        { label: 'Dành cho doanh nghiệp', to: '/business', kind: 'route' },
        { label: 'Đổi hướng sử dụng', to: '/portal', kind: 'route' },
      ],
    },
  ],
  heroEyebrow: {
    title: 'Nền tảng phát triển năng lực số cá nhân',
    basis: 'Căn cứ Khung chuẩn năng lực số',
  },
  heroLede:
    'Chọn vị trí bạn muốn đạt tới, làm bài đánh giá đầu vào, biết mình còn thiếu năng lực nào và học theo lộ trình dựng riêng cho bạn.',
  about: {
    label: 'Khung chuẩn năng lực số',
    title: [
      { text: 'Biết mình đang ở đâu,' },
      { text: 'và cần học gì tiếp theo.', className: SERIF_ITALIC },
      { text: 'Lộ trình bám sát vị trí bạn nhắm tới.' },
    ],
    body:
      'Khung chuẩn năng lực số chia thành 6 miền với 24 năng lực thành phần, xếp theo 8 bậc. Chương trình của DigiTalent AI hiện dạy 3 tầng: Cơ bản (bậc 1–2), Trung cấp (bậc 3–4) và Nâng cao (bậc 5–6). Bạn chọn một vị trí mục tiêu, làm bài đánh giá đầu vào để hệ thống biết mức hiện tại của bạn thay vì mặc định bằng không, rồi so với yêu cầu của vị trí để chỉ ra phần còn thiếu và xếp các khóa học theo đúng thứ tự tiên quyết.',
    specs: [
      { value: '6', label: 'miền năng lực, gồm cả ứng dụng AI' },
      { value: '24', label: 'năng lực thành phần cốt lõi' },
      { value: '8', label: 'bậc năng lực trong khung tham chiếu' },
      { value: '3', label: 'tầng chương trình hiện hỗ trợ: Cơ bản · Trung cấp · Nâng cao' },
    ],
  },
  featuresLabel: 'Lộ trình và hồ sơ năng lực',
  featuresHeadline: [
    { text: 'Từ mục tiêu nghề nghiệp đến lộ trình học,' },
    { text: 'trên cùng một nền tảng.', className: SERIF_ITALIC },
  ],
  featuresSubline: [{ text: 'Chọn đích đến. Đo điểm xuất phát. Học đúng chỗ còn thiếu.' }],
  mediaCard: {
    label: 'Hồ sơ năng lực cá nhân',
    caption: 'Mức hiện tại, mức yêu cầu và phần còn thiếu, trên một màn hình.',
  },
  features: [
    {
      id: 'target',
      number: '01',
      title: 'Vị trí mục tiêu rõ ràng.',
      visual: 'matrix',
      points: [
        'Xem các năng lực và mức yêu cầu của từng vị trí tham chiếu',
        'Đổi mục tiêu bất cứ lúc nào',
        'So với yêu cầu thật, không phải bài tập chung chung',
      ],
      link: { label: 'Khám phá vị trí', to: '/careers' },
    },
    {
      id: 'gap',
      number: '02',
      title: 'Biết chính xác mình thiếu gì.',
      visual: 'radar',
      points: [
        'Bài đánh giá đầu vào, không mặc định mức 0',
        'Radar mức hiện tại so với yêu cầu, theo 6 miền',
        'Lộ trình khóa học xếp theo thứ tự tiên quyết',
      ],
    },
    {
      id: 'progress',
      number: '03',
      title: 'Tiến bộ có thể thấy được.',
      visual: 'progress',
      points: [
        'Bài đánh giá sau mỗi khóa',
        'Hồ sơ năng lực cập nhật theo kết quả',
        'Thành tựu cá nhân cho mỗi mốc hoàn thành',
      ],
    },
  ],
  finale: {
    lead: 'Một mục tiêu',
    leadMuted: 'một lộ trình.',
    tail: 'Mỗi bài học',
    tailMuted: 'một bước tiến.',
    guestBody: 'Chọn một trong 5 vị trí, làm khảo sát định hướng và học thử một phần trước khi chọn gói.',
    memberBody: 'Lộ trình học và hồ sơ năng lực của bạn đang chờ trong hệ thống.',
  },
  footerText: {
    about: 'Nền tảng phát triển năng lực số cá nhân theo lộ trình riêng theo Khung chuẩn năng lực số.',
    basis: 'Khung chuẩn năng lực số gồm 6 miền và 24 năng lực cốt lõi.',
  },
  cta: {
    guestTo: '/individual/try',
    secondaryLabel: 'Xem gói cá nhân',
    secondaryTo: '/individual/pricing',
    trialLabel: `hoặc tạo tài khoản dùng thử ${INDIVIDUAL_TRIAL.days} ngày`,
    trialTo: '/individual/register?trial=1&source=landing',
    heroLabel: 'Trải nghiệm miễn phí',
    dockLabel: 'Học thử',
    finaleLabel: 'Trải nghiệm miễn phí',
    signedInTo: '/personal',
    loginPath: '/login',
  },
};
