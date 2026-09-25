import React from 'react';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ClipboardList, FileCheck2, Sparkles } from 'lucide-react';
import { DIGCOMP_AREAS_FULL } from '../data/digcomp15Courses';
import { ALL_DIGCOMP_COURSES } from '../data/courseCatalog';
import './workspaceRefresh.css';

const sections = [
  ['landing', 'Bắt đầu'], ['home', 'Tổng quan'], ['matrix', 'Năng lực'], ['path', 'Lộ trình'], ['report', 'Kết quả'],
];
const levels = [
  ['F', 'Cơ bản', '1–2'], ['I', 'Trung cấp', '3–4'], ['A', 'Nâng cao', '5–6'],
];

function CourseAction({ course, onOpenCourse, label = 'Xem khóa học' }) {
  return <button className="pw-link" onClick={() => onOpenCourse(course)}>{label} <ArrowRight size={15}/></button>;
}

function AreaCourseTrack({ area, route, recommendation, completedCourses, onOpenCourse, role }) {
  const requirement = role?.competencies?.find(item => item.id === area.id);
  return <div className="pw-area-detail">
    <div className="pw-area-detail-heading">
      <div><span className="pw-eyebrow">LĨNH VỰC {area.code} · {area.enName}</span><h2>{area.name}</h2><p>{requirement?.note || 'Ba cấp độ phát triển năng lực trong lĩnh vực này.'}</p></div>
      <div className="pw-area-detail-level"><span>Vị trí yêu cầu</span><strong>{route?.requiredLevel || requirement?.reqLevelNumber || 6}/6</strong><small>{route ? `Khảo sát: ${route.currentLevel}/6 · thiếu ${route.gap} mức` : 'Chưa có khảo sát đầu vào'}</small></div>
    </div>
    {route?.focusSubName && route.gap > 0 && <div className="pw-focus"><Sparkles size={16}/><span>Cần củng cố: <strong>{route.focusSubName}</strong>. Bài liên quan được đánh dấu trong khóa học được gợi ý.</span></div>}
    <div className="pw-level-rail">{levels.map(([code,name,range],index) => {
      const course = ALL_DIGCOMP_COURSES[`A${area.code}-${code}`];
      const stage = route?.stages?.find(item => item.id === course.id);
      const completed = !!completedCourses?.[course.id]?.completed;
      const isNext = recommendation?.id === course.id;
      const focus = isNext && stage?.focusModuleCode && course.modules.find(module => module.id === stage.focusModuleCode);
      const status = completed ? 'Đã học' : isNext ? 'Học tiếp' : stage?.status === 'assessed' ? 'Bỏ qua theo khảo sát' : stage?.status === 'extension' ? 'Mở rộng' : route ? 'Sau khóa trước' : 'Khám phá';
      return <article className={`pw-level-card ${isNext ? 'recommended' : ''}`} key={course.id}>
        <div className="pw-level-top"><span className="pw-level-number">0{index+1}</span><span className={`pw-level-state ${isNext ? 'active' : ''}`}>{status}</span></div>
        <span className="pw-eyebrow">{name.toUpperCase()} · MỨC {range}</span>
        <h3>{course.title}</h3>
        <p>{course.objective}</p>
        {focus && <div className="pw-focus-module">Bài ưu tiên: {focus.title}</div>}
        <div className="pw-level-foot"><small>{course.modules.length} bài · {course.duration}</small><small>{course.isCommerciallyReady ? 'Học thử' : 'Giáo trình chờ thẩm định'}</small></div>
        <CourseAction course={isNext ? recommendation : course} onOpenCourse={onOpenCourse} label={isNext ? 'Vào khóa được gợi ý' : 'Xem nội dung'}/>
      </article>;
    })}</div>
    <p className="pw-caption">Đánh giá đầu vào có thể cho phép bỏ qua cấp đã đạt. Sau mỗi khóa, kết quả học được ghi nhận riêng; hãy đánh giá lại để đo mức năng lực mới.</p>
  </div>;
}

