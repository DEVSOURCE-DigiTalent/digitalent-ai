import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, useRoutes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { routes } from '@/app/router';
import { preloadLazyPages } from '@/app/routes/lazy-page';
import { ROLES } from '@/lib/roles';
import { MOCK_EMAILS, signInAsMock, signOut } from '@/test/session';

// Pages read the mock REST server instead of a backend.
vi.hoisted(() => vi.stubEnv('VITE_USE_MOCK', 'true'));

function AppRoutes() {
  return useRoutes(routes);
}

function renderAt(path: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('owner taking the trial test / learning', () => {
  beforeAll(() => preloadLazyPages(), 120_000);
  beforeEach(() => signOut());

  it('keeps the owner sidebar on the learning pages', async () => {
    // Chủ doanh nghiệp đã tham gia làm bài: role Chủ doanh nghiệp + Nhân viên.
    signInAsMock(MOCK_EMAILS.owner, { roles: [ROLES.OWNER, ROLES.EMPLOYEE], enterpriseTrialStatus: 'trial_active' });
    renderAt('/enterprise/me/path');

    const nav = await screen.findByRole('navigation', { name: 'Điều hướng chính' });
    expect(within(nav).getByRole('link', { name: /Đánh giá đội ngũ/ })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: /Tổng quan/ })).toBeInTheDocument();
    expect(await screen.findByTestId('pulse-employee-layout')).toBeInTheDocument();
  });

  it('sends an owner who has not joined to the Học thử page with the join warning', async () => {
    signInAsMock(MOCK_EMAILS.owner, { roles: [ROLES.OWNER], enterpriseTrialStatus: 'trial_active' });
    renderAt('/enterprise/trial/learning');

    const nav = await screen.findByRole('navigation', { name: 'Điều hướng chính' });
    expect(within(nav).getByRole('link', { name: /Đánh giá đội ngũ/ })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: /Tổng quan/ })).toBeInTheDocument();
    expect(await screen.findByRole('status', { name: 'Làm bài test trước khi học' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tham gia làm bài test/ })).toBeDisabled();
    expect(screen.getByRole('link', { name: /Mua khóa học/ })).toHaveAttribute('href', '/enterprise/courses?level=2');
  });

  it('keeps the Pulse header (no owner sidebar) for employees', async () => {
    signInAsMock(MOCK_EMAILS.employee);
    renderAt('/enterprise/me');

    expect(await screen.findByTestId('pulse-employee-layout')).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Điều hướng chính' })).not.toBeInTheDocument();
  });
});
