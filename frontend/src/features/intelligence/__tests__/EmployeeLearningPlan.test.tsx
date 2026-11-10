import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EmployeeLearningPlan } from '../components/EmployeeLearningPlan';
import type { EmployeeLearningNeeds } from '@/services/intelligence.service';

vi.stubGlobal('React', React);
afterEach(cleanup);
const employee: EmployeeLearningNeeds = {
  employeeId: 'e1', employeeName: 'Nguyễn An', state: 'NEEDS_LEARNING', domains: [
    { categoryId: 'd1', name: 'Dữ liệu', number: 1, requiredLevel: 3, currentLevel: 1, state: 'NEEDS_LEARNING', courseId: 'a1a', courseTitle: 'Phân tích dữ liệu', missingCompetencies: ['Quản lý dữ liệu'] },
    { categoryId: 'd4', name: 'An toàn', number: 4, requiredLevel: 2, currentLevel: 2, state: 'MET', missingCompetencies: [] },
    { categoryId: 'd6', name: 'Trí tuệ nhân tạo', number: 6, requiredLevel: 2, currentLevel: 1, state: 'NEEDS_LEARNING', courseId: 'm6i', courseTitle: 'Ứng dụng AI trung cấp', missingCompetencies: ['Đánh giá công cụ AI'] },
  ],
};
function setup() {
  render(<MemoryRouter><EmployeeLearningPlan employee={employee} canConfirm={false} onConfirm={vi.fn()} onRefresh={vi.fn()} refreshing={false} /></MemoryRouter>);
}
describe('employee domain navigation', () => {
  it('embeds current competency evidence with the position domain target without repeating the profile header', () => {
    const profile: EmployeeLearningNeeds = { ...employee, domains: [{ ...employee.domains[0], competencies: [
      { competencyId: 'c1', name: 'Quản lý dữ liệu', requiredLevel: 3, currentLevel: 2, source: 'ASSESSMENT' },
      { competencyId: 'c2', name: 'Đánh giá nguồn tin', requiredLevel: 3, currentLevel: 3, source: 'EVIDENCE' },
    ] }] };
    render(<MemoryRouter><EmployeeLearningPlan employee={profile} embedded view="competencies" canConfirm={false} onConfirm={vi.fn()} onRefresh={vi.fn()} refreshing={false} /></MemoryRouter>);
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
    expect(screen.getByText('Chuẩn vị trí · Nâng cao')).toBeInTheDocument();
    expect(screen.getByText('Đánh giá tổng thể')).toBeInTheDocument();
    expect(screen.getByText('Xác nhận bổ sung')).toBeInTheDocument();
    expect(screen.getAllByText('Yêu cầu')).toHaveLength(2);
    expect(screen.getByText('Trung cấp')).toBeInTheDocument();
  });
  it('only shows the selected domain and its matching course', () => {
    setup();
    expect(screen.getByRole('tabpanel', { name: 'Dữ liệu' })).toBeInTheDocument();
    expect(screen.queryByText('Ứng dụng AI trung cấp')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Trí tuệ nhân tạo' }));
    expect(screen.getByRole('link', { name: 'Xem khóa học' })).toHaveAttribute('href', '/enterprise/courses?focus=m6i');
    expect(screen.queryByText('Phân tích dữ liệu')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'An toàn' }));
    expect(screen.getByText(/Đã đáp ứng chuẩn vị trí/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Xem khóa học' })).not.toBeInTheDocument();
  });
  it('supports arrow, Home and End navigation with focus following the selected tab', () => {
    setup();
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Dữ liệu' }), { key: 'End' });
    expect(screen.getByRole('tab', { name: 'Trí tuệ nhân tạo' })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Trí tuệ nhân tạo' }), { key: 'ArrowLeft' });
    expect(screen.getByRole('tab', { name: 'An toàn' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(screen.getByRole('tab', { name: 'An toàn' }), { key: 'Home' });
    expect(screen.getByRole('tabpanel', { name: 'Dữ liệu' })).toBeInTheDocument();
  });
});
