import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { OwnerCycleReportPage } from '../pages/OwnerCycleReportPage';

const courses = Array.from({ length: 8 }, (_, index) => ({
  id: `course-${index + 1}`, code: `M${index + 1}-F`, title: `Khóa báo cáo ${index + 1}`,
  domainName: 'Khai thác dữ liệu', learnerCount: index < 2 ? 1 : 0, averageProgress: index === 0 ? 100 : 0,
}));
vi.mock('@/hooks/use-analytics', () => ({
  useCapabilityDashboard: () => ({ isLoading: false, data: { domains: [{ categoryId: 'domain-1', name: 'Khai thác dữ liệu', sortOrder: 1, averageCurrent: 0.5, averageRequired: 2.5 }] } }),
  useReportsOverview: () => ({ isLoading: false, data: { training: { totalAssignments: 2, completedAssignments: 0, inProgressAssignments: 2, completionRate: 0, courses }, assessment: { totalAttempts: 3 }, workforce: { activeEmployees: 2 } } }),
}));

describe('Báo cáo chu kỳ', () => {
  it('ưu tiên khóa có học viên và chia trang khi xem toàn bộ', () => {
    render(<MemoryRouter><OwnerCycleReportPage /></MemoryRouter>);
    expect(screen.getByText('Khóa báo cáo 1')).toBeVisible();
    expect(screen.queryByText('Khóa báo cáo 3')).not.toBeInTheDocument();
    expect(screen.getByText('Chưa có lượt giao hoàn thành')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: /Tất cả 8/ }));
    expect(screen.getByText('Khóa báo cáo 3')).toBeVisible();
    expect(screen.queryByText('Khóa báo cáo 8')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Sau' }));
    expect(screen.getByText('Khóa báo cáo 8')).toBeVisible();
  });
});
