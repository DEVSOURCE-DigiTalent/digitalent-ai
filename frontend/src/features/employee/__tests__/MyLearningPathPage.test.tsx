import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MyLearningPathPage } from '../pages/MyLearningPathPage';
import * as myLearningHooks from '@/hooks/use-my-learning';

describe('MyLearningPathPage', () => {
  it('uses enrollment progress and the BE course GUID in the learner link', () => {
    vi.spyOn(myLearningHooks, 'useMyLearning').mockReturnValue({
      data: {
        items: [{ enrollmentId: 'enrollment-guid', courseId: 'course-guid', courseCode: 'A4-I', courseTitle: 'An toàn thông tin', level: 2, estimatedDurationMinutes: 90, totalModules: 1, totalLessons: 3, completedLessons: 2, status: 'IN_PROGRESS', progressPercent: 67, overdue: false }],
        total: 1, completed: 0, inProgress: 1, notStarted: 0,
      },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof myLearningHooks.useMyLearning>);

    render(<MemoryRouter><MyLearningPathPage /></MemoryRouter>);
    expect(screen.getByText('2/3 bài học · 67% · 90 phút')).toBeDefined();
    expect(screen.getByRole('link', { name: /Tiếp tục học/ }).getAttribute('href')).toBe('/enterprise/me/courses/course-guid');
    expect(screen.queryByText('23h')).toBeNull();
  });

  it('shows an honest empty state without fabricated stages', () => {
    vi.spyOn(myLearningHooks, 'useMyLearning').mockReturnValue({
      data: { items: [], total: 0, completed: 0, inProgress: 0, notStarted: 0 }, isLoading: false, isError: false,
    } as unknown as ReturnType<typeof myLearningHooks.useMyLearning>);
    render(<MemoryRouter><MyLearningPathPage /></MemoryRouter>);
    expect(screen.getByText('Bạn chưa được ghi danh khóa học nào.')).toBeDefined();
    expect(screen.queryByText('4 chặng bồi dưỡng kỹ năng số cần thiết')).toBeNull();
  });
});
