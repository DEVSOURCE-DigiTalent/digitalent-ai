import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ROLES } from '@/lib/roles';

function renderLanding() {
  return render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>
  );
}

describe('LandingPage', () => {
  beforeEach(() => {
    localStorage.clear();
    useCurrentUser.getState().clearUser();
  });

  it('shows the wordmark and the framework and closing sections', () => {
    renderLanding();

    expect(screen.getByRole('heading', { level: 1, name: 'DigiTalent AI' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Mỗi vị trí cần một bộ năng lực số riêng/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Biết đội ngũ cần phát triển gì/ })).toBeInTheDocument();
  });

  it('sends visitors without a session to the pricing page', () => {
    renderLanding();

    const ctas = screen.getAllByRole('link', { name: /^Xem bảng giá$/ });
    expect(ctas.length).toBeGreaterThanOrEqual(2);
    ctas.forEach((link) => expect(link).toHaveAttribute('href', '/business/pricing'));
    expect(screen.queryByRole('link', { name: /Vào hệ thống/ })).not.toBeInTheDocument();
  });

  it('sends a signed-in user to the home of their workspace', () => {
    useCurrentUser.getState().setUser({
      id: 'u-1',
      email: 'learning@digitalent.demo',
      fullName: 'Learning Admin',
      roles: [ROLES.OWNER],
      permissions: [],
    });
    renderLanding();

    const ctas = screen.getAllByRole('link', { name: /Vào hệ thống/ });
    expect(ctas.length).toBeGreaterThanOrEqual(2);
    ctas.forEach((link) => expect(link).toHaveAttribute('href', '/enterprise/dashboard'));
    expect(screen.queryByRole('link', { name: /^Xem bảng giá$/ })).not.toBeInTheDocument();
  });

  it('treats a stored access token as a session before the profile has loaded', () => {
    localStorage.setItem('accessToken', 'stored-token');
    renderLanding();

    screen.getAllByRole('link', { name: /Vào hệ thống/ }).forEach((link) => expect(link).toHaveAttribute('href', '/enterprise'));
  });

  it('keeps login and pricing in the main navigation, without a public certificate lookup', () => {
    renderLanding();

    const nav = screen.getByRole('navigation', { name: 'Điều hướng chính' });
    expect(within(nav).getByRole('link', { name: 'Đăng nhập' })).toHaveAttribute('href', '/business/login');
    expect(within(nav).queryByRole('link', { name: 'Tra cứu chứng chỉ' })).not.toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: 'Bảng giá' })).toHaveAttribute('href', '/business/pricing');
    expect(within(nav).getByRole('link', { name: 'Cách hoạt động' })).toHaveAttribute('href', '#cach-hoat-dong');
  });

  it('reads the scroll-revealed paragraph as one sentence for screen readers', () => {
    renderLanding();

    expect(screen.getByText(/^Thông tư 02\/2025\/TT-BGDĐT cung cấp khung 6 miền/)).toBeInTheDocument();
  });

  it('lets visitors pause and resume the moving backgrounds', () => {
    renderLanding();

    const toggle = screen.getByRole('button', { name: /chuyển động nền/ });
    const initialLabel = toggle.getAttribute('aria-label');
    fireEvent.click(toggle);

    expect(toggle.getAttribute('aria-label')).not.toBe(initialLabel);
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-label')).toBe(initialLabel);
  });
});
