import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, BrainCircuit, Check, ChevronRight, Database, Lightbulb, MessagesSquare, PenTool, RefreshCw, Search, ShieldCheck } from 'lucide-react';
import { useReportsOverview } from '@/hooks/use-analytics';
import { useLearningNeeds } from '@/hooks/use-skill-gaps';
import { useDepartments } from '@/hooks/use-departments';
import { useJobPositions } from '@/hooks/use-job-positions';
import { OwnerFilterSelect } from '../components/OwnerFilterSelect';
import { PULSE_TOKENS } from '../owner-theme';
import './owner-cycle-report.css';

const DOMAINS = [
  { icon: Database, color: '#328e9c' }, { icon: MessagesSquare, color: '#588fc0' },
  { icon: PenTool, color: '#9674ba' }, { icon: ShieldCheck, color: '#329b79' },
  { icon: Lightbulb, color: '#bd805b' }, { icon: BrainCircuit, color: '#716bb0' },
];
const LEVELS = ['', 'Cơ bản', 'Trung cấp', 'Nâng cao'];
const percent = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export function OwnerCycleReportPage() {
  useUiLanguage();
  const [departmentId, setDepartmentId] = useState('');
  const [positionId, setPositionId] = useState('');
  const scope = { departmentId: departmentId || undefined, jobPositionId: positionId || undefined };
  const needs = useLearningNeeds({ ...scope, pageIndex: 1, pageSize: 1 });
  const reports = useReportsOverview(scope);
  const departments = useDepartments({ pageSize: 100 }).data?.items ?? [];
  const positions = useJobPositions({ pageSize: 100 }).data?.items ?? [];
  const [selectedDomain, setSelectedDomain] = useState<number>();
  const [courseSearch, setCourseSearch] = useState('');
  const [coursePage, setCoursePage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [sort, setSort] = useState('progress');
  const overview = needs.data?.overview;
  const domains = [...(overview?.domains ?? [])].sort((a, b) => a.number - b.number);
  const priority = [...domains].filter((d) => d.needsLearning > 0).sort((a, b) => b.needsLearning / b.assessed - a.needsLearning / a.assessed || b.needsLearning - a.needsLearning)[0];
  const active = domains.find((d) => d.number === selectedDomain) ?? priority ?? domains[0];
  const comparisons = domains.reduce((sum, d) => sum + d.assessed, 0);
  const met = domains.reduce((sum, d) => sum + d.met, 0);
  const coverage = comparisons ? percent(met / comparisons * 100) : null;
  const training = reports.data?.training;
  const filteredCourses = (training?.courses ?? []).filter((course) => course.learnerCount > 0 && `${course.code} ${course.title} ${course.domainName ?? ''}`.toLocaleLowerCase('vi').includes(courseSearch.trim().toLocaleLowerCase('vi'))).sort((a, b) => sort === 'name' ? a.title.localeCompare(b.title, 'vi') : sort === 'learners' ? b.learnerCount - a.learnerCount : a.averageProgress - b.averageProgress);
  const pageCount = Math.max(1, Math.ceil(filteredCourses.length / pageSize));
  const safePage = Math.min(coursePage, pageCount);
  const busy = needs.isFetching || reports.isFetching;
  const changeScope = () => { setCoursePage(1); setSelectedDomain(undefined); };
  const refresh = () => { void needs.refetch(); void reports.refetch(); };
  const palette = DOMAINS[(active?.number ?? 1) - 1] ?? DOMAINS[0];
  const ActiveIcon = palette.icon;

  return <div className="po-owner cycle-report-page -m-4 md:-m-6 min-h-screen" style={PULSE_TOKENS}>
    <div className="cycle-report-shell">
      <header className="cycle-page-heading"><div><span className="cycle-page-kicker">{translateUi("PHÁT TRIỂN ĐỘI NGŨ")}</span><h1>{translateUi("Từ năng lực đến hành động")}</h1></div><div className="cycle-scope">
        <OwnerFilterSelect label={translateUi("Phòng ban báo cáo")} value={departmentId} onChange={(value) => { setDepartmentId(value); setPositionId(''); changeScope(); }} options={[{ value: '', label: 'Toàn doanh nghiệp' }, ...departments.map((d) => ({ value: d.id, label: d.name }))]} />
        <OwnerFilterSelect label={translateUi("Vị trí báo cáo")} value={positionId} onChange={(value) => { setPositionId(value); changeScope(); }} options={[{ value: '', label: 'Tất cả vị trí' }, ...positions.filter((p) => !departmentId || p.departmentId === departmentId).map((p) => ({ value: p.id, label: p.name }))]} />
        <button type="button" className="cycle-refresh" aria-label={translateUi("Làm mới báo cáo")} onClick={refresh} disabled={busy}><RefreshCw size={17} className={busy ? 'animate-spin' : ''} /></button>
      </div></header>
      {needs.isLoading ? <div className="cycle-feedback" role="status">{translateUi("Đang đối chiếu với chuẩn vị trí…")}</div> : needs.isError ? <div className="cycle-feedback" role="alert">{translateUi("Không tải được kết quả năng lực. ")}<button type="button" onClick={() => void needs.refetch()}>{translateUi("Thử lại")}</button></div> : overview && <>
        <section className="cycle-outcome" aria-label={translateUi("Kết quả năng lực doanh nghiệp")}>
          <div className="cycle-outcome-main"><span className="cycle-eyebrow">{translateUi("MỨC ĐÁP ỨNG VỊ TRÍ")}</span><div className="cycle-outcome-body"><div className="cycle-outcome-ring" style={{ '--coverage': `${coverage ?? 0}%` } as CSSProperties}><div><strong>{coverage == null ? '—' : `${coverage}%`}</strong><span>{translateUi("đạt chuẩn")}</span></div></div><div><h2>{!overview.employees ? translateUi('Chưa có nhân sự') : !comparisons ? translateUi('Chờ kết quả đánh giá') : priority ? translateUi(`Còn ${domains.filter((d) => d.needsLearning > 0).length} lĩnh vực cần nâng cấp`) : translateUi('Nhân viên đã đánh giá đều đạt chuẩn')}</h2><p>{comparisons ? translateUi(`${met} / ${comparisons} lượt đối chiếu lĩnh vực đã đạt chuẩn`) : translateUi('Đánh giá nhân viên để xác định năng lực cần bổ sung.')}</p><Link to="/enterprise/skill-gap">{translateUi("Xem khoảng trống ")}<ArrowRight size={15} /></Link></div></div></div>
          <div className="cycle-outcome-side"><Link to="/enterprise/trial"><span>{translateUi("Cần đánh giá")}</span><strong>{overview.waitingEmployees}<small>{translateUi("nhân viên")}</small></strong><ChevronRight size={17} /></Link><Link to="/enterprise/setup"><span>{translateUi("Cần thiết lập chuẩn")}</span><strong>{overview.noStandardEmployees}<small>{translateUi("nhân viên")}</small></strong><ChevronRight size={17} /></Link><p>{overview.assessedEmployees} / {overview.employees}{translateUi(" nhân viên đã được đối chiếu")}</p></div>
        </section>
        <section className="cycle-section cycle-capability-story" aria-labelledby="cycle-domains-title"><header className="cycle-section-heading"><h2 id="cycle-domains-title">{translateUi("Năng lực theo lĩnh vực")}</h2><span>{translateUi("Đạt chuẩn / đã đánh giá")}</span></header>
          {domains.length ? <div className="cycle-analysis-layout"><div className="cycle-domain-grid" aria-label={translateUi("Biểu đồ so sánh lĩnh vực")}>{domains.map((domain) => { const tone = DOMAINS[domain.number - 1] ?? DOMAINS[0]; const Icon = tone.icon; const rate = domain.assessed ? percent(domain.met / domain.assessed * 100) : null; return <button key={domain.categoryId} data-assessed={domain.assessed > 0} type="button" className={`cycle-domain-card ${domain.number === active?.number ? 'is-active' : ''}`} style={{ '--domain': tone.color } as CSSProperties} aria-pressed={domain.number === active?.number} onClick={() => setSelectedDomain(domain.number)}><span className="cycle-domain-icon"><Icon size={21} /></span><span className="cycle-domain-index" aria-hidden="true">0{domain.number}</span><strong>{translateUi(domain.name)}</strong><div className="cycle-domain-result"><span>{domain.assessed ? translateUi(`${domain.met} / ${domain.assessed} đạt chuẩn`) : translateUi('Chưa có kết quả')}</span><b>{rate == null ? '—' : `${rate}%`}</b></div><div className="cycle-progress" role="progressbar" aria-label={translateUi(`Tỷ lệ đạt chuẩn ${domain.name}`)} aria-valuenow={rate ?? undefined} aria-valuemin={0} aria-valuemax={100}><i style={{ height: `${rate ?? 0}%` }} /></div><footer><span>{domain.needsLearning ? translateUi(`${domain.needsLearning} cần bổ sung`) : domain.assessed ? translateUi('Đã đáp ứng') : translateUi('Chờ đánh giá')}</span></footer></button>; })}</div>
          {active && <div key={active.categoryId} className="cycle-domain-detail" style={{ '--domain': palette.color } as CSSProperties}><header><span><ActiveIcon size={19} /></span><h3>{translateUi(active.name)}</h3>{active.number === priority?.number && <small>{translateUi("Ưu tiên")}</small>}</header>
            {active.courses.length ? <div className="cycle-remedy-grid"><div><h4>{translateUi("Năng lực cần bổ sung")}</h4><ul>{[...new Set(active.courses.flatMap((course) => course.missingCompetencies))].map((name) => <li key={name}>{name}</li>)}</ul></div><div className="cycle-remedy-courses"><h4>{translateUi("Lộ trình đề xuất")}</h4>{active.courses.map((course) => <article key={course.requiredLevel}><div><span>{LEVELS[course.requiredLevel]} · {course.employees}{translateUi(" nhân viên cần")}</span><strong>{course.courseTitle ?? 'Chưa có khóa học tương ứng'}</strong></div>{course.courseId && <Link to={`/enterprise/courses?focus=${encodeURIComponent(course.courseId)}`} aria-label={translateUi(`Xem khóa học ${course.courseTitle}`)}>{course.courseCode}<ArrowRight size={16} /></Link>}</article>)}</div></div> : <div className="cycle-domain-status"><Check size={20} /><p>{active.assessed ? translateUi('Nhân viên đã đánh giá đều đáp ứng lĩnh vực này.') : translateUi('Chờ đánh giá để xác định năng lực cần bổ sung.')}</p></div>}
          </div>}</div> : <div className="cycle-feedback"><p>{translateUi("Chưa có chuẩn vị trí để lập báo cáo năng lực.")}</p><Link to="/enterprise/setup">{translateUi("Thiết lập chuẩn vị trí ")}<ArrowRight size={15} /></Link></div>}
        </section>
      </>}
      <section className="cycle-section cycle-training" aria-labelledby="cycle-training-title"><header className="cycle-section-heading"><h2 id="cycle-training-title">{translateUi("Tiến độ đào tạo")}</h2><Link to="/enterprise/courses">{translateUi("Danh mục khóa học ")}<ArrowRight size={15} /></Link></header>
        {reports.isLoading ? <p className="cycle-feedback" role="status">{translateUi("Đang tải tiến độ học tập…")}</p> : reports.isError ? <div className="cycle-feedback" role="alert">{translateUi("Không tải được tiến độ đào tạo. ")}<button type="button" onClick={() => void reports.refetch()}>{translateUi("Thử lại")}</button></div> : training && <>
          <div className="cycle-training-summary"><div><span>{translateUi("Đã hoàn thành")}</span><strong>{training.totalAssignments ? `${percent(training.completionRate)}%` : '—'}</strong><small>{training.completedAssignments} / {training.totalAssignments}{translateUi(" lượt giao")}</small></div><div><span>{translateUi("Đang học")}</span><strong>{training.inProgressAssignments}</strong><Link to="/enterprise/assignments">{translateUi("Xem phân công ")}<ArrowRight size={14} /></Link></div></div>
          {training.totalAssignments > 0 || filteredCourses.length > 0 || courseSearch ? <><div className="cycle-course-tools"><label className="cycle-course-search"><Search size={17} /><input type="search" value={courseSearch} onChange={(e) => { setCourseSearch(e.target.value); setCoursePage(1); }} placeholder={translateUi("Tìm khóa học")} aria-label={translateUi("Tìm khóa học báo cáo")} /></label><OwnerFilterSelect label={translateUi("Sắp xếp khóa học báo cáo")} value={sort} onChange={(value) => { setSort(value); setCoursePage(1); }} options={[{ value: 'progress', label: 'Tiến độ thấp trước' }, { value: 'learners', label: 'Nhiều lượt học trước' }, { value: 'name', label: 'Tên khóa học' }]} /><OwnerFilterSelect label={translateUi("Số khóa học mỗi trang")} value={String(pageSize)} onChange={(value) => { setPageSize(Number(value)); setCoursePage(1); }} options={[5, 10, 15, 20].map((size) => ({ value: String(size), label: `${size} / trang` }))} /></div>
            <div className="cycle-ledger-heading" aria-hidden="true"><span>{translateUi("Khóa học đang triển khai")}</span><span>{translateUi("Trạng thái & tiến độ")}</span></div><div className="cycle-course-list">{filteredCourses.slice((safePage - 1) * pageSize, safePage * pageSize).map((course) => {
const domainNumber = Number(course.code.match(/^[AM](\d)/i)?.[1] ?? 1);
const tone = DOMAINS[domainNumber - 1] ?? DOMAINS[0]; const CourseIcon = tone.icon; const progress = percent(course.averageProgress);
return <Link key={course.id} className="cycle-course-row" style={{ "--domain": tone.color } as CSSProperties} to={"/enterprise/courses?focus=" + encodeURIComponent(course.id)}>
<span className="cycle-course-code"><CourseIcon size={22} /><span>{course.code}</span></span>
<div><strong>{translateUi(course.title)}</strong><small>{translateUi(course.domainName) || translateUi("Khóa học")} · {course.learnerCount}{translateUi(" lượt học")}</small></div>
<span className="cycle-course-progress"><span><small>{progress === 100 ? translateUi("Đã hoàn thành") : progress === 0 ? translateUi("Chưa bắt đầu") : translateUi("Đang tiến triển")}</small><b>{progress}%</b></span><i><i style={{ width: progress + "%" }} /></i></span><span className="cycle-course-open"><ArrowRight size={18} /></span>
</Link>; })}</div>{!filteredCourses.length && <p className="cycle-feedback">{translateUi("Không có khóa học phù hợp.")}</p>}
            <nav className="cycle-pagination" aria-label={translateUi("Phân trang báo cáo khóa học")}><span>{filteredCourses.length ? `${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, filteredCourses.length)}` : '0'} / {filteredCourses.length}{translateUi(" khóa")}</span>{pageCount > 1 && <div><button type="button" disabled={safePage <= 1} onClick={() => setCoursePage(safePage - 1)}>{translateUi("Trước")}</button><span>{translateUi("Trang ")}{safePage}/{pageCount}</span><button type="button" disabled={safePage >= pageCount} onClick={() => setCoursePage(safePage + 1)}>{translateUi("Sau")}</button></div>}</nav>
          </> : <div className="cycle-feedback"><BookOpen size={25} /><p>{translateUi("Chưa giao khóa học trong phạm vi này.")}</p><Link to="/enterprise/courses">{translateUi("Chọn khóa học ")}<ArrowRight size={15} /></Link></div>}
        </>}
      </section>
    </div>
  </div>;
}
