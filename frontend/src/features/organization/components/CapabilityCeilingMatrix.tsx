import { translateUi, useUiLanguage } from '@/lib/i18n';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { X, Info, Building2, Users, ChevronDown, Check, Search, ArrowRight, Layers3, Database, MessagesSquare, PenTool, ShieldCheck, Lightbulb, BrainCircuit } from 'lucide-react';
import {
  useCapabilityCeilings,
  useUpdateDepartmentCeilings,
  useUpdateOrganizationCeilings,
} from '@/hooks/use-capability-ceilings';
import { PERMISSIONS, usePermission } from '@/hooks/use-permission';
import { useTrialRoadmap } from '@/hooks/use-trial-program';
import { organizationErrorMessage } from '@/lib/organization-errors';
import { SectionLoading } from '@/components/shared/LoadingState';
import type { CapabilityCeilings, CeilingCourse, CeilingDomain } from '@/services/capability-ceiling.service';
import type { TrialPlanKind } from '@/services/trial-program.service';
import { courseCode, trialScopeOf, type SeatHints } from '../lib/trial-scope';
import { TrialScopePanel } from './TrialScopePanel';
import { CoursePositionStandardPanel } from './CoursePositionStandardPanel';
import { DomainPositionStandardPanel } from './DomainPositionStandardPanel';
import { CapabilityCeilingGuide } from './CapabilityCeilingGuide';
import './capability-ceiling.css';
import './owner-filter-controls.css';

type BuyItem = { code: string; title: string; level: number; domainName: string; price: number; seats?: number };
const PLAN_KINDS_IN_URL: TrialPlanKind[] = ['SAVING', 'BALANCED', 'FULL'];

/** Phạm vi đang xem: cả doanh nghiệp hoặc id của một phòng ban. */
const ALL = 'all';
const DOMAIN_ICONS = [Database, MessagesSquare, PenTool, ShieldCheck, Lightbulb, BrainCircuit];

type Levels = Record<string, number>;
type MatrixSelection = { kind: 'domain'; categoryId: string } | { kind: 'course'; categoryId: string; level: number };

const sameLevels = (a: Levels, b: Levels) =>
  Object.keys(a).length === Object.keys(b).length && Object.keys(a).every((key) => a[key] === b[key]);

function organizationLevels(matrix: CapabilityCeilings): Levels {
  return Object.fromEntries(matrix.domains.map((d) => [d.categoryId, d.organizationCeiling]));
}

function departmentLevels(matrix: CapabilityCeilings, departmentId: string): Levels {
  const department = matrix.departments.find((d) => d.departmentId === departmentId);
  return Object.fromEntries((department?.ceilings ?? []).map((c) => [c.categoryId, c.level]));
}

