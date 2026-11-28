import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BrainCircuit, ChevronDown, Database, Lightbulb, MessagesSquare, PenTool, Search, ShieldCheck, TrendingDown, X } from 'lucide-react';
import { useCapabilityProgress } from '@/hooks/use-skill-gaps';
import { useBehaviorOverview } from '@/hooks/use-behavior-reports';
import { PERMISSIONS, usePermission } from '@/hooks/use-permission';
import { LoadingProgress } from '@/components/shared/LoadingState';
import type { BehaviorEmployee } from '@/services/behavior-report.service';
import type { CapabilityProgress, CapabilityProgressEmployee } from '@/services/intelligence.service';
import { BehaviorBadge, BehaviorOverviewCard } from '@/features/behavior-reports/components/BehaviorOverviewCard';
import { PersonBehaviorPanel } from '@/features/behavior-reports/components/PersonBehaviorPanel';
import { OwnerFilterSelect } from '../components/OwnerFilterSelect';
import { positionKey, scopeView, type ScopeDomain, type ScopeView } from '../lib/capability-progress';
import { DomainLineChart } from '@/features/trial-program/components/DomainLineChart';
import './owner-capability-progress.css';

/**
 * OW-21 · Khoảng trống năng lực, once the organization uses the platform for real. Charts first, few words: how much of
 * the required level the company (or one position) meets now versus at the survey, the shape per domain, the
 * positions side by side, and who moved most / needs help. The data is loaded once; a position is a client-side scope
 * (positions are shared by every department; each person is compared with the level of the position they hold).
 * Exam behavior sits beside the levels (canonical v3.10): a "Hành vi khi thi" strip for the scope, a badge on each
 * person with a final to look at, and a person panel that puts their level per domain next to their course finals and
 * replays one (video, timeline, AI evidence).
 */
const DOMAIN_ICONS = [Database, MessagesSquare, PenTool, ShieldCheck, Lightbulb, BrainCircuit];
const DOMAIN_SHORT = ['Dữ liệu', 'Giao tiếp', 'Sáng tạo', 'An toàn', 'Giải quyết vấn đề', 'Trí tuệ nhân tạo'];
const LEVELS = ['Chưa đạt', 'Cơ bản', 'Trung cấp', 'Nâng cao'];
const PAGE = 8;

const shortName = (number: number, name = '') => DOMAIN_SHORT[number - 1] ?? name;
const levelName = (level: number) => LEVELS[Math.max(0, Math.min(3, Math.round(level)))];
const formatLevel = (level: number) => level.toLocaleString('vi-VN', { maximumFractionDigits: 1 });
const initials = (name: string) => name.split(' ').filter(Boolean).slice(-2).map((part) => part[0]).join('').toUpperCase();
/** Domains compared with the survey where the person is below / above what they had at the survey. */
const comparedDomains = (person: CapabilityProgressEmployee) => person.domains.filter((d) => d.atSurvey != null && d.now != null);
const domainsBelow = (person: CapabilityProgressEmployee) => comparedDomains(person).filter((d) => d.now! < d.required);
const domainsImproved = (person: CapabilityProgressEmployee) => comparedDomains(person).filter((d) => d.now! > d.atSurvey!);

