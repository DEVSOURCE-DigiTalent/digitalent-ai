import {
  Compass,
  UserCheck,
  TrendingUp,
  History,
  Route,
  BookOpen,
  Award,
  CheckSquare,
  Trophy,
} from 'lucide-react';
import type { SidebarConfig } from './types';

/**
 * Employee Sidebar configuration according to UI/UX spec v2.1 (§8).
 * Centered on personal learning, skill development, practical tasks, and achievements.
 */
export const EMPLOYEE_SIDEBAR: SidebarConfig = [
  {
    label: 'Tổng quan',
    icon: Compass,
    screenId: 'EM-01',
  },
  {
    label: 'Năng lực của tôi',
    icon: UserCheck,
    items: [
      {
        label: 'Hồ sơ năng lực',
        screenId: 'EM-02',
        icon: UserCheck,
      },
      {
        label: 'Khoảng trống năng lực',
        screenId: 'EM-03',
        icon: TrendingUp,
      },
      {
        label: 'Dòng thời gian minh chứng',
        screenId: 'EM-04',
        icon: History,
      },
    ],
  },
  {
    label: 'Học tập',
    icon: BookOpen,
    items: [
      {
        label: 'Lộ trình của tôi',
        screenId: 'EM-05',
        icon: Route,
      },
      {
        label: 'Khóa học của tôi',
        screenId: 'EM-06',
        icon: BookOpen,
        activeFor: ['EM-07', 'EM-08'],
      },
    ],
  },
  {
    label: 'Đánh giá',
    icon: Award,
    screenId: 'EM-09',
    activeFor: ['EM-10', 'EM-11', 'EM-12', 'EM-13'],
  },
  {
    label: 'Nhiệm vụ thực tế',
    icon: CheckSquare,
    screenId: 'EM-14',
    activeFor: ['EM-15', 'EM-16', 'EM-17'],
  },
  {
    label: 'Thành tựu',
    icon: Trophy,
    screenId: 'EM-18',
  },
];
