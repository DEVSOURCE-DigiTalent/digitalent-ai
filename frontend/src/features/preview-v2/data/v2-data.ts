/**
 * DigiTalent AI - V2 Authentic Data Repository
 * Chứa dữ liệu chuẩn thực tế của hệ thống DigiTalent AI:
 * - Khung chuẩn năng lực số Thông tư 02/2025/TT-BGDĐT (6 miền, 24 năng lực, 8 bậc)
 * - 5 Vị trí tham chiếu chuẩn
 * - Khóa học & Lộ trình đào tạo năng lực số
 * - Cố vấn chuyên gia & Trợ lý AI Career Copilot
 */

export interface V2Domain {
  id: number;
  name: string;
  code: string;
  iconName: string;
  competencyCount: number;
  description: string;
  tagColor: string;
}

export const V2_DOMAINS: V2Domain[] = [
  {
    id: 1,
    name: 'Khai thác dữ liệu và thông tin số',
    code: 'M1',
    iconName: 'Database',
    competencyCount: 3,
    description: 'Tìm kiếm, lọc, đánh giá và quản lý dữ liệu, thông tin trong môi trường số phục vụ công việc.',
    tagColor: '#537565',
  },
  {
    id: 2,
    name: 'Giao tiếp và hợp tác trong môi trường số',
    code: 'M2',
    iconName: 'Users',
    competencyCount: 6,
    description: 'Tương tác, chia sẻ, hợp tác số, quy tắc ứng xử mạng và quản trị danh tính số chuyên nghiệp.',
    tagColor: '#D96B43',
  },
  {
    id: 3,
    name: 'Sáng tạo nội dung số',
    code: 'M3',
    iconName: 'FileEdit',
    competencyCount: 4,
    description: 'Phát triển, tích hợp, cải biến nội dung số, tuân thủ bản quyền và ứng dụng lập trình cơ bản.',
    tagColor: '#D9822B',
  },
  {
    id: 4,
    name: 'An toàn và bảo mật số',
    code: 'M4',
    iconName: 'ShieldCheck',
    competencyCount: 4,
    description: 'Bảo vệ thiết bị, dữ liệu cá nhân, quyền riêng tư, an sinh số và môi trường sinh thái công nghệ.',
    tagColor: '#3B6A82',
  },
  {
    id: 5,
    name: 'Giải quyết vấn đề bằng công nghệ',
    code: 'M5',
    iconName: 'Cpu',
    competencyCount: 4,
    description: 'Xử lý lỗi kỹ thuật, lựa chọn giải pháp công nghệ tối ưu và tư duy đổi mới sáng tạo.',
    tagColor: '#7A5B82',
  },
  {
    id: 6,
    name: 'Ứng dụng Trí tuệ Nhân tạo (AI)',
    code: 'M6',
    iconName: 'Sparkles',
    competencyCount: 3,
    description: 'Làm chủ Prompt Engineering, ứng dụng GenAI và tích hợp tác tử AI tự động hóa công việc.',
    tagColor: '#C25630',
  },
];

export interface V2Course {
  id: string;
  code: string;
  title: string;
  domainId: number;
  domainName: string;
  level: 'Cơ bản' | 'Trung cấp' | 'Nâng cao';
  tierRange: string;
  lessonsCount: number;
  duration: string;
  image: string;
  description: string;
  targetRole: string;
  rating: number;
  studentsCount: number;
}

