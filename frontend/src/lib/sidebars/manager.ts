import {
  LayoutDashboard,
  Users,
  Layers,
  TrendingUp,
  BarChart3,
  ClipboardList,
  Clock,
  Compass,
  BookOpen,
  UserCheck,
  CheckSquare,
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
    items: [
      {
        label: 'Bảng phát triển',
        screenId: 'EM-01',
        icon: Compass,
      },
      {
        label: 'Học tập của tôi',
        screenId: 'EM-06',
        icon: BookOpen,
        activeFor: ['EM-05', 'EM-07', 'EM-08'],
      },
      {
        label: 'Năng lực của tôi',
        screenId: 'EM-02',
        icon: UserCheck,
        activeFor: ['EM-03', 'EM-04'],
      },
      {
        label: 'Nhiệm vụ của tôi',
        screenId: 'EM-14',
        icon: CheckSquare,
        activeFor: ['EM-15', 'EM-16', 'EM-17'],
      },
    ],
  },
];
