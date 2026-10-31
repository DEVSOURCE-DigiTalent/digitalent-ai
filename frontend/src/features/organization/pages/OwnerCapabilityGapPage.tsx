import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RefreshCw, ArrowRight, Search } from 'lucide-react';
import { useGapOverview, useCompetencyGaps } from '@/hooks/use-analytics';
import { useSkillGapRuns, useCalculateSkillGapBatch } from '@/hooks/use-skill-gaps';
import { useDepartments } from '@/hooks/use-departments';
import { useJobPositions } from '@/hooks/use-job-positions';
import { JOB_GRADES } from '@/lib/terms';
import { formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';
import { skillGapErrorMessage } from '@/lib/competency-levels';
import { BatchResultPanel } from '@/features/intelligence/components/BatchResultPanel';
import { CapabilityGapSummary } from '../components/CapabilityGapSummary';
import { CapabilityComparison } from '../components/CapabilityComparison';
import { CapabilityLearningPath } from '../components/CapabilityLearningPath';
import type { CalculateSkillGapBatchResult, SkillGapRunListItem } from '@/services/intelligence.service';
import { PULSE_TOKENS } from '../owner-theme';

type GroupBy = 'department' | 'position' | 'grade';


export function OwnerCapabilityGapPage() {
  const navigate = useNavigate();
  const [groupBy, setGroupBy] = useState<GroupBy>('department');
  const [departmentId, setDepartmentId] = useState('');
  const [jobPositionId, setJobPositionId] = useState('');
  const [jobGrade, setJobGrade] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [batchResult, setBatchResult] = useState<CalculateSkillGapBatchResult | null>(null);

  const departments = useDepartments({ pageSize: 100, status: 'ACTIVE' }).data?.items ?? [];
  const positions = useJobPositions({ pageSize: 100, status: 'ACTIVE' }).data?.items ?? [];

  const filter = {
    departmentId: departmentId || undefined,
    jobPositionId: jobPositionId || undefined,
    jobGrade: jobGrade || undefined,
  };

  const overview = useGapOverview({ groupBy, ...filter });
  const competencies = useCompetencyGaps(filter);

  const { data: runsData, isLoading: runsLoading } = useSkillGapRuns({
    pageIndex: page,
    pageSize,
    search: search.trim() || undefined,
    departmentId: departmentId || undefined,
    jobPositionId: jobPositionId || undefined,
  });

  const batchMutation = useCalculateSkillGapBatch();

  const handleRecalculateAll = async () => {
    try {
      const result = await batchMutation.mutateAsync({
        departmentId: departmentId || undefined,
        jobPositionId: jobPositionId || undefined,
      });
      setBatchResult(result);
      toast.success(`Đã tính khoảng trống năng lực cho ${result.calculatedCount} nhân viên`);
    } catch (error) {
      toast.error(skillGapErrorMessage(error, 'Không tính lại được khoảng trống năng lực'));
    }
  };

  return (
    <div
      className="po-owner -m-4 md:-m-6 min-h-screen"
      style={{
        ...PULSE_TOKENS,
        background:
          'radial-gradient(ellipse 760px 380px at 94% 0, color-mix(in srgb, #137b84 10%, transparent), transparent 70%), var(--po-canvas)',
        fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
      }}
    >
      <div
        className="mx-auto max-w-[1440px]"
        style={{ padding: 'clamp(26px, 3.5vw, 50px) clamp(22px, 4vw, 62px) 90px' }}
      >
        {/* ── Page Header ── */}
        <div className="mb-[27px] flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
          <div>
            <span
              className="text-[11px] font-black uppercase tracking-[0.14em]"
              style={{ color: 'var(--po-muted)' }}
            >
              <span
                className="mr-[7px] inline-block size-1.5 rounded-full align-middle"
                style={{ background: 'var(--po-coral)' }}
              />
              Năng lực
            </span>
            <h1
              className="mt-2 font-bold leading-[1.05]"
              style={{
                color: 'var(--po-ink)',
                fontSize: 'clamp(28px, 3.5vw, 44px)',
                letterSpacing: '-0.05em',
              }}
            >
              Khoảng trống Năng lực Đội ngũ
            </h1>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {overview.data && overview.data.totals.totalGaps > 0 && (
              <span
                className="rounded-full px-3 py-1.5 text-[11px] font-bold"
                style={{ background: 'var(--po-tint)', color: 'var(--po-accent-strong)' }}
              >
                {overview.data.totals.totalGaps} khoảng trống xác nhận
              </span>
            )}
            <button
              type="button"
              onClick={handleRecalculateAll}
              disabled={batchMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-xl border px-[17px] py-[11px] text-[13px] font-extrabold transition-colors hover:opacity-80"
              style={{ borderColor: 'var(--po-line)', color: 'var(--po-ink)' }}
            >
              <RefreshCw className={batchMutation.isPending ? 'size-4 animate-spin' : 'size-4'} />
              Tính lại toàn bộ
            </button>
          </div>
        </div>

        {/* ── Content Stack ── */}
        <div className="flex flex-col gap-4">
          {/* Summary Stats */}
          {overview.data && <CapabilityGapSummary totals={overview.data.totals} />}

          {/* Batch result feedback */}
          {batchResult && (
            <BatchResultPanel result={batchResult} onDismiss={() => setBatchResult(null)} />
          )}

          {/* Global filters */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              aria-label="Lọc theo phòng ban"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="rounded-xl border px-3 py-2 text-sm"
              style={{ borderColor: 'var(--po-line)', color: 'var(--po-ink)', background: 'var(--po-surface)' }}
            >
              <option value="">Tất cả phòng ban</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              aria-label="Lọc theo vị trí"
              value={jobPositionId}
              onChange={(e) => setJobPositionId(e.target.value)}
              className="rounded-xl border px-3 py-2 text-sm"
              style={{ borderColor: 'var(--po-line)', color: 'var(--po-ink)', background: 'var(--po-surface)' }}
            >
              <option value="">Tất cả vị trí</option>
              {positions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              aria-label="Lọc theo cấp bậc"
              value={jobGrade}
              onChange={(e) => setJobGrade(e.target.value)}
              className="rounded-xl border px-3 py-2 text-sm"
              style={{ borderColor: 'var(--po-line)', color: 'var(--po-ink)', background: 'var(--po-surface)' }}
            >
              <option value="">Mọi cấp bậc</option>
              {JOB_GRADES.map((g: string) => (
                <option key={g} value={g}>
                  Cấp bậc {g}
                </option>
              ))}
            </select>
          </div>

          {/* Overview by group */}
          <CapabilityComparison
            groups={overview.data?.groups ?? []}
            groupBy={groupBy}
            onGroupByChange={setGroupBy}
            isLoading={overview.isLoading}
          />

          {/* Competency analysis */}
          <CapabilityLearningPath
            competencies={competencies.data ?? []}
            isLoading={competencies.isLoading}
          />

          {/* Employee list */}
          <section
            className="rounded-[22px] border p-6"
            style={{ borderColor: 'var(--po-line)', background: 'var(--po-surface)' }}
          >
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span
                  className="text-[10px] font-black uppercase tracking-[0.1em]"
                  style={{ color: 'var(--po-accent)' }}
                >
                  Theo nhân viên
                </span>
                <h2
                  className="mt-1 text-lg font-semibold"
                  style={{ color: 'var(--po-ink)', letterSpacing: '-0.02em' }}
                >
                  Danh sách khoảng trống năng lực cá nhân
                </h2>
              </div>
              <div className="relative min-w-[200px]">
                <Search
                  className="absolute left-3 top-1/2 size-4 -translate-y-1/2"
                  style={{ color: 'var(--po-muted)' }}
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Tìm theo tên hoặc mã nhân viên..."
                  className="w-full rounded-xl border py-2 pl-9 pr-3 text-sm"
                  style={{ borderColor: 'var(--po-line)', color: 'var(--po-ink)', background: 'var(--po-surface)' }}
                />
              </div>
            </div>

            {runsLoading ? (
              <p className="py-6 text-center text-sm" style={{ color: 'var(--po-muted)' }}>
                Đang tải danh sách nhân viên…
              </p>
            ) : !runsData?.items?.length ? (
              <div className="py-10 text-center">
                <p className="text-sm font-medium" style={{ color: 'var(--po-ink)' }}>
                  Chưa có kết quả khoảng trống năng lực
                </p>
                <p className="mt-1 text-xs" style={{ color: 'var(--po-muted)' }}>
                  Hãy chạy phân tích để so sánh năng lực nhân viên với chuẩn vị trí.
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-[6px]">
                  {runsData.items.map((run: SkillGapRunListItem) => (
                    <button
                      key={run.runId}
                      type="button"
                      onClick={() => navigate(`/enterprise/skill-gap/${run.employeeId}`)}
                      className="flex items-center gap-4 rounded-xl border px-4 py-3 text-left transition-colors"
                      style={{ borderColor: 'var(--po-line)', background: 'var(--po-surface)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--po-canvas)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--po-surface)')}
                    >
                      {/* Avatar */}
                      <span
                        className="flex size-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                        style={{ background: 'var(--po-tint)', color: 'var(--po-accent-strong)' }}
                      >
                        {run.employeeName
                          .split(' ')
                          .map((w) => w[0])
                          .join('')
                          .slice(0, 2)}
                      </span>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <strong className="text-[13px] truncate" style={{ color: 'var(--po-ink)' }}>
                            {run.employeeName}
                          </strong>
                          <span className="text-[10px] shrink-0" style={{ color: 'var(--po-muted)' }}>
                            {run.employeeCode}
                          </span>
                        </div>
                        <small className="text-[11px]" style={{ color: 'var(--po-muted)' }}>
                          {run.departmentName ?? '—'} · {run.jobPositionName ?? '—'}
                        </small>
                      </div>

                      {/* Gap info */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-sm tabular-nums font-bold" style={{ color: 'var(--po-ink)' }}>
                            {run.gapCount}
                          </span>
                          <small className="block text-[10px]" style={{ color: 'var(--po-muted)' }}>
                            khoảng trống
                          </small>
                        </div>

                        {run.highCount > 0 && (
                          <span
                            className="rounded-md px-1.5 py-0.5 text-[11px] font-bold"
                            style={{
                              background: '#fff1f2',
                              color: '#be123c',
                              border: '1px solid #fecdd3',
                            }}
                          >
                            {run.highCount} cao
                          </span>
                        )}

                        <span
                          className="font-bold tabular-nums text-sm"
                          style={{
                            color:
                              run.coveragePercent >= 100
                                ? '#16a34a'
                                : run.coveragePercent >= 70
                                  ? '#ca8a04'
                                  : '#dc2626',
                          }}
                        >
                          {run.coveragePercent.toFixed(1)}%
                        </span>

                        <span className="hidden sm:block text-[10px]" style={{ color: 'var(--po-muted)' }}>
                          {formatDateTime(run.generatedAt)}
                        </span>

                        <ArrowRight className="size-4 shrink-0" style={{ color: 'var(--po-muted)' }} />
                      </div>
                    </button>
                  ))}
                </div>

                {/* Pagination */}
                {runsData.totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between text-xs" style={{ color: 'var(--po-muted)' }}>
                    <span>
                      Trang {runsData.pageIndex} / {runsData.totalPages} · {runsData.totalItems} kết quả
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => setPage(page - 1)}
                        className="rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
                        style={{ borderColor: 'var(--po-line)', color: 'var(--po-ink)' }}
                      >
                        ← Trước
                      </button>
                      <button
                        type="button"
                        disabled={page >= runsData.totalPages}
                        onClick={() => setPage(page + 1)}
                        className="rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
                        style={{ borderColor: 'var(--po-line)', color: 'var(--po-ink)' }}
                      >
                        Sau →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>

          {/* At-risk notice */}
          <div
            className="rounded-[18px] border p-5"
            style={{
              borderColor: 'color-mix(in srgb, var(--po-coral) 35%, var(--po-line))',
              background: 'linear-gradient(115deg, color-mix(in srgb, var(--po-coral) 8%, var(--po-surface)), var(--po-surface))',
            }}
          >
            <span
              className="text-[10px] font-black uppercase tracking-[0.1em]"
              style={{ color: 'var(--po-accent)' }}
            >
              Lưu ý
            </span>
            <p className="mt-1 text-[13px]" style={{ color: 'var(--po-ink)' }}>
              <strong>Pending không phải khoảng trống đã xác nhận.</strong>{' '}
              Nhân viên chưa có kết quả đánh giá sẽ hiển thị ở trạng thái Pending — không tính là gap thực tế.
              Cần hoàn thành đánh giá năng lực trước khi so sánh với mục tiêu vị trí.
            </p>
            <div className="mt-3 flex gap-3">
              <Link
                to="/enterprise/workforce"
                className="inline-flex items-center gap-1.5 rounded-xl border px-[14px] py-[9px] text-[12px] font-bold transition-colors hover:opacity-80"
                style={{ borderColor: 'var(--po-line)', color: 'var(--po-accent-strong)' }}
              >
                Xem lực lượng lao động
                <ArrowRight className="size-3.5" />
              </Link>
              <Link
                to="/enterprise/competency-profiles"
                className="inline-flex items-center gap-1.5 text-[12px] font-bold transition-colors hover:opacity-80"
                style={{ color: 'var(--po-muted)' }}
              >
                Hồ sơ năng lực →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
