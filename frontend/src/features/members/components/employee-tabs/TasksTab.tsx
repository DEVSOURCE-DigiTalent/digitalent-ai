import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useState } from 'react';
import { CalendarDays, ListChecks } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { PracticalTaskRecord } from '@/services/mock/server/types-work';
import { MemberTabEmpty, MemberTabHeader, MemberTabPager, MemberTabPageSize } from './MemberTabUi';

interface TasksTabProps { tasks?: PracticalTaskRecord[]; competencyCodes?: Record<string, string>; readOnly?: boolean }
const STATUS_LABELS: Record<string, { label: string; color: string }> = { ACTIVE: { label: 'Đang thực hiện', color: '#2679b8' }, ARCHIVED: { label: 'Đã lưu trữ', color: '#64748b' }, ASSIGNED: { label: 'Đã giao', color: '#2679b8' }, SUBMITTED: { label: 'Chờ đánh giá', color: '#b87516' }, EVALUATED: { label: 'Đã đánh giá', color: '#13836b' }, OVERDUE: { label: 'Quá hạn', color: '#c04f41' }, NEEDS_REVISION: { label: 'Cần chỉnh sửa', color: '#b87516' }, PASSED: { label: 'Đã đạt', color: '#13836b' }, FAILED: { label: 'Không đạt', color: '#c04f41' }, CANCELLED: { label: 'Đã hủy', color: '#64748b' } };
export function TasksTab({ tasks = [], competencyCodes }: TasksTabProps) {
  useUiLanguage();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const safePage = Math.min(page, Math.max(1, Math.ceil(tasks.length / pageSize)));
  return <div><MemberTabHeader title={translateUi("Nhiệm vụ thực tế")} count={tasks.length} icon={<ListChecks size={21} />} actions={<MemberTabPageSize value={pageSize} onChange={(size) => { setPageSize(size); setPage(1); }} />} />
    {tasks.length === 0 ? <MemberTabEmpty title="Chưa có nhiệm vụ" description="Nhiệm vụ được giao và kết quả đánh giá sẽ hiển thị tại đây." icon={<ListChecks size={27} />} /> : <>
      <div className="member-tab-grid">{tasks.slice((safePage - 1) * pageSize, safePage * pageSize).map((task) => { const status = STATUS_LABELS[task.status] ?? { label: task.status, color: '#64748b' }; return <article key={task.id} className="member-tab-card"><div className="member-tab-card-head"><h3>{translateUi(task.title)}</h3><span style={{ color: status.color, fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap' }}>{translateUi(status.label)}</span></div>{task.description && <p style={{ margin: '8px 0 0' }} className="line-clamp-2">{translateUi(task.description)}</p>}<div className="member-tab-meta"><span><CalendarDays size={14} />{task.dueDate ? translateUi(`Hạn ${formatDate(task.dueDate)}`) : 'Không đặt hạn'}</span>{task.competencyIds?.length > 0 && <span>Năng lực: {task.competencyIds.map((id) => competencyCodes?.[id] ?? id).join(', ')}</span>}</div></article>; })}</div>
      <MemberTabPager page={safePage} total={tasks.length} pageSize={pageSize} onPageChange={setPage} />
    </>}
  </div>;
}
