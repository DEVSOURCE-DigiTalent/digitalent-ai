import type { LucideIcon } from 'lucide-react';
import {
  Anchor,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ClipboardEdit,
  FlaskConical,
  Gem,
  LayoutDashboard,
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
}

/** Sidebar of the Platform Admin console (Platform Admin v2, docs/specs/2026-10-15-platform-admin-v2.md). */
export const PLATFORM_NAV: readonly PlatformNavItem[] = [
  { to: '/platform/dashboard', label: 'Tổng quan', glyph: '◫', icon: LayoutDashboard, description: 'Bảng điều khiển KPI & vận hành' },
  { to: '/platform/frameworks', label: 'Khung chuẩn', glyph: '◇', icon: Gem, description: 'Thông tư 02/2025/TT-BGDĐT' },
  { to: '/platform/reference-positions', label: 'Mẫu vị trí', glyph: '♧', icon: BriefcaseBusiness, description: 'Thư viện chức danh mẫu' },
  { to: '/platform/versions', label: 'Phiên bản khóa học', glyph: '⚓', icon: Anchor, description: 'Catalog neo & bản nháp' },
  { to: '/platform/organizations', label: 'Tổ chức', glyph: '▦', icon: Building2, description: 'Quản trị khách hàng doanh nghiệp' },
  { to: '/platform/trials', label: 'Dùng thử', glyph: '◐', icon: FlaskConical, description: 'Quản trị chương trình dùng thử' },
  { to: '/platform/users', label: 'Người dùng', glyph: '♙', icon: Users, description: 'Tài khoản & người dùng thử' },
  { to: '/platform/commerce', label: 'Đơn giá', glyph: '▥', icon: ReceiptText, description: 'Gói cước & thương mại B2B' },
  { to: '/platform/audit-log', label: 'Nhật ký kiểm tra', glyph: '◎', icon: ScrollText, description: 'Truy vết an ninh & kiểm toán' },
] as const;

/** Header links of the platform workspace. */
export const PLATFORM_TOP_LINKS = [
  { to: '/platform/dashboard', label: 'Nền tảng' },
  { to: '/platform/versions', label: 'Phiên bản khóa học' },
  { to: '/platform/organizations', label: 'Khách hàng' },
  { to: '/platform/audit-log', label: 'Nhật ký' },
] as const;

/** Sidebar của mentor (nhân sự nền tảng chấm bài dùng thử). */
export const MENTOR_NAV: readonly PlatformNavItem[] = [
  { to: '/platform/reviews', label: 'Bài test dùng thử', glyph: '✎', icon: ClipboardEdit, description: 'Chấm bài test dùng thử' },
  { to: '/platform/course-reviews', label: 'Bài cuối khóa', glyph: '✓', icon: CheckCircle2, description: 'Chấm bài cuối khóa' },
] as const;
