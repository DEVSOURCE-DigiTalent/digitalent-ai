import type { TrialParticipantStatus, TrialProgram, TrialParticipantRow } from '../../../trial-program.service';
import { dispatch, route } from '../router';
import { CATEGORIES, COURSES } from '../catalog';
import { badRequest, conflict, forbidden } from '../http';
import { newId } from '../../mock-store';
import type { OrgData } from '../types';
import { getCourseAssessment } from '../../../../features/learning/data/course-content';

/** Owner demo: varied, deterministic assessment progress for the five seeded departments. */
const PROGRESS: Record<string, TrialParticipantStatus> = {
  'emp-01': 'REVIEWED', 'emp-02': 'SUBMITTED', 'emp-03': 'REVIEWED',
  'emp-04': 'REVIEWED', 'emp-05': 'ACTIVE', 'emp-06': 'ACTIVE',
  'emp-07': 'INVITED', 'emp-08': 'REVIEWED', 'emp-09': 'SUBMITTED',
  'emp-10': 'SUBMITTED', 'emp-11': 'ACTIVE', 'emp-13': 'ACTIVE',
  'emp-14': 'INVITED',
  'emp-15': 'ACTIVE', 'emp-16': 'SUBMITTED', 'emp-17': 'REVIEWED',
  'emp-18': 'INVITED', 'emp-19': 'REVIEWED', 'emp-20': 'INVITED',
  'emp-21': 'ACTIVE',
};

function initialProgram(data: OrgData): TrialProgram {
  const participants = data.employees
    .filter((employee) => employee.status === 'ACTIVE')
    .map((employee) => ({
      id: `trial-${employee.id}`,
      employeeId: employee.id,
      isOwner: employee.userId === 'mock-owner',
      fullName: employee.fullName,
      email: employee.workEmail ?? '',
      departmentName: data.departments.find((department) => department.id === employee.departmentId)?.name ?? null,
      positionName: data.positions.find((position) => position.id === employee.jobPositionId)?.name ?? null,
      status: PROGRESS[employee.id] ?? 'ACTIVE',
      assessmentId: ['SUBMITTED', 'REVIEWED'].includes(PROGRESS[employee.id]) ? `assessment-${employee.id}` : null,
      submittedAt: ['SUBMITTED', 'REVIEWED'].includes(PROGRESS[employee.id]) ? new Date(Date.now() - 3 * 86400000).toISOString() : null,
      reviewedAt: PROGRESS[employee.id] === 'REVIEWED' ? new Date(Date.now() - 86400000).toISOString() : null,
      addedAt: employee.createdAt,
    }));

  return {
    organizationId: data.organizationId,
    organizationName: data.settings.name,
    stage: 'ASSIGNED',
    maxParticipants: 100,
    choiceCount: 18,
    essayCount: 0,
    requestedAt: new Date().toISOString(),
    testDeadline: new Date(Date.now() + 3 * 86400000).toISOString(),
    participants,
    departments: data.departments.filter((department) => department.status === 'ACTIVE').map((department) => department.name),
    positions: data.positions.filter((position) => position.status === 'ACTIVE').map((position) => position.name),
    report: null,
  } satisfies TrialProgram;
}

