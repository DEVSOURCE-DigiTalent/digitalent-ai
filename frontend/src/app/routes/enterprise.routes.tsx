import { Navigate, type RouteObject } from 'react-router-dom';
import { EnterpriseLayout } from '../layouts/EnterpriseLayout';
import { FocusLayout } from '../layouts/FocusLayout';
import { AuthGuard } from '../../components/guards/AuthGuard';
import { RequireOnboarded } from '../../components/guards/RequireOnboarded';
import { RequireWorkspace } from '../../components/guards/RequireWorkspace';
import { WORKSPACES } from '../../lib/roles';
import { useCurrentUser } from '../../hooks/use-current-user';
import { getHomePath } from '../../lib/navigation';
import { ENTERPRISE_SCREENS } from '../../lib/screens/enterprise';
import { buildRoutes } from './build-routes';
import { ENTERPRISE_PAGES } from './enterprise-pages';

function EnterpriseHome() {
  const user = useCurrentUser((s) => s.user);
  return <Navigate to={user ? getHomePath(user) : '/login'} replace />;
}

/** Immersive learning experiences without sidebar (assessment attempt, lesson viewer). */
const FOCUS_SCREEN_IDS = new Set(['EM-08', 'EM-11', 'EMP-06', 'EMP-08']);

export const enterpriseRoutes: RouteObject[] = [
  // Immersive / Focused pages (no sidebar, minimal topbar with Exit button)
  {
    path: '/enterprise',
    element: (
      <AuthGuard>
        <RequireWorkspace workspace={WORKSPACES.ENTERPRISE}>
          <RequireOnboarded>
            <FocusLayout exitPath="/enterprise/me" />
          </RequireOnboarded>
        </RequireWorkspace>
      </AuthGuard>
    ),
    children: buildRoutes(
      ENTERPRISE_SCREENS.filter((s) => FOCUS_SCREEN_IDS.has(s.id)),
      ENTERPRISE_PAGES,
      '/enterprise',
    ),
  },
  // Standard enterprise shell pages (with RoleSidebar, Topbar, etc.)
  {
    path: '/enterprise',
    element: <EnterpriseLayout />,
    children: [
      { index: true, element: <EnterpriseHome /> },
      { path: 'overview', element: <Navigate to="/enterprise/dashboard" replace /> },
      ...buildRoutes(
        ENTERPRISE_SCREENS.filter((s) => !FOCUS_SCREEN_IDS.has(s.id)),
        ENTERPRISE_PAGES,
        '/enterprise',
      ),
    ],
  },
];
