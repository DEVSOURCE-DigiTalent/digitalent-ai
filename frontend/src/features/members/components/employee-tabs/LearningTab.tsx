import { useState } from 'react';
import { BookOpen, CalendarDays } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { AssignmentStatusBadge } from '@/features/assignments/assignment-labels';
import type { AssignmentRow } from '@/services/assignment.service';
import { MemberTabEmpty, MemberTabHeader, MemberTabPager } from './MemberTabUi';

interface LearningTabProps { assignments: AssignmentRow[]; readOnly?: boolean }
const PAGE_SIZE = 6;
export function LearningTab({ assignments }: LearningTabProps) {
  const [page, setPage] = useState(1);
  const safePage = Math.min(page, Math.max(1, Math.ceil(assignments.length / PAGE_SIZE)));
  return <div><MemberTabHeader title="Khóa học được giao" count={assignments.length} icon={<BookOpen size={21} />} />
    {assignments.length === 0 ? <MemberTabEmpty title="Chưa có khóa học" description="Các khóa học được giao sẽ hiển thị cùng tiến độ tại đây." icon={<BookOpen size={27} />} /> : <>
      <div className="member-tab-grid">{assignments.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE).map((a) => <article key={a.id} className="member-tab-card"><div className="member-tab-card-head"><div><span className="member-tab-code">{a.courseCode}</span><h3 style={{ marginTop: 9 }}>{a.courseTitle}</h3></div><AssignmentStatusBadge assignment={a} /></div><div className="member-tab-meta"><span><CalendarDays size={14} />{a.dueDate ? `Hạn ${formatDate(a.dueDate)}` : 'Không giới hạn'}</span><strong>{a.progressPercent}% hoàn thành</strong></div><div className="member-tab-progress" aria-label={`Tiến độ ${a.progressPercent}%`}><span style={{ width: `${Math.max(0, Math.min(100, a.progressPercent))}%` }} /></div></article>)}</div>
      <MemberTabPager page={safePage} total={assignments.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
    </>}
  </div>;
}
