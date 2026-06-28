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
 * Renders fallback (default: ForbiddenPage) when denied.
 */
export function RequireRole({ roles, children, fallback }: RequireRoleProps) {
  const { is } = usePermission();

  const allowed = roles.some((role) => is(role));

  if (!allowed) {
    return <>{fallback ?? <ForbiddenPage />}</>;
  }

  return <>{children}</>;
}
