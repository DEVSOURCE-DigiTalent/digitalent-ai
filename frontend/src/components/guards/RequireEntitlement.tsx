import { useCurrentUser } from '../../hooks/use-current-user';
import { FeatureUnavailablePage } from '../../features/system/pages/FeatureUnavailablePage';

interface RequireEntitlementProps {
  /** Entitlement key from lib/entitlements.ts. */
  entitlement: string;
  children: React.ReactNode;
}

/**
 * Plan gate (FLOW-07, step 2): the plan must include the feature.
 * Subscription status is checked by RequireActiveSubscription; role and data scope stay with
 * RequireRole / RequirePermission.
 */
export function RequireEntitlement({ entitlement, children }: RequireEntitlementProps) {
  const hasEntitlement = useCurrentUser((s) => s.hasEntitlement);

  if (!hasEntitlement(entitlement)) return <FeatureUnavailablePage entitlement={entitlement} />;
  return <>{children}</>;
}
