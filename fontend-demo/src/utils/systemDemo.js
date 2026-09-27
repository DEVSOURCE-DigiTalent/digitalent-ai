import { commitOperations, COMPETENCIES } from './trainingOperations.js';
import { ALL_DIGCOMP_COURSES } from '../data/courseCatalog.js';
const id = () => crypto.randomUUID();
const now = () => new Date().toISOString();
function log(state, actorId, action, entityId, detail) { state.audit.unshift({id:id(),actorId,action,entityId,detail,createdAt:now()}); }
function notify(state, recipientId, title, message) { state.notifications.unshift({id:id(),recipientId,title,message,read:false,createdAt:now()}); }
export function safeLink(value) { try { const url=new URL(value); return ['https:','http:'].includes(url.protocol); } catch { return false; } }

export function createWorkTask(organization, form, actorId) {
  const person=organization.employees.find(item=>item.id===form.employeeId);
  if(!person || !form.title.trim() || !form.instructions.trim() || !form.dueDate) throw new Error('Điền nhân viên, tên bài, hướng dẫn và hạn nộp.');
  if(!form.targets.length || new Set(form.targets.map(item=>item.competencyId)).size!==form.targets.length || form.targets.some(item=>!COMPETENCIES.some(comp=>comp.code===item.competencyId) || ![1,2,3].includes(item.level))) throw new Error('Chọn ít nhất một năng lực và mức mục tiêu 1–3.');
  return commitOperations(organization.id,state=>{
    const task={id:id(),...structuredClone(form),status:'ASSIGNED',createdAt:now(),assignedBy:actorId,reviewerId:actorId,passingScore:70};
    state.tasks.unshift(task);
    notify(state,person.id,`Bài thực hành mới: ${task.title}`,`Hạn nộp ${task.dueDate}. Xem trong Công việc & hồ sơ.`);
    log(state,actorId,'Giao bài thực hành',task.id,`${person.name} · ${task.targets.length} năng lực`);
    return task;
  });
}
export function submitWorkTask(user, taskId, content, links, files=[]) {
  if(!content.trim() || links.some(link=>!safeLink(link))) throw new Error('Điền mô tả kết quả và dùng liên kết HTTP/HTTPS hợp lệ.');
  return commitOperations(user.organizationId,state=>{
    const task=state.tasks.find(item=>item.id===taskId && item.employeeId===user.employeeId);
    if(!task || !['ASSIGNED','NEEDS_REVISION'].includes(task.status)) throw new Error('Bài này chưa cho phép nộp phiên bản mới.');
    const versions=state.submissions.filter(item=>item.taskId===taskId);
    const submission={id:id(),taskId,version:versions.length+1,supersedesId:versions[0]?.id||null,content:content.trim(),links,files:files.map(file=>({name:file.name,size:file.size,type:file.type})),submittedAt:now(),employeeId:user.employeeId};
    state.submissions.unshift(submission); task.status='SUBMITTED';
    notify(state,task.reviewerId,`Có bài nộp: ${task.title}`,`Phiên bản ${submission.version} đang chờ duyệt.`);
    log(state,user.id,'Nộp minh chứng',submission.id,`${task.title} · v${submission.version}`);
    return submission;
  });
}
export function reviewWorkTask(organizationId, taskId, submissionId, verdict, results, feedback, actorId) {
  return commitOperations(organizationId,state=>{
    const task=state.tasks.find(item=>item.id===taskId);
    const latest=state.submissions.find(item=>item.taskId===taskId);
    if(!task || task.reviewerId!==actorId || task.status!=='SUBMITTED' || latest?.id!==submissionId) throw new Error('Chỉ người được giao duyệt mới duyệt được bản nộp mới nhất.');
    if(!['PASSED','NEEDS_REVISION'].includes(verdict) || !feedback.trim()) throw new Error('Chọn kết quả và ghi nhận xét.');
    if(results.length!==task.targets.length || new Set(results.map(item=>item.competencyId)).size!==results.length || task.targets.some(target=>!results.some(result=>result.competencyId===target.competencyId)) || results.some(result=>!Number.isFinite(result.score)||result.score<0||result.score>100)) throw new Error('Chấm đủ từng năng lực trên thang 0–100.');
    if(verdict==='PASSED' && results.some(result=>result.score<task.passingScore)) throw new Error('Tất cả năng lực phải đạt ít nhất 70 điểm trước khi xác nhận.');
    const evaluation={id:id(),taskId,submissionId,verdict,results:structuredClone(results),feedback:feedback.trim(),reviewedBy:actorId,reviewedAt:now()};
    state.evaluations.unshift(evaluation); task.status=verdict;
    if(verdict==='PASSED') task.targets.forEach(target=>{
      const evidence={id:id(),employeeId:task.employeeId,competencyId:target.competencyId,confirmedLevel:target.level,evaluationId:evaluation.id,submissionId,status:'CONFIRMED',confirmedAt:now(),confirmedBy:actorId};
      state.evidences.unshift(evidence);
      const profile=state.profiles.find(item=>item.employeeId===task.employeeId && item.competencyId===target.competencyId);
      if(!profile) state.profiles.push({...evidence,evidenceId:evidence.id});
      else if(target.level>profile.confirmedLevel) Object.assign(profile,{confirmedLevel:target.level,evidenceId:evidence.id,confirmedAt:now(),confirmedBy:actorId});
    });
    notify(state,task.employeeId,`${verdict==='PASSED'?'Đã duyệt':'Cần bổ sung'}: ${task.title}`,evaluation.feedback);
    log(state,actorId,verdict==='PASSED'?'Xác nhận năng lực':'Yêu cầu bổ sung',evaluation.id,`${task.title} · ${task.targets.length} mục tiêu`);
    return evaluation;
  });
}
export function saveDepartment(organization, name, managerId, actorId) {
  if(!name.trim() || (managerId && !organization.employees.some(item=>item.id===managerId))) throw new Error('Điền tên phòng và chọn quản lý trong doanh nghiệp.');
  return commitOperations(organization.id,state=>{
    if(state.departments.some(item=>item.name.toLowerCase()===name.trim().toLowerCase())) throw new Error('Tên phòng ban đã tồn tại.');
    const department={id:id(),name:name.trim(),managerId,status:'ACTIVE'};
    state.departments.push(department);log(state,actorId,'Tạo phòng ban',department.id,department.name);return department;
  });
}
export function placeEmployee(organization, employeeId, departmentId, actorId) {
  if(!organization.employees.some(item=>item.id===employeeId)) throw new Error('Nhân viên không thuộc doanh nghiệp.');
  commitOperations(organization.id,state=>{
    if(!state.departments.some(item=>item.id===departmentId)) throw new Error('Chọn phòng ban hợp lệ.');
    const current=state.directory.find(item=>item.employeeId===employeeId);
    if(current) current.departmentId=departmentId; else state.directory.push({employeeId,departmentId});
    log(state,actorId,'Phân công phòng ban',employeeId,departmentId);
  });
}
export function draftCourse(organizationId, courseId, title, purpose, actorId) {
  if(!ALL_DIGCOMP_COURSES[courseId] || !title.trim() || !purpose.trim()) throw new Error('Điền tên khóa và mục tiêu đào tạo.');
  return commitOperations(organizationId,state=>{
    const version=1+Math.max(0,...state.courseReleases.filter(item=>item.courseId===courseId).map(item=>item.version));
    const draft={id:id(),courseId,version,title:title.trim(),purpose:purpose.trim(),status:'DRAFT',snapshot:structuredClone(ALL_DIGCOMP_COURSES[courseId]),createdAt:now()};
    state.courseReleases.unshift(draft);log(state,actorId,'Soạn phiên bản khóa',draft.id,`${courseId} · v${version}`);return draft;
  });
}
export function publishCourse(organizationId, releaseId, actorId) {
  commitOperations(organizationId,state=>{
    const release=state.courseReleases.find(item=>item.id===releaseId);
    if(!release || release.status!=='DRAFT') throw new Error('Chỉ xuất bản phiên bản nháp.');
    if(!release.snapshot.modules.length || release.snapshot.modules.some(module=>!module.theory?.length || !module.quiz?.length) || !release.snapshot.finalAssessment?.length) throw new Error('Khóa cần có bài học, câu hỏi và bài cuối khóa.');
    state.courseReleases.filter(item=>item.courseId===release.courseId && item.status==='PUBLISHED').forEach(item=>{item.status='ARCHIVED';});
    release.status='PUBLISHED';release.publishedAt=now();log(state,actorId,'Xuất bản khóa demo',release.id,`${release.courseId} · v${release.version}`);
  });
}
export function saveWorkspaceSettings(organizationId, settings, actorId) {
  commitOperations(organizationId,state=>{state.settings={...state.settings,...settings};log(state,actorId,'Cập nhật thiết lập',organizationId,'Tùy chọn hiển thị và hướng dẫn học');});
}
