import { usePermission } from '../../hooks/use-permission';
import { ForbiddenPage } from '../../features/auth/pages/ForbiddenPage';

interface RequirePermissionProps {
  /** Single permission key or array (user needs at least one) */
  permission: string | string[];
  children: React.ReactNode;
  /** Optional custom fallback; defaults to ForbiddenPage */
  fallback?: React.ReactNode;
}

/**
 * Route guard that checks if the current user has the required permission(s).
 * PLATFORM_ADMIN always passes (superuser bypass per RBAC §4).
 * Waits for session hydration if tokens exist before making an access decision.
 * Renders fallback (default: ForbiddenPage) when denied.
 */
export function RequirePermission({ permission, children, fallback }: RequirePermissionProps) {
  const { can, user } = usePermission();
  const hasSession = Boolean(localStorage.getItem('accessToken') || localStorage.getItem('refreshToken'));

  if (hasSession && !user) {
    return null;
  }

  // PLATFORM_ADMIN superuser bypass per RBAC §4
  if (user?.roles.includes('PLATFORM_ADMIN')) {
    return <>{children}</>;
  }

  const allowed = Array.isArray(permission)
    ? permission.some((p) => can(p))
    : can(permission);

  if (!allowed) {
    return <>{fallback ?? <ForbiddenPage />}</>;
  }

  return <>{children}</>;
}
