import { useCurrentUser } from '@/hooks/use-current-user';
import { MyDevelopmentDashboardPage } from '@/features/employee/pages/MyDevelopmentDashboardPage';
import { OrganizationOverviewPage } from '@/features/organization/pages/OrganizationOverviewPage';
import { TeamCapabilityDashboardPage } from '@/features/team/pages/TeamCapabilityDashboardPage';
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

export function TrialAwareEmployeeDashboardPage() {
  return useIsEnterpriseTrial() ? <TrialDashboardOverview /> : <MyDevelopmentDashboardPage />;
}
