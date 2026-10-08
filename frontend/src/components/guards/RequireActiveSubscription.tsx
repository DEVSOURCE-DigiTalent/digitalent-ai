import { useCurrentUser } from '../../hooks/use-current-user';
import { isSubscriptionUsable } from '../../lib/personal-access';
import { PaymentRequiredPage } from '../../features/system/pages/PaymentRequiredPage';

interface RequireActiveSubscriptionProps {
  children: React.ReactNode;
}

/**
 * Plan gate (FLOW-07, step 1): while the subscription is expired or unpaid the page is replaced by
 * the "payment required" screen. The shell stays, so the owner can still open billing to renew.
 */
export function RequireActiveSubscription({ children }: RequireActiveSubscriptionProps) {
  const status = useCurrentUser((s) => s.getSubscriptionStatus)();
  if (status && !isSubscriptionUsable(status)) return <PaymentRequiredPage />;
  return <>{children}</>;
}