function RecommendedCourses({ recommendations, roadmap, completedCourses, onOpenCourse, onStartDiagnostic }) {
  if (!roadmap) return <section className="pw-panel pw-empty-callout"><div><span className="pw-eyebrow">LỘ TRÌNH CÁ NHÂN</span><h2>Chưa có kết quả đầu vào</h2><p>Hoàn thành 5 câu hỏi theo vị trí để biết lĩnh vực thiếu gì và khóa nên học trước.</p></div><button className="pw-primary" onClick={onStartDiagnostic}>Đánh giá đầu vào <ArrowRight size={16}/></button></section>;
  if (!recommendations.length) return <section className="pw-panel pw-empty-callout"><div><span className="pw-eyebrow">LỘ TRÌNH CÁ NHÂN</span><h2>{roadmap.routes.some(route => route.gap > 0) ? 'Đã học hết các khóa cần bổ sung' : 'Khảo sát chưa chỉ ra khóa bắt buộc'}</h2><p>{roadmap.routes.some(route => route.gap > 0) ? 'Hãy đánh giá lại để đo mức hiện tại sau học.' : 'Bạn vẫn có thể xem đủ ba cấp độ trong từng lĩnh vực để học mở rộng.'}</p></div><button className="pw-secondary" onClick={onStartDiagnostic}>Đánh giá lại</button></section>;
  return <section className="pw-panel"><div className="pw-panel-head"><div><span className="pw-eyebrow">GHÉP KHÓA SAU KHẢO SÁT</span><h2>Khóa cần học ở vòng hiện tại</h2><p>Mỗi lĩnh vực hiện một khóa kế tiếp đúng cấp độ. Hoàn thành rồi chuyển sang cấp còn thiếu.</p></div><span className="pw-status">{recommendations.length} lĩnh vực</span></div><div className="pw-recommend-list">{recommendations.map((course,index) => <div className="pw-recommend" key={course.id}><span className="pw-area-code">{String(index+1).padStart(2,'0')}</span><div><strong>{course.areaName} · {course.title}</strong><small>{course.currentLevel}/6 → cần {course.requiredLevel}/6 · thiếu {course.gap} mức {course.isCore ? '· năng lực trọng tâm' : ''}</small>{course.focusSubName && <small>Bài cần chú ý: {course.focusSubName}</small>}</div><CourseAction course={course} onOpenCourse={onOpenCourse} label="Vào học"/></div>)}</div></section>;
}

