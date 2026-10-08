import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, useRoutes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// These journeys run against the mock layer, so it must be on before the app modules load.
vi.hoisted(() => {
  vi.stubEnv('VITE_USE_MOCK', 'true');
});

import { routes } from '../../../app/router';
import { useCurrentUser } from '../../../hooks/use-current-user';
import { mockCheckoutService } from '../../../services/mock/mock-checkout.service';
import { mockInvitationService } from '../../../services/mock/mock-invitation.service';
import { mockOnboardingService } from '../../../services/mock/mock-onboarding.service';
import { mockRegistrationService } from '../../../services/mock/mock-registration.service';
import { resetMockDb, updateDb } from '../../../services/mock/mock-store';

beforeAll(async () => {
  // Preload mock adapter and rest server handlers to avoid cold dynamic import under parallel suite runs.
  await import('../../../services/mock/server/mock-adapter');
});

afterAll(() => {
  vi.unstubAllEnvs();
});

function AppRoutes() {
  return useRoutes(routes);
}

/** Renders the app at `path`, replacing any app a previous call left on screen. */
function renderApp(path: string) {
  cleanup();
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const VALID_PASSWORD = 'MatKhauTot9999';

const type = (label: string | RegExp, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
const click = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }));
const heading = (name: string | RegExp) => screen.findByRole('heading', { name }, { timeout: 10000 });

function fillOwnerForm(email: string, password = VALID_PASSWORD) {
  type('Họ và tên', 'Nguyễn Văn Chủ');
  type(/Email/, email);
  type('Mật khẩu', password);
  fireEvent.click(screen.getByRole('checkbox'));
}

beforeEach(() => {
  localStorage.clear();
  resetMockDb();
  useCurrentUser.getState().clearUser();
});

