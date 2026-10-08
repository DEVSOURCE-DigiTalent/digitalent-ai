import type { TrialContextDto } from '@/services/enterprise-trial.service';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export const TRIAL_STEP_LABELS: Record<string, string> = {
  position: 'Chọn vị trí mẫu',
  invite: 'Mời người tham gia',
  assessment: 'Hoàn thành đánh giá',
  results: 'Xem kết quả trial',
};

export interface TrialDashboardModel {
  writable: boolean;
  remainingLabel: string;
  usedSeats: number;
  remainingSeats: number;
  completedSteps: number;
  totalSteps: number;
  progressPercent: number;
  nextAction: { key: string; label: string; href: string };
}

type TrialRole = 'OWNER' | 'MANAGER' | 'EMPLOYEE';

function primaryTrialRole(roles: readonly string[]): TrialRole {
  if (roles.includes('OWNER')) return 'OWNER';
  if (roles.includes('MANAGER')) return 'MANAGER';
  return 'EMPLOYEE';
}

const STEP_PATHS: Record<TrialRole, Record<string, string>> = {
  OWNER: {
    position: '/enterprise/positions',
    invite: '/enterprise/members',
    assessment: '/enterprise/members',
    results: '/enterprise/assessment-results',
  },
  MANAGER: {
    position: '/enterprise/team',
    invite: '/enterprise/team/members',
    assessment: '/enterprise/team/members',
    results: '/enterprise/team/competency',
  },
  EMPLOYEE: {
    position: '/enterprise/me',
    invite: '/enterprise/me',
    assessment: '/enterprise/me/assessments',
    results: '/enterprise/me/skill-gap',
  },
};

export function trialStepHref(key: string, roles: readonly string[]): string {
  const paths = STEP_PATHS[primaryTrialRole(roles)];
  return paths[key] ?? paths.results;
}

function remainingLabel(remainingMs: number): string {
  if (remainingMs <= 0) return 'Đã hết thời gian thử';
  if (remainingMs < DAY_MS) return `Còn ${Math.max(1, Math.ceil(remainingMs / HOUR_MS))} giờ`;
  return `Còn ${Math.ceil(remainingMs / DAY_MS)} ngày`;
}

export function trialDashboardModel(context: TrialContextDto, roles: readonly string[], now: Date = new Date()): TrialDashboardModel {
  const remainingMs = Date.parse(context.endsAt) - now.getTime();
  const completedSteps = context.checklist.filter((item) => item.complete).length;
  const totalSteps = context.checklist.length;
  const nextStep = context.checklist.find((item) => !item.complete) ?? context.checklist.at(-1);
  const nextKey = nextStep?.key ?? 'results';
  const usedSeats = context.usage.accounts + context.usage.pendingInvitations;

  return {
    writable: context.status !== 'trial_read_only' && remainingMs > 0,
    remainingLabel: remainingLabel(remainingMs),
    usedSeats,
    remainingSeats: Math.max(0, context.limits.maxAccounts - usedSeats),
    completedSteps,
    totalSteps,
    progressPercent: totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100),
    nextAction: {
      key: nextKey,
      label: TRIAL_STEP_LABELS[nextKey] ?? 'Tiếp tục trải nghiệm',
      href: trialStepHref(nextKey, roles),
    },
  };
}
