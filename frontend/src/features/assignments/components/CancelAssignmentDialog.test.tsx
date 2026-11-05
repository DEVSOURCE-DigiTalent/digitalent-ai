import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AssignmentRow } from '@/services/assignment.service';
import { CancelAssignmentDialog } from './CancelAssignmentDialog';

const mutateAsync = vi.fn();
vi.mock('@/hooks/use-assignments', () => ({ useCancelAssignment: () => ({ mutateAsync, isPending: false }) }));
vi.mock('sonner', () => ({ toast: { success: vi.fn() } }));

const assignment: AssignmentRow = {
  id: 'assignment-1', employeeId: 'employee-1', employeeName: 'Nguyễn Văn An', employeeCode: 'NV01',
  courseId: 'course-1', courseCode: 'M1-F', courseTitle: 'Tìm kiếm thông tin',
  assignedAt: '2026-10-01', assignedByName: 'Quản lý', dueDate: '2026-12-01', status: 'ACTIVE',
  progressPercent: 20, source: 'MANUAL', overdue: false, dueSoon: false,
};

describe('Hủy giao khóa học', () => {
  beforeEach(() => mutateAsync.mockReset());

  it('yêu cầu lý do và chỉ đóng sau khi hủy thành công', async () => {
    const onClose = vi.fn();
    mutateAsync.mockResolvedValue({});
    render(<CancelAssignmentDialog assignment={assignment} onClose={onClose} />);
    expect(screen.getByText('Tìm kiếm thông tin')).toBeVisible();
    expect(screen.getByText('Nguyễn Văn An')).toBeVisible();
    const confirm = screen.getByRole('button', { name: 'Xác nhận hủy' });
    expect(confirm).toBeDisabled();
    fireEvent.change(screen.getByLabelText(/Lý do hủy/), { target: { value: '  Đã đổi vị trí  ' } });
    fireEvent.click(confirm);
    await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({ id: 'assignment-1', reason: 'Đã đổi vị trí' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  });

  it('giữ hộp thoại mở để thử lại khi hủy thất bại', async () => {
    const onClose = vi.fn();
    mutateAsync.mockRejectedValueOnce(new Error('Lỗi kết nối'));
    render(<CancelAssignmentDialog assignment={assignment} onClose={onClose} />);
    fireEvent.change(screen.getByLabelText(/Lý do hủy/), { target: { value: 'Không còn phù hợp' } });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Xác nhận hủy' })); });
    expect(await screen.findByRole('alert')).toBeVisible();
    expect(onClose).not.toHaveBeenCalled();
  });
});