export const V2_COURSES: V2Course[] = [
  {
    id: 'ai-prompt-01',
    code: 'AI-6.1',
    title: 'Làm Chủ AI Tạo Sinh & Prompt Engineering Cho Chuyên Viên',
    domainId: 6,
    domainName: 'Ứng dụng Trí tuệ Nhân tạo',
    level: 'Trung cấp',
    tierRange: 'Bậc 3–5',
    lessonsCount: 12,
    duration: '18 giờ học',
    image: '/images/v2/course-ai.jpg',
    description: 'Xây dựng cấu trúc prompt chuẩn xác, tự động hóa soạn thảo, phân tích nghiệp vụ và ra quyết định bằng trợ lý AI.',
    targetRole: 'Marketing, HR, Quản lý',
    rating: 4.9,
    studentsCount: 1420,
  },
  {
    id: 'data-analytics-02',
    code: 'DATA-1.2',
    title: 'Khai Thác & Trực Quan Hóa Dữ Liệu Số Với AI Dashboard',
    domainId: 1,
    domainName: 'Khai thác dữ liệu số',
    level: 'Cơ bản',
    tierRange: 'Bậc 2–4',
    lessonsCount: 14,
    duration: '22 giờ học',
    image: '/images/v2/learner-study.jpg',
    description: 'Chuyển hóa dữ liệu thô thành biểu đồ động, phân tích xu hướng bán hàng và hiệu suất đội ngũ theo thời gian thực.',
    targetRole: 'Kế toán, Kinh doanh, CEO',
    rating: 4.8,
    studentsCount: 980,
  },
  {
    id: 'sec-privacy-03',
    code: 'SEC-4.2',
    title: 'An Toàn Thông Tin & Bảo Vệ Dữ Liệu Cá Nhân Doanh Nghiệp',
    domainId: 4,
    domainName: 'An toàn & Bảo mật số',
    level: 'Trung cấp',
    tierRange: 'Bậc 3–4',
    lessonsCount: 10,
    duration: '14 giờ học',
    image: '/images/v2/hero-talent.jpg',
    description: 'Nhận diện rủi ro lừa đảo số, mã hóa dữ liệu nhạy cảm, tuân thủ Nghị định 13 và bảo vệ thiết bị làm việc từ xa.',
    targetRole: 'Toàn bộ nhân sự',
    rating: 4.95,
    studentsCount: 2150,
  },
  {
    id: 'content-creator-04',
    code: 'CONT-3.1',
    title: 'Sáng Tạo & Tích Hợp Nội Dung Số Đa Phương Tiện Với AI',
    domainId: 3,
    domainName: 'Sáng tạo nội dung số',
    level: 'Cơ bản',
    tierRange: 'Bậc 2–4',
    lessonsCount: 15,
    duration: '20 giờ học',
    image: '/images/v2/hero-talent.jpg',
    description: 'Thiết kế ấn phẩm truyền thông, tạo video đào tạo ngắn và tích hợp nội dung số tương tác với sự hỗ trợ của AI tools.',
    targetRole: 'Marketing, Truyền thông',
    rating: 4.75,
    studentsCount: 840,
  },
  {
    id: 'collab-agile-05',
    code: 'COLL-2.4',
    title: 'Hợp Tác Trực Tuyến & Quản Trị Quy Trình Công Việc Số',
    domainId: 2,
    domainName: 'Giao tiếp & Hợp tác số',
    level: 'Cơ bản',
    tierRange: 'Bậc 2–3',
    lessonsCount: 9,
    duration: '12 giờ học',
    image: '/images/v2/learner-study.jpg',
    description: 'Vận hành không gian làm việc số (Notion, Jira, Teams), tối ưu hóa luồng giao việc và quản lý tri thức đội ngũ.',
    targetRole: 'HR, Quản lý dự án',
    rating: 4.85,
    studentsCount: 1120,
  },
  {
    id: 'problem-copilot-06',
    code: 'PROB-5.3',
    title: 'Giải Quyết Vấn Đề Kỹ Thuật & Tự Động Hóa Với Copilot',
    domainId: 5,
    domainName: 'Giải quyết vấn đề số',
    level: 'Nâng cao',
    tierRange: 'Bậc 4–6',
    lessonsCount: 16,
    duration: '26 giờ học',
    image: '/images/v2/course-ai.jpg',
    description: 'Áp dụng AI Copilot để viết script tự động hóa tác vụ lặp lại, sửa lỗi quy trình và cải tiến chất lượng vận hành số.',
    targetRole: 'IT, Kế toán, Chuyên viên dữ liệu',
    rating: 4.9,
    studentsCount: 670,
  },
];

export interface V2CareerRole {
  code: string;
  name: string;
  englishTitle: string;
  description: string;
  competenciesCount: number;
  highlightSkills: string[];
  readinessRate: number;
}

