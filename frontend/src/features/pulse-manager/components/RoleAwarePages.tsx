import { OwnerReviewsPage } from '@/features/organization/pages/OwnerReviewsPage';
import { NotificationsPage } from '@/features/notifications/pages/NotificationsPage';
import { ManagerEvidencePage } from '../pages/ManagerEvidencePage';
import { ManagerActivityPage } from '../pages/ManagerActivityPage';
import { useIsPulseManager } from '../lib/use-is-pulse-manager';

/** OW-38 / MG-11: chủ doanh nghiệp giữ hàng đợi của mình; quản lý thấy minh chứng thực tế theo Pulse. */
export function RoleAwareEvidencePage() {
  return useIsPulseManager() ? <ManagerEvidencePage /> : <OwnerReviewsPage />;
}

/** SHR-03: cùng logic thông báo, trình bày theo không gian của người xem. */
export function RoleAwareNotificationsPage() {
  return useIsPulseManager() ? <ManagerActivityPage /> : <NotificationsPage />;
}
