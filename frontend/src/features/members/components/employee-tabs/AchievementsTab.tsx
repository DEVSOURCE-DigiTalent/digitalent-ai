import { useState } from 'react';
import { Award, CalendarDays } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { CertificateRecord } from '@/services/mock/server/types-work';
import { MemberTabEmpty, MemberTabHeader, MemberTabPager } from './MemberTabUi';

interface AchievementsTabProps { certificates?: CertificateRecord[]; readOnly?: boolean }
const PAGE_SIZE = 6;
export function AchievementsTab({ certificates = [] }: AchievementsTabProps) {
  const [page, setPage] = useState(1);
  const safePage = Math.min(page, Math.max(1, Math.ceil(certificates.length / PAGE_SIZE)));
  return <div><MemberTabHeader title="Chứng nhận và thành tựu" count={certificates.length} icon={<Award size={21} />} />
    {certificates.length === 0 ? <MemberTabEmpty title="Chưa có chứng nhận" description="Chứng nhận được cấp sau khi hoàn thành yêu cầu đào tạo hoặc đánh giá." icon={<Award size={27} />} /> : <>
      <div className="member-tab-grid">{certificates.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE).map((cert) => <article key={cert.id} className="member-tab-card" style={{ background: 'linear-gradient(135deg,#fff,#f6fcfa)' }}><div className="member-tab-card-head"><div><span className="member-tab-code">{cert.certificateCode}</span><h3 style={{ marginTop: 9 }}>{cert.courseTitle}</h3></div><Award size={25} color="#119582" /></div><div className="member-tab-meta"><span><CalendarDays size={14} />Cấp {formatDate(cert.issueDate)}</span>{cert.expiryDate && <span>Hết hạn {formatDate(cert.expiryDate)}</span>}</div></article>)}</div>
      <MemberTabPager page={safePage} total={certificates.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
    </>}
  </div>;
}
