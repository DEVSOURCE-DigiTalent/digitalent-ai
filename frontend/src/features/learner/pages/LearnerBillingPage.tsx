import { Link } from 'react-router-dom';
import { EmptyState, PT_BUTTON_SECONDARY, PageIntro } from '../components/ui';

/** IND-18 "/personal/billing": not connected to a payment backend yet. */
export function LearnerBillingPage() {
  return (
    <div data-testid="learner-billing-page" className="grid gap-10">
      <PageIntro label="Thanh toán" title="Lịch sử" accent="thanh toán." />
      <EmptyState
        title="Chưa có dữ liệu thanh toán"
        body="Hóa đơn và các lần gia hạn sẽ hiện ở đây khi cổng thanh toán được kết nối."
        action={<Link to="/personal/subscription" className={PT_BUTTON_SECONDARY}>Về gói cá nhân</Link>}
      />
    </div>
  );
}
