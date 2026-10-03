import { Navigate } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/use-current-user';
import { getHomePath } from '../../lib/navigation';
import { resolveWorkspace, type Workspace } from '../../lib/roles';

interface RequireWorkspaceProps {
  workspace: Workspace;
  children: React.ReactNode;
}

/** Keeps each portal to its own users: a signed-in user in another workspace is sent to their own home. */
export function RequireWorkspace({ workspace, children }: RequireWorkspaceProps) {
  const user = useCurrentUser((s) => s.user);

  if (!user) return null;
  if (resolveWorkspace(user) !== workspace) return <Navigate to={getHomePath(user)} replace />;
  return <>{children}</>;
}
