import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Settings, ArrowRight } from 'lucide-react';
import { useOrganizationOverview } from '@/hooks/use-organization';
import { useCapabilityDashboard } from '@/hooks/use-analytics';
import { BlueprintFlow } from '../components/BlueprintFlow';
import { BlueprintTierCard } from '../components/BlueprintTierCard';
import { PositionMapping } from '../components/PositionMapping';
import { CapabilityCeilingMatrix } from '../components/CapabilityCeilingMatrix';
import { PositionReferenceMatrix } from '../components/PositionReferenceMatrix';

const PULSE_TOKENS = {
  '--po-canvas': '#f7f9fd',
  '--po-surface': '#fff',
  '--po-ink': '#172442',
  '--po-muted': '#62718d',
  '--po-accent': '#304bdf',
  '--po-accent-strong': '#203bbf',
  '--po-coral': '#ef735c',
  '--po-lime': '#c6ec78',
  '--po-line': '#dfe6f3',
  '--po-soft': '#eef2ff',
  '--po-tint': '#edf1ff',
  '--po-warm': '#f1816b',
} as React.CSSProperties;

export function OwnerSetupBlueprintPage() {
  const { data: orgData, isLoading: orgLoading } = useOrganizationOverview();
  const { data: capData, isLoading: capLoading } = useCapabilityDashboard();

  const isLoading = orgLoading || capLoading;

  const deptItem = orgData?.setup.find((s) => s.key === 'departments');
  const deptCount = deptItem ? parseInt(deptItem.detail, 10) || 0 : 0;
  const posItem = orgData?.setup.find((s) => s.key === 'positions');
  const posCount = posItem ? parseInt(posItem.detail, 10) || 0 : 0;
  const tierLevels = useMemo(
    () => [
      { label: 'DigiTalent', sublabel: 'Danh mục khóa và 5 mẫu vị trí tham khảo' },
      {
        label: orgData?.name || 'Tổ chức',
        sublabel: 'Tự đặt giới hạn khóa và yêu cầu vị trí',
      },
      {
        label: 'Phòng ban',
        sublabel: `${deptCount} đơn vị quản lý nhân viên và Manager`,
      },
      {
        label: 'Vị trí',
        sublabel: `${posCount} vị trí có mục tiêu năng lực riêng`,
      },
    ],
    [orgData?.name, deptCount, posCount],
  );

  const domains = useMemo(
    () =>
      (capData?.domains ?? [])
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [capData],
  );

  if (isLoading) {
    return (
      <div
        className="-m-4 md:-m-6 min-h-screen flex items-center justify-center"
        style={{ ...PULSE_TOKENS, background: 'var(--po-canvas)' }}
      >
        <p className="text-sm" style={{ color: 'var(--po-muted)' }}>
          Đang tải kiến trúc năng lực…
        </p>
      </div>
    );
  }

  return (
    <div
      className="-m-4 md:-m-6 min-h-screen"
      style={{
        ...PULSE_TOKENS,
        background: 'var(--po-canvas)',
        backgroundImage:
          'radial-gradient(ellipse 80% 55% at 50% 0%, #dce5ff 0%, transparent 65%)',
      }}
    >
      {/* ── Page header ── */}
      <section className="px-4 md:px-6 pt-8 pb-2 mx-auto" style={{ maxWidth: 1220 }}>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <span
              className="text-[10px] font-black uppercase tracking-[0.14em]"
              style={{ color: 'var(--po-accent)' }}
            >
              Thiết lập chuẩn doanh nghiệp
              <i
                className="ml-[7px] inline-block size-1.5 rounded-full align-middle"
                style={{ background: 'var(--po-coral)' }}
              />
            </span>
            <h1
              className="mt-2 font-bold leading-[1.1]"
              style={{
                fontSize: 'clamp(28px, 3.2vw, 42px)',
                color: 'var(--po-ink)',
                letterSpacing: '-0.04em',
              }}
            >
              Kiến trúc năng lực số
            </h1>
            <p
              className="mt-1 text-[13px] leading-relaxed"
              style={{ color: 'var(--po-muted)', maxWidth: 560 }}
            >
              Chuẩn hóa khung năng lực và giới hạn khóa học theo vị trí & phòng ban.
            </p>
          </div>
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold"
            style={
              orgData?.setupCompleted
                ? {
                    borderColor: '#bbf7d0',
                    background: '#ecfdf5',
                    color: '#15803d',
                  }
                : {
                    borderColor: '#fdddb6',
                    background: '#fff7ed',
                    color: '#c2410c',
                  }
            }
          >
            {orgData?.setupCompleted ? 'Đã công bố' : 'Bản nháp'}
          </span>
        </div>
      </section>

      {/* ── Content ── */}
      <div className="px-4 md:px-6 py-4 mx-auto" style={{ maxWidth: 1220 }}>
        {/* Ghi chú cơ chế - Dạng thu gọn / xổ ra theo yêu cầu */}
        <details className="group mb-4 rounded-xl border border-blue-100 bg-blue-50/60 p-3.5 text-xs text-blue-900 transition-all [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer items-center justify-between font-semibold select-none">
            <span className="flex items-center gap-2">
              <span className="grid size-5 place-items-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">ℹ️</span>
              Ghi chú cơ chế: Phân cấp trần đào tạo & Chuẩn vị trí
            </span>
            <span className="text-xs text-blue-600 font-bold group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <p className="mt-2.5 text-xs leading-relaxed text-blue-800 pl-7 border-t border-blue-100/70 pt-2">
            Vị trí công việc xác định năng lực cần đạt của nhân viên. Doanh nghiệp và phòng ban thiết lập trần tối đa các khóa học được mở để kiểm soát nội dung và chi phí đào tạo.
          </p>
        </details>

        {/* Blueprint flow + checklist */}
        <BlueprintFlow
          setup={orgData?.setup ?? []}
          setupCompleted={orgData?.setupCompleted ?? false}
        />

        {/* Grid-2: Tier cards + Position-specific path */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Tier overview */}
          <section
            className="rounded-[22px] border p-6"
            style={{
              borderColor: 'var(--po-line)',
              background: 'var(--po-surface)',
              boxShadow: '0 10px 35px rgba(29,48,102,.025)',
            }}
          >
            <span
              className="text-[10px] font-black uppercase tracking-[0.12em]"
              style={{ color: 'var(--po-muted)' }}
            >
              Kiến trúc năng lực
              <i
                className="ml-[7px] inline-block size-1.5 rounded-full align-middle"
                style={{ background: 'var(--po-coral)' }}
              />
            </span>
            <h2
              className="mt-[11px] text-xl font-semibold tracking-[-0.045em]"
              style={{ color: 'var(--po-ink)' }}
            >
              Từ khung nền tảng đến vị trí.
            </h2>
            <p
              className="text-xs leading-relaxed mt-1"
              style={{ color: 'var(--po-muted)' }}
            >
              Mục tiêu đã công bố xác định yêu cầu cho từng nhân viên.
            </p>

            <div className="mt-5">
              <BlueprintTierCard levels={tierLevels} />
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/enterprise/departments"
                className="rounded-xl border px-3 py-2 text-xs font-extrabold transition-colors hover:opacity-80"
                style={{
                  borderColor: 'var(--po-line)',
                  color: 'var(--po-ink)',
                }}
              >
                Quản lý phòng ban
              </Link>
              <Link
                to="/enterprise/positions"
                className="rounded-xl border px-3 py-2 text-xs font-extrabold transition-colors hover:opacity-80"
                style={{
                  borderColor: 'var(--po-line)',
                  color: 'var(--po-ink)',
                }}
              >
                Quản lý vị trí
              </Link>
              <Link
                to="/enterprise/skill-gap"
                className="rounded-xl px-3 py-2 text-xs font-extrabold transition-colors hover:opacity-80"
                style={{ color: 'var(--po-muted)' }}
              >
                Xem khoảng trống
              </Link>
            </div>
          </section>

          {/* Position-specific path */}
          <section
            className="rounded-[22px] border p-6"
            style={{
              borderColor: 'var(--po-line)',
              background: 'var(--po-surface)',
              boxShadow: '0 10px 35px rgba(29,48,102,.025)',
            }}
          >
            <span
              className="text-[10px] font-black uppercase tracking-[0.12em]"
              style={{ color: 'var(--po-muted)' }}
            >
              Lộ trình theo vị trí
            </span>
            <h2
              className="mt-[11px] text-xl font-semibold tracking-[-0.045em]"
              style={{ color: 'var(--po-ink)' }}
            >
              Mục tiêu học theo vị trí công việc.
            </h2>
            <p
              className="text-xs leading-relaxed mt-1"
              style={{ color: 'var(--po-muted)' }}
            >
              Manager chỉ duyệt bài tập cuối khóa trong phạm vi phòng ban.
            </p>

            <div
              className="mt-5 rounded-[13px] border p-[17px]"
              style={{
                borderColor: 'var(--po-line)',
                background: 'linear-gradient(145deg, #fff, #f8faff)',
              }}
            >
              <strong className="text-sm block" style={{ color: 'var(--po-ink)' }}>
                Chuỗi mục tiêu đã công bố
              </strong>
              <small
                className="block mt-0.5 text-[11px]"
                style={{ color: 'var(--po-muted)' }}
              >
                Mục tiêu vị trí quyết định đích học; phạm vi khóa mở do {orgData?.name || 'doanh nghiệp'}
                {deptCount > 0 ? ' và phòng ban (nếu có giới hạn riêng)' : ''} quyết định.
              </small>
              <div
                className="mt-3 h-[5px] rounded-full overflow-hidden"
                style={{ background: 'var(--po-line)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: '63%',
                    background: 'var(--po-accent)',
                  }}
                />
              </div>
            </div>

            <div
              className="mt-4 border-t pt-4"
              style={{ borderColor: 'var(--po-line)' }}
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-[11px] font-bold mb-1"
                    style={{ color: 'var(--po-muted)' }}
                  >
                    Thời gian chờ giữa hai lần nộp
                  </label>
                  <div
                    className="rounded-lg border px-3 py-2 text-sm tabular-nums"
                    style={{
                      borderColor: 'var(--po-line)',
                      color: 'var(--po-ink)',
                      background: '#f8faff',
                    }}
                  >
                    48 giờ
                  </div>
                </div>
                <div>
                  <label
                    className="block text-[11px] font-bold mb-1"
                    style={{ color: 'var(--po-muted)' }}
                  >
                    Hạn nộp sau khi lần 2 mở
                  </label>
                  <div
                    className="rounded-lg border px-3 py-2 text-sm tabular-nums"
                    style={{
                      borderColor: 'var(--po-line)',
                      color: 'var(--po-ink)',
                      background: '#f8faff',
                    }}
                  >
                    14 ngày
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link
                to="/enterprise/requirements/builder"
                className="inline-flex items-center gap-2 rounded-[11px] px-4 py-3 text-[13px] font-bold transition-transform hover:-translate-y-0.5"
                style={{
                  background: 'var(--po-accent)',
                  color: '#fff',
                  boxShadow: '0 9px 18px rgba(52,72,207,.17)',
                }}
              >
                <Settings className="size-4" />
                Điều chỉnh yêu cầu riêng của doanh nghiệp
              </Link>
              <Link
                to="/enterprise/members"
                className="inline-flex items-center gap-2 rounded-[11px] border px-4 py-3 text-[13px] font-bold transition-transform hover:-translate-y-0.5"
                style={{
                  borderColor: 'var(--po-line)',
                  color: 'var(--po-ink)',
                }}
              >
                Mời nhân viên
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </section>
        </div>

        {/* Bảng trần năng lực chính (Bảng màu xanh cốt lõi) */}
        <div className="mt-8" id="ceilings">
          <CapabilityCeilingMatrix />
        </div>

        {/* Nguồn tham khảo mở rộng: Thu gọn mặc định để bảng màu xanh là trung tâm */}
        <details className="group mt-6 rounded-[22px] border border-slate-200 bg-white p-6 shadow-sm transition-all [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer items-center justify-between select-none">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                Nguồn tham chiếu mở rộng
              </span>
              <h3 className="text-base font-bold text-slate-800">
                Mức năng lực 5 vị trí mẫu & Ánh xạ chi tiết (DigiTalent AI)
              </h3>
            </div>
            <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 group-open:bg-slate-100 transition-colors">
              Xem chi tiết / Thu gọn ▼
            </span>
          </summary>
          <div className="mt-6 space-y-6 pt-4 border-t border-slate-100">
            <PositionReferenceMatrix />
            <PositionMapping domains={domains} isLoading={capLoading} />
          </div>
        </details>
      </div>
    </div>
  );
}
