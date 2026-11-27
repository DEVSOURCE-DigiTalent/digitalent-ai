import { useId, useMemo, type MouseEvent } from 'react';
import { translateUi, useUiLanguage } from '@/lib/i18n';
import type { BehaviorFinding } from '@/services/behavior-report.service';
import type { PulseProctoringEvent } from '@/services/pulse.service';
import { PROCTORING_EVENT_LABELS, clock, eventDetailText, formatDuration } from '@/features/pulse-employee/lib/labels';
import { LANES, LEVEL_TEXT, axisTicks, laneMarks } from '../lib/behavior';

/**
 * Dòng thời gian của buổi làm bài: làn trên cùng là các phát hiện của AI (đánh số như thẻ bằng chứng), các làn dưới là
 * sự kiện thật trong nhật ký theo nhóm hành vi. Vạch dọc là vị trí đang phát; bấm vào đâu thì video tua tới đó.
 */
export function BehaviorTimeline({
  findings,
  events,
  totalMs,
  t,
  activeFinding,
  onSeek,
}: {
  findings: BehaviorFinding[];
  events: PulseProctoringEvent[];
  totalMs: number;
  t: number;
  activeFinding: number;
  onSeek: (ms: number) => void;
}) {
  useUiLanguage();
  const titleId = useId();
  const lanes = useMemo(() => laneMarks(events, totalMs), [events, totalMs]);
  const ticks = useMemo(() => axisTicks(totalMs), [totalMs]);
  const percent = (ms: number) => `${(Math.min(Math.max(ms, 0), totalMs) / totalMs) * 100}%`;
  const width = (start: number, end: number) => `max(8px, ${((end - start) / totalMs) * 100}%)`;

  const seekFromTrack = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    const box = event.currentTarget.getBoundingClientRect();
    onSeek(((event.clientX - box.left) / box.width) * totalMs);
  };

  return (
    <section className="br-card br-timeline" aria-labelledby={titleId}>
      <div className="br-card__head">
        <h4 id={titleId}>{translateUi('Dòng thời gian')}</h4>
        <span className="br-legend" aria-hidden>
          <i className="high" />{translateUi('Nặng')}
          <i className="medium" />{translateUi('Vừa')}
          <i className="low" />{translateUi('Nhẹ')}
        </span>
      </div>

      <div className="br-tl">
        <div className="br-tl__row is-ai">
          <span className="br-tl__label">{translateUi('AI nhận định')}</span>
          <div className="br-tl__track" onClick={seekFromTrack}>
            {findings.map((finding, index) => (
              <button
                key={`f-${finding.startMs}-${index}`}
                type="button"
                className={`br-tl__finding ${finding.severity.toLowerCase()}`}
                style={{ left: percent(finding.startMs), width: width(finding.startMs, finding.endMs) }}
                aria-current={activeFinding === index ? 'true' : undefined}
                aria-label={`${index + 1}. ${finding.title} · ${clock(finding.startMs)}–${clock(finding.endMs)} · ${translateUi(LEVEL_TEXT[finding.severity])}`}
                title={`${clock(finding.startMs)}–${clock(finding.endMs)} · ${finding.title}`}
                onClick={() => onSeek(finding.startMs - 2000)}
              >
                {index + 1}
              </button>
            ))}
            {findings.length === 0 && <span className="br-tl__none">{translateUi('Không có phát hiện')}</span>}
          </div>
        </div>

        {LANES.map((lane) => (
          <div key={lane.id} className="br-tl__row">
            <span className="br-tl__label">{translateUi(lane.label)}</span>
            <div className="br-tl__track" onClick={seekFromTrack}>
              {lanes[lane.id].map((mark, index) => {
                const instant = mark.endMs - mark.startMs < 1000;
                const detail = eventDetailText(mark.event);
                const text = `${clock(mark.startMs)} · ${PROCTORING_EVENT_LABELS[mark.event.kind]}${
                  instant ? '' : ` · ${formatDuration(mark.endMs - mark.startMs)}`}${detail ? ` · ${detail}` : ''}`;
                return (
                  <button
                    key={`${mark.event.kind}-${mark.startMs}-${index}`}
                    type="button"
                    className={`br-tl__mark ${mark.severity.toLowerCase()}${instant ? ' is-instant' : ''}`}
                    style={instant ? { left: percent(mark.startMs) } : { left: percent(mark.startMs), width: width(mark.startMs, mark.endMs) }}
                    aria-label={text}
                    title={text}
                    onClick={() => onSeek(mark.startMs - 2000)}
                  />
                );
              })}
            </div>
          </div>
        ))}

        <div className="br-tl__row is-axis" aria-hidden>
          <span />
          <div className="br-tl__axis">
            {ticks.map((tick) => (
              <span key={tick} style={{ left: percent(tick) }}>{clock(tick)}</span>
            ))}
          </div>
        </div>

        <div className="br-tl__playhead" style={{ left: `calc(var(--br-tl-label) + (100% - var(--br-tl-label)) * ${Math.min(1, Math.max(0, t / totalMs))})` }} aria-hidden />
      </div>
    </section>
  );
}
