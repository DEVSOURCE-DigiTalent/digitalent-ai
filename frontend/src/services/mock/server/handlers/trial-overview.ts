import type {
  TrialEmployeeDomainDetail,
  TrialExamQuestion,
  TrialInsightItem,
  TrialParticipantRow,
  TrialParticipantStatus,
  TrialPlanOption,
  TrialProgram,
  TrialReport,
  TrialRoadmap,
} from '../../../trial-program.service';
import { dispatch, route } from '../router';
import { CATEGORIES, COURSES } from '../catalog';
import { badRequest, conflict, forbidden } from '../http';
import { newId } from '../../mock-store';
import type { MockTrialResult, OrgData } from '../types';
import { getCourseAssessment } from '../../../../features/learning/data/course-content';

/**
 * Dùng thử doanh nghiệp trên mock (khớp UseCases/TrialProgram): SETUP → OPEN (đã đặt hạn) → REPORTED (bài đóng). Trắc
 * nghiệm 6 lĩnh vực × 3 cấp, máy chấm khi nộp; bài đóng khi hết hạn / mọi người đã nộp (≥ 1 bài) / chủ doanh nghiệp bấm
 * "Xem kết quả ngay". Báo cáo luôn tính lại; gợi ý ✦ là câu mẫu (mock không gọi AI) → insights FALLBACK.
 */

/** Owner demo: tiến độ khác nhau, cố định cho 5 phòng ban mẫu. */
const PROGRESS: Record<string, TrialParticipantStatus> = {
  'emp-01': 'SUBMITTED', 'emp-02': 'SUBMITTED', 'emp-03': 'SUBMITTED',
  'emp-04': 'SUBMITTED', 'emp-05': 'ACTIVE', 'emp-06': 'ACTIVE',
  'emp-07': 'INVITED', 'emp-08': 'SUBMITTED', 'emp-09': 'SUBMITTED',
  'emp-10': 'SUBMITTED', 'emp-11': 'ACTIVE', 'emp-13': 'ACTIVE',
  'emp-14': 'INVITED',
  'emp-15': 'ACTIVE', 'emp-16': 'SUBMITTED', 'emp-17': 'SUBMITTED',
  'emp-18': 'INVITED', 'emp-19': 'SUBMITTED', 'emp-20': 'INVITED',
  'emp-21': 'ACTIVE',
};

const LEVELS = ['chưa đạt', 'Cơ bản', 'Trung cấp', 'Nâng cao'];
const TIER_NAMES = ['', 'Cơ bản', 'Trung cấp', 'Nâng cao'];
const TIER_SUFFIX = ['', 'F', 'I', 'A'];
const PRICES = [0, 0, 399_000, 699_000];
const MAX_LEVEL = 3;
const SAVING_RAISED_DOMAINS = 2;
const DAY = 86_400_000;

type PaperQuestion = TrialExamQuestion & { correctOptionId: string };

/** Đề cố định: câu đầu của bài kiểm tra mỗi khóa (lĩnh vực × cấp), sắp theo cấp. */
function paperQuestions(): PaperQuestion[] {
  return CATEGORIES.flatMap((category) => [1, 2, 3].map((tier) => {
    const course = COURSES.find((entry) => entry.categoryId === category.id && entry.level === tier && entry.status === 'PUBLISHED')!;
    const question = getCourseAssessment(course.id, course.code, course.title).questions[0];
    return {
      questionId: `survey-${category.sortOrder}-${tier}`,
      number: (tier - 1) * CATEGORIES.length + category.sortOrder,
      tier,
      domainNumber: category.sortOrder,
      domainName: category.name,
      content: question.questionText,
      options: question.options.map((content, index) => ({ optionId: `o${index}`, content })),
      correctOptionId: `o${question.correctOptionIndex}`,
    };
  })).sort((a, b) => a.number - b.number);
}

