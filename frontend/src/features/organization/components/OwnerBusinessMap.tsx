import { useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, BookOpen, Building2, FlaskConical, GraduationCap, Layers3, TrendingUp, Users } from 'lucide-react';
import { useReportsOverview } from '@/hooks/use-analytics';
import { useCertificates } from '@/hooks/use-learning';
import { useOrganizationOverview } from '@/hooks/use-organization';
import { useLearningNeeds } from '@/hooks/use-skill-gaps';
import { useTrialProgram } from '@/hooks/use-trial-program';
import { translateUi, useUiLanguage } from '@/lib/i18n';
import './owner-business-map.css';

const branches = [
  { id: 'people', label: 'Cơ cấu đội ngũ', icon: Users, path: '/enterprise/members', tone: 'blue' },
  { id: 'assessment', label: 'Đánh giá đội ngũ', icon: FlaskConical, path: '/enterprise/trial', tone: 'blue' },
  { id: 'standards', label: 'Khung năng lực số', icon: Layers3, path: '/enterprise/setup', tone: 'violet' },
  { id: 'courses', label: 'Khóa học', icon: BookOpen, path: '/enterprise/courses', tone: 'teal' },
  { id: 'training', label: 'Đợt đào tạo', icon: GraduationCap, path: '/enterprise/training-batches', tone: 'teal' },
  { id: 'certificates', label: 'Chứng nhận', icon: Award, path: '/enterprise/certificates', tone: 'amber' },
  { id: 'gaps', label: 'Khoảng trống năng lực', icon: TrendingUp, path: '/enterprise/skill-gap', tone: 'violet' },
] as const;

type BranchId = typeof branches[number]['id'];
type Metric = readonly [string, number | string | null | undefined];