export function OwnerCapabilityGapPage() {
  useUiLanguage();
  const [scope, setScope] = useState('');
  const progress = useCapabilityProgress();
  const data = progress.data;
  const view = useMemo(() => (data ? scopeView(data, scope || undefined) : null), [data, scope]);
  const position = data?.positions.find((p) => positionKey(p.positionId) === scope);
  const { can } = usePermission();
  const behavior = useBehaviorOverview(can(PERMISSIONS.BEHAVIOR_REPORT_READ));
  const behaviorOf = useMemo(() => new Map((behavior.data?.employees ?? []).map((e) => [e.employeeId, e])), [behavior.data]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [openReport, setOpenReport] = useState<string | undefined>();
  const open = (employeeId: string, reportId?: string) => { setOpenReport(reportId); setOpenId(employeeId); };
  const scopedPeople = useMemo(
    () => (data ? (scope ? data.people.filter((p) => positionKey(p.positionId) === scope) : data.people) : []),
    [data, scope]);
  const scopedBehavior = useMemo(() => {
    const ids = new Set(scopedPeople.map((p) => p.employeeId));
    return (behavior.data?.employees ?? []).filter((e) => ids.has(e.employeeId));
  }, [behavior.data, scopedPeople]);
  const peopleById = useMemo(() => new Map((data?.people ?? []).map((p) => [p.employeeId, p])), [data]);
  const openPerson = openId ? data?.people.find((p) => p.employeeId === openId) : undefined;
  const openBehavior = openId ? behaviorOf.get(openId) : undefined;

  return (
    <div className="cp-page">
      <header className="cp-header">
        <div className="cp-header__title">
          <h1>{translateUi('Khoảng trống năng lực')}</h1>
          {data && view && (
            <div className="cp-meta">
              {position
                ? <button type="button" className="cp-scope" onClick={() => setScope('')} aria-label={translateUi(`Bỏ lọc ${position.name}`)}>{position.name}<X size={13} aria-hidden="true" /></button>
                : <span className="cp-scope cp-scope--all">{translateUi('Toàn công ty')}</span>}
              {data.surveyedAt && <span>{translateUi('Khảo sát')} {new Date(data.surveyedAt).toLocaleDateString('vi-VN')}</span>}
              <span>{translateUi(`${view.assessed}/${view.employees} có kết quả`)}</span>
            </div>
          )}
        </div>
        {data && (
          <OwnerFilterSelect icon="filter" label={translateUi('Vị trí')} value={scope} onChange={setScope}
            options={[{ value: '', label: 'Toàn công ty' }, ...data.positions.map((p) => ({ value: positionKey(p.positionId), label: p.name }))]} />
        )}
      </header>

      {progress.isLoading ? (
        <div className="cp-card"><LoadingProgress label={translateUi('Đang tải khoảng trống năng lực…')} /></div>
      ) : progress.isError || !data || !view ? (
        <div className="cp-card cp-error" role="alert">
          {translateUi('Không tải được khoảng trống năng lực.')}{' '}
          <button type="button" onClick={() => void progress.refetch()}>{translateUi('Thử lại')}</button>
        </div>
      ) : view.assessed === 0 ? (
        <>
          <div className="cp-card cp-empty">
            <TrendingDown size={26} aria-hidden="true" />
            <strong>{translateUi(position && view.employees === 0 ? 'Chưa có nhân viên ở vị trí này' : 'Chưa có kết quả khảo sát để so sánh')}</strong>
            {position && <button type="button" className="cp-link" onClick={() => setScope('')}>{translateUi('Xem toàn công ty')}</button>}
          </div>
          {scopedBehavior.length > 0 && <BehaviorOverviewCard employees={scopedBehavior} people={peopleById} onOpen={open} />}
        </>
      ) : (
        <>
          <div className="cp-top">
            <div className="cp-top__side">
              <MetCard view={view} />
              <PriorityCard view={view} />
            </div>
            <DomainResults domains={view.domains} />
          </div>
          {scopedBehavior.length > 0 && <BehaviorOverviewCard employees={scopedBehavior} people={peopleById} onOpen={open} />}
          <div className="cp-main">
            <DomainRadar domains={view.domains} />
            <div className="cp-main__side">
              <PositionDumbbells data={data} selected={scope} onPick={setScope} />
              <NeedsCard view={view} behaviorOf={behaviorOf} onOpen={open} />
            </div>
          </div>
          <AllPeople people={scopedPeople} behaviorOf={behaviorOf} onOpen={open} />
        </>
      )}
      {openId && (openPerson || openBehavior) && (
        <PersonBehaviorPanel
          key={`${openId}-${openReport ?? ''}`}
          person={openPerson}
          behavior={openBehavior}
          name={openPerson?.name ?? openBehavior?.reports[0]?.employeeName ?? ''}
          initialReportId={openReport}
          onClose={() => setOpenId(null)}
        />
      )}
    </div>
  );
}

/** Share of the required level met, now, with the survey value as a ghost marker on the same meter. */
function MetCard({ view }: { view: ScopeView }) {
  useUiLanguage();
  const now = view.metNow ?? 0;
  const before = view.metAtSurvey ?? 0;
  const delta = now - before;
  return (
    <section className="cp-card cp-kpi cp-met" aria-label={translateUi('Mức đạt chuẩn')}
      title={translateUi('Tỷ lệ cặp nhân viên × lĩnh vực đã đạt mức cần đạt')}>
      <h2>{translateUi('Mức đạt chuẩn')}</h2>
      <div className="cp-met__value">
        <strong>{now}<small>%</small></strong>
        {delta !== 0 && <span className="cp-delta" data-tone={delta > 0 ? 'up' : 'down'}>{delta > 0 ? '▲' : '▼'} {Math.abs(delta)}</span>}
      </div>
      <div className="cp-meter" role="img" aria-label={translateUi(`Đạt chuẩn: lúc khảo sát ${before}%, hiện tại ${now}%`)}>
        <span className="cp-meter__fill" style={{ width: `${now}%` }} />
        <span className="cp-meter__ghost" style={{ left: `${before}%` }} />
      </div>
      <div className="cp-meter__scale"><span>{translateUi(`Lúc khảo sát ${before}%`)}</span><span>100%</span></div>
      <p className="cp-met__hint">{translateUi('Phần trăm lĩnh vực đã đạt mức cần đạt, tính trên mọi nhân viên có kết quả.')}</p>
    </section>
  );
}

/** Where training pays first: the domains where the largest share of people is still below the required level. */
function PriorityCard({ view }: { view: ScopeView }) {
  useUiLanguage();
  const rows = view.domains.filter((d) => d.belowNow > 0)
    .sort((a, b) => b.belowNow / b.compared - a.belowNow / a.compared || b.belowNow - a.belowNow || a.number - b.number)
    .slice(0, 3);
  return (
    <section className="cp-card cp-kpi cp-priority" aria-label={translateUi('Lĩnh vực cần ưu tiên')}>
      <h2>{translateUi('Lĩnh vực cần ưu tiên')}</h2>
      {rows.length === 0 ? <p className="cp-muted">{translateUi('Mọi lĩnh vực đã đạt mức cần đạt.')}</p> : (
        <ol className="cp-priority__list">
          {rows.map((d, index) => {
            const Icon = DOMAIN_ICONS[d.number - 1] ?? Database;
            return (
              <li key={d.number} data-domain={d.number}>
                <span className="cp-priority__rank" aria-hidden="true">{index + 1}</span>
                <span className="cp-priority__body">
                  <span className="cp-priority__name"><Icon size={14} aria-hidden="true" />{translateUi(shortName(d.number, d.name))}</span>
                  <span className="cp-priority__bar" aria-hidden="true"><i style={{ width: `${(d.belowNow / d.compared) * 100}%` }} /></span>
                </span>
                <span className="cp-priority__count">{translateUi(`${d.belowNow}/${d.compared} người chưa đạt`)}</span>
              </li>
            );
          })}
        </ol>
      )}
      <Link to="/enterprise/courses" className="cp-priority__link">{translateUi('Xem khóa học')}<ArrowRight size={14} aria-hidden="true" /></Link>
    </section>
  );
}

/** Axis labels of the line chart, as on the survey results page. */
const AXIS_SHORT = ['1. Dữ liệu', '2. Giao tiếp', '3. Sáng tạo', '4. An toàn', '5. Giải quyết VĐ', '6. Trí tuệ AI'];

/** The chart of the survey results page ("Kết quả theo lĩnh vực"): the level now (average) against the required level. */
function DomainResults({ domains }: { domains: ScopeDomain[] }) {
  useUiLanguage();
  return (
    <section className="cp-card cp-results" aria-label={translateUi('Kết quả theo lĩnh vực')}>
      <h2>{translateUi('Kết quả theo lĩnh vực')}</h2>
      <DomainLineChart points={domains.map((d) => ({
        number: d.number,
        name: d.name,
        short: AXIS_SHORT[d.number - 1] ?? `${d.number}. ${shortName(d.number, d.name)}`,
        current: d.now,
        target: d.required,
      }))} tone="ocean" />
    </section>
  );
}

const RADAR_SIZE = 340;
const RADAR_CENTER = RADAR_SIZE / 2;
const RADAR_RADIUS = 124;

function radarPoint(level: number, index: number, count: number, radius = RADAR_RADIUS): [number, number] {
  const angle = -Math.PI / 2 + (2 * Math.PI * index) / count;
  const r = (radius * Math.max(0, Math.min(3, level))) / 3;
  return [RADAR_CENTER + r * Math.cos(angle), RADAR_CENTER + r * Math.sin(angle)];
}
const radarPolygon = (values: number[]) => values.map((v, i) => radarPoint(v, i, values.length).map((n) => n.toFixed(1)).join(',')).join(' ');

/** The company's (or position's) shape over the domains: required (dashed violet), at the survey (light), now (dark). */
function DomainRadar({ domains }: { domains: ScopeDomain[] }) {
  useUiLanguage();
  const [active, setActive] = useState<number | null>(null);
  const count = domains.length;
  const focus = active == null ? null : domains[active];
  return (
    <section className="cp-card cp-radar" aria-label={translateUi('Năng lực theo lĩnh vực')}>
      <header className="cp-card__head">
        <h2>{translateUi('Năng lực theo lĩnh vực')}</h2>
        <ul className="cp-legend" aria-label={translateUi('Chú giải')}>
          <li><i className="cp-swatch cp-swatch--req" aria-hidden="true" />{translateUi('Cần đạt')}</li>
          <li><i className="cp-swatch cp-swatch--before" aria-hidden="true" />{translateUi('Lúc khảo sát')}</li>
          <li><i className="cp-swatch cp-swatch--now" aria-hidden="true" />{translateUi('Hiện tại')}</li>
        </ul>
      </header>
      {count < 3 ? (
        <ul className="cp-radar__fallback">
          {domains.map((d) => (
            <li key={d.number}>{translateUi(shortName(d.number, d.name))}: {translateUi(levelName(d.atSurvey))} → {translateUi(levelName(d.now))} / {translateUi(levelName(d.required))}</li>
          ))}
        </ul>
      ) : (
        <div className="cp-radar__stage">
          <svg viewBox={`0 0 ${RADAR_SIZE} ${RADAR_SIZE}`} role="img"
            aria-label={translateUi('Biểu đồ mạng nhện: mức trung bình mỗi lĩnh vực lúc khảo sát, hiện tại và mức cần đạt')}>
            <defs>
              <radialGradient id="cp-radar-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#eef4ff" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* Level rings, outer first: Nâng cao / Trung cấp / Cơ bản (thin light lines, a very light glow inside). */}
            {[3, 2, 1].map((level) => (
              <polygon key={level} className="cp-radar__ring" data-level={level} points={radarPolygon(domains.map(() => level))} />
            ))}
            {domains.map((_, i) => {
              const [x, y] = radarPoint(3, i, count);
              return <line key={i} className="cp-radar__axis" x1={RADAR_CENTER} y1={RADAR_CENTER} x2={x} y2={y} />;
            })}
            <polygon className="cp-radar__shape cp-radar__shape--req" points={radarPolygon(domains.map((d) => d.required))} />
            <polygon className="cp-radar__shape cp-radar__shape--before" points={radarPolygon(domains.map((d) => d.atSurvey))} />
            <polygon className="cp-radar__shape cp-radar__shape--now" points={radarPolygon(domains.map((d) => d.now))} />
            {domains.map((d, i) => {
              const [x, y] = radarPoint(d.now, i, count);
              return <circle key={d.number} className="cp-radar__dot" data-active={active === i || undefined} cx={x} cy={y} r={active === i ? 6 : 4} />;
            })}
          </svg>
          {domains.map((d, i) => {
            const [x, y] = radarPoint(3, i, count, RADAR_RADIUS + 30);
            const Icon = DOMAIN_ICONS[d.number - 1] ?? Database;
            return (
              <button key={d.number} type="button" className="cp-radar__label" data-domain={d.number} data-active={active === i || undefined}
                style={{ left: `${(x / RADAR_SIZE) * 100}%`, top: `${(y / RADAR_SIZE) * 100}%` }}
                onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)} onFocus={() => setActive(i)} onBlur={() => setActive(null)}
                aria-label={translateUi(`${d.name}: lúc khảo sát ${formatLevel(d.atSurvey)}, hiện tại ${formatLevel(d.now)}, cần đạt ${formatLevel(d.required)}`)}>
                <Icon size={14} aria-hidden="true" />{translateUi(shortName(d.number, d.name))}
                {d.belowNow > 0 && <em>{d.belowNow}</em>}
              </button>
            );
          })}
          {focus && (
            <div className="cp-radar__tip" role="status">
              <strong>{translateUi(focus.name)}</strong>
              <span>{translateUi('Lúc khảo sát')}: {translateUi(levelName(focus.atSurvey))} ({formatLevel(focus.atSurvey)})</span>
              <span>{translateUi('Hiện tại')}: {translateUi(levelName(focus.now))} ({formatLevel(focus.now)})</span>
              <span>{translateUi('Cần đạt')}: {translateUi(levelName(focus.required))}</span>
              {focus.belowNow > 0 && <span className="cp-radar__tip-warn">{translateUi(`${focus.belowNow} người còn thiếu`)}</span>}
            </div>
          )}
          {/* A table view of the radar for screen readers (a table ignores the 1px width, so the wrapper hides it). */}
          <div className="sr-only"><table>
            <caption>{translateUi('Năng lực theo lĩnh vực')}</caption>
            <thead><tr><th>{translateUi('Lĩnh vực')}</th><th>{translateUi('Lúc khảo sát')}</th><th>{translateUi('Hiện tại')}</th><th>{translateUi('Cần đạt')}</th></tr></thead>
            <tbody>{domains.map((d) => <tr key={d.number}><td>{d.name}</td><td>{formatLevel(d.atSurvey)}</td><td>{formatLevel(d.now)}</td><td>{formatLevel(d.required)}</td></tr>)}</tbody>
          </table></div>
        </div>
      )}
      {count >= 3 && (
        // Which ring is which level, under the plot so no label sits on the shapes.
        <ul className="cp-radar__rings" aria-label={translateUi('Các vòng của biểu đồ')}>
          {[1, 2, 3].map((level) => (
            <li key={level} data-level={level}><RingKey level={level} />{translateUi(`Vòng ${level === 3 ? 'ngoài' : level === 2 ? 'giữa' : 'trong'}: ${LEVELS[level]}`)}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Mini radar: three nested hexagons, the ring of `level` drawn in its colour. */
function RingKey({ level }: { level: number }) {
  const hex = (r: number) => Array.from({ length: 6 }, (_, i) => {
    const angle = -Math.PI / 2 + (Math.PI / 3) * i;
    return `${(12 + r * Math.cos(angle)).toFixed(1)},${(12 + r * Math.sin(angle)).toFixed(1)}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      {[3, 2, 1].map((ring) => (
        <polygon key={ring} points={hex(ring * 3.6)} data-on={ring === level || undefined} />
      ))}
    </svg>
  );
}

/** Positions, weakest first: share of the required level met at the survey (ring) → now (dot). Click = scope. */
function PositionDumbbells({ data, selected, onPick }: { data: CapabilityProgress; selected: string; onPick: (key: string) => void }) {
  useUiLanguage();
  const rows = useMemo(() => data.positions
    .map((p) => ({ ...p, key: positionKey(p.positionId), view: scopeView(data, positionKey(p.positionId), 0) }))
    .sort((a, b) => (a.view.metNow ?? 101) - (b.view.metNow ?? 101) || a.name.localeCompare(b.name, 'vi')), [data]);
  return (
    <section className="cp-card cp-depts" aria-label={translateUi('Vị trí')}>
      <header className="cp-card__head">
        <h2>{translateUi('Vị trí')}</h2>
        <span className="cp-axis-note">{translateUi('% đạt chuẩn')}</span>
      </header>
      <ul className="cp-depts__list">
        {rows.map((row) => {
          const before = row.view.metAtSurvey;
          const now = row.view.metNow;
          const delta = now != null && before != null ? now - before : 0;
          return (
            <li key={row.key}>
              <button type="button" className="cp-dept" aria-pressed={selected === row.key}
                onClick={() => onPick(selected === row.key ? '' : row.key)}
                aria-label={translateUi(row.employees === 0 ? `${row.name}: chưa có người` : now == null ? `${row.name}: chưa có kết quả` : `${row.name}: đạt chuẩn ${before}% lúc khảo sát, ${now}% hiện tại`)}>
                <span className="cp-dept__name">{row.name}</span>
                <span className="cp-dept__cells" aria-hidden="true">
                  {data.domains.map((domain) => {
                    const cell = row.view.domains.find((d) => d.number === domain.number);
                    const met = cell ? (cell.compared - cell.belowNow) / cell.compared : null;
                    return (
                      <i key={domain.number} data-none={met == null || undefined} style={{ '--met': met ?? 0 } as React.CSSProperties}
                        title={`${shortName(domain.number, domain.name)}: ${met == null ? 'chưa có kết quả' : `${Math.round(met * 100)}% đạt`}`} />
                    );
                  })}
                </span>
                <span className="cp-dept__track" aria-hidden="true">
                  {now != null && before != null && (
                    <>
                      <span className="cp-dept__span" style={{ left: `${Math.min(before, now)}%`, width: `${Math.abs(now - before)}%` }} />
                      <span className="cp-dept__before" style={{ left: `${before}%` }} />
                      <span className="cp-dept__now" style={{ left: `${now}%` }} />
                    </>
                  )}
                </span>
                <span className="cp-dept__value">
                  {now == null ? <small>{translateUi(row.employees === 0 ? 'Chưa có người' : 'Chưa có')}</small> : <>{now}%{delta > 0 && <em>▲{delta}</em>}</>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <ul className="cp-legend cp-depts__legend" aria-label={translateUi('Chú giải')}>
        <li><i className="cp-dot cp-dot--before" aria-hidden="true" />{translateUi('Lúc khảo sát')}</li>
        <li><i className="cp-dot cp-dot--now" aria-hidden="true" />{translateUi('Hiện tại')}</li>
        <li><i className="cp-cells-key" aria-hidden="true" />{translateUi('6 lĩnh vực · đậm = đạt nhiều')}</li>
      </ul>
    </section>
  );
}

const topGap = (person: CapabilityProgressEmployee) => domainsBelow(person)
  .sort((a, b) => (b.required - b.now!) - (a.required - a.now!))[0];

type PeopleProps = { behaviorOf: ReadonlyMap<string, BehaviorEmployee>; onOpen: (employeeId: string) => void };

/** Who still lacks most, beside the positions: name, position, the most urgent domain and how many domains are below. */
function NeedsCard({ view, behaviorOf, onOpen }: { view: ScopeView } & PeopleProps) {
  useUiLanguage();
  const shortOf = (person: CapabilityProgressEmployee) => `${domainsBelow(person).length}/${comparedDomains(person).length}`;
  // When everyone listed lacks the same share, say it once above the list instead of the same pill on every row.
  const shared = view.needs.length > 1 && view.needs.every((person) => shortOf(person) === shortOf(view.needs[0])) ? shortOf(view.needs[0]) : null;
  return (
    <section className="cp-card cp-hl cp-needs" data-tone="need" aria-label={translateUi('Cần hỗ trợ')}>
      <div className="cp-needs__head">
        <h2>{translateUi('Cần hỗ trợ')}</h2>
        {shared && <small>{translateUi(`${view.needs.length} người · đều chưa đạt ${shared} lĩnh vực`)}</small>}
      </div>
      {view.needs.length === 0 ? <p className="cp-muted">{translateUi('Mọi người đã đạt mức cần đạt.')}</p> : (
        <ul>{view.needs.map((person) => {
          const gap = topGap(person);
          return (
            <li key={person.employeeId}>
              <button type="button" className="cp-hl__row" onClick={() => onOpen(person.employeeId)}>
                <span className="cp-avatar" data-tone="need" aria-hidden="true">{initials(person.name)}</span>
                <span className="cp-hl__who">
                  <strong>{person.name}<small>{person.positionName ?? person.departmentName}</small></strong>
                  {gap && <span className="cp-hl__note" data-domain={gap.number}>{translateUi(shortName(gap.number, gap.name))}: {translateUi(LEVELS[gap.now!])} → {translateUi(`cần ${LEVELS[gap.required]}`)}</span>}
                </span>
                <span className="cp-hl__tags">
                  {!shared && <span className="cp-pill" data-tone="need">{translateUi(`Chưa đạt ${shortOf(person)} lĩnh vực`)}</span>}
                  <BehaviorBadge employee={behaviorOf.get(person.employeeId)} />
                </span>
              </button>
            </li>
          );
        })}</ul>
      )}
    </section>
  );
}

/** Everyone, behind one button: the owner looks at the charts first. */
function AllPeople({ people, behaviorOf, onOpen }: { people: CapabilityProgressEmployee[] } & PeopleProps) {
  useUiLanguage();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [shown, setShown] = useState(PAGE);
  const visible = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('vi');
    return query ? people.filter((person) => person.name.toLocaleLowerCase('vi').includes(query)) : people;
  }, [people, search]);
  return (
    <section className="cp-card cp-people" aria-label={translateUi('Tất cả nhân viên')}>
      <button type="button" className="cp-people__toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
        {translateUi(`Tất cả nhân viên (${people.length})`)}<ChevronDown size={16} aria-hidden="true" />
      </button>
      {open && (
        <>
          <label className="cp-search">
            <Search size={15} aria-hidden="true" />
            <input value={search} onChange={(event) => { setSearch(event.target.value); setShown(PAGE); }}
              aria-label={translateUi('Tìm nhân viên')} placeholder={translateUi('Tìm nhân viên')} />
          </label>
          <ul>
            {visible.slice(0, shown).map((person) => {
              const gaps = domainsBelow(person);
              const improved = domainsImproved(person).length;
              return (
                <li key={person.employeeId}>
                  <button type="button" className="cp-person" onClick={() => onOpen(person.employeeId)}>
                    <span className="cp-avatar" aria-hidden="true">{initials(person.name)}</span>
                    <span className="cp-person__who">
                      <strong>{person.name}</strong>
                      <small>{[...new Set([person.positionName, person.departmentName].filter(Boolean))].join(' · ')}</small>
                    </span>
                    <span className="cp-person__gaps">
                      {!person.assessed ? <span className="cp-chip" data-state="none">{translateUi('Chưa có kết quả khảo sát')}</span>
                        : gaps.length === 0 ? <span className="cp-chip" data-state="met">{translateUi('Đã đạt đủ')}</span>
                        : gaps.map((d) => (
                          <span key={d.categoryId} className="cp-chip" data-domain={d.number}>
                            {translateUi(shortName(d.number, d.name))}: {translateUi(LEVELS[d.now!])} → {translateUi(`cần ${LEVELS[d.required]}`)}
                          </span>
                        ))}
                    </span>
                    <span className="cp-person__tags">
                      {improved > 0 && <span className="cp-pill" data-tone="up">{translateUi(`Lên mức ở ${improved} lĩnh vực`)}</span>}
                      <BehaviorBadge employee={behaviorOf.get(person.employeeId)} />
                    </span>
                    <ArrowRight className="cp-person__go" size={16} aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>
          {visible.length === 0 && <p className="cp-muted">{translateUi('Không có nhân viên phù hợp.')}</p>}
          {visible.length > shown && (
            <button type="button" className="cp-more" onClick={() => setShown(shown + PAGE)}>
              {translateUi(`Xem thêm ${Math.min(PAGE, visible.length - shown)} người`)}
            </button>
          )}
        </>
      )}
    </section>
  );
}
