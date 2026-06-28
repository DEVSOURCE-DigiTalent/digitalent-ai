import { useNavigate } from 'react-router-dom';
import { ShieldX } from 'lucide-react';
import { useCurrentUser } from '../../../hooks/use-current-user';
import { getDefaultPath } from '../../../lib/sidebar-config';

/**
 * 403 Forbidden page shown when a user lacks required permission/role.
 * Includes a link back to their role-appropriate dashboard.
 */
export function ForbiddenPage() {
  const navigate = useNavigate();
  const user = useCurrentUser((s) => s.user);
  const homePath = user ? getDefaultPath(user.roles) : '/login';

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-danger-100 text-danger-600 flex items-center justify-center mx-auto mb-4">
          <ShieldX className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
        <p className="text-slate-600 mb-6">
          You do not have permission to access this page. If you believe this is a mistake,
          please contact your administrator.
        </p>
        <button
          onClick={() => navigate(homePath)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