export function OwnerBusinessMap() {
  useUiLanguage();
  const [selected, setSelected] = useState<BranchId>('training');
  const organization = useOrganizationOverview().data;
  const trial = useTrialProgram().data;
  const needs = useLearningNeeds({ pageIndex: 1, pageSize: 1 }).data?.overview;
  const reportQuery = useReportsOverview();
  const report = reportQuery.data;
  const certificates = useCertificates({ pageSize: 1 }).data;
  const training = report?.training;
  const submitted = trial?.participants.filter(({ status }) => status === 'SUBMITTED' || status === 'REVIEWED').length;
  const courses = training?.courses.filter((course) => course.learnerCount > 0);
  const met = needs?.domains.reduce((sum, domain) => sum + domain.met, 0);
  const assessed = needs?.domains.reduce((sum, domain) => sum + domain.assessed, 0);
  const coverage = assessed && met != null ? `${Math.round(met * 100 / assessed)}%` : null;
  const completion = training?.totalAssignments ? `${training.completionRate}%` : null;
  const departments = report?.workforce?.byDepartment ?? [];
  const departmentHeadcount = departments.reduce((sum, department) => sum + department.employeeCount, 0);
  const largestDepartments = [...departments].filter((department) => department.employeeCount > 0)
    .sort((a, b) => b.employeeCount - a.employeeCount).slice(0, 4);
  const metrics: Record<BranchId, Metric[]> = {
    people: [['Chờ kích hoạt', organization?.members.pending], ['Ngừng hoạt động', organization?.members.inactive]],
    assessment: [['Đã nộp', submitted], ['Nhân sự tham gia', trial?.participants.length], ['Đã có kết quả', trial?.report?.assessed]],
    standards: [['Chưa có chuẩn vị trí', needs?.noStandardEmployees], ['Nhân sự đã đối chiếu', needs?.assessedEmployees]],
    gaps: [['Lượt đối chiếu đạt chuẩn', coverage], ['Lĩnh vực cần bổ sung', needs?.domains.filter((domain) => domain.needsLearning > 0).length], ['Chờ đánh giá', needs?.waitingEmployees]],
    courses: [['Khóa đã có lượt học', courses?.length], ['Lượt giao đang hiệu lực', training?.totalAssignments], ['Lượt đang học', training?.inProgressAssignments]],
    training: [['Đợt đang chạy', organization?.runningBatches], ['Tỷ lệ hoàn thành', completion], ['Lượt đã hoàn thành', training?.completedAssignments], ['Lượt giao đang hiệu lực', training?.totalAssignments]],
    certificates: [['Chứng nhận', certificates?.totalItems]],
  };
  const active = branches.find((branch) => branch.id === selected)!;
  const detailMetrics = selected === 'people' ? metrics.people.slice(1)
    : selected === 'training' ? metrics.training.filter(([label]) => label !== 'Tỷ lệ hoàn thành')
    : metrics[selected];
  const monitoredCourses = [...(courses ?? [])].sort((a, b) => a.averageProgress - b.averageProgress).slice(0, 4);

  return (
    <section className="owner-heatmap business-map" aria-labelledby="business-map-title">
      <header className="owner-heatmap__header">
        <h2 id="business-map-title">{translateUi('Bản đồ doanh nghiệp')}</h2>
      </header>
      <div className="business-map__canvas">
        <div className="business-map__hub" data-tone={active.tone} data-bottom-active={selected === 'gaps'}>
          <span><Building2 size={25} aria-hidden="true" /></span>
          <strong>{organization?.name || translateUi('Doanh nghiệp')}</strong>
        </div>
        {branches.map(({ id, label, icon: Icon, tone }, index) => {
          const [metric, value] = metrics[id][0];
          const side = id === 'gaps' ? 'bottom' : index < 3 ? 'left' : 'right';
          const row = (index % 3) + 1;
          return (
            <div className="business-map__branch" key={id} data-side={side}
              style={{ '--branch-row': row, '--hub-distance': Math.abs(row - 2) } as CSSProperties}
              data-tone={tone} data-active={selected === id} data-above-hub={row < 2}>
              <button type="button" onClick={() => setSelected(id)} aria-pressed={selected === id} aria-controls="business-map-details">
                <span className="business-map__icon"><Icon size={20} aria-hidden="true" /></span>
                <span className="business-map__label"><strong>{translateUi(label)}</strong><small>{translateUi(metric)}</small></span>
                <b>{value ?? '—'}</b>
              </button>
            </div>
          );
        })}
      </div>
      {reportQuery.isLoading && <p className="business-map__status" role="status">{translateUi('Đang tải báo cáo chu kỳ…')}</p>}
      {reportQuery.isError && <p className="business-map__status" role="alert">
        {translateUi('Không tải được báo cáo chu kỳ.')} <button type="button" className="underline" onClick={() => void reportQuery.refetch()}>{translateUi('Thử lại')}</button>
      </p>}
      <div className="business-map__details" id="business-map-details" aria-labelledby="business-map-branch-title" role="region" data-tone={active.tone}>
        <div className="business-map__detail-content" key={selected}>
          <header>
            <span className="business-map__icon"><active.icon size={20} aria-hidden="true" /></span>
            <h3 id="business-map-branch-title">{translateUi(active.label)}</h3>
            <Link className="owner-heatmap__link" to={active.path}>{translateUi('Xem chi tiết')}<ArrowRight size={15} aria-hidden="true" /></Link>
          </header>
          <div className="business-map__detail-grid">
            {selected === 'training' && (
              <div className="business-map__completion">
                <div className="business-map__completion-ring"
                  style={{ '--completion': completion ?? '0%' } as CSSProperties}>
                  <strong>{completion ?? '—'}</strong>
                </div>
                <div>
                  <strong>{translateUi('Tỷ lệ hoàn thành')}</strong>
                  {training && <p>{training.completedAssignments} / {training.totalAssignments} {translateUi('lượt giao')}</p>}
                </div>
              </div>
            )}
            <dl>{detailMetrics.map(([label, value]) => (
              <div key={label}><dt>{translateUi(label)}</dt><dd>{value ?? '—'}</dd></div>
            ))}</dl>
          </div>
          {selected === 'people' && largestDepartments.length > 0 && (
            <div className="business-map__courses">
              <h4>{translateUi('Phân bố nhân sự theo phòng ban')}</h4>
              {largestDepartments.map((department) => (
                <div className="business-map__course" key={department.id}>
                  <span>{department.name}</span>
                  <progress max={departmentHeadcount} value={department.employeeCount} aria-label={department.name} />
                  <b>{department.employeeCount}</b>
                </div>
              ))}
            </div>
          )}
          {selected === 'courses' && monitoredCourses.length > 0 && (
            <div className="business-map__courses">
              <h4>{translateUi('Tiến độ trung bình theo khóa')}</h4>
              {monitoredCourses.map((course) => (
                <div className="business-map__course" key={course.id}>
                  <span><strong>{course.title}</strong><small>{course.learnerCount} {translateUi('lượt học')}</small></span>
                  <progress max={100} value={course.averageProgress} aria-label={course.title} />
                  <b>{Math.round(course.averageProgress)}%</b>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
