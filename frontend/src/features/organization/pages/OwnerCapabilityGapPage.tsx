import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BrainCircuit, ChevronDown, Database, Lightbulb, MessagesSquare, PenTool, Search, ShieldCheck, TrendingDown, X } from 'lucide-react';
import { useCapabilityProgress } from '@/hooks/use-skill-gaps';
import { LoadingProgress } from '@/components/shared/LoadingState';
import type { CapabilityProgress, CapabilityProgressEmployee } from '@/services/intelligence.service';
import { OwnerFilterSelect } from '../components/OwnerFilterSelect';
import { scopeView, type PeopleBuckets, type ScopeDomain, type ScopeView } from '../lib/capability-progress';
import './owner-capability-progress.css';

/**
 * OW-21 · Khoảng trống năng lực, once the organization uses the platform for real. Charts first, few words: how much of
 * the required level the company (or one department) meets now versus at the survey, the shape per domain, the
 * departments side by side, and who moved most / needs help. The data is loaded once; a department is a client-side scope.
 */
const DOMAIN_ICONS = [Database, MessagesSquare, PenTool, ShieldCheck, Lightbulb, BrainCircuit];
const DOMAIN_SHORT = ['Dữ liệu', 'Giao tiếp', 'Sáng tạo', 'An toàn', 'Giải quyết vấn đề', 'Trí tuệ nhân tạo'];
const LEVELS = ['Chưa đạt', 'Cơ bản', 'Trung cấp', 'Nâng cao'];
const PAGE = 8;

const shortName = (number: number, name = '') => DOMAIN_SHORT[number - 1] ?? name;
const levelName = (level: number) => LEVELS[Math.max(0, Math.min(3, Math.round(level)))];
const formatLevel = (level: number) => level.toLocaleString('vi-VN', { maximumFractionDigits: 1 });
const initials = (name: string) => name.split(' ').filter(Boolean).slice(-2).map((part) => part[0]).join('').toUpperCase();