describe('enterprise purchase, contract signing and organization setup (FLOW-01 & B2B Contract)', () => {
  it('takes a buyer through pricing, account creation, QR payment, e-contract signing and setup wizard', async () => {
    renderApp('/business/pricing');

    // 1. Pricing → pick Pro
    await heading('Chọn gói cho đội ngũ của bạn.');
    fireEvent.click(
      within(screen.getByRole('article', { name: 'Gói Pro' })).getByRole('button', { name: 'Chọn gói Pro' }),
    );

    // 2. Account registration (3 fields + terms)
    await heading('Tạo tài khoản doanh nghiệp');
    expect(screen.getByText(/Pro · 50 người dùng/)).toBeInTheDocument();

    fillOwnerForm('chu@acme.vn');
    click('Tạo tài khoản và thanh toán');

    // 3. B2B E-Contract Signing step (Step 3, before checkout)
    await heading('Hợp đồng dịch vụ điện tử B2B');
    type('Tên tổ chức / Doanh nghiệp *', 'Công ty Acme');
    type('Mã số thuế (MST) *', '0101234567');
    type('Chức vụ người ký *', 'Giám đốc');
    type('Địa chỉ trụ sở đăng ký *', 'Hà Nội');
    type('Họ tên người đại diện ký *', 'Nguyễn Văn Chủ');
    fireEvent.click(screen.getByRole('checkbox'));
    click('Gửi mã OTP');
    await screen.findByPlaceholderText('Nhập mã OTP 6 số');
    fireEvent.change(screen.getByPlaceholderText('Nhập mã OTP 6 số'), { target: { value: '686868' } });
    click('Xác nhận OTP và Ký hợp đồng');

    // 4. Checkout → QR payment (Step 4)
    await heading('Quét mã để thanh toán');
    expect(screen.getAllByText(/19\.090|1\.990/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Công ty Acme/)).toBeInTheDocument();
    click('Tôi đã quét mã và thanh toán');
    await heading('Thanh toán thành công');
    click('Tiến hành thiết lập tổ chức');

    // 5. Setup wizard (Step 5)
    await heading('Thông tin tổ chức');
    expect(await screen.findByDisplayValue('Công ty Acme')).toBeInTheDocument();
    type('Ngành hoạt động', 'Dịch vụ');
    type('Quy mô', '21-100');
    click('Lưu và tiếp tục');

    await heading('Cấp bậc nhân sự (G1–G3)');
    click('Lưu và tiếp tục');

    await heading('Phòng ban và nhóm');
    click('Bỏ qua bước này');

    await heading('Vị trí công việc');
    fireEvent.click(screen.getByRole('checkbox', { name: /Kế toán/ }));
    click(/Lưu 1 vị trí và tiếp tục/);

    await heading('Mời nhân viên');
    type('Họ tên', 'Lê An');
    type(/Email/, 'an@acme.vn');
    click('Thêm vào danh sách');
    click('Gửi 1 lời mời');
    expect(await screen.findByText('Đã gửi 1 lời mời.')).toBeInTheDocument();
    click('Tiếp tục');

    // 6. Completion checklist & enterprise workspace
    await heading('Sẵn sàng bắt đầu');
    expect(await screen.findByText('Công ty Acme')).toBeInTheDocument();
    expect(await screen.findByText('Đã mời 1 người')).toBeInTheDocument();

    // Email verified unlocks workspace entry
    updateDb((db) => {
      const u = db.users.find((x) => x.email === 'chu@acme.vn');
      if (u) u.emailVerified = true;
    });

    const enterButton = await screen.findByRole('button', { name: 'Vào hệ thống' });
    expect(enterButton).toBeEnabled();
    fireEvent.click(enterButton);

    expect(await screen.findByTestId('enterprise-layout', {}, { timeout: 10000 })).toBeInTheDocument();
    expect(await heading('Tổng quan tổ chức')).toBeInTheDocument();
    await waitFor(() => {
      expect(useCurrentUser.getState().user?.onboardingStatus).toBeUndefined();
    });
  });

  it('T1: sends a buyer who opens registration without a plan to the pricing page', async () => {
    renderApp('/business/register');
    await heading('Chọn gói cho đội ngũ của bạn.');
    expect(screen.getByText(/Chọn một gói để tiếp tục đăng ký/)).toBeInTheDocument();
  });

  it('T2: sends a buyer with invalid plan code to the pricing page', async () => {
    renderApp('/business/register?plan=KHONG_HOP_LE');
    await heading('Chọn gói cho đội ngũ của bạn.');
    expect(screen.getByText(/Chọn một gói để tiếp tục đăng ký/)).toBeInTheDocument();
  });

  it('T21: shows validation errors for invalid email, short password, and unchecked terms', async () => {
    renderApp('/business/register?plan=ENT_STARTER&seats=5&cycle=month');
    await heading('Tạo tài khoản doanh nghiệp');

    type(/Email/, 'khong-hop-le');
    type('Mật khẩu', 'ngan');
    click('Tạo tài khoản và thanh toán');

    expect(await screen.findByText('Email không hợp lệ')).toBeInTheDocument();
    expect(screen.getByText('Mật khẩu cần ít nhất 12 ký tự')).toBeInTheDocument();
    expect(screen.getByText('Bạn cần đồng ý với điều khoản để tiếp tục')).toBeInTheDocument();
    expect(useCurrentUser.getState().user).toBeNull();
  });

  it('T4: tells a buyer when the email is already registered and directs to login', async () => {
    await mockRegistrationService.registerIndividual({
      fullName: 'Người cũ',
      email: 'chu@acme.vn',
      password: VALID_PASSWORD,
      plan: { planCode: 'IND_PLUS', seats: 1, cycle: 'month' },
    });

    renderApp('/business/register?plan=ENT_STARTER&seats=5&cycle=month');
    await heading('Tạo tài khoản doanh nghiệp');

    fillOwnerForm('chu@acme.vn');
    click('Tạo tài khoản và thanh toán');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Email này đã có tài khoản. Đăng nhập để tiếp tục.',
    );
    expect(useCurrentUser.getState().user).toBeNull();
  });
});

describe('payment outcomes & states (ENT-ONB-03, T9, T10, T11)', () => {
  async function signUpOwnerAtCheckout() {
    await mockRegistrationService.registerEnterprise({
      fullName: 'Chủ',
      email: 'chu@acme.vn',
      password: VALID_PASSWORD,
      plan: { planCode: 'ENT_PRO', seats: 10, cycle: 'month' },
    });
    updateDb((db) => {
      const u = db.users.find((x) => x.email === 'chu@acme.vn');
      if (u) {
        u.contractSigned = true;
        u.onboardingStatus = 'payment';
      }
    });
    renderApp('/login');
    type(/Email/, 'chu@acme.vn');
    type('Mật khẩu', VALID_PASSWORD);
    click('Đăng nhập');
    await heading('Quét mã để thanh toán');
  }

  it('T10: lands a new owner on checkout after signing in, and offers a fresh QR after a failure', async () => {
    await signUpOwnerAtCheckout();
    click('Giả lập thất bại');

    await heading('Thanh toán không thành công');
    fireEvent.click(screen.getByRole('link', { name: 'Thử thanh toán lại' }));
    await heading('Quét mã để thanh toán');
  });

  it('T9: waits for the bank on a pending payment and completes when it confirms', async () => {
    await signUpOwnerAtCheckout();
    click('Giả lập chờ xử lý');

    await heading('Đang chờ ngân hàng xác nhận');
    click('Giả lập: ngân hàng đã xác nhận');
    await heading('Thanh toán thành công');
  });

  it('T11: handles simulated QR expiration and generates fresh code', async () => {
    await signUpOwnerAtCheckout();
    click('Giả lập hết hạn');

    expect(await screen.findByText('Mã thanh toán đã hết hạn')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: 'Tạo mã thanh toán mới' }));
    expect(await heading('Quét mã để thanh toán')).toBeInTheDocument();
  });

  it('keeps an owner who has not paid out of the portal and the wizard', async () => {
    await signUpOwnerAtCheckout();
    renderApp('/enterprise/overview');
    await heading('Quét mã để thanh toán');

    renderApp('/setup');
    await heading('Quét mã để thanh toán');
  });

  it('T12: directs enterprise owner to contract step when signing in before signing contract', async () => {
    await mockRegistrationService.registerEnterprise({
      fullName: 'Chủ 2',
      email: 'chu2@acme.vn',
      password: VALID_PASSWORD,
      plan: { planCode: 'ENT_PRO', seats: 10, cycle: 'month' },
    });

    renderApp('/login');
    type(/Email/, 'chu2@acme.vn');
    type('Mật khẩu', VALID_PASSWORD);
    click('Đăng nhập');

    await heading('Hợp đồng dịch vụ điện tử B2B');
  });
});

