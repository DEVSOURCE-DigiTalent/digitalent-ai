import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LearnerProgressPage } from '../pages/LearnerProgressPage';
import { LearnerCertificatesPage } from '../pages/LearnerCertificatesPage';
import { LearnerTasksPage } from '../pages/LearnerTasksPage';

const state = vi.hoisted(() => ({ result: null as unknown }));
vi.mock('@/hooks/use-personal-learning', () => ({
  usePersonalProgress: () => ({ data: {
    learnedMinutes: 0, lessonsCompleted: 0, assessmentsPassed: 0, tasksApproved: 0, coveragePercent: 0,
    profile: [{ number: 1, name: 'Thông tin và dữ liệu', items: [
      { code: '1.1', name: 'Tìm kiếm thông tin', level: 0, requiredLevel: 2, source: null, at: null },
    ] }], milestones: [], activity: [],
  } }),
  usePersonalDiagnostic: () => ({ data: { result: state.result } }),
  usePersonalCertificates: () => ({ data: [] }),
  usePersonalTasks: () => ({ data: [] }),
  useSubmitPersonalTask: () => ({ reset: vi.fn() }),
  // Trial guidance: this learner is on a paying plan, so there is nothing to show.
  usePersonalAccess: () => ({ data: { mode: 'full', checklist: [], seen: {} } }),
  useMarkSeen: () => ({ mutate: vi.fn() }),
}));
const show = (page: React.ReactNode) => render(
  <QueryClientProvider client={new QueryClient()}><MemoryRouter>{page}</MemoryRouter></QueryClientProvider>,
);

beforeEach(() => { state.result = null; });
describe('Personal results workspace', () => {
  it('shows evidence columns and does not present unassessed skills as zero percent', () => {
    show(<LearnerProgressPage />);
    const table = screen.getByRole('table', { name: 'Thông tin và dữ liệu' });
    expect(within(table).getByRole('columnheader', { name: 'Căn cứ' })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: 'Ngày đánh giá' })).toBeInTheDocument();
    expect(within(table).getByText('Chưa đánh giá')).toBeInTheDocument();
    expect(screen.queryByText('0%')).not.toBeInTheDocument();
  });
  it('distinguishes an assessed zero level using the actual diagnostic date', () => {
    state.result = { completedAt: '2026-10-01T09:00:00Z', domains: [{ number: 1, level: 0 }] };
    show(<LearnerProgressPage />);
    const table = screen.getByRole('table');
    expect(within(table).getByText('Chưa đạt mức Cơ bản')).toBeInTheDocument();
    expect(within(table).getByText('Đánh giá đầu vào')).toBeInTheDocument();
    expect(within(table).queryByText('Chưa đánh giá')).not.toBeInTheDocument();
  });
  it('names certificates as course completion documents', () => {
    show(<LearnerCertificatesPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Chứng nhận hoàn thành khóa học' })).toBeInTheDocument();
  });
  it('uses a direct tasks title without promising expert review', () => {
    show(<LearnerTasksPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Bài thực hành' })).toBeInTheDocument();
    expect(screen.queryByText(/chuyên gia DigiTalent/)).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Chưa bắt đầu khóa/ })).toBeInTheDocument();
  });
});
