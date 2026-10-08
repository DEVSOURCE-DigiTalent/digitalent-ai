import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TrialRegisterPage, TrialVerifyPage, TrialAcceptPage } from '../enterprise-trial/PublicTrialPages';
import { TrialWorkspacePage } from '../enterprise-trial/TrialWorkspacePage';
import { useCurrentUser } from '@/hooks/use-current-user';
import publicRoutesSource from '@/app/routes/public.routes.tsx?raw';
import enterpriseRoutesSource from '@/app/routes/enterprise.routes.tsx?raw';

const api = vi.hoisted(() => Object.fromEntries(['readiness', 'catalog', 'register', 'verify', 'accept', 'login', 'currentUser', 'context', 'selectPosition', 'invitations', 'invite', 'resendInvitation', 'diagnostic', 'startDiagnostic', 'saveAnswers', 'submitDiagnostic', 'result', 'path', 'startPathItem', 'progressPathItem', 'pathContent', 'results', 'requestConversion'].map(key => [key, vi.fn()])));
vi.mock('@/services/enterprise-trial.service', () => ({ enterpriseTrialService: api }));
vi.mock('@/features/auth/components/AuthShell', () => ({ AuthShell: ({ title, children }: { title: string; children: React.ReactNode }) => <main><h1>{title}</h1>{children}</main> }));
const ok = (data: unknown) => ({ data: { success: true, data, message: '', errors: [] } });
const readiness = { canRegister: true, productionReady: false, developmentOnly: true, missingReasons: [] };
const selectedPosition = { positionId: 'position', departmentId: 'department', name: 'CRM', requirementVersion: 'requirements-v1' };
const context = { organizationId: 'org', status: 'trial_active', startedAt: '2026-10-06', endsAt: '2026-10-20', policyVersion: 'v1', limits: { durationDays: 14, maxAccounts: 5, maxDiagnosticAttempts: 1, dataPolicyNotice: 'Read only after expiry; contact owner to delete data.' }, usage: { accounts: 1, pendingInvitations: 0 }, selectedPosition, allowedActions: ['select_position', 'invite', 'view_results', 'request_conversion'], checklist: [{ key: 'position', complete: true, nextAction: 'invite' }], publicationReadiness: readiness };
const catalog = [{ catalogKey: 'crm', name: 'CRM', eligible: true, requirementVersion: 'requirements-v1', assessmentVersion: 'assessment-v1', rubricVersion: 'rubric-v1', requirements: [{ competencyId: 'c1', name: 'CRM skills', requiredLevel: 2, minimumAnswers: 2 }], missingReasons: [], developmentOnly: true }];
const diagnostic = { attemptId: 'attempt', employeeId: 'employee', positionId: 'position', status: 'in_progress', positionName: 'CRM', requirementVersion: 'requirements-v1', assessmentVersion: 'assessment-v1', rubricVersion: 'rubric-v1', revision: 3, questions: [{ id: 'q1', text: 'How do you record a contact?', competencyId: 'c1', options: [{ id: 'o1', text: 'Use CRM' }, { id: 'o2', text: 'Skip recording' }] }], savedAnswers: [], startedAt: '2026-10-06', submittedAt: null };
const result = { sourceAttemptId: 'attempt', requirementVersion: 'requirements-v1', rubricVersion: 'rubric-v1', calculationVersion: 'calc-v1', measuredAt: '2026-10-06', items: [{ competencyId: 'c1', name: 'CRM skills', requiredLevel: 2, currentLevel: null, gapSteps: null, classification: 'insufficient_data', basis: 'Only one valid measurement' }] };
const path = { id: 'path', sourceAttemptId: 'attempt', state: 'generated', missingContentReasons: [], items: [{ id: 'first', title: 'CRM basics', version: 'v1', competencyId: 'c1', reasons: ['Measured CRM gap'], prerequisites: [], allowedToStart: true, status: 'not_started', progressPercent: 0 }, { id: 'locked', title: 'Advanced CRM', version: 'v1', competencyId: 'c1', reasons: ['Measured CRM gap'], prerequisites: ['first'], allowedToStart: false, status: 'not_started', progressPercent: 0 }] };

function mount(node: React.ReactNode, route = '/enterprise/trial') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(<QueryClientProvider client={client}><MemoryRouter initialEntries={[route]}><Routes><Route path="*" element={node} /></Routes></MemoryRouter></QueryClientProvider>);
}
function employee() {
  useCurrentUser.getState().setUser({ id: 'employee', email: 'e@org.test', fullName: 'Employee', roles: ['EMPLOYEE'], permissions: [], workspace: 'enterprise' });
  api.context.mockResolvedValue(ok({ ...context, allowedActions: ['diagnostic', 'learning', 'read'] }));
}
beforeEach(() => {
  cleanup(); vi.resetAllMocks();
  useCurrentUser.getState().setUser({ id: 'owner', email: 'o@org.test', fullName: 'Owner', roles: ['OWNER'], permissions: [], workspace: 'enterprise' });
  api.readiness.mockResolvedValue(ok(readiness)); api.catalog.mockResolvedValue(ok(catalog)); api.context.mockResolvedValue(ok(context)); api.invitations.mockResolvedValue(ok([])); api.results.mockResolvedValue(ok([])); api.diagnostic.mockResolvedValue(ok(null)); api.result.mockResolvedValue(ok(null)); api.path.mockResolvedValue(ok(null));
});

