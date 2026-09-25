import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, BarChart3, BookOpen, Building2, Check, ChevronDown,
  CircleHelp, ClipboardCheck, GraduationCap, LayoutDashboard, Plus,
  Settings2, Sparkles, Target, TrendingUp, Users,
} from 'lucide-react';
import { AREA_NAMES, BASE_ROLES, DEMO_ORGANIZATIONS, LEVELS, makeRequirements } from '../data/enterpriseDemo';
import { ALL_DIGCOMP_COURSES } from '../data/courseCatalog';
import { ORGANIZATIONS_KEY, provisionEmployee, readAccounts, readOrganizations } from '../utils/demoAccess';
import {
  businessProjection, coursePrice, currency, matchCourses, organizationScore,
  pairedOrganizationScores, scoreProfile, setRequirementWeight, skillGaps,
} from '../utils/enterpriseEngine';
import './enterpriseWorkspace.css';
import './learningFlow.css';

const steps = [
  { id: 'home', label: 'Tổng quan', icon: LayoutDashboard },
  { id: 'assess', label: 'Đánh giá', icon: ClipboardCheck },
  { id: 'roadmap', label: 'Lộ trình', icon: Target },
  { id: 'courses', label: 'Khóa học', icon: BookOpen },
  { id: 'impact', label: 'Kết quả', icon: BarChart3 },
];
const actions = [
  'Chuẩn hóa dữ liệu và tạo dashboard theo dõi chỉ số kinh doanh.',
  'Thống nhất công cụ cộng tác và quy trình bàn giao công việc.',
  'Tạo mẫu nội dung và quy trình kiểm duyệt bản quyền.',
  'Rà soát phân quyền, xác thực nhiều lớp và dữ liệu cá nhân.',
  'Chọn một quy trình lặp lại để đo thời gian trước và sau số hóa.',
];
const readSession = (key, fallback) => {
  try { return sessionStorage.getItem(key) || fallback; } catch (_) { return fallback; }
};
const scoreLabel = value => value === null ? '—' : `${value}%`;
const courseLevel = course => LEVELS.find(item => course.id.endsWith(`-${item.code}`));

function ScoreTrack({ label, value, color = 'primary' }) {
  return <div className="dt-track-row"><div><span>{label}</span><strong>{scoreLabel(value)}</strong></div><div className="dt-track"><span className={`dt-fill ${color}`} style={{ width: `${value ?? 0}%` }} /></div></div>;
}

function EmptyState({ title, action, onAction }) {
  return <div className="dt-empty"><div className="dt-empty-icon"><CircleHelp size={22} /></div><strong>{title}</strong>{action && <button className="dt-button primary" onClick={onAction}>{action}<ArrowRight size={16} /></button>}</div>;
}

