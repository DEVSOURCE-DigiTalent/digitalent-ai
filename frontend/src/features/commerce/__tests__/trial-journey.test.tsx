import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, useRoutes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// The journey runs against the mock layer, so it must be on before the app modules load.
vi.hoisted(() => {
  vi.stubEnv('VITE_USE_MOCK', 'true');
});

import { routes } from '../../../app/router';
import type { TrialEventDetail } from '../../experience/individual-trial/individual-trial-tracker';
import { useCurrentUser } from '../../../hooks/use-current-user';
import { INDIVIDUAL_TRIAL } from '../../../lib/plans';
import { findUserByEmail, resetMockDb, updateDb } from '../../../services/mock/mock-store';
import { personalLearningService as api } from '../../../services/personal-learning.service';
import { ENTRY_QUESTIONS, questionsOfDomain } from '../../../services/mock/server/personal/question-bank';

/**
 * Reverse trial, whole journey (spec AC-01, AC-04, AC-05, AC-08): quick try → trial sign-up → onboarding → entry
 * assessment → one course passed → the trial ends → Free plan → upgrade by QR payment → certificate issued.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const START = new Date('2026-10-06T08:00:00.000Z');
const EMAIL = 'hanh.trinh@example.vn';
const PASSWORD = 'MatKhauTot9999';

beforeAll(async () => {
  await import('../../../services/mock/server/mock-adapter');
});

afterAll(() => {
  vi.unstubAllEnvs();
});

const events: TrialEventDetail[] = [];
const collect = (event: Event) => events.push((event as CustomEvent<TrialEventDetail>).detail);
const eventsNamed = (name: string) => events.filter((event) => event.event === name);

beforeEach(() => {
  events.length = 0;
  window.addEventListener('dt:trial-event', collect);
});

afterEach(() => {
  vi.useRealTimers();
  window.removeEventListener('dt:trial-event', collect);
});

function AppRoutes() {
  return useRoutes(routes);
}

/** Renders the app at `path`, replacing any app a previous call left on screen. */
function renderApp(path: string) {
  cleanup();
  // Same cache lifetime as the app (app/providers.tsx): pages keep what they read for five minutes.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const type = (label: string | RegExp, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const click = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }));
const heading = (name: string | RegExp) => screen.findByRole('heading', { name }, { timeout: 10000 });

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  resetMockDb();
  useCurrentUser.getState().clearUser();
});

async function completeAllLessons(courseId: string) {
  for (const lesson of (await api.getCourse(courseId)).modules.flatMap((module) => module.lessons)) {
    await api.setLessonCompleted(courseId, lesson.id, true);
  }
}

