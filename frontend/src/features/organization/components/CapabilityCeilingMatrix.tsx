import { translateUi, useUiLanguage } from '@/lib/i18n';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowRight, BookOpenCheck, BrainCircuit, Check, ChevronDown, ChevronLeft, ChevronRight, Database, Flag, HelpCircle, Info, Layers3,
  Lightbulb, Lock, MessagesSquare, PenTool, ShieldCheck, ShoppingCart, Sparkles, Users, X,
} from 'lucide-react';
import { useCapabilityCeilings, useUpdateDepartmentCeilings } from '@/hooks/use-capability-ceilings';
import { useJobPosition } from '@/hooks/use-job-positions';
import { PERMISSIONS, usePermission } from '@/hooks/use-permission';
import { organizationErrorMessage } from '@/lib/organization-errors';
import { SectionLoading } from '@/components/shared/LoadingState';
import type { CeilingCourse, CeilingDepartment, CeilingDomain, CeilingLevel } from '@/services/capability-ceiling.service';
import { CoursePositionStandardPanel } from './CoursePositionStandardPanel';
import { CapabilityCeilingGuide } from './CapabilityCeilingGuide';
import { OwnerFilterSelect } from './OwnerFilterSelect';
import './capability-ceiling.css';
import './capability-matrix.css';
import './owner-filter-controls.css';

/**
 * OW-05 · Khung năng lực số, two views kept apart:
 * - "Khóa học của doanh nghiệp" (buying): every course the company owns (Basic free, Intermediate / Advanced once bought),
 *   where it is used, and the courses departments need but the company has not bought yet. The cart lives here.
 * - "Năng lực từng phòng ban" (setting): a department list on the side, and per domain the highest level the selected
 *   department must reach. A level may be set before its course is bought (set first, buy later).
 */
type View = 'courses' | 'departments';
type Levels = Record<string, number>;
type CourseSelection = { categoryId: string; level: number };
type CartItem = { code: string; title: string; level: number; domainName: string; price: number };

const DOMAIN_ICONS = [Database, MessagesSquare, PenTool, ShieldCheck, Lightbulb, BrainCircuit];
const LEVEL_NAMES = ['—', 'Cơ bản', 'Trung cấp', 'Nâng cao'];
const NEED_BADGES = 3;

const isOwned = (course: CeilingCourse) => Boolean(course.courseId) && (course.level === 1 || course.isUnlocked === true);
const money = (value: number) => `${value.toLocaleString('vi-VN')} đ`;
const courseCode = (course: CeilingCourse, domain: CeilingDomain) => course.code || `M${domain.sortOrder}-${course.level === 2 ? 'I' : 'A'}`;

/** Two letters for a department badge, without the "Phòng" / "Ban" prefix: "Phòng Tài chính - Kế toán" → "TC". */
function initialsOf(name: string): string {
  const words = name.replace(/^(phòng|ban|bộ phận)\s+/iu, '').split(/[\s&,-]+/u).filter(Boolean);
  return words.slice(0, 2).map((word) => word[0]).join('').toLocaleUpperCase('vi') || '?';
}

/** Levels the owner set for a department (only the domains set on purpose). */
function ownLevels(department: CeilingDepartment | undefined): Levels {
  return Object.fromEntries((department?.ceilings ?? []).filter((c) => c.isCustomized).map((c) => [c.categoryId, c.level]));
}

const sameLevels = (a: Levels, b: Levels) =>
  Object.keys(a).length === Object.keys(b).length && Object.keys(a).every((key) => a[key] === b[key]);

function viewFromQuery(tab: string | null, positionId: string | null): View {
  if (positionId || tab === 'departments' || tab === 'positions') return 'departments';
  return 'courses';
}

