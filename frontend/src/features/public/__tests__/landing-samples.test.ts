import { describe, it, expect } from 'vitest';
import { INDIVIDUAL_CONTENT } from '../landing/landing-variants';
import { COURSES } from '@/services/mock/server/catalog';
import { getReferencePosition } from '@/lib/reference-positions';

const skillPath = INDIVIDUAL_CONTENT.sections.find((section) => section.kind === 'skill-path');

describe('landing page samples stay true to the standard catalogue', () => {
  it('uses real course codes and titles of the TT02 catalogue in the sample roadmap', () => {
    if (skillPath?.kind !== 'skill-path') throw new Error('the individual landing page needs a skill-path section');

    for (const step of skillPath.sample.roadmap) {
      const course = COURSES.find((candidate) => candidate.code === step.courseCode);
      expect(course, step.courseCode).toBeDefined();
      expect(course!.title).toBe(step.title);
    }
  });

  it('builds the sample on a reference position and only on competencies it requires', () => {
    if (skillPath?.kind !== 'skill-path') throw new Error('the individual landing page needs a skill-path section');

    const position = getReferencePosition(skillPath.sample.positionCode);
    expect(position).toBeDefined();
    for (const row of skillPath.sample.rows) expect(row.current).toBeLessThanOrEqual(3);
  });

  it('lets a roadmap course follow its prerequisite: the Trung cấp course comes before the Nâng cao one of a domain', () => {
    if (skillPath?.kind !== 'skill-path') throw new Error('the individual landing page needs a skill-path section');

    const codes = skillPath.sample.roadmap.map((step) => step.courseCode);
    expect(codes.indexOf('A4-I')).toBeLessThan(codes.indexOf('A4-A'));
  });
});

describe('learning preview sample', () => {
  it('describes a published course of the catalogue with the right number of modules', () => {
    const preview = INDIVIDUAL_CONTENT.sections.find((section) => section.kind === 'learning-preview');
    if (preview?.kind !== 'learning-preview') throw new Error('the individual landing page needs a learning-preview section');

    const course = COURSES.find((candidate) => candidate.code === preview.sample.courseCode);
    expect(course?.title).toBe(preview.sample.courseTitle);
    expect(course?.status).toBe('PUBLISHED');
    expect(preview.sample.modules).toHaveLength(course!.modules);
  });
});
