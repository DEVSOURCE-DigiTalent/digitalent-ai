import { OwnerFilterSelect } from '@/features/organization/components/OwnerFilterSelect';
import { useId, useState } from 'react';
import { BarChart3, BrainCircuit, ChevronDown, Database, Lightbulb, MessagesSquare, Palette, Search, ShieldCheck, Target, Users } from 'lucide-react';
import { PageLoading, SectionLoading } from '@/components/shared/LoadingState';
import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useManagedDepartment } from '@/hooks/use-managed-department';
import { useDepartmentWorkforce, useEmployeeCapability } from '@/hooks/use-workforce';
import { BLOCKER_LABELS, type EmployeeCapability, type EvidenceSource, type WorkforceRow } from '@/services/workforce.service';
import { Bar, Empty, LoadError, PuLink } from '@/features/pulse-employee/components/ui';
import { ManagerPage, ManagerPageHeader, NoDepartment } from '../components/ManagerUi';
import { buildCapability, type CapabilityDomain, type LevelStatus } from '../lib/capability';
import { MANAGER_PATHS } from '../lib/paths';
import './manager-capability.css';

const STATUS: Record<LevelStatus, string> = {
  MET: 'Đạt yêu cầu', GAP: 'Chưa đạt', PENDING: 'Chưa xác nhận mức', OUTSIDE_PATH: 'Ngoài lộ trình',
};
const DOMAIN_ICONS = [Database, MessagesSquare, Palette, ShieldCheck, Lightbulb, BrainCircuit];
const STATUS_KEYS = Object.keys(STATUS) as LevelStatus[];
const SOURCES: Record<EvidenceSource, string> = {
  MIGRATION: 'Dữ liệu chuyển đổi', ASSESSMENT: 'Bài đánh giá', TASK: 'Nhiệm vụ thực tế', MANUAL: 'Xác nhận thủ công',
};
const level = (value: number | null) => value != null && value > 0 ? `L${value}` : '—';
const searchKey = (value: string) => value.toLocaleLowerCase('vi').normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/đ/g, 'd');

export function ManagerCapabilityPage() {
  useUiLanguage();
  const { department, isLoading, isError, refetch } = useManagedDepartment();
  const team = useDepartmentWorkforce(department?.id);
  const people = (team.data ?? []).filter((row) => row.departmentId === department?.id);

  return (
    <ManagerPage testId="manager-capability">
      <ManagerPageHeader scope={department?.name} title="Năng lực đội ngũ" />
      {isLoading || (department && team.isLoading) ? <PageLoading label="Đang tải năng lực đội ngũ" />
        : isError || team.isError ? <LoadError message="Không tải được nhân sự của phòng ban." onRetry={isError ? refetch : team.refetch} />
        : !department ? <NoDepartment />
        : people.length === 0 ? <Empty icon={<BarChart3 size={24} />} title="Phòng ban chưa có nhân viên." />
        : <DepartmentCapabilities key={department.id} people={people} />}
    </ManagerPage>
  );
}

function DepartmentCapabilities({ people }: { people: WorkforceRow[] }) {
  const [selectedId, setSelectedId] = useState(people[0].id);
  const employee = people.find(({ id }) => id === selectedId) ?? people[0];
  const capability = useEmployeeCapability(employee.id);
  const evaluated = people.filter(({ hasSnapshot }) => hasSnapshot).length;
  const model = buildCapability(capability.data?.competencies ?? []);
  const { summary } = model;

  return (
    <div className="mc-workspace">
      <div className="mc-controls">
        <div className="mc-person-select">
          <span>{translateUi('Nhân sự')}</span>
          <OwnerFilterSelect variant="manager" label="Nhân sự" value={employee.id} onChange={setSelectedId}
            options={people.map(({ id, fullName }) => ({ value: id, label: fullName }))} />
        </div>
        <div className="mc-position">
          <small>{translateUi('Vị trí công việc')}</small>
          <strong>{employee.jobPositionName || employee.positionName || translateUi('Chưa có vị trí')}</strong>
          {employee.blocker && BLOCKER_LABELS[employee.blocker] && <small>{translateUi(BLOCKER_LABELS[employee.blocker])}</small>}
        </div>
        <div className="pu-row">
          <PuLink to={MANAGER_PATHS.member(employee.id)} kind="outline" small>{translateUi('Hồ sơ nhân viên')}</PuLink>
          <PuLink to={MANAGER_PATHS.matrix} kind="ghost" small>{translateUi('Ma trận năng lực')}</PuLink>
        </div>
      </div>
      <dl className="mc-metrics">
        <div><Users size={19} aria-hidden="true" /><dt>{translateUi('Nhân viên có kết quả đối chiếu')}</dt><dd>{evaluated}<small> / {people.length}</small></dd><span>{translateUi('Phòng ban')}</span></div>
        <div><ShieldCheck size={19} aria-hidden="true" /><dt>{translateUi('Năng lực yêu cầu đã xác nhận')}</dt><dd>{capability.data ? <>{summary.measured}<small> / {summary.targets}</small></> : '—'}</dd><span>{translateUi('Nhân viên đang xem')}</span></div>
        <div data-tone="gap"><Target size={19} aria-hidden="true" /><dt>{translateUi('Khoảng cách đã xác nhận')}</dt><dd>{summary.measured ? summary.gaps : '—'}</dd><span>{translateUi(summary.measured ? 'Trong các năng lực đã xác nhận' : capability.data ? 'Chưa đủ dữ liệu đối chiếu' : 'Chưa có số liệu')}</span></div>
      </dl>
      {capability.isLoading ? <SectionLoading label="Đang tải năng lực nhân viên" />
        : capability.isError || !capability.data ? <LoadError message="Không tải được hồ sơ năng lực của nhân viên này." onRetry={capability.refetch} />
        : <EmployeeCapabilities key={employee.id} data={capability.data} model={model} />}
    </div>
  );
}

