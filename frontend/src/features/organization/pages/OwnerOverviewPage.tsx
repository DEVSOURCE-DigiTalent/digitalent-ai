import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BrainCircuit,
  Database,
  Lightbulb,
  MailWarning,
  MessagesSquare,
  PenTool,
  Send,
  ShieldCheck,
  ShoppingCart,
  UserRoundX,
} from 'lucide-react';
import { useLearningActivity } from '@/hooks/use-analytics';
import { useCourseCatalog } from '@/hooks/use-assignments';
import { useOrganizationOverview } from '@/hooks/use-organization';
import { useCapabilityProgress } from '@/hooks/use-skill-gaps';
import { PageLoading } from '@/components/shared/LoadingState';
import type { LearningActivity } from '@/services/analytics.service';
import type { CapabilityProgress } from '@/services/intelligence.service';
import { SendAnnouncementModal } from '../components/SendAnnouncementModal';
import {
  courseWheel,
  PERSON_STATES,
  personState,
  teamSummary,
  todoItems,
  whenText,
  type PersonState,
  type TodoItem,
  type WheelCourse,
} from '../lib/owner-overview';
import './owner-overview.css';

const DOMAIN_ICONS = [Database, MessagesSquare, PenTool, ShieldCheck, Lightbulb, BrainCircuit];
const DOMAIN_SHORT = ['Dữ liệu', 'Giao tiếp', 'Sáng tạo', 'An toàn', 'Giải quyết vấn đề', 'Trí tuệ nhân tạo'];
/** The two hues of each domain on the course wheel (as on Khóa học), pastel for Cơ bản → bright for Nâng cao. */
const DOMAIN_COLORS: [string, string][] = [
  ['#5fd8cb', '#1f97c4'], ['#8fb6fb', '#4766e0'], ['#ee9cf7', '#8d5cf6'],
  ['#6fdea4', '#11a07a'], ['#fdb27a', '#e5603f'], ['#b6a6fb', '#6552e6'],
];
const LEVEL_NAMES = ['', 'Cơ bản', 'Trung cấp', 'Nâng cao'];
/** Last two words' first letters: "Nguyễn Văn An" → "VA". */
const initials = (name: string) => name.trim().split(/\s+/).slice(-2).map((word) => word[0]?.toLocaleUpperCase('vi') ?? '').join('');

/**
 * OW-01 · Tổng quan, the owner's page once the organization uses the platform for real. Four pictures, one question
 * each: where the team stands (a tile per person by position), which courses the company has (a small course wheel),
 * whether people learn (weeks of courses started / finished) and who just finished one — plus what to act on now.
 */
export function OwnerOverviewPage() {
  useUiLanguage();
  const [announcing, setAnnouncing] = useState(false);
  const organization = useOrganizationOverview();
  const progress = useCapabilityProgress();
  const catalog = useCourseCatalog({});
  const activity = useLearningActivity();

  const courses = useMemo(() => courseWheel(catalog.data?.items ?? []), [catalog.data]);
  const todo = useMemo(() => (organization.data && progress.data
    ? todoItems({ pendingInvites: organization.data.members.pending, people: progress.data.people, courses: catalog.data ? courses : [] })
    : []), [organization.data, progress.data, catalog.data, courses]);

  if (organization.isLoading) return <PageLoading label={translateUi('Đang tải tổng quan')} />;
  if (organization.isError || !organization.data) {
    return <div className="ov-page"><p className="ov-error">{translateUi('Không thể tải thông tin tổng quan doanh nghiệp')}</p></div>;
  }

  return (
    <div className="ov-page">
      <header className="ov-header">
        <div>
          <h1>{translateUi('Tổng quan')}</h1>
          <p>{organization.data.name}</p>
        </div>
        <div className="ov-header__actions">
          <Link to="/enterprise/reports" className="ov-btn ov-btn--ghost">{translateUi('Báo cáo chu kỳ')}</Link>
          <button type="button" className="ov-btn ov-btn--primary" onClick={() => setAnnouncing(true)}>
            <Send size={15} aria-hidden="true" />{translateUi('Gửi thông báo')}
          </button>
        </div>
      </header>

      {todo.length > 0 && <TodoStrip items={todo} />}

      <div className="ov-grid">
        <TeamCard data={progress.data} loading={progress.isLoading} failed={progress.isError} />
        <CoursesCard courses={courses} loading={catalog.isLoading} failed={catalog.isError} />
        <RhythmCard data={activity.data} loading={activity.isLoading} failed={activity.isError} />
        <RecentCard data={activity.data} loading={activity.isLoading} failed={activity.isError} />
      </div>

      {announcing && <SendAnnouncementModal open={announcing} onClose={() => setAnnouncing(false)} />}
    </div>
  );
}

