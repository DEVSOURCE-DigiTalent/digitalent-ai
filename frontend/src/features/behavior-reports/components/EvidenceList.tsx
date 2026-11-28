import { Play } from 'lucide-react';
import { translateUi, useUiLanguage } from '@/lib/i18n';
import type { BehaviorFinding } from '@/services/behavior-report.service';
import type { PulseProctoringEvent, PulseRiskMoment } from '@/services/pulse.service';
import { PROCTORING_EVENT_LABELS, clock, eventDetailText, formatDuration } from '@/features/pulse-employee/lib/labels';
import { LEVEL_TEXT } from '../lib/behavior';

function eventLine(event: PulseProctoringEvent) {
  const detail = eventDetailText(event);
  return `${PROCTORING_EVENT_LABELS[event.kind]}${event.durationMs ? ` · ${formatDuration(event.durationMs)}` : ''}${detail ? ` · ${detail}` : ''}`;
}

/**
 * Bằng chứng: mỗi phát hiện của AI kèm đúng các sự kiện trong nhật ký đã dẫn tới nó; bấm mốc thời gian để xem đoạn video
 * đó (tua tới trước 2 giây). Thẻ ứng với đoạn đang phát được tô nổi.
 */
export function EvidenceList({ findings, active, onSeek }: { findings: BehaviorFinding[]; active: number; onSeek: (ms: number) => void }) {
  useUiLanguage();
  return (
    <ol className="br-evidence">
      {findings.map((finding, index) => (
        <li key={`${finding.startMs}-${index}`} className={finding.severity.toLowerCase()} aria-current={active === index ? 'true' : undefined}>
          <div className="br-evidence__top">
            <span className="br-evidence__num" aria-hidden>{index + 1}</span>
            <h5>{finding.title}</h5>
            <span className={`br-pill ${finding.severity.toLowerCase()}`}>{translateUi(LEVEL_TEXT[finding.severity])}</span>
          </div>
          {finding.explanation && <p>{finding.explanation}</p>}
          <button type="button" className="br-evidence__play" onClick={() => onSeek(finding.startMs - 2000)}>
            <Play size={13} aria-hidden fill="currentColor" />
            {translateUi('Xem đoạn')} {clock(finding.startMs)}–{clock(finding.endMs)}
          </button>
          {finding.events.length > 0 && (
            <ul className="br-evidence__events" aria-label={translateUi('Sự kiện làm bằng chứng')}>
              {finding.events.map((event, k) => (
                <li key={`${event.kind}-${event.offsetMs}-${k}`}>
                  <button type="button" onClick={() => onSeek(event.offsetMs - 2000)}>
                    <time>{clock(event.offsetMs)}</time>
                    <span>{translateUi(eventLine(event))}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ol>
  );
}

/** Khi chưa có phân tích của AI: các đoạn đáng ngờ tổng hợp từ nhật ký theo luật, cùng cách bấm để xem. */
export function MomentList({ moments, onSeek }: { moments: PulseRiskMoment[]; onSeek: (ms: number) => void }) {
  useUiLanguage();
  return (
    <ol className="br-evidence">
      {moments.map((moment, index) => (
        <li key={`${moment.startMs}-${index}`} className={moment.severity.toLowerCase()}>
          <div className="br-evidence__top">
            <span className="br-evidence__num" aria-hidden>{index + 1}</span>
            <h5>{moment.kinds.map((kind) => translateUi(PROCTORING_EVENT_LABELS[kind])).join(' · ')}</h5>
            <span className={`br-pill ${moment.severity.toLowerCase()}`}>{translateUi(LEVEL_TEXT[moment.severity])}</span>
          </div>
          <button type="button" className="br-evidence__play" onClick={() => onSeek(moment.startMs - 2000)}>
            <Play size={13} aria-hidden fill="currentColor" />
            {translateUi('Xem đoạn')} {clock(moment.startMs)}–{clock(moment.endMs)}
          </button>
        </li>
      ))}
    </ol>
  );
}
