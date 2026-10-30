import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, CheckCircle2, Users, Clock } from 'lucide-react';
import { usePracticalTasks } from '@/hooks/use-tasks';
import { useAllActiveCompetencies } from '@/hooks/use-competencies';
import { useCurrentUser } from '@/hooks/use-current-user';
import { PERMISSIONS } from '@/hooks/use-permission';
import { formatDate } from '@/lib/utils';
import type { PracticalTaskDto } from '@/services/task.service';
import { PULSE_TOKENS } from '../owner-theme';

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'ACTIVE', label: 'Đang mở' },
  { value: 'ARCHIVED', label: 'Đã đóng' },
];

function TaskCard({ task, competencyMap }: { task: PracticalTaskDto; competencyMap: Map<string, string> }) {
  const pending = task.pendingReviewCount ?? 0;
  const approved = task.approvedCount ?? 0;
  const total = task.assignedEmployeesCount;
  const pct = total > 0 ? Math.round(((task.submissionsCount ?? 0) / total) * 100) : 0;

  return (
    <Link
      to={`/enterprise/tasks/${task.id}`}
      className="flex flex-col rounded-[13px] border p-4 transition-all hover:shadow-sm hover:-translate-y-0.5"
      style={{ borderColor: 'var(--po-line)', background: 'var(--po-surface)' }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <strong className="block text-[13px] line-clamp-2" style={{ color: 'var(--po-ink)' }}>
            {task.title}
          </strong>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <span
              className="text-[9px] font-black px-1.5 py-0.5 rounded"
              style={{ background: 'var(--po-soft)', color: 'var(--po-accent-strong)' }}
            >
              LV{task.targetLevel}
            </span>
            {task.departmentName && (
              <span className="text-[10px]" style={{ color: 'var(--po-muted)' }}>
                {task.departmentName}
              </span>
            )}
          </div>
        </div>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={
            task.status === 'ACTIVE'
              ? { background: '#ecfdf5', color: '#16a34a' }
              : { background: 'var(--po-raised)', color: 'var(--po-muted)' }
          }
        >
          {task.status === 'ACTIVE' ? 'Đang mở' : 'Đã đóng'}
        </span>
      </div>

      {/* Competency pills */}
      <div className="flex flex-wrap gap-1 mb-3">
        {task.competencyIds.slice(0, 3).map((id) => (
          <span
            key={id}
            className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
            style={{ background: 'var(--po-soft)', color: 'var(--po-accent)' }}
          >
            {competencyMap.get(id) || id.slice(0, 8)}
          </span>
        ))}
        {task.competencyIds.length > 3 && (
          <span className="text-[9px]" style={{ color: 'var(--po-muted)' }}>
            +{task.competencyIds.length - 3}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 text-[10px] mb-2" style={{ color: 'var(--po-muted)' }}>
        <span className="flex items-center gap-1">
          <Users className="size-3" /> {total} nhân sự
        </span>
        <span className="flex items-center gap-1">
          <Clock className="size-3" /> {formatDate(task.dueDate)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-[5px] w-full rounded-full overflow-hidden" style={{ background: 'var(--po-line)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: 'var(--po-accent)' }}
        />
      </div>
      <div className="flex items-center justify-between mt-1.5 text-[10px] font-bold">
        <span style={{ color: 'var(--po-muted)' }}>
          {task.submissionsCount ?? 0}/{total} nộp bài
        </span>
        <div className="flex gap-2">
          {pending > 0 && (
            <span style={{ color: '#d97706' }}>{pending} chờ chấm</span>
          )}
          {approved > 0 && (
            <span style={{ color: '#16a34a' }}>{approved} đạt</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function OwnerTasksPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pageIndex, setPageIndex] = useState(1);

  const canCreate = useCurrentUser((s) => s.hasPermission(PERMISSIONS.TASK_CREATE));
  const { data: tasksData, isLoading } = usePracticalTasks({
    search: search.trim() || undefined,
    status: statusFilter || undefined,
    pageIndex,
    pageSize: 20,
  });
  const { data: competencies = [] } = useAllActiveCompetencies();

  const competencyMap = new Map(
    competencies.map((c) => [c.id, c.frameworkCode ? `TT02-${c.frameworkCode}` : c.code]),
  );
  const tasks = tasksData?.items ?? [];

  return (
    <div
      className="po-owner -m-4 md:-m-6 min-h-screen"
      style={{
        ...PULSE_TOKENS,
        background: 'var(--po-canvas)',
        backgroundImage: 'radial-gradient(ellipse 80% 55% at 50% 0%, var(--po-glow) 0%, transparent 65%)',
      }}
    >
      {/* ── Header ── */}
      <section className="px-4 md:px-6 pt-8 pb-2 mx-auto" style={{ maxWidth: 1220 }}>
        <p
          className="text-[10px] font-black uppercase tracking-[0.12em]"
          style={{ color: 'var(--po-muted)' }}
        >
          35 / Nhiệm vụ thực tế
          <span
            className="ml-[7px] inline-block size-1.5 rounded-full align-middle"
            style={{ background: 'var(--po-coral)' }}
          />
        </p>
        <h1
          className="mt-[11px] text-[clamp(26px,3.4vw,42px)] font-bold leading-[1.08]"
          style={{ color: 'var(--po-ink)', letterSpacing: '-0.045em' }}
        >
          Minh chứng tại nơi làm việc.
        </h1>
        <p
          className="mt-2 text-sm leading-relaxed max-w-[58ch]"
          style={{ color: 'var(--po-muted)' }}
        >
          Tạo bài tập gắn miền năng lực, cấp độ và tiêu chí chấm (rubric).
          Giao cho vị trí hoặc nhân viên; quản lý trực tiếp đánh giá minh chứng.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {canCreate && (
            <Link
              to="/enterprise/tasks/new"
              className="inline-flex items-center gap-1.5 rounded-[11px] px-4 py-2.5 text-xs font-extrabold transition-transform hover:-translate-y-0.5"
              style={{ background: 'var(--po-accent)', color: '#fff' }}
            >
              <Plus className="size-3.5" /> Giao bài tập mới
            </Link>
          )}
          <Link
            to="/enterprise/reviews"
            className="inline-flex items-center gap-1.5 rounded-[11px] border px-4 py-2.5 text-xs font-bold transition-transform hover:-translate-y-0.5"
            style={{ borderColor: 'var(--po-line)', color: 'var(--po-ink)' }}
          >
            <CheckCircle2 className="size-3.5" /> Hàng chờ chấm điểm
          </Link>
        </div>
      </section>

      {/* ── Content ── */}
      <div className="px-4 md:px-6 pb-8 mt-4 mx-auto" style={{ maxWidth: 1220 }}>
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Task list */}
          <section>
            {/* Filters */}
            <div
              className="flex flex-col sm:flex-row gap-3 mb-4 rounded-[13px] border p-3"
              style={{ borderColor: 'var(--po-line)', background: 'var(--po-surface)' }}
            >
              <input
                type="search"
                placeholder="Tìm theo tiêu đề bài thực hành…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPageIndex(1); }}
                className="flex-1 rounded-lg border px-3 py-2 text-xs outline-none"
                style={{ borderColor: 'var(--po-line)', color: 'var(--po-ink)', background: 'var(--po-canvas)' }}
              />
              <select
                aria-label="Lọc trạng thái"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPageIndex(1); }}
                className="w-40 rounded-lg border px-3 py-2 text-xs outline-none"
                style={{ borderColor: 'var(--po-line)', color: 'var(--po-ink)', background: 'var(--po-canvas)' }}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {isLoading ? (
              <div className="py-16 text-center">
                <p className="text-sm" style={{ color: 'var(--po-muted)' }}>Đang tải nhiệm vụ…</p>
              </div>
            ) : tasks.length === 0 ? (
              <div
                className="rounded-[22px] border p-10 text-center"
                style={{ borderColor: 'var(--po-line)', background: 'var(--po-surface)' }}
              >
                <div
                  className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl text-2xl"
                  style={{ background: 'var(--po-soft)', color: 'var(--po-accent)' }}
                >
                  ◉
                </div>
                <h2 className="text-lg font-semibold" style={{ color: 'var(--po-ink)' }}>
                  Chưa có bài thực hành nào
                </h2>
                <p className="text-xs mt-1 max-w-[40ch] mx-auto" style={{ color: 'var(--po-muted)' }}>
                  Tạo bài tập đầu tiên sau khi chạy đánh giá khoảng trống năng lực.
                </p>
                {canCreate && (
                  <Link
                    to="/enterprise/tasks/new"
                    className="mt-4 inline-flex items-center gap-1.5 rounded-[11px] px-4 py-2.5 text-xs font-extrabold"
                    style={{ background: 'var(--po-accent)', color: '#fff' }}
                  >
                    <Plus className="size-3.5" /> Giao bài tập mới
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {tasks.map((t) => (
                  <TaskCard key={t.id} task={t} competencyMap={competencyMap} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {(tasksData?.totalPages ?? 0) > 1 && (
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
                  {pageIndex} / {tasksData?.totalPages}
                </span>
                <button
                  type="button"
                  disabled={pageIndex >= (tasksData?.totalPages ?? 1)}
                  onClick={() => setPageIndex((p) => p + 1)}
                  className="rounded-[11px] border px-3 py-2 font-bold disabled:opacity-40"
                  style={{ borderColor: 'var(--po-line)', color: 'var(--po-ink)' }}
                >
                  Trang sau
                </button>
              </div>
            )}
          </section>

          {/* Side panel */}
          <aside className="space-y-4">
            <div
              className="rounded-[17px] border p-5"
              style={{ borderColor: 'var(--po-line)', background: 'var(--po-surface)', boxShadow: '0 10px 35px rgba(29,48,102,.025)' }}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: 'var(--po-muted)' }}>
                Giao bài mới
              </p>
              <h3 className="mt-[9px] text-base font-semibold" style={{ color: 'var(--po-ink)', letterSpacing: '-0.03em' }}>
                Xác định thế nào là "đạt chuẩn".
              </h3>
              <p className="mt-1 text-[11px] leading-relaxed" style={{ color: 'var(--po-muted)' }}>
                Thiết lập tiêu đề, miền năng lực, cấp độ và bảng tiêu chí chấm
                (rubric). Giao cho vị trí hoặc nhân viên cụ thể; quản lý phòng ban
                trực tiếp đánh giá minh chứng.
              </p>
              {canCreate && (
                <Link
                  to="/enterprise/tasks/new"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-[11px] border px-3 py-2 text-xs font-extrabold transition-transform hover:-translate-y-0.5"
                  style={{ borderColor: 'var(--po-line)', color: 'var(--po-ink)' }}
                >
                  <Plus className="size-3.5" /> Giao bài tập →
                </Link>
              )}
            </div>

            <div
              className="rounded-[17px] border p-5"
              style={{ borderColor: 'var(--po-line)', background: 'var(--po-surface)', boxShadow: '0 10px 35px rgba(29,48,102,.025)' }}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: 'var(--po-muted)' }}>
                Luồng minh chứng
              </p>
              <h3 className="mt-[9px] text-base font-semibold" style={{ color: 'var(--po-ink)', letterSpacing: '-0.03em' }}>
                Tách biệt với khóa học.
              </h3>
              <p className="mt-1 text-[11px] leading-relaxed" style={{ color: 'var(--po-muted)' }}>
                Nhiệm vụ thực tế xác nhận năng lực ứng dụng qua đánh giá của quản
                lý. Không dùng chính sách 2 lần thi của khóa học.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  to="/enterprise/reviews"
                  className="text-[11px] font-bold transition-opacity hover:opacity-70"
                  style={{ color: 'var(--po-accent)' }}
                >
                  Hàng chờ chấm →
                </Link>
                <Link
                  to="/enterprise/skill-gap"
                  className="text-[11px] font-bold transition-opacity hover:opacity-70"
                  style={{ color: 'var(--po-accent)' }}
                >
                  Khoảng trống →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
