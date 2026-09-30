import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/use-current-user';
import { MainLayout } from '../MainLayout';

function loginAs(roles: string[], permissions: string[]) {
  useCurrentUser.setState({
    user: { id: 'u-1', email: 'u@digitalent.ai', fullName: 'User', roles, permissions },
    isAuthenticated: true,
  });
}

function renderLayout(path = '/enterprise/hr/dashboard') {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/enterprise" element={<MainLayout />}>
            <Route path="*" element={<p>Page content</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('MainLayout navigation', () => {
  beforeEach(() => {
    loginAs(['HR_MANAGER'], ['assessment.read', 'skill_gap.read']);
  });

  it('hides sidebar items whose page the user has no permission for', () => {
    renderLayout();
    const nav = within(screen.getByRole('navigation', { name: 'Main navigation' }));

    expect(nav.getByText('Assessments')).toBeInTheDocument();
    expect(nav.getByText('Skill Gap Analysis')).toBeInTheDocument();
    // HR role is listed for the item, but the route needs attempt.read_result
    expect(nav.queryByText('Learner Results')).not.toBeInTheDocument();
  });

  it('shows every item of the role to a system administrator', () => {
    loginAs(['SYSTEM_ADMIN'], []);
    renderLayout();

    expect(screen.getByText('User Management')).toBeInTheDocument();
  });

  it('renders navigation items as links', () => {
    renderLayout();

    expect(screen.getByRole('link', { name: 'Skill Gap Analysis' })).toHaveAttribute(
      'href',
      '/enterprise/intelligence/skill-gap',
    );
  });

  it('marks only the most specific item as the current page', () => {
    loginAs(['HR_MANAGER'], ['competency.read', 'position_requirement.read']);
    renderLayout('/enterprise/competency-framework/position-requirements');

    expect(screen.getByRole('link', { name: 'Position Requirements' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Competency Framework' })).not.toHaveAttribute('aria-current');
  });

  it('opens the navigation drawer on small screens and closes it from the backdrop or after navigating', () => {
    renderLayout();
    expect(screen.queryByTestId('sidebar-backdrop')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }));
    expect(screen.getByTestId('sidebar-backdrop')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('sidebar-backdrop'));
    expect(screen.queryByTestId('sidebar-backdrop')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }));
    fireEvent.click(screen.getByRole('link', { name: 'Skill Gap Analysis' }));
    expect(screen.queryByTestId('sidebar-backdrop')).not.toBeInTheDocument();
  });

  it('names the icon-only buttons', () => {
    renderLayout();

    const topbar = within(screen.getByRole('banner'));
    expect(topbar.getByRole('button', { name: 'Search' })).toBeInTheDocument();
    expect(topbar.getByRole('button', { name: 'Notifications' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Collapse sidebar' })).toBeInTheDocument();
  });
});
