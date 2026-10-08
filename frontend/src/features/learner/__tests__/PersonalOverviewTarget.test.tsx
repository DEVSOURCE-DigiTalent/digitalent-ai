import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LearnerDashboardPage } from '../pages/LearnerDashboardPage';
import { LearnerTargetPage } from '../pages/LearnerTargetPage';

const state = vi.hoisted(() => ({ assessed: false, target: true, mutate: vi.fn() }));
vi.mock('@/hooks/use-current-user', () => ({ useCurrentUser: () => ({ fullName: 'An' }) }));
vi.mock('@/hooks/use-personal-learning', () => ({
  usePersonalOverview: () => ({ data: { fullName: 'An', target: state.target ? { code: 'MARKETING', name: 'Marketing' } : null, assessed: state.assessed, coveragePercent: 0, gapCount: 20, domains: [], path: { completedCourses: 0, totalCourses: 2, minutesLeft: 90 }, openTaskCount: 1, activity: [], continueLesson: null, nextCourse: null } }),
  usePersonalSkillGap: () => ({ data: { target: { code: 'MARKETING', name: 'Marketing' }, assessed: state.assessed } }),
  usePersonalProgress: () => ({ data: { profile: [] } }),
  useSetPersonalTarget: () => ({ mutate: state.mutate }),
  // Trial guidance: this learner is on a paying plan, so there is nothing to show.
  usePersonalAccess: () => ({ data: { mode: 'full', checklist: [], seen: {}, targetChangesLeft: null } }),
  useMarkSeen: () => ({ mutate: vi.fn() }),
}));

beforeEach(() => { state.assessed = false; state.target = true; state.mutate.mockClear(); });
const show = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('Personal overview and target workspace', () => {
  it('prioritizes assessment without presenting missing evidence as zero competence', () => {
    show(<LearnerDashboardPage />);
    expect(screen.getByRole('heading', { name: 'Tổng quan học tập' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Làm đánh giá' })).toHaveAttribute('href', '/personal/diagnostic');
    expect(screen.queryByText(/0%/)).not.toBeInTheDocument();
    expect(screen.queryByText(/đi hết lộ trình/)).not.toBeInTheDocument();
  });
  it('offers only target setup as the first action when no goal exists', () => {
    state.target = false;
    show(<LearnerDashboardPage />);
    expect(screen.getByRole('link', { name: /Chọn vị trí/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Làm bài' })).not.toBeInTheDocument();
  });
  it('does not infer completion from the absence of a next course', () => {
    state.assessed = true;
    show(<LearnerDashboardPage />);
    expect(screen.queryByText(/đi hết lộ trình|Đã hoàn thành lộ trình/)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Xem lộ trình' })).toBeInTheDocument();
  });
  it('explains goal changes before saving and labels unassessed competencies', () => {
    show(<LearnerTargetPage />);
    fireEvent.click(screen.getByRole('radio', { name: /Kế toán/ }));
    expect(screen.getByText(/Lộ trình sẽ được tính lại theo yêu cầu/)).toBeInTheDocument();
    expect(screen.queryByText(/mức hiện tại đang tính là 0/)).not.toBeInTheDocument();
    expect(screen.getAllByText(/Chưa đánh giá/).length).toBeGreaterThan(0);
    expect(state.mutate).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Chọn làm mục tiêu' }));
    expect(state.mutate).toHaveBeenCalledWith('ACCOUNTANT');
  });
});
