import { useSyncExternalStore } from 'react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { getHomePath } from '@/lib/navigation';
import { useLandingContent } from '../landing-content-context';

export interface LandingCta {
  to: string;
  isSignedIn: boolean;
}

function hasStoredToken(): boolean {
  try {
    return Boolean(localStorage.getItem('accessToken'));
  } catch {
    return false;
  }
}

/** Login or logout in another tab fires "storage" here, so the call to action follows it. */
function subscribeToStorage(onChange: () => void): () => void {
  window.addEventListener('storage', onChange);
  return () => window.removeEventListener('storage', onChange);
}

/**
 * Where the main call to action leads. A visitor goes to pricing (enterprise) or to the free sign-up
 * (individual); a signed-in user goes to the home of their workspace. A stored token without a loaded
 * profile goes to the portal of this page, whose AuthGuard restores the profile or sends an expired
 * session to /login.
 */
export function useLandingCta(): LandingCta {
  const { cta } = useLandingContent();
  const user = useCurrentUser((state) => state.user);
  const hasToken = useSyncExternalStore(subscribeToStorage, hasStoredToken, () => false);
  if (user) return { to: getHomePath(user), isSignedIn: true };
  if (hasToken) return { to: cta.signedInTo, isSignedIn: true };
  return { to: cta.guestTo, isSignedIn: false };
}
