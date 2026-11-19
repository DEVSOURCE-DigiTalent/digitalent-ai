import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import { TrialProgramPage } from '../pages/TrialProgramPage';

const submit = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const { program, setupProgram } = vi.hoisted(() => ({
  program: { current: null as unknown },
  setupProgram: { stage: 'SETUP', organizationName: 'DigiTalent', participants: [{ id: '1' }], departments: [], positions: [] },
}));
vi.mock('@/hooks/use-trial-program', () => ({
  useTrialProgram: () => ({ data: program.current ?? setupProgram }),
  useInviteTrialParticipants: () => ({ isPending: false }),
  useSubmitTrialRequest: () => ({ isPending: false, mutateAsync: submit }),
  useResendTrialInvitation: () => ({ isPending: false, mutate: vi.fn() }),
}));
vi.mock('@/hooks/use-departments', () => ({ useDepartments: () => ({}) }));
vi.mock('@/hooks/use-capability-ceilings', () => ({
  useCapabilityCeilings: () => ({ data: { domains: [], positions: [], levels: [] } }),
}));
vi.mock('@/hooks/use-permission', async (original) => ({ ...(await original<typeof import('@/hooks/use-permission')>()), usePermission: () => ({ can: () => true }) }));
vi.mock('@/hooks/use-job-positions', () => ({ useJobPositions: () => ({}) }));
vi.mock('../components/OwnerSurveyAction', () => ({ OwnerSurveyAction: () => null }));
afterEach(() => { cleanup(); program.current = null; });

/** List → popup "Kết quả sẽ so với mức nào?" (keep the system suggestion) → deadline. */
function goToDeadline() {
  fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục đặt hạn' }));
  fireEvent.click(within(screen.getByRole('dialog', { name: 'Kết quả sẽ so với mức nào?' })).getByRole('button', { name: /Dùng đề xuất của hệ thống/ }));
}

it('keeps taking the test and getting results in one last step that says what is happening', () => {
  const participant = (id: string) => ({ id, fullName: `Nhân viên ${id}`, email: `nv${id}@example.test`, status: 'SUBMITTED', addedAt: '2026-11-10T00:00:00Z' });
  const deadline = new Date(Date.now() + 86400000).toISOString();
  program.current = { ...setupProgram, stage: 'ASSIGNED', testDeadline: deadline, choiceCount: 90, essayCount: 3, participants: [participant('1'), participant('2')] };
  render(<MemoryRouter><TrialProgramPage /></MemoryRouter>);
  const steps = screen.getByRole('navigation', { name: 'Tiến độ khảo sát' });
  expect(within(steps).getAllByRole('listitem').filter((item) => item.getAttribute('aria-hidden') !== 'true')).toHaveLength(3);
  const current = steps.querySelector('[aria-current="step"]');
  expect(current).toHaveTextContent('Làm bài & nhận kết quả');
  expect(current).toHaveTextContent('Chuyên gia đang chấm');
  expect(screen.getByText(/Chuyên gia DigiTalent đang chấm bài/)).toBeInTheDocument();
});