function survey(data: OrgData) {
  if (!data.trialSurvey) {
    data.trialSurvey = { program: initialProgram(data), results: {}, sessions: {} };
    for (const participant of data.trialSurvey.program.participants) {
      if (!participant.assessmentId || !participant.employeeId) continue;
      const source = data.overallAssessments?.find((assessment) => assessment.employeeId === participant.employeeId);
      if (!source) continue;
      data.trialSurvey.results[participant.employeeId] = { employeeId: participant.employeeId, fullName: participant.fullName, email: participant.email, departmentName: participant.departmentName, positionName: participant.positionName, levels: CATEGORIES.map((category) => source.domains[category.id] ?? 0), submittedAt: participant.submittedAt, reviewedAt: participant.reviewedAt };
    }
  }
  const state = data.trialSurvey;
  // Activation links create a real mock employee; reconnect that identity to the survey roster.
  for (const participant of state.program.participants) {
    const employee = data.employees.find((entry) => entry.workEmail?.toLowerCase() === participant.email.toLowerCase());
    if (employee) { participant.employeeId = employee.id; if (participant.invitationId && participant.status === 'INVITED') participant.status = 'ACTIVE'; }
  }
  const completed = state.program.participants.filter((entry) => entry.employeeId && state.results[entry.employeeId]);
  const deadlinePassed = Boolean(state.program.testDeadline && Date.parse(state.program.testDeadline) <= Date.now());
  if (state.program.requestedAt && completed.length && (completed.length === state.program.participants.length || deadlinePassed)) {
    state.program.stage = 'REPORTED';
    state.program.reportPublishedAt ??= new Date().toISOString();
    const employees = completed.map((entry) => state.results[entry.employeeId!]);
    data.overallAssessments ??= [];
    for (const employee of employees) {
      if (!employee.reviewedAt || data.overallAssessments.some((entry) => entry.employeeId === employee.employeeId && entry.reviewedAt === employee.reviewedAt)) continue;
      data.overallAssessments.push({ employeeId: employee.employeeId, reviewedAt: employee.reviewedAt, publishedAt: state.program.reportPublishedAt, domains: Object.fromEntries(CATEGORIES.map((category,index) => [category.id,employee.levels[index]])) });
    }
  }
  if (state.program.requestedAt && completed.length) {
    const employees = completed.map((entry) => state.results[entry.employeeId!]);
    state.program.report = { publishedAt: state.program.reportPublishedAt, assessed: employees.length, employees, domains: CATEGORIES.map((category) => ({categoryId:category.id,number:category.sortOrder,code:category.code,name:category.name})), summary: CATEGORIES.map((category,index) => {
      const levels = employees.map((employee) => employee.levels[index] ?? 0);
      const average = levels.reduce((sum,level) => sum + level,0) / levels.length;
      return { categoryId:category.id,number:category.sortOrder,name:category.name,average,level:Math.round(average),counts:[0,1,2,3].map((level) => levels.filter((value) => value===level).length) };
    }) };
  }
  return state;
}

const assertDeadline = (value: unknown) => {
  const time = Date.parse(String(value));
  if (!Number.isFinite(time) || time <= Date.now()+30*60000 || time > Date.now()+60*86400000) throw badRequest('Hạn làm bài cần sau ít nhất 30 phút và trong vòng 60 ngày.');
  return new Date(time).toISOString();
};

route('GET','/trial',({update}) => update((data) => survey(data).program),{roles:['OWNER']});
route('PUT','/trial/request',({body,update}) => update((data) => {
  const state=survey(data);
  if(state.program.stage==='REPORTED') throw conflict('Đợt khảo sát đã kết thúc.');
  if(!state.program.participants.length) throw badRequest('Mời ít nhất một nhân viên.');
  state.program.testDeadline=assertDeadline(body.testDeadline);
  state.program.requestedAt ??=new Date().toISOString();state.program.stage='REQUESTED';
  return {stage:state.program.stage,testDeadline:state.program.testDeadline};
}),{roles:['OWNER']});

route('POST','/trial/participants',async ({body,session,org,update}) => {
  const state=survey(org());
  if(state.program.stage==='REPORTED') throw conflict('Đợt khảo sát đã kết thúc.');
  const deadline=body.testDeadline ? assertDeadline(body.testDeadline) : state.program.testDeadline;
  const rows=(Array.isArray(body.rows)?body.rows:[]) as TrialParticipantRow[];
  const mapped=update((data) => rows.map((row) => {
    const now=new Date().toISOString();
    let department=data.departments.find((entry) => entry.name.toLowerCase()===row.department.trim().toLowerCase());
    if(!department){ department={id:newId('dept'),code:newId('PB'),name:row.department.trim(),status:'ACTIVE',createdAt:now,updatedAt:now};data.departments.push(department); }
    let position=data.positions.find((entry) => entry.name.toLowerCase()===row.position.trim().toLowerCase());
    if(!position){ position={id:newId('pos'),code:newId('VT'),name:row.position.trim(),departmentId:department.id,status:'ACTIVE',createdAt:now,updatedAt:now};data.positions.push(position); }
    return {...row,departmentId:department.id,jobPositionId:position.id,role:'EMPLOYEE'};
  }));
  const response=await dispatch({method:'POST',path:'/members/invitations',query:{},body:{rows:mapped},userId:session.id});
  const result=(response.body as {data?:{created:{token:string;email:string;fullName:string;departmentName?:string;positionName?:string}[];rejected:{email:string;reason:string}[]}}).data;
  if(!result) throw badRequest('Không thể tạo lời mời.');
  update((data) => {const program=survey(data).program;program.testDeadline=deadline;for(const entry of result.created)program.participants.push({id:entry.token,invitationId:entry.token,fullName:entry.fullName,email:entry.email,departmentName:entry.departmentName,positionName:entry.positionName,status:'INVITED',addedAt:new Date().toISOString()});});
  return {invited:result.created.map((entry) => ({...entry,debugLink:`/activate/${entry.token}`})),rejected:result.rejected};
},{roles:['OWNER']});

