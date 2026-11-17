import { translateUi, uiLocale, useUiLanguage } from '@/lib/i18n';
import { useId, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2, X, type LucideIcon } from 'lucide-react';
import { LEVEL_LABELS } from '../lib/trial-format';
import { TrialDisclosure } from './TrialDisclosure';
import '../competency-line-chart.css';

export interface CompetencyChartDomain {
  id: string;
  number: number;
  name: string;
  shortName: string;
  icon: LucideIcon;
  /** Mức trung bình của đội ngũ, 0–3. */
  average: number;
  /** Mức đã làm tròn do máy chủ tính (dùng cho nhãn). */
  level: number;
  /** Mức so sánh: mốc doanh nghiệp, hoặc trung bình mức tham chiếu theo vị trí; 0–3, null = chưa có. */
  target: number | null;
  /** true = mức so sánh là mốc doanh nghiệp đã đặt; false = mức tham chiếu theo vị trí. */
  usesMilestone: boolean;
  /** Số người ở từng mức 0..3. */
  counts: number[];
  /** Số người có mức so sánh. */
  compared: number;
  /** Số người dưới mức so sánh. */
  gapCount: number;
  course: { code: string; level: number } | null;
  priority: boolean;
}

/** Thang thứ bậc một sắc độ cho mức 0–3 (đã kiểm tra: độ sáng giảm dần, đầu nhạt ≥ 2:1 trên nền trắng). */
const LEVEL_RAMP =['#93b9bd', '#55a19c', '#22807b', '#0f4f53'] as const;
const LEVEL_INK = ['#0f2f33', '#0f2f33', '#ffffff', '#ffffff'] as const;
const AXIS_LABELS = ['Chưa đạt', 'Cơ bản', 'Trung cấp', 'Nâng cao'] as const;
const MAX_LEVEL = 3;
const TIP_WIDTH = 276;

type Point = { x: number; y: number };
type Segment = { from: Point; c1: Point; c2: Point; to: Point };

/** Đường cong đơn điệu (Fritsch–Carlson): đi qua đúng từng điểm và không vọt quá giá trị thật. */
function monotone(points: Point[]): Segment[] {
  const n = points.length;
  if (n < 2) return [];
  const slopes = points.slice(0, -1).map((p, i) => (points[i + 1].y - p.y) / (points[i + 1].x - p.x));
  const tangents = points.map((_, i) => {
    if (i === 0) return slopes[0];
    if (i === n - 1) return slopes[n - 2];
    const a = slopes[i - 1];
    const b = slopes[i];
    return a * b <= 0 ? 0 : (a + b) / 2;
  });
  slopes.forEach((s, i) => {
    if (s === 0) { tangents[i] = 0; tangents[i + 1] = 0; return; }
    const a = tangents[i] / s;
    const b = tangents[i + 1] / s;
    const h = a * a + b * b;
    if (h > 9) { const t = 3 / Math.sqrt(h); tangents[i] = t * a * s; tangents[i + 1] = t * b * s; }
  });
  return slopes.map((_, i) => {
    const from = points[i];
    const to = points[i + 1];
    const dx = (to.x - from.x) / 3;
    return { from, to, c1: { x: from.x + dx, y: from.y + tangents[i] * dx }, c2: { x: to.x - dx, y: to.y - tangents[i + 1] * dx } };
  });
}

const pt = (p: Point) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
const curve = (points: Point[]) => points.length
  ? `M${pt(points[0])}` + monotone(points).map((s) => `C${pt(s.c1)} ${pt(s.c2)} ${pt(s.to)}`).join('')
  : '';
/** Nối ngược theo cùng đường cong (không có lệnh M) để khép vùng giữa hai đường. */
const reverseCurve = (points: Point[]) => monotone(points).reverse().map((s) => `C${pt(s.c2)} ${pt(s.c1)} ${pt(s.from)}`).join('');

