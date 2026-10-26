import { usePermission } from '../../hooks/use-permission';
import { ForbiddenPage } from '../../features/auth/pages/ForbiddenPage';

interface RequireRoleProps {
  /** User must have at least one of these roles */
  roles: string[];
  children: React.ReactNode;
  /** Optional custom fallback; defaults to ForbiddenPage */
  fallback?: React.ReactNode;
}

/**
 * Route guard that checks if the current user has at least one of the given roles.
 * Waits for session hydration if tokens exist before making an access decision.
 * Renders fallback (default: ForbiddenPage) when denied.
 */
export function RequireRole({ roles, children, fallback }: RequireRoleProps) {
  const { is, user } = usePermission();
  const hasSession = Boolean(localStorage.getItem('accessToken') || localStorage.getItem('refreshToken'));

  if (hasSession && !user) {
    return null;
  }

  const allowed = roles.some((role) => is(role));

  if (!allowed) {
    return <>{fallback ?? <ForbiddenPage />}</>;
  }

  return <>{children}</>;
}
