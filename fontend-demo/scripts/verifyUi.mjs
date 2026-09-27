import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

const values = new Map();
globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key,value) => values.set(key,String(value)), removeItem: key => values.delete(key) };
globalThis.sessionStorage = globalThis.localStorage;
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const load = async path => (await server.ssrLoadModule(path)).default;
  const [App, PersonalWorkspace, ClassroomView, ManagerEvaluationView, HRDashboardView, PublicVerificationView, DiagnosticTestModal, CertificateModal] = await Promise.all([
    '/src/App.jsx','/src/components/PersonalWorkspace.jsx','/src/components/ClassroomView.jsx','/src/components/ManagerEvaluationView.jsx','/src/components/HRDashboardView.jsx','/src/components/PublicVerificationView.jsx','/src/components/DiagnosticTestModal.jsx','/src/components/CertificateModal.jsx'
  ].map(load));
  const { ALL_DIGCOMP_COURSES } = await server.ssrLoadModule('/src/data/courseCatalog.js');
  const { JOB_ROLE_BENCHMARKS } = await server.ssrLoadModule('/src/utils/competenceEngine.js');
  const { getDemoCompletionCode } = await server.ssrLoadModule('/src/utils/demoCompletion.js');
  const { default: TrainingOperations, EmployeeAssignments } = await server.ssrLoadModule('/src/components/TrainingOperations.jsx');
  const SystemWorkspace = await load('/src/components/SystemWorkspace.jsx');
  const { DEMO_ORGANIZATIONS } = await server.ssrLoadModule('/src/data/enterpriseDemo.js');
  const { assignCourse } = await server.ssrLoadModule('/src/utils/trainingOperations.js');
  const user = { id:'emp01', name:'Người học demo' };
  const base = { onNavigate(){},user,selectedRole:JOB_ROLE_BENCHMARKS[0],onSelectRole(){},roles:JOB_ROLE_BENCHMARKS,diagnosticDone:false,competenceScores:null,roadmap:null,completedCourses:{},submission:null,onStartDiagnostic(){},onOpenCourse(){},onOpenTask(){},onOpenCertificate(){} };
  const render = (component, props) => renderToString(React.createElement(component, props));
  const app = render(App, {});
  assert.match(app, /Vị trí bạn muốn/);
  assert.match(app, /DigComp 3.0/);
  const FrameworkWorkspace = await load('/src/components/FrameworkWorkspace.jsx');
  const framework = render(FrameworkWorkspace, {onOpenCourse(){}});
  assert.match(framework.replaceAll('<!-- -->',''), /21\/24/);
  assert.match(framework, /Bản đối chiếu dự thảo/);
  assert.doesNotMatch(framework, /Ưu tiên phát triển/);
  const aiSources = render(FrameworkWorkspace, {initialSection:'sources',onOpenCourse(){}});
  assert.match(aiSources, /giaotrinh-mien6-AI.docx/);
  assert.match(aiSources, /Phát video mô phỏng/);
  assert.match(aiSources, /Hiểu biết cơ bản về AI/);
  const priorities = render(FrameworkWorkspace, {initialSection:'development',showDevelopment:true,onOpenCourse(){}});
  assert.match(priorities, /rubric/);
  assert.match(priorities, /Đối soát gói học/);
  assert.doesNotMatch(app, /CERT-DIGCOMP-MKT-2026-9812/);
  const organization = DEMO_ORGANIZATIONS[0];
  assignCourse(organization, organization.employees[0].id, 'A1-F', '2026-12-31', 'admin-demo');
  const BusinessManagementWorkspace = await load('/src/components/BusinessManagementWorkspace.jsx');
  const businessUser={id:`admin-${organization.id}`,role:'enterprise_admin',organizationId:organization.id};
  for (const initialSection of ['overview','people','progress','capability','catalog','billing','settings']) {
    const html=render(BusinessManagementWorkspace,{user:businessUser,initialSection});
    assert.match(html,/Quản lý doanh nghiệp/);
    assert.doesNotMatch(html,/Vào lớp học|Bắt đầu đánh giá|Biên tập &amp; học liệu|Xuất bản|Lộ trình của tôi/);
    assert.doesNotMatch(html,/undefined|NaN/);
    if(initialSection==='catalog')assert.match(html,/Phân bổ khóa cho nhân viên/);
    if(initialSection==='progress')assert.match(html,/Tìm kiếm và lưu trữ thông tin cơ bản/);
    if(initialSection==='settings'){
      for (const label of ['Lưu thông tin doanh nghiệp','Đặc thù công việc','Số người dự kiến','Ưu tiên đào tạo','Mức yêu cầu &amp; trọng số khảo sát nội bộ','Hạn mức &amp; khóa được tài trợ','Khung yêu cầu theo vị trí']) assert.ok(html.includes(label), `Missing company setting: ${label}`);
    }
  }
  const isolatedRequirements=render(TrainingOperations,{organization,initialTab:'requirements',hideNavigation:true});
  assert.match(isolatedRequirements,/Lưu thành phiên bản nháp/);
  assert.doesNotMatch(isolatedRequirements,/aria-label="Quản lý đào tạo"/);
  const { ORGANIZATIONS_KEY } = await server.ssrLoadModule('/src/utils/demoAccess.js');
  const ownedOrganization={...organization,id:'owned-business',ownerAccountId:'owner-account',employees:[],learningPolicy:{plan:'trial',courseLimit:2,allowedCourseIds:['A1-F','A4-F'],configured:false,expiresAt:new Date(Date.now()+86400000).toISOString()}};
  localStorage.setItem(ORGANIZATIONS_KEY,JSON.stringify([...DEMO_ORGANIZATIONS,ownedOrganization]));
  const ownerUser={...businessUser,organizationId:ownedOrganization.id,accountId:'owner-account'};
  for(const initialSection of ['people','catalog','billing']){
    const html=render(BusinessManagementWorkspace,{user:ownerUser,initialSection});
    assert.match(html,/Hoàn tất cấu hình/);
    assert.doesNotMatch(html,/Vào lớp học|Biên tập|undefined|NaN/);
    if(initialSection==='people')assert.match(html,/Email nhân viên/);
    if(initialSection==='billing')assert.match(html,/Lưu chương trình đào tạo/);
  }
  const { AccountWorkspace } = await server.ssrLoadModule('/src/components/PlatformWorkspace.jsx');
  const ownerAccount=render(AccountWorkspace,{user:ownerUser,onSwitch(){}});
  assert.doesNotMatch(ownerAccount,/Đơn mua cá nhân|Quyền học cá nhân/);
  assert.match(render(TrainingOperations, { organization, onOpenCourse(){} }), /Theo dõi lớp học/);
  const assignedHtml = render(EmployeeAssignments, { user: { employeeId: organization.employees[0].id, organizationId: organization.id }, onOpenCourse(){} });
  assert.match(assignedHtml, /Kế hoạch học của bạn/);
  assert.match(assignedHtml, /Tìm kiếm và lưu trữ thông tin cơ bản/);
  for (const initialSection of ['overview','people','training','tasks','profiles','studio','certificates','reports','settings']) {
    const html = render(SystemWorkspace, { organization, initialSection, onOpenCourse(){} });
    assert.match(html, /ĐIỀU HÀNH ĐÀO TẠO/);
    assert.doesNotMatch(html, /undefined/);
  }
  const employeeUser = {id:organization.employees[0].id,employeeId:organization.employees[0].id,organizationId:organization.id,name:organization.employees[0].name};
  for (const initialSection of ['overview','tasks','profiles','studio','certificates']) {
    const html=render(SystemWorkspace,{organization,user:employeeUser,initialSection,onOpenCourse(){}});
    assert.match(html,/CÔNG VIỆC &amp; HỒ SƠ/);
    assert.doesNotMatch(html,/Giao bài mới|Xuất bản|Tạo phòng ban/);
  }
  for (const section of ['landing','home','matrix','path','report']) {
    const html = render(PersonalWorkspace, {...base,section});
    assert.match(html, /KHÔNG GIAN HỌC TẬP/);
  }
  assert.match(render(PersonalWorkspace, {...base,section:'path',roadmap:null,recommendations:[]}), /lộ trình|Lộ trình/i);
  for (const course of Object.values(ALL_DIGCOMP_COURSES).filter(c=>!c.isOutlineOnly)) {
    const html = render(ClassroomView,{course,onBackToDashboard(){},onCourseCompleted(){},onSaveProgress(){}});
    assert.match(html, /PHÒNG HỌC/);
    assert.match(html, /Ôn tập cuối khóa/);
    assert.match(html, /HỌC BẰNG VIDEO/);
  }
  assert.match(render(ManagerEvaluationView,{submission:null}), /Chưa có bài nộp/);
  assert.match(render(HRDashboardView,{diagnosticDone:false,completedCourses:{},submission:null,onNavigate(){}}), /0/);
  assert.doesNotMatch(render(PublicVerificationView,{completedCourses:{},user}), /Tìm thấy kết quả/);
  const completion = { 'A1-F': { completed:true, score:80, completedAt:'25/09/2026' } };
  const code = getDemoCompletionCode(user.id,'A1-F');
  assert.match(render(PublicVerificationView,{completedCourses:completion,user,initialCode:code}), /Tìm thấy kết quả học tập/);
  assert.match(render(CertificateModal,{completedCourses:completion,user,activeCourseId:'A1-F',onClose(){},onOpenPublicVerification(){}}), new RegExp(code));
  assert.match(render(DiagnosticTestModal,{targetRole:JOB_ROLE_BENCHMARKS[0],onComplete(){},onClose(){}}), /Câu 1/);
  assert.match(render(CertificateModal,{completedCourses:{},user,onClose(){}}), /Chưa có khóa học hoàn thành/);
  console.log('UI SSR checks passed: 9 admin and 5 employee portal screens, login, 5 personal screens, 15 classrooms, manager, HR, verification, diagnostic, completion.');
} finally {
  await server.close();
}
