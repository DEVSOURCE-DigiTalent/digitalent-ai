import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardCheck, Clock3, Search } from 'lucide-react';
import { useReviewQueue } from '@/hooks/use-tasks';
import { formatDate } from '@/lib/utils';
import { PULSE_TOKENS } from '../owner-theme';
import { SectionLoading } from '@/components/shared/LoadingState';
import './owner-operations.css';

export function OwnerReviewsPage() {
  useUiLanguage();
  const [search, setSearch] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const { data, isLoading, isError, refetch } = useReviewQueue({ search: search.trim() || undefined, pageIndex, pageSize: 10 });
  const items = data?.items ?? [];
  return <div className="po-owner owner-operations -m-4 md:-m-6 min-h-screen" style={PULSE_TOKENS}><main className="owner-operations__shell">
    <header className="owner-operations__header"><div><Link className="owner-operations__back" to="/enterprise/tasks"><ArrowLeft size={16} />{translateUi(" Nhiệm vụ thực tế")}</Link><span className="owner-operations__eyebrow">{translateUi("ĐÁNH GIÁ MINH CHỨNG")}</span><h1>{translateUi("Hàng đợi đánh giá")}</h1></div><div className="owner-operations__queue-count"><ClipboardCheck size={22} /><span><strong>{data?.totalItems ?? 0}</strong><small>{translateUi("bài chờ chấm")}</small></span></div></header>
    <section className="owner-operations__panel"><div className="owner-operations__section-head"><div><h2>{translateUi("Bài nộp cần xử lý")}</h2><p>{translateUi("Ưu tiên các bài đến hạn và phản hồi trực tiếp trong từng bài.")}</p></div></div><div className="owner-operations__filters"><label className="owner-operations__search owner-filter-search"><Search size={18} /><input type="search" aria-label={translateUi("Tìm bài chờ chấm")} value={search} onChange={(event) => { setSearch(event.target.value); setPageIndex(1); }} placeholder={translateUi("Tìm nhân sự hoặc nhiệm vụ")} /></label></div>
      {isLoading ? <SectionLoading label={translateUi("Đang tải bài nộp")} /> : isError ? <div className="owner-operations__empty"><ClipboardCheck size={36} /><h3>{translateUi("Không thể tải hàng đợi")}</h3><button type="button" onClick={() => refetch()}>{translateUi("Thử lại")}</button></div> : items.length === 0 ? <div className="owner-operations__empty owner-operations__empty--review"><span className="owner-operations__empty-art"><CheckCircle2 size={40} /></span><h3>{search ? translateUi('Không tìm thấy bài nộp') : 'Không có bài cần chấm'}</h3><p>{search ? 'Thử tìm theo tên nhân sự hoặc nhiệm vụ khác.' : 'Bài nộp mới sẽ xuất hiện tại đây khi nhân sự gửi minh chứng.'}</p><Link to="/enterprise/tasks">{translateUi("Xem nhiệm vụ thực tế ")}<ArrowRight size={16} /></Link></div> : <div className="owner-operations__review-list">{items.map((item) => <Link key={item.id} to={`/enterprise/reviews/${item.id}`} className="owner-operations__review-row"><span className="owner-operations__review-avatar">{item.employeeName.charAt(0)}</span><span className="owner-operations__review-person"><strong>{item.employeeName}</strong><small>{item.departmentName || item.employeeCode}</small></span><span className="owner-operations__review-task"><strong>{item.taskTitle}</strong><small>{item.targetLevel > 0 ? translateUi(`Cấp ${item.targetLevel} · `) : ''}{translateUi("Nộp ")}{formatDate(item.submittedAt)}</small></span><span className="owner-operations__review-date">{item.taskDueDate && <><Clock3 size={15} />{translateUi(" Hạn ")}{formatDate(item.taskDueDate)}</>}</span><span className="owner-operations__review-action">{translateUi("Chấm bài ")}<ArrowRight size={16} /></span></Link>)}</div>}
      {(data?.totalPages ?? 0) > 1 && <div className="owner-operations__pagination"><span>{translateUi("Trang ")}{pageIndex} / {data?.totalPages}</span><button type="button" disabled={pageIndex <= 1} onClick={() => setPageIndex((page) => page - 1)}>{translateUi("Trước")}</button><button type="button" disabled={pageIndex >= (data?.totalPages ?? 1)} onClick={() => setPageIndex((page) => page + 1)}>{translateUi("Sau")}</button></div>}
    </section>
  </main></div>;
}
