import { useTrialLock } from '@/hooks/use-trial-lock';
import { translateUi, useUiLanguage } from '@/lib/i18n';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowRight, BookOpenCheck, BrainCircuit, Check, ChevronDown, Compass, Database, Flag, Info, Layers3,
  Lightbulb, Loader2, Lock, MessagesSquare, PenTool, RotateCcw, ShieldCheck, ShoppingCart, Sparkles, Target, Users, X,
} from 'lucide-react';
import { useCapabilityCeilings, useUpdatePositionCeilings } from '@/hooks/use-capability-ceilings';
import { PERMISSIONS, usePermission } from '@/hooks/use-permission';
import { organizationErrorMessage } from '@/lib/organization-errors';
import { SectionLoading } from '@/components/shared/LoadingState';
import type { CeilingCourse, CeilingDomain, CeilingPosition } from '@/services/capability-ceiling.service';
import { SURVEY_RESUME_PATH } from '@/features/trial-program/lib/survey-draft';
import { CoursePositionStandardPanel } from './CoursePositionStandardPanel';
import { CapabilityCeilingGuide } from './CapabilityCeilingGuide';
import { OwnerFilterSelect } from './OwnerFilterSelect';
import './capability-ceiling.css';
import './capability-matrix.css';
import './owner-filter-controls.css';

/**
 * OW-05 · Khung năng lực số, two views kept apart:
 * - "Khóa học của doanh nghiệp" (buying): every course the company owns (Basic free, Intermediate / Advanced once bought)
 *   and where it is used; a course not bought goes to the cart.
 * - "Năng lực từng vị trí" (setting): one of the 5 standard positions at a time (shared by every department, whatever
 *   its name), per domain the level the people holding it must reach. This is the level the survey results are compared
 *   with and the end of their learning path; a domain not set follows the system suggestion (TT02 sample of the
 *   position). A click saves at once (with undo). A level may be set before its course is bought.
 */
type View = 'courses' | 'positions';
type Levels = Record<string, number>;
type CourseSelection = { categoryId: string; level: number };
type CartItem = { code: string; title: string; level: number; domainName: string; price: number };
type SaveState = { status: 'idle' | 'saving' | 'saved'; code?: string; previous?: Levels };

const DOMAIN_ICONS = [Database, MessagesSquare, PenTool, ShieldCheck, Lightbulb, BrainCircuit];
const LEVEL_NAMES = ['—', 'Cơ bản', 'Trung cấp', 'Nâng cao'];

const isOwned = (course: CeilingCourse) => Boolean(course.courseId) && (course.level === 1 || course.isUnlocked === true);
const money = (value: number) => `${value.toLocaleString('vi-VN')} đ`;
const courseCode = (course: CeilingCourse, domain: CeilingDomain) => course.code || `M${domain.sortOrder}-${course.level === 2 ? 'I' : 'A'}`;

/** Levels the owner set for a position (only the domains set on purpose). */
function ownLevels(position: CeilingPosition | undefined): Levels {
  return Object.fromEntries((position?.ceilings ?? []).filter((c) => c.isCustomized).map((c) => [c.categoryId, c.level]));
}

const sameLevels = (a: Levels, b: Levels) =>
  Object.keys(a).length === Object.keys(b).length && Object.keys(a).every((key) => a[key] === b[key]);

function viewFromQuery(tab: string | null, positionId: string | null): View {
  // `departments` is the old name of the second tab
  if (positionId || tab === 'positions' || tab === 'departments') return 'positions';
  return 'courses';
}

