import type { PulseChoiceResult, PulseCriterion, PulseFinalStatus } from '@/services/pulse.service';
import { FINAL_LABELS, finalTone } from '../lib/labels';
import { Pill } from './ui';

export function CriteriaRubric({ criteria }: { criteria: PulseCriterion[] }) {
  return (
    <div className="pu-rubric">
      {criteria.map((criterion) => (
        <div key={criterion.number} className={criterion.isRequired ? 'is-required-gate' : undefined}>
          <b>{criterion.number}</b>
          <div className="pu-rubric-content">
            <div className="pu-rubric-title-row">
              <strong>{criterion.title}</strong>
              {(criterion.weightPercent != null || criterion.isRequired) && (
                <div className="pu-rubric-badges">
                  {criterion.weightPercent != null && (
                    <em className="pu-rubric-weight">{criterion.weightPercent}%</em>
                  )}
                  {criterion.isRequired && (
                    <em className="pu-rubric-gate">Bắt buộc</em>
                  )}
                </div>
              )}
            </div>
            <small>{criterion.description}</small>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Kết quả phần trắc nghiệm của một bài đã chấm (nhân viên chỉ thấy số câu đúng, không thấy đáp án). */
export function ChoiceScore({ choice }: { choice?: PulseChoiceResult | null }) {
  if (!choice) return null;
  return (
    <div className={`pu-choice-score${choice.passed ? ' ok' : ''}`}>
      <strong>Trắc nghiệm: đúng {choice.score}/{choice.total} câu</strong>
      <span>{choice.passed ? 'Đạt' : 'Chưa đạt'} · cần từ {choice.passMark} câu</span>
    </div>
  );
}

export function FinalStatusPill({ status }: { status: PulseFinalStatus }) {
  return <Pill tone={finalTone(status)}>{FINAL_LABELS[status]}</Pill>;
}
