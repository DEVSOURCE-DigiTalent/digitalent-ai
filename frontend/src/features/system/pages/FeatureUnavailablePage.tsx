import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { ENTITLEMENT_LABELS, type Entitlement } from '../../../lib/entitlements';
import { useCurrentUser } from '../../../hooks/use-current-user';
import { ROLES, WORKSPACES, resolveWorkspace } from '../../../lib/roles';

interface FeatureUnavailablePageProps {
  entitlement?: string;
}

/** SHR-05: the feature is not part of the current plan. */
export function FeatureUnavailablePage({ entitlement }: FeatureUnavailablePageProps) {
  const user = useCurrentUser((s) => s.user);
  const isPersonal = !!user && resolveWorkspace(user) === WORKSPACES.PERSONAL;
  const featureName = entitlement ? ENTITLEMENT_LABELS[entitlement as Entitlement] : undefined;
  const canUpgrade = isPersonal || user?.roles.includes(ROLES.OWNER);
  const upgradePath = isPersonal ? '/personal/subscription' : '/enterprise/billing';

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Tính năng chưa có trong gói</h1>
        <p className="text-slate-600 mb-6">
          {featureName ? `"${featureName}" ` : 'Tính năng này '}
          không nằm trong gói hiện tại.{' '}
          {canUpgrade
            ? 'Nâng cấp gói để sử dụng.'
            : 'Vui lòng liên hệ chủ sở hữu tài khoản để nâng cấp gói.'}
        </p>
        {canUpgrade && (
          <Link
            to={upgradePath}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Xem các gói
          </Link>
        )}
      </div>
    </div>
  );
}