/** Mức một lĩnh vực: cấp cao nhất mà mọi cấp từ Cơ bản tới đó đều đạt ≥ 70% số câu của cấp. */
function levelOf(cells: [number, number][]) {
  let level = 0;
  for (const [correct, total] of cells) {
    if (total === 0 || correct * 10 < total * 7) break;
    level++;
  }
  return level;
}

function gradeResult(
  base: Omit<MockTrialResult, 'levels' | 'choiceScore' | 'choiceTotal' | 'cells' | 'questions'>,
  questions: PaperQuestion[],
  isCorrect: (question: PaperQuestion) => boolean,
): MockTrialResult {
  const answered = questions.map((question) => ({ domainNumber: question.domainNumber, tier: question.tier, content: question.content, correct: isCorrect(question) }));
  const cells = CATEGORIES.map((category) => [1, 2, 3].map((tier) => {
    const inCell = answered.filter((entry) => entry.domainNumber === category.sortOrder && entry.tier === tier);
    return [inCell.filter((entry) => entry.correct).length, inCell.length] as [number, number];
  }));
  return {
    ...base,
    levels: cells.map(levelOf),
    choiceScore: answered.filter((entry) => entry.correct).length,
    choiceTotal: answered.length,
    cells,
    questions: answered,
  };
}

function departmentIdOf(data: OrgData, name?: string | null) {
  return data.departments.find((department) => department.name === name)?.id ?? name ?? 'none';
}

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
      assessmentId: null as string | null,
      submittedAt: null as string | null,
      addedAt: employee.createdAt,
    }));

  return {
    organizationId: data.organizationId,
    organizationName: data.settings.name,
    stage: 'OPEN',
    maxParticipants: 30,
    choiceCount: CATEGORIES.length * 3,
    testDeadline: new Date(Date.now() + 3 * DAY).toISOString(),
    participants,
    departments: data.departments.filter((department) => department.status === 'ACTIVE').map((department) => department.name),
    positions: data.positions.filter((position) => position.status === 'ACTIVE').map((position) => position.name),
    report: null,
  } satisfies TrialProgram;
}

/** Trạng thái dùng thử của tổ chức (tạo lần đầu từ dữ liệu demo); đóng bài nếu đã tới lúc. */
function survey(data: OrgData) {
  if (!data.trialSurvey) {
    const program = initialProgram(data);
    data.trialSurvey = { program, results: {}, sessions: {} };
    const questions = paperQuestions();
    const submittedAt = new Date(Date.now() - 3 * DAY).toISOString();
    for (const participant of program.participants) {
      if (participant.status !== 'SUBMITTED' || !participant.employeeId) continue;
      const source = data.overallAssessments?.find((assessment) => assessment.employeeId === participant.employeeId);
      if (!source) { participant.status = 'ACTIVE'; continue; }
      const assessmentId = `assessment-${participant.employeeId}`;
      participant.assessmentId = assessmentId;
      participant.submittedAt = submittedAt;
      const levelFor = (question: PaperQuestion) => source.domains[CATEGORIES.find((c) => c.sortOrder === question.domainNumber)!.id] ?? 0;
      data.trialSurvey.results[participant.employeeId] = gradeResult({
        employeeId: participant.employeeId,
        assessmentId,
        fullName: participant.fullName,
        email: participant.email,
        departmentId: departmentIdOf(data, participant.departmentName),
        departmentName: participant.departmentName,
        positionName: participant.positionName,
        submittedAt,
        riskLevel: 'LOW',
      }, questions, (question) => question.tier <= levelFor(question));
    }
  }
  const state = data.trialSurvey;
  // Lời mời đã kích hoạt tạo nhân viên thật trên mock: nối lại vào danh sách dùng thử.
  for (const participant of state.program.participants) {
    const employee = data.employees.find((entry) => entry.workEmail?.toLowerCase() === participant.email.toLowerCase());
    if (employee) {
      participant.employeeId = employee.id;
      if (participant.invitationId && participant.status === 'INVITED') participant.status = 'ACTIVE';
    }
  }
  closeIfDue(data);
  return state;
}

const resultsOf = (data: OrgData) => Object.values(data.trialSurvey!.results);

