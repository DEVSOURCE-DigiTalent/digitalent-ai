import {
  Award,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  ClipboardCheck,
  Compass,
  CreditCard,
  LayoutDashboard,
  LockKeyhole,
  Route,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import type { SidebarConfig } from './types';

/**
 * Trial navigation deliberately exposes only the shortest path to value.
 * Premium pages still use the normal screen entitlement guard, so a locked
 * item is a truthful product preview instead of a second demo application.
 */
export const TRIAL_OWNER_SIDEBAR: SidebarConfig = [
  { label: 'Tổng quan', icon: LayoutDashboard, screenId: 'OW-01' },
  {
    label: 'Thiết lập',
    icon: BriefcaseBusiness,
    items: [
      { label: 'Thành viên', icon: Users, screenId: 'OW-02', activeFor: ['OW-03'] },
      { label: 'Vị trí công việc', icon: BriefcaseBusiness, screenId: 'OW-09', activeFor: ['OW-10'] },
      { label: 'Yêu cầu theo vị trí', icon: ClipboardCheck, screenId: 'OW-16', activeFor: ['OW-17', 'OW-18'] },
    ],
  },
  {
    label: 'Kết quả',
    icon: BarChart3,
    items: [
      { label: 'Kết quả đánh giá', icon: Award, screenId: 'OW-34' },
      { label: 'Khoảng trống năng lực', icon: TrendingUp, screenId: 'OW-21', activeFor: ['OW-22'] },
    ],
  },
  {
    label: 'Khám phá thêm',
    icon: Compass,
    items: [
      { label: 'Chương trình chuẩn', icon: BookOpen, screenId: 'OW-23', activeFor: ['OW-24'] },
      { label: 'Khóa học nội bộ', icon: LockKeyhole, screenId: 'OW-31', activeFor: ['OW-32', 'OW-33'] },
    ],
  },
  { label: 'Nâng cấp', icon: CreditCard, screenId: 'OW-41', activeFor: ['OW-42', 'OW-43'] },
];

export const TRIAL_MANAGER_SIDEBAR: SidebarConfig = [
  { label: 'Tổng quan nhóm', icon: LayoutDashboard, screenId: 'MG-01' },
  {
    label: 'Nhóm của tôi',
    icon: Users,
    items: [
      { label: 'Thành viên', icon: Users, screenId: 'MG-02', activeFor: ['MG-03'] },
      { label: 'Năng lực nhóm', icon: BarChart3, screenId: 'MG-04' },
    ],
  },
  { label: 'Phát triển cá nhân', icon: Compass, screenId: 'EM-01' },
];

export const TRIAL_EMPLOYEE_SIDEBAR: SidebarConfig = [
  { label: 'Tổng quan', icon: Compass, screenId: 'EM-01' },
  { label: 'Đánh giá đầu vào', icon: ClipboardCheck, screenId: 'EM-09', activeFor: ['EM-10', 'EM-11', 'EM-12', 'EM-13'] },
  {
    label: 'Kết quả của tôi',
    icon: UserCheck,
    items: [
      { label: 'Hồ sơ năng lực', icon: UserCheck, screenId: 'EM-02' },
      { label: 'Khoảng trống năng lực', icon: TrendingUp, screenId: 'EM-03' },
      { label: 'Lộ trình học', icon: Route, screenId: 'EM-05' },
    ],
  },
];
