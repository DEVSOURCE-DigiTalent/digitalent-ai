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

  it('joins the owner once, issues the employee paper, grades choices and includes the result in the final overview', async () => {
    const initial = payload<{organizationId:string;departments:string[];positions:string[]}>(await call('GET','/trial'));
    // This case starts with an owner who has not yet submitted (the showcase includes a historical owner result).
    updateOrgData(initial.organizationId,(data)=>{const owner=data.trialSurvey!.program.participants.find((entry)=>entry.isOwner);if(owner?.employeeId){delete data.trialSurvey!.results[owner.employeeId];owner.status='ACTIVE';}});
    const placement={department:initial.departments[0],position:initial.positions[0]};
    const joined=payload<{employeeId:string}>(await call('POST','/trial/me/join',placement));
    expect(payload<{employeeId:string}>(await call('POST','/trial/me/join',placement)).employeeId).toBe(joined.employeeId);
    const mine=payload<{canStart:boolean;essays:unknown[]}>(await call('GET','/me/trial-assessment'));
    expect(mine.canStart).toBe(true);expect(mine.essays).toEqual([]);
    const paper=payload<{sessionId:string;questions:{questionId:string;tier:number;domainNumber:number;correctOptionId?:string}[];essays:unknown[]}>(await call('POST','/me/trial-assessment/proctoring'));
    expect(paper.questions).toHaveLength(18);expect(paper.essays).toEqual([]);
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
    const result=payload<{status:string;levels:number[]}>(await call('GET','/me/trial-assessment'));
    expect(result.status).toBe('REVIEWED');expect(result.levels).toEqual([2,2,2,2,2,2]);
    expect((await call('POST','/me/trial-assessment',{proctoringSessionId:paper.sessionId,answers})).status).toBe(409);
    const live=payload<{stage:string;report:{publishedAt?:string;employees:{employeeId:string}[]}}>(await call('GET','/trial'));
    expect(live.stage).not.toBe('REPORTED');
    expect(live.report.publishedAt).toBeFalsy();
    expect(live.report.employees.some((entry)=>entry.employeeId===joined.employeeId)).toBe(true);
    updateOrgData(initial.organizationId,(data)=>{data.trialSurvey!.program.testDeadline=new Date(Date.now()-1000).toISOString();});
    const finished=payload<{stage:string;report:{employees:{employeeId:string}[]}}>(await call('GET','/trial'));
    expect(finished.stage).toBe('REPORTED');expect(finished.report.employees.some((entry)=>entry.employeeId===joined.employeeId)).toBe(true);
    expect(getOrgData(initial.organizationId).overallAssessments?.some((entry)=>entry.employeeId===joined.employeeId)).toBe(true);
  });

  it('rejects an invalid deadline before creating invitation records',async()=>{
    const initial=payload<{organizationId:string}>(await call('GET','/trial'));
    const count=getOrgData(initial.organizationId).trialSurvey!.program.participants.length;
    expect((await call('POST','/trial/participants',{testDeadline:'invalid',rows:[]})).status).toBe(400);
    expect(getOrgData(initial.organizationId).trialSurvey!.program.participants).toHaveLength(count);
  });
});