/** Bài đóng lúc đọc khi đã hết hạn hoặc mọi người đã nộp (cần ≥ 1 bài). */
function closeIfDue(data: OrgData) {
  const program = data.trialSurvey!.program;
  if (program.reportPublishedAt || !program.testDeadline || resultsOf(data).length === 0) return;
  const deadlinePassed = Date.parse(program.testDeadline) <= Date.now();
  const everyoneSubmitted = program.participants.every((participant) => participant.status === 'SUBMITTED');
  if (deadlinePassed || everyoneSubmitted) publish(data);
}

function publish(data: OrgData) {
  const program = data.trialSurvey!.program;
  program.reportPublishedAt = new Date().toISOString();
  // Kết quả đã chốt trở thành đánh giá tổng hợp (nhu cầu học, heatmap).
  data.overallAssessments ??= [];
  for (const result of resultsOf(data)) {
    if (data.overallAssessments.some((entry) => entry.employeeId === result.employeeId && entry.reviewedAt === result.submittedAt)) continue;
    data.overallAssessments.push({
      employeeId: result.employeeId,
      reviewedAt: result.submittedAt,
      publishedAt: program.reportPublishedAt,
      domains: Object.fromEntries(CATEGORIES.map((category, index) => [category.id, result.levels[index] ?? 0])),
    });
  }
}

const stageOf = (program: TrialProgram) => (program.reportPublishedAt ? 'REPORTED' : program.testDeadline ? 'OPEN' : 'SETUP');

const lowerMedian = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted.length === 0 ? 0 : sorted[Math.floor((sorted.length - 1) / 2)];
};
const round1 = (value: number) => Math.round(value * 10) / 10;

/** TrialCeilingPlanner: > 50% dưới Cơ bản hoặc trung vị 0 → Cơ bản; trung vị Nâng cao → Nâng cao; còn lại trung vị + 1. */
function domainPlan(levels: number[]) {
  const belowBasic = levels.filter((level) => level === 0).length;
  const median = lowerMedian(levels);
  const [suggested, reason] =
    levels.length === 0 || belowBasic * 2 > levels.length ? [1, 'BELOW_BASIC']
    : median === 0 ? [1, 'MEDIAN_ZERO']
    : median >= MAX_LEVEL ? [MAX_LEVEL, 'AT_MAX']
    : [median + 1, 'RAISE'];
  const average = levels.length ? round1(levels.reduce((sum, level) => sum + level, 0) / levels.length) : 0;
  return { people: levels.length, belowBasic, median, average, suggested: suggested as number, reason: reason as string, belowSuggested: levels.filter((level) => level < (suggested as number)).length };
}

function plan(results: MockTrialResult[]) {
  const domains = CATEGORIES.map((_, index) => domainPlan(results.map((result) => result.levels[index] ?? 0)));
  const organization = domains.map((domain) => domain.suggested);
  const byDepartment = new Map<string, MockTrialResult[]>();
  for (const result of results) byDepartment.set(result.departmentId, [...(byDepartment.get(result.departmentId) ?? []), result]);
  const departments = [...byDepartment.entries()]
    .map(([departmentId, people]) => ({
      departmentId,
      levels: CATEGORIES.map((_, index) => {
        const own = domainPlan(people.map((person) => person.levels[index] ?? 0)).suggested;
        return own < organization[index] ? own : null;
      }),
    }))
    .filter((department) => department.levels.some((level) => level !== null))
    .sort((a, b) => a.departmentId.localeCompare(b.departmentId));
  const saving = new Set(domains
    .map((domain, index) => ({ ...domain, index }))
    .filter((domain) => domain.suggested >= 2)
    .sort((a, b) => a.average - b.average || a.index - b.index)
    .slice(0, SAVING_RAISED_DOMAINS)
    .map((domain) => domain.index));
  const options: TrialPlanOption[] = [
    { kind: 'SAVING', organization: domains.map((_, index) => (saving.has(index) ? 2 : 1)), departments: [] },
    { kind: 'BALANCED', organization, departments },
    { kind: 'FULL', organization: domains.map(() => MAX_LEVEL), departments: [] },
  ];
  return { domains, options };
}