route('POST','/trial/me/join',({session,body,update}) => update((data) => {
  const state=survey(data);let employee=data.employees.find((entry) => entry.userId===session.id);
  if(!employee){
    if(state.program.stage==='REPORTED') throw conflict('Đợt khảo sát đã kết thúc.');
    const department=data.departments.find((entry)=>entry.name===body.department);const position=data.positions.find((entry)=>entry.name===body.position);
    if(!department||!position)throw badRequest('Chọn phòng ban và vị trí hợp lệ.');
    const now=new Date().toISOString();employee={id:newId('emp'),userId:session.id,fullName:session.fullName,workEmail:session.email,employeeCode:newId('NV'),departmentId:department.id,jobPositionId:position.id,status:'ACTIVE',createdAt:now,updatedAt:now};data.employees.push(employee);
  }
  data.memberOverrides[session.id]={...data.memberOverrides[session.id],roles:[...new Set([...session.roles,'EMPLOYEE'])]};
  if(!state.program.participants.some((entry)=>entry.employeeId===employee!.id))state.program.participants.push({id:employee.id,employeeId:employee.id,isOwner:true,fullName:employee.fullName,email:session.email,departmentName:String(body.department),positionName:String(body.position),status:'ACTIVE',addedAt:employee.createdAt});
  return {employeeId:employee.id};
}),{roles:['OWNER']});

route('GET','/me/trial-assessment',({session,update}) => update((data) => {
  const state=survey(data);const participant=state.program.participants.find((entry)=>entry.email.toLowerCase()===session.email.toLowerCase());
  if(!participant?.employeeId)throw forbidden('Bạn chưa được mời tham gia khảo sát.');
  const result=state.results[participant.employeeId];
  const closed=result?'Bạn đã hoàn thành khảo sát.':!state.program.requestedAt?'Doanh nghiệp chưa bắt đầu khảo sát.':Date.parse(state.program.testDeadline ?? '')<=Date.now()?'Đã hết hạn làm bài.':null;
  return {organizationName:data.settings.name,testDeadline:state.program.testDeadline,status:result?'REVIEWED':'NOT_STARTED',canStart:!closed,closedMessage:closed,choiceCount:18,domains:CATEGORIES.map((category)=>({categoryId:category.id,number:category.sortOrder,code:category.code,name:category.name})),essays:[],submittedAt:result?.submittedAt,reportPublished:state.program.stage==='REPORTED',levels:result?.levels,domainDetails:result?.domainDetails};
}),{roles:['OWNER','EMPLOYEE']});

route('POST','/me/trial-assessment/proctoring',({session,update}) => update((data) => {
  const state=survey(data);const participant=state.program.participants.find((entry)=>entry.email.toLowerCase()===session.email.toLowerCase());
  if(!participant?.employeeId)throw forbidden();
  if(state.results[participant.employeeId])throw conflict('Bạn đã nộp bài.');
  if(!state.program.requestedAt||Date.parse(state.program.testDeadline ?? '')<=Date.now())throw badRequest('Đợt khảo sát chưa mở hoặc đã hết hạn.');
  const questions=CATEGORIES.flatMap((category)=>[1,2,3].map((tier)=>{
    const course=COURSES.find((entry)=>entry.categoryId===category.id&&entry.level===tier&&entry.status==='PUBLISHED')!;
    const question=getCourseAssessment(course.id,course.code,course.title).questions[0];
    return {questionId:`survey-${category.sortOrder}-${tier}`,number:(tier-1)*6+category.sortOrder,tier,domainNumber:category.sortOrder,domainName:category.name,content:question.questionText,options:question.options.map((content,index)=>({optionId:`o${index}`,content})),correctOptionId:`o${question.correctOptionIndex}`};
  })).sort((a,b)=>a.number-b.number);
  const sessionId=newId('survey');const startedAt=new Date().toISOString();state.sessions[sessionId]={employeeId:participant.employeeId,startedAt,submitted:false,questions,recordings:{}};
  return {sessionId,kind:'TRIAL_ASSESSMENT',startedAt,maxChunkBytes:5*1024*1024,questions:questions.map(({correctOptionId:_,...question})=>question),essays:[]};
}),{roles:['OWNER','EMPLOYEE']});

