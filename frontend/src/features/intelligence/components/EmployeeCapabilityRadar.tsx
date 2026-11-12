import { translateUi, useUiLanguage } from '@/lib/i18n';
import { ArrowUpRight } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { LearningNeedDomain } from '@/services/intelligence.service';

const AXES = ['Dữ liệu', 'Giao tiếp', 'Nội dung số', 'An toàn', 'Giải quyết vấn đề', 'Trí tuệ nhân tạo'];
const COLORS = ['#138f85', '#348bb5', '#9870c5', '#259a86', '#bc8b36', '#557ac3'];
const levelName = (level: number | null | undefined) => level == null ? 'Chờ đánh giá' : ['Chưa đạt cơ bản', 'Cơ bản', 'Trung cấp', 'Nâng cao'][level];
const point = (index: number, level: number, radius = 112) => {
  const angle = index * Math.PI / 3 - Math.PI / 2;
  return [190 + Math.cos(angle) * radius * level / 3, 170 + Math.sin(angle) * radius * level / 3];
};
const polygon = (values: number[]) => values.map((value, index) => point(index, value).join(',')).join(' ');

/** Same conservative domain level and whole-domain target as the learning plan. */
export function EmployeeCapabilityRadar({ domains, onSelect }: { domains: LearningNeedDomain[]; onSelect: (id: string) => void }) {
  useUiLanguage();
  const axes = AXES.map((_, index) => domains.find((domain) => domain.number === index + 1));
  const assessed = axes.every((domain) => domain?.currentLevel != null);
  const applicable = axes.every(Boolean);
  return <section className="employee-radar" aria-label="Tổng quan năng lực theo 6 lĩnh vực">
    <header><div><span className="employee-radar-eyebrow">{translateUi("BỨC TRANH NĂNG LỰC")}</span><h2>Hiện tại & chuẩn vị trí</h2></div><div className="employee-radar-legend"><span><i />{translateUi("Hiện tại")}</span><span><i />{translateUi("Chuẩn vị trí")}</span></div></header>
    <div className="employee-radar-body">
      <div className="employee-radar-chart">
        <svg viewBox="0 0 380 350" role="img" aria-label="Biểu đồ mạng nhện so sánh năng lực hiện tại và chuẩn vị trí; các mức Cơ bản, Trung cấp, Nâng cao">
          <title>Năng lực theo 6 lĩnh vực</title>
          <desc>{axes.map((domain, index) => `${AXES[index]}: ${domain ? `hiện tại ${levelName(domain.currentLevel)}, yêu cầu ${levelName(domain.requiredLevel)}` : 'Không áp dụng'}`).join('. ')}</desc>
          {[1, 2, 3].map((level) => <polygon key={level} points={polygon(Array(6).fill(level))} className="employee-radar-grid" />)}
          {AXES.map((label, index) => { const end = point(index, 3); const text = point(index, 3, 141); return <g key={label}><line x1="190" y1="170" x2={end[0]} y2={end[1]} className="employee-radar-spoke" /><text x={text[0]} y={text[1]} textAnchor="middle" dominantBaseline="middle" className="employee-radar-axis">{translateUi(label)}</text></g>; })}
          {applicable && <polygon points={polygon(axes.map((domain) => domain!.requiredLevel))} className="employee-radar-target" />}
          {assessed && <polygon points={polygon(axes.map((domain) => domain!.currentLevel!))} className="employee-radar-current" />}
          {axes.map((domain, index) => { if (!domain) return null; const target = point(index, domain.requiredLevel); const current = domain.currentLevel != null ? point(index, domain.currentLevel) : null; return <g key={domain.categoryId}><circle cx={target[0]} cy={target[1]} r="3" fill="#8a83bc" />{current && <circle cx={current[0]} cy={current[1]} r="4" fill="#159e91" stroke="white" strokeWidth="2" />}</g>; })}
          {[1, 2, 3].map((level) => <text key={level} x="198" y={170 - 112 * level / 3 + 13} className="employee-radar-scale">{level}</text>)}
        </svg>
        <p>{translateUi("1 · Cơ bản ")}<span>{translateUi("2 · Trung cấp")}</span>{translateUi(" 3 · Nâng cao")}</p>
      </div>
      <div className="employee-radar-domains">{axes.map((domain, index) => domain && <button type="button" key={domain.categoryId} onClick={() => onSelect(domain.categoryId)} style={{ '--radar-domain': COLORS[index] } as CSSProperties} aria-label={translateUi(`Xem lĩnh vực ${domain.name}`)}><span className="employee-radar-domain-number">0{index + 1}</span><span className="employee-radar-domain-label"><strong>{translateUi(domain.name)}</strong><span>{levelName(domain.currentLevel)} <span aria-hidden="true">→</span> <b>{levelName(domain.requiredLevel)}</b></span></span><ArrowUpRight size={15} /></button>)}</div>
    </div>
    {!assessed && <p className="employee-radar-pending">Lĩnh vực chưa có kết quả được để trống, không tính là mức 0.</p>}
  </section>;
}