/** Câu mẫu của TrialInsightTemplate (mock không có AI). */
function templateInsights(domains: ReturnType<typeof domainPlan>[]) {
  const item = (index: number, text: string): TrialInsightItem => ({ domainNumber: CATEGORIES[index].sortOrder, text, source: 'TEMPLATE' });
  const priorities = domains
    .map((domain, index) => ({ ...domain, index }))
    .filter((domain) => domain.belowSuggested > 0)
    .sort((a, b) => b.belowBasic - a.belowBasic || b.belowSuggested - a.belowSuggested || a.average - b.average || a.index - b.index)
    .slice(0, 3)
    .map((domain) => item(domain.index, domain.belowBasic > 0
      ? `${domain.belowBasic}/${domain.people} chưa đạt Cơ bản`
      : `${domain.belowSuggested}/${domain.people} chưa tới ${LEVELS[domain.suggested]}`));
  const ceilingReasons = domains.map((domain, index) => item(index, domain.people === 0 ? 'Chưa có bài làm → giữ Cơ bản'
    : domain.reason === 'BELOW_BASIC' ? `${domain.belowBasic}/${domain.people} chưa đạt Cơ bản → giữ Cơ bản`
    : domain.reason === 'MEDIAN_ZERO' ? 'Trung vị chưa đạt → giữ Cơ bản'
    : domain.reason === 'AT_MAX' ? 'Trung vị Nâng cao → giữ Nâng cao'
    : `Trung vị ${LEVELS[domain.median]} → mở ${LEVELS[domain.suggested]}`));
  return { priorities, ceilingReasons };
}

const trialDomains = () => CATEGORIES.map((category) => ({ categoryId: category.id, number: category.sortOrder, code: category.code, name: category.name }));

/** Báo cáo (TrialReportBuilder): luôn tính lại từ bài đã nộp. */
function buildReport(data: OrgData): TrialReport {
  const program = data.trialSurvey!.program;
  const results = resultsOf(data).sort((a, b) => a.fullName.localeCompare(b.fullName, 'vi'));
  const { domains } = plan(results);
  const insights = templateInsights(domains);
  const departments = [...new Set(results.map((result) => result.departmentId))].map((departmentId) => {
    const people = results.filter((result) => result.departmentId === departmentId);
    return {
      departmentId,
      name: people[0].departmentName ?? 'Chưa có phòng ban',
      people: people.length,
      averages: CATEGORIES.map((_, index) => round1(people.reduce((sum, person) => sum + (person.levels[index] ?? 0), 0) / people.length)),
    };
  });
  return {
    publishedAt: program.reportPublishedAt,
    assessed: results.length,
    highRisk: results.filter((result) => result.riskLevel === 'HIGH').length,
    domains: trialDomains(),
    summary: CATEGORIES.map((category, index) => {
      const levels = results.map((result) => result.levels[index] ?? 0);
      const correctRates = [0, 1, 2].map((tier) => {
        const [correct, total] = results.reduce(([c, t], result) => [c + result.cells[index][tier][0], t + result.cells[index][tier][1]], [0, 0]);
        return total ? Math.round((correct * 100) / total) : null;
      });
      // Câu sai nhiều nhất, chỉ trong các cấp thuộc mức tối đa đề xuất.
      const byQuestion = new Map<string, { content: string; tier: number; wrong: number; answered: number }>();
      for (const answer of results.flatMap((result) => result.questions)) {
        if (answer.domainNumber !== category.sortOrder || answer.tier > domains[index].suggested) continue;
        const entry = byQuestion.get(answer.content) ?? { content: answer.content, tier: answer.tier, wrong: 0, answered: 0 };
        entry.answered++;
        if (!answer.correct) entry.wrong++;
        byQuestion.set(answer.content, entry);
      }
      const mostMissed = [...byQuestion.values()].filter((entry) => entry.wrong > 0).sort((a, b) => b.wrong - a.wrong || a.tier - b.tier)[0] ?? null;
      return {
        categoryId: category.id,
        number: category.sortOrder,
        name: category.name,
        counts: [0, 1, 2, 3].map((level) => levels.filter((value) => value === level).length),
        average: domains[index].average,
        correctRates,
        mostMissed,
      };
    }),
    departments,
    employees: results.map(({ cells: _cells, questions: _questions, ...employee }) => employee),
    insights: { status: 'FALLBACK', ...insights, completedAt: program.reportPublishedAt },
  };
}

