import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { DomainPositionStandardPanel } from '../DomainPositionStandardPanel';
import type { CeilingDomain } from '@/services/capability-ceiling.service';

const { loadPositions } = vi.hoisted(() => ({ loadPositions: vi.fn() }));
vi.mock('@/hooks/use-job-positions', () => ({ useJobPositions: loadPositions }));
vi.mock('@/hooks/use-competencies', () => ({
  usePositionRequirements: () => ({}),
  useAllActiveCompetencies: () => ({ data: [] }),
  useCreateDraftPositionRequirements: () => ({}),
  useUpdateDraftPositionRequirements: () => ({}),
  useActivatePositionRequirements: () => ({}),
}));

afterEach(cleanup);

const domain = {
  categoryId: 'data',
  name: 'Dữ liệu',
  courses: [{ level: 1, courseId: 'basic', code: 'M1-F', title: 'Dữ liệu cơ bản' }],
} as CeilingDomain;

it('fixes the position to the department and keeps the level buttons without a position dropdown', () => {
  loadPositions.mockReturnValue({ data: { items: [
    { id: 'lead', name: 'Trưởng bộ phận', departmentId: 'dept' },
    { id: 'shared', name: 'Vị trí tham chiếu' },
  ] } });
  render(<DomainPositionStandardPanel domain={domain} domains={[domain]} departmentId="dept" canEdit />);

  expect(loadPositions).toHaveBeenCalledWith(expect.objectContaining({ departmentId: 'dept' }));
  expect(screen.getByText('Trưởng bộ phận')).toBeInTheDocument();
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Dữ liệu cơ bản/ })).toBeEnabled();
});

it('keeps the position dropdown in the company scope', () => {
  loadPositions.mockReturnValue({ data: { items: [{ id: 'lead', name: 'Trưởng bộ phận' }] } });
  render(<DomainPositionStandardPanel domain={domain} domains={[domain]} canEdit />);
  expect(screen.getByRole('combobox', { name: 'Chọn vị trí công việc' })).toBeInTheDocument();
});

it('lets a department edit its own standard despite an old assignment elsewhere', () => {
  loadPositions.mockReturnValue({ data: { items: [{ id: 'shared', name: 'Kế toán', departmentId: 'dept', usedByOtherDepartments: true }] } });
  render(<DomainPositionStandardPanel domain={domain} domains={[domain]} departmentId="dept" canEdit />);

  expect(screen.getByText('Kế toán')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Dữ liệu cơ bản/ })).toBeEnabled();
});
