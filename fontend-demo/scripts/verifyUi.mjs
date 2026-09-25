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
  const user = { id:'emp01', name:'Người học demo' };
  const base = { onNavigate(){},user,selectedRole:JOB_ROLE_BENCHMARKS[0],onSelectRole(){},roles:JOB_ROLE_BENCHMARKS,diagnosticDone:false,competenceScores:null,roadmap:null,completedCourses:{},submission:null,onStartDiagnostic(){},onOpenCourse(){},onOpenTask(){},onOpenCertificate(){} };
  const render = (component, props) => renderToString(React.createElement(component, props));
  const app = render(App, {});
  assert.match(app, /Đăng nhập không gian thử nghiệm/);
  assert.doesNotMatch(app, /CERT-DIGCOMP-MKT-2026-9812/);
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
  console.log('UI SSR checks passed: login, 5 personal screens, 15 classrooms, manager, HR, verification, diagnostic, completion.');
} finally {
  await server.close();
}
