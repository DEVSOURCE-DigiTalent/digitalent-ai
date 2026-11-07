import type { CSSProperties } from 'react';
import type { TrialReport } from '@/services/trial-program.service';
import { formatAverage, LEVEL_LABELS, LEVEL_SHORT, percentOf, TIER_LABELS } from '../../lib/trial-format';
import { HoverTip } from './hover-tip';
import { useHoverTip } from './report-hooks';

/** Ngưỡng đạt một cấp (% câu đúng) của luật mức — vạch đen trên biểu đồ tỷ lệ đúng. */
const PASS_PERCENT = 70;

/** Câu sai nhiều nhất của mỗi lĩnh vực trong phạm vi đề xuất (cấp ≤ mức tối đa), xếp giảm dần theo tỷ lệ sai. */
export function MissedQuestions({ report }: { report: TrialReport }) {
  const { tip, bind } = useHoverTip();
  const rows = report.summary
    .filter((d) => d.mostMissed)
    .map((d) => ({ domain: d, missed: d.mostMissed! }))
    .sort((a, b) => b.missed.wrong / b.missed.answered - a.missed.wrong / a.missed.answered || b.missed.wrong - a.missed.wrong);

  return (
    <section className="tp-card" aria-labelledby="rp-missed-title">
      <div className="tp-card-head">
        <h2 id="rp-missed-title">Câu sai nhiều nhất</h2>
        <span className="tp-muted">trong phạm vi đề xuất · 1 câu mỗi lĩnh vực</span>
      </div>
      {rows.length === 0 ? (
        <p className="tp-muted">Không có câu nào bị trả lời sai trong phạm vi đề xuất.</p>
      ) : (
        <div className="rp-hbar">
          {rows.map(({ domain, missed }) => (
            <div key={domain.categoryId} className="rp-hrow"
              {...bind(<><b>M{domain.number} · {domain.name} · {TIER_LABELS[missed.tier]}</b><br />{missed.content}<br /><span className="mut">{missed.wrong}/{missed.answered} người trả lời sai</span></>)}>
              <span className="q">
                <span className="rp-code">M{domain.number}</span>
                <span className="tp-level" data-level={missed.tier} style={{ minWidth: 0 }}>{LEVEL_SHORT[missed.tier]}</span>
                <span>{missed.content}</span>
              </span>
              <b>{missed.wrong}/{missed.answered}<small>sai</small></b>
              <span className="tr"><i style={{ width: `${percentOf(missed.wrong, missed.answered)}%` }} /></span>
            </div>
          ))}
        </div>
      )}
      <HoverTip tip={tip} />
    </section>
  );
}

/** Màu thang tuần tự 0–3 (cùng họ màu --tp-l*). */
function heatColor(value: number) {
  const stops = [[238, 242, 250], [156, 195, 245], [79, 141, 232], [28, 79, 184]];
  const t = Math.max(0, Math.min(3, value));
  const i = Math.min(2, Math.floor(t));
  const f = t - i;
  return `rgb(${stops[i].map((c, j) => Math.round(c + (stops[i + 1][j] - c) * f)).join(',')})`;
}

/** Mức trung bình mỗi lĩnh vực theo phòng ban. */
export function DepartmentHeatmap({ report }: { report: TrialReport }) {
  const { tip, bind } = useHoverTip();
  return (
    <section className="tp-card" aria-labelledby="rp-heat-title">
      <div className="tp-card-head">
        <h2 id="rp-heat-title">Mức TB theo phòng ban</h2>
        <span className="rp-ramp" aria-hidden><span>0</span><i /><span>3</span></span>
      </div>
      <div className="rp-heat" style={{ '--cols': report.domains.length } as CSSProperties}>
        <div />
        {report.domains.map((d) => <div key={d.categoryId} className="h" title={d.name}>M{d.number}</div>)}
        {report.departments.map((department, row) => (
          <DepartmentRow key={department.departmentId} report={report} index={row} bind={bind} />
        ))}
      </div>
      <HoverTip tip={tip} />
    </section>
  );
}