function view(data: OrgData): TrialProgram {
  const program = survey(data).program;
  program.stage = stageOf(program);
  program.report = program.stage === 'REPORTED' ? buildReport(data) : null;
  return program;
}

function domainDetails(result: MockTrialResult): TrialEmployeeDomainDetail[] {
  return CATEGORIES.map((category, index) => {
    const level = result.levels[index] ?? 0;
    const [[bc, bt], [ic, it], [ac, at]] = result.cells[index];
    const next = Math.min(level + 1, MAX_LEVEL);
    return {
      categoryId: category.id,
      number: category.sortOrder,
      name: category.name,
      level,
      levelLabel: level === 0 ? 'Chưa đạt' : TIER_NAMES[level],
      statusText: level === 0 ? 'Chưa đạt mức Cơ bản' : level === MAX_LEVEL ? 'Đạt mức Nâng cao' : `Đạt ${TIER_NAMES[level]} · Chưa đạt ${TIER_NAMES[next]}`,
      gapText: level === MAX_LEVEL ? 'Đạt cả ba cấp.' : `Chưa đạt ${TIER_NAMES[next]} (cần ≥ 70% số câu của cấp). Bước tiếp theo: khóa ${TIER_NAMES[next]}.`,
      basicCorrect: bc, basicTotal: bt,
      intermediateCorrect: ic, intermediateTotal: it,
      advancedCorrect: ac, advancedTotal: at,
      suggestedLevel: level,
      mentorLevel: null,
      recommendedCourse: level === MAX_LEVEL ? '' : `M${category.sortOrder}-${TIER_SUFFIX[next]}: Khóa ${TIER_NAMES[next]} về ${category.name}`,
    };
  });
}

/** TrialProgramReader.ClosedReason: null = được làm / được nộp lúc `at`. */
function closedReason(data: OrgData, employeeId: string, at: number) {
  const program = data.trialSurvey!.program;
  if (data.trialSurvey!.results[employeeId]) return 'Bạn đã nộp bài đánh giá.';
  if (!program.testDeadline) return 'Doanh nghiệp chưa bắt đầu đợt khảo sát.';
  if (program.reportPublishedAt && at >= Date.parse(program.reportPublishedAt)) return 'Bài đánh giá đã đóng.';
  if (at >= Date.parse(program.testDeadline)) return 'Đã quá hạn làm bài.';
  return null;
}

const assertDeadline = (value: unknown) => {
  const time = Date.parse(String(value));
  if (!Number.isFinite(time) || time <= Date.now() + 30 * 60_000 || time > Date.now() + 60 * DAY) throw badRequest('Hạn làm bài cần sau ít nhất 30 phút và trong vòng 60 ngày.', 'TRIAL_DEADLINE_INVALID', 'testDeadline');
  return new Date(time).toISOString();
};

const participantOf = (data: OrgData, email: string) =>
  survey(data).program.participants.find((entry) => entry.email.toLowerCase() === email.toLowerCase());

route('GET', '/trial', ({ update }) => update((data) => view(data)), { roles: ['OWNER'] });

route('PUT', '/trial/request', ({ body, update }) => update((data) => {
  const program = survey(data).program;
  if (program.reportPublishedAt) throw conflict('Bài đánh giá đã đóng.');
  if (!program.participants.length) throw badRequest('Mời ít nhất một nhân viên.');
  program.testDeadline = assertDeadline(body.testDeadline);
  program.stage = stageOf(program);
  return { stage: program.stage, testDeadline: program.testDeadline };
}), { roles: ['OWNER'] });

