import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Compass,
  ExternalLink,
  Search,
  ShieldCheck,
  Sliders,
  Sparkles,
} from 'lucide-react';
import {
  useAllActiveCompetencies,
  useCompetencyCategories,
} from '@/hooks/use-competencies';
import type { CompetencyListItem } from '@/services/competency.service';
import { PULSE_TOKENS } from '../owner-theme';
import './owner-framework-polish.css';
import { SectionLoading } from '@/components/shared/LoadingState';

export function OwnerFrameworkPage() {
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');

  const { data: categories = [], isLoading: catLoading } = useCompetencyCategories();
  const { data: competencies = [], isLoading: compLoading } = useAllActiveCompetencies();

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [categories]);

  const filteredCompetencies = useMemo(() => {
    return competencies.filter((c: CompetencyListItem) => {
      if (selectedDomain !== 'all' && c.categoryId !== selectedDomain) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchName = c.name.toLowerCase().includes(q);
        const matchCode = (c.frameworkCode || c.code).toLowerCase().includes(q);
        return matchName || matchCode;
      }
      return true;
    });
  }, [competencies, selectedDomain, search]);

  return (
    <div
      className="po-owner framework-catalog-page -m-4 md:-m-6 min-h-screen"
      style={{
        ...PULSE_TOKENS,
        background: 'var(--po-canvas)',
      }}
    >
      {/* ── Page Header ── */}
      <section className="px-4 md:px-6 pt-6 pb-3 mx-auto" style={{ maxWidth: 1240 }}>
        {/* Back Link */}
        <Link
          to="/enterprise/setup"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2 block w-fit"
        >
          <ArrowLeft className="size-3.5" />
          <span>Quay lại Khung năng lực số của doanh nghiệp</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.14em] mb-1.5 text-teal-700">
              <Compass className="size-3.5 inline text-teal-600" />
              Thông tư 02/2025/TT-BTTTT · Bộ Thông tin & Truyền thông
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-[-0.03em] heading-gradient">
              Từ điển Chuẩn Năng lực Số Quốc gia
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/enterprise/setup?tab=positions"
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:brightness-105"
              style={{ background: 'var(--po-accent)' }}
            >
              <Sliders className="size-3.5" />
              <span>Cài đặt cho chức danh công ty</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* ── Overview Pills Strip ── */}
        <div className="framework-catalog-stats mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-slate-400">Lĩnh vực chuẩn</span>
            <div className="text-lg font-extrabold text-slate-800 mt-0.5">6 Lĩnh vực</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-slate-400">Tổng năng lực</span>
            <div className="text-lg font-extrabold text-emerald-700 mt-0.5">24 Năng lực số</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-slate-400">Khung thang đo</span>
            <div className="text-lg font-extrabold text-slate-800 mt-0.5">3 Cấp độ (1 - 3)</div>
          </div>
          <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-3 text-center shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-teal-800">Quy chuẩn áp dụng</span>
            <div className="text-lg font-extrabold text-teal-800 mt-0.5 flex items-center justify-center gap-1">
              <Sparkles className="size-4 text-teal-600" />
              <span>Toàn quốc 2025</span>
            </div>
          </div>
        </div>

        {/* ── Search & Domain Quick Filter ── */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <label className="owner-filter-search flex-1 max-w-sm">
            <Search className="size-4" aria-hidden="true" />
            <input
              type="search"
              aria-label="Tìm năng lực"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên hoặc mã (ví dụ: 1.1, dữ liệu, an toàn)..."
              className="w-full text-sm"
            />
          </label>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setSelectedDomain('all')}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedDomain === 'all'
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả (24)
            </button>
            {sortedCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedDomain(cat.id)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  selectedDomain === cat.id
                    ? 'bg-emerald-700 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                0{cat.sortOrder}. {cat.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Competencies Grid ── */}
      <div className="px-4 md:px-6 py-4 mx-auto pb-16" style={{ maxWidth: 1240 }}>
        {catLoading || compLoading ? (
          <SectionLoading label="Đang tải danh mục năng lực" />
        ) : filteredCompetencies.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center shadow-2xs">
            <p className="text-xs font-semibold text-slate-700">Không tìm thấy năng lực nào khớp với từ khóa</p>
          </div>
        ) : (
          <div className="framework-catalog-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedCategories
              .filter((cat) => selectedDomain === 'all' || selectedDomain === cat.id)
              .map((cat) => {
                const catComps = filteredCompetencies.filter((c: CompetencyListItem) => c.categoryId === cat.id);
                if (catComps.length === 0) return null;

                return (
                  <div
                    key={cat.id}
                    className="framework-domain-card rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs flex flex-col justify-between transition-all hover:shadow-xs"
                  >
                    <div>
                      {/* Domain Header */}
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Lĩnh vực 0{cat.sortOrder}
                        </span>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          {catComps.length} năng lực
                        </span>
                      </div>

                      <h2 className="mt-2 text-sm font-bold tracking-[-0.015em] text-slate-800 leading-snug">
                        {cat.name}
                      </h2>

                      {/* List of competencies */}
                      <div className="mt-3.5 space-y-2">
                        {catComps.map((comp: CompetencyListItem) => {
                          const isMandatory =
                            comp.frameworkCode === '4.1' || comp.frameworkCode === '4.2';
                          return (
                            <Link
                              key={comp.id}
                              to={`/enterprise/framework/${comp.id}`}
                              className="framework-competency-link group flex items-center justify-between gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 transition-all hover:bg-white hover:border-slate-300 hover:shadow-2xs"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className="shrink-0 font-mono text-[10px] font-black rounded px-1.5 py-0.5"
                                  style={{ background: 'var(--po-soft)', color: 'var(--po-accent)' }}
                                >
                                  {comp.frameworkCode || comp.code}
                                </span>
                                <span className="truncate text-xs font-semibold text-slate-700 group-hover:text-emerald-700">
                                  {comp.name}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                {isMandatory && (
                                  <span
                                    className="rounded bg-amber-50 px-1 py-0.5 text-[9px] font-semibold text-amber-700 border border-amber-200"
                                    title="Bắt buộc theo chuẩn Thông tư 02"
                                  >
                                    <ShieldCheck className="size-2.5 inline mr-0.5" />
                                    Bắt buộc
                                  </span>
                                )}
                                <ExternalLink className="size-3 text-slate-300 group-hover:text-emerald-600" />
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    {/* Footer action */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        {catComps.length} chuẩn cấp 1-3
                      </span>
                      <Link
                        to="/enterprise/setup?tab=positions"
                        className="text-[11px] font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
                      >
                        Gán vào chuẩn vị trí
                        <ArrowRight className="size-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}

export default OwnerFrameworkPage;
