import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import * as taskHooks from '@/hooks/use-tasks';
import * as competencyHooks from '@/hooks/use-competencies';
import { OwnerTaskDetailPage } from '../pages/OwnerTaskDetailPage';

describe('OwnerTaskDetailPage', () => {
  it('renders stored HTML as readable, safe content and explains missing criteria', () => {
    vi.spyOn(taskHooks, 'usePracticalTask').mockReturnValue({ data: {
      id: 'task-1', title: 'Bài cuối khóa', status: 'ACTIVE', targetLevel: 0,
      assignedByName: 'Nguyễn Linh', dueDate: '', description: '<p>Mô tả nhiệm vụ ở mức n&#226;ng cao: nêu <b>nguồn</b> và kết luận.</p>',
      expectedOutput: 'Minh chứng truy vết được.', competencyIds: [], rubricCriteria: '[]',
      assignedEmployees: [], submissions: [],
    }, isLoading: false, isError: false } as never);
    vi.spyOn(competencyHooks, 'useTaskCompetencies').mockReturnValue({ data: [] } as never);
    render(<MemoryRouter initialEntries={['/enterprise/tasks/task-1']}><Routes><Route path="/enterprise/tasks/:id" element={<OwnerTaskDetailPage />} /></Routes></MemoryRouter>);
    expect(screen.getByText(/Mô tả nhiệm vụ ở mức nâng cao/)).toBeInTheDocument();
    expect(screen.getByText('nguồn').tagName).toBe('B');
    expect(screen.queryByText(/<p>/)).not.toBeInTheDocument();
    expect(screen.getByText('Nhiệm vụ này chưa có tiêu chí đánh giá.')).toBeInTheDocument();
    expect(screen.queryByText('LV0')).not.toBeInTheDocument();
  });
});