describe('individual sign-up and onboarding (FLOW-05, T19)', () => {
  it('T1: sends a visitor without a plan to the pricing page first', async () => {
    renderApp('/individual/register');
    await heading('Chọn gói phù hợp với mục tiêu của bạn.');
  });

  it('T19: sends a paid individual plan through checkout, then to personal onboarding and dashboard', async () => {
    renderApp('/individual/register?plan=IND_PLUS&seats=1&cycle=month');
    await heading('Tạo tài khoản cá nhân');

    type('Họ và tên', 'Bùi Cá Nhân');
    type(/Email/, 'ca@nhan.vn');
    type('Mật khẩu', VALID_PASSWORD);
    fireEvent.click(screen.getByRole('checkbox'));
    click('Tạo tài khoản và thanh toán');

    await heading('Quét mã để thanh toán');
    click('Tôi đã quét mã và thanh toán');
    await heading('Thanh toán thành công');
    click('Bắt đầu thiết lập lộ trình');

    // Personal Onboarding step
    await heading('Chọn vị trí mục tiêu nghề nghiệp');
    click('Xác nhận và tiếp tục');

    await heading('Sẵn sàng bắt đầu lộ trình học');

    // Email verified unlocks workspace entry
    updateDb((db) => {
      const u = db.users.find((x) => x.email === 'ca@nhan.vn');
      if (u) u.emailVerified = true;
    });
    const cur = useCurrentUser.getState().user;
    if (cur) useCurrentUser.getState().setUser({ ...cur, emailVerified: true });

    click('Vào khu cá nhân');

    expect(await screen.findByTestId('personal-layout', {}, { timeout: 10000 })).toBeInTheDocument();
    expect(useCurrentUser.getState().user?.subscription?.planCode).toBe('IND_PLUS');
  });
});

describe('employee activation (FLOW-02)', () => {
  async function inviteEmployee() {
    await mockRegistrationService.registerEnterprise({
      fullName: 'Chủ',
      email: 'chu@acme.vn',
      password: VALID_PASSWORD,
    });
    updateDb((db) => {
      const u = db.users.find((x) => x.email === 'chu@acme.vn');
      if (u) {
        u.contractSigned = true;
        u.onboardingStatus = 'payment';
      }
    });
    const owner = await import('../../../services/mock/mock-auth.service');
    const login = await owner.mockAuthService.login({ email: 'chu@acme.vn', password: VALID_PASSWORD });
    localStorage.setItem('accessToken', login.data.data!.accessToken);
    const order = (await mockCheckoutService.createOrder({ planCode: 'ENT_PRO', seats: 10, cycle: 'month' })).data.data!;
    await mockCheckoutService.confirmPayment(order.id, 'paid');
    await mockOnboardingService.saveOrganization({ name: 'Công ty Acme', industry: 'Dịch vụ', size: '21-100' });
    const result = (
      await mockOnboardingService.inviteMembers([{ email: 'an@acme.vn', fullName: 'Lê An', role: 'EMPLOYEE' }])
    ).data.data!;
    localStorage.clear();
    return result.created[0].token!;
  }

  it('lets an invited employee set a password and land in their workspace', async () => {
    const token = await inviteEmployee();
    renderApp(`/activate/${token}`);

    await heading('Kích hoạt tài khoản');
    expect(await screen.findByText(/Công ty Acme/)).toBeInTheDocument();
    expect(screen.getByDisplayValue('an@acme.vn')).toHaveAttribute('readonly');
    type('Mật khẩu', 'MatKhauMoi6789');
    type('Nhập lại mật khẩu', 'MatKhauMoi6789');
    click('Kích hoạt và vào hệ thống');

    expect(await heading('Bài test đánh giá năng lực hiện tại')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: 'Vào trang cá nhân' }));

    expect(await screen.findByTestId('enterprise-layout', {}, { timeout: 10000 })).toBeInTheDocument();
    expect(await heading('Bảng phát triển của tôi')).toBeInTheDocument();
  });

  it('refuses a link that was already used or never existed', async () => {
    const token = await inviteEmployee();
    await mockInvitationService.activate({ token, fullName: 'An', password: 'MatKhauMoi6789' });

    renderApp(`/activate/${token}`);
    expect(await screen.findByText('Lời mời này đã được kích hoạt.')).toBeInTheDocument();

    renderApp('/activate/khong-co');
    expect(await screen.findByText('Liên kết mời không hợp lệ hoặc đã hết hạn.')).toBeInTheDocument();
  });
});

