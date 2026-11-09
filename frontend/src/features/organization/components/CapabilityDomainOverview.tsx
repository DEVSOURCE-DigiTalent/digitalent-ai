import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';
import type { CompetencyGapRow } from '@/services/analytics.service';
import { CapabilityLearningPath } from './CapabilityLearningPath';
import '@/features/intelligence/components/position-course-gaps.css';

/** Organization averages are not course tiers: preserve the actual standards of each position. */
export function CapabilityDomainOverview({ competencies, isLoading, positionId }: { competencies: CompetencyGapRow[]; isLoading: boolean; positionId: string }) {
  useUiLanguage();
  const [selected, setSelected] = useState<number | null>(null);
  const domains = useMemo(() => {
    const groups = new Map<number, CompetencyGapRow[]>();
    competencies.forEach((item) => {
      const number = Number(item.frameworkCode.split('.')[0]);
      if (number >= 1 && number <= 6) groups.set(number, [...(groups.get(number) ?? []), item]);
    });
    return [...groups.entries()].sort(([a], [b]) => a - b).map(([number, items]) => ({ number, items,
      name: items[0].categoryName ?? `Lĩnh vực ${number}`,
      current: items.reduce((sum, item) => sum + item.averageCurrentLevel, 0) / items.length,
      required: items.reduce((sum, item) => sum + item.averageRequiredLevel, 0) / items.length,
      gaps: items.reduce((sum, item) => sum + item.employeesWithGap, 0),
    }));
  }, [competencies]);
  const active = domains.find((domain) => domain.number === selected);
  return <section className="position-gap-map" aria-label={translateUi("Khoảng trống theo 6 lĩnh vực")}>
    <div className="position-gap-map__heading"><div><small>{translateUi("6 LĨNH VỰC · 3 CẤP KHÓA HỌC")}</small><h2>{translateUi("Khoảng trống theo lĩnh vực")}</h2></div><Link to={`/enterprise/setup${positionId ? `?positionId=${encodeURIComponent(positionId)}` : ''}`}>{translateUi("Chuẩn vị trí ")}<ArrowRight size={14} /></Link></div>
    <p className="position-gap-map__caption">{translateUi("Mức trung bình để so sánh đội ngũ; cấp khóa học áp dụng theo chuẩn của từng vị trí.")}</p>
    {isLoading ? <p>{translateUi("Đang tải lĩnh vực…")}</p> : !domains.length ? <p>{translateUi("Chưa có kết quả theo bộ lọc.")}</p> : <div className="position-gap-map__grid">{domains.map((domain) => <article key={domain.number} data-domain={domain.number}>
      <header><span className="position-gap-map__number">{String(domain.number).padStart(2, '0')}</span><h3>{translateUi(domain.name)}</h3></header>
      <div className="position-gap-map__averages"><span>{translateUi("Hiện tại TB ")}<b>{domain.current.toFixed(1)}</b></span><ArrowRight size={14} /><span>{translateUi("Yêu cầu TB ")}<b>{domain.required.toFixed(1)}</b></span></div>
      <div className="position-gap-map__track" aria-hidden="true"><i style={{ width: `${domain.required > 0 ? Math.min(100, domain.current / domain.required * 100) : 100}%` }} /></div>
      <footer><span>{domain.gaps}{translateUi(" lượt thiếu năng lực")}</span><button type="button" aria-pressed={selected === domain.number} onClick={() => setSelected(selected === domain.number ? null : domain.number)}>{selected === domain.number ? translateUi('Thu gọn') : 'Xem năng lực'} <ChevronDown size={14} /></button></footer>
    </article>)}</div>}
    {active && <div className="position-gap-map__expanded"><CapabilityLearningPath key={active.number} competencies={active.items} isLoading={false} /></div>}
  </section>;
}
