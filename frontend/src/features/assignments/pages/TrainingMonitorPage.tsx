import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { PageHeader, ScoreCard } from '@/components/shared';
import { useAssignmentSummary, useAssignments } from '@/hooks/use-assignments';
import { useDepartments } from '@/hooks/use-departments';
import { useJobPositions } from '@/hooks/use-job-positions';
import type { AssignmentStatus } from '@/services/assignment.service';
import { OwnerFilterSelect } from '@/features/organization/components/OwnerFilterSelect';
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
  useUiLanguage();
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
        title={translateUi(isManager ? 'Tiến độ đào tạo nhóm' : 'Theo dõi đào tạo')}
        subtitle={translateUi(isManager ? 'Theo dõi tiến độ học tập, hạn hoàn thành và học viên cần đôn đốc trong nhóm phụ trách' : undefined)}
      />

      {summary && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <ScoreCard label="Đang hiệu lực" value={summary.total} subtitle={translateUi(`${summary.completed} đã hoàn thành`)} />
            <ScoreCard label={translateUi("Đang học")} value={summary.inProgress} />
            <ScoreCard label={translateUi("Chờ đánh giá")} value={summary.readyForAssessment} />
            <ScoreCard
              label={translateUi("Tỷ lệ hoàn thành")}
              value={`${summary.completionRate}%`}
              variant={summary.completionRate >= 70 ? 'success' : 'default'}
            />
            <ScoreCard
              label="Quá hạn"
              value={summary.overdue}
              variant={summary.overdue > 0 ? 'danger' : 'success'}
              subtitle={translateUi(summary.dueSoon > 0 ? translateUi(`${summary.dueSoon} sắp đến hạn`) : undefined)}
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
                      aria-label={translateUi(`Tiến độ trung bình của ${d.name}`)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={d.averageProgress}
                      className="h-2 overflow-hidden rounded-full bg-slate-100"
                    >
                      <div className="h-full rounded-full bg-primary-600" style={{ width: `${d.averageProgress}%` }} />
                    </div>
                    <span className="text-xs tabular-nums text-slate-600">
                      {d.averageProgress}% · {d.completed}/{d.total} xong{d.overdue > 0 ? translateUi(` · ${d.overdue} quá hạn`) : ''}
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
            <OwnerFilterSelect label={translateUi("Lọc theo trạng thái")} value={status} onChange={(value) => { setStatus(value as AssignmentStatus | ''); setPage(1); }} options={[{ value: '', label: 'Tất cả trạng thái' }, ...((import.meta.env.VITE_USE_MOCK === 'true' ? ['NOT_STARTED', 'IN_PROGRESS', 'READY_FOR_ASSESSMENT', 'COMPLETED'] : ['ACTIVE', 'CANCELLED']) as AssignmentStatus[]).map((s) => ({ value: s, label: ASSIGNMENT_STATUS_LABELS[s] }))]} />

            {!isManager && (
              <OwnerFilterSelect label={translateUi("Lọc theo phòng ban")} value={departmentId} onChange={(value) => { setDepartmentId(value); setPage(1); }} options={[{ value: '', label: 'Mọi phòng ban' }, ...departments.map((d) => ({ value: d.id, label: d.name }))]} />
            )}

            <OwnerFilterSelect label="Lọc theo vị trí" value={jobPositionId} onChange={(value) => { setJobPositionId(value); setPage(1); }} options={[{ value: '', label: 'Mọi vị trí' }, ...positions.map((p) => ({ value: p.id, label: p.name }))]} />

            {import.meta.env.VITE_USE_MOCK === 'true' && <OwnerFilterSelect label={translateUi("Lọc theo cấp bậc")} value={jobGrade} onChange={(value) => { setJobGrade(value as JobGradeCode | ''); setPage(1); }} options={[{ value: '', label: 'Mọi cấp bậc' }, ...JOB_GRADES.map((code) => ({ value: code, label: `Cấp bậc ${code} (${JOB_GRADE_DEFAULT_NAMES[code]})` }))]} />}

            <OwnerFilterSelect label="Lọc theo hạn" value={quick} onChange={(value) => { setQuick(value as Quick); setPage(1); }} options={[{ value: '', label: 'Mọi hạn' }, { value: 'overdue', label: 'Quá hạn' }, { value: 'dueSoon', label: 'Sắp đến hạn (7 ngày)' }]} />
          </>
        }
        pageInfo={{ page, pageSize: PAGE_SIZE, total: data?.totalItems ?? 0, onPageChange: setPage }}
      />
    </div>
  );
}

