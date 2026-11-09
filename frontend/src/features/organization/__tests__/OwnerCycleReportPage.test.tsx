import React from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OwnerCycleReportPage } from '../pages/OwnerCycleReportPage';

const state = vi.hoisted(() => ({ total: 8, error: false, reports: vi.fn(), needs: vi.fn() }));
const courses = Array.from({ length: 8 }, (_, index) => ({ id: `course-${index + 1}`, code: `M1-${index}`, title: `Khóa báo cáo ${index + 1}`, domainName: 'Dữ liệu', learnerCount: 1, averageProgress: index === 0 ? 100 : 0 }));
vi.mock('@/hooks/use-analytics', () => ({ useReportsOverview: (scope: unknown) => { state.reports(scope); return { isLoading: false, data: { training: { totalAssignments: state.total, completedAssignments: state.total ? 1 : 0, inProgressAssignments: state.total ? 7 : 0, completionRate: state.total ? 12.5 : 0, courses: state.total ? courses : [] } } }; } }));
vi.mock('@/hooks/use-departments', () => ({ useDepartments: () => ({ data: { items: [{ id: 'hr', name: 'HR' }] } }) }));
vi.mock('@/hooks/use-job-positions', () => ({ useJobPositions: () => ({ data: { items: [{ id: 'p1', departmentId: 'hr', name: 'Chuyên viên HR' }] } }) }));
vi.mock('@/hooks/use-skill-gaps', () => ({ useLearningNeeds: (scope: unknown) => { state.needs(scope); return { isLoading: false, isError: state.error, data: { overview: { employees: 4, assessedEmployees: 2, waitingEmployees: 2, noStandardEmployees: 0, domains: [
  { categoryId: 'd1', number: 1, name: 'Dữ liệu', assessed: 2, met: 1, needsLearning: 1, waiting: 2, courses: [{ requiredLevel: 3, courseId: 'a1a', courseCode: 'A1-A', courseTitle: 'Phân tích dữ liệu', employees: 1, missingCompetencies: ['Quản lý dữ liệu'] }] },
  { categoryId: 'd4', number: 4, name: 'An toàn', assessed: 0, met: 0, needsLearning: 0, waiting: 4, courses: [] },
] } } }; } }));
vi.stubGlobal('React', React);
afterEach(cleanup);
beforeEach(() => { state.total = 8; state.error = false; vi.clearAllMocks(); });
const setup = () => render(<MemoryRouter><OwnerCycleReportPage /></MemoryRouter>);

describe('Báo cáo theo chuẩn vị trí hiện tại', () => {
  it('excludes unassessed staff from the achieved rate and maps the exact required course', () => {
    setup();
    expect(screen.getByText('1 / 2 lượt đối chiếu lĩnh vực đã đạt chuẩn')).toBeVisible();
    expect(screen.getByText('Quản lý dữ liệu')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Xem khóa học Phân tích dữ liệu' })).toHaveAttribute('href', '/enterprise/courses?focus=a1a');
    const waiting = screen.getByRole('button', { name: /An toàn/ });
    expect(within(waiting).getByText('—')).toBeVisible();
    fireEvent.click(waiting);
    expect(screen.getByText('Chờ đánh giá để xác định năng lực cần bổ sung.')).toBeVisible();
  });
  it('keeps competency results visible before any training assignment', () => {
    state.total = 0; setup();
    expect(screen.getByText('Quản lý dữ liệu')).toBeVisible();
    expect(screen.getByText('Chưa giao khóa học trong phạm vi này.')).toBeVisible();
  });
  it('paginates course activity and resets the page when searching', () => {
    setup();
    expect(screen.queryByText('Khóa báo cáo 8')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Sau' }));
    expect(screen.getByText('Khóa báo cáo 8')).toBeVisible();
    fireEvent.change(screen.getByRole('searchbox', { name: 'Tìm khóa học báo cáo' }), { target: { value: 'Khóa báo cáo 1' } });
    expect(screen.getByText('Khóa báo cáo 1')).toBeVisible();
    expect(screen.queryByText('Khóa báo cáo 8')).toBeNull();
  });
  it('sends the same department and position scope to both data sources', () => {
    setup();
    fireEvent.click(screen.getByRole('combobox', { name: 'Phòng ban báo cáo' }));
    fireEvent.click(screen.getByRole('option', { name: 'HR', exact: true }));
    fireEvent.click(screen.getByRole('combobox', { name: 'Vị trí báo cáo' }));
    fireEvent.click(screen.getByRole('option', { name: 'Chuyên viên HR' }));
    expect(state.reports).toHaveBeenLastCalledWith({ departmentId: 'hr', jobPositionId: 'p1' });
    expect(state.needs).toHaveBeenLastCalledWith({ departmentId: 'hr', jobPositionId: 'p1', pageIndex: 1, pageSize: 1 });
  });
  it('shows an error without presenting missing competency data as a zero result', () => {
    state.error = true; setup();
    expect(screen.getByRole('alert')).toHaveTextContent('Không tải được kết quả năng lực');
    expect(screen.queryByLabelText('Kết quả năng lực doanh nghiệp')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Tiến độ đào tạo' })).toBeVisible();
  });
});
