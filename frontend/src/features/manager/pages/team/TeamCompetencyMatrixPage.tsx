import { OwnerFilterSelect } from '@/features/organization/components/OwnerFilterSelect';
import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Grid3X3 } from 'lucide-react';
import { SectionLoading } from '@/components/shared/LoadingState';
import { LoadError } from '@/features/pulse-employee/components/ui';
import { ManagerPage, ManagerPageHeader, NoDepartment } from '@/features/pulse-manager/components/ManagerUi';
import { levelStatus, type LevelStatus } from '@/features/pulse-manager/lib/capability';
import { MANAGER_PATHS } from '@/features/pulse-manager/lib/paths';
import { useManagedDepartment } from '@/hooks/use-managed-department';
import { TT02_DOMAINS } from '@/lib/reference-positions';
import type { SkillGapItem, SkillGapRunDetail } from '@/services/intelligence.service';
import { useManagerSkillGapMatrix } from '../../hooks/use-manager-skill-gaps';
import './team-competency-matrix.css';

const COLUMN_LIMIT = 6;
const STATUS: Record<LevelStatus, string> = {
  MET: 'Đạt yêu cầu', GAP: 'Chưa đạt', PENDING: 'Chưa xác nhận mức', OUTSIDE_PATH: 'Ngoài lộ trình',
};
const code = (item: SkillGapItem) => item.frameworkCode || item.competencyCode;