route('POST', '/trial/close', ({ update }) => update((data) => {
  const program = survey(data).program;
  if (program.reportPublishedAt) throw conflict('Bài đánh giá đã đóng.');
  const assessed = resultsOf(data).length;
  if (assessed === 0) throw badRequest('Chưa có bài nào được nộp.');
  publish(data);
  return { closedAt: program.reportPublishedAt!, assessed };
}), { roles: ['OWNER'] });

route('GET', '/trial/roadmap', ({ update }) => update((data): TrialRoadmap => {
  const program = view(data);
  const results = resultsOf(data);
  if (program.stage !== 'REPORTED' || results.length === 0) {
    return { available: false, domains: trialDomains(), departments: [], people: [], options: [], suggested: 'BALANCED', reasons: [], insightStatus: '', prices: PRICES };
  }
  const { domains, options } = plan(results);
  const departments = [...new Set(results.map((result) => result.departmentId))].map((id) => ({
    id,
    name: results.find((result) => result.departmentId === id)!.departmentName ?? 'Chưa có phòng ban',
    people: results.filter((result) => result.departmentId === id).length,
  }));
  return {
    available: true,
    domains: trialDomains(),
    departments,
    people: results.map((result) => ({ departmentId: result.departmentId, levels: result.levels })),
    options,
    suggested: 'BALANCED',
    reasons: templateInsights(domains).ceilingReasons,
    insightStatus: 'FALLBACK',
    prices: PRICES,
  };
}), { roles: ['OWNER'] });

route('POST', '/trial/participants', async ({ body, session, org, update }) => {
  const state = survey(org());
  if (state.program.reportPublishedAt) throw badRequest('Kết quả dùng thử đã được công bố, không mời thêm nhân viên.', 'TRIAL_REPORTED', 'rows');
  const deadline = body.testDeadline ? assertDeadline(body.testDeadline) : state.program.testDeadline;
  const rows = (Array.isArray(body.rows) ? body.rows : []) as TrialParticipantRow[];
  const mapped = update((data) => rows.map((row) => {
    const now = new Date().toISOString();
    let department = data.departments.find((entry) => entry.name.toLowerCase() === row.department.trim().toLowerCase());
    if (!department) { department = { id: newId('dept'), code: newId('PB'), name: row.department.trim(), status: 'ACTIVE', createdAt: now, updatedAt: now }; data.departments.push(department); }
    let position = data.positions.find((entry) => entry.name.toLowerCase() === row.position.trim().toLowerCase());
    if (!position) { position = { id: newId('pos'), code: newId('VT'), name: row.position.trim(), departmentId: department.id, status: 'ACTIVE', createdAt: now, updatedAt: now }; data.positions.push(position); }
    return { ...row, departmentId: department.id, jobPositionId: position.id, role: 'EMPLOYEE' };
  }));
  const response = await dispatch({ method: 'POST', path: '/members/invitations', query: {}, body: { rows: mapped }, userId: session.id });
  const result = (response.body as { data?: { created: { token: string; email: string; fullName: string; departmentName?: string; positionName?: string }[]; rejected: { email: string; reason: string }[] } }).data;
  if (!result) throw badRequest('Không thể tạo lời mời.');
  update((data) => {
    const program = survey(data).program;
    program.testDeadline = deadline;
    for (const entry of result.created) {
      program.participants.push({ id: entry.token, invitationId: entry.token, fullName: entry.fullName, email: entry.email, departmentName: entry.departmentName, positionName: entry.positionName, status: 'INVITED', addedAt: new Date().toISOString() });
    }
  });
  return { invited: result.created.map((entry) => ({ ...entry, debugLink: `/activate/${entry.token}` })), rejected: result.rejected };
}, { roles: ['OWNER'] });

