import { describe, expect, it } from 'vitest';
import { employeeLearningNeeds, learningNeedsOverview } from '../learning-needs';
import { buildAcmeData } from '../seed-acme';
import { COMPETENCIES, courseFor } from '../catalog';
import { activeRequirementSet } from '../org-logic';

function fixture() {
  const data = buildAcmeData();
  const employee = data.employees.find((e) => e.id === 'emp-04')!;
  const standard = activeRequirementSet(data, employee.jobPositionId)!;
  standard.items = COMPETENCIES.filter((c) => c.categoryId === 'cat-1').map((c) => ({ id: c.id, competencyId: c.id, requiredLevel: 3, weightPercent: 100 / 3, isMandatory: true, requiresPracticalEvidence: true }));
  data.overallAssessments = [{ employeeId: employee.id, reviewedAt: '2026-11-01T00:00:00Z', publishedAt: '2026-11-02T00:00:00Z', domains: { 'cat-1': 1 } }];
  data.profiles[employee.id] = {};
  return { data, employee, standard };
}

describe('published assessment → current position standard → exact course', () => {
  it('uses one course level for the whole domain and keeps the assessment separate from later evidence', () => {
    const { data, employee, standard } = fixture();
    standard.items[0].requiredLevel = 1;
    data.overallAssessments![0].domains['cat-1'] = 2;
    const domain = employeeLearningNeeds(data, employee).domains[0];
    expect(domain.competencies).toHaveLength(3);
    expect(domain.competencies?.every((item) => item.requiredLevel === 3)).toBe(true);
    expect(domain.missingCompetencies).toHaveLength(3);
    const item = standard.items[0];
    data.profiles[employee.id][item.competencyId] = { level: 3, source: 'MANUAL', confirmedAt: '2026-11-05T00:00:00Z' };
    const improved = employeeLearningNeeds(data, employee).domains[0];
    expect(improved.assessmentLevel).toBe(2);
    expect(improved.competencies?.find((row) => row.competencyId === item.competencyId)).toMatchObject({ currentLevel: 3, requiredLevel: 3, source: 'EVIDENCE' });
    expect(improved.missingCompetencies).toHaveLength(2);
  });
  it('groups company needs by domain and target course, excluding unassessed staff from progress', () => {
    const { data, employee } = fixture();
    const missing = employeeLearningNeeds(data, employee);
    const met = { ...missing, employeeId: 'met', state: 'MET' as const, domains: missing.domains.map((d) => ({ ...d, state: 'MET' as const, currentLevel: 3, missingCompetencies: [], courseId: undefined })) };
    const waiting = { ...missing, employeeId: 'waiting', state: 'WAITING_ASSESSMENT' as const, domains: missing.domains.map((d) => ({ ...d, state: 'WAITING_ASSESSMENT' as const, currentLevel: null, missingCompetencies: [], courseId: undefined })) };
    const overview = learningNeedsOverview([missing, met, waiting]);
    expect(overview).toMatchObject({ employees: 3, assessedEmployees: 2, waitingEmployees: 1 });
    expect(overview.domains[0]).toMatchObject({ assessed: 2, met: 1, needsLearning: 1, waiting: 1 });
    expect(overview.domains[0].courses).toHaveLength(1);
    expect(overview.domains[0].courses[0]).toMatchObject({ requiredLevel: 3, employees: 1, courseId: courseFor('cat-1', 3)!.id });
  });
  it('maps the unmet domain to the required level course, not a generic foundation recommendation', () => {
    const { data, employee } = fixture();
    const result = employeeLearningNeeds(data, employee);
    expect(result.state).toBe('NEEDS_LEARNING');
    expect(result.domains[0]).toMatchObject({ currentLevel: 1, requiredLevel: 3, courseId: courseFor('cat-1', 3)!.id });
    expect(result.domains[0].missingCompetencies).toHaveLength(3);
  });
  it('uses the current standard immediately without recalculating snapshots', () => {
    const { data, employee, standard } = fixture();
    standard.items.forEach((item) => { item.requiredLevel = 2; });
    expect(employeeLearningNeeds(data, employee).domains[0].courseId).toBe(courseFor('cat-1', 2)!.id);
    standard.items.forEach((item) => { item.requiredLevel = 1; });
    expect(employeeLearningNeeds(data, employee).domains[0]).toMatchObject({ state: 'MET', missingCompetencies: [] });
    expect(employeeLearningNeeds(data, employee).domains[0].courseId).toBeUndefined();
  });
  it('does not invent a gap from absent or unpublished assessment results', () => {
    const { data, employee } = fixture();
    data.overallAssessments = [];
    expect(employeeLearningNeeds(data, employee).state).toBe('WAITING_ASSESSMENT');
    expect(employeeLearningNeeds(data, employee).domains[0].courseId).toBeUndefined();
    data.overallAssessments = [{ employeeId: employee.id, reviewedAt: '2026-11-03', publishedAt: '2026-11-02', domains: { 'cat-1': 1 } }];
    expect(employeeLearningNeeds(data, employee).state).toBe('WAITING_ASSESSMENT');
  });
  it('only resolves missing competencies when later confirmed evidence meets the standard', () => {
    const { data, employee, standard } = fixture();
    for (const item of standard.items) data.profiles[employee.id][item.competencyId] = { level: 3, source: 'MANUAL', confirmedAt: '2026-10-01T00:00:00Z' };
    expect(employeeLearningNeeds(data, employee).state).toBe('NEEDS_LEARNING');
    // Buying the target course and completing learning do not constitute confirmed competence.
    data.courseSeatOrders = { [courseFor('cat-1', 3)!.id]: 50 };
    data.assignments.forEach((assignment) => { assignment.status = 'COMPLETED'; });
    expect(employeeLearningNeeds(data, employee).state).toBe('NEEDS_LEARNING');
    for (const item of standard.items) data.profiles[employee.id][item.competencyId].confirmedAt = '2026-11-04T00:00:00Z';
    expect(employeeLearningNeeds(data, employee).state).toBe('MET');
  });
  it('distinguishes a missing standard and a partially reviewed assessment', () => {
    const { data, employee } = fixture();
    data.overallAssessments![0].domains = {};
    expect(employeeLearningNeeds(data, employee).state).toBe('WAITING_ASSESSMENT');
    employee.jobPositionId = undefined;
    expect(employeeLearningNeeds(data, employee).state).toBe('NO_STANDARD');
  });
});
