import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { X, Info, Building2, Users, ChevronDown, Check, Search } from 'lucide-react';
import {
  useCapabilityCeilings,
  useUpdateDepartmentCeilings,
  useUpdateOrganizationCeilings,
} from '@/hooks/use-capability-ceilings';
import { PERMISSIONS, usePermission } from '@/hooks/use-permission';
import { organizationErrorMessage } from '@/lib/organization-errors';
import type { CapabilityCeilings, CeilingDomain } from '@/services/capability-ceiling.service';
import './capability-ceiling.css';

/** Phạm vi đang xem: cả doanh nghiệp hoặc id của một phòng ban. */
const ALL = 'all';

type Levels = Record<string, number>;

const sumLevels = (levels: Levels) => Object.values(levels).reduce((sum, level) => sum + level, 0);
const sameLevels = (a: Levels, b: Levels) => Object.keys(a).every((key) => a[key] === b[key]);

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

  if (isLoading) {
    return (
      <section className="cc-root">
        <p className="cc-note">Đang tải ma trận trần nhà…</p>
      </section>
    );
  }

  if (isError || !matrix) {
    return (
      <section className="cc-root">
        <p className="cc-note">Chưa tải được ma trận trần nhà. Vui lòng thử lại sau.</p>
      </section>
    );
  }

  const orgSaved = organizationLevels(matrix);
  const current = drafts[activeScope] ?? saved;
  const dirty = Boolean(drafts[activeScope]) && !sameLevels(current, saved);
  const saving = saveOrganization.isPending || saveDepartment.isPending;
  const orgCeiling = activeScope === ALL ? current : orgSaved;
  const routeCount = sumLevels(current);
  const orgCount = sumLevels(orgCeiling);

  const setDraft = (levels: Levels | null) =>
    setDrafts((all) => {
      const next = { ...all };
      if (levels && !sameLevels(levels, saved)) next[activeScope] = levels;
      else delete next[activeScope];
      return next;
    });

  const pick = (domain: CeilingDomain, level: number) => {
    if (!canEdit || saving) return;
    const now = current[domain.categoryId] ?? 0;
    const target = level === now ? level - 1 : level;
    if (activeScope !== ALL && target > (orgSaved[domain.categoryId] ?? 0)) {
      toast.error('Trần phòng ban không được cao hơn trần doanh nghiệp ở bất kỳ năng lực nào.');
      return;
    }
    // Kiểm tra bản quyền: doanh nghiệp chưa mua bản quyền khóa học cấp cao hơn thì không được nâng trần
    const courseAtLevel = domain.courses.find((c) => c.level === target);
    const maxAllowed = domain.maxAllowedCeiling ?? 1;
    if (activeScope === ALL && target > maxAllowed && courseAtLevel?.isUnlocked === false) {
      toast.warning(
        `Khóa học ${courseAtLevel.code ?? `cấp ${target}`} chưa được mở bản quyền. Vui lòng mua suất học để nâng trần doanh nghiệp lên bậc ${target}.`,
        {
          action: {
            label: 'Trang bị suất học',
            onClick: () => {
              navigate('/enterprise/courses');
            },
          },
        }
      );
      return;
    }
    setDraft({ ...current, [domain.categoryId]: target });
  };

  const applySuggestion = () => {
    const suggestion: Levels =
      activeScope === ALL
        ? Object.fromEntries(matrix.domains.map((d) => [d.categoryId, Math.max(1, d.suggestedCeiling)]))
        : Object.fromEntries((department?.ceilings ?? []).map((c) => [c.categoryId, c.suggested]));
    setDraft(suggestion);
  };

  const save = async () => {
    const ceilings = Object.entries(current).map(([categoryId, level]) => ({ categoryId, level }));
    try {
      if (activeScope === ALL) {
        const result = await saveOrganization.mutateAsync(ceilings);
        const adjustedCount = (result as { adjustedDepartmentCount?: number } | null | undefined)?.adjustedDepartmentCount ?? 0;
        if (adjustedCount > 0) {
          toast.info(`Đã lưu trần doanh nghiệp. Hạ trần của ${adjustedCount} phòng ban vượt trần mới.`);
        } else {
          toast.success('Đã lưu trần năng lực của doanh nghiệp.');
        }
      } else {
        await saveDepartment.mutateAsync({ departmentId: activeScope, data: { inherit: false, ceilings } });
        toast.success(`Đã lưu trần năng lực cho ${department?.name ?? 'phòng ban'}.`);
      }
      setDraft(null);
    } catch (error) {
      toast.error(organizationErrorMessage(error, 'Chưa lưu được trần năng lực.'));
    }
  };

  const inherit = async () => {
    if (activeScope === ALL) return;
    try {
      await saveDepartment.mutateAsync({ departmentId: activeScope, data: { inherit: true, ceilings: [] } });
      setDraft(null);
      toast.success(`${department?.name ?? 'Phòng ban'} dùng lại trần doanh nghiệp.`);
    } catch (error) {
      toast.error(organizationErrorMessage(error, 'Chưa lưu được trần năng lực.'));
    }
  };

  const routeLabel = activeScope === ALL ? 'Khóa mở (Doanh nghiệp)' : `Khóa mở (${department?.name})`;
  const blockedDepartments = activeScope !== ALL && !matrix.isConfigured;

  return (
    <section className="cc-root" aria-labelledby="cc-title">
      {/* ── Tiêu đề súc tích & Nút Hướng dẫn nổi ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <h2 id="cc-title" className="text-xl font-bold tracking-tight text-slate-900">
            Trần năng lực số
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

        <button
          type="button"
          onClick={() => setShowGuide(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all"
        >
          <Info className="size-3.5 text-slate-500" />
          Quy tắc & Hướng dẫn
        </button>
      </div>

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
                      Trần riêng
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
                        <span>Trần áp dụng</span>
                      </div>

                      {matrix.departments.length > 4 && (
                        <div className="relative pt-2 pb-1">
                          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Tìm kiếm phòng ban..."
                            value={deptSearch}
                            onChange={(e) => setDeptSearch(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none"
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                          />
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
                                {d.isCustomized ? 'Trần riêng' : 'Kế thừa DN'}
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
                  ? 'Đang xem & thiết lập trần chung cho toàn doanh nghiệp'
                  : department?.isCustomized
                    ? `${department.name} đang áp dụng trần năng lực riêng`
                    : `${department?.name ?? 'Phòng ban'} đang kế thừa trần từ doanh nghiệp`}
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
                  onPick={pick}
                />
              );
            })}
          </div>

          {/* Chú giải ngắn gọn */}
          <div className="cc-legend">
            <span><i className="route" />Được mở trong phạm vi</span>
            <span><i className="dn" />Trong trần doanh nghiệp</span>
            <span><i />Chỉ trong trần Digital AI</span>
          </div>

          {/* Số liệu thống kê */}
          <div className="cc-stats">
            <div><b>{routeCount}</b><span>{routeLabel}</span></div>
            <div><b>{orgCount}</b><span>Khóa trần doanh nghiệp</span></div>
            <div><b>{matrix.platformCourseCount}</b><span>Tổng danh mục chuẩn (18)</span></div>
          </div>

          {/* Nút hành động */}
          {canEdit && (
            <div className="cc-actions">
              <span className="hint">
                {blockedDepartments
                  ? 'Cần lưu trần doanh nghiệp trước.'
                  : activeScope === ALL
                    ? 'Bấm trực tiếp vào ô để điều chỉnh trần.'
                    : department?.isCustomized
                      ? 'Đang dùng giới hạn riêng.'
                      : 'Đang kế thừa trần doanh nghiệp.'}
              </span>
              <div className="btns">
                {activeScope === ALL && (
                  <button type="button" className="cc-btn" onClick={applySuggestion} disabled={saving}>
                    Gợi ý theo vị trí
                  </button>
                )}
                {activeScope !== ALL && department?.isCustomized && (
                  <button type="button" className="cc-btn" onClick={inherit} disabled={saving}>
                    Kế thừa trần doanh nghiệp
                  </button>
                )}
                <button type="button" className="cc-btn" onClick={() => setDraft(null)} disabled={!dirty || saving}>
                  Hủy
                </button>
                <button
                  type="button"
                  className="cc-btn primary"
                  onClick={save}
                  disabled={saving || blockedDepartments || (!dirty && (activeScope !== ALL || matrix.isConfigured))}
                >
                  {saving ? 'Đang lưu…' : activeScope === ALL ? 'Lưu trần doanh nghiệp' : 'Lưu trần phòng ban'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal Popup nổi: Quy tắc & Hướng dẫn ── */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Info className="size-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Quy tắc & Hướng dẫn trần năng lực</h3>
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
                <code>Trần phòng ban ≤ Trần doanh nghiệp ≤ Danh mục DigiTalent (3 cấp)</code>
                <p className="mt-1 text-slate-500">
                  Phòng ban chỉ được mở khóa tối đa bằng trần doanh nghiệp. Hạ trần doanh nghiệp sẽ tự động hạ trần các phòng ban liên quan.
                </p>
              </div>

              <div className="rounded-xl bg-amber-50/70 p-3 border border-amber-200/60">
                <span className="font-bold text-amber-900 block mb-1">🔒 Bản quyền khóa học thương mại:</span>
                <p className="text-amber-800">
                  - <b>Cấp 1 (Cơ bản - F):</b> Mở miễn phí 100% trong gói dùng thử cho toàn bộ doanh nghiệp.<br />
                  - <b>Cấp 2 (Trung cấp - I) & Cấp 3 (Nâng cao - A):</b> Hiển thị biểu tượng 🔒 nếu chưa mua suất học. Khi doanh nghiệp mua suất học, trần năng lực sẽ được tự động mở tương ứng.
                </p>
              </div>

              <div className="rounded-xl bg-blue-50/70 p-3 border border-blue-200/60">
                <span className="font-bold text-blue-900 block mb-1">👆 Cách thao tác:</span>
                <p className="text-blue-800">
                  Bấm trực tiếp vào từng ô mã khóa học để đặt trần đến cấp đó (bấm lại ô đang chọn để hạ 1 cấp). Bấm <b>Lưu trần</b> để áp dụng.
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
  onPick,
}: {
  domain: CeilingDomain;
  routeLevel: number;
  dnLevel: number;
  isDepartment: boolean;
  editable: boolean;
  onPick: (domain: CeilingDomain, level: number) => void;
}) {
  return (
    <>
      <div className="rl">
        {domain.name}
        <small>{isDepartment ? `PB ${routeLevel} · DN ${dnLevel}` : `trần DN ${dnLevel}`}</small>
      </div>
      {domain.courses.map((course) => {
        const inRoute = course.level <= routeLevel;
        const inOrg = course.level <= dnLevel;
        const isLocked = course.isUnlocked === false;
        const state = inRoute ? 'trong lộ trình đang xem' : inOrg ? 'trong trần doanh nghiệp' : isLocked ? 'chưa mở bản quyền (cần mua suất)' : 'chỉ trong trần Digital AI';
        const className = `cc-cell${inRoute ? ' route' : inOrg ? ' dn' : ''}${course.code ? '' : ' empty'}${isLocked ? ' opacity-75' : ''}`;
        const label = course.code ? (isLocked ? `🔒 ${course.code}` : course.code) : 'Chưa có khóa';
        const title = `${course.code ? `${course.code} · ${course.title}` : 'Chưa có khóa'}: ${state}`;
        return editable ? (
          <button
            key={course.level}
            type="button"
            className={className}
            title={title}
            aria-label={`${domain.name}, cấp ${course.level}: ${state}. Bấm để đặt trần đến cấp này.`}
            onClick={() => onPick(domain, course.level)}
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