export default function PersonalWorkspace({ section, onNavigate, user, selectedRole, onSelectRole, roles, diagnosticDone, competenceScores, roadmap, recommendations = [], completedCourses, submission, onStartDiagnostic, onOpenCourse, onOpenTask, onOpenCertificate, selectedAreaId, onSelectArea }) {
  const requirements = selectedRole?.competencies || [];
  const assessed = DIGCOMP_AREAS_FULL.map(area => {
    const requirement = requirements.find(item => item.id === area.id);
    const current = diagnosticDone && competenceScores?.[area.id] != null ? Math.round(competenceScores[area.id] * 6 / 100) : null;
    const target = requirement?.reqLevelNumber || requirement?.requiredLevelNumber || 6;
    return { ...area, current, target, gap: current === null ? null : Math.max(0, target - current) };
  });
  const selectedArea = DIGCOMP_AREAS_FULL.find(area => area.id === selectedAreaId);
  const selectedRoute = roadmap?.routes?.find(route => route.areaId === selectedAreaId);
  const selectedRecommendation = recommendations.find(course => course.areaId === selectedAreaId);
  const finishedCount = Object.values(completedCourses || {}).filter(value => value?.completed).length;
  const nextCourse = recommendations[0];
  const title = { landing: 'Bắt đầu từ vị trí của bạn', home: 'Học tập của tôi', matrix: 'Năng lực theo vị trí', path: selectedArea ? selectedArea.name : 'Lộ trình học', report: 'Kết quả của tôi' }[section] || 'Học tập của tôi';
  const intro = { landing: 'Chọn vị trí, làm khảo sát, xem khoảng thiếu và học theo đúng cấp độ.', home: 'Tiếp tục khóa đang cần và theo dõi tiến độ.', matrix: 'So sánh kết quả khảo sát với mức yêu cầu của vị trí.', path: selectedArea ? 'Ba khóa cùng lĩnh vực, từ cơ bản đến nâng cao.' : 'Khóa được ghép từ khoảng thiếu và toàn bộ ba cấp độ trong từng lĩnh vực.', report: 'Khảo sát, học tập và minh chứng được theo dõi tách biệt.' }[section];
  function viewArea(id) { onSelectArea(id); onNavigate('path'); }

  return <div className="pw">
    <div className="pw-hero"><div><span className="pw-eyebrow">KHÔNG GIAN HỌC TẬP · BẢN DEMO</span><h1>{title}</h1><p>{intro}</p></div><div className="pw-hero-actions"><label>Vị trí đang xem<select value={selectedRole?.roleId} onChange={event => onSelectRole(roles.find(role => role.roleId === event.target.value))}>{roles.map(role => <option key={role.roleId} value={role.roleId}>{role.roleTitle}</option>)}</select></label><button className="pw-primary" onClick={onStartDiagnostic}>{diagnosticDone ? 'Đánh giá lại' : 'Đánh giá đầu vào'} <ArrowRight size={16}/></button></div></div>
    <nav className="pw-tabs" aria-label="Luồng học tập">{sections.map(([id,label],index) => <button key={id} className={section === id ? 'active' : ''} onClick={() => onNavigate(id)}><span>{index+1}</span>{label}</button>)}</nav>

    {(section === 'landing' || section === 'home') && <><div className="pw-stats"><div><span>Khảo sát đầu vào</span><strong>{diagnosticDone ? 'Đã có kết quả' : 'Chưa thực hiện'}</strong></div><div><span>Khóa đã học</span><strong>{finishedCount}</strong></div><div><span>Minh chứng</span><strong>{submission ? submission.status === 'approved' ? 'Đã duyệt' : submission.status === 'rejected' ? 'Cần bổ sung' : 'Chờ duyệt' : 'Chưa nộp'}</strong></div></div><div className="pw-grid"><section className="pw-panel"><div className="pw-panel-head"><div><span className="pw-eyebrow">BƯỚC TIẾP THEO</span><h2>{!diagnosticDone ? 'Xác định khoảng thiếu' : nextCourse ? 'Học khóa được ghép' : 'Đánh giá và xem kết quả'}</h2></div><Sparkles size={22}/></div><p>{!diagnosticDone ? 'Năm câu hỏi, mỗi câu thuộc một lĩnh vực. Kết quả sẽ chỉ ra mức hiện tại, mức yêu cầu và khóa học kế tiếp.' : nextCourse ? `${nextCourse.areaName}: ${nextCourse.currentLevel}/6 → ${nextCourse.requiredLevel}/6. Học ${nextCourse.title} trước.` : 'Chưa còn khóa cần học ở vòng hiện tại. Bạn có thể xem kết quả hoặc đánh giá lại.'}</p><button className="pw-primary" onClick={!diagnosticDone ? onStartDiagnostic : nextCourse ? () => onOpenCourse(nextCourse) : onStartDiagnostic}>{!diagnosticDone ? 'Bắt đầu đánh giá' : nextCourse ? 'Vào khóa học' : 'Đánh giá lại'} <ArrowRight size={16}/></button></section><section className="pw-panel"><div className="pw-panel-head"><h2>Hành trình học</h2><ClipboardList size={22}/></div><div className="pw-journey"><button onClick={onStartDiagnostic}><span>01</span><div><strong>Đánh giá theo vị trí</strong><small>{diagnosticDone ? 'Đã có khoảng thiếu' : '5 lĩnh vực năng lực'}</small></div><ArrowRight size={16}/></button><button onClick={() => onNavigate('matrix')}><span>02</span><div><strong>Xem từng lĩnh vực</strong><small>Hiện tại · yêu cầu · bài cần củng cố</small></div><ArrowRight size={16}/></button><button onClick={() => onNavigate('path')}><span>03</span><div><strong>Học theo cấp độ</strong><small>15 khóa · 63 bài học</small></div><ArrowRight size={16}/></button></div></section></div>{diagnosticDone && <RecommendedCourses recommendations={recommendations} roadmap={roadmap} completedCourses={completedCourses} onOpenCourse={onOpenCourse} onStartDiagnostic={onStartDiagnostic}/>}</>}

    {section === 'matrix' && <section className="pw-panel"><div className="pw-panel-head"><div><h2>5 lĩnh vực năng lực số</h2><p>Chọn lĩnh vực để xem cả ba khóa và bài học tương ứng.</p></div>{!diagnosticDone && <button className="pw-primary" onClick={onStartDiagnostic}>Làm khảo sát</button>}</div><div className="pw-area-list">{assessed.map(area => <button className="pw-area pw-area-button" key={area.id} onClick={() => viewArea(area.id)}><span className="pw-area-code">{area.code}</span><div className="pw-area-body"><strong>{area.name}</strong><div className="pw-bars"><span>Khảo sát <b>{area.current ?? '—'}/6</b><i style={{width:`${(area.current || 0)/6*100}%`}}/></span><span>Vị trí cần <b>{area.target}/6</b><i style={{width:`${area.target/6*100}%`}}/></span></div></div><span className={`pw-status ${area.gap === 0 ? 'good' : ''}`}>{area.gap === null ? 'Chưa đo' : area.gap === 0 ? 'Đạt theo khảo sát' : `Thiếu ${area.gap} mức`}</span><ArrowRight size={16}/></button>)}</div><p className="pw-caption">Một câu hỏi cho mỗi lĩnh vực cho kết quả sơ bộ. Kết quả học khóa và minh chứng thực tế được ghi nhận riêng.</p></section>}

    {section === 'path' && (selectedArea ? <><button className="pw-back" onClick={() => onSelectArea(null)}><ArrowLeft size={16}/> Tất cả lĩnh vực</button><section className="pw-panel"><AreaCourseTrack area={selectedArea} route={selectedRoute} recommendation={selectedRecommendation} completedCourses={completedCourses} onOpenCourse={onOpenCourse} role={selectedRole}/></section></> : <><RecommendedCourses recommendations={recommendations} roadmap={roadmap} completedCourses={completedCourses} onOpenCourse={onOpenCourse} onStartDiagnostic={onStartDiagnostic}/><section className="pw-panel"><div className="pw-panel-head"><div><span className="pw-eyebrow">THƯ VIỆN THEO LĨNH VỰC</span><h2>Chọn năng lực muốn học</h2><p>Mỗi lĩnh vực có ba khóa bao phủ cùng nhóm năng lực thành phần ở độ sâu tăng dần.</p></div><BookOpen size={22}/></div><div className="pw-domain-list">{DIGCOMP_AREAS_FULL.map(area => { const route = roadmap?.routes?.find(item => item.areaId === area.id); const recommendation = recommendations.find(item => item.areaId === area.id); return <button className="pw-domain" key={area.id} onClick={() => onSelectArea(area.id)}><span className="pw-area-code">{area.code}</span><span className="pw-domain-text"><strong>{area.name}</strong><small>{route ? `${route.currentLevel}/6 → ${route.requiredLevel}/6 · ${recommendation ? `học ${recommendation.id} tiếp` : route.gap ? 'đánh giá lại sau học' : 'không có khoảng thiếu'}` : 'Xem 3 khóa từ cơ bản đến nâng cao'}</small></span><span className="pw-domain-levels">Cơ bản <ArrowRight size={13}/> Trung cấp <ArrowRight size={13}/> Nâng cao</span><ArrowRight size={17}/></button>; })}</div></section></>)}

    {section === 'report' && <><div className="pw-stats"><div><span>Vị trí</span><strong>{selectedRole?.roleTitle}</strong></div><div><span>Khảo sát</span><strong>{diagnosticDone ? 'Đã có kết quả' : 'Chưa có'}</strong></div><div><span>Khóa đã học</span><strong>{finishedCount}</strong></div></div><div className="pw-grid"><section className="pw-panel"><div className="pw-panel-head"><h2>Khoảng thiếu sau khảo sát</h2><FileCheck2 size={22}/></div>{diagnosticDone ? assessed.map(area => <button className="pw-report-row" key={area.id} onClick={() => viewArea(area.id)}><span>{area.name}</span><strong>{area.current}/{area.target} {area.gap ? `· Thiếu ${area.gap}` : '· Đạt theo khảo sát'}</strong></button>) : <p>Hoàn thành đánh giá đầu vào để xem mức hiện tại so với vị trí.</p>}<button className="pw-link" onClick={() => onNavigate('matrix')}>Xem từng lĩnh vực <ArrowRight size={15}/></button></section><section className="pw-panel"><div className="pw-panel-head"><h2>Học tập và minh chứng</h2><CheckCircle2 size={22}/></div><p>{submission ? submission.status === 'approved' ? `Bài thực hành được duyệt: ${submission.score}/100 điểm.` : submission.status === 'rejected' ? 'Minh chứng cần bổ sung theo nhận xét của quản lý.' : 'Minh chứng đã nộp, đang chờ quản lý đánh giá.' : 'Chưa có bài thực hành được nộp.'}</p>{submission?.managerFeedback && <p className="pw-caption">Nhận xét: {submission.managerFeedback}</p>}<div className="pw-report-actions"><button className="pw-primary" onClick={onOpenTask}>{submission ? 'Xem hoặc sửa bài nộp' : 'Nộp minh chứng'}</button>{finishedCount > 0 && <button className="pw-secondary" onClick={onOpenCertificate}>Xem xác nhận học tập</button>}</div><p className="pw-caption">Hoàn thành khóa học không tự tăng mức năng lực. Đánh giá lại và thẩm định minh chứng sẽ cho thấy tiến bộ.</p></section></div></>}
  </div>;
}
