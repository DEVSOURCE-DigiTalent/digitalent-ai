import { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { LevelBadge } from '@/components/shared';
import { formatDate } from '@/lib/utils';
import type { CompetencyLevelRow, EvidenceSource } from '@/services/workforce.service';
import { MemberTabEmpty, MemberTabHeader } from './MemberTabUi';

interface CompetencyTabProps { rows: CompetencyLevelRow[]; hasRequirement: boolean; readOnly?: boolean }
const SOURCE_LABELS: Record<EvidenceSource, string> = { MIGRATION: 'Đánh giá đầu vào', ASSESSMENT: 'Bài đánh giá', TASK: 'Nhiệm vụ thực tế', MANUAL: 'Quản trị xác nhận' };

export function CompetencyTab({ rows, hasRequirement }: CompetencyTabProps) {
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const domains = [...new Set(rows.map((row) => row.categoryName))];
  const activeDomain = selectedDomain && domains.includes(selectedDomain) ? selectedDomain : domains[0];
  const visibleRows = rows.filter((row) => row.categoryName === activeDomain);
  return <div>
    <MemberTabHeader title="Năng lực theo lĩnh vực" count={rows.length} icon={<BarChart3 size={21} />} />
    {!hasRequirement && <div role="status" className="member-tab-note">Vị trí chưa có chuẩn năng lực đang áp dụng. Mức yêu cầu sẽ hiển thị sau khi kích hoạt chuẩn.</div>}
    {rows.length === 0 ? <MemberTabEmpty title="Chưa có dữ liệu năng lực" description="Kết quả đánh giá và xác nhận năng lực sẽ xuất hiện tại đây." icon={<BarChart3 size={27} />} /> : <>
      <div className="member-tab-switches" role="tablist" aria-label="Lĩnh vực năng lực">{domains.map((domain) => <button type="button" role="tab" key={domain} aria-selected={activeDomain === domain} onClick={() => setSelectedDomain(domain)}>{domain} <span>({rows.filter((row) => row.categoryName === domain).length})</span></button>)}</div>
      <section className="member-tab-section" aria-label={activeDomain}><h3>{activeDomain}</h3><div className="member-tab-list">{visibleRows.map((row) => <article className="member-tab-row" key={row.competencyId}><div className="member-tab-row-main"><h3><span className="member-tab-code" style={{ marginRight: 9 }}>{row.frameworkCode}</span>{row.name}</h3><p>{row.source ? `${SOURCE_LABELS[row.source]} · ${formatDate(row.confirmedAt)}` : 'Chưa xác nhận'}</p></div><div className="member-tab-row-side"><span>Hiện tại <LevelBadge level={row.currentLevel} /></span><span>Yêu cầu {row.requiredLevel > 0 ? <LevelBadge level={row.requiredLevel} /> : 'Không áp dụng'}</span></div></article>)}</div></section>
    </>}
  </div>;
}
