import { Check } from 'lucide-react';
import type { TrialParticipantStatus, TrialStage } from '@/services/trial-program.service';
import { LEVEL_LABELS, STAGE } from '../lib/trial-format';

export function LevelBadge({ level }: { level: number }) {
  const value = Math.max(0, Math.min(3, Math.round(level)));
  return <span className="tp-level" data-level={value}>{LEVEL_LABELS[value]}</span>;
}

const PARTICIPANT: Record<TrialParticipantStatus, { label: string; tone: string }> = {
  INVITED: { label: 'Đã mời', tone: '' },
  INVITE_EXPIRED: { label: 'Lời mời hết hạn', tone: 'bad' },
  ACTIVE: { label: 'Chưa nộp', tone: 'warn' },
  SUBMITTED: { label: 'Đã nộp', tone: 'ok' },
};

export function ParticipantStatus({ status }: { status: TrialParticipantStatus }) {
  const s = PARTICIPANT[status];
  return <span className={`tp-badge ${s.tone}`}>{s.label}</span>;
}

export function StageBadge({ stage }: { stage: TrialStage }) {
  return <span className={`tp-badge ${STAGE[stage].tone}`}>{STAGE[stage].label}</span>;
}

/** Thanh bước: index = bước hiện tại (0-based); các bước trước đã xong. */
export function Steps({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="tp-steps" aria-label="Các bước dùng thử">
      {steps.map((step, index) => {
        const state = index < current ? 'done' : index === current ? 'current' : 'todo';
        return (
          <li key={step} data-state={state} aria-current={state === 'current' ? 'step' : undefined}>
            <b>{state === 'done' ? <Check size={13} strokeWidth={3} aria-hidden /> : index + 1}</b>
            <span>{step}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function LevelLegend() {
  return (
    <div className="tp-legend" aria-hidden>
      {LEVEL_LABELS.map((label, level) => (
        <span key={label}>
          <i className="tp-level" data-level={level} style={{ minWidth: 0, padding: 0 }} />
          {label}
        </span>
      ))}
    </div>
  );
}
