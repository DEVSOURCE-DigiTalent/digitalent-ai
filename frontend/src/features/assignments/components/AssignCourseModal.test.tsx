import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AssignCourseModal } from './AssignCourseModal';

const createAssignment = vi.fn().mockResolvedValue({ created: [{ id: 'assignment-1' }], skipped: [] });
vi.mock('@/hooks/use-assignments', () => ({
  useCourseCatalog: () => ({ data: { items: [{ id: 'course-1', code: 'M1-F', title: 'Tìm kiếm thông tin', level: 1 }] } }),
  useCreateAssignments: () => ({ mutateAsync: createAssignment, isPending: false }),
}));
vi.mock('@/hooks/use-departments', () => ({ useDepartments: () => ({ data: { items: [] } }) }));
vi.mock('@/hooks/use-job-positions', () => ({ useJobPositions: () => ({ data: { items: [] } }) }));
vi.mock('@/hooks/use-employees', () => ({ useAllEmployees: () => ({ data: [{ id: 'employee-1', fullName: 'Nguyễn An', employeeCode: 'NV-01', positionName: 'Kế toán viên' }], isLoading: false }) }));
vi.mock('@/hooks/use-skill-gaps', () => ({ useSkillGapRuns: () => ({ data: { items: [] } }) }));

describe('Form giao khóa học', () => {
  it('giữ khóa đã chọn và cho xem lại người nhận trước khi giao', async () => {
    createAssignment.mockClear();
    render(<AssignCourseModal open courseId="course-1" onClose={() => {}} />);
    expect(screen.getByRole('dialog', { name: 'Giao khóa học' })).toBeVisible();
    expect(screen.getByLabelText('Khóa học')).toHaveValue('course-1');
    const submit = screen.getByRole('button', { name: 'Giao khóa học' });
    expect(submit).toBeDisabled();
    fireEvent.click(screen.getByRole('checkbox'));
    expect(screen.getByText('1 nhân viên')).toBeVisible();
    expect(submit).toBeEnabled();
    fireEvent.click(submit);
    await waitFor(() => expect(createAssignment).toHaveBeenCalledWith({ courseId: 'course-1', dueDate: undefined, targets: { employeeIds: ['employee-1'] } }));
  });
});
