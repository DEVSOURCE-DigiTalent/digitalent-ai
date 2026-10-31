import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Building2, ChevronRight, ShieldCheck, Sparkles, Target } from 'lucide-react';
import { levelWithTier } from '@/lib/competency-levels';
import {
  REFERENCE_POSITIONS,
  getReferencePosition,
  referenceDomainLevel,
  requirementsByDomain,
  summarizeRequirements,
  type ReferencePosition,
} from '@/lib/reference-positions';
import { PulsePublicShell } from '../pulse-landing/PulsePublicShell';
import { cn } from '@/lib/utils';

const ORIGIN_NOTE =
  'Các vị trí việc làm tham chiếu được DigiTalent AI chuẩn hóa dựa trên Khung chuẩn năng lực số Thông tư 02/2025/TT-BGDĐT của Bộ Giáo dục & Đào tạo.';

const DOMAIN_NAMES_SHORT: Record<number, string> = {
  1: 'Dữ liệu & Thông tin',
  2: 'Giao tiếp & Hợp tác',
  3: 'Sáng tạo nội dung',
  4: 'An toàn & Bảo mật',
  5: 'Giải quyết vấn đề',
  6: 'Ứng dụng AI',
};

const LEVEL_LABELS: Record<number, { text: string; bg: string; textCol: string; border: string }> = {
  1: { text: 'Cơ bản (L1–L2)', bg: 'bg-sky-50', textCol: 'text-sky-800', border: 'border-sky-200' },
  2: { text: 'Trung cấp (L3–L4)', bg: 'bg-amber-50', textCol: 'text-amber-800', border: 'border-amber-200' },
  3: { text: 'Nâng cao (L5–L6)', bg: 'bg-purple-50', textCol: 'text-purple-800', border: 'border-purple-200' },
};

/**
 * Thư viện Kiến trúc Vị trí Việc làm Tham chiếu v3.0
 * Ngôn ngữ thiết kế: Light Pearl Glassmorphism, chuẩn Thông tư 02/2025/TT-BGDĐT.
 */
export function CareerCatalogPage() {
  const { slug } = useParams<{ slug: string }>();
  const position = slug ? getReferencePosition(slug.toUpperCase()) : undefined;

  return (
    <PulsePublicShell>
      <div className="py-12 sm:py-16 px-4 max-w-7xl mx-auto" data-testid="career-catalog-page">
        {!slug && <PositionList />}
        {slug && position && <PositionDetail position={position} />}
        {slug && !position && <PositionNotFound />}
      </div>
    </PulsePublicShell>
  );
}

