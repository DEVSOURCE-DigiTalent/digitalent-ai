import { beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useRoutes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { routes } from '../../../app/router';
import { getPortalChoice, rememberPortalChoice } from '../portal-preference';

function renderApp(path: string) {
  cleanup();
  const Routes = () => useRoutes(routes);
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={[path]}>
        <Routes />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => localStorage.clear());

describe('portal selector (PUB-01)', () => {
  it('offers the two products at "/" when nothing was chosen yet', () => {
    renderApp('/');

    expect(screen.getByRole('heading', { level: 1, name: /Bạn muốn dùng DigiTalent AI theo cách nào/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Xem giải pháp doanh nghiệp/ })).toHaveAttribute('href', '/business');
    expect(screen.getByRole('link', { name: /Xem giải pháp cá nhân/ })).toHaveAttribute('href', '/individual');
  });

  it('remembers the choice, so the selector is asked once', async () => {
    renderApp('/');
    fireEvent.click(screen.getByRole('link', { name: /Xem giải pháp cá nhân/ }));

    expect(getPortalChoice()).toBe('individual');
    renderApp('/');
    expect(await screen.findByTestId('landing-page', {}, { timeout: 10_000 })).toBeInTheDocument();
    expect(screen.getByText('Nền tảng phát triển năng lực số cá nhân')).toBeInTheDocument();
  });

  it('sends a returning enterprise visitor straight to the business landing page', async () => {
    rememberPortalChoice('enterprise');
    renderApp('/');

    expect(await screen.findByTestId('landing-page', {}, { timeout: 10_000 })).toBeInTheDocument();
    expect(screen.getByText('Nền tảng năng lực số cho doanh nghiệp')).toBeInTheDocument();
  });

  it('is always reachable at /portal to change direction', () => {
    rememberPortalChoice('enterprise');
    renderApp('/portal');

    expect(screen.getByRole('heading', { level: 1, name: /Bạn muốn dùng DigiTalent AI/ })).toBeInTheDocument();
  });

  it('remembers the product of a landing page that is visited directly', async () => {
    renderApp('/individual');
    await screen.findByTestId('landing-page', {}, { timeout: 10_000 });

    expect(getPortalChoice()).toBe('individual');
  });

  it('ignores a stored value it does not know', () => {
    localStorage.setItem('dt-portal', 'something-else');

    expect(getPortalChoice()).toBeNull();
  });
});

describe('landing pages of the two products', () => {
  it('speak to businesses and to individuals differently, with their own calls to action', async () => {
    renderApp('/individual');
    await screen.findByTestId('landing-page', {}, { timeout: 10_000 });
    expect(screen.getAllByRole('link', { name: /Xem gói cá nhân/ })[0]).toHaveAttribute('href', '/individual/pricing');
    expect(screen.getByRole('heading', { level: 2, name: /Biết mình đang ở đâu/ })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Dành cho doanh nghiệp' })[0]).toHaveAttribute('href', '/business');

    renderApp('/business');
    await screen.findByTestId('landing-page', {}, { timeout: 10_000 });
    expect(screen.getAllByRole('link', { name: /Chọn gói|Xem bảng giá/ })[0]).toHaveAttribute('href', '/business/pricing');
    expect(screen.getAllByRole('link', { name: 'Dành cho cá nhân' })[0]).toHaveAttribute('href', '/individual');
  });
});

describe('login entrances', () => {
  it('keeps one form but points sign-up to the right product', () => {
    renderApp('/business/login');
    expect(screen.getByText('Doanh nghiệp')).toBeInTheDocument();
    expect(screen.getByText('Quản lý năng lực số của đội ngũ bạn.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Tạo tài khoản doanh nghiệp' })).toHaveAttribute('href', '/register?audience=enterprise');
    expect(screen.getByRole('link', { name: 'Quên mật khẩu?' })).toHaveAttribute('href', '/forgot-password');

    renderApp('/individual/login');
    expect(screen.getByText('Cá nhân')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Tạo tài khoản cá nhân' })).toHaveAttribute('href', '/register?audience=individual');
  });

  it('sends a visitor of the neutral /login back to the portal choice', () => {
    renderApp('/login');

    expect(screen.getByRole('link', { name: 'DigiTalent AI, về trang chủ' })).toHaveAttribute('href', '/portal');
    expect(screen.getByRole('link', { name: 'Tạo tài khoản' })).toHaveAttribute('href', '/register');
  });
});
