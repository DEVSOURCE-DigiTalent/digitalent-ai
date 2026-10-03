import { Link } from 'react-router-dom';
import { DataTable, type Column } from '@/components/shared';
import { formatDate } from '@/lib/utils';
import type { AssignmentRow } from '@/services/assignment.service';
import { SECONDARY_BUTTON } from '@/features/onboarding/components/styles';
import { AssignmentStatusBadge } from '../assignment-labels';

interface AssignmentsTableProps {
  rows: AssignmentRow[];
  isLoading: boolean;
  /** Shows a cancel button on open assignments. */
  onCancel?: (assignment: AssignmentRow) => void;
  /** Toolbar parts passed through to the table. */
  search: string;
  onSearchChange: (value: string) => void;
  filters: React.ReactNode;
  toolbarActions?: React.ReactNode;
  pageInfo: { page: number; pageSize: number; total: number; onPageChange: (page: number) => void };
  /** Where a name leads; none for roles that cannot open the capability page. */
  employeeLink?: boolean;
}

/** The list of course assignments shared by the assignment and the training monitor screens. */
export function AssignmentsTable({ rows, isLoading, onCancel, search, onSearchChange, filters, toolbarActions, pageInfo, employeeLink = true }: AssignmentsTableProps) {
  const columns: Column<AssignmentRow>[] = [
    {
      key: 'employee',
      header: 'Nhân viên',
      cell: (a) => (
        <div>
          {employeeLink ? (
            <Link to={`/enterprise/members/${a.employeeId}`} className="font-medium text-slate-900 hover:underline">{a.employeeName}</Link>
          ) : (
            <span className="font-medium text-slate-900">{a.employeeName}</span>
          )}
          <p className="text-xs text-slate-500">{a.departmentName}</p>
        </div>
      ),
    },
    {
      key: 'course',
      header: 'Khóa học',
      cell: (a) => (
        <div>
          <p className="text-slate-900">{a.courseTitle}</p>
          <p className="font-mono text-xs text-slate-500">{a.courseCode}{a.source === 'RECOMMENDATION' ? ' · từ đề xuất' : ''}</p>
        </div>
      ),
    },
    {
      key: 'progress',
      header: 'Tiến độ',
      cell: (a) => (
        <div className="flex items-center gap-2">
          <div role="progressbar" aria-label={`Tiến độ của ${a.employeeName}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={a.progressPercent} className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-primary-600" style={{ width: `${a.progressPercent}%` }} />
          </div>
          <span className="text-xs tabular-nums text-slate-600">{a.progressPercent}%</span>
        </div>
      ),
    },
    { key: 'due', header: 'Hạn', cell: (a) => formatDate(a.dueDate), hideOnMobile: true },
    { key: 'status', header: 'Trạng thái', cell: (a) => <AssignmentStatusBadge assignment={a} /> },
  ];

  if (onCancel) {
    columns.push({
      key: 'actions',
      header: '',
      className: 'text-right',
      cell: (a) =>
        a.status === 'COMPLETED' || a.status === 'CANCELLED' ? null : (
          <button type="button" onClick={() => onCancel(a)} className={SECONDARY_BUTTON} aria-label={`Hủy khóa ${a.courseCode} của ${a.employeeName}`}>
            Hủy giao
          </button>
        ),
    });
  }

  return (
    <DataTable
      columns={columns}
      data={rows}
      keyExtractor={(a) => a.id}
      isLoading={isLoading}
      searchValue={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Tìm theo nhân viên hoặc khóa học"
      filters={filters}
      toolbarActions={toolbarActions}
      emptyTitle="Chưa có lượt giao khóa học nào"
      emptyDescription="Giao khóa học cho nhân viên hoặc nhận một đề xuất học tập để bắt đầu."
      pageInfo={pageInfo}
    />
  );
}