describe('guided enterprise trial', () => {
  it('registers all four route paths', () => {
    for (const route of ['/business/try', '/business/try/verify', '/business/try/accept']) expect(publicRoutesSource).toContain(`path: '${route}'`);
    expect(enterpriseRoutesSource).toContain("path: '/enterprise/trial'");
  });
  it('fails closed when server readiness denies registration', async () => {
    api.readiness.mockResolvedValue(ok({ ...readiness, canRegister: false, missingReasons: ['email_sender_unavailable'] }));
    mount(<TrialRegisterPage />);
    expect(await screen.findByText(/email_sender_unavailable/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tạo không gian dùng thử' })).toBeDisabled();
    expect(api.register).not.toHaveBeenCalled();
  });
  it('labels registration continuation development-only and uses a safe app path', async () => {
    api.register.mockResolvedValue(ok({ state: 'verification_pending', expiresAt: '2026-10-07', developmentLink: 'http://localhost:5173/business/try/verify?token=abc' }));
    mount(<TrialRegisterPage />);
    await screen.findByText(/CRM skills/);
    for (const [label, value] of [['Tên tổ chức', 'Acme'], ['Tên chủ sở hữu', 'Owner'], ['Email', 'owner@acme.test'], ['Mật khẩu', 'long-password-123']]) fireEvent.change(screen.getByLabelText(label), { target: { value } });
    fireEvent.click(screen.getByLabelText(/Tôi đồng ý/));
    fireEvent.click(screen.getByRole('button', { name: 'Tạo không gian dùng thử' }));
    expect(await screen.findByText(/Development-only/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Tiếp tục xác minh' })).toHaveAttribute('href', '/business/try/verify?token=abc');
  });
  it('verifies only once and logs in before opening workspace', async () => {
    api.verify.mockResolvedValue(ok({ email: 'owner@acme.test', role: 'Owner' })); api.login.mockResolvedValue(ok({ accessToken: 'token' })); api.currentUser.mockResolvedValue(ok({ id: 'owner', email: 'owner@acme.test', fullName: 'Owner', roles: ['OWNER'], permissions: [] }));
    mount(<TrialVerifyPage />, '/business/try/verify?token=abc');
    fireEvent.change(screen.getByLabelText('Mật khẩu'), { target: { value: 'long-password-123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập vào trial' }));
    await waitFor(() => expect(api.login).toHaveBeenCalledWith('owner@acme.test', 'long-password-123'));
    expect(api.verify).toHaveBeenCalledWith('abc', 'long-password-123');
    expect(api.verify).toHaveBeenCalledTimes(1);
  });
  it('accepts invitation once and authenticates with its server email', async () => {
    api.accept.mockResolvedValue(ok({ email: 'employee@acme.test', role: 'Employee' })); api.login.mockResolvedValue(ok({ accessToken: 'token' })); api.currentUser.mockResolvedValue(ok({ id: 'e', email: 'employee@acme.test', fullName: 'Employee', roles: ['EMPLOYEE'], permissions: [] }));
    mount(<TrialAcceptPage />, '/business/try/accept?token=abc');
    fireEvent.change(screen.getByLabelText('Mật khẩu'), { target: { value: 'long-password-123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tham gia trial' }));
    await waitFor(() => expect(api.login).toHaveBeenCalledWith('employee@acme.test', 'long-password-123'));
    expect(api.accept).toHaveBeenCalledWith('abc', 'long-password-123');
  });
  it('selects an eligible position and invites through APIs', async () => {
    api.context.mockResolvedValueOnce(ok({ ...context, selectedPosition: null })); api.selectPosition.mockResolvedValue(ok(context)); api.invite.mockResolvedValue(ok({ id: 'i', name: 'Employee', email: 'e@acme.test', role: 'Employee', state: 'pending', canResend: false }));
    mount(<TrialWorkspacePage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Dùng vị trí CRM' }));
    await waitFor(() => expect(api.selectPosition).toHaveBeenCalledWith('crm', 'Nhóm thử'));
    fireEvent.change(await screen.findByLabelText('Họ tên người tham gia'), { target: { value: 'Employee' } });
    fireEvent.change(screen.getByLabelText('Email người tham gia'), { target: { value: 'e@acme.test' } });
    fireEvent.click(screen.getByRole('button', { name: 'Gửi lời mời' }));
    await waitFor(() => expect(api.invite).toHaveBeenCalledWith('Employee', 'e@acme.test', 'Employee'));
  });
  it('autosaves answers with revision, submits once and displays server insufficient data', async () => {
    employee(); api.diagnostic.mockResolvedValue(ok(diagnostic)); api.saveAnswers.mockResolvedValue(ok({ ...diagnostic, revision: 4, savedAnswers: [{ questionId: 'q1', optionId: 'o1' }] })); api.submitDiagnostic.mockResolvedValue(ok(result));
    mount(<TrialWorkspacePage />);
    fireEvent.click(await screen.findByLabelText('Use CRM'));
    await waitFor(() => expect(api.saveAnswers).toHaveBeenCalledWith('attempt', 3, [{ questionId: 'q1', optionId: 'o1' }]));
    await screen.findByText(/Đã lưu/);
    api.diagnostic.mockResolvedValue(ok({ ...diagnostic, status: 'submitted' })); api.result.mockResolvedValue(ok(result));
    fireEvent.click(screen.getByRole('button', { name: 'Nộp bài đánh giá' }));
    expect(await screen.findByText('Chưa đủ dữ liệu')).toBeInTheDocument();
    expect(screen.getByText('Only one valid measurement')).toBeInTheDocument();
    expect(api.submitDiagnostic).toHaveBeenCalledTimes(1);
  });
  it('starts, opens content and saves progress through APIs; locks prerequisites', async () => {
    employee(); api.diagnostic.mockResolvedValue(ok({ ...diagnostic, status: 'submitted' })); api.result.mockResolvedValue(ok(result)); api.path.mockResolvedValue(ok(path)); api.startPathItem.mockResolvedValue(ok({ ...path, items: [{ ...path.items[0], status: 'in_progress' }, path.items[1]] })); api.pathContent.mockResolvedValue(ok({ itemId: 'first', title: 'CRM basics', version: 'v1', body: 'Published lesson body' })); api.progressPathItem.mockResolvedValue(ok(path));
    mount(<TrialWorkspacePage />);
    expect(await screen.findByRole('button', { name: 'Bắt đầu Advanced CRM' })).toBeDisabled();
    api.path.mockResolvedValue(ok({ ...path, items: [{ ...path.items[0], status: 'in_progress' }, path.items[1]] }));
    fireEvent.click(screen.getByRole('button', { name: 'Bắt đầu CRM basics' }));
    await waitFor(() => expect(api.startPathItem).toHaveBeenCalledWith('first'));
    api.path.mockResolvedValue(ok({ ...path, items: [{ ...path.items[0], status: 'in_progress' }, path.items[1]] }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Đọc CRM basics' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Đọc CRM basics' }));
    expect(await screen.findByText('Published lesson body')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Tiến độ CRM basics'), { target: { value: '50' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu tiến độ CRM basics' }));
    await waitFor(() => expect(api.progressPathItem).toHaveBeenCalledWith('first', 50));
  });
  it('renders manager result and path details without owner write actions', async () => {
    useCurrentUser.getState().setUser({ id: 'm', email: 'm@org.test', fullName: 'Manager', roles: ['MANAGER'], permissions: [] }); api.context.mockResolvedValue(ok({ ...context, allowedActions: ['view_results', 'read'] })); api.results.mockResolvedValue(ok([{ invitationId: 'i', employeeId: 'e', name: 'Alice', role: 'Employee', state: 'learning_in_progress', result, path }]));
    mount(<TrialWorkspacePage />);
    expect(await screen.findByText('Alice')).toBeInTheDocument(); expect(screen.getByText('Chưa đủ dữ liệu')).toBeInTheDocument(); expect(screen.getByText('CRM basics')).toBeInTheDocument(); expect(screen.queryByRole('button', { name: 'Gửi lời mời' })).not.toBeInTheDocument();
  });
  it('preserves owner history and disables writes when expired', async () => {
    api.context.mockResolvedValue(ok({ ...context, status: 'trial_read_only', allowedActions: ['read', 'request_conversion'] })); api.results.mockResolvedValue(ok([{ invitationId: 'i', name: 'Pending person', role: 'Employee', state: 'pending_invitation', result: null, path: null }]));
    mount(<TrialWorkspacePage />);
    expect(await screen.findByText(/Chỉ đọc/)).toBeInTheDocument(); expect(await screen.findByText('Pending person')).toBeInTheDocument(); expect(screen.getByRole('button', { name: 'Gửi lời mời' })).toBeDisabled(); expect(screen.getByRole('link', { name: 'Xem gói phù hợp' })).toHaveAttribute('href', '/business/pricing');
  });
  it('refetches context on remount instead of using client business truth', async () => {
    const first = mount(<TrialWorkspacePage />); await screen.findByText(/requirements-v1/); first.unmount(); mount(<TrialWorkspacePage />); await screen.findByText(/requirements-v1/); expect(api.context).toHaveBeenCalledTimes(2);
  });
});
