import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, BrainCircuit, Check, ChevronDown, Database, Lightbulb, MessagesSquare, PenTool, RefreshCw, Search, ShieldCheck, Users } from 'lucide-react';
import { useLearningNeeds } from '@/hooks/use-skill-gaps';
import { useDepartments } from '@/hooks/use-departments';
import { useJobPositions } from '@/hooks/use-job-positions';
import { LoadingProgress } from '@/components/shared/LoadingState';
import { OwnerFilterSelect } from '../components/OwnerFilterSelect';
import type { LearningNeedsOverview } from '@/services/intelligence.service';
import './owner-learning-overview.css';

const DOMAIN_STYLES = [
  { icon: Database, color: '#0d9588' }, { icon: MessagesSquare, color: '#2b8ab7' },
  { icon: PenTool, color: '#9970c6' }, { icon: ShieldCheck, color: '#279d87' },
  { icon: Lightbulb, color: '#c08c35' }, { icon: BrainCircuit, color: '#5a7dc5' },
];
const LEVELS = ['', 'Cơ bản', 'Trung cấp', 'Nâng cao'];
const progress = (met: number, assessed: number) => assessed ? Math.round(met / assessed * 100) : null;

export function CompanyLearningOverview({ overview }: { overview: LearningNeedsOverview }) {
  useUiLanguage();
  const [selected, setSelected] = useState<string>();
  const active = overview.domains.find((d) => d.categoryId === selected)
    ?? overview.domains.find((d) => d.needsLearning > 0) ?? overview.domains[0];
  const style = DOMAIN_STYLES[(active?.number ?? 1) - 1] ?? DOMAIN_STYLES[0];
  const ActiveIcon = style.icon;
  const assessed = overview.domains.reduce((sum, domain) => sum + domain.assessed, 0);
  const met = overview.domains.reduce((sum, domain) => sum + domain.met, 0);
  const percent = progress(met, assessed);
  const missing = [...new Set(active?.courses.flatMap((course) => course.missingCompetencies) ?? [])];
  return <>
    <section className="company-gap-board" aria-label={translateUi("Tổng quan năng lực doanh nghiệp")}>
      <div className="company-gap-pulse">
        <span className="company-gap-eyebrow">{translateUi("TOÀN CẢNH NĂNG LỰC")}</span>
        <div className="company-gap-ring" role="progressbar" aria-label={translateUi("Đạt chuẩn theo lĩnh vực trong doanh nghiệp")} aria-valuenow={percent ?? undefined} aria-valuemin={0} aria-valuemax={100} aria-valuetext={percent == null ? 'Chờ đánh giá' : `${met} trên ${assessed} lượt đối chiếu nhân viên với chuẩn lĩnh vực đã đạt`} title={translateUi("Chỉ tính các lĩnh vực đã có kết quả đánh giá; người chưa đánh giá chưa được tính.")} style={{ '--progress': `${percent ?? 0}%` } as CSSProperties}>
          <div><strong>{percent == null ? '—' : `${percent}%`}</strong><span>{translateUi("đạt chuẩn")}</span></div>
        </div>
        <h2>{percent == null ? 'Sẵn sàng đối chiếu' : percent === 100 ? 'Đội ngũ đã đạt chuẩn' : translateUi('Thu hẹp khoảng trống')}</h2>
        <p>{percent == null ? translateUi('Chờ kết quả đánh giá tổng thể.') : translateUi('Theo chuẩn vị trí · các lĩnh vực đã đánh giá')}</p>
        <div className="company-gap-coverage"><span><i />{overview.assessedEmployees}/{overview.employees}{translateUi(" nhân sự đã đối chiếu")}</span>{overview.waitingEmployees > 0 && <Link to="/enterprise/trial">{overview.waitingEmployees}{translateUi(" chờ đánh giá ")}<ArrowRight size={13} /></Link>}{overview.noStandardEmployees > 0 && <Link to="/enterprise/setup">{overview.noStandardEmployees}{translateUi(" chưa có chuẩn vị trí ")}<ArrowRight size={13} /></Link>}</div>
      </div>
      <div className="company-gap-domain-area">
        <div className="company-gap-section-top"><h2>{translateUi("Cần cải thiện ở đâu?")}</h2><span>{translateUi("Theo lĩnh vực")}</span></div>
        {overview.domains.length ? <div className="company-gap-domain-grid">{overview.domains.map((domain) => {
          const palette = DOMAIN_STYLES[domain.number - 1] ?? DOMAIN_STYLES[0];
          const Icon = palette.icon;
          const value = progress(domain.met, domain.assessed);
          return <button key={domain.categoryId} type="button" className={`company-gap-domain ${domain.categoryId === active?.categoryId ? 'is-selected' : ''}`} aria-pressed={domain.categoryId === active?.categoryId} onClick={() => setSelected(domain.categoryId)} style={{ '--domain': palette.color } as CSSProperties}>
            <span className="company-gap-domain-icon"><Icon size={19} /></span><h3>{translateUi(domain.name)}</h3>
            <div className="company-gap-domain-status"><span>{domain.needsLearning ? translateUi(`${domain.needsLearning} cần bổ sung`) : value === null ? translateUi('Chờ đánh giá') : translateUi('Đã đáp ứng')}</span><strong>{value == null ? '—' : `${value}%`}</strong></div>
            <div className="company-gap-track" role="progressbar" aria-label={translateUi(`Đạt chuẩn ${domain.name}`)} aria-valuenow={value ?? undefined} aria-valuemin={0} aria-valuemax={100} aria-valuetext={value == null ? 'Chưa có đánh giá' : `${domain.met} trên ${domain.assessed} nhân viên đã đánh giá đạt chuẩn`}><span style={{ width: `${value ?? 0}%` }} /></div>
          </button>;
        })}</div> : <div className="company-gap-empty"><ShieldCheck size={30} /><p>{translateUi("Thiết lập chuẩn vị trí để bắt đầu đối chiếu.")}</p><Link to="/enterprise/setup">{translateUi("Thiết lập chuẩn ")}<ArrowRight size={15} /></Link></div>}
      </div>
    </section>

    {active && <section className="company-gap-focus" style={{ '--domain': style.color } as CSSProperties} aria-label={translateUi(`Cải thiện ${active.name}`)}>
      <header><span className="company-gap-focus-icon"><ActiveIcon size={23} /></span><div><span className="company-gap-eyebrow">{translateUi("LĨNH VỰC ĐANG XEM")}</span><h2>{translateUi(active.name)}</h2></div><span className="company-gap-focus-state">{active.needsLearning ? translateUi('Cần bổ sung') : active.assessed ? <><Check size={14} />{translateUi(" Đã đáp ứng")}</> : translateUi('Chờ đánh giá')}</span></header>
      <div className="company-gap-focus-body" key={active.categoryId}>
        <div className="company-gap-missing"><h3>{translateUi("Năng lực còn thiếu")}</h3>{missing.length ? <ul>{missing.map((name) => <li key={name}><span /><span>{name}</span></li>)}</ul> : <p>{active.assessed ? 'Các năng lực đã đánh giá đều đáp ứng chuẩn vị trí.' : 'Có kết quả đánh giá để xác định năng lực cần bổ sung.'}</p>}</div>
        <div className="company-gap-course-area"><h3>{translateUi("Khóa học bù đắp")}</h3>{active.courses.length ? active.courses.map((course) => <article key={course.requiredLevel} className="company-gap-course">
          <span className="company-gap-course-level">{LEVELS[course.requiredLevel]}</span><BookOpen className="company-gap-course-art" size={32} aria-hidden="true" />
          <h4>{course.courseTitle ?? 'Chưa có khóa học tương ứng'}</h4>
          <div className="company-gap-course-footer"><span>{course.courseCode} · {course.employees}{translateUi(" nhân sự cần")}</span>{course.courseId && <Link to={`/enterprise/courses?focus=${encodeURIComponent(course.courseId)}`}>{translateUi("Xem khóa học ")}<ArrowRight size={15} /></Link>}</div>
        </article>) : <div className="company-gap-course-empty"><Check size={21} /><p>{active.assessed ? 'Chưa cần bổ sung khóa học.' : 'Khóa học sẽ xuất hiện khi có kết quả đối chiếu.'}</p></div>}</div>
      </div>
    </section>}
  </>;
}