export default function EnterpriseWorkspace({ onOpenCourse, organizationId: signedInOrganizationId, onOrganizationChange }) {
  const [organizations, setOrganizations] = useState(readOrganizations);
  const [organizationId, setOrganizationId] = useState(() => signedInOrganizationId || readSession('dt organization', 'sao-mai'));
  const [accounts, setAccounts] = useState(readAccounts);
  const [revealedAccount, setRevealedAccount] = useState(null);
  const [employeeId, setEmployeeId] = useState(() => readSession('dt employee', 'sm-mkt'));
  const [step, setStep] = useState(() => readSession('dt step', 'home'));
  const [phase, setPhase] = useState('before');
  const [levelFilter, setLevelFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('all');
  const [selectedCourseId, setSelectedCourseId] = useState('A1-F');
  const [companyForm, setCompanyForm] = useState({ name: '', sector: '', size: 20, hourlyCost: 100000 });
  const [roleForm, setRoleForm] = useState({ name: '', specialty: '', benchmark: 'marketing_specialist', headcount: 1, priority: 2 });
  const [employeeForm, setEmployeeForm] = useState({ name: '', roleId: '' });
  const [question, setQuestion] = useState('Tôi nên học gì trước?');
  const [answer, setAnswer] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => { try { localStorage.setItem(ORGANIZATIONS_KEY, JSON.stringify(organizations)); } catch (_) {} }, [organizations]);
  useEffect(() => { try { sessionStorage.setItem('dt organization', organizationId); sessionStorage.setItem('dt employee', employeeId); sessionStorage.setItem('dt step', step); } catch (_) {} }, [organizationId, employeeId, step]);
  const organization = organizations.find(item => item.id === organizationId) || organizations[0];
  const employee = organization.employees.find(item => item.id === employeeId) || organization.employees[0];
  const role = organization.roles.find(item => item.id === employee?.roleId);
  const beforeScore = scoreProfile(employee?.before, role?.requirements);
  const afterScore = scoreProfile(employee?.after, role?.requirements);
  const currentLevels = afterScore === null ? employee?.before : employee.after;
  const matches = matchCourses(currentLevels, role?.requirements);
  const topGap = matches[0];
  const paired = pairedOrganizationScores(organization);
  const projection = businessProjection(organization);
  const orgPriorities = AREA_NAMES.map((name, index) => ({ name, index, priority: organization.employees.reduce((sum, person) => {
    const personRole = organization.roles.find(item => item.id === person.roleId);
    const levels = scoreProfile(person.after, personRole?.requirements) === null ? person.before : person.after;
    return sum + (skillGaps(levels, personRole?.requirements).find(item => item.area === index + 1)?.priority || 0);
  }, 0) })).sort((a, b) => b.priority - a.priority);
  const catalog = useMemo(() => Object.values(ALL_DIGCOMP_COURSES).filter(course =>
    (levelFilter === 'all' || course.id.endsWith(`-${levelFilter}`)) &&
    (areaFilter === 'all' || course.areaId === `area_${areaFilter}`)
  ).sort((a, b) => a.id.localeCompare(b.id)), [levelFilter, areaFilter]);
  useEffect(() => {
    if (catalog.length && !catalog.some(course => course.id === selectedCourseId)) setSelectedCourseId(catalog[0].id);
  }, [catalog, selectedCourseId]);
  const selectedCourse = ALL_DIGCOMP_COURSES[selectedCourseId];
  const roadmapArea = topGap?.area || 1;
  const roadmapCurrent = topGap?.current ?? 0;
  const roadmapTarget = topGap?.level ?? 6;
  const nextStep = !employee ? 'settings' : !employee.before ? 'assess' : matches.length ? 'roadmap' : 'impact';

  const updateOrganization = updater => setOrganizations(previous => previous.map(item => item.id === organization.id ? updater(item) : item));
  const changeOrganization = id => {
    const next = organizations.find(item => item.id === id);
    if (!next) return;
    setOrganizationId(id);
    onOrganizationChange?.(next);
    setEmployeeId(next.employees[0]?.id || '');
    setNotice('');
    setAnswer('');
  };
  const addCompany = event => {
    event.preventDefault();
    if (!companyForm.name.trim()) return;
    const id = `org-${Date.now()}`;
    const roles = BASE_ROLES.map(item => ({
      ...item,
      requirements: makeRequirements(item.benchmark).map((requirement, index) => item.id === 'manager' ? { ...requirement, level: [5, 5, 4, 5, 5][index] } : requirement),
    }));
    const next = { id, name: companyForm.name.trim(), sector: companyForm.sector.trim() || 'Chưa xác định', size: Number(companyForm.size), hourlyCost: Number(companyForm.hourlyCost), roles, employees: [], orders: [] };
    setOrganizations(previous => [...previous, next]);
    setOrganizationId(id);
    onOrganizationChange?.(next);
    setEmployeeId('');
    setCompanyForm({ name: '', sector: '', size: 20, hourlyCost: 100000 });
    setNotice('Đã tạo doanh nghiệp. Bước tiếp theo: thêm một nhân sự để đánh giá.');
  };
  const addRole = event => {
    event.preventDefault();
    if (!roleForm.name.trim()) return;
    const next = { id: `role-${Date.now()}`, name: roleForm.name.trim(), specialty: roleForm.specialty.trim(), family: 'Đặc thù', benchmark: roleForm.benchmark, priority: Number(roleForm.priority), headcount: Number(roleForm.headcount), requirements: makeRequirements(roleForm.benchmark) };
    updateOrganization(item => ({ ...item, roles: [...item.roles, next] }));
    setRoleForm({ name: '', specialty: '', benchmark: 'marketing_specialist', headcount: 1, priority: 2 });
    setNotice('Đã thêm vị trí. Có thể chỉnh chuẩn năng lực bên dưới.');
  };
  const addEmployee = event => {
    event.preventDefault();
    if (!employeeForm.name.trim() || !employeeForm.roleId) return;
    const id = `emp-${Date.now()}`;
    updateOrganization(item => ({ ...item, employees: [...item.employees, { id, name: employeeForm.name.trim(), roleId: employeeForm.roleId, before: null, after: null, evidence: 'Chưa đánh giá' }] }));
    setEmployeeId(id);
    setEmployeeForm({ name: '', roleId: '' });
    setStep('settings');
    setPhase('before');
    setNotice('Đã thêm nhân sự. Cấp tài khoản để người này đăng nhập và làm bài đánh giá.');
  };
  const issueAccount = person => {
    const account = provisionEmployee(organization, person);
    setAccounts(readAccounts());
    setRevealedAccount(account);
    setNotice(`Đã cấp tài khoản cho ${person.name}. Hãy chuyển thông tin đăng nhập demo cho người học.`);
  };
  const saveLevel = (index, value) => updateOrganization(item => ({ ...item, employees: item.employees.map(person => person.id !== employee.id ? person : {
    ...person,
    [phase]: Array.from({ length: 5 }, (_, i) => i === index ? (value === '' ? null : Number(value)) : (person[phase]?.[i] ?? (phase === 'after' ? null : 0))),
    evidence: phase === 'after' ? 'Tự đánh giá lại; chờ mentor thẩm định' : 'Tự đánh giá đầu vào',
  }) }));
  const updateRequirement = (roleId, index, field, value) => updateOrganization(item => ({ ...item, roles: item.roles.map(position => position.id !== roleId ? position : {
    ...position,
    requirements: field === 'weight' ? setRequirementWeight(position.requirements, index, value)
      : position.requirements.map((requirement, i) => i === index ? { ...requirement, [field]: field === 'mandatory' ? value : Number(value) } : requirement),
  }) }));
  const recordOrder = course => {
    if (!course.isCommerciallyReady || coursePrice(course) === 0) return;
    updateOrganization(item => ({ ...item, orders: [...item.orders, { id: `order-${Date.now()}`, courseId: course.id, price: coursePrice(course), seats: 1, status: 'DEMO', createdAt: new Date().toISOString() }] }));
    setNotice(`Đã ghi đơn mô phỏng cho ${course.id}. Chưa phát sinh thanh toán thật.`);
  };
  const askMentor = event => {
    event.preventDefault();
    if (!employee?.before) { setAnswer('Hãy điền mức năng lực đầu vào trước.'); return; }
    const lower = question.toLocaleLowerCase('vi-VN');
    if (lower.includes('điểm') || lower.includes('chấm')) { setAnswer('Điểm = tổng của trọng số × min(mức hiện tại / mức yêu cầu, 1). Tự đánh giá cần mentor kiểm tra minh chứng trước khi xác nhận.'); return; }
    if (lower.includes('minh chứng') || lower.includes('mentor')) { setAnswer(`Với ${role.name}, hãy nộp một sản phẩm công việc thực tế kèm thao tác và kết quả để mentor đối chiếu.`); return; }
    if (lower.includes('doanh thu') || lower.includes('chi phí')) { setAnswer('Cơ bản miễn phí; trung cấp 390.000 đ; nâng cao 790.000 đ/chỗ. Đơn hàng ở đây chỉ là mô phỏng.'); return; }
    setAnswer(topGap ? !topGap.course.isCommerciallyReady
      ? `${AREA_NAMES[topGap.area - 1]} còn thiếu ${topGap.gap} mức. Có thể học thử ${topGap.course.title}; nội dung cần chuyên gia thẩm định trước khi mở bán.`
      : `Học ${topGap.course.title} trước: ${AREA_NAMES[topGap.area - 1]} còn thiếu ${topGap.gap} mức. Sau khóa học, làm bài thực hành và đánh giá lại.`
      : 'Bạn đã đạt yêu cầu của vị trí. Có thể chọn khóa mở rộng trong thư viện.');
  };

  return <div className="dt animate-fade-in">
    <div className="dt-topline"><div className="dt-crumb">Không gian doanh nghiệp <span>/</span> {organization.name}</div><span className="dt-demo-pill">BẢN THỬ · DỮ LIỆU MẪU</span></div>
    <header className="dt-header"><div><span className="dt-kicker">DIGITAL SKILLS ROADMAP</span><h1>Học đúng kỹ năng.<br /><em>Đo được tiến bộ.</em></h1><p>Chọn vị trí, đánh giá, học theo lộ trình rồi đo lại.</p></div><div className="dt-header-controls"><label>Doanh nghiệp<select value={organization.id} onChange={event => changeOrganization(event.target.value)}>{organizations.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Người học<select value={employee?.id || ''} onChange={event => setEmployeeId(event.target.value)}><option value="">Chọn người học</option>{organization.employees.map(person => <option key={person.id} value={person.id}>{person.name} · {organization.roles.find(position => position.id === person.roleId)?.name}</option>)}</select></label><button className="dt-inline-link" onClick={() => setStep('settings')}><Settings2 size={15} /> Cấu hình doanh nghiệp</button></div></header>

    <nav className="dt-stepper" aria-label="Lộ trình sử dụng">{steps.map((item, index) => <button key={item.id} className={`dt-step ${step === item.id ? 'active' : ''}`} onClick={() => setStep(item.id)} aria-current={step === item.id ? 'step' : undefined}><span className="dt-step-number">{index + 1}</span><span>{item.label}</span></button>)}</nav>
    {notice && <div className="dt-notice" role="status"><Check size={16} />{notice}<button onClick={() => setNotice('')} aria-label="Đóng thông báo">×</button></div>}

    {step === 'home' && <div className="dt-page">
      <div className="dt-page-title"><div><span className="dt-kicker">BẮT ĐẦU TẠI ĐÂY</span><h2>Lộ trình của {organization.name}</h2></div><button className="dt-button primary" onClick={() => setStep(nextStep)}>Tiếp tục <ArrowRight size={17} /></button></div>
      <div className="dt-metrics"><div className="dt-metric"><span><Building2 size={18} /> Quy mô</span><strong>{organization.size}</strong><small>nhân sự khai báo</small></div><div className="dt-metric"><span><Users size={18} /> Vị trí</span><strong>{organization.roles.length}</strong><small>khung năng lực</small></div><div className="dt-metric"><span><Target size={18} /> Đầu vào</span><strong>{scoreLabel(organizationScore(organization))}</strong><small>trên hồ sơ đã đánh giá</small></div><div className="dt-metric"><span><TrendingUp size={18} /> Cải thiện</span><strong>{paired.improvement === null ? '—' : `${paired.improvement >= 0 ? '+' : ''}${paired.improvement}`}</strong><small>điểm · {paired.count} người có 2 lần đo</small></div></div>
      <div className="dt-grid-2"><section className="dt-panel dt-journey"><div className="dt-panel-head"><div><span className="dt-kicker">4 BƯỚC RÕ RÀNG</span><h3>Từ vị trí đến kết quả</h3></div></div>{[
        ['01', 'Thiết lập vị trí', `${organization.roles.length} vị trí đã có khung`, 'settings'],
        ['02', 'Đánh giá đầu vào', employee?.before ? `${employee.name}: ${scoreLabel(beforeScore)}` : 'Chưa có đánh giá', 'assess'],
        ['03', 'Học theo roadmap', matches.length ? `${matches.length} lĩnh vực cần cải thiện` : employee?.before ? 'Đã đạt chuẩn vị trí' : 'Chờ đánh giá', 'roadmap'],
        ['04', 'Đánh giá lại', paired.count ? `${paired.count} hồ sơ có đủ trước / sau` : 'Chưa có dữ liệu sau học', 'impact'],
      ].map(([number, title, detail, target]) => <button className="dt-journey-item" key={number} onClick={() => setStep(target)}><span className="dt-journey-number">{number}</span><span><strong>{title}</strong><small>{detail}</small></span><ArrowRight size={17} /></button>)}</section>
      <section className="dt-panel"><div className="dt-panel-head"><div><span className="dt-kicker">GÓC NHÌN LÃNH ĐẠO</span><h3>Vị trí ưu tiên</h3></div><span className="dt-mini-pill">{organization.roles.length} vị trí</span></div><div className="dt-position-list">{organization.roles.slice().sort((a,b) => a.priority-b.priority).map(position => <details key={position.id} className="dt-position"><summary><span className={`dt-priority p${position.priority}`}>P{position.priority}</span><span><strong>{position.name}</strong><small>{position.headcount} người · {position.specialty || position.family}</small></span><ChevronDown size={17} /></summary><div className="dt-position-details">{position.requirements.map((requirement, index) => <div key={requirement.areaId}><span>{AREA_NAMES[index]}</span><strong>{requirement.level}/6</strong></div>)}</div></details>)}</div><button className="dt-inline-link" onClick={() => setStep('settings')}>Chỉnh khung vị trí <ArrowRight size={15} /></button></section></div>
      <div className="dt-next"><div className="dt-next-icon"><Sparkles size={22} /></div><div><strong>Gợi ý cho doanh nghiệp</strong><span>{orgPriorities[0]?.priority > 0 ? actions[orgPriorities[0].index] : 'Thêm đánh giá để nhận gợi ý theo dữ liệu doanh nghiệp.'}</span></div><button onClick={() => setStep('impact')}>Xem kết quả <ArrowRight size={16} /></button></div>
    </div>}

    {step === 'assess' && <div className="dt-page"><div className="dt-page-title"><div><span className="dt-kicker">BƯỚC 1 · ĐÁNH GIÁ</span><h2>{employee ? `Năng lực của ${employee.name}` : 'Chọn người học để bắt đầu'}</h2><p>{role?.name || 'Thêm nhân sự trong cấu hình doanh nghiệp'}</p></div>{employee && <div className="dt-segment"><button className={phase === 'before' ? 'active' : ''} onClick={() => setPhase('before')}>Đầu vào</button><button className={phase === 'after' ? 'active' : ''} onClick={() => setPhase('after')}>Sau học</button></div>}</div>
      {!employee || !role ? <EmptyState title="Chưa có người học" action="Thêm nhân sự" onAction={() => setStep('settings')} /> : <div className="dt-grid-2 assess"><section className="dt-panel"><div className="dt-panel-head"><div><span className="dt-kicker">5 LĨNH VỰC · MỨC 0–6</span><h3>{phase === 'before' ? 'Đánh giá đầu vào' : 'Đánh giá lại sau học'}</h3></div><span className="dt-mini-pill">{employee[phase]?.filter(value => value !== null && value !== undefined).length || 0}/5 đã điền</span></div><div className="dt-assess-list">{role.requirements.map((requirement, index) => <div className="dt-assess-row" key={requirement.areaId}><span className="dt-area-icon">0{index+1}</span><div><strong>{AREA_NAMES[index]}</strong><small>Cần đạt {requirement.level}/6 {requirement.mandatory ? '· Cốt lõi' : ''}</small></div><select aria-label={`${AREA_NAMES[index]} ${phase === 'before' ? 'đầu vào' : 'sau học'}`} value={employee[phase]?.[index] ?? ''} onChange={event => saveLevel(index, event.target.value)}><option value="">—</option>{Array.from({length:7}, (_, level) => <option key={level} value={level}>{level}</option>)}</select></div>)}</div><details className="dt-disclosure"><summary>Cách tính điểm & mức 0 <ChevronDown size={16}/></summary><p>Điểm = tổng trọng số × min(mức hiện tại / mức yêu cầu, 1). Mức 0 nghĩa là chưa có minh chứng. Kết quả này là tự đánh giá; mentor cần duyệt minh chứng để xác nhận.</p></details></section><aside className="dt-panel dt-assess-aside"><span className="dt-kicker">SO SÁNH</span><h3>Trước và sau</h3><div className="dt-score-big"><strong>{scoreLabel(phase === 'before' ? beforeScore : afterScore)}</strong><span>điểm đáp ứng vị trí</span></div><ScoreTrack label="Đầu vào" value={beforeScore} color="soft"/><ScoreTrack label="Sau học" value={afterScore}/><div className="dt-soft-note">{employee.evidence}. Điểm sau chỉ hiện khi đủ 5 lĩnh vực.</div><button className="dt-button primary wide" onClick={() => setStep('roadmap')}>Xem lộ trình học <ArrowRight size={17}/></button></aside></div>}
    </div>}

    {step === 'roadmap' && <div className="dt-page"><div className="dt-page-title"><div><span className="dt-kicker">BƯỚC 2 · ROADMAP CÁ NHÂN</span><h2>{role ? `Lộ trình cho ${role.name}` : 'Lộ trình học theo vị trí'}</h2><p>{employee?.name || 'Chưa chọn người học'} · ưu tiên kỹ năng còn thiếu</p></div>{topGap && <span className="dt-highlight">{matches.length} lĩnh vực cần học</span>}</div>
      {!employee?.before ? <EmptyState title="Cần đánh giá đầu vào trước" action="Bắt đầu đánh giá" onAction={() => setStep('assess')}/> : !topGap ? <EmptyState title="Đã đạt mức yêu cầu của vị trí" action="Khám phá khóa học" onAction={() => setStep('courses')}/> : <><div className="dt-roadmap-intro"><div><span className="dt-kicker">ƯU TIÊN #1</span><h3>{AREA_NAMES[roadmapArea-1]}</h3><p>Hiện tại <b>{roadmapCurrent}/6</b> <ArrowRight size={15}/> Mục tiêu <b>{roadmapTarget}/6</b></p></div><div className="dt-roadmap-score"><strong>{topGap.gap}</strong><span>mức cần cải thiện</span></div></div><div className="dt-roadmap-rail">{LEVELS.map((level, index) => { const course = ALL_DIGCOMP_COURSES[`A${roadmapArea}-${level.code}`]; const max = (index+1)*2; const complete = roadmapCurrent >= max; const current = topGap.course.id === course.id; const required = max-1 <= roadmapTarget; return <div key={level.code} className={`dt-milestone ${complete ? 'complete' : ''} ${current ? 'current' : ''}`}><div className="dt-mile-top"><span>{complete ? <Check size={17}/> : `0${index+1}`}</span><small>{complete ? 'MỨC ĐÃ KHAI' : current ? 'HỌC TIẾP' : required ? 'TIẾP THEO' : 'MỞ RỘNG'}</small></div><span className="dt-kicker">{level.name.toUpperCase()} · MỨC {level.range}</span><h3>{course.title}</h3><div className="dt-mile-meta"><span>{course.duration}</span><span>{!course.isCommerciallyReady ? 'Học thử' : coursePrice(course) ? currency(coursePrice(course)) : 'Miễn phí'}</span></div><button className={current ? 'dt-button primary' : 'dt-button ghost'} onClick={() => onOpenCourse(course)}>Xem khóa <ArrowRight size={15}/></button></div>; })}</div><details className="dt-disclosure dt-other-gaps"><summary>Xem {Math.max(0, matches.length-1)} lĩnh vực còn lại <ChevronDown size={16}/></summary><div className="dt-other-list">{matches.slice(1).map(item => <button key={item.course.id} onClick={() => onOpenCourse(item.course)}><span><strong>{AREA_NAMES[item.area-1]}</strong><small>{item.current}/6 → {item.level}/6 · {item.course.title}</small></span><ArrowRight size={16}/></button>)}</div></details><div className="dt-roadmap-bottom"><span><CircleHelp size={16}/> Sau mỗi vòng học, đánh giá lại để cập nhật khóa tiếp theo.</span><button className="dt-button secondary" onClick={() => {setPhase('after');setStep('assess');}}>Đánh giá lại <ArrowRight size={16}/></button></div><details className="dt-disclosure dt-mentor"><summary><Sparkles size={17}/> Hỏi mentor số theo vị trí <ChevronDown size={16}/></summary><form onSubmit={askMentor}><input value={question} onChange={event => setQuestion(event.target.value)} aria-label="Câu hỏi cho mentor" placeholder="Bạn muốn hỏi điều gì?"/><button className="dt-button primary" type="submit">Gợi ý</button></form>{answer && <p role="status">{answer}</p>}<small>Trợ lý theo quy tắc; chưa kết nối AI hoặc mentor thật.</small></details></>}
    </div>}

    {step === 'courses' && <div className="dt-page"><div className="dt-page-title"><div><span className="dt-kicker">BƯỚC 3 · THƯ VIỆN</span><h2>Chọn khóa học phù hợp</h2><p>15 khóa có giáo trình · 8 khóa chờ thẩm định thương mại · 5 lĩnh vực</p></div><div className="dt-course-filter"><label htmlFor="dt-area-filter">Lĩnh vực</label><select id="dt-area-filter" value={areaFilter} onChange={event => setAreaFilter(event.target.value)}><option value="all">Tất cả</option>{AREA_NAMES.map((name,index) => <option key={name} value={index+1}>{name}</option>)}</select></div></div><div className="dt-level-tabs"><button className={levelFilter === 'all' ? 'active' : ''} onClick={() => setLevelFilter('all')}>Tất cả <span>15</span></button>{LEVELS.map(level => <button key={level.code} className={levelFilter === level.code ? 'active' : ''} onClick={() => setLevelFilter(level.code)}>{level.name} <span>{level.range}</span></button>)}</div><div className="dt-course-layout"><div className="dt-course-grid">{catalog.map(course => <button key={course.id} className={`dt-course-card ${selectedCourseId === course.id ? 'selected' : ''}`} onClick={() => setSelectedCourseId(course.id)}><div className="dt-course-art"><span>{course.id}</span><BookOpen size={31}/></div><div className="dt-course-body"><span className="dt-course-level">{courseLevel(course)?.name} · {course.duration}</span><strong>{course.title}</strong><div><span>{AREA_NAMES[Number(course.areaId.slice(-1))-1]}</span><b>{!course.isCommerciallyReady ? 'Học thử' : coursePrice(course) ? currency(coursePrice(course)) : 'Miễn phí'}</b></div></div></button>)}</div><aside className="dt-panel dt-course-detail"><span className="dt-kicker">KHÓA ĐANG CHỌN</span><span className="dt-detail-code">{selectedCourse.id}</span><h3>{selectedCourse.title}</h3><p>{selectedCourse.objective}</p><div className="dt-detail-facts"><div><span>Cấp độ</span><strong>{courseLevel(selectedCourse)?.name}</strong></div><div><span>Thời lượng</span><strong>{selectedCourse.duration}</strong></div><div><span>Học phí</span><strong>{!selectedCourse.isCommerciallyReady ? 'Chờ thẩm định' : coursePrice(selectedCourse) ? currency(coursePrice(selectedCourse)) : 'Miễn phí'}</strong></div></div><button className="dt-button primary wide" onClick={() => onOpenCourse(selectedCourse)}>{'Xem nội dung khóa'} <ArrowRight size={16}/></button>{selectedCourse.isCommerciallyReady && coursePrice(selectedCourse)>0 && <button className="dt-button ghost wide" onClick={() => recordOrder(selectedCourse)}>Ghi đơn mô phỏng</button>}<small>{!selectedCourse.isCommerciallyReady ? 'Có giáo trình và bài tập để học thử; nội dung chờ chuyên gia thẩm định, chưa mở bán.' : 'Đơn hàng bản thử, không thanh toán thật.'}</small></aside></div></div>}

    {step === 'impact' && <div className="dt-page"><div className="dt-page-title"><div><span className="dt-kicker">BƯỚC 4 · KẾT QUẢ</span><h2>Tiến bộ nhìn thấy được</h2><p>So sánh cùng nhóm nhân sự có đủ hai lần đánh giá</p></div><span className="dt-mini-pill">{paired.count} hồ sơ đủ dữ liệu</span></div><div className="dt-impact-banner"><div><span>TRƯỚC</span><strong>{scoreLabel(paired.before)}</strong></div><ArrowRight size={26}/><div><span>SAU</span><strong>{scoreLabel(paired.after)}</strong></div><div className="dt-impact-delta">{paired.improvement === null ? 'Chưa có dữ liệu' : `${paired.improvement >= 0 ? '+' : ''}${paired.improvement} điểm`}</div></div><div className="dt-grid-2"><section className="dt-panel"><div className="dt-panel-head"><div><span className="dt-kicker">THEO NHÂN SỰ</span><h3>Trước / sau</h3></div></div>{organization.employees.length ? organization.employees.map(person => { const position = organization.roles.find(item => item.id === person.roleId); return <div key={person.id} className="dt-person"><div><strong>{person.name}</strong><small>{position?.name}</small></div><ScoreTrack label="Trước" value={scoreProfile(person.before, position?.requirements)} color="soft"/><ScoreTrack label="Sau" value={scoreProfile(person.after, position?.requirements)}/></div>; }) : <EmptyState title="Chưa có hồ sơ đánh giá" action="Thêm nhân sự" onAction={() => setStep('settings')}/>}</section><section className="dt-panel"><div className="dt-panel-head"><div><span className="dt-kicker">GIÁ TRỊ KINH TẾ</span><h3>Doanh thu đào tạo</h3></div></div><div className="dt-money-grid"><div><span>Đơn mô phỏng</span><strong>{currency(projection.recordedRevenue)}</strong></div><div><span>Nhu cầu khóa đã mở bán</span><strong>{currency(projection.plannedRevenue)}</strong></div></div><div className="dt-soft-note">{projection.hours} giờ học từ khóa sẵn học · Chi phí thời gian: {currency(projection.plannedTrainingCost)}</div><button className="dt-inline-link" onClick={() => setStep('courses')}>Xem khóa học & giá <ArrowRight size={15}/></button><details className="dt-disclosure"><summary>Cách tính & giới hạn <ChevronDown size={16}/></summary><p>Doanh thu ghi nhận là đơn mô phỏng. Nhu cầu chỉ tính hồ sơ đã nhập, không suy rộng cho toàn công ty. So sánh trước/sau là mô tả; cần mentor thẩm định minh chứng và đo chỉ số kinh doanh để đánh giá tác động thực tế.</p></details></section></div><div className="dt-next"><div className="dt-next-icon"><Sparkles size={22}/></div><div><strong>Ưu tiên chuyển đổi số</strong><span>{orgPriorities[0]?.priority > 0 ? actions[orgPriorities[0].index] : 'Đánh giá nhân sự để tạo gợi ý theo khoảng thiếu.'}</span></div><button onClick={() => setStep('roadmap')}>Xem roadmap <ArrowRight size={16}/></button></div></div>}

    {step === 'settings' && <div className="dt-page"><div className="dt-page-title"><div><span className="dt-kicker">THIẾT LẬP</span><h2>Cấu hình doanh nghiệp</h2><p>Chỉ mở phần bạn muốn thay đổi.</p></div><button className="dt-button ghost" onClick={() => setStep('home')}>Về tổng quan</button></div><div className="dt-grid-2 settings"><section className="dt-panel"><details className="dt-setting" open><summary><span className="dt-setting-icon"><Users size={19}/></span><span><strong>Thêm nhân sự</strong><small>Chọn vị trí để bắt đầu đánh giá</small></span><ChevronDown size={17}/></summary><form onSubmit={addEmployee}><label>Họ tên<input required value={employeeForm.name} onChange={event => setEmployeeForm({...employeeForm,name:event.target.value})} placeholder="Nguyễn Văn A"/></label><label>Vị trí<select required value={employeeForm.roleId} onChange={event => setEmployeeForm({...employeeForm,roleId:event.target.value})}><option value="">Chọn vị trí</option>{organization.roles.map(position => <option key={position.id} value={position.id}>{position.name}</option>)}</select></label><button className="dt-button primary" type="submit"><Plus size={16}/> Thêm nhân sự</button></form></details><details className="dt-setting"><summary><span className="dt-setting-icon"><Building2 size={19}/></span><span><strong>Thêm doanh nghiệp</strong><small>Tạo không gian thử nghiệm riêng</small></span><ChevronDown size={17}/></summary><form onSubmit={addCompany}><label>Tên doanh nghiệp<input required value={companyForm.name} onChange={event => setCompanyForm({...companyForm,name:event.target.value})}/></label><label>Ngành nghề<input value={companyForm.sector} onChange={event => setCompanyForm({...companyForm,sector:event.target.value})}/></label><div className="dt-form-two"><label>Quy mô<input type="number" min="1" max="500" value={companyForm.size} onChange={event => setCompanyForm({...companyForm,size:event.target.value})}/></label><label>Chi phí/giờ (đ)<input type="number" min="0" value={companyForm.hourlyCost} onChange={event => setCompanyForm({...companyForm,hourlyCost:event.target.value})}/></label></div><button className="dt-button primary" type="submit"><Plus size={16}/> Tạo doanh nghiệp</button></form></details><details className="dt-setting"><summary><span className="dt-setting-icon"><Target size={19}/></span><span><strong>Thêm vị trí đặc thù</strong><small>Chọn khung tham chiếu và chỉnh sau</small></span><ChevronDown size={17}/></summary><form onSubmit={addRole}><label>Tên vị trí<input required value={roleForm.name} onChange={event => setRoleForm({...roleForm,name:event.target.value})}/></label><label>Đặc thù công việc<input value={roleForm.specialty} onChange={event => setRoleForm({...roleForm,specialty:event.target.value})}/></label><label>Khung tham chiếu<select value={roleForm.benchmark} onChange={event => setRoleForm({...roleForm,benchmark:event.target.value})}><option value="ceo_executive">CEO / Điều hành</option><option value="marketing_specialist">Marketing</option><option value="b2b_sales">Kinh doanh</option><option value="accountant">Kế toán</option><option value="hr_specialist">Nhân sự</option></select></label><div className="dt-form-two"><label>Số người<input type="number" min="1" max="500" value={roleForm.headcount} onChange={event => setRoleForm({...roleForm,headcount:event.target.value})}/></label><label>Ưu tiên<select value={roleForm.priority} onChange={event => setRoleForm({...roleForm,priority:event.target.value})}><option value="1">P1 · Quan trọng</option><option value="2">P2 · Chính</option><option value="3">P3 · Bổ trợ</option></select></label></div><button className="dt-button primary" type="submit"><Plus size={16}/> Thêm vị trí</button></form></details></section><section className="dt-panel"><div className="dt-panel-head"><div><span className="dt-kicker">TÙY CHỈNH</span><h3>Chuẩn theo từng vị trí</h3></div><span className="dt-mini-pill">{organization.roles.length} vị trí</span></div><p className="dt-quiet">Mở một vị trí để chỉnh mức yêu cầu, trọng số và năng lực cốt lõi.</p>{organization.roles.map(position => <details key={position.id} className="dt-requirement"><summary><span><strong>{position.name}</strong><small>{position.specialty || position.family} · P{position.priority}</small></span><ChevronDown size={17}/></summary><div className="dt-req-table"><div className="dt-req-head"><span>Lĩnh vực</span><span>Mức</span><span>Trọng số</span><span>Cốt lõi</span></div>{position.requirements.map((requirement,index) => <div className="dt-req-row" key={requirement.areaId}><span>{AREA_NAMES[index]}</span><select aria-label={`Mức yêu cầu ${AREA_NAMES[index]}`} value={requirement.level} onChange={event => updateRequirement(position.id,index,'level',event.target.value)}>{Array.from({length:6},(_,n)=><option value={n+1} key={n+1}>{n+1}</option>)}</select><input aria-label={`Trọng số ${AREA_NAMES[index]}`} type="number" min="0" max="100" value={requirement.weight} onChange={event => updateRequirement(position.id,index,'weight',event.target.value)}/><input aria-label={`Cốt lõi ${AREA_NAMES[index]}`} type="checkbox" checked={requirement.mandatory} onChange={event => updateRequirement(position.id,index,'mandatory',event.target.checked)}/></div>)}</div><small>Trọng số luôn cân bằng thành 100%.</small></details>)}</section></div></div>}
    {step === 'settings' && <section className="dt-panel dt-provision"><div className="dt-panel-head"><div><span className="dt-kicker">TRIỂN KHAI CHO NHÂN VIÊN</span><h3>Tài khoản theo vị trí</h3><p>Thêm nhân sự ở trên, sau đó cấp mã để họ đăng nhập vào không gian học.</p></div><span className="dt-mini-pill">{organization.employees.filter(person => accounts[person.id]).length}/{organization.employees.length} đã cấp</span></div><div className="dt-account-list">{organization.employees.length ? organization.employees.map(person => { const position = organization.roles.find(item => item.id === person.roleId); const account = accounts[person.id]; return <div className="dt-account-row" key={person.id}><div><strong>{person.name}</strong><small>{position?.name || 'Chưa có vị trí'} · {account ? 'Đã cấp tài khoản' : 'Chưa cấp tài khoản'}</small></div><button className="dt-button ghost" onClick={() => account ? setRevealedAccount(account) : issueAccount(person)}>{account ? 'Xem mã demo' : 'Cấp tài khoản'}</button></div>; }) : <p className="dt-quiet">Chưa có nhân sự trong doanh nghiệp này.</p>}</div>{revealedAccount?.organizationId === organization.id && <div className="dt-credentials" role="status"><strong>Thông tin đăng nhập demo</strong><span>Doanh nghiệp: {organization.name}</span><span>Tên đăng nhập: <code>{revealedAccount.username}</code></span><span>Mã: <code>{revealedAccount.code}</code></span><small>Chỉ dùng để thử giao diện. Bản thật cần mật khẩu băm, lời mời một lần, xác thực và phân quyền trên máy chủ.</small></div>}</section>}
  </div>;
}



