import { describe, it, expect } from 'vitest';
import { PLATFORM_SIDEBAR } from '@/lib/sidebars/platform';
import { PLATFORM_SCREENS } from '@/lib/screens/platform';
import { PLATFORM_NAV } from '../platform-nav';

describe('Platform Admin navigation (Pulse)', () => {
  it('lists the eight console areas in the Platform Admin v2 order', () => {
    expect(PLATFORM_SIDEBAR.map((s) => s.label)).toEqual([
      'Tổng quan',
      'Khung chuẩn',
      'Mẫu vị trí',
      'Phiên bản khóa học',
      'Tổ chức',
      'Người dùng',
      'Đơn giá',
      'Nhật ký kiểm tra',
    ]);
    expect(PLATFORM_NAV.map((n) => n.label)).toEqual(PLATFORM_SIDEBAR.map((s) => s.label));
  });

  it('points every sidebar entry and console link at a real screen', () => {
    const ids = new Set(PLATFORM_SCREENS.map((s) => s.id));
    const paths = new Set(PLATFORM_SCREENS.map((s) => s.path));
    for (const section of PLATFORM_SIDEBAR) {
      expect(ids.has(section.screenId!)).toBe(true);
    }
    for (const link of PLATFORM_NAV) {
      expect(paths.has(link.to)).toBe(true);
    }
  });

  it('guards every console screen with a platform permission', () => {
    for (const screen of PLATFORM_SCREENS.filter((s) => s.id.startsWith('PA-'))) {
      expect(screen.permission, screen.id).toBeTruthy();
      expect(screen.roles).toEqual(['PLATFORM_ADMIN']);
    }
  });
});
