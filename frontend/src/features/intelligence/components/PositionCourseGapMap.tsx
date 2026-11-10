import { translateUi, useUiLanguage } from '@/lib/i18n';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCourseCatalog } from '@/hooks/use-assignments';
import type { SkillGapRunDetail } from '@/services/intelligence.service';
import { levelLabel } from '@/lib/competency-levels';
import { positionCourseDomains } from '../utils/position-course-gaps';
import './position-course-gaps.css';

export function PositionCourseGapMap({ run, positionId }: { run: SkillGapRunDetail; positionId?: string }) {
  useUiLanguage();
  const catalog = useCourseCatalog({ status: 'PUBLISHED' });
  const domains = positionCourseDomains(run.items, catalog.data?.items ?? []);
  const setupUrl = `/enterprise/setup${positionId ? `?positionId=${encodeURIComponent(positionId)}` : ''}`;
  return <section className="position-gap-map" aria-label="Khóa học theo chuẩn vị trí">
    <div className="position-gap-map__heading"><div><small>CHUẨN VỊ TRÍ · v{run.requirementSetVersionNo}</small><h2>Lĩnh vực & khóa học đích</h2></div><Link to={setupUrl}>Điều chỉnh chuẩn vị trí <ArrowRight size={14} /></Link></div>
    <div className="position-gap-map__grid">{domains.map((domain) => <article key={domain.number} data-domain={domain.number}>
      <header><span className="position-gap-map__number">{String(domain.number).padStart(2, '0')}</span><h3>{translateUi(domain.name)}</h3><span className={`position-gap-map__status${domain.gaps ? '' : ' is-met'}`}>{domain.gaps ? translateUi(`${domain.gaps} cần bổ sung`) : <><CheckCircle2 size={13} /> Đạt</>}</span></header>
      {domain.level == null ? <div className="position-gap-map__legacy"><AlertCircle size={15} /><span>Chuẩn cũ chưa đồng bộ theo khóa học.</span><Link to={setupUrl}>Cập nhật chuẩn</Link></div> : <div className="position-gap-map__target"><BookOpen size={17} /><div><span>{levelLabel(domain.level)} · {domain.course?.code ?? 'Chưa có khóa tương ứng'}</span><strong>{translateUi(domain.course?.title) ?? (catalog.isLoading ? translateUi('Đang tải khóa học…') : 'Kiểm tra danh mục khóa học')}</strong></div></div>}
      <div className="position-gap-map__progress"><span><b>{domain.met}/{domain.total}</b> năng lực đã đạt</span>{domain.unconfirmed > 0 && <small>{domain.unconfirmed}{translateUi(" chưa xác nhận")}</small>}</div>
      <div className="position-gap-map__track" role="progressbar" aria-label={translateUi(`Mức đáp ứng ${domain.name}`)} aria-valuemin={0} aria-valuemax={domain.total} aria-valuenow={domain.met}><i style={{ width: `${domain.met / domain.total * 100}%` }} /></div>
      <footer>{domain.course ? <><span>{domain.level === 1 ? translateUi('Miễn phí') : domain.course.hasLicense ? translateUi(`Còn ${domain.course.seatsAvailable ?? 0} suất`) : 'Chưa mua · vẫn áp dụng chuẩn'}</span><Link to={`/enterprise/courses?focus=${encodeURIComponent(domain.course.id)}`}>Xem khóa đích <ArrowRight size={13} /></Link></> : <span>Đối chiếu theo chuẩn vị trí đang áp dụng</span>}</footer>
    </article>)}</div>
  </section>;
}
