import {
  Award,
  Bell,
  BookOpen,
  ClipboardList,
  Compass,
  FileBarChart,
  FlaskConical,
  Layers,
  LayoutDashboard,
  TrendingUp,
  Users,
  UsersRound,
} from 'lucide-react';
import type { SidebarConfig } from './types';

/**
 * Owner sidebar — Pulse prototype flat layout.
 * Two groups: primary owner tasks + secondary tools.
 */
export const OWNER_SIDEBAR: SidebarConfig = [
  // ── CHỦ DOANH NGHIỆP ──
  { label: 'Chủ doanh nghiệp' },
  { label: 'Tổng quan', icon: LayoutDashboard, screenId: 'OW-01' },
  { label: 'Đánh giá đội ngũ', icon: FlaskConical, screenId: 'OW-T1' },
  { label: 'Khung năng lực', icon: Compass, screenId: 'OW-05', activeFor: ['OW-16', 'OW-17', 'OW-18'] },
  { label: 'Nhân sự', icon: Users, screenId: 'OW-02', activeFor: ['OW-03', 'OW-06', 'OW-07', 'OW-09', 'OW-10', 'OW-13'] },
  { label: 'Năng lực Khoảng cách', icon: TrendingUp, screenId: 'OW-21', activeFor: ['OW-22', 'OW-19', 'OW-20'] },
  { label: 'Khóa học', icon: BookOpen, screenId: 'OW-23', activeFor: ['OW-24', 'OW-28', 'OW-29', 'OW-30', 'OW-31', 'OW-32', 'OW-33', 'OW-34'] },
  { label: 'Báo cáo chu kỳ', icon: FileBarChart, screenId: 'OW-40' },

  // ── CÁC CÔNG CỤ KHÁC ──
  { label: 'Các công cụ khác' },
  { label: 'Khung năng lực chung', icon: Layers, screenId: 'OW-14', activeFor: ['OW-15'] },
  { label: 'Nhóm đào tạo', icon: UsersRound, screenId: 'OW-25', activeFor: ['OW-26', 'OW-27'] },
  { label: 'Nhiệm vụ thực tế', icon: ClipboardList, screenId: 'MG-08', activeFor: ['OW-35', 'OW-36', 'OW-37', 'MG-09', 'MG-10', 'OW-38', 'OW-39', 'MG-11', 'MG-12'] },
  { label: 'Chứng nhận', icon: Award, screenId: 'OW-46', activeFor: ['OW-47'] },
  { label: 'Hoạt động', icon: Bell, screenId: 'SHR-03' },
];