it('puts the deadline change in the progress header and filters ten people by status and department', () => {
  const person = (id: number, status: string, departmentName: string) => ({
    id: `p${id}`, fullName: `Nhân viên ${id}`, email: `nv${id}@example.test`, departmentName, status, addedAt: '2026-11-10T00:00:00Z',
    ...(status === 'INVITED' ? { invitationId: `i${id}` } : {}),
    ...(status === 'SUBMITTED' ? { submittedAt: '2026-11-17T09:00:00Z' } : {}),
  });
  program.current = {
    ...setupProgram, stage: 'REQUESTED', testDeadline: new Date(Date.now() + 3 * 86400000).toISOString(), choiceCount: 90, essayCount: 3,
    participants: [
      person(1, 'SUBMITTED', 'CEO'), person(2, 'SUBMITTED', 'CEO'), person(3, 'SUBMITTED', 'Kế toán'), person(4, 'ACTIVE', 'Kế toán'),
      person(5, 'INVITED', 'Kế toán'), person(6, 'SUBMITTED', 'Marketing'), person(7, 'ACTIVE', 'Marketing'), person(8, 'INVITED', 'Marketing'),
      person(9, 'ACTIVE', 'Kinh doanh'), person(10, 'INVITED', 'Kinh doanh'),
    ],
  };
  render(<MemoryRouter><TrialProgramPage /></MemoryRouter>);

  expect(screen.queryByText(/người đã nộp/)).not.toBeInTheDocument();
  expect(screen.getByText('Khi mọi người nộp xong hoặc hết hạn, hệ thống sẽ trả kết quả đánh giá.')).toBeInTheDocument();
  const change = screen.getByRole('button', { name: 'Đổi hạn nộp' });
  expect(change).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(change);
  expect(screen.getByRole('button', { name: 'Đóng' })).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByRole('region', { name: 'Chọn ngày nộp bài' })).toBeInTheDocument();

  // Progress and legend are one strip whose groups filter the list; no separate status menu.
  const table = () => screen.getAllByRole('table').at(-1)!;
  const strip = screen.getByRole('group', { name: 'Lọc danh sách theo trạng thái' });
  expect(screen.queryByRole('combobox', { name: 'Lọc theo trạng thái' })).not.toBeInTheDocument();
  const inactive = within(strip).getByRole('button', { name: 'Chưa kích hoạt 3' });
  fireEvent.click(inactive);
  expect(inactive).toHaveAttribute('aria-pressed', 'true');
  expect(within(table()).getAllByRole('row')).toHaveLength(4);
  expect(screen.getByRole('button', { name: 'Bỏ lọc Chưa kích hoạt' })).toHaveTextContent('Chưa kích hoạt (3)');
  fireEvent.click(screen.getByRole('combobox', { name: 'Lọc theo phòng ban' }));
  fireEvent.click(screen.getByRole('option', { name: 'Kế toán (3)' }));
  expect(within(table()).getAllByRole('row')).toHaveLength(2);
  expect(within(table()).getByText('Nhân viên 5')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Bỏ lọc Chưa kích hoạt' }));
  expect(inactive).toHaveAttribute('aria-pressed', 'false');
  expect(within(table()).getAllByRole('row')).toHaveLength(4);
});

it('hides the participant list once results are out, and keeps it when nobody submitted', () => {
  const reported = { ...setupProgram, stage: 'REPORTED', testDeadline: new Date(Date.now() - 86400000).toISOString(), choiceCount: 90, essayCount: 3,
    participants: [{ id: 'p1', fullName: 'Nhân viên 1', email: 'nv1@example.test', status: 'REVIEWED', submittedAt: '2026-11-17T09:00:00Z', addedAt: '2026-11-10T00:00:00Z' }] };
  program.current = { ...reported, report: { publishedAt: '2026-11-18T02:00:00Z', assessed: 1, domains: [], summary: [], employees: [] } };
  const { unmount } = render(<MemoryRouter><TrialProgramPage /></MemoryRouter>);
  expect(screen.queryByRole('heading', { name: 'Danh sách người làm bài' })).not.toBeInTheDocument();
  unmount();

  program.current = { ...reported, participants: [{ ...reported.participants[0], status: 'ACTIVE', submittedAt: null }], report: null };
  render(<MemoryRouter><TrialProgramPage /></MemoryRouter>);
  expect(screen.getByRole('heading', { name: 'Danh sách người làm bài' })).toBeInTheDocument();
});

