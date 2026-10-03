import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  ShieldCheck,
  Layers,
  FileCheck,
  UserCheck,
  TrendingUp,
  GraduationCap,
  CalendarRange,
  UserPlus,
  BarChart3,
  BookOpen,
  Award,
  ClipboardList,
  Clock,
  PieChart,
  CreditCard,
  Settings,
} from 'lucide-react';
import type { SidebarConfig } from './types';

/**
 * Owner Sidebar configuration according to UI/UX spec v2.1 (§6).
 * Task-driven navigation for organization administration, competency, and training.
 */
export const OWNER_SIDEBAR: SidebarConfig = [
  {
    label: 'Tổng quan',
    icon: LayoutDashboard,
    screenId: 'OW-01',
  },
  {
    label: 'Tổ chức',
    icon: Building2,
    items: [
      {
        label: 'Thành viên',
        screenId: 'OW-02',
        icon: Users,
        activeFor: ['OW-03', 'OW-04', 'OW-05'],
      },
      {
        label: 'Phòng ban',
        screenId: 'OW-06',
        icon: Building2,
        activeFor: ['OW-07', 'OW-08'],
      },
      {
        label: 'Vị trí & Cấp bậc',
        screenId: 'OW-09',
        icon: Briefcase,
        activeFor: ['OW-10', 'OW-11', 'OW-12'],
      },
      {
        label: 'Phân quyền',
        screenId: 'OW-13',
        icon: ShieldCheck,
      },
    ],
  },
  {
    label: 'Năng lực',
    icon: Layers,
    items: [
      {
        label: 'Khung năng lực',
        screenId: 'OW-14',
        icon: Layers,
        activeFor: ['OW-15'],
      },
      {
        label: 'Yêu cầu theo vị trí',
        screenId: 'OW-16',
        icon: FileCheck,
        activeFor: ['OW-17', 'OW-18'],
      },
      {
        label: 'Hồ sơ năng lực',
        screenId: 'OW-19',
        icon: UserCheck,
        activeFor: ['OW-20'],
      },
      {
        label: 'Khoảng trống năng lực',
        screenId: 'OW-21',
        icon: TrendingUp,
        activeFor: ['OW-22'],
      },
    ],
  },
  {
    label: 'Đào tạo',
    icon: GraduationCap,
    items: [
      {
        label: 'Chương trình chuẩn',
        screenId: 'OW-23',
        icon: GraduationCap,
        activeFor: ['OW-24'],
      },
      {
        label: 'Đợt đào tạo',
        screenId: 'OW-25',
        icon: CalendarRange,
        activeFor: ['OW-26', 'OW-27'],
      },
      {
        label: 'Phân công đào tạo',
        screenId: 'OW-28',
        icon: UserPlus,
        activeFor: ['OW-29'],
      },
      {
        label: 'Theo dõi tiến độ',
        screenId: 'OW-30',
        icon: BarChart3,
      },
      {
        label: 'Khóa nội bộ',
        screenId: 'OW-31',
        icon: BookOpen,
        activeFor: ['OW-32', 'OW-33'],
      },
    ],
  },
  {
    label: 'Đánh giá & Minh chứng',
    icon: Award,
    items: [
      {
        label: 'Kết quả đánh giá',
        screenId: 'OW-34',
        icon: Award,
      },
      {
        label: 'Nhiệm vụ thực tế',
        screenId: 'OW-35',
        icon: ClipboardList,
        activeFor: ['OW-36', 'OW-37', 'MG-08', 'MG-09', 'MG-10'],
      },
      {
        label: 'Chờ duyệt',
        screenId: 'OW-38',
        icon: Clock,
        activeFor: ['OW-39', 'MG-11', 'MG-12'],
      },
    ],
  },
  {
    label: 'Báo cáo',
    icon: PieChart,
    screenId: 'OW-40',
  },
  {
    label: 'Gói dịch vụ',
    icon: CreditCard,
    screenId: 'OW-41',
    activeFor: ['OW-42', 'OW-43'],
  },
  {
    label: 'Cài đặt',
    icon: Settings,
    items: [
      {
        label: 'Cài đặt tổ chức',
        screenId: 'OW-44',
        icon: Settings,
        activeFor: ['ADM-07'],
      },
      {
        label: 'Nhật ký tổ chức',
        screenId: 'OW-45',
        icon: Clock,
        activeFor: ['ADM-11'],
      },
    ],
  },
];