function EmployeeCapabilities({ data, model }: { data: EmployeeCapability; model: ReturnType<typeof buildCapability> }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [expanded, setExpanded] = useState<string>();
  const [detail, setDetail] = useState<string>();
  const { domains, summary } = model;
  const query = searchKey(search.trim());
  const filtering = Boolean(query || category || status);
  const visible = domains.filter((domain) => !category || domain.name === category).map((domain) => ({
    ...domain, allRows: domain.rows, rows: domain.rows.filter((row) => (!status || row.status === status) &&
      searchKey(`${row.frameworkCode} ${row.name} ${translateUi(row.name)}`).includes(query)),
  })).filter(({ rows }) => rows.length > 0);
  const activeDomain = visible.find(({ name }) => name === expanded)
    ?? (expanded == null && (filtering || domains.length === 1) ? visible[0] : undefined);
  const panelId = useId();
  const recommendations = data.recommendations ?? [];
  const coverage = summary.measured > 0 ? data.summary.coveragePercent : null;

  function reset() {
    setSearch(''); setCategory(''); setStatus(''); setExpanded(undefined); setDetail(undefined);
  }

  return <>
    <section className="mc-panel" aria-labelledby="mc-levels-title">
      <header className="mc-section-head">
        <h2 id="mc-levels-title">{translateUi('Đối chiếu theo lĩnh vực')}</h2>
        {coverage != null && <div className="mc-coverage">
          <span>{translateUi('Độ phủ mục tiêu')} <strong>{Math.round(coverage)}%</strong></span>
          <Bar value={coverage} label={translateUi('Độ phủ mục tiêu')} />
        </div>}
      </header>
      {domains.length === 0 ? <p>{translateUi('Chưa có năng lực để đối chiếu theo vị trí.')}</p> : <>
        <div className="mc-filters">
          <label className="mc-search"><Search size={16} aria-hidden="true" />
            <input type="search" aria-label={translateUi('Tìm năng lực')} placeholder={translateUi('Tìm theo tên hoặc mã năng lực')} value={search}
              onChange={(event) => { setSearch(event.target.value); setExpanded(undefined); setDetail(undefined); }} />
          </label>
          <OwnerFilterSelect variant="manager" label="Lọc theo lĩnh vực" value={category}
            onChange={(value) => { setCategory(value); setExpanded(undefined); setDetail(undefined); }}
            options={[{ value: '', label: 'Tất cả lĩnh vực' }, ...domains.map(({ name }) => ({ value: name, label: name }))]} />
          <OwnerFilterSelect variant="manager" label="Lọc theo trạng thái" value={status}
            onChange={(value) => { setStatus(value); setExpanded(undefined); setDetail(undefined); }}
            options={[{ value: '', label: 'Mọi trạng thái' }, ...STATUS_KEYS.map((key) => ({ value: key, label: STATUS[key] }))]} />
          {filtering && <button type="button" className="mc-link" onClick={reset}>{translateUi('Xóa bộ lọc')}</button>}
        </div>
        {visible.length === 0 && <p role="status">{translateUi('Không tìm thấy năng lực phù hợp.')}</p>}
        {visible.length > 0 && (
          <>
            <ul className="mc-legend" aria-label={translateUi('Chú giải trạng thái')} role="list">
              {STATUS_KEYS.map((key) => <li key={key} data-status={key}>{translateUi(STATUS[key])}</li>)}
            </ul>
            <div className="mc-groups">
              {visible.map((domain) => {
                const Icon = DOMAIN_ICONS[domain.order - 1] ?? BarChart3;
                const open = activeDomain?.name === domain.name;
                const stats = STATUS_KEYS.map((key) => ({
                  key,
                  count: domain.rows.filter((row) => row.status === key).length,
                })).filter(({ count }) => count > 0);
                return (
                  <button key={domain.name} type="button" className="mc-domain-card" aria-expanded={open} aria-controls={panelId}
                    onClick={() => { setExpanded(open ? '' : domain.name); setDetail(undefined); }}>
                    <span className="mc-domain-card__heading"><span className="mc-domain-icon"><Icon size={20} aria-hidden="true" /></span>
                      <strong>{translateUi(domain.name)}</strong><ChevronDown size={17} aria-hidden="true" />
                    </span>
                    <span className="mc-domain-bar" aria-hidden="true">
                      {stats.map(({ key, count }) => <i key={key} data-status={key} style={{ flexGrow: count }} />)}
                    </span>
                    <span className="mc-domain-card__counts">
                      <span>{domain.rows.length !== domain.allRows.length ? `${domain.rows.length}/${domain.allRows.length}` : domain.rows.length} {translateUi('năng lực')}</span>
                      {stats.map(({ key, count }) => <span className="mc-domain-count" key={key} data-status={key}>
                        <span className="sr-only">{translateUi(STATUS[key])}: </span>{count}
                      </span>)}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}
        <div id={panelId} hidden={!activeDomain}>
          {activeDomain && <CapabilityGroup key={activeDomain.name} domain={activeDomain} allRows={activeDomain.allRows} detail={detail} onDetail={setDetail} />}
        </div>
      </>}
    </section>

    <section className="mc-panel mc-recommendations" aria-labelledby="mc-recommendations-title">
      <div>
        <h2 id="mc-recommendations-title">{translateUi('Đào tạo đề xuất')}</h2>
        {recommendations.length === 0 && <p>{translateUi(summary.measured ? 'Chưa có khóa học phù hợp.' : 'Cần mức năng lực đã xác nhận để đề xuất khóa học.')}</p>}
      </div>
      <PuLink to={MANAGER_PATHS.training} kind="outline" small>{translateUi('Xem tiến độ đào tạo')}</PuLink>
      {recommendations.length > 0 && <ul>
        {recommendations.map((course) => <li key={course.courseId}><strong>{translateUi(course.title)}</strong>
          {course.reasons.length > 0 && <small>{course.reasons.map(({ competencyName }) => translateUi(competencyName)).join(' · ')}</small>}
        </li>)}
      </ul>}
    </section>
  </>;
}

function CapabilityGroup({ domain, allRows, detail, onDetail }: {
  domain: CapabilityDomain; allRows: CapabilityDomain['rows']; detail?: string;
  onDetail: (id?: string) => void;
}) {
  const locale = useUiLanguage();
  const shared = domain.rows[0].requiredLevel;
  const sharedTarget = shared > 0 && allRows.every((row) => row.requiredLevel === shared);
  return <section className="mc-group">
    <header className="mc-detail-heading">
      <h3>{translateUi(domain.name)}</h3>
      {sharedTarget && <span>{translateUi('Mức yêu cầu chung')} <b>{level(shared)}</b></span>}
    </header>
    <div className="mc-table" tabIndex={0} role="region" aria-label={translateUi(domain.name)}>
        <table>
          <thead><tr>
            <th scope="col">{translateUi('Năng lực')}</th><th scope="col">{translateUi('Mức hiện tại')}</th>
            <th scope="col">{translateUi('Mức yêu cầu')}</th><th scope="col">{translateUi('Trạng thái')}</th>
            <th scope="col">{translateUi('Chi tiết')}</th>
          </tr></thead>
          {domain.rows.map((row) => {
            const showDetail = detail === row.competencyId;
            return <tbody key={row.competencyId}>
              <tr>
                <th scope="row"><small>{row.frameworkCode}</small> {translateUi(row.name)}</th>
                <td><span className="mc-level" data-status={row.status}>{level(row.currentLevel)}</span></td>
                <td>{row.requiredLevel > 0 ? <span className="mc-level">{level(row.requiredLevel)}</span> : translateUi('Không yêu cầu')}</td>
                <td><span className="mc-badge" data-status={row.status}>
                  {translateUi(STATUS[row.status])}
                  {row.status === 'GAP' && row.currentLevel != null && ` · ${translateUi(`Còn ${row.requiredLevel - row.currentLevel} mức`)}`}
                </span></td>
                <td><button type="button" className="mc-link" aria-expanded={showDetail} aria-label={`${translateUi(showDetail ? 'Thu gọn' : 'Xem chi tiết')} · ${translateUi(row.name)}`} onClick={() => onDetail(showDetail ? undefined : row.competencyId)}>
                  {translateUi(showDetail ? 'Thu gọn' : 'Xem chi tiết')}
                </button></td>
              </tr>
              {showDetail && <tr className="mc-detail"><td colSpan={5}>
                <strong>{translateUi('Minh chứng xác nhận')}</strong>
                {row.source || row.confirmedAt || row.note ? <dl>
                  {row.source && <div><dt>{translateUi('Nguồn')}</dt><dd>{translateUi(SOURCES[row.source] ?? row.source)}</dd></div>}
                  {row.confirmedAt && <div><dt>{translateUi('Ngày xác nhận')}</dt><dd>{new Date(row.confirmedAt).toLocaleDateString(locale)}</dd></div>}
                  {row.note && <div><dt>{translateUi('Ghi chú')}</dt><dd>{row.note}</dd></div>}
                </dl> : <p>{translateUi('Chưa có minh chứng xác nhận.')}</p>}
              </td></tr>}
            </tbody>;
          })}
        </table>
    </div>
  </section>;
}
