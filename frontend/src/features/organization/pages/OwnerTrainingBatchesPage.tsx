import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import {
  useTrainingBatches,
  useTrainingBatchSummary,
} from '@/hooks/use-training-batches';
import type { TrainingBatchStatus } from '@/services/mock/server/types';
import { TrainingBatchCard } from '../components/TrainingBatchCard';

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

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Tất cả' },
  { value: 'RUNNING', label: 'Đang diễn ra' },
  { value: 'SCHEDULED', label: 'Đã lên lịch' },
  { value: 'COMPLETED', label: 'Đã hoàn thành' },
  { value: 'DRAFT', label: 'Bản nháp' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

export function OwnerTrainingBatchesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pageIndex, setPageIndex] = useState(1);

  const { data: summary } = useTrainingBatchSummary();
  const { data: batchesData, isLoading } = useTrainingBatches({
    search: search.trim() || undefined,
    status: statusFilter
      ? (statusFilter as TrainingBatchStatus)
      : undefined,
    pageIndex,
    pageSize: 20,
  });

  const batches = batchesData?.items ?? [];

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
      {/* ── Header ── */}
      <section
        className="px-4 md:px-6 pt-8 pb-2 mx-auto"
        style={{ maxWidth: 1220 }}
      >
        <p
          className="text-[10px] font-black uppercase tracking-[0.12em]"
          style={{ color: 'var(--po-muted)' }}
        >
          25 / Đợt đào tạo
          <span
            className="ml-[7px] inline-block size-1.5 rounded-full align-middle"
            style={{ background: 'var(--po-coral)' }}
          />
        </p>
        <h1
          className="mt-[11px] text-[clamp(26px,3.4vw,42px)] font-bold leading-[1.08]"
          style={{ color: 'var(--po-ink)', letterSpacing: '-0.045em' }}
        >
          Cùng nhóm, cùng lộ trình.
        </h1>
        <p
          className="mt-2 text-sm leading-relaxed max-w-[58ch]"
          style={{ color: 'var(--po-muted)' }}
        >
          Chọn khóa học, nhóm đối tượng theo phòng ban hoặc vị trí và hạn hoàn
          thành. Khóa cơ bản miễn phí; khóa cao hơn dùng suất đã mua.
        </p>
        <div className="mt-4">
          <Link
            to="/enterprise/training-batches/new"
            className="inline-flex items-center gap-1.5 rounded-[11px] px-4 py-2.5 text-xs font-extrabold transition-transform hover:-translate-y-0.5"
            style={{
              background: 'var(--po-accent)',
              color: '#fff',
            }}
          >
            <Plus className="size-3.5" /> Tạo đợt đào tạo mới
          </Link>
        </div>
      </section>

      {/* ── KPI strip ── */}
      <div
        className="px-4 md:px-6 py-4 mx-auto"
        style={{ maxWidth: 1220 }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Tổng số đợt', value: summary?.total ?? 0 },
            { label: 'Đang diễn ra', value: summary?.running ?? 0, accent: true },
            { label: 'Đã lên lịch', value: summary?.scheduled ?? 0 },
            { label: 'Đã hoàn thành', value: summary?.completed ?? 0 },
            { label: 'Tổng học viên', value: summary?.totalParticipants ?? 0 },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-[13px] border p-4"
              style={{
                borderColor: 'var(--po-line)',
                background: 'var(--po-surface)',
              }}
            >
              <span
                className="text-[10px] font-bold block"
                style={{
                  color: kpi.accent
                    ? 'var(--po-accent)'
                    : 'var(--po-muted)',
                }}
              >
                {kpi.label}
              </span>
              <strong
                className="text-xl block mt-1"
                style={{ color: 'var(--po-ink)' }}
              >
                {kpi.value}
              </strong>
            </div>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div
        className="px-4 md:px-6 pb-8 mx-auto"
        style={{ maxWidth: 1220 }}
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Batch list */}
          <section>
            {/* Filters */}
            <div
              className="flex flex-col sm:flex-row gap-3 mb-4 rounded-[13px] border p-3"
              style={{
                borderColor: 'var(--po-line)',
                background: 'var(--po-surface)',
              }}
            >
              <input
                type="search"
                placeholder="Tìm theo tên hoặc mã đợt…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPageIndex(1);
                }}
                className="flex-1 rounded-lg border px-3 py-2 text-xs outline-none"
                style={{
                  borderColor: 'var(--po-line)',
                  color: 'var(--po-ink)',
                  background: 'var(--po-canvas)',
                }}
              />
              <select
                aria-label="Lọc trạng thái"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPageIndex(1);
                }}
                className="w-40 rounded-lg border px-3 py-2 text-xs outline-none"
                style={{
                  borderColor: 'var(--po-line)',
                  color: 'var(--po-ink)',
                  background: 'var(--po-canvas)',
                }}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* List */}
            {isLoading ? (
              <div className="py-16 text-center">
                <p
                  className="text-sm"
                  style={{ color: 'var(--po-muted)' }}
                >
                  Đang tải đợt đào tạo…
                </p>
              </div>
            ) : batches.length === 0 ? (
              <div
                className="rounded-[22px] border p-10 text-center"
                style={{
                  borderColor: 'var(--po-line)',
                  background: 'var(--po-surface)',
                }}
              >
                <div
                  className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl text-2xl"
                  style={{
                    background: '#e9edff',
                    color: 'var(--po-accent)',
                  }}
                >
                  ◉
                </div>
                <h2
                  className="text-lg font-semibold"
                  style={{ color: 'var(--po-ink)' }}
                >
                  Chưa có đợt đào tạo nào
                </h2>
                <p
                  className="text-xs mt-1 max-w-[40ch] mx-auto"
                  style={{ color: 'var(--po-muted)' }}
                >
                  Tạo đợt đào tạo đầu tiên để chuẩn hóa lộ trình bồi dưỡng cho
                  đội ngũ.
                </p>
                <Link
                  to="/enterprise/training-batches/new"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-[11px] px-4 py-2.5 text-xs font-extrabold"
                  style={{
                    background: 'var(--po-accent)',
                    color: '#fff',
                  }}
                >
                  <Plus className="size-3.5" /> Tạo đợt đào tạo ngay
                </Link>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {batches.map((b) => (
                  <TrainingBatchCard key={b.id} batch={b} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {(batchesData?.totalPages ?? 0) > 1 && (
              <div className="flex items-center justify-end gap-3 mt-4 text-xs">
                <button
                  type="button"
                  disabled={pageIndex <= 1}
                  onClick={() => setPageIndex((p) => p - 1)}
                  className="rounded-[11px] border px-3 py-2 font-bold disabled:opacity-40"
                  style={{
                    borderColor: 'var(--po-line)',
                    color: 'var(--po-ink)',
                  }}
                >
                  Trang trước
                </button>
                <span style={{ color: 'var(--po-muted)' }}>
                  {pageIndex} / {batchesData?.totalPages}
                </span>
                <button
                  type="button"
                  disabled={
                    pageIndex >= (batchesData?.totalPages ?? 1)
                  }
                  onClick={() => setPageIndex((p) => p + 1)}
                  className="rounded-[11px] border px-3 py-2 font-bold disabled:opacity-40"
                  style={{
                    borderColor: 'var(--po-line)',
                    color: 'var(--po-ink)',
                  }}
                >
                  Trang sau
                </button>
              </div>
            )}
          </section>

          {/* Side panel — create CTA + info */}
          <aside className="space-y-4">
            <div
              className="rounded-[17px] border p-5"
              style={{
                borderColor: 'var(--po-line)',
                background: 'var(--po-surface)',
                boxShadow: '0 10px 35px rgba(29,48,102,.025)',
              }}
            >
              <p
                className="text-[10px] font-black uppercase tracking-[0.12em]"
                style={{ color: 'var(--po-muted)' }}
              >
                Tạo đợt mới
              </p>
              <h3
                className="mt-[9px] text-base font-semibold"
                style={{
                  color: 'var(--po-ink)',
                  letterSpacing: '-0.03em',
                }}
              >
                Xác định mục tiêu rõ ràng.
              </h3>
              <p
                className="mt-1 text-[11px] leading-relaxed"
                style={{ color: 'var(--po-muted)' }}
              >
                Chọn khóa học, nhóm đối tượng (theo phòng ban, vị trí, cấp bậc)
                và lên lịch thực hiện. Mỗi học viên được kiểm tra yêu cầu vị trí
                và điều kiện tiên quyết trước khi giao.
              </p>
              <Link
                to="/enterprise/training-batches/new"
                className="mt-4 inline-flex items-center gap-1.5 rounded-[11px] border px-3 py-2 text-xs font-extrabold transition-transform hover:-translate-y-0.5"
                style={{
                  borderColor: 'var(--po-line)',
                  color: 'var(--po-ink)',
                }}
              >
                <Plus className="size-3.5" /> Tạo đợt đào tạo →
              </Link>
            </div>

            <div
              className="rounded-[17px] border p-5"
              style={{
                borderColor: 'var(--po-line)',
                background: 'var(--po-surface)',
                boxShadow: '0 10px 35px rgba(29,48,102,.025)',
              }}
            >
              <p
                className="text-[10px] font-black uppercase tracking-[0.12em]"
                style={{ color: 'var(--po-muted)' }}
              >
                Quy trình đào tạo
              </p>
              <h3
                className="mt-[9px] text-base font-semibold"
                style={{
                  color: 'var(--po-ink)',
                  letterSpacing: '-0.03em',
                }}
              >
                Từ khoảng trống đến hoàn thành.
              </h3>
              <p
                className="mt-1 text-[11px] leading-relaxed"
                style={{ color: 'var(--po-muted)' }}
              >
                Phân tích khoảng trống năng lực → Chọn khóa bồi dưỡng → Giao cho
                nhóm → Theo dõi tiến độ → Đánh giá kết quả → Báo cáo chu kỳ.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  to="/enterprise/skill-gap"
                  className="text-[11px] font-bold transition-opacity hover:opacity-70"
                  style={{ color: 'var(--po-accent)' }}
                >
                  Khoảng trống →
                </Link>
                <Link
                  to="/enterprise/courses"
                  className="text-[11px] font-bold transition-opacity hover:opacity-70"
                  style={{ color: 'var(--po-accent)' }}
                >
                  Khóa học →
                </Link>
                <Link
                  to="/enterprise/reports"
                  className="text-[11px] font-bold transition-opacity hover:opacity-70"
                  style={{ color: 'var(--po-accent)' }}
                >
                  Báo cáo →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
