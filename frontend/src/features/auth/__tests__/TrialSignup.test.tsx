import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// The sign-up runs against the mock layer, so it must be on before the app modules load.
vi.hoisted(() => {
  vi.stubEnv('VITE_USE_MOCK', 'true');
});

import { useCurrentUser } from '@/hooks/use-current-user';
import { INDIVIDUAL_TRIAL } from '@/lib/plans';
import { findUserByEmail, resetMockDb } from '@/services/mock/mock-store';
import { getPersonalState } from '@/services/mock/server/personal/personal-store';
import { MOCK_EMAILS, signInAsMock, signOut } from '@/test/session';
import type { TrialEventDetail } from '../../experience/individual-trial/individual-trial-tracker';
import { IndividualRegisterPage } from '../pages/IndividualRegisterPage';

beforeAll(async () => {
  await import('@/services/mock/server/mock-adapter');
});

afterAll(() => {
  vi.unstubAllEnvs();
});

function Where() {
  const location = useLocation();
  return <p data-testid="where">{location.pathname}</p>;
}

function renderRegister(search: string) {
  cleanup();
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/individual/register${search}`]}>
        <Routes>
          <Route path="/individual/register" element={<IndividualRegisterPage />} />
          <Route path="*" element={<Where />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const type = (label: string | RegExp, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const PASSWORD = 'MatKhauTot9999';

function fillForm(email: string) {
  type('Họ và tên', 'Nguyễn Văn Thử');
  type(/Email/, email);
  type('Mật khẩu', PASSWORD);
  type('Xác nhận mật khẩu', PASSWORD);
  fireEvent.click(screen.getByRole('checkbox'));
}

const events: TrialEventDetail[] = [];
const collect = (event: Event) => events.push((event as CustomEvent<TrialEventDetail>).detail);

beforeEach(() => {
  signOut();
  resetMockDb();
  sessionStorage.clear();
  events.length = 0;
  window.addEventListener('dt:trial-event', collect);
});

afterEach(() => {
  window.removeEventListener('dt:trial-event', collect);
});

describe('trial sign-up page (spec §8.3)', () => {
  it('opens without a plan and presents the trial instead of a purchase', async () => {
    renderRegister('?trial=1&source=pricing');

    expect(await screen.findByRole('heading', { name: 'Tạo tài khoản dùng thử' })).toBeInTheDocument();
    expect(screen.getByText(`Dùng thử ${INDIVIDUAL_TRIAL.days} ngày`)).toBeInTheDocument();
    expect(screen.getByText('Học theo lộ trình của riêng bạn. Không cần thẻ, không tự gia hạn.')).toBeInTheDocument();
    const terms = screen.getByRole('region', { name: 'Quyền lợi dùng thử' });
    expect(terms).toHaveTextContent('7 ngày quyền gói Plus');
    expect(terms).toHaveTextContent('Học trọn 3 khóa đầu trong lộ trình');
    expect(terms).toHaveTextContent('Hết hạn: giữ hồ sơ và kết quả, chuyển về gói Miễn phí');
    expect(screen.queryByText('Gói đã chọn')).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Tiến trình mua gói' })).not.toBeInTheDocument();
    expect(screen.getByText(/DigiTalent gửi email nhắc trong kỳ dùng thử; bạn có thể tắt bất cứ lúc nào/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tạo tài khoản và bắt đầu 7 ngày dùng thử/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Xem bảng giá' })).toHaveAttribute('href', '/individual/pricing');
  });

  it('shows the position carried by the link, and ignores a wrong one without an error', async () => {
    renderRegister('?trial=1&position=ACCOUNTANT&source=try');
    expect(await screen.findByText(/Vị trí: Kế toán/)).toBeInTheDocument();

    renderRegister('?trial=1&position=NOT_A_POSITION');
    expect(await screen.findByRole('heading', { name: 'Tạo tài khoản dùng thử' })).toBeInTheDocument();
    expect(screen.queryByText(/Vị trí:/)).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('takes the position of the quick try from session storage and says so', async () => {
    sessionStorage.setItem(
      'dt-try-handoff',
      JSON.stringify({ positionCode: 'HR', completedAt: new Date().toISOString(), correct: 5, total: 6 }),
    );

    renderRegister('?trial=1&source=try');

    expect(await screen.findByText('Vị trí: Nhân sự · từ bài thử')).toBeInTheDocument();
  });

  it('tracks one view with the source and nothing personal', async () => {
    renderRegister('?trial=1&source=landing');
    await screen.findByRole('heading', { name: 'Tạo tài khoản dùng thử' });

    const views = events.filter((event) => event.event === 'trial_signup_viewed');
    expect(views).toHaveLength(1);
    expect(views[0].source).toBe('landing');
    expect(Object.keys(views[0]).sort()).toEqual(['event', 'source', 'timestamp']);
  });

  it('creates a trial account with the carried position and the quick-try score, then clears the hand-over (AC-01)', async () => {
    sessionStorage.setItem(
      'dt-try-handoff',
      JSON.stringify({ positionCode: 'ACCOUNTANT', completedAt: '2026-10-06T08:00:00.000Z', correct: 5, total: 6 }),
    );
    renderRegister('?trial=1&position=ACCOUNTANT&source=try');
    await screen.findByRole('heading', { name: 'Tạo tài khoản dùng thử' });

    fillForm('thu.nghiem@example.vn');
    fireEvent.click(screen.getByRole('button', { name: /Tạo tài khoản và bắt đầu/ }));

    // The registration submits and directs the learner to the verification step:
    await waitFor(() => expect(screen.getByTestId('where')).toHaveTextContent('/individual/register/verify'), { timeout: 10000 });
    const stored = findUserByEmail('thu.nghiem@example.vn')!;
    expect(stored.subscription).toMatchObject({ planCode: 'IND_PLUS', status: 'trialing' });
    expect(stored.onboardingStatus).toBe('setup');
    const state = getPersonalState(stored.id);
    expect(state.targetCode).toBe('ACCOUNTANT');
    expect(state.tryOrientation).toMatchObject({ positionCode: 'ACCOUNTANT', correct: 5, total: 6 });
    expect(sessionStorage.getItem('dt-try-handoff')).toBeNull();

    const created = events.filter((event) => event.event === 'trial_account_created');
    expect(created).toHaveLength(1);
    expect(created[0]).toMatchObject({ source: 'try', positionCode: 'ACCOUNTANT' });
    expect(JSON.stringify(created[0])).not.toContain('thu.nghiem');
  });

  it('does not carry the quick-try score to a different position than the one in the link', async () => {
    sessionStorage.setItem(
      'dt-try-handoff',
      JSON.stringify({ positionCode: 'HR', completedAt: '2026-10-06T08:00:00.000Z', correct: 5, total: 6 }),
    );
    renderRegister('?trial=1&position=MARKETING&source=pricing');
    await screen.findByRole('heading', { name: 'Tạo tài khoản dùng thử' });

    fillForm('khac.vi.tri@example.vn');
    fireEvent.click(screen.getByRole('button', { name: /Tạo tài khoản và bắt đầu/ }));

    await waitFor(() => expect(screen.getByTestId('where')).toHaveTextContent('/individual/register/verify'), { timeout: 10000 });
    const state = getPersonalState(findUserByEmail('khac.vi.tri@example.vn')!.id);
    expect(state.targetCode).toBe('MARKETING');
    expect(state.tryOrientation).toBeNull();
  });

  it('answers an email that already has an account with a link to sign in (AC-09)', async () => {
    renderRegister('?trial=1&source=pricing');
    await screen.findByRole('heading', { name: 'Tạo tài khoản dùng thử' });

    fillForm(MOCK_EMAILS.employee);
    fireEvent.click(screen.getByRole('button', { name: /Tạo tài khoản và bắt đầu/ }));

    const alert = await screen.findByRole('alert', {}, { timeout: 10000 });
    expect(alert).toHaveTextContent('Email này đã có tài khoản');
    expect(alert.querySelector('a')).toHaveAttribute('href', '/login');
    expect(events.some((event) => event.event === 'trial_account_created')).toBe(false);
  });

  it('rejects form submission when password and confirm password do not match', async () => {
    renderRegister('?trial=1&source=pricing');
    await screen.findByRole('heading', { name: 'Tạo tài khoản dùng thử' });

    type('Họ và tên', 'Nguyễn Văn Thử');
    type(/Email/, 'test.mismatch@example.vn');
    type('Mật khẩu', 'MatKhau123456!');
    type('Xác nhận mật khẩu', 'KhongKhop123456!');
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /Tạo tài khoản và bắt đầu/ }));

    expect(await screen.findByText('Mật khẩu xác nhận không khớp')).toBeInTheDocument();
  });

  it('sends a signed-in learner to where they belong instead of starting another trial (BR-02)', async () => {
    signInAsMock(MOCK_EMAILS.personal);

    renderRegister('?trial=1&source=pricing');

    await waitFor(() => expect(screen.getByTestId('where')).toHaveTextContent('/personal/dashboard'));
    expect(useCurrentUser.getState().user?.email).toBe(MOCK_EMAILS.personal);
    expect(events.some((event) => event.event === 'trial_signup_viewed')).toBe(false);
  });
});

describe('purchase sign-up stays as it was', () => {
  it('still sends a visit without a plan back to pricing', async () => {
    renderRegister('');

    await waitFor(() => expect(screen.getByTestId('where')).toHaveTextContent('/individual/pricing'));
  });

  it('treats trial=0 like a missing flag', async () => {
    renderRegister('?trial=0');

    await waitFor(() => expect(screen.getByTestId('where')).toHaveTextContent('/individual/pricing'));
  });
});