export function CapabilityCeilingMatrix() {
  useUiLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPositionId = searchParams.get('positionId');
  const { data: matrix, isLoading, isError } = useCapabilityCeilings();
  // A link from an employee's position opens the department of that position.
  const { data: initialPosition } = useJobPosition(initialPositionId ?? '');
  const { can } = usePermission();
  const canEdit = can(PERMISSIONS.POSITION_REQUIREMENT_MANAGE);
  const saveDepartment = useUpdateDepartmentCeilings();
  const [view, setView] = useState<View>(() => viewFromQuery(searchParams.get('tab'), initialPositionId));
  const [departmentId, setDepartmentId] = useState('');
  const [drafts, setDrafts] = useState<Record<string, Levels>>({});
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

  // Keep the page content clear of the floating save / cart bars.
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

  const departments = useMemo(() => matrix?.departments ?? [], [matrix?.departments]);
  const toneOf = useMemo(() => new Map(departments.map((d, index) => [d.departmentId, index % 6])), [departments]);
  const department = departments.find((d) => d.departmentId === departmentId)
    ?? departments.find((d) => d.departmentId === initialPosition?.departmentId)
    ?? departments[0];
  const departmentIndex = Math.max(0, departments.findIndex((d) => d.departmentId === department?.departmentId));
  // The next department without its own levels, after the current one (wrapping), for a quick "do the next one".
  const nextUnset = [...departments.slice(departmentIndex + 1), ...departments.slice(0, departmentIndex)].find((d) => !d.isCustomized);

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

  if (isLoading) {
    return <section className="cc-root"><SectionLoading label={translateUi('Đang tải khung năng lực')} /></section>;
  }
  if (isError || !matrix) {
    return <section className="cc-root"><p className="cc-note">{translateUi('Chưa tải được khung năng lực. Vui lòng thử lại sau.')}</p></section>;
  }

  const activeDepartmentId = department?.departmentId ?? '';
  const saved = ownLevels(department);
  const current = drafts[activeDepartmentId] ?? saved;
  const dirty = view === 'departments' && Boolean(drafts[activeDepartmentId]) && !sameLevels(current, saved);
  const saving = saveDepartment.isPending;
  const suggestionOf = (domain: CeilingDomain) => Math.min(3, department?.ceilings.find((c) => c.categoryId === domain.categoryId)?.suggested ?? 0);
  const suggested: Levels = Object.fromEntries(matrix.domains.map((d) => [d.categoryId, suggestionOf(d)]).filter(([, level]) => Number(level) > 0));
  const canSuggest = Object.keys(suggested).length > 0 && !sameLevels({ ...current, ...suggested }, current);

  const courses = matrix.domains.flatMap((domain) => domain.courses.filter((c) => c.courseId).map((course) => ({ domain, course })));
  const ownedCount = courses.filter(({ course }) => isOwned(course)).length;
  const courseTotal = courses.length;
  const boughtCount = courses.filter(({ course }) => course.level > 1 && isOwned(course)).length;
  const freeCount = ownedCount - boughtCount;
  const customizedCount = departments.filter((d) => d.isCustomized).length;
  const levelOf = (d: CeilingDepartment, domain: CeilingDomain) => d.ceilings.find((c) => c.categoryId === domain.categoryId)?.level ?? 0;
  const usedBy = (domain: CeilingDomain, level: number) => departments.filter((d) => levelOf(d, domain) >= level);
  // Courses a department aims at but the company has not bought yet: what to buy next.
  const neededBy = (domain: CeilingDomain, level: number) => departments.filter((d) => d.isCustomized && levelOf(d, domain) >= level);
  const needed = courses.filter(({ domain, course }) => !isOwned(course) && neededBy(domain, course.level).length > 0);
  const neededPrice = needed.reduce((sum, { domain, course }) => sum + cartItem(course, domain).price, 0);
  const neededInCart = needed.every(({ domain, course }) => cart.has(courseCode(course, domain)));
  const departmentNeeds = department
    ? matrix.domains.flatMap((domain) => domain.courses.filter((c) => c.courseId && !isOwned(c) && c.level <= (current[domain.categoryId] ?? 0)))
    : [];
  const setDomains = Object.keys(current).length;

  const setDraft = (levels: Levels | null) => setDrafts((all) => {
    const next = { ...all };
    if (levels && !sameLevels(levels, saved)) next[activeDepartmentId] = levels;
    else delete next[activeDepartmentId];
    return next;
  });

  const pick = (domain: CeilingDomain, level: number) => {
    if (!canEdit || saving || !department) return;
    // A level may be set before its course is bought; buying happens in "Khóa học của doanh nghiệp".
    if (!domain.courses.some((c) => c.level === level && c.courseId)) return;
    setDraft({ ...current, [domain.categoryId]: level });
  };

  const addNeededToCart = () => {
    setCart((previous) => {
      const next = new Map(previous);
      for (const { domain, course } of needed) next.set(courseCode(course, domain), cartItem(course, domain));
      return next;
    });
    toast.success(`Đã thêm ${needed.length} khóa phòng ban cần vào giỏ`);
  };

  const save = async () => {
    if (!department) return;
    const ceilings = Object.entries(current).map(([categoryId, level]) => ({ categoryId, level }));
    try {
      await saveDepartment.mutateAsync({ departmentId: department.departmentId, data: { inherit: false, ceilings } });
      toast.success(`Đã lưu mức năng lực cho ${department.name}.`);
      setDraft(null);
    } catch (error) {
      toast.error(organizationErrorMessage(error, 'Chưa lưu được mức năng lực.'));
    }
  };

  const clearDepartment = async () => {
    if (!department) return;
    try {
      await saveDepartment.mutateAsync({ departmentId: department.departmentId, data: { inherit: true, ceilings: [] } });
      setDraft(null);
      toast.success(`Đã bỏ mức đã đặt của ${department.name}.`);
    } catch (error) {
      toast.error(organizationErrorMessage(error, 'Chưa lưu được mức năng lực.'));
    }
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

  // Buying and setting stay apart: the cart lives in the courses view, the save bar in the departments view.
  const showSaveBar = canEdit && dirty;
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

  const domainHeader = (domain: CeilingDomain, note?: string) => {
    const DomainIcon = DOMAIN_ICONS[domain.sortOrder - 1] ?? Layers3;
    return (
      <span className="cx-domain" role="rowheader">
        <span className="cx-domain__icon" aria-hidden="true"><DomainIcon size={18} /></span>
        <span className="cx-domain__copy">
          <small>{translateUi(`Lĩnh vực ${domain.sortOrder}`)}{note && <em>{translateUi(note)}</em>}</small>
          <strong>{translateUi(domain.name)}</strong>
        </span>
      </span>
    );
  };

  return (
    <section ref={bindMatrix} className="cc-root cx-root" aria-label={translateUi('Khung năng lực số')}>
      {/* ── Hai phần của trang, đánh số theo thứ tự nên làm ── */}
      <div className="cx-tabs" role="tablist" aria-label={translateUi('Phần của khung năng lực')}>
        <button type="button" role="tab" id="cx-tab-courses" aria-controls="cx-panel-courses" aria-selected={view === 'courses'} className="cx-tab" onClick={() => switchView('courses')}>
          <span className="cx-tab__step" aria-hidden="true">1</span>
          <span className="cx-tab__copy"><strong>{translateUi('Khóa học của doanh nghiệp')}</strong></span>
          <BookOpenCheck size={22} className="cx-tab__icon" aria-hidden="true" />
        </button>
        <button type="button" role="tab" id="cx-tab-departments" aria-controls="cx-panel-departments" aria-selected={view === 'departments'} className="cx-tab" onClick={() => switchView('departments')}>
          <span className="cx-tab__step" aria-hidden="true">2</span>
          <span className="cx-tab__copy"><strong>{translateUi('Năng lực từng phòng ban')}</strong></span>
          <Users size={22} className="cx-tab__icon" aria-hidden="true" />
        </button>
        <button type="button" className="cx-help" onClick={() => setShowGuide(true)} aria-haspopup="dialog">
          <HelpCircle size={15} aria-hidden="true" />{translateUi('Cách hoạt động')}
        </button>
      </div>

      {view === 'courses' ? (
        <div className="cx-panel" role="tabpanel" id="cx-panel-courses" aria-labelledby="cx-tab-courses">
          <div className="cx-hero">
            <ProgressRing value={ownedCount} total={courseTotal} />
            <div className="cx-hero__copy">
              <h3>{translateUi(`Doanh nghiệp đã có ${ownedCount} trên ${courseTotal} khóa`)}</h3>
              <ul className="cx-hero__legend">
                <li><i data-tone="free" />{translateUi('Cơ bản miễn phí')} <strong>{freeCount}</strong></li>
                <li><i data-tone="bought" />{translateUi('Đã mua')} <strong>{boughtCount}</strong></li>
                <li><i data-tone="missing" />{translateUi('Chưa mua')} <strong>{courseTotal - ownedCount}</strong></li>
              </ul>
            </div>
            {needed.length > 0 ? (
              <div className="cx-callout" data-tone="need">
                <span className="cx-callout__icon" aria-hidden="true"><ShoppingCart size={18} /></span>
                <div>
                  <strong>{translateUi(`Phòng ban đang cần ${needed.length} khóa chưa mua`)}</strong>
                  <span>{translateUi(`Tổng ${money(neededPrice)} · nhân viên chỉ học được sau khi mua`)}</span>
                  {canEdit && (
                    <button type="button" onClick={addNeededToCart} disabled={neededInCart}>
                      {neededInCart ? translateUi('Đã có trong giỏ') : translateUi(`Thêm cả ${needed.length} vào giỏ`)}
                      {!neededInCart && <ArrowRight size={14} aria-hidden="true" />}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="cx-callout" data-tone="ok">
                <span className="cx-callout__icon" aria-hidden="true"><Check size={18} /></span>
                <div>
                  <strong>{translateUi('Đủ khóa cho mọi mức phòng ban đã đặt')}</strong>
                  <Link to="/enterprise/courses" className="cx-link">{translateUi('Danh mục khóa học')}<ArrowRight size={14} aria-hidden="true" /></Link>
                </div>
              </div>
            )}
          </div>

          <div className="cx-grid" role="table" aria-label={translateUi('Khóa học theo lĩnh vực và cấp')}>
            <GridHead levels={matrix.levels} />
            {matrix.domains.map((domain) => (
              <Fragment key={domain.categoryId}>
                <div className="cx-row" role="row" data-domain={domain.sortOrder}>
                  {domainHeader(domain)}
                  {domain.courses.map((course) => (
                    <CourseCell key={course.level} domain={domain} course={course} inCart={cart.has(courseCode(course, domain))}
                      usedBy={usedBy(domain, course.level)} neededBy={neededBy(domain, course.level)} toneOf={toneOf}
                      departmentCount={departments.length} canBuy={canEdit}
                      onToggleCart={() => toggleCart(course, domain)} onInspect={() => inspect(domain, course.level)} />
                  ))}
                </div>
                {coursePanel(domain)}
              </Fragment>
            ))}
          </div>
        </div>
      ) : (
        <div className="cx-panel" role="tabpanel" id="cx-panel-departments" aria-labelledby="cx-tab-departments">
          {departments.length === 0 ? (
            <div className="cx-empty">
              <Users size={22} aria-hidden="true" />
              <p>{translateUi('Chưa có phòng ban nào. Tạo phòng ban để đặt mức năng lực cho từng nhóm nhân viên.')}</p>
              <Link to="/enterprise/members" className="cx-link">{translateUi('Đến Nhân sự')}<ArrowRight size={14} aria-hidden="true" /></Link>
            </div>
          ) : (
            <div className="cx-dept-layout">
              {/* One picker (search inside) instead of listing every department: works for 5 or 60. */}
              <div className="cx-dept-bar">
                <div className="cx-dept-bar__pick">
                  <span className="cx-dept-bar__label">{translateUi('Phòng ban')}</span>
                  <div className="cx-dept-bar__control">
                    <button type="button" className="cx-dept-bar__step" aria-label={translateUi('Phòng ban trước')} disabled={departments.length < 2}
                      onClick={() => setDepartmentId(departments[(departmentIndex - 1 + departments.length) % departments.length].departmentId)}><ChevronLeft size={16} aria-hidden="true" /></button>
                    <OwnerFilterSelect
                      label={translateUi('Chọn phòng ban')}
                      value={activeDepartmentId}
                      onChange={setDepartmentId}
                      className="cx-dept-select"
                      options={departments.map((d) => ({
                        value: d.departmentId,
                        label: `${d.name} · ${translateUi(`${d.employeeCount} người`)} · ${translateUi(d.isCustomized ? 'Đã đặt' : 'Chưa đặt')}${drafts[d.departmentId] ? ` · ${translateUi('chưa lưu')}` : ''}`,
                      }))}
                    />
                    <button type="button" className="cx-dept-bar__step" aria-label={translateUi('Phòng ban sau')} disabled={departments.length < 2}
                      onClick={() => setDepartmentId(departments[(departmentIndex + 1) % departments.length].departmentId)}><ChevronRight size={16} aria-hidden="true" /></button>
                  </div>
                </div>
                <div className="cx-dept-bar__progress">
                  <span><strong>{customizedCount}/{departments.length}</strong> {translateUi('phòng ban đã đặt mức')}</span>
                  <span className="cx-dept-bar__meter" aria-hidden="true"><span style={{ width: `${(customizedCount / departments.length) * 100}%` }} /></span>
                </div>
                {nextUnset && (
                  <button type="button" className="cx-dept-bar__next" onClick={() => setDepartmentId(nextUnset.departmentId)}>
                    {translateUi('Phòng ban chưa đặt tiếp theo')}<ArrowRight size={14} aria-hidden="true" />
                  </button>
                )}
              </div>

              <div className="cx-dept-main">
                {department && (
                  <div className="cx-dept-hero" data-tone={toneOf.get(department.departmentId)}>
                    <span className="cx-dept-hero__badge" aria-hidden="true">{initialsOf(department.name)}</span>
                    <div className="cx-dept-hero__copy">
                      <h3>{department.name}</h3>
                      <p>{translateUi(setDomains > 0
                        ? `Bấm vào mức cao nhất nhân viên ${department.name} cần đạt ở mỗi lĩnh vực. Họ học từ Cơ bản tới mức đó.`
                        : `${department.name} chưa đặt mức. Bấm vào mức cần đạt ở từng lĩnh vực.`)}</p>
                      {canEdit && (canSuggest || department.isCustomized) && (
                        <div className="cx-dept-hero__actions">
                          {canSuggest && <button type="button" className="cc-btn" onClick={() => setDraft({ ...current, ...suggested })} disabled={saving}><Sparkles size={14} aria-hidden="true" />{translateUi('Dùng mức đề xuất')}</button>}
                          {department.isCustomized && <button type="button" className="cc-btn" onClick={clearDepartment} disabled={saving}>{translateUi('Bỏ mức đã đặt')}</button>}
                        </div>
                      )}
                    </div>
                    <dl className="cx-dept-hero__stats">
                      <div><dt>{translateUi('Nhân viên')}</dt><dd>{department.employeeCount}</dd></div>
                      <div><dt>{translateUi('Lĩnh vực đã đặt')}</dt><dd>{setDomains}<span>/{matrix.domains.length}</span></dd></div>
                      <div data-tone={departmentNeeds.length ? 'need' : undefined}>
                        <dt>{translateUi('Khóa cần mua')}</dt>
                        <dd>{departmentNeeds.length}</dd>
                        {departmentNeeds.length > 0 && <button type="button" onClick={() => switchView('courses')}>{translateUi('Mua ở phần 1')}<ArrowRight size={12} aria-hidden="true" /></button>}
                      </div>
                    </dl>
                  </div>
                )}

                <div className="cx-grid cx-grid--levels" role="table" aria-label={translateUi(`Mức năng lực của ${department?.name ?? 'phòng ban'}`)}>
                  <GridHead levels={matrix.levels} />
                  {matrix.domains.map((domain) => {
                    const level = current[domain.categoryId];
                    return (
                      <div key={domain.categoryId} className="cx-row" role="row" data-domain={domain.sortOrder}>
                        {domainHeader(domain, level ? undefined : ' · chưa đặt')}
                        <div className="cx-range" role="group" aria-label={translateUi(`Mức của ${domain.name}`)}>
                          {domain.courses.map((course) => (
                            <LevelCell key={course.level} domain={domain} course={course} level={level} suggested={suggestionOf(domain)}
                              editable={canEdit && !saving} onPick={() => pick(domain, course.level)} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {actionHost && (showSaveBar || showCart) && createPortal(
        <div ref={setActionDock} className="cc-root cc-action-dock" role="region" aria-label={translateUi('Thao tác khung năng lực')}>
          {showSaveBar && (
            <div className="cc-save-bar">
              <div className="cc-save-indicator" aria-hidden="true" />
              <div className="cc-save-copy" role="status">
                <strong>{translateUi(`Mức năng lực của ${department?.name ?? 'phòng ban'} chưa được lưu`)}</strong>
                <span>{translateUi('Lưu để nhân viên học theo mức mới.')}</span>
              </div>
              <div className="cc-save-buttons">
                <button type="button" className="cc-btn" onClick={() => setDraft(null)} disabled={saving}>{translateUi('Hủy thay đổi')}</button>
                <button type="button" className="cc-btn primary" onClick={save} disabled={saving}>{saving ? translateUi('Đang lưu…') : translateUi('Lưu thay đổi')}</button>
              </div>
            </div>
          )}
          {showCart && (
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
          )}
        </div>,
        actionHost,
      )}

      <CapabilityCeilingGuide open={showGuide} onClose={() => setShowGuide(false)} />
    </section>
  );
}

/** Owned share of the 18 courses as a ring; the number is ink, the colour is only on the ring. */
function ProgressRing({ value, total }: { value: number; total: number }) {
  const radius = 32;
  const length = 2 * Math.PI * radius;
  const share = total ? value / total : 0;
  return (
    <div className="cx-ring" role="img" aria-label={translateUi(`Đã có ${value}/${total} khóa`)}>
      <svg viewBox="0 0 80 80" width="88" height="88" aria-hidden="true">
        <circle cx="40" cy="40" r={radius} className="cx-ring__track" />
        <circle cx="40" cy="40" r={radius} className="cx-ring__value" strokeDasharray={`${share * length} ${length}`} transform="rotate(-90 40 40)" />
      </svg>
      <span><strong>{value}</strong>/{total}</span>
    </div>
  );
}

/** Column headings with the level drawn as filled dots (●○○ → ●●●), darker for higher levels. */
function GridHead({ levels }: { levels: CeilingLevel[] }) {
  useUiLanguage();
  return (
    <div className="cx-grid__head" role="row">
      <span role="columnheader">{translateUi('Lĩnh vực')}</span>
      {levels.map((level) => (
        <span key={level.level} role="columnheader" className="cx-level-head" data-level={level.level}>
          {translateUi(level.name)}
          <span className="cx-level-head__dots" aria-hidden="true">{[1, 2, 3].map((dot) => <i key={dot} data-on={dot <= level.level || undefined} />)}</span>
        </span>
      ))}
    </div>
  );
}

/**
 * "Khóa học của doanh nghiệp": owned course (who uses it) or a course still to buy. A course departments aim at shows
 * their badges (same colours as in the department list), at most three and "+n".
 */
function CourseCell({ domain, course, inCart, usedBy, neededBy, toneOf, departmentCount, canBuy, onToggleCart, onInspect }: {
  domain: CeilingDomain;
  course: CeilingCourse;
  inCart: boolean;
  usedBy: CeilingDepartment[];
  neededBy: CeilingDepartment[];
  toneOf: Map<string, number>;
  departmentCount: number;
  canBuy: boolean;
  onToggleCart: () => void;
  onInspect: () => void;
}) {
  useUiLanguage();
  const levelName = translateUi(LEVEL_NAMES[course.level]);
  const code = course.code ?? `cấp ${course.level}`;
  if (!course.courseId) {
    return <div className="cx-cell-wrap" role="cell"><div className="cx-cell" data-state="none"><span className="cx-cell__level">{levelName}</span><span className="cx-cell__status">{translateUi('Chưa có khóa')}</span></div></div>;
  }
  if (isOwned(course)) {
    const users = departmentCount === 0 ? translateUi('Cả doanh nghiệp')
      : usedBy.length === departmentCount ? translateUi('Mọi phòng ban')
      : usedBy.length === 0 ? translateUi('Chưa phòng ban nào')
      : translateUi(`${usedBy.length}/${departmentCount} phòng ban`);
    return (
      <div className="cx-cell-wrap" role="cell">
        <button type="button" className="cx-cell" data-state="owned" data-level={course.level} aria-label={translateUi(`Xem khóa ${code}`)}
          title={`${course.code ?? ''} · ${course.title ?? ''}`.trim()} onClick={onInspect}>
          <span className="cx-cell__level">{levelName}</span>
          <span className="cx-cell__status"><Check size={15} aria-hidden="true" />{translateUi(course.level === 1 ? 'Miễn phí' : 'Đã mua')}</span>
          <span className="cx-cell__note" title={usedBy.map((d) => d.name).join(', ')}>{translateUi('Dùng ở: ')}{users}</span>
        </button>
      </div>
    );
  }
  const needed = neededBy.length > 0 && !inCart;
  return (
    <div className="cx-cell-wrap" role="cell">
      <button type="button" className="cx-cell" data-state={inCart ? 'cart' : needed ? 'needed' : 'locked'} aria-pressed={inCart} disabled={!canBuy}
        aria-label={translateUi(`${domain.name}, cấp ${course.level}: ${inCart ? 'đã chọn mua, bấm để bỏ chọn' : 'chưa mua khóa, bấm để chọn mua cùng khóa khác'}.`)}
        onClick={onToggleCart}>
        <span className="cx-cell__level">{levelName}</span>
        <span className="cx-cell__status">{inCart ? <><ShoppingCart size={14} aria-hidden="true" />{translateUi('Trong giỏ')}</> : <><Lock size={13} aria-hidden="true" />{translateUi('Chưa mua')}</>}</span>
        {needed ? (
          <span className="cx-need" title={translateUi(`Cần cho: ${neededBy.map((d) => d.name).join(', ')}`)}>
            <span className="cx-need__label">{translateUi('Cần cho')}</span>
            <span className="cx-need__badges">
              {neededBy.slice(0, NEED_BADGES).map((d) => <i key={d.departmentId} data-tone={toneOf.get(d.departmentId)}>{initialsOf(d.name)}</i>)}
              {neededBy.length > NEED_BADGES && <i data-more>+{neededBy.length - NEED_BADGES}</i>}
            </span>
          </span>
        ) : null}
        <span className="cx-cell__note">{inCart ? translateUi('Bấm để bỏ khỏi giỏ') : `${money(course.price ?? 0)} · ${translateUi('Thêm vào giỏ')}`}</span>
      </button>
      <button type="button" className="cx-cell__info" aria-label={translateUi(`Xem khóa ${code}`)} title={translateUi('Xem khóa học')} onClick={onInspect}><Info size={14} /></button>
    </div>
  );
}

/**
 * "Năng lực từng phòng ban": one level of a domain inside a joined range control: the levels up to the chosen one are
 * filled like a progress bar and the chosen one carries a flag. A level whose course is not bought can still be set.
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
  const levelName = translateUi(LEVEL_NAMES[course.level]);
  if (!course.courseId) {
    return <div className="cx-step" data-state="none"><span className="cx-step__level">{levelName}</span><span className="cx-step__status">{translateUi('Chưa có khóa')}</span></div>;
  }
  const state = !level ? 'idle' : course.level < level ? 'included' : course.level === level ? 'selected' : 'above';
  const owned = isOwned(course);
  return (
    <button type="button" className="cx-step" data-state={state} aria-pressed={state === 'selected'} disabled={!editable}
      aria-label={translateUi(`Đặt mức ${domain.name}: ${LEVEL_NAMES[course.level]}${owned ? '' : ' (chưa mua)'}`)} onClick={onPick}>
      <span className="cx-step__level">{levelName}</span>
      <span className="cx-step__status">
        {state === 'selected' ? <><Flag size={14} aria-hidden="true" />{translateUi('Mức cần đạt')}</>
          : state === 'included' ? <><Check size={14} aria-hidden="true" />{translateUi('Đã gồm')}</>
          : translateUi('Chọn')}
      </span>
      <span className="cx-step__tags">
        {!owned && <span className="cx-step__tag" data-tag="locked"><Lock size={11} aria-hidden="true" />{translateUi('Chưa mua')}</span>}
        {suggested === course.level && state !== 'selected' && <span className="cx-step__tag" data-tag="suggest"><Sparkles size={11} aria-hidden="true" />{translateUi('Đề xuất')}</span>}
      </span>
    </button>
  );
}
