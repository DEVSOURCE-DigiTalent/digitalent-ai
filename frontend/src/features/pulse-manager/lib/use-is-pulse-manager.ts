import { useCurrentUser } from '@/hooks/use-current-user';
import { sidebarFor } from '@/lib/sidebars';
import { MANAGER_SIDEBAR } from '@/lib/sidebars/manager';

/** Người xem đang ở không gian Quản lý theo Pulse (cùng điều kiện với khung MainLayout). */
export function useIsPulseManager(): boolean {
  return useCurrentUser((s) => sidebarFor(s.user) === MANAGER_SIDEBAR);
}
