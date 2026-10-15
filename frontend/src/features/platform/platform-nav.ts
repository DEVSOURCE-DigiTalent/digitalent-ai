/** Sidebar of the Platform Admin console, with the glyphs of the Pulse mock (docs/ui-redesign/16 §12.6). */
export const PLATFORM_NAV = [
  { to: '/platform/dashboard', label: 'Tổng quan', glyph: '◫' },
  { to: '/platform/framework', label: 'Khung chuẩn', glyph: '◇' },
  { to: '/platform/curriculum', label: 'Chương trình học', glyph: '▤' },
  { to: '/platform/organizations', label: 'Tổ chức', glyph: '♙' },
  { to: '/platform/users', label: 'Người dùng', glyph: '♙' },
  { to: '/platform/commerce', label: 'Đơn hàng và giá', glyph: '▥' },
  { to: '/platform/audit-log', label: 'Nhật ký kiểm tra', glyph: '◎' },
] as const;

/** Header links of the mock's platform workspace. */
export const PLATFORM_TOP_LINKS = [
  { to: '/platform/dashboard', label: 'Nền tảng' },
  { to: '/platform/curriculum', label: 'Chương trình học' },
  { to: '/platform/organizations', label: 'Khách hàng' },
  { to: '/platform/audit-log', label: 'Nhật ký' },
] as const;
