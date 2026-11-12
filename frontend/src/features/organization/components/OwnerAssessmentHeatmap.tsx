import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, Filter, Search, Sparkles } from 'lucide-react';
import { useTrialProgram } from '@/hooks/use-trial-program';
import type { TrialParticipant, TrialParticipantStatus } from '@/services/trial-program.service';
import './owner-assessment-heatmap.css';

const STAGES = [
  { key: 'invited', label: 'Chưa kích hoạt' },
  { key: 'active', label: 'Chưa nộp' },
  { key: 'submitted', label: 'Đã nộp' },
  { key: 'reviewed', label: 'Đã chấm' },
] as const;
type Stage = typeof STAGES[number]['key'];
type HeatmapMenuName = 'departments' | 'stages' | 'sort';
type SortOption = 'lowest' | 'highest' | 'name';
const ALL_STAGES: Stage[] = STAGES.map((stage) => stage.key);
const PEOPLE_PER_PAGE = 6;
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'lowest', label: 'Tỷ lệ thấp trước' },
  { value: 'highest', label: 'Tỷ lệ cao trước' },
  { value: 'name', label: 'Tên phòng ban' },
];

function stageOf(status: TrialParticipantStatus): Stage {
  if (status === 'INVITED' || status === 'INVITE_EXPIRED') return 'invited';
  if (status === 'ACTIVE') return 'active';
  if (status === 'SUBMITTED') return 'submitted';
  return 'reviewed';
}

interface DepartmentRow {
  name: string;
  people: TrialParticipant[];
  counts: Record<Stage, number>;
  rate: number | null;
}

