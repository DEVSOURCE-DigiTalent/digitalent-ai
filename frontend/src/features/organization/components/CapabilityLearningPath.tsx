import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import type { CompetencyGapRow } from '@/services/analytics.service';
import { OwnerFilterSelect } from './OwnerFilterSelect';
import { SectionLoading } from '@/components/shared/LoadingState';

interface CapabilityLearningPathProps {
  competencies: CompetencyGapRow[];
  isLoading: boolean;
}

type GapView = 'priority' | 'all' | 'met';
const PAGE_SIZE = 6;

export function CapabilityLearningPath({ competencies, isLoading }: CapabilityLearningPathProps) {
  useUiLanguage();
  const [view, setView] = useState<GapView>('priority');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const categories = useMemo(() => [...new Set(competencies.map((item) => item.categoryName).filter((name): name is string => Boolean(name)))], [competencies]);
  const metCount = competencies.filter((item) => item.employeesWithGap === 0).length;

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('vi');
    return competencies
      .filter((item) => (view === 'priority' ? item.employeesWithGap > 0 : view === 'met' ? item.employeesWithGap === 0 : true))
      .filter((item) => !category || item.categoryName === category)
      .filter((item) => !query || `${item.frameworkCode} ${item.name} ${item.categoryName ?? ''}`.toLocaleLowerCase('vi').includes(query))
      .sort((a, b) => view === 'priority'
        ? b.highCount - a.highCount || b.employeesWithGap - a.employeesWithGap || (b.averageRequiredLevel - b.averageCurrentLevel) - (a.averageRequiredLevel - a.averageCurrentLevel)
        : a.frameworkCode.localeCompare(b.frameworkCode, 'vi', { numeric: true }));
  }, [competencies, view, category, search]);

  useEffect(() => setPage(1), [view, category, search, competencies]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <section className="gap-panel" aria-labelledby="gap-competency-title">
      <div className="gap-panel-heading">
        <div>
          <span className="gap-eyebrow">Theo năng lực TT02</span>
          <h2 id="gap-competency-title">{translateUi("Mức đáp ứng từng năng lực trên toàn tổ chức")}</h2>
        </div>
        <span className="gap-panel-count">{competencies.length}{translateUi(" năng lực")}</span>
      </div>

      {isLoading ? (
        <SectionLoading label={translateUi("Đang tải dữ liệu năng lực")} />
      ) : competencies.length === 0 ? (
        <div className="gap-empty"><strong>{translateUi("Chưa có dữ liệu năng lực")}</strong><span>{translateUi("Không có số liệu theo bộ lọc hiện tại.")}</span></div>
      ) : (
        <>
          <div className="gap-toolbar">
            <div className="gap-view-switch" role="group" aria-label={translateUi("Hiển thị năng lực")}>
              <button type="button" aria-pressed={view === 'priority'} onClick={() => setView('priority')}>{translateUi("Cần ưu tiên ")}<b>{competencies.filter((item) => item.employeesWithGap > 0).length}</b></button>
              <button type="button" aria-pressed={view === 'all'} onClick={() => setView('all')}>{translateUi("Tất cả ")}<b>{competencies.length}</b></button>
              <button type="button" aria-pressed={view === 'met'} onClick={() => setView('met')}>{translateUi("Đạt chuẩn ")}<b>{metCount}</b></button>
            </div>
            <div className="gap-toolbar-fields">
              <OwnerFilterSelect label={translateUi("Lọc theo lĩnh vực năng lực")} value={category} onChange={setCategory} options={[{ value: '', label: 'Mọi lĩnh vực' }, ...categories.map((name) => ({ value: name, label: name }))]} />
              <label className="gap-search owner-filter-search"><Search size={17} aria-hidden="true" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={translateUi("Tìm mã hoặc tên năng lực")} aria-label={translateUi("Tìm năng lực")} /></label>
            </div>
          </div>
          <div className="gap-list" aria-live="polite">
            {visible.length === 0 ? <div className="gap-empty"><strong>{translateUi("Không tìm thấy năng lực")}</strong><span>{translateUi("Thử một lĩnh vực hoặc từ khóa khác.")}</span></div> : visible.map((comp) => {
              const currentPct = Math.max(0, Math.min(100, comp.averageCurrentLevel / 3 * 100));
              const requiredPct = Math.max(0, Math.min(100, comp.averageRequiredLevel / 3 * 100));
              const hasGap = comp.employeesWithGap > 0;
              return <article className="gap-competency" key={comp.competencyId}>
                <div className="gap-competency-name"><span className="gap-code">{comp.frameworkCode}</span><div><strong>{comp.name}</strong><small>{translateUi(comp.categoryName) ?? 'Năng lực số'}</small></div></div>
                <div className="gap-levels" aria-label={translateUi(`Hiện tại ${comp.averageCurrentLevel.toFixed(1)}, yêu cầu ${comp.averageRequiredLevel.toFixed(1)}`)}>
                  <div className="gap-level-values"><span>{translateUi("Hiện tại ")}<b>{comp.averageCurrentLevel.toFixed(1)}</b></span><ArrowRight size={15} aria-hidden="true" /><span>{translateUi("Yêu cầu ")}<b>{comp.averageRequiredLevel.toFixed(1)}</b></span></div>
                  <div className="gap-level-track" aria-hidden="true"><span style={{ width: `${requiredPct}%` }} /><i style={{ left: `${currentPct}%` }} /></div>
                </div>
                <div className="gap-competency-end">
                  {hasGap ? <><span className="gap-severity">{comp.highCount > 0 ? translateUi(`${comp.highCount} mức cao`) : translateUi(`${comp.employeesWithGap} khoảng trống`)}</span><small>{comp.employeesWithGap}/{comp.employeesRequired}{translateUi(" nhân sự")}</small></> : <span className="gap-met">{translateUi("Đạt chuẩn")}</span>}
                  {hasGap && <Link to={`/enterprise/courses?gap=${encodeURIComponent(comp.frameworkCode)}`} aria-label={translateUi(`Xem khóa học cho ${comp.name}`)}>{translateUi("Khóa lĩnh vực ")}<ArrowRight size={15} /></Link>}
                </div>
              </article>;
            })}
          </div>
          <div className="gap-pagination"><span>{translateUi("Hiển thị ")}{filtered.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length}{translateUi(" năng lực")}</span><div><button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>{translateUi("Trước")}</button><span>{translateUi("Trang ")}{page}/{pageCount}</span><button type="button" disabled={page === pageCount} onClick={() => setPage((value) => value + 1)}>{translateUi("Sau")}</button></div></div>
        </>
      )}
    </section>
  );
}