function CompetencyMatrix({ rows }: { rows: SkillGapRunDetail[] }) {
  const locale = useUiLanguage();
  const [selected, setSelected] = useState('');
  const [columnPage, setColumnPage] = useState(0);
  const competencies = new Map(rows.flatMap((run) => run.items).map((item) => [item.competencyId, item]));
  const groups = new Map<string, { name: string; order: number; columns: SkillGapItem[] }>();
  for (const item of competencies.values()) {
    const order = item.categorySortOrder || Number(item.frameworkCode?.match(/^([1-6])\./)?.[1]);
    const domain = TT02_DOMAINS.find(({ number }) => number === order);
    const name = domain?.name || item.categoryName?.trim() || 'Chưa phân loại';
    const key = domain ? String(domain.number) : name;
    const group = groups.get(key) ?? { name, order: domain?.number ?? Infinity, columns: [] };
    group.columns.push(item);
    groups.set(key, group);
  }
  const domains = [...groups.entries()].sort(([, a], [, b]) => a.order - b.order || a.name.localeCompare(b.name, locale));
  const activeKey = groups.has(selected) ? selected : domains[0]?.[0];
  const domain = activeKey == null ? undefined : groups.get(activeKey);
  if (!domain) return <p>{translateUi('Chưa có năng lực để đối chiếu theo vị trí.')}</p>;

  const ordered = [...domain.columns].sort((a, b) => code(a).localeCompare(code(b), locale, { numeric: true }));
  const lastPage = Math.max(0, Math.ceil(ordered.length / COLUMN_LIMIT) - 1);
  const current = Math.min(columnPage, lastPage);
  const start = current * COLUMN_LIMIT;
  const columns = ordered.slice(start, start + COLUMN_LIMIT);

  return (
    <section className="team-matrix" aria-labelledby="team-matrix-title">
      <header className="team-matrix-tools">
        <div><h2 id="team-matrix-title"><Grid3X3 size={20} aria-hidden="true" />{translateUi('Đối chiếu theo lĩnh vực')}</h2>
          <p>{translateUi('Mức hiện tại')} / {translateUi('Mức yêu cầu')}</p></div>
        <div className="team-matrix-select">
          <span>{translateUi('Lĩnh vực')}</span>
          <OwnerFilterSelect variant="manager" label="Lĩnh vực" value={activeKey ?? ''}
            onChange={(value) => { setSelected(value); setColumnPage(0); }}
            options={domains.map(([key, group]) => ({ value: key, label: `${translateUi(group.name)} (${group.columns.length})` }))} />
        </div>
      </header>
      <ul className="team-matrix-legend" role="list" aria-label={translateUi('Chú giải trạng thái')}>
        {Object.entries(STATUS).map(([status, label]) => <li key={status} data-status={status}>{translateUi(label)}</li>)}
      </ul>
      {lastPage > 0 && (
        <div className="team-matrix-columns">
          <button type="button" disabled={current === 0} onClick={() => setColumnPage(current - 1)} aria-label={translateUi('Nhóm năng lực trước')}><ChevronLeft size={17} /></button>
          <span>{start + 1}–{start + columns.length} / {ordered.length} {translateUi('năng lực')}</span>
          <button type="button" disabled={current === lastPage} onClick={() => setColumnPage(current + 1)} aria-label={translateUi('Nhóm năng lực sau')}><ChevronRight size={17} /></button>
        </div>
      )}
      <table role="table" className="team-matrix-table" aria-label={translateUi(domain.name)}>
        <thead role="rowgroup"><tr role="row">
          <th scope="col" role="columnheader">{translateUi('Nhân viên')}</th>
          {columns.map((item) => <th scope="col" role="columnheader" key={item.competencyId}>
            <strong>{code(item)}</strong><small>{translateUi(item.competencyName)}</small>
          </th>)}
        </tr></thead>
        <tbody role="rowgroup" key={activeKey + ':' + current}>
          {rows.map((run) => {
            const levels = new Map(run.items.map((item) => [item.competencyId, item]));
            return (
              <tr key={run.runId} role="row">
                <th scope="row" role="rowheader"><Link to={MANAGER_PATHS.member(run.employeeId)}>{run.employeeName}</Link><small>{run.employeeCode}</small></th>
                {columns.map((column) => {
                  const item = levels.get(column.competencyId);
                  const status = item ? levelStatus(item) : 'OUTSIDE_PATH';
                  return (
                    <td role="cell" key={column.competencyId}>
                      <span className="team-matrix-mobile-code" aria-hidden="true">{code(column)} · {translateUi(column.competencyName)}</span>
                      <span className="team-matrix-level" data-status={status}>
                        {item ? `${item.currentLevel || '—'} / ${item.requiredLevel || '—'}` : '—'}
                        <span className="sr-only"> · {translateUi(STATUS[status])}</span>
                      </span>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

export function TeamCompetencyMatrixPage() {
  useUiLanguage();
  const [selection, setSelection] = useState<{ departmentId?: string; page: number }>({ page: 1 });
  const { department, isLoading, isError, refetch } = useManagedDepartment();
  const page = selection.departmentId === department?.id ? selection.page : 1;
  const setPage = (next: number) => setSelection({ departmentId: department?.id, page: next });
  const query = useManagerSkillGapMatrix(page, 10, department?.id);
  const rows = query.data?.details ?? [];
  const totalPages = query.data?.totalPages ?? 1;

  if (isLoading) return <ManagerPage><SectionLoading label="Đang tải ma trận năng lực" /></ManagerPage>;
  if (isError) return <ManagerPage><LoadError message="Không tải được phòng ban bạn phụ trách." onRetry={refetch} /></ManagerPage>;
  if (!department) return <ManagerPage><ManagerPageHeader title="Ma trận năng lực" /><NoDepartment /></ManagerPage>;

  return (
    <ManagerPage>
      <ManagerPageHeader scope={department.name} title="Ma trận năng lực" subtitle="So sánh cấp độ hiện tại với cấp độ yêu cầu."
        actions={<Link className="manager-heading-back" to={MANAGER_PATHS.capability}><ArrowLeft size={16} aria-hidden="true" />{translateUi('Năng lực đội ngũ')}</Link>} />
      {query.isLoading ? <SectionLoading label="Đang tải ma trận năng lực" />
        : query.isError ? <LoadError message="Không tải được ma trận năng lực." onRetry={query.refetch} />
        : rows.length === 0 ? <p>{translateUi('Chưa có bản phân tích năng lực của thành viên trong phạm vi quản lý. Hãy chạy phân tích trước.')}</p>
        : <CompetencyMatrix key={department.id} rows={rows} />}
      {(totalPages > 1 || page > 1) && (
        <nav className="manager-matrix-pagination" aria-label={translateUi('Phân trang danh sách nhân viên')}>
          <button type="button" disabled={page <= 1 || query.isFetching} onClick={() => setPage(page - 1)}>{translateUi('Trước')}</button>
          <span>{translateUi('Trang')} {page}{query.data && ` / ${totalPages}`}</span>
          <button type="button" disabled={page >= totalPages || query.isFetching} onClick={() => setPage(page + 1)}>{translateUi('Sau')}</button>
        </nav>
      )}
    </ManagerPage>
  );
}