it('opens a separate deadline step and submits only the selected local deadline', async () => {
  render(<MemoryRouter><TrialProgramPage /></MemoryRouter>);
  const steps = screen.getByRole('navigation', { name: 'Tiến độ khảo sát' });
  expect(steps.querySelector('[aria-current="step"]')).toHaveTextContent('Chọn người làm bài');
  goToDeadline();
  expect(steps.querySelector('[aria-current="step"]')).toHaveTextContent('Đặt hạn, gửi lời mời');
  expect(screen.queryByRole('heading', { name: 'Danh sách người làm bài' })).not.toBeInTheDocument();
  const time = screen.getByRole('region', { name: 'Chọn giờ nộp bài' });
  fireEvent.change(within(time).getByRole('textbox', { name: 'Giờ' }), { target: { value: '19' } });
  fireEvent.change(within(time).getByRole('textbox', { name: 'Phút' }), { target: { value: '5' } });
  const calendar = screen.getByRole('region', { name: 'Chọn ngày nộp bài' });
  const selectedDay = Number(within(calendar).getByRole('button', { pressed: true }).textContent);
  const expected = new Date();
  expected.setDate(expected.getDate() + 3);
  expected.setHours(19, 5, 0, 0);
  expect(selectedDay).toBe(expected.getDate());
  fireEvent.click(screen.getByRole('button', { name: 'Gửi lời mời & bắt đầu khảo sát' }));
  await waitFor(() => expect(submit).toHaveBeenCalledWith({ testDeadline: expected.toISOString() }));
});

it('adds a draft row on its own page and preserves edits when navigating back', () => {
  render(<MemoryRouter><TrialProgramPage /></MemoryRouter>);
  fireEvent.change(screen.getByRole('textbox', { name: 'Họ và tên dòng 1' }), { target: { value: 'Nguyễn Văn An' } });
  for (let index = 0; index < 8; index += 1) {
    fireEvent.click(screen.getByRole('button', { name: 'Thêm dòng mới' }));
  }
  expect(screen.getByRole('textbox', { name: 'Họ và tên dòng 11' })).toBeInTheDocument();
  const pages = screen.getByRole('navigation', { name: 'Phân trang danh sách nhân viên' });
  fireEvent.click(within(pages).getByRole('button', { name: 'Trước' }));
  expect(screen.getByRole('textbox', { name: 'Họ và tên dòng 1' })).toHaveValue('Nguyễn Văn An');
});

it('blocks out-of-range time and lets a preset replace it', () => {
  render(<MemoryRouter><TrialProgramPage /></MemoryRouter>);
  goToDeadline();
  const hour = screen.getByRole('textbox', { name: 'Giờ' });
  const minute = screen.getByRole('textbox', { name: 'Phút' });
  const submitButton = screen.getByRole('button', { name: 'Gửi lời mời & bắt đầu khảo sát' });
  fireEvent.change(hour, { target: { value: '24' } });
  expect(hour).toHaveAttribute('aria-invalid', 'true');
  expect(submitButton).toBeDisabled();
  const preset = screen.getByRole('button', { name: '23:59' });
  fireEvent.click(preset);
  expect(preset).toHaveAttribute('aria-pressed', 'true');
  expect(hour).toHaveValue('23');
  expect(minute).toHaveValue('59');
  expect(submitButton).toBeEnabled();
});

it('keeps all survey participants when pasting more than 30 rows', () => {
  render(<MemoryRouter><TrialProgramPage /></MemoryRouter>);
  fireEvent.click(screen.getByRole('button', { name: 'Nhập từ file Excel / CSV' }));
  fireEvent.click(screen.getByRole('button', { name: 'Dán dữ liệu trực tiếp từ Excel' }));
  const rows = Array.from({ length: 35 }, (_, index) => `Nhân viên ${index + 1}\temp${index}@example.test\tKỹ thuật\tChuyên viên`);
  fireEvent.change(screen.getByPlaceholderText(/Dán các dòng/), { target: { value: rows.join('\n') } });
  fireEvent.click(screen.getByRole('button', { name: 'Đọc danh sách nhân viên' }));
  expect(screen.getByText('35 người')).toBeInTheDocument();
  const pages = screen.getByRole('navigation', { name: 'Phân trang danh sách nhân viên' });
  for (let index = 0; index < 3; index++) fireEvent.click(within(pages).getByRole('button', { name: 'Sau' }));
  expect(screen.getByRole('textbox', { name: 'Họ và tên dòng 35' })).toHaveValue('Nhân viên 35');
});
