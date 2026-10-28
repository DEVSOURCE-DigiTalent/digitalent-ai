import { Check } from 'lucide-react';
import type { TrialParticipantStatus, TrialReport, TrialStage } from '@/services/trial-program.service';
import { LEVEL_LABELS, STAGE } from '../lib/trial-format';

export function LevelBadge({ level }: { level: number }) {
  const value = Math.max(0, Math.min(3, Math.round(level)));
  return <span className="tp-level" data-level={value}>{LEVEL_LABELS[value]}</span>;
}

const PARTICIPANT: Record<TrialParticipantStatus, { label: string; tone: string }> = {
  INVITED: { label: 'Đã mời', tone: '' },
  INVITE_EXPIRED: { label: 'Lời mời hết hạn', tone: 'bad' },
  ACTIVE: { label: 'Chưa làm bài', tone: 'warn' },
  SUBMITTED: { label: 'Đã nộp', tone: 'info' },
  REVIEWED: { label: 'Đã chấm', tone: 'ok' },
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

/** Bảng năng lực của doanh nghiệp: phân bố mức theo lĩnh vực và mức của từng nhân viên. */
export function CompetencyReport({ report }: { report: TrialReport }) {
  return (
    <div className="tp">
      <section className="tp-card">
        <div className="tp-card-head">
          <h2>Năng lực theo lĩnh vực</h2>
          <LevelLegend />
        </div>
        <div className="tp-table-wrap">
          <table className="tp-table">
            <thead>
              <tr>
                <th>Lĩnh vực</th>
                <th>Phân bố ({report.assessed} người)</th>
                <th className="num">TB</th>
                <th className="num">Mức chung</th>
              </tr>
            </thead>
            <tbody>
              {report.summary.map((row) => (
                <tr key={row.categoryId}>
                  <td>{row.number}. {row.name}</td>
                  <td>
                    <div className="tp-dist" title={row.counts.map((n, i) => `${LEVEL_LABELS[i]}: ${n}`).join(' · ')}>
                      {row.counts.map((n, level) =>
                        n > 0 ? <i key={level} data-level={level} style={{ width: `${(n / Math.max(1, report.assessed)) * 100}%` }} /> : null,
                      )}
                    </div>
                  </td>
                  <td className="num">{row.average.toFixed(1)}</td>
                  <td className="num"><LevelBadge level={row.level} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="tp-card">
        <h2>Theo nhân viên</h2>
        <div className="tp-table-wrap">
          <table className="tp-table">
            <thead>
              <tr>
                <th>Nhân viên</th>
                {report.domains.map((d) => (
                  <th key={d.categoryId} className="num" title={d.name}>LV{d.number}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.employees.map((e) => (
                <tr key={e.employeeId}>
                  <td>
                    {e.fullName}
                    <small>{[e.departmentName, e.positionName].filter(Boolean).join(' · ')}</small>
                  </td>
                  {e.levels.map((level, i) => (
                    <td key={i} className="num"><LevelBadge level={level} /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="tp-muted">{report.domains.map((d) => `LV${d.number}: ${d.name}`).join(' · ')}</p>
      </section>
    </div>
  );
}
