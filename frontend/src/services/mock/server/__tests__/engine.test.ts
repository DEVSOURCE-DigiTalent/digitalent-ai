import { describe, expect, it } from 'vitest';
import { COMPETENCIES, COURSES, referenceLevel, REFERENCE_POSITION_ORDER } from '../catalog';
import {
  computeSkillGapItems, recommendCourses, severityOf, summarize, type CurrentLevels, type EnrollmentsByCourse,
} from '../engine';
import { referenceRequirementLines } from '../requirements';

const allAt = (level: number): CurrentLevels => new Map(COMPETENCIES.map((c) => [c.id, level]));
const id = (frameworkCode: string) => `cmp-${frameworkCode.replace('.', '-')}`;

describe('catalog', () => {
  it('has the 24 competencies of the Circular in 6 domains', () => {
    expect(COMPETENCIES).toHaveLength(24);
    expect(new Set(COMPETENCIES.map((c) => c.categoryId)).size).toBe(6);
    expect(COMPETENCIES.every((c) => c.criteria.length === 3)).toBe(true);
  });

  it('has 18 published standard courses chained by prerequisites, plus one draft', () => {
    const published = COURSES.filter((c) => c.status === 'PUBLISHED');

    expect(published).toHaveLength(18);
    expect(COURSES.filter((c) => c.status === 'DRAFT')).toHaveLength(1);
    expect(published.filter((c) => c.level === 1).every((c) => !c.prerequisiteCourseId)).toBe(true);
    expect(published.find((c) => c.code === 'A4-I')?.prerequisiteCourseId).toBe('crs-A4-F');
    expect(published.find((c) => c.code === 'M6-A')?.prerequisiteCourseId).toBe('crs-M6-I');
  });

  it('gives the reference positions the competency counts of the spec (21, 23, 22, 20, 21)', () => {
    const counts = REFERENCE_POSITION_ORDER.map(
      (position) => COMPETENCIES.filter((c) => referenceLevel(position, c.frameworkCode) > 0).length,
    );

    expect(counts).toEqual([21, 23, 22, 20, 21]);
  });

  it('marks as mandatory the competencies at Advanced plus the core 4.1 and 4.2: 15, 7, 16, 7, 5 (spec section 4.1)', () => {
    const counts = REFERENCE_POSITION_ORDER.map((position) => referenceRequirementLines(position).filter((l) => l.isMandatory).length);

    expect(counts).toEqual([15, 7, 16, 7, 5]);
  });

  it('splits the weights of a position to exactly 100%', () => {
    for (const position of REFERENCE_POSITION_ORDER) {
      const total = referenceRequirementLines(position).reduce((sum, line) => sum + line.weightPercent, 0);
      expect(Math.round(total * 100) / 100).toBe(100);
    }
  });
});

describe('severity (D-B1)', () => {
  it.each([
    [0, true, null],
    [0, false, null],
    [1, true, 'MEDIUM'],
    [1, false, 'LOW'],
    [2, false, 'HIGH'],
    [3, true, 'HIGH'],
  ] as const)('missing %i levels, mandatory %s -> %s', (steps, mandatory, expected) => {
    expect(severityOf(steps, mandatory)).toBe(expected);
  });
});

describe('skill gap of the accountant of the spec demo script (section 8)', () => {
  const items = computeSkillGapItems(referenceRequirementLines('ACCOUNTANT'), allAt(1));
  const summary = summarize(items);

  it('has 21 competencies, 6 met and 15 gaps', () => {
    expect(summary.totalRequired).toBe(21);
    expect(summary.totalMet).toBe(6);
    expect(summary.totalGap).toBe(15);
  });

  it('has 4 HIGH (1.2, 1.3, 2.3, 4.2), 1 MEDIUM (4.1) and 10 LOW', () => {
    const codes = (severity: string) => items.filter((i) => i.severity === severity).map((i) => i.frameworkCode).sort();

    expect(codes('HIGH')).toEqual(['1.2', '1.3', '2.3', '4.2']);
    expect(codes('MEDIUM')).toEqual(['4.1']);
    expect(summary.lowCount).toBe(10);
  });

  it('covers 62.03% of the weighted requirement, as in the spec', () => {
    expect(summary.coveragePercent).toBe(62.03);
  });

  it('sorts by priority, highest first', () => {
    const scores = items.map((i) => i.priorityScore);

    expect(scores).toEqual([...scores].sort((a, b) => b - a));
    expect(items[0].severity).toBe('HIGH');
  });

  it('turns 4.2 from HIGH into MEDIUM and raises coverage once it is confirmed at Intermediate', () => {
    const confirmed = new Map(allAt(1)).set(id('4.2'), 2);
    const after = computeSkillGapItems(referenceRequirementLines('ACCOUNTANT'), confirmed);
    const line = after.find((i) => i.frameworkCode === '4.2')!;

    expect(line.severity).toBe('MEDIUM');
    expect(line.priorityScore).toBeCloseTo(8.34, 2);
    expect(summarize(after).coveragePercent).toBe(63.89);
    expect(summarize(after).highCount).toBe(3);
  });

  it('treats a competency with no confirmed level as level 0', () => {
    const none = computeSkillGapItems(referenceRequirementLines('ACCOUNTANT'), new Map());

    expect(none.every((i) => i.currentLevel === null)).toBe(true);
    expect(summarize(none).totalMet).toBe(0);
    expect(summarize(none).coveragePercent).toBe(0);
  });

  it('has no gap and full coverage when everything is at the required level', () => {
    const lines = referenceRequirementLines('ACCOUNTANT');
    const exact = new Map(lines.map((l) => [l.competencyId, l.requiredLevel]));
    const done = summarize(computeSkillGapItems(lines, exact));

    expect(done.totalGap).toBe(0);
    expect(done.coveragePercent).toBe(100);
  });
});

