import { Navigate, type RouteObject } from 'react-router-dom';
import { EnterpriseLayout } from '../layouts/EnterpriseLayout';
import { PulseEmployeeLayout } from '../layouts/PulseEmployeeLayout';
import { useCurrentUser } from '../../hooks/use-current-user';
import { getHomePath } from '../../lib/navigation';
import { EMPLOYEE_SCREENS, ENTERPRISE_SCREENS } from '../../lib/screens/enterprise';
import { buildRoutes } from './build-routes';
import { ENTERPRISE_PAGES } from './enterprise-pages';

function EnterpriseHome() {
  const user = useCurrentUser((s) => s.user);
  return <Navigate to={user ? getHomePath(user) : '/login'} replace />;
}

/** Cổng nhân viên Pulse: khung riêng (PulseEmployeeLayout, thanh đầu trang), không dùng menu bên của doanh nghiệp. */
const PULSE_EMPLOYEE_SCREEN_IDS = new Set(EMPLOYEE_SCREENS.map((s) => s.id));

export const enterpriseRoutes: RouteObject[] = [
  {
    path: '/enterprise',
    element: <PulseEmployeeLayout />,
    children: buildRoutes(
      ENTERPRISE_SCREENS.filter((s) => PULSE_EMPLOYEE_SCREEN_IDS.has(s.id)),
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
      // Backwards-compatible link: trial accounts now use the normal role dashboard and shell.
      { path: '/enterprise/trial', element: <EnterpriseHome /> },
      { path: 'overview', element: <Navigate to="/enterprise/dashboard" replace /> },
      ...buildRoutes(
        ENTERPRISE_SCREENS.filter((s) => !PULSE_EMPLOYEE_SCREEN_IDS.has(s.id)),
        ENTERPRISE_PAGES,
        '/enterprise',
      ),
    ],
  },
];
