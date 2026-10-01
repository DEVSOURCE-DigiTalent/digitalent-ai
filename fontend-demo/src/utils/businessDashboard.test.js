import test from 'node:test';
import assert from 'node:assert/strict';
import { businessDashboard } from './businessDashboard.js';

const org={employees:[{id:'p1',roleId:'marketing'},{id:'p2',roleId:'sales'}]};
const empty=()=>({assignments:[],enrollments:[],requirementSets:[],profiles:[],tasks:[]});

test('company progress excludes self study, recalled courses and employees outside organization',()=>{
  const ops=empty();
  ops.assignments=[{id:'a1',employeeId:'p1',courseId:'A1-F',dueDate:'2026-09-26'},
    {id:'a2',employeeId:'p2',courseId:'A4-F',dueDate:'2026-09-27'},
    {id:'recalled',employeeId:'p1',courseId:'A3-F',status:'CANCELLED'},
    {id:'foreign',employeeId:'other',courseId:'A5-F'}];
  ops.enrollments=[{assignmentId:'a1',employeeId:'p1',courseId:'A1-F',status:'IN_PROGRESS',progress:40},
    {assignmentId:'a2',employeeId:'p2',courseId:'A4-F',status:'NOT_STARTED',progress:0},
    {employeeId:'p1',courseId:'A2-F',status:'COMPLETED',progress:100},
    {assignmentId:'recalled',employeeId:'p1',courseId:'A3-F',status:'COMPLETED',progress:100}];
  const result=businessDashboard(org,ops,new Date(2026,8,27,12));
  assert.equal(result.allocations.length,2);assert.equal(result.allocatedEmployees,2);
  assert.equal(result.averageProgress,20);assert.equal(result.completed,0);assert.equal(result.overdue,1);
  assert.equal(result.allocations[1].learningStatus,'NOT_STARTED');
  ops.enrollments[0].status='COMPLETED';ops.enrollments[0].progress=100;
  const finished=businessDashboard(org,ops,new Date(2026,8,27));
  assert.equal(finished.overdue,0);assert.equal(finished.completionRate,50);
});

test('an enrollment with a different assignment or employee does not inflate allocated progress',()=>{
  const ops=empty();ops.assignments=[{id:'a1',employeeId:'p1',courseId:'A1-F'}];
  ops.enrollments=[{employeeId:'p1',courseId:'A1-F',progress:100,status:'COMPLETED'},
    {assignmentId:'a1',employeeId:'p2',courseId:'A1-F',progress:100,status:'COMPLETED'}];
  assert.equal(businessDashboard(org,ops).averageProgress,0);
  assert.equal(businessDashboard(org,empty()).completionRate,null);
});

test('capability counts confirmed evidence against ACTIVE requirements without converting survey values',()=>{
  const ops=empty();const company={employees:[{id:'p1',roleId:'marketing',before:[6,6,6,6,6]},...org.employees.slice(1)]};
  ops.requirementSets=[{positionId:'marketing',status:'ARCHIVED',items:[{competencyId:'4.1',requiredLevel:1}]},
    {positionId:'marketing',status:'ACTIVE',items:[{competencyId:'1.1',requiredLevel:2},{competencyId:'1.2',requiredLevel:3},{competencyId:'3.1',requiredLevel:1}]}];
  ops.profiles=[{employeeId:'p1',competencyId:'1.1',confirmedLevel:2},{employeeId:'p1',competencyId:'1.2',confirmedLevel:1},
    {employeeId:'other',competencyId:'3.1',confirmedLevel:3}];
  ops.tasks=[{employeeId:'other',status:'SUBMITTED'},{employeeId:'p1',status:'SUBMITTED'}];
  const result=businessDashboard(company,ops);
  assert.equal(result.requiredCriteria,3);assert.equal(result.knownCriteria,2);assert.equal(result.metCriteria,1);
  assert.equal(result.employeesWithRequirements,1);assert.equal(result.pendingReviews,1);
  assert.equal(result.capability[0].items[2].currentLevel,null);
});
