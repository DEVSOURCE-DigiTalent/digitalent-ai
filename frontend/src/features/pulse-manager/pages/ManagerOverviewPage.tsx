import { useState, type ReactNode } from 'react';
import { ArrowUpRight, ClipboardCheck, FileBarChart, GraduationCap, Layers, TrendingUp, Users } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { LoadingProgress, PageLoading } from '@/components/shared/LoadingState';
import { LoadError } from '@/features/pulse-employee/components/ui';
import { useAssignments } from '@/hooks/use-assignments';
import { useManagedDepartment } from '@/hooks/use-managed-department';
import { PERMISSIONS, usePermission } from '@/hooks/use-permission';
import { usePulseFinalReviews } from '@/hooks/use-pulse';
import { useWorkforce } from '@/hooks/use-workforce';
import { translateUi, useUiLanguage } from '@/lib/i18n';
import { ManagerPage, ManagerPageHeader, NoDepartment } from '../components/ManagerUi';
import { ManagerFrameworkDialog } from './ManagerFrameworkPage';
import { MANAGER_PATHS } from '../lib/paths';
import './manager-overview-chart.css';

interface ChartView {
  id: string;
  label: string;
  path: string;
  icon: ReactNode;
  unit: string;
  ceiling?: number;
  rows: { label: string; value?: number | null }[];
  loading: boolean;
  retry?: () => void;
}