export function OwnerCapabilityGapPage() {
  useUiLanguage();
  const [departmentId, setDepartmentId] = useState('');
  const progress = useCapabilityProgress();
  const data = progress.data;
  const view = useMemo(() => (data ? scopeView(data, departmentId || undefined) : null), [data, departmentId]);
  const department = data?.departments.find((d) => d.departmentId === departmentId);

  return (
    <div className="cp-page">
      <header className="cp-header">
        <div className="cp-header__title">
          <h1>{translateUi('Khoảng trống năng lực')}</h1>
          {data && view && (
            <div className="cp-meta">
              {department
                ? <button type="button" className="cp-scope" onClick={() => setDepartmentId('')} aria-label={translateUi(`Bỏ lọc ${department.name}`)}>{department.name}<X size={13} aria-hidden="true" /></button>
                : <span className="cp-scope cp-scope--all">{translateUi('Toàn công ty')}</span>}
              {data.surveyedAt && <span>{translateUi('Khảo sát')} {new Date(data.surveyedAt).toLocaleDateString('vi-VN')}</span>}
              <span>{translateUi(`${view.assessed}/${view.employees} có kết quả`)}</span>
            </div>
          )}
        </div>
        {data && (
          <OwnerFilterSelect icon="filter" label={translateUi('Phòng ban')} value={departmentId} onChange={setDepartmentId}
            options={[{ value: '', label: 'Toàn công ty' }, ...data.departments.map((d) => ({ value: d.departmentId, label: d.name }))]} />
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
        <div className="cp-card cp-empty">
          <TrendingDown size={26} aria-hidden="true" />
          <strong>{translateUi('Chưa có kết quả khảo sát để so sánh')}</strong>
        </div>
      ) : (
        <>
          <div className="cp-kpis">
            <MetCard view={view} />
            <PeopleShift view={view} />
            <GapCard view={view} />
          </div>
          <div className="cp-main">
            <DomainRadar domains={view.domains} />
            <DepartmentDumbbells data={data} selected={departmentId} onPick={setDepartmentId} />
          </div>
          <Highlights view={view} />
          <AllPeople people={departmentId ? data.people.filter((p) => p.departmentId === departmentId) : data.people} />
        </>
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
    </section>
  );
}

const BUCKETS: { key: keyof PeopleBuckets; label: string }[] = [
  { key: 'met', label: 'Đạt đủ' },
  { key: 'small', label: 'Thiếu 1–2 cấp' },
  { key: 'large', label: 'Thiếu từ 3 cấp' },
  { key: 'none', label: 'Chưa có kết quả' },
];

/** The same people split by what they lack, at the survey and now: the green part should grow. */
function PeopleShift({ view }: { view: ScopeView }) {
  useUiLanguage();
  const total = view.employees || 1;
  const bar = (label: string, counts: PeopleBuckets) => (
    <div className="cp-shift__row">
      <span className="cp-shift__label">{translateUi(label)}</span>
      <span className="cp-shift__bar" role="img"
        aria-label={translateUi(`${label}: ${BUCKETS.map((b) => `${b.label} ${counts[b.key]}`).join(', ')}`)}>
        {BUCKETS.map((bucket) => counts[bucket.key] > 0 && (
          <i key={bucket.key} data-bucket={bucket.key} style={{ width: `${(counts[bucket.key] / total) * 100}%` }}
            title={`${translateUi(bucket.label)}: ${counts[bucket.key]}`}>
            {counts[bucket.key] / total >= 0.1 ? counts[bucket.key] : ''}
          </i>
        ))}
      </span>
    </div>
  );
  return (
    <section className="cp-card cp-kpi cp-shift" aria-label={translateUi('Nhân viên')}>
      <h2>{translateUi('Nhân viên')}</h2>
      {bar('Lúc khảo sát', view.people.atSurvey)}
      {bar('Hiện tại', view.people.now)}
      <ul className="cp-shift__legend">
        {BUCKETS.map((bucket) => <li key={bucket.key}><i data-bucket={bucket.key} aria-hidden="true" />{translateUi(bucket.label)}</li>)}
      </ul>
    </section>
  );
}

/** Missing levels summed over everyone: how much closed since the survey. */
function GapCard({ view }: { view: ScopeView }) {
  useUiLanguage();
  const closed = Math.max(0, view.gapsAtSurvey - view.gapsNow);
  const height = (value: number) => `${view.gapsAtSurvey ? Math.max(4, (value / view.gapsAtSurvey) * 100) : 0}%`;
  return (
    <section className="cp-card cp-kpi cp-gap" aria-label={translateUi('Khoảng trống')}
      title={translateUi('Số cấp năng lực còn thiếu, cộng cho mọi người và mọi lĩnh vực')}>
      <h2>{translateUi('Khoảng trống')}</h2>
      <div className="cp-gap__body">
        <div className="cp-gap__columns" role="img" aria-label={translateUi(`Cấp còn thiếu: lúc khảo sát ${view.gapsAtSurvey}, hiện tại ${view.gapsNow}`)}>
          <span data-tone="before"><i style={{ height: height(view.gapsAtSurvey) }} /><b>{view.gapsAtSurvey}</b></span>
          <span data-tone="now"><i style={{ height: height(view.gapsNow) }} /><b>{view.gapsNow}</b></span>
        </div>
        <div className="cp-gap__closed">
          <strong>{closed}</strong>
          <span>{translateUi('cấp đã đóng')}</span>
        </div>
      </div>
    </section>
  );
}

const RADAR_SIZE = 340;
const RADAR_CENTER = RADAR_SIZE / 2;
const RADAR_RADIUS = 116;

function radarPoint(level: number, index: number, count: number, radius = RADAR_RADIUS): [number, number] {
  const angle = -Math.PI / 2 + (2 * Math.PI * index) / count;
  const r = (radius * Math.max(0, Math.min(3, level))) / 3;
  return [RADAR_CENTER + r * Math.cos(angle), RADAR_CENTER + r * Math.sin(angle)];
}
const radarPolygon = (values: number[]) => values.map((v, i) => radarPoint(v, i, values.length).map((n) => n.toFixed(1)).join(',')).join(' ');

/** The company's (or department's) shape over the domains: required (dashed violet), at the survey (light), now (dark). */
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
            {[1, 2, 3].map((level) => (
              <polygon key={level} className="cp-radar__ring" points={radarPolygon(domains.map(() => level))} />
            ))}
            {domains.map((_, i) => {
              const [x, y] = radarPoint(3, i, count);
              return <line key={i} className="cp-radar__axis" x1={RADAR_CENTER} y1={RADAR_CENTER} x2={x} y2={y} />;
            })}
            {[1, 2, 3].map((level) => {
              const [x, y] = radarPoint(level, 0, count);
              return <text key={level} className="cp-radar__tick" x={x + 4} y={y + 3}>{translateUi(LEVELS[level])}</text>;
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
    </section>
  );
}

/** Departments, weakest first: share of the required level met at the survey (ring) → now (dot). Click = scope. */
function DepartmentDumbbells({ data, selected, onPick }: { data: CapabilityProgress; selected: string; onPick: (id: string) => void }) {
  useUiLanguage();
  const rows = useMemo(() => data.departments
    .map((d) => ({ ...d, view: scopeView(data, d.departmentId, 0) }))
    .sort((a, b) => (a.view.metNow ?? 101) - (b.view.metNow ?? 101) || a.name.localeCompare(b.name, 'vi')), [data]);
  return (
    <section className="cp-card cp-depts" aria-label={translateUi('Phòng ban')}>
      <header className="cp-card__head">
        <h2>{translateUi('Phòng ban')}</h2>
        <span className="cp-axis-note">{translateUi('% đạt chuẩn')}</span>
      </header>
      <ul className="cp-depts__list">
        {rows.map((row) => {
          const before = row.view.metAtSurvey;
          const now = row.view.metNow;
          const delta = now != null && before != null ? now - before : 0;
          return (
            <li key={row.departmentId}>
              <button type="button" className="cp-dept" aria-pressed={selected === row.departmentId}
                onClick={() => onPick(selected === row.departmentId ? '' : row.departmentId)}
                aria-label={translateUi(now == null ? `${row.name}: chưa có kết quả` : `${row.name}: đạt chuẩn ${before}% lúc khảo sát, ${now}% hiện tại`)}>
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
                  {now == null ? <small>{translateUi('Chưa có')}</small> : <>{now}%{delta > 0 && <em>▲{delta}</em>}</>}
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

/** Two short lists instead of everyone: who moved most since the survey, who still lacks most. */
function Highlights({ view }: { view: ScopeView }) {
  useUiLanguage();
  if (view.gainers.length === 0 && view.needs.length === 0) return null;
  const topGap = (person: CapabilityProgressEmployee) => person.domains
    .filter((d) => d.now != null && d.now < d.required)
    .sort((a, b) => (b.required - b.now!) - (a.required - a.now!))[0];
  return (
    <div className="cp-highlights">
      <section className="cp-card cp-hl" data-tone="up" aria-label={translateUi('Tiến bộ nhiều nhất')}>
        <h2>{translateUi('Tiến bộ nhiều nhất')}</h2>
        {view.gainers.length === 0 ? <p className="cp-muted">{translateUi('Chưa có ai tăng cấp kể từ khảo sát.')}</p> : (
          <ul>{view.gainers.map((person) => (
            <li key={person.employeeId}>
              <Link to={`/enterprise/skill-gap/${person.employeeId}`} className="cp-hl__row">
                <span className="cp-avatar" aria-hidden="true">{initials(person.name)}</span>
                <span className="cp-hl__who"><strong>{person.name}</strong><small>{person.departmentName}</small></span>
                <span className="cp-hl__mini" aria-label={translateUi(`Thiếu ${person.gapsAtSurvey} cấp lúc khảo sát, còn ${person.gapsNow}`)}>
                  <b>{person.gapsAtSurvey}</b><ArrowRight size={12} aria-hidden="true" /><b>{person.gapsNow}</b>
                </span>
                <span className="cp-pill" data-tone="up">▲ {person.levelsGained}</span>
              </Link>
            </li>
          ))}</ul>
        )}
      </section>
      <section className="cp-card cp-hl" data-tone="need" aria-label={translateUi('Cần hỗ trợ')}>
        <h2>{translateUi('Cần hỗ trợ')}</h2>
        {view.needs.length === 0 ? <p className="cp-muted">{translateUi('Mọi người đã đạt mức cần đạt.')}</p> : (
          <ul>{view.needs.map((person) => {
            const gap = topGap(person);
            return (
              <li key={person.employeeId}>
                <Link to={`/enterprise/skill-gap/${person.employeeId}`} className="cp-hl__row">
                  <span className="cp-avatar" data-tone="need" aria-hidden="true">{initials(person.name)}</span>
                  <span className="cp-hl__who"><strong>{person.name}</strong><small>{person.departmentName}</small></span>
                  {gap && <span className="cp-chip" data-domain={gap.number}>{translateUi(shortName(gap.number, gap.name))} → {translateUi(LEVELS[gap.required])}</span>}
                  <span className="cp-pill" data-tone="need">{translateUi(`thiếu ${person.gapsNow}`)}</span>
                </Link>
              </li>
            );
          })}</ul>
        )}
      </section>
    </div>
  );
}

/** Everyone, behind one button: the owner looks at the charts first. */
function AllPeople({ people }: { people: CapabilityProgressEmployee[] }) {
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
              const gaps = person.domains.filter((d) => d.now != null && d.now < d.required);
              return (
                <li key={person.employeeId}>
                  <Link to={`/enterprise/skill-gap/${person.employeeId}`} className="cp-person">
                    <span className="cp-avatar" aria-hidden="true">{initials(person.name)}</span>
                    <span className="cp-person__who">
                      <strong>{person.name}</strong>
                      <small>{[person.departmentName, person.positionName].filter(Boolean).join(' · ')}</small>
                    </span>
                    <span className="cp-person__gaps">
                      {!person.assessed ? <span className="cp-chip" data-state="none">{translateUi('Chưa có kết quả khảo sát')}</span>
                        : gaps.length === 0 ? <span className="cp-chip" data-state="met">{translateUi('Đã đạt đủ')}</span>
                        : gaps.map((d) => (
                          <span key={d.categoryId} className="cp-chip" data-domain={d.number}>
                            {translateUi(shortName(d.number, d.name))}: {translateUi(LEVELS[d.now!])} → {translateUi(LEVELS[d.required])}
                          </span>
                        ))}
                    </span>
                    {person.levelsGained > 0 && <span className="cp-pill" data-tone="up">▲ {person.levelsGained}</span>}
                    <ArrowRight className="cp-person__go" size={16} aria-hidden="true" />
                  </Link>
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
