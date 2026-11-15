import { NotificationsPage } from '@/features/notifications/pages/NotificationsPage';
import { ManagerActivityPage } from '../pages/ManagerActivityPage';
import { useIsPulseManager } from '../lib/use-is-pulse-manager';

/** SHR-03: cùng logic thông báo, trình bày theo không gian của người xem. */
export function RoleAwareNotificationsPage() {
  return useIsPulseManager() ? <ManagerActivityPage /> : <NotificationsPage />;
}
