import { useCurrentUser } from '@/hooks/use-current-user';
import { ROLES } from '@/lib/roles';
import { MyDevelopmentDashboardPage } from '@/features/employee/pages/MyDevelopmentDashboardPage';
import { MyLearningPathPage } from '@/features/employee/pages/MyLearningPathPage';
import { ManagerDevelopmentDashboardPage } from './ManagerDevelopmentDashboardPage';
import { ManagerLearningPathPage } from './ManagerLearningPathPage';

export function PersonalDashboardPage() {
  const isManager = useCurrentUser((state) => state.hasRole(ROLES.MANAGER));
  return isManager ? <ManagerDevelopmentDashboardPage /> : <MyDevelopmentDashboardPage />;
}

export function PersonalLearningPathPage() {
  const isManager = useCurrentUser((state) => state.hasRole(ROLES.MANAGER));
  return isManager ? <ManagerLearningPathPage /> : <MyLearningPathPage />;
}
