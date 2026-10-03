import {
  LayoutDashboard,
  Building2,
  Users,
  GitBranch,
  BookOpen,
  FileSpreadsheet,
  Briefcase,
  PackageOpen,
  CreditCard,
  FileText,
  Settings,
} from 'lucide-react';
import type { SidebarConfig } from './types';

/**
 * Platform Administrator sidebar configuration according to UI/UX spec v2.1 (§5 & §10).
 * Structured by: TỔNG QUAN · DOANH NGHIỆP · NỘI DUNG NỀN TẢNG · THƯƠNG MẠI · HỆ THỐNG
 */
export const PLATFORM_SIDEBAR: SidebarConfig = [
  {
    label: 'Tổng quan',
    icon: LayoutDashboard,
    screenId: 'PA-01',
    activeFor: ['PLT-01'],
  },
  {
    label: 'Doanh nghiệp',
    icon: Building2,
    items: [
      {
        label: 'Doanh nghiệp',
        screenId: 'PA-02',
        icon: Building2,
        activeFor: ['PA-03', 'PLT-02', 'PLT-03'],
      },
      {
        label: 'Người dùng',
        screenId: 'PA-04',
        icon: Users,
        activeFor: ['PA-05', 'PLT-04-USERS', 'PLT-05-USER-DETAIL'],
      },
    ],
  },
  {
    label: 'Nội dung nền tảng',
    icon: GitBranch,
    items: [
      {
        label: 'Khung năng lực TT02',
        screenId: 'PA-06',
        icon: GitBranch,
        activeFor: ['PA-07', 'PLT-04'],
      },
      {
        label: 'Chương trình đào tạo chuẩn',
        screenId: 'PA-08',
        icon: BookOpen,
        activeFor: ['PA-09', 'PA-10', 'PLT-05', 'PLT-06', 'PLT-06E'],
      },
      {
        label: 'Ngân hàng đánh giá',
        screenId: 'PA-11',
        icon: FileSpreadsheet,
        activeFor: ['PA-12', 'PA-13', 'PLT-07'],
      },
      {
        label: 'Vị trí tham chiếu',
        screenId: 'PA-14',
        icon: Briefcase,
        activeFor: ['PA-15', 'PLT-08', 'PLT-09'],
      },
    ],
  },
  {
    label: 'Thương mại',
    icon: PackageOpen,
    items: [
      {
        label: 'Gói dịch vụ',
        screenId: 'PA-16',
        icon: PackageOpen,
        activeFor: ['PA-17', 'PLT-10'],
      },
      {
        label: 'Subscription',
        screenId: 'PA-18',
        icon: CreditCard,
        activeFor: ['PA-19', 'PLT-11'],
      },
    ],
  },
  {
    label: 'Hệ thống',
    icon: Settings,
    items: [
      {
        label: 'Audit Log',
        screenId: 'PA-20',
        icon: FileText,
        activeFor: ['PLT-12'],
      },
      {
        label: 'Cấu hình',
        screenId: 'PA-21',
        icon: Settings,
        activeFor: ['PLT-13'],
      },
    ],
  },
];
