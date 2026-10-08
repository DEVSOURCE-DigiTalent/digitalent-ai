import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'sonner';
import apiClient from '@/services/api-client';
import { personalLearningService } from '@/services/personal-learning.service';
import { useCurrentUser } from '@/hooks/use-current-user';
import { mockRegistrationService } from '@/services/mock/mock-registration.service';
import { findUserByEmail, resetMockDb } from '@/services/mock/mock-store';
import { composeSession } from '@/services/mock/server/session';
import { mockAdapter } from '@/services/mock/server/mock-adapter';
import { MOCK_EMAILS, signInAsMock, signOut } from '@/test/session';
import type { TrialEventDetail } from '@/features/experience/individual-trial/individual-trial-tracker';
import { PlanBadge } from '../components/PlanBadge';
import {
  LearnerCertificatesPage,
  LearnerClassroomPage,
  LearnerCourseDetailPage,
  LearnerDashboardPage,
  LearnerDiagnosticPage,
  LearnerPathPage,
  LearnerSubscriptionPage,
} from '../pages';

vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() } }));

function renderPage(ui: React.ReactElement, route = '/', path = '*') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path={path} element={ui} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

/** A brand-new trial account, signed in: nothing done yet. */
async function signInAsFreshTrial(): Promise<void> {
  await mockRegistrationService.registerIndividual({
    fullName: 'Người Mới', email: 'nguoi.moi@example.vn', password: 'Matkhau1234', trial: true, positionCode: 'ACCOUNTANT',
  });
  const id = findUserByEmail('nguoi.moi@example.vn')!.id;
  localStorage.setItem('accessToken', `mock-token:${id}`);
  useCurrentUser.getState().setUser(composeSession(id)!);
}

const events: TrialEventDetail[] = [];
const collect = (event: Event) => events.push((event as CustomEvent<TrialEventDetail>).detail);

beforeAll(() => {
  apiClient.defaults.adapter = mockAdapter;
});

beforeEach(() => {
  signOut();
  resetMockDb();
  events.length = 0;
  window.addEventListener('dt:trial-event', collect);
  vi.mocked(toast.info).mockClear();
  vi.mocked(toast.error).mockClear();
});

afterEach(() => {
  window.removeEventListener('dt:trial-event', collect);
  vi.restoreAllMocks();
});

