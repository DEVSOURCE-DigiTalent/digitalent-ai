import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { EmployeeLearningNeedsCard } from '../components/EmployeeLearningNeedsCard';
import type { EmployeeLearningNeeds } from '@/services/intelligence.service';

vi.stubGlobal('React', React);

const employee: EmployeeLearningNeeds = { employeeId: 'e1', employeeName: 'Nguyễn An', positionId: 'p1', positionName: 'HR', departmentName: 'HR', state: 'NEEDS_LEARNING', domains: [
  { categoryId: 'd1', name: 'Khai thác dữ liệu', number: 1, requiredLevel: 3, currentLevel: 1, state: 'NEEDS_LEARNING', courseId: 'c3', courseCode: 'A1-A', courseTitle: 'Phân tích dữ liệu nâng cao', missingCompetencies: ['Tìm kiếm dữ liệu'] },
  { categoryId: 'd2', name: 'An toàn', number: 4, requiredLevel: 1, currentLevel: 2, state: 'MET', missingCompetencies: [] },
] };

describe('actionable learning needs', () => {
  it('shows only unmet domains, the level transition and exact destination course without statistical metrics', () => {
    render(<MemoryRouter><EmployeeLearningNeedsCard employee={employee} /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Khai thác dữ liệu' })).toBeInTheDocument();
    expect(screen.getByText('Hiện tại').parentElement).toHaveTextContent('Cơ bản');
    expect(screen.getByText('Nâng cao')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Xem khóa học' })).toHaveAttribute('href', '/enterprise/courses?focus=c3');
    expect(screen.queryByText('An toàn')).not.toBeInTheDocument();
    expect(screen.queryByText(/%|trọng số|ưu tiên|snapshot/i)).not.toBeInTheDocument();
  });
  it('shows assessment guidance instead of course suggestions for unassessed staff', () => {
    render(<MemoryRouter><EmployeeLearningNeedsCard employee={{ ...employee, state: 'WAITING_ASSESSMENT', domains: [{ ...employee.domains[0], state: 'WAITING_ASSESSMENT', courseId: undefined }] }} /></MemoryRouter>);
    expect(screen.getByText(/Chờ kết quả đánh giá tổng thể/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Xem khóa học' })).not.toBeInTheDocument();
  });
});
