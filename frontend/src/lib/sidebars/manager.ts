import {
  LayoutDashboard,
  Users,
  Layers,
  TrendingUp,
  BarChart3,
  ClipboardList,
  Clock,
  Compass,
  CheckSquare,
  Award,
  Route,
  FileCheck2,
} from 'lucide-react';
import type { SidebarConfig } from './types';

/**
 * Manager Sidebar configuration according to UI/UX spec v2.1 (§7).
 * Team-scoped management, practical evaluation, and personal growth.
 */
export const MANAGER_SIDEBAR: SidebarConfig = [
  {
    label: 'Tổng quan nhóm',
    icon: LayoutDashboard,
    screenId: 'MG-01',
  },
  {
    // Mock #/review: quản lý chấm bài cuối của mỗi khóa (có lý do, hai lần nộp, cờ hỗ trợ).
    label: 'Bài cuối khóa',
    icon: FileCheck2,
    screenId: 'MG-13',
  },
  {
    label: 'Nhóm của tôi',
    icon: Users,
    items: [
      {
        label: 'Thành viên',
        screenId: 'MG-02',
        icon: Users,
        activeFor: ['MG-03'],
      },
      {
        label: 'Năng lực nhóm',
        screenId: 'MG-04',
        icon: Layers,
      },
      {
        label: 'Khoảng trống năng lực',
        screenId: 'MG-05',
        icon: TrendingUp,
      },
      {
        label: 'Tiến độ đào tạo',
        screenId: 'MG-06',
        icon: BarChart3,
        activeFor: ['MG-07'],
      },
    ],
  },
  {
    label: 'Đánh giá thực tế',
    icon: ClipboardList,
    items: [
      {
        label: 'Nhiệm vụ',
        screenId: 'OW-35',
        icon: ClipboardList,
        activeFor: ['OW-36', 'OW-37', 'MG-08', 'MG-09', 'MG-10'],
      },
      {
        label: 'Chờ đánh giá',
        screenId: 'OW-38',
        icon: Clock,
        activeFor: ['OW-39', 'MG-11', 'MG-12'],
      },
    ],
  },
  {
    label: 'Cá nhân',
    icon: Compass,
    // Cổng nhân viên Pulse: quản lý vẫn tự học trên lộ trình của chính mình.
    items: [
      { label: 'Hôm nay', screenId: 'EM-01', icon: Compass },
      { label: 'Lộ trình của tôi', screenId: 'EM-02', icon: Route, activeFor: ['EM-04', 'EM-05', 'EM-06'] },
      { label: 'Thực hành', screenId: 'EM-03', icon: CheckSquare, activeFor: ['EM-07'] },
      { label: 'Kết quả đã xác nhận', screenId: 'EM-08', icon: Award, activeFor: ['EM-09'] },
    ],
  },
];