describe('course recommendations', () => {
  const lines = referenceRequirementLines('ACCOUNTANT');
  const items = computeSkillGapItems(lines, allAt(1));
  const none: EnrollmentsByCourse = new Map();

  it('offers the next step of each domain with a gap: an Intermediate course for someone at Basic', () => {
    const codes = recommendCourses(items, none).map((r) => r.courseCode).sort();

    // Domain 3 (3.1 met at Basic, 3.4 needs Intermediate) is included; no domain is skipped.
    expect(codes).toEqual(['A1-I', 'A2-I', 'A3-I', 'A4-I', 'A5-I', 'M6-I']);
  });

  it('never offers an Advanced course before the Intermediate one', () => {
    expect(recommendCourses(items, none).some((r) => r.courseCode.endsWith('-A'))).toBe(false);
  });

  it('ranks the domain that closes the most priority first, and scores add up to their parts', () => {
    const [first, ...rest] = recommendCourses(items, none);

    expect(first.courseCode).toBe('A1-I');
    for (const recommendation of [first, ...rest]) {
      const { gapPriorityCoverage, mandatoryCoverage, entryLevelFit } = recommendation.breakdown;
      expect(recommendation.score).toBeCloseTo(gapPriorityCoverage + mandatoryCoverage + entryLevelFit, 1);
    }
    expect(first.score).toBeGreaterThanOrEqual(rest[0].score);
  });

  it('starts at the Basic course for someone with nothing confirmed', () => {
    const fresh = computeSkillGapItems(lines, new Map());

    expect(recommendCourses(fresh, none).every((r) => r.courseCode.endsWith('-F'))).toBe(true);
  });

  it('skips a course the employee has completed and shows the progress of one in progress', () => {
    const progress: EnrollmentsByCourse = new Map([['crs-A1-I', 'COMPLETED' as const], ['crs-A4-I', 'IN_PROGRESS' as const]]);
    const result = recommendCourses(items, progress);

    expect(result.some((r) => r.courseCode === 'A1-I')).toBe(false);
    expect(result.find((r) => r.courseCode === 'A4-I')?.enrollmentStatus).toBe('IN_PROGRESS');
  });

  it('explains which competencies a course closes', () => {
    const a4 = recommendCourses(items, none).find((r) => r.courseCode === 'A4-I')!;

    expect(a4.reasons.map((r) => r.competencyName)).toEqual(expect.arrayContaining(['Bảo vệ thiết bị', 'Bảo vệ dữ liệu cá nhân và quyền riêng tư']));
    expect(a4.reasons.find((r) => r.competencyName.startsWith('Bảo vệ thiết bị'))).toMatchObject({ coverageType: 'FULL', closesSteps: 1, mandatory: true });
    expect(a4.reasons.find((r) => r.competencyName.startsWith('Bảo vệ dữ liệu'))).toMatchObject({ coverageType: 'PARTIAL', closesSteps: 1 });
  });

  it('has nothing to recommend when there is no gap, and respects the limit', () => {
    const exact = new Map(lines.map((l) => [l.competencyId, l.requiredLevel]));

    expect(recommendCourses(computeSkillGapItems(lines, exact), none)).toEqual([]);
    expect(recommendCourses(items, none, 2)).toHaveLength(2);
  });
});