export function CapabilityCeilingMatrix() {
  useUiLanguage();
  const trialLock = useTrialLock();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPositionId = searchParams.get('positionId');
  // Opened from the survey ("Tự đặt ở Khung năng lực số"): set the position levels, then back to the survey.
  const fromSurvey = searchParams.get('from') === 'survey';
  const { data: matrix, isLoading, isError } = useCapabilityCeilings();
  const { can } = usePermission();
  const canEdit = can(PERMISSIONS.POSITION_REQUIREMENT_MANAGE);
  const savePosition = useUpdatePositionCeilings();
  const [view, setView] = useState<View>(() => viewFromQuery(searchParams.get('tab'), initialPositionId));
  const [positionCode, setPositionCode] = useState('');
  // Levels being saved or just saved, shown at once; they give way to the server data once it has caught up.
  const [drafts, setDrafts] = useState<Record<string, Levels>>({});
  const draftsRef = useRef(drafts);
  draftsRef.current = drafts;
  const [saveState, setSaveState] = useState<SaveState>({ status: 'idle' });
  const [showGuide, setShowGuide] = useState(false);
  const [cart, setCart] = useState<Map<string, CartItem>>(new Map());
  const [actionHost, setActionHost] = useState<HTMLElement | null>(null);
  const [actionDock, setActionDock] = useState<HTMLDivElement | null>(null);
  const matrixRoot = useRef<HTMLElement | null>(null);
  const bindMatrix = useCallback((element: HTMLElement | null) => {
    matrixRoot.current = element;
    if (element) setActionHost(element.closest<HTMLElement>('.enterprise-shell') ?? document.body);
  }, []);
  const [selection, setSelection] = useState<CourseSelection | null>(null);
  const [closingSelection, setClosingSelection] = useState<CourseSelection | null>(null);
  const [panelVisible, setPanelVisible] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openFrame = useRef<number | null>(null);

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (openFrame.current) cancelAnimationFrame(openFrame.current);
  }, []);

  // Keep the page content clear of the floating cart bar.
  useEffect(() => {
    const root = matrixRoot.current?.closest<HTMLElement>('.blueprint-page') ?? matrixRoot.current;
    if (!actionDock || !root) return;
    const reserveDockSpace = () => {
      const bottom = Number.parseFloat(getComputedStyle(actionDock).bottom) || 0;
      root.style.paddingBlockEnd = `${actionDock.offsetHeight + bottom + 8}px`;
    };
    reserveDockSpace();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(reserveDockSpace);
    observer?.observe(actionDock);
    return () => {
      observer?.disconnect();
      root.style.removeProperty('padding-block-end');
    };
  }, [actionDock]);

  const positions = useMemo(() => matrix?.positions ?? [], [matrix?.positions]);
  // A draft the server already shows is no longer needed.
  useEffect(() => {
    setDrafts((all) => {
      const left = Object.fromEntries(Object.entries(all).filter(([code, levels]) =>
        !sameLevels(levels, ownLevels(positions.find((p) => p.code === code)))));
      return Object.keys(left).length === Object.keys(all).length ? all : left;
    });
  }, [positions]);
  const toneOf = useMemo(() => new Map(positions.map((p, index) => [p.code, index % 6])), [positions]);
  const position = positions.find((p) => p.code === positionCode)
    // a link from a position page (?positionId=) opens that position
    ?? positions.find((p) => p.positionId != null && p.positionId === initialPositionId)
    ?? positions[0];
  const positionIndex = Math.max(0, positions.findIndex((p) => p.code === position?.code));
  const isSet = (p: CeilingPosition) => Object.keys(drafts[p.code] ?? ownLevels(p)).length > 0;
  // The next position without its own levels, after the current one (wrapping), for a quick "do the next one".
  const nextUnset = [...positions.slice(positionIndex + 1), ...positions.slice(0, positionIndex)].find((p) => !isSet(p));

  const cartItem = (course: CeilingCourse, domain: CeilingDomain): CartItem => {
    const code = courseCode(course, domain);
    return { code, title: course.title || `Khóa học ${code}`, level: course.level, domainName: domain.name, price: course.price || (course.level === 3 ? 699000 : 399000) };
  };
  const toggleCart = (course: CeilingCourse, domain: CeilingDomain) => {
    if (!course.courseId) {
      toast.error('Khóa học này chưa có trong danh mục để mua.');
      return;
    }
    const item = cartItem(course, domain);
    const remove = cart.has(item.code);
    // The updater stays pure: StrictMode runs it twice, so a toast inside it would show twice.
    setCart((previous) => {
      const next = new Map(previous);
      if (remove) next.delete(item.code);
      else next.set(item.code, item);
      return next;
    });
    if (remove) toast.info(`Đã bỏ chọn khóa ${item.code}`);
    else toast.success(`Đã chọn khóa ${item.code} để mua bản quyền`, { description: 'Bạn có thể chọn thêm nhiều khóa khác trước khi bấm Tiếp tục.' });
  };

  const header = (badge?: string) => (
    <MatrixHeader badge={badge} onGuide={() => setShowGuide(true)} />
  );

  if (isLoading) {
    return <section className="cc-root cx-root">{header()}<SectionLoading label={translateUi('Đang tải khung năng lực')} /></section>;
  }
  if (isError || !matrix) {
    return <section className="cc-root cx-root">{header()}<p className="cc-note">{translateUi('Chưa tải được khung năng lực. Vui lòng thử lại sau.')}</p></section>;
  }

  const activeCode = position?.code ?? '';
  const saved = ownLevels(position);
  const current = drafts[activeCode] ?? saved;
  const suggestionOf = (domain: CeilingDomain) => Math.min(3, position?.ceilings.find((c) => c.categoryId === domain.categoryId)?.suggested ?? 0);
  const suggested: Levels = Object.fromEntries(matrix.domains.map((d) => [d.categoryId, suggestionOf(d)]).filter(([, level]) => Number(level) > 0));
  const canSuggest = Object.keys(suggested).length > 0 && !sameLevels({ ...current, ...suggested }, current);

  const courses = matrix.domains.flatMap((domain) => domain.courses.filter((c) => c.courseId).map((course) => ({ domain, course })));
  const ownedCount = courses.filter(({ course }) => isOwned(course)).length;
  const courseTotal = courses.length;
  const customizedCount = positions.filter(isSet).length;
  const levelOf = (p: CeilingPosition, domain: CeilingDomain) => p.ceilings.find((c) => c.categoryId === domain.categoryId)?.level ?? 0;
  const usedBy = (domain: CeilingDomain, level: number) => positions.filter((p) => levelOf(p, domain) >= level);
  const setDomains = Object.keys(current).length;

  /** Saves the position's levels right away (empty = back to the system suggestion); the previous ones can be restored. */
  const persist = async (target: CeilingPosition, levels: Levels, previous: Levels, undoable = true) => {
    const id = target.code;
    setDrafts((all) => ({ ...all, [id]: levels }));
    setSaveState({ status: 'saving', code: id });
    try {
      // A domain taken off needs the position cleared first: the save only changes the domains it sends.
      const removed = Object.keys(previous).some((key) => !(key in levels));
      if (removed || Object.keys(levels).length === 0) {
        await savePosition.mutateAsync({ code: id, data: { inherit: true, ceilings: [] } });
      }
      if (Object.keys(levels).length > 0) {
        const ceilings = Object.entries(levels).map(([categoryId, level]) => ({ categoryId, level }));
        await savePosition.mutateAsync({ code: id, data: { inherit: false, ceilings } });
      }
      setSaveState({ status: 'saved', code: id, previous: undoable ? previous : undefined });
    } catch (error) {
      setDrafts((all) => ({ ...all, [id]: previous }));
      setSaveState({ status: 'idle' });
      toast.error(organizationErrorMessage(error, 'Chưa lưu được mức năng lực.'));
    }
  };

  const pick = (domain: CeilingDomain, level: number) => {
    if (!canEdit || !position) return;
    // A level may be set before its course is bought; buying happens in "Khóa học của doanh nghiệp".
    if (!domain.courses.some((c) => c.level === level && c.courseId)) return;
    const before = draftsRef.current[position.code] ?? saved;
    if (before[domain.categoryId] === level) return;
    void persist(position, { ...before, [domain.categoryId]: level }, before);
  };
  const undo = () => {
    const target = positions.find((p) => p.code === saveState.code);
    if (!target || !saveState.previous) return;
    const now = draftsRef.current[target.code] ?? ownLevels(target);
    void persist(target, saveState.previous, now, false);
  };

  const closePanelNow = () => {
    setSelection(null);
    setClosingSelection(null);
    setPanelVisible(false);
  };
  const switchView = (next: View) => {
    setView(next);
    closePanelNow();
    const params = new URLSearchParams(searchParams);
    params.set('tab', next);
    params.delete('positionId');
    setSearchParams(params, { replace: true });
  };

  // Course details open inline under their row ("Khóa học của doanh nghiệp" only).
  const renderedSelection = selection ?? closingSelection;
  const activeDomain = matrix.domains.find((item) => item.categoryId === renderedSelection?.categoryId);
  const activeCourse = activeDomain?.courses.find((item) => item.level === renderedSelection?.level);
  const panelDuration = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 380;
  const inspect = (domain: CeilingDomain, level: number) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (openFrame.current) cancelAnimationFrame(openFrame.current);
    if (panelVisible && selection?.categoryId === domain.categoryId && selection.level === level) {
      setClosingSelection(selection);
      setPanelVisible(false);
      setSelection(null);
      closeTimer.current = setTimeout(() => setClosingSelection(null), panelDuration());
      return;
    }
    // Update the requested content immediately; animation must never queue a click.
    const sameRow = renderedSelection?.categoryId === domain.categoryId;
    setClosingSelection(null);
    setSelection({ categoryId: domain.categoryId, level });
    setPanelVisible(Boolean(sameRow));
    if (!sameRow) openFrame.current = requestAnimationFrame(() => {
      openFrame.current = requestAnimationFrame(() => setPanelVisible(true));
    });
  };
  const closeSelection = () => {
    if (!selection) return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setClosingSelection(selection);
    setPanelVisible(false);
    setSelection(null);
    closeTimer.current = setTimeout(() => setClosingSelection(null), panelDuration());
  };

  const showCart = view === 'courses' && cart.size > 0;

  const coursePanel = (domain: CeilingDomain) => {
    const isOpen = selection?.categoryId === domain.categoryId && panelVisible;
    if (renderedSelection?.categoryId !== domain.categoryId || !activeDomain || !activeCourse) return null;
    const DomainIcon = DOMAIN_ICONS[domain.sortOrder - 1] ?? Layers3;
    return (
      <div id={`course-detail-${domain.categoryId}`} className={`cc-inline-panel cx-inline-panel${isOpen ? ' is-open' : ''}`} inert={!isOpen}>
        <div className="cc-inline-panel__inner">
          <div className="cc-inline-panel__surface">
            <div className="cc-domain-panel" data-domain={domain.sortOrder}>
              <button type="button" className="cc-domain-panel__header" onClick={closeSelection} aria-label={translateUi(`Thu gọn ${domain.name}`)} aria-expanded={isOpen}>
                <span className="cc-domain-icon" aria-hidden="true"><DomainIcon size={18} /></span>
                <span className="cc-domain-panel__heading"><small>{translateUi('Khóa học')}</small><strong>{translateUi(domain.name)}</strong></span>
                <span className="cc-domain-panel__collapse">{translateUi('Thu gọn ')}<ChevronDown size={16} aria-hidden="true" /></span>
              </button>
              <CoursePositionStandardPanel
                domain={activeDomain}
                course={activeCourse}
                isSelectedToBuy={cart.has(courseCode(activeCourse, activeDomain))}
                scopeLabel="doanh nghiệp"
                onSelectToBuy={() => toggleCart(activeCourse, activeDomain)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  /** Domain on the left of a row: icon, "Lĩnh vực N" (and "· chưa đặt" for a position) above the name. */
  const domainRow = (domain: CeilingDomain, note?: string) => {
    const DomainIcon = DOMAIN_ICONS[domain.sortOrder - 1] ?? Layers3;
    return (
      <div className="rl" data-domain={domain.sortOrder}>
        <span className="cc-domain-icon" aria-hidden="true"><DomainIcon size={18} /></span>
        <span className="cc-domain-copy">
          <small className="cx-domain-kicker">{translateUi(`Lĩnh vực ${domain.sortOrder}`)}{note && <em>{translateUi(note)}</em>}</small>
          <span className="cc-domain-title">{translateUi(domain.name)}</span>
        </span>
      </div>
    );
  };
  const levelHeads = (hint: string) => (
    <>
      <div className="cc-mx-domain-heading"><Layers3 size={16} aria-hidden="true" /><span>{translateUi('Lĩnh vực năng lực')}<small>{translateUi(hint)}</small></span></div>
      {matrix.levels.map((level) => (
        <div key={level.level} className="hd">
          <span className="cc-level-marker" aria-hidden="true">{String(level.level).padStart(2, '0')}</span>
          <span className="cc-level-copy"><small>{translateUi(`Cấp ${level.level}`)}</small><strong>{translateUi(level.name)}</strong></span>
        </div>
      ))}
    </>
  );
  const saving = saveState.status === 'saving';
  const justSaved = saveState.status === 'saved' && saveState.code === activeCode;

  return (
    <section ref={bindMatrix} className="cc-root cx-root" aria-label={translateUi('Khung năng lực số')}>
      {fromSurvey && <SurveyReturn />}
      {header(`Đã có ${ownedCount}/${courseTotal} khóa`)}

      <div className="cc-card cc-card--studio cx-studio">
        {/* ── Hai phần trong một khối chọn nhỏ ── */}
        <div className="cc-scope-toolbar">
          <div className="cc-scope-controls">
            <div className="cc-scope-switch" role="tablist" aria-label={translateUi('Phần của khung năng lực')}>
              <button type="button" role="tab" id="cx-tab-courses" aria-controls="cx-panel-courses" aria-selected={view === 'courses'}
                className={`cc-scope-option${view === 'courses' ? ' is-active' : ''}`} onClick={() => switchView('courses')}>
                <span className="cx-scope-step" aria-hidden="true">1</span>
                <BookOpenCheck className="size-3.5 text-emerald-700" aria-hidden="true" />
                {translateUi('Khóa học của doanh nghiệp')}
              </button>
              <button type="button" role="tab" id="cx-tab-positions" aria-controls="cx-panel-positions" aria-selected={view === 'positions'}
                className={`cc-scope-option${view === 'positions' ? ' is-active' : ''}`} onClick={() => switchView('positions')}>
                <span className="cx-scope-step" aria-hidden="true">2</span>
                <Users className="size-3.5 text-emerald-700" aria-hidden="true" />
                {translateUi('Năng lực từng vị trí')}
              </button>
            </div>
          </div>
        </div>

        {view === 'courses' ? (
        <div className="cx-view" role="tabpanel" id="cx-panel-courses" aria-labelledby="cx-tab-courses">
          <div className="cc-mx" role="group" aria-label={translateUi('Khóa học theo lĩnh vực và cấp')}>
            {levelHeads('Bấm ô để xem khóa hoặc chọn mua')}
            {matrix.domains.map((domain) => (
              <Fragment key={domain.categoryId}>
                {domainRow(domain)}
                {domain.courses.map((course) => (
                  <CourseCell key={course.level} domain={domain} course={course} inCart={cart.has(courseCode(course, domain))}
                    usedBy={usedBy(domain, course.level)} positionCount={positions.length} canBuy={canEdit}
                    onToggleCart={() => toggleCart(course, domain)} onInspect={() => inspect(domain, course.level)} />
                ))}
                {coursePanel(domain)}
              </Fragment>
            ))}
          </div>

          <div className="cc-legend" aria-label={translateUi('Chú giải trạng thái khóa học')}>
            <span className="cc-legend__title">{translateUi('Trạng thái')}</span>
            <span className="cc-legend__chip"><i className="route" />{translateUi('Đã có · nhân viên học được')}</span>
            <span className="cc-legend__chip"><i className="locked" />{translateUi('Chưa mua')}</span>
            <span className="cc-legend__chip cc-legend__chip--cart"><i className="cart" />{translateUi('Đã chọn vào giỏ')}</span>
          </div>
          <div className="cc-actions">
            <div className="cc-interaction-guide" aria-label={translateUi('Cách thao tác')}>
              <span><Check size={14} aria-hidden="true" /><strong>{translateUi('Ô đã có')}</strong><ArrowRight size={12} aria-hidden="true" />{translateUi('Xem khóa học')}</span>
              {canEdit && <span><ShoppingCart size={14} aria-hidden="true" /><strong>{translateUi('Ô chưa mua')}</strong><ArrowRight size={12} aria-hidden="true" />{translateUi('Thêm vào giỏ')}</span>}
              <span><Info size={14} aria-hidden="true" />{translateUi('Khóa học & quyền học')}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="cx-view" role="tabpanel" id="cx-panel-positions" aria-labelledby="cx-tab-positions">
          {positions.length === 0 ? (
            <div className="cx-empty">
              <Users size={22} aria-hidden="true" />
              <p>{translateUi('Doanh nghiệp đã ngừng dùng cả 5 vị trí chuẩn.')}</p>
              {!trialLock.limited && <Link to="/enterprise/positions" className="cx-link">{translateUi('Đến Vị trí công việc')}<ArrowRight size={14} aria-hidden="true" /></Link>}
            </div>
          ) : position && (
            <div className="cx-dpanel" data-tone={toneOf.get(position.code)}>
              {/* One header for the position being set, joined to its grid: who, how far, what to do. */}
              <div className="cx-dhead">
                <div className="cx-dhead__pick">
                  <OwnerFilterSelect
                    label={translateUi('Chọn vị trí')}
                    value={activeCode}
                    valueLabel={position.name}
                    onChange={setPositionCode}
                    className="cx-dhead__select"
                    menuMinWidth={320}
                    options={positions.map((p) => ({
                      value: p.code,
                      label: `${p.name} · ${translateUi(`${p.employeeCount} người`)}`,
                      badge: isSet(p) ? { text: 'Đã đặt', tone: 'ok' as const } : { text: 'Chưa đặt', tone: 'warn' as const },
                    }))}
                  />
                  <span className="cx-dhead__state" data-set={isSet(position) || undefined}>
                    {isSet(position) ? <Check size={13} aria-hidden="true" /> : <Flag size={13} aria-hidden="true" />}
                    {translateUi(isSet(position) ? 'Đã đặt' : 'Chưa đặt')}
                  </span>
                  {nextUnset && (
                    <button type="button" className="cx-dhead__next" onClick={() => setPositionCode(nextUnset.code)}>
                      <span>{translateUi(`Còn ${positions.length - customizedCount} vị trí chưa đặt`)}</span>
                      <span className="cx-dhead__next-to">{translateUi('Tiếp:')} <strong>{nextUnset.name}</strong></span>
                      <ArrowRight size={14} aria-hidden="true" />
                    </button>
                  )}
                </div>
                <div className="cx-dhead__actions">
                  {(saving || justSaved) && (
                    <span className="cx-save" role="status" data-status={saving ? 'saving' : 'saved'}>
                      {saving ? <><Loader2 size={14} className="cx-spin" aria-hidden="true" />{translateUi('Đang lưu…')}</> : (
                        <>
                          <Check size={14} aria-hidden="true" />{translateUi('Đã lưu')}
                          {canEdit && saveState.previous && <button type="button" onClick={undo}><RotateCcw size={12} aria-hidden="true" />{translateUi('Hoàn tác')}</button>}
                        </>
                      )}
                    </span>
                  )}
                  {canEdit && canSuggest && (
                    <button type="button" className="cc-btn" onClick={() => void persist(position, { ...current, ...suggested }, current)}>
                      <Sparkles size={14} aria-hidden="true" />{translateUi('Dùng mức đề xuất')}
                    </button>
                  )}
                  {canEdit && setDomains > 0 && (
                    <button type="button" className="cc-btn" onClick={() => void persist(position, {}, current)}>{translateUi('Bỏ mức đã đặt')}</button>
                  )}
                </div>
              </div>

              <div className="cc-mx" role="group" aria-label={translateUi(`Mức năng lực của ${position.name}`)}>
                {levelHeads('Bấm ô để đặt mức cần đạt')}
                {matrix.domains.map((domain) => {
                  const level = current[domain.categoryId];
                  return (
                    <Fragment key={domain.categoryId}>
                      {domainRow(domain, level ? undefined : ' · chưa đặt')}
                      {domain.courses.map((course) => (
                        <LevelCell key={course.level} domain={domain} course={course} level={level} suggested={suggestionOf(domain)}
                          editable={canEdit} onPick={() => pick(domain, course.level)} />
                      ))}
                    </Fragment>
                  );
                })}
              </div>
            </div>
          )}

          {positions.length > 0 && (
            <div className="cc-legend" aria-label={translateUi('Chú giải mức năng lực')}>
              <span className="cc-legend__title">{translateUi('Trạng thái')}</span>
              <span className="cc-legend__chip"><i className="route" />{translateUi('Mức cần đạt')}</span>
              <span className="cc-legend__chip"><i className="dn" />{translateUi('Đã gồm trong lộ trình')}</span>
              <span className="cc-legend__chip"><i className="licensed" />{translateUi('Chưa chọn')}</span>
              <span className="cc-legend__chip cc-legend__chip--cart"><Lock size={11} aria-hidden="true" />{translateUi('Chưa mua · đặt trước, mua sau')}</span>
            </div>
          )}
        </div>
      )}
      </div>

      {actionHost && showCart && createPortal(
        <div ref={setActionDock} className="cc-root cc-action-dock" role="region" aria-label={translateUi('Thao tác khung năng lực')}>
          <div className="cc-cart-bar">
            <div className="cc-cart-summary">
              <span className="cx-cart-count"><ShoppingCart size={16} aria-hidden="true" />{cart.size}</span>
              <div className="min-w-0">
                <h4 className="font-bold text-slate-900 text-sm">{translateUi('Giỏ khóa học · ')}{cart.size}{translateUi(' khóa')} · {money([...cart.values()].reduce((sum, item) => sum + item.price, 0))}</h4>
                <div className="cc-cart-items">
                  {[...cart.values()].map((item) => (
                    <span key={item.code} className="cx-cart-item">
                      <span>{translateUi(LEVEL_NAMES[item.level])} · {translateUi(item.domainName)}</span>
                      <button type="button" onClick={() => setCart((previous) => { const next = new Map(previous); next.delete(item.code); return next; })}
                        title={translateUi('Bỏ chọn khóa này')} aria-label={translateUi(`Bỏ ${item.code} khỏi giỏ`)}><X className="size-3" /></button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="cc-cart-buttons">
              <button type="button" className="cc-btn" onClick={() => setCart(new Map())}>{translateUi('Hủy chọn tất cả')}</button>
              <button type="button" className="cc-btn primary" onClick={() => navigate(`/enterprise/courses/checkout?courses=${encodeURIComponent([...cart.keys()].join(','))}`)}>
                <span>{translateUi(`Thanh toán & Ký online (${cart.size})`)}</span><ArrowRight className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>,
        actionHost,
      )}

      <CapabilityCeilingGuide open={showGuide} onClose={() => setShowGuide(false)} />
    </section>
  );
}

/** "Khóa học của doanh nghiệp": an owned course (where it is used) or a course still to buy. */
function CourseCell({ domain, course, inCart, usedBy, positionCount, canBuy, onToggleCart, onInspect }: {
  domain: CeilingDomain;
  course: CeilingCourse;
  inCart: boolean;
  usedBy: CeilingPosition[];
  positionCount: number;
  canBuy: boolean;
  onToggleCart: () => void;
  onInspect: () => void;
}) {
  useUiLanguage();
  const code = course.code ?? `cấp ${course.level}`;
  if (!course.courseId) {
    return <div className="cc-cell empty">{translateUi('Chưa có khóa')}</div>;
  }
  if (isOwned(course)) {
    const users = positionCount === 0 ? translateUi('Cả doanh nghiệp')
      : usedBy.length === positionCount ? translateUi('Mọi vị trí')
      : usedBy.length === 0 ? translateUi('Chưa vị trí nào')
      : translateUi(`${usedBy.length}/${positionCount} vị trí`);
    return (
      <div className="cc-purchase-cell cc-course-cell">
        <button type="button" className="cc-cell route cx-tile" data-level={course.level} aria-label={translateUi(`Xem khóa ${code}`)}
          title={`${course.code ?? ''} · ${course.title ?? ''}`.trim()} onClick={onInspect}>
          <span className="cx-tile__status"><Check size={16} aria-hidden="true" />{translateUi(course.level === 1 ? 'Miễn phí' : 'Đã mua')}</span>
          <span className="cx-tile__note" title={usedBy.map((d) => d.name).join(', ')}>{translateUi('Dùng ở: ')}{users}</span>
        </button>
      </div>
    );
  }
  return (
    <div className="cc-purchase-cell">
      <button type="button" className={`cc-cell cx-tile ${inCart ? 'selected-to-buy' : 'is-locked'}`} aria-pressed={inCart} disabled={!canBuy}
        title={`${course.code ?? ''} · ${course.title ?? ''}`.trim()}
        aria-label={translateUi(`${domain.name}, cấp ${course.level}: ${inCart ? 'đã chọn mua, bấm để bỏ chọn' : 'chưa mua khóa, bấm để chọn mua cùng khóa khác'}.`)}
        onClick={onToggleCart}>
        <span className="cx-tile__status">
          {inCart ? <><ShoppingCart size={15} aria-hidden="true" />{translateUi('Trong giỏ')}</> : <><Lock size={15} aria-hidden="true" />{translateUi('Chưa mua')}</>}
        </span>
        <span className="cx-tile__note">{inCart ? translateUi('Bấm để bỏ khỏi giỏ') : `${money(course.price ?? 0)} · ${translateUi('Thêm vào giỏ')}`}</span>
      </button>
      <button type="button" className="cc-purchase-cell__detail" aria-label={translateUi(`Xem khóa ${code}`)} title={translateUi('Khóa học & quyền học')} onClick={onInspect}><Info size={14} /></button>
    </div>
  );
}

/**
 * "Năng lực từng vị trí": one level of a domain. The levels below the chosen one are included, the chosen one carries a
 * flag. A level whose course is not bought can still be set.
 */
function LevelCell({ domain, course, level, suggested, editable, onPick }: {
  domain: CeilingDomain;
  course: CeilingCourse;
  level: number | undefined;
  suggested: number;
  editable: boolean;
  onPick: () => void;
}) {
  useUiLanguage();
  if (!course.courseId) {
    return <div className="cc-cell empty">{translateUi('Chưa có khóa')}</div>;
  }
  const state = !level ? 'idle' : course.level < level ? 'included' : course.level === level ? 'selected' : 'above';
  const owned = isOwned(course);
  const tone = state === 'selected' ? 'route' : state === 'included' ? 'dn' : 'licensed';
  const tagged = !owned || (suggested === course.level && state !== 'selected');
  return (
    <button type="button" className={`cc-cell cx-tile ${tone}`} data-state={state} aria-pressed={state === 'selected'} disabled={!editable}
      title={`${course.code ?? ''} · ${course.title ?? ''}`.trim()}
      aria-label={translateUi(`Đặt mức ${domain.name}: ${LEVEL_NAMES[course.level]}${owned ? '' : ' (chưa mua)'}`)} onClick={onPick}>
      <span className="cx-tile__status">
        {state === 'selected' ? <><Flag size={15} aria-hidden="true" />{translateUi('Mức cần đạt')}</>
          : state === 'included' ? <><Check size={15} aria-hidden="true" />{translateUi('Đã gồm')}</>
          : translateUi('Chọn')}
      </span>
      {tagged && (
        <span className="cx-tile__tags">
          {!owned && <span className="cx-tile__tag" data-tag="locked"><Lock size={11} aria-hidden="true" />{translateUi('Chưa mua')}</span>}
          {suggested === course.level && state !== 'selected' && <span className="cx-tile__tag" data-tag="suggest"><Sparkles size={11} aria-hidden="true" />{translateUi('Đề xuất')}</span>}
        </span>
      )}
    </button>
  );
}

/** Came from the survey: say why we are here and the way back (the people already listed are kept). */
function SurveyReturn() {
  useUiLanguage();
  return (
    <div className="cx-survey-return" role="status">
      <span className="cx-survey-return__icon" aria-hidden="true"><Target size={16} /></span>
      <p>
        <strong>{translateUi('Đặt mức cần đạt cho từng vị trí')}</strong>
        <span>{translateUi('Kết quả khảo sát sẽ so với mức này; vị trí chưa đặt theo đề xuất của hệ thống. Danh sách người làm bài vẫn được giữ.')}</span>
      </p>
      <Link to={SURVEY_RESUME_PATH} className="cc-btn">{translateUi('Xong, quay lại khảo sát')}<ArrowRight size={14} aria-hidden="true" /></Link>
    </div>
  );
}

/** Title strip of the page (as before the rebuild): name, what the company owns, help and links. */
function MatrixHeader({ badge, onGuide }: { badge?: string; onGuide: () => void }) {
  useUiLanguage();
  return (
    <div className="cx-headbar">
      <div className="cx-headbar__title">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-black tracking-[-0.03em] section-gradient">{translateUi('Khung năng lực số')}</h1>
          {badge && <span className="cx-headbar__badge">{translateUi(badge)}</span>}
        </div>
      </div>
      <div className="cx-headbar__actions">
        <Link to="/enterprise/framework" className="cx-headbar__link"><Compass className="size-3.5 text-teal-600" aria-hidden="true" />{translateUi('Từ điển 24 chuẩn TT02')}</Link>
        <Link to="/enterprise/courses" className="cx-headbar__link">{translateUi('Danh mục khóa học')}<ArrowRight className="size-3 text-slate-400" aria-hidden="true" /></Link>
        <button type="button" onClick={onGuide} className="cc-guide-trigger" aria-haspopup="dialog">
          <Info className="size-3.5 text-slate-500" aria-hidden="true" /><span>{translateUi('Cách hoạt động')}</span>
        </button>
      </div>
    </div>
  );
}