describe('individual reverse trial, from the quick try to a paid plan', () => {
  it('keeps what the learner did across the trial, the Free plan and the upgrade', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(START);

    // 1. Quick try: Kế toán, a survey answered right, one lesson. The result offers a 7-day trial.
    renderApp('/individual/try');
    fireEvent.click(await screen.findByRole('radio', { name: /Kế toán/ }));
    click(/Tiếp tục với Kế toán/);
    for (let index = 0; index < 6; index += 1) {
      const question = screen.getByRole('group', { name: new RegExp(`Câu ${index + 1}`) });
      fireEvent.click(within(question).getAllByRole('radio')[1]);
      click(index === 5 ? /Xem lộ trình mẫu/ : /Câu tiếp/);
    }
    click(/Học bài miễn phí/);
    fireEvent.click(screen.getByRole('radio', { name: /Đối chiếu dữ liệu nguồn/ }));
    click(/Xem phản hồi/);
    fireEvent.click(screen.getByRole('radio', { name: /Nguồn và kỳ dữ liệu/ }));
    click(/Hoàn thành bài thử/);
    expect(await heading(/Bạn đã hoàn thành phần trải nghiệm/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: /Lưu kết quả và học tiếp 7 ngày miễn phí/ }));

    // 2. Trial sign-up with the position carried over.
    await heading('Tạo tài khoản dùng thử');
    expect(screen.getByText('Vị trí: Kế toán · từ bài thử')).toBeInTheDocument();
    type('Họ và tên', 'Nguyễn Thị Hành Trình');
    type(/Email/, EMAIL);
    type('Mật khẩu', PASSWORD);
    fireEvent.click(screen.getByRole('checkbox'));
    click(/Tạo tài khoản và bắt đầu 7 ngày dùng thử/);

    // 3. Onboarding knows the position and the trial dates; no purchase step is shown.
    await heading('Sẵn sàng bắt đầu lộ trình học');
    const trialEnd = new Date(START.getTime() + INDIVIDUAL_TRIAL.days * DAY_MS);
    expect(screen.getByText(/Kỳ dùng thử của bạn: đến 13\/10\/2026 \(7 ngày\)/i)).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Tiến trình mua gói' })).not.toBeInTheDocument();
    expect(trialEnd.toISOString()).toBe(findUserByEmail(EMAIL)!.subscription!.trialEndsAt);
    click(/Vào tổng quan/);

    // The email still has to be verified before the workspace opens.
    await heading('Xác minh email của bạn');
    updateDb((db) => {
      db.users.find((user) => user.email === EMAIL)!.emailVerified = true;
    });
    click('Tôi đã xác minh email, tiếp tục');

    // 4. Dashboard of a new trial: plan label, empty checklist, the entry assessment as the next step.
    await heading('Tổng quan học tập');
    expect(await screen.findByText('Dùng thử · còn 7 ngày')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: /Bắt đầu trong 4 bước · 0\/4/ })).toBeInTheDocument();
    expect(screen.getByText(/Mục tiêu: Kế toán/)).toBeInTheDocument();

    // 5. The assessment intro mentions the quick try (AC-01).
    fireEvent.click(screen.getByRole('link', { name: 'Bắt đầu' }));
    expect(await screen.findByText(/Ở bài thử nhanh bạn đúng 6\/6 câu định hướng/)).toBeInTheDocument();
    expect(screen.getByText(/Bài này 18 câu, đo mức chính xác ở 6 miền/)).toBeInTheDocument();

    // The assessment, answered from level 0 so the whole path is open, then one course passed (AC-04).
    await api.submitDiagnostic(Object.fromEntries(ENTRY_QUESTIONS.map((q) => [q.id, (q.correctIndex + 1) % q.options.length])));
    await completeAllLessons('crs-M6-F');
    const outcome = await api.submitAssessment('crs-M6-F', Object.fromEntries(questionsOfDomain(6).map((q) => [q.id, q.correctIndex])));
    expect(outcome).toMatchObject({ passed: true, certificatePending: true, certificateId: null });
    const [pending] = await api.getCertificates();
    expect(pending).toMatchObject({ status: 'PENDING_UPGRADE', code: null, issuedAt: null });

    // 6. Day 8: the trial has ended. The account is on the Free plan and nothing was lost (AC-05).
    vi.setSystemTime(START.getTime() + 8 * DAY_MS);
    renderApp('/personal/dashboard');
    const panel = await screen.findByRole('region', { name: 'Kỳ dùng thử đã kết thúc' }, { timeout: 10000 });
    expect(await within(panel).findByText('Đã học 1 khóa, qua 1 bài đánh giá')).toBeInTheDocument();
    expect(within(panel).getByText('1 chứng nhận chờ cấp')).toBeInTheDocument();
    expect(screen.getByText('Gói Miễn phí')).toBeInTheDocument();
    expect(findUserByEmail(EMAIL)!.subscription).toMatchObject({ planCode: 'IND_FREE', status: 'active' });
    expect((await api.getProgress()).assessmentsPassed).toBe(1);

    // 7. Upgrade: price list (no trial strip for a signed-in learner), Plus, QR payment, straight back to the workspace.
    fireEvent.click(within(panel).getByRole('link', { name: /Nâng cấp Plus · 149\.000đ\/tháng/ }));
    await heading('Chọn gói phù hợp với mục tiêu của bạn.');
    expect(screen.queryByRole('complementary', { name: 'Dùng thử' })).not.toBeInTheDocument();
    fireEvent.click(within(screen.getByRole('article', { name: 'Gói Plus' })).getByRole('button', { name: 'Chọn gói Plus' }));
    await heading('Thanh toán');
    expect(await screen.findByText(/Nâng cấp giữ nguyên hồ sơ, tiến độ và các chứng nhận chờ cấp/)).toBeInTheDocument();
    await heading('Quét mã để thanh toán');
    click('Tôi đã quét mã và thanh toán');
    await heading('Thanh toán thành công');
    expect(screen.getByText(/Hồ sơ, tiến độ học và các chứng nhận chờ cấp được giữ nguyên/)).toBeInTheDocument();
    click('Vào không gian học tập');

    // 8. Paying now: no onboarding, no trial label, the certificate issued on the day of payment (AC-08).
    await heading('Tổng quan học tập');
    await waitFor(() => expect(screen.queryByTestId('plan-badge')).not.toBeInTheDocument(), { timeout: 10000 });
    expect(screen.queryByRole('region', { name: 'Kỳ dùng thử đã kết thúc' })).not.toBeInTheDocument();
    expect(findUserByEmail(EMAIL)).toMatchObject({ onboardingStatus: undefined });
    expect(findUserByEmail(EMAIL)!.subscription).toMatchObject({ planCode: 'IND_PLUS', status: 'active' });
    const [issued] = await api.getCertificates();
    expect(issued.status).toBe('ISSUED');
    expect(issued.code).toBe('DTC-20261014-M6-F');
    expect(issued.issuedAt).toBe(new Date(START.getTime() + 8 * DAY_MS).toISOString());
    expect((await api.getAccess()).mode).toBe('full');

    // The funnel: each step of the journey was counted once, with no email, name or answer in any payload.
    expect(eventsNamed('trial_signup_viewed')).toHaveLength(1);
    expect(eventsNamed('trial_account_created')[0]).toMatchObject({ source: 'try', positionCode: 'ACCOUNTANT' });
    expect(eventsNamed('trial_expired')).toHaveLength(1);
    expect(eventsNamed('trial_upgrade_clicked')[0]).toMatchObject({ mode: 'free', placement: 'trial-ended' });
    expect(eventsNamed('trial_converted')).toHaveLength(1);
    expect(eventsNamed('trial_converted')[0]).toMatchObject({ mode: 'free', planCode: 'IND_PLUS', cycle: 'year' });
    const lifecycle = events.filter((event) => event.event.startsWith('trial_') || event.event.startsWith('free_'));
    expect(JSON.stringify(lifecycle)).not.toMatch(/hanh\.trinh|Hành Trình|MatKhau/);
  });
});
