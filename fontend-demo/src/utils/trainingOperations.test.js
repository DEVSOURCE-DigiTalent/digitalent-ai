import test from 'node:test';
import assert from 'node:assert/strict';
import { activateRequirement, assignCourse, calculateGap, COMPETENCIES, markNotificationRead, readOperations, saveRequirementDraft, syncLearningProgress, validateRequirements } from './trainingOperations.js';
import { ALL_DIGCOMP_COURSES } from '../data/courseCatalog.js';

function setup() {
  const values = new Map();
  globalThis.localStorage = { getItem: key=>values.get(key)??null, setItem:(key,value)=>values.set(key,value) };
  const organization = { id:'org-1', roles:[{ id:'marketing' }], employees:[{ id:'emp-1', name:'An', roleId:'marketing' }] };
  const items = COMPETENCIES.slice(0,10).map(item=>({competencyId:item.code,requiredLevel:2,weight:10,mandatory:true}));
  return {organization,items};
}
test('activation requires 9–14 unique competencies, three levels and exactly 100 percent', ()=>{
  const {items}=setup();
  assert.doesNotThrow(()=>validateRequirements(items));
  assert.throws(()=>validateRequirements(items.slice(0,8)),/9/);
  assert.throws(()=>validateRequirements(items.map((item,index)=>({...item,requiredLevel:index?2:6}))),/1–3/);
  assert.throws(()=>validateRequirements(items.map(item=>({...item,weight:9}))),/100/);
  assert.throws(()=>validateRequirements([...items.slice(0,9),items[0]]),/trùng/);
});
test('activation archives the old version; historical gap keeps original snapshots', ()=>{
  const {organization,items}=setup();
  const first=saveRequirementDraft(organization,'marketing',items,'admin');
  activateRequirement(organization.id,first.id,'admin');
  const gap=calculateGap(organization,'emp-1','admin');
  assert.equal(gap.items[0].currentLevel,null);
  assert.equal(gap.items[0].priority,30);
  const second=saveRequirementDraft(organization,'marketing',items.map(item=>({...item,requiredLevel:3})),'admin');
  activateRequirement(organization.id,second.id,'admin');
  const state=readOperations(organization.id);
  assert.equal(state.requirementSets.filter(set=>set.status==='ACTIVE').length,1);
  assert.equal(state.requirementSets[0].status,'ARCHIVED');
  assert.equal(state.gapRuns[0].requirementSetId,first.id);
  assert.equal(state.gapRuns[0].items[0].requiredLevel,2);
  assert.throws(()=>activateRequirement(organization.id,first.id,'admin'));
});
test('assignment delivers a personal notice and completion never creates confirmed profiles', ()=>{
  const {organization}=setup();
  assignCourse(organization,'emp-1','A1-F','2026-12-31','admin');
  assert.throws(()=>assignCourse(organization,'emp-1','A1-F','2026-12-31','admin'),/đã có/);
  assert.throws(()=>assignCourse(organization,'outsider','A1-F','2026-12-31','admin'),/hợp lệ/);
  const user={id:'emp-1',employeeId:'emp-1',organizationId:organization.id};
  syncLearningProgress(user,'A1-F',{completedModules:{[ALL_DIGCOMP_COURSES['A1-F'].modules[0].id]:true}});
  assert.equal(readOperations(organization.id).enrollments[0].progress,33);
  syncLearningProgress(user,'A1-F',{isCompleted:true});
  const state=readOperations(organization.id);
  assert.equal(state.enrollments[0].status,'COMPLETED');
  assert.equal(state.profiles.length,0);
  assert.equal(state.notifications[0].recipientId,'emp-1');
  markNotificationRead(organization.id,state.notifications[0].id,'outsider');
  assert.equal(readOperations(organization.id).notifications[0].read,false);
  markNotificationRead(organization.id,state.notifications[0].id,'emp-1');
  assert.equal(readOperations(organization.id).notifications[0].read,true);
  assert.equal(readOperations('different-org').enrollments.length,0);
});
