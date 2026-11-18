import {
  Bell,
  BookOpen,
  Bug,
  FileBarChart,
  FileCheck2,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  TrendingUp,
  Users,
} from 'lucide-react';
import type { SidebarConfig } from './types';

/**
 * Manager sidebar — Pulse prototype (docs/ui-redesign/14-pulse-product-site, vai trò Manager).
 * Học tập của tôi mở cổng học Pulse của chính quản lý.
 *
 */
export const MANAGER_SIDEBAR: SidebarConfig = [
  // ── QUẢN LÝ ĐỘI ──
  { label: 'Quản lý đội' },
  { label: 'Tổng quan', icon: LayoutDashboard, screenId: 'MG-01' },
  { label: 'Nhân viên', icon: Users, screenId: 'MG-02', activeFor: ['MG-03'] },
  { label: 'Năng lực đội ngũ', icon: TrendingUp, screenId: 'MG-05', activeFor: ['MG-04'] },
  { label: 'Kết quả bài làm', icon: FileCheck2, screenId: 'MG-13' },
  { label: 'Báo cáo chu kỳ', icon: FileBarChart, screenId: 'MG-14' },

  // ── CÁC CÔNG CỤ KHÁC ──
  { label: 'Các công cụ khác' },
  { label: 'Đào tạo đội ngũ', icon: GraduationCap, screenId: 'MG-06', activeFor: ['MG-07'] },
  { label: 'Học tập của tôi', icon: BookOpen, screenId: 'EM-01' },
  { label: 'Hoạt động', icon: Bell, screenId: 'SHR-03' },
  { label: 'Góp ý', icon: MessageSquare, screenId: 'SHR-04' },
  { label: 'Báo lỗi', icon: Bug, screenId: 'SHR-05' },
];
