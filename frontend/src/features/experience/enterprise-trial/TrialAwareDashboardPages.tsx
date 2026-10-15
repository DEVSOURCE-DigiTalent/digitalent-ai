import { useCurrentUser } from '@/hooks/use-current-user';
import { OwnerOverviewPage } from '@/features/organization/pages/OwnerOverviewPage';
import { ManagerOverviewPage } from '@/features/pulse-manager/pages/ManagerOverviewPage';
import { PulseTodayPage } from '@/features/pulse-employee/pages/PulseTodayPage';
import { TrialDashboardOverview } from './TrialDashboardOverview';

function useIsEnterpriseTrial(): boolean {
  return useCurrentUser((state) => {
    const user = state.user;
    if (!user) return false;
    return (user.enterpriseTrialStatus != null && user.enterpriseTrialStatus !== 'converted')
      || user.subscription?.planCode === 'ENT_TRIAL';
  });
}

export function TrialAwareOwnerDashboardPage() {
  return useIsEnterpriseTrial() ? <TrialDashboardOverview /> : <OwnerOverviewPage />;
}

export function TrialAwareManagerDashboardPage() {
  return useIsEnterpriseTrial() ? <TrialDashboardOverview /> : <ManagerOverviewPage />;
}

/** Hôm nay của nhân viên Pulse; tài khoản dùng thử doanh nghiệp (luồng hướng dẫn cũ) vẫn thấy tổng quan dùng thử. */
export function TrialAwarePulseTodayPage() {
  return useIsEnterpriseTrial() ? <TrialDashboardOverview /> : <PulseTodayPage />;
}