route('POST', '/trial/me/join', ({ session, body, update }) => update((data) => {
  const state = survey(data);
  let employee = data.employees.find((entry) => entry.userId === session.id);
  if (!employee) {
    if (state.program.reportPublishedAt) throw badRequest('Đợt khảo sát đã kết thúc, không thể đăng ký thêm người làm bài.', 'TRIAL_CLOSED', 'department');
    const department = data.departments.find((entry) => entry.name === body.department);
    const position = data.positions.find((entry) => entry.name === body.position);
    if (!department || !position) throw badRequest('Chọn phòng ban và vị trí hợp lệ.');
    const now = new Date().toISOString();
    employee = { id: newId('emp'), userId: session.id, fullName: session.fullName, workEmail: session.email, employeeCode: newId('NV'), departmentId: department.id, jobPositionId: position.id, status: 'ACTIVE', createdAt: now, updatedAt: now };
    data.employees.push(employee);
  }
  data.memberOverrides[session.id] = { ...data.memberOverrides[session.id], roles: [...new Set([...session.roles, 'EMPLOYEE'])] };
  if (!state.program.participants.some((entry) => entry.employeeId === employee!.id)) {
    state.program.participants.push({ id: employee.id, employeeId: employee.id, isOwner: true, fullName: employee.fullName, email: session.email, departmentName: String(body.department), positionName: String(body.position), status: 'ACTIVE', addedAt: employee.createdAt });
  }
  return { employeeId: employee.id };
}), { roles: ['OWNER'] });

route('GET', '/me/trial-assessment', ({ session, update }) => update((data) => {
  const participant = participantOf(data, session.email);
  if (!participant?.employeeId) throw forbidden('Bạn chưa được mời tham gia khảo sát.');
  const program = data.trialSurvey!.program;
  const result = data.trialSurvey!.results[participant.employeeId];
  const closed = closedReason(data, participant.employeeId, Date.now());
  const reported = Boolean(program.reportPublishedAt);
  return {
    organizationName: data.settings.name,
    testDeadline: program.testDeadline,
    status: !result ? 'NOT_STARTED' : reported ? 'REPORTED' : 'SUBMITTED',
    canStart: !closed,
    closedMessage: closed,
    choiceCount: CATEGORIES.length * 3,
    domains: trialDomains(),
    submittedAt: result?.submittedAt,
    reportPublished: reported,
    levels: result && reported ? result.levels : null,
    domainDetails: result && reported ? domainDetails(result) : null,
  };
}), { roles: ['OWNER', 'EMPLOYEE'] });

route('POST', '/me/trial-assessment/proctoring', ({ session, update }) => update((data) => {
  const participant = participantOf(data, session.email);
  if (!participant?.employeeId) throw forbidden();
  const closed = closedReason(data, participant.employeeId, Date.now());
  if (closed) throw badRequest(closed, 'TRIAL_NOT_OPEN', 'session');
  const questions = paperQuestions();
  const sessionId = newId('survey');
  const startedAt = new Date().toISOString();
  data.trialSurvey!.sessions[sessionId] = { employeeId: participant.employeeId, startedAt, submitted: false, questions, recordings: {} };
  return { sessionId, kind: 'TRIAL_ASSESSMENT', startedAt, maxChunkBytes: 5 * 1024 * 1024, questions: questions.map(({ correctOptionId: _, ...question }) => question) };
}), { roles: ['OWNER', 'EMPLOYEE'] });

