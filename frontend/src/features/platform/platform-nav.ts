import type { LucideIcon } from 'lucide-react';
import {
  Anchor,
  BriefcaseBusiness,
  Bug,
  Building2,
  FlaskConical,
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
  readonly badgeKey?: 'pendingTrials';
}

export interface PlatformNavGroup {
  readonly groupTitle: string;
  readonly items: readonly PlatformNavItem[];
}

/**
 * Phân nhóm 4 khối chức năng Sidebar Quản trị Nền tảng (Platform Admin v2 - Enterprise Standard):
 * 1. Vận hành & Khách hàng
 * 2. Nội dung & Chuẩn năng lực
 * 3. Thương mại & Tài chính
 * 4. Quản trị & Hỗ trợ
 */
export const PLATFORM_NAV_GROUPS: readonly PlatformNavGroup[] = [
  {
    groupTitle: 'Vận hành & Khách hàng',
    items: [
      {
        to: '/platform/dashboard',
        label: 'Tổng quan',
        glyph: '',
        icon: LayoutDashboard,
        description: 'Bảng điều khiển KPI & vận hành toàn diện',
      },
      {
        to: '/platform/trials',
        label: 'Đánh giá dùng thử',
        glyph: '',
        icon: FlaskConical,
        description: 'Yêu cầu thẩm định & phân công mentor',
        badgeKey: 'pendingTrials',
      },
      {
        to: '/platform/organizations',
        label: 'Tổ chức doanh nghiệp',
        glyph: '',
        icon: Building2,
        description: 'Quản trị khách hàng doanh nghiệp B2B',
      },
      {
        to: '/platform/users',
        label: 'Tài khoản người dùng',
        glyph: '',
        icon: Users,
        description: 'Quản lý tài khoản, người dùng thử & phân quyền',
      },
    ],
  },
  {
    groupTitle: 'Nội dung & Chuẩn năng lực',
    items: [
      {
        to: '/platform/frameworks',
        label: 'Khung chuẩn năng lực',
        glyph: '',
        icon: Gem,
        description: 'Khung chuẩn năng lực số quốc gia',
      },
      {
        to: '/platform/reference-positions',
        label: 'Mẫu vị trí chuẩn',
        glyph: '',
        icon: BriefcaseBusiness,
        description: 'Thư viện chức danh mẫu tham chiếu',
      },
      {
        to: '/platform/versions',
        label: 'Phiên bản khóa học',
        glyph: '',
        icon: Anchor,
        description: 'Catalog neo đang phục vụ & bản nháp soạn thảo',
      },
    ],
  },
  {
    groupTitle: 'Thương mại & Tài chính',
    items: [
      {
        to: '/platform/commerce',
        label: 'Đơn giá & Suất học',
        glyph: '',
        icon: ReceiptText,
        description: 'Gói cước, đơn giá theo suất & thương mại B2B',
      },
    ],
  },
  {
    groupTitle: 'Quản trị & Hỗ trợ',
    items: [
      {
        to: '/platform/audit-log',
        label: 'Nhật ký kiểm tra',
        glyph: '',
        icon: ScrollText,
        description: 'Truy vết an ninh, thao tác hệ thống & kiểm toán',
      },
      {
        to: '/platform/feedbacks',
        label: 'Ý kiến phản hồi',
        glyph: '',
        icon: MessageSquare,
        description: 'Ý kiến đóng góp và đề xuất từ người dùng',
      },
      {
        to: '/platform/bug-reports',
        label: 'Báo lỗi kỹ thuật',
        glyph: '',
        icon: Bug,
        description: 'Sự cố và lỗi người dùng gửi về hệ thống',
      },
    ],
  },
] as const;

/** Danh sách tuần tự tương thích ngược với PLATFORM_SIDEBAR */
export const PLATFORM_NAV: readonly PlatformNavItem[] = [
  { to: '/platform/dashboard', label: 'Tổng quan', glyph: '', icon: LayoutDashboard },
  { to: '/platform/frameworks', label: 'Khung chuẩn', glyph: '', icon: Gem },
  { to: '/platform/reference-positions', label: 'Mẫu vị trí', glyph: '', icon: BriefcaseBusiness },
  { to: '/platform/versions', label: 'Phiên bản khóa học', glyph: '', icon: Anchor },
  { to: '/platform/organizations', label: 'Tổ chức', glyph: '', icon: Building2 },
  { to: '/platform/trials', label: 'Đánh giá dùng thử', glyph: '', icon: FlaskConical, badgeKey: 'pendingTrials' },
  { to: '/platform/users', label: 'Người dùng', glyph: '', icon: Users },
  { to: '/platform/commerce', label: 'Đơn giá', glyph: '', icon: ReceiptText },
  { to: '/platform/audit-log', label: 'Nhật ký kiểm tra', glyph: '', icon: ScrollText },
  { to: '/platform/feedbacks', label: 'Góp ý', glyph: '', icon: MessageSquare },
  { to: '/platform/bug-reports', label: 'Báo lỗi', glyph: '', icon: Bug },
] as const;

/** Header links of the platform workspace. */
export const PLATFORM_TOP_LINKS = [
  { to: '/platform/dashboard', label: 'Tổng quan' },
  { to: '/platform/trials', label: 'Đánh giá dùng thử' },
  { to: '/platform/organizations', label: 'Khách hàng' },
  { to: '/platform/versions', label: 'Phiên bản khóa học' },
  { to: '/platform/audit-log', label: 'Kiểm toán' },
] as const;