export function ManagerOverviewPage() {
  const locale = useUiLanguage();
  const format = new Intl.NumberFormat(locale);
  const { can } = usePermission();
  const [params, setParams] = useSearchParams();
  const frameworkOpen = can(PERMISSIONS.COMPETENCY_READ) && params.get('framework') === '1';
  function setFramework(open: boolean) {
    const next = new URLSearchParams(params);
    if (open) next.set('framework', '1');
    else next.delete('framework');
    setParams(next, { replace: true, preventScrollReset: true });
  }
  const frameworkButton = can(PERMISSIONS.COMPETENCY_READ) && (
    <button type="button" className="manager-heading-back" aria-haspopup="dialog" onClick={() => setFramework(true)}>
      <Layers size={16} aria-hidden="true" />{translateUi('Khung năng lực chung')}
    </button>
  );
  const { department, isLoading, isError, refetch } = useManagedDepartment();
  const departmentId = department?.id;
  const canPeople = can(PERMISSIONS.EMPLOYEE_READ);
  const canTraining = can(PERMISSIONS.LEARNING_PROGRESS_READ);
  const canGaps = canPeople && can(PERMISSIONS.SKILL_GAP_READ);
  const canReviews = can(PERMISSIONS.DASHBOARD_DEPARTMENT_READ);
  const canReport = canReviews && can(PERMISSIONS.COURSE_ASSIGNMENT_READ);
  const scope = { departmentId, pageIndex: 1, pageSize: 1 } as const;
  const activeScope = { ...scope, status: 'ACTIVE' } as const;
  const learning = useWorkforce({ ...activeScope, learning: 'ACTIVE' }, Boolean(departmentId && canPeople && canTraining));
  const gaps = useWorkforce({ ...activeScope, gap: 'ANY' }, Boolean(departmentId && canGaps));
  const unknown = useWorkforce({ ...activeScope, gap: 'UNKNOWN' }, Boolean(departmentId && canGaps));
  const reviews = usePulseFinalReviews({ enabled: Boolean(departmentId && canReviews), departmentId, includeReviewed: true });
  const completed = useAssignments({ ...scope, status: 'COMPLETED', includeIndependentLearning: true }, Boolean(departmentId && canReport));
  const overdue = useAssignments({ ...scope, overdue: true }, Boolean(departmentId && canReport));

  if (isLoading) return <ManagerPage><PageLoading label="Đang tải tổng quan" /></ManagerPage>;
  if (isError) return <ManagerPage><LoadError message="Không tải được phòng ban bạn phụ trách." onRetry={refetch} /></ManagerPage>;
  if (!department) return <ManagerPage><ManagerPageHeader title="Tổng quan phòng ban" actions={frameworkButton} /><NoDepartment /><ManagerFrameworkDialog open={frameworkOpen} onClose={() => setFramework(false)} /></ManagerPage>;

  const active = department.headcount;
  const learningCount = learning.isPlaceholderData ? undefined : learning.data?.totalItems;
  const final = reviews.data?.items.filter((item) => item.kind === 'FINAL');
  const views: ChartView[] = [];
  if (canPeople) views.push({
    id: 'people', label: 'Nhân viên', path: MANAGER_PATHS.members, icon: <Users size={17} />, unit: 'nhân viên',
    rows: [{ label: 'Đang làm việc', value: active }], loading: false, ceiling: active,
  });
  if (canGaps) views.push({
    id: 'capability', label: 'Năng lực đội ngũ', path: MANAGER_PATHS.capability, icon: <TrendingUp size={17} />, unit: 'nhân viên',
    rows: [
      { label: 'Có khoảng trống năng lực', value: gaps.isPlaceholderData ? undefined : gaps.data?.totalItems },
      { label: 'Chưa đối chiếu', value: unknown.isPlaceholderData ? undefined : unknown.data?.totalItems },
    ],
    ceiling: active, loading: gaps.isLoading || unknown.isLoading || gaps.isPlaceholderData || unknown.isPlaceholderData,
    retry: gaps.isError || unknown.isError ? () => { void gaps.refetch(); void unknown.refetch(); } : undefined,
  });
  if (canReviews) views.push({
    id: 'reviews', label: 'Kết quả bài làm', path: MANAGER_PATHS.finalReviews, icon: <ClipboardCheck size={17} />, unit: 'bài cuối khóa',
    rows: [
      { label: 'Chờ đánh giá', value: final?.filter(({ status }) => status === 'PENDING').length },
      { label: 'Cần hỗ trợ', value: final?.filter(({ status }) => status === 'FLAGGED' || status === 'DEADLINE_MISSED').length },
      { label: 'Đạt', value: final?.filter(({ status }) => status === 'APPROVED').length },
    ],
    loading: reviews.isLoading, retry: reviews.isError ? reviews.refetch : undefined,
  });
  if (canPeople && canTraining) views.push({
    id: 'training', label: 'Đào tạo đội ngũ', path: MANAGER_PATHS.training, icon: <GraduationCap size={17} />, unit: 'nhân viên',
    rows: [
      { label: 'Đang có khóa học', value: learningCount },
      { label: 'Không có khóa đang học', value: active != null && learningCount != null && active >= learningCount ? active - learningCount : undefined },
    ],
    ceiling: active, loading: learning.isLoading || learning.isPlaceholderData, retry: learning.isError ? learning.refetch : undefined,
  });
  if (canReport) views.push({
    id: 'reports', label: 'Báo cáo chu kỳ', path: MANAGER_PATHS.reports, icon: <FileBarChart size={17} />, unit: 'lượt học',
    rows: [
      { label: 'Đã hoàn thành', value: completed.isPlaceholderData ? undefined : completed.data?.totalItems },
      { label: 'Quá hạn', value: overdue.isPlaceholderData ? undefined : overdue.data?.totalItems },
    ],
    loading: completed.isLoading || overdue.isLoading || completed.isPlaceholderData || overdue.isPlaceholderData,
    retry: completed.isError || overdue.isError ? () => { void completed.refetch(); void overdue.refetch(); } : undefined,
  });

  const highlights = views.filter(({ id }) => ['people', 'capability', 'reviews', 'reports'].includes(id));
  const attention = views.flatMap((view) => {
    if (view.loading || view.retry) return [];
    if (view.id === 'reviews') return view.rows.slice(0, 2).map((row) => ({ ...row, path: view.path }));
    if (view.id === 'reports') return [{ ...view.rows[1], path: view.path }];
    return [];
  }).filter(({ value }) => value != null && value > 0);
  const coverage = active != null && active > 0 && learningCount != null && learningCount <= active
    ? learningCount / active
    : undefined;
  const percent = new Intl.NumberFormat(locale, { style: 'percent' });
  const display = (value?: number | null) => value == null ? '—' : format.format(value);

  return (
    <ManagerPage testId="manager-overview">
      <ManagerPageHeader featured scope={department.name} title="Tổng quan phòng ban"
        subtitle="Theo dõi nhân sự, năng lực và kết quả đào tạo của đội ngũ."
        actions={<>{frameworkButton}{canPeople && canTraining && (
          <Link to={MANAGER_PATHS.training} className="manager-dashboard-coverage">
            <span className="manager-dashboard-ring">
              <svg viewBox="0 0 44 44" aria-hidden="true">
                <circle cx="22" cy="22" r="18" />
                <circle cx="22" cy="22" r="18" pathLength="100" strokeDasharray={`${100 * (coverage ?? 0)} 100`} />
              </svg>
              <strong>{coverage == null ? '—' : percent.format(coverage)}</strong>
            </span>
            <span>{translateUi('Nhân viên đang có khóa học')}
              {coverage != null && <small>{display(learningCount)} / {display(active)} {translateUi('nhân viên')}</small>}
            </span>
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        )}</>} />
      <ManagerFrameworkDialog open={frameworkOpen} onClose={() => setFramework(false)} />

      {highlights.length > 0 && (
        <section className="manager-dashboard-stats" aria-label={translateUi('Tóm tắt phòng ban')}>
          {highlights.map(({ id, label, path, icon, rows, loading }) => (
            <Link key={id} to={path} className="manager-dashboard-stat" data-metric={id} aria-busy={loading}>
              <span className="manager-dashboard-stat-icons"><span>{icon}</span><ArrowUpRight size={16} aria-hidden="true" /></span>
              <span>{translateUi(label)}</span>
              <strong>{display(rows[0].value)}</strong>
              <small>{translateUi(rows[0].label)}</small>
            </Link>
          ))}
        </section>
      )}

      {views.length > 0 && (
        <div className="manager-dashboard-grid" data-attention={attention.length > 0}>
          <DepartmentChart key={department.id} views={views} />
          {attention.length > 0 && (
            <section className="manager-dashboard-attention" aria-labelledby="manager-attention-title">
              <h2 id="manager-attention-title">{translateUi('Cần theo dõi')}</h2>
              <ul role="list">
                {attention.map(({ label, value, path }) => (
                  <li key={label}>
                    <Link to={path}><strong>{display(value)}</strong><span>{translateUi(label)}</span><ArrowUpRight size={16} aria-hidden="true" /></Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </ManagerPage>
  );
}

function DepartmentChart({ views }: { views: ChartView[] }) {
  const [selected, setSelected] = useState('training');
  const view = views.find(({ id }) => id === selected) ?? views[0];
  const max = Math.max(1, view.ceiling ?? 0, ...view.rows.map(({ value }) => value ?? 0));
  const format = new Intl.NumberFormat(useUiLanguage());

  return (
    <section className="manager-overview-chart" aria-labelledby="department-chart-title">
      <header>
        <h2 id="department-chart-title">{translateUi('Chỉ số phòng ban')}</h2>
        <Link to={view.path}>{translateUi('Mở trang')} · {translateUi(view.label)}<ArrowUpRight size={16} aria-hidden="true" /></Link>
      </header>
      <div className="manager-overview-chart__filters" role="group" aria-label={translateUi('Chọn nhóm chỉ số')}>
        {views.map(({ id, label, icon }) => (
          <button type="button" key={id} aria-pressed={view.id === id} onClick={() => setSelected(id)}>{icon}{translateUi(label)}</button>
        ))}
      </div>
      <div className="manager-overview-chart__plot" key={view.id} aria-busy={view.loading}>
        <p className="manager-overview-chart__unit">{translateUi(view.unit)}</p>
        <ul role="list">
          {view.rows.map(({ label, value }) => (
            <li key={label}>
              <div><span>{translateUi(label)}</span><strong>{value == null ? <><span aria-hidden="true">—</span><span className="sr-only">{translateUi(view.loading ? 'Đang tải số liệu…' : 'Chưa có số liệu')}</span></> : format.format(value)}</strong></div>
              <div className="manager-overview-chart__track" aria-hidden="true"><span style={{ width: `${(value ?? 0) / max * 100}%` }} /></div>
            </li>
          ))}
        </ul>
        {view.loading && <LoadingProgress label="Đang tải số liệu…" />}
        {view.retry && <LoadError message="Không tải được số liệu." onRetry={view.retry} />}
      </div>
    </section>
  );
}
