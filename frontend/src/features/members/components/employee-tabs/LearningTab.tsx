import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CalendarDays } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { AssignmentStatusBadge } from '@/features/assignments/assignment-labels';
import type { AssignmentRow } from '@/services/assignment.service';
import { MemberTabEmpty, MemberTabHeader, MemberTabPager, MemberTabPageSize } from './MemberTabUi';

interface LearningTabProps { assignments: AssignmentRow[]; readOnly?: boolean }
export function LearningTab({ assignments }: LearningTabProps) {
  useUiLanguage();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const safePage = Math.min(page, Math.max(1, Math.ceil(assignments.length / pageSize)));
  return <div><MemberTabHeader title="Khóa học được giao" count={assignments.length} icon={<BookOpen size={21} />} actions={<MemberTabPageSize value={pageSize} onChange={(size) => { setPageSize(size); setPage(1); }} />} />
    {assignments.length === 0 ? <MemberTabEmpty title={translateUi("Chưa có khóa học")} description="Các khóa học được giao sẽ hiển thị cùng tiến độ tại đây." icon={<BookOpen size={27} />} /> : <>
      <div className="member-tab-grid">{assignments.slice((safePage - 1) * pageSize, safePage * pageSize).map((a) => <article key={a.id} className="member-tab-card"><div className="member-tab-card-head"><div><span className="member-tab-code">{a.courseCode}</span><h3 style={{ marginTop: 9 }}>{a.courseTitle}</h3></div><AssignmentStatusBadge assignment={a} /></div><div className="member-tab-meta"><span><CalendarDays size={14} />{a.dueDate ? translateUi(`Hạn ${formatDate(a.dueDate)}`) : 'Không giới hạn'}</span><strong>{a.progressPercent}% hoàn thành</strong></div><div className="member-tab-progress" aria-label={translateUi(`Tiến độ ${a.progressPercent}%`)}><span style={{ width: `${Math.max(0, Math.min(100, a.progressPercent))}%` }} /></div>{a.courseId && <Link className="member-course-link" to={`/enterprise/courses/${a.courseId}`}>Xem khóa học →</Link>}</article>)}</div>
      <MemberTabPager page={safePage} total={assignments.length} pageSize={pageSize} onPageChange={setPage} />
    </>}
  </div>;
}
