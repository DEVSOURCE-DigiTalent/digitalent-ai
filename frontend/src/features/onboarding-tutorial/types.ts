import type { LucideIcon } from 'lucide-react';

/** Which guide a user gets. `OWNER_TRIAL` = an owner of an enterprise trial that has bought no course yet. */
export type UserRoleType = 'OWNER' | 'OWNER_TRIAL' | 'MANAGER' | 'EMPLOYEE';

export interface RoleTutorialStep {
  id: string;
  title: string;
  description: string;
  /** The place the step is about, as named in the menu. */
  badge: string;
  icon?: LucideIcon;
  /** CSS selectors tried in order; the first one visible on screen is lit up. None visible: the card sits in the middle. */
  targetSelector: string | string[];
  targetPosition?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  actionRoute?: string;
  actionText?: string;
  tips?: string;
  /** The owner may skip this step (shown as "Không bắt buộc"). */
  optional?: boolean;
  /** A closing hint, not a step of the journey: not numbered, not listed on the welcome card. */
  kind?: 'step' | 'tip';
}

/** What the trial journey checklist reads from the real data (`useTrialJourney`). */
export type TrialJourneyKey = 'invited' | 'levels' | 'results' | 'purchased';

export interface ChecklistTask {
  id: string;
  title: string;
  subtitle: string;
  route: string;
  targetSelector?: string;
  badge?: string;
  /** Done from the real data instead of a manual tick (enterprise trial owner). */
  progress?: TrialJourneyKey;
  optional?: boolean;
}

export interface RoleTutorialConfig {
  role: UserRoleType;
  roleName: string;
  welcomeTitle: string;
  welcomeDescription: string;
  /** Opens on a welcome card listing the journey before the first step. */
  intro?: { eyebrow: string };
  steps: RoleTutorialStep[];
  /** Empty: no checklist widget. */
  checklist: ChecklistTask[];
  /** Name of the checklist widget (default "Nhiệm vụ tân thủ"). */
  checklistTitle?: string;
}
