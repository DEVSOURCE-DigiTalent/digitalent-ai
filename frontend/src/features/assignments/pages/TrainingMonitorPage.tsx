import { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { PageHeader, ScoreCard } from '@/components/shared';
import { useAssignmentSummary, useAssignments } from '@/hooks/use-assignments';
import { useDepartments } from '@/hooks/use-departments';
import { useJobPositions } from '@/hooks/use-job-positions';
import type { AssignmentStatus } from '@/services/assignment.service';
import { INPUT_CLASS } from '@/features/onboarding/components/styles';
import { JOB_GRADES, JOB_GRADE_DEFAULT_NAMES, type JobGradeCode } from '@/lib/terms';
import { ASSIGNMENT_STATUS_LABELS } from '../assignment-labels';
import { AssignmentsTable } from '../components/AssignmentsTable';

const PAGE_SIZE = 15;
type Quick = '' | 'overdue' | 'dueSoon';

interface TrainingMonitorPageProps {
  /** If provided or if path is /enterprise/team/training, renders in manager scope context. */
  isManagerScope?: boolean;
}

/**
 * OW-30 / MG-06: Training Monitor.
 * Real-time monitoring of course progress, deadlines, overdue items with filters by Dept, Position, and Job Grade (G1–G3).
 */
export function TrainingMonitorPage({ isManagerScope: propIsManager }: TrainingMonitorPageProps) {
  const location = useLocation();
  const isManager = propIsManager ?? location.pathname.includes('/team/training');

  const { data: summary } = useAssignmentSummary();
  const departments = useDepartments({ pageSize: 100, status: 'ACTIVE' }).data?.items ?? [];
  const { data: positionsData } = useJobPositions({ pageSize: 100 });
  const positions = positionsData?.items ?? [];

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<AssignmentStatus | ''>('');
  const [quick, setQuick] = useState<Quick>('');
  const [departmentId, setDepartmentId] = useState('');
  const [jobPositionId, setJobPositionId] = useState('');
  const [jobGrade, setJobGrade] = useState<JobGradeCode | ''>('');
  const [page, setPage] = useState(1);

  // Mock data supports a local grade filter; BE2 only accepts jobPositionId.
  const positionByName = useMemo(() => new Map(positions.map((p) => [p.name, p])), [positions]);

  const { data, isLoading } = useAssignments({
    pageIndex: page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    status: status || undefined,
    departmentId: departmentId || undefined,
    jobPositionId: jobPositionId || undefined,
    overdue: quick === 'overdue' || undefined,
    dueSoon: quick === 'dueSoon' || undefined,
  });

  const pick = (next: Quick) => {
    setQuick(quick === next ? '' : next);
    setPage(1);
  };

  // Grade filtering is available only in mock mode; the live API has no grade filter.
  const displayedRows = useMemo(() => {
    const rows = data?.items ?? [];
    if (import.meta.env.VITE_USE_MOCK !== 'true' || !jobGrade) return rows;
    return rows.filter((r) => {
      const pos = r.positionName ? positionByName.get(r.positionName) : undefined;
      return pos?.jobGrade === jobGrade;
    });
  }, [data?.items, jobGrade, positionByName]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={isManager ? 'Tiến độ đào tạo nhóm' : 'Theo dõi đào tạo'}
        subtitle={
          isManager
            ? 'Theo dõi tiến độ học tập, hạn hoàn thành và học viên cần đôn đốc trong nhóm phụ trách'
            : 'Tiến độ, hạn hoàn thành và những người đang chậm trên toàn tổ chức'
        }
      />

      {summary && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <ScoreCard label="Đang hiệu lực" value={summary.total} subtitle={`${summary.completed} đã hoàn thành`} />
            <ScoreCard label="Đang học" value={summary.inProgress} />
            <ScoreCard label="Chờ đánh giá" value={summary.readyForAssessment} />
            <ScoreCard
              label="Tỷ lệ hoàn thành"
              value={`${summary.completionRate}%`}
              variant={summary.completionRate >= 70 ? 'success' : 'default'}
            />
            <ScoreCard
              label="Quá hạn"
              value={summary.overdue}
              variant={summary.overdue > 0 ? 'danger' : 'success'}
              subtitle={summary.dueSoon > 0 ? `${summary.dueSoon} sắp đến hạn` : undefined}
              onClick={summary.overdue > 0 ? () => pick('overdue') : undefined}
            />
          </div>

          {summary.byDepartment.length > 0 && !isManager && (
            <section aria-labelledby="dept-title" className="rounded-lg border border-slate-200 bg-white p-5">
              <h2 id="dept-title" className="mb-3 text-base font-semibold text-slate-900">
                Tiến độ theo phòng ban
              </h2>
              <ul className="grid gap-3">
                {summary.byDepartment.map((d) => (
                  <li key={d.departmentId} className="grid items-center gap-2 text-sm sm:grid-cols-[10rem_1fr_auto]">
                    <span className="font-medium text-slate-800">{d.name}</span>
                    <div
                      role="progressbar"
                      aria-label={`Tiến độ trung bình của ${d.name}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={d.averageProgress}
                      className="h-2 overflow-hidden rounded-full bg-slate-100"
                    >
                      <div className="h-full rounded-full bg-primary-600" style={{ width: `${d.averageProgress}%` }} />
                    </div>
                    <span className="text-xs tabular-nums text-slate-600">
                      {d.averageProgress}% · {d.completed}/{d.total} xong{d.overdue > 0 ? ` · ${d.overdue} quá hạn` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <AssignmentsTable
        rows={displayedRows}
        isLoading={isLoading}
        employeeLinkPrefix={isManager ? '/enterprise/team/members' : undefined}
        assignmentLinkPrefix={isManager ? '/enterprise/team/training' : undefined}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        filters={
          <>
            <select
              aria-label="Lọc theo trạng thái"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as AssignmentStatus | '');
                setPage(1);
              }}
              className={INPUT_CLASS}
            >
              <option value="">Tất cả trạng thái</option>
              {((import.meta.env.VITE_USE_MOCK === 'true'
                ? ['NOT_STARTED', 'IN_PROGRESS', 'READY_FOR_ASSESSMENT', 'COMPLETED']
                : ['ACTIVE', 'CANCELLED']) as AssignmentStatus[]).map((s) => (
                <option key={s} value={s}>
                  {ASSIGNMENT_STATUS_LABELS[s]}
                </option>
              ))}
            </select>

            {!isManager && (
              <select
                aria-label="Lọc theo phòng ban"
                value={departmentId}
                onChange={(e) => {
                  setDepartmentId(e.target.value);
                  setPage(1);
                }}
                className={INPUT_CLASS}
              >
                <option value="">Mọi phòng ban</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            )}

            <select
              aria-label="Lọc theo vị trí"
              value={jobPositionId}
              onChange={(e) => {
                setJobPositionId(e.target.value);
                setPage(1);
              }}
              className={INPUT_CLASS}
            >
              <option value="">Mọi vị trí</option>
              {positions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {import.meta.env.VITE_USE_MOCK === 'true' && <select
              aria-label="Lọc theo cấp bậc"
              value={jobGrade}
              onChange={(e) => {
                setJobGrade(e.target.value as JobGradeCode | '');
                setPage(1);
              }}
              className={INPUT_CLASS}
            >
              <option value="">Mọi cấp bậc</option>
              {JOB_GRADES.map((code) => (
                <option key={code} value={code}>
                  Cấp bậc {code} ({JOB_GRADE_DEFAULT_NAMES[code]})
                </option>
              ))}
            </select>}

            <select
              aria-label="Lọc theo hạn"
              value={quick}
              onChange={(e) => {
                setQuick(e.target.value as Quick);
                setPage(1);
              }}
              className={INPUT_CLASS}
            >
              <option value="">Mọi hạn</option>
              <option value="overdue">Quá hạn</option>
              <option value="dueSoon">Sắp đến hạn (7 ngày)</option>
            </select>
          </>
        }
        pageInfo={{ page, pageSize: PAGE_SIZE, total: data?.totalItems ?? 0, onPageChange: setPage }}
      />
    </div>
  );
}

