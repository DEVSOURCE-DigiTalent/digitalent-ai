import React from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OwnerProgressTabs } from '../OwnerProgressTabs';

const report = vi.hoisted(() => ({
  isLoading: false,
  training: {
    totalAssignments: 4, completedAssignments: 1, inProgressAssignments: 2, completionRate: 25,
    courses: [
      { id: 'a', title: 'Phân tích dữ liệu', learnerCount: 2, averageProgress: 80 },
      { id: 'b', title: 'An toàn số', learnerCount: 1, averageProgress: 30 },
    ],
  },
}));

vi.mock('../OwnerAssessmentHeatmap', () => ({ OwnerAssessmentHeatmap: () => <p>Kết quả đánh giá</p> }));
vi.mock('@/hooks/use-organization', () => ({
  useOrganizationOverview: () => ({ data: { name: 'DigiTalent', members: { active: 6, pending: 2, inactive: 0 }, runningBatches: 1 } }),
}));
vi.mock('@/hooks/use-trial-program', () => ({ useTrialProgram: () => ({}) }));
vi.mock('@/hooks/use-skill-gaps', () => ({ useLearningNeeds: () => ({}) }));
vi.mock('@/hooks/use-learning', () => ({ useCertificates: () => ({ data: { totalItems: 3 } }) }));
vi.mock('@/hooks/use-analytics', () => ({
  useReportsOverview: () => ({
    isLoading: report.isLoading,
    data: { training: report.training, workforce: { byDepartment: [
      { id: 'finance', name: 'Tài chính', employeeCount: 4 },
      { id: 'hr', name: 'Nhân sự', employeeCount: 2 },
    ] } },
  }),
}));
afterEach(() => { cleanup(); report.isLoading = false; });

describe('Owner progress tabs', () => {
  it('opens the map and shows report metrics and the selected branch destination', () => {
    render(<MemoryRouter><OwnerProgressTabs /></MemoryRouter>);
    expect(screen.getByRole('tab', { name: 'Tiến độ đánh giá' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Bản đồ doanh nghiệp' }));

    const map = within(screen.getByRole('tabpanel', { name: 'Bản đồ doanh nghiệp' }));
    expect(map.getByText('DigiTalent')).toBeInTheDocument();
    expect(map.queryByRole('link', { name: 'Báo cáo chu kỳ' })).not.toBeInTheDocument();
    expect(map.getByText('25%')).toBeInTheDocument();
    expect(map.getByText('1 / 4 lượt giao')).toBeInTheDocument();
    expect(map.getAllByRole('button', { pressed: false })).toHaveLength(6);
    const branches = screen.getByRole('tabpanel', { name: 'Bản đồ doanh nghiệp' });
    expect(branches.querySelectorAll('[data-side="left"]')).toHaveLength(3);
    expect(branches.querySelectorAll('[data-side="right"]')).toHaveLength(3);
    const gap = map.getByRole('button', { name: /^Khoảng trống năng lực/ });
    expect(gap.parentElement).toHaveAttribute('data-side', 'bottom');
    fireEvent.click(gap);
    expect(map.getByRole('link', { name: 'Xem chi tiết' })).toHaveAttribute('href', '/enterprise/skill-gap');
    const team = map.getByRole('button', { name: /Cơ cấu đội ngũ/ });
    expect(team).toHaveTextContent('Chờ kích hoạt');
    expect(team).not.toHaveTextContent('Nhân sự hoạt động');
    fireEvent.click(team);
    expect(map.getByRole('progressbar', { name: 'Tài chính' })).toHaveAttribute('max', '6');
    fireEvent.click(map.getByRole('button', { name: /^Khóa học/ }));
    expect(map.getAllByRole('progressbar').map((bar) => bar.getAttribute('value'))).toEqual(['30', '80']);
    fireEvent.click(map.getByRole('button', { name: /^Chứng nhận/ }));
    expect(map.getByRole('link', { name: 'Xem chi tiết' })).toHaveAttribute('href', '/enterprise/certificates');

    fireEvent.keyDown(screen.getByRole('tab', { name: 'Bản đồ doanh nghiệp' }), { key: 'ArrowLeft' });
    expect(screen.getByRole('tab', { name: 'Tiến độ đánh giá' })).toHaveFocus();
  });

  it('switches on horizontal pointer drag and presents a loading indicator', () => {
    report.isLoading = true;
    render(<MemoryRouter><OwnerProgressTabs /></MemoryRouter>);
    const assessment = screen.getByText('Kết quả đánh giá');
    for (const [type, clientX] of [['pointerdown', 200], ['pointerup', 90]] as const) {
      const event = new Event(type, { bubbles: true });
      Object.assign(event, { pointerId: 1, isPrimary: true, button: 0, clientX, clientY: 40 });
      fireEvent(assessment, event);
    }
    expect(screen.getByRole('tab', { name: 'Bản đồ doanh nghiệp' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Đang tải báo cáo chu kỳ…');
  });
});
