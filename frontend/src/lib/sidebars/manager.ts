import {
  Bell,
  ClipboardCheck,
  FileBarChart,
  FileCheck2,
  GraduationCap,
  Layers,
  LayoutDashboard,
  TrendingUp,
} from 'lucide-react';
import type { SidebarConfig } from './types';

/**
 * Manager sidebar — Pulse prototype (docs/ui-redesign/14-pulse-product-site, vai trò Manager).
 * Hai nhóm phẳng: việc quản lý đội và các công cụ khác. Chỉ màn hình thuộc phạm vi phòng ban;
 * việc tự học của quản lý mở từ menu tài khoản (cổng nhân viên Pulse), không nằm ở đây.
 *
 * Nhiệm vụ thực tế dùng mã phụ MG-08..12: OW-35/OW-36 cũng là mã của màn chứng nhận trong owner.ts.
 */
export const MANAGER_SIDEBAR: SidebarConfig = [
  // ── QUẢN LÝ ĐỘI ──
  { label: 'Quản lý đội' },
  { label: 'Tổng quan', icon: LayoutDashboard, screenId: 'MG-01' },
  { label: 'Năng lực đội ngũ', icon: TrendingUp, screenId: 'MG-05', activeFor: ['MG-02', 'MG-03', 'MG-04'] },
  { label: 'Bài cuối khóa', icon: FileCheck2, screenId: 'MG-13' },
  { label: 'Báo cáo chu kỳ', icon: FileBarChart, screenId: 'MG-14' },

  // ── CÁC CÔNG CỤ KHÁC ──
  { label: 'Các công cụ khác' },
  { label: 'Khung năng lực chung', icon: Layers, screenId: 'MG-15' },
  { label: 'Đào tạo đội ngũ', icon: GraduationCap, screenId: 'MG-06', activeFor: ['MG-07'] },
  { label: 'Minh chứng thực tế', icon: ClipboardCheck, screenId: 'MG-11', activeFor: ['MG-12', 'MG-08', 'MG-09', 'MG-10'] },
  { label: 'Hoạt động', icon: Bell, screenId: 'SHR-03' },
];
