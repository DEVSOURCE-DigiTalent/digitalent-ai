import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MyLearningPathPage } from '../pages/MyLearningPathPage';
import * as meHooks from '@/hooks/use-me';
import type { MyLearningPath } from '@/services/me.service';

const emptySummary = { totalSteps: 0, completedSteps: 0, inProgressSteps: 0, recommendedSteps: 0, totalMinutes: 0, remainingMinutes: 0 };

function renderPath(path: MyLearningPath) {
  vi.spyOn(meHooks, 'useEnrollInCourse').mockReturnValue({ mutateAsync: vi.fn(), isPending: false } as never);
  vi.spyOn(meHooks, 'useMyLearningPath').mockReturnValue({ data: path, isLoading: false, isError: false, refetch: vi.fn() } as never);
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter><MyLearningPathPage /></MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('MyLearningPathPage', () => {
  it('uses enrollment progress and the BE course GUID in the learner link', () => {
    renderPath({
      openGapCount: 1,
      summary: { ...emptySummary, totalSteps: 1, inProgressSteps: 1, totalMinutes: 90, remainingMinutes: 30 },
      steps: [{
        order: 1, courseId: 'course-guid', courseCode: 'A4-I', courseTitle: 'An toàn thông tin', level: 2, estimatedDurationMinutes: 90,
        source: 'ASSIGNED', status: 'IN_PROGRESS', progressPercent: 67, isOverdue: false, assignedByName: 'Trần Quản Lý',
        rationale: 'Được Trần Quản Lý giao trực tiếp.', targetCompetencies: [], prerequisites: [], canEnroll: false, warnings: [],
      }],
    });

    expect(screen.getByRole('link', { name: /Tiếp tục học \(67%\)/ })).toHaveAttribute('href', '/enterprise/me/courses/course-guid');
    expect(screen.getByText('Được Trần Quản Lý giao trực tiếp.')).toBeInTheDocument();
  });

  it('shows an honest empty state without fabricated stages', () => {
    renderPath({ openGapCount: 0, summary: emptySummary, steps: [] });

    expect(screen.getByText('Chưa có khóa học nào trong lộ trình')).toBeInTheDocument();
    expect(screen.queryByText('4 chặng bồi dưỡng kỹ năng số cần thiết')).toBeNull();
  });
});
