import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2, ClipboardCheck, GraduationCap, Search, TrendingUp, UsersRound } from 'lucide-react';
import { useCapabilityDashboard, useReportsOverview } from '@/hooks/use-analytics';
import { PULSE_TOKENS } from '../owner-theme';
import { PageLoading } from '@/components/shared/LoadingState';
import './owner-cycle-report.css';

const PAGE_SIZE = 6;
const percent = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export function OwnerCycleReportPage() {
  const { data: dashboard, isLoading: dashboardLoading } = useCapabilityDashboard();
  const { data: reports, isLoading: reportsLoading } = useReportsOverview();
  const [courseView, setCourseView] = useState<'assigned' | 'all'>('assigned');
  const [courseSearch, setCourseSearch] = useState('');
  const [coursePage, setCoursePage] = useState(1);

  const domains = useMemo(() => (dashboard?.domains ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder), [dashboard]);
  const priorityDomain = useMemo(() => domains.filter((domain) => domain.averageRequired > 0).sort((a, b) => a.averageCurrent / a.averageRequired - b.averageCurrent / b.averageRequired)[0], [domains]);
  const allCourses = reports?.training.courses ?? [];
  const assignedCourseCount = allCourses.filter((course) => course.learnerCount > 0).length;
  const filteredCourses = allCourses.filter((course) => {
    if (courseView === 'assigned' && course.learnerCount === 0) return false;
    const query = courseSearch.trim().toLocaleLowerCase('vi');
    return !query || `${course.code} ${course.title} ${course.domainName}`.toLocaleLowerCase('vi').includes(query);
  });
  const pageCount = Math.max(1, Math.ceil(filteredCourses.length / PAGE_SIZE));
  const visibleCourses = filteredCourses.slice((coursePage - 1) * PAGE_SIZE, coursePage * PAGE_SIZE);
  const totalAssignments = reports?.training.totalAssignments ?? 0;
  const completed = reports?.training.completedAssignments ?? 0;
  const underway = reports?.training.inProgressAssignments ?? 0;
  const completionRate = percent(reports?.training.completionRate ?? 0);
  const metricItems = [
    { label: 'Lượt phân công', value: totalAssignments, icon: GraduationCap, tone: 'teal' },
    { label: 'Đang học', value: underway, icon: BookOpen, tone: 'blue' },
    { label: 'Lượt đánh giá', value: reports?.assessment.totalAttempts ?? 0, icon: ClipboardCheck, tone: 'coral' },
    { label: 'Nhân sự hoạt động', value: reports?.workforce.activeEmployees ?? 0, icon: UsersRound, tone: 'green' },
  ];

  if (dashboardLoading || reportsLoading) return <div className="po-owner cycle-report-page -m-4 md:-m-6 min-h-screen" style={PULSE_TOKENS}><PageLoading label="Đang tải báo cáo chu kỳ" /></div>;

  return <div className="po-owner cycle-report-page -m-4 md:-m-6 min-h-screen" style={PULSE_TOKENS}>
    <main className="cycle-report-shell">
      <header className="cycle-report-hero">
        <div className="cycle-report-hero-copy"><span className="cycle-report-kicker"><TrendingUp size={15} /> BÁO CÁO ĐÀO TẠO</span><h1>Báo cáo chu kỳ</h1><span className="cycle-report-hero-caption">{completed} / {totalAssignments} lượt giao đã hoàn thành</span></div>
        <div className="cycle-report-completion" aria-label={`Tỷ lệ hoàn thành ${completionRate}%`}><div className="cycle-report-ring" style={{ background: `conic-gradient(#41ccb2 ${completionRate}%, rgba(255,255,255,.15) 0)` }}><div><strong>{completionRate}%</strong><span>hoàn thành</span></div></div></div>
      </header>

      {totalAssignments === 0 ? <section className="cycle-report-empty"><span><GraduationCap size={30} /></span><h2>Chưa có lượt giao khóa học</h2><p>Giao khóa học cho nhân viên để bắt đầu theo dõi tiến độ và kết quả đào tạo.</p><Link to="/enterprise/assignments">Giao khóa học <ArrowRight size={16} /></Link></section> : <>
        <div className="cycle-report-metrics" aria-label="Số liệu đào tạo">{metricItems.map((item) => <div key={item.label} className={`cycle-report-metric is-${item.tone}`}><span><item.icon size={21} /></span><div><small>{item.label}</small><strong>{item.value}</strong></div></div>)}</div>

        <section className="cycle-report-insight"><span className="cycle-report-insight-icon"><TrendingUp size={23} /></span><div><small>KẾT QUẢ CẦN CHÚ Ý</small><h2>{completed === 0 ? 'Chưa có lượt giao hoàn thành' : `${completed} lượt giao đã hoàn thành`}</h2><p>{underway > 0 ? `${underway} lượt đang học. Theo dõi tiến độ và hạn hoàn thành để kịp hỗ trợ nhân viên.` : 'Xem các lượt giao để kiểm tra tiến độ học tập.'}</p></div><Link to="/enterprise/assignments">Xem phân công <ArrowRight size={16} /></Link></section>

        {domains.length > 0 && <section className="cycle-report-section cycle-report-domains"><div className="cycle-report-section-head"><div><span>MỨC ĐÁP ỨNG NĂNG LỰC</span><h2>6 miền năng lực số</h2><p>So sánh mức hiện tại với yêu cầu của vị trí.</p></div>{priorityDomain && <div className="cycle-report-priority">Cần ưu tiên <strong>{priorityDomain.name}</strong></div>}</div><div className="cycle-report-domain-grid">{domains.map((domain, index) => {
          const coverage = domain.averageRequired > 0 ? percent(domain.averageCurrent / domain.averageRequired * 100) : 100;
          return <div key={domain.categoryId || domain.name} className={`cycle-report-domain ${coverage < 50 ? 'is-low' : coverage >= 100 ? 'is-met' : ''}`}><div className="cycle-report-domain-title"><span>{String(index + 1).padStart(2, '0')}</span><strong>{domain.name}</strong></div><div className="cycle-report-domain-values"><span>Hiện tại <b>{domain.averageCurrent.toFixed(1)}</b></span><span>Yêu cầu <b>{domain.averageRequired.toFixed(1)}</b></span></div><div className="cycle-report-domain-track" role="progressbar" aria-label={`Mức đáp ứng ${domain.name}`} aria-valuenow={coverage} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${coverage}%` }} /></div><div className="cycle-report-domain-foot"><span>{coverage >= 100 ? 'Đạt yêu cầu' : 'Mức đáp ứng'}</span><strong>{coverage}%</strong></div></div>;
        })}</div><Link className="cycle-report-section-link" to="/enterprise/skill-gap">Xem khoảng trống năng lực <ArrowRight size={16} /></Link></section>}

        {allCourses.length > 0 && <section className="cycle-report-section cycle-report-courses"><div className="cycle-report-section-head"><div><span>TIẾN ĐỘ KHÓA HỌC</span><h2>Khóa học trong báo cáo</h2><p>{assignedCourseCount} khóa đã có học viên.</p></div><Link className="cycle-report-section-link" to="/enterprise/courses">Danh mục khóa học <ArrowRight size={16} /></Link></div><div className="cycle-report-course-toolbar"><div className="cycle-report-tabs" role="group" aria-label="Lọc khóa học"><button type="button" className={courseView === 'assigned' ? 'is-active' : ''} onClick={() => { setCourseView('assigned'); setCoursePage(1); }}>Đã phân công <span>{assignedCourseCount}</span></button><button type="button" className={courseView === 'all' ? 'is-active' : ''} onClick={() => { setCourseView('all'); setCoursePage(1); }}>Tất cả <span>{allCourses.length}</span></button></div><label className="cycle-report-search owner-filter-search"><Search size={17} /><input value={courseSearch} onChange={(event) => { setCourseSearch(event.target.value); setCoursePage(1); }} placeholder="Tìm khóa học" aria-label="Tìm khóa học" /></label></div>
          {visibleCourses.length ? <div className="cycle-report-course-list">{visibleCourses.map((course) => <div key={course.id} className="cycle-report-course-row"><span className="cycle-report-course-code">{course.code}</span><div className="cycle-report-course-name"><strong>{course.title}</strong><small>{course.domainName}</small></div><span className="cycle-report-course-learners"><UsersRound size={15} /> {course.learnerCount} học viên</span><div className="cycle-report-course-progress"><strong>{percent(course.averageProgress)}%</strong><span><i style={{ width: `${percent(course.averageProgress)}%` }} /></span></div></div>)}</div> : <p className="cycle-report-no-courses">Không có khóa học phù hợp.</p>}
          {filteredCourses.length > PAGE_SIZE && <div className="cycle-report-pagination"><span>{(coursePage - 1) * PAGE_SIZE + 1}–{Math.min(coursePage * PAGE_SIZE, filteredCourses.length)} / {filteredCourses.length} khóa</span><div><button type="button" disabled={coursePage === 1} onClick={() => setCoursePage((page) => page - 1)}>Trước</button><span>Trang {coursePage}/{pageCount}</span><button type="button" disabled={coursePage === pageCount} onClick={() => setCoursePage((page) => page + 1)}>Sau</button></div></div>}
        </section>}
        <p className="cycle-report-note"><CheckCircle2 size={15} /> Hoàn thành khóa học không tự cập nhật mức năng lực; kết quả cần được xác nhận qua đánh giá.</p>
      </>}
    </main>
  </div>;
}
