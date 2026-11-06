import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, ClipboardCheck, Search } from 'lucide-react';
import { useCertificates } from '@/hooks/use-learning';
import { CertificateCard } from '../components/CertificateCard';
import { PULSE_TOKENS } from '../owner-theme';
import { SectionLoading } from '@/components/shared/LoadingState';
import './owner-operations.css';

export function OwnerCertificatesPage() {
  const [search, setSearch] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const { data, isLoading } = useCertificates({ search: search.trim() || undefined, pageIndex, pageSize: 12 });
  const certificates = data?.items ?? [];
  return <div className="po-owner owner-operations -m-4 md:-m-6 min-h-screen" style={PULSE_TOKENS}><main className="owner-operations__shell">
    <header className="owner-operations__header"><div><span className="owner-operations__eyebrow">KẾT QUẢ HỌC TẬP</span><h1>Chứng nhận</h1></div><div className="owner-operations__header-mark"><Award size={35} /></div></header>
    <section className="owner-operations__panel"><div className="owner-operations__section-head"><div><h2>Chứng nhận đã cấp</h2><p>{data?.totalItems ?? 0} chứng nhận</p></div></div>
      <div className="owner-operations__filters"><label className="owner-operations__search owner-filter-search"><Search size={18} /><input type="search" aria-label="Tìm chứng nhận" placeholder="Tìm theo nhân sự, khóa học hoặc mã chứng nhận" value={search} onChange={(event) => { setSearch(event.target.value); setPageIndex(1); }} /></label></div>
      {isLoading ? <SectionLoading label="Đang tải chứng nhận" /> : certificates.length === 0 ? <div className="owner-operations__empty owner-operations__empty--certificate"><span className="owner-operations__empty-art"><Award size={42} /></span><h3>{search ? 'Không tìm thấy chứng nhận' : 'Chưa có chứng nhận được cấp'}</h3><p>{search ? 'Thử tìm theo tên nhân sự hoặc khóa học khác.' : 'Chứng nhận sẽ xuất hiện sau khi kết quả học tập hoặc minh chứng được xác nhận.'}</p>{!search && <Link to="/enterprise/reviews"><ClipboardCheck size={16} /> Xem hàng chờ đánh giá <ArrowRight size={16} /></Link>}</div> : <div className="owner-operations__grid owner-operations__cert-grid">{certificates.map((certificate) => <Link key={certificate.id} to={`/enterprise/certificates/${certificate.id}`}><CertificateCard title={certificate.courseTitle} employeeName={certificate.employeeName} issueDate={certificate.issueDate} /></Link>)}</div>}
      {(data?.totalPages ?? 0) > 1 && <div className="owner-operations__pagination"><span>Trang {pageIndex} / {data?.totalPages}</span><button type="button" disabled={pageIndex <= 1} onClick={() => setPageIndex((page) => page - 1)}>Trước</button><button type="button" disabled={pageIndex >= (data?.totalPages ?? 1)} onClick={() => setPageIndex((page) => page + 1)}>Sau</button></div>}
    </section>
  </main></div>;
}