export function CapabilityCeilingMatrix() {
  useUiLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialPositionId = searchParams.get('positionId');
  const { data: matrix, isLoading, isError } = useCapabilityCeilings();
  const { can } = usePermission();
  const canEdit = can(PERMISSIONS.POSITION_REQUIREMENT_MANAGE);
  const saveOrganization = useUpdateOrganizationCeilings();
  const saveDepartment = useUpdateDepartmentCeilings();
  const [scope, setScope] = useState<string>(ALL);
  const [drafts, setDrafts] = useState<Record<string, Levels>>({});
  const [showGuide, setShowGuide] = useState(false);
  const [isDeptMenuOpen, setIsDeptMenuOpen] = useState(false);
  const [deptSearch, setDeptSearch] = useState('');
  const [selectedToBuy, setSelectedToBuy] = useState<Map<string, BuyItem>>(new Map());
  // Phạm vi theo kết quả test dùng thử (?plan= từ báo cáo OW-T1).
  const planParam = searchParams.get('plan') as TrialPlanKind | null;
  const [trialKind, setTrialKind] = useState<TrialPlanKind>(planParam && PLAN_KINDS_IN_URL.includes(planParam) ? planParam : 'BALANCED');
  const roadmapQuery = useTrialRoadmap(canEdit);
  const roadmap = roadmapQuery.data?.available ? roadmapQuery.data : null;
  const trialScope = useMemo(() => (roadmap && matrix ? trialScopeOf(roadmap, matrix, trialKind) : null), [roadmap, matrix, trialKind]);
  const [selection, setSelection] = useState<MatrixSelection | null>(null);
  const [closingSelection, setClosingSelection] = useState<MatrixSelection | null>(null);
  const [closedInitialPanel, setClosedInitialPanel] = useState(false);
  const [panelVisible, setPanelVisible] = useState(Boolean(initialPositionId));
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openFrame = useRef<number | null>(null);

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (openFrame.current) cancelAnimationFrame(openFrame.current);
  }, []);

  const department = matrix?.departments.find((d) => d.departmentId === scope);
  const activeScope = scope === ALL || department ? scope : ALL;

  const filteredDepartments = useMemo(() => {
    if (!matrix?.departments) return [];
    if (!deptSearch.trim()) return matrix.departments;
    const q = deptSearch.toLowerCase().trim();
    return matrix.departments.filter((d) => d.name.toLowerCase().includes(q));
  }, [matrix?.departments, deptSearch]);

  const saved = useMemo(() => {
    if (!matrix) return {};
    return activeScope === ALL ? organizationLevels(matrix) : departmentLevels(matrix, activeScope);
  }, [matrix, activeScope]);

  const buyItem = (course: CeilingCourse, domain: CeilingDomain): BuyItem => {
    const code = courseCode(course.code, domain.sortOrder, course.level);
    return {
      code,
      title: course.title || `Khóa học ${code}`,
      level: course.level,
      domainName: domain.name,
      price: course.pricePerSeat || (course.level === 3 ? 699000 : 399000),
      seats: trialScope?.seats.get(code),
    };
  };

  /** Đánh dấu mua mọi khóa 🔒 mà phương án theo test cần (kèm số suất). */
  const selectTrialPlan = () => {
    if (!matrix || !trialScope) return;
    const next = new Map<string, BuyItem>();
    for (const domain of matrix.domains) {
      for (const course of domain.courses) {
        const item = buyItem(course, domain);
        if (course.courseId && course.isUnlocked !== true && course.level > 1 && item.seats) next.set(item.code, item);
      }
    }
    setSelectedToBuy(next);
    toast.success(`Đã chọn ${next.size} khóa theo kết quả test`);
  };

  const toggleSelectToBuy = (course: CeilingCourse, domain: CeilingDomain) => {
    if (!course.courseId) {
      toast.error('Khóa học này chưa có trong danh mục để mua.');
      return;
    }
    const code = courseCode(course.code, domain.sortOrder, course.level);
    setSelectedToBuy((prev) => {
      const next = new Map(prev);
      if (next.has(code)) {
        next.delete(code);
        toast.info(`Đã bỏ chọn khóa ${code}`);
      } else {
        next.set(code, buyItem(course, domain));
        toast.success(`Đã chọn khóa ${code} để mua bản quyền`, {
          description: 'Bạn có thể chọn thêm nhiều khóa khác trước khi bấm Tiếp tục.',
        });
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <section className="cc-root">
        <SectionLoading label={translateUi("Đang tải ma trận năng lực")} />
      </section>
    );
  }

  if (isError || !matrix) {
    return (
      <section className="cc-root">
        <p className="cc-note">{translateUi("Chưa tải được ma trận phạm vi đào tạo. Vui lòng thử lại sau.")}</p>
      </section>
    );
  }

  const orgSaved = organizationLevels(matrix);
  const current = drafts[activeScope] ?? saved;
  const dirty = Boolean(drafts[activeScope]) && !sameLevels(current, saved);
  const needsInitialSave = activeScope === ALL && !matrix.isConfigured;
  const saving = saveOrganization.isPending || saveDepartment.isPending;
  const orgCeiling = activeScope === ALL ? current : orgSaved;
  const activeSelection = selection ?? (!closedInitialPanel && initialPositionId && matrix.domains[0] ? { kind: 'domain' as const, categoryId: matrix.domains[0].categoryId } : null);
  const renderedSelection = activeSelection ?? closingSelection;
  const activeDomain = matrix.domains.find((item) => item.categoryId === renderedSelection?.categoryId);
  const activeCourse = renderedSelection?.kind === 'course' ? activeDomain?.courses.find((item) => item.level === renderedSelection.level) : undefined;
  const suggestedLevels: Levels = Object.fromEntries(matrix.domains.map((domain) => [
    domain.categoryId,
    Math.min(domain.maxAllowedCeiling ?? 1, Math.max(1, domain.suggestedCeiling)),
  ]));
  const hasApplicableSuggestion = activeScope === ALL && !sameLevels(current, suggestedLevels);

  const setDraft = (levels: Levels | null) =>
    setDrafts((all) => {
      const next = { ...all };
      if (levels && !sameLevels(levels, saved)) next[activeScope] = levels;
      else delete next[activeScope];
      return next;
    });

  const pick = (domain: CeilingDomain, level: number) => {
    if (!canEdit || saving || (activeScope !== ALL && !matrix.isConfigured)) return;
    const courseAtLevel = domain.courses.find((c) => c.level === level);
    if (level > 1 && (courseAtLevel?.isUnlocked !== true || level > (domain.maxAllowedCeiling ?? 1))) {
      if (!courseAtLevel) return;
      toggleSelectToBuy(courseAtLevel, domain);
      return;
    }

    const target = level;
    if (activeScope !== ALL && target > (orgSaved[domain.categoryId] ?? 0)) {
      toast.error('Cấp độ áp dụng của phòng ban không được vượt mức doanh nghiệp đã thiết lập.');
      return;
    }
    if (activeScope === ALL && target > (domain.maxAllowedCeiling ?? 1)) return;
    setDraft({ ...current, [domain.categoryId]: target });
  };

  const applySuggestion = () => {
    setDraft(suggestedLevels);
  };

  const save = async () => {
    const ceilings = Object.entries(current).map(([categoryId, level]) => ({ categoryId, level }));
    if (activeScope === ALL && ceilings.some(({ categoryId, level }) => level > (matrix.domains.find((item) => item.categoryId === categoryId)?.maxAllowedCeiling ?? 1))) {
      toast.error('Có cấp chưa mua suất học. Chọn khóa để mua trước khi mở rộng phạm vi.');
      return;
    }
    try {
      if (activeScope === ALL) {
        const result = await saveOrganization.mutateAsync(ceilings);
        const adjustedCount = (result as { adjustedDepartmentCount?: number } | null | undefined)?.adjustedDepartmentCount ?? 0;
        if (adjustedCount > 0) {
          toast.info(`Đã lưu phạm vi doanh nghiệp. Đã điều chỉnh ${adjustedCount} phòng ban theo phạm vi mới.`);
        } else {
          toast.success('Đã lưu phạm vi đào tạo của doanh nghiệp.');
        }
      } else {
        await saveDepartment.mutateAsync({ departmentId: activeScope, data: { inherit: false, ceilings } });
        toast.success(`Đã lưu phạm vi đào tạo cho ${department?.name ?? 'phòng ban'}.`);
      }
      setDraft(null);
    } catch (error) {
      toast.error(organizationErrorMessage(error, 'Chưa lưu được phạm vi đào tạo.'));
    }
  };

  const inherit = async () => {
    if (activeScope === ALL) return;
    try {
      await saveDepartment.mutateAsync({ departmentId: activeScope, data: { inherit: true, ceilings: [] } });
      setDraft(null);
      toast.success(`${department?.name ?? 'Phòng ban'} dùng lại phạm vi doanh nghiệp.`);
    } catch (error) {
      toast.error(organizationErrorMessage(error, 'Chưa lưu được phạm vi đào tạo.'));
    }
  };

  const blockedDepartments = activeScope !== ALL && !matrix.isConfigured;
  const panelDuration = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 380;
  const openSelection = (next: MatrixSelection) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (openFrame.current) cancelAnimationFrame(openFrame.current);
    setClosedInitialPanel(true);
    // Update the requested content immediately; animation must never queue a click.
    const sameRow = renderedSelection?.categoryId === next.categoryId;
    setClosingSelection(null);
    setSelection(next);
    setPanelVisible(Boolean(sameRow));
    if (!sameRow) openFrame.current = requestAnimationFrame(() => {
      openFrame.current = requestAnimationFrame(() => setPanelVisible(true));
    });
  };
  const closeSelection = () => {
    if (!activeSelection) return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (openFrame.current) cancelAnimationFrame(openFrame.current);
    setClosingSelection(activeSelection);
    setPanelVisible(false);
    setSelection(null);
    setClosedInitialPanel(true);
    closeTimer.current = setTimeout(() => setClosingSelection(null), panelDuration());
  };
  const inspect = (domain: CeilingDomain, level: number) => {
    if (panelVisible && activeSelection?.kind === 'course' && activeSelection.categoryId === domain.categoryId && activeSelection.level === level) closeSelection();
    else openSelection({ kind: 'course', categoryId: domain.categoryId, level });
  };
  const inspectDomain = (domain: CeilingDomain) => {
    if (panelVisible && activeSelection?.kind === 'domain' && activeSelection.categoryId === domain.categoryId) closeSelection();
    else openSelection({ kind: 'domain', categoryId: domain.categoryId });
  };

  return (
    <section className="cc-root" aria-labelledby="cc-title">
      {/* ── Tiêu đề súc tích & Nút Hướng dẫn nổi ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-teal-100 bg-gradient-to-r from-teal-50 via-white to-sky-50 px-5 py-4">
        <div className="flex items-center gap-3">
          <h2 id="cc-title" className="text-xl sm:text-2xl font-black tracking-[-0.03em] section-gradient">{translateUi("Phạm vi đào tạo")}</h2>
          {matrix.isConfigured ? (
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">{translateUi("Đã lưu")}</span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">{translateUi("Gợi ý · Chưa lưu")}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/enterprise/courses')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <span>{translateUi("Danh mục khóa học →")}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowGuide(true)}
            className="cc-guide-trigger"
            aria-haspopup="dialog"
          >
            <Info className="size-3.5 text-slate-500" />
            <span>{translateUi("Quy tắc & Hướng dẫn")}</span>
          </button>
        </div>
      </div>

      {roadmap && (
        <TrialScopePanel roadmap={roadmap} matrix={matrix} kind={trialKind} onKind={setTrialKind} onSelect={selectTrialPlan} canEdit={canEdit} />
      )}

      {/* ── Ma trận trung tâm (Clean & Rõ ràng) ── */}
      <div className="cc-grid">
        <div className="cc-card cc-card--studio">
          {/* ── Bộ chọn phạm vi tối giản, hiện đại (Segmented Scope Control) ── */}
          <div className="cc-scope-toolbar">
            <div className="cc-scope-controls">
            <span className="cc-scope-label"><Layers3 size={15} aria-hidden="true" />{translateUi("Phạm vi áp dụng")}</span>
            <div className="cc-scope-switch">
              {/* Nút 1: Toàn doanh nghiệp */}
              <button
                type="button"
                onClick={() => {
                  setScope(ALL);
                  setIsDeptMenuOpen(false);
                }}
                className={`cc-scope-option${activeScope === ALL ? ' is-active' : ''}`}
                aria-pressed={activeScope === ALL}
              >
                <Building2 className="size-3.5 text-emerald-700" />
                <span>{translateUi("Toàn doanh nghiệp")}</span>
                {drafts[ALL] && <span className="size-1.5 rounded-full bg-amber-500" title={translateUi("Chưa lưu")} />}
              </button>

              {/* Nút 2: Theo phòng ban (có Popover chọn) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    if (activeScope === ALL && matrix.departments.length > 0) {
                      setScope(matrix.departments[0].departmentId);
                    }
                    setIsDeptMenuOpen(!isDeptMenuOpen);
                  }}
                  className={`cc-scope-option${activeScope !== ALL ? ' is-active' : ''}`}
                  aria-expanded={isDeptMenuOpen}
                >
                  <Users className="size-3.5 text-emerald-700" />
                  <span className="max-w-[170px] sm:max-w-[210px] truncate">
                    {activeScope !== ALL && department ? department.name : translateUi('Chọn phòng ban')}
                  </span>
                  {activeScope !== ALL && department?.isCustomized && (
                    <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[9.5px] font-bold text-emerald-800">{translateUi("Thiết lập riêng")}</span>
                  )}
                  {activeScope !== ALL && drafts[activeScope] && (
                    <span className="size-1.5 rounded-full bg-amber-500" title={translateUi("Chưa lưu")} />
                  )}
                  <ChevronDown className={`size-3 text-slate-400 transition-transform duration-200 ${isDeptMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Popover danh sách phòng ban */}
                {isDeptMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setIsDeptMenuOpen(false)} />
                    <div className="absolute left-0 sm:left-auto sm:right-0 top-full z-30 mt-2 w-80 rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-xl">
                      <div className="flex items-center justify-between px-2 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                        <span>{translateUi("Phòng ban (")}{matrix.departments.length})</span>
                        <span>{translateUi("Mức áp dụng")}</span>
                      </div>

                      {matrix.departments.length > 4 && (
                        <div className="pt-2 pb-1">
                          <label className="owner-filter-search">
                          <Search className="size-4" aria-hidden="true" />
                          <input
                            type="text"
                            aria-label={translateUi("Tìm phòng ban trong danh sách")}
                            placeholder={translateUi("Tìm kiếm phòng ban...")}
                            value={deptSearch}
                            onChange={(e) => setDeptSearch(e.target.value)}
                            className="w-full text-sm"
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                          />
                          </label>
                        </div>
                      )}

                      <div className="mt-1 max-h-64 overflow-y-auto space-y-1 pr-1">
                        {filteredDepartments.map((d) => {
                          const isSelected = activeScope === d.departmentId;
                          const hasDraft = Boolean(drafts[d.departmentId]);
                          return (
                            <button
                              key={d.departmentId}
                              type="button"
                              onClick={() => {
                                setScope(d.departmentId);
                                setIsDeptMenuOpen(false);
                                setDeptSearch('');
                              }}
                              className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs transition-colors ${
                                isSelected
                                  ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/60'
                                  : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {isSelected ? (
                                  <Check className="size-3.5 text-emerald-600 shrink-0" />
                                ) : (
                                  <span className="size-1.5 rounded-full bg-slate-300 shrink-0 ml-1 mr-1" />
                                )}
                                <span className="truncate">{d.name}</span>
                                {hasDraft && <span className="size-1.5 rounded-full bg-amber-500 shrink-0" title={translateUi("Chưa lưu")} />}
                              </div>

                              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                d.isCustomized
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-500'
                              }`}>
                                {d.isCustomized ? translateUi('Thiết lập riêng') : 'Kế thừa DN'}
                              </span>
                            </button>
                          );
                        })}
                        {filteredDepartments.length === 0 && (
                          <p className="py-4 text-center text-xs text-slate-400">{translateUi("Không tìm thấy phòng ban")}</p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            </div>

            {/* Dòng trạng thái ngữ cảnh tinh tế */}
            <div className="cc-scope-status">
              <span className={`size-2 rounded-full shrink-0 ${activeScope === ALL ? 'bg-emerald-500' : department?.isCustomized ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              <span className="font-medium text-slate-600">
                {activeScope === ALL
                  ? translateUi('Phạm vi chung toàn doanh nghiệp')
                  : department?.isCustomized
                    ? translateUi(`${department.name} · Thiết lập riêng`)
                    : translateUi(`${department?.name ?? 'Phòng ban'} · Kế thừa doanh nghiệp`)}
              </span>
            </div>
          </div>

          {/* Ma trận màu xanh */}
          <div className="cc-mx" role="group" aria-label={translateUi("Ma trận năng lực nhân cấp độ")}>
            <div className="cc-mx-domain-heading"><Layers3 size={16} aria-hidden="true" /><span>{translateUi("Lĩnh vực năng lực")}<small>{translateUi("Chọn để cài đặt vị trí")}</small></span></div>
            {matrix.levels.map((level) => (
              <div key={level.level} className="hd">
                <span className="cc-level-marker" aria-hidden="true">{String(level.level).padStart(2, '0')}</span>
                <span className="cc-level-copy"><small>{translateUi("Cấp ")}{level.level}</small><strong>{translateUi(level.name)}</strong></span>
              </div>
            ))}
            {matrix.domains.map((domain) => {
              const routeLevel = current[domain.categoryId] ?? 0;
              const dnLevel = orgCeiling[domain.categoryId] ?? 0;
              const isSelected = activeSelection?.categoryId === domain.categoryId && panelVisible;
              const isRendered = renderedSelection?.categoryId === domain.categoryId;
              const DomainIcon = DOMAIN_ICONS[domain.sortOrder - 1] ?? Layers3;
              return (
                <Fragment key={domain.categoryId}>
                <DomainRow
                  domain={domain}
                  routeLevel={routeLevel}
                  dnLevel={dnLevel}
                  isDepartment={activeScope !== ALL}
                  selectedDomain={isSelected && activeSelection?.kind === 'domain'}
                  editable={canEdit}
                  selectedToBuy={selectedToBuy}
                  seats={trialScope?.seats}
                  reason={trialScope?.reasons.get(domain.categoryId)}
                  onPick={pick}
                  onInspect={inspect}
                  onDomainClick={inspectDomain}
                  onToggleBuy={toggleSelectToBuy}
                />
                {isRendered && activeDomain && (
                  <div
                    id={`course-position-standard-${domain.categoryId}`}
                    className={`cc-inline-panel${isSelected ? ' is-open' : ''}`}
                    inert={!isSelected}
                  >
                    <div className="cc-inline-panel__inner">
                      <div className="cc-inline-panel__surface">
                        <div className="cc-domain-panel" data-domain={domain.sortOrder}>
                        <button type="button" className="cc-domain-panel__header" onClick={closeSelection} aria-label={translateUi(`Thu gọn ${domain.name}`)} aria-expanded={isSelected} aria-controls={`domain-panel-content-${domain.categoryId}`}>
                          <span className="cc-domain-icon" aria-hidden="true"><DomainIcon size={18} /></span>
                          <span className="cc-domain-panel__heading"><small>{activeCourse ? translateUi('KHÓA HỌC & SUẤT HỌC') : 'CHUẨN VỊ TRÍ THEO LĨNH VỰC'}</small><strong>{translateUi(domain.name)}</strong></span>
                          <span className="cc-domain-panel__collapse">{translateUi("Thu gọn ")}<ChevronDown size={16} aria-hidden="true" /></span>
                        </button>
                        <div id={`domain-panel-content-${domain.categoryId}`}>
                        {activeCourse ? <CoursePositionStandardPanel
                          domain={activeDomain}
                          course={activeCourse}
                          isSelectedToBuy={Boolean(activeCourse.code && selectedToBuy.has(activeCourse.code))}
                          scopeLabel={activeScope === ALL ? 'doanh nghiệp' : 'phòng ban'}
                          onSelectToBuy={() => toggleSelectToBuy(activeCourse, activeDomain)}
                        /> : <DomainPositionStandardPanel
                          key={activeDomain.categoryId}
                          domain={activeDomain}
                          domains={matrix.domains}
                          departmentId={activeScope === ALL ? null : activeScope}
                          initialPositionId={initialPositionId}
                          canEdit={canEdit}
                        />}
                        </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                </Fragment>
              );
            })}
          </div>

          {/* Chú giải ngắn gọn */}
          <div className="cc-legend" aria-label={translateUi("Chú giải trạng thái khóa học")}>
            <span className="cc-legend__title">{translateUi("Trạng thái")}</span>
            <span className="cc-legend__chip"><i className="route" />{translateUi("Trong phạm vi áp dụng")}</span>
            {activeScope !== ALL && <span className="cc-legend__chip"><i className="dn" />{translateUi("Trong phạm vi doanh nghiệp")}</span>}
            <span className="cc-legend__chip"><i className="licensed" />{translateUi("Đã mở · ngoài phạm vi")}</span>
            <span className="cc-legend__chip"><i className="locked" />{translateUi("Chưa mua")}</span>
            <span className="cc-legend__chip cc-legend__chip--cart"><i className="cart" />{translateUi("Đã chọn vào giỏ")}</span>
          </div>

          {/* Nút hành động */}
          {canEdit && (
            <div className="cc-actions">
              <div className="cc-interaction-guide" aria-label={translateUi("Cách thao tác")}>
                {blockedDepartments ? <span className="cc-interaction-guide__notice"><Info size={15} />{translateUi("Lưu phạm vi doanh nghiệp trước khi thiết lập phạm vi phòng ban.")}</span> : <span><Check size={14} /><strong>{translateUi("Chọn ô")}</strong><ArrowRight size={12} />{translateUi("Chọn cấp & lưu")}</span>}
                <span><Info size={14} /><strong>ⓘ</strong>{translateUi("Khóa học & suất học")}</span>
                <span><ChevronDown size={14} /><strong>{translateUi("Tên lĩnh vực")}</strong>{translateUi("Cài đặt vị trí")}</span>
              </div>
              <div className="btns">
                {hasApplicableSuggestion && (
                  <button type="button" className="cc-btn" onClick={applySuggestion} disabled={saving}>{translateUi("Áp dụng mức đề xuất")}</button>
                )}
                {activeScope !== ALL && department?.isCustomized && (
                  <button type="button" className="cc-btn cc-btn--inherit" onClick={inherit} disabled={saving} aria-busy={saving} title={translateUi("Đưa phòng ban về dùng phạm vi chung của doanh nghiệp")}>
                    <span className="cc-inherit-icon" aria-hidden="true"><Building2 size={15} /></span>
                    <span>{saving ? 'Đang áp dụng…' : translateUi('Kế thừa phạm vi doanh nghiệp')}</span>
                    <ArrowRight size={14} className="cc-inherit-arrow" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {canEdit && (dirty || needsInitialSave) && createPortal(
        <div className="cc-root cc-save-portal">
          <div className={`cc-save-bar${selectedToBuy.size > 0 ? ' cc-save-bar-with-cart' : ''}`} role="status" aria-live="polite">
            <div className="cc-save-indicator" aria-hidden="true" />
            <div className="cc-save-copy">
              <strong>{dirty ? 'Thay đổi phạm vi đào tạo chưa được lưu' : 'Phạm vi đào tạo gợi ý chưa được lưu'}</strong>
              <span>{activeScope === ALL ? translateUi('Toàn doanh nghiệp') : department?.name ?? translateUi('Phòng ban')}{translateUi(" · Lưu để áp dụng cấp độ đang hiển thị.")}</span>
            </div>
            <div className="cc-save-buttons">
              {dirty && <button type="button" className="cc-btn" onClick={() => setDraft(null)} disabled={saving}>{translateUi("Hủy thay đổi")}</button>}
              <button type="button" className="cc-btn primary" onClick={save} disabled={saving || blockedDepartments}>
                {saving ? translateUi('Đang lưu…') : translateUi('Lưu thay đổi')}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}

      {/* ── Thanh thao tác mua nhiều khóa học đã chọn nổi bật (Floating Bar) ── */}
      {selectedToBuy.size > 0 && createPortal(
        <div className="cc-cart-bar rounded-2xl border-2 border-amber-400 bg-white/95 p-4 shadow-xl backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-3 min-w-0">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white font-bold text-base shadow-sm">
              {selectedToBuy.size}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-900 text-sm">{translateUi("Giỏ suất học · ")}{selectedToBuy.size}{translateUi(" khóa")}</h4>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-300">{translateUi("Mua suất học")}</span>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {Array.from(selectedToBuy.values()).map((item) => (
                  <span
                    key={item.code}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2 py-0.5 text-xs font-semibold text-slate-800 border border-amber-200 shadow-xs"
                  >
                    <span className="font-bold text-amber-800">{item.code}</span>
                    {item.seats ? <span className="text-slate-500">{item.seats} suất</span> : null}
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-600 max-w-[140px] truncate">{translateUi(item.domainName)}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedToBuy((prev) => {
                          const next = new Map(prev);
                          next.delete(item.code);
                          return next;
                        });
                      }}
                      className="ml-0.5 grid size-3.5 place-items-center rounded-full text-slate-400 hover:bg-amber-200 hover:text-slate-800"
                      title={translateUi("Bỏ chọn khóa này")}
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 justify-end">
            <button
              type="button"
              onClick={() => setSelectedToBuy(new Map())}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >{translateUi("Hủy chọn tất cả")}</button>
            <button
              type="button"
              onClick={() => {
                const codes = Array.from(selectedToBuy.keys()).join(',');
                navigate(`/enterprise/courses?selected=${encodeURIComponent(codes)}`);
              }}
              className="rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-colors"
            >{translateUi("Xem trên danh mục")}</button>
            <button
              type="button"
              onClick={() => {
                const codes = Array.from(selectedToBuy.values()).map((item) => (item.seats ? `${item.code}:${item.seats}` : item.code)).join(',');
                navigate(`/enterprise/courses/checkout?courses=${encodeURIComponent(codes)}`);
              }}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:brightness-105 transition-all"
            >
              <span>Thanh toán & Ký online ({selectedToBuy.size})</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>,
        document.body,
      )}

      {/* ── Modal Popup nổi: Quy tắc & Hướng dẫn ── */}
      <CapabilityCeilingGuide open={showGuide} onClose={() => setShowGuide(false)} />
    </section>
  );
}

function DomainRow({
  domain,
  routeLevel,
  dnLevel,
  isDepartment,
  selectedDomain,
  editable,
  selectedToBuy,
  seats,
  reason,
  onPick,
  onInspect,
  onDomainClick,
  onToggleBuy,
}: {
  domain: CeilingDomain;
  routeLevel: number;
  dnLevel: number;
  isDepartment: boolean;
  selectedDomain: boolean;
  editable: boolean;
  selectedToBuy?: Map<string, BuyItem>;
  /** Số suất theo kết quả test (mã khóa → số người cần học). */
  seats?: SeatHints;
  /** ✦ Lý do mức tối đa đề xuất (kết quả test). */
  reason?: string;
  onPick: (domain: CeilingDomain, level: number) => void;
  onInspect: (domain: CeilingDomain, level: number) => void;
  onDomainClick: (domain: CeilingDomain) => void;
  onToggleBuy?: (course: CeilingCourse, domain: CeilingDomain) => void;
}) {
  useUiLanguage();
  const DomainIcon = DOMAIN_ICONS[domain.sortOrder - 1] ?? Layers3;
  return (
    <>
      <button type="button" data-domain={domain.sortOrder} className={`rl${selectedDomain ? ' is-selected' : ''}`} aria-expanded={selectedDomain} aria-controls={`course-position-standard-${domain.categoryId}`} aria-label={translateUi(`${selectedDomain ? 'Đóng' : 'Mở'} cài đặt vị trí cho lĩnh vực ${domain.name}`)} onClick={() => onDomainClick(domain)}>
        <span className="cc-domain-icon" aria-hidden="true"><DomainIcon size={18} /></span>
        <span className="cc-domain-copy"><span className="cc-domain-title">{translateUi(domain.name)}</span>
        <small><span className="cc-domain-level">{isDepartment ? `PB ${routeLevel} · DN ${dnLevel}` : translateUi(`DN · Cấp ${dnLevel}`)}</span><span className="cc-domain-hint">{selectedDomain ? 'Đóng cài đặt' : translateUi('Cài đặt vị trí')}</span></small>
        {reason && <span className="cc-reason" title={`Theo kết quả test: ${reason}`}>✦ {reason}</span>}</span>
        <ChevronDown className={`cc-domain-chevron${selectedDomain ? ' is-open' : ''}`} size={15} aria-hidden="true" />
      </button>
      {domain.courses.map((course) => {
        const isLocked = course.level > 1 && course.isUnlocked !== true;
        const inRoute = !isLocked && course.level <= routeLevel;
        const inOrg = !isLocked && course.level <= dnLevel;
        const isSelectedToBuy = Boolean(course.code && selectedToBuy?.has(course.code));
        const seatCount = course.level > 1 ? seats?.get(courseCode(course.code, domain.sortOrder, course.level)) : undefined;
        const state = isSelectedToBuy
          ? 'đã chọn mua, bấm để bỏ chọn'
          : inRoute
          ? 'trong lộ trình đang xem'
          : inOrg
          ? 'trong phạm vi doanh nghiệp'
          : isLocked
          ? 'chưa mua suất, bấm để chọn mua cùng khóa khác'
          : 'bấm để chọn cấp độ năng lực';
        const className = `cc-cell${isSelectedToBuy ? ' selected-to-buy' : isLocked ? ' is-locked' : inRoute ? ' route' : inOrg ? ' dn' : ' licensed'}${course.courseId ? '' : ' empty'}`;
        const label = course.courseId && course.code ? (
          isSelectedToBuy ? (
            <span className="flex items-center justify-center gap-1 font-bold">
              <Check className="size-3.5 text-amber-700 stroke-[3]" />
              <span>{course.code}</span>
            </span>
          ) : isLocked ? (
            `🔒 ${course.code}`
          ) : (
            course.code
          )
        ) : (
          'Chưa có khóa'
        );
        const title = `${course.courseId && course.code ? `${course.code} · ${course.title}` : 'Chưa có khóa học'}: ${state}`;
        const handleClick = () => onPick(domain, course.level);

        if (editable && isLocked && onToggleBuy) return (
          <div key={course.level} className="cc-purchase-cell">
            <button
              type="button"
              className={className}
              title={translateUi(title)}
              aria-pressed={isSelectedToBuy}
              aria-label={translateUi(`${domain.name}, cấp ${course.level}: ${state}.`)}
              onClick={() => onToggleBuy(course, domain)}
            >
              {translateUi(label)}<small>{isSelectedToBuy ? 'Đã chọn mua' : seatCount ? `${seatCount} suất · chọn mua` : translateUi('Chọn mua +')}</small>
            </button>
            <button type="button" className="cc-purchase-cell__detail" aria-label={translateUi(`Xem khóa ${course.code ?? `cấp ${course.level}`}`)} title={translateUi("Khóa học & suất học")} onClick={() => onInspect(domain, course.level)}><Info size={13} /></button>
          </div>
        );

        return editable ? (
          <div key={course.level} className="cc-purchase-cell cc-course-cell">
          <button
            type="button"
            className={className}
            title={translateUi(title)}
            aria-label={translateUi(`Thiết lập phạm vi ${domain.name}: cấp ${course.level}`)}
            aria-pressed={!isLocked && course.level === routeLevel}
            disabled={!course.courseId}
            onClick={handleClick}
          >
            {translateUi(label)}
            {!isLocked && course.level === routeLevel && <small className="cc-current-ceiling"><Check size={11} />{translateUi(" Mức đang chọn")}</small>}
          </button>
          <button type="button" className="cc-purchase-cell__detail" disabled={!course.courseId} aria-label={translateUi(`Xem khóa ${course.code ?? `cấp ${course.level}`}`)} title={translateUi("Khóa học & suất học")} onClick={() => onInspect(domain, course.level)}><Info size={13} /></button>
          </div>
        ) : (
          <div key={course.level} className={className} title={translateUi(title)}>
            {translateUi(label)}
          </div>
        );
      })}
    </>
  );
}
