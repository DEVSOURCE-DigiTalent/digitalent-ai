import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as recommendationHooks from '@/hooks/use-recommendations';
import type { CourseRecommendation, CourseRecommendationsResult } from '@/services/intelligence.service';
import { CourseRecommendations } from '../components/CourseRecommendations';

const recommendation = (overrides: Partial<CourseRecommendation>): CourseRecommendation => ({
  courseId: 'k3',
  courseCode: 'DA-ADVANCED',
  title: 'Advanced data analysis',
  estimatedDurationMinutes: 720,
  entryLevel: 2,
  enrollmentStatus: null,
  score: 55,
  breakdown: { gapPriorityCoverage: 35, mandatoryCoverage: 10, entryLevelFit: 10 },
  reasons: [
    {
      competencyId: 'c1', competencyName: 'Data literacy', currentLevel: 1, requiredLevel: 3, courseTargetLevel: 3,
      coverageType: 'PRIMARY', closesSteps: 2, mandatory: true, severity: 'HIGH',
    },
  ],
  explanation: 'Raises Data literacy from Basic to Advanced (required: Advanced, mandatory).',
  warnings: [],
  ...overrides,
});

const result = (overrides: Partial<CourseRecommendationsResult>): CourseRecommendationsResult => ({
  employeeId: 'emp-1',
  skillGapRunId: 'run-1',
  generatedAt: '2026-09-29T08:00:00Z',
  scoringConfigVersion: '1',
  reason: null,
  items: [],
  ...overrides,
});

const queryResult = (overrides: Record<string, unknown>) =>
  ({ data: undefined, isLoading: false, isError: false, refetch: vi.fn(), ...overrides }) as never;

describe('CourseRecommendations', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('passes the employee to the query', () => {
    const spy = vi.spyOn(recommendationHooks, 'useCourseRecommendations').mockReturnValue(queryResult({ isLoading: true }));
    render(<CourseRecommendations employeeId="emp-9" />);
    expect(spy).toHaveBeenCalledWith('emp-9');
    expect(screen.getByLabelText('Đang tải đề xuất')).toBeInTheDocument();
  });

  it.each([
    ['NO_SKILL_GAP_RUN', 'Chưa có phân tích skill gap'],
    ['NO_GAP', 'Đã đạt mọi năng lực của vị trí'],
    ['NO_MATCHING_COURSE', 'Chưa có khóa học phù hợp với khoảng trống hiện tại'],
    ['NO_EMPLOYEE_PROFILE', 'Chưa có hồ sơ nhân viên'],
  ] as const)('explains the empty reason %s', (reason, title) => {
    vi.spyOn(recommendationHooks, 'useCourseRecommendations').mockReturnValue(queryResult({ data: result({ reason }) }));
    render(<CourseRecommendations />);
    expect(screen.getByText(title)).toBeInTheDocument();
  });

  it('renders score, point breakdown, reasons and enrollment status', () => {
    const items = [
      recommendation({}),
      recommendation({
        courseId: 'k2', courseCode: 'SEC-BASIC', title: 'Information security basics', score: 49.17,
        enrollmentStatus: 'IN_PROGRESS', warnings: ['ENTRY_LEVEL_NOT_MET'],
      }),
    ];
    vi.spyOn(recommendationHooks, 'useCourseRecommendations').mockReturnValue(queryResult({ data: result({ items }) }));
    render(<CourseRecommendations />);

    expect(screen.getByText('Advanced data analysis')).toBeInTheDocument();
    expect(screen.getByText('55.0')).toBeInTheDocument();
    expect(screen.getAllByText('Đóng khoảng trống 35.0 · Bắt buộc 10.0 · Phù hợp đầu vào 10.0')).toHaveLength(2);
    expect(screen.getAllByText(/Data literacy: Cơ bản → Nâng cao/)).toHaveLength(2);
    expect(screen.getByText('Đang học')).toBeInTheDocument();
    expect(screen.getByText(/mức đầu vào của khóa cao hơn/i)).toBeInTheDocument();
  });

  it('offers a retry when loading fails', () => {
    const refetch = vi.fn();
    vi.spyOn(recommendationHooks, 'useCourseRecommendations').mockReturnValue(queryResult({ isError: true, refetch }));
    render(<CourseRecommendations />);

    fireEvent.click(screen.getByText('Thử lại'));
    expect(refetch).toHaveBeenCalled();
  });
});