export function OwnerAssessmentHeatmap() {
  useUiLanguage();
  const { data: program, isLoading, isError } = useTrialProgram();
  const [selectedDepartments, setSelectedDepartments] = useState<string[] | null>(null);
  const [visibleStages, setVisibleStages] = useState<Stage[]>(ALL_STAGES);
  const [sort, setSort] = useState<SortOption>('lowest');
  const [openMenu, setOpenMenu] = useState<HeatmapMenuName | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [closing, setClosing] = useState<string[]>([]);
  const closeTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const [showAll, setShowAll] = useState(false);
  const [search, setSearch] = useState('');

  const rows = useMemo(() => {
    if (!program) return [];
    const participants = program.participants;
    const names = new Set([...program.departments, ...participants.map((person) => person.departmentName?.trim() || 'Chưa phân phòng')]);
    return [...names].filter(Boolean).map((name): DepartmentRow => {
      const people = participants.filter((person) => (person.departmentName?.trim() || 'Chưa phân phòng') === name);
      const counts: Record<Stage, number> = { invited: 0, active: 0, submitted: 0, reviewed: 0 };
      people.forEach((person) => { counts[stageOf(person.status)] += 1; });
      return { name, people, counts, rate: people.length ? Math.round(((counts.submitted + counts.reviewed) / people.length) * 100) : null };
    });
  }, [program]);

  const query = search.trim().toLocaleLowerCase('vi');
  const filtered = rows.filter((row) =>
    (selectedDepartments === null || selectedDepartments.includes(row.name))
    && (!query || row.name.toLocaleLowerCase('vi').includes(query) || row.people.some((person) => person.fullName.toLocaleLowerCase('vi').includes(query))),
  ).sort((a, b) => {
    if (sort === 'name') return a.name.localeCompare(b.name, 'vi');
    if (a.rate === null) return 1;
    if (b.rate === null) return -1;
    return sort === 'lowest' ? a.rate - b.rate || a.name.localeCompare(b.name, 'vi') : b.rate - a.rate || a.name.localeCompare(b.name, 'vi');
  });
  const shown = showAll ? filtered : filtered.slice(0, 8);
  const totalPeople = rows.reduce((sum, row) => sum + row.people.length, 0);
  const submitted = rows.reduce((sum, row) => sum + row.counts.submitted + row.counts.reviewed, 0);
  const overallRate = totalPeople ? Math.round((submitted / totalPeople) * 100) : null;
  const totals = STAGES.map((stage) => ({ ...stage, count: rows.reduce((sum, row) => sum + row.counts[stage.key], 0) }));

  const toggleDepartment = (name: string) => setSelectedDepartments((current) => {
    if (current === null) return rows.map((row) => row.name).filter((item) => item !== name);
    const next = current.includes(name) ? current.filter((item) => item !== name) : [...current, name];
    return next.length === rows.length ? null : next;
  });
  const toggleStage = (key: Stage) => setVisibleStages((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);
  useEffect(() => () => { closeTimers.current.forEach(clearTimeout); closeTimers.current.clear(); }, []);
  const toggleExpanded = (name: string) => {
    if (expanded) {
      setClosing((current) => current.includes(expanded) ? current : [...current, expanded]);
      const previousTimer = closeTimers.current.get(expanded);
      if (previousTimer) clearTimeout(previousTimer);
      closeTimers.current.set(expanded, setTimeout(() => {
        setClosing((current) => current.filter((item) => item !== expanded));
        closeTimers.current.delete(expanded);
      }, 300));
    }
    if (expanded !== name) {
      const previousTimer = closeTimers.current.get(name);
      if (previousTimer) clearTimeout(previousTimer);
      closeTimers.current.delete(name);
      setClosing((current) => current.filter((item) => item !== name));
    }
    setExpanded(expanded === name ? null : name);
  };

  return <section className="owner-heatmap" aria-labelledby="owner-heatmap-title">
    <div className="owner-heatmap__header">
      <div className="owner-heatmap__heading"><span className="owner-heatmap__icon"><Sparkles size={19} /></span><div><span className="owner-heatmap__eyebrow">{translateUi("TỔNG QUAN ĐỘI NGŨ")}</span><h2 id="owner-heatmap-title">{translateUi("Tiến độ đánh giá")}</h2></div></div>
      <div className="owner-heatmap__header-actions"><span className="owner-heatmap__department-badge"><strong>{rows.length}</strong>{translateUi(" phòng ban")}</span><Link className="owner-heatmap__link" to="/enterprise/trial">{translateUi("Quản lý đợt đánh giá ")}<ArrowRight size={16} /></Link></div>
    </div>

    <div className="owner-heatmap__overview">
      <div className="owner-heatmap__headline">
        <span className="owner-heatmap__score-label">{translateUi("TỶ LỆ NỘP BÀI")}</span>
        <div className="owner-heatmap__score-content"><div className="owner-heatmap__score-ring" style={{ background: `conic-gradient(#6ce5d1 0 ${overallRate ?? 0}%, rgba(255,255,255,.16) ${overallRate ?? 0}% 100%)` }}><span>{overallRate === null ? '—' : `${overallRate}%`}</span></div><div className="owner-heatmap__score-copy"><strong>{submitted}<span>/{totalPeople}</span></strong><small>{translateUi("người đã nộp")}</small></div></div>
        <div className="owner-heatmap__score-accent" aria-hidden="true" />
      </div>
      <div className="owner-heatmap__distribution">
        <div className="owner-heatmap__distribution-title"><strong>{translateUi("Hành trình tham gia")}</strong><span>{totalPeople}{translateUi(" nhân viên")}</span></div>
        <div className="owner-heatmap__distribution-bar" role="img" aria-label={translateUi(totals.map((stage) => `${stage.label}: ${stage.count}`).join(', '))}>{totalPeople > 0 && totals.filter((stage) => stage.count > 0).map((stage) => <span key={stage.key} className={`owner-heatmap__distribution-segment owner-heatmap__distribution-segment--${stage.key}`} style={{ width: `${(stage.count / totalPeople) * 100}%` }} title={translateUi(`${stage.label}: ${stage.count}`)} />)}</div>
        <div className="owner-heatmap__status-grid">{totals.map((stage) => <div key={stage.key} className={`owner-heatmap__status owner-heatmap__status--${stage.key}`}><span className="owner-heatmap__status-label"><i />{translateUi(stage.label)}</span><strong>{stage.count}</strong></div>)}</div>
      </div>
    </div>

    <div className="owner-heatmap__toolbar">
      <label className="owner-heatmap__search"><Search size={17} aria-hidden="true" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={translateUi("Tìm phòng ban hoặc nhân viên")} aria-label={translateUi("Tìm phòng ban hoặc nhân viên")} /></label>
      <div className="owner-heatmap__filters">
        <HeatmapMenu label={translateUi("Phòng ban")} name="departments" openMenu={openMenu} setOpenMenu={setOpenMenu} badge={selectedDepartments === null ? undefined : selectedDepartments.length}>
          <div className="owner-heatmap__menu-heading">{translateUi("Lọc phòng ban")}</div>
          <button type="button" className="owner-heatmap__menu-all" onClick={() => setSelectedDepartments(null)}>{translateUi("Tất cả phòng ban ")}<span>{rows.length}</span></button>
          <div className="owner-heatmap__menu-divider" />
          {rows.map((row) => <label className="owner-heatmap__menu-choice" key={row.name}><input type="checkbox" checked={selectedDepartments === null || selectedDepartments.includes(row.name)} onChange={() => toggleDepartment(row.name)} /><span>{row.name}</span><small>{row.people.length}</small></label>)}
        </HeatmapMenu>
        <HeatmapMenu label={translateUi("Cột trạng thái")} name="stages" openMenu={openMenu} setOpenMenu={setOpenMenu} badge={visibleStages.length === STAGES.length ? undefined : visibleStages.length}>
          <div className="owner-heatmap__menu-heading">{translateUi("Cột hiển thị")}</div>
          {STAGES.map((stage) => <label className="owner-heatmap__menu-choice" key={stage.key}><input type="checkbox" checked={visibleStages.includes(stage.key)} onChange={() => toggleStage(stage.key)} /><i className={`owner-heatmap__legend-dot owner-heatmap__legend-dot--${stage.key}`} /><span>{translateUi(stage.label)}</span></label>)}
        </HeatmapMenu>
      </div>
      <div className="owner-heatmap__sort"><span>{translateUi("Sắp xếp")}</span><HeatmapMenu label={translateUi(translateUi(SORT_OPTIONS.find((option) => option.value === sort)?.label) ?? '')} name="sort" openMenu={openMenu} setOpenMenu={setOpenMenu} variant="sort">
        <div className="owner-heatmap__menu-heading">{translateUi("Sắp xếp theo")}</div>
        {SORT_OPTIONS.map((option) => <button key={option.value} type="button" className="owner-heatmap__menu-option" aria-pressed={sort === option.value} onClick={() => { setSort(option.value); setOpenMenu(null); }}>{translateUi(option.label)}<span className="owner-heatmap__menu-radio" /></button>)}
      </HeatmapMenu></div>
    </div>

    {isLoading ? <div className="owner-heatmap__empty">{translateUi("Đang tải tiến độ đánh giá…")}</div> : isError ? <div className="owner-heatmap__empty">{translateUi("Chưa tải được tiến độ đánh giá.")}</div> : rows.length === 0 ? <div className="owner-heatmap__empty"><strong>{translateUi("Chưa có phòng ban trong đợt đánh giá")}</strong><span>{translateUi("Thêm nhân viên vào đợt đánh giá để theo dõi tỷ lệ nộp bài tại đây.")}</span></div> : <>
      <div className="owner-heatmap__scroll"><table><caption className="sr-only">{translateUi("Tỷ lệ nộp bài bằng số người đã nộp hoặc được chấm chia tổng người tham gia của phòng ban.")}</caption><thead><tr><th scope="col">{translateUi("Phòng ban ")}<span>({filtered.length})</span></th><th scope="col">{translateUi("Nhân viên")}</th>{STAGES.filter((stage) => visibleStages.includes(stage.key)).map((stage) => <th scope="col" className={`owner-heatmap__column--${stage.key}`} key={stage.key}>{translateUi(stage.label)}</th>)}<th scope="col" title={translateUi("(Đã nộp + đã chấm) / tổng người tham gia")}>{translateUi("Tỷ lệ nộp")}</th></tr></thead><tbody>{shown.map((row) => <FragmentRow key={row.name} row={row} stages={visibleStages} expanded={expanded === row.name} showDetail={expanded === row.name || closing.includes(row.name)} onToggle={() => toggleExpanded(row.name)} />)}</tbody></table>{filtered.length === 0 && <div className="owner-heatmap__no-results">{translateUi("Không tìm thấy phòng ban hoặc nhân viên phù hợp.")}</div>}</div>
      {filtered.length > 8 && <button type="button" className="owner-heatmap__more" onClick={() => setShowAll(!showAll)}>{showAll ? translateUi('Thu gọn') : translateUi(`Xem thêm ${filtered.length - 8} phòng ban`)}</button>}
    </>}
  </section>;
}

function HeatmapMenu({ label, name, openMenu, setOpenMenu, badge, variant, children }: {
  label: string;
  name: HeatmapMenuName;
  openMenu: HeatmapMenuName | null;
  setOpenMenu: (value: HeatmapMenuName | null) => void;
  badge?: number;
  variant?: 'sort';
  children: ReactNode;
}) {
  useUiLanguage();
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number; width: number; maxHeight: number; placement: 'above' | 'below' } | null>(null);
  const open = openMenu === name;

  useLayoutEffect(() => {
    if (!open) return;
    const updatePosition = () => {
      const trigger = triggerRef.current;
      const menu = menuRef.current;
      if (!trigger || !menu) return;
      const rect = trigger.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) { setOpenMenu(null); return; }
      const width = Math.min(Math.max(rect.width, variant === 'sort' ? 222 : 258), window.innerWidth - 24);
      const below = window.innerHeight - rect.bottom - 12;
      const above = rect.top - 12;
      const placement = below >= Math.min(menu.scrollHeight, 280) || below >= above ? 'below' : 'above';
      const maxHeight = Math.max(80, Math.min(320, placement === 'below' ? below : above));
      const height = Math.min(menu.scrollHeight, maxHeight);
      setPosition({
        top: placement === 'below' ? rect.bottom + 8 : rect.top - height - 8,
        left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)),
        width,
        maxHeight,
        placement,
      });
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpenMenu(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpenMenu(null); triggerRef.current?.focus(); }
    };
    const onScroll = (event: Event) => {
      if (!(event.target instanceof Node && menuRef.current?.contains(event.target))) updatePosition();
    };
    updatePosition();
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open, setOpenMenu, variant]);

  return <div className={`owner-heatmap__filter${variant === 'sort' ? ' owner-heatmap__filter--sort' : ''}`}>
    <button ref={triggerRef} type="button" className="owner-heatmap__trigger" aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => setOpenMenu(open ? null : name)}>
      {variant !== 'sort' && <Filter size={15} aria-hidden="true" />}<span>{translateUi(label)}</span>{badge !== undefined && <b>{badge}</b>}<ChevronDown size={15} className="owner-heatmap__trigger-chevron" aria-hidden="true" />
    </button>
    {open && createPortal(<div id={id} ref={menuRef} className="owner-heatmap__menu owner-heatmap__menu--floating" data-placement={position?.placement} style={position ? { top: position.top, left: position.left, width: position.width, maxHeight: position.maxHeight } : { visibility: 'hidden' }}>{children}</div>, document.body)}
  </div>;
}

