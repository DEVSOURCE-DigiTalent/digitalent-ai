import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DomainMilestonePanel } from '../DomainMilestonePanel';
import type { CeilingDomain } from '@/services/capability-ceiling.service';

const save = vi.hoisted(() => vi.fn().mockResolvedValue(null));
vi.mock('@/hooks/use-capability-ceilings', () => ({ useUpdateCompetencyMilestones: () => ({ isPending: false, mutateAsync: save }) }));
afterEach(() => { cleanup(); save.mockClear(); });

const domain = (milestoneLevel: number): CeilingDomain => ({
  categoryId: 'data', code: 'TT02_D1', name: 'Khai thác dữ liệu', sortOrder: 1, organizationCeiling: 2, maxAllowedCeiling: 2,
  suggestedCeiling: 2, milestoneLevel,
  courses: [1, 2, 3].map((level) => ({ level, courseId: `c${level}`, code: `M1-${'FIA'[level - 1]}`, title: `Khóa ${level}`, isUnlocked: level < 3 })),
});

it('sets an organization-wide milestone, even on a course not bought yet, without picking a position', async () => {
  render(<DomainMilestonePanel domain={domain(0)} canEdit />);
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  expect(screen.getByText('Chưa đặt mốc')).toBeInTheDocument();
  // Unset milestone: the position reference suggests a level.
  expect(screen.getByRole('button', { name: /Trung cấp/ })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByText('Gợi ý theo vị trí')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /Nâng cao/ }));
  fireEvent.click(screen.getByRole('button', { name: /Lưu mốc/ }));
  await waitFor(() => expect(save).toHaveBeenCalledWith([{ categoryId: 'data', level: 3 }]));
});

it('shows the saved milestone and clears it with level 0', async () => {
  render(<DomainMilestonePanel domain={domain(3)} canEdit />);
  expect(screen.getByText('Mốc hiện tại: M1-A')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Đang áp dụng/ })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Bỏ mốc' }));
  await waitFor(() => expect(save).toHaveBeenCalledWith([{ categoryId: 'data', level: 0 }]));
});
