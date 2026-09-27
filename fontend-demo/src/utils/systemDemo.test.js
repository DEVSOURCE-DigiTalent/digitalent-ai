import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorkTask, submitWorkTask, reviewWorkTask, saveDepartment, placeEmployee, draftCourse, publishCourse } from './systemDemo.js';
import { readOperations, saveRequirementDraft, activateRequirement, calculateGap, COMPETENCIES } from './trainingOperations.js';
import { listConfirmations, lookupConfirmation, revokeConfirmation } from './learningConfirmations.js';
import { ORGANIZATIONS_KEY } from './demoAccess.js';
function setup() {
  const values=new Map();globalThis.localStorage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
  const organization={id:'org',roles:[{id:'marketing'}],employees:[{id:'emp',name:'Người học',roleId:'marketing'}]};
  localStorage.setItem(ORGANIZATIONS_KEY,JSON.stringify([organization]));
  const user={id:'emp',employeeId:'emp',organizationId:'org'};
  const form={employeeId:'emp',courseId:'A1-F',title:'Phân tích dữ liệu',instructions:'Nộp báo cáo và quy trình',dueDate:'2026-12-31',targets:[{competencyId:'1.1',level:1},{competencyId:'1.2',level:2}]};
  return {organization,user,form};
}
test('revision preserves earlier submissions; all targets must pass before profiles update',()=>{
  const {organization,user,form}=setup();const task=createWorkTask(organization,form,'admin');
  const first=submitWorkTask(user,task.id,'Kết quả v1',['https://example.com/v1']);
  const scores=[{competencyId:'1.1',score:80},{competencyId:'1.2',score:50}];
  assert.throws(()=>reviewWorkTask('org',task.id,first.id,'PASSED',scores,'Nhận xét','admin'),/70/);
  assert.equal(readOperations('org').profiles.length,0);
  reviewWorkTask('org',task.id,first.id,'NEEDS_REVISION',scores,'Bổ sung nguồn dữ liệu','admin');
  const second=submitWorkTask(user,task.id,'Kết quả v2',['https://example.com/v2']);
  assert.equal(second.version,2);assert.equal(second.supersedesId,first.id);
  assert.throws(()=>reviewWorkTask('org',task.id,first.id,'PASSED',scores,'Nhận xét','admin'),/mới nhất/);
  assert.throws(()=>reviewWorkTask('org',task.id,second.id,'PASSED',scores,'Nhận xét','outsider'),/người được giao/);
  reviewWorkTask('org',task.id,second.id,'PASSED',scores.map(item=>({...item,score:90})),'Đáp ứng sản phẩm','admin');
  const state=readOperations('org');assert.equal(state.profiles.length,2);assert.equal(state.evidences.length,2);assert.equal(state.submissions[1].content,'Kết quả v1');
  assert.throws(()=>reviewWorkTask('org',task.id,second.id,'PASSED',scores,'Lặp lại','admin'));
});
test('confirmed evidence feeds subsequent gap calculation without altering earlier snapshots',()=>{
  const {organization,user,form}=setup();const items=COMPETENCIES.slice(0,10).map(comp=>({competencyId:comp.code,requiredLevel:2,weight:10,mandatory:false}));
  const draft=saveRequirementDraft(organization,'marketing',items,'admin');activateRequirement('org',draft.id,'admin');
  const before=calculateGap(organization,'emp','admin');const task=createWorkTask(organization,form,'admin');const submission=submitWorkTask(user,task.id,'Minh chứng',[]);
  reviewWorkTask('org',task.id,submission.id,'PASSED',form.targets.map(target=>({competencyId:target.competencyId,score:80})),'Đạt','admin');
  const after=calculateGap(organization,'emp','admin');assert.equal(before.items.find(item=>item.competencyId==='1.2').gap,2);assert.equal(after.items.find(item=>item.competencyId==='1.2').gap,0);
});
test('organization assignments and publication versions preserve valid references',()=>{
  const {organization}=setup();const department=saveDepartment(organization,'Marketing','emp','admin');placeEmployee(organization,'emp',department.id,'admin');
  assert.throws(()=>placeEmployee(organization,'outside',department.id,'admin'));
  const one=draftCourse('org','A1-F','Khóa v1','Mục tiêu','admin');publishCourse('org',one.id,'admin');
  const two=draftCourse('org','A1-F','Khóa v2','Mục tiêu mới','admin');publishCourse('org',two.id,'admin');
  const releases=readOperations('org').courseReleases;assert.equal(releases.filter(item=>item.status==='PUBLISHED').length,1);assert.equal(releases.find(item=>item.id===one.id).title,'Khóa v1');assert.equal(releases.find(item=>item.id===one.id).status,'ARCHIVED');
});
test('confirmation revocation is reflected in verification without exposing internal reason',()=>{
  const {organization}=setup();localStorage.setItem('digcomp_completed_courses:org:emp',JSON.stringify({'A1-F':{completed:true,score:90,completedAt:'26/09/2026'}}));
  const record=listConfirmations(organization)[0];revokeConfirmation(organization,record.code,'Lý do nội bộ','admin');
  const publicRecord=lookupConfirmation(record.code);assert.equal(publicRecord.status,'REVOKED');assert.equal(publicRecord.reason,undefined);
});
