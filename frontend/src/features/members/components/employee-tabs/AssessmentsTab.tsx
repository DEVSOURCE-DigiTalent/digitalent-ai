import { useState } from 'react';
import { ClipboardCheck, CalendarDays } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { AssessmentAttemptRecord } from '@/services/mock/server/types-work';
import { MemberTabEmpty, MemberTabHeader, MemberTabPager } from './MemberTabUi';

interface AssessmentsTabProps { attempts?: AssessmentAttemptRecord[]; readOnly?: boolean }
const PAGE_SIZE = 6;
export function AssessmentsTab({ attempts = [] }: AssessmentsTabProps) {
  const [page, setPage] = useState(1);
  const safePage = Math.min(page, Math.max(1, Math.ceil(attempts.length / PAGE_SIZE)));
  return <div><MemberTabHeader title="Kết quả đánh giá" count={attempts.length} icon={<ClipboardCheck size={21} />} />
    {attempts.length === 0 ? <MemberTabEmpty title="Chưa có kết quả đánh giá" description="Kết quả các bài đánh giá sẽ được lưu tại đây." icon={<ClipboardCheck size={27} />} /> : <>
      <div className="member-tab-grid">{attempts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE).map((att) => <article key={att.id} className="member-tab-card"><div className="member-tab-card-head"><div><h3>{att.courseTitle}</h3><p style={{ margin: '3px 0 0' }}>{att.assessmentId}</p></div><span className={`member-tab-score${att.passed ? '' : ' is-low'}`}>{att.score}</span></div><div className="member-tab-meta"><strong style={{ color: att.passed ? '#087654' : '#bc5c3a' }}>{att.passed ? 'Đạt' : 'Chưa đạt'}</strong><span>{att.correctAnswers}/{att.totalQuestions} câu đúng</span><span><CalendarDays size={14} />{formatDate(att.submittedAt)}</span></div></article>)}</div>
      <MemberTabPager page={safePage} total={attempts.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
    </>}
  </div>;
}