function PositionList() {
  const [filterDept, setFilterDept] = useState<string>('ALL');

  const filteredPositions = filterDept === 'ALL'
    ? REFERENCE_POSITIONS
    : REFERENCE_POSITIONS.filter((p) => {
        if (filterDept === 'FINANCE') return p.code === 'ACCOUNTANT';
        if (filterDept === 'HR') return p.code === 'HR';
        if (filterDept === 'COMMERCIAL') return p.code === 'MARKETING' || p.code === 'SALES_CRM';
        if (filterDept === 'EXECUTIVE') return p.code === 'CEO';
        return true;
      });

  return (
    <>
      {/* Compliance Pill */}
      <div className="flex justify-center mb-6">
        <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200/80 px-4 py-1.5 text-xs font-semibold text-amber-800 shadow-sm">
          <ShieldCheck className="size-4 text-amber-600" />
          Khung Chuẩn Năng Lực Số TT 02/2025/TT-BGDĐT (6 Lĩnh vực · 21 Năng lực)
        </span>
      </div>

      {/* Header */}
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">
          THƯ VIỆN CHỨC DANH VIỆC LÀM THAM CHIẾU
        </p>
        <h1 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Đích đến chuẩn hóa cho <span className="font-serif italic font-normal text-slate-700">từng vị trí nghề nghiệp.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
          Doanh nghiệp bắt đầu từ các mẫu chức danh chuẩn của DigiTalent, tùy chỉnh trần năng lực theo mục tiêu tổ chức và phân bổ lộ trình cho nhân sự.
        </p>

        {/* Filter Tabs */}
        <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/90 p-1.5 shadow-sm">
          {[
            { id: 'ALL', label: 'Tất cả vị trí' },
            { id: 'FINANCE', label: 'Tài chính · Kế toán' },
            { id: 'HR', label: 'Nhân sự' },
            { id: 'COMMERCIAL', label: 'Kinh doanh & Marketing' },
            { id: 'EXECUTIVE', label: 'Điều hành · Quản lý' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterDept(tab.id)}
              className={cn(
                'rounded-xl px-4 py-2 text-xs font-bold transition-all',
                filterDept === tab.id
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Cards */}
      <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPositions.map((position) => (
          <PositionCard key={position.code} position={position} />
        ))}
      </ul>

      {/* Enterprise Anchor Box */}
      <div className="mt-16 rounded-3xl bg-slate-900 p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300">
            <Sparkles className="size-3.5" /> Dành cho Trưởng phòng & HR
          </div>
          <h3 className="text-xl sm:text-2xl font-bold">
            Doanh nghiệp của bạn có chức danh đặc thù riêng?
          </h3>
          <p className="text-sm text-slate-300 max-w-xl">
            Trong không gian DigiTalent Pulse, bạn có thể tự do tạo các chức danh việc làm mới, phối hợp linh hoạt 21 năng lực số TT 02/2025 theo đúng mô hình kinh doanh.
          </p>
        </div>
        <Link
          to="/business/try"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-amber-500/20 hover:from-amber-600 hover:to-amber-700 whitespace-nowrap transition-all"
        >
          Khám phá không gian thử nghiệm <ArrowRight className="size-4" />
        </Link>
      </div>
    </>
  );
}

function PositionCard({ position }: { position: ReferencePosition }) {
  const { selected } = summarizeRequirements(position);

  return (
    <li className="flex flex-col justify-between rounded-3xl bg-white/95 border border-slate-200/90 p-7 shadow-sm hover:shadow-xl hover:border-amber-500/50 transition-all duration-300 group">
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="rounded-full bg-amber-50 border border-amber-200/60 px-3 py-1 text-xs font-bold text-amber-800">
            Mã: {position.code}
          </span>
          <span className="text-xs font-semibold text-slate-500 tabular-nums">
            {Math.min(selected, 21)}/21 năng lực số cốt lõi
          </span>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-slate-900 group-hover:text-amber-700 transition-colors">
          <Link to={`/careers/${position.code.toLowerCase()}`}>
            {position.name}
          </Link>
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{position.description}</p>

        {/* 6 Domains Level Radar Pips */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">
            Mức năng lực yêu cầu 6 lĩnh vực:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[1, 2, 3, 4, 5, 6].map((domainNum) => {
              const reqLevel = referenceDomainLevel(position.code, domainNum);
              const lvlInfo = LEVEL_LABELS[reqLevel] || { text: 'Không yêu cầu', bg: 'bg-slate-50', textCol: 'text-slate-400', border: 'border-slate-200' };
              return (
                <div key={domainNum} className="flex items-center justify-between bg-slate-50/70 rounded-lg px-2.5 py-1.5 border border-slate-200/60">
                  <span className="font-medium text-slate-600 truncate pr-1 text-[11px]">
                    {domainNum}. {DOMAIN_NAMES_SHORT[domainNum]}
                  </span>
                  <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded border', lvlInfo.bg, lvlInfo.textCol, lvlInfo.border)}>
                    Mức {reqLevel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">Chuẩn hóa TT02</span>
        <Link
          to={`/careers/${position.code.toLowerCase()}`}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-600 hover:text-amber-700 group-hover:translate-x-1 transition-all"
        >
          Xem chi tiết chuẩn <ChevronRight className="size-4" />
        </Link>
      </div>
    </li>
  );
}

function PositionDetail({ position }: { position: ReferencePosition }) {
  const { selected } = summarizeRequirements(position);
  const groups = requirementsByDomain(position);

  return (
    <article className="max-w-5xl mx-auto">
      <Link
        to="/careers"
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors mb-6"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Quay lại tất cả vị trí
      </Link>

      <header className="rounded-3xl bg-white border border-slate-200/90 p-8 sm:p-10 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className="rounded-full bg-amber-50 border border-amber-200 text-amber-800 px-3.5 py-1 text-xs font-bold uppercase">
            Chuẩn chức danh mẫu · {position.code}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            Thông tư 02/2025/TT-BGDĐT
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
          {position.name}
        </h1>
        <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-600 max-w-3xl">
          {position.description}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-slate-700 border-t border-slate-100 pt-5">
          <div className="flex items-center gap-2">
            <Target className="size-4 text-amber-600" />
            <span className="font-bold text-slate-900">{Math.min(selected, 21)}/21</span> năng lực số cốt lõi được định hình
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="size-4 text-sky-600" />
            Sẵn sàng áp dụng cho các phòng ban doanh nghiệp
          </div>
        </div>
      </header>

      {/* 6 Domains Grid */}
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {groups.map((group) => (
          <section
            key={group.number}
            aria-labelledby={`domain-${group.number}`}
            className="rounded-3xl bg-white/95 p-7 border border-slate-200/90 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
              <span className="size-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                {group.number}
              </span>
              <h2 id={`domain-${group.number}`} className="text-lg font-bold text-slate-900">
                {group.name}
              </h2>
            </div>

            <ul className="grid gap-3.5">
              {group.items.map((item) => (
                <li key={item.code} className="flex items-start justify-between gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/60">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded font-mono">
                        {item.code}
                      </span>
                      <span className="text-sm font-semibold text-slate-900">{item.name}</span>
                    </div>
                  </div>
                  <span className="rounded-md bg-white border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 whitespace-nowrap shadow-2xs">
                    {levelWithTier(item.level, 'vi')}
                  </span>
                </li>
              ))}
            </ul>

            {group.notRequired.length > 0 && (
              <p className="mt-4 text-xs font-medium text-slate-500 border-t border-slate-100 pt-3">
                Năng lực tùy chọn (không bắt buộc): {group.notRequired.join(' · ')}
              </p>
            )}
          </section>
        ))}
      </div>

      {/* Enterprise Trial CTA Box */}
      <aside className="mt-12 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-xl font-extrabold text-slate-900">
            Áp dụng chuẩn vị trí {position.name} cho đội ngũ của bạn
          </h3>
          <p className="text-sm text-slate-600 max-w-xl">
            Tạo không gian doanh nghiệp miễn phí, tự động nhập mẫu chức danh này để nhân viên làm bài đánh giá đầu vào và bắt đầu lộ trình học.
          </p>
        </div>
        <Link
          to={`/business/try?position=${position.code.toLowerCase()}`}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-amber-500/20 hover:from-amber-600 hover:to-amber-700 whitespace-nowrap transition-all"
        >
          Áp dụng mẫu vị trí này <ArrowRight className="size-4" />
        </Link>
      </aside>

      <p className="mt-8 text-center text-xs text-slate-500">{ORIGIN_NOTE}</p>
    </article>
  );
}

function PositionNotFound() {
  return (
    <div className="mx-auto max-w-xl py-20 text-center">
      <h1 className="text-3xl font-extrabold text-slate-900">Không tìm thấy vị trí tham chiếu này</h1>
      <p className="mt-3 text-sm text-slate-600">
        Vị trí bạn tìm kiếm không nằm trong danh mục các chức danh việc làm tiêu chuẩn hiện có.
      </p>
      <Link
        to="/careers"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white hover:bg-slate-800 transition"
      >
        <ArrowLeft className="size-4" /> Quay lại danh mục vị trí
      </Link>
    </div>
  );
}
