import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import { useReviewQueue } from '@/hooks/use-tasks';
import { formatDate } from '@/lib/utils';

const PULSE_TOKENS = {
  '--po-canvas': '#f7f9fd',
  '--po-surface': '#fff',
  '--po-ink': '#172442',
  '--po-muted': '#62718d',
  '--po-accent': '#304bdf',
  '--po-coral': '#ef735c',
  '--po-lime': '#c6ec78',
  '--po-line': '#dfe6f3',
  '--po-soft': '#eef2ff',
  '--po-tint': '#edf1ff',
  '--po-warm': '#f1816b',
} as React.CSSProperties;

export function OwnerReviewsPage() {
  const [search, setSearch] = useState('');
  const [pageIndex, setPageIndex] = useState(1);

  const { data, isLoading } = useReviewQueue({
    search: search.trim() || undefined,
    pageIndex,
    pageSize: 20,
  });

  const items = data?.items ?? [];

  return (
    <div
      className="-m-4 md:-m-6 min-h-screen"
      style={{
        ...PULSE_TOKENS,
        background: 'var(--po-canvas)',
        backgroundImage: 'radial-gradient(ellipse 80% 55% at 50% 0%, #dce5ff 0%, transparent 65%)',
      }}
    >
      {/* ── Header ── */}
      <section className="px-4 md:px-6 pt-8 pb-2 mx-auto" style={{ maxWidth: 1220 }}>
        <Link
          to="/enterprise/tasks"
          className="inline-flex items-center gap-1.5 text-[11px] font-bold mb-3 transition-opacity hover:opacity-70"
          style={{ color: 'var(--po-muted)' }}
        >
          <ArrowLeft className="size-3" /> Nhiệm vụ thực tế
        </Link>

        <p
          className="text-[10px] font-black uppercase tracking-[0.12em]"
          style={{ color: 'var(--po-muted)' }}
        >
          38 / Hàng đợi đánh giá
          <span
            className="ml-[7px] inline-block size-1.5 rounded-full align-middle"
            style={{ background: 'var(--po-coral)' }}
          />
        </p>
        <h1
          className="mt-[11px] text-[clamp(26px,3.4vw,42px)] font-bold leading-[1.08]"
          style={{ color: 'var(--po-ink)', letterSpacing: '-0.045em' }}
        >
          Đánh giá minh chứng thực tế.
        </h1>
        <p className="mt-2 text-sm leading-relaxed max-w-[58ch]" style={{ color: 'var(--po-muted)' }}>
          Danh sách bài nộp đang chờ chấm theo tiêu chí rubric. Kết quả chấm
          không tự xác nhận cấp năng lực.
        </p>
      </section>

      {/* ── Content ── */}
      <div className="px-4 md:px-6 pb-8 mt-4 mx-auto" style={{ maxWidth: 1220 }}>
        {/* Filter */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 rounded-[13px] border p-3"
          style={{ borderColor: 'var(--po-line)', background: 'var(--po-surface)' }}
        >
          <input
            type="search"
            placeholder="Tìm theo tên nhân viên, bài tập…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPageIndex(1); }}
            className="flex-1 rounded-lg border px-3 py-2 text-xs outline-none"
            style={{ borderColor: 'var(--po-line)', color: 'var(--po-ink)', background: 'var(--po-canvas)' }}
          />
          <span className="text-[11px] font-bold" style={{ color: 'var(--po-accent)' }}>
            {data?.totalItems ?? 0} chờ chấm
          </span>
        </div>

        {isLoading ? (
          <div className="py-16 text-center">
            <p className="text-sm" style={{ color: 'var(--po-muted)' }}>Đang tải…</p>
          </div>
        ) : items.length === 0 ? (
          <div
            className="rounded-[22px] border p-10 text-center"
            style={{ borderColor: 'var(--po-line)', background: 'var(--po-surface)' }}
          >
            <div
              className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl text-2xl"
              style={{ background: '#ecfdf5', color: '#16a34a' }}
            >
              ✓
            </div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--po-ink)' }}>
              Tất cả bài tập đã được chấm điểm!
            </h2>
            <p className="text-xs mt-1 max-w-[40ch] mx-auto" style={{ color: 'var(--po-muted)' }}>
              Hàng chờ trống. Bài nộp mới sẽ xuất hiện ở đây khi nhân viên nộp minh chứng.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Link
                key={item.id}
                to={`/enterprise/reviews/${item.id}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-[13px] border p-4 transition-all hover:shadow-sm hover:-translate-y-0.5"
                style={{ borderColor: 'var(--po-line)', background: 'var(--po-surface)' }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="grid size-9 place-items-center rounded-full text-xs font-bold shrink-0"
                    style={{ background: 'var(--po-soft)', color: 'var(--po-accent)' }}
                  >
                    {item.employeeName.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <strong className="block text-xs truncate" style={{ color: 'var(--po-ink)' }}>
                      {item.employeeName}
                    </strong>
                    <span className="text-[10px] font-mono" style={{ color: 'var(--po-muted)' }}>
                      {item.employeeCode}
                      {item.departmentName && ` · ${item.departmentName}`}
                    </span>
                  </div>
                </div>

                <div className="flex-1 min-w-0 sm:text-center">
                  <strong className="block text-xs truncate" style={{ color: 'var(--po-ink)' }}>
                    {item.taskTitle}
                  </strong>
                  <div className="flex items-center justify-center gap-2 mt-0.5">
                    <span
                      className="text-[9px] font-black px-1.5 py-0.5 rounded"
                      style={{ background: '#eef1ff', color: '#5364a6' }}
                    >
                      LV{item.targetLevel}
                    </span>
                    {item.taskDueDate && (
                      <span className="text-[10px] flex items-center gap-0.5" style={{ color: 'var(--po-muted)' }}>
                        <Clock className="size-3" /> {formatDate(item.taskDueDate)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px]" style={{ color: 'var(--po-muted)' }}>
                    Nộp {formatDate(item.submittedAt)}
                  </span>
                  <span
                    className="rounded-[9px] px-3 py-1.5 text-[10px] font-bold"
                    style={{ background: 'var(--po-accent)', color: '#fff' }}
                  >
                    Chấm điểm →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {(data?.totalPages ?? 0) > 1 && (
          <div className="flex items-center justify-end gap-3 mt-4 text-xs">
            <button
              type="button"
              disabled={pageIndex <= 1}
              onClick={() => setPageIndex((p) => p - 1)}
              className="rounded-[11px] border px-3 py-2 font-bold disabled:opacity-40"
              style={{ borderColor: 'var(--po-line)', color: 'var(--po-ink)' }}
            >
              Trang trước
            </button>
            <span style={{ color: 'var(--po-muted)' }}>
              {pageIndex} / {data?.totalPages}
            </span>
            <button
              type="button"
              disabled={pageIndex >= (data?.totalPages ?? 1)}
              onClick={() => setPageIndex((p) => p + 1)}
              className="rounded-[11px] border px-3 py-2 font-bold disabled:opacity-40"
              style={{ borderColor: 'var(--po-line)', color: 'var(--po-ink)' }}
            >
              Trang sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
