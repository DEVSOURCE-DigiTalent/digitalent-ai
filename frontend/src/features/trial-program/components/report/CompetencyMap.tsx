import { useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import type { TrialDomain, TrialInsightItem, TrialPlanKind } from '@/services/trial-program.service';
import { formatAverage, formatMoneyShort, LEVEL_LABELS } from '../../lib/trial-format';
import { averageLevel, effectiveLevel, PLAN_KINDS, planTotals, TIERS, type PlanLevels, type Tier, type TrialPlanPerson } from '../../lib/trial-plan';
import { HoverTip } from './hover-tip';
import { useHoverTip } from './report-hooks';

const PHASES: Record<Tier, { label: string; color: string; when: string }> = {
  1: { label: 'Cơ bản', color: 'var(--rp-p1)', when: 'đang học thử' },
  2: { label: 'Trung cấp', color: 'var(--rp-p2)', when: 'sau học thử' },
  3: { label: 'Nâng cao', color: 'var(--rp-p3)', when: 'sau Trung cấp' },
};

const W = 1000;
const LEFT = 220;
const RIGHT = 960;
const ROW = 58;
const TOP = 34;
const x = (level: number) => LEFT + ((RIGHT - LEFT) * level) / 3;
/** Tên lĩnh vực trên bản đồ: tối đa 2 dòng ~22 ký tự (tên đủ ở tooltip). */
const LABEL_CHARS = 22;

function labelLines(name: string): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of name.split(/\s+/)) {
    if ((line + ' ' + word).trim().length <= LABEL_CHARS) line = (line + ' ' + word).trim();
    else {
      lines.push(line);
      line = word;
    }
  }
  lines.push(line);
  return lines.length <= 2 ? lines : [lines[0], `${lines[1]}…`];
}

interface CompetencyMapProps {
  domains: TrialDomain[];
  /** Người trong phạm vi đang xem (cả doanh nghiệp hoặc một phòng ban). */
  people: TrialPlanPerson[];
  /** null = cả doanh nghiệp. */
  departmentId: string | null;
  plan: PlanLevels;
  prices: number[];
  /** Lý do mức tối đa ✦ — chỉ có với phương án Đề xuất. */
  reasons: TrialInsightItem[] | null;
  /** ✦ Lĩnh vực ưu tiên (chỉ số lĩnh vực theo thứ tự ưu tiên) — đánh số ①②③ trên bản đồ. */
  priorities: number[];
  focus: number | null;
  scopes: { id: string | null; label: string }[];
  onScope: (departmentId: string | null) => void;
  kind: TrialPlanKind;
  onKind: (kind: TrialPlanKind) => void;
}

/**
 * Bản đồ năng lực: mỗi hàng một lĩnh vực trên trục Chưa đạt → Nâng cao; chấm xanh = mức trung bình hiện tại, cờ cam = mức
 * tối đa của phương án, đoạn giữa tô theo giai đoạn (Cơ bản → Trung cấp → Nâng cao). Bấm một giai đoạn để chỉ xem đoạn đó.
 */
