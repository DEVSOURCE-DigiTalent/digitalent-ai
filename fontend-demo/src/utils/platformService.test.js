import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { registerAccount, loginAccount, verifyAccount, resendVerification, saveLearningPolicy, inviteEmployee, acceptInvitation, cancelInvitation, createOrder, settleOrder, userForAccount, cancelCourseAssignment } from './platformService.js';
import { readPlatform, savePlatform } from './platformStore.js';
import { readOrganizations, ORGANIZATIONS_KEY } from './demoAccess.js';
import { readOperations, assignCourse } from './trainingOperations.js';
import { courseAccess } from './platformPolicy.js';
beforeEach(() => { const data=new Map();globalThis.localStorage={getItem:key=>data.get(key)||null,setItem:(key,value)=>data.set(key,value),removeItem:key=>data.delete(key)}; });
const form=(email,type='personal')=>({email,type,name:'Người dùng thử',password:'DemoOnly123!',targetRole:'marketing_specialist',consent:true,company:'Doanh nghiệp thử',sector:'Dịch vụ',size:20});
async function verified(email,type='personal') { const account=await registerAccount(form(email,type));return verifyAccount(email,readPlatform().mail.find(mail=>mail.accountId===account.id).code); }
async function employer() { const account=await verified('owner@demo.example','enterprise');saveLearningPolicy(account.id,account.organizationId,2,['A1-F','A4-F']);return account; }
const invitation=(email)=>({email,name:'Nhân viên',roleId:'marketing',courseIds:['A1-F','A4-F']});
test('email normalized; pending accounts cannot log in; verification is one use and provisions one organization',async()=>{
 const a=await registerAccount(form(' OWNER@DEMO.EXAMPLE ','enterprise'));
 await assert.rejects(loginAccount('owner@demo.example','DemoOnly123!'),/chưa xác thực/);
 await assert.rejects(registerAccount(form('owner@demo.example')),/đã đăng ký/);
 assert.throws(()=>verifyAccount(a.email,'not-code'),/Mã chưa đúng/);
 const account=verifyAccount(a.email,readPlatform().mail[0].code);
 assert.throws(()=>verifyAccount(a.email,readPlatform().mail[0].code),/không ở trạng thái/);
 assert.equal(readOrganizations().filter(org=>org.ownerAccountId===a.id).length,1);
 assert.equal((await loginAccount(a.email,'DemoOnly123!')).organizationId,account.organizationId);
 await assert.rejects(loginAccount(a.email,'wrong-password'),/chưa đúng/);
 assert.ok(!JSON.stringify(readPlatform()).includes('DemoOnly123!'));
});
test('expired, excessive and replaced verification codes are rejected',async()=>{
 const a=await registerAccount(form('first@demo.example'));let state=readPlatform();state.mail[0].expiresAt='2000-01-01';state.mail[0].createdAt='2000-01-01';savePlatform(state);
 assert.throws(()=>verifyAccount(a.email,state.mail[0].code),/hết hạn/);
 resendVerification(a.email);state=readPlatform();assert.ok(state.mail[1].usedAt);
 state.mail[0].attempts=5;savePlatform(state);assert.throws(()=>verifyAccount(a.email,state.mail[0].code),/số lần thử/);
});
test('Gmail can join only after matching verified invite; acceptance grants exactly selected courses once',async()=>{
 const owner=await employer();const invite=inviteEmployee(owner.id,owner.organizationId,invitation('employee@gmail.com'));
 assert.equal(readOrganizations().find(org=>org.id===owner.organizationId).employees.length,0);
 const wrong=await verified('wrong@gmail.com');assert.throws(()=>acceptInvitation(wrong.id,invite.id),/không dành/);
 const learner=await verified('employee@gmail.com');const user=acceptInvitation(learner.id,invite.id);
 assert.equal(user.role,'employee');assert.equal(user.organizationId,owner.organizationId);
 assert.equal(readOperations(owner.organizationId).assignments.length,2);
 assert.throws(()=>acceptInvitation(learner.id,invite.id),/không hợp lệ/);
 assert.throws(()=>inviteEmployee(owner.id,owner.organizationId,invitation('EMPLOYEE@gmail.com')),/đã là thành viên/);
 assert.equal(courseAccess(user,'A1-I').allowed,false);
 assert.equal(userForAccount(learner.id,'personal').role,'personal');
});
test('cancelled invitations cannot be used and foreign owner cannot change configuration',async()=>{
 const owner=await employer();const other=await verified('other@demo.example','enterprise');
 assert.throws(()=>saveLearningPolicy(other.id,owner.organizationId,2,['A1-F']),/không có quyền/);
 const invite=inviteEmployee(owner.id,owner.organizationId,invitation('join@gmail.com'));cancelInvitation(owner.id,invite.id);
 const learner=await verified('join@gmail.com');assert.throws(()=>acceptInvitation(learner.id,invite.id),/không hợp lệ/);
});
test('trial seats, course selection, pending conflicts and per employee course quotas are enforced',async()=>{
 const owner=await employer();assert.throws(()=>saveLearningPolicy(owner.id,owner.organizationId,3,['A1-F']),/1–2/);
 assert.throws(()=>saveLearningPolicy(owner.id,owner.organizationId,2,['A1-I']),/thuộc gói/);
 const invited=inviteEmployee(owner.id,owner.organizationId,invitation('a@gmail.com'));
 assert.throws(()=>inviteEmployee(owner.id,owner.organizationId,invitation('a@gmail.com')),/đã có lời mời/);
 assert.throws(()=>saveLearningPolicy(owner.id,owner.organizationId,1,['A1-F']),/xung đột/);
 for(let i=0;i<4;i++)inviteEmployee(owner.id,owner.organizationId,invitation(`member${i}@gmail.com`));
 assert.throws(()=>inviteEmployee(owner.id,owner.organizationId,invitation('extra@gmail.com')),/hết chỗ/);
 const learner=await verified('a@gmail.com');const user=acceptInvitation(learner.id,invited.id);
 saveLearningPolicy(owner.id,owner.organizationId,2,['A1-F','A4-F','A3-F']);
 const org=readOrganizations().find(item=>item.id===owner.organizationId);
 assert.throws(()=>assignCourse(org,user.employeeId,'A3-F','2099-01-01',owner.id),/Đã đủ 2/);
 const assignment=readOperations(org.id).assignments[0];cancelCourseAssignment(owner.id,org.id,assignment.id);
 assignCourse(org,user.employeeId,'A3-F','2099-01-01',owner.id);
 assert.equal(readOperations(org.id).assignments.filter(item=>item.status!=='CANCELLED').length,2);
});
test('failed/cancelled payments grant nothing, successful payment is idempotent and personal rights survive context switching',async()=>{
 const a=await verified('buyer@gmail.com');const user=userForAccount(a.id);
 let order=createOrder(a.id,'course','A1-I');settleOrder(a.id,order.id,'FAILED');assert.equal(courseAccess(user,'A1-I').allowed,false);
 order=createOrder(a.id,'course','A1-I');settleOrder(a.id,order.id,'CANCELLED');assert.equal(courseAccess(user,'A1-I').allowed,false);
 order=createOrder(a.id,'course','A1-I');assert.equal(createOrder(a.id,'course','A1-I').id,order.id);settleOrder(a.id,order.id,'PAID');
 assert.equal(courseAccess(user,'A1-I').allowed,true);assert.throws(()=>settleOrder(a.id,order.id,'PAID'),/đã được xử lý/);
 const owner=await employer();const invite=inviteEmployee(owner.id,owner.organizationId,invitation(a.email));const employee=acceptInvitation(a.id,invite.id);
 assert.equal(courseAccess(employee,'A1-I').label,'Quyền học cá nhân');
 assert.equal(readPlatform().orders.filter(item=>item.status==='PAID').length,1);
 const state=readPlatform();state.entitlements[0].expiresAt='2000-01-01';savePlatform(state);assert.equal(courseAccess(employee,'A1-I').allowed,false);
});
test('paid team plan enables advanced allocations; expired sponsorship is gated',async()=>{
 const owner=await employer();const order=createOrder(owner.id,'team',undefined,owner.organizationId);settleOrder(owner.id,order.id,'PAID');
 saveLearningPolicy(owner.id,owner.organizationId,3,['A1-F','A1-I','A1-A']);
 const invite=inviteEmployee(owner.id,owner.organizationId,{...invitation('team@gmail.com'),courseIds:['A1-I']});const account=await verified('team@gmail.com');const user=acceptInvitation(account.id,invite.id);
 assert.equal(courseAccess(user,'A1-I').label,'Doanh nghiệp tài trợ');
 const orgs=readOrganizations();orgs.find(org=>org.id===owner.organizationId).learningPolicy.expiresAt='2000-01-01';localStorage.setItem(ORGANIZATIONS_KEY,JSON.stringify(orgs));
 assert.equal(courseAccess(user,'A1-I').allowed,false);assert.equal(courseAccess(user,'A1-F').allowed,true);
 assert.throws(()=>createOrder(account.id,'team',undefined,owner.organizationId),/không có quyền/);
 assert.throws(()=>createOrder(account.id,'course','A3-I'),/chưa mở bán/);
});
