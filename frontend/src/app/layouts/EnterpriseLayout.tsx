import { MainLayout } from '../../components/layout/MainLayout';
import { AuthGuard } from '../../components/guards/AuthGuard';
import { RequireOnboarded } from '../../components/guards/RequireOnboarded';
import { RequireWorkspace } from '../../components/guards/RequireWorkspace';
import { ENTERPRISE_PORTAL } from '../../lib/portals';
import { WORKSPACES } from '../../lib/roles';

import { useCurrentUser } from '../../hooks/use-current-user';
import { RND_SIDEBAR, sidebarFor } from '../../lib/sidebars';
import { useEnterpriseTheme } from '../../hooks/use-enterprise-theme';
import { isSubscriptionUsable } from '../../lib/personal-access';
import { AssistantWidget } from '../../features/assistant/components/AssistantWidget';
import { RoleTutorialContainer } from '../../features/onboarding-tutorial';

export function EnterpriseLayout() {
  const user = useCurrentUser((s) => s.user);
  const subscriptionStatus = useCurrentUser((s) => s.getSubscriptionStatus)();
  const isUnpaid = subscriptionStatus && !isSubscriptionUsable(subscriptionStatus) ? true : undefined;
  const sidebar = sidebarFor(user);
  
  useEnterpriseTheme(); // Mount theme

  return (
    <AuthGuard>
      <RequireWorkspace workspace={WORKSPACES.ENTERPRISE}>
        <RequireOnboarded>
          <div data-testid="enterprise-layout">
            <MainLayout portal={ENTERPRISE_PORTAL} sidebarConfig={sidebar} isUnpaid={isUnpaid} />
            {!isUnpaid && <AssistantWidget />}
            {sidebar !== RND_SIDEBAR && <RoleTutorialContainer />}
          </div>
        </RequireOnboarded>
      </RequireWorkspace>
    </AuthGuard>
  );
}
