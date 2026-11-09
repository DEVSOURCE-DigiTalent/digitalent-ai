import { translateUi, useUiLanguage } from '@/lib/i18n';
import type { PulseChoiceResult, PulseCriterion, PulseFinalStatus } from '@/services/pulse.service';
import { FINAL_LABELS, finalTone } from '../lib/labels';
import { Pill } from './ui';

export function CriteriaRubric({ criteria }: { criteria: PulseCriterion[] }) {
  useUiLanguage();
  return (
    <div className="pu-rubric">
      {criteria.map((criterion) => (
        <div key={criterion.number}>
          <b>{criterion.number}</b>
          <span>{translateUi(criterion.title)}<small>{translateUi(criterion.description)}</small></span>
        </div>
      ))}
    </div>
  );
}

/** Kết quả phần trắc nghiệm của một bài đã chấm (nhân viên chỉ thấy số câu đúng, không thấy đáp án). */
export function ChoiceScore({ choice }: { choice?: PulseChoiceResult | null }) {
  useUiLanguage();
  if (!choice) return null;
  return (
    <div className={`pu-choice-score${choice.passed ? ' ok' : ''}`}>
      <strong>Trắc nghiệm: đúng {choice.score}/{choice.total}{translateUi(" câu")}</strong>
      <span>{choice.passed ? 'Đạt' : translateUi('Chưa đạt')} · cần từ {choice.passMark}{translateUi(" câu")}</span>
    </div>
  );
}

export function FinalStatusPill({ status }: { status: PulseFinalStatus }) {
  useUiLanguage();
  return <Pill tone={finalTone(status)}>{translateUi(FINAL_LABELS[status])}</Pill>;
}
