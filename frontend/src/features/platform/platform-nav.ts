import type { LucideIcon } from 'lucide-react';
import {
  Anchor,
  HandMetal,
  BriefcaseBusiness,
  Bug,
  Building2,
  FlaskConical,
  GraduationCap,
  Gem,
  LayoutDashboard,
  MessageSquare,
  ReceiptText,
  ScrollText,
  Users,
} from 'lucide-react';

export interface PlatformNavItem {
  readonly to: string;
  readonly label: string;
  readonly glyph: string;
  readonly icon: LucideIcon;
  readonly description?: string;
  readonly badgeKey?: 'pendingTrials' | 'pendingFeedbacks' | 'pendingBugs';
}

export interface PlatformNavGroup {
  readonly groupTitle: string;
  readonly items: readonly PlatformNavItem[];
}

/**
 * Phân nhóm 4 khối chức năng Sidebar Quản trị Nền tảng (Platform Admin v2 - Enterprise Standard):
 * 1. Khách hàng
 * 2. Nội dung
 * 3. Doanh thu
 * 4. Hệ thống
 */
export const PLATFORM_NAV_GROUPS: readonly PlatformNavGroup[] = [
  {
    groupTitle: 'Khách hàng',
    items: [
      {
        to: '/platform/dashboard',
        label: 'Tổng quan',
        glyph: '',
        icon: LayoutDashboard,
        description: 'Số liệu chính và việc cần xử lý',
      },
      {
        to: '/platform/trials',
        label: 'Đánh giá dùng thử',
        glyph: '',
        icon: FlaskConical,
        description: 'Tiến độ bài khảo sát của tổ chức dùng thử',
      },
      {
        to: '/platform/mentors',
        label: 'Mentor',
        glyph: '',
        icon: GraduationCap,
        description: 'Phân công mentor chấm bài cuối cấp',
        badgeKey: 'pendingTrials',
      },
      {
        to: '/platform/organizations',
        label: 'Tổ chức',
        glyph: '',
        icon: Building2,
        description: 'Trạng thái, khóa đã mua và nhân viên của từng tổ chức',
      },
      {
        to: '/platform/users',
        label: 'Người dùng',
        glyph: '',
        icon: Users,
        description: 'Tra cứu, khóa và mở khóa tài khoản',
      },
    ],
  },
  {
    groupTitle: 'Nội dung',
    items: [
      {
        to: '/platform/frameworks',
        label: 'Khung năng lực số',
        glyph: '',
        icon: Gem,
        description: '6 lĩnh vực năng lực số và các khóa học',
      },
      {
        to: '/platform/reference-positions',
        label: 'Vị trí tham chiếu',
        glyph: '',
        icon: BriefcaseBusiness,
        description: 'Mức năng lực yêu cầu của 5 vị trí mẫu',
      },
      {
        to: '/platform/versions',
        label: 'Phiên bản khóa học',
        glyph: '',
        icon: Anchor,
        description: 'Bản đang dùng, bản nháp và công bố',
      },
      {
        to: '/platform/sign-dictionary',
        label: 'Từ điển ký hiệu',
        glyph: '',
        icon: HandMetal,
        description: 'Video ký hiệu và chuyển động cho nhân vật 3D ra dấu',
      },
    ],
  },
  {
    groupTitle: 'Doanh thu',
    items: [
      {
        to: '/platform/commerce',
        label: 'Giá và đơn hàng',
        glyph: '',
        icon: ReceiptText,
        description: 'Giá khóa học và lịch sử mua khóa',
      },
    ],
  },
  {
    groupTitle: 'Hệ thống',
    items: [
      {
        to: '/platform/audit-log',
        label: 'Nhật ký hoạt động',
        glyph: '',
        icon: ScrollText,
        description: 'Ai đã làm gì, lúc nào và vì sao',
      },
      {
        to: '/platform/feedbacks',
        label: 'Góp ý',
        glyph: '',
        icon: MessageSquare,
        badgeKey: 'pendingFeedbacks',
        description: 'Góp ý và điểm hài lòng từ người dùng',
      },
      {
        to: '/platform/bug-reports',
        label: 'Báo lỗi',
        glyph: '',
        icon: Bug,
        badgeKey: 'pendingBugs',
        description: 'Lỗi người dùng báo từ trong ứng dụng',
      },
    ],
  },
] as const;

/** Danh sách tuần tự tương thích ngược với PLATFORM_SIDEBAR */
export const PLATFORM_NAV: readonly PlatformNavItem[] = [
  { to: '/platform/dashboard', label: 'Tổng quan', glyph: '', icon: LayoutDashboard },
  { to: '/platform/frameworks', label: 'Khung năng lực số', glyph: '', icon: Gem },
  { to: '/platform/reference-positions', label: 'Vị trí tham chiếu', glyph: '', icon: BriefcaseBusiness },
  { to: '/platform/versions', label: 'Phiên bản khóa học', glyph: '', icon: Anchor },
  { to: '/platform/sign-dictionary', label: 'Từ điển ký hiệu', glyph: '', icon: HandMetal },
  { to: '/platform/organizations', label: 'Tổ chức', glyph: '', icon: Building2 },
  { to: '/platform/trials', label: 'Đánh giá dùng thử', glyph: '', icon: FlaskConical },
  { to: '/platform/mentors', label: 'Mentor', glyph: '', icon: GraduationCap, badgeKey: 'pendingTrials' },
  { to: '/platform/users', label: 'Người dùng', glyph: '', icon: Users },
  { to: '/platform/commerce', label: 'Giá và đơn hàng', glyph: '', icon: ReceiptText },
  { to: '/platform/audit-log', label: 'Nhật ký hoạt động', glyph: '', icon: ScrollText },
  { to: '/platform/feedbacks', label: 'Góp ý', glyph: '', icon: MessageSquare },
  { to: '/platform/bug-reports', label: 'Báo lỗi', glyph: '', icon: Bug },
] as const;

/** Header links of the platform workspace. */
export const PLATFORM_TOP_LINKS = [
  { to: '/platform/dashboard', label: 'Tổng quan' },
  { to: '/platform/trials', label: 'Đánh giá dùng thử' },
  { to: '/platform/organizations', label: 'Tổ chức' },
  { to: '/platform/versions', label: 'Phiên bản khóa học' },
  { to: '/platform/audit-log', label: 'Nhật ký hoạt động' },
] as const;
