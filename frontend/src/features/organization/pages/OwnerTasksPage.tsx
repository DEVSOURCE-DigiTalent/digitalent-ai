import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ClipboardList, Clock3, Plus, Search, Users } from 'lucide-react';
import { usePracticalTasks } from '@/hooks/use-tasks';
import { useAllActiveCompetencies } from '@/hooks/use-competencies';
import { useCurrentUser } from '@/hooks/use-current-user';
import { PERMISSIONS } from '@/hooks/use-permission';
import { formatDate } from '@/lib/utils';
import type { PracticalTaskDto } from '@/services/task.service';
import { OwnerFilterSelect } from '../components/OwnerFilterSelect';
import { PULSE_TOKENS } from '../owner-theme';
import { SectionLoading } from '@/components/shared/LoadingState';
import './owner-operations.css';

function TaskCard({ task, competencyMap }: { task: PracticalTaskDto; competencyMap: Map<string, string> }) {
  const total = task.assignedEmployeesCount;
  const submitted = task.submissionsCount ?? 0;
  const percent = total > 0 ? Math.min(100, Math.round(submitted / total * 100)) : 0;
  return <Link className="owner-operations__task" to={`/enterprise/tasks/${task.id}`}>
    <div className="owner-operations__task-head"><span className="owner-operations__task-icon"><ClipboardList size={19} /></span><span className={`owner-operations__badge ${task.status === 'ACTIVE' ? 'is-active' : ''}`}>{task.status === 'ACTIVE' ? 'Đang mở' : 'Đã đóng'}</span></div>
    <h3>{task.title}</h3>
    <div className="owner-operations__task-tags">{task.targetLevel > 0 && <span>Cấp {task.targetLevel}</span>}{task.competencyIds.slice(0, 2).map((id) => <span key={id}>{competencyMap.get(id) ?? id.slice(0, 8)}</span>)}{task.competencyIds.length > 2 && <span>+{task.competencyIds.length - 2}</span>}</div>
    <div className="owner-operations__task-meta"><span><Users size={15} /> {total} nhân sự</span>{task.dueDate && <span><Clock3 size={15} /> {formatDate(task.dueDate)}</span>}</div>
    <div className="owner-operations__progress"><span style={{ width: `${percent}%` }} /></div>
    <div className="owner-operations__task-bottom"><span>{submitted}/{total} đã nộp</span><span>{(task.pendingReviewCount ?? 0) > 0 ? `${task.pendingReviewCount} chờ chấm` : `${task.approvedCount ?? 0} đạt`}</span><ArrowRight size={17} /></div>
  </Link>;
}

export function OwnerTasksPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const canCreate = useCurrentUser((state) => state.hasPermission(PERMISSIONS.TASK_CREATE));
  const { data, isLoading } = usePracticalTasks({ search: search.trim() || undefined, status: statusFilter || undefined, pageIndex, pageSize: 9 });
  const { data: competencies = [] } = useAllActiveCompetencies();
  const competencyMap = new Map(competencies.map((item) => [item.id, item.frameworkCode ? `TT02-${item.frameworkCode}` : item.code]));
  const tasks = data?.items ?? [];
  return <div className="po-owner owner-operations -m-4 md:-m-6 min-h-screen" style={PULSE_TOKENS}><main className="owner-operations__shell">
    <header className="owner-operations__header"><div><span className="owner-operations__eyebrow">ÁP DỤNG NĂNG LỰC</span><h1>Nhiệm vụ thực tế</h1></div><div className="owner-operations__actions"><Link className="owner-operations__secondary" to="/enterprise/reviews"><CheckCircle2 size={18} /> Hàng chờ chấm</Link>{canCreate && <Link className="owner-operations__primary" to="/enterprise/tasks/new"><Plus size={18} /> Giao nhiệm vụ</Link>}</div></header>
    <section className="owner-operations__panel"><div className="owner-operations__section-head"><div><h2>Danh sách nhiệm vụ</h2><p>{data?.totalItems ?? 0} nhiệm vụ</p></div><span className="owner-operations__section-hint">Chọn một nhiệm vụ để xem bài nộp và tiêu chí đánh giá</span></div>
      <div className="owner-operations__filters"><label className="owner-operations__search owner-filter-search"><Search size={18} /><input type="search" aria-label="Tìm nhiệm vụ" placeholder="Tìm theo tên nhiệm vụ" value={search} onChange={(event) => { setSearch(event.target.value); setPageIndex(1); }} /></label><OwnerFilterSelect label="Lọc trạng thái" value={statusFilter} onChange={(value) => { setStatusFilter(value); setPageIndex(1); }} options={[{ value: '', label: 'Tất cả trạng thái' }, { value: 'ACTIVE', label: 'Đang mở' }, { value: 'ARCHIVED', label: 'Đã đóng' }]} /></div>
      {isLoading ? <SectionLoading label="Đang tải nhiệm vụ" /> : tasks.length === 0 ? <div className="owner-operations__empty"><ClipboardList size={36} /><h3>{search || statusFilter ? 'Không có nhiệm vụ phù hợp' : 'Chưa có nhiệm vụ'}</h3><p>{search || statusFilter ? 'Thử thay đổi bộ lọc hoặc từ khóa.' : 'Giao nhiệm vụ để bắt đầu thu thập minh chứng thực tế.'}</p>{canCreate && <Link to="/enterprise/tasks/new">Giao nhiệm vụ <ArrowRight size={16} /></Link>}</div> : <div className="owner-operations__grid">{tasks.map((task) => <TaskCard key={task.id} task={task} competencyMap={competencyMap} />)}</div>}
      {(data?.totalPages ?? 0) > 1 && <div className="owner-operations__pagination"><span>Trang {pageIndex} / {data?.totalPages}</span><button type="button" disabled={pageIndex <= 1} onClick={() => setPageIndex((page) => page - 1)}>Trước</button><button type="button" disabled={pageIndex >= (data?.totalPages ?? 1)} onClick={() => setPageIndex((page) => page + 1)}>Sau</button></div>}
    </section>
    <div className="owner-operations__footnote"><CheckCircle2 size={17} /><span>Minh chứng đã nộp được đánh giá tại</span><Link to="/enterprise/reviews">Hàng chờ chấm <ArrowRight size={15} /></Link></div>
  </main></div>;
}
