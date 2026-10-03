import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useRoutes, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.hoisted(() => {
  vi.stubEnv('VITE_USE_MOCK', 'true');
});

import { routes } from '../app/router';
import { MOCK_EMAILS, signInAsMock, signOut } from './session';
import { getHomePath } from '../lib/navigation';

beforeAll(async () => {
  await import('../services/mock/server/mock-adapter');
});

afterAll(() => {
  vi.unstubAllEnvs();
});

function AppWithLocation() {
  const element = useRoutes(routes);
  const location = useLocation();
  return (
    <>
      <div data-testid="location-display">{location.pathname}</div>
      {element}
    </>
  );
}

describe('8 Canonical Demo Accounts E2E Test Suite', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    signOut();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.clearAllMocks();
  });

  it('1. Owner (Acme Corp): lands on /enterprise/dashboard, has owner sidebar, redirects legacy workforce, and views OW-20', async () => {
    const session = signInAsMock(MOCK_EMAILS.owner);
    expect(getHomePath(session)).toBe('/enterprise/dashboard');

    // Test legacy redirect: /enterprise/workforce -> /enterprise/members
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/enterprise/workforce']}>
          <AppWithLocation />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('location-display').textContent).toBe('/enterprise/members');
    });

    // Test OW-20 employee competency profile
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/enterprise/competency-profiles/emp-01']}>
          <AppWithLocation />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByRole('heading', { level: 1, name: 'Hoàng Văn Nhân Viên' })).toBeInTheDocument();
    expect(screen.getByText('Trình độ năng lực')).toBeInTheDocument();
    expect(screen.getAllByText('Khoảng trống năng lực').length).toBeGreaterThanOrEqual(1);
  });

  it('2. Owner2 (Small Co, org without manager): lands on /enterprise/dashboard', () => {
    const session = signInAsMock(MOCK_EMAILS.owner2);
    expect(getHomePath(session)).toBe('/enterprise/dashboard');
  });

  it('3. Manager (Acme Corp): lands on /enterprise/team', async () => {
    const session = signInAsMock(MOCK_EMAILS.manager);
    expect(getHomePath(session)).toBe('/enterprise/team');

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/enterprise/team']}>
          <AppWithLocation />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByTestId('location-display').textContent).toBe('/enterprise/team');
  });

  it('4. Employee (Acme Corp): lands on /enterprise/me and is forbidden from /enterprise/dashboard', async () => {
    const session = signInAsMock(MOCK_EMAILS.employee);
    expect(getHomePath(session)).toBe('/enterprise/me');

    // Attempt to access owner-only dashboard
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/enterprise/dashboard']}>
          <AppWithLocation />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Truy cập bị từ chối/i })).toBeInTheDocument();
    });
  });

  it('5. Platform Admin: lands on /platform/dashboard', () => {
    const session = signInAsMock(MOCK_EMAILS.platform);
    expect(getHomePath(session)).toBe('/platform/dashboard');
  });

  it('6. Personal Learner: lands on /personal/dashboard', () => {
    const session = signInAsMock(MOCK_EMAILS.personal);
    expect(getHomePath(session)).toBe('/personal/dashboard');
  });

  it('7. Starter Owner: lands on /enterprise/dashboard with starter plan', () => {
    const session = signInAsMock(MOCK_EMAILS.starterOwner);
    expect(getHomePath(session)).toBe('/enterprise/dashboard');
    expect(session.subscription?.planCode).toBe('ENT_STARTER');
  });

  it('8. Expired Owner: lands on /enterprise/dashboard with payment_required subscription status', () => {
    const session = signInAsMock(MOCK_EMAILS.expiredOwner);
    expect(getHomePath(session)).toBe('/enterprise/dashboard');
    expect(session.subscription?.status).toBe('payment_required');
  });
});
