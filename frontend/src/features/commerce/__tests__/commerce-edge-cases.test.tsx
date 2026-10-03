import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useRoutes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.hoisted(() => {
  vi.stubEnv('VITE_USE_MOCK', 'true');
});

import { routes } from '../../../app/router';
import { useCurrentUser } from '../../../hooks/use-current-user';
import { mockCheckoutService } from '../../../services/mock/mock-checkout.service';
import { mockOnboardingService } from '../../../services/mock/mock-onboarding.service';
import { mockPurchaseService } from '../../../services/mock/mock-purchase.service';
import { mockRegistrationService } from '../../../services/mock/mock-registration.service';
import { getDb, resetMockDb, toSessionUser, updateDb } from '../../../services/mock/mock-store';
import { getPlan, priceFor } from '../../../lib/plans';

beforeAll(async () => {
  await import('../../../services/mock/server/mock-adapter');
});

afterAll(() => {
  vi.unstubAllEnvs();
});

function AppRoutes() {
  return useRoutes(routes);
}

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

const type = (label: string | RegExp, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
const click = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }));
const heading = (name: string | RegExp) => screen.findByRole('heading', { name }, { timeout: 10000 });

const VALID_PASSWORD = 'MatKhauTot9999';

beforeEach(() => {
  localStorage.clear();
  resetMockDb();
  useCurrentUser.getState().clearUser();
});

