import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  ChevronDown,
  Compass,
  History,
  Layers,
  Search,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { useOrganizationOverview } from '@/hooks/use-organization';
import { useCapabilityDashboard } from '@/hooks/use-analytics';
import { usePositionRequirementSummaries } from '@/hooks/use-competencies';
import { useDepartments } from '@/hooks/use-departments';
import { CapabilityCeilingMatrix } from '../components/CapabilityCeilingMatrix';
import { PositionReferenceMatrix } from '../components/PositionReferenceMatrix';
import { OwnerFilterSelect } from '../components/OwnerFilterSelect';
import { PULSE_TOKENS } from '../owner-theme';
import { PageLoading, SectionLoading } from '@/components/shared/LoadingState';
import './owner-setup-blueprint.css';
import type { PositionRequirementSummary } from '@/services/competency.service';

type TabKey = 'positions' | 'ceilings';

const STATUS_MAP: Record<
  PositionRequirementSummary['status'],
  { label: string; bg: string; text: string; border: string }
> = {
  ACTIVE: {
    label: 'Chuẩn riêng',
    bg: '#ecfdf5',
    text: '#15803d',
    border: '#bbf7d0',
  },
  DRAFT: {
    label: 'Bản nháp',
    bg: '#fffbeb',
    text: '#b45309',
    border: '#fde68a',
  },
  NOT_CONFIGURED: {
    label: 'Mẫu TT02',
    bg: '#f8fafc',
    text: '#475569',
    border: '#e2e8f0',
  },
};

export function OwnerSetupBlueprintPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const currentTab: TabKey = tabParam === 'ceilings' ? 'ceilings' : 'positions';

  const setTab = (tab: TabKey) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    });
  };

  const { isLoading: orgLoading } = useOrganizationOverview();
  const { isLoading: capLoading } = useCapabilityDashboard();

  // Tab 1: Vị trí công việc của doanh nghiệp
  const { data: summaries = [], isLoading: summariesLoading } = usePositionRequirementSummaries();
  const { data: departmentsData } = useDepartments({ pageSize: 100, status: 'ACTIVE' });
  const departments = departmentsData?.items ?? [];
  const [posSearch, setPosSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isReferenceOpen, setIsReferenceOpen] = useState(true);

  const isLoading = orgLoading || capLoading;

  // Lọc danh sách chức danh
  const filteredSummaries = useMemo(() => {
    return summaries.filter((item) => {
      if (posSearch.trim()) {
        const q = posSearch.toLowerCase().trim();
        const matchName = item.jobPositionName.toLowerCase().includes(q);
        const matchCode = item.jobPositionCode.toLowerCase().includes(q);
        if (!matchName && !matchCode) return false;
      }
      if (selectedDept && item.departmentId !== selectedDept) return false;
      if (selectedStatus && item.status !== selectedStatus) return false;
      return true;
    });
  }, [summaries, posSearch, selectedDept, selectedStatus]);

  const activePosCount = summaries.filter((s) => s.status === 'ACTIVE').length;
  const unconfiguredPosCount = summaries.filter((s) => s.status === 'NOT_CONFIGURED').length;

  const TABS = [
    {
      key: 'positions' as const,
      label: '1. Chuẩn Năng lực theo Vị trí',
      badge: `${summaries.length} vị trí`,
      icon: Briefcase,
    },
    {
      key: 'ceilings' as const,
      label: '2. Trần Năng lực & Đào tạo',
      badge: 'Mở trần',
      icon: Layers,
    },
  ];

  if (isLoading) {
    return <div className="po-owner -m-4 md:-m-6 min-h-screen" style={PULSE_TOKENS}><PageLoading label="Đang tải khung năng lực" /></div>;
  }

  return (
    <div
      className="po-owner blueprint-page -m-4 md:-m-6 min-h-screen"
      style={{
        ...PULSE_TOKENS,
        background: 'radial-gradient(circle at 88% 2%, rgba(20,184,166,.10), transparent 32%), radial-gradient(circle at 7% 46%, rgba(56,189,248,.07), transparent 34%), #f7fafc',
      }}
    >
      {/* ── Page Header: Tiêu đề kiểu dáng tinh tế, không chữ to đen thô ráp, không giải thích rườm rà ── */}
      <section className="blueprint-container pt-6 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="blueprint-eyebrow"><Sparkles className="size-3.5" /> KIẾN TRÚC NĂNG LỰC DOANH NGHIỆP</div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-[-0.04em] heading-gradient">
              Khung năng lực số
            </h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to="/enterprise/framework"
              className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-white px-3.5 py-2 text-xs font-bold text-teal-800 shadow-2xs hover:bg-teal-50 transition-colors"
              title="Tra cứu từ điển 6 lĩnh vực & 24 năng lực số của Thông tư 02"
            >
              <Compass className="size-3.5 text-teal-600" />
              <span>Từ điển 24 Chuẩn TT02 ↗</span>
            </Link>

            <Link
              to="/enterprise/skill-gap"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
            >
              <span>Xem khoảng trống</span>
              <ArrowRight className="size-3 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* ── SEGMENTED TAB SWITCHER: 2 Tab trọng tâm của doanh nghiệp ── */}
        <div className="mt-6">
          <nav className="blueprint-tabs" aria-label="Các phần khung năng lực">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setTab(tab.key)}
                  className={`group flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#0f766e] text-white shadow-[0_8px_18px_rgba(15,118,110,.18)] font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  <Icon className={`size-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </section>

      {/* ── Main Tab Contents ── */}
      <div className="blueprint-container py-5 pb-16">
        {/* ========================================================================= */}
        {/* TAB 1: CÀI ĐẶT CHUẨN VỊ TRÍ (Position Requirements - CỐT LÕI HÀNH ĐỘNG)    */}
        {/* ========================================================================= */}
        {currentTab === 'positions' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Header thanh gọn, không có dòng giải thích nhỏ */}
            <div className="blueprint-panel flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5">
              <div>
                <h2 className="text-lg font-bold tracking-[-0.02em] section-gradient">
                  Chuẩn năng lực theo vị trí công việc
                </h2>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to="/enterprise/requirements/builder"
                  className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:brightness-105 transition-all"
                  style={{ background: 'var(--po-accent)' }}
                >
                  <Sliders className="size-3.5" />
                  <span>+ Tùy chỉnh chuẩn vị trí</span>
                </Link>
                <Link
                  to="/enterprise/positions"
                  className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Quản lý vị trí công việc
                </Link>
              </div>
            </div>

            {/* Chỉ số nhanh gọn */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-white to-sky-50 p-4 text-left shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wide text-sky-700">Tổng vị trí</span>
                <div className="text-3xl font-black text-slate-800 mt-1 tabular-nums">{summaries.length}</div>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50 p-4 text-left shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wide text-emerald-800">Đã cài chuẩn riêng</span>
                <div className="text-3xl font-black text-emerald-700 mt-1 tabular-nums">{activePosCount}</div>
              </div>
              <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-white to-indigo-50 p-4 text-left shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wide text-indigo-700">Dùng mẫu TT02</span>
                <div className="text-3xl font-black text-indigo-800 mt-1 tabular-nums">{unconfiguredPosCount}</div>
              </div>
            </div>

            {/* Bảng danh sách chức danh */}
            <div className="blueprint-panel overflow-hidden">
              {/* Toolbar bộ lọc */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 border-b border-slate-100 bg-slate-50/50">
                <label className="owner-filter-search flex-1 max-w-sm w-full">
                  <Search className="size-4" aria-hidden="true" />
                  <input
                    type="search"
                    aria-label="Tìm vị trí theo tên hoặc mã"
                    value={posSearch}
                    onChange={(e) => setPosSearch(e.target.value)}
                    placeholder="Tìm theo tên hoặc mã vị trí…"
                    className="w-full text-sm"
                  />
                </label>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <OwnerFilterSelect
                    label="Lọc theo phòng ban"
                    value={selectedDept}
                    onChange={setSelectedDept}
                    options={[{ value: '', label: 'Tất cả phòng ban' }, ...departments.map((d) => ({ value: d.id, label: d.name }))]}
                  />

                  <OwnerFilterSelect
                    label="Lọc theo trạng thái"
                    value={selectedStatus}
                    onChange={setSelectedStatus}
                    options={[{ value: '', label: 'Tất cả trạng thái' }, { value: 'ACTIVE', label: 'Đã có chuẩn riêng' }, { value: 'DRAFT', label: 'Đang có bản nháp' }, { value: 'NOT_CONFIGURED', label: 'Dùng mẫu tham chiếu TT02' }]}
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[880px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100/70 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-4 py-3">Chức danh / Vị trí</th>
                      <th className="px-4 py-3">Phòng ban</th>
                      <th className="px-4 py-3">Nhân sự</th>
                      <th className="px-4 py-3">Chuẩn năng lực áp dụng</th>
                      <th className="px-4 py-3">Trạng thái</th>
                      <th className="px-4 py-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {summariesLoading ? (
                      <tr>
                        <td colSpan={6} className="p-4">
                          <SectionLoading label="Đang tải danh sách vị trí" count={2} />
                        </td>
                      </tr>
                    ) : filteredSummaries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          Không tìm thấy vị trí nào phù hợp
                        </td>
                      </tr>
                    ) : (
                      filteredSummaries.map((pos) => {
                        const statusBadge = STATUS_MAP[pos.status];
                        return (
                          <tr key={pos.jobPositionId} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-semibold text-slate-800 text-xs sm:text-sm">
                                {pos.jobPositionName}
                              </div>
                              <span className="font-mono text-[10px] text-slate-400">
                                {pos.jobPositionCode}
                              </span>
                            </td>

                            <td className="px-4 py-3 text-slate-600 font-medium">
                              {pos.departmentName ?? '—'}
                            </td>

                            <td className="px-4 py-3 text-slate-600">
                              <span className="font-semibold text-slate-800">{pos.employeeCount}</span> người
                            </td>

                            <td className="px-4 py-3">
                              {pos.activeSet ? (
                                <div>
                                  <span className="font-semibold text-emerald-800">
                                    Phiên bản v{pos.activeSet.versionNo}
                                  </span>
                                  <span className="text-[10px] text-slate-500 block">
                                    {pos.activeSet.competencyCount} năng lực yêu cầu
                                  </span>
                                </div>
                              ) : pos.draftSet ? (
                                <div>
                                  <span className="font-semibold text-amber-700">
                                    Bản nháp v{pos.draftSet.versionNo}
                                  </span>
                                  <span className="text-[10px] text-slate-500 block">
                                    {pos.draftSet.competencyCount} năng lực đã chọn
                                  </span>
                                </div>
                              ) : (
                                <div>
                                  <span className="font-medium text-slate-600">Mẫu tham chiếu TT02</span>
                                </div>
                              )}
                            </td>

                            <td className="px-4 py-3">
                              <span
                                className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold border"
                                style={{
                                  background: statusBadge.bg,
                                  color: statusBadge.text,
                                  borderColor: statusBadge.border,
                                }}
                              >
                                {statusBadge.label}
                              </span>
                            </td>

                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Link
                                  to={`/enterprise/requirements/builder?positionId=${pos.jobPositionId}`}
                                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
                                >
                                  <span>{pos.activeSet ? 'Điều chỉnh' : 'Thiết lập'}</span>
                                </Link>

                                {pos.activeSet && (
                                  <Link
                                    to={`/enterprise/requirements/history?positionId=${pos.jobPositionId}`}
                                    className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-1 text-slate-400 hover:text-slate-800 shadow-2xs"
                                    title="Lịch sử phiên bản"
                                  >
                                    <History className="size-3.5" />
                                  </Link>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: TRẦN NĂNG LỰC & ĐÀO TẠO (Không có header lặp lại, mở sẵn chi tiết)  */}
        {/* ========================================================================= */}
        {currentTab === 'ceilings' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Bảng trần năng lực cốt lõi (Tự có tiêu đề thanh thoát) */}
            <div id="ceilings-matrix">
              <CapabilityCeilingMatrix />
            </div>

            {/* Tham chiếu mở rộng 5 vị trí mẫu (Mở mặc định theo yêu cầu, không có giải thích rườm rà) */}
            <div className="blueprint-panel overflow-hidden">
              <h3>
                <button
                  type="button"
                  onClick={() => setIsReferenceOpen((v) => !v)}
                  aria-expanded={isReferenceOpen}
                  aria-controls="position-reference-matrix"
                  className="flex w-full items-center justify-between gap-3 px-5 py-5 text-left sm:px-6 hover:bg-teal-50/50 cursor-pointer"
                >
                  <span className="text-lg font-bold tracking-[-0.02em] section-gradient">
                    Mức tham chiếu theo vị trí
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
                    {isReferenceOpen ? 'Thu gọn' : 'Xem chi tiết'}
                    <ChevronDown className={`size-4 transition-transform ${isReferenceOpen ? 'rotate-180' : ''}`} />
                  </span>
                </button>
              </h3>
              <div id="position-reference-matrix" hidden={!isReferenceOpen} className="mx-5 mb-5 border-t border-slate-100 pt-4 sm:mx-6">
                {isReferenceOpen && (
                  <PositionReferenceMatrix />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OwnerSetupBlueprintPage;
