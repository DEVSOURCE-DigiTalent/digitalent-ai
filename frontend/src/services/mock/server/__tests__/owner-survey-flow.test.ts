import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetMockDb } from '../../mock-store';
import { dispatch } from '../router';
import { getOrgData, updateOrgData } from '../org-store';
import { CATEGORIES, COURSES } from '../catalog';
import { getCourseAssessment } from '../../../../features/learning/data/course-content';
import '../handlers';

const call = (method: string, path: string, body: Record<string, unknown> = {}) => dispatch({method,path,body,query:{},userId:'mock-owner'});
const payload = <T,>(response: {body:unknown}) => (response.body as {data:T}).data;

describe('automatic enterprise survey', () => {
  beforeEach(() => { localStorage.clear(); resetMockDb(); vi.stubEnv('VITE_OWNER_SHOWCASE', 'true'); });
  afterEach(() => vi.unstubAllEnvs());

  it('closes early on "Xem kết quả ngay" and suggests a training scope from the results', async () => {
    expect(payload<{stage:string}>(await call('GET','/trial')).stage).toBe('OPEN');
    expect(payload<{available:boolean}>(await call('GET','/trial/roadmap')).available).toBe(false);
    const closed=payload<{assessed:number}>(await call('POST','/trial/close'));
    expect(closed.assessed).toBeGreaterThan(0);
    const program=payload<{stage:string;report:{assessed:number;summary:{correctRates:(number|null)[]}[];insights:{status:string;ceilingReasons:unknown[]}}}>(await call('GET','/trial'));
    expect(program.stage).toBe('REPORTED');
    expect(program.report.assessed).toBe(closed.assessed);
    expect(program.report.summary).toHaveLength(6);
    expect(program.report.insights.status).toBe('FALLBACK');
    expect(program.report.insights.ceilingReasons).toHaveLength(6);
    const roadmap=payload<{available:boolean;options:{kind:string;organization:number[]}[];prices:number[]}>(await call('GET','/trial/roadmap'));
    expect(roadmap.available).toBe(true);
    expect(roadmap.options.map((option)=>option.kind)).toEqual(['SAVING','BALANCED','FULL']);
    expect(roadmap.options[2].organization).toEqual([3,3,3,3,3,3]);
    expect(roadmap.prices).toEqual([0,0,399000,699000]);
    expect((await call('POST','/trial/close')).status).toBe(409);
  });

  it('joins the owner once, issues the employee paper, grades choices and includes the result in the final overview', async () => {
    const initial = payload<{organizationId:string;departments:string[];positions:string[]}>(await call('GET','/trial'));
    // This case starts with an owner who has not yet submitted (the showcase includes a historical owner result).
    updateOrgData(initial.organizationId,(data)=>{const owner=data.trialSurvey!.program.participants.find((entry)=>entry.isOwner);if(owner?.employeeId){delete data.trialSurvey!.results[owner.employeeId];owner.status='ACTIVE';}});
    const placement={department:initial.departments[0],position:initial.positions[0]};
    const joined=payload<{employeeId:string}>(await call('POST','/trial/me/join',placement));
    expect(payload<{employeeId:string}>(await call('POST','/trial/me/join',placement)).employeeId).toBe(joined.employeeId);
    const mine=payload<{canStart:boolean}>(await call('GET','/me/trial-assessment'));
    expect(mine.canStart).toBe(true);
    const paper=payload<{sessionId:string;questions:{questionId:string;tier:number;domainNumber:number;correctOptionId?:string}[]}>(await call('POST','/me/trial-assessment/proctoring'));
    expect(paper.questions).toHaveLength(18);
    expect(paper.questions.every((question)=>question.correctOptionId===undefined)).toBe(true);
    for(const track of ['SCREEN','CAMERA']){
      const recording=payload<{recordingId:string}>(await call('POST',`/me/pulse/proctoring/${paper.sessionId}/recordings`,{track}));
      await call('PUT',`/me/pulse/proctoring/${paper.sessionId}/recordings/${recording.recordingId}/chunks/0`);
      await call('POST',`/me/pulse/proctoring/${paper.sessionId}/recordings/${recording.recordingId}/end`);
    }
    const answers=paper.questions.map((question)=>{
      const category=CATEGORIES.find((entry)=>entry.sortOrder===question.domainNumber)!;
      const course=COURSES.find((entry)=>entry.categoryId===category.id&&entry.level===question.tier&&entry.status==='PUBLISHED')!;
      const correct=getCourseAssessment(course.id,course.code,course.title).questions[0].correctOptionIndex;
      return {questionId:question.questionId,optionId:`o${question.tier===3?(correct+1)%4:correct}`};
    });
    expect((await call('POST','/me/trial-assessment',{proctoringSessionId:paper.sessionId,answers})).status).toBe(200);
    // Máy chấm ngay, nhưng mức chỉ hiện khi bài đóng.
    const result=payload<{status:string;levels:number[]|null}>(await call('GET','/me/trial-assessment'));
    expect(result.status).toBe('SUBMITTED');expect(result.levels).toBeNull();
    expect((await call('POST','/me/trial-assessment',{proctoringSessionId:paper.sessionId,answers})).status).toBe(409);
    const live=payload<{stage:string;report:unknown;participants:{employeeId?:string;status:string}[]}>(await call('GET','/trial'));
    expect(live.stage).toBe('OPEN');
    expect(live.report).toBeNull();
    expect(live.participants.find((entry)=>entry.employeeId===joined.employeeId)?.status).toBe('SUBMITTED');
    updateOrgData(initial.organizationId,(data)=>{data.trialSurvey!.program.testDeadline=new Date(Date.now()-1000).toISOString();});
    const finished=payload<{stage:string;report:{employees:{employeeId:string}[]}}>(await call('GET','/trial'));
    expect(finished.stage).toBe('REPORTED');expect(finished.report.employees.some((entry)=>entry.employeeId===joined.employeeId)).toBe(true);
    expect(getOrgData(initial.organizationId).overallAssessments?.some((entry)=>entry.employeeId===joined.employeeId)).toBe(true);
    const reported=payload<{status:string;levels:number[]}>(await call('GET','/me/trial-assessment'));
    expect(reported.status).toBe('REPORTED');expect(reported.levels).toEqual([2,2,2,2,2,2]);
  });

  it('rejects an invalid deadline before creating invitation records',async()=>{
    const initial=payload<{organizationId:string}>(await call('GET','/trial'));
    const count=getOrgData(initial.organizationId).trialSurvey!.program.participants.length;
    expect((await call('POST','/trial/participants',{testDeadline:'invalid',rows:[]})).status).toBe(400);
    expect(getOrgData(initial.organizationId).trialSurvey!.program.participants).toHaveLength(count);
  });
});