const TODO_ICONS: Record<TodoItem['key'], typeof MailWarning> = { invites: MailWarning, positions: UserRoundX, courses: ShoppingCart };

function TodoStrip({ items }: { items: TodoItem[] }) {
  useUiLanguage();
  return (
    <section className="ov-todo" aria-label={translateUi('Cần làm')}>
      <h2>{translateUi('Cần làm')}</h2>
      <ul>
        {items.map((item) => {
          const Icon = TODO_ICONS[item.key];
          return (
            <li key={item.key}>
              <Link to={item.to}><Icon size={16} aria-hidden="true" />{translateUi(item.label)}<ArrowRight size={14} aria-hidden="true" /></Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function CardState({ loading, failed, children }: { loading: boolean; failed: boolean; children: React.ReactNode }) {
  useUiLanguage();
  if (loading) return <div className="ov-skeleton" aria-busy="true" aria-label={translateUi('Đang tải')} />;
  if (failed) return <p className="ov-muted">{translateUi('Chưa tải được dữ liệu.')}</p>;
  return <>{children}</>;
}

/** Every employee as a tile, grouped by position and coloured by how far they are from their required level. */
function TeamCard({ data, loading, failed }: { data?: CapabilityProgress; loading: boolean; failed: boolean }) {
  useUiLanguage();
  const [focus, setFocus] = useState<PersonState | null>(null);
  const summary = data ? teamSummary(data) : null;
  const rise = summary ? summary.counts.met - summary.metAtSurvey : 0;
  return (
    <section className="ov-card ov-team" aria-label={translateUi('Đội ngũ')}>
      <div className="ov-card__head">
        <h2>{translateUi('Đội ngũ')}</h2>
        <Link to="/enterprise/skill-gap" className="ov-link">{translateUi('Khoảng trống năng lực')}<ArrowRight size={14} aria-hidden="true" /></Link>
      </div>
      <CardState loading={loading} failed={failed}>
        {summary && summary.total === 0 ? (
          <div className="ov-empty">
            <strong>{translateUi('Chưa có nhân viên')}</strong>
            <Link to="/enterprise/members" className="ov-link">{translateUi('Mời nhân viên')}<ArrowRight size={14} aria-hidden="true" /></Link>
          </div>
        ) : summary && (
          <>
            <div className="ov-team__headline">
              <p className="ov-big"><strong>{summary.counts.met}</strong>/{summary.total}</p>
              <p className="ov-team__caption">{translateUi('người đạt đủ mức cần đạt')}</p>
              {rise > 0 && <span className="ov-pill" data-tone="up">{translateUi(`▲ ${rise} người so với lúc khảo sát`)}</span>}
            </div>
            <ul className="ov-states" aria-label={translateUi('Chọn một trạng thái để làm nổi bật')}>
              {PERSON_STATES.map((state) => (
                <li key={state.key}>
                  <button type="button" data-state={state.key} aria-pressed={focus === state.key}
                    aria-label={`${translateUi(state.label)}: ${translateUi(`${summary.counts[state.key]} người`)}`}
                    onClick={() => setFocus(focus === state.key ? null : state.key)}>
                    <i aria-hidden="true" />{translateUi(state.label)}<b>{summary.counts[state.key]}</b>
                  </button>
                </li>
              ))}
              {summary.improved > 0 && <li className="ov-states__note"><span aria-hidden="true">▲</span>{translateUi('đã lên mức từ khảo sát')}</li>}
            </ul>
            <div className="ov-team__groups" data-focus={focus ?? undefined}>
              {summary.groups.map((group) => (
                <div key={group.key} className="ov-team__row">
                  <p className="ov-team__name" title={group.name}><span>{group.name}</span><small>{group.people.length}</small></p>
                  <ul className="ov-tiles">
                    {group.people.map((person, index) => {
                      const state = personState(person);
                      const label = PERSON_STATES.find((item) => item.key === state)!.label;
                      const up = person.levelsGained > 0;
                      const tip = `${person.name} · ${translateUi(label)}${up ? ` · ${translateUi(`lên ${person.levelsGained} cấp từ khảo sát`)}` : ''}`;
                      return (
                        <li key={person.employeeId} style={{ '--i': index } as CSSProperties}>
                          <Link to={`/enterprise/skill-gap/${person.employeeId}`} className="ov-tile" data-state={state} data-up={up || undefined}
                            data-tip={tip} aria-label={tip}>
                            <span aria-hidden="true">{initials(person.name)}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </>
        )}
      </CardState>
    </section>
  );
}

const WHEEL = { size: 216, center: 108, rings: [[42, 62], [64.5, 83], [85.5, 103]] as const, gapDeg: 2.4 };

const polar = (radius: number, deg: number) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [WHEEL.center + radius * Math.cos(rad), WHEEL.center + radius * Math.sin(rad)];
};

function segmentPath(domain: number, level: number) {
  const [inner, outer] = WHEEL.rings[level - 1];
  const start = (domain - 1) * 60 - 30 + WHEEL.gapDeg / 2;
  const end = domain * 60 - 30 - WHEEL.gapDeg / 2;
  const [x1, y1] = polar(outer, start);
  const [x2, y2] = polar(outer, end);
  const [x3, y3] = polar(inner, end);
  const [x4, y4] = polar(inner, start);
  return `M${x1},${y1} A${outer},${outer} 0 0 1 ${x2},${y2} L${x3},${y3} A${inner},${inner} 0 0 0 ${x4},${y4} Z`;
}

/** The company's 18 courses as a small course wheel (as on Khóa học): filled = owned, dashed = still to buy. */
function CoursesCard({ courses, loading, failed }: { courses: WheelCourse[]; loading: boolean; failed: boolean }) {
  useUiLanguage();
  const navigate = useNavigate();
  const [hover, setHover] = useState<WheelCourse | null>(null);
  const owned = courses.filter((course) => course.owned).length;
  const missing = courses.length - owned;
  return (
    <section className="ov-card ov-courses" aria-label={translateUi('Khóa học của công ty')}>
      <div className="ov-card__head">
        <h2>{translateUi('Khóa học của công ty')}</h2>
      </div>
      <CardState loading={loading} failed={failed}>
        <div className="ov-wheel">
          <svg viewBox={`0 0 ${WHEEL.size} ${WHEEL.size}`} role="img" aria-label={translateUi(`${owned}/${courses.length} khóa học đã có`)}>
            {courses.map((course) => {
              const [from, to] = DOMAIN_COLORS[course.domain - 1];
              const fill = course.level === 1 ? from : course.level === 3 ? to : `color-mix(in srgb, ${from} 45%, ${to})`;
              const name = `${translateUi(DOMAIN_SHORT[course.domain - 1])} · ${translateUi(LEVEL_NAMES[course.level])} · ${translateUi(course.owned ? 'Đã có' : 'Chưa mua')}`;
              return (
                <path key={course.id} d={segmentPath(course.domain, course.level)} className="ov-wheel__seg"
                  data-owned={course.owned || undefined} style={course.owned ? { fill } : undefined}
                  role="link" tabIndex={0} aria-label={`${course.title}: ${name}`}
                  onMouseEnter={() => setHover(course)} onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(course)} onBlur={() => setHover(null)}
                  onClick={() => navigate(`/enterprise/courses/${course.id}`)}
                  onKeyDown={(event) => { if (event.key === 'Enter') navigate(`/enterprise/courses/${course.id}`); }} />
              );
            })}
          </svg>
          <div className="ov-wheel__hub" aria-hidden="true">
            {hover ? (
              <>
                <small>{translateUi(DOMAIN_SHORT[hover.domain - 1])}</small>
                <b>{translateUi(LEVEL_NAMES[hover.level])}</b>
                <small data-owned={hover.owned || undefined}>{translateUi(hover.owned ? 'Đã có' : 'Chưa mua')}</small>
              </>
            ) : (
              <><b className="ov-wheel__count">{owned}<span>/{courses.length}</span></b><small>{translateUi('khóa đã có')}</small></>
            )}
          </div>
        </div>
        <div className="ov-courses__foot">
          <span>{translateUi(missing > 0 ? `Còn ${missing} khóa chưa mua` : 'Đã có đủ khóa học')}</span>
          <Link to="/enterprise/courses" className="ov-link">{translateUi('Xem khóa học')}<ArrowRight size={14} aria-hidden="true" /></Link>
        </div>
      </CardState>
    </section>
  );
}

const CHART = { height: 210, left: 30, right: 8, top: 14, bottom: 30, pair: 3 };

/** The chart is drawn at the width it gets, so its text keeps its size on a phone. */
function useWidth<T extends HTMLElement>(fallback: number) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(280, Math.round(entry.contentRect.width))));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

/** An even top so the middle tick is a whole number too: 3 → 4, 7 → 8, 13 → 14. */
const niceMax = (value: number) => (value <= 4 ? 4 : Math.ceil(value / 2) * 2);

const barPath = (x: number, y: number, width: number, height: number) => {
  const r = Math.min(4, height / 2, width / 2);
  return `M${x},${y + height} V${y + r} Q${x},${y} ${x + r},${y} H${x + width - r} Q${x + width},${y} ${x + width},${y + r} V${y + height} Z`;
};

const weekLabel = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

/** Courses started and finished week by week: whether the courses bought are used. */
function RhythmCard({ data, loading, failed }: { data?: LearningActivity; loading: boolean; failed: boolean }) {
  useUiLanguage();
  const [active, setActive] = useState<number | null>(null);
  const [chartRef, width] = useWidth<HTMLDivElement>(620);
  const weeks = data?.weeks ?? [];
  const max = niceMax(Math.max(0, ...weeks.flatMap((week) => [week.started, week.completed])));
  const plotW = width - CHART.left - CHART.right;
  const plotH = CHART.height - CHART.top - CHART.bottom;
  const slot = weeks.length ? plotW / weeks.length : plotW;
  const bar = Math.max(6, Math.min(14, slot / 2 - 6));
  const y = (value: number) => CHART.top + plotH - (value / max) * plotH;
  const quiet = weeks.every((week) => week.started === 0 && week.completed === 0);
  const hovered = active == null ? null : weeks[active];

  return (
    <section className="ov-card ov-rhythm" aria-label={translateUi('Nhịp học')}>
      <div className="ov-card__head">
        <h2>{translateUi('Nhịp học')}</h2>
        <ul className="ov-legend">
          <li><i data-series="started" aria-hidden="true" />{translateUi('Bắt đầu học')}</li>
          <li><i data-series="completed" aria-hidden="true" />{translateUi('Học xong')}</li>
        </ul>
      </div>
      <CardState loading={loading} failed={failed}>
        {data && (
          <>
            <div className="ov-rhythm__stats">
              <p><b className="ov-big">{data.learners}</b><span>{translateUi('người đang học')}</span></p>
              <p><b>{data.completed}</b><span>{translateUi('khóa đã học xong')}</span></p>
              {data.completedLast30Days > 0 && <span className="ov-pill" data-tone="up">{translateUi(`+${data.completedLast30Days} trong 30 ngày`)}</span>}
            </div>
            <div className="ov-chart" ref={chartRef}>
              <svg viewBox={`0 0 ${width} ${CHART.height}`} width={width} height={CHART.height} role="img"
                aria-label={translateUi(`Số khóa bắt đầu và học xong theo tuần, ${weeks.length} tuần gần nhất`)}>
                {[0, max / 2, max].map((tick) => (
                  <g key={tick}>
                    <line x1={CHART.left} x2={width - CHART.right} y1={y(tick)} y2={y(tick)} className={tick === 0 ? 'ov-chart__base' : 'ov-chart__grid'} />
                    <text x={CHART.left - 8} y={y(tick) + 4} textAnchor="end" className="ov-chart__tick">{tick}</text>
                  </g>
                ))}
                {weeks.map((week, index) => {
                  const cx = CHART.left + slot * index + slot / 2;
                  const left = cx - bar - CHART.pair / 2;
                  const current = index === weeks.length - 1;
                  return (
                    <g key={week.weekStart} data-active={active === index || undefined}>
                      {active === index && <rect x={cx - slot / 2 + 3} y={CHART.top} width={slot - 6} height={plotH} rx={8} className="ov-chart__hover" />}
                      {week.started > 0 && <path d={barPath(left, y(week.started), bar, y(0) - y(week.started))} className="ov-chart__bar" data-series="started" />}
                      {week.completed > 0 && <path d={barPath(cx + CHART.pair / 2, y(week.completed), bar, y(0) - y(week.completed))} className="ov-chart__bar" data-series="completed" />}
                      <text x={cx} y={CHART.height - 9} textAnchor="middle" className="ov-chart__x" data-current={current || undefined}>
                        {current ? translateUi(slot < 52 ? 'Nay' : 'Tuần này') : weekLabel(week.weekStart)}
                      </text>
                      <rect x={cx - slot / 2} y={0} width={slot} height={CHART.height} fill="transparent"
                        onMouseEnter={() => setActive(index)} onMouseLeave={() => setActive(null)} />
                    </g>
                  );
                })}
              </svg>
              {quiet && <p className="ov-chart__quiet">{translateUi(`Chưa có lượt học nào trong ${weeks.length} tuần qua`)}</p>}
              {hovered && (
                <p className="ov-chart__tip" style={{ left: Math.min(width - 70, Math.max(70, CHART.left + slot * active! + slot / 2)) }}>
                  <b>{translateUi(`Tuần ${weekLabel(hovered.weekStart)}`)}</b>
                  <span><i data-series="started" />{translateUi(`${hovered.started} bắt đầu`)}</span>
                  <span><i data-series="completed" />{translateUi(`${hovered.completed} học xong`)}</span>
                </p>
              )}
            </div>
            <table className="sr-only">
              <caption>{translateUi('Nhịp học')}</caption>
              <thead><tr><th>{translateUi('Tuần')}</th><th>{translateUi('Bắt đầu học')}</th><th>{translateUi('Học xong')}</th></tr></thead>
              <tbody>{weeks.map((week) => <tr key={week.weekStart}><td>{weekLabel(week.weekStart)}</td><td>{week.started}</td><td>{week.completed}</td></tr>)}</tbody>
            </table>
          </>
        )}
      </CardState>
    </section>
  );
}

/** The latest courses finished: who, which course, when. */
function RecentCard({ data, loading, failed }: { data?: LearningActivity; loading: boolean; failed: boolean }) {
  useUiLanguage();
  return (
    <section className="ov-card ov-recent" aria-label={translateUi('Vừa học xong')}>
      <div className="ov-card__head"><h2>{translateUi('Vừa học xong')}</h2></div>
      <CardState loading={loading} failed={failed}>
        {data && data.recent.length === 0 ? <p className="ov-muted">{translateUi('Chưa có ai học xong khóa nào.')}</p> : (
          <ul className="ov-recent__list">
            {data?.recent.map((item) => {
              const Icon = item.domainNumber ? DOMAIN_ICONS[item.domainNumber - 1] : Lightbulb;
              const colors = item.domainNumber ? DOMAIN_COLORS[item.domainNumber - 1] : ['#cbd5e1', '#64748b'];
              return (
                <li key={`${item.employeeId}-${item.completedAt}`}>
                  <Link to={`/enterprise/skill-gap/${item.employeeId}`} className="ov-recent__row"
                    style={{ '--from': colors[0], '--to': colors[1] } as CSSProperties}>
                    <span className="ov-recent__icon" aria-hidden="true"><Icon size={17} /></span>
                    <span className="ov-recent__text">
                      <strong>{item.employeeName}</strong>
                      <small>{item.courseTitle}</small>
                    </span>
                    <span className="ov-recent__meta">
                      {item.level && <em>{translateUi(LEVEL_NAMES[item.level])}</em>}
                      <time dateTime={item.completedAt}>{translateUi(whenText(item.completedAt))}</time>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardState>
    </section>
  );
}
