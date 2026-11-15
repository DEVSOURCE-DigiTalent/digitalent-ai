import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import { TrialProgramPage } from '../pages/TrialProgramPage';

const submit = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
vi.mock('@/hooks/use-trial-program', () => ({
  useTrialProgram: () => ({ data: { stage: 'SETUP', organizationName: 'DigiTalent', participants: [{ id: '1' }], departments: [], positions: [], maxParticipants: 30 } }),
  useInviteTrialParticipants: () => ({ isPending: false }),
  useSubmitTrialRequest: () => ({ isPending: false, mutateAsync: submit }),
}));
vi.mock('@/hooks/use-departments', () => ({ useDepartments: () => ({}) }));
vi.mock('@/hooks/use-job-positions', () => ({ useJobPositions: () => ({}) }));
vi.mock('../components/OwnerSurveyAction', () => ({ OwnerSurveyAction: () => null }));
afterEach(cleanup);

it('opens a separate deadline step and submits only the selected local deadline', async () => {
  render(<MemoryRouter><TrialProgramPage /></MemoryRouter>);
  const steps = screen.getByRole('navigation', { name: 'Tiến trình đánh giá' });
  expect(steps.querySelector('[aria-current="step"]')).toHaveTextContent('Nhân sự tham gia');
  fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục đặt hạn' }));
  expect(steps.querySelector('[aria-current="step"]')).toHaveTextContent('Hạn làm bài');
  expect(screen.queryByRole('heading', { name: 'Danh sách nhân sự tham gia' })).not.toBeInTheDocument();
  const time = screen.getByRole('region', { name: 'Chọn giờ nộp bài' });
  fireEvent.change(within(time).getByRole('textbox', { name: 'Giờ' }), { target: { value: '19' } });
  fireEvent.change(within(time).getByRole('textbox', { name: 'Phút' }), { target: { value: '5' } });
  const calendar = screen.getByRole('region', { name: 'Chọn ngày nộp bài' });
  const selectedDay = Number(within(calendar).getByRole('button', { pressed: true }).textContent);
  const expected = new Date();
  expected.setDate(expected.getDate() + 3);
  expected.setHours(19, 5, 0, 0);
  expect(selectedDay).toBe(expected.getDate());
  fireEvent.click(screen.getByRole('button', { name: 'Gửi lời mời & bắt đầu đánh giá' }));
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
  fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục đặt hạn' }));
  const hour = screen.getByRole('textbox', { name: 'Giờ' });
  const minute = screen.getByRole('textbox', { name: 'Phút' });
  const submitButton = screen.getByRole('button', { name: 'Gửi lời mời & bắt đầu đánh giá' });
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
