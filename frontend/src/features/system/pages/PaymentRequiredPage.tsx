import { Link } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import { useCurrentUser } from '../../../hooks/use-current-user';
import { ROLES, WORKSPACES, resolveWorkspace } from '../../../lib/roles';

/** SHR-06: subscription expired or payment pending. Data is kept; only access is blocked. */
export function PaymentRequiredPage() {
  const user = useCurrentUser((s) => s.user);
  const isPersonal = !!user && resolveWorkspace(user) === WORKSPACES.PERSONAL;
  const canPay = isPersonal || user?.roles.includes(ROLES.OWNER);
  const billingPath = isPersonal ? '/personal/subscription' : '/enterprise/billing';

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-danger-100 text-danger-600 flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Gói dịch vụ đã hết hạn</h1>
        <p className="text-slate-600 mb-6">
          Quyền truy cập đang tạm dừng cho đến khi thanh toán. Dữ liệu của bạn vẫn được giữ nguyên.
          {!canPay && ' Vui lòng liên hệ chủ sở hữu tài khoản để gia hạn.'}
        </p>
        {canPay && (
          <Link
            to={billingPath}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Gia hạn gói
          </Link>
        )}
      </div>
    </div>
  );
}