describe('commerce edge cases (T5, T6, T7, T14, T15, T17, T18)', () => {
  it('T5: user with active subscription signing in is directed straight to workspace', async () => {
    // Registered enterprise user with active subscription
    await mockRegistrationService.registerEnterprise({
      fullName: 'Chủ Đã Có Gói',
      email: 'active@acme.vn',
      password: VALID_PASSWORD,
      plan: { planCode: 'ENT_PRO', seats: 10, cycle: 'month' },
    });

    updateDb((db) => {
      const u = db.users.find((x) => x.email === 'active@acme.vn');
      if (u) {
        u.emailVerified = true;
        u.onboardingStatus = undefined;
        u.subscription = {
          planCode: 'ENT_PRO',
          planName: 'Enterprise Pro',
          seatLimit: 10,
          status: 'active',
          entitlements: ['analytics', 'ai-assessment', 'custom-roles', 'org-export'],
        };
        u.organizationId = 'org-test';
      }
      db.organizations.push({
        id: 'org-test',
        name: 'Công ty Active',
        industry: 'Công nghệ',
        size: '10-50',
        ownerId: u!.id,
        departments: [],
        positions: [],
        grades: [],
        setupCompleted: true,
      });
    });

    renderApp('/login');
    type(/Email/, 'active@acme.vn');
    type('Mật khẩu', VALID_PASSWORD);
    click('Đăng nhập');

    expect(await screen.findByTestId('enterprise-layout', {}, { timeout: 10000 })).toBeInTheDocument();
  });

  it('T6: changing plan at checkout updates draft without re-registering', async () => {
    // Create draft and sign in
    await mockRegistrationService.registerEnterprise({
      fullName: 'Chủ Đổi Gói',
      email: 'change@acme.vn',
      password: VALID_PASSWORD,
      plan: { planCode: 'ENT_STARTER', seats: 5, cycle: 'month' },
    });

    const auth = await import('../../../services/mock/mock-auth.service');
    const login = await auth.mockAuthService.login({ email: 'change@acme.vn', password: VALID_PASSWORD });
    localStorage.setItem('accessToken', login.data.data!.accessToken);

    const draft = (await mockPurchaseService.getMyDraft()).data.data!;
    expect(draft.planCode).toBe('ENT_STARTER');
    expect(draft.seats).toBe(20);

    // Update draft to PRO with 60 seats (50 included + 10 add-ons)
    const updated = (
      await mockPurchaseService.updateDraft(draft.id, {
        planCode: 'ENT_PRO',
        seats: 60,
        cycle: 'year',
      })
    ).data.data!;

    expect(updated.planCode).toBe('ENT_PRO');
    expect(updated.seats).toBe(60);
    expect(updated.cycle).toBe('year');
    expect(updated.amount).toBe(priceFor(getPlan('ENT_PRO')!, 60, 'year'));
  });

  it('T7: reloading checkout page retains draft and payment status', async () => {
    await mockRegistrationService.registerEnterprise({
      fullName: 'Chủ F5',
      email: 'reload@acme.vn',
      password: VALID_PASSWORD,
      plan: { planCode: 'ENT_STARTER', seats: 5, cycle: 'month' },
    });

    updateDb((db) => {
      const u = db.users.find((x) => x.email === 'reload@acme.vn');
      if (u) {
        u.contractSigned = true;
        u.onboardingStatus = 'payment';
      }
    });

    renderApp('/login');
    type(/Email/, 'reload@acme.vn');
    type('Mật khẩu', VALID_PASSWORD);
    click('Đăng nhập');

    await heading('Quét mã để thanh toán');

    // Simulate page reload
    renderApp('/checkout');
    await heading('Quét mã để thanh toán');
    expect(screen.getByText(/Starter · 20 người dùng/)).toBeInTheDocument();
  });

  it('T14: resuming setup wizard opens at stored step', async () => {
    await mockRegistrationService.registerEnterprise({
      fullName: 'Chủ Setup',
      email: 'setup@acme.vn',
      password: VALID_PASSWORD,
      plan: { planCode: 'ENT_PRO', seats: 10, cycle: 'month' },
    });

    updateDb((db) => {
      const u = db.users.find((x) => x.email === 'setup@acme.vn');
      if (u) {
        u.contractSigned = true;
        u.onboardingStatus = 'payment';
      }
    });

    const auth = await import('../../../services/mock/mock-auth.service');
    const login = await auth.mockAuthService.login({ email: 'setup@acme.vn', password: VALID_PASSWORD });
    localStorage.setItem('accessToken', login.data.data!.accessToken);

    const order = (await mockCheckoutService.createOrder({ planCode: 'ENT_PRO', seats: 10, cycle: 'month' })).data.data!;
    await mockCheckoutService.confirmPayment(order.id, 'paid');

    await mockOnboardingService.saveOrganization({
      name: 'Acme Setup Corp',
      industry: 'Công nghệ',
      size: '10-50',
    });

    // Contract signed, onboardingStatus = 'setup', setupStep = 2 (Phòng ban và nhóm)
    updateDb((db) => {
      const u = db.users.find((x) => x.email === 'setup@acme.vn');
      if (u) {
        u.contractSigned = true;
        u.onboardingStatus = 'setup';
        u.setupStep = 2;
      }
    });
    const refreshed = toSessionUser(getDb().users.find((x) => x.email === 'setup@acme.vn')!);
    useCurrentUser.getState().setUser(refreshed);

    await mockOnboardingService.saveStep(2);

    const setupRes = (await mockOnboardingService.getSetup()).data.data;
    expect(setupRes?.setupStep).toBe(2);

    renderApp('/setup');
    expect(await heading('Phòng ban và nhóm')).toBeInTheDocument();
  });

  it('T15: header "Bắt đầu" and login links point to pricing pages', async () => {
    renderApp('/business');
    const pricingLinks = await screen.findAllByRole('link', { name: 'Bảng giá' });
    expect(pricingLinks.length).toBeGreaterThan(0);
    expect(pricingLinks[0]).toHaveAttribute('href', '/business/pricing');

    renderApp('/business/login');
    const registerCta = screen.getByRole('link', { name: 'Đăng ký' });
    expect(registerCta).toHaveAttribute('href', '/business/pricing');

    const registerPromptLink = screen.getByRole('link', { name: 'Chọn gói và đăng ký' });
    expect(registerPromptLink).toHaveAttribute('href', '/business/pricing');
  });

  it('T18: contact plan (ENT_CUSTOM) triggers mailto link, not register', async () => {
    renderApp('/business/pricing');
    await heading('Chọn gói cho đội ngũ của bạn.');

    const contactLink = screen.getByRole('link', { name: 'Liên hệ tư vấn' });
    expect(contactLink).toBeInTheDocument();
    expect(contactLink.getAttribute('href')).toContain('mailto:');
  });
});
