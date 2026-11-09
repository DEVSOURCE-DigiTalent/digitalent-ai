import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import type { SkillGapRunDetail } from '@/services/intelligence.service';
import { levelLabel } from '@/lib/competency-levels';
import { summarizeByDomain } from '../utils/domain-summary';

type View = 'gaps' | 'all' | 'met';
const PAGE_SIZE = 6;

export function SkillGapDetailDashboard({ run, domainOverview }: { run: SkillGapRunDetail; domainOverview?: ReactNode }) {
  useUiLanguage();
  const domains = useMemo(() => summarizeByDomain(run.items), [run.items]);
  const [domainKey, setDomainKey] = useState('');
  const [view, setView] = useState<View>('gaps');
  const [page, setPage] = useState(1);
  const shown = useMemo(() => run.items
    .filter((item) => !domainKey || (item.categoryName ?? 'Other') === domainKey)
    .filter((item) => view === 'gaps' ? item.gapSteps > 0 : view === 'met' ? item.gapSteps === 0 : true)
    .sort((a, b) => b.priorityScore - a.priorityScore || a.competencyName.localeCompare(b.competencyName, 'vi')), [run.items, domainKey, view]);
  const pageCount = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
  const visible = shown.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const setDomain = (value: string) => { setDomainKey(value); setPage(1); };
  const setDisplay = (value: View) => { setView(value); setPage(1); };

  return <div className="personal-gap-dashboard">
    <div className="personal-gap-stats">
      <div><span>{translateUi("Năng lực yêu cầu")}</span><strong>{run.summary.totalRequired}</strong></div>
      <div><span>{translateUi("Đã đạt")}</span><strong>{run.summary.totalMet}</strong></div>
      <div><span>Cần cải thiện</span><strong>{run.summary.totalGap}</strong><small>{run.summary.highCount}{translateUi(" mức cao")}</small></div>
      <div><span>{translateUi("Mức đáp ứng")}</span><strong>{run.summary.coveragePercent.toFixed(1)}%</strong><span className="personal-gap-stat-progress" aria-hidden="true"><i style={{ width: `${Math.max(0, Math.min(100, run.summary.coveragePercent))}%` }} /></span></div>
    </div>

    {domainOverview ?? <section className="personal-gap-domains" aria-labelledby="personal-domains-title">
      <div className="personal-gap-section-heading"><h2 id="personal-domains-title">Mức đáp ứng theo lĩnh vực</h2><span>Hiện tại / yêu cầu</span></div>
      <div className="personal-gap-domain-grid">
        {domains.map((domain) => {
          const currentPercent = Math.min(100, Math.max(0, domain.averageLevel / 3 * 100));
          const requiredPercent = Math.min(100, Math.max(0, domain.requiredLevel / 3 * 100));
          return <button key={domain.key} type="button" className={`personal-gap-domain ${domain.gapCount ? 'is-gap' : 'is-met'}`} aria-pressed={domainKey === domain.key} onClick={() => setDomain(domainKey === domain.key ? '' : domain.key)}>
            <span className="personal-gap-domain-heading"><strong>{translateUi(domain.name)}</strong><b>{domain.gapCount === 0 ? 'Đạt' : translateUi(`${domain.gapCount} thiếu`)}</b></span>
            <span className="personal-gap-domain-values">{domain.averageLevel.toFixed(1)} <span>/ {domain.requiredLevel.toFixed(1)}</span></span>
            <span className="personal-gap-domain-track" aria-hidden="true"><span style={{ width: `${requiredPercent}%` }} /><i style={{ width: `${currentPercent}%` }} /></span>
          </button>;
        })}
      </div>
    </section>}

    <section className="personal-gap-details" aria-labelledby="personal-details-title">
      <div className="personal-gap-section-heading"><div><h2 id="personal-details-title">Năng lực theo chuẩn vị trí</h2><span>{domainKey || translateUi(`${run.items.length} năng lực`)}</span></div><select aria-label="Lọc theo lĩnh vực" value={domainKey} onChange={(event) => setDomain(event.target.value)}><option value="">{translateUi("Tất cả lĩnh vực")}</option>{domains.map((domain) => <option key={domain.key} value={domain.key}>{translateUi(domain.name)}</option>)}</select></div>
      <div className="personal-gap-tabs" role="group" aria-label="Trạng thái năng lực">
        <button type="button" aria-pressed={view === 'gaps'} onClick={() => setDisplay('gaps')}>Cần cải thiện <b>{run.summary.totalGap}</b></button>
        <button type="button" aria-pressed={view === 'all'} onClick={() => setDisplay('all')}>{translateUi("Tất cả ")}<b>{run.items.length}</b></button>
        <button type="button" aria-pressed={view === 'met'} onClick={() => setDisplay('met')}>{translateUi("Đã đạt ")}<b>{run.summary.totalMet}</b></button>
      </div>
      <div className="personal-gap-list" aria-live="polite">
        {visible.length === 0 ? <p className="personal-gap-empty">Không có năng lực trong bộ lọc này.</p> : visible.map((item) => <article className="personal-gap-item" key={item.competencyId}>
          <div className="personal-gap-item-name"><span>{item.frameworkCode ?? item.competencyCode}</span><div><strong>{item.competencyName}</strong><small>{translateUi(item.categoryName) ?? 'Năng lực số'}{item.mandatory ? ' · Bắt buộc' : ''}</small></div></div>
          <div className="personal-gap-item-level"><span>{item.currentLevel == null ? translateUi('Chưa xác nhận') : levelLabel(item.currentLevel)}</span><ArrowRight size={15} aria-hidden="true" /><b>{levelLabel(item.requiredLevel)}</b></div>
          <div className="personal-gap-item-end">{item.gapSteps > 0 ? <span className={`personal-gap-severity ${item.severity === 'HIGH' ? 'is-high' : ''}`}>{item.severity === 'HIGH' ? translateUi('Mức cao') : item.severity === 'MEDIUM' ? 'Mức trung bình' : 'Mức thấp'}</span> : <span className="personal-gap-met"><CheckCircle2 size={14} /> Đạt</span>}{item.gapSteps > 0 && item.frameworkCode && <Link to={`/enterprise/courses?gap=${encodeURIComponent(item.frameworkCode)}&level=${item.requiredLevel}`} aria-label={translateUi(`Khóa học cho ${item.competencyName}`)}>{translateUi("Khóa học ")}<ArrowRight size={14} /></Link>}</div>
        </article>)}
      </div>
      <div className="personal-gap-pagination"><span>{shown.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, shown.length)} / {shown.length}{translateUi(" năng lực")}</span><div><button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>{translateUi("Trước")}</button><span>{page}/{pageCount}</span><button type="button" disabled={page === pageCount} onClick={() => setPage((value) => value + 1)}>{translateUi("Sau")}</button></div></div>
    </section>
  </div>;
}
