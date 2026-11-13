import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CompanyLearningOverview, OwnerCapabilityGapPage } from './OwnerCapabilityGapPage';
import type { LearningNeedsOverview } from '@/services/intelligence.service';

vi.stubGlobal('React', React);
vi.mock('@/hooks/use-departments', () => ({ useDepartments: () => ({}) }));
vi.mock('@/hooks/use-job-positions', () => ({ useJobPositions: () => ({}) }));
vi.mock('@/hooks/use-skill-gaps', () => ({
  useLearningNeeds: (_params: unknown, enabled = true) => ({ isLoading: enabled, isFetching: enabled }),
}));
afterEach(cleanup);
const overview: LearningNeedsOverview = {
  employees: 20, assessedEmployees: 12, waitingEmployees: 8, noStandardEmployees: 0,
  domains: [
    { categoryId: 'data', number: 1, name: 'Dữ liệu', assessed: 10, met: 5, waiting: 8, needsLearning: 5, courses: [{ requiredLevel: 3, courseId: 'a1a', courseCode: 'A1-A', courseTitle: 'Phân tích nâng cao', employees: 5, missingCompetencies: ['Đánh giá dữ liệu'] }] },
    { categoryId: 'ai', number: 6, name: 'Trí tuệ nhân tạo', assessed: 10, met: 10, waiting: 8, needsLearning: 0, courses: [] },
  ],
};
describe('company learning overview', () => {
  it('shows scope-wide domain progress and exact courses instead of expanded employee profiles', () => {
    render(<MemoryRouter><CompanyLearningOverview overview={overview} /></MemoryRouter>);
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Đạt chuẩn Dữ liệu' })).toHaveAttribute('aria-valuenow', '50');
    expect(screen.getByText('Đánh giá dữ liệu')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Xem khóa học' })).toHaveAttribute('href', '/enterprise/courses?focus=a1a');
    fireEvent.click(screen.getByRole('button', { name: /Trí tuệ nhân tạo/ }));
    expect(screen.getByText('Chưa cần bổ sung khóa học.')).toBeInTheDocument();
    expect(screen.queryByText('Phân tích nâng cao')).not.toBeInTheDocument();
  });
  it('does not turn missing assessments into zero percent competence', () => {
    render(<MemoryRouter><CompanyLearningOverview overview={{ employees: 5, assessedEmployees: 0, waitingEmployees: 5, noStandardEmployees: 0, domains: [{ ...overview.domains[0], assessed: 0, met: 0, needsLearning: 0, courses: [] }] }} /></MemoryRouter>);
    expect(screen.queryByText('0%')).not.toBeInTheDocument();
    expect(screen.getByText('Sẵn sàng đối chiếu')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Xem khóa học' })).not.toBeInTheDocument();
  });
});

it('shows an indeterminate progress bar while comparing against standards', () => {
  render(<MemoryRouter><OwnerCapabilityGapPage /></MemoryRouter>);
  expect(screen.getByRole('progressbar', { name: 'Đang đối chiếu năng lực…' })).not.toHaveAttribute('aria-valuenow');
  expect(screen.getByRole('button', { name: 'Làm mới' })).toBeDisabled();
});
