import { Link } from 'react-router-dom';
import { EmptyState, PT_BUTTON_SECONDARY, PersonalPageHeader } from '../components/ui';

/** IND-18 "/personal/billing": not connected to a payment backend yet. */
export function LearnerBillingPage() {
  return (
    <div data-testid="learner-billing-page" className="grid gap-10">
      <PersonalPageHeader label="Gói & thanh toán" title="Lịch sử thanh toán" lead="Các giao dịch và lần gia hạn của gói học." />
      <EmptyState
        title="Chưa có dữ liệu thanh toán"
        body="Hóa đơn và các lần gia hạn sẽ hiện ở đây khi cổng thanh toán được kết nối."
        action={<Link to="/personal/subscription" className={PT_BUTTON_SECONDARY}>Về gói cá nhân</Link>}
      />
    </div>
  );
}
