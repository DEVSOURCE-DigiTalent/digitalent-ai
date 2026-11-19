import { Award, Bell, Bug, Compass, MessageSquare, Route } from 'lucide-react';
import type { SidebarConfig } from './types';

/**
 * Nhân viên dùng cổng Pulse (thanh đầu trang Hôm nay / Lộ trình). Menu bên này chỉ xuất hiện khi nhân viên
 * mở một màn dùng chung của doanh nghiệp (tài khoản, thông báo…) và dẫn về đúng các màn Pulse.
 */
export const EMPLOYEE_SIDEBAR: SidebarConfig = [
  { label: 'Hôm nay', icon: Compass, screenId: 'EM-01' },
  { label: 'Lộ trình', icon: Route, screenId: 'EM-02', activeFor: ['EM-05', 'EM-06', 'EM-07', 'EM-12', 'EM-15'] },
  { label: 'Kết quả đã xác nhận', icon: Award, screenId: 'EM-08', activeFor: ['EM-09'] },
  { label: 'Hoạt động', icon: Bell, screenId: 'EM-10' },
  { label: 'Góp ý', icon: MessageSquare, screenId: 'EM-13' },
  { label: 'Báo lỗi', icon: Bug, screenId: 'EM-14' },
];
