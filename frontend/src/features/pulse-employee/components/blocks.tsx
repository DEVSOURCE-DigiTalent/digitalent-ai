import type { PulseCriterion, PulseDomain, PulseFinalStatus } from '@/services/pulse.service';
import { FINAL_LABELS, SOURCE_LABELS, domainBadge, domainTone, finalTone, levelShort, pad2 } from '../lib/labels';
import { LevelTrack, Pill } from './ui';

/** Ô lĩnh vực trên bản đồ lộ trình: mức đã xác nhận → mục tiêu vị trí. */
export function RoadmapTile({ domain, assessed }: { domain: PulseDomain; assessed: boolean }) {
  const current = assessed ? domain.verified : 0;
  return (
    <article className={`pu-tile ${domainTone(domain)}`}>
      <div className="pu-tile-top">
        <span>{pad2(domain.number)} / {domain.name}</span>
        <b>{domainBadge(domain, assessed)}</b>
      </div>
      <Levels current={current} target={domain.target} />
      <LevelTrack
        current={current}
        target={domain.target}
        label={`${domain.name}: ${current ? `mức hiện tại ${current}` : 'chưa có mức đo được'}, mục tiêu mức ${domain.target}`}
      />
    </article>
  );
}

export function Levels({ current, target, currentLabel = 'Hiện tại', targetLabel = 'Mục tiêu vị trí' }: {
  current: number; target: number; currentLabel?: string; targetLabel?: string;
}) {
  return (
    <div className="pu-levels">
      <strong>{levelShort(current)}<small>{currentLabel}</small></strong>
      <i aria-hidden>→</i>
      <strong>{target ? `L${target}` : '—'}<small>{targetLabel}</small></strong>
    </div>
  );
}

/** Bảng tiến bộ năng lực: đầu vào → đã xác nhận → mục tiêu (pulse-capability-progress.js). */
export function CapabilityRows({ domains, assessed }: { domains: PulseDomain[]; assessed: boolean }) {
  return (
    <section className="pu-capability" aria-label="Mức đầu vào, mức đã xác nhận và mục tiêu vị trí">
      <div className="pu-capability-head">
        <strong>Tiến bộ năng lực</strong>
        <span>Đầu vào → đã xác nhận → mục tiêu vị trí</span>
      </div>
      {domains.map((domain) => {
        const start = domain.baseline ?? 0;
        const now = assessed ? domain.verified : 0;
        const gain = Math.max(0, now - start);
        const remaining = Math.max(0, domain.target - now);
        const result = domain.target === 0 ? { text: 'Ngoài lộ trình', tone: 'outside' }
          : !assessed || now === 0 ? { text: 'Chưa xác nhận mức', tone: 'pending' }
          : remaining === 0 ? { text: gain ? `+${gain} mức · Đạt mục tiêu` : 'Đạt mục tiêu', tone: 'met' }
          : { text: `${gain ? `+${gain} mức · ` : ''}còn ${remaining} mức`, tone: 'open' };
        return (
          <div className="pu-capability-row" key={domain.categoryId}>
            <div>
              <strong>{domain.name}</strong>
              <small>{domain.target === 0 ? 'Vị trí của bạn không yêu cầu lĩnh vực này' : assessed ? SOURCE_LABELS[domain.source] : 'Chờ bài kiểm tra đầu vào'}</small>
            </div>
            <div className="pu-capability-levels">
              <span>Đầu vào <b>{assessed ? levelShort(start) : 'Đang chờ'}</b></span>
              <i aria-hidden>→</i>
              <span>Hiện tại <b>{levelShort(now)}</b></span>
              <i aria-hidden>→</i>
              <span>Mục tiêu <b>{domain.target ? `L${domain.target}` : '—'}</b></span>
            </div>
            <span className={`pu-result ${result.tone}`}>{result.text}</span>
          </div>
        );
      })}
      <div className="pu-legend" aria-hidden>
        <span><i />Mức đã xác nhận</span>
        <span><i className="target" />Mục tiêu vị trí</span>
        <span><i className="pending" />Chưa xác nhận / ngoài lộ trình</span>
      </div>
    </section>
  );
}

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