export const V2_CAREER_ROLES: V2CareerRole[] = [
  {
    code: 'CEO',
    name: 'Giám đốc Điều hành',
    englishTitle: 'Chief Executive Officer',
    description: 'Định hướng chiến lược chuyển đổi số, phân bổ nguồn lực công nghệ và quản trị rủi ro an ninh dữ liệu.',
    competenciesCount: 18,
    highlightSkills: ['Định hướng chuyển đổi số', 'Quản trị rủi ro AI', 'Khai thác dữ liệu chiến lược'],
    readinessRate: 78,
  },
  {
    code: 'HR',
    name: 'Chuyên viên Nhân sự',
    englishTitle: 'Human Resources Specialist',
    description: 'Số hóa quản trị hồ sơ nhân sự, tuyển dụng thông minh bằng AI và xây dựng kế hoạch đào tạo kỹ năng số.',
    competenciesCount: 16,
    highlightSkills: ['Đánh giá năng lực số', 'AI trong tuyển dụng', 'Hợp tác số đội ngũ'],
    readinessRate: 85,
  },
  {
    code: 'MARKETING',
    name: 'Chuyên viên Marketing Số',
    englishTitle: 'Digital Marketing Specialist',
    description: 'Sáng tạo nội dung đa kênh, phân tích hành vi khách hàng với AI và tối ưu hóa chiến dịch tự động.',
    competenciesCount: 20,
    highlightSkills: ['GenAI Content Creation', 'Phân tích Data Marketing', 'Tự động hóa đa kênh'],
    readinessRate: 91,
  },
  {
    code: 'SALES_CRM',
    name: 'Kinh doanh & Quản trị CRM',
    englishTitle: 'Sales & CRM Representative',
    description: 'Khai thác phần mềm CRM, quản lý cơ hội bán hàng và ứng dụng trợ lý AI tương tác khách hàng thông minh.',
    competenciesCount: 15,
    highlightSkills: ['Vận hành CRM', 'Giao tiếp số đa nền tảng', 'Bảo mật thông tin khách hàng'],
    readinessRate: 88,
  },
  {
    code: 'ACCOUNTANT',
    name: 'Kế toán & Tài chính Số',
    englishTitle: 'Digital Accountant',
    description: 'Xử lý chứng từ điện tử, tự động hóa báo cáo tài chính và kiểm soát an toàn bảo mật dữ liệu nhạy cảm.',
    competenciesCount: 14,
    highlightSkills: ['Bảo mật dữ liệu tài chính', 'Tự động hóa báo cáo', 'Phân tích số liệu'],
    readinessRate: 82,
  },
];

export interface V2Mentor {
  id: string;
  name: string;
  title: string;
  domain: string;
  avatar: string;
  studentsCount: number;
  coursesCount: number;
}

export const V2_MENTORS: V2Mentor[] = [
  {
    id: 'm1',
    name: 'TS. Nguyễn Hoàng Nam',
    title: 'Chuyên gia Trí tuệ Nhân tạo & Cố vấn TT02',
    domain: 'Ứng dụng AI & Khung Năng Lực',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    studentsCount: 3400,
    coursesCount: 5,
  },
  {
    id: 'm2',
    name: 'ThS. Trần Thuỳ Dung',
    title: 'Trưởng bộ phận Phát triển Tổ chức & HR Tech',
    domain: 'Chuyển Đổi Số Nhân Sự',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    studentsCount: 2200,
    coursesCount: 4,
  },
  {
    id: 'm3',
    name: 'Lê Minh Tuấn',
    title: 'Kiến trúc sư An toàn Thông tin & Cố vấn Dữ liệu',
    domain: 'An Toàn Số & Dữ Liệu',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    studentsCount: 1950,
    coursesCount: 3,
  },
  {
    id: 'm4',
    name: 'DigiTalent AI Copilot',
    title: 'Trợ lý Trí tuệ Nhân tạo Cá nhân hóa 24/7',
    domain: 'Cố Vấn Lộ Trình & Đánh Giá Tự Động',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    studentsCount: 12500,
    coursesCount: 24,
  },
];

export const V2_STATS = [
  { value: '6', label: 'Miền Năng Lực Chuẩn TT02', sub: 'Bao quát toàn diện từ dữ liệu đến GenAI' },
  { value: '24', label: 'Năng Lực Thành Phần Cốt Lõi', sub: 'Định nghĩa chi tiết tiêu chuẩn đầu ra' },
  { value: '8', label: 'Bậc Năng Lực Khung Chuẩn', sub: 'Đánh giá đa tầng: Cơ bản, Trung cấp, Nâng cao' },
  { value: '94.6%', label: 'Tỷ Lệ Bứt Phá Mục Tiêu', sub: 'Học viên đạt chuẩn vị trí nghề nghiệp kỳ vọng' },
];