route('POST', '/me/trial-assessment', ({ session, body, update }) => update((data) => {
  const state = survey(data);
  const attempt = state.sessions[String(body.proctoringSessionId)];
  const participant = participantOf(data, session.email);
  if (!attempt || !participant || attempt.employeeId !== participant.employeeId) throw forbidden();
  if (attempt.submitted || state.results[attempt.employeeId]) throw conflict('Bạn đã nộp bài.');
  // Phiên mở trước khi bài đóng vẫn nộp được.
  const closed = closedReason(data, attempt.employeeId, Date.parse(attempt.startedAt));
  if (closed) throw badRequest(closed, 'TRIAL_NOT_OPEN', 'proctoringSessionId');
  if (!['SCREEN', 'CAMERA'].every((track) => Object.values(attempt.recordings).some((recording) => recording.track.toUpperCase() === track && recording.chunks > 0 && recording.ended))) {
    throw badRequest('Hoàn tất bản ghi màn hình và camera trước khi nộp bài.');
  }
  const answers = Array.isArray(body.answers) ? (body.answers as { questionId: string; optionId: string }[]) : [];
  const answerMap = new Map(answers.map((entry) => [entry.questionId, entry.optionId]));
  if (answerMap.size !== attempt.questions.length || attempt.questions.some((question) => !question.options.some((option) => option.optionId === answerMap.get(question.questionId)))) {
    throw badRequest('Trả lời đầy đủ các câu trắc nghiệm.');
  }
  const now = new Date().toISOString();
  const assessmentId = newId('assessment');
  state.results[attempt.employeeId] = gradeResult({
    employeeId: attempt.employeeId,
    assessmentId,
    fullName: participant.fullName,
    email: participant.email,
    departmentId: departmentIdOf(data, participant.departmentName),
    departmentName: participant.departmentName,
    positionName: participant.positionName,
    submittedAt: now,
    riskLevel: 'LOW',
  }, attempt.questions, (question) => answerMap.get(question.questionId) === question.correctOptionId);
  attempt.submitted = true;
  participant.status = 'SUBMITTED';
  participant.assessmentId = assessmentId;
  participant.submittedAt = now;
  closeIfDue(data);
  return { assessmentId, submittedAt: now, durationMs: Date.now() - Date.parse(attempt.startedAt) };
}), { roles: ['OWNER', 'EMPLOYEE'] });

// Mock chỉ giữ biên nhận bản ghi, không giữ dữ liệu camera / màn hình.
route('POST', '/me/pulse/proctoring/:sessionId/recordings', ({ params, body, session, update }) => update((data) => {
  const attempt = survey(data).sessions[params.sessionId];
  if (!attempt || data.employees.find((entry) => entry.userId === session.id)?.id !== attempt.employeeId) throw forbidden();
  const recordingId = newId('recording');
  attempt.recordings[recordingId] = { track: String(body.track), chunks: 0, ended: false };
  return { recordingId, track: body.track, segmentNo: body.segmentNo ?? 1 };
}), { roles: ['OWNER', 'EMPLOYEE'] });
route('PUT', '/me/pulse/proctoring/:sessionId/recordings/:recordingId/chunks/:seq', ({ params, session, update }) => update((data) => {
  const attempt = survey(data).sessions[params.sessionId];
  if (!attempt || data.employees.find((entry) => entry.userId === session.id)?.id !== attempt.employeeId) throw forbidden();
  const recording = attempt.recordings[params.recordingId];
  if (!recording || recording.ended) throw badRequest('Bản ghi không còn mở.');
  recording.chunks = Math.max(recording.chunks, Number(params.seq) + 1);
  return { received: true };
}), { roles: ['OWNER', 'EMPLOYEE'] });
route('POST', '/me/pulse/proctoring/:sessionId/recordings/:recordingId/end', ({ params, session, update }) => update((data) => {
  const attempt = survey(data).sessions[params.sessionId];
  if (!attempt || data.employees.find((entry) => entry.userId === session.id)?.id !== attempt.employeeId) throw forbidden();
  const recording = attempt.recordings[params.recordingId];
  if (!recording) throw badRequest('Không có bản ghi.');
  recording.ended = true;
  return { complete: true };
}), { roles: ['OWNER', 'EMPLOYEE'] });
route('POST', '/me/pulse/proctoring/:sessionId/events', ({ params, body, session, org }) => {
  const data = org();
  const attempt = survey(data).sessions[params.sessionId];
  if (!attempt || data.employees.find((entry) => entry.userId === session.id)?.id !== attempt.employeeId) throw forbidden();
  return { recorded: Array.isArray(body.events) ? body.events.length : 0, total: Array.isArray(body.events) ? body.events.length : 0 };
}, { roles: ['OWNER', 'EMPLOYEE'] });