export function OwnerCapabilityGapPage() {
  useUiLanguage();
  const [departmentId, setDepartmentId] = useState('');
  const [jobPositionId, setJobPositionId] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [peopleOpen, setPeopleOpen] = useState(false);
  const departments = useDepartments({ pageSize: 100 }).data?.items ?? [];
  const positions = useJobPositions({
    pageSize: 100,
    departmentId: departmentId || undefined,
    includeAssignedPositions: !!departmentId,
  }).data?.items ?? [];
  const scope = { departmentId: departmentId || undefined, jobPositionId: jobPositionId || undefined };
  const company = useLearningNeeds({ ...scope, pageIndex: 1, pageSize: 1 });
  const people = useLearningNeeds({ ...scope, search: search || undefined, pageIndex: page, pageSize }, peopleOpen);
  return <div className="company-gap-page">
    <header className="company-gap-page-header"><h1>{translateUi("Khoảng trống năng lực")}</h1><div>
      <OwnerFilterSelect label={translateUi("Phòng ban")} value={departmentId} onChange={(value) => { setDepartmentId(value); setJobPositionId(''); setPage(1); }} options={[{ value: '', label: 'Toàn doanh nghiệp' }, ...departments.map((d) => ({ value: d.id, label: d.name }))]} />
      <OwnerFilterSelect label={translateUi("Vị trí")} value={jobPositionId} onChange={(value) => { setJobPositionId(value); setPage(1); }} options={[{ value: '', label: 'Tất cả vị trí' }, ...positions.map((p) => ({ value: p.id, label: p.name }))]} />
      <button className="company-gap-refresh" type="button" aria-label={translateUi("Làm mới")} onClick={() => { void company.refetch(); if (peopleOpen) void people.refetch(); }} disabled={company.isFetching}><RefreshCw size={17} /></button>
    </div></header>
    {(company.isLoading || company.isFetching) && (
      <div className={company.isLoading ? 'company-gap-loading' : undefined}>
        <LoadingProgress label="Đang đối chiếu năng lực…" />
      </div>
    )}
    {!company.isLoading && (company.isError
      ? <div role="alert" className="company-gap-loading">{translateUi("Không tải được kết quả. Vui lòng làm mới.")}</div>
      : company.data?.overview && <CompanyLearningOverview overview={company.data.overview} />)}

    <section className="company-gap-people">
      <button className="company-gap-people-toggle" type="button" aria-expanded={peopleOpen} aria-controls="company-gap-people-content" onClick={() => setPeopleOpen(!peopleOpen)}><Users size={20} /><span>{translateUi("Tra cứu nhân viên")}</span><span className="company-gap-people-hint">{translateUi("Xem chi tiết từng người")}</span><ChevronDown size={18} /></button>
      <div className={`company-gap-people-reveal ${peopleOpen ? 'is-open' : ''}`} inert={!peopleOpen}><div><div id="company-gap-people-content" className="company-gap-people-content">
        <div className="company-gap-people-tools"><label><Search size={16} /><input type="search" aria-label={translateUi("Tìm nhân viên")} placeholder={translateUi("Tìm tên hoặc mã nhân viên")} value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></label><OwnerFilterSelect label={translateUi("Số nhân viên mỗi trang")} value={String(pageSize)} onChange={(value) => { setPageSize(Number(value)); setPage(1); }} options={[5, 10, 15, 20].map((n) => ({ value: String(n), label: `${n} / trang` }))} /></div>
        {people.isLoading ? <p role="status">{translateUi("Đang tải…")}</p> : people.isError ? <p role="alert">{translateUi("Không tải được danh sách nhân viên.")}</p> : people.data?.items.length ? <div className="company-gap-people-list">{people.data.items.map((employee) => <Link key={employee.employeeId} to={`/enterprise/skill-gap/${employee.employeeId}`}><span className="company-gap-person-avatar">{employee.employeeName.split(' ').slice(-2).map((s) => s[0]).join('')}</span><div><strong>{employee.employeeName}</strong><small>{[employee.departmentName, employee.positionName].filter((s, i, all) => s && all.indexOf(s) === i).join(' · ')}</small></div><span className={`company-gap-person-state is-${employee.state.toLowerCase()}`}>{({ NEEDS_LEARNING: 'Cần bổ sung', MET: 'Đã đáp ứng', WAITING_ASSESSMENT: 'Chờ đánh giá', NO_STANDARD: 'Chưa có chuẩn' })[employee.state]}</span><ArrowRight size={16} /></Link>)}</div> : <p>{translateUi("Không có nhân viên phù hợp.")}</p>}
        {people.data && people.data.totalPages > 1 && <nav className="company-gap-pagination" aria-label={translateUi("Phân trang nhân viên")}><span>{translateUi("Trang ")}{page} / {people.data.totalPages}</span><div><button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>{translateUi("Trước")}</button><button type="button" disabled={page >= people.data.totalPages} onClick={() => setPage(page + 1)}>{translateUi("Sau ")}<ArrowRight size={13} /></button></div></nav>}
      </div></div></div>
    </section>
  </div>;
}