describe('forgotten password (AUTH-06)', () => {
  it('resets the password from the emailed link and signs in with the new one', async () => {
    await mockRegistrationService.registerIndividual({
      fullName: 'A',
      email: 'ca@nhan.vn',
      password: VALID_PASSWORD,
      plan: { planCode: 'IND_PLUS', seats: 1, cycle: 'month' },
    });
    renderApp('/forgot-password');

    await heading('Quên mật khẩu');
    type(/Email/, 'ca@nhan.vn');
    click('Gửi liên kết');
    const link = await screen.findByRole('link', { name: 'mở liên kết' });
    const resetPath = link.getAttribute('href')!;

    renderApp(resetPath);
    await heading('Đặt lại mật khẩu');
    await screen.findByLabelText('Mật khẩu mới');
    type('Mật khẩu mới', 'MatKhauMoi6789');
    type('Nhập lại mật khẩu', 'MatKhauMoi6789');
    click('Đặt mật khẩu mới');
    expect(await screen.findByText(/Mật khẩu đã được đặt lại/)).toBeInTheDocument();
    click('Đến trang đăng nhập');

    type(/Email/, 'ca@nhan.vn');
    type('Mật khẩu', 'MatKhauMoi6789');
    click('Đăng nhập');
    // A new individual has not paid yet, so signing in leads to checkout rather than the workspace.
    await heading('Quét mã để thanh toán');
  });

  it('gives no hint whether an email has an account', async () => {
    renderApp('/forgot-password');

    await heading('Quên mật khẩu');
    type(/Email/, 'ghost@x.vn');
    click('Gửi liên kết');

    expect(await screen.findByText(/Nếu email này có tài khoản/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'mở liên kết' })).not.toBeInTheDocument();
  });

  it('rejects a reset link that does not exist', async () => {
    renderApp('/reset-password/khong-co');

    expect(await screen.findByText('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Yêu cầu liên kết mới' })).toBeInTheDocument();
  });
});

describe('email verification & routes (AUTH-07, T20, T22)', () => {
  it('confirms the address from the emailed link', async () => {
    const { debugVerifyLink } = (
      await mockRegistrationService.registerIndividual({
        fullName: 'A',
        email: 'ca@nhan.vn',
        password: VALID_PASSWORD,
        plan: { planCode: 'IND_PLUS', seats: 1, cycle: 'month' },
      })
    ).data.data!;
    renderApp(debugVerifyLink!);

    expect(await screen.findByText('Email của bạn đã được xác minh.')).toBeInTheDocument();
  });

  it('says so when the link is wrong', async () => {
    renderApp('/verify-email/sai');

    expect(await screen.findByRole('alert')).toHaveTextContent('Liên kết xác minh không hợp lệ.');
  });

  it('T22: redirects /register to /portal', async () => {
    renderApp('/register');
    await heading('Bạn dùng DigiTalent AI cho ai?');
  });

  it('T20: directs unverified user to /verify-email-required when blocked', async () => {
    await mockRegistrationService.registerEnterprise({
      fullName: 'Chưa xác thực',
      email: 'unverified@acme.vn',
      password: VALID_PASSWORD,
      plan: { planCode: 'ENT_STARTER', seats: 5, cycle: 'month' },
    });

    // Set paid and setup done, but emailVerified is false
    updateDb((db) => {
      const u = db.users.find((x) => x.email === 'unverified@acme.vn');
      if (u) {
        u.emailVerified = false;
        u.onboardingStatus = undefined;
      }
    });

    renderApp('/login');
    type(/Email/, 'unverified@acme.vn');
    type('Mật khẩu', VALID_PASSWORD);
    click('Đăng nhập');

    await heading('Xác minh email của bạn');
    expect(screen.getAllByText(/unverified@acme.vn/).length).toBeGreaterThanOrEqual(1);
  });
});

describe('payment details are not shown to the wrong visitor', () => {
  it('sends a signed-out visitor from checkout to login', async () => {
    renderApp('/checkout');
    await waitFor(() => expect(screen.getByRole('heading', { level: 1, name: 'Đăng nhập' })).toBeInTheDocument());
  });
});