describe('plan badge in the top bar (spec §8.5)', () => {
  it('says "Dùng thử · còn N ngày" in gold with an upgrade link when two days or less are left', async () => {
    signInAsMock(MOCK_EMAILS.trial);
    renderPage(<PlanBadge />);

    const label = await screen.findByText('Dùng thử · còn 2 ngày');
    expect(label.closest('span.rounded-full')?.className).toContain('border-[#E5A93C]');
    expect(screen.getByText('2 ngày')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Nâng cấp' })).toHaveAttribute('href', '/individual/pricing');
  });

  it('says "Gói Miễn phí" after the trial', async () => {
    signInAsMock(MOCK_EMAILS.free);
    renderPage(<PlanBadge />);

    expect(await screen.findByText('Gói Miễn phí')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Nâng cấp' })).toBeInTheDocument();
  });

  it('shows nothing to a paying learner', async () => {
    signInAsMock(MOCK_EMAILS.personal);
    renderPage(<PlanBadge />);

    await waitFor(() => expect(personalLearningService.getAccess()).resolves.toMatchObject({ mode: 'full' }));
    expect(screen.queryByTestId('plan-badge')).not.toBeInTheDocument();
  });

  it('counts an upgrade click with the plan mode and the place, and nothing personal', async () => {
    signInAsMock(MOCK_EMAILS.trial);
    renderPage(<PlanBadge />);

    fireEvent.click(await screen.findByRole('link', { name: 'Nâng cấp' }));

    const clicks = events.filter((event) => event.event === 'trial_upgrade_clicked');
    expect(clicks).toHaveLength(1);
    expect(clicks[0]).toMatchObject({ mode: 'trial', placement: 'topbar' });
    expect(Object.keys(clicks[0]).sort()).toEqual(['event', 'mode', 'placement', 'timestamp']);
  });
});

describe('trial dashboard: checklist (spec §8.6)', () => {
  beforeEach(() => {
    signInAsMock(MOCK_EMAILS.trial);
  });

  it('shows 2 of 4 steps for a learner who assessed and passed a course, with the next step in gold', async () => {
    renderPage(<LearnerDashboardPage />);

    expect(await screen.findByRole('heading', { name: /Bắt đầu trong 4 bước · 2\/4/ })).toBeInTheDocument();
    const steps = screen.getAllByRole('listitem').filter((item) => item.hasAttribute('data-state'));
    expect(steps.map((item) => item.getAttribute('data-state'))).toEqual(['done', 'next', 'done', 'open']);
    expect(within(steps[0]).getByText('Đã xong')).toBeInTheDocument();
    expect(within(steps[1]).getByRole('link', { name: 'Xem lộ trình' })).toHaveAttribute('href', '/personal/path');
    expect(within(steps[3]).getByRole('link', { name: 'Xem hồ sơ' })).toHaveAttribute('href', '/personal/progress');
  });

  it('gives a finished step no button', async () => {
    renderPage(<LearnerDashboardPage />);

    const steps = (await screen.findAllByRole('listitem')).filter((item) => item.hasAttribute('data-state'));
    expect(steps[2]).toHaveAttribute('data-state', 'done');
    expect(within(steps[2]).queryByRole('link')).not.toBeInTheDocument();
  });

  it('folds into one line the server remembers, and opens again from it', async () => {
    renderPage(<LearnerDashboardPage />);

    fireEvent.click(await screen.findByRole('button', { name: /Thu gọn/ }));

    expect(await screen.findByRole('button', { name: /Mở lại/ })).toBeInTheDocument();
    expect(screen.getByText(/Bắt đầu trong 4 bước/)).toBeInTheDocument();
    await waitFor(async () => expect((await personalLearningService.getAccess()).seen['checklist-hidden']).toBeDefined());

    fireEvent.click(screen.getByRole('button', { name: /Mở lại/ }));
    expect(await screen.findByRole('button', { name: /Thu gọn/ })).toBeInTheDocument();
  });

  it('dims a step that needs an earlier one and says which', async () => {
    signOut();
    resetMockDb();
    // A fresh trial has nothing done: step 2 to 4 wait for the entry assessment.
    await signInAsFreshTrial();

    renderPage(<LearnerDashboardPage />);

    const steps = (await screen.findAllByRole('listitem')).filter((item) => item.hasAttribute('data-state'));
    expect(steps.map((item) => item.getAttribute('data-state'))).toEqual(['next', 'locked', 'locked', 'locked']);
    expect(within(steps[1]).getByRole('button', { name: 'Làm việc 1 trước' })).toBeDisabled();
    expect(within(steps[3]).getByRole('button', { name: 'Làm việc 3 trước' })).toBeDisabled();
    expect(within(steps[0]).getByRole('link', { name: 'Bắt đầu' })).toHaveAttribute('href', '/personal/diagnostic');
  });

  it('reminds once with a toast when two days are left, and does not repeat it (spec §10)', async () => {
    renderPage(<LearnerDashboardPage />);

    await waitFor(() => expect(toast.info).toHaveBeenCalledWith('Còn 2 ngày dùng thử. Sau đó bạn vẫn giữ hồ sơ và kết quả.'));
    await waitFor(async () => expect((await personalLearningService.getAccess()).seen['notice-day5']).toBeDefined());
    expect(toast.info).toHaveBeenCalledTimes(1);

    renderPage(<LearnerDashboardPage />);
    await screen.findAllByRole('heading', { name: /Bắt đầu trong 4 bước/ });
    expect(toast.info).toHaveBeenCalledTimes(1);
  });
});

describe('trial course limit in the UI (AC-03, spec §8.8 and §8.9)', () => {
  beforeEach(() => {
    signInAsMock(MOCK_EMAILS.trial);
  });

  it('warns that opening a course will use a slot, while one is left', async () => {
    renderPage(<LearnerCourseDetailPage />, '/personal/courses/crs-M6-F', '/personal/courses/:id');

    const note = await screen.findByRole('note');
    expect(note).toHaveTextContent('Khóa này sẽ dùng 1 trong 3 lượt học thử (còn 1). Lượt chỉ được tính khi bạn hoàn thành bài đầu tiên.');
  });

  it('marks the courses that use a slot on the path and shows the slots as dots', async () => {
    renderPage(<LearnerPathPage />);

    expect(await screen.findByText(/Lượt học thử: đã dùng 2\/3/)).toBeInTheDocument();
    expect(screen.getAllByText('Đang học thử').length).toBeGreaterThanOrEqual(2);
  });

  it('replaces the learning button of a fourth course with an upgrade block, on the course page and in the classroom', async () => {
    const lesson = (await personalLearningService.getCourse('crs-M6-F')).modules[0].lessons[0];
    await personalLearningService.setLessonCompleted('crs-M6-F', lesson.id, true);

    const detail = renderPage(<LearnerCourseDetailPage />, '/personal/courses/crs-A5-I', '/personal/courses/:id');
    const block = await screen.findByRole('note');
    expect(block).toHaveTextContent('Bạn đã dùng hết 3 lượt học thử.');
    expect(within(block).getByRole('link', { name: 'Nâng cấp Plus' })).toHaveAttribute('href', '/individual/pricing');
    expect(within(block).getByRole('link', { name: 'Xem các khóa đang học thử' })).toHaveAttribute('href', '/personal/path');
    expect(screen.queryByRole('link', { name: /Bắt đầu học/ })).not.toBeInTheDocument();
    detail.unmount();

    renderPage(<LearnerClassroomPage />, '/personal/classroom/crs-A5-I', '/personal/classroom/:id');
    expect(await screen.findByText('Bạn đã dùng hết 3 lượt học thử.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Đánh dấu hoàn thành' })).not.toBeInTheDocument();
  });

  it('shows the slot a course uses with a chip, and no cost note', async () => {
    renderPage(<LearnerCourseDetailPage />, '/personal/courses/crs-A1-I', '/personal/courses/:id');

    expect(await screen.findByText('Đang học thử')).toBeInTheDocument();
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
  });
});

describe('trial entry assessment in the UI (BR-09, spec §8.10)', () => {
  it('shows the result with a one-time tip and no retake button, with the reason', async () => {
    signInAsMock(MOCK_EMAILS.trial);
    renderPage(<LearnerDiagnosticPage />);

    expect(await screen.findByText('Theo từng miền')).toBeInTheDocument();
    expect(screen.getByRole('note')).toHaveTextContent('Mỗi miền có mức yêu cầu của vị trí và mức hiện tại của bạn.');
    expect(screen.queryByRole('button', { name: /Làm lại/ })).not.toBeInTheDocument();
    expect(screen.getByText('Trong kỳ dùng thử, bài đánh giá làm được một lần.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Đóng gợi ý' }));
    await waitFor(() => expect(screen.queryByRole('note')).not.toBeInTheDocument());
    await waitFor(async () => expect((await personalLearningService.getAccess()).seen['tip-diagnostic-result']).toBeDefined());
  });
});