function DepartmentRow({ report, index, bind }: { report: TrialReport; index: number; bind: ReturnType<typeof useHoverTip>['bind'] }) {
  const department = report.departments[index];
  return (
    <>
      <div className="r" title={department.name}>{department.name}</div>
      {department.averages.map((value, d) => (
        <div key={report.domains[d].categoryId} className="c"
          style={{ '--i': index * report.domains.length + d, background: heatColor(value), color: value >= 1.6 ? '#fff' : '#17243f' } as CSSProperties}
          {...bind(<><b>{department.name} · M{report.domains[d].number}</b><br />TB {formatAverage(value)} · {department.people} người</>)}>
          {formatAverage(value)}
        </div>
      ))}
    </>
  );
}

/** Chi tiết theo cấp (đóng sẵn): % câu đúng từng cấp so với ngưỡng đạt, và số người ở từng mức. */
export function LevelDetails({ report }: { report: TrialReport }) {
  const { tip, bind } = useHoverTip();
  return (
    <details className="tp-card rp-details">
      <summary>Chi tiết theo cấp <span>· tỷ lệ câu đúng, số người theo mức</span></summary>
      <div className="rp-two">
        <section aria-labelledby="rp-rate-title">
          <div className="tp-card-head">
            <h3 id="rp-rate-title">Tỷ lệ câu đúng</h3>
            <span className="rp-key">
              <span><i style={{ background: 'var(--tp-l3)' }} />Đạt</span>
              <span><i style={{ background: 'var(--tp-l1)' }} />Chưa đạt</span>
              <span><i className="tick" />{PASS_PERCENT}%</span>
            </span>
          </div>
          <div className="rp-cbar">
            <div />
            {[1, 2, 3].map((tier) => <div key={tier} className="hd">{TIER_LABELS[tier]}</div>)}
            {report.summary.map((d) => (
              <CorrectRow key={d.categoryId} name={d.name} number={d.number} rates={d.correctRates} bind={bind} />
            ))}
          </div>
        </section>
        <section aria-labelledby="rp-stack-title">
          <div className="tp-card-head">
            <h3 id="rp-stack-title">Số người theo mức</h3>
            <span className="rp-key">
              {LEVEL_SHORT.map((short, level) => <span key={short}><i style={{ background: `var(--tp-l${level})` }} />{LEVEL_LABELS[level]}</span>)}
            </span>
          </div>
          <div className="rp-stack">
            {report.summary.map((d) => (
              <div key={d.categoryId} className="rp-srow">
                <span className="lab"><span className="rp-code">M{d.number}</span><span>{d.name}</span></span>
                <span className="rp-bar">
                  {d.counts.map((n, level) => n > 0 && (
                    <i key={level} data-level={level} style={{ flex: n }}
                      {...bind(<><b>M{d.number} · {LEVEL_LABELS[level]}</b><br />{n} người · {percentOf(n, report.assessed)}%</>)} />
                  ))}
                </span>
                <b>{formatAverage(d.average)}</b>
              </div>
            ))}
          </div>
        </section>
      </div>
      <HoverTip tip={tip} />
    </details>
  );
}

function CorrectRow({ name, number, rates, bind }: { name: string; number: number; rates: (number | null)[]; bind: ReturnType<typeof useHoverTip>['bind'] }) {
  return (
    <>
      <span className="lab"><span className="rp-code">M{number}</span><span>{name}</span></span>
      {rates.map((rate, i) => {
        if (rate == null) return <span key={i} className="tp-muted">—</span>;
        const passed = rate >= PASS_PERCENT;
        return (
          <span key={i} className="rp-pc"
            {...bind(<><b>M{number} · {TIER_LABELS[i + 1]}</b><br />{rate}% câu đúng · {passed ? 'đạt' : 'chưa đạt'} ngưỡng {PASS_PERCENT}%</>)}>
            <span className="tr"><i className={passed ? 'ok' : 'no'} style={{ width: `${rate}%` }} /></span>
            <b className={passed ? undefined : 'no'}>{rate}%</b>
          </span>
        );
      })}
    </>
  );
}