function FragmentRow({ row, stages, expanded, showDetail, onToggle }: { row: DepartmentRow; stages: Stage[]; expanded: boolean; showDetail: boolean; onToggle: () => void }) {
  useUiLanguage();
  return <>
    <tr className="owner-heatmap__department-row" tabIndex={0} aria-expanded={expanded} onClick={onToggle} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onToggle(); } }}>
      <th scope="row"><span className="owner-heatmap__department-name">{row.name}<ChevronDown size={16} aria-hidden="true" /></span></th>
      <td className="owner-heatmap__number">{row.people.length}</td>
      {STAGES.filter((stage) => stages.includes(stage.key)).map((stage) => { const count = row.counts[stage.key]; const share = row.people.length ? count / row.people.length : 0; return <td key={stage.key}><span className={`owner-heatmap__cell owner-heatmap__cell--${stage.key}`} data-strength={count === 0 ? 'none' : share >= 0.5 ? 'high' : share >= 0.25 ? 'mid' : 'low'} title={translateUi(`${count} / ${row.people.length} người`)}><b>{count}</b>{count > 0 && <small>{Math.round(share * 100)}%</small>}<i style={{ width: `${share * 100}%` }} /></span></td>; })}
      <td><div className="owner-heatmap__rate-wrap"><span className="owner-heatmap__rate" data-level={row.rate === null ? 'none' : row.rate < 50 ? 'low' : row.rate < 80 ? 'mid' : 'high'}>{row.rate === null ? '—' : `${row.rate}%`}</span><span className="owner-heatmap__rate-track"><i style={{ width: `${row.rate ?? 0}%` }} /></span></div></td>
    </tr>
    {showDetail && <tr className="owner-heatmap__detail"><td colSpan={3 + stages.length}><DepartmentPeople row={row} open={expanded} /></td></tr>}
  </>;
}