describe('Free plan in the UI (AC-05, AC-06, AC-07)', () => {
  beforeEach(() => {
    signInAsMock(MOCK_EMAILS.free);
  });

  it('opens the dashboard with what the trial left, from real data, and closes for good', async () => {
    renderPage(<LearnerDashboardPage />);

    const panel = await screen.findByRole('region', { name: 'Kỳ dùng thử đã kết thúc' });
    expect(await within(panel).findByText(/Đã đánh giá đầu vào ngày \d{2}\/\d{2}\/\d{4}/)).toBeInTheDocument();
    expect(await within(panel).findByText('Đã học 1 khóa, qua 1 bài đánh giá')).toBeInTheDocument();
    expect(within(panel).getByText('Mức đã tăng ở: Ứng dụng trí tuệ nhân tạo')).toBeInTheDocument();
    expect(within(panel).getByText('1 chứng nhận chờ cấp')).toBeInTheDocument();
    expect(within(panel).getByText('Hồ sơ năng lực và kết quả đánh giá')).toBeInTheDocument();
    expect(within(panel).getByText('Chứng nhận')).toBeInTheDocument();
    expect(within(panel).getByRole('link', { name: 'Nâng cấp Plus · 149.000đ/tháng' })).toHaveAttribute('href', '/individual/pricing');
    expect(events.filter((event) => event.event === 'trial_expired')).toHaveLength(1);
    expect(screen.queryByRole('heading', { name: /Bắt đầu trong 4 bước/ })).not.toBeInTheDocument();

    fireEvent.click(within(panel).getByRole('button', { name: 'Tiếp tục với gói Miễn phí' }));

    await waitFor(() => expect(screen.queryByRole('region', { name: 'Kỳ dùng thử đã kết thúc' })).not.toBeInTheDocument());
    await waitFor(async () => expect((await personalLearningService.getAccess()).seen['trial-ended']).toBeDefined());
  });

  it('lists a pending certificate without a code and with the way to issue it', async () => {
    renderPage(<LearnerCertificatesPage />);

    expect(await screen.findByText('Bạn có 1 chứng nhận chờ cấp. Nâng cấp để phát hành, không cần làm lại bài.')).toBeInTheDocument();
    expect(screen.getByText('Chờ cấp')).toBeInTheDocument();
    expect(screen.getByText(/Đạt ngày \d{2}\/\d{2}\/\d{4} · cấp khi nâng cấp gói/)).toBeInTheDocument();
    expect(screen.queryByText(/DTC-/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Xem chứng nhận' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Nâng cấp Plus' })[0]).toHaveAttribute('href', '/individual/pricing');
  });

  it('hides the retake button of the entry assessment and says from when it opens', async () => {
    renderPage(<LearnerDiagnosticPage />);

    expect(await screen.findByText('Theo từng miền')).toBeInTheDocument();
    expect(screen.getByText(/Làm lại từ \d{2}\/\d{2}\/\d{4}/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Làm lại|Đánh giá lại/ })).not.toBeInTheDocument();
  });

  it('keeps the whole path visible, says what the plan opens, and locks the courses outside the slots', async () => {
    renderPage(<LearnerPathPage />);

    expect(await screen.findByText('Gói Miễn phí: xem lộ trình và hồ sơ. Nâng cấp để học các khóa còn lại.')).toBeInTheDocument();
    expect(screen.getAllByText('Mở khi nâng cấp').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Đang học thử').length).toBe(1);
  });

  it('shows a course outside the slots as locked, and keeps notes readable on the finished one', async () => {
    renderPage(<LearnerCourseDetailPage />, '/personal/courses/crs-M6-I', '/personal/courses/:id');

    const block = await screen.findByRole('note');
    expect(block).toHaveTextContent('Gói Miễn phí không mở khóa mới.');
    expect(within(block).getByRole('link', { name: 'Nâng cấp Plus' })).toBeInTheDocument();
  });

  it('describes the plan with what stays and what opens on the plan page', async () => {
    renderPage(<LearnerSubscriptionPage />);

    expect(await screen.findByText('Gói Miễn phí', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Bạn vẫn có' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Mở khi nâng cấp' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Nâng cấp Plus' })).toHaveAttribute('href', '/individual/pricing');
  });
});

describe('trial plan page (spec §8.12)', () => {
  it('shows the end date, the days and the slots, and the upgrade as the main action', async () => {
    signInAsMock(MOCK_EMAILS.trial);
    renderPage(<LearnerSubscriptionPage />);

    expect(await screen.findByText('Gói Plus (dùng thử)')).toBeInTheDocument();
    expect(screen.getByText(/Hết hạn \d{2}\/\d{2}\/\d{4} · còn 2 ngày/)).toBeInTheDocument();
    expect(screen.getByText('Lượt học thử 2/3')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Nâng cấp ngay' })).toHaveAttribute('href', '/individual/pricing');
    expect(screen.getByRole('link', { name: 'Xem bảng giá' })).toBeInTheDocument();
    expect(screen.getByText('Sau khi hết hạn: giữ hồ sơ, kết quả, ghi chú; khóa bài học mới.')).toBeInTheDocument();
  });
});

describe('personal@ sees nothing of the trial (AC-10)', () => {
  beforeEach(() => {
    signInAsMock(MOCK_EMAILS.personal);
  });

  it('has no checklist, no ended panel and no tips on its dashboard and path', async () => {
    renderPage(<LearnerDashboardPage />);
    expect(await screen.findByText(/Mục tiêu: Marketing/)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Bắt đầu trong 4 bước/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Kỳ dùng thử đã kết thúc' })).not.toBeInTheDocument();
    expect(toast.info).not.toHaveBeenCalled();
  });

  it('keeps its plan page and certificates as they were', async () => {
    renderPage(<LearnerSubscriptionPage />);
    expect(await screen.findByText('Đổi gói')).toBeInTheDocument();
    expect(screen.queryByText(/dùng thử/i)).not.toBeInTheDocument();
  });

  it('keeps issued certificates with a code and no "chờ cấp" banner', async () => {
    renderPage(<LearnerCertificatesPage />);
    expect(await screen.findByText(/DTC-\d{8}-M6-F/)).toBeInTheDocument();
    expect(screen.queryByText(/chờ cấp/)).not.toBeInTheDocument();
  });
});
