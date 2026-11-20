import { useEffect } from 'react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ROLES, normalizeRoles } from '@/lib/roles';
import { isTrialLimitedOwner } from '@/lib/trial-lock';
import type { UserRoleType } from './types';
import { useOnboardingStore } from './onboarding-store';
import { SpotlightOverlay } from './SpotlightOverlay';
import { OnboardingChecklistWidget } from './OnboardingChecklistWidget';
import './onboarding.css';

interface RoleTutorialContainerProps {
  forcedRole?: UserRoleType;
}

export function RoleTutorialContainer({ forcedRole }: RoleTutorialContainerProps) {
  const user = useCurrentUser((s) => s.user);
  const initializeForUser = useOnboardingStore((s) => s.initializeForUser);

  useEffect(() => {
    if (!user) return;

    let targetRole: UserRoleType = 'EMPLOYEE';
    if (forcedRole) {
      targetRole = forcedRole;
    } else {
      const normalized = normalizeRoles(user.roles ?? []);
      if (normalized.includes(ROLES.OWNER)) {
        // Enterprise trial before the first course: the guide follows the trial journey (most of the menu is locked).
        targetRole = isTrialLimitedOwner(user) ? 'OWNER_TRIAL' : 'OWNER';
      } else if (normalized.includes(ROLES.MANAGER)) {
        targetRole = 'MANAGER';
      } else {
        targetRole = 'EMPLOYEE';
      }
    }

    initializeForUser(user.id || user.email, targetRole);
  }, [user, forcedRole, initializeForUser]);

  if (!user) return null;

  return (
    <>
      <SpotlightOverlay />
      <OnboardingChecklistWidget />
    </>
  );
}
