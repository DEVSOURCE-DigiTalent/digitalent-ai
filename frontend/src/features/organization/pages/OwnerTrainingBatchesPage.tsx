import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Plus, Search, Users } from 'lucide-react';
import { useTrainingBatches, useTrainingBatchSummary } from '@/hooks/use-training-batches';
import type { TrainingBatchStatus } from '@/services/mock/server/types';
import { TrainingBatchCard } from '../components/TrainingBatchCard';
import { OwnerFilterSelect } from '../components/OwnerFilterSelect';
import { PULSE_TOKENS } from '../owner-theme';
import { SectionLoading } from '@/components/shared/LoadingState';
import './owner-operations.css';

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'RUNNING', label: 'Đang diễn ra' },
  { value: 'SCHEDULED', label: 'Đã lên lịch' },
  { value: 'COMPLETED', label: 'Đã hoàn thành' },
  { value: 'DRAFT', label: 'Bản nháp' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

export function OwnerTrainingBatchesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const { data: summary } = useTrainingBatchSummary();
  const { data, isLoading } = useTrainingBatches({
    search: search.trim() || undefined,
    status: statusFilter ? statusFilter as TrainingBatchStatus : undefined,
    pageIndex,
    pageSize: 9,
  });
  const batches = data?.items ?? [];

  return <div className="po-owner owner-operations -m-4 md:-m-6 min-h-screen" style={PULSE_TOKENS}>
    <main className="owner-operations__shell">
      <header className="owner-operations__header">
        <div><span className="owner-operations__eyebrow">ĐÀO TẠO DOANH NGHIỆP</span><h1>Đợt đào tạo</h1></div>
        <Link className="owner-operations__primary" to="/enterprise/training-batches/new"><Plus size={18} /> Tạo đợt đào tạo</Link>
      </header>
      <section className="owner-operations__stats" aria-label="Tổng quan đợt đào tạo">
        <div className="owner-operations__stat owner-operations__stat--teal"><span>Đang diễn ra</span><strong>{summary?.running ?? 0}</strong><small>đợt cần theo dõi</small></div>
        <div className="owner-operations__stat"><span>Đã lên lịch</span><strong>{summary?.scheduled ?? 0}</strong><small>đợt sắp bắt đầu</small></div>
        <div className="owner-operations__stat owner-operations__stat--green"><span>Hoàn thành</span><strong>{summary?.completed ?? 0}</strong><small>trên {summary?.total ?? 0} đợt</small></div>
        <div className="owner-operations__stat owner-operations__stat--blue"><span>Học viên</span><strong>{summary?.totalParticipants ?? 0}</strong><small>trong các đợt đào tạo</small></div>
      </section>
      <section className="owner-operations__panel">
        <div className="owner-operations__section-head"><div><h2>Danh sách đợt đào tạo</h2><p>{data?.totalItems ?? summary?.total ?? 0} đợt đào tạo</p></div><Link to="/enterprise/skill-gap">Xem khoảng trống năng lực <ArrowRight size={16} /></Link></div>
        <div className="owner-operations__filters"><label className="owner-operations__search owner-filter-search"><Search size={18} /><input type="search" aria-label="Tìm đợt đào tạo" placeholder="Tìm tên hoặc mã đợt" value={search} onChange={(e) => { setSearch(e.target.value); setPageIndex(1); }} /></label><OwnerFilterSelect label="Lọc trạng thái" value={statusFilter} onChange={(value) => { setStatusFilter(value); setPageIndex(1); }} options={STATUS_OPTIONS} /></div>
        {isLoading ? <SectionLoading label="Đang tải đợt đào tạo" /> : batches.length === 0 ? <div className="owner-operations__empty"><BookOpen size={36} /><h3>{search || statusFilter ? 'Không có đợt phù hợp' : 'Chưa có đợt đào tạo'}</h3><p>{search || statusFilter ? 'Thử đổi từ khóa hoặc trạng thái.' : 'Tạo đợt đầu tiên để bắt đầu theo dõi học viên và tiến độ.'}</p><Link to="/enterprise/training-batches/new">Tạo đợt đào tạo <ArrowRight size={16} /></Link></div> : <div className="owner-operations__grid">{batches.map((batch) => <TrainingBatchCard key={batch.id} batch={batch} />)}</div>}
        {(data?.totalPages ?? 0) > 1 && <div className="owner-operations__pagination"><span>Trang {pageIndex} / {data?.totalPages}</span><button type="button" disabled={pageIndex <= 1} onClick={() => setPageIndex((page) => page - 1)}>Trước</button><button type="button" disabled={pageIndex >= (data?.totalPages ?? 1)} onClick={() => setPageIndex((page) => page + 1)}>Sau</button></div>}
      </section>
      <div className="owner-operations__footnote"><Users size={17} /><span>Cần giao khóa học riêng lẻ?</span><Link to="/enterprise/assignments">Mở phân công đào tạo <ArrowRight size={15} /></Link></div>
    </main>
  </div>;
}