function DepartmentPeople({ row, open }: { row: DepartmentRow; open: boolean }) {
  useUiLanguage();
  const [entered, setEntered] = useState(false);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setEntered(open), open ? 16 : 0);
    return () => clearTimeout(timer);
  }, [open]);

  const sorted = [...row.people].sort((a, b) => ALL_STAGES.indexOf(stageOf(a.status)) - ALL_STAGES.indexOf(stageOf(b.status)) || a.fullName.localeCompare(b.fullName, 'vi'));
  const people = sorted.filter((person) => person.fullName.toLocaleLowerCase('vi').includes(query.trim().toLocaleLowerCase('vi')));
  const pages = Math.max(1, Math.ceil(people.length / PEOPLE_PER_PAGE));
  const currentPage = Math.min(page, pages - 1);
  const visiblePeople = people.slice(currentPage * PEOPLE_PER_PAGE, (currentPage + 1) * PEOPLE_PER_PAGE);

  return <div className={`owner-heatmap__detail-motion${entered ? ' is-open' : ''}`} aria-hidden={!open}>
    <div className="owner-heatmap__detail-clip"><div className="owner-heatmap__people-panel">
      <div className="owner-heatmap__people-head"><div><span className="owner-heatmap__people-kicker">{translateUi("NHÂN SỰ PHÒNG BAN")}</span><strong>{row.name} <em>{row.people.length}</em></strong></div>{row.people.length > PEOPLE_PER_PAGE && <label className="owner-heatmap__people-search"><Search size={15} aria-hidden="true" /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(0); }} placeholder={translateUi("Tìm nhân viên")} aria-label={translateUi(`Tìm nhân viên trong ${row.name}`)} /></label>}</div>
      {visiblePeople.length > 0 ? <div className="owner-heatmap__people-grid">{visiblePeople.map((person) => { const stage = stageOf(person.status); return <div className="owner-heatmap__person" key={person.id}><span className="owner-heatmap__person-avatar" aria-hidden="true">{person.fullName.trim().split(/\s+/).slice(-2).map((part) => part[0]).join('').toLocaleUpperCase('vi')}</span><span className="owner-heatmap__person-name" title={translateUi(person.fullName)}>{person.fullName}</span><span className={`owner-heatmap__person-status owner-heatmap__person-status--${stage}`}>{translateUi(STAGES.find((item) => item.key === stage)?.label)}</span></div>; })}</div> : <p className="owner-heatmap__people-empty">{translateUi("Không tìm thấy nhân viên phù hợp.")}</p>}
      {people.length > PEOPLE_PER_PAGE && <div className="owner-heatmap__people-footer"><span>{currentPage * PEOPLE_PER_PAGE + 1}–{Math.min((currentPage + 1) * PEOPLE_PER_PAGE, people.length)} / {people.length}{translateUi(" nhân viên")}</span><div><button type="button" aria-label={translateUi(`Trang trước của ${row.name}`)} disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={16} /></button><span>{currentPage + 1} / {pages}</span><button type="button" aria-label={translateUi(`Trang sau của ${row.name}`)} disabled={currentPage >= pages - 1} onClick={() => setPage(currentPage + 1)}><ChevronRight size={16} /></button></div></div>}
    </div></div>
  </div>;
}
