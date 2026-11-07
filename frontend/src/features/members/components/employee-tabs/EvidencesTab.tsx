import { useState } from 'react';
import { FileCheck2, Clock3 } from 'lucide-react';
import { LevelBadge } from '@/components/shared';
import { formatDateTime } from '@/lib/utils';
import type { EvidenceRow, EvidenceSource } from '@/services/workforce.service';
import { MemberTabEmpty, MemberTabHeader, MemberTabPager } from './MemberTabUi';

interface EvidencesTabProps { evidence: EvidenceRow[]; submissions?: any[]; readOnly?: boolean }
const SOURCE_LABELS: Record<EvidenceSource, string> = { MIGRATION: 'Đánh giá đầu vào', ASSESSMENT: 'Bài đánh giá', TASK: 'Nhiệm vụ thực tế', MANUAL: 'Quản trị xác nhận' };
const PAGE_SIZE = 6;
export function EvidencesTab({ evidence = [], submissions = [] }: EvidencesTabProps) {
  const [selected, setSelected] = useState<'submissions' | 'evidence'>('submissions');
  const [page, setPage] = useState(1);
  const active = selected === 'submissions' && submissions.length === 0 ? 'evidence' : selected === 'evidence' && evidence.length === 0 ? 'submissions' : selected;
  const items = active === 'submissions' ? submissions : evidence;
  const safePage = Math.min(page, Math.max(1, Math.ceil(items.length / PAGE_SIZE)));
  const switchTo = (next: 'submissions' | 'evidence') => { setSelected(next); setPage(1); };
  return <div><MemberTabHeader title="Minh chứng năng lực" count={evidence.length + submissions.length} icon={<FileCheck2 size={21} />} />
    {evidence.length === 0 && submissions.length === 0 ? <MemberTabEmpty title="Chưa có minh chứng" description="Bài nộp và xác nhận năng lực sẽ được lưu tại đây." icon={<FileCheck2 size={27} />} /> : <>
      <div className="member-tab-switches" role="tablist" aria-label="Loại minh chứng"><button type="button" role="tab" aria-selected={active === 'submissions'} onClick={() => switchTo('submissions')}>Bài nộp ({submissions.length})</button><button type="button" role="tab" aria-selected={active === 'evidence'} onClick={() => switchTo('evidence')}>Xác nhận năng lực ({evidence.length})</button></div>
      {items.length === 0 ? <MemberTabEmpty title="Chưa có dữ liệu" description="Loại minh chứng này chưa có bản ghi." /> : <div className="member-tab-grid">{active === 'submissions' ? submissions.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE).map((sub) => <article className="member-tab-card" key={sub.id}><div className="member-tab-card-head"><h3>{sub.taskTitle}</h3><span style={{ color: sub.status === 'EVALUATED' ? '#0a856d' : sub.status === 'REJECTED' ? '#b65144' : '#ae7115', fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap' }}>{sub.status === 'EVALUATED' ? 'Đã duyệt' : sub.status === 'REJECTED' ? 'Cần chỉnh sửa' : 'Chờ đánh giá'}</span></div>{sub.content && <p className="line-clamp-2" style={{ margin: '8px 0 0' }}>{sub.content}</p>}<div className="member-tab-meta"><span><Clock3 size={14} />{formatDateTime(sub.submittedAt)}</span>{sub.evaluatorName && <span>{sub.evaluatorName}</span>}</div></article>) : evidence.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE).map((entry) => <article className="member-tab-card" key={entry.competencyId + entry.confirmedAt}><div className="member-tab-card-head"><div><span className="member-tab-code">{entry.frameworkCode}</span><h3 style={{ marginTop: 8 }}>{entry.competencyName}</h3></div><LevelBadge level={entry.level} /></div><div className="member-tab-meta"><span>{SOURCE_LABELS[entry.source] ?? entry.source}</span><span><Clock3 size={14} />{formatDateTime(entry.confirmedAt)}</span></div>{entry.note && <p style={{ margin: '9px 0 0' }}>{entry.note}</p>}</article>)}</div>}
      <MemberTabPager page={safePage} total={items.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
    </>}
  </div>;
}
