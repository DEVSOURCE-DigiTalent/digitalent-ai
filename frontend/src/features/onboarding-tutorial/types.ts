export type UserRoleType = 'OWNER' | 'MANAGER' | 'EMPLOYEE';

export interface RoleTutorialStep {
  id: string;
  title: string;
  description: string;
  badge: string;
  targetSelector: string;
  targetPosition?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  actionRoute?: string;
  actionText?: string;
  tips?: string;
}

export interface ChecklistTask {
  id: string;
  title: string;
  subtitle: string;
  route: string;
  targetSelector?: string;
  badge?: string;
}

export interface RoleTutorialConfig {
  role: UserRoleType;
  roleName: string;
  welcomeTitle: string;
  welcomeDescription: string;
  steps: RoleTutorialStep[];
  checklist: ChecklistTask[];
}
