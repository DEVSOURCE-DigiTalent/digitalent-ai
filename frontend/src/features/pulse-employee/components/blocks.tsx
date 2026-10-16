import type { PulseCriterion, PulseFinalStatus } from '@/services/pulse.service';
import { FINAL_LABELS, finalTone } from '../lib/labels';
import { Pill } from './ui';

export function CriteriaRubric({ criteria }: { criteria: PulseCriterion[] }) {
  return (
    <div className="pu-rubric">
      {criteria.map((criterion) => (
        <div key={criterion.number}>
          <b>{criterion.number}</b>
          <span>{criterion.title}<small>{criterion.description}</small></span>
        </div>
      ))}
    </div>
  );
}

export function FinalStatusPill({ status }: { status: PulseFinalStatus }) {
  return <Pill tone={finalTone(status)}>{FINAL_LABELS[status]}</Pill>;
}
