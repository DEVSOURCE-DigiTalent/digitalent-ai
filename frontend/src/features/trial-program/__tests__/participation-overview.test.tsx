import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { ParticipationOverview } from '../components/ParticipationOverview';
import type { TrialParticipant } from '@/services/trial-program.service';

afterEach(cleanup);

const addedAt = '2026-11-10T08:00:00Z';
const participants: TrialParticipant[] = [
  { id: '1', fullName: 'Bùi Thanh Tùng', email: 'tung@example.test', departmentName: 'Kinh doanh', positionName: 'Sales / CRM', status: 'REVIEWED', submittedAt: '2026-11-15T12:51:00Z', addedAt },
  { id: '2', fullName: 'Lê Đức Anh', email: 'anh@example.test', departmentName: 'Kế toán', positionName: 'Kế toán', status: 'ACTIVE', invitationId: 'inv-2', addedAt },
  { id: '3', fullName: 'Ngô Khánh Linh', email: 'linh@example.test', departmentName: 'Kế toán', status: 'INVITED', invitationId: 'inv-3', addedAt },
];
const future = new Date(Date.now() + 5 * 86_400_000 + 3_600_000).toISOString();

describe('participation overview', () => {
  it('summarizes progress without a participant list and keeps people one hover away', () => {
    render(<ParticipationOverview participants={participants} reported={false} deadline={future}
      personActions={(p) => <button type="button">Gửi lại {p.fullName}</button>} />);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: '1/3 người đã nộp bài' })).toBeInTheDocument();
    expect(screen.getByText('Còn 5 ngày')).toBeInTheDocument();
    // Before the report a graded submission still reads as submitted.
    expect(screen.getByRole('button', { name: /Đã nộp\s*1/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Đã chấm/ })).not.toBeInTheDocument();

    fireEvent.focus(screen.getByRole('button', { name: 'Bùi Thanh Tùng · Đã nộp' }));
    expect(within(screen.getByRole('tooltip')).getByText('tung@example.test')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Gửi lại/ })).not.toBeInTheDocument();
  });

  it('pins a person for actions and closes with Escape', () => {
    render(<ParticipationOverview participants={participants} reported={false} deadline={future}
      personActions={(p) => <button type="button">Gửi lại {p.fullName}</button>} />);
    const avatar = screen.getByRole('button', { name: 'Lê Đức Anh · Chưa làm bài' });
    fireEvent.click(avatar);
    const dialog = screen.getByRole('dialog', { name: 'Lê Đức Anh' });
    expect(within(dialog).getByRole('button', { name: 'Gửi lại Lê Đức Anh' })).toBeInTheDocument();
    expect(avatar).toHaveAttribute('aria-expanded', 'true');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('filters by status and search by dimming, not by removing people', () => {
    render(<ParticipationOverview participants={participants} reported deadline={future} />);
    const chip = screen.getByRole('button', { name: /Chưa kích hoạt\s*1/ });
    fireEvent.click(chip);
    expect(chip).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Bùi Thanh Tùng · Đã chấm' })).toHaveAttribute('data-dim', 'true');
    expect(screen.getByRole('button', { name: 'Ngô Khánh Linh · Chưa kích hoạt' })).toHaveAttribute('data-dim', 'false');
    fireEvent.click(chip);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Tìm nhân viên' }), { target: { value: 'linh' } });
    expect(screen.getByRole('status')).toHaveTextContent('1/3');
  });
});