export function CompetencyMap(props: CompetencyMapProps) {
  const { domains, people, departmentId, plan, prices, reasons, priorities, focus, scopes, onScope, kind, onKind } = props;
  const [phase, setPhase] = useState<Tier | null>(null);
  const { tip, bind } = useHoverTip();
  const totals = planTotals(people, plan, prices);
  const target = (domain: number) => (departmentId ? effectiveLevel(plan, departmentId, domain) : plan.organization[domain]);
  const height = TOP + ROW * domains.length + 6;

  return (
    <section className="tp-card" aria-labelledby="rp-map-title">
      <div className="tp-card-head">
        <h2 id="rp-map-title">Bản đồ năng lực</h2>
        <div className="tp-row">
          <div className="tp-tabs" role="group" aria-label="Phạm vi xem">
            {scopes.map((s) => (
              <button key={s.id ?? 'org'} type="button" aria-pressed={departmentId === s.id} onClick={() => onScope(s.id)}>{s.label}</button>
            ))}
          </div>
          <div className="tp-tabs" role="group" aria-label="Phương án">
            {PLAN_KINDS.map((p) => (
              <button key={p.kind} type="button" aria-pressed={kind === p.kind} onClick={() => onKind(p.kind)}>
                {p.kind === 'BALANCED' ? '✦ ' : ''}{p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ol className="rp-phases" aria-label="Giai đoạn">
        {TIERS.map((tier) => {
          const stat = totals.byTier[tier];
          return (
            <li key={tier}>
              <button type="button" style={{ '--pc': PHASES[tier].color } as CSSProperties} aria-pressed={phase === tier}
                disabled={stat.courses === 0} onClick={() => setPhase(phase === tier ? null : tier)}>
                <span className="no">{tier}</span>
                <span className="nm">{PHASES[tier].label}{tier === 1 ? ' · miễn phí' : ''}</span>
                <span className="val">
                  {stat.courses === 0 ? '—' : tier === 1 ? stat.seats : formatMoneyShort(stat.cost)}
                  {stat.courses > 0 && <small>{tier === 1 ? 'suất miễn phí' : `${stat.seats} suất`}</small>}
                </span>
                <span className="sub">{stat.courses} khóa · {PHASES[tier].when}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="rp-map" role="img" aria-label="Mức hiện tại và lộ trình tới mức tối đa theo từng lĩnh vực">
        <svg viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="xMinYMin meet">
          {[0, 1, 2, 3].map((level) => (
            <g key={level}>
              <line className="grid" x1={x(level)} y1={TOP - 6} x2={x(level)} y2={height - 6} strokeDasharray={level ? undefined : '3 3'} />
              <text className="axis" x={x(level)} y={16} textAnchor="middle">{LEVEL_LABELS[level]}</text>
            </g>
          ))}
          {domains.map((domain, index) => {
            const y = TOP + ROW * index + ROW / 2;
            const now = averageLevel(people, index);
            const max = target(index);
            const below = people.filter((p) => p.levels[index] < effectiveLevel(plan, p.departmentId, index)).length;
            const counts = [0, 1, 2, 3].map((level) => people.filter((p) => p.levels[index] === level).length);
            const reason = reasons?.find((r) => r.domainNumber === domain.number);
            const lines = labelLines(domain.name);
            const rank = priorities.indexOf(index);
            return (
              <g key={domain.categoryId} className="row" opacity={focus != null && focus !== index ? 0.28 : 1}
                {...bind(
                  <>
                    <b>M{domain.number} · {domain.name}</b><br />
                    Hiện tại <b>{formatAverage(now)}</b> · Tối đa <b>{LEVEL_LABELS[max]}</b><br />
                    <span className="mut">
                      {below}/{people.length} người cần học · {counts.flatMap((n, l) => (n ? [`${LEVEL_LABELS[l]} ${n}`] : [])).join(' · ')}
                    </span>
                    {reason && <><br /><span className="ai">✦ {reason.text}</span></>}
                  </>,
                )}>
                <rect className="hit" x={0} y={y - ROW / 2} width={W} height={ROW} rx={8} />
                <text className="code" x={12} y={y + 4}>M{domain.number}</text>
                <text className="name" x={44} y={lines.length > 1 ? y - 3 : y + 4}>
                  <title>{domain.name}</title>
                  {lines.map((line, i) => <tspan key={i} x={44} dy={i ? 15 : 0}>{line}</tspan>)}
                </text>
                {rank >= 0 && (
                  <g className="rank" aria-label={`Ưu tiên ${rank + 1}`}>
                    <circle cx={LEFT - 18} cy={y} r={10} />
                    <text x={LEFT - 18} y={y + 4} textAnchor="middle">{rank + 1}</text>
                  </g>
                )}
                <line className="track" x1={x(0)} y1={y} x2={x(3)} y2={y} strokeWidth={6} strokeLinecap="round" />
                {TIERS.map((tier) => {
                  const from = Math.max(now, tier - 1);
                  const to = Math.min(max, tier);
                  return to > from + 0.001 ? (
                    <line key={tier} className="seg" pathLength={1} x1={x(from)} y1={y} x2={x(to)} y2={y} stroke={PHASES[tier].color} strokeWidth={6} strokeLinecap="round"
                      opacity={phase && phase !== tier ? 0.18 : 1} style={{ animationDelay: `${300 + index * 90 + (tier - 1) * 220}ms` }} />
                  ) : null;
                })}
                {TIERS.map((tier) => (
                  <circle key={tier} className="station" cx={x(tier)} cy={y} r={5} stroke={tier <= max ? 'var(--rp-p2)' : 'var(--tp-line)'} />
                ))}
                <g transform={`translate(${x(max)},${y})`}>
                  <g className="flag" style={{ animationDelay: `${700 + index * 90}ms` }}>
                    <line x1={0} y1={2} x2={0} y2={-20} stroke="var(--rp-max)" strokeWidth={2} />
                    <path d="M0 -20 L13 -15 L0 -10 Z" fill="var(--rp-max)" />
                  </g>
                </g>
                <g className="now" style={{ animationDelay: `${200 + index * 90}ms` }}>
                  <circle cx={x(now)} cy={y} r={14} fill="var(--rp-now)" opacity={0.14} />
                  <circle cx={x(now)} cy={y} r={7.5} fill="var(--rp-now)" stroke="var(--tp-card)" strokeWidth={2.5} />
                </g>
                <text className="value" x={x(now)} y={y + 22} textAnchor="middle">{formatAverage(now)}</text>
                {now >= max
                  ? <text className="ok" x={RIGHT + 14} y={y + 4}>✓</text>
                  : <text className="gap" x={RIGHT + 14} y={y + 4}>còn {formatAverage(max - now)}</text>}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="rp-legend">
        <span className="rp-key">
          <span><i className="dot" />Hiện tại</span>
          <span><i className="flag" />Mức tối đa</span>
          {TIERS.map((tier) => <span key={tier}><i className="seg" style={{ background: PHASES[tier].color }} />{PHASES[tier].label}</span>)}
          {priorities.length > 0 && <span><i className="rank">1</i>✦ Ưu tiên</span>}
        </span>
        <Link className="tp-btn small" to={`/enterprise/setup?plan=${kind}`} style={{ marginLeft: 'auto' }}>Chỉnh phạm vi →</Link>
      </div>
      <HoverTip tip={tip} />
    </section>
  );
}
