import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BadgeCheck, BookOpen, BrainCircuit, Check, CheckCircle2, ChevronDown, Clock3, Database, Lightbulb, MessagesSquare, PenTool, RefreshCw, ShieldCheck } from 'lucide-react';
import type { EmployeeLearningNeeds, LearningNeedDomain } from '@/services/intelligence.service';
import './employee-learning-plan.css';
import { formatDate } from '@/lib/utils';
import { EmployeeCapabilityRadar } from './EmployeeCapabilityRadar';

const DOMAINS = [
  { icon: Database, color: '#138f85' }, { icon: MessagesSquare, color: '#348bb5' },
  { icon: PenTool, color: '#9870c5' }, { icon: ShieldCheck, color: '#259a86' },
  { icon: Lightbulb, color: '#bc8b36' }, { icon: BrainCircuit, color: '#557ac3' },
];
const LEVELS = ['Cơ bản', 'Trung cấp', 'Nâng cao'];

function DomainLearningCard({ domain }: { domain: LearningNeedDomain }) {
  useUiLanguage();
  const [expanded, setExpanded] = useState(true);
  const palette = DOMAINS[domain.number - 1] ?? DOMAINS[0];
  const Icon = palette.icon;
  const contentId = `employee-domain-${domain.categoryId}`;
  return <section className="employee-plan-domain employee-plan-domain--focused" style={{ '--domain': palette.color } as CSSProperties}>
    <header className="employee-plan-domain-header">
      <span className="employee-plan-domain-icon"><Icon size={22} /></span>
      <h2>{translateUi(domain.name)}</h2>
      <span className="employee-plan-domain-number" aria-hidden="true">0{domain.number}</span>
    </header>

    <div className="employee-plan-levels" role="group" aria-label={translateUi(`Hiện tại: ${domain.currentLevel ? LEVELS[domain.currentLevel - 1] : 'Chưa đạt cơ bản'}. Yêu cầu: ${LEVELS[domain.requiredLevel - 1]}`)}>
      {domain.currentLevel === 0 && <span className="employee-plan-unrated">Hiện tại · Chưa đạt cơ bản</span>}
      <div className="employee-plan-level-track">{LEVELS.map((name, index) => {
        const level = index + 1;
        const current = domain.currentLevel === level;
        const target = domain.requiredLevel === level;
        return <div key={name} className={`employee-plan-level ${level <= (domain.currentLevel ?? 0) ? 'is-achieved' : ''} ${current ? 'is-current' : ''} ${target ? 'is-target' : ''}`}>
          <span className="employee-plan-level-dot">{level <= (domain.currentLevel ?? 0) ? <Check size={12} /> : <span />}</span>
          <strong>{name}</strong><small>{current ? translateUi('Hiện tại') : target ? translateUi('Yêu cầu') : '\u00a0'}</small>
        </div>;
      })}</div>
    </div>

    <div className="employee-plan-skills">
      <button type="button" onClick={() => setExpanded(!expanded)} aria-expanded={expanded} aria-controls={contentId}><span>{translateUi("Năng lực cần bổ sung")}</span><ChevronDown size={16} /></button>
      <div className={`employee-plan-skills-reveal ${expanded ? 'is-open' : ''}`} inert={!expanded}><div><ul id={contentId}>{domain.missingCompetencies.map((name) => <li key={name}><span aria-hidden="true" /><span>{name}</span></li>)}</ul></div></div>
    </div>

    <div className="employee-plan-course">
      <div className="employee-plan-course-top"><span><BookOpen size={14} />{translateUi(" Khóa học phù hợp")}</span>{domain.courseCode && <span className="employee-plan-course-code">{domain.courseCode}</span>}</div>
      <h3>{domain.courseTitle ?? 'Chưa có khóa học tương ứng'}</h3>
      {domain.courseId && <Link to={`/enterprise/courses?focus=${encodeURIComponent(domain.courseId)}`}>{translateUi("Xem khóa học ")}<ArrowRight size={15} /></Link>}
    </div>
  </section>;
}

interface Props {
  embedded?: boolean;
  view?: 'gaps' | 'competencies';
  onDomainChange?: (number: number) => void;
  employee: EmployeeLearningNeeds;
  canConfirm: boolean;
  onConfirm: () => void;
  onRefresh: () => void;
  refreshing: boolean;
}

