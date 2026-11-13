import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ROLES } from '@/lib/roles';
import { formatDateTime } from '@/lib/utils';
import { pulseReviewService, type PulseFinalReviewItem, type PulseFinalReviewQueue } from '@/services/pulse.service';
import { PulseFinalReviewsPage } from '../pages/PulseFinalReviewsPage';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const ok = <T,>(data: T) => ({ data: { success: true, message: 'Success', data } }) as never;

const FIRST_REVIEW = '2026-11-13T15:11:22Z';
const SECOND_REVIEW = '2026-11-13T15:12:44Z';

const pending = (reviewedAt: string, summary: string): PulseFinalReviewItem => ({
  kind: 'FINAL',
  submissionId: 'sub-1',
  status: 'PENDING',
  employeeId: 'emp-1',
  employeeName: 'Nguyễn An',
  departmentName: 'Kế toán',
  positionName: 'Kế toán viên',
  courseId: 'course-1',
  courseCode: 'M1-F',
  courseTitle: 'Tìm kiếm và lưu trữ thông tin cơ bản',
  domainName: 'Khai thác dữ liệu và thông tin',
  tier: 1,
  attemptNo: 1,
  maxAttempts: 2,
  attempts: [{ submissionId: 'sub-1', attemptNo: 1, evidenceText: 'Nguồn: sổ cái tháng 9.', submittedAt: '2026-11-13T08:00:00Z' }],
  aiHint: { checks: [true, true, false], summary, source: 'GEMINI', model: 'gemini-test', reviewedAt },
});

const queue = (item: PulseFinalReviewItem): PulseFinalReviewQueue => ({
  pendingCount: 1,
  preAssessmentCount: 0,
  retryCount: 0,
  deadlineMissedCount: 0,
  flaggedCount: 0,
  criteria: [
    { number: '01', title: 'Nguồn có thể truy vết', description: 'Nêu nguồn.' },
    { number: '02', title: 'Hành động có thể kiểm tra', description: 'Trình bày cách làm.' },
    { number: '03', title: 'Kết luận có căn cứ', description: 'Kết luận và bước tiếp theo.' },
  ],
  items: [item],
});

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/enterprise/team/final-reviews']}>
        <Routes>
          <Route path="/enterprise/team/final-reviews" element={<PulseFinalReviewsPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
  useCurrentUser.setState({
    user: { id: 'u-1', email: 'manager@digitalent.ai', fullName: 'Trưởng phòng', roles: [ROLES.MANAGER], permissions: ['task.evaluate'], workspace: 'enterprise' },
    isAuthenticated: true,
  });
});

describe('PulseFinalReviewsPage · stored AI review', () => {
  it('shows when the AI reviewed the submission', async () => {
    vi.spyOn(pulseReviewService, 'getQueue').mockResolvedValue(ok(queue(pending(FIRST_REVIEW, 'Bài có nguồn rõ ràng.'))));

    renderPage();

    const card = await screen.findByRole('article', { name: 'Nguyễn An · Tìm kiếm và lưu trữ thông tin cơ bản' });
    expect(within(card).getByText(`Chấm lúc ${formatDateTime(FIRST_REVIEW)}`)).toBeTruthy();
    expect(within(card).getByText('Bài có nguồn rõ ràng.')).toBeTruthy();
  });

  it('asks the AI to review this submission again and shows the new review', async () => {
    const getQueue = vi.spyOn(pulseReviewService, 'getQueue')
      .mockResolvedValueOnce(ok(queue(pending(FIRST_REVIEW, 'Bài có nguồn rõ ràng.'))))
      .mockResolvedValue(ok(queue(pending(SECOND_REVIEW, 'Lần chấm lại: thiếu kết luận.'))));

    renderPage();
    const card = await screen.findByRole('article', { name: 'Nguyễn An · Tìm kiếm và lưu trữ thông tin cơ bản' });
    fireEvent.click(within(card).getByRole('button', { name: 'Chấm lại bằng AI' }));

    await waitFor(() => expect(getQueue).toHaveBeenCalledWith(false, undefined, true, 'sub-1'));
    expect(await screen.findByText(`Chấm lúc ${formatDateTime(SECOND_REVIEW)}`)).toBeTruthy();
    expect(screen.getByText('Lần chấm lại: thiếu kết luận.')).toBeTruthy();
  });
});
