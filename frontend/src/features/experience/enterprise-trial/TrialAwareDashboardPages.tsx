import { useCurrentUser } from '@/hooks/use-current-user';
import { OrganizationOverviewPage } from '@/features/organization/pages/OrganizationOverviewPage';
import { TeamCapabilityDashboardPage } from '@/features/manager/pages/team/TeamCapabilityDashboardPage';
import { PulseTodayPage } from '@/features/pulse-employee/pages/PulseTodayPage';
import { TrialDashboardOverview } from './TrialDashboardOverview';

function useIsEnterpriseTrial(): boolean {
  return useCurrentUser((state) => {
    const user = state.user;
    if (!user) return false;
    return (user.enterpriseTrialStatus !== undefined && user.enterpriseTrialStatus !== 'converted')
      || user.subscription?.planCode === 'ENT_TRIAL';
  });
}

export function TrialAwareOwnerDashboardPage() {
  return useIsEnterpriseTrial() ? <TrialDashboardOverview /> : <OrganizationOverviewPage />;
}

export function TrialAwareManagerDashboardPage() {
  return useIsEnterpriseTrial() ? <TrialDashboardOverview /> : <TeamCapabilityDashboardPage />;
}

/** Hôm nay của nhân viên Pulse; tài khoản dùng thử doanh nghiệp (luồng hướng dẫn cũ) vẫn thấy tổng quan dùng thử. */
export function TrialAwarePulseTodayPage() {
  return useIsEnterpriseTrial() ? <TrialDashboardOverview /> : <PulseTodayPage />;
}