export function EmployeeLearningPlan({ employee, canConfirm, onConfirm, onRefresh, refreshing, onDomainChange, embedded = false, view = 'gaps' }: Props) {
  useUiLanguage();
  const missing = employee.domains.filter((domain) => domain.state === 'NEEDS_LEARNING');
  const [selected, setSelected] = useState<string>();
  const tabsRef = useRef<HTMLDivElement>(null);
  const tabId = useId();
  const active = employee.domains.find((domain) => domain.categoryId === selected) ?? (view === 'gaps' ? missing[0] : undefined) ?? employee.domains[0];
  useEffect(() => { if (active) onDomainChange?.(active.number); }, [active?.number, onDomainChange]);
  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number;
    if (event.key === 'ArrowRight') next = (index + 1) % employee.domains.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + employee.domains.length) % employee.domains.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = employee.domains.length - 1;
    else return;
    event.preventDefault();
    setSelected(employee.domains[next].categoryId);
    tabsRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
  };
  const position = [employee.departmentName, employee.positionName].filter((name, index, all) => name && all.indexOf(name) === index);
  return <>
    {!embedded && <header className="employee-plan-hero">
      <nav aria-label="Đường dẫn hồ sơ năng lực" className="employee-plan-breadcrumb"><Link to="/enterprise/skill-gap"><ArrowLeft size={15} /><span>{translateUi("Tổng quan năng lực")}</span></Link><span aria-hidden="true">/</span><span>{translateUi("Chi tiết nhân viên")}</span></nav>
      <div className="employee-plan-identity">
        <span className="employee-plan-avatar" aria-hidden="true">{employee.employeeName.split(' ').slice(-2).map((word) => word[0]).join('')}</span>
        <div className="employee-plan-name"><span className="employee-plan-eyebrow">{translateUi("NĂNG LỰC CẦN BỔ SUNG")}</span><h1>{employee.employeeName}</h1><div className="employee-plan-position">{position.length ? position.map((name) => <span key={name}>{name}</span>) : <span>Chưa phân công vị trí</span>}{employee.positionId && <Link to={`/enterprise/setup?positionId=${encodeURIComponent(employee.positionId)}`}>{translateUi("Chuẩn vị trí ")}<ArrowRight size={13} /></Link>}</div></div>
        <div className="employee-plan-actions">{canConfirm && employee.state !== 'WAITING_ASSESSMENT' && employee.state !== 'NO_STANDARD' && <button type="button" className="employee-plan-confirm" onClick={onConfirm}><BadgeCheck size={17} />{translateUi(" Xác nhận cải thiện")}</button>}<button className="employee-plan-refresh" type="button" onClick={onRefresh} disabled={refreshing} aria-label={translateUi("Làm mới")}><RefreshCw size={17} className={refreshing ? 'animate-spin' : ''} /></button></div>
      </div>
    </header>}

    {active && <>
      {embedded && view === 'gaps' && <EmployeeCapabilityRadar domains={employee.domains} onSelect={setSelected} />}
      <div ref={tabsRef} role="tablist" aria-label={translateUi("Lĩnh vực năng lực")} className="employee-plan-tabs">{employee.domains.map((domain, index) => {
        const palette = DOMAINS[domain.number - 1] ?? DOMAINS[0];
        const Icon = palette.icon;
        return <button key={domain.categoryId} type="button" role="tab" id={`${tabId}-tab-${domain.categoryId}`} aria-selected={active.categoryId === domain.categoryId} aria-controls={`${tabId}-panel`} tabIndex={active.categoryId === domain.categoryId ? 0 : -1} onClick={() => setSelected(domain.categoryId)} onKeyDown={(event) => onTabKeyDown(event, index)} style={{ '--domain': palette.color } as CSSProperties}>
          <Icon size={18} /><span>{translateUi(domain.name)}</span>{domain.state === 'MET' && <Check size={12} className="employee-plan-tab-met" />}
        </button>;
      })}</div>
      <div role="tabpanel" id={`${tabId}-panel`} aria-labelledby={`${tabId}-tab-${active.categoryId}`} tabIndex={0} className="employee-plan-tabpanel">
        {view === 'competencies' ? <section className="employee-competencies-panel"><header><h2>{translateUi(active.name)}</h2><span>Chuẩn vị trí · {LEVELS[active.requiredLevel - 1]}</span></header><div>{active.competencies?.map((competency) => <article key={competency.competencyId}><div><h3>{competency.name}</h3><p>{competency.currentLevel == null ? 'Chờ đánh giá tổng thể' : `${competency.source === 'EVIDENCE' ? 'Xác nhận bổ sung' : 'Đánh giá tổng thể'}${competency.confirmedAt ? ` · ${formatDate(competency.confirmedAt)}` : ''}`}</p></div><div className="employee-competency-comparison"><span><small>{translateUi("Hiện tại")}</small><strong>{competency.currentLevel == null ? translateUi('Chưa đánh giá') : competency.currentLevel === 0 ? 'Chưa đạt cơ bản' : LEVELS[competency.currentLevel - 1]}</strong></span><ArrowRight size={14} /><span><small>{translateUi("Yêu cầu")}</small><strong>{LEVELS[competency.requiredLevel - 1]}</strong></span></div></article>)}</div></section> : active.state === 'NEEDS_LEARNING' ? <DomainLearningCard key={`${employee.employeeId}-${active.categoryId}`} domain={active} /> : <section key={active.categoryId} className={`employee-plan-status ${active.state === 'MET' ? 'is-met' : ''}`}><span>{active.state === 'MET' ? <CheckCircle2 size={25} /> : <Clock3 size={23} />}</span><div><h2>{translateUi(active.name)}</h2><p>{active.state === 'MET' ? 'Đã đáp ứng chuẩn vị trí. Chưa cần bổ sung khóa học.' : 'Chờ kết quả đánh giá để xác định năng lực cần bổ sung.'}</p></div>{active.state === 'WAITING_ASSESSMENT' && <Link to="/enterprise/trial">{translateUi("Đánh giá đội ngũ ")}<ArrowRight size={15} /></Link>}</section>}
      </div>
    </>}
    {employee.state === 'NO_STANDARD' && <section className="employee-plan-status"><span><ShieldCheck size={23} /></span><div><h2>{translateUi("Chưa có chuẩn vị trí")}</h2><p>Thiết lập chuẩn để đối chiếu năng lực của nhân viên.</p></div><Link to="/enterprise/setup">{translateUi("Thiết lập chuẩn ")}<ArrowRight size={15} /></Link></section>}
  </>;
}
