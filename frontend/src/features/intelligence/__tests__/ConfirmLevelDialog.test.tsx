import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AxiosError, AxiosHeaders } from 'axios';
import { toast } from 'sonner';
import * as evidenceHooks from '@/hooks/use-competency-evidences';
import type { SkillGapRunDetail } from '@/services/intelligence.service';
import { ConfirmLevelDialog } from '../components/ConfirmLevelDialog';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const run = {
  runId: 'run-1',
  employeeId: 'emp-1',
  employeeName: 'Employee',
  items: [
    { competencyId: 'c1', competencyName: 'Data literacy', requiredLevel: 3, currentLevel: 1, gapSteps: 2 },
    { competencyId: 'c3', competencyName: 'Information security', requiredLevel: 2, currentLevel: null, gapSteps: 2 },
  ],
} as unknown as SkillGapRunDetail;

function setup(mutateAsync = vi.fn().mockResolvedValue({ confirmedLevel: 2 })) {
  vi.spyOn(evidenceHooks, 'useCreateManualEvidence').mockReturnValue({ mutateAsync, isPending: false } as never);
  const onClose = vi.fn();
  const onConfirmed = vi.fn();
  render(<ConfirmLevelDialog run={run} open onClose={onClose} onConfirmed={onConfirmed} />);
  return { mutateAsync, onClose, onConfirmed };
}

describe('ConfirmLevelDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('requires a review note', async () => {
    const { mutateAsync } = setup();

    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận mức' }));

    expect(await screen.findByText('Nêu bằng chứng cho mức này')).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('submits the selected competency, level and note', async () => {
    const { mutateAsync, onClose, onConfirmed } = setup();

    fireEvent.change(screen.getByLabelText('Năng lực'), { target: { value: 'c3' } });
    fireEvent.change(screen.getByLabelText('Trình độ xác nhận'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Bằng chứng / ghi chú đánh giá'), { target: { value: 'Led the phishing drill' } });
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận mức' }));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        employeeId: 'emp-1',
        competencyId: 'c3',
        confirmedLevel: 2,
        reviewNote: 'Led the phishing drill',
      }),
    );
    expect(onConfirmed).toHaveBeenCalledWith('emp-1');
    expect(onClose).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalled();
  });

  it('shows the server message when confirming is not allowed', async () => {
    const forbidden = new AxiosError('Forbidden', '403', undefined, undefined, {
      status: 403,
      statusText: 'Forbidden',
      headers: {},
      config: { headers: new AxiosHeaders() },
      data: { success: false, message: 'You cannot confirm your own competency level.', data: null, errors: [] },
    });
    const { onClose } = setup(vi.fn().mockRejectedValue(forbidden));

    fireEvent.change(screen.getByLabelText('Bằng chứng / ghi chú đánh giá'), { target: { value: 'self review' } });
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận mức' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('You cannot confirm your own competency level.'));
    expect(onClose).not.toHaveBeenCalled();
  });
});
