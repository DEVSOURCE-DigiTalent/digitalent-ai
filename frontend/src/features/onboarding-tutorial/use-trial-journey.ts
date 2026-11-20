import { useMemo } from 'react';
import { useCapabilityCeilings } from '@/hooks/use-capability-ceilings';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useTrialProgram } from '@/hooks/use-trial-program';
import type { TrialProgram } from '@/services/trial-program.service';
import type { TrialJourneyKey } from './types';

export interface JourneyState {
  done: boolean;
  /** Where it stands in a few words; none = the task's own subtitle. */
  detail?: string;
}

/**
 * Where an enterprise-trial owner is on the journey, from the real data: invitations sent, position levels set in
 * Khung năng lực số (optional), results published by the mentor, first course bought.
 */
export function trialJourney(
  program: Pick<TrialProgram, 'stage' | 'participants'> | undefined,
  positions: { isCustomized: boolean }[] | undefined,
  purchased: boolean,
): Record<TrialJourneyKey, JourneyState> {
  const invited = program?.participants.length ?? 0;
  const submitted = program?.participants.filter((p) => p.status === 'SUBMITTED' || p.status === 'REVIEWED').length ?? 0;
  const levelsSet = positions?.filter((p) => p.isCustomized).length ?? 0;
  const reported = program?.stage === 'REPORTED';
  return {
    invited: { done: invited > 0, detail: invited > 0 ? `${invited} người đã được mời` : undefined },
    levels: { done: levelsSet > 0, detail: levelsSet > 0 && positions ? `${levelsSet}/${positions.length} vị trí đã đặt` : undefined },
    results: {
      done: reported,
      detail: reported ? 'Đã có kết quả' : invited === 0 ? undefined : submitted === invited ? 'Chuyên gia đang chấm' : `${submitted}/${invited} đã nộp`,
    },
    purchased: { done: purchased },
  };
}

export function useTrialJourney(): Record<TrialJourneyKey, JourneyState> {
  const program = useTrialProgram({ poll: false });
  const ceilings = useCapabilityCeilings();
  const purchased = useCurrentUser((s) => Boolean(s.user?.enterpriseTrialPurchased));
  return useMemo(() => trialJourney(program.data, ceilings.data?.positions, purchased), [program.data, ceilings.data, purchased]);
}
