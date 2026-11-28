import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useCurrentUser } from '@/hooks/use-current-user';
import { TrialProgramPage } from '../pages/TrialProgramPage';
import { SURVEY_EXPECTATION_PATH } from '../lib/survey-draft';

const { ceilings, program } = vi.hoisted(() => ({
  ceilings: { current: null as unknown },
  program: { current: null as unknown },
}));

/** Positions, the first `set` with their own levels in "Khung năng lực số". */
const matrix = (set: number, total = 3) => ({
  levels: [], domains: [],
  positions: Array.from({ length: total }, (_, index) => ({ positionId: `p${index}`, code: `P${index}`, name: `Vị trí ${index + 1}`, departments: [], isCustomized: index < set, ceilings: [] })),
});
const survey = (stage: string) => ({
  stage, organizationName: 'Sao Mai', testDeadline: stage === 'SETUP' ? null : new Date(Date.now() + 86400000).toISOString(),
  choiceCount: 90, essayCount: 3, departments: [], positions: [],
  participants: stage === 'SETUP' ? [] : [{ id: 'p1', fullName: 'Nhân viên 1', email: 'nv1@example.test', status: 'ACTIVE', addedAt: '2026-11-18T00:00:00Z' }],
});

vi.mock('@/hooks/use-trial-program', () => ({
  useTrialProgram: () => ({ data: program.current }),
  useInviteTrialParticipants: () => ({ isPending: false }),
  useSubmitTrialRequest: () => ({ isPending: false, mutate: vi.fn(), mutateAsync: vi.fn() }),
  useResendTrialInvitation: () => ({ isPending: false, mutate: vi.fn() }),
}));
vi.mock('@/hooks/use-capability-ceilings', () => ({
  useCapabilityCeilings: () => ({ data: ceilings.current }),
}));
vi.mock('@/hooks/use-permission', async (original) => ({ ...(await original<typeof import('@/hooks/use-permission')>()), usePermission: () => ({ can: () => true }) }));
vi.mock('@/hooks/use-departments', () => ({ useDepartments: () => ({}) }));
vi.mock('@/hooks/use-job-positions', () => ({ useJobPositions: () => ({}) }));
vi.mock('../components/OwnerSurveyAction', () => ({ OwnerSurveyAction: () => null }));

beforeEach(() => {
  useCurrentUser.setState({ user: { id: 'owner-1', email: 'owner@example.test', fullName: 'Chủ', roles: ['OWNER'], permissions: [], workspace: 'enterprise', enterpriseTrialStatus: 'trial_active' }, isAuthenticated: true });
});
afterEach(() => {
  cleanup();
  sessionStorage.clear();
  useCurrentUser.setState({ user: null, isAuthenticated: false });
});

function Where() {
  const location = useLocation();
  return <p data-testid="where">{location.pathname}{location.search}</p>;
}

const renderAt = (entry = '/enterprise/trial') => render(
  <MemoryRouter initialEntries={[entry]}>
    <Routes>
      <Route path="/enterprise/trial" element={<TrialProgramPage />} />
      <Route path="*" element={<Where />} />
    </Routes>
  </MemoryRouter>,
);
const currentStep = () => screen.getByRole('navigation', { name: 'Tiến độ khảo sát' }).querySelector('[aria-current="step"]');
const typeFirstPerson = () => {
  fireEvent.change(screen.getByRole('textbox', { name: 'Họ và tên dòng 1' }), { target: { value: 'Nguyễn Văn An' } });
  fireEvent.change(screen.getByRole('textbox', { name: 'Email dòng 1' }), { target: { value: 'an@example.test' } });
  fireEvent.change(screen.getByRole('combobox', { name: 'Phòng ban dòng 1' }), { target: { value: 'Kế toán' } });
  fireEvent.change(screen.getByRole('combobox', { name: 'Vị trí dòng 1' }), { target: { value: 'Kế toán viên' } });
};

it('has three steps and asks after the list what the results are compared with', () => {
  program.current = survey('SETUP');
  ceilings.current = matrix(0);
  renderAt();
  const steps = screen.getByRole('navigation', { name: 'Tiến độ khảo sát' });
  expect(within(steps).getAllByRole('listitem').filter((item) => item.getAttribute('aria-hidden') !== 'true')
    .map((item) => item.querySelector('.trial-progress__label')?.textContent))
    .toEqual(['Chọn người làm bài', 'Đặt hạn, gửi lời mời', 'Làm bài & nhận kết quả']);

  typeFirstPerson();
  fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục đặt hạn' }));
  const dialog = screen.getByRole('dialog', { name: 'Kết quả sẽ so với mức nào?' });
  expect(within(dialog).getByRole('button', { name: /Tự đặt ở Khung năng lực số/ })).toBeInTheDocument();

  // No department has its own levels: keep the system suggestion and go on to the deadline.
  fireEvent.click(within(dialog).getByRole('button', { name: /Dùng đề xuất của hệ thống/ }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(currentStep()).toHaveTextContent('Đặt hạn, gửi lời mời');
  expect(screen.getByText('Kết quả sẽ so với:').parentElement).toHaveTextContent('chuẩn vị trí của từng người (đề xuất của hệ thống)');
});

it('keeps the levels positions already have', () => {
  program.current = survey('SETUP');
  ceilings.current = matrix(2);
  renderAt();
  typeFirstPerson();
  fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục đặt hạn' }));
  const keep = within(screen.getByRole('dialog')).getByRole('button', { name: /Dùng mức các vị trí đã đặt/ });
  expect(keep).toHaveTextContent('2 vị trí đã đặt mức');
  fireEvent.click(keep);
  expect(currentStep()).toHaveTextContent('Đặt hạn, gửi lời mời');
  expect(screen.getByText('Kết quả sẽ so với:').parentElement).toHaveTextContent('mức cần đạt của 2/3 vị trí đã đặt');
});

it('sends the owner to "Khung năng lực số" to set it, then comes back to the deadline with the list kept', () => {
  program.current = survey('SETUP');
  ceilings.current = matrix(0);
  const { unmount } = renderAt();
  typeFirstPerson();
  fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục đặt hạn' }));
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: /Tự đặt ở Khung năng lực số/ }));
  expect(screen.getByTestId('where')).toHaveTextContent(SURVEY_EXPECTATION_PATH);
  unmount();

  ceilings.current = matrix(1);
  renderAt('/enterprise/trial?resume=1');
  expect(currentStep()).toHaveTextContent('Đặt hạn, gửi lời mời');
  expect(screen.getByText('Kết quả sẽ so với:').parentElement).toHaveTextContent('mức cần đạt của 1/3 vị trí đã đặt');
  fireEvent.click(screen.getByRole('button', { name: 'Quay lại danh sách' }));
  expect(screen.getByRole('textbox', { name: 'Họ và tên dòng 1' })).toHaveValue('Nguyễn Văn An');
});

it('closing the popup stays on the list', () => {
  program.current = survey('SETUP');
  ceilings.current = matrix(0);
  renderAt();
  typeFirstPerson();
  fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục đặt hạn' }));
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Đóng' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(currentStep()).toHaveTextContent('Chọn người làm bài');
});

it('after the invitations says what results are compared with and links to change it', () => {
  program.current = survey('REQUESTED');
  ceilings.current = matrix(0);
  renderAt();
  expect(currentStep()).toHaveTextContent('Làm bài & nhận kết quả');
  expect(screen.getByText(/bạn chưa đặt mức cho vị trí nào/)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Đặt mức cho vị trí' })).toHaveAttribute('href', SURVEY_EXPECTATION_PATH);
});
