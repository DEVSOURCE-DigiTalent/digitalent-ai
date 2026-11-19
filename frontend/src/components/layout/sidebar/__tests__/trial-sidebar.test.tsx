import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it } from 'vitest';
import { useCurrentUser } from '@/hooks/use-current-user';
import { PERMISSIONS } from '@/hooks/use-permission';
import { ROLES } from '@/lib/roles';
import { OWNER_SIDEBAR } from '@/lib/sidebars/owner';
import type { SessionUser } from '@/types/session';
import { SidebarNav } from '../SidebarNav';

function signInOwner(enterpriseTrialStatus: SessionUser['enterpriseTrialStatus'], enterpriseTrialPurchased = false) {
  useCurrentUser.setState({
    user: {
      id: 'owner-1', email: 'owner@example.test', fullName: 'Chủ doanh nghiệp', roles: [ROLES.OWNER],
      permissions: Object.values(PERMISSIONS), workspace: 'enterprise', enterpriseTrialStatus, enterpriseTrialPurchased,
    },
    isAuthenticated: true,
  });
}

const renderSidebar = () => render(<MemoryRouter><SidebarNav config={OWNER_SIDEBAR} isRail={false} /></MemoryRouter>);
afterEach(() => { cleanup(); useCurrentUser.setState({ user: null, isAuthenticated: false }); });

it('opens only the survey, the competency framework and the courses during the trial; the rest is listed but locked', () => {
  signInOwner('trial_active');
  renderSidebar();

  for (const name of ['Khảo sát năng lực số', 'Khung năng lực số', 'Khóa học']) {
    expect(screen.getByRole('link', { name })).toHaveAttribute('href');
  }
  const people = screen.getByRole('link', { name: /^Nhân sự \(chưa mở trong bản dùng thử\)$/ });
  expect(people).toHaveAttribute('aria-disabled', 'true');
  expect(people).not.toHaveAttribute('href');
  expect(screen.getByRole('link', { name: /^Tổng quan / })).toHaveAttribute('aria-disabled', 'true');

  fireEvent.mouseEnter(people);
  expect(screen.getByRole('tooltip')).toHaveTextContent('Chưa mở trong bản dùng thử');
  expect(screen.getByRole('tooltip')).toHaveTextContent('Nhân sự mở khi doanh nghiệp mua khóa học đầu tiên.');
  fireEvent.mouseLeave(people);
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
});

it('hides the survey once the organization uses the platform for real and unlocks everything else', () => {
  signInOwner('converted');
  renderSidebar();

  expect(screen.queryByRole('link', { name: /Khảo sát năng lực số/ })).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Nhân sự' })).toHaveAttribute('href');
  expect(screen.getByRole('link', { name: 'Khung năng lực số' })).toHaveAttribute('href');
  expect(document.querySelector('[data-locked="trial"]')).toBeNull();
});

it('a trial organization that bought a course is a customer: every entry opens and the survey item goes away', () => {
  signInOwner('trial_active', true);
  renderSidebar();

  expect(screen.queryByRole('link', { name: /Khảo sát năng lực số/ })).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Khoảng trống năng lực' })).toHaveAttribute('href');
  expect(screen.getByRole('link', { name: 'Nhân sự' })).toHaveAttribute('href');
  expect(screen.getByRole('link', { name: /^Tổng quan/ })).toHaveAttribute('href');
  expect(document.querySelector('[data-locked="trial"]')).toBeNull();
});
