import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, ClipboardCheck, Search } from 'lucide-react';
import { useCertificates } from '@/hooks/use-learning';
import { CertificateCard } from '../components/CertificateCard';
import { PULSE_TOKENS } from '../owner-theme';
import { SectionLoading } from '@/components/shared/LoadingState';
import './owner-operations.css';

export function OwnerCertificatesPage() {
  useUiLanguage();
  const [search, setSearch] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const { data, isLoading } = useCertificates({ search: search.trim() || undefined, pageIndex, pageSize: 12 });
  const certificates = data?.items ?? [];
  return <div className="po-owner owner-operations owner-certificate-gallery -m-4 md:-m-6 min-h-screen" style={PULSE_TOKENS}><main className="owner-operations__shell">
    <header className="owner-operations__header"><div><span className="owner-operations__eyebrow">{translateUi("KẾT QUẢ HỌC TẬP")}</span><h1>{translateUi("Chứng nhận")}</h1></div><div className="owner-operations__header-mark"><Award size={35} /></div></header>
    <section className="owner-operations__panel"><div className="owner-operations__section-head"><div><h2>{translateUi("Chứng nhận đã cấp")}</h2><p>{data?.totalItems ?? 0}{translateUi(" chứng nhận")}</p></div></div>
      <div className="owner-operations__filters"><label className="owner-operations__search owner-filter-search"><Search size={18} /><input type="search" aria-label={translateUi("Tìm chứng nhận")} placeholder={translateUi("Tìm theo nhân sự, khóa học hoặc mã chứng nhận")} value={search} onChange={(event) => { setSearch(event.target.value); setPageIndex(1); }} /></label></div>
      {isLoading ? <SectionLoading label={translateUi("Đang tải chứng nhận")} /> : certificates.length === 0 ? <div className="owner-operations__empty owner-operations__empty--certificate"><span className="owner-operations__empty-art"><Award size={42} /></span><h3>{search ? 'Không tìm thấy chứng nhận' : 'Chưa có chứng nhận được cấp'}</h3><p>{search ? 'Thử tìm theo tên nhân sự hoặc khóa học khác.' : 'Chứng nhận sẽ xuất hiện sau khi kết quả học tập hoặc minh chứng được xác nhận.'}</p>{!search && <Link to="/enterprise/reviews"><ClipboardCheck size={16} />{translateUi(" Xem hàng chờ đánh giá ")}<ArrowRight size={16} /></Link>}</div> : <div className="owner-operations__grid owner-operations__cert-grid">{certificates.map((certificate) => <Link key={certificate.id} to={`/enterprise/certificates/${certificate.id}`}><CertificateCard title={translateUi(certificate.courseTitle)} employeeName={certificate.employeeName} issueDate={certificate.issueDate} /></Link>)}</div>}
      {(data?.totalPages ?? 0) > 1 && <div className="owner-operations__pagination"><span>{translateUi("Trang ")}{pageIndex} / {data?.totalPages}</span><button type="button" disabled={pageIndex <= 1} onClick={() => setPageIndex((page) => page - 1)}>{translateUi("Trước")}</button><button type="button" disabled={pageIndex >= (data?.totalPages ?? 1)} onClick={() => setPageIndex((page) => page + 1)}>{translateUi("Sau")}</button></div>}
    </section>
  </main></div>;
}