function useWidth(ref: RefObject<HTMLDivElement | null>) {
  const [width, setWidth] = useState(760);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => { if (el.clientWidth > 0) setWidth(el.clientWidth); };
    read();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(read);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

const formatLevel = (value: number) =>
  new Intl.NumberFormat(uiLocale(), { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);
const levelName = (value: number) => translateUi(LEVEL_LABELS[Math.max(0, Math.min(MAX_LEVEL, Math.round(value)))]);
const pad2 = (n: number) => String(n).padStart(2, '0');
const targetName = (domain: Pick<CompetencyChartDomain, 'usesMilestone'>) => (domain.usesMilestone ? 'Mốc doanh nghiệp' : 'Mức tham chiếu');
/** "x người dưới mốc" / "Cả đội đạt mốc", nói đúng mức đang so sánh: mốc doanh nghiệp hay mức tham chiếu theo vị trí. */
const gapText = (domain: Pick<CompetencyChartDomain, 'usesMilestone' | 'gapCount'>) => (domain.usesMilestone
  ? domain.gapCount > 0 ? `${domain.gapCount} người dưới mốc` : 'Cả đội đạt mốc'
  : domain.gapCount > 0 ? `${domain.gapCount} người dưới mức tham chiếu` : 'Cả đội đạt mức tham chiếu');

/**
 * Biểu đồ đường năng lực 6 lĩnh vực: trung bình đội ngũ so với mốc doanh nghiệp (lĩnh vực chưa đặt mốc dùng mức tham
 * chiếu theo vị trí). Rê chuột để xem phân bổ, nhấp để ghim khóa đề xuất.
 */
export function CompetencyLineChart({ domains, assessed, action }: { domains: CompetencyChartDomain[]; assessed: number; action?: ReactNode }) {
  useUiLanguage();
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const plotRef = useRef<HTMLDivElement>(null);
  const width = useWidth(plotRef);
  const [hover, setHover] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);
  const lastPinned = useRef<number | null>(null);
  if (pinned != null) lastPinned.current = pinned;

  if (!domains.length) return null;

  const compact = width < 560;
  const PAD = { top: 26, right: compact ? 12 : 24, bottom: 14, left: compact ? 66 : 84 };
  const height = compact ? 236 : 292;
  const plotW = Math.max(10, width - PAD.left - PAD.right);
  const plotH = height - PAD.top - PAD.bottom;
  const band = plotW / domains.length;
  const base = PAD.top + plotH;
  const xAt = (i: number) => PAD.left + (i + 0.5) * band;
  const yAt = (v: number) => PAD.top + (1 - Math.max(0, Math.min(MAX_LEVEL, v)) / MAX_LEVEL) * plotH;

  const hasTarget = domains.some((d) => d.target != null);
  const team = domains.map((d, i) => ({ x: xAt(i), y: yAt(d.average) }));
  const target = hasTarget ? domains.map((d, i) => ({ x: xAt(i), y: yAt(d.target ?? d.average) })) : [];
  const teamLine = curve(team);
  const first = team[0];
  const last = team[team.length - 1];
  const teamArea = `${teamLine}L${last.x.toFixed(1)},${base}L${first.x.toFixed(1)},${base}Z`;
  const gapArea = hasTarget ? `${teamLine}L${pt(target[target.length - 1])}${reverseCurve(target)}Z` : '';
  const aboveTeam = `${teamLine}L${last.x.toFixed(1)},0L${first.x.toFixed(1)},0Z`;

  const active = hover ?? pinned;
  const tip = hover != null ? domains[hover] : null;
  const tipX = hover != null ? xAt(hover) : 0;
  const tipLeft = width < TIP_WIDTH + 80
    ? Math.max(4, Math.min(width - TIP_WIDTH - 4, tipX - TIP_WIDTH / 2))
    : tipX + 20 + TIP_WIDTH <= width - 4 ? tipX + 20 : Math.max(4, tipX - 20 - TIP_WIDTH);
  const tipId = `${uid}-tip`;
  const togglePin = (i: number) => setPinned((current) => (current === i ? null : i));
  const shown = pinned ?? lastPinned.current;
  const detail = shown != null ? domains[shown] : null;

  return (
    <section className="tp-lc rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs" aria-labelledby={`${uid}-title`}>
      <header className="tp-lc__head">
        <div>
          <h3 id={`${uid}-title`}>{translateUi('Năng lực theo lĩnh vực')}</h3>
        </div>
        {hasTarget && (
          <ul className="tp-lc__legend" aria-label={translateUi('Chú giải')}>
            <li><svg width="22" height="10" aria-hidden="true"><line x1="1" y1="5" x2="21" y2="5" className="tp-lc__key-team" /></svg>{translateUi('Trung bình đội ngũ')}</li>
            <li><svg width="22" height="10" aria-hidden="true"><line x1="1" y1="5" x2="21" y2="5" className="tp-lc__key-target" /></svg>{translateUi(domains.some((d) => d.usesMilestone) ? 'Mốc doanh nghiệp' : 'Mức tham chiếu')}</li>
            <li><span className="tp-lc__key-gap" aria-hidden="true" />{translateUi('Khoảng trống')}</li>
          </ul>
        )}
        {action}
      </header>

      <div className="tp-lc__plot" ref={plotRef} onPointerLeave={() => setHover(null)}>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} aria-hidden="true" className="tp-lc__svg">
          <defs>
            <linearGradient id={`${uid}-area`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--lc-team)" stopOpacity="0.24" />
              <stop offset="100%" stopColor="var(--lc-team)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id={`${uid}-gap`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--lc-target)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--lc-target)" stopOpacity="0.07" />
            </linearGradient>
            <linearGradient id={`${uid}-column`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--lc-team)" stopOpacity="0.1" />
              <stop offset="100%" stopColor="var(--lc-team)" stopOpacity="0.015" />
            </linearGradient>
            <clipPath id={`${uid}-above`}><path d={aboveTeam} /></clipPath>
            <filter id={`${uid}-glow`} x="-10%" y="-60%" width="120%" height="220%"><feGaussianBlur stdDeviation="5" /></filter>
          </defs>

          {/* Thang mức: dải xen kẽ, đường lưới mảnh, nhãn mức có chấm màu cùng thang phân bổ. */}
          {[0, 1, 2].map((lv) => lv % 2 === 1 && (
            <rect key={`band-${lv}`} x={PAD.left} y={yAt(lv + 1)} width={plotW} height={plotH / MAX_LEVEL} className="tp-lc__band" />
          ))}
          {[0, 1, 2, 3].map((lv) => (
            <g key={`grid-${lv}`}>
              <line x1={PAD.left} x2={width - PAD.right} y1={yAt(lv)} y2={yAt(lv)} className={lv === 0 ? 'tp-lc__baseline' : 'tp-lc__grid'} />
              <circle cx={PAD.left - 10} cy={yAt(lv)} r="3" fill={LEVEL_RAMP[lv]} />
              <text x={PAD.left - 19} y={yAt(lv)} className="tp-lc__ylabel" textAnchor="end" dominantBaseline="middle">
                {translateUi(AXIS_LABELS[lv])}
              </text>
            </g>
          ))}

          {active != null && (
            <g className="tp-lc__focus">
              <rect x={xAt(active) - band / 2 + 4} y={PAD.top - 14} width={Math.max(0, band - 8)} height={plotH + 14 + PAD.bottom - 2} rx="14" fill={`url(#${uid}-column)`} />
              <line x1={xAt(active)} x2={xAt(active)} y1={PAD.top - 8} y2={base} className="tp-lc__crosshair" />
            </g>
          )}

          <g className="tp-lc__series">
            <path d={teamArea} fill={`url(#${uid}-area)`} />
            {hasTarget && <path d={gapArea} fill={`url(#${uid}-gap)`} clipPath={`url(#${uid}-above)`} />}
            {hasTarget && <path d={curve(target)} className="tp-lc__target" />}
            <path d={teamLine} className="tp-lc__glow" filter={`url(#${uid}-glow)`} />
            <path d={teamLine} className="tp-lc__team" />
          </g>

          {hasTarget && domains.map((d, i) => d.target != null && (
            <circle key={`t-${d.id}`} cx={target[i].x} cy={target[i].y} r={active === i ? 5 : 4} className="tp-lc__target-dot" style={{ animationDelay: `${420 + i * 70}ms` }} />
          ))}
          {domains.map((d, i) => (
            <g key={`p-${d.id}`} className="tp-lc__point" style={{ animationDelay: `${360 + i * 70}ms` }}>
              {d.priority && <circle cx={team[i].x} cy={team[i].y} r="7" className="tp-lc__pulse" />}
              {active === i && <circle cx={team[i].x} cy={team[i].y} r="14" className="tp-lc__halo" />}
              <circle cx={team[i].x} cy={team[i].y} r={active === i ? 6.5 : 5} className="tp-lc__dot" />
            </g>
          ))}

          {/* Vùng bắt chuột rộng bằng cả cột: không cần nhắm trúng chấm 8px. */}
          {domains.map((d, i) => (
            <rect
              key={`hit-${d.id}`}
              x={xAt(i) - band / 2}
              y={0}
              width={band}
              height={height}
              fill="transparent"
              className="tp-lc__hit"
              onPointerEnter={() => setHover(i)}
              onClick={() => togglePin(i)}
            />
          ))}
        </svg>

        {tip && hover != null && (
          <div id={tipId} role="tooltip" className="tp-lc__tip" style={{ width: TIP_WIDTH, transform: `translate(${tipLeft}px, ${PAD.top - 10}px)` }}>
            <p className="tp-lc__tip-eyebrow">{translateUi('Miền')} {pad2(tip.number)}{tip.priority && <span>{translateUi('Ưu tiên')}</span>}</p>
            <p className="tp-lc__tip-title">{tip.name}</p>
            <dl className="tp-lc__tip-series">
              <div>
                <dt><svg width="16" height="8" aria-hidden="true"><line x1="1" y1="4" x2="15" y2="4" className="tp-lc__key-team" /></svg>{translateUi('Trung bình đội ngũ')}</dt>
                <dd><strong>{formatLevel(tip.average)}</strong>{translateUi(LEVEL_LABELS[tip.level] ?? '')}</dd>
              </div>
              {tip.target != null && (
                <div>
                  <dt><svg width="16" height="8" aria-hidden="true"><line x1="1" y1="4" x2="15" y2="4" className="tp-lc__key-target" /></svg>{translateUi(targetName(tip))}</dt>
                  <dd><strong>{formatLevel(tip.target)}</strong>{levelName(tip.target)}</dd>
                </div>
              )}
            </dl>
            <LevelSpread counts={tip.counts} total={assessed} size="thin" />
            <ul className="tp-lc__tip-levels">
              {tip.counts.map((count, lv) => (
                <li key={lv} data-empty={count === 0}>
                  <span style={{ background: LEVEL_RAMP[lv] }} aria-hidden="true" />
                  {translateUi(AXIS_LABELS[lv])}<strong>{count}</strong>
                </li>
              ))}
            </ul>
            <p className="tp-lc__tip-foot">
              {translateUi(tip.compared > 0 ? gapText(tip) : 'Chưa có mốc')}
              {tip.course && <> · <strong>{tip.course.code}</strong></>}
            </p>
          </div>
        )}
      </div>

      <div className="tp-lc__axis" style={{ paddingLeft: PAD.left, paddingRight: PAD.right, gridTemplateColumns: `repeat(${domains.length}, minmax(0, 1fr))` }}>
        {domains.map((d, i) => {
          const Icon = d.icon;
          return (
            <button
              key={d.id}
              type="button"
              className="tp-lc__axis-btn"
              data-active={active === i}
              aria-pressed={pinned === i}
              aria-describedby={hover === i ? tipId : undefined}
              aria-label={`${translateUi('Miền')} ${pad2(d.number)} · ${d.name}`}
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              onClick={() => togglePin(i)}
            >
              <span className="tp-lc__axis-icon" aria-hidden="true"><Icon size={15} /></span>
              <span className="tp-lc__axis-num" aria-hidden="true">{pad2(d.number)}</span>
              <span className="tp-lc__axis-name" aria-hidden="true">{translateUi(d.shortName)}</span>
              {d.priority && <span className="tp-lc__axis-flag" aria-hidden="true">{translateUi('Ưu tiên')}</span>}
            </button>
          );
        })}
      </div>

      <TrialDisclosure open={pinned != null} id={`${uid}-detail`}>
        {detail && <DomainDetail domain={detail} assessed={assessed} onClose={() => setPinned(null)} />}
      </TrialDisclosure>

      {/* Bảng chỉ cho trình đọc màn hình; bọc trong div vì <table> không co về 1px. */}
      <div className="sr-only"><table>
        <caption>{translateUi('Năng lực theo lĩnh vực')}</caption>
        <thead>
          <tr>
            <th scope="col">{translateUi('Lĩnh vực')}</th>
            <th scope="col">{translateUi('Trung bình đội ngũ')}</th>
            <th scope="col">{translateUi('Mốc so sánh')}</th>
            <th scope="col">{translateUi('Phân bổ')}</th>
            <th scope="col">{translateUi('Khóa học đề xuất')}</th>
          </tr>
        </thead>
        <tbody>
          {domains.map((d) => (
            <tr key={d.id}>
              <th scope="row">{d.name}</th>
              <td>{formatLevel(d.average)} · {translateUi(LEVEL_LABELS[d.level] ?? '')}</td>
              <td>{d.target != null ? `${formatLevel(d.target)} · ${levelName(d.target)}` : '—'}</td>
              <td>{d.counts.map((count, lv) => `${translateUi(LEVEL_LABELS[lv])}: ${count}`).join(', ')}</td>
              <td>{d.course ? `${d.course.code} · ${translateUi(LEVEL_LABELS[d.course.level])}` : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </section>
  );
}

/** Thanh phân bổ theo mức. `thin`: 8px không chữ (trong tooltip); `tall`: 30px có số người trên từng khối. */
function LevelSpread({ counts, total, size }: { counts: number[]; total: number; size: 'thin' | 'tall' }) {
  useUiLanguage();
  const sum = Math.max(1, total || counts.reduce((a, b) => a + b, 0));
  return (
    <div className={`tp-lc-spread tp-lc-spread--${size}`} aria-hidden={size === 'thin'} role={size === 'tall' ? 'img' : undefined}
      aria-label={size === 'tall' ? counts.map((count, lv) => `${translateUi(LEVEL_LABELS[lv])}: ${count}`).join(', ') : undefined}>
      {counts.map((count, lv) => count > 0 && (
        <span key={lv} style={{ flexGrow: count, background: LEVEL_RAMP[lv], color: LEVEL_INK[lv] }}
          title={`${translateUi(LEVEL_LABELS[lv])}: ${count}`}>
          {size === 'tall' && count / sum >= 0.08 ? count : null}
        </span>
      ))}
    </div>
  );
}

function DomainDetail({ domain, assessed, onClose }: { domain: CompetencyChartDomain; assessed: number; onClose: () => void }) {
  useUiLanguage();
  const Icon = domain.icon;
  const sum = Math.max(1, assessed || domain.counts.reduce((a, b) => a + b, 0));
  const met = domain.compared - domain.gapCount;
  return (
    <div className="tp-lc-detail">
      <div className="tp-lc-detail__main">
        <div className="tp-lc-detail__head">
          <span className="tp-lc-detail__icon" aria-hidden="true"><Icon size={18} /></span>
          <div className="min-w-0">
            <p className="tp-lc-detail__eyebrow">{translateUi('Miền')} {pad2(domain.number)}{domain.priority && <span>{translateUi('Ưu tiên')}</span>}</p>
            <h4>{domain.name}</h4>
          </div>
          <button type="button" className="tp-lc-detail__close" onClick={onClose} aria-label={translateUi('Bỏ ghim')}>
            <X size={15} aria-hidden="true" />
          </button>
        </div>
        <LevelSpread counts={domain.counts} total={assessed} size="tall" />
        <ul className="tp-lc-detail__legend">
          {domain.counts.map((count, lv) => (
            <li key={lv} data-empty={count === 0}>
              <span style={{ background: LEVEL_RAMP[lv] }} aria-hidden="true" />
              {translateUi(LEVEL_LABELS[lv])}
              {count > 0 && count / sum < 0.08 && <strong>{count}</strong>}
            </li>
          ))}
        </ul>
      </div>

      <div className="tp-lc-detail__side">
        <dl className="tp-lc-detail__stats">
          <div><dt>{translateUi('Trung bình đội ngũ')}</dt><dd><strong>{formatLevel(domain.average)}</strong>{translateUi(LEVEL_LABELS[domain.level] ?? '')}</dd></div>
          {domain.target != null && <div><dt>{translateUi(targetName(domain))}</dt><dd><strong>{formatLevel(domain.target)}</strong>{levelName(domain.target)}</dd></div>}
          {domain.compared > 0 && (
            <div className="tp-lc-detail__meter">
              <dt>{translateUi(domain.usesMilestone ? 'Đạt mốc' : 'Đạt mức tham chiếu')}</dt>
              <dd><strong>{met}/{domain.compared}</strong>{translateUi('người')}</dd>
              <span aria-hidden="true"><i style={{ width: `${(met / domain.compared) * 100}%` }} /></span>
            </div>
          )}
        </dl>
        {domain.course ? (
          <Link to={`/enterprise/courses?focus=${domain.course.code}&level=${domain.course.level}`} className="tp-lc-detail__cta">
            <BookOpen size={15} aria-hidden="true" />
            {translateUi('Xem khóa')} {domain.course.code} · {translateUi(LEVEL_LABELS[domain.course.level])}
            <ArrowRight size={15} aria-hidden="true" className="tp-lc-detail__cta-arrow" />
          </Link>
        ) : (
          <p className="tp-lc-detail__ok"><CheckCircle2 size={15} aria-hidden="true" />{translateUi(domain.compared > 0 ? gapText(domain) : 'Chưa có mốc')}</p>
        )}
      </div>
    </div>
  );
}
