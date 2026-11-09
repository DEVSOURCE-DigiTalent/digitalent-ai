import { translateUi, useUiLanguage } from '@/lib/i18n';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2, Clock3 } from 'lucide-react';
import type { EmployeeLearningNeeds } from '@/services/intelligence.service';
import './employee-learning-needs.css';

const levelName = (level: number | null) => level == null ? 'Chưa có kết quả' : ['Chưa đạt cơ bản', 'Cơ bản', 'Trung cấp', 'Nâng cao'][level] ?? 'Chưa có kết quả';

export function EmployeeLearningNeedsCard({ employee, detail = false }: { employee: EmployeeLearningNeeds; detail?: boolean }) {
  useUiLanguage();
  const needs = employee.domains.filter((domain) => domain.state === 'NEEDS_LEARNING');
  const waiting = employee.domains.some((domain) => domain.state === 'WAITING_ASSESSMENT');
  const position = [employee.departmentName, employee.positionName].filter((name, index, all) => name && all.indexOf(name) === index).join(' · ');
  return <article className="learning-needs-card">
    <header className="learning-needs-person">
      <span className="learning-needs-avatar" aria-hidden="true">{employee.employeeName.split(' ').slice(-2).map((word) => word[0]).join('')}</span>
      <div><h2>{detail ? employee.employeeName : <Link to={`/enterprise/skill-gap/${employee.employeeId}`}>{employee.employeeName}</Link>}</h2><p>{position || 'Chưa phân công vị trí'}</p></div>
      {employee.positionId && <Link className="learning-needs-standard" to={`/enterprise/setup?positionId=${encodeURIComponent(employee.positionId)}`}>{translateUi("Chuẩn vị trí ")}<ArrowRight size={14} /></Link>}
    </header>
    {needs.length > 0 && <div className="learning-needs-domains">{needs.map((domain) => <section key={domain.categoryId} className="learning-need-domain" style={{ '--domain-color': ['#168d84', '#2988b3', '#9470c0', '#299e8b', '#ba8c34', '#537ac4'][domain.number - 1] } as React.CSSProperties}>
      <div className="learning-need-requirement"><span className="learning-need-label">{translateUi("Cần bổ sung")}</span><h3>{translateUi(domain.name)}</h3><div className="learning-need-level"><span><small>{translateUi("Hiện tại ")}</small>{levelName(domain.currentLevel)}</span><ArrowRight size={15} /><span><small>{translateUi("Yêu cầu ")}</small><strong>{levelName(domain.requiredLevel)}</strong></span></div>
        <details><summary>{translateUi("Năng lực chưa đáp ứng")}</summary><ul>{domain.missingCompetencies.map((name) => <li key={name}>{name}</li>)}</ul></details>
      </div>
      <div className="learning-need-course"><span className="learning-need-label"><BookOpen size={14} /> Khóa học đáp ứng yêu cầu</span>{domain.courseId ? <><h4>{domain.courseTitle}</h4><div><span className="learning-need-code">{domain.courseCode} · {levelName(domain.requiredLevel)}</span><Link to={`/enterprise/courses?focus=${encodeURIComponent(domain.courseId)}`}>{translateUi("Xem khóa học ")}<ArrowRight size={15} /></Link></div></> : <p>Chưa có khóa học tương ứng trong danh mục.</p>}</div>
    </section>)}</div>}
    {waiting && <div className="learning-needs-message"><Clock3 size={18} /><p>Chờ kết quả đánh giá tổng thể{needs.length ? ' của các lĩnh vực còn lại' : ''}.</p><Link to="/enterprise/trial">{translateUi("Đánh giá đội ngũ ")}<ArrowRight size={14} /></Link></div>}
    {employee.state === 'NO_STANDARD' && <div className="learning-needs-message"><p>Thiết lập chuẩn vị trí để xác định năng lực cần bổ sung.</p><Link to="/enterprise/setup">{translateUi("Thiết lập chuẩn ")}<ArrowRight size={14} /></Link></div>}
    {employee.state === 'MET' && <div className="learning-needs-message is-met"><CheckCircle2 size={19} /><p>Đã đáp ứng chuẩn năng lực của vị trí.</p></div>}
  </article>;
}
