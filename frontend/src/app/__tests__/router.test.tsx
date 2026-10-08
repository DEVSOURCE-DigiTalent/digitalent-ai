import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useRoutes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { routes } from '../router';
import { isSafeReturnTo } from '../../features/auth/auth-redirect';
import { MOCK_EMAILS, signInAsMock, signOut } from '../../test/session';
import { usePersonalTheme } from '../../features/learner/theme/use-personal-theme';

// Built pages call the API; the mock REST server answers instead of a real backend.
vi.hoisted(() => vi.stubEnv('VITE_USE_MOCK', 'true'));

function AppRoutes() {
  return useRoutes(routes);
}

function renderWithRouter(initialEntry: string, queryClient: QueryClient) {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <AppRoutes />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('Router Configuration & Surface Separation', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    signOut();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  describe('Public Flow (Anonymous Access)', () => {
    it('Anonymous can access the Individual guided trial without entering the paid workspace', async () => {
      renderWithRouter('/individual/try', queryClient);

      expect(await screen.findByTestId('individual-trial-page', {}, { timeout: 10_000 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1, name: /Trải nghiệm lộ trình cá nhân/ })).toBeInTheDocument();
      expect(screen.queryByTestId('personal-layout')).not.toBeInTheDocument();
    });

    it('Anonymous can access the enterprise landing page without login redirect', async () => {
      renderWithRouter('/business', queryClient);

      // The landing page is lazy-loaded (first import is slow when the whole suite runs in parallel)
      // and brings its own navigation and footer.
      expect(await screen.findByTestId('landing-page', {}, { timeout: 10_000 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1, name: 'DigiTalent AI' })).toBeInTheDocument();
      expect(screen.queryByTestId('public-layout')).not.toBeInTheDocument();
      expect(screen.queryByTestId('enterprise-layout')).not.toBeInTheDocument();
    });

    it('Anonymous can access the reference positions without login redirect', async () => {
      renderWithRouter('/careers', queryClient);

      expect(screen.getByRole('heading', { level: 1, name: /Vị trí tham chiếu/ })).toBeInTheDocument();
      expect(screen.queryByTestId('enterprise-layout')).not.toBeInTheDocument();
    });

    it('Anonymous can open one reference position without login redirect', async () => {
      renderWithRouter('/careers/accountant', queryClient);

      expect(screen.getByRole('heading', { level: 1, name: 'Kế toán' })).toBeInTheDocument();
      expect(screen.queryByTestId('enterprise-layout')).not.toBeInTheDocument();
    });

    it('has no public certificate verification page any more', async () => {
      renderWithRouter('/verify', queryClient);

      expect(screen.queryByTestId('public-layout')).not.toBeInTheDocument();
      expect(screen.queryByText(/Certificate Verification/i)).not.toBeInTheDocument();
    });
  });

  describe('Personal Flow & Deep-Link Boundaries', () => {
    beforeEach(() => {
      signInAsMock(MOCK_EMAILS.personal);
    });

    it('Direct load /personal/courses/crs-A3-I renders the personal layout and does NOT contain Enterprise shell', async () => {
      renderWithRouter('/personal/courses/crs-A3-I', queryClient);

      expect(screen.getByTestId('personal-layout')).toBeInTheDocument();
      expect(screen.getByTestId('learner-course-detail')).toBeInTheDocument();
      expect(await screen.findByText(/Mã: A3-I/i, {}, { timeout: 10000 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1, name: 'Tạo lập nội dung chuyên nghiệp' })).toBeInTheDocument();

      expect(screen.queryByTestId('enterprise-layout')).not.toBeInTheDocument();
      expect(screen.queryByRole('heading', { level: 1, name: 'Đăng nhập' })).not.toBeInTheDocument();
    });

    it('Direct load /personal renders learner dashboard directly', async () => {
      renderWithRouter('/personal', queryClient);

      expect(screen.getByTestId('personal-layout')).toBeInTheDocument();
      expect(screen.getByTestId('learner-dashboard')).toBeInTheDocument();
      expect(await screen.findByRole('heading', { level: 1, name: /Tổng quan học tập/i }, { timeout: 10000 })).toBeInTheDocument();
      expect(screen.queryByTestId('enterprise-layout')).not.toBeInTheDocument();
    });

    it('Direct load /personal/dashboard renders learner dashboard', async () => {
      renderWithRouter('/personal/dashboard', queryClient);

      expect(screen.getByTestId('personal-layout')).toBeInTheDocument();
      expect(screen.getByTestId('learner-dashboard')).toBeInTheDocument();
      expect(screen.queryByTestId('enterprise-layout')).not.toBeInTheDocument();
    });

    it('Direct load /personal/target renders the reference positions', async () => {
      renderWithRouter('/personal/target', queryClient);

      expect(screen.getByTestId('personal-layout')).toBeInTheDocument();
      expect(screen.getByTestId('learner-target-page')).toBeInTheDocument();
      expect(await screen.findByRole('radio', { name: /Marketing/ })).toBeInTheDocument();
      expect(screen.queryByTestId('enterprise-layout')).not.toBeInTheDocument();
    });

    it('Direct load /personal/diagnostic renders diagnostic assessment page', async () => {
      renderWithRouter('/personal/diagnostic', queryClient);

      expect(screen.getByTestId('personal-layout')).toBeInTheDocument();
      expect(screen.getByTestId('learner-diagnostic-page')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1, name: /Đánh giá năng lực/i })).toBeInTheDocument();
      expect(screen.queryByTestId('enterprise-layout')).not.toBeInTheDocument();
    });

    it('Direct load /personal/path renders learning path roadmap', async () => {
      renderWithRouter('/personal/path', queryClient);

      expect(screen.getByTestId('personal-layout')).toBeInTheDocument();
      expect(screen.getByTestId('learner-path-page')).toBeInTheDocument();
      expect(await screen.findByText(/Tiến độ lộ trình/i)).toBeInTheDocument();
      expect(screen.queryByTestId('enterprise-layout')).not.toBeInTheDocument();
    });

    it('Direct load /personal/classroom/crs-A3-I renders the classroom', async () => {
      renderWithRouter('/personal/classroom/crs-A3-I', queryClient);

      expect(screen.getByTestId('personal-layout')).toBeInTheDocument();
      expect(screen.getByTestId('learner-classroom-page')).toBeInTheDocument();
      expect(await screen.findByText(/Lớp học số: A3-I/i)).toBeInTheDocument();
      expect(screen.queryByTestId('enterprise-layout')).not.toBeInTheDocument();
    });

    it('Direct load /personal/progress renders personal skill progress', async () => {
      renderWithRouter('/personal/progress', queryClient);

      expect(screen.getByTestId('personal-layout')).toBeInTheDocument();
      expect(screen.getByTestId('learner-progress-page')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1, name: 'Hồ sơ năng lực' })).toBeInTheDocument();
      expect(screen.queryByTestId('enterprise-layout')).not.toBeInTheDocument();
    });

    it('Direct load /personal/tasks renders practical tasks page', async () => {
      renderWithRouter('/personal/tasks', queryClient);

      expect(screen.getByTestId('personal-layout')).toBeInTheDocument();
      expect(screen.getByTestId('learner-tasks-page')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1, name: 'Bài thực hành' })).toBeInTheDocument();
      expect(screen.queryByTestId('enterprise-layout')).not.toBeInTheDocument();
    });

    it('Direct load /personal/certificates renders certificates page', async () => {
      renderWithRouter('/personal/certificates', queryClient);

      expect(screen.getByTestId('personal-layout')).toBeInTheDocument();
      expect(screen.getByTestId('learner-certificates-page')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1, name: 'Chứng nhận hoàn thành khóa học' })).toBeInTheDocument();
      expect(screen.queryByTestId('enterprise-layout')).not.toBeInTheDocument();
    });

    it('opens in the dark theme and remembers the light theme', async () => {
      renderWithRouter('/personal', queryClient);

      const layout = screen.getByTestId('personal-layout');
      expect(layout).toHaveAttribute('data-theme', 'dark');
      screen.getByRole('button', { name: 'Chuyển sang giao diện sáng' }).click();
      await waitFor(() => expect(layout).toHaveAttribute('data-theme', 'light'));
      expect(localStorage.getItem('dt-personal-theme')).toBe('light');
      usePersonalTheme.getState().setTheme('dark');
    });
  });

  describe('Enterprise Flow & Auth Guards', () => {
    it('Unauthenticated access to /enterprise/overview redirects to /login?returnTo=...', async () => {
      renderWithRouter('/enterprise/overview', queryClient);

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Đăng nhập' })).toBeInTheDocument();
      });
      expect(screen.queryByTestId('enterprise-layout')).not.toBeInTheDocument();
    });

    it('Unauthenticated access to /enterprise/departments redirects to login', async () => {
      renderWithRouter('/enterprise/departments', queryClient);

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Đăng nhập' })).toBeInTheDocument();
      });
      expect(screen.queryByTestId('enterprise-layout')).not.toBeInTheDocument();
    });

    it('Legacy /organization/departments redirects to /enterprise/departments then login', async () => {
      renderWithRouter('/organization/departments', queryClient);

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Đăng nhập' })).toBeInTheDocument();
      });
      expect(screen.queryByTestId('enterprise-layout')).not.toBeInTheDocument();
    });
  });

  describe('Portal separation', () => {
    it('sends a personal user who opens /enterprise to their own home', async () => {
      signInAsMock(MOCK_EMAILS.personal);
      renderWithRouter('/enterprise/overview', queryClient);

      expect(await screen.findByTestId('personal-layout')).toBeInTheDocument();
      expect(screen.queryByTestId('enterprise-layout')).not.toBeInTheDocument();
    });

    it('sends an enterprise user who opens /personal to their own home', async () => {
      signInAsMock(MOCK_EMAILS.orgAdmin);
      renderWithRouter('/personal/dashboard', queryClient);

      expect(await screen.findByTestId('enterprise-layout')).toBeInTheDocument();
      expect(screen.queryByTestId('personal-layout')).not.toBeInTheDocument();
    });

    it('keeps platform staff out of the enterprise portal', async () => {
      signInAsMock(MOCK_EMAILS.platform);
      renderWithRouter('/enterprise/overview', queryClient);

      expect(await screen.findByTestId('platform-layout')).toBeInTheDocument();
      expect(screen.queryByTestId('enterprise-layout')).not.toBeInTheDocument();
    });

    it('opens /enterprise on the home of the signed-in role', async () => {
      signInAsMock(MOCK_EMAILS.manager);
      renderWithRouter('/enterprise', queryClient);

      expect(await screen.findByRole('heading', { name: 'Bảng năng lực của nhóm' })).toBeInTheDocument();
    });

    it('shows access denied to a role the screen is not meant for', async () => {
      signInAsMock(MOCK_EMAILS.learner);
      renderWithRouter('/enterprise/members', queryClient);

      expect(await screen.findByText(/Truy cập bị từ chối/i)).toBeInTheDocument();
    });

    it('keeps the tail of old /learn links', async () => {
      signInAsMock(MOCK_EMAILS.personal);
      renderWithRouter('/learn/courses/crs-01', queryClient);

      expect(await screen.findByTestId('learner-course-detail')).toBeInTheDocument();
    });

    it('redirects the old /learn paths to /personal', async () => {
      signInAsMock(MOCK_EMAILS.personal);
      renderWithRouter('/learn/path', queryClient);

      expect(await screen.findByTestId('personal-layout')).toBeInTheDocument();
    });
  });

  describe('Plan gating', () => {
    it('blocks a paid workspace whose subscription needs payment', async () => {
      signInAsMock(MOCK_EMAILS.expiredOwner);
      renderWithRouter('/enterprise/overview', queryClient);

      expect(await screen.findByRole('heading', { name: 'Gói dịch vụ đã hết hạn' })).toBeInTheDocument();
    });

    it('keeps billing open for an owner whose subscription needs payment, so they can renew', async () => {
      signInAsMock(MOCK_EMAILS.expiredOwner);
      renderWithRouter('/enterprise/billing', queryClient);

      expect(await screen.findByRole('heading', { name: /Gói dịch vụ doanh nghiệp|Gói và thanh toán/i }, { timeout: 5000 })).toBeInTheDocument();
      expect(screen.getByTestId('enterprise-layout')).toBeInTheDocument();
    });

    it('shows "feature unavailable" when the plan lacks the feature', async () => {
      signInAsMock(MOCK_EMAILS.learningAdmin, {
        subscription: { planCode: 'S', planName: 'Starter', status: 'active', entitlements: [] },
      });
      renderWithRouter('/enterprise/internal-courses', queryClient);

      expect(await screen.findByRole('heading', { name: 'Tính năng chưa có trong gói' })).toBeInTheDocument();
    });

    it('opens the feature when the plan includes it', async () => {
      signInAsMock(MOCK_EMAILS.learningAdmin);
      renderWithRouter('/enterprise/internal-courses', queryClient);

      expect(await screen.findByRole('heading', { name: 'Khóa học nội bộ' })).toBeInTheDocument();
    });
  });

  describe('Safe returnTo Validation', () => {
    it('isSafeReturnTo allows valid internal relative paths', () => {
      expect(isSafeReturnTo('/enterprise/overview')).toBe(true);
      expect(isSafeReturnTo('/personal/courses/crs-01')).toBe(true);
      expect(isSafeReturnTo('/careers?search=ai')).toBe(true);
    });

    it('isSafeReturnTo rejects external protocols, protocol-relative, and backslash paths', () => {
      expect(isSafeReturnTo('//attacker.com')).toBe(false);
      expect(isSafeReturnTo('/\\attacker.com')).toBe(false);
      expect(isSafeReturnTo('https://malicious.com')).toBe(false);
      expect(isSafeReturnTo('javascript:alert(1)')).toBe(false);
      expect(isSafeReturnTo('')).toBe(false);
      expect(isSafeReturnTo(null)).toBe(false);
    });
  });
});
