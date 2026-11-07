import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { X, Info, Building2, Users, ChevronDown, Check, Search, ArrowRight } from 'lucide-react';
import {
  useCapabilityCeilings,
  useUpdateDepartmentCeilings,
  useUpdateOrganizationCeilings } from '@/hooks/use-capability-ceilings';
import { PERMISSIONS, usePermission } from '@/hooks/use-permission';
import { useTrialRoadmap } from '@/hooks/use-trial-program';
import { organizationErrorMessage } from '@/lib/organization-errors';
import { SectionLoading } from '@/components/shared/LoadingState';
import type { CapabilityCeilings, CeilingCourse, CeilingDomain } from '@/services/capability-ceiling.service';
import type { TrialPlanKind } from '@/services/trial-program.service';
import { courseCode, trialScopeOf, type SeatHints } from '../lib/trial-scope';
import { TrialScopePanel } from './TrialScopePanel';
import './capability-ceiling.css';
import './owner-filter-controls.css';

type BuyItem = { code: string; title: string; level: number; domainName: string; price: number; seats?: number };
const PLAN_KINDS_IN_URL: TrialPlanKind[] = ['SAVING', 'BALANCED', 'FULL'];

/** Phạm vi đang xem: cả doanh nghiệp hoặc id của một phòng ban. */
const ALL = 'all';

type Levels = Record<string, number>;

