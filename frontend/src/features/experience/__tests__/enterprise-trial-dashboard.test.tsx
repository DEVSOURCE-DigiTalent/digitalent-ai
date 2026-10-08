import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { trialDashboardModel } from '../enterprise-trial/trial-dashboard-model';
import { TrialDashboardOverview } from '../enterprise-trial/TrialDashboardOverview';
import { sidebarFor } from '@/lib/sidebars';
import { useCurrentUser } from '@/hooks/use-current-user';
import type { TrialContextDto } from '@/services/enterprise-trial.service';

const api = vi.hoisted(() => Object.fromEntries([
  'context', 'catalog', 'invitations', 'selectPosition', 'invite', 'resendInvitation',
  'results', 'requestConversion',
].map((key) => [key, vi.fn()])));

vi.mock('@/services/enterprise-trial.service', () => ({ enterpriseTrialService: api }));

const ok = (data: unknown) => ({ data: { success: true, data, message: '', errors: [] } });
const baseContext: TrialContextDto = {
  organizationId: 'org-1',
  status: 'trial_active',
  startedAt: '2026-10-06T00:00:00.000Z',
  endsAt: '2026-10-20T00:00:00.000Z',
  policyVersion: 'enterprise-trial-v1',
  limits: {
    durationDays: 14,
    maxAccounts: 5,
    policyVersion: 'enterprise-trial-v1',
    maxDiagnosticAttempts: 1,
    verificationHours: 24,
    invitationHours: 72,
    maxInvitationSends: 3,
    resendCooldownSeconds: 60,
    policyApproved: true,
    dataPolicyNotice: 'Dữ liệu demo được giữ ở chế độ chỉ đọc sau khi hết hạn.',
    enableDevelopmentCapture: true,
    enableDevelopmentBundle: true,
    publicAppUrl: 'http://localhost:5173',
    developmentEnvironment: true,
  },
  usage: { accounts: 1, pendingInvitations: 1 },
  allowedActions: ['select_position', 'invite', 'view_results', 'request_conversion'],
  selectedPosition: null,
  checklist: [
    { key: 'position', complete: false, nextAction: 'select_position' },
    { key: 'invite', complete: false, nextAction: 'invite' },
    { key: 'assessment', complete: false, nextAction: 'await_assessment' },
    { key: 'results', complete: false, nextAction: 'view_results' },
  ],
  publicationReadiness: {
    canRegister: true,
    productionReady: false,
    developmentOnly: true,
    missingReasons: [],
  },
};

function mount() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <TrialDashboardOverview now={new Date('2026-10-07T00:00:00.000Z')} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.resetAllMocks();
  useCurrentUser.getState().setUser({
    id: 'owner-1',
    email: 'owner@example.test',
    fullName: 'Nguyễn Minh',
    roles: ['OWNER'],
    permissions: [],
    workspace: 'enterprise',
    enterpriseTrialStatus: 'trial_active',
  });
  api.context.mockResolvedValue(ok(baseContext));
  api.catalog.mockResolvedValue(ok([]));
  api.invitations.mockResolvedValue(ok([]));
  api.results.mockResolvedValue(ok([]));
});

describe('enterprise trial dashboard model', () => {
  it('derives remaining time, seat usage, progress and the next action from server context', () => {
    const model = trialDashboardModel(baseContext, ['OWNER'], new Date('2026-10-07T00:00:00.000Z'));

    expect(model.remainingLabel).toBe('Còn 13 ngày');
    expect(model.usedSeats).toBe(2);
    expect(model.remainingSeats).toBe(3);
    expect(model.completedSteps).toBe(0);
    expect(model.progressPercent).toBe(0);
    expect(model.nextAction.label).toBe('Chọn vị trí mẫu');
    expect(model.nextAction.href).toBe('/enterprise/positions');
  });

  it('uses hours on the final day and becomes read-only at expiry', () => {
    const finalDay = trialDashboardModel(baseContext, ['OWNER'], new Date('2026-10-19T18:00:00.000Z'));
    const expired = trialDashboardModel(baseContext, ['OWNER'], new Date('2026-10-20T00:00:00.000Z'));

    expect(finalDay.remainingLabel).toBe('Còn 6 giờ');
    expect(finalDay.writable).toBe(true);
    expect(expired.remainingLabel).toBe('Đã hết thời gian thử');
    expect(expired.writable).toBe(false);
  });
});

describe('enterprise trial dashboard UI', () => {
  it('shows a compact command center and does not mark results viewed on load', async () => {
    mount();

    expect(await screen.findByRole('heading', { name: /Hoàn tất một vòng trải nghiệm/ })).toBeInTheDocument();
    expect(screen.getByText('Còn 13 ngày')).toBeInTheDocument();
    expect(screen.getByText('2 / 5')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByRole('link', { name: 'Chọn vị trí mẫu' })).toHaveAttribute('href', '/enterprise/positions');
    expect(api.results).not.toHaveBeenCalled();
  });

  it('sends the owner to the existing assessment results page instead of rendering results on the dashboard', async () => {
    api.context.mockResolvedValue(ok({
      ...baseContext,
      selectedPosition: { positionId: 'p', departmentId: 'd', name: 'CRM', requirementVersion: 'v1' },
      checklist: baseContext.checklist.map((item) => ({ ...item, complete: item.key !== 'results' })),
    }));
    mount();

    expect(await screen.findByRole('link', { name: 'Xem kết quả trial' })).toHaveAttribute('href', '/enterprise/assessment-results');
    expect(screen.queryByText('Kết quả người tham gia')).not.toBeInTheDocument();
    expect(api.results).not.toHaveBeenCalled();
  });

  it('routes employees to the existing assessment screen', async () => {
    useCurrentUser.getState().setUser({
      id: 'employee-1', email: 'employee@example.test', fullName: 'Nhân viên', roles: ['EMPLOYEE'],
      permissions: [], workspace: 'enterprise', enterpriseTrialStatus: 'trial_active',
    });
    api.context.mockResolvedValue(ok({
      ...baseContext,
      selectedPosition: { positionId: 'p', departmentId: 'd', name: 'CRM', requirementVersion: 'v1' },
      allowedActions: ['diagnostic', 'learning', 'read'],
      checklist: baseContext.checklist.map((item) => ({ ...item, complete: item.key === 'position' || item.key === 'invite' })),
    }));
    mount();

    expect(await screen.findByRole('link', { name: 'Hoàn thành đánh giá' })).toHaveAttribute('href', '/enterprise/me/assessments');
    expect(screen.queryByText('Bài đánh giá và lộ trình của bạn')).not.toBeInTheDocument();
  });
});

describe('trial sidebar', () => {
  it('uses a reduced owner navigation and leaves premium learning visibly locked', () => {
    const config = sidebarFor({
      id: 'owner-1', email: 'owner@example.test', fullName: 'Owner', roles: ['OWNER'], permissions: [],
      workspace: 'enterprise', enterpriseTrialStatus: 'trial_active',
      subscription: { planCode: 'ENT_TRIAL', planName: 'Dùng thử Enterprise', status: 'trialing', entitlements: [] },
    });

    expect(config.map((item) => item.label)).toEqual(['Tổng quan', 'Thiết lập', 'Kết quả', 'Khám phá thêm', 'Nâng cấp']);
    expect(config.flatMap((item) => item.items ?? []).some((item) => item.screenId === 'OW-31')).toBe(true);
  });
});
