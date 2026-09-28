import { getDemoCompletionCode } from './demoCompletion.js';
import { readOrganizations } from './demoAccess.js';
import { readOperations, commitOperations } from './trainingOperations.js';
import { ALL_DIGCOMP_COURSES } from '../data/courseCatalog.js';

export function listConfirmations(organization, employeeId) {
  const state=readOperations(organization.id);
  return organization.employees.filter(person=>!employeeId||person.id===employeeId).flatMap(person=>{
    let completions={};try{completions=JSON.parse(localStorage.getItem(`digcomp_completed_courses:${organization.id}:${person.id}`)||'{}');}catch{}
    return Object.entries(completions).filter(([,item])=>item.completed).map(([courseId,item])=>{
      const code=getDemoCompletionCode(person.id,courseId);
      return {code,employeeId:person.id,holder:person.name,organizationId:organization.id,courseId,courseTitle:ALL_DIGCOMP_COURSES[courseId]?.title||courseId,score:item.score,completedAt:item.completedAt,status:state.certificateRevocations.some(record=>record.code===code)?'REVOKED':'VALID'};
    });
  });
}
export function lookupConfirmation(code) {
  for(const organization of readOrganizations()) {
    const record=listConfirmations(organization).find(item=>item.code===code);
    if(record) return record;
  }
  return null;
}
export function revokeConfirmation(organization, code, reason, actorId) {
  const record=listConfirmations(organization).find(item=>item.code===code);
  if(!record || record.status!=='VALID' || !reason.trim()) throw new Error('Chọn xác nhận còn hiệu lực và nhập lý do thu hồi.');
  commitOperations(organization.id,state=>{
    const entry={id:crypto.randomUUID(),code,reason:reason.trim(),actorId,revokedAt:new Date().toISOString()};
    state.certificateRevocations.unshift(entry);
    state.audit.unshift({id:crypto.randomUUID(),actorId,action:'Thu hồi xác nhận học tập',entityId:code,detail:record.courseTitle,createdAt:entry.revokedAt});
    state.notifications.unshift({id:crypto.randomUUID(),recipientId:record.employeeId,title:'Xác nhận học tập đã thu hồi',message:record.courseTitle,read:false,createdAt:entry.revokedAt});
  });
}
export function recordVerification(organizationId, code, status) {
  if(!organizationId)return;
  commitOperations(organizationId,state=>{state.verificationLogs.unshift({id:crypto.randomUUID(),code,status,createdAt:new Date().toISOString()});});
}
