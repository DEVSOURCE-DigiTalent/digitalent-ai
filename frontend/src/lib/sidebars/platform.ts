import { Anchor, BriefcaseBusiness, Building2, Gem, LayoutDashboard, ReceiptText, ScrollText, Users } from 'lucide-react';
import type { SidebarConfig } from './types';

/**
 * Platform Admin sidebar — Platform Admin v2 (docs/specs/2026-10-15-platform-admin-v2.md). The console renders its
 * own sidebar (features/platform/PulseAdminLayout.tsx); this config feeds the shared breadcrumb / command palette.
 */
export const PLATFORM_SIDEBAR: SidebarConfig = [
  { label: 'Tổng quan', icon: LayoutDashboard, screenId: 'PA-01', activeFor: ['PLT-01'] },
  { label: 'Khung chuẩn', icon: Gem, screenId: 'PA-02', activeFor: ['PLT-04'] },
  { label: 'Mẫu vị trí', icon: BriefcaseBusiness, screenId: 'PA-13' },
  { label: 'Phiên bản khóa học', icon: Anchor, screenId: 'PA-03', activeFor: ['PA-12', 'PA-04', 'PLT-05', 'PLT-06', 'PLT-06E'] },
  { label: 'Tổ chức', icon: Building2, screenId: 'PA-05', activeFor: ['PA-06', 'PLT-02', 'PLT-03'] },
  { label: 'Người dùng', icon: Users, screenId: 'PA-07', activeFor: ['PA-08'] },
  { label: 'Đơn giá', icon: ReceiptText, screenId: 'PA-09', activeFor: ['PLT-10', 'PLT-11'] },
  { label: 'Nhật ký kiểm tra', icon: ScrollText, screenId: 'PA-10', activeFor: ['PLT-12'] },
];
