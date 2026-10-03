import { Navigate } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/use-current-user';
import { resolveNextStep } from '../../lib/navigation';

/**
 * Keeps a new account in its onboarding: until it has paid, signed contract (enterprise),
 * finished the setup wizard, and verified email, every workspace page sends it to the step it is on.
 */
export function RequireOnboarded({ children }: { children: React.ReactNode }) {
  const user = useCurrentUser((s) => s.user);

  if (!user) return <Navigate to="/login" replace />;

  if (user.onboardingStatus || user.emailVerified === false) {
    return <Navigate to={resolveNextStep(user)} replace />;
  }

  return <>{children}</>;
}