route('POST','/me/trial-assessment',({session,body,update}) => update((data) => {
  const state=survey(data);const attempt=state.sessions[String(body.proctoringSessionId)];const participant=state.program.participants.find((entry)=>entry.email.toLowerCase()===session.email.toLowerCase());
  if(!attempt||attempt.employeeId!==participant?.employeeId)throw forbidden();
  if(attempt.submitted||state.results[attempt.employeeId])throw conflict('Bạn đã nộp bài.');
  if(state.program.testDeadline && Date.parse(state.program.testDeadline)<=Date.now())throw badRequest('Đã hết hạn nộp bài khảo sát.');
  if(!['SCREEN','CAMERA'].every((track)=>Object.values(attempt.recordings).some((recording)=>recording.track.toUpperCase()===track && recording.chunks>0 && recording.ended)))throw badRequest('Hoàn tất bản ghi màn hình và camera trước khi nộp bài.');
  const answers=Array.isArray(body.answers)?body.answers as {questionId:string;optionId:string}[]:[];
  const answerMap=new Map(answers.map((entry)=>[entry.questionId,entry.optionId]));
  if(answerMap.size!==attempt.questions.length||attempt.questions.some((question)=>!question.options.some((option)=>option.optionId===answerMap.get(question.questionId))))throw badRequest('Trả lời đầy đủ các câu trắc nghiệm.');
  const now=new Date().toISOString();const levels=CATEGORIES.map((category)=>{let level=0;for(const tier of [1,2,3]){const question=attempt.questions.find((entry)=>entry.domainNumber===category.sortOrder&&entry.tier===tier)!;if(answerMap.get(question.questionId)!==question.correctOptionId)break;level++;}return level;});
  const score=attempt.questions.filter((question)=>answerMap.get(question.questionId)===question.correctOptionId).length;
  state.results[attempt.employeeId]={employeeId:attempt.employeeId,fullName:participant!.fullName,email:participant!.email,departmentName:participant!.departmentName,positionName:participant!.positionName,levels,choiceScore:score,choiceTotal:attempt.questions.length,submittedAt:now,reviewedAt:now};
  attempt.submitted=true;participant!.status='REVIEWED';participant!.submittedAt=now;participant!.reviewedAt=now;
  survey(data);return {assessmentId:newId('assessment'),submittedAt:now,durationMs:Date.now()-Date.parse(attempt.startedAt)};
}),{roles:['OWNER','EMPLOYEE']});

// The mock keeps only recording receipts, never camera/screen bytes.
route('POST','/me/pulse/proctoring/:sessionId/recordings',({params,body,session,update}) => update((data) => {
  const attempt=survey(data).sessions[params.sessionId];
  if(!attempt||data.employees.find((entry)=>entry.userId===session.id)?.id!==attempt.employeeId)throw forbidden();
  const recordingId=newId('recording');attempt.recordings[recordingId]={track:String(body.track),chunks:0,ended:false};
  return {recordingId,track:body.track,segmentNo:body.segmentNo ?? 1};
}),{roles:['OWNER','EMPLOYEE']});
route('PUT','/me/pulse/proctoring/:sessionId/recordings/:recordingId/chunks/:seq',({params,session,update})=>update((data)=>{
  const attempt=survey(data).sessions[params.sessionId];
  if(!attempt||data.employees.find((entry)=>entry.userId===session.id)?.id!==attempt.employeeId)throw forbidden();
  const recording=attempt.recordings[params.recordingId];if(!recording||recording.ended)throw badRequest('Bản ghi không còn mở.');
  recording.chunks=Math.max(recording.chunks,Number(params.seq)+1);return {received:true};
}),{roles:['OWNER','EMPLOYEE']});
route('POST','/me/pulse/proctoring/:sessionId/recordings/:recordingId/end',({params,session,update})=>update((data)=>{
  const attempt=survey(data).sessions[params.sessionId];
  if(!attempt||data.employees.find((entry)=>entry.userId===session.id)?.id!==attempt.employeeId)throw forbidden();
  const recording=attempt.recordings[params.recordingId];if(!recording)throw badRequest('Không có bản ghi.');recording.ended=true;return {complete:true};
}),{roles:['OWNER','EMPLOYEE']});
route('POST','/me/pulse/proctoring/:sessionId/events',({params,body,session,org})=>{
  const data=org();const attempt=survey(data).sessions[params.sessionId];
  if(!attempt||data.employees.find((entry)=>entry.userId===session.id)?.id!==attempt.employeeId)throw forbidden();
  return {recorded:Array.isArray(body.events)?body.events.length:0,total:Array.isArray(body.events)?body.events.length:0};
},{roles:['OWNER','EMPLOYEE']});
