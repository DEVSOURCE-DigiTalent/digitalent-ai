/** Sidebar of the Platform Admin console (Platform Admin v2, docs/specs/2026-10-15-platform-admin-v2.md). */
export const PLATFORM_NAV = [
  { to: '/platform/dashboard', label: 'Tổng quan', glyph: '◫' },
  { to: '/platform/frameworks', label: 'Khung chuẩn', glyph: '◇' },
  { to: '/platform/reference-positions', label: 'Mẫu vị trí', glyph: '♧' },
  { to: '/platform/versions', label: 'Phiên bản khóa học', glyph: '⚓' },
  { to: '/platform/organizations', label: 'Tổ chức', glyph: '▦' },
  { to: '/platform/trials', label: 'Dùng thử', glyph: '◐' },
  { to: '/platform/users', label: 'Người dùng', glyph: '♙' },
  { to: '/platform/commerce', label: 'Đơn giá', glyph: '▥' },
  { to: '/platform/audit-log', label: 'Nhật ký kiểm tra', glyph: '◎' },
] as const;

/** Header links of the platform workspace. */
export const PLATFORM_TOP_LINKS = [
  { to: '/platform/dashboard', label: 'Nền tảng' },
  { to: '/platform/versions', label: 'Phiên bản khóa học' },
  { to: '/platform/organizations', label: 'Khách hàng' },
  { to: '/platform/audit-log', label: 'Nhật ký' },
] as const;

/** Sidebar của mentor (nhân sự nền tảng chấm bài dùng thử). */
export const MENTOR_NAV = [
  { to: '/platform/reviews', label: 'Bài test dùng thử', glyph: '✎' },
  { to: '/platform/course-reviews', label: 'Bài cuối khóa', glyph: '✓' },
] as const;