const sumLevels = (levels: Levels) => Object.values(levels).reduce((sum, level) => sum + level, 0);
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
  const navigate = useNavigate();
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
  const [searchParams] = useSearchParams();
  const planParam = searchParams.get('plan') as TrialPlanKind | null;
  const [trialKind, setTrialKind] = useState<TrialPlanKind>(planParam && PLAN_KINDS_IN_URL.includes(planParam) ? planParam : 'BALANCED');
  const roadmapQuery = useTrialRoadmap(canEdit);
  const roadmap = roadmapQuery.data?.available ? roadmapQuery.data : null;
  const trialScope = useMemo(() => (roadmap && matrix ? trialScopeOf(roadmap, matrix, trialKind) : null), [roadmap, matrix, trialKind]);

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
        if (course.isUnlocked === false && item.seats) next.set(item.code, item);
      }
    }
    setSelectedToBuy(next);
    toast.success(`Đã chọn ${next.size} khóa theo kết quả test`);
  };

  const toggleSelectToBuy = (course: CeilingCourse, domain: CeilingDomain) => {
    const code = courseCode(course.code, domain.sortOrder, course.level);
    setSelectedToBuy((prev) => {
      const next = new Map(prev);
      if (next.has(code)) {
        next.delete(code);
        toast.info(`Đã bỏ chọn khóa ${code}`);
      } else {
        next.set(code, buyItem(course, domain));
        toast.success(`Đã chọn khóa ${code} để mua bản quyền`, {
          description: 'Bạn có thể chọn thêm nhiều khóa khác trước khi bấm Tiếp tục.' });
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <section className="cc-root">
        <SectionLoading label="Đang tải phạm vi đào tạo" />
      </section>
    );
  }

  if (isError || !matrix) {
    return (
      <section className="cc-root">
        <p className="cc-note">Chưa tải được phạm vi đào tạo. Vui lòng thử lại sau.</p>
      </section>
    );
  }

  const orgSaved = organizationLevels(matrix);
  const current = drafts[activeScope] ?? saved;
  const dirty = Boolean(drafts[activeScope]) && !sameLevels(current, saved);
  const needsInitialSave = activeScope === ALL && !matrix.isConfigured;
  const saving = saveOrganization.isPending || saveDepartment.isPending;
  const orgCeiling = activeScope === ALL ? current : orgSaved;
  const routeCount = sumLevels(current);
  const orgCount = sumLevels(orgCeiling);
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
    if (!canEdit || saving) return;
    const courseAtLevel = domain.courses.find((c) => c.level === level);
    // Nếu ô này là khóa học chưa mở bản quyền -> Chọn/hủy chọn vào danh sách mua
    if (courseAtLevel?.isUnlocked === false) {
      toggleSelectToBuy(courseAtLevel, domain);
      return;
    }

    const now = current[domain.categoryId] ?? 0;
    const target = level === now ? level - 1 : level;
    if (activeScope !== ALL && target > (orgSaved[domain.categoryId] ?? 0)) {
      toast.error('Mức tối đa của phòng ban không được cao hơn của doanh nghiệp.');
      return;
    }
    const maxAllowed = domain.maxAllowedCeiling ?? 1;
    if (activeScope === ALL && target > maxAllowed) {
      const lockedCourse = domain.courses.find((c) => c.level === target && c.isUnlocked === false);
      if (lockedCourse) {
        toggleSelectToBuy(lockedCourse, domain);
        return;
      }
    }
    setDraft({ ...current, [domain.categoryId]: target });
  };

  const applySuggestion = () => {
    setDraft(suggestedLevels);
  };

  const save = async () => {
    const ceilings = Object.entries(current).map(([categoryId, level]) => ({ categoryId, level }));
    try {
      if (activeScope === ALL) {
        const result = await saveOrganization.mutateAsync(ceilings);
        const adjustedCount = (result as { adjustedDepartmentCount?: number } | null | undefined)?.adjustedDepartmentCount ?? 0;
        if (adjustedCount > 0) {
          toast.info(`Đã lưu phạm vi doanh nghiệp. Hạ mức tối đa của ${adjustedCount} phòng ban cho khớp.`);
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
      toast.success(`${department?.name ?? 'Phòng ban'} dùng lại phạm vi của doanh nghiệp.`);
    } catch (error) {
      toast.error(organizationErrorMessage(error, 'Chưa lưu được phạm vi đào tạo.'));
    }
  };

  const routeLabel = activeScope === ALL ? 'Khóa mở (Doanh nghiệp)' : `Khóa mở (${department?.name})`;
  const blockedDepartments = activeScope !== ALL && !matrix.isConfigured;

  return (
    <section className="cc-root" aria-labelledby="cc-title">
      {/* ── Tiêu đề súc tích & Nút Hướng dẫn nổi ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-teal-100 bg-gradient-to-r from-teal-50 via-white to-sky-50 px-5 py-4">
        <div className="flex items-center gap-3">
          <h2 id="cc-title" className="text-xl sm:text-2xl font-black tracking-[-0.03em] section-gradient">
            Phạm vi đào tạo
          </h2>
          {matrix.isConfigured ? (
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
              Đã lưu
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
              Gợi ý · Chưa lưu
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/enterprise/courses')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <span>Danh mục khóa học →</span>
          </button>
          <button
            type="button"
            onClick={() => setShowGuide(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Info className="size-3.5 text-slate-500" />
            <span>Quy tắc & Hướng dẫn</span>
          </button>
        </div>
      </div>

      {roadmap && (
        <TrialScopePanel roadmap={roadmap} matrix={matrix} kind={trialKind} onKind={setTrialKind} onSelect={selectTrialPlan} canEdit={canEdit} />
      )}

      {/* ── Ma trận trung tâm (Clean & Rõ ràng) ── */}
      <div className="cc-grid">
        <div className="cc-card shadow-sm border border-slate-200">
          {/* ── Bộ chọn phạm vi tối giản, hiện đại (Segmented Scope Control) ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div className="relative inline-flex items-center rounded-xl bg-slate-100/90 p-1 border border-slate-200/60 shadow-inner">
              {/* Nút 1: Toàn doanh nghiệp */}
              <button
                type="button"
                onClick={() => {
                  setScope(ALL);
                  setIsDeptMenuOpen(false);
                }}
                className={`relative flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 select-none ${
                  activeScope === ALL
                    ? 'bg-white text-emerald-800 shadow-sm border border-slate-200/50 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40'
                }`}
              >
                <Building2 className="size-3.5 text-emerald-700" />
                <span>Toàn doanh nghiệp</span>
                {drafts[ALL] && <span className="size-1.5 rounded-full bg-amber-500" title="Chưa lưu" />}
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
                  className={`relative flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 select-none ${
                    activeScope !== ALL
                      ? 'bg-white text-emerald-800 shadow-sm border border-slate-200/50 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40'
                  }`}
                >
                  <Users className="size-3.5 text-emerald-700" />
                  <span className="max-w-[170px] sm:max-w-[210px] truncate">
                    {activeScope !== ALL && department ? department.name : 'Chọn phòng ban'}
                  </span>
                  {activeScope !== ALL && department?.isCustomized && (
                    <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[9.5px] font-bold text-emerald-800">
                      Phạm vi riêng
                    </span>
                  )}
                  {activeScope !== ALL && drafts[activeScope] && (
                    <span className="size-1.5 rounded-full bg-amber-500" title="Chưa lưu" />
                  )}
                  <ChevronDown className={`size-3 text-slate-400 transition-transform duration-200 ${isDeptMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Popover danh sách phòng ban */}
                {isDeptMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setIsDeptMenuOpen(false)} />
                    <div className="absolute left-0 sm:left-auto sm:right-0 top-full z-30 mt-2 w-80 rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-xl">
                      <div className="flex items-center justify-between px-2 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                        <span>Phòng ban ({matrix.departments.length})</span>
                        <span>Mức tối đa</span>
                      </div>

                      {matrix.departments.length > 4 && (
                        <div className="pt-2 pb-1">
                          <label className="owner-filter-search">
                          <Search className="size-4" aria-hidden="true" />
                          <input
                            type="text"
                            aria-label="Tìm phòng ban trong danh sách"
                            placeholder="Tìm kiếm phòng ban..."
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
                                {hasDraft && <span className="size-1.5 rounded-full bg-amber-500 shrink-0" title="Chưa lưu" />}
                              </div>

                              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                d.isCustomized
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-500'
                              }`}>
                                {d.isCustomized ? 'Phạm vi riêng' : 'Theo doanh nghiệp'}
                              </span>
                            </button>
                          );
                        })}
                        {filteredDepartments.length === 0 && (
                          <p className="py-4 text-center text-xs text-slate-400">Không tìm thấy phòng ban</p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Dòng trạng thái ngữ cảnh tinh tế */}
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span className={`size-2 rounded-full shrink-0 ${activeScope === ALL ? 'bg-emerald-500' : department?.isCustomized ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              <span className="font-medium text-slate-600">
                {activeScope === ALL
                  ? 'Đang xem phạm vi chung của doanh nghiệp'
                  : department?.isCustomized
                    ? `${department.name} đang dùng phạm vi riêng`
                    : `${department?.name ?? 'Phòng ban'} đang theo phạm vi doanh nghiệp`}
              </span>
            </div>
          </div>

          {/* Ma trận màu xanh */}
          <div className="cc-mx" role="group" aria-label="Ma trận năng lực nhân cấp độ">
            <div />
            {matrix.levels.map((level) => (
              <div key={level.level} className="hd">
                Cấp {level.level}
                <br />
                <span>{level.name}</span>
              </div>
            ))}
            {matrix.domains.map((domain) => {
              const routeLevel = current[domain.categoryId] ?? 0;
              const dnLevel = orgCeiling[domain.categoryId] ?? 0;
              return (
                <DomainRow
                  key={domain.categoryId}
                  domain={domain}
                  routeLevel={routeLevel}
                  dnLevel={dnLevel}
                  isDepartment={activeScope !== ALL}
                  editable={canEdit && !blockedDepartments}
                  selectedToBuy={selectedToBuy}
                  seats={trialScope?.seats}
                  reason={trialScope?.reasons.get(domain.categoryId)}
                  onPick={pick}
                  onToggleBuy={toggleSelectToBuy}
                />
              );
            })}
          </div>

          {/* Chú giải ngắn gọn */}
          <div className="cc-legend">
            <span><i className="route" />Được mở trong phạm vi</span>
            <span><i className="dn" />Trong phạm vi doanh nghiệp</span>
            <span><i />Chỉ có trong Digital AI</span>
            <span><i style={{ background: '#fffbeb', border: '1.5px solid #f59e0b' }} />Đang chọn mua</span>
          </div>

          {/* Số liệu thống kê */}
          <div className="cc-stats" aria-label="Tổng quan phạm vi đào tạo">
            <div className="cc-stat cc-stat--active"><span className="cc-stat-label">Trong phạm vi</span><b>{routeCount}</b><span>{routeLabel}</span></div>
            <div className="cc-stat cc-stat--organization"><span className="cc-stat-label">Cấp doanh nghiệp</span><b>{orgCount}</b><span>Khóa trong phạm vi doanh nghiệp</span></div>
            <div className="cc-stat cc-stat--catalog"><span className="cc-stat-label">Danh mục</span><b>{matrix.platformCourseCount}</b><span>Tổng khóa học hiện có</span></div>
          </div>

          {/* Nút hành động */}
          {canEdit && (
            <div className="cc-actions">
              <div className="hint"><Info size={17} aria-hidden="true" /><span>
                {blockedDepartments
                  ? 'Cần lưu phạm vi doanh nghiệp trước.'
                  : activeScope === ALL
                    ? 'Bấm ô để chỉnh mức tối đa; bấm ô 🔒 để chọn mua.'
                    : department?.isCustomized
                      ? 'Đang dùng giới hạn riêng.'
                      : 'Đang theo phạm vi doanh nghiệp.'}
              </span></div>
              <div className="btns">
                {hasApplicableSuggestion && (
                  <button type="button" className="cc-btn" onClick={applySuggestion} disabled={saving}>
                    Áp dụng mức đề xuất
                  </button>
                )}
                {activeScope !== ALL && department?.isCustomized && (
                  <button type="button" className="cc-btn" onClick={inherit} disabled={saving}>
                    Theo doanh nghiệp
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
              <span>{activeScope === ALL ? 'Toàn doanh nghiệp' : department?.name ?? 'Phòng ban'} · Lưu để áp dụng mức tối đa đang hiển thị.</span>
            </div>
            <div className="cc-save-buttons">
              {dirty && <button type="button" className="cc-btn" onClick={() => setDraft(null)} disabled={saving}>Hủy thay đổi</button>}
              <button type="button" className="cc-btn primary" onClick={save} disabled={saving || blockedDepartments}>
                {saving ? 'Đang lưu…' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}

      {/* ── Thanh thao tác mua nhiều khóa học đã chọn nổi bật (Floating Bar) ── */}
      {selectedToBuy.size > 0 && (
        <div className="sticky bottom-4 z-40 mt-4 rounded-2xl border-2 border-amber-400 bg-white/95 p-4 shadow-xl backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-3 min-w-0">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white font-bold text-base shadow-sm">
              {selectedToBuy.size}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-900 text-sm">
                  Đã chọn {selectedToBuy.size} khóa học để mua bản quyền
                </h4>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-300">
                  Mở phạm vi đào tạo
                </span>
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
                    <span className="text-slate-600 max-w-[140px] truncate">{item.domainName}</span>
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
                      title="Bỏ chọn khóa này"
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
            >
              Hủy chọn tất cả
            </button>
            <button
              type="button"
              onClick={() => {
                const codes = Array.from(selectedToBuy.keys()).join(',');
                navigate(`/enterprise/courses?selected=${encodeURIComponent(codes)}`);
              }}
              className="rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-colors"
            >
              Xem trên danh mục
            </button>
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
        </div>
      )}

      {/* ── Modal Popup nổi: Quy tắc & Hướng dẫn ── */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Info className="size-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Quy tắc phạm vi đào tạo</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/70">
                <span className="font-bold text-slate-800 block mb-1">📐 Nguyên tắc cấp bậc:</span>
                <code>Phòng ban ≤ Doanh nghiệp ≤ Danh mục DigiTalent (3 cấp)</code>
                <p className="mt-1 text-slate-500">
                  Mức tối đa của phòng ban không vượt doanh nghiệp. Hạ mức của doanh nghiệp thì phòng ban hạ theo.
                </p>
              </div>

              <div className="rounded-xl bg-amber-50/70 p-3 border border-amber-200/60">
                <span className="font-bold text-amber-900 block mb-1">🔒 Bản quyền khóa học thương mại:</span>
                <p className="text-amber-800">
                  - <b>Cấp 1 (Cơ bản - F):</b> Mở miễn phí 100% trong gói dùng thử cho toàn bộ doanh nghiệp.<br />
                  - <b>Cấp 2 (Trung cấp - I) & Cấp 3 (Nâng cao - A):</b> Hiển thị biểu tượng 🔒 nếu chưa mua suất học. Khi doanh nghiệp mua suất học, phạm vi đào tạo tự mở tương ứng.
                </p>
              </div>

              <div className="rounded-xl bg-teal-50/70 p-3 border border-teal-200/60">
                <span className="font-bold text-teal-900 block mb-1">👆 Cách thao tác:</span>
                <p className="text-teal-800">
                  Bấm ô khóa học để đặt mức tối đa tới cấp đó (bấm lại để hạ 1 cấp). Bấm <b>Lưu phạm vi</b> để áp dụng.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm"
                style={{ background: 'var(--po-accent)' }}
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function DomainRow({
  domain,
  routeLevel,
  dnLevel,
  isDepartment,
  editable,
  selectedToBuy,
  seats,
  reason,
  onPick,
  onToggleBuy }: {
  domain: CeilingDomain;
  routeLevel: number;
  dnLevel: number;
  isDepartment: boolean;
  editable: boolean;
  selectedToBuy?: Map<string, BuyItem>;
  /** Số suất theo kết quả test (mã khóa → số người cần học). */
  seats?: SeatHints;
  /** ✦ Lý do mức tối đa đề xuất (kết quả test). */
  reason?: string;
  onPick: (domain: CeilingDomain, level: number) => void;
  onToggleBuy?: (course: CeilingCourse, domain: CeilingDomain) => void;
}) {
  return (
    <>
      <div className="rl">
        {domain.name}
        <small>{isDepartment ? `PB ${routeLevel} · DN ${dnLevel}` : `tối đa DN ${dnLevel}`}</small>
        {reason && <span className="cc-reason" title={`Theo kết quả test: ${reason}`}>✦ {reason}</span>}
      </div>
      {domain.courses.map((course) => {
        const inRoute = course.level <= routeLevel;
        const inOrg = course.level <= dnLevel;
        const isLocked = course.isUnlocked === false;
        const code = courseCode(course.code, domain.sortOrder, course.level);
        const isSelectedToBuy = Boolean(course.code && selectedToBuy?.has(course.code));
        const seatCount = course.level > 1 ? seats?.get(code) : undefined;
        const state = isSelectedToBuy
          ? 'đã chọn mua bản quyền (bấm để hủy chọn)'
          : inRoute
          ? 'trong lộ trình đang xem'
          : inOrg
          ? 'trong phạm vi doanh nghiệp'
          : isLocked
          ? 'chưa mở bản quyền (bấm để chọn mua)'
          : 'chỉ có trong Digital AI';
        const className = `cc-cell${isSelectedToBuy ? ' selected-to-buy' : inRoute ? ' route' : inOrg ? ' dn' : ''}${course.code ? '' : ' empty'}${isLocked && !isSelectedToBuy ? ' opacity-75' : ''}`;
        const label = course.code ? (
          isSelectedToBuy ? (
            <span className="flex items-center justify-center gap-1 font-bold">
              <Check className="size-3.5 text-amber-700 stroke-[3]" />
              <span>{course.code}</span>
            </span>
          ) : isLocked ? (
            <span className="flex flex-col items-center leading-tight">
              <span>🔒 {course.code}</span>
              {seatCount ? <small>{seatCount} suất</small> : null}
            </span>
          ) : (
            course.code
          )
        ) : (
          'Chưa có khóa'
        );
        const title = `${course.code ? `${course.code} · ${course.title}` : 'Chưa có khóa'}: ${state}`;
        const handleClick = () => {
          if (isLocked && onToggleBuy) {
            onToggleBuy(course, domain);
          } else {
            onPick(domain, course.level);
          }
        };

        return editable ? (
          <button
            key={course.level}
            type="button"
            className={className}
            title={title}
            aria-label={`${domain.name}, cấp ${course.level}: ${state}.`}
            onClick={handleClick}
          >
            {label}
          </button>
        ) : (
          <div key={course.level} className={className} title={title}>
            {label}
          </div>
        );
      })}
    </>
  );
}
